# -*- coding: utf-8 -*-
"""Проверка: подписи (text) не лежат на линиях чертежа и не налезают друг на друга."""
import re, sys, json
from playwright.sync_api import sync_playwright

JS = r"""
(svg, pad) => {
  const out = [];
  const texts = [...svg.querySelectorAll('text')];
  const geos = [...svg.querySelectorAll('line,path,circle,polygon,polyline,rect')]
      .filter(e => !e.closest('text'));
  const pts = [];
  for (const g of geos) {
    if (!g.getTotalLength) continue;
    const st = getComputedStyle(g);
    const L = g.getTotalLength();
    for (let d = 0; d <= L; d += 1.5) {
      const p = g.getPointAtLength(d);
      pts.push([p.x, p.y, g.tagName + '.' + (g.getAttribute('class') || '')]);
    }
  }
  const boxes = texts.map(t => {
    const b = t.getBBox();
    return {s: t.textContent, x: b.x, y: b.y, w: b.width, h: b.height, rot: !!t.getAttribute('transform')};
  });
  for (const b of boxes) {
    if (b.rot) continue;
    // ужимаем бокс по высоте: bbox включает пустое место выше/ниже глифов
    const y0 = b.y + b.h * 0.18, y1 = b.y + b.h * 0.86;
    const hit = pts.find(p => p[0] > b.x - pad && p[0] < b.x + b.w + pad && p[1] > y0 - pad && p[1] < y1 + pad);
    if (hit) out.push('ЛИНИЯ: «' + b.s + '» на ' + hit[2] + ' (' + hit[0].toFixed(0) + ',' + hit[1].toFixed(0) + ')');
  }
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], c = boxes[j];
    if (a.rot || c.rot) continue;
    if (a.x < c.x + c.w + 1 && c.x < a.x + a.w + 1 && a.y + a.h * .18 < c.y + c.h * .86 && c.y + c.h * .18 < a.y + a.h * .86)
      out.push('ТЕКСТ: «' + a.s + '» и «' + c.s + '»');
  }
  // выход за границы viewBox
  const vb = svg.viewBox.baseVal;
  for (const b of boxes) if (!b.rot && (b.x < 0 || b.y < 0 || b.x + b.w > vb.width || b.y + b.h > vb.height)) out.push('ВНЕ РАМКИ: «' + b.s + '»');
  return out;
}
"""

def check_html_figs(css, figs, pad=2.5):
    """figs: список строк с <div class=fig><svg..>; возвращает список проблем."""
    page = '<!doctype html><meta charset=utf8><style>' + css + '</style><body>' + ''.join(f'<div class="stmt">{f}</div>' for f in figs)
    probs = []
    with sync_playwright() as p:
        br = p.chromium.launch(); pg = br.new_page(viewport={'width': 420, 'height': 900})
        pg.set_content(page)
        n = pg.evaluate("document.querySelectorAll('svg').length")
        for i in range(n):
            r = pg.evaluate("([i,pad])=>{const s=document.querySelectorAll('svg')[i];return (" + JS.strip() + ")(s,pad)}", [i, pad])
            for x in r: probs.append((i, x))
        br.close()
    return probs
