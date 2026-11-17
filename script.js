/* ============================================================
   Geekie Study Hub v22.1.0 — script.js (parte 1/4)
   Utilidades, estado, shell, login, tutorial, paleta, Hoje, Chat
   ============================================================ */
'use strict';

/* ============ 1. UTILIDADES ============ */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const pad = (n) => String(n).padStart(2, '0');
const dateKey = (d = new Date()) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const parseKey = (k) => { const p = String(k).split('-').map(Number); return new Date(p[0], (p[1] || 1) - 1, p[2] || 1); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const startOfWeek = (d = new Date()) => { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - x.getDay()); return x; };
const fmtMinutes = (m) => { m = Math.max(0, Math.round(m)); const h = Math.floor(m / 60); return h ? h + 'h ' + pad(m % 60) + 'min' : m + 'min'; };
const fmtClock = (s) => pad(Math.floor(s / 3600)) + ':' + pad(Math.floor((s % 3600) / 60)) + ':' + pad(s % 60);
const WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const WEEK_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const money = (n) => Number(n || 0).toLocaleString('pt-BR');
const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
const prettyDate = (k) => { const d = parseKey(k); return d.getDate() + ' ' + MONTHS[d.getMonth()].slice(0, 3) + ' ' + d.getFullYear(); };
const debounce = (fn, ms = 140) => {
  let t = null;
  return function (...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), ms); };
};
const idleRun = (cb, timeout = 700) => {
  if (typeof window.requestIdleCallback === 'function') return window.requestIdleCallback(cb, { timeout });
  return setTimeout(cb, 60);
};
const sum = (arr) => arr.reduce((a, b) => a + (Number(b) || 0), 0);

let toastTimer = null;
function toast(message, icon = 'fa-check', isError = false) {
  const box = $('#appToast');
  if (!box) return;
  box.classList.toggle('error', !!isError);
  const i = $('i', box);
  if (i) i.className = 'fa-solid ' + icon;
  const span = $('span', box);
  if (span) span.textContent = message;
  box.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => box.classList.remove('show'), 2600);
}
function copyText(text) {
  if (!text) return Promise.resolve(false);
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).then(() => true).catch(() => fallbackCopy(text));
  return Promise.resolve(fallbackCopy(text));
}
function fallbackCopy(text) {
  try {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    const ok = document.execCommand('copy'); ta.remove(); return ok;
  } catch (e) { return false; }
}
function download(filename, content, type = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
function beep(freq = 660, duration = 0.16, type = 'sine', volume = 0.18) {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC || !state.soundEnabled) return;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type; osc.frequency.value = freq;
    gain.gain.value = volume;
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.stop(ctx.currentTime + duration);
    setTimeout(() => ctx.close(), (duration + 0.1) * 1000);
  } catch (e) { /* silencioso */ }
}

/* ============ 2. ESTADO ============ */
const VERSION = 'v22.1.0';
const STORAGE_KEY = 'geekieHubState_v22';
const LEGACY_KEYS = ['geekieHubState_v20', 'geekieHubState_v194'];
/* Contas continuam na mesma chave: trocar de versão não desloga ninguém. */
const ACCOUNTS_KEY = 'geekieHubAccounts_v20';
const LEGACY_ACCOUNTS = ['geekieHubAccounts_v194'];
const SEEN_KEY = 'geekieHubSeenVersion_v22';

const DEFAULT_STATE = {
  session: null,
  xp: 0, coins: 25, title: 'Novato',
  pageTitle: 'Geekie Study Hub v22.1.0', font: 'Poppins', icon: 'fa-graduation-cap',
  themesOwned: ['default'], theme: 'default',
  petsOwned: [], pet: null, petEnergy: {}, petFed: {},
  focusByDate: {}, subjectMinutes: {}, subjectGoals: {}, customSubjects: [],
  sessions: 0, pomoSessions: 0, pomoCycle: 1,
  pomoConfig: { focus: 25, short: 5, long: 15, autoBreak: true, sound: true, subject: '' },
  goals: [], notes: {}, noteOrder: [], currentNote: null,
  decks: { Geral: [{ id: 'seed1', q: 'Qual é a fórmula da velocidade média?', a: 'Vm = ΔS / Δt — variação da posição dividida pelo intervalo de tempo.', ease: 2.5, interval: 0, due: '', reps: 0, lapses: 0, createdAt: Date.now() }, { id: 'seed2', q: 'O que é uma hipótese?', a: 'Uma explicação testável para um fenômeno, que pode ser confirmada ou refutada.', ease: 2.5, interval: 0, due: '', reps: 0, lapses: 0, createdAt: Date.now() }] },
  deck: 'Geral', flashStats: { again: 0, hard: 0, good: 0, easy: 0 }, flashRound: 0,
  planner: {}, plannerWeek: dateKey(startOfWeek()), diary: {},
  clicker: { points: 0, upgrades: {}, clicks: 0, total: 0, lifetime: 0, prestige: 0, autoExchange: false, buyAmount: 1, lastSeen: 0, comboBest: 0, exchanges: 0 },
  keySounds: { on: false, style: 'soft', volume: 45 },
  ambient: { master: 70, layers: { rain: 0, noise: 0, waves: 0, fire: 0, wind: 0 } },
  charsFav: [], recentChars: [], charCopies: 0,
  checkins: {}, streakProtect: {}, streakShields: 0, shieldsUsed: 0,
  dailyStats: { date: '', cards: 0, quiz: 0, goals: 0, clicks: 0, notes: 0, exchanges: 0, missions: 0 },
  missionClaims: [], diaryDrafts: {},
  chatHistory: [], motionReduced: false, soundEnabled: true, navCollapsed: false,
  quizBest: 0, quizHistory: [], redeemed: [], commandHistory: [],
  streakBest: 0, lastVisit: '', seenVersion: '', achievements: {}, milestonesClaimed: [],
  calcHistory: [], createdAt: Date.now(), totalGoalsDone: 0,
  xpEarned: 0, coinsEarned: 0
};

function loadState() {
  let saved = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || LEGACY_KEYS.map((k) => localStorage.getItem(k)).find(Boolean);
    saved = raw ? JSON.parse(raw) : {};
  } catch (e) { saved = {}; }
  const s = Object.assign({}, DEFAULT_STATE, saved || {});
  s.pomoConfig = Object.assign({}, DEFAULT_STATE.pomoConfig, saved.pomoConfig || {});
  s.flashStats = Object.assign({}, DEFAULT_STATE.flashStats, saved.flashStats || {});
  s.clicker = Object.assign({}, DEFAULT_STATE.clicker, saved.clicker || {}, { upgrades: Object.assign({}, (saved.clicker || {}).upgrades || {}) });
  s.keySounds = Object.assign({}, DEFAULT_STATE.keySounds, saved.keySounds || {});
  s.ambient = Object.assign({}, DEFAULT_STATE.ambient, saved.ambient || {}, { layers: Object.assign({}, DEFAULT_STATE.ambient.layers, (saved.ambient || {}).layers || {}) });
  if (!s.decks || typeof s.decks !== 'object' || !Object.keys(s.decks).length) s.decks = DEFAULT_STATE.decks;
  Object.keys(s.decks).forEach((d) => { if (!Array.isArray(s.decks[d])) s.decks[d] = []; });
  if (!Array.isArray(s.deck ? [s.deck] : []) || !s.decks[s.deck]) s.deck = Object.keys(s.decks)[0];
  ['themesOwned', 'petsOwned', 'goals', 'noteOrder', 'charsFav', 'recentChars', 'chatHistory', 'redeemed', 'commandHistory', 'quizHistory', 'milestonesClaimed', 'customSubjects', 'calcHistory', 'missionClaims'].forEach((k) => { if (!Array.isArray(s[k])) s[k] = []; });
  ['focusByDate', 'subjectMinutes', 'subjectGoals', 'petEnergy', 'petFed', 'notes', 'planner', 'diary', 'achievements', 'checkins', 'streakProtect', 'dailyStats', 'diaryDrafts'].forEach((k) => { if (!s[k] || typeof s[k] !== 'object') s[k] = {}; });
  s.dailyStats = Object.assign({}, DEFAULT_STATE.dailyStats, s.dailyStats);
  if (typeof s.charCopies !== 'number' || !isFinite(s.charCopies)) s.charCopies = 0;
  s.streakShields = clamp(Number(s.streakShields) || 0, 0, 5);
  s.xpEarned = Math.max(0, Number(s.xpEarned) || 0);
  s.coinsEarned = Math.max(0, Number(s.coinsEarned) || 0);
  if (['Geekie Study Hub v22.0.0', 'Geekie Study Hub v21.0.0', 'Geekie Study Hub v20.1.0'].indexOf(s.pageTitle) !== -1) s.pageTitle = DEFAULT_STATE.pageTitle;
  if (s.themesOwned.indexOf('default') === -1) s.themesOwned.unshift('default');
  return s;
}
const state = loadState();

/* Gravação com debounce: uma sequência de XP + moedas + nível gera uma
   única serialização, em vez de várias por clique. */
let saveTimer = null;
function saveNow() {
  clearTimeout(saveTimer);
  saveTimer = null;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch (e) { console.warn('Geekie: não foi possível salvar (localStorage cheio ou bloqueado).'); }
}
function save() {
  if (saveTimer) return;
  saveTimer = setTimeout(saveNow, 400);
}
function cancelSave() { clearTimeout(saveTimer); saveTimer = null; }

/* ============ 3. LISTAS E METADADOS ============ */
const TABS = [
  { id: 'hoje', title: 'Hoje', icon: 'fa-sun', group: 'Hoje', kicker: 'Visão geral', desc: 'Seu dashboard diário: foco, streak, metas e revisões pendentes.', tips: ['Use os atalhos rápidos para começar sem navegar.', 'O anel mostra o progresso da meta diária de foco.'] },
  { id: 'timer', title: 'Pomodoro', icon: 'fa-stopwatch', group: 'Estudo', kicker: 'Foco', desc: 'Ciclos de foco e pausa com anel, ciclo automático e matéria.', tips: ['Cada minuto de foco vale 2 XP e 1 moeda.', 'A pausa longa entra sozinha a cada 4 ciclos.'] },
  { id: 'goals', title: 'Metas', icon: 'fa-list-check', group: 'Estudo', kicker: 'Organização', desc: 'Metas com matéria, prioridade, prazo, filtros e progresso.', tips: ['Metas concluídas dão +8 XP e +2 moedas.', 'Metas atrasadas ficam destacadas em vermelho.'] },
  { id: 'flashcards', title: 'Flashcards', icon: 'fa-clone', group: 'Estudo', kicker: 'Memória', desc: 'Revisão com repetição espaçada, baralhos e atalhos de teclado.', tips: ['Espaço vira o card; 1 a 4 avaliam.', 'Cada avaliação agenda o próximo intervalo.'] },
  { id: 'quiz', title: 'Quiz', icon: 'fa-brain', group: 'Estudo', kicker: 'Teste', desc: 'Perguntas por matéria com explicação, cronômetro e revisão de erros.', tips: ['Cada acerto vale 5 XP.', 'No modo cronometrado você tem 20s por questão.'] },
  { id: 'subjects', title: 'Timer matérias', icon: 'fa-clock', group: 'Estudo', kicker: 'Foco', desc: 'Cronômetro por matéria com metas de minutos.', tips: ['Pare e salve para registrar a sessão.', 'As metas por matéria aparecem na lista de totais.'] },
  { id: 'planner', title: 'Planner', icon: 'fa-calendar-week', group: 'Estudo', kicker: 'Semana', desc: 'Grade semanal com cores por matéria, modelo e cópia da semana.', tips: ['Escreva "Biologia — mitose" para colorir o bloco.', 'Use o modelo para preencher uma base rapidamente.'] },
  { id: 'stats', title: 'Estatísticas', icon: 'fa-chart-simple', group: 'Estudo', kicker: 'Dados', desc: 'Gráficos de foco, mapa de constância, distribuição e CSV.', tips: ['Alterne entre 7 e 30 dias.', 'O mapa mostra as últimas 12 semanas.'] },
  { id: 'diary', title: 'Diário', icon: 'fa-book', group: 'Estudo', kicker: 'Reflexão', desc: 'Entradas por dia com humor, busca e exportação em markdown.', tips: ['O humor aparece no resumo de cada entrada.', 'Exporte tudo em .md para guardar fora do navegador.'] },
  { id: 'chat', title: 'Chat IA', icon: 'fa-comments', group: 'Inteligência', kicker: 'Tutor local', desc: 'Tutor que explica, resolve, resume e cria revisão — offline.', tips: ['Troque o modo para mudar o formato da resposta.', 'Salve uma resposta como nota ou flashcard.'] },
  { id: 'commands', title: 'Comandos', icon: 'fa-terminal', group: 'Inteligência', kicker: 'Ctrl + K', desc: 'Terminal do hub com 30 comandos, autocomplete e histórico.', tips: ['Tab completa, ↑/↓ navegam o histórico.', 'Ctrl+K abre a paleta de qualquer aba.'] },
  { id: 'store', title: 'Loja', icon: 'fa-store', group: 'Progresso', kicker: 'Temas', desc: 'Nove temas, compra com moedas e preview ao vivo.', tips: ['Passe o mouse para prever o tema.', 'Temas comprados ficam salvos para sempre.'] },
  { id: 'titles', title: 'Títulos', icon: 'fa-crown', group: 'Progresso', kicker: 'Status', desc: 'Títulos liberados por XP e equipáveis na topbar.', tips: ['Você mantém o título ao subir de nível.', 'O próximo título mostra quanto falta.'] },
  { id: 'pets', title: 'Pets', icon: 'fa-paw', group: 'Progresso', kicker: 'Companhia', desc: 'Pets com energia, alimentação e renda passiva de moedas.', tips: ['Alimentar custa moedas e mantém o bônus.', 'Cada pet rende um valor diferente por tick.'] },
  { id: 'journey', title: 'Trilha', icon: 'fa-map', group: 'Progresso', kicker: 'Evolução', desc: 'Níveis, marcos com recompensa, conquistas e escudos de sequência.', tips: ['Marque marcos para resgatar moedas e XP.', 'Conquistas são automáticas.', 'Compre escudos para não perder a sequência em um dia corrido.'] },
  { id: 'clicker', title: 'Clicker', icon: 'fa-hand-pointer', group: 'Progresso', kicker: 'Energia', desc: 'Núcleo com combo, seis melhorias, troca por moedas, auto-troca e prestígio.', tips: ['Cliques rápidos aumentam o combo até x2.', 'Melhorias e prestígio multiplicam a energia por segundo.', 'A energia acumula offline por até 10 minutos.'] },
  { id: 'rewards', title: 'Recompensas', icon: 'fa-gift', group: 'Progresso', kicker: 'Códigos', desc: 'Campanhas com códigos, expiração e histórico de resgates.', tips: ['Cada código vale uma vez por conta.', 'O código não diferencia maiúsculas.'] },
  { id: 'notes', title: 'Notas', icon: 'fa-note-sticky', group: 'Ferramentas', kicker: 'Escrita', desc: 'Notas com busca, tags, autosave e exportação em markdown.', tips: ['Ctrl+S salva a nota atual.', 'Tags ajudam a filtrar pela busca.'] },
  { id: 'ambient', title: 'Sons ambiente', icon: 'fa-headphones', group: 'Ferramentas', kicker: 'Áudio', desc: 'Camadas de som geradas no navegador, com presets e timer.', tips: ['Combine camadas para mascarar o ambiente.', 'O timer reduz o volume até silenciar.'] },
  { id: 'keysounds', title: 'Som de teclado', icon: 'fa-keyboard', group: 'Ferramentas', kicker: 'Áudio', desc: 'Feedback sonoro ao digitar, com quatro estilos.', tips: ['Teste no campo antes de ativar.', 'Vale para todos os campos do hub.'] },
  { id: 'calculator', title: 'Calculadora', icon: 'fa-calculator', group: 'Ferramentas', kicker: 'Cálculo', desc: 'Calculadora com teclado, histórico e cópia do resultado.', tips: ['Enter calcula; Esc limpa.', 'Clique em um item do histórico para reutilizar.'] },
  { id: 'chars', title: 'Caracteres', icon: 'fa-font', group: 'Ferramentas', kicker: 'Símbolos', desc: 'Biblioteca de símbolos com busca, categorias e favoritos.', tips: ['Busque por nome ou código Unicode.', 'Favoritos ficam no topo.'] },
  { id: 'title', title: 'Título da página', icon: 'fa-pen-nib', group: 'Ferramentas', kicker: 'Aparência', desc: 'Personalize título, fonte e ícone do hub.', tips: ['O texto muda também a aba do navegador.', 'Restaure o padrão a qualquer momento.'] },
  { id: 'password', title: 'Senhas', icon: 'fa-shield-halved', group: 'Ferramentas', kicker: 'Segurança', desc: 'Gerador com entropia, passphrase e histórico local.', tips: ['Nada é enviado pela rede.', 'Use 16+ caracteres para contas importantes.'] },
  { id: 'geekie', title: 'Portal Geekie', icon: 'fa-graduation-cap', group: 'Extras', kicker: 'Portal', desc: 'O Geekie One embutido, com recarregar e tela cheia.', tips: ['Se bloquear o iframe, use Nova aba.', 'Os atalhos abrem portais em nova aba.'] },
  { id: 'google', title: 'Google', icon: 'fa-google', brand: true, group: 'Extras', kicker: 'Busca', desc: 'Google embutido mais atalhos para Classroom, Drive e YouTube.', tips: ['A busca embutida pode bloquear; use os atalhos.', 'Tela cheia amplia a área.'] },
  { id: 'events', title: 'Eventos', icon: 'fa-calendar-day', group: 'Extras', kicker: 'Calendário', desc: 'Evento de cada mês com progresso por XP e recompensa.', tips: ['O mês atual é destacado.', 'A recompensa é liberada por nível de evento.'] },
  { id: 'devlog', title: 'Dev Log', icon: 'fa-code-branch', group: 'Extras', kicker: 'Versões', desc: 'Histórico de versões com filtros, busca e atalho para as 3 últimas.', tips: ['Filtre por correção, novidade ou interface.', 'Ctrl+Shift+D abre as 3 últimas em um painel flutuante.'] }
];
const TAB_MAP = Object.fromEntries(TABS.map((t) => [t.id, t]));
const GROUPS = ['Hoje', 'Estudo', 'Inteligência', 'Progresso', 'Ferramentas', 'Extras'];

const LEVELS = [
  { xp: 0, title: 'Novato' }, { xp: 100, title: 'Estudante' }, { xp: 300, title: 'Focado' },
  { xp: 600, title: 'Disciplinado' }, { xp: 1000, title: 'Estrategista' },
  { xp: 1500, title: 'Mestre' }, { xp: 2200, title: 'Lenda' }, { xp: 3000, title: 'Geekie Supremo' },
  { xp: 4200, title: 'Lenda Suprema' }, { xp: 5600, title: 'Mítico' }
];
function levelInfo(xp) {
  let cur = LEVELS[0], next = LEVELS[1];
  LEVELS.forEach((l) => { if (xp >= l.xp) { cur = l; next = LEVELS[LEVELS.indexOf(l) + 1] || null; } });
  return { cur, next };
}

const THEMES = [
  { id: 'default', name: 'Geekie', price: 0, a: '#2ee6a8', b: '#22d3ee' },
  { id: 'neon', name: 'Neon Pink', price: 120, a: '#ff2e93', b: '#ff7ac8' },
  { id: 'ocean', name: 'Oceano', price: 160, a: '#22d3ee', b: '#0ea5e9' },
  { id: 'forest', name: 'Floresta', price: 180, a: '#4ade80', b: '#a3e635' },
  { id: 'sunset', name: 'Pôr do Sol', price: 200, a: '#fb923c', b: '#f97316' },
  { id: 'matrix', name: 'Matrix', price: 240, a: '#22c55e', b: '#84cc16' },
  { id: 'galaxy', name: 'Galáxia', price: 280, a: '#a78bfa', b: '#60a5fa' },
  { id: 'candy', name: 'Candy', price: 320, a: '#f472b6', b: '#fda4af' },
  { id: 'ember', name: 'Brasa', price: 380, a: '#f97316', b: '#ef4444' },
  { id: 'aurora', name: 'Aurora', price: 420, a: '#8b5cf6', b: '#22d3ee' },
  { id: 'sakura', name: 'Sakura', price: 480, a: '#f472b6', b: '#fb7185' }
];
const PETS = [
  { id: 'neko', name: 'Neko', emoji: '🐱', price: 40, income: 1 },
  { id: 'corujinha', name: 'Corujinha', emoji: '🦉', price: 90, income: 2 },
  { id: 'tartaruga', name: 'Tartaruga Zen', emoji: '🐢', price: 150, income: 3 },
  { id: 'raposa', name: 'Raposa', emoji: '🦊', price: 230, income: 4 },
  { id: 'dragao', name: 'Dragãozinho', emoji: '🐲', price: 340, income: 6 }
];
const SUBJECTS = ['Matemática', 'Português', 'Biologia', 'Química', 'Física', 'História', 'Geografia', 'Inglês'];
function subjects() { return SUBJECTS.concat(state.customSubjects); }

/* ============ 4. TOPBAR, TEMA E NAVEGAÇÃO ============ */
function dayIsActive(key) {
  return (state.focusByDate[key] || 0) > 0
    || !!(state.checkins && state.checkins[key])
    || !!(state.streakProtect && state.streakProtect[key]);
}
function computeStreak() {
  let streak = 0;
  let d = new Date();
  if (!dayIsActive(dateKey(d))) d = addDays(d, -1);
  while (dayIsActive(dateKey(d))) { streak++; d = addDays(d, -1); }
  return streak;
}
/* Foguinho: cada faixa de sequência aumenta o XP ganho no hub. */
const STREAK_TIERS = [
  { days: 30, mult: 1.5, name: 'Inferno', icon: 'fa-fire-flame-curved' },
  { days: 14, mult: 1.35, name: 'Fogueira', icon: 'fa-fire' },
  { days: 7, mult: 1.2, name: 'Em chamas', icon: 'fa-fire' },
  { days: 3, mult: 1.1, name: 'Aquecendo', icon: 'fa-temperature-half' },
  { days: 0, mult: 1, name: 'Começando', icon: 'fa-seedling' }
];
function streakTier(streak) {
  const n = typeof streak === 'number' ? streak : computeStreak();
  return STREAK_TIERS.find((t) => n >= t.days) || STREAK_TIERS[STREAK_TIERS.length - 1];
}
function nextStreakTier(streak) {
  const n = typeof streak === 'number' ? streak : computeStreak();
  return STREAK_TIERS.slice().reverse().find((t) => t.days > n) || null;
}
/* Topbar coalescida: várias chamadas no mesmo frame viram uma pintura só. */
let topbarQueued = false;
function renderTopbar() {
  if (topbarQueued) return;
  topbarQueued = true;
  const paint = () => { topbarQueued = false; paintTopbar(); };
  if (window.requestAnimationFrame) requestAnimationFrame(paint); else setTimeout(paint, 16);
}
function paintTopbar() {
  const info = levelInfo(state.xp);
  const xpEl = $('#xpCount');
  if (xpEl && xpEl.textContent !== String(state.xp)) bump($('#xpContainer'));
  if (xpEl) xpEl.textContent = state.xp;
  const fill = $('#xpProgressFill');
  if (fill) fill.style.width = (info.next ? clamp(((state.xp - info.cur.xp) / (info.next.xp - info.cur.xp)) * 100, 0, 100) : 100) + '%';
  const nextEl = $('#xpNextTitle');
  const streak = computeStreak();
  const tier = streakTier(streak);
  const nextTier = nextStreakTier(streak);
  if (nextEl) nextEl.textContent = info.next
    ? 'Próximo: ' + info.next.title + ' (' + info.next.xp + ' XP) · foguinho x' + tier.mult
    : 'Nível máximo · foguinho x' + tier.mult;
  const xpBox = $('#xpContainer');
  if (xpBox) xpBox.title = 'XP total: ' + state.xp + ' · ganho com bônus: ' + (state.xpEarned || 0) + ' · multiplicador de sequência x' + tier.mult;
  ['#coinCount', '#storeCoinCount', '#petCoinCount', '#rewardCoinCount', '#clickerCoinCount'].forEach((sel) => {
    const el = $(sel);
    if (el) el.textContent = money(state.coins);
  });
  if (streak > state.streakBest && streak > 0) state.streakBest = streak;
  const sEl = $('#streakCount');
  if (sEl) sEl.textContent = streak;
  const multEl = $('#streakMult');
  if (multEl) multEl.textContent = 'x' + tier.mult;
  const pill = $('#streakPill');
  if (pill) {
    pill.title = streak + ' dia(s) de sequência · ' + tier.name + ' (x' + tier.mult + ' XP)' +
      ' · escudos: ' + (state.streakShields || 0) +
      (nextTier ? ' · faltam ' + (nextTier.days - streak) + ' dia(s) para x' + nextTier.mult : '');
    pill.dataset.tier = tier.name;
  }
  const today = state.focusByDate[dateKey()] || 0;
  const study = $('#studyTimeTopbarDisplay');
  if (study) study.textContent = fmtMinutes(today);
  const clock = $('#realTimeClock');
  if (clock) clock.textContent = new Date().toLocaleTimeString('pt-BR');
}
function bump(el) {
  if (!el) return;
  el.classList.remove('value-bump');
  void el.offsetWidth;
  el.classList.add('value-bump');
  setTimeout(() => el.classList.remove('value-bump'), 700);
}
function popGain(sel, text) {
  if (state.motionReduced) return;
  const el = $(sel);
  if (!el) return;
  el.textContent = text;
  el.classList.remove('show');
  void el.offsetWidth;
  el.classList.add('show');
}
function addXp(n, silent) {
  if (!n) return 0;
  const raw = Math.round(n);
  const mult = raw > 0 ? streakTier().mult : 1;
  const gain = raw > 0 ? Math.max(1, Math.round(raw * mult)) : raw;
  const before = levelInfo(state.xp).cur.title;
  state.xp = Math.max(0, state.xp + gain);
  if (gain > 0) state.xpEarned = (state.xpEarned || 0) + gain;
  const after = levelInfo(state.xp).cur.title;
  if (after !== before) {
    if (!state.title || state.title === before) state.title = after;
    const lvl = LEVELS.findIndex((l) => l.title === after);
    const bonus = 15 + Math.max(0, lvl) * 10;
    state.coins += bonus;
    if (!silent) toast('Novo nível: ' + after + '! +' + bonus + ' moedas.', 'fa-arrow-up');
    renderTitles();
    renderJourney();
  }
  if (gain > 0) popGain('#xpPop', '+' + gain);
  renderTopbar();
  if (state.currentTab === 'hoje') renderHoje();
  save();
  return gain;
}
function addCoins(n) {
  if (!n) return;
  state.coins = Math.max(0, state.coins + n);
  if (n > 0) state.coinsEarned = (state.coinsEarned || 0) + n;
  if (n > 0) popGain('#coinPop', '+' + money(n));
  renderTopbar();
  if (state.currentTab === 'store') renderStore();
  if (state.currentTab === 'pets') renderPets();
  save();
}
function addFocus(minutes, subject) {
  minutes = Math.max(0, Math.round(minutes));
  if (!minutes) return;
  const k = dateKey();
  state.focusByDate[k] = (state.focusByDate[k] || 0) + minutes;
  if (subject) state.subjectMinutes[subject] = (state.subjectMinutes[subject] || 0) + minutes;
  state.sessions += 1;
  if (state.pet) state.petEnergy[state.pet] = clamp((state.petEnergy[state.pet] || 0) + 2, 0, 100);
  dailyBump('focus', minutes);
  addXp(minutes * 2 + (minutes >= 25 ? 6 : 0));
  addCoins(Math.max(1, Math.round(minutes / 10)));
  if (state.currentTab === 'stats') renderStats();
  if (state.currentTab === 'journey') renderJourney();
  if (state.currentTab === 'subjects') { renderSubjects(); renderSubjectsTotals(); }
  if (state.currentTab === 'pets') renderPets();
  save();
}
function applyTheme(id) {
  const theme = THEMES.find((t) => t.id === id) || THEMES[0];
  document.documentElement.setAttribute('data-theme', theme.id);
  state.theme = theme.id;
  save();
}
function applyPageTitle() {
  document.title = state.pageTitle;
  const prev = $('#titlePreview');
  if (prev) prev.textContent = state.pageTitle;
  const iconLink = $('#pageIcon');
  if (iconLink) iconLink.href = 'https://i.postimg.cc/gcHHYqtC/fire-geekie.png';
  document.documentElement.style.setProperty('--font', "'" + state.font + "', system-ui, sans-serif");
}
function applyMotion() {
  document.body.classList.toggle('reduce-motion', !!state.motionReduced);
  const btn = $('#btnMotionMode');
  if (btn) btn.setAttribute('aria-pressed', String(!!state.motionReduced));
  if (state.motionReduced) fxResetAll();
}
function buildNav() {
  const wrap = $('#navGroups');
  if (!wrap) return;
  wrap.innerHTML = GROUPS.map((group) => {
    const items = TABS.filter((t) => t.group === group);
    if (!items.length) return '';
    return '<div class="nav-group"><div class="nav-label">' + esc(group) + '</div>' +
      items.map((t) => '<button class="nav-item" type="button" data-goto="' + t.id + '">' +
        '<i class="fa-' + (t.brand ? 'brands' : 'solid') + ' ' + t.icon + '"></i>' +
        '<span class="nav-text">' + esc(t.title) + '</span></button>').join('') + '</div>';
  }).join('');
  const mobile = $('#mobileNav');
  if (mobile) {
    const quick = ['hoje', 'timer', 'flashcards', 'goals', 'stats'];
    mobile.innerHTML = quick.map((id) => {
      const t = TAB_MAP[id];
      return '<button type="button" data-goto="' + id + '"><i class="fa-solid ' + t.icon + '"></i><span>' + esc(t.title) + '</span></button>';
    }).join('') + '<button type="button" id="mobileMore"><i class="fa-solid fa-ellipsis"></i><span>Mais</span></button>';
  }
  syncNav(state.currentTab || 'hoje');
}
function syncNav(id) {
  $$('[data-goto]').forEach((b) => b.classList.toggle('active', b.dataset.goto === id && (b.classList.contains('nav-item') || b.classList.contains('mobile-nav') || b.closest('.mobile-nav'))));
  $$('.mobile-nav button').forEach((b) => b.classList.toggle('active', b.dataset.goto === id));
  const item = TAB_MAP[id];
  if (item) {
    const k = $('#topbarKicker'); if (k) k.textContent = item.kicker;
    const t = $('#topbarTitle'); if (t) t.textContent = item.title;
  }
}
function switchTab(id, opts) {
  if (!TAB_MAP[id]) return;
  state.currentTab = id;
  $$('.page').forEach((p) => p.classList.toggle('active', p.dataset.tab === id));
  syncNav(id);
  document.body.classList.remove('nav-open');
  if (!(opts && opts.keepScroll)) $('#content').scrollTop = 0;
  const render = RENDERERS[id];
  if (render) { try { render(); } catch (e) { console.error('Erro ao renderizar ' + id, e); } }
  if (!(opts && opts.silent)) history.replaceState(null, '', '#' + id);
}

/* ============ 5. LOGIN ============ */
const authMode = { register: false };
function readAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY) || LEGACY_ACCOUNTS.map((k) => localStorage.getItem(k)).find(Boolean);
    return raw ? JSON.parse(raw) || {} : {};
  } catch (e) { return {}; }
}
function hashPass(p) {
  let h = 5381;
  for (let i = 0; i < p.length; i++) h = ((h << 5) + h + p.charCodeAt(i)) | 0;
  return 'h' + Math.abs(h).toString(36);
}
function showLoginError(msg) {
  const box = $('#loginError');
  if (!box) return;
  box.textContent = msg || '';
  box.classList.toggle('show', !!msg);
}
function setAuthMode(register) {
  authMode.register = !!register;
  const confirm = $('#loginConfirmField');
  if (confirm) confirm.hidden = !register;
  const btn = $('#loginSubmitBtn');
  if (btn) btn.textContent = register ? 'Criar conta' : 'Entrar';
  const link = $('#loginSwitchLink');
  if (link) link.textContent = register ? 'Já tem conta? Entrar' : 'Não tem conta? Registre-se';
  const sub = $('#loginSubtitle');
  if (sub) sub.textContent = register ? 'Crie sua conta local do hub.' : 'Seu progresso fica salvo neste navegador.';
  showLoginError('');
}
function submitAuth() {
  const name = ($('#loginName') || {}).value || '';
  const pass = ($('#loginPassword') || {}).value || '';
  const clean = name.trim();
  if (clean.length < 2) return showLoginError('Digite um nome com pelo menos 2 caracteres.');
  if (pass.length < 4) return showLoginError('A senha precisa de pelo menos 4 caracteres.');
  const accounts = readAccounts();
  const key = clean.toLowerCase();
  if (authMode.register) {
    if (accounts[key]) return showLoginError('Esse nome já existe. Entre com sua senha.');
    const confirm = ($('#loginConfirm') || {}).value || '';
    if (confirm !== pass) return showLoginError('As senhas não coincidem.');
    accounts[key] = { name: clean, pass: hashPass(pass), createdAt: Date.now() };
    try { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts)); } catch (e) { /* ignore */ }
    state.session = { name: clean, guest: false };
    save(); openApp(); toast('Conta criada. Bem-vindo, ' + clean + '!', 'fa-user-check');
    return;
  }
  const account = accounts[key];
  if (!account || account.pass !== hashPass(pass)) return showLoginError('Nome ou senha incorretos. Se não tem conta, registre-se.');
  state.session = { name: account.name, guest: false };
  save(); openApp(); toast('Bem-vindo de volta, ' + account.name + '!', 'fa-hand-sparkles');
}
function loginGuest() {
  state.session = { name: 'Convidado', guest: true };
  save(); openApp(); toast('Modo convidado: o progresso fica neste navegador.', 'fa-user-secret');
}
function logout() {
  state.session = null; saveNow();
  const overlay = $('#loginOverlay'); if (overlay) overlay.hidden = false;
  const app = $('#app'); if (app) app.hidden = true;
  const pass = $('#loginPassword'); if (pass) pass.value = '';
  setAuthMode(false);
  toast('Sessão encerrada.', 'fa-right-from-bracket');
}
function openApp() {
  const overlay = $('#loginOverlay'); if (overlay) overlay.hidden = true;
  const app = $('#app'); if (app) app.hidden = false;
  const badge = $('#loginUserBadge'); if (badge) badge.hidden = false;
  const name = (state.session && state.session.name) || 'Convidado';
  const label = $('#userNameLabel'); if (label) label.textContent = name;
  const av = $('#userAvatar'); if (av) av.textContent = name.charAt(0).toUpperCase();
  renderTopbar(); renderAll();
  const key = location.hash.replace('#', '');
  switchTab(TAB_MAP[key] ? key : 'hoje', { silent: true });
  maybeWhatsNew();
}
function bindAuth() {
  $('#loginSubmitBtn') && $('#loginSubmitBtn').addEventListener('click', submitAuth);
  $('#loginSwitchLink') && $('#loginSwitchLink').addEventListener('click', () => setAuthMode(!authMode.register));
  $('#loginGuestLink') && $('#loginGuestLink').addEventListener('click', loginGuest);
  $('#logoutBtn') && $('#logoutBtn').addEventListener('click', logout);
  ['#loginPassword', '#loginConfirm', '#loginName'].forEach((sel) => {
    const el = $(sel);
    if (el) el.addEventListener('keydown', (e) => { if (e.key === 'Enter') submitAuth(); });
  });
}

