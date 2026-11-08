(async function(){
'use strict';const U=LiliQuizUI,$=id=>document.getElementById(id),p=new URLSearchParams(location.search),demo=p.get('demo')==='1';
const code=p.get('lili_student')||'',work=p.get('q')||'',version=Number(p.get('v')),assignment=p.get('a')||'',row=Number(p.get('lili_hw'));
const back=code?'kabinet.html#'+encodeURIComponent(code):'kabinet.html';$('back').href=demo?'quiz-builder.html':back;
let d,history=[],state={answers:{},start:0,submission:'',pending:null,hints:{},idk:{}},submitting=false,deadline=0,ticker=0;
const lim=()=>LiliQuiz.limited(d.kind),full=()=>history.length>=LiliQuiz.tries(d.kind);
const key='lili-quiz:'+code+':'+assignment+':'+work+':'+version;
function uuid(){return crypto.randomUUID?crypto.randomUUID():Array.from(crypto.getRandomValues(new Uint8Array(24)),v=>v.toString(16).padStart(2,'0')).join('');}
function save(){try{localStorage.setItem(key,JSON.stringify(state));return true;}catch(_){return false;}}
function notice(title,text){$('app').innerHTML='<h1>'+U.esc(title)+'</h1><p class="muted">'+U.esc(text)+'</p><a class="qbtn secondary" href="'+U.esc(back)+'">В кабинет</a>';}
function count(){return d.tasks.filter(q=>String(state.answers[q.n]||'').trim()||state.idk[q.n]).length;}
function markIdk(n){const b=document.querySelector('[data-idk="'+n+'"]');if(!b)return;const on=!!state.idk[n];b.setAttribute('aria-pressed',on);b.textContent=on?'Не знаю (отменить)':'Не знаю';}
function update(){const n=count();$('count').textContent='Заполнено '+n+' из '+d.tasks.length;$('progress').value=n;}
function show(){
$('app').innerHTML='<div class="run-head"><span class="eyebrow">'+U.esc(d.section)+'</span><h1>'+U.esc(d.title)+'</h1>'+(lim()?'<p class="muted">Одна попытка, подсказок нет. После отправки ты увидишь только балл.</p>':'<p class="muted">Решай в тетради и вводи ответы здесь. Каждая завершённая попытка сохранится в кабинете.</p>')+(demo?'<div class="notice">Демонстрация. Результат не отправляется в кабинет.</div>':'')+'<div class="between"><span class="tag">Заданий: '+d.tasks.length+' · баллов: '+d.tasks.reduce((s,q)=>s+q.points,0)+'</span>'+(lim()?'':'<span class="note">'+(history.length?'Попытка '+(history.length+1):'Первая попытка')+'</span>')+'</div><progress id="progress" max="'+d.tasks.length+'" value="0" aria-label="Заполнено ответов"></progress></div><div id="questions">'+d.tasks.map(q=>U.taskHTML(q,false,state.answers[q.n],{idk:d.kind==='hw'})).join('')+'</div><p class="error" id="error" role="alert"></p><div class="quiz-footer"><span class="note" id="count"></span><button id="submit">Завершить</button></div>'+(history.length?U.historyHTML(history):'');
U.math($('app'));update();document.querySelectorAll('.qfig').forEach(i=>{i.title='Нажми, чтобы увеличить';i.onclick=()=>U.zoom(i.src);i.insertAdjacentHTML('afterend','<p class="muted" style="margin:-6px 0 10px;font-size:13px">Нажми на рисунок, чтобы увеличить</p>');});
document.querySelectorAll('[data-answer]').forEach(el=>{el.oninput=()=>{if(!state.start)state.start=Date.now();state.answers[el.dataset.answer]=el.value;if(state.idk[el.dataset.answer]){state.idk[el.dataset.answer]=false;markIdk(el.dataset.answer);}if(!save())$('error').textContent='Черновик не сохранился в браузере. Не закрывай страницу до отправки.';update();};});
document.querySelectorAll('details[data-hint]').forEach(el=>{el.ontoggle=()=>{if(el.open&&!state.hints[el.dataset.hint]){state.hints[el.dataset.hint]=1;save();}};});
document.querySelectorAll('[data-idk]').forEach(b=>{markIdk(b.dataset.idk);b.onclick=()=>{const n=b.dataset.idk;state.idk[n]=!state.idk[n];if(state.idk[n]){state.answers[n]='';document.querySelectorAll('[data-answer="'+n+'"]').forEach(e=>{if(e.type==='radio')e.checked=false;else e.value='';});}if(!state.start)state.start=Date.now();save();markIdk(n);update();};});
$('submit').onclick=()=>submit();
if(state.pending){document.querySelectorAll('[data-answer],[data-idk]').forEach(e=>e.disabled=true);$('error').textContent='Предыдущая отправка ещё не подтверждена. Нажми «Повторить отправку» - повторная запись не создастся.';$('submit').textContent='Повторить отправку';}
}
function result(r,synced){
const current={work:d.id,version:d.version,assignment,submission:r.submission,at:r.at,title:d.title,section:d.section,kind:d.kind||'free',hints:(r.hints||[]).length,idk:(r.idk||[]).length,score:r.score,max:r.max};if(!history.some(x=>x.submission===r.submission))history.push(current);
const L=lim(),list=!L&&r.tasks&&r.tasks.length;
$('app').innerHTML='<span class="eyebrow">'+(demo?'Демонстрация':'Попытка сохранена в кабинете')+'</span><h1>'+(L?'Работа сдана':'Работа завершена')+'</h1><div class="score">'+r.score+' <small>/ '+r.max+'</small></div><p class="muted">'+Math.round(r.score/r.max*100)+'% выполнения</p>'+(synced===false?'<p class="notice">Результат сохранён. Статус карточки домашки пока не обновился.</p>':'')+'<div class="actions">'+(full()?'':'<button id="again">Пройти ещё раз (последняя попытка)</button>')+'<a class="qbtn secondary" href="'+U.esc(demo?'quiz-builder.html':back)+'">'+(demo?'В конструктор':'В кабинет')+'</a></div>'+(list?'<section class="panel"><h2>По заданиям</h2><div class="test-list">'+r.tasks.map(q=>'<div><span class="'+(q.ok?'success':'error')+'">'+(q.ok?'✓':'○')+' Задание '+q.n+'</span> · '+q.points+' б.</div>').join('')+'</div><p class="note">Разбери ошибки, затем попробуй ещё раз. Новая попытка добавится в историю.</p></section>':(L?'<p class="note">Подробный разбор получит преподаватель. Обсудим на занятии.</p>':''))+U.historyHTML(history);
if($('again'))$('again').onclick=()=>{state={answers:{},start:0,submission:uuid(),pending:null,hints:{},idk:{}};save();enter();window.scrollTo(0,0);};
window.scrollTo(0,0);
}
const fmt=ms=>{const s=Math.ceil(ms/1000);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};
async function fetchStart(){
if(demo){deadline=Date.now()+d.time*60000;return;}
const j=await U.request({t:code,quiz:{start:1,work,version,assignment,row,submission:state.submission}});
if(!j.started||!j.work||!Array.isArray(j.work.tasks))throw new Error('Сервер не подтвердил начало работы. Повтори.');
d.tasks=j.work.tasks;deadline=Date.now()+Number(j.msLeft||0);
}
function clock(){
const f=document.querySelector('.quiz-footer');if(f&&!$('timer'))f.insertAdjacentHTML('afterbegin','<b id="timer" class="timer" role="timer" aria-live="off"></b>');
const tag=document.querySelector('.run-head .tag');if(tag)tag.insertAdjacentText('beforeend',' · время: '+d.time+' мин');
clearInterval(ticker);if(state.pending)return;
const tick=()=>{const t=$('timer');if(!t){clearInterval(ticker);return;}
const ms=Math.max(0,deadline-Date.now());t.textContent=fmt(ms);t.classList.toggle('timer-low',ms<=60000);
if(ms<=0){clearInterval(ticker);$('error').textContent='Время вышло. Работа отправляется.';submit(true);}};
tick();ticker=setInterval(tick,250);document.addEventListener('visibilitychange',tick);
}
function startScreen(){
$('app').innerHTML='<div class="run-head"><span class="eyebrow">'+U.esc(d.section)+'</span><h1>'+U.esc(d.title)+'</h1><p class="muted">Время на работу: <b>'+d.time+' мин</b>. Таймер запустится, когда нажмёшь «Начать»; остановить его нельзя. Когда время выйдет, то, что успеешь ввести, отправится само.</p>'+(lim()?'<p class="muted">Одна попытка, подсказок нет. После отправки ты увидишь только балл.</p>':'')+(demo?'<div class="notice">Демонстрация. Результат не отправляется в кабинет.</div>':'')+'<p class="muted">Заданий: '+(d.tasks.length||d.count)+' · баллов: '+(d.tasks.length?d.tasks.reduce((s,q)=>s+q.points,0):d.max)+'</p></div><p class="error" id="error" role="alert"></p><button id="begin">Начать</button>';
$('begin').onclick=async()=>{const b=$('begin');b.disabled=true;$('error').textContent='';
try{await fetchStart();state.started=true;if(!state.start)state.start=Date.now();save();show();clock();window.scrollTo(0,0);}catch(e){$('error').textContent=e.message;b.disabled=false;}};
}
function pendingPage(){
$('app').innerHTML='<h1>'+U.esc(d.title)+'</h1><p class="muted">Предыдущая отправка ещё не подтверждена. Нажми «Повторить отправку» - повторная запись не создастся.</p><p class="error" id="error" role="alert"></p><button id="submit">Повторить отправку</button>';
$('submit').onclick=()=>submit(true);
}
async function enter(){
if(!d.time){show();return;}
if(!(state.started||state.pending)){startScreen();return;}
try{await fetchStart();}catch(e){if(state.pending){pendingPage();return;}return notice('Не удалось продолжить работу',e.message);}
show();clock();
}
async function submit(auto){
if(submitting)return;const left=d.tasks.length-count();if(!state.pending&&!auto){const m=lim()?(left?'Без ответа осталось '+left+' заданий. ':'')+'Отправить работу? Исправить ответы после отправки нельзя.':(left?'Без ответа осталось '+left+' заданий. Завершить попытку?':'');if(m&&!confirm(m))return;}
submitting=true;$('submit').disabled=true;$('error').textContent='';
if(!state.pending)state.pending={work,version,assignment,row,submission:state.submission,answers:{...state.answers},hints:Object.keys(state.hints).filter(n=>state.hints[n]),idk:Object.keys(state.idk).filter(n=>state.idk[n]),seconds:state.start?Math.max(0,Math.round((Date.now()-state.start)/1000)):0};save();
document.querySelectorAll('[data-answer],[data-idk]').forEach(e=>e.disabled=true);
try{
const j=demo?{result:Object.assign(LiliQuiz.grade(d,state.pending.answers),{at:new Date().toISOString(),submission:state.submission}),homeworkSynced:true}:await U.request({t:code,quiz:state.pending});
if(!j.result||!Number.isFinite(j.result.score))throw new Error('Сервер не подтвердил результат. Повтори отправку.');
state.completed=j.result;state.pending=null;save();result(j.result,j.homeworkSynced);
}catch(e){$('error').textContent=e.message+' Ответы сохранены, повторная отправка не создаст вторую попытку.';$('submit').disabled=false;$('submit').textContent='Повторить отправку';}finally{submitting=false;}
}
try{
if(demo){d=Object.assign(LiliQuiz.parse(LiliQuiz.sample),{id:'demo',version:1});const dt=Number(p.get('t'));if(Number.isInteger(dt)&&dt>=1&&dt<=180)d.time=dt;}
else{if(!code||!work||!assignment||!Number.isInteger(row)||row<2||!Number.isInteger(version)||version<1)return notice('Открой тест из кабинета','Для сохранения результата нужна личная ссылка назначенной работы.');
const j=await U.request(null,{quiz:'load',t:code,q:work,v:version,a:assignment,row});if(j.quiz!==1)throw new Error('Сервер тестов ещё не подключён. Сообщи преподавателю.');d=j.work;history=j.history;}
if(!demo)try{const v=JSON.parse(localStorage.getItem(key));if(v&&v.answers&&typeof v.answers==='object')state=v;}catch(_){}
state.hints=state.hints||{};state.idk=state.idk||{};
if(full()&&history.length&&!state.pending){const h=history[history.length-1];document.title=d.title+' · lili.math';return result({score:h.score,max:h.max,submission:h.submission,at:h.at,hints:[],idk:[],tasks:[]},true);}
if(!state.submission)state.submission=uuid();document.title=d.title+' · lili.math';
if(state.completed&&history.some(r=>r.submission===state.completed.submission&&r.score===state.completed.score&&r.max===state.completed.max))result(state.completed,true);else{state.completed=null;await enter();}
}catch(e){notice('Не удалось открыть работу',e.message);}
})();
