(function (root) {
  'use strict';
  const STORAGE_KEY = 'lili-cabinet-teacher-boards-v1';
  const BOARD = 'https://liliya-math.github.io/excalidraw/';
  function safeURL(value) {
    if (!value) return '';
    try {
      const url = new URL(value);
      return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : '';
    } catch (_) { return ''; }
  }
  function parse(value) {
    try {
      const url = new URL(value);
      if (url.username || url.password || url.origin !== 'https://liliya-math.github.io' || url.pathname !== '/excalidraw/') return null;
      const m = /^#room=([\w-]+),([\w-]{22})(?:;(teacher|student)=([\w-]{32,128}))?$/.exec(url.hash);
      return m ? {url, id:m[1], key:m[2], role:m[3], token:m[4]} : null;
    } catch (_) { return null; }
  }
  function sameRoom(first, second) {
    const a = parse(first), b = parse(second);
    return !!a && !!b && a.id === b.id && a.key === b.key;
  }
  function studentURL(value) {
    const url = safeURL(value), board = parse(url);
    return board?.role === 'teacher' ? '' : url;
  }
  function clean(value) {
    const board = parse(value);
    if (!board) return safeURL(value);
    for (const key of ['video', 'material', 'materialTitle', 'student', 'cabinet', 'cabinetRole', 'studentName', 'lessonId', 'lessonDate', 'lessonTitle', 'startLesson']) board.url.searchParams.delete(key);
    return board.url.href;
  }
  function videoURL(value) {
    const board = parse(value);
    if (!board) return safeURL(value);
    board.url.searchParams.set('video','1');
    return board.url.href;
  }
  function records(storage) {
    try {
      const data = JSON.parse(storage.getItem(STORAGE_KEY) || '{}');
      return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
    } catch (_) { return {}; }
  }
  function teacherURL(storage, code, pupil) {
    const value = records(storage)[code]?.teacher || '';
    return parse(value)?.role === 'teacher' && sameRoom(value,pupil) ? value : '';
  }
  function savedTeacherURL(storage, code) {
    const record = records(storage)[code];
    return record ? teacherURL(storage, code, record.student || '') : '';
  }
  function checkPair(pupil, teacher) {
    if (pupil.trim() && !safeURL(pupil.trim())) throw new Error('Нужна полная ссылка на доску, начиная с https://.');
    if (teacher.trim() && !safeURL(teacher.trim())) throw new Error('Нужна полная ссылка учителя, начиная с https://.');
    pupil = clean(pupil.trim()); teacher = clean(teacher.trim());
    if (pupil && !studentURL(pupil)) throw new Error('В поле ученика нужна ссылка ученика, без ключа учителя.');
    if (teacher) {
      if (parse(teacher)?.role !== 'teacher') throw new Error('Вставь ссылку из кнопки «Скопировать ссылку учителя» на доске.');
      if (!sameRoom(pupil, teacher)) throw new Error('Ссылки ведут в разные комнаты. Скопируй обе ссылки с одной доски.');
    }
    return {student:pupil, teacher};
  }
  function saveTeacher(storage, code, pupil, teacher) {
    const pair = checkPair(pupil, teacher), data = records(storage);
    if (pair.teacher) data[code] = {teacher:pair.teacher,student:pair.student}; else delete data[code];
    storage.setItem(STORAGE_KEY,JSON.stringify(data));
    return pair;
  }
  function moveTeacher(storage, from, to) {
    const data = records(storage);
    if (data[from]) { data[to] = data[from]; delete data[from]; storage.setItem(STORAGE_KEY,JSON.stringify(data)); }
  }
  async function pupilFromTeacher(value, crypto) {
    const board = parse(clean(value));
    if (board?.role !== 'teacher') throw new Error('Сначала вставь ссылку учителя.');
    const digest = await crypto.subtle.digest('SHA-256',new TextEncoder().encode('student:'+board.token));
    const token = Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
    board.url.hash = 'room='+board.id+','+board.key+';student='+token;
    return board.url.href;
  }
  async function createPair(crypto) {
    const bytes = n => crypto.getRandomValues(new Uint8Array(n));
    const hex = values => Array.from(values,v=>v.toString(16).padStart(2,'0')).join('');
    const key = btoa(String.fromCharCode(...bytes(16))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
    const teacher = BOARD+'?pin=1#room='+hex(bytes(10))+','+key+';teacher='+hex(bytes(32));
    return {teacher,student:await pupilFromTeacher(teacher,crypto)};
  }
  const api = {parse,sameRoom,studentURL,videoURL,teacherURL,savedTeacherURL,checkPair,saveTeacher,moveTeacher,pupilFromTeacher,createPair};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LiliBoardLinks = api;
})(typeof window === 'undefined' ? globalThis : window);
