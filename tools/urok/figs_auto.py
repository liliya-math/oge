# -*- coding: utf-8 -*-
"""Универсальный генератор чертежей для задач и объяснений.
Точки задаются в математических координатах (y вверх), чертёж сам вписывается в рамку.
Подписи ставит Fig.label: они никогда не лежат на линиях и друг на друге.
Правило: на чертеже только то, что ДАНО в условии; искомое обозначено «?» или буквой."""
import math
from figs import Fig, _cent, _out, _mid, _ang, _bis

# ---------------------------------------------------------------- точки
def trap_pts(bot, top, h, off=None, names='ABCD'):
    """Трапеция: нижнее основание AD = bot, верхнее BC = top, высота h. off — сдвиг B вправо от A (по умолчанию равнобедренная)."""
    a, b, c, d = names
    if off is None: off = (bot - top) / 2
    return {a: (0.0, 0.0), d: (float(bot), 0.0), b: (float(off), float(h)), c: (float(off + top), float(h))}

def par_pts(a, b, deg, names='ABCD'):
    """Параллелограмм: AD = a (низ), AB = b, угол A = deg."""
    th = math.radians(deg); n1, n2, n3, n4 = names
    return {n1: (0.0, 0.0), n4: (float(a), 0.0), n2: (b * math.cos(th), b * math.sin(th)), n3: (a + b * math.cos(th), b * math.sin(th))}

def tri_sss(a, b, c, names='ABC'):
    """BC = a, CA = b, AB = c; A в начале, B справа."""
    A, B, C = names
    x = (c * c + b * b - a * a) / (2 * c); y = math.sqrt(max(b * b - x * x, 1e-6))
    return {A: (0.0, 0.0), B: (float(c), 0.0), C: (x, y)}

def tri_sas(a, b, deg, names='ABC'):
    """Угол C = deg между сторонами CB = a (вправо) и CA = b. C в начале."""
    A, B, C = names; th = math.radians(deg)
    return {C: (0.0, 0.0), B: (float(a), 0.0), A: (b * math.cos(th), b * math.sin(th))}

def tri_asa(Ad, Bd, c, names='ABC'):
    """Стороны AB = c внизу, углы A и B при ней."""
    A, B, C = names
    Cd = 180 - Ad - Bd
    b = c * math.sin(math.radians(Bd)) / math.sin(math.radians(Cd))
    return {A: (0.0, 0.0), B: (float(c), 0.0), C: (b * math.cos(math.radians(Ad)), b * math.sin(math.radians(Ad)))}

def tri_right(leg1, leg2, names='ABC'):
    """Прямой угол в вершине names[2]=C. CA = leg1 (влево по горизонтали вниз), CB = leg2 (вверх)."""
    A, B, C = names
    return {A: (0.0, 0.0), C: (float(leg1), 0.0), B: (float(leg1), float(leg2))}

# ---------------------------------------------------------------- рисование
def _foot(p, a, b):
    ax, ay = a; bx, by = b; dx, dy = bx - ax, by - ay
    t = ((p[0] - ax) * dx + (p[1] - ay) * dy) / (dx * dx + dy * dy)
    return (ax + t * dx, ay + t * dy)

def _cross(p1, p2, p3, p4):
    x1, y1 = p1; x2, y2 = p2; x3, y3 = p3; x4, y4 = p4
    d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / d
    return (x1 + t * (x2 - x1), y1 + t * (y2 - y1))

