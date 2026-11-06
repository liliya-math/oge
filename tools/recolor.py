#!/usr/bin/env python3
"""Перекрашивает старую палитру сайта в палитру Лили (обои Oh Hey Cindy). Идемпотентно.
Запуск: python3 tools/recolor.py [--dry] файлы..."""
import re, sys, pathlib
HEX = {
 '#14211e':'#212E30','#1b2b28':'#293538','#223632':'#293538','#10291d':'#212E30','#1b1b22':'#212E30','#2a2a33':'#293538','#3b4a44':'#34444C',
 '#2a1510':'#212E30','#2a1d17':'#212E30','#6b4b40':'#34444C','#6f625a':'#34444C','#2c4f6b':'#34444C',
 '#f3ece2':'#F5E8DB','#fff3ea':'#F5E8DB','#fff1d6':'#F5E8DB','#fff3e0':'#F5E8DB','#f7f1e7':'#F5E8DB','#e8e1d6':'#ECE1D4','#e6dbd3':'#ECE1D4','#ddd0c7':'#ECE1D4','#d9d1c6':'#ECE1D4',
 '#e2f0d4':'#CCD0D5','#e6eefc':'#CCD0D5','#dde7f1':'#CCD0D5','#d6e2ee':'#CCD0D5','#bdc9c0':'#BDBFAA',
 '#1747c9':'#27439B','#1f53d8':'#27439B','#2f6be8':'#27439B','#2aabee':'#27439B','#9db8ff':'#CCD0D5','#a9c1ff':'#CCD0D5',
 '#f2905e':'#CF8960','#f5b37f':'#CF8960','#ff8f73':'#CF8960','#c2482b':'#CF8960','#f5dc6a':'#F0D56E',
 '#a9d18e':'#BDBFAA','#5d7a4f':'#5C694F','#a9b6ad':'#BDBFAA','#6e7f77':'#AFB3A8'}
RGB = {(20,33,30):(33,46,48),(243,236,226):(245,232,219),(226,234,228):(245,232,219),(23,71,201):(39,67,155),(242,144,94):(207,137,96),
 (169,209,142):(189,191,170),(157,184,255):(204,208,213),(134,227,185):(189,191,170),(214,168,255):(204,208,213),(245,220,106):(240,213,110)}
hexre = re.compile(r'#[0-9a-fA-F]{6}\b')
rgbre = re.compile(r'rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,[^)]*)?\)')
def conv(s):
    s = s.replace('--bg:#14211e', '--bg:#243033').replace('--bg: #14211e', '--bg: #243033')
    s = hexre.sub(lambda m: HEX.get(m.group(0).lower(), m.group(0)), s)
    def f(m):
        t = (int(m.group(1)), int(m.group(2)), int(m.group(3)))
        if t not in RGB: return m.group(0)
        n = RGB[t]; a = m.group(4)
        return ('rgba(%d,%d,%d%s)' % (n+(a,)) if a else 'rgb(%d,%d,%d)' % n)
    return rgbre.sub(f, s)
if __name__ == '__main__':
    dry = '--dry' in sys.argv; n = 0
    for f in [a for a in sys.argv[1:] if a != '--dry']:
        p = pathlib.Path(f)
        try: t = p.read_text(encoding='utf-8')
        except Exception: continue
        u = conv(t)
        if u != t:
            n += 1
            if not dry: p.write_text(u, encoding='utf-8')
    print('изменено файлов:', n)
