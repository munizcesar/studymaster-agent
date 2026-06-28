import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Extract first inline script
script_pattern = re.compile(r'<script>(.*?)</script>', re.DOTALL | re.IGNORECASE)
matches = script_pattern.findall(html)
script = matches[0]

lines = script.split('\n')

# Find ALL backtick positions
positions = []
for line_idx, line in enumerate(lines):
    for col_idx, ch in enumerate(line):
        if ch == chr(96):  # backtick
            # Get context with exact character positions
            ctx_start = max(0, col_idx - 25)
            ctx_end = min(len(line), col_idx + 30)
            context = line[ctx_start:ctx_end]
            # Replace backtick with visible marker
            context_viz = context.replace(chr(96), '`')
            line_num = line_idx + 1
            positions.append((line_num, col_idx, context_viz))

print(f'Total backticks: {len(positions)}')
print(f'First 5:')
for p in positions[:5]:
    print(f'  Line {p[0]}, col {p[1]}: ...{p[2]}...')

print(f'\nLast 10:')
for p in positions[-10:]:
    print(f'  Line {p[0]}, col {p[1]}: ...{p[2]}...')

print(f'\nEven/Odd: {len(positions) % 2 == 0}')

# Find lines between last opening backtick and end of file
# that might have a backtick that was missed
# The last odd-indexed backtick opens an unclosed template
last_open_idx = len(positions) - 1  # last backtick (0-indexed)
if len(positions) % 2 == 1:  # odd number - last one opens
    p = positions[-1]
    print(f'\nLast backtick (opens unclosed template): Line {p[0]}, col {p[1]}')
    print(f'  Context: ...{p[2]}...')
    
    # Show lines after this position
    rel_line = p[0] - 1  # 0-indexed
    start = max(0, rel_line - 2)
    end = min(len(lines), rel_line + 3)
    print(f'\nLines {start+1}-{end}:')
    for i in range(start, end):
        marker = '>>>' if i == rel_line else '   '
        line_disp = lines[i].replace(chr(96), '`')
        print(f'{marker} {i+1}: {line_disp}')
    
    # Check the content AFTER the backtick on the same line
    last_line = lines[p[0] - 1]
    after_bt = last_line[p[1]+1:]
    print(f'\nContent after last backtick: {after_bt[:80]}')
    print(f'Contains closing backtick? {chr(96) in after_bt}')
