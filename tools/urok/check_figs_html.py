# -*- coding: utf-8 -*-
"""Проверка всех чертежей в собранном уроке: подписи не на линиях, не друг на друге, не за рамкой."""
import sys, re, json
import figcheck
html = sys.argv[1]
s = open(html, encoding='utf8').read()
css = ''.join(re.findall(r'<style[^>]*>(.*?)</style>', s, re.S))
i = s.index('const T=') + 8
dec = json.JSONDecoder(); T, _ = dec.raw_decode(s[i:])
figs = []; where = []
def walk(o, n):
    if isinstance(o, str):
        for m in re.findall(r'<div class="fig">.*?</svg></div>', o, re.S): figs.append(m); where.append(n)
    elif isinstance(o, dict):
        for v in o.values(): walk(v, n)
    elif isinstance(o, list):
        for v in o: walk(v, n)
for d in T: walk(d, d.get('n'))
probs = figcheck.check_html_figs(css, figs)
print(html.split('/')[-1], 'чертежей:', len(figs), 'проблем:', len(probs))
for i, x in probs: print('  экран', where[i], x)
