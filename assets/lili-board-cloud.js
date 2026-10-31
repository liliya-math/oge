(function(root){
'use strict';
const ORIGIN='https://liliya-math.github.io';
function bind(doc,{password,request,links,notify}){
 const win=doc.defaultView,nonce=new URLSearchParams(win.location.search).get('boardCloud');
 if(!/^[a-z0-9-]{36}$/i.test(nonce||'')||!win.opener)return;
 if(win.__liliCloudBound){win.__liliCloudReady?.();return;}
 win.__liliCloudBound=true;let inflight=false,ready=false;
 const send=data=>win.opener.postMessage({type:'lili-cloud-account',nonce,...data},ORIGIN);
 const status=text=>{let box=doc.getElementById('board-cloud-status');if(!box){box=doc.createElement('section');box.id='board-cloud-status';box.className='card';box.setAttribute('role','status');(doc.querySelector('.cab')||doc.getElementById('app')).prepend(box);}box.textContent=text;};
 const activate=async()=>{if(!password()||ready||inflight)return;inflight=true;try{const ping=await request('ping');if(ping.boardLibrary!==1)throw new Error('Сервер кабинета ещё не обновлён для хранения библиотеки. Материалы остаются в браузере.');ready=true;status('Кабинет подключён. Синхронизирую личные материалы доски…');send({stage:'ready'});}catch(e){status(e.message);send({error:e.message});}finally{inflight=false;}};
 win.__liliCloudReady=activate;
 const adopt=data=>{const personal=data.personalBoard;if(!personal)return;const parsed=links.parse(personal);if(parsed?.role!=='teacher')throw new Error('Сервер вернул некорректную ссылку личной доски.');const old=win.localStorage.getItem('lili-personal-board-v1');if(old&&old!==personal)win.localStorage.setItem('lili-personal-board-previous',old);win.localStorage.setItem('lili-personal-board-v1',personal);links&&root.LiliPersonalBoard.bind(doc,links,notify);};
 win.addEventListener('message',async event=>{
  if(event.source!==win.opener||event.origin!==ORIGIN||event.data?.type!=='lili-cloud-request'||event.data.nonce!==nonce||!ready||!password()||inflight)return;
  const data=event.data;if(!['get','put'].includes(data.action))return;
  inflight=true;
  try{
   let result;
   if(data.action==='get'){result=await request('boardLibraryGet');adopt(result.library);send({stage:'loaded',data:result.library});}
   else{if(!Array.isArray(data.templates)||data.templates.length>100||JSON.stringify(data.templates).length>40*1024*1024)throw new Error('Библиотека больше 40 МБ или содержит больше 100 материалов.');const personalBoard=await root.LiliPersonalBoard.ensure(win,links);result=await request('boardLibraryPut',{revision:data.revision,templates:data.templates,personalBoard,operationId:nonce});adopt(result.library);send({stage:'saved',data:result.library});status('Библиотека сохранена в аккаунте. Можно вернуться на доску.');}
  }catch(e){const message=e.message==='changed'?'Библиотека изменилась на другом устройстве. Повтори синхронизацию, чтобы объединить изменения.':e.message;status(message);send({error:message});}finally{inflight=false;}
 });
 if(!password())status('Войди в режим учителя для синхронизации библиотеки. Пароль остаётся в кабинете и не передаётся доске.');
 void activate();
}
const api={bind};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.LiliBoardCloud=api;
})(typeof window==='undefined'?globalThis:window);
