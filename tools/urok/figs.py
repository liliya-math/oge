# -*- coding: utf-8 -*-
"""Рисунки урока. ПРАВИЛО: подписи (буквы, цифры) никогда не лежат на линиях чертежа и друг на друге.
Все подписи ставятся через Fig.label(): она сдвигает подпись по направлению, пока вокруг не станет чисто."""
import math

SIZE = {'tx': 14, 'tm': 12}

class Fig:
    def __init__(self, W, H):
        self.W, self.H = W, H
        self.svg = []; self.segs = []; self.boxes = []

    # ---- геометрия ----
    def line(self, p, q, cls='ln', extra=''):
        self.svg.append(f'<line x1="{p[0]:.1f}" y1="{p[1]:.1f}" x2="{q[0]:.1f}" y2="{q[1]:.1f}" class="{cls}" {extra}/>')
        self.segs.append((p, q, 1.5))

    def arc(self, c, r, a1, a2, cls='acc', w=2):
        """Дуга от угла a1 до a2 (градусы, как в математике: против часовой, y вверх)."""
        def pt(a): return (c[0] + r * math.cos(math.radians(a)), c[1] - r * math.sin(math.radians(a)))
        p1, p2 = pt(a1), pt(a2)
        da = (a2 - a1) if abs(a2 - a1) <= 180 else (a2 - a1 + 180) % 360 - 180
        self.svg.append(f'<path d="M {p1[0]:.1f} {p1[1]:.1f} A {r} {r} 0 0 {0 if da > 0 else 1} {p2[0]:.1f} {p2[1]:.1f}" class="{cls}" style="stroke-width:{w}"/>')
        n = max(6, int(abs(da) / 6))
        prev = p1
        for k in range(1, n + 1):
            q = pt(a1 + da * k / n); self.segs.append((prev, q, 1.5)); prev = q

    def circle(self, c, r, cls='ln'):
        self.svg.append(f'<circle cx="{c[0]:.1f}" cy="{c[1]:.1f}" r="{r}" class="{cls}"/>')
        prev = (c[0] + r, c[1])
        for k in range(1, 73):
            a = math.radians(k * 5); q = (c[0] + r * math.cos(a), c[1] - r * math.sin(a)); self.segs.append((prev, q, 1.5)); prev = q

    def dot(self, p, r=4):
        self.svg.append(f'<circle cx="{p[0]:.1f}" cy="{p[1]:.1f}" r="{r}" class="dot"/>')
        self.segs.append((p, p, r))

    def right_angle(self, vertex, d1, d2, s=11):
        """Значок прямого угла в вершине; d1, d2 — единичные направления сторон (экранные)."""
        a = (vertex[0] + d1[0] * s, vertex[1] + d1[1] * s); b = (vertex[0] + (d1[0] + d2[0]) * s, vertex[1] + (d1[1] + d2[1]) * s)
        c = (vertex[0] + d2[0] * s, vertex[1] + d2[1] * s)
        self.line(a, b, 'ln', 'style="stroke-width:1.5"'); self.line(b, c, 'ln', 'style="stroke-width:1.5"')

    def raw(self, s): self.svg.append(s)

    # ---- подписи ----
    @staticmethod
    def _size(s, cls):
        sz = SIZE[cls]
        plain = s.replace('√', 'v').replace('&lt;', '<').replace('&gt;', '>')
        w = sum((0.70 if ('а' <= ch.lower() <= 'я' or ch in 'ёαβγ') else 0.62) for ch in plain) * sz
        return w, sz * 0.78

    def _dist_rect(self, box):
        x0, y0, x1, y1 = box
        best = 1e9
        for p, q, r in self.segs:
            L = math.hypot(q[0] - p[0], q[1] - p[1]); n = max(1, int(L))
            for k in range(n + 1):
                x = p[0] + (q[0] - p[0]) * k / n; y = p[1] + (q[1] - p[1]) * k / n
                dx = max(x0 - x, 0, x - x1); dy = max(y0 - y, 0, y - y1)
                best = min(best, math.hypot(dx, dy) - r)
        return best

    def _free(self, box, margin):
        x0, y0, x1, y1 = box
        if x0 < 2 or y0 < 2 or x1 > self.W - 2 or y1 > self.H - 2: return False
        for b in self.boxes:
            if x0 < b[2] + 4 and b[0] < x1 + 4 and y0 < b[3] + 4 and b[1] < y1 + 4: return False
        return self._dist_rect(box) >= margin

    def _put(self, cx, cy, s, cls, anchor='middle'):
        w, h = self._size(s, cls)
        x0 = cx - w / 2 if anchor == 'middle' else (cx if anchor == 'start' else cx - w)
        self.boxes.append((x0, cy - h / 2, x0 + w, cy + h / 2))
        self.svg.append(f'<text x="{cx:.1f}" y="{cy + SIZE[cls] * 0.36:.1f}" class="{cls}" text-anchor="{anchor}">{s}</text>')

    def label(self, base, dirv, s, cls='tx', start=8, maxd=52, margin=5, alts=(0, 25, -25, 50, -50, 80, -80, 110, -110)):
        """Ставит подпись рядом с точкой base, двигая её вдоль направления dirv, пока вокруг чисто."""
        w, h = self._size(s, cls)
        maxd = maxd + w / 2
        n = math.hypot(*dirv) or 1; ux, uy = dirv[0] / n, dirv[1] / n
        for rot in alts:
            ca, sa = math.cos(math.radians(rot)), math.sin(math.radians(rot))
            vx, vy = ux * ca - uy * sa, ux * sa + uy * ca
            for d in range(int(start), int(maxd)):
                cx, cy = base[0] + vx * d, base[1] + vy * d
                box = (cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2)
                if self._free(box, margin):
                    self._put(cx, cy, s, cls); return (cx, cy)
        raise RuntimeError(f'не нашлось места для подписи «{s}» у {base}')

    def render(self, cap=''):
        c = f'<div class="gcap">{cap}</div>' if cap else ''
        return f'<div class="fig"><svg viewBox="0 0 {self.W} {self.H}" width="{self.W}" role="img" aria-label="Чертёж">{"".join(self.svg)}</svg></div>{c}'

