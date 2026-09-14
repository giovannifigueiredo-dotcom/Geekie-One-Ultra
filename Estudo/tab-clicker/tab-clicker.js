// Clicker minigame com 5 upgrades + 8 conquistas
const UPGRADE_DEFS = {
  autoclicker: { name: 'Auto-Clicker', maxLevel: 10, baseCost: 10 },
  multiplier: { name: 'Multiplicador', maxLevel: 10, baseCost: 50 },
  critical: { name: 'Chance Crítica', maxLevel: 10, baseCost: 100 },
  golden: { name: 'Golden Clicks', maxLevel: 10, baseCost: 200 },
  powersurge: { name: 'Power Surge', maxLevel: 10, baseCost: 500 }
};

function handleClick(event) {
  const multEffect = UPGRADE_DEFS.multiplier.getEffect(clickerData.upgrades.multiplier.level);
  let points = Math.floor((1 + powerEffect) * multEffect);
  // critical hit, golden click, particles, float numbers
  clickerData.points += points;
  clickerData.totalClicks++;
  checkAchievements();
}