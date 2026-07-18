/**
 * 🎭 AIVO - Visual Validation Test
 * 
 * Captura screenshots do mascote em diferentes estados e posições
 * para validar visualmente o funcionamento do sistema Single Presence.
 */

const { test, expect } = require('@playwright/test');

test.describe('Aivo Mascot Visual Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Aguardar carregamento completo
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Aguardar inicialização do mascote
  });

  test('1. Verificar única instância #aivo-presence', async ({ page }) => {
    const presenceCount = await page.locator('#aivo-presence').count();
    console.log(`#aivo-presence count: ${presenceCount}`);
    expect(presenceCount).toBe(1);
    
    await page.screenshot({ path: 'screenshots/01-single-instance.png', fullPage: false });
  });

  test('2. Capturar mascote em Hero', async ({ page }) => {
    // Navegar para Hero
    await page.evaluate(() => {
      if (window.AivoAPI) {
        window.AivoAPI.render(document.querySelector('[data-aivo-anchor="hero"]'), { size: 'xl', state: 'greeting' });
      }
    });
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: 'screenshots/02-hero-greeting.png', fullPage: false });
  });

  test('3. Capturar mascote em Bubble', async ({ page }) => {
    // Navegar para Bubble
    await page.evaluate(() => {
      const bubble = document.getElementById('aivo-welcome-bubble');
      if (bubble && window.AivoAPI) {
        window.AivoAPI.render(bubble, { size: 56, state: 'greeting' });
      }
    });
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: 'screenshots/03-bubble-greeting.png', fullPage: false });
  });

  test('4. Capturar mascote em Wizard', async ({ page }) => {
    // Navegar para Wizard
    await page.evaluate(() => {
      if (window.AivoAPI) {
        window.AivoAPI.render(document.querySelector('[data-aivo-anchor="wizard"]'), { size: 'md', state: 'explaining' });
      }
    });
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: 'screenshots/04-wizard-explaining.png', fullPage: false });
  });

  test('5. Capturar mascote em Coach', async ({ page }) => {
    // Navegar para Coach
    await page.evaluate(() => {
      const coachAvatar = document.querySelector('#aivos-coach-avatar');
      if (coachAvatar && window.AivoAPI) {
        window.AivoAPI.render(coachAvatar, { size: 40, state: 'thinking' });
      }
    });
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: 'screenshots/05-coach-thinking.png', fullPage: false });
  });

  test('6. Capturar mascote em Celebration', async ({ page }) => {
    // Navegar para Celebration
    await page.evaluate(() => {
      const celebAvatar = document.querySelector('#aivos-celebration-avatar');
      if (celebAvatar && window.AivoAPI) {
        window.AivoAPI.render(celebAvatar, { size: 80, state: 'celebrating' });
      }
    });
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: 'screenshots/06-celebration-celebrating.png', fullPage: false });
  });

  test('7. Capturar todos os estados emocionais', async ({ page }) => {
    const states = [
      'idle', 'calm', 'greeting', 'sleepy', 'focus',
      'typing', 'password', 'listening', 'speaking', 'thinking',
      'teaching', 'walking', 'curious', 'loading', 'surprised',
      'confused', 'error', 'concerned', 'warning', 'success',
      'celebrating', 'happy', 'proud', 'hidden'
    ];

    for (const state of states) {
      await page.evaluate((s) => {
        if (window.Aivo) {
          window.Aivo.state(s);
        }
      }, state);
      await page.waitForTimeout(300);
      
      await page.screenshot({ 
        path: `screenshots/states/07-state-${state}.png`, 
        fullPage: false 
      });
      
      console.log(`Captured state: ${state}`);
    }
  });

  test('8. Demonstrar movimento entre containers', async ({ page }) => {
    const steps = [
      { name: 'hero', selector: '[data-aivo-anchor="hero"]', size: 'xl', state: 'greeting' },
      { name: 'bubble', selector: '#aivo-welcome-bubble', size: 56, state: 'idle' },
      { name: 'wizard', selector: '[data-aivo-anchor="wizard"]', size: 'md', state: 'explaining' },
      { name: 'coach', selector: '#aivos-coach-avatar', size: 40, state: 'thinking' },
      { name: 'celebration', selector: '#aivos-celebration-avatar', size: 80, state: 'celebrating' },
    ];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      await page.evaluate((s) => {
        const el = document.querySelector(s.selector);
        if (el && window.AivoAPI) {
          window.AivoAPI.render(el, { size: s.size, state: s.state });
        }
      }, step);
      await page.waitForTimeout(500);
      
      // Verificar que ainda existe apenas 1 #aivo-presence
      const count = await page.locator('#aivo-presence').count();
      console.log(`Step ${i + 1} (${step.name}): #aivo-presence count = ${count}`);
      
      await page.screenshot({ 
        path: `screenshots/movement/08-movement-${i + 1}-${step.name}.png`, 
        fullPage: false 
      });
    }

    // Go Home
    await page.evaluate(() => {
      if (window.Aivo) {
        window.Aivo.goHome();
      }
    });
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'screenshots/movement/08-movement-06-home.png', 
      fullPage: false 
    });
  });

  test('9. Executar comandos da API', async ({ page }) => {
    const commands = [
      { cmd: 'Aivo.state("thinking")', code: 'window.Aivo.state("thinking")' },
      { cmd: 'Aivo.state("celebrating")', code: 'window.Aivo.state("celebrating")' },
      { cmd: 'Aivo.move("#wizard")', code: 'window.Aivo.move("#wizard")' },
      { cmd: 'Aivo.move("#coach")', code: 'window.Aivo.move("#coach")' },
      { cmd: 'Aivo.goHome()', code: 'window.Aivo.goHome()' },
    ];

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      await page.evaluate((c) => eval(c), command.code);
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: `screenshots/api/09-api-${i + 1}-${command.cmd.replace(/[^a-z0-9]/gi, '_')}.png`, 
        fullPage: false 
      });
      
      console.log(`Executed: ${command.cmd}`);
    }
  });

  test('10. Capturar evidência de animações', async ({ page }) => {
    // Respiração (idle)
    await page.evaluate(() => {
      if (window.Aivo) window.Aivo.state('idle');
    });
    await page.waitForTimeout(2000); // Aguardar ciclo de respiração
    await page.screenshot({ path: 'screenshots/animations/10-animation-breathing.png', fullPage: false });

    // Piscar (focus)
    await page.evaluate(() => {
      if (window.Aivo) window.Aivo.state('focus');
    });
    await page.waitForTimeout(3000); // Aguardar piscada
    await page.screenshot({ path: 'screenshots/animations/10-animation-blinking.png', fullPage: false });

    // Speaking (boca animada)
    await page.evaluate(() => {
      if (window.Aivo) window.Aivo.state('speaking');
    });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/animations/10-animation-speaking.png', fullPage: false });

    // Thinking (rotação)
    await page.evaluate(() => {
      if (window.Aivo) window.Aivo.state('thinking');
    });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/animations/10-animation-thinking.png', fullPage: false });
  });

  test('11. Demonstrar tamanhos', async ({ page }) => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
    
    for (const size of sizes) {
      await page.evaluate((s) => {
        if (window.Aivo) {
          window.Aivo.move('[data-aivo-anchor="hero"]', { size: s, state: 'idle' });
        }
      }, size);
      await page.waitForTimeout(300);
      
      await page.screenshot({ 
        path: `screenshots/sizes/11-size-${size}.png`, 
        fullPage: false 
      });
      
      console.log(`Captured size: ${size}`);
    }
  });

  test('12. Demonstrar dark/light mode', async ({ page }) => {
    // Light mode
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
      if (window.Aivo) window.Aivo.state('idle');
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/themes/12-theme-light.png', fullPage: false });

    // Dark mode
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (window.Aivo) window.Aivo.state('idle');
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/themes/12-theme-dark.png', fullPage: false });
  });
});
