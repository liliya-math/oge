import re,sys
sys.path.insert(0,'tools/oshibki')
src=open('diagnostika-6-klass.html',encoding='utf8').read()
tasks=open('tools/oshibki/tasks.js',encoding='utf8').read()
check=open('tools/oshibki/check.js',encoding='utf8').read()
OUT='diagnostika-oshibki-5-9.html'
def rep(a,b,cnt=1):
    global src
    assert src.count(a)>=1,('missing',a[:70])
    if cnt: assert src.count(a)==cnt,('count',a[:70],src.count(a))
    src=src.replace(a,b)
TITLE='Диагностика · Типичные ошибки 5–9'
i=src.index('const T = [');j=src.index('\n];',i)+3
src=src[:i]+check+'\n'+tasks+src[j:]
rep('Диагностика · 6 класс',TITLE,0)
rep("branch:'диагностика 6 класс'","branch:'диагностика типичные ошибки'")
rep("const LEAD=!LINK.name||!!LINK.lead;","const LEAD=false;")
rep("const L=T.filter(t=>!(LINK.mask&(1<<(t.n-1))));\nconst FULL=L.length===T.length;","let L=T.slice();\nconst FULL=false;\nfunction applyCls(){L=T.filter(t=>!S.cls||!S.cls.length||S.cls.includes(t.cls))}")
rep("if(LINK.name)S.name=LINK.name;","if(LINK.name)S.name=LINK.name;\nif(!S.cls)S.cls=[];\napplyCls();")
rep("https://lilimath.ru/diagnostika-6-klass.html","https://lilimath.ru/"+OUT)
rep("diag6a-","oshibki59-",0)
rep("const BLK = {b:'Разминка',m:'Испытание',h:'Вызов'};","const BLK = {b:'5–6 класс',m:'7 класс',h:'8–9 класс'};")
rep("const BN={b:'разминка',m:'испытание',h:'вызов'};","const BN={b:'5–6 классы',m:'7 класс',h:'8–9 классы'};")
# css
rep("\n</style>","""\n.track{gap:0}.track span{border-radius:0;height:5px}
.figbox{display:flex;justify-content:center;margin:6px 0 12px}.figbox svg{background:#EEE0C8;border-radius:12px;padding:6px;max-width:100%;height:auto}
.subq{margin:8px 0 0;padding-left:26px;display:grid;gap:8px;font-size:18px}.subq li::marker{color:var(--muted)}
.subs{display:grid;gap:10px}.sub{display:flex;align-items:center;gap:10px}.sub b{min-width:24px;color:var(--muted)}.sub .field{flex:1;min-width:0}
.symbar{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.symbar button{min-width:44px;height:40px;border-radius:12px;border:1px solid var(--line);background:rgba(0,0,0,.2);color:var(--fg);font-size:18px;cursor:pointer}
.fr{display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;line-height:1.15;margin:0 2px;font-size:.92em}.fr>span:first-child{border-bottom:1.5px solid currentColor;padding:0 3px}.fr>span:last-child{padding:0 3px}
.rt{display:inline-flex;align-items:flex-end}.rs{font-size:1.1em}.rv{border-top:1.5px solid currentColor;padding:0 3px;margin-top:2px;margin-left:-1px}
.clsrow{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:4px 0 14px}.clsrow .lab{width:100%}.clsb{opacity:.45}.clsb.sel{opacity:1;outline:2px solid var(--gold,#E2B04A)}
.weak{display:grid;gap:10px;margin-top:20px}.weak h3{margin:0;font-size:17px}.weak .wt{padding:12px 14px;border-radius:16px;background:rgba(0,0,0,.2);border:1px solid var(--line)}.weak .wt b{display:block;margin-bottom:4px}.weak .wt div{font-size:15px;color:var(--muted);line-height:1.5}
</style>""")
# answer UI
rep("function answerUI(t){\n","function answerUI(t){\n  if(t.type==='sub')return `<div class=\"subs\">${t.subs.map((s,i)=>`<label class=\"sub\"><b>${i+1})</b><input class=\"field sinp\" autocomplete=\"off\" autocapitalize=\"off\" spellcheck=\"false\" placeholder=\"Ответ\"></label>`).join('')}</div>${t.sym?`<div class=\"symbar\">${[...t.sym].map(c=>`<button type=\"button\" class=\"sym\" data-c=\"${c}\">${c}</button>`).join('')}</div>`:''}<div class=\"irow\"><div class=\"sp\"></div><button class=\"btn\" id=\"chk\">Проверить</button></div>`;\n")
rep("  const chk=$('chk'),inp=$('inp');\n","""  const chk=$('chk'),inp=$('inp');
  const sins=[...document.querySelectorAll('.sinp')];
  if(sins.length){let last=sins[0];sins.forEach((el,k)=>{el.onfocus=()=>{last=el};el.onkeydown=e=>{if(e.key==='Enter'){k<sins.length-1?sins[k+1].focus():chk.click()}}});sins[0].focus({preventScroll:true});
    document.querySelectorAll('.sym').forEach(b=>b.onmousedown=e=>e.preventDefault());
    document.querySelectorAll('.sym').forEach(b=>b.onclick=()=>{const el=last,p=el.selectionStart??el.value.length;el.value=el.value.slice(0,p)+b.dataset.c+el.value.slice(p);el.focus();const q=p+1;try{el.setSelectionRange(q,q)}catch(e){}})}
""")
# keepInput wrapper
rep("function keepInput(fn){","function keepInput(fn){const sv=[...document.querySelectorAll('.sinp')].map(i=>i.value);keepInput0(fn);document.querySelectorAll('.sinp').forEach((i,k)=>{i.value=sv[k]||''})}\nfunction keepInput0(fn){")
# check
rep("  if(t.type==='choice'){if(!choice)return;given=String(choice);ok=choice===t.a}","""  if(t.type==='sub'){const ins=[...document.querySelectorAll('.sinp')],vals=ins.map(i=>i.value.trim());const empty=vals.findIndex(v=>!v);if(empty>=0){ins[empty].focus();ins[empty].classList.remove('shake');void ins[empty].offsetWidth;ins[empty].classList.add('shake');return}
    given=vals.join(' | ');const res=t.subs.map((s,i)=>okSub(t,s,vals[i]));ok=res.every(Boolean);badNote=res.map((x,i)=>x?'':(i+1)+')').filter(Boolean).join(', ')}
  else if(t.type==='choice'){if(!choice)return;given=String(choice);ok=choice===t.a}""")
