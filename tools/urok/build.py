# -*- coding: utf-8 -*-
import os
ROOT=os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),"..",".."))
import json, re, sys, os
sys.path.insert(0, os.path.dirname(__file__))
import example_urok_sin_cos as LC0
LC=LC0.LC
LC.finalize()  # формулы и примеры становятся неразрывными
import shell_patch as SP, cheats
SP.process_T(LC.T)  # дроби с горизонтальной чертой, оформление формул
for d in LC.T: d.pop('cp', None)  # без контрольных игр

SRC = ROOT+'/obyasnenie-5-9-bissektrisa.html'  # шаблон оболочки
OUT = ROOT+'/obyasnenie-9-teoremy-sinusov-kosinusov.html'
WJS = os.path.join(os.path.dirname(__file__), 'widgets.js')

s = open(SRC, encoding='utf8').read()

def rep_once(s, old, new):
    assert s.count(old) == 1, ('not unique/found', old[:60], s.count(old))
    return s.replace(old, new)

# 1. заголовок и адрес
s = rep_once(s, '<title>Биссектриса: объяснение</title>', '<title>Теоремы синусов и косинусов: урок</title>')
s = rep_once(s, "https://lilimath.ru/obyasnenie-5-9-bissektrisa.html", "https://lilimath.ru/obyasnenie-9-teoremy-sinusov-kosinusov.html")
s = rep_once(s, "const KEY='oge-ob-bissektrisa-v1-'", "const KEY='oge-ob-teoremy-sin-cos-v1-'")

# 2. тема
i = s.index('const TOPIC=')
j = s.index(';', i)
topic = {"id": "teoremy-sin-cos", "t": "Теоремы синусов и косинусов", "w": "с теоремами синусов и косинусов", "mins": 60, "next": "", "nextT": ""}
s = s[:i] + 'const TOPIC=' + json.dumps(topic, ensure_ascii=False) + s[j:]

# 3. экраны
i = s.index('const T=[')
j = s.index('];\nconst QUOTES', i) + 2
s = s[:i] + 'const T=' + json.dumps(LC.T, ensure_ascii=False) + ';' + s[j:]

# 4. рисунки-виджеты: всё между хелперами и window.MW=W
i = s.index("const grp=n=>")
i = s.index('\n', i) + 1
j = s.index('window.MW=W;')
s = s[:i] + open(WJS, encoding='utf8').read() + '\n' + s[j:]

# 5. реплики зверя
old = "trap:['Вот тут чаще всего ошибаются. Запомни.','Эту ловушку знают все, кто ошибался. Теперь ты тоже.']"
assert s.count(old) == 1
s = s.replace(old, old + ",recall:['Это из прошлых тем. Вспоминай спокойно, не подглядывай.','Мы это уже проходили. Вспомни, как мы это разбирали.'],key:['Вот это главное. Перепиши в тетрадь.','Эту формулу стоит записать в тетрадь.']")

# 6. стартовый экран
s = rep_once(s, 'Простыми словами, без зубрёжки: история, картинка из жизни, три правила и несколько быстрых проверок. Ошибаться можно: подсказки есть, а если не получится, я объясню ещё раз. В конце тебя ждут шпаргалка и диплом.',
             'Один урок на час: повторим нужное из прошлых тем, разберём теорему косинусов и теорему синусов, научимся выбирать между ними и порешаем задачи. Ошибаться можно: подсказки есть, а если не получится, можно вернуться к объяснению. В конце тебя ждут шпаргалка и диплом.')
s = rep_once(s, '<span class="pill">${L.length} коротких экранов</span>', '<span class="pill">${L.length} экранов</span>')
s = rep_once(s, '<a class="chip" href="obyasnenie-5-9.html">Все темы</a>', '<a class="chip" href="9-klass.html">Все материалы 9 класса</a>')

# 7. оформление: красная строка и неразрывные формулы
s = rep_once(s, '.stmt p:last-child{margin-bottom:0}', '.stmt p:last-child{margin-bottom:0}.stmt p{text-indent:1.4em}.stmt .m,.fbox .m,.opt .m{white-space:nowrap}@media (max-width:520px){.fbox{font-size:18px;padding:16px 14px}}')

# 8. пузырь зверя показывает разбор как текст: убрать разметку формул и переносов
s = rep_once(s, '<span>${esc(sub)}</span>', "<span>${esc(String(sub).replace(/<br\\s*\\/?>/g,' ').replace(/<[^>]+>/g,''))}</span>")

# 9. без игровых элементов (по просьбе владельца): нет контрольных игр, стикеров за серию и счётчика стикеров
s = rep_once(s, '    <span class="pill" title="Стикеры">стикеры <strong>${S.stk.length}</strong></span>\n', '')
s = rep_once(s, 'function streakDrop(){\n', 'function streakDrop(){return;\n')

s = SP.patch_shell(s, cheats.CHEATS['sin_cos']())
open(OUT, 'w', encoding='utf8').write(s)
print('written', OUT, len(s), 'screens', len(LC.T))
