// Сборка страницы теории квадратика из компактного JSON.
// Запуск: node tools/teoriya/build.cjs tools/teoriya/src/8A-111.json
// Нужен пакет katex (npm i katex в любой папке; путь в KATEX_DIR или рядом в node_modules).
const fs=require('fs'),path=require('path');
const kdir=process.env.KATEX_DIR||'/tmp/kx/node_modules/katex';
const katex=require(path.join(kdir,'dist/katex.js')),VER=require(path.join(kdir,'package.json')).version;
const COLORS={moss:['#5F7B3F','#FFFFFF'],caramel:['#9C6B40','#FFFFFF'],orange:['#DD7A3A','#16231A'],gold:['#E2B04A','#16231A'],cobalt:['#2F5BB5','#FFFFFF'],sage:['#9BB08A','#16231A']};
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function rich(s){
  if(/[–—]/.test(s))throw new Error('Длинное тире в тексте: '+s.slice(0,60));
  const out=[];let last=0;const re=/\\\(([\s\S]+?)\\\)/g;let m;
  const text=t=>esc(t).replace(/\*\*(.+?)\*\*/g,'<b class="term">$1</b>');
  while((m=re.exec(s))){out.push(text(s.slice(last,m.index)));out.push(katex.renderToString(m[1],{throwOnError:true,strict:'error'}));last=re.lastIndex;}
  out.push(text(s.slice(last)));return out.join('');
}
function item(it){
  if(it.p!==undefined)return '<p>'+rich(it.p)+'</p>';
  if(it.f!==undefined)return '<div class="plate">'+rich(it.f)+'</div>';
  if(it.why!==undefined)return '<div class="why"><span class="label">Почему так</span><p>'+rich(it.why)+'</p></div>';
  if(it.ol)return '<ol>'+it.ol.map(x=>'<li>'+rich(x)+'</li>').join('')+'</ol>';
  if(it.table)return '<div class="tbl"><table>'+it.table.map((r,i)=>'<tr>'+r.map((c,j)=>((it.head?i===0:j===0)?'<th'+(it.head?' scope="col"':' scope="row"')+'>':'<td>')+rich(String(c))+((it.head?i===0:j===0)?'</th>':'</td>')).join('')+'</tr>').join('')+'</table></div>';
  throw new Error('Неизвестный элемент '+JSON.stringify(it).slice(0,60));
}
function build(spec){
  const blocks=spec.blocks.map(b=>{const [bg,fg]=COLORS[b.color];if(!bg)throw new Error('цвет '+b.color);
    return '<section class="blk"><h2 style="background:'+bg+';color:'+fg+'">'+rich(b.title)+'</h2><div class="in">'+b.items.map(item).join('')+'</div></section>';}).join('\n');
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Теория · ${esc(spec.title)} · lili.math</title><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@${VER}/dist/katex.min.css"><style>
:root{--ink:#16231A;--cream:#EEE0C8;--sand:#C9AB82}
*{box-sizing:border-box}body{margin:0;background:#16231A;color:var(--ink);font:18px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
main{max-width:780px;margin:auto;padding:28px 16px 56px}
.top{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:22px}.brand{font-weight:800;font-size:22px;color:var(--cream);letter-spacing:-.04em}.brand i{font-style:normal;color:#E2B04A}
button{font:inherit;border:0;border-radius:13px;background:#2F5BB5;color:#fff;font-weight:650;padding:11px 18px;cursor:pointer}
.tag{color:var(--sand);font-size:13px;letter-spacing:.1em;text-transform:uppercase;font-weight:700}h1{color:var(--cream);font-size:clamp(28px,5vw,42px);line-height:1.15;letter-spacing:-.03em;margin:8px 0 26px}
.blk{background:var(--cream);border-radius:20px;overflow:hidden;margin:0 0 34px;break-inside:avoid}.blk h2{margin:0;padding:14px 22px;font-size:21px;line-height:1.3}.in{padding:20px 22px 12px}
p{margin:0 0 16px;text-indent:1.6em}b.term{font-weight:800;color:#9C6B40}
.plate{background:#fff;border-radius:14px;padding:16px 14px;margin:6px 0 20px;text-align:center;font-size:1.3em;font-family:KaTeX_Main,'Times New Roman',serif;overflow-x:auto;white-space:nowrap;border:2px solid var(--sand)}
.katex{font-size:1.08em;white-space:nowrap;color:var(--ink)}.katex .mathnormal,.katex .mathit{font-family:KaTeX_Main,'Times New Roman',serif;font-style:normal}
.why{background:#fff;border-radius:14px;padding:12px 16px 2px;margin:8px 0 14px;border-left:6px solid #DD7A3A}.why .label{display:block;font-weight:800;color:#9C6B40;margin-bottom:6px;text-indent:0}.why p{text-indent:1.6em}
ol{margin:0 0 16px;padding-left:1.4em}li{margin:0 0 12px;padding-left:4px}
.tbl{overflow-x:auto;margin:6px 0 18px}table{border-collapse:collapse;background:#fff;min-width:100%;font-size:19px}th,td{border:2px solid var(--sand);padding:8px 12px;text-align:center}th{background:var(--cream);font-weight:700}
@media print{body{background:#fff}main{padding:0;max-width:none}.top button{display:none}.brand{color:var(--ink)}.brand i{color:#9C6B40}h1{color:var(--ink)}.tag{color:#9C6B40}.blk,.why,.plate,.tbl{break-inside:avoid}@page{margin:14mm}}
</style></head><body><main><div class="top"><span class="brand">lili<i>.</i>math</span><button onclick="window.print()">Сохранить как PDF</button></div>
<span class="tag">${esc(spec.tag)}</span><h1>${esc(spec.title)}</h1>
${blocks}
</main></body></html>`;
}
if(require.main===module){
  const f=process.argv[2];const spec=JSON.parse(fs.readFileSync(f,'utf8'));
  const html=build(spec);const out=path.join(path.dirname(f),'..','..','..',spec.file);
  fs.writeFileSync(out,html);console.log('OK',path.resolve(out),html.length+' байт');
  if(spec.square){const lf=path.join(path.dirname(out),'route-links.json');let L={};try{L=JSON.parse(fs.readFileSync(lf,'utf8'));}catch(e){}
    L[spec.square]=Object.assign(L[spec.square]||{},{theory:'https://lilimath.ru/'+spec.file});
    fs.writeFileSync(lf,JSON.stringify(L,null,1)+'\n');console.log('route-links.json:',spec.square);}
}
module.exports={build,rich};
