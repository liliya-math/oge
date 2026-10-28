const DEG=Math.PI/180;
const tc=(x,y,s,col,sz,anchor)=>`<text x="${x}" y="${y}" class="t" style="fill:${col}" font-size="${sz||12}" text-anchor="${anchor||'middle'}">${s}</text>`;
const chips=(arr,id)=>`<div class="btns" id="${id||'ch'}">`+arr.map(x=>`<button data-v="${x}">${x}°</button>`).join('')+'</div>';
function wireChips(b,sid,fn){const bs=b.querySelectorAll('#ch button');bs.forEach(bt=>bt.onclick=()=>{const e=$(b,'#'+sid);e.value=bt.dataset.v;e.dispatchEvent(new Event('input'))});return v=>bs.forEach(bt=>bt.classList.toggle('on',+bt.dataset.v===v))}

/* ---------- Правило: подпись никогда не лежит на линии чертежа и не налезает на другую подпись.
   LAB(W,H) собирает отрезки чертежа, а lab() ставит подпись рядом, сдвигая её, пока вокруг не станет чисто. ---------- */
function LAB(W,H){
  const segs=[],boxes=[];
  const api={
    seg(p,q,r){segs.push([p,q,r==null?1.5:r])},
    arc(c,r,a1,a2){let da=Math.abs(a2-a1)<=180?a2-a1:((a2-a1+540)%360)-180;const n=Math.max(6,Math.round(Math.abs(da)/6));let prev=null;for(let k=0;k<=n;k++){const a=(a1+da*k/n)*DEG,p=[c[0]+r*Math.cos(a),c[1]-r*Math.sin(a)];if(prev)segs.push([prev,p,1.5]);prev=p}},
    circle(c,r){let prev=[c[0]+r,c[1]];for(let k=1;k<=72;k++){const a=k*5*DEG,p=[c[0]+r*Math.cos(a),c[1]-r*Math.sin(a)];segs.push([prev,p,1.5]);prev=p}},
    dot(p,r){segs.push([p,p,r])},
    size(s,sz){let w=0;for(const ch of String(s).replace(/<[^>]*>/g,'')){w+=(/[а-яёА-ЯЁαβγ]/.test(ch)?0.70:0.62)*sz}return[w,sz*0.78]},
    dist(b){let best=1e9;for(const[p,q,r]of segs){const L=Math.hypot(q[0]-p[0],q[1]-p[1]),n=Math.max(1,Math.floor(L));for(let k=0;k<=n;k++){const x=p[0]+(q[0]-p[0])*k/n,y=p[1]+(q[1]-p[1])*k/n;const dx=Math.max(b[0]-x,0,x-b[2]),dy=Math.max(b[1]-y,0,y-b[3]);best=Math.min(best,Math.hypot(dx,dy)-r)}}return best},
    free(b,m){if(b[0]<2||b[1]<2||b[2]>W-2||b[3]>H-2)return false;for(const o of boxes)if(b[0]<o[2]+4&&o[0]<b[2]+4&&b[1]<o[3]+4&&o[1]<b[3]+4)return false;return api.dist(b)>=m},
    /* base — точка, dir — куда сдвигать; возвращает svg-текст или '' (если места нет, подпись не рисуем) */
    lab(base,dir,s,cls,sz,o){o=o||{};const[w,h]=api.size(s,sz),n=Math.hypot(dir[0],dir[1])||1,ux=dir[0]/n,uy=dir[1]/n;
      const alts=o.alts||[0,25,-25,50,-50,80,-80,110,-110],start=o.start||8,maxd=o.maxd||52,m=o.margin||5;
      for(const rot of alts){const ca=Math.cos(rot*DEG),sa=Math.sin(rot*DEG),vx=ux*ca-uy*sa,vy=ux*sa+uy*ca;
        for(let d=start;d<maxd;d++){const cx=base[0]+vx*d,cy=base[1]+vy*d,b=[cx-w/2,cy-h/2,cx+w/2,cy+h/2];
          if(api.free(b,m)){boxes.push(b);return{svg:tx(cx.toFixed(1),(cy+sz*0.36).toFixed(1),s,cls,sz),c:[cx,cy]}}}}
      return{svg:'',c:null}}
  };return api}
