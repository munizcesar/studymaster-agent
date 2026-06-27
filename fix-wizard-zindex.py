with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

changes = 0

# ============================================================
# 1. Fix z-index: add z-index 0 to wizard-card::after, z-index 1 to content
# ============================================================
# Add z-index to ::after
old_after = '''      pointer-events: none;
      border-radius: var(--radius-xl);
    }'''

new_after = '''      pointer-events: none;
      border-radius: var(--radius-xl);
      z-index: 0;
    }'''

# First occurrence (wizard-card::after)
idx_after = content.find(old_after)
if idx_after >= 0 and 'wizard-card' in content[max(0, idx_after-100):idx_after]:
    content = content.replace(old_after, new_after, 1)
    changes += 1
    print('Added z-index: 0 to wizard-card::after')
else:
    print('WARN wizard-card::after not found')

# Add position:relative;z-index:1 to .wizard-step content
# Find the .wizard-step CSS rule
old_wstep = '    .wizard-step { display: none; }'
new_wstep = '    .wizard-step { display: none; position: relative; z-index: 1; }'

if old_wstep in content:
    content = content.replace(old_wstep, new_wstep, 1)
    changes += 1
    print('Added z-index: 1 to .wizard-step')
else:
    print('WARN .wizard-step not found')

# Also ensure wizard-card children have proper z-index
# Find .wizard-nav to add z-index
old_wnav = '    .wizard-nav { display: flex; justify-content: space-between; margin-top: var(--space-6); }'
new_wnav = '    .wizard-nav { display: flex; justify-content: space-between; margin-top: var(--space-6); position: relative; z-index: 1; }'

if old_wnav in content:
    content = content.replace(old_wnav, new_wnav, 1)
    changes += 1
    print('Added z-index: 1 to .wizard-nav')
else:
    print('WARN .wizard-nav not found')

# ============================================================
# Write back
# ============================================================
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print(f'\nDone: {changes} z-index fix(es) applied')
