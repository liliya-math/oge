# -*- coding: utf-8 -*-
"""Чертежи к уроку «Трапеция, часть 2»."""
import figs as FG
import figs_auto as G
from figs_auto import trap, tri, par, mk
from figs_map_trap import angA, angB, angC, angD

def hl(t, d=(1, 0)): return {('B', 'H'): (t, d)}
def ch(t): return {('C', 'H'): (t, (1, 0))}

def tri_h(base, h, off=3.5, cap=''):
    return mk({'A': (0, 0), 'B': (base, 0), 'C': (off, h)}, ['A', 'B', 'C'], {'H': ('foot', 'C', 'A', 'B')}, [('C', 'H', 'dash')],
              {'AB': str(base), ('C', 'H'): (str(h), (1, 0))}, right=[('H', 'C', 'B')], show=['A', 'B', 'C', 'H'], W=340, cap=cap)

def par_h(base, h, cap=''):
    return mk({'A': (0, 0), 'D': (base, 0), 'B': (1.5, h), 'C': (base + 1.5, h)}, ['A', 'B', 'C', 'D'], {'H': ('foot', 'B', 'A', 'D')}, [('B', 'H', 'dash')],
              {'AD': str(base), ('B', 'H'): (str(h), (-1, 0))}, right=[('H', 'B', 'D')], show=['A', 'B', 'C', 'D', 'H'], W=380, cap=cap)

def rt(legs, lab):
    return tri(G.tri_right(*legs), lab=lab, right=[('C', 'A', 'B')])

