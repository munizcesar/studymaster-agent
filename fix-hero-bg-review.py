import sys

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

changes = 0

# ============================================================
# 1. Fix mask-image gradient - smoother transition
# ============================================================
old_mask = "mask-image: radial-gradient(ellipse 90% 80% at 50% 50%, black 30%, transparent 100%);"
new_mask = "mask-image: radial-gradient(ellipse 85% 75% at 50% 50%, black 15%, black 40%, transparent 85%);"

if old_mask in content:
    content = content.replace(old_mask, new_mask, 1)
    changes += 1
    print('Fixed mask-image gradient (smoother transition)')
else:
    # Try with -webkit-
    old_webkit = "-webkit-mask-image: radial-gradient(ellipse 90% 80% at 50% 50%, black 30%, transparent 100%);"
    new_webkit = "-webkit-mask-image: radial-gradient(ellipse 85% 75% at 50% 50%, black 15%, black 40%, transparent 85%);"
    if old_webkit in content:
        content = content.replace(old_webkit, new_webkit, 1)
        content = content.replace(old_mask, new_mask, 1)
        changes += 1
        print('Fixed webkit mask-image gradient')
    else:
        print('WARN mask-image not found - may already be updated')

# ============================================================
# 2. Add transform-box: fill-box to orbital rings (cross-browser fix)
# ============================================================
orbital_css_start = '.hero-bg-svg svg .orbital-ring-1'
if orbital_css_start in content:
    # Find if transform-box is already added
    if 'transform-box: fill-box' not in content:
        old_orbital_css = '''    .hero-bg-svg svg .orbital-ring-1 { animation: orbitalFloat1 10s ease-in-out infinite; transform-origin: center; }
    .hero-bg-svg svg .orbital-ring-2 { animation: orbitalFloat2 12s ease-in-out infinite; transform-origin: center; }
    .hero-bg-svg svg .orbital-ring-3 { animation: orbitalFloat3 8s ease-in-out infinite; transform-origin: center; }'''
        new_orbital_css = '''    .hero-bg-svg svg .orbital-ring-1,
    .hero-bg-svg svg .orbital-ring-2,
    .hero-bg-svg svg .orbital-ring-3 {
      transform-box: fill-box;
    }
    .hero-bg-svg svg .orbital-ring-1 { animation: orbitalFloat1 10s ease-in-out infinite; transform-origin: center; }
    .hero-bg-svg svg .orbital-ring-2 { animation: orbitalFloat2 12s ease-in-out infinite; transform-origin: center; }
    .hero-bg-svg svg .orbital-ring-3 { animation: orbitalFloat3 8s ease-in-out infinite; transform-origin: center; }'''
        if old_orbital_css in content:
            content = content.replace(old_orbital_css, new_orbital_css, 1)
            changes += 1
            print('Added transform-box: fill-box to orbital rings')
        else:
            print('WARN orbital CSS block not matched exactly')
    else:
        print('OK transform-box already present')
else:
    print('WARN orbital-ring classes not found')

# ============================================================
# 3. Fix particle :nth-of-type in 480px media query to use class selectors
# ============================================================
old_480 = '.hero-bg-svg svg .particle:nth-of-type(4),'
new_480 = '.hero-bg-svg svg .particle.p4,'
if old_480 in content:
    content = content.replace(old_480, new_480, 1)
    changes += 1
    print('Fixed particle nth-of-type(4) -> .p4 in 480px query')

old_480_2 = '.hero-bg-svg svg .particle:nth-of-type(10)'
new_480_2 = '.hero-bg-svg svg .particle.p10'
if old_480_2 in content:
    content = content.replace(old_480_2, new_480_2, 1)
    changes += 1
    print('Fixed particle nth-of-type(10) -> .p10 in 480px query')

# ============================================================
# 4. Ensure particle animation rules are complete (add missing p-* delays if any)
# ============================================================
# Check if .particle.p1 through .particle.p14 are all present
for i in range(1, 15):
    cls = f'.particle.p{i}'
    if cls in content:
        pass  # OK
    else:
        print(f'  Missing particle class: {cls}')

# ============================================================
# Write back
# ============================================================
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print(f'\nDone: {changes} fix(es) applied')
