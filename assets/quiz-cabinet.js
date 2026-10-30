/* Called from the existing cabinet render functions. Uses only server-confirmed history. */
function quizCabinetCard(data){
 if(!data||data.quiz!==1)return '';
 return LiliQuizUI.historyHTML(data.quizHistory||[]);
}
