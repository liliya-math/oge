(async function(){
'use strict';const U=LiliQuizUI,$=id=>document.getElementById(id),p=new URLSearchParams(location.search),demo=p.get('demo')==='1';
const code=p.get('lili_student')||'',work=p.get('q')||'',version=Number(p.get('v')),assignment=p.get('a')||'',row=Number(p.get('lili_hw'));
const back=code?'kabinet.html#'+encodeURIComponent(code):'kabinet.html';$('back').href=demo?'quiz-builder.html':back;
let d,history=[],state={answers:{},start:0,submission:'',pending:null},submitting=false;
const key='lili-quiz:'+code+':'+assignment+':'+work+':'+version;
function uuid(){return crypto.randomUUID?crypto.randomUUID():Array.from(crypto.getRandomValues(new Uint8Array(24)),v=>v.toString(16).padStart(2,'0')).join('');}
function save(){try{localStorage.setItem(key,JSON.stringify(state));return true;}catch(_){return false;}}
function notice(title,text){$('app').innerHTML='<h1>'+U.esc(title)+'</h1><p class="muted">'+U.esc(text)+'</p><a class="qbtn secondary" href="'+U.esc(back)+'">В кабинет</a>';}
function count(){return d.tasks.filter(q=>String(state.answers[q.n]||'').trim()).length;}
function update(){const n=count();$('count').textContent='Заполнено '+n+' из '+d.tasks.length;$('progress').value=n;}
function show(){
$('app').innerHTML='<div class="run-head"><span class="eyebrow">'+U.esc(d.section)+'</span><h1>'+U.esc(d.title)+'</h1><p class="muted">Решай в тетради и вводи ответы здесь. Каждая завершённая попытка сохранится в кабинете.</p>'+(demo?'<div class="notice">Демонстрация. Результат не отправляется в кабинет.</div>':'')+'<div class="between"><span class="tag">Заданий: '+d.tasks.length+' · баллов: '+d.tasks.reduce((s,q)=>s+q.points,0)+'</span><span class="note">'+(history.length?'Попытка '+(history.length+1):'Первая попытка')+'</span></div><progress id="progress" max="'+d.tasks.length+'" value="0" aria-label="Заполнено ответов"></progress></div><div id="questions">'+d.tasks.map(q=>U.taskHTML(q,false,state.answers[q.n])).join('')+'</div><p class="error" id="error" role="alert"></p><div class="quiz-footer"><span class="note" id="count"></span><button id="submit">Завершить</button></div>'+(history.length?U.historyHTML(history):'');
U.math($('app'));update();
document.querySelectorAll('[data-answer]').forEach(el=>{el.oninput=()=>{if(!state.start)state.start=Date.now();state.answers[el.dataset.answer]=el.value;if(!save())$('error').textContent='Черновик не сохранился в браузере. Не закрывай страницу до отправки.';update();};});
$('submit').onclick=submit;
if(state.pending){document.querySelectorAll('[data-answer]').forEach(e=>e.disabled=true);$('error').textContent='Предыдущая отправка ещё не подтверждена. Нажми «Повторить отправку» - повторная запись не создастся.';$('submit').textContent='Повторить отправку';}
}
function result(r,synced){
const current={work:d.id,version:d.version,assignment,submission:r.submission,at:r.at,title:d.title,section:d.section,score:r.score,max:r.max};if(!history.some(x=>x.submission===r.submission))history.push(current);
$('app').innerHTML='<span class="eyebrow">'+(demo?'Демонстрация':'Попытка сохранена в кабинете')+'</span><h1>Работа завершена</h1><div class="score">'+r.score+' <small>/ '+r.max+'</small></div><p class="muted">'+Math.round(r.score/r.max*100)+'% выполнения</p>'+(synced===false?'<p class="notice">Результат сохранён. Статус карточки домашки пока не обновился.</p>':'')+'<div class="actions"><button id="again">Пройти ещё раз</button><a class="qbtn secondary" href="'+U.esc(demo?'quiz-builder.html':back)+'">'+(demo?'В конструктор':'В кабинет')+'</a></div><section class="panel"><h2>По заданиям</h2><div class="test-list">'+r.tasks.map(q=>'<div><span class="'+(q.ok?'success':'error')+'">'+(q.ok?'✓':'○')+' Задание '+q.n+'</span> · '+q.points+' б.</div>').join('')+'</div><p class="note">Разбери ошибки, затем попробуй ещё раз. Новая попытка добавится в историю.</p></section>'+U.historyHTML(history);
$('again').onclick=()=>{state={answers:{},start:0,submission:uuid(),pending:null};save();show();window.scrollTo(0,0);};
window.scrollTo(0,0);
}
async function submit(){
if(submitting)return;const left=d.tasks.length-count();if(!state.pending&&left&&!confirm('Без ответа осталось '+left+' заданий. Завершить попытку?'))return;
submitting=true;$('submit').disabled=true;$('error').textContent='';
if(!state.pending)state.pending={work,version,assignment,row,submission:state.submission,answers:{...state.answers},seconds:state.start?Math.max(0,Math.round((Date.now()-state.start)/1000)):0};save();
document.querySelectorAll('[data-answer]').forEach(e=>e.disabled=true);
try{
const j=demo?{result:Object.assign(LiliQuiz.grade(d,state.pending.answers),{at:new Date().toISOString(),submission:state.submission}),homeworkSynced:true}:await U.request({t:code,quiz:state.pending});
if(!j.result||!Number.isFinite(j.result.score))throw new Error('Сервер не подтвердил результат. Повтори отправку.');
state.completed=j.result;state.pending=null;save();result(j.result,j.homeworkSynced);
}catch(e){$('error').textContent=e.message+' Ответы сохранены, повторная отправка не создаст вторую попытку.';$('submit').disabled=false;$('submit').textContent='Повторить отправку';}finally{submitting=false;}
}
try{
if(demo){d=Object.assign(LiliQuiz.parse(LiliQuiz.sample),{id:'demo',version:1});}
else{if(!code||!work||!assignment||!Number.isInteger(row)||row<2||!Number.isInteger(version)||version<1)return notice('Открой тест из кабинета','Для сохранения результата нужна личная ссылка назначенной работы.');
const j=await U.request(null,{quiz:'load',t:code,q:work,v:version,a:assignment,row});if(j.quiz!==1)throw new Error('Сервер тестов ещё не подключён. Сообщи преподавателю.');d=j.work;history=j.history;}
if(!demo)try{const v=JSON.parse(localStorage.getItem(key));if(v&&v.answers&&typeof v.answers==='object')state=v;}catch(_){}
if(!state.submission)state.submission=uuid();document.title=d.title+' · lili.math';
if(state.completed&&history.some(r=>r.submission===state.completed.submission&&r.score===state.completed.score&&r.max===state.completed.max))result(state.completed,true);else{state.completed=null;show();}
}catch(e){notice('Не удалось открыть работу',e.message);}
})();
