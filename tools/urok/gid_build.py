# -*- coding: utf-8 -*-
"""Сопровождение урока для преподавателя: печатный документ A4, белый фон, чёрно-белая печать.
Запуск: python3 tools/urok/gid_build.py <сценарий> gid_<тема> <папка вывода>
Сценарий: модуль с LC.T (экраны). gid_<тема>: модуль с TITLE, SUB, S, ERR, SKIP, OUT.
Этап S: dict(t='заголовок', m='минуты', rng=(первый, последний экран), rows=[(метка, текст), ...]).
Метка «Ответы» с пустым текстом заполняется автоматически из сценария. В тексте \\n начинает новый абзац.
Таблица ответов на все вопросы урока строится из сценария сама."""
import sys, os, re, html, importlib

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)


def plain(s):
    s = re.sub(r'<span class="fr"><span>(.*?)</span><span>(.*?)</span></span>', r'\1/\2', s)
    s = re.sub(r'<br\s*/?>', ' ', s)
    s = re.sub(r'</p>\s*<p>', ' ', s)
    s = re.sub(r'<[^>]+>', '', s)
    return html.unescape(s).strip()


def fmt_num(v):
    return ('%g' % v).replace('.', ',').replace('-', '−')


def answer_of(d):
    if d['type'] == 'choice':
        return plain(d['opts'][d['a'] - 1])
    return ' или '.join(fmt_num(x) for x in d['a'])


def paras(text, LC):
    out = []
    for chunk in str(text).split('\n'):
        chunk = chunk.strip()
        if chunk:
            out.append('<p>' + LC.nb(html.escape(chunk, quote=False)) + '</p>')
    return ''.join(out)


CSS = """
@page{size:A4;margin:14mm 14mm 16mm}
*{box-sizing:border-box}
body{font:11pt/1.45 'DejaVu Serif',Georgia,'Times New Roman',serif;color:#000;background:#fff;margin:0}
h1{font-size:19pt;margin:0 0 2mm}
.sub{font-size:10.5pt;margin:0 0 6mm}
h2{font-size:13pt;margin:7mm 0 2mm;padding-bottom:1mm;border-bottom:1.2pt solid #000;break-after:avoid}
h2 small{font-weight:400;font-size:10pt;margin-left:3mm}
.st{break-inside:auto}
.row{display:grid;grid-template-columns:27mm 1fr;gap:3mm;margin:0 0 2.4mm;break-inside:avoid}
.row>b{font-size:9.5pt;text-transform:uppercase;letter-spacing:.04em;padding-top:.6mm}
.row p{margin:0 0 1.4mm;text-indent:1.4em}
.row p:first-child{text-indent:1.4em}
.nb{white-space:nowrap}
.fr{display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;font-size:.9em;line-height:1.1;margin:0 1px}
.fr>span:first-child{border-bottom:1px solid #000;padding:0 2px}
table{border-collapse:collapse;width:100%;font-size:9.6pt;margin:2mm 0 4mm}
th,td{border:.8pt solid #000;padding:1.4mm 2mm;vertical-align:top;text-align:left}
th{background:#fff;font-weight:700}
tr{break-inside:avoid}
ul{margin:1mm 0 3mm 5mm;padding:0}
li{margin:0 0 1.2mm}
.note{font-size:9.5pt;margin:0 0 3mm}
"""


def build(scen_name, gid_name, outdir):
    sc = importlib.import_module(scen_name)
    LC = sc.LC
    LC.finalize()
    G = importlib.import_module(gid_name)
    T = LC.T
    qs = {d['n']: d for d in T if d['kind'] == 'q'}

    def auto_answers(lo, hi):
        items = [f'экран {n}: {answer_of(qs[n])}' for n in sorted(qs) if lo <= n <= hi]
        return '; '.join(items)

    parts = [f'<h1>{html.escape(G.TITLE)}</h1><p class="sub">{html.escape(G.SUB)}</p>']
    for st in G.S:
        lo, hi = st['rng']
        parts.append(f'<div class="st"><h2>{html.escape(st["t"])}<small>минуты {html.escape(st["m"])} · экраны {lo}–{hi}</small></h2>')
        for label, text in st['rows']:
            if label == 'Ответы' and not text:
                text = auto_answers(lo, hi)
            parts.append(f'<div class="row"><b>{html.escape(label)}</b><div>{paras(text, LC)}</div></div>')
        parts.append('</div>')

    parts.append('<h2>Частые ошибки</h2>')
    if getattr(G, 'ERR_NOTE', ''):
        parts.append(f'<p class="note">{LC.nb(html.escape(G.ERR_NOTE, quote=False))}</p>')
    parts.append('<table><tr><th>Ошибка</th><th>Откуда берётся</th><th>Что сделать</th></tr>')
    for a, b, c in G.ERR:
        parts.append('<tr>' + ''.join(f'<td>{LC.nb(html.escape(x, quote=False))}</td>' for x in (a, b, c)) + '</tr>')
    parts.append('</table>')

    parts.append('<h2>Если не успеваешь</h2><ul>' + ''.join(f'<li>{LC.nb(html.escape(x, quote=False))}</li>' for x in G.SKIP) + '</ul>')

    parts.append('<h2>Ответы на все вопросы урока</h2><table><colgroup><col style="width:9%"><col style="width:41%"><col style="width:15%"><col style="width:35%"></colgroup><tr><th>Экран</th><th>Вопрос</th><th>Ответ</th><th>Разбор</th></tr>')
    for n in sorted(qs):
        d = qs[n]
        fin = ' (итоговый)' if d.get('fin') else ''
        parts.append(f'<tr><td>{n}{fin}</td><td>{LC.nb(html.escape(plain(d["q"]), quote=False))}</td>'
                     f'<td><b>{LC.nb(html.escape(answer_of(d), quote=False))}</b></td>'
                     f'<td>{LC.nb(html.escape(plain(d["why"]), quote=False))}</td></tr>')
    parts.append('</table>')

    doc = f'<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>{html.escape(G.TITLE)}</title><style>{CSS}</style></head><body>{"".join(parts)}</body></html>'
    os.makedirs(outdir, exist_ok=True)
    hp = os.path.join(outdir, G.OUT + '.html')
    pp = os.path.join(outdir, G.OUT + '.pdf')
    open(hp, 'w', encoding='utf8').write(doc)
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        br = p.chromium.launch()
        pg = br.new_page()
        pg.goto('file://' + os.path.abspath(hp))
        pg.pdf(path=pp, format='A4', print_background=False, margin={'top': '14mm', 'bottom': '16mm', 'left': '14mm', 'right': '14mm'},
               display_header_footer=True, header_template='<span></span>',
               footer_template='<div style="font:8px sans-serif;width:100%;text-align:center"><span class="pageNumber"></span> / <span class="totalPages"></span></div>')
        br.close()
    print('written', hp, pp, 'questions', len(qs))


if __name__ == '__main__':
    if len(sys.argv) != 4:
        print(__doc__); sys.exit(1)
    build(sys.argv[1], sys.argv[2], sys.argv[3])
