# -*- coding: utf-8 -*-
"""Рисунки части 2 урока «Теоремы синусов и косинусов». Подписи только через Fig.label."""
import math
from figs import Fig, _cent, _out, _mid, _bis

def fig_area():
    """Треугольник с высотой AH к стороне CB, угол C = 30°."""
    W, H_ = 330, 210
    C = (45.0, 175.0); B = (285.0, 175.0)
    A = (C[0] + 190 * math.cos(math.radians(30)), C[1] - 190 * math.sin(math.radians(30)))
    Hf = (A[0], C[1])
    f = Fig(W, H_)
    f.line(C, B); f.line(C, A); f.line(A, B); f.line(A, Hf, 'acc')
    f.right_angle(Hf, (-1, 0), (0, -1), 10)
    f.arc(C, 26, 0, 30)
    cen = _cent(A, B, C)
    for nm, p in (('A', A), ('B', B), ('C', C)): f.label(p, _out(cen, p), nm, 'tx', start=12)
    f.label(Hf, (0, 1), 'H', 'tx', start=12)
    f.label(_mid(C, B), (0, 1), 'a', 'tm', start=10)
    f.label(_mid(C, A), (-0.5, -1), 'b', 'tm', start=10)
    f.label(_mid(A, Hf), (1, 0), 'h', 'tm', start=10)
    f.label(C, (math.cos(math.radians(15)), -math.sin(math.radians(15))), '30°', 'tm', start=40, maxd=80, alts=(0, 5, -5, 10))
    return f.render('AH — высота. В прямоугольном треугольнике ACH: h = b · sin C')

def fig_par():
    """Параллелограмм ABCD, угол A = 60°, диагонали AC и BD."""
    W, H_ = 340, 200
    A = (40.0, 165.0); B = (220.0, 165.0)
    D = (A[0] + 110 * math.cos(math.radians(60)), A[1] - 110 * math.sin(math.radians(60)))
    C = (B[0] + D[0] - A[0], B[1] + D[1] - A[1])
    f = Fig(W, H_)
    f.line(A, B); f.line(B, C); f.line(C, D); f.line(D, A)
    f.line(A, C, 'acc'); f.line(B, D, 'acc')
    f.arc(A, 24, 0, 60)
    cen = _cent(A, B, C, D)
    for nm, p in (('A', A), ('B', B), ('C', C), ('D', D)): f.label(p, _out(cen, p), nm, 'tx', start=12)
    f.label(_mid(A, B), (0, 1), 'a', 'tm', start=10)
    f.label(_mid(A, D), (-1, 0), 'b', 'tm', start=10)
    f.label(A, (math.cos(math.radians(43)), -math.sin(math.radians(43))), '60°', 'tm', start=36, maxd=70, alts=(0, 4, -4, 8, -8))
    return f.render('Диагонали AC и BD. Угол B = 180° − 60° = 120°')

def fig_median():
    """Треугольник ABC, M — середина BC, угол C = 60°."""
    W, H_ = 320, 220
    C = (40.0, 190.0); B = (260.0, 190.0)
    A = (C[0] + 170 * math.cos(math.radians(60)), C[1] - 170 * math.sin(math.radians(60)))
    M = _mid(C, B)
    f = Fig(W, H_)
    f.line(C, B); f.line(C, A); f.line(A, B); f.line(A, M, 'acc'); f.dot(M, 3.5)
    f.arc(C, 24, 0, 60)
    cen = _cent(A, B, C)
    for nm, p in (('A', A), ('B', B), ('C', C)): f.label(p, _out(cen, p), nm, 'tx', start=12)
    f.label(M, (0, 1), 'M', 'tx', start=12)
    f.label(_mid(C, A), (-1, -0.3), 'AC', 'tm', start=10)
    f.label(_mid(C, M), (0, 1), 'CM', 'tm', start=12)
    f.label(_mid(M, B), (0, 1), 'MB', 'tm', start=12)
    f.label(C, (1, -0.3), '60°', 'tm', start=36, alts=(0, 10, -10, 20))
    return f.render('M — середина BC, поэтому CM = MB. Нужная нам сторона AM')