const mid2=(p,q)=>[(p[0]+q[0])/2,(p[1]+q[1])/2];
const cen3=(a,b,c)=>[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3];
const out2=(c,p)=>[p[0]-c[0],p[1]-c[1]];
const angOf=(c,p)=>Math.atan2(-(p[1]-c[1]),p[0]-c[0])/DEG;

/* ---------- Полуокружность: sin и cos любого угла от 0° до 180° ---------- */
const EXV={0:['1','0'],30:['√3/2','1/2'],45:['√2/2','√2/2'],60:['1/2','√3/2'],90:['0','1'],120:['−1/2','√3/2'],135:['−√2/2','√2/2'],150:['−√3/2','1/2'],180:['−1','0']};
function semiW(b,pair){
  b.innerHTML=sl('a','Угол α',0,180,60,1)+chips([30,45,60,90,120,135,150])+SV('sv',330,200)+OUT;
  const mark=wireChips(b,'a');
  bind(b,['a'],v=>{
    const a=v.a,c=Math.cos(a*DEG),s=Math.sin(a*DEG);
    $(b,'#av').textContent=a+'°';mark(a);
    const O=[165,160],Rr=130,P=[O[0]+Rr*c,O[1]-Rr*s],L=LAB(330,200);
    let g=ln(25,160,305,160,'s-ink',2)+ln(165,24,165,160,'s-line',1)+`<path d="M35 160 A130 130 0 0 1 295 160" class="nf s-line" stroke-width="2"/>`;
    L.seg([25,160],[305,160]);L.seg([165,24],[165,160]);L.arc(O,Rr,0,180);
    let Q=null;
    if(pair){const a2=180-a;Q=[O[0]+Rr*Math.cos(a2*DEG),O[1]-Rr*Math.sin(a2*DEG)];
      g+=ln(O[0],O[1],Q[0],Q[1],'s-ink',2,'stroke-dasharray="5 4"')+ln(Q[0],Q[1],Q[0],160,'s-ink',2,'stroke-dasharray="5 4"')+`<circle cx="${Q[0]}" cy="${Q[1]}" r="6" class="f-ink"/>`;
      L.seg(O,Q);L.seg(Q,[Q[0],160]);L.dot(Q,6)}
    g+=ln(O[0],O[1],P[0],P[1],'s-ink',2);
    g+=ln(O[0],160,P[0],160,'s-acc2',5);
    g+=ln(P[0],P[1],P[0],160,'s-acc',5);
    g+=`<circle cx="${P[0]}" cy="${P[1]}" r="7" class="f-acc"/>`;
    L.seg(O,P,2);L.seg([O[0],160],[P[0],160],3);L.seg(P,[P[0],160],3);L.dot(P,7);
    const showArc=a>2&&a<178;
    if(showArc){g+=`<path d="M${O[0]+26} 160 A26 26 0 0 0 ${O[0]+26*c} ${O[1]-26*s}" class="nf s-ink" stroke-width="1.5"/>`;L.arc(O,26,0,a)}
    /* подписи: всегда после всех линий */
    g+=L.lab([35,160],[0,1],'−1','t-mute',11,{start:14}).svg+L.lab(O,[0,1],'0','t-mute',11,{start:14,alts:[0,-40,40]}).svg+L.lab([295,160],[0,1],'1','t-mute',11,{start:14}).svg;
    if(showArc)g+=L.lab(O,[Math.cos(a/2*DEG),-Math.sin(a/2*DEG)],'α','t',13,{start:40,alts:[0,10,-10,20,-20,35,-35]}).svg;
    if(pair&&Q)g+=L.lab(Q,[Q[0]-O[0],Q[1]-O[1]],'180°−α','t',11,{start:12,alts:[0,20,-20,45,-45,70,-70]}).svg;
    $(b,'#sv').innerHTML=g;
    const ex=EXV[a],ex2=EXV[180-a];
    let h=`<b>α = ${a}°</b><br>`
     +`<span style="color:var(--lilac)">cos α = x = ${ex?ex[0]:'≈ '+f(c,2)}</span><br>`
     +`<span style="color:var(--apricot)">sin α = y = ${ex?ex[1]:'≈ '+f(s,2)}</span><br>`;
    h+=c>1e-9?'Точка справа от центра, поэтому cos &gt; 0.':c<-1e-9?'Точка слева от центра, поэтому cos &lt; 0.':'Точка прямо над центром, поэтому cos = 0.';
    if(pair){h+=`<br><span class="mute">Парный угол 180° − α = ${180-a}°: cos = ${ex2?ex2[0]:'≈ '+f(-c,2)}, sin = ${ex2?ex2[1]:'≈ '+f(s,2)}. Высота та же, x с другим знаком.</span>`}
    $(b,'#o').innerHTML=h})}
