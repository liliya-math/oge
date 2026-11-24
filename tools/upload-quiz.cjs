/* Пачечная загрузка TXT работ через API кабинета (повторяет кнопку «Загрузить пачку .txt»).
   Запуск: ADMIN_PASS=... node upload-quiz.cjs <папка1> [папка2 ...] [--only id1,id2] */
const fs = require('fs');
const path = require('path');
const Q = require('../assets/quiz-core.js');

const API = 'https://script.google.com/macros/s/AKfycbwg68-wqapNubGW4BuTEB_ri38yu41uV8hoQPOhluE84y4ZSRfZ9-sFl--uwv7T7AA_xA/exec';
const PASS = process.env.ADMIN_PASS;
if (!PASS) { console.error('Нужен ADMIN_PASS'); process.exit(1); }

async function admin(op, body) {
  const payload = Object.assign({ admin: PASS, op }, body || {});
  const r1 = await fetch(API, { method: 'POST', redirect: 'manual', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  let r = r1;
  if (r1.status >= 300 && r1.status < 400) {
    const loc = r1.headers.get('location');
    r = await fetch(loc);
  }
  const txt = await r.text();
  let j;
  try { j = JSON.parse(txt); } catch (e) { throw new Error('Не JSON: ' + txt.slice(0, 120)); }
  if (j && j.error) throw new Error(j.error);
  return j;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const args = process.argv.slice(2);
  const onlyIdx = args.indexOf('--only');
  let only = null;
  if (onlyIdx >= 0) { only = new Set(args[onlyIdx + 1].split(',').map(s => s.trim().toUpperCase())); args.splice(onlyIdx, 2); }
  const dirs = args;
  if (!dirs.length) { console.error('Укажи папки'); process.exit(1); }

  const lib = await admin('quizList');
  const have = {};
  (lib.works || []).forEach(w => { (have[w.title] = have[w.title] || []).push(w); });
  console.log('В библиотеке работ:', (lib.works || []).length);

  let saved = 0, attached = 0, failed = 0;
  for (const dir of dirs) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.txt')).sort();
    for (const f of files) {
      const p = path.join(dir, f);
      try {
        const src = fs.readFileSync(p, 'utf8');
        if (src.length > 80000) throw new Error('файл слишком большой');
        const w = Q.parse(src);
        const m = f.match(/(?:^|[-_])((?:(?:5|6|7A|7G|8A|8G|9A|9G)-\d{2,3}|OGE-\d{2}-\d{1,2}|ERR-\d{3}))(?=[-_.])/i);
        const sq = m ? m[1].toUpperCase() : '';
        if (only && (!sq || !only.has(sq))) continue;
        let qs = [];
        if (sq) { const g = await admin('routeGet', { id: sq }); qs = ((g.materials || {}).quizzes || []).slice(); }
        const cands = have[w.title] || [];
        const old = cands.find(c => qs.indexOf(c.id) >= 0) || cands.slice().sort((a, b) => b.version - a.version)[0];
        const r = await admin('quizSave', old ? { id: old.id, baseVersion: old.version, work: w } : { work: w });
        (have[w.title] = have[w.title] || []).push({ id: r.id, version: r.version, title: w.title });
        saved++;
        let a = '';
        if (sq) {
          const dup = new Set(cands.map(c => c.id)); dup.delete(r.id);
          const next = qs.filter(x => !dup.has(x));
          if (next.indexOf(r.id) < 0) next.push(r.id);
          if (next.length !== qs.length || next.some((x, i) => x !== qs[i])) {
            const rs = await admin('routeSave', { id: sq, quizzes: next });
            if (rs && rs.error) throw new Error('сохранена, но не прикреплена: ' + rs.error);
            attached++;
          }
          a = ' → ' + sq;
        }
        console.log('OK', f, '(v' + r.version + ')' + a);
        await sleep(400);
      } catch (e) {
        failed++;
        console.log('FAIL', f, '-', e.message);
      }
    }
  }
  console.log('Готово. Сохранено:', saved, 'прикреплено:', attached, 'ошибок:', failed);
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
