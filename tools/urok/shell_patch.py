# -*- coding: utf-8 -*-
"""Общие правки оболочки уроков tools/urok (подключаются в каждом сборщике build_*.py).

Что делает:
1. fix_fractions: дроби вида 1/2, √3/2, (−1/2) в текстах становятся дробью с горизонтальной чертой.
2. mark_formulas: формулы, найденные LC.finalize() (<span class="nb">), получают цвет; длинные уходят отдельной строкой (класс fm).
3. process_T: применяет 1 и 2 ко всем текстам экранов.
4. patch_shell: кнопка «Назад», кнопка «Шпаргалка» (окно с формулами к текущему месту урока,
   скачивание всей шпаргалки в JPEG и PDF), оформление формул и ключевых слов, замена фразы «Загляни в память».
Использование в сборщике:  import shell_patch as SP; SP.process_T(LC.T); ...; s = SP.patch_shell(s, CHEAT)
"""
import json, re

# ---------------------------------------------------------------- разметка (те же, что в lesson_content)
def _R(s): return f'<span class="rt"><span class="rs" aria-hidden="true"></span><span class="rad">{s}</span></span>'
def _F(a, b): return f'<span class="fr"><span>{a}</span><span>{b}</span></span>'

# числитель: число, буква, корень, число*корень; знаменатель: число или буква
_NUM = r'(?:\d*√\d+|\d+(?:,\d+)?|[A-Za-z])'
_DEN = r'(?:\d+(?:,\d+)?|[A-Za-z])'
_FRAC = re.compile(r'(?<![0-9A-Za-z/])(' + _NUM + r')/(' + _DEN + r')(?![0-9A-Za-z/])')

def _num_html(n):
    m = re.fullmatch(r'(\d*)√(\d+)', n)
    if m: return (m.group(1) or '') + _R(m.group(2))
    return n

def fix_fractions(html):
    """Меняет a/b на дробь с горизонтальной чертой в текстовых узлах (теги и <svg> не трогает)."""
    if not isinstance(html, str) or '/' not in html: return html
    out = []; pos = 0; n = len(html)
    while pos < n:
        if html[pos] == '<':
            if html.startswith('<svg', pos):
                e = html.index('</svg>', pos) + 6
            else:
                e = html.index('>', pos) + 1
            out.append(html[pos:e]); pos = e
        else:
            e = html.find('<', pos); e = n if e < 0 else e
            seg = html[pos:e]
            seg = _FRAC.sub(lambda m: _F(_num_html(m.group(1)), m.group(2)), seg)
            out.append(seg); pos = e
    return ''.join(out)

# ---------------------------------------------------------------- формулы
_OPEN = '<span class="nb">'
_OPS = re.compile(r'[=≠<>≤≥+−·:∥]|&lt;|&gt;')

def _span_end(html, start):
    """Индекс сразу после </span>, закрывающего span, который открывается в позиции start."""
    depth = 0
    for t in re.finditer(r'<span\b|</span>', html[start:]):
        depth += 1 if t.group(0) == '<span' else -1
        if depth == 0: return start + t.end()
    return -1

def mark_formulas(html):
    """nb -> nb fm (отдельной строкой) для длинных формул, остальные остаются в строке, но цветные."""
    if not isinstance(html, str) or _OPEN not in html: return html
    out = []; pos = 0
    while True:
        i = html.find(_OPEN, pos)
        if i < 0: out.append(html[pos:]); break
        e = _span_end(html, i)
        if e < 0: out.append(html[pos:]); break
        inner = html[i + len(_OPEN):e - 7]
        plain = re.sub(r'<[^>]+>', '', inner)
        core = re.sub(r'(\s|&nbsp;)+', '', plain)
        nops = len(_OPS.findall(plain))
        block = nops >= 1 and (len(core) >= 9 or nops >= 2 or 'class="fr"' in inner or 'class="rt"' in inner)
        out.append(html[pos:i])
        if block:
            tail = ''
            m = re.match(r'[.,;:]', html[e:e + 1])
            if m and (e + 1 >= len(html) or html[e + 1] in ' <\n'):
                tail = m.group(0); e += 1
            out.append('<span class="nb fm">' + inner + tail + '</span>')
        else:
            out.append(_OPEN + inner + '</span>')
        pos = e
    return ''.join(out)

def _text(s): return mark_formulas(fix_fractions(s))

