import re,json,math
KEEP_ALL={'04.5','08.5','08.6','29.5','33.5','46.2','10.1','10.2'}
HIDE_MARK={'10.1','10.2'}
LETTERS={'06.5','10.5','10.6','11.5','11.6','12.6','15.5','18.5','18.6','19.5','20.5','22.5','24.5','31.6','33.6','35.5','36.5','36.6','37.5','37.6','41.6','42.5','42.6','43.5','43.6','46.5','48.5','48.6'}
def show_ids():return KEEP_ALL|LETTERS
LAB_RE=re.compile(r'(?<![\w.,])(\d+(?:\.\d+)?),(\d+(?:\.\d+)?) (.*?)(?=; \d+(?:\.\d+)?,\d+(?:\.\d+)? |$)')
def parse(spec):
    head,_,lab=spec.partition('Подписи: ')
    objs=[]
    for part in [p for p in head.split(' | ') if p.strip()]:
        m=re.match(r'(-|[0-9a-f]{6})/(-|[0-9a-f]{6})(d?) (.*)$',part.strip())
        if not m:continue
        ln,fl,d,rest=m.groups()
        objs.append(dict(ln=None if ln=='-' else '#'+ln,fl=None if fl=='-' else '#'+fl,dash=bool(d),rest=rest))
    labs=[(float(a),float(b),t.strip()) for a,b,t in LAB_RE.findall(lab)] if lab else []
    return objs,labs
def pts(s):return [tuple(map(float,p.split(','))) for p in s.split()]
def build(o):
    """returns (svg element string, sample points list, bbox points)"""
    rest=o['rest'];attr=''
    stroke=o['ln'] or 'none';fill=o['fl'] or 'none'
    sty=f'stroke="{stroke}" fill="{fill}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"'+(' stroke-dasharray="4 3"' if o['dash'] else '')
    m=re.match(r'([RO])(.*)$',rest)
    if m and m.group(1)=='R':
        (x1,y1),(x2,y2)=pts(m.group(2));
        return f'<rect x="{min(x1,x2)}" y="{min(y1,y2)}" width="{abs(x2-x1)}" height="{abs(y2-y1)}" {sty}/>',[(x1,y1),(x2,y1),(x2,y2),(x1,y2),(x1,y1)],'rect',[(x1,y1),(x2,y2)]
    if m and m.group(1)=='O':
        a,r=m.group(2).split();cx,cy=map(float,a.split(','));r=float(r)
        return f'<circle cx="{cx}" cy="{cy}" r="{r}" {sty}/>',[(cx+r*math.cos(t/16*6.2832),cy+r*math.sin(t/16*6.2832)) for t in range(16)] if r>3 else [(cx,cy)],'circ',[(cx-r,cy-r),(cx+r,cy+r)]
    d='';cur=None;samples=[];allp=[]
    for seg in rest.split(';'):
        seg=seg.strip();k=seg[0];p=pts(seg[1:]);allp+=p
        if k=='Q':
            d+='M'+' L'.join(f'{x},{y}' for x,y in p)+' Z';samples+=p+[p[0]];cur=None;continue
        start=p[0]
        if cur is None or abs(cur[0]-start[0])>.01 or abs(cur[1]-start[1])>.01:d+=f'M{start[0]},{start[1]} '
        if k=='L':
            d+=' '.join(f'L{x},{y}' for x,y in p[1:])+' ';samples+=p;cur=p[-1]
        elif k=='C':
            (x0,y0),(x1,y1),(x2,y2),(x3,y3)=p[:4];d+=f'C{x1},{y1} {x2},{y2} {x3},{y3} '
            for i in range(9):
                t=i/8;u=1-t;samples.append((u**3*x0+3*u*u*t*x1+3*u*t*t*x2+t**3*x3,u**3*y0+3*u*u*t*y1+3*u*t*t*y2+t**3*y3))
            cur=(x3,y3)
    if fill!='none':d+='Z'
    return f'<path d="{d.strip()}" {sty}/>',samples,'path',allp