def mk(pts, poly, extra=None, segs=(), lab=None, ang=(), right=(), ticks=(), dots=(), show=None,
       W=360, H=215, px=46, py=40, cap='', cls_poly='ln', arc_r=22, grid=None):
    """pts — словарь точек (мат. координаты). poly — порядок вершин многоугольника.
    extra — {имя: ('foot', V, P, Q) | ('mid', P, Q) | ('on', P, Q, t) | ('cross', P, Q, R, S)}.
    segs — [(P, Q, стиль)] стиль: 'ln' | 'acc' | 'dash' | 'dot'.
    lab — {'AB': 'текст'} или {('B','H'): ('h', (dx, dy))}: подпись отрезка.
    ang — [(V, P, Q, 'текст')] дуга угла PVQ с подписью (текст может быть '').
    right — [(V, P, Q)] значок прямого угла. ticks — [(P, Q)] чёрточки равных отрезков.
    show — какие точки подписывать буквами (по умолчанию вершины poly + extra)."""
    P = dict(pts)
    for nm, spec in (extra or {}).items():
        k = spec[0]
        if k == 'foot': P[nm] = _foot(P[spec[1]], P[spec[2]], P[spec[3]])
        elif k == 'mid': P[nm] = _mid(P[spec[1]], P[spec[2]])
        elif k == 'on': t = spec[3]; a, b = P[spec[1]], P[spec[2]]; P[nm] = (a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1]))
        elif k == 'cross': P[nm] = _cross(P[spec[1]], P[spec[2]], P[spec[3]], P[spec[4]])
        elif k == 'xy': P[nm] = spec[1]
    xs = [p[0] for p in P.values()]; ys = [p[1] for p in P.values()]
    w = max(xs) - min(xs) or 1; h = max(ys) - min(ys) or 1
    s = min((W - 2 * px) / w, (H - 2 * py) / h)
    ox = px + (W - 2 * px - w * s) / 2; oy = H - py - ((H - 2 * py) - h * s) / 2
    S = {k: (ox + (p[0] - min(xs)) * s, oy - (p[1] - min(ys)) * s) for k, p in P.items()}
    f = Fig(W, H)
    n = len(poly)
    for i in range(n): f.line(S[poly[i]], S[poly[(i + 1) % n]], cls_poly)
    for a, b, st in segs:
        if st == 'dash': f.line(S[a], S[b], 'acc', 'stroke-dasharray="6 4"')
        elif st == 'dot': f.line(S[a], S[b], 'ln', 'stroke-dasharray="3 4"')
        else: f.line(S[a], S[b], st)
    cen = _cent(*[S[v] for v in poly])
    for V, p, q in right:
        d1 = (S[p][0] - S[V][0], S[p][1] - S[V][1]); d2 = (S[q][0] - S[V][0], S[q][1] - S[V][1])
        n1 = math.hypot(*d1); n2 = math.hypot(*d2)
        f.right_angle(S[V], (d1[0] / n1, d1[1] / n1), (d2[0] / n2, d2[1] / n2), 9)
    for p, q in ticks:
        m = _mid(S[p], S[q]); dx, dy = S[q][0] - S[p][0], S[q][1] - S[p][1]; L = math.hypot(dx, dy)
        ux, uy = -dy / L * 6, dx / L * 6
        f.line((m[0] - ux, m[1] - uy), (m[0] + ux, m[1] + uy), 'acc')
    for V, p, q, txt in ang:
        bis, a1, a2 = _bis(S[V], S[p], S[q]); f.arc(S[V], arc_r, a1, a2)
    for d in dots: f.dot(S[d], 3.5)
    names = list(show) if show is not None else list(poly) + list((extra or {}).keys())
    for nm in names:
        f.label(S[nm], _out(cen, S[nm]) if nm in poly else _out(cen, S[nm]), nm, 'tx', start=12)
    for V, p, q, txt in ang:
        if not txt: continue
        bis, a1, a2 = _bis(S[V], S[p], S[q])
        f.label(S[V], bis, txt, 'tm', start=arc_r + 12, maxd=arc_r + 60, alts=(0, 12, -12, 25, -25, 40, -40))
    for key, val in (lab or {}).items():
        if isinstance(key, str):
            p, q = key[0], key[1]; txt = val; dirv = None
        else:
            p, q = key; txt, dirv = val if isinstance(val, tuple) else (val, None)
        m = _mid(S[p], S[q])
        if dirv is None:
            dx, dy = S[q][0] - S[p][0], S[q][1] - S[p][1]
            nx, ny = -dy, dx
            if (nx * (m[0] - cen[0]) + ny * (m[1] - cen[1])) < 0: nx, ny = -nx, -ny
            dirv = (nx, ny)
        f.label(m, dirv, txt, 'tm' if len(txt) > 3 else 'tx', start=8, alts=(0, 25, -25, 50, -50, 80, -80, 110, -110, 180, 150, -150))
    return f.render(cap)

