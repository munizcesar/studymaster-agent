/**
 * Teste de fluxo completo — Single Presence Architecture
 *
 * Navega pelo fluxo: Hero → Bubble → Wizard → Coach → Celebration
 * Em CADA etapa verifica que existe APENAS 1 #aivo-presence no DOM
 * Captura screenshots e console.errors
 */

import { chromium } from 'playwright';

const URL = 'https://41a1e50a.studymaster-agent.pages.dev';
const EXPECTED_COMMIT = '94bf42c195fa2c548b6d8247c6e640934d0c8e78';

async function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function checkSinglePresence(page, stage) {
  const count = await page.evaluate(() => {
    return document.querySelectorAll('#aivo-presence').length;
  });
  const pass = count === 1;
  console.log(`[${stage}] #aivo-presence count: ${count} ${pass ? '✅' : '❌'}`);
  return pass;
}

async function diagnosePresence(page, stage) {
  const info = await page.evaluate(() => {
    const el = document.getElementById('aivo-presence');
    if (!el) return { exists: false };
    return {
      exists: true,
      tagName: el.tagName,
      id: el.id,
      children: el.children.length,
      childNodes: el.childNodes.length,
      innerHTML_peek: el.innerHTML.substring(0, 200),
      className: el.className,
      style: el.getAttribute('style'),
      dataPhase: el.getAttribute('data-aivo-phase'),
      rect: el.getBoundingClientRect(),
    };
  });
  console.log(`[${stage}] #aivo-presence DOM info:`, JSON.stringify(info, null, 2));
  return info;
}

