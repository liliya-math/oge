const {test}=require('node:test'),assert=require('node:assert/strict');
const {bind}=require('../assets/lili-board-cloud.js');
test('account broker rejects foreign origin/source and keeps password inside cabinet',async()=>{
 let listener,calls=[],messages=[],nodes={};const nonce='12345678-1234-1234-1234-123456789012';
 const opener={postMessage:(data,origin)=>messages.push({data,origin})};
 const win={location:{search:'?boardCloud='+nonce},opener,addEventListener:(type,fn)=>{listener=fn;}};
 const doc={defaultView:win,getElementById:id=>nodes[id],querySelector:()=>({prepend:el=>{nodes[el.id]=el;}}),createElement:()=>({setAttribute(){}})};
 bind(doc,{password:()=> 'test-cabinet-password',request:async(op)=>{calls.push(op);return op==='ping'?{boardLibrary:1}:{library:{version:1,revision:0,templates:[]}};},links:{},notify(){}});
 await new Promise(resolve=>setImmediate(resolve));assert.equal(messages[0].data.stage,'ready');assert.equal(messages[0].origin,'https://liliya-math.github.io');
 const request={type:'lili-cloud-request',nonce,action:'get'};
 await listener({origin:'https://evil.example',source:opener,data:request});assert.deepEqual(calls,['ping']);
 await listener({origin:'https://liliya-math.github.io',source:{},data:request});assert.deepEqual(calls,['ping']);
 await listener({origin:'https://liliya-math.github.io',source:opener,data:request});assert.deepEqual(calls,['ping','boardLibraryGet']);assert.equal(messages[1].data.stage,'loaded');assert(!JSON.stringify(messages).includes('test-cabinet-password'));
});