def _cent(*pts): return (sum(p[0] for p in pts) / len(pts), sum(p[1] for p in pts) / len(pts))
def _out(c, p): return (p[0] - c[0], p[1] - c[1])
def _mid(p, q): return ((p[0] + q[0]) / 2, (p[1] + q[1]) / 2)
def _ang(c, p): return math.degrees(math.atan2(-(p[1] - c[1]), p[0] - c[0]))   # математический угол
def _bis(c, p, q):
    a1, a2 = _ang(c, p), _ang(c, q); d = (a2 - a1 + 180) % 360 - 180; m = math.radians(a1 + d / 2)
    return (math.cos(m), -math.sin(m)), a1, a1 + d

# =========================================================
def tri_sas(a, b, Cd, la='a', lb='b', lc='c', lang='C', W=330, H_=210, hl=True):
    th = math.radians(Cd)
    pts = {'C': (0.0, 0.0), 'B': (a, 0.0), 'A': (b * math.cos(th), b * math.sin(th))}
    xs = [p[0] for p in pts.values()]; ys = [p[1] for p in pts.values()]
    w = max(xs) - min(xs); h = max(ys) - min(ys)
    padx, pady = 44, 38
    s = min((W - 2 * padx) / w, (H_ - 2 * pady) / h)
    ox = padx + (W - 2 * padx - w * s) / 2; oy = H_ - pady - ((H_ - 2 * pady) - h * s) / 2
    T = lambda p: (ox + (p[0] - min(xs)) * s, oy - (p[1] - min(ys)) * s)
    C, B, A = T(pts['C']), T(pts['B']), T(pts['A'])
    f = Fig(W, H_)
    f.line(C, B); f.line(C, A); f.line(A, B, 'acc' if hl else 'ln')
    bis, a1, a2 = _bis(C, B, A)
    f.arc(C, 22, a1, a2)
    cen = _cent(A, B, C)
    for nm, p in (('A', A), ('B', B), ('C', C)): f.label(p, _out(cen, p), nm, 'tx', start=12)
    f.label(_mid(C, B), _out(cen, _mid(C, B)), la, 'tm', start=8)
    f.label(_mid(C, A), _out(cen, _mid(C, A)), lb, 'tm', start=8)
    f.label(_mid(A, B), _out(cen, _mid(A, B)), lc, 'tx', start=8)
    f.label(C, bis, lang, 'tm', start=30, alts=(0, 12, -12, 25, -25))
    return f.render()

