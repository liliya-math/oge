#!/usr/bin/env python3
"""Проверка сайта: мёртвые ссылки, картинки, страницы без входящих ссылок, каталог.
Запуск из корня репозитория:  python3 tools/check_links.py
Код возврата 1, если есть мёртвые ссылки или файлы, которых нет в catalog.json."""
import os, re, sys, json

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
files = sorted(f for f in os.listdir(root) if os.path.isfile(os.path.join(root, f)))
text_files = [f for f in files if f.endswith(('.html', '.txt', '.md'))]
attr = re.compile(r'''(?:href|src)\s*=\s*["']?([^"'\s>#?]+)''', re.I)
quoted = re.compile(r'''["']((?:img/)?[A-Za-z0-9_\-]+\.(?:html|pdf|txt|md|jpg|png))["']''')

inbound = {f: set() for f in files}
dead = {}
for src in text_files:
    t = open(os.path.join(root, src), encoding='utf-8', errors='ignore').read()
    found = set(attr.findall(t)) | set(quoted.findall(t))
    for r in found:
        if r.startswith(('http', 'mailto', 'tel', 'data:', '//', 'javascript')) or '$' in r or '{' in r:
            continue
        r = r.lstrip('./')
        if r.startswith('img/'):
            if not os.path.exists(os.path.join(root, r)):
                dead.setdefault(src, set()).add(r)
        elif re.fullmatch(r'[A-Za-z0-9_\-]+\.(html|pdf|txt|md)', r):
            if r in inbound:
                if r != src: inbound[r].add(src)
            else:
                dead.setdefault(src, set()).add(r)

catalog = json.load(open(os.path.join(root, 'catalog.json'), encoding='utf-8')) if os.path.exists(os.path.join(root, 'catalog.json')) else {'items': []}
listed = {i['file'] for i in catalog['items']}
public = [f for f in files if f.endswith(('.html', '.pdf', '.txt', '.md')) and f not in ('index.html',)]
not_in_catalog = [f for f in public if f not in listed]
orphans = [f for f in public if not inbound[f] and f != 'kabinet-apps-script.txt']
missing_files = [i['file'] for i in catalog['items'] if i['file'].split('?')[0] not in files]

bad = False
print('Мёртвые ссылки:')
for s, d in sorted(dead.items()):
    bad = True
    print(f'  {s}: {", ".join(sorted(d))}')
if not dead: print('  нет')
print('\nФайлы, на которые никто не ссылается:')
for f in orphans: print(f'  {f}')
if not orphans: print('  нет')
print('\nЕсть в репозитории, нет в catalog.json:')
for f in not_in_catalog:
    bad = True
    print(f'  {f}')
if not not_in_catalog: print('  нет')
print('\nЕсть в catalog.json, нет файла:')
for f in missing_files:
    bad = True
    print(f'  {f}')
if not missing_files: print('  нет')
sys.exit(1 if bad else 0)
