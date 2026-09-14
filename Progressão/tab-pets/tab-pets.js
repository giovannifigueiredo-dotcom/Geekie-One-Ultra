// 9 pets com upgrades e auto-coleta
const petsData = [
  { id: 'pet-pintinho', name: 'Pintinho Piu', emoji: '🐣', xpReq: 0, autoCollectBonus: 1 },
  { id: 'pet-gatinho', name: 'Gatinho Ninja', emoji: '🐱', xpReq: 300, autoCollectBonus: 2 },
  // ... 7 mais
  { id: 'pet-astral', name: 'Ser Dimensional', emoji: '✨', xpReq: 12000, autoCollectBonus: 10 }
];

function unlockPet(petId) {
  const pet = petsData.find(p => p.id === petId);
  if (xp < pet.xpReq) return;
  petState[petId] = { owned: true, active: false, autoCollect: false, upgrades: {} };
  savePetState();
  setActivePet(petId);
}