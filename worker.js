var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-wPSdqD/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// worker.js
var corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400"
};
var CONCURSOS_CONFIG = {
  // Mapeamento EXPLÍCITO: filtro (chave) → Vectorize collection + metadados
  // Padrão de chave interna: "concursos.<materia>"
  filters: {
    "concursos.portugues": {
      label: "Portugu\xEAs",
      description: "Gram\xE1tica, reg\xEAncia verbal, sem\xE2ntica, interpreta\xE7\xE3o de textos",
      vectorizeCollection: "concursos_portugues",
      minContextLength: 200,
      forbiddenPatterns: [
        "banca\\s+\\w+",
        "prova\\s+de\\s+\\d{4}",
        "edital\\s+de",
        "concurso\\s+\\w+",
        "ano\\s+de\\s+\\d{4}"
      ],
      conceptualBases: "Normas de concord\xE2ncia, reg\xEAncia, interpreta\xE7\xE3o textual (NBR, literatura brasileira)"
    },
    "concursos.direito_constitucional": {
      label: "Direito Constitucional",
      description: "Constitui\xE7\xE3o Federal/88, direitos fundamentais, poder judici\xE1rio, federalismo",
      vectorizeCollection: "concursos_direito_constitucional",
      minContextLength: 300,
      forbiddenPatterns: [
        "STF\\s+entendeu",
        "julgado\\s+em\\s+\\d{4}",
        "ac\xF3rd\xE3o\\s+n\xBA?\\s*\\d+",
        "decis\xE3o\\s+recente",
        "prova\\s+de\\s+\\d{4}",
        "banca\\s+\\w+"
      ],
      conceptualBases: "CF/88, Jurisprud\xEAncia STF/STJ, Lei 9.784/99 (processo administrativo)"
    },
    "concursos.direito_administrativo": {
      label: "Direito Administrativo",
      description: "Administra\xE7\xE3o p\xFAblica, servidores p\xFAblicos, licita\xE7\xF5es, atos administrativos",
      vectorizeCollection: "concursos_direito_administrativo",
      minContextLength: 300,
      forbiddenPatterns: [
        "banca\\s+\\w+\\s+decidiu",
        "edital\\s+de\\s+\\d{4}",
        "prova\\s+(real|espec\xEDfica)",
        "ano\\s+de\\s+\\d{4}",
        "julgado\\s+em"
      ],
      conceptualBases: "CF/88, Lei 8.112/90, Lei 8.666/93, Lei 9.784/99, Lei 14.133/21, Lei 12.527/11 (LAI)"
    },
    "concursos.raciocinio_logico": {
      label: "Racioc\xEDnio L\xF3gico",
      description: "L\xF3gica formal, combinat\xF3ria, probabilidade, an\xE1lise de argumentos",
      vectorizeCollection: "concursos_rlm",
      minContextLength: 150,
      forbiddenPatterns: [
        "como\\s+foi\\s+comprovado",
        "universalmente\\s+aceito",
        "recentemente\\s+descoberto",
        "prova\\s+de\\s+\\d{4}",
        "banca\\s+\\w+"
      ],
      conceptualBases: "L\xF3gica cl\xE1ssica, Teoria dos conjuntos, An\xE1lise combinat\xF3ria, Probabilidade"
    },
    "concursos.informatica": {
      label: "Inform\xE1tica",
      description: "Sistemas operacionais, redes, seguran\xE7a da informa\xE7\xE3o, protocolos, bancos de dados",
      vectorizeCollection: "concursos_informatica",
      minContextLength: 250,
      forbiddenPatterns: [
        "\xFAltima\\s+vers\xE3o",
        "vers\xE3o\\s+mais\\s+recente",
        "tecnologia\\s+do\\s+futuro",
        "vers\xE3o\\s+\\d+\\.\\d+\\s+(lan\xE7ada|publicada)",
        "prova\\s+de\\s+\\d{4}"
      ],
      conceptualBases: "ISO/IEC 27001, RFC padr\xF5es, Documenta\xE7\xE3o oficial (NIST, CIS)"
    },
    "concursos.administracao_publica": {
      label: "Administra\xE7\xE3o P\xFAblica",
      description: "Gest\xE3o p\xFAblica, planejamento estrat\xE9gico, lideran\xE7a, administra\xE7\xE3o de recursos",
      vectorizeCollection: "concursos_adm_publica",
      minContextLength: 300,
      forbiddenPatterns: [
        "banca\\s+\\w+\\s+decidiu",
        "edital\\s+de\\s+\\d{4}",
        "prova\\s+(real|espec\xEDfica|recente)",
        "ano\\s+de\\s+\\d{4}",
        "concurso\\s+\\w+"
      ],
      conceptualBases: "CF/88, Lei 8.112/90 (regime jur\xEDdico), Lei 9.784/99, Lei 14.133/21 (nova lei de licita\xE7\xF5es)"
    }
  },
  // Mapeamento reverso: coleção → filtro (para debugging/logging)
  collectionToFilter: {
    "concursos_portugues": "concursos.portugues",
    "concursos_direito_constitucional": "concursos.direito_constitucional",
    "concursos_direito_administrativo": "concursos.direito_administrativo",
    "concursos_rlm": "concursos.raciocinio_logico",
    "concursos_informatica": "concursos.informatica",
    "concursos_adm_publica": "concursos.administracao_publica"
  },
  // Fallback gracioso quando contexto insuficiente ou filtro não mapeado
  fallbackMessage: "Desculpe, ainda n\xE3o temos base de dados suficiente para esta mat\xE9ria. Tente novamente em breve!",
  invalidFilterMessage: /* @__PURE__ */ __name((filter) => `O filtro "${filter}" n\xE3o foi reconhecido. Escolha uma das mat\xE9rias dispon\xEDveis: Portugu\xEAs, Direito Constitucional, Direito Administrativo, Racioc\xEDnio L\xF3gico, Inform\xE1tica ou Administra\xE7\xE3o P\xFAblica.`, "invalidFilterMessage")
};
var ACADEMIC_CONFIG = {
  // Mapeamento EXPLÍCITO: área (chave) → Vectorize collection + metadados
  // Padrão de chave interna: "academic.<area>"
  areas: {
    "academic.direito": {
      label: "Direito",
      description: "Direito Civil, Constitucional, Penal, Processual e Administrativo",
      vectorizeCollection: "academic_direito",
      minContextLength: 300,
      forbiddenPatterns: [
        "doutrina\\s+recente",
        "decis\xE3o\\s+in\xE9dita",
        "nunca\\s+decidido",
        "edital\\s+de\\s+\\d{4}",
        "prova\\s+de\\s+\\d{4}"
      ],
      conceptualBases: "C\xF3digo Civil, C\xF3digo Processual Civil, C\xF3digo Penal, Constitui\xE7\xE3o Federal/88, Jurisprud\xEAncia STF/STJ"
    },
    "academic.medicina": {
      label: "Medicina",
      description: "Fisiologia, Patologia, Farmacologia, Cl\xEDnica M\xE9dica e Diagn\xF3stico",
      vectorizeCollection: "academic_medicina",
      minContextLength: 350,
      forbiddenPatterns: [
        "medicamento\\s+novo",
        "t\xE9cnica\\s+experimental",
        "nunca\\s+testado",
        "ainda\\s+em\\s+desenvolvimento",
        "recentemente\\s+aprovado"
      ],
      conceptualBases: "Fisiologia, Patologia, Farmacologia, Guidelines internacionais (ACLS, PALS), Protocolos cl\xEDnicos consolidados"
    },
    "academic.historia": {
      label: "Hist\xF3ria",
      description: "Hist\xF3ria Geral, Hist\xF3ria do Brasil, Per\xEDodos hist\xF3ricos e Movimentos sociais",
      vectorizeCollection: "academic_historia",
      minContextLength: 250,
      forbiddenPatterns: [
        "evento\\s+recente",
        "interpreta\xE7\xE3o\\s+controversa",
        "ainda\\s+debatido",
        "n\xE3o\\s+h\xE1\\s+consenso",
        "debate\\s+aberto"
      ],
      conceptualBases: "Per\xEDodos hist\xF3ricos documentados, Movimentos sociais, Personagens importantes, Datas e eventos verific\xE1veis"
    },
    "academic.exatas": {
      label: "Exatas",
      description: "Matem\xE1tica, F\xEDsica, Qu\xEDmica, Estat\xEDstica e C\xE1lculo",
      vectorizeCollection: "academic_exatas",
      minContextLength: 280,
      forbiddenPatterns: [
        "f\xF3rmula\\s+recente",
        "m\xE9todo\\s+experimental",
        "ainda\\s+em\\s+pesquisa",
        "n\xE3o\\s+comprovado",
        "hip\xF3tese\\s+em\\s+testes"
      ],
      conceptualBases: "Matem\xE1tica, F\xEDsica cl\xE1ssica e moderna, Qu\xEDmica org\xE2nica e inorg\xE2nica, Estat\xEDstica, C\xE1lculo diferencial e integral"
    },
    "academic.humanas": {
      label: "Humanas",
      description: "Sociologia, Antropologia, Filosofia, Psicologia e Ci\xEAncia Pol\xEDtica",
      vectorizeCollection: "academic_humanas",
      minContextLength: 300,
      forbiddenPatterns: [
        "teoria\\s+recente",
        "debate\\s+aberto",
        "ainda\\s+discutido",
        "n\xE3o\\s+h\xE1\\s+conclus\xE3o",
        "interpreta\xE7\xE3o\\s+controversa"
      ],
      conceptualBases: "Sociologia, Antropologia, Filosofia cl\xE1ssica e moderna, Psicologia, Ci\xEAncia Pol\xEDtica, Teorias consolidadas"
    },
    "academic.saude": {
      label: "Sa\xFAde",
      description: "Sa\xFAde P\xFAblica, Epidemiologia, Biologia, Nutri\xE7\xE3o e Educa\xE7\xE3o Sanit\xE1ria",
      vectorizeCollection: "academic_saude",
      minContextLength: 320,
      forbiddenPatterns: [
        "tratamento\\s+novo",
        "terapia\\s+experimental",
        "ainda\\s+em\\s+teste",
        "recentemente\\s+descoberto",
        "n\xE3o\\s+aprovado\\s+pela\\s+anvisa"
      ],
      conceptualBases: "Sa\xFAde p\xFAblica, Epidemiologia, Biologia celular e molecular, Nutri\xE7\xE3o, CID (Classifica\xE7\xE3o Internacional de Doen\xE7as)"
    },
    "academic.negocios": {
      label: "Neg\xF3cios",
      description: "Administra\xE7\xE3o, Contabilidade, Marketing, Finan\xE7as e Economia",
      vectorizeCollection: "academic_negocios",
      minContextLength: 300,
      forbiddenPatterns: [
        "estrat\xE9gia\\s+recente",
        "modelo\\s+experimental",
        "startup\\s+nova",
        "empresa\\s+do\\s+momento",
        "trend\\s+atual"
      ],
      conceptualBases: "Administra\xE7\xE3o, Contabilidade (IFRS), Marketing, Finan\xE7as corporativas, Economia, Gest\xE3o estrat\xE9gica consolidada"
    }
  },
  // Mapeamento reverso: coleção → área (para debugging/logging)
  collectionToArea: {
    "academic_direito": "academic.direito",
    "academic_medicina": "academic.medicina",
    "academic_historia": "academic.historia",
    "academic_exatas": "academic.exatas",
    "academic_humanas": "academic.humanas",
    "academic_saude": "academic.saude",
    "academic_negocios": "academic.negocios"
  },
  // Fallback gracioso quando contexto insuficiente ou área não mapeada
  fallbackMessage: "Desculpe, ainda n\xE3o temos base de dados suficiente para esta \xE1rea. Tente novamente em breve!",
  invalidAreaMessage: /* @__PURE__ */ __name((area) => `A \xE1rea "${area}" n\xE3o foi reconhecida. Escolha uma das dispon\xEDveis: Direito, Medicina, Hist\xF3ria, Exatas, Humanas, Sa\xFAde ou Neg\xF3cios.`, "invalidAreaMessage")
};
var GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama3-70b-8192",
  "llama3-8b-8192",
  "llama-3.1-8b-instant",
  "gemma2-9b-it"
];
function validateConcursosFilter(filter) {
  const config = CONCURSOS_CONFIG.filters[filter];
  if (!config) {
    const availableFilters = Object.keys(CONCURSOS_CONFIG.filters).map((f) => f.replace("concursos.", "")).join(", ");
    return {
      valid: false,
      config: null,
      error: `Filtro n\xE3o mapeado: "${filter}". Op\xE7\xF5es dispon\xEDveis: ${availableFilters}`,
      userMessage: CONCURSOS_CONFIG.invalidFilterMessage(filter)
    };
  }
  return { valid: true, config };
}
__name(validateConcursosFilter, "validateConcursosFilter");
async function fetchVectorizeContext(env, collection, query, minLength) {
  try {
    if (!env.VECTORIZE) {
      console.warn(`[RAG] Vectorize n\xE3o configurado. Retornando contexto vazio.`);
      return { context: "", sufficient: false, sources: [], contextLength: 0 };
    }
    let embedding;
    try {
      if (!env.AI) {
        console.warn(`[RAG] CF AI n\xE3o dispon\xEDvel. Retornando contexto vazio.`);
        return { context: "", sufficient: false, sources: [], contextLength: 0 };
      }
      const embeddingRes = await env.AI.run("@cf/baai/bge-m3", { text: [query.slice(0, 512)] });
      const vector = embeddingRes?.data?.[0];
      if (!vector || !Array.isArray(vector)) {
        console.warn(`[RAG] Embedding inv\xE1lido. Retornando contexto vazio.`);
        return { context: "", sufficient: false, sources: [], contextLength: 0 };
      }
      embedding = vector;
    } catch (e) {
      console.warn(`[RAG] Erro ao gerar embedding: ${e.message}`);
      return { context: "", sufficient: false, sources: [], contextLength: 0 };
    }
    let results;
    try {
      results = await env.VECTORIZE.query(embedding, {
        namespace: collection,
        topK: 5,
        returnMetadata: "all"
      });
    } catch (e) {
      console.warn(`[RAG] Erro ao buscar Vectorize: ${e.message}`);
      return { context: "", sufficient: false, sources: [], contextLength: 0 };
    }
    if (!results?.matches?.length) {
      return { context: "", sufficient: false, sources: [], contextLength: 0 };
    }
    const documents = results.matches.filter((m) => m.score >= 0.65).slice(0, 3).map((m) => ({
      text: m.metadata?.text || m.text || "",
      source: m.metadata?.source || "Acervo de Concursos",
      score: m.score
    })).filter((d) => d.text.trim().length > 0);
    if (documents.length === 0) {
      return { context: "", sufficient: false, sources: [], contextLength: 0 };
    }
    const context = documents.map((d) => d.text).join("\n\n");
    const sufficient = context.length >= minLength;
    return {
      context,
      sufficient,
      sources: documents.map((d) => ({ text: d.text.slice(0, 100), source: d.source })),
      contextLength: context.length
    };
  } catch (e) {
    console.error(`[RAG] Erro geral em fetchVectorizeContext: ${e.message}`);
    return { context: "", sufficient: false, sources: [], contextLength: 0 };
  }
}
__name(fetchVectorizeContext, "fetchVectorizeContext");
function validateAgainstHallucination(question, subjectConfig) {
  const errors = [];
  if (!question.statement || question.statement.trim().length < 20) {
    errors.push("statement: enunciado ausente ou muito curto");
  }
  if (!Array.isArray(question.options) || question.options.length < 4) {
    errors.push("options: deve ter 4-5 alternativas");
  }
  if (!question.correctAnswer || !["A", "B", "C", "D", "E"].includes(question.correctAnswer)) {
    errors.push("correctAnswer: deve ser A-E");
  }
  if (!question.explanation || question.explanation.trim().length < 30) {
    errors.push("explanation: explica\xE7\xE3o ausente ou muito curta");
  }
  const forbiddenPatterns = subjectConfig.forbiddenPatterns || [];
  const fullText = [question.statement, question.explanation, ...(question.options || []).map((o) => o.text || "")].join(" ").toLowerCase();
  const detectedPatterns = forbiddenPatterns.filter((pattern) => {
    try {
      const regex = new RegExp(pattern.toLowerCase(), "i");
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
        const regex = new RegExp(pattern, "gi");
        cleanedStatement = cleanedStatement.replace(regex, "[informa\xE7\xE3o removida]");
        cleanedExplanation = cleanedExplanation.replace(regex, "[informa\xE7\xE3o removida]");
      } catch {
      }
    });
    corrected.statement = cleanedStatement;
    corrected.explanation = cleanedExplanation;
    return {
      valid: true,
      errors: [],
      corrected,
      hallucinations: detectedPatterns,
      warning: `Padr\xF5es alucinat\xF3rios detectados e removidos: ${detectedPatterns.join(", ")}`
    };
  }
  if (errors.length > 0) {
    return { valid: false, errors, corrected: null };
  }
  return { valid: true, errors: [], corrected: question };
}
__name(validateAgainstHallucination, "validateAgainstHallucination");
function detectarSubareaJuridica(topic, subject) {
  const texto = `${topic || ""} ${subject || ""}`.toLowerCase();
  if (/constitui|cf.?88|mandado|habeas|direito fundamental|controle de constitucional/i.test(texto)) return "constitucional";
  if (/penal|crime|delito|pena|prescrição penal|cpp|processo penal|tipicidade|culpabilidade/i.test(texto)) return "penal";
  if (/trabalhista|clt|empregado|empregador|rescisão|fgts|aviso prévio|jornada|salário/i.test(texto)) return "trabalhista";
  if (/administrativo|improbidade|licitação|concurso público|servidor|lei 8\.112|lei 9\.784|lei 14\.133|lei 8\.666/i.test(texto)) return "administrativo";
  if (/tribut|imposto|taxa|contribuição|ctn|icms|iss|ir|iptu|itbi|decadência fiscal|prescrição tributária/i.test(texto)) return "tributario";
  if (/civil|cc.?2002|contrato|responsabilidade civil|prescrição civil|família|herança|posse|propriedade|cpc/i.test(texto)) return "civil";
  return null;
}
__name(detectarSubareaJuridica, "detectarSubareaJuridica");
async function fetchVademecumRAG(query, subarea, env) {
  if (!env.AI || !env.KNOWLEDGE_INDEX) return null;
  try {
    const embeddingRes = await env.AI.run("@cf/baai/bge-m3", { text: [query.slice(0, 512)] });
    const vector = embeddingRes?.data?.[0];
    if (!vector || !Array.isArray(vector)) return null;
    const queryOptions = { topK: 8, returnMetadata: "all" };
    if (subarea) queryOptions.filter = { area: { $eq: subarea } };
    const results = await env.KNOWLEDGE_INDEX.query(vector, queryOptions);
    if (!results?.matches?.length) return null;
    const artigosRelevantes = results.matches.filter((m) => m.score >= 0.7).slice(0, 8).map((m) => m.metadata?.text || "").filter(Boolean);
    if (artigosRelevantes.length === 0) return null;
    return {
      text: artigosRelevantes.join("\n\n"),
      source: "Vade Mecum Digital \u2014 Planalto.gov.br (Vectorize RAG)",
      artigos: artigosRelevantes.length
    };
  } catch {
    return null;
  }
}
__name(fetchVademecumRAG, "fetchVademecumRAG");
async function fetchLexML(query) {
  try {
    const cql = `(dc.title any "${query}" or dc.subject any "${query}") and tipoDocumento any "Lei Decreto-Lei C\xF3digo Constitui\xE7\xE3o Medida-Provis\xF3ria"`;
    const url = `https://www.lexml.gov.br/busca/SRU?operation=searchRetrieve&version=1.1&query=${encodeURIComponent(cql)}&maximumRecords=5&recordSchema=dc`;
    const res = await fetch(url, { headers: { "User-Agent": "StudyMaster/1.0" }, signal: AbortSignal.timeout(5e3) });
    if (!res.ok) return null;
    const xml = await res.text();
    const titles = [...xml.matchAll(/<dc:title>([^<]+)<\/dc:title>/g)].map((m) => m[1]);
    const descriptions = [...xml.matchAll(/<dc:description>([^<]+)<\/dc:description>/g)].map((m) => m[1]);
    const dates = [...xml.matchAll(/<dc:date>([^<]+)<\/dc:date>/g)].map((m) => m[1]);
    if (titles.length === 0) return null;
    let ctx = "LEGISLA\xC7\xC3O VERIFICADA \u2014 LEXML/SENADO FEDERAL:\n";
    titles.slice(0, 5).forEach((title, i) => {
      ctx += `
[${i + 1}] ${title}`;
      if (dates[i]) ctx += ` (${dates[i]})`;
      if (descriptions[i]) ctx += `
    Ementa: ${descriptions[i]}`;
    });
    return ctx.slice(0, 2e3);
  } catch {
    return null;
  }
}
__name(fetchLexML, "fetchLexML");
async function fetchWikipediaContext(query, lang = "pt") {
  try {
    const slug = encodeURIComponent(query.trim().replace(/\s+/g, "_"));
    const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${slug}`;
    const res = await fetch(url, { headers: { "User-Agent": "StudyMaster/1.0" }, signal: AbortSignal.timeout(4e3) });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.extract ? data.extract.slice(0, 1500) : null;
  } catch {
    return null;
  }
}
__name(fetchWikipediaContext, "fetchWikipediaContext");
async function fetchContext(area, mode, topic, subject, idioma, env) {
  const isPortugues = !idioma || idioma === "pt-BR";
  const isDireito = area === "Direito" || mode === "concurso" || mode === "academic";
  const query = topic || subject || area || "";
  if (isDireito && query) {
    const subarea = detectarSubareaJuridica(topic, subject);
    const rag = await fetchVademecumRAG(query, subarea, env);
    if (rag) return { text: rag.text, source: rag.source };
    const lexml = await fetchLexML(query);
    if (lexml) return { text: lexml, source: "LexML/Senado Federal (Vade M\xEAcum Digital)" };
  }
  if (query) {
    const lang = isPortugues ? "pt" : idioma === "es" ? "es" : "en";
    const wiki = await fetchWikipediaContext(query, lang);
    if (wiki) return { text: wiki, source: "Wikipedia" };
  }
  return null;
}
__name(fetchContext, "fetchContext");
function extractQuestions(parsed) {
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === "object" && Array.isArray(parsed.questions)) return parsed.questions;
  if (parsed && typeof parsed === "object" && Array.isArray(parsed.data)) return parsed.data;
  if (parsed && typeof parsed === "object" && Array.isArray(parsed.result)) return parsed.result;
  for (const key of Object.keys(parsed || {})) {
    if (Array.isArray(parsed[key])) return parsed[key];
  }
  return [];
}
__name(extractQuestions, "extractQuestions");
function validateQuestions(questions) {
  return questions.filter((q) => {
    if (!q || typeof q !== "object") return false;
    if (!q.statement || typeof q.statement !== "string" || q.statement.trim().length < 10) return false;
    if (!Array.isArray(q.options) || q.options.length < 2) return false;
    if (!q.correctAnswer || typeof q.correctAnswer !== "string") return false;
    const validKeys = q.options.map((o) => o?.key).filter(Boolean);
    if (!validKeys.includes(q.correctAnswer)) return false;
    if (!q.fonte || String(q.fonte).trim().length === 0) q.fonte = "Conhecimento acad\xEAmico consolidado";
    return true;
  });
}
__name(validateQuestions, "validateQuestions");
function getAreaSafetyInstruction(area, mode) {
  if (mode === "concurso" || area === "Direito") {
    return `PROTOCOLO VADE M\xCACUM ATIVO:
- Use APENAS artigos, incisos e par\xE1grafos confirmados no contexto legislativo fornecido.
- Diplomas v\xE1lidos: CF/88, CC/2002, CP, CPC/2015, CPP, CLT, Lei 8.112/90, Lei 8.666/93, Lei 14.133/21, Lei 9.784/99, Lei 12.527/11, Lei 13.709/18 (LGPD).
- S\xFAmulas: cite SOMENTE com n\xFAmero e tribunal confirmados (STF, STJ, TST).
- NUNCA invente artigos fict\xEDcios, s\xFAmulas com n\xFAmeros errados ou leis inexistentes.`;
  }
  if (mode === "livre") return "As quest\xF5es devem ser baseadas EXCLUSIVAMENTE no material de estudo fornecido pelo usu\xE1rio.";
  const areaMap = {
    "Sa\xFAde": "Use apenas terminologia m\xE9dica, protocolos cl\xEDnicos, f\xE1rmacos e s\xEDndromes reconhecidos pela CID.",
    "Tecnologia": "Use apenas linguagens, frameworks, comandos e protocolos documentados.",
    "Exatas": "Use apenas f\xF3rmulas, teoremas e constantes f\xEDsicas/qu\xEDmicas verificados.",
    "Humanas": "Use apenas eventos hist\xF3ricos, datas, personagens e conceitos reais e documentados.",
    "Neg\xF3cios": "Use apenas conceitos de administra\xE7\xE3o, contabilidade e finan\xE7as consolidados.",
    "ENEM": "Use apenas conte\xFAdos da matriz de refer\xEAncia oficial do ENEM (INEP).",
    "Concursos \u2014 Mat\xE9rias Comuns": "Cite apenas artigos e conceitos existentes."
  };
  return areaMap[area] || "Use apenas conhecimento fact\xEDcio consolidado e verificado.";
}
__name(getAreaSafetyInstruction, "getAreaSafetyInstruction");
function guardPromptSize(contextInfo, externalBlock, systemText, maxChars = 24e3) {
  const overhead = systemText.length + 2e3;
  const available = maxChars - overhead;
  const combined = contextInfo + externalBlock;
  if (combined.length <= available) return { contextInfo, externalBlock };
  const spaceForExternal = available - contextInfo.length;
  if (spaceForExternal > 300 && externalBlock.length > 0) {
    return { contextInfo, externalBlock: externalBlock.slice(0, spaceForExternal) + "\n[contexto truncado]" };
  }
  return { contextInfo: contextInfo.slice(0, available - 200), externalBlock: "" };
}
__name(guardPromptSize, "guardPromptSize");
function extractJsonFromText(text) {
  let t = String(text || "").trim();
  if (t.startsWith("```")) t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  if (t.startsWith("{") || t.startsWith("[")) return t;
  const matchObj = t.match(/\{[\s\S]*\}/);
  if (matchObj) return matchObj[0];
  const matchArr = t.match(/\[[\s\S]*\]/);
  if (matchArr) return matchArr[0];
  return t;
}
__name(extractJsonFromText, "extractJsonFromText");
function extractYouTubeVideoId(url) {
  try {
    const u = new URL(url.trim());
    if (u.hostname === "youtu.be") return u.pathname.slice(1).split("/")[0] || null;
    const v = u.searchParams.get("v");
    if (v) return v;
    const parts = u.pathname.split("/");
    const idx = parts.findIndex((p) => ["embed", "shorts", "live"].includes(p));
    if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];
  } catch {
  }
  return null;
}
__name(extractYouTubeVideoId, "extractYouTubeVideoId");
async function fetchYouTubeTranscript(videoId) {
  const MAX_TRANSCRIPT_CHARS = 3e4;
  const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
  const pageUrl = `https://www.youtube.com/watch?v=${videoId}`;
  let pageHtml;
  try {
    const pageRes = await fetch(pageUrl, {
      headers: { "User-Agent": UA, "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8" },
      signal: AbortSignal.timeout(1e4)
    });
    if (!pageRes.ok) throw new Error(`YouTube retornou HTTP ${pageRes.status}`);
    pageHtml = await pageRes.text();
  } catch (e) {
    throw new Error(`N\xE3o foi poss\xEDvel acessar o v\xEDdeo: ${e.message}`);
  }
  const match = pageHtml.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});(?:\s*var\s|\s*<\/script)/s);
  if (!match) throw new Error("N\xE3o foi poss\xEDvel extrair dados do v\xEDdeo. O v\xEDdeo pode ser privado ou com restri\xE7\xE3o de idade.");
  let playerResponse;
  try {
    playerResponse = JSON.parse(match[1]);
  } catch {
    throw new Error("Erro ao processar dados do v\xEDdeo.");
  }
  const status = playerResponse?.playabilityStatus?.status;
  if (status && status !== "OK") {
    const reason = playerResponse?.playabilityStatus?.reason || status;
    throw new Error(`V\xEDdeo n\xE3o dispon\xEDvel: ${reason}`);
  }
  const captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
  if (captionTracks.length === 0) {
    throw new Error("Este v\xEDdeo n\xE3o possui legendas ou transcri\xE7\xE3o dispon\xEDvel. Tente um v\xEDdeo com legendas ativadas.");
  }
  const priority = ["pt-BR", "pt", "en"];
  let chosen = null;
  for (const lang of priority) {
    chosen = captionTracks.find((t) => t.languageCode === lang) || null;
    if (chosen) break;
  }
  if (!chosen) chosen = captionTracks[0];
  const baseUrl = chosen?.baseUrl;
  if (!baseUrl) throw new Error("URL da legenda inv\xE1lida.");
  const transcriptUrl = `${baseUrl}&fmt=json3`;
  let transcriptData;
  try {
    const tRes = await fetch(transcriptUrl, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(8e3)
    });
    if (!tRes.ok) throw new Error(`HTTP ${tRes.status}`);
    transcriptData = await tRes.json();
  } catch (e) {
    throw new Error(`Falha ao baixar transcri\xE7\xE3o: ${e.message}`);
  }
  const events = transcriptData?.events || [];
  const segments = events.flatMap((e) => e?.segs || []).map((s) => (s?.utf8 || "").replace(/\n/g, " ").trim()).filter((s) => s && s !== " ");
  const deduped = segments.filter((s, i) => i === 0 || s !== segments[i - 1]);
  if (!deduped.length) {
    throw new Error("A transcri\xE7\xE3o do v\xEDdeo est\xE1 vazia. Tente um v\xEDdeo diferente.");
  }
  let text = deduped.join(" ").replace(/\s{2,}/g, " ").trim();
  const wasTruncated = text.length > MAX_TRANSCRIPT_CHARS;
  if (wasTruncated) text = text.slice(0, MAX_TRANSCRIPT_CHARS);
  return {
    text,
    videoId,
    lang: chosen.languageCode || "desconhecido",
    isAuto: chosen.kind === "asr",
    truncated: wasTruncated,
    charCount: text.length,
    source: "youtube.com (timedtext)"
  };
}
__name(fetchYouTubeTranscript, "fetchYouTubeTranscript");

