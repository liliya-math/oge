(function(root){
'use strict';
const KEY='lili-personal-board-v1';
let pending;
function validId(id){return /^[a-z0-9_-]{1,100}$/i.test(id||'');}
async function ensure(win,links){
 const stored=win.localStorage.getItem(KEY);
 if(stored){const p=links.parse(stored);if(!p||p.role!=='teacher')throw new Error('Не удалось прочитать ссылку личной доски. Сохрани её копию и проверь настройки браузера.');return stored;}
 if(!pending)pending=links.createPair(win.crypto).then(pair=>{const url=new URL(pair.teacher);url.searchParams.set('personal','1');win.localStorage.setItem(KEY,url.href);return url.href;}).finally(()=>{pending=null;});
 return pending;
}
function bind(doc,links,notify){
 const a=doc.querySelector('[data-personal-board]');if(!a)return;
 a.textContent='Моя доска';a.setAttribute('aria-disabled','true');
 ensure(doc.defaultView,links).then(url=>{if(!a.isConnected)return;a.href=url;a.target='_blank';a.rel='noopener';a.removeAttribute('aria-disabled');}).catch(e=>notify(e.message));
}
function chooser(doc,students,links,boardURL,notify){
 const win=doc.defaultView,id=new URLSearchParams(win.location.search).get('boardTemplate');
 if(!validId(id))return;
 const host=doc.getElementById('personal-board-transfer');if(!host)return;
 host.className='card';
 const title=doc.createElement('h2');title.textContent='Добавить материал ученику';host.append(title);
 const hint=doc.createElement('p');hint.textContent='Выбери ученика. На его доске откроется сохранённый материал: нажми «Добавить на эту доску». Исходник останется в твоих материалах.';host.append(hint);
 const select=doc.createElement('select');select.setAttribute('aria-label','Ученик для добавления материала');
 for(const student of students){const option=doc.createElement('option');option.value=student.code;option.textContent=student.name+(student.fname?' '+student.fname:'');select.append(option);}
 host.append(select);
 const actions=doc.createElement('div');actions.className='focus-actions';const open=doc.createElement('a');open.className='btn';open.textContent='Открыть доску ученика';actions.append(open);
 const dismiss=doc.createElement('button');dismiss.className='btn ghost';dismiss.textContent='Отмена';dismiss.onclick=()=>{const url=new URL(win.location.href);url.searchParams.delete('boardTemplate');win.history.replaceState(null,'',url.href);host.remove();};actions.append(dismiss);host.append(actions);
 const update=()=>{const student=students.find(s=>s.code===select.value),raw=student&&links.savedTeacherURL(win.localStorage,student.code);if(raw){const url=new URL(boardURL(raw,{code:student.code,name:student.name,teacher:true}));url.searchParams.set('contentTemplate',id);open.href=url.href;open.textContent='Открыть доску ученика';}else{open.removeAttribute('href');open.textContent='Сначала сохрани ссылку учителя';}};
 select.onchange=update;open.onclick=e=>{if(!open.hasAttribute('href')){e.preventDefault();notify('Открой настройки этого ученика и сохрани свою учительскую ссылку на его доску. Затем повтори перенос.');}};update();
}
const api={ensure,bind,chooser,validId};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.LiliPersonalBoard=api;
})(typeof window==='undefined'?globalThis:window);
