/* Called from the existing cabinet render functions. Uses only server-confirmed history. */
function quizCabinetCard(data){
 if(!data||data.quiz!==1)return '';
 return ((typeof TEACH!=='undefined'&&TEACH||typeof S!=='undefined'&&S.mode==='par')&&((typeof clsOf==='function'&&clsOf()===9)||(data.quizHistory||[]).some(LiliOgeProgress.isMock))?LiliOgeProgress.html(data.quizHistory||[],typeof T_OGE==='undefined'?{}:T_OGE):'')+LiliQuizUI.historyHTML(data.quizHistory||[]);
}
