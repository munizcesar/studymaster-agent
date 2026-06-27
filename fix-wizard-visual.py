with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

changes = 0

# ============================================================
# 1. Upgrade .wizard-section - background with subtle gradient accent
# ============================================================
old_ws = '''    .wizard-section { padding: var(--space-4) 0 var(--space-12); padding-block: clamp(3rem, 6vw, 5rem); background: var(--color-surface); }'''

new_ws = '''    .wizard-section {
      padding: var(--space-4) 0 var(--space-12);
      padding-block: clamp(3rem, 6vw, 5rem);
      background: var(--color-surface);
      position: relative;
    }
    .wizard-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, var(--color-primary) 50%, transparent 100%);
      opacity: 0.2;
    }'''

if old_ws in content:
    content = content.replace(old_ws, new_ws, 1)
    changes += 1
    print('OK wizard-section upgraded')
else:
    print('FAIL wizard-section not found')

# ============================================================
# 2. Upgrade .wizard-card - premium card with subtle inner glow
# ============================================================
old_wc = '''    .wizard-card { min-height: 320px; position: relative; background: var(--color-surface); border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); padding: var(--space-8); border: 1px solid oklch(from var(--color-text) l c h / 0.08); overflow: visible; max-width: 100%; }'''

new_wc = '''    .wizard-card {
      min-height: 360px;
      position: relative;
      background:
        linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-2) 100%);
      border-radius: var(--radius-xl);
      box-shadow: 0 8px 32px oklch(0 0 0 / 0.06), 0 1px 4px oklch(0 0 0 / 0.04);
      padding: var(--space-8);
      border: 1px solid oklch(from var(--color-primary) l c h / 0.12);
      overflow: visible;
      max-width: 100%;
      transition: box-shadow 0.3s ease;
    }
    .wizard-card::before {
      content: '';
      position: absolute;
      top: -1px;
      left: -1px;
      right: -1px;
      height: 3px;
      background: linear-gradient(90deg, var(--primary-500) 0%, var(--accent-500) 50%, var(--primary-500) 100%);
      border-radius: var(--radius-xl) var(--radius-xl) 0 0;
      opacity: 0.7;
    }
    .wizard-card::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(ellipse 120% 60% at 30% 0%, oklch(from var(--color-primary) l c h / 0.04) 0%, transparent 70%);
      pointer-events: none;
      border-radius: var(--radius-xl);
    }'''

if old_wc in content:
    content = content.replace(old_wc, new_wc, 1)
    changes += 1
    print('OK wizard-card upgraded')
else:
    print('FAIL wizard-card not found')

# ============================================================
# 3. Upgrade .step-title - add decorative accent
# ============================================================
old_st = '''    .step-title { font-family: var(--font-display); font-size: var(--text-xl); margin-bottom: var(--space-1); line-height: 1.2; }'''

new_st = '''    .step-title {
      font-family: var(--font-display);
      font-size: var(--text-xl);
      font-weight: 800;
      margin-bottom: var(--space-1);
      line-height: 1.2;
      position: relative;
    }'''

if old_st in content:
    content = content.replace(old_st, new_st, 1)
    changes += 1
    print('OK step-title upgraded')
else:
    print('FAIL step-title not found')

# ============================================================
# 4. Upgrade .step-subtitle
# ============================================================
old_ss = '''    .step-subtitle { font-size: var(--text-sm); color: var(--color-text); margin-bottom: var(--space-6); line-height: 1.5; }'''

new_ss = '''    .step-subtitle {
      font-size: var(--text-sm);
      color: var(--color-text-muted);
      margin-bottom: var(--space-6);
      line-height: 1.6;
      max-width: 540px;
    }
    .step-headline {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      margin-bottom: var(--space-2);
    }
    .step-headline-accent {
      flex-shrink: 0;
      width: 4px;
      height: 32px;
      border-radius: var(--radius-full);
      background: linear-gradient(180deg, var(--color-primary) 0%, var(--color-primary-mid) 100%);
      margin-top: 4px;
    }'''

