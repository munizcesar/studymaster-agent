import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

changes = 0

# 1. Fix .drawer-tabs to not overflow horizontally - use flex-wrap + hidden
old_tabs = '''    .drawer-tabs {
      display: flex;
      flex-shrink: 0;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;'''
new_tabs = '''    .drawer-tabs {
      display: flex;
      flex-shrink: 0;
      overflow-x: hidden;
      flex-wrap: wrap;
      gap: 2px;'''
if old_tabs in content:
    content = content.replace(old_tabs, new_tabs)
    changes += 1
    print('[OK] Fixed drawer-tabs overflow-x')
else:
    print('[FAIL] drawer-tabs not found')

# 2. Add custom thin scrollbar to drawer-body - find the existing rule
old_drawer_body = '''    .drawer-body {
      flex: 1;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      padding: var(--space-4) var(--space-5);'''
new_drawer_body = '''    .drawer-body {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      padding: var(--space-3) var(--space-4);
      scrollbar-width: thin;
      scrollbar-color: oklch(from var(--color-primary) l c h / 0.2) transparent;'''
if old_drawer_body in content:
    content = content.replace(old_drawer_body, new_drawer_body)
    changes += 1
    print('[OK] Fixed drawer-body with thin scrollbar')
else:
    print('[FAIL] drawer-body not found (trying alt)')
    # Try without padding variant
    alt_old = '''    .drawer-body {
      flex: 1;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;'''
    alt_new = '''    .drawer-body {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;
      scrollbar-color: oklch(from var(--color-primary) l c h / 0.2) transparent;'''
    if alt_old in content:
        content = content.replace(alt_old, alt_new)
        changes += 1
        print('[OK] Fixed drawer-body (alt)')

# 3. Compact drawer-action-btn
old_action_btn = '''    .drawer-action-btn {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      width: 100%;
      padding: var(--space-3) var(--space-3);
      background: var(--color-surface-offset);
      border: 1px solid transparent;
      border-radius: var(--radius-md);
      text-align: left;
      font-family: inherit;
      font-size: var(--text-sm);
      color: var(--color-text);
      cursor: pointer;
      transition: all 0.25s var(--bounce-ease), box-shadow 0.3s var(--bounce-ease);
    }'''
new_action_btn = '''    .drawer-action-btn {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      width: 100%;
      padding: var(--space-2) var(--space-3);
      background: var(--color-surface-offset);
      border: 1px solid transparent;
      border-radius: var(--radius-md);
      text-align: left;
      font-family: inherit;
      font-size: var(--text-sm);
      color: var(--color-text);
      cursor: pointer;
      transition: all 0.25s var(--bounce-ease), box-shadow 0.3s var(--bounce-ease);
    }'''
if old_action_btn in content:
    content = content.replace(old_action_btn, new_action_btn)
    changes += 1
    print('[OK] Compacted drawer-action-btn')
else:
    print('[FAIL] drawer-action-btn not found')

# 4. Reduce metrics grid gap
old_metrics = '''    .drawer-metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-3);'''
new_metrics = '''    .drawer-metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-2);'''
if old_metrics in content:
    content = content.replace(old_metrics, new_metrics)
    changes += 1
    print('[OK] Reduced metrics grid gap')
else:
    print('[FAIL] drawer-metrics-grid not found')

# 5. Reduce metric card padding
old_metric_pad = '''    .drawer-metric {
      text-align: center;
      padding: var(--space-2);
      background: var(--color-surface-2);
      border-radius: var(--radius-md);'''
new_metric_pad = '''    .drawer-metric {
      text-align: center;
      padding: var(--space-1) var(--space-2);
      background: var(--color-surface-2);
      border-radius: var(--radius-md);'''
if old_metric_pad in content:
    content = content.replace(old_metric_pad, new_metric_pad)
    changes += 1
    print('[OK] Reduced metric padding')
else:
    print('[FAIL] drawer-metric not found')

# 6. Add WebKit scrollbar styles for drawer-body
webkit_scrollbar = '''
    .drawer-body::-webkit-scrollbar {
      width: 4px;
    }
    .drawer-body::-webkit-scrollbar-track {
      background: transparent;
    }
    .drawer-body::-webkit-scrollbar-thumb {
      background: oklch(from var(--color-primary) l c h / 0.15);
      border-radius: 99px;
    }
    .drawer-body::-webkit-scrollbar-thumb:hover {
      background: oklch(from var(--color-primary) l c h / 0.25);
    }'''

