import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove ::before from btn-primary (no mouse-position JS)
old_before = "    .btn-primary::before, .btn-restart::before {\n      content: '';\n      position: absolute; inset: 0;\n      background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.12) 0%, transparent 60%);\n      opacity: 0;\n      transition: opacity 0.3s ease;\n      pointer-events: none;\n    }\n    .btn-primary:hover::before, .btn-restart:hover::before { opacity: 1; }"

if old_before in content:
    content = content.replace(old_before, '', 1)
    print('1. Removed ::before from btn-primary')
else:
    print('1. Could not find btn-primary ::before')

# 2. Remove unused @keyframes microPulse
old_pulse = "    @keyframes microPulse {\n      0%, 100% { box-shadow: 0 0 0 0 oklch(from var(--accent-500) l c h / 0.3); }\n      50% { box-shadow: 0 0 0 8px oklch(from var(--accent-500) l c h / 0); }\n    }"

if old_pulse in content:
    content = content.replace(old_pulse, '', 1)
    print('2. Removed unused microPulse keyframes')
else:
    print('2. Could not find microPulse keyframes')

# 3. Remove unused .glow-hover utility class
old_glow = "    .glow-hover {\n      transition: var(--glow-transition), background var(--transition), border-color var(--transition);\n    }\n    .glow-hover:hover {\n      box-shadow: 0 0 0 3px var(--accent-glow), 0 4px 14px oklch(from var(--accent-500) l c h / 0.12);\n    }"

if old_glow in content:
    content = content.replace(old_glow, '', 1)
    print('3. Removed unused .glow-hover utility')
else:
    print('3. Could not find .glow-hover utility')

# 4. Simplify double box-shadow in .mode-card.selected
old_mode_sel = "    .mode-card.selected {\n      border-color: var(--color-primary);\n      box-shadow: 0 0 0 4px oklch(from var(--color-primary) l c h / 0.2), 0 0 0 6px var(--accent-glow);\n      background: oklch(from var(--color-primary) l c h / 0.05);\n    }"

new_mode_sel = "    .mode-card.selected {\n      border-color: var(--color-primary);\n      box-shadow: 0 0 0 4px oklch(from var(--color-primary) l c h / 0.2);\n      background: oklch(from var(--color-primary) l c h / 0.05);\n    }"

if old_mode_sel in content:
    content = content.replace(old_mode_sel, new_mode_sel, 1)
    print('4. Fixed .mode-card.selected box-shadow')
else:
    print('4. Could not find .mode-card.selected')

# 5. Simplify double box-shadow in .filter-card.active
old_filter_active = "    .filter-card.active {\n      border-color: var(--color-primary);\n      background: oklch(from var(--color-primary) l c h / 0.1);\n      box-shadow: 0 0 0 3px oklch(from var(--color-primary) l c h / 0.15), 0 0 0 5px var(--accent-glow);\n    }"

new_filter_active = "    .filter-card.active {\n      border-color: var(--color-primary);\n      background: oklch(from var(--color-primary) l c h / 0.1);\n      box-shadow: 0 0 0 3px oklch(from var(--color-primary) l c h / 0.15);\n    }"

if old_filter_active in content:
    content = content.replace(old_filter_active, new_filter_active, 1)
    print('5. Fixed .filter-card.active box-shadow')
else:
    print('5. Could not find .filter-card.active')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('All review fixes done!')
