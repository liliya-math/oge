'use strict';
const keys = [
  {
    "value": 90,
    "slug": "ugly",
    "label": "Углы и тригонометрия",
    "group": "Углы и тригонометрия",
    "applied": false
  },
  {
    "value": 45,
    "slug": "ugly",
    "label": "Углы и тригонометрия",
    "group": "Углы и тригонометрия",
    "applied": true
  },
  {
    "value": 0.5,
    "slug": "ugly",
    "label": "Углы и тригонометрия",
    "group": "Углы и тригонометрия",
    "applied": true
  },
  {
    "value": 4,
    "slug": "rasstoyanie",
    "label": "Расстояние до прямой",
    "group": "Расстояние до прямой",
    "applied": false
  },
  {
    "value": 6,
    "slug": "rasstoyanie",
    "label": "Расстояние до прямой",
    "group": "Расстояние до прямой",
    "applied": true
  },
  {
    "value": 8,
    "slug": "rasstoyanie",
    "label": "Расстояние до прямой",
    "group": "Расстояние до прямой",
    "applied": true
  },
  {
    "value": 12,
    "slug": "treugolnik",
    "label": "Треугольники общего вида",
    "group": "Треугольники общего вида",
    "applied": false
  },
  {
    "value": 7.5,
    "slug": "treugolnik",
    "label": "Треугольники общего вида",
    "group": "Треугольники общего вида",
    "applied": true
  },
  {
    "value": 8,
    "slug": "treugolnik",
    "label": "Треугольники общего вида",
    "group": "Треугольники общего вида",
    "applied": true
  },
  {
    "value": 6,
    "slug": "pryamougolnyy",
    "label": "Прямоугольные треугольники",
    "group": "Прямоугольные треугольники",
    "applied": false
  },
  {
    "value": 5,
    "slug": "pryamougolnyy",
    "label": "Прямоугольные треугольники",
    "group": "Прямоугольные треугольники",
    "applied": true
  },
  {
    "value": 12,
    "slug": "pryamougolnyy",
    "label": "Прямоугольные треугольники",
    "group": "Прямоугольные треугольники",
    "applied": true
  },
  {
    "value": 21,
    "slug": "parallelogram",
    "label": "Параллелограмм",
    "group": "Параллелограмм",
    "applied": false
  },
  {
    "value": 10,
    "slug": "parallelogram",
    "label": "Параллелограмм",
    "group": "Параллелограмм",
    "applied": true
  },
  {
    "value": 12,
    "slug": "parallelogram",
    "label": "Параллелограмм",
    "group": "Параллелограмм",
    "applied": true
  },
  {
    "value": 16,
    "slug": "romb",
    "label": "Ромб",
    "group": "Ромб",
    "applied": false
  },
  {
    "value": 8,
    "slug": "romb",
    "label": "Ромб",
    "group": "Ромб",
    "applied": true
  },
  {
    "value": 20,
    "slug": "romb",
    "label": "Ромб",
    "group": "Ромб",
    "applied": true
  },
  {
    "value": 14,
    "slug": "trapetsiya",
    "label": "Трапеция",
    "group": "Трапеция",
    "applied": false
  },
  {
    "value": 12,
    "slug": "trapetsiya",
    "label": "Трапеция",
    "group": "Трапеция",
    "applied": true
  },
  {
    "value": 4.5,
    "slug": "trapetsiya",
    "label": "Трапеция",
    "group": "Трапеция",
    "applied": true
  },
  {
    "value": 22,
    "slug": "mnogougolnik",
    "label": "Многоугольники и отношения",
    "group": "Многоугольники и отношения",
    "applied": false
  },
  {
    "value": 13,
    "slug": "mnogougolnik",
    "label": "Многоугольники и отношения",
    "group": "Многоугольники и отношения",
    "applied": true
  },
  {
    "value": 0.1111111111111111,
    "slug": "podobie",
    "label": "Подобие и отношения",
    "group": "Многоугольники и отношения",
    "applied": true
  }
];

