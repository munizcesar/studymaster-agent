with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

changes = 0

# 1. drawer-tabs - remove overflow-x: auto
old = '.drawer-tabs {\n  display: flex;\n  gap: 0;\n  padding: var(--space-2) var(--space-3);\n  border-bottom: 1px solid var(--color-divider);\n  background: var(--color-surface-offset);\n  flex-shrink: 0;\n  overflow-x: auto;\n  -webkit-overflow-scrolling: touch;\n}'
new = '.drawer-tabs {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 2px;\n  padding: var(--space-1) var(--space-2);\n  border-bottom: 1px solid var(--color-divider);\n  background: var(--color-surface-offset);\n  flex-shrink: 0;\n  overflow: hidden;\n}'
if old in content:
    content = content.replace(old, new)
    changes += 1
    print('[OK] drawer-tabs: flex-wrap + hidden overflow')

# 2. drawer-body - thin scrollbar, less padding
old = '.drawer-body {\n  flex: 1;\n  overflow-y: auto;\n  padding: var(--space-4) var(--space-5);\n  -webkit-overflow-scrolling: touch;\n}'
new = '.drawer-body {\n  flex: 1;\n  overflow-y: auto;\n  padding: var(--space-3) var(--space-4);\n  -webkit-overflow-scrolling: touch;\n  scrollbar-width: thin;\n  scrollbar-color: oklch(from var(--color-primary) l c h / 0.2) transparent;\n}'
if old in content:
    content = content.replace(old, new)
    changes += 1
    print('[OK] drawer-body: thin scrollbar + compact padding')

# Add webkit scrollbar styles for drawer-body
webkit_css = '\n    .drawer-body::-webkit-scrollbar {\n      width: 4px;\n    }\n    .drawer-body::-webkit-scrollbar-track {\n      background: transparent;\n    }\n    .drawer-body::-webkit-scrollbar-thumb {\n      background: oklch(from var(--color-primary) l c h / 0.15);\n      border-radius: 99px;\n    }\n    .drawer-body::-webkit-scrollbar-thumb:hover {\n      background: oklch(from var(--color-primary) l c h / 0.25);\n    }'

# Insert webkit scrollbar after drawer-body rule
if webkit_css not in content:
    # Find drawer-panel-header which comes after drawer-body
    marker = '.drawer-panel-header {\n      margin-bottom: var(--space-3);\n    }'
    if marker in content:
        content = content.replace(marker, '.drawer-panel-header {\n      margin-bottom: var(--space-2);\n    }' + webkit_css)
        changes += 1
        print('[OK] Added webkit scrollbar + compacted panel-header')
    else:
        # Try inserting before .drawer-empty
        marker2 = '.drawer-empty {'
        if marker2 in content:
            content = content.replace(marker2, webkit_css + '\n    ' + marker2)
            changes += 1
            print('[OK] Added webkit scrollbar (alt)')

# 3. drawer-action-btn - more compact
old = '.drawer-action-btn {\n  display: flex;\n  align-items: center;\n  gap: var(--space-3);\n  padding: var(--space-3) var(--space-4);\n  border: 1px solid var(--color-border);\n  border-radius: var(--radius-md);\n  background: var(--color-surface-offset);\n  color: var(--color-text);\n  text-align: left;\n  cursor: pointer;\n  transition: all var(--transition);\n  font-family: inherit;\n  width: 100%;\n}'
new = '.drawer-action-btn {\n  display: flex;\n  align-items: center;\n  gap: var(--space-2);\n  padding: var(--space-2) var(--space-3);\n  border: 1px solid var(--color-border);\n  border-radius: var(--radius-md);\n  background: var(--color-surface-offset);\n  color: var(--color-text);\n  text-align: left;\n  cursor: pointer;\n  transition: all var(--transition);\n  font-family: inherit;\n  width: 100%;\n}'
if old in content:
    content = content.replace(old, new)
    changes += 1
    print('[OK] drawer-action-btn: compact padding')

# 4. drawer-tabs already fixed above

# 5. drawer-tab - remove flex:1 to prevent squishing
old = '.drawer-tab {\n  display: flex;\n  align-items: center;\n  gap: var(--space-1);\n  padding: var(--space-2) var(--space-3);\n  border-radius: var(--radius-md);\n  font-size: var(--text-xs);\n  font-weight: 600;\n  color: var(--color-text-muted);\n  transition: all var(--transition);\n  white-space: nowrap;\n  border: none;\n  background: transparent;\n  cursor: pointer;\n  flex: 1;\n  justify-content: center;\n}'
new = '.drawer-tab {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  padding: var(--space-1) var(--space-2);\n  border-radius: var(--radius-md);\n  font-size: var(--text-xs);\n  font-weight: 600;\n  color: var(--color-text-muted);\n  transition: all var(--transition);\n  white-space: nowrap;\n  border: none;\n  background: transparent;\n  cursor: pointer;\n  flex: 0 0 auto;\n}'
if old in content:
    content = content.replace(old, new)
    changes += 1
    print('[OK] drawer-tab: auto-width, compact padding')

# 6. drawer-metric - compact
old = '.drawer-metric {\n  text-align: center;\n  padding: var(--space-3);\n  background: var(--color-surface-offset);\n  border-radius: var(--radius-md);\n  border: 1px solid var(--color-border);\n}'
new = '.drawer-metric {\n  text-align: center;\n  padding: var(--space-1) var(--space-2);\n  background: var(--color-surface-offset);\n  border-radius: var(--radius-md);\n  border: 1px solid var(--color-border);\n}'
if old in content:
    content = content.replace(old, new)
    changes += 1
    print('[OK] drawer-metric: compact padding')

# 7. drawer-history-item - compact
old = '.drawer-history-item {\n  display: flex;\n  align-items: center;\n  gap: var(--space-3);\n  padding: var(--space-3);\n  background: var(--color-surface-offset);\n  border: 1px solid var(--color-border);\n  border-radius: var(--radius-md);\n  font-size: var(--text-xs);\n  transition: all var(--transition);\n  cursor: pointer;\n}'
new = '.drawer-history-item {\n  display: flex;\n  align-items: center;\n  gap: var(--space-2);\n  padding: var(--space-2);\n  background: var(--color-surface-offset);\n  border: 1px solid var(--color-border);\n  border-radius: var(--radius-md);\n  font-size: var(--text-xs);\n  transition: all var(--transition);\n  cursor: pointer;\n}'
if old in content:
    content = content.replace(old, new)
    changes += 1
    print('[OK] drawer-history-item: compact')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print(f'\nTotal: {changes} changes applied')
