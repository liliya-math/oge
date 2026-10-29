# -*- coding: utf-8 -*-
"""Чертежи к уроку «Теоремы синусов и косинусов, часть 2»."""
import figs as FG
import figs_auto as G
from figs_auto import tri, par, mk
from figs_map_sc import sas, sss, circ

def asa_free(A, B, third_at, txtA=None, txtB=None, txtC=None):
    """Треугольник с углами A, B (и C = 180 − A − B); подписи углов — как заданы (None — без подписи)."""
    ang = []
    if txtA: ang.append(('A', 'B', 'C', txtA))
    if txtB: ang.append(('B', 'C', 'A', txtB))
    if txtC: ang.append(('C', 'A', 'B', txtC))
    return tri(G.tri_asa(A, B, 6), ang=ang)

def sss_iso(a, c, ang_txt=''):
    return tri(G.tri_sss(a, a, c), lab={'BC': str(a), 'CA': str(a), 'AB': str(c)}, ang=[('C', 'A', 'B', ang_txt)] if ang_txt else [])

def par_d(a, b, deg, diag, la, lb, cap=''):
    return par(a, b, deg, lab={'AD': la, 'AB': lb, diag: ('?', (0, -1))}, ang=[('A', 'D', 'B', f'{deg}°')], segs=[(diag[0], diag[1], 'dash')], cap=cap)

def median_fig(ac, bc, deg):
    pts = G.tri_sas(bc, ac, deg)
    return mk(pts, ['A', 'B', 'C'], {'M': ('mid', 'B', 'C')}, [('A', 'M', 'dash')],
              {'CB': str(bc), 'CA': str(ac), ('A', 'M'): ('?', (0, -1))}, ang=[('C', 'B', 'A', f'{deg}°')], dots=['M'], show=['A', 'B', 'C', 'M'], W=340)

MAP = {
 7: sas(8, 3, 60),
 9: FG.fig_height(),
 13: sas(10, 6, 30, None),
 14: sas(10, 6, 30, None),
 15: sas(10, 6, 30, None),
 16: sas(9, 4, 30, None),
 17: sas(8, 5, 150, None),
 18: par(9, 6, 40, lab={'AD': 'a', 'AB': 'b'}, ang=[('A', 'D', 'B', 'α')], segs=[('B', 'D', 'dash')]),
 19: par(9, 6, 30, lab={'AD': '9', 'AB': '6'}, ang=[('A', 'D', 'B', '30°')]),
 21: sas(8, 6, 50, None, at='C', cap='S = 12'),
 22: sas(8, 10, 30, None, lb='?', cap='S = 18'),
 27: sss_iso(5, 6, ''),
 28: sss_iso(5, 6, ''),
 29: sss_iso(5, 6, ''),
 30: sss_iso(5, 6, ''),
 31: sss_iso(10, 12),
 32: sss_iso(5, 8),
 34: tri(G.tri_asa(135, 30, 5), lab={'AC': '4', 'BC': '4√2'}, ang=[('A', 'B', 'C', '135°'), ('B', 'C', 'A', '?')]),
 35: asa_free(135, 30, None, '135°', '?'),
 36: asa_free(135, 30, None, '135°', None, '?'),
 38: par(5, 3, 60, lab={'AD': '5', 'AB': '3', ('A', 'C'): ('?', (0, -1))}, ang=[('A', 'D', 'B', '60°')], segs=[('A', 'C', 'dash')]),
 39: par(8, 7, 60, lab={'AD': '8', 'AB': '7', ('A', 'C'): ('?', (0, -1))}, ang=[('A', 'D', 'B', '60°')], segs=[('A', 'C', 'dash')]),
 40: par(8, 5, 60, lab={'AD': '8', 'AB': '5', ('B', 'D'): ('?', (0, -1))}, ang=[('A', 'D', 'B', '60°')], segs=[('B', 'D', 'dash')]),
 42: median_fig(8, 10, 60),
 43: median_fig(15, 14, 60),
 45: sas(6.93, 4, 30, None, la='4√3', cap='R = ?'),
 52: sas(12, 7, 150, None),
 53: sss_iso(15, 18),
 54: par(16, 5, 60, lab={'AD': '16', 'AB': '5', ('A', 'C'): ('?', (0, -1))}, ang=[('A', 'D', 'B', '60°')], segs=[('A', 'C', 'dash')]),
 55: sss(3, 5, 7, ang=[('C', 'A', 'B', '?')]),
 56: asa_free(120, 30, None, '120°', None, '?'),
}
