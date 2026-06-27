import re

with open('worker.js', 'r', encoding='utf-8') as f:
    content = f.read()

# The problem: template literal closes with `; then the next line
# starts with ${var ? ... which is outside the template literal
#
# Pattern to fix:
# ...${subjectConfig.label}.`;\n${concursoBancaInstr ? `\n\nINSTRUÇÕES...
#
# Fix: remove the `; before the ${ and add `; after the : ""}
#
# Current:  ...label}.`;${concursoBancaInstr ? `...` : ""}
# Fixed:    ...label}.${concursoBancaInstr ? `...` : ""}`;

def fix_banca_instr(text, search_term):
    # Find the search term
    idx = text.find(search_term)
    if idx < 0:
        print(f"  '{search_term}' not found")
        return text
    
    # Find the backtick-semicolon before it
    before = text[:idx]
    btick_semi = before.rfind('`;')
    if btick_semi < 0:
        print(f"  No '`;' before '{search_term}'")
        return text
    
    # Find the end of the expression: : ""}
    end_marker = ': ""}'
    end_idx = text.find(end_marker, idx)
    if end_idx < 0:
        print(f"  No '{end_marker}' after '{search_term}'")
        # Try : ""}
        end_marker = ': ""}'
        end_idx = text.find(end_marker, idx)
        if end_idx < 0:
            print(f"  No '{end_marker}' either")
            return text
    
    end_expr = end_idx + len(end_marker)  # 5 chars
    
    print(f"  Found '{search_term}' at {idx}")
    print(f"  '`;' before it at {btick_semi}")
    print(f"  '{end_marker}' ends at {end_expr}")
    
    # Extract context around the area
    context_before = text[btick_semi-20:btick_semi]
    context_after = text[end_expr:end_expr+20]
    print(f"  Context before `;: {repr(context_before)}")
    print(f"  Context after : \"\"}}: {repr(context_after)}")
    
    # Build fixed version
    # part1: everything up to the backtick (but keep the backtick)
    # part2: everything between `; and ${ (remove the ; and the \n, keep the ${)
    # part3: the ${search_term ... : ""} expression
    # part4: everything after : ""}
    
    # Actually: remove the `; (2 chars) and add `; after the expr
    fixed = text[:btick_semi] + text[btick_semi+2:end_expr] + '`;' + text[end_expr:]
    
    return fixed

print("=== Fix 1: concursoBancaInstr ===")
content = fix_banca_instr(content, 'concursoBancaInstr ?')

print("\n=== Fix 2: academicBancaInstr ===")
content = fix_banca_instr(content, 'academicBancaInstr ?')

with open('worker.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("\nDone!")