/* ============ 6. TUTORIAL ============ */
const tutorial = { i: 0 };
function renderTutorial() {
  const t = TABS[tutorial.i];
  if (!t) return;
  const total = TABS.length;
  const icon = $('#tutorialStepIcon'); if (icon) icon.className = 'fa-' + (t.brand ? 'brands' : 'solid') + ' ' + t.icon;
  const title = $('#tutTitle'); if (title) title.textContent = t.title;
  const meta = $('#tutorialStepMeta'); if (meta) meta.textContent = 'Aba ' + (tutorial.i + 1) + ' de ' + total;
  const prog = $('#tutorialProgress'); if (prog) prog.textContent = (tutorial.i + 1) + ' / ' + total;
  const fill = $('#tutorialProgressFill'); if (fill) fill.style.width = ((tutorial.i + 1) / total * 100).toFixed(1) + '%';
  const body = $('#tutorialBodyText'); if (body) body.textContent = t.desc;
  const tips = $('#tutorialTipsList');
  if (tips) tips.innerHTML = (t.tips || []).map((x) => '<li>' + esc(x) + '</li>').join('');
  const dots = $('#tutorialDots');
  if (dots) dots.innerHTML = TABS.map((_, i) => '<span class="tutorial-dot' + (i === tutorial.i ? ' active' : '') + '"></span>').join('');
  const prev = $('#tutorialBtnPrev'); if (prev) prev.disabled = tutorial.i === 0;
  const next = $('#tutorialBtnNext');
  if (next) next.innerHTML = tutorial.i === total - 1 ? 'Concluir <i class="fa-solid fa-check"></i>' : 'Próximo <i class="fa-solid fa-arrow-right"></i>';
}
function openTutorial() { tutorial.i = 0; renderTutorial(); const o = $('#tutorialOverlay'); if (o) o.hidden = false; }
function closeTutorial() { const o = $('#tutorialOverlay'); if (o) o.hidden = true; }
function tutorialGo(d) {
  const n = tutorial.i + d;
  if (n < 0) return;
  if (n >= TABS.length) { closeTutorial(); toast('Tutorial concluído!', 'fa-graduation-cap'); return; }
  tutorial.i = n; renderTutorial();
}
function bindTutorial() {
  $('#tutorialBtnPrev') && $('#tutorialBtnPrev').addEventListener('click', () => tutorialGo(-1));
  $('#tutorialBtnNext') && $('#tutorialBtnNext').addEventListener('click', () => tutorialGo(1));
  $('#tutorialBtnSkip') && $('#tutorialBtnSkip').addEventListener('click', closeTutorial);
  $('#fabTutorialBtn') && $('#fabTutorialBtn').addEventListener('click', openTutorial);
}

/* ============ 7. PALETA ============ */
let paletteIndex = 0;
function paletteItems(query) {
  const q = String(query || '').trim().toLowerCase();
  const items = [];
  TABS.forEach((t) => items.push({ icon: t.icon, brand: t.brand, label: t.title, meta: t.group, run: () => switchTab(t.id) }));
  Object.keys(COMMANDS || {}).forEach((name) => items.push({ icon: 'fa-angle-right', label: name, meta: 'comando', run: () => { switchTab('commands'); runCommand(name); } }));
  if (!q) return items.slice(0, 14);
  return items.filter((i) => (i.label + ' ' + i.meta).toLowerCase().includes(q)).slice(0, 18);
}
function renderPalette(query) {
  const list = $('#paletteList');
  if (!list) return;
  const items = paletteItems(query);
  paletteIndex = clamp(paletteIndex, 0, Math.max(0, items.length - 1));
  list.innerHTML = items.length ? items.map((it, i) => '<button class="palette-item' + (i === paletteIndex ? ' active' : '') + '" type="button" data-i="' + i + '">' +
    '<i class="fa-' + (it.brand ? 'brands' : 'solid') + ' ' + it.icon + '"></i><span>' + esc(it.label) + '</span>' +
    '<span class="pal-meta">' + esc(it.meta) + '</span></button>').join('') : '<div class="palette-empty">Nada encontrado.</div>';
  list.dataset.items = JSON.stringify(items.map((i) => i.label));
  window.__paletteItems = items;
}
function openPalette() {
  const o = $('#paletteOverlay');
  if (!o) return;
  o.hidden = false;
  paletteIndex = 0;
  const input = $('#paletteInput');
  if (input) { input.value = ''; setTimeout(() => input.focus(), 30); }
  renderPalette('');
}
function closePalette() { const o = $('#paletteOverlay'); if (o) o.hidden = true; }
function runPaletteItem(i) {
  const items = window.__paletteItems || [];
  const item = items[i];
  if (!item) return;
  closePalette();
  item.run();
}
function bindPalette() {
  const input = $('#paletteInput');
  if (input) {
    input.addEventListener('input', () => { paletteIndex = 0; renderPalette(input.value); });
    input.addEventListener('keydown', (e) => {
      const items = window.__paletteItems || [];
      if (e.key === 'ArrowDown') { e.preventDefault(); paletteIndex = Math.min(items.length - 1, paletteIndex + 1); renderPalette(input.value); }
      if (e.key === 'ArrowUp') { e.preventDefault(); paletteIndex = Math.max(0, paletteIndex - 1); renderPalette(input.value); }
      if (e.key === 'Enter') { e.preventDefault(); runPaletteItem(paletteIndex); }
      if (e.key === 'Escape') closePalette();
    });
  }
  const list = $('#paletteList');
  if (list) list.addEventListener('click', (e) => {
    const b = e.target.closest('.palette-item');
    if (b) runPaletteItem(Number(b.dataset.i));
  });
  $('#paletteOverlay') && $('#paletteOverlay').addEventListener('click', (e) => { if (e.target.id === 'paletteOverlay') closePalette(); });
  $('#btnPalette') && $('#btnPalette').addEventListener('click', openPalette);
  $('#navPaletteBtn') && $('#navPaletteBtn').addEventListener('click', openPalette);
}

/* ============ 8. HOJE ============ */
function renderHoje() {
  const h = new Date().getHours();
  const greet = h < 6 ? 'Boa madrugada' : h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  const name = (state.session && state.session.name) || 'Geekie';
  const k = $('#hojeKicker'); if (k) k.textContent = greet + ' · ' + new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const g = $('#hojeGreeting'); if (g) g.textContent = greet + ', ' + name + '.';
  const today = state.focusByDate[dateKey()] || 0;
  const goal = 60;
  const sub = $('#hojeSub');
  if (sub) sub.textContent = (today >= goal ? 'Meta diária batida — ' + fmtMinutes(today) + ' de foco. Continue se quiser.' : 'Faltam ' + fmtMinutes(Math.max(0, goal - today)) + ' para bater a meta de hoje.') + ' · foguinho x' + streakTier().mult + ' XP.';
  const focus = $('#hojeFocus'); if (focus) focus.textContent = fmtMinutes(today);
  const gt = $('#hojeGoalText'); if (gt) gt.textContent = goal + 'min';
  const ring = $('#hojeGoalRing');
  if (ring) ring.style.strokeDashoffset = String(415 * (1 - clamp(today / goal, 0, 1)));
  const due = dueCards().length;
  const tier = streakTier();
  const missions = todayMissionList();
  const missionsDone = missions.filter((m) => missionClaimed(m.id)).length;
  const cards = [
    { label: 'Foguinho', value: computeStreak() + ' dias', sub: tier.name + ' · x' + tier.mult + ' XP', icon: 'fa-fire' },
    { label: 'Foco esta semana', value: fmtMinutes(weekFocus()), sub: 'hoje: ' + fmtMinutes(today), icon: 'fa-clock' },
    { label: 'Missões de hoje', value: missionsDone + '/' + missions.length, sub: 'rendem moedas e XP', icon: 'fa-flag-checkered' },
    { label: 'Cards devidos', value: due, sub: Object.keys(state.decks).length + ' baralhos', icon: 'fa-clone' }
  ];
  const cardsBox = $('#hojeCards');
  if (cardsBox) cardsBox.innerHTML = cards.map((c) => '<div class="stat-card"><span class="sc-label"><i class="fa-solid ' + c.icon + '"></i> ' + c.label + '</span><b class="sc-value">' + esc(c.value) + '</b><span class="sc-sub">' + esc(c.sub) + '</span></div>').join('');
  const nextGoals = $('#hojeNextGoals');
  if (nextGoals) {
    const list = state.goals.filter((x) => !x.done).sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999')).slice(0, 4);
    nextGoals.innerHTML = list.length ? list.map((g2) => '<div class="list-item"><button class="btn btn-icon btn-ghost btn-sm" data-goal-toggle="' + g2.id + '" type="button" aria-label="Concluir"><i class="fa-regular fa-circle"></i></button>' +
      '<div class="li-main"><span class="li-title">' + esc(g2.text) + '</span><span class="li-sub">' + esc(g2.subject || 'Geral') + (g2.due ? ' · ' + esc(prettyDate(g2.due)) : '') + '</span></div></div>').join('') : '<div class="empty"><i class="fa-solid fa-seedling"></i>Nenhuma meta aberta. Crie a primeira na aba Metas.</div>';
  }
  const dueBox = $('#hojeDueCards');
  if (dueBox) {
    const decks = Object.keys(state.decks);
    dueBox.innerHTML = decks.map((d) => {
      const n = dueCards(d).length;
      return '<div class="list-item"><i class="fa-solid fa-layer-group" style="color:var(--primary)"></i><div class="li-main"><span class="li-title">' + esc(d) + '</span><span class="li-sub">' + n + ' para revisar · ' + (state.decks[d] || []).length + ' cards</span></div>' +
        '<button class="btn btn-secondary btn-sm" type="button" data-deck="' + esc(d) + '">revisar</button></div>';
    }).join('') || '<div class="empty">Nenhum baralho.</div>';
  }
  const plan = state.planner[dateKey()] || {};
  const planBox = $('#hojePlan');
  if (planBox) {
    const blocks = Object.keys(plan).filter((k2) => plan[k2]).sort();
    planBox.innerHTML = blocks.length ? blocks.map((k2) => '<div class="list-item"><span class="badge">' + esc(k2) + '</span><div class="li-main"><span class="li-title">' + esc(plan[k2]) + '</span></div></div>').join('') : '<div class="empty"><i class="fa-solid fa-calendar-day"></i>Nada planejado para hoje. Abra o Planner e preencha seus blocos.</div>';
  }
  const quick = $('#hojeQuick');
  if (quick) {
    const tiles = [
      { id: 'timer', icon: 'fa-play', label: 'Iniciar foco', sub: 'pomodoro 25min' },
      { id: 'flashcards', icon: 'fa-clone', label: 'Revisar cards', sub: due + ' devidos' },
      { id: 'quiz', icon: 'fa-brain', label: 'Quiz rápido', sub: '5 perguntas' },
      { id: 'notes', icon: 'fa-note-sticky', label: 'Nova nota', sub: 'escrever' },
      { id: 'diary', icon: 'fa-book', label: 'Diário', sub: 'registrar o dia' },
      { id: 'stats', icon: 'fa-chart-simple', label: 'Estatísticas', sub: 'ver evolução' }
    ];
    quick.innerHTML = tiles.map((t) => '<button class="quick-tile" type="button" data-goto="' + t.id + '"><i class="fa-solid ' + t.icon + '"></i>' + esc(t.label) + '<span>' + esc(t.sub) + '</span></button>').join('');
  }
  renderStreakPanel();
  renderDailyMissions();
}
function weekFocus() {
  let total = 0;
  for (let i = 0; i < 7; i++) total += state.focusByDate[dateKey(addDays(new Date(), -i))] || 0;
  return total;
}

/* ============ 8-B. GAMIFICAÇÃO: FOGUINHO, ESCUDOS E MISSÕES ============ */
const SHIELD_COST = 90;
const CHECKIN_MILESTONES = [7, 14, 30, 60, 100];
const MISSION_POOL = [
  { id: 'checkin', label: 'Fazer o check-in do dia', icon: 'fa-fire-flame-curved', goal: 1, unit: 'check-in', xp: 10, coins: 4, value: () => (checkinDone() ? 1 : 0) },
  { id: 'focus20', label: 'Estudar 20 minutos', icon: 'fa-hourglass-half', goal: 20, unit: 'min', xp: 15, coins: 5, value: () => Math.floor(todayFocusLive()) },
  { id: 'focus45', label: 'Estudar 45 minutos', icon: 'fa-clock', goal: 45, unit: 'min', xp: 30, coins: 10, value: () => Math.floor(todayFocusLive()) },
  { id: 'cards8', label: 'Revisar 8 flashcards', icon: 'fa-clone', goal: 8, unit: 'cards', xp: 15, coins: 5, value: () => state.dailyStats.cards || 0 },
  { id: 'quiz3', label: 'Acertar 3 questões do quiz', icon: 'fa-brain', goal: 3, unit: 'acertos', xp: 15, coins: 5, value: () => state.dailyStats.quiz || 0 },
  { id: 'goal1', label: 'Concluir 1 meta', icon: 'fa-list-check', goal: 1, unit: 'meta', xp: 12, coins: 5, value: () => state.dailyStats.goals || 0 },
  { id: 'clicks120', label: 'Dar 120 cliques no núcleo', icon: 'fa-hand-pointer', goal: 120, unit: 'cliques', xp: 12, coins: 4, value: () => state.dailyStats.clicks || 0 },
  { id: 'notes1', label: 'Salvar 1 nota ou diário', icon: 'fa-note-sticky', goal: 1, unit: 'registro', xp: 10, coins: 3, value: () => state.dailyStats.notes || 0 }
];
/* Contadores do dia (zerados na virada da data local). */
function ensureDailyStats() {
  const today = dateKey();
  if (!state.dailyStats || state.dailyStats.date !== today) {
    state.dailyStats = Object.assign({}, DEFAULT_STATE.dailyStats, { date: today });
  }
}
function dailyBump(key, n = 1) {
  ensureDailyStats();
  state.dailyStats[key] = (state.dailyStats[key] || 0) + n;
}
function dailyValue(key) {
  ensureDailyStats();
  return state.dailyStats[key] || 0;
}
/* Três missões por dia, escolhidas de forma determinística pela data. */
function todayMissionList() {
  let seed = 0;
  const key = dateKey();
  for (let i = 0; i < key.length; i++) seed = (seed * 31 + key.charCodeAt(i) + i) % 9973;
  const pool = MISSION_POOL.slice();
  const out = [];
  for (let i = 0; i < 3 && pool.length; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    out.push(pool.splice(seed % pool.length, 1)[0]);
  }
  return out;
}
function missionClaimId(id) { return dateKey() + ':' + id; }
function missionClaimed(id) { return state.missionClaims.includes(missionClaimId(id)); }
function claimMission(id) {
  const m = todayMissionList().find((x) => x.id === id);
  if (!m) return;
  if (missionClaimed(id)) return toast('Missão já resgatada hoje.', 'fa-circle-check');
  if (m.value() < m.goal) return toast('Ainda falta progresso nessa missão.', 'fa-triangle-exclamation', true);
  state.missionClaims.push(missionClaimId(id));
  state.missionClaims = state.missionClaims.slice(-80);
  dailyBump('missions', 1);
  const xp = addXp(m.xp);
  addCoins(m.coins);
  renderDailyMissions();
  renderStreakPanel();
  toast('Missão concluída: +' + xp + ' XP e +' + m.coins + ' moedas.', 'fa-flag-checkered');
  save();
}
function renderDailyMissions() {
  const box = $('#dailyMissions');
  if (!box) return;
  const list = todayMissionList();
  const claimedCount = list.filter((m) => missionClaimed(m.id)).length;
  const badge = $('#dailyMissionCount');
  if (badge) badge.textContent = claimedCount + '/' + list.length;
  box.innerHTML = list.map((m) => {
    const value = Math.min(m.value(), m.goal);
    const pct = Math.round((value / m.goal) * 100);
    const done = value >= m.goal;
    const claimed = missionClaimed(m.id);
    return '<div class="mission' + (claimed ? ' claimed' : done ? ' ready' : '') + '">' +
      '<span class="mission-icon"><i class="fa-solid ' + m.icon + '"></i></span>' +
      '<div class="mission-main"><span class="mission-title">' + esc(m.label) + '</span>' +
      '<div class="mission-track"><span style="width:' + pct + '%"></span></div>' +
      '<span class="mission-sub">' + value + '/' + m.goal + ' ' + esc(m.unit) + ' · +' + m.xp + ' XP · +' + m.coins + ' moedas</span></div>' +
      '<button class="btn btn-sm ' + (done && !claimed ? 'btn-primary' : 'btn-secondary') + '" type="button" data-mission="' + m.id + '"' + (claimed || !done ? ' disabled' : '') + '>' +
      (claimed ? 'resgatada' : done ? 'resgatar' : 'em curso') + '</button></div>';
  }).join('');
}
/* Recompensa do check-in cresce com a sequência. */
function checkinReward(streak) {
  const s = typeof streak === 'number' ? streak : computeStreak();
  return { xp: clamp(12 + s * 2, 12, 40), coins: clamp(4 + Math.floor(s / 3) * 2, 4, 14) };
}
function checkinMilestoneBonus(streak) {
  if (!CHECKIN_MILESTONES.includes(streak)) return null;
  return { xp: streak * 4, coins: streak * 2 };
}
function renderStreakPanel() {
  const box = $('#streakPanel');
  if (!box) return;
  const streak = computeStreak();
  const tier = streakTier(streak);
  const next = nextStreakTier(streak);
  const shields = state.streakShields || 0;
  const done = checkinDone();
  const live = todayFocusLive();
  const goal = 60;
  const pct = Math.round(clamp(live / goal, 0, 1) * 100);
  box.innerHTML = '<div class="streak-panel-head">' +
    '<span class="streak-flame"><i class="fa-solid ' + tier.icon + '"></i></span>' +
    '<div class="streak-panel-copy"><span class="kicker">Foguinho</span><b>' + streak + ' dia(s) · ' + esc(tier.name) + '</b>' +
    '<span class="streak-panel-sub">Multiplicador x' + tier.mult + ' em todo XP' + (next ? ' · faltam ' + (next.days - streak) + ' dia(s) para x' + next.mult : ' · faixa máxima') + '</span></div>' +
    '<span class="streak-mult big">x' + tier.mult + '</span></div>' +
    '<div class="streak-goal"><div class="progress"><span style="width:' + pct + '%"></span></div>' +
    '<span class="status-text">' + fmtMinutes(live) + ' de ' + goal + ' min hoje</span></div>' +
    '<div class="streak-actions">' +
    (done ? '<span class="badge"><i class="fa-solid fa-circle-check"></i> check-in feito</span>' :
      '<button class="btn btn-primary btn-sm" type="button" data-daily-checkin><i class="fa-solid fa-fire-flame-curved"></i> Check-in de hoje</button>') +
    '<button class="btn btn-secondary btn-sm" type="button" data-buy-shield><i class="fa-solid fa-shield-halved"></i> Escudo (' + SHIELD_COST + ' moedas)</button>' +
    '<span class="badge" title="Um escudo protege um único dia sem foco e sem check-in">' + shields + '/5 escudos</span></div>';
}
function buyStreakShield() {
  if ((state.streakShields || 0) >= 5) return toast('Você já tem o limite de 5 escudos.', 'fa-shield-halved');
  if (state.coins < SHIELD_COST) return toast('Faltam ' + (SHIELD_COST - state.coins) + ' moedas.', 'fa-triangle-exclamation', true);
  state.coins -= SHIELD_COST;
  state.streakShields = (state.streakShields || 0) + 1;
  saveNow();
  renderTopbar(); renderStreakPanel(); renderJourney();
  if (state.currentTab === 'stats') renderStats();
  toast('Escudo comprado: sua sequência está protegida.', 'fa-shield-halved');
}
/* Consome um escudo quando ontem ficou sem foco e sem check-in. */
function applyStreakShield() {
  if (!(state.streakShields > 0) || !state.streakBest) return;
  const y = dateKey(addDays(new Date(), -1));
  const before = dateKey(addDays(new Date(), -2));
  if (dayIsActive(y) || !dayIsActive(before)) return;
  state.streakProtect[y] = Date.now();
  state.streakShields -= 1;
  state.shieldsUsed = (state.shieldsUsed || 0) + 1;
  saveNow();
  setTimeout(() => toast('Escudo usado: ontem foi protegido e a sequência continua.', 'fa-shield-halved'), 900);
}
function bindGamification() {
  document.addEventListener('click', (e) => {
    const m = e.target.closest('[data-mission]');
    if (m) { claimMission(m.dataset.mission); return; }
    if (e.target.closest('[data-daily-checkin]')) { doDailyCheckin(); return; }
    if (e.target.closest('[data-buy-shield]')) { buyStreakShield(); return; }
  });
}

/* ============ 9. CHAT IA ============ */
const CHAT_MODES = {
  explain: 'Clareza, exemplo e uma checagem final.',
  solve: 'Passos numerados com conferência de unidades.',
  quiz: 'Perguntas curtas para fixar.',
  summary: 'Resumo em tópicos com o essencial.',
  review: 'Foco no ponto onde o raciocínio quebra.'
};
const SUBJECT_TIPS = {
  matemática: ['Confira sinal, domínio e unidades.', 'Teste a fórmula com um caso simples antes de generalizar.'],
  física: ['Separe dados, incógnita e unidades antes de calcular.', 'Verifique a ordem de grandeza do resultado.'],
  química: ['Balanceie a equação antes de usar proporções.', 'Atenção a mols, massa molar e condições de pressão.'],
  biologia: ['Ligue estrutura à função e ao processo.', 'Use exemplos concretos para fixar o mecanismo.'],
  português: ['Identifique função sintática antes de classificar.', 'Leia o enunciado buscando o comando da questão.'],
  história: ['Contexto econômico e social explica a causa.', 'Diferencie causa, consequência e permanência.'],
  geografia: ['Cruze escala, localização e processo.', 'Relacione o fenômeno ao clima e à economia.'],
  inglês: ['Observe tempo verbal e conectores.', 'Traduza por blocos, não palavra por palavra.']
};
function tutorReply(question, mode, subject) {
  const q = String(question || '').trim() || 'o conteúdo anexado';
  const subj = String(subject || '').trim();
  const lower = q.toLowerCase();
  const lines = [];
  const intro = {
    explain: 'Vou explicar do começo, sem pular etapas.',
    solve: 'Vamos resolver passo a passo.',
    quiz: 'Transformei o tema em perguntas de revisão.',
    summary: 'Resumo do essencial:',
    review: 'Vamos localizar onde o raciocínio quebra.'
  }[mode] || 'Vamos entender isso juntos.';
  lines.push(intro);
  if (subj) lines.push('Matéria: ' + subj + '.');
  if (mode === 'quiz') {
    lines.push('');
    lines.push('1. O que é "' + q + '", em uma frase, sem consultar?');
    lines.push('2. Dê um exemplo e um contraexemplo.');
    lines.push('3. Onde isso aparece em prova?');
    lines.push('4. Explique em voz alta em 30 segundos.');
    lines.push('');
    lines.push('Responda uma por vez que eu comento cada tentativa.');
  } else if (mode === 'solve') {
    lines.push('');
    lines.push('Passo 1 — Liste dados, incógnita e unidades.');
    lines.push('Passo 2 — Escolha a relação que conecta dados ao pedido.');
    lines.push('Passo 3 — Substitua e resolva por partes, mantendo unidades.');
    lines.push('Passo 4 — Confira ordem de grandeza e plausibilidade.');
    lines.push('');
    lines.push('Me mande os números do enunciado que eu acompanho a conta com você.');
  } else if (mode === 'summary') {
    lines.push('');
    lines.push('• Ideia central: ' + q + '.');
    lines.push('• Para memorizar: definição curta + uma fórmula ou exemplo.');
    lines.push('• O que cai: aplicação direta e comparação de casos.');
    lines.push('• Próximo passo: transforme isso em 3 flashcards (dá para fazer pelo botão abaixo).');
  } else if (mode === 'review') {
    lines.push('');
    lines.push('Separe a resolução em três partes: interpretação, método e conta.');
    lines.push('1. A pergunta foi lida com todas as condições e unidades?');
    lines.push('2. O método vale para esse caso ou é um atalho que não se aplica?');
    lines.push('3. A conta final respeita sinais, casas e unidades?');
    lines.push('');
    lines.push('Diga em qual parte você tem menos certeza e eu detalho só ela.');
  } else {
    lines.push('');
    lines.push('1) O que é: ' + q + ' em uma frase simples.');
    lines.push('2) Por que existe: qual problema essa ideia resolve.');
    lines.push('3) Como se usa: um exemplo concreto, com os passos.');
    lines.push('4) Checagem: resolva um caso simples sozinho e compare.');
    lines.push('');
    lines.push('Diga onde travou que eu abro só aquele ponto.');
  }
  const tipKey = Object.keys(SUBJECT_TIPS).find((k) => (subj + ' ' + lower).toLowerCase().includes(k));
  if (tipKey) { lines.push(''); lines.push('Dica de ' + tipKey + ': ' + SUBJECT_TIPS[tipKey][0]); }
  if (/enem|vestibular|prova/.test(lower)) { lines.push('Dica de prova: marque as palavras-chave do enunciado antes de calcular.'); }
  if (/foto|imagem|anex/.test(lower)) { lines.push('Sobre a imagem: descreva o enunciado em texto para eu seguir com o raciocínio.'); }
  lines.push('');
  lines.push('— Tutor local Geekie (offline; não substitui o professor).');
  return lines.join('\n');
}
function chatHistory() { return Array.isArray(state.chatHistory) ? state.chatHistory : []; }
function renderChat() {
  const box = $('#chatMessages');
  if (!box) return;
  const list = chatHistory();
  if (!list.length) {
    box.innerHTML = '<div class="empty"><i class="fa-solid fa-wand-magic-sparkles"></i>Escolha um modo, escreva sua pergunta ou cole um enunciado. O tutor funciona sem internet.</div>';
  } else {
    box.innerHTML = list.map((m, i) => {
      const mine = m.role === 'user';
      return '<div class="chat-message ' + (mine ? 'user' : 'assistant') + '">' +
        '<div class="chat-avatar"><i class="fa-solid ' + (mine ? 'fa-user' : 'fa-wand-magic-sparkles') + '"></i></div>' +
        '<div><div class="chat-bubble">' + esc(m.content) + '</div>' +
        (mine ? '' : '<div class="chat-msg-tools"><button type="button" data-chat-act="copy" data-i="' + i + '"><i class="fa-solid fa-copy"></i> copiar</button>' +
          '<button type="button" data-chat-act="note" data-i="' + i + '"><i class="fa-solid fa-note-sticky"></i> nota</button>' +
          '<button type="button" data-chat-act="card" data-i="' + i + '"><i class="fa-solid fa-clone"></i> card</button></div>') +
        '</div></div>';
    }).join('');
    box.scrollTop = box.scrollHeight;
  }
  const mode = ($('#chatStudyMode') || {}).value || 'explain';
  const help = $('#chatModeHelp');
  if (help) help.textContent = CHAT_MODES[mode] || CHAT_MODES.explain;
  const subjSelect = $('#chatSubject');
  if (subjSelect && !subjSelect.value) subjSelect.value = '';
  renderChatFollowUps();
}
function renderChatFollowUps() {
  const box = $('#chatFollowUps');
  if (!box) return;
  const list = [
    { label: 'Dê um exemplo', text: 'Dê um exemplo prático e um contraexemplo sobre: ' },
    { label: 'Ficou confuso', text: 'Explique de outro jeito, com analogia, sobre: ' },
    { label: 'Testar agora', text: 'Me faça 3 perguntas difíceis sobre: ' },
    { label: 'Salvar como card', text: '' }
  ];
  box.innerHTML = list.map((f) => '<button class="chip" type="button" data-follow="' + esc(f.text) + '">' + esc(f.label) + '</button>').join('');
}
function chatStatus(msg, isError) {
  const el = $('#chatStatus');
  if (!el) return;
  el.textContent = msg || '';
  el.classList.toggle('error', !!isError);
}
function appendChatMessage(role, content) {
  const box = $('#chatMessages');
  if (!box) return;
  const empty = $('.empty', box);
  if (empty) empty.remove();
  const item = document.createElement('div');
  item.className = 'chat-message ' + (role === 'user' ? 'user' : 'assistant');
  item.innerHTML = '<div class="chat-avatar"><i class="fa-solid ' + (role === 'user' ? 'fa-user' : 'fa-wand-magic-sparkles') + '"></i></div>' +
    '<div><div class="chat-bubble">' + esc(content) + '</div></div>';
  box.appendChild(item);
  box.scrollTop = box.scrollHeight;
}
function sendChat() {
  const input = $('#chatInput');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  const mode = ($('#chatStudyMode') || {}).value || 'explain';
  const subject = ($('#chatSubject') || {}).value || '';
  state.chatHistory.push({ role: 'user', content: text, at: Date.now() });
  state.chatHistory = state.chatHistory.slice(-80);
  appendChatMessage('user', text);
  input.value = '';
  save();
  chatStatus('A Geekie está organizando a resposta…');
  const reply = tutorReply(text, mode, subject);
  const btn = $('#chatSendBtn');
  if (btn) btn.disabled = true;
  const wrap = document.createElement('div');
  wrap.className = 'chat-message assistant';
  wrap.innerHTML = '<div class="chat-avatar"><i class="fa-solid fa-wand-magic-sparkles"></i></div><div><div class="chat-bubble"><span class="typing-dots"><i></i><i></i><i></i></span></div></div>';
  const box = $('#chatMessages');
  if (box) { box.appendChild(wrap); box.scrollTop = box.scrollHeight; }
  const bubble = $('.chat-bubble', wrap);
  let i = 0;
  const timer = setInterval(() => {
    i = Math.min(reply.length, i + 6);
    if (bubble) bubble.textContent = reply.slice(0, i);
    if (box) box.scrollTop = box.scrollHeight;
    if (i >= reply.length) {
      clearInterval(timer);
      state.chatHistory.push({ role: 'assistant', content: reply, at: Date.now() });
      state.chatHistory = state.chatHistory.slice(-80);
      save(); renderChat(); addXp(2);
      chatStatus('Pronto. Continue a conversa quando quiser.');
      if (btn) btn.disabled = false;
      beep(720, 0.08, 'sine', 0.05);
    }
  }, 16);
}
function bindChat() {
  renderChat();
  const form = $('#chatForm');
  if (form) form.addEventListener('submit', (e) => { e.preventDefault(); sendChat(); });
  const input = $('#chatInput');
  if (input) input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } });
  const mode = $('#chatStudyMode');
  if (mode) mode.addEventListener('change', () => { const h = $('#chatModeHelp'); if (h) h.textContent = CHAT_MODES[mode.value] || CHAT_MODES.explain; });
  $('#chatQuickPrompts') && $('#chatQuickPrompts').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    const ta = $('#chatInput'); if (!ta) return;
    ta.value = chip.dataset.prompt || '';
    ta.focus();
  });
  $('#chatFollowUps') && $('#chatFollowUps').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    if (!chip.dataset.follow) {
      const last = chatHistory().slice().reverse().find((m) => m.role === 'assistant');
      if (last) chatToFlashcard(last.content);
      return;
    }
    const ta = $('#chatInput'); if (!ta) return;
    ta.value = (chip.dataset.follow || '') + (ta.value || '');
    ta.focus();
  });
  $('#chatMessages') && $('#chatMessages').addEventListener('click', (e) => {
    const b = e.target.closest('[data-chat-act]');
    if (!b) return;
    const msg = chatHistory()[Number(b.dataset.i)];
    if (!msg) return;
    if (b.dataset.chatAct === 'copy') copyText(msg.content).then((ok) => toast(ok ? 'Resposta copiada.' : 'Não foi possível copiar.', ok ? 'fa-copy' : 'fa-triangle-exclamation', !ok));
    if (b.dataset.chatAct === 'note') chatToNote(msg.content);
    if (b.dataset.chatAct === 'card') chatToFlashcard(msg.content);
  });
  $('#chatClearBtn') && $('#chatClearBtn').addEventListener('click', () => {
    if (!state.chatHistory.length) return toast('A conversa já está vazia.', 'fa-broom');
    if (!confirm('Limpar toda a conversa?')) return;
    state.chatHistory = []; save(); renderChat(); toast('Conversa limpa.', 'fa-broom');
  });
  $('#chatExportBtn') && $('#chatExportBtn').addEventListener('click', () => {
    if (!state.chatHistory.length) return toast('Nada para exportar.', 'fa-triangle-exclamation', true);
    const txt = chatHistory().map((m) => (m.role === 'user' ? '### Você\n' : '### Geekie\n') + m.content).join('\n\n');
    download('geekie-conversa.md', '# Conversa com o tutor Geekie\n\n' + txt, 'text/markdown;charset=utf-8');
    toast('Conversa exportada.', 'fa-download');
  });
}
function chatToNote(content) {
  const id = uid();
  const firstLine = String(content).split('\n').find((l) => l.trim()) || 'Nota do tutor';
  state.notes[id] = { title: 'Tutor: ' + firstLine.slice(0, 48), content: content, tags: 'tutor,ia', updatedAt: Date.now(), pinned: false };
  state.noteOrder.unshift(id);
  state.currentNote = id;
  save(); renderNotes(); toast('Resposta salva em Notas.', 'fa-note-sticky');
}
function chatToFlashcard(content) {
  const question = (chatHistory().slice().reverse().find((m) => m.role === 'user') || {}).content || 'Resumo do tutor';
  const deck = state.deck;
  state.decks[deck] = state.decks[deck] || [];
  state.decks[deck].push({ id: uid(), q: question.slice(0, 160), a: content, ease: 2.5, interval: 0, due: '', reps: 0, lapses: 0, createdAt: Date.now() });
  save(); renderFlashcards(); toast('Card criado em "' + deck + '".', 'fa-clone');
}
/* ============================================================
   Geekie Study Hub v20.1.0 — script.js (parte 2/4)
   Notas, Pomodoro, Metas, Flashcards, Quiz, Matérias, Planner
   ============================================================ */