W.semi=b=>semiW(b,false);
W.semipair=b=>semiW(b,true);

/* ---------- Теорема косинусов: стороны 3 и 5, угол C меняется ---------- */
W.cosdemo=b=>{
  b.innerHTML=sl('c','Угол C',10,170,60,1)+chips([60,90,120])+SV('sv',380,220)+OUT;
  const mark=wireChips(b,'c');
  const a=3,bb=5,k=26,C0=[150,185];
  bind(b,['c'],v=>{
    const cd=v.c,th=cd*DEG,cs=Math.cos(th),sn=Math.sin(th);
    $(b,'#cv').textContent=cd+'°';mark(cd);
    const B=[C0[0]+a*k,C0[1]],A=[C0[0]+bb*k*cs,C0[1]-bb*k*sn];
    const c2=a*a+bb*bb-2*a*bb*cs,L=LAB(380,220);
    let g=ln(C0[0],C0[1],B[0],B[1],'s-ink',3)+ln(C0[0],C0[1],A[0],A[1],'s-ink',3)+ln(A[0],A[1],B[0],B[1],'s-acc',5);
    L.seg(C0,B,2);L.seg(C0,A,2);L.seg(A,B,3);
    g+=`<path d="M${C0[0]+24} ${C0[1]} A24 24 0 0 0 ${C0[0]+24*cs} ${C0[1]-24*sn}" class="nf s-ink" stroke-width="1.5"/>`;L.arc(C0,24,0,cd);
    const cen=cen3(A,B,C0);
    g+=L.lab(A,out2(cen,A),'A','t',14,{start:12}).svg+L.lab(B,out2(cen,B),'B','t',14,{start:12}).svg+L.lab(C0,out2(cen,C0),'C','t',14,{start:12}).svg;
    g+=L.lab(mid2(C0,B),out2(cen,mid2(C0,B)),'a = 3','t-mute',12,{start:8}).svg;
    g+=L.lab(mid2(C0,A),out2(cen,mid2(C0,A)),'b = 5','t-mute',12,{start:8}).svg;
    g+=L.lab(mid2(A,B),out2(cen,mid2(A,B)),'c ≈ '+f(Math.sqrt(c2),2),'t',13,{start:8}).svg.replace('class="t"','class="t" style="fill:var(--apricot)"');
    $(b,'#sv').innerHTML=g;
    const cst=cs<0?'('+f(cs,2)+')':f(cs,2);
    let h=`<b>c² = 3² + 5² − 2·3·5·cos C = 34 − 30 · ${cst} = ${f(c2,2)}</b><br>c = √${f(c2,2)} ≈ ${f(Math.sqrt(c2),2)}<br><span class="mute">Для сравнения: a² + b² = 34.</span><br>`;
    h+=cd<90?'Угол острый, cos C &gt; 0: из 34 вычитаем, поэтому c² меньше 34.':cd===90?'Угол прямой, cos C = 0: ничего не вычитаем, c² = 34. Это обычная теорема Пифагора.':'Угол тупой, cos C &lt; 0: минус на минус даёт плюс, к 34 прибавляем, поэтому c² больше 34.';
    $(b,'#o').innerHTML=h})};

