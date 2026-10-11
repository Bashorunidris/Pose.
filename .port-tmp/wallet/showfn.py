"""Prints named legacy functions from index.html, bodies and all."""
import re
import sys
from pathlib import Path

lines = (Path(__file__).resolve().parents[2] / 'index.html').read_text().splitlines()

def find(name):
    pattern = re.compile(r'^\s*(async\s+)?function\s+' + re.escape(name) + r'\s*\(')
    for i, line in enumerate(lines):
        if pattern.match(line):
            depth = 0
            started = False
            for j in range(i, len(lines)):
                depth += lines[j].count('{') - lines[j].count('}')
                if '{' in lines[j]:
                    started = True
                if started and depth <= 0:
                    return i + 1, j + 1
            return i + 1, len(lines)
    return None

for name in sys.argv[1:]:
    hit = find(name)
    if not hit:
        print(f'--- {name}: NOT FOUND ---')
        continue
    start, end = hit
    print(f'--- {name} ({start}-{end}) ---')
    print('\n'.join(lines[start - 1:end]))
    print()
