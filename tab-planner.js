// Planner semanal com 7 dias
let plannerData = JSON.parse(localStorage.getItem('geekiePlanner') || '{}');
let plannerWeekOffset = 0;

function renderPlanner() {
  const days = getPlannerWeekDates(plannerWeekOffset);
  days.forEach((date, idx) => {
    const dateKey = date.toISOString().slice(0, 10);
    const tasks = plannerData[dateKey] || [];
    // render day column with tasks
  });
}

function plannerAddTask(dateKey) {
  const text = prompt('Nova tarefa:');
  if (!plannerData[dateKey]) plannerData[dateKey] = [];
  plannerData[dateKey].push({ text: text.trim(), done: false });
  savePlanner();
}