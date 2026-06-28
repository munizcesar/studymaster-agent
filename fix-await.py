#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys, os
sys.stdout = open(sys.stdout.fileno(), 'w', encoding='utf-8', errors='replace')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

old = 'function goToStep(target) {'
new = 'async function goToStep(target) {'
if old in content:
    content = content.replace(old, new, 1)
    print("OK: goToStep is now async")
else:
    print("NOT FOUND: goToStep definition")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
