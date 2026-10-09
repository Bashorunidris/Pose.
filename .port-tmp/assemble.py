"""Builds DashboardMarkup.tsx: every dashboard page except Home (which is a real
React component) plus the overlays, with the page/loader visibility classes driven
by React state instead of the legacy imperative class toggling."""
import json
import re
import subprocess

raw = open('.port-tmp/markup-nohome.html').read().split('\n')

def erase_block(lines, marker):
    """Remove the top-level element opened on the marker line, div-depth aware."""
    start = next(i for i, l in enumerate(lines) if marker in l)
    depth = 0
    for i in range(start, len(lines)):
        depth += len(re.findall(r'<div(?=[\s>])', lines[i]))
        depth -= len(re.findall(r'</div>', lines[i]))
        if i == start and depth == 0:
            return lines[:start] + lines[i + 1:]
        if depth == 0:
            return lines[:start] + lines[i + 1:]
    raise SystemExit(f'could not find end of block for {marker}')

# page.tsx owns the loader, the inbox popup and the toast/modal containers so
# React can drive them; everything else stays in the generated markup.
for marker in ('id="dashLoader"', 'id="inboxPopup"', 'id="settModals"', 'id="settToast"'):
    raw = erase_block(raw, marker)

# The earnings page and its two payout popups are real React now
# (EarningsPage.tsx / PaymentMethodPopup.tsx / WithdrawPopup.tsx), and the
# history popup is next in the same queue, so the generated markup drops all of
# them rather than shipping a second, dead copy of each.
for marker in ('id="page-earnings"', 'id="payMethodPopup"', 'id="withdrawPopup"', 'id="historyPopup"'):
    raw = erase_block(raw, marker)

# All Videos is real React too (AllVideosPage.tsx) — its two panels were always
# rendered from an empty container, so nothing in the legacy body is reused.
for marker in ('id="page-allvideos"',):
    raw = erase_block(raw, marker)
open('.port-tmp/markup-pages.html', 'w').write('\n'.join(raw))

subprocess.run(['python3', '.port-tmp/tojsx.py', '.port-tmp/markup-pages.html', '.port-tmp/pages.jsx'], check=True)

jsx = open('.port-tmp/pages.jsx').read()

# #settModals and #settToast are owned by page.tsx so React can drive them


PAGES = ['studio', 'legibility', 'upload', 'videodetail']
for page in PAGES:
    old = f'<div id="page-{page}" className="page">'
    new = '<div id="page-%s" className={"page" + (active === "%s" ? " active" : "")}>' % (page, page)
    assert old in jsx, page
    jsx = jsx.replace(old, new)

header = """import type { CSSProperties } from 'react';

import { runInline } from './run-inline';

export type DashboardPage = %s;

/**
 * Every `channeldashboard.html` page except Home, plus the inbox/payment/withdraw
 * overlays, carried over one-for-one from the legacy markup.
 *
 * The HTML→JSX rewrite only touched what React requires: `class`→`className`,
 * hyphenated SVG presentation attributes → camelCase, inline `style` strings →
 * style objects, `on*` attributes routed through `runInline`, and the page
 * visibility class driven by the `active` prop. Ids are unchanged, so the page
 * logic (and the CSS) can address exactly the same hooks as the legacy page.
 *
 * Home, Earnings (with its two payout popups), Studio and All Videos are real
 * React components; the remaining pages get their data wired page by page.
 */
export function DashboardMarkup({ active }: { active: DashboardPage }) {
  return (
    <>
""" % " | ".join(json.dumps(p) for p in PAGES)

open('web/components/channel-dashboard/DashboardMarkup.tsx', 'w').write(
    header + jsx + '    </>\n  );\n}\n'
)
print('DashboardMarkup.tsx written; pages wired:', ', '.join(PAGES))
