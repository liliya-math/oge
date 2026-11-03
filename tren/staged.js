/* lili.math · общий движок ступенчатых тренажёров («с нуля»): ступени по порядку, серия верных подряд,
   разбор ошибки и похожее задание, отчёт в таблицу, режим учителя #lilia.
   Страница задаёт window.TRAINER = { title, shortTitle, key, sheetUrl, tagMsg, api:{STEPS,...} } и подключает этот файл.
   Виды ответа в rows: int, num (можно десятичную запятую), ratio (a : b), frac, mixed. */
(function () {
'use strict';
var CFG = window.TRAINER, C = CFG.api, STEPS = C.STEPS;
var SHEET_URL = CFG.sheetUrl || '', TITLE = CFG.title, KEY = CFG.key;
var NEED_DEFAULT = CFG.needDefault || 7, NEED_EARLY = CFG.needEarly || 5, EARLY_UPTO = CFG.earlyUpto === undefined ? 3 : CFG.earlyUpto;
document.title = CFG.shortTitle || CFG.title;
var app = document.getElementById('app');

/* ---------- состояние ---------- */
function fresh() { return { name: '', steps: {}, log: [], openAll: false }; }
var S = (function () { try { return JSON.parse(localStorage.getItem(KEY)) || fresh(); } catch (e) { return fresh(); } })();
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
function need(id) { return id <= EARLY_UPTO ? NEED_EARLY : NEED_DEFAULT; }
function st(id) {
  if (!S.steps[id]) S.steps[id] = { passed: false, streak: 0, tried: 0, ok: 0, bad: 0, hints: 0, stuck: false, reteach: 0, cw: 0, tags: {} };
  return S.steps[id];
}
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function isTeacher() { return location.hash === '#lilia'; }
function isOpen(i) { return S.openAll || isTeacher() || i === 0 || st(STEPS[i - 1].id).passed || st(STEPS[i].id).passed; }

function send(ev) {
  ev.name = S.name; ev.ts = new Date().toISOString();
  S.log.push(ev); if (S.log.length > 300) S.log.shift();
  save();
}
function stepReport() {
  return STEPS.map(function (s) {
    var o = st(s.id);
    var status = o.passed ? 'пройдена' : o.stuck ? 'нужна помощь' : o.tried ? 'идёт ' + o.streak + '/' + need(s.id) : '—';
    var tags = Object.keys(o.tags).filter(function (t) { return t !== 'dont-know'; }).sort(function (x, y) { return o.tags[y] - o.tags[x]; }).slice(0, 3).map(function (t) { return t + ' x' + o.tags[t]; }).join(', ');
    return s.id + '. ' + s.title + ': ' + status + '; верно ' + o.ok + ', неверно ' + o.bad + ', подсказок ' + o.hints + ', не знаю ' + (o.tags['dont-know'] || 0) + ', повторов объяснения ' + (o.reteach || 0) + (tags ? '; ошибки: ' + tags : '');
  }).join('\n');
}
function push() {
  if (!SHEET_URL || isTeacher() || !S.name) return;
  try {
    if (!S.sid) { S.sid = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4); S.started = Date.now(); save(); }
    var asked = 0, ok = 0, hints = 0, passed = 0;
    STEPS.forEach(function (s) { var o = st(s.id); asked += o.tried; ok += o.ok; hints += o.hints; if (o.passed) passed++; });
    if (!asked && !passed) return;
    var d = { sid: S.sid, test: TITLE, name: S.name, kind: 'тренажёр', started: S.started,
      status: passed === STEPS.length ? 'завершено' : 'в процессе', progress: passed + '/' + STEPS.length, score: ok, max: asked, grade: '',
      minutes: Math.round((Date.now() - S.started) / 60000), bonus: 'подсказок ' + hints,
      tasks: STEPS.map(function (s) { var o = st(s.id); return s.id + (o.passed ? '+' : o.stuck ? '!' : o.tried ? '~' : '-'); }).join(' '), report: stepReport() };
    var bd = JSON.stringify(d);
    fetch(SHEET_URL, { method: 'POST', mode: 'no-cors', keepalive: bd.length < 60000, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: bd }).catch(function () {});
  } catch (e) {}
}
window.addEventListener('pagehide', push);


/* ---------- школьная доска: рукописный мел, чертежи, следы тряпки ---------- */
// Рисуется заново для каждого экрана и только в свободных местах: под текст, карточки и кнопки ничего не попадает.
// CFG.board = надписи темы. Дробь {числитель|знаменатель}, корень R[выражение] (рисуется одним знаком).
var BOARD_TEXTS = ['a² + b² = c²', 'E = mc²', '36 × 42 = 1512', '{1|2} + {2|2} = {3|2}', 'S = {1|2} a · h', '{6|10} + {5|12}', 'D = b² − 4ac', '(a + b)² = a² + 2ab + b²', 'P = 2(a + b)', 'v = {s|t}', '25% = {1|4}', 'sin² A + cos² A = 1', '7 · 8 = 56', 'y = kx + b', 'S = {a b|2}', 'tg A = {a|b}', 'R[a² + b²] = c', 'R[144] = 12', 'x + 5 = 12', '3(x − 2) = 15', 'V = a³'];
var CHALK = '#efe8d8', boardKey = 'start', boardTimer = 0;
var boardEl = document.createElement('div');
boardEl.className = 'board'; boardEl.setAttribute('aria-hidden', 'true');
document.body.insertBefore(boardEl, document.body.firstChild);

function rng(str) {
  var h = 1779033703 ^ str.length, i;
  for (i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; }
  var a = h >>> 0;
  return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function r1(x) { return Math.round(x * 10) / 10; }
function pt(x, y) { return r1(x) + ' ' + r1(y); }
function seg(a, b) { return 'M' + pt(a[0], a[1]) + 'L' + pt(b[0], b[1]); }
function mid(a, b) { return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; }
function outward(v, c, d) { var dx = v[0] - c[0], dy = v[1] - c[1], l = Math.hypot(dx, dy) || 1; return [v[0] + dx / l * d, v[1] + dy / l * d]; }
function dseg(p, a, b) {
  var dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2));
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}
function tx(x, y, s, fs, anchor) { return '<text x="' + r1(x) + '" y="' + r1(y) + '" font-size="' + fs + '" text-anchor="' + (anchor || 'start') + '" fill="' + CHALK + '" stroke="none">' + String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</text>'; }
function lb(s, p, fs) { return tx(p[0], p[1] + fs * 0.28, s, fs, 'middle'); }

function makeBoard(W, H, forb, rnd, mt) {
  function tw(s, fs) { mt.setAttribute('font-size', fs); mt.textContent = s; return mt.getComputedTextLength(); }
  function pickN(a) { return a[Math.floor(rnd() * a.length)]; }
  function shuf(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function wrapStroke(g, fs) { return '<g fill="none" stroke="' + CHALK + '" stroke-width="' + r1(Math.max(2.4, fs * 0.075)) + '" stroke-linecap="round" stroke-linejoin="round">' + g + '</g>'; }

  function formula(str, fs) {
    var parts = String(str).split(/(R\[[^\]]*\]|\{[^}]+\})/), cx = 0, g = '';
    parts.forEach(function (p) {
      if (!p) return;
      var m;
      if ((m = /^\{([^|]+)\|([^}]+)\}$/.exec(p))) {
        var w = Math.max(tw(m[1], fs), tw(m[2], fs)) + fs * 0.3;
        g += tx(cx + w / 2, -fs * 0.40, m[1], fs, 'middle') + '<path d="M' + pt(cx + 2, -fs * 0.28) + 'H' + r1(cx + w - 2) + '"/>' + tx(cx + w / 2, fs * 0.36, m[2], fs, 'middle');
        cx += w + fs * 0.12;
      } else if ((m = /^R\[([^\]]*)\]$/.exec(p))) {
        var c = tw(m[1], fs), t = fs;
        g += '<path d="M' + pt(cx, -.32 * t) + 'L' + pt(cx + .12 * t, -.38 * t) + 'L' + pt(cx + .30 * t, .12 * t) + 'L' + pt(cx + .46 * t, -.86 * t) + 'H' + r1(cx + .58 * t + c) + '"/>' + tx(cx + .54 * t, 0, m[1], fs, 'start');
        cx += .64 * t + c + fs * .08;
      } else { g += tx(cx, 0, p, fs, 'start'); cx += tw(p, fs); }
    });
    return { w: Math.ceil(cx) + 6, h: Math.ceil(fs * 1.55), g: '<g transform="translate(3 ' + r1(fs * 1.02) + ')">' + wrapStroke(g, fs) + '</g>' };
  }
  function rightTri(k) {
    var M = 36, w = Math.round(150 * k), h = Math.round(112 * k), fs = 26;
    var A = [M, M], C = [M, M + h], B = [M + w, M + h], cen = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3];
    var dx = B[0] - A[0], dy = B[1] - A[1], t = ((C[0] - A[0]) * dx + (C[1] - A[1]) * dy) / (dx * dx + dy * dy), Hh = [A[0] + dx * t, A[1] + dy * t];
    var g = '<path d="' + seg(A, B) + seg(B, C) + seg(C, A) + seg(C, Hh) + 'M' + pt(C[0], C[1] - 12) + 'L' + pt(C[0] + 12, C[1] - 12) + 'L' + pt(C[0] + 12, C[1]) + '"/>';
    var lab = lb('A', outward(A, cen, 25), fs) + lb('B', outward(B, cen, 27), fs) + lb('C', outward(C, cen, 25), fs) + lb('b', outward(mid(A, C), cen, 23), fs) + lb('a', outward(mid(C, B), cen, 24), fs) + lb('c', outward(mid(A, B), cen, 25), fs);
    var m = mid(C, Hh), nx = -(Hh[1] - C[1]), ny = Hh[0] - C[0], nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
    var c1 = [m[0] + nx * 17, m[1] + ny * 17], c2 = [m[0] - nx * 17, m[1] - ny * 17], S = [[A, B], [B, C], [C, A], [C, Hh]];
    function md(p) { return Math.min.apply(null, S.map(function (s) { return dseg(p, s[0], s[1]); })); }
    var best = md(c1) >= md(c2) ? c1 : c2;
    if (md(best) >= 12) lab += lb('h', best, fs);
    return { w: w + 2 * M, h: h + 2 * M, g: wrapStroke(g, 26) + lab };
  }
  function isoTri(k) {
    var M = 36, w = Math.round(150 * k), h = Math.round(128 * k), fs = 26;
    var B = [M + w / 2, M], A = [M, M + h], C = [M + w, M + h], D = [M + w / 2, M + h], cen = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3];
    var g = '<path d="' + seg(A, B) + seg(B, C) + seg(A, C) + seg(B, D) + 'M' + pt(D[0] - 11, D[1]) + 'L' + pt(D[0] - 11, D[1] - 11) + 'L' + pt(D[0], D[1] - 11) + '"/>';
    var lab = lb('B', outward(B, cen, 25), fs) + lb('A', outward(A, cen, 27), fs) + lb('C', outward(C, cen, 27), fs) + lb('c', outward(mid(A, B), cen, 24), fs) + lb('a', outward(mid(B, C), cen, 24), fs) + lb('b', [D[0], D[1] + 27], fs) + lb('h', [D[0] + 19, M + h * 0.45], fs);
    return { w: w + 2 * M, h: h + 2 * M + 4, g: wrapStroke(g, 26) + lab };
  }
  function venn(k) {
    var r = 46 * k, M = 16, cs = [[M + r, M + r], [M + r + .95 * r, M + r], [M + r + .475 * r, M + r + .82 * r]], cen = [(cs[0][0] + cs[1][0] + cs[2][0]) / 3, (cs[0][1] + cs[1][1] + cs[2][1]) / 3], fs = 26, g = '', lab = '';
    cs.forEach(function (c) { g += '<circle cx="' + r1(c[0]) + '" cy="' + r1(c[1]) + '" r="' + r1(r) + '"/>'; });
    cs.forEach(function (c, i) {
      var dx = c[0] - cen[0], dy = c[1] - cen[1], l = Math.hypot(dx, dy) || 1, t, p, ok;
      for (t = .85; t >= .3; t -= .05) {
        p = [c[0] + dx / l * t * r, c[1] + dy / l * t * r];
        ok = Math.hypot(p[0] - c[0], p[1] - c[1]) < r - 15 && cs.every(function (o, j) { return j === i || Math.hypot(p[0] - o[0], p[1] - o[1]) > r + 15; });
        if (ok) { lab += lb('ABC'.charAt(i), p, fs); break; }
      }
    });
    return { w: Math.ceil(cs[1][0] + r + M), h: Math.ceil(cs[2][1] + r + M), g: wrapStroke(g, 26) + lab };
  }
  function graph(k) {
    var M = 34, w = Math.round(150 * k), h = Math.round(108 * k), fs = 24, O = [M, M + h], X = [M + w, M + h], Y = [M, M - 4], g, lab = '', i;
    g = '<path d="' + seg(O, X) + seg(O, Y) + 'M' + pt(X[0] - 10, X[1] - 5) + 'L' + pt(X[0], X[1]) + 'L' + pt(X[0] - 10, X[1] + 5) + 'M' + pt(Y[0] - 5, Y[1] + 10) + 'L' + pt(Y[0], Y[1]) + 'L' + pt(Y[0] + 5, Y[1] + 10);
    for (i = 1; i <= 3; i++) {
      var tx0 = M + w * (0.2 + 0.25 * i), ty0 = M + h - h * (0.2 + 0.24 * i);
      g += 'M' + pt(tx0, O[1] - 5) + 'L' + pt(tx0, O[1] + 5) + 'M' + pt(O[0] - 5, ty0) + 'L' + pt(O[0] + 5, ty0);
      lab += lb(String(i), [tx0, O[1] + 24], fs) + lb(String(i), [O[0] - 19, ty0], fs);
    }
    var n = 8, d = 'M';
    for (i = 0; i <= n; i++) { var px = M + 10 + (w - 28) * i / n, py = M + h - 12 - (h - 34) * (i / n) * (0.55 + 0.35 * rnd()) - (i % 2 ? 7 + rnd() * 8 : 0); d += (i ? 'L' : '') + pt(px, py); }
    return { w: w + M + 16, h: h + M + 36, g: wrapStroke(g + '"/><path d="' + d + '"/>', 24) + lab };
  }
  function circ(k) {
    var r = 50 * k, M = 30, O = [M + r, M + r], a = -0.62, P = [O[0] + r * Math.cos(a), O[1] + r * Math.sin(a)], fs = 26;
    var g = '<circle cx="' + r1(O[0]) + '" cy="' + r1(O[1]) + '" r="' + r1(r) + '"/><path d="' + seg(O, P) + '"/><circle cx="' + r1(O[0]) + '" cy="' + r1(O[1]) + '" r="1.6"/>';
    var m = mid(O, P), lab = lb('r', [m[0] + Math.sin(a) * 17, m[1] - Math.cos(a) * 17], fs) + lb('O', [O[0] - Math.cos(a) * 24, O[1] - Math.sin(a) * 24], fs);
    return { w: Math.ceil(2 * r + 2 * M), h: Math.ceil(2 * r + 2 * M), g: wrapStroke(g, 26) + lab };
  }

  var narrow = W < 520, fsList = narrow ? [30, 34] : [32, 38, 44], items = [], n;
  var texts = (CFG.board || []).concat(shuf(BOARD_TEXTS));
  texts.forEach(function (s) { var it = formula(s, pickN(fsList)); it.kind = 't'; items.push(it); });
  var kk = function () { return (narrow ? .78 : .85) + rnd() * .3; };
  [rightTri, isoTri, venn, graph, circ, rightTri, graph].forEach(function (f) { var it = f(kk()); it.kind = 'd'; items.push(it); });
  items = shuf(items);

  var placed = [], out = '', ghost = '', cnt = 0, cap = Math.min(26, Math.max(3, Math.round(W * H / 52000)));
  function hits(b, list) { return list.some(function (o) { return b.x < o.x + o.w && o.x < b.x + b.w && b.y < o.y + o.h && o.y < b.y + b.h; }); }
  items.forEach(function (it) {
    if (cnt >= cap || it.w > W - 16 || it.h > H - 8) return;
    for (var t = 0; t < 90; t++) {
      var x = 8 + rnd() * (W - it.w - 16), y = 4 + rnd() * (H - it.h - 8), pad = 12, b = { x: x - pad, y: y - pad, w: it.w + 2 * pad, h: it.h + 2 * pad };
      if (hits(b, forb) || hits(b, placed)) continue;
      placed.push(b); cnt++;
      var rot = r1((rnd() - .5) * (it.kind === 't' ? 7 : 8)), g = '<g transform="translate(' + r1(x) + ' ' + r1(y) + ') rotate(' + rot + ' ' + r1(it.w / 2) + ' ' + r1(it.h / 2) + ')">' + it.g + '</g>';
      if (rnd() < .22) ghost += g; else out += g;
      break;
    }
  });

  var sm = '', i, ns = Math.round(H / 240) + 3;
  for (i = 0; i < ns; i++) sm += '<ellipse cx="' + r1(rnd() * W) + '" cy="' + r1(rnd() * H) + '" rx="' + r1(60 + rnd() * 150) + '" ry="' + r1(24 + rnd() * 60) + '" transform="rotate(' + r1(rnd() * 60 - 30) + ' ' + r1(rnd() * W) + ' ' + r1(rnd() * H) + ')" fill="#f3ece2" opacity="' + r1(.035 + rnd() * .05) + '"/>';
  for (i = 0; i < 4; i++) { var sx = rnd() * W, sy = rnd() * H, ex = sx + (rnd() - .3) * 360, ey = sy + (rnd() - .5) * 160; sm += '<path d="M' + pt(sx, sy) + 'C' + pt(sx + 90, sy - 70 * rnd()) + ' ' + pt(ex - 90, ey + 70 * rnd()) + ' ' + pt(ex, ey) + '" fill="none" stroke="#f3ece2" stroke-width="' + r1(30 + rnd() * 40) + '" stroke-linecap="round" opacity="' + r1(.03 + rnd() * .035) + '"/>'; }

  var fil = '<filter id="chalk" filterUnits="userSpaceOnUse" x="0" y="0" width="' + W + '" height="' + H + '"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="4" result="w"/><feDisplacementMap in="SourceGraphic" in2="w" scale="3.4" xChannelSelector="R" yChannelSelector="G" result="a"/><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="8" result="g"/><feDisplacementMap in="a" in2="g" scale="1.6" xChannelSelector="R" yChannelSelector="G" result="b"/><feColorMatrix in="g" type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 2.6 0 0 0 -.42" result="m"/><feComposite in="b" in2="m" operator="in"/></filter>' +
    '<filter id="smudge" filterUnits="userSpaceOnUse" x="0" y="0" width="' + W + '" height="' + H + '"><feGaussianBlur stdDeviation="16"/></filter>' +
    '<filter id="soft" filterUnits="userSpaceOnUse" x="0" y="0" width="' + W + '" height="' + H + '"><feGaussianBlur stdDeviation="2.2"/></filter>';
  return '<defs>' + fil + '</defs><g filter="url(#smudge)">' + sm + '</g><g filter="url(#soft)" opacity=".16"><g filter="url(#chalk)">' + ghost + '</g></g><g opacity=".82" filter="url(#chalk)">' + out + '</g>';
}

