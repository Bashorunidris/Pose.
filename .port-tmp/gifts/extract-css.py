"""Builds web/components/pose-app/gifts/gifts.css from index.html.

`#giftPopupOverlay` @27371 and the sheet, tabs, grid and footer inside it are
dense legacy markup the port keeps on the legacy class names — so their rules
are lifted from index.html verbatim and scoped under `.gifts-shell` instead of
being retyped as Tailwind. The keyframes their animations reference come along.
"""
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
INDEX = ROOT / 'index.html'
OUT = ROOT / 'web/components/pose-app/gifts/gifts.css'

PREFIXES = (
    '.gpo-',
    '#giftPopupOverlay',
)

# The legacy's own PIN overlay is not here: `#giftPopupOverlay` hands payment
# confirmation to the wallet's `#pinModalOverlay` through `requirePaymentPin()`
# @64109, so its keypad markup and rules were removed from index.html already.
EXCLUDE_PREFIXES = ('.gpo-pin-',)

# Line ranges in index.html, in page order.
RANGES = [
    (23553, 23760, 'the gift popup'),
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
    if stripped.startswith(EXCLUDE_PREFIXES):
        return False
    return stripped.startswith(PREFIXES)


def clean_prelude(prelude):
    """Selector text without the comments a legacy rule can carry above it."""
    comments = ' '.join(re.findall(r'/\*.*?\*/', prelude, flags=re.S))
    return re.sub(r'/\*.*?\*/', ' ', prelude, flags=re.S).strip(), comments


def filter_css(css):
    res = []
    for prelude, body in split_blocks(css):
        if body is None:
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

    # A keyframe whose rule the filter dropped is dead weight: `gpo-pin-shake`
    # belonged to the popup's own PIN keypad, which index.html no longer has.
    def drop_unused_keyframes(css):
        out, cursor = '', 0
        pattern = re.compile(r'@keyframes\s+([\w-]+)\s*\{')
        while (match := pattern.search(css, cursor)) is not None:
            depth, index = 1, match.end()
            while index < len(css) and depth:
                if css[index] == '{':
                    depth += 1
                elif css[index] == '}':
                    depth -= 1
                index += 1
            block = css[match.start() : index]
            rest = css[: match.start()] + css[index:]
            if re.search(r'[\s,:]' + re.escape(match.group(1)) + r'\b', rest):
                out += css[cursor : match.start()] + block
            else:
                out += css[cursor : match.start()]
            cursor = index
        return out + css[cursor:]

    for _ in range(3):
        filtered = drop_unused_keyframes(filtered)

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

    Path('.port-tmp/gifts/gifts-filtered.css').write_text(filtered)

    subprocess.run(
        ['node', '.port-tmp/scope.mjs', '.port-tmp/gifts/gifts-filtered.css',
         '.port-tmp/gifts/gifts-scoped.css', '.gifts-shell'],
        check=True,
    )
    header = (
        '/* Generated from index.html by .port-tmp/gifts/extract-css.py — do not edit.\n'
        '   The gift sheet keeps the legacy class names, scoped under\n'
        '   .gifts-shell. */\n'
    )
    OUT.write_text(header + Path('.port-tmp/gifts/gifts-scoped.css').read_text())
    print(f'wrote {OUT.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
