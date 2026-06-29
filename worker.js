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
    "concursos.direito_penal": {
      label: "Direito Penal",
      description: "Teoria do crime, crimes contra a pessoa, patrimônio, administração pública e processo penal",
      vectorizeCollection: "concursos_direito_penal",
      minContextLength: 300,
      forbiddenPatterns: [
        "banca\\s+\\w+\\s+decidiu",
        "edital\\s+de\\s+\\d{4}",
        "prova\\s+(real|espec\\xEDfica)",
        "ano\\s+de\\s+\\d{4}",
        "julgado\\s+em"
      ],
      conceptualBases: "CP, CPP, teoria geral do crime, crimes contra a pessoa, patrimônio, administração pública"
    },
    "concursos.direito_processual_civil": {
      label: "Direito Processual Civil",
      description: "Jurisdição, ação, tutelas, recursos e execução civil",
      vectorizeCollection: "concursos_direito_processual_civil",
      minContextLength: 300,
      forbiddenPatterns: [
        "banca\\s+\\w+\\s+decidiu",
        "edital\\s+de\\s+\\d{4}",
        "prova\\s+(real|espec\\xEDfica)",
        "ano\\s+de\\s+\\d{4}",
        "julgado\\s+em"
      ],
      conceptualBases: "CPC, CF/88, STF/STJ, jurisdição, ação, recursos e execução civil"
    },
    "concursos.direito_processual_penal": {
      label: "Direito Processual Penal",
      description: "Procedimento penal, ação penal, prova, recursos e execução penal",
      vectorizeCollection: "concursos_direito_processual_penal",
      minContextLength: 300,
      forbiddenPatterns: [
        "banca\\s+\\w+\\s+decidiu",
        "edital\\s+de\\s+\\d{4}",
        "prova\\s+(real|espec\\xEDfica)",
        "ano\\s+de\\s+\\d{4}",
        "julgado\\s+em"
      ],
      conceptualBases: "CPP, CF/88, STF/STJ, provas penais, nulidades e execução penal"
    },
    "concursos.direito_tributario": {
      label: "Direito Tributário",
      description: "Sistema tributário, princípios, impostos, lançamento fiscal e execução tributária",
      vectorizeCollection: "concursos_direito_tributario",
      minContextLength: 300,
      forbiddenPatterns: [
        "banca\\s+\\w+\\s+decidiu",
        "edital\\s+de\\s+\\d{4}",
        "prova\\s+(real|espec\\xEDfica)",
        "ano\\s+de\\s+\\d{4}",
        "julgado\\s+em"
      ],
      conceptualBases: "CF/88, CTN, Lei 9.430/96, lançamento tributário, execução fiscal"
    },
    "concursos.direito_civil": {
      label: "Direito Civil",
      description: "Contratos, responsabilidade civil, direitos reais, família e sucessões",
      vectorizeCollection: "concursos_direito_civil",
      minContextLength: 300,
      forbiddenPatterns: [
        "banca\\s+\\w+\\s+decidiu",
        "edital\\s+de\\s+\\d{4}",
        "prova\\s+(real|espec\\xEDfica)",
        "ano\\s+de\\s+\\d{4}",
        "julgado\\s+em"
      ],
      conceptualBases: "CC/2002, contratos, responsabilidade civil, família, sucessões"
    },
    "concursos.direito_trabalhista": {
      label: "Direito Trabalhista",
      description: "Direitos do trabalhador, contrato de trabalho, jornada, rescisão e Justiça do Trabalho",
      vectorizeCollection: "concursos_direito_trabalhista",
      minContextLength: 300,
      forbiddenPatterns: [
        "banca\\s+\\w+\\s+decidiu",
        "edital\\s+de\\s+\\d{4}",
        "prova\\s+(real|espec\\xEDfica)",
        "ano\\s+de\\s+\\d{4}",
        "julgado\\s+em"
      ],
      conceptualBases: "CLT, CF/88, TST, MP 1100, rescisão, direitos trabalhistas"
    },
    "concursos.legislacao_especifica": {
      label: "Legislação Específica",
      description: "Leis de servidores, improbidade, acesso à informação, licitações e compliance",
      vectorizeCollection: "concursos_legislacao_especifica",
      minContextLength: 250,
      forbiddenPatterns: [
        "banca\\s+\\w+\\s+decidiu",
        "edital\\s+de\\s+\\d{4}",
        "prova\\s+(real|espec\\xEDfica)",
        "ano\\s+de\\s+\\d{4}",
        "julgado\\s+em"
      ],
      conceptualBases: "Lei 8.666/93, Lei 14.133/21, Lei 8.429/92, Lei 12.527/11, compliance"
    },
    "concursos.atualidades": {
      label: "Atualidades",
      description: "Economia, política, tecnologia, meio ambiente e políticas públicas recentes",
      vectorizeCollection: "concursos_atualidades",
      minContextLength: 200,
      forbiddenPatterns: [
        "banca\\s+\\w+\\s+decidiu",
        "edital\\s+de\\s+\\d{4}",
        "prova\\s+(real|espec\\xEDfica)",
        "ano\\s+de\\s+\\d{4}",
        "julgado\\s+em"
      ],
      conceptualBases: "Panorama político-econômico, políticas públicas, governo digital, sustentabilidade"
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
  collectionToFilter: {
    "concursos_portugues": "concursos.portugues",
    "concursos_direito_constitucional": "concursos.direito_constitucional",
    "concursos_direito_administrativo": "concursos.direito_administrativo",
    "concursos_direito_penal": "concursos.direito_penal",
    "concursos_direito_processual_civil": "concursos.direito_processual_civil",
    "concursos_direito_processual_penal": "concursos.direito_processual_penal",
    "concursos_direito_tributario": "concursos.direito_tributario",
    "concursos_direito_civil": "concursos.direito_civil",
    "concursos_direito_trabalhista": "concursos.direito_trabalhista",
    "concursos_legislacao_especifica": "concursos.legislacao_especifica",
    "concursos_atualidades": "concursos.atualidades",
    "concursos_rlm": "concursos.raciocinio_logico",
    "concursos_informatica": "concursos.informatica",
    "concursos_adm_publica": "concursos.administracao_publica"
  },
  fallbackMessage: "Desculpe, ainda n\xE3o temos base de dados suficiente para esta mat\xE9ria. Tente novamente em breve!",
  invalidFilterMessage: /* @__PURE__ */ __name((filter) => `O filtro "${filter}" n\xE3o foi reconhecido. Escolha uma das mat\xE9rias dispon\xEDveis: Portugu\xEAs, Direito Constitucional, Direito Administrativo, Direito Penal, Direito Processual Civil, Direito Processual Penal, Direito Tribut\xE1rio, Direito Civil, Direito Trabalhista, Legisla\xE7\xE3o Espec\xEDfica, Atualidades, Racioc\xEDnio L\xF3gico, Inform\xE1tica ou Administra\xE7\xE3o P\xFAblica.`, "invalidFilterMessage")
};
var ACADEMIC_CONFIG = {
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
  collectionToArea: {
    "academic_direito": "academic.direito",
    "academic_medicina": "academic.medicina",
    "academic_historia": "academic.historia",
    "academic_exatas": "academic.exatas",
    "academic_humanas": "academic.humanas",
    "academic_saude": "academic.saude",
    "academic_negocios": "academic.negocios"
  },
  fallbackMessage: "Desculpe, ainda n\xE3o temos base de dados suficiente para esta \xE1rea. Tente novamente em breve!",
  invalidAreaMessage: /* @__PURE__ */ __name((area) => `A \xE1rea "${area}" n\xE3o foi reconhecida. Escolha uma das dispon\xEDveis: Direito, Medicina, Hist\xF3ria, Exatas, Humanas, Sa\xFAde ou Neg\xF3cios.`, "invalidAreaMessage")
};
var GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "llama3-8b-8192",
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
    if (!env.KNOWLEDGE_INDEX) {
      console.warn(`[RAG] KNOWLEDGE_INDEX não configurado. Retornando contexto vazio.`);
      return { context: "", sufficient: false, sources: [], contextLength: 0 };
    }
    // ── KV CACHE LOOKUP ──
    // Gera chave de cache baseada na coleção + query para evitar reprocessar o mesmo RAG
    let cacheKey = null;
    if (env.RAG_CACHE) {
      try {
        const queryHash = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(query.slice(0, 200))).then(h => {
          return Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
        });
        cacheKey = `rag:${collection}:${queryHash}`;
        const cached = await env.RAG_CACHE.get(cacheKey, "json");
        if (cached && typeof cached === "object" && cached.context !== undefined) {
          console.log(`[RAG] Cache HIT: ${cacheKey} — ${cached.sources?.length || 0} fontes`);
          return cached;
        }
      } catch (cacheErr) {
        console.warn(`[RAG] Erro ao ler cache KV: ${cacheErr.message}`);
      }
    }
    console.log(`[RAG] Cache MISS: ${cacheKey || 'sem cache'} — consultando Vectorize`);
    let embedding;
    try {
      if (!env.AI) {
        console.warn(`[RAG] CF AI não disponível. Retornando contexto vazio.`);
        return { context: "", sufficient: false, sources: [], contextLength: 0 };
      }
      // ── EMBEDDING CACHE ──
      // Cacheia o vetor de embedding (1024 floats) para evitar chamadas repetidas ao AI.run
      let embKey = null;
      if (env.RAG_CACHE && cacheKey) {
        embKey = `emb:${query.slice(0, 200)}`;
        try {
          const queryHash = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(embKey)).then(h => {
            return Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
          });
          embKey = `emb:${queryHash}`;
          const cachedEmb = await env.RAG_CACHE.get(embKey, "json");
          if (cachedEmb && Array.isArray(cachedEmb) && cachedEmb.length === 1024) {
            console.log(`[RAG] Embedding cache HIT: ${embKey}`);
            embedding = cachedEmb;
          }
        } catch (embCacheErr) {
          console.warn(`[RAG] Erro ao ler cache de embedding: ${embCacheErr.message}`);
        }
      }
      if (!embedding) {
        const embeddingRes = await env.AI.run("@cf/baai/bge-m3", { text: [query.slice(0, 512)] });
        const vector = embeddingRes?.data?.[0];
        if (!vector || !Array.isArray(vector)) {
          console.warn(`[RAG] Embedding inválido. Retornando contexto vazio.`);
          return { context: "", sufficient: false, sources: [], contextLength: 0 };
        }
        embedding = vector;
        // Armazena embedding no cache
        if (embKey && env.RAG_CACHE) {
          try {
            await env.RAG_CACHE.put(embKey, JSON.stringify(embedding), { expirationTtl: 7200 });
            console.log(`[RAG] Embedding cache STORE: ${embKey}`);
          } catch (storeErr) {
            console.warn(`[RAG] Erro ao salvar cache de embedding: ${storeErr.message}`);
          }
        }
      }
    } catch (e) {
      console.warn(`[RAG] Erro ao gerar embedding: ${e.message}`);
      return { context: "", sufficient: false, sources: [], contextLength: 0 };
    }
    let results;
    try {
      results = await env.KNOWLEDGE_INDEX.query(embedding, {
        namespace: collection,
        topK: 5,
        returnMetadata: true
      });
    } catch (e) {
      console.warn(`[RAG] Erro ao buscar Vectorize: ${e.message}`);
      return { context: "", sufficient: false, sources: [], contextLength: 0 };
    }
    if (!results?.matches?.length) {
      return { context: "", sufficient: false, sources: [], contextLength: 0 };
    }
    const documents = results.matches.filter((m) => m.score >= 0.50).slice(0, 4).map((m) => ({
      text: m.metadata?.text || m.text || "",
      source: m.metadata?.source || "Acervo de Concursos",
      score: m.score
    })).filter((d) => d.text.trim().length > 0);
    if (documents.length === 0) {
      return { context: "", sufficient: false, sources: [], contextLength: 0 };
    }
    const context = documents.map((d) => d.text).join("\n\n");
    const sufficient = context.length >= minLength;
    const result = {
      context,
      sufficient,
      sources: documents.map((d) => ({ text: d.text.slice(0, 100), source: d.source, score: d.score })),
      contextLength: context.length
    };
    // ── KV CACHE STORE ──
    // Armazena resultado no KV com TTL de 1 hora para evitar consultas repetidas ao Vectorize
    if (cacheKey && env.RAG_CACHE) {
      try {
        await env.RAG_CACHE.put(cacheKey, JSON.stringify(result), { expirationTtl: 7200 });
        console.log(`[RAG] Cache STORE: ${cacheKey} — TTL 7200s`);
      } catch (storeErr) {
        console.warn(`[RAG] Erro ao salvar cache KV: ${storeErr.message}`);
      }
    }
    return result;
  } catch (e) {
    console.error(`[RAG] Erro geral em fetchVectorizeContext: ${e.message}`);
    return { context: "", sufficient: false, sources: [], contextLength: 0 };
  }
}
__name(fetchVectorizeContext, "fetchVectorizeContext");

