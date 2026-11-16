import json,os
from PIL import Image,ImageChops
V=10; D=f'img/v{V:02d}'
def crop(src,box,name):
    im=Image.open(f'{D}/{src}').convert('RGB'); W,H=im.size
    x0,y0,x1,y1=box; im=im.crop((x0,y0,min(x1,W),min(y1,H)))
    bb=ImageChops.difference(im,Image.new('RGB',im.size,'white')).point(lambda p:255 if p>40 else 0).getbbox()
    im=im.crop((max(bb[0]-6,0),max(bb[1]-6,0),min(bb[2]+6,im.width),min(bb[3]+6,im.height)))
    p=f'{D}/{name}.webp'; im.save(p,quality=90); return f'<img class="fig" src="{p}" width="{im.width}" height="{im.height}" alt="Рисунок к заданию">',im
figs={}
figs['ctx']=crop('ctx-1.webp',(474,0,976,380),'f-ctx')
figs[7]=crop('z07-1.webp',(52,80,832,160),'f07')
figs[11]=crop('z11-1.webp',(55,75,987,362),'f11')
figs[15]=crop('z15-1.webp',(652,6,982,135),'f15')
figs[16]=crop('z16-1.webp',(792,6,976,195),'f16')
figs[17]=crop('z17-1.webp',(674,6,975,170),'f17')
figs[18]=crop('z18-1.webp',(702,6,985,150),'f18')
F=lambda k:figs[k][0]
def fr(a,b): return f'<math><mfrac><mn>{a}</mn><mn>{b}</mn></mfrac></math>'
M=lambda s:f'<span class="f">{s}</span>'
B=lambda s:f'<p class="big">{s}</p>'
P=lambda *a:''.join(f'<p>{x}</p>' for x in a)
sysm=lambda r1,r2:f'<math display="block"><mrow><mo stretchy="true">{{</mo><mtable columnalign="left"><mtr><mtd>{r1}</mtd></mtr><mtr><mtd>{r2}</mtd></mtr></mtable></mrow></math>'
mi=lambda c:f'<mi>{c}</mi>'; mn=lambda c:f'<mn>{c}</mn>'; mo=lambda c:f'<mo>{c}</mo>'
sq=lambda c:f'<msup>{mi(c)}{mn(2)}</msup>'
ctx=F('ctx')+P('Общепринятые форматы листов бумаги обозначают буквой А и цифрой: А0, А1, А2 и так далее.',
 'Лист формата А0 имеет форму прямоугольника, площадь которого равна 1 кв. м.',
 'Если лист формата А0 разрезать пополам параллельно меньшей стороне, получается два равных листа формата А1. Если лист А1 разрезать так же пополам, получается два листа формата А2. И так далее.',
 'Отношение большей стороны к меньшей стороне листа каждого формата одно и то же, поэтому листы всех форматов подобны. Это сделано специально для того, чтобы пропорции текста и его расположение на листе сохранялись при уменьшении или увеличении шрифта при изменении формата листа.')
