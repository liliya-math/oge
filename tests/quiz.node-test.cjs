const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const Q=require('../assets/quiz-core.js');
function env(){
let uid=0;const sheets=new Map();
class Sheet{constructor(name,rows=[]){this.name=name;this.rows=rows;this.cols=22;}getLastRow(){return this.rows.length;}getLastColumn(){return Math.max(1,...this.rows.map(r=>r.length));}getMaxColumns(){return this.cols;}insertColumnsAfter(n,c){this.cols+=c;}setFrozenRows(){}appendRow(r){this.rows.push([...r]);}getRange(row,col,n=1,w=1){const sh=this;return {getValues(){return Array.from({length:n},(_,i)=>Array.from({length:w},(_,j)=>sh.rows[row+i-1]?.[col+j-1]??''));},setValues(values){values.forEach((r,i)=>{sh.rows[row+i-1]||=[];r.forEach((v,j)=>sh.rows[row+i-1][col+j-1]=v);});},getDisplayValue(){return String(sh.rows[row-1]?.[col-1]||'');},getValue(){return sh.rows[row-1]?.[col-1]||'';}};}}
sheets.set('Ученики',new Sheet('Ученики',[['Код'],['alice','Аня','','','','18:00','','','','','',true],['bob','Боря','','','','18:00','','','','','',true],['off','Неактивен','','','','18:00','','','','','',false]]));
sheets.set('Домашка',new Sheet('Домашка',[['Код']]));
const ss={getSheetByName:n=>sheets.get(n)||null,insertSheet:n=>{const sh=new Sheet(n);sheets.set(n,sh);return sh;}};
const props={getProperty:k=>k==='ADMIN'?'teacher-password':null,setProperty(){}};
const ctx={console,Date,SpreadsheetApp:{getActive:()=>ss},Utilities:{getUuid:()=> 'test-uuid-'+String(++uid).padStart(20,'0'),sleep(){}},PropertiesService:{getScriptProperties:()=>props},LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../kabinet-apps-script.txt'),'utf8'),ctx);vm.runInContext('json_=function(x){return x;};',ctx);
function call(name,...args){ctx.args=args;return JSON.parse(JSON.stringify(vm.runInContext(name+'(...args)',ctx)));}
return {call,sheets,post:b=>call('doPost',{postData:{contents:JSON.stringify(b)}})};
}
test('import roundtrip and answer formats',()=>{
const d=Q.parse(Q.sample);assert.equal(d.tasks.length,4);assert.deepEqual(Q.parse(Q.stringify(d)),d);
assert(Q.same('0,5',{type:'number',answer:'1/2'}));assert(Q.same('1 / 2',{type:'number',answer:'0.5'}));assert(!Q.same('',{type:'number',answer:'0'}));assert(!Q.same('1/0',{type:'number',answer:'0'}));assert(!Q.same('1000000001',{type:'number',answer:'1000000000'}));assert(Q.same('5; -5',{type:'set',answer:'-5;5'}));assert(!Q.same('5;5',{type:'set',answer:'-5;5'}));assert(Q.same('ПРЯМОЙ угол',{type:'text',answer:'прямой угол'}));assert(!Q.same('прям ой',{type:'text',answer:'прямой'}));
});
test('invalid imports fail before publishing',()=>{
for(const s of [Q.sample.replace('Ответ: 9',''),Q.sample.replace('Баллы: 1','Баллы: 0'),Q.sample.replace('Тип: набор','Тип: constructor'),Q.sample.replace('Ответ: -5; 5','Ответ: -5; -5'),Q.sample.replace('Ответ: √36 = 6','Ответ: отсутствует'),Q.sample.replace('Раздел:','Ошибка:')])assert.throws(()=>Q.parse(s));
assert.throws(()=>Q.validate({title:'a',section:'b',tasks:[null]}));assert.throws(()=>Q.parse('x'.repeat(80001)));assert.throws(()=>Q.parse(Q.sample+'\nОтвет: 3'));
});
test('immutable definitions and private assigned loading',()=>{
const e=env(),work=Q.parse(Q.sample),r=e.call('quizSave_',{work});assert(r.ok);assert.equal(r.version,1);
const a=e.call('quizAssign_','alice',{work:r.id,version:1});assert(a.ok);
const params={work:r.id,version:1,assignment:a.assignment,row:a.row};
const load=e.call('quizLoad_','alice',params);assert(load.ok);assert(!('answer' in load.work.tasks[0]));assert.equal(e.call('quizLoad_','bob',params).error,'not_assigned');assert.equal(e.call('quizLoad_','off',params).error,'not_assigned');assert.equal(e.call('quizLoad_','alice',{...params,assignment:'forged'}).error,'not_assigned');
work.title='Новая версия';const next=e.call('quizSave_',{id:r.id,baseVersion:1,work});assert.equal(next.version,2);assert.equal(e.call('quizLoad_','alice',params).work.title,load.work.title);assert.equal(e.call('quizSave_',{id:r.id,baseVersion:1,work}).error,'changed');
});
test('retries idempotent; new attempts preserve 0 → 3 → 5 with server scoring',()=>{
const e=env(),r=e.call('quizSave_',{work:Q.parse(Q.sample)}),a=e.call('quizAssign_','alice',{work:r.id,version:1}),b={work:r.id,version:1,assignment:a.assignment,row:a.row,submission:'submission-000000001',answers:{},score:999,max:999};
let out=e.post({t:'alice',quiz:b});assert.equal(out.result.score,0);assert.equal(out.result.max,5);assert.equal(e.post({t:'alice',quiz:b}).duplicate,true);
b.answers={'1':'9','3':'5; -5'};b.submission='submission-000000002';assert.equal(e.post({t:'alice',quiz:b}).result.score,3);
b.answers={'1':'9','2':'1','3':'-5;5','4':'√36 = 6'};b.submission='submission-000000003';assert.equal(e.post({t:'alice',quiz:b}).result.score,5);
assert.deepEqual(e.call('quizHistory_','alice').map(x=>x.score),[0,3,5]);assert.equal(e.call('quizHistory_','bob').length,0);assert.equal(e.sheets.get('Попытки тестов').rows.length,4);
assert.equal(e.post({t:'bob',quiz:b}).error,'not_assigned');assert.equal(e.post({t:'off',quiz:b}).error,'not_found');assert.equal(e.post({t:'unknown',quiz:b}).error,'not_found');assert.equal(e.post({t:'alice',quiz:{...b,assignment:'another'}}).error,'not_assigned');assert.equal(e.post({t:'alice',quiz:{...b,submission:'different-submission',answers:{'1':'x'.repeat(501)}}}).error,'bad_value');
});
test('teacher password and spreadsheet formula escaping',()=>{
const e=env();assert.equal(e.post({admin:'wrong',op:'quizSave',work:Q.parse(Q.sample)}).error,'bad_password');assert(!e.sheets.has('Тесты'));
const work=Q.parse(Q.sample);work.title='=IMPORTXML("bad")';const r=e.post({admin:'teacher-password',op:'quizSave',work});assert(r.ok);assert.equal(e.sheets.get('Тесты').rows[1][2][0],"'");assert.equal(e.call('quizDefinition_',r.id,1).title,work.title);
});
test('identical browser/server rules and syntax of changed scripts',()=>{
const source=fs.readFileSync(require.resolve('../kabinet-apps-script.txt'),'utf8'),core=fs.readFileSync(require.resolve('../assets/quiz-core.js'),'utf8');assert(source.includes(core));
for(const path of ['../assets/quiz-ui.js','../assets/quiz-builder.js','../assets/quiz-runner.js','../assets/quiz-cabinet.js'])new vm.Script(fs.readFileSync(require.resolve(path),'utf8'));
const html=fs.readFileSync(require.resolve('../kabinet.html'),'utf8');for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))if(m[1].trim())new vm.Script(m[1]);
assert(html.includes('quizCabinetCard(D)+'));assert(html.includes('src="assets/quiz-cabinet.js"'));assert(html.includes('src="assets/quiz-ui.js"'));
const ui={window:{addEventListener(){}},URLSearchParams,Date};vm.createContext(ui);vm.runInContext(fs.readFileSync(require.resolve('../assets/quiz-ui.js'),'utf8'),ui);vm.runInContext(fs.readFileSync(require.resolve('../assets/quiz-cabinet.js'),'utf8'),ui);assert.equal(ui.quizCabinetCard({}), '');assert(ui.quizCabinetCard({quiz:1,quizHistory:[]}).includes('Результаты тестов'));assert(source.includes("'Попытки тестов']\n    .forEach"));
});