# ---------------------------------------------------------------- готовые заготовки
def trap(kind='iso', bot=20, top=8, h=6, lab=None, ang=(), hts=(), mid=None, diag=(), ticks_iso=False, cap='', show=None, W=380, H=215, names='ABCD', off=None):
    """Трапеция ABCD, AD — нижнее основание, BC — верхнее.
    kind: 'iso' | 'gen' | 'rect'. hts — высоты: 'B' (BH), 'C' (CK), 'Ch' (CH для прямоугольной).
    mid — подпись средней линии MN (строка) или None."""
    A, B, C, D = names
    if kind == 'rect': pts = trap_pts(bot, top, h, 0.0, names)
    elif kind == 'gen': pts = trap_pts(bot, top, h, off if off is not None else (bot - top) * 0.3, names)
    else: pts = trap_pts(bot, top, h, None, names)
    extra = {}; segs = []; right = []; ticks = []; show_ = list(names)
    if 'B' in hts: extra['H'] = ('foot', B, A, D); segs.append((B, 'H', 'dash')); right.append(('H', B, D)); show_.append('H')
    if 'C' in hts: extra['K'] = ('foot', C, A, D); segs.append((C, 'K', 'dash')); right.append(('K', C, A)); show_.append('K')
    if 'Ch' in hts: extra['H'] = ('foot', C, A, D); segs.append((C, 'H', 'dash')); right.append(('H', C, A)); show_.append('H')
    if kind == 'rect': right += [(A, B, D), (B, A, C)]
    if mid is not None:
        extra['M'] = ('mid', A, B); extra['N'] = ('mid', C, D); segs.append(('M', 'N', 'dash')); show_ += ['M', 'N']
    for dg in diag: segs.append((dg[0], dg[1], 'dash'))
    if ticks_iso: ticks += [(A, B), (C, D)]
    L = dict(lab or {})
    if mid: L[('M', 'N')] = (mid, (0, -1))
    return mk(pts, [A, D, C, B], extra, segs, L, ang, right, ticks, show=show if show is not None else show_, cap=cap, W=W, H=H)

def tri(pts, lab=None, ang=(), right=(), ticks=(), extra=None, segs=(), show=None, names='ABC', cap='', W=340, H=215, dots=()):
    A, B, C = names
    return mk(pts, [A, B, C], extra, segs, lab, ang, right, ticks, dots=dots, show=show, cap=cap, W=W, H=H)

def par(a=9, b=6, deg=60, lab=None, ang=(), segs=(), extra=None, show=None, cap='', W=380, H=215, hts=False):
    pts = par_pts(a, b, deg)
    right = []; segs = list(segs); extra = dict(extra or {})
    return mk(pts, ['A', 'B', 'C', 'D'], extra, segs, lab, ang, right, show=show, cap=cap, W=W, H=H)

def circ_tri(angs=(80, 190, 330), names='ABC', lab=None, rlab=None, cap='', W=320, H=240, A_deg=None, inward=()):
    """Треугольник, вписанный в окружность (углы — положение вершин на окружности, градусы). rlab — подпись радиуса OA."""
    if A_deg is not None: angs = (90, 270 - A_deg, 270 + A_deg)
    cx, cy, r = W / 2, H / 2 + 4, 82
    f = Fig(W, H); f.circle((cx, cy), r)
    P = {nm: (cx + r * math.cos(math.radians(a)), cy - r * math.sin(math.radians(a))) for nm, a in zip(names, angs)}
    n = list(names)
    for i in range(3): f.line(P[n[i]], P[n[(i + 1) % 3]])
    cen = (cx, cy)
    ri = 1 if (A_deg or 0) > 90 else 0
    if rlab:
        f.line(cen, P[n[ri]], 'acc', 'stroke-dasharray="6 4"'); f.dot(cen, 3.5)
    for nm in n: f.label(P[nm], _out(cen, P[nm]), nm, 'tx', start=12)
    if rlab: f.label(cen, (-1, 1), 'O', 'tx', start=10, alts=(0, 40, -40, 90, -90, 140, -140, 180)); f.label(_mid(cen, P[n[ri]]), (-1, 0), rlab, 'tx', start=10, alts=(0, 40, -40, 90, -90, 140, -140, 180))
    for key, txt in (lab or {}).items():
        p, q = key[0], key[1]; m = _mid(P[p], P[q])
        dx, dy = P[q][0] - P[p][0], P[q][1] - P[p][1]; nx, ny = -dy, dx
        if nx * (m[0] - cen[0]) + ny * (m[1] - cen[1]) < 0: nx, ny = -nx, -ny
        if key in inward: nx, ny = -nx, -ny
        f.label(m, (nx, ny), txt, 'tm' if len(txt) > 3 else 'tx', start=8, alts=(0, 25, -25, 50, -50, 80, -80, 110, -110))
    return f.render(cap)
