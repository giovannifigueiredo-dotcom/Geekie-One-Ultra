// Metas com prioridade
let todos = JSON.parse(localStorage.getItem('geekieTodos')) || [];

function addTodo() {
  const t = document.getElementById('todoInput').value.trim();
  const p = document.getElementById('todoPriority').value;
  if (t) { todos.push({text:t, completed:false, priority: p}); renderTodos(); }
}

function toggleTodo(i) {
  todos[i].completed = !todos[i].completed;
  if (todos[i].completed) earnCoins(5, 'Meta concluída!');
  renderTodos();
}