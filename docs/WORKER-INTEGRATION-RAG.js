/**
 * worker-integration-rag.js
 * 
 * Instruções de integração do RAG Handler no worker.js existente
 * 
 * Este arquivo mostra EXATAMENTE como integrar rag-handler.js
 * no seu worker.js atual para o modo "Concursos"
 */

// ============================================================================
// PASSO 1: Importar o módulo RAG Handler
// ============================================================================

// Adicionar no topo do seu worker.js:
const ragHandler = require('./rag-handler.js');

// ============================================================================
// PASSO 2: Carregar configurações JSON
// ============================================================================

// Em um ambiente Cloudflare Workers, usar KV Bindings para armazenar configs:
// No seu wrangler.toml:
//
// [[kv_namespaces]]
// binding = "CONFIG"
// id = "seu-namespace-id"
//
// Depois, no handler:

async function loadConfigs(env) {
  const taxonmy = JSON.parse(await env.CONFIG.get('taxonomy-concursos'));
  const prompts = JSON.parse(await env.CONFIG.get('prompts-anti-alucinacao'));
  return { taxonomy, prompts };
}

// ============================================================================
// PASSO 3: Integrar no seu endpoint existente
// ============================================================================

// Antes você tinha algo como:
/*
export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    
    if (pathname === '/api/generateQuestion') {
      // lógica antiga
    }
  }
};
*/

// Agora mudaria para:

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    const url = new URL(request.url);
    
    if (pathname === '/api/generateQuestion' && request.method === 'POST') {
      return handleGenerateQuestionWithRAG(request, env);
    }
    
    // Manter outros endpoints...
  }
};

// ============================================================================
// PASSO 4: Implementar handler para Concursos com RAG
// ============================================================================

