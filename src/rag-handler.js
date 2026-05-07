/**
 * rag-handler.js
 * 
 * Módulo responsável por:
 * 1. Mapear filtros → coleções Vectorize
 * 2. Recuperar contexto do Vectorize
 * 3. Injetar contexto no prompt
 * 4. Validar saída pós-geração
 */

// Importar configurações (em um ambiente real, estas viriam do arquivo JSON)
const TAXONOMY = {
  "filterMapping": {
    "concursos": {
      "portugues": { collection: "concursos_portugues", minContextLength: 200 },
      "direito_constitucional": { collection: "concursos_direito_constitucional", minContextLength: 300 },
      "raciocinio_logico": { collection: "concursos_raciocinio_logico", minContextLength: 150 },
      "informatica": { collection: "concursos_informatica", minContextLength: 250 },
      "administracao_publica": { collection: "concursos_administracao_publica", minContextLength: 300 }
    }
  }
};

const PROMPTS_ANTI_ALUCINACAO = {
  "concursos_portugues": {
    "forbiddenPatterns": ["prova de", "edital", "banca", "concurso de"],
    "conceptualBases": "NCCFL, ABNT, Gramáticas normativas brasileiras"
  },
  "concursos_direito_constitucional": {
    "forbiddenPatterns": ["STF entendeu", "julgado em", "acórdão número"],
    "conceptualBases": "CF/88, Jurisprudência STF/STJ"
  },
  "concursos_raciocinio_logico": {
    "forbiddenPatterns": ["como foi comprovado", "universalmente aceito"],
    "conceptualBases": "Lógica formal, Teoria dos conjuntos"
  },
  "concursos_informatica": {
    "forbiddenPatterns": ["última versão de", "tecnologia do futuro"],
    "conceptualBases": "ISO/IEC 27001, RFC padrões, Documentação oficial"
  },
  "concursos_administracao_publica": {
    "forbiddenPatterns": ["prova ESAF", "edital de", "banca X decidiu"],
    "conceptualBases": "CF/88, Lei 8.112/90, Lei 8.666/93, Lei 9.784/99"
  }
};

/**
 * Valida se um filtro está mapeado para uma coleção Vectorize
 * @param {string} mode - Modo (ex: "concursos")
 * @param {string} filter - Filtro (ex: "portugues")
 * @returns {Object} Mapeamento ou null
 */
function validateFilterMapping(mode, filter) {
  const mapping = TAXONOMY.filterMapping[mode]?.[filter];
  
  if (!mapping) {
    return {
      valid: false,
      error: `Filtro não mapeado: ${mode}.${filter}`,
      fallbackMode: "generic"
    };
  }
  
  return {
    valid: true,
    collection: mapping.collection,
    minContextLength: mapping.minContextLength,
    internalKey: `${mode}_${filter}`
  };
}

/**
 * Recupera contexto do Vectorize baseado no filtro
 * @param {Object} vectorizeClient - Cliente Vectorize do Cloudflare
 * @param {string} collection - Nome da coleção
 * @param {string} query - Texto para busca semântica
 * @param {number} minLength - Comprimento mínimo de contexto esperado
 * @returns {Promise<Object>} { context: string, sources: Array, sufficient: boolean }
 */
async function retrieveVectorizeContext(vectorizeClient, collection, query, minLength = 150) {
  try {
    // Busca semântica no Vectorize
    const results = await vectorizeClient.search(collection, {
      query: query,
      limit: 5,
      returnMetadata: true
    });
    
    if (!results || results.length === 0) {
      return {
        context: "",
        sources: [],
        sufficient: false,
        reason: "Nenhum resultado encontrado"
      };
    }
    
    // Concatena contexto dos resultados
    let context = results
      .map(r => r.metadata?.text || r.text)
      .filter(t => t)
      .join("\n");
    
    const sufficient = context.length >= minLength;
    
    return {
      context: context,
      sources: results.map(r => ({
        source: r.metadata?.source || "desconhecida",
        banca: r.metadata?.banca || null,
        relevance: r.score
      })),
      sufficient: sufficient,
      contextLength: context.length
    };
    
  } catch (error) {
    console.error(`Erro ao recuperar contexto do Vectorize: ${error.message}`);
    return {
      context: "",
      sources: [],
      sufficient: false,
      reason: `Erro técnico: ${error.message}`
    };
  }
}

/**
 * Injeta contexto e constraints no prompt
 * @param {string} subject - Matéria (ex: "portugues")
 * @param {string} vectorizeContext - Contexto recuperado
 * @param {boolean} contextSufficient - Se contexto é suficiente
 * @returns {string} Prompt ajustado
 */