function drawBoard() {
  var W = document.documentElement.clientWidth;
  boardEl.style.height = '0px';
  var H = Math.max(document.documentElement.scrollHeight, window.innerHeight);
  boardEl.style.height = H + 'px';
  var sx = window.pageXOffset || 0, sy = window.pageYOffset || 0, forb = [];
  app.querySelectorAll('h1,h2,h3,p,.card,.row,.opts,.btn,.msg,.hint,.why,input,.nav,.top,table,.acts,.rows,.cap,.expr').forEach(function (e) {
    var r = e.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) forb.push({ x: r.left + sx - 16, y: r.top + sy - 16, w: r.width + 32, h: r.height + 32 });
  });
  boardEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '"><text id="bm" x="0" y="-99" font-size="30" fill="none"></text></svg>';
  var svg = boardEl.firstChild, mt = svg.querySelector('#bm');
  try { svg.insertAdjacentHTML('beforeend', makeBoard(W, H, forb, rng(boardKey + '|' + Math.round(W / 40)), mt)); } catch (e) { if (window.console) console.error(e); }
}
function scheduleBoard() { clearTimeout(boardTimer); boardTimer = setTimeout(drawBoard, 90); }
if (document.fonts && document.fonts.load) document.fonts.load('600 30px ChalkHand').then(scheduleBoard, scheduleBoard);
window.addEventListener('resize', scheduleBoard);
if (window.ResizeObserver) new ResizeObserver(scheduleBoard).observe(document.getElementById('app'));

