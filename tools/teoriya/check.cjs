// Проверка комплектов квадратиков по стандарту Лилии. Без сети и без токенов: просто читает файлы.
// Запуск: node tools/teoriya/check.cjs [путь ...]   (файлы .json = теория, .txt = тест/ДЗ/контрольная; папка = всё внутри)
// Без аргументов проверяет tools/teoriya/src и все tools/teoriya/works-*.
// E = ошибка (исправить до публикации), w = предупреждение (посмотреть глазами).
const fs = require('fs'), path = require('path');
const Quiz = require('../../assets/quiz-core.js');
const ROOT = path.resolve(__dirname, '../..');
const ids = new Set();
for (const f of fs.readdirSync(ROOT).filter(x => /^lesson-route-.*\.json$/.test(x))) {
  const r = JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
  (r.lessons || []).forEach(t => ids.add(t.id));
}
const LONG = /[–—]/;
const walk = p => fs.statSync(p).isDirectory() ? fs.readdirSync(p).flatMap(n => walk(path.join(p, n))) : [p];
function texts(o, acc = []) {
  if (typeof o === 'string') acc.push(o);
  else if (Array.isArray(o)) o.forEach(x => texts(x, acc));
  else if (o && typeof o === 'object') Object.entries(o).forEach(([k, v]) => { if (k !== 'svg') texts(v, acc); });
  return acc;
}
function mathBalanced(s) { return (s.match(/(?<!\\)\\\(/g) || []).length === (s.match(/(?<!\\)\\\)/g) || []).length; }

function checkTheory(file, E, W) {
  let d; try { d = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { E.push('не читается JSON: ' + e.message); return; }
  const id = path.basename(file, '.json');
  ['file', 'title', 'tag', 'square', 'blocks'].forEach(k => { if (!d[k]) E.push('нет поля ' + k); });
  if (d.square && d.square !== id) E.push('square «' + d.square + '» не совпадает с именем файла');
  if (d.square && !ids.has(d.square)) E.push('квадратика ' + d.square + ' нет ни в одной карте программы');
  const bl = d.blocks || [];
  if (bl.length < 6) E.push('блоков теории ' + bl.length + ', нужно не меньше 6');
  let term = 0;
  bl.forEach((b, i) => {
    const n = 'блок ' + (i + 1) + ' «' + (b.title || '?') + '»', it = b.items || [], all = texts(it).join(' ');
    if (!b.title) E.push(n + ': нет заголовка');
    if (!it.length) E.push(n + ': пустой');
    if (!/\d/.test(all)) E.push(n + ': нет числового примера');
    const why = it.filter(x => x.why !== undefined);
    if (!why.length) W.push(n + ': нет «Почему так»');
    why.forEach(x => { if (String(x.why).length < 40) W.push(n + ': «Почему так» слишком короткое, похоже на пересказ правила'); });
    if (!it.some(x => x.f !== undefined)) W.push(n + ': ни одной формулы в рамке');
    if (/\*\*/.test(all)) term++;
  });
  if (!term) E.push('нигде не выделен термин (**термин**)');
  const full = texts(d).join('\n');
  if (LONG.test(full)) E.push('длинное тире, нужен дефис');
  if (!mathBalanced(full)) E.push('несбалансированные \\( \\)');
  if (/\\begin\{(array|matrix)\}/.test(full) && !/\\left\\\{/.test(full)) W.push('таблица/массив без фигурной скобки: если это система, нужна «{»');
}

function checkWork(file, E, W) {
  const raw = fs.readFileSync(file, 'utf8'), base = path.basename(file);
  if (LONG.test(raw)) E.push('длинное тире, нужен дефис');
  if (!mathBalanced(raw)) E.push('несбалансированные \\( \\)');
  let d;
  try { d = Quiz.parse(raw); } catch (e) { E.push('сайт не примет файл: ' + e.message); return; }
  const kind = d.kind || 'free', n = d.tasks.length;
  const m = /^(?:test|dz|kr)-([0-9]+[A-Za-z]*-\d+)/.exec(base);
  if (m && !ids.has(m[1]) && !/-9\d\d$/.test(m[1])) E.push('квадратика ' + m[1] + ' из имени файла нет в картах');
  const theory = /^test-/.test(base), isDz = /^dz-/.test(base), isKr = /^kr-/.test(base);
  if (theory && kind !== 'self') W.push('тест по теории должен быть типом «сам» (сейчас ' + kind + ')');
  if (isKr && kind !== 'exam') W.push('контрольная должна быть типом «контр» (сейчас ' + kind + ')');
  if (isDz && kind !== 'hw') W.push('ДЗ должно быть типом «дз» (сейчас ' + kind + ')');
  if ((theory || isKr) && !d.time) E.push('у тестов и контрольных нужно «Время: минуты»');
  if (isDz && (n < 5 || n > 10)) W.push('в ДЗ ' + n + ' заданий, обычно 5-10');
  d.tasks.forEach((t, i) => {
    const k = 'задание ' + (i + 1);
    if (theory && t.points !== 1) E.push(k + ': в тесте по теории все задания по 1 баллу');
    if (t.points === 3 && !(isKr && i === n - 1)) W.push(k + ': 3 балла бывает только у последнего задания контрольной');
    if (t.type === 'choice') {
      const o = t.options || [];
      if (o.length < 2) E.push(k + ': вариантов меньше 2'); else if (o.length === 2) W.push(k + ': всего 2 варианта, угадать можно в половине случаев');
      if (new Set(o).size !== o.length) E.push(k + ': одинаковые варианты');
    }
    if (t.hint && !isDz) W.push(k + ': подсказка вне ДЗ, сайт её не покажет');
    if (/(^|\s)[1-3]\)\s.*\s[2-4]\)\s/.test(t.q) && !/\n/.test(t.q)) W.push(k + ': пункты 1), 2) в одной строке, каждый пункт с новой строки');
    if (/ДЗ|домашн/i.test(t.q)) W.push(k + ': в условии слова про домашнее задание');
    if (t.figure && !fs.existsSync(path.join(ROOT, 'quiz-fig', t.figure))) E.push(k + ': рисунка quiz-fig/' + t.figure + ' нет в репозитории');
  });
}

const args = process.argv.slice(2);
const targets = (args.length ? args : [path.join(__dirname, 'src'), ...fs.readdirSync(__dirname).filter(x => x.startsWith('works-')).map(x => path.join(__dirname, x))])
  .flatMap(p => walk(path.resolve(p))).filter(f => /\.(json|txt)$/.test(f));
let bad = 0, warn = 0;
targets.forEach(f => {
  const E = [], W = [];
  try { (f.endsWith('.json') ? checkTheory : checkWork)(f, E, W); } catch (e) { E.push('сбой проверки: ' + e.message); }
  if (E.length || W.length) {
    console.log(path.relative(ROOT, f));
    E.forEach(x => console.log('  E ' + x)); W.forEach(x => console.log('  w ' + x));
  }
  if (E.length) bad++; warn += W.length;
});
console.log('\nФайлов: ' + targets.length + ', с ошибками: ' + bad + ', предупреждений: ' + warn);
process.exit(bad ? 1 : 0);
