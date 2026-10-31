(function(root){
'use strict';
const ORIGIN='https://liliya-math.github.io';
const handles=new Map();
function identity(raw){try{const u=new URL(raw);if(u.origin!==ORIGIN||u.pathname!=='/excalidraw/'||u.username||u.password)return null;const m=/^#room=([\w-]+),([\w-]{22})(?:;(teacher|student)=([\w-]{32,128}))?$/.exec(u.hash);return m?{url:u,id:m[1],key:m[2],role:m[3]||'shared',token:m[4]||''}:null;}catch(_){return null;}}
function targetName(raw){const p=identity(raw);if(!p)return '';let h=2166136261;for(const c of p.key+'|'+p.token)h=Math.imul(h^c.charCodeAt(0),16777619);return 'lili-board-'+p.id+'-'+p.role+'-'+(h>>>0).toString(36);}
function open(doc,raw){
 const win=doc.defaultView,p=identity(raw);if(!p)return Promise.resolve({status:'invalid'});
 const name=targetName(raw);let child=handles.get(name);
 if(!child||child.closed){child=win.open('',name);if(!child)return Promise.resolve({status:'blocked'});handles.set(name,child);}
 try{if(child.location.href==='about:blank'||new URL(child.location.href).origin===win.location.origin){child.location.replace(p.url.href);child.focus();return Promise.resolve({status:'opened'});}}catch(_){}
 child.focus();
 return new Promise(resolve=>{
  const requestId=win.crypto.randomUUID();let timer;
  const done=status=>{win.clearTimeout(timer);win.removeEventListener('message',receive);resolve({status});};
  const receive=e=>{if(e.source===child&&e.origin===ORIGIN&&e.data?.type==='lili-board-opened'&&e.data.requestId===requestId)done(e.data.accepted?'reused':'mismatch');};
  win.addEventListener('message',receive);timer=win.setTimeout(()=>done('focused'),1800);
  const publicURL=new URL(p.url.href);publicURL.hash='';
  win.crypto.subtle.digest('SHA-256',new TextEncoder().encode(p.url.hash)).then(bytes=>{const access=Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');child.postMessage({type:'lili-board-open',requestId,url:publicURL.href,access},ORIGIN);}).catch(()=>done('focused'));
 });
}
function feedback(result,notify){if(result.status==='blocked')notify('Разреши открытие вкладок для сайта или открой ссылку через меню браузера.');else if(result.status==='focused')notify('Перешла к открытой доске. Для передачи нового задания обнови её до последней версии.');else if(result.status==='mismatch')notify('Открытая вкладка использует другую ссылку доступа. Закрой её и повтори переход.');}
function bind(doc,notify=()=>{}){
 doc.addEventListener('click',e=>{
  if(e.defaultPrevented||e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
  const a=e.target.closest?.('a[href]');if(!a||a.hasAttribute('download')||!identity(a.href))return;
  e.preventDefault();open(doc,a.href).then(r=>feedback(r,notify));
 });
}
const api={identity,targetName,open,bind,feedback};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.LiliBoardWindows=api;
})(typeof window==='undefined'?globalThis:window);
