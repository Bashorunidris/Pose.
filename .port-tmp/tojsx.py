import json, re, sys

VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
RENAME = {
    'class':'className','for':'htmlFor','maxlength':'maxLength','readonly':'readOnly',
    'tabindex':'tabIndex','colspan':'colSpan','rowspan':'rowSpan','contenteditable':'contentEditable',
    'spellcheck':'spellCheck','autocomplete':'autoComplete','autofocus':'autoFocus','crossorigin':'crossOrigin',
    'allowfullscreen':'allowFullScreen','srcset':'srcSet','enctype':'encType','novalidate':'noValidate',
    'datetime':'dateTime','accesskey':'accessKey','usemap':'useMap','cellpadding':'cellPadding',
    'cellspacing':'cellSpacing','charset':'charSet','formenctype':'formEncType','formmethod':'formMethod',
    'formnovalidate':'formNoValidate','formtarget':'formTarget',
}
EVENTS = {
    'onclick':'onClick','onchange':'onChange','oninput':'onInput','ondragover':'onDragOver',
    'ondragleave':'onDragLeave','ondrop':'onDrop','onfocus':'onFocus','onblur':'onBlur',
    'onsubmit':'onSubmit','onkeyup':'onKeyUp','onkeydown':'onKeyDown','onload':'onLoad','onerror':'onError',
}
SVG_HYPHEN = {
    'stroke-width','stroke-linecap','stroke-linejoin','stroke-dasharray','stroke-dashoffset',
    'stroke-opacity','stroke-miterlimit','fill-opacity','fill-rule','clip-path','clip-rule',
    'stop-color','stop-opacity','text-anchor','dominant-baseline','marker-end','marker-start',
    'marker-mid','font-family','font-size','font-weight','font-style','letter-spacing','word-spacing',
    'pointer-events','shape-rendering','color-interpolation-filters','flood-color','flood-opacity',
}
def camel(name):
    parts = name.split('-')
    return parts[0] + ''.join(p[:1].upper() + p[1:] for p in parts[1:])
NUMERIC = {
    'maxlength','rows','cols','size','span','tabindex','width','height','colspan','rowspan',
    'start','high','low','optimum','minlength','border','cellpadding','cellspacing',
}

def style_object(value):
    decls = []
    custom = False
    for part in value.split(';'):
        part = part.strip()
        if not part or ':' not in part:
            continue
        prop, val = part.split(':', 1)
        prop, val = prop.strip(), val.strip()
        if not prop or not val:
            continue
        if prop.startswith('--'):
            key = json.dumps(prop)
        else:
            key = camel(prop)
            if not re.fullmatch(r'[A-Za-z_$][\w$]*', key):
                key = json.dumps(key)
        if prop.startswith('--'):
            custom = True
        decls.append((key, json.dumps(val)))
    seen = {}
    order = []
    for key, val in decls:
        if key not in seen:
            order.append(key)
        seen[key] = val
    body = ', '.join(f'{k}: {seen[k]}' for k in order)
    if custom:
        return '{ ' + body + ' } as CSSProperties'
    return '{ ' + body + ' }'
def parse_attrs(region):
    i, n = 0, len(region)
    while i < n:
        while i < n and region[i].isspace():
            i += 1
        if i >= n or region[i] == '/':
            break
        j = i
        while j < n and not region[j].isspace() and region[j] not in '=/':
            j += 1
        name = region[i:j]
        i = j
        while i < n and region[i].isspace():
            i += 1
        value = None
        if i < n and region[i] == '=':
            i += 1
            while i < n and region[i].isspace():
                i += 1
            if i < n and region[i] in '"\'':
                q = region[i]
                end = region.find(q, i + 1)
                if end == -1:
                    end = n
                value = region[i + 1:end]
                i = end + 1
            else:
                j = i
                while j < n and not region[j].isspace():
                    j += 1
                value = region[i:j]
                i = j
        if name:
            yield name, value
