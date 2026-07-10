#!/usr/bin/env python3
"""
Remove todas as ocorrências de setAivosAvatarState em todo o projeto.
Substitui por AivoAPI.setState() e remove a definição da função legada.
"""
import re

# --- index.html ---
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

count = html.count('setAivosAvatarState')
print(f"index.html: {count} ocorrências de setAivosAvatarState")

# Substituição 1: if (window.setAivosAvatarState) setAivosAvatarState('idle');
html = html.replace(
    "if (window.setAivosAvatarState) setAivosAvatarState('idle');",
    "if (window.AivoAPI) window.AivoAPI.setState(document.body, 'idle');"
)

# Substituição 2: if (window.setAivosAvatarState) setAivosAvatarState('warning');
html = html.replace(
    "if (window.setAivosAvatarState) setAivosAvatarState('warning');",
    "if (window.AivoAPI) window.AivoAPI.setState(document.body, 'warning');"
)

# Substituição 3: if (window.setAivosAvatarState) setAivosAvatarState('celebrating');
html = html.replace(
    "if (window.setAivosAvatarState) setAivosAvatarState('celebrating');",
    "if (window.AivoAPI) window.AivoAPI.setState(document.body, 'celebrating');"
)

# Substituição 4: setTimeout(function() { if (window.setAivosAvatarState) setAivosAvatarState('idle'); }, 3000);
html = html.replace(
    "if (window.setAivosAvatarState) setAivosAvatarState('idle'); }, 3000);",
    "if (window.AivoAPI) window.AivoAPI.setState(document.body, 'idle'); }, 3000);"
)

# Substituição 5: setAivosAvatarState('thinking'); (inside helper function)
html = html.replace(
    "setAivosAvatarState('thinking');",
    "if (window.AivoAPI) window.AivoAPI.setState(document.body, 'thinking');"
)

# Substituição 6: setAivosAvatarState(isCorrect ? 'celebrating' : 'warning');
html = html.replace(
    "setAivosAvatarState(isCorrect ? 'celebrating' : 'warning');",
    "if (window.AivoAPI) window.AivoAPI.setState(document.body, isCorrect ? 'celebrating' : 'warning');"
)

# Substituição 7: setAivosAvatarState('idle'); (inside setTimeout)
html = html.replace(
    "setAivosAvatarState('idle');",
    "if (window.AivoAPI) window.AivoAPI.setState(document.body, 'idle');"
)

count_after = html.count('setAivosAvatarState')
print(f"index.html: {count_after} ocorrências restantes de setAivosAvatarState")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

# --- src/aivo-integration.jsx ---
with open('src/aivo-integration.jsx', 'r', encoding='utf-8') as f:
    jsx = f.read()

print(f"\naivo-integration.jsx: {jsx.count('setAivosAvatarState')} ocorrências de setAivosAvatarState")
print(f"aivo-integration.jsx: {jsx.count('defineSetAivosAvatarState')} ocorrências de defineSetAivosAvatarState")

# Remove the setAivosAvatarState section (comment + function + calls)
# Pattern: from /* ── setAivosAvatarState global ── */ to the end of the file's supplemental logic
section_pattern = r"\/\* ── setAivosAvatarState global ── \*\/\nfunction defineSetAivosAvatarState\(\) \{[^}]*window\.setAivosAvatarState = function\(state\) \{[^}]*\}\n\}\n\nif \(document\.readyState === 'loading'\) \{\n  window\.addEventListener\('load', defineSetAivosAvatarState\);\n\} else \{\n  defineSetAivosAvatarState\(\);\n\}"

# Actually, let's try a simpler approach with fixed strings
start_marker = "/* ── setAivosAvatarState global ── */"
if start_marker in jsx:
    idx_start = jsx.index(start_marker)
    # Find the end - after the if/else block
    idx_end = jsx.index("\nif (document.readyState === 'loading')", idx_start)
    # Find the end of the if/else block
    idx_end = jsx.index("\n}", idx_end) + 1
    # Remove from start_marker to after the closing }
    jsx = jsx[:idx_start] + jsx[idx_end:]
    print("  -> Seção setAivosAvatarState removida!")
else:
    print("  -> Marcador não encontrado!")

# Check remaining occurrences in jsx
count_jsx = jsx.count('setAivosAvatarState')
print(f"aivo-integration.jsx após limpeza: {count_jsx} ocorrências de setAivosAvatarState")
count_def = jsx.count('defineSetAivosAvatarState')
print(f"aivo-integration.jsx após limpeza: {count_def} ocorrências de defineSetAivosAvatarState")

with open('src/aivo-integration.jsx', 'w', encoding='utf-8') as f:
    f.write(jsx)

# --- Verificação global ---
print("\n=== VERIFICAÇÃO GLOBAL ===")
import subprocess
result = subprocess.run(
    ['grep', '-rn', 'setAivosAvatarState', 'index.html', 'src/'],
    capture_output=True, text=True
)
if result.stdout.strip():
    print(f"⚠️ AINDA EXISTEM ocorrências:\n{result.stdout}")
else:
    print("✅ ZERO ocorrências de setAivosAvatarState em todo o projeto!")

result2 = subprocess.run(
    ['grep', '-rn', 'defineSetAivosAvatarState', 'index.html', 'src/'],
    capture_output=True, text=True
)
if result2.stdout.strip():
    print(f"⚠️ defineSetAivosAvatarState ainda existe:\n{result2.stdout}")
else:
    print("✅ ZERO ocorrências de defineSetAivosAvatarState!")

result3 = subprocess.run(
    ['grep', '-rn', 'window\\.setAivosAvatarState', 'index.html', 'src/'],
    capture_output=True, text=True
)
if result3.stdout.strip():
    print(f"⚠️ window.setAivosAvatarState ainda existe:\n{result3.stdout}")
else:
    print("✅ ZERO ocorrências de window.setAivosAvatarState!")
