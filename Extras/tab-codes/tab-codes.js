// 15 códigos + código secreto admin
const codesData = [
  { code: 'ESTUDA2026', reward: '+50 XP', action: () => gainXP(50) },
  { code: 'GEEKIE100', reward: '+100 Moedas', action: () => earnCoins(100) },
  { code: 'NEONTHEME', reward: 'Tema Neon', action: () => unlockTheme('theme-ubuntu-neon') },
  // ... 12 mais
];
const secretCode = { code: 'ADM2026', action: () => { adminUnlocked = true; } };

function redeemCode() {
  const val = input.value.trim().toUpperCase();
  const found = codesData.find(c => c.code === val);
  if (found) { found.action(); redeemedCodes.push(val); }
  else if (val === 'ADM2026') { adminUnlocked = true; }
}