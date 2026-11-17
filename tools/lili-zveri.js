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

  if (document.head) css();
  window.LiliZveri = {STK, PETS, PHOTOS, NEED, TITLE, FRAME, info, frame, best, xp, work, owned, sticker, tag, cardHTML, css,
    counts: () => Object.assign({}, load().stk), reload: () => { D = null; return load(); }};
})();
