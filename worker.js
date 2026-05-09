// StudyMaster AI Worker — Cloudflare Worker + Groq API + Vectorize RAG
// Deploy: wrangler deploy
//
// FLUXO 3-STEP PARA CONCURSOS (RAG):
// 1. User selects: mode="concursos" + filter="portugues" (ou outra matéria)
// 2. Worker: valida filtro → busca contexto Vectorize → injeta no prompt
// 3. Model: gera questão formatada → validamos contra alucinação → retornamos

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

// ════════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO RAG PARA CONCURSOS (baixo acoplamento, expansível)
// ════════════════════════════════════════════════════════════════════════════
//
// TABELA DE MAPEAMENTO EXPLÍCITO: Filtro → Coleção Vectorize
// ────────────────────────────────────────────────────────────────────────────
// concursos.portugues                 → concursos_portugues
// concursos.direito_constitucional    → concursos_direito_constitucional
// concursos.direito_administrativo    → concursos_direito_administrativo
// concursos.raciocinio_logico         → concursos_rlm (raciocínio lógico-matemático)
// concursos.informatica               → concursos_informatica
// concursos.administracao_publica     → concursos_adm_publica
//
// FUTURO (Arquitetura preparada, não implementado):
// - area: "policial" | "tribunais" | "fiscal" | "administracao_geral" | ...
// - estilo: "certo_errado" | "multipla_escolha" | "discursiva" | ...
// ────────────────────────────────────────────────────────────────────────────

const CONCURSOS_CONFIG = {
  // Mapeamento EXPLÍCITO: filtro (chave) → Vectorize collection + metadados
  // Padrão de chave interna: "concursos.<materia>"
  filters: {
    'concursos.portugues': {
      label: 'Português',
      description: 'Gramática, regência verbal, semântica, interpretação de textos',
      vectorizeCollection: 'concursos_portugues',
      minContextLength: 200,
      forbiddenPatterns: [
        'banca\\s+\\w+',
        'prova\\s+de\\s+\\d{4}',
        'edital\\s+de',
        'concurso\\s+\\w+',
        'ano\\s+de\\s+\\d{4}',
      ],
      conceptualBases: 'Normas de concordância, regência, interpretação textual (NBR, literatura brasileira)',
    },
    'concursos.direito_constitucional': {
      label: 'Direito Constitucional',
      description: 'Constituição Federal/88, direitos fundamentais, poder judiciário, federalismo',
      vectorizeCollection: 'concursos_direito_constitucional',
      minContextLength: 300,
      forbiddenPatterns: [
        'STF\\s+entendeu',
        'julgado\\s+em\\s+\\d{4}',
        'acórdão\\s+nº?\\s*\\d+',
        'decisão\\s+recente',
        'prova\\s+de\\s+\\d{4}',
        'banca\\s+\\w+',
      ],
      conceptualBases: 'CF/88, Jurisprudência STF/STJ, Lei 9.784/99 (processo administrativo)',
    },
    'concursos.direito_administrativo': {
      label: 'Direito Administrativo',
      description: 'Administração pública, servidores públicos, licitações, atos administrativos',
      vectorizeCollection: 'concursos_direito_administrativo',
      minContextLength: 300,
      forbiddenPatterns: [
        'banca\\s+\\w+\\s+decidiu',
        'edital\\s+de\\s+\\d{4}',
        'prova\\s+(real|específica)',
        'ano\\s+de\\s+\\d{4}',
        'julgado\\s+em',
      ],
      conceptualBases: 'CF/88, Lei 8.112/90, Lei 8.666/93, Lei 9.784/99, Lei 14.133/21, Lei 12.527/11 (LAI)',
    },
    'concursos.raciocinio_logico': {
      label: 'Raciocínio Lógico',
      description: 'Lógica formal, combinatória, probabilidade, análise de argumentos',
      vectorizeCollection: 'concursos_rlm',
      minContextLength: 150,
      forbiddenPatterns: [
        'como\\s+foi\\s+comprovado',
        'universalmente\\s+aceito',
        'recentemente\\s+descoberto',
        'prova\\s+de\\s+\\d{4}',
        'banca\\s+\\w+',
      ],
      conceptualBases: 'Lógica clássica, Teoria dos conjuntos, Análise combinatória, Probabilidade',
    },
    'concursos.informatica': {
      label: 'Informática',
      description: 'Sistemas operacionais, redes, segurança da informação, protocolos, bancos de dados',
      vectorizeCollection: 'concursos_informatica',
      minContextLength: 250,
      forbiddenPatterns: [
        'última\\s+versão',
        'versão\\s+mais\\s+recente',
        'tecnologia\\s+do\\s+futuro',
        'versão\\s+\\d+\\.\\d+\\s+(lançada|publicada)',
        'prova\\s+de\\s+\\d{4}',
      ],
      conceptualBases: 'ISO/IEC 27001, RFC padrões, Documentação oficial (NIST, CIS)',
    },
    'concursos.administracao_publica': {
      label: 'Administração Pública',
      description: 'Gestão pública, planejamento estratégico, liderança, administração de recursos',
      vectorizeCollection: 'concursos_adm_publica',
      minContextLength: 300,
      forbiddenPatterns: [
        'banca\\s+\\w+\\s+decidiu',
        'edital\\s+de\\s+\\d{4}',
        'prova\\s+(real|específica|recente)',
        'ano\\s+de\\s+\\d{4}',
        'concurso\\s+\\w+',
      ],
      conceptualBases: 'CF/88, Lei 8.112/90 (regime jurídico), Lei 9.784/99, Lei 14.133/21 (nova lei de licitações)',
    },
  },

  // Mapeamento reverso: coleção → filtro (para debugging/logging)
  collectionToFilter: {
    'concursos_portugues': 'concursos.portugues',
    'concursos_direito_constitucional': 'concursos.direito_constitucional',
    'concursos_direito_administrativo': 'concursos.direito_administrativo',
    'concursos_rlm': 'concursos.raciocinio_logico',
    'concursos_informatica': 'concursos.informatica',
    'concursos_adm_publica': 'concursos.administracao_publica',
  },

  // Fallback gracioso quando contexto insuficiente ou filtro não mapeado
  fallbackMessage: 'Desculpe, ainda não temos base de dados suficiente para esta matéria. Tente novamente em breve!',
  invalidFilterMessage: (filter) => `O filtro "${filter}" não foi reconhecido. Escolha uma das matérias disponíveis: Português, Direito Constitucional, Direito Administrativo, Raciocínio Lógico, Informática ou Administração Pública.`,
};

