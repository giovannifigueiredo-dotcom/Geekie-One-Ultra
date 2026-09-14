// Notas com auto-save e contador ao vivo
let savedNotes = JSON.parse(localStorage.getItem('geekieNotes')) || [];
let currentNoteId = null;

function saveNote() {
  const title = noteTitleInput.value.trim() || 'Nota sem título';
  const content = noteContentInput.value;
  if (currentNoteId === null) {
    const nn = { id: Date.now().toString(), title, content, date: new Date().toLocaleDateString() };
    savedNotes.push(nn);
    currentNoteId = nn.id;
  } else {
    const idx = savedNotes.findIndex(n => n.id === currentNoteId);
    if (idx !== -1) { savedNotes[idx].title = title; savedNotes[idx].content = content; }
  }
  localStorage.setItem('geekieNotes', JSON.stringify(savedNotes));
}