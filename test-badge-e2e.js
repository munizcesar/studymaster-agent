/**
 * test-badge-e2e.js
 *
 * Teste E2E do Badge de Confianca (Fase 3).
 *
 * Testa:
 * 1. Worker retorna questoes com _sources e _antiHallucination
 * 2. Renderizacao do badge com dados mockados
 * 3. Pipeline completo: worker -> badge renderizado (quando worker disponivel)
 *
 * ATENCAO: a funcao renderTrustBadge abaixo eh copia fiel da versao em index.html.
 * Mantenha sincronizada se alterar a original.
 *
 * Uso: node test-badge-e2e.js [WORKER_URL]
 * Ex:  node test-badge-e2e.js https://studymaster-worker.seudominio.workers.dev
 */

const WORKER_URL = process.argv[2] || 'http://localhost:8787';

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    console.log('  ✅', msg);
    passed++;
  } else {
    console.log('  ❌', msg);
    failed++;
  }
}

// ── Helper: simula renderTrustBadge (copiado do index.html) ──
function renderTrustBadge(q) {
  const badge = q._qualityBadge || {
    confidence: 'Media',
    emoji: '\ud83d\udfe1',
    score: '\u2014',
    message: 'Sem validacao de fontes. Verifique o conteudo.'
  };
  const confMap = {
    'Muito Alta': 'muito-alta',
    'Alta': 'alta',
    'Media': 'media',
    'Média': 'media',
    'Baixa': 'baixa'
  };
  const confClass = confMap[badge.confidence] || 'media';
  const sourcesCount = q._sources || badge.sources || 0;
  const antiH = q._antiHallucination || badge.antiHallucination || 'pending';
  const sourcesHtml = sourcesCount > 0
    ? '<span class="badge-sources">' + sourcesCount + ' fonte(s)</span>'
    : '';
  let antiHtml = '';
  if (antiH === 'verified') {
    antiHtml = '<span class="badge-verified">Verificado</span>';
  } else if (antiH === 'warning') {
    antiHtml = '<span class="badge-warnings">Revisao recomendada</span>';
  }
  const extraHtml = (sourcesHtml || antiHtml)
    ? '<div class="badge-extra">' + sourcesHtml + antiHtml + '</div>'
    : '';
  return (
    '<div class="quality-badge confidence-' + confClass + '">' +
    '<span class="badge-emoji">' + badge.emoji + '</span>' +
    '<div class="badge-info">' +
    '<strong>Confianca ' + badge.confidence + '</strong>' +
    '<span class="badge-tooltip">' + (badge.message || '') + '</span>' +
    extraHtml +
    '</div>' +
    '<span class="badge-score">' + (badge.score || '\u2014') + '</span>' +
    '</div>'
  );
}

// ═══════════════════════════════════════════════════════════════
// TEST SUITE 1: Worker API — questoes tem _sources e _antiHallucination
// ═══════════════════════════════════════════════════════════════
async function testWorkerApi() {
  console.log('\n═══════ TESTE 1: Worker API ═══════\n');

  const payloads = [
    {
      name: 'Concurso - Portugues',
      payload: {
        mode: 'concurso',
        filter: 'portugues',
        difficulty: 'medio',
        quantity: 1,
        sessionMode: 'concurso'
      }
    },
    {
      name: 'Concurso - Direito Constitucional',
      payload: {
        mode: 'concurso',
        filter: 'direito_constitucional',
        difficulty: 'medio',
        quantity: 1,
        sessionMode: 'concurso'
      }
    }
  ];

  let anyQuestionReturned = false;

  for (const t of payloads) {
    console.log(`\n--- ${t.name} ---`);
    try {
      const resp = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(t.payload)
      });
      const data = await resp.json();

      console.log('  Status:', resp.status);
      console.log('  Success:', data.success);

      // Se o worker retornou questoes
      if (data.success && data.questions && data.questions.length > 0) {
        anyQuestionReturned = true;
        const q = data.questions[0];
        console.log('  Statement:', (q.statement || '').substring(0, 80) + '...');
        console.log('  _sources:', q._sources);
        console.log('  _antiHallucination:', q._antiHallucination);

        assert(
          q._sources !== undefined,
          t.name + ': questao tem _sources (' + q._sources + ')'
        );
        assert(
          q._antiHallucination !== undefined,
          t.name + ': questao tem _antiHallucination (' + q._antiHallucination + ')'
        );
        assert(
          typeof q._sources === 'number' && q._sources >= 0,
          t.name + ': _sources e numero >= 0'
        );
        assert(
          q._antiHallucination === 'verified' || q._antiHallucination === 'warning',
          t.name + ': _antiHallucination e verified ou warning'
        );
        assert(
          q._sources > 0,
          t.name + ': _sources > 0 (deve ter pelo menos 1 chunk)'
        );

        // Pipeline completo: dados do worker -> badge renderizado
        if (q._sources !== undefined) {
          const badgeHtml = renderTrustBadge(q);
          assert(
            badgeHtml.includes(q._sources + ' fonte(s)'),
            t.name + ': badge renderizado mostra ' + q._sources + ' fonte(s)'
          );
          const antiStatus = q._antiHallucination === 'verified' ? 'Verificado' : 'Revisao';
          assert(
            badgeHtml.includes(antiStatus),
            t.name + ': badge reflete _antiHallucination = ' + q._antiHallucination
          );
        }
      } else {
        console.log('  (sem questoes retornadas — possivel fallback)');
        console.log('  Error:', data.error || data.message || 'N/A');
      }
    } catch (err) {
      console.log('  ERRO de rede:', err.message);
      console.log('  (worker pode nao estar rodando localmente)');
    }
  }

  if (!anyQuestionReturned) {
    console.log('\n  ⚠ Nenhuma questao retornada — pulando validacao de badge renderizado');
    console.log('  Dica: rode wrangler dev ou use a URL de producao');
  }
}

