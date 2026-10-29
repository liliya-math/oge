# -*- coding: utf-8 -*-
"""Чертежи к уроку «Подобные треугольники»: номер экрана -> html."""
import figs as FG
import figs_auto as G
from figs import fig_prop
import figs as _F
from figs_auto import tri, mk

DEF = ('D', 'E', 'F')

def fig_sim_pair(sides, k, **kw):
    L = max(sides)
    s = min(15.0, (400 - 24 - 46 - 20) / (L * (1 + k) * 1.2))
    s = min(s, 200 / (L * max(k, 1)))
    kw.setdefault('H_', 230)
    return _F.fig_sim_pair(sides, k, s=s, **kw)

def two_seg(l1, l2, t1, t2, n1='AB', n2='CD'):
    pts = {n1[0]: (0, 0), n1[1]: (l1, 0), n2[0]: (0, -2.2), n2[1]: (l2, -2.2)}
    return mk(pts, [n1[0], n1[1]], None, [(n2[0], n2[1], 'ln')], {(n1[0], n1[1]): (t1, (0, -1)), (n2[0], n2[1]): (t2, (0, 1))},
              show=[n1[0], n1[1], n2[0], n2[1]], W=340, H=130, px=40, py=34)

def seg_m(t, l1, l2, tot=None):
    pts = {'A': (0, 0), 'B': (l1 + l2, 0), 'M': (l1, 0)}
    lab = {('A', 'M'): (l1_ := None, (0, 1))}
    lab = {}
    return None

def seg_point(la, lb, tot=None, W=340):
    n = la_ = 0
    return None

def seg_with_point(xa, xb, ta, tb, tot=None):
    pts = {'A': (0, 0), 'B': (xa + xb, 0), 'M': (xa, 0)}
    lab = {('A', 'M'): (ta, (0, -1)), ('M', 'B'): (tb, (0, -1))}
    if tot: lab[('A', 'B')] = (tot, (0, 1))
    return mk(pts, ['A', 'B'], None, [], lab, dots=['M'], show=['A', 'B', 'M'], W=340, H=110, px=40, py=34)

def two_tri(s1, s2, l1=None, l2=None, cap=''):
    a1 = tri(G.tri_sss(*s1), lab=l1 or {}, W=300, H=165)
    a2 = tri(G.tri_sss(*s2, names='DEF'), names='DEF', lab=l2 or {}, W=300, H=165)
    return a1 + a2 + (f'<div class="gcap">{cap}</div>' if cap else '')

def ang_tri(A, B, names='ABC'):
    n1, n2, n3 = names
    return tri(G.tri_asa(A, B, 10, names), names=names, ang=[(n1, n2, n3, f'{A}°'), (n2, n3, n1, f'{B}°'), (n3, n1, n2, '?')], W=300, H=160)

def nonpar():
    pts = {'A': (4, 6), 'B': (0, 0), 'C': (9, 0)}
    return mk(pts, ['A', 'B', 'C'], {'M': ('on', 'A', 'B', 0.4), 'N': ('on', 'A', 'C', 0.6)}, [('M', 'N', 'dash')],
              show=['A', 'B', 'C', 'M', 'N'], dots=['M', 'N'], W=330, cap='MN не параллельна BC')

PAIR = dict(names2=DEF)

