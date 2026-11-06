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

function load(pupils = [], moves = {}, availability) {
  const rows = pupils.map(({code, days, active}) => {
    const row = Array(12).fill('');
    row[0] = code;
    row[4] = days;
    row[11] = active;
    return row;
  });
  const props = new Map(Object.entries(moves).map(([code,list]) => ['LESSON_' + code, JSON.stringify({minutes:null,moves:list})]));
  if (availability) props.set('LESSON_AVAILABILITY', JSON.stringify(availability));
  const sheet = {
    getLastRow: () => rows.length + 1,
    getRange: row => ({getValues: () => rows, getDisplayValues: () => pupils.map(p => [p.time || '']), setValue: value => {rows[row - 2][4] = value;}})
  };
  const ctx = vm.createContext({
    Date: class extends Date { static now() { return samara(friday, '08:00'); } },
    Utilities:{getUuid:()=> 'request-id', formatDate:()=> '00'},
    PropertiesService: {getScriptProperties: () => ({
      getProperty: key => props.get(key), setProperty:(key,value)=>props.set(key,value)
    })}
  });
  vm.runInContext(source, ctx);
  return {ctx, sheet: {getSheetByName: () => sheet}, rows};
}

test('windows leave room for a full lesson and respect blocked dates and hours', () => {
  const {ctx} = load();
  const availability = {week: workweek, blocks: [[friday, 630, 660]]};
  const now = samara(friday, '08:00');
  const expected = samara(friday, '09:00');
  const busy = [samara(friday, '12:15')];
  const end = samara('2026-11-08', '00:00');
  const windows = ctx.lrWindows_(availability, busy, now, end, expected);
  const times = ['11:00', '14:00'].map(time => samara(friday, time));
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

test('transfer windows start on the hour even when working hours start at half past', () => {
  const {ctx} = load();
  const availability = {week: workweek.map((hours, day) => day === 5 ? [570, 720] : hours), blocks: []};
  const windows = ctx.lrWindows_(availability, [], samara(friday, '08:00'), samara(saturday, '00:00'));
  assert.deepEqual(Array.from(windows), ['10:00', '11:00'].map(time => samara(friday, time)));
});

test('a transfer cannot extend or join a run past three lessons without an hour break', () => {
  const {ctx} = load();
  const at = time => samara(friday, time);
  const busy = ['09:00', '10:00', '11:00'].map(at);
  assert.equal(ctx.lrMoveError_(at('08:00'), busy), 'lesson_break');
  assert.equal(ctx.lrMoveError_(at('12:00'), busy), 'lesson_break');
  assert.equal(ctx.lrMoveError_(at('12:30'), busy), 'lesson_break');
  assert.equal(ctx.lrMoveError_(at('13:00'), busy), '');
  assert.equal(ctx.lrMoveError_(at('11:30'), busy), 'lesson_conflict');
  assert.equal(ctx.lrMoveError_(at('11:00'), ['09:00', '10:00', '12:30'].map(at)), 'lesson_break');
  assert.equal(ctx.lrMoveError_(at('11:00'), ['09:00', '10:00', '13:00'].map(at)), '');
  const availability = {week: workweek, blocks: []};
  const windows = ctx.lrWindows_(availability, busy, at('08:00'), samara(saturday, '00:00'));
  assert.deepEqual(Array.from(windows), ['13:00', '14:00'].map(at));
});

test('daily limit allows the seventh hour and excludes the eighth, including lessons earlier today', () => {
  const {ctx} = load();
  const at = time => samara(friday, time);
  const six = ['08:00', '09:00', '10:00', '12:00', '13:00', '14:00'].map(at);
  assert.equal(ctx.lrMoveError_(at('20:00'), six), '');
  const seven = six.concat(at('16:00'));
  assert.equal(ctx.lrMoveError_(at('20:00'), seven), 'lesson_day_limit');
  const availability = {week: workweek.map((hours, day) => day === 5 ? [480, 1320] : hours), blocks: []};
  assert.deepEqual(Array.from(ctx.lrWindows_(availability, seven, at('19:00'), samara(saturday, '00:00'))), []);
  assert.equal(ctx.lrMoveError_(samara(saturday, '20:00'), seven), '');
});

test('a late lesson counts only for the part that falls on the target Samara date', () => {
  const {ctx} = load();
  const at = time => samara(friday, time);
  const busy = ['08:00', '09:00', '10:00', '12:00', '13:00', '14:00'].map(at);
  const previous = samara('2026-11-05', '23:30');
  assert.equal(ctx.lrMoveError_(at('18:00'), [previous, ...busy]), 'lesson_day_limit');
  assert.equal(ctx.lrMoveError_(at('18:00'), [previous - hour, ...busy]), '');
});


test('extra dates extend working hours or open a day off, with closed hours taking precedence', () => {
  const {ctx} = load();
  const availability = {week: workweek, blocks: [[friday, 1140, 1200]], extra: [[friday, 1080, 1260], [saturday, 1080, 1260]]};
  const windows = Array.from(ctx.lrWindows_(availability, [], samara(friday, '17:00'), samara('2026-11-08','00:00')));
  assert(windows.includes(samara(friday, '20:00')));
  assert(!windows.includes(samara(friday, '19:00')));
  assert(!windows.includes(samara(saturday, '17:00')));
  assert(windows.includes(samara(saturday, '18:00')));
  assert(!windows.includes(samara(saturday, '21:00')));
});

test('pupil requests leave the timetable alone until teacher approval and recheck availability', () => {
  const availability = {week: workweek, blocks: [], extra: [[saturday, 1080, 1260]]};
  const {ctx,sheet,rows} = load([{code:'pupil',days:'пт 10:00',active:true},{code:'other',days:'',active:true}],{},availability);
  const st = {row:rows[0],index:2,time:''};
  const now = samara(friday,'08:00'), to = samara(saturday,'18:00');
  const options = ctx.lrPupilOptions_(sheet,'pupil',st,'once',now);
  assert(options.options.includes(to));
  assert(!ctx.lrPupilOptions_(sheet,'pupil',st,'weekly',now).options.includes(to));
  const result = ctx.lrRequest_(sheet,'pupil',st,{kind:'once',from:options.from,expected:options.expected,to},now);
  assert.equal(result.request.status,'pending');
  assert.equal(ctx.lrConfig_('pupil').moves.length,0);
  rows[1][4] = 'сб 18:00';
  const approval = {id:result.request.id,approve:true};
  assert.equal(ctx.lrDecideRequest_(sheet,'pupil',st,approval,now).error,'lesson_request_stale');
  rows[1][4] = '';
  assert(ctx.lrDecideRequest_(sheet,'pupil',st,approval,now).ok);
  assert.equal(ctx.lrConfig_('pupil').moves[0].to,to);
  assert.equal(ctx.lrConfig_('pupil').request.status,'approved');
  assert(ctx.lrDecideRequest_(sheet,'pupil',st,approval,now).ok);
  assert.equal(ctx.lrConfig_('pupil').moves.length,1);
});

test('weekly approval replaces only the requested slot and keeps the pupil timezone', () => {
  const week = workweek.map((hours, day) => day === 6 ? [540, 900] : hours);
  const {ctx,sheet,rows} = load([{code:'pupil',days:'[Москва] пт 10:00, сб 11:00 | Europe/Moscow',active:true}],{}, {week,blocks:[]});
  const st = {row:rows[0],index:2,time:''}, now = samara(friday,'08:00');
  const to = samara(friday,'12:00');
  const {from,expected,options} = ctx.lrPupilOptions_(sheet,'pupil',st,'weekly',now);
  assert(options.includes(to));
  const request = ctx.lrRequest_(sheet,'pupil',st,{kind:'weekly',from,expected,to},now).request;
  assert(ctx.lrDecideRequest_(sheet,'pupil',st,{id:request.id,approve:true},now).ok);
  assert.equal(rows[0][4],'[Москва] пт 12:00, сб 11:00 | Europe/Moscow');
  assert.equal(ctx.lrPublicRequest_(ctx.lrConfig_('pupil').request).appliedDays,undefined);
});
