import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

changes = 0

# ── 1. Add new micro-interaction CSS variables and keyframes ──

micro_css = """
    /* ── Micro-interactions ── */
    :root {
      --bounce-ease: cubic-bezier(0.34, 1.56, 0.64, 1);
      --spring-ease: cubic-bezier(0.175, 0.885, 0.32, 1.275);
      --smooth-ease: cubic-bezier(0.16, 1, 0.3, 1);
      --glow-transition: box-shadow 0.25s var(--bounce-ease), transform 0.2s var(--bounce-ease);
    }
    @keyframes microPop {
      0% { transform: scale(1); }
      40% { transform: scale(0.96); }
      70% { transform: scale(1.02); }
      100% { transform: scale(1); }
    }
    @keyframes microPulse {
      0%, 100% { box-shadow: 0 0 0 0 oklch(from var(--accent-500) l c h / 0.3); }
      50% { box-shadow: 0 0 0 8px oklch(from var(--accent-500) l c h / 0); }
    }
    /* Glow utility - reusable accent glow on hover */
    .glow-hover {
      transition: var(--glow-transition), background var(--transition), border-color var(--transition);
    }
    .glow-hover:hover {
      box-shadow: 0 0 0 3px var(--accent-glow), 0 4px 14px oklch(from var(--accent-500) l c h / 0.12);
    }
"""

content = content.replace('/* ── Micro-interactions ── */', micro_css, 1)

if '/* ── Micro-interactions ── */' not in content:
    # Insert after the last root variable
    insert_point = '      --shadow-lg: 0 12px 32px oklch(0 0 0 / 0.44);\n    }'
    insert_after = insert_point + '\n' + micro_css.strip()
    content = content.replace(insert_point, insert_after, 1)
    changes += 1

# ── 2. Update btn-primary with bounce + glow ──
old_btn_primary = """    .btn-primary, .btn-restart {
      display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2);
      width: 100%; padding: var(--space-3);
      background: var(--color-primary);
      color: white; font-weight: 700; border-radius: var(--radius-md);
      font-size: var(--text-base); transition: all var(--transition); margin-top: var(--space-4);
      box-shadow: 0 2px 8px oklch(from var(--color-primary) l c h / 0.25);
    }
    .btn-primary:hover, .btn-restart:hover { background: var(--color-primary-hover); box-shadow: 0 4px 16px oklch(from var(--color-primary) l c h / 0.35); transform: translateY(-1px); }"""

new_btn_primary = """    .btn-primary, .btn-restart {
      display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2);
      width: 100%; padding: var(--space-3);
      background: var(--color-primary);
      color: white; font-weight: 700; border-radius: var(--radius-md);
      font-size: var(--text-base); margin-top: var(--space-4);
      transition: all 0.25s var(--bounce-ease), box-shadow 0.3s var(--bounce-ease);
      box-shadow: 0 2px 8px oklch(from var(--color-primary) l c h / 0.25);
      position: relative;
      overflow: hidden;
    }
    .btn-primary::before, .btn-restart::before {
      content: '';
      position: absolute; inset: 0;
      background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.12) 0%, transparent 60%);
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }
    .btn-primary:hover::before, .btn-restart:hover::before { opacity: 1; }
    .btn-primary:hover, .btn-restart:hover {
      background: var(--color-primary-hover);
      box-shadow: 0 4px 16px oklch(from var(--color-primary) l c h / 0.35), 0 0 0 3px var(--accent-glow);
      transform: translateY(-2px) scale(1.02);
    }
    .btn-primary:active, .btn-restart:active {
      animation: microPop 0.35s var(--bounce-ease);
    }"""

content = content.replace(old_btn_primary, new_btn_primary, 1)
changes += 1

# ── 3. Update .chip with glow + bounce ──
old_chip_hover = """    .chip:hover { border-color: var(--color-primary); }
    .chip.active { background: var(--color-primary); color: white; border-color: transparent; }"""

new_chip_hover = """    .chip {
      transition: all 0.2s var(--bounce-ease), box-shadow 0.25s var(--bounce-ease);
    }
    .chip:hover {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--accent-glow);
      transform: translateY(-1px);
    }
    .chip:active {
      animation: microPop 0.3s var(--bounce-ease);
    }
    .chip.active { background: var(--color-primary); color: white; border-color: transparent; }"""

