// 18 títulos por XP + pet titles + prestige
const titlesList = [
  { id: 'title-novato', name: '🌱 Novato', xpReq: 0 },
  { id: 'title-estudante', name: '📚 Estudante', xpReq: 100 },
  { id: 'title-dedicado', name: '💪 Dedicado', xpReq: 300, rewardTheme: 'theme-ubuntu-yaru' },
  // ... 15 mais
  { id: 'title-transcendent', name: '⚡ Transcendente', xpReq: 15000, prestige: true }
];

function equipTitle(titleId) {
  equippedTitle = titleId;
  localStorage.setItem('geekieTitle', titleId);
  updatePlayerTitle();
  renderTitles();
}