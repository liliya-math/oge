const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const Q=require('../assets/quiz-core.js');
function env(){
let uid=0;const sheets=new Map();
class Sheet{constructor(name,rows=[]){this.name=name;this.rows=rows;this.cols=22;}getLastRow(){return this.rows.length;}getLastColumn(){return Math.max(1,...this.rows.map(r=>r.length));}getMaxColumns(){return this.cols;}insertColumnsAfter(n,c){this.cols+=c;}setFrozenRows(){}appendRow(r){this.rows.push([...r]);}deleteRow(n){this.rows.splice(n-1,1);}getRange(row,col,n=1,w=1){const sh=this;return {getValues(){return Array.from({length:n},(_,i)=>Array.from({length:w},(_,j)=>sh.rows[row+i-1]?.[col+j-1]??''));},setValues(values){values.forEach((r,i)=>{sh.rows[row+i-1]||=[];r.forEach((v,j)=>sh.rows[row+i-1][col+j-1]=v);});},getDisplayValue(){return String(sh.rows[row-1]?.[col-1]||'');},getValue(){return sh.rows[row-1]?.[col-1]||'';}};}}
sheets.set('Ученики',new Sheet('Ученики',[['Код'],['alice','Аня','','','','18:00','','','','','',true],['bob','Боря','','','','18:00','','','','','',true],['off','Неактивен','','','','18:00','','','','','',false]]));
sheets.set('Домашка',new Sheet('Домашка',[['Код']]));
const ss={getSheetByName:n=>sheets.get(n)||null,insertSheet:n=>{const sh=new Sheet(n);sheets.set(n,sh);return sh;}};
const tg={},fetches=[];let netDown=false;const props={getProperty:k=>k in tg?tg[k]:(k==='ADMIN'?'teacher-password':null),setProperty(k,v){if(k.startsWith('TG_'))tg[k]=v;},deleteProperty(k){delete tg[k];}};
const ctx={console,Date,SpreadsheetApp:{getActive:()=>ss},Utilities:{getUuid:()=> 'test-uuid-'+String(++uid).padStart(20,'0'),sleep(){},DigestAlgorithm:{SHA_256:'sha256'},computeDigest:(a,v)=>[...require('node:crypto').createHash(a).update(String(v)).digest()].map(b=>b>127?b-256:b)},UrlFetchApp:{fetch(url,o){if(netDown)throw new Error('offline');fetches.push({url,body:JSON.parse(o.payload)});return {getResponseCode:()=>200,getContentText:()=>'{"ok":true,"result":{}}'};}},PropertiesService:{getScriptProperties:()=>props},LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../kabinet-apps-script.txt'),'utf8'),ctx);vm.runInContext('json_=function(x){return x;};',ctx);
function call(name,...args){ctx.args=args;return JSON.parse(JSON.stringify(vm.runInContext(name+'(...args)',ctx))||'null');}
return {call,sheets,tg,fetches,down:v=>{netDown=v;},post:b=>call('doPost',{postData:{contents:JSON.stringify(b)}})};
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
assert(html.includes('quizCabinetCard(D)+'));assert(/src="assets\/quiz-cabinet\.js(?:\?[^"]*)?"/.test(html));assert(html.includes('src="assets/quiz-ui.js"'));
const ui={window:{addEventListener(){}},URLSearchParams,Date};vm.createContext(ui);vm.runInContext(fs.readFileSync(require.resolve('../assets/quiz-ui.js'),'utf8'),ui);vm.runInContext(fs.readFileSync(require.resolve('../assets/quiz-cabinet.js'),'utf8'),ui);assert.equal(ui.quizCabinetCard({}), '');assert(ui.quizCabinetCard({quiz:1,quizHistory:[]}).includes('Результаты тестов'));assert(source.includes("'Попытки тестов']\n    .forEach"));
});