function buildAntiHallucinationPrompt(subject, vectorizeContext, contextSufficient) {
  const config = PROMPTS_ANTI_ALUCINACAO[`concursos_${subject}`] || {};
  
  if (!contextSufficient) {
    return `
Você está gerando uma questão GENÉRICA de ${subject} para concursos públicos.

⚠️ ATENÇÃO: Contexto insuficiente recuperado. Gere uma questão genérica SEM citar:
- Banca específica (FCC, CESPE, VUNESP, etc)
- Concurso específico
- Ano da prova
- Edital

Gere uma questão seguindo este formato JSON:
{
  "statement": "Enunciado claro e objetivo",
  "options": [
    {"letter": "A", "text": "..."}, 
    {"letter": "B", "text": "..."},
    {"letter": "C", "text": "..."},
    {"letter": "D", "text": "..."},
    {"letter": "E", "text": "..."}
  ],
  "correctAnswer": "A",
  "explanation": "Justificativa baseada em conceitos gerais",
  "conceptualBasis": "Educação geral em ${subject}"
}

Responda SÓ com o JSON, sem explicações adicionais.
`;
  }
  
  return `
Você é um especialista em geração de questões de ${subject} para concursos públicos.

CONTEXTO FORNECIDO (recuperado da base de dados):
${vectorizeContext}

COM BASE EXCLUSIVAMENTE NO CONTEXTO ACIMA, gere UMA questão de múltipla escolha.

RESTRIÇÕES OBRIGATÓRIAS:
- NÃO invente nome de banca, concurso ou ano da prova
- NÃO cite provas reais a menos que estejam no contexto acima
- Use APENAS conceitos presentes no contexto
- Base conceitual esperada: ${config.conceptualBases || "não especificada"}

PADRÕES PROIBIDOS (remover se aparecerem):
${config.forbiddenPatterns?.map(p => `- "${p}"`).join("\n") || "- nenhum padrão específico"}

Responda em formato JSON EXATO:
{
  "statement": "Enunciado claro, sem inventar cenários",
  "options": [
    {"letter": "A", "text": "Alternativa coerente"},
    {"letter": "B", "text": "Alternativa coerente"},
    {"letter": "C", "text": "Alternativa coerente"},
    {"letter": "D", "text": "Alternativa coerente"},
    {"letter": "E", "text": "Alternativa coerente"}
  ],
  "correctAnswer": "A",
  "explanation": "Justificativa baseada no contexto, citando referências normativas quando aplicável",
  "conceptualBasis": "Base conceitual da questão (ex: 'CF/88, arts. 37-41')"
}

Responda APENAS com o JSON, sem explicações adicionais.
`;
}

/**
 * Valida a saída do modelo contra padrões de alucinação
 * @param {Object} question - Questão gerada
 * @param {string} subject - Matéria
 * @param {Array} vectorizeSources - Fontes recuperadas do Vectorize
 * @returns {Object} { valid: boolean, errors: Array, warnings: Array, corrected: Object }
 */
