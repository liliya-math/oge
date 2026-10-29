# -*- coding: utf-8 -*-
"""Каждый экран урока на ширине 400: нет горизонтальной прокрутки, нет ошибок страницы. Запуск: python3 check_hscroll.py <урок.html> <ключ localStorage, оканчивающийся на -free> <число экранов>. Нужен http.server на порту 8765 в корне репозитория."""
import sys
from playwright.sync_api import sync_playwright
page,KEY,N=sys.argv[1],sys.argv[2],int(sys.argv[3])
bad=[];errs=set()
with sync_playwright() as p:
    br=p.chromium.launch(); ctx=br.new_context(viewport={'width':400,'height':860}); pg=ctx.new_page()
    pg.on('pageerror',lambda e:errs.add(str(e)[:120]))
    URL=f'http://localhost:8765/{page}'
    pg.goto(URL)
    for i in range(0,N):
        state={'sid':'t1','name':'Маша','tal':'cat','i':i,'started':1,'done':False,'sound':False,'streak':0,'best':0,'r':{},'cp':{str(k):1 for k in range(1,300)},'stk':[]}
        pg.evaluate("([k,v])=>localStorage.setItem(k,JSON.stringify(v))",[KEY,state])
        pg.goto(URL); pg.wait_for_selector('#go',timeout=8000); pg.click('#go')
        try: pg.wait_for_selector('#card',timeout=4000)
        except Exception: bad.append((i,'no card')); continue
        w=pg.evaluate("document.documentElement.scrollWidth")
        if w>401: bad.append((i+1,'hscroll',w))
    br.close()
print(page,'bad:',bad,'errors:',sorted(errs))
