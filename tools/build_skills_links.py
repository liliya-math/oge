#!/usr/bin/env python3
"""Собирает skills-links.json: к каждому узлу графа навыков (skills-graph.json) привязаны
теория и домашка, которые уже лежат на сайте. Страница skill.html читает этот файл.

Запуск из корня репозитория:  python3 tools/build_skills_links.py
Падает, если в привязке указан несуществующий файл или узел.

Как править: меняй KITS (комплекты материалов) и NODES (какой узел к каким комплектам относится).
exact — материал именно про этот навык; near — тема рядом, показывается отдельным блоком."""
import json, os, sys

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
graph = json.load(open(os.path.join(root, 'skills-graph.json'), encoding='utf-8'))
node_ids = {n['id'] for n in graph['nodes']}

# файлы комплекта: суффикс -> (раздел, подпись)
KIT_FILES = [
    ('teoriya.html', 'theory', 'Теория и устный опрос'),
    ('pamyatka.html', 'theory', 'Памятка: алгоритм и запись ответа'),
    ('razbor-5.html', 'theory', 'Разбор 5 задач повышенной сложности'),
    ('teoriya.pdf', 'theory', 'Теория для печати (PDF)'),
    ('dz.html', 'hw', 'Домашняя карточка'),
    ('dz.pdf', 'hw', 'Домашняя карточка для печати (PDF)'),
    ('trenazhor-gen.html', 'hw', 'Тренажёр: новые числа каждый раз'),
    ('pyatiminutki.html', 'hw', 'Пятиминутки (2 варианта)'),
    ('test.html', 'hw', 'Тест'),
    ('kontrolnaya.html', 'hw', 'Зачётный лист (3 уровня)'),
]
# комплекты: ключ -> (тема для подписи, префикс файлов, дополнительные материалы [(раздел, файл, подпись)])
KITS = {
    'obyknovennye': ('обыкновенные дроби', 'z6-obyknovennye', [
        ('theory', 'drob-deistviya.html', 'Интерактивное обучение: действия с дробями'),
        ('theory', 'obyasnenie-5-9-drobi.html', 'Объяснение: дроби'),
        ('theory', 'razbor-obyknovennye-dialog.pdf', 'Диалог ученик-учитель, план урока (PDF)')]),
    'desyatichnye': ('десятичные дроби', 'z6-drobi', [
        ('hw', 'dz-desyatichnye-drobi.html', 'ДЗ №1: десятичные дроби'),
        ('hw', 'dz-desyatichnye-drobi.pdf', 'ДЗ №1 для печати (PDF)'),
        ('theory', 'razbor-drobi-6-dialog.pdf', 'Диалог ученик-учитель, план урока (PDF)')]),
    'znaki': ('числа с разными знаками', None, [
        ('theory', 'znaki-s-nulya.html', 'Урок с нуля: числа с разными знаками'),
        ('theory', 'razbor-znaki-dialog.html', 'Разбор в диалоге'),
        ('hw', 'dz-chisla-s-raznymi-znakami.html', 'ДЗ №2: числа с разными знаками'),
        ('hw', 'dz-chisla-s-raznymi-znakami.pdf', 'ДЗ №2 для печати (PDF)')]),
    'procenty': ('проценты', 'z21-procenty', [
        ('theory', 'obyasnenie-5-9-procenty.html', 'Объяснение: проценты'),
        ('theory', 'razbor-procenty-dialog.pdf', 'Диалог ученик-учитель (PDF)'),
        ('hw', 'dz-procenty.pdf', 'ДЗ по процентам (PDF)')]),
    'drobno-rac': ('дробно-рациональные уравнения', None, [
        ('theory', 'shpargalka-9-drobno-ratsionalnye-40.pdf', 'Шпаргалка: вся теория (PDF)'),
        ('theory', 'obyasnenie-9-drobno-ratsionalnye-uravneniya.html', 'Объяснение: дробно-рациональные уравнения'),
        ('hw', 'zadaniya-9-drobno-ratsionalnye-40.pdf', '40 заданий в 4 уровнях (PDF)'),
        ('hw', 'dz-9-drobnye-uravneniya.html', 'ДЗ №1-3: дробные уравнения')]),
    'stepeni': ('степени', 'z8-stepeni', [
        ('theory', 'obyasnenie-5-9-stepeni.html', 'Объяснение: степени')]),
    'korni': ('корни', 'z8-korni', [
        ('theory', 'obyasnenie-5-9-korni.html', 'Объяснение: корни'),
        ('hw', 'trenazher-ustnyj-schet.html', 'Тренажёр устного счёта: квадраты, корни')]),
    'kvadratnye': ('квадратные уравнения', 'z20-kvadratnye', [
        ('theory', 'obyasnenie-5-9-kvadratnye.html', 'Объяснение: квадратные уравнения'),
        ('theory', 'razbor-kvadratnye-dialog.pdf', 'Диалог ученик-учитель (PDF)')]),
    'sistemy': ('системы уравнений', 'z20-sistemy', [
        ('theory', 'obyasnenie-5-9-sistemy.html', 'Объяснение: системы уравнений и неравенств'),
        ('theory', 'razbor-sistemy-dialog.pdf', 'Диалог ученик-учитель (PDF)')]),
    'neravenstva': ('неравенства', 'z20-neravenstva', [
        ('theory', 'obyasnenie-5-9-neravenstva.html', 'Объяснение: неравенства'),
        ('theory', 'razbor-neravenstva-dialog.pdf', 'Диалог ученик-учитель (PDF)')]),
    'progressii': ('прогрессии', 'z14-progressii', [
        ('theory', 'obyasnenie-5-9-arifm.html', 'Объяснение: арифметическая прогрессия'),
        ('theory', 'obyasnenie-5-9-geom.html', 'Объяснение: геометрическая прогрессия')]),
    'veroyatnost': ('вероятность', 'z10-veroyatnost', [
        ('theory', 'obyasnenie-5-9-veroyat.html', 'Объяснение: теория вероятностей')]),
    'dvizhenie': ('задачи на движение', 'z21-dvizhenie', [
        ('theory', 'obyasnenie-5-9-dvizhenie.html', 'Объяснение: задачи на движение'),
        ('theory', 'razbor-dvizhenie-dialog.pdf', 'Диалог ученик-учитель (PDF)')]),
    'smesi': ('смеси и сплавы', 'z21-smesi', [
        ('theory', 'obyasnenie-5-9-smesi.html', 'Объяснение: задачи на смеси')]),
    'funkcii': ('графики функций', 'z22-funkcij', [
        ('theory', 'obyasnenie-5-9-grafiki.html', 'Объяснение: графики функций')]),
    'kusochnye': ('кусочные функции', 'z22-grafiki', [
        ('theory', 'obyasnenie-5-9-kusochnaya.html', 'Объяснение: кусочная функция')]),
    'trapeciya': ('трапеция', 'z23-trapeciya', [
        ('theory', 'obyasnenie-5-9-trapeciya.html', 'Объяснение: трапеция')]),
    'pifagor': ('теорема Пифагора', None, [
        ('theory', 'z15-pifagor.html', 'Разбор: теорема Пифагора')]),
    'trig': ('синус, косинус, тангенс', None, [
        ('theory', 'z15-sin-cos-tg-znachenie.html', 'Разбор: найти значение'),
        ('theory', 'z15-sin-cos-tg-storona.html', 'Разбор: найти сторону')]),
    'ploshchad-tr': ('площадь треугольника', None, [
        ('theory', 'z15-ploshchad.html', 'Разбор: площадь треугольника')]),
    'ravnobedr': ('равнобедренный треугольник', None, [
        ('theory', 'z15-ravnobedrennyy.html', 'Разбор: равнобедренный треугольник'),
        ('theory', 'z15-ravnostoronniy.html', 'Разбор: равносторонний треугольник')]),
    'summa-uglov': ('сумма углов треугольника', None, [
        ('theory', 'z15-summa-uglov.html', 'Разбор: сумма углов и внешний угол')]),
    'srednyaya': ('медиана, биссектриса, средняя линия', None, [
        ('theory', 'z15-mediana-bissektrisa-srednyaya-liniya.html', 'Разбор: медиана, биссектриса, средняя линия'),
        ('theory', 'obyasnenie-5-9-mediana.html', 'Объяснение: медиана'),
        ('theory', 'obyasnenie-5-9-bissektrisa.html', 'Объяснение: биссектриса')]),
    'chetyrehugolniki': ('параллелограмм, ромб, квадрат', None, [
        ('theory', 'obyasnenie-5-9-parallelogramm.html', 'Объяснение: параллелограмм'),
        ('theory', 'obyasnenie-5-9-romb.html', 'Объяснение: ромб'),
        ('theory', 'obyasnenie-5-9-kvadrat.html', 'Объяснение: квадрат'),
        ('theory', 'bissektrisy-parallelogramma.html', 'Разбор: биссектрисы в параллелограмме')]),
    'zadanie6': ('задание 6', None, [
        ('hw', 'trainer.html', 'Тренажёр: задание 6, дроби'),
        ('theory', 'umk-8-9-zadanie-6.html', 'УМК: задание 6 ОГЭ')]),
}