/* ---------- Теорема синусов: треугольник в окружности радиуса 5 ---------- */
W.sindemo=b=>{
  b.innerHTML=sl('A','Угол A',20,110,50,1)+sl('B','Угол B',20,110,70,1)+SV('sv',380,330)+OUT;
  const cx=190,cy=165,r=100,u=20;
  bind(b,['A','B'],v=>{
    let A=v.A,B=v.B;
    if(A+B>160){B=160-A;const e=$(b,'#B');e.value=B}
    $(b,'#Av').textContent=A+'°';$(b,'#Bv').textContent=B+'°';
    const C=180-A-B,tB=210,tC=tB+2*A,tA=tC+2*B;
    const pt=t=>[cx+r*Math.cos(t*DEG),cy-r*Math.sin(t*DEG)];
    const PB=pt(tB),PC=pt(tC),PA=pt(tA),L=LAB(380,330);
    const d=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1])/u;
    const sa=d(PB,PC),sb=d(PC,PA),sc=d(PA,PB);
    const sA=Math.sin(A*DEG),sB=Math.sin(B*DEG),sC=Math.sin(C*DEG);
    let g=`<circle cx="${cx}" cy="${cy}" r="${r}" class="nf s-line" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="3" class="f-ink"/>`;
    L.circle([cx,cy],r);L.dot([cx,cy],3);
    g+=`<polygon points="${PB} ${PC} ${PA}" class="nf s-acc" stroke-width="3.5" stroke-linejoin="round"/>`;
    L.seg(PB,PC,2);L.seg(PC,PA,2);L.seg(PA,PB,2);
    for(const P of[PA,PB,PC]){g+=`<circle cx="${P[0]}" cy="${P[1]}" r="5" class="f-ink"/>`;L.dot(P,5)}
    const O=[cx,cy];
    g+=L.lab(PA,out2(O,PA),'A '+A+'°','t',13,{start:14}).svg+L.lab(PB,out2(O,PB),'B '+B+'°','t',13,{start:14}).svg+L.lab(PC,out2(O,PC),'C '+C+'°','t',13,{start:14}).svg;
    $(b,'#sv').innerHTML=g;
    $(b,'#o').innerHTML=`<span class="mute">Радиус R = 5, значит, 2R = 10. Стороны измерены по рисунку:</span><br>`
     +`a = BC = ${f(sa,2)},&nbsp; a : sin A = ${f(sa/sA,2)}<br>`
     +`b = AC = ${f(sb,2)},&nbsp; b : sin B = ${f(sb/sB,2)}<br>`
     +`c = AB = ${f(sc,2)},&nbsp; c : sin C = ${f(sc/sC,2)}<br><b>Все три отношения одинаковы и равны 2R = 10.</b>`})};

