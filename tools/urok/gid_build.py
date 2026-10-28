# -*- coding: utf-8 -*-
import re, sys, html
import os, importlib
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
# запуск: python3 tools/urok/gid_build.py <модуль сценария урока> <модуль содержания сопровождения> [папка вывода]
L = importlib.import_module(sys.argv[1])
G = importlib.import_module(sys.argv[2])
S, ERR = G.S, G.ERR
OUTDIR = sys.argv[3] if len(sys.argv) > 3 else '.'

def plain(s):
    wrap = lambda t: t if re.fullmatch(r'[\w²]+', t) else '(' + t + ')'
    s = re.sub(r'<span class="fr"><span>(.*?)</span><span>(.*?)</span></span>', lambda m: wrap(m.group(1)) + '/' + wrap(m.group(2)), str(s))
    s = re.sub(r'<[^>]+>', '', s)
    return html.unescape(s).strip()

def key_rows():
    rows = []
    for d in L.T:
        if d['kind'] != 'q': continue
        if d['type'] == 'choice':
            a = plain(d['opts'][d['a'] - 1])
        else:
            a = ', '.join(('%g' % v).replace('.', ',').replace('-', '−') for v in d['a'])
        rows.append((d['n'], a, d.get('fin', False)))
    return rows

import lesson_content as _LC
def esc(s): return _LC.nb(html.escape(s, quote=False)).replace('\n', '<br>')  # формулы не рвутся; каждая мысль с новой строки

css = '''
@page{size:A4;margin:14mm 15mm}
*{box-sizing:border-box}
body{font-family:"DejaVu Sans","Liberation Sans",Arial,sans-serif;font-size:10.3pt;line-height:1.38;color:#000;background:#fff;margin:0}
h1{font-size:17pt;margin:0 0 2mm}
h2{font-size:12.5pt;margin:5mm 0 2mm;border-bottom:1.2px solid #000;padding-bottom:1mm}
.sub{font-size:10pt;margin:0 0 3mm}
.st{border:1px solid #000;margin:0 0 3.5mm;break-inside:avoid;page-break-inside:avoid}
.st h3{font-size:10.8pt;margin:0;padding:1.4mm 2.4mm;background:#e6e6e6;border-bottom:1px solid #000;display:flex;justify-content:space-between;gap:4mm}
.st h3 span{font-weight:normal;white-space:nowrap}
.st .r{padding:1.2mm 2.4mm;border-bottom:.5px dotted #888}
.st .r:last-child{border-bottom:0}
.st b{font-weight:700}
table{border-collapse:collapse;width:100%;margin:0 0 3mm}
td,th{border:1px solid #000;padding:1mm 2mm;text-align:left;vertical-align:top;font-size:9.6pt}
th{background:#e6e6e6}
.k td{text-align:center}
.fin{font-weight:700}
.note{font-size:9.4pt}
.m{white-space:nowrap}
'''

h = ['<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>' + esc(G.TITLE) + '</title><style>' + css + '</style></head><body>']
h.append('<h1>' + esc(G.TITLE) + '</h1>')
h.append('<p class="sub">' + esc(G.SUB) + '</p>')
h.append('<h2>Как вести урок</h2>')
h.append('<p class="note">Ученица работает на экране и пишет в тетрадь. Ты говоришь то, что в блоке «Сказать», и ведёшь по шагам. Кнопки «Показать» нажимай после ответа ученицы, не раньше. Если ответ неверный, сначала проси показать запись, ответ не называй. Минуты в таблице приблизительные. Числа экранов даны для ориентира в интерактиве.</p>')
h.append('<table><tr><th>Минуты</th><th>Этап</th><th>Экраны</th></tr>' + ''.join(f'<tr><td>{esc(m)}</td><td>{esc(t)}</td><td>{esc(sc.replace("экраны ","").replace("экран ",""))}</td></tr>' for t, m, sc, _ in S) + '</table>')
h.append('<h2>Ход урока по этапам</h2>')
for t, m, sc, items in S:
    h.append(f'<div class="st"><h3>{esc(t)}<span>мин. {esc(m)} · {esc(sc)}</span></h3>' + ''.join(f'<div class="r"><b>{esc(a)}:</b> {esc(b)}</div>' for a, b in items) + '</div>')
h.append('<h2>Частые ошибки и что делать</h2><table><tr><th>Ошибка</th><th>Что сказать или сделать</th></tr>' + ''.join(f'<tr><td>{esc(a)}</td><td>{esc(b)}</td></tr>' for a, b in ERR) + '</table>')
h.append('<h2>Если не успеваешь</h2><p class="note">' + esc(G.SKIP) + '</p>')
rows = key_rows()
h.append('<h2>Ответы на все вопросы</h2><table class="k"><tr><th>№ экрана</th><th>Ответ</th><th>№ экрана</th><th>Ответ</th><th>№ экрана</th><th>Ответ</th></tr>')
cols = 3
per = -(-len(rows) // cols)
for i in range(per):
    h.append('<tr>')
    for c in range(cols):
        j = c * per + i
        if j < len(rows):
            n, a, f = rows[j]
            cls = ' class="fin"' if f else ''
            h.append(f'<td{cls}>{n}</td><td{cls}>{esc(a)}</td>')
        else:
            h.append('<td></td><td></td>')
    h.append('</tr>')
h.append('</table><p class="note">Жирным выделены 5 итоговых задач. В вопросах с вариантами указан текст верного варианта.</p>')
h.append('</body></html>')
html_path = os.path.join(OUTDIR, G.OUT + '.html')
open(html_path, 'w', encoding='utf8').write('\n'.join(h))
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(); pg.goto('file://' + os.path.abspath(html_path))
    pg.pdf(path=os.path.join(OUTDIR, G.OUT + '.pdf'), format='A4', print_background=True, margin={'top': '14mm', 'bottom': '14mm', 'left': '15mm', 'right': '15mm'})
    b.close()
print('ok', len(S), 'этапов', len(rows), 'ответов ->', os.path.join(OUTDIR, G.OUT + '.pdf'))
