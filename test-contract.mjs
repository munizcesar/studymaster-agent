/**
 * 🧪 CONTRACT TESTS — AIVO System Invariants
 *
 * Run before each deploy to validate:
 * - Exactly 1 #aivo-presence DOM node
 * - Exactly 1 React root
 * - Engine, AivoBus, AivoAPI exist
 * - State machine is in valid state
 * - Queue is not permanently stuck
 * - No duplicate singletons
 *
 * Usage: node test-contract.mjs
 */

import { chromium } from 'playwright';

const URL = 'https://41a1e50a.studymaster-agent.pages.dev';
const VIEWPORT = { width: 1280, height: 800 };
const TIMEOUT = 30000;

async function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ── Assertion helper ──

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, label, detail) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${label}`);
  } else {
    failed++;
    const msg = detail ? `${label}: ${detail}` : label;
    failures.push(msg);
    console.log(`  ❌ ${msg}`);
  }
}

function assertEqual(actual, expected, label) {
  assert(actual === expected, label, `esperado=${expected}, recebido=${actual}`);
}

async function assertCount(page, selector, expected, label) {
  const count = await page.evaluate((sel) => document.querySelectorAll(sel).length, selector);
  assertEqual(count, expected, label);
}

// ── Tests ──

(async () => {
  console.log('='.repeat(60));
  console.log('🧪 CONTRACT TESTS — AIVO Invariants');
  console.log(`URL: ${URL}`);
  console.log('='.repeat(60));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();

  // Collect console errors
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(`[CONSOLE] ${msg.text()}`);
  });

  try {
    // ─────────────────────────────────────────────────
    // 1. LOAD PAGE
    // ─────────────────────────────────────────────────
    console.log('\n📌 1. Load page');
    await page.goto(URL, { waitUntil: 'networkidle', timeout: TIMEOUT });
    await wait(4000); // wait for React + animations + watchman patrol

    // ─────────────────────────────────────────────────
    // 2. SINGLETON INVARIANTS
    // ─────────────────────────────────────────────────
    console.log('\n📌 2. Singleton invariants');

    await assertCount(page, '#aivo-presence', 1, 'Apenas 1 #aivo-presence no DOM');
    await assertCount(page, '#aivo-presence-style', 0, 'Zero #aivo-presence-style (legacy)');

    // ─────────────────────────────────────────────────
    // 3. GLOBAL API CONTRACTS
    // ─────────────────────────────────────────────────
    console.log('\n📌 3. Global API contracts');

    const apis = await page.evaluate(() => ({
      hasAivo: typeof (window).Aivo !== 'undefined',
      hasAivoAPI: typeof (window).AivoAPI !== 'undefined',
      hasAivoBus: typeof (window).AivoBus !== 'undefined',
      hasAivoPresence: typeof (window).AivoPresence !== 'undefined',
      hasCommitHash: typeof (window).__AIVO_COMMIT_HASH__ !== 'undefined',
      hasRootExists: typeof (window).__AIVO_ROOT_EXISTS__ !== 'undefined',
    }));
    assert(apis.hasAivo, 'window.Aivo existe');
    assert(apis.hasAivoAPI, 'window.AivoAPI existe');
    assert(apis.hasAivoBus, 'window.AivoBus existe');
    assert(apis.hasAivoPresence, 'window.AivoPresence existe');
    assert(apis.hasCommitHash, 'window.__AIVO_COMMIT_HASH__ existe');

    // Check window.AivoEngine (explicitly requested by user)
    const hasAivoEngine = await page.evaluate(() => typeof (window).AivoEngine !== 'undefined');
    assert(hasAivoEngine, 'window.AivoEngine existe');

    // ─────────────────────────────────────────────────
    // 4. ENGINE STATE
    // ─────────────────────────────────────────────────
    console.log('\n📌 4. Engine state');

    const debug = await page.evaluate(() => {
      const aivo = window.Aivo;
      if (!aivo || !aivo.debug) return null;
      return aivo.debug();
    });
    assert(debug !== null, 'Aivo.debug() retorna relatório');
    if (debug) {
      assert(debug.version && debug.version.length > 0, 'Relatório tem version');
      assert(debug.phase && debug.phase.length > 0, 'Relatório tem phase');
      assert(typeof debug.containerExists === 'boolean', 'Relatório tem containerExists');
      assert(typeof debug.rootExists === 'boolean', 'Relatório tem rootExists');
      assert(debug.containerExists === true, 'Container existe no DOM');
      assert(debug.rootExists === true, 'React Root existe');
      assert(typeof debug.recoveryCount === 'number', 'Relatório tem recoveryCount');
      assert(typeof debug.queueLength === 'number', 'Relatório tem queueLength');
      assert(typeof debug.uptimeMs === 'number' && debug.uptimeMs > 0, 'Uptime > 0');

      // Contract: queue should NOT be processing after stabilization
      assert(typeof debug.queueProcessing === 'boolean', 'Relatório tem queueProcessing');
      assert(debug.queueProcessing === false, 'Queue não está processando após estabilização',
        `queueProcessing=${debug.queueProcessing}`);

      // Contract: phase should be IDLE after stabilization
      assert(debug.phase === 'IDLE', 'Fase é IDLE após estabilização',
        `phase=${debug.phase}`);
    }

    // ─────────────────────────────────────────────────
    // 5. WATCHMAN ACTIVE
    // ─────────────────────────────────────────────────
    console.log('\n📌 5. Watchman active');

    const patrolResult = await page.evaluate(() => {
      const aivo = window.Aivo;
      if (!aivo || !aivo.patrol) return null;
      return aivo.patrol();
    });
    assert(patrolResult !== null, 'Aivo.patrol() executa');
    if (patrolResult && Array.isArray(patrolResult)) {
      const allOk = patrolResult.every(c => c.ok);
      assert(allOk, 'Todos invariantes OK', allOk ? '' : JSON.stringify(patrolResult.filter(c => !c.ok)));
      assert(patrolResult.some(c => c.name === 'presence' && c.ok), 'Check presence existe');
      assert(patrolResult.some(c => c.name === 'container' && c.ok), 'Check container existe');
      assert(patrolResult.some(c => c.name === 'rendered' && c.ok), 'Check rendered existe');
    }

    // ─────────────────────────────────────────────────
    // 6. COMMIT HASH VERIFIED
    // ─────────────────────────────────────────────────
    console.log('\n📌 6. Commit hash');

    const hash = await page.evaluate(() => window.__AIVO_COMMIT_HASH__);
    assert(hash && hash.length === 40, 'Commit hash tem 40 caracteres', hash ? `hash=${hash}` : 'undefined');

    // ─────────────────────────────────────────────────
    // 7. HEALTH DASHBOARD
    // ─────────────────────────────────────────────────
    console.log('\n📌 7. Health dashboard');

    const health = await page.evaluate(() => {
      const aivo = window.Aivo;
      if (!aivo || !aivo.health) return null;
      return aivo.health();
    });
    assert(health !== null, 'Aivo.health() retorna string');
    if (health) {
      assert(health.includes('AIVO Health Dashboard'), 'Health contém título');
      assert(health.includes('Phase:'), 'Health contém Phase');
      assert(health.includes('Emotion:'), 'Health contém Emotion');
      assert(health.includes('FPS:'), 'Health contém FPS');
      assert(health.includes('Recovery:'), 'Health contém Recovery');
    }

    // ─────────────────────────────────────────────────
    // 8. NO CRITICAL ERRORS
    // ─────────────────────────────────────────────────
    console.log('\n📌 8. Console errors check');

    if (errors.length > 0) {
      console.log(`  ⚠️ ${errors.length} erro(s) no console:`);
      errors.forEach(e => console.log(`    ${e}`));
    }
    // Only fail for critical errors (not 404s or benign)
    const critical = errors.filter(e =>
      !e.includes('404') && !e.includes('favicon') && !e.includes('preload')
    );
    assert(critical.length === 0, `Zero erros críticos no console`, critical.join(' | '));

  } catch (err) {
    console.error(`\n❌ ERRO durante os testes: ${err.message}`);
    failed++;
  } finally {
    // ─────────────────────────────────────────────────
    // REPORT
    // ─────────────────────────────────────────────────
    console.log('\n' + '='.repeat(60));
    const total = passed + failed;
    console.log(`📊 RESULTADO: ${passed}/${total} passaram  ${failed > 0 ? `❌ ${failed} falharam` : '✅ TUDO OK'}`);
    console.log('='.repeat(60));

    if (failures.length > 0) {
      console.log('\nFalhas:');
      failures.forEach(f => console.log(`  ❌ ${f}`));
    }

    await browser.close();
    process.exit(failed > 0 ? 1 : 0);
  }
})();
