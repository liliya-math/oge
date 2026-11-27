'use strict';

(() => {
  const byId = (id) => document.getElementById(id);
  const tiers = { basic: 'База', application: 'Применение', transfer: 'Выбор способа' };
  const fullTest = (n) => n === 18 ? 'vhodnoy-test-oge-18-geometriya-na-kletkah.html' : 'vhodnye-testy-oge.html?n=' + n;

  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  function mathText(node, text) {
    const simple = '[−-]?(?:√?[0-9]+(?:[,.][0-9]+)?|[A-Za-zπ][A-Za-zπ0-9²³⁴⁵⁰₁₂₃]*)';
    const atom = '(?:\\([^()]+\\)|' + simple + ')';
    const fraction = new RegExp('(?<![\\p{L}\\p{N}])(' + atom + ')/(' + atom + ')(?![\\p{L}\\p{N}])', 'gu');
    const unwrap = (part) => part.startsWith('(') ? part.slice(1, -1) : part;
    let from = 0;
    for (const match of text.matchAll(fraction)) {
      node.append(text.slice(from, match.index));
      const stack = element('span', undefined, 'fraction');
      stack.setAttribute('aria-label', match[0]);
      stack.append(element('span', unwrap(match[1])), element('span', unwrap(match[2])));
      node.append(stack);
      from = match.index + match[0].length;
    }
    node.append(text.slice(from));
  }

  function svgElement(tag, attributes) {
    const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
    return node;
  }

  function diagram(question) {
    const paths = question.paths || [];
    const labels = question.labels || [];
    const circles = question.circles || [];
    const graph = question.graph;
    const annotations = question.annotations || [];
    const schematic = question.schematic;
    const all = paths.flat().concat((question.dashes || []).flat(), annotations.map(([, x, y]) => [x, y]), labels.map(([, x, y]) => [x, y]), circles.flatMap(([x, y, r]) => [[x - r, y - r], [x + r, y + r]]));
    const xs = all.map(([x]) => x);
    const ys = all.map(([, y]) => y);
    const left = graph ? -5 : Math.min(0, Math.floor(Math.min(...xs)) - 1);
    const bottom = graph ? -5 : Math.min(0, Math.floor(Math.min(...ys)) - 1);
    const right = graph ? 5 : Math.max(7, Math.ceil(Math.max(...xs)) + 1);
    const top = graph ? 5 : Math.max(6, Math.ceil(Math.max(...ys)) + 1);
    const cell = 26;
    const margin = schematic ? 27 : 16;
    const x = (v) => margin + (v - left) * cell;
    const y = (v) => question.line ? 39 : margin + (top - v) * cell;
    const svg = svgElement('svg', {
      viewBox: '0 0 ' + (x(right) + margin) + ' ' + (question.line ? 65 : y(bottom) + margin),
      class: 'diagram',
      role: 'img',
      'aria-label': graph ? 'График функции на координатной плоскости' : schematic || 'Чертёж на квадратной сетке'
    });
    let grid = '';
    for (let a = left; a <= right; a++) grid += 'M' + x(a) + ' ' + y(top) + 'V' + y(bottom) + ' ';
    for (let b = bottom; b <= top; b++) grid += 'M' + x(left) + ' ' + y(b) + 'H' + x(right) + ' ';
    if (question.line) {
      let ticks = 'M' + x(left) + ' ' + y(0) + ' H' + x(right);
      for (let a = left + 1; a < right; a++) ticks += ' M' + x(a) + ' 34v10';
      ticks += ' M' + (x(right) - 8) + ' 34l8 5-8 5';
      svg.setAttribute('aria-label', 'Числовая прямая с отмеченными точками');
      svg.append(svgElement('path', { class: 'axis', d: ticks }));
      for (const [mark,a] of labels) {
        const isNumber = /^\d$/.test(mark);
        const label = svgElement('text', { x: x(a), y: isNumber ? 58 : 29, 'text-anchor': 'middle' });
        label.textContent = mark;
        if (!isNumber) svg.append(svgElement('circle', { class: 'figure-label', cx: x(a), cy: 39, r: 4 }));
        svg.append(label);
      }
      return svg;
    }
    if (!schematic) svg.append(svgElement('path', { class: 'grid', d: grid }));
    if (graph) {
      svg.append(svgElement('path', { class: 'axis', d: 'M' + x(left) + ' ' + y(0) + 'H' + x(right) + ' M' + x(0) + ' ' + y(bottom) + 'V' + y(top) }));
      for (const [mark, a, b] of [['0', -.45, -.52], ['1', .93, -.56], ['1', -.55, .9], ['x', 4.62, .24], ['y', .24, 4.64]]) {
        const text = svgElement('text', { x: x(a), y: y(b) });
        text.textContent = mark;
        svg.append(text);
      }
      const [kind, a, b, c = 0] = graph;
      const formulas = {
        line: (v) => a * v + b,
        quad: (v) => a * (v - b) ** 2 + c,
        inv: (v) => a / v + b,
        abs: (v) => a * Math.abs(v - b) + c,
        sqrt: (v) => a * Math.sqrt(v - b) + c,
        cube: (v) => a * (v - b) ** 3 + c
      };
      const formula = formulas[kind];
      let d = '';
      let connected = false;
      for (let i = left * 80; i <= right * 80; i++) {
        const vx = i / 80;
        const vy = formula(vx);
        if (vy < bottom || vy > top || !Number.isFinite(vy)) { connected = false; continue; }
        d += (connected ? 'L' : 'M') + x(vx).toFixed(2) + ' ' + y(vy).toFixed(2) + ' ';
        connected = true;
      }
      svg.append(svgElement('path', { class: 'shape', d }));
      return svg;
    }
    const points = (path) => path.map(([a, b]) => x(a) + ',' + y(b)).join(' ');
    if (question.shade) {
      const d = paths.map((path) => path.map(([a,b], i) => (i ? 'L' : 'M') + x(a) + ' ' + y(b)).join(' ') + ' Z').join(' ');
      svg.append(svgElement('path', { d, fill: '#ddb08f99', 'fill-rule': 'evenodd' }));
    }
    for (const path of paths) svg.append(svgElement('polyline', { class: 'shape', points: points(path) }));
    for (const path of question.dashes || []) svg.append(svgElement('polyline', { class: 'shape', points: points(path), 'stroke-dasharray': '5 5' }));
    for (const [a,b,r] of circles) svg.append(svgElement('circle', { class: 'shape', cx: x(a), cy: y(b), r: cell * r }));
    for (const [mark,a,b,dx = 5,dy = -7] of labels) {
      const label = svgElement('text', { x: x(a) + dx, y: y(b) + dy });
      label.textContent = mark;
      svg.append(svgElement('circle', { class: 'figure-label', cx: x(a), cy: y(b), r: 3.5 }), label);
    }
    for (const [mark, a, b] of annotations) {
      const text = svgElement('text', { x: x(a), y: y(b), 'text-anchor': 'middle' });
      text.textContent = mark;
      svg.append(text);
    }
    return svg;
  }

  function addTheory(number, questions) {
    const links = new Map();
    for (const { topic, review } of questions) {
      if (!review) continue;
      const url = number === 18 ? review[0].split('#')[0] : review[0];
      if (!links.has(url)) links.set(url, new Set());
      links.get(url).add(topic);
    }
    if (!links.size) return;
    const container = byId('theory-links');
    if (links.size === 1) {
      container.append(theoryLink('Теория по номеру', links.keys().next().value));
    } else {
      const details = element('details');
      const list = element('ul');
      details.append(element('summary', 'Теория по номеру'), list);
      for (const [url, topics] of links) {
        const item = element('li');
        item.append(theoryLink([...topics].slice(0, 2).join(' · '), url));
        list.append(item);
      }
      container.append(details);
    }
    container.hidden = false;
  }

  function theoryLink(title, url) {
    const link = element('a', title);
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener';
    return link;
  }

  function renderTable(rows) {
    const table = element('table');
    table.append(element('caption', 'Данные для задания'));
    const head = element('thead');
    const body = element('tbody');
    rows.forEach((row, i) => {
      const tr = element('tr');
      row.forEach((value, j) => {
        const cell = element(i === 0 || j === 0 ? 'th' : 'td', value);
        if (i === 0 || j === 0) cell.scope = i === 0 ? 'col' : 'row';
        tr.append(cell);
      });
      (i === 0 ? head : body).append(tr);
    });
    table.append(head, body);
    return table;
  }

  function parseAnswer(raw) {
    const match = raw.trim().replaceAll('−', '-').replaceAll(',', '.').match(/^([+-]?(?:\d+(?:\.\d+)?|\.\d+))(?:\s*\/\s*([+-]?\d+))?$/);
    if (!match) return NaN;
    const value = Number(match[1]) / (match[2] === undefined ? 1 : Number(match[2]));
    return Number.isFinite(value) ? value : NaN;
  }

  function start(number, test) {
    const { questions } = test;
    const count = questions.length;
    addTheory(number, questions);
    const automatic = questions.filter((q) => !q.rubric).length;
    const storageKey = 'lili-oge-entry-v2-' + number;
    let position = 0;
    let pendingFinish = false;
    let copyText = '';
    const answers = Array(count).fill('');
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey));
      if (stored?.answers?.length === count) {
        stored.answers.forEach((answer, i) => { if (typeof answer === 'string') answers[i] = answer.slice(0, questions[i].rubric ? 4000 : 40); });
        position = Number.isInteger(stored.position) && stored.position >= 0 && stored.position < count ? stored.position : 0;
      }
    } catch { /* The test works for the current tab without storage. */ }

    function save() {
      try { localStorage.setItem(storageKey, JSON.stringify({ answers, position })); }
      catch { /* Storage can be unavailable in private browsing. */ }
    }

    const title = 'Входной тест ОГЭ № ' + number;
    document.title = title + ' · lili.math';
    byId('subject').textContent = title;
    byId('heading').textContent = test.title;
    byId('meta').textContent = count + ' заданий · ' + (number === 18 ? '50–70 минут' : automatic < count ? 'краткие и развёрнутые ответы' : 'ответы сохраняются в браузере');
    byId('load-status').hidden = true;
    byId('layout').hidden = false;

    const jumps = questions.map((_, i) => {
      const button = element('button', i + 1);
      button.type = 'button';
      button.addEventListener('click', () => go(i));
      byId('jump-list').append(button);
      return button;
    });

    function progress() {
      const filled = answers.filter(Boolean).length;
      byId('progress').max = count;
      byId('progress').value = filled;
      byId('progress-label').textContent = 'Отвечено ' + filled + ' из ' + count;
      byId('percent').textContent = Math.round(filled * 100 / count) + '%';
      jumps.forEach((button, i) => {
        button.toggleAttribute('data-filled', !!answers[i]);
        button.setAttribute('aria-current', i === position ? 'step' : 'false');
        button.setAttribute('aria-label', 'Задание ' + (i + 1) + (answers[i] ? ', есть ответ' : ', без ответа'));
      });
    }

    function showQuestion(focus) {
      const question = questions[position];
      byId('step').textContent = 'Задание ' + (position + 1) + ' из ' + count;
      byId('tier').textContent = tiers[question.tier];
      byId('prompt').replaceChildren();
      mathText(byId('prompt'), question.prompt);
      const visual = byId('visual');
      visual.replaceChildren();
      if (question.table) {
        const wrapper = element('div', undefined, 'table-scroll');
        wrapper.append(renderTable(question.table));
        visual.append(wrapper);
      }
      if (question.paths?.length || question.graph || question.circles) {
        const drawing = diagram(question);
        if (question.schematic) {
          const figure = element('figure', undefined, 'task-schematic');
          figure.append(drawing, element('figcaption', 'Рисунок схематический.'));
          visual.append(figure);
        } else {
          visual.append(drawing);
        }
      }
      const written = !!question.rubric;
      byId('number-answer').hidden = written;
      byId('written-answer').hidden = !written;
      byId('answer-help').textContent = question.format || (written ? 'Запиши ход решения и обоснование.' : 'Можно ввести число или дробь.');
      byId(written ? 'written' : 'answer').value = answers[position];
      byId('previous').disabled = position === 0;
      byId('next').textContent = position === count - 1 ? 'К результату →' : 'Дальше →';
      byId('input-status').textContent = '';
      byId('answer').removeAttribute('aria-invalid');
      progress();
      if (focus) byId('step').focus();
    }

    function validate() {
      if (!questions[position].rubric && answers[position] && !Number.isFinite(parseAnswer(answers[position]))) {
        byId('input-status').textContent = 'Введи числовой ответ или оставь поле пустым.';
        byId('answer').setAttribute('aria-invalid', 'true');
        byId('answer').focus();
        return false;
      }
      return true;
    }

    function go(i) {
      if (!validate()) return;
      pendingFinish = false;
      byId('finish-status').textContent = '';
      position = i;
      save();
      showQuestion(true);
    }

    function showResults() {
      if (!validate()) return;
      const skipped = answers.filter((answer) => !answer).length;
      if (skipped && !pendingFinish) {
        pendingFinish = true;
        byId('finish-status').textContent = 'Без ответа: ' + skipped + '. Нажми «Завершить тест» ещё раз или вернись к заданиям.';
        byId('finish').focus();
        return;
      }
      const totalLabel = automatic < count ? 'Краткие ответы' : 'Всего';
      const stats = new Map([[totalLabel, [0, 0]], ...Object.values(tiers).map((name) => [name, [0, 0]])]);
      const skills = new Map();
      const written = [];
      questions.forEach((q, i) => {
        const answer = answers[i];
        if (q.rubric) { written.push({q,i,answer}); return; }
        const numeric = parseAnswer(answer);
        const correct = Number.isFinite(numeric) && Math.abs(numeric - q.value) < 1e-9;
        for (const name of [totalLabel, tiers[q.tier]]) {
          const stat = stats.get(name);
          stat[1]++;
          if (correct) stat[0]++;
        }
        const skill = skills.get(q.topic) || { correct: 0, total: 0, missed: [], links: new Map() };
        skill.total++;
        if (correct) skill.correct++;
        else {
          skill.missed.push({ number: i + 1, empty: !answer, note: q.note });
          if (q.review) skill.links.set(...q.review);
        }
        skills.set(q.topic, skill);
      });

      const summary = byId('summary');
      summary.replaceChildren();
      const lines = [title + '. ' + test.title];
      for (const [label,[points,total]] of stats) {
        if (!total) continue;
        const row = element('div', undefined, 'result-stat');
        const ratio = points + ' из ' + total;
        row.append(element('b', ratio), element('span', label));
        summary.append(row);
        lines.push(label + ' ' + ratio);
      }
      const list = byId('skill-list');
      list.replaceChildren();
      const ranked = [...skills].sort(([, a], [, b]) => b.missed.length - a.missed.length);
      for (const [topic, skill] of ranked) {
        const row = element('li');
        const result = skill.correct + ' из ' + skill.total;
        row.append(element('strong', topic), element('p', result));
        const missed = [];
        if (skill.missed.length) {
          const details = element('details');
          const list = element('ul');
          details.append(element('summary', 'Что проверить · ' + skill.missed.length), list);
          for (const item of skill.missed) {
            const label = '№ ' + item.number + (item.empty ? ' · пропуск' : ' · ошибка');
            list.append(element('li', label + '. ' + (item.note || 'Реши заново и сравни приёмы с теорией.')));
            missed.push(label);
          }
          row.append(details);
        }
        for (const [url,label] of skill.links) {
          const link = element('a', label);
          link.href = url;
          link.target = '_blank';
          link.rel = 'noopener';
          const paragraph = element('p');
          paragraph.append(link);
          row.append(paragraph);
        }
        list.append(row);
        lines.push(topic + ' ' + result + (missed.length ? ' (' + missed.join(', ') + ')' : ''));
      }
      byId('result-status').textContent = 'Пропущено ' + skipped + '. Результат показывает, что проверить на следующем занятии.';
      lines.push('Пропущено ' + skipped + '.');
      byId('written-results').hidden = !written.length;
      byId('rubrics').replaceChildren();
      if (written.length) byId('rubrics').append(element('p', 'Краткие ответы проверены автоматически. Для развёрнутых решений открой критерии и сверь ход рассуждения.', 'status'));
      for (const {q,i,answer} of written) {
        const block = element('details', undefined, 'rubric');
        block.append(element('summary', '№ ' + (i + 1) + ' · ' + q.topic + (answer ? ' · решение записано' : ' · пропуск')));
        block.append(element('p', q.prompt));
        if (answer) block.append(element('p', 'Записанное решение'), element('blockquote', answer));
        const checklist = element('ol');
        q.rubric.forEach((criterion) => checklist.append(element('li', criterion)));
        block.append(checklist);
        if (q.review) {
          const link = element('a', q.review[1]);
          link.href = q.review[0];
          link.target = '_blank';
          link.rel = 'noopener';
          block.append(link);
        }
        byId('rubrics').append(block);
        lines.push('№ ' + (i + 1) + ' · ' + q.topic + (answer ? '\n' + answer : ' · пропуск'));
      }
      copyText = lines.join('\n');
      byId('manual-copy')?.remove();
      byId('copy-status').textContent = '';
      byId('layout').hidden = true;
      byId('results').hidden = false;
      byId('result-heading').focus();
    }

    function update(event) {
      answers[position] = event.target.value.trim();
      pendingFinish = false;
      byId('finish-status').textContent = '';
      byId('input-status').textContent = '';
      byId('answer').removeAttribute('aria-invalid');
      progress();
      save();
    }

    byId('answer').addEventListener('input', update);
    byId('written').addEventListener('input', update);
    byId('answer-form').addEventListener('submit', (event) => {
      event.preventDefault();
      if (position === count - 1) showResults();
      else go(position + 1);
    });
    byId('previous').addEventListener('click', () => go(position - 1));
    byId('finish').addEventListener('click', showResults);
    byId('review').addEventListener('click', () => {
      pendingFinish = false;
      byId('finish-status').textContent = '';
      byId('results').hidden = true;
      byId('layout').hidden = false;
      showQuestion(true);
    });
    byId('restart').addEventListener('click', () => {
      if (!window.confirm('Удалить ответы этого теста и начать заново?')) return;
      answers.fill('');
      byId('copy-status').textContent = '';
      byId('review').click();
      go(0);
    });
    byId('copy').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(copyText);
        byId('copy-status').textContent = 'Результат скопирован.';
      } catch {
        const field = element('textarea');
        field.value = copyText;
        field.readOnly = true;
        field.id = 'manual-copy';
        field.setAttribute('aria-label', 'Результат для копирования');
        byId('manual-copy')?.remove();
        byId('copy-status').textContent = 'Выделенный текст можно скопировать вручную.';
        byId('copy-status').after(field);
        field.select();
      }
    });
    showQuestion(false);
  }

  async function init() {
    const params = new URLSearchParams(location.search);
    const number = Number(document.body.dataset.number || params.get('n') || 0);
    if (number === 18 && !document.body.dataset.number) {
      location.replace(fullTest(18));
      return;
    }
    const file = number === 18 ? 'assets/oge-18-diagnostic.json' : 'assets/oge-diagnostics.json';
    const response = await fetch(file + '?v=20261127');
    if (!response.ok) throw new Error('could not load diagnostic');
    const data = await response.json();
    const test = number === 18 ? data : data[number];
    if (number && test) {
      start(number, test);
      return;
    }
    byId('load-status').hidden = true;
    byId('hub').hidden = false;
    for (const [id, test] of Object.entries({ ...data, 18: { title: 'Геометрия на клетках' } })) {
      const link = element('a');
      link.href = fullTest(+id);
      link.append(element('b', '№ ' + id), element('span', test.title));
      const item = element('li');
      item.append(link);
      byId('test-list').append(item);
    }
  }

  init().catch(() => { byId('load-status').textContent = 'Не удалось загрузить тест. Обнови страницу.'; });
})();
