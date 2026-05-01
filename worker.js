// StudyMaster AI Worker — Cloudflare Worker + Groq API
// Deploy: wrangler deploy
// Env var necessária: GROQ_API_KEY

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

// Modelos em ordem de preferência — fallback automático se o primeiro atingir limite
const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-70b-versatile',
];

function extractQuestions(parsed) {
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === 'object' && Array.isArray(parsed.questions)) return parsed.questions;
  if (parsed && typeof parsed === 'object' && Array.isArray(parsed.data)) return parsed.data;
  if (parsed && typeof parsed === 'object' && Array.isArray(parsed.result)) return parsed.result;
  for (const key of Object.keys(parsed || {})) {
    if (Array.isArray(parsed[key])) return parsed[key];
  }
  return [];
}

// Valida e descarta questões incompletas silenciosamente
function validateQuestions(questions) {
  return questions.filter((q) => {
    if (!q || typeof q !== 'object') return false;
    if (!q.statement || typeof q.statement !== 'string' || q.statement.trim().length < 10) return false;
    if (!Array.isArray(q.options) || q.options.length < 2) return false;
    if (!q.correctAnswer || typeof q.correctAnswer !== 'string') return false;
    const validKeys = q.options.map((o) => o?.key).filter(Boolean);
    if (!validKeys.includes(q.correctAnswer)) return false;
    // Garante campo fonte preenchido
    if (!q.fonte || String(q.fonte).trim().length === 0) {
      q.fonte = 'Conhecimento acadêmico consolidado';
    }
    return true;
  });
}

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

function getAreaSafetyInstruction(area, mode) {
  if (mode === 'concurso' || area === 'Direito') {
    return `PROTOCOLO VADE MÊCUM ATIVO:\n- Use APENAS artigos, incisos e parágrafos confirmados no contexto legislativo fornecido (LexML/Senado Federal).\n- Diplomas válidos: CF/88, CC/2002 (Lei 10.406), CP (DL 2.848/1940), CPC/2015 (Lei 13.105), CPP (DL 3.689/1941), CLT (DL 5.452/1943), Lei 8.112/90, Lei 8.666/93, Lei 14.133/21, Lei 9.784/99, Lei 12.527/11, Lei 13.709/18 (LGPD).\n- Súmulas: cite SOMENTE com número e tribunal confirmados (STF, STJ, TST).\n- Se NÃO tiver certeza absoluta do número do artigo, use o PRINCÍPIO JURÍDICO sem citar o número.\n- NUNCA invente artigos fictícios, súmulas com números errados, leis inexistentes ou ementas fabricadas.\n- Gabarito deve ser defensável perante banca real de concurso.`;
  }
  if (mode === 'livre') return 'As questões devem ser baseadas EXCLUSIVAMENTE no material de estudo fornecido pelo usuário. Não adicione informações externas.';
  const areaMap = {
    'Saúde': 'Use apenas terminologia médica, protocolos clínicos, fármacos e síndromes reconhecidos pela CID. Nunca invente nomes de medicamentos, exames ou procedimentos.',
    'Tecnologia': 'Use apenas linguagens, frameworks, comandos e protocolos documentados. Nunca invente funções, bibliotecas ou sintaxes.',
    'Exatas': 'Use apenas fórmulas, teoremas e constantes físicas/químicas verificados. Nunca invente resultados numéricos ou fórmulas incorretas.',
    'Humanas': 'Use apenas eventos históricos, datas, personagens e conceitos reais e documentados. Nunca invente datas ou autores.',
    'Negócios': 'Use apenas conceitos de administração, contabilidade e finanças consolidados. Nunca invente siglas, normas contábeis ou índices fictícios.',
    'ENEM': 'Use apenas conteúdos da matriz de referência oficial do ENEM (INEP). Nunca invente dados fora do currículo.',
    'Concursos — Matérias Comuns': 'Cite apenas artigos e conceitos existentes. Para Português, use regras da norma culta consagradas. Para Matemática, garanta cálculos e respostas corretos.',
  };
  return areaMap[area] || 'Use apenas conhecimento factício consolidado e verificado. Nunca invente dados, nomes, leis ou conceitos.';
}

