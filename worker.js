// UPDATED: StudyMaster AI Worker — Cloudflare Worker + Groq API + Vectorize RAG
// Nota: ajustes Fase 1 — endurecimento de thresholds e cláusula explícita de recusa

// (conteúdo original preservado; apenas trechos relevantes foram ajustados)

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://studymaster-agent.pages.dev',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

// ...

function validateRAGScore(ragResults, minScore = 0.75) {
  // inalterado; minScore padrão já é 0.75
}

async function fetchVectorizeContext(env, collection, query, minLength) {
  // ... código anterior ...
    const documents = results.matches
      .filter((m) => m.score >= 0.75) // antes: 0.65 — Fase 1 endurecida
      .slice(0, 3)
      .map((m) => ({
        text: m.metadata?.text || m.text || '',
        source: m.metadata?.source || 'Acervo de Concursos',
        score: m.score,
      }))
      .filter((d) => d.text.trim().length > 0);
  // ... resto inalterado ...
}

async function fetchVademecumRAG(query, subarea, env) {
  // ... código anterior ...
    const artigosRelevantes = results.matches
      .filter((m) => m.score >= 0.75) // antes: 0.70 — alinhado ao minScore 0.75
      .slice(0, 8)
      .map((m) => m.metadata?.text || '')
      .filter(Boolean);
  // ... resto inalterado ...
}

async function generateConcursosRAGQuestion(body, env) {
  // ... código anterior ...

  const antiHallucinationRules = `
RESTRIÇÕES OBRIGATÓRIAS:
- NÃO invente banca, concurso, prova ou ano
- NÃO invente artigos de lei ou números de súmulas
- Use APENAS conceitos e contexto fornecido
- Cite apenas referências normativas válidas: ${subjectConfig.conceptualBases}
- Campo "fonte" deve ser preenchido com base legal/conceitual verificada
- SE o contexto RAG for insuficiente ou o protocolo de validação reprovar, recuse a geração e explique o motivo. NÃO responda com base em conhecimento próprio.`;

  const systemText = `Você é um examinador acadêmico especializado em concursos públicos. Retorne APENAS JSON válido com a chave "questions".
Responda em português do Brasil.

PRINCÍPIOS INEGOCIÁVEIS:
- Use APENAS conhecimento factício consolidado
- ${antiHallucinationRules}
- SE o contexto fornecido for insuficiente, inconsistente ou reprovado pelas validações, você DEVE recusar gerar a questão, explicando o motivo, em vez de tentar completar com suposições.`;

  // ... restante da função inalterado ...
}

async function generateAcademicRAGQuestion(body, env) {
  // ... código anterior ...

  const antiHallucinationRules = `
RESTRIÇÕES OBRIGATÓRIAS:
- NÃO invente teorias, descobertas ou conceitos não comprovados
- Use APENAS fundamentos consolidados e verificáveis
- Cite apenas referências válidas: ${areaConfig.conceptualBases}
- Campo "fonte" deve sempre ser preenchido com conceito/teoria verificável
- NUNCA cite trabalhos fictícios, anos inexatos ou autores não confirmados
- SE o contexto RAG for insuficiente ou reprovar nas validações, recuse a geração e explique o motivo. NÃO responda com base em intuição.`;

  const systemText = `Você é um professor acadêmico especialista em ${areaConfig.label}. Retorne APENAS JSON válido com a chave "questions".
Responda em português do Brasil.

PRINCÍPIOS INEGOCIÁVEIS:
- Use APENAS conhecimento consolidado e verificável
- ${antiHallucinationRules}
- Quando o contexto não atingir o mínimo necessário ou falhar nas validações, você DEVE recusar gerar a questão, deixando claro que o material não é suficiente.`;

  // ... restante da função inalterado ...
}

export default {
  async fetch(request, env) {
    // ... resto igual ao original ...
  },
};
