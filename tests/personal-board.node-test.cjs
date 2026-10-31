const {test}=require('node:test');
const assert=require('node:assert/strict');
const {webcrypto}=require('node:crypto');
const personal=require('../assets/lili-personal-board.js');
const links=require('../assets/lili-board-links.js');
test('persistent personal teacher room separate from student records',async()=>{
 const data=new Map(),win={crypto:webcrypto,localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)}};
 const [first,second]=await Promise.all([personal.ensure(win,links),personal.ensure(win,links)]);
 assert.equal(first,second);assert.equal(await personal.ensure(win,links),first);
 assert.equal(links.parse(first).role,'teacher');assert.equal(new URL(first).searchParams.get('personal'),'1');assert.equal(data.size,1);
});
