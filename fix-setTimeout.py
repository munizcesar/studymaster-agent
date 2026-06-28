# Fix: Change setTimeout(() => {  to setTimeout(async () => {  at line 5993 in index.html
# This setTimeout callback contains await fetch(WORKER_URL, ...) inside goToStep function

with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Line 5993 is '  setTimeout(() => {\n'
target_line = 5993  # 1-indexed
line_idx = target_line - 1  # 0-indexed

original = lines[line_idx]
print(f"Line {target_line} before: {repr(original)}")

# Replace setTimeout(() => { with setTimeout(async () => {
lines[line_idx] = original.replace('setTimeout(() => {', 'setTimeout(async () => {', 1)

print(f"Line {target_line} after:  {repr(lines[line_idx])}")

if original == lines[line_idx]:
    print("ERROR: No change was made! Check the exact string.")
    exit(1)

with open('index.html', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Fix applied successfully!")
