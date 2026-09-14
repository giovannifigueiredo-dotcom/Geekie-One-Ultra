// 8 sons ambientes com mixer
const ambientSounds = [
  { id: 'brown-noise', label: 'Ruído Marrom', icon: '🌊', url: '...' },
  { id: 'rain', label: 'Chuva Suave', icon: '🌧️', url: '...' },
  { id: 'fire', label: 'Fogueira', icon: '🔥', url: '...' },
  // ... 5 mais
];

function toggleAmbientSound(id) {
  const audio = ambientAudios[id];
  if (audio.paused) { audio.volume = (ambientVolumes[id] || 0.5) * masterVol; audio.play(); }
  else { audio.pause(); }
  renderAmbientGrid();
}