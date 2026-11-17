/* Общий альбом стикеров и рост зверя для страниц в форме «25/25 со зверями».
   Хранится в браузере ученика (localStorage, один на весь сайт). Сетевых запросов нет.
   Подключение: <script src="tools/lili-zveri.js?v=1"></script> до основного скрипта страницы.
   Описание и правила: STATE.md, раздел про альбом. */
(() => {
  'use strict';
  const KEY = 'lili-zveri-v1';

  /* Звери: id страницы, имя, имя файлов в img/forest и img/mascots */
  const PETS = [
    {id:'cat', n:'Кот Сигма', f:'cat', m:'cat'},
    {id:'meer', n:'Сурик Тильт', f:'mer', m:'meer'},
    {id:'rac', n:'Енот Вайб', f:'rac', m:'rac'},
    {id:'capy', n:'Капи Дзен', f:'capy', m:'capy'},
    {id:'ham', n:'Хомяк Стресс', f:'ham', m:'ham'},
    {id:'bis', n:'Крыса Биссектриса', f:'bis', m:'bis'},
    {id:'otr', n:'Выдра Модуль', f:'otr', m:'otr'},
    {id:'axo', n:'Акси Рофлик', f:'axo', m:'axo'},
    {id:'qk', n:'Квокка Краш', f:'qk', m:'qk'}
  ];
  const P = id => PETS.find(p => p.id === id);

  /* Уровни: сколько опыта нужно всего, чтобы получить уровень */
  const NEED = [0, 100, 250, 500, 900, 1400, 2000, 2800, 3800, 5000];
  const TITLE = ['Малыш', 'Новичок', 'Ученик', 'Умник', 'Знаток', 'Профи', 'Мастер', 'Гуру', 'Магистр', 'Легенда'];
  const FRAME = ['#EEE0C8', '#EEE0C8', '#B6CBE3', '#B6CBE3', '#2F5BB5', '#2F5BB5', '#DD7A3A', '#DD7A3A', '#E2B04A', '#E2B04A'];
  const XP_FIRST = 10, XP_SECOND = 6, XP_WORK = 50;

  /* Фото зверя, которые открываются с уровнем. Нет файла — ячейка «скоро». */
  const PHOTOS = [
    {lv:2, n:'Думает', src:p => 'img/forest/' + p.f + '-think.jpg'},
    {lv:3, n:'Привет', src:p => 'img/mascots/' + p.m + '-hello.jpg'},
    {lv:5, n:'Болеет за тебя', src:p => 'img/mascots/' + p.m + '-cheer.jpg'},
    {lv:7, n:'Готово', src:p => 'img/mascots/' + p.m + '-done.jpg'},
    {lv:9, n:'Победа', src:p => 'img/mascots/' + p.m + '-win.jpg'},
    {lv:10, n:'Ждёт', src:p => 'img/mascots/' + p.m + '-wait.jpg'}
  ];

  /* Общий набор стикеров. id 1–24 совпадают со старыми страницами. r: c обычный, r редкий, e эпик, l легенда */
  const S = (id, t, r) => ({id, t, r});
  const STK = [
    S(1,'изи','c'),S(2,'база','c'),S(3,'x найден','c'),S(4,'π рядом','c'),S(5,'мозг прогрет','c'),S(6,'без паники','c'),
    S(13,'по фактам','c'),S(14,'чётко','c'),S(15,'считаю в уме','c'),S(16,'ещё одну','c'),
    S(101,'плюс вайб','c'),S(102,'раз и готово','c'),S(103,'мозг включён','c'),S(104,'ноль ошибок','c'),S(105,'лайк за ответ','c'),
    S(106,'решаю, не ною','c'),S(107,'так держать','c'),S(108,'устно!','c'),S(109,'как по маслу','c'),S(110,'считаю быстро','c'),
    S(111,'скобки раскрыты','c'),S(112,'знак не потерян','c'),S(113,'это мы умеем','c'),S(114,'не списываю','c'),S(115,'думаю головой','c'),
    S(116,'минус на минус','c'),S(117,'ответ сошёлся','c'),S(118,'режим: считаю','c'),S(119,'плюс один','c'),S(120,'зачёт','c'),
    S(7,'вайб: решаю','r'),S(8,'геометрия на изи','r'),S(9,'стальные нервы','r'),S(17,'пропорция сошлась','r'),S(18,'модуль снят','r'),
    S(19,'логика 100%','r'),S(20,'дробь не страшна','r'),
    S(201,'НОД найден','r'),S(202,'НОК в кармане','r'),S(203,'признак делимости','r'),S(204,'простое число','r'),S(205,'корень извлечён','r'),
    S(206,'уравнение сдалось','r'),S(207,'проценты под контролем','r'),S(208,'график прочитан','r'),S(209,'теорема в деле','r'),
    S(210,'угол пойман','r'),S(211,'степень прокачана','r'),S(212,'икс вычислен','r'),S(213,'дроби в порядке','r'),S(214,'формула в голове','r'),
    S(215,'без калькулятора','r'),S(216,'серия горит','r'),S(217,'подсказка не нужна','r'),S(218,'с первой попытки','r'),
    S(10,'имба','e'),S(11,'ОГЭ? легко','e'),S(21,'сигма-решатель','e'),S(22,'всё по формуле','e'),
    S(301,'мозг на максимум','e'),S(302,'режим гения','e'),S(303,'красивое решение','e'),S(304,'математика: моё','e'),S(305,'Пифагор гордится','e'),
    S(306,'сложное? беру','e'),S(307,'решаю как профи','e'),S(308,'чистая победа','e'),S(309,'Виет одобряет','e'),S(310,'ни одной ошибки','e'),
    S(311,'интеллект +100','e'),
    S(12,'главный по иксам','l'),S(23,'25 из 25','l'),S(24,'легенда класса','l'),
    S(401,'легенда lili.math','l'),S(402,'босс уравнений','l'),S(403,'абсолютная имба','l'),S(404,'математик года','l'),
    S(405,'мастер всех серий','l'),S(406,'сигма-уровень','l'),S(407,'решаю всё','l')
  ];

  /* ---------- хранение ---------- */
  let D = null;
  function load() {
    if (D) return D;
    try { D = JSON.parse(localStorage.getItem(KEY)); } catch (e) { D = null; }
    if (!D || typeof D !== 'object') D = {};
    D.v = 1; D.stk = D.stk || {}; D.xp = D.xp || {}; D.w = D.w || {}; D.done = D.done || {};
    return D;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) {} }

  /* ---------- уровни ---------- */
  function lvlOf(xp) { let l = 1; for (let i = 1; i < NEED.length; i++) if (xp >= NEED[i]) l = i + 1; return l; }
  function info(id) {
    const xp = load().xp[id] || 0, lvl = lvlOf(xp), max = lvl >= NEED.length;
    const from = NEED[lvl - 1], to = max ? from : NEED[lvl];
    return {id, xp, lvl, title: TITLE[lvl - 1], max, left: max ? 0 : to - xp, pct: max ? 100 : Math.round((xp - from) / (to - from) * 100)};
  }
  const frame = id => { const i = info(id); return 'border-color:' + FRAME[i.lvl - 1] + (i.lvl >= 9 ? ';box-shadow:0 0 0 2px rgba(226,176,74,.35),0 10px 22px -10px rgba(0,0,0,.6)' : ''); };
  const best = () => { const d = load(); let b = null; for (const p of PETS) if ((d.xp[p.id] || 0) > 0 && (!b || d.xp[p.id] > d.xp[b])) b = p.id; return b; };

  /* ---------- опыт ---------- */
  /* work — ключ работы; uniq — номер задания. Одно задание даёт опыт один раз, законченная работа больше не даёт ничего. */
  function gain(id, n, work) {
    const d = load(); if (!P(id) || !(n > 0)) return null;
    const before = lvlOf(d.xp[id] || 0); d.xp[id] = (d.xp[id] || 0) + n; d.last = id; save();
    const after = lvlOf(d.xp[id]); refresh(id);
    if (after > before) toastLevel(id, after);
    return {lvl: after, up: after > before};
  }
  function xp(id, tries, work, uniq) {
    const d = load(); if (!work || d.done[work]) return null;
    const list = d.w[work] = d.w[work] || []; if (list.includes(uniq)) return null;
    list.push(uniq);
    return gain(id, tries === 1 ? XP_FIRST : XP_SECOND, work);
  }
  function work(id, key) {
    const d = load(); if (!key || d.done[key]) return null;
    const r = gain(id, XP_WORK, key); d.done[key] = 1; delete d.w[key]; save(); return r;
  }

  /* ---------- стикеры ---------- */
  const owned = () => Object.keys(load().stk).map(Number);
  function sticker(s, workKey) {
    const d = load(); if (!s || s.id == null) return null; if (workKey && d.done[workKey]) return null;
    const isNew = !d.stk[s.id]; d.stk[s.id] = (d.stk[s.id] || 0) + 1; save(); return {isNew, count: d.stk[s.id]};
  }

  /* ---------- вид ---------- */
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  let cssDone = false;
  function css() {
    if (cssDone) return; cssDone = true;
    const st = document.createElement('style');
    st.textContent = `.lz-toast{position:fixed;left:50%;top:18px;transform:translate(-50%,-140%);z-index:9999;display:flex;gap:14px;align-items:center;padding:12px 18px 12px 12px;border-radius:22px;background:#EEE0C8;color:#16231A;box-shadow:0 18px 40px -12px rgba(0,0,0,.7);font:600 15px/1.25 -apple-system,BlinkMacSystemFont,Inter,system-ui,sans-serif;width:max-content;min-width:min(92vw,330px);max-width:min(94vw,440px);transition:transform .5s cubic-bezier(.3,1.5,.5,1)}
.lz-toast.in{transform:translate(-50%,0)}
.lz-toast img{width:64px;height:64px;border-radius:50%;object-fit:cover;border:3px solid #E2B04A;flex:none}
.lz-toast b{display:block;font-size:17px;color:#2F5BB5}
.lz-toast small{display:block;font-weight:500;font-size:13px;opacity:.8;margin-top:2px}
.lz-card{display:flex;gap:14px;align-items:center;margin:18px 0 0;padding:14px 16px;border-radius:20px;background:rgba(238,224,200,.08);border:1px solid rgba(238,224,200,.22);text-align:left}
.lz-card img{width:72px;height:72px;border-radius:50%;object-fit:cover;border:3px solid #EEE0C8;flex:none}
.lz-card .lz-in{flex:1;min-width:0;display:grid;gap:5px}
.lz-card b{font-size:16px}
.lz-card small{opacity:.75;font-size:13px}
.lz-bar{height:8px;border-radius:99px;background:rgba(238,224,200,.16);overflow:hidden}
.lz-bar i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#E2B04A,#DD7A3A)}
.lz-card a{flex:none;padding:10px 14px;border-radius:99px;background:#2F5BB5;color:#EEE0C8;text-decoration:none;font-weight:600;font-size:14px;white-space:nowrap}
.lz-lv{display:block;font-size:11px;font-weight:700;letter-spacing:.04em;color:#E2B04A}
.lzg-cards{display:flex;gap:12px;justify-content:center}
.lzg-card{width:min(96px,26vw);aspect-ratio:3/4;border-radius:16px;border:3px solid #EEE0C8;background:linear-gradient(135deg,#2F5BB5,#16231A);color:#EEE0C8;font:700 15px/1.1 inherit;display:grid;place-items:center;cursor:pointer;transition:transform .35s,opacity .35s;padding:4px}
.lzg-card span{font-size:34px}
.lzg-card.open{color:#16231A;opacity:.45;transform:scale(.92)}
.lzg-card.open span{font-size:13px;text-transform:uppercase;letter-spacing:.04em}
.lzg-card.open.pick{opacity:1;transform:scale(1.08)}
.lzg-card.c{background:linear-gradient(135deg,#EEE0C8,#DD7A3A)}.lzg-card.r{background:linear-gradient(135deg,#B6CBE3,#C9AB82)}.lzg-card.e{background:#B6CBE3}.lzg-card.l{background:conic-gradient(from 40deg,#E2B04A,#DD7A3A,#EEE0C8,#B6CBE3,#C9AB82,#E2B04A)}
.lzg-holes{display:grid;grid-template-columns:repeat(3,min(88px,24vw));gap:12px;justify-content:center}
.lzg-hole{aspect-ratio:1;border-radius:50%;border:3px solid rgba(238,224,200,.3);background:rgba(0,0,0,.4);padding:0;overflow:hidden;cursor:pointer;touch-action:manipulation}
.lzg-hole img{width:100%;height:100%;object-fit:cover;display:block;animation:lzg-up .18s ease-out}
@keyframes lzg-up{from{transform:translateY(60%)}to{transform:none}}
.lzg-cnt{font-weight:700;font-size:18px;color:#E2B04A;margin-top:10px}
.lzg-pop{display:grid;grid-template-columns:repeat(4,min(64px,18vw));gap:16px 12px;justify-content:center;padding:6px 0 14px}
.lzg-bal{aspect-ratio:5/6;border-radius:50% 50% 50% 50%/45% 45% 55% 55%;border:0;background:radial-gradient(circle at 32% 28%,rgba(255,255,255,.55),transparent 30%),var(--c);cursor:pointer;animation:lzg-fl 1.6s ease-in-out var(--d) infinite alternate;transition:transform .2s,opacity .2s;touch-action:manipulation;box-shadow:0 10px 18px -10px rgba(0,0,0,.7)}
.lzg-bal.out{transform:scale(1.5);opacity:0;pointer-events:none;animation:none}
@keyframes lzg-fl{from{translate:0 0}to{translate:0 -8px}}
.lzg-stop{display:grid;gap:22px;justify-items:center;width:100%}
.lzg-bar{position:relative;width:min(340px,76vw);height:38px;border-radius:99px;background:#DD7A3A;overflow:visible;border:3px solid #EEE0C8}
.lzg-bar i{position:absolute;top:0;bottom:0}
.lzg-bar i.r{left:25%;width:50%;background:#C9AB82}.lzg-bar i.e{left:40%;width:20%;background:#B6CBE3}.lzg-bar i.l{left:47%;width:6%;background:#E2B04A}
.lzg-mk{position:absolute;top:-9px;bottom:-9px;width:6px;margin-left:-3px;border-radius:4px;background:#16231A;box-shadow:0 0 0 2px #EEE0C8}
.lzg-pairs{display:grid;grid-template-columns:repeat(3,min(86px,24vw));gap:10px;justify-content:center}
.lzg-pc{aspect-ratio:1;border-radius:16px;border:3px solid #EEE0C8;background:linear-gradient(135deg,#2F5BB5,#16231A);padding:0;overflow:hidden;cursor:pointer;touch-action:manipulation}
.lzg-pc img{width:100%;height:100%;object-fit:cover;display:block;opacity:0;transition:opacity .15s}
.lzg-pc.on img{opacity:1}.lzg-pc.ok{border-color:#E2B04A}
.lzg-dig{display:grid;grid-template-columns:repeat(3,min(76px,22vw));gap:8px;justify-content:center}
.lzg-tile{aspect-ratio:1;border-radius:14px;border:0;background:linear-gradient(135deg,#C9AB82,#8a6f4d);cursor:pointer;transition:transform .2s,background .2s;touch-action:manipulation}
.lzg-tile.out{background:rgba(0,0,0,.35);transform:scale(.9)}.lzg-tile.hit{background:#E2B04A;transform:scale(1.05)}
@media (prefers-reduced-motion:reduce){.lzg-bal,.lzg-hole img{animation:none}}
@media (max-width:560px){.lz-pill{display:none!important}}
@media (max-width:480px){.lz-card{flex-wrap:wrap}.lz-card a{flex:1 1 100%;text-align:center}}`;
    document.head.appendChild(st);
  }
  function toastLevel(id, lvl) {
    try {
      css(); const p = P(id), ph = PHOTOS.find(x => x.lv === lvl);
      const el = document.createElement('div'); el.className = 'lz-toast';
      el.innerHTML = `<img src="img/forest/${p.f}-joy.jpg" alt=""><div><b>${esc(p.n)}: уровень ${lvl}</b>Новое звание: ${TITLE[lvl - 1]}${ph ? '<small>В альбоме открылось новое фото</small>' : ''}</div>`;
      document.body.appendChild(el); requestAnimationFrame(() => el.classList.add('in'));
      setTimeout(() => el.classList.remove('in'), 3800); setTimeout(() => el.remove(), 4500);
    } catch (e) {}
  }
  function refresh(id) {
    try {
      const i = info(id);
      document.querySelectorAll('[data-lz-lvl="' + id + '"]').forEach(x => { x.textContent = i.lvl; });
    } catch (e) {}
  }
  /* подпись уровня под зверем на экране выбора */
  function tag(id) { const i = info(id); return i.xp > 0 ? `<small class="lz-lv">ур. ${i.lvl} · ${i.title}</small>` : ''; }
  /* карточка зверя для итогового экрана */
  function cardHTML(id) {
    const p = P(id); if (!p) return ''; css(); const i = info(id);
    return `<div class="lz-card"><img src="img/forest/${p.f}-joy.jpg" alt="" style="border-color:${FRAME[i.lvl - 1]}"><div class="lz-in"><b>${esc(p.n)} · уровень ${i.lvl}</b><small>${i.title}${i.max ? ' · максимальный уровень' : ' · до уровня ' + (i.lvl + 1) + ' осталось ' + i.left + ' опыта'}</small><div class="lz-bar"><i style="width:${i.pct}%"></i></div></div><a href="albom.html" target="_blank" rel="noopener">Мой альбом</a></div>`;
  }


  /* ---------- мини-игры для чекпоинтов ----------
     run(g, done, a): g — контейнер, done(стикер) — вызвать в конце,
     a = {grant(редкость), roll() -> редкость, stkHTML, sfx, RAR, tal} со страницы. */
  const imgOf = (id, m) => 'img/forest/' + (P(id) || PETS[0]).f + '-' + m + '.jpg';
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const GAME = {};
  GAME.cards = {h: ['Выбери карту', 'Под каждой картой стикер своей редкости. Какая попадётся?'], run(g, done, a) {
    const rs = [a.roll(), a.roll(), a.roll()]; let fin = false;
    g.innerHTML = `<div class="lzg-cards">${rs.map((r, i) => `<button class="lzg-card" data-i="${i}"><span>?</span></button>`).join('')}</div>`;
    const cs = [...g.querySelectorAll('.lzg-card')];
    cs.forEach((b, i) => b.onclick = () => { if (fin) return; fin = true; a.sfx.tap();
      cs.forEach((x, j) => { x.classList.add('open', rs[j]); if (j === i) x.classList.add('pick'); x.querySelector('span').textContent = a.RAR[rs[j]]; });
      setTimeout(() => done(a.grant(rs[i])), 900); });
  }};
  GAME.catch = {h: ['Поймай зверя', 'Зверь выглядывает из норки. Успей нажать на него 5 раз.'], run(g, done, a) {
    g.innerHTML = `<div class="lzg-holes">${'<button class="lzg-hole"></button>'.repeat(6)}</div><div class="lzg-cnt">0 из 5</div>`;
    const hs = [...g.querySelectorAll('.lzg-hole')], cnt = g.querySelector('.lzg-cnt'); let n = 0, cur = -1, fin = false, tm;
    const show = () => { if (fin || !g.isConnected) return; hs.forEach(h => { h.innerHTML = ''; }); let i; do { i = Math.floor(Math.random() * 6); } while (i === cur);
      cur = i; hs[i].innerHTML = `<img src="${imgOf(a.tal, 'idle')}" alt="" draggable="false">`; tm = setTimeout(show, 1000); };
    hs.forEach((h, i) => h.onpointerdown = e => { e.preventDefault(); if (fin || i !== cur) return; clearTimeout(tm); n++; cur = -2; a.sfx.pump(n * 18);
      cnt.textContent = n + ' из 5'; h.innerHTML = `<img src="${imgOf(a.tal, 'joy')}" alt="" draggable="false">`;
      if (n >= 5) { fin = true; setTimeout(() => done(a.grant(a.roll())), 350); } else tm = setTimeout(show, 320); });
    show();
  }};
  GAME.pop = {h: ['Лопни шарики', 'Лопни все шарики. Стикер в последнем.'], run(g, done, a) {
    const cols = ['#DD7A3A', '#2F5BB5', '#E2B04A', '#B6CBE3', '#C9AB82', '#DD7A3A', '#2F5BB5', '#E2B04A']; let left = cols.length;
    g.innerHTML = `<div class="lzg-pop">${cols.map((c, i) => `<button class="lzg-bal" style="--c:${c};--d:${((i * 0.37) % 1.5).toFixed(2)}s" aria-label="шарик"></button>`).join('')}</div>`;
    g.querySelectorAll('.lzg-bal').forEach(b => b.onpointerdown = e => { e.preventDefault(); if (b.classList.contains('out')) return; b.classList.add('out'); a.sfx.pump(100 - left * 10);
      if (--left === 0) setTimeout(() => done(a.grant(a.roll())), 300); });
  }};
  GAME.stop = {h: ['Останови стрелку', 'Чем ближе к середине, тем реже стикер. В самом центре легенда.'], run(g, done, a) {
    g.innerHTML = `<div class="lzg-stop"><div class="lzg-bar"><i class="r"></i><i class="e"></i><i class="l"></i><b class="lzg-mk"></b></div><button class="btn" id="lzst">Стоп</button></div>`;
    const mk = g.querySelector('.lzg-mk'), b = g.querySelector('#lzst'), t0 = performance.now(), per = 1100 + Math.random() * 300; let fin = false, x = 0;
    const step = now => { if (fin || !g.isConnected) return; const ph = ((now - t0) % per) / per; x = ph < .5 ? ph * 2 : 2 - ph * 2; mk.style.left = (x * 100) + '%'; requestAnimationFrame(step); };
    requestAnimationFrame(step);
    b.onclick = () => { if (fin) return; fin = true; b.disabled = true; const d = Math.abs(x - .5), r = d <= .03 ? 'l' : d <= .10 ? 'e' : d <= .25 ? 'r' : 'c';
      a.sfx.tap(); setTimeout(() => done(a.grant(r)), 500); };
  }};
  GAME.pairs = {h: ['Найди пары', 'Открывай по две карточки и найди трёх одинаковых зверей.'], run(g, done, a) {
    const ps = shuffle(PETS.slice()).slice(0, 3), deck = shuffle([...ps, ...ps]); let open = [], lock = false, found = 0;
    g.innerHTML = `<div class="lzg-pairs">${deck.map(p => `<button class="lzg-pc"><img src="img/forest/${p.f}-idle.jpg" alt="" draggable="false"></button>`).join('')}</div>`;
    const cs = [...g.querySelectorAll('.lzg-pc')];
    cs.forEach((c, i) => c.onclick = () => { if (lock || c.classList.contains('on')) return; c.classList.add('on'); a.sfx.tap(); open.push(i);
      if (open.length < 2) return; const [x, y] = open; open = [];
      if (deck[x] === deck[y]) { found++; a.sfx.pump(found * 30); cs[x].classList.add('ok'); cs[y].classList.add('ok'); if (found === 3) setTimeout(() => done(a.grant(a.roll())), 450); }
      else { lock = true; setTimeout(() => { cs[x].classList.remove('on'); cs[y].classList.remove('on'); lock = false; }, 700); } });
  }};
  GAME.dig = {h: ['Раскопки', 'Под одной из плиток спрятан стикер. Копай, пока не найдёшь.'], run(g, done, a) {
    const at = Math.floor(Math.random() * 9); let fin = false;
    g.innerHTML = `<div class="lzg-dig">${'<button class="lzg-tile" aria-label="плитка"></button>'.repeat(9)}</div>`;
    g.querySelectorAll('.lzg-tile').forEach((b, i) => b.onclick = () => { if (fin || b.classList.contains('out')) return; b.classList.add('out');
      if (i === at) { fin = true; b.classList.add('hit'); a.sfx.pump(90); setTimeout(() => done(a.grant(a.roll())), 350); } else a.sfx.tick(); });
  }};
  /* случайная игра из старых (со страницы) и новых, без повтора предыдущей */
  let lastGame = '';
  function pickGame(old) {
    if (window.__lzGame) return window.__lzGame;
    try { lastGame = sessionStorage.getItem('lz-last-game') || lastGame; } catch (e) {}
    const all = [...(old || []), ...Object.keys(GAME)].filter(x => x !== lastGame);
    lastGame = all[Math.floor(Math.random() * all.length)];
    try { sessionStorage.setItem('lz-last-game', lastGame); } catch (e) {}
    return lastGame;
  }

  if (document.head) css();
  window.LiliZveri = {GAME, pickGame, STK, PETS, PHOTOS, NEED, TITLE, FRAME, info, frame, best, xp, work, owned, sticker, tag, cardHTML, css,
    counts: () => Object.assign({}, load().stk), reload: () => { D = null; return load(); }};
})();