T={}
T[1]=P('В таблице даны размеры (с точностью до мм) четырёх листов, имеющих форматы А2, А3, А4 и А6.')+'<table><tr><th>Номер листа</th><th>Длина (мм)</th><th>Ширина (мм)</th></tr><tr><td>1</td><td>594</td><td>420</td></tr><tr><td>2</td><td>420</td><td>297</td></tr><tr><td>3</td><td>148</td><td>105</td></tr><tr><td>4</td><td>297</td><td>210</td></tr></table>'+P('Установите соответствие между форматами и номерами листов. Заполните таблицу, в бланк ответов перенесите последовательность четырёх цифр, соответствующих номерам листов, без пробелов, запятых и дополнительных символов.')+'<table><tr><th>А2</th><th>А3</th><th>А4</th><th>А6</th></tr><tr><td>&nbsp;</td><td></td><td></td><td></td></tr></table>'
T[2]=P('Сколько листов формата А4 получится из одного листа формата А1?')
T[3]=P('Найдите ширину листа бумаги формата А0.','Ответ дайте в миллиметрах и округлите до ближайшего целого числа, кратного 10.')
T[4]=P('Найдите отношение длины меньшей стороны листа формата А4 к большей.','Ответ округлите до десятых.')
T[5]=P('Бумагу формата А1 упаковали в пачки по 80 листов. Найдите массу пачки, если масса бумаги площади 1 кв. м равна 120 г.','Ответ дайте в граммах.')
T[6]=P('Найдите значение выражения')+B('6,9 + 7,4')
T[7]=P('Одно из чисел '+M(fr(3,11)+', '+fr(7,11)+', '+fr(8,11)+', '+fr(13,11))+' отмечено на прямой точкой.')+F(7)+P('Какое это число?')+'<p class="opts">'+''.join(M(f'{i}) '+fr(a,11)) for i,a in enumerate((3,7,8,13),1))+'</p>'
T[8]=P('Найдите значение выражения')+B(f'<math><mfrac><msup><mrow>{mo("(")}{mn(3)}{mo("·")}{mn(4)}{mo(")")}</mrow>{mn(4)}</msup><mrow><msup>{mn(3)}{mn(2)}</msup>{mo("·")}<msup>{mn(4)}{mn(3)}</msup></mrow></mfrac></math>')
T[9]=P('Решите уравнение')+B('<i>x</i><sup>2</sup> − 64 = 0')+P('Если уравнение имеет более одного корня, в ответ запишите больший из корней.')
T[10]=P('Вероятность того, что новая шариковая ручка пишет плохо (или не пишет), равна 0,2. Покупатель в магазине выбирает одну шариковую ручку.','Найдите вероятность того, что эта ручка пишет хорошо.')
T[11]=P('На рисунках изображены графики функций вида '+M('<i>y</i> = <i>kx</i> + <i>b</i>')+'. Установите соответствие между знаками коэффициентов <i>k</i> и <i>b</i> и графиками функций.')+F(11)+'<p class="opts">'+M('1) <i>k</i> &lt; 0, <i>b</i> &lt; 0')+M('2) <i>k</i> &gt; 0, <i>b</i> &gt; 0')+M('3) <i>k</i> &gt; 0, <i>b</i> &lt; 0')+'</p>'+P('В ответ запишите три цифры в порядке букв А, Б, В.')
T[12]=P('Чтобы перевести значение температуры по шкале Цельсия в шкалу Фаренгейта, пользуются формулой')+B('<i>t</i><sub>F</sub> = 1,8<i>t</i><sub>C</sub> + 32,')+P('где '+M('<i>t</i><sub>C</sub>')+' — температура в градусах Цельсия, '+M('<i>t</i><sub>F</sub>')+' — температура в градусах Фаренгейта.','Скольким градусам по шкале Фаренгейта соответствует 80 градусов по шкале Цельсия?')
T[13]=P('Укажите решение системы неравенств')+'<div class="big">'+sysm(f'{mo("−")}{mn(5)}{mo("+")}{mn(5)}{mi("x")}{mo("&lt;")}{mn(0)}',f'{mn(4)}{mo("−")}{mn(3)}{mi("x")}{mo("&lt;")}{mn(31)}')+'</div><p class="opts">'+M('1) (−9; 1)')+M('2) нет решений')+M('3) (−9; +∞)')+M('4) (−∞; 1)')+'</p>'
T[14]=P('В амфитеатре 18 рядов, причём в каждом следующем ряду на одно и то же число мест больше, чем в предыдущем. В шестом ряду 26 мест, а в восьмом ряду 30 мест.','Сколько мест в последнем ряду амфитеатра?')
T[15]=F(15)+P('В треугольнике <i>ABC</i> известно, что '+M('<i>AB</i> = <i>BC</i>')+', '+M('∠<i>ABC</i> = 128°')+'.','Найдите угол <i>BCA</i>. Ответ дайте в градусах.')
T[16]=F(16)+P('Четырёхугольник <i>ABCD</i> вписан в окружность. Угол <i>ABD</i> равен 51°, угол <i>CAD</i> равен 42°.','Найдите угол <i>ABC</i>. Ответ дайте в градусах.')
T[17]=F(17)+P('Диагональ <i>BD</i> параллелограмма <i>ABCD</i> образует с его сторонами углы, равные 65° и 80°.','Найдите меньший угол этого параллелограмма. Ответ дайте в градусах.')
T[18]=F(18)+P('На клетчатой бумаге с размером клетки '+M('1 × 1')+' изображён параллелограмм.','Найдите его площадь.')
T[19]=P('Какие из следующих утверждений верны?')+'<p class="st">1) Длина гипотенузы прямоугольного треугольника меньше суммы длин его катетов.</p><p class="st">2) Если точка лежит на биссектрисе угла, то она равноудалена от сторон этого угла.</p><p class="st">3) Если диагонали параллелограмма равны, то этот параллелограмм является ромбом.</p>'+P('В ответ запишите номера выбранных утверждений без пробелов, запятых и других дополнительных символов.')
T[20]=P('Решите систему уравнений')+'<div class="big">'+sysm(f'{sq("x")}{mo("+")}{mn(3)}{sq("y")}{mo("=")}{mn(31)}{mo(",")}',f'{mn(2)}{sq("x")}{mo("+")}{mn(6)}{sq("y")}{mo("=")}{mn(31)}{mi("x")}{mo(".")}')+'</div>'
T[21]=P('Имеются два сосуда, содержащие 40 кг и 20 кг раствора кислоты различной концентрации. Если их слить вместе, то получится раствор, содержащий 33% кислоты. Если же слить равные массы этих растворов, то полученный раствор будет содержать 47% кислоты.','Сколько килограммов кислоты содержится в первом растворе?')
T[22]=P('Постройте график функции')+B('<i>y</i> = |<i>x</i><sup>2</sup> − 6<i>x</i> + 5|.')+P('Какое наибольшее число общих точек может иметь график данной функции с прямой, параллельной оси абсцисс?')
T[23]=P('Катеты прямоугольного треугольника равны 15 и 20.','Найдите высоту, проведённую к гипотенузе.')
T[24]=P('Внутри параллелограмма <i>ABCD</i> выбрали произвольную точку <i>F</i>.','Докажите, что сумма площадей треугольников <i>BFC</i> и <i>AFD</i> равна половине площади параллелограмма.')
T[25]=P('В равнобедренную трапецию, периметр которой равен 80, а площадь равна 320, можно вписать окружность.','Найдите расстояние от точки пересечения диагоналей трапеции до её меньшего основания.')
s=open('index.html',encoding='utf-8').read()
tag='<script type="application/json" id="data">'
a=s.find(tag)+len(tag); b=s.find('</script>',a)
d=json.loads(s[a:b]); v=d[V-1]
v['ctxHtml']=ctx
for n in range(1,26): v['tasks'][n-1]['html']=T[n]
s=s[:a]+json.dumps(d,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')+s[b:]
css='''
.cond{color:#1d2a1f;font-size:17px;line-height:1.5}
.cond p{margin:0 0 10px;text-indent:1.4em}
.cond p.big{text-indent:0;text-align:center;font-size:23px;margin:14px 0;white-space:nowrap;overflow-x:auto}
.cond div.big{font-size:23px;margin:14px 0;overflow-x:auto}
.cond p.opts{text-indent:0;display:flex;flex-wrap:wrap;gap:10px 34px;margin:12px 0 12px 1.4em;font-size:19px}
.cond p.st{text-indent:0;margin-left:1.4em}
.cond .f,.cond math{white-space:nowrap}
.cond .fig{margin:6px auto 14px}
.cond table{border-collapse:collapse;margin:8px 0 14px 1.4em}
.cond th,.cond td{border:1px solid #1d2a1f;padding:4px 16px;text-align:center;font-weight:400}
'''
if '.cond{' not in s:
    i=s.rfind('</style>'); s=s[:i]+css+s[i:]
o1="images(byId('question'),current.scan,'Условие задания №'+task);"
n1="byId('question').classList.toggle('cond',Boolean(current.html));\n  if (current.html) byId('question').innerHTML=current.html; else "+o1+"\n  byId('zoom').hidden=Boolean(current.html);"
o2="if (previousVariant!==v) images(byId('context'),data.context,'Общее условие и рисунок для заданий №1–5');"
n2="if (previousVariant!==v) { byId('context').classList.toggle('cond',Boolean(data.ctxHtml)); if (data.ctxHtml) byId('context').innerHTML=data.ctxHtml; else images(byId('context'),data.context,'Общее условие и рисунок для заданий №1–5'); }"
if o1 in s and n1 not in s: s=s.replace(o1,n1)
if o2 in s: s=s.replace(o2,n2)
assert n1 in s and n2 in s
open('index.html','w',encoding='utf-8').write(s)
open('/tmp/app.js','w').write(s[s.rfind('<script>')+8:s.rfind('</script>')])
ims=[figs[k][1] for k in figs]
sh=Image.new('RGB',(max(i.width for i in ims),sum(i.height+8 for i in ims)),'red'); y=0
for i in ims: sh.paste(i,(0,y)); y+=i.height+8
sh.save('../_proverka-oge32.jpg',quality=72); print(sh.size,[i.size for i in ims])