const kindText=k=>'Название: Работа\nРаздел: Алгебра / 9 класс\n'+(k?'Тип работы: '+k+'\n':'')+'\nЗадание: Найди x.\nРисунок: fig-1.svg\nОтвет: 5\nБаллы: 2\nПодсказка: Подумай.\n\nЗадание: 2+2\nОтвет: 4';
test('work kind and figure: parse, validate, roundtrip, pupil view',()=>{
assert.equal(Q.parse(kindText('')).kind,'free');
for(const [t,k] of [['дз','hw'],['сам','self'],['самостоятельная','self'],['контр','exam'],['проверочная','exam']])assert.equal(Q.parse(kindText(t)).kind,k);
assert.throws(()=>Q.parse(kindText('кр')),/Неизвестный тип работы/);
assert.throws(()=>Q.parse(kindText('дз').replace('fig-1.svg','http://x.ru/a.svg')),/рисунок/);
assert.deepEqual(['hw','self','exam','free'].map(Q.tries),[2,1,1,Infinity]);
{const n=Q.parse('Название: А\nРаздел: Б\nУзел: A05, G12\n\nЗадание: x\nУзел: 8G.1.4\nОтвет: 1');assert.equal(n.nodes,undefined);assert.equal(n.tasks[0].nodes,undefined);assert.equal(n.tasks.length,1);assert.ok(!/Узел/.test(Q.stringify(n)));}
assert.throws(()=>Q.parse(kindText('дз').replace('fig-1.svg','../a.svg')),/рисунок/);
assert.equal(Q.parse(kindText('дз').replace('fig-1.svg','fig-1.png')).tasks[0].figure,'fig-1.png');
assert.throws(()=>Q.parse(kindText('дз').replace('fig-1.svg','fig-1.gif')),/рисунок/);
const d=Q.parse(kindText('контр'));assert.equal(Q.stringify(Q.parse(Q.stringify(d))),Q.stringify(d));assert.equal(d.tasks[0].figure,'fig-1.svg');
assert.equal(Q.publicWork(d).tasks[0].hint,'');assert.equal(Q.publicWork(Q.parse(kindText('дз'))).tasks[0].hint,'Подумай.');assert(!('answer' in Q.publicWork(d).tasks[0]));
});
test('сам/контр: one attempt, pupil sees score only, teacher gets task detail',()=>{
const e=env(),r=e.call('quizSave_',{work:Q.parse(kindText('контр'))}),a=e.call('quizAssign_','alice',{work:r.id,version:1});
const b={work:r.id,version:1,assignment:a.assignment,row:a.row,submission:'submission-000000001',answers:{'1':'5','2':'0'},hints:['1'],idk:['2']};
const out=e.post({t:'alice',quiz:b});assert.equal(out.result.score,2);assert.deepEqual(out.result.tasks,[]);assert(!('answers' in out.result));
assert.equal(e.post({t:'alice',quiz:b}).duplicate,true);assert.deepEqual(e.post({t:'alice',quiz:b}).result.tasks,[]);
assert.equal(e.post({t:'alice',quiz:{...b,submission:'submission-000000002'}}).error,'already_done');assert.equal(e.sheets.get('Попытки тестов').rows.length,2);
const pupil=e.call('quizHistory_','alice')[0];assert.equal(pupil.kind,'exam');assert(!('detail' in pupil));assert.equal(pupil.hints,0);
const teacher=e.call('quizHistory_','alice',true)[0];assert.deepEqual(teacher.detail.tasks,[{n:'1',ok:true},{n:'2',ok:false}]);
assert.equal(e.call('quizLoad_','alice',{work:r.id,version:1,assignment:a.assignment,row:a.row}).work.tasks[0].hint,'');
});
test('дз: retries allowed, hints and «не знаю» recorded, detail only for teacher',()=>{
const e=env(),r=e.call('quizSave_',{work:Q.parse(kindText('дз'))}),a=e.call('quizAssign_','alice',{work:r.id,version:1});
const b={work:r.id,version:1,assignment:a.assignment,row:a.row,submission:'submission-000000001',answers:{'1':'7','2':''},hints:['1','1','99'],idk:['2']};
const o1=e.post({t:'alice',quiz:b});assert.equal(o1.result.score,0);assert.equal(o1.result.tasks.length,2);
const o2=e.post({t:'alice',quiz:{...b,submission:'submission-000000002',answers:{'1':'5','2':'4'},hints:[],idk:[]}});assert.equal(o2.result.score,3);
const h=e.call('quizHistory_','alice');assert.deepEqual(h.map(x=>[x.kind,x.hints,x.idk]),[['hw',1,1],['hw',0,0]]);assert(!('detail' in h[0]));
assert.deepEqual(e.call('quizHistory_','alice',true)[0].detail.hints,['1']);
});
test('overall chart and teacher detail render; figure shown',()=>{
const ui={window:{addEventListener(){}},URLSearchParams,Date};vm.createContext(ui);vm.runInContext(fs.readFileSync(require.resolve('../assets/quiz-ui.js'),'utf8'),ui);
const rec=(i,kind,score)=>({work:'w'+i,version:1,assignment:'a'+i,submission:'s'+i,at:'2026-11-0'+i+'T10:00:00Z',title:'Р'+i,section:'Алгебра',kind,hints:0,idk:0,score,max:4});
const html=vm.runInContext('LiliQuizUI',ui).historyHTML([rec(1,'hw',2),rec(2,'self',3),{...rec(3,'exam',4),detail:{tasks:[{n:'1',ok:true}],hints:[],idk:[],seconds:600}}]);
assert(html.includes('Динамика по всех работам'.replace('всех','всем')));assert(html.includes('Контрольная'));assert(html.includes('Разбор по заданиям (только преподавателю)'));
assert(!vm.runInContext('LiliQuizUI',ui).historyHTML([rec(1,'hw',2),rec(2,'self',3)]).includes('Разбор по заданиям'));
assert(vm.runInContext('LiliQuizUI',ui).taskHTML({n:'1',q:'q',type:'number',points:1,hint:'',options:[],figure:'fig-1.svg'},false,'').includes('src="quiz-fig/fig-1.svg"'));
});

