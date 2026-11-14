/* Содержание тренажёра «Системы уравнений второй степени, ОГЭ №20»: 8 ступеней. Движок: tren/staged.js */
(function (root) {
'use strict';
function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function pick(a) { return a[rnd(0, a.length - 1)]; }
function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = rnd(0, i), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function fr(n, d) { return '<span class="fr"><span class="t">' + n + '</span><span class="b">' + d + '</span></span>'; }
function mx(w, n, d) { return '<span class="mx">' + w + '</span>' + fr(n, d); }
function fx(h, big) { return '<span class="fx' + (big ? ' big' : '') + '">' + h + '</span>'; }
var M = '−';
function sg(n) { return n < 0 ? M + Math.abs(n) : String(n); }
function term(c, s) { if (c === 0) return ''; var a = Math.abs(c), body = (a === 1 && s) ? s : a + s; return (c > 0 ? ' + ' : ' ' + M + ' ') + body; }
function lead(c, s) { var a = Math.abs(c), body = (a === 1 && s) ? s : a + s; return (c < 0 ? M : '') + body; }
function quad(b, c) { return 'x²' + term(b, 'x') + term(c, '') + ' = 0'; }
function sys() {
  var eqs = Array.prototype.slice.call(arguments);
  return '<span style="display:inline-flex;align-items:center;gap:8px;white-space:nowrap"><span style="font-size:3.4em;line-height:1;font-weight:200">{</span><span style="display:inline-block;text-align:left;line-height:1.5">' + eqs.join('<br>') + '</span></span>';
}
function choice(list, shuf) {
  var o = list.map(function (a) { return { v: String(a[0]), html: a[1], tag: a[2] || '' }; });
  return { type: 'choice', options: shuf === false ? o : shuffle(o) };
}
function rows() { return { type: 'rows', rows: Array.prototype.slice.call(arguments) }; }
var R = { int: function (l, k) { return { label: l, kind: 'int', key: k }; } };
function ask(q, opts, ans, ok, no) { return { q: q, opts: opts, ans: ans, ok: ok, no: no }; }
function pairIn(lo, hi) { var u, v; do { u = rnd(lo, hi); v = rnd(lo, hi); } while (u === 0 || v === 0 || u === v); return [u, v]; }
function ptxt(x, y) { return '(' + sg(x) + '; ' + sg(y) + ')'; }

/* ---------- генераторы ---------- */
function gen1() {
  var a = rnd(2, 12), k = rnd(2, 4), t = rnd(0, 2), q, ans, opts;
  if (t === 0) {
    q = 'x + y = ' + a; ans = 'y = ' + a + ' ' + M + ' x';
    opts = [[ans, ans], ['y = x ' + M + ' ' + a, 'y = x ' + M + ' ' + a, 'sign'], ['y = ' + a + ' + x', 'y = ' + a + ' + x', 'sign']];
  } else if (t === 1) {
    q = 'x ' + M + ' y = ' + a; ans = 'y = x ' + M + ' ' + a;
    opts = [[ans, ans], ['y = ' + a + ' ' + M + ' x', 'y = ' + a + ' ' + M + ' x', 'sign'], ['y = x + ' + a, 'y = x + ' + a, 'sign']];
  } else {
    q = k + 'x + y = ' + a; ans = 'y = ' + a + ' ' + M + ' ' + k + 'x';
    opts = [[ans, ans], ['y = ' + a + ' ' + M + ' x', 'y = ' + a + ' ' + M + ' x', 'coef'], ['y = ' + a + ' + ' + k + 'x', 'y = ' + a + ' + ' + k + 'x', 'sign']];
  }
  return { q: '<p>Выразите y через x из уравнения:</p>' + fx(q), input: choice(opts), ans: ans,
    hint: 'Переносим слагаемое с x в другую часть: его знак меняется. ' + (t === 2 ? 'Число ' + k + ' остаётся перед x. ' : '') + 'Получается ' + ans + '.' };
}

function gen2() {
  var pq = pairIn(-7, 7), p = pq[0], q = pq[1], big = rnd(0, 1) === 0, hi = Math.max(p, q), lo = Math.min(p, q), want = big ? hi : lo, other = big ? lo : hi;
  return { q: '<p>Решите уравнение и запишите ' + (big ? 'больший' : 'меньший') + ' корень:</p>' + fx(quad(-(p + q), p * q)), input: rows(R.int('Корень', 'x')),
    check: function (v) { return v.x === want ? 'ok' : 'wrong'; }, tag: function (v) { return v.x === other ? 'other-root' : ''; },
    sol: { x: want }, hint: 'По теореме Виета сумма корней равна ' + sg(p + q) + ', а произведение ' + sg(p * q) + '. Подходят числа ' + sg(lo) + ' и ' + sg(hi) + '. ' + (big ? 'Больший' : 'Меньший') + ' из них ' + sg(want) + '.' };
}

function gen3() {
  var pq, p, q;
  do { pq = pairIn(-4, 5); p = pq[0]; q = pq[1]; } while (p + q === 0);
  var a = p + q, b = -p * q, X = Math.max(p, q), x0 = Math.min(p, q);
  return { q: '<p>Решите систему. В ответе запишите решение с большим значением x.</p>' + fx(sys('y = x²', 'y = ' + lead(a, 'x') + term(b, ''))), input: rows(R.int('x', 'x'), R.int('y', 'y')),
    check: function (v) { return v.x === X && v.y === X * X ? 'ok' : 'wrong'; },
    tag: function (v) { if (v.x === x0) return 'other-solution'; if (v.x === X) return 'y-wrong'; return ''; },
    sol: { x: X, y: X * X }, hint: 'Подставим y = x² во второе уравнение: x² = ' + lead(a, 'x') + term(b, '') + ', то есть ' + quad(-a, -b) + '. Корни ' + sg(x0) + ' и ' + sg(X) + '. Большее x = ' + sg(X) + ', тогда y = x² = ' + X * X + '.' };
}

function gen4() {
  var pq = pairIn(-7, 9), u = Math.min(pq[0], pq[1]), v = Math.max(pq[0], pq[1]), s = u + v, m = u * v;
  return { q: '<p>Решите систему. В ответе запишите решение, в котором x &lt; y.</p>' + fx(sys('x + y = ' + sg(s), 'xy = ' + sg(m))), input: rows(R.int('x', 'x'), R.int('y', 'y')),
    check: function (v1) { return v1.x === u && v1.y === v ? 'ok' : 'wrong'; }, tag: function (v1) { return v1.x === v && v1.y === u ? 'swap' : ''; },
    sol: { x: u, y: v }, hint: 'Из первого уравнения y = ' + sg(s) + ' ' + M + ' x. Подставим во второе: x(' + sg(s) + ' ' + M + ' x) = ' + sg(m) + ', то есть ' + quad(-s, m) + '. Корни ' + sg(u) + ' и ' + sg(v) + '. Условию x &lt; y подходит x = ' + sg(u) + ', y = ' + sg(v) + '.' };
}

function gen5() {
  var d, u, X, Y;
  do { d = rnd(1, 6); u = rnd(-6, 8); } while (u === 0 || u === d || 2 * u === d);
  var m = u * (u - d), s1 = [u, u - d], s2 = [d - u, -u];
  var big = s1[0] > s2[0] ? s1 : s2, small = s1[0] > s2[0] ? s2 : s1;
  return { q: '<p>Решите систему. В ответе запишите решение с большим значением x.</p>' + fx(sys('x ' + M + ' y = ' + d, 'xy = ' + sg(m))), input: rows(R.int('x', 'x'), R.int('y', 'y')),
    check: function (v) { return v.x === big[0] && v.y === big[1] ? 'ok' : 'wrong'; },
    tag: function (v) { return v.x === small[0] && v.y === small[1] ? 'other-solution' : (v.x === big[0] ? 'y-wrong' : ''); },
    sol: { x: big[0], y: big[1] }, hint: 'Из первого уравнения x = y + ' + d + '. Подставим: (y + ' + d + ')y = ' + sg(m) + ', то есть ' + quad(d, -m).replace(/x/g, 'y') + '. Корни y = ' + sg(small[1]) + ' и y = ' + sg(big[1]) + '. Тогда x = y + ' + d + ': ' + sg(small[0]) + ' и ' + sg(big[0]) + '. Решения ' + ptxt(small[0], small[1]) + ' и ' + ptxt(big[0], big[1]) + ', большее x у ' + ptxt(big[0], big[1]) + '.' };
}

function gen6() {
  var pq = pairIn(-8, 9), u = Math.min(pq[0], pq[1]), v = Math.max(pq[0], pq[1]), s = u + v, n = u * u + v * v, m = u * v;
  return { q: '<p>Решите систему. В ответе запишите решение, в котором x &lt; y.</p>' + fx(sys('x² + y² = ' + n, 'x + y = ' + sg(s))), input: rows(R.int('x', 'x'), R.int('y', 'y')),
    check: function (w) { return w.x === u && w.y === v ? 'ok' : 'wrong'; }, tag: function (w) { return w.x === v && w.y === u ? 'swap' : ''; },
    sol: { x: u, y: v }, hint: 'Из второго уравнения y = ' + sg(s) + ' ' + M + ' x. Подставим: x² + (' + sg(s) + ' ' + M + ' x)² = ' + n + '. После раскрытия скобок и приведения подобных: ' + quad(-s, m) + '. Корни ' + sg(u) + ' и ' + sg(v) + '. Условию x &lt; y подходит x = ' + sg(u) + ', y = ' + sg(v) + '.' };
}

function gen7() {
  var a = rnd(2, 9), b = rnd(1, a - 1), A = a * a + b * b, B = a * a - b * b;
  return { q: '<p>Решите систему. В ответе запишите решение, в котором x &gt; 0 и y &gt; 0.</p>' + fx(sys('x² + y² = ' + A, 'x² ' + M + ' y² = ' + B)), input: rows(R.int('x', 'x'), R.int('y', 'y')),
    check: function (v) { return v.x === a && v.y === b ? 'ok' : 'wrong'; }, tag: function (v) { return v.x === b && v.y === a ? 'swap' : ''; },
    sol: { x: a, y: b }, hint: 'Сложим уравнения: 2x² = ' + (A + B) + ', x² = ' + a * a + ', при x &gt; 0 получаем x = ' + a + '. Вычтем: 2y² = ' + (A - B) + ', y² = ' + b * b + ', при y &gt; 0 получаем y = ' + b + '.' };
}

function gen8() { return pick([gen3, gen4, gen5, gen6, gen7])(); }

/* ---------- ступени ---------- */
var STEPS = [
  { id: 1, title: 'Выразить переменную', sub: 'Первый шаг подстановки', gen: gen1, teach: [
    { t: '<p><span class="key">Системой уравнений</span> называют два уравнения с двумя неизвестными, которые нужно решить вместе. Решением системы называют пару чисел, подходящую каждому уравнению.</p>' + fx(sys('x + y = 5', 'xy = 6')), v: '<p class="small">Пара x = 2, y = 3 подходит обоим уравнениям: 2 + 3 = 5 и 2 · 3 = 6.</p>' },
    { t: '<p>Один из способов решения: <span class="key">способ подстановки</span>. Сначала из более простого уравнения выражаем одну переменную через другую.</p>' + fx('x + y = 5  →  y = 5 ' + M + ' x'), v: '<p class="small">Слагаемое x перенесли в правую часть, и его знак изменился.</p>' },
    { t: '<p>Выразите y из уравнения x ' + M + ' y = 2.</p>', v: '', ask: ask('Выберите запись', [['a', 'y = x ' + M + ' 2'], ['b', 'y = 2 ' + M + ' x'], ['c', 'y = x + 2']], 'a', 'Верно. x ' + M + ' y = 2, значит x ' + M + ' 2 = y.', 'Нет. Переносим y вправо, а 2 влево: x ' + M + ' 2 = y.') }
  ] },
  { id: 2, title: 'Квадратное уравнение', sub: 'Корни по теореме Виета', gen: gen2, teach: [
    { t: '<p>Теорема Виета: если x₁ и x₂ корни приведённого квадратного уравнения x² + px + q = 0, то их сумма равна ' + M + 'p, а произведение равно q.</p>' + fx('x₁ + x₂ = ' + M + 'p') + fx('x₁ · x₂ = q'), v: '' },
    { t: '<p>Решим x² ' + M + ' 5x + 6 = 0. Сумма корней 5, произведение 6. Подбираем два числа: 2 и 3.</p>' + fx('2 + 3 = 5,  2 · 3 = 6'), v: '<p class="small">Корни: x = 2 и x = 3. Всегда проверяйте подстановкой.</p>' },
    { t: '<p>Найдите корни уравнения x² ' + M + ' 7x + 12 = 0.</p>', v: '', ask: ask('Корни', [['a', '3 и 4'], ['b', M + '3 и ' + M + '4'], ['c', '2 и 6']], 'a', 'Верно. 3 + 4 = 7 и 3 · 4 = 12.', 'Нет. Нужна сумма 7 и произведение 12: это 3 и 4.') },
    { t: '<p><b>Внимание на знак.</b> В уравнении x² + 5x + 6 = 0 сумма корней равна ' + M + '5, поэтому корни ' + M + '2 и ' + M + '3.</p>', v: '' }
  ] },
  { id: 3, title: 'Парабола и прямая', sub: 'y = x² и линейное уравнение', gen: gen3, teach: [
    { t: '<p>Если в одном из уравнений y уже выражен, подставляем его во второе уравнение.</p>' + fx(sys('y = x²', 'y = x + 2')), v: '' },
    { t: '<p>Подставим x² вместо y: x² = x + 2. Переносим всё влево: x² ' + M + ' x ' + M + ' 2 = 0. По Виету корни 2 и ' + M + '1.</p>', v: '' },
    { t: '<p>Теперь для каждого x находим y из уравнения y = x²: если x = 2, то y = 4; если x = ' + M + '1, то y = 1. Решения: (2; 4) и (' + M + '1; 1).</p>', v: '' },
    { t: '<p>Чему равен y при x = ' + M + '3 в уравнении y = x²?</p>', v: '', ask: ask('y', [['a', '9'], ['b', M + '9'], ['c', M + '6']], 'a', 'Верно. (' + M + '3)² = 9, квадрат не бывает отрицательным.', 'Нет. (' + M + '3)² = (' + M + '3) · (' + M + '3) = 9.') }
  ] },
  { id: 4, title: 'Сумма и произведение', sub: 'x + y = s, xy = m', gen: gen4, teach: [
    { t: '<p>Решим систему:</p>' + fx(sys('x + y = 5', 'xy = 6')) + '<p>Из первого уравнения y = 5 ' + M + ' x. Подставим во второе.</p>', v: '' },
    { t: '<p>x(5 ' + M + ' x) = 6, то есть 5x ' + M + ' x² = 6, или x² ' + M + ' 5x + 6 = 0. Корни x = 2 и x = 3.</p>', v: '' },
    { t: '<p>Для каждого x находим y = 5 ' + M + ' x: при x = 2 будет y = 3, при x = 3 будет y = 2. Решения: (2; 3) и (3; 2).</p>', v: '' },
    { t: '<p>В системе x + y = 7, xy = 10 нашли x = 2. Чему равен y?</p>', v: '', ask: ask('y', [['a', '5'], ['b', '9'], ['c', '3']], 'a', 'Верно. y = 7 ' + M + ' 2 = 5, и 2 · 5 = 10.', 'Нет. y = 7 ' + M + ' x = 7 ' + M + ' 2 = 5.') }
  ] },
  { id: 5, title: 'Разность и произведение', sub: 'x ' + M + ' y = d, xy = m', gen: gen5, teach: [
    { t: '<p>Решим систему:</p>' + fx(sys('x ' + M + ' y = 1', 'xy = 6')) + '<p>Выразим x: x = y + 1. Подставим во второе уравнение.</p>', v: '' },
    { t: '<p>(y + 1)y = 6, то есть y² + y ' + M + ' 6 = 0. Корни y = 2 и y = ' + M + '3.</p>', v: '' },
    { t: '<p>Находим x = y + 1: при y = 2 будет x = 3, при y = ' + M + '3 будет x = ' + M + '2. Решения: (3; 2) и (' + M + '2; ' + M + '3).</p>', v: '<p class="small">Проверка: 3 ' + M + ' 2 = 1 и 3 · 2 = 6; ' + M + '2 ' + M + ' (' + M + '3) = 1 и (' + M + '2) · (' + M + '3) = 6.</p>' },
    { t: '<p>В системе x ' + M + ' y = 3, xy = 4 нашли y = 1. Чему равен x?</p>', v: '', ask: ask('x', [['a', '4'], ['b', '2'], ['c', M + '4']], 'a', 'Верно. x = y + 3 = 4, и 4 · 1 = 4.', 'Нет. x = y + 3 = 1 + 3 = 4.') }
  ] },
  { id: 6, title: 'Окружность и прямая', sub: 'x² + y² = n и x + y = s', gen: gen6, teach: [
    { t: '<p>Решим систему:</p>' + fx(sys('x² + y² = 25', 'x + y = 7')) + '<p>Из второго уравнения y = 7 ' + M + ' x. Подставим в первое.</p>', v: '' },
    { t: '<p>Здесь нужна формула квадрата разности:</p>' + fx('(a ' + M + ' b)² = a² ' + M + ' 2ab + b²') + '<p>Значит, (7 ' + M + ' x)² = 49 ' + M + ' 14x + x².</p>', v: '' },
    { t: '<p>x² + 49 ' + M + ' 14x + x² = 25, то есть 2x² ' + M + ' 14x + 24 = 0. Делим на 2: x² ' + M + ' 7x + 12 = 0. Корни 3 и 4, решения (3; 4) и (4; 3).</p>', v: '' },
    { t: '<p>Раскройте скобки: (5 ' + M + ' x)².</p>', v: '', ask: ask('Что получится?', [['a', '25 ' + M + ' 10x + x²'], ['b', '25 ' + M + ' x²'], ['c', '25 + x²']], 'a', 'Верно. a² ' + M + ' 2ab + b² при a = 5, b = x.', 'Нет. По формуле (a ' + M + ' b)² = a² ' + M + ' 2ab + b² получаем 25 ' + M + ' 10x + x².') }
  ] },
  { id: 7, title: 'Способ сложения', sub: 'Квадраты с разными знаками', gen: gen7, teach: [
    { t: '<p>Если в обоих уравнениях стоят x² и y², удобно складывать уравнения.</p>' + fx(sys('x² + y² = 13', 'x² ' + M + ' y² = 5')), v: '' },
    { t: '<p>Складываем левые и правые части: 2x² = 18, откуда x² = 9 и x = 3 или x = ' + M + '3.</p>', v: '' },
    { t: '<p>Вычитаем из первого уравнения второе: 2y² = 8, откуда y² = 4 и y = 2 или y = ' + M + '2. Для x и y получается четыре сочетания знаков, и все они подходят.</p>', v: '' },
    { t: '<p>Из уравнения 2x² = 50 найдите x.</p>', v: '', ask: ask('x', [['a', '5 и ' + M + '5'], ['b', '25'], ['c', '5']], 'a', 'Верно. x² = 25, значит x = 5 или x = ' + M + '5.', 'Нет. x² = 25, а x равен числу, квадрат которого 25: это 5 и ' + M + '5.') }
  ] },
  { id: 8, title: 'Все типы вместе', sub: 'Выбери способ сам', gen: gen8, teach: [
    { t: '<p>Как выбрать способ:</p><p>1) Есть линейное уравнение: выражаем одну переменную и подставляем.</p><p>2) Во всех уравнениях только x² и y²: складываем или вычитаем уравнения.</p>', v: '' },
    { t: '<p>Какой способ удобен для этой системы?</p>' + fx(sys('x² + y² = 20', 'x² ' + M + ' y² = 12')), v: '', ask: ask('Способ', [['a', 'Сложение уравнений'], ['b', 'Выразить y из первого уравнения']], 'a', 'Верно. Там только x² и y², поэтому уравнения проще сложить.', 'Нет. Здесь только x² и y², и складывать уравнения проще всего.') }
  ] }
];

var TAGMSG = {
  'sign': 'При переносе слагаемого через знак равно его знак меняется на противоположный.',
  'coef': 'Число перед x тоже переносится вместе с x: его нельзя терять.',
  'other-root': 'Это второй корень. Прочитайте условие ещё раз: нужен больший или меньший.',
  'other-solution': 'Это другое решение системы. Прочитайте условие: нужно решение с большим x.',
  'y-wrong': 'x найден верно, но y нужно найти заново подстановкой найденного x в уравнение.',
  'swap': 'Решение найдено верно, но x и y стоят не на своих местах. Проверьте условие.'
};

var api = { STEPS: STEPS, fr: fr, mx: mx, rnd: rnd };
root.TRAINER = {
  title: 'Системы уравнений второй степени, ОГЭ №20', shortTitle: 'Системы ОГЭ №20', key: 'sys20_trainer_v1',
  sheetUrl: 'https://script.google.com/macros/s/AKfycbyJKYatO3xdOpYJ1WZzszbxqMnOWZ30lsfr5HH7Y23svvX6iqjNNbIUR-RCUeZ8pB15/exec',
  needDefault: 7, needEarly: 5, earlyUpto: 3, tagMsg: TAGMSG, api: api,
  board: ['x + y = 5', 'xy = 6', 'x² − 5x + 6 = 0', 'x₁ + x₂ = −p', 'x₁ · x₂ = q', 'y = x²', '(a − b)²', 'x² + y² = 25', 'D = b² − 4ac', 'y = 7 − x', '2x² = 18', '(3; 4)']
};
})(typeof window !== 'undefined' ? window : globalThis);
if (typeof module !== 'undefined' && module.exports) module.exports = (typeof window !== 'undefined' ? window : globalThis).TRAINER;
