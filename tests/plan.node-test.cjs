const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'..','kabinet-apps-script.txt'),'utf8');
const a=src.indexOf('/* ================= план занятий'),b=src.indexOf('/* ================= служебное');
assert(a>0&&b>a,'plan block not found in kabinet-apps-script.txt');
function load(sheetRows){
 const written=[];
 const sheet={
  getRange:(row,col,nr,nc)=>({getValue:()=>sheetRows[row-2]?sheetRows[row-2][col-1]:'',setValues:v=>written.push(['set',row,col,v]),}),
  appendRow:r=>written.push(['append',r]),deleteRow:r=>written.push(['delete',r])
 };
 const ctx={SpreadsheetApp:{getActive:()=>({getSheetByName:n=>n==='Планы'?sheet:null})},Date,
  findRow_:(name,test)=>{const i=sheetRows.findIndex(r=>test(r));return i<0?0:i+2}};
 vm.createContext(ctx);vm.runInContext(src.slice(a,b)+';this.api={planParse_,planGet_,planSave_}',ctx);
 return {api:ctx.api,written};
}
const GOOD='# план\n2026-11-07 | Геометрия | Теорема косинусов | 5 задач | \n2026-11-05 | Алгебра | Дробно-рациональные уравнения | 6 уравнений | повтор №8\n\n';
test('plan parses, skips comments and sorts by date',()=>{
 const {api}=load([]);const p=api.planParse_(GOOD);
 assert.equal(p.rows.length,2);assert.equal(p.rows[0].d,'2026-11-05');assert.equal(p.rows[0].b,'Алгебра');assert.equal(p.rows[0].n,'повтор №8');assert.equal(p.rows[1].hw,'5 задач');
});
test('plan rejects bad dates, missing topic and reports the line number',()=>{
 const {api}=load([]);
 assert.equal(api.planParse_('2026-02-30 | Алгебра | Тема').error,'plan_bad_line_1');
 assert.equal(api.planParse_('5.11.2026 | Алгебра | Тема').error,'plan_bad_line_1');
 assert.equal(api.planParse_('2026-11-05 | Алгебра').error,'plan_bad_line_1');
 assert.equal(api.planParse_('# x\n\n2026-11-05 | Алгебра | Тема\nплохая строка').error,'plan_bad_line_4');
});
test('planSave_ writes a new row, updates an existing one, deletes on empty and refuses bad text without writing',()=>{
 let t=load([]);assert.deepEqual(JSON.parse(JSON.stringify(t.api.planSave_('abc',GOOD))),{ok:true});assert.equal(t.written[0][0],'append');assert.equal(t.written[0][1][0],'abc');
 t=load([['abc','old',new Date()]]);t.api.planSave_('abc',GOOD);assert.equal(t.written[0][0],'set');assert.equal(t.written[0][1],2);
 t=load([['abc','old',new Date()]]);t.api.planSave_('abc','  ');assert.equal(t.written[0][0],'delete');
 t=load([]);assert.equal(t.api.planSave_('abc','мусор').error,'plan_bad_line_1');assert.equal(t.written.length,0);
 t=load([]);assert.equal(t.api.planSave_('abc','x'.repeat(45001)).error,'plan_too_long');
});
test('planGet_ returns text and parsed rows',()=>{
 const t=load([['abc',GOOD,new Date()]]);const g=t.api.planGet_('abc');assert.equal(g.rows.length,2);assert.equal(g.text,GOOD);
 assert.equal(t.api.planGet_('zzz').rows.length,0);
});
test('studentData_ gives the student no homework text and no plan unless "plan" is on',()=>{
 const i=src.indexOf('const pl = planGet_(code);');assert(i>0);
 const frag=src.slice(i,src.indexOf('if (admin) {',i));
 assert(/out\.plan = has\('plan'\)/.test(frag));
 assert(/admin \? x : \{d: x\.d, b: x\.b, t: x\.t, n: x\.n\}/.test(frag),'hw must be stripped for non-admin');
 assert(/if \(admin\) out\.planText/.test(frag));
});
test("'plan' and 'library' are accepted show keys and sheet 'Планы' exists in setup",()=>{
 assert(/const SHOW_KEYS = \[[^\]]*'library'[^\]]*'plan'\]/.test(src));
 assert(/'Планы': \['Код'/.test(src));
});