/* ---------- Трапеция: средняя линия ---------- */
W.trapmid=b=>{
  b.innerHTML=sl('a','Нижнее основание AD',6,20,14,1)+sl('b','Верхнее основание BC',2,20,8,1)+sl('sh','Сдвиг верхнего основания',-4,4,1,1)+SV('sv',380,210)+OUT;
  bind(b,['a','b','sh'],v=>{
    const a=v.a,bb=v.b,s=v.sh,k=Math.min(11,300/Math.max(a,bb+Math.abs(s)+Math.abs(a-bb)/2+1));
    const hh=100,yb=165,yt=yb-hh;
    let A=[0,yb],D=[a*k,yb],B=[(a-bb)/2*k+s*k,yt],C=[B[0]+bb*k,yt];
    const xs=[A[0],D[0],B[0],C[0]],mnx=Math.min(...xs),mxx=Math.max(...xs),sh=(380-(mxx-mnx))/2-mnx;
    [A,B,C,D].forEach(p=>p[0]+=sh);
    const M=mid2(A,B),N=mid2(C,D),L=LAB(380,210),cen=[(A[0]+B[0]+C[0]+D[0])/4,(A[1]+B[1]+C[1]+D[1])/4];
    let g=ln(A[0],A[1],D[0],D[1],'s-ink',3)+ln(B[0],B[1],C[0],C[1],'s-ink',3)+ln(A[0],A[1],B[0],B[1],'s-ink',3)+ln(C[0],C[1],D[0],D[1],'s-ink',3)+ln(M[0],M[1],N[0],N[1],'s-acc',4,'stroke-dasharray="6 4"');
    L.seg(A,D,3);L.seg(B,C,3);L.seg(A,B,3);L.seg(C,D,3);L.seg(M,N,3);L.dot(M,4);L.dot(N,4);
    g+=`<circle cx="${M[0]}" cy="${M[1]}" r="4" style="fill:var(--apricot)"/><circle cx="${N[0]}" cy="${N[1]}" r="4" style="fill:var(--apricot)"/>`;
    for(const[nm,p]of[['A',A],['B',B],['C',C],['D',D]])g+=L.lab(p,out2(cen,p),nm,'t',14,{start:12}).svg;
    g+=L.lab(M,[-1,0],'M','t',14,{start:12}).svg+L.lab(N,[1,0],'N','t',14,{start:12}).svg;
    g+=L.lab(mid2(B,C),[0,-1],'b = '+bb,'t-mute',12,{start:10}).svg+L.lab(mid2(A,D),[0,1],'a = '+a,'t-mute',12,{start:12}).svg;
    const mn=Math.hypot(N[0]-M[0],N[1]-M[1])/k;
    $(b,'#sv').innerHTML=g;
    $(b,'#o').innerHTML=`<b><span class="nb">MN = (a + b) : 2</span><br><span class="nb">= (${a} + ${bb}) : 2 = ${f((a+bb)/2,1)}</span></b><br><span class="mute">Измеряем MN по чертежу: ${f(mn,1)}. Двигай сдвиг: форма трапеции меняется, а средняя линия по-прежнему равна полусумме оснований.</span>`})};

/* ---------- Равнобедренная трапеция: высоты и отрезки на основании ---------- */
W.trapiso=b=>{
  b.innerHTML=sl('al','Угол A',30,70,45,1)+chips([30,45,60])+sl('a','Нижнее основание AD',14,26,20,1)+sl('b','Верхнее основание BC',4,12,8,1)+SV('sv',380,230)+OUT;
  const mark=wireChips(b,'al');
  bind(b,['al','a','b'],v=>{
    const al=v.al,a=v.a,bb=v.b,x=(a-bb)/2,th=al*DEG,hh=x*Math.tan(th),sd=x/Math.cos(th);
    $(b,'#alv').textContent=al+'°';mark(al);
    const k=Math.min(300/a,150/hh),ox=(380-a*k)/2,yb=205;
    const A=[ox,yb],D=[ox+a*k,yb],B=[ox+x*k,yb-hh*k],C=[ox+(x+bb)*k,yb-hh*k],H=[B[0],yb],K=[C[0],yb];
    const L=LAB(380,230),cen=[(A[0]+B[0]+C[0]+D[0])/4,(A[1]+B[1]+C[1]+D[1])/4];
    let g=ln(A[0],A[1],D[0],D[1],'s-ink',3)+ln(B[0],B[1],C[0],C[1],'s-ink',3)+ln(A[0],A[1],B[0],B[1],'s-ink',3)+ln(C[0],C[1],D[0],D[1],'s-ink',3)
      +ln(B[0],B[1],H[0],H[1],'s-acc',3,'stroke-dasharray="6 4"')+ln(C[0],C[1],K[0],K[1],'s-acc',3,'stroke-dasharray="6 4"');
    L.seg(A,D,3);L.seg(B,C,3);L.seg(A,B,3);L.seg(C,D,3);L.seg(B,H,3);L.seg(C,K,3);
    g+=`<path d="M${A[0]+26} ${A[1]} A26 26 0 0 0 ${A[0]+26*Math.cos(th)} ${A[1]-26*Math.sin(th)}" class="nf s-acc" stroke-width="2"/>`;L.arc(A,26,0,al);
    for(const[nm,p]of[['A',A],['B',B],['C',C],['D',D]])g+=L.lab(p,out2(cen,p),nm,'t',14,{start:12}).svg;
    g+=L.lab(H,[0,1],'H','t',14,{start:14}).svg+L.lab(K,[0,1],'K','t',14,{start:14}).svg;
    g+=L.lab(mid2(A,H),[0,1],'x = '+f(x,1),'t-mute',12,{start:16}).svg;
    $(b,'#sv').innerHTML=g;
    let tail=al===45?'Угол A = 45°, значит, треугольник ABH равнобедренный и BH = AH.':al===60?'В треугольнике ABH угол ABH = 30°, значит, AH = AB : 2, то есть AB = 2 · AH.':al===30?'В треугольнике ABH катет BH лежит против угла 30°, значит, BH = AB : 2.':'Чем больше угол A, тем выше трапеция при тех же основаниях.';
    $(b,'#o').innerHTML=`<b><span class="nb">AH = KD = (AD − BC) : 2</span><br><span class="nb">= (${a} − ${bb}) : 2 = ${f(x,1)}</span></b><br>Высота BH ≈ ${f(hh,1)}, боковая сторона AB ≈ ${f(sd,1)} (по чертежу).<br><span class="mute">${tail}</span>`})};

