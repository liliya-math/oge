/* ---------- проверка ответов карточек (type:'sub') ---------- */
const CYR={'а':'a','в':'b','с':'c','е':'e','ё':'e','к':'k','м':'m','н':'h','о':'o','р':'p','т':'t','у':'y','х':'x'};
function nz(s){
  s=String(s).toLowerCase().replace(/[−–—]/g,'-').replace(/[∠°₽%]/g,'').replace(/\s+/g,'');
  s=s.replace(/(\d),(\d)/g,'$1.$2').replace(/[,.:]+$/,'').replace(/,/g,'').replace(/≤/g,'<=').replace(/≥/g,'>=').replace(/≠/g,'!=').replace(/\+∞/g,'∞').replace(/\(?ост\.?/g,'ост').replace(/\)$/,'');
  s=s.replace(/[²³⁴⁵⁶⁷⁸⁹]/g,c=>'^'+'  23456789'['²³⁴⁵⁶⁷⁸⁹'.indexOf(c)+2]).replace(/[а-яё]/g,c=>CYR[c]||c);
  return s;
}
const SUPD={'⁻':'-','⁰':0,'¹':1,'²':2,'³':3,'⁴':4,'⁵':5,'⁶':6,'⁷':7,'⁸':8,'⁹':9};
function ev(src,V){
  let s=String(src).toLowerCase().replace(/[−–—]/g,'-').replace(/[·×]/g,'*').replace(/sqrt/g,'§').replace(/pi/g,'¶').replace(/п(?![а-я])/g,'¶');
  s=s.replace(/\s+/g,function(m,off,all){return ' '});
  s=s.replace(/(\d+)\s+(\d+)\/(\d+)/g,'($1+$2/$3)').replace(/(\d),(\d)/g,'$1.$2');
  s=s.replace(/([a-z0-9)¶])([⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)/g,(m,a,p)=>a+'**'+[...p].map(c=>SUPD[c]).join('')).replace(/\^/g,'**');
  s=s.replace(/π/g,'¶').replace(/√/g,'§').replace(/\s+/g,'');
  if(!/^[0-9a-z+\-*\/().§¶]+$/.test(s))return NaN;
  s=s.replace(/§(\d+(?:\.\d+)?|[a-z])/g,'§($1)').replace(/(\d|\))(?=[a-z(§¶])/g,'$1*').replace(/([a-z¶])(?=[a-z(§¶])/g,'$1*').replace(/(\))(?=\d)/g,'$1*').replace(/§/g,'Math.sqrt').replace(/¶/g,'Math.PI');
  if(/Math\.sqrtMath|\*\*\*/.test(s))return NaN;
  try{const names=Object.keys(V);const f=new Function(...names,'return ('+s+')');const r=f(...names.map(n=>V[n]));return typeof r==='number'&&isFinite(r)?r:NaN}catch(e){return NaN}
}
const SAMP=[{x:1.7,y:2.3,a:3.1,b:.7,m:1.3,t:2.9,c:1.9,d:2.7,k:1.1,n:3.3,p:1.4,q:2.1},{x:-2.2,y:.6,a:-1.4,b:2.8,m:3.7,t:-.9,c:.8,d:-3.1,k:2.6,n:1.2,p:-1.8,q:.5},{x:4.1,y:-1.3,a:.9,b:-2.6,m:-.4,t:3.5,c:-2.2,d:1.6,k:-1.5,n:2.4,p:3.2,q:-.7}];
function sameVal(a,b){if(isNaN(a)||isNaN(b))return false;return Math.abs(a-b)<=1e-7*Math.max(1,Math.abs(b))}
function exprEq(u,v){for(const V of SAMP){if(!sameVal(ev(u,V),ev(v,V)))return false}return true}
function nums(s){return (String(s).replace(/[−–—]/g,'-').replace(/(\d),(\d)/g,'$1.$2').match(/-?\d+(?:\.\d+)?/g)||[]).map(Number)}
function stems(s){return String(s).toLowerCase().replace(/ё/g,'е').split(/[^а-яa-z0-9]+/).filter(Boolean).map(w=>/\d/.test(w)?w:w.slice(0,5))}
function stripU(s){return s.replace(/^[a-zа-я]\s*=\s*/i,'').replace(/\s*(см²|см³|дм²|дм³|м²|м³|км\/ч|м\/с|мм|см|дм|км|мин|кг|шт|бака|п\.\s?п|пп|ч|м|г|₽|°|%)\.?\s*$/i,'').trim()}
function okSub(t,s,val){
  let raw=String(val).trim();if(!raw)return false;
  const f=t.flag||{};
  if(f.par&&!/[()]/.test(raw))return false;
  if(f.nopar&&/[()]/.test(raw)&&!/^\(.*\)$/.test(raw))return false;
  if(f.impr&&(!/\//.test(raw)||/\d\s+\d+\/\d+/.test(raw)))return false;
  if(f.dec&&/[\/√]/.test(raw))return false;
  if(f.pow&&!/[\^⁰¹²³⁴⁵⁶⁷⁸⁹]/.test(raw))return false;
  if(f.rootout){const mx=Math.max(...(String(s.show).match(/√\(?(\d+)/g)||['√1']).map(x=>+x.replace(/\D/g,'')));const m=[...raw.matchAll(/√\(?(\d+)/g)].map(x=>+x[1]);if(m.some(v=>v>mx))return false}
  if(f.noroot&&/\/\(?[^\s]*√/.test(raw))return false;
  if(s.k==='e'&&raw.includes('='))raw=raw.split('=').pop().trim();
  if(s.k==='e'||s.k==='set'){raw=stripU(raw)}
  if(s.k==='e'){
    const V0=SAMP[0],r=ev(raw,V0);if(isNaN(r))return false;
    return [s.v,...(s.alt||[])].some(c=>exprEq(raw,c))}
  if(s.k==='set'){const exp=s.v.map(x=>ev(x,SAMP[0])).sort((a,b)=>a-b);const got=String(raw).split(/[,;]|\s+и\s+|\s+/).filter(Boolean).map(x=>ev(x,SAMP[0]));if(got.some(isNaN)||got.length!==exp.length)return false;got.sort((a,b)=>a-b);return exp.every((v,i)=>sameVal(got[i],v))}
  if(s.k==='nums'){const e=s.v.map(x=>+String(x).replace('−','-').replace(',','.')),g=nums(raw);return g.length===e.length&&g.every((v,i)=>sameVal(v,e[i]))}
  if(s.k==='r'){const sp=a=>{const p=a.split('=');return p.length===2?[p[0],p[1]]:null},e=sp(s.v),g=sp(raw);if(!e||!g)return false;
    const fe=V=>ev(e[0],V)-ev(e[1],V),fg=V=>ev(g[0],V)-ev(g[1],V);return SAMP.every(V=>sameVal(fg(V),fe(V)))||SAMP.every(V=>sameVal(fg(V),-fe(V)))}
  const n=nz(raw),vs=(s.v||[]).map(nz);
  if(vs.includes(n))return true;
  for(const v of (s.v||[])){const m=/^([A-Z]{1,2}) = ([A-Z]{1,2})$/.exec(v);if(m&&nz(raw)===nz(m[2]+'='+m[1]))return true}
  for(const v of (s.v||[])){const w=stems(v);if(w.length>=3&&/[а-я]/i.test(v)){const g=stems(raw);if(w.every(x=>g.includes(x))&&g.length<=w.length+2)return true}}
  return false;
}