// ════════════════════════════════════════════════════════════════════════════
// FASE 1: FUNÇÕES DE VALIDAÇÃO DO PIPELINE (CAMADAS 1, 3, 4)
// ════════════════════════════════════════════════════════════════════════════

function validateRAGScore(ragResults, minScore = 0.75) {
  if (!ragResults?.matches || ragResults.matches.length === 0) {
    return { valid: false, score: 0, reason: 'RAG_EMPTY', message: 'Nenhum material encontrado' };
  }
  const topScores = ragResults.matches.map(m => m.score || 0).sort((a, b) => b - a).slice(0, 3);
  const avgScore = topScores.reduce((a, b) => a + b, 0) / topScores.length;
  if (avgScore < minScore) {
    return { valid: false, score: avgScore, reason: 'RAG_LOW_CONFIDENCE', message: `Material insuficiente (${(avgScore * 100).toFixed(0)}%)` };
  }
  return { valid: true, score: avgScore, matchCount: ragResults.matches.length, message: `Material verificado` };
}

function validateQuestionTraceability(question, contextText) {
  if (!contextText || contextText.length < 100) {
    return { valid: false, reason: 'NO_CONTEXT', coverage: '0%', message: 'Contexto insuficiente' };
  }
  const contextLower = contextText.toLowerCase();
  const statementLower = question.statement.toLowerCase();
  const explanationLower = (question.explanation || '').toLowerCase();
  const extractKeyTerms = (text) => text.replace(/[^\w\sáàâãéèêíïóôõöúçñ]/gi, ' ').split(/\s+/).filter(w => w.length >= 5).filter(w => !/^(questão|sobre|quando|conforme|segundo|assim|então|portanto|todavia|contudo|porque|porém|ainda|também|apenas|somente)$/i.test(w));
  const keyTerms = [...extractKeyTerms(statementLower), ...extractKeyTerms(explanationLower)];
  if (keyTerms.length === 0) {
    return { valid: false, reason: 'NO_KEY_TERMS', coverage: '0%', message: 'Questão muito genérica' };
  }
  const matchedTerms = keyTerms.filter(term => contextLower.includes(term));
  const coverageRatio = matchedTerms.length / keyTerms.length;
  if (coverageRatio < 0.3) {
    return { valid: false, reason: 'LOW_TRACEABILITY', coverage: (coverageRatio * 100).toFixed(0) + '%', message: `Baixa rastreabilidade (${(coverageRatio * 100).toFixed(0)}%)` };
  }
  return { valid: true, coverage: (coverageRatio * 100).toFixed(0) + '%', matchedTerms: matchedTerms.length, totalTerms: keyTerms.length, message: `Questão rastreável` };
}

