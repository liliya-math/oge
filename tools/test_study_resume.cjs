const vm=require('vm'),fs=require('fs'),assert=require('node:assert/strict');
const source=fs.readFileSync('tools/study-resume.js','utf8');
const store=new Map();
function boot(student='a',hw='1',blocked=false){
 const events={},input={id:'inp',value:'',disabled:false,closest:()=>null};
 const ctx={URLSearchParams,location:{search:`?lili_student=${student}&lili_hw=${hw}&lili_resume=1`,pathname:'/dz.html'},window:{},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>{if(blocked)throw Error('quota');store.set(k,v)}},document:{addEventListener:(e,f)=>events[e]=f,querySelectorAll:s=>s.startsWith('input')?[input]:[]},addEventListener:(e,f)=>events[e]=f,queueMicrotask:f=>f(),Object,Date};
 vm.createContext(ctx);vm.runInContext(source,ctx);return {api:ctx.window.LiliStudy,input,events};
}
let a=boot();a.api.task('2:ans',{current:3,total:16,label:'Задание 3 из 16'});a.input.value='40; 140';a.events.input();
a=boot();a.api.task('2:ans');assert.equal(a.input.value,'40; 140');
a.api.snapshot({ti:2,si:1},{current:3,total:5});assert.equal(boot().api.load().si,1);
assert.equal(boot('b').api.load(),null);assert.equal(boot('a','2').api.load(),null);
a.api.task('2:think');assert.equal(boot().api.view(2),'think');assert.equal(boot().api.view(3),'ans');
a.api.clear();assert.equal(boot().api.load(),null);a=boot();a.api.task('2:ans');assert.equal(a.input.value,'');
a=boot('q','1',true);assert.doesNotThrow(()=>a.api.report({current:2}));assert.equal(a.api.storageOK,false);
const idx=JSON.parse(store.get('lili-resume-v1:a'));assert.equal(idx['1'].path,'/dz.html');
console.log('Resume checks passed: draft, position, native snapshot, pupil/assignment isolation, reset and blocked storage.');
