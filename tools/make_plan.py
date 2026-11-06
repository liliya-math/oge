#!/usr/bin/env python3
"""План занятий ученика из расписания: текст для вкладки «План» кабинета (docs/plan-format.md).

Примеры:
  python3 tools/make_plan.py --grade 8 --days Вт,Сб --start 2026-11-10 --count 24
  python3 tools/make_plan.py --grade 5 --days Пн,Ср --start 2026-11-09 --count 30 --done 12
  python3 tools/make_plan.py --grade 9 --days Вт,Чт,Сб --oge-day Вт --levels ядро,желательно --start 2026-11-10

Правила (lesson-plan-rules.json):
  5, 6   один общий список «Математика».
  7, 8   очередь по занятиям ученика: алгебра, алгебра, геометрия (сквозная, не по неделям).
  9      1 занятие в неделю: всё занятие ОГЭ, план не строится (отдельная разработка).
         2 занятия: одно ОГЭ, второе школьная программа, алгебра и геометрия по очереди.
         3 занятия: ОГЭ, алгебра, геометрия.
Контрольные и факультативные плитки в план не идут. --works добавляет урок-работу,
--zakrep добавляет закрепление после тяжёлых тем (позиции в правилах).
"""
import argparse, datetime, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WD = {'пн': 0, 'вт': 1, 'ср': 2, 'чт': 3, 'пт': 4, 'сб': 5, 'вс': 6}


def load(name):
    with open(os.path.join(ROOT, name), encoding='utf-8') as f:
        return json.load(f)


def kind(t):
    ti = t['title']
    if '-F' in t['id'] or ti.startswith('Дополнительно') or not t['school']:
        return 'доп'
    if ti.startswith('Контрольная'):
        return 'контр'
    if ti.startswith('Урок-работа'):
        return 'работа'
    return 'урок'


def queue(route_file, rules, args, grade9=False):
    out = []
    for t in load(route_file)['lessons']:
        k = kind(t)
        if k in ('доп', 'контр'):
            continue
        if grade9 and t.get('oge') and t['oge'] not in args.levels:
            continue
        out.append((t['title'], '', t['id']))
        if args.zakrep and t['id'] in rules.get('zakrep_after', {}).get(route_file, []):
            out.append(('Закрепление: ' + t['title'], 'закрепление', t['id']))
        if args.works and t['id'] in rules.get('works_after', {}).get(route_file, []):
            out.append(('Работа: ' + t['title'], 'работа', t['id']))
    return out


def dates(days, start, limit):
    d = start
    n = 0
    while n < limit:
        if d.weekday() in days:
            yield d
            n += 1
        d += datetime.timedelta(days=1)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--grade', type=int, required=True)
    ap.add_argument('--days', required=True, help='дни занятий через запятую: Вт,Сб')
    ap.add_argument('--start', required=True, help='первая дата ГГГГ-ММ-ДД')
    ap.add_argument('--count', type=int, default=300, help='сколько занятий выдать')
    ap.add_argument('--done', type=int, default=0, help='5, 6: сколько уроков уже пройдено')
    ap.add_argument('--alg-done', type=int, default=0)
    ap.add_argument('--geo-done', type=int, default=0)
    ap.add_argument('--levels', default='ядро,желательно,сверх', help='9 класс: какие уровни ОГЭ брать')
    ap.add_argument('--oge-day', default='', help='9 класс: какой из дней занят ОГЭ (по умолчанию первый)')
    ap.add_argument('--works', action='store_true', help='добавить уроки-работы')
    ap.add_argument('--zakrep', action='store_true', help='добавить закрепления после тяжёлых тем')
    ap.add_argument('--out', default='')
    args = ap.parse_args()
    args.levels = [x.strip() for x in args.levels.split(',')]
    rules = load('lesson-plan-rules.json')
    if str(args.grade) not in rules['routes']:
        sys.exit('класс должен быть 5-9')
    try:
        days = sorted({WD[x.strip().lower()[:2]] for x in args.days.split(',') if x.strip()})
    except KeyError:
        sys.exit('дни: Пн,Вт,Ср,Чт,Пт,Сб,Вс')
    start = datetime.date.fromisoformat(args.start)
    r = rules['routes'][str(args.grade)]
    g9 = args.grade == 9
    Q = {k: queue(f, rules, args, g9) for k, f in r.items()}
    if 'math' in Q:
        Q['math'] = Q['math'][args.done:]
    else:
        Q['alg'] = Q['alg'][args.alg_done:]
        Q['geo'] = Q['geo'][args.geo_done:]
    BLOCK = {'math': 'Математика', 'alg': 'Алгебра', 'geo': 'Геометрия', 'oge': 'ОГЭ'}
    per_week = len(days)
    ds = list(dates(days, start, args.count))
    # какой тип у каждого занятия
    plan = []
    if 'math' in Q:
        plan = [('math', d) for d in ds]
    elif not g9:
        cyc = rules['cycle_alg_geo']
        plan = [(cyc[i % len(cyc)], d) for i, d in enumerate(ds)]
    else:
        if per_week == 1:
            sys.exit('9 класс, 1 занятие в неделю: всё занятие ОГЭ по номерам, план по школьной программе не строится (отдельная разработка).')
        if per_week > 3:
            sys.exit('9 класс: поддерживаются 2 или 3 занятия в неделю')
        oge_wd = WD[args.oge_day.lower()[:2]] if args.oge_day else days[0]
        if oge_wd not in days:
            sys.exit('--oge-day должен быть одним из дней занятий')
        weeks = {}
        for d in ds:
            weeks.setdefault(d - datetime.timedelta(days=d.weekday()), []).append(d)
        school_i = 0
        for _, wk in sorted(weeks.items()):
            rest = [d for d in wk if d.weekday() != oge_wd]
            for d in wk:
                if d.weekday() == oge_wd:
                    plan.append(('oge', d))
            if per_week == 2:
                for d in rest:
                    plan.append((('alg', 'geo')[school_i % 2], d)); school_i += 1
            else:
                for t, d in zip(('alg', 'geo'), rest):
                    plan.append((t, d))
        plan.sort(key=lambda x: x[1])
    lines, stat = [], {}
    pos = {k: 0 for k in Q}
    for typ, d in plan:
        if typ == 'oge':
            lines.append(f'{d.isoformat()} | ОГЭ | По заданиям ОГЭ (номера по плану ученика)')
        else:
            if pos[typ] >= len(Q[typ]):
                continue
            title, note, _ = Q[typ][pos[typ]]
            pos[typ] += 1
            lines.append(f'{d.isoformat()} | {BLOCK[typ]} | {title}' + (f' |  | {note}' if note else ''))
        k = (d.strftime('%Y-%m'), BLOCK[typ])
        stat[k] = stat.get(k, 0) + 1
    text = '\n'.join(lines) + '\n'
    if args.out:
        open(args.out, 'w', encoding='utf-8').write(text)
    else:
        sys.stdout.write(text)
    sys.stderr.write('Занятий по месяцам: ' + '; '.join(f'{m} {b} {n}' for (m, b), n in sorted(stat.items())) + '\n')
    left = {k: len(Q[k]) - pos[k] for k in Q}
    sys.stderr.write('Осталось уроков в списке: ' + ', '.join(f'{BLOCK[k]} {v}' for k, v in left.items()) + '\n')


if __name__ == '__main__':
    main()