MAP = {
 4: two_seg(6, 4, '6', '4'),
 5: two_seg(12, 8, '12 см', '8 см'),
 6: two_seg(3, 15, '30 см', '1,5 м'),
 15: seg_with_point(3, 7, '3', '7'),
 16: seg_with_point(2, 3, 'AM', 'MB', '20'),
 20: fig_prop(0.3, seg=('3', '7', '2,4', '5,6')),
 24: fig_prop(1 / 3, seg=('4', None, '?', None), cap='AB = 12, AC = 15'),
 28: fig_prop(0.4, cap='MN ∥ BC'),
 30: nonpar(),
 32: fig_sim_pair((4, 5, 6), 2, marks=(1, 2, 3), names2=DEF, cap='△ABC ∼ △DEF'),
 33: fig_sim_pair((4, 5, 6), 2, marks=(1, 2, 3), names2=DEF, cap='Равные углы отмечены одинаковыми дужками'),
 34: fig_sim_pair((4, 5, 6), 2, marks=(1, 2, 3), names2=DEF, cap='△ABC ∼ △DEF'),
 35: fig_sim_pair((4, 5, 6), 2, lab1=('4', '5', '6'), lab2=('8', '10', '12'), marks=(1, 2, 3), names2=DEF),
 36: fig_sim_pair((4, 5, 6), 3, lab1=('4', '5', '6'), lab2=('12', '15', '18'), names2=DEF),
 37: fig_sim_pair((4, 5, 6), 3, lab1=(None, None, '5'), lab2=(None, None, '?'), names2=DEF, cap='k = 3'),
 38: fig_sim_pair((4, 5, 6), 2, lab1=(None, None, '?'), lab2=(None, None, '18'), names2=DEF, cap='k = 2'),
 39: fig_sim_pair((4, 5, 6), 1.5, lab1=(None, None, '6'), lab2=(None, None, '9'), names2=('M', 'N', 'K'), cap='△ABC ∼ △MNK'),
 40: fig_sim_pair((4, 5, 6), 2, marks=(1, 2, 0), names2=DEF, cap='∠A = 50°, ∠B = 60°'),
 41: fig_sim_pair((4, 5, 6), 2, marks=(1, 2, 0), names2=DEF, cap='∠A = 50°, ∠B = 60°, △ABC ∼ △DEF'),
 43: two_tri((4, 6, 8), (6, 9, 12), {'BC': '4', 'CA': '6', 'AB': '8'}, {'EF': '6', 'FD': '9', 'DE': '12'}),
 46: [ang_tri(40, 60), ang_tri(60, 80, 'DEF')],
 47: [ang_tri(50, 60), ang_tri(50, 80, 'DEF')],
 49: fig_sim_pair((4.6, 5, 3), 1.8, lab1=(None, '5', '3'), lab2=(None, '9', '6'), marks=(1, 0, 0), names2=DEF, cap='∠A = ∠D'),
 50: fig_sim_pair((4.6, 6, 4), 1.5, lab1=(None, '6', '4'), lab2=(None, '9', '6'), marks=(0, 1, 0), names2=DEF, cap='∠B = ∠E'),
 52: two_tri((2, 3, 4), (6, 9, 12), {'BC': '2', 'CA': '3', 'AB': '4'}, {'EF': '6', 'FD': '9', 'DE': '12'}),
 53: two_tri((5, 6, 7), (10, 12, 15), {'BC': '5', 'CA': '6', 'AB': '7'}, {'EF': '10', 'FD': '12', 'DE': '15'}),
 54: two_tri((4, 6, 8), (6, 9, 12), {'BC': '4', 'CA': '6', 'AB': '8'}, {'EF': '6', 'FD': '9', 'DE': 'x'}),
 56: fig_prop(1 / 3, seg=('3', None, None, None), cap='AB = 9, MN = 4'),
 59: fig_sim_pair((4, 5, 6), 2, lab1=('4', '5', '6'), lab2=('8', '10', '12'), names2=DEF, cap='P = 15 и P = 30'),
 60: fig_sim_pair((4, 5, 6), 1.5, names2=DEF, cap='P(△ABC) = 20, k = 1,5'),
 64: fig_sim_pair((4, 5, 6), 2, names2=DEF, cap='k = 3, S(△ABC) = 5'),
 65: fig_sim_pair((4, 5, 6), 2, names2=DEF, cap='k = 4'),
 66: fig_sim_pair((4, 5, 6), 1.7, names2=DEF, cap='S(△ABC) = 8, S(△DEF) = 32'),
 67: fig_sim_pair((4, 5, 6), 1.4, names2=DEF, lab1=(None, None, '5'), lab2=(None, None, '?'), cap='S₁ = 16, S₂ = 36'),
 68: fig_sim_pair((4, 5, 6), 2, names2=DEF, cap='k = 2, высота △ABC равна 5'),
 69: fig_sim_pair((4, 5, 6), 1.5, names2=DEF, cap='Высоты 6 и 9, P(△ABC) = 20'),
 71: fig_prop(0.5, cap='M и N — середины сторон. S(△ABC) = 48'),
 72: fig_prop(0.5, cap='M и N — середины сторон. P(△AMN) = 9'),
 76: FG.fig_trap_o(('4', '10'), cap='AC = 21'),
 81: fig_sim_pair((4, 5, 6), 1.5, names2=DEF, cap='P₁ : P₂ = 2 : 3'),
 84: fig_prop(0.4, apex='B', p='A', q='C', seg=('BM', 'MA', 'BN', '?'), cap='MN ∥ AC'),
 86: fig_prop(0.4, apex='B', p='A', q='C', seg=('4', '6', '3', '?'), cap='MN ∥ AC'),
 87: fig_sim_pair((8, 7, 6), 1.8, lab1=('8', None, '6'), lab2=('?', None, '15'), names2=DEF),
 88: fig_sim_pair((4, 5, 6), 5 / 3, lab1=(None, None, '9'), lab2=(None, None, '?'), names2=DEF, cap='P₁ = 24, P₂ = 40'),
 89: fig_sim_pair((4, 5, 6), 2.4, names2=DEF, cap='S₁ = 12, S₂ = 108'),
}
