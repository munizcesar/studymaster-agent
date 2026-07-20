import { chromium, devices } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  
  console.log("=== INICIANDO VALIDAÇÃO FASE 6 ===");
  console.log("[Desktop] Inicializando...");
  const page = await browser.newPage();
  
  let consoleErrors = 0;
  page.on('pageerror', err => {
    console.log(`[Erro JS na Página] ${err.message}`);
    consoleErrors++;
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[Console Error] ${msg.text()}`);
      consoleErrors++;
    }
  });

  const filePath = `file:///${process.cwd().replace(/\\/g, '/')}/index.html`;
  await page.goto(filePath);
  console.log(`Página carregada: ${filePath}`);

  // Verificar Hero
  const heroExists = await page.locator('.hero-section, .hero-dashboard, main').first().isVisible();
  console.log(`- Hero visível: ${heroExists}`);

  // Verificar Buscador
  const searchExists = await page.locator('.search-section, #search-input').first().isVisible();
  console.log(`- Buscador visível: ${searchExists}`);

  // Verificar Módulos
  const modeCards = page.locator('.mode-card');
  const count = await modeCards.count();
  console.log(`- Quantidade de cards (.mode-card): ${count}`);

  // Testar clique nos Módulos
  console.log("[Interatividade] Clicando nos 4 módulos...");
  for (let i = 0; i < count; i++) {
    await modeCards.nth(i).click();
    const isSelected = await modeCards.nth(i).evaluate(node => node.classList.contains('selected'));
    console.log(`  Card ${i + 1} selecionado após clique: ${isSelected}`);
  }

  // Testar teclado (Tab)
  console.log("[Acessibilidade] Testando navegação por Tab...");
  await page.keyboard.press('Tab');
  console.log("- Navegação via teclado disparada sem falhas catastróficas.");

  // Testar Mobile
  console.log("[Mobile] Emulando iPhone 13 (390x844)...");
  const mobileContext = await browser.newContext({
    ...devices['iPhone 13']
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(filePath);
  
  const mobileCardsVisible = await mobilePage.locator('.mode-card').first().isVisible();
  console.log(`- Cards visíveis no Mobile: ${mobileCardsVisible}`);
  
  // Console
  console.log(`- Erros registrados no Console: ${consoleErrors}`);

  await browser.close();
  console.log("=== VALIDAÇÃO FASE 6 CONCLUÍDA ===");
})();
