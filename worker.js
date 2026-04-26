// StudyMaster AI Worker — Cloudflare Worker + Gemini API
// Deploy: wrangler deploy
// Env var necessária: GEMINI_API_KEY

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

function extractQuestions(parsed) {
  if (Array.isArray(parsed)) return parsed;
  for (const key of Object.keys(parsed)) {
    if (Array.isArray(parsed[key])) return parsed[key];
  }
  return [];
}

// ── Wikipedia context fetch ────────────────────────────────────────────────────
async function fetchWikipediaContext(query, lang = 'pt') {
  try {
    const slug = encodeURIComponent(query.trim().replace(/\s+/g, '_'));
    const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${slug}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'StudyMaster/1.0 (educational tool)' },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.extract ? data.extract.slice(0, 1500) : null;
  } catch {
    return null;
  }
}

// ── Instruções anti-alucinação por área ───────────────────────────────────
function getAreaSafetyInstruction(area, mode, subject) {
  if (mode === 'concurso') {
    return 'Cite apenas artigos de lei, súmulas e decretos que realmente existem e estão em vigor. Nunca crie números de artigos, leis ou súmulas fictícios. Em caso de dúvida sobre um artigo específico, elabore a questão com base no princípio jurídico geral sem citar o número.';
  }
  if (mode === 'livre') {
    return 'As questões devem ser baseadas EXCLUSIVAMENTE no material de estudo fornecido pelo usuário. Não adicione informações externas que não estejam no texto.';
  }
  // Modo acadêmico — por área
  const areaMap = {
    'Direito': 'Cite apenas artigos, incisos e parágrafos que realmente existem na Constituição Federal, Código Civil, Código Penal e demais diplomas legais brasileiros. Nunca invente números de artigos ou leis fictícias. Em caso de dúvida sobre um artigo específico, baseie a questão no princípio jurídico sem citar o número.',
    'Saúde': 'Use apenas terminologia médica, protocolos clínicos, nomes de medicamentos, síndromes e doenças que realmente existem e são reconhecidos pela comunidade médica e CID. Nunca invente nomes de fármacos, exámes ou procedimentos.',
    'Tecnologia': 'Use apenas linguagens de programação, frameworks, protocolos, comandos, padrões e conceitos de TI que realmente existem e são documentados. Nunca invente nomes de funções, bibliotecas, comandos ou protocolos.',
    'Exatas': 'Use apenas fórmulas, teoremas, leis físicas e químicas matematicamente corretos e verificados. Nunca invente constantes, fórmulas ou resultados numéricos incorretos.',
    'Humanas': 'Use apenas eventos históricos, datas, personagens e conceitos filosóficos/sociológicos reais e documentados. Nunca invente datas, nomes de tratados ou autores fictícios.',
    'Negócios': 'Use apenas conceitos de administração, contabilidade, economia e finanças consolidados e reconhecidos. Nunca invente siglas, normas contábeis ou índices econômicos fictícios.',
    'ENEM': 'Use apenas conteúdos do currículo oficial do ENEM conforme a matriz de referência do INEP. Baseie-se em conhecimentos factícios consolidados e verificados.',
    'Concursos — Matérias Comuns': 'Cite apenas artigos de lei e conceitos que realmente existem. Para Português, use apenas regras gramaticais da norma culta brasileira consagradas. Para Matemática, garanta que todos os cálculos e respostas estejam matematicamente corretos antes de incluir a questão.',
  };
  return areaMap[area] || 'Use apenas conhecimento factício consolidado e verificado. Nunca invente dados, nomes, leis ou conceitos.';
}

