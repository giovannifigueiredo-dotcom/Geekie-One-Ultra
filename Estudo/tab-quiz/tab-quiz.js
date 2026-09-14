// Quiz com 6 categorias
const quizQuestions = {
  math: [
    { q: 'Quanto é 15% de 200?', opts: ['30','25','35','40'], correct: 0 },
    // ... 11 mais
  ],
  science: [/* 12 questões */],
  history: [/* 12 questões */],
  geo: [/* 12 questões */],
  portuguese: [/* 12 questões */],
  trivia: [/* 12 questões */]
};

function answerQuiz(idx) {
  if (quizState.answered) return;
  quizState.answered = true;
  const q = quizState.questions[quizState.currentIdx];
  if (idx === q.correct) quizState.score++;
  // highlight correct/wrong
}