# Insert after the drawer-body rule (look for a pattern after drawer-body)
insert_point = '      scrollbar-color: oklch(from var(--color-primary) l c h / 0.2) transparent;'
if insert_point in content and webkit_scrollbar not in content:
    idx = content.index(insert_point) + len(insert_point)
    # Find the next rule or media query
    remainder = content[idx:]
    # Find the next closing brace + newline to insert after
    insert_pos = idx
    brace_count = 0
    found_open = False
    for i, c in enumerate(content[idx:]):
        if c == '{':
            brace_count += 1
            found_open = True
        elif c == '}':
            brace_count -= 1
            if found_open and brace_count < 0:
                insert_pos = idx + i + 1
                break
    # More robust: find next property starting with .
    import re
    # Instead, let's just append after the drawer-actions-list rule
    # Find '    .drawer-history-item' or similar
    patterns = ['    .drawer-panel-header', '    .drawer-empty', '    @keyframes drawerPanelIn']
    inserted = False
    for pat in patterns:
        if pat in content:
            # Insert webkit scrollbar before this pattern
            pos = content.index(pat)
            # Go back to previous empty line
            prev_newline = content.rfind('\n\n', 0, pos)
            if prev_newline > 0:
                before = content[:prev_newline]
                after = content[prev_newline:]
                content = before + '\n' + webkit_scrollbar + after
                changes += 1
                inserted = True
                print('[OK] Added WebKit scrollbar styles')
                break
    
    if not inserted:
        # Try inserting after drawer-body rule by finding end of its block
        db_start = content.index('    .drawer-body {')
        brace_count = 0
        found_first = False
        end_pos = db_start
        for i, c in enumerate(content[db_start:]):
            if c == '{':
                brace_count += 1
                found_first = True
            elif c == '}':
                brace_count -= 1
                if found_first and brace_count == 0:
                    end_pos = db_start + i + 1
                    break
        content = content[:end_pos] + webkit_scrollbar + content[end_pos:]
        changes += 1
        print('[OK] Added WebKit scrollbar styles (alt method)')

# 7. Reduce drawer-action-btn icon size
old_icon = '      width: 32px;\n      height: 32px;\n      flex-shrink: 0;'
if old_icon in content and 'drawer-action-btn-icon' in content or 'drawer-action-btn' in content:
    # Find icon style INSIDE drawer-action-btn context
    # Let me look for a specific icon class
    pass

# 8. Compact drawer-panel-header margin
old_panel_header = '''    .drawer-panel-header {
      margin-bottom: var(--space-3);'''
new_panel_header = '''    .drawer-panel-header {
      margin-bottom: var(--space-2);'''
if old_panel_header in content:
    content = content.replace(old_panel_header, new_panel_header)
    changes += 1
    print('[OK] Compacted drawer-panel-header')

# 9. Improve drawer-tab styling for compactness
old_tab = '''    .drawer-tab {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      padding: var(--space-2) var(--space-3);
      white-space: nowrap;
      font-size: var(--text-sm);
      font-weight: 500;
      color: var(--color-text-muted);
      border: none;
      background: none;
      cursor: pointer;
      border-radius: var(--radius-md);
      transition: all var(--transition);
      font-family: inherit;
    }'''
new_tab = '''    .drawer-tab {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      padding: var(--space-1) var(--space-2);
      white-space: nowrap;
      font-size: var(--text-xs);
      font-weight: 600;
      color: var(--color-text-muted);
      border: none;
      background: none;
      cursor: pointer;
      border-radius: var(--radius-md);
      transition: all var(--transition);
      font-family: inherit;
    }'''
if old_tab in content:
    content = content.replace(old_tab, new_tab)
    changes += 1
    print('[OK] Compacted drawer-tab')
else:
    print('[FAIL] drawer-tab not found')

# 10. Compact drawer history items
old_history = '''    .drawer-history-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3);
      padding: var(--space-3);
      background: var(--color-surface-2);
      border-radius: var(--radius-md);
      font-size: var(--text-sm);'''
new_history = '''    .drawer-history-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-3);
      background: var(--color-surface-2);
      border-radius: var(--radius-md);
      font-size: var(--text-xs);'''
if old_history in content:
    content = content.replace(old_history, new_history)
    changes += 1
    print('[OK] Compacted drawer-history-item')

# 11. Drawer-actions-list gap
old_actions_list = '''    .drawer-actions-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);'''
if old_actions_list in content:
    # already compact, good
    pass

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print(f'\nTotal changes applied: {changes}')