def transform_tag(tag):
    if tag.startswith('</'):
        return tag
    m = re.match(r'<([A-Za-z][-\w:]*)', tag)
    if not m:
        return tag
    name = m.group(1)
    inner = tag[m.end():]
    self_closed = bool(re.search(r'/\s*>$', inner))
    inner = re.sub(r'/\s*>$', '', inner)
    inner = re.sub(r'>$', '', inner)
    props = []
    for attr, value in parse_attrs(inner):
        low = attr.lower()
        if low in EVENTS:
            if value is None or not value.strip():
                continue
            props.append(f'{EVENTS[low]}={{(event) => runInline(event, {json.dumps(value)})}}')
            continue
        if low == 'class':
            props.append(f'className={json.dumps(value or "")}')
            continue
        if low == 'style':
            if not value or not value.strip():
                continue
            props.append('style={' + style_object(value) + '}')
            continue
        if low in RENAME:
            target = RENAME[low]
            if value is not None and target.lower() in NUMERIC and re.fullmatch(r'-?\d+', value.strip()):
                props.append(f'{target}={{{int(value)}}}')
            else:
                props.append(f'{target}={json.dumps(value or "")}' if value is not None else target)
            continue
        if low in SVG_HYPHEN:
            props.append(f'{camel(low)}={json.dumps(value or "")}')
            continue
        if value is None:
            props.append(attr)
        else:
            props.append(f'{attr}={json.dumps(value)}')
    joined = (' ' + ' '.join(props)) if props else ''
    if self_closed or name.lower() in VOID:
        return f'<{name}{joined} />'
    return f'<{name}{joined}>'
def transform(html):
    out = []
    i, n = 0, len(html)
    while i < n:
        if html.startswith('<!--', i):
            end = html.find('-->', i)
            body = html[i + 4:end]
            i = end + 3
            if '*/' in body:
                continue
            body = body.strip()
            if not body:
                continue
            out.append('{/* ' + body.replace('{', '(').replace('}', ')') + ' */}\n')
            continue
        if html[i] == '<':
            j = i + 1
            quote = None
            while j < n:
                c = html[j]
                if quote:
                    if c == quote:
                        quote = None
                elif c in '"\'':
                    quote = c
                elif c == '>':
                    break
                j += 1
            out.append(transform_tag(html[i:j + 1]))
            i = j + 1
            continue
        out.append('&apos;' if html[i] == "'" else '&quot;' if html[i] == '"' else html[i])
        i += 1
    return ''.join(out)

def drop_stray_div_closes(html):
    """The legacy markup has one unmatched `</div>` that browsers ignore (the
    page is only valid because HTML parsing is lenient). JSX is not, so the
    redundant close is removed here — the tree is whatever the browser built."""
    n = len(html)
    i = 0
    depth = 0
    drops = []
    while i < n:
        if html.startswith('<!--', i):
            end = html.find('-->', i)
            i = end + 3
            continue
        if html[i] == '<':
            j = i + 1
            quote = None
            while j < n:
                ch = html[j]
                if quote:
                    if ch == quote: quote = None
                elif ch in '"\'':
                    quote = ch
                elif ch == '>':
                    break
                j += 1
            tag = html[i:j + 1]
            m = re.match(r'</?\s*([A-Za-z][-\w]*)', tag)
            name = m.group(1).lower() if m else ''
            if name == 'div':
                if tag.startswith('</'):
                    if depth == 0:
                        drops.append((i, j + 1))
                    else:
                        depth -= 1
                elif not re.search(r'/\s*>$', tag):
                    depth += 1
            i = j + 1
            continue
        i += 1
    for start, end in reversed(drops):
        print(f'  dropped stray </div> at byte {start}')
        html = html[:start] + html[end:]
    return html

html = open(sys.argv[1]).read()
print('pre-pass:')
html = drop_stray_div_closes(html)
jsx = transform(html)
open(sys.argv[2], 'w').write(jsx)
print('jsx bytes:', len(jsx))
