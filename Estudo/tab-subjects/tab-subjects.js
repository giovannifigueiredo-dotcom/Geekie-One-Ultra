// Cronômetro por matéria — um ativo por vez
let subjectData = JSON.parse(localStorage.getItem('geekieSubjects') || '[]');
let subjectIntervals = {};

function startSubject(id) {
  subjectData.forEach(s => { if (s.running && s.id !== id) stopSubject(s.id); });
  const s = subjectData.find(x => x.id === id);
  s.running = true;
  subjectIntervals[id] = setInterval(() => {
    s.currentSeconds++; s.totalSeconds++;
    if (s.currentSeconds % 60 === 0) saveSubjects();
  }, 1000);
}