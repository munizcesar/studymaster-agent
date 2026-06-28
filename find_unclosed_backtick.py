import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Extract first inline script
script_pattern = re.compile(r'<script>(.*?)</script>', re.DOTALL | re.IGNORECASE)
matches = script_pattern.findall(html)
script = matches[0]

lines = script.split('\n')

# Find all backtick positions with line numbers
backtick_positions = []
for line_idx, line in enumerate(lines):
    for col_idx, ch in enumerate(line):
        if ch == chr(96):  # backtick
            # Show context (a few chars before and after)
            ctx_start = max(0, col_idx - 15)
            ctx_end = min(len(line), col_idx + 25)
            context = line[ctx_start:ctx_end].strip()
            backtick_positions.append((line_idx + 1, col_idx, context))

print(f'Total backticks found: {len(backtick_positions)}')
print()

# Process sequentially tracking template literal depth
in_template = False
last_open_line = 0
last_open_context = ''

for idx, (line, col, context) in enumerate(backtick_positions):
    if not in_template:
        in_template = True
        last_open_line = line
        last_open_context = context
    else:
        in_template = False

print(f'Final state: in_template = {in_template}')
if in_template:
    print(f'\nUNCLOSED TEMPLATE LITERAL at line {last_open_line}!')
    print(f'Context: {last_open_context}')
    
    # Show surrounding lines for context
    start_line = max(0, last_open_line - 4)
    end_line = min(len(lines), last_open_line + 4)
    print(f'\nLines {start_line} - {end_line}:')
    for i in range(start_line, end_line):
        marker = '>>>' if i + 1 == last_open_line else '   '
        print(f'{marker} {i+1}: {lines[i]}')
else:
    print('All template literals are properly closed.')