MAP = {
 3: trap('iso', 20, 10, 6, hts=('B', 'C'), lab={'AD': 'AD', 'BC': 'BC'}),
 4: trap('gen', 14, 8, 5, lab={'AD': '14', 'BC': '8'}, mid='?'),
 6: tri_h(10, 6),
 7: par_h(7, 4),
 9: rt((8, 6), {'CA': '8', 'CB': '6', 'AB': '?'}),
 10: rt((12, 5), {'CB': '5', 'CA': '?', 'AB': '13'}),
 13: FG.fig_trap_area(),
 14: trap('gen', 14, 8, 5, hts=('B',), lab={'AD': 'a', 'BC': 'b', ('B', 'H'): ('h', (1, 0))}, mid='m'),
 15: trap('gen', 10, 6, 4, hts=('B',), lab={'AD': '10', 'BC': '6', ('B', 'H'): ('4', (1, 0))}),
 16: trap('gen', 13, 7, 5, hts=('B',), lab={'AD': '13', 'BC': '7', ('B', 'H'): ('5', (1, 0))}),
 17: trap('gen', 9, 5, 3, hts=('B',), lab={'AD': '9', 'BC': '5', ('B', 'H'): ('3', (1, 0))}),
 18: trap('gen', 14, 8, 4, hts=('B',), lab={('B', 'H'): ('4', (1, 0))}, mid='9'),
 20: trap('gen', 12, 8, 6, hts=('B',), lab={'AD': '12', 'BC': '8', ('B', 'H'): ('?', (1, 0))}, cap='S = 60'),
 21: trap('gen', 18, 10, 6, hts=('B',), lab={'AD': '18', 'BC': '10', ('B', 'H'): ('?', (1, 0))}, cap='S = 84'),
 22: trap('gen', 14, 5, 6, hts=('B',), lab={'BC': '5', 'AD': '?', ('B', 'H'): ('6', (1, 0))}, cap='S = 48'),
 23: trap('gen', 14, 8, 5, hts=('B',), lab={('B', 'H'): ('5', (1, 0))}, mid='?', cap='S = 45'),
 24: trap('gen', 10, 6, 4, hts=('B',), lab={'AD': '10', 'BC': '6', ('B', 'H'): ('4', (1, 0))}),
 25: trap('gen', 10, 6, 4, hts=('B',), lab={'AD': '10', 'BC': '6', ('B', 'H'): ('4', (1, 0))}),
 26: trap('gen', 10, 4, 5, hts=('B',), off=3.317, lab={'AB': 'боковая', ('B', 'H'): ('h', (1, 0))}),
 27: trap('gen', 10, 4, 5, hts=('B',), off=3.317, lab={'AD': '10', 'BC': '4', 'AB': '6', ('B', 'H'): ('5', (1, 0))}),
 30: trap('iso', 20, 8, 6, hts=('B', 'C'), lab={'AD': '20', 'BC': '8'}, ang=[angA('45°')]),
 31: trap('iso', 18, 10, 4, hts=('B',), lab={'AD': '18', 'BC': '10'}, ang=[angA('45°')]),
 32: trap('iso', 24, 12, 6, hts=('B',), lab={'AD': '24', 'BC': '12'}, ang=[angA('45°')]),
 33: trap('iso', 16, 8, 4, hts=('B',), lab={'AD': '16', ('B', 'H'): ('4', (1, 0))}, ang=[angA('45°')]),
 35: trap('rect', 13, 7, 6, hts=('Ch',), lab={'AD': '13', 'BC': '7'}, ang=[('D', 'C', 'A', '45°')]),
 36: trap('rect', 9, 5, 4, lab={'AD': '9', 'BC': '5', 'AB': '4'}),
 39: trap('iso', 14, 8, 4, hts=('B',), lab={'AD': '14', 'BC': '8', 'AB': '5'}),
 40: trap('iso', 20, 10, 12, hts=('B',), lab={'AD': '20', 'BC': '10', 'AB': '13', ('B', 'H'): ('?', (1, 0))}),
 41: trap('iso', 22, 6, 6, hts=('B',), lab={'AD': '22', 'BC': '6', 'AB': '10'}),
 42: trap('iso', 26, 10, 15, hts=('B',), lab={'AD': '?', 'BC': '10', 'AB': '17', ('B', 'H'): ('15', (1, 0))}),
 44: trap('rect', 9, 4, 12, hts=('Ch',), lab={'AB': '12', 'BC': '4', 'CD': '13'}),
 45: trap('rect', 11, 5, 8, hts=('Ch',), lab={'AB': '8', 'BC': '5', 'CD': '10'}),
 46: trap('rect', 15, 7, 8, diag=[('B', 'D')], lab={'AD': '15', 'AB': '8', ('B', 'D'): ('?', (0, 1))}),
 47: trap('iso', 20, 8, 8, hts=('B',), lab={'AB': '10', ('A', 'H'): ('6', (0, 1)), ('B', 'H'): ('?', (1, 0))}),
 49: FG.fig_trap_grid((0, 7), (1, 5), 3),
 52: FG.fig_trap_grid((1, 7), (2, 4), 3),
 54: FG.fig_trap_grid((0, 8), (3, 7), 5, rows=6),
 56: FG.fig_trap_grid((0, 6), (3, 5), 3),
 57: FG.fig_trap_grid((0, 6), (3, 5), 3),
 59: trap('gen', 14, 8, 5, hts=('B',), lab={('B', 'H'): ('h', (1, 0))}, mid='m'),
 60: trap('gen', 14, 6, 7, hts=('B',), lab={('B', 'H'): ('7', (1, 0))}, mid='10'),
 61: trap('gen', 14, 6, 6, hts=('B',), lab={('B', 'H'): ('?', (1, 0))}, mid='15', cap='S = 90'),
 62: trap('gen', 15, 10, 4, hts=('B',), lab={'AD': '3x', 'BC': '2x', ('B', 'H'): ('4', (1, 0))}, mid='10'),
 63: trap('iso', 20, 10, 12, hts=('B',), lab={'AD': '20', 'BC': '10', 'AB': '?', ('B', 'H'): ('12', (1, 0))}),
 64: trap('iso', 22, 12, 5, hts=('B',), lab={'AD': '22', ('B', 'H'): ('5', (1, 0))}, ang=[angA('45°')]),
 66: trap('iso', 20, 10, 6, hts=('B',), lab={'AD': 'a', 'BC': 'b', 'AB': 'c'}),
 69: trap('gen', 15, 9, 7, hts=('B',), lab={'AD': '15', 'BC': '9', ('B', 'H'): ('7', (1, 0))}),
 70: trap('gen', 14, 8, 7, hts=('B',), lab={'BC': '8', 'AD': '?', ('B', 'H'): ('7', (1, 0))}, cap='S = 70'),
 71: trap('iso', 24, 10, 7, hts=('B',), lab={'AD': '24', 'BC': '10'}, ang=[angA('45°')]),
 72: trap('iso', 16, 4, 8, hts=('B',), lab={'AD': '16', 'BC': '4', 'AB': '10'}),
 73: trap('gen', 14, 8, 5, hts=('B',), lab={('B', 'H'): ('?', (1, 0))}, mid='11', cap='S = 77'),
}
