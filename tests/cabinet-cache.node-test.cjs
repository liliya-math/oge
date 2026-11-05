const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),zlib=require('node:zlib');
function setup(){
 const cache=new Map();let builds=0,value=0;
 const blob=data=>({getBytes:()=>Buffer.from(data),getDataAsString:()=>Buffer.from(data).toString()});
 const ctx={CacheService:{getScriptCache:()=>({get:k=>cache.get(k)||null,put:(k,v)=>cache.set(k,v),putAll:parts=>Object.entries(parts).forEach(([k,v])=>cache.set(k,v)),getAll:keys=>Object.fromEntries(keys.filter(k=>cache.has(k)).map(k=>[k,cache.get(k)]))})},
 Utilities:{newBlob:blob,gzip:b=>blob(zlib.gzipSync(b.getBytes())),ungzip:b=>blob(zlib.gunzipSync(b.getBytes())),base64Encode:b=>Buffer.from(b).toString('base64'),base64Decode:s=>Buffer.from(s,'base64')}};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../kabinet-apps-script.txt'),'utf8'),ctx);
 ctx.json_=x=>x;
 ctx.adminRun_=body=>{
  if(body.admin!=='valid')return {error:'bad_password'};
  if(['get','list','ping'].includes(body.op))return ctx.cachedRead_(body.op,()=>{builds++;return {ok:true,value};});
  if(body.op==='failingWrite')throw Error('write failed');
  value++;return {ok:true};
 };
 // Exercise the real doPost and admin_ invalidation boundaries without a sheet.
 ctx.doPostRun_=e=>{const b=JSON.parse(e.postData.contents);if(b.admin!==undefined)return ctx.admin_(b);value++;return {ok:true};};
 const call=body=>ctx.doPost({postData:{contents:JSON.stringify(body)}});
 return {ctx,cache,call,builds:()=>builds};
}
test('repeated teacher reads reuse cached responses across POSTs',()=>{
 const s=setup();s.call({admin:'valid',op:'get'});s.call({admin:'valid',op:'get'});assert.equal(s.builds(),1);
 s.call({admin:'valid',op:'list'});s.call({admin:'valid',op:'get'});assert.equal(s.builds(),2);
});
test('teacher writes invalidate responses and next read sees changed data',()=>{
 const s=setup();assert.equal(s.call({admin:'valid',op:'get'}).value,0);
 s.call({admin:'valid',op:'student'});assert.equal(s.call({admin:'valid',op:'get'}).value,1);assert.equal(s.builds(),2);
});
test('student writes also invalidate teacher responses',()=>{
 const s=setup();s.call({admin:'valid',op:'get'});s.call({t:'student',done:true});
 assert.equal(s.call({admin:'valid',op:'get'}).value,1);assert.equal(s.builds(),2);
});
test('denied reads do not invalidate or obtain a cached private response',()=>{
 const s=setup();s.call({admin:'valid',op:'get'});
 assert.equal(s.call({admin:'wrong',op:'get'}).error,'bad_password');
 s.call({admin:'valid',op:'get'});assert.equal(s.builds(),1);
});
test('failed writes and manual sheet edits still invalidate cached responses',()=>{
 const s=setup();s.call({admin:'valid',op:'get'});
 assert.throws(()=>s.call({admin:'valid',op:'failingWrite'}),/write failed/);
 s.call({admin:'valid',op:'get'});assert.equal(s.builds(),2);
 s.ctx.onEdit();s.call({admin:'valid',op:'get'});assert.equal(s.builds(),3);
});