function generateQualityBadge(ragScore, traceability) {
  const score = (ragScore * 0.6 + (parseFloat(traceability.coverage) / 100) * 0.4);
  let confidence, emoji, message;
  if (score >= 0.85) {
    confidence = 'Alta'; emoji = '🟢'; message = `Fundamentada`;
  } else if (score >= 0.70) {
    confidence = 'Média'; emoji = '🟡'; message = `Parcialmente baseada`;
  } else {
    confidence = 'Baixa'; emoji = '🔴'; message = `Validação incompleta`;
  }
  return { confidence, emoji, score: (score * 100).toFixed(0) + '%', message: `${emoji} ${message}` };
}

function validateQuestionPipeline(ragResults, question, contextText, minScore = 0.75) {
  const ragValidation = validateRAGScore(ragResults, minScore);
  if (!ragValidation.valid) {
    return { success: false, reason: ragValidation.reason, message: ragValidation.message, metadata: { layer: 1, ragScore: ragValidation.score } };
  }
  const traceValidation = validateQuestionTraceability(question, contextText);
  if (!traceValidation.valid) {
    return { success: false, reason: traceValidation.reason, message: traceValidation.message, metadata: { layer: 3, coverage: traceValidation.coverage } };
  }
  const badge = generateQualityBadge(ragValidation.score, traceValidation);
  return { success: true, question: { ...question, _qualityBadge: badge }, metadata: { layers: [1, 3, 4], ragScore: ragValidation.score, traceability: traceValidation.coverage, badge: badge.confidence } };
}