/* ---------- экран ---------- */
var V = { name: S.name ? 'home' : 'start' };
var P = null; // текущая практика

function dots(n, id) { var h = '<span class="dots">'; for (var i = 0; i < need(id); i++) h += '<i class="' + (i < n ? 'on' : '') + '"></i>'; return h + '</span>'; }

function render() {
  if (isTeacher() && V.name !== 'task' && V.name !== 'teach') V = { name: 'teacher' };
  if (!isTeacher() && V.name === 'teacher') V = { name: S.name ? 'home' : 'start' };
  var f = { start: rStart, home: rHome, teach: rTeach, task: rTask, done: rDone, inter: rInter, stuck: rStuck, teacher: rTeacher }[V.name];
  app.innerHTML = f();
  boardKey = V.name + '|' + (V.name === 'task' && P ? P.i : (V.i === undefined ? '' : V.i)) + '|' + (V.k === undefined ? '' : V.k);
  scheduleBoard();
  window.scrollTo(0, 0);
  var inp = app.querySelector('input');
  if (inp && V.name === 'task') inp.focus();
}

function rStart() {
  return '<div class="start"><h1>' + CFG.shortTitle + '</h1><p class="ask-name">Как тебя зовут?</p><input id="nm" class="txt" maxlength="30" autocomplete="off"><p class="go"><button class="btn" data-a="start">Начать</button></p></div>';
}

