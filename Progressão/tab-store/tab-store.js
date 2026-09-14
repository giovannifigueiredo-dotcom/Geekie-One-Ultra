// Sistema de temas com 18 opções + custom
const storeItems = [
  { id: 'theme-default', name: 'Padrão', xpReq: 0, icon: 'fa-square', color: '#94a3b8' },
  { id: 'theme-ubuntu-yaru', name: 'Ubuntu Yaru', xpReq: 50, icon: 'fa-circle-dot', color: '#E95420' },
  { id: 'theme-ubuntu-cosmic', name: 'Ubuntu Cosmic', xpReq: 3000, icon: 'fa-star', color: '#6D28D9' },
  { id: 'theme-bg-matrix', name: 'Matrix Rain', xpReq: 1800, icon: 'fa-terminal', color: '#00ff41', isBgTheme: true },
  // ... 14 mais
];

function equipTheme(themeId) {
  equippedTheme = themeId;
  localStorage.setItem('geekieEquipped', equippedTheme);
  applyTheme(themeId);
  renderStore();
}