def fig_labeled(hl=None):
    A, B, C = (50, 175), (280, 175), (205, 45)
    f = Fig(330, 215)
    f.line(A, B, 'acc' if hl == 'C' else 'ln'); f.line(B, C, 'acc' if hl == 'A' else 'ln'); f.line(C, A, 'acc' if hl == 'B' else 'ln')
    if hl == 'A': b, a1, a2 = _bis(A, B, C); f.arc(A, 28, a1, a2)
    if hl == 'B': b, a1, a2 = _bis(B, A, C); f.arc(B, 28, a1, a2)
    if hl == 'C': b, a1, a2 = _bis(C, A, B); f.arc(C, 28, a1, a2)
    cen = _cent(A, B, C)
    for nm, p in (('A', A), ('B', B), ('C', C)): f.label(p, _out(cen, p), nm, 'tx', start=12)
    for nm, p, q in (('c', A, B), ('a', B, C), ('b', C, A)):
        m = _mid(p, q); f.label(m, _out(cen, m), nm, 'tx', start=8)
    cap = {'A': 'Угол A и сторона a напротив него', 'B': 'Угол B и сторона b напротив него', 'C': 'Угол C и сторона c напротив него'}.get(hl, '')
    return f.render(cap)

def fig_hinge():
    f = Fig(390, 175)
    for x0, th, cap in [(0, 40, 'угол 40°'), (130, 90, 'угол 90°'), (260, 140, 'угол 140°')]:
        piv = (x0 + 50, 130); r = math.radians(th)
        e1 = (piv[0] + 44, piv[1]); e2 = (piv[0] + 72 * math.cos(r), piv[1] - 72 * math.sin(r))
        f.line(piv, e1); f.line(piv, e2); f.line(e1, e2, 'acc', 'stroke-dasharray="5 4"'); f.dot(piv, 4); f.arc(piv, 15, 0, th, 'ln', 1.5)
        f.label((piv[0], piv[1]), (0, 1), cap, 'tm', start=18)
    return f.render('Две палки на шарнире. Чем шире их раскрыли, тем дальше друг от друга их концы')

def fig_angles():
    f = Fig(410, 165)
    for x0, th, cap in [(0, 40, 'острый'), (100, 90, 'прямой'), (200, 120, 'тупой'), (305, 180, 'развёрнутый')]:
        v = (x0 + 36, 95); r = math.radians(th)
        f.line(v, (v[0] + 48, v[1])); f.line(v, (v[0] + 48 * math.cos(r), v[1] - 48 * math.sin(r)), 'acc')
        if th < 180: f.arc(v, 17, 0, th, 'ln', 1.5)
        f.label((v[0] + 20, v[1]), (0, 1), cap, 'tm', start=26)
        f.label((v[0] + 20, v[1]), (0, 1), f'{th}°', 'tx', start=48)
    return f.render()

def fig_right():
    A, C, B = (36, 160), (226, 160), (226, 48)
    f = Fig(390, 205)
    f.line(A, C); f.line(C, B); f.line(A, B, 'acc'); f.right_angle(C, (-1, 0), (0, -1))
    ang = _ang(A, B); f.arc(A, 36, 0, ang)
    f.label(A, (1, -0.25), 'α', 'tx', start=48, alts=(0, 10, -10, 20))
    f.label(A, (-1, 1), 'A', 'tx', start=12); f.label(C, (1, 1), 'C', 'tx', start=12); f.label(B, (1, -1), 'B', 'tx', start=12)
    f.label(_mid(A, C), (0, 1), 'прилежащий катет (рядом с α)', 'tm', start=16)
    p1 = f.label(_mid(C, B), (1, 0), 'противолежащий', 'tm', start=12, alts=(0, 20, -20))
    f.label((p1[0], p1[1] + 4), (0, 1), 'катет', 'tm', start=12, alts=(0,))
    cen = _cent(A, B, C); m = _mid(A, B)
    f.label(m, _out(cen, m), 'гипотенуза', 'tm', start=10)
    return f.render()

