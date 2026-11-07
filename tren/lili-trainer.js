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

  const portraits = [
    ['capy', 'Капибара'], ['rac', 'Енот'], ['axo', 'Аксолотль'],
    ['otr', 'Выдра'], ['qk', 'Квокка'], ['cat', 'Кот'],
    ['mer', 'Сурикат'], ['ham', 'Хомяк'], ['bis', 'Крыса'],
  ];
  const topicPortraits = {
    'trenazher-korni-kontrolnaya-8': 'otr',
    'trenazher-drobi-s-nulya-8-oge': 'capy',
    'trenazher-delenie-stolbikom': 'mer',
    'trenazher-stepeni-8': 'rac',
    'trenazher-procenty-7-klass': 'ham',
    'trenazher-krugi-eylera-8-oge': 'axo',
    'trenazher-funktsii-9-oge': 'cat',
    'trenazher-nod-po-smyslu': 'qk',
    'trenazher-tekstovye-zadachi-5-po-smyslu': 'bis',
  };

  function addPortrait() {
    const topic = location.pathname.split('/').pop().replace(/(?:-gen)?\.html$/, '');
    let index = 0;
    for (const char of topic) index = (index * 31 + char.charCodeAt(0)) % portraits.length;
    const [id, animal] = portraits.find(([id]) => id === topicPortraits[topic]) || portraits[index];
    const existing = document.querySelector('.mascot-hero img');
    const image = existing || document.createElement('img');
    image.src = 'img/forest/' + id + '-idle.jpg';
    image.alt = animal + ', талисман lili.math';
    image.decoding = 'async';
    if (existing) return;

    image.width = image.height = 64;
    const header = document.createElement('header');
    header.className = 'trainer-identity';
    if (!document.querySelector('.brand')?.textContent.includes('lili.math')) {
      const brand = document.createElement('div');
      brand.className = 'trainer-wordmark';
      brand.textContent = 'lili.math';
      header.append(brand);
    }
    header.append(image);
    const target = document.querySelector('.wrap:not(#app)');
    if (target) target.prepend(header);
    else {
      header.classList.add('trainer-identity--outer');
      document.body.prepend(header);
    }
  }

  addPortrait();
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
