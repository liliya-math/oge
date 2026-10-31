(function(root){
'use strict';
const T=typeof module!=='undefined'&&module.exports?require('./lili-teaching.js'):root.LiliTeaching;
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalizeURL=value=>{if(!String(value||'').trim())return '';const u=new URL(String(value).trim(),'https://lilimath.ru/');if(u.protocol!=='https:'||u.username||u.password)throw Error('Нужна ссылка https:// без логина и пароля.');return u.href;};
function values(raw){
 const v={summary:String(raw.summary||'').trim().slice(0,5000),nextTopic:String(raw.nextTopic||'').trim().slice(0,300),text:String(raw.text||'').trim().slice(0,5000),url:raw.publishHW?normalizeURL(raw.url):'',due:raw.publishHW?String(raw.due||''):'',publishHW:!!raw.publishHW,updateTopic:!!raw.updateTopic};
 if(v.publishHW&&!v.text)throw Error('Напиши, что нужно выполнить дома.');
 if(v.updateTopic&&!v.nextTopic)throw Error('Укажи тему следующего занятия.');
 if(v.due&&(!/^\d{4}-\d{2}-\d{2}$/.test(v.due)||!Number.isFinite(Date.parse(v.due+'T00:00Z'))||new Date(v.due+'T00:00Z').toISOString().slice(0,10)!==v.due))throw Error('Проверь срок домашнего задания.');
 return v;
}
function matching(hw,v){try{return String(hw.t||'').trim()===v.text&&normalizeURL(hw.url||'')===v.url&&String(hw.due||'')===v.due;}catch(_){return false;}}
function readCard(storage,code,id){const c=T.cards(storage,code).find(c=>c.id===id);if(!c)throw Error('Карточка занятия не найдена в этом браузере. Восстанови журнал из копии.');return c;}
function prepare(storage,code,id,raw){
 const c=readCard(storage,code,id);if(c.closedAt)return c;
 if(c.close&&(['pending','unknown'].includes(c.close.hwState)||c.close.topicState==='pending'))throw Error('Выдача уже отправлялась. Сначала проверь её сохранение.');
 if(c.close&&c.close.hwState==='done')throw Error('Домашка уже выдана. Продолжи завершение без повторной выдачи.');
 const v=values(raw);
 return T.saveCard(storage,code,{...c,summary:v.summary,close:{...v,phase:'ready',hwState:v.publishHW?'new':'skipped',topicState:v.updateTopic?'new':'skipped',beforeIds:[],hwId:'',error:''}});
}
async function completeUnlocked({storage,code,id,getStudent,assignHomework,setTopic,onProgress=()=>{}}){
 let card=readCard(storage,code,id);
 if(card.closedAt)return card;
 if(!card.close)throw Error('Сначала проверь итог занятия.');
 let op={...card.close};const v=values({...op,summary:card.summary});
 const checkpoint=patch=>{op={...op,...patch};card=T.saveCard(storage,code,{...card,summary:v.summary,close:op});onProgress(op);};
 let fresh=await getStudent(code);
 if(v.publishHW&&op.hwState!=='done'){
  if(['pending','unknown'].includes(op.hwState)){
   const candidates=(fresh.hw||[]).filter(h=>!op.beforeIds.includes(String(h.id))&&matching(h,v));
   if(candidates.length!==1)throw Error('Подтверждения выдачи пока нет. Повторно домашку не отправляем. Проверь список заданий в кабинете и нажми «Проверить сохранение» позже.');
   checkpoint({hwState:'done',hwId:String(candidates[0].id),error:''});
  }else{
   if((fresh.hw||[]).some(h=>!h.old&&matching(h,v)))throw Error('Такая домашка уже есть в кабинете. Вернись к редактированию и отключи повторную выдачу.');
   const latest=readCard(storage,code,id);if(latest.close?.hwState!=='new')throw Error('Завершение уже начато в другой вкладке. Обнови карточку.');
   checkpoint({phase:'working',hwState:'pending',beforeIds:(fresh.hw||[]).map(h=>String(h.id)),error:''});
   try{
    fresh=await assignHomework(code,{text:v.text,url:v.url,due:v.due,label:'Домашнее задание',n:'',sec:'',file:'',files:[],notify:false});
    const added=(fresh.hw||[]).filter(h=>!op.beforeIds.includes(String(h.id))&&matching(h,v));
    if(added.length!==1)throw Error('Не удалось подтвердить созданное задание.');
    checkpoint({hwState:'done',hwId:String(added[0].id)});
   }catch(e){checkpoint({hwState:'unknown',error:String(e.message||e)});throw Error('Ответ о выдаче домашки не получен. Нажми «Проверить сохранение»: повторная выдача автоматически не выполняется.');}
  }
 }
 if(v.updateTopic&&op.topicState!=='done'){
  fresh=await getStudent(code);
  if(String(fresh.topic||'')===v.nextTopic){checkpoint({topicState:'done'});}
  else {
   if(op.topicBefore!==undefined&&String(fresh.topic||'')!==op.topicBefore)throw Error('Тема следующего занятия уже изменилась. Проверь её в настройках перед продолжением.');
   checkpoint({topicState:'pending',topicBefore:String(fresh.topic||'')});
   try{fresh=await setTopic(code,v.nextTopic);if(String(fresh.topic||'')!==v.nextTopic)throw Error('Нет подтверждения новой темы.');checkpoint({topicState:'done'});}
   catch(e){checkpoint({error:String(e.message||e)});throw Error('Домашка и итог сохранены по отмеченным шагам. Тема не подтверждена: нажми «Проверить сохранение».');}
  }
 }
 checkpoint({phase:'done',error:''});
 return T.saveCard(storage,code,{...card,closedAt:Date.now(),close:op});
}
const pendingClosures=new Map();
function complete(options){
 const key=options.code+':'+options.id;
 if(pendingClosures.has(key))return pendingClosures.get(key);
 const task=()=>completeUnlocked(options);
 const promise=(root.navigator?.locks?.request?root.navigator.locks.request('lili-lesson-close:'+key,task):task()).finally(()=>pendingClosures.delete(key));
 pendingClosures.set(key,promise);return promise;
}
function safeLink(raw,label){try{const u=normalizeURL(raw);return u?`<a class="chip" href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`:'';}catch(_){return '';}}
function showFinish(doc,{code,card,student,storage,getStudent,assignHomework,setTopic,onSaved=()=>{},onDismiss=()=>{},notify=()=>{}}){
 const win=doc.defaultView,dialog=doc.createElement('dialog');dialog.className='workflow-dialog lesson-close-dialog';dialog.setAttribute('aria-labelledby','close-title');
 let busy=false,edited=false,prepared=card.close||null;
 const old=card.close||{};
 dialog.innerHTML=`<form><h2 id="close-title">Завершить урок</h2><p class="note">${esc(student.name)} · ${esc(card.date)} · ${esc(card.topic)}</p><div data-edit><label>Итог только для тебя<textarea name="summary" maxlength="5000">${esc(card.summary||'')}</textarea></label><label class="close-check"><input type="checkbox" name="publishHW" ${old.publishHW?'checked':''}> Выдать домашку в кабинет ученика</label><div data-homework><label>Что нужно выполнить<textarea name="text" maxlength="5000" placeholder="Номера заданий и короткая инструкция">${esc(old.text||'')}</textarea></label><label>Материал с сайта или ссылка https://<input name="url" list="sitepages" value="${esc(old.url||'')}" placeholder="https://lilimath.ru/…"></label><label>Срок<input type="date" name="due" value="${esc(old.due||'')}"></label></div><label class="close-check"><input type="checkbox" name="updateTopic" ${old.updateTopic?'checked':''}> Записать тему следующего занятия</label><label data-next>Следующая тема<input name="nextTopic" maxlength="300" value="${esc(old.nextTopic||student.topic||'')}"></label></div><div data-preview hidden></div><p class="ferr" role="status" data-status></p><div class="focus-actions"><button class="btn ghost" type="button" data-cancel>Закрыть</button><button class="btn ghost" type="button" data-back hidden>Изменить</button><button class="btn" type="submit" data-preview-button>Посмотреть итог</button><button class="btn" type="button" data-commit hidden>Завершить и сохранить</button></div></form>`;
 doc.body.append(dialog);const form=dialog.querySelector('form'),status=dialog.querySelector('[data-status]'),edit=dialog.querySelector('[data-edit]'),preview=dialog.querySelector('[data-preview]'),commit=dialog.querySelector('[data-commit]'),back=dialog.querySelector('[data-back]'),previewButton=dialog.querySelector('[data-preview-button]');
 form.oninput=()=>{edited=true;};
 const toggle=()=>{dialog.querySelector('[data-homework]').hidden=!form.elements.publishHW.checked;dialog.querySelector('[data-next]').hidden=!form.elements.updateTopic.checked;};toggle();form.onchange=toggle;
 const progress=op=>{const labels={new:'ожидает',pending:'проверяем подтверждение',unknown:'нужно проверить сохранение',done:'сохранено',skipped:'не выбрано'};status.textContent=`Домашка: ${labels[op.hwState]||'ожидает'}. Следующая тема: ${labels[op.topicState]||'ожидает'}.`;};
 const showPreview=op=>{
  prepared=op;edit.hidden=true;preview.hidden=false;previewButton.hidden=true;commit.hidden=false;back.hidden=['pending','unknown','done'].includes(op.hwState)||op.topicState==='pending';
  preview.innerHTML=`<h3>Только в твоём журнале</h3><p class="close-text">${esc(op.summary||'Без заметки')}</p><h3>Ученик увидит в кабинете</h3>${op.publishHW?`<p class="close-text">${esc(op.text)}</p><p>${esc(op.due?'Срок: '+op.due:'Без срока')}</p>${safeLink(op.url,'Открыть материал')}`:'<p>Новая домашка не выбрана.</p>'}${op.updateTopic?`<p><b>Следующая тема:</b> ${esc(op.nextTopic)}</p>`:''}`;
  commit.textContent=['pending','unknown'].includes(op.hwState)||op.topicState==='pending'?'Проверить сохранение':'Завершить и сохранить';progress(op);
 };
 if(card.closedAt){showPreview({...old,summary:card.summary});commit.hidden=true;back.hidden=true;status.textContent='Это занятие уже завершено. Повторная домашка не создаётся.';}
 else if(old.phase==='working'||['pending','unknown','done'].includes(old.hwState)||old.topicState==='pending')showPreview(old);
 form.onsubmit=e=>{e.preventDefault();try{const raw={};for(const k of ['summary','text','url','due','nextTopic'])raw[k]=form.elements[k].value;raw.publishHW=form.elements.publishHW.checked;raw.updateTopic=form.elements.updateTopic.checked;card=prepare(storage,code,card.id,raw);edited=false;showPreview(card.close);}catch(e){status.textContent=e.message;}};
 back.onclick=()=>{edit.hidden=false;preview.hidden=true;previewButton.hidden=false;commit.hidden=true;back.hidden=true;status.textContent='Изменения ещё не выданы ученику.';};
 commit.onclick=async()=>{
  if(busy)return;busy=true;commit.disabled=true;back.disabled=true;dialog.querySelector('[data-cancel]').disabled=true;
  try{card=await complete({storage,code,id:card.id,getStudent,assignHomework,setTopic,onProgress:progress});status.textContent='Урок завершён. '+(card.close.publishHW?'Домашка выдана в кабинет. ':'')+(card.close.updateTopic?'Следующая тема сохранена. ':'')+'Итог сохранён в личном журнале.';commit.hidden=true;back.hidden=true;onSaved(card);notify('Урок завершён.');}
  catch(e){status.textContent=e.message;const latest=readCard(storage,code,card.id);prepared=latest.close;commit.textContent=['pending','unknown'].includes(prepared.hwState)||prepared.topicState==='pending'?'Проверить сохранение':'Продолжить сохранение';back.hidden=['pending','unknown','done'].includes(prepared.hwState)||prepared.topicState==='pending';}
  finally{busy=false;commit.disabled=false;back.disabled=false;dialog.querySelector('[data-cancel]').disabled=false;}
 };
 const mayClose=()=>!busy&&(!edited||win.confirm('В окне есть несохранённые изменения. Закрыть без сохранения?'));
 const leave=e=>{if(busy||edited){e.preventDefault();e.returnValue='';}};win.addEventListener('beforeunload',leave);
 dialog.querySelector('[data-cancel]').onclick=()=>{if(mayClose())dialog.close();};dialog.addEventListener('cancel',e=>{if(!mayClose())e.preventDefault();});dialog.onclose=()=>{win.removeEventListener('beforeunload',leave);dialog.remove();onDismiss(card);};dialog.showModal();return dialog;
}
function reviewDialog(doc,{student,homework,getStudent,saveReview,onSaved=()=>{}}){
 const dialog=doc.createElement('dialog');dialog.className='workflow-dialog lesson-review-dialog';dialog.setAttribute('aria-labelledby','queue-review-title');dialog.innerHTML='<h2 id="queue-review-title">Проверка работы</h2><p data-loading>Загружаю актуальное решение…</p><button class="btn ghost" data-close>Закрыть</button>';doc.body.append(dialog);let busy=false;
 dialog.querySelector('[data-close]').onclick=()=>dialog.close();dialog.onclose=()=>dialog.remove();dialog.addEventListener('cancel',e=>{if(busy)e.preventDefault();});dialog.showModal();
 const load=async()=>{
  try{
   const fresh=await getStudent(student.code);if(!dialog.isConnected)return;const h=(fresh.hw||[]).find(x=>String(x.id)===String(homework.id)&&x.t===homework.t);if(!h)throw Error('Задание изменилось или удалено. Обнови очередь.');
   const pending=['submitted','help'].includes(h.status);
   dialog.innerHTML=`<form><h2 id="queue-review-title">${esc(student.name)} · проверка</h2><h3>${esc(h.t)}</h3><p class="close-text">${esc(h.studentNote||'Комментария ученика нет.')}</p><div class="focus-actions">${safeLink(h.solutionUrl,'Открыть решение ученика')}${safeLink(h.url,'Открыть задание')}</div>${pending?'':'<p class="note">Статус уже изменился. Эта работа больше не ожидает проверки.</p>'}<label>Результат<select name="status"><option value="checked">Проверено</option><option value="revise">На исправление</option></select></label><label>Комментарий ученику<textarea name="feedback" maxlength="2000">${esc(h.feedback||'')}</textarea></label><p class="ferr" role="status"></p><div class="focus-actions"><button class="btn ghost" type="button" data-close>Закрыть</button><button class="btn" type="submit" ${pending?'':'disabled'}>Сохранить проверку</button></div></form>`;
   dialog.querySelector('[data-close]').onclick=()=>dialog.close();dialog.querySelector('form').onsubmit=async e=>{
    e.preventDefault();if(busy)return;const f=e.currentTarget,feedback=f.elements.feedback.value.trim(),status=f.elements.status.value,error=f.querySelector('.ferr');
    if(status==='revise'&&!feedback){error.textContent='Напиши, что нужно исправить.';return;}
    busy=true;const submit=f.querySelector('[type=submit]');submit.disabled=true;f.querySelector('[data-close]').disabled=true;
    try{const d=await saveReview(student.code,{id:h.id,text:h.t,revision:h.revision||'',status,feedback});const updated=(d.hw||[]).find(x=>String(x.id)===String(h.id)&&x.t===h.t);if(!updated||updated.status!==status)throw Error('Подтверждение проверки не получено. Обнови очередь.');onSaved(updated);dialog.close();}
    catch(e){error.textContent=String(e.message)==='changed'?'Ученик обновил работу. Закрой окно, обнови очередь и проверь новую версию.':e.message;submit.disabled=false;}
    finally{busy=false;if(dialog.isConnected)f.querySelector('[data-close]').disabled=false;}
   };
  }catch(e){const p=dialog.querySelector('[data-loading]');if(p)p.textContent=e.message;}
 };
 void load();return dialog;
}
function bindQueue(doc,students,{getStudent,saveReview}){
 const button=doc.getElementById('teaching-check'),target=doc.getElementById('teaching-review');if(!button||!target)return;
 let rows=[],failed=[],loadedAt=0;
 const render=()=>{
  target.innerHTML=`<div class="queue-controls"><label>Показать<select data-queue-filter><option value="all">Все</option><option value="submitted">На проверке</option><option value="help">Нужна помощь</option></select></label><label>Найти ученика или задание<input type="search" data-queue-search></label></div><p class="note" data-queue-count></p><ul class="teaching-review" data-queue-list></ul>${failed.length?`<p class="ferr">Не загрузились: ${failed.map(esc).join(', ')}. Повтори проверку.</p>`:''}<p class="note">Обновлено ${new Date(loadedAt).toLocaleTimeString('ru-RU',{timeZone:'Europe/Samara',hour:'2-digit',minute:'2-digit'})} по Самаре</p>`;
  const draw=()=>{
   const filter=target.querySelector('[data-queue-filter]').value,q=target.querySelector('[data-queue-search]').value.toLowerCase().trim();const visible=rows.filter(x=>(filter==='all'||x.h.status===filter)&&(!q||(x.student.name+' '+(x.student.fname||'')+' '+x.h.t).toLowerCase().includes(q)));
   target.querySelector('[data-queue-count]').textContent=`Ожидают: ${rows.length}. Показано: ${visible.length}.`;
   target.querySelector('[data-queue-list]').innerHTML=visible.length?visible.map(x=>`<li><span class="kchip ${x.h.status==='help'?'gap':'shaky'}">${x.h.status==='help'?'Нужна помощь':'На проверке'}</span><b>${esc(x.student.name)}</b><span>${esc(x.h.t)}</span><button class="chip" data-review="${rows.indexOf(x)}">Открыть и проверить</button><a class="chip" href="#lilia-${esc(x.student.code)}">В кабинет</a></li>`).join(''):'<li>Работ с такими условиями нет.</li>';
   target.querySelectorAll('[data-review]').forEach(b=>b.onclick=()=>{const item=rows[+b.dataset.review];reviewDialog(doc,{student:item.student,homework:item.h,getStudent,saveReview,onSaved:()=>{rows=rows.filter(x=>x!==item);draw();}});});
  };
  target.querySelector('[data-queue-filter]').onchange=draw;target.querySelector('[data-queue-search]').oninput=draw;draw();
 };
 button.onclick=async()=>{
  button.disabled=true;rows=[];failed=[];const active=students.filter(x=>x.active!==false);
  try{for(let i=0;i<active.length;i++){target.textContent=`Загружаю очередь: ${i+1} из ${active.length}…`;try{const d=await getStudent(active[i].code);for(const h of d.hw||[])if(!h.old&&['submitted','help'].includes(h.status))rows.push({student:active[i],h});}catch(e){failed.push(active[i].name);if(e.message==='bad_password')break;}}
   rows.sort((a,b)=>(a.h.status==='help'?0:1)-(b.h.status==='help'?0:1));loadedAt=Date.now();render();button.textContent='Обновить очередь проверки';
  }finally{button.disabled=false;}
 };
}
const api={values,matching,prepare,complete,showFinish,reviewDialog,bindQueue};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.LiliLessonFlow=api;
})(typeof window==='undefined'?globalThis:window);