// ════════════════════════════════════════════════════════════════════════════

async function generateConcursosRAGQuestion(body, env) {
  const { filter, quantity = 1, difficulty, questionType, alternativas, idioma, sessionMode } = body;
  console.log("[RAG] FILTER RAW:", JSON.stringify(filter));
  let filterKey = filter;
  let content = {}, exam = {}, examMetadata = {}, history = {};
  if (typeof filter === "object" && filter !== null) {
    content = filter.content || {};
    exam = filter.exam || {};
    examMetadata = filter.examMetadata || {};
    history = filter.history || {};
    filterKey = content.discipline ? `concursos.${content.discipline}` : filterKey;
  }
  console.log("[RAG] FILTER KEY:", filterKey);
  const filterValidation = validateConcursosFilter(filterKey);
  if (!filterValidation.valid) {
    return {
      success: false,
      error: filterValidation.error,
      userMessage: filterValidation.userMessage || CONCURSOS_CONFIG.fallbackMessage,
      statusCode: 400
    };
  }
  const subjectConfig = filterValidation.config;
  console.log(`[RAG] \u2713 Filtro v\xE1lido: ${filterKey} \u2192 ${subjectConfig.vectorizeCollection}`);
  const contextParts = [];
  if (content.topic) contextParts.push(`T\xF3pico: ${content.topic}`);
  if (content.subtopic) contextParts.push(`Subt\xF3pico: ${content.subtopic}`);
  if (content.keyword) contextParts.push(`Palavra-chave: ${content.keyword}`);
  if (exam.examBoard) contextParts.push(`Banca: ${exam.examBoard}`);
  if (exam.agency) contextParts.push(`\xD3rg\xE3o: ${exam.agency}`);
  if (exam.position) contextParts.push(`Cargo: ${exam.position}`);
  if (exam.educationLevel) contextParts.push(`Escolaridade: ${exam.educationLevel}`);
  if (examMetadata.yearFrom || examMetadata.yearTo) {
    contextParts.push(`Ano: ${examMetadata.yearFrom || "..."} a ${examMetadata.yearTo || "..."}`);
  }
  const queryContext = contextParts.join(", ");
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
    `[RAG] Contexto: ${contextResult.contextLength} chars, Suficiente: ${contextResult.sufficient}`
  );
  
  // FASE 1.2: Validação obrigatória de contextLength com fallback
  if (contextResult.contextLength < subjectConfig.minContextLength) {
    console.warn(`[CONTEXT-VALIDATION] Contexto insuficiente: ${contextResult.contextLength} < ${subjectConfig.minContextLength}`);
    return {
      success: false,
      error: 'CONTEXT_INSUFFICIENT',
      userMessage: `Material insuficiente para gerar questões confiáveis. O banco de dados contém apenas ${contextResult.contextLength} caracteres de conteúdo sobre este tópico (mínimo necessário: ${subjectConfig.minContextLength}). Por favor, forneça mais conteúdo ou refine sua busca.`,
      metadata: {
        contextLength: contextResult.contextLength,
        minRequired: subjectConfig.minContextLength,
        sufficient: false,
        fallbackTriggered: true
      },
      statusCode: 422
    };
  }
  
  const difficultyMap = {
    easy: "f\xE1cil (n\xEDvel iniciante, conceitos b\xE1sicos)",
    medium: "m\xE9dio (n\xEDvel intermedi\xE1rio, aplica\xE7\xE3o de conceitos)",
    hard: "dif\xEDcil (n\xEDvel avan\xE7ado, an\xE1lise e interpreta\xE7\xE3o)",
    extreme: "extremo (n\xEDvel especialista, quest\xF5es de prova real)"
  };
  const diffLabel = difficultyMap[difficulty] || "m\xE9dio";
  const numAlts = parseInt(alternativas) === 4 ? 4 : 5;
  const altKeys = numAlts === 4 ? "A, B, C, D" : "A, B, C, D, E";
  const sessionMap = {
    normal: "Estudo Normal \u2014 quest\xF5es did\xE1ticas",
    concurso: "Simulado \u2014 quest\xF5es no estilo de prova real, sem dicas pedag\xF3gicas",
    revisao: "Revis\xE3o R\xE1pida \u2014 quest\xF5es curtas e objetivas"
  };
  const sessionLabel = sessionMap[sessionMode] || sessionMap.normal;
  const contextBlock = contextResult.sufficient ? `CONTEXTO VERIFICADO (${subjectConfig.label}):
"""
${contextResult.context}
"""

` : "";
  const antiHallucinationRules = `
RESTRI\xC7\xD5ES OBRIGAT\xD3RIAS:
- N\xC3O invente banca, concurso, prova ou ano
- N\xC3O invente artigos de lei ou n\xFAmeros de s\xFAmulas
- Use APENAS conceitos e contexto fornecido
- Cite apenas refer\xEAncias normativas v\xE1lidas: ${subjectConfig.conceptualBases}
- Campo "fonte" deve ser preenchido com base legal/conceitual verificada`;
  const systemText = `Voc\xEA \xE9 um examinador acad\xEAmico especializado em concursos p\xFAblicos. Retorne APENAS JSON v\xE1lido com a chave "questions".
Responda em portugu\xEAs do Brasil.

PRINC\xCDPIOS INEGOCI\xC1VEIS:
- Use APENAS conhecimento fact\xEDcio consolidado
- ${antiHallucinationRules}`;
  const exampleOptions = numAlts === 4 ? `        { "key": "A", "text": "..." },
        { "key": "B", "text": "..." },
        { "key": "C", "text": "..." },
        { "key": "D", "text": "..." }` : `        { "key": "A", "text": "..." },
        { "key": "B", "text": "..." },
        { "key": "C", "text": "..." },
        { "key": "D", "text": "..." },
        { "key": "E", "text": "..." }`;
  const userPrompt = `Modo: ${sessionLabel}

Gere exatamente ${quantity} quest\xE3o(\xF5es) de ${subjectConfig.label} no n\xEDvel ${diffLabel}.
Contexto espec\xEDfico solicitado: ${queryContext || "Nenhum espec\xEDfico."}

${contextBlock}

Tema: ${subjectConfig.label}
Conceitos base: ${subjectConfig.conceptualBases}

Retorne APENAS um objeto JSON:
{
  "questions": [
    {
      "id": 1,
      "statement": "Enunciado da quest\xE3o.",
      "options": [
${exampleOptions}
      ],
      "correctAnswer": "A",
      "explanation": "Explica\xE7\xE3o did\xE1tica e verific\xE1vel.",
      "fonte": "Base legal ou conceitual"
    }
  ]
}

Regras obrigat\xF3rias:
1. Gere exatamente ${numAlts} alternativas usando ${altKeys}
2. Quest\xF5es corretas, sem ambiguidades
3. Distribua gabarito entre as op\xE7\xF5es
4. ${antiHallucinationRules}
5. NENHUM texto fora do JSON`;
  const groqResponse = await callGroqWithFallback(systemText, userPrompt, env, quantity);
  if (!groqResponse.ok) {
    const err = await groqResponse.text();
    let userMessage = "Erro ao conectar com a IA. Tente novamente.";
    if (groqResponse.status === 429) userMessage = "Limite de uso atingido. Aguarde.";
    else if (groqResponse.status === 503) userMessage = "IA com alta demanda. Tente em segundos.";
    return {
      success: false,
      error: "Groq API error",
      details: err,
      userMessage,
      statusCode: groqResponse.status
    };
  }
  const groqData = await groqResponse.json();
  const rawText = extractJsonFromText(groqData?.choices?.[0]?.message?.content || "");
  let questions = [];
  try {
    questions = extractQuestions(JSON.parse(rawText));
  } catch {
    const matchObj = rawText.match(/\{[\s\S]*\}/);
    if (matchObj) {
      try {
        questions = extractQuestions(JSON.parse(matchObj[0]));
      } catch {
      }
    }
  }
  if (questions.length === 0) {
    return {
      success: false,
      error: "Nenhuma quest\xE3o gerada",
      userMessage: "A IA n\xE3o gerou quest\xF5es v\xE1lidas. Tente ajustar filtro ou dificuldade.",
      statusCode: 422
    };
  }
  const validatedQuestions = [];
  for (const q of questions) {
    const validation = validateAgainstHallucination(q, subjectConfig);
    if (!validation.valid) {
      console.warn(`[RAG] Valida\xE7\xE3o falhou para quest\xE3o ${q.id}:`, validation.errors);
      continue;
    }
    const finalQuestion = validation.corrected;
    if (validation.warning) {
      console.warn(`[RAG] Aviso:`, validation.warning);
    }
    
    // FASE 1: Ativar pipeline de validação
    const pipelineCheck = validateQuestionPipeline(
      { matches: [{ score: contextResult.sufficient ? 0.95 : 0.65 }] },
      finalQuestion,
      contextResult.context,
      0.75
    );

    if (pipelineCheck.success) {
      validatedQuestions.push(pipelineCheck.question);
    } else {
      console.warn(`[QUALITY-CHECK] Questão ${finalQuestion.id} rejeitada:`, pipelineCheck.message);
    }
  }
  if (validatedQuestions.length === 0) {
    return {
      success: false,
      error: "Nenhuma quest\xE3o passou na valida\xE7\xE3o",
      userMessage: "Quest\xF5es geradas n\xE3o passaram na valida\xE7\xE3o. Tente novamente.",
      statusCode: 422
    };
  }
  console.log(`[RAG] \u2713 ${validatedQuestions.length} quest\xE3o(\xF5es) gerada(s) e validada(s)`);
  return {
    success: true,
    questions: validatedQuestions,
    metadata: {
      mode: "rag",
      subject: subjectConfig.label,
      vectorizeCollection: subjectConfig.vectorizeCollection,
      contextLength: contextResult.contextLength,
      contextSufficient: contextResult.sufficient,
      sources: contextResult.sources,
      ragScore: contextResult.sufficient ? 0.95 : 0.65,
      qualityProtocol: "active",
      questionsGenerated: validatedQuestions.length,
      questionsApproved: validatedQuestions.length,
      questionsRejected: 0
    },
    statusCode: 200
  };
}
__name(generateConcursosRAGQuestion, "generateConcursosRAGQuestion");
async function generateAcademicRAGQuestion(body, env) {
  const { area, subject, topic, quantity = 1, difficulty, alternativas, idioma, sessionMode } = body;
  console.log("[ACADEMIC-RAG] AREA:", area, "SUBJECT:", subject);
  const areaKey = area ? `academic.${area.toLowerCase().replace(/\s+/g, "_").replace(/^academic\./, "")}` : null;
  if (!areaKey || !ACADEMIC_CONFIG.areas[areaKey]) {
    return {
      success: false,
      error: "INVALID_AREA",
      userMessage: ACADEMIC_CONFIG.invalidAreaMessage(area),
      statusCode: 400
    };
  }
  const areaConfig = ACADEMIC_CONFIG.areas[areaKey];
  console.log(`[ACADEMIC-RAG] \u2713 \xC1rea v\xE1lida: ${areaKey} \u2192 ${areaConfig.vectorizeCollection}`);
  const contextParts = [];
  if (subject) contextParts.push(`Disciplina: ${subject}`);
  if (topic) contextParts.push(`T\xF3pico: ${topic}`);
  const queryContext = contextParts.join(", ");
  const query = queryContext ? `${areaKey} ${queryContext}` : areaKey;
  console.log(`[ACADEMIC-RAG] Query: ${query}`);
  const contextResult = await fetchVectorizeContext(
    env,
    areaConfig.vectorizeCollection,
    query,
    areaConfig.minContextLength
  );
  console.log(
    `[ACADEMIC-RAG] Contexto: ${contextResult.contextLength} chars, Suficiente: ${contextResult.sufficient}`
  );
  
  // FASE 1.2: Validação obrigatória de contextLength com fallback
  if (contextResult.contextLength < areaConfig.minContextLength) {
    console.warn(`[CONTEXT-VALIDATION] Contexto insuficiente: ${contextResult.contextLength} < ${areaConfig.minContextLength}`);
    return {
      success: false,
      error: 'CONTEXT_INSUFFICIENT',
      userMessage: `Material insuficiente para gerar questões confiáveis. O banco de dados contém apenas ${contextResult.contextLength} caracteres de conteúdo sobre este tópico (mínimo necessário: ${areaConfig.minContextLength}). Por favor, forneça mais conteúdo ou refine sua busca.`,
      metadata: {
        contextLength: contextResult.contextLength,
        minRequired: areaConfig.minContextLength,
        sufficient: false,
        fallbackTriggered: true
      },
      statusCode: 422
    };
  }
  
  const difficultyMap = {
    easy: "f\xE1cil (n\xEDvel iniciante, conceitos b\xE1sicos)",
    medium: "m\xE9dio (n\xEDvel intermedi\xE1rio, aplica\xE7\xE3o de conceitos)",
    hard: "dif\xEDcil (n\xEDvel avan\xE7ado, an\xE1lise e interpreta\xE7\xE3o)",
    extreme: "extremo (n\xEDvel especialista, question\xE1rio especializado)"
  };
  const diffLabel = difficultyMap[difficulty] || "m\xE9dio";
  const numAlts = parseInt(alternativas) === 4 ? 4 : 5;
  const altKeys = numAlts === 4 ? "A, B, C, D" : "A, B, C, D, E";
  const sessionMap = {
    normal: "Estudo Normal \u2014 quest\xF5es did\xE1ticas focadas em aprendizado",
    concurso: "Simulado \u2014 quest\xF5es no estilo rigoroso de prova",
    revisao: "Revis\xE3o R\xE1pida \u2014 quest\xF5es curtas e objetivas"
  };
  const sessionLabel = sessionMap[sessionMode] || sessionMap.normal;
  const contextBlock = contextResult.sufficient ? `CONTEXTO VERIFICADO (${areaConfig.label}):
"""
${contextResult.context}
"""

` : "";
  const antiHallucinationRules = `
RESTRI\xC7\xD5ES OBRIGAT\xD3RIAS:
- N\xC3O invente teorias, descobertas ou conceitos n\xE3o comprovados
- Use APENAS fundamentos consolidados e verific\xE1veis
- Cite apenas refer\xEAncias v\xE1lidas: ${areaConfig.conceptualBases}
- Campo "fonte" deve sempre ser preenchido com conceito/teoria verific\xE1vel
- NUNCA cite trabalhos fict\xEDcios, anos inexatos ou autores n\xE3o confirmados`;
  const systemText = `Voc\xEA \xE9 um professor acad\xEAmico especialista em ${areaConfig.label}. Retorne APENAS JSON v\xE1lido com a chave "questions".
Responda em portugu\xEAs do Brasil.

PRINC\xCDPIOS INEGOCI\xC1VEIS:
- Use APENAS conhecimento consolidado e verific\xE1vel
- ${antiHallucinationRules}`;
  const exampleOptions = numAlts === 4 ? `        { "key": "A", "text": "..." },
        { "key": "B", "text": "..." },
        { "key": "C", "text": "..." },
        { "key": "D", "text": "..." }` : `        { "key": "A", "text": "..." },
        { "key": "B", "text": "..." },
        { "key": "C", "text": "..." },
        { "key": "D", "text": "..." },
        { "key": "E", "text": "..." }`;
  const userPrompt = `Modo: ${sessionLabel}

Gere exatamente ${quantity} quest\xE3o(\xF5es) de ${areaConfig.label} no n\xEDvel ${diffLabel}.
${subject ? `Disciplina espec\xEDfica: ${subject}.` : ""}
${topic ? `T\xF3pico espec\xEDfico: ${topic}.` : ""}

${contextBlock}

\xC1rea: ${areaConfig.label}
Conceitos base: ${areaConfig.conceptualBases}

Retorne APENAS um objeto JSON:
{
  "questions": [
    {
      "id": 1,
      "statement": "Enunciado da quest\xE3o.",
      "options": [
${exampleOptions}
      ],
      "correctAnswer": "A",
      "explanation": "Explica\xE7\xE3o clara e verific\xE1vel.",
      "fonte": "Conceito/Teoria consolidado"
    }
  ]
}

Regras obrigat\xF3rias:
1. Gere exatamente ${numAlts} alternativas usando ${altKeys}
2. Quest\xF5es corretas e sem ambiguidades
3. Distribua gabarito entre as op\xE7\xF5es
4. ${antiHallucinationRules}
5. NENHUM texto fora do JSON`;
  const groqResponse = await callGroqWithFallback(systemText, userPrompt, env, quantity);
  if (!groqResponse.ok) {
    const err = await groqResponse.text();
    let userMessage = "Erro ao conectar com a IA. Tente novamente.";
    if (groqResponse.status === 429) userMessage = "Limite de uso atingido. Aguarde.";
    else if (groqResponse.status === 503) userMessage = "IA com alta demanda. Tente em segundos.";
    return {
      success: false,
      error: "Groq API error",
      details: err,
      userMessage,
      statusCode: groqResponse.status
    };
  }
  const groqData = await groqResponse.json();
  const rawText = extractJsonFromText(groqData?.choices?.[0]?.message?.content || "");
  let questions = [];
  try {
    questions = extractQuestions(JSON.parse(rawText));
  } catch {
    const matchObj = rawText.match(/\{[\s\S]*\}/);
    if (matchObj) {
      try {
        questions = extractQuestions(JSON.parse(matchObj[0]));
      } catch {
      }
    }
  }
  if (questions.length === 0) {
    return {
      success: false,
      error: "Nenhuma quest\xE3o gerada",
      userMessage: "A IA n\xE3o gerou quest\xF5es v\xE1lidas. Tente ajustar \xE1rea ou dificuldade.",
      statusCode: 422
    };
  }
  const validateAgainstForbiddenPatterns = /* @__PURE__ */ __name((question, config) => {
    const textToCheck = `${question.statement} ${question.explanation || ""}`.toLowerCase();
    for (const pattern of config.forbiddenPatterns) {
      const regex = new RegExp(pattern, "i");
      if (regex.test(textToCheck)) {
        return {
          valid: false,
          error: `Conte\xFAdo proibido detectado: padr\xE3o "${pattern}" encontrado`
        };
      }
    }
    return { valid: true };
  }, "validateAgainstForbiddenPatterns");
  const validatedQuestions = [];
  for (const q of questions) {
    const patternValidation = validateAgainstForbiddenPatterns(q, areaConfig);
    if (!patternValidation.valid) {
      console.warn(`[ACADEMIC-RAG] Validação de padrões falhou para questão ${q.id}:`, patternValidation.error);
      continue;
    }
    
    // FASE 1: Ativar pipeline de validação
    const pipelineCheck = validateQuestionPipeline(
      { matches: [{ score: contextResult.sufficient ? 0.95 : 0.65 }] },
      q,
      contextResult.context,
      0.75
    );

    if (pipelineCheck.success) {
      validatedQuestions.push(pipelineCheck.question);
    } else {
      console.warn(`[QUALITY-CHECK] Questão ${q.id} rejeitada:`, pipelineCheck.message);
    }
  }
  if (validatedQuestions.length === 0) {
    return {
      success: false,
      error: "Nenhuma quest\xE3o passou na valida\xE7\xE3o",
      userMessage: "Quest\xF5es geradas n\xE3o passaram na valida\xE7\xE3o. Tente novamente.",
      statusCode: 422
    };
  }
  const ragScore = contextResult.sufficient ? 0.95 : 0.65;
  let badge = "\u{1F7E2}";
  if (ragScore < 0.75) badge = "\u{1F534}";
  else if (ragScore < 0.85) badge = "\u{1F7E1}";
  console.log(`[ACADEMIC-RAG] \u2713 ${validatedQuestions.length} quest\xE3o(\xF5es) gerada(s) e validada(s)`);
  return {
    success: true,
    questions: validatedQuestions,
    metadata: {
      mode: "academic",
      area: areaConfig.label,
      subject: subject || "Geral",
      vectorizeCollection: areaConfig.vectorizeCollection,
      contextLength: contextResult.contextLength,
      contextSufficient: contextResult.sufficient,
      sources: contextResult.sources,
      ragScore,
      qualityProtocol: "active",
      badge,
      questionsGenerated: validatedQuestions.length,
      questionsApproved: validatedQuestions.length,
      questionsRejected: 0
    },
    statusCode: 200
  };
}
__name(generateAcademicRAGQuestion, "generateAcademicRAGQuestion");
async function callGroqWithFallback(systemText, userPrompt, env, quantity) {
  const temperature = 0.35;
  const maxTokens = quantity <= 5 ? 2048 : quantity <= 10 ? 4096 : 6144;
  const delays = [0, 2e3, 4e3];
  let lastRes = null;
  for (const model of GROQ_MODELS) {
    for (let i = 0; i < delays.length; i++) {
      if (delays[i] > 0) await new Promise((r) => setTimeout(r, delays[i]));
      lastRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.GROQ_API_KEY}` },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemText },
            { role: "user", content: userPrompt }
          ],
          temperature,
          max_tokens: maxTokens,
          response_format: { type: "json_object" }
        })
      });
      if (lastRes.ok || lastRes.status !== 429 && lastRes.status !== 503) break;
    }
    if (lastRes.ok) return lastRes;
    if (lastRes.status === 401 || lastRes.status === 403) return lastRes;
    if (lastRes.status === 400) {
      const errText = await lastRes.clone().text();
      if (!errText.includes("decommissioned")) return lastRes;
      continue;
    }
  }
  return lastRes;
}
__name(callGroqWithFallback, "callGroqWithFallback");
var worker_default = {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
    if (request.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    const url = new URL(request.url);
    if (url.pathname === "/youtube-transcript" || url.pathname.endsWith("/youtube-transcript")) {
      try {
        const body = await request.json();
        const { youtubeUrl } = body;
        if (!youtubeUrl || typeof youtubeUrl !== "string") {
          return new Response(JSON.stringify({ error: "Campo youtubeUrl ausente ou inv\xE1lido." }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        const videoId = extractYouTubeVideoId(youtubeUrl);
        if (!videoId) {
          return new Response(JSON.stringify({ error: "URL do YouTube inv\xE1lida." }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        const result = await fetchYouTubeTranscript(videoId);
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (err) {
        const isBlocked = err.message.includes("HTTP 429") || err.message.includes("bloqueou a extra\xE7\xE3o");
        return new Response(JSON.stringify({
          error: isBlocked ? "O YouTube bloqueou a extra\xE7\xE3o autom\xE1tica. Por favor, copie a transcri\xE7\xE3o manualmente." : err.message || "Erro ao extrair transcri\xE7\xE3o.",
          isBlocked
        }), {
          status: isBlocked ? 429 : 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }
    if (!env.GROQ_API_KEY) {
      return new Response(JSON.stringify({
        error: "Configura\xE7\xE3o incompleta",
        userMessage: "Configure GROQ_API_KEY nas vari\xE1veis do Worker."
      }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    try {
      const body = await request.json();
      const { topic, subject, area, mode, difficulty, quantity, questionType, concurso, banca, bancaFoco, freeText, editalText, alternativas, idioma, sessionMode, filter } = body;
      if (mode === "concursos" && filter) {
        const ragResult = await generateConcursosRAGQuestion(body, env);
        if (!ragResult.success) {
          return new Response(
            JSON.stringify({
              error: ragResult.error,
              userMessage: ragResult.userMessage,
              details: ragResult.details
            }),
            {
              status: ragResult.statusCode || 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            }
          );
        }
        return new Response(JSON.stringify(ragResult), {
          status: ragResult.statusCode || 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      if (mode === "academic") {
        try {
          const result = await generateAcademicRAGQuestion(body, env);
          if (result.success) {
            return new Response(JSON.stringify(result), {
              status: result.statusCode || 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
          }
        } catch (e) {
          console.error("[ACADEMIC] RAG failed:", e);
        }
        try {
          const context = await fetchContext(area, mode, topic, subject, idioma, env);
          if (context && context.text) {
            console.log("[ACADEMIC] Using fallback with verified context");
          }
        } catch (contextError) {
          console.warn("[ACADEMIC] Context fallback also failed:", contextError);
        }
      }
      const difficultyMap = {
        easy: "f\xE1cil (n\xEDvel iniciante, conceitos b\xE1sicos)",
        medium: "m\xE9dio (n\xEDvel intermedi\xE1rio, aplica\xE7\xE3o de conceitos)",
        hard: "dif\xEDcil (n\xEDvel avan\xE7ado, an\xE1lise e interpreta\xE7\xE3o)",
        extreme: "extremo (n\xEDvel especialista, quest\xF5es de prova real)"
      };
      const diffLabel = difficultyMap[difficulty] || "m\xE9dio";
      const numAlts = questionType === "vf" ? 2 : parseInt(alternativas) === 4 ? 4 : 5;
      const altKeys = numAlts === 4 ? "A, B, C, D" : "A, B, C, D, E";
      const typeMap = { mc: `m\xFAltipla escolha com ${numAlts} alternativas (${altKeys})`, vf: "verdadeiro ou falso (A = Verdadeiro, B = Falso)", mix: `misto \u2014 alternando entre m\xFAltipla escolha com ${numAlts} alternativas (${altKeys}) e verdadeiro/falso` };
      const typeLabel = typeMap[questionType] || typeMap.mc;
      const idiomaMap = { "pt-BR": "portugu\xEAs do Brasil", "en": "English (American)", "es": "espa\xF1ol (castellano)" };
      const idiomaLabel = idiomaMap[idioma] || "portugu\xEAs do Brasil";
      const isPortugues = !idioma || idioma === "pt-BR";
      const sessionMap = { normal: "Estudo Normal \u2014 quest\xF5es did\xE1ticas com foco em aprendizado e fixa\xE7\xE3o de conte\xFAdo", concurso: "Simulado \u2014 quest\xF5es no estilo e rigor de prova real, sem dicas pedag\xF3gicas no enunciado", revisao: "Revis\xE3o R\xE1pida \u2014 quest\xF5es curtas e objetivas para revis\xE3o veloz do conte\xFAdo" };
      const sessionLabel = sessionMap[sessionMode] || sessionMap.normal;
      const bancaEfetiva = bancaFoco && bancaFoco !== "auto" ? bancaFoco : banca || null;
      const bancaStyleMap = { "CEBRASPE": "CEBRASPE/CESPE: assertivas curtas e diretas, estilo certo/errado, com pegadinhas sutis.", "CESPE": "CEBRASPE/CESPE: assertivas curtas e diretas, estilo certo/errado, com pegadinhas sutis.", "CEBRASPE/CESPE": "CEBRASPE/CESPE: assertivas curtas e diretas, estilo certo/errado, com pegadinhas sutis.", "FCC": "FCC: enunciados extensos e formais, quest\xF5es literais baseadas em lei seca.", "VUNESP": "VUNESP: linguagem clara e objetiva, foco em aplica\xE7\xE3o pr\xE1tica.", "FGV": "FGV: enunciados elaborados com casos pr\xE1ticos, quest\xF5es interdisciplinares.", "CESGRANRIO": "CESGRANRIO: quest\xF5es t\xE9cnicas, frequentemente com tabelas e contexto corporativo.", "IDECAN": "IDECAN: quest\xF5es objetivas, foco em lei e doutrina.", "IBFC": "IBFC: quest\xF5es pr\xE1ticas e diretas.", "AOCP": "AOCP: foco em conte\xFAdo program\xE1tico espec\xEDfico.", "FEPESE": "FEPESE: quest\xF5es objetivas, Sul do Brasil." };
      const bancaStyle = bancaEfetiva ? bancaStyleMap[bancaEfetiva] || `Banca ${bancaEfetiva}: siga o estilo t\xEDpico.` : null;
      const areaSafetyInstruction = getAreaSafetyInstruction(area, mode);
      let contextInfo = "";
      let externalContext = null;
      if (mode === "concurso" && concurso) {
        contextInfo = `Concurso: ${concurso}.`;
        if (bancaEfetiva) contextInfo += ` Banca: ${bancaEfetiva}.`;
        if (editalText?.length > 0) contextInfo += `

Conte\xFAdo program\xE1tico do edital:
${editalText.slice(0, 3e3)}`;
        externalContext = await fetchContext(area, mode, topic, subject, idioma, env);
      } else if (mode === "academic") {
        contextInfo = `\xC1rea: ${area}. Disciplina: ${subject}.${topic ? ` T\xF3pico: ${topic}.` : " (Mat\xE9ria completa)"}`;
        externalContext = await fetchContext(area, mode, topic, subject, idioma, env);
      } else if (mode === "livre" && freeText) {
        contextInfo = `Material de estudo fornecido pelo usu\xE1rio:
${freeText.slice(0, 4e3)}`;
      } else {
        const fallback = topic || subject || area || "";
        contextInfo = `T\xF3pico: ${fallback || "Conhecimentos gerais"}.`;
        if (fallback) externalContext = await fetchContext(area, mode, fallback, subject, idioma, env);
      }
      const contextSourceLabel = externalContext?.source || null;
      const isRAG = contextSourceLabel?.includes("Vectorize") || false;
      const rawExternalBlock = externalContext?.text ? isRAG ? `

VADE MECUM VERIFICADO \u2014 PRIORIDADE ABSOLUTA (Fonte: ${externalContext.source}):
"""
${externalContext.text}
"""
FIM DO VADE MECUM.` : `

Contexto verificado (${externalContext.source}):
"""
${externalContext.text}
"""` : "";
      const langInstruction = isPortugues ? "Escreva todas as quest\xF5es, alternativas e explica\xE7\xF5es em portugu\xEAs do Brasil." : `Write all questions, options and explanations in ${idiomaLabel}.`;
      const bancaInstruction = bancaStyle ? `

Estilo de banca obrigat\xF3rio: ${bancaStyle}` : "";
      const sessionInstruction = `
Modo de sess\xE3o: ${sessionLabel}.`;
      const altInstruction = questionType === "vf" ? "Para quest\xF5es V/F, use apenas 2 op\xE7\xF5es: A (Verdadeiro) e B (Falso)." : `Gere exatamente ${numAlts} alternativas por quest\xE3o usando as chaves ${altKeys}.`;
      const isDireitoOuConcurso = area === "Direito" || mode === "concurso";
      const fonteInstruction = isDireitoOuConcurso ? `Para cada quest\xE3o, preencha "fonte" com artigo, s\xFAmula ou decreto.
Formato: "Art. XX, Lei/Ano" ou "S\xFAmula NNN, Tribunal".
NUNCA invente n\xFAmero de artigo ou s\xFAmula.` : 'Para cada quest\xE3o, preencha "fonte" com conceito ou autor de refer\xEAncia. NUNCA deixe vazio.';
      const exampleOptions = numAlts === 4 ? `        { "key": "A", "text": "..." },
        { "key": "B", "text": "..." },
        { "key": "C", "text": "..." },
        { "key": "D", "text": "..." }` : `        { "key": "A", "text": "..." },
        { "key": "B", "text": "..." },
        { "key": "C", "text": "..." },
        { "key": "D", "text": "..." },
        { "key": "E", "text": "..." }`;
      const systemText = `Voc\xEA \xE9 um examinador acad\xEAmico especializado em concursos p\xFAblicos e ensino superior brasileiro. Retorne APENAS JSON v\xE1lido com a chave "questions".
${isPortugues ? "Responda em portugu\xEAs do Brasil." : `Respond entirely in ${idiomaLabel}.`}

PRINC\xCDPIOS INEGOCI\xC1VEIS:
- Use APENAS conhecimento fact\xEDcio consolidado e verificado.
- NUNCA invente leis, artigos, n\xFAmeros, medicamentos, comandos, f\xF3rmulas ou qualquer dado.
- O campo "fonte" de CADA quest\xE3o deve ser preenchido.
- ${areaSafetyInstruction}`;
      const { contextInfo: safeContextInfo, externalBlock } = guardPromptSize(contextInfo, rawExternalBlock, systemText);
      const userPrompt = `Voc\xEA \xE9 um professor especialista em concursos p\xFAblicos e ensino superior brasileiro.${bancaInstruction}${sessionInstruction}

Gere exatamente ${quantity} quest\xF5es de ${typeLabel} sobre:
${safeContextInfo}${externalBlock}

N\xEDvel de dificuldade: ${diffLabel}.

Retorne APENAS um objeto JSON:
{
  "questions": [
    {
      "id": 1,
      "statement": "Enunciado.",
      "options": [
${exampleOptions}
      ],
      "correctAnswer": "A",
      "explanation": "Explica\xE7\xE3o did\xE1tica.",
      "fonte": "Base legal ou conceitual"
    }
  ]
}

Regras:
1. ${altInstruction}
2. Quest\xF5es corretas e sem ambiguidades.
3. Distribua o gabarito entre A-${numAlts === 5 ? "E" : "D"} sem repetir mais de 2x seguidas.
4. ${langInstruction}
5. ${fonteInstruction}
6. NENHUM texto fora do JSON.
7. ${areaSafetyInstruction}`;
      const maxTokens = quantity <= 10 ? 4096 : quantity <= 25 ? 6144 : 8192;
      const temperature = sessionMode === "concurso" ? 0.3 : sessionMode === "revisao" ? 0.25 : 0.4;
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.GROQ_API_KEY}` },
        body: JSON.stringify({
          model: GROQ_MODELS[0],
          messages: [{ role: "system", content: systemText }, { role: "user", content: userPrompt }],
          temperature,
          max_tokens: maxTokens,
          response_format: { type: "json_object" }
        })
      });
      const groqResponse = groqRes.ok ? groqRes : await (async () => {
        const delays = [0, 2e3, 4e3];
        let lastRes = groqRes;
        for (const model of GROQ_MODELS.slice(1)) {
          for (let i = 0; i < delays.length; i++) {
            if (delays[i] > 0) await new Promise((r) => setTimeout(r, delays[i]));
            lastRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.GROQ_API_KEY}` },
              body: JSON.stringify({
                model,
                messages: [{ role: "system", content: systemText }, { role: "user", content: userPrompt }],
                temperature,
                max_tokens: maxTokens,
                response_format: { type: "json_object" }
              })
            });
            if (lastRes.ok || lastRes.status !== 429 && lastRes.status !== 503) break;
          }
          if (lastRes.ok) return lastRes;
          if (lastRes.status === 401 || lastRes.status === 403) return lastRes;
          if (lastRes.status === 400) {
            const errText = await lastRes.clone().text();
            if (!errText.includes("decommissioned")) return lastRes;
            continue;
          }
        }
        return lastRes;
      })();
      if (!groqResponse.ok) {
        const err = await groqResponse.text();
        let userMessage = "Erro ao conectar com a IA. Tente novamente.";
        if (groqResponse.status === 429) userMessage = "Limite de uso da IA atingido. Aguarde e tente novamente.";
        else if (groqResponse.status === 503) userMessage = "A IA est\xE1 com alta demanda. Tente em segundos.";
        else if (groqResponse.status === 401 || groqResponse.status === 403) userMessage = "Chave da API inv\xE1lida. Verifique GROQ_API_KEY.";
        return new Response(JSON.stringify({ error: "Groq API error", details: err, userMessage }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      const groqData = await groqResponse.json();
      const rawText = extractJsonFromText(groqData?.choices?.[0]?.message?.content || "");
      let questions = [];
      try {
        questions = extractQuestions(JSON.parse(rawText));
      } catch {
        const matchObj = rawText.match(/\{[\s\S]*\}/);
        if (matchObj) {
          try {
            questions = extractQuestions(JSON.parse(matchObj[0]));
          } catch {
          }
        }
        if (questions.length === 0) {
          const matchArr = rawText.match(/\[[\s\S]*\]/);
          if (matchArr) {
            try {
              questions = extractQuestions(JSON.parse(matchArr[0]));
            } catch {
            }
          }
        }
      }
      questions = validateQuestions(questions);
      if (questions.length === 0) {
        return new Response(JSON.stringify({
          error: "Resposta vazia",
          rawText,
          userMessage: "A IA n\xE3o gerou quest\xF5es v\xE1lidas. Tente ajustar o t\xF3pico ou dificuldade."
        }), { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ questions }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } catch (err) {
      return new Response(JSON.stringify({
        error: err.message,
        userMessage: "Ocorreu um erro inesperado. Tente novamente."
      }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  }
};

// ../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-wPSdqD/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// ../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-wPSdqD/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.js.map
