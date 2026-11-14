/* Содержание тренажёра «ОГЭ №23: геометрия на вычисление»: 13 ступеней. Движок: tren/staged.js */
(function (root) {
'use strict';
function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function pick(a) { return a[rnd(0, a.length - 1)]; }
function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = rnd(0, i), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function fr(n, d) { return '<span class="fr"><span class="t">' + n + '</span><span class="b">' + d + '</span></span>'; }
function mx(w, n, d) { return '<span class="mx">' + w + '</span>' + fr(n, d); }
function fx(h) { return '<span class="fx">' + h + '</span>'; }
function ask(q, opts, ans, ok, no) { return { q: q, opts: opts, ans: ans, ok: ok, no: no }; }
function choice(list) { return { type: 'choice', options: shuffle(list.map(function (a) { return { v: String(a[0]), html: a[1], tag: a[2] || '' }; })) }; }
function rows() { return { type: 'rows', rows: Array.prototype.slice.call(arguments) }; }
var R = { int: function (l, k) { return { label: l, kind: 'int', key: k }; } };

/* ---------- рисунки (подписи отодвинуты от линий) ---------- */
var INK = '#EEE0C8', ACC = '#DD7A3A', NUM = '#E2B04A';
function f1(n) { return Math.round(n * 10) / 10; }
function mid(p, q, t) { t = t === undefined ? 0.5 : t; return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]; }
function cen(P) { var x = 0, y = 0; P.forEach(function (p) { x += p[0]; y += p[1]; }); return [x / P.length, y / P.length]; }
function away(p, c, d) { var dx = p[0] - c[0], dy = p[1] - c[1], l = Math.hypot(dx, dy) || 1; return [p[0] + dx / l * d, p[1] + dy / l * d]; }
function L(p, q, dash) { return '<line x1="' + f1(p[0]) + '" y1="' + f1(p[1]) + '" x2="' + f1(q[0]) + '" y2="' + f1(q[1]) + '" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round"' + (dash ? ' stroke-dasharray="6 5"' : '') + '/>'; }
function T(x, y, s) {
  s = String(s); if (s === '') return '';
  var col = s === '?' ? ACC : /^[A-Z]$/.test(s) ? INK : NUM;
  return '<text x="' + f1(x) + '" y="' + f1(y) + '" text-anchor="middle" dominant-baseline="central" font-size="18" font-weight="700" fill="' + col + '" font-family="system-ui,sans-serif">' + s + '</text>';
}
function dot(p) { return '<circle cx="' + f1(p[0]) + '" cy="' + f1(p[1]) + '" r="3" fill="' + INK + '"/>'; }
function RA(v, a, b) {
  var s = 11, ux = a[0] - v[0], uy = a[1] - v[1], l1 = Math.hypot(ux, uy), wx = b[0] - v[0], wy = b[1] - v[1], l2 = Math.hypot(wx, wy);
  ux = ux / l1 * s; uy = uy / l1 * s; wx = wx / l2 * s; wy = wy / l2 * s;
  return '<path d="M' + f1(v[0] + ux) + ' ' + f1(v[1] + uy) + ' L' + f1(v[0] + ux + wx) + ' ' + f1(v[1] + uy + wy) + ' L' + f1(v[0] + wx) + ' ' + f1(v[1] + wy) + '" fill="none" stroke="' + INK + '" stroke-width="1.8"/>';
}
/* подпись отрезка: sign 0 = наружу от центра c; ±1 = по перпендикуляру; d = расстояние; t = место на отрезке */
function segLab(e, c) {
  var p = e[0], q = e[1], s = e[2], sign = e[3] || 0, d = e[4] || 17, t = e[5] === undefined ? 0.5 : e[5];
  var m = mid(p, q, t), dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l;
  if (!sign) { if (nx * (m[0] - c[0]) + ny * (m[1] - c[1]) < 0) { nx = -nx; ny = -ny; } } else { nx *= sign; ny *= sign; }
  return T(m[0] + nx * d, m[1] + ny * d, s);
}
function svg(w, h, body) { return '<svg viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" role="img" style="max-width:100%;height:auto;display:block;margin:10px auto"><g transform="translate(0,10)">' + body + '</g></svg>'; }
/* P — многоугольник, names — буквы вершин, o: segs, dash, solid, ra, pts [[p,имя,dx,dy]], lbls [[x,y,текст]] */
function fig(P, names, o, w, h) {
  var c = cen(P), s = '';
  P.forEach(function (p, i) { s += L(p, P[(i + 1) % P.length]); });
  (o.solid || []).forEach(function (e) { s += L(e[0], e[1]); });
  (o.dash || []).forEach(function (e) { s += L(e[0], e[1], true); });
  (o.ra || []).forEach(function (e) { s += RA(e[0], e[1], e[2]); });
  P.forEach(function (p, i) { var a = away(p, c, 16); s += T(a[0], a[1], names[i]); });
  (o.pts || []).forEach(function (e) { s += dot(e[0]) + T(e[0][0] + e[2], e[0][1] + e[3], e[1]); });
  (o.segs || []).forEach(function (e) { s += segLab(e, c); });
  (o.lbls || []).forEach(function (e) { s += T(e[0], e[1], e[2]); });
  return svg(w || 300, h || 215, s);
}
var tail = function (x) { return x === undefined ? '' : x; };

/* прямоугольный треугольник: C — прямой угол */
var rA = [60, 45], rB = [250, 165], rC = [60, 165];
function figRT(la, lb, lc) { return fig([rA, rB, rC], ['A', 'B', 'C'], { segs: [[rC, rA, la], [rC, rB, lb], [rA, rB, lc]], ra: [[rC, rA, rB]] }); }
function figMed(la, lb, lc, lm) {
  var M = mid(rA, rB);
  return fig([rA, rB, rC], ['A', 'B', 'C'], { segs: [[rC, rA, la], [rC, rB, lb], [rA, rB, lc, 0, 17, 0.25], [rC, M, lm, 1, 14]], dash: [[rC, M]], pts: [[M, 'M', 12, -14]], ra: [[rC, rA, rB]] });
}
/* равнобедренный треугольник с высотой BH */
function figIso(side, base, h) {
  var A = [50, 165], B = [150, 28], C = [250, 165], H = [150, 165];
  return fig([A, B, C], ['A', 'B', 'C'], { segs: [[A, B, side], [B, C, side]], dash: [[B, H]], ra: [[H, B, C]], pts: [[H, 'H', 0, 17]], lbls: [[165, 96, h], [150, 200, base]] }, 300, 225);
}
function figTri(a, h) {
  var A = [40, 170], B = [110, 50], C = [260, 170], H = [110, 170];
  return fig([A, B, C], ['A', 'B', 'C'], { segs: [[A, C, a, 0, 17, 0.68]], dash: [[B, H]], ra: [[H, B, C]], pts: [[H, 'H', 0, 17]], lbls: [[126, 112, h]] });
}
function figPar(a, h) {
  var A = [40, 170], B = [100, 50], C = [260, 50], D = [200, 170], H = [100, 170];
  return fig([A, B, C, D], ['A', 'B', 'C', 'D'], { segs: [[A, D, a, 0, 17, 0.72]], dash: [[B, H]], ra: [[H, B, D]], pts: [[H, 'H', 0, 17]], lbls: [[116, 112, h]] });
}
var tA = [30, 170], tB = [100, 50], tC = [230, 50], tD = [270, 170];
function figTrap(bc, ad, h) {
  var H = [100, 170];
  return fig([tA, tB, tC, tD], ['A', 'B', 'C', 'D'], { segs: [[tB, tC, bc], [tA, tD, ad, 0, 17, 0.7]], dash: [[tB, H]], ra: [[H, tB, tD]], pts: [[H, 'H', 0, 17]], lbls: [[116, 112, h]] });
}
function figTriMid(ac, mn) {
  var A = [40, 170], B = [150, 35], C = [260, 170], M = mid(A, B), N = mid(B, C);
  return fig([A, B, C], ['A', 'B', 'C'], { segs: [[A, C, ac], [M, N, mn, -1, 15]], solid: [[M, N]], pts: [[M, 'M', -17, 0], [N, 'N', 17, 0]] });
}
function figTrapMid(bc, ad, mn) {
  var M = mid(tA, tB), N = mid(tD, tC);
  return fig([tA, tB, tC, tD], ['A', 'B', 'C', 'D'], { segs: [[tB, tC, bc], [tA, tD, ad], [M, N, mn, 1, 16]], solid: [[M, N]], pts: [[M, 'M', -17, 0], [N, 'N', 17, 0]] });
}
function figSim(bm, ma, mn, ac, f) {
  f = Math.max(0.3, Math.min(0.7, f));
  var B = [150, 25], A = [40, 175], C = [260, 175], M = mid(B, A, f), N = mid(B, C, f);
  return fig([A, B, C], ['A', 'B', 'C'], { segs: [[B, M, bm], [M, A, ma], [A, C, ac], [M, N, mn, -1, 15]], solid: [[M, N]], pts: [[M, 'M', -17, 0], [N, 'N', 17, 0]] });
}
function figDiag(bc, ad, bo, od) {
  /* O — пересечение диагоналей AC и BD */
  var t = (tC[0] - tB[0]) / ((tC[0] - tB[0]) + (tD[0] - tA[0])), O = [tB[0] + (tD[0] - tB[0]) * t, tB[1] + (tD[1] - tB[1]) * t];
  return fig([tA, tB, tC, tD], ['A', 'B', 'C', 'D'], { segs: [[tB, tC, bc], [tA, tD, ad], [tB, O, bo, 1, 14], [O, tD, od, 1, 14]], solid: [[tA, tC], [tB, tD]], lbls: [[O[0], O[1] - 16, 'O']] });
}
function figParK(ab, kc, bc, f) {
  f = Math.max(0.3, Math.min(0.7, f));
  var A = [40, 170], B = [100, 50], C = [260, 50], D = [200, 170], K = mid(B, C, f);
  return fig([A, B, C, D], ['A', 'B', 'C', 'D'], { segs: [[A, B, ab], [K, C, kc, 0, 17], [B, C, bc, 0, 40]], solid: [[A, K]], pts: [[K, 'K', 0, -17]] }, 300, 225);
}
function figTang(r, ab, oa) {
  var O = [85, 110], R0 = 65, A = [275, 110], th = Math.acos(R0 / 190), B = [O[0] + R0 * Math.cos(th), O[1] - R0 * Math.sin(th)];
  var s = '<circle cx="' + O[0] + '" cy="' + O[1] + '" r="' + R0 + '" fill="none" stroke="' + INK + '" stroke-width="2.2"/>';
  s += L(O, B) + L(B, A) + L(O, A, true) + RA(B, O, A) + dot(O);
  var bl = away(B, O, 16);
  s += T(O[0] - 14, O[1] + 14, 'O') + T(bl[0], bl[1], 'B') + T(A[0] + 15, A[1], 'A');
  s += segLab([O, B, r, -1, 14], O) + segLab([B, A, ab, -1, 17], O) + segLab([O, A, oa, 1, 17, 0.62], O);
  return svg(320, 215, s);
}
function figChords(am, mb, cm, md) {
  var cx = 160, cy = 100, r = 82;
  function pt(deg) { var a = deg * Math.PI / 180; return [cx + r * Math.cos(a), cy - r * Math.sin(a)]; }
  var A = pt(130), B = pt(350), C = pt(40), D = pt(250);
  var x1 = A[0], y1 = A[1], x2 = B[0], y2 = B[1], x3 = C[0], y3 = C[1], x4 = D[0], y4 = D[1];
  var den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  var px = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / den, py = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / den;
  var M = [px, py];
  function unit(p) { var dx = p[0] - M[0], dy = p[1] - M[1], l = Math.hypot(dx, dy); return [dx / l, dy / l]; }
  var ua = unit(A), uc = unit(C), bx = ua[0] + uc[0], by = ua[1] + uc[1], bl = Math.hypot(bx, by);
  var s = '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + INK + '" stroke-width="2.2"/>' + L(A, B) + L(C, D) + dot(M);
  [[A, 'A'], [B, 'B'], [C, 'C'], [D, 'D']].forEach(function (e) { var a = away(e[0], [cx, cy], 16); s += T(a[0], a[1], e[1]); });
  s += T(M[0] + bx / bl * 19, M[1] + by / bl * 19, 'M');
  s += segLab([A, M, am, 1, 15], M) + segLab([M, B, mb, 1, 15], M) + segLab([C, M, cm, -1, 15], M) + segLab([M, D, md, 1, 15], M);
  return svg(320, 215, s);
}
function figIsoTrap(bc, ad, side, h) {
  var A = [45, 170], D = [275, 170], B = [105, 55], C = [215, 55], H = [105, 170], K = [215, 170];
  return fig([A, B, C, D], ['A', 'B', 'C', 'D'], { segs: [[B, C, bc], [A, D, ad], [A, B, side], [C, D, side]], dash: [[B, H], [C, K]], ra: [[H, B, D], [K, C, A]], pts: [[H, 'H', 0, 17], [K, 'K', 0, 17]], lbls: [[120, 112, h]] });
}

/* ---------- заготовки заданий ---------- */
var TRI = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]];
function triple(evenHyp) {
  var t = pick(TRI), k = t[0] === 3 ? rnd(1, 5) : t[0] === 5 ? rnd(1, 2) : 1;
  if (evenHyp) { t = pick([[3, 4, 5], [5, 12, 13]]); k = 2 * rnd(1, t[0] === 3 ? 3 : 1); }
  var a = t[0] * k, b = t[1] * k, c = t[2] * k;
  return Math.random() < 0.5 ? [a, b, c] : [b, a, c];
}
function one(q, fg, ans, hint, tagf, label) {
  return { q: '<p>' + q + '</p>' + fg, input: rows(R.int(label || 'Ответ', 'x')), check: function (v) { return v.x === ans ? 'ok' : 'wrong'; },
    tag: function (v) { return tagf ? (tagf(v.x) || '') : ''; }, sol: { x: ans }, hint: hint };
}

