# Legacy-port helpers

The channel dashboard is 13k lines of legacy HTML (`legacy/channeldashboard.html`), so rather than retype its
styles and markup by hand, two small converters carry them across one-for-one.
They are build-time tools only — nothing here ships to the browser.

| file | what it does |
| --- | --- |
| `scope.mjs` | prefixes every selector in the legacy `<style>` block with `.channel-dash` |
| `tojsx.py` | HTML → JSX (`class`→`className`, inline `style` strings → objects, svg attrs → camelCase, `on*` → `runInline`, and it drops the one stray `</div>` browsers ignore) |
| `assemble.py` | splits off the parts React owns (loader, inbox popup, modal/toast containers, plus the earnings page, its three popups and All Videos) and stitches the page components |

Run everything with `sh .port-tmp/run.sh` from the repo root. Regenerate only
after editing the archived page, and keep the generated files in review.

The intermediates `run.sh` writes (`dash-src.css`, `dash-scoped.css`,
`markup*.html`, `pages.jsx`) are gitignored — only the scripts, the CSS header
and this file are tracked. Nothing here needs the legacy inline `<script>`, which
is why no copy of it is kept: it embedded the R2 access key and secret, and the
ported pages sign uploads through `/api/r2-presign` instead.
