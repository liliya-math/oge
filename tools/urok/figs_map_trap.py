# -*- coding: utf-8 -*-
"""Чертежи к урокам про трапецию (часть 1 и 2): номер экрана -> html чертежа (или список)."""
import math
import figs as FG
import figs_auto as G
from figs_auto import trap, tri, par

def a(*x): return list(x)
AB_ = lambda deg, txt, v='A': (v, 'D', 'B', txt)   # угол при A: между D и B
def angA(t): return ('A', 'D', 'B', t)
def angB(t): return ('B', 'A', 'C', t)
def angC(t): return ('C', 'B', 'D', t)
def angD(t): return ('D', 'A', 'C', t)

def parallel_tri_iso(apex, base_lab=None):
    return tri(G.tri_sss(5, 5, 6), lab=base_lab or {}, ang=[('C', 'A', 'B', apex), ('A', 'B', 'C', '?')], ticks=[('A', 'C'), ('B', 'C')])

def right_tri(legs, lab, ang_deg, ang_vertex='A'):
    return tri(G.tri_right(*legs), lab=lab, ang=[('A', 'C', 'B', ang_deg)], right=[('C', 'A', 'B')])

def proof_fig():
    pts = {'A': (0, 0), 'D': (14, 0), 'B': (3, 5), 'C': (9, 5), 'K': (20, 0)}
    return G.mk(pts, ['A', 'D', 'C', 'B'], {'N': ('mid', 'C', 'D')}, [('D', 'K', 'ln'), ('B', 'K', 'dash')],
                {'AD': 'a', 'BC': 'b'}, ticks=[('C', 'N'), ('N', 'D'), ('B', 'N'), ('N', 'K')], dots=['N'], show=['A', 'B', 'C', 'D', 'K', 'N'], W=380, cap='BN = NK, CN = ND')

def limit_fig():
    return [trap('gen', 14, 2.5, 5, show=['A', 'B', 'C', 'D'], W=380, cap='Верхнее основание b стало совсем маленьким'),
            G.mk({'A': (0, 0), 'D': (14, 0), 'C': (7, 5)}, ['A', 'D', 'C'], {'M': ('mid', 'A', 'C'), 'N': ('mid', 'D', 'C')}, [('M', 'N', 'dash')],
                 {('M', 'N'): ('MN', (0, -1))}, show=['A', 'D', 'C', 'M', 'N'], W=380, cap='b = 0: трапеция превратилась в треугольник, MN — средняя линия треугольника')]

def two_types():
    return [trap('iso', 20, 10, 6, ticks_iso=True, show=['A', 'B', 'C', 'D'], W=360, cap='Равнобедренная: AB = CD'),
            trap('rect', 18, 10, 6, show=['A', 'B', 'C', 'D'], W=360, cap='Прямоугольная: AB ⟂ AD')]