if old_ss in content:
    content = content.replace(old_ss, new_ss, 1)
    changes += 1
    print('OK step-subtitle upgraded')
else:
    print('FAIL step-subtitle not found')

# ============================================================
# 5. Upgrade .mode-card - more refined visual
# ============================================================
old_mc = '''      transition: all var(--transition);
      color: var(--color-text);
      position: relative;
      overflow: hidden;
      min-height: 200px;
    }
    .mode-card {
      transition: all 0.3s var(--bounce-ease), box-shadow 0.35s var(--bounce-ease);
    }'''

# This is tricky because there are two .mode-card blocks. 
# The first is the base definition, the second is the bounce transition override.
# Let's find the first one and upgrade it.

# Actually let me find the exact strings
idx_mc_base = content.find('.mode-card {\n      display: flex;\n      flex-direction: column;\n      align-items: flex-start;\n      text-align: left;\n      padding: var(--space-5);\n      background: var(--color-surface);')
if idx_mc_base >= 0:
    # Find the end of this block
    idx_mc_end = content.find('}\n    .mode-card {', idx_mc_base)
    if idx_mc_end >= 0:
        end_of_block = content.find('}\n    .mode-card:hover', idx_mc_end)
        if end_of_block >= 0:
            # Extract the full first .mode-card block
            full_old = content[idx_mc_base:end_of_block + 1]
            
            new_mc_full = '''    .mode-card {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      text-align: left;
      padding: var(--space-6);
      background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-2) 100%);
      border: 1.5px solid oklch(from var(--color-primary) l c h / 0.10);
      border-radius: var(--radius-xl);
      color: var(--color-text);
      position: relative;
      overflow: hidden;
      min-height: 220px;
      transition: all 0.3s var(--bounce-ease), box-shadow 0.35s var(--bounce-ease);
    }
    .mode-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background:
        radial-gradient(ellipse 100% 80% at 50% 0%, oklch(from var(--color-primary) l c h / 0.06) 0%, transparent 70%),
        radial-gradient(ellipse 60% 60% at 80% 100%, oklch(from var(--color-primary-mid) l c h / 0.04) 0%, transparent 60%);
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .mode-card:hover::before {
      opacity: 1;
    }'''
            
            content = content.replace(full_old, new_mc_full, 1)
            changes += 1
            print('OK mode-card base definition upgraded')
        else:
            print('FAIL could not find mode-card:hover boundary')
    else:
        print('FAIL could not find mode-card transition boundary')
else:
    print('FAIL mode-card base definition not found')

# ============================================================
# 6. Upgrade .mode-icon - more premium
# ============================================================
old_mi = '''      border-radius: var(--radius-lg);'''

# Find the full .mode-icon block
idx_mi_start = content.find('.mode-icon {')
if idx_mi_start >= 0:
    idx_mi_end = content.find('}\n    .mode-card:hover .mode-icon', idx_mi_start)
    if idx_mi_end >= 0:
        old_mi_block = content[idx_mi_start:idx_mi_end + 1]
        new_mi_block = '''    .mode-icon {
      width: 52px;
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, oklch(from var(--color-primary) l c h / 0.12) 0%, oklch(from var(--color-primary-mid) l c h / 0.08) 100%);
      color: var(--color-primary);
      border-radius: var(--radius-lg);
      margin-bottom: var(--space-4);
      transition: all var(--transition);
      position: relative;
      z-index: 1;
      box-shadow: 0 2px 8px oklch(from var(--color-primary) l c h / 0.08);
    }'''
        content = content.replace(old_mi_block, new_mi_block, 1)
        changes += 1
        print('OK mode-icon upgraded')
    else:
        print('FAIL mode-icon end not found')
else:
    print('FAIL mode-icon not found')

# ============================================================
# 7. Upgrade .steps-bar - more premium
# ============================================================
old_sb = '''    .steps-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-8); max-width: 600px; margin-left: auto; margin-right: auto; position: relative; }'''

