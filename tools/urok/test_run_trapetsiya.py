import os
ROOT=os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),"..",".."))
import json, sys, time, subprocess, os
sys.path.insert(0,'.')
import trapetsiya as LV; LC=LV.LC; LC.finalize()
from playwright.sync_api import sync_playwright

T=LC.T
URL='http://127.0.0.1:8765/obyasnenie-8-trapeciya.html'
KEY='oge-ob-trapeciya-v1-free'
L=len(T)
errors=[]
def fmt(v):
    return ('%g'%v).replace('.',',')

with sync_playwright() as p:
    br=p.chromium.launch()
    ctx=br.new_context(viewport={'width':400,'height':800})
    pg=ctx.new_page()
    pg.on('console',lambda m: errors.append(('console',m.type,m.text)) if m.type in ('error',) else None)
    pg.on('pageerror',lambda e: errors.append(('pageerror',str(e))))
    pg.goto(URL)
    # prefill state: skip checkpoint games
    state={'sid':'t1','name':'Тест','tal':'cat','i':0,'started':1,'done':False,'sound':False,'streak':0,'best':0,
           'r':{'999':{'st':'seen','tries':0,'hints':0,'ans':[],'th':'','t':0}},
           'cp':{str(i):1 for i in range(1,L+2)},'stk':[]}
    pg.evaluate("([k,v])=>localStorage.setItem(k,JSON.stringify(v))",[KEY,state])
    pg.goto(URL)
    pg.wait_for_selector('#go')
    pg.click('#go')
    shots=set(int(x) for x in os.environ.get('SHOTS','1,3,9,12,16,24,31,45,55').split(','))
    okcount=0
    for idx,t in enumerate(T):
        pg.wait_for_selector('#card',timeout=5000)
        if idx+1 in shots:
            pg.screenshot(path=f'shot_{idx+1:02d}.png')
        # проверка горизонтальной прокрутки
        sw=pg.evaluate("document.documentElement.scrollWidth")
        if sw>402: errors.append(('hscroll',idx+1,sw))
        if t['kind']=='q':
            if t['type']=='choice':
                pg.click(f'.opt[data-v="{t["a"]}"]')
                pg.click('#chk')
            else:
                ans=t['a'][0]
                pg.fill('#inp',fmt(ans).replace('-','−') if idx%2 else fmt(ans))
                pg.click('#chk')
            pg.wait_for_selector('.fb.ok',timeout=3000)
            okcount+=1
            if idx+1 in shots: pg.screenshot(path=f'shot_{idx+1:02d}b.png')
            pg.click('#nx')
        else:
            if t.get('rev'):
                pg.click('#rvb')
                if idx+1 in shots: pg.screenshot(path=f'shot_{idx+1:02d}b.png')
            pg.click('#nx')
    pg.wait_for_selector('.big',timeout=5000)
    pg.screenshot(path='shot_final.png')
    txt=pg.inner_text('.big')
    print('final pct',txt,'ok answers',okcount)
    br.close()
print('errors:',errors)