// ── FALLBACK INTELIGENTE — usa LLM knowledge quando RAG insuficiente ──────────
async function generateWithoutRAG(area, mode, topic, subject, difficulty, quantity, idioma, filterConfig, env, banca) {
  const diffLabel = getDifficultyLabel(difficulty);
  const diffInstruction = getDifficultyInstruction(difficulty);
  const safetyInstruction = getAreaSafetyInstruction(area, mode);
  const lang = !idioma || idioma === "pt-BR" ? "português do Brasil" : idioma;
  const isCespe = banca && (banca.toLowerCase() === 'cespe' || banca.toLowerCase() === 'cebraspe');
  const altKeys = isCespe ? ["C", "E"] : ["A", "B", "C", "D", "E"];
  const altKeysStr = altKeys.join(", ");

  const systemPrompt = `Você é um professor especialista em ${area} gerando questões para ${
    mode === "concurso" ? "concurso público" : "uso acadêmico"
  }.

${safetyInstruction}

REGRAS ABSOLUTAS (sem RAG disponível):
- Use APENAS conhecimento consolidado, amplamente aceito e verificável
- Para Direito: cite apenas artigos da CF/88, CC/2002, CP, CPC/2015, Lei 8.112/90, Lei 8.666/93, Lei 14.133/21 que você conhece com certeza
- Para Informática: cite apenas conceitos técnicos padronizados (ISO, RFC, OWASP)
- Para Português: use apenas regras gramaticais da norma culta (VOLP, ABNT)
- NUNCA invente artigos, números, datas, nomes ou estatísticas
- Se não tiver certeza de um detalhe específico, reformule para questão conceitual segura
- Questões devem ser atemporais — válidas independente do ano

Responda em ${lang}.`;

  const optionExplanationsExample = buildOptionExplanationsSchema(altKeys);
  const optionsExampleText = isCespe
    ? `        {"key": "C", "text": "Certo"},
        {"key": "E", "text": "Errado"}`
    : `        {"key": "A", "text": "alternativa A"},
        {"key": "B", "text": "alternativa B"},
        {"key": "C", "text": "alternativa C"},
        {"key": "D", "text": "alternativa D"},
        {"key": "E", "text": "alternativa E"}`;
  const userPrompt = `Gere ${quantity} questão(ões) ${isCespe ? "no estilo CESPE (Certo/Errado)" : "de múltipla escolha"} sobre:
Área: ${area}
${topic ? `Tópico: ${topic}` : ""}
${subject ? `Assunto: ${subject}` : ""}
Dificuldade: ${diffLabel} — ${diffInstruction}
${isCespe ? "\nATENÇÃO: Use EXATAMENTE 2 alternativas: C (Certo) e E (Errado). NUNCA use A/B.\n" : ""}

FORMATO JSON obrigatório:
{
  "questions": [
    {
      "statement": "enunciado completo",
      "options": [
${optionsExampleText}
      ],
      "correctAnswer": "C",
      "explanation": "explicação detalhada da resposta correta e por que a(s) demais estão erradas",
      "optionExplanations": ${optionExplanationsExample},
      "fonte": "Base legal ou conceitual utilizada",
      "difficulty": "${difficulty}",
      "area": "${area}"
    }
  ]
}`;

  const res = await callGroqWithFallback(systemPrompt, userPrompt, env, quantity);
  if (!res.ok) throw new Error(`Groq fallback falhou: ${res.status}`);
  const raw = await res.text();
  const data = JSON.parse(raw);
  const content = data.choices?.[0]?.message?.content || "";
  const jsonStr = extractJsonFromText(content);
  const parsed = JSON.parse(jsonStr);
  return extractQuestions(parsed);
}
__name(generateWithoutRAG, "generateWithoutRAG");
function validateAgainstHallucination(question, subjectConfig, isCespe) {
  const errors = [];
  if (!question.statement || question.statement.trim().length < 20) {
    errors.push("statement: enunciado ausente ou muito curto");
  }
  if (!Array.isArray(question.options) || question.options.length < (isCespe ? 2 : 4)) {
    errors.push("options: deve ter " + (isCespe ? "2 alternativas (C/E)" : "4-5 alternativas"));
  }
  if (!question.correctAnswer || !(isCespe ? ["C", "E"] : ["A", "B", "C", "D", "E"]).includes(question.correctAnswer)) {
    errors.push("correctAnswer: deve ser " + (isCespe ? "C ou E" : "A-E"));
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
    const queryOptions = { topK: 8, returnMetadata: true };
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
  const isDireito = area === "Direito"; // [FIX] Restrito: só ativa bloco jurídico quando área é explicitamente Direito
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
function getDifficultyInstruction(difficulty) {
  if (difficulty === "easy") return "enunciados diretos, conceitos básicos, vocabulário simples e acessível";
  if (difficulty === "hard") return "análise crítica, interpretação de casos concretos, distinções sutis entre conceitos próximos";
  if (difficulty === "extreme") return "domínio especialista: fatos precisos, exceções normativas, detalhes técnicos e nuances da área";
  return "aplicação de conceitos em situações hipotéticas de complexidade moderada";
}
__name(getDifficultyInstruction, "getDifficultyInstruction");
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
  const maxCompletionTokens = quantity > 1 ? 4200 : 2800;
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
function validateRAGScore(ragResult, subjectConfig) {    const minScore = 0.55;
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
        level: avgScore >= 0.40 ? "low" : "none",
        reason: `Score médio ${avgScore.toFixed(3)} abaixo do mínimo ${minScore}`
      };
    }
    let qualityLevel = "high";
    if (avgScore < 0.75) qualityLevel = "medium";
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
    "de", "da", "do", "das", "dos", "a", "o", "e", "em", "para", "com", "por",
    "que", "se", "na", "no", "nas", "nos", "um", "uma", "ao", "à", "é", "são",
    "foi", "ser", "ter", "sobre", "segundo", "conforme", "art", "artigo", "lei", "norma"
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
function validateQuestionPipeline(question, ragContext, subjectConfig, isCespe) {
  const hallucinationCheck = validateAgainstHallucination(question, subjectConfig, isCespe);
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
    warning: hallucinationCheck.warning || null,
    chunks: ragValidation.chunks || 0
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

// ── FASE 3.6: Schema de optionExplanations ──────────────────────────────────
// Bloco de exemplo JSON para o campo optionExplanations (reutilizado nos 3 fluxos)
function buildOptionExplanationsSchema(altKeys) {
  const lines = altKeys.map(k => `        "${k}": "Por que a alternativa ${k} está correta/incorreta."`).join(",\n");
  return `{\n${lines}\n      }`;
}
__name(buildOptionExplanationsSchema, "buildOptionExplanationsSchema");

async function generateConcursosRAGQuestion({ filter, difficulty, quantity, prompt, extraContext, banca, questionType }, env) {
  // [FIX] Log explícito dos parâmetros recebidos antes de qualquer processamento
  console.log(`[RAG] Recebido filter=${filter} difficulty=${difficulty} quantity=${quantity}`);
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
  // Garante que o label da matéria sempre está na query para o Vectorize
  const queryContext = summarizeQueryContext(`${subjectConfig.label} ${subjectConfig.description}`, prompt, extraContext);
  console.log(`[RAG] Matéria: ${filter} → Coleção: ${subjectConfig.vectorizeCollection} | Query: ${queryContext}`);
  const ragResult = await fetchVectorizeContext(
    env,
    subjectConfig.vectorizeCollection,
    queryContext,
    subjectConfig.minContextLength
  );
  const ragValidation = validateRAGScore(ragResult, subjectConfig);
  // FALLBACK INTELIGENTE — quando RAG insuficiente, usa LLM knowledge + safety protocols
  if (!ragValidation.valid) {
    console.log(`[RAG] Contexto insuficiente (score: ${ragValidation.score?.toFixed(3) || 0}, razão: ${ragValidation.reason}). Usando fallback LLM.`);
    try {
      const fbArea = subjectConfig.label || filter || "Concursos";
      const fbQuestions = await generateWithoutRAG(
        fbArea, "concurso", null, fbArea, difficulty, quantity, "pt-BR", CONCURSOS_CONFIG, env, banca
      );
      if (fbQuestions && fbQuestions.length > 0) {
        const validFb = validateQuestions(fbQuestions);
        if (validFb.length > 0) {
          return {
            success: true,
            questions: validFb.map(q => ({
              ...q,
              qualityBadge: { level: "medium", label: "🟡 Média", description: "Questão gerada via LLM sem RAG", color: "yellow" },
              ragFallback: true
            })),
            sources: [],
            metadata: {
              collection: subjectConfig.vectorizeCollection,
              filter,
              ragScore: 0,
              ragFallback: true,
              fallbackReason: ragValidation.reason,
              totalGenerated: fbQuestions.length,
              totalValidated: validFb.length
            }
          };
        }
      }
    } catch (fbErr) {
      console.error(`[RAG] Fallback LLM falhou: ${fbErr.message}`);
    }
    return buildContextInsufficientResponse(CONCURSOS_CONFIG, ragValidation);
  }
  const contextBlock = ragResult.context ? `Contexto recuperado da base vetorial (use como referência principal):\n${ragResult.context}` : "Sem contexto RAG.";
  const antiHallucinationRules = `NUNCA mencione banca, ano de prova, edital, decisão recente ou qualquer informação temporal não presente no contexto.`;
  const sessionLabel = "Concursos";
  const diffLabel = getDifficultyLabel(difficulty);
  const isCespe = banca && (banca.toLowerCase() === 'cespe' || banca.toLowerCase() === 'cebraspe');
  const numAlts = isCespe ? 2 : 4;
  const altKeys = isCespe ? ["C", "E"] : ["A", "B", "C", "D"];
  const altKeysStr = altKeys.join(", ");
  const optionExplanationsExample = buildOptionExplanationsSchema(altKeys);
  const systemText = `Você é um examinador acadêmico especializado em concursos públicos. Retorne APENAS JSON válido com a chave "questions".\nResponda em português do Brasil.\n\nPRINCÍPIOS INEGOCIÁVEIS:\n- Use APENAS conhecimento factício consolidado\n- JAMAIS mencione preços, datas de lançamento, versões específicas de software ou qualquer informação volátil\n- Produza conteúdo evergreen — válido e correto independentemente do momento em que for lido\n- ${antiHallucinationRules}\n\n🔴 INSTRUÇÃO CRÍTICA - LEIA COM ATENÇÃO:\nTODAS as questões DEVEM ser EXCLUSIVAMENTE sobre: ${subjectConfig.label}\nNÃO gere questões de outra disciplina, matéria ou assunto.\nCada enunciado deve estar claramente alinhado APENAS com ${subjectConfig.label}.`;
  const exampleOptions = isCespe
    ? `        { "key": "C", "text": "Certo" },\n        { "key": "E", "text": "Errado" }`
    : `        { "key": "A", "text": "..." },\n        { "key": "B", "text": "..." },\n        { "key": "C", "text": "..." },\n        { "key": "D", "text": "..." }`;
  const cespeInstruction = isCespe ? "\nPara questoes estilo CESPE/Cebraspe: use EXATAMENTE C (Certo) e E (Errado) como chaves - nunca A/B.\nNUNCA use numeracao ou texto extra nas alternativas - apenas C ou E (sem aspas).\n" : "";
  const userPrompt = `Modo: ${sessionLabel}\n\nGere exatamente ${quantity} questão(ões) de ${subjectConfig.label} no nível ${diffLabel}.\nContexto específico solicitado: ${queryContext || "Nenhum específico."}\n\n${contextBlock}\n\nTema: ${subjectConfig.label}\nConceitos base: ${subjectConfig.conceptualBases}${cespeInstruction}\n\nRetorne APENAS um objeto JSON:\n{\n  "questions": [\n    {\n      "id": 1,\n      "statement": "Enunciado da questão.",\n      "options": [\n${exampleOptions}\n      ],\n      "correctAnswer": "C",\n      "explanation": "Explicação didática e verificável da resposta correta.",\n      "optionExplanations": ${optionExplanationsExample},\n      "fonte": "Base legal ou conceitual"\n    }\n  ]\n}\n\nRegras obrigatórias:\n1. Gere exatamente ${numAlts} alternativas usando ${altKeysStr}\n2. Questões corretas, sem ambiguidades\n3. Distribua gabarito entre as opções\n4. DISTRATORES PLAUSÍVEIS (FASE 3.2): cada alternativa errada deve ser plausível e coerente com o tema — não invente erros grosseiros ou absurdos\n5. CALIBRAGEM DE DIFICULDADE (FASE 3.3): nível "${diffLabel}" — ${getDifficultyInstruction(difficulty)}\n6. EXPLICAÇÃO POR ALTERNATIVA (FASE 3.6): preencha "optionExplanations" com uma frase curta (1-2 linhas) explicando por que cada alternativa está correta ou incorreta\n7. ${antiHallucinationRules}\n8. NENHUM texto fora do JSON`;
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
    const pipelineValidation = validateQuestionPipeline(question, ragResult, subjectConfig, isCespe);
    if (pipelineValidation.valid) {
      validQuestions.push({
        ...pipelineValidation.question,
        qualityBadge: pipelineValidation.qualityBadge,
        traceabilityScore: pipelineValidation.traceabilityScore,
        ragScore: pipelineValidation.ragScore,
        warning: pipelineValidation.warning,
        _sources: pipelineValidation.chunks || 1,
        _antiHallucination: pipelineValidation.warning ? 'warning' : 'verified'
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
// [FIX] Mapa explícito: nomes legíveis do frontend → chaves internas do ACADEMIC_CONFIG
// Necessário porque nomes com acentos (Saúde, Negócios, História) não normalizam
// corretamente via toLowerCase() — "Saúde".toLowerCase() = "saúde" ≠ "saude".
const AREA_NAME_TO_KEY = {
  "direito":    "academic.direito",
  "medicina":   "academic.medicina",
  "história":   "academic.historia",
  "historia":   "academic.historia",
  "exatas":     "academic.exatas",
  "humanas":    "academic.humanas",
  "saúde":      "academic.saude",
  "saude":      "academic.saude",
  "negócios":   "academic.negocios",
  "negocios":   "academic.negocios",
  "tecnologia": "academic.exatas",   // fallback: não existe academic.tecnologia — usa exatas
};
async function generateAcademicRAGQuestion({ area, subject, topic, difficulty, quantity, prompt, extraContext }, env) {
  // [FIX] Resolução de chave: prefixado > mapa explícito > lowercase direto
  let areaKey;
  if (area.startsWith("academic.")) {
    areaKey = area;
  } else {
    areaKey = AREA_NAME_TO_KEY[area.toLowerCase()] || `academic.${area.toLowerCase()}`;
  }
  console.log(`[RAG] Area recebida: "${area}" → chave resolvida: "${areaKey}"`);
  const areaConfig = ACADEMIC_CONFIG.areas[areaKey];
  if (!areaConfig) {
    return {
      success: false,
      error: "INVALID_AREA",
      userMessage: ACADEMIC_CONFIG.invalidAreaMessage(area),
      details: `Área não mapeada: ${area}`
    };
  }
  const queryContext = summarizeQueryContext(`${areaConfig.label} ${areaConfig.description}`, topic || subject, prompt || extraContext);
  console.log(`[RAG] Área: ${areaKey} → Coleção: ${areaConfig.vectorizeCollection} | Query: ${queryContext}`);
  const ragResult = await fetchVectorizeContext(
    env,
    areaConfig.vectorizeCollection,
    queryContext,
    areaConfig.minContextLength
  );
  const ragValidation = validateRAGScore(ragResult, areaConfig);
  // FALLBACK INTELIGENTE — quando RAG insuficiente, usa LLM knowledge + safety protocols
  if (!ragValidation.valid) {
    console.log(`[RAG] Contexto insuficiente (score: ${ragValidation.score?.toFixed(3) || 0}, razão: ${ragValidation.reason}). Usando fallback LLM.`);
    try {
      const fbArea = areaConfig.label || area || "Acadêmico";
      const fbQuestions = await generateWithoutRAG(
        fbArea, "academic", topic || null, subject || fbArea, difficulty, quantity, "pt-BR", ACADEMIC_CONFIG, env, null
      );
      if (fbQuestions && fbQuestions.length > 0) {
        const validFb = validateQuestions(fbQuestions);
        if (validFb.length > 0) {
          return {
            success: true,
            questions: validFb.map(q => ({
              ...q,
              qualityBadge: { level: "medium", label: "🟡 Média", description: "Questão gerada via LLM sem RAG", color: "yellow" },
              ragFallback: true
            })),
            sources: [],
            metadata: {
              collection: areaConfig.vectorizeCollection,
              area,
              ragScore: 0,
              ragFallback: true,
              fallbackReason: ragValidation.reason,
              totalGenerated: fbQuestions.length,
              totalValidated: validFb.length
            }
          };
        }
      }
    } catch (fbErr) {
      console.error(`[RAG] Fallback LLM falhou: ${fbErr.message}`);
    }
    return buildContextInsufficientResponse(ACADEMIC_CONFIG, ragValidation);
  }
  const contextBlock = ragResult.context ? `Contexto recuperado da base vetorial (use como referência principal):\n${ragResult.context}` : "Sem contexto RAG.";
  const antiHallucinationRules = `NUNCA mencione fatos controversos, experimentais, temporais ou não sustentados pelo contexto.`;
  const sessionLabel = "Academic";
  const diffLabel = getDifficultyLabel(difficulty);
  const numAlts = 4;
  const altKeys = ["A", "B", "C", "D"];
  const altKeysStr = "A, B, C, D";
  const optionExplanationsExample = buildOptionExplanationsSchema(altKeys);
  const systemText = `Você é um professor acadêmico especialista em ${areaConfig.label}. Retorne APENAS JSON válido com a chave "questions".\nResponda em português do Brasil.\n\nPRINCÍPIOS INEGOCIÁVEIS:\n- Use APENAS conhecimento consolidado e verificável\n- JAMAIS mencione preços, datas de lançamento, versões específicas de software ou qualquer informação volátil\n- Produza conteúdo evergreen — válido e correto independentemente do momento em que for lido\n- ${antiHallucinationRules}\n\n🔴 INSTRUÇÃO CRÍTICA - LEIA COM ATENÇÃO:\nTODAS as questões DEVEM ser EXCLUSIVAMENTE sobre: ${areaConfig.label}\nNÃO gere questões de outra área, disciplina ou assunto.\nCada enunciado deve estar claramente alinhado APENAS com ${areaConfig.label}.`;
  const exampleOptions = `        { "key": "A", "text": "..." },\n        { "key": "B", "text": "..." },\n        { "key": "C", "text": "..." },\n        { "key": "D", "text": "..." }`;
  const userPrompt = `Modo: ${sessionLabel}\n\nGere exatamente ${quantity} questão(ões) de ${areaConfig.label} no nível ${diffLabel}.\n${subject ? `Disciplina específica: ${subject}.` : ""}\n${topic ? `Tópico específico: ${topic}.` : ""}\n\n${contextBlock}\n\nÁrea: ${areaConfig.label}\nConceitos base: ${areaConfig.conceptualBases}\n\nRetorne APENAS um objeto JSON:\n{\n  "questions": [\n    {\n      "id": 1,\n      "statement": "Enunciado da questão.",\n      "options": [\n${exampleOptions}\n      ],\n      "correctAnswer": "A",\n      "explanation": "Explicação clara e verificável da resposta correta.",\n      "optionExplanations": ${optionExplanationsExample},\n      "fonte": "Conceito/Teoria consolidado"\n    }\n  ]\n}\n\nRegras obrigatórias:\n1. Gere exatamente ${numAlts} alternativas usando ${altKeysStr}\n2. Questões corretas e sem ambiguidades\n3. Distribua gabarito entre as opções\n4. DISTRATORES PLAUSÍVEIS (FASE 3.2): cada alternativa errada deve ser plausível e coerente com o tema — não invente erros grosseiros ou absurdos; use conceitos próximos, exceções ou aplicações incorretas do mesmo assunto\n5. CALIBRAGEM DE DIFICULDADE (FASE 3.3): nível "${diffLabel}" — ${getDifficultyInstruction(difficulty)}\n6. EXPLICAÇÃO POR ALTERNATIVA (FASE 3.6): preencha "optionExplanations" com uma frase curta (1-2 linhas) explicando por que cada alternativa está correta ou incorreta\n7. ${antiHallucinationRules}\n8. NENHUM texto fora do JSON`;
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
    const pipelineValidation = validateQuestionPipeline(question, ragResult, areaConfig, false);
    if (pipelineValidation.valid) {
      validQuestions.push({
        ...pipelineValidation.question,
        qualityBadge: pipelineValidation.qualityBadge,
        traceabilityScore: pipelineValidation.traceabilityScore,
        ragScore: pipelineValidation.ragScore,
        warning: pipelineValidation.warning,
        _sources: pipelineValidation.chunks || 1,
        _antiHallucination: pipelineValidation.warning ? 'warning' : 'verified'
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
async function handleEssayCoachSession(sessionState, env) {
  const { history, banca } = sessionState;
  const bancaSafe = banca || "ENEM";

  const systemPrompt = `Voc\u00ea \u00e9 um sistema avan\u00e7ado de treinamento de reda\u00e7\u00e3o para concursos p\u00fablicos e ENEM.
Seu objetivo \u00e9 transformar o usu\u00e1rio em um candidato de alta performance atrav\u00e9s de dois modos integrados.

Banca escolhida: ${bancaSafe}. Adapte seu rigor e estilo de corre\u00e7\u00e3o para essa banca.

Voc\u00ea atua atrav\u00e9s de uma m\u00e1quina de estados r\u00edgida:
Etapas obrigat\u00f3rias: thesis -> argument1 -> argument2 -> conclusion -> review -> final
PROIBIDO pular etapas no modo coach.

MODO 1: COACH DE ESCRITA (Principal)
Ativar quando o usu\u00e1rio fornecer apenas um tema ou ideia curta.
Fluxo:
1. Receba o tema -> valide e melhore a tese -> mude stage para "thesis"
2. Valide a tese do aluno -> pe\u00e7a argumento 1 -> mude stage para "argument1"
3. Valide argumento 1 -> pe\u00e7a argumento 2 -> mude stage para "argument2"
4. Valide argumento 2 -> pe\u00e7a conclus\u00e3o/proposta de interven\u00e7\u00e3o -> mude stage para "conclusion"
5. Valide conclus\u00e3o -> revise tudo -> mude stage para "review"
6. Gere a vers\u00e3o nota 1000 completa -> mude stage para "final"
Regras: nunca avan\u00e7ar sem resposta do aluno. Sempre sugerir melhoria antes de avan\u00e7ar.

MODO 2: CORRE\u00c7\u00c3O DIRETA
Ativar quando o usu\u00e1rio colar uma reda\u00e7\u00e3o longa (mais de 200 palavras) ou escrever "FINALIZAR REDA\u00c7\u00c3O".
A\u00e7\u00e3o: pule todas as etapas, avalie C1-C5 com notas reais (0-200 cada), d\u00ea feedback detalhado e gere reescrita nota 1000.
Mude stage para "final" imediatamente.

ATUALIZA\u00c7\u00c3O DE SCORES:
- No modo coach: atualize c1-c5 progressivamente a cada etapa validada (max 200 por compet\u00eancia).
- Na corre\u00e7\u00e3o direta: avalie c1-c5 com rigor real da banca ${bancaSafe}.

REGRA CR\u00cdTICA DE RESPOSTA:
Voc\u00ea DEVE retornar APENAS um JSON v\u00e1lido, sem texto fora do JSON, seguindo EXATAMENTE:
{
  "reply": "Texto de resposta ao usu\u00e1rio em markdown",
  "state": {
    "stage": "thesis|argument1|argument2|conclusion|review|final",
    "scores": { "c1": 0, "c2": 0, "c3": 0, "c4": 0, "c5": 0 },
    "summary": "Resumo de at\u00e9 3 frases do que o aluno j\u00e1 produziu"
  }
}`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.slice(-20) // cap history to last 20 messages to avoid token overflow
  ];

  const groqKey = env.GROQ_API_KEY;
  if (!groqKey) throw new Error("GROQ_API_KEY n\u00e3o configurada");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${groqKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.35,
      max_tokens: 2048,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "unknown");
    throw new Error(`Groq API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Resposta vazia do modelo");

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("JSON inv\u00e1lido retornado pelo modelo");
  }

  // Validate and sanitize response shape
  const stage = parsed?.state?.stage || sessionState.stage || "thesis";
  const scores = parsed?.state?.scores || sessionState.scores || { c1: 0, c2: 0, c3: 0, c4: 0, c5: 0 };
  const summary = parsed?.state?.summary || sessionState.summary || "";
  const reply = parsed?.reply || "";

  return {
    reply,
    state: { stage, scores, summary }
  };
}
__name(handleEssayCoachSession, "handleEssayCoachSession");

const PROF_AIVOS_SYSTEM_PROMPT = `Você é o **Prof. AIVOS**, um professor virtual 360° extremamente competente, carismático, motivador e preciso. Seu objetivo é ser o mentor pessoal do aluno para concursos públicos, atuando como um verdadeiro professor particular que guia todo o curso preparatório de forma autônoma.

### REGRAS OBRIGATÓRIAS:
1. Fale em primeira pessoa como "Prof. AIVOS". Seja direto, encorajador, mas exigente. Use linguagem natural brasileira, tom de professor experiente.
2. Sempre responda de forma estruturada e visual (use markdown, emojis, negrito, listas).
3. Inclua sugestões de próximas ações no final de cada resposta.

### FUNCIONALIDADES QUE VOCÈ DEVE OFERECER:
- Montar Plano de Estudos personalizado (semanal/mensal) baseado no edital.
- Gerar ou indicar questões filtradas por disciplina, dificuldade e peso do edital.
- Orientar redação com temas prováveis do concurso.
- Criar simulados completos respeitando a proporção do edital.
- Análise de desempenho (se o aluno informar resultados).
- Recomendar materiais e ordem de estudo.
- Fazer revisões inteligentes focadas em pontos fracos.

### SITUAÇÕES PROBLEMÁTICAS:
- Edital muito longo: Resuma primeiro e peça confirmação.
- Concurso não encontrado: Peça o nome oficial ou link do edital.
- Aluno não tem edital: Pergunte o nome do concurso ou qual fase está estudando.
- Aluno desmotivado: Sempre inclua motivação + micro-vitória na resposta.
- Erros técnicos: Nunca prometa funcionalidades que o site ainda não tem.

### Formato de Resposta:
1. Saudação ou reconhecimento da solicitação.
2. Análise clara do que foi pedido.
3. Entrega do conteúdo principal.
4. Sugestões de próximas ações.
5. Pergunta para continuar o diálogo.

**Tom**: Profissional, motivador, preciso e humano.

{studentData}`;

async function handleProfAivosChat(body, env) {
  const { message, history = [], studentData = '', currentEdital = null, currentConcurso = null } = body;

  if (!message || !message.trim()) {
    return { reply: 'Olá! Como posso te ajudar com seus estudos hoje? 🎓' };
  }

  if (!env.GROQ_API_KEY) {
    // Fallback: respostas locais simples
    const msg = message.toLowerCase();
    if (msg.includes('olá') || msg.includes('oi') || msg.includes('bom dia')) {
      return { reply: `🎓 **Olá! Eu sou o Prof. AIVOS!**

Que bom ter você aqui! 👋 Sou seu mentor virtual 360° para concursos públicos.

**Por onde você quer começar?**
📄 Analisar edital | 📚 Plano de estudos | 📝 Questões
✍️ Redação | 📊 Simulados | 📈 Análise de desempenho` };
    }
    return { reply: `🎓 **Prof. AIVOS aqui!**

Recebi sua mensagem! Para te ajudar melhor, me dê mais detalhes sobre o que precisa.

**Opções disponíveis:**
📄 Analisar Edital
📚 Plano de Estudos Personalizado
📝 Questões por Disciplina
✍️ Treino de Redação
📊 Simulado Completo
📈 Análise de Desempenho` };
  }

  // Montar mensagens para o modelo
  const systemContent = PROF_AIVOS_SYSTEM_PROMPT.replace('{studentData}', studentData || 'Sem dados do aluno disponíveis.');
  
  let contextInfo = '';
  if (currentEdital) {
    contextInfo += `\nEDITAL CONFIGURADO: ${currentEdital.slice(0, 300)}...\n`;
  }
  if (currentConcurso) {
    contextInfo += `\nCONCURSO ATUAL: ${currentConcurso}\n`;
  }
  
  // Construir histórico de mensagens
  const messages = [
    { role: 'system', content: systemContent + (contextInfo ? `\n\nCONTEXTO ATUAL:${contextInfo}` : '') },
    { role: 'assistant', content: 'Olá! Eu sou o Prof. AIVOS, seu mentor virtual 360°. Como posso te ajudar hoje?' }
  ];
  
  // Adicionar histórico recente
  if (Array.isArray(history)) {
    for (const h of history.slice(-8)) {
      if (h.role && h.content) {
        messages.push({ role: h.role, content: h.content });
      }
    }
  }
  
  // Adicionar mensagem atual do usuário
  messages.push({ role: 'user', content: message });

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.4,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[Prof. AIVOS] Groq error ${response.status}: ${errText}`);
      return { reply: 'Desculpe, estou com dificuldades técnicas no momento. Pode tentar novamente em alguns instantes?' };
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content;
    
    if (!reply) {
      return { reply: 'Não consegui processar sua solicitação. Pode reformular?' };
    }

    return { reply };
  } catch (error) {
    console.error(`[Prof. AIVOS] Erro na chamada Groq: ${error.message}`);
    return { reply: 'Desculpe, ocorreu um erro na comunicação. Tente novamente!' };
  }  }

const PROF_REDBOT_SYSTEM_PROMPT = `Você é o **Prof. RedBot**, um robô professor super simpático, paciente e especialista em redação para concursos públicos. Você usa um chapéu de professor e tem personalidade amigável, como um bom professor que explica tudo de forma clara.

Sua missão é ajudar o aluno a aprender de verdade as técnicas de redação e tirar notas altas (900+ ou 1000).

**Como você fala (obrigatório):**
- Linguagem humana, simples, clara e motivadora. Como se estivesse conversando com um aluno.
- Sempre comece apontando algo positivo antes de mostrar o que melhorar.
- Explique o PORQUÊ das coisas (ex: "Isso é bom porque ajuda na nota da C3").
- Use emojis, quebras de linha e frases curtas para ficar fácil de ler.

**O que você pode fazer:**
- Corrigir redação completa ou por partes (introdução, desenvolvimento, conclusão)
- Dar nota por competência (C1 até C5) com explicação simples
- Ensinar técnicas passo a passo
- Sugerir repertórios socioculturais atualizados
- Criar temas de redação personalizados conforme o edital
- Mostrar exemplos de trechos nota 1000
- Montar plano de evolução na redação

Sempre termine sua resposta com 2 ou 3 sugestões claras de próximo passo, como botões.

Você é o Prof. RedBot, o robô professor que mora no site e está sempre pronto para ajudar!

{studentData}`;

async function handleProfRedbotChat(body, env) {
  const { message, history = [], studentData = '', systemPrompt = null, model: modelOverride = null, useJsonResponse = true } = body;

  if (!message || !message.trim()) {
    return { reply: '🤖 Olá! Eu sou o Prof. RedBot! Como posso ajudar com sua redação hoje? 🎓' };
  }

  if (!env.GROQ_API_KEY) {
    const msg = message.toLowerCase();
    if (msg.includes('olá') || msg.includes('oi') || msg.includes('bom dia')) {
      return { reply: `🤖🎓 **Olá! Eu sou o Prof. RedBot!**

Seu robô professor especialista em redação para concursos! Posso ajudar com:

📝 **Corrigir sua redação** — Envie o texto completo
🎯 **Criar temas** — Tema personalizado
📋 **Explicar C1-C5** — Entenda cada competência
🏆 **Exemplos Nota 1000** — Trechos nota máxima
📚 **Repertórios** — Autores e dados

**👉 Como posso te ajudar hoje?** 🚀` };
    }
    if (msg.includes('tema') || msg.includes('redação nova')) {
      return { reply: '🎯 **Tema para Redação!**\n\n**"Os desafios da saúde pública no Brasil pós-pandemia"**\n\n📝 Escreva uma redação dissertativa-argumentativa sobre o tema. Lembre-se de estruturar com introdução, desenvolvimento (2 parágrafos) e conclusão com proposta de intervenção.\n\n**👉 Quando terminar, cole aqui que eu corrijo!**' };
    }
    return { reply: `🤖🎓 **Prof. RedBot aqui!**

Entendi! Para te ajudar melhor, você pode:

📝 **Enviar sua redação** — Completa ou em partes
🎯 Pedir um **tema de redação**
📋 Perguntar sobre **C1 a C5**
🏆 Ver **exemplos nota 1000**
📚 Pedir **repertórios**

**👉 O que você prefere?**` };
  }

  // Usa o systemPrompt vindo do frontend (Coach RedBot) se fornecido; caso contrário, usa o prompt padrão do Prof. RedBot
  const promptToUse = systemPrompt || PROF_REDBOT_SYSTEM_PROMPT;
  const systemContent = promptToUse.replace('{studentData}', studentData || 'Sem dados do aluno disponíveis.');

  const messages = [
    { role: 'system', content: systemContent },
    { role: 'assistant', content: '🤖 Olá! Eu sou o Prof. RedBot! Como posso ajudar com sua redação hoje?' }
  ];

  if (Array.isArray(history)) {
    for (const h of history.slice(-10)) {
      if (h.role && h.content) {
        messages.push({ role: h.role, content: h.content });
      }
    }
  }

  messages.push({ role: 'user', content: message });

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelOverride || 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.35,
        max_tokens: 2000,
        ...(useJsonResponse ? { response_format: { type: 'json_object' } } : {})
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[Prof. RedBot] Groq error ${response.status}: ${errText}`);
      return { reply: 'Desculpe, estou com dificuldades técnicas. Pode tentar novamente?' };
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return { reply: 'Não consegui processar sua solicitação. Pode reformular?' };
    
    // Tenta parsear JSON — o modelo agora retorna APENAS dados estruturados
    try {
      const parsed = JSON.parse(content);
      return {
        // Se o modelo incluiu 'reply' (fallback), usa; senão passa os campos estruturados
        reply: parsed.reply || null,
        scores: parsed.scores || null,
        summary: parsed.summary || '',
        strongPoints: parsed.strongPoints || [],
        problems: parsed.problems || [],
        socraticQuestion: parsed.socraticQuestion || '',
        nextSteps: parsed.nextSteps || []
      };
    } catch {
      return { reply: content };
    }
  } catch (error) {
    console.error(`[Prof. RedBot] Erro: ${error.message}`);
    return { reply: 'Desculpe, ocorreu um erro na comunicação. Tente novamente!' };
  }
}

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
        freeText,
        editalText,
        questionType = "mcq",
        idioma = "pt-BR"
      } = body || {};

      const isPortugues = !idioma || idioma === "pt-BR";

      if (mode === "prof-aivos") {
        try {
          const result = await handleProfAivosChat(body, env);
          return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        } catch (chatErr) {
          return new Response(JSON.stringify({
            reply: "Desculpe, ocorreu um erro interno no Prof. AIVOS. Tente novamente.",
            error: chatErr.message
          }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }

      if (mode === "redbot") {
        try {
          const result = await handleProfRedbotChat(body, env);
          return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        } catch (chatErr) {
          return new Response(JSON.stringify({
            reply: "Desculpe, ocorreu um erro interno no Coach RedBot. Tente novamente.",
            error: chatErr.message
          }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }

      if (mode === "redacao") {
        try {
          const sessionState = body.sessionState;
          if (!sessionState || !Array.isArray(sessionState.history)) {
            return new Response(JSON.stringify({
              reply: "Sess\u00e3o inv\u00e1lida. Recarregue a p\u00e1gina e tente novamente.",
              state: { stage: "thesis", scores: { c1: 0, c2: 0, c3: 0, c4: 0, c5: 0 }, summary: "" }
            }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }
          const result = await handleEssayCoachSession(sessionState, env);
          return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        } catch (coachErr) {
          return new Response(JSON.stringify({
            reply: "\u26a0\ufe0f Ocorreu um erro interno no Coach. Tente novamente.",
            state: { stage: body.sessionState?.stage || "thesis", scores: body.sessionState?.scores || { c1: 0, c2: 0, c3: 0, c4: 0, c5: 0 }, summary: body.sessionState?.summary || "" }
          }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }

      if (mode === "concurso" || mode === "concursos") {
        // [FIX] Removido fallback hardcoded "concursos.portugues" — filter deve vir explícito no body
        if (!filter) {
          return new Response(JSON.stringify({
            success: false,
            error: "MISSING_FILTER",
            userMessage: "O campo \"filter\" é obrigatório para o modo concurso. Escolha uma das matérias disponíveis: Português, Direito Constitucional, Direito Administrativo, Direito Penal, etc."
          }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        const result = await generateConcursosRAGQuestion(
          {
            filter,
            difficulty,
            quantity: Math.min(Math.max(Number(quantity) || 1, 1), 10),
            prompt,
            extraContext,
            banca: body.banca,
            questionType: body.questionType || questionType
          },
          env
        );
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      // ── FREE STUDY MODES ──
      if (mode === "free-chat") {
        try {
          if (!freeText || !freeText.trim()) {
            return new Response(JSON.stringify({ reply: "⚠️ Nenhum material de estudo carregado. Cole ou envie um material primeiro." }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
          }
          const chatMessage = body.message;
          if (!chatMessage || !chatMessage.trim()) {
            return new Response(JSON.stringify({ reply: "Faça uma pergunta sobre o material que você carregou!" }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
          }
          const chatHistory = body.chatHistory || [];
          const systemPrompt = `Você é um assistente de estudo especializado em concursos públicos brasileiros.

MATERIAL DE ESTUDO DO ALUNO:
${freeText.slice(0, 8000)}

REGRAS:
- Responda APENAS com base no material fornecido acima.
- Se a pergunta não puder ser respondida com o material, diga educadamente.
- Use linguagem clara e didática, como um professor particular.
- Destaque conceitos importantes, artigos de lei.
- Responda em português do Brasil.
- Seja conciso mas completo.`;

          const messages = [
            { role: "system", content: systemPrompt },
            { role: "assistant", content: "Olá! Sou seu assistente de estudo. Pergunte sobre o material que você carregou! 📚" }
          ];

          if (Array.isArray(chatHistory)) {
            for (const h of chatHistory.slice(-10)) {
              if (h.role && h.content) messages.push({ role: h.role, content: h.content });
            }
          }
          messages.push({ role: "user", content: chatMessage });

          const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${env.GROQ_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              messages,
              temperature: 0.3,
              max_tokens: 1200
            })
          });

          if (!groqResponse.ok) {
            return new Response(JSON.stringify({ reply: "❌ Erro ao processar sua pergunta. Tente novamente." }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
          }

          const data = await groqResponse.json();
          const reply = data?.choices?.[0]?.message?.content || "Desculpe, não consegui processar sua pergunta.";
          return new Response(JSON.stringify({ reply }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        } catch (chatErr) {
          return new Response(JSON.stringify({ reply: "Erro interno. Tente novamente." }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
      }

      if (mode === "free-flashcards") {
        try {
          if (!freeText || !freeText.trim()) {
            return new Response(JSON.stringify({ error: "Nenhum material carregado." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }
          const systemText = `Com base no material de estudo abaixo, extraia os conceitos mais importantes e crie flashcards para revisão ativa.

MATERIAL:
${freeText.slice(0, 8000)}

Cada flashcard deve ter:
- "front": pergunta, termo ou conceito-chave
- "back": resposta, definição ou explicação

REGRAS:
- Crie de 5 a 15 flashcards
- Foque em definições, artigos de lei, princípios, regras
- Não invente informações que não estejam no material

Responda APENAS com um array JSON: [{"front": "...", "back": "..."}]`;

          const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${env.GROQ_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              temperature: 0.2,
              max_tokens: 2000,
              response_format: { type: "json_object" },
              messages: [
                { role: "system", content: "Você é um especialista em criar flashcards para concursos. Retorne APENAS um array JSON." },
                { role: "user", content: systemText }
              ]
            })
          });

          if (!groqResponse.ok) {
            return new Response(JSON.stringify({ error: "Erro ao gerar flashcards." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }

          const data = await groqResponse.json();
          const rawText = data?.choices?.[0]?.message?.content || "[]";
          let flashcards;
          try {
            const parsed = JSON.parse(rawText);
            flashcards = Array.isArray(parsed) ? parsed : (parsed.flashcards || parsed.data || []);
          } catch {
            const match = rawText.match(/\[[\s\S]*\]/);
            flashcards = match ? JSON.parse(match[0]) : [];
          }

          return new Response(JSON.stringify({ flashcards, count: flashcards.length }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        } catch (fcErr) {
          return new Response(JSON.stringify({ error: "Erro ao gerar flashcards." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }

      if (mode === "free-summarize") {
        try {
          if (!freeText || !freeText.trim()) {
            return new Response(JSON.stringify({ error: "Nenhum material carregado." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }
          const systemText = `Com base no material de estudo abaixo, crie um resumo estruturado e didático.

MATERIAL:
${freeText.slice(0, 8000)}

O resumo deve ter:
1. TITULO: Título claro
2. PONTOS PRINCIPAIS: Lista dos conceitos mais importantes
3. DETALHES: Explicação sucinta dos tópicos principais (2-3 parágrafos curtos)
4. DICA DE ESTUDO: Dica prática de memorização

REGRAS:
- Seja objetivo
- Destaque artigos de lei, números e exceções
- Não invente informações

Responda APENAS com JSON: {"titulo": "...", "pontosPrincipais": [], "detalhes": "...", "dicaEstudo": "..."}`;

          const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${env.GROQ_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              temperature: 0.2,
              max_tokens: 2000,
              response_format: { type: "json_object" },
              messages: [
                { role: "system", content: "Você é um especialista em resumir materiais de estudo para concursos. Retorne APENAS JSON." },
                { role: "user", content: systemText }
              ]
            })
          });

          if (!groqResponse.ok) {
            return new Response(JSON.stringify({ error: "Erro ao gerar resumo." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }

          const data = await groqResponse.json();
          const rawText = data?.choices?.[0]?.message?.content || "{}";
          let summary;
          try {
            summary = JSON.parse(rawText);
          } catch {
            const match = rawText.match(/\{[\s\S]*\}/);
            summary = match ? JSON.parse(match[0]) : { titulo: "Resumo", pontosPrincipais: [], detalhes: "", dicaEstudo: "" };
          }

          return new Response(JSON.stringify({ summary }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        } catch (sumErr) {
          return new Response(JSON.stringify({ error: "Erro ao gerar resumo." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }

      
if (mode === "youtube-transcript") {
        const { youtubeUrl } = body;
        if (!youtubeUrl || !youtubeUrl.trim()) {
          return new Response(JSON.stringify({ success: false, error: "URL do YouTube obrigatoria." }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        // Extract video ID from URL
        let videoId = null;
        const patterns = [
          /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
          /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
          /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
        ];
        for (const pat of patterns) {
          const m = youtubeUrl.match(pat);
          if (m) { videoId = m[1]; break; }
        }
        if (!videoId) {
          return new Response(JSON.stringify({ success: false, error: "Link do YouTube invalido." }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        const result = await handleYouTubeTranscript(videoId, env);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

if (mode === "academic") {
        // [FIX] Removido fallback hardcoded "academic.direito" — area deve vir explícita no body
        if (!area) {
          return new Response(JSON.stringify({
            success: false,
            error: "MISSING_AREA",
            userMessage: "O campo \"area\" é obrigatório para o modo academic. Escolha uma das disponíveis: Direito, Medicina, História, Exatas, Humanas, Saúde ou Negócios."
          }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        const result = await generateAcademicRAGQuestion(
          {
            area,
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

      // ── FLUXO GENÉRICO (fallback) ──────────────────────────────────────────
      const normalizedType = normalizeQuestionType(questionType);
      const quantitySafe = Math.min(Math.max(Number(quantity) || 1, 1), 10);
      const typeLabel = normalizedType === "vf" ? "Verdadeiro/Falso" : "múltipla escolha";
      const idiomaLabel = idioma === "en" ? "English" : idioma === "es" ? "español" : "português do Brasil";
      const areaSafetyInstruction = getAreaSafetyInstruction(area, mode);
      const contextData = await fetchContext(area, mode, topic, subject, idioma, env);
      const contextInfo = contextData?.text || "";
      const sourceInfo = contextData?.source || "Conhecimento acadêmico consolidado";
      const additionalInfo = [prompt, extraContext, freeText, editalText].filter(Boolean).join("\n").trim();
      const bancaInstruction = mode === "concurso" ? " Priorize estilo claro, objetivo e atemporal. Nunca cite banca/ano sem fonte no contexto." : "";
      const sessionInstruction = quantitySafe > 1 ? " Gere questões equilibradas e variadas." : "";
      const bancaRaw = body.banca || '';
      const isCespeBanca = bancaRaw.toLowerCase() === 'cespe' || bancaRaw.toLowerCase() === 'cebraspe';
      const vfMode = normalizedType === "vf" || isCespeBanca;
      const altKeysList = vfMode ? (isCespeBanca ? ["C", "E"] : ["A", "B"]) : ["A", "B", "C", "D"];
      const altKeysStr = altKeysList.join(", ");
      const numAlts = altKeysList.length;
      const altInstruction = vfMode
        ? (isCespeBanca
            ? "Para questoes estilo CESPE/Cebraspe: use EXATAMENTE 2 opcoes: C (Certo) e E (Errado)."
            : "Para questoes V/F, use apenas 2 opcoes: A (Verdadeiro) e B (Falso).")
        : `Gere exatamente ${numAlts} alternativas por questão usando as chaves ${altKeysStr}.`;
      const rawExternalBlock = additionalInfo ? `Informações adicionais do usuário (use apenas se compatíveis com o contexto):\n${additionalInfo}` : "";
      const diffLabel = getDifficultyLabel(difficulty);
      const diffInstruction = getDifficultyInstruction(difficulty);
      const optionExplanationsExample = buildOptionExplanationsSchema(altKeysList);

      // FASE 2.6 — PRINCÍPIOS INEGOCIÁVEIS no fluxo genérico
      const systemText = `Você é um examinador acadêmico especializado em concursos públicos e ensino superior brasileiro. Retorne APENAS JSON válido com a chave "questions".\n${isPortugues ? "Responda em português do Brasil." : `Respond entirely in ${idiomaLabel}.`}\n\nPRINCÍPIOS INEGOCIÁVEIS:\n- Use APENAS conhecimento factício consolidado e verificado.\n- JAMAIS mencione preços, datas de lançamento, versões específicas de software ou qualquer informação volátil.\n- Produza conteúdo evergreen — válido e correto independentemente do momento em que for lido.\n- NUNCA invente leis, artigos, números, medicamentos, comandos, fórmulas ou qualquer dado.\n- O campo "fonte" de CADA questão deve ser preenchido.\n- ${areaSafetyInstruction}`;

      const { contextInfo: safeContextInfo, externalBlock } = guardPromptSize(contextInfo, rawExternalBlock, systemText);

      // FASE 3.2, 3.3, 3.6 — distratores plausíveis, calibragem e explicação por alternativa
      const userPrompt = `Você é um professor especialista em concursos públicos e ensino superior brasileiro.${bancaInstruction}${sessionInstruction}\n\nGere exatamente ${quantitySafe} questões de ${typeLabel} sobre:\n- Área: ${area || mode || "Geral"}\n${subject ? `- Disciplina: ${subject}` : ""}\n${topic ? `- Tópico: ${topic}` : ""}\n- Nível de dificuldade: ${diffLabel}\n- Idioma de saída: ${idiomaLabel}\n\nContexto confiável (fonte principal):\n${safeContextInfo || "Sem contexto externo recuperado; use apenas conhecimento consolidado e atemporal."}\n\n${externalBlock}\n\nFormato obrigatório de retorno:\n{\n  "questions": [\n    {\n      "id": 1,\n      "statement": "Enunciado da questão",\n      "options": [\n        { "key": "A", "text": "Alternativa A" },\n        { "key": "B", "text": "Alternativa B" },\n        { "key": "C", "text": "Alternativa C" },\n        { "key": "D", "text": "Alternativa D" }\n      ],\n      "correctAnswer": "A",\n      "explanation": "Explicação objetiva e verificável da resposta correta.",\n      "optionExplanations": ${optionExplanationsExample},\n      "fonte": "${sourceInfo}"\n    }\n  ]\n}\n\nREGRAS OBRIGATÓRIAS:\n1. ${altInstruction}\n2. O campo "correctAnswer" deve corresponder exatamente a uma das chaves usadas em "options".\n3. Todas as questões devem ter "explanation" e "fonte".\n4. A explicação deve justificar por que a correta é correta, sem repetir o enunciado.\n5. Use contexto confiável; se faltar base, faça pergunta conceitual segura e atemporal.\n6. DISTRATORES PLAUSÍVEIS (FASE 3.2): cada alternativa errada deve ser plausível e coerente com o tema — use conceitos próximos, exceções ou aplicações incorretas do mesmo assunto; nunca invente erros grosseiros ou absurdos.\n7. CALIBRAGEM DE DIFICULDADE (FASE 3.3): nível "${diffLabel}" — ${diffInstruction}.\n8. EXPLICAÇÃO POR ALTERNATIVA (FASE 3.6): preencha "optionExplanations" com uma frase curta (1-2 linhas) por letra, explicando por que cada alternativa está correta ou incorreta.\n9. NENHUM texto fora do JSON.\n10. Não use markdown, cercas de código ou comentários.`;

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
