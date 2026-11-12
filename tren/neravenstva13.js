/* Содержание тренажёра «Неравенства: ОГЭ №13», 13 ступеней. Движок: tren/staged.js */
(function (root) {
'use strict';
function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function pick(a) { return a[rnd(0, a.length - 1)]; }
function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = rnd(0, i), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function fx(h, big) { return '<span class="fx' + (big ? ' big' : '') + '">' + h + '</span>'; }
function f(x) { return x < 0 ? '−' + (-x) : String(x); }
function choice(list, shuf) {
  var o = list.map(function (a) { return { v: String(a[0]), html: a[1], tag: a[2] || '' }; });
  return { type: 'choice', options: shuf === false ? o : shuffle(o) };
}
function ask(q, opts, ans, ok, no) { return { q: q, opts: opts, ans: ans, ok: ok, no: no }; }

/* ---------- знаки и множества ---------- */
var SYM = { '>': '&gt;', '<': '&lt;', '>=': '≥', '<=': '≤' };
var FLIP = { '>': '<', '<': '>', '>=': '<=', '<=': '>=' };
var TOG = { '>': '>=', '>=': '>', '<': '<=', '<=': '<' };
function strict(op) { return op.length === 1; }
function dirRight(op) { return op.charAt(0) === '>'; }
function ineq(op, c, v) { return (v || 'x') + ' ' + SYM[op] + ' ' + f(c); }
function I(a, b, ao, bo) { return { a: a, b: b, ao: a === null ? false : !!ao, bo: b === null ? false : !!bo }; }
function setOf(op, c) { return dirRight(op) ? [I(c, null, strict(op), false)] : [I(null, c, false, strict(op))]; }
function norm(set) { return set.slice().sort(function (p, q) { return (p.a === null ? -1e9 : p.a) - (q.a === null ? -1e9 : q.a); }); }
function mirror(set) { return norm(set.map(function (i) { return I(i.b === null ? null : -i.b, i.a === null ? null : -i.a, i.bo, i.ao); })); }
function toggleOpen(set) { return set.map(function (i) { return I(i.a, i.b, i.a === null ? false : !i.ao, i.b === null ? false : !i.bo); }); }
/* решение (x - p)(x - q) op 0 или x^2 op c, p < q */
function quadSet(p, q, op) {
  return dirRight(op) ? [I(null, p, false, strict(op)), I(q, null, strict(op), false)] : [I(p, q, strict(op), strict(op))];
}

/* ---------- числовая прямая (SVG) ---------- */
function nl(set, labs) {
  var pts = [];
  set.forEach(function (i) { if (i.a !== null && pts.indexOf(i.a) < 0) pts.push(i.a); if (i.b !== null && pts.indexOf(i.b) < 0) pts.push(i.b); });
  (labs || []).forEach(function (v) { if (pts.indexOf(v) < 0) pts.push(v); });
  pts.sort(function (a, b) { return a - b; });
  var n = pts.length, xs = [], k;
  for (k = 0; k < n; k++) xs.push(n === 1 ? 150 : Math.round(70 + 160 * k / (n - 1)));
  function X(v) { return xs[pts.indexOf(v)]; }
  var A = 'var(--amber,#E2B04A)', FG = 'var(--fg,#EEE0C8)';
  var s = '<svg viewBox="0 0 300 58" width="250" style="max-width:100%;height:auto;display:block;margin:6px 0" role="img">';
  s += '<line x1="8" y1="22" x2="290" y2="22" style="stroke:' + FG + ';stroke-width:2"/>';
  s += '<polyline points="283,16 291,22 283,28" style="fill:none;stroke:' + FG + ';stroke-width:2"/>';
  for (k = 0; k < n; k++) {
    s += '<line x1="' + xs[k] + '" y1="16" x2="' + xs[k] + '" y2="28" style="stroke:' + FG + ';stroke-width:2"/>';
    s += '<text x="' + xs[k] + '" y="52" text-anchor="middle" style="fill:' + FG + ';font:600 16px sans-serif">' + f(pts[k]) + '</text>';
  }
  set.forEach(function (i) {
    var x1 = i.a === null ? 8 : X(i.a), x2 = i.b === null ? 280 : X(i.b);
    s += '<line x1="' + x1 + '" y1="22" x2="' + x2 + '" y2="22" style="stroke:' + A + ';stroke-width:7"/>';
    if (i.b === null) s += '<polyline points="276,14 288,22 276,30" style="fill:none;stroke:' + A + ';stroke-width:4"/>';
    if (i.a === null) s += '<polyline points="14,14 6,22 14,30" style="fill:none;stroke:' + A + ';stroke-width:4"/>';
  });
  set.forEach(function (i) {
    [[i.a, i.ao], [i.b, i.bo]].forEach(function (e) {
      if (e[0] === null) return;
      s += '<circle cx="' + X(e[0]) + '" cy="22" r="7" style="' + (e[1] ? 'fill:#1d2d22;stroke:' + A + ';stroke-width:3' : 'fill:' + A + ';stroke:' + A + ';stroke-width:3') + '"/>';
    });
  });
  return s + '</svg>';
}

/* ---------- система с фигурной скобкой ---------- */
function sys(rows) {
  return '<div style="display:inline-flex;align-items:center;gap:8px;margin:8px 0"><span style="font-size:58px;line-height:1;font-weight:200">{</span><span style="text-align:left;line-height:1.8;font-size:22px;font-weight:700">' + rows.join('<br>') + '</span></div>';
}

/* ---------- выбор из четырёх рисунков ---------- */
function uniq(list) { var seen = {}, out = []; list.forEach(function (e) { var k = JSON.stringify(e[0]); if (!seen[k]) { seen[k] = 1; out.push(e); } }); return out; }
function pickPics(correct, wrongs) {
  var list = uniq([[correct, 'ok']].concat(wrongs, [[mirror(correct), 'direction'], [toggleOpen(correct), 'open-closed'], [mirror(toggleOpen(correct)), 'both']])).slice(0, 4);
  list = shuffle(list);
  var ans = '';
  var opts = list.map(function (e, i) {
    if (e[1] === 'ok') ans = String(i + 1);
    return [String(i + 1), '<span style="display:flex;align-items:center;gap:10px"><b style="font-size:20px">' + (i + 1) + '</b>' + nl(e[0]) + '</span>', e[1] === 'ok' ? '' : e[1]];
  });
  return { input: choice(opts, false), ans: ans };
}
function pickTexts(correct, wrongs, fmt) {
  var list = uniq([[correct, 'ok']].concat(wrongs)).slice(0, 4);
  return { input: choice(list.map(function (e) { return [JSON.stringify(e[0]), fmt(e[0]), e[1] === 'ok' ? '' : e[1]]; })), ans: JSON.stringify(correct) };
}

/* ---------- записи выражений ---------- */
function cx(a) { return a === 1 ? 'x' : a === -1 ? '−x' : f(a) + 'x'; }
function lin(a, b) { return cx(a) + (b > 0 ? ' + ' + b : b < 0 ? ' − ' + (-b) : ''); }
function fac(r) { return r === 0 ? 'x' : r > 0 ? '(x − ' + r + ')' : '(x + ' + (-r) + ')'; }
function pickOp() { return pick(['>', '<', '>=', '<=']); }
function nz(lo, hi) { var v; do { v = rnd(lo, hi); } while (v === 0); return v; }

/* ---------- генераторы ---------- */
function gen1() {
  var a, b, t = rnd(0, 1);
  do { a = rnd(-9, 9); b = rnd(-9, 9); } while (a === b || (rnd(0, 2) > 0 && a >= 0 && b >= 0));
  var right = t === 0, ans = right ? Math.max(a, b) : Math.min(a, b), bad = right ? Math.min(a, b) : Math.max(a, b);
  var tag = a < 0 && b < 0 ? 'neg-abs' : 'compare';
  return { q: '<p>Какое число стоит на числовой прямой ' + (right ? 'правее' : 'левее') + ': ' + f(a) + ' или ' + f(b) + '?</p>',
    input: choice([[ans, f(ans)], [bad, f(bad), tag]]), ans: ans,
    hint: 'Правее стоит большее число, левее меньшее. Чем число левее, тем оно меньше. Среди отрицательных чисел меньше то, что дальше от нуля. Из чисел ' + f(a) + ' и ' + f(b) + ' ' + (right ? 'правее' : 'левее') + ' стоит ' + f(ans) + '.' };
}
var WORDS = [['>', 'больше'], ['<', 'меньше'], ['>=', 'не меньше'], ['<=', 'не больше']];
function gen2() {
  if (rnd(0, 1) === 0) {
    var a, b; do { a = rnd(-9, 9); b = rnd(-9, 9); } while (a === b);
    var op = a > b ? '>' : '<';
    return { q: '<p>Поставь верный знак:</p>' + fx(f(a) + ' ? ' + f(b)),
      input: choice([['>', '&gt;'], ['<', '&lt;']], false), ans: op,
      hint: 'Сравни числа на прямой. Число ' + f(a) + ' стоит ' + (a > b ? 'правее' : 'левее') + ' числа ' + f(b) + ', значит, ' + f(a) + ' ' + SYM[op] + ' ' + f(b) + '.' };
  }
  var w = pick(WORDS), c = rnd(-6, 9), o;
  var list = ['>', '<', '>=', '<='].map(function (s) {
    var tg = s === w[0] ? '' : (dirRight(s) === dirRight(w[0]) ? 'strict-nonstrict' : 'direction');
    return [s, 'x ' + SYM[s] + ' ' + f(c), tg];
  });
  return { q: '<p>Запиши знаком: x ' + w[1] + ' ' + f(c) + '.</p>', input: choice(list), ans: w[0],
    hint: '«Больше» это >, «меньше» это <. Слова «не меньше» значат «больше или равно» (≥), «не больше» значат «меньше или равно» (≤). Здесь: x ' + SYM[w[0]] + ' ' + f(c) + '.' };
}
function gen3() {
  var op = pickOp(), c = rnd(-8, 8);
  var r = pickPics(setOf(op, c), [[setOf(TOG[op], c), 'open-closed'], [setOf(FLIP[op], c), 'direction'], [setOf(TOG[FLIP[op]], c), 'both']]);
  return { q: '<p>Выбери рисунок, на котором показано решение неравенства:</p>' + fx(ineq(op, c)), input: r.input, ans: r.ans,
    hint: 'Число ' + f(c) + ' отмечено на прямой. Знак ' + SYM[op] + ': луч идёт ' + (dirRight(op) ? 'вправо' : 'влево') + '. Знак ' + (strict(op) ? 'строгий, точка пустая' : 'нестрогий, точка закрашена') + '.' };
}
function gen4() {
  var op = pickOp(), c = rnd(-8, 8);
  var r = pickTexts(op + '|' + c, [[TOG[op] + '|' + c, 'open-closed'], [FLIP[op] + '|' + c, 'direction'], [TOG[FLIP[op]] + '|' + c, 'both']],
    function (s) { var p = s.split('|'); return ineq(p[0], parseInt(p[1], 10)); });
  return { q: '<p>Какое неравенство показано на рисунке?</p>' + nl(setOf(op, c)), input: r.input, ans: r.ans,
    hint: 'Число ' + f(c) + '. Луч идёт ' + (dirRight(op) ? 'вправо, значит, знак «больше»' : 'влево, значит, знак «меньше»') + '. Точка ' + (strict(op) ? 'пустая, знак строгий' : 'закрашена, знак нестрогий') + '. Ответ: ' + ineq(op, c) + '.' };
}
function gen5() {
  var op = pickOp(), a = rnd(1, 9), c = rnd(-9, 9), minus = rnd(0, 1) === 1;
  var x0 = minus ? c + a : c - a, wrong = minus ? c - a : c + a;
  var r = pickTexts(op + '|' + x0, [[op + '|' + wrong, 'sign-transfer'], [FLIP[op] + '|' + x0, 'direction'], [FLIP[op] + '|' + wrong, 'both']],
    function (s) { var p = s.split('|'); return ineq(p[0], parseInt(p[1], 10)); });
  return { q: '<p>Реши неравенство:</p>' + fx('x ' + (minus ? '−' : '+') + ' ' + a + ' ' + SYM[op] + ' ' + f(c)), input: r.input, ans: r.ans,
    hint: 'Число ' + a + ' переносим вправо, его знак меняется: x ' + SYM[op] + ' ' + f(c) + ' ' + (minus ? '+' : '−') + ' ' + a + '. Знак неравенства не меняется. Получаем ' + ineq(op, x0) + '.' };
}
function gen6() {
  var op = pickOp(), a = rnd(2, 7), x0 = nz(-6, 6), b = a * x0;
  var r = pickPics(setOf(op, x0), [[setOf(op, b), 'forgot-divide'], [setOf(FLIP[op], x0), 'direction'], [setOf(TOG[op], x0), 'open-closed']]);
  return { q: '<p>Выбери рисунок, на котором показано решение неравенства:</p>' + fx(cx(a) + ' ' + SYM[op] + ' ' + f(b)), input: r.input, ans: r.ans,
    hint: 'Делим обе части на ' + a + '. Число положительное, знак не меняется. Граница: ' + f(b) + ' : ' + a + ' = ' + f(x0) + '. Получаем ' + ineq(op, x0) + '.' };
}
function gen7() {
  var op = pickOp(), a = -rnd(2, 7), x0 = nz(-6, 6), b = a * x0, res = FLIP[op];
  var r = pickPics(setOf(res, x0), [[setOf(op, x0), 'no-flip'], [setOf(res, -x0), 'sign-boundary'], [setOf(op, -x0), 'no-flip-sign']]);
  return { q: '<p>Выбери рисунок, на котором показано решение неравенства:</p>' + fx(cx(a) + ' ' + SYM[op] + ' ' + f(b)), input: r.input, ans: r.ans,
    hint: 'Делим обе части на ' + f(a) + '. Число отрицательное, значит, знак меняется на противоположный: ' + SYM[op] + ' становится ' + SYM[res] + '. Граница: ' + f(b) + ' : (' + f(a) + ') = ' + f(x0) + '. Получаем ' + ineq(res, x0) + '.' };
}
function gen8() {
  var op = pickOp(), a, c, k, x0, b, d;
  do { a = rnd(1, 9); c = rnd(1, 9); k = a - c; x0 = nz(-6, 6); b = rnd(-9, 9); d = b + k * x0; } while (k === 0 || Math.abs(k) > 4 || Math.abs(d) > 25);
  var res = k > 0 ? op : FLIP[op];
  var r = pickPics(setOf(res, x0), [[setOf(FLIP[res], x0), k < 0 ? 'no-flip' : 'direction'], [setOf(res, -x0), 'sign-boundary'], [setOf(FLIP[res], -x0), 'both']]);
  return { q: '<p>Выбери рисунок, на котором показано решение неравенства:</p>' + fx(lin(a, b) + ' ' + SYM[op] + ' ' + lin(c, d)), input: r.input, ans: r.ans,
    hint: 'Слагаемые с x переносим влево, числа вправо, знаки у перенесённых слагаемых меняем: ' + cx(k) + ' ' + SYM[op] + ' ' + f(d - b) + '. ' +
      (k > 0 ? 'Делим на ' + k + ', знак не меняется.' : 'Делим на ' + f(k) + ', число отрицательное, знак меняется.') + ' Получаем ' + ineq(res, x0) + '.' };
}
/* система двух условий; disguise = условия записаны через линейные выражения */
function buildSystem(disguise) {
  var p, q, o1, o2, rowsInfo, set, wrongs, hintTxt;
  if (rnd(0, 2) > 0) { /* отрезок: x > p, x < q */
    do { p = rnd(-8, 6); q = rnd(-6, 9); } while (q - p < 2);
    o1 = pick(['>', '>=']); o2 = pick(['<', '<=']);
    set = [I(p, q, strict(o1), strict(o2))];
    wrongs = [[[I(p, q, !strict(o1), strict(o2))], 'open-closed'], [[I(null, p, false, !strict(o1)), I(q, null, !strict(o2), false)], 'outside-between'], [setOf(o1, p), 'one-condition']];
    hintTxt = 'Нужны числа, которые подходят к обоим условиям. Правее ' + f(p) + ' и левее ' + f(q) + ' это промежуток между ними.';
    rowsInfo = rnd(0, 1) ? [[o1, p], [o2, q]] : [[o2, q], [o1, p]];
  } else { /* два луча в одну сторону */
    var right = rnd(0, 1) === 1;
    do { p = rnd(-8, 8); q = rnd(-8, 8); } while (p === q);
    o1 = pick(right ? ['>', '>='] : ['<', '<=']); o2 = pick(right ? ['>', '>='] : ['<', '<=']);
    var tight = right ? (p > q ? [o1, p] : [o2, q]) : (p < q ? [o1, p] : [o2, q]);
    var loose = tight[1] === p ? [o2, q] : [o1, p];
    set = setOf(tight[0], tight[1]);
    wrongs = [[setOf(loose[0], loose[1]), 'looser'], [setOf(FLIP[tight[0]], tight[1]), 'direction'], [setOf(TOG[tight[0]], tight[1]), 'open-closed']];
    hintTxt = 'Нужны числа, которые подходят к обоим условиям сразу. Берём более строгое: ' + ineq(tight[0], tight[1]) + '.';
    rowsInfo = [[o1, p], [o2, q]];
  }
  var solv = [];
  var rows = rowsInfo.map(function (e) {
    if (!disguise) return ineq(e[0], e[1]);
    var a = rnd(0, 1) ? rnd(2, 4) : -rnd(2, 4), b = rnd(-6, 6), rhs = a * e[1] + b, o = a > 0 ? e[0] : FLIP[e[0]];
    solv.push(lin(a, b) + ' ' + SYM[o] + ' ' + f(rhs) + ' даёт ' + ineq(e[0], e[1]) + (a < 0 ? ' (делили на отрицательное, знак поменялся)' : ''));
    return lin(a, b) + ' ' + SYM[o] + ' ' + f(rhs);
  });
  if (disguise) hintTxt = 'Решаем каждое неравенство отдельно: ' + solv.join('; ') + '. ' + hintTxt;
  return { rows: rows, set: set, wrongs: wrongs, hint: hintTxt };
}
function genSys(disguise) {
  var S = buildSystem(disguise), r = pickPics(S.set, S.wrongs);
  return { q: '<p>Выбери рисунок, на котором показано решение системы неравенств:</p>' + sys(S.rows), input: r.input, ans: r.ans, hint: S.hint };
}
function gen9() { return genSys(false); }
function gen10() { return genSys(true); }
function gen11() {
  var p, q, op = pickOp();
  do { p = rnd(-7, 5); q = rnd(-5, 8); } while (q - p < 2);
  var correct = quadSet(p, q, op), mir = quadSet(-q, -p, op);
  var r = pickPics(correct, [[quadSet(p, q, FLIP[op]), 'swap-sides'], [toggleOpen(correct), 'open-closed'], [mir, 'sign-boundary']]);
  return { q: '<p>Выбери рисунок, на котором показано решение неравенства:</p>' + fx(fac(p) + fac(q) + ' ' + SYM[op] + ' 0'), input: r.input, ans: r.ans,
    hint: 'Корни: ' + f(p) + ' и ' + f(q) + ' (в каждой скобке число с противоположным знаком). Знак ' + SYM[op] + ': ' + (dirRight(op) ? 'произведение положительно вне корней, это два луча' : 'произведение отрицательно между корнями, это промежуток') + '. ' + (strict(op) ? 'Точки пустые.' : 'Точки закрашены.') };
}
function gen12() {
  var op = pickOp(), m = rnd(2, 9), c = m * m, t = rnd(0, 1);
  var correct = quadSet(-m, m, op);
  var r = pickPics(correct, [[quadSet(-m, m, FLIP[op]), 'swap-sides'], [setOf(op, m), 'lost-root'], [toggleOpen(correct), 'open-closed']]);
  return { q: '<p>Выбери рисунок, на котором показано решение неравенства:</p>' + fx(t === 0 ? 'x² ' + SYM[op] + ' ' + c : 'x² − ' + c + ' ' + SYM[op] + ' 0'), input: r.input, ans: r.ans,
    hint: 'Граничные числа: x² = ' + c + ', значит, x = ' + m + ' и x = −' + m + ' (два корня). Знак ' + SYM[op] + ': ' + (dirRight(op) ? 'два луча, вне корней' : 'промежуток между корнями') + '. ' + (strict(op) ? 'Точки пустые.' : 'Точки закрашены.') };
}
function gen13() { return pick([gen7, gen8, gen10, gen10, gen11, gen12])(); }

/* ---------- ступени ---------- */
var STEPS = [
  { id: 1, title: 'Числовая прямая', sub: 'Правее значит больше', gen: gen1, teach: [
    { t: '<p>Все числа можно расставить на прямой. Справа от нуля стоят положительные числа, слева отрицательные.</p>', v: nl([], [-3, -2, -1, 0, 1, 2, 3]) },
    { t: '<p>Чем правее стоит число, тем оно <span class="key">больше</span>. Чем левее, тем меньше.</p>' + fx('2 &gt; −3') + '<p>Число 2 стоит правее, чем −3.</p>', v: nl([], [-3, 2]) },
    { t: '<p>У отрицательных чисел наоборот: чем дальше от нуля, тем число <span class="key">меньше</span>.</p>' + fx('−1 &gt; −5') + '<p>Число −1 стоит правее, потому что оно ближе к нулю.</p>', v: nl([], [-5, -1]) },
    { t: '<p>Какое число больше: −4 или −7?</p>', v: '', ask: ask('Выбери число', [['-4', '−4'], ['-7', '−7']], '-4', 'Верно. Число −4 ближе к нулю и стоит правее.', 'Нет. Число −4 ближе к нулю, оно стоит правее, значит, оно больше.') }
  ] },
  { id: 2, title: 'Знаки неравенства', sub: 'Больше, меньше, не больше, не меньше', gen: gen2, teach: [
    { t: '<p>Знак «больше» и знак «меньше» острым концом смотрят на меньшее число.</p>' + fx('3 &lt; 5') + fx('5 &gt; 3'), v: '' },
    { t: '<p>Знаки <span class="key">≥</span> и <span class="key">≤</span> называют нестрогими: число может быть равно границе.</p>' + fx('x ≥ 4') + '<p>Читаем: «x больше или равен 4». Подходят 4, 5, 6 и дальше.</p>', v: '' },
    { t: '<p>Слова нужно уметь переводить в знаки.</p>' + fx('не меньше 7:  x ≥ 7') + fx('не больше 7:  x ≤ 7'), v: '' },
    { t: '<p>Как записать «x не больше 2»?</p>', v: '', ask: ask('Выбери запись', [['<', 'x &lt; 2'], ['<=', 'x ≤ 2'], ['>=', 'x ≥ 2']], '<=', 'Верно. «Не больше» значит «меньше или равно».', 'Нет. «Не больше 2» значит «меньше или равно 2»: x ≤ 2.') }
  ] },
  { id: 3, title: 'Точка и луч', sub: 'Пустая или закрашенная точка', gen: gen3, teach: [
    { t: '<p>Решение неравенства показывают на числовой прямой. Для x &gt; 2 подходят все числа правее двойки, их выделяют лучом.</p>' + fx('x &gt; 2'), v: nl(setOf('>', 2)) },
    { t: '<p>Само число 2 в ответ не входит, поэтому точку делают <span class="key">пустой</span>.</p><p>Для x ≥ 2 число 2 подходит, поэтому точка <span class="key">закрашена</span>.</p>' + fx('x ≥ 2'), v: nl(setOf('>=', 2)) },
    { t: '<p>Знак «меньше» ведёт луч влево.</p>' + fx('x &lt; 2'), v: nl(setOf('<', 2)) },
    { t: '<p>Какая точка на рисунке для неравенства x ≤ −1?</p>', v: '', ask: ask('Выбери', [['full', 'Закрашенная'], ['empty', 'Пустая']], 'full', 'Верно. Знак нестрогий, число −1 подходит, точка закрашена.', 'Нет. Знак ≤ нестрогий, число −1 подходит, поэтому точка закрашена.') }
  ] },
  { id: 4, title: 'Читаем рисунок', sub: 'От рисунка к неравенству', gen: gen4, teach: [
    { t: '<p>Теперь наоборот: по рисунку записываем неравенство. Смотрим на три вещи: число, куда идёт луч, какая точка.</p>', v: '' },
    { t: '<p>Число 3. Луч идёт влево, значит, знак «меньше». Точка закрашена, значит, знак нестрогий.</p>' + fx('x ≤ 3'), v: nl(setOf('<=', 3)) },
    { t: '<p>Число −2. Луч идёт вправо, знак «больше». Точка пустая, знак строгий.</p>' + fx('x &gt; −2'), v: nl(setOf('>', -2)) },
    { t: '<p>Какое неравенство показано на рисунке?</p>', v: nl(setOf('>=', 1)), ask: ask('Выбери', [['>1', 'x &gt; 1'], ['>=1', 'x ≥ 1'], ['<=1', 'x ≤ 1']], '>=1', 'Верно. Луч вправо, точка закрашена.', 'Нет. Луч идёт вправо, а точка закрашена: x ≥ 1.') }
  ] },
  { id: 5, title: 'Перенос числа', sub: 'x плюс число, x минус число', gen: gen5, teach: [
    { t: '<p>Неравенство решают почти как уравнение: число переносим в другую часть, и его знак меняется на противоположный.</p>' + fx('x + 3 &gt; 5') + fx('x &gt; 5 − 3') + fx('x &gt; 2'), v: '' },
    { t: '<p>Знак самого неравенства при переносе <span class="key">не меняется</span>.</p>' + fx('x − 4 ≤ 1') + fx('x ≤ 1 + 4') + fx('x ≤ 5'), v: '' },
    { t: '<p>Можно проверить ответ. Для x &gt; 2 возьмём число 3: 3 + 3 = 6, и 6 &gt; 5. Верно.</p>', v: '' },
    { t: '<p>Реши неравенство x + 6 &gt; 2.</p>', v: '', ask: ask('Выбери ответ', [['>-4', 'x &gt; −4'], ['>8', 'x &gt; 8'], ['<-4', 'x &lt; −4']], '>-4', 'Верно. x &gt; 2 − 6, то есть x &gt; −4.', 'Нет. Число 6 переносим со знаком минус: x &gt; 2 − 6 = −4.') }
  ] },
  { id: 6, title: 'Делим на положительное', sub: '3x больше 12', gen: gen6, teach: [
    { t: '<p>Если перед x стоит число, делим на него обе части неравенства.</p>' + fx('3x &gt; 12') + fx('x &gt; 12 : 3') + fx('x &gt; 4') + '<p>Делим на положительное число, знак остаётся тот же.</p>', v: nl(setOf('>', 4)) },
    { t: '<p>Граница это число справа, делённое на число при x.</p>' + fx('2x ≤ −6') + fx('x ≤ −3'), v: nl(setOf('<=', -3)) },
    { t: '<p>Реши неравенство 5x &lt; 20.</p>', v: '', ask: ask('Выбери ответ', [['<4', 'x &lt; 4'], ['<100', 'x &lt; 100'], ['>4', 'x &gt; 4']], '<4', 'Верно. 20 : 5 = 4, знак остаётся.', 'Нет. Делим 20 на 5, получаем 4. Число 5 положительное, знак не меняется: x &lt; 4.') }
  ] },
  { id: 7, title: 'Делим на отрицательное', sub: 'Знак меняется', gen: gen7, teach: [
    { t: '<p>Проверим на числах. Верно, что 2 &lt; 5. Умножим обе части на −1.</p>' + fx('2 &lt; 5') + fx('−2 &gt; −5') + '<p>Знак стал обратным.</p>', v: nl([], [-5, -2, 2, 5]) },
    { t: '<p><span class="key">Правило.</span> Если делим или умножаем обе части на <span class="key">отрицательное</span> число, знак неравенства меняется на противоположный.</p>', v: '' },
    { t: '<p>Пример.</p>' + fx('−3x &gt; 12') + fx('x &lt; 12 : (−3)') + fx('x &lt; −4'), v: nl(setOf('<', -4)) },
    { t: '<p>Реши неравенство −2x ≥ 8.</p>', v: '', ask: ask('Выбери ответ', [['<=-4', 'x ≤ −4'], ['>=-4', 'x ≥ −4'], ['<=4', 'x ≤ 4']], '<=-4', 'Верно. 8 : (−2) = −4, и знак поменялся.', 'Нет. 8 : (−2) = −4, а число −2 отрицательное, значит, знак меняется: x ≤ −4.') }
  ] },
  { id: 8, title: 'x в обеих частях', sub: 'Собираем x слева', gen: gen8, teach: [
    { t: '<p>Слагаемые с x переносим влево, числа вправо. У перенесённых слагаемых знак меняем.</p>' + fx('5x − 3 ≥ 2x + 6') + fx('5x − 2x ≥ 6 + 3') + fx('3x ≥ 9') + fx('x ≥ 3'), v: nl(setOf('>=', 3)) },
    { t: '<p>Если после переноса перед x получилось отрицательное число, знак меняется.</p>' + fx('2x + 1 &gt; 5x − 8') + fx('2x − 5x &gt; −8 − 1') + fx('−3x &gt; −9') + fx('x &lt; 3'), v: nl(setOf('<', 3)) },
    { t: '<p>Реши неравенство 4x − 1 &lt; 2x + 7.</p>', v: '', ask: ask('Выбери ответ', [['<4', 'x &lt; 4'], ['<3', 'x &lt; 3'], ['>4', 'x &gt; 4']], '<4', 'Верно. 2x &lt; 8, значит, x &lt; 4.', 'Нет. 4x − 2x &lt; 7 + 1, то есть 2x &lt; 8, и x &lt; 4.') }
  ] },
  { id: 9, title: 'Два условия сразу', sub: 'Общая часть', gen: gen9, teach: [
    { t: '<p>Фигурная скобка в системе значит «и то, и другое сразу». Решение системы: числа, которые подходят к обоим неравенствам.</p>' + sys(['x &gt; 2', 'x &lt; 7']), v: '' },
    { t: '<p>Правее 2 и одновременно левее 7: числа между ними. Точки пустые, потому что знаки строгие.</p>', v: nl([I(2, 7, true, true)]) },
    { t: '<p>Если оба луча идут в одну сторону, подходит более строгое условие.</p>' + sys(['x &gt; 2', 'x &gt; 5']) + '<p>Числа правее 5 подходят и к первому условию.</p>', v: nl(setOf('>', 5)) },
    { t: '<p>Что получится в системе?</p>' + sys(['x ≥ 1', 'x &lt; 4']), v: '', ask: ask('Выбери', [['seg', 'Промежуток от 1 до 4, точка 1 закрашена, точка 4 пустая'], ['out', 'Два луча: левее 1 и правее 4'], ['ray', 'Луч правее 1']], 'seg', 'Верно. Числа не меньше 1 и меньше 4.', 'Нет. Нужны числа, которые подходят к обоим условиям: не меньше 1 и меньше 4. Это промежуток от 1 до 4.') }
  ] },
  { id: 10, title: 'Система неравенств', sub: 'Решаем каждое и берём общую часть', gen: gen10, teach: [
    { t: '<p>Каждое неравенство системы решаем отдельно, как раньше. Потом берём общую часть.</p>' + sys(['x + 2 &gt; 5', '2x ≤ 14']) + fx('x &gt; 3') + fx('x ≤ 7'), v: nl([I(3, 7, true, false)]) },
    { t: '<p>Следи за знаком, если делишь на отрицательное число.</p>' + sys(['−x &lt; 2', 'x − 1 ≤ 4']) + fx('x &gt; −2') + fx('x ≤ 5'), v: nl([I(-2, 5, true, false)]) },
    { t: '<p>Реши систему и выбери, что получилось.</p>' + sys(['3x ≥ 6', 'x − 4 &lt; 1']), v: '', ask: ask('Выбери', [['a', 'x ≥ 2 и x &lt; 5'], ['b', 'x ≤ 2 и x &lt; 5'], ['c', 'x ≥ 2 и x &gt; 5']], 'a', 'Верно. 3x ≥ 6 даёт x ≥ 2, а x − 4 &lt; 1 даёт x &lt; 5.', 'Нет. 3x ≥ 6 даёт x ≥ 2 (делим на 3), а x − 4 &lt; 1 даёт x &lt; 5.') }
  ] },
  { id: 11, title: 'Произведение скобок', sub: 'Корни и знаки', gen: gen11, teach: [
    { t: '<p>Сначала находим числа, при которых скобки равны нулю, это <span class="key">корни</span>.</p>' + fx('(x − 3)(x + 2) &gt; 0') + '<p>Из x − 3 = 0 получаем 3. Из x + 2 = 0 получаем −2.</p>', v: nl([], [-2, 3]) },
    { t: '<p>Знак «больше»: произведение положительно <span class="key">вне</span> корней. Это два луча.</p>' + fx('x &lt; −2  или  x &gt; 3'), v: nl([I(null, -2, false, true), I(3, null, true, false)]) },
    { t: '<p>Знак «меньше»: произведение отрицательно <span class="key">между</span> корнями.</p>' + fx('(x − 3)(x + 2) &lt; 0') + fx('−2 &lt; x &lt; 3') + '<p>Проверка числом 0: (0 − 3)(0 + 2) = −6, это меньше нуля. Число 0 лежит между корнями, всё сходится.</p>', v: nl([I(-2, 3, true, true)]) },
    { t: '<p>Где решение неравенства (x − 1)(x − 5) &lt; 0?</p>', v: '', ask: ask('Выбери', [['between', 'Между числами 1 и 5'], ['outside', 'Левее 1 и правее 5']], 'between', 'Верно. Знак «меньше»: между корнями.', 'Нет. Знак «меньше» даёт промежуток между корнями 1 и 5. Проверь число 3: (3 − 1)(3 − 5) = −4, меньше нуля.') }
  ] },
  { id: 12, title: 'x² и число', sub: 'x² больше 9', gen: gen12, teach: [
    { t: '<p>Неравенство x² &gt; 9 перепишем: x² − 9 &gt; 0, то есть (x − 3)(x + 3) &gt; 0. Корней два: 3 и −3.</p>', v: nl([], [-3, 3]) },
    { t: '<p>Знак «больше»: вне корней, два луча.</p>' + fx('x &lt; −3  или  x &gt; 3'), v: nl([I(null, -3, false, true), I(3, null, true, false)]) },
    { t: '<p>Знак «меньше»: между корнями.</p>' + fx('x² &lt; 9') + fx('−3 &lt; x &lt; 3') + '<p><b>Частая ошибка:</b> записать только 3 и забыть второй корень −3.</p>', v: nl([I(-3, 3, true, true)]) },
    { t: '<p>Сколько граничных чисел у неравенства x² &lt; 16?</p>', v: '', ask: ask('Выбери', [['2', 'Два: 4 и −4'], ['1', 'Одно: 4']], '2', 'Верно. Числа 4 и −4 оба дают в квадрате 16.', 'Нет. И 4, и −4 в квадрате дают 16, граничных чисел два.') }
  ] },
  { id: 13, title: 'Все виды вместе', sub: 'Как в ОГЭ', gen: gen13, teach: [
    { t: '<p>Порядок работы в №13:</p><p>1. Реши неравенство или каждое неравенство системы.</p><p>2. Найди граничные числа.</p><p>3. Определи, куда идёт луч и какие точки: пустые или закрашенные.</p><p>4. Выбери рисунок и проверь его числом из ответа.</p>', v: '' },
    { t: '<p>Если делили на отрицательное число, что нужно сделать со знаком неравенства?</p>', v: '', ask: ask('Выбери', [['flip', 'Поменять на противоположный'], ['keep', 'Оставить как был']], 'flip', 'Верно. Это самая частая ошибка в №13.', 'Нет. При делении на отрицательное число знак неравенства меняется на противоположный.') }
  ] }
];

var TAGMSG = {
  'neg-abs': 'У отрицательных чисел наоборот: чем дальше от нуля влево, тем число меньше. Правее стоит то, которое ближе к нулю.',
  'compare': 'Правее на прямой стоит большее число, левее меньшее.',
  'strict-nonstrict': 'Сторона выбрана верно, но не учтено, строгий знак или нет. «Не меньше» и «не больше» включают само число: знаки ≥ и ≤.',
  'direction': 'Направление перепутано. Знак «больше» ведёт вправо, знак «меньше» ведёт влево.',
  'open-closed': 'Проверь точку. Строгий знак (больше, меньше): точка пустая. Нестрогий знак (≥, ≤): точка закрашена, число входит в ответ.',
  'both': 'Перепутаны и направление, и тип точки. Сначала определи направление, потом строгость.',
  'sign-transfer': 'При переносе числа через знак неравенства его знак меняется на противоположный: было плюс, стало минус.',
  'forgot-divide': 'Нужно разделить число справа на число при x. Граница получается делением.',
  'no-flip': 'При делении на отрицательное число знак неравенства меняется на противоположный.',
  'sign-boundary': 'Проверь знак границы. Отрицательное число, делённое на положительное, даёт отрицательное, и так далее по правилу знаков.',
  'no-flip-sign': 'Здесь две ошибки: не поменялся знак неравенства при делении на отрицательное и перепутан знак границы.',
  'swap-sides': 'Произведение положительно (знак «больше») вне корней и отрицательно (знак «меньше») между корнями.',
  'one-condition': 'В системе должны выполняться оба неравенства сразу, а на рисунке учтено только одно.',
  'looser': 'Должны выполняться оба условия, поэтому берём более строгое: правее для «больше», левее для «меньше».',
  'lost-root': 'У x² = m² два корня: m и −m. На рисунке должны быть обе точки.',
  'outside-between': 'Эти два луча показывают числа вне границ, а система требует числа между границами.'
};

var api = { STEPS: STEPS, rnd: rnd };
root.TRAINER = {
  title: 'Неравенства: ОГЭ №13', shortTitle: 'Неравенства', key: 'neravenstva13_trainer_v1',
  sheetUrl: 'https://script.google.com/macros/s/AKfycbyJKYatO3xdOpYJ1WZzszbxqMnOWZ30lsfr5HH7Y23svvX6iqjNNbIUR-RCUeZ8pB15/exec',
  needDefault: 7, needEarly: 5, earlyUpto: 3, tagMsg: TAGMSG, api: api,
  board: ['x > 3', 'x ≤ −2', '−3x > 6', 'x < −2', '(x − 1)(x + 4) < 0', 'x² ≥ 9', '2x + 1 > 5x − 8', '−3 < x < 3', '5 − 2x ≥ 1', 'x ≥ 4', 'x² − 9 > 0', 'x < 12 : (−3)']
};
if (typeof module !== 'undefined' && module.exports) module.exports = root.TRAINER;
})(typeof window !== 'undefined' ? window : globalThis);