const form = document.getElementById('diagnostic');
const results = document.getElementById('results');
const notice = document.getElementById('notice');
const theoryLink = document.querySelector('main > p a').getAttribute('href');
const answerFields = Array.from(form.querySelectorAll('input'));
let resultText = '';

function parseAnswer(raw) {
  const value = raw.trim().replaceAll('−', '-').replaceAll(',', '.');
  const match = value.match(/^([+-]?(?:\d+(?:\.\d+)?|\.\d+))(?:\s*\/\s*([+-]?\d+))?$/);
  if (!match) return null;
  const number = Number(match[1]) / (match[2] === undefined ? 1 : Number(match[2]));
  return Number.isFinite(number) ? number : null;
}

function renderResults(answers) {
  const skills = new Map();
  let basic = 0;
  let applied = 0;
  let skipped = 0;
  keys.forEach((key, index) => {
    const answer = answers[index];
    const correct = answer !== null && Math.abs(answer - key.value) < 1e-9;
    if (answer === null) skipped += 1;
    if (correct && key.applied) applied += 1;
    if (correct && !key.applied) basic += 1;
    if (!skills.has(key.group)) skills.set(key.group, {correct: 0, total: 0, review: new Map()});
    const skill = skills.get(key.group);
    skill.total += 1;
    if (correct) skill.correct += 1;
    else skill.review.set(key.slug, key.label);
  });

  const totals = `${basic + applied} из 24 · база ${basic} из 8 · применение ${applied} из 16`;
  let level = 'Начни с разделов теории, где потеряны баллы.';
  if (basic >= 7 && applied >= 13) level = 'Готовность высокая. Можно переходить к подборке задач № 18.';
  else if (basic >= 5 && applied >= 7) level = 'Часть задач уже получается. Повтори темы с потерянными баллами и реши похожие задачи по чертежам.';
  document.getElementById('totals').textContent = totals;
  document.getElementById('level').textContent = level;
  document.getElementById('skipped').textContent = `Пропущено заданий: ${skipped}. Шкала авторская, для входной диагностики.`;
  const list = document.getElementById('skills');
  list.replaceChildren();
  const lines = [];
  for (const [name, skill] of skills) {
    const summary = `${name} ${skill.correct} из ${skill.total}`;
    lines.push(summary);
    const item = document.createElement('li');
    item.append(summary);
    for (const [slug, label] of skill.review) {
      const link = document.createElement('a');
      link.href = `${theoryLink}#${slug}`;
      link.textContent = `Повторить: ${label.toLowerCase()}`;
      item.append(' · ', link);
    }
    list.append(item);
  }
  resultText = ['Входной тест ОГЭ № 18', totals, level, ...lines, `Пропущено: ${skipped}`].join('\n');
  form.hidden = true;
  results.hidden = false;
  document.getElementById('result-heading').focus();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  notice.textContent = '';
  const raw = answerFields.map((field) => field.value.trim());
  const answers = raw.map(parseAnswer);
  const invalid = raw.findIndex((value, index) => value && answers[index] === null);
  if (invalid >= 0) {
    notice.textContent = `В задании ${invalid + 1} введи число или оставь поле пустым.`;
    answerFields[invalid].setAttribute('aria-invalid', 'true');
    answerFields[invalid].focus();
    return;
  }
  renderResults(answers);
});
form.addEventListener('input', (event) => {
  event.target.removeAttribute('aria-invalid');
  notice.textContent = '';
});

document.getElementById('restart').addEventListener('click', () => {
  form.reset();
  notice.textContent = '';
  document.getElementById('copy-status').textContent = '';
  results.hidden = true;
  form.hidden = false;
  answerFields[0].focus();
});

document.getElementById('copy').addEventListener('click', async () => {
  const status = document.getElementById('copy-status');
  try {
    await navigator.clipboard.writeText(resultText);
    status.textContent = 'Результат скопирован.';
  } catch {
    status.textContent = 'Копирование недоступно. Можно выделить и скопировать текст результата вручную.';
  }
});
