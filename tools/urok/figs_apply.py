# -*- coding: utf-8 -*-
"""Добавляет чертежи на экраны урока: MAP[номер экрана] -> html (строка или список)."""
import re

def apply(T, mp):
    done = 0
    for d in T:
        n = int(d['n'])
        if n not in mp: continue
        figs = mp[n]
        html = ''.join(figs) if isinstance(figs, (list, tuple)) else figs
        if d['kind'] == 'q': d['q'] = d['q'] + html
        elif d['kind'] == 'info': d['body'] = d['body'] + html
        else: continue
        done += 1
    return done