function validateAgainstHallucination(question, subject, vectorizeSources = []) {
  const errors = [];
  const warnings = [];
  const corrected = JSON.parse(JSON.stringify(question)); // deep copy
  
  const config = PROMPTS_ANTI_ALUCINACAO[`concursos_${subject}`] || {};
  const forbiddenPatterns = config.forbiddenPatterns || [];
  
  // 1. Verificar campos obrigatórios
  const requiredFields = ["statement", "options", "correctAnswer", "explanation"];
  for (const field of requiredFields) {
    if (!question[field]) {
      errors.push(`Campo obrigatório faltando: ${field}`);
    }
  }
  
  // 2. Detectar padrões de alucinação
  const textToCheck = `${question.statement} ${question.explanation}`;
  
  for (const pattern of forbiddenPatterns) {
    const regex = new RegExp(pattern, "gi");
    if (regex.test(textToCheck)) {
      warnings.push(`Padrão de alucinação detectado: "${pattern}". Removendo...`);
      corrected.statement = corrected.statement.replace(regex, "[removido]");
      corrected.explanation = corrected.explanation.replace(regex, "[removido]");
    }
  }
  
  // 3. Validar alternativas
  if (Array.isArray(question.options)) {
    if (question.options.length < 4 || question.options.length > 5) {
      errors.push(`Número de alternativas inválido: ${question.options.length} (esperado 4-5)`);
    }
    
    const validLetters = ["A", "B", "C", "D", "E"];
    const letters = question.options.map(o => o.letter);
    
    for (const letter of letters) {
      if (!validLetters.includes(letter)) {
        errors.push(`Letra de alternativa inválida: ${letter}`);
      }
    }
  }
  
  // 4. Validar resposta correta
  if (question.correctAnswer && !["A", "B", "C", "D", "E"].includes(question.correctAnswer)) {
    errors.push(`Resposta correta inválida: ${question.correctAnswer}`);
  }
  
  // 5. Se houver banca na resposta e não estiver no contexto, avisar
  const bankNames = ["FCC", "CESPE", "CEBRASPE", "VUNESP", "IBFC", "ESAF", "FUMARC"];
  for (const bank of bankNames) {
    if (textToCheck.includes(bank)) {
      const bankInContext = vectorizeSources.some(s => s.banca === bank);
      if (!bankInContext) {
        warnings.push(`Banca "${bank}" mencionada mas não está no contexto recuperado. Considere remover.`);
        corrected.statement = corrected.statement.replace(bank, "[banca]");
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors: errors,
    warnings: warnings,
    corrected: corrected,
    fieldValidation: {
      statement: !!question.statement && question.statement.length > 20,
      options: Array.isArray(question.options) && question.options.length >= 4,
      correctAnswer: ["A", "B", "C", "D", "E"].includes(question.correctAnswer),
      explanation: !!question.explanation && question.explanation.length > 30
    }
  };
}

/**
 * Pipeline completo RAG para concursos
 * @param {Object} params - { mode, filter, subject, vectorizeClient, llmClient }
 * @returns {Promise<Object>} Questão validada ou erro
 */
async function generateQuestionWithRAG(params) {
  const { mode, filter, subject, vectorizeClient, llmClient } = params;
  
  console.log(`[RAG] Iniciando pipeline para: ${mode}.${filter}`);
  
  // PASSO 1: Validar mapeamento filtro → coleção
  const mapping = validateFilterMapping(mode, filter);
  if (!mapping.valid) {
    console.warn(`[RAG] ${mapping.error}. Retornando modo fallback.`);
    return {
      success: false,
      mode: "fallback",
      message: `Desculpe, ainda não temos base de dados suficiente para ${subject}. Tente novamente em breve!`,
      disclosureRequired: true
    };
  }
  
  console.log(`[RAG] ✓ Mapeamento válido: ${mapping.collection}`);
  
  // PASSO 2: Recuperar contexto do Vectorize
  const contextResult = await retrieveVectorizeContext(
    vectorizeClient,
    mapping.collection,
    subject, // query
    mapping.minContextLength
  );
  
  console.log(`[RAG] Contexto recuperado: ${contextResult.contextLength} caracteres (suficiente: ${contextResult.sufficient})`);
  
  // PASSO 3: Construir prompt anti-alucinação
  const prompt = buildAntiHallucinationPrompt(subject, contextResult.context, contextResult.sufficient);
  
  // PASSO 4: Chamar LLM
  let question;
  try {
    const response = await llmClient.generateQuestion({
      prompt: prompt,
      subject: subject,
      temperature: 0.7,
      maxTokens: 1000
    });
    
    // Parse JSON da resposta
    question = JSON.parse(response);
  } catch (error) {
    console.error(`[RAG] Erro ao gerar questão: ${error.message}`);
    return {
      success: false,
      mode: "error",
      message: "Erro ao gerar questão. Tente novamente.",
      error: error.message
    };
  }
  
  // PASSO 5: Validar saída contra alucinação
  const validation = validateAgainstHallucination(question, subject, contextResult.sources);
  
  if (!validation.valid) {
    console.error(`[RAG] Validação falhou:`, validation.errors);
    return {
      success: false,
      mode: "validation_failed",
      message: "Questão gerada não passou na validação. Tente novamente.",
      errors: validation.errors
    };
  }
  
  // PASSO 6: Retornar questão validada com metadados
  const finalQuestion = validation.corrected;
  
  return {
    success: true,
    mode: "rag_success",
    question: finalQuestion,
    metadata: {
      vectorizeCollection: mapping.collection,
      contextLength: contextResult.contextLength,
      contextSufficient: contextResult.sufficient,
      sources: contextResult.sources,
      validationWarnings: validation.warnings,
      ragscore: contextResult.sufficient ? 0.95 : 0.6 // Score de confiabilidade RAG
    },
    disclosureRequired: !contextResult.sufficient
  };
}

// Exportar módulo
module.exports = {
  validateFilterMapping,
  retrieveVectorizeContext,
  buildAntiHallucinationPrompt,
  validateAgainstHallucination,
  generateQuestionWithRAG
};