/* ============ 10. NOTAS ============ */
let noteSaveTimer = null;
function renderNotes() {
  const list = $('#noteList');
  if (!list) return;
  const query = (($('#noteSearch') || {}).value || '').toLowerCase().trim();
  const ids = state.noteOrder.slice();
  if (!ids.length && Object.keys(state.notes).length) ids.push.apply(ids, Object.keys(state.notes));
  const rows = ids.map((id) => state.notes[id] ? { id, ...state.notes[id] } : null).filter(Boolean)
    .filter((n) => !query || ((n.title || '') + ' ' + (n.content || '') + ' ' + (n.tags || '')).toLowerCase().includes(query))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || (b.updatedAt || 0) - (a.updatedAt || 0));
  list.innerHTML = rows.length ? rows.map((n) => '<button class="note-item' + (n.id === state.currentNote ? ' active' : '') + '" type="button" data-note="' + n.id + '">' +
    '<span class="note-item-title">' + (n.pinned ? '<i class="fa-solid fa-thumbtack"></i>' : '') + esc(n.title || 'Sem título') + '</span>' +
    '<span class="note-item-meta">' + esc((n.tags || '').split(',').filter(Boolean).slice(0, 2).join(' · ') || 'sem tags') + ' · ' + ((n.content || '').length) + ' car.</span></button>').join('')
    : '<div class="empty"><i class="fa-solid fa-note-sticky"></i>Nenhuma nota' + (query ? ' com esse filtro' : '') + '.</div>';
  if (state.currentNote && state.notes[state.currentNote]) loadNote(state.currentNote);
  updateNoteCounter();
}
function loadNote(id) {
  const n = state.notes[id];
  if (!n) return;
  const t = $('#noteTitleInput'); if (t) t.value = n.title || '';
  const c = $('#noteContentInput'); if (c) c.value = n.content || '';
  const tags = $('#noteTagsInput'); if (tags) tags.value = n.tags || '';
  const status = $('#noteStatus'); if (status) status.textContent = 'Editando: ' + (n.title || 'Sem título');
  state.currentNote = id;
  const pin = $('#notePinBtn'); if (pin) pin.classList.toggle('active', !!n.pinned);
}
function updateNoteCounter() {
  const content = ($('#noteContentInput') || {}).value || '';
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const el = $('#noteCounter');
  if (el) el.textContent = words + ' palavras · ' + content.length + ' caracteres';
}
function newNote() {
  const id = uid();
  state.notes[id] = { title: '', content: '', tags: '', pinned: false, updatedAt: Date.now() };
  state.noteOrder.unshift(id);
  state.currentNote = id;
  save(); renderNotes();
  $('#noteTitleInput') && $('#noteTitleInput').focus();
  toast('Nova nota criada.', 'fa-plus');
}
function saveNote(silent) {
  let id = state.currentNote;
  const title = ($('#noteTitleInput') || {}).value || '';
  const content = ($('#noteContentInput') || {}).value || '';
  const tags = ($('#noteTagsInput') || {}).value || '';
  if (!title.trim() && !content.trim()) { if (!silent) toast('Escreva algo antes de salvar.', 'fa-triangle-exclamation', true); return; }
  if (!id || !state.notes[id]) {
    id = uid(); state.noteOrder.unshift(id);
    state.notes[id] = { pinned: false };
  }
  state.notes[id] = Object.assign({}, state.notes[id], { title: title.trim() || 'Sem título', content, tags, updatedAt: Date.now() });
  state.currentNote = id;
  if (!silent) dailyBump('notes', 1);
  save();
  if (silent) { renderNotes(); return; }
  renderNotes();
  const status = $('#noteStatus'); if (status) status.textContent = 'Salvo às ' + new Date().toLocaleTimeString('pt-BR');
  addXp(2, true);
  toast('Nota salva.', 'fa-floppy-disk');
}
function deleteNote() {
  const id = state.currentNote;
  if (!id || !state.notes[id]) return toast('Nenhuma nota selecionada.', 'fa-triangle-exclamation', true);
  if (!confirm('Excluir esta nota? Não dá para desfazer.')) return;
  delete state.notes[id];
  state.noteOrder = state.noteOrder.filter((n) => n !== id);
  state.currentNote = state.noteOrder[0] || null;
  const t = $('#noteTitleInput'); if (t) t.value = '';
  const c = $('#noteContentInput'); if (c) c.value = '';
  const tg = $('#noteTagsInput'); if (tg) tg.value = '';
  save(); renderNotes(); toast('Nota excluída.', 'fa-trash');
}
function bindNotes() {
  renderNotes();
  $('#noteSearch') && $('#noteSearch').addEventListener('input', debounce(renderNotes, 130));
  $('#noteList') && $('#noteList').addEventListener('click', (e) => {
    const b = e.target.closest('[data-note]');
    if (!b) return;
    state.currentNote = b.dataset.note; save(); renderNotes();
  });
  $('#noteNewBtn') && $('#noteNewBtn').addEventListener('click', newNote);
  $('#noteSaveBtn') && $('#noteSaveBtn').addEventListener('click', () => saveNote(false));
  $('#noteCopyBtn') && $('#noteCopyBtn').addEventListener('click', () => {
    const text = ($('#noteContentInput') || {}).value || '';
    if (!text.trim()) return toast('Nada para copiar.', 'fa-triangle-exclamation', true);
    copyText(text).then((ok) => toast(ok ? 'Nota copiada.' : 'Não foi possível copiar.', ok ? 'fa-copy' : 'fa-triangle-exclamation', !ok));
  });
  $('#noteExportBtn') && $('#noteExportBtn').addEventListener('click', () => {
    const title = (($('#noteTitleInput') || {}).value || 'nota').trim() || 'nota';
    const content = ($('#noteContentInput') || {}).value || '';
    if (!content.trim()) return toast('Nada para exportar.', 'fa-triangle-exclamation', true);
    download(title.toLowerCase().replace(/[^a-z0-9]+/gi, '-') + '.md', '# ' + title + '\n\n' + content, 'text/markdown;charset=utf-8');
    toast('Arquivo .md gerado.', 'fa-file-arrow-down');
  });
  $('#noteDeleteBtn') && $('#noteDeleteBtn').addEventListener('click', deleteNote);
  $('#noteDuplicateBtn') && $('#noteDuplicateBtn').addEventListener('click', () => {
    const id = state.currentNote;
    if (!id || !state.notes[id]) return toast('Nenhuma nota selecionada.', 'fa-triangle-exclamation', true);
    const src = state.notes[id];
    const copyId = uid();
    state.notes[copyId] = Object.assign({}, src, { title: (src.title || 'Sem título') + ' (cópia)', pinned: false, updatedAt: Date.now() });
    state.noteOrder.unshift(copyId);
    state.currentNote = copyId;
    save(); renderNotes();
    toast('Nota duplicada.', 'fa-clone');
  });
  $('#notePinBtn') && $('#notePinBtn').addEventListener('click', () => {
    const id = state.currentNote;
    if (!id || !state.notes[id]) return toast('Nenhuma nota selecionada.', 'fa-triangle-exclamation', true);
    state.notes[id].pinned = !state.notes[id].pinned;
    save(); renderNotes();
    toast(state.notes[id].pinned ? 'Nota fixada no topo.' : 'Nota desafixada.', 'fa-thumbtack');
  });
  const content = $('#noteContentInput');
  if (content) {
    content.addEventListener('input', () => {
      updateNoteCounter();
      clearTimeout(noteSaveTimer);
      noteSaveTimer = setTimeout(() => saveNote(true), 700);
    });
    content.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveNote(false); }
    });
  }
  ['#noteTitleInput', '#noteTagsInput'].forEach((sel) => {
    const el = $(sel);
    if (el) el.addEventListener('input', () => { clearTimeout(noteSaveTimer); noteSaveTimer = setTimeout(() => saveNote(true), 800); });
  });
}

/* ============ 11. POMODORO ============ */
const pomo = { running: false, endAt: 0, remaining: 25 * 60, total: 25 * 60, mode: 'focus' };
function pomoDuration(mode) {
  const cfg = state.pomoConfig;
  return (mode === 'focus' ? cfg.focus : mode === 'short' ? cfg.short : cfg.long) * 60;
}
function pomoSetMode(mode) {
  pomo.mode = mode;
  pomo.total = pomoDuration(mode);
  pomo.remaining = pomo.total;
  pomo.running = false;
  pomoRender();
  $$('#pomoModes .chip').forEach((c) => c.classList.toggle('active', c.dataset.mode === mode));
}
function pomoRender() {
  const time = $('#pomoTime');
  if (time) time.textContent = pad(Math.floor(pomo.remaining / 60)) + ':' + pad(pomo.remaining % 60);
  const label = $('#pomoLabel');
  if (label) label.textContent = pomo.mode === 'focus' ? 'Foco' : pomo.mode === 'short' ? 'Pausa curta' : 'Pausa longa';
  const ring = $('#pomoProgress');
  if (ring) {
    const circ = 603;
    ring.style.strokeDashoffset = String(circ * (1 - (pomo.total ? pomo.remaining / pomo.total : 0)));
  }
  const sess = $('#pomoSessions'); if (sess) sess.textContent = state.pomoSessions;
  const total = $('#pomoTotalFocus'); if (total) total.textContent = fmtMinutes(state.focusByDate[dateKey()] || 0);
  const cyc = $('#pomoCycle'); if (cyc) cyc.textContent = state.pomoCycle;
  const start = $('#pomoStartBtn'); if (start) start.disabled = pomo.running;
  const pause = $('#pomoPauseBtn'); if (pause) pause.disabled = !pomo.running;
  if (!state.pomoRunning) document.title = state.pageTitle;
}
function pomoStart() {
  if (pomo.running) return;
  pomo.running = true;
  pomo.endAt = Date.now() + pomo.remaining * 1000;
  state.pomoRunning = true;
  save(); pomoRender();
  toast(pomo.mode === 'focus' ? 'Foco iniciado. Bom trabalho!' : 'Pausa iniciada.', 'fa-play');
}
function pomoPause() {
  if (!pomo.running) return;
  pomo.remaining = Math.max(0, Math.round((pomo.endAt - Date.now()) / 1000));
  pomo.running = false;
  state.pomoRunning = false;
  document.title = state.pageTitle;
  save(); pomoRender();
  toast('Ciclo pausado.', 'fa-pause');
}
function pomoReset() {
  pomo.running = false;
  state.pomoRunning = false;
  pomo.remaining = pomo.total;
  document.title = state.pageTitle;
  pomoRender();
  toast('Ciclo zerado.', 'fa-rotate-left');
}
function pomoComplete() {
  pomo.running = false;
  state.pomoRunning = false;
  beep(state.pomoConfig.sound ? 880 : 0, 0.2);
  if (pomo.mode === 'focus') {
    const minutes = Math.round(pomo.total / 60);
    state.pomoSessions += 1;
    state.pomoCycle = state.pomoCycle >= 4 ? 1 : state.pomoCycle + 1;
    addFocus(minutes, state.pomoConfig.subject);
    const goLong = state.pomoCycle === 1;
    toast('Foco concluído: +' + minutes * 2 + ' XP e +1 moeda.', 'fa-check');
    pomoSetMode(goLong ? 'long' : 'short');
    if (state.pomoConfig.autoBreak) setTimeout(() => { if (TAB_MAP[state.currentTab]) pomoStart(); }, 900);
  } else {
    toast('Pausa concluída. Hora de voltar ao foco.', 'fa-mug-hot');
    pomoSetMode('focus');
    if (state.pomoConfig.autoBreak) setTimeout(() => { if (TAB_MAP[state.currentTab]) pomoStart(); }, 900);
  }
  pomoRender();
  renderJourney();
}
function pomoBeat() {
  if (!pomo.running) return;
  pomo.remaining = Math.max(0, Math.round((pomo.endAt - Date.now()) / 1000));
  if (pomo.remaining <= 0) { pomoComplete(); return; }
  const time = $('#pomoTime');
  if (time) time.textContent = pad(Math.floor(pomo.remaining / 60)) + ':' + pad(pomo.remaining % 60);
  const ring = $('#pomoProgress');
  if (ring) ring.style.strokeDashoffset = String(603 * (1 - pomo.remaining / pomo.total));
  document.title = (pomo.mode === 'focus' ? '⏱ ' : '☕ ') + pad(Math.floor(pomo.remaining / 60)) + ':' + pad(pomo.remaining % 60) + ' · ' + state.pageTitle;
}
function renderTimer() {
  const cfg = state.pomoConfig;
  const f = $('#pomoCustomFocus'); if (f) f.value = cfg.focus;
  const b = $('#pomoCustomBreak'); if (b) b.value = cfg.short;
  const auto = $('#pomoAutoBreak'); if (auto) auto.checked = !!cfg.autoBreak;
  const snd = $('#pomoSound'); if (snd) snd.checked = !!cfg.sound;
  const subj = $('#pomoSubject');
  if (subj) {
    subj.innerHTML = '<option value="">Sem matéria</option>' + subjects().map((s) => '<option value="' + esc(s) + '"' + (cfg.subject === s ? ' selected' : '') + '>' + esc(s) + '</option>').join('');
  }
  if (!pomo.running && pomo.total === pomoDuration(pomo.mode)) pomo.remaining = pomoDuration(pomo.mode);
  if (!pomo.running) { pomo.total = pomoDuration(pomo.mode); pomo.remaining = pomo.total; }
  $$('#pomoModes .chip').forEach((c) => c.classList.toggle('active', c.dataset.mode === pomo.mode));
  pomoRender();
}
function bindPomodoro() {
  $$('#pomoModes [data-mode]').forEach((c) => c.addEventListener('click', () => pomoSetMode(c.dataset.mode)));
  $$('#pomoModes [data-preset]').forEach((c) => c.addEventListener('click', () => {
    const preset = c.dataset.preset;
    if (preset === '50') { state.pomoConfig.focus = 50; state.pomoConfig.short = 10; }
    if (preset === '90') { state.pomoConfig.focus = 90; state.pomoConfig.short = 15; }
    save(); pomoSetMode('focus'); renderTimer();
    toast('Ciclo ' + state.pomoConfig.focus + '/' + state.pomoConfig.short + ' configurado.', 'fa-sliders');
  }));
  $('#pomoStartBtn') && $('#pomoStartBtn').addEventListener('click', pomoStart);
  $('#pomoPauseBtn') && $('#pomoPauseBtn').addEventListener('click', pomoPause);
  $('#pomoResetBtn') && $('#pomoResetBtn').addEventListener('click', pomoReset);
  $('#pomoCustomFocus') && $('#pomoCustomFocus').addEventListener('change', (e) => {
    state.pomoConfig.focus = clamp(Number(e.target.value) || 25, 5, 90); save(); renderTimer();
  });
  $('#pomoCustomBreak') && $('#pomoCustomBreak').addEventListener('change', (e) => {
    state.pomoConfig.short = clamp(Number(e.target.value) || 5, 1, 30); save(); renderTimer();
  });
  $('#pomoAutoBreak') && $('#pomoAutoBreak').addEventListener('change', (e) => { state.pomoConfig.autoBreak = e.target.checked; save(); });
  $('#pomoSound') && $('#pomoSound').addEventListener('change', (e) => { state.pomoConfig.sound = e.target.checked; save(); });
  $('#pomoSubject') && $('#pomoSubject').addEventListener('change', (e) => { state.pomoConfig.subject = e.target.value; save(); });
  renderTimer();
  setInterval(pomoBeat, 1000);
}

/* ============ 12. METAS ============ */
let goalFilter = 'all';
let goalQuery = '';
let goalSort = 'due';
const PRIORITY_ORDER = { alta: 0, media: 1, baixa: 2 };
function renderGoals() {
  const box = $('#goalList');
  if (!box) return;
  const today = dateKey();
  const q = goalQuery.toLowerCase().trim();
  const list = state.goals.filter((g) => {
    if (q && !((g.text || '') + ' ' + (g.subject || '')).toLowerCase().includes(q)) return false;
    if (goalFilter === 'open') return !g.done;
    if (goalFilter === 'done') return g.done;
    if (goalFilter === 'late') return !g.done && g.due && g.due < today;
    return true;
  }).sort((a, b) => {
    if (a.done !== b.done) return (a.done ? 1 : 0) - (b.done ? 1 : 0);
    if (goalSort === 'priority') return (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1);
    if (goalSort === 'created') return (b.createdAt || 0) - (a.createdAt || 0);
    return (a.due || '9999').localeCompare(b.due || '9999');
  });
  const done = state.goals.filter((g) => g.done).length;
  const pct = state.goals.length ? (done / state.goals.length) * 100 : 0;
  const fill = $('#goalProgressFill'); if (fill) fill.style.width = pct + '%';
  const label = $('#goalProgressLabel'); if (label) label.textContent = done + ' de ' + state.goals.length;
  if (!list.length) {
    box.innerHTML = '<div class="empty"><i class="fa-solid fa-seedling"></i>' + (state.goals.length ? (q ? 'Nenhuma meta com “' + esc(goalQuery) + '”.' : 'Nada com esse filtro.') : 'Nenhuma meta ainda. Comece com algo pequeno e específico.') + '</div>';
    return;
  }
  box.innerHTML = list.map((g) => {
    const late = !g.done && g.due && g.due < today;
    return '<div class="list-item' + (g.done ? ' done' : '') + (late ? ' late' : '') + '">' +
      '<button class="btn btn-icon btn-ghost btn-sm" type="button" data-goal-toggle="' + g.id + '" aria-label="Concluir"><i class="fa-' + (g.done ? 'solid fa-circle-check' : 'regular fa-circle') + '"></i></button>' +
      '<div class="li-main"><span class="li-title">' + esc(g.text) + '</span><span class="li-sub">' + esc(g.subject || 'Geral') +
      ' · <span class="badge ' + (g.priority === 'alta' ? 'danger' : '') + '">' + esc(g.priority) + '</span>' +
      (g.due ? ' · ' + (late ? 'atrasada desde ' : 'até ') + esc(prettyDate(g.due)) : '') + '</span></div>' +
      '<div class="li-actions"><button class="btn btn-icon btn-ghost btn-sm" type="button" data-goal-edit="' + g.id + '" aria-label="Editar"><i class="fa-solid fa-pen"></i></button>' +
      '<button class="btn btn-icon btn-ghost btn-sm" type="button" data-goal-del="' + g.id + '" aria-label="Excluir"><i class="fa-solid fa-trash"></i></button></div></div>';
  }).join('');
}
function addGoal(e) {
  if (e) e.preventDefault();
  const input = $('#goalInput');
  const text = input ? input.value.trim() : '';
  if (!text) return;
  state.goals.unshift({ id: uid(), text, subject: ($('#goalSubject') || {}).value || '', priority: ($('#goalPriority') || {}).value || 'media', due: ($('#goalDue') || {}).value || '', done: false, createdAt: Date.now() });
  if (input) input.value = '';
  save(); renderGoals(); renderHoje();
  toast('Meta adicionada.', 'fa-plus');
}
function toggleGoal(id) {
  const g = state.goals.find((x) => x.id === id);
  if (!g) return;
  g.done = !g.done;
  g.doneAt = g.done ? Date.now() : null;
  if (g.done) {
    state.totalGoalsDone += 1;
    dailyBump('goals', 1);
    addXp(8); addCoins(2);
    toast('Meta concluída: +8 XP, +2 moedas.', 'fa-check');
  } else {
    state.totalGoalsDone = Math.max(0, state.totalGoalsDone - 1);
  }
  save(); renderGoals(); renderHoje();
}
function bindGoals() {
  renderGoals();
  $('#goalForm') && $('#goalForm').addEventListener('submit', addGoal);
  $('#goalSearch') && $('#goalSearch').addEventListener('input', debounce((e) => { goalQuery = e.target.value; renderGoals(); }, 120));
  $('#goalSort') && $('#goalSort').addEventListener('change', (e) => { goalSort = e.target.value; renderGoals(); });
  $('#goalFilters') && $('#goalFilters').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    goalFilter = chip.dataset.filter;
    $$('#goalFilters .chip').forEach((c) => c.classList.toggle('active', c === chip));
    renderGoals();
  });
  $('#goalList') && $('#goalList').addEventListener('click', (e) => {
    e.__goalHandled = true;
    const t = e.target.closest('[data-goal-toggle]');
    if (t) return toggleGoal(t.dataset.goalToggle);
    const d = e.target.closest('[data-goal-del]');
    if (d) {
      if (!confirm('Excluir esta meta?')) return;
      state.goals = state.goals.filter((g) => g.id !== d.dataset.goalDel);
      save(); renderGoals(); renderHoje(); toast('Meta excluída.', 'fa-trash');
      return;
    }
    const ed = e.target.closest('[data-goal-edit]');
    if (ed) {
      const g = state.goals.find((x) => x.id === ed.dataset.goalEdit);
      if (!g) return;
      const text = prompt('Editar meta:', g.text);
      if (text == null) return;
      if (text.trim()) g.text = text.trim();
      save(); renderGoals(); renderHoje(); toast('Meta atualizada.', 'fa-pen');
    }
  });
}
function renderGoalSubjects() {
  const sel = $('#goalSubject');
  if (!sel) return;
  sel.innerHTML = '<option value="">Geral</option>' + subjects().map((s) => '<option value="' + esc(s) + '">' + esc(s) + '</option>').join('');
}

/* ============ 13. FLASHCARDS ============ */
const flash = { queue: [], idx: 0, flipped: false, reviewed: 0, reverse: false };
function dueCards(deck) {
  const today = dateKey();
  const out = [];
  Object.keys(state.decks).forEach((d) => {
    if (deck && d !== deck) return;
    (state.decks[d] || []).forEach((c) => { if (!c.due || c.due <= today) out.push({ deck: d, card: c }); });
  });
  return out;
}
function buildFlashQueue() {
  const deck = state.deck;
  const cards = (state.decks[deck] || []).slice();
  const today = dateKey();
  const due = cards.filter((c) => !c.due || c.due <= today);
  flash.queue = shuffle(due.length ? due : cards);
  flash.idx = 0;
  flash.flipped = false;
  flash.reviewed = 0;
}
function currentFlash() { return flash.queue[flash.idx] || null; }
function renderFlashcards() {
  const sel = $('#deckSelect');
  if (sel) {
    sel.innerHTML = Object.keys(state.decks).map((d) => '<option value="' + esc(d) + '"' + (d === state.deck ? ' selected' : '') + '>' + esc(d) + ' (' + (state.decks[d] || []).length + ')</option>').join('');
  }
  const due = dueCards().length;
  const dueEl = $('#flashDue'); if (dueEl) dueEl.textContent = due + ' devidos';
  if (!flash.queue.length) buildFlashQueue();
  const card = currentFlash();
  const q = $('#flashQuestion'); const a = $('#flashAnswer');
  if (q) q.textContent = card ? (flash.reverse ? card.a : card.q) : 'Nenhum card neste baralho';
  if (a) a.textContent = card ? (flash.reverse ? card.q : card.a) : 'Crie um card para começar.';
  const ft = $('#flashFrontTag'); if (ft) ft.textContent = flash.reverse ? 'Resposta' : 'Pergunta';
  const bt = $('#flashBackTag'); if (bt) bt.textContent = flash.reverse ? 'Pergunta' : 'Resposta';
  const rev = $('#flashReverse'); if (rev) rev.checked = !!flash.reverse;
  const box = $('#flashcard'); if (box) box.classList.toggle('flipped', flash.flipped);
  const stats = $('#flashStats');
  if (stats) stats.textContent = flash.reviewed + ' revisões nesta rodada · ' + flash.queue.length + ' na fila';
  const queue = $('#flashQueue');
  if (queue) {
    const cards = state.decks[state.deck] || [];
    queue.innerHTML = cards.length ? cards.map((c, i) => '<div class="list-item"><div class="li-main"><span class="li-title">' + esc(c.q) + '</span><span class="li-sub">' +
      (c.due ? 'próxima: ' + prettyDate(c.due) : 'novo') + ' · ' + (c.reps || 0) + ' reps</span></div>' +
      '<div class="li-actions"><button class="btn btn-icon btn-ghost btn-sm" type="button" data-card-edit="' + c.id + '" aria-label="Editar"><i class="fa-solid fa-pen"></i></button>' +
      '<button class="btn btn-icon btn-ghost btn-sm" type="button" data-card-del="' + c.id + '" aria-label="Excluir"><i class="fa-solid fa-trash"></i></button></div></div>').join('')
      : '<div class="empty">Baralho vazio. Crie o primeiro card.</div>';
  }
}
function flipFlash() {
  if (!currentFlash()) return;
  flash.flipped = !flash.flipped;
  const box = $('#flashcard'); if (box) box.classList.toggle('flipped', flash.flipped);
}
function rateFlash(rating) {
  const card = currentFlash();
  if (!card) return toast('Nenhum card na fila.', 'fa-triangle-exclamation', true);
  if (!flash.flipped) { flash.flipped = true; const b = $('#flashcard'); if (b) b.classList.add('flipped'); return toast('Vire o card antes de avaliar.', 'fa-clone'); }
  const c = card;
  const today = new Date();
  if (rating === 'again') { c.interval = 0; c.ease = Math.max(1.3, (c.ease || 2.5) - 0.2); c.lapses = (c.lapses || 0) + 1; }
  else {
    const ease = c.ease || 2.5;
    if (rating === 'hard') c.interval = Math.max(1, Math.round((c.interval || 1) * 1.2));
    else if (rating === 'good') c.interval = c.interval ? Math.round(c.interval * ease) : 1;
    else { c.interval = c.interval ? Math.round(c.interval * ease * 1.3) : 3; c.ease = Math.min(3.1, ease + 0.1); }
  }
  c.reps = (c.reps || 0) + 1;
  c.due = dateKey(addDays(today, c.interval));
  state.flashStats[rating] = (state.flashStats[rating] || 0) + 1;
  dailyBump('cards', 1);
  flash.reviewed += 1;
  flash.idx += 1;
  flash.flipped = false;
  if (flash.idx >= flash.queue.length) {
    buildFlashQueue();
    toast('Rodada concluída! Cartões reagendados.', 'fa-check');
    addXp(6);
  } else {
    addXp(2, true);
  }
  save(); renderFlashcards(); renderHoje();
}
function addCard() {
  const q = prompt('Pergunta do card:');
  if (!q || !q.trim()) return;
  const a = prompt('Resposta:');
  if (!a || !a.trim()) return;
  state.decks[state.deck] = state.decks[state.deck] || [];
  state.decks[state.deck].push({ id: uid(), q: q.trim(), a: a.trim(), ease: 2.5, interval: 0, due: '', reps: 0, lapses: 0, createdAt: Date.now() });
  save(); buildFlashQueue(); renderFlashcards();
  toast('Card adicionado.', 'fa-plus');
}
function bindFlashcards() {
  buildFlashQueue(); renderFlashcards();
  $('#flashcard') && $('#flashcard').addEventListener('click', flipFlash);
  $('#flashcard') && $('#flashcard').addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flipFlash(); } });
  $('#flashReverse') && $('#flashReverse').addEventListener('change', (e) => {
    flash.reverse = e.target.checked;
    flash.flipped = false;
    renderFlashcards();
    toast(flash.reverse ? 'Modo reverso: resposta primeiro.' : 'Modo normal: pergunta primeiro.', 'fa-arrows-rotate');
  });
  $$('.flash-actions [data-rating]').forEach((b) => b.addEventListener('click', () => rateFlash(b.dataset.rating)));
  $('#deckSelect') && $('#deckSelect').addEventListener('change', (e) => { state.deck = e.target.value; buildFlashQueue(); renderFlashcards(); save(); });
  $('#flashAddBtn') && $('#flashAddBtn').addEventListener('click', addCard);
  $('#flashResetBtn') && $('#flashResetBtn').addEventListener('click', () => { buildFlashQueue(); flash.reviewed = 0; renderFlashcards(); toast('Rodada reiniciada.', 'fa-rotate'); });
  $('#deckNewBtn') && $('#deckNewBtn').addEventListener('click', () => {
    const name = prompt('Nome do novo baralho:');
    if (!name || !name.trim()) return;
    if (state.decks[name.trim()]) return toast('Já existe um baralho com esse nome.', 'fa-triangle-exclamation', true);
    state.decks[name.trim()] = [];
    state.deck = name.trim();
    save(); buildFlashQueue(); renderFlashcards(); toast('Baralho criado.', 'fa-layer-group');
  });
  $('#deckRenameBtn') && $('#deckRenameBtn').addEventListener('click', () => {
    const old = state.deck;
    const name = prompt('Novo nome do baralho:', old);
    if (!name || !name.trim() || name.trim() === old) return;
    if (state.decks[name.trim()]) return toast('Já existe um baralho com esse nome.', 'fa-triangle-exclamation', true);
    state.decks[name.trim()] = state.decks[old];
    delete state.decks[old];
    state.deck = name.trim();
    save(); buildFlashQueue(); renderFlashcards(); toast('Baralho renomeado.', 'fa-pen');
  });
  $('#deckDeleteBtn') && $('#deckDeleteBtn').addEventListener('click', () => {
    const keys = Object.keys(state.decks);
    if (keys.length <= 1) return toast('Mantenha pelo menos um baralho.', 'fa-triangle-exclamation', true);
    if (!confirm('Excluir o baralho "' + state.deck + '" e todos os cards?')) return;
    delete state.decks[state.deck];
    state.deck = Object.keys(state.decks)[0];
    save(); buildFlashQueue(); renderFlashcards(); toast('Baralho excluído.', 'fa-trash');
  });
  $('#flashQueue') && $('#flashQueue').addEventListener('click', (e) => {
    const del = e.target.closest('[data-card-del]');
    if (del) {
      if (!confirm('Excluir este card?')) return;
      state.decks[state.deck] = (state.decks[state.deck] || []).filter((c) => c.id !== del.dataset.cardDel);
      save(); buildFlashQueue(); renderFlashcards(); toast('Card excluído.', 'fa-trash');
      return;
    }
    const ed = e.target.closest('[data-card-edit]');
    if (ed) {
      const card = (state.decks[state.deck] || []).find((c) => c.id === ed.dataset.cardEdit);
      if (!card) return;
      const q = prompt('Pergunta:', card.q);
      if (q == null) return;
      const a = prompt('Resposta:', card.a);
      if (a == null) return;
      card.q = q.trim() || card.q; card.a = a.trim() || card.a;
      save(); renderFlashcards(); toast('Card atualizado.', 'fa-pen');
    }
  });
  document.addEventListener('keydown', (e) => {
    if (state.currentTab !== 'flashcards') return;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
    if (e.key === ' ') { e.preventDefault(); flipFlash(); }
    if (['1', '2', '3', '4'].includes(e.key)) { e.preventDefault(); rateFlash(['again', 'hard', 'good', 'easy'][Number(e.key) - 1]); }
  });
}

