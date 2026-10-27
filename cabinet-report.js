/* Мост «страница ДЗ -> кабинет ученика».
   Подключается одной строкой <script src="cabinet-report.js"></script> в <head> страницы.
   Работает только если страницу открыли из кабинета (в адресе есть lili_student и lili_hw).
   Страница, как и раньше, шлёт результат в таблицу «Результаты»; этот скрипт перехватывает
   тот же запрос и дублирует краткий итог в кабинет: статус домашки и заметка ученика.
   Сервер кабинета не меняется: используется готовый workflow 7.6 (статусы solving / help / submitted). */
(() => {
  'use strict';
  const P = new URLSearchParams(location.search);
  const CODE = (P.get('lili_student') || '').trim(), HW = (P.get('lili_hw') || '').trim();
  if (!CODE || !HW || CODE === 'demo' || CODE.length > 100 || !/^\d+$/.test(HW)) return;
  const API = 'https://script.google.com/macros/s/AKfycbwg68-wqapNubGW4BuTEB_ri38yu41uV8hoQPOhluE84y4ZSRfZ9-sFl--uwv7T7AA_xA/exec';
  const RES = 'AKfycbyJKYatO3xdOpYJ1WZzszbxqMnOWZ30lsfr5HH7Y23svvX6iqjNNbIUR-RCUeZ8pB15';
  const orig = window.fetch.bind(window);
  let hw = null, ready = false, busy = false, queued = null, lastKey = '', lastAt = 0, closed = false;

  function load() {
    return orig(API + '?t=' + encodeURIComponent(CODE), { cache: 'no-store' })
      .then(r => r.json())
      .then(j => { const h = (j.hw || []).find(x => String(x.id) === HW); if (h) { hw = h; closed = ['submitted', 'checked'].includes(h.status); } ready = true; })
      .catch(() => { ready = true; });
  }
  const loading = load();

  function lineOf(rep, re) { return (String(rep || '').split('\n').find(l => re.test(l)) || '').trim(); }
  function build(d) {
    const done = d.status === 'завершено';
    const stuck = /!/.test(d.tasks || '') || /нужна помощь/.test(d.report || '');
    const status = done ? 'submitted' : stuck ? 'help' : 'solving';
    let note = (d.test ? d.test + '. ' : '') + 'Выполнено ' + (d.progress || '') + (d.max ? ', верно ' + d.score + ' из ' + d.max : '') + (d.grade ? ' (' + d.grade + ')' : '') + '.';
    const weak = lineOf(d.report, /^Что подтянуть:/);
    if (weak && !/всё решено/.test(weak)) note += '\n' + weak;
    if (stuck && !weak) note += '\nНужна помощь на одной из ступеней. Лиля увидит это и разберёт на занятии.';
    return { status, note: note.slice(0, 1500) };
  }

  async function send(p, keepalive) {
    if (busy) { queued = p; return; }
    busy = true;
    try {
      for (let attempt = 0; attempt < 2; attempt++) {
        const r = await orig(API, { method: 'POST', keepalive: !!keepalive && JSON.stringify(p).length < 60000, headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ t: CODE, id: Number(HW), text: hw.t, revision: hw.revision, workflow: true, status: p.status, note: p.note }) }).then(x => x.json());
        if (r && r.ok && r.hw) { hw.revision = r.hw.revision; hw.status = r.hw.status; closed = ['submitted', 'checked'].includes(r.hw.status); break; }
        if (r && r.error === 'changed' && attempt === 0) { await load(); if (!hw || closed) break; continue; }
        break;
      }
    } catch (e) { /* кабинет недоступен: результат в таблице уже ушёл */ }
    busy = false;
    if (queued) { const q = queued; queued = null; send(q, false); }
  }

  function relay(d, keepalive) {
    if (!d || typeof d !== 'object' || !d.sid) return;
    const run = () => {
      if (!hw || closed) return;
      const p = build(d), key = p.status + '|' + p.note, now = Date.now();
      if (key === lastKey) return;
      if (p.status === 'solving' && now - lastAt < 45000) return; // не чаще раза в 45 секунд
      lastKey = key; lastAt = now; send(p, keepalive);
    };
    if (ready) run(); else loading.then(run);
  }

  window.fetch = function (u, o) {
    try { if (String(u).indexOf(RES) >= 0 && o && typeof o.body === 'string') relay(JSON.parse(o.body), !!o.keepalive); } catch (e) { /* не мешаем странице */ }
    return orig.apply(this, arguments);
  };
})();
