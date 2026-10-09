#!/bin/sh
# Regenerates the channel dashboard's scoped stylesheet and JSX markup from the
# legacy page. See README.md.
set -eu
cd "$(dirname "$0")/.."

dir=.port-tmp

# 1. stylesheet: legacy <style> block (legacy/channeldashboard.html lines 16–2850), scoped
sed -n '17,2849p' legacy/channeldashboard.html > "$dir/dash-src.css"
node "$dir/scope.mjs" "$dir/dash-src.css" "$dir/dash-scoped.css"
cat "$dir/dashboard-css.header" "$dir/dash-scoped.css" > web/app/channel-dashboard/dashboard.css

# 2. markup: legacy body (lines 2852–5395), minus the Home page which is real React
sed -n '2852,5395p' legacy/channeldashboard.html > "$dir/markup.html"
python3 - "$dir" <<'PY'
import sys
d = sys.argv[1]
lines = open(f'{d}/markup.html').read().split('\n')
start = next(i for i, l in enumerate(lines) if 'id="page-home"' in l and l.strip().startswith('<div'))
end = next(i for i, l in enumerate(lines) if '/page-home' in l)
open(f'{d}/markup-nohome.html', 'w').write('\n'.join(lines[:start] + lines[end + 1:]))
PY
python3 "$dir/assemble.py"
