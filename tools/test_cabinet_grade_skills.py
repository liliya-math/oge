import json, subprocess, time, sys, os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
"""Браузерный тест карточки «Карта по классам» в kabinet.html (ученик и учитель, API подменён). Запуск: python3 tools/test_cabinet_grade_skills.py (нужен playwright для Python)."""
from playwright.sync_api import sync_playwright
srv=subprocess.Popen(['python3','-m','http.server','8765'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(1)
errs=[]; posts=[]

HTML=open(ROOT+'/kabinet.html',encoding='utf-8').read().replace('\nstart();\n','\nwindow.__t={demoData:()=>demoData(),D:()=>D,S:()=>S};\nstart();\n',1)
def hooked(ctx):
    ctx.route('http://localhost:8765/kabinet.html',lambda r:r.fulfill(status=200,content_type='text/html; charset=utf-8',body=HTML))
ok=lambda c,m:(print(('OK   ' if c else 'FAIL ')+m), None if c else errs.append(m))
try:
  with sync_playwright() as p:
    b=p.chromium.launch(); 
    # --- ученик, демо
    # --- ученик, живой режим со стабом
    ctx0=b.new_context(); hooked(ctx0); pg=ctx0.new_page(); logs=[]; pg.on('pageerror',lambda e:logs.append(str(e)))
    bctx=b.new_context(); hooked(bctx); boot=bctx.new_page(); boot.goto('http://localhost:8765/kabinet.html#demo'); boot.wait_for_timeout(1200)
    demo=boot.evaluate('JSON.stringify(window.__t.demoData())'); boot.close()
    ds=json.loads(demo); ds['demo']=False; ds['code']='abc123'; ds['show']=['work','map','skills','exams','grades']
    pg.route('https://script.google.com/**',lambda r:r.fulfill(status=200,headers={'access-control-allow-origin':'*','content-type':'application/json'},body=json.dumps(ds)))
    pg.goto('http://localhost:8765/kabinet.html#abc123'); pg.wait_for_timeout(1500); pg.get_by_text('Прогресс',exact=True).first.click(); pg.wait_for_selector('#gskills',timeout=8000)
    ok(pg.locator('#gskills .gtab').count()==2,'ученик: вкладки только с отметками (7A, 8A)')
    ok(pg.locator('#gskills .gtab[aria-pressed="true"]').inner_text().startswith('7 класс'),'ученик: открыта первая вкладка с отметками')
    ok(pg.locator('#gskills .gkr').count()==3,'ученик: 3 отмеченных навыка в 7A')
    ok(pg.locator('#gskills button.gkr').count()==0,'ученик: строки не кликабельны')
    pg.locator('#gskills .gtab',has_text='8 класс').click()
    ok(pg.locator('#gskills .gkr').count()==1,'ученик: вкладка 8A, 1 навык')
    ok(pg.locator('#skills').count()==1,'ОГЭ-карта на месте')
    ok(not logs,'ученик: нет ошибок страницы '+str(logs))
    # --- учитель со стабом
    d=json.loads(demo); d['demo']=False; d['code']='abc123'
    ctx=b.new_context(); hooked(ctx); ctx.add_init_script("localStorage.setItem('cab-admin','x')")
    pt=ctx.new_page(); tl=[]; pt.on('pageerror',lambda e:tl.append(str(e)))
    def api(route):
        req=route.request
        if req.method=='OPTIONS': return route.fulfill(status=204,headers={'access-control-allow-origin':'*','access-control-allow-headers':'*'})
        body=json.loads(req.post_data or '{}'); posts.append(body)
        if body.get('op')=='skill':
            d.setdefault('skills',{}); 
            if body['s']=='new': d['skills'].pop(body['n'],None)
            else: d['skills'][body['n']]={'s':body['s'],'d':'2026-10-27'}
        route.fulfill(status=200,headers={'access-control-allow-origin':'*','content-type':'application/json'},body=json.dumps({'ok':True,'d':d}))
    pt.route('https://script.google.com/**',api)
    pt.goto('http://localhost:8765/kabinet.html#lilia-abc123'); pt.wait_for_selector('#gskills',timeout=8000)
    ok(pt.locator('#gskills .gtab').count()==10,'учитель: 10 вкладок')
    pt.locator('#gskills .gtab',has_text='7 класс · алгебра').click()
    det=pt.locator('details.gkgrp[data-gb="7A.4"]')
    ok(det.get_attribute('open') is not None,'учитель: раздел с пробелом открыт сам')
    pt.locator('#gskills button.gkr[data-gk="7A.4.2.1"]').click()
    pt.locator('#gskills button.gkr[data-gk="7A.4.2.5"]').click()
    ok('Умножать многочлен на многочлен' in pt.locator('#gdet').inner_text(),'учитель: детали навыка открылись')
    ok(pt.locator('#gdet .gc[data-gc="7A.4.2.4"]').count()==1,'учитель: есть кнопка спуска на 7A.4.2.4')
    pt.locator('#gdet .gst.solid').click(); pt.wait_for_timeout(400)
    ok(any(x.get('op')=='skill' and x.get('n')=='7A.4.2.5' and x.get('s')=='solid' for x in posts),'учитель: отметка ушла на сервер с ID 7A.4.2.5')
    ok(pt.locator('#gskills button.gkr[data-gk="7A.4.2.5"].solid').count()==1,'учитель: строка стала зелёной после ответа')
    pt.locator('#gdet .gc[data-gc="7A.4.2.4"]').click()
    ok(pt.evaluate('window.__t.S().gk')=='7A.4.2.4','учитель: спуск по предварительному навыку')
    ok(pt.locator('#skills').count()==1,'ОГЭ-карта у учителя на месте')
    ok(not tl,'учитель: нет ошибок страницы '+str(tl))
    b.close()
finally: srv.terminate()
print('ИТОГО ошибок:',len(errs)); sys.exit(1 if errs else 0)
