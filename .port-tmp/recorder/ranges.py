"""Prints `name start-end` for named legacy functions in index.html."""
import re, sys
from pathlib import Path

lines = (Path(__file__).resolve().parents[2] / 'legacy/index.html').read_text().splitlines()

def find(name):
    pattern = re.compile(r'^\s*(async\s+)?function\s+' + re.escape(name) + r'\s*\(')
    for i, line in enumerate(lines):
        if pattern.match(line):
            depth, started = 0, False
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
    print(f'{name} {hit[0]}-{hit[1]}' if hit else f'{name} MISSING')
