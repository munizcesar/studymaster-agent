/**
 * Fix mascot positions in index.html:
 * 1. Remove old avatar div from header
 * 2. Add new mascot container beside "Como você quer estudar hoje?"
 * 3. Replace old avatar render with new AivoAPI.render
 * 4. Replace welcome bubble with new mascot card
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

let count = 0;

// 1. Remove header avatar
const headerAvatar = '          <div id="aivos-header-avatar"></div>\n        </div>';
if (content.includes(headerAvatar)) {
  content = content.replace(headerAvatar, '        </div>');
  count++;
  console.log('✓ Removed old header avatar');
} else {
  console.log('✗ Header avatar string not found - trying alternative...');
  // Try without newline
  const alt1 = '          <div id="aivos-header-avatar"></div>\n        </div>';
  if (content.includes(alt1)) {
    content = content.replace(alt1, '        </div>');
    count++;
    console.log('✓ Removed old header avatar (alt1)');
  } else {
    console.log('✗ Still not found');
  }
}

// 2. Add mascot beside wizard title
const wizardTitle = '          <h2 class="step-title">Como você quer estudar hoje?</h2>';
if (content.includes(wizardTitle)) {
  const newWizard = '          <div class="step-title-row" style="display:flex;align-items:center;gap:16px;">\n            <h2 class="step-title" style="margin:0;">Como você quer estudar hoje?</h2>\n            <div id="wizard-mascot" style="flex-shrink:0;"></div>\n          </div>';
  content = content.replace(wizardTitle, newWizard);
  count++;
  console.log('✓ Added mascot container beside wizard title');
} else {
  console.log('✗ Wizard title not found');
}

// 3. Replace old avatar render code
const oldRender = '    /* Render avatar in header */\n    if (avatarContainer && window.AivosAvatar) {\n      AivosAvatar.render(avatarContainer, { size: \'sm\', state: \'idle\' });\n    }';
if (content.includes(oldRender)) {
  const newRender = '    /* Render new Aivo mascot beside wizard title */\n    var wizardMascotEl = document.getElementById(\'wizard-mascot\');\n    if (wizardMascotEl && window.AivoAPI) {\n      window.AivoAPI.render(wizardMascotEl, { size: \'md\', state: \'greeting\' });\n    }';
  content = content.replace(oldRender, newRender);
  count++;
  console.log('✓ Replaced old avatar render with new AivoAPI.render');
} else {
  console.log('✗ Old render code not found');
}

// 4. Replace welcome bubble
const welcomeStart = '    /* Welcome bubble with contextual data */\n    setTimeout(function() {\n      if (typeof AivosBubble === \'undefined\') return;';
const welcomeEnd = '    }, 2000);';

const startIdx = content.indexOf(welcomeStart);
if (startIdx !== -1) {
  const endIdx = content.indexOf(welcomeEnd, startIdx);
  if (endIdx !== -1) {
    const fullWelcomeBlock = content.slice(startIdx, endIdx + welcomeEnd.length);
    
    const newWelcome = `    /* Welcome card with new Aivo mascot */\n    setTimeout(function() {\n      var welcomeMessage = 'Ol\u00e1! Sou o AIVOS, seu assistente de estudos.';\n      if (window.AivosTracker) {\n        try {\n          var summary = AivosTracker.getSummary();\n          if (summary && summary.questions > 0) {\n            var streak = summary.streak || 0;\n            if (streak >= 5) {\n              welcomeMessage = 'Bem-vindo de volta! Voce esta com uma sequencia de ' + streak + ' acertos! \\ud83d\\udd25';\n            } else if (summary.accuracy >= 70) {\n              welcomeMessage = 'Bem-vindo! Seu rendimento geral e de ' + summary.accuracy + '%. Continue assim! \\ud83d\\udcaa';\n            } else {\n              welcomeMessage = 'Bem-vindo! Voce ja respondeu ' + summary.questions + ' questoes ate agora. Vamos estudar?';\n            }\n          }\n        } catch(e) {}\n      }\n\n      /* Create welcome card with Aivo mascot */\n      var wizardCard = document.getElementById('wizard-card');\n      if (!wizardCard) return;\n      var existing = document.getElementById('aivo-welcome-card');\n      if (existing) existing.remove();\n\n      var card = document.createElement('div');\n      card.id = 'aivo-welcome-card';\n      card.style.cssText = 'display:flex;align-items:center;gap:16px;padding:16px 20px;margin-bottom:20px;background:var(--color-surface);border:1px solid var(--color-divider);border-radius:14px;box-shadow:0 4px 20px rgba(13,71,255,0.07);';\n      card.innerHTML =\n        '<div id=\"aivo-welcome-mascot\" style=\"flex-shrink:0;width:72px;height:72px;\"></div>' +\n        '<div style=\"flex:1;min-width:0;\">' +\n          '<strong style=\"display:block;font-family:var(--font-display);font-size:var(--text-base);color:var(--color-text);margin-bottom:4px;\">AIVOS</strong>' +\n          '<p style=\"margin:0;color:var(--color-text-muted);font-size:var(--text-sm);line-height:1.5;\">' + welcomeMessage + '</p>' +\n        '</div>' +\n        '<button onclick=\"this.closest(\\'#aivo-welcome-card\\').remove()\" style=\"flex-shrink:0;width:28px;height:28px;border:none;background:var(--color-surface-hover);border-radius:50%;cursor:pointer;color:var(--color-text-faint);display:flex;align-items:center;justify-content:center;font-size:16px;line-height:1;\">&times;</button>';\n\n      wizardCard.insertBefore(card, wizardCard.firstChild);\n\n      var welcomeMascotEl = document.getElementById('aivo-welcome-mascot');\n      if (welcomeMascotEl && window.AivoAPI) {\n        window.AivoAPI.render(welcomeMascotEl, { size: 72, state: 'greeting' });\n      }\n    }, 2000);`;
    
    content = content.slice(0, startIdx) + newWelcome + content.slice(endIdx + welcomeEnd.length);
    count++;
    console.log('✓ Replaced welcome bubble with new Aivo mascot card');
  } else {
    console.log('✗ Welcome bubble end not found');
  }
} else {
  console.log('✗ Welcome bubble start not found');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log(`\nDone! ${count}/4 replacements made.`);