/* ============ 14. QUIZ ============ */
const QUIZ_BANK = {
  'Matemática': [
    { q: 'Qual é a fórmula da área do círculo?', o: ['πr²', '2πr', 'πd', 'r²/2'], a: 0, why: 'A área é π vezes o raio ao quadrado; 2πr é o perímetro.' },
    { q: 'Se f(x) = 2x + 3, quanto vale f(4)?', o: ['7', '11', '8', '14'], a: 1, why: '2·4 + 3 = 11.' },
    { q: 'Qual é a soma dos ângulos internos de um triângulo?', o: ['90°', '180°', '270°', '360°'], a: 1, why: 'Em qualquer triângulo euclidiano a soma é 180°.' },
    { q: 'A raiz quadrada de 144 é:', o: ['10', '11', '12', '14'], a: 2, why: '12² = 144.' }
  ],
  'Português': [
    { q: 'Em "O aluno leu o livro", "o livro" é:', o: ['sujeito', 'objeto direto', 'objeto indireto', 'predicativo'], a: 1, why: 'O verbo "ler" é transitivo direto, sem preposição.' },
    { q: 'Qual figura de linguagem há em "Seus olhos são duas estrelas"?', o: ['metáfora', 'metonímia', 'hipérbole', 'eufemismo'], a: 0, why: 'Comparação implícita, sem conectivo comparativo, é metáfora.' },
    { q: 'A função do "que" em "Espero que você venha" é:', o: ['pronome relativo', 'conjunção integrante', 'preposição', 'advérbio'], a: 1, why: 'Introduz oração subordinada substantiva objetiva direta.' },
    { q: 'Qual palavra é proparoxítona?', o: ['café', 'lâmpada', 'papel', 'sofá'], a: 1, why: 'A antepenúltima sílaba é a tônica em "lâmpada".' }
  ],
  'Biologia': [
    { q: 'Qual organela produz ATP em maior quantidade?', o: ['ribossomo', 'mitocôndria', 'lisossomo', 'complexo de Golgi'], a: 1, why: 'A mitocôndria faz a respiração celular aeróbica.' },
    { q: 'A unidade básica da hereditariedade é o:', o: ['gene', 'cromossomo', 'nucleotídeo', 'alelo'], a: 0, why: 'Gene é o trecho de DNA que codifica uma característica.' },
    { q: 'Em qual fase da mitose os cromossomos se alinham no equador?', o: ['prófase', 'metáfase', 'anáfase', 'telófase'], a: 1, why: 'Na metáfase eles se alinham na placa metafásica.' },
    { q: 'A fotossíntese ocorre principalmente no:', o: ['núcleo', 'cloroplasto', 'vacúolo', 'ribossomo'], a: 1, why: 'Cloroplastos contêm clorofila e fazem a fase clara e escura.' }
  ],
  'Química': [
    { q: 'Qual é o pH de uma solução neutra a 25 °C?', o: ['0', '7', '10', '14'], a: 1, why: 'pH 7 indica [H+] = [OH-] a 25 °C.' },
    { q: 'Quantos mols há em 36 g de água (H₂O)?', o: ['1', '2', '3', '4'], a: 1, why: 'Massa molar 18 g/mol; 36/18 = 2 mols.' },
    { q: 'Ligação entre metal e ametal é predominantemente:', o: ['iônica', 'covalente', 'metálica', 'de hidrogênio'], a: 0, why: 'Transferência de elétrons do metal para o ametal.' },
    { q: 'O gás nobre de menor número atômico é:', o: ['hélio', 'neônio', 'argônio', 'criptônio'], a: 0, why: 'Hélio tem Z = 2.' }
  ],
  'Física': [
    { q: 'A unidade de força no SI é:', o: ['joule', 'newton', 'watt', 'pascal'], a: 1, why: 'N = kg·m/s².' },
    { q: 'Um carro a 72 km/h tem velocidade em m/s igual a:', o: ['10', '20', '30', '72'], a: 1, why: 'Divide por 3,6: 72 / 3,6 = 20 m/s.' },
    { q: 'A lei de Ohm é:', o: ['U = R·i', 'P = U·i', 'F = m·a', 'E = m·c²'], a: 0, why: 'Tensão é resistência vezes corrente.' },
    { q: 'Na queda livre, desprezando o ar, a aceleração é:', o: ['constante', 'crescente', 'decrescente', 'nula'], a: 0, why: 'Aproximadamente 9,8 m/s² perto da superfície.' }
  ],
  'História': [
    { q: 'A Revolução Francesa começou em:', o: ['1789', '1776', '1815', '1848'], a: 0, why: 'Queda da Bastilha em 14 de julho de 1789.' },
    { q: 'O Brasil proclamou a República em:', o: ['1822', '1888', '1889', '1930'], a: 2, why: '15 de novembro de 1889, por Deodoro da Fonseca.' },
    { q: 'A Guerra Fria opôs principalmente:', o: ['EUA e URSS', 'Alemanha e França', 'China e Japão', 'Inglaterra e EUA'], a: 0, why: 'Disputa entre blocos capitalista e socialista.' },
    { q: 'A Lei Áurea foi assinada em:', o: ['1871', '1885', '1888', '1891'], a: 2, why: '13 de maio de 1888, abolindo a escravidão.' }
  ],
  'Geografia': [
    { q: 'O maior bioma brasileiro em área é:', o: ['Cerrado', 'Amazônia', 'Mata Atlântica', 'Caatinga'], a: 1, why: 'A Amazônia ocupa cerca de metade do território.' },
    { q: 'A linha imaginária que divide a Terra em hemisférios norte e sul é:', o: ['Equador', 'Trópico de Câncer', 'Meridiano de Greenwich', 'Trópico de Capricórnio'], a: 0, why: 'O Equador está a 0° de latitude.' },
    { q: 'El Niño está associado ao aquecimento das águas do:', o: ['Atlântico Norte', 'Pacífico Equatorial', 'Índico', 'Ártico'], a: 1, why: 'Altera chuvas e temperatura em várias regiões.' },
    { q: 'Qual é o processo de perda de solo fértil por ação da água?', o: ['erosão', 'sedimentação', 'lixiviação', 'intemperismo'], a: 0, why: 'Erosão hídrica remove a camada superficial.' }
  ],
  'Inglês': [
    { q: 'Complete: "She ___ to school every day."', o: ['go', 'goes', 'going', 'gone'], a: 1, why: 'Terceira pessoa do singular recebe -es.' },
    { q: 'Qual é o passado de "buy"?', o: ['buyed', 'bought', 'boughted', 'buys'], a: 1, why: 'Verbo irregular: buy → bought.' },
    { q: 'Escolha o comparativo correto de "good":', o: ['gooder', 'more good', 'better', 'best'], a: 2, why: 'Good → better → the best.' },
    { q: '"I have lived here ___ 2019." Qual preposição?', o: ['for', 'since', 'from', 'at'], a: 1, why: 'Since marca ponto de início; for marca duração.' }
  ]
};
const quizRun = { list: [], idx: 0, score: 0, wrong: [], timer: null, left: 0, active: false, combo: 0, bestCombo: 0 };
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function startQuiz() {
  const subject = ($('#quizSubject') || {}).value || 'Matemática';
  const count = Number((($('#quizCount') || {}).value) || 5);
  const bank = QUIZ_BANK[subject] || [];
  if (!bank.length) return toast('Sem perguntas para essa matéria.', 'fa-triangle-exclamation', true);
  quizRun.list = shuffle(bank).slice(0, Math.min(count, bank.length)).map((q) => ({ ...q, options: shuffle(q.o.map((text, i) => ({ text, correct: i === q.a }))) }));
  quizRun.idx = 0; quizRun.score = 0; quizRun.wrong = []; quizRun.active = true; quizRun.combo = 0; quizRun.bestCombo = 0;
  const setup = $('#quizSetup'); if (setup) setup.hidden = true;
  const stage = $('#quizStage'); if (stage) stage.hidden = false;
  const rev = $('#quizReviewBtn'); if (rev) rev.hidden = true;
  renderQuizQuestion();
}
function renderQuizQuestion() {
  const q = quizRun.list[quizRun.idx];
  if (!q) return finishQuiz();
  const prog = $('#quizProgressLabel'); if (prog) prog.textContent = 'Pergunta ' + (quizRun.idx + 1) + ' de ' + quizRun.list.length;
  const score = $('#quizScoreLabel'); if (score) score.textContent = quizRun.score + ' acertos';
  const combo = $('#quizCombo');
  if (combo) {
    combo.textContent = quizRun.combo > 1 ? 'combo x' + quizRun.combo : 'sem combo';
    combo.classList.toggle('on', quizRun.combo > 1);
  }
  const fill = $('#quizProgressFill'); if (fill) fill.style.width = (quizRun.idx / quizRun.list.length * 100) + '%';
  const question = $('#quizQuestion'); if (question) question.textContent = q.q;
  const opts = $('#quizOptions');
  if (opts) {
    opts.innerHTML = q.options.map((o, i) => '<button class="quiz-option" type="button" data-opt="' + i + '"><span class="qkey">' + String.fromCharCode(65 + i) + '</span><span>' + esc(o.text) + '</span></button>').join('');
  }
  const fb = $('#quizFeedback'); if (fb) { fb.textContent = ''; fb.className = 'quiz-feedback'; }
  const timed = ($('#quizTimed') || {}).checked;
  const timerLabel = $('#quizTimerLabel');
  if (timerLabel) timerLabel.hidden = !timed;
  clearInterval(quizRun.timer);
  if (timed) {
    quizRun.left = 20;
    if (timerLabel) timerLabel.textContent = '20s';
    quizRun.timer = setInterval(() => {
      quizRun.left -= 1;
      if (timerLabel) timerLabel.textContent = quizRun.left + 's';
      if (quizRun.left <= 0) { clearInterval(quizRun.timer); answerQuiz(-1); }
    }, 1000);
  }
}
function answerQuiz(i) {
  const q = quizRun.list[quizRun.idx];
  if (!q || !quizRun.active) return;
  clearInterval(quizRun.timer);
  const opts = $$('#quizOptions .quiz-option');
  const correctIndex = q.options.findIndex((o) => o.correct);
  opts.forEach((b, idx) => {
    b.disabled = true;
    if (idx === correctIndex) b.classList.add('correct');
    if (idx === i && idx !== correctIndex) b.classList.add('wrong');
  });
  const fb = $('#quizFeedback');
  const ok = i === correctIndex;
  let comboBonus = 0;
  if (ok) {
    quizRun.score += 1;
    quizRun.combo = (quizRun.combo || 0) + 1;
    quizRun.bestCombo = Math.max(quizRun.bestCombo || 0, quizRun.combo);
    comboBonus = quizRun.combo >= 3 ? Math.min(5, quizRun.combo - 2) : 0;
    dailyBump('quiz', 1);
  } else {
    quizRun.wrong.push({ q: q.q, why: q.why, answer: q.options[correctIndex].text });
    quizRun.combo = 0;
  }
  if (fb) {
    fb.className = 'quiz-feedback ' + (ok ? 'ok' : 'bad');
    fb.textContent = (ok ? '✔ Correto. ' : i === -1 ? '⏱ Tempo esgotado. ' : '✘ Não é essa. ') + q.why +
      (comboBonus ? ' · combo x' + quizRun.combo + ' (+' + comboBonus + ' XP)' : '');
  }
  if (ok) { addXp(5 + comboBonus); beep(760, 0.1); } else beep(240, 0.12, 'triangle');
  const score = $('#quizScoreLabel'); if (score) score.textContent = quizRun.score + ' acertos';
  const comboEl = $('#quizCombo');
  if (comboEl) {
    comboEl.textContent = quizRun.combo > 1 ? 'combo x' + quizRun.combo : 'sem combo';
    comboEl.classList.toggle('on', quizRun.combo > 1);
  }
  setTimeout(() => {
    quizRun.idx += 1;
    if (quizRun.idx >= quizRun.list.length) finishQuiz();
    else renderQuizQuestion();
  }, 1250);
}
function finishQuiz() {
  quizRun.active = false;
  clearInterval(quizRun.timer);
  const stage = $('#quizStage'); if (stage) stage.hidden = true;
  const setup = $('#quizSetup'); if (setup) setup.hidden = false;
  const total = quizRun.list.length;
  const pct = total ? Math.round((quizRun.score / total) * 100) : 0;
  quizRun.list = [];
  if (quizRun.score > state.quizBest) state.quizBest = quizRun.score;
  state.quizHistory.unshift({ at: Date.now(), score: quizRun.score, total, subject: (($('#quizSubject') || {}).value) || '' });
  state.quizHistory = state.quizHistory.slice(0, 20);
  const bonus = (pct >= 60 ? Math.round(pct / 20) : 0) + Math.floor((quizRun.bestCombo || 0) / 5);
  if (bonus) addCoins(bonus);
  save(); renderQuizBest();
  const rev = $('#quizReviewBtn'); if (rev) { rev.hidden = !quizRun.wrong.length; rev.dataset.tab = 'review'; }
  if (quizRun.wrong.length) {
    const opts = $('#quizOptions');
    if (opts) opts.innerHTML = '';
    const fb = $('#quizFeedback');
    if (fb) {
      fb.className = 'quiz-feedback';
      fb.innerHTML = 'Resultado: <b>' + quizRun.score + '/' + total + '</b> (' + pct + '%). Revisão dos erros:<br>' +
        quizRun.wrong.map((w) => '• <b>' + esc(w.q) + '</b> → ' + esc(w.answer) + ' <i>(' + esc(w.why) + ')</i>').join('<br>');
    }
  } else {
    toast('Quiz perfeito! ' + quizRun.score + '/' + total + ' · combo máx. x' + (quizRun.bestCombo || 0), 'fa-trophy');
  }
  renderHoje();
}
function renderQuizBest() {
  const el = $('#quizBest');
  if (el) el.textContent = 'Recorde: ' + state.quizBest + ' acertos';
  renderQuizSubjects();
}
function renderQuizSubjects() {
  const sel = $('#quizSubject');
  if (!sel) return;
  sel.innerHTML = Object.keys(QUIZ_BANK).map((s) => '<option value="' + esc(s) + '">' + esc(s) + '</option>').join('');
}
function bindQuiz() {
  renderQuizBest();
  $('#quizStartBtn') && $('#quizStartBtn').addEventListener('click', startQuiz);
  $('#quizOptions') && $('#quizOptions').addEventListener('click', (e) => {
    const b = e.target.closest('[data-opt]');
    if (b) answerQuiz(Number(b.dataset.opt));
  });
  $('#quizRestartBtn') && $('#quizRestartBtn').addEventListener('click', () => {
    clearInterval(quizRun.timer);
    quizRun.active = false;
    const stage = $('#quizStage'); if (stage) stage.hidden = true;
    const setup = $('#quizSetup'); if (setup) setup.hidden = false;
    const opts = $('#quizOptions'); if (opts) opts.innerHTML = '';
    const fb = $('#quizFeedback'); if (fb) { fb.textContent = ''; fb.className = 'quiz-feedback'; }
    const rev = $('#quizReviewBtn'); if (rev) rev.hidden = true;
  });
}

/* ============ 15. TIMER POR MATÉRIA ============ */
const subjectTimer = { name: '', seconds: 0, running: false, endAt: 0, startAt: 0 };
function renderSubjects() {
  const chips = $('#subjectChips');
  if (chips) {
    chips.innerHTML = subjects().map((s) => '<button class="chip' + (subjectTimer.name === s ? ' active' : '') + '" type="button" data-subject="' + esc(s) + '">' + esc(s) + '</button>').join('');
  }
  const name = $('#subjectClockSubject');
  if (name) name.textContent = subjectTimer.name || 'Nenhuma matéria selecionada';
  const clock = $('#subjectClock');
  if (clock) clock.textContent = fmtClock(subjectTimer.seconds);
  renderSubjectsTotals();
}
function renderSubjectsTotals() {
  const box = $('#subjectTotals');
  if (!box) return;
  const entries = subjects().map((s) => ({ s, m: state.subjectMinutes[s] || 0 })).filter((e) => e.m > 0 || state.subjectGoals[e.s]);
  box.innerHTML = entries.length ? entries.sort((a, b) => b.m - a.m).map((e) => {
    const goal = state.subjectGoals[e.s] || 0;
    return '<div class="subject-total"><span>' + esc(e.s) + (goal ? ' <small>(' + Math.round(e.m / goal * 100) + '% da meta)</small>' : '') + '</span><b>' + fmtMinutes(e.m) + '</b></div>';
  }).join('') : '<div class="empty">Nenhum minuto registrado ainda.</div>';
}
function subjectTick() {
  if (!subjectTimer.running) return;
  subjectTimer.seconds = Math.floor((Date.now() - subjectTimer.startAt) / 1000);
  const clock = $('#subjectClock');
  if (clock) clock.textContent = fmtClock(subjectTimer.seconds);
}
function subjectStart() {
  if (!subjectTimer.name) return toast('Escolha uma matéria primeiro.', 'fa-triangle-exclamation', true);
  if (subjectTimer.running) return;
  subjectTimer.running = true;
  subjectTimer.startAt = Date.now() - subjectTimer.seconds * 1000;
  toast('Cronômetro de ' + subjectTimer.name + ' iniciado.', 'fa-play');
}
function subjectPause() {
  if (!subjectTimer.running) return;
  subjectTimer.running = false;
  subjectTimer.seconds = Math.floor((Date.now() - subjectTimer.startAt) / 1000);
  toast('Cronômetro pausado.', 'fa-pause');
}
function subjectStop() {
  if (!subjectTimer.name) return;
  if (subjectTimer.running) subjectTimer.seconds = Math.floor((Date.now() - subjectTimer.startAt) / 1000);
  subjectTimer.running = false;
  const minutes = Math.max(subjectTimer.seconds > 30 ? 1 : 0, Math.round(subjectTimer.seconds / 60));
  if (!minutes) { subjectTimer.seconds = 0; renderSubjects(); return toast('Sessão curta demais para salvar.', 'fa-triangle-exclamation', true); }
  addFocus(minutes, subjectTimer.name);
  toast(minutes + 'min salvos em ' + subjectTimer.name + '.', 'fa-check');
  subjectTimer.seconds = 0;
  renderSubjects();
}
function bindSubjects() {
  renderSubjects();
  $('#subjectChips') && $('#subjectChips').addEventListener('click', (e) => {
    const b = e.target.closest('[data-subject]');
    if (!b) return;
    if (subjectTimer.running) subjectPause();
    subjectTimer.name = b.dataset.subject;
    subjectTimer.seconds = 0;
    renderSubjects();
  });
  $('#subjectStartBtn') && $('#subjectStartBtn').addEventListener('click', subjectStart);
  $('#subjectPauseBtn') && $('#subjectPauseBtn').addEventListener('click', subjectPause);
  $('#subjectStopBtn') && $('#subjectStopBtn').addEventListener('click', subjectStop);
  $('#subjectAddBtn') && $('#subjectAddBtn').addEventListener('click', () => {
    const name = prompt('Nome da nova matéria:');
    if (!name || !name.trim()) return;
    const clean = name.trim();
    if (subjects().some((s) => s.toLowerCase() === clean.toLowerCase())) return toast('Essa matéria já existe.', 'fa-triangle-exclamation', true);
    state.customSubjects.push(clean);
    save(); renderSubjects(); renderGoalSubjects(); renderTimer();
    toast('Matéria adicionada.', 'fa-plus');
  });
  setInterval(subjectTick, 1000);
}

/* ============ 16. PLANNER ============ */
const PLANNER_SLOTS = ['06h–08h', '08h–10h', '10h–12h', '14h–16h', '16h–18h', '19h–21h'];
function subjectColor(name) {
  const list = subjects();
  const idx = list.findIndex((s) => String(name || '').toLowerCase().includes(s.toLowerCase()));
  if (idx < 0) return 'hsl(160 70% 55%)';
  return 'hsl(' + ((idx * 47) % 360) + ' 72% 58%)';
}
let plannerOffset = 0;
function plannerDays() {
  const start = addDays(startOfWeek(new Date()), plannerOffset * 7);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}
function renderPlanner() {
  const grid = $('#plannerGrid');
  if (!grid) return;
  const days = plannerDays();
  const today = dateKey();
  let html = '<div class="planner-rowlabel"></div>' + days.map((d) => '<div class="planner-head' + (dateKey(d) === today ? ' today' : '') + '">' + WEEK[d.getDay()] + ' ' + d.getDate() + '</div>').join('');
  PLANNER_SLOTS.forEach((slot, si) => {
    html += '<div class="planner-rowlabel">' + slot + '</div>';
    days.forEach((d) => {
      const key = dateKey(d);
      const text = (state.planner[key] || {})[String(si)] || '';
      const subject = text.split('—')[0].trim();
      const color = text ? subjectColor(subject) : '';
      html += '<button class="planner-cell' + (text ? ' filled' : '') + (key === today ? ' today' : '') + '" type="button" data-day="' + key + '" data-slot="' + si + '"' +
        (text ? ' style="--subject-color:' + color + '"' : '') + '>' + (text ? '<span class="pc-tag">' + esc(subject.slice(0, 18)) + '</span>' + esc(text.split('—').slice(1).join('—').trim() || text) : '') + '</button>';
    });
  });
  grid.innerHTML = html;
  const label = $('#plannerWeekLabel');
  if (label) {
    const a = days[0], b = days[6];
    const when = plannerOffset === 0 ? 'Semana atual' : plannerOffset < 0 ? (plannerOffset === -1 ? 'Semana passada' : Math.abs(plannerOffset) + ' semanas atrás') : (plannerOffset === 1 ? 'Próxima semana' : 'Em ' + plannerOffset + ' semanas');
    label.textContent = when + ' · ' + a.getDate() + '/' + pad(a.getMonth() + 1) + ' – ' + b.getDate() + '/' + pad(b.getMonth() + 1);
  }
  const prev = $('#plannerPrevBtn'); if (prev) prev.disabled = plannerOffset <= -12;
  const next = $('#plannerNextBtn'); if (next) next.disabled = plannerOffset >= 12;
  const todayBtn = $('#plannerTodayBtn'); if (todayBtn) todayBtn.classList.toggle('active', plannerOffset === 0);
}
function bindPlanner() {
  renderPlanner();
  $('#plannerPrevBtn') && $('#plannerPrevBtn').addEventListener('click', () => { plannerOffset = clamp(plannerOffset - 1, -12, 12); renderPlanner(); });
  $('#plannerNextBtn') && $('#plannerNextBtn').addEventListener('click', () => { plannerOffset = clamp(plannerOffset + 1, -12, 12); renderPlanner(); });
  $('#plannerTodayBtn') && $('#plannerTodayBtn').addEventListener('click', () => { plannerOffset = 0; renderPlanner(); });
  $('#plannerGrid') && $('#plannerGrid').addEventListener('click', (e) => {
    const cell = e.target.closest('.planner-cell');
    if (!cell) return;
    const key = cell.dataset.day;
    const slot = cell.dataset.slot;
    state.planner[key] = state.planner[key] || {};
    const current = state.planner[key][slot] || '';
    const text = prompt('O que vai estudar em ' + WEEK_FULL[parseKey(key).getDay()] + ' às ' + PLANNER_SLOTS[Number(slot)] + '?\nUse "Matéria — tarefa" para colorir.', current);
    if (text == null) return;
    if (text.trim()) state.planner[key][slot] = text.trim();
    else delete state.planner[key][slot];
    save(); renderPlanner(); renderHoje();
  });
  $('#plannerSaveBtn') && $('#plannerSaveBtn').addEventListener('click', () => { save(); toast('Semana salva.', 'fa-floppy-disk'); });
  $('#plannerClearBtn') && $('#plannerClearBtn').addEventListener('click', () => {
    if (!confirm('Limpar todos os blocos desta semana?')) return;
    plannerDays().forEach((d) => { delete state.planner[dateKey(d)]; });
    save(); renderPlanner(); renderHoje(); toast('Semana limpa.', 'fa-broom');
  });
  $('#plannerCopyBtn') && $('#plannerCopyBtn').addEventListener('click', () => {
    const days = plannerDays();
    days.forEach((d, i) => {
      const target = dateKey(addDays(d, 7));
      if (state.planner[dateKey(d)]) state.planner[target] = Object.assign({}, state.planner[dateKey(d)]);
    });
    save(); renderPlanner(); toast('Semana copiada para a próxima.', 'fa-copy');
  });
  $('#plannerTemplateBtn') && $('#plannerTemplateBtn').addEventListener('click', () => {
    if (!confirm('Aplicar um modelo de estudo nos dias úteis desta semana?')) return;
    const days = plannerDays();
    const model = ['Matemática — revisar exercícios', 'Português — leitura dirigida', '', 'Biologia — resumo ativo', 'Física — lista de exercícios', 'Revisão — flashcards'];
    days.forEach((d) => {
      if (d.getDay() === 0 || d.getDay() === 6) return;
      const key = dateKey(d);
      state.planner[key] = state.planner[key] || {};
      model.forEach((text, i) => { if (text && !state.planner[key][String(i)]) state.planner[key][String(i)] = text; });
    });
    save(); renderPlanner(); renderHoje(); toast('Modelo aplicado.', 'fa-wand-magic-sparkles');
  });
}
/* ============================================================
   Geekie Study Hub v20.1.0 — script.js (parte 3/4)
   Estatísticas, Diário, Loja, Títulos, Pets, Trilha, Clicker, Áudio
   ============================================================ */

/* ============ 17. ESTATÍSTICAS ============ */
/* ============ 17. ESTATÍSTICAS ============ */
let statsDays = 7;
const STATS_GOAL = 60;

function dayActiveKey(key) {
  return (state.focusByDate[key] || 0) > 0 || !!(state.checkins && state.checkins[key])
    || !!(state.streakProtect && state.streakProtect[key]);
}
function activeDaysSet() {
  const set = new Set();
  Object.keys(state.focusByDate || {}).forEach((k) => { if ((state.focusByDate[k] || 0) > 0) set.add(k); });
  Object.keys(state.checkins || {}).forEach((k) => { if (state.checkins[k]) set.add(k); });
  return set;
}
function seriesFocus(days) {
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = addDays(new Date(), -i);
    const key = dateKey(d);
    out.push({
      key: key,
      label: days <= 7 ? WEEK[d.getDay()] : d.getDate() + '/' + (d.getMonth() + 1),
      minutes: state.focusByDate[key] || 0,
      checkin: !!(state.checkins && state.checkins[key]),
      protected: !!(state.streakProtect && state.streakProtect[key]),
      date: d
    });
  }
  return out;
}
function runningFocusMinutes() {
  if (typeof pomo !== 'undefined' && pomo && pomo.running && pomo.mode === 'focus') {
    return Math.max(0, (pomo.total - pomo.remaining) / 60);
  }
  return 0;
}
function todayFocusLive() {
  return (state.focusByDate[dateKey()] || 0) + runningFocusMinutes();
}
function totalFocusAll() {
  return Object.values(state.focusByDate || {}).reduce((a, b) => a + (Number(b) || 0), 0);
}
function fmtLive(minutes) {
  const total = Math.max(0, Math.round(minutes * 60));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return (h ? h + 'h ' : '') + pad(m) + 'min ' + pad(s) + 's';
}
function checkinDone(key) {
  return !!(state.checkins && state.checkins[key || dateKey()]);
}

function renderStatsHero() {
  const key = dateKey();
  const done = checkinDone(key);
  const streak = computeStreak();
  const btn = $('#statsCheckinBtn');
  if (btn) {
    btn.disabled = done;
    btn.classList.toggle('done', done);
    btn.innerHTML = done
      ? '<i class="fa-solid fa-circle-check"></i> Check-in de hoje feito'
      : '<i class="fa-solid fa-fire-flame-curved"></i> Fazer check-in de hoje';
  }
  const big = $('#statsStreakBig');
  if (big) big.textContent = streak;
  const meta = $('#statsStreakMeta');
  if (meta) meta.textContent = streak === 1 ? 'dia em sequência' : 'dias em sequência';
  const status = $('#statsCheckinStatus');
  const reward = checkinReward(streak);
  if (status) {
    const at = state.checkins[key];
    status.textContent = done
      ? 'Check-in registrado' + (at ? ' às ' + new Date(at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '') +
        ' · ' + computeStreak() + ' dia(s) de foguinho · multiplicador x' + streakTier().mult + ' ativo.'
      : 'Check-in de hoje rende +' + reward.xp + ' XP e +' + reward.coins + ' moedas (cresce com a sequência) e mantém o foguinho vivo.';
  }
  const dots = $('#statsWeekDots');
  if (dots) {
    let html = '';
    for (let i = 6; i >= 0; i--) {
      const d = addDays(new Date(), -i);
      const k = dateKey(d);
      const on = dayActiveKey(k);
      html += '<span class="day-dot' + (on ? ' on' : '') + (i === 0 ? ' today' : '') + '" title="' + esc(prettyDate(k)) + (on ? ' · dia ativo' : ' · sem registro') + '">' +
        '<span>' + esc(WEEK[d.getDay()].slice(0, 1)) + '</span><i class="fa-solid ' + (on ? 'fa-fire' : 'fa-minus') + '"></i></span>';
    }
    dots.innerHTML = html;
  }
  const shieldCount = $('#statsShieldCount');
  if (shieldCount) shieldCount.textContent = (state.streakShields || 0) + '/5 escudos';
  const shieldBtn = $('#statsShieldBtn');
  if (shieldBtn) {
    shieldBtn.disabled = (state.streakShields || 0) >= 5;
    shieldBtn.title = 'Um escudo protege um dia sem foco e sem check-in · ' + SHIELD_COST + ' moedas';
  }
  const base = $('#statsCheckinNote');
  if (base) base.textContent = 'Check-in: +' + reward.xp + ' XP · +' + reward.coins + ' moedas hoje · foguinho x' + streakTier().mult;
}

function renderLiveWeek() {
  const box = $('#statsLiveWeek');
  if (!box) return;
  const live = runningFocusMinutes();
  const todayKey = dateKey();
  const rows = seriesFocus(7).map((s) => Object.assign({}, s, { minutes: s.minutes + (s.key === todayKey ? live : 0) }));
  const max = Math.max(30, Math.max.apply(null, rows.map((r) => r.minutes)));
  const total = rows.reduce((a, b) => a + b.minutes, 0);
  const best = rows.reduce((a, b) => (b.minutes >= a.minutes ? b : a), rows[0]);
  box.innerHTML = rows.map((r) => {
    const h = Math.max(4, Math.round((r.minutes / max) * 100));
    return '<div class="lw-col' + (r.key === todayKey ? ' today' : '') + '">' +
      '<span class="lw-value">' + (r.minutes >= 1 ? Math.round(r.minutes) : (r.minutes > 0 ? '&lt;1' : 0)) + '<i>min</i></span>' +
      '<div class="lw-bar"><span style="height:' + h + '%"></span></div>' +
      '<span class="lw-label">' + esc(r.label) + '</span></div>';
  }).join('');
  const foot = $('#statsLiveWeekFoot');
  if (foot) {
    foot.innerHTML = '<span><b>' + fmtMinutes(total) + '</b> no período</span>' +
      '<span>média <b>' + fmtMinutes(total / 7) + '</b></span>' +
      '<span>melhor: <b>' + esc(best.label) + '</b> ' + fmtMinutes(best.minutes) + '</span>';
  }
}

function renderStatsLive() {
  const live = runningFocusMinutes();
  const today = (state.focusByDate[dateKey()] || 0) + live;
  const pct = Math.round(clamp((today / STATS_GOAL) * 100, 0, 100));
  const clock = $('#statsLiveClock');
  if (clock) clock.textContent = fmtLive(today);
  const fill = $('#statsTodayFill');
  if (fill) fill.style.width = pct + '%';
  const goal = $('#statsTodayGoal');
  if (goal) goal.textContent = fmtMinutes(today) + ' de ' + STATS_GOAL + ' min (' + pct + '%)';
  const session = $('#statsSessionState');
  if (session) {
    if (live > 0) {
      session.innerHTML = '<i class="pulse-dot"></i> Sessão em andamento · +' + fmtLive(live) + ' neste ciclo';
      session.classList.add('on');
    } else {
      session.innerHTML = '<i class="idle-dot"></i> Nenhuma sessão rodando agora';
      session.classList.remove('on');
    }
  }
  const scToday = $('#scToday .sc-value');
  if (scToday) scToday.textContent = fmtMinutes(today);
  const scTodaySub = $('#scToday .sc-sub');
  if (scTodaySub) scTodaySub.textContent = 'meta ' + STATS_GOAL + 'min · ' + pct + '%';
  const streak = computeStreak();
  const scStreak = $('#scStreak .sc-value');
  if (scStreak) scStreak.textContent = streak + (streak === 1 ? ' dia' : ' dias');
  const big = $('#statsStreakBig');
  if (big && big.textContent !== String(streak)) big.textContent = streak;
  const series = seriesFocus(statsDays);
  const total = series.reduce((a, b) => a + b.minutes, 0) + live;
  const scRange = $('#scRange .sc-value');
  if (scRange) scRange.textContent = fmtMinutes(total);
  const scRangeSub = $('#scRange .sc-sub');
  if (scRangeSub) scRangeSub.textContent = 'média ' + fmtMinutes(total / statsDays);
  const sig = Math.round(today) + ':' + Math.round(live) + ':' + statsDays;
  if (sig !== renderStatsLive.last) { renderStatsLive.last = sig; renderLiveWeek(); }
}

function renderStats() {
  renderStatsHero();
  const series = seriesFocus(statsDays);
  const total = series.reduce((a, b) => a + b.minutes, 0);
  const activeRange = series.filter((x) => dayActiveKey(x.key)).length;
  const today = state.focusByDate[dateKey()] || 0;
  const streak = computeStreak();
  const best = Math.max(state.streakBest, streak);
  const activeTotal = activeDaysSet().size;
  let prevTotal = 0;
  for (let i = statsDays; i < statsDays * 2; i++) prevTotal += state.focusByDate[dateKey(addDays(new Date(), -i))] || 0;
  const deltaPct = prevTotal ? Math.round(((total - prevTotal) / prevTotal) * 100) : (total ? 100 : 0);
  const cards = [
    { id: 'scStreak', label: 'Sequência', value: streak + (streak === 1 ? ' dia' : ' dias'), sub: 'recorde ' + best, icon: 'fa-fire', tone: 'fire', live: true },
    { id: 'scActive', label: 'Dias ativos', value: activeTotal, sub: activeRange + ' nos últimos ' + statsDays + ' dias', icon: 'fa-calendar-check', tone: 'active' },
    { id: 'scToday', label: 'Foco hoje', value: fmtMinutes(today), sub: 'meta ' + STATS_GOAL + 'min · ' + Math.round((today / STATS_GOAL) * 100) + '%', icon: 'fa-clock', tone: 'today', live: true },
    { id: 'scRange', label: 'Últimos ' + statsDays + ' dias', value: fmtMinutes(total), sub: 'média ' + fmtMinutes(total / statsDays), icon: 'fa-chart-simple' },
    { label: 'Foco total', value: fmtMinutes(totalFocusAll()), sub: 'desde o primeiro registro', icon: 'fa-hourglass-half' },
    { label: 'Sessões', value: state.sessions, sub: 'pomodoros: ' + state.pomoSessions, icon: 'fa-stopwatch' },
    { label: 'Metas concluídas', value: state.totalGoalsDone, sub: 'de ' + state.goals.length + ' criadas', icon: 'fa-list-check' },
    { label: 'Cards revisados', value: Object.values(state.flashStats).reduce((a, b) => a + b, 0), sub: 'todas as rodadas', icon: 'fa-clone' },
    { label: 'Escudos', value: (state.streakShields || 0) + '/5', sub: (state.shieldsUsed || 0) + ' usado(s) · protege 1 dia', icon: 'fa-shield-halved' },
    { label: 'Vs. período anterior', value: (deltaPct >= 0 ? '+' : '') + deltaPct + '%', sub: 'anterior: ' + fmtMinutes(prevTotal), icon: 'fa-arrow-trend-up' }
  ];
  const box = $('#statsCards');
  if (box) box.innerHTML = cards.map((c) => '<div class="stat-card' + (c.tone ? ' tone-' + c.tone : '') + '"' + (c.id ? ' id="' + c.id + '"' : '') + '>' +
    '<span class="sc-label"><i class="fa-solid ' + c.icon + '"></i> ' + esc(c.label) + (c.live ? '<span class="sc-live">ao vivo</span>' : '') + '</span>' +
    '<b class="sc-value">' + esc(c.value) + '</b><span class="sc-sub">' + esc(c.sub) + '</span></div>').join('');
  const rangeLabel = $('#statsRangeLabel');
  if (rangeLabel) rangeLabel.textContent = 'últimos ' + statsDays + ' dias';
  const chart = $('#weeklyChart');
  if (chart) {
    const max = Math.max(30, Math.max.apply(null, series.map((s) => s.minutes)));
    chart.innerHTML = series.map((s) => {
      const h = Math.max(3, Math.round((s.minutes / max) * 150));
      return '<div class="bar-col"><div class="bar-fill' + (s.key === dateKey() ? ' today' : '') + '" style="height:' + h + 'px" data-value="' + fmtMinutes(s.minutes) + '"></div><span class="bar-label">' + esc(s.label) + '</span></div>';
    }).join('');
  }
  const hm = $('#heatmap');
  if (hm) {
    let cells = '';
    for (let i = 83; i >= 0; i--) {
      const d = addDays(new Date(), -i);
      const k = dateKey(d);
      const m = state.focusByDate[k] || 0;
      const on = dayActiveKey(k);
      const lvl = m >= 120 ? 4 : m >= 60 ? 3 : m >= 25 ? 2 : on ? 1 : 0;
      const why = (state.streakProtect && state.streakProtect[k]) ? ' · escudo' : (state.checkins && state.checkins[k]) ? ' · check-in' : '';
      cells += '<span class="hm-cell l' + lvl + '" title="' + prettyDate(k) + ': ' + fmtMinutes(m) + why + '"></span>';
    }
    hm.innerHTML = cells;
  }
  const bd = $('#subjectBreakdown');
  if (bd) {
    const entries = Object.entries(state.subjectMinutes).filter(([, m]) => m > 0).sort((a, b) => b[1] - a[1]);
    const max = entries.length ? entries[0][1] : 1;
    bd.innerHTML = entries.length ? entries.map(([s, m]) => '<div class="bd-row"><span>' + esc(s) + '</span><div class="bd-track"><span style="width:' + Math.round((m / max) * 100) + '%"></span></div><b>' + fmtMinutes(m) + '</b></div>').join('') : '<div class="empty">Registre foco por matéria para ver a distribuição.</div>';
  }
  renderStatsLive();
}

function doDailyCheckin() {
  const key = dateKey();
  if (checkinDone(key)) {
    toast('Você já fez o check-in de hoje.', 'fa-circle-check');
    return;
  }
  state.checkins[key] = Date.now();
  dailyBump('checkin', 1);
  const streak = computeStreak();
  if (streak > state.streakBest) state.streakBest = streak;
  save();
  const reward = checkinReward(streak);
  const xpGain = addXp(reward.xp);
  addCoins(reward.coins);
  const bonus = checkinMilestoneBonus(streak);
  if (bonus) { addXp(bonus.xp); addCoins(bonus.coins); }
  renderStats();
  renderTopbar();
  renderHoje();
  renderJourney();
  bump($('#statsCheckinBtn'));
  toast('Check-in feito! +' + xpGain + ' XP e +' + reward.coins + ' moedas.' +
    (bonus ? ' Bônus de ' + streak + ' dias: +' + bonus.xp + ' XP e +' + bonus.coins + ' moedas!' : ''), 'fa-fire');
}

function bindStats() {
  renderStats();
  $('#statsCheckinBtn') && $('#statsCheckinBtn').addEventListener('click', doDailyCheckin);
  $('#statsRange') && $('#statsRange').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    statsDays = Number(chip.dataset.days);
    $$('#statsRange .chip').forEach((c) => c.classList.toggle('active', c === chip));
    renderStats();
  });
  $('#statsExportBtn') && $('#statsExportBtn').addEventListener('click', () => {
    const rows = [['data', 'minutos_foco', 'checkin', 'dia_ativo']];
    const keys = Array.from(activeDaysSet()).sort();
    keys.forEach((k) => rows.push([k, state.focusByDate[k] || 0, checkinDone(k) ? 'sim' : 'nao', dayActiveKey(k) ? 'sim' : 'nao']));
    rows.push(['sequencia_atual', computeStreak()]);
    rows.push(['recorde_sequencia', Math.max(state.streakBest, computeStreak())]);
    rows.push(['dias_ativos_total', activeDaysSet().size]);
    rows.push(['escudos_disponiveis', state.streakShields || 0]);
    rows.push(['escudos_usados', state.shieldsUsed || 0]);
    rows.push(['multiplicador_foguinho', streakTier().mult]);
    download('geekie-estatisticas.csv', rows.map((r) => r.join(';')).join('\n'), 'text/csv;charset=utf-8');
    toast('CSV exportado.', 'fa-file-csv');
  });
  if (!bindStats.timer) {
    bindStats.timer = setInterval(() => {
      if (document.hidden || state.currentTab !== 'stats') return;
      renderStatsLive();
    }, 1000);
  }
}


