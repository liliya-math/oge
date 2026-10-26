/* lili.math · общее ядро тренажёров: раунд на 15 вопросов, спринт на 60 секунд,
   карта пробелов, повтор ошибок, новые числа в каждом вопросе.
   Страница подключает ядро и вызывает TrenCore.start({...}). Прогресс хранится в localStorage браузера. */
(function (root) {
"use strict";

/* ---------- утилиты для генераторов ---------- */
var u = {};
u.rnd = function (n) { return Math.floor(Math.random() * n); };
u.ri = function (a, b) { return a + u.rnd(b - a + 1); };            // целое от a до b включительно
u.pick = function (arr) { return arr[u.rnd(arr.length)]; };
u.shuffle = function (a) {
  a = a.slice();
  for (var i = a.length - 1; i > 0; i--) { var j = u.rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
};
u.gcd = function (a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; };
u.lcm = function (a, b) { return a / u.gcd(a, b) * b; };
u.n = function (x) {                                                    // число с запятой и настоящим минусом
  var s = String(Math.round(x * 1e9) / 1e9).replace(".", ",");
  return s.charAt(0) === "-" ? "−" + s.slice(1) : s;
};
u.p = function (x) { return x < 0 ? "(" + u.n(x) + ")" : u.n(x); };    // отрицательное в скобках
u.frac = function (n, d) { return '<span class="fr"><span>' + n + '</span><span>' + d + '</span></span>'; };
u.v = function (s) { return "<i>" + s + "</i>"; };                      // переменная курсивом
u.sup = function (s) { return "<sup>" + s + "</sup>"; };
u.mixed = function (n, d) {                                             // n/d несократимая, ответ в виде смешанного числа или дроби
  var neg = n < 0; if (neg) n = -n;
  var w = Math.floor(n / d), r = n % d, s;
  if (r === 0) s = String(w);
  else if (w === 0) s = u.frac(r, d);
  else s = w + u.frac(r, d);
  return (neg ? "−" : "") + s;
};
u.esc = function (s) { return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); };

/* ---------- разбор ответа ---------- */
function normMinus(s) { return String(s).replace(/[−–—]/g, "-"); }
function parseNum(raw) {
  var s = normMinus(raw).replace(/\s+/g, "").replace(",", ".").replace(/%$/, "");
  if (!/^-?\d+(\.\d+)?$/.test(s)) return null;
  return parseFloat(s);
}
function parseFrac(raw) {
  var s = normMinus(raw).trim().replace(/\s*\/\s*/g, "/").replace(/\s+/g, " "), m;
  if ((m = /^(-?)(\d+)$/.exec(s))) return { n: (m[1] ? -1 : 1) * +m[2], d: 1 };
  if ((m = /^(-?)(\d+)\/(\d+)$/.exec(s))) { if (+m[3] === 0) return null; return { n: (m[1] ? -1 : 1) * +m[2], d: +m[3] }; }
  if ((m = /^(-?)(\d+) (\d+)\/(\d+)$/.exec(s))) {
    var w = +m[2], p = +m[3], d = +m[4];
    if (d === 0 || p >= d || p === 0) return null;
    return { n: (m[1] ? -1 : 1) * (w * d + p), d: d };
  }
  return null;
}
function same(x, y) { return x !== null && Math.abs(x - y) < 1e-9; }
function check(kind, inst, raw) {
  if (kind === "num") return same(parseNum(raw), inst.a);
  if (kind === "frac") {
    var f = parseFrac(raw);
    if (!f || u.gcd(f.n, f.d) !== 1) return false;       // ответ должен быть несократимым
    return f.n * inst.a[1] === inst.a[0] * f.d;
  }
  return false;
}

/* ---------- запуск ---------- */
function start(cfg) {
  var KEY = cfg.key, mem = null, MODES = cfg.modes;
  function load() {
    if (mem) return mem;
    try { var r = localStorage.getItem(KEY); if (r) mem = JSON.parse(r); } catch (e) {}
    if (!mem || typeof mem !== "object") mem = {};
    if (!mem.items) mem.items = {}; if (!mem.best) mem.best = {};
    return mem;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) {} }

  function poolOf(m) { if (!m._pool) m._pool = m.pool(); return m._pool; }
  function itemRec(m, it) { return load().items[m.id + ":" + it.k]; }
  function boxOf(m, it) { var r = itemRec(m, it); return r ? r.b : null; }
  function learned(m) {
    var p = poolOf(m), c = 0;
    p.forEach(function (it) { var b = boxOf(m, it); if (b !== null && b >= 3) c++; });
    return { n: c, total: p.length };
  }
  function weight(m, it) {
    var b = boxOf(m, it);
    if (b === null) return 4;
    return [5, 3, 2, 1, .6][Math.min(b, 4)];
  }
  function pickWeighted(m, pool, exclude) {
    var tot = 0, i, w = [];
    for (i = 0; i < pool.length; i++) { w[i] = (exclude && exclude.indexOf(pool[i]) > -1) ? 0 : weight(m, pool[i]); tot += w[i]; }
    if (tot <= 0) return pool[u.rnd(pool.length)];
    var r = Math.random() * tot;
    for (i = 0; i < pool.length; i++) { r -= w[i]; if (r <= 0) return pool[i]; }
    return pool[pool.length - 1];
  }

  var app = document.getElementById("app"), backHome = document.getElementById("backHome"), backMenu = document.getElementById("backMenu");
  var timers = [], curMode = null, state = { screen: "menu" }, G = null;
  if (root.__TREN_TEST__) root.__TREN_G__ = function () { return G; };   // только для автотестов: читает текущий вопрос
  function clearTimers() { timers.forEach(function (t) { clearTimeout(t); clearInterval(t); }); timers = []; }
  function setBack(toMenu) { backHome.classList.toggle("hide", toMenu); backMenu.classList.toggle("hide", !toMenu); }
  backMenu.addEventListener("click", function () { if (curMode && state.screen !== "mode") showMode(curMode); else showMenu(); });

  function showMenu() {
    clearTimers(); state.screen = "menu"; curMode = null; setBack(false);
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
    var h = '<h1>' + cfg.title + '</h1><p class="lead">' + cfg.lead + '</p>';
    if (cfg.note) h += '<p class="lead2">' + cfg.note + '</p>';
    h += '<div class="modes">';
    MODES.forEach(function (m) {
      var l = learned(m), pct = l.total ? Math.round(l.n / l.total * 100) : 0, best = load().best[m.id];
      h += '<button class="mode" type="button" data-id="' + m.id + '"><span class="ex">' + m.ex + '</span><span class="nm">' + m.nm + '</span><span class="bar"><i style="width:' + pct + '%"></i></span><span class="st">выучено ' + l.n + ' из ' + l.total + (best ? ' · спринт: ' + best : '') + '</span></button>';
    });
    h += '</div>';
    app.innerHTML = h;
    [].forEach.call(app.querySelectorAll(".mode"), function (b) {
      b.addEventListener("click", function () { showMode(modeById(b.dataset.id)); });
    });
  }
  function modeById(id) { return MODES.filter(function (m) { return m.id === id; })[0]; }

  function showMode(m) {
    clearTimers(); curMode = m; state.screen = "mode"; setBack(true);
    if (location.hash !== "#" + m.id) history.replaceState(null, "", "#" + m.id);
    var h = '<div class="card"><h1>' + m.nm + '</h1><p class="lead" style="margin-bottom:6px">' + (m.desc ? m.desc + " " : "") + 'Раунд — 15 вопросов, ошибки повторяются в конце. Спринт — 60 секунд на рекорд.</p>';
    h += '<div class="row" style="margin-top:22px"><button class="btn apr" type="button" id="goRound">Раунд · 15</button><button class="btn" type="button" id="goSprint">Спринт · 60 с</button></div>';
    h += '<div class="sect">Карта: где пробелы</div><div class="tiles" id="tiles"></div><div class="legend">красное — ошибался, жёлтое — учится, зелёное — выучено, серое — ещё не встречалось</div>';
    h += '<button class="reset" type="button" id="resetMode">Сбросить прогресс по этой теме</button></div>';
    app.innerHTML = h;
    var el = document.getElementById("tiles"), t = "";
    poolOf(m).forEach(function (it) {
      var b = boxOf(m, it);
      t += '<span class="tile ' + (b === null ? "" : "b" + Math.min(b, 4)) + '">' + u.esc(it.lab) + '</span>';
    });
    el.innerHTML = t;
    document.getElementById("goRound").addEventListener("click", function () { startPlay(m, "round"); });
    document.getElementById("goSprint").addEventListener("click", function () { startPlay(m, "sprint"); });
    document.getElementById("resetMode").addEventListener("click", function () {
      if (!confirm("Сбросить прогресс по теме «" + m.nm + "»?")) return;
      var d = load(); Object.keys(d.items).forEach(function (k) { if (k.indexOf(m.id + ":") === 0) delete d.items[k]; });
      delete d.best[m.id]; save(); showMode(m);
    });
  }

  /* ---------- игра ---------- */
  function startPlay(m, kind) {
    clearTimers(); state.screen = "play"; setBack(true);
    var pool = poolOf(m), queue = [], i;
    if (kind === "round") {
      var chosen = [], last = null;
      if (m.repeat) {
        for (i = 0; i < 15; i++) { last = pickWeighted(m, pool, last ? [last] : null); chosen.push(last); }
      } else {
        var n = Math.min(15, pool.length);
        while (chosen.length < n) chosen.push(pickWeighted(m, pool, chosen));
      }
      queue = chosen.map(function (it) { return { it: it, retry: false }; });
    }
    G = { m: m, kind: kind, pool: pool, queue: queue, total: queue.length, cur: null, curIt: null, last: null, t0: 0,
          firstOk: 0, firstTotal: 0, missed: [], missedKeys: {}, answered: 0, over: false, isRep: false,
          wrongThis: false, endAt: 0, wrap: null };
    var kindIn = m.input || "num";
    var h = '<div class="card"><div class="qhead"><span id="qcount"></span><span id="qscore"></span></div>';
    h += kind === "round" ? '<div class="seg" id="seg"></div>' : '<div class="timer"><i id="tbar"></i></div>';
    h += '<div class="qbig" id="qbig"></div><div class="qsub" id="qsub"></div>';
    if (kindIn === "choice") {
      h += '<div class="opts" id="opts"></div>';
    } else {
      var im = kindIn === "frac" ? "text" : (m.neg ? "text" : (m.dec ? "decimal" : "numeric"));
      h += '<div class="irow">';
      if (m.neg) h += '<button class="minus" id="minus" type="button" aria-label="Минус">−</button>';
      if (kindIn === "frac") h += '<button class="minus" id="slash" type="button" aria-label="Дробная черта">/</button>';
      h += '<input class="field" id="inp" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" inputmode="' + im + '" aria-label="Ответ"><button class="btn" id="chk" type="button">Проверить</button></div>';
    }
    h += '<div class="fb none" id="fb" role="status" aria-live="polite"></div></div>';
    app.innerHTML = h;
    if (kindIn !== "choice") {
      var inp = document.getElementById("inp");
      inp.addEventListener("input", onInput);
      inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); submit(); } });
      document.getElementById("chk").addEventListener("click", submit);
      var mn = document.getElementById("minus"), sl = document.getElementById("slash");
      if (mn) mn.addEventListener("click", function () { inp.value += "−"; inp.focus(); onInput(); });
      if (sl) sl.addEventListener("click", function () { inp.value += "/"; inp.focus(); });
    }
    if (kind === "round") {
      var seg = document.getElementById("seg"), s = "";
      for (i = 0; i < G.total; i++) s += "<i></i>";
      seg.innerHTML = s;
    } else {
      G.endAt = Date.now() + 60000;
      var tick = setInterval(function () {
        var left = Math.max(0, G.endAt - Date.now());
        var bar = document.getElementById("tbar"); if (bar) bar.style.transform = "scaleX(" + (left / 60000) + ")";
        var qc = document.getElementById("qcount"); if (qc) qc.textContent = Math.ceil(left / 1000) + " с";
        if (left <= 0) { clearInterval(tick); finish(); }
      }, 250);
      timers.push(tick);
    }
    nextQ();
  }

  function nextQ() {
    if (!G || G.over) return;
    var w;
    if (G.kind === "round") {
      if (!G.queue.length) { finish(); return; }
      w = G.queue.shift();
    } else {
      w = { it: pickWeighted(G.m, G.pool, G.last ? [G.last] : null), retry: false };
    }
    var it = w.it, inst = it.gen ? it.gen() : it;
    G.wrap = w; G.curIt = it; G.cur = inst; G.last = it; G.wrongThis = false; G.t0 = Date.now(); G.isRep = w.retry;
    var big = document.getElementById("qbig");
    big.className = "qbig" + (inst.sm || G.m.sm ? " sm" : "");
    big.innerHTML = inst.q;
    document.getElementById("qsub").innerHTML = inst.sub || "";
    var fb = document.getElementById("fb"); fb.className = "fb none"; fb.innerHTML = "&nbsp;";
    if ((G.m.input || "num") === "choice") {
      var order = inst.fixed ? inst.opts.map(function (_, i) { return i; }) : u.shuffle(inst.opts.map(function (_, i) { return i; }));
      var box = document.getElementById("opts"), h = "";
      box.className = "opts" + (inst.opts.length === 2 || inst.opts.length === 3 ? " two" : "");
      order.forEach(function (oi, pos) {
        h += '<button class="opt" type="button" data-i="' + oi + '">' + inst.opts[oi] + '</button>';
      });
      box.innerHTML = h;
      [].forEach.call(box.querySelectorAll(".opt"), function (b) {
        b.addEventListener("click", function () { choose(b); });
      });
    } else {
      var inp = document.getElementById("inp");
      inp.value = ""; inp.className = "field"; inp.disabled = false; inp.focus();
    }
    updateHead();
  }
  function updateHead() {
    if (G.kind === "round") {
      var done = G.firstTotal;
      document.getElementById("qcount").textContent = "Вопрос " + Math.min(done + 1, G.total) + " из " + G.total;
      document.getElementById("qscore").innerHTML = "верно с первого раза: <b>" + G.firstOk + "</b>";
    } else {
      document.getElementById("qscore").innerHTML = "верно: <b>" + G.firstOk + "</b>";
    }
  }
  function isRight(raw) {
    var inst = G.cur;
    if (inst.ok) return inst.ok(raw);
    return check(G.m.input || "num", inst, raw);
  }
  function onInput() {
    if (!G || G.over) return;
    var inp = document.getElementById("inp");
    if (inp.value.trim() !== "" && isRight(inp.value)) accept();
  }
  function submit() {
    if (!G || G.over) return;
    var inp = document.getElementById("inp");
    if (inp.value.trim() === "") { inp.focus(); return; }
    if (isRight(inp.value)) { accept(); return; }
    reject();
  }
  function choose(btn) {
    if (!G || G.over || btn.disabled) return;
    var i = +btn.dataset.i;
    if (i === G.cur.c) { btn.classList.add("ok"); disableOpts(); accept(); }
    else { btn.classList.add("bad"); btn.disabled = true; reject(); }
  }
  function disableOpts() { [].forEach.call(document.querySelectorAll(".opt"), function (b) { b.disabled = true; }); }
  function record(it, ok, fast) {
    var d = load(), k = G.m.id + ":" + it.k, r = d.items[k] || { b: 0, ok: 0, bad: 0, t: 0 };
    if (ok) { r.ok++; r.b = fast ? Math.min(4, r.b + 1) : Math.max(r.b, 1); }
    else { r.bad++; r.b = 0; }
    r.t = Date.now(); d.items[k] = r; save();
  }
  function markSeg(cls) {
    var segs = document.getElementById("seg").children, i = G.firstTotal - 1;
    if (segs[i]) segs[i].className = cls;
  }
  function accept() {
    var first = !G.wrongThis, sec = (Date.now() - G.t0) / 1000;
    var inp = document.getElementById("inp");
    if (inp) { inp.className = "field ok"; inp.disabled = true; }
    if (first) {
      if (!G.isRep) { G.firstOk++; G.firstTotal++; if (G.kind === "round") markSeg("d"); }
      record(G.curIt, true, sec <= G.m.fast);
    }
    G.answered++;
    updateHead();
    var t = setTimeout(nextQ, (G.m.input === "choice" ? 450 : (first ? 180 : 250))); timers.push(t);
  }
  function reject() {
    var it = G.curIt, inst = G.cur, fb = document.getElementById("fb"), inp = document.getElementById("inp");
    var isChoice = (G.m.input || "num") === "choice";
    if (inp) { inp.className = "field bad"; void inp.offsetWidth; }
    if (!G.wrongThis) {
      G.wrongThis = true;
      if (!G.isRep) { G.firstTotal++; if (G.kind === "round") markSeg("m"); }
      record(it, false, false);
      if (!G.missedKeys[it.k]) { G.missedKeys[it.k] = 1; G.missed.push(inst); }
      if (G.kind === "round") G.queue.splice(Math.min(3, G.queue.length), 0, { it: it, retry: true });
      updateHead();
    }
    fb.className = "fb bad";
    fb.innerHTML = "<div>Правильно: " + inst.rev + (G.kind === "round" ? '<span class="hint">' + (isChoice ? "Теперь выбери верный вариант." : "Введи ответ ещё раз, чтобы запомнить.") + "</span>" : "") + "</div>";
    if (G.kind === "sprint") {
      if (inp) inp.disabled = true; else disableOpts();
      var t = setTimeout(nextQ, 1500); timers.push(t);
    } else if (inp) { inp.value = ""; inp.focus(); }
  }

  function finish() {
    if (!G || G.over) return;
    G.over = true; clearTimers();
    var m = G.m, acc = G.firstTotal ? Math.round(G.firstOk / G.firstTotal * 100) : 0;
    var img = "ham-sad.jpg", msg;
    if (acc >= 90) { img = "ham-win.jpg"; msg = "Чисто. Это уже в памяти."; }
    else if (acc >= 70) { img = "ham-joy.jpg"; msg = "Хорошо, но есть что дожать."; }
    else if (acc >= 50) { img = "ham-think.jpg"; msg = "Середина пути. Ошибки ниже — на них стоит потренироваться."; }
    else { msg = "Пока слабо. Повтори раунд — ошибки будут выпадать чаще."; }
    var h = '<div class="card res"><img src="img/' + img + '" alt="">';
    if (G.kind === "sprint") {
      var best = load().best[m.id] || 0, rec = G.firstOk > best;
      if (rec) { load().best[m.id] = G.firstOk; save(); }
      h += '<div class="big">' + G.firstOk + '</div><div class="sub">верных за 60 секунд' + (rec && G.firstOk > 0 ? " · новый рекорд" : best ? " · рекорд " + best : "") + '. Точность ' + acc + '%. ' + (G.firstTotal ? msg : "") + '</div>';
    } else {
      h += '<div class="big">' + G.firstOk + ' из ' + G.firstTotal + '</div><div class="sub">с первого раза. ' + msg + '</div>';
    }
    if (G.missed.length) {
      h += '<ul class="miss">';
      G.missed.forEach(function (inst) { h += '<li>' + inst.rev + '</li>'; });
      h += '</ul>';
    }
    h += '<div class="row"><button class="btn apr" type="button" id="again">Ещё раз</button><button class="btn alt" type="button" id="toMode">К теме</button></div></div>';
    app.innerHTML = h; state.screen = "result";
    var kind = G.kind;
    document.getElementById("again").addEventListener("click", function () { startPlay(m, kind); });
    document.getElementById("toMode").addEventListener("click", function () { showMode(m); });
  }

  document.addEventListener("keydown", function (e) {          // цифры 1-4 выбирают вариант
    if (!G || G.over || state.screen !== "play" || (G.m.input || "num") !== "choice") return;
    if (!/^[1-6]$/.test(e.key)) return;
    var btns = document.querySelectorAll(".opt"), b = btns[+e.key - 1];
    if (b) choose(b);
  });

  function routeHash() {
    var id = (location.hash || "").replace("#", ""), m = modeById(id);
    if (m) showMode(m); else showMenu();
  }
  window.addEventListener("hashchange", routeHash);
  routeHash();
}

var api = { start: start, u: u, check: check, parseNum: parseNum, parseFrac: parseFrac };
if (typeof module !== "undefined" && module.exports) module.exports = api; else root.TrenCore = api;
})(typeof window !== "undefined" ? window : this);