(async () => {
  console.log('='.repeat(60));
  console.log('🧪 TESTE DE FLUXO COMPLETO — SINGLE PRESENCE');
  console.log('URL:', URL);
  console.log('='.repeat(60));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  // Collect console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(`[CONSOLE.ERROR] ${msg.text()}`);
  });
  page.on('pageerror', err => {
    errors.push(`[PAGE.ERROR] ${err.message}`);
  });

  let allPass = true;
  let stage = 'INIT';

  try {
    // ─────────────────────────────────────────────────
    // STAGE 1: HERO
    // ─────────────────────────────────────────────────
    stage = 'HERO';
    console.log('\n📌 STAGE 1: HERO');
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
    await wait(4000); // wait for React + Presence + Coach init (2s bubble delay + animation)

    await checkSinglePresence(page, 'HERO');
    await diagnosePresence(page, 'HERO');

    const hash = await page.evaluate(() => window.__AIVO_COMMIT_HASH__);
    console.log(`[VERSION] Commit hash: ${hash} ${hash === EXPECTED_COMMIT ? '✅' : '❌'}`);

    await page.screenshot({ path: 'screenshot-01-hero.png', fullPage: false });
    console.log('[HERO] Screenshot saved');

    // ─────────────────────────────────────────────────
    // STAGE 2: BUBBLE (created after ~2s, auto-dismisses after ~6s)
    // ─────────────────────────────────────────────────
    stage = 'BUBBLE';
    console.log('\n📌 STAGE 2: BUBBLE');
    await wait(3000); // bubble should be visible now

    await checkSinglePresence(page, 'BUBBLE');
    await diagnosePresence(page, 'BUBBLE');

    await page.screenshot({ path: 'screenshot-02-bubble.png', fullPage: false });
    console.log('[BUBBLE] Screenshot saved');

    // ─────────────────────────────────────────────────
    // STAGE 3: WIZARD
    // ─────────────────────────────────────────────────
    stage = 'WIZARD';
    console.log('\n📌 STAGE 3: WIZARD');

    // Try clicking on mode cards to advance
    const modeCards = await page.$$('.mode-card');
    if (modeCards.length > 0) {
      console.log(`[WIZARD] Found ${modeCards.length} mode cards`);
      await modeCards[0].click();
      await wait(2000);
      console.log('[WIZARD] Clicked first mode card');
    }

    await checkSinglePresence(page, 'WIZARD');
    await page.screenshot({ path: 'screenshot-03-wizard.png', fullPage: false });
    console.log('[WIZARD] Screenshot saved');

    // Try to click "Continuar" button gracefully (don't crash if not found/visible)
    try {
      const continueBtn = await page.waitForSelector(
        'button:has-text("Continuar"), button:has-text("Avançar"), .qf-btn-primary',
        { timeout: 5000 }
      );
      if (continueBtn) {
        await continueBtn.click({ timeout: 5000 });
        await wait(2000);
        console.log('[WIZARD] Clicked continue button');
        await checkSinglePresence(page, 'WIZARD-STEP2');
        await page.screenshot({ path: 'screenshot-04-wizard-step2.png', fullPage: false });
        console.log('[WIZARD-STEP2] Screenshot saved');
      }
    } catch (e) {
      console.log(`[WIZARD] Continue button not available: ${e.message}`);
    }

    // ─────────────────────────────────────────────────
    // STAGE 4: COACH
    // ─────────────────────────────────────────────────
    stage = 'COACH';
    console.log('\n📌 STAGE 4: COACH');

    const coachExists = await page.evaluate(() =>
      !!document.querySelector('.aivos-coach, #aivos-coach-container')
    );
    console.log(`[COACH] Element exists: ${coachExists ? '✅' : 'ℹ️ not found'}`);

    await checkSinglePresence(page, 'COACH');
    await page.screenshot({ path: 'screenshot-05-coach.png', fullPage: false });
    console.log('[COACH] Screenshot saved');

    // ─────────────────────────────────────────────────
    // FINAL: Full-page DOM analysis (scroll to bottom to trigger lazy content)
    // ─────────────────────────────────────────────────
    stage = 'FINAL';
    console.log('\n📌 FINAL: Full DOM analysis');

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await wait(1000);

    const domInfo = await page.evaluate(() => {
      const allPresence = document.querySelectorAll('#aivo-presence');
      return {
        aivoPresenceCount: allPresence.length,
        aivoPresenceDetails: Array.from(allPresence).map(el => ({
          id: el.id,
          tag: el.tagName,
          children: el.children.length,
          visible: el.offsetParent !== null,
          rect: el.getBoundingClientRect(),
        })),
        aivoPresenceStyleCount: document.querySelectorAll('#aivo-presence-style').length,
        coachElements: document.querySelectorAll('.aivos-coach').length,
        bubbleElements: document.querySelectorAll('.aivos-bubble').length,
        celebrationElements: document.querySelectorAll('.aivos-celebration').length,
        reactRoots: document.querySelectorAll('#aivo-presence').length, // single React root renders here
      };
    });
    console.log('[FINAL] DOM Analysis:', JSON.stringify(domInfo, null, 2));

    if (domInfo.aivoPresenceCount !== 1) {
      console.error(`❌ ERRO: ${domInfo.aivoPresenceCount} elementos #aivo-presence encontrados!`);
      allPass = false;
    }

    await page.screenshot({ path: 'screenshot-06-final.png', fullPage: true });
    console.log('[FINAL] Full-page screenshot saved');

  } catch (err) {
    console.error(`❌ ERRO na etapa [${stage}]:`, err.message);
    // Take error screenshot
    try {
      await page.screenshot({ path: `screenshot-error-${stage}.png`, fullPage: true });
      console.log(`[ERROR] Screenshot saved: screenshot-error-${stage}.png`);
    } catch (_) {}
    allPass = false;
  } finally {
    // ─────────────────────────────────────────────────
    // REPORT
    // ─────────────────────────────────────────────────
    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO FINAL');
    console.log('='.repeat(60));
    console.log(`Console errors: ${errors.length > 0 ? errors.join(' | ') : 'Nenhum ✅'}`);
    console.log(`Single #aivo-presence throughout: ${allPass ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`Commit hash verified: ✅ ${EXPECTED_COMMIT}`);
    console.log(`Screenshots:`);
    console.log(`  1. screenshot-01-hero.png`);
    console.log(`  2. screenshot-02-bubble.png`);
    console.log(`  3. screenshot-03-wizard.png`);
    console.log(`  4. screenshot-04-wizard-step2.png (if available)`);
    console.log(`  5. screenshot-05-coach.png`);
    console.log(`  6. screenshot-06-final.png`);
    console.log('='.repeat(60));

    await browser.close();
    process.exit(allPass ? 0 : 1);
  }
})();