function rHome() {
  var h = '<div class="top"><h1>' + CFG.shortTitle + '</h1><div class="who">' + esc(S.name) + '</div></div><p class="small">Проходи ступени по порядку. Следующая откроется, когда ты хорошо справишься с этой.</p><div class="list">';
  STEPS.forEach(function (s, i) {
    var o = st(s.id), open = isOpen(i), status, cls = '';
    if (o.passed) { status = 'пройдена'; cls = 'ok'; }
    else if (!open) { status = 'закрыта'; cls = 'lock'; }
    else if (o.stuck) { status = 'нужна помощь учителя'; cls = 'help'; }
    else if (o.tried) { status = 'идёт: ' + o.streak + ' из ' + need(s.id); cls = 'run'; }
    else status = 'можно начинать';
    h += '<button class="row ' + cls + '" ' + (open ? 'data-a="open" data-i="' + i + '"' : 'disabled') + '><span class="num">' + s.id + '</span><span class="tt"><b>' + s.title + '</b><small>' + s.sub + '</small></span><span class="stt">' + status + '</span></button>';
  });
  return h + '</div>';
}

function askHtml(sl) {
  var k = V.k, got = V.asked && V.asked[k];
  var h = '<div class="ask"><p><b>' + sl.ask.q + '</b></p><div class="opts">' + sl.ask.opts.map(function (o) {
    return '<button class="opt' + (got && got.v === o[0] ? ' sel' : '') + '" data-a="tpick" data-v="' + esc(o[0]) + '">' + o[1] + '</button>';
  }).join('') + '</div><div id="askmsg" class="msg ' + (got ? (got.ok ? 'good' : 'bad') : '') + '">' + (got ? (got.ok ? sl.ask.ok : sl.ask.no) : '') + '</div></div>';
  return h;
}
function rTeach() {
  var s = STEPS[V.i], sl = s.teach[V.k], last = V.k === s.teach.length - 1;
  var wait = sl.ask && !(V.asked && V.asked[V.k]);
  var nextBtn = last ? '<button class="btn" data-a="practice"' + (wait ? ' disabled' : '') + '>Задания</button>' : '<button class="btn" data-a="next"' + (wait ? ' disabled' : '') + '>Дальше</button>';
  return '<div class="top"><button class="lnk" data-a="home">← Ступени</button><div class="who">Ступень ' + s.id + '</div></div><h2>' + s.title + '</h2>' +
    '<div class="card">' + sl.t + '<div class="vis">' + sl.v + '</div>' + (sl.ask ? askHtml(sl) : '') + '</div>' +
    '<div class="nav">' + (V.k > 0 ? '<button class="btn sec" data-a="prev">Назад</button>' : '<span></span>') +
    '<span class="small">' + (V.k + 1) + ' из ' + s.teach.length + '</span>' + nextBtn + '</div>' + (wait ? '<p id="waitmsg" class="small" style="text-align:center;margin-top:10px">Выбери ответ на вопрос выше, и кнопка станет активной.</p>' : '');
}

