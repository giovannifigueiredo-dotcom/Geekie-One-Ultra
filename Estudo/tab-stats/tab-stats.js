// Estatísticas com gráfico de barras
function renderStudyStats() {
  renderStatsOverview();
  renderStudyBarChart();
  renderStreakDisplay();
  renderStatsAchievements();
}

function renderStudyBarChart() {
  const data = JSON.parse(localStorage.getItem('geekieStudyWeek') || '{}');
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0,10);
    last7.push({ label: days[d.getDay()], value: data[key] || 0 });
  }
  // render bars
}