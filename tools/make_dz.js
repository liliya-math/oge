#!/usr/bin/env node
// Собирает персональное ДЗ из генераторов тренажёра.
// node tools/make_dz.js --trainer trenazher-kvadratnyj-koren.html --out dz-koren-1.html \
//   --title "Квадратный корень" --groups "Уровень 1:3x2,4x2,6x3;Уровень 2:7x2,8x3,9x2"
// В --groups числа: номер ступени тренажёра (с 1) x сколько заданий.
const fs=require('fs'),path=require('path');
const a=process.argv.slice(2),arg=k=>{const i=a.indexOf('--'+k);return i<0?null:a[i+1]};
const tr=arg('trainer'),out=arg('out'),title=arg('title'),groups=arg('groups');
if(!tr||!out||!title||!groups){console.error('Нужны --trainer --out --title --groups');process.exit(2)}
const root=path.resolve(__dirname,'..');
const src=fs.readFileSync(path.resolve(root,tr),'utf8');
const m=src.match(/\/\/CONTENT-START\n([\s\S]*?)\n\/\/CONTENT-END/);
if(!m){console.error('В тренажёре нет блока CONTENT');process.exit(2)}
const content=m[1];
const LEVELS=new Function(content+';return LEVELS')();
const cfg={id:path.basename(out,'.html'),title,groups:groups.split(';').map(g=>{
 const [t,rest]=g.split(':');const items=[];
 rest.split(',').forEach(p=>{const [l,n]=p.trim().split('x');const li=+l-1;
  if(!(li>=0&&li<LEVELS.length)){console.error('Нет ступени '+l+' (всего '+LEVELS.length+')');process.exit(2)}
  for(let i=0;i<(+n||1);i++)items.push(li)});
 return{t:t.trim(),items}})};
// проверка: каждый выбранный генератор 500 раз без ошибок, у задания есть q и ответ
const used=[...new Set(cfg.groups.flatMap(g=>g.items))];
for(const li of used){for(let i=0;i<500;i++){const q=LEVELS[li].g();
 if(!q||!q.q||(q.type==='num'?typeof q.ans!=='number'||!isFinite(q.ans):!q.options.includes(q.correct))){console.error('Плохое задание на ступени '+(li+1),q);process.exit(1)}}}
let tpl=fs.readFileSync(path.join(__dirname,'dz_shablon.html'),'utf8');
tpl=tpl.replace('{{TITLE}}',()=>'ДЗ: '+title).replace('/*CONTENT*/',()=>content).replace('/*CONFIG*/',()=>JSON.stringify({id:cfg.id,title,groups:cfg.groups}));
fs.writeFileSync(path.resolve(root,out),tpl);
const n=cfg.groups.reduce((s,g)=>s+g.items.length,0);
console.log(`${out}: ${n} заданий, ступени ${used.map(x=>x+1).join(',')}`);
