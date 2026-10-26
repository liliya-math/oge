#!/usr/bin/env node
/* Проверка генераторов тренажёров: node tools/test_tren.cjs [файл.html ...]
   Для каждой темы прогоняет каждый тип задач по 400 раз и проверяет, что ответ принимается,
   неверный не принимается, варианты ответов не повторяются и в тексте нет undefined/NaN. */
const fs = require("fs"), path = require("path");
const core = require("../tren/core.js");
const root = path.join(__dirname, "..");
const pages = process.argv.length > 2 ? process.argv.slice(2) : [
  "trenazher-znaki-6-klass.html", "trenazher-fsu-7-klass.html", "trenazher-geometriya-osnovy.html",
  "trenazher-5-klass.html", "trenazher-linejnaya-funkciya-7-klass.html"
];
let bad = 0, N = 400;
function fail(msg) { bad++; if (bad < 40) console.log("  ОШИБКА: " + msg); }
function strip(s) { return String(s).replace(/<[^>]+>/g, ""); }

pages.forEach(function (file) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  const m = /<script>([\s\S]*?)<\/script>/.exec(html);
  if (!m) { fail(file + ": нет встроенного скрипта"); return; }
  let cfg = null;
  global.TrenCore = { u: core.u, check: core.check, start: function (c) { cfg = c; } };
  try { new Function(m[1])(); } catch (e) { fail(file + ": скрипт упал: " + e.message); return; }
  if (!cfg) { fail(file + ": не вызван TrenCore.start"); return; }
  console.log(file + " · " + cfg.modes.length + " тем");
  const ids = {};
  cfg.modes.forEach(function (mode) {
    if (ids[mode.id]) fail(file + ": повтор id темы " + mode.id); ids[mode.id] = 1;
    const pool = mode.pool(), keys = {}, kind = mode.input || "num";
    let minDistinct = 1e9;
    pool.forEach(function (it) {
      if (keys[it.k]) fail(mode.id + ": повтор ключа " + it.k); keys[it.k] = 1;
      if (!it.lab) fail(mode.id + "/" + it.k + ": нет подписи плитки");
      const seen = {};
      for (let i = 0; i < N; i++) {
        let inst;
        try { inst = it.gen ? it.gen() : it; } catch (e) { fail(mode.id + "/" + it.k + ": gen упал: " + e.message); break; }
        const tag = mode.id + "/" + it.k + " [" + strip(inst.q).slice(0, 70) + "]";
        seen[inst.q] = 1;
        ["q", "rev", "sub"].forEach(function (f) {
          if (inst[f] !== undefined && /undefined|NaN|null|Infinity/.test(strip(inst[f]))) fail(tag + ": в поле " + f + " мусор: " + strip(inst[f]));
        });
        if (!inst.q || !inst.rev) { fail(tag + ": пустой q или rev"); continue; }
        if (inst.ok && !inst.ok(inst.ans)) fail(tag + ": свой ok не принял верный ответ «" + inst.ans + "»");
        if (kind === "num") {
          if (typeof inst.a !== "number" || !isFinite(inst.a)) { fail(tag + ": a не число"); continue; }
          if (Math.abs(inst.a) > 100000) fail(tag + ": слишком большой ответ " + inst.a);
          if (!core.check("num", inst, inst.ans)) fail(tag + ": верный ответ «" + inst.ans + "» не принят");
          if (core.check("num", inst, core.u.n(inst.a + 1))) fail(tag + ": неверный ответ принят");
          if (Math.abs(inst.a * 10000 - Math.round(inst.a * 10000)) > 1e-5) fail(tag + ": у ответа больше четырёх знаков " + inst.a);
        } else if (kind === "frac") {
          const a = inst.a;
          if (!Array.isArray(a) || a.length !== 2 || !Number.isInteger(a[0]) || !Number.isInteger(a[1]) || a[1] <= 0) { fail(tag + ": a должно быть [n,d]"); continue; }
          if (core.u.gcd(a[0], a[1]) !== 1) fail(tag + ": ответ " + a + " не сокращён");
          if (!core.check("frac", inst, inst.ans)) fail(tag + ": верный ответ «" + inst.ans + "» не принят");
          if (inst.ans2 && !core.check("frac", inst, inst.ans2)) fail(tag + ": смешанная запись «" + inst.ans2 + "» не принята");
          if (core.check("frac", inst, (a[0] + a[1]) + "/" + a[1])) fail(tag + ": неверный ответ принят");
          if (a[1] > 1 && core.check("frac", inst, (a[0] * 2) + "/" + (a[1] * 2))) fail(tag + ": несокращённая дробь принята");
        } else if (kind === "choice") {
          const o = inst.opts;
          if (!Array.isArray(o) || o.length < 2) { fail(tag + ": нужно минимум 2 варианта"); continue; }
          if (!Number.isInteger(inst.c) || inst.c < 0 || inst.c >= o.length) { fail(tag + ": c вне диапазона"); continue; }
          const set = {}; o.forEach(function (x) { set[strip(x)] = (set[strip(x)] || 0) + 1; });
          if (Object.keys(set).length !== o.length) fail(tag + ": варианты повторяются: " + o.map(strip).join(" | "));
          o.forEach(function (x) { if (/undefined|NaN|null/.test(strip(x))) fail(tag + ": мусор в варианте " + strip(x)); });
        } else fail(mode.id + ": неизвестный input " + kind);
      }
      minDistinct = Math.min(minDistinct, Object.keys(seen).length);
    });
    console.log("  " + mode.id.padEnd(8) + String(pool.length).padStart(2) + " типов, мин. разных вопросов у типа: " + minDistinct);
  });
});
console.log(bad ? "\nНЕ ПРОШЛО: " + bad : "\nВсе проверки прошли");
process.exit(bad ? 1 : 0);