/* ---------- генераторы ---------- */
function gen1() {
  var t = triple(), a = t[0], b = t[1], c = t[2];
  return one('В треугольнике ABC угол C прямой, AC = ' + a + ', BC = ' + b + '. Найди AB.', figRT(a, b, '?'), c,
    'AB — гипотенуза. AB² = AC² + BC² = ' + a * a + ' + ' + b * b + ' = ' + c * c + '. Значит, AB = ' + c + '.',
    function (x) { return x === a + b ? 'sum-legs' : x === a * a + b * b ? 'no-root' : ''; });
}
function gen2() {
  var t = triple(), a = t[0], b = t[1], c = t[2];
  return one('В треугольнике ABC угол C прямой, AB = ' + c + ', AC = ' + a + '. Найди BC.', figRT(a, '?', c), b,
    'BC — катет. BC² = AB² − AC² = ' + c * c + ' − ' + a * a + ' = ' + b * b + '. Значит, BC = ' + b + '.',
    function (x) { return x === c - a ? 'subtract-sides' : x === c * c - a * a ? 'no-root' : ''; });
}
function gen3() {
  var t = triple(), m = t[0], h = t[1], c = t[2];
  if (Math.random() < 0.5) {
    return one('В равнобедренном треугольнике ABC боковая сторона AB = BC = ' + c + ', основание AC = ' + 2 * m + ', BH — высота. Найди BH.', figIso(c, 'AC = ' + 2 * m, '?'), h,
      'Высота BH в равнобедренном треугольнике и медиана: AH = ' + 2 * m + ' : 2 = ' + m + '. В треугольнике ABH: BH² = ' + c + '² − ' + m + '² = ' + c * c + ' − ' + m * m + ' = ' + h * h + ', BH = ' + h + '.',
      function (x) { return x === c - m ? 'subtract-sides' : x === m ? 'half-base' : x === c * c - m * m ? 'no-root' : ''; });
  }
  return one('В равнобедренном треугольнике ABC основание AC = ' + 2 * m + ', высота BH = ' + h + '. Найди боковую сторону AB.', figIso('?', 'AC = ' + 2 * m, h), c,
    'Высота BH — ещё и медиана: AH = ' + 2 * m + ' : 2 = ' + m + '. В треугольнике ABH: AB² = ' + m + '² + ' + h + '² = ' + m * m + ' + ' + h * h + ' = ' + c * c + ', AB = ' + c + '.',
    function (x) { return x === m + h ? 'sum-legs' : x === m * m + h * h ? 'no-root' : ''; });
}
function gen4() {
  var t = triple(true), a = t[0], b = t[1], c = t[2], v = rnd(0, 2);
  if (v === 0) return one('В прямоугольном треугольнике ABC (угол C прямой) гипотенуза AB = ' + c + ', CM — медиана. Найди CM.', figMed('', '', c, '?'), c / 2,
    'Медиана к гипотенузе равна половине гипотенузы: CM = ' + c + ' : 2 = ' + c / 2 + '.', function (x) { return x === c ? 'forgot-half' : ''; });
  if (v === 1) return one('В прямоугольном треугольнике ABC (угол C прямой) медиана CM = ' + c / 2 + '. Найди гипотенузу AB.', figMed('', '', '?', c / 2), c,
    'Медиана к гипотенузе равна её половине, поэтому гипотенуза вдвое больше медианы: AB = ' + c / 2 + ' · 2 = ' + c + '.', function (x) { return x === c / 2 ? 'median-is-hyp' : ''; });
  return one('В прямоугольном треугольнике ABC (угол C прямой) катеты AC = ' + a + ', BC = ' + b + ', CM — медиана. Найди CM.', figMed(a, b, '', '?'), c / 2,
    'Сначала гипотенуза: AB² = ' + a + '² + ' + b + '² = ' + c * c + ', AB = ' + c + '. Потом медиана: CM = ' + c + ' : 2 = ' + c / 2 + '.', function (x) { return x === c ? 'forgot-half' : ''; });
}
function gen5() {
  var k = rnd(0, 2);
  if (k === 0) { var a = rnd(4, 20), h = rnd(3, 16); if (a * h % 2) a++;
    return one('В треугольнике ABC сторона AC = ' + a + ', высота BH = ' + h + '. Найди площадь треугольника ABC.', figTri(a, h), a * h / 2,
      'Площадь треугольника: половина произведения стороны на проведённую к ней высоту. S = ' + a + ' · ' + h + ' : 2 = ' + a * h / 2 + '.', function (x) { return x === a * h ? 'forgot-half' : ''; }); }
  if (k === 1) { var a1 = rnd(3, 15), h1 = rnd(3, 12);
    return one('В параллелограмме ABCD сторона AD = ' + a1 + ', высота BH, проведённая к ней, равна ' + h1 + '. Найди площадь параллелограмма.', figPar(a1, h1), a1 * h1,
      'Площадь параллелограмма: произведение стороны на проведённую к ней высоту. S = ' + a1 + ' · ' + h1 + ' = ' + a1 * h1 + '.', function (x) { return x * 2 === a1 * h1 ? 'half-wrong' : ''; }); }
  var b2 = rnd(2, 10), a2 = b2 + 2 * rnd(1, 6), h2 = rnd(2, 12);
  return one('В трапеции ABCD основания BC = ' + b2 + ' и AD = ' + a2 + ', высота BH = ' + h2 + '. Найди площадь трапеции.', figTrap(b2, a2, h2), (a2 + b2) / 2 * h2,
    'Площадь трапеции: полусумма оснований, умноженная на высоту. S = (' + b2 + ' + ' + a2 + ') : 2 · ' + h2 + ' = ' + (a2 + b2) / 2 + ' · ' + h2 + ' = ' + (a2 + b2) / 2 * h2 + '.',
    function (x) { return x === (a2 + b2) * h2 ? 'forgot-half' : ''; });
}
function gen6() {
  var k = rnd(0, 3), a, b, m;
  if (k === 0) { m = rnd(3, 14); return one('В треугольнике ABC точки M и N — середины сторон AB и BC. AC = ' + 2 * m + '. Найди MN.', figTriMid(2 * m, '?'), m,
      'MN — средняя линия, она вдвое короче параллельной ей стороны AC: MN = ' + 2 * m + ' : 2 = ' + m + '.', function (x) { return x === 2 * m ? 'forgot-half' : ''; }); }
  if (k === 1) { m = rnd(3, 14); return one('В треугольнике ABC точки M и N — середины сторон AB и BC. MN = ' + m + '. Найди AC.', figTriMid('?', m), 2 * m,
      'MN — средняя линия, а средняя линия вдвое короче стороны AC. Значит, AC = ' + m + ' · 2 = ' + 2 * m + '.', function (x) { return x === m ? 'forgot-double' : ''; }); }
  if (k === 2) { b = rnd(2, 10); a = b + 2 * rnd(1, 7); return one('В трапеции ABCD основания BC = ' + b + ' и AD = ' + a + '. M и N — середины боковых сторон AB и CD. Найди MN.', figTrapMid(b, a, '?'), (a + b) / 2,
      'MN — средняя линия трапеции, она равна полусумме оснований: (' + b + ' + ' + a + ') : 2 = ' + (a + b) / 2 + '.', function (x) { return x === a + b ? 'forgot-half' : ''; }); }
  b = rnd(2, 10); a = b + 2 * rnd(1, 7); m = (a + b) / 2;
  return one('В трапеции ABCD основание BC = ' + b + ', средняя линия MN = ' + m + '. Найди основание AD.', figTrapMid(b, '?', m), a,
    'Средняя линия — полусумма оснований, значит сумма оснований вдвое больше: BC + AD = ' + m + ' · 2 = ' + 2 * m + '. Тогда AD = ' + 2 * m + ' − ' + b + ' = ' + a + '.', function (x) { return x === m - b ? 'mid-minus' : x === m ? 'mid-is-base' : ''; });
}
function gen7() {
  var p = rnd(2, 7), q = rnd(2, 7); while (q === p) q = rnd(2, 7); var k = rnd(1, 4), ac = k * (p + q), mn = k * p;
  if (Math.random() < 0.6) return one('В треугольнике ABC точки M и N лежат на сторонах AB и BC, MN ∥ AC. BM = ' + p + ', MA = ' + q + ', AC = ' + ac + '. Найди MN.', figSim(p, q, '?', ac, p / (p + q)), mn,
    'Треугольники BMN и BAC подобны, BA = ' + p + ' + ' + q + ' = ' + (p + q) + '. MN : AC = BM : BA = ' + p + ' : ' + (p + q) + '. MN = ' + ac + ' · ' + p + ' : ' + (p + q) + ' = ' + mn + '.',
    function (x) { return x === k * q ? 'part-instead' : x === ac - mn ? 'part-instead' : ''; });
  return one('В треугольнике ABC точки M и N лежат на сторонах AB и BC, MN ∥ AC. BM = ' + p + ', MA = ' + q + ', MN = ' + mn + '. Найди AC.', figSim(p, q, mn, '?', p / (p + q)), ac,
    'Треугольники BMN и BAC подобны, BA = ' + (p + q) + '. MN : AC = BM : BA, поэтому AC = ' + mn + ' · ' + (p + q) + ' : ' + p + ' = ' + ac + '.', function (x) { return x === mn + q ? 'part-instead' : ''; });
}
function gen8() {
  var pq = pick([[1, 2], [2, 3], [1, 3], [3, 4], [2, 5], [3, 5], [1, 4]]), p = pq[0], q = pq[1], s = rnd(1, 4), t = rnd(1, 5);
  var bc = p * s, ad = q * s, bo = p * t, od = q * t, v = rnd(0, 2);
  var text = 'Диагонали трапеции ABCD с основаниями BC и AD пересекаются в точке O. ';
  if (v === 0) return one(text + 'BC = ' + bc + ', AD = ' + ad + ', BO = ' + bo + '. Найди OD.', figDiag(bc, ad, bo, '?'), od,
    'Треугольники BOC и DOA подобны, BO : OD = BC : AD. OD = BO · AD : BC = ' + bo + ' · ' + ad + ' : ' + bc + ' = ' + od + '.', function (x) { return x * ad === bo * bc ? 'swap-ratio' : ''; });
  if (v === 1) return one(text + 'AD = ' + ad + ', BO = ' + bo + ', OD = ' + od + '. Найди BC.', figDiag('?', ad, bo, od), bc,
    'Из подобия BO : OD = BC : AD. BC = AD · BO : OD = ' + ad + ' · ' + bo + ' : ' + od + ' = ' + bc + '.', function (x) { return x * bo === ad * od ? 'swap-ratio' : ''; });
  return one(text + 'BC = ' + bc + ', AD = ' + ad + ', BD = ' + (bo + od) + '. Найди OD.', figDiag(bc, ad, '', '?'), od,
    'BO : OD = BC : AD = ' + p + ' : ' + q + ', значит BD делится на ' + (p + q) + ' части, OD — ' + q + ' из них. BD : ' + (p + q) + ' = ' + t + ', OD = ' + t + ' · ' + q + ' = ' + od + '.', function (x) { return x === bo + od ? 'whole-diagonal' : x === bo ? 'wrong-part' : ''; });
}
function gen9() {
  var a = rnd(3, 9), d = rnd(2, 8), b = a + d, v = rnd(0, 2);
  var text = 'Биссектриса угла A параллелограмма ABCD пересекает сторону BC в точке K. ';
  if (v === 0) return one(text + 'AB = ' + a + ', BC = ' + b + '. Найди KC.', figParK(a, '?', b, a / b), d,
    'Биссектриса отсекает равнобедренный треугольник ABK: BK = AB = ' + a + '. Тогда KC = BC − BK = ' + b + ' − ' + a + ' = ' + d + '.', function (x) { return x === a ? 'bk-not-kc' : x === b ? 'whole-side' : ''; });
  if (v === 1) return one(text + 'AB = ' + a + ', KC = ' + d + '. Найди BC.', figParK(a, d, '?', a / b), b,
    'Треугольник ABK равнобедренный, BK = AB = ' + a + '. BC = BK + KC = ' + a + ' + ' + d + ' = ' + b + '.', function (x) { return x === d ? 'part-only' : ''; });
  return one(text + 'AB = ' + a + ', KC = ' + d + '. Найди периметр параллелограмма.', figParK(a, d, '', a / b), 2 * (a + b),
    'BK = AB = ' + a + ', поэтому BC = ' + a + ' + ' + d + ' = ' + b + '. Периметр: 2 · (' + a + ' + ' + b + ') = ' + 2 * (a + b) + '.', function (x) { return x === a + b ? 'half-perimeter' : ''; });
}
function gen10() {
  var t = triple(), r = t[0], ab = t[1], oa = t[2], v = rnd(0, 2);
  var text = 'Прямая AB касается окружности с центром O в точке B. ';
  if (v === 0) return one(text + 'Радиус OB = ' + r + ', OA = ' + oa + '. Найди AB.', figTang(r, '?', oa), ab,
    'Радиус, проведённый в точку касания, перпендикулярен касательной: угол OBA прямой. AB² = OA² − OB² = ' + oa * oa + ' − ' + r * r + ' = ' + ab * ab + ', AB = ' + ab + '.', function (x) { return x === oa - r ? 'subtract-sides' : x === oa * oa - r * r ? 'no-root' : ''; });
  if (v === 1) return one(text + 'Радиус OB = ' + r + ', AB = ' + ab + '. Найди OA.', figTang(r, ab, '?'), oa,
    'Угол OBA прямой, OA — гипотенуза. OA² = ' + r + '² + ' + ab + '² = ' + oa * oa + ', OA = ' + oa + '.', function (x) { return x === r + ab ? 'sum-legs' : x === r * r + ab * ab ? 'no-root' : ''; });
  return one(text + 'AB = ' + ab + ', OA = ' + oa + '. Найди радиус окружности.', figTang('?', ab, oa), r,
    'Угол OBA прямой. OB² = OA² − AB² = ' + oa * oa + ' − ' + ab * ab + ' = ' + r * r + ', OB = ' + r + '.', function (x) { return x === oa - ab ? 'subtract-sides' : x === oa * oa - ab * ab ? 'no-root' : ''; });
}
function gen11() {
  var c = rnd(2, 8), d = rnd(2, 9), P = c * d, divs = [], i;
  for (i = 1; i <= P; i++) if (P % i === 0 && i <= 18 && P / i <= 18) divs.push(i);
  var a = pick(divs), b = P / a, u = rnd(0, 3), vals = [a, b, c, d], ans = vals[u], L4 = vals.map(function (x, j) { return j === u ? '?' : x; });
  var names = ['AM', 'MB', 'CM', 'MD'], known = vals.filter(function (x, j) { return j !== u; });
  var pair = u < 2 ? [vals[1 - u], null] : [null, vals[5 - u]];
  var other = u < 2 ? vals[1 - u] : vals[5 - u], left = u < 2 ? [c, d] : [a, b];
  return one('Хорды AB и CD окружности пересекаются в точке M. ' + names.filter(function (n, j) { return j !== u; }).map(function (n, j) { return n + ' = ' + known[j]; }).join(', ') + '. Найди ' + names[u] + '.', figChords(L4[0], L4[1], L4[2], L4[3]), ans,
    'Произведения отрезков пересекающихся хорд равны: AM · MB = CM · MD. ' + (u < 2 ? 'CM · MD = ' + left[0] + ' · ' + left[1] + ' = ' + P + '. ' + names[u] + ' = ' + P + ' : ' + other + ' = ' + ans + '.' : 'AM · MB = ' + left[0] + ' · ' + left[1] + ' = ' + P + '. ' + names[u] + ' = ' + P + ' : ' + other + ' = ' + ans + '.'),
    function (x) { return x === known[0] * known[1] * known[2] ? 'all-multiplied' : x === known[0] + known[1] - known[2] ? 'add-sub' : ''; });
}
function gen12() {
  var t = triple(), m = t[0], h = t[1], c = t[2], a = rnd(2, 10), b = a + 2 * m, v = rnd(0, 2);
  var text = 'В равнобедренной трапеции ABCD основания BC = ' + a + ' и AD = ' + b + ', ';
  if (v === 0) return one(text + 'боковые стороны AB = CD = ' + c + '. Найди высоту трапеции.', figIsoTrap(a, b, c, '?'), h,
    'Опустим высоты BH и CK. AH = (AD − BC) : 2 = (' + b + ' − ' + a + ') : 2 = ' + m + '. В треугольнике ABH: BH² = ' + c + '² − ' + m + '² = ' + h * h + ', BH = ' + h + '.', function (x) { return x === c - m ? 'subtract-sides' : x === m ? 'half-diff' : ''; });
  if (v === 1) return one(text + 'боковые стороны AB = CD = ' + c + '. Найди площадь трапеции.', figIsoTrap(a, b, c, ''), (a + m) * h,
    'AH = (' + b + ' − ' + a + ') : 2 = ' + m + '. Высота: BH² = ' + c + '² − ' + m + '² = ' + h * h + ', BH = ' + h + '. Площадь: (' + a + ' + ' + b + ') : 2 · ' + h + ' = ' + (a + m) + ' · ' + h + ' = ' + (a + m) * h + '.', function (x) { return x === (a + m) * c ? 'side-as-height' : x === (a + b) * h ? 'forgot-half' : ''; });
  return one('В равнобедренной трапеции ABCD основание BC = ' + a + ', боковые стороны AB = CD = ' + c + ', высота ' + h + '. Найди основание AD.', figIsoTrap(a, '?', c, h), b,
    'Из треугольника ABH: AH² = ' + c + '² − ' + h + '² = ' + m * m + ', AH = ' + m + '. Такой же отрезок отсекает и высота CK. AD = ' + m + ' + ' + a + ' + ' + m + ' = ' + b + '.', function (x) { return x === a + m ? 'one-side-only' : ''; });
}
function gen13() { return pick([gen1, gen2, gen3, gen4, gen5, gen6, gen7, gen8, gen9, gen10, gen11, gen12])(); }

