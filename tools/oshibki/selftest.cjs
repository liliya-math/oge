const fs=require('fs');
const src=fs.readFileSync('tools/oshibki/check.js','utf8')+'\n'+fs.readFileSync('tools/oshibki/tasks.js','utf8')+'\nmodule.exports={okSub,T,nz,ev};';
const m={exports:{}};new Function('module','exports',src)(m,m.exports);
const {okSub,T}=m.exports;
let bad=0,tot=0;
for(const t of T)t.subs.forEach((s,i)=>{tot++;if(!okSub(t,s,s.show)){bad++;console.log('SELF-FAIL',t.lab,i+1,JSON.stringify(s.show),s.k)}});
console.log('self',tot-bad,'/',tot);
// extra human variants
const tests=[['01.1',0,'3/6'],['01.1',0,'1/2'],['01.1',0,'0,5'],['01.3',0,'-a-7'],['01.3',2,'3-2y'],['01.3',2,'-2y+3'],['01.5',2,'4x²+4x+1'],['01.5',2,'4x^2+4x+1'],['01.6',0,'(a+4)(a-4)'],['01.6',0,'a²-16'],['03.3',0,'(0;-2)'],['03.3',0,'0;-2'],['02.3',1,'-7 и 7'],['02.3',1,'7; -7'],['02.3',1,'7'],['14.1',0,'5/3'],['14.1',0,'1 2/3'],['40.6',0,'3'],['28.4',0,'5√2'],['28.4',0,'√50'],['28.4',0,'5*sqrt(2)'],['48.3',0,'√3/3'],['48.3',0,'1/√3'],['34.4',0,'-8'],['34.4',0,'D=-8, корней нет'],['06.2',0,'нет'],['06.2',0,'Да'],['17.2',0,'7 ост 1'],['17.2',0,'7'],['20.3',0,'>'],['20.3',0,'2/3 > 2/7'],['20.3',0,'<'],['07.5',0,'9π'],['07.5',0,'9pi'],['07.5',0,'28.27'],['25.2',2,'-1/8'],['25.2',2,'1/8'],['04.1',0,'x<-3'],['04.1',0,'x<=-3'],['04.1',1,'x>=-4'],['44.1',0,'[3;+∞)'],['44.1',0,'[3; ∞)'],['22.6',0,'AC=BC'],['22.6',0,'BC=AC'],['24.3',0,'4 вправо 1 вверх'],['24.3',0,'1 вправо, 4 вверх']];
for(const [id,i,v] of tests){const t=T.find(x=>x.lab===id);console.log(id,i+1,JSON.stringify(v),'=>',okSub(t,t.subs[i],v),'| expect',t.subs[i].show)}
