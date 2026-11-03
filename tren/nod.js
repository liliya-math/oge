/* Содержание тренажёра «НОД с нуля» (6 класс): 9 ступеней. Движок: tren/staged.js */
(function (root) {
'use strict';
function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function pick(a) { return a[rnd(0, a.length - 1)]; }
function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = rnd(0, i), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
function gcd3(a, b, c) { return gcd(gcd(a, b), c); }
function fr(n, d) { return '<span class="fr"><span class="t">' + n + '</span><span class="b">' + d + '</span></span>'; }
function fx(h, big) { return '<span class="fx' + (big ? ' big' : '') + '">' + h + '</span>'; }
function nw(s) { return '<span class="nw">' + s + '</span>'; }
function divs(n) { var r = []; for (var i = 1; i <= n; i++) if (n % i === 0) r.push(i); return r; }
function isPrime(n) { return n > 1 && divs(n).length === 2; }
function primes(n) { var r = [], p = 2; while (n > 1) { while (n % p === 0) { r.push(p); n /= p; } p++; } return r; }
function fact(n) { return primes(n).join(' · '); }
function choice(list, shuf) {
  var o = list.map(function (a) { return { v: String(a[0]), html: a[1], tag: a[2] || '' }; });
  return { type: 'choice', options: shuf === false ? o : shuffle(o) };
}
function rows() { return { type: 'rows', rows: Array.prototype.slice.call(arguments) }; }
var R = {
  int: function (l, k) { return { label: l, kind: 'int', key: k }; },
  frac: function (l, k) { return { label: l, kind: 'frac', key: k }; }
};
function ask(q, opts, ans, ok, no) { return { q: q, opts: opts, ans: ans, ok: ok, no: no }; }
function lcm(a, b) { return a / gcd(a, b) * b; }
function uniq(a) { var s = {}; return a.filter(function (x) { if (s[x]) return false; s[x] = 1; return true; }); }

/* ---------- генераторы ---------- */
function gen1() {
  if (rnd(0, 1) === 0) {
    var N = rnd(12, 48), D = divs(N), dd = D.filter(function (x) { return x > 1 && x < N; });
    if (!dd.length) return gen1();
    var d = pick(dd), non = [];
    for (var i = 2; i < N; i++) if (N % i) non.push(i);
    var bad = shuffle(non).slice(0, 3);
    if (bad.length < 3) return gen1();
    var opts = [[d, String(d)]].concat(bad.map(function (x) { return [x, String(x), 'not-divisor']; }));
    return { q: '<p>Какое из чисел является делителем числа ' + N + '?</p>', input: choice(opts), ans: String(d),
      hint: 'Делитель — это число, на которое ' + N + ' делится без остатка. Проверь каждый вариант делением. Подходит ' + d + ': ' + N + ' : ' + d + ' = ' + (N / d) + '.' };
  }
  var M = rnd(6, 40), c = divs(M).length;
  return { q: '<p>Сколько всего делителей у числа ' + M + '?</p>', input: rows(R.int('Ответ', 'x')),
    check: function (v) { return v.x === c ? 'ok' : 'wrong'; },
    tag: function (v) { return v.x === c - 2 ? 'miss-1-n' : ''; },
    sol: { x: c }, hint: 'Выпиши делители парами: ' + divs(M).join(', ') + '. Не забудь 1 и само число. Всего ' + c + '.' };
}

function gen2() {
  var a, b, g, t = rnd(0, 1), tries = 0;
  do { a = rnd(12, 40); b = rnd(12, 40); g = gcd(a, b); tries++; } while ((a === b || g < 2 || (t === 0 && divs(g).length < 2) ) && tries < 200);
  if (t === 1) {
    var c = divs(g).length;
    return { q: '<p>Сколько общих делителей у чисел ' + a + ' и ' + b + '?</p>', input: rows(R.int('Ответ', 'x')),
      check: function (v) { return v.x === c ? 'ok' : 'wrong'; }, tag: function (v) { return v.x === c - 1 ? 'miss-1' : ''; },
      sol: { x: c }, hint: 'Делители ' + a + ': ' + divs(a).join(', ') + '. Делители ' + b + ': ' + divs(b).join(', ') + '. Общие: ' + divs(g).join(', ') + '. Их ' + c + '.' };
  }
  var common = divs(g).filter(function (x) { return x > 1; }), da = divs(a).filter(function (x) { return x > 1 && b % x; }), db = divs(b).filter(function (x) { return x > 1 && a % x; });
  var none = []; for (var i = 2; i < 40; i++) if (a % i && b % i) none.push(i);
  if (!da.length || !db.length || !none.length) return gen2();
  var ans = pick(common);
  var opts = [[ans, String(ans)], [pick(da), '', 'only-first'], [pick(db), '', 'only-second'], [pick(none), '', 'not-divisor']];
  opts = opts.map(function (o, i) { return i === 0 ? o : [o[0], String(o[0]), o[2]]; });
  if (uniq(opts.map(function (o) { return o[0]; })).length < 4) return gen2();
  return { q: '<p>Какое из чисел является общим делителем чисел ' + a + ' и ' + b + '?</p>', input: choice(opts), ans: String(ans),
    hint: 'Общий делитель должен делить и ' + a + ', и ' + b + '. Число ' + ans + ' делит оба: ' + a + ' : ' + ans + ' = ' + (a / ans) + ', ' + b + ' : ' + ans + ' = ' + (b / ans) + '.' };
}

function gen3() {
  var a, b, g;
  do { a = rnd(6, 48); b = rnd(6, 48); g = gcd(a, b); } while (a === b);
  var l = lcm(a, b);
  return { q: '<p>Найди наибольший общий делитель чисел ' + a + ' и ' + b + '.</p>', input: rows(R.int('НОД', 'x')),
    check: function (v) { return v.x === g ? 'ok' : 'wrong'; },
    tag: function (v) { if (v.x === l) return 'lcm-confuse'; if (v.x > 0 && v.x < g && a % v.x === 0 && b % v.x === 0) return 'not-greatest'; return ''; },
    sol: { x: g }, hint: 'Выпиши делители каждого числа. ' + a + ': ' + divs(a).join(', ') + '. ' + b + ': ' + divs(b).join(', ') + '. Самое большое из общих — ' + g + '.' };
}

function gen4() {
  var ps, N, tries = 0;
  do { ps = []; var k = rnd(3, 4); for (var i = 0; i < k; i++) ps.push(pick([2, 3, 5, 7])); N = ps.reduce(function (x, y) { return x * y; }, 1); tries++; } while (N > 200 && tries < 100);
  ps.sort(function (x, y) { return x - y; });
  var right = ps.join(' · ');
  var i1 = rnd(0, ps.length - 2), m = ps.slice(); m.splice(i1, 2, ps[i1] * ps[i1 + 1]);
  var merged = m.join(' · ');
  var w = ps.slice(), j = rnd(0, w.length - 1); w[j] = w[j] === 2 ? 3 : 2; w.sort(function (x, y) { return x - y; });
  var wrong = w.join(' · ');
  if (uniq([right, merged, wrong]).length < 3) return gen4();
  return { q: '<p>Какая запись — разложение числа ' + N + ' на простые множители?</p>', input: choice([[right, right], [merged, merged, 'not-prime'], [wrong, wrong, 'wrong-product']]), ans: right,
    hint: 'Простое число делится только на 1 и на себя. Раскладываем делением на 2, 3, 5, 7: ' + N + ' = ' + right + '. Проверь умножением.' };
}

function gen5() {
  var G = [2, 3, 4, 5, 6, 7, 8, 9, 10, 12], g, p, q, a, b, tries = 0;
  do { g = pick(G); p = rnd(1, 12); q = rnd(1, 12); a = g * p; b = g * q; tries++; } while ((gcd(p, q) !== 1 || a === b || a < 8 || b < 8 || a > 200 || b > 200) && tries < 500);
  var l = lcm(a, b);
  return { q: '<p>Числа разложены на простые множители:</p>' + fx(a + ' = ' + fact(a)) + fx(b + ' = ' + fact(b)) + '<p>Найди НОД чисел ' + a + ' и ' + b + '.</p>', input: rows(R.int('НОД', 'x')),
    check: function (v) { return v.x === g ? 'ok' : 'wrong'; },
    tag: function (v) { if (v.x === l) return 'lcm-confuse'; if (v.x > 0 && v.x < g && g % v.x === 0) return 'partial-common'; return ''; },
    sol: { x: g }, hint: 'Подчеркни общие множители в обоих разложениях и перемножь их. Общие множители: ' + (primes(g).join(' · ') || '1') + '. Их произведение ' + g + '.' };
}

function gen6() {
  var g, p, q, r, a, b, c, tries = 0;
  do { g = rnd(2, 12); p = rnd(1, 12); q = rnd(1, 12); r = rnd(1, 12); a = g * p; b = g * q; c = g * r; tries++; }
  while ((gcd3(p, q, r) !== 1 || p === q || q === r || p === r || Math.max(a, b, c) > 200 || Math.min(a, b, c) < 6) && tries < 800);
  var x = gcd(a, b);
  return { q: '<p>Найди наибольший общий делитель чисел ' + a + ', ' + b + ' и ' + c + '.</p>', input: rows(R.int('НОД', 'x')),
    check: function (v) { return v.x === g ? 'ok' : 'wrong'; },
    tag: function (v) { return v.x === x && x !== g ? 'two-of-three' : ''; },
    sol: { x: g }, hint: 'Найди НОД первых двух чисел: НОД(' + a + ', ' + b + ') = ' + x + '. Потом НОД(' + x + ', ' + c + ') = ' + g + '.' };
}

function gen7() {
  if (rnd(0, 1) === 0) {
    var a, b;
    do { a = rnd(4, 40); b = rnd(4, 40); } while (a === b);
    var g = gcd(a, b);
    return { q: '<p>Верно ли, что числа ' + a + ' и ' + b + ' взаимно простые?</p>', input: choice([['y', 'Да', g > 1 ? 'coprime-wrong' : ''], ['n', 'Нет', g === 1 ? 'coprime-wrong' : '']], false), ans: g === 1 ? 'y' : 'n',
      hint: 'Найди НОД. Взаимно простые числа — те, у которых НОД равен 1. Здесь НОД(' + a + ', ' + b + ') = ' + g + (g === 1 ? ', значит, числа взаимно простые.' : ', значит, числа не взаимно простые.') };
  }
  var pairs = [], tries = 0, ok = null, bad = [];
  while ((!ok || bad.length < 2) && tries < 400) {
    tries++; var x = rnd(4, 40), y = rnd(4, 40); if (x === y) continue;
    if (gcd(x, y) === 1) { if (!ok) ok = [x, y]; } else if (bad.length < 2 && !(bad[0] && bad[0][0] === x)) bad.push([x, y]);
  }
  var opts = [['yes', nw(ok[0] + ' и ' + ok[1])], ['b0', nw(bad[0][0] + ' и ' + bad[0][1]), 'gcd-gt-1'], ['b1', nw(bad[1][0] + ' и ' + bad[1][1]), 'gcd-gt-1']];
  return { q: '<p>Какая пара чисел взаимно простая?</p>', input: choice(opts), ans: 'yes',
    hint: 'У взаимно простых чисел НОД равен 1. Посчитай НОД каждой пары: ' + ok[0] + ' и ' + ok[1] + ' — НОД 1; ' + bad[0][0] + ' и ' + bad[0][1] + ' — НОД ' + gcd(bad[0][0], bad[0][1]) + '; ' + bad[1][0] + ' и ' + bad[1][1] + ' — НОД ' + gcd(bad[1][0], bad[1][1]) + '.' };
}

function gen8() {
  var p, q, g, t = rnd(0, 1), tries = 0;
  do { p = rnd(1, 8); q = rnd(2, 9); g = rnd(2, 9); tries++; } while ((gcd(p, q) !== 1 || p >= q) && tries < 200);
  var a = p * g, b = q * g;
  if (t === 0) {
    return { q: '<p>Найди НОД числителя и знаменателя дроби ' + fr(a, b) + '.</p>', input: rows(R.int('НОД', 'x')),
      check: function (v) { return v.x === g ? 'ok' : 'wrong'; }, tag: function () { return ''; },
      sol: { x: g }, hint: 'НОД(' + a + ', ' + b + ') = ' + g + '. Это число, на которое делятся и числитель, и знаменатель.' };
  }
  return { q: '<p>Сократи дробь ' + fr(a, b) + ' до несократимой с помощью НОД.</p>', input: rows(R.frac('Ответ', 'x')),
    check: function (v) { return v.x.d > 0 && v.x.n === p && v.x.d === q ? 'ok' : 'wrong'; },
    tag: function (v) { return v.x.d > 0 && v.x.n * b === v.x.d * a && gcd(v.x.n, v.x.d) > 1 ? 'not-reduced' : ''; },
    sol: { x: { n: p, d: q } }, hint: 'НОД(' + a + ', ' + b + ') = ' + g + '. Делим числитель и знаменатель на ' + g + ': ' + a + ' : ' + g + ' = ' + p + ', ' + b + ' : ' + g + ' = ' + q + '. Получается ' + fr(p, q) + '.' };
}

function gen9() {
  var g, p, q, a, b, tries = 0;
  do { g = rnd(2, 12); p = rnd(2, 9); q = rnd(2, 9); a = g * p; b = g * q; tries++; } while ((gcd(p, q) !== 1 || p === q || a > 120 || b > 120) && tries < 500);
  var t = rnd(0, 2), text;
  if (t === 0) text = 'В коробке ' + a + ' красных и ' + b + ' синих карандашей. Из них составляют одинаковые наборы так, чтобы в каждом было поровну красных и поровну синих и все карандаши были использованы. Какое наибольшее число наборов можно составить?';
  else if (t === 1) text = 'Две ленты длиной ' + a + ' см и ' + b + ' см нужно разрезать без остатка на одинаковые части наибольшей возможной длины. Какова длина одной части (в сантиметрах)?';
  else text = 'У садовода ' + a + ' роз и ' + b + ' тюльпанов. Он составляет одинаковые букеты, используя все цветы. Какое наибольшее число букетов у него получится?';
  var l = lcm(a, b);
  return { q: '<p>' + text + '</p>', input: rows(R.int('Ответ', 'x')),
    check: function (v) { return v.x === g ? 'ok' : 'wrong'; },
    tag: function (v) { if (v.x === a + b) return 'sum'; if (v.x === l) return 'lcm-confuse'; return ''; },
    sol: { x: g }, hint: 'Нужно разделить оба числа поровну и как можно крупнее, значит, искать НОД. НОД(' + a + ', ' + b + ') = ' + g + '.' };
}

/* ---------- ступени ---------- */
var STEPS = [
  { id: 1, title: 'Делители числа', sub: 'На что делится без остатка', gen: gen1, teach: [
    { t: '<p><span class="key">Делителем</span> натурального числа a называют натуральное число, на которое a делится без остатка.</p>' + fx('12 : 3 = 4'), v: '<p class="small">3 — делитель числа 12, потому что остатка нет.</p>' },
    { t: '<p>Чтобы найти все делители числа, перебираем числа по порядку и записываем парами. Для 12:</p>' + fx('1 · 12,&nbsp; 2 · 6,&nbsp; 3 · 4') + '<p>Делители числа 12: 1, 2, 3, 4, 6, 12.</p>', v: '' },
    { t: '<p>У любого числа есть два делителя, которые всегда есть: <span class="key">1</span> и <span class="key">само число</span>.</p>', v: '' },
    { t: '<p>Какое число является делителем числа 20?</p>', v: '', ask: ask('Выбери', [['6', '6'], ['5', '5'], ['8', '8']], '5', 'Верно. 20 : 5 = 4, остатка нет.', 'Нет. 20 : 5 = 4 без остатка, а на 6 и на 8 число 20 не делится.') }
  ] },
  { id: 2, title: 'Общие делители', sub: 'Делители сразу двух чисел', gen: gen2, teach: [
    { t: '<p>Выпишем делители чисел 12 и 18.</p>' + fx('12: 1, 2, 3, 4, 6, 12') + fx('18: 1, 2, 3, 6, 9, 18'), v: '' },
    { t: '<p>Числа, которые стоят в обоих списках, называют <span class="key">общими делителями</span> этих чисел.</p>' + fx('1, 2, 3, 6'), v: '<p class="small">Это общие делители чисел 12 и 18.</p>' },
    { t: '<p>Какое число — общий делитель чисел 8 и 12?</p>', v: '', ask: ask('Выбери', [['3', '3'], ['4', '4'], ['8', '8']], '4', 'Верно. 8 : 4 = 2 и 12 : 4 = 3.', 'Нет. 4 делит и 8, и 12. Число 3 не делит 8, а 8 не делит 12.') }
  ] },
  { id: 3, title: 'Наибольший общий делитель', sub: 'Находим НОД перебором', gen: gen3, teach: [
    { t: '<p>Наибольшее натуральное число, на которое делятся без остатка числа a и b, называют их <span class="key">наибольшим общим делителем</span>. Коротко: НОД.</p>' + fx('НОД(12, 18) = 6'), v: '' },
    { t: '<p>Как найти. Выпиши делители каждого числа, отметь общие и возьми самый большой.</p>' + fx('12: 1, 2, 3, 4, <b>6</b>, 12') + fx('18: 1, 2, 3, <b>6</b>, 9, 18'), v: '' },
    { t: '<p><b>Частая ошибка.</b> НОД не путай с общим кратным. НОД всегда не больше меньшего из чисел.</p>', v: '' },
    { t: '<p>Чему равен НОД(10, 15)?</p>', v: '', ask: ask('Ответ', [['5', '5'], ['30', '30'], ['1', '1']], '5', 'Верно. Общие делители 1 и 5, наибольший — 5.', 'Нет. Делители 10: 1, 2, 5, 10. Делители 15: 1, 3, 5, 15. Наибольший общий — 5.') }
  ] },
  { id: 4, title: 'Простые множители', sub: 'Раскладываем число', gen: gen4, teach: [
    { t: '<p><span class="key">Простым</span> называют натуральное число, которое больше 1 и имеет ровно два делителя: единицу и само это число.</p>' + fx('2, 3, 5, 7, 11, 13, ...'), v: '' },
    { t: '<p>Любое составное число можно записать как произведение простых чисел. Это <span class="key">разложение на простые множители</span>.</p>' + fx('60 = 2 · 2 · 3 · 5'), v: '' },
    { t: '<p>Как раскладывать: делим число на наименьший простой делитель, потом результат снова, пока не получим 1.</p>' + fx('60 : 2 = 30, 30 : 2 = 15, 15 : 3 = 5, 5 : 5 = 1'), v: '' },
    { t: '<p>Верно ли, что 4 · 3 — разложение числа 12 на простые множители?</p>', v: '', ask: ask('Выбери', [['y', 'Да'], ['n', 'Нет']], 'n', 'Верно. Число 4 составное, его надо разложить: 2 · 2 · 3.', 'Нет. 4 не простое число: 4 = 2 · 2. Правильно: 12 = 2 · 2 · 3.') }
  ] },
  { id: 5, title: 'НОД через разложение', sub: 'Общие простые множители', gen: gen5, teach: [
    { t: '<p>Если числа большие, перебирать делители долго. Удобнее разложить числа на простые множители.</p>' + fx('36 = 2 · 2 · 3 · 3') + fx('48 = 2 · 2 · 2 · 2 · 3'), v: '' },
    { t: '<p>Выпиши множители, которые есть в обоих разложениях (с учётом повторов), и перемножь их.</p>' + fx('2 · 2 · 3 = 12'), v: '<p class="small">Общие множители: две двойки и одна тройка.</p>' },
    { t: '<p>НОД(36, 48) = 12. Проверим: 36 : 12 = 3, 48 : 12 = 4, дальше делить уже нельзя.</p>', v: '' },
    { t: '<p>Числа 18 = 2 · 3 · 3 и 30 = 2 · 3 · 5. Какие множители общие?</p>', v: '', ask: ask('Общие', [['23', '2 и 3'], ['3', 'только 3'], ['235', '2, 3 и 5']], '23', 'Верно. НОД = 2 · 3 = 6.', 'Нет. В обоих числах есть 2 и 3, значит, НОД = 2 · 3 = 6.') }
  ] },
  { id: 6, title: 'НОД трёх чисел', sub: 'Сначала два, потом третье', gen: gen6, teach: [
    { t: '<p>НОД трёх чисел — наибольшее число, на которое делятся все три числа.</p>', v: '' },
    { t: '<p>Найди НОД первых двух чисел, затем НОД результата и третьего числа.</p>' + fx('НОД(12, 18, 30)') + fx('НОД(12, 18) = 6, НОД(6, 30) = 6'), v: '' },
    { t: '<p>Ответ: НОД(12, 18, 30) = 6.</p>', v: '', ask: ask('НОД(8, 12, 20) =', [['2', '2'], ['4', '4'], ['8', '8']], '4', 'Верно. НОД(8, 12) = 4, НОД(4, 20) = 4.', 'Нет. НОД(8, 12) = 4, НОД(4, 20) = 4.') }
  ] },
  { id: 7, title: 'Взаимно простые числа', sub: 'НОД равен единице', gen: gen7, teach: [
    { t: '<p>Натуральные числа, у которых НОД равен 1, называют <span class="key">взаимно простыми</span>.</p>' + fx('НОД(8, 15) = 1'), v: '<p class="small">8 и 15 взаимно простые, хотя сами числа не простые.</p>' },
    { t: '<p>Взаимно простые числа не обязаны быть простыми. Главное: у них нет общих делителей, кроме 1.</p>', v: '' },
    { t: '<p>Взаимно ли просты числа 6 и 9?</p>', v: '', ask: ask('Выбери', [['y', 'Да'], ['n', 'Нет']], 'n', 'Верно. НОД(6, 9) = 3.', 'Нет. У чисел 6 и 9 общий делитель 3, значит, НОД равен 3, а не 1.') }
  ] },
  { id: 8, title: 'Сокращение дробей', sub: 'Делим на НОД', gen: gen8, teach: [
    { t: '<p>Основное свойство дроби: числитель и знаменатель можно разделить на одно и то же число.</p>' + fx(fr(12, 18) + ' = ' + fr(2, 3)), v: '' },
    { t: '<p>Чтобы сократить дробь сразу до несократимой, делим числитель и знаменатель на их НОД.</p>' + fx('НОД(12, 18) = 6') + fx(fr('12 : 6', '18 : 6') + ' = ' + fr(2, 3)), v: '' },
    { t: '<p>На какое число надо разделить числитель и знаменатель дроби ' + fr(8, 12) + ', чтобы сразу получить несократимую?</p>', v: '', ask: ask('Выбери', [['2', '2'], ['4', '4'], ['8', '8']], '4', 'Верно. НОД(8, 12) = 4, получится ' + fr(2, 3) + '.', 'Нет. Делить надо на НОД(8, 12) = 4. Тогда получится ' + fr(2, 3) + '.') }
  ] },
  { id: 9, title: 'Задачи на НОД', sub: 'Делим поровну как можно крупнее', gen: gen9, teach: [
    { t: '<p>Если надо разделить два количества на одинаковые части и взять наибольшее число частей или самую крупную часть, ищи НОД.</p>', v: '' },
    { t: '<p>Пример. 12 яблок и 18 груш раскладывают в одинаковые пакеты, ничего не оставляя. Наибольшее число пакетов — НОД(12, 18) = 6. В каждом пакете 2 яблока и 3 груши.</p>', v: '' },
    { t: '<p>Сколько наибольшее число одинаковых пакетов получится из 20 конфет и 30 печений?</p>', v: '', ask: ask('Ответ', [['5', '5'], ['10', '10'], ['60', '60']], '10', 'Верно. НОД(20, 30) = 10.', 'Нет. Ищем НОД(20, 30) = 10. В каждом пакете 2 конфеты и 3 печенья.') }
  ] }
];

var TAGMSG = {
  'not-divisor': 'Это число не делит данное без остатка. Проверь деление.',
  'miss-1-n': 'Не забудь, что 1 и само число тоже делители.',
  'miss-1': 'Проверь, не пропустила ли ты общий делитель 1.',
  'only-first': 'Это число делит только первое число, а общий делитель должен делить оба.',
  'only-second': 'Это число делит только второе число, а общий делитель должен делить оба.',
  'lcm-confuse': 'Ты нашла общее кратное, а нужен общий делитель. НОД не больше меньшего числа.',
  'not-greatest': 'Это общий делитель, но не наибольший. Посмотри ещё раз на списки делителей.',
  'not-prime': 'В разложении должны быть только простые числа. Составной множитель раскладывай дальше.',
  'wrong-product': 'Проверь умножением: произведение множителей должно дать данное число.',
  'partial-common': 'Ты взяла не все общие множители. Перемножь все множители, которые есть в обоих разложениях.',
  'two-of-three': 'Это НОД только первых двух чисел. Теперь найди НОД этого результата и третьего числа.',
  'coprime-wrong': 'Взаимно простые числа — те, у которых НОД равен 1. Найди НОД и сравни с единицей.',
  'gcd-gt-1': 'У этой пары есть общий делитель больше 1, значит, числа не взаимно простые.',
  'not-reduced': 'Дробь верная, но её можно сократить дальше. Дели на НОД, а не на любой общий делитель.',
  'sum': 'Числа не складывают. Ищи НОД: наибольшее число, на которое делятся оба.'
};

var api = { STEPS: STEPS, fr: fr, rnd: rnd };
root.TRAINER = {
  title: 'НОД с нуля', shortTitle: 'НОД', key: 'nod_trainer_v1',
  sheetUrl: 'https://script.google.com/macros/s/AKfycbyJKYatO3xdOpYJ1WZzszbxqMnOWZ30lsfr5HH7Y23svvX6iqjNNbIUR-RCUeZ8pB15/exec',
  needDefault: 7, needEarly: 5, earlyUpto: 3, tagMsg: TAGMSG, api: api
};
if (typeof module !== 'undefined' && module.exports) module.exports = root.TRAINER;
})(typeof window !== 'undefined' ? window : globalThis);
