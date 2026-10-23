const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const crypto=require('node:crypto');
const source=fs.readFileSync('kabinet-apps-script.txt','utf8');
class Sheet {
 constructor(rows=[]){this.rows=rows.map(r=>r.slice());}
 getLastRow(){let n=this.rows.length;while(n&&!this.rows[n-1].some(v=>v!==''&&v!=null))n--;return n;}
 getLastColumn(){return Math.max(1,...this.rows.map(r=>r.length));}
 getRange(row,col,n=1,m=1){const s=this;return {
  getValues:()=>Array.from({length:n},(_,i)=>Array.from({length:m},(_,j)=>s.rows[row+i-1]?.[col+j-1]??'')),
  getValue:()=>s.rows[row-1]?.[col-1]??'',getDisplayValue:()=>String(s.rows[row-1]?.[col-1]??''),
  setValues(values){values.forEach((r,i)=>r.forEach((v,j)=>{s.rows[row+i-1]??=[];s.rows[row+i-1][col+j-1]=v;}));return this;},
  setValue(value){return this.setValues([[value]]);},
  clearContent(){return this.setValues(Array.from({length:n},()=>Array(m).fill('')));}
 };}
 appendRow(row){this.rows.push(row.slice());return this;}
 deleteRow(row){this.rows.splice(row-1,1);return this;}
 setFrozenRows(){}
}
function env(){
 const tables={},props=new Map([['TG_BOT_TOKEN','123456:fake_token_for_tests_only_1234567'],['TG_BOT_USERNAME','lili_test_bot'],['TG_SPREADSHEET_ID','sheet'],['ADMIN','test-admin']]);
 const ss={getId:()=> 'sheet',getSheetByName:n=>tables[n]||null,insertSheet:n=>(tables[n]=new Sheet()),getSpreadsheetTimeZone:()=> 'Europe/Samara'};
 const messages=[],calls=[],files=new Map(),updates=[];let sendError=0;
 const property={getProperty:k=>props.get(k)||null,setProperty:(k,v)=>props.set(k,v),setProperties:o=>Object.entries(o).forEach(([k,v])=>props.set(k,v)),deleteProperty:k=>props.delete(k)};
 const context={console,Date,Set,Map,JSON,Math,Number,String,Array,Object,RegExp,
  PropertiesService:{getScriptProperties:()=>property},
  SpreadsheetApp:{getActive:()=>ss,openById:()=>ss},
  LockService:{getScriptLock:()=>({tryLock:()=>true,waitLock(){},releaseLock(){}})},
  Utilities:{getUuid:()=>crypto.randomUUID(),DigestAlgorithm:{SHA_256:'sha256'},sleep(){},
   computeDigest:(_,bytes)=>[...crypto.createHash('sha256').update(typeof bytes==='string'?bytes:Buffer.from(bytes)).digest()],
   formatDate:(date,tz,fmt)=>new Date(date).toISOString().slice(0,10)},
  ContentService:{MimeType:{JSON:'json'},createTextOutput:text=>({text,setMimeType(){return this;}})},
  UrlFetchApp:{fetch:(url,opts={})=>{
   calls.push(url);
   if(url.startsWith('https://api.telegram.org/')){
    const op=url.split('/').at(-1),body=JSON.parse(opts.payload||'{}');let result={ok:true,result:true};
    if(op==='sendMessage') {if(sendError)result={ok:false,error_code:sendError};else messages.push(body);}
    if(op==='getUpdates')result={ok:true,result:updates.filter(u=>u.update_id>=body.offset)};
    return {getResponseCode:()=>result.ok?200:sendError,getContentText:()=>JSON.stringify(result)};
   }
   const item=files.get(url)||{status:404,body:'missing'};
   return {getResponseCode:()=>item.status??200,getContent:()=>[...Buffer.from(item.body)]};
  }}
 };
 vm.createContext(context);vm.runInContext(source,context);
 const schema=vm.runInContext('SHEETS',context);Object.entries(schema).forEach(([n,h])=>tables[n]=new Sheet([Array.from(h)]));
 function student(code,active=true){const row=Array(19).fill('');Object.assign(row,{0:code,1:'Тест',2:'Тесту',11:active,13:'geo8',18:8});tables['Ученики'].appendRow(row);}
 function link(code,chat,paused=false){tables.Telegram.appendRow([code,String(chat),true,paused,new Date(),'']);}
 function hw(code,url,title='Трапеция',done=false){tables['Домашка'].appendRow([code,title,'','',url,'',done,'','','']);}
 function post(body){return JSON.parse(context.doPost({postData:{contents:JSON.stringify(body)}}).text);}
 function start(token,chat=123,type='private'){context.telegramHandleUpdate_({message:{chat:{id:chat,type},from:{is_bot:false},text:'/start '+token}});}
 return {c:context,tables,props,files,messages,calls,updates,student,link,hw,post,start,setSendError:v=>{sendError=v;}};
}
function same(a,b){assert.deepEqual(JSON.parse(JSON.stringify(a)),b);}
test('only own-site HTML/PDF URLs are watched; redirect hosts, traversal and other schemes rejected',()=>{
 const e=env();same(e.c.telegramSiteUrl_('domashnee-zadanie-trapeciya.html?x=1#go'),'https://lilimath.ru/domashnee-zadanie-trapeciya.html');
 for(const url of ['https://evil.test/a.html','https://lilimath.ru@evil.test/a.html','http://lilimath.ru/a.html','//evil.test/a.html','../a.html','%2e%2e/a.html','https://lilimath.ru/a.js','javascript:alert(1)','https://lilimath.ru/a\\b.html'])assert.equal(e.c.telegramSiteUrl_(url),'',url);
 assert.equal(e.c.telegramSiteUrl_('https://lilimath.ru/hw.pdf'),'https://lilimath.ru/hw.pdf');
});
test('private one-time links store only a hash; no chat IDs or credentials in public student data',()=>{
 const e=env();e.student('alpha');const r=e.post({t:'alpha',telegram:'connect'});assert.equal(r.ok,true);
 const token=r.url.split('start=')[1];assert.equal(token.length,48);assert(!JSON.stringify(e.tables['Telegram-ссылки'].rows).includes(token));
 e.start(token,123,'group');assert.equal(e.c.telegramState_('alpha').connected,false);
 e.start(token);assert.equal(e.c.telegramState_('alpha').connected,true);assert.equal(e.tables['Telegram-ссылки'].getLastRow(),1);
 const publicData=e.c.studentData_('alpha',false);same(publicData.telegram,{available:true,connected:true,paused:false});
 assert(!JSON.stringify(publicData).includes('123456:'));assert(!JSON.stringify(publicData).includes('chat_id'));assert(!JSON.stringify(publicData).includes('Chat ID'));
 e.start(token,456);assert.equal(e.c.telegramBinding_('alpha').v[1],'123');
});
test('expired and unknown links do not bind, and inactive pupils cannot request or consume a link',()=>{
 const e=env();e.student('alpha');const {url}=e.post({t:'alpha',telegram:'connect'});e.tables['Telegram-ссылки'].rows[1][2]=new Date(0);e.start(url.split('start=')[1]);assert(!e.c.telegramState_('alpha').connected);
 e.student('inactive',false);assert.equal(e.post({t:'inactive',telegram:'connect'}).error,'not_found');assert.equal(e.post({t:'unknown',telegram:'connect'}).error,'not_found');
});
test('another chat cannot take over an existing binding; teacher reset invalidates pending links',()=>{
 const e=env();e.student('alpha');e.link('alpha',123);const token=e.c.telegramConnect_('alpha').url.split('start=')[1];e.start(token,456);assert.equal(e.c.telegramBinding_('alpha').v[1],'123');
 e.c.telegramAdmin_('alpha','telegramReset',{});e.start(token,456);assert(!e.c.telegramState_('alpha').connected);
});
test('first scan is quiet, only changed assigned files notify their own pupils, repeat scan is quiet',()=>{
 const e=env();e.student('alpha');e.student('beta');e.link('alpha',123);e.link('beta',456);e.hw('alpha','one.html');e.hw('beta','two.pdf');
 e.files.set('https://lilimath.ru/one.html',{body:'v1'});e.files.set('https://lilimath.ru/two.pdf',{body:'pdf1'});e.c.scanTelegramHomework();assert.equal(e.messages.length,0);
 e.files.set('https://lilimath.ru/one.html',{body:'v2'});e.c.scanTelegramHomework();assert.equal(e.messages.length,1);assert.equal(e.messages[0].chat_id,'123');
 e.c.scanTelegramHomework();assert.equal(e.messages.length,1);
});
test('same URL fetched once per scan; changes are batched per pupil, including attached PDF',()=>{
 const e=env();for(const [c,id] of [['alpha',123],['beta',456]]){e.student(c);e.link(c,id);e.hw(c,'one.html');}
 e.tables['Файлы'].appendRow(['alpha',2,'Лист','extra.pdf']);e.files.set('https://lilimath.ru/one.html',{body:'v1'});e.files.set('https://lilimath.ru/extra.pdf',{body:'pdf1'});e.c.scanTelegramHomework();
 const count=e.calls.filter(x=>x==='https://lilimath.ru/one.html').length;assert.equal(count,1);
 e.files.set('https://lilimath.ru/one.html',{body:'v2'});e.files.set('https://lilimath.ru/extra.pdf',{body:'pdf2'});e.c.scanTelegramHomework();assert.equal(e.messages.length,2);same(e.messages.map(x=>x.chat_id).sort(),['123','456']);
});
test('404 and empty files preserve baseline; API failure retries without losing change',()=>{
 const e=env();e.student('alpha');e.link('alpha',123);e.hw('alpha','one.html');const url='https://lilimath.ru/one.html';e.files.set(url,{body:'v1'});e.c.scanTelegramHomework();
 e.files.set(url,{status:404,body:'error'});e.c.scanTelegramHomework();assert.equal(e.messages.length,0);
 e.files.set(url,{body:''});e.c.scanTelegramHomework();assert.equal(e.messages.length,0);
 e.files.set(url,{body:'v1'});e.c.scanTelegramHomework();assert.equal(e.messages.length,0);
 e.files.set(url,{body:'v2'});e.setSendError(500);e.c.scanTelegramHomework();assert.equal(e.messages.length,0);
 e.setSendError(0);e.c.scanTelegramHomework();assert.equal(e.messages.length,1);e.c.scanTelegramHomework();assert.equal(e.messages.length,1);
});
test('pause and resume make quiet edits possible, then later changes notify again',()=>{
 const e=env();e.student('alpha');e.link('alpha',123);e.hw('alpha','one.html');const url='https://lilimath.ru/one.html';e.files.set(url,{body:'v1'});e.c.scanTelegramHomework();
 e.c.telegramAdmin_('alpha','telegramPause',{paused:true});e.files.set(url,{body:'v2'});e.c.scanTelegramHomework();assert.equal(e.messages.length,0);
 assert.equal(e.c.telegramHomeworkNotice_('alpha','title','one.html').error,'telegram_paused');
 e.files.set(url,{body:'v3'});e.c.telegramAdmin_('alpha','telegramPause',{paused:false});e.c.scanTelegramHomework();assert.equal(e.messages.length,0);
 e.files.set(url,{body:'v4'});e.c.scanTelegramHomework();assert.equal(e.messages.length,1);
});
test('completed homework, inactive pupils and /stop are excluded; blocked bot disables subscription',()=>{
 const e=env();e.student('alpha');e.student('inactive',false);e.link('alpha',123);e.link('inactive',456);e.hw('alpha','done.html','Done',true);e.hw('inactive','inactive.html');assert.equal(e.c.telegramWatchList_().length,0);
 e.hw('alpha','one.html');e.c.telegramHandleUpdate_({message:{chat:{id:123,type:'private'},from:{is_bot:false},text:'/stop'}});assert.equal(e.c.telegramWatchList_().length,0);
 e.tables.Telegram.rows[1]=['alpha','123',true,false,'',''];e.setSendError(403);assert.equal(e.c.telegramSend_('alpha','text','').error,'telegram_blocked');assert(!e.c.telegramState_('alpha').connected);
});
test('manual sends require teacher password; save without notification sends nothing',()=>{
 const e=env();e.student('alpha');e.link('alpha',123);
 assert.equal(e.c.admin_({admin:'wrong',op:'hwAdd',t:'alpha',text:'task',notify:true}).error,'bad_password');
 const r=e.c.admin_({admin:'test-admin',op:'hwAdd',t:'alpha',text:'Трапеция',url:'one.html',notify:false});assert.equal(r.ok,true);assert.equal(e.messages.length,0);
 const sent=e.c.admin_({admin:'test-admin',op:'hwNotify',t:'alpha',id:2,text:'Трапеция'});assert(sent.notification.ok);assert.equal(e.messages.length,1);
 const next=e.c.admin_({admin:'test-admin',op:'hwAdd',t:'alpha',text:'Вторая',notify:true});assert(next.notification.ok);assert.equal(e.messages.length,2);
 e.post({t:'alpha',op:'hwNotify',id:2,text:'Трапеция'});assert.equal(e.messages.length,2);
});
test('Telegram failure does not duplicate or undo a saved assignment; polling stores offset',()=>{
 const e=env();e.student('alpha');e.link('alpha',123);e.setSendError(500);
 const result=e.c.admin_({admin:'test-admin',op:'hwAdd',t:'alpha',text:'task',notify:true});assert(result.ok);assert.equal(result.notification.ok,false);assert.equal(e.tables['Домашка'].getLastRow(),2);
 e.updates.push({update_id:42,message:{chat:{id:123,type:'private'},from:{is_bot:false},text:'/hi'}});e.c.pollTelegramUpdates();assert.equal(e.props.get('TG_OFFSET'),'43');
});
test('baseline removed with completed assignments; reassignment does not send an old change',()=>{
 const e=env();e.student('alpha');e.link('alpha',123);e.hw('alpha','one.html');const u='https://lilimath.ru/one.html';e.files.set(u,{body:'v1'});e.c.scanTelegramHomework();
 e.tables['Домашка'].rows[1][6]=true;e.c.scanTelegramHomework();assert.equal(e.tables['Telegram-файлы'].getLastRow(),1);
 e.tables['Домашка'].rows[1][6]=false;e.files.set(u,{body:'v2'});e.c.scanTelegramHomework();assert.equal(e.messages.length,0);
});
test('scan budget rotates beyond the first 40 URLs without starving later assignments',()=>{
 const e=env();e.student('alpha');e.link('alpha',123);
 for(let i=0;i<41;i++){const name=String(i).padStart(2,'0')+'.html';e.hw('alpha',name);e.files.set('https://lilimath.ru/'+name,{body:'v1'});}
 e.c.scanTelegramHomework();assert.equal(e.tables['Telegram-файлы'].getLastRow(),41);
 e.c.scanTelegramHomework();assert.equal(e.tables['Telegram-файлы'].getLastRow(),42);assert.equal(e.messages.length,0);
});
test('network exceptions cannot expose token-bearing URLs through return values',()=>{
 const e=env();e.c.UrlFetchApp.fetch=url=>{throw new Error(url);};const r=e.c.telegramApi_('sendMessage',{});same(r,{ok:false,error:'telegram_network_error'});assert(!JSON.stringify(r).includes('123456:'));
});
