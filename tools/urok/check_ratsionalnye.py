# -*- coding: utf-8 -*-
import os
ROOT=os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),"..",".."))
import sys, re, json
sys.path.insert(0, '.')
import ratsionalnye_drobi as L2, figcheck
from playwright.sync_api import sync_playwright
HTML = ROOT+'/obyasnenie-8-ratsionalnye-drobi.html'
s = open(HTML, encoding='utf8').read()
css = ''.join(re.findall(r'<style[^>]*>(.*?)</style>', s, re.S))
T = L2.LC.T
figs = []
for d in T:
    for part in (d.get('body', ''), (d.get('rev') or {}).get('html', '')):
        figs += re.findall(r'<div class="fig">.*?</svg></div>', part, re.S)
probs = figcheck.check_html_figs(css, figs)
print('статических рисунков:', len(figs), 'проблем:', len(probs))
for i, x in probs: print(' ', i, x)

print('виджетов в уроке нет')
