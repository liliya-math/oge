import re,json,sys
sys.path.insert(0,'tools/oshibki')
import ans,fig
d=json.load(open('tools/oshibki/cards.json'))
def sup(s):return s
def rad(s):
    s=re.sub(r'√\(([^()]*)\)',lambda m:'<span class="rt"><span class="rs">√</span><span class="rv">'+m.group(1)+'</span></span>',s)
    s=re.sub(r'√(\d+|[a-zA-Z])',lambda m:'<span class="rt"><span class="rs">√</span><span class="rv">'+m.group(1)+'</span></span>',s)
    return s
G=r'(\([^()]*\)|\d+|[A-Za-z]\d?)'
def frac(s):
    def f(m):
        a,b=m.group(1),m.group(2)
        a=a[1:-1] if a.startswith('(') and a.endswith(')') else a
        b=b[1:-1] if b.startswith('(') and b.endswith(')') else b
        return f'<span class="fr"><span>{a}</span><span>{b}</span></span>'
    return re.sub(r'(?<![\w.])'+G+r'/'+G+r'(?![\w])',f,s)
def esc(s):return s.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')
def fmt(s):return rad(frac(esc(s)))
FLAGS=[(r'неправильной дробью','impr'),(r'десятичной дробью','dec'),(r'Разложи.*множител|Вынеси общий|Выдели квадрат','par'),(r'Раскрой скобки|Перемножь|Приведи подобные|Возведи одночлен|Представь в виде степени','nopar'),(r'одной степенью|в виде степени','pow'),(r'Вынеси множитель из-под корня','rootout'),(r'Избавься от корня','noroot')]
def flags(c):
    f={}
    for rx,k in FLAGS:
        if re.search(rx,c['intro']):f[k]=True
    if f.get('par') and re.search(r'Вынеси множитель из-под',c['intro']):f.pop('par',None)
    return f
cards=sorted(d['cards'],key=lambda c:(c['cls'],c['id']))
T=[]
for n,c in enumerate(cards,1):
    subs=ans.build_card(c)
    sy=''.join(ch for ch in '√π²³≤≥≠∞°' if ch in ' '.join(c['ans']+c['items']+[c['intro']]))
    if c['id'] in fig.show_ids():
        svg,mv,bad=fig.fig_svg(c['id'],d['figs'][c['id']],'all' if c['id'] in fig.KEEP_ALL else 'letters')
        if bad:print('UNRESOLVED',c['id'],bad)
        figh=f'<div class="figbox">{svg}</div>'
    else:figh=''
    items=''.join(f'<li>{fmt(x)}</li>' for x in c['items'])
    q=f'<p>{fmt(c["intro"])}</p>{figh}<ol class="subq">{items}</ol>'
    t={'n':n,'lab':c['id'],'blk':'b' if c['cls']<=6 else 'm' if c['cls']==7 else 'h','cls':c['cls'],'topic':c['topic'],'err':c['err'],'type':'sub','q':q,'subs':subs,'sym':sy,
       'h':['Подумай: '+fmt(c['q']),fmt(c['r'])]}
    fl=flags(c)
    if fl:t['flag']=fl
    T.append(t)
js='const T = '+json.dumps(T,ensure_ascii=False,separators=(',',':'))+';\n'
open('tools/oshibki/tasks.js','w',encoding='utf8').write(js)
print(len(T),'tasks',len(js)//1024,'KB')
