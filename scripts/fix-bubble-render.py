"""Fix the welcome bubble AivoAPI.render() call in index.html"""
import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the commented-out render call
old = '      /* Single Aivo mascot positioning handled by Presence system */\n      // The AivoAPI.render call redirects to AivoPresence.moveToElement()'
new = '''      /* Trigger Presence to move AIVO to bubble position */
      var bubbleEl = document.getElementById('aivo-welcome-bubble');
      if (bubbleEl && window.AivoAPI) {
        window.AivoAPI.render(bubbleEl, { size: 56, state: 'greeting' });
      }'''

if old in content:
    content = content.replace(old, new)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print('SUCCESS: Fixed welcome bubble render call')
else:
    print('FAILED: Old string not found')
    # Debug: find the actual text around that area
    idx = content.find('Single Aivo mascot')
    if idx >= 0:
        print(f'Found at position {idx}')
        print(repr(content[idx-20:idx+150]))