function tgEnv(){const e=env();e.tg.TG_BOT_TOKEN='123456:'+'a'.repeat(30);e.tg.TG_BOT_USERNAME='lili_test_bot';return e;}
function bindTeacher(e,chat='777'){const url=e.call('telegramTeacherLink_');const token=/start=([A-Za-z0-9]+)$/.exec(url)[1];e.call('telegramHandleUpdate_',{update_id:1,message:{chat:{id:Number(chat),type:'private'},from:{is_bot:false},text:'/start '+token}});return token;}
test('teacher Telegram: one-time link binds chat; student links and /stop behave',()=>{
const e=tgEnv();assert.equal(e.tg.TG_TEACHER_CHAT,undefined);const token=bindTeacher(e);assert.equal(e.tg.TG_TEACHER_CHAT,'777');
assert(e.fetches.some(f=>f.body.chat_id==='777'&&/Готово/.test(f.body.text)));
// link is single-use and a stranger cannot reuse it
e.call('telegramHandleUpdate_',{update_id:2,message:{chat:{id:999,type:'private'},from:{is_bot:false},text:'/start '+token}});assert.equal(e.tg.TG_TEACHER_CHAT,'777');
// a stranger's /stop does not unbind the teacher
e.call('telegramHandleUpdate_',{update_id:3,message:{chat:{id:999,type:'private'},from:{is_bot:false},text:'/stop'}});assert.equal(e.tg.TG_TEACHER_CHAT,'777');
e.call('telegramHandleUpdate_',{update_id:4,message:{chat:{id:777,type:'private'},from:{is_bot:false},text:'/stop'}});assert.equal(e.tg.TG_TEACHER_CHAT,undefined);
});
test('teacher Telegram: message on each new attempt, never on retries of the same id, never blocks the result',()=>{
const e=tgEnv();bindTeacher(e);const sent=()=>e.fetches.filter(f=>f.body.chat_id==='777'&&/Балл:/.test(f.body.text));
const ex=e.call('quizSave_',{work:Q.parse(kindText('контр'))}),a=e.call('quizAssign_','alice',{work:ex.id,version:1});
const b={work:ex.id,version:1,assignment:a.assignment,row:a.row,submission:'submission-000000001',answers:{'1':'5','2':'0'},seconds:600};
assert.equal(e.post({t:'alice',quiz:b}).result.score,2);assert.equal(sent().length,1);
const m=sent()[0].body;assert(m.text.includes('Аня · Контрольная'));assert(m.text.includes('Балл: 2 из 3 (67%)'));assert(m.text.includes('Неверно: 2'));assert(m.text.includes('Время: 10 мин'));assert(!m.text.includes('Подсказок'));assert(m.reply_markup.inline_keyboard[0][0].url.endsWith('#lilia-alice'));
assert.equal(e.post({t:'alice',quiz:b}).duplicate,true);assert.equal(sent().length,1);
assert.equal(e.post({t:'alice',quiz:{...b,submission:'submission-000000002'}}).error,'already_done');assert.equal(sent().length,1);
// homework: hints, «не знаю», attempt number; network failure must not break the submission
const hw=e.call('quizSave_',{work:Q.parse(kindText('дз'))}),h=e.call('quizAssign_','bob',{work:hw.id,version:1});
const c={work:hw.id,version:1,assignment:h.assignment,row:h.row,submission:'submission-000000003',answers:{'1':'1','2':''},hints:['1'],idk:['2']};
e.post({t:'bob',quiz:c});const t1=sent()[1].body.text;assert(t1.includes('Боря · Домашняя работа'));assert(t1.includes('Подсказок: 1 · «не знаю»: 1'));assert(!t1.includes('попытка'));
e.post({t:'bob',quiz:{...c,submission:'submission-000000004',answers:{'1':'5','2':'4'},hints:[],idk:[]}});assert(sent()[2].body.text.includes('попытка 2'));
assert.equal(e.post({t:'bob',quiz:{...c,submission:'submission-000000006'}}).error,'already_done');assert.equal(e.sheets.get('Попытки тестов').rows.length,4);
const h2=e.call('quizAssign_','bob',{work:hw.id,version:1});
e.down(true);const out=e.post({t:'bob',quiz:{...c,assignment:h2.assignment,row:h2.row,submission:'submission-000000005'}});assert.equal(out.ok,true);assert.equal(e.sheets.get('Попытки тестов').rows.length,5);
});
test('teacher Telegram: silent when teacher is not connected',()=>{
const e=tgEnv();const ex=e.call('quizSave_',{work:Q.parse(kindText('сам'))}),a=e.call('quizAssign_','alice',{work:ex.id,version:1});
assert.equal(e.post({t:'alice',quiz:{work:ex.id,version:1,assignment:a.assignment,row:a.row,submission:'submission-000000001',answers:{}}}).ok,true);assert.equal(e.fetches.length,0);
});
test('OGE part 1: strict shape, one attempt, private correctness survives server history',()=>{
const d={title:'Пробник №1',section:Q.mockSection,kind:'exam',tasks:Array.from({length:19},(_,i)=>({q:'Вычисли '+i,answer:String(i),points:1}))};
assert(Q.isMock(Q.parse(Q.stringify(Q.validate(d)))));
for(const bad of [{...d,kind:'hw'},{...d,tasks:d.tasks.slice(1)},{...d,tasks:d.tasks.map((q,i)=>({...q,points:i?1:2}))}])assert.throws(()=>Q.validate(bad));
const e=env(),w=e.call('quizSave_',{work:d}),a=e.call('quizAssign_','alice',{work:w.id,version:1}),body={work:w.id,version:1,assignment:a.assignment,row:a.row,submission:'mock-submission-000001',answers:{1:'0',2:'wrong'},seconds:600};
const result=e.post({t:'alice',quiz:body});assert(result.ok);assert.equal(result.result.score,1);assert.deepEqual(result.result.tasks,[]);
const h=e.call('quizHistory_','alice')[0];assert(!h.detail);assert.equal(h.mock.tasks.length,19);assert.deepEqual(h.mock.tasks.slice(0,2),[{n:'1',ok:true},{n:'2',ok:false}]);assert(!JSON.stringify(h).includes('answers'));assert.equal(e.call('quizHistory_','bob').length,0);
assert.equal(e.post({t:'alice',quiz:{...body,submission:'mock-submission-000002'}}).error,'already_done');assert.equal(e.post({t:'alice',quiz:body}).duplicate,true);
});
test('mark existing mock retroactively across eligible versions without changing definitions, grades, assignments or attempts',()=>{
const e=env(),d={title:'Старый пробник',section:'ОГЭ / 9 класс',kind:'free',tasks:Array.from({length:19},(_,i)=>({q:'Вычисли '+i,answer:String(i),points:1}))};
const old=e.call('quizSave_',{work:{...d,tasks:d.tasks.slice(0,2)}}),w=e.call('quizSave_',{id:old.id,baseVersion:1,work:d}),a=e.call('quizAssign_','alice',{work:w.id,version:2}),b={work:w.id,version:2,assignment:a.assignment,row:a.row,submission:'legacy-submission-001',answers:{1:'0'}};
assert(e.post({t:'alice',quiz:b}).ok);assert.equal(e.call('quizHistory_','alice')[0].ogePart1,false);
const beforeDefs=JSON.stringify(e.sheets.get('Тесты').rows),beforeAttempts=JSON.stringify(e.sheets.get('Попытки тестов').rows),beforeAssignments=JSON.stringify(e.sheets.get('Домашка').rows);
assert.equal(e.post({admin:'wrong',op:'quizClassify',work:w.id,version:2,enabled:true}).error,'bad_password');
assert.equal(e.post({t:'alice',op:'quizClassify',work:w.id,version:2,enabled:true}).error,'no_task');
const r=e.post({admin:'teacher-password',op:'quizClassify',work:w.id,version:2,enabled:true});assert(r.ok);assert.equal(r.skipped,1);assert.equal(r.versions,1);
const h=e.call('quizHistory_','alice')[0];assert(h.ogePart1);assert.equal(h.score,1);assert.equal(h.mock.tasks.length,19);assert.equal(h.mock.tasks[0].ok,true);assert(!h.detail);assert(!h.answers);
assert.equal(e.call('quizList_').works[0].ogePart1,true);assert(e.post({admin:'teacher-password',op:'quizGet',work:w.id}).ogePart1);
assert.equal(JSON.stringify(e.sheets.get('Тесты').rows),beforeDefs);assert.equal(JSON.stringify(e.sheets.get('Попытки тестов').rows),beforeAttempts);assert.equal(JSON.stringify(e.sheets.get('Домашка').rows),beforeAssignments);
assert.equal(e.call('quizClassify_',{work:w.id,version:1,enabled:true}).error,'changed');
const v3=e.call('quizSave_',{id:w.id,baseVersion:2,work:d});assert(v3.ogePart1);assert.equal(e.call('quizClassify_',{work:w.id,version:3,enabled:false}).ok,true);assert.equal(e.call('quizHistory_','alice')[0].ogePart1,false);assert(!e.call('quizHistory_','alice')[0].mock);assert.equal(e.call('quizHistory_','bob').length,0);assert.equal(JSON.stringify(e.sheets.get('Попытки тестов').rows),beforeAttempts);
});
test('classification rejects nonstandard mocks and explicit removal overrides section marker',()=>{
const e=env(),w=e.call('quizSave_',{work:Q.parse(Q.sample)});assert.equal(e.call('quizClassify_',{work:w.id,version:1,enabled:true}).error,'quiz_validation');assert.equal(e.call('quizSave_',{work:Q.parse(Q.sample),ogePart1:true}).error,'quiz_validation');
const d={title:'Пробник',section:Q.mockSection,kind:'exam',tasks:Array.from({length:19},(_,i)=>({q:'Вычисли '+i,answer:String(i),points:1}))},r=e.call('quizSave_',{work:d});assert(r.ogePart1);assert(e.call('quizClassify_',{work:r.id,version:1,enabled:false}).ok);assert.equal(e.call('quizList_').works.find(t=>t.id===r.id).ogePart1,false);const next=e.call('quizSave_',{id:r.id,baseVersion:1,work:d});assert.equal(next.ogePart1,false);
});