def process_T(T):
    """Дроби и формулы во всех текстах экранов. Вызывать после LC.finalize()."""
    # экраны «Старт» и «План урока» ученику не нужны: убираем (номера n остальных не меняются)
    if len(T) > 2 and 'Старт' in T[0].get('kick', '') and 'План' in T[1].get('kick', ''):
        del T[:2]
    for d in T:
        d.pop('cp', None)  # без контрольных игр (царапка, барабан, зарядка)
        if d.get('_sp'): continue
        for k in ('body', 'box', 'q', 'why', 'note', 'trap', 'share'):
            if isinstance(d.get(k), str): d[k] = _text(d[k])
        if d.get('h') and isinstance(d['h'], list): d['h'] = [_text(x) for x in d['h']]
        if d.get('opts'): d['opts'] = [fix_fractions(x) for x in d['opts']]
        if d.get('rev'): d['rev']['html'] = _text(d['rev']['html'])
        if d['kind'] == 'cheat':
            d['rules'] = [_text(x) for x in d['rules']]; d['ex'] = [_text(x) for x in d['ex']]
        d['_sp'] = 1

def process_cheat(cheat):
    """cheat = {'title':..., 'blocks':[{'from':n,'t':...,'items':[{'n':подпись,'f':формула}]}]}
    Формулы шпаргалки всегда идут отдельной строкой; подписи остаются обычным текстом."""
    for b in cheat['blocks']:
        for it in b['items']:
            if it.get('_sp'): continue
            if 'f' in it and it['f']: it['f'] = '<span class="nb fm">' + fix_fractions(it['f']) + '</span>'
            if 'n' in it and it['n']: it['n'] = fix_fractions(it['n'])
            if 'r' in it and it['r']: it['r'] = fix_fractions(it['r'])
            it['_sp'] = 1
    return cheat

# ---------------------------------------------------------------- CSS
CSS = r'''
/* ---- правки уроков: формулы, ключевые слова, навигация, шпаргалка ---- */
.nb{color:var(--amber);font-weight:650}
.stmt b,.rvb b,.chr b,.fbox b,.cs-sec b{color:#ffb48a;font-weight:750;font-size:1.06em}
.stmt .nb.fm,.rvb .nb.fm,.chr .nb.fm,.fbox .nb.fm,.cs-f .nb.fm{display:block;margin:12px 0;padding:10px 14px;max-width:100%;overflow-x:auto;text-indent:0;text-align:left;font-family:var(--display);font-weight:700;font-size:1.3em;line-height:1.55;color:var(--amber);background:rgba(245,220,106,.07);border-left:3px solid var(--apricot);border-radius:12px;white-space:nowrap}
.fbox .nb.fm{background:none;border:0;padding:6px 0;margin:6px 0;font-size:1.08em}
.chr,.fbox,.cs-f{min-width:0;max-width:100%}
.opt .nb{white-space:normal}
.opt>span{min-width:0}
.chr .nb.fm,.fbox .nb.fm{white-space:normal}
.wrap{padding-block-end:112px}
.navbar{position:fixed;left:0;right:0;bottom:0;z-index:30;display:flex;gap:10px;align-items:center;max-width:760px;margin:0 auto;padding:10px 16px calc(10px + env(safe-area-inset-bottom,0px));pointer-events:none;background:linear-gradient(transparent,rgba(20,33,30,.88) 55%)}
.navbar .sp{flex:1}
.nv{pointer-events:auto;display:inline-flex;align-items:center;gap:8px;padding:11px 18px;border-radius:999px;border:1px solid var(--line);background:rgba(27,43,40,.94);color:var(--fg);font-weight:650;font-size:15px;cursor:pointer;box-shadow:0 10px 30px -12px rgba(0,0,0,.7)}
.nv.cs{border-color:rgba(242,144,94,.7);color:#ffb48a}
.nv:active{transform:scale(.97)}
#csov{position:fixed;inset:0;z-index:90;background:rgba(10,18,16,.84);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:grid;place-items:center;padding:14px;animation:enter .25s both}
#csov .csp{width:100%;max-width:600px;max-height:calc(100vh - 28px);max-height:calc(100dvh - 28px);overflow:auto;border-radius:24px;border:1px solid var(--line);background:var(--bg2);padding:20px 20px 24px;box-shadow:0 40px 90px -30px #000}
.cs-head{display:flex;align-items:center;gap:10px;margin-bottom:6px}
.cs-head h2{margin:0;font-family:var(--display);font-size:22px;letter-spacing:-.02em;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent;flex:1}
.cs-x{width:38px;height:38px;border-radius:50%;border:1px solid var(--line);background:var(--glass2);font-size:20px;line-height:1}
.cs-sub{color:var(--muted);font-size:14px;margin:0 0 10px}
.cs-sec{margin:12px 0;padding:14px 16px;border-radius:18px;border:1px solid var(--line);background:var(--glass)}
.cs-sec.now{border-color:rgba(242,144,94,.55);background:rgba(242,144,94,.07)}
.cs-sec h3{margin:0 0 8px;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--amber)}
.cs-it{margin:6px 0}
.cs-n{font-size:15px;color:var(--fg)}
.cs-f{font-size:16px}
.cs-r{margin:8px 0;overflow-x:auto}
.cst{border-collapse:collapse;min-width:0;width:100%;font-size:15px}
.cst th,.cst td{padding:7px 8px;text-align:center;border:1px solid var(--line);vertical-align:middle}
.cst th{color:var(--amber);font-weight:700}
#csx .cst th,#csx .cst td{border-color:#d9d4cb}
#csx .cst th{color:#9a4b05}
.cs-btns{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
.cs-btns .chip{cursor:pointer}
#csx{position:fixed;left:-12000px;top:0;width:794px;padding:44px 48px 40px;background:#fff;color:#1c2b27;font-family:var(--sans);font-size:17px;line-height:1.5;--fg:#1c2b27;--muted:#5d6b66;--apricot:#d9622b;--amber:#b4630a;z-index:-1}
#csx .xh{display:flex;align-items:center;gap:14px;border-bottom:2px solid #d9622b;padding-bottom:12px;margin-bottom:12px}
#csx .xh h1{margin:0;font-size:26px;letter-spacing:-.02em;color:#1c2b27;flex:1}
#csx .xh small{color:#5d6b66;font-size:14px}
#csx .cs-sec{border:1px solid #d9d4cb;background:#faf7f2;margin:12px 0;padding:12px 16px;break-inside:avoid}
#csx .cs-sec h3{color:#b4630a}
#csx .cs-n{color:#1c2b27}
#csx .nb,#csx .cs-f .nb.fm{color:#9a4b05}
#csx .cs-f .nb.fm{background:#fff3e3;border-left:3px solid #d9622b;overflow:visible}
#csx b{color:#c2410c}
#csx .xf{margin-top:14px;color:#5d6b66;font-size:13px;text-align:right}
@media print{body>*:not(#csx){display:none!important}#csx{position:static;width:auto}}
'''

