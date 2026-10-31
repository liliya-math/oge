const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function environment(){
 const props=new Map([['ADMIN','teacher-test']]),files=new Map();let nextId=0;
 const properties={getProperty:k=>props.get(k)||null,setProperty:(k,v)=>props.set(k,v)};
 const folder={getId:()=> 'private-folder',createFile:(name,contents)=>{const id='file-'+(++nextId);files.set(id,{name,contents});return {getId:()=>id};}};
 const context={console,Date,SpreadsheetApp:{getActive:()=>({})},Utilities:{sleep(){}},PropertiesService:{getScriptProperties:()=>properties},LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})},DriveApp:{createFolder:()=>folder,getFolderById:()=>folder,getFileById:id=>({getBlob:()=>({getDataAsString:()=>files.get(id).contents})})}};
 vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../kabinet-apps-script.txt'),'utf8'),context);
 const call=b=>{context.input=b;return JSON.parse(JSON.stringify(vm.runInContext('admin_(input)',context)));};
 return {call,files,props};
}
const personalBoard='https://liliya-math.github.io/excalidraw/?pin=1&personal=1#room=room,abcdefghijklmnopqrstuv;teacher='+'t'.repeat(64);
const template={version:1,id:'content-test',name:'Корни',created:1,elements:[{id:'one',type:'text',text:'sqrt(81)'}],files:{}};
const payload={admin:'teacher-test',op:'boardLibraryPut',revision:0,templates:[template],personalBoard,operationId:'12345678-1234-1234-1234-123456789012'};
test('library requires teacher authentication and never uses public file sharing',()=>{
 const env=environment();assert.equal(env.call({...payload,admin:'wrong'}).error,'bad_password');assert.equal(env.files.size,0);
 assert.equal(env.call({admin:'teacher-test',op:'ping'}).boardLibrary,1);
 assert.equal(env.call({admin:'teacher-test',op:'boardLibraryGet'}).library.revision,0);
 const result=env.call(payload);assert.equal(result.library.revision,1);assert.equal(result.library.personalBoard,personalBoard);assert.equal(env.files.size,1);
 assert.equal(env.call({...payload,admin:'wrong'}).error,'bad_password');assert.equal(env.files.size,1);
});
test('concurrent revisions cannot overwrite; retries are idempotent and prior file retained',()=>{
 const env=environment(),first=env.call(payload);assert.equal(first.library.revision,1);
 assert.equal(env.call(payload).library.revision,1);assert.equal(env.files.size,1);
 const second={...payload,operationId:'22345678-1234-1234-1234-123456789012'};
 assert.equal(env.call(second).error,'changed');assert.equal(env.files.size,1);
 const saved=env.call({...second,revision:1,templates:[{...template,deletedAt:2,updated:2}]});assert.equal(saved.library.revision,2);assert.equal(env.files.size,2);assert.equal(saved.library.templates[0].deletedAt,2);
 assert.equal(JSON.parse(env.files.get('file-1').contents).templates[0].deletedAt,undefined);
});
test('invalid backups and private links are rejected before creating files',()=>{
 const env=environment();for(const change of [{templates:[null]},{templates:[template,template]},{personalBoard:'https://evil.example/'},{templates:Array(101).fill(template)}]) assert(env.call({...payload,...change}).error);
 assert.equal(env.files.size,0);
});