content = content.replace(old_chip_hover, new_chip_hover, 1)
changes += 1

# ── 4. Update .mode-card with enhanced interactions ──
old_mode_card_hover = """    .mode-card:hover {
      border-color: var(--color-primary-mid);
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }
    .mode-card:focus-visible {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 4px oklch(from var(--color-primary) l c h / 0.2);
    }
    .mode-card:active { transform: scale(0.98); }
    .mode-card.selected {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 4px oklch(from var(--color-primary) l c h / 0.2);
      background: oklch(from var(--color-primary) l c h / 0.05);
    }"""

new_mode_card_hover = """    .mode-card {
      transition: all 0.3s var(--bounce-ease), box-shadow 0.35s var(--bounce-ease);
    }
    .mode-card:hover {
      border-color: var(--color-primary-mid);
      transform: translateY(-3px) scale(1.01);
      box-shadow: 0 8px 24px oklch(from var(--color-primary) l c h / 0.15), 0 0 0 2px var(--accent-glow);
    }
    .mode-card:focus-visible {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 4px oklch(from var(--color-primary) l c h / 0.2);
    }
    .mode-card:active {
      animation: microPop 0.35s var(--bounce-ease);
    }
    .mode-card.selected {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 4px oklch(from var(--color-primary) l c h / 0.2), 0 0 0 6px var(--accent-glow);
      background: oklch(from var(--color-primary) l c h / 0.05);
    }"""

content = content.replace(old_mode_card_hover, new_mode_card_hover, 1)
changes += 1

# ── 5. Update .filter-card with enhanced interactions ──
old_filter_hover = """    .filter-card:hover { 
      border-color: var(--color-primary);
      background: oklch(from var(--color-primary) l c h / 0.03);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    .filter-card.active {
      border-color: var(--color-primary);
      background: oklch(from var(--color-primary) l c h / 0.1);
      box-shadow: 0 0 0 3px oklch(from var(--color-primary) l c h / 0.15);
    }"""

new_filter_hover = """    .filter-card {
      transition: all 0.3s var(--bounce-ease), box-shadow 0.35s var(--bounce-ease);
    }
    .filter-card:hover { 
      border-color: var(--color-primary);
      background: oklch(from var(--color-primary) l c h / 0.03);
      transform: translateY(-3px) scale(1.01);
      box-shadow: 0 8px 24px oklch(from var(--color-primary) l c h / 0.12), 0 0 0 2px var(--accent-glow);
    }
    .filter-card:active {
      animation: microPop 0.35s var(--bounce-ease);
    }
    .filter-card.active {
      border-color: var(--color-primary);
      background: oklch(from var(--color-primary) l c h / 0.1);
      box-shadow: 0 0 0 3px oklch(from var(--color-primary) l c h / 0.15), 0 0 0 5px var(--accent-glow);
    }"""

content = content.replace(old_filter_hover, new_filter_hover, 1)
changes += 1

# ── 6. Update .option-btn with interaction ──
old_option_hover = """    .option-btn:hover:not(:disabled) { border-color: var(--color-primary-mid); }
    .option-btn:hover:not(:disabled) .option-key { border-color: var(--color-primary); color: var(--color-primary); }"""

new_option_hover = """    .option-btn {
      transition: all 0.2s var(--bounce-ease), box-shadow 0.25s var(--bounce-ease);
    }
    .option-btn:hover:not(:disabled) {
      border-color: var(--color-primary-mid);
      box-shadow: 0 0 0 3px var(--accent-glow);
      transform: translateX(4px);
    }
    .option-btn:hover:not(:disabled) .option-key {
      border-color: var(--color-primary);
      color: var(--color-primary);
      transform: scale(1.05);
    }
    .option-btn:active:not(:disabled) {
      animation: microPop 0.3s var(--bounce-ease);
    }"""

content = content.replace(old_option_hover, new_option_hover, 1)
changes += 1