new_sb = '''    .steps-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-8);
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
      position: relative;
      padding: var(--space-2) var(--space-4);
      background: oklch(from var(--color-primary) l c h / 0.04);
      border-radius: var(--radius-full);
      border: 1px solid oklch(from var(--color-primary) l c h / 0.08);
    }'''

if old_sb in content:
    content = content.replace(old_sb, new_sb, 1)
    changes += 1
    print('OK steps-bar upgraded')
else:
    print('FAIL steps-bar not found')

# ============================================================
# 8. Upgrade .step-number, .step-indicator
# ============================================================
old_sn = '''      font-size: var(--text-sm);\n      border: 2px solid var(--color-border);\n      transition: all var(--transition);\n      position: relative;\n      z-index: 1;'''

new_sn = '''      font-size: var(--text-sm);
      border: 2px solid var(--color-border);
      transition: all var(--transition);
      position: relative;
      z-index: 1;
      box-shadow: 0 2px 6px oklch(0 0 0 / 0.04);'''

# This might match multiple places. Let me find the step-number block specifically
idx_sn = content.find('.step-number { width: 36px; height: 36px; border-radius: 50%;')
if idx_sn >= 0:
    idx_sn_end = content.find('background: var(--color-primary);', idx_sn)
    if idx_sn_end >= 0:
        old_sn_block = content[idx_sn:idx_sn_end]
        # Only replace if not already updated
        if 'box-shadow' not in old_sn_block:
            # Find the z-index line
            old_z = 'position: relative;\n      z-index: 1;'
            new_z = 'position: relative;\n      z-index: 1;\n      box-shadow: 0 2px 6px oklch(0 0 0 / 0.04);'
            block_with_z = content[idx_sn:idx_sn_end]
            if old_z in block_with_z:
                content = content.replace(old_z, new_z, 1)
                changes += 1
                print('OK step-number shadow added')
            else:
                print('FAIL z-index line not found in step-number')
        else:
            print('OK step-number already has shadow')
    else:
        print('FAIL step-number end boundary not found')
else:
    print('FAIL step-number not found')

# ============================================================
# 9. Add subtle decorative pattern to mode-card background
#    Update the hover state to be more premium
# ============================================================
# Update mode-card:hover - add a more refined hover effect
old_mch = '''    .mode-card:hover {
      border-color: var(--color-primary-mid);
      transform: translateY(-3px) scale(1.01);
      box-shadow: 0 8px 24px oklch(from var(--color-primary) l c h / 0.15), 0 0 0 2px var(--accent-glow);
    }'''

new_mch = '''    .mode-card:hover {
      border-color: var(--color-primary);
      transform: translateY(-4px) scale(1.015);
      box-shadow: 0 12px 36px oklch(from var(--color-primary) l c h / 0.18), 0 0 0 2px var(--accent-glow);
    }'''

if old_mch in content:
    content = content.replace(old_mch, new_mch, 1)
    changes += 1
    print('OK mode-card:hover upgraded')
else:
    print('FAIL mode-card:hover not found')

# ============================================================
# 10. Update .mode-card.selected
# ============================================================
old_mcs = '''    .mode-card.selected {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 4px oklch(from var(--color-primary) l c h / 0.2);
      background: oklch(from var(--color-primary) l c h / 0.05);
    }'''

new_mcs = '''    .mode-card.selected {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 4px oklch(from var(--color-primary) l c h / 0.2), 0 8px 24px oklch(from var(--color-primary) l c h / 0.12);
      background: linear-gradient(135deg, oklch(from var(--color-primary) l c h / 0.08) 0%, oklch(from var(--color-primary-mid) l c h / 0.04) 100%);
    }'''

if old_mcs in content:
    content = content.replace(old_mcs, new_mcs, 1)
    changes += 1
    print('OK mode-card.selected upgraded')
else:
    print('FAIL mode-card.selected not found')

# ============================================================
# Write back
# ============================================================
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print(f'\nDONE: {changes} changes applied')
