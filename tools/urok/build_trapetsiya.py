# -*- coding: utf-8 -*-
import os
ROOT=os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),"..",".."))
import json, re, sys, os
sys.path.insert(0, os.path.dirname(__file__))
import trapetsiya as LC0
LC=LC0.LC
LC.finalize()
import figs_apply, figs_map_trap
print('чертежей добавлено:', figs_apply.apply(LC.T, figs_map_trap.MAP))
import shell_patch as SP, cheats
SP.process_T(LC.T)  # дроби с горизонтальной чертой, оформление формул

SRC = ROOT+'/obyasnenie-5-9-bissektrisa.html'  # шаблон оболочки
OUT = ROOT+'/obyasnenie-8-trapeciya.html'
WJS = os.path.join(os.path.dirname(__file__), 'widgets.js')

s = open(SRC, encoding='utf8').read()

def rep_once(s, old, new):
    assert s.count(old) == 1, ('not unique/found', old[:60], s.count(old))
    return s.replace(old, new)

# 1. заголовок и адрес
s = rep_once(s, '<title>Биссектриса: объяснение</title>', '<title>Трапеция: урок</title>')
s = rep_once(s, "https://lilimath.ru/obyasnenie-5-9-bissektrisa.html", "https://lilimath.ru/obyasnenie-8-trapeciya.html")
s = rep_once(s, "const KEY='oge-ob-bissektrisa-v1-'", "const KEY='oge-ob-trapeciya-v1-'")

# 2. тема
i = s.index('const TOPIC=')
j = s.index(';', i)
topic = {"id": "trapeciya", "t": "Трапеция", "w": "с трапецией", "mins": 60, "next": "", "nextT": ""}
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
             'Один урок на час: повторим нужное из прошлых тем, разберём определение трапеции, углы, среднюю линию, равнобедренную и прямоугольную трапеции. Ошибаться можно: подсказки есть, а если не получится, можно вернуться к объяснению. В конце тебя ждут шпаргалка и диплом.')
s = rep_once(s, '<span class="pill">${L.length} коротких экранов</span>', '<span class="pill">${L.length} экранов</span>')
s = rep_once(s, '<a class="chip" href="obyasnenie-5-9.html">Все темы</a>', '<a class="chip" href="8-klass.html">Все материалы 8 класса</a>')

# реплика зверя показывает разбор как простой текст: убираем теги, переносы заменяем пробелом
s = rep_once(s, '<span>${esc(sub)}</span></div><div class="rimg">', "<span>${esc(String(sub).replace(/<br\\s*\\/?>/g,' ').replace(/<[^>]+>/g,''))}</span></div><div class=\"rimg\">")
s = rep_once(s, '.stmt p:last-child{margin-bottom:0}', '.stmt p:last-child{margin-bottom:0}.stmt p{text-indent:1.4em}.nb{white-space:nowrap}')
s = SP.patch_shell(s, cheats.CHEATS['trapetsiya']())
open(OUT, 'w', encoding='utf8').write(s)
print('written', OUT, len(s), 'screens', len(LC.T))