def dense(samples):
    out=[]
    for (a,b),(c,d) in zip(samples,samples[1:]):
        n=max(1,int(math.hypot(c-a,d-b)/2))
        out+=[(a+(c-a)*i/n,b+(d-b)*i/n) for i in range(n+1)]
    return out or samples
def fig_svg(fid,spec,mode):
    objs,labs=parse(spec)
    if fid in HIDE_MARK:
        objs=[o for o in objs if not o['dash'] and not (o['rest'].startswith('O') and o['fl'])]
    if mode=='letters':
        labs=[l for l in labs if re.fullmatch(r"[A-Za-z][′']?",l[2])]
    els=[];line_pts=[];bb=[]
    for o in objs:
        e,s,kind,b=build(o);els.append(e);bb+=b
        if o['ln']:
            if kind=='circ':
                line_pts+=dense(s+[s[0]]) if len(s)>1 else s
            else:line_pts+=dense(s)
    FS=8.5 if fid=='10.1' else 11
    def box(x,y,t):
        w=max(5,len(t)*FS*0.6);return (x-1,y-FS*0.78,x+w+1,y+FS*0.25)
    def hit(b,pointsl):
        return any(b[0]-1.5<=px<=b[2]+1.5 and b[1]-1.5<=py<=b[3]+1.5 for px,py in pointsl)
    placed=[];out=[];moved=0;bad=[]
    cand=[(0,0)]+[(dx,dy) for r in (3,6,9,12,15,18) for dx in range(-r,r+1,3) for dy in range(-r,r+1,3) if max(abs(dx),abs(dy))==r]
    for x,y,t in labs:
        done=False
        for dx,dy in cand:
            b=box(x+dx,y+dy,t)
            if hit(b,line_pts):continue
            if any(not(b[2]<p[0] or b[0]>p[2] or b[3]<p[1] or b[1]>p[3]) for p in placed):continue
            placed.append(b);out.append((x+dx,y+dy,t));moved+=(dx,dy)!=(0,0);done=True;break
        if not done:
            b=box(x,y,t);placed.append(b);out.append((x,y,t));bad.append(t)
    for b in placed:bb+=[(b[0],b[1]),(b[2],b[3])]
    xs=[p[0] for p in bb];ys=[p[1] for p in bb]
    x0,y0,x1,y1=min(xs)-8,min(ys)-8,max(xs)+8,max(ys)+8
    W=x1-x0;H=y1-y0;sc=min(2.2,300/W)
    txt=''.join(f'<text x="{x:.1f}" y="{y:.1f}" font-size="{FS}" font-family="Arial,sans-serif" fill="#16231A">{t.replace("&","&amp;").replace("<","&lt;")}</text>' for x,y,t in out)
    svg=f'<svg class="fig" viewBox="{x0:.1f} {y0:.1f} {W:.1f} {H:.1f}" width="{W*sc:.0f}" height="{H*sc:.0f}" role="img" aria-label="Рисунок к заданию">{"".join(els)}{txt}</svg>'
    return svg,moved,bad
if __name__=='__main__':
    d=json.load(open('tools/oshibki/cards.json'))
    rows=[];tm=0;tb=[]
    for fid in sorted(show_ids()):
        mode='all' if fid in KEEP_ALL else 'letters'
        s,mv,bad=fig_svg(fid,d['figs'][fid],mode);tm+=mv
        if bad:tb.append((fid,bad))
        rows.append(f'<div style="display:inline-block;margin:6px;background:#EEE0C8;padding:6px"><div style="font:12px sans-serif">{fid}</div>{s}</div>')
    open('/tmp/figs.html','w').write('<meta charset=utf8><body style="background:#ddd">'+''.join(rows))
    print('figs',len(rows),'moved labels',tm,'unresolved',tb)
