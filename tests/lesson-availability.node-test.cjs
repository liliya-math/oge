const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(require.resolve('../kabinet-apps-script.txt'), 'utf8');
const samara = (date, time) => Date.parse(date + 'T' + time + ':00+04:00');
const friday = '2026-11-06';
const saturday = '2026-11-07';
const hour = 3600000;
const workweek = [null, null, null, null, null, [540, 900], null];

function load(pupils = [], moves = {}) {
  const rows = pupils.map(({code, days, active}) => {
    const row = Array(12).fill('');
    row[0] = code;
    row[4] = days;
    row[11] = active;
    return row;
  });
  const sheet = {
    getLastRow: () => rows.length + 1,
    getRange: () => ({getValues: () => rows, getDisplayValues: () => pupils.map(p => [p.time || ''])})
  };
  const ctx = vm.createContext({
    PropertiesService: {getScriptProperties: () => ({
      getProperty: key => moves[key.slice(7)] && JSON.stringify({moves: moves[key.slice(7)]})
    })}
  });
  vm.runInContext(source, ctx);
  return {ctx, sheet: {getSheetByName: () => sheet}};
}

test('windows leave room for a full lesson and respect blocked dates and hours', () => {
  const {ctx} = load();
  const availability = {week: workweek, blocks: [[friday, 630, 660]]};
  const now = samara(friday, '08:00');
  const expected = samara(friday, '09:00');
  const busy = [samara(friday, '12:15')];
  const end = samara('2026-11-08', '00:00');
  const windows = ctx.lrWindows_(availability, busy, now, end, expected);
  const times = ['09:30', '11:00', '13:30', '14:00'].map(time => samara(friday, time));
  assert.deepEqual(Array.from(windows), times);
  assert(!ctx.lrFits_(samara(friday, '14:30'), availability));
  assert(!ctx.lrFits_(samara(saturday, '10:00'), availability));
  assert.equal(ctx.lrWindows_({...availability, blocks: [[friday, 0, 1440]]}, busy, now, end, expected).length, 0);
  assert.throws(() => ctx.lrValidateAvailability_({...availability, blocks: [['2026-02-30', 0, 1440]]}), /bad_value/);
});

test('busy times combine every active pupil and use moved lessons instead of their old times', () => {
  const from = samara(friday, '09:00');
  const ownMove = samara(friday, '10:00');
  const otherFrom = samara(friday, '11:00');
  const otherMove = samara(friday, '13:00');
  const {ctx, sheet} = load([
    {code:'own', days:'пт 09:00, пт 12:30', active:true},
    {code:'other', days:'пт, сб', time:'11:00', active:true},
    {code:'paused', days:'пт 14:00', active:false},
  ], {own:[{from,to:ownMove}],other:[{from:otherFrom,to:otherMove}]});
  const busy = ctx.lrBusy_(sheet, from - hour, samara(friday, '15:00'), 'own', from);
  assert.deepEqual(Array.from(busy), [samara(friday, '12:30'), otherMove]);
  assert.equal(ctx.lrBusy_(sheet, otherMove - hour, otherMove + hour, 'own', from).length, 2);
  assert.equal(ctx.lrBusy_(sheet, otherMove, otherMove + hour, 'own', from).length, 0);
});