# ── 7. Update .qf-option with interaction ──
old_qf_option_hover = """    .qf-option:hover:not(:disabled) {
      border-color: var(--color-primary-mid);
    }"""

new_qf_option_hover = """    .qf-option {
      transition: all 0.2s var(--bounce-ease), box-shadow 0.25s var(--bounce-ease);
    }
    .qf-option:hover:not(:disabled) {
      border-color: var(--color-primary-mid);
      box-shadow: 0 0 0 3px var(--accent-glow);
      transform: translateX(4px);
    }
    .qf-option:active:not(:disabled) {
      animation: microPop 0.3s var(--bounce-ease);
    }"""

content = content.replace(old_qf_option_hover, new_qf_option_hover, 1)
changes += 1

# ── 8. Update .q-nav-btn with interaction ──
old_qnav_hover = """    .q-nav-btn:hover:not(:disabled) { background: var(--color-surface); color: var(--color-text); border-color: var(--color-primary); }"""

new_qnav_hover = """    .q-nav-btn {
      transition: all 0.2s var(--bounce-ease), box-shadow 0.25s var(--bounce-ease);
    }
    .q-nav-btn:hover:not(:disabled) {
      background: var(--color-surface);
      color: var(--color-text);
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--accent-glow);
      transform: translateY(-1px);
    }
    .q-nav-btn:active:not(:disabled) {
      animation: microPop 0.3s var(--bounce-ease);
    }"""

content = content.replace(old_qnav_hover, new_qnav_hover, 1)
changes += 1

# ── 9. Update .categoria-btn with interaction ──
old_cat_hover = """    .categoria-btn:hover { border-color: var(--color-primary); background: oklch(from var(--color-primary) l c h / 0.05); }"""

new_cat_hover = """    .categoria-btn {
      transition: all 0.25s var(--bounce-ease), box-shadow 0.3s var(--bounce-ease);
    }
    .categoria-btn:hover {
      border-color: var(--color-primary);
      background: oklch(from var(--color-primary) l c h / 0.05);
      box-shadow: 0 0 0 3px var(--accent-glow);
      transform: translateY(-2px);
    }
    .categoria-btn:active {
      animation: microPop 0.3s var(--bounce-ease);
    }"""

content = content.replace(old_cat_hover, new_cat_hover, 1)
changes += 1

# ── 10. Update .drawer-action-btn with interaction ──
old_drawer_btn_hover = """    .drawer-action-btn:hover {
      border-color: var(--color-primary);
      background: oklch(from var(--color-primary) l c h / 0.06);
      transform: translateX(4px);
    }"""

new_drawer_btn_hover = """    .drawer-action-btn {
      transition: all 0.25s var(--bounce-ease), box-shadow 0.3s var(--bounce-ease);
    }
    .drawer-action-btn:hover {
      border-color: var(--color-primary);
      background: oklch(from var(--color-primary) l c h / 0.06);
      box-shadow: 0 0 0 3px var(--accent-glow);
      transform: translateX(6px) scale(1.01);
    }
    .drawer-action-btn:active {
      animation: microPop 0.3s var(--bounce-ease);
    }"""

content = content.replace(old_drawer_btn_hover, new_drawer_btn_hover, 1)
changes += 1

# ── 11. Update .qf-btn-primary with micro-interaction ──
old_qf_btn_hover = """    .qf-btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
    .qf-btn-ghost {"""

new_qf_btn_hover = """    .qf-btn-primary {
      transition: all 0.25s var(--bounce-ease), box-shadow 0.3s var(--bounce-ease);
    }
    .qf-btn-primary:hover {
      opacity: 0.95;
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 6px 20px oklch(from var(--color-primary) l c h / 0.35), 0 0 0 3px var(--accent-glow);
    }
    .qf-btn-primary:active {
      animation: microPop 0.35s var(--bounce-ease);
    }
    .qf-btn-ghost {"""

content = content.replace(old_qf_btn_hover, new_qf_btn_hover, 1)
changes += 1

# ── 12. Add ripple effect to btn-primary via JS integration ──
# Add mouse-position tracking for the radial gradient overlay on primary buttons
# This is done via CSS variable --mouse-x, --mouse-y

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Applied {changes} micro-interaction changes!")