/* ============ 18. DIÁRIO ============ */
const MOODS = ['😀', '🙂', '😐', '😕', '😫'];
const DIARY_PROMPTS = ['O que funcionou hoje?', 'O que atrapalhou o foco?', 'Qual é o próximo passo?', 'O que eu aprendi de novo?'];
let diaryMood = '🙂';
function renderDiary() {
  const date = $('#diaryDate');
  if (date && !date.value) date.value = dateKey();
  const moods = $('#diaryMoods');
  if (moods) moods.innerHTML = MOODS.map((m) => '<button class="chip' + (diaryMood === m ? ' active' : '') + '" type="button" data-mood="' + m + '">' + m + '</button>').join('');
  const prompts = $('#diaryPrompts');
  if (prompts) prompts.innerHTML = DIARY_PROMPTS.map((p) => '<button class="chip" type="button" data-diary-prompt="' + esc(p) + '">' + esc(p) + '</button>').join('');
  const query = (($('#diarySearch') || {}).value || '').toLowerCase();
  const entries = Object.entries(state.diary)
    .filter(([, e]) => !query || ((e.text || '') + ' ' + (e.mood || '')).toLowerCase().includes(query))
    .sort((a, b) => b[0].localeCompare(a[0]));
  const list = $('#diaryList');
  if (list) {
    list.innerHTML = entries.length ? entries.map(([k, e]) => '<div class="diary-entry"><div class="diary-entry-head"><b>' + esc(WEEK_FULL[parseKey(k).getDay()]) + ', ' + esc(prettyDate(k)) + '</b><span class="diary-mood">' + esc(e.mood || '') + '</span></div>' +
      '<p>' + esc((e.text || '').slice(0, 220)) + '</p><div class="row"><button class="link-btn" type="button" data-diary-load="' + k + '">editar</button><button class="link-btn" type="button" data-diary-del="' + k + '">excluir</button></div></div>').join('')
      : '<div class="empty"><i class="fa-solid fa-book"></i>Nenhuma entrada' + (query ? ' com esse filtro' : ' ainda') + '.</div>';
  }
  const key = (($('#diaryDate') || {}).value) || dateKey();
  const entry = state.diary[key];
  const text = $('#diaryText');
  if (text && entry && !text.dataset.dirty) { text.value = entry.text || ''; diaryMood = entry.mood || '🙂'; }
  else if (text && !entry && !text.dataset.dirty) {
    text.value = (state.diaryDrafts && state.diaryDrafts[key]) || '';
  }
  if (moods) $$('#diaryMoods .chip').forEach((c) => c.classList.toggle('active', c.dataset.mood === diaryMood));
}
const saveDiaryDraft = debounce(() => {
  const key = (($('#diaryDate') || {}).value) || dateKey();
  const value = (($('#diaryText') || {}).value) || '';
  state.diaryDrafts = state.diaryDrafts || {};
  if (value.trim()) state.diaryDrafts[key] = value;
  else delete state.diaryDrafts[key];
  save();
}, 500);
function bindDiary() {
  renderDiary();
  $('#diaryMoods') && $('#diaryMoods').addEventListener('click', (e) => {
    const b = e.target.closest('[data-mood]');
    if (!b) return;
    diaryMood = b.dataset.mood;
    renderDiary();
  });
  $('#diaryPrompts') && $('#diaryPrompts').addEventListener('click', (e) => {
    const b = e.target.closest('[data-diary-prompt]');
    if (!b) return;
    const ta = $('#diaryText'); if (!ta) return;
    ta.value = (ta.value ? ta.value + '\n\n' : '') + b.dataset.diaryPrompt + ' ';
    ta.focus();
    ta.dataset.dirty = '1';
  });
  $('#diaryText') && $('#diaryText').addEventListener('input', (e) => { e.target.dataset.dirty = '1'; saveDiaryDraft(); });
  $('#diaryDate') && $('#diaryDate').addEventListener('change', () => {
    const ta = $('#diaryText'); if (ta) { ta.dataset.dirty = ''; ta.value = ''; }
    const picked = (($('#diaryDate') || {}).value);
    const entry = state.diary[picked];
    if (entry) { if (ta) ta.value = entry.text || ''; diaryMood = entry.mood || '🙂'; }
    else if (ta) { ta.value = (state.diaryDrafts && state.diaryDrafts[picked]) || ''; }
    renderDiary();
  });
  $('#diarySaveBtn') && $('#diarySaveBtn').addEventListener('click', () => {
    const key = (($('#diaryDate') || {}).value) || dateKey();
    const text = (($('#diaryText') || {}).value || '').trim();
    if (!text) return toast('Escreva algo antes de salvar.', 'fa-triangle-exclamation', true);
    state.diary[key] = { text, mood: diaryMood, at: Date.now() };
    if (state.diaryDrafts) delete state.diaryDrafts[key];
    dailyBump('notes', 1);
    const ta = $('#diaryText'); if (ta) ta.dataset.dirty = '';
    save(); renderDiary(); addXp(3);
    toast('Entrada de ' + prettyDate(key) + ' salva.', 'fa-book');
  });
  $('#diarySearch') && $('#diarySearch').addEventListener('input', debounce(renderDiary, 130));
  $('#diaryList') && $('#diaryList').addEventListener('click', (e) => {
    const load = e.target.closest('[data-diary-load]');
    if (load) {
      const key = load.dataset.diaryLoad;
      const date = $('#diaryDate'); if (date) date.value = key;
      const entry = state.diary[key];
      const ta = $('#diaryText'); if (ta && entry) { ta.value = entry.text || ''; ta.dataset.dirty = ''; }
      diaryMood = (entry && entry.mood) || '🙂';
      renderDiary();
      ta && ta.focus();
      return;
    }
    const del = e.target.closest('[data-diary-del]');
    if (del) {
      if (!confirm('Excluir esta entrada?')) return;
      delete state.diary[del.dataset.diaryDel];
      save(); renderDiary(); toast('Entrada excluída.', 'fa-trash');
    }
  });
  $('#diaryExportBtn') && $('#diaryExportBtn').addEventListener('click', () => {
    const keys = Object.keys(state.diary).sort();
    if (!keys.length) return toast('Nada no diário ainda.', 'fa-triangle-exclamation', true);
    const md = '# Diário Geekie\n\n' + keys.map((k) => '## ' + prettyDate(k) + ' ' + (state.diary[k].mood || '') + '\n\n' + state.diary[k].text).join('\n\n');
    download('geekie-diario.md', md, 'text/markdown;charset=utf-8');
    toast('Diário exportado.', 'fa-download');
  });
}

/* ============ 19. LOJA ============ */
let storeFilter = 'all';
function renderStore() {
  const grid = $('#themeGrid');
  if (!grid) return;
  const list = THEMES.filter((t) => storeFilter === 'owned' ? state.themesOwned.includes(t.id) : storeFilter === 'locked' ? !state.themesOwned.includes(t.id) : true);
  grid.innerHTML = list.map((t) => {
    const owned = state.themesOwned.includes(t.id);
    const equipped = state.theme === t.id;
    return '<div class="theme-card' + (equipped ? ' equipped' : '') + '">' +
      '<div class="theme-preview" data-preview="' + t.id + '" style="--t-a:' + t.a + ';--t-b:' + t.b + '">' + esc(t.name) + '</div>' +
      '<div class="theme-name">' + esc(t.name) + (equipped ? ' <i class="fa-solid fa-circle-check" style="color:var(--primary)"></i>' : '') + '</div>' +
      '<div class="theme-meta"><span>' + (owned ? 'adquirido' : '<span class="theme-price"><i class="fa-solid fa-coins"></i> ' + t.price + '</span>') + '</span></div>' +
      '<button class="btn ' + (owned ? (equipped ? 'btn-secondary' : 'btn-primary') : 'btn-secondary') + ' btn-sm" type="button" data-theme-id="' + t.id + '"' + (equipped ? ' disabled' : '') + '>' +
      (owned ? (equipped ? 'em uso' : 'equipar') : 'comprar') + '</button></div>';
  }).join('') || '<div class="empty">Nada nesse filtro.</div>';
}
function buyOrEquipTheme(id) {
  const t = THEMES.find((x) => x.id === id);
  if (!t) return;
  if (state.themesOwned.includes(id)) { applyTheme(id); renderStore(); toast('Tema "' + t.name + '" aplicado.', 'fa-palette'); return; }
  if (state.coins < t.price) return toast('Faltam ' + (t.price - state.coins) + ' moedas para esse tema.', 'fa-triangle-exclamation', true);
  state.coins -= t.price;
  state.themesOwned.push(id);
  save(); addCoins(0); applyTheme(id); renderStore();
  toast('Tema "' + t.name + '" comprado!', 'fa-store');
}
function bindStore() {
  renderStore();
  $('#storeFilters') && $('#storeFilters').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    storeFilter = chip.dataset.filter;
    $$('#storeFilters .chip').forEach((c) => c.classList.toggle('active', c === chip));
    renderStore();
  });
  $('#themeGrid') && $('#themeGrid').addEventListener('click', (e) => {
    const b = e.target.closest('[data-theme-id]');
    if (b) buyOrEquipTheme(b.dataset.themeId);
  });
  $('#themeGrid') && $('#themeGrid').addEventListener('mouseover', (e) => {
    const p = e.target.closest('[data-preview]');
    if (p) document.documentElement.setAttribute('data-theme', p.dataset.preview);
  });
  $('#themeGrid') && $('#themeGrid').addEventListener('mouseout', (e) => {
    if (e.target.closest('[data-preview]')) document.documentElement.setAttribute('data-theme', state.theme);
  });
}

/* ============ 20. TÍTULOS ============ */
function renderTitles() {
  const grid = $('#titleGrid');
  if (!grid) return;
  grid.innerHTML = LEVELS.map((l) => {
    const unlocked = state.xp >= l.xp;
    const equipped = state.title === l.title;
    return '<div class="title-card' + (unlocked ? '' : ' locked') + (equipped ? ' equipped' : '') + '">' +
      '<span class="title-name">' + esc(l.title) + '</span>' +
      '<span class="title-meta">' + l.xp + ' XP' + (unlocked ? '' : ' · faltam ' + (l.xp - state.xp)) + '</span>' +
      '<button class="btn btn-sm ' + (equipped ? 'btn-secondary' : 'btn-primary') + '" type="button" data-title="' + esc(l.title) + '"' + (unlocked && !equipped ? '' : ' disabled') + '>' + (equipped ? 'equipado' : unlocked ? 'equipar' : 'bloqueado') + '</button></div>';
  }).join('');
  const info = levelInfo(state.xp);
  const next = $('#titleNext');
  if (next) next.textContent = info.next ? 'Próximo em ' + Math.max(0, info.next.xp - state.xp) + ' XP' : 'Nível máximo';
}
function bindTitles() {
  renderTitles();
  $('#titleGrid') && $('#titleGrid').addEventListener('click', (e) => {
    const b = e.target.closest('[data-title]');
    if (!b) return;
    state.title = b.dataset.title;
    save(); renderTitles(); renderTopbar(); toast('Título equipado: ' + b.dataset.title, 'fa-crown');
  });
}

/* ============ 21. PETS ============ */
function petIncome() { const p = PETS.find((x) => x.id === state.pet); return p ? p.income : 0; }
function renderPets() {
  const grid = $('#petGrid');
  if (!grid) return;
  grid.innerHTML = PETS.map((p) => {
    const owned = state.petsOwned.includes(p.id);
    const active = state.pet === p.id;
    const energy = state.petEnergy[p.id] || 0;
    return '<div class="pet-card' + (active ? ' active' : '') + '">' +
      '<span class="pet-emoji">' + p.emoji + '</span><span class="pet-name">' + esc(p.name) + '</span>' +
      '<span class="pet-meta">' + p.income + ' moedas/tick</span>' +
      '<div class="pet-energy"><span style="width:' + clamp(energy, 0, 100) + '%"></span></div>' +
      '<span class="pet-meta">energia ' + energy + '</span>' +
      '<button class="btn btn-sm ' + (owned ? (active ? 'btn-secondary' : 'btn-primary') : 'btn-secondary') + '" type="button" data-pet="' + p.id + '">' +
      (owned ? (active ? 'ativo' : 'equipar') : '<i class="fa-solid fa-coins"></i> ' + p.price) + '</button>' +
      (owned ? '<button class="btn btn-ghost btn-sm" type="button" data-feed="' + p.id + '">alimentar 15</button>' : '') + '</div>';
  }).join('');
  const sum = $('#petSummary');
  if (sum) {
    const p = PETS.find((x) => x.id === state.pet);
    sum.innerHTML = p ? '<span class="badge">' + p.emoji + ' ' + esc(p.name) + ' equipado</span><span class="badge">+' + p.income + ' moedas/5s</span><span class="badge">energia ' + (state.petEnergy[p.id] || 0) + '</span>'
      : '<span class="badge danger">Nenhum pet equipado</span><span class="badge">renda zero</span>';
  }
}
function petAction(id) {
  const p = PETS.find((x) => x.id === id);
  if (!p) return;
  if (!state.petsOwned.includes(id)) {
    if (state.coins < p.price) return toast('Faltam ' + (p.price - state.coins) + ' moedas.', 'fa-triangle-exclamation', true);
    state.coins -= p.price; state.petsOwned.push(id); state.pet = id; state.petEnergy[id] = state.petEnergy[id] || 10;
    save(); renderPets(); renderTopbar(); renderClickerShop();
    toast('Você adotou ' + p.name + '!', 'fa-paw');
    return;
  }
  state.pet = state.pet === id ? null : id;
  save(); renderPets(); toast(state.pet ? p.name + ' está acompanhando você.' : 'Pet guardado.', 'fa-paw');
}
function feedPet(id) {
  if (state.coins < 15) return toast('Faltam moedas para alimentar.', 'fa-triangle-exclamation', true);
  state.coins -= 15;
  state.petEnergy[id] = clamp((state.petEnergy[id] || 0) + 20, 0, 100);
  state.petFed[id] = Date.now();
  save(); renderPets(); renderTopbar();
  toast('Pet alimentado: +20 de energia.', 'fa-bowl-food');
}
function bindPets() {
  renderPets();
  $('#petGrid') && $('#petGrid').addEventListener('click', (e) => {
    const b = e.target.closest('[data-pet]');
    if (b) return petAction(b.dataset.pet);
    const f = e.target.closest('[data-feed]');
    if (f) feedPet(f.dataset.feed);
  });
}

/* ============ 22. TRILHA, MARCOS E CONQUISTAS ============ */
const MILESTONES = [
  { id: 'focus120', label: '2 horas de foco acumulado', type: 'focus', goal: 120, coins: 20, xp: 15 },
  { id: 'focus600', label: '10 horas de foco acumulado', type: 'focus', goal: 600, coins: 60, xp: 40 },
  { id: 'sessions10', label: '10 sessões registradas', type: 'sessions', goal: 10, coins: 25, xp: 20 },
  { id: 'goals5', label: '5 metas concluídas', type: 'goals', goal: 5, coins: 30, xp: 25 },
  { id: 'streak3', label: 'Sequência de 3 dias', type: 'streak', goal: 3, coins: 25, xp: 20 },
  { id: 'cards20', label: '20 revisões de flashcard', type: 'cards', goal: 20, coins: 30, xp: 25 },
  { id: 'checkins15', label: '15 check-ins registrados', type: 'checkins', goal: 15, coins: 40, xp: 30 },
  { id: 'missions6', label: '6 missões diárias resgatadas', type: 'missions', goal: 6, coins: 35, xp: 25 },
  { id: 'clicker5000', label: '5.000 de energia gerada', type: 'clicker', goal: 5000, coins: 45, xp: 35 },
  { id: 'prestige1', label: 'Primeiro prestígio do núcleo', type: 'prestige', goal: 1, coins: 60, xp: 50 }
];
const ACHIEVEMENTS = [
  { id: 'first_focus', label: 'Primeiro foco registrado', icon: 'fa-play', check: () => state.sessions > 0 },
  { id: 'streak7', label: 'Uma semana inteira de constância', icon: 'fa-fire', check: () => state.streakBest >= 7 },
  { id: 'quiz_master', label: '8 acertos em um quiz', icon: 'fa-brain', check: () => state.quizBest >= 8 },
  { id: 'note_keeper', label: 'Cinco notas criadas', icon: 'fa-note-sticky', check: () => Object.keys(state.notes).length >= 5 },
  { id: 'theme_collector', label: 'Três temas na coleção', icon: 'fa-palette', check: () => state.themesOwned.length >= 3 },
  { id: 'pet_lover', label: 'Um pet adotado', icon: 'fa-paw', check: () => state.petsOwned.length > 0 },
  { id: 'command_user', label: 'Usou um comando de terminal', icon: 'fa-terminal', check: () => state.commandHistory.length > 0 },
  { id: 'redeemer', label: 'Resgatou um código', icon: 'fa-gift', check: () => state.redeemed.length > 0 },
  { id: 'streak14', label: 'Duas semanas de foguinho', icon: 'fa-fire', check: () => state.streakBest >= 14 },
  { id: 'mission5', label: 'Cinco missões diárias resgatadas', icon: 'fa-flag-checkered', check: () => state.missionClaims.length >= 5 },
  { id: 'clicker500', label: '500 cliques no núcleo', icon: 'fa-hand-pointer', check: () => state.clicker.clicks >= 500 },
  { id: 'prestige1', label: 'Primeiro prestígio do núcleo', icon: 'fa-rotate', check: () => (state.clicker.prestige || 0) >= 1 },
  { id: 'shielded', label: 'Usou um escudo de sequência', icon: 'fa-shield-halved', check: () => (state.shieldsUsed || 0) >= 1 }
];
function totalFocus() { return Object.values(state.focusByDate).reduce((a, b) => a + b, 0); }
function milestoneValue(type) {
  if (type === 'focus') return totalFocus();
  if (type === 'sessions') return state.sessions;
  if (type === 'goals') return state.totalGoalsDone;
  if (type === 'streak') return Math.max(state.streakBest, computeStreak());
  if (type === 'cards') return Object.values(state.flashStats).reduce((a, b) => a + b, 0);
  if (type === 'checkins') return Object.keys(state.checkins || {}).length;
  if (type === 'missions') return (state.missionClaims || []).length;
  if (type === 'clicker') return Math.floor(state.clicker.lifetime || 0);
  if (type === 'prestige') return state.clicker.prestige || 0;
  return 0;
}
function renderJourney() {
  const list = $('#journeyList');
  if (list) {
    list.innerHTML = LEVELS.map((l, i) => {
      const next = LEVELS[i + 1];
      const done = state.xp >= (next ? next.xp : l.xp);
      const pct = next ? clamp(((state.xp - l.xp) / (next.xp - l.xp)) * 100, 0, 100) : 100;
      return '<div class="journey-item"><div class="journey-row"><span>' + esc(l.title) + (done ? ' <i class="fa-solid fa-check" style="color:var(--primary)"></i>' : '') + '</span><b>' + l.xp + ' XP</b></div>' +
        '<div class="journey-bar"><span style="width:' + pct + '%"></span></div></div>';
    }).join('');
  }
  renderAchievements();
  const ms = $('#milestoneList');
  if (!ms) return;
  ms.innerHTML = MILESTONES.map((m) => {
    const value = milestoneValue(m.type);
    const claimed = state.milestonesClaimed.includes(m.id);
    const ready = value >= m.goal && !claimed;
    return '<div class="milestone' + (claimed ? ' claimed' : ready ? ' claimable' : '') + '"><i class="fa-solid ' + (claimed ? 'fa-circle-check' : 'fa-flag') + '" style="color:var(--gold)"></i>' +
      '<div class="ms-main"><span>' + esc(m.label) + '</span><span class="ms-sub">' + Math.min(value, m.goal) + '/' + m.goal + ' · +' + m.coins + ' moedas +' + m.xp + ' XP</span></div>' +
      '<button class="btn btn-sm ' + (ready ? 'btn-primary' : 'btn-secondary') + '" type="button" data-milestone="' + m.id + '"' + (ready ? '' : ' disabled') + '>' + (claimed ? 'resgatado' : ready ? 'resgatar' : 'em curso') + '</button></div>';
  }).join('');
}
function renderAchievements() {
  const box = $('#achievementList');
  if (!box) return;
  box.innerHTML = ACHIEVEMENTS.map((a) => {
    const unlocked = !!a.check();
    return '<div class="ach-item ' + (unlocked ? 'unlocked' : 'locked') + '"><i class="fa-solid ' + a.icon + '"></i><span>' + esc(a.label) + '</span>' + (unlocked ? '<i class="fa-solid fa-check" style="margin-left:auto;color:var(--primary)"></i>' : '') + '</div>';
  }).join('');
}
function bindJourney() {
  renderJourney();
  $('#milestoneList') && $('#milestoneList').addEventListener('click', (e) => {
    const b = e.target.closest('[data-milestone]');
    if (!b || b.disabled) return;
    const m = MILESTONES.find((x) => x.id === b.dataset.milestone);
    if (!m || state.milestonesClaimed.includes(m.id)) return;
    state.milestonesClaimed.push(m.id);
    addCoins(m.coins); addXp(m.xp);
    renderJourney();
    toast('Marco resgatado: +' + m.coins + ' moedas, +' + m.xp + ' XP.', 'fa-gift');
  });
}

/* ============ 23. CLICKER ============ */
const UPGRADES = [
  { id: 'mouse', name: 'Mouse extra', base: 18, rate: 1, click: 1, desc: '+1 ⚡/s · +1 por clique' },
  { id: 'monitor', name: 'Segundo monitor', base: 70, rate: 3, click: 0, desc: '+3 ⚡/s' },
  { id: 'teclado', name: 'Teclado mecânico', base: 150, rate: 0, click: 3, desc: '+3 energia por clique' },
  { id: 'cafe', name: 'Café reforçado', base: 260, rate: 7, click: 1, desc: '+7 ⚡/s · +1 por clique' },
  { id: 'setup', name: 'Setup gamer', base: 640, rate: 16, click: 3, desc: '+16 ⚡/s · +3 por clique' },
  { id: 'servidor', name: 'Servidor local', base: 1500, rate: 45, click: 0, desc: '+45 ⚡/s' }
];
const CLICKER_EXCHANGES = [
  { energy: 50, coins: 5, label: '50 ⚡ → 5 moedas' },
  { energy: 500, coins: 60, label: '500 ⚡ → 60 moedas' },
  { energy: 2500, coins: 350, label: '2.500 ⚡ → 350 moedas' }
];
const PRESTIGE_BASE = 6000;
const CLICK_COMBO_WINDOW = 900;
let clickerCombo = { count: 0, at: 0 };
let clickerLastTick = Date.now();
let clickerSaveTimer = null;

function prestigeMult() { return 1 + (state.clicker.prestige || 0) * 0.15; }
function upgradeLevel(id) { return state.clicker.upgrades[id] || 0; }
function upgradeCost(u, amount = 1) {
  const lvl = upgradeLevel(u.id);
  let total = 0;
  for (let i = 0; i < amount; i++) total += Math.round(u.base * Math.pow(1.55, lvl + i));
  return total;
}
function clickerRate() {
  return Math.round(UPGRADES.reduce((acc, u) => acc + upgradeLevel(u.id) * u.rate, 0) * prestigeMult());
}
function clickerPower() {
  return Math.round((1 + UPGRADES.reduce((acc, u) => acc + upgradeLevel(u.id) * u.click, 0)) * prestigeMult());
}
function prestigeRequirement() { return Math.round(PRESTIGE_BASE * Math.pow((state.clicker.prestige || 0) + 1, 1.6)); }
function prestigeProgress() { return clamp((state.clicker.lifetime || 0) / prestigeRequirement(), 0, 1); }
function buyAmount() { return state.clicker.buyAmount === 'max' ? 'max' : (Number(state.clicker.buyAmount) || 1); }
function affordableAmount(u) {
  const amount = buyAmount();
  if (amount !== 'max') return amount;
  let n = 0;
  let pts = state.clicker.points;
  while (n < 500) {
    const c = Math.round(u.base * Math.pow(1.55, upgradeLevel(u.id) + n));
    if (c > pts) break;
    pts -= c;
    n++;
  }
  return Math.max(1, n);
}
function comboMult() { return 1 + Math.min(clickerCombo.count, 50) * 0.02; }
function renderClickerHud() {
  const pts = $('#clickerPoints'); if (pts) pts.textContent = money(Math.floor(state.clicker.points));
  const cps = $('#clickerCps'); if (cps) cps.textContent = money(clickerRate()) + '/s';
  const power = $('#clickerClickPower'); if (power) power.textContent = '+' + money(clickerPower());
  const total = $('#clickerTotal'); if (total) total.textContent = money(Math.floor(state.clicker.total || 0)) + ' ⚡';
  const clicks = $('#clickerClicks'); if (clicks) clicks.textContent = money(state.clicker.clicks || 0);
  const lifetime = $('#clickerLifetime'); if (lifetime) lifetime.textContent = money(Math.floor(state.clicker.lifetime || 0)) + ' ⚡';
  const comboEl = $('#clickerCombo');
  if (comboEl) {
    comboEl.textContent = clickerCombo.count > 1 ? 'combo x' + comboMult().toFixed(2).replace('.', ',') : 'sem combo';
    comboEl.classList.toggle('on', clickerCombo.count > 1);
  }
  const coin = $('#clickerCoinCount'); if (coin) coin.textContent = money(state.coins);
  const auto = $('#clickerAutoExchange'); if (auto) auto.checked = !!state.clicker.autoExchange;
  CLICKER_EXCHANGES.forEach((x, i) => {
    const b = $('#clickerExchange' + i);
    if (b) b.disabled = state.clicker.points < x.energy;
  });
}
function renderPrestige() {
  const box = $('#clickerPrestige');
  if (!box) return;
  const req = prestigeRequirement();
  const pct = Math.round(prestigeProgress() * 100);
  const ready = (state.clicker.lifetime || 0) >= req;
  box.innerHTML = '<div class="prestige-head"><span class="kicker">Prestígio</span><b>Núcleo ' + (state.clicker.prestige || 0) + ' · +' + Math.round((state.clicker.prestige || 0) * 15) + '%</b>' +
    '<span class="status-text">' + money(Math.floor(state.clicker.lifetime || 0)) + ' / ' + money(req) + ' ⚡</span></div>' +
    '<div class="progress"><span style="width:' + pct + '%"></span></div>' +
    '<button class="btn btn-sm ' + (ready ? 'btn-primary' : 'btn-secondary') + '" type="button" data-prestige' + (ready ? '' : ' disabled') + '>' +
    (ready ? 'Reiniciar núcleo (+15% permanente)' : 'Faltam ' + money(Math.ceil(req - (state.clicker.lifetime || 0))) + ' ⚡') + '</button>' +
    '<p class="hint">Prestígio reinicia energia e melhorias, mas mantém moedas, cliques e o bônus permanente.</p>';
}
function renderClickerShop() {
  const box = $('#clickerShop');
  if (!box) return;
  const amount = buyAmount();
  box.innerHTML = UPGRADES.map((u) => {
    const lvl = upgradeLevel(u.id);
    const n = affordableAmount(u);
    const cost = upgradeCost(u, n);
    const disabled = state.clicker.points < cost;
    return '<div class="clicker-upgrade"><span class="cu-icon"><i class="fa-solid ' + (u.click ? 'fa-hand-pointer' : 'fa-bolt') + '"></i></span>' +
      '<div class="cu-main"><span class="cu-title">' + esc(u.name) + ' <span class="badge">nível ' + lvl + '</span></span>' +
      '<span class="cu-sub">' + esc(u.desc) + '</span></div>' +
      '<button class="btn btn-sm btn-secondary" type="button" data-upgrade="' + u.id + '"' + (disabled ? ' disabled' : '') + '>' +
      (amount === 'max' ? 'máx ' + n : 'x' + n) + ' · ' + money(cost) + ' ⚡</button></div>';
  }).join('');
  $$('#clickerBuyAmount [data-amount]').forEach((x) => x.classList.toggle('active', String(x.dataset.amount) === String(state.clicker.buyAmount)));
  renderClickerHud();
  renderPrestige();
}
function scheduleClickerSave() {
  if (clickerSaveTimer) return;
  clickerSaveTimer = setTimeout(() => { clickerSaveTimer = null; save(); }, 2500);
}
function autoExchange() {
  const tier = CLICKER_EXCHANGES[CLICKER_EXCHANGES.length - 1];
  let guard = 0;
  let converted = 0;
  while (state.clicker.points >= tier.energy && guard++ < 20) {
    state.clicker.points -= tier.energy;
    state.coins += tier.coins;
    state.coinsEarned = (state.coinsEarned || 0) + tier.coins;
    state.clicker.exchanges = (state.clicker.exchanges || 0) + 1;
    converted += tier.coins;
  }
  if (converted) { renderTopbar(); if (state.currentTab === 'store') renderStore(); }
}
function clickerTick() {
  const now = Date.now();
  const dt = clamp((now - clickerLastTick) / 1000, 0, 5);
  clickerLastTick = now;
  state.clicker.lastSeen = now;
  const rate = clickerRate();
  if (rate > 0) {
    state.clicker.points += rate * dt;
    state.clicker.total = (state.clicker.total || 0) + rate * dt;
    state.clicker.lifetime = (state.clicker.lifetime || 0) + rate * dt;
    if (state.clicker.autoExchange) autoExchange();
    renderClickerHud();
    scheduleClickerSave();
  }
}
function floatClickerGain(gain, e) {
  if (state.motionReduced) return;
  const host = $('#clickerCore');
  if (!host) return;
  const r = host.getBoundingClientRect();
  const span = document.createElement('span');
  span.className = 'clicker-float';
  span.textContent = '+' + money(gain);
  span.style.left = ((e && e.clientX ? e.clientX - r.left : r.width / 2) + 'px');
  span.style.top = ((e && e.clientY ? e.clientY - r.top : r.height / 2) + 'px');
  host.appendChild(span);
  span.addEventListener('animationend', () => span.remove(), { once: true });
  setTimeout(() => span.remove(), 1200);
}
function clickerClick(e) {
  const now = Date.now();
  if (now - clickerCombo.at <= CLICK_COMBO_WINDOW) clickerCombo.count = Math.min(clickerCombo.count + 1, 50);
  else clickerCombo.count = 1;
  clickerCombo.at = now;
  if (clickerCombo.count > (state.clicker.comboBest || 0)) state.clicker.comboBest = clickerCombo.count;
  const gain = Math.max(1, Math.round(clickerPower() * comboMult()));
  state.clicker.points += gain;
  state.clicker.total = (state.clicker.total || 0) + gain;
  state.clicker.lifetime = (state.clicker.lifetime || 0) + gain;
  state.clicker.clicks = (state.clicker.clicks || 0) + 1;
  dailyBump('clicks', 1);
  floatClickerGain(gain, e);
  renderClickerHud();
  scheduleClickerSave();
  beep(520 + Math.min(clickerCombo.count, 20) * 12, 0.04, 'square', 0.035);
}
function exchangeClicker(index) {
  const tier = CLICKER_EXCHANGES[index];
  if (!tier) return;
  if (state.clicker.points < tier.energy) return toast('Junte ' + tier.energy + ' de energia primeiro.', 'fa-triangle-exclamation', true);
  state.clicker.points -= tier.energy;
  state.clicker.exchanges = (state.clicker.exchanges || 0) + 1;
  dailyBump('exchanges', 1);
  addCoins(tier.coins);
  renderClickerShop();
  toast('Energia trocada por ' + tier.coins + ' moedas.', 'fa-coins');
}
function buyUpgrade(id) {
  const u = UPGRADES.find((x) => x.id === id);
  if (!u) return;
  const qty = affordableAmount(u);
  const cost = upgradeCost(u, qty);
  if (state.clicker.points < cost) return toast('Energia insuficiente.', 'fa-triangle-exclamation', true);
  state.clicker.points -= cost;
  state.clicker.upgrades[id] = upgradeLevel(id) + qty;
  save();
  renderClickerShop();
  toast(u.name + ' · nível ' + state.clicker.upgrades[id] + '!', 'fa-arrow-up');
}
function doPrestige() {
  const req = prestigeRequirement();
  if ((state.clicker.lifetime || 0) < req) return;
  if (!confirm('Reiniciar o núcleo? Você perde energia e melhorias, ganha +15% permanente e mantém moedas e cliques.')) return;
  state.clicker.prestige = (state.clicker.prestige || 0) + 1;
  state.clicker.points = 0;
  state.clicker.upgrades = {};
  state.clicker.lifetime = 0;
  saveNow();
  renderClickerShop();
  renderTopbar();
  toast('Prestígio ' + state.clicker.prestige + '! +15% de energia permanente.', 'fa-rotate');
}
function applyOfflineEnergy() {
  const now = Date.now();
  const last = Number(state.clicker.lastSeen) || 0;
  state.clicker.lastSeen = now;
  if (!last) return;
  const elapsed = clamp((now - last) / 1000, 0, 600);
  const rate = clickerRate();
  if (rate <= 0 || elapsed < 30) return;
  const gain = rate * elapsed;
  state.clicker.points += gain;
  state.clicker.total = (state.clicker.total || 0) + gain;
  state.clicker.lifetime = (state.clicker.lifetime || 0) + gain;
  setTimeout(() => toast('Núcleo rendeu ' + money(Math.floor(gain)) + ' ⚡ enquanto você estava fora (máx. 10 min).', 'fa-bolt'), 1200);
}
function bindClicker() {
  renderClickerShop();
  $('#clickerCore') && $('#clickerCore').addEventListener('click', clickerClick);
  CLICKER_EXCHANGES.forEach((x, i) => {
    const b = $('#clickerExchange' + i);
    if (b) b.addEventListener('click', () => exchangeClicker(i));
  });
  $('#clickerAutoExchange') && $('#clickerAutoExchange').addEventListener('change', (e) => {
    state.clicker.autoExchange = e.target.checked;
    save();
    toast(e.target.checked ? 'Auto-troca ativada: 2.500 ⚡ viram 350 moedas.' : 'Auto-troca desativada.', 'fa-coins');
  });
  $('#clickerBuyAmount') && $('#clickerBuyAmount').addEventListener('click', (e) => {
    const b = e.target.closest('[data-amount]');
    if (!b) return;
    state.clicker.buyAmount = b.dataset.amount === 'max' ? 'max' : Number(b.dataset.amount);
    save();
    renderClickerShop();
  });
  $('#clickerShop') && $('#clickerShop').addEventListener('click', (e) => {
    const b = e.target.closest('[data-upgrade]');
    if (b) buyUpgrade(b.dataset.upgrade);
  });
  document.addEventListener('click', (e) => { if (e.target.closest('[data-prestige]')) doPrestige(); });
  document.addEventListener('keydown', (e) => {
    if (state.currentTab !== 'clicker') return;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); clickerClick(); }
  });
  setInterval(clickerTick, 500);
}

