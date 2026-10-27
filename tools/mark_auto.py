#!/usr/bin/env python3
"""Проставляет в catalog.json поле "auto": true у страниц, которые сами сообщают кабинету о сдаче
(подключён cabinet-report.js). Кабинет учителя показывает по нему пометку «сдача отметится сама».
Запуск из корня репозитория: python3 tools/mark_auto.py  (повторный запуск безопасен)."""
import json, os, sys

PATH = 'catalog.json'
raw = open(PATH, encoding='utf-8').read()
data = json.loads(raw)
changed = 0
for it in data['items']:
    f = it['file']
    auto = False
    if f.endswith('.html') and os.path.exists(f):
        auto = 'cabinet-report.js' in open(f, encoding='utf-8', errors='ignore').read()
    if auto and it.get('auto') is not True:
        it['auto'] = True; changed += 1
    elif not auto and 'auto' in it:
        del it['auto']; changed += 1
out = json.dumps(data, ensure_ascii=False, indent=2) + ('\n' if raw.endswith('\n') else '')
open(PATH, 'w', encoding='utf-8').write(out)
print('изменено записей:', changed, '· с автоотметкой:', sum(1 for i in data['items'] if i.get('auto')))
