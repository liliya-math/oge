(function (root) {
  'use strict';
  const KEY = 'lili-teacher-lessons-v1';
  const ZONE = 'Europe/Samara';
  const drafts = new Map();
  function preserveDraft(doc,code) {
    const form=doc.getElementById('jl-form');
    if(!form || form.dataset.dirty!=='1')return;
    const value={}; for(const k of ['id','date','time','topic','plan','materials','summary'])value[k]=form.elements.namedItem(k).value;
    drafts.set(code,value);
  }
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const codeOK = v => /^[a-z0-9]{1,100}$/i.test(String(v));
  const dateOK = v => /^\d{4}-\d{2}-\d{2}$/.test(v) && new Date(v+'T00:00:00Z').toISOString().slice(0,10) === v;
  function dayKey(now = Date.now()) {
    const p = {};
    new Intl.DateTimeFormat('en-GB',{timeZone:ZONE,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now).forEach(x => p[x.type] = x.value);
    return `${p.year}-${p.month}-${p.day}`;
  }
  function schedule(students, parse, now = Date.now()) {
    const day = dayKey(now), wd = new Date(day+'T12:00:00Z').getUTCDay(), out = [];
    students.filter(s => s.active !== false).forEach(s => {
      parse(s.days,s.time).slots.filter(x => x.wd === wd && x.h >= 0 && x.h < 24 && x.m >= 0 && x.m < 60).forEach(x => {
        const start = Date.parse(`${day}T${String(x.h).padStart(2,'0')}:${String(x.m).padStart(2,'0')}:00+04:00`);
        out.push({student:s,start,end:start+3600000});
      });
    });
    out.sort((a,b) => a.start-b.start || String(a.student.name).localeCompare(String(b.student.name),'ru'));
    return out.map((x,i) => ({...x,conflict:out.some((y,j) => i !== j && x.start < y.end && y.start < x.end),state:x.end <= now?'past':x.start <= now?'live':'next'}));
  }
  function cleanCard(value) {
    if (!value || !/^[a-z0-9-]{1,100}$/i.test(value.id || '') || !dateOK(value.date || '')) throw new Error('Некорректная карточка занятия.');
    const text = (k,n) => String(value[k] || '').slice(0,n);
    const time = text('time',5);
    if (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error('Проверь время занятия.');
    return {id:value.id,date:value.date,time,topic:text('topic',300),plan:text('plan',10000),materials:text('materials',5000),summary:text('summary',5000),updated:Number(value.updated)||Date.now()};
  }
  function read(storage) {
    const raw = storage.getItem(KEY);
    if (!raw) return {version:1,students:{}};
    const data = JSON.parse(raw);
    if (data.version !== 1 || !data.students || typeof data.students !== 'object' || Array.isArray(data.students)) throw new Error('Не удалось прочитать журнал. Сначала выгрузи копию или восстанови файл.');
    return data;
  }
  function cards(storage,code) { return (read(storage).students[code] || []).map(cleanCard).sort((a,b) => (b.date+b.time).localeCompare(a.date+a.time)); }
  function saveCard(storage,code,value) {
    if (!codeOK(code)) throw new Error('Не выбран ученик.');
    const data = read(storage), card = cleanCard({...value,updated:Date.now()});
    const list = data.students[code] || [];
    data.students[code] = [card,...list.filter(x => x.id !== card.id)];
    storage.setItem(KEY,JSON.stringify(data));
    return card;
  }
  function restore(storage,backup) {
    if (!backup || backup.version !== 1 || !backup.students || typeof backup.students !== 'object' || Array.isArray(backup.students)) throw new Error('Это не файл журнала занятий.');
    const data = read(storage);
    let count = 0;
    for (const [code,list] of Object.entries(backup.students)) {
      if (!codeOK(code) || !Array.isArray(list) || list.length > 1000) throw new Error('Некорректный файл журнала.');
      const merged = new Map((data.students[code] || []).map(x => [x.id,cleanCard(x)]));
      for (const raw of list) {
        const card = cleanCard(raw); count++;
        if (count > 5000) throw new Error('Слишком большой журнал.');
        if (!merged.has(card.id) || merged.get(card.id).updated < card.updated) merged.set(card.id,card);
      }
      data.students[code] = [...merged.values()];
    }
    storage.setItem(KEY,JSON.stringify(data));
    return count;
  }
  function moveJournal(storage,from,to) {
    if (!codeOK(from) || !codeOK(to) || from === to) return;
    const data=read(storage);
    if (!Array.isArray(data.students[from])) return;
    const merged=new Map((data.students[to] || []).map(x => [x.id,cleanCard(x)]));
    for(const raw of data.students[from]) {
      const card=cleanCard(raw);
      if(!merged.has(card.id) || merged.get(card.id).updated < card.updated) merged.set(card.id,card);
    }
    data.students[to]=[...merged.values()];
    // Keep the old local key as a recovery copy if a redirect is interrupted.
    storage.setItem(KEY,JSON.stringify(data));
  }
  function boardURL(raw,{code,name,teacher=false,card,start=false,video=false} = {}) {
    if (!raw || !codeOK(code)) return raw || '';
    try {
      const u = new URL(raw);
      if (u.origin !== 'https://liliya-math.github.io' || u.pathname !== '/excalidraw/') return raw;
      u.searchParams.set('cabinet',code);
      u.searchParams.set('cabinetRole',teacher?'teacher':'student');
      u.searchParams.set('studentName',String(name || '').slice(0,80));
      if (card) {
        u.searchParams.set('lessonId',card.id);
        u.searchParams.set('lessonDate',card.date);
        u.searchParams.set('lessonTitle',String(card.topic || '').slice(0,300));
      }
      if (start && teacher) u.searchParams.set('startLesson','1');
      if (video) u.searchParams.set('video','1');
      return u.href;
    } catch (_) { return raw; }
  }
  function todayHTML(students,parse,now = Date.now()) {
    const list = schedule(students,parse,now), active = students.filter(s => s.active !== false);
    const hm = t => new Date(t).toLocaleTimeString('ru-RU',{timeZone:ZONE,hour:'2-digit',minute:'2-digit'});
    return `<section class="card teaching-today" id="teaching-today"><div class="sh"><h2>Сегодня</h2><span class="sub">${esc(new Date(now).toLocaleDateString('ru-RU',{timeZone:ZONE,day:'numeric',month:'long'}))} · Самара</span></div><p class="note">${list.length} занятий по расписанию · длительность 60 минут</p>${list.length?`<ol class="teaching-agenda">${list.map(x => `<li class="${x.state}"><div><b>${hm(x.start)}</b><span class="kchip ${x.state==='live'?'solid':'new'}">${x.state==='live'?'Идёт сейчас':x.state==='past'?'По расписанию завершено':'Предстоит'}</span>${x.conflict?'<span class="kchip gap">Пересечение времени</span>':''}</div><h3>${esc(x.student.name)} ${esc(x.student.fname || '')}</h3><div class="focus-actions"><a class="btn" href="#lilia-${esc(x.student.code)}" data-teaching-open="${esc(x.student.code)}">${x.state==='past'?'Карточка занятия':'Подготовить / начать урок'}</a></div></li>`).join('')}</ol>`:'<p>На сегодня занятий в расписании нет.</p>'}<div class="focus-actions"><button class="btn ghost" type="button" id="teaching-check">Проверить работы и вопросы</button><a class="btn ghost" href="#teacher-students">Все ученики · ${active.length}</a></div><div id="teaching-review" aria-live="polite"></div><p class="note">Список проверки загружается по кнопке из кабинетов учеников.</p></section>`;
  }
  function download(doc,data,name) {
    const win = doc.defaultView, url = win.URL.createObjectURL(new win.Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
    const a = doc.createElement('a'); a.href=url; a.download=name; doc.body.append(a); a.click(); a.remove(); win.setTimeout(() => win.URL.revokeObjectURL(url),30000);
  }
  function backupHTML() { return `<div class="focus-actions teaching-backup"><button class="chip" type="button" data-journal-export>Выгрузить журнал</button><label class="chip">Восстановить журнал<input type="file" accept="application/json,.json" data-journal-import hidden></label></div>`; }
  function bindBackup(doc,refresh,notify) {
    doc.querySelectorAll('[data-journal-export]').forEach(b => b.onclick = () => {try {download(doc,read(doc.defaultView.localStorage),'lili-lesson-journal-'+dayKey()+'.json');} catch(e) {notify(e.message);}});
    doc.querySelectorAll('[data-journal-import]').forEach(b => b.onchange = async () => {try {const file=b.files[0]; if(!file)return; if(file.size>2*1024*1024)throw new Error('Файл больше 2 МБ.');const n=restore(doc.defaultView.localStorage,JSON.parse(await file.text()));refresh();notify(`Журнал восстановлен: ${n} записей. Более новые записи сохранены.`);}catch(e){notify(e.message);}finally{b.value='';}});
  }
  function bindToday(doc,students,{getStudent,parse,notify}) {
    doc.querySelectorAll('[data-teaching-open]').forEach(a => a.onclick = () => {try {doc.defaultView.sessionStorage.setItem('lili-teaching-date',dayKey());}catch(_){}});
    const b=doc.getElementById('teaching-check'); if(!b)return;
    b.onclick=async () => {
      const target=doc.getElementById('teaching-review'); b.disabled=true;
      const active=students.filter(s => s.active !== false), rows=[], failed=[];
      try {
        // Sequential reads respect Apps Script's shared lock and avoid a burst.
        for (let i=0;i<active.length;i++) {
          target.textContent=`Проверяю кабинеты: ${i+1} из ${active.length}…`;
          try {const d=await getStudent(active[i].code);for(const h of d.hw || [])if(!h.old && ['submitted','help'].includes(h.status))rows.push({student:active[i],h});}catch(e){failed.push(active[i].name);if(String(e.message)==='bad_password')break;}
        }
        rows.sort((a,b) => (a.h.status==='help'?0:1)-(b.h.status==='help'?0:1));
        target.innerHTML=(rows.length?`<ul class="teaching-review">${rows.map(({student,h})=>`<li><span class="kchip ${h.status==='help'?'gap':'shaky'}">${h.status==='help'?'Нужна помощь':'На проверке'}</span><b>${esc(student.name)}</b><span>${esc(h.t)}</span><a class="chip" href="#lilia-${esc(student.code)}">Открыть кабинет</a></li>`).join('')}</ul>`:'<p>Новых работ и вопросов не найдено.</p>')+(failed.length?`<p class="ferr">Не удалось проверить: ${failed.map(esc).join(', ')}. Повтори загрузку.</p>`:'')+`<p class="note">Проверено ${new Date().toLocaleTimeString('ru-RU',{timeZone:ZONE,hour:'2-digit',minute:'2-digit'})} по Самаре</p>`;
      } finally { b.disabled=false; }
    };
  }
  function journalHTML(storage,code,student,requested) {
    let list=[]; let error='';
    try {list=cards(storage,code);}catch(e){error=e.message;}
    let desired=requested;
    try{desired=desired || new URLSearchParams(root.location.search).get('lesson');}catch(_){}
    const found=list.find(x => x.id===desired) || list.find(x => x.date===dayKey());
    const c=drafts.get(code) || found || {id:'',date:dayKey(),time:'',topic:student.topic || '',plan:'',materials:'',summary:''};
    return `<section class="card teaching-journal" id="teaching-journal"><div class="sh"><h2>Карточка занятия</h2><span class="sub">Личный журнал</span></div><p class="note">План и итоги видишь только ты. Журнал хранится в этом браузере; выгружай копию для другого устройства.</p>${backupHTML()}<label class="fld"><span>История занятий</span><select id="jl-select"><option value="">Новое занятие</option>${list.map(x=>`<option value="${esc(x.id)}" ${c.id===x.id?'selected':''}>${esc(x.date)} ${esc(x.time)} · ${esc(x.topic || 'Без темы')}</option>`).join('')}</select></label><form id="jl-form"><input type="hidden" name="id" value="${esc(c.id)}"><div class="fgrid"><label class="fld"><span>Дата</span><input type="date" name="date" required value="${esc(c.date)}"></label><label class="fld"><span>Время по Самаре</span><input type="time" name="time" value="${esc(c.time)}"></label></div><label class="fld"><span>Тема этого занятия</span><input name="topic" maxlength="300" required value="${esc(c.topic)}"></label><details class="teaching-notes"><summary>План, материалы и итог</summary><label class="fld"><span>Личный план</span><textarea name="plan" maxlength="10000" rows="3">${esc(c.plan)}</textarea></label><label class="fld"><span>Ссылки на материалы, каждая с новой строки</span><textarea name="materials" maxlength="5000" rows="2" placeholder="https://lilimath.ru/…">${esc(c.materials)}</textarea></label><div class="focus-actions" id="jl-materials"></div><label class="fld"><span>Итог и что повторить</span><textarea name="summary" maxlength="5000" rows="2">${esc(c.summary)}</textarea></label></details><p class="ferr" role="status" id="jl-status">${esc(error)}</p><div class="focus-actions"><button class="btn" type="submit">Сохранить карточку</button><button class="btn ghost" type="button" id="jl-start">Начать урок на доске</button><button class="btn ghost" type="button" id="jl-video">Урок с видео</button><a class="chip" href="#hwcard">Выдать домашку</a></div></form></section>`;
  }
  function bindJournal(doc,code,student,{teacherURL,refresh,notify}) {
    const form=doc.getElementById('jl-form');if(!form)return;
    let dirty=drafts.has(code);
    if(dirty)form.dataset.dirty='1';
    const status=doc.getElementById('jl-status');
    const save=() => {
      const value={};for(const k of ['id','date','time','topic','plan','materials','summary'])value[k]=form.elements.namedItem(k).value.trim();
      value.id=value.id || doc.defaultView.crypto.randomUUID();
      const c=saveCard(doc.defaultView.localStorage,code,value);form.elements.namedItem('id').value=c.id;dirty=false;delete form.dataset.dirty;drafts.delete(code);status.textContent='Карточка сохранена в этом браузере.';return c;
    };
    const materials=() => {
      const box=doc.getElementById('jl-materials');box.replaceChildren();
      for(const raw of form.elements.namedItem('materials').value.split('\n').filter(x=>x.trim()).slice(0,20)) {
        try{const url=new URL(raw.trim());if(url.protocol!=='https:' || !['lilimath.ru','www.lilimath.ru','liliya-math.github.io'].includes(url.hostname))continue;const a=doc.createElement('a');a.className='chip';a.href=url.href;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Материал: '+url.pathname.split('/').pop();box.append(a);}catch(_){}
      }
    };
    materials();
    form.oninput=() => {dirty=true;form.dataset.dirty='1';status.textContent='Есть несохранённые изменения.';materials();};
    form.onsubmit=e=>{e.preventDefault();if(!form.reportValidity())return;try{const c=save();refresh(c.id);notify('Карточка сохранена в этом браузере.');}catch(err){status.textContent='Не удалось сохранить: '+err.message;}};
    doc.getElementById('jl-select').onchange=e=>{
      if(dirty && !doc.defaultView.confirm('Есть несохранённые изменения. Переключить карточку?')){e.target.value=form.elements.namedItem('id').value;return;}
      drafts.delete(code);delete form.dataset.dirty;
      if(e.target.value) {refresh(e.target.value);return;}
      form.reset();for(const k of ['id','plan','materials','summary'])form.elements.namedItem(k).value='';form.elements.namedItem('date').value=dayKey();form.elements.namedItem('topic').value=student.topic || '';status.textContent='Новая карточка ещё не сохранена.';dirty=false;materials();
    };
    const start=video=>{
      if(!form.reportValidity())return;
      try {const raw=teacherURL();if(!raw)throw new Error('Сначала добавь свою учительскую ссылку в настройках ученика.');const c=save();const u=boardURL(raw,{code,name:student.name,teacher:true,card:c,start:true,video});doc.defaultView.open(u,'_blank','noopener,noreferrer');status.textContent='Карточка сохранена. Доска открывается в новой вкладке. Если её нет, разреши всплывающие окна для сайта.';}catch(e){status.textContent=e.message;}
    };
    doc.getElementById('jl-start').onclick=()=>start(false);doc.getElementById('jl-video').onclick=()=>start(true);
    const guard=e=>{if(dirty){e.preventDefault();e.returnValue='';}};
    if(doc.defaultView.__liliJournalGuard)doc.defaultView.removeEventListener('beforeunload',doc.defaultView.__liliJournalGuard);
    doc.defaultView.__liliJournalGuard=guard;doc.defaultView.addEventListener('beforeunload',guard);
    bindBackup(doc,()=>refresh(),notify);
  }
  const api={moveJournal,preserveDraft,dayKey,schedule,cards,saveCard,restore,read,boardURL,todayHTML,bindToday,journalHTML,bindJournal,backupHTML,bindBackup};
  if(typeof module!=='undefined' && module.exports)module.exports=api;else root.LiliTeaching=api;
})(typeof window==='undefined'?globalThis:window);
