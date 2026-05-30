// ════════════════════════════════════════════════════════════════════════════
// StudyMaster AI Worker — Cloudflare Worker + Groq API + Vectorize RAG
// Fase 1: Blindagem da Base (Endurecimento de Thresholds + Validação de Pipeline)
// ════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES DE VALIDAÇÃO (CAMADAS 1, 3, 4)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * CAMADA 1: Validação RAG Score
 * Garante que questões são baseadas em material confiável (score >= 0.75)
 */
function validateRAGScore(ragResults, minScore = 0.75) {
  if (!ragResults?.matches || ragResults.matches.length === 0) {
    return {
      valid: false,
      score: 0,
      reason: 'RAG_EMPTY',
      message: 'Nenhum material encontrado no banco de dados'
    };
  }

  const topScores = ragResults.matches
    .map(m => m.score || 0)
    .sort((a, b) => b - a)
    .slice(0, 3);

  const avgScore = topScores.reduce((a, b) => a + b, 0) / topScores.length;

  if (avgScore < minScore) {
    return {
      valid: false,
      score: avgScore,
      reason: 'RAG_LOW_CONFIDENCE',
      message: `Material insuficiente (score: ${(avgScore * 100).toFixed(0)}%, mínimo: ${(minScore * 100).toFixed(0)}%)`
    };
  }

  return {
    valid: true,
    score: avgScore,
    matchCount: ragResults.matches.length,
    message: `✓ Material verificado (${ragResults.matches.length} trechos relevantes)`
  };
}

/**
 * CAMADA 3: Validação de Rastreabilidade
 * Verifica se a questão pode ser rastreada ao material fonte
 */
function validateQuestionTraceability(question, contextText) {
  if (!contextText || contextText.length < 100) {
    return {
      valid: false,
      reason: 'NO_CONTEXT',
      coverage: '0%',
      message: 'Contexto insuficiente para validação'
    };
  }

  const contextLower = contextText.toLowerCase();
  const statementLower = question.statement.toLowerCase();
  const explanationLower = (question.explanation || '').toLowerCase();

  // Extrai termos-chave da questão (palavras com 5+ caracteres)
  const extractKeyTerms = (text) => {
    return text
      .replace(/[^\w\sáàâãéèêíïóôõöúçñ]/gi, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 5)
      .filter(w => !/^(questão|sobre|quando|conforme|segundo|assim|então|portanto|todavia|contudo|porque|porém|ainda|também|apenas|somente)$/i.test(w));
  };

  const keyTerms = [
    ...extractKeyTerms(statementLower),
    ...extractKeyTerms(explanationLower)
  ];

  if (keyTerms.length === 0) {
    return {
      valid: false,
      reason: 'NO_KEY_TERMS',
      coverage: '0%',
      message: 'Questão muito genérica, sem termos específicos'
    };
  }

  // Conta quantos termos aparecem no contexto
  const matchedTerms = keyTerms.filter(term => contextLower.includes(term));
  const coverageRatio = matchedTerms.length / keyTerms.length;

  if (coverageRatio < 0.3) {
    return {
      valid: false,
      reason: 'LOW_TRACEABILITY',
      coverage: (coverageRatio * 100).toFixed(0) + '%',
      message: `Questão não rastreável ao material (apenas ${(coverageRatio * 100).toFixed(0)}% dos termos encontrados)`
    };
  }

  return {
    valid: true,
    coverage: (coverageRatio * 100).toFixed(0) + '%',
    matchedTerms: matchedTerms.length,
    totalTerms: keyTerms.length,
    message: `✓ Questão rastreável (${matchedTerms.length}/${keyTerms.length} termos no material)`
  };
}

/**
 * CAMADA 4: Badge de Confiança
 * Gera indicador visual de qualidade da questão
 */
