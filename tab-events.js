// 12 eventos mensais com 4 tiers
const monthlyEvents = [
  { month: 1, name: 'Janeiro: Início de Jornada', icon: '🚀', colorA: '#E95420',
    tiers: [
      {label:'Iniciante',xpReq:0,reward:'Badge',icon:'🌱'},
      {label:'Lendário',xpReq:3000,reward:'Tema Cosmic',icon:'🏆'}
    ]},
  // ... 11 mais
];

function renderEventContent() {
  const ev = monthlyEvents[new Date().getMonth()];
  const pct = Math.min(100, Math.round((xp / ev.tiers[3].xpReq) * 100));
  // render banner + tiers
}