/* Содержание тренажёра «Квадратный трёхчлен и его корни» (8 класс): 8 ступеней. Движок: tren/staged.js */
(function (root) {
'use strict';
function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function pick(a) { return a[rnd(0, a.length - 1)]; }
function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = rnd(0, i), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function fr(n, d) { return '<span class="fr"><span class="t">' + n + '</span><span class="b">' + d + '</span></span>'; }
function mx(w, n, d) { return '<span class="mx">' + w + '</span>' + fr(n, d); }
function fx(h) { return '<span class="fx">' + h + '</span>'; }
function nw(h) { return '<span class="nw">' + h + '</span>'; }
/* корень одним знаком: галочка и черта над подкоренным выражением соединены */
function sq(h) { return '<span class="rd"><svg viewBox="0 0 10 24" preserveAspectRatio="none"><path d="M0 14 L3 12 L6.5 23 L10 1" /></svg><span class="rdi">' + h + '</span></span>'; }
if (typeof document !== 'undefined' && !document.getElementById('rd-style')) {
  var st = document.createElement('style'); st.id = 'rd-style';
  st.textContent = '.rd{display:inline-flex;align-items:stretch;vertical-align:middle;white-space:nowrap}.rd svg{width:.62em;flex:none;overflow:visible}.rd path{fill:none;stroke:currentColor;stroke-width:2;vector-effect:non-scaling-stroke;stroke-linejoin:round}.rdi{border-top:2px solid currentColor;padding:1px 3px 0 2px;line-height:1.25}';
  document.head.appendChild(st);
}
function choice(list, shuf) {
  var o = list.map(function (a) { return { v: String(a[0]), html: a[1], tag: a[2] || '' }; });
  return { type: 'choice', options: shuf === false ? o : shuffle(o) };
}
function rows() { return { type: 'rows', rows: Array.prototype.slice.call(arguments) }; }
function I(l, k) { return { label: l, kind: 'int', key: k, neg: true }; }
function N(v) { return v < 0 ? '−' + (-v) : String(v); }
function B(v) { return v < 0 ? '(−' + (-v) + ')' : String(v); }
var X2 = 'x<sup>2</sup>';
/* многочлен из членов [коэффициент, буква] в заданном порядке */
function terms(list) {
  var out = '';
  list.forEach(function (t) {
    var k = t[0], s = t[1]; if (k === 0) return;
    var ab = Math.abs(k), co = (ab === 1 && s) ? '' : String(ab);
    out += out === '' ? (k < 0 ? '−' : '') + co + s : (k < 0 ? ' − ' : ' + ') + co + s;
  });
  return out || '0';
}
function P(a, b, c) { return nw(terms([[a, X2], [b, 'x'], [c, '']])); }
function nz(lo, hi) { var v; do { v = rnd(lo, hi); } while (v === 0); return v; }
function fac(p) { return p === 0 ? 'x' : p > 0 ? '(x − ' + p + ')' : '(x + ' + (-p) + ')'; }
function aPref(a) { return a === 1 ? '' : a === -1 ? '−' : String(a).replace('-', '−'); }
function rootsHint(a, b, c) {
  var D = b * b - 4 * a * c, s = Math.round(Math.sqrt(D));
  var x1 = (-b - s) / (2 * a), x2 = (-b + s) / (2 * a);
  return 'a = ' + N(a) + ', b = ' + N(b) + ', c = ' + N(c) + '. ' + nw('D = ' + B(b) + '² − 4 · ' + B(a) + ' · ' + B(c) + ' = ' + N(D)) + ', ' + nw(sq(N(D)) + ' = ' + s) + '. ' +
    nw('x = ' + fr(N(-b) + ' ± ' + s, N(2 * a))) + ', значит x = ' + N(Math.min(x1, x2)) + ' и x = ' + N(Math.max(x1, x2)) + '.';
}

/* ---------- генераторы ---------- */
function gen1() {
  var a = nz(-6, 6), b = rnd(-9, 9), c = rnd(-9, 9), t = rnd(0, 2);
  var list = [[a, X2], [b, 'x'], [c, '']];
  if (t === 1) list = [[c, ''], [b, 'x'], [a, X2]];
  if (t === 2) list = [[b, 'x'], [a, X2], [c, '']];
  if (list[0][0] === 0) list = [[a, X2], [b, 'x'], [c, '']];
  return { q: '<p>Назови коэффициенты квадратного трёхчлена</p>' + fx(terms(list)) + '<p>Если какого-то члена нет, его коэффициент равен 0.</p>',
    input: rows(I('a =', 'a'), I('b =', 'b'), I('c =', 'c')),
    check: function (v) { return v.a === a && v.b === b && v.c === c ? 'ok' : 'wrong'; },
    tag: function (v) {
      if ((v.a === -a && a !== 0) || (v.b === -b && b !== 0) || (v.c === -c && c !== 0)) return 'coef-sign';
      if (v.a !== a && (v.a === b || v.a === c)) return 'coef-order';
      if ((b === 0 && v.b !== 0) || (c === 0 && v.c !== 0) || Math.abs(a) === 1 && v.a === 0) return 'coef-missing';
      return '';
    },
    sol: { a: a, b: b, c: c },
    hint: 'a — число перед x², b — число перед x, c — число без x. Знак берём вместе с числом. Порядок записи не важен. Здесь a = ' + N(a) + ', b = ' + N(b) + ', c = ' + N(c) + '.' };
}

function gen2() {
  var a = pick([1, -1, 2, -2, 3]), b = rnd(-6, 6), c = rnd(-9, 9), x = nz(-3, 3), v = a * x * x + b * x + c;
  var wrongSq = -a * x * x + b * x + c;
  return { q: '<p>Найди значение трёхчлена ' + P(a, b, c) + ' при x = ' + N(x) + '.</p>', input: rows(I('Значение', 'v')),
    check: function (u) { return u.v === v ? 'ok' : 'wrong'; },
    tag: function (u) { return x < 0 && u.v === wrongSq && wrongSq !== v ? 'sq-sign' : ''; },
    sol: { v: v },
    hint: 'Подставляем x = ' + N(x) + ' вместо каждого x, отрицательное число берём в скобки: ' +
      nw(N(a) + ' · ' + B(x) + '² + ' + B(b) + ' · ' + B(x) + ' + ' + B(c)) + ' = ' + nw(N(a * x * x) + ' + ' + B(b * x) + ' + ' + B(c)) + ' = ' + N(v) + '. Квадрат любого числа не отрицательный: ' + nw(B(x) + '² = ' + (x * x)) + '.' };
}

function gen3() {
  var p, q; do { p = rnd(-6, 6); q = rnd(-6, 6); } while (p === q);
  var b = -(p + q), c = p * q, yes = Math.random() < 0.5, k;
  if (yes) k = pick([p, q]); else { do { k = pick([-p, -q, p + 1, q - 1, p + q, rnd(-6, 6)]); } while (k === p || k === q); }
  var v = k * k + b * k + c;
  return { q: '<p>Является ли число ' + N(k) + ' корнем трёхчлена ' + P(1, b, c) + '?</p>', input: choice([['y', 'Да, является', 'root-def'], ['n', 'Нет, не является', 'root-def']], false), ans: yes ? 'y' : 'n',
    hint: 'Подставим x = ' + N(k) + ': ' + nw(B(k) + '² + ' + B(b) + ' · ' + B(k) + ' + ' + B(c) + ' = ' + N(v)) + '. ' + (v === 0 ? 'Получился 0, значит, число ' + N(k) + ' — корень.' : 'Получился не 0, значит, число ' + N(k) + ' не корень.') };
}

function gen4() {
  var a, b, c, D; do { a = nz(-4, 4); b = rnd(-9, 9); c = nz(-9, 9); D = b * b - 4 * a * c; } while (Math.abs(D) > 999);
  return { q: '<p>Найди дискриминант трёхчлена ' + P(a, b, c) + '.</p>', input: rows(I('D =', 'd')),
    check: function (u) { return u.d === D ? 'ok' : 'wrong'; },
    tag: function (u) { if (u.d === b * b + 4 * a * c) return 'd-sign'; if (u.d === -b * b - 4 * a * c && b !== 0) return 'b2-neg'; if (u.d === b - 4 * a * c || u.d === 2 * b - 4 * a * c) return 'b2-calc'; return ''; },
    sol: { d: D },
    hint: 'a = ' + N(a) + ', b = ' + N(b) + ', c = ' + N(c) + '. ' + nw('D = b² − 4ac') + ' = ' + nw(B(b) + '² − 4 · ' + B(a) + ' · ' + B(c)) + ' = ' + nw((b * b) + ' − ' + B(4 * a * c)) + ' = ' + N(D) + '.' };
}

function gen5() {
  var t = rnd(0, 2), a, b, c;
  if (t === 0) { var p, q; do { p = rnd(-5, 5); q = rnd(-5, 5); } while (p === q); a = pick([1, 1, -1, 2]); b = -a * (p + q); c = a * p * q; }
  else if (t === 1) { var r = nz(-5, 5); a = pick([1, 1, -1, 4]); b = -2 * a * r; c = a * r * r; if (a === 4) { b = pick([4, -4, 12, -12]); c = b * b / 16; } }
  else { do { a = nz(-3, 3); b = rnd(-6, 6); c = nz(-9, 9); } while (b * b - 4 * a * c >= 0); }
  var D = b * b - 4 * a * c, ans = D > 0 ? '2' : D === 0 ? '1' : '0';
  return { q: '<p>Сколько корней имеет квадратный трёхчлен ' + P(a, b, c) + '?</p>', input: choice([['2', 'Два корня', 'd-count'], ['1', 'Один корень', 'd-count'], ['0', 'Нет корней', 'd-count']], false), ans: ans,
    hint: nw('D = ' + B(b) + '² − 4 · ' + B(a) + ' · ' + B(c) + ' = ' + N(D)) + '. ' + (D > 0 ? 'D > 0, значит, два корня.' : D === 0 ? 'D = 0, значит, один корень.' : 'D < 0, значит, корней нет.') };
}

function rootsTask(a, p, q) {
  var b = -a * (p + q), c = a * p * q, lo = Math.min(p, q), hi = Math.max(p, q);
  return { q: '<p>Найди корни квадратного трёхчлена ' + P(a, b, c) + '. Меньший корень запиши первым.</p>', input: rows(I('x₁ =', 'x1'), I('x₂ =', 'x2')),
    check: function (v) { return (v.x1 === lo && v.x2 === hi) || (v.x1 === hi && v.x2 === lo) ? 'ok' : 'wrong'; },
    tag: function (v) { var s = [v.x1, v.x2].sort(function (m, n) { return m - n; }); if (s[0] === -hi && s[1] === -lo && lo !== -hi) return 'root-sign'; if ((v.x1 === lo || v.x1 === hi || v.x2 === lo || v.x2 === hi) && a !== 1) return 'one-root'; return ''; },
    sol: { x1: lo, x2: hi }, hint: rootsHint(a, b, c) };
}
function gen6() { var p, q; do { p = rnd(-8, 8); q = rnd(-8, 8); } while (p === q); return rootsTask(1, p, q); }
function gen7() { var a = pick([2, 3, -1, -2, 4, 5, -3]), p, q; do { p = rnd(-5, 5); q = rnd(-5, 5); } while (p === q || Math.abs(a * (p + q)) > 30); return rootsTask(a, p, q); }

function gen8() {
  var a = pick([1, 1, 2, 3, -1, -2]), p, q; do { p = rnd(-6, 6); q = rnd(-6, 6); } while (p === q);
  if (p > q) { var t = p; p = q; q = t; }
  var b = -a * (p + q), c = a * p * q, A = aPref(a), seen = {}, list = [];
  function add(v, h, tag) { var k = h.replace(/<[^>]+>/g, ''); if (seen[k]) return; seen[k] = 1; list.push([v, nw(h), tag]); }
  add('ok', A + fac(p) + fac(q), '');
  add('s', A + fac(-p) + fac(-q), 'factor-sign');
  if (a !== 1) add('a', fac(p) + fac(q), 'lost-a');
  add('m', A + fac(-p) + fac(q), 'factor-sign');
  add('m2', A + fac(p) + fac(-q), 'factor-sign');
  if (list.length < 3) return gen8();
  var keep = [list[0]].concat(shuffle(list.slice(1)).slice(0, 3));
  return { q: '<p>Разложи на множители квадратный трёхчлен ' + P(a, b, c) + '.</p>', input: choice(keep), ans: 'ok',
    hint: 'Корни трёхчлена: x₁ = ' + N(p) + ', x₂ = ' + N(q) + '. ' + nw('ax² + bx + c = a(x − x₁)(x − x₂)') + ', a = ' + N(a) + '. Получается ' + nw(A + fac(p) + fac(q)) + '. Проверь: при x = ' + N(p) + ' скобка ' + fac(p) + ' равна нулю.' };
}

/* ---------- ступени ---------- */
function ask(q, opts, ans, ok, no) { return { q: q, opts: opts, ans: ans, ok: ok, no: no }; }
var STEPS = [
  { id: 1, title: 'Что такое квадратный трёхчлен', sub: 'Коэффициенты a, b, c', gen: gen1, teach: [
    { t: '<p><span class="key">Квадратным трёхчленом</span> называется многочлен вида</p>' + fx('a' + X2 + ' + bx + c') + '<p>где x — переменная, a, b и c — некоторые числа, причём a ≠ 0.</p>', v: '' },
    { t: '<p>Число a — <span class="key">старший коэффициент</span> (стоит перед x²), b — <span class="key">второй коэффициент</span> (перед x), c — <span class="key">свободный член</span> (число без x).</p>' + fx(P(2, -5, 3)) + '<p>Здесь a = 2, b = −5, c = 3. Знак минус берём вместе с числом.</p>', v: '' },
    { t: '<p>Если перед x² или x число не написано, там стоит 1. Если члена нет, коэффициент равен 0.</p>' + fx(nw('x<sup>2</sup> − 7')) + '<p>Здесь a = 1, b = 0, c = −7.</p>', v: '' },
    { t: '<p>Члены могут стоять в другом порядке. Чему равно a в трёхчлене 4 − 3x + 5x²?</p>', v: '', ask: ask('a =', [['5', '5'], ['4', '4'], ['-3', '−3']], '5', 'Верно. a — число перед x², это 5.', 'Нет. a — число перед x², а не первое число в записи. Здесь a = 5.') }
  ] },
  { id: 2, title: 'Значение трёхчлена', sub: 'Подставляем число вместо x', gen: gen2, teach: [
    { t: '<p>Найдём значение трёхчлена ' + P(1, -3, 2) + ' при x = 4. Вместо каждого x пишем 4:</p>' + fx('4² − 3 · 4 + 2 = 16 − 12 + 2 = 6'), v: '' },
    { t: '<p>Если число отрицательное, берём его в скобки. При x = −2:</p>' + fx('(−2)² − 3 · (−2) + 2') + fx('= 4 + 6 + 2 = 12'), v: '' },
    { t: '<p><b>Частая ошибка.</b> Квадрат отрицательного числа положительный: (−2)² = 4, а не −4.</p>', v: '' },
    { t: '<p>Сколько будет (−3)²?</p>', v: '', ask: ask('Ответ', [['9', '9'], ['-9', '−9'], ['-6', '−6']], '9', 'Верно. (−3) · (−3) = 9.', 'Нет. (−3)² = (−3) · (−3) = 9: минус на минус даёт плюс.') }
  ] },
  { id: 3, title: 'Корень трёхчлена', sub: 'Когда значение равно нулю', gen: gen3, teach: [
    { t: '<p><span class="key">Корнем квадратного трёхчлена</span> называется значение переменной, при котором значение этого трёхчлена равно нулю.</p>', v: '' },
    { t: '<p>Проверим, корень ли число 2 для трёхчлена ' + P(1, -5, 6) + '.</p>' + fx('2² − 5 · 2 + 6 = 4 − 10 + 6 = 0') + '<p>Получился 0, значит, 2 — корень.</p>', v: '' },
    { t: '<p>А число 1? ' + nw('1² − 5 · 1 + 6 = 2') + '. Получилось 2, а не 0, значит, 1 — не корень.</p>', v: '' },
    { t: '<p>Значение трёхчлена при x = 3 равно 0. Что это значит?</p>', v: '', ask: ask('Выбери', [['r', 'Число 3 — корень трёхчлена'], ['n', 'Трёхчлен не имеет корней']], 'r', 'Верно. Корень — то число, при котором получается 0.', 'Нет. Раз значение равно 0, число 3 и есть корень.') }
  ] },
  { id: 4, title: 'Дискриминант', sub: 'D = b² − 4ac', gen: gen4, teach: [
    { t: '<p>Корни трёхчлена ищут так же, как корни квадратного уравнения ' + nw('a' + X2 + ' + bx + c = 0') + '. Сначала находим <span class="key">дискриминант</span>:</p>' + fx('D = b² − 4ac'), v: '' },
    { t: '<p>Для ' + P(2, -5, 3) + ': a = 2, b = −5, c = 3.</p>' + fx('D = (−5)² − 4 · 2 · 3') + fx('= 25 − 24 = 1'), v: '' },
    { t: '<p><b>Частая ошибка.</b> b² всегда не меньше нуля: (−5)² = 25. А если c отрицательное, то −4ac превращается в плюс: для ' + P(1, 2, -3) + ' получаем ' + nw('D = 4 − 4 · 1 · (−3) = 4 + 12 = 16') + '.</p>', v: '' },
    { t: '<p>Найди D для ' + P(1, 4, 3) + '.</p>', v: '', ask: ask('D =', [['4', '4'], ['28', '28'], ['-8', '−8']], '4', 'Верно. 16 − 12 = 4.', 'Нет. D = 4² − 4 · 1 · 3 = 16 − 12 = 4.') }
  ] },
  { id: 5, title: 'Сколько корней', sub: 'Смотрим на знак D', gen: gen5, teach: [
    { t: '<p>Число корней зависит от знака дискриминанта.</p>' + fx('D > 0 — два корня') + fx('D = 0 — один корень') + fx('D < 0 — корней нет'), v: '' },
    { t: '<p>Трёхчлен ' + P(1, 2, 5) + ': ' + nw('D = 4 − 20 = −16') + '. D < 0, значит, корней нет: значение трёхчлена никогда не равно нулю.</p>', v: '' },
    { t: '<p>Трёхчлен ' + P(1, -6, 9) + ': ' + nw('D = 36 − 36 = 0') + '. Один корень.</p>', v: '' },
    { t: '<p>У трёхчлена получилось D = −9. Сколько у него корней?</p>', v: '', ask: ask('Выбери', [['0', 'Нет корней'], ['2', 'Два корня'], ['1', 'Один корень']], '0', 'Верно. D < 0, корней нет.', 'Нет. D отрицательный, значит, корней нет. Из отрицательного числа корень не извлекается.') }
  ] },
  { id: 6, title: 'Находим корни', sub: 'Когда a = 1', gen: gen6, teach: [
    { t: '<p>Если D ≥ 0, корни находят по формуле:</p>' + fx('x = ' + fr('−b ± ' + sq('D'), '2a')), v: '' },
    { t: '<p>Найдём корни ' + P(1, -5, 6) + '. a = 1, b = −5, c = 6.</p>' + fx('D = 25 − 24 = 1, ' + sq('1') + ' = 1') + fx('x = ' + fr('5 ± 1', '2')), v: '' },
    { t: '<p>Считаем два раза: с плюсом и с минусом.</p>' + fx('x₁ = ' + fr('5 − 1', '2') + ' = 2') + fx('x₂ = ' + fr('5 + 1', '2') + ' = 3') + '<p>Проверка: 2² − 5 · 2 + 6 = 0. Верно.</p>', v: '' },
    { t: '<p>В формуле стоит −b. Чему равно −b, если b = −5?</p>', v: '', ask: ask('−b =', [['5', '5'], ['-5', '−5']], '5', 'Верно. −(−5) = 5.', 'Нет. Минус на минус даёт плюс: −(−5) = 5.') }
  ] },
  { id: 7, title: 'Корни при a ≠ 1', sub: 'Не забываем про 2a', gen: gen7, teach: [
    { t: '<p>Найдём корни ' + P(2, -2, -12) + '. a = 2, b = −2, c = −12.</p>' + fx('D = 4 − 4 · 2 · (−12) = 4 + 96 = 100') + fx(sq('100') + ' = 10'), v: '' },
    { t: '<p>В знаменателе 2a = 2 · 2 = 4.</p>' + fx('x₁ = ' + fr('2 − 10', '4') + ' = −2') + fx('x₂ = ' + fr('2 + 10', '4') + ' = 3'), v: '' },
    { t: '<p>Если b = 0 или c = 0, можно и без дискриминанта. ' + nw('2x² − 8 = 0') + ', ' + nw('x² = 4') + ', x = −2 и x = 2. ' + nw('3x² − 6x = 3x(x − 2)') + ', корни 0 и 2.</p>', v: '' },
    { t: '<p>Чему равен знаменатель 2a для трёхчлена −3x² + x + 4?</p>', v: '', ask: ask('2a =', [['-6', '−6'], ['2', '2'], ['6', '6']], '-6', 'Верно. a = −3, 2a = −6.', 'Нет. a = −3, значит, 2a = 2 · (−3) = −6.') }
  ] },
  { id: 8, title: 'Разложение на множители', sub: 'a(x − x₁)(x − x₂)', gen: gen8, teach: [
    { t: '<p><span class="key">Теорема.</span> Если x₁ и x₂ — корни квадратного трёхчлена ' + nw('a' + X2 + ' + bx + c') + ', то</p>' + fx('a' + X2 + ' + bx + c = a(x − x₁)(x − x₂)'), v: '' },
    { t: '<p>У ' + P(2, -2, -12) + ' корни −2 и 3, a = 2.</p>' + fx('2(x − (−2))(x − 3)') + fx('= 2(x + 2)(x − 3)'), v: '' },
    { t: '<p><b>Частые ошибки.</b> Знак в скобке противоположен корню: корень −2 даёт (x + 2). Множитель a впереди терять нельзя.</p><p>Если D = 0, то ' + nw('ax² + bx + c = a(x − x₁)²') + '. Если D < 0, трёхчлен на множители не раскладывается.</p>', v: '' },
    { t: '<p>Корни трёхчлена ' + P(1, 1, -6) + ' — это −3 и 2. Как он раскладывается?</p>', v: '', ask: ask('Выбери', [['a', '(x + 3)(x − 2)'], ['b', '(x − 3)(x + 2)']], 'a', 'Верно. Корень −3 даёт скобку (x + 3).', 'Нет. x − (−3) = x + 3, а x − 2 для корня 2.') }
  ] }
];

var TAGMSG = {
  'coef-sign': 'Знак перед числом — часть коэффициента. Если перед членом стоит минус, коэффициент отрицательный.',
  'coef-order': 'Коэффициенты перепутаны: a стоит перед x², b перед x, c без x, в каком бы порядке ни были записаны члены.',
  'coef-missing': 'Если члена нет, коэффициент 0. Если перед x² или x число не написано, коэффициент 1 (или −1 при минусе).',
  'sq-sign': 'Квадрат отрицательного числа положительный: (−2)² = 4.',
  'root-def': 'Подставь число в трёхчлен. Получился 0 — это корень, не 0 — не корень.',
  'd-sign': 'В формуле D = b² − 4ac минус. Если a и c разных знаков, −4ac становится плюсом, проверь знак.',
  'b2-neg': 'b² не бывает отрицательным: (−5)² = 25.',
  'b2-calc': 'b² — это b умножить на b, а не на 2.',
  'd-count': 'Найди D: больше нуля — два корня, ноль — один, меньше нуля — корней нет.',
  'root-sign': 'В формуле стоит −b. Знаки корней получились противоположными: проверь, что взят −b, а не b.',
  'one-root': 'Один корень верный, другой нет. Проверь знаменатель 2a и второй корень подстановкой.',
  'factor-sign': 'Знак в скобке противоположен корню: корень 3 даёт (x − 3), корень −3 даёт (x + 3).',
  'lost-a': 'Перед скобками должен стоять старший коэффициент a.'
};

var api = { STEPS: STEPS, fr: fr, mx: mx, rnd: rnd };
root.TRAINER = {
  title: 'Квадратный трёхчлен и его корни', shortTitle: 'Квадратный трёхчлен', key: 'kvtrehchlen_trainer_v1',
  sheetUrl: 'https://script.google.com/macros/s/AKfycbyJKYatO3xdOpYJ1WZzszbxqMnOWZ30lsfr5HH7Y23svvX6iqjNNbIUR-RCUeZ8pB15/exec',
  needDefault: 4, needEarly: 4, earlyUpto: 3, tagMsg: TAGMSG, api: api,
  board: ['ax² + bx + c', 'D = b² − 4ac', 'a(x − x₁)(x − x₂)', 'x² − 5x + 6', 'D = 25 − 24 = 1', 'x₁ = 2, x₂ = 3', 'D > 0', 'D < 0', '2x² − 8 = 0', '(x + 2)(x − 3)', 'R[100] = 10', 'R[16] = 4']
};
if (typeof module !== 'undefined' && module.exports) module.exports = root.TRAINER;
})(typeof window !== 'undefined' ? window : globalThis);