# ---------------------------------------------------------------- JS
JS = r'''
/* ---------- правки уроков: назад, шпаргалка, выгрузка ---------- */
const CHEAT=__CHEAT__;
function csBlockIdx(){const n=(L[Math.min(S.i,L.length-1)]||{}).n||1;let k=0;CHEAT.blocks.forEach((b,i)=>{if(b.from<=n)k=i});return k}
function navHTML(){
  const back=(!S.done&&S.i>0)?'<button class="nv back" id="navb" aria-label="Назад на предыдущий экран">← Назад</button>':'';
  return `<div class="navbar">${back}<span class="sp"></span><button class="nv cs" id="csb" aria-label="Открыть шпаргалку">Шпаргалка</button></div>`;
}
function bindNav(){
  const b=document.getElementById('navb');if(b)b.onclick=goBack;
  const c=document.getElementById('csb');if(c)c.onclick=()=>{sfx.tap();openCheat()};
}
function goBack(){if(S.done||S.i<=0)return;closeCheat();sfx.tap();S.i--;save();renderTask()}
function csSec(b,now){return `<section class="cs-sec${now?' now':''}"><h3>${b.t}</h3>${b.items.map(it=>`<div class="cs-it">${it.n?`<div class="cs-n">${it.n}</div>`:''}${it.f?`<div class="cs-f">${it.f}</div>`:''}${it.r?`<div class="cs-r">${it.r}</div>`:''}</div>`).join('')}</section>`}
function openCheat(){
  closeCheat();
  const bi=csBlockIdx(),cur=CHEAT.blocks[bi];
  const o=document.createElement('div');o.id='csov';
  o.innerHTML=`<div class="csp" role="dialog" aria-modal="true" aria-label="Шпаргалка"><div class="cs-head"><h2>Шпаргалка</h2><button class="cs-x" id="csx_close" aria-label="Закрыть">×</button></div>
    <p class="cs-sub">${esc(CHEAT.title)}. Сейчас: ${cur.t}</p>
    <div id="csbody">${csSec(cur,true)}</div>
    <div class="cs-btns"><button class="chip" id="csall">Показать всю шпаргалку</button><button class="chip" id="csjpg">Скачать JPEG</button><button class="chip" id="cspdf">Скачать PDF</button></div>
    <p class="note" id="csmsg"></p></div>`;
  document.body.appendChild(o);document.body.style.overflow='hidden';
  o.onclick=e=>{if(e.target===o)closeCheat()};
  document.getElementById('csx_close').onclick=closeCheat;
  const all=document.getElementById('csall');let shown=false;
  all.onclick=()=>{shown=!shown;document.getElementById('csbody').innerHTML=shown?CHEAT.blocks.map((b,i)=>csSec(b,i===bi)).join(''):csSec(cur,true);all.textContent=shown?'Только это место урока':'Показать всю шпаргалку';sfx.tap()};
  document.getElementById('csjpg').onclick=()=>csExport('jpg');
  document.getElementById('cspdf').onclick=()=>csExport('pdf');
  document.addEventListener('keydown',csKey);
}
function csKey(e){if(e.key==='Escape')closeCheat()}
function closeCheat(){const o=document.getElementById('csov');if(o)o.remove();document.body.style.overflow='';document.removeEventListener('keydown',csKey)}
function csMsg(t){const m=document.getElementById('csmsg');if(m)m.textContent=t}
function csLoad(cb){
  if(window.html2canvas)return cb(true);
  const s=document.createElement('script');s.src='tools/html2canvas.min.js?v=1';s.onload=()=>cb(!!window.html2canvas);s.onerror=()=>cb(false);document.head.appendChild(s);
}
function csFixRad(doc){
  doc.querySelectorAll('.rt .rs').forEach(e=>{
    const ns='http://www.w3.org/2000/svg',sv=doc.createElementNS(ns,'svg');
    sv.setAttribute('viewBox','0 0 10 20');sv.setAttribute('preserveAspectRatio','none');
    sv.setAttribute('style','width:.62em;flex:none;align-self:stretch;height:auto;min-height:1em;color:inherit;overflow:visible');
    const p=doc.createElementNS(ns,'path');
    p.setAttribute('d','M0.5 11.5 L2.6 10.2 L5.4 19 L9.6 0.8 L10 0.8');p.setAttribute('fill','none');p.setAttribute('stroke','#1c2b27');
    p.setAttribute('stroke-width','1.5');p.setAttribute('vector-effect','non-scaling-stroke');p.setAttribute('stroke-linejoin','round');
    sv.appendChild(p);e.replaceWith(sv);
  });
  doc.querySelectorAll('.rt .rad').forEach(e=>{e.style.borderTopColor='#1c2b27'});
  doc.querySelectorAll('.fr>span:first-child').forEach(e=>{e.style.borderBottomColor='#1c2b27'});
}
function csBuildX(){
  let x=document.getElementById('csx');if(x)x.remove();
  x=document.createElement('div');x.id='csx';
  x.innerHTML=`<div class="xh">${logoFull(40)}<div><h1>Шпаргалка</h1><small>${esc(CHEAT.title)}</small></div></div>${CHEAT.blocks.map(b=>csSec(b,false)).join('')}<div class="xf">lilimath.ru · lili.math</div>`;
  document.body.appendChild(x);return x;
}
function csDownload(blob,name){
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),20000);
}
function csPdf(canvas){
  const W=canvas.width,PH=Math.round(W*297/210),pages=Math.max(1,Math.ceil(canvas.height/PH)),imgs=[];
  for(let k=0;k<pages;k++){
    const c=document.createElement('canvas');c.width=W;c.height=PH;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,W,PH);
    g.drawImage(canvas,0,k*PH,W,Math.min(PH,canvas.height-k*PH),0,0,W,Math.min(PH,canvas.height-k*PH));
    const b=atob(c.toDataURL('image/jpeg',.92).split(',')[1]),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);imgs.push(u);
  }
  const enc=new TextEncoder(),parts=[],offs=[];let len=0;
  const put=x=>{const u=typeof x==='string'?enc.encode(x):x;parts.push(u);len+=u.length};
  const obj=(n,fn)=>{offs[n]=len;put(n+' 0 obj\n');fn();put('\nendobj\n')};
  put('%PDF-1.4\n');
  obj(1,()=>put('<</Type/Catalog/Pages 2 0 R>>'));
  obj(2,()=>put('<</Type/Pages/Count '+pages+'/Kids['+imgs.map((_,k)=>(3+k*3)+' 0 R').join(' ')+']>>'));
  imgs.forEach((u,k)=>{
    const p=3+k*3;
    obj(p,()=>put('<</Type/Page/Parent 2 0 R/MediaBox[0 0 595.28 841.89]/Resources<</XObject<</Im0 '+(p+2)+' 0 R>>>>/Contents '+(p+1)+' 0 R>>'));
    const cs='q 595.28 0 0 841.89 0 0 cm /Im0 Do Q';
    obj(p+1,()=>put('<</Length '+cs.length+'>>\nstream\n'+cs+'\nendstream'));
    obj(p+2,()=>{put('<</Type/XObject/Subtype/Image/Width '+W+'/Height '+PH+'/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length '+u.length+'>>\nstream\n');put(u);put('\nendstream')});
  });
  const n=3+pages*3,xr=len;
  put('xref\n0 '+n+'\n0000000000 65535 f \n');
  for(let i=1;i<n;i++)put(String(offs[i]).padStart(10,'0')+' 00000 n \n');
  put('trailer\n<</Size '+n+'/Root 1 0 R>>\nstartxref\n'+xr+'\n%%EOF');
  return new Blob(parts,{type:'application/pdf'});
}
function csExport(kind){
  csMsg('Готовлю файл…');
  csLoad(ok=>{
    if(!ok){csMsg('Не удалось загрузить модуль. Открою печать: выбери «Сохранить как PDF».');csBuildX();setTimeout(()=>window.print(),300);return}
    const x=csBuildX();
    window.html2canvas(x,{scale:2,backgroundColor:'#ffffff',useCORS:true,logging:false,onclone:csFixRad}).then(cv=>{
      const name='shpargalka-'+(TOPIC.id||'urok');
      if(kind==='jpg')cv.toBlob(b=>{csDownload(b,name+'.jpg');csMsg('Готово: файл JPEG сохранён.')},'image/jpeg',.92);
      else{csDownload(csPdf(cv),name+'.pdf');csMsg('Готово: файл PDF сохранён.')}
      x.remove();
    }).catch(()=>{x.remove();csMsg('Не получилось собрать файл. Сделай скриншот шпаргалки.')});
  });
}
'''