const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama3-70b-8192',
  'llama3-8b-8192',
  'llama-3.1-8b-instant',
  'gemma2-9b-it',
];

const AREA_MAP_VECTORIZE = {
  'Direito': null,
  'constitucional': 'constitucional',
  'civil': 'civil',
  'penal': 'penal',
  'trabalhista': 'trabalhista',
  'administrativo': 'administrativo',
  'tributario': 'tributario',
};

// ════════════════════════════════════════════════════════════════════════════
// FUNÇÕES RAG PARA CONCURSOS (3-STEP FLOW)
// ════════════════════════════════════════════════════════════════════════════

/**
 * PASSO 1: Validar se filtro está mapeado na tabela CONCURSOS_CONFIG.filters
 * @param {string} filter - ex: "concursos.portugues", "concursos.direito_administrativo"
 * @returns {Object} { valid: bool, config: filterConfig || null, error: string || null }
 */
function validateConcursosFilter(filter) {
  const config = CONCURSOS_CONFIG.filters[filter];
  
  if (!config) {
    const availableFilters = Object.keys(CONCURSOS_CONFIG.filters).map(f => f.replace('concursos.', '')).join(', ');
    return {
      valid: false,
      config: null,
      error: `Filtro não mapeado: "${filter}". Opções disponíveis: ${availableFilters}`,
      userMessage: CONCURSOS_CONFIG.invalidFilterMessage(filter),
    };
  }

  return { valid: true, config };
}

/**
 * PASSO 2: Recuperar contexto do Vectorize
 * @param {Object} env - Environment com VECTORIZE binding
 * @param {string} collection - Nome da coleção (ex: "concursos_portugues")
 * @param {string} query - Texto para busca semântica
 * @param {number} minLength - Tamanho mínimo esperado
 * @returns {Promise<Object>} { context, sufficient, sources, length }
 */
async function fetchVectorizeContext(env, collection, query, minLength) {
  try {
    if (!env.VECTORIZE) {
      console.warn(`[RAG] Vectorize não configurado. Retornando contexto vazio.`);
      return { context: '', sufficient: false, sources: [], contextLength: 0 };
    }

    let embedding;
    try {
      if (!env.AI) {
        console.warn(`[RAG] CF AI não disponível. Retornando contexto vazio.`);
        return { context: '', sufficient: false, sources: [], contextLength: 0 };
      }
      const embeddingRes = await env.AI.run('@cf/baai/bge-m3', { text: [query.slice(0, 512)] });
      const vector = embeddingRes?.data?.[0];
      if (!vector || !Array.isArray(vector)) {
        console.warn(`[RAG] Embedding inválido. Retornando contexto vazio.`);
        return { context: '', sufficient: false, sources: [], contextLength: 0 };
      }
      embedding = vector;
    } catch (e) {
      console.warn(`[RAG] Erro ao gerar embedding: ${e.message}`);
      return { context: '', sufficient: false, sources: [], contextLength: 0 };
    }

    let results;
    try {
      results = await env.VECTORIZE.query(embedding, {
        namespace: collection,
        topK: 5,
        returnMetadata: 'all',
      });
    } catch (e) {
      console.warn(`[RAG] Erro ao buscar Vectorize: ${e.message}`);
      return { context: '', sufficient: false, sources: [], contextLength: 0 };
    }

    if (!results?.matches?.length) {
      return { context: '', sufficient: false, sources: [], contextLength: 0 };
    }

    const documents = results.matches
      .filter((m) => m.score >= 0.65)
      .slice(0, 3)
      .map((m) => ({
        text: m.metadata?.text || m.text || '',
        source: m.metadata?.source || 'Acervo de Concursos',
        score: m.score,
      }))
      .filter((d) => d.text.trim().length > 0);

    if (documents.length === 0) {
      return { context: '', sufficient: false, sources: [], contextLength: 0 };
    }

    const context = documents.map((d) => d.text).join('\n\n');
    const sufficient = context.length >= minLength;

    return {
      context,
      sufficient,
      sources: documents.map((d) => ({ text: d.text.slice(0, 100), source: d.source })),
      contextLength: context.length,
    };
  } catch (e) {
    console.error(`[RAG] Erro geral em fetchVectorizeContext: ${e.message}`);
    return { context: '', sufficient: false, sources: [], contextLength: 0 };
  }
}

/**
 * PASSO 3: Validar saída contra alucinação
 */
