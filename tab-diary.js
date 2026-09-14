// Diário com humor + estatísticas
var diaryEntries = JSON.parse(localStorage.getItem('geekie_diary') || '[]');
var diaryMood = 3;

function saveDiaryEntry() {
  var text = document.getElementById('diaryText').value.trim();
  if (!text) return;
  diaryEntries.unshift({ id: Date.now(), date: new Date().toISOString(), text, mood: diaryMood });
  localStorage.setItem('geekie_diary', JSON.stringify(diaryEntries));
  if (typeof addXP === 'function') addXP(5);
  renderDiaryEntries();
}