"""Builds web/components/pose-app/sounds/sounds.css from index.html.

`#soundLibraryModal` @26278 and the tabs, banner slider, sound rows and empty
states inside it are dense legacy markup the port keeps on the legacy class
names, the way the recorder and the wallet do — so their rules are lifted from
index.html verbatim and scoped under `.sounds-shell` instead of being retyped as
Tailwind.
"""
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
INDEX = ROOT / 'legacy/index.html'
OUT = ROOT / 'web/components/pose-app/sounds/sounds.css'

PREFIXES = ('.sound-', '.banner-', '.voice-', '.search-icon', '.trending-')

# The legacy `:root` @64 dropped out of the recorder's own extraction, so the two
# custom properties these rules lean on are carried here by hand.
VARS = (
    '/* The legacy `:root` @64 tokens these rules use. */\n'
    '.sounds-shell {\n'
    '    --radius-sm: 8px;\n'
    '    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);\n'
    '}\n\n'
)

# Line ranges in index.html, in page order.
RANGES = [
    (15247, 15888, 'the sound library modal'),
]


def split_blocks(css):
    out, i, prelude = [], 0, ''
    while i < len(css):
        c = css[i]
        if c == '/' and css[i + 1:i + 2] == '*':
            end = css.find('*/', i + 2)
            prelude += css[i:end + 2] if end != -1 else css[i:]
            i = len(css) if end == -1 else end + 2
            continue
        if c == chr(34) or c == chr(39):
            end = css.find(c, i + 1)
            prelude += css[i:end + 1] if end != -1 else css[i:]
            i = len(css) if end == -1 else end + 1
            continue
        if c == '{':
            depth, j = 1, i + 1
            while j < len(css) and depth:
                if css[j] == '{':
                    depth += 1
                elif css[j] == '}':
                    depth -= 1
                j += 1
            out.append((prelude.strip(), css[i + 1:j - 1]))
            prelude, i = '', j
            continue
        if c == ';':
            if prelude.strip():
                out.append((prelude.strip(), None))
            prelude, i = '', i + 1
            continue
        prelude += c
        i += 1
    if prelude.strip():
        out.append((prelude.strip(), None))
    return out


def keep(selector):
    stripped = selector.strip()
    return stripped.startswith(PREFIXES)


def clean_prelude(prelude):
    """Selector text without the comments a legacy rule can carry above it."""
    comments = ' '.join(re.findall(r'/\*.*?\*/', prelude, flags=re.S))
    return re.sub(r'/\*.*?\*/', ' ', prelude, flags=re.S).strip(), comments


def filter_css(css):
    res = []
    for prelude, body in split_blocks(css):
        if body is None:
            if '<style' not in prelude and '</style>' not in prelude:
                res.append(prelude + ';')
            continue
        selector, comments = clean_prelude(prelude)
        name = re.split(r'[\s({]', selector[1:])[0].lower() if selector.startswith('@') else ''
        if name in ('media', 'supports'):
            inner = filter_css(body)
            if inner.strip():
                res.append(f'{prelude} {{\n{inner}}}\n')
            continue
        if name == 'keyframes':
            res.append(f'{prelude} {{{body}}}\n')
            continue
        kept = [s.strip() for s in selector.split(',') if keep(s)]
        if kept:
            lead = f'{comments}\n' if comments else ''
            res.append(lead + ', '.join(kept) + ' {' + body.strip() + '}\n')
    return '\n'.join(res)


def main():
    lines = INDEX.read_text().splitlines()
    chunks = []
    for start, end, note in RANGES:
        chunks.append(f'/* --- index.html {start}-{end}: {note} --- */\n')
        chunks.append('\n'.join(lines[start - 1:end]))
        chunks.append('\n')
    raw = '\n'.join(chunks)

    filtered = filter_css(raw)

    # The animations the kept rules ask for still need their keyframes.
    wanted = {
        m for m in re.findall(r'animation(?:-name)?:\s*([A-Za-z][\w-]*)', filtered)
        if m not in ('none', 'inherit', 'initial')
    }
    have = set(re.findall(r'@keyframes\s+([\w-]+)', filtered))
    page = INDEX.read_text()
    for name in sorted(wanted - have):
        match = re.search(r'@keyframes\s+' + re.escape(name) + r'\s*\{', page)
        if not match:
            print(f'  ! no @keyframes {name} in index.html', file=sys.stderr)
            continue
        depth, i = 1, match.end()
        while i < len(page) and depth:
            if page[i] == '{':
                depth += 1
            elif page[i] == '}':
                depth -= 1
            i += 1
        filtered += f'\n@keyframes {name} {{{page[match.end():i - 1]}}}\n'

    Path('.port-tmp/sounds/sounds-filtered.css').write_text(filtered)

    subprocess.run(
        ['node', '.port-tmp/scope.mjs', '.port-tmp/sounds/sounds-filtered.css',
         '.port-tmp/sounds/sounds-scoped.css', '.sounds-shell'],
        check=True,
    )
    header = (
        '/* Generated from index.html by .port-tmp/sounds/extract-css.py — do not edit.\n'
        '   The sound library sheet keeps the legacy class names, scoped under\n'
        '   .sounds-shell. */\n'
    )
    OUT.write_text(header + VARS + Path('.port-tmp/sounds/sounds-scoped.css').read_text())
    print(f'wrote {OUT.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