function rTask() {
  var s = STEPS[P.i], T = P.task, o = st(s.id);
  var h = '<div class="top"><button class="lnk" data-a="home">← Ступени</button><div class="who">Ступень ' + s.id + ' · ' + dots(o.streak, s.id) + '</div></div>';
  h += (P.twin ? '<p class="small">Похожее задание. Попробуй ещё раз, теперь с другими числами.</p>' : '') + '<div class="card">' + T.q + '<div id="inp">' + inputHtml(T) + '</div></div>';
  h += '<div id="hintbox" class="hint" ' + (P.hint ? '' : 'hidden') + '>' + (P.hint ? T.hint : '') + '</div>';
  h += '<div id="msg" class="msg"></div>';
  h += '<div class="acts" id="acts">';
  if (!P.done) {
    h += '<button class="btn" data-a="check">Проверить</button>';
    if (!P.hint) h += '<button class="btn sec" data-a="hint">Подсказка</button>';
    h += '<button class="btn sec" data-a="dk">Не знаю</button>';
  }
  return h + '</div>';
}

function frac3(key, kind) {
  var f = function (c, dec) { return '<input class="num' + (dec ? ' dec' : '') + '" inputmode="' + (dec ? 'decimal' : 'numeric') + '" maxlength="' + (dec ? 7 : 3) + '" data-k="' + key + '" data-p="' + c + '" autocomplete="off">'; };
  if (kind === 'int') return f('x');
  if (kind === 'num') return f('x', true);
  if (kind === 'ratio') return '<span class="rat">' + f('a') + '<span class="colon">:</span>' + f('b') + '</span>';
  var fr = '<span class="fin">' + f('n') + '<span class="line"></span>' + f('d') + '</span>';
  return kind === 'mixed' ? f('w') + fr : fr;
}
function inputHtml(T) {
  var I = T.input;
  if (I.type === 'choice') {
    return '<div class="opts">' + I.options.map(function (o) { return '<button class="opt" data-a="pick" data-v="' + esc(o.v) + '">' + o.html + '</button>'; }).join('') + '</div>';
  }
  if (I.type === 'shade' && C.bar) return '<div id="shade">' + C.bar(I.n, Array.from(P.sel), { click: true }) + '</div>';
  return '<div class="rows">' + I.rows.map(function (r) { return '<div class="irow"><span class="lb">' + r.label + '</span>' + frac3(r.key, r.kind) + '</div>'; }).join('') + '</div>';
}