/* ============ 24. SONS AMBIENTE ============ */
const AMBIENT_LAYERS = [
  { id: 'rain', name: 'Chuva', icon: 'fa-cloud-rain', freq: 1200, q: 0.6, type: 'lowpass' },
  { id: 'noise', name: 'Ruído marrom', icon: 'fa-wave-square', freq: 420, q: 0.4, type: 'lowpass' },
  { id: 'waves', name: 'Ondas', icon: 'fa-water', freq: 700, q: 0.9, type: 'bandpass' },
  { id: 'fire', name: 'Lareira', icon: 'fa-fire', freq: 260, q: 0.7, type: 'lowpass' },
  { id: 'wind', name: 'Vento', icon: 'fa-wind', freq: 520, q: 1.4, type: 'bandpass' }
];
const ambient = { ctx: null, nodes: {}, gains: {}, master: null, timer: null };
function ambientCtx() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ambient.ctx) {
    ambient.ctx = new AC();
    ambient.master = ambient.ctx.createGain();
    ambient.master.gain.value = state.ambient.master / 100;
    ambient.master.connect(ambient.ctx.destination);
  }
  if (ambient.ctx.state === 'suspended') ambient.ctx.resume();
  return ambient.ctx;
}
function ambientStart(id) {
  const ctx = ambientCtx();
  if (!ctx) return;
  const layer = AMBIENT_LAYERS.find((l) => l.id === id);
  if (!layer) return;
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.2;
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer; src.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = layer.type; filter.frequency.value = layer.freq; filter.Q.value = layer.q;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  src.connect(filter); filter.connect(gain); gain.connect(ambient.master);
  src.start();
  ambient.nodes[id] = src;
  ambient.gains[id] = gain;
  gain.gain.linearRampToValueAtTime((state.ambient.layers[id] || 40) / 100, ctx.currentTime + 0.8);
}
function ambientStop(id) {
  const node = ambient.nodes[id];
  const gain = ambient.gains[id];
  if (gain && ambient.ctx) gain.gain.linearRampToValueAtTime(0, ambient.ctx.currentTime + 0.3);
  setTimeout(() => { try { node && node.stop(); } catch (e) { /* ignore */ } }, 350);
  delete ambient.nodes[id]; delete ambient.gains[id];
}
function ambientSetVolume(id, value) {
  state.ambient.layers[id] = value;
  const gain = ambient.gains[id];
  if (gain && ambient.ctx) gain.gain.linearRampToValueAtTime(value / 100, ambient.ctx.currentTime + 0.2);
  const cell = $('[data-ambient="' + id + '"]');
  if (cell) cell.classList.toggle('on', value > 0);
}
function renderAmbient() {
  const grid = $('#ambientGrid');
  if (!grid) return;
  grid.innerHTML = AMBIENT_LAYERS.map((l) => '<div class="ambient-layer' + ((state.ambient.layers[l.id] || 0) > 0 ? ' on' : '') + '" data-ambient="' + l.id + '">' +
    '<div class="ambient-head"><span><i class="fa-solid ' + l.icon + '"></i>' + esc(l.name) + '</span>' +
    '<button class="btn btn-icon btn-ghost btn-sm" type="button" data-ambient-toggle="' + l.id + '"><i class="fa-solid ' + ((state.ambient.layers[l.id] || 0) > 0 ? 'fa-pause' : 'fa-play') + '"></i></button></div>' +
    '<input type="range" min="0" max="100" value="' + (state.ambient.layers[l.id] || 0) + '" data-ambient-range="' + l.id + '" aria-label="Volume de ' + esc(l.name) + '"></div>').join('');
  const master = $('#ambientMaster');
  if (master) master.value = state.ambient.master;
  const mv = $('#ambientMasterValue');
  if (mv) mv.textContent = state.ambient.master;
}
function bindAmbient() {
  renderAmbient();
  $('#ambientGrid') && $('#ambientGrid').addEventListener('click', (e) => {
    const b = e.target.closest('[data-ambient-toggle]');
    if (!b) return;
    const id = b.dataset.ambientToggle;
    const on = ambient.nodes[id];
    if (on) { ambientStop(id); state.ambient.layers[id] = 0; }
    else {
      if (!(state.ambient.layers[id] > 0)) state.ambient.layers[id] = 45;
      ambientStart(id);
    }
    save(); renderAmbient();
  });
  $('#ambientGrid') && $('#ambientGrid').addEventListener('input', (e) => {
    const r = e.target.closest('[data-ambient-range]');
    if (!r) return;
    const id = r.dataset.ambientRange;
    ambientSetVolume(id, Number(r.value));
    if (!ambient.nodes[id] && Number(r.value) > 0) ambientStart(id);
  });
  $('#ambientStopAll') && $('#ambientStopAll').addEventListener('click', () => {
    Object.keys(ambient.nodes).forEach(ambientStop);
    AMBIENT_LAYERS.forEach((l) => { state.ambient.layers[l.id] = 0; });
    clearInterval(ambient.timer);
    save(); renderAmbient(); toast('Tudo silenciado.', 'fa-volume-xmark');
  });
  $('#ambientMaster') && $('#ambientMaster').addEventListener('input', (e) => {
    state.ambient.master = Number(e.target.value);
    const mv = $('#ambientMasterValue'); if (mv) mv.textContent = state.ambient.master;
    if (ambient.master) ambient.master.gain.value = state.ambient.master / 100;
    save();
  });
  $('#ambientPreset') && $('#ambientPreset').addEventListener('change', (e) => {
    const preset = e.target.value;
    if (!preset) return;
    const map = {
      focus: { rain: 30, noise: 55, waves: 0, fire: 0, wind: 0 },
      rain: { rain: 60, noise: 20, waves: 0, fire: 25, wind: 10 },
      study: { rain: 0, noise: 35, waves: 15, fire: 10, wind: 0 },
      storm: { rain: 72, noise: 18, waves: 26, fire: 0, wind: 42 }
    }[preset];
    Object.keys(ambient.nodes).forEach(ambientStop);
    AMBIENT_LAYERS.forEach((l) => { state.ambient.layers[l.id] = map[l.id] || 0; if (state.ambient.layers[l.id] > 0) ambientStart(l.id); });
    save(); renderAmbient(); toast('Preset aplicado.', 'fa-headphones');
  });
  $('#ambientTimer') && $('#ambientTimer').addEventListener('input', (e) => {
    const minutes = Number(e.target.value);
    const label = $('#ambientTimerValue'); if (label) label.textContent = minutes ? minutes + 'min' : 'off';
    clearInterval(ambient.timer);
    if (!minutes) return;
    const end = Date.now() + minutes * 60000;
    ambient.timer = setInterval(() => {
      const left = end - Date.now();
      const master = $('#ambientMaster');
      if (left <= 0) {
        clearInterval(ambient.timer);
        Object.keys(ambient.nodes).forEach(ambientStop);
        AMBIENT_LAYERS.forEach((l) => { state.ambient.layers[l.id] = 0; });
        renderAmbient(); toast('Sons desligados pelo timer.', 'fa-clock');
        return;
      }
      if (ambient.master) ambient.master.gain.value = (state.ambient.master / 100) * clamp(left / (minutes * 60000), 0.15, 1);
      if (master) master.value = state.ambient.master;
    }, 1000);
  });
}

/* ============ 25. SOM DE TECLADO ============ */
const KEY_STYLES = {
  soft: { freq: 520, type: 'sine', dur: 0.05, vol: 0.05 },
  mechanical: { freq: 240, type: 'square', dur: 0.04, vol: 0.06 },
  typewriter: { freq: 160, type: 'triangle', dur: 0.07, vol: 0.07 },
  pop: { freq: 760, type: 'sine', dur: 0.035, vol: 0.05 },
  retro: { freq: 980, type: 'square', dur: 0.028, vol: 0.04 }
};
function playKeySound() {
  if (!state.keySounds.on) return;
  const s = KEY_STYLES[state.keySounds.style] || KEY_STYLES.soft;
  const scale = (state.keySounds.volume || 45) / 100;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = s.type;
    osc.frequency.value = s.freq + Math.random() * 40;
    gain.gain.value = s.vol * scale * 4;
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + s.dur);
    osc.stop(ctx.currentTime + s.dur);
    setTimeout(() => ctx.close(), 300);
  } catch (e) { /* ignore */ }
}
function renderKeySounds() {
  const t = $('#keySoundToggle'); if (t) t.checked = !!state.keySounds.on;
  const s = $('#keySoundStyle'); if (s) s.value = state.keySounds.style;
  const v = $('#keySoundVolume'); if (v) v.value = state.keySounds.volume;
  const vl = $('#keySoundVolumeValue'); if (vl) vl.textContent = state.keySounds.volume;
}
function bindKeySounds() {
  renderKeySounds();
  $('#keySoundToggle') && $('#keySoundToggle').addEventListener('change', (e) => { state.keySounds.on = e.target.checked; save(); toast(e.target.checked ? 'Sons de teclado ativados.' : 'Sons desativados.', 'fa-keyboard'); });
  $('#keySoundStyle') && $('#keySoundStyle').addEventListener('change', (e) => { state.keySounds.style = e.target.value; save(); playKeySound(); });
  $('#keySoundVolume') && $('#keySoundVolume').addEventListener('input', (e) => {
    state.keySounds.volume = Number(e.target.value);
    const vl = $('#keySoundVolumeValue'); if (vl) vl.textContent = state.keySounds.volume;
    save();
  });
  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) && e.key.length === 1) playKeySound();
  });
}
/* ============================================================
   Geekie Study Hub v20.1.0 — script.js (parte 4/4)
   Calculadora, caracteres, título, eventos, portais, comandos,
   recompensas, dev log, senhas, bindings globais e boot
   ============================================================ */

/* ============ 26. CALCULADORA ============ */
const calc = { expr: '', result: 0, history: [], memory: 0 };
function calcEvaluate(raw) {
  let expr = String(raw || '').replace(/,/g, '.').replace(/[×x]/gi, '*').replace(/÷/g, '/').replace(/−/g, '-');
  if (!/^[-+*/%().\d\s]+$/.test(expr)) throw new Error('Expressão inválida');
  expr = expr.replace(/(\d+(?:\.\d+)?)\s*%/g, '($1/100)');
  const value = Function('"use strict";return (' + expr + ')')();
  if (typeof value !== 'number' || !isFinite(value)) throw new Error('Resultado inválido');
  return Math.round(value * 1e10) / 1e10;
}
function calcRender() {
  const e = $('#calcExpression');
  if (e) e.textContent = calc.expr || '\u00a0';
  const r = $('#calcResult');
  if (r) r.textContent = String(calc.result);
  const h = $('#calcHistory');
  if (h) {
    h.innerHTML = calc.history.length ? calc.history.map((item, i) => '<button class="pass-item" type="button" data-calc-history="' + i + '"><span>' + esc(item.expr) + '</span><b style="color:var(--primary)">' + esc(item.result) + '</b></button>').join('') : '<div class="empty">Sem cálculos ainda.</div>';
  }
}
function calcPress(key) {
  if (key === 'clear') { calc.expr = ''; calc.result = 0; return calcRender(); }
  if (key === 'back') { calc.expr = calc.expr.slice(0, -1); return calcRender(); }
  if (key === '=') {
    try {
      const value = calcEvaluate(calc.expr);
      calc.result = value;
      calc.history.unshift({ expr: calc.expr, result: value, at: Date.now() });
      calc.history = calc.history.slice(0, 20);
      state.calcHistory = calc.history.slice();
      save();
      calc.expr = String(value);
      calcRender();
    } catch (err) {
      calc.result = 'erro';
      calcRender();
      toast('Expressão inválida.', 'fa-triangle-exclamation', true);
    }
    return;
  }
  calc.expr += key === '.' ? '.' : key;
  calcRender();
}
function bindCalculator() {
  if (Array.isArray(state.calcHistory) && state.calcHistory.length) calc.history = state.calcHistory.slice(0, 20);
  calcRender();
  $('#calcMemory') && $('#calcMemory').addEventListener('click', (e) => {
    const b = e.target.closest('[data-calc-mem]');
    if (!b) return;
    const action = b.dataset.calcMem;
    if (action === 'add') { calc.memory = (calc.memory || 0) + (Number(calc.result) || 0); toast('Na memória: ' + calc.memory, 'fa-calculator'); }
    if (action === 'recall') { calc.expr += String(calc.memory || 0); calcRender(); }
    if (action === 'clear') { calc.memory = 0; toast('Memória limpa.', 'fa-eraser'); }
  });
  $('#calcKeys') && $('#calcKeys').addEventListener('click', (e) => {
    const b = e.target.closest('[data-calc]');
    if (b) calcPress(b.dataset.calc);
  });
  $('#calcHistory') && $('#calcHistory').addEventListener('click', (e) => {
    const b = e.target.closest('[data-calc-history]');
    if (!b) return;
    const item = calc.history[Number(b.dataset.calcHistory)];
    if (item) { calc.expr = item.expr; calc.result = item.result; calcRender(); }
  });
  $('#calcHistoryClear') && $('#calcHistoryClear').addEventListener('click', () => {
    calc.history = [];
    state.calcHistory = [];
    save();
    calcRender();
  });
  document.addEventListener('keydown', (e) => {
    if (state.currentTab !== 'calculator') return;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
    if (/^[0-9.+\-*/()%]$/.test(e.key)) { e.preventDefault(); calcPress(e.key); }
    if (e.key === 'Enter') { e.preventDefault(); calcPress('='); }
    if (e.key === 'Backspace') { e.preventDefault(); calcPress('back'); }
    if (e.key === 'Escape') { e.preventDefault(); calcPress('clear'); }
  });
}

/* ============ 27. CARACTERES ============ */
const CHAR_CATS = [
  { name: 'Favoritos', items: [] },
  { name: 'Matemática', items: [
    ['∑', 'somatório'], ['∏', 'produtório'], ['√', 'raiz quadrada'], ['∛', 'raiz cúbica'], ['∜', 'raiz quarta'],
    ['∫', 'integral'], ['∬', 'integral dupla'], ['∮', 'integral de linha'], ['≈', 'aproximado'], ['≠', 'diferente'],
    ['≡', 'idêntico'], ['≤', 'menor ou igual'], ['≥', 'maior ou igual'], ['≪', 'muito menor'], ['≫', 'muito maior'],
    ['∞', 'infinito'], ['±', 'mais ou menos'], ['∓', 'menos ou mais'], ['π', 'pi'], ['τ', 'tau'],
    ['Δ', 'delta'], ['θ', 'teta'], ['°', 'grau'], ['′', 'linha'], ['″', 'duas linhas'],
    ['%', 'porcento'], ['‰', 'por mil'], ['√x', 'raiz de x'], ['x²', 'x ao quadrado'], ['x³', 'x ao cubo'],
    ['a/b', 'fração'], ['|x|', 'módulo'], ['⌊x⌋', 'piso'], ['⌈x⌉', 'teto'], ['·', 'vezes'],
    ['÷', 'dividido'], ['−', 'menos'], ['ⁿ√', 'raiz enésima'], ['∠', 'ângulo'], ['⊥', 'perpendicular'],
    ['∥', 'paralelo'], ['△', 'triângulo'], ['⊙', 'circunferência']
  ] },
  { name: 'Frações e potências', items: [
    ['½', 'um meio'], ['⅓', 'um terço'], ['⅔', 'dois terços'], ['¼', 'um quarto'], ['¾', 'três quartos'],
    ['⅕', 'um quinto'], ['⅖', 'dois quintos'], ['⅗', 'três quintos'], ['⅘', 'quatro quintos'], ['⅙', 'um sexto'],
    ['⅚', 'cinco sextos'], ['⅛', 'um oitavo'], ['⅜', 'três oitavos'], ['⅝', 'cinco oitavos'], ['⅞', 'sete oitavos'],
    ['⁰', 'super zero'], ['¹', 'super um'], ['²', 'super dois'], ['³', 'super três'], ['⁴', 'super quatro'],
    ['⁵', 'super cinco'], ['⁶', 'super seis'], ['⁷', 'super sete'], ['⁸', 'super oito'], ['⁹', 'super nove'],
    ['⁺', 'super mais'], ['⁻', 'super menos'], ['⁼', 'super igual'], ['⁽', 'super abre'], ['⁾', 'super fecha'],
    ['ⁿ', 'super n'], ['₀', 'sub zero'], ['₁', 'sub um'], ['₂', 'sub dois'], ['₃', 'sub três'],
    ['₄', 'sub quatro'], ['₅', 'sub cinco'], ['₆', 'sub seis'], ['₇', 'sub sete'], ['₈', 'sub oito'],
    ['₉', 'sub nove'], ['₊', 'sub mais'], ['₋', 'sub menos'], ['₌', 'sub igual']
  ] },
  { name: 'Gregos', items: [
    ['α', 'alfa'], ['β', 'beta'], ['γ', 'gama'], ['δ', 'delta'], ['ε', 'épsilon'], ['ζ', 'zeta'],
    ['η', 'eta'], ['θ', 'teta'], ['ι', 'iota'], ['κ', 'capá'], ['λ', 'lambda'], ['μ', 'mi'],
    ['ν', 'ni'], ['ξ', 'xi'], ['ο', 'ômicron'], ['π', 'pi'], ['ρ', 'rô'], ['σ', 'sigma'],
    ['τ', 'tau'], ['υ', 'upsilon'], ['φ', 'fi'], ['χ', 'qui'], ['ψ', 'psi'], ['ω', 'ômega'],
    ['Α', 'alfa maiúsculo'], ['Β', 'beta maiúsculo'], ['Γ', 'gama maiúsculo'], ['Δ', 'delta maiúsculo'], ['Ε', 'épsilon maiúsculo'], ['Ζ', 'zeta maiúsculo'],
    ['Η', 'eta maiúsculo'], ['Θ', 'teta maiúsculo'], ['Ι', 'iota maiúsculo'], ['Κ', 'capá maiúsculo'], ['Λ', 'lambda maiúsculo'], ['Μ', 'mi maiúsculo'],
    ['Ν', 'ni maiúsculo'], ['Ξ', 'xi maiúsculo'], ['Ο', 'ômicron maiúsculo'], ['Π', 'pi maiúsculo'], ['Ρ', 'rô maiúsculo'], ['Σ', 'sigma maiúsculo'],
    ['Τ', 'tau maiúsculo'], ['Υ', 'upsilon maiúsculo'], ['Φ', 'fi maiúsculo'], ['Χ', 'qui maiúsculo'], ['Ψ', 'psi maiúsculo'], ['Ω', 'ômega maiúsculo']
  ] },
  { name: 'Lógica e conjuntos', items: [
    ['∈', 'pertence'], ['∉', 'não pertence'], ['∋', 'contém'], ['⊂', 'subconjunto'], ['⊃', 'superconjunto'],
    ['⊆', 'subconjunto ou igual'], ['⊇', 'superconjunto ou igual'], ['∪', 'união'], ['∩', 'intersecção'], ['∅', 'conjunto vazio'],
    ['∀', 'para todo'], ['∃', 'existe'], ['∄', 'não existe'], ['¬', 'negação'], ['∧', 'e lógico'],
    ['∨', 'ou lógico'], ['⊕', 'ou exclusivo'], ['⊗', 'produto tensorial'], ['∴', 'portanto'], ['∵', 'porque'],
    ['⇒', 'implica'], ['⇐', 'somente se'], ['⇔', 'se e somente se'], ['⊢', 'deduz'], ['⊨', 'satisfaz'],
    ['ℵ', 'aleph'], ['∼', 'equivalente a'], ['≅', 'congruente'], ['≢', 'não idêntico'], ['○', 'composição']
  ] },
  { name: 'Setas', items: [
    ['→', 'direita'], ['←', 'esquerda'], ['↑', 'cima'], ['↓', 'baixo'], ['↔', 'duas direções'], ['↕', 'vertical'],
    ['⇒', 'implica'], ['⇐', 'volta'], ['⇔', 'equivalente'], ['⇑', 'cima dupla'], ['⇓', 'baixo dupla'], ['↦', 'mapeia'],
    ['↩', 'retorno'], ['↪', 'avança'], ['↺', 'gira anti-horário'], ['↻', 'gira horário'], ['⤴', 'sobe curva'], ['⤵', 'desce curva'],
    ['↗', 'nordeste'], ['↘', 'sudeste'], ['↖', 'noroeste'], ['↙', 'sudoeste'], ['⟶', 'seta longa'], ['⟵', 'seta longa esquerda'],
    ['⇄', 'troca'], ['⇆', 'troca dupla'], ['⇌', 'equilíbrio'], ['⇋', 'equilíbrio inverso'], ['▶', 'play'], ['▷', 'triângulo direita']
  ] },
  { name: 'Química', items: [
    ['H₂O', 'água'], ['CO₂', 'gás carbônico'], ['O₂', 'oxigênio'], ['N₂', 'nitrogênio'], ['CH₄', 'metano'], ['NH₃', 'amônia'],
    ['H₂SO₄', 'ácido sulfúrico'], ['HCl', 'ácido clorídrico'], ['NaOH', 'hidróxido de sódio'], ['C₆H₁₂O₆', 'glicose'], ['CO', 'monóxido de carbono'], ['NO₂', 'dióxido de nitrogênio'],
    ['⇌', 'equilíbrio químico'], ['⇋', 'equilíbrio inverso'], ['↑', 'gás liberado'], ['↓', 'precipitado'], ['Δ', 'aquecimento'], ['°C', 'grau Celsius'],
    ['mol', 'mol'], ['pH', 'potencial hidrogeniônico'], ['pOH', 'potencial hidroxiliônico'], ['M', 'molaridade'], ['mM', 'milimolar'], ['µL', 'microlitro'],
    ['mL', 'mililitro'], ['L', 'litro'], ['g', 'grama'], ['mg', 'miligrama'], ['kJ', 'quilojoule'], ['kcal', 'quilocaloria']
  ] },
  { name: 'Física e unidades', items: [
    ['℃', 'grau Celsius'], ['℉', 'grau Fahrenheit'], ['K', 'kelvin'], ['Å', 'angstrom'], ['µ', 'micro'], ['Ω', 'ohm'],
    ['N', 'newton'], ['J', 'joule'], ['W', 'watt'], ['V', 'volt'], ['A', 'ampère'], ['Hz', 'hertz'],
    ['Pa', 'pascal'], ['bar', 'bar'], ['atm', 'atmosfera'], ['kg', 'quilograma'], ['km', 'quilômetro'], ['cm', 'centímetro'],
    ['mm', 'milímetro'], ['µm', 'micrômetro'], ['s', 'segundo'], ['ms', 'milissegundo'], ['h', 'hora'], ['min', 'minuto'],
    ['N·m', 'newton-metro'], ['J/s', 'joule por segundo'], ['W/m²', 'watt por metro quadrado'], ['m/s', 'metro por segundo'], ['m/s²', 'metro por segundo ao quadrado'], ['km/h', 'quilômetro por hora']
  ] },
  { name: 'Moedas', items: [
    ['€', 'euro'], ['$', 'dólar'], ['£', 'libra'], ['¥', 'iene'], ['₿', 'bitcoin'], ['¢', 'centavo'],
    ['₹', 'rúpia'], ['₩', 'won'], ['₽', 'rublo'], ['₪', 'shekel'], ['₫', 'dong'], ['₴', 'hryvnia'],
    ['₺', 'lira'], ['₦', 'naira'], ['R$', 'real'], ['USD', 'dólar americano'], ['EUR', 'euro moeda'], ['BRL', 'real brasileiro']
  ] },
  { name: 'Acentuação', items: [
    ['á', 'a agudo'], ['à', 'a crase'], ['â', 'a circunflexo'], ['ã', 'a til'], ['ä', 'a trema'], ['é', 'e agudo'],
    ['è', 'e grave'], ['ê', 'e circunflexo'], ['ë', 'e trema'], ['í', 'i agudo'], ['ì', 'i grave'], ['î', 'i circunflexo'],
    ['ï', 'i trema'], ['ó', 'o agudo'], ['ò', 'o grave'], ['ô', 'o circunflexo'], ['õ', 'o til'], ['ö', 'o trema'],
    ['ú', 'u agudo'], ['ù', 'u grave'], ['û', 'u circunflexo'], ['ü', 'u trema'], ['ç', 'cedilha'], ['ñ', 'n til'],
    ['Á', 'A agudo'], ['Ã', 'A til'], ['Â', 'A circunflexo'], ['É', 'E agudo'], ['Ê', 'E circunflexo'], ['Í', 'I agudo'],
    ['Ó', 'O agudo'], ['Õ', 'O til'], ['Ô', 'O circunflexo'], ['Ú', 'U agudo'], ['Ü', 'U trema'], ['Ç', 'C cedilha']
  ] },
  { name: 'Tipografia', items: [
    ['—', 'travessão'], ['–', 'meia-risca'], ['…', 'reticências'], ['«', 'aspas angulares'], ['»', 'aspas angulares fecha'], ['“', 'aspas curvas'],
    ['”', 'aspas curvas fecha'], ['‘', 'aspas simples'], ['’', 'aspas simples fecha'], ['„', 'aspas baixas'], ['•', 'marcador'], ['·', 'ponto médio'],
    ['‣', 'marcador triângulo'], ['§', 'parágrafo'], ['¶', 'pilcrow'], ['†', 'adaga'], ['‡', 'adaga dupla'], ['©', 'copyright'],
    ['®', 'registrado'], ['™', 'marca registrada'], ['№', 'número'], ['⁂', 'asterismo'], ['※', 'referência'], ['¡', 'exclamação invertida']
  ] },
  { name: 'Formas e checks', items: [
    ['✓', 'check'], ['✔', 'check grosso'], ['✕', 'xis'], ['✖', 'xis grosso'], ['☑', 'caixa marcada'], ['☒', 'caixa com xis'],
    ['★', 'estrela cheia'], ['☆', 'estrela vazia'], ['✦', 'estrela quatro pontas'], ['✧', 'estrela fina'], ['◆', 'losango cheio'], ['◇', 'losango vazio'],
    ['●', 'círculo cheio'], ['○', 'círculo vazio'], ['■', 'quadrado cheio'], ['□', 'quadrado vazio'], ['▲', 'triângulo cima'], ['▼', 'triângulo baixo'],
    ['►', 'seta cheia'], ['◄', 'seta cheia esquerda'], ['♦', 'naipe ouros'], ['♥', 'naipe copas'], ['♣', 'naipe paus'], ['♠', 'naipe espadas'],
    ['◉', 'alvo'], ['◎', 'anel duplo'], ['⬤', 'círculo grosso'], ['▮', 'barra cheia'], ['▯', 'barra vazia'], ['◊', 'losango fino']
  ] },
  { name: 'Marcadores', items: [
    ['⚡', 'raio'], ['🔥', 'fogo'], ['💡', 'ideia'], ['📌', 'fixar'], ['✅', 'concluído'], ['❌', 'erro'],
    ['⏰', 'alarme'], ['📚', 'livros'], ['🎯', 'alvo'], ['🧠', 'cérebro'], ['🧪', 'experimento'], ['📝', 'anotação'],
    ['🏆', 'troféu'], ['⭐', 'estrela'], ['❤️', 'coração'], ['🚀', 'foguete'], ['🔎', 'busca'], ['📊', 'gráfico'],
    ['🗓️', 'calendário'], ['🔖', 'marcador'], ['📎', 'clipe'], ['✏️', 'lápis'], ['💾', 'salvar'], ['🔔', 'sino']
  ] },
  { name: 'Estatística', items: [
    ['x̄', 'x barra'], ['ȳ', 'y barra'], ['z̄', 'z barra'], ['p̂', 'p chapéu'], ['μ', 'média populacional'], ['σ', 'desvio padrão'],
    ['σ²', 'variância'], ['s²', 'variância amostral'], ['Σ', 'somatório'], ['n', 'amostra'], ['N', 'população'], ['χ²', 'qui-quadrado'],
    ['r', 'correlação'], ['R²', 'coeficiente de determinação'], ['α', 'nível de significância'], ['β', 'poder do teste'], ['H₀', 'hipótese nula'], ['H₁', 'hipótese alternativa'],
    ['z', 'escore z'], ['t', 'estatística t'], ['p', 'valor p'], ['IC', 'intervalo de confiança'], ['Md', 'mediana'], ['Mo', 'moda'],
    ['Q₁', 'primeiro quartil'], ['Q₃', 'terceiro quartil'], ['DP', 'desvio padrão'], ['CV', 'coeficiente de variação'], ['EP', 'erro padrão'], ['gl', 'graus de liberdade']
  ] },
  { name: 'Fórmulas', items: [
    ['ΔS/Δt', 'velocidade média'], ['Δv/Δt', 'aceleração média'], ['F = m·a', 'segunda lei de Newton'], ['E = m·c²', 'equivalência massa-energia'],
    ['P = U·i', 'potência elétrica'], ['U = R·i', 'lei de Ohm'], ['PV = nRT', 'gases ideais'], ['Q = m·c·ΔT', 'calor sensível'],
    ['a² + b² = c²', 'teorema de Pitágoras'], ['sen² + cos² = 1', 'identidade trigonométrica'], ['log(a·b)', 'log do produto'], ['ln(e) = 1', 'logaritmo natural'],
    ['M = C(1+i)ᵗ', 'juros compostos'], ['d = v·t', 'distância'], ['pH = -log[H⁺]', 'potencial hidrogeniônico'], ['ΔH < 0', 'reação exotérmica']
  ] }
];
const CHAR_INDEX = [];
CHAR_CATS.forEach((c) => c.items.forEach(([ch, name]) => {
  if (ch && !CHAR_INDEX.some((i) => i.ch === ch)) CHAR_INDEX.push({ ch: ch, name: name, cat: c.name });
}));
const CHAR_TOTAL = CHAR_INDEX.length;
let charCategory = 'Matemática';
let lastField = null;
let charPreviewChar = '';
let charClickTimer = null;

function charCode(ch) {
  const cp = ch && ch.codePointAt ? ch.codePointAt(0) : 0;
  return 'U+' + (cp || 0).toString(16).toUpperCase().padStart(4, '0');
}
function findChar(ch) {
  if (!ch) return null;
  return CHAR_INDEX.find((i) => i.ch === ch) || null;
}
function charTile(item, extraClass) {
  const fav = state.charsFav.indexOf(item.ch) !== -1;
  return '<button class="char-btn' + (extraClass ? ' ' + extraClass : '') + (fav ? ' fav' : '') + '" type="button" data-char="' + esc(item.ch) + '" title="' + esc(item.name + ' · ' + charCode(item.ch)) + '">' +
    (fav ? '<i class="fa-solid fa-star fav-dot"></i>' : '') +
    '<b class="char-glyph">' + esc(item.ch) + '</b>' +
    '<span class="char-name">' + esc(item.name) + '</span>' +
    '<span class="char-code">' + charCode(item.ch) + '</span></button>';
}
function renderCharStats() {
  const box = $('#charStats');
  if (box) {
    const rows = [
      { label: 'Símbolos', value: CHAR_TOTAL, icon: 'fa-font' },
      { label: 'Categorias', value: CHAR_CATS.length - 1, icon: 'fa-layer-group' },
      { label: 'Favoritos', value: state.charsFav.length, icon: 'fa-star' },
      { label: 'Cópias', value: state.charCopies || 0, icon: 'fa-copy' }
    ];
    box.innerHTML = rows.map((r) => '<div class="char-stat"><i class="fa-solid ' + r.icon + '"></i><b>' + r.value + '</b><span>' + esc(r.label) + '</span></div>').join('');
  }
  const sub = $('#charHeroSub');
  if (sub) {
    sub.textContent = CHAR_TOTAL + ' caracteres em ' + (CHAR_CATS.length - 1) + ' categorias. Clique para copiar, Shift+clique para favoritar e duplo clique para copiar o código Unicode.';
  }
}
function renderCharSide() {
  const preview = $('#charPreview');
  const item = findChar(charPreviewChar) || findChar(state.recentChars[0] || '');
  if (preview) {
    if (item) {
      charPreviewChar = item.ch;
      preview.innerHTML = '<b class="cp-glyph">' + esc(item.ch) + '</b>' +
        '<div class="cp-meta"><span class="cp-name">' + esc(item.name) + '</span>' +
        '<span class="cp-code">' + charCode(item.ch) + ' · ' + esc(item.cat) + '</span></div>';
    } else {
      preview.innerHTML = '<div class="empty"><i class="fa-solid fa-wand-magic-sparkles"></i>Copie um símbolo para ver os detalhes.</div>';
    }
  }
  const toggle = $('#charFavToggle');
  if (toggle) {
    const current = findChar(charPreviewChar);
    toggle.textContent = current && state.charsFav.indexOf(current.ch) !== -1 ? 'desfavoritar' : 'favoritar';
    toggle.disabled = !current;
  }
  const recent = $('#charRecent');
  if (recent) {
    const items = state.recentChars.map(findChar).filter(Boolean);
    recent.innerHTML = items.length ? items.map((i) => charTile(i, 'char-btn--mini')).join('') : '<span class="status-text">Ainda sem cópias nesta conta.</span>';
  }
  const favs = $('#charFavList');
  if (favs) {
    const items = state.charsFav.map(findChar).filter(Boolean);
    favs.innerHTML = items.length ? items.map((i) => charTile(i, 'char-btn--mini')).join('') : '<span class="status-text">Nenhum favorito ainda. Use Shift+clique.</span>';
  }
}
function filteredChars() {
  const query = (($('#charsSearch') || {}).value || '').toLowerCase().trim();
  if (query) {
    return CHAR_INDEX.filter((i) => (i.name + ' ' + i.ch + ' ' + i.cat + ' ' + charCode(i.ch)).toLowerCase().indexOf(query) !== -1);
  }
  if (charCategory === 'Favoritos') return state.charsFav.map(findChar).filter(Boolean);
  const cat = CHAR_CATS.find((c) => c.name === charCategory);
  return cat ? cat.items.map((pair) => findChar(pair[0])).filter(Boolean) : CHAR_INDEX;
}
function renderChars() {
  renderCharStats();
  const cats = $('#charsCategories');
  if (cats) {
    cats.innerHTML = CHAR_CATS.map((c) => {
      const count = c.name === 'Favoritos' ? state.charsFav.length : c.items.length;
      return '<button class="chip' + (charCategory === c.name ? ' active' : '') + '" type="button" data-char-cat="' + esc(c.name) + '">' + esc(c.name) + '<span class="chip-count">' + count + '</span></button>';
    }).join('');
  }
  const grid = $('#charGrid');
  if (!grid) return;
  const items = filteredChars();
  const query = (($('#charsSearch') || {}).value || '').trim();
  grid.innerHTML = items.length
    ? items.map((i) => charTile(i)).join('')
    : '<div class="empty"><i class="fa-solid fa-font"></i>Nenhum símbolo para “' + esc(query || charCategory) + '”.</div>';
  const fav = $('#charFavCount');
  if (fav) fav.textContent = state.charsFav.length + (state.charsFav.length === 1 ? ' favorito' : ' favoritos');
  const status = $('#charStatus');
  if (status) {
    status.innerHTML = '<i class="fa-solid fa-circle-info"></i> <b>' + items.length + '</b> de ' + CHAR_TOTAL + ' símbolos' +
      (query ? ' · busca por “' + esc(query) + '”' : ' · ' + esc(charCategory)) +
      ' · clique copia, Shift+clique favorita, duplo clique copia o código.';
  }
  renderCharSide();
}
function toggleCharFav(ch) {
  const has = state.charsFav.indexOf(ch) !== -1;
  state.charsFav = has ? state.charsFav.filter((x) => x !== ch) : state.charsFav.concat(ch);
  charPreviewChar = ch;
  save();
  renderChars();
  toast(has ? 'Removido dos favoritos.' : 'Adicionado aos favoritos.', 'fa-star');
}
function insertCharAtCaret(ch) {
  if (!lastField || !document.body.contains(lastField) || lastField.readOnly) return false;
  if (lastField.closest && lastField.closest('#page-chars')) return false;
  if (typeof lastField.selectionStart !== 'number') return false;
  const start = lastField.selectionStart || 0;
  const end = lastField.selectionEnd == null ? start : lastField.selectionEnd;
  lastField.value = lastField.value.slice(0, start) + ch + lastField.value.slice(end);
  lastField.focus();
  lastField.selectionStart = lastField.selectionEnd = start + ch.length;
  lastField.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
}
function copyChar(ch, opts) {
  const item = findChar(ch);
  const asCode = !!(opts && opts.code);
  const text = asCode ? charCode(ch) : ch;
  state.recentChars = [ch].concat(state.recentChars.filter((x) => x !== ch)).slice(0, 16);
  state.charCopies = (state.charCopies || 0) + 1;
  charPreviewChar = ch;
  save();
  const inserted = asCode ? false : insertCharAtCaret(ch);
  copyText(text).then((ok) => {
    renderChars();
    const status = $('#charStatus');
    if (status) {
      status.innerHTML = '<i class="fa-solid ' + (ok ? 'fa-circle-check' : 'fa-triangle-exclamation') + '"></i> ' +
        (ok ? 'Copiado' : 'Selecione e copie') + ': <b>' + esc(text) + '</b>' +
        (item ? ' · ' + esc(item.name) : '') + (inserted ? ' · inserido no último campo' : '');
    }
    toast(ok ? (asCode ? 'Código ' + text + ' copiado.' : '“' + ch + '” copiado.') : 'Não foi possível copiar.', 'fa-copy', !ok);
  });
}
function bindChars() {
  renderChars();
  $('#charsSearch') && $('#charsSearch').addEventListener('input', debounce(renderChars, 140));
  $('#charsCategories') && $('#charsCategories').addEventListener('click', (e) => {
    const b = e.target.closest('[data-char-cat]');
    if (!b) return;
    charCategory = b.dataset.charCat;
    const input = $('#charsSearch'); if (input) input.value = '';
    renderChars();
  });
  const grid = $('#charGrid');
  if (grid) {
    grid.addEventListener('click', (e) => {
      const b = e.target.closest('[data-char]');
      if (!b) return;
      const ch = b.dataset.char;
      if (e.shiftKey) { toggleCharFav(ch); return; }
      clearTimeout(charClickTimer);
      charClickTimer = setTimeout(() => copyChar(ch), 190);
    });
    grid.addEventListener('dblclick', (e) => {
      const b = e.target.closest('[data-char]');
      if (!b) return;
      clearTimeout(charClickTimer);
      copyChar(b.dataset.char, { code: true });
    });
  }
  ['#charRecent', '#charFavList'].forEach((sel) => {
    const box = $(sel);
    if (!box) return;
    box.addEventListener('click', (e) => {
      const b = e.target.closest('[data-char]');
      if (!b) return;
      if (e.shiftKey) toggleCharFav(b.dataset.char);
      else copyChar(b.dataset.char);
    });
  });
  $('#charFavToggle') && $('#charFavToggle').addEventListener('click', () => {
    if (charPreviewChar) toggleCharFav(charPreviewChar);
  });
  $('#charCopyFavs') && $('#charCopyFavs').addEventListener('click', () => {
    if (!state.charsFav.length) return toast('Nenhum favorito para copiar.', 'fa-star', true);
    copyText(state.charsFav.join(' ')).then((ok) => toast(ok ? state.charsFav.length + ' favoritos copiados.' : 'Não foi possível copiar.', 'fa-copy', !ok));
  });
  $('#charClearRecent') && $('#charClearRecent').addEventListener('click', () => {
    state.recentChars = [];
    charPreviewChar = '';
    save();
    renderChars();
    toast('Recentes limpos.', 'fa-broom');
  });
  document.addEventListener('focusin', (e) => {
    if (e.target.matches('input, textarea') && !e.target.readOnly) lastField = e.target;
  });
}


