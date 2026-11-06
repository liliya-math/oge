const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),cp=require('node:child_process');
const root=path.join(__dirname,'..');
const src=fs.readFileSync(path.join(root,'kabinet-apps-script.txt'),'utf8');
function slice(from,to){const a=src.indexOf(from),b=src.indexOf(to);assert(a>0&&b>a,from);return src.slice(a,b)}
const ctx={};vm.createContext(ctx);
vm.runInContext(slice('function routeId_','function routeMaterials_')+';this.routeId_=routeId_',ctx);
vm.runInContext(slice('function planParse_','function planGet_')+';this.planParse_=planParse_',ctx);
const files=fs.readdirSync(root).filter(f=>/^lesson-route-.+\.json$/.test(f));
const graph=new Set(JSON.parse(fs.readFileSync(path.join(root,'skills-by-grade.json'),'utf8')).map(n=>n.id));

test('every lesson id in every route file is accepted by the server, ids are unique, skills exist in the graph',()=>{
 assert(files.length>=8,'expected route files for 5, 6, 7A, 7G, 8A, 8G, 9A, 9G');
 for(const f of files){
  const d=JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));const seen=new Set();
  for(const t of d.lessons){
   assert.doesNotThrow(()=>ctx.routeId_(t.id),f+' '+t.id);
   assert(!seen.has(t.id),'duplicate '+f+' '+t.id);seen.add(t.id);
   assert(t.chapter>=1&&t.chapter<=d.chapters.length,f+' chapter '+t.id);
   for(const s of t.skills)assert(graph.has(s),f+' '+t.id+' unknown skill '+s);
  }
 }
});
test('server still rejects foreign route ids',()=>{
 for(const bad of ['','8A-1','8A-1000','10A-01','8B-01','5A-01','9G-F1','../8A-01','8A-01 '])assert.throws(()=>ctx.routeId_(bad),bad);
});
test('make_plan.py output is accepted by the plan parser for every grade mode',()=>{
 const runs=[['--grade','5','--days','Пн,Ср'],['--grade','6','--days','Вт'],['--grade','7','--days','Вт,Чт,Сб','--works'],['--grade','8','--days','Вт,Сб','--works','--zakrep'],['--grade','9','--days','Вт,Чт','--levels','ядро,желательно'],['--grade','9','--days','Вт,Чт,Сб','--oge-day','Чт']];
 for(const r of runs){
  const out=cp.execFileSync('python3',['tools/make_plan.py',...r,'--start','2026-11-09','--count','60'],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore']});
  const p=ctx.planParse_(out);assert(!p.error,r.join(' ')+' '+p.error);assert(p.rows.length>10,r.join(' '));
 }
});
