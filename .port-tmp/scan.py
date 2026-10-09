import sys
code = open(sys.argv[1]).read()
n = len(code)
i = 0
line = 1
depth = 0
stack = ['code']           # code | template | sq | dq | line-comment | block-comment
stmts = []
pending = False            # inside a top-level statement
start_line = None
start_txt = ''
prev_meaningful = ''
while i < n:
    c = code[i]
    if c == '\n':
        line += 1
    top = stack[-1]
    if top == 'line-comment':
        if c == '\n': stack.pop()
        i += 1; continue
    if top == 'block-comment':
        if c == '*' and code[i+1:i+2] == '/': stack.pop(); i += 2; continue
        i += 1; continue
    if top == 'sq':
        if c == '\\': i += 2; continue
        if c == "'": stack.pop()
        i += 1; continue
    if top == 'dq':
        if c == '\\': i += 2; continue
        if c == '"': stack.pop()
        i += 1; continue
    if top == 'template':
        if c == '\\': i += 2; continue
        if c == '`': stack.pop(); i += 1; continue
        if c == '$' and code[i+1:i+2] == '{': stack.append('code'); i += 2; continue
        i += 1; continue
    # top == 'code'
    if c == '/' and code[i+1:i+2] == '/': stack.append('line-comment'); i += 2; continue
    if c == '/' and code[i+1:i+2] == '*': stack.append('block-comment'); i += 2; continue
    if c == "'": stack.append('sq'); i += 1; continue
    if c == '"': stack.append('dq'); i += 1; continue
    if c == '`': stack.append('template'); i += 1; continue
    if c == '{' and len(stack) == 1:
        if not pending:
            pending = True; start_line = line; start_txt = code[i:i+70].replace('\n',' '); stmts.append((start_line, '{', start_txt))
        depth += 1
        i += 1; continue
    if c == '}' and len(stack) == 1:
        depth -= 1
        i += 1
        if depth <= 0:
            depth = 0; pending = False
        continue
    if c == '}' and len(stack) > 1:
        stack.pop(); i += 1; continue
    if len(stack) == 1 and depth == 0:
        if not pending and not c.isspace() and c not in ';,)}]':
            pending = True; start_line = line; start_txt = code[i:i+80].replace('\n',' ')
        if c == ';':
            stmts.append((start_line, ';', start_txt)); pending = False
    i += 1
for sl, kind, txt in stmts:
    if kind == '{':
        continue
    print(f'{sl:6d}  {kind}  {txt}')
