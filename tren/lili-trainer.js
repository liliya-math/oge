(() => {
  'use strict';

  const svg = 'http://www.w3.org/2000/svg';
  const skip = 'script, style, textarea, input, select, option, code, pre, svg, math, .fr, .fraction, .math-fraction, .formula, .rad, .radical, .rt, .trainer-math, [contenteditable]';
  const candidate = /√|[0-9]\/|—/;
  const number = /^\d+(?:[.,]\d+)?/;
  const fraction = /^(\d+(?:[.,]\d+)?)\/(\d+(?:[.,]\d+)?)(?![\d/])/;
  const variable = /^[A-Za-zА-Яа-яЁё]/u;

  function span(name) {
    const element = document.createElement('span');
    element.className = name;
    return element;
  }

  function rootMark() {
    const mark = document.createElementNS(svg, 'svg');
    mark.setAttribute('class', 'trainer-root-mark');
    mark.setAttribute('viewBox', '0 0 12 20');
    mark.setAttribute('preserveAspectRatio', 'none');
    mark.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS(svg, 'path');
    path.setAttribute('d', 'M.5 11L3 10L6 19L11.5 .5H12');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('vector-effect', 'non-scaling-stroke');
    mark.append(path);
    return mark;
  }

  function mathNode(content, label) {
    const wrapper = span('trainer-math');
    wrapper.setAttribute('role', 'math');
    wrapper.setAttribute('aria-label', label);
    wrapper.append(content);
    return wrapper;
  }

  function readRadicand(text, offset) {
    const rest = text.slice(offset);
    if (rest.startsWith('(')) {
      let depth = 0;
      for (let index = 0; index < rest.length; index++) {
        if (rest[index] === '(') depth++;
        if (rest[index] === ')' && --depth === 0) {
          return {inner: rest.slice(1, index), length: index + 1};
        }
      }
      return null;
    }
    const inner = (number.exec(rest) || variable.exec(rest))?.[0];
    return inner ? {inner, length: inner.length} : null;
  }

  function typeset(text, inner = false) {
    const fragment = document.createDocumentFragment();
    let start = 0;
    for (let index = 0; index < text.length; index++) {
      const char = text[index];
      const radicand = char === '√' ? readRadicand(text, index + 1) : null;
      const ratio = /\d/.test(char) && !/[\d/]/.test(text[index - 1] || '')
        ? fraction.exec(text.slice(index)) : null;
      if (!radicand && !ratio) continue;

      fragment.append(text.slice(start, index));
      if (radicand) {
        const root = span('trainer-root');
        const value = span('trainer-radicand');
        value.append(typeset(radicand.inner, true));
        root.append(rootMark(), value);
        fragment.append(inner ? root : mathNode(root, 'корень из ' + radicand.inner));
        index += radicand.length;
      } else {
        const stacked = span('trainer-frac');
        for (const part of ratio.slice(1)) {
          const cell = document.createElement('span');
          cell.textContent = part;
          stacked.append(cell);
        }
        fragment.append(inner ? stacked : mathNode(stacked, ratio[1] + ' делить на ' + ratio[2]));
        index += ratio[0].length - 1;
      }
      start = index + 1;
    }
    fragment.append(text.slice(start));
    return fragment;
  }

  function formatText(node) {
    if (!candidate.test(node.data) || !node.parentElement || node.parentElement.closest(skip)) return;
    node.replaceWith(typeset(node.data.replace(/—/g, '-')));
  }

  function formatLegacyRoot(root) {
    const label = root.firstChild;
    if (label?.nodeType === Node.TEXT_NODE && label.data.trim() === '√' && root.querySelector(':scope > .ro')) {
      root.replaceChild(rootMark(), label);
    }
  }

  function formatTree(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      formatText(node);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE || node.closest('svg, math')) return;
    if (node.matches('.rt')) formatLegacyRoot(node);
    node.querySelectorAll('.rt').forEach(formatLegacyRoot);
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    const pending = [];
    while (walker.nextNode()) pending.push(walker.currentNode);
    pending.forEach(formatText);
  }

  const existingBrand = document.querySelector('.brand');
  if (!existingBrand?.textContent.includes('lili.math')) {
    const brand = document.createElement('div');
    brand.className = 'trainer-wordmark';
    brand.textContent = 'lili.math';
    const target = document.querySelector('.wrap');
    if (target && target.id !== 'app') target.prepend(brand);
    else document.body.insertBefore(brand, document.body.firstChild);
  }
  formatTree(document.body);

  const observer = new MutationObserver(records => {
    observer.disconnect();
    for (const record of records) {
      if (record.type === 'characterData') formatText(record.target);
      else record.addedNodes.forEach(formatTree);
    }
    observer.observe(document.body, {subtree: true, childList: true, characterData: true});
  });
  observer.observe(document.body, {subtree: true, childList: true, characterData: true});
})();
