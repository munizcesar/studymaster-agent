"""
Proper JavaScript token scanner for index.html inline script.
Handles: strings (single/double), template literals (with nesting), comments, regex.
Counts braces/parens/brackets properly.
"""
import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Extract first inline script
script_pattern = re.compile(r'<script>(.*?)</script>', re.DOTALL | re.IGNORECASE)
matches = script_pattern.findall(html)
script = matches[0]

chars = list(script)
n = len(chars)

i = 0
in_single = False
in_double = False
in_template = False
template_depth = 0  # ${...} nesting inside template
in_line_comment = False
in_block_comment = False

braces = 0
parens = 0
brackets = 0
backtick_count = 0

line = 1

while i < n:
    ch = chars[i]
    next_ch = chars[i+1] if i+1 < n else ''
    
    if ch == '\n':
        line += 1
        i += 1
        continue
    
    # Comments
    if not (in_single or in_double or in_template):
        if ch == '/' and next_ch == '/':
            in_line_comment = True
            i += 2
            continue
        if ch == '/' and next_ch == '*':
            in_block_comment = True
            i += 2
            continue
    
    if in_line_comment:
        i += 1
        continue
    if in_block_comment:
        if ch == '*' and next_ch == '/':
            in_block_comment = False
            i += 2
        else:
            i += 1
        continue
    
    # Strings
    if not (in_single or in_double or in_template):
        if ch == "'" and next_ch != "'":
            in_single = True
            i += 1
            continue
        if ch == '"':
            in_double = True
            i += 1
            continue
    
    if in_single:
        if ch == '\\': i += 2; continue
        if ch == "'": in_single = False
        i += 1
        continue
    if in_double:
        if ch == '\\': i += 2; continue
        if ch == '"': in_double = False
        i += 1
        continue
    
    # Template literals
    if ch == '`':
        if not in_template:
            in_template = True
            template_depth = 0
        elif template_depth == 0:
            in_template = False
        # else: backtick inside ${} - nested template, ignore here
        backtick_count += 1
        i += 1
        continue
    
    if in_template:
        if ch == '$' and next_ch == '{':
            template_depth += 1
            i += 2
            continue
        if ch == '}' and template_depth > 0:
            template_depth -= 1
            i += 1
            continue
        if ch == '\\':
            i += 2  # skip escaped char
            continue
        i += 1
        continue
    
    # Count braces/parens/brackets (not in any string/comment/template)
    if ch == '{': braces += 1
    elif ch == '}': braces -= 1
    elif ch == '(': parens += 1
    elif ch == ')': parens -= 1
    elif ch == '[': brackets += 1
    elif ch == ']': brackets -= 1
    
    i += 1

print(f"Backtick pairs: {backtick_count}")
print(f"Even: {backtick_count % 2 == 0}")
print(f"\nFinal counts:")
print(f"  Braces: {braces} (should be 0)")
print(f"  Parens: {parens} (should be 0)")
print(f"  Brackets: {brackets} (should be 0)")
if braces > 0: print(f"  Missing {braces} closing braces")
elif braces < 0: print(f"  Extra {-braces} closing braces")
if parens > 0: print(f"  Missing {parens} closing parens")
elif parens < 0: print(f"  Extra {-parens} closing parens")
if brackets > 0: print(f"  Missing {brackets} closing brackets")
elif brackets < 0: print(f"  Extra {-brackets} closing brackets")