function validateAgainstHallucination(question, subjectConfig) {
  const errors = [];

  if (!question.statement || question.statement.trim().length < 20) {
    errors.push('statement: enunciado ausente ou muito curto');
  }
  if (!Array.isArray(question.options) || question.options.length < 4) {
    errors.push('options: deve ter 4-5 alternativas');
  }
  if (!question.correctAnswer || !['A', 'B', 'C', 'D', 'E'].includes(question.correctAnswer)) {
    errors.push('correctAnswer: deve ser A-E');
  }
  if (!question.explanation || question.explanation.trim().length < 30) {
    errors.push('explanation: explicação ausente ou muito curta');
  }

  const forbiddenPatterns = subjectConfig.forbiddenPatterns || [];
  const fullText = [question.statement, question.explanation, ...(question.options || []).map((o) => o.text || '')].join(' ').toLowerCase();

  const detectedPatterns = forbiddenPatterns.filter((pattern) => {
    try {
      const regex = new RegExp(pattern.toLowerCase(), 'i');
      return regex.test(fullText);
    } catch {
      return false;
    }
  });

  if (detectedPatterns.length > 0) {
    let corrected = { ...question };
    let cleanedStatement = corrected.statement;
    let cleanedExplanation = corrected.explanation;

    detectedPatterns.forEach((pattern) => {
      try {
        const regex = new RegExp(pattern, 'gi');
        cleanedStatement = cleanedStatement.replace(regex, '[informação removida]');
        cleanedExplanation = cleanedExplanation.replace(regex, '[informação removida]');
      } catch {
        // Ignorar padrões inválidos
      }
    });

    corrected.statement = cleanedStatement;
    corrected.explanation = cleanedExplanation;

    return {
      valid: true,
      errors: [],
      corrected,
      hallucinations: detectedPatterns,
      warning: `Padrões alucinatórios detectados e removidos: ${detectedPatterns.join(', ')}`,
    };
  }

  if (errors.length > 0) {
    return { valid: false, errors, corrected: null };
  }

  return { valid: true, errors: [], corrected: question };
}

function detectarSubareaJuridica(topic, subject) {
  const texto = `${topic || ''} ${subject || ''}`.toLowerCase();
  if (/constitui|cf.?88|mandado|habeas|direito fundamental|controle de constitucional/i.test(texto)) return 'constitucional';
  if (/penal|crime|delito|pena|prescrição penal|cpp|processo penal|tipicidade|culpabilidade/i.test(texto)) return 'penal';
  if (/trabalhista|clt|empregado|empregador|rescisão|fgts|aviso prévio|jornada|salário/i.test(texto)) return 'trabalhista';
  if (/administrativo|improbidade|licitação|concurso público|servidor|lei 8\.112|lei 9\.784|lei 14\.133|lei 8\.666/i.test(texto)) return 'administrativo';
  if (/tribut|imposto|taxa|contribuição|ctn|icms|iss|ir|iptu|itbi|decadência fiscal|prescrição tributária/i.test(texto)) return 'tributario';
  if (/civil|cc.?2002|contrato|responsabilidade civil|prescrição civil|família|herança|posse|propriedade|cpc/i.test(texto)) return 'civil';
  return null;
}

async function fetchVademecumRAG(query, subarea, env) {
  if (!env.AI || !env.KNOWLEDGE_INDEX) return null;
  try {
    const embeddingRes = await env.AI.run('@cf/baai/bge-m3', { text: [query.slice(0, 512)] });
    const vector = embeddingRes?.data?.[0];
    if (!vector || !Array.isArray(vector)) return null;
    const queryOptions = { topK: 8, returnMetadata: 'all' };
    if (subarea) queryOptions.filter = { area: { $eq: subarea } };
    const results = await env.KNOWLEDGE_INDEX.query(vector, queryOptions);
    if (!results?.matches?.length) return null;
    const artigosRelevantes = results.matches
      .filter((m) => m.score >= 0.70)
      .slice(0, 8)
      .map((m) => m.metadata?.text || '')
      .filter(Boolean);
    if (artigosRelevantes.length === 0) return null;
    return {
      text: artigosRelevantes.join('\n\n'),
      source: 'Vade Mecum Digital — Planalto.gov.br (Vectorize RAG)',
      artigos: artigosRelevantes.length,
    };
  } catch { return null; }
}

async function fetchLexML(query) {
  try {
    const cql = `(dc.title any "${query}" or dc.subject any "${query}") and tipoDocumento any "Lei Decreto-Lei Código Constituição Medida-Provisória"`;
    const url = `https://www.lexml.gov.br/busca/SRU?operation=searchRetrieve&version=1.1&query=${encodeURIComponent(cql)}&maximumRecords=5&recordSchema=dc`;
    const res = await fetch(url, { headers: { 'User-Agent': 'StudyMaster/1.0' }, signal: AbortSignal.timeout(5000) });
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
  } catch { return null; }
}

async function fetchWikipediaContext(query, lang = 'pt') {
  try {
    const slug = encodeURIComponent(query.trim().replace(/\s+/g, '_'));
    const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${slug}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'StudyMaster/1.0' }, signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.extract ? data.extract.slice(0, 1500) : null;
  } catch { return null; }
}

