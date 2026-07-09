const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

let changes = 0;

// 1. REVERT wizard mascot: remove step-title-row wrapper and wizard-mascot div
const stepTitleRow = '<div class="step-title-row" style="display:flex;align-items:center;gap:16px;">\n            <h2 class="step-title" style="margin:0;">Como voc\u00ea quer estudar hoje?</h2>\n            <div id="wizard-mascot" style="flex-shrink:0;"></div>\n          </div>';
const originalTitle = '          <h2 class="step-title">Como voc\u00ea quer estudar hoje?</h2>';

if (content.includes(stepTitleRow)) {
  content = content.replace(stepTitleRow, originalTitle);
  changes++;
  console.log('✓ Reverted wizard title - removed mascot beside title');
} else {
  console.log('✗ step-title-row not found');
}

// 2. Also remove the render code for wizard-mascot (the old render code was already replaced)
const wizardRenderCode = '    /* Render new Aivo mascot beside wizard title */\n    var wizardMascotEl = document.getElementById(\'wizard-mascot\');\n    if (wizardMascotEl && window.AivoAPI) {\n      window.AivoAPI.render(wizardMascotEl, { size: \'md\', state: \'greeting\' });\n    }';
if (content.includes(wizardRenderCode)) {
  content = content.replace(wizardRenderCode, '');
  changes++;
  console.log('✓ Removed wizard mascot render code');
} else {
  console.log('✗ wizard render code not found');
}

// 3. REPLACE welcome card (fixed) with auto-dismiss bubble (notification style)
const welcomeCardStart = '    /* Welcome card with new Aivo mascot */\n    setTimeout(function() {';
const welcomeCardEnd = '    }, 2000);';

const startIdx = content.indexOf(welcomeCardStart);
if (startIdx !== -1) {
  // Find the matching closing }, 2000);
  // We need to find the SECOND occurrence of }, 2000); after startIdx
  const firstEndIdx = content.indexOf(welcomeCardEnd, startIdx);
  // The welcome card ends with the first }, 2000); after startIdx
  if (firstEndIdx !== -1) {
    const newWelcomeCode = `    /* Welcome bubble (auto-dismiss) with new Aivo mascot */\n    setTimeout(function() {\n      var welcomeMessage = 'Ol\u00e1! Sou o AIVOS, seu assistente de estudos.';\n      if (window.AivosTracker) {\n        try {\n          var summary = AivosTracker.getSummary();\n          if (summary && summary.questions > 0) {\n            var streak = summary.streak || 0;\n            if (streak >= 5) {\n              welcomeMessage = 'Bem-vindo de volta! Voce esta com uma sequencia de ' + streak + ' acertos! \\ud83d\\udd25';\n            } else if (summary.accuracy >= 70) {\n              welcomeMessage = 'Bem-vindo! Seu rendimento geral e de ' + summary.accuracy + '%. Continue assim! \\ud83d\\udcaa';\n            } else {\n              welcomeMessage = 'Bem-vindo! Voce ja respondeu ' + summary.questions + ' questoes ate agora. Vamos estudar?';\n            }\n          }\n        } catch(e) {}\n      }\n\n      /* Create auto-dismiss bubble */\n      var bubble = document.createElement('div');\n      bubble.id = 'aivo-welcome-bubble';\n      bubble.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;align-items:center;gap:14px;padding:16px 20px;background:var(--color-surface);border:1px solid var(--color-divider);border-radius:14px;box-shadow:0 8px 32px rgba(0,0,0,0.15);max-width:380px;animation:bubbleIn 0.4s cubic-bezier(0.16,1,0.3,1);';\n      bubble.innerHTML =\n        '<div id=\"aivo-welcome-bubble-mascot\" style=\"flex-shrink:0;width:56px;height:56px;\"></div>' +\n        '<div style=\"flex:1;min-width:0;\">' +\n          '<strong style=\"display:block;font-family:var(--font-display);font-size:var(--text-sm);color:var(--color-text);margin-bottom:2px;\">AIVOS</strong>' +\n          '<p style=\"margin:0;color:var(--color-text-muted);font-size:var(--text-xs);line-height:1.5;\">' + welcomeMessage + '</p>' +\n        '</div>';\n\n      document.body.appendChild(bubble);\n\n      /* Render Aivo mascot inside bubble */\n      var bubbleMascot = document.getElementById('aivo-welcome-bubble-mascot');\n      if (bubbleMascot && window.AivoAPI) {\n        window.AivoAPI.render(bubbleMascot, { size: 56, state: 'greeting' });\n      }\n\n      /* Add CSS animation for bubble */\n      if (!document.getElementById('aivo-bubble-style')) {\n        var style = document.createElement('style');\n        style.id = 'aivo-bubble-style';\n        style.textContent = '@keyframes bubbleIn{from{opacity:0;transform:translateY(20px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes bubbleOut{from{opacity:1;transform:translateY(0) scale(1)}to{opacity:0;transform:translateY(20px) scale(0.95)}}';\n        document.head.appendChild(style);\n      }\n\n      /* Auto-dismiss after 6 seconds */\n      setTimeout(function() {\n        var b = document.getElementById('aivo-welcome-bubble');\n        if (b) {\n          b.style.animation = 'bubbleOut 0.3s cubic-bezier(0.16,1,0.3,1) forwards';\n          setTimeout(function() { if (b.parentNode) b.remove(); }, 400);\n        }\n      }, 6000);\n    }, 2000);`;

    content = content.slice(0, startIdx) + newWelcomeCode + content.slice(firstEndIdx + welcomeCardEnd.length);
    changes++;
    console.log('✓ Replaced welcome card with auto-dismiss bubble');
  } else {
    console.log('✗ welcome card end not found');
  }
} else {
  console.log('✗ welcome card start not found');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log(`\nDone! ${changes}/3 changes made.`);