export default {
  async fetch(request, env) {

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    if (!env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({
        error: 'Configuração incompleta',
        userMessage: 'A chave da API não está configurada no servidor. Configure GEMINI_API_KEY nas variáveis do Worker.',
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    try {
      const body = await request.json();
      const {
        topic, subject, area, mode,
        difficulty, quantity, questionType,
        concurso, banca, bancaFoco,
        freeText, editalText,
        alternativas, idioma, sessionMode,
      } = body;

      // ── Dificuldade ────────────────────────────────────────────────────────────
      const difficultyMap = {
        easy:    'fácil (nível iniciante, conceitos básicos)',
        medium:  'médio (nível intermediário, aplicação de conceitos)',
        hard:    'difícil (nível avançado, análise e interpretação)',
        extreme: 'extremo (nível especialista, questões de prova real de alto nível)',
      };
      const diffLabel = difficultyMap[difficulty] || 'médio';

      // ── Número de alternativas ─────────────────────────────────────────────────
      const numAlts = (questionType === 'vf') ? 2 : (parseInt(alternativas) === 4 ? 4 : 5);
      const altKeys  = numAlts === 4 ? 'A, B, C, D' : 'A, B, C, D, E';

      const typeMap = {
        mc:  `múltipla escolha com ${numAlts} alternativas (${altKeys})`,
        vf:  'verdadeiro ou falso (A = Verdadeiro, B = Falso)',
        mix: `misto — alternando entre múltipla escolha com ${numAlts} alternativas (${altKeys}) e verdadeiro/falso`,
      };
      const typeLabel = typeMap[questionType] || typeMap.mc;

      // ── Idioma ─────────────────────────────────────────────────────────────────
      const idiomaMap = {
        'pt-BR': 'português do Brasil',
        'en':    'English (American)',
        'es':    'español (castellano)',
      };
      const idiomaLabel = idiomaMap[idioma] || 'português do Brasil';
      const isPortugues = !idioma || idioma === 'pt-BR';

      // ── Modo de sessão ─────────────────────────────────────────────────────────
      const sessionMap = {
        normal:   'Estudo Normal — questões didáticas com foco em aprendizado e fixação de conteúdo',
        concurso: 'Simulado — questões no estilo e rigor de prova real, sem dicas pedagógicas no enunciado',
        revisao:  'Revisão Rápida — questões curtas e objetivas para revisão veloz do conteúdo',
      };
      const sessionLabel = sessionMap[sessionMode] || sessionMap.normal;

      // ── Banca efetiva ─────────────────────────────────────────────────────────
      const bancaEfetiva = (bancaFoco && bancaFoco !== 'auto') ? bancaFoco : (banca || null);

      const bancaStyleMap = {
        'CEBRASPE':       'CEBRASPE/CESPE: assertivas curtas e diretas, estilo certo/errado, com pegadinhas sutis de interpretação. Questões onde uma única palavra muda o sentido.',
        'CESPE':          'CEBRASPE/CESPE: assertivas curtas e diretas, estilo certo/errado, com pegadinhas sutis de interpretação.',
        'CEBRASPE/CESPE': 'CEBRASPE/CESPE: assertivas curtas e diretas, estilo certo/errado, com pegadinhas sutis de interpretação.',
        'FCC':            'FCC (Fundação Carlos Chagas): enunciados mais extensos e formais, questões literais baseadas em lei seca, doutrina e jurisprudência.',
        'VUNESP':         'VUNESP: linguagem clara e objetiva, questões bem estruturadas com foco em aplicação prática e casos concretos.',
        'FGV':            'FGV: enunciados elaborados com casos práticos, questões interdisciplinares, textos-base interpretativos e raciocínio aplicado.',
        'CESGRANRIO':     'CESGRANRIO: questões técnicas e bem elaboradas, frequentemente com tabelas, gráficos e contexto profissional/corporativo.',
        'IDECAN':         'IDECAN: questões objetivas com enunciados moderados, foco em lei e doutrina, linguagem direta.',
        'IBFC':           'IBFC: questões práticas e diretas, enunciados claros sem excesso de interpretação.',
        'AOCP':           'AOCP: questões regionais com foco em conteúdo programático específico, enunciados de extensão média.',
        'FEPESE':         'FEPESE: questões objetivas focadas em conceitos e aplicação, frequentemente usada em concursos do Sul do Brasil.',
      };
      const bancaStyle = bancaEfetiva
        ? (bancaStyleMap[bancaEfetiva] || `Banca ${bancaEfetiva}: siga o estilo típico dessa banca organizadora.`)
        : null;

      // ── Instrução de segurança por área ───────────────────────────────────────
      const areaSafetyInstruction = getAreaSafetyInstruction(area, mode, subject);

      // ── Contexto do conteúdo + Wikipedia ─────────────────────────────────────
      let contextInfo = '';
      let wikiContext = '';

      if (mode === 'concurso' && concurso) {
        contextInfo = `Concurso: ${concurso}.`;
        if (bancaEfetiva) contextInfo += ` Banca: ${bancaEfetiva}.`;
        if (editalText && editalText.length > 0) {
          contextInfo += `\n\nConteúdo programático do edital:\n${editalText.slice(0, 3000)}`;
        }
      } else if (mode === 'academic') {
        contextInfo = `Área: ${area}. Disciplina: ${subject}.${topic ? ` Tópico: ${topic}.` : ' (Matéria completa)'}`;
        const wikiQuery = topic || subject || area;
        const wikiLang  = isPortugues ? 'pt' : (idioma === 'es' ? 'es' : 'en');
        wikiContext = await fetchWikipediaContext(wikiQuery, wikiLang);
      } else if (mode === 'livre' && freeText) {
        contextInfo = `Material de estudo fornecido pelo usuário:\n${freeText.slice(0, 4000)}`;
      } else {
        const fallbackQuery = topic || subject || area || '';
        contextInfo = `Tópico: ${fallbackQuery || 'Conhecimentos gerais'}.`;
        if (fallbackQuery) {
          const wikiLang = isPortugues ? 'pt' : (idioma === 'es' ? 'es' : 'en');
          wikiContext = await fetchWikipediaContext(fallbackQuery, wikiLang);
        }
      }

      const wikiBlock = wikiContext
        ? `\n\nReferência Wikipedia (use como base factual, não reproduza literalmente):\n"""\n${wikiContext}\n"""`
        : '';

      // ── Instruções do prompt ──────────────────────────────────────────────────
      const langInstruction = isPortugues
        ? 'Escreva todas as questões, alternativas e explicações em português do Brasil.'
        : `Write all questions, options and explanations in ${idiomaLabel}. The entire response must be in ${idiomaLabel}.`;

      const bancaInstruction = bancaStyle
        ? `\n\nEstilo de banca obrigatório: ${bancaStyle}`
        : '';

      const sessionInstruction = `\nModo de sessão: ${sessionLabel}.`;

      const altInstruction = questionType === 'vf'
        ? 'Para questões V/F, use apenas 2 opções: A (Verdadeiro) e B (Falso).'
        : `Gere exatamente ${numAlts} alternativas por questão usando as chaves ${altKeys}.`;

      const fonteInstruction = mode === 'concurso'
        ? 'Para cada questão, preencha o campo "fonte" com o artigo de lei, súmula, decreto ou tema do edital que fundamenta a questão (ex: "Art. 37, CF/88", "Súmula 331 TST", "Lei 8.112/90, Art. 9º"). Nunca deixe vazio.'
        : mode === 'academic'
        ? 'Para cada questão, preencha o campo "fonte" com o conceito, teoria, lei ou autor de referência que fundamenta a questão (ex: "Teoria de Piaget — Desenvolvimento Cognitivo", "Lei de Ohm — Física", "Art. 5º, CF/88"). Nunca deixe vazio.'
        : 'Para cada questão, preencha o campo "fonte" com a base conceitual ou legal que fundamenta a resposta correta. Nunca deixe vazio.';

      const exampleOptions = numAlts === 4
        ? `        { "key": "A", "text": "..." },\n        { "key": "B", "text": "..." },\n        { "key": "C", "text": "..." },\n        { "key": "D", "text": "..." }`
        : `        { "key": "A", "text": "..." },\n        { "key": "B", "text": "..." },\n        { "key": "C", "text": "..." },\n        { "key": "D", "text": "..." },\n        { "key": "E", "text": "..." }`;

      const prompt = `Você é um professor especialista em concursos públicos e ensino superior brasileiro.${bancaInstruction}${sessionInstruction}

Gere exatamente ${quantity} questões de ${typeLabel} sobre:
${contextInfo}${wikiBlock}

Nível de dificuldade: ${diffLabel}.

Retorne APENAS um objeto JSON com a chave "questions":
{
  "questions": [
    {
      "id": 1,
      "statement": "Enunciado completo da questão.",
      "options": [
${exampleOptions}
      ],
      "correctAnswer": "A",
      "explanation": "Explicação didática do gabarito.",
      "fonte": "Base legal ou conceitual da questão (ex: Art. 5º, CF/88)"
    }
  ]
}

Regras obrigatórias:
1. ${altInstruction}
2. Questões tecnicamente corretas e sem ambiguidades.
3. Explicações didáticas e claras.
4. Varie a posição da alternativa correta entre as questões.
5. ${langInstruction}
6. ${fonteInstruction}
7. Nenhum texto fora do JSON.
8. NUNCA invente leis, artigos, conceitos, nomes ou dados que não existem na realidade.
9. Se não tiver certeza absoluta sobre um dado específico, elabore a questão sem citar esse dado.
10. Regra de segurança por área: ${areaSafetyInstruction}`;

      // ── System instruction reforçada ─────────────────────────────────────────────
      const systemText = `Você é um examinador acadêmico rigoroso especializado em concursos públicos e ensino superior brasileiro.
Retorne APENAS JSON válido com a chave "questions".
${isPortugues ? 'Responda em português do Brasil.' : `Respond entirely in ${idiomaLabel}.`}

PRINCÍPIOS INEGOCIÁVEIS:
- Use APENAS conhecimento factício consolidado e verificado.
- NUNCA invente leis, artigos, números, nomes de medicamentos, comandos de TI, fórmulas ou qualquer dado.
- Em caso de dúvida sobre um detalhe específico, elabore a questão em torno do conceito geral sem o detalhe duvidoso.
- Cada gabarito deve ser inquestionável e defensavél tecnicamente.
- ${areaSafetyInstruction}`;

      // ── Chamada Gemini ────────────────────────────────────────────────────────
      const geminiModel = 'gemini-2.0-flash';
      const maxTokens = quantity <= 10 ? 4096 : quantity <= 25 ? 6144 : 8192;
      const temperature = sessionMode === 'concurso' ? 0.3 : 0.4;

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: {
              parts: [{ text: systemText }],
            },
            generationConfig: {
              temperature,
              maxOutputTokens: maxTokens,
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (!geminiResponse.ok) {
        const err = await geminiResponse.text();
        let userMessage = 'Erro ao conectar com a IA. Tente novamente em instantes.';
        if (geminiResponse.status === 429) userMessage = 'Limite de uso da IA atingido. Aguarde alguns instantes e tente novamente.';
        else if (geminiResponse.status === 400) userMessage = 'Requisição inválida. Verifique as configurações e tente novamente.';
        else if (geminiResponse.status === 401 || geminiResponse.status === 403) userMessage = 'Chave da API inválida. Verifique o GEMINI_API_KEY nas configurações do Worker.';
        return new Response(JSON.stringify({ error: 'Gemini API error', details: err, userMessage }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const geminiData = await geminiResponse.json();
      const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

      let questions = [];
      try {
        const parsed = JSON.parse(rawText);
        questions = extractQuestions(parsed);
      } catch {
        const match = rawText.match(/\[.*\]/s);
        try { questions = match ? JSON.parse(match[0]) : []; } catch { questions = []; }
      }

      if (!Array.isArray(questions) || questions.length === 0) {
        return new Response(JSON.stringify({
          error: 'Resposta vazia',
          rawText,
          userMessage: 'A IA não conseguiu gerar questões para esse conteúdo. Tente ajustar o tópico ou o nível de dificuldade.',
        }), { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({ questions }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (err) {
      return new Response(JSON.stringify({
        error: err.message,
        userMessage: 'Ocorreu um erro inesperado. Tente novamente em instantes.',
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
