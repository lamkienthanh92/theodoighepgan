"""Gộp index.html + CSS + JS + logo thành một file HTML duy nhất (dist/theo-doi-dinh-duong.html).
Chạy: python3 scripts/build_single.py
"""
import base64, pathlib, re
root = pathlib.Path(__file__).resolve().parent.parent
html = (root / 'index.html').read_text(encoding='utf-8')
css = (root / 'assets/css/style.css').read_text(encoding='utf-8')
html = html.replace('<link rel="stylesheet" href="assets/css/style.css">', '<style>\n' + css + '\n</style>')
def uri(p): return 'data:image/png;base64,' + base64.b64encode((root / p).read_bytes()).decode()
for name in ['who-lms.js', 'zscore.js', 'app.js']:
    js = (root / 'assets/js' / name).read_text(encoding='utf-8')
    if name == 'app.js':
        js = js.replace('"assets/img/logo-dhyd.png"', '"' + uri('assets/img/logo-dhyd.png') + '"').replace('"assets/img/logo-nd2.png"', '"' + uri('assets/img/logo-nd2.png') + '"')
    html = html.replace(f'<script src="assets/js/{name}"></script>', '<script>\n' + js + '\n</script>')
html = html.replace('<link rel="icon" href="assets/img/logo-nd2.png">', '')
out = root / 'dist' / 'theo-doi-dinh-duong.html'
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding='utf-8')
print('Đã tạo', out, f'({out.stat().st_size // 1024} KB)')