MAP = {
 5: FG.fig_parallel(), 6: FG.fig_parallel(),
 8: par(9, 6, 65, ang=[('A', 'D', 'B', '65°'), ('B', 'A', 'C', '?')]),
 10: parallel_tri_iso('80°'),
 12: right_tri((6, 6), {'CA': '6', 'CB': '?'}, '45°'),
 13: right_tri((8.66, 5), {'CB': '5', 'AB': '?'}, '30°'),
 17: trap('gen', 14, 8, 5, show=['A', 'B', 'C', 'D'], cap='Трапеция ABCD, BC ∥ AD'),
 18: trap('gen', 14, 8, 5, show=['A', 'B', 'C', 'D']),
 19: trap('gen', 14, 8, 5, hts=('B',), lab={('B', 'H'): ('h', (-1, 0))}, cap='BH — высота трапеции'),
 20: par(9, 6, 60, cap='Параллелограмм: AB ∥ CD и BC ∥ AD'),
 21: par(9, 6, 60, cap='AD ∥ BC и AB ∥ CD'),
 22: two_types(),
 23: trap('iso', 20, 10, 6, lab={'AB': '7', 'CD': '7'}, ticks_iso=True),
 24: trap('rect', 18, 10, 6, show=['A', 'B', 'C', 'D']),
 27: trap('gen', 14, 8, 5, ang=[angA('70°'), angB('?')], off=1.82),
 28: trap('gen', 14, 8, 5, ang=[angA('80°'), angB('?')], off=0.88),
 29: trap('gen', 14, 8, 5, ang=[angD('115°'), angC('?')], off=8.33),
 31: trap('gen', 14, 8, 5, ang=[angA('70°'), angD('?')], off=1.82),
 32: trap('gen', 14, 6, 5, ang=[angA('α'), angB('4α')], off=6.88),
 33: trap('gen', 14, 6, 5, ang=[angA('α'), angB('4α')], off=6.88),
 34: trap('gen', 11.33, 8, 5, ang=[angA('60°'), angC('95°'), angD('?')], off=2.89),
 37: trap('gen', 14, 8, 5, mid='MN', show=['A', 'B', 'C', 'D', 'M', 'N']),
 38: trap('gen', 14, 8, 5, lab={'AD': 'a', 'BC': 'b'}, mid='m'),
 39: trap('gen', 14, 8, 5, lab={'AD': '14', 'BC': '8'}, mid='?'),
 40: trap('gen', 12, 6, 5, lab={'AD': '12', 'BC': '6'}, mid='?'),
 41: trap('gen', 15, 10, 5, lab={'AD': '15', 'BC': '10'}, mid='?'),
 43: trap('gen', 14, 6, 5, lab={'AD': '6', 'BC': '?'}, mid='9') if False else trap('gen', 8, 6, 5, lab={'BC': '6', 'AD': '?'}, mid='9'),
 44: trap('gen', 14, 7, 5, lab={'BC': '7', 'AD': '?'}, mid='11'),
 45: trap('gen', 11, 5, 5, lab={'BC': '5', 'AD': '?'}, mid='8'),
 46: trap('gen', 12, 8, 5, lab={'AD': '3x', 'BC': '2x'}, mid='10'),
 47: trap('gen', 15, 9, 5, lab={'AD': '5x', 'BC': '3x'}, mid='12'),
 49: trap('gen', 14, 6, 5, lab={'AD': '14', 'BC': '6'}, mid='?'),
 50: trap('gen', 14, 6, 5, lab={'AD': '?', 'BC': '?'}, mid='14'),
 51: proof_fig(),
 52: limit_fig(),
 55: trap('iso', 20, 10, 6, ang=[angA('α'), angB('β')]),
 56: trap('iso', 20, 10, 6, ang=[angA('50°'), angB('?')], ticks_iso=True),
 57: trap('iso', 20, 10, 6, ang=[angA('40°'), angC('?')], ticks_iso=True),
 58: trap('iso', 20, 10, 6, ticks_iso=True),
 59: trap('iso', 20, 10, 6, diag=[('A', 'C'), ('B', 'D')], ticks_iso=True),
 60: trap('iso', 20, 10, 6, diag=[('A', 'C'), ('B', 'D')], lab={('A', 'C'): ('13', (0, 1)), ('B', 'D'): ('?', (0, 1)), 'CD': '10'}, ticks_iso=True),
 62: trap('iso', 14, 8.06, 5.14, diag=[('A', 'C')], ang=[('A', 'C', 'D', '25°'), ('C', 'A', 'D', '95°')], ticks_iso=True),
 63: trap('iso', 20, 10, 6, ang=[angB('β'), angC('β')], ticks_iso=True),
 66: trap('iso', 20, 8, 7, lab={'AD': '20', 'BC': '8', ('A', 'H'): ('?', (0, 1))}, hts=('B', 'C')),
 67: trap('iso', 24, 10, 7, lab={'AD': '24', 'BC': '10', ('A', 'H'): ('?', (0, 1))}, hts=('B',)),
 68: trap('iso', 21, 9, 7, lab={'AD': '21', 'BC': '9', ('A', 'H'): ('?', (0, 1))}, hts=('B',)),
 70: trap('iso', 18, 6, 6, lab={'AD': '18', 'BC': '6'}, ang=[angA('45°')], hts=('B',)),
 71: trap('iso', 22, 10, 6, lab={'AD': '22', 'BC': '10', ('B', 'H'): ('?', (-1, 0))}, ang=[angA('45°')], hts=('B',)),
 72: trap('iso', 34, 10, 7, ang=[angA('30°')], hts=('B',), lab={'AB': 'AB'}),
 73: trap('iso', 34, 10, 7, lab={'AB': '14', ('B', 'H'): ('?', (-1, 0))}, ang=[angA('30°')], hts=('B',)),
 74: trap('iso', 15, 7, 6.93, lab={'AB': '8', 'AD': '15', 'BC': '?'}, ang=[angA('60°')], hts=('B',)),
 76: trap('rect', 18, 10, 6, show=['A', 'B', 'C', 'D']),
 77: trap('rect', 17, 9, 8, lab={'AD': '17', 'BC': '9', ('C', 'H'): ('?', (1, 0))}, ang=[('D', 'C', 'A', '45°')], hts=('Ch',)),
 78: trap('rect', 18.4, 8, 6, lab={'CD': '12', ('C', 'H'): ('?', (1, 0))}, ang=[('D', 'C', 'A', '30°')], hts=('Ch',)),
 81: trap('gen', 10, 4, 4.9, lab={'AD': '10', 'BC': '4', 'AB': '5', 'CD': '7'}, mid='?', off=1),
 82: trap('gen', 20, 8, 6, lab={'AD': '20', 'BC': '8'}, hts=('B', 'C')),
 83: trap('gen', 20, 8, 6, lab={'AD': '20', 'BC': '8'}, hts=('B', 'C')),
 84: trap('iso', 20, 10, 6, ang=[angB(''), angC('')]),
 85: trap('iso', 20, 10, 6, ang=[angB('?')], ticks_iso=True),
 87: trap('iso', 30, 12, 6, lab={'AD': '30', 'BC': '12', ('A', 'H'): ('?', (0, 1))}, hts=('B',)),
 88: trap('gen', 14, 8, 5, mid='?', lab={'AD': 'a', 'BC': 'b'}),
 90: trap('gen', 14, 8, 5, ang=[angA('64°'), angB('?')], off=2.44),
 91: trap('gen', 27, 13, 5, lab={'AD': '27', 'BC': '13'}, mid='?'),
 92: trap('iso', 28, 12, 8, lab={'AD': '28', 'BC': '12', ('B', 'H'): ('?', (-1, 0))}, ang=[angA('45°')], hts=('B',)),
 93: trap('iso', 20, 10, 6, ang=[angA('58°'), angB('?')], ticks_iso=True),
 94: trap('gen', 15, 6, 5, lab={'AD': '5x', 'BC': '2x'}, mid='21'),
}
