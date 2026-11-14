/* Содержание тренажёра «ОГЭ №22 · График функции и прямая y = m»: 11 ступеней. Движок: tren/staged.js */
(function (root) {
'use strict';
var MIN = '−';
function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function pick(a) { return a[rnd(0, a.length - 1)]; }
function nz(lo, hi) { var v; do { v = rnd(lo, hi); } while (v === 0); return v; }
function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = rnd(0, i), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function fr(n, d) { return '<span class="fr"><span class="t">' + n + '</span><span class="b">' + d + '</span></span>'; }
function mx(w, n, d) { return '<span class="mx">' + w + '</span>' + fr(n, d); }
function F(s) { return '<span class="nw">' + s + '</span>'; }
function fx(h) { return '<span class="fx">' + h + '</span>'; }
function sg(n) { return n < 0 ? MIN + (-n) : String(n); }
function pr(n) { return n < 0 ? '(' + MIN + (-n) + ')' : String(n); }
function pt(x, y) { return '(' + sg(x) + '; ' + sg(y) + ')'; }
function plus(n) { return n >= 0 ? ' + ' + n : ' ' + MIN + ' ' + (-n); }
function coef(k, v) { return (k === 1 ? '' : k === -1 ? MIN : sg(k)) + v; }
function lineStr(k, b) { return 'y = ' + coef(k, 'x') + (b ? plus(b) : ''); }
function sq(p) { return p === 0 ? 'x²' : '(x ' + (p > 0 ? MIN + ' ' + p : '+ ' + (-p)) + ')²'; }
function parStr(a, p, q) { return 'y = ' + (a < 0 ? MIN : '') + sq(p) + (q ? plus(q) : ''); }
function quad(s, c) { return 'y = ' + (s < 0 ? MIN : '') + 'x²' + (c ? plus(c) : ''); }
function xa(a) { return a > 0 ? 'x ' + MIN + ' ' + a : 'x + ' + (-a); }
function two(parts) { return '<div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end">' + parts.join('') + '</div>'; }
function cap(svg, text) { return '<div style="text-align:center;font-size:15px;line-height:1.3">' + svg + '<br>' + text + '</div>'; }
function pw(rs) {
  return '<span style="display:inline-flex;align-items:center;gap:8px;text-align:left"><span style="font-size:3.4em;font-weight:200;line-height:1">{</span><span style="display:inline-block">' +
    rs.map(function (r) { return '<span class="nw" style="display:block">' + r[0] + ',&nbsp;&nbsp;' + r[1] + '</span>'; }).join('') + '</span></span>';
}
function rows() { return { type: 'rows', rows: Array.prototype.slice.call(arguments) }; }
var R = { int: function (l, k, neg) { return { label: l, kind: 'int', key: k, neg: !!neg }; } };
function choice(list) {
  var seen = {}, o = [];
  list.forEach(function (a) { var k = String(a[0]); if (seen[k]) return; seen[k] = 1; o.push({ v: k, html: a[1], tag: a[2] || '' }); });
  return { type: 'choice', options: shuffle(o) };
}
function choiceO(list) { return { type: 'choice', options: list.map(function (a) { return { v: String(a[0]), html: a[1], tag: a[2] || '' }; }) }; }
function ask(q, opts, ans, ok, no) { return { q: q, opts: opts, ans: ans, ok: ok, no: no }; }

/* ---------- математика кусочных графиков ---------- */
function val(p, x) { return p.t === 'line' ? p.k * x + p.b : p.a * (x - p.p) * (x - p.p) + p.q; }
function inDom(p, x) {
  var e = 1e-9, i;
  if (p.lo !== undefined && (x < p.lo - e || (p.loOpen && x < p.lo + e))) return false;
  if (p.hi !== undefined && (x > p.hi + e || (p.hiOpen && x > p.hi - e))) return false;
  if (p.ex) for (i = 0; i < p.ex.length; i++) if (Math.abs(x - p.ex[i]) < e) return false;
  return true;
}
function roots(p, m) {
  if (p.t === 'line') return p.k === 0 ? [] : [(m - p.b) / p.k];
  var d = (m - p.q) / p.a;
  if (d < -1e-9) return [];
  if (Math.abs(d) < 1e-9) return [p.p];
  var r = Math.sqrt(d);
  return [p.p - r, p.p + r];
}
function hitsList(pcs, m) {
  var xs = [];
  pcs.forEach(function (p) { roots(p, m).forEach(function (x) { if (inDom(p, x) && !xs.some(function (z) { return Math.abs(z - x) < 1e-7; })) xs.push(x); }); });
  return xs;
}
function hits(pcs, m) { return hitsList(pcs, m).length; }
function endDots(pcs) {
  var d = [];
  pcs.forEach(function (p) {
    if (p.lo !== undefined && p.lo > -4.9) d.push({ t: 'dot', x: p.lo, y: val(p, p.lo), open: !!p.loOpen });
    if (p.hi !== undefined && p.hi < 4.9) d.push({ t: 'dot', x: p.hi, y: val(p, p.hi), open: !!p.hiOpen });
  });
  return d;
}

/* ---------- рисунок координатной плоскости ---------- */
var gid = 0;
function G(items, o) {
  o = o || {};
  var w = o.w || 250, M = 24, U = 20, N = 200, id = 'zg' + (++gid), fs = 12, i;
  function X(x) { return +(M + (x + 5) * U).toFixed(1); }
  function Y(y) { return +(M + (5 - y) * U).toFixed(1); }
  var s = '<svg class="gr" viewBox="0 0 282 248" width="' + w + '" style="max-width:100%;height:auto;background:#f3ece2;border-radius:8px;display:inline-block;vertical-align:middle" xmlns="http://www.w3.org/2000/svg" role="img">';
  s += '<defs><clipPath id="' + id + '"><rect x="24" y="24" width="200" height="200"/></clipPath></defs>';
  for (i = -5; i <= 5; i++) {
    s += '<line x1="' + X(i) + '" y1="' + M + '" x2="' + X(i) + '" y2="' + (M + N) + '" stroke="#d6cdbb" stroke-width=".7"/>';
    s += '<line x1="' + M + '" y1="' + Y(i) + '" x2="' + (M + N) + '" y2="' + Y(i) + '" stroke="#d6cdbb" stroke-width=".7"/>';
  }
  s += '<line x1="' + X(0) + '" y1="' + M + '" x2="' + X(0) + '" y2="' + (M + N) + '" stroke="#14211e" stroke-width="1.6"/>';
  s += '<line x1="' + M + '" y1="' + Y(0) + '" x2="' + (M + N) + '" y2="' + Y(0) + '" stroke="#14211e" stroke-width="1.6"/>';
  s += '<rect x="' + M + '" y="' + M + '" width="' + N + '" height="' + N + '" fill="none" stroke="#14211e" stroke-width=".8"/>';
  for (i = -5; i <= 5; i++) {
    if (!i) continue;
    s += '<text x="' + X(i) + '" y="' + (M + N + fs + 3) + '" font-size="' + fs + '" text-anchor="middle" fill="#14211e" font-family="Arial,sans-serif">' + sg(i) + '</text>';
    s += '<text x="' + (M - 4) + '" y="' + (Y(i) + fs * 0.35).toFixed(1) + '" font-size="' + fs + '" text-anchor="end" fill="#14211e" font-family="Arial,sans-serif">' + sg(i) + '</text>';
  }
  s += '<text x="' + (M + N + 6) + '" y="' + (Y(0) + 4) + '" font-size="14" font-style="italic" fill="#14211e" font-family="Georgia,serif">x</text>';
  s += '<text x="' + X(0) + '" y="16" font-size="14" font-style="italic" text-anchor="middle" fill="#14211e" font-family="Georgia,serif">y</text>';
  var cur = '', hl = '', dots = '';
  items.forEach(function (it) {
    var d = '', lo = it.lo === undefined ? -5.2 : it.lo, hi = it.hi === undefined ? 5.2 : it.hi, n, k, x, y;
    if (it.t === 'line') d = 'M' + X(lo) + ',' + Y(it.k * lo + it.b) + 'L' + X(hi) + ',' + Y(it.k * hi + it.b);
    else if (it.t === 'par') {
      n = Math.max(2, Math.ceil((hi - lo) / 0.1));
      for (k = 0; k <= n; k++) { x = lo + (hi - lo) * k / n; y = it.a * (x - it.p) * (x - it.p) + it.q; d += (d ? 'L' : 'M') + X(x) + ',' + Y(Math.max(-9, Math.min(9, y))); }
    } else if (it.t === 'hl') {
      hl += '<line x1="' + M + '" y1="' + Y(it.m) + '" x2="' + (M + N) + '" y2="' + Y(it.m) + '" stroke="#c2410c" stroke-width="2.4" stroke-dasharray="7 4"/>';
      if (it.lbl) hl += '<text x="' + (M + N + 5) + '" y="' + (Y(it.m) + 4) + '" font-size="12" font-weight="700" fill="#c2410c" font-family="Arial,sans-serif">' + it.lbl + '</text>';
    } else if (it.t === 'dot') {
      var col = it.col === 'o' ? '#c2410c' : '#1747c9';
      dots += '<circle cx="' + X(it.x) + '" cy="' + Y(it.y) + '" r="4.8" fill="' + (it.open ? '#f3ece2' : col) + '" stroke="' + col + '" stroke-width="2.2"/>';
    }
    if (d) cur += '<path d="' + d + '" fill="none" stroke="#1747c9" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>';
  });
  s += '<g clip-path="url(#' + id + ')">' + cur + '</g>' + hl + dots;
  return s + '</svg>';
}
function Gp(pcs, extra, o) { return G(pcs.concat(endDots(pcs)).concat(extra || []), o); }

/* ---------- ступень 1: прямая y = m ---------- */
function gen1() {
  var m = nz(-4, 4);
  if (rnd(0, 1)) {
    return { q: '<p>Какой формулой задана изображённая прямая?</p>' + G([{ t: 'hl', m: m }]),
      input: choice([['y' + m, F('y = ' + sg(m)), ''], ['x' + m, F('x = ' + sg(m)), 'x-vs-y'], ['y' + (-m), F('y = ' + sg(-m)), 'sign'], ['x' + (-m), F('x = ' + sg(-m)), 'x-vs-y']]), ans: 'y' + m,
      hint: 'Прямая горизонтальная и проходит на высоте ' + sg(m) + ' по оси y. У всех её точек y = ' + sg(m) + ', поэтому формула y = ' + sg(m) + '.' };
  }
  return { q: '<p>Через какую точку оси y проходит прямая <span class="nw">y = ' + sg(m) + '</span>?</p>',
    input: choice([['0,' + m, F(pt(0, m)), ''], [m + ',0', F(pt(m, 0)), 'swap-xy'], ['0,' + (-m), F(pt(0, -m)), 'sign'], [m + ',' + m, F(pt(m, m)), 'swap-xy']]), ans: '0,' + m,
    hint: 'На оси y значение x равно 0, а y равно ' + sg(m) + ' (так сказано в формуле). Получается точка ' + pt(0, m) + '.' };
}

/* ---------- ступень 2: сколько общих точек у параболы и прямой ---------- */
function gen2() {
  var a, p, q, d, m, pcs, n, text;
  do {
    a = pick([1, -1]); p = rnd(-2, 2); q = rnd(-3, 3); d = pick([-1, 0, 1, 1, 4]); m = q + a * d;
  } while (m === 0 || Math.abs(m) > 4);
  pcs = [{ t: 'par', a: a, p: p, q: q, lo: -5, hi: 5 }];
  n = hits(pcs, m);
  if (n === 1) text = 'Прямая y = ' + sg(m) + ' проходит ровно через вершину ' + pt(p, q) + ' и только касается параболы: 1 общая точка.';
  else if (n === 2) text = 'Ветви идут ' + (a > 0 ? 'вверх' : 'вниз') + ', вершина на высоте ' + sg(q) + '. Прямая на высоте ' + sg(m) + ' лежит ' + (a > 0 ? 'выше' : 'ниже') + ' вершины, туда, куда идут ветви, и пересекает обе ветви: 2 общие точки.';
  else text = 'Ветви идут ' + (a > 0 ? 'вверх' : 'вниз') + ', вершина на высоте ' + sg(q) + '. Прямая на высоте ' + sg(m) + ' лежит ' + (a > 0 ? 'ниже' : 'выше') + ' вершины, туда ветви не заходят: общих точек нет.';
  var ans = String(n);
  return { q: '<p>Сколько общих точек у параболы и прямой?</p>' + G(pcs.concat([{ t: 'hl', m: m }])),
    input: choiceO([[0, '0', ''], [1, '1', ans === '2' ? 'one-of-two' : ''], [2, '2', ans === '1' ? 'touch-two' : '']]), ans: ans, hint: text };
}

/* ---------- ступень 3: вершина параболы ---------- */
function gen3() {
  var a = pick([1, -1]), p = nz(-3, 3), q = rnd(-4, 4), b = -2 * a * p, c = a * p * p + q;
  var f = 'y = ' + coef(a, 'x²') + (b ? (b > 0 ? ' + ' : ' ' + MIN + ' ') + (Math.abs(b) === 1 ? '' : Math.abs(b)) + 'x' : '') + (c ? plus(c) : '');
  return { q: '<p>Найди вершину параболы</p>' + fx(f), input: rows(R.int('Абсцисса x₀', 'x', true), R.int('Ордината y₀', 'y', true)),
    check: function (v) { return v.x === p && v.y === q ? 'ok' : 'wrong'; },
    tag: function (v) { if (p !== 0 && v.x === -p) return 'sign-x'; if (v.x === q && v.y === p && p !== q) return 'swap-xy'; if (v.y === c && c !== q) return 'y-is-c'; return ''; },
    sol: { x: p, y: q },
    hint: 'Абсцисса вершины x₀ = −b : (2a) = −' + pr(b) + ' : (2 · ' + pr(a) + ') = ' + sg(p) + '. Ордината: подставляем x = ' + sg(p) + ' в формулу: y₀ = ' + pr(a) + ' · ' + pr(p) + '² + ' + pr(b) + ' · ' + pr(p) + ' + ' + pr(c) + ' = ' + sg(q) + '. Вершина ' + pt(p, q) + '.' };
}

/* ---------- ступень 4: значение кусочной функции ---------- */
function gen4() {
  var c = pick([-1, 0, 1, 2]), k = pick([1, -1, 2, -2]), b = rnd(-3, 3), s = pick([1, -1]), e = rnd(-4, 4), kind = rnd(0, 2), x, y, other, left;
  x = kind === 0 ? c - rnd(1, 3) : kind === 1 ? c + rnd(1, 2) : c;
  left = x < c;
  y = left ? k * x + b : s * x * x + e;
  other = left ? s * x * x + e : k * x + b;
  var f = fx(pw([[lineStr(k, b), 'при x &lt; ' + sg(c)], [parStr(s, 0, e), 'при x ≥ ' + sg(c)]]));
  var why = left ? 'Число ' + sg(x) + ' меньше ' + sg(c) + ', значит берём первую формулу: y = ' + pr(k) + ' · ' + pr(x) + plus(b) + ' = ' + sg(y) + '.'
    : (x === c ? 'Число ' + sg(x) + ' равно границе ' + sg(c) + ', а условие x ≥ ' + sg(c) + ' границу включает. Берём вторую формулу: ' : 'Число ' + sg(x) + ' больше ' + sg(c) + ', берём вторую формулу: ') + 'y = ' + pr(s) + ' · ' + pr(x) + '²' + plus(e) + ' = ' + sg(y) + '.';
  return { q: '<p>Функция задана формулами</p>' + f + '<p>Найди значение функции при x = ' + sg(x) + '.</p>', input: rows(R.int('y', 'y', true)),
    check: function (v) { return v.y === y ? 'ok' : 'wrong'; },
    tag: function (v) { return v.y === other && other !== y ? 'wrong-piece' : ''; },
    sol: { y: y }, hint: why };
}

/* ---------- ступень 5: условие по рисунку ---------- */
var SYM = { lt: '<', le: '≤', gt: '>', ge: '≥' };
function gen5() {
  var line = rnd(0, 1) === 1, right = rnd(0, 1) === 1, closed = rnd(0, 1) === 1, c = rnd(-2, 2), pc, a, q, k;
  if (line) { k = pick([1, -1]); pc = { t: 'line', k: k, b: rnd(-2, 2) - k * c }; }
  else { a = pick([1, -1]); do { q = rnd(-3, 2); } while (Math.abs(a + q) > 4); pc = { t: 'par', a: a, p: right ? c + 1 : c - 1, q: q }; }
  if (right) { pc.lo = c; pc.hi = 5; pc.loOpen = !closed; } else { pc.lo = -5; pc.hi = c; pc.hiOpen = !closed; }
  var ans = (right ? 'g' : 'l') + (closed ? 'e' : 't');
  var list = ['lt', 'le', 'gt', 'ge'].map(function (v) {
    var tag = v === ans ? '' : (v.charAt(0) === ans.charAt(0) ? 'strict-nonstrict' : 'side');
    return [v, F('x ' + SYM[v] + ' ' + sg(c)), tag];
  });
  return { q: '<p>Какое условие задаёт изображённую часть графика?</p>' + Gp([pc]), input: choiceO(list), ans: ans,
    hint: 'На границе x = ' + sg(c) + ' стоит ' + (closed ? 'закрашенная точка: граница входит в промежуток, знак нестрогий (≤ или ≥)' : 'выколотая точка: граница не входит в промежуток, знак строгий (< или >)') + '. График идёт ' + (right ? 'правее' : 'левее') + ' границы, значит x ' + (right ? 'больше' : 'меньше') + ' ' + sg(c) + '. Ответ: x ' + SYM[ans] + ' ' + sg(c) + '.' };
}

/* ---------- кусочные графики: общая заготовка ---------- */
function spec() {
  var s = { c: pick([-1, 0, 1]), k: pick([1, -1]), yL: rnd(-3, 2), a: pick([1, -1]) }, q;
  s.p = s.c + rnd(0, 2); s.b = s.yL - s.k * s.c;
  do { q = rnd(-3, 3); s.yR = s.a * (s.c - s.p) * (s.c - s.p) + q; } while (Math.abs(s.yR) > 4 || s.yR === s.yL);
  s.q = q; return s;
}
function build(s, lc) {
  return [{ t: 'line', k: s.k, b: s.b, lo: -5, hi: s.c, hiOpen: !lc }, { t: 'par', a: s.a, p: s.p, q: s.q, lo: s.c, hi: 5, loOpen: lc }];
}
function pwText(s, lc) {
  return fx(pw([[lineStr(s.k, s.b), 'при x ' + (lc ? '≤' : '&lt;') + ' ' + sg(s.c)], [parStr(s.a, s.p, s.q), 'при x ' + (lc ? '&gt;' : '≥') + ' ' + sg(s.c)]]));
}

/* ---------- ступень 6: выбор графика ---------- */
function gen6() {
  var s = spec(), lc = rnd(0, 1) === 1, wr = [];
  wr.push({ v: 'w1', tag: 'dot-type', pcs: build(s, !lc) });
  wr.push({ v: 'w2', tag: 'slope', pcs: build({ c: s.c, k: -s.k, b: s.yL + s.k * s.c, yL: s.yL, a: s.a, p: s.p, q: s.q }, lc) });
  var q3 = s.yR + s.a * (s.c - s.p) * (s.c - s.p);
  if (Math.abs(q3) <= 4) wr.push({ v: 'w3', tag: 'parab-sign', pcs: build({ c: s.c, k: s.k, b: s.b, yL: s.yL, a: -s.a, p: s.p, q: q3 }, lc) });
  wr = shuffle(wr).slice(0, 2);
  var opts = [{ v: 'ok', html: Gp(build(s, lc), null, { w: 150 }), tag: '' }].concat(wr.map(function (w) { return { v: w.v, html: Gp(w.pcs, null, { w: 150 }), tag: w.tag }; }));
  return { q: '<p>Выбери график функции</p>' + pwText(s, lc), input: { type: 'choice', options: shuffle(opts) }, ans: 'ok',
    hint: 'Левая часть: ' + lineStr(s.k, s.b).replace('y = ', 'прямая y = ') + ' до границы x = ' + sg(s.c) + '. Там y = ' + sg(s.yL) + ', точка ' + pt(s.c, s.yL) + ' ' + (lc ? 'закрашена' : 'выколота') + '. Правая часть: парабола от границы, там y = ' + sg(s.yR) + ', точка ' + pt(s.c, s.yR) + ' ' + (lc ? 'выколота' : 'закрашена') + '. Сверь с рисунками наклон прямой, ветви параболы и точки на границе.' };
}

/* ---------- ступень 7: общие точки кусочного графика с y = m ---------- */
function gen7() {
  var s = spec(), lc = rnd(0, 1) === 1, pcs = build(s, lc), cand = [s.yL, s.yR, s.q, s.yL + 1, s.yL - 1, s.yR + 1, s.yR - 1, s.q + 1, s.q - 1], m, n, tries = 0;
  do { m = pick(cand); tries++; } while ((m === 0 || Math.abs(m) > 4) && tries < 60);
  if (m === 0 || Math.abs(m) > 4) m = 1;
  n = hits(pcs, m);
  var Lp = pcs[0], Pp = pcs[1], xl = (m - s.b) / s.k, txt;
  if (inDom(Lp, xl)) txt = 'Левая часть пересекает прямую в 1 точке.';
  else if (Math.abs(xl - s.c) < 1e-9 && Lp.hiOpen) txt = 'Левая часть доходит до высоты ' + sg(m) + ' только в выколотой точке ' + pt(s.c, m) + ': её не считаем.';
  else txt = 'Левая часть до высоты ' + sg(m) + ' не доходит.';
  var rc = roots(Pp, m).filter(function (x) { return inDom(Pp, x); }).length;
  txt += ' Правая часть: ' + (rc === 0 ? 'общих точек нет' : rc === 1 ? '1 общая точка' : '2 общие точки') + '. Всего ' + n + '.';
  var ans = String(n);
  return { q: '<p>Сколько общих точек у графика и прямой?</p>' + Gp(pcs, [{ t: 'hl', m: m }]),
    input: choiceO([[0, '0', ''], [1, '1', ''], [2, '2', ''], [3, '3', '']].map(function (o) { o[2] = o[0] > n ? 'extra-point' : (o[0] < n && o[0] > 0 ? 'lost-point' : ''); return o; })), ans: ans, hint: txt };
}

/* ---------- дроби с выколотой точкой ---------- */
function fracHtml(s, t, a) {
  var num = '(x² ' + (t > 0 ? '+ ' + t : MIN + ' ' + (-t)) + ')(' + xa(a) + ')', den = s > 0 ? xa(a) : sg(a) + ' ' + MIN + ' x';
  return 'y = ' + fr(num, den);
}
function holeSpec(lim) {
  var s, t, a, yh;
  do { s = pick([1, -1]); t = nz(-3, 3); a = pick([-2, -1, 1, 2]); yh = s * (a * a + t); } while (lim && (Math.abs(s * t) > 4 || Math.abs(yh) > 4 || yh === 0));
  return { s: s, t: t, a: a, yh: yh, v: s * t };
}

/* ---------- ступень 8: сокращаем дробь ---------- */
function gen8() {
  var h = holeSpec(false), s = h.s, t = h.t, a = h.a, ok = quad(s, s * t);
  var list = [['ok', F(ok), ''], ['opp', F(quad(-s, -s * t)), 'sign'], ['m1', F(quad(s, s * t - a)), 'cancel-term'], ['m2', F(quad(s, s * t + a)), 'cancel-term']];
  return { q: '<p>Сократи дробь и выбери упрощённую формулу.</p>' + fx(fracHtml(s, t, a)), input: choice(list), ans: 'ok',
    hint: s > 0 ? 'Знаменатель ' + xa(a) + ' совпадает с вторым множителем числителя, сокращаем на него: остаётся x² ' + (t > 0 ? '+ ' + t : MIN + ' ' + (-t)) + '. Формула ' + ok + ', при этом x ≠ ' + sg(a) + '.'
      : 'Знаменатель ' + sg(a) + ' ' + MIN + ' x противоположен множителю ' + xa(a) + ': ' + sg(a) + ' ' + MIN + ' x = ' + MIN + '(' + xa(a) + '). После сокращения остаётся ' + MIN + '(x² ' + (t > 0 ? '+ ' + t : MIN + ' ' + (-t)) + '). Формула ' + ok + ', при этом x ≠ ' + sg(a) + '.' };
}

/* ---------- ступень 9: выколотая точка ---------- */
function gen9() {
  var h = holeSpec(false), s = h.s, t = h.t, a = h.a, yh = h.yh, inner = pr(a) + '²' + (t ? plus(t) : '');
  return { q: '<p>Найди координаты выколотой точки графика.</p>' + fx(fracHtml(s, t, a)), input: rows(R.int('Абсцисса x', 'x', true), R.int('Ордината y', 'y', true)),
    check: function (v) { return v.x === a && v.y === yh ? 'ok' : 'wrong'; },
    tag: function (v) { if (v.x === -a) return 'sign-x'; if (v.x === a && s < 0 && v.y === -yh) return 'forgot-minus'; if (v.y === 0) return 'zero-over-zero'; return ''; },
    sol: { x: a, y: yh },
    hint: 'Знаменатель равен нулю при x = ' + sg(a) + ', эта точка выколота. Упрощённая формула ' + quad(s, s * t) + '. Подставляем x = ' + sg(a) + ': y = ' + (s > 0 ? inner : MIN + '(' + inner + ')') + ' = ' + sg(yh) + '. Выколотая точка ' + pt(a, yh) + '.' };
}

/* ---------- ступень 10: точки параболы с выколотой точкой ---------- */
function gen10() {
  var h = holeSpec(true), s = h.s, a = h.a, yh = h.yh, v = h.v, cand = [v, yh, v + s, v + 2 * s, v - s, yh + s, yh - s], m, tries = 0, n;
  var pcs = [{ t: 'par', a: s, p: 0, q: v, lo: -5, hi: 5, ex: [a] }];
  do { m = pick(cand); tries++; } while ((m === 0 || Math.abs(m) > 4) && tries < 60);
  if (m === 0 || Math.abs(m) > 4) m = v;
  n = hits(pcs, m);
  var ans = String(n), txt;
  if (m === v) txt = 'Прямая y = ' + sg(m) + ' касается параболы в вершине ' + pt(0, v) + ': 1 общая точка.';
  else if (m === yh) txt = 'Прямая y = ' + sg(m) + ' проходит через выколотую точку ' + pt(a, yh) + '. Эта точка графику не принадлежит, поэтому из двух пересечений остаётся одно, в точке x = ' + sg(-a) + ': 1 общая точка.';
  else if (n === 2) txt = 'Прямая пересекает обе ветви, и ни одно пересечение не попало в выколотую точку: 2 общие точки.';
  else txt = 'Прямая лежит по другую сторону от вершины, туда парабола не заходит: общих точек нет.';
  return { q: '<p>Сколько общих точек у графика и прямой? Пустой кружок означает выколотую точку.</p>' + G(pcs.concat([{ t: 'hl', m: m }, { t: 'dot', x: a, y: yh, open: true }])),
    input: choiceO([[0, '0', ''], [1, '1', ans === '2' ? 'one-of-two' : ''], [2, '2', ans === '1' ? (m === yh ? 'hole-counted' : 'touch-two') : '']]), ans: ans, hint: txt };
}

/* ---------- ступень 11: как в ОГЭ ---------- */
function gen11() {
  var h = holeSpec(false), s = h.s, t = h.t, a = h.a, yh = h.yh, v = h.v, lo = Math.min(v, yh), hi = Math.max(v, yh);
  return { q: '<p>Определи, при каких значениях m прямая y = m имеет с графиком функции ровно одну общую точку. Запиши два значения: меньшее и большее.</p>' + fx(fracHtml(s, t, a)),
    input: rows(R.int('Меньшее m', 'm1', true), R.int('Большее m', 'm2', true)),
    check: function (w) { return (w.m1 === lo && w.m2 === hi) ? 'ok' : 'wrong'; },
    tag: function (w) {
      var vs = [w.m1, w.m2], hasV = vs.indexOf(v) >= 0, hasH = vs.indexOf(yh) >= 0;
      if (hasV && !hasH) return 'forgot-hole'; if (hasH && !hasV) return 'forgot-vertex'; if (w.m1 === hi && w.m2 === lo) return 'order'; return '';
    },
    sol: { m1: lo, m2: hi },
    hint: 'Сокращаем: ' + quad(s, v) + ', x ≠ ' + sg(a) + '. Вершина параболы ' + pt(0, v) + ': при m = ' + sg(v) + ' прямая касается параболы, 1 точка. Выколотая точка ' + pt(a, yh) + ': прямая y = ' + sg(yh) + ' пересекает параболу при x = ' + sg(a) + ' и x = ' + sg(-a) + ', но первой точки на графике нет, остаётся одна. Ответ: ' + sg(lo) + ' и ' + sg(hi) + '.' };
}

/* ---------- ступени: объяснение ---------- */
var GP1 = [{ t: 'par', a: 1, p: 0, q: -3, lo: -5, hi: 5 }];
var PG0 = [{ t: 'line', k: 1, b: 2, lo: -5, hi: 0, hiOpen: true }, { t: 'par', a: 1, p: 0, q: 0, lo: 0, hi: 5, loOpen: false }];
var PG0V = [{ t: 'line', k: 1, b: 2, lo: -5, hi: 0, hiOpen: true }, { t: 'par', a: 1, p: 1, q: -1, lo: 0, hi: 5, loOpen: false }];

var STEPS = [
  { id: 1, title: 'Прямая y = m', sub: 'Горизонтальная прямая', gen: gen1, teach: [
    { t: '<p>Запись <span class="key">y = m</span>, где m — число, задаёт <span class="key">горизонтальную прямую</span>. У всех её точек одна и та же ордината y = m, а абсцисса x любая.</p>' + fx('y = 3'), v: G([{ t: 'hl', m: 3, lbl: 'y = 3' }]) },
    { t: '<p>Прямая <span class="nw">y = 3</span> проходит через точку ' + F('(0; 3)') + ' на оси y и параллельна оси x. Прямая <span class="nw">y = ' + MIN + '2</span> проходит ниже оси x, через точку ' + F('(0; ' + MIN + '2)') + '.</p><p>Запись x = 3 — совсем другая прямая, вертикальная.</p>', v: G([{ t: 'hl', m: 3, lbl: 'y = 3' }, { t: 'hl', m: -2, lbl: 'y = ' + MIN + '2' }]) },
    { t: '<p>Какой формулой задана прямая на рисунке?</p>', v: G([{ t: 'hl', m: 2 }]), ask: ask('Выбери', [['a', 'y = 2'], ['b', 'x = 2'], ['c', 'y = ' + MIN + '2']], 'a', 'Верно. Прямая горизонтальная, на высоте 2: y = 2.', 'Нет. Прямая лежит горизонтально на высоте 2 по оси y, значит y = 2. Запись x = 2 дала бы вертикальную прямую.') }
  ] },
  { id: 2, title: 'Общие точки с параболой', sub: 'Считаем пересечения', gen: gen2, teach: [
    { t: '<p><span class="key">Общие точки</span> графика и прямой — это точки, в которых они пересекаются или касаются. Чтобы их посчитать, смотрим, сколько раз прямая встречает график.</p><p>На рисунке парабола ' + F('y = x² ' + MIN + ' 3') + ' и прямая ' + F('y = 1') + ': две общие точки.</p>', v: G(GP1.concat([{ t: 'hl', m: 1, lbl: 'y = 1' }, { t: 'dot', x: -2, y: 1, col: 'o' }, { t: 'dot', x: 2, y: 1, col: 'o' }])) },
    { t: '<p>У параболы ' + F('y = x² ' + MIN + ' 3') + ' вершина ' + F('(0; ' + MIN + '3)') + ', ветви идут вверх. Всё зависит от высоты прямой:</p>' + two([cap(G(GP1.concat([{ t: 'hl', m: 1 }, { t: 'dot', x: -2, y: 1, col: 'o' }, { t: 'dot', x: 2, y: 1, col: 'o' }]), { w: 130 }), 'выше вершины: 2 точки'), cap(G(GP1.concat([{ t: 'hl', m: -3 }, { t: 'dot', x: 0, y: -3, col: 'o' }]), { w: 130 }), 'через вершину: 1 точка'), cap(G(GP1.concat([{ t: 'hl', m: -4 }]), { w: 130 }), 'ниже вершины: 0 точек')]) },
    { t: '<p>Сколько общих точек у параболы и прямой на рисунке?</p>', v: G([{ t: 'par', a: 1, p: 1, q: -2, lo: -5, hi: 5 }, { t: 'hl', m: 2 }]), ask: ask('Выбери', [['0', '0'], ['1', '1'], ['2', '2']], '2', 'Верно. Прямая выше вершины, пересекает обе ветви.', 'Нет. Вершина на высоте ' + MIN + '2, ветви идут вверх, прямая на высоте 2 выше вершины и пересекает обе ветви: 2 точки.') }
  ] },
  { id: 3, title: 'Вершина параболы', sub: 'Находим по формуле', gen: gen3, teach: [
    { t: '<p>Абсцисса вершины параболы <span class="nw">y = ax² + bx + c</span> вычисляется по формуле</p>' + fx('x₀ = ' + MIN + fr('b', '2a')) + '<p>Ордината вершины y₀ — это значение функции при x = x₀.</p>' },
    { t: '<p>Найдём вершину параболы ' + F('y = x² ' + MIN + ' 4x + 1') + '. Здесь a = 1, b = ' + MIN + '4.</p>' + fx('x₀ = ' + MIN + fr(MIN + '4', '2 · 1') + ' = 2') + '<p>Подставляем x = 2: ' + F('y₀ = 2² ' + MIN + ' 4 · 2 + 1 = ' + MIN + '3') + '. Вершина ' + F('(2; ' + MIN + '3)') + '.</p>', v: G([{ t: 'par', a: 1, p: 2, q: -3, lo: -5, hi: 5 }, { t: 'dot', x: 2, y: -3, col: 'o' }]) },
    { t: '<p>Найди вершину параболы ' + F('y = x² + 2x ' + MIN + ' 2') + '. Сначала x₀ = ' + MIN + '2 : 2 = ' + MIN + '1.</p>', ask: ask('Выбери', [['a', '(' + MIN + '1; ' + MIN + '3)'], ['b', '(1; ' + MIN + '3)'], ['c', '(' + MIN + '1; 3)']], 'a', 'Верно. y₀ = (' + MIN + '1)² + 2 · (' + MIN + '1) ' + MIN + ' 2 = 1 ' + MIN + ' 2 ' + MIN + ' 2 = ' + MIN + '3.', 'Нет. x₀ = ' + MIN + '1. Подставляем: y₀ = 1 ' + MIN + ' 2 ' + MIN + ' 2 = ' + MIN + '3. Вершина (' + MIN + '1; ' + MIN + '3).') }
  ] },
  { id: 4, title: 'Кусочная функция', sub: 'Какую формулу взять', gen: gen4, teach: [
    { t: '<p><span class="key">Кусочная функция</span> задаётся разными формулами на разных промежутках значений x.</p>' + fx(pw([[F('y = x + 1'), 'при x &lt; 2'], [F('y = x² ' + MIN + ' 3'), 'при x ≥ 2']])) + '<p>Чтобы найти y, сначала смотрим, в какой промежуток попадает x, потом считаем по формуле этого промежутка.</p>', v: Gp([{ t: 'line', k: 1, b: 1, lo: -5, hi: 2, hiOpen: true }, { t: 'par', a: 1, p: 0, q: -3, lo: 2, hi: 5 }]) },
    { t: '<p>Для функции выше:</p><p>x = 0. Так как 0 &lt; 2, берём первую формулу: y = 0 + 1 = 1.</p><p>x = 3. Так как 3 ≥ 2, берём вторую: y = 3² ' + MIN + ' 3 = 6.</p><p>x = 2. Граница входит во второй промежуток (знак ≥), берём вторую формулу: y = 2² ' + MIN + ' 3 = 1. По первой формуле было бы 3, это ошибка.</p>' },
    { t: '<p>Найди y при x = ' + MIN + '1 для функции выше.</p>', ask: ask('Выбери', [['a', '0'], ['b', MIN + '2'], ['c', '1']], 'a', 'Верно. ' + MIN + '1 &lt; 2, первая формула: ' + MIN + '1 + 1 = 0.', 'Нет. ' + MIN + '1 &lt; 2, значит берём первую формулу: y = ' + MIN + '1 + 1 = 0.') }
  ] },
  { id: 5, title: 'Закрашенная и выколотая точка', sub: 'Условие по рисунку', gen: gen5, teach: [
    { t: '<p>Знаки <span class="key">&lt;</span> и <span class="key">&gt;</span> (строгие) не включают границу, знаки <span class="key">≤</span> и <span class="key">≥</span> (нестрогие) включают.</p><p>На графике это видно по точке на границе: <span class="key">выколотая</span> (пустой кружок) для строгого знака, <span class="key">закрашенная</span> для нестрогого.</p>', v: two([cap(G([{ t: 'line', k: 1, b: 1, lo: -5, hi: 2 }, { t: 'dot', x: 2, y: 3, open: true }], { w: 150 }), 'x &lt; 2, выколота'), cap(G([{ t: 'line', k: 1, b: 1, lo: -5, hi: 2 }, { t: 'dot', x: 2, y: 3 }], { w: 150 }), 'x ≤ 2, закрашена')]) },
    { t: '<p>Часть графика слева от границы описывается знаком «меньше» (x &lt; c или x ≤ c), справа знаком «больше» (x &gt; c или x ≥ c).</p>', v: two([cap(G([{ t: 'line', k: -1, b: 2, lo: 1, hi: 5 }, { t: 'dot', x: 1, y: 1 }], { w: 150 }), 'x ≥ 1: правее, закрашена'), cap(G([{ t: 'line', k: -1, b: 2, lo: -5, hi: 1 }, { t: 'dot', x: 1, y: 1, open: true }], { w: 150 }), 'x &lt; 1: левее, выколота')]) },
    { t: '<p>Какое условие задаёт часть параболы на рисунке?</p>', v: G([{ t: 'par', a: 1, p: -2, q: -2, lo: -5, hi: -1 }, { t: 'dot', x: -1, y: -1 }]), ask: ask('Выбери', [['a', 'x ≤ ' + MIN + '1'], ['b', 'x &lt; ' + MIN + '1'], ['c', 'x ≥ ' + MIN + '1']], 'a', 'Верно. График левее границы и точка закрашена: x ≤ ' + MIN + '1.', 'Нет. График идёт левее границы ' + MIN + '1 (значит знак «меньше»), точка закрашена (значит знак нестрогий): x ≤ ' + MIN + '1.') }
  ] },
  { id: 6, title: 'График кусочной функции', sub: 'Рисуем по частям', gen: gen6, teach: [
    { t: '<p>Кусочную функцию строят по частям: каждая формула рисуется только на своём промежутке.</p>' + fx(pw([[F('y = x + 2'), 'при x &lt; 0'], [F('y = x²'), 'при x ≥ 0']])), v: Gp(PG0) },
    { t: '<p>Порядок построения:</p><p>1. Левую часть (прямая) чертим до границы x = 0. Там y = 0 + 2 = 2.</p><p>2. Правую часть (парабола) чертим от границы. Там y = 0² = 0.</p><p>3. Ставим точки на границе: знак &lt; значит точка ' + F('(0; 2)') + ' выколота, знак ≥ значит точка ' + F('(0; 0)') + ' закрашена.</p>', v: Gp(PG0) },
    { t: '<p>Для функции выше: какие точки стоят на границе x = 0?</p>', ask: ask('Выбери', [['a', '(0; 2) выколота, (0; 0) закрашена'], ['b', '(0; 2) закрашена, (0; 0) выколота'], ['c', 'обе закрашены']], 'a', 'Верно. Знак &lt; не включает границу, знак ≥ включает.', 'Нет. При x &lt; 0 граница не входит, значит точка (0; 2) выколота. При x ≥ 0 граница входит, значит точка (0; 0) закрашена.') }
  ] },
  { id: 7, title: 'Общие точки кусочного графика', sub: 'Пересечения с y = m', gen: gen7, teach: [
    { t: '<p>У кусочного графика считаем пересечения с прямой y = m отдельно для каждой части и складываем. <span class="key">Выколотую точку не считаем</span>: её нет на графике.</p><p>Для графика на рисунке и прямой ' + F('y = 2') + ': левая часть доходит до высоты 2 только в выколотой точке ' + F('(0; 2)') + ', правая часть пересекает прямую в одной точке (x = √2). Всего 1 точка.</p>', v: Gp(PG0, [{ t: 'hl', m: 2, lbl: 'y = 2' }]) },
    { t: '<p>Та же функция, прямая ' + F('y = 1') + '. Левая часть: x + 2 = 1 даёт x = ' + MIN + '1, подходит (' + MIN + '1 &lt; 0). Правая часть: x² = 1 даёт x = 1 (значение x = ' + MIN + '1 не подходит, правая часть начинается с 0). Всего 2 точки.</p>', v: Gp(PG0, [{ t: 'hl', m: 1, lbl: 'y = 1' }, { t: 'dot', x: -1, y: 1, col: 'o' }, { t: 'dot', x: 1, y: 1, col: 'o' }]) },
    { t: '<p>Другой график, прямая ' + F('y = ' + MIN + '1') + '. Сколько общих точек?</p>', v: Gp(PG0V, [{ t: 'hl', m: -1 }]), ask: ask('Выбери', [['1', '1'], ['2', '2'], ['3', '3']], '2', 'Верно. Левая часть: x + 2 = ' + MIN + '1, x = ' + MIN + '3, 1 точка. Правая: вершина (1; ' + MIN + '1), 1 точка.', 'Нет. Левая часть даёт 1 точку (x = ' + MIN + '3). Правая часть касается прямой в вершине (1; ' + MIN + '1): ещё 1 точка. Всего 2.') }
  ] },
  { id: 8, title: 'Сокращаем дробь', sub: 'Упрощаем формулу', gen: gen8, teach: [
    { t: '<p>Дробь можно сократить на общий множитель числителя и знаменателя. Знаменатель не может быть равен нулю, поэтому значение x, которое его обнуляет, из графика исключается.</p>' + fx('y = ' + fr('(x² + 1)(x ' + MIN + ' 2)', 'x ' + MIN + ' 2')), v: undefined },
    { t: '<p>Сокращаем на x ' + MIN + ' 2:</p>' + fx('y = x² + 1') + '<p>Но в исходной формуле x ' + MIN + ' 2 ≠ 0, значит <span class="key">x ≠ 2</span>. График: парабола ' + F('y = x² + 1') + ' без одной точки.</p>' },
    { t: '<p>Если в знаменателе стоит <span class="key">1 ' + MIN + ' x</span>, то это противоположное выражение: 1 ' + MIN + ' x = ' + MIN + '(x ' + MIN + ' 1). При сокращении появляется минус.</p>' + fx('y = ' + fr('(x² + 2)(x ' + MIN + ' 1)', '1 ' + MIN + ' x')), ask: ask('Упрости', [['a', 'y = ' + MIN + 'x² ' + MIN + ' 2'], ['b', 'y = x² + 2'], ['c', 'y = ' + MIN + 'x² + 2']], 'a', 'Верно. Дробь равна ' + MIN + '(x² + 2) = ' + MIN + 'x² ' + MIN + ' 2, при x ≠ 1.', 'Нет. Знаменатель 1 ' + MIN + ' x = ' + MIN + '(x ' + MIN + ' 1), поэтому после сокращения остаётся ' + MIN + '(x² + 2) = ' + MIN + 'x² ' + MIN + ' 2.') }
  ] },
  { id: 9, title: 'Выколотая точка', sub: 'Где она и какая у неё высота', gen: gen9, teach: [
    { t: '<p>Выколотая точка графика получается при том x, который обнуляет знаменатель исходной дроби. Её ордината находится по <span class="key">упрощённой</span> формуле.</p>' },
    { t: '<p>Пример: ' + F('y = ' + fr('(x² ' + MIN + ' 1)(x ' + MIN + ' 2)', 'x ' + MIN + ' 2')) + '.</p><p>Знаменатель равен нулю при x = 2. Упрощаем: y = x² ' + MIN + ' 1. Подставляем x = 2: y = 4 ' + MIN + ' 1 = 3. Выколотая точка ' + F('(2; 3)') + '.</p>', v: G([{ t: 'par', a: 1, p: 0, q: -1, lo: -5, hi: 5 }, { t: 'dot', x: 2, y: 3, open: true }]) },
    { t: '<p>Найди выколотую точку графика ' + F('y = ' + fr('(x² + 1)(x + 1)', 'x + 1')) + '. Знаменатель равен нулю при x = ' + MIN + '1, упрощённая формула y = x² + 1.</p>', ask: ask('Выбери', [['a', '(' + MIN + '1; 2)'], ['b', '(1; 2)'], ['c', '(' + MIN + '1; 0)']], 'a', 'Верно. y = (' + MIN + '1)² + 1 = 2.', 'Нет. Абсцисса ' + MIN + '1 (при ней знаменатель ноль), ордината y = (' + MIN + '1)² + 1 = 2. Точка (' + MIN + '1; 2).') }
  ] },
  { id: 10, title: 'Прямая и выколотая точка', sub: 'Парабола с дыркой', gen: gen10, teach: [
    { t: '<p>Если прямая y = m проходит через выколотую точку, то это пересечение пропадает: точки, которой нет на графике, не считаем.</p><p>На рисунке график ' + F('y = x² ' + MIN + ' 3') + ', x ≠ 1. Прямая ' + F('y = ' + MIN + '2') + ' проходит через выколотую точку ' + F('(1; ' + MIN + '2)') + ' и пересекает график только в одной точке ' + F('(' + MIN + '1; ' + MIN + '2)') + '.</p>', v: G(GP1.concat([{ t: 'hl', m: -2, lbl: 'y = ' + MIN + '2' }, { t: 'dot', x: 1, y: -2, open: true }, { t: 'dot', x: -1, y: -2, col: 'o' }])) },
    { t: '<p>Для параболы ' + F('y = x² ' + MIN + ' 3') + ' без точки при x = 1:</p><p>m &lt; ' + MIN + '3: общих точек нет.</p><p>m = ' + MIN + '3: одна точка (вершина).</p><p>m = ' + MIN + '2: одна точка (вторая выколота).</p><p>остальные m &gt; ' + MIN + '3: две точки.</p>' },
    { t: '<p>График ' + F('y = x² ' + MIN + ' 1') + ', x ≠ 2, и прямая ' + F('y = 3') + '. Сколько общих точек?</p>', v: G([{ t: 'par', a: 1, p: 0, q: -1, lo: -5, hi: 5, ex: [2] }, { t: 'hl', m: 3 }, { t: 'dot', x: 2, y: 3, open: true }]), ask: ask('Выбери', [['0', '0'], ['1', '1'], ['2', '2']], '1', 'Верно. Прямая проходит через выколотую точку (2; 3), остаётся точка x = ' + MIN + '2.', 'Нет. Прямая y = 3 пересекает параболу при x = ' + MIN + '2 и x = 2, но точка x = 2 выколота. Остаётся 1 точка.') }
  ] },
  { id: 11, title: 'Как в ОГЭ', sub: 'Ровно одна общая точка', gen: gen11, teach: [
    { t: '<p>В задании №22 нужно найти значения m, при которых прямая y = m имеет с графиком ровно одну общую точку. Алгоритм:</p><p>1. Упрости формулу и запиши, какое x исключается.</p><p>2. Найди вершину параболы.</p><p>3. Найди выколотую точку.</p><p>4. Подходят два значения m: высота вершины и высота выколотой точки.</p>' },
    { t: '<p>Пример: ' + F('y = ' + fr('(x² ' + MIN + ' 1)(x ' + MIN + ' 2)', 'x ' + MIN + ' 2')) + '.</p><p>Упрощаем: y = x² ' + MIN + ' 1, x ≠ 2. Вершина ' + F('(0; ' + MIN + '1)') + ', выколотая точка ' + F('(2; 3)') + '.</p><p>При m = ' + MIN + '1 прямая касается параболы в вершине. При m = 3 прямая пересекает параболу в x = ' + MIN + '2 и в выколотой точке x = 2, остаётся одна точка.</p><p>Ответ: ' + MIN + '1; 3.</p>', v: G([{ t: 'par', a: 1, p: 0, q: -1, lo: -5, hi: 5, ex: [2] }, { t: 'hl', m: -1, lbl: 'y = ' + MIN + '1' }, { t: 'hl', m: 3, lbl: 'y = 3' }, { t: 'dot', x: 2, y: 3, open: true }, { t: 'dot', x: 0, y: -1, col: 'o' }, { t: 'dot', x: -2, y: 3, col: 'o' }]) },
    { t: '<p>Если парабола перевёрнута, всё так же. Пример: ' + F('y = ' + fr('(x² + 1)(x ' + MIN + ' 1)', '1 ' + MIN + ' x')) + '. Упрощаем: y = ' + MIN + 'x² ' + MIN + ' 1, x ≠ 1. Вершина ' + F('(0; ' + MIN + '1)') + ', выколотая точка ' + F('(1; ' + MIN + '2)') + '. Какие значения m подходят?</p>', v: G([{ t: 'par', a: -1, p: 0, q: -1, lo: -5, hi: 5, ex: [1] }, { t: 'dot', x: 1, y: -2, open: true }, { t: 'dot', x: 0, y: -1, col: 'o' }]), ask: ask('Выбери', [['a', MIN + '2 и ' + MIN + '1'], ['b', MIN + '1 и 1'], ['c', MIN + '2 и 1']], 'a', 'Верно. m = ' + MIN + '1 (вершина) и m = ' + MIN + '2 (выколотая точка).', 'Нет. Нужны высота вершины (' + MIN + '1) и высота выколотой точки (' + MIN + '2).') }
  ] }
];

STEPS.forEach(function (st) { st.teach.forEach(function (sl) { if (sl.v === undefined) sl.v = ''; }); });

var TAGMSG = {
  'x-vs-y': 'Перепутаны прямые: y = m горизонтальная, x = m вертикальная.',
  'sign': 'Ошибка в знаке: смотри, выше или ниже оси x лежит прямая.',
  'swap-xy': 'Перепутаны x и y: в скобках сначала x, потом y.',
  'one-of-two': 'Прямая выше вершины пересекает обе ветви, а не одну.',
  'touch-two': 'Касание в вершине или прохождение через выколотую точку даёт одну точку, а не две.',
  'hole-counted': 'Выколотую точку считать нельзя: её нет на графике.',
  'sign-x': 'Ошибка в знаке абсциссы: x₀ = −b : (2a), знак b меняется на противоположный.',
  'y-is-c': 'Ордината вершины не равна c. Подставь x₀ в формулу.',
  'wrong-piece': 'Выбрана не та формула. Сначала сравни x с границей, потом считай.',
  'strict-nonstrict': 'Закрашенная точка значит нестрогий знак (≤, ≥), выколотая значит строгий (<, >).',
  'side': 'Перепутана сторона: левее границы x < c, правее границы x > c.',
  'dot-type': 'Неверно стоят закрашенные и выколотые точки на границе.',
  'slope': 'Неверный наклон прямой. Найди точки на границе и посмотри, куда идёт прямая.',
  'parab-sign': 'Неверно направлены ветви параболы: при a > 0 вверх, при a < 0 вниз.',
  'extra-point': 'Точек больше, чем на рисунке. Пересчитай отдельно по каждой части и не считай выколотые точки.',
  'lost-point': 'Часть пересечений пропущена. Проверь обе части графика.',
  'cancel-term': 'При сокращении дроби уходят множители целиком, лишние слагаемые не появляются.',
  'forgot-minus': 'Знаменатель вида a − x противоположен x − a, при сокращении появляется минус.',
  'zero-over-zero': 'Ординату находят по упрощённой формуле, а не по исходной дроби.',
  'forgot-hole': 'Найдена только вершина. Вторая подходящая прямая проходит через выколотую точку.',
  'forgot-vertex': 'Найдена только выколотая точка. Вторая подходящая прямая касается вершины.',
  'order': 'Сначала меньшее значение, потом большее.'
};

var api = { STEPS: STEPS, fr: fr, mx: mx, rnd: rnd };
root.TRAINER = {
  title: 'ОГЭ №22 · График функции и прямая y = m', shortTitle: 'ОГЭ №22', key: 'oge22_trainer_v1',
  sheetUrl: 'https://script.google.com/macros/s/AKfycbyJKYatO3xdOpYJ1WZzszbxqMnOWZ30lsfr5HH7Y23svvX6iqjNNbIUR-RCUeZ8pB15/exec',
  needDefault: 7, needEarly: 5, earlyUpto: 3, tagMsg: TAGMSG, api: api,
  board: ['y = m', 'y = x² + 3', 'x₀ = −{b|2a}', '(0; −1)', '{x² − 1|x − 1}', 'x ≠ 2', 'D(y)', 'y = |x|', 'y = {k|x}', 'x ≥ 2', 'y = −x²', 'm = 3']
};
if (typeof module !== 'undefined' && module.exports) module.exports = root.TRAINER;
})(typeof window !== 'undefined' ? window : globalThis);