/* ---------- ступени ---------- */
var STEPS = [
  { id: 1, title: 'Теорема Пифагора: гипотенуза', sub: 'Находим самую длинную сторону', gen: gen1, teach: [
    { t: '<p><span class="key">Прямоугольный треугольник</span> — треугольник, у которого один угол прямой. Стороны, прилежащие к прямому углу, называются <span class="key">катетами</span>, а сторона напротив прямого угла — <span class="key">гипотенузой</span>. Гипотенуза всегда самая длинная. На рисунке a и b — катеты, c — гипотенуза.</p>', v: figRT('a', 'b', 'c') },
    { t: '<p><span class="key">Теорема Пифагора.</span> В прямоугольном треугольнике квадрат гипотенузы равен сумме квадратов катетов.</p>' + fx('c² = a² + b²'), v: '' },
    { t: '<p>Катеты 3 и 4. Возводим в квадрат и складываем: 9 + 16 = 25. Гипотенуза — число, квадрат которого 25. Это 5.</p>' + fx('3² + 4² = 5²'), v: figRT(3, 4, '?') },
    { t: '<p>Катеты 6 и 8. Чему равна гипотенуза?</p>', v: '', ask: ask('Гипотенуза', [['10', '10'], ['14', '14'], ['100', '100']], '10', 'Верно. 36 + 64 = 100, а 10² = 100.', 'Нет. Нужно сложить квадраты катетов: 36 + 64 = 100, и извлечь корень: 10.') }
  ] },
  { id: 2, title: 'Теорема Пифагора: катет', sub: 'Когда известна гипотенуза', gen: gen2, teach: [
    { t: '<p>Если неизвестен катет, теорема Пифагора записывается так: квадрат катета равен разности квадратов гипотенузы и другого катета.</p>' + fx('b² = c² − a²'), v: '' },
    { t: '<p>Гипотенуза 13, катет 5. Квадрат второго катета: 169 − 25 = 144. Сам катет — 12.</p>' + fx('13² − 5² = 12²'), v: figRT(5, '?', 13) },
    { t: '<p><b>Частая ошибка.</b> Вычитать надо квадраты, а не сами длины: 13 − 5 = 8 — неверно. И не забывай в конце извлечь корень.</p>', v: '' },
    { t: '<p>Гипотенуза 10, катет 6. Чему равен второй катет?</p>', v: '', ask: ask('Катет', [['8', '8'], ['4', '4'], ['64', '64']], '8', 'Верно. 100 − 36 = 64, корень из 64 равен 8.', 'Нет. 10² − 6² = 100 − 36 = 64. Квадрат катета 64, значит катет 8.') }
  ] },
  { id: 3, title: 'Равнобедренный треугольник', sub: 'Высота к основанию', gen: gen3, teach: [
    { t: '<p>В <span class="key">равнобедренном треугольнике</span> боковые стороны равны. Высота, проведённая к основанию, является также медианой: она делит основание пополам.</p>', v: figIso('c', 'AC', 'h') },
    { t: '<p>Значит, высота BH разбивает треугольник на два прямоугольных. Половина основания — один катет, высота — второй катет, боковая сторона — гипотенуза.</p>' + fx('c² = h² + (AC : 2)²'), v: '' },
    { t: '<p>Боковая сторона 13, основание 10. Половина основания 5. Высота: 169 − 25 = 144, высота равна 12.</p>', v: figIso(13, 'AC = 10', '?') },
    { t: '<p>Основание равнобедренного треугольника 16. Чему равна половина основания, которую берём в теорему Пифагора?</p>', v: '', ask: ask('Половина основания', [['8', '8'], ['16', '16'], ['32', '32']], '8', 'Верно. Высота делит основание пополам: 16 : 2 = 8.', 'Нет. Высота к основанию — медиана, она делит основание пополам: 16 : 2 = 8.') }
  ] },
  { id: 4, title: 'Медиана к гипотенузе', sub: 'Она равна половине гипотенузы', gen: gen4, teach: [
    { t: '<p>Медиана — отрезок, соединяющий вершину с серединой противоположной стороны.</p><p><span class="key">Свойство.</span> Медиана прямоугольного треугольника, проведённая к гипотенузе, равна половине гипотенузы.</p>' + fx('CM = AB : 2'), v: figMed('', '', 'c', 'm') },
    { t: '<p>Гипотенуза 10, значит медиана к ней равна 5. Обратно: если медиана равна 7, гипотенуза равна 14.</p>', v: '' },
    { t: '<p>Если даны катеты, сначала найди гипотенузу по теореме Пифагора, потом раздели на 2. Катеты 6 и 8: гипотенуза 10, медиана 5.</p>', v: figMed(6, 8, '', '?') },
    { t: '<p>Медиана к гипотенузе равна 9. Чему равна гипотенуза?</p>', v: '', ask: ask('Гипотенуза', [['18', '18'], ['9', '9'], ['4,5', '4,5']], '18', 'Верно. Гипотенуза вдвое больше медианы.', 'Нет. Медиана — половина гипотенузы, значит гипотенуза 9 · 2 = 18.') }
  ] },
  { id: 5, title: 'Площади фигур', sub: 'Треугольник, параллелограмм, трапеция', gen: gen5, teach: [
    { t: '<p><span class="key">Площадь треугольника</span> равна половине произведения стороны на проведённую к ней высоту.</p>' + fx('S = a · h : 2'), v: figTri('a', 'h') },
    { t: '<p><span class="key">Площадь параллелограмма</span> равна произведению стороны на проведённую к ней высоту.</p>' + fx('S = a · h'), v: figPar('a', 'h') },
    { t: '<p><span class="key">Площадь трапеции</span> равна произведению полусуммы оснований на высоту.</p>' + fx('S = (a + b) : 2 · h'), v: figTrap('b', 'a', 'h') },
    { t: '<p>Основание треугольника 8, высота к нему 5. Чему равна площадь?</p>', v: '', ask: ask('Площадь', [['20', '20'], ['40', '40'], ['13', '13']], '20', 'Верно. 8 · 5 : 2 = 20.', 'Нет. У треугольника площадь — половина произведения: 8 · 5 : 2 = 20.') }
  ] },
  { id: 6, title: 'Средняя линия', sub: 'В треугольнике и в трапеции', gen: gen6, teach: [
    { t: '<p><span class="key">Средняя линия треугольника</span> соединяет середины двух сторон. Она параллельна третьей стороне и равна её половине.</p>' + fx('MN = AC : 2'), v: figTriMid('AC', 'MN') },
    { t: '<p><span class="key">Средняя линия трапеции</span> соединяет середины боковых сторон. Она параллельна основаниям и равна их полусумме.</p>' + fx('MN = (BC + AD) : 2'), v: figTrapMid('BC', 'AD', 'MN') },
    { t: '<p>Основания трапеции 4 и 10. Средняя линия: (4 + 10) : 2 = 7.</p>', v: '' },
    { t: '<p>Средняя линия треугольника равна 6. Чему равна сторона, которой она параллельна?</p>', v: '', ask: ask('Сторона', [['12', '12'], ['3', '3'], ['6', '6']], '12', 'Верно. Сторона вдвое больше средней линии.', 'Нет. Средняя линия — половина стороны, значит сторона 6 · 2 = 12.') }
  ] },
  { id: 7, title: 'Подобные треугольники: прямая, параллельная стороне', sub: 'Отношение сторон', gen: gen7, teach: [
    { t: '<p>Если прямая MN параллельна стороне AC треугольника ABC, то треугольник BMN подобен треугольнику BAC. Углы у них равны, а стороны пропорциональны.</p>', v: figSim('BM', 'MA', 'MN', 'AC', 0.5) },
    { t: '<p><span class="key">Главное.</span> Берём отношение сторон малого треугольника к сторонам большого. Не забудь, что большая сторона BA — это BM вместе с MA.</p>' + fx('MN : AC = BM : BA'), v: '' },
    { t: '<p>BM = 2, MA = 4, AC = 9. Тогда BA = 6 и MN : 9 = 2 : 6. MN = 9 · 2 : 6 = 3.</p>', v: '' },
    { t: '<p>BM = 3, MA = 2. Чему равно BA?</p>', v: '', ask: ask('BA', [['5', '5'], ['3', '3'], ['6', '6']], '5', 'Верно. BA = BM + MA = 3 + 2.', 'Нет. BA — вся сторона, она состоит из BM и MA: 3 + 2 = 5.') }
  ] },
  { id: 8, title: 'Диагонали трапеции', sub: 'Подобие через точку пересечения', gen: gen8, teach: [
    { t: '<p>Диагонали трапеции пересекаются в точке O. Треугольники BOC и DOA подобны: углы при основаниях равны как накрест лежащие.</p>', v: figDiag('BC', 'AD', '', '') },
    { t: '<p>Отсюда стороны пропорциональны: отрезки диагонали относятся так же, как основания.</p>' + fx('BO : OD = BC : AD'), v: '' },
    { t: '<p>BC = 3, AD = 6, BO = 4. Тогда 4 : OD = 3 : 6, OD = 4 · 6 : 3 = 8.</p>', v: '' },
    { t: '<p>Основания трапеции 2 и 5. В каком отношении точка пересечения диагоналей делит каждую из них?</p>', v: '', ask: ask('Отношение', [['2:5', '2 : 5'], ['5:2', '5 : 2'], ['1:1', '1 : 1']], '2:5', 'Верно. Отрезки относятся как основания: 2 : 5.', 'Нет. Отрезки диагонали относятся так же, как основания: 2 : 5.') }
  ] },
  { id: 9, title: 'Биссектриса параллелограмма', sub: 'Она отсекает равнобедренный треугольник', gen: gen9, teach: [
    { t: '<p>Биссектриса угла A делит его пополам: ∠BAK = ∠KAD. Но ∠KAD = ∠AKB как накрест лежащие при параллельных BC и AD.</p>', v: figParK('', '', '', 0.5) },
    { t: '<p>Значит, в треугольнике ABK два угла равны: ∠BAK = ∠AKB. Он равнобедренный.</p>' + fx('BK = AB'), v: '' },
    { t: '<p>AB = 5, KC = 3. BK = 5, поэтому BC = 5 + 3 = 8.</p>', v: '' },
    { t: '<p>Биссектриса угла A пересекает BC в точке K. AB = 6. Чему равен отрезок BK?</p>', v: '', ask: ask('BK', [['6', '6'], ['3', '3'], ['12', '12']], '6', 'Верно. Треугольник ABK равнобедренный: BK = AB.', 'Нет. Треугольник ABK равнобедренный, BK = AB = 6.') }
  ] },
  { id: 10, title: 'Касательная к окружности', sub: 'Радиус перпендикулярен касательной', gen: gen10, teach: [
    { t: '<p><span class="key">Касательная</span> имеет с окружностью одну общую точку. Радиус, проведённый в точку касания, перпендикулярен касательной.</p>', v: figTang('r', 'AB', 'OA') },
    { t: '<p>Поэтому угол OBA прямой, и треугольник OBA прямоугольный: OB и AB — катеты, OA — гипотенуза. Дальше работает теорема Пифагора.</p>' + fx('OA² = OB² + AB²'), v: '' },
    { t: '<p>Радиус 3, AB = 4. Тогда OA² = 9 + 16 = 25, OA = 5.</p>', v: '' },
    { t: '<p>Какой отрезок в этом треугольнике гипотенуза?</p>', v: '', ask: ask('Гипотенуза', [['OA', 'OA'], ['OB', 'OB'], ['AB', 'AB']], 'OA', 'Верно. Прямой угол при вершине B, напротив него OA.', 'Нет. Прямой угол при вершине B, значит гипотенуза лежит напротив неё: OA.') }
  ] },
  { id: 11, title: 'Пересекающиеся хорды', sub: 'Произведения отрезков равны', gen: gen11, teach: [
    { t: '<p><span class="key">Хорда</span> — отрезок, соединяющий две точки окружности. Если хорды AB и CD пересекаются в точке M, то произведения их отрезков равны.</p>' + fx('AM · MB = CM · MD'), v: figChords('AM', 'MB', 'CM', 'MD') },
    { t: '<p>AM = 4, MB = 6, CM = 8. Тогда 4 · 6 = 8 · MD, MD = 24 : 8 = 3.</p>', v: '' },
    { t: '<p>Произведение одной хорды: AM · MB = 2 · 9 = 18. Чему равно произведение отрезков другой хорды?</p>', v: '', ask: ask('Произведение', [['18', '18'], ['11', '11'], ['36', '36']], '18', 'Верно. Произведения отрезков двух хорд равны.', 'Нет. Произведения отрезков двух хорд равны: тоже 18.') }
  ] },
  { id: 12, title: 'Равнобедренная трапеция', sub: 'Высота и боковая сторона', gen: gen12, teach: [
    { t: '<p>В равнобедренной трапеции боковые стороны равны. Опустим из вершин B и C высоты BH и CK. Получатся два одинаковых прямоугольных треугольника и прямоугольник HBCK.</p>', v: figIsoTrap('a', 'b', 'c', 'h') },
    { t: '<p>Отрезки AH и KD равны. Каждый равен половине разности оснований.</p>' + fx('AH = (AD − BC) : 2'), v: '' },
    { t: '<p>Основания 4 и 10, боковая сторона 5. AH = (10 − 4) : 2 = 3. Высота: 25 − 9 = 16, высота равна 4.</p>', v: figIsoTrap(4, 10, 5, '?') },
    { t: '<p>Основания трапеции 6 и 16. Чему равен отрезок AH?</p>', v: '', ask: ask('AH', [['5', '5'], ['10', '10'], ['11', '11']], '5', 'Верно. (16 − 6) : 2 = 5.', 'Нет. AH — половина разности оснований: (16 − 6) : 2 = 5.') }
  ] },
  { id: 13, title: 'Всё вместе, как на ОГЭ', sub: 'Задания вперемешку', gen: gen13, teach: [
    { t: '<p>В задании №23 почти всегда нужно сделать два шага: найти в чертеже прямоугольный треугольник или подобные треугольники, а потом посчитать.</p>', v: '' },
    { t: '<p>Перед решением спроси себя: есть ли прямой угол, есть ли параллельные прямые, есть ли середина стороны? Подходящая теорема сразу найдётся.</p>', v: '' },
    { t: '<p>Прямая касается окружности. Какой угол получится между радиусом в точку касания и касательной?</p>', v: '', ask: ask('Угол', [['90', '90°'], ['45', '45°'], ['60', '60°']], '90', 'Верно. Радиус перпендикулярен касательной.', 'Нет. Радиус, проведённый в точку касания, перпендикулярен касательной: 90°.') }
  ] }
];

