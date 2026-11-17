"""Подключает общий альбом и рост зверя (tools/lili-zveri.js) к странице в форме диагностики.
Запуск: python3 tools/urok/zveri_patch.py файл.html [файл2.html ...] из корня репозитория. Повторный запуск безопасен."""
import sys
def patch(src):
    if 'tools/lili-zveri.js' in src: return src
    def rep(a,b,cnt=1):
        nonlocal src
        assert src.count(a)==cnt,(a[:70],src.count(a))
        src=src.replace(a,b)
    Z="window.LiliZveri"
    rep('<script src="tools/study-resume.js?v=1"></script>','<script src="tools/study-resume.js?v=1"></script><script src="tools/lili-zveri.js?v=1"></script>')
    rep("];\nconst RAR={","];\nif("+Z+")STK.splice(0,STK.length,...LiliZveri.STK);\nconst RAR={")
    rep("function grant(rar){const own=new Set(S.stk);","function grant(rar){const own=new Set([...S.stk,...("+Z+"?LiliZveri.owned():[])]);")
    rep("const s=pool.length?pick(pool):pick(STK);if(!own.has(s.id))S.stk.push(s.id);return s","const s=pool.length?pick(pool):pick(STK);if(!S.stk.includes(s.id))S.stk.push(s.id);"+Z+"?.sticker(s,KEY);return s")
    rep("resolve(t,r,'ok');celebrate();","resolve(t,r,'ok');"+Z+"?.xp(S.tal,r.tries,KEY,t.n);celebrate();",2)
    rep("S.done=true;S.i=L.length;save();clearInterval(tick);","S.done=true;S.i=L.length;save();clearInterval(tick);"+Z+"?.work(S.tal,KEY);")
    rep('<small class="ttag">${t.tag}</small>','<small class="ttag">${t.tag}</small>${'+Z+'?LiliZveri.tag(t.id):\'\'}',2)
    rep("function petSVG(id,mood='idle')","const LZF=id=>"+Z+"?LiliZveri.frame(id):'';\nfunction petSVG(id,mood='idle')")
    rep('background:${t.bg}" title="${t.n}">${petSVG(id,mood)}','background:${t.bg};${LZF(id)}" title="${t.n}">${petSVG(id,mood)}')
    rep('style="background:${t.bg}" title="${t.n}">${petSVG(t.id,\'idle\')}','style="background:${t.bg};${LZF(t.id)}" title="${t.n}">${petSVG(t.id,\'idle\')}')
    rep('серия <strong id="stk">${S.streak}</strong></span>','серия <strong id="stk">${S.streak}</strong></span>\n    ${t&&'+Z+'?`<span class="pill lz-pill" title="Уровень зверя">ур. <strong data-lz-lvl="${t.id}">${LiliZveri.info(t.id).lvl}</strong></span>`:\'\'}')
    rep('<span class="pill">стикеры за каждые 4 задания и за серии</span>','<span class="pill">стикеры за каждые 4 задания и за серии</span><a class="pill" href="albom.html" target="_blank" rel="noopener" style="text-decoration:none;color:inherit;border-color:#E2B04A">мой альбом</a>')
    rep('${diploma(sc,cnt.ok,own,t)}','${t&&'+Z+'?LiliZveri.cardHTML(t.id):\'\'}\n    ${diploma(sc,cnt.ok,own,t)}')
    rep("const DROPS={3:null,5:'r',7:'e',10:'l',13:'e',16:'l'};","const DROPS={3:null,5:null,7:'r',10:'e',13:'r',16:'e',20:'l'};")
    return src
if __name__=='__main__':
    for f in sys.argv[1:]:
        s=open(f,encoding='utf8').read();n=patch(s)
        open(f,'w',encoding='utf8').write(n);print(f,'ok' if n!=s else 'уже подключено')
