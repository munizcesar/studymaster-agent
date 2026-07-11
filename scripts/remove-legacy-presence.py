"""
Remove legacy aivo-presence.js from index.html.
The new architecture (src/aivo/engine/boot.ts) handles everything.
Fixed: handles both \r\n and \n line endings.
"""
with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# Remove with any line ending
import re
content = re.sub(
    r'\s*<script src="src/aivo-presence\.js"></script>\s*',
    '\n',
    content
)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)

print("REMOVED aivo-presence.js from index.html")
