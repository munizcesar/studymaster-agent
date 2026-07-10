const fs = require('fs');
const path = require('path');
const html = fs.readFileSync('index.html', 'utf8');

let result = html;

// 1. Remove inline setAivosAvatarState that uses AivosAvatar (dead code)
result = result.replace(
  /(\s*var AVATAR_CONTAINER_ID = 'aivos-header-avatar';\n)(\s*var avatarContainer = document\.getElementById\(AVATAR_CONTAINER_ID\);\n)([\s\S]*?)(\n\s*\/\* Helper: set avatar thinking state \*\/)/,
  '\n$4'
);

// 2. Remove the AivosAvatar check from setAivosAvatarState helper
result = result.replace(
  /(\s*window\.setAivosAvatarState = function\(state\) \{)([\s\S]*?)(\n\s*};)/,
  '$1' +
  '\n      // Defined in bundle (aivo-integration.jsx) - this is a stub for inline callers' +
  '\n      // The real implementation is set by the bundle on window.load' +
  '\n      if (typeof window.__aivosAvatarStateStub === \'function\') window.__aivosAvatarStateStub(state);' +
  '$3'
);

// Actually, the setAivosAvatarState is overridden by the bundle.
// The inline definition is dead code. Let's just remove the whole function body.
result = result.replace(
  /(\s*window\.setAivosAvatarState = function\(state\) \{\n)(\s*var c = document\.getElementById\(AVATAR_CONTAINER_ID\);\n[\s\S]*?\n)(\s*};)/,
  '$1' +
  '      // Overridden by bundle (aivo-integration.jsx) on window.load\n' +
  '      // This inline stub is inactive\n' +
  '$3'
);

// 3. Remove the empty mascot div from welcome bubble (the 56x56 div that's now just empty space)
result = result.replace(
  /'<div id="aivo-welcome-bubble-mascot" style="flex-shrink:0;width:56px;height:56px;"><\/div>' \+(\s*)'/, 
  "'$1"
);

// 4. Update the bubble layout to not expect the mascot div
// Remove the AivoAPI.render call for bubbleMascot since Presence handles positioning
result = result.replace(
  /\n(\s*)\/\* Render Aivo mascot inside bubble \*\/\n\1var bubbleMascot = document\.getElementById\('aivo-welcome-bubble-mascot'\);\n\1if \(bubbleMascot && window\.AivoAPI\) \{\n\1\s*window\.AivoAPI\.render\(bubbleMascot, \{ size: 56, state: 'greeting' \}\);\n\1\}/,
  '\n' + '$1' + '/* Single Aivo mascot positioning handled by Presence system */'
);

// Also keep the AivoAPI.render call but pass the bubble container, not the mascot div
// Actually let's keep the AivoAPI.render but use the bubble itself as target
result = result.replace(
  /\/\* Single Aivo mascot positioning handled by Presence system \*\//,
  '/* Single Aivo mascot positioning handled by Presence system */\n' +
  '      // The AivoAPI.render call redirects to AivoPresence.moveToElement()'
);

fs.writeFileSync('index.html', result);
console.log('✅ index.html cleaned');