def fig_right345():
    A, C, B = (40, 160), (200, 160), (200, 40)
    f = Fig(300, 205)
    f.line(A, C); f.line(C, B); f.line(A, B, 'acc'); f.right_angle(C, (-1, 0), (0, -1))
    ang = _ang(A, B); f.arc(A, 34, 0, ang)
    f.label(A, (1, -0.2), 'α', 'tx', start=46, alts=(0, 10, -10, 20))
    cen = _cent(A, B, C)
    f.label(_mid(A, C), (0, 1), '4 (рядом с α)', 'tm', start=14)
    f.label(_mid(C, B), (1, 0), '3', 'tx', start=10)
    m = _mid(A, B); f.label(m, _out(cen, m), '5', 'tx', start=10)
    return f.render('Катеты 3 и 4, гипотенуза 5')

def fig_30609():
    A, C, B = (40, 165), (213, 165), (213, 65)
    f = Fig(300, 205)
    f.line(A, C); f.line(C, B); f.line(A, B, 'acc'); f.right_angle(C, (-1, 0), (0, -1))
    bA, a1, a2 = _bis(A, C, B); f.arc(A, 30, a1, a2)
    bB, b1, b2 = _bis(B, C, A); f.arc(B, 24, b1, b2)
    cen = _cent(A, B, C)
    f.label(A, bA, '30°', 'tm', start=40, maxd=90, alts=(0, 8, -8))
    f.label(B, bB, '60°', 'tm', start=38, maxd=80, alts=(0, 10, -10, 20))
    for nm, p in (('A', A), ('B', B), ('C', C)): f.label(p, _out(cen, p), nm, 'tx', start=12)
    f.label(_mid(C, B), (1, 0), '1', 'tx', start=10)
    f.label(_mid(A, C), (0, 1), '√3', 'tx', start=14)
    m = _mid(A, B); f.label(m, _out(cen, m), '2', 'tx', start=10)
    return f.render('Треугольник с углами 30°, 60°, 90° и сторонами 1, √3, 2')

def fig_circ():
    O, r = (150, 112), 88
    P = [(O[0] + r * math.cos(math.radians(t)), O[1] - r * math.sin(math.radians(t))) for t in (100, 215, 330)]
    f = Fig(300, 225)
    f.circle(O, r)
    f.line(P[0], P[1]); f.line(P[1], P[2]); f.line(P[2], P[0]); f.line(O, P[2], 'acc'); f.dot(O, 3.5)
    for p in P: f.dot(p, 4)
    for nm, p in zip('ABC', P): f.label(p, _out(O, p), nm, 'tx', start=14)
    m = _mid(O, P[2]); f.label(m, (0.3, 1), 'R', 'tx', start=8, maxd=26, alts=(0, 40, -40, 80, 180, 140, -140))
    f.label(O, (-1, 1), 'O', 'tx', start=12)
    return f.render('Окружность проходит через все три вершины треугольника. R — её радиус')

def fig_height():
    A, B, Cp = (36, 175), (276, 175), (176, 45)
    Hf = (176, 175)
    f = Fig(310, 215)
    f.line(A, B); f.line(A, Cp); f.line(B, Cp); f.line(Cp, Hf, 'acc', 'stroke-dasharray="6 4"')
    f.right_angle(Hf, (-1, 0), (0, -1))
    f.arc(A, 32, 0, _ang(A, Cp)); f.arc(B, 30, 180 - 0, _ang(B, Cp))
    cen = _cent(A, B, Cp)
    for nm, p in (('A', A), ('B', B), ('C', Cp)): f.label(p, _out(cen, p), nm, 'tx', start=12)
    f.label(Hf, (0, 1), 'H', 'tm', start=12)
    f.label(_mid(A, Cp), (-1, -0.3), 'b', 'tx', start=8); f.label(_mid(B, Cp), (1, -0.3), 'a', 'tx', start=8)
    f.label(_mid(Cp, Hf), (1, 0), 'h', 'tx', start=8)
    return f.render()

def fig_semi():
    O, r = (160, 150), 130
    a = 55; am = math.radians(a)
    Pm = (O[0] + r * math.cos(am), O[1] - r * math.sin(am))
    f = Fig(330, 195)
    f.line((20, 150), (300, 150)); f.line(O, (160, 22), 'gr')
    f.arc(O, r, 0, 180, 'ln', 2)
    f.line(O, Pm, 'acc'); f.line(Pm, (Pm[0], 150), 'ln', 'stroke-dasharray="5 4"'); f.dot(Pm, 5)
    f.arc(O, 30, 0, a)
    f.label(O, (1, -0.35), 'α', 'tx', start=44, alts=(0, 8, -8, 16))
    f.label(Pm, (1, -1), 'M(x; y)', 'tx', start=14, alts=(0, 20, 40, -20))
    f.label(((O[0] + Pm[0]) / 2, 150), (0, 1), 'x', 'tx', start=14)
    f.label((Pm[0], (Pm[1] + 150) / 2), (1, 0), 'y', 'tx', start=10)
    f.label((30, 150), (0, 1), '−1', 'tm', start=14); f.label(O, (0, 1), '0', 'tm', start=14, alts=(0, -30, 30)); f.label((290, 150), (0, 1), '1', 'tm', start=14)
    return f.render('Полуокружность радиуса 1')

