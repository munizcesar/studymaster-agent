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

// ── Wikipedia — fallback geral ────────────────────────────────────────────────
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

// ── LexML — Vade Mêcum Digital (Senado Federal) ───────────────────────────────
// Fonte oficial: https://www.lexml.gov.br — legislação federal brasileira em vigor
async function fetchLexML(query) {
  try {
    const cql = `(dc.title any "${query}" or dc.subject any "${query}") and tipoDocumento any "Lei Decreto-Lei Código Constituição Medida-Provisória"`;
    const url = `https://www.lexml.gov.br/busca/SRU?operation=searchRetrieve&version=1.1&query=${encodeURIComponent(cql)}&maximumRecords=5&recordSchema=dc`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'StudyMaster/1.0 (educational tool)' },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const xml = await res.text();

    const titles = [...xml.matchAll(/<dc:title>([^<]+)<\/dc:title>/g)].map((m) => m[1]);
    const descriptions = [...xml.matchAll(/<dc:description>([^<]+)<\/dc:description>/g)].map((m) => m[1]);
    const dates = [...xml.matchAll(/<dc:date>([^<]+)<\/dc:date>/g)].map((m) => m[1]);

    if (titles.length === 0) return null;

    let ctx = 'LEGISLAÇÃO VERIFICADA — LEXML/SENADO FEDERAL:\n';
    titles.slice(0, 5).forEach((title, i) => {
      ctx += `\n[${i + 1}] ${title}`;
      if (dates[i]) ctx += ` (${dates[i]})`;
      if (descriptions[i]) ctx += `\n    Ementa: ${descriptions[i]}`;
    });
    return ctx.slice(0, 2000);
  } catch {
    return null;
  }
}

// ── Contexto combinado por área ───────────────────────────────────────────────
async function fetchContext(area, mode, topic, subject, idioma) {
  const isPortugues = !idioma || idioma === 'pt-BR';
  const isDireito = area === 'Direito' || mode === 'concurso';
  const query = topic || subject || area || '';

  if (isDireito && query) {
    const lexml = await fetchLexML(query);
    if (lexml) return { text: lexml, source: 'LexML/Senado Federal (Vade Mêcum Digital)' };
  }

  if (query) {
    const lang = isPortugues ? 'pt' : (idioma === 'es' ? 'es' : 'en');
    const wiki = await fetchWikipediaContext(query, lang);
    if (wiki) return { text: wiki, source: 'Wikipedia' };
  }

  return null;
}

// ── Instruções anti-alucinação por área ──────────────────────────────────────
function getAreaSafetyInstruction(area, mode) {
  if (mode === 'concurso' || area === 'Direito') {
    return `PROTOCOLO VADE MÊCUM ATIVO:
• Use APENAS artigos, incisos e parágrafos confirmados no contexto legislativo fornecido (LexML/Senado Federal).
• Diplomas válidos: CF/88 (até EC 136/2023), CC/2002 (Lei 10.406), CP (DL 2.848/1940), CPC/2015 (Lei 13.105), CPP (DL 3.689/1941), CLT (DL 5.452/1943), Lei 8.112/90, Lei 8.666/93, Lei 14.133/21, Lei 9.784/99, Lei 12.527/11, Lei 13.709/18 (LGPD).
• Súmulas: cite SOMENTE com número e tribunal confirmados (STF, STJ, TST).
• Se NÃO tiver certeza absoluta do número do artigo → use o PRINCÍPIO JURÍDICO sem citar o número.
• Temas doutrinários divergentes → baseie-se em texto de lei, nunca em posição doutrinária.
• NUNCA invente: artigos fictícios, súmulas com números errados, leis inexistentes, ementas fabricadas.
• Gabarito deve ser defensável perante banca real de concurso.`;
  }
  if (mode === 'livre') {
    return 'As questões devem ser baseadas EXCLUSIVAMENTE no material de estudo fornecido pelo usuário. Não adicione informações externas.';
  }
  const areaMap = {
    'Saúde': 'Use apenas terminologia médica, protocolos clínicos, fármacos e síndromes reconhecidos pela CID e comunidade médica. Nunca invente nomes de medicamentos, exames ou procedimentos.',
    'Tecnologia': 'Use apenas linguagens, frameworks, comandos e protocolos documentados e existentes. Nunca invente funções, bibliotecas ou sintaxes.',
    'Exatas': 'Use apenas fórmulas, teoremas e constantes físicas/químicas verificados. Nunca invente resultados numéricos ou fórmulas incorretas.',
    'Humanas': 'Use apenas eventos históricos, datas, personagens e conceitos filosóficos/sociológicos reais e documentados. Nunca invente datas ou autores.',
    'Negócios': 'Use apenas conceitos de administração, contabilidade e finanças consolidados. Nunca invente siglas, normas contábeis ou índices econômicos fictícios.',
    'ENEM': 'Use apenas conteúdos da matriz de referência oficial do ENEM (INEP). Nunca invente dados fora do currículo.',
    'Concursos — Matérias Comuns': 'Cite apenas artigos e conceitos existentes. Para Português, use apenas regras da norma culta consagradas. Para Matemática, garanta que todos os cálculos e respostas estejam corretos.',
  };
  return areaMap[area] || 'Use apenas conhecimento factício consolidado e verificado. Nunca invente dados, nomes, leis ou conceitos.';
}

