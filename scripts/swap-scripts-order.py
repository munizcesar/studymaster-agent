"""
Swap the order of two script tags in index.html so that
aivo-presence.js loads BEFORE aivo-mascot-bundle.js
"""
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to find the two adjacent script lines
old_block = (
    '  <script src="dist/aivo-mascot-bundle.js"></script>\n'
    '  <!-- \xf0\x9f\x8e\xad AIVO Presence (inst\xe2ncia \xfanica) -->\n'
    '  <script src="src/aivo-presence.js"></script>'
)

new_block = (
    '  <!-- AIVO Presence (inst\xe2ncia \xfanica) - DEVE carregar ANTES do bundle -->\n'
    '  <script src="src/aivo-presence.js"></script>\n'
    '  <script src="dist/aivo-mascot-bundle.js"></script>'
)

if old_block in content:
    content = content.replace(old_block, new_block, 1)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print('OK Script order swapped')
else:
    print('FAIL Pattern not found')
    # Debug output
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if 'aivo-mascot-bundle' in line or 'aivo-presence.js' in line:
            print(f'  Line {i}: [{line}]')
