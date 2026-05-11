/**
 * QUALITY VALIDATOR - Camadas 1 e 3 do Protocolo de Garantias
 * 
 * Este módulo implementa:
 * - Camada 1: Validação de Score Mínimo RAG
 * - Camada 3: Validação Pós-Geração
 * 
 * Uso:
 * import { validateRAGScore, validateQuestion } from './quality-validator.js';
 */

// ═══════════════════════════════════════════════════════════════════════════
// CAMADA 1: VALIDAÇÃO DE SCORE MÍNIMO RAG
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Valida se o contexto RAG é suficiente para gerar questão confiável
 * @param {Object} ragResult - Resultado do Vectorize query
 * @param {number} minScore - Score mínimo aceitável (padrão: 0.75)
 * @param {number} minChunks - Número mínimo de chunks (padrão: 1)
 * @returns {Object} { valid: boolean, reason: string, score: number }
 */
export function validateRAGScore(ragResult, minScore = 0.75, minChunks = 1) {
  // Verifica se há resultados
  if (!ragResult || !ragResult.matches || ragResult.matches.length === 0) {
    return {
      valid: false,
      reason: 'Nenhum contexto encontrado na base de dados',
      score: 0,
      userMessage: 'Material insuficiente. Por favor, forneça mais conteúdo sobre este tópico.'
    };
  }

  // Filtra matches com score adequado
  const validMatches = ragResult.matches.filter(m => m.score >= minScore);

  if (validMatches.length < minChunks) {
    return {
      valid: false,
      reason: `Apenas ${validMatches.length} chunk(s) com score >= ${minScore}. Mínimo requerido: ${minChunks}`,
      score: ragResult.matches[0]?.score || 0,
      userMessage: `Material encontrado tem baixa relevância (${Math.round((ragResult.matches[0]?.score || 0) * 100)}%). Refine sua busca ou forneça mais conteúdo.`
    };
  }

  // Score médio dos top matches válidos
  const avgScore = validMatches.slice(0, 3).reduce((sum, m) => sum + m.score, 0) / Math.min(3, validMatches.length);

  return {
    valid: true,
    reason: `${validMatches.length} chunks válidos encontrados`,
    score: avgScore,
    chunks: validMatches.length,
    topScore: ragResult.matches[0].score
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// CAMADA 3: VALIDAÇÃO PÓS-GERAÇÃO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Valida questão gerada contra critérios de qualidade
 * @param {Object} question - Questão gerada pela IA
 * @param {string} sourceMaterial - Material fonte usado (contexto RAG)
 * @returns {Object} { approved: boolean, score: number, failures: array, confidenceLevel: string }
 */
export function validateQuestion(question, sourceMaterial = '') {
  const checks = {
    // 1. Questão contém citação direta (aspas)
    hasQuotation: /["\u201c\u201d]/.test(question.explanation || ''),
    
    // 2. Resposta correta existe no material fonte
    answerInMaterial: sourceMaterial.length > 0 && 
                      sourceMaterial.toLowerCase().includes(
                        (question.options?.find(o => o.key === question.correctAnswer)?.text || '').toLowerCase().slice(0, 30)
                      ),
    
    // 3. Todas as alternativas são únicas
    uniqueOptions: question.options && 
                   new Set(question.options.map(o => o.text)).size === question.options.length,
    
    // 4. Sem palavras banidas
    noBannedWords: !/(talvez|provavelmente|geralmente|normalmente|pode ser)/i.test(
      `${question.statement || ''} ${question.explanation || ''}`
    )
  };

  // Calcula score de qualidade (baseado em pesos)
  const weights = {
    hasQuotation: 0.30,      // 30% - Citação literal é crítica
    answerInMaterial: 0.30,  // 30% - Resposta fundamentada
    uniqueOptions: 0.20,     // 20% - Alternativas únicas
    noBannedWords: 0.20      // 20% - Linguagem precisa
  };

  const score = Object.entries(checks).reduce((total, [key, passed]) => {
    return total + (passed ? weights[key] : 0);
  }, 0);

  // Identifica falhas
  const failures = Object.entries(checks)
    .filter(([key, passed]) => !passed)
    .map(([key]) => {
      const messages = {
        hasQuotation: 'Explicação não contém citação direta entre aspas',
        answerInMaterial: 'Resposta correta não encontrada no material fonte',
        uniqueOptions: 'Alternativas duplicadas detectadas',
        noBannedWords: 'Questão contém termos vagos (talvez, geralmente, etc)'
      };
      return messages[key];
    });

  // Nível de confiança
  let confidenceLevel = 'Baixa';
  if (score >= 0.90) confidenceLevel = 'Muito Alta';
  else if (score >= 0.75) confidenceLevel = 'Alta';
  else if (score >= 0.60) confidenceLevel = 'Média';

  return {
    approved: score >= 0.75,  // 75% é o mínimo aceitável
    score: Math.round(score * 100) / 100,
    scorePercentage: `${Math.round(score * 100)}%`,
    confidenceLevel,
    failures,
    details: checks
  };
}

/**
 * Gera badge de confiança para exibir ao usuário (Camada 4)
 * @param {Object} validation - Resultado de validateQuestion
 * @param {number} ragScore - Score do RAG
 * @param {number} chunksUsed - Número de chunks utilizados
 * @returns {Object} Badge metadata
 */
export function generateConfidenceBadge(validation, ragScore = 0, chunksUsed = 0) {
  return {
    display: true,
    confidence: validation.confidenceLevel,
    score: validation.scorePercentage,
    ragScore: `${Math.round(ragScore * 100)}%`,
    sources: chunksUsed,
    icon: validation.approved ? '✓' : '⚠',
    color: validation.approved ? 'green' : 'yellow',
    message: validation.approved 
      ? `✓ Fundamentada em ${chunksUsed} trecho(s) do material`
      : `⚠ Confiança ${validation.confidenceLevel} - ${validation.failures[0] || 'Valide manualmente'}`
  };
}

/**
 * Wrapper para uso no Worker - valida e retorna resposta formatada
 * @param {Object} ragResult - Resultado do Vectorize
 * @param {Object} question - Questão gerada
 * @param {string} sourceMaterial - Material fonte
 * @returns {Object} Resultado completo com metadata
 */
export function validateQuestionPipeline(ragResult, question, sourceMaterial) {
  // Camada 1: Valida RAG
  const ragValidation = validateRAGScore(ragResult);
  if (!ragValidation.valid) {
    return {
      success: false,
      error: 'RAG_INSUFFICIENT',
      message: ragValidation.userMessage,
      statusCode: 400
    };
  }

  // Camada 3: Valida Questão
  const questionValidation = validateQuestion(question, sourceMaterial);
  if (!questionValidation.approved) {
    return {
      success: false,
      error: 'QUALITY_CHECK_FAILED',
      message: 'Questão gerada não passou na validação de qualidade',
      details: questionValidation.failures,
      statusCode: 422
    };
  }

  // Camada 4: Gera Badge
  const badge = generateConfidenceBadge(
    questionValidation,
    ragValidation.score,
    ragValidation.chunks
  );

  return {
    success: true,
    question,
    metadata: {
      quality: {
        score: questionValidation.score,
        confidence: questionValidation.confidenceLevel,
        ragScore: ragValidation.score,
        chunksUsed: ragValidation.chunks
      },
      badge
    }
  };
}