async function fetchContext(area, mode, topic, subject, idioma, env) {
  const isPortugues = !idioma || idioma === 'pt-BR';
  const isDireito = area === 'Direito' || mode === 'concurso';
  const query = topic || subject || area || '';
  if (isDireito && query) {
    const subarea = detectarSubareaJuridica(topic, subject);
    const rag = await fetchVademecumRAG(query, subarea, env);
    if (rag) return { text: rag.text, source: rag.source };
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

function validateQuestions(questions) {
  return questions.filter((q) => {
    if (!q || typeof q !== 'object') return false;
    if (!q.statement || typeof q.statement !== 'string' || q.statement.trim().length < 10) return false;
    if (!Array.isArray(q.options) || q.options.length < 2) return false;
    if (!q.correctAnswer || typeof q.correctAnswer !== 'string') return false;
    const validKeys = q.options.map((o) => o?.key).filter(Boolean);
    if (!validKeys.includes(q.correctAnswer)) return false;
    if (!q.fonte || String(q.fonte).trim().length === 0) q.fonte = 'Conhecimento acadêmico consolidado';
    return true;
  });
}

function getAreaSafetyInstruction(area, mode) {
  if (mode === 'concurso' || area === 'Direito') {
    return `PROTOCOLO VADE MÊCUM ATIVO:\n- Use APENAS artigos, incisos e parágrafos confirmados no contexto legislativo fornecido.\n- Diplomas válidos: CF/88, CC/2002, CP, CPC/2015, CPP, CLT, Lei 8.112/90, Lei 8.666/93, Lei 14.133/21, Lei 9.784/99, Lei 12.527/11, Lei 13.709/18 (LGPD).\n- Súmulas: cite SOMENTE com número e tribunal confirmados (STF, STJ, TST).\n- NUNCA invente artigos fictícios, súmulas com números errados ou leis inexistentes.`;
  }
  if (mode === 'livre') return 'As questões devem ser baseadas EXCLUSIVAMENTE no material de estudo fornecido pelo usuário.';
  const areaMap = {
    'Saúde': 'Use apenas terminologia médica, protocolos clínicos, fármacos e síndromes reconhecidos pela CID.',
    'Tecnologia': 'Use apenas linguagens, frameworks, comandos e protocolos documentados.',
    'Exatas': 'Use apenas fórmulas, teoremas e constantes físicas/químicas verificados.',
    'Humanas': 'Use apenas eventos históricos, datas, personagens e conceitos reais e documentados.',
    'Negócios': 'Use apenas conceitos de administração, contabilidade e finanças consolidados.',
    'ENEM': 'Use apenas conteúdos da matriz de referência oficial do ENEM (INEP).',
    'Concursos — Matérias Comuns': 'Cite apenas artigos e conceitos existentes.',
  };
  return areaMap[area] || 'Use apenas conhecimento factício consolidado e verificado.';
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
  if (t.startsWith('```')) t = t.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
  if (t.startsWith('{') || t.startsWith('[')) return t;
  const matchObj = t.match(/\{[\s\S]*\}/);
  if (matchObj) return matchObj[0];
  const matchArr = t.match(/\[[\s\S]*\]/);
  if (matchArr) return matchArr[0];
  return t;
}

// ─── YouTube Transcript via timedtext (sem chave de API) ──────────────────────

function extractYouTubeVideoId(url) {
  try {
    const u = new URL(url.trim());
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('/')[0] || null;
    const v = u.searchParams.get('v');
    if (v) return v;
    const parts = u.pathname.split('/');
    const idx = parts.findIndex(p => ['embed', 'shorts', 'live'].includes(p));
    if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];
  } catch { /* URL inválida */ }
  return null;
}

async function fetchYouTubeTranscript(videoId) {
  const MAX_TRANSCRIPT_CHARS = 30000;
  const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

  const pageUrl = `https://www.youtube.com/watch?v=${videoId}`;
  let pageHtml;
  try {
    const pageRes = await fetch(pageUrl, {
      headers: { 'User-Agent': UA, 'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8' },
      signal: AbortSignal.timeout(10000),
    });
    if (!pageRes.ok) throw new Error(`YouTube retornou HTTP ${pageRes.status}`);
    pageHtml = await pageRes.text();
  } catch (e) {
    throw new Error(`Não foi possível acessar o vídeo: ${e.message}`);
  }

  const match = pageHtml.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});(?:\s*var\s|\s*<\/script)/s);
  if (!match) throw new Error('Não foi possível extrair dados do vídeo. O vídeo pode ser privado ou com restrição de idade.');

  let playerResponse;
  try {
    playerResponse = JSON.parse(match[1]);
  } catch {
    throw new Error('Erro ao processar dados do vídeo.');
  }

  const status = playerResponse?.playabilityStatus?.status;
  if (status && status !== 'OK') {
    const reason = playerResponse?.playabilityStatus?.reason || status;
    throw new Error(`Vídeo não disponível: ${reason}`);
  }

  const captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
  if (captionTracks.length === 0) {
    throw new Error('Este vídeo não possui legendas ou transcrição disponível. Tente um vídeo com legendas ativadas.');
  }

  const priority = ['pt-BR', 'pt', 'en'];
  let chosen = null;
  for (const lang of priority) {
    chosen = captionTracks.find(t => t.languageCode === lang) || null;
    if (chosen) break;
  }
  if (!chosen) chosen = captionTracks[0];

  const baseUrl = chosen?.baseUrl;
  if (!baseUrl) throw new Error('URL da legenda inválida.');

  const transcriptUrl = `${baseUrl}&fmt=json3`;
  let transcriptData;
  try {
    const tRes = await fetch(transcriptUrl, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(8000),
    });
    if (!tRes.ok) throw new Error(`HTTP ${tRes.status}`);
    transcriptData = await tRes.json();
  } catch (e) {
    throw new Error(`Falha ao baixar transcrição: ${e.message}`);
  }

  const events = transcriptData?.events || [];
  const segments = events
    .flatMap(e => e?.segs || [])
    .map(s => (s?.utf8 || '').replace(/\n/g, ' ').trim())
    .filter(s => s && s !== ' ');

  const deduped = segments.filter((s, i) => i === 0 || s !== segments[i - 1]);

  if (!deduped.length) {
    throw new Error('A transcrição do vídeo está vazia. Tente um vídeo diferente.');
  }

  let text = deduped.join(' ').replace(/\s{2,}/g, ' ').trim();
  const wasTruncated = text.length > MAX_TRANSCRIPT_CHARS;
  if (wasTruncated) text = text.slice(0, MAX_TRANSCRIPT_CHARS);

  return {
    text,
    videoId,
    lang: chosen.languageCode || 'desconhecido',
    isAuto: chosen.kind === 'asr',
    truncated: wasTruncated,
    charCount: text.length,
    source: 'youtube.com (timedtext)',
  };
}

// ════════════════════════════════════════════════════════════════════════════
// ORQUESTRADOR RAG PARA CONCURSOS (3-STEP PIPELINE)
// ════════════════════════════════════════════════════════════════════════════