# узел -> (exact-комплекты, near-комплекты)
NODES = {
    'N04': (['znaki'], []), 'N05': (['znaki'], []), 'N06': (['znaki'], []),
    'N08': (['obyknovennye'], []), 'N09': (['obyknovennye'], []),
    'N10': (['obyknovennye'], []), 'N11': (['obyknovennye'], []),
    'N12': (['desyatichnye'], []), 'N13': (['desyatichnye'], []),
    'N14': ([], ['desyatichnye', 'obyknovennye']),
    'N15': (['desyatichnye', 'obyknovennye', 'zadanie6'], []),
    'N16': (['procenty'], []), 'N17': (['procenty'], []),
    'N18': (['stepeni'], []), 'N19': (['stepeni'], []),
    'N20': (['korni'], []), 'N21': (['korni'], []),
    'A07': ([], ['stepeni', 'korni']),
    'A09': ([], ['drobno-rac']), 'A12': (['drobno-rac'], ['kvadratnye']),
    'A10': (['kvadratnye'], []), 'A11': (['kvadratnye'], []),
    'A13': (['sistemy'], []),
    'A14': (['neravenstva'], []), 'A15': (['neravenstva'], []), 'A16': (['neravenstva'], []),
    'A17': (['progressii'], []), 'A18': (['progressii'], []),
    'S07': (['veroyatnost'], []), 'S08': (['veroyatnost'], []),
    'S10': (['dvizhenie'], []), 'S11': (['dvizhenie'], []),
    'S13': (['smesi'], []),
    'F03': ([], ['funkcii']), 'F04': (['funkcii'], []), 'F05': ([], ['funkcii']),
    'F06': (['funkcii'], []), 'F07': (['funkcii'], []), 'F08': (['funkcii'], []),
    'F09': (['funkcii', 'kusochnye'], []),
    'G02': (['summa-uglov'], []), 'G04': (['ravnobedr'], []),
    'G05': (['pifagor'], []), 'G06': (['ploshchad-tr'], []), 'G07': (['trig'], []),
    'G08': ([], ['srednyaya']),
    'G11': (['chetyrehugolniki'], []), 'G12': (['trapeciya'], []),
    'G13': ([], ['trapeciya']), 'G16': ([], ['trapeciya']), 'G17': (['trapeciya'], []),
}

