/* Shared presentation and transport. No answer keys are requested by the pupil page. */
var LiliQuizUI=(function(){
'use strict';
const API='https://script.google.com/macros/s/AKfycbwg68-wqapNubGW4BuTEB_ri38yu41uV8hoQPOhluE84y4ZSRfZ9-sFl--uwv7T7AA_xA/exec';
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const errors={bad_op:'Сервер ещё не обновлён. Открой инструкцию подключения.',no_code:'Сервер ещё не обновлён.',bad_password:'Пароль не подошёл. Войди заново.',locked:'Слишком много попыток входа. Подожди 15 минут.',not_assigned:'Задание не найдено в твоём кабинете. Открой его заново из домашки.',no_work:'Работа не найдена.',changed:'Данные изменились. Загрузи актуальную версию и повтори действие.',not_found:'Ученик не найден или кабинет отключён.',bad_value:'Проверь введённые данные.',already_done:'Эта работа уже сдана. Пройти её повторно нельзя.'};
async function request(body,query){
const r=await fetch(query?API+'?'+new URLSearchParams(query):API,query?{cache:'no-store'}:{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(body)});
if(!r.ok)throw new Error('Нет связи с сервером. Повтори попытку.');
const j=await r.json();if(j.error)throw new Error(j.message||errors[j.error]||j.error);return j;
}
function math(el){if(window.renderMathInElement)window.renderMathInElement(el,{delimiters:[{left:'$$',right:'$$',display:true},{left:'\\(',right:'\\)',display:false},{left:'\\[',right:'\\]',display:true}],throwOnError:false,trust:false,strict:'warn'});}
function taskHTML(q,preview,a,o){o=o||{};
const name='q-'+q.n,help=q.type==='set'?'Все ответы через ; например: -5; 5':q.type==='number'?'Число или дробь, например: 0,5 или 1/2':q.type==='text'?'Краткий ответ':'';
return '<section class="task" data-task="'+esc(q.n)+'"><div class="between"><span class="task-num">ЗАДАНИЕ '+esc(q.n)+'</span><span class="tag">'+q.points+' б.</span></div><div class="qtext" id="label-'+esc(q.n)+'">'+esc(q.q)+'</div>'+(q.figure?'<img class="qfig" src="quiz-fig/'+esc(q.figure)+'" alt="Рисунок к заданию '+esc(q.n)+'">':'')+(q.type==='choice'?q.options.map((v,i)=>'<label class="option"><input type="radio" name="'+name+'" data-answer="'+q.n+'" value="'+esc(v)+'" '+(a===v?'checked':'')+'><span>'+esc(v)+'</span></label>').join(''):'<label class="field"><span>'+help+'</span><input type="text" maxlength="500" autocomplete="off" spellcheck="false" data-answer="'+esc(q.n)+'" aria-labelledby="label-'+esc(q.n)+'" value="'+esc(a||'')+'" placeholder="Твой ответ"></label>')+(q.hint?'<details data-hint="'+esc(q.n)+'"><summary>Подсказка</summary><div class="hint">'+esc(q.hint)+'</div></details>':'')+(o.idk?'<button type="button" class="secondary small idk" data-idk="'+esc(q.n)+'" aria-pressed="false">Не знаю</button>':'')+(preview?'<details><summary>Ключ для преподавателя</summary><p class="answer-key">'+esc(q.answer)+'</p></details><button type="button" class="secondary small" data-edit="'+esc(q.n)+'">Редактировать</button>':'')+'</section>';
}
const KN={hw:'ДЗ',self:'Самостоятельная',exam:'Контрольная',free:'Тест'},kn=k=>KN[k]||KN.free,pct=r=>r.max?r.score/r.max:0;
function marker(kind,x,y){
if(kind==='self')return '<polygon points="'+[x,y-5.5,x+5.5,y,x,y+5.5,x-5.5,y].join(' ')+'" fill="currentColor"/>';
if(kind==='exam')return '<rect x="'+(x-4)+'" y="'+(y-4)+'" width="8" height="8" fill="currentColor"/>';
if(kind==='hw')return '<circle cx="'+x+'" cy="'+y+'" r="4" fill="currentColor"/>';
return '<circle cx="'+x+'" cy="'+y+'" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/>';
}
/* One chart for every kind of work, in the order they were done. */
function overallChart(records){
const a=records.slice().sort((x,y)=>String(x.at).localeCompare(String(y.at))).slice(-30);if(a.length<2)return '';
const n=a.length,c=a.map((r,i)=>[30+i*262/(n-1),86-pct(r)*66]),kinds=[...new Set(a.map(r=>r.kind||'free'))];
return '<div class="overall"><h3>Динамика по всем работам</h3><svg viewBox="0 0 300 108" role="img" aria-label="Процент выполнения по порядку работ: '+a.map(r=>Math.round(pct(r)*100)+'%').join(', ')+'">'+
[[20,'100%'],[53,'50%'],[86,'0%']].map(([y,t])=>'<path d="M30 '+y+'H292" stroke="currentColor" opacity=".18"/><text x="26" y="'+(y+3)+'" text-anchor="end" font-size="9" fill="currentColor" opacity=".6">'+t+'</text>').join('')+
'<polyline points="'+c.map(p=>p.join(',')).join(' ')+'" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".55"/>'+c.map(([x,y],i)=>marker(a[i].kind||'free',x,y)).join('')+'</svg>'+
'<p class="note legend">'+kinds.map(k=>({hw:'●',self:'◆',exam:'■',free:'○'}[k]||'○')+' '+kn(k)).join(' &nbsp; ')+'</p></div>';
}
function detailHTML(a){
if(!a.some(r=>r.detail))return '';
return '<details><summary>Разбор по заданиям (только преподавателю)</summary>'+a.filter(r=>r.detail).map((r,i)=>{const d=r.detail;
return '<p class="note"><b>'+esc(new Date(r.at).toLocaleString('ru-RU'))+'</b> · '+r.score+'/'+r.max+(d.seconds?' · '+Math.round(d.seconds/60)+' мин':'')+'<br>'+d.tasks.map(t=>(t.ok?'✓':'○')+' '+esc(t.n)+(d.hints.includes(t.n)?' (подсказка)':'')+(d.idk.includes(t.n)?' (не знаю)':'')).join(' · ')+'</p>';}).join('')+'</details>';
}
function historyHTML(records){
if(!records||!records.length)return '<section class="quiz-history"><h2>Результаты тестов</h2><p class="note">После прохождения теста здесь появятся баллы и история попыток.</p></section>';
const sections=new Map();records.slice().sort((a,b)=>String(a.at).localeCompare(String(b.at))).forEach(r=>{if(!sections.has(r.section))sections.set(r.section,new Map());const groups=sections.get(r.section),k=r.work+':'+r.version;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(r);});
return '<section class="quiz-history"><h2>Результаты тестов</h2>'+overallChart(records)+'<p class="note">Все попытки сохраняются. Повтор одной работы показывает закрепление; новый вариант помогает проверить освоение темы.</p>'+[...sections].map(([section,groups])=>'<h3>'+esc(section)+'</h3>'+[...groups.values()].map(a=>{
const first=a[0],last=a[a.length-1],best=a.reduce((v,r)=>r.score/r.max>v.score/v.max?r:v,first),delta=Math.round((last.score/last.max-first.score/first.max)*100),coords=a.map((r,i)=>[(a.length===1?150:10+i*280/(a.length-1)),75-r.score/r.max*60]);
const graph=a.length>1?'<svg viewBox="0 0 300 90" role="img" aria-label="Процент выполнения по попыткам"><path d="M10 15H290 M10 75H290" stroke="currentColor" opacity=".2"/><polyline points="'+coords.map(p=>p.join(',')).join(' ')+'" fill="none" stroke="currentColor" stroke-width="2"/>'+coords.map(([x,y])=>'<circle cx="'+x+'" cy="'+y+'" r="3.5" fill="currentColor"/>').join('')+'</svg>':'';
const used=last.hints>0||last.idk>0;
return '<div><b>'+esc(first.title)+'</b> <span class="tag">'+kn(first.kind)+'</span> <span class="tag">версия '+first.version+'</span><p class="history-stats">Последняя: '+last.score+'/'+last.max+(a.length>1?' · лучшая: '+best.score+'/'+best.max+' · попыток: '+a.length+' · изменение: '+(delta>0?'+':'')+delta+' п. п.':'')+(used?' · подсказок: '+last.hints+' · «не знаю»: '+last.idk:'')+'</p>'+graph+(a.length>1?'<div class="trend">'+a.map(r=>'<span>'+r.score+'/'+r.max+'</span>').join('<small aria-hidden="true">→</small>')+'</div>':'')+'<details><summary>Даты и баллы</summary><div class="history-table"><table><thead><tr><th>Попытка</th><th>Дата</th><th>Баллы</th><th>Выполнено</th><th>Подсказки / не знаю</th></tr></thead><tbody>'+a.map((r,i)=>'<tr><td>'+(i+1)+'</td><td>'+esc(new Date(r.at).toLocaleString('ru-RU'))+'</td><td>'+r.score+'/'+r.max+'</td><td>'+Math.round(r.score/r.max*100)+'%</td><td>'+(r.kind==='self'||r.kind==='exam'?'—':(r.hints||0)+' / '+(r.idk||0))+'</td></tr>').join('')+'</tbody></table></div></details>'+detailHTML(a)+'</div>';
}).join('')).join('')+'</section>';
}
function zoom(src){const o=document.createElement('div');o.className='zoom';o.innerHTML='<button type="button" class="qbtn">Закрыть</button><div class="zoom-box"><img alt="Рисунок"></div>';o.querySelector('img').src=src;o.onclick=e=>{if(e.target.tagName!=='IMG')o.remove();};document.body.appendChild(o);}
return {API,esc,request,math,taskHTML,historyHTML,zoom};
})();
window.addEventListener('load',()=>LiliQuizUI.math(document.body));
