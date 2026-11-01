/* Shared deterministic text importer and answer rules. No AI calls, HTML or eval. */
var LiliQuiz = (function () {
  'use strict';
  const types = {'число':'number','набор':'set','несколько числовых ответов':'set','выбор':'choice','текст':'text',number:'number',set:'set',choice:'choice',text:'text'};
  const kinds={'дз':'hw','домашняя':'hw','домашняя работа':'hw','сам':'self','самостоятельная':'self','контр':'exam','контрольная':'exam','проверочная':'exam','тест':'free',hw:'hw',self:'self',exam:'exam',free:'free'};
  const kindName={hw:'дз',self:'сам',exam:'контр'};
  const limited=k=>k==='self'||k==='exam';
  const tries=k=>limited(k)?1:k==='hw'?2:Infinity;
  function fail(s) { throw new Error(s); }
  function nodeList(v,where){
    const a=(Array.isArray(v)?v:String(v||'').split(/[\s,;]+/)).map(s=>String(s).trim()).filter(Boolean);
    if(a.length>10)fail(where+'узел: не больше 10 значений.');
    a.forEach(s=>{if(!/^(?:[A-Z]\d{2}|\d[A-Z]\.\d+(?:\.\d+){1,2})$/.test(s))fail(where+'узел «'+s+'»: нужен номер навыка вида A05, G12 или 8G.1.4.');});
    return [...new Set(a)];
  }
  function number(v) {
    const s=String(v).trim().replace(/[−–]/g,'-').replace(/,/g,'.');
    const part='[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)';
    if(new RegExp('^'+part+'$').test(s))return Number.isFinite(Number(s))?Number(s):null;
    if(new RegExp('^'+part+'\\s*/\\s*'+part+'$').test(s)){const a=s.split('/').map(Number);return a[1]!==0&&Number.isFinite(a[0]/a[1])?a[0]/a[1]:null;}
    return null;
  }
  const text=v=>String(v).normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase();
  const equal=(a,b)=>a!==null&&b!==null&&(Number.isInteger(a)&&Number.isInteger(b)?a===b:Math.abs(a-b)<=1e-9);
  function same(g,q) {
    if(typeof g!=='string'||!g.trim()||g.length>500)return false;
    if(q.type==='set'){
      const a=g.split(';').map(number), b=q.answer.split(';').map(number);
      if(a.some(x=>x===null)||a.length!==b.length)return false;
      a.sort((x,y)=>x-y);b.sort((x,y)=>x-y);
      return a.every((v,i)=>equal(v,b[i]));
    }
    return q.answer.split('|').some(k=>q.type==='number'?equal(number(g),number(k)):text(g)===text(k));
  }
  function validate(d) {
    if(!d||typeof d!=='object')fail('Нет данных работы.');
    const string=(v,n,max)=>{if(typeof v!=='string'||!v.trim()||v.length>max)fail('Проверь поле «'+n+'».');return v.trim();};
    const kind=d.kind===undefined||d.kind===''?'free':(Object.prototype.hasOwnProperty.call(kinds,String(d.kind).trim().toLowerCase())?kinds[String(d.kind).trim().toLowerCase()]:null);
    if(!kind)fail('Неизвестный тип работы. Допустимо: дз, сам, контр.');
    const out={title:string(d.title,'Название',160),section:string(d.section,'Раздел',160),kind,nodes:nodeList(d.nodes,''),tasks:[]};
    if(!Array.isArray(d.tasks)||!d.tasks.length||d.tasks.length>100)fail('Нужно от 1 до 100 заданий.');
    out.tasks=d.tasks.map((q,i)=>{
      if(!q||typeof q!=='object')fail('Некорректное задание '+(i+1));
      const rawType=q.type||'число';
      const prefix='Задание '+(i+1)+': ',type=Object.prototype.hasOwnProperty.call(types,rawType)?types[rawType]:null;
      if(!type)fail(prefix+'неизвестный тип ответа.');
      const item={n:String(i+1),q:string(q.q,prefix+'условие',4000),answer:string(q.answer,prefix+'ответ',500),type,points:Number(q.points===undefined?1:q.points),hint:String(q.hint||'').trim(),figure:String(q.figure||'').trim(),nodes:nodeList(q.nodes,prefix),options:[]};
      if(!Number.isInteger(item.points)||item.points<1||item.points>10)fail(prefix+'баллы должны быть целым числом от 1 до 10.');
      if(item.hint.length>1500)fail(prefix+'подсказка длиннее 1500 символов.');
      if(item.figure&&!/^[a-z0-9][a-z0-9_-]{0,60}\.(svg|png|jpg)$/.test(item.figure))fail(prefix+'рисунок: имя файла вида fig-name.svg, .png или .jpg (латиница, цифры, - и _).');
      if(type==='number'&&item.answer.split('|').some(a=>number(a)===null))fail(prefix+'ответ должен быть числом или дробью a/b.');
      if(type==='set'){
        const a=item.answer.split(';').map(number);
        if(a.some(x=>x===null)||new Set(a).size!==a.length)fail(prefix+'укажи разные числовые ответы через ;');
      }
      if(type==='choice'){
        if(!Array.isArray(q.options)||q.options.length<2||q.options.length>8)fail(prefix+'нужно 2–8 вариантов.');
        item.options=q.options.map(v=>string(v,prefix+'вариант',500));
        if(new Set(item.options.map(text)).size!==item.options.length)fail(prefix+'варианты повторяются.');
        if(!item.options.some(v=>text(v)===text(item.answer)))fail(prefix+'ответ должен совпадать с одним вариантом.');
      }
      return item;
    });
    if(JSON.stringify(out).length>40000)fail('Работа слишком большая. Раздели её на несколько тестов.');
    return out;
  }
  function parse(src) {
    if(typeof src!=='string'||src.length>80000)fail('Файл слишком большой (максимум 80 000 символов).');
    const d={title:'',section:'',tasks:[]};let q=null,last='';
    const keys={'название':'title','раздел':'section','задание':'q','ответ':'answer','тип':'type','баллы':'points','подсказка':'hint','варианты':'options','тип работы':'kind','рисунок':'figure','узел':'nodes'};
    src.replace(/^\uFEFF/,'').replace(/\r/g,'').split('\n').forEach((line,i)=>{
      if(!line.trim())return;
      const m=/^\s*([^:]+):\s*(.*)$/.exec(line), key=m&&Object.prototype.hasOwnProperty.call(keys,m[1].trim().toLowerCase())&&keys[m[1].trim().toLowerCase()];
      if(key){
        if(key==='q'){q={q:m[2]};d.tasks.push(q);last='q';return;}
        const target=key==='title'||key==='section'||key==='kind'||(key==='nodes'&&!q)?d:q;
        if(!target)fail('Строка '+(i+1)+': сначала напиши «Задание:».');
        if(Object.prototype.hasOwnProperty.call(target,key)&&target[key]!=='')fail('Строка '+(i+1)+': поле повторяется.');
        target[key]=key==='options'?m[2].split('|').map(v=>v.trim()):m[2];last=key;
      }else if(q&&(last==='q'||last==='hint'))q[last]+='\n'+line;
      else fail('Строка '+(i+1)+': неизвестное поле.');
    });
    return validate(d);
  }
  function stringify(d){return 'Название: '+d.title+'\nРаздел: '+d.section+'\n'+(kindName[d.kind]?'Тип работы: '+kindName[d.kind]+'\n':'')+(d.nodes&&d.nodes.length?'Узел: '+d.nodes.join(', ')+'\n':'')+'\n'+d.tasks.map(q=>'Задание: '+q.q+(q.figure?'\nРисунок: '+q.figure:'')+(q.nodes&&q.nodes.length?'\nУзел: '+q.nodes.join(', '):'')+'\nТип: '+({number:'число',set:'набор',choice:'выбор',text:'текст'}[q.type])+'\n'+(q.options.length?'Варианты: '+q.options.join(' | ')+'\n':'')+'Ответ: '+q.answer+'\nБаллы: '+q.points+(q.hint?'\nПодсказка: '+q.hint:'')).join('\n\n');}
  function publicWork(d){const kind=d.kind||'free';return {title:d.title,section:d.section,kind,tasks:d.tasks.map(q=>({n:q.n,q:q.q,type:q.type,points:q.points,hint:limited(kind)?'':q.hint,figure:q.figure||'',options:q.options}))};}
  function grade(d,answers){let score=0;const tasks=d.tasks.map(q=>{const ok=same(answers[q.n],q);if(ok)score+=q.points;return {n:q.n,ok,points:ok?q.points:0};});return {score,max:d.tasks.reduce((n,q)=>n+q.points,0),tasks};}
  const sample='Название: Квадратные корни · первая проверка\nРаздел: Алгебра / 8 класс / Квадратные корни\n\nЗадание: Вычисли \\(\\sqrt{81}\\).\nОтвет: 9\nБаллы: 1\n\nЗадание: Вычисли \\(\\frac{3}{4}+\\frac{1}{4}\\).\nОтвет: 1\nБаллы: 1\n\nЗадание: Реши уравнение \\(x^2=25\\). Запиши корни через ;\nТип: набор\nОтвет: -5; 5\nБаллы: 2\nПодсказка: Какие числа при возведении в квадрат дают 25?\n\nЗадание: Выбери верное равенство.\nТип: выбор\nВарианты: √36 = 6 | √36 = -6 | √36 = 18\nОтвет: √36 = 6\nБаллы: 1';
  return {parse,validate,stringify,publicWork,grade,same,number,limited,tries,sample};
})();
if(typeof module!=='undefined')module.exports=LiliQuiz;
