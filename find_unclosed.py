"""Find unclosed constructs in index.html inline script"""
import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

script = re.search(r'<script>(.*?)</script>', html, re.DOTALL | re.IGNORECASE).group(1)
lines = script.split('\n')

stack = []
in_single = False
in_double = False
in_template = False
template_depth = 0
in_block_comment = False

for line_idx, line in enumerate(lines):
    i = 0
    while i < len(line):
        ch = line[i]
        next_ch = line[i+1] if i+1 < len(line) else ''
        col = i + 1
        
        if not (in_single or in_double or in_template):
            if ch == '/' and next_ch == '*':
                in_block_comment = True
                i += 2
                continue
        if in_block_comment:
            if ch == '*' and next_ch == '/':
                in_block_comment = False
                i += 2
            else:
                i += 1
            continue
        
        if not (in_single or in_double or in_template):
            if ch == "'":
                in_single = True
                i += 1
                continue
            if ch == '"':
                in_double = True
                i += 1
                continue
        
        if in_single:
            if ch == '\\':
                i += 2
                continue
            if ch == "'":
                in_single = False
            i += 1
            continue
        
        if in_double:
            if ch == '\\':
                i += 2
                continue
            if ch == '"':
                in_double = False
            i += 1
            continue
        
        if ch == '`':
            if not in_template:
                in_template = True
                template_depth = 0
                stack.append(('`', line_idx + 1, col, line.strip()[:60]))
            elif template_depth == 0:
                in_template = False
                # Find and pop matching backtick from stack
                for j in range(len(stack)-1, -1, -1):
                    if stack[j][0] == '`':
                        stack.pop(j)
                        break
            i += 1
            continue
        
        if in_template:
            if ch == '$' and next_ch == '{':
                template_depth += 1
                stack.append(('{', line_idx + 1, col, line.strip()[:60]))
                i += 2
                continue
            if ch == '}' and template_depth > 0:
                template_depth -= 1
                if stack and stack[-1][0] == '{':
                    stack.pop()
                i += 1
                continue
            if ch == '\\':
                i += 2
                continue
            i += 1
            continue
        
        if ch == '{':
            stack.append(('{', line_idx + 1, col, line.strip()[:60]))
        elif ch == '}':
            if stack and stack[-1][0] == '{':
                stack.pop()
            else:
                print(f'EXTRA }} at line {line_idx+1}, col {col}: {line.strip()[:60]}')
        elif ch == '(':
            stack.append(('(', line_idx + 1, col, line.strip()[:60]))
        elif ch == ')':
            if stack and stack[-1][0] == '(':
                stack.pop()
            else:
                print(f'EXTRA ) at line {line_idx+1}, col {col}: {line.strip()[:60]}')
        elif ch == '[':
            stack.append(('[', line_idx + 1, col, line.strip()[:60]))
        elif ch == ']':
            if stack and stack[-1][0] == '[':
                stack.pop()
            else:
                print(f'EXTRA ] at line {line_idx+1}, col {col}: {line.strip()[:60]}')
        
        i += 1
    # end of line - reset line comment state

print(f'\nTotal lines: {len(lines)}')
print(f'Unclosed constructs remaining: {len(stack)}')
for item in stack:
    print(f'  [{item[0]}] at line {item[1]}, col {item[2]} - {item[3]}')