rep("let mode='ans',","let badNote='',mode='ans',")
rep("drawAnsKeep(fbBox('bad',I.x,'Не сходится',shownHints<2?'Проверь вычисления или возьми подсказку. Осталась одна попытка.':'Проверь вычисления. Осталась одна попытка.'));","drawAnsKeep(fbBox('bad',I.x,'Не сходится',(badNote?'Проверь пункты: '+badNote+'. ':'')+(shownHints<2?'Подумай ещё или возьми подсказку. Осталась одна попытка.':'Осталась одна попытка.')));")
rep("S.i%4===0","S.i%10===0")
# start screen
rep("${S.name?esc(S.name)+', п':'П'}роверим, что ты <span>уже знаешь</span>","${S.name?esc(S.name)+', н':'Н'}айдём, где <span>прячутся ошибки</span>")
i=src.index('<p class="lead">Сегодня проверим');j=src.index('</p>',i)+4
src=src[:i]+'<p class="lead">Короткие карточки по темам 5–9 классов: в каждой три маленьких задания. Не бойся ошибаться: так мы найдём, над чем стоит поработать до разбора заданий ОГЭ. Незнакомое задание — это нормально: жми «Не знаю, как решать». Угадывать не нужно.</p>'+src[j:]
rep("Вписываешь число или выбираешь вариант. Есть две попытки.","Вписываешь ответы на три пункта и жмёшь «Проверить». Есть две попытки.")
rep('<span class="pill">около 70 минут</span>','<span class="pill">около минуты на карточку</span>')
rep("""      <div class="startrow">${S.name?'':`<input class="field" id="nm\"""","""      <div class="clsrow"><span class="lab">Какие классы проверяем?</span>${[5,6,7,8,9].map(k=>`<button class="chip clsb sel" data-k="${k}">${k} класс</button>`).join('')}</div>
      <div class="startrow">${S.name?'':`<input class="field" id="nm\"""")
