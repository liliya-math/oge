import re,json
UNIT=re.compile(r'\s*(см²|см³|дм²|дм³|м²|м³|км/ч|м/с|см|дм|км|мм|мин|ч|м|г|кг|₽|°|%|п\. ?п\.|шт\.?|клеток|клетки|бусин\w*|человек\w*|бака|ряд\w*)\s*$')
def strip_units(s):
    prev=None
    while prev!=s:
        prev=s;s=UNIT.sub('',s) if re.search(r'[\d)π√]\s*[^\d]*$',s) else s
    return s.strip()
EXPR_OK=re.compile(r'^[0-9a-zA-Z+\-−–·*/()^²³⁴⁵⁶⁷⁸⁹⁰⁻¹₀-₉√π ,.:]+$')
def is_expr(s):
    return bool(s) and EXPR_OK.match(s) is not None and not re.search(r'[а-яА-Я]',s) and not re.search(r'[A-Z]',s)
def kinds(a,intro,item):
    """returns dict kind and data for one answer string"""
    a=a.strip()
    # yes/no style with explanation
    var=[a]
    m=re.match(r'^(Да|Нет)[,:. ]',a)
    if m:var.append(m.group(1))
    if a.startswith('Нет решений') or a.startswith('Решений нет'):var+=['Нет решений','Решений нет','Нет','Корней нет']
    # set of integers separated by "и" or ", "
    if re.fullmatch(r'-?\d+(?:[.,]\d+)?(?:(?:, | и )−?-?\d+(?:[.,]\d+)?)+',a.replace('−','-')):
        toks=re.split(r', | и ',a);return {'k':'set','v':toks}
    # relation with '=' in the middle and numbers: "3/6 = 1/2" -> expr
    base=strip_units(a)
    # drop leading "x = "
    b2=re.sub(r'^[A-Za-zА-Яа-я][₀-₉0-9]*\s*=\s*','',base)
    parts=[p.strip() for p in b2.split(' = ')]
    if all(is_expr(p) for p in parts) and not re.search(r'[<>≤≥]',b2) and not re.search(r'^\(.*;.*\)$',b2) and ';' not in b2 and ':' not in b2 and not (len(parts)==2 and re.search(r'[xyabmtn]',b2) and not is_expr(parts[1]) ):
        if len(parts)==1:return {'k':'e','v':parts[0],'var':var[1:]}
        if len(parts)==2 and re.search(r'[a-z]',parts[0]+parts[1]) and not re.fullmatch(r'[\d/ .,]+',parts[0]):pass
        else:return {'k':'e','v':parts[-1],'alt':parts[:-1]}
    # equation with variables on both sides (e.g. 6x + 3y = 21)
    if ' = ' in a and re.search(r'[xyабв]',a) and is_expr(a) and a.count('=')==1:return {'k':'r','v':a}
    m=re.fullmatch(r'D = (−?\d+), корней нет',a)
    if m:return {'k':'t','v':[a,'D = '+m.group(1),m.group(1)]}
    # numbers with labels "b = −6, D = 16"
    if re.fullmatch(r'(?:[A-Za-z][₀-₉]? = [−-]?\d+(?:,\d+)?(?:, )?)+',a):
        nums=re.findall(r'[−-]?\d+(?:,\d+)?',a);return {'k':'nums','v':nums}
    # inequality / interval / point -> string with variants
    if re.search(r'[<>≤≥∞]|^\(.*;.*\)$|^\[.*;.*\)$|^\(.*;.*\]$',a):
        v=[a]
        if re.fullmatch(r'\(?-?[\d.,]+; -?[\d.,]+\)?',a.replace('−','-')) :v.append(a.strip('()'))
        # comparison items "2/3 > 2/7": accept only the sign too
        m=re.fullmatch(r'.+ ([<>=]) .+',a)
        if m:v.append(m.group(1))
        return {'k':'t','v':v}
    if a in ('<','>','='):return {'k':'t','v':[a]}
    return {'k':'t','v':var}
def build_card(c):
    out=[]
    for it,a in zip(c['items'],c['ans']):
        d=kinds(a,c['intro'],it);d['show']=a;out.append(d)
    return out
if __name__=='__main__':
    d=json.load(open('tools/oshibki/cards.json'))
    from collections import Counter
    cn=Counter();tl=[]
    for c in d['cards']:
        for x in build_card(c):
            cn[x['k']]+=1
            if x['k']=='t' and len(x['show'].split())>=3:tl.append((c['id'],x['show']))
    print(cn);print(len(tl),'long text');print(tl[:40])
