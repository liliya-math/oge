/* Weekly mock analytics: only confirmed server records, first submission per assignment. */
var LiliOgeProgress=(function(){
'use strict';
const SECTION='ОГЭ / Пробники / Часть 1';
const isMock=r=>!!r&&(typeof r.ogePart1==='boolean'?r.ogePart1:r.section===SECTION);
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date=r=>new Date(r.at).toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit',year:'numeric',timeZone:'Europe/Samara'});
function records(history){const seen=new Set();return (history||[]).filter(isMock).filter(r=>r.max===19&&Number.isFinite(r.score)&&r.score>=0&&r.score<=19).slice().sort((a,b)=>String(a.at).localeCompare(String(b.at))).filter(r=>{const key=r.assignment||r.submission;if(!key)return true;if(seen.has(key))return false;seen.add(key);return true;});}
function task(r,n){return r.mock&&Array.isArray(r.mock.tasks)?r.mock.tasks.find(t=>String(t.n)===String(n)):null;}
function analyze(history){
const rows=records(history),recent=rows.slice(-3),stats=Array.from({length:19},(_,i)=>{const n=i+1,values=recent.map(r=>task(r,n)).filter(Boolean),ok=values.filter(t=>t.ok===true).length,bad=values.length-ok;
return {n,count:values.length,ok,bad,state:bad>=2?'weak':values.length===3&&ok===3?'strong':values.length?'practice':'unknown'};});
return {rows,recent,stats};
}
function chart(rows){
const a=rows.slice(-12),W=640,H=190,left=32,right=610,top=20,bottom=150;
const points=a.map((r,i)=>({x:a.length===1?(left+right)/2:left+i*(right-left)/(a.length-1),y:bottom-r.score/19*(bottom-top),r}));
return '<div class="oge-chart"><svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Баллы за последние пробники из 19: '+a.map(r=>r.score).join(', ')+'">'+[0,5,10,15,19].map(n=>{const y=bottom-n/19*(bottom-top);return '<path d="M32 '+y+'H620" stroke="currentColor" opacity=".15"/><text x="24" y="'+(y+4)+'" text-anchor="end">'+n+'</text>';}).join('')+'<polyline points="'+points.map(p=>p.x+','+p.y).join(' ')+'" fill="none" stroke="currentColor" stroke-width="2"/>'+points.map((p,i)=>'<g><title>'+esc(p.r.title)+' · '+date(p.r)+' · '+p.r.score+'/19</title><circle cx="'+p.x+'" cy="'+p.y+'" r="5" fill="currentColor"/><text x="'+p.x+'" y="'+(p.y-10)+'" text-anchor="middle">'+p.r.score+'</text><text x="'+p.x+'" y="170" text-anchor="middle">'+(rows.length-a.length+i+1)+'</text></g>').join('')+'</svg><p class="note">По горизонтали: порядковый номер сданного пробника. Даты указаны в таблице. Показаны последние 12 работ.</p></div>';
}
function html(history,topics){
const {rows,stats}=analyze(history),head='<section class="quiz-history oge-dashboard"><span class="tag">9 класс · первая часть</span><h2>Пробники ОГЭ</h2><p class="note">Один пробник в неделю. Здесь собираются баллы и результаты по заданиям №1–19.</p>';
if(!rows.length)return head+'<div class="oge-empty"><h3>Начнём с первого пробника</h3><p>После сдачи здесь появится первая точка на графике. После нескольких работ станет видно, какие задания получаются устойчиво.</p><p class="note">Назначенный пробник открывается из домашки. Преподаватель отмечает работу в «Тестах» как «Пробник ОГЭ · Первая часть». Можно выбрать уже загруженную работу.</p></div></section>';
const first=rows[0],last=rows[rows.length-1],best=Math.max(...rows.map(r=>r.score)),delta=rows.length>1?last.score-first.score:null;
const summary='<div class="oge-stats">'+[[last.score+'/19','Последний результат'],[best+'/19','Лучший результат'],[delta===null?'Пока одна работа':(delta>0?'+':'')+delta,'Изменение с первого пробника'],[rows.length,'Сдано пробников']].map(([n,s])=>'<div><b>'+n+'</b><span>'+s+'</span></div>').join('')+'</div>';
const weak=stats.filter(s=>s.state==='weak'),strong=stats.filter(s=>s.state==='strong'),latestWrong=Array.from({length:19},(_,i)=>i+1).filter(n=>{const t=task(last,n);return t&&t.ok===false;});
const label=n=>'№'+n+(topics&&topics[n]?' · '+esc(topics[n]):'');
const box=(title,list,empty,cls)=>'<div class="oge-insight '+cls+'"><h3>'+title+'</h3>'+(list.length?'<ul>'+list.map(n=>'<li>'+label(n)+'</li>').join('')+'</ul>':'<p class="note">'+empty+'</p>')+'</div>';
const insights='<div class="oge-insights">'+box('Повторяющиеся ошибки',weak.map(s=>s.n),'Повторяющихся ошибок пока не выявлено.','weak')+box('Сильные места',strong.map(s=>s.n),'Отметим после трёх верных решений подряд в разных пробниках.','strong')+'</div>'+box('Ошибки последнего пробника',latestWrong,last.mock?'Все 19 заданий решены верно.':'Для анализа заданий нужно обновить сервер кабинета. Баллы уже сохранены.','');
const tiles='<h3>Карта заданий</h3><p class="note">Последние три пробника: повторить = две или три ошибки; уверенно = три верных решения; закрепить = остальные проверенные задания. Это результаты работ, а не диагноз причины ошибки.</p><div class="oge-tiles">'+stats.map(s=>'<div class="oge-tile '+s.state+'" title="'+label(s.n)+'"><b>№'+s.n+'</b><span>'+({weak:'Повторить',strong:'Уверенно',practice:'Закрепить',unknown:'Нет данных'}[s.state])+'</span><small>'+s.ok+'/'+s.count+' верно</small></div>').join('')+'</div>';
const table='<h3>Все пробники и задания</h3><p class="note">✓ верно · × ошибка или нет ответа · · нет подробных данных. Каждый столбец соответствует номеру задания.</p><div class="history-table"><table><caption class="note">Первая сдача каждого назначения. Каждая работа: максимум 19 баллов.</caption><thead><tr><th scope="col">Пробник</th><th scope="col">Дата</th><th scope="col">Баллы</th>'+Array.from({length:19},(_,i)=>'<th scope="col">'+(i+1)+'</th>').join('')+'</tr></thead><tbody>'+rows.map((r,i)=>'<tr><th scope="row">'+(i+1)+'. '+esc(r.title)+'<small class="oge-version">Версия '+esc(r.version)+'</small></th><td>'+date(r)+'</td><td><b>'+r.score+'/19</b></td>'+Array.from({length:19},(_,i)=>{const t=task(r,i+1),status=!t?'unknown':t.ok?'strong':'weak';return '<td class="oge-cell '+status+'" aria-label="Задание '+(i+1)+': '+(!t?'нет данных':t.ok?'верно':'ошибка или нет ответа')+'">'+(!t?'·':t.ok?'✓':'×')+'</td>';}).join('')+'</tr>').join('')+'</tbody></table></div>';
return head+summary+chart(rows)+insights+tiles+table+'<p class="note">Сравниваются только пробники первой части. Обычные тесты и повторные сдачи одного назначения не меняют эту динамику. Баллы не переводятся в оценку за полный экзамен.</p></section>';
}
return {isMock,records,analyze,html};
})();
if(typeof module==='object'&&module.exports)module.exports=LiliOgeProgress;
