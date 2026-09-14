// 12 nós com 3 boss nodes
const journeyNodes = [
  { id: 'j-start', icon: '🌱', xpReq: 0, title: 'Início da Jornada', side: 'left' },
  { id: 'j-100', icon: '📚', xpReq: 100, title: 'Estudante Dedicado', side: 'right' },
  // ... 10 mais
  { id: 'j-10000', icon: '✨', xpReq: 10000, title: 'Divindade Acadêmica', side: 'right', boss: true }
];

function claimJourneyNode(nodeId, btn) {
  const node = journeyNodes.find(n => n.id === nodeId);
  if (journeyClaimed[nodeId] || xp < node.xpReq) return;
  journeyClaimed[nodeId] = true;
  node.rewards.forEach(r => {
    if (r.type === 'coins') earnCoins(r.amount);
    if (r.type === 'xp') { xp += r.amount; updateXP(); }
  });
  spawnParticles(btn);
}