def tbl(head, rows):
    h = ''.join(f'<th>{x}</th>' for x in head)
    r = ''.join('<tr>' + ''.join(f'<td>{c}</td>' for c in row) + '</tr>' for row in rows)
    return f'<div class="tblw"><table><tr>{h}</tr>{r}</table></div>'


# =========================================================
# Трапеция (урок 8 класса). Вершины: A, D внизу (нижнее основание AD), B, C вверху (верхнее основание BC).
def _trap_draw(f, A, B, C, D, names=True):
    f.line(A, D); f.line(B, C); f.line(A, B); f.line(C, D)
    cen = _cent(A, B, C, D)
    if names:
        for nm, p in (('A', A), ('B', B), ('C', C), ('D', D)):
            f.label(p, _out(cen, p), nm, 'tx', start=12)
    return cen

def fig_parallel():
    """Две параллельные прямые и секущая: односторонние углы."""
    P, Q = (116.7, 140), (183.3, 60)
    th = _ang(P, Q)
    f = Fig(330, 190)
    f.line((20, 140), (320, 140)); f.line((20, 60), (320, 60)); f.line((92, 170), (208, 30))
    f.arc(P, 26, 0, th); f.arc(Q, 26, -(180 - th), 0)
    f.label(P, (1, -0.25), 'α', 'tx', start=34, alts=(0, 10, -10, 20))
    f.label(Q, (1, 0.25), 'β', 'tx', start=34, alts=(0, 10, -10, 20))
    f.label((300, 60), (0, -1), 'a', 'tx', start=12); f.label((300, 140), (0, 1), 'b', 'tx', start=12)
    return f.render('Прямые a и b параллельны. Углы α и β односторонние: α + β = 180°')

def fig_trap_elements():
    A, B, C, D = (70, 160), (125, 50), (255, 50), (320, 160)
    f = Fig(390, 205)
    cen = _trap_draw(f, A, B, C, D)
    f.label(_mid(B, C), (0, -1), 'основание', 'tm', start=12)
    f.label(_mid(A, D), (0, 1), 'основание', 'tm', start=14)
    f.label(_mid(A, B), (-1, 0), 'боковая', 'tm', start=10)
    f.label(_mid(C, D), (1, 0), 'боковая', 'tm', start=10)
    return f.render('Трапеция ABCD: BC ∥ AD')

def fig_trap_angles():
    A, B, C, D = (70, 160), (125, 50), (255, 50), (320, 160)
    f = Fig(390, 205)
    _trap_draw(f, A, B, C, D)
    th = _ang(A, B)
    f.arc(A, 30, 0, th); f.arc(B, 30, -(180 - th), 0)
    f.label(A, (1, -0.45), 'α', 'tx', start=40, alts=(0, 10, -10, 20, -20))
    f.label(B, (0.4, 1), 'β', 'tx', start=40, alts=(0, 10, -10, 20, -20))
    return f.render('Углы A и B при боковой стороне AB: α + β = 180°')

def fig_trap_mid():
    A, B, C, D = (60, 160), (125, 50), (255, 50), (330, 160)
    M, N = _mid(A, B), _mid(C, D)
    f = Fig(390, 210)
    _trap_draw(f, A, B, C, D)
    f.line(M, N, 'acc', 'stroke-dasharray="6 4"'); f.dot(M, 4); f.dot(N, 4)
    f.label(M, (-1, 0), 'M', 'tx', start=12); f.label(N, (1, 0), 'N', 'tx', start=12)
    f.label(_mid(B, C), (0, -1), 'b', 'tx', start=12); f.label(_mid(A, D), (0, 1), 'a', 'tx', start=14)
    f.label(_mid(M, N), (0, -1), 'MN', 'tx', start=10, alts=(0, 20, -20, 180))
    return f.render('MN — средняя линия: MN = (a + b) : 2')