var TAGMSG = {
  'sum-legs': 'Складывать длины сторон нельзя. В теореме Пифагора складывают квадраты катетов.',
  'no-root': 'Получился квадрат стороны. Осталось извлечь корень.',
  'subtract-sides': 'Вычитать надо квадраты сторон, а не сами длины.',
  'half-base': 'Половина основания известна, нужна высота. Вычти из квадрата боковой стороны квадрат половины основания и извлеки корень.',
  'forgot-half': 'Здесь нужна половина: проверь формулу.',
  'forgot-double': 'Средняя линия вдвое короче стороны, значит сторону получаем умножением на 2.',
  'median-is-hyp': 'Медиана — половина гипотенузы, а не вся гипотенуза.',
  'half-wrong': 'У параллелограмма половина не берётся: площадь равна произведению стороны на высоту.',
  'mid-minus': 'Средняя линия — полусумма оснований. Найди сумму оснований, умножив на 2, и вычти известное основание.',
  'mid-is-base': 'Средняя линия не равна основанию. Сумма оснований вдвое больше средней линии.',
  'part-instead': 'В пропорции большая сторона — вся BA, то есть BM вместе с MA, а не одна часть.',
  'swap-ratio': 'Отношения перепутаны местами. Отрезки диагонали относятся так же, как основания: большему основанию соответствует больший отрезок.',
  'whole-diagonal': 'Это вся диагональ BD. Нужна только часть OD.',
  'wrong-part': 'Это отрезок BO. Нужен OD, он соответствует большему основанию.',
  'bk-not-kc': 'BK равно AB, но нужен отрезок KC: вычти BK из BC.',
  'whole-side': 'Это длина всей стороны BC. Нужна только часть KC.',
  'part-only': 'KC — только часть стороны. Прибавь BK, который равен AB.',
  'half-perimeter': 'Это сумма двух соседних сторон. Периметр — сумма всех четырёх сторон, значит умножай на 2.',
  'all-multiplied': 'Нужно перемножить два отрезка одной хорды и разделить на известный отрезок другой.',
  'add-sub': 'Отрезки хорд не складывают. Используй равенство произведений.',
  'side-as-height': 'Боковая сторона не равна высоте. Высоту находят по теореме Пифагора.',
  'half-diff': 'Это только AH. Высота получается из треугольника ABH по теореме Пифагора.',
  'one-side-only': 'Основание AD состоит из трёх частей: AH, BC и KD. Отрезки AH и KD равны.'
};

var api = { STEPS: STEPS, fr: fr, mx: mx, rnd: rnd };
root.TRAINER = {
  title: 'ОГЭ №23: геометрия с нуля', shortTitle: 'ОГЭ №23', key: 'oge23_trainer_v1',
  sheetUrl: 'https://script.google.com/macros/s/AKfycbyJKYatO3xdOpYJ1WZzszbxqMnOWZ30lsfr5HH7Y23svvX6iqjNNbIUR-RCUeZ8pB15/exec',
  needDefault: 7, needEarly: 5, earlyUpto: 3, tagMsg: TAGMSG, api: api,
  board: ['c² = a² + b²', 'S = {a · h|2}', 'MN = {AC|2}', 'AM · MB = CM · MD', 'BK = AB', 'OB ⟂ AB', 'S = {a + b|2} · h', 'CM = {AB|2}', '3² + 4² = 5²', '{BO|OD} = {BC|AD}', '5 · 12 · 13', 'R[169 − 25] = 12']
};
if (typeof module !== 'undefined' && module.exports) module.exports = root.TRAINER;
})(typeof window !== 'undefined' ? window : globalThis);
