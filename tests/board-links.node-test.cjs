const {test} = require('node:test');
const assert = require('node:assert/strict');
const {webcrypto} = require('node:crypto');
const links = require('../assets/lili-board-links.js');
function storage(){const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};}
test('one generated pair opens one room and exposes no teacher key to the pupil',async()=>{
 const a=await links.createPair(webcrypto), b=await links.createPair(webcrypto);
 assert(links.sameRoom(a.student,a.teacher));assert(!links.sameRoom(a.student,b.teacher));
 assert.equal(links.parse(a.teacher).role,'teacher');assert.equal(links.parse(a.student).role,'student');
 assert(!a.student.includes(links.parse(a.teacher).token));
 assert.equal(links.studentURL(a.teacher),'');
 assert.throws(()=>links.checkPair(a.teacher,a.teacher));
 assert.throws(()=>links.checkPair(a.student,b.teacher));
});
test('private teacher links remain separated by pupil and stale rooms cannot be opened',async()=>{
 const s=storage(), a=await links.createPair(webcrypto), b=await links.createPair(webcrypto);
 links.saveTeacher(s,'alice',a.student,a.teacher);links.saveTeacher(s,'bob',b.student,b.teacher);
 assert.equal(links.teacherURL(s,'alice',a.student),a.teacher);
 assert.equal(links.teacherURL(s,'bob',b.student),b.teacher);
 assert.equal(links.teacherURL(s,'alice',b.student),'');
 links.moveTeacher(s,'alice','alice2');
 assert.equal(links.teacherURL(s,'alice',a.student),'');assert.equal(links.teacherURL(s,'alice2',a.student),a.teacher);
 links.saveTeacher(s,'bob',b.student,'');assert.equal(links.teacherURL(s,'bob',b.student),'');
});
test('video buttons keep the exact room and role; unsafe URLs are rejected',async()=>{
 const a=await links.createPair(webcrypto), url=links.videoURL(a.teacher);
 assert(links.sameRoom(url,a.student));assert.equal(links.parse(url).token,links.parse(a.teacher).token);
 assert.equal(new URL(url).searchParams.get('video'),'1');
 assert.equal(links.studentURL('javascript:alert(1)'),'');
 assert.equal(links.studentURL('https://user:secret@example.org'),'');
 assert.equal(links.studentURL('https://learnboard.ru/'),'https://learnboard.ru/');
});