function rDone() {
  var s = STEPS[V.i], last = V.i === STEPS.length - 1;
  return '<h2>Ступень пройдена</h2><div class="card"><p><b>' + s.title + '</b>: ' + need(s.id) + ' верных ответов подряд. Молодец.</p></div>' +
    '<p>' + (last ? '<button class="btn" data-a="home">К списку ступеней</button>' : '<button class="btn" data-a="open" data-i="' + (V.i + 1) + '">Следующая ступень</button> <button class="btn sec" data-a="home">К списку</button>') + '</p>';
}
function rInter() {
  return '<h2>Давай ещё раз посмотрим объяснение</h2><div class="card"><p>Несколько ответов подряд не получились. Это нормально: значит, объяснение надо посмотреть ещё раз, не торопясь.</p></div><p><button class="btn" data-a="reteach">Смотреть объяснение</button></p>';
}
function rStuck() {
  return '<h2>Стоп</h2><div class="card"><p>Здесь стало трудно, и это не страшно. Эту ступень лучше разобрать вместе с учителем.</p><p>Скажи, на каком месте перестало быть понятно.</p></div><p><button class="btn" data-a="home">К списку ступеней</button> <button class="btn sec" data-a="reteach">Ещё раз объяснение</button></p>';
}

/* ---------- кабинет учителя ---------- */
function rTeacher() {
  var h = '<div class="top"><h1>Отчёт</h1><div class="who">' + esc(S.name || '—') + '</div></div>';
  h += '<p class="small">Результаты ученицы уходят в таблицу «Кабинеты учеников» (в режиме учителя ничего не отправляется). Ниже то, что хранится в этом браузере.</p>';
  h += '<table class="rep"><tr><th>№</th><th>Ступень</th><th>Статус</th><th>Верно</th><th>Неверно</th><th>Подсказок</th><th>После разбора верно</th><th>Частые ошибки</th><th></th></tr>';
  STEPS.forEach(function (s, i) {
    var o = st(s.id), tags = Object.keys(o.tags).sort(function (a, b) { return o.tags[b] - o.tags[a]; }).slice(0, 3).map(function (t) { return t + ' ×' + o.tags[t]; }).join(', ');
    var status = o.passed ? 'пройдена' : o.stuck ? 'нужна помощь' : o.tried ? 'идёт ' + o.streak + '/' + need(s.id) : '—';
    h += '<tr><td>' + s.id + '</td><td>' + s.title + '</td><td>' + status + '</td><td>' + o.ok + '</td><td>' + o.bad + '</td><td>' + o.hints + '</td><td>' + (o.twinTried ? (o.twinOk || 0) + ' из ' + o.twinTried : '') + '</td><td>' + (tags || '') + '</td><td><button class="lnk" data-a="tpass" data-i="' + i + '">засчитать</button> <button class="lnk" data-a="treset" data-i="' + i + '">сбросить</button> <button class="lnk" data-a="topen" data-i="' + i + '">смотреть</button></td></tr>';
  });
  h += '</table><p><button class="btn sec" data-a="topenall">' + (S.openAll ? 'Закрыть ступени по порядку' : 'Открыть все ступени ученице') + '</button> <button class="btn sec" data-a="tclear">Сбросить всё</button> <button class="btn sec" data-a="thome">Режим ученицы</button></p>';
  h += '<h3>Последние ответы</h3><table class="rep"><tr><th>Когда</th><th>Ступень</th><th>Итог</th><th>Попытки</th><th>Подсказка</th><th>Повтор после разбора</th><th>Ошибка</th></tr>';
  S.log.filter(function (e) { return e.t === 'task' || e.t === 'passed' || e.t === 'stuck'; }).slice(-40).reverse().forEach(function (e) {
    var d = new Date(e.ts);
    h += '<tr><td>' + d.toLocaleDateString('ru-RU') + ' ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) + '</td><td>' + (e.step || '') + '</td><td>' + (e.t === 'passed' ? 'ступень пройдена' : e.t === 'stuck' ? 'нужна помощь' : e.ok ? 'верно' : 'неверно') + '</td><td>' + (e.attempts || '') + '</td><td>' + (e.hint ? 'да' : '') + '</td><td>' + (e.twin ? 'да' : '') + '</td><td>' + (e.tag || '') + '</td></tr>';
  });
  return h + '</table>';
}

/* ---------- логика практики ---------- */
function newTask() {
  var s = STEPS[P.i], o = st(s.id);
  P.task = s.gen(o.streak); P.attempt = 0; P.hint = false; P.done = false; P.choice = undefined; P.sel = new Set(); P.tags = [];
  if (P.last && P.task.q === P.last) P.task = s.gen(o.streak);
  P.last = P.task.q;
}
function startPractice(i) { P = { i: i, twin: false, lastWrong: false }; newTask(); V = { name: 'task' }; render(); }
function openStep(i) {
  var o = st(STEPS[i].id);
  if (o.stuck) { o.stuck = false; o.reteach = 1; save(); }
  V = { name: 'teach', i: i, k: 0, asked: {} }; render();
}

