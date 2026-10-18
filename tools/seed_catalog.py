#!/usr/bin/env python3
"""Добавляет в catalog.json файлы, которых там ещё нет (существующие записи не трогает).
Тип, класс и номер задания угадываются по имени файла — после запуска проверь и поправь вручную."""
import os, re, json, html

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
path = os.path.join(root, 'catalog.json')
cat = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {'items': []}
have = {i['file'] for i in cat['items']}

def title_of(f):
    if not f.endswith('.html'): return ''
    t = open(os.path.join(root, f), encoding='utf-8', errors='ignore').read(60000)
    m = re.search(r'<title>(.*?)</title>', t, re.S | re.I)
    return html.unescape(m.group(1).strip()) if m else ''

RULES = [  # (regex по имени файла, тип)
    (r'^probnik-|^mini-probnik', 'probnik'), (r'^razbor-probnik', 'razbor'),
    (r'^diagnostika-', 'diagnostika'), (r'^razbor-', 'razbor'),
    (r'^dz-', 'dz'), (r'^z\d+-|^zadacha-|^bissektrisy|^triangle', 'zadanie'),
    (r'^trainer|^trenazher', 'trenazher'),
    (r'^ucheba-|^drob-|^treug-|^znaki-|^y-k-|^materialy-', 'uchebnik'),
    (r'^\d-klass', 'klass'), (r'^formulas|^achievements', 'sluzhebnoe'),
    (r'^kabinet|^start', 'sistema'),
]
SKIP = {'index.html'}
new = 0
for f in sorted(os.listdir(root)):
    p = os.path.join(root, f)
    if not os.path.isfile(p) or f in SKIP or f in have or not f.endswith(('.html', '.pdf', '.txt', '.md')):
        continue
    typ = next((t for rx, t in RULES if re.search(rx, f)), 'prochee')
    m = re.search(r'(?:^|-)([5-9])-(?:klass|geom)|^([5-9])-klass', f)
    cls = int(next(g for g in m.groups() if g)) if m else None
    z = re.match(r'z(\d+)-', f)
    cat['items'].append({
        'file': f, 'title': title_of(f), 'type': typ, 'class': cls,
        'oge_task': int(z.group(1)) if z else None,
        'status': 'hidden' if typ == 'sistema' or f.endswith('.md') else 'public',
        'note': ''})
    new += 1
cat['items'].sort(key=lambda i: (i['type'], i['class'] or 0, i['file']))
json.dump(cat, open(path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('добавлено:', new, ' всего:', len(cat['items']))
