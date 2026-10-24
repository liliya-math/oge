/* Same-origin, per-student/per-assignment checkpoints. No network requests. */
(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  const pupil = params.get('lili_student'), hw = params.get('lili_hw');
  if (!pupil || !hw || pupil.length > 100 || hw.length > 100) return;
  const page = location.pathname;
  const suffix = ':cab:' + encodeURIComponent(pupil) + ':' + encodeURIComponent(hw);
  const indexKey = 'lili-resume-v1:' + pupil;
  const key = indexKey + ':' + hw + ':' + page;
  let data = read(key) || {drafts:{}};
  let position = '', restoring = false, storageOK = true;
  function read(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (_) { return null; } }
  function write(k,v) { try { localStorage.setItem(k,JSON.stringify(v)); return true; } catch (_) { storageOK=false; return false; } }
  function record(meta = {}) {
    data = {...data,...meta,at:Date.now(),path:page,hw};
    if (!write(key,data)) return;
    const index=read(indexKey)||{};
    index[hw]={at:data.at,path:page,hw,label:data.label||'',done:!!data.done,current:data.current,total:data.total};
    write(indexKey,index);
  }
  function fields() { return [...document.querySelectorAll('input:not([type=file]):not([type=password]):not([type=hidden]),textarea')].filter(el=>el.id && !el.closest('[data-lili-bar]')); }
  function capture() {
    if(restoring || !position) return;
    const values={};fields().forEach(el=>values[el.id]=el.value);
    const selected=[...document.querySelectorAll('.opt.sel,.seg button.sel')].map(el=>({v:el.dataset.v,group:el.closest('.seg')?.dataset.i ?? null}));
    data.drafts=data.drafts||{};data.drafts[position]={values,selected};record();
  }
  function restore() {
    const draft=data.drafts?.[position];if(!draft)return;
    restoring=true;
    fields().forEach(el=>{if(!el.disabled && Object.hasOwn(draft.values||{},el.id))el.value=String(draft.values[el.id]);});
    (draft.selected||[]).forEach(sel=>{
      const el=[...document.querySelectorAll(sel.group===null?'.opt':'.seg button')].find(el=>el.dataset.v===sel.v && (sel.group===null||el.closest('.seg')?.dataset.i===sel.group));
      if(el&&!el.disabled)el.click();
    });
    restoring=false;
  }
  window.LiliStudy={suffix,
    load:()=>data.snapshot||null,
    snapshot:(snapshot,meta={})=>record({...meta,snapshot}),
    task:(id,meta={})=>{position=String(id);record({...meta,position});restore();},
    view:(id)=>data.position===String(id)+':think'?'think':'ans',
    clear:()=>{data={drafts:{}};position='';record({done:false,label:''});},
    report:record,
    resume:params.get('lili_resume')==='1',
    get storageOK(){return storageOK;}
  };
  document.addEventListener('input',capture);
  document.addEventListener('click',event=>{if(event.target.closest('.opt,.seg'))queueMicrotask(capture);});
  addEventListener('pagehide',capture);
  document.addEventListener('DOMContentLoaded',()=>{
    const bar=document.createElement('div');bar.dataset.liliBar='';
    bar.style.cssText='position:relative;z-index:30;display:flex;gap:12px;justify-content:space-between;align-items:center;flex-wrap:wrap;padding:10px 18px;background:#1b2b28;color:#f3ece2;border-bottom:1px solid #456050;font:13px/1.5 -apple-system,BlinkMacSystemFont,Arial,sans-serif';
    const back=document.createElement('a');back.href='kabinet.html#'+encodeURIComponent(pupil);back.textContent='← В мой кабинет';back.style.color='#f5dc6a';
    const note=document.createElement('span');note.textContent=storageOK?'Место и черновик сохраняются в этом браузере':'Сохранение недоступно: не закрывай страницу';
    bar.append(back,note);document.body.prepend(bar);
  });
})();