var TAGMSG = CFG.tagMsg || {};
function ansHtml(T) {
  var I = T.input;
  if (I.type === 'choice') { var o = I.options.filter(function (x) { return x.v === String(T.ans); })[0]; return o ? o.html : esc(T.ans); }
  if (I.type === 'shade') { var a = []; for (var i = 0; i < T.sol; i++) a.push(i); return 'Закрашено должно быть кусочков: <b>' + T.sol + '</b>' + C.bar(I.n, a); }
  return I.rows.map(function (r) {
    var v = T.sol[r.key], h = (r.kind === 'int' || r.kind === 'num') ? '<b>' + String(v).replace('.', ',') + '</b>' : r.kind === 'ratio' ? '<b>' + v.a + ' : ' + v.b + '</b>' : r.kind === 'frac' ? C.fr(v.n, v.d) : C.mx(v.w, v.n, v.d);
    return '<span class="ansr">' + (r.label ? r.label + ' ' : '') + h + '</span>';
  }).join(' ');
}
function whyHtml(tag) {
  var T = P.task, pre = TAGMSG[tag] ? '<p>' + TAGMSG[tag] + '</p>' : '';
  return '<div class="why"><p><b>Разберём.</b></p>' + pre + '<p>' + T.hint + '</p><p><b>Правильный ответ:</b></p><div>' + ansHtml(T) + '</div></div>';
}
function sig(T) {
  return T.input.type + '|' + T.q.replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, '').replace(/\d+/g, '#').replace(/\s+/g, ' ').trim() + '|' + (T.input.rows ? T.input.rows.map(function (r) { return r.kind + r.key; }).join(',') : '');
}
function twinTask() {
  var s = STEPS[P.i], o = st(s.id), want = sig(P.task), t;
  for (var k = 0; k < 120; k++) { t = s.gen(o.streak); if (sig(t) === want && t.q !== P.task.q) return t; }
  return s.gen(o.streak);
}
function maxAtt(T) { return T.input.type === 'choice' ? 1 : 2; }
function msg(t, cls, extra) { var m = document.getElementById('msg'); if (m) { m.className = 'msg ' + (cls || ''); m.innerHTML = t + (extra || ''); } }

function readVals() {
  var T = P.task, I = T.input;
  if (I.type === 'choice') return P.choice === undefined ? null : P.choice;
  if (I.type === 'shade') return P.sel.size ? Array.from(P.sel) : null;
  var vals = {}, ok = true;
  I.rows.forEach(function (r) {
    var get = function (p) { var el = app.querySelector('input[data-k="' + r.key + '"][data-p="' + p + '"]'); var v = el ? (r.kind === 'num' ? parseFloat(el.value.replace(',', '.')) : parseInt(el.value, 10)) : NaN; if (isNaN(v)) ok = false; return v; };
    if (r.kind === 'int' || r.kind === 'num') vals[r.key] = get('x');
    else if (r.kind === 'ratio') vals[r.key] = { a: get('a'), b: get('b') };
    else if (r.kind === 'frac') vals[r.key] = { n: get('n'), d: get('d') };
    else vals[r.key] = { w: get('w'), n: get('n'), d: get('d') };
  });
  return ok ? vals : null;
}

function check() {
  if (P.done) return;
  var T = P.task, vals = readVals();
  if (vals === null) { msg(T.input.type === 'choice' ? 'Сначала выбери ответ.' : T.input.type === 'shade' ? 'Сначала закрась кусочки.' : 'Заполни все окошки.'); return; }
  var r = T.input.type === 'choice' ? (vals === String(T.ans) ? 'ok' : 'wrong') : T.check(vals);
  if (r && r.partial) { msg(r.partial); return; }
  P.attempt++;
  var tag = '';
  if (r !== 'ok') {
    if (T.input.type === 'choice') { var op = T.input.options.filter(function (o) { return o.v === vals; })[0]; tag = op ? op.tag : ''; }
    else if (T.tag) tag = T.tag(vals) || '';
    if (tag) P.tags.push(tag);
    if (P.attempt < maxAtt(T)) { msg('Не так. ' + (TAGMSG[tag] || 'Посмотри ещё раз и попробуй снова. Можно взять подсказку.') + ' Попробуй ещё раз.', 'bad'); return; }
  }
  finish(r === 'ok', tag);
}

function finish(ok, tag) {
  var s = STEPS[P.i], o = st(s.id), clean = ok && P.attempt === 1 && !P.hint;
  P.done = true; o.tried++; if (ok) o.ok++; else o.bad++; if (P.hint) o.hints++;
  P.tags.forEach(function (t) { o.tags[t] = (o.tags[t] || 0) + 1; });
  if (P.twin) { o.twinTried = (o.twinTried || 0) + 1; if (ok) o.twinOk = (o.twinOk || 0) + 1; }
  if (clean) { o.streak++; o.cw = 0; }
  else if (!ok) { o.streak = 0; o.cw++; }
  var passedNow = false;
  if (!o.passed && o.streak >= need(s.id)) { o.passed = true; passedNow = true; }
  send({ t: 'task', step: s.id, stepTitle: s.title, ok: ok, attempts: P.attempt, hint: P.hint, twin: !!P.twin, tag: P.tags.join(',') });
  save();
  if (passedNow || o.tried % 10 === 0) push();
  var m;
  if (ok) m = clean ? 'Верно.' : 'Верно, но в зачёт не пошло: ответ был не с первой попытки или с подсказкой.';
  else m = (tag === 'dont-know' ? 'Хорошо, что сказала честно. ' : 'Не получилось. ') + 'Давай разберём. Счёт верных подряд начинается заново.';
  P.lastWrong = !ok;
  msg(m, ok ? 'good' : 'bad', ok ? '' : whyHtml(tag || P.tags[P.tags.length - 1] || ''));
  document.getElementById('acts').innerHTML = '<button class="btn" data-a="next-task" data-passed="' + (passedNow ? 1 : 0) + '">' + (ok ? 'Дальше' : 'Попробовать похожее') + '</button>';
  var hb = document.querySelector('.dots'); if (hb) hb.outerHTML = dots(o.streak, s.id);
  lockInputs();
}
function lockInputs() { app.querySelectorAll('#inp input, #inp .opt').forEach(function (e) { e.disabled = true; }); }