async function generateConcursosRAGQuestion(body, env) {
  const { filter, quantity = 1, difficulty, questionType, alternativas, idioma, sessionMode } = body;

  console.log('[RAG] FILTER RAW:', JSON.stringify(filter));

  let filterKey = filter;
  let content = {}, exam = {}, examMetadata = {}, history = {};

  if (typeof filter === 'object' && filter !== null) {
    content = filter.content || {};
    exam = filter.exam || {};
    examMetadata = filter.examMetadata || {};
    history = filter.history || {};
    filterKey = content.discipline ? `concursos.${content.discipline}` : filterKey;
  }

  console.log('[RAG] FILTER KEY:', filterKey);

  const filterValidation = validateConcursosFilter(filterKey);
  if (!filterValidation.valid) {
    return {
      success: false,
      error: filterValidation.error,
      userMessage: filterValidation.userMessage || CONCURSOS_CONFIG.fallbackMessage,
      statusCode: 400,
    };
  }

  const subjectConfig = filterValidation.config;
  console.log(`[RAG] ✓ Filtro válido: ${filterKey} → ${subjectConfig.vectorizeCollection}`);

  const contextParts = [];
  if (content.topic) contextParts.push(`Tópico: ${content.topic}`);
  if (content.subtopic) contextParts.push(`Subtópico: ${content.subtopic}`);
  if (content.keyword) contextParts.push(`Palavra-chave: ${content.keyword}`);
  if (exam.examBoard) contextParts.push(`Banca: ${exam.examBoard}`);
  if (exam.agency) contextParts.push(`Órgão: ${exam.agency}`);
  if (exam.position) contextParts.push(`Cargo: ${exam.position}`);
  if (exam.educationLevel) contextParts.push(`Escolaridade: ${exam.educationLevel}`);
  if (examMetadata.yearFrom || examMetadata.yearTo) {
    contextParts.push(`Ano: ${examMetadata.yearFrom || '...'} a ${examMetadata.yearTo || '...'}`);
  }

  const queryContext = contextParts.join(', ');
  if (queryContext) {
    console.log(`[RAG] Query Context Montada: ${queryContext}`);
  }

  const query = queryContext ? `${filterKey} ${queryContext}` : filterKey;
  const contextResult = await fetchVectorizeContext(
    env,
    subjectConfig.vectorizeCollection,
    query,
    subjectConfig.minContextLength
  );

  console.log(
    `[RAG] Contexto: ${contextResult.contextLength} chars, ` +
    `Suficiente: ${contextResult.sufficient}`
  );

  const difficultyMap = {
    easy: 'fácil (nível iniciante, conceitos básicos)',
    medium: 'médio (nível intermediário, aplicação de conceitos)',
    hard: 'difícil (nível avançado, análise e interpretação)',
    extreme: 'extremo (nível especialista, questões de prova real)',
  };
  const diffLabel = difficultyMap[difficulty] || 'médio';

  const numAlts = parseInt(alternativas) === 4 ? 4 : 5;
  const altKeys = numAlts === 4 ? 'A, B, C, D' : 'A, B, C, D, E';

  const sessionMap = {
    normal: 'Estudo Normal — questões didáticas',
    concurso: 'Simulado — questões no estilo de prova real, sem dicas pedagógicas',
    revisao: 'Revisão Rápida — questões curtas e objetivas',
  };
  const sessionLabel = sessionMap[sessionMode] || sessionMap.normal;

  const contextBlock = contextResult.sufficient
    ? `CONTEXTO VERIFICADO (${subjectConfig.label}):\n"""\n${contextResult.context}\n"""\n\n`
    : '';

  const antiHallucinationRules = `
RESTRIÇÕES OBRIGATÓRIAS:
- NÃO invente banca, concurso, prova ou ano
- NÃO invente artigos de lei ou números de súmulas
- Use APENAS conceitos e contexto fornecido
- Cite apenas referências normativas válidas: ${subjectConfig.conceptualBases}
- Campo "fonte" deve ser preenchido com base legal/conceitual verificada`;

  const systemText = `Você é um examinador acadêmico especializado em concursos públicos. Retorne APENAS JSON válido com a chave "questions".
Responda em português do Brasil.

PRINCÍPIOS INEGOCIÁVEIS:
- Use APENAS conhecimento factício consolidado
- ${antiHallucinationRules}`;

  const exampleOptions =
    numAlts === 4
      ? `        { "key": "A", "text": "..." },\n        { "key": "B", "text": "..." },\n        { "key": "C", "text": "..." },\n        { "key": "D", "text": "..." }`
      : `        { "key": "A", "text": "..." },\n        { "key": "B", "text": "..." },\n        { "key": "C", "text": "..." },\n        { "key": "D", "text": "..." },\n        { "key": "E", "text": "..." }`;

  const userPrompt = `Modo: ${sessionLabel}

Gere exatamente ${quantity} questão(ões) de ${subjectConfig.label} no nível ${diffLabel}.
Contexto específico solicitado: ${queryContext || 'Nenhum específico.'}

${contextBlock}

Tema: ${subjectConfig.label}
Conceitos base: ${subjectConfig.conceptualBases}

Retorne APENAS um objeto JSON:
{
  "questions": [
    {
      "id": 1,
      "statement": "Enunciado da questão.",
      "options": [
${exampleOptions}
      ],
      "correctAnswer": "A",
      "explanation": "Explicação didática e verificável.",
      "fonte": "Base legal ou conceitual"
    }
  ]
}

Regras obrigatórias:
1. Gere exatamente ${numAlts} alternativas usando ${altKeys}
2. Questões corretas, sem ambiguidades
3. Distribua gabarito entre as opções
4. ${antiHallucinationRules}
5. NENHUM texto fora do JSON`;

  const groqResponse = await callGroqWithFallback(systemText, userPrompt, env, quantity);

  if (!groqResponse.ok) {
    const err = await groqResponse.text();
    let userMessage = 'Erro ao conectar com a IA. Tente novamente.';
    if (groqResponse.status === 429) userMessage = 'Limite de uso atingido. Aguarde.';
    else if (groqResponse.status === 503) userMessage = 'IA com alta demanda. Tente em segundos.';

    return {
      success: false,
      error: 'Groq API error',
      details: err,
      userMessage,
      statusCode: groqResponse.status,
    };
  }

  const groqData = await groqResponse.json();
  const rawText = extractJsonFromText(groqData?.choices?.[0]?.message?.content || '');

  let questions = [];
  try {
    questions = extractQuestions(JSON.parse(rawText));
  } catch {
    const matchObj = rawText.match(/\{[\s\S]*\}/);
    if (matchObj) {
      try {
        questions = extractQuestions(JSON.parse(matchObj[0]));
      } catch {
        // continua
      }
    }
  }

  if (questions.length === 0) {
    return {
      success: false,
      error: 'Nenhuma questão gerada',
      userMessage: 'A IA não gerou questões válidas. Tente ajustar filtro ou dificuldade.',
      statusCode: 422,
    };
  }

  const validatedQuestions = [];
  for (const q of questions) {
    const validation = validateAgainstHallucination(q, subjectConfig);

    if (!validation.valid) {
      console.warn(`[RAG] Validação falhou para questão ${q.id}:`, validation.errors);
      continue;
    }

    const finalQuestion = validation.corrected;
    if (validation.warning) {
      console.warn(`[RAG] Aviso:`, validation.warning);
    }

    validatedQuestions.push({
      id: finalQuestion.id,
      statement: finalQuestion.statement,
      options: finalQuestion.options,
      correctAnswer: finalQuestion.correctAnswer,
      explanation: finalQuestion.explanation,
      fonte: finalQuestion.fonte || subjectConfig.conceptualBases,
    });
  }

  if (validatedQuestions.length === 0) {
    return {
      success: false,
      error: 'Nenhuma questão passou na validação',
      userMessage: 'Questões geradas não passaram na validação. Tente novamente.',
      statusCode: 422,
    };
  }

  console.log(`[RAG] ✓ ${validatedQuestions.length} questão(ões) gerada(s) e validada(s)`);

  return {
    success: true,
    questions: validatedQuestions,
    metadata: {
      mode: 'rag',
      subject: subjectConfig.label,
      vectorizeCollection: subjectConfig.vectorizeCollection,
      contextLength: contextResult.contextLength,
      contextSufficient: contextResult.sufficient,
      sources: contextResult.sources,
      ragScore: contextResult.sufficient ? 0.95 : 0.65,
    },
    statusCode: 200,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// FUNÇÃO AUXILIAR: Chamar Groq com retry/fallback
// ════════════════════════════════════════════════════════════════════════════
async function callGroqWithFallback(systemText, userPrompt, env, quantity) {
  const temperature = 0.35;
  const maxTokens = quantity <= 5 ? 2048 : quantity <= 10 ? 4096 : 6144;

  const delays = [0, 2000, 4000];
  let lastRes = null;

  for (const model of GROQ_MODELS) {
    for (let i = 0; i < delays.length; i++) {
      if (delays[i] > 0) await new Promise((r) => setTimeout(r, delays[i]));

      lastRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.GROQ_API_KEY}` },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemText },
            { role: 'user', content: userPrompt },
          ],
          temperature,
          max_tokens: maxTokens,
          response_format: { type: 'json_object' },
        }),
      });

      if (lastRes.ok || (lastRes.status !== 429 && lastRes.status !== 503)) break;
    }

    if (lastRes.ok) return lastRes;
    if (lastRes.status === 401 || lastRes.status === 403) return lastRes;
    if (lastRes.status === 400) {
      const errText = await lastRes.clone().text();
      if (!errText.includes('decommissioned')) return lastRes;
      continue;
    }
  }

  return lastRes;
}

// ─── Main fetch handler ────────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders });

    const url = new URL(request.url);

    // ── Rota: /youtube-transcript ──────────────────────────────────────────────
    if (url.pathname === '/youtube-transcript' || url.pathname.endsWith('/youtube-transcript')) {
      try {
        const body = await request.json();
        const { youtubeUrl } = body;
        if (!youtubeUrl || typeof youtubeUrl !== 'string') {
          return new Response(JSON.stringify({ error: 'Campo youtubeUrl ausente ou inválido.' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        const videoId = extractYouTubeVideoId(youtubeUrl);
        if (!videoId) {
          return new Response(JSON.stringify({ error: 'URL do YouTube inválida.' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        const result = await fetchYouTubeTranscript(videoId);
        return new Response(JSON.stringify(result), {
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err) {
        const isBlocked = err.message.includes('HTTP 429') || err.message.includes('bloqueou a extração');
        return new Response(JSON.stringify({
          error: isBlocked
            ? 'O YouTube bloqueou a extração automática. Por favor, copie a transcrição manualmente.'
            : err.message || 'Erro ao extrair transcrição.',
          isBlocked,
        }), {
          status: isBlocked ? 429 : 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (!env.GROQ_API_KEY) {
      return new Response(JSON.stringify({
        error: 'Configuração incompleta',
        userMessage: 'Configure GROQ_API_KEY nas variáveis do Worker.',
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    try {
      const body = await request.json();
      const { topic, subject, area, mode, difficulty, quantity, questionType, concurso, banca, bancaFoco, freeText, editalText, alternativas, idioma, sessionMode, filter } = body;

      // ──────────────────────────────────────────────────────────────────────────
      // ROTEAMENTO: Se modo Concursos com filtro, usar pipeline RAG
      // ──────────────────────────────────────────────────────────────────────────
      if (mode === 'concursos' && filter) {
        const ragResult = await generateConcursosRAGQuestion(body, env);

        if (!ragResult.success) {
          return new Response(
            JSON.stringify({
              error: ragResult.error,
              userMessage: ragResult.userMessage,
              details: ragResult.details,
            }),
            {
              status: ragResult.statusCode || 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        return new Response(JSON.stringify({ questions: ragResult.questions }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ──────────────────────────────────────────────────────────────────────────
      // FLUXO LEGADO: Modos ENEM, Estudo, etc. (Groq direto, sem RAG)
      // ──────────────────────────────────────────────────────────────────────────
      const difficultyMap = {
        easy: 'fácil (nível iniciante, conceitos básicos)',
        medium: 'médio (nível intermediário, aplicação de conceitos)',
        hard: 'difícil (nível avançado, análise e interpretação)',
        extreme: 'extremo (nível especialista, questões de prova real)',
      };
      const diffLabel = difficultyMap[difficulty] || 'médio';
      const numAlts = (questionType === 'vf') ? 2 : (parseInt(alternativas) === 4 ? 4 : 5);
      const altKeys = numAlts === 4 ? 'A, B, C, D' : 'A, B, C, D, E';
      const typeMap = { mc: `múltipla escolha com ${numAlts} alternativas (${altKeys})`, vf: 'verdadeiro ou falso (A = Verdadeiro, B = Falso)', mix: `misto — alternando entre múltipla escolha com ${numAlts} alternativas (${altKeys}) e verdadeiro/falso` };
      const typeLabel = typeMap[questionType] || typeMap.mc;
      const idiomaMap = { 'pt-BR': 'português do Brasil', 'en': 'English (American)', 'es': 'español (castellano)' };
      const idiomaLabel = idiomaMap[idioma] || 'português do Brasil';
      const isPortugues = !idioma || idioma === 'pt-BR';
      const sessionMap = { normal: 'Estudo Normal — questões didáticas com foco em aprendizado e fixação de conteúdo', concurso: 'Simulado — questões no estilo e rigor de prova real, sem dicas pedagógicas no enunciado', revisao: 'Revisão Rápida — questões curtas e objetivas para revisão veloz do conteúdo' };
      const sessionLabel = sessionMap[sessionMode] || sessionMap.normal;
      const bancaEfetiva = (bancaFoco && bancaFoco !== 'auto') ? bancaFoco : (banca || null);
      const bancaStyleMap = { 'CEBRASPE': 'CEBRASPE/CESPE: assertivas curtas e diretas, estilo certo/errado, com pegadinhas sutis.', 'CESPE': 'CEBRASPE/CESPE: assertivas curtas e diretas, estilo certo/errado, com pegadinhas sutis.', 'CEBRASPE/CESPE': 'CEBRASPE/CESPE: assertivas curtas e diretas, estilo certo/errado, com pegadinhas sutis.', 'FCC': 'FCC: enunciados extensos e formais, questões literais baseadas em lei seca.', 'VUNESP': 'VUNESP: linguagem clara e objetiva, foco em aplicação prática.', 'FGV': 'FGV: enunciados elaborados com casos práticos, questões interdisciplinares.', 'CESGRANRIO': 'CESGRANRIO: questões técnicas, frequentemente com tabelas e contexto corporativo.', 'IDECAN': 'IDECAN: questões objetivas, foco em lei e doutrina.', 'IBFC': 'IBFC: questões práticas e diretas.', 'AOCP': 'AOCP: foco em conteúdo programático específico.', 'FEPESE': 'FEPESE: questões objetivas, Sul do Brasil.' };
      const bancaStyle = bancaEfetiva ? (bancaStyleMap[bancaEfetiva] || `Banca ${bancaEfetiva}: siga o estilo típico.`) : null;
      const areaSafetyInstruction = getAreaSafetyInstruction(area, mode);

      let contextInfo = '';
      let externalContext = null;
      if (mode === 'concurso' && concurso) {
        contextInfo = `Concurso: ${concurso}.`;
        if (bancaEfetiva) contextInfo += ` Banca: ${bancaEfetiva}.`;
        if (editalText?.length > 0) contextInfo += `\n\nConteúdo programático do edital:\n${editalText.slice(0, 3000)}`;
        externalContext = await fetchContext(area, mode, topic, subject, idioma, env);
      } else if (mode === 'academic') {
        contextInfo = `Área: ${area}. Disciplina: ${subject}.${topic ? ` Tópico: ${topic}.` : ' (Matéria completa)'}`;
        externalContext = await fetchContext(area, mode, topic, subject, idioma, env);
      } else if (mode === 'livre' && freeText) {
        contextInfo = `Material de estudo fornecido pelo usuário:\n${freeText.slice(0, 4000)}`;
      } else {
        const fallback = topic || subject || area || '';
        contextInfo = `Tópico: ${fallback || 'Conhecimentos gerais'}.`;
        if (fallback) externalContext = await fetchContext(area, mode, fallback, subject, idioma, env);
      }

      const contextSourceLabel = externalContext?.source || null;
      const isRAG = contextSourceLabel?.includes('Vectorize') || false;
      const rawExternalBlock = externalContext?.text
        ? isRAG
          ? `\n\nVADE MECUM VERIFICADO — PRIORIDADE ABSOLUTA (Fonte: ${externalContext.source}):\n"""\n${externalContext.text}\n"""\nFIM DO VADE MECUM.`
          : `\n\nContexto verificado (${externalContext.source}):\n"""\n${externalContext.text}\n"""`
        : '';

      const langInstruction = isPortugues
        ? 'Escreva todas as questões, alternativas e explicações em português do Brasil.'
        : `Write all questions, options and explanations in ${idiomaLabel}.`;
      const bancaInstruction = bancaStyle ? `\n\nEstilo de banca obrigatório: ${bancaStyle}` : '';
      const sessionInstruction = `\nModo de sessão: ${sessionLabel}.`;
      const altInstruction = questionType === 'vf' ? 'Para questões V/F, use apenas 2 opções: A (Verdadeiro) e B (Falso).' : `Gere exatamente ${numAlts} alternativas por questão usando as chaves ${altKeys}.`;
      const isDireitoOuConcurso = area === 'Direito' || mode === 'concurso';
      const fonteInstruction = isDireitoOuConcurso
        ? `Para cada questão, preencha "fonte" com artigo, súmula ou decreto.\nFormato: "Art. XX, Lei/Ano" ou "Súmula NNN, Tribunal".\nNUNCA invente número de artigo ou súmula.`
        : 'Para cada questão, preencha "fonte" com conceito ou autor de referência. NUNCA deixe vazio.';

      const exampleOptions = numAlts === 4
        ? `        { "key": "A", "text": "..." },\n        { "key": "B", "text": "..." },\n        { "key": "C", "text": "..." },\n        { "key": "D", "text": "..." }`
        : `        { "key": "A", "text": "..." },\n        { "key": "B", "text": "..." },\n        { "key": "C", "text": "..." },\n        { "key": "D", "text": "..." },\n        { "key": "E", "text": "..." }`;

      const systemText = `Você é um examinador acadêmico especializado em concursos públicos e ensino superior brasileiro. Retorne APENAS JSON válido com a chave "questions".\n${isPortugues ? 'Responda em português do Brasil.' : `Respond entirely in ${idiomaLabel}.`}\n\nPRINCÍPIOS INEGOCIÁVEIS:\n- Use APENAS conhecimento factício consolidado e verificado.\n- NUNCA invente leis, artigos, números, medicamentos, comandos, fórmulas ou qualquer dado.\n- O campo "fonte" de CADA questão deve ser preenchido.\n- ${areaSafetyInstruction}`;

      const { contextInfo: safeContextInfo, externalBlock } = guardPromptSize(contextInfo, rawExternalBlock, systemText);
      const userPrompt = `Você é um professor especialista em concursos públicos e ensino superior brasileiro.${bancaInstruction}${sessionInstruction}\n\nGere exatamente ${quantity} questões de ${typeLabel} sobre:\n${safeContextInfo}${externalBlock}\n\nNível de dificuldade: ${diffLabel}.\n\nRetorne APENAS um objeto JSON:\n{\n  "questions": [\n    {\n      "id": 1,\n      "statement": "Enunciado.",\n      "options": [\n${exampleOptions}\n      ],\n      "correctAnswer": "A",\n      "explanation": "Explicação didática.",\n      "fonte": "Base legal ou conceitual"\n    }\n  ]\n}\n\nRegras:\n1. ${altInstruction}\n2. Questões corretas e sem ambiguidades.\n3. Distribua o gabarito entre A-${numAlts === 5 ? 'E' : 'D'} sem repetir mais de 2x seguidas.\n4. ${langInstruction}\n5. ${fonteInstruction}\n6. NENHUM texto fora do JSON.\n7. ${areaSafetyInstruction}`;

      const maxTokens = quantity <= 10 ? 4096 : quantity <= 25 ? 6144 : 8192;
      const temperature = sessionMode === 'concurso' ? 0.30 : sessionMode === 'revisao' ? 0.25 : 0.40;

      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.GROQ_API_KEY}` },
        body: JSON.stringify({
          model: GROQ_MODELS[0],
          messages: [{ role: 'system', content: systemText }, { role: 'user', content: userPrompt }],
          temperature,
          max_tokens: maxTokens,
          response_format: { type: 'json_object' },
        }),
      });

      const groqResponse = groqRes.ok ? groqRes : await (async () => {
        const delays = [0, 2000, 4000];
        let lastRes = groqRes;
        for (const model of GROQ_MODELS.slice(1)) {
          for (let i = 0; i < delays.length; i++) {
            if (delays[i] > 0) await new Promise((r) => setTimeout(r, delays[i]));
            lastRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.GROQ_API_KEY}` },
              body: JSON.stringify({
                model,
                messages: [{ role: 'system', content: systemText }, { role: 'user', content: userPrompt }],
                temperature,
                max_tokens: maxTokens,
                response_format: { type: 'json_object' },
              }),
            });
            if (lastRes.ok || (lastRes.status !== 429 && lastRes.status !== 503)) break;
          }
          if (lastRes.ok) return lastRes;
          if (lastRes.status === 401 || lastRes.status === 403) return lastRes;
          if (lastRes.status === 400) {
            const errText = await lastRes.clone().text();
            if (!errText.includes('decommissioned')) return lastRes;
            continue;
          }
        }
        return lastRes;
      })();

      if (!groqResponse.ok) {
        const err = await groqResponse.text();
        let userMessage = 'Erro ao conectar com a IA. Tente novamente.';
        if (groqResponse.status === 429) userMessage = 'Limite de uso da IA atingido. Aguarde e tente novamente.';
        else if (groqResponse.status === 503) userMessage = 'A IA está com alta demanda. Tente em segundos.';
        else if (groqResponse.status === 401 || groqResponse.status === 403) userMessage = 'Chave da API inválida. Verifique GROQ_API_KEY.';
        return new Response(JSON.stringify({ error: 'Groq API error', details: err, userMessage }), {
          status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const groqData = await groqResponse.json();
      const rawText = extractJsonFromText(groqData?.choices?.[0]?.message?.content || '');

      let questions = [];
      try {
        questions = extractQuestions(JSON.parse(rawText));
      } catch {
        const matchObj = rawText.match(/\{[\s\S]*\}/);
        if (matchObj) { try { questions = extractQuestions(JSON.parse(matchObj[0])); } catch { /* continua */ } }
        if (questions.length === 0) {
          const matchArr = rawText.match(/\[[\s\S]*\]/);
          if (matchArr) { try { questions = extractQuestions(JSON.parse(matchArr[0])); } catch { /* continua */ } }
        }
      }

      questions = validateQuestions(questions);

      if (questions.length === 0) {
        return new Response(JSON.stringify({
          error: 'Resposta vazia', rawText,
          userMessage: 'A IA não gerou questões válidas. Tente ajustar o tópico ou dificuldade.',
        }), { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({ questions }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (err) {
      return new Response(JSON.stringify({
        error: err.message,
        userMessage: 'Ocorreu um erro inesperado. Tente novamente.',
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
  },
};
