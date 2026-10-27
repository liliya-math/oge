#!/usr/bin/env python3
"""Сводка покрытия: для каждой темы (ID из 3 частей) какие типы материалов есть. Результат: docs/skills-coverage.md"""
import json, os, collections
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
nodes = json.load(open(f'{ROOT}/skills-by-grade.json', encoding='utf-8'))
cat = json.load(open(f'{ROOT}/catalog.json', encoding='utf-8'))['items']
cat = [i for i in cat if i['status'] == 'public' and i.get('node')]
KINDS = [('uchebnik','теория'),('trenazher','тренажёр'),('dz','ДЗ'),('diagnostika','диагн.'),('razbor','разбор'),('zadanie','задания')]
def related(topic, node):  # материал относится к теме, если ID совпал, предок или потомок; привязки к классу целиком (7A) не считаются
    if '.' not in node: return False
    return node == topic or topic.startswith(node + '.') or node.startswith(topic + '.')
topics = [n for n in nodes if n['level'] == 2]
rows, gaps = [], collections.Counter()
for t in topics:
    have = collections.defaultdict(int)
    for it in cat:
        if any(related(t['id'], x) for x in it['node']):
            have[it['type']] += 1
    rows.append((t, have))
out = ['# Покрытие тем материалами', '', 'Считаются только опубликованные материалы, привязанные в `catalog.json` (поле `node`). Материал, привязанный к классу целиком (например диагностика `7A`), в темах не засчитывается; привязанный к разделу (`7A.4`) засчитывается всем темам раздела.', '',
       'Обновить: `python3 tools/link_catalog_to_skills.py && python3 tools/skills_coverage.py`', '']
for g in (5,6,7,8,9):
    for s, sn in (('A','Алгебра'),('G','Геометрия')):
        sel = [(t,h) for t,h in rows if t['grade']==g and t['id'][1]==s]
        if not sel: continue
        out += [f'## {g} класс · {sn}', '', '| Тема | ' + ' | '.join(k[1] for k in KINDS) + ' |', '|---|' + '---|'*len(KINDS)]
        for t,h in sel:
            out.append(f"| {t['id']} {t['title']} | " + ' | '.join(str(h.get(k[0])) if h.get(k[0]) else '·' for k in KINDS) + ' |')
        out.append('')
none = [t for t,h in rows if not sum(h.values())]
no_trn = [t for t,h in rows if not h.get('trenazher')]
no_dz = [t for t,h in rows if not h.get('dz')]
out += ['## Итог', '', f'- Тем всего: {len(rows)}', f'- Совсем без материалов: {len(none)}', f'- Без тренажёра: {len(no_trn)}', f'- Без ДЗ: {len(no_dz)}', '']
open(f'{ROOT}/docs/skills-coverage.md', 'w', encoding='utf-8').write('\n'.join(out))
print(len(rows), len(none), len(no_trn), len(no_dz))
for g in (5,6,7,8,9):
    for s in 'AG':
        sel=[(t,h) for t,h in rows if t['grade']==g and t['id'][1]==s]
        if sel: print(g,s,'тем',len(sel),'пусто',sum(1 for t,h in sel if not sum(h.values())),'без тренажёра',sum(1 for t,h in sel if not h['trenazher']))
