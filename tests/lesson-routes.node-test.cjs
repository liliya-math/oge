const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),cp=require('node:child_process');
const root=path.join(__dirname,'..');
const src=fs.readFileSync(path.join(root,'kabinet-apps-script.txt'),'utf8');
function slice(from,to){const a=src.indexOf(from),b=src.indexOf(to);assert(a>0&&b>a,from);return src.slice(a,b)}
const ctx={};vm.createContext(ctx);
vm.runInContext(slice('function routeId_','function routeMaterials_')+';this.routeId_=routeId_',ctx);
const files=fs.readdirSync(root).filter(f=>/^lesson-route-.+\.json$/.test(f));

test('every lesson id in every route file is accepted by the server, ids are unique',()=>{
 assert(files.length>=8,'expected route files for 5, 6, 7A, 7G, 8A, 8G, 9A, 9G');
 for(const f of files){
  const d=JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));const seen=new Set();
  for(const t of d.lessons){
   assert.doesNotThrow(()=>ctx.routeId_(t.id),f+' '+t.id);
   assert(!seen.has(t.id),'duplicate '+f+' '+t.id);seen.add(t.id);
   assert(t.chapter>=1&&t.chapter<=d.chapters.length,f+' chapter '+t.id);
  }
 }
});
test('server still rejects foreign route ids',()=>{
 for(const bad of ['','8A-1','8A-1000','10A-01','8B-01','5A-01','9G-F1','../8A-01','8A-01 '])assert.throws(()=>ctx.routeId_(bad),bad);
});
