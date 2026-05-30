/**
 * SUITE DE TESTES - FASE 1.5: VALIDAÇÃO ANTI-ALUCINAÇÃO
 * 
 * Objetivo: Validar que o sistema recusa consultas fora do escopo
 * Criterio de conclusão: 100% das consultas fora do escopo devem resultar em RECUSA ou FALLBACK
 * 
 * Execução:
 * node test-fase1-anti-hallucination.js <WORKER_URL>
 * 
 * Exemplo:
 * node test-fase1-anti-hallucination.js https://studymaster-worker.pages.dev
 */

const workerUrl = process.argv[2] || 'http://localhost:8787';

// ═══════════════════════════════════════════════════════════════════════════
// CONSULTAS FORA DO ESCOPO (10 por matéria = ~50 total)
// ═══════════════════════════════════════════════════════════════════════════

const testCases = {
  'concursos': [
    {
      id: 'pt-001',
      discipline: 'portugues',
      query: 'História medieval da Europa - Castelos e Feudalismo',
      expected: 'REFUSE',
      reason: 'História não é matéria de Português'
    },
    {
      id: 'pt-002',
      discipline: 'portugues',
      query: 'Física Quântica - Princípio da Incerteza de Heisenberg',
      expected: 'REFUSE',
      reason: 'Física Quântica não é matéria de Português'
    },
    {
      id: 'pt-003',
      discipline: 'portugues',
      query: 'Receitas de culinária - Como fazer bolo de chocolate',
      expected: 'REFUSE',
      reason: 'Culinária não é matéria de Português'
    },
    {
      id: 'pt-004',
      discipline: 'portugues',
      query: 'Programação Python - Loops e Conditionals',
      expected: 'REFUSE',
      reason: 'Programação não é matéria de Português'
    },
    {
      id: 'pt-005',
      discipline: 'portugues',
      query: 'Biologia Molecular - DNA e RNA',
      expected: 'REFUSE',
      reason: 'Biologia não é matéria de Português'
    },
    {
      id: 'pt-006',
      discipline: 'portugues',
      query: 'Astrologia - Signos do zodíaco',
      expected: 'REFUSE',
      reason: 'Astrologia não é matéria de Português (e é pseudociência)'
    },
    {
      id: 'pt-007',
      discipline: 'portugues',
      query: 'Culinária asiática - Receitas de sushi',
      expected: 'REFUSE',
      reason: 'Culinária não é matéria de Português'
    },
    {
      id: 'pt-008',
      discipline: 'portugues',
      query: 'Fenômenos paranormais - Telecinesia',
      expected: 'REFUSE',
      reason: 'Paranormal não é escopo educacional'
    },
    {
      id: 'pt-009',
      discipline: 'portugues',
      query: 'Como treinar seu dragão - Análise do filme',
      expected: 'REFUSE',
      reason: 'Análise de filme de fantasia não é matéria de Português'
    },
    {
      id: 'pt-010',
      discipline: 'portugues',
      query: 'Moda e design de roupas - Tendências 2026',
      expected: 'REFUSE',
      reason: 'Design de moda não é matéria de Português'
    },
    
    {
      id: 'dc-001',
      discipline: 'direito_constitucional',
      query: 'Receitas de bolo - Como fazer um bolo de chocolate',
      expected: 'REFUSE',
      reason: 'Receitas não são Direito Constitucional'
    },
    {
      id: 'dc-002',
      discipline: 'direito_constitucional',
      query: 'Astrofísica - Buracos negros e singularidades',
      expected: 'REFUSE',
      reason: 'Astrofísica não é Direito Constitucional'
    },
    {
      id: 'dc-003',
      discipline: 'direito_constitucional',
      query: 'Dança clássica - Técnicas de ballet',
      expected: 'REFUSE',
      reason: 'Dança não é Direito Constitucional'
    },
    {
      id: 'dc-004',
      discipline: 'direito_constitucional',
      query: 'Videogames - Estratégias no Minecraft',
      expected: 'REFUSE',
      reason: 'Videogames não são Direito Constitucional'
    },
    {
      id: 'dc-005',
      discipline: 'direito_constitucional',
      query: 'Literatura clássica - Análise de Dom Casmurro',
      expected: 'REFUSE',
      reason: 'Literatura clássica não é Direito Constitucional'
    },
    {
      id: 'dc-006',
      discipline: 'direito_constitucional',
      query: 'Futebol - Técnicas de defesa no sport',
      expected: 'REFUSE',
      reason: 'Futebol não é Direito Constitucional'
    },
    {
      id: 'dc-007',
      discipline: 'direito_constitucional',
      query: 'Musicologia - História da música clássica',
      expected: 'REFUSE',
      reason: 'Música clássica não é Direito Constitucional'
    },
    {
      id: 'dc-008',
      discipline: 'direito_constitucional',
      query: 'Jardinagem - Como plantar rosas',
      expected: 'REFUSE',
      reason: 'Jardinagem não é Direito Constitucional'
    },
    {
      id: 'dc-009',
      discipline: 'direito_constitucional',
      query: 'Astronomia - Fases da lua',
      expected: 'REFUSE',
      reason: 'Astronomia não é Direito Constitucional'
    },
    {
      id: 'dc-010',
      discipline: 'direito_constitucional',
      query: 'Culinária francesa - Técnicas de cozimento',
      expected: 'REFUSE',
      reason: 'Culinária não é Direito Constitucional'
    },
    
    {
      id: 'rl-001',
      discipline: 'raciocinio_logico',
      query: 'Poesia romântica - Análise de Castro Alves',
      expected: 'REFUSE',
      reason: 'Poesia não é Raciocínio Lógico'
    },
    {
      id: 'rl-002',
      discipline: 'raciocinio_logico',
      query: 'Culinária italiana - Receita de lasanha',
      expected: 'REFUSE',
      reason: 'Culinária não é Raciocínio Lógico'
    },
    {
      id: 'rl-003',
      discipline: 'raciocinio_logico',
      query: 'Biologia Marinha - Vida nos oceanos',
      expected: 'REFUSE',
      reason: 'Biologia Marinha não é Raciocínio Lógico'
    },
    {
      id: 'rl-004',
      discipline: 'raciocinio_logico',
      query: 'Arte renascentista - Obras de Michelangelo',
      expected: 'REFUSE',
      reason: 'Arte não é Raciocínio Lógico'
    },
    {
      id: 'rl-005',
      discipline: 'raciocinio_logico',
      query: 'Psicologia comportamental - Condicionamento clássico',
      expected: 'REFUSE',
      reason: 'Psicologia não é Raciocínio Lógico'
    },
    {
      id: 'rl-006',
      discipline: 'raciocinio_logico',
      query: 'Geologia - Formação de rochas vulcânicas',
      expected: 'REFUSE',
      reason: 'Geologia não é Raciocínio Lógico'
    },
    {
      id: 'rl-007',
      discipline: 'raciocinio_logico',
      query: 'Teatro - Técnicas de atuação',
      expected: 'REFUSE',
      reason: 'Teatro não é Raciocínio Lógico'
    },
    {
      id: 'rl-008',
      discipline: 'raciocinio_logico',
      query: 'Esportes radicais - Escalada em rocha',
      expected: 'REFUSE',
      reason: 'Esportes não são Raciocínio Lógico'
    },
    {
      id: 'rl-009',
      discipline: 'raciocinio_logico',
      query: 'Mitologia grega - Deuses e heróis',
      expected: 'REFUSE',
      reason: 'Mitologia não é Raciocínio Lógico'
    },
    {
      id: 'rl-010',
      discipline: 'raciocinio_logico',
      query: 'Dança moderna - Expressão artística',
      expected: 'REFUSE',
      reason: 'Dança não é Raciocínio Lógico'
    }
  ]
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITÁRIOS DE TESTE
// ═══════════════════════════════════════════════════════════════════════════

async function runTest(testCase) {
  const payload = {
    mode: 'concursos',
    filter: {
      content: {
        discipline: testCase.discipline,
        keyword: testCase.query
      }
    },
    quantity: 1,
    difficulty: 'medium'
  };

  try {
    const response = await fetch(`${workerUrl}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    // Validar recusa (erro 422 ou success: false)
    const isRecused = !data.success || 
                      data.error === 'CONTEXT_INSUFFICIENT' || 
                      data.error === 'RAG_LOW_CONFIDENCE' ||
                      response.status === 422;
    
    const passed = isRecused === (testCase.expected === 'REFUSE');

    return {
      ...testCase,
      status: passed ? '✅ PASSOU' : '❌ FALHOU',
      passed,
      responseStatus: response.status,
      responseError: data.error || 'success',
      responseMessage: data.userMessage || 'Questão gerada'
    };
  } catch (error) {
    return {
      ...testCase,
      status: '⚠️ ERRO',
      passed: false,
      error: error.message
    };
  }
}

async function runAllTests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('SUITE DE TESTES - FASE 1.5: VALIDAÇÃO ANTI-ALUCINAÇÃO');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const results = [];
  let passedCount = 0;
  let totalCount = 0;

  for (const [mode, tests] of Object.entries(testCases)) {
    console.log(`\n📋 Modo: ${mode} (${tests.length} testes)\n`);

    for (const test of tests) {
      const result = await runTest(test);
      results.push(result);
      totalCount++;
      if (result.passed) passedCount++;

      console.log(`${result.status} [${result.id}] ${result.reason}`);
      if (!result.passed) {
        console.log(`   └─ Esperado: REFUSE, Obtido: ${result.responseError}`);
      }
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`RESULTADO FINAL: ${passedCount}/${totalCount} testes passaram`);
  console.log(`Taxa de sucesso: ${((passedCount / totalCount) * 100).toFixed(1)}%`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (passedCount === totalCount) {
    console.log('🎉 SUCESSO! Todos os testes passaram.');
    console.log('O sistema está recusando corretamente consultas fora do escopo.\n');
    process.exit(0);
  } else {
    console.log(`⚠️ FALHA! ${totalCount - passedCount} teste(s) não passaram.`);
    console.log('Consultas fora do escopo estão sendo aceitas.\n');
    process.exit(1);
  }
}

// Executar
runAllTests().catch(err => {
  console.error('Erro geral:', err);
  process.exit(1);
});