/* ============ 28. TÍTULO DA PÁGINA ============ */
const FONTS = ['Poppins', 'Space Grotesk', 'Orbitron', 'Fira Code', 'Caveat', 'Patrick Hand', 'system-ui'];
const TITLE_ICONS = ['fa-graduation-cap', 'fa-book', 'fa-brain', 'fa-rocket', 'fa-fire', 'fa-star', 'fa-bolt', 'fa-heart', 'fa-leaf', 'fa-code', 'fa-atom', 'fa-flask', 'fa-calculator', 'fa-globe', 'fa-moon', 'fa-sun'];
function renderPageTitle() {
  const input = $('#titleTextInput'); if (input) input.value = state.pageTitle;
  const font = $('#titleFontSelect');
  if (font) font.innerHTML = FONTS.map((f) => '<option value="' + esc(f) + '"' + (state.font === f ? ' selected' : '') + '>' + esc(f) + '</option>').join('');
  const iconSel = $('#titleIconSelect');
  if (iconSel) iconSel.innerHTML = TITLE_ICONS.map((i) => '<option value="' + i + '"' + (state.icon === i ? ' selected' : '') + '>' + i.replace('fa-', '') + '</option>').join('');
  const picker = $('#titleIconPreview');
  if (picker) picker.innerHTML = TITLE_ICONS.map((i) => '<button type="button" data-title-icon="' + i + '" class="' + (state.icon === i ? 'active' : '') + '"><i class="fa-solid ' + i + '"></i></button>').join('');
  const prev = $('#titlePreview');
  if (prev) { prev.textContent = state.pageTitle; prev.style.fontFamily = "'" + state.font + "', system-ui, sans-serif"; }
}
function applyTitleFromInputs() {
  const text = (($('#titleTextInput') || {}).value || '').trim();
  if (!text) return toast('Escreva um título.', 'fa-triangle-exclamation', true);
  state.pageTitle = text.slice(0, 60);
  state.font = (($('#titleFontSelect') || {}).value) || 'Poppins';
  state.icon = (($('#titleIconSelect') || {}).value) || 'fa-graduation-cap';
  applyPageTitle(); save(); renderPageTitle();
  toast('Título aplicado.', 'fa-pen-nib');
}
function bindPageTitle() {
  renderPageTitle();
  $('#titleApplyBtn') && $('#titleApplyBtn').addEventListener('click', applyTitleFromInputs);
  $('#titleResetBtn') && $('#titleResetBtn').addEventListener('click', () => {
    state.pageTitle = DEFAULT_STATE.pageTitle; state.font = 'Poppins'; state.icon = 'fa-graduation-cap';
    applyPageTitle(); save(); renderPageTitle();
    toast('Título restaurado.', 'fa-rotate-left');
  });
  $('#titleIconPreview') && $('#titleIconPreview').addEventListener('click', (e) => {
    const b = e.target.closest('[data-title-icon]');
    if (!b) return;
    state.icon = b.dataset.titleIcon;
    const sel = $('#titleIconSelect'); if (sel) sel.value = state.icon;
    renderPageTitle();
  });
  $('#titleFontSelect') && $('#titleFontSelect').addEventListener('change', () => {
    const prev = $('#titlePreview');
    if (prev) prev.style.fontFamily = "'" + $('#titleFontSelect').value + "', system-ui, sans-serif";
  });
}

/* ============ 29. EVENTOS ============ */
const EVENTS = [
  { m: 0, name: 'Recomeço', emoji: '🌱', desc: 'Planeje o ano e organize seus baralhos de revisão.', coins: 30 },
  { m: 1, name: 'Carnaval do Foco', emoji: '🎭', desc: 'Sessões curtas e muitas revisões rápidas.', coins: 35 },
  { m: 2, name: 'Maratona de Março', emoji: '🏃', desc: 'Acumule horas de foco com metas semanais.', coins: 40 },
  { m: 3, name: 'Abril de Aço', emoji: '⚙️', desc: 'Rotina firme: 5 dias seguidos de estudo.', coins: 45 },
  { m: 4, name: 'Maio das Metas', emoji: '🎯', desc: 'Conclua metas e resgate bônus.', coins: 50 },
  { m: 5, name: 'Junho de Revisão', emoji: '🔁', desc: 'Zere os cards devidos do mês.', coins: 55 },
  { m: 6, name: 'Julho Intenso', emoji: '🔥', desc: 'Dobro de constância nas férias.', coins: 60 },
  { m: 7, name: 'Agosto Disciplinado', emoji: '📚', desc: 'Volte à rotina com o planner completo.', coins: 65 },
  { m: 8, name: 'Setembro em Foco', emoji: '🍃', desc: 'Semana de simulados e quiz cronometrado.', coins: 70 },
  { m: 9, name: 'Outubro de Ouro', emoji: '🏅', desc: 'Bata sua melhor sequência.', coins: 75 },
  { m: 10, name: 'Reta Final', emoji: '🚀', desc: 'Revisão intensiva antes das provas.', coins: 80 },
  { m: 11, name: 'Fechamento', emoji: '🎁', desc: 'Revise o ano e celebre o progresso.', coins: 90 }
];
let eventMonth = new Date().getMonth();
function monthMinutes(month) {
  return Object.entries(state.focusByDate).reduce((sum, [k, v]) => (parseKey(k).getMonth() === month ? sum + v : sum), 0);
}
function renderEvents() {
  const months = $('#eventMonths');
  if (months) months.innerHTML = EVENTS.map((e, i) => '<button class="chip' + (i === eventMonth ? ' active' : '') + '" type="button" data-event-month="' + i + '">' + e.emoji + ' ' + MONTHS[i].slice(0, 3) + '</button>').join('');
  const box = $('#eventCard');
  if (!box) return;
  const e = EVENTS[eventMonth];
  const minutes = monthMinutes(eventMonth);
  const level = Math.min(5, Math.floor(minutes / 60) + 1);
  const pct = Math.min(100, ((minutes % 60) / 60) * 100);
  const claimed = (state.eventClaims || {})[eventMonth];
  const canClaim = level >= 2 && !claimed;
  box.innerHTML = '<div class="event-card-inner"><div class="event-head"><div><span class="kicker">' + MONTHS[eventMonth] + ' de ' + new Date().getFullYear() + '</span><h3>' + e.emoji + ' ' + esc(e.name) + '</h3></div>' +
    '<span class="event-reward"><i class="fa-solid fa-coins"></i> ' + e.coins + ' moedas</span></div>' +
    '<p style="font-size:.84rem;color:var(--muted)">' + esc(e.desc) + '</p>' +
    '<div class="event-meta"><span>Nível do evento: <b>' + level + '/5</b></span><span>Foco no mês: <b>' + fmtMinutes(minutes) + '</b></span>' +
    '<span>Próximo nível em: <b class="event-days">' + Math.max(0, (level * 60) - minutes) + 'min</b></span></div>' +
    '<div class="progress"><span style="width:' + pct + '%"></span></div>' +
    '<div class="row"><button class="btn ' + (canClaim ? 'btn-primary' : 'btn-secondary') + '" type="button" data-event-claim="' + eventMonth + '"' + (canClaim ? '' : ' disabled') + '>' +
    (claimed ? 'recompensa resgatada' : canClaim ? 'resgatar recompensa' : 'alcance o nível 2') + '</button></div></div>';
}
function bindEvents() {
  renderEvents();
  $('#eventMonths') && $('#eventMonths').addEventListener('click', (e) => {
    const b = e.target.closest('[data-event-month]');
    if (!b) return;
    eventMonth = Number(b.dataset.eventMonth);
    renderEvents();
  });
  $('#eventCard') && $('#eventCard').addEventListener('click', (e) => {
    const b = e.target.closest('[data-event-claim]');
    if (!b || b.disabled) return;
    state.eventClaims = state.eventClaims || {};
    state.eventClaims[b.dataset.eventClaim] = true;
    addCoins(EVENTS[Number(b.dataset.eventClaim)].coins);
    renderEvents();
    toast('Recompensa do evento resgatada.', 'fa-gift');
  });
}

/* ============ 30. PORTAIS ============ */
const PORTAL_LINKS = [
  { label: 'Geekie One', url: 'https://dx1website.pages.dev/resumao/geekieoneplus/', icon: 'fa-graduation-cap' },
  { label: 'Google Sala de Aula', url: 'https://classroom.google.com/', icon: 'fa-chalkboard-user' },
  { label: 'Google Drive', url: 'https://drive.google.com/', icon: 'fa-hard-drive' },
  { label: 'YouTube', url: 'https://www.youtube.com/', icon: 'fa-play' }
];
const GOOGLE_LINKS = [
  { label: 'Google', url: 'https://www.google.com/', icon: 'fa-magnifying-glass' },
  { label: 'Google Sala de Aula', url: 'https://classroom.google.com/', icon: 'fa-chalkboard-user' },
  { label: 'Google Drive', url: 'https://drive.google.com/', icon: 'fa-hard-drive' },
  { label: 'YouTube', url: 'https://www.youtube.com/', icon: 'fa-play' },
  { label: 'Google Docs', url: 'https://docs.google.com/', icon: 'fa-file-lines' }
];
function renderPortalLinks() {
  const g = $('#portalLinks');
  if (g) g.innerHTML = PORTAL_LINKS.map((l) => '<a class="portal-link" href="' + l.url + '" target="_blank" rel="noopener"><i class="fa-solid ' + l.icon + '"></i>' + esc(l.label) + '</a>').join('');
  const gg = $('#googleLinks');
  if (gg) gg.innerHTML = GOOGLE_LINKS.map((l) => '<a class="portal-link" href="' + l.url + '" target="_blank" rel="noopener"><i class="fa-solid ' + l.icon + '"></i>' + esc(l.label) + '</a>').join('');
}
function loadIframe(id, loadingId) {
  const f = document.getElementById(id);
  if (!f) return;
  if (!f.src) f.src = f.dataset.src;
  const hide = () => { const l = document.getElementById(loadingId); if (l) l.style.display = 'none'; };
  f.addEventListener('load', hide, { once: true });
  setTimeout(hide, 8000);
}
function fullscreen(el) {
  if (!el) return;
  const req = el.requestFullscreen || el.webkitRequestFullscreen;
  if (!req) return toast('Tela cheia não é suportada aqui.', 'fa-triangle-exclamation', true);
  req.call(el).catch(() => toast('Não foi possível entrar em tela cheia.', 'fa-triangle-exclamation', true));
}
function bindPortals() {
  renderPortalLinks();
  loadIframe('geekieIframe', 'iframeLoading');
  loadIframe('googleIframe', null);
  $('#portalReloadBtn') && $('#portalReloadBtn').addEventListener('click', () => {
    const f = $('#geekieIframe');
    const l = $('#iframeLoading');
    if (l) l.style.display = 'grid';
    if (f) f.src = f.dataset.src;
  });
  $('#portalNewTabBtn') && $('#portalNewTabBtn').addEventListener('click', () => {
    const f = $('#geekieIframe');
    window.open((f && f.dataset.src) || 'about:blank', '_blank', 'noopener');
  });
  $('#portalFullBtn') && $('#portalFullBtn').addEventListener('click', () => fullscreen($('#geekieIframeContainer')));
  $('#googleReloadBtn') && $('#googleReloadBtn').addEventListener('click', () => {
    const f = $('#googleIframe');
    if (f) f.src = f.dataset.src;
  });
  $('#googleFullBtn') && $('#googleFullBtn').addEventListener('click', () => fullscreen($('#googleIframeContainer')));
}

/* ============ 31. COMANDOS ============ */
const COMMANDS = {
  ajuda: { desc: 'Lista comandos ou detalha um', run: (a) => {
    if (a) { const c = COMMANDS[a]; return c ? a + ' — ' + c.desc : 'Comando não encontrado: ' + a; }
    return 'Comandos: ' + Object.keys(COMMANDS).sort().join(', ');
  } },
  ir: { desc: 'Abre uma aba (ir metas)', run: (a) => {
    const key = String(a || '').toLowerCase();
    const found = TABS.find((t) => t.id === key || t.title.toLowerCase().startsWith(key));
    if (!found) return 'Aba não encontrada: "' + (a || '') + '".';
    switchTab(found.id); return 'Abrindo ' + found.title + '.';
  } },
  foco: { desc: 'Inicia o pomodoro (foco [min])', run: (a) => {
    const m = Number(a);
    if (m >= 5 && m <= 90) { state.pomoConfig.focus = m; save(); }
    switchTab('timer'); pomoSetMode('focus'); pomoStart();
    return 'Foco iniciado com ' + state.pomoConfig.focus + ' minutos.';
  } },
  pausar: { desc: 'Pausa o pomodoro', run: () => { pomoPause(); return 'Ciclo pausado.'; } },
  zerar: { desc: 'Zera o ciclo atual', run: () => { pomoReset(); return 'Ciclo zerado.'; } },
  quiz: { desc: 'Inicia um quiz (quiz biologia)', run: (a) => {
    const subj = Object.keys(QUIZ_BANK).find((s) => s.toLowerCase().startsWith(String(a || '').toLowerCase())) || 'Matemática';
    switchTab('quiz');
    const sel = $('#quizSubject'); if (sel) sel.value = subj;
    startQuiz(); return 'Quiz de ' + subj + ' iniciado.';
  } },
  tema: { desc: 'Aplica um tema já desbloqueado', run: (a) => {
    const t = THEMES.find((x) => x.id === String(a || '').toLowerCase() || x.name.toLowerCase().startsWith(String(a || '').toLowerCase()));
    if (!t) return 'Tema não encontrado. Temas: ' + THEMES.map((x) => x.id).join(', ');
    if (!state.themesOwned.includes(t.id)) return 'Você ainda não tem o tema ' + t.name + '.';
    applyTheme(t.id); renderStore(); return 'Tema aplicado: ' + t.name + '.';
  } },
  diario: { desc: 'Salva a entrada do diário de hoje', run: (a) => {
    if (!a) return 'Escreva algo: diario hoje rendeu bem.';
    state.diary[dateKey()] = { text: a, mood: diaryMood, at: Date.now() };
    save(); renderDiary(); return 'Diário de hoje salvo.';
  } },
  nota: { desc: 'Cria nota: nota título | texto', run: (a) => {
    if (!a) return 'Use: nota Título | texto';
    const [title, ...rest] = a.split('|');
    const id = uid();
    state.notes[id] = { title: title.trim() || 'Sem título', content: rest.join('|').trim(), tags: 'terminal', pinned: false, updatedAt: Date.now() };
    state.noteOrder.unshift(id); save(); renderNotes();
    return 'Nota criada: ' + (title.trim() || 'Sem título');
  } },
  meta: { desc: 'Adiciona uma meta', run: (a) => {
    if (!a) return 'Use: meta revisar biologia';
    state.goals.unshift({ id: uid(), text: a, subject: '', priority: 'media', due: '', done: false, createdAt: Date.now() });
    save(); renderGoals(); renderHoje(); return 'Meta adicionada.';
  } },
  senha: { desc: 'Gera uma senha (senha 24)', run: (a) => {
    switchTab('password');
    const len = clamp(Number(a) || 18, 8, 48);
    const el = $('#passwordLength'); if (el) el.value = len;
    const p = makePassword(len);
    const out = $('#passwordOutput'); if (out) out.value = p;
    copyText(p);
    return 'Senha de ' + len + ' caracteres gerada e copiada.';
  } },
  calc: { desc: 'Calcula uma expressão', run: (a) => {
    if (!a) return 'Use: calc 2*(3+4)';
    try { const v = calcEvaluate(a); calc.expr = String(a); calc.result = v; calc.history.unshift({ expr: a, result: v }); calcRender(); return a + ' = ' + v; }
    catch (e) { return 'Expressão inválida.'; }
  } },
  resgatar: { desc: 'Resgata um código', run: (a) => { if (!a) return 'Use: resgatar GEEKIE2026'; return redeemCode(a).message; } },
  xp: { desc: 'Mostra seu XP e nível', run: () => {
    const info = levelInfo(state.xp);
    return 'XP: ' + state.xp + ' · nível: ' + info.cur.title + (info.next ? ' · faltam ' + (info.next.xp - state.xp) + ' para ' + info.next.title : ' · nível máximo');
  } },
  moedas: { desc: 'Mostra seu saldo', run: () => 'Você tem ' + state.coins + ' moedas.' },
  streak: { desc: 'Mostra sua sequência', run: () => 'Sequência atual: ' + computeStreak() + ' dias · recorde: ' + state.streakBest + ' · escudos: ' + (state.streakShields || 0) + '/5.' },
  foguinho: { desc: 'Detalha foguinho, multiplicador e escudos', run: () => {
    const s = computeStreak();
    const t = streakTier(s);
    const n = nextStreakTier(s);
    return 'Foguinho: ' + s + ' dia(s) · ' + t.name + ' · multiplicador x' + t.mult + ' XP' +
      (n ? ' · faltam ' + (n.days - s) + ' dia(s) para x' + n.mult : ' · faixa máxima') +
      '\nEscudos: ' + (state.streakShields || 0) + '/5 · usados: ' + (state.shieldsUsed || 0);
  } },
  missoes: { desc: 'Lista as missões diárias e o progresso', run: () => todayMissionList().map((m) => {
    const v = Math.min(m.value(), m.goal);
    return (missionClaimed(m.id) ? '✔ ' : v >= m.goal ? '★ ' : '· ') + m.label + ' (' + v + '/' + m.goal + ') · +' + m.xp + ' XP e +' + m.coins + ' moedas';
  }).join('\n') },
  escudo: { desc: 'Compra um escudo de sequência por 90 moedas', run: () => {
    if ((state.streakShields || 0) >= 5) return 'Limite de 5 escudos atingido.';
    if (state.coins < SHIELD_COST) return 'Faltam ' + (SHIELD_COST - state.coins) + ' moedas.';
    buyStreakShield();
    return 'Escudo comprado. Você tem ' + state.streakShields + ' escudo(s).';
  } },
  clicker: { desc: 'Abre o núcleo e mostra a produção', run: () => {
    switchTab('clicker');
    return 'Energia: ' + Math.floor(state.clicker.points) + ' ⚡ · ' + clickerRate() + '/s · +' + clickerPower() +
      ' por clique · prestígio ' + (state.clicker.prestige || 0) + ' · cliques: ' + (state.clicker.clicks || 0);
  } },
  cards: { desc: 'Mostra cards devidos', run: () => {
    const due = dueCards().length;
    return due ? due + ' cards para revisar hoje em ' + Object.keys(state.decks).length + ' baralhos.' : 'Nenhum card devido. Bom trabalho!';
  } },
  devlog: { desc: 'Abre o Dev Log (filtro opcional)', run: (a) => {
    const map = { fix: 'fix', correcao: 'fix', feature: 'feature', novo: 'feature', style: 'style', visual: 'style', all: 'all' };
    currentDevlogFilter = map[String(a || '').toLowerCase()] || 'all';
    switchTab('devlog'); renderDevlog();
    return 'Dev Log aberto.';
  } },
  zen: { desc: 'Alterna o modo Zen', run: () => { toggleZen(); return 'Modo Zen alternado.'; } },
  animacoes: { desc: 'Liga/desliga animações', run: (a) => {
    state.motionReduced = String(a).toLowerCase() === 'off';
    applyMotion(); save();
    return state.motionReduced ? 'Animações reduzidas.' : 'Animações ativadas.';
  } },
  data: { desc: 'Mostra data e hora', run: () => new Date().toLocaleString('pt-BR') },
  exportar: { desc: 'Baixa o progresso em JSON', run: () => {
    download('geekie-progresso.json', JSON.stringify(state, null, 2), 'application/json');
    return 'Progresso exportado.';
  } },
  sobre: { desc: 'Informações da versão', run: () => VERSION + ' · ' + TABS.length + ' abas · chave ' + STORAGE_KEY + ' · 100% offline.' },
  limpar: { desc: 'Limpa o terminal', run: () => { const out = $('#cmdOutput'); if (out) out.innerHTML = ''; return ''; } },
  reset: { desc: 'Apaga TODO o progresso', run: () => {
    if (!confirm('Isso apaga todo o progresso deste navegador. Continuar?')) return 'Cancelado.';
    cancelSave();
    try { localStorage.removeItem(STORAGE_KEY); LEGACY_KEYS.forEach((k) => localStorage.removeItem(k)); } catch (e) { /* ignore */ }
    return 'Progresso apagado. Recarregue a página.';
  } },
  conquistas: { desc: 'Lista conquistas', run: () => ACHIEVEMENTS.map((a) => (a.check() ? '✔ ' : '· ') + a.label).join('\n') },
  perfil: { desc: 'Resumo do seu perfil', run: () => {
    const info = levelInfo(state.xp);
    const t = streakTier();
    return 'Título: ' + state.title + ' · nível: ' + info.cur.title + '\nFoco total: ' + fmtMinutes(totalFocus()) + ' · sessões: ' + state.sessions +
      '\nFoguinho: ' + computeStreak() + ' dias · ' + t.name + ' (x' + t.mult + ') · escudos: ' + (state.streakShields || 0) +
      '\nMetas: ' + state.totalGoalsDone + ' concluídas · cards: ' + Object.values(state.flashStats).reduce((a, b) => a + b, 0) +
      '\nNúcleo: ' + Math.floor(state.clicker.points) + ' ⚡ · prestígio ' + (state.clicker.prestige || 0);
  } }
};
function cmdPrint(text, cls) {
  const out = $('#cmdOutput');
  if (!out) return;
  const line = document.createElement('div');
  line.className = 'cmd-line ' + (cls || '');
  line.textContent = text;
  out.appendChild(line);
  out.scrollTop = out.scrollHeight;
}
function runCommand(raw) {
  const text = String(raw || '').trim();
  if (!text) return;
  cmdPrint('geekie › ' + text, 'echo');
  state.commandHistory = [text].concat(state.commandHistory.filter((x) => x !== text)).slice(0, 30);
  const [name, ...rest] = text.split(/\s+/);
  const args = rest.join(' ');
  const cmd = COMMANDS[name.toLowerCase()];
  if (!cmd) {
    cmdPrint('Comando não encontrado: ' + name + '. Tente "ajuda".', 'error');
  } else {
    try {
      const result = cmd.run(args);
      if (result) cmdPrint(result, '');
    } catch (e) { cmdPrint('Erro: ' + (e.message || 'falha ao executar.'), 'error'); }
  }
  save();
  renderCmdSuggestions('');
  const input = $('#cmdInput'); if (input) { input.value = ''; }
}
function renderCmdSuggestions(value) {
  const box = $('#cmdSuggestions');
  if (!box) return;
  const v = String(value || '').toLowerCase();
  const names = Object.keys(COMMANDS).sort().filter((n) => !v || n.startsWith(v));
  box.innerHTML = names.slice(0, 10).map((n) => '<button class="cmd-suggestion" type="button" data-cmd="' + n + '">' + n + '</button>').join('');
}
function bindCommands() {
  const count = $('#cmdCount'); if (count) count.textContent = Object.keys(COMMANDS).length + ' comandos';
  cmdPrint(VERSION + ' pronto. Digite "ajuda" para ver os comandos.', 'muted');
  renderCmdSuggestions('');
  $('#cmdForm') && $('#cmdForm').addEventListener('submit', (e) => { e.preventDefault(); runCommand(($('#cmdInput') || {}).value); });
  $('#cmdInput') && $('#cmdInput').addEventListener('input', (e) => renderCmdSuggestions(e.target.value));
  $('#cmdInput') && $('#cmdInput').addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const v = e.target.value.toLowerCase();
      const match = Object.keys(COMMANDS).find((n) => n.startsWith(v));
      if (match) { e.target.value = match + ' '; renderCmdSuggestions(''); }
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const list = state.commandHistory;
      if (!list.length) return;
      cmdIndex = clamp(cmdIndex + (e.key === 'ArrowUp' ? 1 : -1), 0, list.length - 1);
      e.target.value = list[cmdIndex] || '';
    }
  });
  $('#cmdSuggestions') && $('#cmdSuggestions').addEventListener('click', (e) => {
    const b = e.target.closest('[data-cmd]');
    if (!b) return;
    const input = $('#cmdInput'); if (!input) return;
    input.value = b.dataset.cmd + ' ';
    input.focus();
    renderCmdSuggestions('');
  });
  $('#cmdClearBtn') && $('#cmdClearBtn').addEventListener('click', () => { const out = $('#cmdOutput'); if (out) out.innerHTML = ''; });
  $('#cmdHelpBtn') && $('#cmdHelpBtn').addEventListener('click', () => runCommand('ajuda'));
}
let cmdIndex = -1;

/* ============ 32. RECOMPENSAS ============ */
const REWARDS = [
  { code: 'BEMVINDO', label: 'Boas-vindas', coins: 15, xp: 20, hint: 'Primeiro acesso ao hub', expires: '2026-12-31' },
  { code: 'GEEKIE2026', label: 'Campanha 2026', coins: 50, xp: 100, hint: 'Ano novo, hub novo', expires: '2026-12-31' },
  { code: 'FOCOPRO', label: 'Foco Pro', coins: 40, xp: 60, theme: 'neon', hint: 'Libera o tema Neon', expires: '2027-01-31' },
  { code: 'ENEM2026', label: 'Reta ENEM', coins: 30, xp: 150, hint: 'Para a reta final', expires: '2026-11-30' },
  { code: 'DEVLOG5', label: 'Leitor do Dev Log', coins: 25, xp: 25, hint: 'Quem lê as notas ganha', expires: '2027-06-30' },
  { code: 'HUBV195', label: 'Lançamento v20', coins: 100, xp: 50, theme: 'matrix', hint: 'Libera o tema Matrix', expires: '2026-12-31' },
  { code: 'FOGUINHO22', label: 'Foguinho v22', coins: 80, xp: 120, shield: 1, hint: 'Um escudo de sequência + recompensa', expires: '2027-12-31' },
  { code: 'NUCLEO22', label: 'Núcleo v22', coins: 60, xp: 80, hint: 'Energia extra para o clicker', expires: '2027-06-30' },
  { code: 'AURORA22', label: 'Aurora v22', coins: 120, xp: 100, theme: 'aurora', hint: 'Libera o tema Aurora', expires: '2027-03-31' }
];
function renderRewards() {
  const grid = $('#rewardGrid');
  if (grid) {
    grid.innerHTML = REWARDS.map((r) => {
      const used = state.redeemed.includes(r.code);
      const expired = r.expires < dateKey();
      return '<div class="reward-card' + (used ? ' used' : '') + (expired ? ' expired' : '') + '">' +
        '<div class="reward-card-head"><span class="reward-code">' + r.code + '</span><span class="badge ' + (used ? '' : expired ? 'danger' : 'gold') + '">' + (used ? 'resgatado' : expired ? 'expirado' : 'ativo') + '</span></div>' +
        '<p>' + esc(r.hint) + '</p>' +
        '<div class="reward-prize"><span><i class="fa-solid fa-coins" style="color:var(--coin)"></i> ' + r.coins + '</span><span><i class="fa-solid fa-star" style="color:var(--violet)"></i> ' + r.xp + ' XP</span>' + (r.theme ? '<span><i class="fa-solid fa-palette"></i> tema</span>' : '') + (r.shield ? '<span><i class="fa-solid fa-shield-halved"></i> ' + r.shield + ' escudo</span>' : '') + '</div>' +
        '<span class="status-text">expira em ' + prettyDate(r.expires) + '</span></div>';
    }).join('');
  }
  const hist = $('#rewardHistory');
  if (hist) {
    hist.innerHTML = state.redeemed.length ? state.redeemed.map((code) => {
      const r = REWARDS.find((x) => x.code === code);
      return '<div class="reward-history-item"><span><b style="color:var(--gold)">' + esc(code) + '</b>' + (r ? ' · ' + esc(r.label) : '') + '</span><span class="status-text">resgatado</span></div>';
    }).join('') : '<div class="empty">Nenhum código resgatado ainda.</div>';
  }
}
function redeemCode(raw) {
  const code = String(raw || '').trim().toUpperCase().replace(/\s+/g, '');
  const feedback = $('#rewardFeedback');
  const show = (msg, ok) => {
    if (feedback) { feedback.textContent = msg; feedback.className = 'reward-feedback ' + (ok ? 'ok' : 'bad'); }
    toast(msg, ok ? 'fa-gift' : 'fa-triangle-exclamation', !ok);
    return { ok, message: msg };
  };
  if (!code) return show('Digite um código.', false);
  const reward = REWARDS.find((r) => r.code === code);
  if (!reward) return show('Código inválido.', false);
  if (state.redeemed.includes(code)) return show('Esse código já foi resgatado nesta conta.', false);
  if (reward.expires < dateKey()) return show('Esse código expirou em ' + prettyDate(reward.expires) + '.', false);
  state.redeemed.push(code);
  addCoins(reward.coins);
  addXp(reward.xp);
  if (reward.shield) state.streakShields = Math.min(5, (state.streakShields || 0) + reward.shield);
  if (reward.theme && !state.themesOwned.includes(reward.theme)) {
    state.themesOwned.push(reward.theme);
    applyTheme(reward.theme);
  }
  renderRewards(); renderStore(); save();
  return show('Código ' + code + ' resgatado: +' + reward.coins + ' moedas, +' + reward.xp + ' XP' + (reward.theme ? ', tema liberado' : '') + (reward.shield ? ' e +' + reward.shield + ' escudo' : '') + '.', true);
}
function bindRewards() {
  renderRewards();
  $('#rewardForm') && $('#rewardForm').addEventListener('submit', (e) => { e.preventDefault(); redeemCode(($('#rewardInput') || {}).value); });
  $('#rewardPasteBtn') && $('#rewardPasteBtn').addEventListener('click', () => {
    if (!navigator.clipboard || !navigator.clipboard.readText) return toast('Seu navegador não permite colar automaticamente.', 'fa-triangle-exclamation', true);
    navigator.clipboard.readText().then((text) => {
      const input = $('#rewardInput'); if (input) input.value = text.trim();
    }).catch(() => toast('Não foi possível ler a área de transferência.', 'fa-triangle-exclamation', true));
  });
}