async function handleGenerateQuestionWithRAG(request, env) {
  try {
    // Parsear request
    const body = await request.json();
    const { mode, filter, topic } = body;
    
    console.log(`[Concursos RAG] Recebido: mode=${mode}, filter=${filter}`);
    
    // Se NÃO for modo "concursos", usar lógica antiga
    if (mode !== 'concursos') {
      return handleGenerateQuestionLegacy(request, env);
    }
    
    // ========================================================================
    // FLUXO RAG PARA CONCURSOS
    // ========================================================================
    
    // 1. Validar mapeamento
    const filterMapping = ragHandler.validateFilterMapping(mode, filter);
    
    if (!filterMapping.valid) {
      return new Response(JSON.stringify({
        success: false,
        mode: "fallback",
        message: `Filtro não mapeado: ${filter}. Tente novamente em breve.`
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`[Concursos RAG] ✓ Filtro válido: ${filterMapping.collection}`);
    
    // 2. Recuperar contexto do Vectorize
    const vectorizeClient = new VectorizeClient(env);
    const contextResult = await ragHandler.retrieveVectorizeContext(
      vectorizeClient,
      filterMapping.collection,
      filter, // query
      filterMapping.minContextLength
    );
    
    console.log(
      `[Concursos RAG] Contexto: ${contextResult.contextLength} chars, ` +
      `Suficiente: ${contextResult.sufficient}`
    );
    
    // 3. Se contexto insuficiente E modo estrito, retornar erro gracioso
    if (!contextResult.sufficient) {
      return new Response(JSON.stringify({
        success: false,
        mode: "insufficient_context",
        message: `Desculpe, ainda não temos base de dados suficiente para ${filter}. Tente novamente em breve!`,
        disclosure: true
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 4. Construir prompt anti-alucinação
    const prompt = ragHandler.buildAntiHallucinationPrompt(
      filter,
      contextResult.context,
      contextResult.sufficient
    );
    
    // 5. Chamar LLM (Claude)
    const claudeClient = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    const messageResponse = await claudeClient.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });
    
    // Extrair resposta
    let questionText = messageResponse.content[0].text;
    
    // Parser JSON (lidar com possíveis formatações)
    let question;
    try {
      question = JSON.parse(questionText);
    } catch (e) {
      // Se houver ```json``` no início/fim, remover
      questionText = questionText
        .replace(/^```json\n?/i, '')
        .replace(/\n?```$/i, '');
      question = JSON.parse(questionText);
    }
    
    console.log(`[Concursos RAG] Questão gerada com sucesso`);
    
    // 6. Validar saída contra alucinação
    const validation = ragHandler.validateAgainstHallucination(
      question,
      filter,
      contextResult.sources
    );
    
    if (!validation.valid) {
      console.error(`[Concursos RAG] Validação falhou:`, validation.errors);
      return new Response(JSON.stringify({
        success: false,
        mode: "validation_failed",
        message: "Questão gerada não passou na validação. Tente novamente.",
        errors: validation.errors
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (validation.warnings.length > 0) {
      console.warn(
        `[Concursos RAG] Avisos de validação:`,
        validation.warnings
      );
    }
    
    // 7. Construir resposta final
    const finalQuestion = validation.corrected;
    
    const response = {
      success: true,
      mode: "rag_success",
      question: {
        statement: finalQuestion.statement,
        options: finalQuestion.options,
        correctAnswer: finalQuestion.correctAnswer,
        explanation: finalQuestion.explanation,
        conceptualBasis: finalQuestion.conceptualBasis || undefined
      },
      metadata: {
        vectorizeCollection: filterMapping.collection,
        contextLength: contextResult.contextLength,
        contextSufficient: contextResult.sufficient,
        sources: contextResult.sources.slice(0, 2), // Top 2 sources
        ragScore: contextResult.sufficient ? 0.95 : 0.60,
        validationWarnings: validation.warnings.length > 0 ? validation.warnings : undefined
      },
      disclosure: !contextResult.sufficient
        ? "Contexto insuficiente. Questão genérica."
        : undefined
    };
    
    console.log(`[Concursos RAG] ✓ Pipeline completo com sucesso`);
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error(`[Concursos RAG] Erro no pipeline:`, error);
    
    return new Response(JSON.stringify({
      success: false,
      mode: "error",
      message: "Erro ao gerar questão. Tente novamente.",
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// ============================================================================
// PASSO 5: Manter handler legado para outros modos
// ============================================================================

async function handleGenerateQuestionLegacy(request, env) {
  // Sua lógica existente para ENEM, estudo geral, etc.
  // Manter intacta
  console.log('[Legacy] Usando fluxo antigo para modo não-concursos');
  // ...
}

// ============================================================================
// PASSO 6: Cliente Vectorize (Cloudflare)
// ============================================================================

class VectorizeClient {
  constructor(env) {
    // Usar bindings do Cloudflare Workers
    // No wrangler.toml:
    // [[vectorize]]
    // binding = "VECTORIZE"
    // project_id = "seu-project-id"
    
    this.vectorize = env.VECTORIZE;
  }
  
  async search(collection, options) {
    // Implementar busca no Vectorize
    // Este é um placeholder - ajustar conforme SDK real
    
    try {
      const results = await this.vectorize.query(collection, {
        query: options.query,
        topK: options.limit || 5,
        includeMetadata: options.returnMetadata !== false
      });
      
      return results.map(r => ({
        text: r.text,
        score: r.score,
        metadata: r.metadata
      }));
    } catch (error) {
      console.error(`Erro Vectorize:`, error);
      return [];
    }
  }
}

// ============================================================================
// EXEMPLO DE USO (Frontend)
// ============================================================================

/*
// No seu index.html, quando usuário clica "Gerar Questão":

async function generateQuestionForConcursos() {
  const subject = document.getElementById("concursos-subject").value;
  
  const response = await fetch("/api/generateQuestion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "concursos",
      filter: subject,
      topic: null // opcional
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    displayQuestion(result.question);
    
    // Exibir informações de fonte
    if (result.metadata) {
      displayMetadata({
        source: result.metadata.vectorizeCollection,
        ragScore: result.metadata.ragScore,
        sources: result.metadata.sources
      });
    }
  } else {
    showError(result.message);
  }
}

function displayMetadata(metadata) {
  const div = document.querySelector(".question-metadata");
  div.innerHTML = `
    <small>
      Fonte: ${metadata.source}
      | Confiabilidade RAG: ${(metadata.ragScore * 100).toFixed(0)}%
      ${metadata.sources ? `| Baseado em: ${metadata.sources[0].source}` : ''}
    </small>
  `;
}
*/

// ============================================================================
// CHECKLIST DE INTEGRAÇÃO
// ============================================================================

/*
INTEGRAÇÃO DO RAG HANDLER - CHECKLIST:

[ ] 1. Copiar rag-handler.js para src/
[ ] 2. Copiar config JSONs (taxonomy-concursos.json, prompts-anti-alucinacao.json) para config/
[ ] 3. Importar ragHandler no worker.js
[ ] 4. Implementar handleGenerateQuestionWithRAG()
[ ] 5. Adicionar VectorizeClient para conexão
[ ] 6. Atualizar endpoint /api/generateQuestion para rotear concursos para RAG
[ ] 7. Atualizar index.html com novo seletor de matéria
[ ] 8. Adicionar função displayMetadata() no frontend
[ ] 9. Rodar testes: node src/test-rag-quality.js
[ ] 10. Deploy para Cloudflare Workers

CONFIGURAÇÃO CLOUDFLARE (wrangler.toml):

[[kv_namespaces]]
binding = "CONFIG"
id = "seu-namespace-id"

[[vectorize]]
binding = "VECTORIZE"
project_id = "seu-project-id"

[env.production]
vars = { ANTHROPIC_API_KEY = "seu-api-key" }
*/

// ============================================================================
// EXPORTAR
// ============================================================================

module.exports = {
  handleGenerateQuestionWithRAG,
  handleGenerateQuestionLegacy,
  loadConfigs,
  VectorizeClient
};