// ═══════════════════════════════════════════════════════════════
// TEST SUITE 2: RenderTrustBadge — saida HTML correta
// ═══════════════════════════════════════════════════════════════
function testBadgeRendering() {
  console.log('\n═══════ TESTE 2: Renderizacao do Badge ═══════\n');

  // 2a: Questao com _qualityBadge existente
  console.log('--- 2a: Questao com _qualityBadge existente ---');
  const q1 = {
    statement: 'Qual e a capital do Brasil?',
    _qualityBadge: {
      confidence: 'Alta',
      emoji: '\ud83d\udfe2',
      score: '85%',
      message: 'Fundamentada em 3 trecho(s) do material'
    },
    _sources: 3,
    _antiHallucination: 'verified'
  };
  const html1 = renderTrustBadge(q1);
  assert(html1.includes('confidence-alta'), '2a: classe confidence-alta');
  assert(html1.includes('85%'), '2a: score 85%');
  assert(html1.includes('3 fonte(s)'), '2a: mostra 3 fontes');
  assert(html1.includes('Verificado'), '2a: mostra Verificado');
  assert(html1.includes('Confianca Alta'), '2a: mostra Confianca Alta');
  assert(html1.includes('badge-extra'), '2a: tem badge-extra (fontes + verified)');

  // 2b: Questao sem _qualityBadge (fallback)
  console.log('\n--- 2b: Questao sem _qualityBadge (fallback) ---');
  const q2 = {
    statement: 'Pergunta generica sem metadados'
  };
  const html2 = renderTrustBadge(q2);
  assert(html2.includes('confidence-media'), '2b: fallback confidence-media');
  assert(html2.includes('Confianca Media'), '2b: fallback Confianca Media');
  assert(html2.includes('Sem validacao'), '2b: fallback message');
  assert(!html2.includes('badge-extra'), '2b: sem badge-extra (sem fontes)');

  // 2c: Questao com warning anti-alucinacao
  console.log('\n--- 2c: Questao com antiHallucination = warning ---');
  const q3 = {
    statement: 'Questao com alerta',
    _qualityBadge: {
      confidence: 'Baixa',
      emoji: '\ud83d\udd34',
      score: '45%',
      message: 'Confianca Baixa — verifique manualmente'
    },
    _sources: 1,
    _antiHallucination: 'warning'
  };
  const html3 = renderTrustBadge(q3);
  assert(html3.includes('confidence-baixa'), '2c: classe confidence-baixa');
  assert(html3.includes('45%'), '2c: score 45%');
  assert(html3.includes('1 fonte(s)'), '2c: mostra 1 fonte');
  assert(html3.includes('Revisao recomendada'), '2c: mostra Revisao recomendada');

  // 2d: Questao com 0 chunks (_sources = 0)
  console.log('\n--- 2d: Questao com _sources = 0 ---');
  const q4 = {
    statement: 'Questao sem fontes',
    _qualityBadge: {
      confidence: 'Baixa',
      emoji: '\ud83d\udd34',
      score: '30%',
      message: 'Sem fontes no material'
    },
    _sources: 0,
    _antiHallucination: 'pending'
  };
  const html4 = renderTrustBadge(q4);
  assert(!html4.includes('fonte(s)'), '2d: NAO mostra fontes quando _sources = 0');
  assert(!html4.includes('badge-extra'), '2d: sem badge-extra');
  assert(html4.includes('confidence-baixa'), '2d: classe confidence-baixa');

  // 2e: Questao com chunks reais (ex: 5 chunks)
  console.log('\n--- 2e: Questao com 5 chunks reais ---');
  const q5 = {
    statement: 'Questao com muitas fontes',
    _qualityBadge: {
      confidence: 'Muito Alta',
      emoji: '\ud83d\udfe2',
      score: '95%',
      message: 'Fundamentada em 5 trechos do material'
    },
    _sources: 5,
    _antiHallucination: 'verified'
  };
  const html5 = renderTrustBadge(q5);
  assert(html5.includes('confidence-muito-alta'), '2e: classe confidence-muito-alta');
  assert(html5.includes('5 fonte(s)'), '2e: mostra 5 fontes');
  assert(html5.includes('95%'), '2e: score 95%');

  console.log('');
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════
async function main() {
  console.log('Badge E2E Test Suite');
  console.log('Worker URL:', WORKER_URL);
  console.log('Data:', new Date().toISOString());

  // Test 1: Worker API
  await testWorkerApi();

  // Test 2: Badge rendering
  testBadgeRendering();

  // ── Summary ──
  const total = passed + failed;
  console.log('\n═══════════════════════════════');
  console.log(`Resultado: ${passed}/${total} passed`);
  if (failed > 0) {
    console.log(`           ${failed}/${total} FAILED ❌`);
    process.exit(1);
  } else {
    console.log('           TODOS OS TESTES PASSARAM ✅');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
