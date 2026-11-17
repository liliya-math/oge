import re,sys
src=open('diagnostika-6-klass.html',encoding='utf8').read()
tasks=open('tools/urok/delimost-2.tasks.js',encoding='utf8').read()
def rep(a,b,cnt=1):
    global src
    assert src.count(a)>=1,('missing',a[:60])
    if cnt: assert src.count(a)==cnt,('count',a[:60],src.count(a))
    src=src.replace(a,b)
TITLE='ДЗ · Делимость чисел'
# tasks
i=src.index('const T = [');j=src.index('\n];',i)+3
src=src[:i]+tasks.replace('const T=[];','const T=[];',1)+src[j:]
rep('Диагностика · 6 класс',TITLE,0)
rep("branch:'диагностика 6 класс'","branch:'дз делимость'")
rep("const LEAD=!LINK.name||!!LINK.lead;","const LEAD=false;")
rep("https://lilimath.ru/diagnostika-6-klass.html","https://lilimath.ru/dz-delimost-chisel-2.html")
rep("diag6a-","dz-delim2-",0)
# start screen
rep("роверим, что ты <span>уже знаешь</span>","${''}ешаем <span>домашнюю работу</span>")
rep("${S.name?esc(S.name)+', п':'П'}${''}ешаем","${S.name?esc(S.name)+', р':'Р'}ешаем")
i=src.index('<p class="lead">Сегодня проверим');j=src.index('</p>',i)+4
src=src[:i]+'<p class="lead">Домашняя работа по теме «Делимость чисел»: делители и кратные, признаки делимости, простые числа, НОД и НОК. На каждое задание есть две попытки и две подсказки. Если задание не получается, жми «Не знаю, как решать»: разберём его на занятии. Результат придёт учителю сам, отправлять ничего не нужно.</p>'+src[j:]
rep('<span class="pill">около 70 минут</span>','')
rep("Вписываешь число или выбираешь вариант. Есть две попытки.","Вписываешь ответ и жмёшь «Проверить». Есть две попытки.")
# finish
rep("диагностика пройдена","домашняя работа выполнена")
rep("""      <div class="lvl">Общий итог <em>${LVW[sc.all]}</em></div>\n""","")
rep("""<div class="h" style="font-size:13px">${LVW[sc.lv[k]]||''}</div>""","")
rep("blk('b','Разминка (1–10)')","blk('b','Разминка')");rep("blk('m','Испытание (11–20)')","blk('m','Испытание')");rep("blk('h','Вызов (21–25)')","blk('h','Вызов')")
i=src.index('      <a class="btn tgbtn" id="tg"');j=src.index('      <button class="chip" id="again"',i)
src=src[:i]+src[j:]
i=src.index("  const cp=document.getElementById('cp'),ta=");j=src.index("  document.getElementById('again').onclick",i)
src=src[:i]+src[j:]
rep("const ring='25/25 · ДИАГНОСТИКА ПРОЙДЕНА · ';","const ring='25/25 · ДОМАШНЯЯ РАБОТА ВЫПОЛНЕНА · ';")
rep("за честно пройденную диагностику · 6 класс","за домашнюю работу · Делимость чисел")
rep("Новое в диагностике","Новое")
rep("/* не используется в текстах диагностики */","")
# answer parsing: whole numbers, any separator
i=src.index('function parseNums(s){');j=src.index('\n}',i)+2
src=src[:i]+"function parseNums(s){const p=String(s).replace(/[−–—]/g,'-').split(/[^0-9\\-]+/).filter(Boolean).map(Number);return p.length?p:[NaN]}"+src[j:]
rep("ok=t.ord?(nums.length","ok=t.chk?t.chk(nums):t.ord?(nums.length")
rep("""inputmode="${t.type==='set'?'text':'decimal'}\"""","""inputmode="text\"""")
rep("Запиши ответ цифрами. Дробную часть отделяй запятой.","Запиши ответ цифрами.")
rep('Разминка (1–10)','Разминка',0);rep('Испытание (11–20)','Испытание',0);rep('Вызов (21–25)','Вызов',0)
left=[m.start() for m in re.finditer('иагност',src)]
print('left diag:',[src[max(0,k-50):k+40].replace('\n',' ') for k in left])
open('dz-delimost-chisel-2.html','w',encoding='utf8').write(src)
print(len(src))
src=open('dz-delimost-chisel-2.html',encoding='utf8').read()
a="noms.push(['Почти 25/25',"
assert src.count(a)==1
src=src.replace(a,"noms.push([okN===sc.auto?'Всё верно':'Почти всё верно',")
open('dz-delimost-chisel-2.html','w',encoding='utf8').write(src)
import subprocess,sys
subprocess.run([sys.executable,'tools/urok/zveri_patch.py','dz-delimost-chisel-2.html'],check=True)
