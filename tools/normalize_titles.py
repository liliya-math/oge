#!/usr/bin/env python3
"""Единые названия материалов в catalog.json: «ID темы · Вид · Тема».
Файлы не переименовываются (ссылки учеников и кабинета сломались бы), меняется только поле title.
Запуск: python3 tools/normalize_titles.py          — показать, что изменится
        python3 tools/normalize_titles.py --apply  — записать в catalog.json
Правила названий: docs/naming.md"""
import json, os, re, sys, ast
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CAT = f'{ROOT}/catalog.json'
cat = json.load(open(CAT, encoding='utf-8'))
src = open(f'{ROOT}/tools/build_skills_links.py', encoding='utf-8').read()
KITS = ast.literal_eval(re.search(r'^KITS = (\{.*?^\})', src, re.S | re.M).group(1)) if False else None
# KITS в скрипте содержит вложенные кортежи: достаём тему и префикс простым разбором
TOPIC = {}
for m in re.finditer(r"^    '([a-z]+)': \('([^']+)', (?:'([^']+)'|None)", src, re.M):
    if m.group(3): TOPIC[m.group(3)] = m.group(2)
SKILLS = {n['id']: n['title'] for n in json.load(open(f'{ROOT}/skills-by-grade.json', encoding='utf-8'))}

KIND = [  # (суффикс имени без расширения, вид, для учителя)
    ('trenazhor-gen', 'Тренажёр (новые числа)', False), ('trenazhor', 'Тренажёр', False),
    ('pyatiminutki', 'Пятиминутки', False), ('razbor-5', 'Разбор 5 задач', False),
    ('kontrolnaya', 'Зачётный лист', False), ('plan-uroka', 'План урока', True),
    ('pamyatka', 'Памятка', False), ('komplekt', 'Комплект', False),
    ('teoriya', 'Теория', False), ('test', 'Тест', False), ('dz', 'ДЗ', False),
]
def kind_of(f, typ):
    stem, ext = os.path.splitext(f.split('?')[0]); pdf = ext == '.pdf'; md = ext in ('.md', '.txt')
    m = re.fullmatch(r'(z\d+-[a-z]+(?:-[a-z]+)*?)-(trenazhor-gen|trenazhor|pyatiminutki|razbor-5|kontrolnaya|plan-uroka|pamyatka|komplekt|teoriya|test|dz)', stem)
    if m:
        pre, k = m.group(1), m.group(2)
        name, teach = next((n, t) for s, n, t in KIND if s == k)
        return pre, name, teach, pdf
    m = re.fullmatch(r'razbor-([a-z0-9-]+?)-dialog', stem)
    if m: return 'razbor:' + m.group(1), 'Разбор в диалоге' + (' (текст)' if md else ''), True, pdf
    m = re.fullmatch(r'(z\d+-[a-z]+(?:-[a-z]+)*)', stem)
    if m and m.group(1) in TOPIC: return m.group(1), 'Комплект: все материалы', False, False
    m = re.fullmatch(r'(dz-[a-z-]+?)-otvety', stem)
    if m: return m.group(1), 'Ответы к ДЗ', True, pdf
    if f.startswith('dz.html?w='): return None, 'ДЗ', False, False
    m = re.fullmatch(r'obyasnenie-5-9-([a-z]+)', stem)
    if m: return stem, 'Теория', False, pdf
    if re.match(r'(trenazher|trainer)', stem): return stem, 'Тренажёр', False, pdf
    if stem.startswith('diagnostik'): return stem, 'Диагностика', False, pdf
    if typ == 'dz' or re.match(r'dz-|domashnee-zadanie', stem) or stem.endswith('-dz'): return stem, 'ДЗ', False, pdf
    if re.match(r'(z15-|zadacha-|bissektrisy-)', stem): return stem, 'Задание', False, pdf
    return None, None, False, pdf

