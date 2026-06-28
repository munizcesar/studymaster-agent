#!/usr/bin/env python3
import re

with open('check_script.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Count braces to find scope
# Line 713: async function goToStep(target) {
# Line 785: const res = await fetch(WORKER_URL, {

# Count braces from line 713 to line 784 to see if we're still in goToStep scope
depth = 0
inside_async = False

for i, line in enumerate(lines):
    stripped = line.strip()
    line_num = i + 1
    
    # Detect async function start
    if 'async function' in stripped and '{' in stripped:
        inside_async = True
        depth += stripped.count('{') - stripped.count('}')
        print(f"Line {line_num}: ASYNC FUNCTION starts, depth={depth}")
        continue
    
    # If we were inside an async function, track depth
    if inside_async:
        opens = stripped.count('{')
        closes = stripped.count('}')
        depth += opens - closes
        if depth <= 0 and closes > 0:
            # Might have closed
            if depth == 0:
                print(f"Line {line_num}: ASYNC FUNCTION CLOSED, depth={depth}")
                inside_async = False
            elif depth < 0:
                print(f"Line {line_num}: BRACE MISMATCH! depth={depth}")
        
        if line_num >= 780 and line_num <= 790:
            print(f"Line {line_num}: (inside async, depth={depth}) {stripped[:80]}")

# Now let's do a more careful tracking
print("\n\n=== DETAILED SCOPE TRACKING ===")
stack = []  # Stack of (line_num, type) where type is 'async_func', 'sync_func', 'block'
for i, line in enumerate(lines):
    stripped = line.strip()
    line_num = i + 1
    
    if line_num < 710: continue
    if line_num > 790: break
    
    # Track function definitions
    if 'function ' in stripped and '{' in stripped:
        is_async = 'async' in stripped
        func_type = 'ASYNC' if is_async else 'SYNC'
        stack.append((line_num, func_type))
        print(f"  Line {line_num}: [{func_type}] {stripped[:60]}")
    
    # Track opening braces for blocks
    opens = stripped.count('{')
    closes = stripped.count('}')
    
    # Close functions when braces match
    if closes > 0 and stack:
        pass  # We'll track depth differently
    
    if line_num in [785, 790]:
        print(f"  >>> LINE {line_num}: {stripped[:80]}")