/* ---------- Трапеция, часть 2: площадь как сумма двух треугольников ---------- */
W.traparea=b=>{
  b.innerHTML=sl('a','Нижнее основание AD',6,20,12,1)+sl('b','Верхнее основание BC',2,20,6,1)+sl('h','Высота h',3,10,6,1)+SV('sv',380,230)+OUT;
  bind(b,['a','b','h'],v=>{
    const a=v.a,bb=v.b,h=v.h,k=Math.min(300/Math.max(a,bb),150/h),yb=205,ox=(380-a*k)/2;
    const A=[ox,yb],D=[ox+a*k,yb],B=[ox+(a-bb)/2*k,yb-h*k],C=[B[0]+bb*k,B[1]];
    const L=LAB(380,230),cen=[(A[0]+B[0]+C[0]+D[0])/4,(A[1]+B[1]+C[1]+D[1])/4];
    let g=ln(A[0],A[1],D[0],D[1],'s-ink',3)+ln(B[0],B[1],C[0],C[1],'s-ink',3)+ln(A[0],A[1],B[0],B[1],'s-ink',3)+ln(C[0],C[1],D[0],D[1],'s-ink',3)+ln(A[0],A[1],C[0],C[1],'s-acc',3,'stroke-dasharray="6 4"');
    L.seg(A,D,3);L.seg(B,C,3);L.seg(A,B,3);L.seg(C,D,3);L.seg(A,C,3);
    for(const[nm,p]of[['A',A],['B',B],['C',C],['D',D]])g+=L.lab(p,out2(cen,p),nm,'t',14,{start:12}).svg;
    g+=L.lab(cen3(A,B,C),[0,-1],'S₁','t-mute',13,{start:1,maxd:40}).svg+L.lab(cen3(A,C,D),[0,1],'S₂','t-mute',13,{start:1,maxd:40}).svg;
    $(b,'#sv').innerHTML=g;
    const s1=bb*h/2,s2=a*h/2;
    $(b,'#o').innerHTML=`<b><span class="nb">S₁ = ½ · b · h = ½ · ${bb} · ${h} = ${f(s1,1)}</span></b><br><b><span class="nb">S₂ = ½ · a · h = ½ · ${a} · ${h} = ${f(s2,1)}</span></b><br><b><span class="nb">S = S₁ + S₂ = ${f(s1+s2,1)}</span></b><br><span class="mute">Проверка по формуле: ½ · (${a} + ${bb}) · ${h} = ${f((a+bb)*h/2,1)}. Результаты одинаковы при любых основаниях и высоте.</span>`})};

