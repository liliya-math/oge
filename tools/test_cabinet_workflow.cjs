const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let values, writes, uploads, adminCalls;
const sheet={getLastRow:()=>2,getMaxColumns:()=>16,getRange:(r,c,n,w)=>({getValues:()=>[values.slice(c-1,c-1+w)],setValues:rows=>{writes.push({r,c,rows});if(r===2)rows[0].forEach((v,i)=>values[c-1+i]=v)}})};
const ctx={SpreadsheetApp:{getActive:()=>({getSheetByName:()=>sheet})},Utilities:{getUuid:()=> 'new-revision',base64Decode:s=>[1,2],newBlob:()=>({})},DriveApp:{getFoldersByName:()=>({hasNext:()=>true,next:()=>({createFile:()=>{uploads++;return{setSharing:()=>{},getUrl:()=> 'https://drive.google.com/file/test'}}})}),Access:{ANYONE_WITH_LINK:1},Permission:{VIEW:1}}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('kabinet-apps-script.txt','utf8'),ctx);
function reset(status='new'){values=['student-a','Дроби','6','2026-10-25','dz.html','',false,'','','',status,'','','','','old-revision'];writes=[];uploads=0;}
function call(fields={},teacher=false){ctx.args={t:'student-a',id:2,text:'Дроби',revision:'old-revision',status:'submitted',note:'Решение: 1,5',...fields};return vm.runInContext('workflowHw_("student-a", args, '+teacher+')',ctx)}
reset();assert.equal(call().ok,true);assert.equal(values[10],'submitted');assert.equal(values[6],true);assert.equal(values[15],'new-revision');
reset();assert.equal(call({revision:'stale'}).error,'changed');assert.equal(writes.length,0);
reset();assert.equal(call({text:'Иное ДЗ'}).error,'changed');assert.equal(writes.length,0);
reset();values[0]='other-student';assert.equal(call().error,'changed');assert.equal(writes.length,0);
reset();assert.equal(call({status:'checked'}).error,'bad_value');assert.equal(writes.length,0);
reset('checked');assert.equal(call({status:'solving'}).error,'changed');assert.equal(writes.length,0);
reset();assert.equal(call({status:'revise',feedback:''},true).error,'bad_value');assert.equal(writes.length,0);
reset('submitted');assert.equal(call({status:'revise',feedback:'Проверь знак'},true).ok,true);assert.equal(values[6],false);assert.equal(values[12],'Проверь знак');
reset('submitted');assert.equal(call({status:'checked',feedback:'Верно'},true).ok,true);assert.equal(values[6],true);
reset();assert.equal(call({status:'help',note:'Не понимаю условие'}).ok,true);assert.equal(values[6],false);
reset();assert.equal(call({note:''}).error,'bad_value');assert.equal(writes.length,0);
reset();assert.equal(call({photo:{mime:'text/html',data:'AA=='}}).error,'bad_value');assert.equal(uploads,0);
reset();assert.equal(call({note:'',photo:{name:'solution.png',mime:'image/png',data:'AA=='}}).ok,true);assert.equal(uploads,1);assert.equal(values[13],'https://drive.google.com/file/test');
reset('revise');assert.equal(call({status:'submitted',note:'Исправила'}).ok,true);
// Public routing must reach workflow only after the existing student authorization.
const source=fs.readFileSync('kabinet-apps-script.txt','utf8');assert(source.indexOf('findStudentRow_(body.t)')<source.indexOf('body.workflow === true'));
assert(source.includes("case 'hwReview': { need();"));
console.log('16 workflow checks passed: ownership, revisions, transitions, review, validation, photo and API guards.');
