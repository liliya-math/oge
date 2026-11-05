const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../kabinet.html'),'utf8');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function scheduler(){
 const calls=[],pending=[];
 const ctx={Promise,Map,busy:0,API:'https://example.test',PASS:'password',CODE:'',setBusy(){},logout(){},
  tableRequest(url,options,readOnly){const payload=JSON.parse(options.body);calls.push({payload,readOnly});return new Promise((resolve,reject)=>pending.push({resolve,reject}));}};
 vm.createContext(ctx);
 vm.runInContext(html.slice(html.indexOf('const adminQueue=[];'),html.indexOf('function logout(')),ctx);
 return {ctx,calls,pending};
}
test('foreground action skips waiting background reads; writes stay serialized',async()=>{
 const {ctx,calls,pending}=scheduler();
 const a=ctx.adm('get',{t:'a'},{background:true});
 const b=ctx.adm('get',{t:'b'},{background:true});
 const w1=ctx.adm('student',{t:'c',fields:{topic:'one'}});
 const w2=ctx.adm('student',{t:'c',fields:{topic:'two'}});
 await tick();assert.equal(calls.length,1);assert.equal(calls[0].payload.t,'a');
 pending.shift().resolve({ok:true});await a;await tick();
 assert.equal(calls[1].payload.fields.topic,'one');assert.equal(calls[1].readOnly,false);
 pending.shift().resolve({ok:true});await w1;await tick();
 assert.equal(calls[2].payload.fields.topic,'two');
 pending.shift().resolve({ok:true});await w2;await tick();
 assert.equal(calls[3].payload.t,'b');pending.shift().resolve({ok:true});await b;
});
test('foreground read promotes identical queued background read without duplicating it',async()=>{
 const {ctx,calls,pending}=scheduler();
 const first=ctx.adm('get',{t:'a'},{background:true});
 const other=ctx.adm('get',{t:'b'},{background:true});
 const target=ctx.adm('get',{t:'c'},{background:true});
 assert.equal(ctx.adm('get',{t:'c'}),target);
 await tick();pending.shift().resolve({ok:true});await first;await tick();
 assert.equal(calls[1].payload.t,'c');pending.shift().resolve({ok:true});await target;await tick();
 assert.equal(calls[2].payload.t,'b');pending.shift().resolve({ok:true});await other;
 assert.equal(calls.length,3);
});
test('failed request releases queue and permits a fresh retry',async()=>{
 const {ctx,calls,pending}=scheduler();
 const first=ctx.adm('get',{t:'a'});const caught=assert.rejects(first,/network/);
 const next=ctx.adm('get',{t:'b'});await tick();
 pending.shift().reject(new Error('network'));await caught;await tick();
 assert.equal(calls.length,2);pending.shift().resolve({ok:true});await next;await tick();
 const retry=ctx.adm('get',{t:'a'});await tick();assert.equal(calls.length,3);
 pending.shift().resolve({ok:true});await retry;
});
function feed(){
 const refresh={disabled:false},results={innerHTML:''};
 const box={isConnected:true,innerHTML:'',querySelector:s=>s==='[data-feed-refresh]'?refresh:results};
 const calls=[],pending=[],cache=new Map();
 const ctx={document:{getElementById:()=>box},Promise,Date,FEED_ORD:{help:0,submitted:1,revise:2,solving:3},WF_LABEL:{submitted:'На проверке'},esc:String,
 tCacheGet:k=>cache.get(k),tCacheSet:(k,v)=>cache.set(k,v),
 adm(op,x,options){calls.push({op,x,options});return new Promise((resolve,reject)=>pending.push({resolve,reject}));}};
 vm.createContext(ctx);vm.runInContext(html.slice(html.indexOf('function tFeed(L)'),html.indexOf('function tFail(')),ctx);
 return {ctx,box,refresh,results,calls,pending,cache};
}
test('opening teacher list does not fetch all student cabinets; explicit refresh reads one at a time',async()=>{
 const {ctx,refresh,calls,pending,results,cache}=feed();
 ctx.tFeed([{code:'a',name:'A',active:true},{code:'b',name:'B',active:true},{code:'off',name:'Off',active:false}]);
 assert.equal(calls.length,0);
 const run=refresh.onclick();assert.equal(calls.length,1);assert.equal(calls[0].options.background,true);
 await refresh.onclick();assert.equal(calls.length,1);
 pending.shift().resolve({d:{hw:[{status:'submitted',t:'Task'}]}});await tick();
 assert.equal(calls.length,2);assert.equal(calls[1].x.t,'b');
 pending.shift().resolve({d:{hw:[]}});await run;
 assert.equal(refresh.disabled,false);assert(results.innerHTML.includes('Task'));
 assert(cache.has('cab-t-get:a'));assert(cache.has('cab-t-get:b'));
});
test('leaving teacher list stops further background reads',async()=>{
 const {ctx,refresh,box,calls,pending}=feed();
 ctx.tFeed([{code:'a',name:'A',active:true},{code:'b',name:'B',active:true}]);
 const run=refresh.onclick();box.isConnected=false;
 pending.shift().resolve({d:{hw:[]}});await run;assert.equal(calls.length,1);
});
test('cached feed is explicitly marked as old and requires no request',()=>{
 const {ctx,cache,calls,results}=feed();cache.set('cab-t-get:a',{hw:[{status:'submitted',t:'Old task'}]});
 ctx.tFeed([{code:'a',name:'A',active:true}]);
 assert.equal(calls.length,0);assert(results.innerHTML.includes('Последние загруженные данные'));
 assert(results.innerHTML.includes('Old task'));
});