function guardPromptSize(contextInfo, externalBlock, systemText, maxChars = 24000) {
  const overhead = systemText.length + 2000;
  const available = maxChars - overhead;
  const combined = contextInfo + externalBlock;
  if (combined.length <= available) return { contextInfo, externalBlock };
  const spaceForExternal = available - contextInfo.length;
  if (spaceForExternal > 300 && externalBlock.length > 0) {
    return { contextInfo, externalBlock: externalBlock.slice(0, spaceForExternal) + '\n[contexto truncado]' };
  }
  return { contextInfo: contextInfo.slice(0, available - 200), externalBlock: '' };
}

function extractJsonFromText(text) {
  let t = String(text || '').trim();
  if (t.startsWith('```')) {
    t = t.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
  }
  if (t.startsWith('{') || t.startsWith('[')) return t;
  const matchObj = t.match(/\{[\s\S]*\}/);
  if (matchObj) return matchObj[0];
  const matchArr = t.match(/\[[\s\S]*\]/);
  if (matchArr) return matchArr[0];
  return t;
}

export default {
  async fetch(request, env) {

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }
    if (!env.GROQ_API_KEY) {
      return new Response(JSON.stringify({
        error: 'Configuração incompleta',
        userMessage: 'A chave da API não está configurada no servidor. Configure GROQ_API_KEY nas variáveis do Worker.',
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

      const difficultyMap = {
        easy:    'fácil (nível iniciante, conceitos básicos)',
        medium:  'médio (nível intermediário, aplicação de conceitos)',
        hard:    'difícil (nível avançado, análise e interpretação)',
        extreme: 'extremo (nível especialista, questões de prova real de alto nível)',
      };
      const diffLabel = difficultyMap[difficulty] || 'médio';

      const numAlts = (questionType === 'vf') ? 2 : (parseInt(alternativas) === 4 ? 4 : 5);
      const altKeys = numAlts === 4 ? 'A, B, C, D' : 'A, B, C, D, E';
      const typeMap = {
        mc:  `múltipla escolha com ${numAlts} alternativas (${altKeys})`,
        vf:  'verdadeiro ou falso (A = Verdadeiro, B = Falso)',
        mix: `misto — alternando entre múltipla escolha com ${numAlts} alternativas (${altKeys}) e verdadeiro/falso`,
      };
      const typeLabel = typeMap[questionType] || typeMap.mc;

      const idiomaMap = { 'pt-BR': 'português do Brasil', 'en': 'English (American)', 'es': 'español (castellano)' };
      const idiomaLabel = idiomaMap[idioma] || 'português do Brasil';
      const isPortugues = !idioma || idioma === 'pt-BR';

      const sessionMap = {
        normal:   'Estudo Normal — questões didáticas com foco em aprendizado e fixação de conteúdo',
        concurso: 'Simulado — questões no estilo e rigor de prova real, sem dicas pedagógicas no enunciado',
        revisao:  'Revisão Rápida — questões curtas e objetivas para revisão veloz do conteúdo',
      };
      const sessionLabel = sessionMap[sessionMode] || sessionMap.normal;

      const bancaEfetiva = (bancaFoco && bancaFoco !== 'auto') ? bancaFoco : (banca || null);
      const bancaStyleMap = {
        'CEBRASPE':       'CEBRASPE/CESPE: assertivas curtas e diretas, estilo certo/errado, com pegadinhas sutis de interpretação.',
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
      const bancaStyle = bancaEfetiva ? (bancaStyleMap[bancaEfetiva] || `Banca ${bancaEfetiva}: siga o estilo típico dessa banca.`) : null;

      const areaSafetyInstruction = getAreaSafetyInstruction(area, mode);

      let contextInfo = '';
      let externalContext = null;

      if (mode === 'concurso' && concurso) {
        contextInfo = `Concurso: ${concurso}.`;
        if (bancaEfetiva) contextInfo += ` Banca: ${bancaEfetiva}.`;
        if (editalText?.length > 0) contextInfo += `\n\nConteúdo programático do edital:\n${editalText.slice(0, 3000)}`;
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

      const contextSourceLabel = externalContext?.source || null;
      const rawExternalBlock = externalContext?.text
        ? `\n\nContexto verificado (${externalContext.source}) — use como base factual prioritária:\n"""\n${externalContext.text}\n"""`
        : '';

      const langInstruction = isPortugues
        ? 'Escreva todas as questões, alternativas e explicações em português do Brasil.'
        : `Write all questions, options and explanations in ${idiomaLabel}. The entire response must be in ${idiomaLabel}.`;

      const bancaInstruction = bancaStyle ? `\n\nEstilo de banca obrigatório: ${bancaStyle}` : '';
      const sessionInstruction = `\nModo de sessão: ${sessionLabel}.`;
      const altInstruction = questionType === 'vf'
        ? 'Para questões V/F, use apenas 2 opções: A (Verdadeiro) e B (Falso).'
        : `Gere exatamente ${numAlts} alternativas por questão usando as chaves ${altKeys}.`;

      const isDireitoOuConcurso = area === 'Direito' || mode === 'concurso';
      const fonteInstruction = isDireitoOuConcurso
        ? `Para cada questão, preencha o campo "fonte" com o artigo de lei, súmula ou decreto que fundamenta a questão.\nFormato: "Art. XX, NomeDaLei/Ano — Tema" ou "Súmula NNN, Tribunal — Tema".\n${contextSourceLabel ? `Fonte consultada: ${contextSourceLabel}.` : ''}\nNUNCA deixe vazio. NUNCA invente número de artigo ou súmula.`
        : mode === 'academic'
        ? 'Para cada questão, preencha o campo "fonte" com o conceito, teoria ou autor de referência. Nunca deixe vazio.'
        : 'Para cada questão, preencha o campo "fonte" com o trecho ou conceito do material que embasou a questão. NUNCA deixe vazio.';

      const exampleOptions = numAlts === 4
        ? `        { "key": "A", "text": "..." },\n        { "key": "B", "text": "..." },\n        { "key": "C", "text": "..." },\n        { "key": "D", "text": "..." }`
        : `        { "key": "A", "text": "..." },\n        { "key": "B", "text": "..." },\n        { "key": "C", "text": "..." },\n        { "key": "D", "text": "..." },\n        { "key": "E", "text": "..." }`;

      const systemText = `Você é um examinador acadêmico especializado em concursos públicos e ensino superior brasileiro. Retorne APENAS JSON válido com a chave "questions", sem nenhum texto fora do JSON.\n${isPortugues ? 'Responda em português do Brasil.' : `Respond entirely in ${idiomaLabel}.`}\n\nPRINCÍPIOS INEGOCIÁVEIS:\n- Use APENAS conhecimento factício consolidado e verificado.\n- NUNCA invente leis, artigos, números, medicamentos, comandos, fórmulas ou qualquer dado.\n- Em caso de dúvida, elabore a questão em torno do conceito geral sem o detalhe duvidoso.\n- O campo "fonte" de CADA questão deve ser preenchido — NUNCA retorne "fonte": "" ou "fonte": null.\n- ${areaSafetyInstruction}`;

      const { contextInfo: safeContextInfo, externalBlock } = guardPromptSize(contextInfo, rawExternalBlock, systemText);

      const userPrompt = `Você é um professor especialista em concursos públicos e ensino superior brasileiro.${bancaInstruction}${sessionInstruction}\n\nGere exatamente ${quantity} questões de ${typeLabel} sobre:\n${safeContextInfo}${externalBlock}\n\nNível de dificuldade: ${diffLabel}.\n\nRetorne APENAS um objeto JSON com a chave "questions":\n{\n  "questions": [\n    {\n      "id": 1,\n      "statement": "Enunciado completo da questão.",\n      "options": [\n${exampleOptions}\n      ],\n      "correctAnswer": "A",\n      "explanation": "Explicação didática do gabarito.",\n      "fonte": "Base legal ou conceitual verificada"\n    }\n  ]\n}\n\nRegras obrigatórias:\n1. ${altInstruction}\n2. Questões tecnicamente corretas e sem ambiguidades.\n3. Explicações didáticas e claras.\n4. Distribua a alternativa correta entre A, B, C, D${numAlts === 5 ? ', E' : ''} — sem repetir a mesma letra mais de 2 vezes seguidas.\n5. ${langInstruction}\n6. ${fonteInstruction}\n7. NENHUM texto fora do JSON.\n8. NUNCA invente leis, artigos, conceitos ou dados que não existem.\n9. Regra de segurança por área: ${areaSafetyInstruction}`;

      const maxTokens = quantity <= 10 ? 4096 : quantity <= 25 ? 6144 : 8192;
      const temperature = sessionMode === 'concurso' ? 0.30 : sessionMode === 'revisao' ? 0.25 : 0.40;

      // Tenta cada modelo em ordem. Se 429/503, retry com backoff e depois tenta o próximo modelo.
      async function callGroqWithFallback() {
        const delays = [0, 2000, 4000];
        let lastRes = null;

        for (const model of GROQ_MODELS) {
          for (let i = 0; i < delays.length; i++) {
            if (delays[i] > 0) await new Promise((r) => setTimeout(r, delays[i]));
            lastRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${env.GROQ_API_KEY}`,
              },
              body: JSON.stringify({
                model,
                messages: [
                  { role: 'system', content: systemText },
                  { role: 'user',   content: userPrompt },
                ],
                temperature,
                max_tokens: maxTokens,
                response_format: { type: 'json_object' },
              }),
            });
            // Sucesso ou erro não-retriável neste modelo — para o loop de delays
            if (lastRes.ok || (lastRes.status !== 429 && lastRes.status !== 503)) break;
          }
          // Se foi bem-sucedido, retorna imediatamente
          if (lastRes.ok) return lastRes;
          // Se 401/403/400, não adianta tentar outro modelo
          if (lastRes.status === 401 || lastRes.status === 403 || lastRes.status === 400) return lastRes;
          // 429/503: tenta próximo modelo da lista
        }
        return lastRes;
      }

      const groqResponse = await callGroqWithFallback();

      if (!groqResponse.ok) {
        const err = await groqResponse.text();
        let userMessage = 'Erro ao conectar com a IA. Tente novamente em instantes.';
        if (groqResponse.status === 429) userMessage = 'Limite de uso da IA atingido. Aguarde alguns instantes e tente novamente.';
        else if (groqResponse.status === 503) userMessage = 'A IA está com alta demanda. Tente novamente em segundos.';
        else if (groqResponse.status === 401 || groqResponse.status === 403) userMessage = 'Chave da API inválida. Verifique GROQ_API_KEY nas configurações do Worker.';
        return new Response(JSON.stringify({ error: 'Groq API error', details: err, userMessage }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const groqData = await groqResponse.json();
      const rawText = extractJsonFromText(groqData?.choices?.[0]?.message?.content || '');

      let questions = [];
      try {
        const parsed = JSON.parse(rawText);
        questions = extractQuestions(parsed);
      } catch {
        const matchObj = rawText.match(/\{[\s\S]*\}/);
        if (matchObj) {
          try { questions = extractQuestions(JSON.parse(matchObj[0])); } catch { /* continua */ }
        }
        if (questions.length === 0) {
          const matchArr = rawText.match(/\[[\s\S]*\]/);
          if (matchArr) {
            try { questions = extractQuestions(JSON.parse(matchArr[0])); } catch { /* continua */ }
          }
        }
      }

      // Valida e descarta questões malformadas
      questions = validateQuestions(questions);

      if (questions.length === 0) {
        return new Response(JSON.stringify({
          error: 'Resposta vazia',
          rawText,
          userMessage: 'A IA não conseguiu gerar questões válidas. Tente ajustar o tópico ou o nível de dificuldade.',
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
