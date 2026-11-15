const test=require('node:test'),assert=require('node:assert'),fs=require('fs'),os=require('os'),path=require('path'),cp=require('child_process');
const run=dir=>cp.spawnSync('node',[path.join(__dirname,'../tools/teoriya/check.cjs'),dir],{encoding:'utf8'});
test('check.cjs ловит длинное тире, повтор вариантов и баллы теста',()=>{
  const d=fs.mkdtempSync(path.join(os.tmpdir(),'chk-'));
  fs.writeFileSync(path.join(d,'test-8G-111-x-teoriya.txt'),'Название: Плохой\nРаздел: Геометрия / 8 класс / Тест\nТип работы: сам\nВремя: 10\n\nЗадание: Верно – ли?\nТип: выбор\nВарианты: да | да | нет\nОтвет: да\nБаллы: 1\n');
  const r=run(d);assert.strictEqual(r.status,1);assert.match(r.stdout,/длинное тире/);assert.match(r.stdout,/варианты повторяются/);
});
test('check.cjs пропускает правильный тест по теории',()=>{
  const d=fs.mkdtempSync(path.join(os.tmpdir(),'chk-'));
  fs.writeFileSync(path.join(d,'test-8G-111-x-teoriya.txt'),'Название: Хороший\nРаздел: Геометрия / 8 класс / Тест\nТип работы: сам\nВремя: 10\n\nЗадание: Сколько сторон у треугольника?\nТип: выбор\nВарианты: две | три | четыре\nОтвет: три\nБаллы: 1\n');
  const r=run(d);assert.strictEqual(r.status,0,r.stdout);
});