// ── FIX #1: Guarda de tamanho do prompt — evita estouro silencioso de contexto ─
// Modelos Flash suportam contexto grande, mas prompts > ~28.000 chars começam a
// degradar a qualidade da resposta. Truncamos o contextInfo e externalBlock se
// a soma ultrapassar esse limiar.
function guardPromptSize(contextInfo, externalBlock, systemText, maxChars = 28000) {
  const overhead = systemText.length + 2000; // espaço para regras + schema
  const available = maxChars - overhead;
  const combined = contextInfo + externalBlock;
  if (combined.length <= available) return { contextInfo, externalBlock };

  // Tenta preservar contextInfo e truncar apenas o bloco externo
  const spaceForExternal = available - contextInfo.length;
  if (spaceForExternal > 300 && externalBlock.length > 0) {
    return { contextInfo, externalBlock: externalBlock.slice(0, spaceForExternal) + '\n[contexto truncado]' };
  }
  // Se ainda assim não couber, trunca o próprio contextInfo
  return {
    contextInfo: contextInfo.slice(0, available - 200),
    externalBlock: '',
  };
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

      // ── Alternativas ─────────────────────────────────────────────────────────
      const numAlts = (questionType === 'vf') ? 2 : (parseInt(alternativas) === 4 ? 4 : 5);
      const altKeys = numAlts === 4 ? 'A, B, C, D' : 'A, B, C, D, E';
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

      // ── Banca ────────────────────────────────────────────────────────────────
      const bancaEfetiva = (bancaFoco && bancaFoco !== 'auto') ? bancaFoco : (banca || null);
      const bancaStyleMap = {
        'CEBRASPE':       'CEBRASPE/CESPE: assertivas curtas e diretas, estilo certo/errado, com pegadinhas sutis de interpretação. Uma única palavra muda o sentido.',
        'CESPE':          'CEBRASPE/CESPE: assertivas curtas e diretas, estilo certo/errado, com pegadinhas sutis de interpretação.',
        'CEBRASPE/CESPE': 'CEBRASPE/CESPE: assertivas curtas e diretas, estilo certo/errado, com pegadinhas sutis de interpretação.',
        'FCC':            'FCC: enunciados extensos e formais, questões literais baseadas em lei seca, doutrina e jurisprudência.',
        'VUNESP':         'VUNESP: linguagem clara e objetiva, foco em aplicação prática e casos concretos.',
        'FGV':            'FGV: enunciados elaborados com casos práticos, questões interdisciplinares e raciocínio aplicado.',
        'CESGRANRIO':     'CESGRANRIO: questões técnicas, frequentemente com tabelas, gráficos e contexto corporativo.',
        'IDECAN':         'IDECAN: questões objetivas, foco em lei e doutrina, linguagem direta.',
        'IBFC':           'IBFC: questões práticas e diretas, enunciados claros.',
        'AOCP':           'AOCP: questões regionais, foco em conteúdo programático específico.',
        'FEPESE':         'FEPESE: questões objetivas, usada principalmente em concursos do Sul do Brasil.',
      };
      const bancaStyle = bancaEfetiva
        ? (bancaStyleMap[bancaEfetiva] || `Banca ${bancaEfetiva}: siga o estilo típico dessa banca.`)
        : null;

      // ── Instrução de segurança por área ──────────────────────────────────────
      const areaSafetyInstruction = getAreaSafetyInstruction(area, mode);

      // ── Contexto externo (LexML para Direito/Concurso, Wikipedia para demais) ─
      let contextInfo = '';
      let externalContext = null;

      if (mode === 'concurso' && concurso) {
        contextInfo = `Concurso: ${concurso}.`;
        if (bancaEfetiva) contextInfo += ` Banca: ${bancaEfetiva}.`;
        if (editalText?.length > 0) {
          contextInfo += `\n\nConteúdo programático do edital:\n${editalText.slice(0, 3000)}`;
        }
        externalContext = await fetchContext(area, mode, topic, subject, idioma);
      } else if (mode === 'academic') {
        contextInfo = `Área: ${area}. Disciplina: ${subject}.${topic ? ` Tópico: ${topic}.` : ' (Matéria completa)'}`;
        externalContext = await fetchContext(area, mode, topic, subject, idioma);
      } else if (mode === 'livre' && freeText) {
        contextInfo = `Material de estudo fornecido pelo usuário:\n${freeText.slice(0, 4000)}`;
      } else {
        const fallback = topic || subject || area || '';
        contextInfo = `Tópico: ${fallback || 'Conhecimentos gerais'}.`;
        if (fallback) externalContext = await fetchContext(area, mode, fallback, subject, idioma);
      }

      // ── Bloco de contexto externo para o prompt ───────────────────────────────
      const contextSourceLabel = externalContext?.source || null;
      const rawExternalBlock = externalContext?.text
        ? `\n\nContexto verificado (${externalContext.source}) — use como base factual prioritária:\n"""\n${externalContext.text}\n"""`
        : '';

      // ── Instruções do prompt ──────────────────────────────────────────────────
      const langInstruction = isPortugues
        ? 'Escreva todas as questões, alternativas e explicações em português do Brasil.'
        : `Write all questions, options and explanations in ${idiomaLabel}. The entire response must be in ${idiomaLabel}.`;

      // FIX #5: bancaInstruction aparece APENAS no prompt, removida duplicação
      const bancaInstruction = bancaStyle ? `\n\nEstilo de banca obrigatório: ${bancaStyle}` : '';
      const sessionInstruction = `\nModo de sessão: ${sessionLabel}.`;
      const altInstruction = questionType === 'vf'
        ? 'Para questões V/F, use apenas 2 opções: A (Verdadeiro) e B (Falso).'
        : `Gere exatamente ${numAlts} alternativas por questão usando as chaves ${altKeys}.`;

      const isDireitoOuConcurso = area === 'Direito' || mode === 'concurso';

      // FIX #2: fonte nunca vazia — instrução mais específica para modo livre,
      // com exemplo concreto baseado no próprio material fornecido
      const fonteInstruction = isDireitoOuConcurso
        ? `Para cada questão, preencha o campo "fonte" com o artigo de lei, súmula ou decreto que fundamenta a questão.
Formato obrigatório: "Art. XX, NomeDaLei/Ano — Tema" ou "Súmula NNN, Tribunal — Tema".
Exemplos válidos: "Art. 37, caput, CF/88 — Princípios da Administração Pública" | "Súmula 331, TST — Terceirização" | "Art. 186, CC/2002 — Ato Ilícito".
${contextSourceLabel ? `Fonte consultada: ${contextSourceLabel}.` : ''}
NUNCA deixe vazio. NUNCA invente número de artigo ou súmula.`
        : mode === 'academic'
        ? 'Para cada questão, preencha o campo "fonte" com o conceito, teoria, lei ou autor de referência (ex: "Teoria de Piaget — Desenvolvimento Cognitivo", "Lei de Ohm — Física"). Nunca deixe vazio.'
        : `Para cada questão, preencha o campo "fonte" com o trecho ou conceito do material fornecido que embasou a questão.
Formato: "Material do usuário — [tema ou conceito central da questão]".
Exemplo: "Material do usuário — Ciclo de Krebs" ou "Material do usuário — Capítulo 3: Contratos".
NUNCA deixe o campo "fonte" vazio ou com string em branco.`;

      const exampleOptions = numAlts === 4
        ? `        { "key": "A", "text": "..." },\n        { "key": "B", "text": "..." },\n        { "key": "C", "text": "..." },\n        { "key": "D", "text": "..." }`
        : `        { "key": "A", "text": "..." },\n        { "key": "B", "text": "..." },\n        { "key": "C", "text": "..." },\n        { "key": "D", "text": "..." },\n        { "key": "E", "text": "..." }`;

      // ── SYSTEM INSTRUCTION ────────────────────────────────────────────────────
      const systemText = `Você é um examinador acadêmico rigoroso especializado em concursos públicos e ensino superior brasileiro.
Retorne APENAS JSON válido com a chave "questions".
${isPortugues ? 'Responda em português do Brasil.' : `Respond entirely in ${idiomaLabel}.`}

PRINCÍPIOS INEGOCIÁVEIS:
- Use APENAS conhecimento factício consolidado e verificado.
- NUNCA invente leis, artigos, números, nomes de medicamentos, comandos de TI, fórmulas ou qualquer dado.
- Em caso de dúvida sobre um detalhe específico, elabore a questão em torno do conceito geral sem o detalhe duvidoso.
- Cada gabarito deve ser inquestionável e defensável tecnicamente perante qualquer banca examinadora.
- O campo "fonte" de CADA questão deve ser preenchido — NUNCA retorne "fonte": "" ou "fonte": null.
- ${areaSafetyInstruction}`;

      // FIX #1: Guarda de tamanho — aplica após construir systemText
      const { contextInfo: safeContextInfo, externalBlock } = guardPromptSize(
        contextInfo,
        rawExternalBlock,
        systemText,
      );

      const prompt = `Você é um professor especialista em concursos públicos e ensino superior brasileiro.${bancaInstruction}${sessionInstruction}

Gere exatamente ${quantity} questões de ${typeLabel} sobre:
${safeContextInfo}${externalBlock}

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
      "fonte": "Base legal ou conceitual verificada — nunca deixe vazio (ex: Art. 5º, CF/88)"
    }
  ]
}

Regras obrigatórias:
1. ${altInstruction}
2. Questões tecnicamente corretas e sem ambiguidades.
3. Explicações didáticas e claras.
4. Distribua a alternativa correta entre A, B, C, D${numAlts === 5 ? ', E' : ''} — sem repetir a mesma letra mais de 2 vezes seguidas.
5. ${langInstruction}
6. ${fonteInstruction}
7. Nenhum texto fora do JSON.
8. NUNCA invente leis, artigos, conceitos, nomes ou dados que não existem na realidade.
9. Se não tiver certeza absoluta sobre um dado específico, elabore a questão sem citar esse dado.
10. Regra de segurança por área: ${areaSafetyInstruction}`;

      // ── Chamada Gemini ────────────────────────────────────────────────────────
      // gemini-2.0-* está deprecado (substituição oficial: gemini-2.5-flash).
      const geminiModel = 'gemini-2.5-flash';
      const maxTokens = quantity <= 10 ? 4096 : quantity <= 25 ? 6144 : 8192;

      // FIX #3: temperatura calibrada por modo de sessão
      // concurso/simulado → 0.30 (máximo rigor)
      // revisao → 0.25 (questões curtas e objetivas, menos variação)
      // normal → 0.40
      const temperature = sessionMode === 'concurso' ? 0.30
        : sessionMode === 'revisao' ? 0.25
        : 0.40;

      // FIX #4: retry automático em caso de 429 (rate limit)
      async function callGemini() {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              systemInstruction: { parts: [{ text: systemText }] },
              generationConfig: {
                temperature,
                maxOutputTokens: maxTokens,
                topP: 0.9,
                responseMimeType: 'application/json',
              },
            }),
          }
        );
        return res;
      }

      let geminiResponse = await callGemini();

      // Retry único após 1.5s se rate-limited
      if (geminiResponse.status === 429) {
        await new Promise((r) => setTimeout(r, 1500));
        geminiResponse = await callGemini();
      }

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

      // Modelos com raciocínio podem colocar o pensamento em parts[0] e o JSON em parts[1+].
      // Só ler parts[0] quebra a geração (parse falha ou objeto vazio).
      function extractJsonTextFromGeminiData(data) {
        const c0 = data?.candidates?.[0];
        if (c0?.finishReason === 'SAFETY' || c0?.finishReason === 'BLOCKLIST') {
          return null;
        }
        const parts = c0?.content?.parts;
        if (!Array.isArray(parts) || parts.length === 0) {
          return data?.promptFeedback?.blockReason ? null : '';
        }
        const withText = parts.filter((p) => p && typeof p.text === 'string' && p.text.trim());
        const nonThought = withText.filter((p) => !p.thought);
        const ordered = nonThought.length ? nonThought : withText;
        for (let i = ordered.length - 1; i >= 0; i--) {
          const t = String(ordered[i].text).trim();
          if (t.startsWith('{') || t.startsWith('[')) return t;
        }
        return String(ordered[ordered.length - 1]?.text || '').trim();
      }

      let rawText = extractJsonTextFromGeminiData(geminiData);
      if (rawText === null) {
        return new Response(JSON.stringify({
          error: 'Conteúdo bloqueado',
          userMessage: 'A IA não pôde gerar questões para este pedido (filtro de segurança). Tente reformular o tema ou reduzir trechos sensíveis.',
        }), { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (!rawText) rawText = '{}';

      // Alguns modelos ainda envolvem o JSON em ```json ... ``` apesar do MIME type
      function stripJsonFence(s) {
        let t = String(s || '').trim();
        if (t.startsWith('```')) {
          t = t.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
        }
        return t.trim();
      }
      rawText = stripJsonFence(rawText);

      // FIX #5: remove fallback regex frágil — responseMimeType:'application/json'
      // garante JSON válido; extractQuestions cobre array direto sem chave wrapper
      let questions = [];
      try {
        const parsed = JSON.parse(rawText);
        questions = extractQuestions(parsed);
      } catch {
        questions = [];
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
