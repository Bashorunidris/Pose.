import fs from 'node:fs';
const ROOT = '.channel-dash';
const RAW_AT = new Set(['keyframes', 'font-face', 'page', 'property', 'counter-style', 'font-feature-values']);
const src = fs.readFileSync(process.argv[2], 'utf8');
const css = src.replace(/^\s*<style[^>]*>\s*/m, '').replace(/\s*<\/style>\s*$/m, '');
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, ' ');
function blockEnd(text, start) {
  let depth = 0;
  let i = start;
  while (i < text.length) {
    const c = text[i];
    if (c === '/' && text[i + 1] === '*') {
      const e = text.indexOf('*/', i + 2);
      i = e === -1 ? text.length : e + 2;
      continue;
    }
    if (c === '"' || c === "'") {
      const e = text.indexOf(c, i + 1);
      i = e === -1 ? text.length : e + 1;
      continue;
    }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return i + 1; }
    i++;
  }
  return text.length;
}
function prefixSelectors(list) {
  return list.split(',').map((raw) => {
    const sel = raw.trim().replace(/\s+/g, ' ');
    if (!sel) return '';
    if (sel === ':root' || /^(html|body)$/.test(sel)) return ROOT;
    return `${ROOT} ${sel}`;
  }).filter(Boolean).join(', ');
}
function scopeBlock(inner) {
  let out = '';
  let prelude = '';
  let i = 0;
  while (i < inner.length) {
    const c = inner[i];
    if (c === '/' && inner[i + 1] === '*') {
      const e = inner.indexOf('*/', i + 2);
      const stop = e === -1 ? inner.length : e + 2;
      if (!prelude.trim()) out += inner.slice(i, stop) + '\n';
      i = stop;
      continue;
    }
    if (c === '"' || c === "'") {
      const e = inner.indexOf(c, i + 1);
      const stop = e === -1 ? inner.length : e + 1;
      prelude += inner.slice(i, stop);
      i = stop;
      continue;
    }
    if (c === '{') {
      const clean = stripComments(prelude).trim();
      const end = blockEnd(inner, i);
      const body = inner.slice(i + 1, end - 1);
      if (clean.startsWith('@')) {
        const name = clean.slice(1).split(/[\s({]/)[0].toLowerCase();
        out += RAW_AT.has(name) ? `${clean} {${body}}\n` : `${clean} {\n${scopeBlock(body)}}\n`;
      } else {
        out += `${prefixSelectors(clean)} {\n${body.trim()}\n}\n`;
      }
      i = end;
      prelude = '';
      continue;
    }
    if (c === ';') {
      const clean = stripComments(prelude).trim();
      if (clean) out += `${clean};\n`;
      prelude = '';
      i++;
      continue;
    }
    prelude += c;
    i++;
  }
  return out;
}
let out = '';
let prelude = '';
let i = 0;
while (i < css.length) {
  const c = css[i];
  if (c === '/' && css[i + 1] === '*') {
    const e = css.indexOf('*/', i + 2);
    const stop = e === -1 ? css.length : e + 2;
    if (!prelude.trim()) out += css.slice(i, stop) + '\n';
    i = stop;
    continue;
  }
  if (c === '"' || c === "'") {
    const e = css.indexOf(c, i + 1);
    const stop = e === -1 ? css.length : e + 1;
    prelude += css.slice(i, stop);
    i = stop;
    continue;
  }
  if (c === '{') {
    const clean = stripComments(prelude).trim();
    const end = blockEnd(css, i);
    const body = css.slice(i + 1, end - 1);
    if (clean.startsWith('@')) {
      const name = clean.slice(1).split(/[\s({]/)[0].toLowerCase();
      out += RAW_AT.has(name) ? `${clean} {${body}}\n` : `${clean} {\n${scopeBlock(body)}}\n`;
    } else {
      out += `${prefixSelectors(clean)} {\n${body.trim()}\n}\n`;
    }
    i = end;
    prelude = '';
    continue;
  }
  if (c === ';') {
    const clean = stripComments(prelude).trim();
    if (clean) out += `${clean};\n`;
    prelude = '';
    i++;
    continue;
  }
  prelude += c;
  i++;
}
out = out.replace(/\n{3,}/g, '\n\n');
fs.writeFileSync(process.argv[3], out);
console.log('prefixed:', (out.match(/\.channel-dash /g) || []).length, 'keyframes:', (out.match(/@keyframes/g) || []).length);