def clean_topic(t):
    t = re.sub(r'^(PDF:\s*)', '', t)
    t = re.sub(r'^(ДЗ №?\d*\s*·\s*|Домашняя карточка:\s*|Домашнее задание\s*·\s*|ДЗ:\s*|Тренажёр:\s*|Тест:\s*|Объяснение:\s*|Диалог ученик-учитель:\s*|План урока[^:]*:\s*|Памятка[^:]*:\s*)', '', t)
    t = re.sub(r'\s*\(\d+ (?:задач[иа]?|заданий)[^)]*\)', '', t)
    t = re.sub(r',\s*(план урока и ДЗ|план урока)[^)]*(\(.*\))?$', '', t)
    t = re.sub(r'\s*·\s*Уровень \d$', '', t)
    t = re.sub(r'\s*·\s*объяснение$', '', t, flags=re.I)
    t = re.sub(r'\s*·\s*интерактивный тренажёр', '', t, flags=re.I)
    t = re.sub(r'^Диагностики\s+', '', t)
    t = re.sub(r'\s*\((?:\d+ заданий[^)]*|числа свои[^)]*)\)', '', t)
    t = re.sub(r'^(?:ДЗ[:.]?\s*(?:№\d+\s*·\s*)?|Диагностика\s*·\s*)', '', t)
    t = re.sub(r'^№\d+ ОГЭ\s*·\s*', '', t)
    t = re.sub(r',\s*\d+ заданий.*$', '', t)
    return t.strip(' ·,:')

changed = skipped = 0; rows = []
SIB_OLD = {}
SIB = {}  # название страницы → тема для её PDF без названия
for it in cat['items']:
    st, ex = os.path.splitext(it['file'].split('?')[0])
    if ex == '.html' and it.get('title') and not re.match(r'\d', it['title']): SIB[st] = it['title']; SIB_OLD[st] = it['title']
for it in cat['items']:
    f = it['file']; node = it.get('node') or []
    pre, kind, teach, pdf = kind_of(f, it['type'])
    if not kind or not node: skipped += 1; continue
    # тема: у комплектов — из KITS, иначе из старого названия, иначе из карты навыков
    topic = None
    key = pre.split(':')[1] if pre and pre.startswith('razbor:') else None
    if pre and pre in TOPIC: topic = TOPIC[pre]
    elif key:
        for p, t in TOPIC.items():
            if p.split('-', 1)[1].startswith(key[:5]) or key.startswith(p.split('-', 1)[1][:5]): topic = t; break
    old = it.get('title') or ''
    st0 = os.path.splitext(f.split('?')[0])[0]
    if not topic and not old:
        base = re.sub(r'-otvety$', '', st0)
        if base in SIB: topic = clean_topic(SIB[base])
    if not topic and old: topic = clean_topic(old)
    if not topic: topic = SKILLS.get(node[0], '')
    if not topic: skipped += 1; continue
    ident = node[0]
    mn = re.match(r'ДЗ №(\d+)', old or SIB_OLD.get(re.sub(r'-otvety$', '', st0), ''))
    if kind == 'ДЗ' and mn: kind = f'ДЗ №{mn.group(1)}'
    kn = kind + (' (PDF)' if pdf else '')
    topic = topic[:1].upper() + topic[1:]
    new = f'{ident} · {kn} · {topic}' if not topic.startswith(kind) else f'{ident} · {topic}' + (' (PDF)' if pdf else '')
    if f.startswith('dz.html?w='):
        lvl = f.split('-')[-1]; new = f'{ident} · ДЗ Уровень {lvl} · {topic}' if False else f'{ident} · ДЗ · Уровень {lvl} · {clean_topic(old) or topic}'
    if teach: it['audience'] = 'teacher'
    if new != old: rows.append((f, old, new)); changed += 1
    it['title'] = new
if '--apply' in sys.argv:
    json.dump(cat, open(CAT, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    print('записано', changed, 'названий, пропущено', skipped)
else:
    for f, o, n in rows[:400]: print(f'{f[:44].ljust(44)} {o[:46].ljust(46)} -> {n}')
    print('изменится', changed, 'пропущено', skipped)
