#!/usr/bin/env node

/**
 * test-rag-integration.js
 * 
 * Testa o endpoint RAG integrado no worker.js
 * Simula requisições do frontend para gerar questões de Concursos
 * 
 * Uso: node test-rag-integration.js
 */

const WORKER_URL = 'http://localhost:8787';  // Ajustar para URL de deploy

// ════════════════════════════════════════════════════════════════════════════
// TESTES
// ════════════════════════════════════════════════════════════════════════════

const tests = [
  {
    name: '1. Modo Concursos + Filtro Português',
    payload: {
      mode: 'concursos',
      filter: 'portugues',
      difficulty: 'medium',
      quantity: 1,
      questionType: 'mc',
      alternativas: 5,
      idioma: 'pt-BR',
      sessionMode: 'normal',
    },
    expected: {
      success: true,
      hasQuestions: true,
      hasMetadata: false,  // RAG retorna em novo formato se implementado
    },
  },
  {
    name: '2. Modo Concursos + Filtro Direito Constitucional',
    payload: {
      mode: 'concursos',
      filter: 'direito_constitucional',
      difficulty: 'hard',
      quantity: 2,
      questionType: 'mc',
      alternativas: 5,
      idioma: 'pt-BR',
      sessionMode: 'concurso',
    },
    expected: {
      success: true,
      hasQuestions: true,
    },
  },
  {
    name: '3. Modo Concursos + Filtro Inválido',
    payload: {
      mode: 'concursos',
      filter: 'materia_inexistente',
      difficulty: 'medium',
      quantity: 1,
      questionType: 'mc',
      alternativas: 5,
      idioma: 'pt-BR',
      sessionMode: 'normal',
    },
    expected: {
      success: false,
      hasError: true,
    },
  },
  {
    name: '4. Modo Academic (legado, deve continuar funcionando)',
    payload: {
      mode: 'academic',
      area: 'Saúde',
      subject: 'Anatomia',
      topic: 'Sistema Nervoso',
      difficulty: 'medium',
      quantity: 1,
      questionType: 'mc',
      alternativas: 5,
      idioma: 'pt-BR',
      sessionMode: 'normal',
    },
    expected: {
      success: true,
      hasQuestions: true,
    },
  },
];

// ════════════════════════════════════════════════════════════════════════════
// EXECUTAR TESTES
// ════════════════════════════════════════════════════════════════════════════

async function runTests() {
  console.log('🧪 Iniciando testes do pipeline RAG Concursos\n');
  console.log(`📍 Worker URL: ${WORKER_URL}\n`);

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`📝 ${test.name}`);
    console.log(`${'='.repeat(70)}`);

    try {
      const response = await fetch(`${WORKER_URL}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test.payload),
      });

      const data = await response.json();

      // Validar resposta
      let testPassed = true;

      if (test.expected.success !== undefined) {
        const hasSuccess = !!data.questions || !data.error;
        if (test.expected.success && !hasSuccess) {
          console.log(`❌ Esperado sucesso, mas recebeu erro`);
          console.log(`   Erro: ${data.error || data.userMessage}`);
          testPassed = false;
        } else if (!test.expected.success && hasSuccess) {
          console.log(`❌ Esperado erro, mas obteve sucesso`);
          testPassed = false;
        }
      }

      if (test.expected.hasQuestions && (!data.questions || data.questions.length === 0)) {
        console.log(`❌ Esperado questões, mas nenhuma foi retornada`);
        testPassed = false;
      }

      if (test.expected.hasError && !data.error && !data.userMessage) {
        console.log(`❌ Esperado mensagem de erro`);
        testPassed = false;
      }

      if (testPassed) {
        console.log(`✅ PASSOU`);
        if (data.questions && data.questions.length > 0) {
          const q = data.questions[0];
          console.log(`\n📄 Amostra de questão:`);
          console.log(`   Enunciado: ${q.statement.substring(0, 80)}...`);
          console.log(`   Opções: ${q.options.length}`);
          console.log(`   Resposta: ${q.correctAnswer}`);
          console.log(`   Fonte: ${q.fonte}`);
        }
        passed++;
      } else {
        failed++;
      }

      console.log(`\n📦 Resposta completa:`);
      console.log(JSON.stringify(data, null, 2).substring(0, 500));
    } catch (err) {
      console.log(`❌ ERRO DE CONEXÃO`);
      console.log(`   ${err.message}`);
      failed++;
    }
  }

  // Resumo
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📊 RESULTADO FINAL`);
  console.log(`${'='.repeat(70)}`);
  console.log(`✅ Passou: ${passed}/${tests.length}`);
  console.log(`❌ Falhou: ${failed}/${tests.length}`);

  if (failed === 0) {
    console.log(`\n🎉 Todos os testes passaram!`);
  } else {
    console.log(`\n⚠️  ${failed} teste(s) falharam. Verifique a saída acima.`);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// INICIAR
// ════════════════════════════════════════════════════════════════════════════

runTests().catch(console.error);
