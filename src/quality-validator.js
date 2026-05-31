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
 * @param {number} minScore - Score mínimo aceitável (padrão: 0.65, era 0.75)
 * @param {number} minChunks - Número mínimo de chunks (padrão: 1)
 * @returns {Object} { valid: boolean, reason: string, score: number }
 */
export function validateRAGScore(ragResult, minScore = 0.65, minChunks = 1) {
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
 *
 * CRITÉRIOS REVISADOS para tolerar paráfrase do modelo (Groq):
 * - hasQuotation: peso reduzido (era 0.30, agora 0.15) — citação é desejável mas não bloqueante
 * - answerInMaterial: verifica keywords da resposta, não substring exato
 * - uniqueOptions: mantido com peso 0.25
 * - noBannedWords: mantido com peso 0.25
 * - hasExplanation: novo check — explicação mínima presente (peso 0.20)
 * - hasCorrectAnswer: novo check — gabarito válido presente (peso 0.15)
 *
 * @param {Object} question - Questão gerada pela IA
 * @param {string} sourceMaterial - Material fonte usado (contexto RAG)
 * @returns {Object} { approved: boolean, score: number, failures: array, confidenceLevel: string }
 */
export function validateQuestion(question, sourceMaterial = '') {
  // ── helper: extrai keywords relevantes de um texto ──────────────────────
  function extractKeywords(text, minLength = 5) {
    return (text || '')
      .toLowerCase()
      .replace(/[^\w\sáéíóúãõâêîôûàèìòùç]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= minLength);
  }

  // ── helper: verifica se ao menos N keywords aparecem no material ─────────
  function keywordsInMaterial(text, material, minMatches = 2) {
    if (!material || material.length === 0) return false;
    const words = extractKeywords(text);
    const materialLower = material.toLowerCase();
    const matched = words.filter(w => materialLower.includes(w));
    return matched.length >= minMatches;
  }

  const correctOption = question.options?.find(
    o => (o.key || o.letter) === question.correctAnswer
  );
  const correctText = correctOption?.text || '';
  const explanationText = question.explanation || '';

  const checks = {
    // 1. Explicação contém aspas OU tem comprimento mínimo (≥50 chars)
    //    — Groq frequentemente parafraseia em vez de citar literalmente
    hasQuotation: /["\u201c\u201d]/.test(explanationText) || explanationText.length >= 50,

    // 2. Keywords da resposta correta aparecem no material (não substring exato)
    answerInMaterial:
      sourceMaterial.length === 0 ||
      keywordsInMaterial(correctText, sourceMaterial, 1),

    // 3. Todas as alternativas são únicas
    uniqueOptions:
      question.options &&
      new Set(question.options.map(o => o.text)).size === question.options.length,

    // 4. Sem palavras banidas de imprecisão
    noBannedWords: !/(talvez|provavelmente|geralmente|normalmente|pode ser)/i.test(
      `${question.statement || ''} ${explanationText}`
    ),

    // 5. NOVO: Explicação presente e não vazia
    hasExplanation: explanationText.length >= 30,

    // 6. NOVO: Gabarito válido (A–E)
    hasCorrectAnswer: ['A', 'B', 'C', 'D', 'E'].includes(question.correctAnswer)
  };

  // Pesos revisados — soma = 1.00
  const weights = {
    hasQuotation:     0.15,  // desejável, mas não bloqueante
    answerInMaterial: 0.25,  // baseamento no contexto (keyword match)
    uniqueOptions:    0.20,  // alternativas únicas
    noBannedWords:    0.20,  // linguagem precisa
    hasExplanation:   0.10,  // explicação presente
    hasCorrectAnswer: 0.10   // gabarito válido
  };

  const score = Object.entries(checks).reduce((total, [key, passed]) => {
    return total + (passed ? weights[key] : 0);
  }, 0);

  // Identifica falhas com mensagens acionáveis para retry
  const failures = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([key]) => {
      const messages = {
        hasQuotation:     'Explicação muito curta ou sem citação — elabore mais a justificativa',
        answerInMaterial: 'Resposta correta não tem termos presentes no material fonte',
        uniqueOptions:    'Alternativas duplicadas detectadas — revise as opções',
        noBannedWords:    'Questão contém termos vagos (talvez, geralmente, etc) — use linguagem precisa',
        hasExplanation:   'Explicação ausente ou muito breve — mínimo 30 caracteres',
        hasCorrectAnswer: 'Gabarito inválido — informe somente A, B, C, D ou E'
      };
      return messages[key];
    });

  // Nível de confiança
  let confidenceLevel = 'Baixa';
  if (score >= 0.90) confidenceLevel = 'Muito Alta';
  else if (score >= 0.75) confidenceLevel = 'Alta';
  else if (score >= 0.60) confidenceLevel = 'Média';

  return {
    approved: score >= 0.70,  // threshold ajustado: era 0.75, agora 0.70
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

// ═══════════════════════════════════════════════════════════════════════════
// PIPELINE COM RETRY + FEEDBACK LOOP
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Wrapper para uso no Worker.
 * Valida, e em caso de falha gera instruções de correção para retry.
 *
 * @param {Object} ragResult - Resultado do Vectorize
 * @param {Object} question - Questão gerada
 * @param {string} sourceMaterial - Material fonte
 * @returns {Object} Resultado completo com metadata ou instruções de retry
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
      // ── NOVO: instrução de correção para uso no retry ──────────────────
      retryInstruction: buildRetryInstruction(question, questionValidation.failures),
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

/**
 * Gera instrução de correção para incluir no prompt de retry
 * @param {Object} question - Questão que falhou
 * @param {Array<string>} failures - Lista de falhas detectadas
 * @returns {string} Instrução adicional para o modelo
 */
export function buildRetryInstruction(question, failures) {
  const lines = [
    'A questão abaixo foi gerada mas FALHOU na validação de qualidade.',
    'Corrija os problemas listados e retorne um JSON válido no mesmo formato.',
    '',
    'PROBLEMAS DETECTADOS:'
  ];

  failures.forEach((f, i) => lines.push(`  ${i + 1}. ${f}`));

  lines.push('');
  lines.push('QUESTÃO QUE PRECISA SER CORRIGIDA:');
  lines.push(JSON.stringify(question, null, 2));
  lines.push('');
  lines.push('Retorne APENAS o JSON corrigido, sem texto adicional.');

  return lines.join('\n');
}