# ---------------------------------------------------------------- применение к оболочке
def _once(s, old, new):
    assert s.count(old) == 1, ('not unique/found', old[:70], s.count(old))
    return s.replace(old, new)

def patch_shell(s, cheat):
    cheat = process_cheat(cheat)
    # 0. фраза
    if 'Загляни в память.' in s:
        s = s.replace('Загляни в память.', 'Вспомни, как мы это разбирали.')
    assert 'Загляни в память' not in s
    # 0b. без игровых элементов: нет стикеров и счётчика стикеров, нет награды за серию (контрольные игры снимает process_T)
    s = s.replace('    <span class="pill" title="Стикеры">стикеры <strong>${S.stk.length}</strong></span>\n', '')
    if 'function streakDrop(){return;' not in s:
        s = _once(s, 'function streakDrop(){\n', 'function streakDrop(){return;\n')
    # 1. CSS
    s = _once(s, '</head>', '<style>' + CSS + '</style></head>')
    # 2. нижняя панель на всех экранах урока (topbar() вызывается везде, bindTop() после отрисовки)
    s = _once(s, "}).join('')}</div></div>`;\n}\nfunction bindTop(){",
              "}).join('')}</div></div>`+navHTML();\n}\nfunction bindTop(){bindNav();")
    # 3. повторный заход на уже решённый вопрос: показываем разбор
    s = _once(s, "  }else{\n    if(fb)h+=fb;\n    if(r.st!=='ok'&&t.back!=null)",
              "  }else{\n    if(fb)h+=fb;else h+=revisitBox(t,r);\n    if(r.st!=='ok'&&t.back!=null)")
    # 4. код
    js = JS.replace('__CHEAT__', json.dumps(cheat, ensure_ascii=False))
    js += r'''
function revisitBox(t,r){
  const ttl=r.st==='ok'?'Ты ответил(а) верно':r.st==='bad'?'Тут не сошлось':r.st==='idk'?'Тут было «не знаю»':'Тут была идея';
  return `<div class="fb ${r.st==='ok'?'ok':'neu'}"><div class="ic">${r.st==='ok'?I.ok:I.q}</div><div><div class="t">${ttl}</div><div class="s">Разбор: ${t.why}</div></div></div>`;
}
'''
    s = _once(s, '/* ---------- boot ---------- */', js + '\n/* ---------- boot ---------- */')
    return s
