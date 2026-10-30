/* Shared presentation and transport. No answer keys are requested by the pupil page. */
var LiliQuizUI=(function(){
'use strict';
const API='https://script.google.com/macros/s/AKfycbwg68-wqapNubGW4BuTEB_ri38yu41uV8hoQPOhluE84y4ZSRfZ9-sFl--uwv7T7AA_xA/exec';
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const errors={bad_op:'Сервер ещё не обновлён. Открой инструкцию подключения.',no_code:'Сервер ещё не обновлён.',bad_password:'Пароль не подошёл. Войди заново.',locked:'Слишком много попыток входа. Подожди 15 минут.',not_assigned:'Задание не найдено в твоём кабинете. Открой его заново из домашки.',no_work:'Работа не найдена.',changed:'Данные изменились. Загрузи актуальную версию и повтори действие.',not_found:'Ученик не найден или кабинет отключён.',bad_value:'Проверь введённые данные.'};
async function request(body,query){
const r=await fetch(query?API+'?'+new URLSearchParams(query):API,query?{cache:'no-store'}:{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(body)});
if(!r.ok)throw new Error('Нет связи с сервером. Повтори попытку.');
const j=await r.json();if(j.error)throw new Error(j.message||errors[j.error]||j.error);return j;
}
function math(el){if(window.renderMathInElement)window.renderMathInElement(el,{delimiters:[{left:'$$',right:'$$',display:true},{left:'\\(',right:'\\)',display:false},{left:'\\[',right:'\\]',display:true}],throwOnError:false,trust:false,strict:'warn'});}
function taskHTML(q,preview,a){
const name='q-'+q.n,help=q.type==='set'?'Все ответы через ; например: -5; 5':q.type==='number'?'Число или дробь, например: 0,5 или 1/2':q.type==='text'?'Краткий ответ':'';
return '<section class="task" data-task="'+esc(q.n)+'"><div class="between"><span class="task-num">ЗАДАНИЕ '+esc(q.n)+'</span><span class="tag">'+q.points+' б.</span></div><div class="qtext" id="label-'+esc(q.n)+'">'+esc(q.q)+'</div>'+(q.type==='choice'?q.options.map((v,i)=>'<label class="option"><input type="radio" name="'+name+'" data-answer="'+q.n+'" value="'+esc(v)+'" '+(a===v?'checked':'')+'><span>'+esc(v)+'</span></label>').join(''):'<label class="field"><span>'+help+'</span><input type="text" maxlength="500" autocomplete="off" spellcheck="false" data-answer="'+esc(q.n)+'" aria-labelledby="label-'+esc(q.n)+'" value="'+esc(a||'')+'" placeholder="Твой ответ"></label>')+(q.hint?'<details><summary>Подсказка</summary><div class="hint">'+esc(q.hint)+'</div></details>':'')+(preview?'<details><summary>Ключ для преподавателя</summary><p class="answer-key">'+esc(q.answer)+'</p></details><button type="button" class="secondary small" data-edit="'+esc(q.n)+'">Редактировать</button>':'')+'</section>';
}
function historyHTML(records){
if(!records||!records.length)return '<section class="quiz-history"><h2>Результаты тестов</h2><p class="note">После прохождения теста здесь появятся баллы и история попыток.</p></section>';
const sections=new Map();records.slice().sort((a,b)=>String(a.at).localeCompare(String(b.at))).forEach(r=>{if(!sections.has(r.section))sections.set(r.section,new Map());const groups=sections.get(r.section),k=r.work+':'+r.version;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(r);});
return '<section class="quiz-history"><h2>Результаты тестов</h2><p class="note">Все попытки сохраняются. Повтор одной работы показывает закрепление; новый вариант помогает проверить освоение темы.</p>'+[...sections].map(([section,groups])=>'<h3>'+esc(section)+'</h3>'+[...groups.values()].map(a=>{
const first=a[0],last=a[a.length-1],best=a.reduce((v,r)=>r.score/r.max>v.score/v.max?r:v,first),delta=Math.round((last.score/last.max-first.score/first.max)*100),coords=a.map((r,i)=>[(a.length===1?150:10+i*280/(a.length-1)),75-r.score/r.max*60]);
const graph=a.length>1?'<svg viewBox="0 0 300 90" role="img" aria-label="Процент выполнения по попыткам"><path d="M10 15H290 M10 75H290" stroke="currentColor" opacity=".2"/><polyline points="'+coords.map(p=>p.join(',')).join(' ')+'" fill="none" stroke="currentColor" stroke-width="2"/>'+coords.map(([x,y])=>'<circle cx="'+x+'" cy="'+y+'" r="3.5" fill="currentColor"/>').join('')+'</svg>':'';
return '<div><b>'+esc(first.title)+'</b> <span class="tag">версия '+first.version+'</span><p class="history-stats">Последняя: '+last.score+'/'+last.max+' · лучшая: '+best.score+'/'+best.max+' · попыток: '+a.length+(a.length>1?' · изменение: '+(delta>0?'+':'')+delta+' п. п.':'')+'</p>'+graph+'<div class="trend">'+a.map(r=>'<span>'+r.score+'/'+r.max+'</span>').join('<small aria-hidden="true">→</small>')+'</div><details><summary>Даты и баллы</summary><div class="history-table"><table><thead><tr><th>Попытка</th><th>Дата</th><th>Баллы</th><th>Выполнено</th></tr></thead><tbody>'+a.map((r,i)=>'<tr><td>'+(i+1)+'</td><td>'+esc(new Date(r.at).toLocaleString('ru-RU'))+'</td><td>'+r.score+'/'+r.max+'</td><td>'+Math.round(r.score/r.max*100)+'%</td></tr>').join('')+'</tbody></table></div></details></div>';
}).join('')).join('')+'</section>';
}
return {API,esc,request,math,taskHTML,historyHTML};
})();
window.addEventListener('load',()=>LiliQuizUI.math(document.body));
