#!/usr/bin/env node
/* Проверка ступенчатых тренажёров: node tools/test_staged.cjs [tren/proporcii.js ...]
   Каждый генератор прогоняется 600 раз: правильный ответ принимается, подсказка и текст без undefined/NaN,
   у выбора один верный вариант и нет повторов, ответ rows совпадает с sol. */
const path = require("path");
const files = process.argv.length > 2 ? process.argv.slice(2) : ["tren/proporcii.js"];
let bad = 0;
function fail(m) { bad++; if (bad < 40) console.log("  ОШИБКА: " + m); }
const strip = s => String(s).replace(/<[^>]+>/g, "");
files.forEach(function (file) {
  delete require.cache[require.resolve(path.join(__dirname, "..", file))];
  const T = require(path.join(__dirname, "..", file));
  console.log(file + " · " + T.api.STEPS.length + " ступеней");
  T.api.STEPS.forEach(function (s) {
    s.teach.forEach(function (sl, k) {
      if (/undefined|NaN/.test(strip(sl.t + sl.v))) fail(s.id + " слайд " + k + ": мусор");
      if (sl.ask && !sl.ask.opts.some(o => o[0] === sl.ask.ans)) fail(s.id + " слайд " + k + ": ответ вопроса не среди вариантов");
    });
    let kinds = {};
    for (let i = 0; i < 600; i++) {
      let t; try { t = s.gen(i % 8); } catch (e) { fail(s.id + " gen упал: " + e.message); break; }
      const tag = s.id + " " + s.title + " [" + strip(t.q).slice(0, 60) + "]";
      if (/undefined|NaN|Infinity/.test(strip(t.q + t.hint))) fail(tag + ": мусор в тексте");
      kinds[t.input.type] = 1;
      if (t.input.type === "choice") {
        const vs = t.input.options.map(o => o.v);
        if (new Set(vs).size !== vs.length) fail(tag + ": повтор вариантов");
        if (new Set(t.input.options.map(o => strip(o.html))).size !== vs.length) fail(tag + ": одинаковый вид вариантов");
        if (!vs.includes(String(t.ans))) fail(tag + ": верного ответа нет среди вариантов " + t.ans);
        if (vs.length < 2) fail(tag + ": меньше двух вариантов");
      } else {
        if (t.check(t.sol) !== "ok") fail(tag + ": верный ответ не принят " + JSON.stringify(t.sol));
        t.input.rows.forEach(r => { if (t.sol[r.key] === undefined) fail(tag + ": нет sol для " + r.key); });
        const w = JSON.parse(JSON.stringify(t.sol)); const k0 = Object.keys(w)[0], v0 = w[k0];
        if (typeof v0 === "number") { w[k0] = v0 + 1; if (t.check(w) === "ok") fail(tag + ": неверный принят"); }
      }
    }
  });
});
console.log(bad ? "ошибок: " + bad : "всё в порядке");
process.exit(bad ? 1 : 0);