/* ---------- Трапеция, часть 2: высота по теореме Пифагора ---------- */
W.trappyth=b=>{
  b.innerHTML=sl('a','Нижнее основание AD',10,26,20,1)+sl('b','Верхнее основание BC',4,10,10,1)+sl('c','Боковая сторона AB',12,18,13,1)+SV('sv',380,230)+OUT;
  bind(b,['a','b','c'],v=>{
    const a=v.a,bb=v.b,c=v.c,x=(a-bb)/2,h=Math.sqrt(c*c-x*x),k=Math.min(300/a,150/h),yb=205,ox=(380-a*k)/2;
    const A=[ox,yb],D=[ox+a*k,yb],B=[ox+x*k,yb-h*k],C=[B[0]+bb*k,B[1]],H=[B[0],yb],K=[C[0],yb];
    const L=LAB(380,230),cen=[(A[0]+B[0]+C[0]+D[0])/4,(A[1]+B[1]+C[1]+D[1])/4];
    let g=ln(A[0],A[1],D[0],D[1],'s-ink',3)+ln(B[0],B[1],C[0],C[1],'s-ink',3)+ln(A[0],A[1],B[0],B[1],'s-ink',3)+ln(C[0],C[1],D[0],D[1],'s-ink',3)+ln(B[0],B[1],H[0],H[1],'s-acc',3,'stroke-dasharray="6 4"')+ln(C[0],C[1],K[0],K[1],'s-acc',3,'stroke-dasharray="6 4"');
    L.seg(A,D,3);L.seg(B,C,3);L.seg(A,B,3);L.seg(C,D,3);L.seg(B,H,3);L.seg(C,K,3);
    for(const[nm,p]of[['A',A],['B',B],['C',C],['D',D]])g+=L.lab(p,out2(cen,p),nm,'t',14,{start:12}).svg;
    g+=L.lab(H,[0,1],'H','t',14,{start:14}).svg+L.lab(mid2(A,B),out2(cen,mid2(A,B)),'c','t-mute',13,{start:9}).svg+L.lab(mid2(A,H),[0,1],'x','t-mute',13,{start:14}).svg+L.lab(mid2(B,H),[1,0],'h','t-mute',13,{start:9,alts:[0,20,-20,40,-40]}).svg;
    $(b,'#sv').innerHTML=g;
    $(b,'#o').innerHTML=`<b><span class="nb">x = (AD − BC) : 2 = ${f(x,1)}</span></b><br><b><span class="nb">h² = c² − x² = ${c*c} − ${f(x*x,2)} = ${f(h*h,2)}</span></b><br><b><span class="nb">h ≈ ${f(h,2)}</span>, <span class="nb">S ≈ ${f((a+bb)*h/2,1)}</span></b><br><span class="mute">Если h получилось целым, тройка чисел x, h, c пифагорова: например, 5, 12, 13.</span>`})};

