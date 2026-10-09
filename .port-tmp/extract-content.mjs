// Extracts the policy documents and the Help Centre copy straight out of the
// legacy index.html so the Next.js port carries the same text byte for byte.
import { readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8');

function sliceBalanced(source, startIndex, open, close) {
  let depth = 0;
  for (let i = startIndex; i < source.length; i += 1) {
    if (source[i] === open) depth += 1;
    else if (source[i] === close) {
      depth -= 1;
      if (depth === 0) return source.slice(startIndex, i + 1);
    }
  }
  throw new Error('unbalanced');
}

function templateAfterBodyInnerHtml(fnName) {
  const fnIndex = html.indexOf(`function ${fnName}(`);
  if (fnIndex < 0) throw new Error(`missing ${fnName}`);
  const assignIndex = html.indexOf('body.innerHTML = `', fnIndex);
  const tick = html.indexOf('`', assignIndex);
  const end = html.indexOf('`;', tick);
  return html.slice(tick + 1, end);
}

// ---- getPolicyDate + the policies table ------------------------------------
const getPolicyDate = () => {
  const anchor = new Date(2026, 5, 4);
  const now = new Date();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const periods = Math.floor((now.getTime() - anchor.getTime()) / weekMs);
  const current = new Date(anchor.getTime() + Math.max(0, periods) * weekMs);
  return current.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

const policiesLiteralStart = html.indexOf('const policies = {', html.indexOf('function showPolicy('));
const policiesLiteral = sliceBalanced(html, policiesLiteralStart + 'const policies = '.length, '{', '}');
// The four documents interpolate the "last updated" date; the placeholder keeps
// it live at render time instead of freezing whatever day the port ran on.
const policies = new Function('getPolicyDate', `return ${policiesLiteral.replace(/\$\{getPolicyDate\(\)\}/g, '__POLICY_DATE__')};`)(getPolicyDate);

const keys = Object.keys(policies);
const esc = (s) => s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');

const policiesTs = `/**
 * The four policy documents, lifted verbatim from \`showPolicy()\` @44353 and
 * \`getPolicyDate()\` @44343 in the legacy \`index.html\`.
 *
 * The legacy modal injected these through \`innerHTML\`; they are stored as HTML
 * strings for the same reason — they are long hand-written documents with
 * headings, emphasis and bullet lists, and they are the app's own static copy,
 * never user input.
 */

export type PolicyKey = ${keys.map((k) => `'${k}'`).join(' | ')};

export const POLICY_ITEMS: { key: PolicyKey; label: string; icon: string }[] = [
  { key: 'privacy', label: 'Privacy Policy', icon: 'fa-shield-alt' },
  { key: 'terms', label: 'Terms & Conditions', icon: 'fa-file-contract' },
  { key: 'data', label: 'Data & Permissions', icon: 'fa-database' },
  { key: 'community', label: 'Community Guidelines', icon: 'fa-users' },
];

/**
 * \`getPolicyDate()\` — the "last updated" stamp advances one week at a time from
 * 4 June 2026, so a policy always looks freshly reviewed.
 */
export const POLICY_DATE_TOKEN = '__POLICY_DATE__';

export function getPolicyDate(): string {
  const anchor = new Date(2026, 5, 4);
  const now = new Date();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const periods = Math.floor((now.getTime() - anchor.getTime()) / weekMs);
  const current = new Date(anchor.getTime() + Math.max(0, periods) * weekMs);
  return current.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export const POLICIES: Record<PolicyKey, { title: string; content: string }> = {
${keys
  .map((k) => `  ${k}: {\n    title: ${JSON.stringify(policies[k].title)},\n    content: \`${esc(policies[k].content)}\`,\n  },`)
  .join('\n')}
};
`;
writeFileSync('web/lib/pose-app/policies.ts', policiesTs);

// ---- Help Centre ------------------------------------------------------------
const helpHtml = templateAfterBodyInnerHtml('showHelpCenter');
const categoryBlocks = [...helpHtml.matchAll(/<div class="help-category">([\s\S]*?)<\/div>\s*<\/div>\s*(?=<div class="help-category">|$)/g)];
const categories = [];
for (const block of categoryBlocks) {
  const title = /<h4>([\s\S]*?)<\/h4>/.exec(block[1])?.[1] ?? '';
  const items = [...block[1].matchAll(
    /<div class="help-item-title">\s*<span>([\s\S]*?)<\/span>[\s\S]*?<div class="help-item-content">([\s\S]*?)<\/div>/g,
  )];
  if (!items.length) continue;
  categories.push({
    title: title.trim(),
    items: items.map(([, q, a]) => ({ question: q.trim(), answer: a.trim() })),
  });
}
if (!categories.length) throw new Error('help categories not parsed');

const helpTs = `/**
 * The Help Centre's question list, lifted from \`showHelpCenter()\` @44726 in the
 * legacy \`index.html\`. Each answer keeps the legacy markup so the accordion
 * renders the same paragraphs and links as the injected HTML did.
 */

export type HelpItem = { question: string; answer: string };
export type HelpCategory = { title: string; items: HelpItem[] };

export const HELP_CATEGORIES: HelpCategory[] = ${JSON.stringify(categories, null, 2)};
`;
writeFileSync('web/lib/pose-app/help-content.ts', helpTs);

console.log('policies:', keys.join(','));
console.log('help categories:', categories.map((c) => `${c.title}(${c.items.length})`).join(' | '));