function nextTask(passed) {
  var s = STEPS[P.i], o = st(s.id);
  if (passed) { send({ t: 'passed', step: s.id, stepTitle: s.title }); V = { name: 'done', i: P.i }; render(); return; }
  if (o.cw >= 2) {
    o.cw = 0;
    if (o.reteach >= 2) { o.stuck = true; save(); send({ t: 'stuck', step: s.id, stepTitle: s.title }); push(); V = { name: 'stuck', i: P.i }; render(); return; }
    o.reteach++; save(); V = { name: 'inter', i: P.i }; render(); return;
  }
  if (P.lastWrong) { var tw = twinTask(); P.task = tw; P.attempt = 0; P.hint = false; P.done = false; P.choice = undefined; P.sel = new Set(); P.tags = []; P.last = tw.q; P.twin = true; P.lastWrong = false; render(); return; }
  P.twin = false; newTask(); render();
}

/* ---------- события ---------- */
app.addEventListener('click', function (e) {
  var b = e.target.closest('[data-a]');
  var pc = e.target.closest('#shade .pc');
  var dp = e.target.closest('.demo .pc');
  if (dp) { var dm = dp.closest('.demo'), idx = +dp.getAttribute('data-i'), cur = (dm._sel = dm._sel || new Set()); if (cur.has(idx)) cur.delete(idx); else cur.add(idx); var dn = +dm.getAttribute('data-n'); dm.querySelector('.dbar').innerHTML = C.bar(dn, Array.from(cur), { click: true }); dm.querySelector('.dfr').innerHTML = C.fr(cur.size, dn) + ' &nbsp; закрашено ' + cur.size + ' из ' + dn; return; }
  if (pc && P && !P.done) { var i = +pc.getAttribute('data-i'); if (P.sel.has(i)) P.sel.delete(i); else P.sel.add(i); document.getElementById('shade').innerHTML = C.bar(P.task.input.n, Array.from(P.sel), { click: true }); return; }
  if (!b || b.disabled) return;
  var a = b.dataset.a, i2 = +b.dataset.i;
  if (a === 'start') { var v = document.getElementById('nm').value.trim(); if (!v) return; S.name = v; save(); send({ t: 'start' }); V = { name: 'home' }; render(); }
  else if (a === 'home' || a === 'thome') { if (a === 'home') push(); if (a === 'thome') history.replaceState(null, '', location.pathname); V = { name: 'home' }; render(); }
  else if (a === 'open') openStep(i2);
  else if (a === 'tpick') {
    var sl2 = STEPS[V.i].teach[V.k], good = b.dataset.v === sl2.ask.ans;
    V.asked = V.asked || {}; V.asked[V.k] = { v: b.dataset.v, ok: good };
    app.querySelectorAll('.ask .opt').forEach(function (o) { o.classList.toggle('sel', o === b); });
    var am = document.getElementById('askmsg'); am.className = 'msg ' + (good ? 'good' : 'bad'); am.innerHTML = good ? sl2.ask.ok : sl2.ask.no;
    var nb = app.querySelector('.nav [data-a="next"], .nav [data-a="practice"]'); if (nb) nb.disabled = false;
    var wm = document.getElementById('waitmsg'); if (wm) wm.remove();
    send({ t: 'ask', step: STEPS[V.i].id, ok: good });
  }
  else if (a === 'next') { V.k++; render(); }
  else if (a === 'prev') { V.k--; render(); }
  else if (a === 'practice') startPractice(V.i);
  else if (a === 'reteach') { V = { name: 'teach', i: V.i, k: 0, asked: {} }; render(); }
  else if (a === 'pick') { P.choice = b.dataset.v; app.querySelectorAll('.opt').forEach(function (o) { o.classList.toggle('sel', o === b); }); }
  else if (a === 'check') check();
  else if (a === 'hint') { P.hint = true; var hb = document.getElementById('hintbox'); hb.hidden = false; hb.innerHTML = P.task.hint; b.remove(); }
  else if (a === 'dk') { if (!P.done) { P.attempt++; P.tags.push('dont-know'); finish(false, 'dont-know'); } }
  else if (a === 'next-task') nextTask(b.dataset.passed === '1');
  else if (a === 'tpass') { var o1 = st(STEPS[i2].id); o1.passed = true; o1.stuck = false; save(); render(); }
  else if (a === 'treset') { delete S.steps[STEPS[i2].id]; save(); render(); }
  else if (a === 'topen') { history.replaceState(null, '', location.pathname); V = { name: 'teach', i: i2, k: 0 }; render(); }
  else if (a === 'topenall') { S.openAll = !S.openAll; save(); render(); }
  else if (a === 'tclear') { if (confirm('Стереть весь прогресс и имя?')) { S = fresh(); save(); V = { name: 'start' }; history.replaceState(null, '', location.pathname); render(); } }
});
app.addEventListener('keydown', function (e) {
  if (e.key !== 'Enter') return;
  if (V.name === 'start') { app.querySelector('[data-a="start"]').click(); }
  else if (V.name === 'task') { var c = app.querySelector('[data-a="check"],[data-a="next-task"]'); if (c) c.click(); }
});
window.addEventListener('hashchange', render);
window.__trainer = { get P() { return P; }, get S() { return S; }, get V() { return V; } };
render();
})();