/* ============ 33. DEV LOG ============ */
const DEVLOG = [
  {
    version: 'v22.1.0', date: '2026-11-17', type: 'feature', title: 'Atalho para as 3 últimas entradas do Dev Log',
    items: [
      'Ctrl+Shift+D abre um painel flutuante com as três entradas mais recentes do Dev Log, de qualquer aba.',
      'O atalho fica fixo na nav bar (rodapé lateral) e também no cabeçalho da aba Dev Log, sempre com a combinação visível.',
      'Cada entrada do painel mantém versão, tipo, data e a lista de mudanças; o rodapé leva ao Dev Log completo.',
      'Esc, clique fora do cartão ou o X fecham o painel; as entradas são lidas do mesmo array que alimenta a aba.'
    ]
  },
  {
    version: 'v22.1.0', date: '2026-11-17', type: 'style', title: 'Painel centralizado com blur e nav bar retrátil',
    items: [
      'O painel das últimas atualizações abre centralizado e flutuante, com blur de 22px no resto da tela.',
      'Abertura animada: o cartão entra com mola e desfoque, um brilho atravessa o cabeçalho e as entradas surgem em cascata de 80 ms.',
      'Novo botão na topbar recolhe a nav bar com transição de largura e giro do ícone; o mesmo botão restaura o menu.',
      'A preferência da nav bar recolhida fica salva no estado e volta assim ao reabrir o hub; tudo respeita Reduzir animações.'
    ]
  },
  {
    version: 'v22.0.0', date: '2026-11-17', type: 'feature', title: 'Foguinho com multiplicador, escudos e check-in progressivo',
    items: [
      'O foguinho agora tem faixas: x1,1 (3 dias), x1,2 (7), x1,35 (14) e x1,5 (30) de XP em tudo o que você ganha.',
      'Escudos de sequência: até 5 unidades por 90 moedas; se ontem passar em branco, um escudo protege o dia e mantém a sequência viva.',
      'Check-in com recompensa crescente (+12 a +40 XP e +4 a +14 moedas) e bônus especiais em 7, 14, 30, 60 e 100 dias.',
      'Novo painel Foguinho na aba Hoje com faixa atual, progresso da meta diária, botão de check-in e compra de escudo.',
      'Anel, heatmap, CSV e cards de Estatísticas passaram a reconhecer dias protegidos por escudo.'
    ]
  },
  {
    version: 'v22.0.0', date: '2026-11-17', type: 'feature', title: 'Missões diárias, novas conquistas e marcos',
    items: [
      'Três missões por dia (foco, flashcards, quiz, metas, cliques, notas e check-in) com progresso ao vivo e resgate de XP + moedas.',
      'Missões são escolhidas de forma determinística pela data: mudam todo dia e não repetem a mesma combinação.',
      'Cinco conquistas novas (sequência de 14 dias, missões, cliques, prestígio e escudo) e quatro marcos com recompensa.',
      'Níveis estendidos até Mítico (5.600 XP) com bônus em moedas a cada subida de nível.',
      'Contadores diários próprios para cards, quiz, metas, cliques, registros e trocas, zerados na virada do dia.'
    ]
  },
  {
    version: 'v22.0.0', date: '2026-11-17', type: 'feature', title: 'Clicker 2.0: combo, prestígio e renda offline',
    items: [
      'Cliques encadeados em até 900 ms montam combo de até x2 na energia por clique, com contador e números flutuantes.',
      'Seis melhorias (incluindo teclado mecânico e servidor local), compra em x1, x10 ou máximo por item.',
      'Três faixas de troca (50→5, 500→60 e 2.500→350 moedas) e auto-troca opcional ao passar de 2.500 de energia.',
      'Prestígio: reinicie energia e melhorias para +15% permanente por núcleo, mantendo moedas e cliques.',
      'Renda offline de até 10 minutos ao reabrir o hub e clique por Espaço/Enter na aba.'
    ]
  },
  {
    version: 'v22.0.0', date: '2026-11-17', type: 'feature', title: 'Novas features em todas as abas',
    items: [
      'Pomodoro com presets 50/10 e 90/15, XP extra em sessões de 25 min ou mais e moedas por bloco de 10 min.',
      'Metas com busca, ordenação por prazo/prioridade/recência e correção da contagem ao reabrir uma meta.',
      'Flashcards com modo reverso (resposta → pergunta) e fila embaralhada; Quiz com combo e XP bônus por sequência de acertos.',
      'Planner com navegação de semanas (−12 a +12), rótulo de semana relativa e cópia da semana visualizada.',
      'Diário com rascunho automático por data; Notas com duplicar; Calculadora com memória (M+/MR/MC) e histórico persistido.',
      'Sons ambiente com camada de vento e preset Tempestade; teclado com estilo retrô; loja com temas Aurora e Sakura.',
      'Cinco comandos novos (foguinho, missoes, escudo, clicker e atalhos atualizados) e três códigos de recompensa v22.'
    ]
  },
  {
    version: 'v22.0.0', date: '2026-11-17', type: 'fix', title: 'Desempenho: gravação, renderização e loops mais leves',
    items: [
      'Gravação no localStorage com debounce de 400 ms, flush ao esconder/sair da página e gravação periódica a cada 30 s.',
      'Topbar coalescida em requestAnimationFrame: várias chamadas no mesmo frame viram uma única pintura.',
      'Clicker deixou de recriar a loja a cada tick: o HUD atualiza apenas os textos e usa delta de tempo real.',
      'Intervalos de Pomodoro e timer por matéria passaram para 1 s e a renda passiva respeita aba oculta.',
      'Buscas de notas, diário e dev log com debounce; render inicial sem repetir as abas já renderizadas pelos bindings.',
      'Coleções e gráficos só são redesenhados quando a aba correspondente está aberta; animações de fundo pausam em aba oculta.'
    ]
  },
  {
    version: 'v21.0.0', date: '2026-11-16', type: 'feature', title: 'Aba Estatísticas completa: check-in diário e painel ao vivo',
    items: [
      'Botão de check-in diário com recompensa de +12 XP e +4 moedas, bloqueado depois do primeiro registro do dia.',
      'Sequência passou a contar check-in e foco registrado, com recorde, dias ativos totais e ativos no período.',
      'Cards ao vivo de Foco hoje (cronômetro somando o ciclo em andamento) e Últimos 7 dias (barras que crescem em tempo real).',
      'Faixa de 7 dias com o dia atual destacado, legenda do mapa de constância e CSV com check-in e sequência.',
      'Mapa de constância marca o dia como ativo mesmo quando só houve check-in, sem foco cronometrado.'
    ]
  },
  {
    version: 'v21.0.0', date: '2026-11-16', type: 'feature', title: 'Biblioteca de caracteres muito maior',
    items: [
      'Mais de 400 símbolos em 14 categorias: matemática, frações e potências, gregos, lógica, setas, química, física, moedas, acentuação, tipografia, formas, marcadores, estatística e fórmulas.',
      'Cada peça mostra nome e código Unicode, com busca por nome, símbolo, categoria ou código (ex.: 03B1).',
      'Painel lateral com último caractere, recentes e favoritos, além de contadores de símbolos, categorias e cópias.',
      'Clique copia e insere no último campo usado, Shift+clique favorita e duplo clique copia o código Unicode.',
      'Atalhos novos: copiar todos os favoritos, limpar recentes e favoritar direto do painel de detalhe.'
    ]
  },
  {
    version: 'v21.0.0', date: '2026-11-16', type: 'style', title: 'Brilho dinâmico nas caixas de pesquisa',
    items: [
      'Glow que respira em todas as caixas de pesquisa, com intensidade maior ao focar o campo.',
      'Glow que segue o cursor dentro do campo, combinado com borda interna luminosa.',
      'Ripple no ponto exato do clique e no foco do campo, criado via delegação de eventos.',
      'Aplicado na busca de abas, notas, diário, caracteres, dev log e na paleta de comandos.',
      'Tudo desliga com o botão Reduzir animações e com prefers-reduced-motion.'
    ]
  },
  {
    version: 'v21.0.0', date: '2026-11-16', type: 'fix', title: 'Consistência de dados e migração',
    items: [
      'Estado antigo é migrado sem perder foco, favoritos, cópias de caracteres ou metas; o título padrão da página acompanha a versão.',
      'Check-in e histórico de foco não duplicam valores ao registrar sessões concluídas.',
      'Título da página, README e cartão de novidades passam a refletir a v21.0.0.'
    ]
  },
  {
    version: 'v20.1.0', date: '2026-11-13', type: 'style', title: 'Motor de animações avançadas nos botões',
    items: [
      'Spotlight radial que segue o cursor em todos os botões e abas da sidebar (variáveis --fx-x/--fx-y alimentadas por JS).',
      'Efeito magnético sutil nos botões e ripple ao clicar com mouse, toque ou teclado (Enter/Espaço).',
      'Botão primário: glow pulsante contínuo, aura expandida no hover e shine sweep atravessando o botão.',
      'Botão secundário com borda gradiente girando; danger com pulso vermelho; ghost com borda luminosa que se desenha no hover.',
      'Ícones e chips com reação própria, pressão elástica (cubic-bezier com overshoot) e halo nos filtros ativos.',
      'Tudo respeita prefers-reduced-motion e o botão Reduzir animações da topbar, com desligamento total das camadas de FX.'
    ]
  },
  {
    version: 'v20.0.0', date: '2026-11-11', type: 'style', title: 'Nova camada visual e shell de navegação',
    items: [
      'Sidebar com grupos, busca de abas em tempo real e versão fixa; bottom-nav no mobile.',
      'Topbar redesenhada: XP com barra, moedas, sequência, foco do dia, relógio e avatar.',
      'Tema claro de componentes: cards, chips, badges, switches, progresso e botões com variantes primary/secondary/ghost/danger e tamanhos sm/lg.',
      'Paleta de comandos (Ctrl+K) com busca de abas e comandos, navegável por teclado.',
      'Modais de login, tutorial e novidades com foco visível, e toasts substituindo alertas nativos.'
    ]
  },
  {
    version: 'v20.0.0', date: '2026-11-11', type: 'feature', title: 'Dashboard "Hoje" e novo motor de progressão',
    items: [
      'Nova aba Hoje: saudação, anel de meta diária, sequência, foco da semana, metas abertas, cards devidos, plano do dia e atalhos.',
      'Sistema de sequência (streak) com recorde persistido e destaque na topbar.',
      'Marcos com recompensa resgatável e oito conquistas automáticas na aba Trilha.',
      'Pets com alimentação por moedas, energia e renda passiva por tick.',
      'Códigos de recompensa com status ativo/resgatado/expirado e histórico.'
    ]
  },
  {
    version: 'v20.0.0', date: '2026-11-11', type: 'feature', title: 'Estudo: flashcards com repetição espaçada, quiz ampliado e planner colorido',
    items: [
      'Flashcards com SM-2 simplificado (erro/difícil/bom/fácil), intervalo e próxima revisão por card, criação de baralhos e atalhos Espaço e 1–4.',
      'Quiz com explicação por alternativa, modo cronometrado de 20s, recorde persistido e revisão dos erros ao final.',
      'Planner semanal com 6 blocos por dia, cores por matéria, modelo pronto, cópia da semana e destaque do dia atual.',
      'Metas com matéria, prioridade, prazo, filtros (incluindo atrasadas) e progresso.',
      'Timer por matéria com pausa, matérias personalizadas e metas de minutos.'
    ]
  },
  {
    version: 'v20.0.0', date: '2026-11-11', type: 'feature', title: 'Tutor local mais útil e ferramentas ampliadas',
    items: [
      'Chat com resposta progressiva, sugestões de follow-up e ações por mensagem: copiar, salvar como nota e criar flashcard.',
      'Modos do tutor usam matéria e palavras-chave (ENEM, foto, revisão) para personalizar a resposta, sempre offline.',
      'Notas com busca, tags, autosave, fixar no topo, contagem de palavras e exportação .md.',
      'Calculadora com histórico clicável, teclado completo e cópia; caracteres com categorias, busca, favoritos e inserção no último campo.',
      'Sons ambiente com camadas, presets, volume geral e timer de desligar; senhas com modo passphrase, entropia e histórico local.'
    ]
  },
  {
    version: 'v20.0.0', date: '2026-11-11', type: 'fix', title: 'Correções de estado, acessibilidade e consistência',
    items: [
      'Estado migra automaticamente da chave antiga (geekieHubState_v194) sem perder notas, metas, temas ou XP.',
      'Todas as abas passam a ter títulos, ícones, dicas e tutorial com 28 passos consistentes.',
      'Iframes com aviso claro de bloqueio, recarregar sem cache e atalhos externos.',
      'Foco visível em todos os controles, alvos de toque maiores, contraste AA e respeito a prefers-reduced-motion.',
      'Cálculo de foco, XP e moedas centralizado em uma única função, evitando valores duplicados ao concluir sessões.'
    ]
  },
  { version: 'v19.5.2', date: '2026-11-09', type: 'feature', title: 'Renda passiva de XP e moedas', items: ['+1 XP a cada 5 segundos com o hub aberto.', 'Moedas passivas por tick conforme o pet ativo.'] },
  { version: 'v19.5.1', date: '2026-11-05', type: 'fix', title: 'XP, níveis e moedas corrigidos', items: ['Subir de nível atualiza o título automaticamente.', 'Comprar tema ou adotar pet atualiza o saldo na hora.'] },
  { version: 'v19.5.0', date: '2026-10-28', type: 'feature', title: 'Aba de Comandos e Códigos de Recompensa', items: ['Terminal com 24 comandos, autocomplete e histórico.', 'Seis campanhas de recompensa com expiração e histórico.'] },
  { version: 'v19.5.0', date: '2026-10-28', type: 'style', title: 'Interface reformulada', items: ['Aurora animada, grade sutil e topbar de vidro.', 'Cards com profundidade, foco visível e busca no menu FAB.'] },
];
let currentDevlogFilter = 'all';
function renderDevlog() {
  const box = $('#devlogList');
  if (!box) return;
  const q = (($('#devlogSearch') || {}).value || '').toLowerCase();
  const labels = { fix: 'Correção', feature: 'Novidade', style: 'Interface' };
  const list = DEVLOG.filter((e) => (currentDevlogFilter === 'all' || e.type === currentDevlogFilter) &&
    (!q || (e.version + ' ' + e.title + ' ' + e.items.join(' ')).toLowerCase().includes(q)));
  box.innerHTML = list.length ? list.map((e) => '<article class="devlog-item" data-type="' + e.type + '"><div class="devlog-head"><span class="devlog-version">' + e.version + '</span><span class="devlog-tag">' + labels[e.type] + '</span><span class="devlog-date">' + e.date + '</span></div>' +
    '<div class="devlog-title">' + esc(e.title) + '</div><ul>' + e.items.map((i) => '<li>' + esc(i) + '</li>').join('') + '</ul></article>').join('')
    : '<div class="empty">Nada por aqui com esse filtro.</div>';
}
function bindDevlog() {
  renderDevlog();
  $('#devlogFilters') && $('#devlogFilters').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    currentDevlogFilter = chip.dataset.filter;
    $$('#devlogFilters .chip').forEach((c) => c.classList.toggle('active', c === chip));
    renderDevlog();
  });
  $('#devlogSearch') && $('#devlogSearch').addEventListener('input', debounce(renderDevlog, 140));
}

/* ============ 33-B. ATALHO DAS ÚLTIMAS ATUALIZAÇÕES ============ */
function devlogLatest(count) {
  return DEVLOG.slice(0, count || 3);
}
function renderDevlogRecent() {
  const box = $('#devlogRecentList');
  if (!box) return;
  const labels = { fix: 'Correção', feature: 'Novidade', style: 'Interface' };
  const list = devlogLatest(3);
  box.innerHTML = list.length ? list.map((e, i) => '<article class="devlog-item devlog-recent-item" data-type="' + e.type + '" style="--i:' + i + '">' +
    '<div class="devlog-head"><span class="devlog-version">' + e.version + '</span>' +
    '<span class="devlog-tag">' + labels[e.type] + '</span>' +
    '<span class="devlog-date">' + e.date + '</span></div>' +
    '<div class="devlog-title">' + esc(e.title) + '</div>' +
    '<ul>' + e.items.map((i2) => '<li>' + esc(i2) + '</li>').join('') + '</ul></article>').join('')
    : '<div class="empty">Nenhuma entrada no Dev Log ainda.</div>';
}
function openDevlogRecent() {
  const overlay = $('#devlogRecentOverlay');
  if (!overlay) return;
  renderDevlogRecent();
  overlay.hidden = false;
  const card = $('.devlog-recent-card', overlay);
  if (card && !state.motionReduced) {
    card.style.animation = 'none';
    void card.offsetWidth;
    card.style.animation = '';
  }
  const close = $('#devlogRecentClose');
  if (close) setTimeout(() => close.focus(), 60);
}
function closeDevlogRecent() {
  const overlay = $('#devlogRecentOverlay');
  if (overlay) overlay.hidden = true;
}
function bindDevlogRecent() {
  ['#navDevlogRecentBtn', '#devlogRecentBtn'].forEach((sel) => {
    const btn = $(sel);
    if (btn) btn.addEventListener('click', openDevlogRecent);
  });
  $('#devlogRecentClose') && $('#devlogRecentClose').addEventListener('click', closeDevlogRecent);
  $('#devlogRecentOverlay') && $('#devlogRecentOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'devlogRecentOverlay') closeDevlogRecent();
  });
  $('#devlogRecentOpenAll') && $('#devlogRecentOpenAll').addEventListener('click', () => {
    closeDevlogRecent();
    switchTab('devlog');
  });
}

/* ============ 33-C. NAV BAR RETRÁTIL ============ */
function applyNavCollapsed() {
  const collapsed = !!state.navCollapsed;
  document.body.classList.toggle('nav-collapsed', collapsed);
  const btn = $('#btnNavToggle');
  if (btn) {
    const label = collapsed ? 'Mostrar menu lateral' : 'Recolher menu lateral';
    btn.setAttribute('aria-pressed', String(collapsed));
    btn.title = label;
    btn.setAttribute('aria-label', label);
  }
}
function toggleNavCollapsed() {
  state.navCollapsed = !state.navCollapsed;
  applyNavCollapsed();
  save();
  const btn = $('#btnNavToggle');
  if (btn && !state.motionReduced) {
    btn.classList.remove('is-flipping');
    void btn.offsetWidth;
    btn.classList.add('is-flipping');
    setTimeout(() => btn.classList.remove('is-flipping'), 700);
  }
  toast(state.navCollapsed ? 'Nav bar recolhida. O mesmo botão devolve o menu.' : 'Nav bar restaurada.', 'fa-table-columns');
}

/* ============ 34. SENHAS ============ */
const PASS_WORDS = ['estudo', 'foco', 'meta', 'livro', 'prova', 'ciencia', 'logica', 'atlas', 'nuvem', 'farol', 'trilha', 'codigo', 'mente', 'ritmo', 'ponte', 'luz', 'mapa', 'clima', 'forca', 'tempo'];
const passHistory = [];
function randomInt(max) {
  const arr = new Uint32Array(1);
  if (window.crypto && window.crypto.getRandomValues) { crypto.getRandomValues(arr); return arr[0] % max; }
  return Math.floor(Math.random() * max);
}
function makePassword(len) {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const nums = '23456789';
  const syms = '!@#$%&*?-_=+';
  let pool = lower;
  if (($('#passwordUpper') || {}).checked) pool += upper;
  if (($('#passwordNumbers') || {}).checked) pool += nums;
  if (($('#passwordSymbols') || {}).checked) pool += syms;
  let out = '';
  for (let i = 0; i < len; i++) out += pool[randomInt(pool.length)];
  return out;
}
function makePassphrase() {
  const words = [];
  for (let i = 0; i < 4; i++) words.push(PASS_WORDS[randomInt(PASS_WORDS.length)]);
  return words.join('-') + '-' + (10 + randomInt(89));
}
function entropyOf(text, passphrase) {
  if (passphrase) return Math.round(4 * Math.log2(PASS_WORDS.length) + Math.log2(90));
  let pool = 26;
  if (($('#passwordUpper') || {}).checked) pool += 25;
  if (($('#passwordNumbers') || {}).checked) pool += 8;
  if (($('#passwordSymbols') || {}).checked) pool += 13;
  return Math.round(text.length * Math.log2(pool));
}
function generatePassword() {
  const passphrase = ($('#passwordWords') || {}).checked;
  const len = Number(($('#passwordLength') || {}).value) || 18;
  const pass = passphrase ? makePassphrase() : makePassword(len);
  const out = $('#passwordOutput'); if (out) out.value = pass;
  const bits = entropyOf(pass, passphrase);
  const fill = $('#strengthFill');
  const pct = clamp(bits / 1.2, 5, 100);
  if (fill) {
    fill.style.width = pct + '%';
    fill.style.background = bits >= 100 ? 'var(--success)' : bits >= 70 ? 'var(--gold)' : 'var(--danger)';
  }
  const label = $('#strengthLabel');
  if (label) label.textContent = bits >= 100 ? 'Excelente' : bits >= 70 ? 'Boa' : bits >= 45 ? 'Razoável' : 'Fraca';
  const ent = $('#passwordEntropy'); if (ent) ent.textContent = bits + ' bits';
  passHistory.unshift({ pass, bits });
  passHistory.splice(6);
  renderPasswordHistory();
}
function renderPasswordHistory() {
  const box = $('#passwordHistory');
  if (!box) return;
  box.innerHTML = passHistory.length ? passHistory.map((p) => '<div class="pass-item"><span>' + esc(p.pass) + '</span><span class="row"><span class="status-text">' + p.bits + 'b</span>' +
    '<button class="btn btn-icon btn-ghost btn-sm" type="button" data-pass-copy="' + esc(p.pass) + '" aria-label="Copiar"><i class="fa-solid fa-copy"></i></button></div></div>').join('')
    : '<div class="empty">Nenhuma senha gerada nesta sessão.</div>';
}
function bindPassword() {
  renderPasswordHistory();
  $('#passwordGenerate') && $('#passwordGenerate').addEventListener('click', generatePassword);
  $('#passwordCopy') && $('#passwordCopy').addEventListener('click', () => {
    const v = ($('#passwordOutput') || {}).value || '';
    if (!v || v === 'Clique em gerar') return toast('Gere uma senha primeiro.', 'fa-triangle-exclamation', true);
    copyText(v).then((ok) => toast(ok ? 'Senha copiada.' : 'Não foi possível copiar.', ok ? 'fa-copy' : 'fa-triangle-exclamation', !ok));
  });
  $('#passwordLength') && $('#passwordLength').addEventListener('input', (e) => {
    const v = $('#passwordLengthValue'); if (v) v.textContent = e.target.value;
  });
  $('#passwordHistory') && $('#passwordHistory').addEventListener('click', (e) => {
    const b = e.target.closest('[data-pass-copy]');
    if (b) copyText(b.dataset.passCopy).then((ok) => toast(ok ? 'Senha copiada.' : 'Não foi possível copiar.', 'fa-copy'));
  });
}

/* ============ 34-B. MOTOR FX DOS BOTÕES (v20.1.0) ============ */
/* Spotlight (--fx-x/--fx-y), efeito magnético (--fx-tx/--fx-ty) e ripple.
   Delegação de eventos: funciona para todos os botões, inclusive criados dinamicamente. */
let fxHover = null;
let fxQueued = false;
let fxMouseX = 0, fxMouseY = 0;
function fxMotionOff() {
  return state.motionReduced === true || !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}
function fxReset(el) {
  if (!el) return;
  el.style.removeProperty('--fx-tx');
  el.style.removeProperty('--fx-ty');
}
function fxResetAll() {
  $$('.btn, .nav-item, .chip').forEach((el) => {
    fxReset(el);
    el.style.removeProperty('--fx-x');
    el.style.removeProperty('--fx-y');
  });
  $$('.fx-ripple').forEach((el) => el.remove());
  if (typeof sfResetAll === 'function') sfResetAll();
}
function fxSpotlightFrame() {
  fxQueued = false;
  const el = fxHover;
  if (!el || fxMotionOff() || !document.contains(el)) return;
  const r = el.getBoundingClientRect();
  if (!r.width || !r.height) return;
  el.style.setProperty('--fx-x', (fxMouseX - r.left).toFixed(1) + 'px');
  el.style.setProperty('--fx-y', (fxMouseY - r.top).toFixed(1) + 'px');
  if (el.classList.contains('btn') && !el.classList.contains('btn-block')) {
    const strength = el.classList.contains('btn-icon') ? 3 : 2.4;
    const dx = clamp((fxMouseX - (r.left + r.width / 2)) / (r.width / 2), -1, 1);
    const dy = clamp((fxMouseY - (r.top + r.height / 2)) / (r.height / 2), -1, 1);
    el.style.setProperty('--fx-tx', (dx * strength).toFixed(2) + 'px');
    el.style.setProperty('--fx-ty', (dy * strength).toFixed(2) + 'px');
  }
}
function fxRipple(host, clientX, clientY) {
  if (fxMotionOff() || !host) return;
  const r = host.getBoundingClientRect();
  if (!r.width || !r.height) return;
  const d = Math.max(r.width, r.height) * 2.1;
  const x = clientX == null ? r.left + r.width / 2 : clientX;
  const y = clientY == null ? r.top + r.height / 2 : clientY;
  const dot = document.createElement('span');
  dot.className = 'fx-ripple';
  dot.style.width = dot.style.height = d.toFixed(0) + 'px';
  dot.style.left = (x - r.left - d / 2).toFixed(1) + 'px';
  dot.style.top = (y - r.top - d / 2).toFixed(1) + 'px';
  host.appendChild(dot);
  dot.addEventListener('animationend', () => dot.remove(), { once: true });
  setTimeout(() => dot.remove(), 900);
}
function initButtonFx() {
  if (initButtonFx.bound) return;
  initButtonFx.bound = true;
  document.addEventListener('pointermove', (e) => {
    if (fxMotionOff()) { if (fxHover) { fxReset(fxHover); fxHover = null; } return; }
    const el = e.target && e.target.closest ? e.target.closest('.btn, .nav-item') : null;
    if (el !== fxHover) { if (fxHover) fxReset(fxHover); fxHover = el; }
    if (!fxHover) return;
    fxMouseX = e.clientX;
    fxMouseY = e.clientY;
    if (!fxQueued) { fxQueued = true; requestAnimationFrame(fxSpotlightFrame); }
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', () => { if (fxHover) { fxReset(fxHover); fxHover = null; } });
  document.addEventListener('pointerdown', (e) => {
    const el = e.target && e.target.closest ? e.target.closest('.btn, .chip') : null;
    if (el) fxRipple(el, e.clientX, e.clientY);
  }, { passive: true });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const el = document.activeElement;
    if (el && (el.classList.contains('btn') || el.classList.contains('chip'))) fxRipple(el);
  });
}

/* ============ 34-C. FX DAS CAIXAS DE PESQUISA (v21.0.0) ============ */
/* Brilho dinâmico (glow que respira), glow que segue o mouse (--sf-x/--sf-y)
   e ripple no clique/foco de cada .search-field e da paleta de comandos. */
let sfHover = null;
let sfQueued = false;
let sfMouseX = 0, sfMouseY = 0;

function sfReset(el) {
  if (!el) return;
  el.classList.remove('sf-tracking');
  el.style.removeProperty('--sf-x');
  el.style.removeProperty('--sf-y');
}
function sfResetAll() {
  $$('.search-field, .palette-input').forEach(sfReset);
  $$('.sf-ripple').forEach((el) => el.remove());
  sfHover = null;
}
function sfFrame() {
  sfQueued = false;
  const el = sfHover;
  if (!el || fxMotionOff() || !document.contains(el)) return;
  const r = el.getBoundingClientRect();
  if (!r.width || !r.height) return;
  el.style.setProperty('--sf-x', (sfMouseX - r.left).toFixed(1) + 'px');
  el.style.setProperty('--sf-y', (sfMouseY - r.top).toFixed(1) + 'px');
}
function sfRipple(host, clientX, clientY) {
  if (fxMotionOff() || !host) return;
  const r = host.getBoundingClientRect();
  if (!r.width || !r.height) return;
  const d = Math.max(r.width, r.height) * 1.9;
  const x = clientX == null ? r.left + r.width * 0.18 : clientX;
  const y = clientY == null ? r.top + r.height / 2 : clientY;
  const dot = document.createElement('span');
  dot.className = 'sf-ripple';
  dot.style.width = dot.style.height = d.toFixed(0) + 'px';
  dot.style.left = (x - r.left - d / 2).toFixed(1) + 'px';
  dot.style.top = (y - r.top - d / 2).toFixed(1) + 'px';
  host.appendChild(dot);
  dot.addEventListener('animationend', () => dot.remove(), { once: true });
  setTimeout(() => dot.remove(), 1000);
}
function initSearchFx() {
  if (initSearchFx.bound) return;
  initSearchFx.bound = true;
  const host = (el) => (el && el.closest ? el.closest('.search-field, .palette-input') : null);
  document.addEventListener('pointermove', (e) => {
    if (fxMotionOff()) { if (sfHover) { sfReset(sfHover); sfHover = null; } return; }
    const el = host(e.target);
    if (el !== sfHover) {
      if (sfHover) sfHover.classList.remove('sf-tracking');
      sfHover = el;
      if (el) el.classList.add('sf-tracking');
    }
    if (!sfHover) return;
    sfMouseX = e.clientX;
    sfMouseY = e.clientY;
    if (!sfQueued) { sfQueued = true; requestAnimationFrame(sfFrame); }
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', () => {
    if (sfHover) { sfReset(sfHover); sfHover = null; }
  });
  document.addEventListener('pointerdown', (e) => {
    const el = host(e.target);
    if (el) sfRipple(el, e.clientX, e.clientY);
  }, { passive: true });
  document.addEventListener('focusin', (e) => {
    if (fxMotionOff()) return;
    const el = host(e.target);
    if (el) sfRipple(el);
  });
}

/* ============ 35. GLOBAIS, RENDER E BOOT ============ */
function toggleZen() {
  document.body.classList.toggle('zen');
  const btn = $('#btnZenMode');
  if (btn) btn.setAttribute('aria-pressed', String(document.body.classList.contains('zen')));
}
function bindGlobal() {
  document.addEventListener('click', (e) => {
    if (e.__goalHandled) return;
    const go = e.target.closest('[data-goto]');
    if (go) { switchTab(go.dataset.goto); return; }
    const toggle = e.target.closest('[data-goal-toggle]');
    if (toggle && !toggle.closest('#goalList')) { toggleGoal(toggle.dataset.goalToggle); return; }
    const deck = e.target.closest('[data-deck]');
    if (deck) { state.deck = deck.dataset.deck; buildFlashQueue(); switchTab('flashcards'); renderFlashcards(); save(); return; }
    const more = e.target.closest('#mobileMore');
    if (more) { openPalette(); return; }
  });
  $('#sidebarOpen') && $('#sidebarOpen').addEventListener('click', () => document.body.classList.add('nav-open'));
  $('#sidebarClose') && $('#sidebarClose').addEventListener('click', () => document.body.classList.remove('nav-open'));
  $('#btnZenMode') && $('#btnZenMode').addEventListener('click', toggleZen);
  $('#btnNavToggle') && $('#btnNavToggle').addEventListener('click', toggleNavCollapsed);
  $('#btnMotionMode') && $('#btnMotionMode').addEventListener('click', () => {
    state.motionReduced = !state.motionReduced;
    applyMotion(); save();
    toast(state.motionReduced ? 'Animações reduzidas.' : 'Animações ativadas.', 'fa-wand-magic-sparkles');
  });
  $('#streakPill') && $('#streakPill').addEventListener('click', () => switchTab('stats'));
  const navSearch = $('#navSearch');
  if (navSearch) {
    navSearch.addEventListener('input', () => {
      const q = navSearch.value.toLowerCase().trim();
      $$('#navGroups .nav-item').forEach((b) => { b.hidden = !!q && !b.textContent.toLowerCase().includes(q); });
      $$('#navGroups .nav-group').forEach((g) => {
        const visible = $$('.nav-item', g).some((b) => !b.hidden);
        g.hidden = !visible;
      });
    });
  }
  document.addEventListener('keydown', (e) => {
    const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette(); return; }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'd') { e.preventDefault(); openDevlogRecent(); return; }
    if (e.key === 'Escape') {
      closePalette();
      closeDevlogRecent();
      const tut = $('#tutorialOverlay'); if (tut && !tut.hidden) closeTutorial();
      document.body.classList.remove('nav-open');
      return;
    }
    if (e.altKey && e.key.toLowerCase() === 'z') { e.preventDefault(); toggleZen(); return; }
    if (e.key === '/' && !typing) { e.preventDefault(); const s = $('#navSearch'); if (s) s.focus(); }
  });
  window.addEventListener('hashchange', () => {
    const id = location.hash.replace('#', '');
    if (TAB_MAP[id] && id !== state.currentTab) switchTab(id, { silent: true });
  });
  document.addEventListener('visibilitychange', () => {
    document.body.classList.toggle('tab-hidden', document.hidden);
    if (document.hidden) saveNow();
    else {
      renderTopbar();
      if (state.currentTab === 'stats') renderStatsLive();
      if (state.currentTab === 'clicker') renderClickerHud();
    }
  });
}
function renderAll() {
  /* Cada bind*() já renderiza a própria aba no boot. Aqui fica só o que
     não tem binding próprio, evitando ~20 renderizações duplicadas. */
  renderTopbar();
  renderHoje();
  renderGoalSubjects();
  renderQuizBest();
  renderCmdSuggestions('');
}
const RENDERERS = {
  hoje: renderHoje, timer: renderTimer, goals: renderGoals, flashcards: renderFlashcards, quiz: renderQuizBest,
  subjects: renderSubjects, planner: renderPlanner, stats: renderStats, diary: renderDiary, chat: renderChat,
  commands: renderCmdSuggestions, store: renderStore, titles: renderTitles, pets: renderPets, journey: renderJourney,
  clicker: renderClickerShop, rewards: renderRewards, notes: renderNotes, ambient: renderAmbient, keysounds: renderKeySounds,
  calculator: calcRender, chars: renderChars, title: renderPageTitle, password: renderPasswordHistory,
  geekie: () => {}, google: () => {}, events: renderEvents, devlog: renderDevlog
};
function maybeWhatsNew() {
  let seen = '';
  try { seen = localStorage.getItem(SEEN_KEY) || ''; } catch (e) { seen = ''; }
  if (seen === VERSION) return;
  const list = $('#whatsNewList');
  if (list) {
    const entries = DEVLOG.filter((d) => d.version === VERSION);
    const items = entries.reduce((acc, e) => acc.concat(e.items), []);
    list.innerHTML = items.slice(0, 8).map((i) => '<li>' + esc(i) + '</li>').join('');
  }
  const overlay = $('#whatsNewOverlay');
  if (overlay) overlay.hidden = false;
  try { localStorage.setItem(SEEN_KEY, VERSION); } catch (e) { /* ignore */ }
}
function bindWhatsNew() {
  const close = () => { const o = $('#whatsNewOverlay'); if (o) o.hidden = true; };
  $('#whatsNewClose') && $('#whatsNewClose').addEventListener('click', close);
  $('#whatsNewStart') && $('#whatsNewStart').addEventListener('click', close);
  $('#whatsNewOverlay') && $('#whatsNewOverlay').addEventListener('click', (e) => { if (e.target.id === 'whatsNewOverlay') close(); });
}
function startLoops() {
  setInterval(() => {
    if (document.hidden) return;
    renderTopbar();
    if (!state.session) return;
    addXp(1, true);
    const pet = PETS.find((p) => p.id === state.pet);
    if (pet) {
      addCoins(pet.income);
      const energy = state.petEnergy[pet.id] || 0;
      if (energy > 0) state.petEnergy[pet.id] = energy - 1;
      if (state.currentTab === 'pets') renderPets();
    }
  }, 5000);
  setInterval(() => { if (state.session && !document.hidden) saveNow(); }, 30000);
  setInterval(() => {
    if (document.hidden) return;
    ensureDailyStats();
    const today = dateKey();
    if (state.lastVisit !== today) {
      state.lastVisit = today;
      cancelSave(); saveNow();
      renderHoje(); renderTopbar();
      if (state.currentTab === 'stats') renderStats();
    }
  }, 60000);
}
function boot() {
  applyTheme(state.theme);
  applyPageTitle();
  applyMotion();
  applyNavCollapsed();
  document.body.classList.toggle('tab-hidden', document.hidden);
  applyStreakShield();
  applyOfflineEnergy();
  buildNav();
  bindGlobal();
  bindGamification();
  initButtonFx();
  initSearchFx();
  bindAuth();
  bindTutorial();
  bindPalette();
  bindWhatsNew();
  bindChat();
  bindNotes();
  bindPomodoro();
  bindGoals();
  bindFlashcards();
  bindQuiz();
  bindSubjects();
  bindPlanner();
  bindStats();
  bindDiary();
  bindStore();
  bindTitles();
  bindPets();
  bindJourney();
  bindClicker();
  bindAmbient();
  bindKeySounds();
  bindCalculator();
  bindChars();
  bindPageTitle();
  bindEvents();
  bindPortals();
  bindCommands();
  bindRewards();
  bindDevlog();
  bindDevlogRecent();
  bindPassword();
  renderAll();
  if (state.lastVisit !== dateKey()) { state.lastVisit = dateKey(); save(); }
  if (state.session) openApp();
  else { setAuthMode(false); const overlay = $('#loginOverlay'); if (overlay) overlay.hidden = false; }
  startLoops();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
