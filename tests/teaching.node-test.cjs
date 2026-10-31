const {test}=require('node:test');
const assert=require('node:assert/strict');
const teaching=require('../assets/lili-teaching.js');
const links=require('../assets/lili-board-links.js');
const {webcrypto}=require('node:crypto');
const storage=()=>{const m=new Map();return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v)}};
const card=(id='one')=>({id,date:'2026-10-31',time:'18:00',topic:'Корни',plan:'План только учителя',summary:'Повторить',materials:''});
test('today uses Samara across midnight, excludes paused pupils and flags overlaps',()=>{
 const now=Date.parse('2026-10-30T21:00:00Z');
 assert.equal(teaching.dayKey(now),'2026-10-31');
 const pupils=[{code:'a',name:'А',active:true},{code:'b',name:'Б',active:true},{code:'c',name:'В',active:false}];
 const agenda=teaching.schedule(pupils,()=>({slots:[{wd:6,h:0,m:30}]}),now);
 assert.equal(agenda.length,2);assert(agenda.every(x=>x.state==='live'&&x.conflict));
 const ended=teaching.schedule([pupils[0]],()=>({slots:[{wd:6,h:0,m:30}]}),Date.parse('2026-10-30T22:00:00Z'));
 assert.equal(ended[0].state,'past');assert.equal(ended[0].conflict,false);
});
test('journal separates pupils, keeps lesson history, and surfaces storage errors',()=>{
 const s=storage();teaching.saveCard(s,'alice',card());teaching.saveCard(s,'alice',card('two'));teaching.saveCard(s,'bob',{...card(),topic:'Дроби'});
 assert.equal(teaching.cards(s,'alice').length,2);assert.equal(teaching.cards(s,'bob')[0].topic,'Дроби');
 teaching.saveCard(s,'alice',{...card(),summary:'Итог'});assert.equal(teaching.cards(s,'alice').length,2);
 assert.throws(()=>teaching.saveCard({getItem:()=>null,setItem:()=>{throw Error('quota')}},'alice',card()),/quota/);
 assert.throws(()=>teaching.saveCard(s,'alice',{...card(),date:'2026-02-30'}));
});
test('restore is validated before writing and preserves newer records',()=>{
 const s=storage();teaching.saveCard(s,'alice',card());const fresh=teaching.cards(s,'alice')[0];
 teaching.restore(s,{version:1,students:{alice:[{...fresh,updated:1,topic:'Старое'}],bob:[card()]}});
 assert.equal(teaching.cards(s,'alice')[0].topic,'Корни');assert.equal(teaching.cards(s,'bob').length,1);
 const before=JSON.stringify(teaching.read(s));assert.throws(()=>teaching.restore(s,{version:1,students:{alice:[card('three')],bad:[{}]}}));assert.equal(JSON.stringify(teaching.read(s)),before);
});
test('lesson links carry public context only and stored links discard transient context',async()=>{
 const p=await links.createPair(webcrypto);
 const teacher=teaching.boardURL(p.teacher,{code:'alice',name:'Алиса',teacher:true,card:card(),start:true,video:true});
 const pupil=teaching.boardURL(p.student,{code:'alice',name:'Алиса'});
 assert(links.sameRoom(teacher,pupil));assert(!pupil.includes(links.parse(p.teacher).token));assert(!teacher.includes('План только учителя'));
 assert.equal(new URL(teacher).searchParams.get('startLesson'),'1');assert.equal(new URL(pupil).searchParams.get('cabinetRole'),'student');
 const clean=links.checkPair(pupil,teacher);assert.equal(clean.teacher,p.teacher);assert.equal(clean.student,p.student);
 assert(!teaching.todayHTML([{code:'x',name:'<script>bad</script>',days:'',time:''}],()=>({slots:[{wd:6,h:18,m:0}]}),Date.parse('2026-10-31T12:00Z')).includes('<script>'));
});

test('changing the pupil cabinet code keeps lesson history under the new code',()=>{
 const s=storage();teaching.saveCard(s,'alice',card());teaching.saveCard(s,'newalice',card('two'));
 teaching.moveJournal(s,'alice','newalice');assert.equal(teaching.cards(s,'newalice').length,2);assert.equal(teaching.cards(s,'alice').length,1);
});