/* ---------- Пропорциональные отрезки: двигаем прямую MN параллельно BC ---------- */
W.propdemo=b=>{
  b.innerHTML=sl('m','Длина AM',1,9,3,1)+SV('sv',330,215)+OUT;
  const A=[165,25],AB=10,AC=8,u=20,B=[A[0]-0.6*AB*u,A[1]+0.8*AB*u],C=[A[0]+0.8*AC*u,A[1]+0.6*AC*u];
  bind(b,['m'],v=>{
    const am=v.m,s=am/AB,an=s*AC,mb=AB-am,nc=AC-an;
    const M=[A[0]+s*(B[0]-A[0]),A[1]+s*(B[1]-A[1])],N=[A[0]+s*(C[0]-A[0]),A[1]+s*(C[1]-A[1])],L=LAB(330,215);
    let g=ln(A[0],A[1],B[0],B[1],'s-ink',3)+ln(A[0],A[1],C[0],C[1],'s-ink',3)+ln(B[0],B[1],C[0],C[1],'s-ink',3)+ln(M[0],M[1],N[0],N[1],'s-acc',4,'stroke-dasharray="6 4"');
    L.seg(A,B,3);L.seg(A,C,3);L.seg(B,C,3);L.seg(M,N,3);L.dot(M,4);L.dot(N,4);
    g+=`<circle cx="${M[0]}" cy="${M[1]}" r="4" style="fill:var(--apricot)"/><circle cx="${N[0]}" cy="${N[1]}" r="4" style="fill:var(--apricot)"/>`;
    const cen=cen3(A,B,C);
    g+=L.lab(A,[0,-1],'A','t',14,{start:12}).svg+L.lab(B,out2(cen,B),'B','t',14,{start:12}).svg+L.lab(C,out2(cen,C),'C','t',14,{start:12}).svg;
    g+=L.lab(M,[-1,0],'M','t',14,{start:12}).svg+L.lab(N,[1,0],'N','t',14,{start:12}).svg;
    $(b,'#sv').innerHTML=g;
    $(b,'#o').innerHTML=`<b><span class="nb">AM : MB = ${am} : ${mb} = ${f(am/mb,2)}</span></b><br><b><span class="nb">AN : NC = ${f(an,1)} : ${f(nc,1)} = ${f(an/nc,2)}</span></b><br><span class="mute"><span class="nb">AB = 10</span>, <span class="nb">AC = 8</span>. Отрезки разные, а отношения одинаковые. Двигай ползунок: так будет при любом положении MN.</span>`})};

/* ---------- Коэффициент подобия: периметры и площади ---------- */
W.simk=b=>{
  b.innerHTML=sl('k','Коэффициент подобия k',0.5,3,2,0.5)+SV('sv',380,230)+OUT;
  const s=18,y0=214;
  bind(b,['k'],v=>{
    const k=v.k,L=LAB(380,230);
    const mk=(x0,kk)=>[[x0,y0],[x0+4*s*kk,y0],[x0,y0-3*s*kk]];
    const T1=mk(22,1),x1=22+4*s+44,T2=mk(x1,k);
    let g='';
    for(const[T,cl]of[[T1,'s-ink'],[T2,'s-acc']]){
      g+=ln(T[0][0],T[0][1],T[1][0],T[1][1],cl,3)+ln(T[0][0],T[0][1],T[2][0],T[2][1],cl,3)+ln(T[1][0],T[1][1],T[2][0],T[2][1],cl,3);
      L.seg(T[0],T[1],3);L.seg(T[0],T[2],3);L.seg(T[1],T[2],3);
      const r=Math.min(9,0.5*Math.abs(T[1][0]-T[0][0]));
      g+=ln(T[0][0]+r,T[0][1],T[0][0]+r,T[0][1]-r,'s-ink',1.5)+ln(T[0][0],T[0][1]-r,T[0][0]+r,T[0][1]-r,'s-ink',1.5);
      L.seg([T[0][0]+r,T[0][1]],[T[0][0]+r,T[0][1]-r],2);L.seg([T[0][0],T[0][1]-r],[T[0][0]+r,T[0][1]-r],2);
    }
    const lb=(T,kk)=>{const c=cen3(T[0],T[1],T[2]);
      return L.lab(mid2(T[0],T[1]),[0,1],f(4*kk,1),'t-mute',12,{start:8}).svg+L.lab(mid2(T[0],T[2]),[-1,0],f(3*kk,1),'t-mute',12,{start:8}).svg+L.lab(mid2(T[1],T[2]),out2(c,mid2(T[1],T[2])),f(5*kk,1),'t-mute',12,{start:8}).svg};
    g+=lb(T1,1)+lb(T2,k);
    $(b,'#sv').innerHTML=g;
    $(b,'#o').innerHTML=`<b><span class="nb">P₁ = 12, P₂ = ${f(12*k,1)}, P₂ : P₁ = ${f(k,1)}</span></b><br><b><span class="nb">S₁ = 6, S₂ = ${f(6*k*k,2)}, S₂ : S₁ = ${f(k*k,2)}</span></b><br><span class="mute">Периметры относятся как k. Площади относятся как k², то есть <span class="nb">${f(k,1)} · ${f(k,1)} = ${f(k*k,2)}</span>.</span>`})};
