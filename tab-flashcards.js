// Flashcards com flip 3D e avaliação
let flashcardsData = JSON.parse(localStorage.getItem('geekieFlashcards'));
let currentCardIndex = 0, cardIsFlipped = false;

function flipCard() {
  document.getElementById('flashcard').classList.toggle('is-flipped');
  cardIsFlipped = !cardIsFlipped;
}

function rateCard(rating) {
  const cur = flashcardsView[currentCardIndex];
  const orig = flashcardsData.find(c => c.front === cur.front);
  if (orig) orig.rating = rating;
  saveFlashcards();
  if (currentCardIndex < flashcardsView.length - 1) { currentCardIndex++; updateCardDisplay(); }
}