function generateQualityBadge(ragScore, traceability) {
  const score = (ragScore * 0.6 + (parseFloat(traceability.coverage) / 100) * 0.4);
  
  let confidence, emoji, message;
  
  if (score >= 0.85) {
    confidence = 'Alta';
    emoji = '🟢';
    message = `Fundamentada em ${traceability.matchedTerms} trechos do material`;
  } else if (score >= 0.70) {
    confidence = 'Média';
    emoji = '🟡';
    message = `Baseada parcialmente no material (${traceability.coverage}% cobertura)`;
  } else {
    confidence = 'Baixa';
    emoji = '🔴';
    message = `Material insuficiente para validação completa`;
  }

  return {
    confidence,
    emoji,
    score: (score * 100).toFixed(0) + '%',
    message: `${emoji} ${message}`,
    _internal: {
      ragScore,
      traceability: traceability.coverage,
      combinedScore: score
    }
  };
}

/**
 * PIPELINE COMPLETO: Valida questão através de todas as camadas
 * Retorna objeto { success: bool, question: object | null, metadata: object }
 */
function validateQuestionPipeline(ragResults, question, contextText, minScore = 0.75) {
  // Camada 1: Valida RAG Score
  const ragValidation = validateRAGScore(ragResults, minScore);
  if (!ragValidation.valid) {
    return {
      success: false,
      reason: ragValidation.reason,
      message: ragValidation.message,
      metadata: { layer: 1, ragScore: ragValidation.score }
    };
  }

  // Camada 3: Valida rastreabilidade
  const traceValidation = validateQuestionTraceability(question, contextText);
  if (!traceValidation.valid) {
    return {
      success: false,
      reason: traceValidation.reason,
      message: traceValidation.message,
      metadata: { layer: 3, coverage: traceValidation.coverage }
    };
  }

  // Camada 4: Gera badge
  const badge = generateQualityBadge(ragValidation.score, traceValidation);

  return {
    success: true,
    question: {
      ...question,
      _qualityBadge: badge
    },
    metadata: {
      layers: [1, 3, 4],
      ragScore: ragValidation.score,
      traceability: traceValidation.coverage,
      badge: badge.confidence
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// IMPORTAR DO ARQUIVO WRANGLER COMPILADO
// ═══════════════════════════════════════════════════════════════════════════
// Este arquivo deve ser usado como base.
// As funções acima devem ser injetadas no arquivo compilado em .wrangler/tmp/dev-3Oyu3j/worker.js
// ANTES da função generateConcursosRAGQuestion (aprox. linha 634)

// INSTRUÇÕES DE INTEGRAÇÃO:
// 1. Copiar as 4 funções acima (validateRAGScore, validateQuestionTraceability, generateQualityBadge, validateQuestionPipeline)
// 2. Inserir ANTES da função generateConcursosRAGQuestion (~linha 634)
// 3. Na função generateConcursosRAGQuestion, após "validatedQuestions.push(...)", adicionar:
//    
//    // PIPELINE DE VALIDAÇÃO ATIVADO
//    const pipelineCheck = validateQuestionPipeline(
//      { matches: [{ score: contextResult.sufficient ? 0.95 : 0.65 }] },
//      finalQuestion,
//      contextResult.context,
//      0.75
//    );
//    
//    if (pipelineCheck.success) {
//      validatedQuestions.push(pipelineCheck.question);  // Questão com _qualityBadge
//    } else {
//      console.warn(`[QUALITY-CHECK] Questão ${finalQuestion.id} rejeitada:`, pipelineCheck.message);
//      rejectedCount++;
//    }
//
// 4. Fazer o mesmo para generateAcademicRAGQuestion
// 5. Executar: wrangler deploy
// 6. Testar com curl:
//    curl -X POST https://studymaster-worker.pages.dev/generate \
//      -H "Content-Type: application/json" \
//      -d '{"mode":"concursos","filter":{"content":{"discipline":"portugues"}},"quantity":1}'
// 7. Validar que resposta contém "_qualityBadge" em cada questão

export default {};
