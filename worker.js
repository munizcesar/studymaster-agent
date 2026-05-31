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
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:\n - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.\n`
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
    errors.push("explica\xE7\xE3o ausente ou muito curta");
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
      ctx += `\n[${i + 1}] ${title}`;
      if (dates[i]) ctx += ` (${dates[i]})`;
      if (descriptions[i]) ctx += `\n    Ementa: ${descriptions[i]}`;
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
    return `PROTOCOLO VADE M\xCACUM ATIVO:\n- Use APENAS artigos, incisos e par\xE1grafos confirmados no contexto legislativo fornecido.\n- Diplomas v\xE1lidos: CF/88, CC/2002, CP, CPC/2015, CPP, CLT, Lei 8.112/90, Lei 8.666/93, Lei 14.133/21, Lei 9.784/99, CTN, CDC, ECA, Lei 11.340/06, conforme o tema.\n- Se a base n\xE3o trouxer o trecho legal, prefira pergunta conceitual segura e atemporal.\n- Nunca use jurisprud\xEAncia n\xE3o comprovada, numera\xE7\xE3o inventada ou artigo sem fonte.`;
  }
  if (area === "Medicina" || area === "Sa\xFAde") {
    return `PROTOCOLO SA\xDADE ATIVO:\n- Use apenas conceitos consolidados, fisiologia, farmacologia, protocolos amplamente aceitos.\n- Nunca prescreva conduta espec\xEDfica sem respaldo no contexto.\n- Evite drogas, doses e indica\xE7\xF5es se o contexto n\xE3o estiver claramente presente.`;
  }
  if (area === "Exatas") {
    return `PROTOCOLO EXATAS ATIVO:\n- Use apenas f\xF3rmulas, defini\xE7\xF5es e propriedades consagradas.\n- N\xE3o invente constantes, resultados num\xE9ricos ou teoremas.`;
  }
  return `PROTOCOLO ACAD\xCAMICO ATIVO:\n- Use apenas conhecimento consolidado, verific\xE1vel e atemporal.\n- Nunca invente fontes, datas, nomes, estat\xEDsticas ou detalhes n\xE3o sustentados pelo contexto.`;
}
__name(getAreaSafetyInstruction, "getAreaSafetyInstruction");
function getDifficultyLabel(difficulty) {
  if (difficulty === "easy") return "f\xE1cil";
  if (difficulty === "hard") return "dif\xEDcil";
  if (difficulty === "extreme") return "extremo";
  return "m\xE9dio";
}
__name(getDifficultyLabel, "getDifficultyLabel");
function extractJsonFromText(rawText) {
  const firstBrace = rawText.indexOf("{");
  const lastBrace = rawText.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return rawText.slice(firstBrace, lastBrace + 1);
  }
  return rawText.trim();
}
__name(extractJsonFromText, "extractJsonFromText");
async function callGroqWithFallback(systemText, userPrompt, env, quantity) {
  if (!env.GROQ_API_KEY) {
    return {
      ok: false,
      status: 500,
      text: async () => "GROQ_API_KEY não configurado"
    };
  }
  const maxCompletionTokens = quantity > 1 ? 3400 : 2200;
  let lastErr = null;
  for (const model of GROQ_MODELS) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          temperature: 0.15,
          max_completion_tokens: maxCompletionTokens,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemText },
            { role: "user", content: userPrompt }
          ]
        })
      });
      if (response.ok) return response;
      const errText = await response.text();
      lastErr = new Error(`Groq ${model} failed (${response.status}): ${errText}`);
      if (response.status < 500 && response.status !== 429) {
        return {
          ok: false,
          status: response.status,
          text: async () => errText
        };
      }
    } catch (e) {
      lastErr = e;
    }
  }
  return {
    ok: false,
    status: 503,
    text: async () => lastErr?.message || "Falha ao conectar com Groq"
  };
}
__name(callGroqWithFallback, "callGroqWithFallback");
function summarizeQueryContext(topic, extra, prompt) {
  const parts = [topic, extra, prompt].filter(Boolean).join(" ").trim();
  return parts.slice(0, 500);
}
__name(summarizeQueryContext, "summarizeQueryContext");
function validateRAGScore(ragResult, subjectConfig) {
  const minScore = 0.75;
  if (!ragResult?.sources?.length) {
    return {
      valid: false,
      score: 0,
      level: "none",
      reason: "Nenhuma fonte recuperada do Vectorize"
    };
  }
  const sourceScores = ragResult.sources.map((s) => s.score || 0).filter((score) => typeof score === "number");
  if (sourceScores.length === 0) {
    return {
      valid: false,
      score: 0,
      level: "none",
      reason: "Nenhum score válido nas fontes recuperadas"
    };
  }
  const avgScore = sourceScores.reduce((acc, score) => acc + score, 0) / sourceScores.length;
  if (avgScore < minScore) {
    return {
      valid: false,
      score: avgScore,
      level: avgScore >= 0.65 ? "low" : "none",
      reason: `Score médio ${avgScore.toFixed(3)} abaixo do mínimo ${minScore}`
    };
  }
  let qualityLevel = "high";
  if (avgScore < 0.85) qualityLevel = "medium";
  return {
    valid: true,
    score: avgScore,
    level: qualityLevel,
    reason: `Score RAG válido: ${avgScore.toFixed(3)} (mínimo: ${minScore})`
  };
}
__name(validateRAGScore, "validateRAGScore");
function validateQuestionTraceability(question, ragContext, subjectConfig) {
  if (!question?.statement || !ragContext?.context) {
    return {
      valid: false,
      confidence: 0,
      matchedTerms: [],
      reason: "Question statement ou RAG context ausente"
    };
  }
  const stopwords = new Set([
    "de",
    "da",
    "do",
    "das",
    "dos",
    "a",
    "o",
    "e",
    "em",
    "para",
    "com",
    "por",
    "que",
    "se",
    "na",
    "no",
    "nas",
    "nos",
    "um",
    "uma",
    "ao",
    "à",
    "é",
    "são",
    "foi",
    "ser",
    "ter",
    "sobre",
    "segundo",
    "conforme",
    "art",
    "artigo",
    "lei",
    "norma"
  ]);
  const normalize = /* @__PURE__ */ __name((str) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim(), "normalize");
  const questionTerms = normalize(question.statement).split(" ").filter((word) => word.length >= 4 && !stopwords.has(word)).slice(0, 15);
  const contextText = normalize(ragContext.context);
  const matchedTerms = questionTerms.filter((term) => contextText.includes(term));
  const traceabilityScore = questionTerms.length > 0 ? matchedTerms.length / questionTerms.length : 0;
  const isTraceable = traceabilityScore >= 0.4;
  return {
    valid: isTraceable,
    confidence: traceabilityScore,
    matchedTerms: matchedTerms.slice(0, 8),
    reason: isTraceable ? `Rastreabilidade OK: ${matchedTerms.length}/${questionTerms.length} termos encontrados` : `Rastreabilidade insuficiente: apenas ${matchedTerms.length}/${questionTerms.length} termos encontrados`
  };
}
__name(validateQuestionTraceability, "validateQuestionTraceability");
function generateQualityBadge(ragValidation, traceabilityValidation) {
  if (!ragValidation.valid || !traceabilityValidation.valid) {
    return {
      level: "low",
      label: "🔴 Baixa",
      description: "Questão gerada com contexto insuficiente ou baixa rastreabilidade",
      color: "red"
    };
  }
  const avgConfidence = (ragValidation.score + traceabilityValidation.confidence) / 2;
  if (avgConfidence >= 0.85) {
    return {
      level: "high",
      label: "🟢 Alta",
      description: "Questão gerada com excelente qualidade e rastreabilidade",
      color: "green"
    };
  }
  return {
    level: "medium",
    label: "🟡 Média",
    description: "Questão gerada com boa qualidade, mas rastreabilidade moderada",
    color: "yellow"
  };
}
__name(generateQualityBadge, "generateQualityBadge");
function validateQuestionPipeline(question, ragContext, subjectConfig) {
  const hallucinationCheck = validateAgainstHallucination(question, subjectConfig);
  if (!hallucinationCheck.valid) {
    return {
      valid: false,
      question: null,
      qualityBadge: null,
      errors: hallucinationCheck.errors,
      userMessage: "Questão rejeitada por violar regras de segurança anti-alucinação"
    };
  }
  const traceabilityCheck = validateQuestionTraceability(
    hallucinationCheck.corrected,
    ragContext,
    subjectConfig
  );
  const ragValidation = validateRAGScore(ragContext, subjectConfig);
  const qualityBadge = generateQualityBadge(ragValidation, traceabilityCheck);
  if (!traceabilityCheck.valid || !ragValidation.valid) {
    return {
      valid: false,
      question: null,
      qualityBadge,
      errors: [traceabilityCheck.reason, ragValidation.reason],
      userMessage: "Questão rejeitada por baixa qualidade contextual"
    };
  }
  return {
    valid: true,
    question: hallucinationCheck.corrected,
    qualityBadge,
    errors: [],
    traceabilityScore: traceabilityCheck.confidence,
    ragScore: ragValidation.score,
    warning: hallucinationCheck.warning || null
  };
}
__name(validateQuestionPipeline, "validateQuestionPipeline");
function buildContextInsufficientResponse(config, ragValidation) {
  return {
    success: false,
    error: "CONTEXT_INSUFFICIENT",
    userMessage: config.fallbackMessage,
    details: {
      ragScore: ragValidation?.score || 0,
      reason: ragValidation?.reason || "Contexto RAG insuficiente",
      qualityBadge: {
        level: "low",
        label: "🔴 Baixa",
        description: "Base vetorial insuficiente para gerar questão confiável",
        color: "red"
      }
    }
  };
}
__name(buildContextInsufficientResponse, "buildContextInsufficientResponse");
function guardPromptSize(contextInfo, externalBlock, systemText, maxChars = 12e3) {
  const headerLen = systemText.length + 1800;
  const budget = Math.max(2e3, maxChars - headerLen);
  let safeContextInfo = contextInfo || "";
  let safeExternalBlock = externalBlock || "";
  if (safeContextInfo.length > budget * 0.7) {
    safeContextInfo = safeContextInfo.slice(0, Math.floor(budget * 0.7)) + "\n[contexto truncado]";
  }
  if (safeExternalBlock.length > budget * 0.3) {
    safeExternalBlock = safeExternalBlock.slice(0, Math.floor(budget * 0.3)) + "\n[fontes externas truncadas]";
  }
  return { contextInfo: safeContextInfo, externalBlock: safeExternalBlock };
}
__name(guardPromptSize, "guardPromptSize");
async function generateConcursosRAGQuestion({ filter, difficulty, quantity, prompt, extraContext }, env) {
  const filterValidation = validateConcursosFilter(filter);
  if (!filterValidation.valid) {
    return {
      success: false,
      error: "INVALID_FILTER",
      userMessage: filterValidation.userMessage,
      details: filterValidation.error
    };
  }
  const subjectConfig = filterValidation.config;
  const queryContext = summarizeQueryContext(prompt, extraContext, null);
  const ragResult = await fetchVectorizeContext(
    env,
    subjectConfig.vectorizeCollection,
    queryContext || subjectConfig.label,
    subjectConfig.minContextLength
  );
  const ragValidation = validateRAGScore(ragResult, subjectConfig);
  if (!ragValidation.valid) {
    return buildContextInsufficientResponse(CONCURSOS_CONFIG, ragValidation);
  }
  const contextBlock = ragResult.context ? `Contexto recuperado da base vetorial (use como referência principal):\n${ragResult.context}` : "Sem contexto RAG.";
  const antiHallucinationRules = `NUNCA mencione banca, ano de prova, edital, decisão recente ou qualquer informação temporal não presente no contexto.`;
  const sessionLabel = "Concursos";
  const diffLabel = getDifficultyLabel(difficulty);
  const numAlts = 4;
  const altKeys = "A, B, C, D";
  const systemText = `Voc\xEA \xE9 um examinador acad\xEAmico especializado em concursos p\xFAblicos. Retorne APENAS JSON v\xE1lido com a chave "questions".\nResponda em portugu\xEAs do Brasil.\n\nPRINC\xCDPIOS INEGOCI\xC1VEIS:\n- Use APENAS conhecimento fact\xEDcio consolidado\n- JAMAIS mencione pre\xE7os, datas de lan\xE7amento, vers\xF5es espec\xEDficas de software ou qualquer informa\xE7\xE3o vol\xE1til\n- Produza conte\xFAdo evergreen \u2014 v\xE1lido e correto independentemente do momento em que for lido\n- ${antiHallucinationRules}`;
  const exampleOptions = numAlts === 4 ? `        { "key": "A", "text": "..." },\n        { "key": "B", "text": "..." },\n        { "key": "C", "text": "..." },\n        { "key": "D", "text": "..." }` : `        { "key": "A", "text": "..." },\n        { "key": "B", "text": "..." },\n        { "key": "C", "text": "..." },\n        { "key": "D", "text": "..." },\n        { "key": "E", "text": "..." }`;
  const userPrompt = `Modo: ${sessionLabel}\n\nGere exatamente ${quantity} quest\xE3o(\xF5es) de ${subjectConfig.label} no n\xEDvel ${diffLabel}.\nContexto espec\xEDfico solicitado: ${queryContext || "Nenhum espec\xEDfico."}\n\n${contextBlock}\n\nTema: ${subjectConfig.label}\nConceitos base: ${subjectConfig.conceptualBases}\n\nRetorne APENAS um objeto JSON:\n{\n  "questions": [\n    {\n      "id": 1,\n      "statement": "Enunciado da quest\xE3o.",\n      "options": [\n${exampleOptions}\n      ],\n      "correctAnswer": "A",\n      "explanation": "Explica\xE7\xE3o did\xE1tica e verific\xE1vel.",\n      "fonte": "Base legal ou conceitual"\n    }\n  ]\n}\n\nRegras obrigat\xF3rias:\n1. Gere exatamente ${numAlts} alternativas usando ${altKeys}\n2. Quest\xF5es corretas, sem ambiguidades\n3. Distribua gabarito entre as op\xE7\xF5es\n4. DISTRATORES PLAUS\xCDVEIS (FASE 3.2): cada alternativa errada deve ser plaus\xEDvel e coerente com o tema \u2014 n\xE3o invente erros grosseiros ou absurdos\n5. CALIBRAGEM DE DIFICULDADE (FASE 3.3): n\xEDvel "${diffLabel}" \u2014 ${difficulty === "easy" ? "enunciados diretos, conceitos b\xE1sicos, vocabul\xE1rio simples" : difficulty === "hard" ? "an\xE1lise cr\xEDtica, interpreta\xE7\xE3o de casos concretos, distin\xE7\xF5es sutis entre conceitos pr\xF3ximos" : difficulty === "extreme" ? "quest\xF5es de prova real: fatos espec\xEDficos, jurisprud\xEAncia, excep\xE7\xF5es e detalhes normativos" : "aplica\xE7\xE3o de conceitos em situa\xE7\xF5es hipot\xE9ticas"}\n6. ${antiHallucinationRules}\n7. NENHUM texto fora do JSON`;
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
  if (!Array.isArray(questions) || questions.length === 0) {
    return {
      success: false,
      error: "Resposta da IA inválida",
      raw: rawText,
      userMessage: "A IA retornou um formato inesperado. Tente novamente."
    };
  }
  const validQuestions = [];
  const qualityMetrics = [];
  for (const question of questions) {
    const pipelineValidation = validateQuestionPipeline(question, ragResult, subjectConfig);
    if (pipelineValidation.valid) {
      validQuestions.push({
        ...pipelineValidation.question,
        qualityBadge: pipelineValidation.qualityBadge,
        traceabilityScore: pipelineValidation.traceabilityScore,
        ragScore: pipelineValidation.ragScore,
        warning: pipelineValidation.warning
      });
      qualityMetrics.push(pipelineValidation.qualityBadge.level);
    }
  }
  if (validQuestions.length === 0) {
    return buildContextInsufficientResponse(CONCURSOS_CONFIG, ragValidation);
  }
  return {
    success: true,
    questions: validQuestions,
    sources: ragResult.sources,
    metadata: {
      collection: subjectConfig.vectorizeCollection,
      filter,
      ragScore: ragValidation.score,
      qualityDistribution: qualityMetrics,
      totalGenerated: questions.length,
      totalValidated: validQuestions.length
    }
  };
}
__name(generateConcursosRAGQuestion, "generateConcursosRAGQuestion");
async function generateAcademicRAGQuestion({ area, subject, topic, difficulty, quantity, prompt, extraContext }, env) {
  const areaKey = area.startsWith("academic.") ? area : `academic.${area.toLowerCase()}`;
  const areaConfig = ACADEMIC_CONFIG.areas[areaKey];
  if (!areaConfig) {
    return {
      success: false,
      error: "INVALID_AREA",
      userMessage: ACADEMIC_CONFIG.invalidAreaMessage(area),
      details: `Área não mapeada: ${area}`
    };
  }
  const queryContext = summarizeQueryContext(topic, prompt, extraContext || subject);
  const ragResult = await fetchVectorizeContext(
    env,
    areaConfig.vectorizeCollection,
    queryContext || areaConfig.label,
    areaConfig.minContextLength
  );
  const ragValidation = validateRAGScore(ragResult, areaConfig);
  if (!ragValidation.valid) {
    return buildContextInsufficientResponse(ACADEMIC_CONFIG, ragValidation);
  }
  const contextBlock = ragResult.context ? `Contexto recuperado da base vetorial (use como referência principal):\n${ragResult.context}` : "Sem contexto RAG.";
  const antiHallucinationRules = `NUNCA mencione fatos controversos, experimentais, temporais ou não sustentados pelo contexto.`;
  const sessionLabel = "Academic";
  const diffLabel = getDifficultyLabel(difficulty);
  const numAlts = 4;
  const altKeys = "A, B, C, D";
  const systemText = `Voc\xEA \xE9 um professor acad\xEAmico especialista em ${areaConfig.label}. Retorne APENAS JSON v\xE1lido com a chave "questions".\nResponda em portugu\xEAs do Brasil.\n\nPRINC\xCDPIOS INEGOCI\xC1VEIS:\n- Use APENAS conhecimento consolidado e verific\xE1vel\n- JAMAIS mencione pre\xE7os, datas de lan\xE7amento, vers\xF5es espec\xEDficas de software ou qualquer informa\xE7\xE3o vol\xE1til\n- Produza conte\xFAdo evergreen \u2014 v\xE1lido e correto independentemente do momento em que for lido\n- ${antiHallucinationRules}`;
  const exampleOptions = numAlts === 4 ? `        { "key": "A", "text": "..." },\n        { "key": "B", "text": "..." },\n        { "key": "C", "text": "..." },\n        { "key": "D", "text": "..." }` : `        { "key": "A", "text": "..." },\n        { "key": "B", "text": "..." },\n        { "key": "C", "text": "..." },\n        { "key": "D", "text": "..." },\n        { "key": "E", "text": "..." }`;
  const userPrompt = `Modo: ${sessionLabel}\n\nGere exatamente ${quantity} quest\xE3o(\xF5es) de ${areaConfig.label} no n\xEDvel ${diffLabel}.\n${subject ? `Disciplina espec\xEDfica: ${subject}.` : ""}\n${topic ? `T\xF3pico espec\xEDfico: ${topic}.` : ""}\n\n${contextBlock}\n\n\xC1rea: ${areaConfig.label}\nConceitos base: ${areaConfig.conceptualBases}\n\nRetorne APENAS um objeto JSON:\n{\n  "questions": [\n    {\n      "id": 1,\n      "statement": "Enunciado da quest\xE3o.",\n      "options": [\n${exampleOptions}\n      ],\n      "correctAnswer": "A",\n      "explanation": "Explica\xE7\xE3o clara e verific\xE1vel.",\n      "fonte": "Conceito/Teoria consolidado"\n    }\n  ]\n}\n\nRegras obrigat\xF3rias:\n1. Gere exatamente ${numAlts} alternativas usando ${altKeys}\n2. Quest\xF5es corretas e sem ambiguidades\n3. Distribua gabarito entre as op\xE7\xF5es\n4. DISTRATORES PLAUS\xCDVEIS (FASE 3.2): cada alternativa errada deve ser plaus\xEDvel e coerente com o tema \u2014 n\xE3o invente erros grosseiros ou absurdos; use conceitos pr\xF3ximos, excep\xE7\xF5es ou aplica\xE7\xF5es incorretas do mesmo assunto\n5. CALIBRAGEM DE DIFICULDADE (FASE 3.3): n\xEDvel "${diffLabel}" \u2014 ${difficulty === "easy" ? "enunciados diretos, conceitos b\xE1sicos, vocabul\xE1rio acess\xEDvel" : difficulty === "hard" ? "an\xE1lise aprofundada, casos concretos, distin\xE7\xF5es sutis entre conceitos pr\xF3ximos" : difficulty === "extreme" ? "dom\xEDnio especialista: detalhes t\xE9cnicos precisos, excep\xE7\xF5es e nuances da \xE1rea" : "aplica\xE7\xE3o de conceitos em situa\xE7\xF5es pr\xE1ticas hipot\xE9ticas"}\n6. ${antiHallucinationRules}\n7. NENHUM texto fora do JSON`;
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
  if (!Array.isArray(questions) || questions.length === 0) {
    return {
      success: false,
      error: "Resposta da IA inválida",
      raw: rawText,
      userMessage: "A IA retornou um formato inesperado. Tente novamente."
    };
  }
  const validQuestions = [];
  const qualityMetrics = [];
  for (const question of questions) {
    const pipelineValidation = validateQuestionPipeline(question, ragResult, areaConfig);
    if (pipelineValidation.valid) {
      validQuestions.push({
        ...pipelineValidation.question,
        qualityBadge: pipelineValidation.qualityBadge,
        traceabilityScore: pipelineValidation.traceabilityScore,
        ragScore: pipelineValidation.ragScore,
        warning: pipelineValidation.warning
      });
      qualityMetrics.push(pipelineValidation.qualityBadge.level);
    }
  }
  if (validQuestions.length === 0) {
    return buildContextInsufficientResponse(ACADEMIC_CONFIG, ragValidation);
  }
  return {
    success: true,
    questions: validQuestions,
    sources: ragResult.sources,
    metadata: {
      collection: areaConfig.vectorizeCollection,
      area,
      ragScore: ragValidation.score,
      qualityDistribution: qualityMetrics,
      totalGenerated: questions.length,
      totalValidated: validQuestions.length
    }
  };
}
__name(generateAcademicRAGQuestion, "generateAcademicRAGQuestion");
async function handleGetRequest(request, env) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  if (pathname === "/" || pathname === "/health") {
    return new Response(JSON.stringify({
      ok: true,
      service: "StudyMaster Worker",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  return new Response("Not found", { status: 404, headers: corsHeaders });
}
__name(handleGetRequest, "handleGetRequest");
function normalizeQuestionType(questionType) {
  if (questionType === "vf" || questionType === "verdadeiro_falso") return "vf";
  return "mcq";
}
__name(normalizeQuestionType, "normalizeQuestionType");
var worker_default = {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    if (request.method === "GET") {
      return handleGetRequest(request, env);
    }
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    }
    try {
      const body = await request.json();
      const {
        mode = "concurso",
        filter,
        area,
        subject,
        topic,
        difficulty = "medium",
        quantity = 1,
        prompt,
        extraContext,
        questionType = "mcq",
        idioma = "pt-BR"
      } = body || {};

      // FIX: declarar isPortugues no escopo correto do handler (antes do uso em systemText)
      const isPortugues = !idioma || idioma === "pt-BR";

      if (mode === "concurso") {
        const result = await generateConcursosRAGQuestion(
          {
            filter: filter || "concursos.portugues",
            difficulty,
            quantity: Math.min(Math.max(Number(quantity) || 1, 1), 10),
            prompt,
            extraContext
          },
          env
        );
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      if (mode === "academic") {
        const result = await generateAcademicRAGQuestion(
          {
            area: area || "academic.direito",
            subject,
            topic,
            difficulty,
            quantity: Math.min(Math.max(Number(quantity) || 1, 1), 10),
            prompt,
            extraContext
          },
          env
        );
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      const normalizedType = normalizeQuestionType(questionType);
      const quantitySafe = Math.min(Math.max(Number(quantity) || 1, 1), 10);
      const typeLabel = normalizedType === "vf" ? "Verdadeiro/Falso" : "m\xFAltipla escolha";
      const idiomaLabel = idioma === "en" ? "English" : idioma === "es" ? "espa\xF1ol" : "portugu\xEAs do Brasil";
      const areaSafetyInstruction = getAreaSafetyInstruction(area, mode);
      const contextData = await fetchContext(area, mode, topic, subject, idioma, env);
      const contextInfo = contextData?.text || "";
      const sourceInfo = contextData?.source || "Conhecimento acad\xEAmico consolidado";
      const additionalInfo = [prompt, extraContext].filter(Boolean).join("\n").trim();
      const bancaInstruction = mode === "concurso" ? " Priorize estilo claro, objetivo e atemporal. Nunca cite banca/ano sem fonte no contexto." : "";
      const sessionInstruction = quantitySafe > 1 ? " Gere quest\xF5es equilibradas e variadas." : "";
      const altKeys = normalizedType === "vf" ? "A, B" : "A, B, C, D";
      const numAlts = normalizedType === "vf" ? 2 : 4;
      const altInstruction = questionType === "vf" ? "Para quest\xF5es V/F, use apenas 2 op\xE7\xF5es: A (Verdadeiro) e B (Falso)." : `Gere exatamente ${numAlts} alternativas por quest\xE3o usando as chaves ${altKeys}.`;
      const rawExternalBlock = additionalInfo ? `Informações adicionais do usuário (use apenas se compatíveis com o contexto):\n${additionalInfo}` : "";
      const systemText = `Voc\xEA \xE9 um examinador acad\xEAmico especializado em concursos p\xFAblicos e ensino superior brasileiro. Retorne APENAS JSON v\xE1lido com a chave "questions".\n${isPortugues ? "Responda em portugu\xEAs do Brasil." : `Respond entirely in ${idiomaLabel}.`}\n\nPRINC\xCDPIOS INEGOCI\xC1VEIS:\n- Use APENAS conhecimento fact\xEDcio consolidado e verificado.\n- NUNCA invente leis, artigos, n\xFAmeros, medicamentos, comandos, f\xF3rmulas ou qualquer dado.\n- O campo "fonte" de CADA quest\xE3o deve ser preenchido.\n- ${areaSafetyInstruction}`;
      const { contextInfo: safeContextInfo, externalBlock } = guardPromptSize(contextInfo, rawExternalBlock, systemText);
      const userPrompt = `Voc\xEA \xE9 um professor especialista em concursos p\xFAblicos e ensino superior brasileiro.${bancaInstruction}${sessionInstruction}\n\nGere exatamente ${quantitySafe} quest\xF5es de ${typeLabel} sobre:\n- \xC1rea: ${area || mode || "Geral"}\n${subject ? `- Disciplina: ${subject}` : ""}\n${topic ? `- Tópico: ${topic}` : ""}\n- N\xEDvel de dificuldade: ${getDifficultyLabel(difficulty)}\n- Idioma de sa\xEDda: ${idiomaLabel}\n\nContexto confiável (fonte principal):\n${safeContextInfo || "Sem contexto externo recuperado; use apenas conhecimento consolidado e atemporal."}\n\n${externalBlock}\n\nFormato obrigatório de retorno:\n{\n  "questions": [\n    {\n      "id": 1,\n      "statement": "Enunciado da questão",\n      "options": [\n        { "key": "A", "text": "Alternativa A" },\n        { "key": "B", "text": "Alternativa B" },\n        { "key": "C", "text": "Alternativa C" },\n        { "key": "D", "text": "Alternativa D" }\n      ],\n      "correctAnswer": "A",\n      "explanation": "Explicação objetiva e verificável, sem inventar dados.",\n      "fonte": "${sourceInfo}"\n    }\n  ]\n}\n\nREGRAS OBRIGATÓRIAS:\n1. ${altInstruction}\n2. O campo "correctAnswer" deve corresponder exatamente a uma das chaves usadas em "options".\n3. Todas as quest\xF5es devem ter "explanation" e "fonte".\n4. A explicação deve justificar por que a correta é correta, sem repetir o enunciado.\n5. Use contexto confiável; se faltar base, faça pergunta conceitual segura e atemporal.\n6. NENHUM texto fora do JSON.\n7. N\xE3o use markdown, cercas de c\xF3digo ou coment\xE1rios.`;
      const groqResponse = await callGroqWithFallback(systemText, userPrompt, env, quantitySafe);
      if (!groqResponse.ok) {
        const err = await groqResponse.text();
        let userMessage = "Erro ao conectar com a IA. Tente novamente.";
        if (groqResponse.status === 429) userMessage = "Limite de uso atingido. Aguarde.";
        else if (groqResponse.status === 503) userMessage = "IA com alta demanda. Tente em segundos.";
        return new Response(JSON.stringify({
          success: false,
          error: "Groq API error",
          details: err,
          userMessage,
          statusCode: groqResponse.status
        }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      const groqData = await groqResponse.json();
      const rawText = extractJsonFromText(groqData?.choices?.[0]?.message?.content || "");
      let parsed;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        const matchObj = rawText.match(/\{[\s\S]*\}/);
        if (matchObj) {
          try {
            parsed = JSON.parse(matchObj[0]);
          } catch {
            parsed = null;
          }
        }
      }
      const questions = validateQuestions(extractQuestions(parsed || {}));
      if (!questions.length) {
        return new Response(JSON.stringify({
          success: false,
          error: "Resposta da IA inválida",
          raw: rawText,
          userMessage: "A IA retornou um formato inesperado. Tente novamente."
        }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      return new Response(JSON.stringify({
        success: true,
        questions
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error?.message || "Erro interno"
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
};
export {
  worker_default as default
};
