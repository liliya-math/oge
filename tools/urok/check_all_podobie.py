# -*- coding: utf-8 -*-
import os
ROOT=os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),"..",".."))
import sys, re, json
sys.path.insert(0, '.')
import podobie as L2, figcheck
L2.LC.finalize()
from playwright.sync_api import sync_playwright
HTML = ROOT+'/obyasnenie-9-podobnye-treugolniki.html'
s = open(HTML, encoding='utf8').read()
css = ''.join(re.findall(r'<style[^>]*>(.*?)</style>', s, re.S))
T = L2.LC.T
figs = []
for d in T:
    for part in (d.get('body', ''), (d.get('rev') or {}).get('html', ''), d.get('q', '') if isinstance(d.get('q', ''), str) else ''):
        figs += re.findall(r'<div class="fig">.*?</svg></div>', part, re.S)
probs = figcheck.check_html_figs(css, figs)
print('статических рисунков:', len(figs), 'проблем:', len(probs))
for i, x in probs: print(' ', i, x)

JSF = figcheck.JS.strip()
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(viewport={'width': 420, 'height': 900})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file://' + HTML)
    pg.wait_for_timeout(300)
    bad = []
    def run(key, sweeps):
        pg.evaluate("(k)=>{document.querySelectorAll('.tstw').forEach(e=>e.remove());const d=document.createElement('div');d.className='wbox tstw';d.style.cssText='position:fixed;left:0;top:0;width:420px;z-index:9';document.body.appendChild(d);window.MW[k](d)}", key)
        n = 0
        for sw in sweeps:
            for sid, val in sw.items():
                pg.evaluate("([id,v])=>{const e=document.querySelector('.tstw #'+id);e.value=v;e.dispatchEvent(new Event('input'))}", [sid, val])
            r = pg.evaluate("(pad)=>{const s=document.querySelector('.tstw svg');return (" + JSF + ")(s,pad)}", 2.5)
            n += 1
            for x in r: bad.append((key, sw, x))
        return n
    tot = 0
    tot += run('propdemo', [{'m': m} for m in range(1, 10)])
    tot += run('simk', [{'k': k / 2} for k in range(1, 7)])
    br.close()
print('виджеты: проверено положений', tot, 'проблем:', len(bad))
for x in bad[:40]: print(' ', x)
print('ошибки страницы:', errs)