def exists(f):
    return os.path.exists(os.path.join(root, f))

def kit_items(key):
    topic, prefix, extra = KITS[key]
    out = {'theory': [], 'hw': []}
    if prefix:
        for suf, sec, label in KIT_FILES:
            f = f'{prefix}-{suf}'
            if exists(f):
                out[sec].append({'url': f, 'label': label, 'topic': topic})
    for sec, f, label in extra:
        if not exists(f):
            sys.exit(f'Нет файла {f} (комплект {key})')
        out[sec].append({'url': f, 'label': label, 'topic': topic})
    return out

def merge(keys):
    res = {'theory': [], 'hw': []}
    seen = set()
    for k in keys:
        for sec, items in kit_items(k).items():
            for it in items:
                if it['url'] not in seen:
                    seen.add(it['url']); res[sec].append(it)
    return res

links = {}
for nid, (ex, nr) in NODES.items():
    if nid not in node_ids:
        sys.exit(f'Нет узла {nid} в skills-graph.json')
    exact = merge(ex)
    near = merge([k for k in nr if k not in ex])
    entry = {}
    if exact['theory']: entry['theory'] = exact['theory']
    if exact['hw']: entry['hw'] = exact['hw']
    if near['theory'] or near['hw']:
        entry['near'] = near['theory'] + near['hw']
    if entry: links[nid] = entry

json.dump({'version': 1, 'links': links}, open(os.path.join(root, 'skills-links.json'), 'w', encoding='utf-8'),
          ensure_ascii=False, separators=(',', ':'))

cov = [n for n in node_ids if n in links and ('theory' in links[n] or 'hw' in links[n])]
near_only = [n for n in node_ids if n in links and n not in cov]
none = sorted(node_ids - set(links))
print(f'Всего узлов: {len(node_ids)}; с теорией/домашкой: {len(cov)}; только «рядом по теме»: {len(near_only)}; без материалов: {len(none)}')
print('Без материалов:', ' '.join(none))
