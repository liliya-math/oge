# -*- coding: utf-8 -*-
"""Чертежи к урокам про теоремы синусов и косинусов (часть 1 и часть 2)."""
import figs as FG
import figs_auto as G
from figs_auto import tri, mk

def sas(a, b, deg, x='?', la=None, lb=None, W=330, at=None, extra=None, segs=(), lab_extra=None, cap=''):
    """Угол C = deg между сторонами CB = a и CA = b; напротив — AB. x=None: подпись AB не ставим."""
    lab = {'CB': la or str(a), 'CA': lb or str(b)}
    if x is not None: lab['AB'] = x
    lab.update(lab_extra or {})
    return tri(G.tri_sas(a, b, deg), lab=lab, ang=[('C', 'B', 'A', at if at is not None else f'{deg}°')], W=W, extra=extra, segs=segs, cap=cap)

def sss(a, b, c, la=None, lb=None, lc=None, ang=(), cap='', names='ABC'):
    return tri(G.tri_sss(a, b, c), lab={'BC': la or str(a), 'CA': lb or str(b), 'AB': lc or str(c)}, ang=ang, cap=cap)

def asa(A, B, c=10, lab=None, cap='', names='ABC'):
    return tri(G.tri_asa(A, B, c), lab=lab or {}, ang=[('A', 'B', 'C', f'{A}°'), ('B', 'C', 'A', f'{B}°')], cap=cap)

def right(l1, l2, lab, ang_deg=None, right_at='C'):
    ang = [('A', 'C', 'B', ang_deg)] if ang_deg else []
    return tri(G.tri_right(l1, l2), lab=lab, ang=ang, right=[('C', 'A', 'B')])

def ang_tri(A, B, third='?'):
    return tri(G.tri_asa(A, B, 10), ang=[('A', 'B', 'C', f'{A}°'), ('B', 'C', 'A', f'{B}°'), ('C', 'A', 'B', third)], W=300, H=170)

def angle_at_A(a_ab, b_ac, deg, x='?'):
    """Угол A между AB = a_ab и AC = b_ac, напротив BC."""
    return tri(G.tri_sas(a_ab, b_ac, deg, names=('C', 'B', 'A')), names=('C', 'B', 'A'),
               lab={'AB': str(a_ab), 'CA': str(b_ac), 'BC': x}, ang=[('A', 'B', 'C', f'{deg}°')])

def circ(lab, cap, rlab='R', deg=60, names='ABC'):
    return G.circ_tri(names=names, lab=lab, rlab=rlab, cap=cap, A_deg=deg, inward=tuple(lab) if deg > 90 else ())

def tri_ABC_letters(cap=''):
    return FG.tri_sas(6, 5, 70, 'a', 'b', 'c', 'C')

MAP = {
 10: tri(G.tri_right(5.2, 3), ang=[('A', 'C', 'B', '30°'), ('B', 'A', 'C', '60°')], right=[('C', 'A', 'B')], cap='90° + 60° + 30° = 180°'),
 11: ang_tri(50, 65),
 15: tri(G.tri_right(4, 3), lab={'AB': 'гипотенуза', 'CA': 'катет', 'CB': 'катет'}, right=[('C', 'A', 'B')], W=360),
 16: right(8, 6, {'CA': '8', 'CB': '6', 'AB': '?'}),
 19: right(8, 6, {'AB': '10', 'CB': '6'}, 'α'),
 20: right(8, 6, {'AB': '10', 'CA': '8'}, 'α'),
 27: FG.fig_semi(),
 33: FG.fig_semi(),
 50: FG.tri_sas(6, 5, 70, 'a', 'b', 'c', 'C'),
 52: sas(8, 5, 60, '?'),
 53: sas(8, 5, 60, '?'),
 54: sas(8, 5, 60, '?'),
 55: sas(15, 8, 60),
 59: sas(5, 3, 120),
 60: sas(5, 3, 120),
 61: sas(10, 6, 120),
 62: FG.tri_sas(6, 5, 70, 'a', 'b', 'c', 'C'),
 65: sss(4, 5, 6), 66: sss(5, 7, 9),
 67: sss(5, 7, 8, ang=[('B', 'A', 'C', '?')]),
 69: sas(4, 6, 60), 70: sas(4, 6, 60),
 75: FG.fig_labeled(),
 78: FG.fig_labeled('A'),
 82: asa(30, 45, 10, {'BC': '6', 'CA': '?'}),
 83: asa(30, 45, 10, {'BC': '6', 'CA': '?'}),
 85: asa(30, 45, 10, {'BC': '6', 'CA': '?'}),
 86: asa(30, 45, 10, {'BC': '4', 'CA': '?'}),
 87: tri(G.tri_right(8.66, 5, names=('A', 'C', 'B')), names=('A', 'C', 'B'), lab={'BC': '5', 'CA': '?'}, ang=[('A', 'B', 'C', '30°')], right=[('B', 'A', 'C')]),
 89: circ({'BC': '3√3'}, '∠A = 60°', deg=60),
 90: circ({'BC': '7'}, '∠A = 30°', deg=30),
 91: circ({'BC': '5'}, '∠A = 150°', deg=150),
 95: angle_at_A(4, 6, 60),
 96: asa(30, 45, 10, {'BC': '6', 'CA': '?'}),
 97: sss(5, 7, 3, lc='3', ang=[('B', 'A', 'C', '?')]),
 98: circ({'BC': '8'}, '∠A = 30°', deg=30),
 100: sas(7, 8, 120),
 101: sss(2, 3, 4, ang=[('C', 'B', 'A', '?')]),
 102: asa(60, 30, 10, {'BC': '3√3', 'CA': '?'}),
 103: sss(6, 8, 11),
 104: circ({'AB': '4√3'}, '∠C = 120°', deg=120, names=('C', 'A', 'B')),
}
