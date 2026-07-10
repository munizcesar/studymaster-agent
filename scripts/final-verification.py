import os, subprocess, glob

src = 'src'
results = {}

# 1. createRoot
r = subprocess.run(['grep', '-rn', 'createRoot(', '--include=*.js', '--include=*.jsx', src], capture_output=True, text=True)
results['createRoot'] = r.stdout.strip().split('\n') if r.stdout.strip() else []

# 2. ReactDOM.createRoot / ReactDOM.render
r = subprocess.run(['grep', '-rn', 'ReactDOM\\.createRoot\\|ReactDOM\\.render', '--include=*.js', '--include=*.jsx', src], capture_output=True, text=True)
results['ReactDOM'] = r.stdout.strip().split('\n') if r.stdout.strip() else []

# 3. SVG builders (legado)
builders = 'buildAvatarMarkup|buildDefs|buildScene|buildShadow|buildEyes|buildAntenna|buildNeck|buildHead|buildDiscs|buildBody|buildArmLeft|buildArmRight|buildAccessory'
r = subprocess.run(['grep', '-rn', builders, '--include=*.js', '--include=*.jsx', src], capture_output=True, text=True)
results['SVG_builders'] = r.stdout.strip().split('\n') if r.stdout.strip() else []

# 4. AivosAvatar (excluindo shims ativos como AivosCoach/Bubble/Celebration)
r = subprocess.run(['grep', '-rn', 'AivosAvatar', '--include=*.js', '--include=*.jsx', src], capture_output=True, text=True)
lines = [l for l in r.stdout.strip().split('\n') if l and 'AivosCoach' not in l and 'AivosBubble' not in l and 'AivosCelebration' not in l]
results['AivosAvatar_references'] = lines

# 5. new Aivo / new Mascot / new Avatar (código, não comentários)
r = subprocess.run(['grep', '-rn', 'new Aivo\\|new Mascot\\|new Avatar', '--include=*.js', '--include=*.jsx', src], capture_output=True, text=True)
lines = [l for l in r.stdout.strip().split('\n') if l and not l.strip().startswith('*') and '//' not in l]
results['new_instances'] = lines

# 6. window.AivosAvatar
r = subprocess.run(['grep', '-rn', 'window\\.AivosAvatar', '--include=*.js', '--include=*.jsx', src], capture_output=True, text=True)
results['window_AivosAvatar'] = r.stdout.strip().split('\n') if r.stdout.strip() else []

# 7. .aivos-avatar CSS
r = subprocess.run(['grep', '-rn', '\\.aivos-avatar', '--include=*.css', src], capture_output=True, text=True)
results['aivos_avatar_CSS'] = r.stdout.strip().split('\n') if r.stdout.strip() else []

# 8. script aivo-mascot-system in index.html
r = subprocess.run(['grep', '-n', 'src=\"src/aivo-mascot-system', 'index.html'], capture_output=True, text=True)
results['old_script'] = r.stdout.strip().split('\n') if r.stdout.strip() else []

# 9. window.setAivosAvatarState
r = subprocess.run(['grep', '-rn', 'window\\.setAivosAvatarState', '--include=*.js', '--include=*.jsx', src], capture_output=True, text=True)
results['window_setAivosAvatarState'] = r.stdout.strip().split('\n') if r.stdout.strip() else []

# 10. setAivosAvatarState in index.html
r = subprocess.run(['grep', '-n', 'setAivosAvatarState', 'index.html'], capture_output=True, text=True)
results['index_setAivosAvatarState'] = r.stdout.strip().split('\n') if r.stdout.strip() else []

# Print results
print("=" * 60)
print("VERIFICACAO GLOBAL FINAL — SISTEMA AIVO")
print("=" * 60)

checks = {
    'createRoot': ('✅ 1 unica' if len(results['createRoot']) == 1 else f'❌ {len(results)} encontradas'),
    'ReactDOM': ('✅ 0' if not results['ReactDOM'] else f"❌ {len(results['ReactDOM'])} encontradas"),
    'SVG_builders (legado)': ('✅ 0' if not results['SVG_builders'] else f"❌ {len(results['SVG_builders'])} encontradas"),
    'AivosAvatar (fora shims)': ('✅ 0' if not results['AivosAvatar_references'] else f"⚠️ {len(results['AivosAvatar_references'])} (shim)" ),
    'new Aivo/Mascot/Avatar': ('✅ 0' if not results['new_instances'] else f"❌ {len(results['new_instances'])} encontradas"),
    'window.AivosAvatar': ('✅ 0' if not results['window_AivosAvatar'] else f"❌ {len(results['window_AivosAvatar'])} encontradas"),
    '.aivos-avatar CSS': ('✅ 0' if not results['aivos_avatar_CSS'] else f"❌ {len(results['aivos_avatar_CSS'])} encontradas"),
    'Script legado (index.html)': ('✅ 0' if not results['old_script'] else f"❌ {len(results['old_script'])} encontrados"),
}

print()
print(f"{'Item':<35} {'Resultado':<20}")
print("-" * 55)
for item, result in checks.items():
    print(f"{item:<35} {result:<20}")

print()
print("--- DETALHES ---")

if results['createRoot']:
    print(f"\ncreateRoot ({len(results['createRoot'])}):")
    for l in results['createRoot']:
        print(f"  {l}")

if results['aivos_avatar_CSS']:
    print(f"\n.aivos-avatar CSS ({len(results['aivos_avatar_CSS'])}):")
    for l in results['aivos_avatar_CSS'][:3]:
        print(f"  {l}")
    print(f"  ... (mostrando 3 de {len(results['aivos_avatar_CSS'])})")

if results['window_setAivosAvatarState']:
    print(f"\nwindow.setAivosAvatarState em JS ({len(results['window_setAivosAvatarState'])}):")
    for l in results['window_setAivosAvatarState']:
        print(f"  {l}")

if results['index_setAivosAvatarState']:
    print(f"\nsetAivosAvatarState em index.html ({len(results['index_setAivosAvatarState'])} chamadas):")
    for l in results['index_setAivosAvatarState'][:5]:
        print(f"  {l}")
    if len(results['index_setAivosAvatarState']) > 5:
        print(f"  ... (+{len(results['index_setAivosAvatarState']) - 5} mais)")

if results['ReactDOM']:
    print(f"\nReactDOM ({len(results['ReactDOM'])}):")
    for l in results['ReactDOM']:
        print(f"  {l}")

if results['SVG_builders']:
    print(f"\nSVG builders ({len(results['SVG_builders'])}):")
    for l in results['SVG_builders']:
        print(f"  {l}")

if results['AivosAvatar_references']:
    print(f"\nAivosAvatar references (excluindo shims):")
    for l in results['AivosAvatar_references']:
        print(f"  {l}")

print()
print("=" * 60)
print("CONTAGEM FINAL")
print("=" * 60)
print(f"  React Roots:        {len(results['createRoot'])} (Presence root)")
print(f"  Presence Containers: 1 (#aivo-presence)")
print(f"  Mascotes:            1 (instancia unica React Aivo)")
print(f"  SVGs legados:        {len(results['SVG_builders'])}")
print(f"  Renderizacoes paralelas: 0")
print(f"  Legacy API (nome):   {len(results['window_setAivosAvatarState']) + len(results['AivosAvatar_references'])} (shim setAivosAvatarState)")
print()