rep("go.onclick=()=>{ac();if(!resume){","document.querySelectorAll('.clsb').forEach(b=>b.onclick=()=>{b.classList.toggle('sel');sfx.tap()});\n  go.onclick=()=>{ac();if(!resume){const cs=[...document.querySelectorAll('.clsb.sel')].map(b=>+b.dataset.k);if(!cs.length)return;S.cls=cs.length===5?[]:cs;applyCls();")
rep("const rs=document.getElementById('reset');if(rs)rs.onclick=()=>{const keep=S.sound;S=fresh();","const rs=document.getElementById('reset');if(rs)rs.onclick=()=>{const keep=S.sound;S=fresh();S.cls=[];applyCls();")
rep("document.getElementById('again').onclick=()=>{const keep=S.sound;S=fresh();","document.getElementById('again').onclick=()=>{const keep=S.sound;S=fresh();S.cls=[];applyCls();")
# finish
rep("диагностика пройдена","диагностика пройдена")
rep("""      <div class="lvl">Общий итог <em>${LVW[sc.all]}</em></div>\n""","")
rep("""      ${S.skipH?'<p class="lvltext">Задания уровня «Вызов» в этот раз пропускаем: сначала укрепим базу (разминку).</p>':''}\n""","")
i=src.index('    <div class="grid25">');j=src.index('    ${diploma(sc,cnt.ok,own,t)}')
src=src[:i]+"    <div class=\"blocks\">${[5,6,7,8,9].filter(k=>L.some(x=>x.cls===k)).map(k=>{const a=L.filter(x=>x.cls===k),g=a.filter(x=>S.r[x.n]&&S.r[x.n].st==='ok').length;return `<div class=\"blk\"><div class=\"h\">${k} класс<b>${g}/${a.length}</b></div>${bar(g,a.length)}</div>`}).join('')}</div>\n    ${weakBlock()}\n"+src[j:]
rep("function finish(){","""function weakBlock(){
  const w=L.filter(t=>!(S.r[t.n]&&S.r[t.n].st==='ok'));
  if(!w.length)return '<p class="quiet" style="margin-top:18px">Ошибок не нашли: все карточки решены верно.</p>';
  const g={};w.forEach(t=>{const k=t.topic+' · '+t.cls+' кл.';(g[k]=g[k]||[]).push(t)});
  return '<div class="weak"><h3>Над чем стоит поработать</h3>'+Object.keys(g).map(k=>`<div class="wt"><b>${esc(k)}</b><div>${g[k].map(t=>LB(t)+' — '+esc(t.err)).join('<br>')}</div></div>`).join('')+'</div>';
}
function finish(){""")
rep("blocks\">${blk('b','Разминка (1–10)')}","XX",0) if False else None
# report
i=src.index("   `Разминка (1–10):");j=src.index("`Лучшая серия: ${S.best}`")
src=src[:i]+"   'По классам: '+[5,6,7,8,9].filter(k=>L.some(t=>t.cls===k)).map(k=>{const a=L.filter(t=>t.cls===k);return k+' кл. '+a.filter(t=>S.r[t.n]&&S.r[t.n].st==='ok').length+'/'+a.length}).join(' · '),"+src[j:]
rep("FULL?`Вариант: все задания (${T.length})`:`Вариант: ${ZD(L.length)} (${L.map(LB).join(', ')})`","`Классы: ${S.cls&&S.cls.length?S.cls.join(', '):'все'} · карточек: ${L.length}`")
rep("let s=`${LB(t)}. ${S.skipH&&t.blk==='h'?'пропущено':(Lb[r.st]||'—')}`;","let s=`${LB(t)} (${t.cls} кл.) ${Lb[r.st]||'—'}`;")
rep("    if(r.hints)s+=`, подсказок: ${r.hints}`;","    if(r.hints)s+=`, подсказок: ${r.hints}`;\n    if(r.st!=='ok')s+=`, типичная ошибка: ${t.err}`;")
rep("`Верно: ${sc.ok} из ${sc.auto} (${sc.pct}%)${sc.pending?' · №22 (доказательство) на ручную проверку':''}`","`Верно карточек: ${sc.ok} из ${sc.auto} (${sc.pct}%)`")
rep("`Баллы: ${sc.pts} из ${sc.max}${sc.pending?' (без №22, до 2 баллов после проверки)':''}`,","")
rep("за честно пройденную диагностику · 6 класс","за честно пройденную диагностику · типичные ошибки")
rep("диагностику за 6 класс","диагностику по типичным ошибкам",0)
rep("<div class=\"quiet\">верных ответов${sc.pending?' · доказательство №22 проверю сама':''}</div>","<div class=\"quiet\">карточек решено верно</div>")
rep("верных заданий: ${cnt.ok} из ${sc.auto}","верных карточек: ${cnt.ok} из ${sc.auto}")
i=src.index("  if(S.i<L.length&&L[S.i].blk==='h'&&!S.skipH)");j=src.index('\n',i)
src=src[:i]+src[j+1:]
rep("game=GAMES[(k/4-1)%GAMES.length]","game=GAMES[(k/10-1)%GAMES.length]")
rep("\n</style>","\n.num{font-size:30px;min-width:74px}\n</style>")
src=re.sub(r'стикеры за каждые \d+ задани\w+','стикеры и игры за каждые 10 карточек',src)
open(OUT,'w',encoding='utf8').write(src)
left=[m.start() for m in re.finditer('иагност|25 заданий|№22|Разминка|Вызов|Испытание',src)]
print('left:',[src[max(0,k-40):k+40].replace('\n',' ') for k in left][:20])
print(len(src))