def fig_trap_iso():
    A, B, C, D = (70, 160), (130, 50), (250, 50), (310, 160)
    f = Fig(380, 205)
    cen = _trap_draw(f, A, B, C, D)
    for p, q in ((A, B), (D, C)):
        m = _mid(p, q); dx, dy = q[0] - p[0], q[1] - p[1]; n = math.hypot(dx, dy)
        ux, uy = -dy / n * 6, dx / n * 6
        f.line((m[0] - ux, m[1] - uy), (m[0] + ux, m[1] + uy), 'acc')
    thA = _ang(A, B); f.arc(A, 28, 0, thA); f.arc(D, 28, 180 - thA, 180)
    f.arc(B, 26, -(180 - thA), 0); f.arc(C, 26, 180, 180 + (180 - thA))
    f.label(A, (1, -0.5), 'α', 'tx', start=38, alts=(0, 10, -10, 20, -20)); f.label(D, (-1, -0.5), 'α', 'tx', start=38, alts=(0, 10, -10, 20, -20))
    f.label(B, (0.4, 1), 'β', 'tx', start=38, alts=(0, 10, -10, 20, -20)); f.label(C, (-0.4, 1), 'β', 'tx', start=38, alts=(0, 10, -10, 20, -20))
    return f.render('Равнобедренная трапеция: AB = CD, углы при основании равны')

def fig_trap_iso_h():
    A, B, C, D = (60, 165), (130, 50), (250, 50), (320, 165)
    H, K = (130, 165), (250, 165)
    f = Fig(390, 215)
    _trap_draw(f, A, B, C, D)
    f.line(B, H, 'acc', 'stroke-dasharray="6 4"'); f.line(C, K, 'acc', 'stroke-dasharray="6 4"')
    f.right_angle(H, (-1, 0), (0, -1)); f.right_angle(K, (1, 0), (0, -1))
    f.label(H, (0, 1), 'H', 'tx', start=14); f.label(K, (0, 1), 'K', 'tx', start=14)
    f.label(_mid(A, H), (0, 1), 'x', 'tx', start=16); f.label(_mid(K, D), (0, 1), 'x', 'tx', start=16)
    f.label(_mid(B, H), (-1, 0), 'h', 'tx', start=10, alts=(0, 20, -20, 180))
    f.label(_mid(H, K), (0, 1), 'b', 'tx', start=16)
    return f.render('BH и CK — высоты. AH = KD = x, HK = BC = b')

def fig_trap_rect():
    A, B, C, D = (80, 165), (80, 50), (230, 50), (320, 165)
    Hp = (230, 165)
    f = Fig(390, 215)
    _trap_draw(f, A, B, C, D)
    f.line(C, Hp, 'acc', 'stroke-dasharray="6 4"')
    f.right_angle(A, (1, 0), (0, -1)); f.right_angle(B, (1, 0), (0, 1)); f.right_angle(Hp, (1, 0), (0, -1))
    f.label(Hp, (0, 1), 'H', 'tx', start=14)
    f.label(_mid(A, B), (-1, 0), 'h', 'tx', start=10)
    f.label(_mid(B, C), (0, -1), 'b', 'tx', start=12)
    f.label(_mid(Hp, D), (0, 1), 'a − b', 'tx', start=16)
    return f.render('Прямоугольная трапеция: AB ⟂ AD, AB = h; AD = a, BC = b, HD = a − b')

def fig_trap_diag():
    A, D = (40, 170), (300, 170)
    ac = 260 * math.sin(math.radians(70)) / math.sin(math.radians(80))
    C = (A[0] + ac * math.cos(math.radians(30)), A[1] - ac * math.sin(math.radians(30)))
    B = (A[0] + D[0] - C[0], C[1])
    f = Fig(340, 215)
    _trap_draw(f, A, B, C, D)
    f.line(A, C, 'acc', 'stroke-dasharray="6 4"')
    f.arc(A, 40, 0, 30); f.arc(C, 30, _ang(C, A), _ang(C, D))
    f.label(A, (1, -0.2), '30°', 'tm', start=48, alts=(0, 8, -8, 16, -16))
    f.label(C, (0.1, 1), '80°', 'tm', start=34, alts=(0, 12, -12, 25, -25))
    return f.render('Равнобедренная трапеция ABCD, диагональ AC')
