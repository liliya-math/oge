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

/* ---------- экран ---------- */
var V = { name: S.name ? 'home' : 'start' };
var P = null; // текущая практика

function dots(n, id) { var h = '<span class="dots">'; for (var i = 0; i < need(id); i++) h += '<i class="' + (i < n ? 'on' : '') + '"></i>'; return h + '</span>'; }

function render() {
  if (isTeacher() && V.name !== 'task' && V.name !== 'teach') V = { name: 'teacher' };
  if (!isTeacher() && V.name === 'teacher') V = { name: S.name ? 'home' : 'start' };
  var f = { start: rStart, home: rHome, teach: rTeach, task: rTask, done: rDone, inter: rInter, stuck: rStuck, teacher: rTeacher }[V.name];
  app.innerHTML = f();
  window.scrollTo(0, 0);
  var inp = app.querySelector('input');
  if (inp && V.name === 'task') inp.focus();
}

function rStart() {
  return '<h1>' + CFG.shortTitle + '</h1><p>Как тебя зовут?</p><input id="nm" class="txt" maxlength="30" autocomplete="off"><p><button class="btn" data-a="start">Начать</button></p>';
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
    '<span class="small">' + (V.k + 1) + ' из ' + s.teach.length + '</span>' + nextBtn + '</div>';
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
  return '<h2>Ступень пройдена</h2><div class="card"><p><b>' + s.title + '</b>: ' + need(s.id) + ' верных ответов подряд. Молодец, это настоящая работа.</p></div>' +
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
