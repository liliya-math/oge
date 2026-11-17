import re,json,sys
src=open('tools/oshibki/tipichnye-oshibki-1-50.md',encoding='utf8').read()
body,_,figtxt=src.partition('## Чертежи в текстовом виде')
cards=[];topic=None;vyp=None
lines=body.split('\n');i=0
while i<len(lines):
    ln=lines[i]
    m=re.match(r'## Выпуск (\d+)',ln)
    if m:vyp=int(m.group(1))
    m=re.match(r'### (.+)',ln)
    if m:topic=m.group(1).strip()
    m=re.match(r'\*\*(\d\d\.\d) · (\d) класс · (.+?)\*\*\s*$',ln)
    if m:
        c={'id':m.group(1),'vyp':vyp,'cls':int(m.group(2)),'err':m.group(3).strip(),'topic':topic}
        j=i+1
        while j<len(lines) and lines[j].strip():
            mm=re.match(r'(Вопрос|Разбор|Схема|Задания|Ответы): (.*?)\s*$',lines[j])
            if mm:c[{'Вопрос':'q','Разбор':'r','Схема':'s','Задания':'t','Ответы':'a'}[mm.group(1)]]=mm.group(2)
            j+=1
        cards.append(c);i=j;continue
    i+=1
figs={}
for ln in figtxt.split('\n'):
    m=re.match(r'(\d\d\.\d) (.*)',ln)
    if m:figs[m.group(1)]=m.group(2)
for c in cards:
    t=c['t']
    # intro + items
    m=re.search(r'\s1\)\s',t)
    c['intro']=t[:m.start()].strip() if m else t
    items=re.split(r'\s*\|\s*(?=\d\))',t[m.start():].strip()) if m else []
    c['items']=[re.sub(r'^\d\)\s*','',x).strip() for x in items]
    a=c['a'];ans=re.split(r'\s*\|\s*(?=\d\))',a)
    c['ans']=[re.sub(r'^\d\)\s*','',x).strip() for x in ans]
    c['fig']=c['id'] in figs
json.dump({'cards':cards,'figs':figs},open('tools/oshibki/cards.json','w'),ensure_ascii=False,indent=0)
print(len(cards),'cards',len(figs),'figs')
bad=[c['id'] for c in cards if len(c['items'])!=3 or len(c['ans'])!=3]
print('not 3x3:',bad)
