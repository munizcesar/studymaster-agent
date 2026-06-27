import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix critical bug: tab.dataset.drawertab -> tab.dataset.drawerTab
old = "tab.dataset.drawertab"
new = "tab.dataset.drawerTab"

if old in content:
    content = content.replace(old, new, 1)
    print("Fixed: dataset.drawertab -> dataset.drawerTab")
else:
    print("Could not find 'tab.dataset.drawertab' pattern")
    # Try alternate patterns
    if old.replace('t', 'T') in content:
        print("Found alternate casing")
    else:
        # Search for nearby text
        import re
        matches = list(re.finditer(r'dataset\.drawer\w*', content))
        for m in matches:
            print(f"Found: '{m.group()}' at position {m.start()}")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
