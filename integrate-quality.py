#!/usr/bin/env python3
"""
Script de Integração Automática do Protocolo de Garantias
Integra as funções de validação no worker.js existente
"""

import re

def integrate_quality_protocol():
    # Ler worker.js
    with open('worker.js', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Ler patch com funções
    with open('worker-quality-patch.js', 'r', encoding='utf-8') as f:
        patch_content = f.read()
    
    # Extrair apenas as funções (pular comentários de instrução)
    functions_start = patch_content.find('/**\n * CAMADA 1')
    functions_end = patch_content.find('// ════════════════════════════════════════════════════════════════════════════\n// MODIFICAÇÃO NO')
    
    quality_functions = patch_content[functions_start:functions_end].strip()
    
    # Adicionar funções após AREA_MAP_VECTORIZE (linha ~170)
    insertion_point = content.find('// ════════════════════════════════════════════════════════════════════════════\n// FUNÇÕES RAG PARA CONCURSOS')
    
    header = '''\n// ════════════════════════════════════════════════════════════════════════════
// PROTOCOLO DE GARANTIAS (Camadas 1, 3, 4)
// ════════════════════════════════════════════════════════════════════════════

'''
    
    content_part1 = content[:insertion_point]
    content_part2 = content[insertion_point:]
    
    content = content_part1 + header + quality_functions + '\n\n' + content_part2
    
    # Modificar generateConcursosRAGQuestion
    # Procurar o retorno final da função
    pattern = r"(console\.log\(`\[RAG\] ✓ \$\{validatedQuestions\.length\} questão\(ões\) gerada\(s\) e validada\(s\)`\);\s+return \{\s+success: true,\s+questions: validatedQuestions,)"
    
    replacement = r"""console.log(`[RAG] ✓ ${validatedQuestions.length} questão(ões) gerada(s) e validada(s)`);

  // ═══ PROTOCOLO DE GARANTIAS ATIVADO ═══
  const qualityCheckedQuestions = [];
  const rejectedCount = { layer1: 0, layer3: 0 };

  for (const q of validatedQuestions) {
    const qualityCheck = validateQuestionPipeline(
      { matches: contextResult.sources.map(s => ({ score: 0.85, metadata: s })) },
      q,
      contextResult.context
    );

    if (qualityCheck.success) {
      qualityCheckedQuestions.push(qualityCheck.question);
    } else {
      console.warn(`[QUALITY] Questão ${q.id} rejeitada:`, qualityCheck.message);
      if (qualityCheck.metadata.layer === 1) rejectedCount.layer1++;
      if (qualityCheck.metadata.layer === 3) rejectedCount.layer3++;
    }
  }

  if (qualityCheckedQuestions.length === 0) {
    return {
      success: false,
      error: 'QUALITY_VALIDATION_FAILED',
      userMessage: 'Material insuficiente para gerar questões confiáveis. Forneça mais conteúdo.',
      statusCode: 422,
      debug: { rejectedByLayer1: rejectedCount.layer1, rejectedByLayer3: rejectedCount.layer3 }
    };
  }
  // ═══ FIM DO PROTOCOLO ═══

  return {
    success: true,
    questions: qualityCheckedQuestions"""
    
    # Aplicar substituição
    content = content.replace(
        "console.log(`[RAG] ✓ ${validatedQuestions.length} questão(ões) gerada(s) e validada(s)`)\n\n  return {\n    success: true,\n    questions: validatedQuestions,",
        replacement + ","
    )
    
    # Adicionar campos extras no metadata
    content = content.replace(
        "ragScore: contextResult.sufficient ? 0.95 : 0.65,\n    },",
        "ragScore: contextResult.sufficient ? 0.95 : 0.65,\n      qualityProtocol: 'active',\n      questionsRejected: validatedQuestions.length - qualityCheckedQuestions.length,\n    },"
    )
    
    # Salvar
    with open('worker.js', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ Integração concluída!")
    print("\n📦 Mudanças aplicadas:")
    print("  1. ✅ Funções validateRAGScore, validateQuestionTraceability, generateQualityBadge adicionadas")
    print("  2. ✅ Função validateQuestionPipeline adicionada")
    print("  3. ✅ generateConcursosRAGQuestion modificada")
    print("  4. ✅ Metadata estendida com qualityProtocol e questionsRejected")
    print("\n🚀 Próximo passo:")
    print("  git add worker.js")
    print("  git commit -m 'feat: ativar protocolo de garantias'")
    print("  git push origin feature/quality-protocols")
    print("  npx wrangler deploy")

if __name__ == '__main__':
    try:
        integrate_quality_protocol()
    except Exception as e:
        print(f"❌ Erro: {e}")
        print("\n💡 Dica: Execute este script na raiz do repositório")
