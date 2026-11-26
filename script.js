/* ============================================================
   Geekie Study Hub v26.0.0 — script.js (parte 1/4)
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
  if (!freq) return;
  try {
    if (!state.soundEnabled) return;
    const ctx = fxAudioCtxGet();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type; osc.frequency.value = freq;
    gain.gain.value = volume;
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.stop(ctx.currentTime + duration);
  } catch (e) { /* silencioso */ }
}
/* Um único AudioContext para todos os efeitos: criar um por beep/tecla
   custava caro e podia estourar o limite de contextos do navegador. */
let sharedAudio = null;
function fxAudioCtxGet() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!sharedAudio) {
    try { sharedAudio = new AC(); } catch (e) { return null; }
  }
  if (sharedAudio.state === 'suspended') { try { sharedAudio.resume(); } catch (e) { /* ignore */ } }
  return sharedAudio;
}

/* ============ 2. ESTADO ============ */
const VERSION = 'v26.0.0';
const STORAGE_KEY = 'geekieHubState_v22';
const LEGACY_KEYS = ['geekieHubState_v20', 'geekieHubState_v194'];
/* Contas continuam na mesma chave: trocar de versão não desloga ninguém. */
const ACCOUNTS_KEY = 'geekieHubAccounts_v20';
const LEGACY_ACCOUNTS = ['geekieHubAccounts_v194'];
const SEEN_KEY = 'geekieHubSeenVersion_v22';

const DEFAULT_STATE = {
  session: null,
  xp: 0, coins: 25, title: 'Novato',
  pageTitle: 'Geekie Study Hub v26.0.0', font: 'Poppins', icon: 'fa-graduation-cap',
  themesOwned: ['default'], theme: 'default',
  petsOwned: [], pet: null, petEnergy: {}, petFed: {},
  focusByDate: {}, subjectMinutes: {}, subjectGoals: {}, customSubjects: [],
  sessions: 0, pomoSessions: 0, pomoCycle: 1,
  pomoConfig: { focus: 25, short: 5, long: 15, cycles: 4, autoBreak: true, sound: true, subject: '' },
  goals: [], notes: {}, noteOrder: [], currentNote: null,
  decks: { Geral: [{ id: 'seed1', q: 'Qual é a fórmula da velocidade média?', a: 'Vm = ΔS / Δt — variação da posição dividida pelo intervalo de tempo.', ease: 2.5, interval: 0, due: '', reps: 0, lapses: 0, createdAt: Date.now() }, { id: 'seed2', q: 'O que é uma hipótese?', a: 'Uma explicação testável para um fenômeno, que pode ser confirmada ou refutada.', ease: 2.5, interval: 0, due: '', reps: 0, lapses: 0, createdAt: Date.now() }] },
  deck: 'Geral', flashStats: { again: 0, hard: 0, good: 0, easy: 0 }, flashRound: 0,
  planner: {}, plannerWeek: dateKey(startOfWeek()), diary: {},
  clicker: { points: 0, upgrades: {}, clicks: 0, total: 0, lifetime: 0, prestige: 0, autoExchange: false, buyAmount: 1, lastSeen: 0, comboBest: 0, exchanges: 0, talents: {}, milestones: [], goldUntil: 0, goldNext: 0, goldSeen: 0, crits: 0 },
  boosts: { xpUntil: 0, coinUntil: 0 },
  dailyChest: { date: '', claimed: false, coins: 0, xp: 0, shield: false },
  weeklyStats: { week: '', focus: 0, cards: 0, quiz: 0, goals: 0, clicks: 0, sessions: 0, checkins: 0 },
  weeklyClaims: [], subjectLog: [], petXp: {},
  keySounds: { on: false, style: 'soft', volume: 45 },
  ambient: { master: 70, layers: { rain: 0, noise: 0, waves: 0, fire: 0, wind: 0, cafe: 0 } },
  charsFav: [], recentChars: [], charCopies: 0, portalZoom: {},
  adminCodeHash: '', adminLog: [], customCodes: [], adminRailCollapsed: false,
  checkins: {}, streakProtect: {}, streakShields: 0, shieldsUsed: 0,
  dailyStats: { date: '', cards: 0, quiz: 0, goals: 0, clicks: 0, notes: 0, exchanges: 0, missions: 0, sessions: 0, checkin: 0 },
  missionClaims: [], diaryDrafts: {},
  chatHistory: [], motionReduced: false, soundEnabled: true, navCollapsed: false,
  quizBest: 0, quizHistory: [], redeemed: [], commandHistory: [],
  streakBest: 0, lastVisit: '', seenVersion: '', achievements: {}, milestonesClaimed: [],
  calcHistory: [], createdAt: Date.now(), totalGoalsDone: 0,
  xpEarned: 0, coinsEarned: 0, chestsOpened: 0, boostsBought: 0, boostsUsed: 0,
  rebirths: 0, rebirthLog: [], rebirthBest: 0,
  favs: { themes: [], pets: [], titles: [] }
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
  s.clicker.talents = Object.assign({}, (saved.clicker || {}).talents || {});
  s.clicker.milestones = Array.isArray((saved.clicker || {}).milestones) ? saved.clicker.milestones.slice() : [];
  s.boosts = Object.assign({}, DEFAULT_STATE.boosts, saved.boosts || {});
  s.dailyChest = Object.assign({}, DEFAULT_STATE.dailyChest, saved.dailyChest || {});
  s.weeklyStats = Object.assign({}, DEFAULT_STATE.weeklyStats, saved.weeklyStats || {});
  s.petXp = Object.assign({}, saved.petXp || {});
  s.keySounds = Object.assign({}, DEFAULT_STATE.keySounds, saved.keySounds || {});
  s.ambient = Object.assign({}, DEFAULT_STATE.ambient, saved.ambient || {}, { layers: Object.assign({}, DEFAULT_STATE.ambient.layers, (saved.ambient || {}).layers || {}) });
  if (!s.decks || typeof s.decks !== 'object' || !Object.keys(s.decks).length) s.decks = DEFAULT_STATE.decks;
  Object.keys(s.decks).forEach((d) => { if (!Array.isArray(s.decks[d])) s.decks[d] = []; });
  if (!Array.isArray(s.deck ? [s.deck] : []) || !s.decks[s.deck]) s.deck = Object.keys(s.decks)[0];
  ['themesOwned', 'petsOwned', 'goals', 'noteOrder', 'charsFav', 'recentChars', 'chatHistory', 'redeemed', 'commandHistory', 'quizHistory', 'milestonesClaimed', 'customSubjects', 'calcHistory', 'missionClaims', 'weeklyClaims', 'subjectLog', 'adminLog', 'customCodes', 'rebirthLog'].forEach((k) => { if (!Array.isArray(s[k])) s[k] = []; });
  s.favs = Object.assign({}, DEFAULT_STATE.favs, s.favs || {});
  ['themes', 'pets', 'titles'].forEach((k) => { if (!Array.isArray(s.favs[k])) s.favs[k] = []; });
  s.rebirths = clamp(Math.floor(Number(s.rebirths) || 0), 0, 5);
  s.rebirthBest = Math.max(Number(s.rebirthBest) || 0, s.rebirths);
  s.customCodes = s.customCodes.filter((c) => c && typeof c.code === 'string').slice(0, 60);
  s.adminLog = s.adminLog.filter((l) => l && typeof l.at === 'number').slice(0, 80);
  ['focusByDate', 'subjectMinutes', 'subjectGoals', 'petEnergy', 'petFed', 'petXp', 'notes', 'planner', 'diary', 'achievements', 'checkins', 'streakProtect', 'boosts', 'dailyChest', 'weeklyStats', 'diaryDrafts', 'portalZoom'].forEach((k) => { if (!s[k] || typeof s[k] !== 'object') s[k] = {}; });
  s.adminRailCollapsed = !!s.adminRailCollapsed;
  s.dailyStats = Object.assign({}, DEFAULT_STATE.dailyStats, s.dailyStats);
  if (typeof s.charCopies !== 'number' || !isFinite(s.charCopies)) s.charCopies = 0;
  s.streakShields = clamp(Number(s.streakShields) || 0, 0, 5);
  s.xpEarned = Math.max(0, Number(s.xpEarned) || 0);
  s.coinsEarned = Math.max(0, Number(s.coinsEarned) || 0);
  if (['Geekie Study Hub v25.0.0', 'Geekie Study Hub v24.0.0', 'Geekie Study Hub v23.0.0', 'Geekie Study Hub v22.3.0', 'Geekie Study Hub v22.2.0', 'Geekie Study Hub v22.1.0', 'Geekie Study Hub v22.0.0', 'Geekie Study Hub v21.0.0', 'Geekie Study Hub v20.1.0'].indexOf(s.pageTitle) !== -1) s.pageTitle = DEFAULT_STATE.pageTitle;
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
  { id: 'store', title: 'Loja', icon: 'fa-store', group: 'Progresso', kicker: 'Temas', desc: 'Dezesseis temas com wallpaper próprio, favoritos e dois boosts consumíveis.', tips: ['Cada tema tem um wallpaper animado e um gráfico com a paleta dele.', 'Favoritar deixa o tema no filtro Favoritos e no topo da loja.', 'Temas de Rebirth só aparecem depois do renascimento.'] },
  { id: 'titles', title: 'Títulos', icon: 'fa-crown', group: 'Progresso', kicker: 'Status', desc: 'Títulos liberados por XP e equipáveis na topbar.', tips: ['Você mantém o título ao subir de nível.', 'O próximo título mostra quanto falta.'] },
  { id: 'pets', title: 'Pets', icon: 'fa-paw', group: 'Progresso', kicker: 'Companhia', desc: 'Pets com energia, alimentação e renda passiva de moedas.', tips: ['Alimentar custa moedas e mantém o bônus.', 'Cada pet rende um valor diferente por tick.'] },
  { id: 'journey', title: 'Trilha', icon: 'fa-map', group: 'Progresso', kicker: 'Evolução', desc: 'Doze níveis, quinze marcos, dezenove conquistas e escudos de sequência.', tips: ['Marque marcos para resgatar moedas e XP.', 'Conquistas são automáticas, inclusive as do baú, dos críticos e dos talentos.', 'Compre escudos para não perder a sequência em um dia corrido.'] },
  { id: 'rebirth', title: 'Rebirth', icon: 'fa-rocket', group: 'Progresso', kicker: 'Renascimento', desc: 'Renascimentos com foguete, multiplicador permanente e cinco pacotes cósmicos exclusivos.', tips: ['Renascer zera XP e moedas, mas mantém temas, pets, títulos, boosts, sequência e talentos.', 'Cada renascimento dá +30% em XP e moedas, para sempre.', 'Cada nível desbloqueia um tema, um título e um pet que não existem em outro lugar.'] },
  { id: 'clicker', title: 'Clicker', icon: 'fa-hand-pointer', group: 'Progresso', kicker: 'Energia', desc: 'Núcleo 3.0 com 12 melhorias, críticos, núcleo dourado, talentos de prestígio, cinco trocas e marcos.', tips: ['Críticos dão 6x energia e o núcleo dourado dá 5x produção por 20s.', 'Prestígio rende +15% permanente e núcleos para gastar em talentos.', 'A energia acumula offline por até 10min (+5min por prestígio, máx. 2h).'] },
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
  { id: 'devlog', title: 'Dev Log', icon: 'fa-code-branch', group: 'Extras', kicker: 'Versões', desc: 'Histórico de versões com filtros, busca e atalho para as 3 últimas.', tips: ['Filtre por correção, novidade ou interface.', 'A v26.0.0 documenta o Rebirth com foguete, os cinco ciclos cósmicos, os favoritos e os wallpapers temáticos.', 'Ctrl+Shift+D abre as 3 últimas em um painel flutuante; Ctrl+Shift+G vai direto ao Rebirth.', 'Ctrl+B alterna a nav bar compacta e não interfere na nav bar da central.'] }
];
const TAB_MAP = Object.fromEntries(TABS.map((t) => [t.id, t]));
const GROUPS = ['Hoje', 'Estudo', 'Inteligência', 'Progresso', 'Ferramentas', 'Extras'];

const LEVELS = [
  { xp: 0, title: 'Novato' }, { xp: 100, title: 'Estudante' }, { xp: 300, title: 'Focado' },
  { xp: 600, title: 'Disciplinado' }, { xp: 1000, title: 'Estrategista' },
  { xp: 1500, title: 'Mestre' }, { xp: 2200, title: 'Lenda' }, { xp: 3000, title: 'Geekie Supremo' },
  { xp: 4200, title: 'Lenda Suprema' }, { xp: 5600, title: 'Mítico' },
  { xp: 7000, title: 'Ascendido' }, { xp: 9000, title: 'Lenda Eterna' }
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
  { id: 'sakura', name: 'Sakura', price: 480, a: '#f472b6', b: '#fb7185' },
  { id: 'nebula', name: 'Nebulosa', price: 0, a: '#818cf8', b: '#22d3ee', rebirth: 1, wall: 'Poeira estelar em violeta e ciano' },
  { id: 'orbit', name: 'Órbita', price: 0, a: '#38bdf8', b: '#6366f1', rebirth: 2, wall: 'Anéis orbitais sobre azul profundo' },
  { id: 'quasar', name: 'Quasar', price: 0, a: '#a3e635', b: '#22d3ee', rebirth: 3, wall: 'Jatos de luz verde e turquesa' },
  { id: 'supernova', name: 'Supernova', price: 0, a: '#fbbf24', b: '#f43f5e', rebirth: 4, wall: 'Explosão dourada com poeira vermelha' },
  { id: 'singularity', name: 'Singularidade', price: 0, a: '#e879f9', b: '#6366f1', rebirth: 5, wall: 'Horizonte de eventos em magenta e índigo' }
];
const PETS = [
  { id: 'neko', name: 'Neko', emoji: '🐱', price: 40, income: 1 },
  { id: 'corujinha', name: 'Corujinha', emoji: '🦉', price: 90, income: 2 },
  { id: 'tartaruga', name: 'Tartaruga Zen', emoji: '🐢', price: 150, income: 3 },
  { id: 'raposa', name: 'Raposa', emoji: '🦊', price: 230, income: 4 },
  { id: 'dragao', name: 'Dragãozinho', emoji: '🐲', price: 340, income: 6 },
  { id: 'fenix', name: 'Fênix', emoji: '🔥', price: 520, income: 9 },
  { id: 'corvo', name: 'Corvo sábio', emoji: '🐦‍⬛', price: 760, income: 13 },
  { id: 'astro', name: 'Astro', emoji: '🪐', price: 0, income: 18, rebirth: 1 },
  { id: 'cometa', name: 'Cometa', emoji: '☄️', price: 0, income: 22, rebirth: 2 },
  { id: 'pulsar', name: 'Pulsar', emoji: '🛸', price: 0, income: 26, rebirth: 3 },
  { id: 'solaris', name: 'Solaris', emoji: '☀️', price: 0, income: 31, rebirth: 4 },
  { id: 'prisma', name: 'Prisma', emoji: '💠', price: 0, income: 38, rebirth: 5 }
];
const REBIRTH_TIERS = [
  { n: 1, name: 'Faísca', icon: 'fa-bolt', req: 2500, color: '#38bdf8', theme: 'nebula', title: 'Faísca Cósmica', pet: 'astro', blurb: 'A primeira ignição: poeira estelar vira combustível.' },
  { n: 2, name: 'Órbita', icon: 'fa-satellite', req: 5000, color: '#6366f1', theme: 'orbit', title: 'Comandante Orbital', pet: 'cometa', blurb: 'A nave encontra a órbita certa e ganha velocidade.' },
  { n: 3, name: 'Quasar', icon: 'fa-circle-nodes', req: 9000, color: '#a3e635', theme: 'quasar', title: 'Viajante Quasar', pet: 'pulsar', blurb: 'Jatos de energia atravessam o cockpit de estudos.' },
  { n: 4, name: 'Supernova', icon: 'fa-sun', req: 15000, color: '#fbbf24', theme: 'supernova', title: 'Explorador Estelar', pet: 'solaris', blurb: 'Uma estrela inteira se acende atrás da sua cadeira.' },
  { n: 5, name: 'Singularidade', icon: 'fa-atom', req: 24000, color: '#e879f9', theme: 'singularity', title: 'Lenda do Cosmos', pet: 'prisma', blurb: 'O horizonte de eventos coroa a última viagem.' }
];
const REBIRTH_TITLES = REBIRTH_TIERS.map((r) => ({ title: r.title, xp: 0, rebirth: r.n, icon: r.icon }));
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
  { days: 100, mult: 2, name: 'Imortal', icon: 'fa-fire-flame-simple' },
  { days: 60, mult: 1.7, name: 'Fênix', icon: 'fa-fire-flame-curved' },
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
function xpBoostMult() {
  return state.boosts && Number(state.boosts.xpUntil) > Date.now() ? 2 : 1;
}
function coinBoostMult() {
  return state.boosts && Number(state.boosts.coinUntil) > Date.now() ? 1.5 : 1;
}
function rebirthMultiplier() { return 1 + (Number(state.rebirths) || 0) * 0.3; }
function xpMultiplier() { return streakTier().mult * xpBoostMult() * rebirthMultiplier(); }
function addXp(n, silent) {
  if (!n) return 0;
  const raw = Math.round(n);
  const mult = raw > 0 ? xpMultiplier() : 1;
  const gain = raw > 0 ? Math.max(1, Math.round(raw * mult)) : raw;
  const before = levelInfo(state.xp).cur.title;
  state.xp = Math.max(0, state.xp + gain);
  if (gain > 0) state.xpEarned = (state.xpEarned || 0) + gain;
  const after = levelInfo(state.xp).cur.title;
  if (after !== before) {
    if (!state.title || state.title === before) state.title = after;
    const lvl = LEVELS.findIndex((l) => l.title === after);
    let bonus = 15 + Math.max(0, lvl) * 10;
    let extra = '';
    if (lvl > 0 && lvl % 3 === 0 && (state.streakShields || 0) < 5) {
      state.streakShields = (state.streakShields || 0) + 1;
      extra = ' + 1 escudo de sequência';
    }
    state.coins += bonus;
    state.coinsEarned = (state.coinsEarned || 0) + bonus;
    if (!silent) toast('Novo nível: ' + after + '! +' + bonus + ' moedas' + extra + '.', 'fa-arrow-up');
    renderTitles();
    renderJourney();
  }
  if (gain > 0) popGain('#xpPop', '+' + gain + (mult > 1.01 ? ' · x' + String(Math.round(mult * 100) / 100).replace('.', ',') : ''));
  renderTopbar();
  if (state.currentTab === 'hoje') renderHoje();
  if (state.currentTab === 'rebirth') renderRebirth();
  save();
  return gain;
}
function addCoins(n) {
  if (!n) return;
  const factor = coinBoostMult() * rebirthMultiplier();
  const bonus = n > 0 ? Math.round(n * (factor - 1)) : 0;
  const total = n + bonus;
  state.coins = Math.max(0, state.coins + total);
  if (total > 0) state.coinsEarned = (state.coinsEarned || 0) + total;
  if (total > 0) popGain('#coinPop', '+' + money(total) + (bonus > 0 ? ' · boost' : ''));
  renderTopbar();
  if (state.currentTab === 'store') renderStore();
  if (state.currentTab === 'pets') renderPets();
  if (state.currentTab === 'rebirth') renderRebirth();
  save();
}
function addFocus(minutes, subject) {
  minutes = Math.max(0, Math.round(minutes));
  if (!minutes) return;
  const k = dateKey();
  state.focusByDate[k] = (state.focusByDate[k] || 0) + minutes;
  if (subject) state.subjectMinutes[subject] = (state.subjectMinutes[subject] || 0) + minutes;
  state.sessions += 1;
  dailyBump('sessions', 1);
  state.subjectLog.unshift({ subject: subject || 'Geral', minutes: minutes, at: Date.now() });
  state.subjectLog = state.subjectLog.slice(0, 24);
  if (state.pet) {
    state.petEnergy[state.pet] = clamp((state.petEnergy[state.pet] || 0) + 2, 0, 100);
    state.petXp[state.pet] = (state.petXp[state.pet] || 0) + minutes;
  }
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
  if (typeof renderV23Tab === 'function') { try { renderV23Tab(id); } catch (e) { console.error('Erro na aba v23 ' + id, e); } }
  if (id === 'geekie') loadIframe('geekieIframe', 'iframeLoading');
  if (id === 'google') loadIframe('googleIframe', null);
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
  if (typeof renderV23Hoje === 'function') renderV23Hoje();
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
  { id: 'focus90', label: 'Estudar 90 minutos', icon: 'fa-hourglass-end', goal: 90, unit: 'min', xp: 45, coins: 14, value: () => Math.floor(todayFocusLive()) },
  { id: 'cards20', label: 'Revisar 20 flashcards', icon: 'fa-layer-group', goal: 20, unit: 'cards', xp: 28, coins: 9, value: () => state.dailyStats.cards || 0 },
  { id: 'quiz5', label: 'Acertar 5 questões do quiz', icon: 'fa-bullseye', goal: 5, unit: 'acertos', xp: 25, coins: 8, value: () => state.dailyStats.quiz || 0 },
  { id: 'sessions3', label: 'Concluir 3 sessões de foco', icon: 'fa-stopwatch', goal: 3, unit: 'sessões', xp: 20, coins: 7, value: () => state.dailyStats.sessions || 0 },
  { id: 'exchange1', label: 'Trocar energia por moedas', icon: 'fa-right-left', goal: 1, unit: 'troca', xp: 12, coins: 4, value: () => state.dailyStats.exchanges || 0 },
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
/* Contadores da semana (segunda a domingo), usados pelas missões semanais. */
function weekStartKey(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return dateKey(x);
}
function ensureWeeklyStats() {
  const wk = weekStartKey();
  if (!state.weeklyStats || state.weeklyStats.week !== wk) {
    state.weeklyStats = Object.assign({}, DEFAULT_STATE.weeklyStats, { week: wk });
  }
}
function dailyBump(key, n = 1) {
  ensureDailyStats();
  state.dailyStats[key] = (state.dailyStats[key] || 0) + n;
  ensureWeeklyStats();
  const weekKeyName = key === 'checkin' ? 'checkins' : key;
  if (typeof state.weeklyStats[weekKeyName] === 'number') state.weeklyStats[weekKeyName] += n;
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
    const cycleTarget = clamp(Number(state.pomoConfig.cycles) || 4, 2, 8);
    state.pomoCycle = state.pomoCycle >= cycleTarget ? 1 : state.pomoCycle + 1;
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
  const lg = $('#pomoCustomLong'); if (lg) lg.value = cfg.long;
  const cy = $('#pomoCustomCycles'); if (cy) cy.value = cfg.cycles || 4;
  const xpPrev = $('#pomoXpPreview');
  if (xpPrev) {
    const mins = pomo.mode === 'focus' ? Math.round(pomo.total / 60) : cfg.focus;
    const base = mins * 2 + (mins >= 25 ? 6 : 0);
    const xpTotal = Math.max(1, Math.round(base * xpMultiplier()));
    xpPrev.innerHTML = '<i class="fa-solid fa-star"></i> Sessão de ' + mins + ' min ≈ <b>' + xpTotal + ' XP</b> · ' + Math.max(1, Math.round(mins / 10)) + ' moedas · foguinho x' + streakTier().mult + (xpBoostMult() > 1 ? ' + boost x2' : '');
  }
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
    if (preset === '60') { state.pomoConfig.focus = 60; state.pomoConfig.short = 10; }
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
  $('#pomoCustomLong') && $('#pomoCustomLong').addEventListener('change', (e) => {
    state.pomoConfig.long = clamp(Number(e.target.value) || 15, 5, 45); save(); renderTimer();
  });
  $('#pomoCustomCycles') && $('#pomoCustomCycles').addEventListener('change', (e) => {
    state.pomoConfig.cycles = clamp(Number(e.target.value) || 4, 2, 8); save(); renderTimer();
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
function isFav(kind, id) { return !!(state.favs && Array.isArray(state.favs[kind]) && state.favs[kind].includes(String(id))); }
function toggleFav(kind, id) {
  id = String(id);
  if (!state.favs[kind]) state.favs[kind] = [];
  const i = state.favs[kind].indexOf(id);
  if (i === -1) state.favs[kind].push(id); else state.favs[kind].splice(i, 1);
  save();
  return i === -1;
}
function favButton(kind, id, label) {
  const on = isFav(kind, id);
  return '<button class="fav-btn' + (on ? ' on' : '') + '" type="button" data-fav-kind="' + kind + '" data-fav-id="' + esc(id) + '" aria-pressed="' + on + '" title="' + (on ? 'Remover dos favoritos' : 'Favoritar') + ' ' + esc(label || '') + '" aria-label="' + (on ? 'Remover dos favoritos' : 'Favoritar') + ' ' + esc(label || '') + '"><i class="fa-' + (on ? 'solid' : 'regular') + ' fa-heart"></i></button>';
}
function themeLocked(t) { return Number(t.rebirth || 0) > Number(state.rebirths || 0); }
function renderStore() {
  const grid = $('#themeGrid');
  if (!grid) return;
  const favOnly = storeFilter === 'fav';
  const list = THEMES.filter((t) => {
    if (favOnly) return isFav('themes', t.id);
    if (storeFilter === 'owned') return state.themesOwned.includes(t.id);
    if (storeFilter === 'locked') return !state.themesOwned.includes(t.id);
    return true;
  });
  grid.innerHTML = list.map((t) => {
    const owned = state.themesOwned.includes(t.id);
    const equipped = state.theme === t.id;
    const locked = themeLocked(t);
    return '<div class="theme-card' + (equipped ? ' equipped' : '') + (locked ? ' locked' : '') + (isFav('themes', t.id) ? ' is-fav' : '') + '" data-theme-card="' + t.id + '">' +
      '<div class="theme-preview" data-preview="' + (locked ? '' : t.id) + '" style="--t-a:' + t.a + ';--t-b:' + t.b + '">' +
        '<span class="tp-name">' + esc(t.name) + '</span>' +
        '<span class="tp-chart" aria-hidden="true">' + [38, 62, 48, 84, 70, 92].map((h) => '<i style="height:' + h + '%"></i>').join('') + '</span>' +
        '<span class="tp-wall">wallpaper</span>' +
      '</div>' +
      '<div class="theme-name">' + esc(t.name) + (equipped ? ' <i class="fa-solid fa-circle-check" style="color:var(--primary)"></i>' : '') + favButton('themes', t.id, t.name) + '</div>' +
      '<div class="theme-meta"><span>' + (locked ? '<span class="theme-price"><i class="fa-solid fa-rocket"></i> Rebirth ' + t.rebirth + '</span>' : owned ? 'adquirido · wallpaper' : '<span class="theme-price"><i class="fa-solid fa-coins"></i> ' + t.price + '</span>') + '</span></div>' +
      '<button class="btn ' + (owned ? (equipped ? 'btn-secondary' : 'btn-primary') : 'btn-secondary') + ' btn-sm" type="button" data-theme-id="' + t.id + '"' + (equipped || locked ? ' disabled' : '') + '>' +
      (locked ? 'bloqueado' : owned ? (equipped ? 'em uso' : 'equipar') : 'comprar') + '</button></div>';
  }).join('') || '<div class="empty">Nada nesse filtro' + (favOnly ? ' — toque no coração de um tema.' : '.') + '</div>';
  const favCountEl = $('#storeFavCount'); if (favCountEl) favCountEl.textContent = favCount('themes');
}
function buyOrEquipTheme(id) {
  const t = THEMES.find((x) => x.id === id);
  if (!t) return;
  if (themeLocked(t)) return toast('Tema exclusivo do Rebirth ' + t.rebirth + '.', 'fa-rocket', true);
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
    if (e.target.closest('[data-fav-kind]')) return;
    const b = e.target.closest('[data-theme-id]');
    if (b) buyOrEquipTheme(b.dataset.themeId);
  });
  $('#themeGrid') && $('#themeGrid').addEventListener('mouseover', (e) => {
    const p = e.target.closest('[data-preview]');
    if (p && p.dataset.preview) document.documentElement.setAttribute('data-theme', p.dataset.preview);
  });
  $('#themeGrid') && $('#themeGrid').addEventListener('mouseout', (e) => {
    if (e.target.closest('[data-preview]')) document.documentElement.setAttribute('data-theme', state.theme);
  });
}

/* ============ 20. TÍTULOS ============ */
let titleFilter = 'all';
function titlePool() {
  return LEVELS.map((l) => ({ title: l.title, xp: l.xp, source: 'xp' }))
    .concat(REBIRTH_TITLES.map((r) => ({ title: r.title, xp: r.xp, source: 'rebirth', rebirth: r.rebirth, icon: r.icon })));
}
function renderTitles() {
  const grid = $('#titleGrid');
  if (!grid) return;
  const pool = titlePool().filter((l) => titleFilter === 'fav' ? isFav('titles', l.title) : titleFilter === 'rebirth' ? l.source === 'rebirth' : true);
  grid.innerHTML = pool.map((l) => {
    const unlocked = l.source === 'rebirth' ? Number(state.rebirths || 0) >= l.rebirth : state.xp >= l.xp;
    const equipped = state.title === l.title;
    return '<div class="title-card' + (unlocked ? '' : ' locked') + (equipped ? ' equipped' : '') + (l.source === 'rebirth' ? ' rebirth' : '') + (isFav('titles', l.title) ? ' is-fav' : '') + '" data-title-card="' + esc(l.title) + '">' +
      '<span class="title-name">' + (l.source === 'rebirth' ? '<i class="fa-solid ' + (l.icon || 'fa-rocket') + '"></i> ' : '') + esc(l.title) + favButton('titles', l.title, l.title) + '</span>' +
      '<span class="title-meta">' + (l.source === 'rebirth' ? 'Rebirth ' + l.rebirth + (unlocked ? ' · exclusivo desbloqueado' : ' · bloqueado') : l.xp + ' XP' + (unlocked ? '' : ' · faltam ' + (l.xp - state.xp))) + '</span>' +
      '<button class="btn btn-sm ' + (equipped ? 'btn-secondary' : 'btn-primary') + '" type="button" data-title="' + esc(l.title) + '"' + (unlocked && !equipped ? '' : ' disabled') + '>' + (equipped ? 'equipado' : unlocked ? 'equipar' : 'bloqueado') + '</button></div>';
  }).join('') || '<div class="empty">Nenhum título nesse filtro.</div>';
  const favCountEl = $('#titleFavCount'); if (favCountEl) favCountEl.textContent = favCount('titles');
  const info = levelInfo(state.xp);
  const next = $('#titleNext');
  if (next) next.textContent = info.next ? 'Próximo em ' + Math.max(0, info.next.xp - state.xp) + ' XP' : 'Nível máximo';
}
function bindTitles() {
  renderTitles();
  $('#titleFilters') && $('#titleFilters').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    titleFilter = chip.dataset.filter;
    $$('#titleFilters .chip').forEach((c) => c.classList.toggle('active', c === chip));
    renderTitles();
  });
  $('#titleGrid') && $('#titleGrid').addEventListener('click', (e) => {
    if (e.target.closest('[data-fav-kind]')) return;
    const b = e.target.closest('[data-title]');
    if (!b) return;
    state.title = b.dataset.title;
    save(); renderTitles(); renderTopbar(); toast('Título equipado: ' + b.dataset.title, 'fa-crown');
  });
}

/* ============ 21. PETS ============ */
function petLevel(id) {
  const xp = Number((state.petXp || {})[id]) || 0;
  return 1 + Math.min(9, Math.floor(xp / 60));
}
function petIncome() {
  const p = PETS.find((x) => x.id === state.pet);
  if (!p) return 0;
  return Math.round(p.income * (1 + (petLevel(p.id) - 1) * 0.15));
}
function petLocked(p) { return Number(p.rebirth || 0) > Number(state.rebirths || 0); }
function renderPets() {
  const grid = $('#petGrid');
  if (!grid) return;
  const list = PETS.filter((p) => petFilter === 'fav' ? isFav('pets', p.id) : petFilter === 'owned' ? state.petsOwned.includes(p.id) : true);
  grid.innerHTML = list.map((p) => {
    const owned = state.petsOwned.includes(p.id);
    const active = state.pet === p.id;
    const energy = state.petEnergy[p.id] || 0;
    const locked = petLocked(p);
    return '<div class="pet-card' + (active ? ' active' : '') + (locked ? ' locked' : '') + (isFav('pets', p.id) ? ' is-fav' : '') + '" data-pet-card="' + p.id + '">' +
      favButton('pets', p.id, p.name) +
      '<span class="pet-emoji">' + p.emoji + '</span><span class="pet-name">' + esc(p.name) + '</span>' +
      '<span class="pet-meta">' + (locked ? '<i class="fa-solid fa-rocket"></i> Rebirth ' + p.rebirth : Math.round(p.income * (1 + (petLevel(p.id) - 1) * 0.15) * rebirthMultiplier()) + ' moedas/tick · nível ' + petLevel(p.id)) + '</span>' +
      '<div class="pet-energy"><span style="width:' + clamp(energy, 0, 100) + '%"></span></div>' +
      '<span class="pet-meta">energia ' + energy + '</span>' +
      '<button class="btn btn-sm ' + (owned ? (active ? 'btn-secondary' : 'btn-primary') : 'btn-secondary') + '" type="button" data-pet="' + p.id + '"' + (locked ? ' disabled' : '') + '>' +
      (locked ? 'bloqueado' : owned ? (active ? 'ativo' : 'equipar') : p.rebirth ? 'adotar' : '<i class="fa-solid fa-coins"></i> ' + p.price) + '</button>' +
      (owned ? '<button class="btn btn-ghost btn-sm" type="button" data-feed="' + p.id + '">alimentar 15</button>' : '') + '</div>';
  }).join('') || '<div class="empty">Nenhum pet nesse filtro.</div>';
  const favCountEl = $('#petFavCount'); if (favCountEl) favCountEl.textContent = favCount('pets');
  const sum = $('#petSummary');
  if (sum) {
    const p = PETS.find((x) => x.id === state.pet);
    sum.innerHTML = p ? '<span class="badge">' + p.emoji + ' ' + esc(p.name) + ' equipado</span><span class="badge">+' + petIncome() + ' moedas/5s</span><span class="badge">nível ' + petLevel(p.id) + '</span><span class="badge">energia ' + (state.petEnergy[p.id] || 0) + '</span>'
      : '<span class="badge danger">Nenhum pet equipado</span><span class="badge">renda zero</span>';
  }
}
function petAction(id) {
  const p = PETS.find((x) => x.id === id);
  if (!p) return;
  if (petLocked(p)) return toast('Pet exclusivo do Rebirth ' + p.rebirth + '.', 'fa-rocket', true);
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
let petFilter = 'all';
function feedPet(id) {
  if (state.coins < 15) return toast('Faltam moedas para alimentar.', 'fa-triangle-exclamation', true);
  state.coins -= 15;
  const beforeLevel = petLevel(id);
  state.petEnergy[id] = clamp((state.petEnergy[id] || 0) + 20, 0, 100);
  state.petXp[id] = (state.petXp[id] || 0) + 15;
  state.petFed[id] = Date.now();
  const afterLevel = petLevel(id);
  save(); renderPets(); renderTopbar();
  toast('Pet alimentado: +20 de energia.' + (afterLevel > beforeLevel ? ' Subiu para o nível ' + afterLevel + ' (+15% de renda).' : ''), 'fa-bowl-food');
}
function bindPets() {
  renderPets();
  $('#petFilters') && $('#petFilters').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    petFilter = chip.dataset.filter;
    $$('#petFilters .chip').forEach((c) => c.classList.toggle('active', c === chip));
    renderPets();
  });
  $('#petGrid') && $('#petGrid').addEventListener('click', (e) => {
    if (e.target.closest('[data-fav-kind]')) return;
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
  { id: 'prestige1', label: 'Primeiro prestígio do núcleo', type: 'prestige', goal: 1, coins: 60, xp: 50 },
  { id: 'chests7', label: '7 baús diários abertos', type: 'chests', goal: 7, coins: 40, xp: 30 },
  { id: 'weekly3', label: '3 missões semanais resgatadas', type: 'weekly', goal: 3, coins: 55, xp: 45 },
  { id: 'crits25', label: '25 críticos no núcleo', type: 'crits', goal: 25, coins: 50, xp: 40 },
  { id: 'talents3', label: '3 talentos de prestígio comprados', type: 'talents', goal: 3, coins: 70, xp: 55 },
  { id: 'boosts3', label: '3 boosts comprados na loja', type: 'boosts', goal: 3, coins: 35, xp: 30 }
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
  { id: 'shielded', label: 'Usou um escudo de sequência', icon: 'fa-shield-halved', check: () => (state.shieldsUsed || 0) >= 1 },
  { id: 'chest_first', label: 'Abriu o primeiro baú diário', icon: 'fa-gift', check: () => (state.chestsOpened || 0) > 0 },
  { id: 'weekly_first', label: 'Resgatou uma missão semanal', icon: 'fa-calendar-week', check: () => (state.weeklyClaims || []).length > 0 },
  { id: 'crit_master', label: '50 críticos no núcleo', icon: 'fa-bolt', check: () => (state.clicker.crits || 0) >= 50 },
  { id: 'talent_owner', label: 'Comprou um talento de prestígio', icon: 'fa-diagram-project', check: () => Object.values(state.clicker.talents || {}).reduce((a, b) => a + b, 0) > 0 },
  { id: 'immortal', label: 'Foguinho Imortal (100 dias)', icon: 'fa-fire-flame-simple', check: () => state.streakBest >= 100 },
  { id: 'boosted', label: 'Ativou um boost de XP ou moedas', icon: 'fa-flask', check: () => (state.boostsUsed || 0) > 0 }
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
  if (type === 'chests') return state.chestsOpened || 0;
  if (type === 'weekly') return (state.weeklyClaims || []).length;
  if (type === 'crits') return state.clicker.crits || 0;
  if (type === 'talents') return Object.values(state.clicker.talents || {}).reduce((a, b) => a + b, 0);
  if (type === 'boosts') return state.boostsBought || 0;
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
    return '<div class="milestone' + (claimed ? ' claimed' : ready ? ' claimable' : '') + '" data-milestone-card="' + m.id + '"><i class="fa-solid ' + (claimed ? 'fa-circle-check' : 'fa-flag') + '" style="color:var(--gold)"></i>' +
      '<div class="ms-main"><span>' + esc(m.label) + '</span><span class="ms-sub">' + Math.min(value, m.goal) + '/' + m.goal + ' · +' + m.coins + ' moedas +' + m.xp + ' XP</span></div>' +
      '<button class="btn btn-sm ' + (ready ? 'btn-primary' : 'btn-secondary') + '" type="button" data-milestone="' + m.id + '"' + (ready ? '' : ' disabled') + '>' + (claimed ? 'resgatado' : ready ? 'resgatar' : 'em curso') + '</button></div>';
  }).join('');
}
function renderAchievements() {
  const box = $('#achievementList');
  if (!box) return;
  box.innerHTML = ACHIEVEMENTS.map((a) => {
    const unlocked = !!a.check();
    return '<div class="ach-item ' + (unlocked ? 'unlocked' : 'locked') + '" data-ach-card="' + a.id + '"><i class="fa-solid ' + a.icon + '"></i><span>' + esc(a.label) + '</span>' + (unlocked ? '<i class="fa-solid fa-check" style="margin-left:auto;color:var(--primary)"></i>' : '') + '</div>';
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
  { id: 'servidor', name: 'Servidor local', base: 1500, rate: 45, click: 0, desc: '+45 ⚡/s' },
  { id: 'gpu', name: 'GPU dedicada', base: 3200, rate: 95, click: 4, desc: '+95 ⚡/s · +4 por clique' },
  { id: 'cluster', name: 'Cluster de estudos', base: 7200, rate: 210, click: 6, desc: '+210 ⚡/s · +6 por clique' },
  { id: 'ia', name: 'IA local', base: 15000, rate: 480, click: 12, desc: '+480 ⚡/s · +12 por clique' },
  { id: 'orbital', name: 'Data center orbital', base: 32000, rate: 1100, click: 20, desc: '+1.100 ⚡/s · +20 por clique' },
  { id: 'quantum', name: 'Núcleo quântico', base: 68000, rate: 2600, click: 45, desc: '+2.600 ⚡/s · +45 por clique' },
  { id: 'singularidade', name: 'Singularidade', base: 150000, rate: 6500, click: 100, desc: '+6.500 ⚡/s · +100 por clique' }
];
const CLICKER_EXCHANGES = [
  { energy: 50, coins: 5, label: '50 ⚡ → 5 moedas' },
  { energy: 500, coins: 60, label: '500 ⚡ → 60 moedas' },
  { energy: 2500, coins: 350, label: '2.500 ⚡ → 350 moedas' },
  { energy: 10000, coins: 1600, label: '10.000 ⚡ → 1.600 moedas' },
  { energy: 50000, coins: 9000, label: '50.000 ⚡ → 9.000 moedas' }
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
function goldMult() { return (state.clicker.goldUntil || 0) > Date.now() ? 5 : 1; }
function clickerRate() {
  const talent = 1 + talentLevel('rate') * 0.12;
  return Math.round(UPGRADES.reduce((acc, u) => acc + upgradeLevel(u.id) * u.rate, 0) * prestigeMult() * talent * goldMult());
}
function clickerPower() {
  const talent = 1 + talentLevel('click') * 0.12;
  return Math.round((1 + UPGRADES.reduce((acc, u) => acc + upgradeLevel(u.id) * u.click, 0)) * prestigeMult() * talent * goldMult());
}
function clickerCritChance() {
  const base = 0.04 + talentLevel('crit') * 0.02 + (state.clicker.prestige || 0) * 0.005;
  return clamp(Math.round(base * 1000) / 1000, 0, 0.5);
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
  let guard = 0;
  let converted = 0;
  while (guard++ < 40) {
    const tier = CLICKER_EXCHANGES.slice().reverse().find((t) => state.clicker.points >= t.energy);
    if (!tier) break;
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
    if (!document.hidden) renderClickerHud();
    scheduleClickerSave();
  }
}
function floatClickerGain(gain, e, crit) {
  if (state.motionReduced) return;
  const host = $('#clickerCore');
  if (!host) return;
  const r = host.getBoundingClientRect();
  const floats = host.querySelectorAll('.clicker-float');
  if (floats.length > 9) floats[0].remove();
  const span = document.createElement('span');
  span.className = 'clicker-float' + (crit ? ' crit' : '');
  span.textContent = (crit ? 'CRÍTICO +' : '+') + money(gain);
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
  const crit = Math.random() < clickerCritChance();
  let gain = Math.max(1, Math.round(clickerPower() * comboMult()));
  if (crit) {
    gain *= 6;
    state.clicker.crits = (state.clicker.crits || 0) + 1;
  }
  state.clicker.points += gain;
  state.clicker.total = (state.clicker.total || 0) + gain;
  state.clicker.lifetime = (state.clicker.lifetime || 0) + gain;
  state.clicker.clicks = (state.clicker.clicks || 0) + 1;
  dailyBump('clicks', 1);
  floatClickerGain(gain, e, crit);
  renderClickerHud();
  scheduleClickerSave();
  beep(crit ? 980 : 520 + Math.min(clickerCombo.count, 20) * 12, crit ? 0.09 : 0.04, crit ? 'sawtooth' : 'square', crit ? 0.06 : 0.035);
  if (state.currentTab === 'clicker' && typeof renderClickerExtras === 'function') renderClickerExtras();
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
  toast('Prestígio ' + state.clicker.prestige + '! +15% permanente e +1 núcleo para talentos.', 'fa-rotate');
  if (typeof renderClickerExtras === 'function') renderClickerExtras();
}
function offlineCapSeconds() { return clamp(600 + (state.clicker.prestige || 0) * 300, 600, 7200); }
function applyOfflineEnergy() {
  const now = Date.now();
  const last = Number(state.clicker.lastSeen) || 0;
  state.clicker.lastSeen = now;
  if (!last) return;
  const cap = offlineCapSeconds();
  const elapsed = clamp((now - last) / 1000, 0, cap);
  const rate = clickerRate();
  if (rate <= 0 || elapsed < 30) return;
  const gain = rate * elapsed;
  state.clicker.points += gain;
  state.clicker.total = (state.clicker.total || 0) + gain;
  state.clicker.lifetime = (state.clicker.lifetime || 0) + gain;
  setTimeout(() => toast('Núcleo rendeu ' + money(Math.floor(gain)) + ' ⚡ enquanto você estava fora (máx. ' + Math.round(cap / 60) + ' min).', 'fa-bolt'), 1200);
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
  { id: 'wind', name: 'Vento', icon: 'fa-wind', freq: 520, q: 1.4, type: 'bandpass' },
  { id: 'cafe', name: 'Café', icon: 'fa-mug-hot', freq: 320, q: 1.1, type: 'bandpass' }
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
      storm: { rain: 72, noise: 18, waves: 26, fire: 0, wind: 42 },
      forest: { rain: 12, noise: 30, waves: 0, fire: 0, wind: 38, cafe: 16 }
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
  retro: { freq: 980, type: 'square', dur: 0.028, vol: 0.04 },
  thock: { freq: 180, type: 'sine', dur: 0.06, vol: 0.08 },
  clicky: { freq: 1250, type: 'triangle', dur: 0.022, vol: 0.045 }
};
function playKeySound() {
  if (!state.keySounds.on) return;
  const s = KEY_STYLES[state.keySounds.style] || KEY_STYLES.soft;
  const scale = (state.keySounds.volume || 45) / 100;
  try {
    const ctx = fxAudioCtxGet();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = s.type;
    osc.frequency.value = s.freq + Math.random() * 40;
    gain.gain.value = s.vol * scale * 4;
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + s.dur);
    osc.stop(ctx.currentTime + s.dur);
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
  if (key === 'pi') { calc.expr += String(Math.PI); return calcRender(); }
  if (key === 'neg') { calc.expr = calc.expr ? '-(' + calc.expr + ')' : '-'; return calcRender(); }
  if (key === 'sqrt' || key === 'sqr') {
    try {
      const base = calc.expr ? calcEvaluate(calc.expr) : Number(calc.result) || 0;
      const value = key === 'sqrt' ? Math.sqrt(Math.max(0, base)) : base * base;
      calc.result = Math.round(value * 1e10) / 1e10;
      calc.expr = String(calc.result);
      calcRender();
    } catch (e) {
      toast('Nada para calcular ainda.', 'fa-triangle-exclamation', true);
    }
    return;
  }
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
  return     '<button class="char-btn' + (extraClass ? ' ' + extraClass : '') + (fav ? ' fav' : '') + '" type="button" data-char="' + esc(item.ch) + '" aria-label="' + esc(item.name + ' · ' + charCode(item.ch)) + '" data-char-name="' + esc(item.name) + '">' +
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
const FONTS = ['Poppins', 'Space Grotesk', 'Orbitron', 'Fira Code', 'Caveat', 'Patrick Hand', 'Georgia', 'Trebuchet MS', 'system-ui'];
const TITLE_ICONS = ['fa-graduation-cap', 'fa-book', 'fa-brain', 'fa-rocket', 'fa-fire', 'fa-star', 'fa-bolt', 'fa-heart', 'fa-leaf', 'fa-code', 'fa-atom', 'fa-flask', 'fa-calculator', 'fa-globe', 'fa-moon', 'fa-sun', 'fa-cat', 'fa-gamepad', 'fa-music', 'fa-cloud', 'fa-diamond', 'fa-robot'];
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
  /* Iframes só carregam quando a aba é aberta (switchTab), economizando
     duas conexões externas no boot do hub. */
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
  bau: { desc: 'Abre o baú diário (uma vez por dia)', run: () => openDailyChest() },
  semana: { desc: 'Lista as missões semanais e o progresso', run: () => weeklyMissionList().map((m) => {
    const v = Math.min(weeklyValue(m.key), m.goal);
    return (weeklyClaimed(m.id) ? '✔ ' : v >= m.goal ? '★ ' : '· ') + m.label + ' (' + v + '/' + m.goal + ') · +' + m.xp + ' XP e +' + m.coins + ' moedas';
  }).join('\n') },
  boost: { desc: 'Compra um boost: boost xp | boost moedas', run: (a) => {
    const kind = String(a || '').toLowerCase().startsWith('m') ? 'coin' : String(a || '').toLowerCase().startsWith('x') ? 'xp' : null;
    if (!kind) return 'Boosts ativos: ' + activeBoostsText() + '\nUse: boost xp (x2 XP por 15 min) ou boost moedas (+50% por 15 min).';
    return buyBoost(kind);
  } },
  critico: { desc: 'Mostra críticos, núcleo dourado e talentos do clicker', run: () => {
    const gold = (state.clicker.goldUntil || 0) > Date.now();
    return 'Chance de crítico: ' + Math.round(clickerCritChance() * 100) + '% (x6 energia) · críticos: ' + (state.clicker.crits || 0) +
      '\nNúcleo dourado: ' + (gold ? 'ATIVO (x5 produção)' : 'aguardando') + ' · talentos: ' + Object.values(state.clicker.talents || {}).reduce((a, b) => a + b, 0) + '/15' +
      '\nNúcleos livres: ' + clickerCores() + ' · prestígio: ' + (state.clicker.prestige || 0);
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
  { code: 'AURORA22', label: 'Aurora v22', coins: 120, xp: 100, theme: 'aurora', hint: 'Libera o tema Aurora', expires: '2027-03-31' },
  { code: 'BAU23', label: 'Baú v23', coins: 70, xp: 90, hint: 'Abra o baú e volte aqui', expires: '2027-12-31' },
  { code: 'SEMANA23', label: 'Semana v23', coins: 90, xp: 120, shield: 1, hint: 'Missões semanais + escudo', expires: '2027-12-31' },
  { code: 'IMORTAL23', label: 'Foguinho Imortal', coins: 150, xp: 200, theme: 'galaxy', hint: 'Libera o tema Galáxia', expires: '2027-06-30' },
  { code: 'NEXUS24', label: 'Nexus v24', coins: 180, xp: 240, shield: 1, hint: 'Estreia da central: moedas, XP e um escudo', expires: '2027-12-31' },
  { code: 'ORBITA24', label: 'Órbita de energia', coins: 200, xp: 180, energy: 5000, hint: '5.000 de energia para o núcleo', expires: '2027-12-31' },
  { code: 'SINGULAR24', label: 'Singularidade', coins: 260, xp: 320, theme: 'ember', hint: 'Libera o tema Brasa e um pacote grande', expires: '2027-12-31' },
  { code: 'MESTRE24', label: 'Mestre dos atalhos', coins: 300, xp: 400, shield: 1, hint: 'Pacote completo de XP, moedas e escudo', expires: '2027-12-31' },
  { code: 'SAKURA24', label: 'Sakura v24', coins: 150, xp: 220, theme: 'sakura', hint: 'Libera o tema Sakura', expires: '2027-12-31' },
  { code: 'ORION25', label: 'Órion v25', coins: 220, xp: 280, shield: 1, hint: 'Estreia da v25: moedas, XP e um escudo', expires: '2028-06-30' },
  { code: 'PULSO25', label: 'Pulso v25', coins: 240, xp: 220, energy: 8000, hint: '8.000 de energia para o núcleo', expires: '2028-06-30' },
  { code: 'HELIX25', label: 'Hélix v25', coins: 260, xp: 300, theme: 'ocean', hint: 'Libera o tema Oceano', expires: '2028-06-30' },
  { code: 'QUASAR25', label: 'Quasar v25', coins: 320, xp: 360, theme: 'candy', hint: 'Libera o tema Candy', expires: '2028-06-30' },
  { code: 'ECLIPSE25', label: 'Eclipse v25', coins: 400, xp: 480, shield: 2, hint: 'Pacote completo com dois escudos de sequência', expires: '2028-06-30' },
  { code: 'REBIRTH26', label: 'Renascimento v26', coins: 500, xp: 600, shield: 1, hint: 'Estreia do Rebirth: moedas, XP e um escudo', expires: '2028-12-31' },
  { code: 'FOGUETE26', label: 'Foguete v26', coins: 450, xp: 400, energy: 10000, hint: '10.000 de energia para o núcleo', expires: '2028-12-31' },
  { code: 'ORBITA26', label: 'Órbita v26', coins: 380, xp: 520, shield: 1, hint: 'Um empurrão orbital com escudo extra', expires: '2028-12-31' },
  { code: 'NEBULOSA26', label: 'Nebulosa v26', coins: 600, xp: 300, energy: 15000, hint: '15.000 de energia e moedas para a coleção', expires: '2028-12-31' },
  { code: 'APOGEU26', label: 'Apogeu v26', coins: 700, xp: 700, shield: 2, hint: 'Apogeu da campanha: o maior pacote público', expires: '2028-12-31' }
];
function rewardPool() { return REWARDS.concat(Array.isArray(state.customCodes) ? state.customCodes : []); }
function renderRewards() {
  const grid = $('#rewardGrid');
  if (grid) {
    grid.innerHTML = REWARDS.map((r) => {
      const used = state.redeemed.includes(r.code);
      const expired = r.expires < dateKey();
      return '<div class="reward-card' + (used ? ' used' : '') + (expired ? ' expired' : '') + '" data-reward-card="' + esc(r.code) + '">' +
        '<div class="reward-card-head"><span class="reward-code">' + r.code + '</span><span class="row reward-head-actions"><span class="badge ' + (used ? '' : expired ? 'danger' : 'gold') + '">' + (used ? 'resgatado' : expired ? 'expirado' : 'ativo') + '</span>' +
        '<button class="btn btn-icon btn-ghost btn-sm reward-copy" type="button" data-reward-copy="' + esc(r.code) + '" aria-label="Copiar código ' + esc(r.code) + '"><i class="fa-solid fa-copy"></i></button></span></div>' +
        '<p>' + esc(r.hint) + '</p>' +
        '<div class="reward-prize"><span><i class="fa-solid fa-coins" style="color:var(--coin)"></i> ' + r.coins + '</span><span><i class="fa-solid fa-star" style="color:var(--violet)"></i> ' + r.xp + ' XP</span>' + (r.theme ? '<span><i class="fa-solid fa-palette"></i> tema</span>' : '') + (r.shield ? '<span><i class="fa-solid fa-shield-halved"></i> ' + r.shield + ' escudo</span>' : '') + (r.energy ? '<span><i class="fa-solid fa-bolt" style="color:var(--gold)"></i> ' + money(r.energy) + ' ⚡</span>' : '') + '</div>' +
        '<span class="status-text">expira em ' + prettyDate(r.expires) + '</span></div>';
    }).join('');
  }
  const hist = $('#rewardHistory');
  if (hist) {
    hist.innerHTML = state.redeemed.length ? state.redeemed.map((code) => {
      const r = rewardPool().find((x) => x.code === code);
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
  const reward = rewardPool().find((r) => r.code === code && !r.hidden);
  if (!reward) return show('Código inválido.', false);
  if (state.redeemed.includes(code)) return show('Esse código já foi resgatado nesta conta.', false);
  if (reward.expires && reward.expires < dateKey()) return show('Esse código expirou em ' + prettyDate(reward.expires) + '.', false);
  state.redeemed.push(code);
  addCoins(reward.coins || 0);
  addXp(reward.xp || 0);
  if (reward.energy) {
    state.clicker.points = (state.clicker.points || 0) + Number(reward.energy);
    if (typeof renderClickerHud === 'function') renderClickerHud();
    if (typeof renderPrestige === 'function') renderPrestige();
  }
  if (reward.shield) state.streakShields = Math.min(5, (state.streakShields || 0) + reward.shield);
  if (reward.theme && !state.themesOwned.includes(reward.theme)) {
    state.themesOwned.push(reward.theme);
    applyTheme(reward.theme);
  }
  renderRewards(); renderStore(); save();
  return show('Código ' + code + ' resgatado: +' + (reward.coins || 0) + ' moedas, +' + (reward.xp || 0) + ' XP' + (reward.energy ? ', +' + money(reward.energy) + ' ⚡' : '') + (reward.theme ? ', tema liberado' : '') + (reward.shield ? ' e +' + reward.shield + ' escudo' : '') + '.', true);
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
    version: 'v26.0.0', date: '2026-11-26', type: 'feature', title: 'Rebirth: renascimento com foguete, reset e multiplicador permanente',
    items: [
      'Nova aba Rebirth com botão de renascimento, requisito de XP, progresso e histórico de cada viagem.',
      'Ao renascer, uma animação de foguete neon decola com constelação, partículas e nuvem de impulso, inspirada na arte de referência.',
      'O reset zera apenas XP e moedas: temas, pets, títulos, escudos, boosts, sequência, talentos e conquistas continuam intactos.',
      'Cada renascimento adiciona +30% permanente em XP e moedas, somado ao foguinho, aos boosts e aos talentos do núcleo.',
      'O XP máximo do renascimento atual é preservado no histórico e o multiplicador aparece na topbar e na aba.'
    ]
  },
  {
    version: 'v26.0.0', date: '2026-11-26', type: 'feature', title: 'Cinco ciclos cósmicos com temas, títulos e pets exclusivos',
    items: [
      'Faísca, Órbita, Quasar, Supernova e Singularidade formam a escada de renascimento, com requisitos de 2.500 a 24.000 XP.',
      'Cada ciclo libera um tema com wallpaper próprio: Nebulosa, Órbita, Quasar, Supernova e Singularidade.',
      'Cinco títulos exclusivos entram na aba Títulos com filtro Rebirth e só podem ser equipados depois do renascimento correspondente.',
      'Cinco pets exclusivos entram na coleção: Astro, Cometa, Pulsar, Solaris e Prisma, com renda maior que a dos pets comuns.',
      'Temas e pets de Rebirth ficam visíveis, mas bloqueados, até o renascimento certo — e nunca aparecem em códigos.'
    ]
  },
  {
    version: 'v26.0.0', date: '2026-11-26', type: 'feature', title: 'Favoritos e previews de item com muito mais informação',
    items: [
      'Coração em cada tema, pet e título, com filtro Favoritos nas três abas e estado salvo no navegador.',
      'O preview agora mostra wallpaper e paleta do tema, renda por hora e progresso de nível do pet, origem e requisito do título, além do estado de favorito.',
      'É possível favoritar direto do preview flutuante, sem fechar o cartão nem perder a posição.',
      'Temas de Rebirth exibem o ciclo necessário, e os cards ganharam mini gráfico com a paleta do tema.'
    ]
  },
  {
    version: 'v26.0.0', date: '2026-11-26', type: 'style', title: 'Wallpaper por tema e gráficos que seguem a paleta',
    items: [
      'Cada um dos dezesseis temas ganhou um wallpaper próprio, feito em camadas de gradiente: malha, chuva, dunas, estrelas, pétalas e horizonte de eventos.',
      'Os gráficos de foco, distribuição e mapa de constância agora usam as cores do tema equipado, com brilho, média e linha de meta.',
      'A aba Estatísticas ganhou um donut de distribuição por matéria e uma legenda com percentuais.',
      'Os cards da Loja mostram o wallpaper e um mini gráfico animado antes de você equipar o tema.'
    ]
  },
  {
    version: 'v26.0.0', date: '2026-11-26', type: 'feature', title: 'Cinco códigos novos: Renascimento, Foguete, Órbita, Nebulosa e Apogeu',
    items: [
      'REBIRTH26, FOGUETE26, ORBITA26, NEBULOSA26 e APOGEU26 entram no catálogo com moedas, XP, energia e escudos.',
      'Os códigos não liberam temas nem pets de Rebirth: esses continuam exclusivos de quem renasce.',
      'O catálogo público passa a ter 27 campanhas e o histórico de resgate continua por conta local.'
    ]
  },
  {
    version: 'v26.0.0', date: '2026-11-26', type: 'feature', title: 'Todas as abas ganharam uma segunda ação inteligente',
    items: [
      'O radar de cada aba agora traz uma segunda ação contextual, escolhida pelo estado real daquela página.',
      'Atalhos novos: Ctrl+Shift+R abre o Rebirth e Ctrl+Shift+F alterna o filtro de favoritos na aba de itens atual.',
      'A paleta de comandos ganhou rebirth, favoritos e wallpaper; o tutorial e as dicas das abas foram atualizados.',
      'A topbar mostra o multiplicador de Rebirth ao lado do foguinho, e todas as fontes de XP e moedas usam o novo bônus.'
    ]
  },
  {
    version: 'v25.0.0', date: '2026-11-23', type: 'feature', title: 'Previews animados de itens em toda a progressão',
    items: [
      'Loja, Pets, Títulos, Trilha e Recompensas ganharam um cartão flutuante ao passar o mouse (ou focar pelo teclado): tema com gradiente e brilho, pet com energia e renda, título com coroa e XP, marco com barra de progresso e campanha com prêmios.',
      'A abertura combina escala, desfoque e uma subida curta; ao deslizar para o item vizinho, o cartão troca o conteúdo com uma transição lateral suave em vez de reabrir.',
      'Cada preview tem animação própria: orbe do tema girando, pet quicando, brilho varrendo a coroa e preenchimento animado das barras de energia e progresso.',
      'O cartão se reposiciona para não sair da tela e fecha ao rolar, clicar, trocar de aba ou abrir a central; tudo respeita prefers-reduced-motion.'
    ]
  },
  {
    version: 'v25.0.0', date: '2026-11-23', type: 'feature', title: 'Cinco códigos novos: Órion, Pulso, Hélix, Quasar e Eclipse',
    items: [
      'ORION25, PULSO25, HELIX25, QUASAR25 e ECLIPSE25 entram no catálogo com moedas, XP, energia de núcleo, temas e escudos.',
      'Hélix libera o tema Oceano, Quasar libera o tema Candy e Eclipse entrega dois escudos de sequência.',
      'Cada código continua valendo uma vez por conta e aparece automaticamente na aba Recompensas e na central administrativa.'
    ]
  },
  {
    version: 'v25.0.0', date: '2026-11-23', type: 'feature', title: 'Radar ao vivo e ações inteligentes nas 28 abas',
    items: [
      'Cada aba recebeu uma linha de radar dentro do painel de ações rápidas, com um indicador atualizado ao entrar na aba: pendências, fila de revisão, precisão do quiz, carga da semana, comparativo de foco, coleção, renda dos pets, conquistas e mais.',
      'O radar traz um botão contextual que resolve a próxima tarefa: abrir a prioridade do dia, aplicar a sessão sugerida, concluir metas atrasadas, sortear o baralho, iniciar um quiz relâmpago, retomar a última matéria e duplicar a semana anterior.',
      'Também entram em lote: resgatar todos os marcos prontos, adotar o próximo pet, comprar o próximo tema acessível, equipar o melhor título liberado, executar a melhor troca do núcleo e aplicar o preset de foco.',
      'Os indicadores são recalculados ao trocar de aba, depois de cada ação e a cada 20 segundos, sem recarregar a página.'
    ]
  },
  {
    version: 'v25.0.0', date: '2026-11-23', type: 'feature', title: 'Melhorias de fluxo: metas, marcos, planner, loja, pets e núcleo',
    items: [
      'Metas atrasadas podem ser concluídas em lote com um clique, creditando XP e moedas de cada uma e atualizando o progresso do dia.',
      'A Trilha resgata todos os marcos prontos de uma vez; o Planner duplica a semana anterior apenas nos blocos vazios; a Loja e os Pets compram o próximo item acessível.',
      'O Clicker executa a melhor faixa de troca disponível, o Quiz inicia um relâmpago de 3 perguntas e o Timer de matérias retoma a última sessão registrada.',
      'Recompensas, calculadora, caracteres, portais, eventos e Dev Log ganharam atalhos diretos no radar da própria aba.'
    ]
  },
  {
    version: 'v25.0.0', date: '2026-11-23', type: 'style', title: 'Interface v25: cartões de item, radar pulsante e movimento',
    items: [
      'Os previews usam vidro, gradientes por tipo de item e uma borda que acende na cor do assunto; o radar tem pulso luminoso e tipografia monoespaçada nos números.',
      'A troca entre itens vizinhos anima na direção do movimento, sem piscar, e as barras de energia e progresso crescem a partir da esquerda.',
      'Responsivo: o cartão encolhe em telas pequenas, o radar quebra em duas linhas e os botões continuam com alvo de toque confortável.',
      'Tudo desliga com o modo de animações reduzidas do hub e com prefers-reduced-motion.'
    ]
  },
  {
    version: 'v24.0.0', date: '2026-11-19', type: 'feature', title: 'Central administrativa NEXUS com acesso restrito',
    items: [
      'Nova central flutuante e centralizada que abre com Ctrl+Shift+S somente depois do código de acesso correto digitado no campo de códigos.',
      'O código é validado por hash com sal: o texto puro não fica escrito no HTML, no CSS nem no JavaScript, e o desbloqueio vale apenas para a sessão do navegador.',
      'Ao abrir, o resto do hub recebe blur, fica inerte e o foco vai para a central; Esc, o botão de fechar e o de bloquear devolvem a navegação normal, enquanto Tab fica preso aos controles da central.',
      'Oito seções (visão geral, economia, progresso, códigos, backup, segurança, ferramentas e auditoria) em uma segunda nav bar recolhível só com ícones.',
      'A animação de abertura usa perspectiva, clip-path e uma varredura vertical própria — parecida com a do Dev Log, mas não igual.'
    ]
  },
  {
    version: 'v24.0.0', date: '2026-11-19', type: 'feature', title: 'Cinco códigos novos e códigos personalizados',
    items: [
      'NEXUS24, ORBITA24, SINGULAR24, MESTRE24 e SAKURA24 chegam ao catálogo, com moedas, XP, escudos, energia do clicker e temas.',
      'O campo de códigos ganhou botão de copiar em cada campanha e o resgate passou a aceitar energia de núcleo.',
      'A central pode criar códigos personalizados com validade, recompensa e tema; eles não aparecem no catálogo público e podem ser removidos a qualquer momento.',
      'Cada código continua valendo uma vez por conta, com data de expiração conferida no fuso local.'
    ]
  },
  {
    version: 'v24.0.0', date: '2026-11-19', type: 'feature', title: 'Preview flutuante ao passar o mouse nos caracteres',
    items: [
      'Qualquer caractere da aba Caracteres (grade, recentes ou favoritos) abre um cartão flutuante com glifo grande, nome, categoria, código Unicode e favorito.',
      'A abertura tem animação de escala e desfoque; ao deslizar para o caractere ao lado, o cartão acompanha o cursor e troca o conteúdo com uma transição suave.',
      'Teclado também funciona: focar um caractere com Tab abre o mesmo preview, e o cartão fecha ao rolar, clicar, trocar de aba ou abrir a central.'
    ]
  },
  {
    version: 'v24.0.0', date: '2026-11-19', type: 'feature', title: 'Ações rápidas e melhorias em todas as 28 abas',
    items: [
      'Cada aba recebeu uma barra de ações rápidas: resumo do dia, foco de 5/10/50 min, exportação de metas/notas/Dev Log, reset do baralho, limpeza do chat, tema e título aleatórios, alimentar todos os pets e mais.',
      'Pomodoro ganhou atalho de Espaço na aba, o título da página ganhou prévia ao vivo, os portais lembram o zoom e o campo de caracteres ganhou o preview flutuante.',
      'Recompensas mostram cópia rápida, energia de núcleo e os cinco códigos v24; o resumo do Dev Log ganhou botões de copiar e exportar.',
      'Os painéis v23 continuam funcionando sobre os mesmos dados, sem migração destrutiva e sem perder progresso.'
    ]
  },
  {
    version: 'v24.0.0', date: '2026-11-19', type: 'style', title: 'Interface da v24: central, nav dupla, preview e blur',
    items: [
      'A central NEXUS tem shell de vidro, grade sutil, varredura de abertura, navegação com cascata e estado ativo próprio.',
      'A nav bar administrativa recolhe para 72 px e anima rótulos e ícones sem tocar na nav bar principal; as duas mantêm estados independentes (Ctrl+B só afeta a normal).',
      'O blur do restante da página, a inércia do app e a armadilha de foco mantêm a central como única superfície interativa.',
      'Tudo respeita prefers-reduced-motion e o modo de animações reduzidas do hub.'
    ]
  },
  {
    version: 'v23.0.0', date: '2026-11-18', type: 'feature', title: 'Foguinho 3.0: baú diário, missões semanais e duas faixas novas',
    items: [
      'Baú diário na aba Hoje: uma abertura por dia com 18–130 moedas, 25–170 XP e 16% de chance de escudo; a recompensa cresce com a sequência.',
      'Três missões semanais determinísticas sorteadas de oito (foco, cards, quiz, metas, cliques, check-ins e sessões), com resgate de XP e moedas toda segunda-feira.',
      'Foguinho ganhou as faixas Fênix (60 dias, x1,7) e Imortal (100 dias, x2), somadas a x1,1/x1,2/x1,35/x1,5 já existentes.',
      'Níveis Ascendido (7.000 XP) e Lenda Eterna (9.000 XP); a cada três níveis o nível novo também entrega 1 escudo de sequência.',
      'Contadores semanais próprios (foco, cards, quiz, metas, cliques, sessões e check-ins) para alimentar as missões da semana.'
    ]
  },
  {
    version: 'v23.0.0', date: '2026-11-18', type: 'feature', title: 'Boosts de XP e moedas com pílulas na topbar',
    items: [
      'Dois consumíveis de 15 minutos na Loja: Poção de foco (x2 XP por 140 moedas) e Ímã de moedas (+50% moedas por 110 moedas).',
      'Comprar o mesmo boost de novo estende o tempo restante em vez de desperdiçar a compra anterior.',
      'O XP e as moedas passaram por um multiplicador central: foguinho e boost se somam, e o pop de ganho mostra o multiplicador aplicado.',
      'Pílulas na topbar mostram os boosts ativos e os minutos restantes; somem sozinhas quando o tempo acaba.',
      'Comando novo: boost xp | boost moedas, e três conquistas novas ligadas a baú, missões semanais e boosts.'
    ]
  },
  {
    version: 'v23.0.0', date: '2026-11-18', type: 'feature', title: 'Clicker 3.0: críticos, núcleo dourado, talentos e seis melhorias',
    items: [
      'Doze melhorias no total: GPU dedicada, cluster de estudos, IA local, data center orbital, núcleo quântico e singularidade chegam ao núcleo.',
      'Críticos: 4% base (até 50% com talentos e prestígio) multiplicam a energia do clique por 6, com número flutuante e som próprios.',
      'Núcleo dourado aparece na órbita do núcleo por até 40s e, ao ser coletado, dá x5 de produção por 20s e +15 a +60 moedas.',
      'Talentos de prestígio: Punho quântico (+12% clique), Rede neural (+12%/s) e Sorte carregada (+2% crítico), cinco níveis cada, pagos com núcleos.',
      'Cinco marcos de energia gerada (1k a 10M) com moedas, XP e escudo; cinco faixas de troca, incluindo 10.000→1.600 e 50.000→9.000.',
      'Renda offline de 10 minutos + 5 por prestígio (até 2h), auto-troca sempre na melhor faixa disponível e números flutuantes limitados a 10.'
    ]
  },
  {
    version: 'v23.0.0', date: '2026-11-18', type: 'feature', title: 'Novas features de estudo em todas as abas',
    items: [
      'Hoje: baú diário, missões semanais e pulso do ciclo; Pomodoro com pausa longa e ciclos configuráveis, preset 60/10 e prévia de XP da sessão.',
      'Metas com resumo (abertas, atrasadas, prioridade alta, feitas hoje) e botão para limpar concluídas sem perder XP.',
      'Flashcards com importação em lote (Pergunta | Resposta por linha) e exportação do baralho em CSV com intervalo e próxima revisão.',
      'Quiz com precisão geral e por matéria nos últimos 20 quizzes e resposta pelas teclas 1–4; Timer matérias com histórico das últimas sessões.',
      'Planner com carga da semana e exportação .md; Estatísticas com média, melhor dia, constância, projeção mensal e um insight automático.',
      'Diário com dias seguidos, humor positivo e distribuição dos últimos 30 dias; Chat com filtro de mensagens; Notas com estatísticas de escrita.',
      'Comandos novos (bau, semana, boost, critico), três códigos v23 e zoom nos portais Geekie e Google.'
    ]
  },
  {
    version: 'v23.0.0', date: '2026-11-18', type: 'feature', title: 'Mais ferramentas: pets, ambiente, teclado, calculadora, chars e senhas',
    items: [
      'Pets ganharam nível: 60 XP por nível (alimentar dá 15, cada sessão dá os minutos) e +15% de renda por nível, até o nível 10.',
      'Dois pets novos: Fênix (520 moedas, 9/tick) e Corvo sábio (760 moedas, 13/tick).',
      'Sons ambiente com a camada Café e o preset Floresta; som de teclado com os estilos Thock e Clicky.',
      'Calculadora com √, x², π e ±; Caracteres com contagem de visíveis e botão para copiar todos de uma vez.',
      'Senhas com modo PIN (só números) e botão para limpar o histórico da sessão; Título da página com mais fontes e ícones disponíveis.'
    ]
  },
  {
    version: 'v23.0.0', date: '2026-11-18', type: 'fix', title: 'Desempenho: áudio único, iframes sob demanda e render sob assinatura',
    items: [
      'Um único AudioContext reaproveitado por beeps e sons de teclado — antes cada clique/tecla criava um contexto novo e podia estourar o limite do navegador.',
      'Iframes do Geekie e do Google só carregam quando a aba é aberta, tirando duas conexões externas do boot.',
      'HUD do clicker não redesenha com a aba oculta; talentos e marcos só reconstroem o DOM quando a assinatura muda (nível, núcleo ou resgate).',
      'Pílulas de boost, pulso do Pomodoro e listas v23 usam comparação de assinatura e textContent em vez de reescrever HTML em todo tick.',
      'Números flutuantes do núcleo limitados a 10 elementos e o clique usa um AudioContext compartilhado com volume menor.'
    ]
  },
  {
    version: 'v23.0.0', date: '2026-11-18', type: 'style', title: 'Interface da v23: baú, talentos, dourado e cartões de insight',
    items: [
      'O baú diário abre com halo e giro do ícone, mostra o loot já recebido e usa a cor do tema no botão.',
      'Núcleo dourado aparece como um botão orbitando o núcleo, com aura pulsante e contagem de segundos do boost.',
      'Talentos com cinco pips por linha, marcos do núcleo com estado pronto e pílulas de boost compactas na topbar.',
      'Cartões de insight usam mini estatísticas em grade, barras finas e destaque vermelho para metas atrasadas.',
      'Tudo respeita Reduzir animações e prefers-reduced-motion, com layout de uma coluna no mobile.'
    ]
  },
  {
    version: 'v22.3.0', date: '2026-11-17', type: 'feature', title: 'Atalho Ctrl+B para recolher e expandir a nav bar',
    items: [
      'Ctrl+B (Cmd+B no Mac) alterna a nav bar compacta de qualquer aba, com o mesmo anel expansivo e giro elástico do clique.',
      'O atalho segue o padrão dos editores de código: funciona até com um campo de texto em foco e convive com Ctrl+K, Ctrl+Shift+D e Alt+Z.',
      'O tooltip do botão passou a mostrar a combinação: Compactar menu lateral (só ícones) · Ctrl+B e Expandir menu lateral · Ctrl+B.',
      'A preferência segue salva em navCollapsed e volta como estava ao reabrir o hub; no mobile o menu continua sendo a gaveta.'
    ]
  },
  {
    version: 'v22.3.0', date: '2026-11-17', type: 'style', title: 'Dev Log, atalho e README atualizados para a v22.3.0',
    items: [
      'Duas entradas novas no Dev Log documentam o atalho; o painel Ctrl+Shift+D passa a exibi-las entre as três últimas.',
      'Toasts do botão de compactar citam o Ctrl+B e o texto de apoio da aba Dev Log explica o novo atalho.',
      'README com seção da v22.3.0, linha nova na tabela de atalhos e histórico atualizado.',
      'Título da página, badges e o cartão de novidades sobem para a v22.3.0.'
    ]
  },
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
    version: 'v22.2.0', date: '2026-11-17', type: 'feature', title: 'Nav bar compacta mostrando só os ícones das abas',
    items: [
      'O botão de compactar não esconde mais o menu: a nav bar encolhe para uma faixa de 76 px com apenas o ícone de cada aba.',
      'Com o menu compacto, o nome da aba aparece no tooltip e a aba ativa mantém a barra lateral e o destaque.',
      'Campo de busca, títulos de grupo, textos dos atalhos e a versão ficam ocultos na faixa compacta; os grupos são separados por uma linha fina.',
      'A preferência continua em navCollapsed e volta assim ao reabrir o hub; no mobile segue a gaveta do hambúrguer.'
    ]
  },
  {
    version: 'v22.2.0', date: '2026-11-17', type: 'style', title: 'Botão de compactar ao lado do logo e atalho adaptado',
    items: [
      'O botão saiu da topbar e foi para o cabeçalho da nav bar, ao lado do logo; na faixa compacta fica empilhado abaixo dele.',
      'A largura da nav bar anima em 340 ms enquanto o botão faz giro elástico com anel expansivo, sem empurrar o conteúdo.',
      'O atalho Ctrl+Shift+D continua fixo no rodapé da nav bar: compacto, vira um ícone com tooltip e abre o mesmo painel das 3 últimas.',
      'title, aria-label e aria-pressed alternam entre Compactar e Expandir; tudo respeita Reduzir animações.'
    ]
  },
  {
    version: 'v22.1.0', date: '2026-11-17', type: 'style', title: 'Painel centralizado com blur e entrada animada',
    items: [
      'O painel das últimas atualizações abre centralizado e flutuante, com blur de 22px no resto da tela.',
      'Abertura animada: o cartão entra com mola e desfoque, um brilho atravessa o cabeçalho e as entradas surgem em cascata de 80 ms.',
      'O ícone do cabeçalho gira ao aparecer e o cartão ganha borda e halo na cor do tema.',
      'Tudo respeita Reduzir animações e prefers-reduced-motion.'
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
    const label = collapsed ? 'Expandir menu lateral · Ctrl+B' : 'Compactar menu lateral (só ícones) · Ctrl+B';
    btn.setAttribute('aria-pressed', String(collapsed));
    btn.title = label;
    btn.setAttribute('aria-label', label);
  }
  // Na faixa compacta o nome da aba só existe no tooltip; expandida, volta a ser visível no item.
  $$('#navGroups .nav-item').forEach((item) => {
    const tab = TAB_MAP[item.dataset.goto];
    if (!tab) return;
    item.setAttribute('aria-label', tab.title);
    if (collapsed) item.title = tab.title;
    else item.removeAttribute('title');
  });
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
  toast(state.navCollapsed
    ? 'Nav bar compacta: só os ícones das abas. Ctrl+B traz os nomes de volta.'
    : 'Nav bar expandida com os nomes das abas. Ctrl+B compacta de novo.', 'fa-table-columns');
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
    /* Ctrl+B (Cmd+B no Mac): recolhe e expande a nav bar, como o botão ao lado do logo. */
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'b') {
      const appEl = $('#app');
      if (appEl && !appEl.hidden) { e.preventDefault(); toggleNavCollapsed(); }
      return;
    }
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
  clicker: renderClickerShop, rebirth: renderRebirth, rewards: renderRewards, notes: renderNotes, ambient: renderAmbient, keysounds: renderKeySounds,
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
      addCoins(petIncome());
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
  document.body.classList.toggle('tab-hidden', document.hidden);
  applyStreakShield();
  applyOfflineEnergy();
  buildNav();
  applyNavCollapsed();
  initV23();
  initV24();
  initV25();
  initV26();
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
/* ============ 36. v23 — NÚCLEO DE UPGRADES ============ */
/* Tudo o que a v23 adiciona fica aqui, em módulos independentes, para não
   mexer no caminho crítico das funções antigas além dos hooks já ligados. */

/* ---------- 36-A. Foguinho 3.0: boosts, baú e missões semanais ---------- */
const BOOSTS = {
  xp: { key: 'xpUntil', name: 'Poção de foco', icon: 'fa-flask', cost: 140, minutes: 15, mult: 2, desc: 'Dobra todo XP ganho por 15 minutos.', tag: 'x2 XP' },
  coin: { key: 'coinUntil', name: 'Ímã de moedas', icon: 'fa-magnet', cost: 110, minutes: 15, mult: 1.5, desc: 'Aumenta em 50% as moedas ganhas por 15 minutos.', tag: '+50% moedas' }
};
const WEEKLY_POOL = [
  { id: 'wfocus180', label: '3 horas de foco na semana', goal: 180, unit: 'min', xp: 60, coins: 25, key: 'focus' },
  { id: 'wfocus420', label: '7 horas de foco na semana', goal: 420, unit: 'min', xp: 130, coins: 65, key: 'focus' },
  { id: 'wcards40', label: 'Revisar 40 flashcards', goal: 40, unit: 'cards', xp: 55, coins: 25, key: 'cards' },
  { id: 'wquiz20', label: 'Acertar 20 questões do quiz', goal: 20, unit: 'acertos', xp: 55, coins: 25, key: 'quiz' },
  { id: 'wgoals5', label: 'Concluir 5 metas', goal: 5, unit: 'metas', xp: 60, coins: 30, key: 'goals' },
  { id: 'wclick600', label: 'Dar 600 cliques no núcleo', goal: 600, unit: 'cliques', xp: 45, coins: 20, key: 'clicks' },
  { id: 'wcheckin5', label: 'Fazer 5 check-ins', goal: 5, unit: 'dias', xp: 70, coins: 35, key: 'checkins' },
  { id: 'wsessions8', label: 'Concluir 8 sessões de foco', goal: 8, unit: 'sessões', xp: 65, coins: 30, key: 'sessions' }
];
function boostActive(kind) {
  const b = BOOSTS[kind];
  return !!b && Number(state.boosts && state.boosts[b.key]) > Date.now();
}
function boostMinutesLeft(kind) {
  const b = BOOSTS[kind];
  if (!b) return 0;
  return Math.max(0, Math.ceil((Number(state.boosts && state.boosts[b.key]) - Date.now()) / 60000));
}
function activeBoostsText() {
  const parts = [];
  if (boostActive('xp')) parts.push('x2 XP (' + boostMinutesLeft('xp') + 'min)');
  if (boostActive('coin')) parts.push('+50% moedas (' + boostMinutesLeft('coin') + 'min)');
  return parts.length ? parts.join(' · ') : 'nenhum';
}
function buyBoost(kind) {
  const b = BOOSTS[kind];
  if (!b) return 'Boost inválido.';
  if (state.coins < b.cost) {
    const falta = 'Faltam ' + (b.cost - state.coins) + ' moedas para ' + b.name + '.';
    toast(falta, 'fa-triangle-exclamation', true);
    return falta;
  }
  state.coins -= b.cost;
  const now = Date.now();
  state.boosts[b.key] = Math.max(now, Number(state.boosts[b.key]) || 0) + b.minutes * 60000;
  state.boostsBought = (state.boostsBought || 0) + 1;
  state.boostsUsed = (state.boostsUsed || 0) + 1;
  save();
  renderTopbar(); renderBoostPills(); renderBoostsV23(); renderPomoV23();
  toast(b.name + ' ativado: ' + b.tag + ' por ' + b.minutes + ' minutos.', 'fa-flask');
  return b.name + ' ativado por ' + b.minutes + ' minutos.';
}
/* --- Baú diário: uma recompensa por dia que cresce com o foguinho --- */
function chestOpenedToday() {
  return !!(state.dailyChest && state.dailyChest.date === dateKey() && state.dailyChest.claimed);
}
function chestProjection() {
  const s = computeStreak();
  return {
    coins: clamp(18 + s * 2, 18, 130),
    xp: clamp(25 + s * 3, 25, 170),
    shieldChance: 16
  };
}
function openDailyChest() {
  if (chestOpenedToday()) {
    toast('O baú de hoje já foi aberto. Volte amanhã.', 'fa-gift');
    return 'O baú de hoje já foi aberto. Volte amanhã para outro.';
  }
  const s = computeStreak();
  const coins = clamp(18 + s * 2 + Math.floor(Math.random() * 8), 18, 130);
  const rawXp = clamp(25 + s * 3 + Math.floor(Math.random() * 12), 25, 170);
  const shield = Math.random() < 0.16 && (state.streakShields || 0) < 5;
  const gained = addXp(rawXp);
  addCoins(coins);
  if (shield) state.streakShields = (state.streakShields || 0) + 1;
  state.dailyChest = { date: dateKey(), claimed: true, coins: coins, xp: gained, shield: shield };
  state.chestsOpened = (state.chestsOpened || 0) + 1;
  save();
  renderChestCard(); renderBoostPills(); renderTopbar();
  if (state.currentTab === 'journey') renderJourney();
  if (state.currentTab === 'stats') renderStats();
  const card = $('#dailyChestCard');
  if (card && !state.motionReduced) { card.classList.remove('chest-opening'); void card.offsetWidth; card.classList.add('chest-opening'); }
  toast('Baú aberto: +' + gained + ' XP, +' + coins + ' moedas' + (shield ? ' e 1 escudo!' : '!'), 'fa-gift');
  return 'Baú aberto: +' + gained + ' XP, +' + coins + ' moedas' + (shield ? ' e 1 escudo!' : '!');
}
/* --- Missões semanais: 3 por semana, sorteio determinístico --- */
function weeklyValue(key) {
  ensureWeeklyStats();
  if (key === 'checkins') {
    const start = weekStartKey();
    return Object.keys(state.checkins || {}).filter((k) => k >= start).length;
  }
  return Math.round(Number(state.weeklyStats[key]) || 0);
}
function weeklyMissionList() {
  let seed = 0;
  const key = weekStartKey();
  for (let i = 0; i < key.length; i++) seed = (seed * 37 + key.charCodeAt(i) + i) % 7919;
  const pool = WEEKLY_POOL.slice();
  const out = [];
  for (let i = 0; i < 3 && pool.length; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    out.push(pool.splice(seed % pool.length, 1)[0]);
  }
  return out;
}
function weeklyClaimed(id) { return (state.weeklyClaims || []).includes(weekStartKey() + ':' + id); }
function claimWeeklyMission(id) {
  const m = weeklyMissionList().find((x) => x.id === id);
  if (!m) return;
  if (weeklyClaimed(id)) return toast('Essa missão semanal já foi resgatada.', 'fa-calendar-check');
  if (weeklyValue(m.key) < m.goal) return toast('Ainda falta progresso nessa missão.', 'fa-triangle-exclamation', true);
  state.weeklyClaims.push(weekStartKey() + ':' + id);
  state.weeklyClaims = state.weeklyClaims.slice(-80);
  const xp = addXp(m.xp);
  addCoins(m.coins);
  renderWeeklyMissions();
  if (state.currentTab === 'hoje') renderHoje();
  renderJourney();
  toast('Missão semanal concluída: +' + xp + ' XP e +' + m.coins + ' moedas.', 'fa-calendar-check');
  save();
}
function renderBoostPills() {
  const el = $('#boostPills');
  if (!el) return;
  const parts = [];
  if (boostActive('xp')) parts.push('<span class="boost-pill xp" title="Boost de XP ativo"><i class="fa-solid fa-flask"></i> x2 XP <b>' + boostMinutesLeft('xp') + 'min</b></span>');
  if (boostActive('coin')) parts.push('<span class="boost-pill coin" title="Boost de moedas ativo"><i class="fa-solid fa-magnet"></i> +50% <b>' + boostMinutesLeft('coin') + 'min</b></span>');
  const sig = parts.join('|');
  if (el.dataset.sig !== sig) {
    el.dataset.sig = sig;
    el.innerHTML = parts.join('');
  }
  el.classList.toggle('on', parts.length > 0);
}
function renderChestCard() {
  const box = $('#dailyChestCard');
  if (!box) return;
  const opened = chestOpenedToday();
  const p = chestProjection();
  const tier = streakTier();
  const saved = state.dailyChest || {};
  box.classList.toggle('is-open', opened);
  box.innerHTML = '<div class="chest-head"><span class="chest-icon"><i class="fa-solid ' + (opened ? 'fa-gift' : 'fa-box-open') + '"></i></span>' +
    '<div class="chest-copy"><span class="kicker">Baú diário</span><b>' + (opened ? 'Aberto hoje' : 'Uma recompensa por dia') + '</b>' +
    '<span class="status-text">Foguinho ' + computeStreak() + ' dia(s) · ' + tier.name + ' x' + tier.mult + ' XP</span></div>' +
    '<span class="badge gold">' + (opened ? 'volta amanhã' : '+' + p.xp + ' XP') + '</span></div>' +
    (opened
      ? '<div class="chest-loot"><span><i class="fa-solid fa-star"></i> +' + (saved.xp || p.xp) + ' XP</span><span><i class="fa-solid fa-coins"></i> +' + (saved.coins || p.coins) + ' moedas</span>' + (saved.shield ? '<span><i class="fa-solid fa-shield-halved"></i> +1 escudo</span>' : '') + '</div>' +
        '<p class="hint"><i class="fa-solid fa-clock"></i> O próximo baú libera na virada do dia. A recompensa cresce com a sequência.</p>'
      : '<div class="chest-loot"><span><i class="fa-solid fa-star"></i> ' + p.xp + '–' + (p.xp + 12) + ' XP</span><span><i class="fa-solid fa-coins"></i> ' + p.coins + '–' + (p.coins + 8) + ' moedas</span><span><i class="fa-solid fa-shield-halved"></i> ' + p.shieldChance + '% escudo</span></div>' +
        '<button class="btn btn-primary btn-block" type="button" data-v23="chest" data-fx="shine"><i class="fa-solid fa-gift"></i> Abrir baú de hoje</button>' +
        '<p class="hint"><i class="fa-solid fa-fire"></i> 7 dias seguidos de abertura liberam o bônus do foguinho no check-in.</p>');
}
function renderWeeklyMissions() {
  const list = $('#weeklyMissionsList');
  if (!list) return;
  const missions = weeklyMissionList();
  const claimed = missions.filter((m) => weeklyClaimed(m.id)).length;
  const badge = $('#weeklyMissionCount');
  if (badge) badge.textContent = claimed + '/' + missions.length;
  list.innerHTML = missions.map((m) => {
    const value = Math.min(weeklyValue(m.key), m.goal);
    const pct = Math.round((value / m.goal) * 100);
    const done = value >= m.goal;
    const isClaimed = weeklyClaimed(m.id);
    return '<div class="mission' + (isClaimed ? ' claimed' : done ? ' ready' : '') + '">' +
      '<span class="mission-icon"><i class="fa-solid fa-calendar-week"></i></span>' +
      '<div class="mission-main"><span class="mission-title">' + esc(m.label) + '</span>' +
      '<div class="mission-track"><span style="width:' + pct + '%"></span></div>' +
      '<span class="mission-sub">' + value + '/' + m.goal + ' ' + esc(m.unit) + ' · +' + m.xp + ' XP · +' + m.coins + ' moedas</span></div>' +
      '<button class="btn btn-sm ' + (done && !isClaimed ? 'btn-primary' : 'btn-secondary') + '" type="button" data-v23="weekly" data-id="' + m.id + '"' + (isClaimed || !done ? ' disabled' : '') + '>' +
      (isClaimed ? 'resgatada' : done ? 'resgatar' : 'em curso') + '</button></div>';
  }).join('');
  const reset = $('#weeklyResetLabel');
  if (reset) {
    const next = new Date(parseKey(weekStartKey()));
    next.setDate(next.getDate() + 7);
    reset.textContent = 'Troca em ' + next.getDate() + '/' + pad(next.getMonth() + 1) + ' · semana ' + weekStartKey();
  }
}
function renderBoostsV23() {
  const box = $('#storeBoosts');
  if (!box) return;
  box.innerHTML = Object.keys(BOOSTS).map((kind) => {
    const b = BOOSTS[kind];
    const left = boostMinutesLeft(kind);
    return '<div class="boost-item' + (left > 0 ? ' active' : '') + '">' +
      '<span class="boost-icon"><i class="fa-solid ' + b.icon + '"></i></span>' +
      '<div class="boost-main"><span class="boost-name">' + esc(b.name) + ' <span class="badge">' + b.tag + '</span></span>' +
      '<span class="boost-sub">' + esc(b.desc) + '</span>' +
      (left > 0 ? '<span class="status-text">ativo por ' + left + ' min</span>' : '') + '</div>' +
      '<button class="btn btn-sm ' + (left > 0 ? 'btn-secondary' : 'btn-primary') + '" type="button" data-v23="boost" data-kind="' + kind + '">' +
      '<i class="fa-solid fa-coins"></i> ' + b.cost + (left > 0 ? ' · estender' : '') + '</button></div>';
  }).join('');
  const coins = $('#storeBoostCoins');
  if (coins) coins.textContent = money(state.coins);
}
/* Renderiza os blocos da aba Hoje (baú + missões semanais). */
function renderV23Hoje() {
  renderChestCard();
  renderWeeklyMissions();
}

/* ---------- 36-B. Clicker 3.0: críticos, núcleo dourado e talentos ---------- */
const CLICKER_TALENTS = [
  { id: 'click', name: 'Punho quântico', icon: 'fa-hand-fist', desc: '+12% de energia por clique por nível', max: 5 },
  { id: 'rate', name: 'Rede neural', icon: 'fa-network-wired', desc: '+12% de energia por segundo por nível', max: 5 },
  { id: 'crit', name: 'Sorte carregada', icon: 'fa-bolt', desc: '+2% de chance de crítico por nível', max: 5 }
];
const CLICKER_MILESTONES = [
  { id: 'c1k', goal: 1000, label: '1.000 ⚡ gerados', coins: 15, xp: 10 },
  { id: 'c10k', goal: 10000, label: '10.000 ⚡ gerados', coins: 40, xp: 20 },
  { id: 'c100k', goal: 100000, label: '100.000 ⚡ gerados', coins: 150, xp: 60, shield: 1 },
  { id: 'c1m', goal: 1000000, label: '1.000.000 ⚡ gerados', coins: 600, xp: 180, shield: 1 },
  { id: 'c10m', goal: 10000000, label: '10.000.000 ⚡ gerados', coins: 2500, xp: 500, shield: 1 }
];
let goldShownAt = 0;
function talentLevel(id) { return clamp(Number((state.clicker.talents || {})[id]) || 0, 0, 5); }
function totalTalentLevels() { return CLICKER_TALENTS.reduce((a, t) => a + talentLevel(t.id), 0); }
function clickerCores() { return Math.max(0, (state.clicker.prestige || 0) - totalTalentLevels()); }
function buyTalent(id) {
  const t = CLICKER_TALENTS.find((x) => x.id === id);
  if (!t) return;
  const lvl = talentLevel(id);
  if (lvl >= t.max) return toast('Esse talento já está no nível máximo.', 'fa-triangle-exclamation');
  if (clickerCores() < 1) return toast('Você precisa de 1 núcleo livre. Faça prestígio para ganhar núcleos.', 'fa-triangle-exclamation', true);
  state.clicker.talents[id] = lvl + 1;
  save();
  renderClickerShop(); renderClickerExtras(); renderJourney();
  toast(t.name + ' nível ' + (lvl + 1) + '/5!', 'fa-arrow-up');
}
function claimClickerMilestone(id) {
  const m = CLICKER_MILESTONES.find((x) => x.id === id);
  if (!m) return;
  if ((state.clicker.milestones || []).includes(id)) return toast('Esse marco já foi resgatado.', 'fa-circle-check');
  if ((state.clicker.total || 0) < m.goal) return toast('Ainda falta energia gerada para esse marco.', 'fa-triangle-exclamation', true);
  state.clicker.milestones = (state.clicker.milestones || []).concat(id);
  addCoins(m.coins); addXp(m.xp);
  if (m.shield && (state.streakShields || 0) < 5) state.streakShields = (state.streakShields || 0) + 1;
  save(); renderClickerExtras(); renderJourney();
  toast('Marco do núcleo: +' + m.coins + ' moedas, +' + m.xp + ' XP' + (m.shield ? ' e 1 escudo' : '') + '.', 'fa-flag-checkered');
}
function grabGoldCore() {
  const now = Date.now();
  state.clicker.goldUntil = now + 20000;
  state.clicker.goldNext = now + 150000 + Math.random() * 90000;
  state.clicker.goldSeen = (state.clicker.goldSeen || 0) + 1;
  goldShownAt = 0;
  const bonus = 15 + (state.clicker.prestige || 0) * 5;
  addCoins(bonus);
  save(); renderClickerExtras(); renderClickerHud();
  toast('Núcleo dourado! x5 de produção por 20s e +' + bonus + ' moedas.', 'fa-sun');
}
function renderClickerGold() {
  const btn = $('#clickerGold');
  if (!btn) return;
  const now = Date.now();
  let visible = now >= (Number(state.clicker.goldNext) || 0) && (state.clicker.goldUntil || 0) <= now;
  if (visible) {
    if (!goldShownAt) goldShownAt = now;
    if (now - goldShownAt > 40000) {
      state.clicker.goldNext = now + 120000 + Math.random() * 60000;
      goldShownAt = 0;
      visible = false;
    }
  } else goldShownAt = 0;
  btn.hidden = !visible;
  const goldLeft = Math.max(0, Math.ceil(((state.clicker.goldUntil || 0) - now) / 1000));
  if (goldLeft > 0) btn.dataset.active = goldLeft + 's';
  else delete btn.dataset.active;
  const active = $('#clickerGoldBadge');
  if (active) {
    active.textContent = goldLeft > 0 ? 'dourado ' + goldLeft + 's' : 'sem dourado';
    active.classList.toggle('on', goldLeft > 0);
  }
}
function renderTalentList() {
  const box = $('#clickerTalentList');
  if (!box) return;
  const sig = CLICKER_TALENTS.map((t) => talentLevel(t.id)).join(',') + '/' + clickerCores() + '/' + (state.clicker.prestige || 0);
  if (box.dataset.sig === sig) return;
  box.dataset.sig = sig;
  box.innerHTML = CLICKER_TALENTS.map((t) => {
    const lvl = talentLevel(t.id);
    const can = clickerCores() > 0 && lvl < t.max;
    const pips = Array.from({ length: t.max }, (_, i) => '<i class="' + (i < lvl ? 'on' : '') + '"></i>').join('');
    return '<div class="talent-row"><span class="talent-icon"><i class="fa-solid ' + t.icon + '"></i></span>' +
      '<div class="talent-main"><span class="talent-name">' + esc(t.name) + ' <span class="talent-pips">' + pips + '</span></span>' +
      '<span class="talent-sub">' + esc(t.desc) + '</span></div>' +
      '<button class="btn btn-sm ' + (can ? 'btn-primary' : 'btn-secondary') + '" type="button" data-v23="talent" data-id="' + t.id + '"' + (can ? '' : ' disabled') + '>' +
      (lvl >= t.max ? 'máx' : '1 núcleo') + '</button></div>';
  }).join('');
  const cores = $('#clickerCoreCount');
  if (cores) cores.textContent = clickerCores() + ' núcleo(s) livre(s)';
}
function renderClickerMilestones() {
  const box = $('#clickerMilestoneList');
  if (!box) return;
  const claimed = state.clicker.milestones || [];
  const ready = CLICKER_MILESTONES.filter((m) => (state.clicker.total || 0) >= m.goal && !claimed.includes(m.id)).map((m) => m.id).join(',');
  const sig = claimed.join(',') + '|' + ready;
  if (box.dataset.sig === sig) return;
  box.dataset.sig = sig;
  const badge = $('#clickerMilestoneCount');
  if (badge) badge.textContent = claimed.length + '/' + CLICKER_MILESTONES.length;
  box.innerHTML = CLICKER_MILESTONES.map((m) => {
    const done = claimed.includes(m.id);
    const can = !done && (state.clicker.total || 0) >= m.goal;
    return '<div class="cl-milestone' + (done ? ' done' : can ? ' ready' : '') + '"><i class="fa-solid ' + (done ? 'fa-circle-check' : 'fa-bolt') + '"></i>' +
      '<div class="cl-main"><span>' + esc(m.label) + '</span><span class="cl-sub">+' + m.coins + ' moedas · +' + m.xp + ' XP' + (m.shield ? ' · 1 escudo' : '') + '</span></div>' +
      '<button class="btn btn-sm ' + (can ? 'btn-primary' : 'btn-secondary') + '" type="button" data-v23="cmilestone" data-id="' + m.id + '"' + (can ? '' : ' disabled') + '>' + (done ? 'resgatado' : can ? 'resgatar' : 'em curso') + '</button></div>';
  }).join('');
}
function renderClickerExtras() {
  const crit = $('#clickerCritChip');
  if (crit) {
    const pct = Math.round(clickerCritChance() * 100);
    setTextV23(crit, pct + '% crítico');
    crit.title = 'Crítico multiplica a energia do clique por 6 · ' + pct + '% de chance';
  }
  renderClickerGold();
  renderTalentList();
  renderClickerMilestones();
  $$('#clickerExchangeBar [data-v23="exchange"]').forEach((b) => {
    const tier = CLICKER_EXCHANGES[Number(b.dataset.index)];
    if (tier) b.disabled = state.clicker.points < tier.energy;
  });
  const coins = $('#clickerCoinCount');
  if (coins) setTextV23(coins, money(state.coins));
}
function setTextV23(el, text) {
  if (el && el.textContent !== String(text)) el.textContent = text;
}

/* ---------- 36-C. Melhorias por aba (Pomodoro, Metas, Flashcards, Quiz) ---------- */
function renderPomoV23() {
  const box = $('#pomoV23Body');
  if (!box) return;
  const cfg = state.pomoConfig;
  const target = clamp(Number(cfg.cycles) || 4, 2, 8);
  const mins = pomo.mode === 'focus' ? Math.round(pomo.total / 60) : cfg.focus;
  const base = mins * 2 + (mins >= 25 ? 6 : 0);
  const nextLong = state.pomoCycle === 1 ? target : target - state.pomoCycle + 1;
  const sig = [state.pomoSessions, state.sessions, state.pomoCycle, target, xpMultiplier(), fmtMinutes(todayFocusLive()), cfg.focus, cfg.short, cfg.long, pomo.mode, Math.round(pomo.total / 60)].join('|');
  if (box.dataset.sig === sig) return;
  box.dataset.sig = sig;
  box.innerHTML = '<div class="v23-mini"><span>Sessões no hub</span><b>' + state.pomoSessions + '</b><small>' + state.sessions + ' sessões totais</small></div>' +
    '<div class="v23-mini"><span>Ciclo atual</span><b>' + state.pomoCycle + '/' + target + '</b><small>pausa longa em ' + nextLong + ' ciclo(s)</small></div>' +
    '<div class="v23-mini"><span>XP por sessão</span><b>x' + String(Math.round(xpMultiplier() * 100) / 100).replace('.', ',') + '</b><small>' + Math.round(base * xpMultiplier()) + ' XP · ' + Math.max(1, Math.round(mins / 10)) + ' moedas</small></div>' +
    '<div class="v23-mini"><span>Foco hoje</span><b>' + fmtMinutes(todayFocusLive()) + '</b><small>meta de 60min</small></div>';
  const badge = $('#pomoV23Badge');
  if (badge) badge.textContent = cfg.focus + '/' + cfg.short + ' · longa ' + cfg.long + 'min';
}
function renderGoalsV23() {
  const box = $('#goalsV23Body');
  if (!box) return;
  const today = dateKey();
  const open = state.goals.filter((g) => !g.done).length;
  const done = state.goals.filter((g) => g.done).length;
  const late = state.goals.filter((g) => !g.done && g.due && g.due < today).length;
  const high = state.goals.filter((g) => !g.done && g.priority === 'alta').length;
  box.innerHTML = '<div class="v23-mini"><span>Abertas</span><b>' + open + '</b><small>' + done + ' concluídas</small></div>' +
    '<div class="v23-mini"><span>Atrasadas</span><b class="' + (late ? 'danger-text' : '') + '">' + late + '</b><small>prazo vencido</small></div>' +
    '<div class="v23-mini"><span>Prioridade alta</span><b>' + high + '</b><small>pendentes</small></div>' +
    '<div class="v23-mini"><span>Concluídas hoje</span><b>' + dailyValue('goals') + '</b><small>+8 XP cada</small></div>';
}
function clearDoneGoals() {
  const done = state.goals.filter((g) => g.done);
  if (!done.length) return toast('Nenhuma meta concluída para limpar.', 'fa-list-check');
  if (!confirm('Remover ' + done.length + ' meta(s) concluída(s)? O progresso e o XP já ganhos são mantidos.')) return;
  state.goals = state.goals.filter((g) => !g.done);
  save(); renderGoals(); renderHoje(); renderGoalsV23();
  toast(done.length + ' meta(s) concluída(s) removida(s).', 'fa-broom');
}
function renderFlashV23() {
  const meta = $('#flashV23Meta');
  if (meta) {
    const cards = (state.decks[state.deck] || []).length;
    meta.textContent = state.deck + ' · ' + cards + ' cards · ' + dueCards(state.deck).length + ' devidos';
  }
}
function importFlashcardsV23() {
  const ta = $('#flashBulkInput');
  if (!ta) return;
  const lines = ta.value.split('\n').map((l) => l.trim()).filter(Boolean);
  const added = [];
  lines.forEach((line) => {
    const parts = line.split(/\s*[|;]\s*/);
    if (parts.length < 2) return;
    const q = parts[0].trim();
    const a = parts.slice(1).join(' | ').trim();
    if (!q || !a) return;
    added.push({ id: uid(), q: q, a: a, ease: 2.5, interval: 0, due: '', reps: 0, lapses: 0, createdAt: Date.now() });
  });
  if (!added.length) return toast('Use uma linha por card: Pergunta | Resposta.', 'fa-triangle-exclamation', true);
  state.decks[state.deck] = (state.decks[state.deck] || []).concat(added);
  ta.value = '';
  save(); buildFlashQueue(); renderFlashcards(); renderFlashV23();
  toast(added.length + ' card(s) adicionados em ' + state.deck + '.', 'fa-plus');
}
function exportDeckCsvV23() {
  const cards = state.decks[state.deck] || [];
  if (!cards.length) return toast('Esse baralho está vazio.', 'fa-triangle-exclamation', true);
  const rows = [['pergunta', 'resposta', 'intervalo', 'reps', 'proxima']].concat(cards.map((c) => [c.q, c.a, c.interval || 0, c.reps || 0, c.due || '']));
  const csv = rows.map((r) => r.map((v) => '"' + String(v).replace(/"/g, '""') + '"').join(';')).join('\n');
  download('geekie-' + state.deck.toLowerCase().replace(/[^a-z0-9]+/gi, '-') + '.csv', csv, 'text/csv;charset=utf-8');
  toast('Baralho exportado em CSV.', 'fa-file-csv');
}
function renderQuizV23() {
  const box = $('#quizV23Body');
  if (!box) return;
  const hist = state.quizHistory || [];
  const global = hist.reduce((acc, h) => { acc.score += h.score || 0; acc.total += h.total || 0; return acc; }, { score: 0, total: 0 });
  const pct = global.total ? Math.round((global.score / global.total) * 100) : 0;
  const bySubject = {};
  hist.forEach((h) => {
    if (!h.subject) return;
    bySubject[h.subject] = bySubject[h.subject] || { score: 0, total: 0 };
    bySubject[h.subject].score += h.score || 0;
    bySubject[h.subject].total += h.total || 0;
  });
  const rows = Object.keys(bySubject).map((s) => {
    const d = bySubject[s];
    const p = d.total ? Math.round((d.score / d.total) * 100) : 0;
    return '<div class="v23-bar-row"><span>' + esc(s) + '</span><div class="v23-track"><i style="width:' + p + '%"></i></div><b>' + p + '%</b></div>';
  }).join('');
  box.innerHTML = '<div class="v23-mini"><span>Precisão geral</span><b>' + pct + '%</b><small>' + global.score + '/' + global.total + ' questões</small></div>' +
    '<div class="v23-mini"><span>Recorde</span><b>' + state.quizBest + '</b><small>acertos em um quiz</small></div>' +
    '<div class="v23-mini"><span>Quizzes</span><b>' + hist.length + '</b><small>últimos 20 salvos</small></div>' +
    (rows ? '<div class="v23-bars">' + rows + '</div>' : '<div class="empty">Jogue um quiz para ver sua precisão por matéria.</div>');
}
/* Hooks de render: mantêm os painéis v23 sincronizados com as telas antigas. */
const paintGoalsV23 = renderGoals;
renderGoals = function () { paintGoalsV23(); renderGoalsV23(); };
const paintFlashV23 = renderFlashcards;
renderFlashcards = function () { paintFlashV23(); renderFlashV23(); };
const paintQuizV23 = renderQuizBest;
renderQuizBest = function () { paintQuizV23(); renderQuizV23(); };

/* ---------- 36-D. Painéis de Subjects, Planner, Stats, Diário, Notas, Chars e Eventos ---------- */
function renderSubjectsV23() {
  const box = $('#subjectsLog');
  if (!box) return;
  const log = (state.subjectLog || []).slice(0, 7);
  box.innerHTML = log.length ? log.map((s) => '<div class="list-item"><i class="fa-solid fa-clock" style="color:var(--primary)"></i>' +
    '<div class="li-main"><span class="li-title">' + esc(s.subject) + '</span><span class="li-sub">' + fmtMinutes(s.minutes) + ' · ' + new Date(s.at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) + '</span></div></div>').join('')
    : '<div class="empty">Nenhuma sessão registrada ainda. Inicie o cronômetro e pare para salvar.</div>';
}
function renderPlannerV23() {
  const box = $('#plannerV23Body');
  if (!box) return;
  const days = plannerDays();
  let blocks = 0;
  const subj = new Set();
  days.forEach((d) => {
    const plan = state.planner[dateKey(d)] || {};
    Object.keys(plan).forEach((k) => {
      const text = plan[k];
      if (!text) return;
      blocks++;
      const name = String(text).split('—')[0].trim();
      if (name) subj.add(name);
    });
  });
  box.innerHTML = '<div class="v23-mini"><span>Blocos preenchidos</span><b>' + blocks + '/42</b><small>' + Math.round((blocks / 42) * 100) + '% da grade</small></div>' +
    '<div class="v23-mini"><span>Matérias na semana</span><b>' + subj.size + '</b><small>' + (subj.size ? Array.from(subj).slice(0, 2).join(' · ') : 'nenhuma') + '</small></div>' +
    '<div class="v23-mini"><span>Carga planejada</span><b>' + blocks * 2 + 'h</b><small>2h por bloco</small></div>' +
    '<div class="v23-mini"><span>Semana</span><b>' + (plannerOffset === 0 ? 'atual' : (plannerOffset > 0 ? '+' : '') + plannerOffset) + '</b><small>' + (plannerOffset === 0 ? 'edite os blocos' : 'navegação relativa') + '</small></div>';
}
function exportPlannerV23() {
  const days = plannerDays();
  let md = '# Planner Geekie\n\n';
  days.forEach((d) => {
    const key = dateKey(d);
    const plan = state.planner[key] || {};
    const lines = PLANNER_SLOTS.map((slot, i) => plan[String(i)] ? '- **' + slot + '** — ' + plan[String(i)] : '').filter(Boolean);
    if (!lines.length) return;
    md += '## ' + WEEK_FULL[d.getDay()] + ', ' + d.getDate() + '/' + pad(d.getMonth() + 1) + '\n' + lines.join('\n') + '\n\n';
  });
  if (md.trim() === '# Planner Geekie') return toast('Nenhum bloco preenchido nesta semana.', 'fa-triangle-exclamation', true);
  download('geekie-planner.md', md, 'text/markdown;charset=utf-8');
  toast('Semana exportada em .md.', 'fa-file-arrow-down');
}
function renderStatsV23() {
  const box = $('#statsV23Body');
  if (!box) return;
  const series = seriesFocus(statsDays);
  const total = series.reduce((a, b) => a + b.minutes, 0);
  const active = series.filter((x) => dayActiveKey(x.key)).length;
  const best = series.reduce((a, b) => (b.minutes > a.minutes ? b : a), series[0] || { minutes: 0, key: '' });
  const avgDay = total / statsDays;
  const constancia = Math.round((active / statsDays) * 100);
  box.innerHTML = '<div class="v23-mini"><span>Média diária</span><b>' + fmtMinutes(avgDay) + '</b><small>nos últimos ' + statsDays + ' dias</small></div>' +
    '<div class="v23-mini"><span>Melhor dia</span><b>' + fmtMinutes(best.minutes) + '</b><small>' + (best.key ? prettyDate(best.key) : 'sem registro') + '</small></div>' +
    '<div class="v23-mini"><span>Constância</span><b>' + constancia + '%</b><small>' + active + ' de ' + statsDays + ' dias ativos</small></div>' +
    '<div class="v23-mini"><span>Projeção mensal</span><b>' + fmtMinutes(avgDay * 30) + '</b><small>no ritmo atual</small></div>' +
    '<div class="v23-insight-line"><i class="fa-solid fa-lightbulb"></i> ' +
    (constancia >= 70 ? 'Ritmo forte: sua constância está acima de 70% do período.' : constancia >= 40 ? 'Ritmo estável. Um check-in nos dias vazios já mantém o foguinho vivo.' : 'Comece pequeno: 15 minutos por dia já movem a média e a sequência.') +
    '</div>';
}
function renderDiaryV23() {
  const box = $('#diaryV23Body');
  if (!box) return;
  const keys = Object.keys(state.diary || {}).sort();
  const last = keys.slice(-30);
  const counts = MOODS.map((m) => ({ m: m, n: last.filter((k) => (state.diary[k].mood || '') === m).length }));
  const good = counts[0].n + counts[1].n;
  let streak = 0;
  let cursor = new Date();
  if (!state.diary[dateKey(cursor)]) cursor = addDays(cursor, -1);
  while (state.diary[dateKey(cursor)]) { streak++; cursor = addDays(cursor, -1); }
  box.innerHTML = '<div class="v23-mini"><span>Entradas</span><b>' + keys.length + '</b><small>' + keys.filter((k) => k.slice(0, 7) === dateKey().slice(0, 7)).length + ' neste mês</small></div>' +
    '<div class="v23-mini"><span>Dias seguidos</span><b>' + streak + '</b><small>escrevendo no diário</small></div>' +
    '<div class="v23-mini"><span>Humor positivo</span><b>' + (last.length ? Math.round((good / last.length) * 100) : 0) + '%</b><small>últimas ' + last.length + ' entradas</small></div>';
  const bars = $('#diaryMoodBars');
  if (bars) {
    const max = Math.max(1, Math.max.apply(null, counts.map((c) => c.n)));
    bars.innerHTML = counts.map((c) => '<div class="v23-bar-row"><span class="v23-mood">' + c.m + '</span><div class="v23-track"><i style="width:' + Math.round((c.n / max) * 100) + '%"></i></div><b>' + c.n + '</b></div>').join('');
  }
  const badge = $('#diaryV23Count');
  if (badge) badge.textContent = last.length + ' recentes';
}
function renderNotesV23() {
  const box = $('#notesStats');
  if (!box) return;
  const notes = Object.values(state.notes || {});
  const words = notes.reduce((acc, n) => {
    const t = (n.content || '').trim();
    return acc + (t ? t.split(/\s+/).length : 0);
  }, 0);
  const tags = new Set();
  notes.forEach((n) => String(n.tags || '').split(',').map((t) => t.trim()).filter(Boolean).forEach((t) => tags.add(t)));
  box.innerHTML = '<div class="v23-mini"><span>Notas</span><b>' + notes.length + '</b><small>' + notes.filter((n) => n.pinned).length + ' fixadas</small></div>' +
    '<div class="v23-mini"><span>Palavras</span><b>' + words + '</b><small>em todo o caderno</small></div>' +
    '<div class="v23-mini"><span>Tags</span><b>' + tags.size + '</b><small>' + (tags.size ? Array.from(tags).slice(0, 2).join(' · ') : 'nenhuma') + '</small></div>';
}
function renderCharsV23() {
  const el = $('#charsV23Count');
  if (!el) return;
  const n = $$('#charGrid [data-char]').length;
  setTextV23(el, n + ' símbolo(s) visíveis');
}
function copyVisibleCharsV23() {
  const tiles = $$('#charGrid [data-char]');
  if (!tiles.length) return toast('Nenhum símbolo visível para copiar.', 'fa-triangle-exclamation', true);
  const text = tiles.map((b) => b.dataset.char).join(' ');
  copyText(text).then((ok) => toast(ok ? tiles.length + ' símbolo(s) copiados.' : 'Não foi possível copiar.', 'fa-font', !ok));
}
function renderEventsV23() {
  const box = $('#eventsV23Body');
  if (!box) return;
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const days = Math.ceil((next - now) / 86400000);
  const minutes = monthMinutes(now.getMonth());
  const level = Math.min(5, Math.floor(minutes / 60) + 1);
  const claimed = (state.eventClaims || {})[now.getMonth()];
  const badge = $('#eventsV23Badge');
  if (badge) badge.textContent = MONTHS[now.getMonth()] + ' · nível ' + level;
  box.innerHTML = '<div class="v23-mini"><span>Próximo evento</span><b>' + days + ' dia(s)</b><small>' + MONTHS[next.getMonth()] + '</small></div>' +
    '<div class="v23-mini"><span>Foco no mês</span><b>' + fmtMinutes(minutes) + '</b><small>nível ' + level + ' de 5</small></div>' +
    '<div class="v23-mini"><span>Recompensa</span><b>' + (claimed ? 'resgatada' : EVENTS[now.getMonth()].coins + ' 🪙') + '</b><small>' + (level >= 2 ? (claimed ? 'já recebeu' : 'pronta para resgatar') : 'alcance o nível 2') + '</small></div>' +
    '<div class="v23-mini"><span>Faltam para o nível 2</span><b>' + Math.max(0, 60 - minutes) + 'min</b><small>de foco neste mês</small></div>';
}
function applyChatFilterV23() {
  const input = $('#chatFilterV23');
  if (!input) return;
  const q = input.value.toLowerCase().trim();
  let shown = 0;
  let total = 0;
  $$('#chatMessages .chat-message').forEach((m) => {
    total++;
    const hit = !q || m.textContent.toLowerCase().includes(q);
    m.hidden = !hit;
    if (hit) shown++;
  });
  const status = $('#chatFilterStatus');
  if (status) status.textContent = q ? shown + '/' + total + ' mensagens' : '';
}
function zoomPortalV23(btn) {
  const page = btn.closest('.page');
  const frame = page ? $('.iframe-frame iframe', page) : null;
  if (!frame) return;
  let z = Number(frame.dataset.zoom) || 1;
  if (btn.dataset.dir === 'in') z += 0.1;
  else if (btn.dataset.dir === 'out') z -= 0.1;
  else z = 1;
  z = clamp(Math.round(z * 10) / 10, 0.7, 1.3);
  frame.dataset.zoom = z;
  try { frame.style.zoom = z; } catch (e) { /* navegador sem zoom CSS */ }
  const pageId = page.dataset.tab;
  if (pageId) { state.portalZoom = state.portalZoom || {}; state.portalZoom[pageId] = z; save(); }
  const label = $('[data-v23-zoom-label]', page);
  if (label) label.textContent = Math.round(z * 100) + '%';
}

/* ---------- 36-E. Injeção de UI, eventos e ciclo de vida ---------- */
let v23Ready = false;
function v23Insert(pageId, html, anchorSel, position) {
  const page = document.getElementById('page-' + pageId);
  if (!page) return null;
  const holder = document.createElement('div');
  holder.innerHTML = html.trim();
  const node = holder.firstElementChild;
  if (!node) return null;
  if (anchorSel) {
    const anchor = $(anchorSel, page);
    if (anchor) {
      if (position === 'before') anchor.insertAdjacentElement('beforebegin', node);
      else anchor.insertAdjacentElement('afterend', node);
      return node;
    }
  }
  page.appendChild(node);
  return node;
}
function buildV23Ui() {
  const top = $('.topbar-stats');
  if (top && !$('#boostPills')) {
    const pills = document.createElement('div');
    pills.id = 'boostPills';
    pills.className = 'boost-pills';
    top.appendChild(pills);
  }
  v23Insert('hoje', '<div class="grid grid-2 v23-hoje-grid">' +
    '<article class="card v23-chest" id="dailyChestCard"></article>' +
    '<article class="card"><div class="card-head"><h3><i class="fa-solid fa-calendar-week"></i> Missões da semana</h3><span class="badge" id="weeklyMissionCount">0/3</span></div>' +
    '<p class="hint">Três objetivos maiores que renovam toda segunda-feira. Resgatar rende XP e moedas de verdade.</p>' +
    '<div class="list" id="weeklyMissionsList"></div><span class="status-text" id="weeklyResetLabel"></span></article></div>', '#hojeCards', 'before');
  v23Insert('timer', '<article class="card" id="pomoV23Card"><div class="card-head"><h3><i class="fa-solid fa-gauge-high"></i> Pulso do ciclo</h3><span class="badge" id="pomoV23Badge">25/5</span></div>' +
    '<div class="v23-mini-grid" id="pomoV23Body"></div></article>');
  v23Insert('goals', '<article class="card"><div class="card-head"><h3><i class="fa-solid fa-chart-pie"></i> Resumo das metas</h3><button class="btn btn-secondary btn-sm" type="button" data-v23="clear-done"><i class="fa-solid fa-broom"></i> Limpar concluídas</button></div>' +
    '<div class="v23-mini-grid" id="goalsV23Body"></div></article>');
  v23Insert('flashcards', '<article class="card"><div class="card-head"><h3><i class="fa-solid fa-file-import"></i> Importar e exportar</h3><span class="badge" id="flashV23Meta">—</span></div>' +
    '<textarea id="flashBulkInput" class="textarea" rows="4" placeholder="Uma linha por card: Pergunta | Resposta"></textarea>' +
    '<div class="toolbar"><button class="btn btn-primary" type="button" data-v23="flash-import"><i class="fa-solid fa-plus"></i> Adicionar ao baralho</button>' +
    '<button class="btn btn-secondary" type="button" data-v23="flash-export"><i class="fa-solid fa-file-csv"></i> Exportar CSV</button></div>' +
    '<p class="hint">Use <b>|</b> ou <b>;</b> entre pergunta e resposta. O CSV leva intervalo, repetições e próxima revisão.</p></article>');
  v23Insert('quiz', '<article class="card"><div class="card-head"><h3><i class="fa-solid fa-chart-line"></i> Seu desempenho</h3><span class="status-text">últimos quizzes</span></div>' +
    '<div class="v23-mini-grid" id="quizV23Body"></div><p class="hint"><kbd>1</kbd>–<kbd>4</kbd> também respondem o quiz quando a aba está aberta.</p></article>');
  v23Insert('subjects', '<article class="card"><div class="card-head"><h3><i class="fa-solid fa-list-ul"></i> Últimas sessões</h3><span class="badge">histórico local</span></div><div class="list" id="subjectsLog"></div></article>');
  v23Insert('planner', '<article class="card"><div class="card-head"><h3><i class="fa-solid fa-gauge"></i> Carga da semana</h3><button class="btn btn-secondary btn-sm" type="button" data-v23="planner-export"><i class="fa-solid fa-file-arrow-down"></i> Exportar .md</button></div>' +
    '<div class="v23-mini-grid" id="plannerV23Body"></div></article>');
  v23Insert('stats', '<article class="card"><div class="card-head"><h3><i class="fa-solid fa-lightbulb"></i> Insights</h3><span class="badge live-badge"><i class="fa-solid fa-circle"></i> calculado</span></div>' +
    '<div class="v23-mini-grid" id="statsV23Body"></div></article>', '#statsCards', 'after');
  v23Insert('diary', '<article class="card"><div class="card-head"><h3><i class="fa-solid fa-face-smile"></i> Humor recente</h3><span class="badge" id="diaryV23Count">0</span></div>' +
    '<div class="v23-mini-grid" id="diaryV23Body"></div><div class="v23-bars" id="diaryMoodBars"></div></article>');
  v23Insert('chat', '<div class="v23-chat-search"><i class="fa-solid fa-magnifying-glass"></i><input type="search" id="chatFilterV23" placeholder="Filtrar mensagens desta conversa…" aria-label="Filtrar mensagens"><span class="status-text" id="chatFilterStatus"></span></div>', '#chatMessages', 'before');
  v23Insert('notes', '<article class="card"><div class="card-head"><h3><i class="fa-solid fa-chart-simple"></i> Estatísticas de escrita</h3><span class="badge">local</span></div>' +
    '<div class="v23-mini-grid" id="notesStats"></div></article>');
  v23Insert('chars', '<div class="v23-toolbar"><button class="btn btn-secondary btn-sm" type="button" data-v23="chars-copy"><i class="fa-solid fa-copy"></i> Copiar visíveis</button><span class="status-text" id="charsV23Count">0 símbolos visíveis</span></div>', '#charGrid', 'before');
  v23Insert('store', '<article class="card"><div class="card-head"><h3><i class="fa-solid fa-flask"></i> Boosts de foco</h3><div class="stat-pill stat-coins"><i class="fa-solid fa-coins"></i><b id="storeBoostCoins">0</b></div></div>' +
    '<p class="hint">Consumíveis de 15 minutos: multiplicam XP ou moedas. Comprar de novo estende o tempo ativo.</p><div class="list" id="storeBoosts"></div></article>');
  v23Insert('events', '<article class="card"><div class="card-head"><h3><i class="fa-solid fa-hourglass-half"></i> Próximo evento</h3><span class="badge" id="eventsV23Badge">—</span></div>' +
    '<div class="v23-mini-grid" id="eventsV23Body"></div></article>');
  buildV23Clicker();
  buildV23Portals();
}
function buildV23Clicker() {
  const card = $('.clicker-card');
  if (!card) return;
  const row = $('.card-head .row', card);
  if (row && !$('#clickerCritChip')) {
    row.insertAdjacentHTML('afterbegin', '<span class="badge crit-badge" id="clickerCritChip">4% crítico</span><span class="badge gold-badge" id="clickerGoldBadge">sem dourado</span>');
  }
  const bar = $('.clicker-exchanges');
  if (bar) {
    bar.id = 'clickerExchangeBar';
    bar.innerHTML = CLICKER_EXCHANGES.map((x, i) => '<button class="btn btn-sm ' + (i === 0 ? 'btn-primary' : 'btn-secondary') + '" type="button" data-v23="exchange" data-index="' + i + '">' + x.label + '</button>').join('');
  }
  const wrap = $('.clicker-core-wrap');
  if (wrap && !$('#clickerGold')) {
    const gold = document.createElement('button');
    gold.type = 'button';
    gold.id = 'clickerGold';
    gold.className = 'clicker-gold';
    gold.hidden = true;
    gold.setAttribute('data-v23', 'gold');
    gold.setAttribute('aria-label', 'Coletar núcleo dourado');
    gold.innerHTML = '<i class="fa-solid fa-sun"></i><span>Núcleo dourado</span>';
    wrap.appendChild(gold);
  }
  if (card && !$('#clickerMilestoneList')) {
    const ms = document.createElement('div');
    ms.className = 'v23-clicker-milestones';
    ms.innerHTML = '<div class="card-head"><h3><i class="fa-solid fa-flag-checkered"></i> Marcos do núcleo</h3><span class="badge" id="clickerMilestoneCount">0/5</span></div><div class="list" id="clickerMilestoneList"></div>';
    card.appendChild(ms);
  }
  const prestige = $('#clickerPrestige');
  if (prestige && !$('#clickerTalents')) {
    const talents = document.createElement('div');
    talents.className = 'v23-talents';
    talents.id = 'clickerTalents';
    talents.innerHTML = '<div class="v23-section-head"><span class="kicker">Talentos de prestígio</span><span class="badge" id="clickerCoreCount">0 núcleo(s) livre(s)</span></div>' +
      '<div id="clickerTalentList"></div><p class="hint">Cada nível custa 1 núcleo livre. Prestígio dá +15% permanente e mais 1 núcleo.</p>';
    prestige.insertAdjacentElement('afterend', talents);
  }
}
function buildV23Portals() {
  $$('.portal-bar').forEach((bar) => {
    const row = $('.row', bar);
    const page = bar.closest('.page');
    if (!row || !page || !$('.iframe-frame iframe', page) || $('[data-v23="zoom"]', bar)) return;
    const group = document.createElement('div');
    group.className = 'row v23-zoom';
    group.innerHTML = '<button class="btn btn-icon btn-secondary btn-sm" type="button" data-v23="zoom" data-dir="out" aria-label="Diminuir zoom"><i class="fa-solid fa-magnifying-glass-minus"></i></button>' +
      '<span class="status-text" data-v23-zoom-label>100%</span>' +
      '<button class="btn btn-icon btn-secondary btn-sm" type="button" data-v23="zoom" data-dir="in" aria-label="Aumentar zoom"><i class="fa-solid fa-magnifying-glass-plus"></i></button>' +
      '<button class="btn btn-icon btn-ghost btn-sm" type="button" data-v23="zoom" data-dir="reset" aria-label="Restaurar zoom"><i class="fa-solid fa-rotate-left"></i></button>';
    row.appendChild(group);
  });
}
function bindV23Events() {
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-v23]');
    if (!el || el.disabled) return;
    const act = el.dataset.v23;
    if (act === 'chest') openDailyChest();
    else if (act === 'weekly') claimWeeklyMission(el.dataset.id);
    else if (act === 'boost') buyBoost(el.dataset.kind);
    else if (act === 'talent') buyTalent(el.dataset.id);
    else if (act === 'cmilestone') claimClickerMilestone(el.dataset.id);
    else if (act === 'gold') grabGoldCore();
    else if (act === 'exchange') exchangeClicker(Number(el.dataset.index));
    else if (act === 'clear-done') clearDoneGoals();
    else if (act === 'flash-import') importFlashcardsV23();
    else if (act === 'flash-export') exportDeckCsvV23();
    else if (act === 'planner-export') exportPlannerV23();
    else if (act === 'chars-copy') copyVisibleCharsV23();
    else if (act === 'zoom') zoomPortalV23(el);
    else if (act === 'start-focus') { switchTab('timer'); pomoStart(); }
  });
  const filter = $('#chatFilterV23');
  if (filter) filter.addEventListener('input', debounce(applyChatFilterV23, 100));
  document.addEventListener('keydown', (e) => {
    if (state.currentTab !== 'quiz' || !quizRun.active) return;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
    if (['1', '2', '3', '4'].includes(e.key)) { e.preventDefault(); answerQuiz(Number(e.key) - 1); }
  });
}
function renderV23All() {
  renderV23Hoje();
  renderPomoV23();
  renderGoalsV23();
  renderFlashV23();
  renderQuizV23();
  renderSubjectsV23();
  renderPlannerV23();
  renderStatsV23();
  renderDiaryV23();
  renderNotesV23();
  renderCharsV23();
  renderEventsV23();
  renderBoostsV23();
  renderClickerExtras();
  renderBoostPills();
}
function renderV23Tab(id) {
  if (id === 'hoje') renderV23Hoje();
  else if (id === 'timer') renderPomoV23();
  else if (id === 'goals') renderGoalsV23();
  else if (id === 'flashcards') renderFlashV23();
  else if (id === 'quiz') renderQuizV23();
  else if (id === 'subjects') renderSubjectsV23();
  else if (id === 'planner') renderPlannerV23();
  else if (id === 'stats') renderStatsV23();
  else if (id === 'diary') renderDiaryV23();
  else if (id === 'notes') renderNotesV23();
  else if (id === 'chars') renderCharsV23();
  else if (id === 'events') renderEventsV23();
  else if (id === 'store') renderBoostsV23();
  else if (id === 'clicker') renderClickerExtras();
  else if (id === 'chat') applyChatFilterV23();
}
function initV23() {
  if (v23Ready) return;
  v23Ready = true;
  buildV23Ui();
  bindV23Events();
  bindPasswordExtrasV23();
  if (!Number(state.clicker.goldNext)) state.clicker.goldNext = Date.now() + 45000;
  renderV23All();
  setInterval(() => {
    if (document.hidden || !state.session) return;
    renderBoostPills();
    if (state.currentTab === 'clicker') renderClickerExtras();
    if (state.currentTab === 'timer') renderPomoV23();
  }, 1000);
}
/* Hooks leves: cada tela antiga continua mandando, a v23 só complementa. */
const paintStatsV23 = renderStats;
renderStats = function () { paintStatsV23(); renderStatsV23(); };
const paintDiaryV23 = renderDiary;
renderDiary = function () { paintDiaryV23(); renderDiaryV23(); };
const paintStoreV23 = renderStore;
renderStore = function () { paintStoreV23(); renderBoostsV23(); };
const paintSubjectsV23 = renderSubjects;
renderSubjects = function () { paintSubjectsV23(); renderSubjectsV23(); };
const paintPlannerV23 = renderPlanner;
renderPlanner = function () { paintPlannerV23(); renderPlannerV23(); };
const paintCharsV23 = renderChars;
renderChars = function () { paintCharsV23(); renderCharsV23(); };

/* ---------- 36-F. Senhas: modo PIN e limpeza do histórico ---------- */
const paintMakePasswordV23 = makePassword;
makePassword = function (len) {
  const pin = $('#passwordPin');
  if (pin && pin.checked) {
    const digits = '0123456789';
    let out = '';
    for (let i = 0; i < len; i++) out += digits[randomInt(digits.length)];
    return out;
  }
  return paintMakePasswordV23(len);
};
const paintEntropyV23 = entropyOf;
entropyOf = function (text, passphrase) {
  const pin = $('#passwordPin');
  if (pin && pin.checked && !passphrase) return Math.round(text.length * Math.log2(10));
  return paintEntropyV23(text, passphrase);
};
function bindPasswordExtrasV23() {
  const clear = $('#passwordClearHistory');
  if (clear) clear.addEventListener('click', () => {
    passHistory.length = 0;
    renderPasswordHistory();
    toast('Histórico de senhas desta sessão limpo.', 'fa-eraser');
  });
  const pin = $('#passwordPin');
  if (pin) pin.addEventListener('change', () => {
    if (pin.checked) {
      const words = $('#passwordWords'); if (words) words.checked = false;
    }
    toast(pin.checked ? 'Modo PIN: apenas números.' : 'Modo PIN desligado.', 'fa-shield-halved');
  });
  const words = $('#passwordWords');
  if (words) words.addEventListener('change', () => {
    if (words.checked && pin) pin.checked = false;
  });
}

/* ============================================================
   v24.0.0 — CENTRAL ADMINISTRATIVA, CÓDIGOS E AÇÕES RÁPIDAS
   O acesso é restrito por código + Ctrl+Shift+S. O texto do código
   não existe no projeto: só o hash com sal. A central é 100% local.
   ============================================================ */

/* Hash do código de acesso padrão (o texto puro não é armazenado). */
const ADMIN_CODE_HASH = '1at1yiy5gys';
const ADMIN_ARM_KEY = 'geekieAdminArmed_v24';
const ADMIN_SECTIONS = [
  { id: 'overview', label: 'Visão geral', icon: 'fa-gauge-high', kicker: 'Central NEXUS', title: 'Visão geral', sub: 'Estado do hub, atalhos e saúde dos dados.' },
  { id: 'economy', label: 'Economia', icon: 'fa-coins', kicker: 'Economia', title: 'XP, moedas e boosts', sub: 'Ajustes diretos no saldo e nos multiplicadores.' },
  { id: 'progress', label: 'Progresso', icon: 'fa-chart-line', kicker: 'Progresso', title: 'Progresso e desbloqueios', sub: 'Baús, missões, sequência, temas, pets e núcleo.' },
  { id: 'codes', label: 'Códigos', icon: 'fa-key', kicker: 'Códigos', title: 'Códigos e campanhas', sub: 'Catálogo público, histórico e códigos personalizados.' },
  { id: 'backup', label: 'Backup', icon: 'fa-database', kicker: 'Dados', title: 'Backup e restauração', sub: 'Exporte, importe e limpe partes específicas do estado.' },
  { id: 'security', label: 'Segurança', icon: 'fa-fingerprint', kicker: 'Segurança', title: 'Acesso e credenciais', sub: 'Troque o código root e controle a sessão administrativa.' },
  { id: 'tools', label: 'Ferramentas', icon: 'fa-screwdriver-wrench', kicker: 'Ferramentas', title: 'Ferramentas internas', sub: 'Dev Log, paleta, movimento, diagnóstico e atalhos de manutenção.' },
  { id: 'audit', label: 'Auditoria', icon: 'fa-clipboard-list', kicker: 'Auditoria', title: 'Registro de ações', sub: 'As últimas ações administrativas desta conta.' }
];
let adminOpen = false;
let adminSection = 'overview';
let adminLastFocus = null;
let adminClockTimer = null;

function adminHash(raw) {
  const input = 'geekie::v24::' + String(raw == null ? '' : raw).trim().toUpperCase() + '::root';
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}
function adminHashCurrent() { return state.adminCodeHash || ADMIN_CODE_HASH; }
function adminCodeOk(raw) { return !!String(raw == null ? '' : raw).trim() && adminHash(raw) === adminHashCurrent(); }
function adminArmed() {
  try { return sessionStorage.getItem(ADMIN_ARM_KEY) === adminHashCurrent(); } catch (e) { return false; }
}
function adminArm() {
  try { sessionStorage.setItem(ADMIN_ARM_KEY, adminHashCurrent()); } catch (e) { /* sessão bloqueada */ }
  toast('Acesso root reconhecido. Pressione Ctrl+Shift+S.', 'fa-shield-halved');
}
function adminLogger(action, detail) {
  state.adminLog = Array.isArray(state.adminLog) ? state.adminLog : [];
  state.adminLog.unshift({ at: Date.now(), action: String(action || 'Ação'), detail: String(detail || '') });
  state.adminLog = state.adminLog.slice(0, 80);
  save();
}
function adminSessionText() {
  const s = state.session;
  return s ? ('sessão ' + s.name + (s.guest ? ' · convidado' : '')) : 'sem sessão';
}
function adminUpdateClock() {
  const el = $('#adminClock');
  if (el) el.textContent = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const label = $('#adminSessionLabel');
  if (label) label.innerHTML = '<i class="fa-solid fa-circle"></i> ' + esc(adminSessionText());
}

/* ---------- 37-A. Componentes visuais da central ---------- */
function adminStatCard(label, value, sub, icon, tone) {
  return '<div class="admin-stat' + (tone ? ' tone-' + tone : '') + '">' +
    '<span class="admin-stat-label"><i class="fa-solid ' + icon + '"></i> ' + esc(label) + '</span>' +
    '<b class="admin-stat-value">' + esc(value) + '</b>' +
    '<small>' + esc(sub || '') + '</small></div>';
}
function adminCard(title, icon, body, extra) {
  return '<article class="admin-card"><header class="admin-card-head"><h3><i class="fa-solid ' + icon + '"></i> ' + esc(title) + '</h3>' + (extra || '') + '</header>' + body + '</article>';
}
function adminButton(label, action, icon, variant, attrs) {
  return '<button class="btn ' + (variant || 'btn-secondary') + ' btn-sm" type="button" data-admin-action="' + action + '"' + (attrs ? ' ' + attrs : '') + '><i class="fa-solid ' + icon + '"></i> ' + esc(label) + '</button>';
}
function adminKV(rows) {
  return '<div class="admin-kv">' + rows.map((r) => '<div><span>' + esc(r[0]) + '</span><b>' + esc(r[1]) + '</b></div>').join('') + '</div>';
}
function adminStorageKb() {
  try { return Math.max(1, Math.round(JSON.stringify(state).length / 1024)); } catch (e) { return 0; }
}
function adminThemeName(id) {
  const t = THEMES.find((x) => x.id === id);
  return t ? t.name : (id || 'nenhum');
}

/* ---------- 37-B. Visão geral ---------- */
function adminViewOverview() {
  const info = levelInfo(state.xp);
  const todayFocus = state.focusByDate[dateKey()] || 0;
  const due = dueCards().length;
  const cards = Object.values(state.flashStats).reduce((a, b) => a + (Number(b) || 0), 0);
  return '<div class="admin-stats">' +
    adminStatCard('Nível', info.cur.title, state.xp + ' XP · ' + (info.next ? (info.next.xp - state.xp) + ' para o próximo' : 'máximo'), 'fa-star', 'violet') +
    adminStatCard('Moedas', money(state.coins), 'ganhas no total: ' + money(state.coinsEarned || 0), 'fa-coins', 'gold') +
    adminStatCard('Foguinho', computeStreak() + ' dia(s)', 'recorde ' + state.streakBest + ' · ' + (state.streakShields || 0) + '/5 escudos', 'fa-fire', 'fire') +
    adminStatCard('Foco hoje', fmtMinutes(todayFocus), 'total ' + fmtMinutes(totalFocus()) + ' · ' + state.sessions + ' sessões', 'fa-clock', 'cyan') +
    adminStatCard('Revisões', due + ' devidas', cards + ' avaliações no histórico', 'fa-clone', 'cyan') +
    adminStatCard('Núcleo', money(Math.floor(state.clicker.points || 0)) + ' ⚡', (state.clicker.prestige || 0) + ' prestígio(s) · ' + (state.clicker.clicks || 0) + ' cliques', 'fa-bolt', 'gold') +
    adminStatCard('Códigos', REWARDS.length + ' campanhas', state.redeemed.length + ' resgatados · ' + (state.customCodes || []).length + ' personalizados', 'fa-key', 'violet') +
    adminStatCard('Dados', adminStorageKb() + ' KB', TABS.length + ' abas · chave ' + STORAGE_KEY, 'fa-database', '') +
    '</div>' +
    '<div class="admin-two">' +
    adminCard('Sessão e ações', 'fa-user-shield', adminKV([
      ['Conta', (state.session && state.session.name) || 'sem sessão'],
      ['Tipo', state.session && state.session.guest ? 'convidado local' : 'conta local'],
      ['Código root', state.adminCodeHash ? 'personalizado' : 'padrão embutido'],
      ['Sessão root', adminArmed() ? 'armada nesta aba' : 'bloqueada'],
      ['Versão', VERSION]
    ]) + '<div class="admin-actions-row">' + adminButton('Salvar agora', 'save-now', 'fa-floppy-disk') + adminButton('Exportar JSON', 'export-json', 'fa-file-arrow-down') + adminButton('Copiar estado', 'copy-state', 'fa-copy') + '</div>') +
    adminCard('Atalhos internos', 'fa-bolt', '<p class="admin-note">Ações rápidas para inspecionar o hub sem sair da central.</p><div class="admin-actions-row">' +
      adminButton('Ir para economia', 'goto', 'fa-coins', 'btn-secondary', 'data-section="economy"') +
      adminButton('Ir para códigos', 'goto', 'fa-key', 'btn-secondary', 'data-section="codes"') +
      adminButton('Abrir Dev Log', 'open-devlog', 'fa-code-branch') +
      adminButton('Abrir paleta', 'open-palette', 'fa-terminal') +
      adminButton('Recarregar hub', 'reload', 'fa-rotate', 'btn-ghost') +
    '</div><p class="admin-note">O código de acesso nunca aparece nesta tela; só o estado do hash e da sessão.</p>') +
    '</div>';
}

/* ---------- 37-C. Economia ---------- */
function adminViewEconomy() {
  return '<div class="admin-stats admin-stats-3">' +
    adminStatCard('XP atual', money(state.xp), 'nível ' + levelInfo(state.xp).cur.title, 'fa-star', 'violet') +
    adminStatCard('Moedas atuais', money(state.coins), 'total ganho ' + money(state.coinsEarned || 0), 'fa-coins', 'gold') +
    adminStatCard('Boosts', (boostActive('xp') ? 'x2 XP' : '—') + ' · ' + (boostActive('coin') ? '+50%' : '—'), activeBoostsText(), 'fa-flask', 'cyan') +
    '</div>' +
    adminCard('XP', 'fa-star', '<p class="admin-note">Ajuste direto do XP. Para subir de nível com bônus e escudos, prefira as ações normais do hub.</p>' +
      '<div class="admin-inline"><label class="field"><span>Valor</span><input class="input" id="adminXpValue" type="number" value="500" min="-1000000" step="50"></label>' +
      adminButton('Adicionar', 'xp-add', 'fa-plus', 'btn-primary') + adminButton('Definir', 'xp-set', 'fa-equals') + '</div>' +
      '<div class="admin-actions-row">' + adminButton('+100', 'xp-add', 'fa-plus', 'btn-ghost', 'data-amount="100"') + adminButton('+500', 'xp-add', 'fa-plus', 'btn-ghost', 'data-amount="500"') + adminButton('+1.000', 'xp-add', 'fa-plus', 'btn-ghost', 'data-amount="1000"') + adminButton('Zerar XP', 'xp-set', 'fa-eraser', 'btn-danger', 'data-amount="0"') + '</div>') +
    adminCard('Moedas', 'fa-coins', '<p class="admin-note">O saldo nunca fica negativo. Adicionar ou remover aqui não dispara multiplicadores de boost.</p>' +
      '<div class="admin-inline"><label class="field"><span>Valor</span><input class="input" id="adminCoinsValue" type="number" value="500" min="-1000000" step="50"></label>' +
      adminButton('Adicionar', 'coins-add', 'fa-plus', 'btn-primary') + adminButton('Definir', 'coins-set', 'fa-equals') + '</div>' +
      '<div class="admin-actions-row">' + adminButton('+100', 'coins-add', 'fa-plus', 'btn-ghost', 'data-amount="100"') + adminButton('+500', 'coins-add', 'fa-plus', 'btn-ghost', 'data-amount="500"') + adminButton('+1.000', 'coins-add', 'fa-plus', 'btn-ghost', 'data-amount="1000"') + adminButton('Zerar moedas', 'coins-set', 'fa-eraser', 'btn-danger', 'data-amount="0"') + '</div>') +
    adminCard('Boosts de 15 minutos', 'fa-flask', '<p class="admin-note">Ativar de novo estende o tempo restante, igual à Loja.</p><div class="admin-actions-row">' +
      adminButton('Ativar x2 XP', 'boost-xp', 'fa-star', 'btn-primary') + adminButton('Ativar +50% moedas', 'boost-coin', 'fa-coins', 'btn-primary') + adminButton('Encerrar boosts', 'boost-clear', 'fa-ban', 'btn-danger') + '</div>') +
    adminCard('Zona de risco', 'fa-triangle-exclamation', '<p class="admin-note danger-text">Zerar a economia remove XP e moedas de verdade. O progresso de nível, temas e pets não é apagado.</p><div class="admin-actions-row">' + adminButton('Resetar economia', 'reset-economy', 'fa-rotate-left', 'btn-danger') + '</div>');
}

/* ---------- 37-D. Progresso ---------- */
function adminViewProgress() {
  return '<div class="admin-stats admin-stats-3">' +
    adminStatCard('Escudos', (state.streakShields || 0) + '/5', (state.shieldsUsed || 0) + ' usados', 'fa-shield-halved', 'cyan') +
    adminStatCard('Baú de hoje', chestOpenedToday() ? 'aberto' : 'disponível', state.dailyChest.date ? prettyDate(state.dailyChest.date) : 'sem registro', 'fa-gift', 'gold') +
    adminStatCard('Missões', (state.missionClaims || []).length + ' diárias', (state.weeklyClaims || []).length + ' semanais resgatadas', 'fa-flag-checkered', 'violet') +
    '</div>' +
    adminCard('Sequência e escudos', 'fa-fire', '<div class="admin-inline"><label class="field"><span>Escudos (0–5)</span><select class="input" id="adminShields">' + [0, 1, 2, 3, 4, 5].map((n) => '<option value="' + n + '"' + (Number(state.streakShields || 0) === n ? ' selected' : '') + '>' + n + '</option>').join('') + '</select></label>' + adminButton('Aplicar escudos', 'shields-set', 'fa-check', 'btn-primary') + '</div><p class="admin-note">O escudo protege um dia sem foco. A sequência é recalculada a partir dos registros.</p>') +
    adminCard('Recompensas diárias e semanais', 'fa-calendar-check', '<p class="admin-note">Resetar permite testar o baú, as missões do dia e as da semana novamente.</p><div class="admin-actions-row">' +
      adminButton('Resetar baú de hoje', 'reset-chest', 'fa-gift') + adminButton('Resetar missões diárias', 'reset-daily', 'fa-list-check') + adminButton('Resetar missões semanais', 'reset-weekly', 'fa-calendar-week') + adminButton('Resetar foco de hoje', 'reset-today-focus', 'fa-clock', 'btn-danger') + '</div>') +
    adminCard('Desbloqueios', 'fa-lock-open', '<p class="admin-note">Libera todos os temas e pets. Os pets entram com energia inicial 10; o primeiro vira o ativo.</p><div class="admin-actions-row">' +
      adminButton('Liberar todos os temas', 'unlock-themes', 'fa-palette') + adminButton('Liberar todos os pets', 'unlock-pets', 'fa-paw') + adminButton('Re-renderizar tudo', 'refresh-ui', 'fa-rotate') + '</div><p class="admin-note">Temas: ' + state.themesOwned.length + '/' + THEMES.length + ' · Pets: ' + state.petsOwned.length + '/' + PETS.length + '</p>') +
    adminCard('Núcleo do clicker', 'fa-bolt', '<p class="admin-note">Zera energia, melhorias, prestígio, talentos e marcos do núcleo. Moedas e XP continuam intactos.</p><div class="admin-actions-row">' + adminButton('Resetar núcleo', 'reset-clicker', 'fa-rotate-left', 'btn-danger') + '</div>');
}

/* ---------- 37-E. Códigos ---------- */
function adminCodeRow(r, custom) {
  const used = state.redeemed.includes(r.code);
  const expired = r.expires && r.expires < dateKey();
  const prizes = [];
  if (r.coins) prizes.push('+' + money(r.coins) + ' moedas');
  if (r.xp) prizes.push('+' + money(r.xp) + ' XP');
  if (r.energy) prizes.push('+' + money(r.energy) + ' ⚡');
  if (r.theme) prizes.push('tema ' + adminThemeName(r.theme));
  if (r.shield) prizes.push('+' + r.shield + ' escudo');
  return '<div class="admin-code-row' + (used ? ' used' : '') + '">' +
    '<div class="admin-code-main"><b>' + esc(r.code) + '</b><span>' + esc(r.label || r.hint || 'Código') + '</span><small>' + esc(prizes.join(' · ')) + '</small></div>' +
    '<span class="badge ' + (used ? '' : expired ? 'danger' : 'gold') + '">' + (used ? 'resgatado' : expired ? 'expirado' : 'ativo') + '</span>' +
    '<button class="btn btn-icon btn-ghost btn-sm" type="button" data-reward-copy="' + esc(r.code) + '" aria-label="Copiar código ' + esc(r.code) + '"><i class="fa-solid fa-copy"></i></button>' +
    (custom ? '<button class="btn btn-icon btn-ghost btn-sm" type="button" data-admin-action="code-del" data-code="' + esc(r.code) + '" aria-label="Remover código ' + esc(r.code) + '"><i class="fa-solid fa-trash"></i></button>' : '') +
    '</div>';
}
function adminViewCodes() {
  const custom = Array.isArray(state.customCodes) ? state.customCodes : [];
  return '<div class="admin-stats admin-stats-3">' +
    adminStatCard('Campanhas', REWARDS.length, 'códigos públicos do hub', 'fa-gift', 'gold') +
    adminStatCard('Personalizados', custom.length, 'só a central vê esta lista', 'fa-key', 'violet') +
    adminStatCard('Resgates', state.redeemed.length, 'um por conta em cada código', 'fa-circle-check', 'cyan') +
    '</div>' +
    adminCard('Novo código personalizado', 'fa-plus', '<form class="admin-code-form" data-admin-form="custom-code" autocomplete="off">' +
      '<label class="field"><span>Código</span><input class="input" name="code" maxlength="24" placeholder="EX.: TURMA2027" required></label>' +
      '<label class="field"><span>Nome da campanha</span><input class="input" name="label" maxlength="40" placeholder="Código da turma"></label>' +
      '<div class="admin-code-grid"><label class="field"><span>Moedas</span><input class="input" name="coins" type="number" min="0" value="50"></label>' +
      '<label class="field"><span>XP</span><input class="input" name="xp" type="number" min="0" value="75"></label>' +
      '<label class="field"><span>Energia ⚡</span><input class="input" name="energy" type="number" min="0" value="0"></label>' +
      '<label class="field"><span>Escudos</span><input class="input" name="shield" type="number" min="0" max="5" value="0"></label></div>' +
      '<div class="admin-code-grid"><label class="field"><span>Tema</span><select class="input" name="theme"><option value="">Sem tema</option>' + THEMES.map((t) => '<option value="' + esc(t.id) + '">' + esc(t.name) + '</option>').join('') + '</select></label>' +
      '<label class="field"><span>Expira em</span><input class="input" name="expires" type="date" value="2027-12-31"></label></div>' +
      '<div class="admin-actions-row"><button class="btn btn-primary" type="submit"><i class="fa-solid fa-key"></i> Criar código</button>' + adminButton('Limpar histórico de resgates', 'clear-redeemed', 'fa-eraser', 'btn-danger') + '</div>' +
      '<p class="admin-note">Códigos personalizados não aparecem no catálogo público da aba Recompensas; só podem ser resgatados por quem souber o texto. O código root nunca é aceito aqui.</p></form>') +
    adminCard('Códigos personalizados', 'fa-key', custom.length ? custom.map((r) => adminCodeRow(r, true)).join('') : '<div class="empty">Nenhum código personalizado ainda.</div>') +
    adminCard('Campanhas públicas', 'fa-gift', '<p class="admin-note">Estes são os códigos visíveis na aba Recompensas, incluindo as campanhas das v24 e v25.</p>' + REWARDS.map((r) => adminCodeRow(r, false)).join(''));
}

/* ---------- 37-F. Backup, segurança, ferramentas e auditoria ---------- */
function adminViewBackup() {
  return '<div class="admin-stats admin-stats-3">' +
    adminStatCard('Estado', adminStorageKb() + ' KB', 'serializado no localStorage', 'fa-database', 'cyan') +
    adminStatCard('Chave', STORAGE_KEY, 'compatível com v20–v25', 'fa-key', 'violet') +
    adminStatCard('Registros', state.redeemed.length + ' resgates', state.adminLog.length + ' ações admin', 'fa-list', 'gold') +
    '</div>' +
    adminCard('Exportar e copiar', 'fa-file-arrow-down', '<p class="admin-note">O JSON inclui progresso, notas, diário, códigos personalizados e o hash do código root. Guarde-o em local seguro.</p><div class="admin-actions-row">' +
      adminButton('Baixar backup .json', 'export-json', 'fa-file-arrow-down', 'btn-primary') + adminButton('Copiar JSON', 'copy-state', 'fa-copy') + adminButton('Salvar agora', 'save-now', 'fa-floppy-disk') + '</div>') +
    adminCard('Importar backup', 'fa-file-import', '<p class="admin-note">Substitui o estado atual pelo JSON escolhido e recarrega o hub. Contas locais não são alteradas.</p><input type="file" id="adminImportFile" accept=".json,application/json" hidden><div class="admin-actions-row">' + adminButton('Escolher arquivo', 'import-click', 'fa-folder-open', 'btn-primary') + '</div>') +
    adminCard('Limpar domínio específico', 'fa-broom', '<p class="admin-note">Remove só a área escolhida. A operação é imediata e não pode ser desfeita sem backup.</p><div class="admin-inline"><label class="field"><span>Domínio</span><select class="input" id="adminResetDomain"><option value="goals">Metas</option><option value="notes">Notas</option><option value="diary">Diário</option><option value="chat">Chat</option><option value="planner">Planner</option><option value="stats">Estatísticas e foco</option><option value="clicker">Núcleo</option><option value="rewards">Códigos e resgates</option></select></label>' + adminButton('Limpar domínio', 'reset-domain', 'fa-eraser', 'btn-danger') + '</div>') +
    adminCard('Reset total', 'fa-triangle-exclamation', '<p class="admin-note danger-text">Apaga todo o estado do hub neste navegador e recarrega. Exporte um backup antes.</p><div class="admin-actions-row">' + adminButton('Apagar tudo e recarregar', 'hard-reset', 'fa-skull-crossbones', 'btn-danger') + '</div>');
}
function adminViewSecurity() {
  return '<div class="admin-stats admin-stats-3">' +
    adminStatCard('Código root', state.adminCodeHash ? 'personalizado' : 'padrão', 'o texto nunca é exibido', 'fa-fingerprint', 'violet') +
    adminStatCard('Sessão', adminArmed() ? 'armada' : 'bloqueada', 'válida só nesta aba', 'fa-shield-halved', 'cyan') +
    adminStatCard('Atalho', 'Ctrl+Shift+S', 'só responde depois do código', 'fa-keyboard', 'gold') +
    '</div>' +
    adminCard('Trocar o código de acesso', 'fa-key', '<form class="admin-code-form" data-admin-form="admin-code" autocomplete="off">' +
      '<label class="field"><span>Novo código (10–24 caracteres)</span><input class="input" name="newCode" type="password" maxlength="24" required autocomplete="new-password"></label>' +
      '<label class="field"><span>Confirmar novo código</span><input class="input" name="confirmCode" type="password" maxlength="24" required autocomplete="new-password"></label>' +
      '<div class="admin-actions-row"><button class="btn btn-primary" type="submit"><i class="fa-solid fa-floppy-disk"></i> Salvar novo código</button>' + adminButton('Voltar ao código padrão', 'reset-admin-code', 'fa-rotate-left', 'btn-secondary') + '</div>' +
      '<p class="admin-note">O código é guardado como hash com sal e o texto nunca é exibido. Se você esquecer o código personalizado, o reset total e o backup são as saídas; guarde o código fora do navegador.</p></form>') +
    adminCard('Sessão administrativa', 'fa-user-lock', '<p class="admin-note">Bloquear apaga o desbloqueio desta aba. O próximo Ctrl+Shift+S volta a exigir o código.</p><div class="admin-actions-row">' + adminButton('Bloquear agora', 'lock', 'fa-lock', 'btn-danger') + adminButton('Copiar status', 'copy-diag', 'fa-copy') + '</div>') +
    adminCard('Limite importante', 'fa-circle-info', '<p class="admin-note">Este hub é 100% estático: qualquer pessoa com acesso aos arquivos pode inspecionar o JavaScript. O hash evita que o código apareça em texto puro, mas não é autenticação de servidor. Use esta central como trava de conveniência e mantenha um backup.</p>');
}
function adminDiagText() {
  return [
    'Geekie Study Hub ' + VERSION,
    'Conta: ' + adminSessionText(),
    'Abas: ' + TABS.length + ' · páginas: ' + $$('.page').length,
    'Caracteres: ' + CHAR_TOTAL + ' em ' + (CHAR_CATS.length - 1) + ' categorias',
    'Códigos: ' + REWARDS.length + ' públicos · ' + (state.customCodes || []).length + ' personalizados',
    'Resgates: ' + state.redeemed.length + ' · missões: ' + (state.missionClaims || []).length,
    'Estado: ' + adminStorageKb() + ' KB · chave ' + STORAGE_KEY,
    'Código root: ' + (state.adminCodeHash ? 'personalizado' : 'padrão') + ' · sessão ' + (adminArmed() ? 'armada' : 'bloqueada'),
    'Modo reduzido: ' + (state.motionReduced ? 'sim' : 'não') + ' · som: ' + (state.soundEnabled ? 'sim' : 'não'),
    'Dev Log: ' + DEVLOG.length + ' entradas · ' + DEVLOG.filter((d) => d.version === VERSION).length + ' nesta versão'
  ].join('\n');
}
function adminViewTools() {
  return '<div class="admin-two">' +
    adminCard('Navegação interna', 'fa-compass', '<p class="admin-note">Abre uma aba do hub e fecha a central para devolver o foco à página.</p><div class="admin-inline"><label class="field"><span>Abrir aba</span><select class="input" id="adminTabSelect">' + TABS.map((t) => '<option value="' + t.id + '">' + esc(t.title) + '</option>').join('') + '</select></label>' + adminButton('Abrir', 'open-tab', 'fa-arrow-right', 'btn-primary') + '</div><div class="admin-actions-row">' + adminButton('Dev Log', 'open-devlog', 'fa-code-branch') + adminButton('Últimas 3', 'open-devlog-recent', 'fa-clock-rotate-left') + adminButton('Paleta', 'open-palette', 'fa-terminal') + '</div>') +
    adminCard('Preferências', 'fa-sliders', '<div class="admin-actions-row">' + adminButton('Movimento', 'toggle-motion', 'fa-wand-magic-sparkles') + adminButton('Som', 'toggle-sound', 'fa-volume-high') + adminButton('Tema', 'apply-theme', 'fa-palette') + '</div><div class="admin-inline"><label class="field"><span>Tema</span><select class="input" id="adminThemeSelect">' + THEMES.map((t) => '<option value="' + t.id + '"' + (state.theme === t.id ? ' selected' : '') + '>' + esc(t.name) + '</option>').join('') + '</select></label></div><div class="admin-actions-row">' + adminButton('Rever novidades', 'clear-seen', 'fa-eye') + adminButton('Recarregar', 'reload', 'fa-rotate') + '</div>') +
    '</div>' +
    adminCard('Diagnóstico', 'fa-stethoscope', '<pre class="admin-diag" id="adminDiagOut">' + esc(adminDiagText()) + '</pre><div class="admin-actions-row">' + adminButton('Atualizar diagnóstico', 'refresh-diag', 'fa-rotate') + adminButton('Copiar diagnóstico', 'copy-diag', 'fa-copy') + '</div>');
}
function adminViewAudit() {
  const log = Array.isArray(state.adminLog) ? state.adminLog : [];
  return '<div class="admin-stats admin-stats-3">' +
    adminStatCard('Ações registradas', log.length, 'limite de 80 entradas', 'fa-clipboard-list', 'violet') +
    adminStatCard('Última ação', log[0] ? new Date(log[0].at).toLocaleTimeString('pt-BR') : '—', log[0] ? log[0].action : 'nenhuma', 'fa-clock', 'cyan') +
    adminStatCard('Sessão', adminArmed() ? 'armada' : 'bloqueada', adminSessionText(), 'fa-user-shield', 'gold') +
    '</div>' +
    adminCard('Histórico', 'fa-list', log.length ? log.map((l) => '<div class="admin-log-item"><span class="admin-log-time">' + esc(new Date(l.at).toLocaleString('pt-BR')) + '</span><b>' + esc(l.action) + '</b><small>' + esc(l.detail) + '</small></div>').join('') : '<div class="empty">Nenhuma ação registrada ainda.</div>',
      '<div class="row">' + adminButton('Copiar', 'audit-copy', 'fa-copy') + adminButton('Limpar', 'audit-clear', 'fa-broom', 'btn-danger') + '</div>');
}

/* ---------- 37-G. Roteador da central ---------- */
function adminSectionInfo(id) { return ADMIN_SECTIONS.find((s) => s.id === id) || ADMIN_SECTIONS[0]; }
function buildAdminNav() {
  const nav = $('#adminNav');
  if (!nav) return;
  nav.innerHTML = ADMIN_SECTIONS.map((s, i) => '<button class="admin-nav-item" type="button" data-admin-section="' + s.id + '" style="--i:' + i + '" title="' + esc(s.label) + '" aria-label="' + esc(s.label) + '"><i class="fa-solid ' + s.icon + '"></i><span class="admin-nav-text">' + esc(s.label) + '</span><span class="admin-nav-pip" aria-hidden="true"></span></button>').join('');
  syncAdminNav();
}
function syncAdminNav() {
  $$('#adminNav .admin-nav-item').forEach((b) => {
    const active = b.dataset.adminSection === adminSection;
    b.classList.toggle('active', active);
    if (active) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
}
function renderAdminSection(id) {
  adminSection = adminSectionInfo(id || adminSection).id;
  const info = adminSectionInfo(adminSection);
  const kicker = $('#adminKicker'); if (kicker) kicker.textContent = info.kicker;
  const title = $('#adminTitle'); if (title) title.textContent = info.title;
  const sub = $('#adminSub'); if (sub) sub.textContent = info.sub;
  const box = $('#adminContent');
  if (!box) return;
  const views = { overview: adminViewOverview, economy: adminViewEconomy, progress: adminViewProgress, codes: adminViewCodes, backup: adminViewBackup, security: adminViewSecurity, tools: adminViewTools, audit: adminViewAudit };
  const view = views[adminSection] || adminViewOverview;
  box.innerHTML = view();
  box.scrollTop = 0;
  syncAdminNav();
  applyAdminRail();
  adminUpdateClock();
}
function applyAdminRail() {
  const shell = $('#adminShell');
  const btn = $('#adminRailToggle');
  const collapsed = !!state.adminRailCollapsed;
  if (shell) shell.classList.toggle('rail-collapsed', collapsed);
  if (btn) {
    btn.setAttribute('aria-pressed', String(collapsed));
    const label = collapsed ? 'Expandir seções da central' : 'Recolher seções (só ícones)';
    btn.title = label;
    btn.setAttribute('aria-label', label);
  }
  $$('#adminNav .admin-nav-item').forEach((item) => {
    const s = adminSectionInfo(item.dataset.adminSection);
    item.title = collapsed ? s.label : '';
  });
}
function toggleAdminRail() {
  state.adminRailCollapsed = !state.adminRailCollapsed;
  applyAdminRail();
  save();
  const btn = $('#adminRailToggle');
  if (btn && !state.motionReduced) {
    btn.classList.remove('is-flipping');
    void btn.offsetWidth;
    btn.classList.add('is-flipping');
    setTimeout(() => btn.classList.remove('is-flipping'), 600);
  }
}

/* ---------- 37-H. Abrir, fechar e foco ---------- */
function openAdmin() {
  if (adminOpen || !adminArmed()) return;
  if (!state.session) return;
  const overlay = $('#adminOverlay');
  const app = $('#app');
  if (!overlay || !app || app.hidden) return;
  hideCharPreviewV24();
  const rewardField = $('#rewardInput');
  if (rewardField && adminCodeOk(rewardField.value)) rewardField.value = '';
  adminLastFocus = document.activeElement;
  adminOpen = true;
  adminSection = 'overview';
  buildAdminNav();
  renderAdminSection('overview');
  overlay.hidden = false;
  document.body.classList.add('admin-open');
  applyAdminRail();
  try { app.inert = true; } catch (e) { /* navegador antigo */ }
  app.setAttribute('aria-hidden', 'true');
  const shell = $('#adminShell');
  if (shell && !state.motionReduced) {
    shell.style.animation = 'none';
    void shell.offsetWidth;
    shell.style.animation = '';
    const content = $('#adminContent');
    if (content) content.classList.remove('admin-content-in');
    if (content) { void content.offsetWidth; content.classList.add('admin-content-in'); }
  }
  adminLogger('Central aberta', adminSessionText());
  adminUpdateClock();
  clearInterval(adminClockTimer);
  adminClockTimer = setInterval(adminUpdateClock, 1000);
  setTimeout(() => { const c = $('#adminCloseBtn'); if (c) c.focus(); }, 80);
}
function closeAdmin(noFocus) {
  if (!adminOpen) return;
  adminOpen = false;
  const overlay = $('#adminOverlay');
  const app = $('#app');
  if (overlay) overlay.hidden = true;
  document.body.classList.remove('admin-open');
  if (app) {
    try { app.inert = false; } catch (e) { /* ignore */ }
    app.removeAttribute('aria-hidden');
  }
  clearInterval(adminClockTimer);
  adminClockTimer = null;
  if (!noFocus && adminLastFocus && document.contains(adminLastFocus)) {
    setTimeout(() => { try { adminLastFocus.focus(); } catch (e) { /* ignore */ } }, 30);
  }
  adminLastFocus = null;
}
function adminLock() {
  const rewardField = $('#rewardInput');
  if (rewardField && adminCodeOk(rewardField.value)) rewardField.value = '';
  try { sessionStorage.removeItem(ADMIN_ARM_KEY); } catch (e) { /* ignore */ }
  adminLogger('Sessão bloqueada', 'Desbloqueio removido desta aba');
  saveNow();
  closeAdmin(true);
  toast('Sessão administrativa bloqueada. Ctrl+Shift+S exige o código novamente.', 'fa-lock');
}

/* ---------- 37-I. Ações da central ---------- */
function adminActionAmount(btn, sel) {
  if (btn && btn.dataset.amount != null) return Number(btn.dataset.amount) || 0;
  const el = $(sel);
  const n = Number(el && el.value);
  return isFinite(n) ? n : 0;
}
function adminCommit(action, detail, section) {
  adminLogger(action, detail);
  saveNow();
  adminSyncUi();
  renderAdminSection(section || adminSection);
  toast(detail || 'Ação aplicada.', 'fa-shield-halved');
}
function adminSyncUi() {
  try { renderTopbar(); } catch (e) { /* ignore */ }
  try { renderAll(); } catch (e) { /* ignore */ }
  try { if (typeof renderV23All === 'function') renderV23All(); } catch (e) { /* ignore */ }
  const id = state.currentTab;
  if (id && RENDERERS[id]) { try { RENDERERS[id](); } catch (e) { console.error('Admin: falha ao renderizar ' + id, e); } }
  if (id === 'rewards') { try { renderRewards(); } catch (e) { /* ignore */ } }
  if (id === 'titles') { try { renderTitles(); } catch (e) { /* ignore */ } }
  if (id === 'pets') { try { renderPets(); } catch (e) { /* ignore */ } }
  if (id === 'clicker') { try { renderClickerShop(); renderClickerHud(); renderClickerExtras(); } catch (e) { /* ignore */ } }
}
function adminRun(action, btn) {
  const amount = adminActionAmount(btn, action.startsWith('coins') ? '#adminCoinsValue' : '#adminXpValue');
  switch (action) {
    case 'save-now': saveNow(); adminLogger('Gravação forçada', 'Estado salvo manualmente'); toast('Estado salvo agora.', 'fa-floppy-disk'); return;
    case 'export-json': download('geekie-progresso.json', JSON.stringify(state, null, 2), 'application/json'); adminLogger('Backup exportado', 'geekie-progresso.json'); toast('Backup exportado.', 'fa-file-arrow-down'); return;
    case 'copy-state': copyText(JSON.stringify(state, null, 2)).then((ok) => toast(ok ? 'JSON copiado.' : 'Não foi possível copiar.', 'fa-copy', !ok)); return;
    case 'goto': renderAdminSection(btn && btn.dataset.section); return;
    case 'open-devlog': closeAdmin(true); switchTab('devlog'); renderDevlog(); return;
    case 'open-devlog-recent': closeAdmin(true); openDevlogRecent(); return;
    case 'open-palette': closeAdmin(true); openPalette(); return;
    case 'reload': saveNow(); location.reload(); return;
    case 'xp-add': { const v = amount; state.xp = clamp(Math.round(state.xp + v), 0, 9999999); adminCommit('XP ajustado', (v >= 0 ? '+' : '') + money(v) + ' XP · total ' + money(state.xp), 'economy'); return; }
    case 'xp-set': { const v = asyncNumber(amount); state.xp = clamp(Math.round(v), 0, 9999999); adminCommit('XP definido', 'XP agora é ' + money(state.xp), 'economy'); return; }
    case 'coins-add': { const v = amount; state.coins = Math.max(0, state.coins + Math.round(v)); adminCommit('Moedas ajustadas', (v >= 0 ? '+' : '') + money(v) + ' moedas · saldo ' + money(state.coins), 'economy'); return; }
    case 'coins-set': { const v = asyncNumber(amount); state.coins = Math.max(0, Math.round(v)); adminCommit('Moedas definidas', 'Saldo agora é ' + money(state.coins), 'economy'); return; }
    case 'boost-xp': state.boosts.xpUntil = Math.max(Date.now(), Number(state.boosts.xpUntil) || 0) + 15 * 60000; adminCommit('Boost de XP ativado', 'x2 XP por 15 minutos', 'economy'); return;
    case 'boost-coin': state.boosts.coinUntil = Math.max(Date.now(), Number(state.boosts.coinUntil) || 0) + 15 * 60000; adminCommit('Boost de moedas ativado', '+50% moedas por 15 minutos', 'economy'); return;
    case 'boost-clear': state.boosts.xpUntil = 0; state.boosts.coinUntil = 0; adminCommit('Boosts encerrados', 'Nenhum multiplicador ativo', 'economy'); return;
    case 'reset-economy': if (!confirm('Zerar XP e moedas? Esta ação não afeta temas, pets ou títulos já equipados.')) return; state.xp = 0; state.coins = 25; adminCommit('Economia resetada', 'XP 0 e 25 moedas', 'economy'); return;
    case 'shields-set': state.streakShields = clamp(Number((($('#adminShields') || {}).value) || 0), 0, 5); adminCommit('Escudos ajustados', state.streakShields + ' escudo(s)', 'progress'); return;
    case 'reset-chest': state.dailyChest = Object.assign({}, DEFAULT_STATE.dailyChest); adminCommit('Baú resetado', 'O baú de hoje pode ser aberto de novo', 'progress'); return;
    case 'reset-daily': state.missionClaims = []; state.dailyStats.missions = 0; adminCommit('Missões diárias resetadas', 'Resgates de hoje liberados', 'progress'); return;
    case 'reset-weekly': state.weeklyClaims = []; state.weeklyStats = Object.assign({}, DEFAULT_STATE.weeklyStats, { week: weekStartKey() }); adminCommit('Missões semanais resetadas', 'Resgates da semana liberados', 'progress'); return;
    case 'reset-today-focus': if (!confirm('Apagar o foco registrado hoje? Sessões e XP já ganhos não são revertidos.')) return; delete state.focusByDate[dateKey()]; adminCommit('Foco de hoje apagado', 'Registro de ' + prettyDate(dateKey()) + ' removido', 'progress'); return;
    case 'unlock-themes': THEMES.forEach((t) => { if (!state.themesOwned.includes(t.id)) state.themesOwned.push(t.id); }); adminCommit('Temas liberados', state.themesOwned.length + ' de ' + THEMES.length + ' temas', 'progress'); return;
    case 'unlock-pets': PETS.forEach((p) => { if (!state.petsOwned.includes(p.id)) { state.petsOwned.push(p.id); state.petEnergy[p.id] = state.petEnergy[p.id] || 10; } }); if (!state.pet) state.pet = PETS[0].id; adminCommit('Pets liberados', state.petsOwned.length + ' de ' + PETS.length + ' pets', 'progress'); return;
    case 'reset-clicker': if (!confirm('Zerar energia, melhorias, prestígio, talentos e marcos do núcleo?')) return; state.clicker = JSON.parse(JSON.stringify(DEFAULT_STATE.clicker)); adminCommit('Núcleo resetado', 'O clicker voltou ao estado inicial', 'progress'); return;
    case 'refresh-ui': adminSyncUi(); renderAdminSection(adminSection); toast('Interface atualizada.', 'fa-rotate'); return;
    case 'code-del': { const code = btn && btn.dataset.code; if (!code || !confirm('Remover o código ' + code + '?')) return; state.customCodes = (state.customCodes || []).filter((c) => c.code !== code); state.redeemed = (state.redeemed || []).filter((c) => c !== code); adminCommit('Código removido', code, 'codes'); return; }
    case 'clear-redeemed': if (!confirm('Limpar o histórico de resgates? Os códigos voltam a poder ser usados.')) return; state.redeemed = []; adminCommit('Histórico de resgates limpo', 'Todos os códigos podem ser resgatados novamente', 'codes'); return;
    case 'import-click': { const f = $('#adminImportFile'); if (f) f.click(); return; }
    case 'reset-domain': { const domain = (($('#adminResetDomain') || {}).value) || ''; if (!domain) return; if (!confirm('Limpar o domínio ' + domain + '? Faça backup antes.')) return; adminResetDomain(domain); adminCommit('Domínio limpo', domain, 'backup'); return; }
    case 'hard-reset': if (!confirm('Apagar TODO o progresso deste navegador?')) return; if (!confirm('Confirma de novo? O backup é a única forma de voltar.')) return; cancelSave(); try { localStorage.removeItem(STORAGE_KEY); LEGACY_KEYS.forEach((k) => localStorage.removeItem(k)); sessionStorage.removeItem(ADMIN_ARM_KEY); } catch (e) { /* ignore */ } location.reload(); return;
    case 'reset-admin-code': if (!confirm('Voltar ao código de acesso padrão? O código personalizado deixa de funcionar.')) return; state.adminCodeHash = ''; try { sessionStorage.setItem(ADMIN_ARM_KEY, adminHashCurrent()); } catch (e) { /* ignore */ } adminCommit('Código root restaurado', 'O código padrão voltou a valer', 'security'); return;
    case 'lock': adminLock(); return;
    case 'copy-diag': copyText(adminDiagText()).then((ok) => toast(ok ? 'Diagnóstico copiado.' : 'Não foi possível copiar.', 'fa-copy', !ok)); return;
    case 'refresh-diag': { const pre = $('#adminDiagOut'); if (pre) pre.textContent = adminDiagText(); toast('Diagnóstico atualizado.', 'fa-stethoscope'); return; }
    case 'open-tab': { const id = (($('#adminTabSelect') || {}).value) || 'hoje'; closeAdmin(true); switchTab(TAB_MAP[id] ? id : 'hoje'); return; }
    case 'apply-theme': { const id = (($('#adminThemeSelect') || {}).value) || state.theme; applyTheme(id); adminCommit('Tema aplicado', adminThemeName(id), 'tools'); return; }
    case 'toggle-motion': state.motionReduced = !state.motionReduced; applyMotion(); saveNow(); adminCommit('Movimento alternado', state.motionReduced ? 'animações reduzidas' : 'animações ativas', 'tools'); return;
    case 'toggle-sound': state.soundEnabled = !state.soundEnabled; saveNow(); adminCommit('Som alternado', state.soundEnabled ? 'sons ativos' : 'sons desligados', 'tools'); return;
    case 'clear-seen': try { localStorage.removeItem(SEEN_KEY); } catch (e) { /* ignore */ } adminLogger('Novidades reabertas', 'Chave de versão limpa'); toast('O aviso de novidades volta no próximo carregamento.', 'fa-eye'); return;
    case 'audit-clear': if (!confirm('Limpar o registro de auditoria?')) return; state.adminLog = []; adminCommit('Auditoria limpa', 'Histórico de ações apagado', 'audit'); return;
    case 'audit-copy': copyText((state.adminLog || []).map((l) => new Date(l.at).toLocaleString('pt-BR') + ' · ' + l.action + ' · ' + l.detail).join('\n')).then((ok) => toast(ok ? 'Auditoria copiada.' : 'Não foi possível copiar.', 'fa-copy', !ok)); return;
    default: return;
  }
}
/* Converte valores com segurança sem transformar vazio em zero acidental. */
function asyncNumber(v) { const n = Number(v); return isFinite(n) ? n : 0; }
function adminResetDomain(domain) {
  if (domain === 'goals') { state.goals = []; state.totalGoalsDone = 0; }
  else if (domain === 'notes') { state.notes = {}; state.noteOrder = []; state.currentNote = null; }
  else if (domain === 'diary') { state.diary = {}; state.diaryDrafts = {}; }
  else if (domain === 'chat') { state.chatHistory = []; }
  else if (domain === 'planner') { state.planner = {}; }
  else if (domain === 'stats') {
    state.focusByDate = {}; state.subjectMinutes = {}; state.subjectLog = []; state.sessions = 0; state.pomoSessions = 0;
    state.checkins = {}; state.streakProtect = {}; state.streakBest = 0; state.shieldsUsed = 0;
    state.dailyStats = Object.assign({}, DEFAULT_STATE.dailyStats, { date: dateKey() });
  } else if (domain === 'clicker') {
    state.clicker = JSON.parse(JSON.stringify(DEFAULT_STATE.clicker));
  } else if (domain === 'rewards') {
    state.redeemed = []; state.customCodes = [];
  }
  saveNow();
  adminSyncUi();
}
function adminHandleSubmit(form) {
  if (!form) return;
  if (form.dataset.adminForm === 'custom-code') {
    const get = (name) => { const el = form.querySelector('[name="' + name + '"]'); return el ? el.value : ''; };
    const code = String(get('code')).trim().toUpperCase().replace(/\s+/g, '');
    if (!/^[A-Z0-9_-]{4,24}$/.test(code)) return toast('Use 4 a 24 caracteres: A–Z, 0–9, _ ou -.', 'fa-triangle-exclamation', true);
    if (adminCodeOk(code)) return toast('Esse texto é reservado para o acesso root.', 'fa-shield-halved', true);
    if (rewardPool().some((r) => r.code === code)) return toast('Já existe um código com esse texto.', 'fa-key', true);
    const expires = get('expires') || '2099-12-31';
    const theme = get('theme') || '';
    state.customCodes = state.customCodes || [];
    state.customCodes.unshift({
      code: code,
      label: String(get('label') || 'Código personalizado').trim().slice(0, 40),
      coins: clamp(Math.round(Number(get('coins')) || 0), 0, 1000000),
      xp: clamp(Math.round(Number(get('xp')) || 0), 0, 1000000),
      energy: clamp(Math.round(Number(get('energy')) || 0), 0, 100000000),
      shield: clamp(Math.round(Number(get('shield')) || 0), 0, 5),
      theme: THEMES.some((t) => t.id === theme) ? theme : '',
      hint: 'Código criado na central administrativa',
      expires: expires,
      createdAt: Date.now(),
      custom: true
    });
    adminCommit('Código personalizado criado', code, 'codes');
    return;
  }
  if (form.dataset.adminForm === 'admin-code') {
    const a = (form.querySelector('[name="newCode"]') || {}).value || '';
    const b = (form.querySelector('[name="confirmCode"]') || {}).value || '';
    if (a.length < 10) return toast('O código precisa de pelo menos 10 caracteres.', 'fa-shield-halved', true);
    if (a.length > 24) return toast('Use no máximo 24 caracteres.', 'fa-shield-halved', true);
    if (a !== b) return toast('Os códigos não coincidem.', 'fa-triangle-exclamation', true);
    if (rewardPool().some((r) => r.code === a.trim().toUpperCase())) return toast('Esse texto já é um código de recompensa.', 'fa-key', true);
    if (adminCodeOk(a)) return toast('Esse já é o código atual.', 'fa-key', true);
    state.adminCodeHash = adminHash(a);
    try { sessionStorage.setItem(ADMIN_ARM_KEY, state.adminCodeHash); } catch (e) { /* ignore */ }
    adminCommit('Código root alterado', 'Novo hash salvo; a sessão atual continua armada', 'security');
  }
}
function adminImportBackup(file) {
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) return toast('Backup grande demais (máx. 5 MB).', 'fa-triangle-exclamation', true);
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result || ''));
      if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('formato');
      if (!confirm('Substituir o estado atual pelo backup ' + file.name + '? O hub será recarregado.')) return;
      cancelSave();
      data.adminLog = Array.isArray(data.adminLog) ? data.adminLog : [];
      data.adminLog.unshift({ at: Date.now(), action: 'Backup importado', detail: file.name });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      toast('Backup importado. Recarregando…', 'fa-file-import');
      setTimeout(() => location.reload(), 650);
    } catch (e) {
      toast('JSON inválido ou corrompido.', 'fa-triangle-exclamation', true);
    }
  };
  reader.onerror = () => toast('Não foi possível ler o arquivo.', 'fa-triangle-exclamation', true);
  reader.readAsText(file);
}

/* ---------- 37-J. Preview flutuante dos caracteres ---------- */
let charPreviewLastX = 0;
let charPreviewHideTimer = null;
let charPreviewShownChar = '';
function showCharPreviewV24(btn) {
  const el = $('#charHoverPreview');
  if (!el || !btn) return;
  const ch = btn.dataset.char;
  const item = findChar(ch);
  if (!item) return;
  clearTimeout(charPreviewHideTimer);
  const wasVisible = el.classList.contains('show');
  if (wasVisible && charPreviewShownChar === ch) return;
  charPreviewShownChar = ch;
  const rect = btn.getBoundingClientRect();
  const width = 244;
  const height = 106;
  const gap = 12;
  let x = rect.right + gap;
  if (x + width > window.innerWidth - 8) x = rect.left - width - gap;
  x = clamp(x, 8, Math.max(8, window.innerWidth - width - 8));
  const y = clamp(rect.top + rect.height / 2 - height / 2, 8, Math.max(8, window.innerHeight - height - 8));
  const dir = rect.left >= charPreviewLastX ? 1 : -1;
  charPreviewLastX = rect.left;
  el.style.setProperty('--chp-x', x.toFixed(1) + 'px');
  el.style.setProperty('--chp-y', y.toFixed(1) + 'px');
  el.style.setProperty('--chp-shift', (dir * 10) + 'px');
  const fav = state.charsFav.indexOf(ch) !== -1;
  el.innerHTML = '<div class="chp-card">' +
    '<span class="chp-glyph">' + esc(ch) + '</span>' +
    '<div class="chp-copy"><b class="chp-name">' + esc(item.name) + '</b>' +
    '<span class="chp-meta">' + esc(item.cat) + ' · ' + charCode(ch) + '</span>' +
    '<span class="chp-hint">clique copia · Shift+clique favorita</span></div>' +
    (fav ? '<i class="fa-solid fa-star chp-fav" aria-label="favorito"></i>' : '') + '</div>';
  el.setAttribute('aria-hidden', 'false');
  el.classList.add('show', 'open');
  if (wasVisible) {
    el.classList.remove('swap');
    void el.offsetWidth;
    el.classList.add('swap');
  } else {
    el.classList.remove('swap');
    void el.offsetWidth;
  }
}
function hideCharPreviewV24() {
  clearTimeout(charPreviewHideTimer);
  charPreviewShownChar = '';
  const el = $('#charHoverPreview');
  if (!el) return;
  el.classList.remove('show', 'open', 'swap');
  el.setAttribute('aria-hidden', 'true');
}
function scheduleHideCharPreviewV24() {
  clearTimeout(charPreviewHideTimer);
  charPreviewHideTimer = setTimeout(hideCharPreviewV24, 110);
}
function bindCharPreviewV24() {
  const page = document.getElementById('page-chars');
  if (!page || page.dataset.v24Preview === '1') return;
  page.dataset.v24Preview = '1';
  page.addEventListener('pointerover', (e) => {
    const b = e.target.closest('.char-btn[data-char]');
    if (!b || (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen')) return;
    showCharPreviewV24(b);
  });
  page.addEventListener('pointerout', (e) => {
    const b = e.target.closest('.char-btn[data-char]');
    if (!b) return;
    if (e.relatedTarget && b.contains(e.relatedTarget)) return;
    scheduleHideCharPreviewV24();
  });
  page.addEventListener('focusin', (e) => {
    const b = e.target.closest('.char-btn[data-char]');
    if (b) showCharPreviewV24(b);
  });
  page.addEventListener('focusout', (e) => {
    if (e.target.closest('.char-btn[data-char]')) scheduleHideCharPreviewV24();
  });
  page.addEventListener('click', (e) => {
    if (e.target.closest('.char-btn[data-char]')) hideCharPreviewV24();
  });
  window.addEventListener('resize', hideCharPreviewV24, { passive: true });
  document.addEventListener('scroll', hideCharPreviewV24, true);
}

/* ---------- 37-K. Ações rápidas em todas as 28 abas ---------- */
const V24_ACTIONS = {
  hoje: [{ label: 'Resumo do dia', action: 'day-summary', icon: 'fa-clipboard-list' }, { label: 'Foco 5 min', action: 'focus-5', icon: 'fa-play' }],
  timer: [{ label: 'Foco 10 min', action: 'focus-10', icon: 'fa-bolt' }, { label: 'Foco 50 min', action: 'focus-50', icon: 'fa-fire' }],
  goals: [{ label: 'Exportar metas .md', action: 'goals-export', icon: 'fa-file-arrow-down' }],
  flashcards: [{ label: 'Reiniciar baralho', action: 'flash-reset', icon: 'fa-rotate-left' }, { label: 'Exportar CSV', action: 'flash-export', icon: 'fa-file-csv' }],
  quiz: [{ label: 'Copiar últimos quizzes', action: 'quiz-copy', icon: 'fa-copy' }],
  subjects: [{ label: 'Copiar sessões', action: 'subjects-copy', icon: 'fa-copy' }],
  planner: [{ label: 'Copiar semana .md', action: 'planner-copy', icon: 'fa-copy' }],
  stats: [{ label: 'Copiar relatório', action: 'stats-copy', icon: 'fa-chart-simple' }],
  diary: [{ label: 'Copiar últimos 7 dias', action: 'diary-copy', icon: 'fa-copy' }],
  chat: [{ label: 'Limpar conversa', action: 'chat-clear', icon: 'fa-broom' }],
  commands: [{ label: 'Copiar saída', action: 'cmd-copy', icon: 'fa-copy' }],
  store: [{ label: 'Tema aleatório', action: 'theme-random', icon: 'fa-shuffle' }],
  titles: [{ label: 'Título aleatório', action: 'title-random', icon: 'fa-crown' }],
  pets: [{ label: 'Alimentar todos', action: 'pets-feed-all', icon: 'fa-bowl-food' }],
  journey: [{ label: 'Copiar progresso', action: 'journey-copy', icon: 'fa-copy' }],
  rebirth: [{ label: 'Renascencer', action: 'rebirth-run', icon: 'fa-rocket' }, { label: 'Copiar histórico', action: 'rebirth-copy', icon: 'fa-copy' }],
  clicker: [{ label: 'Copiar status', action: 'clicker-copy', icon: 'fa-bolt' }],
  rewards: [{ label: 'Copiar códigos ativos', action: 'rewards-copy', icon: 'fa-key' }],
  notes: [{ label: 'Exportar todas .md', action: 'notes-export', icon: 'fa-file-arrow-down' }],
  ambient: [{ label: 'Silenciar tudo', action: 'ambient-stop', icon: 'fa-volume-xmark' }],
  keysounds: [{ label: 'Estilo aleatório', action: 'keysound-random', icon: 'fa-shuffle' }],
  calculator: [{ label: 'Copiar histórico', action: 'calc-copy', icon: 'fa-copy' }],
  chars: [{ label: 'Copiar favoritos', action: 'chars-copy-favs', icon: 'fa-star' }],
  title: [{ label: 'Copiar configuração', action: 'title-copy', icon: 'fa-copy' }],
  password: [{ label: 'Copiar última senha', action: 'pass-copy', icon: 'fa-copy' }],
  geekie: [{ label: 'Abrir em nova aba', action: 'portal-open', icon: 'fa-arrow-up-right-from-square' }],
  google: [{ label: 'Abrir em nova aba', action: 'portal-open', icon: 'fa-arrow-up-right-from-square' }],
  events: [{ label: 'Copiar evento', action: 'event-copy', icon: 'fa-calendar-day' }],
  devlog: [{ label: 'Exportar Dev Log .md', action: 'devlog-export', icon: 'fa-file-arrow-down' }]
};
function buildV24Quickbars() {
  $$('.page[data-tab]').forEach((page) => {
    if ($('.v24-quickbar', page)) return;
    const id = page.dataset.tab;
    const actions = V24_ACTIONS[id];
    if (!actions || !actions.length) return;
    const card = document.createElement('article');
    card.className = 'card v24-quickbar';
    card.innerHTML = '<div class="card-head"><h3><i class="fa-solid fa-bolt"></i> Ações rápidas</h3><span class="badge">v24 · v25</span></div>' +
      '<div class="row v24-quick-actions">' + actions.map((a) => '<button class="btn btn-secondary btn-sm" type="button" data-v24-action="' + a.action + '"><i class="fa-solid ' + a.icon + '"></i> ' + esc(a.label) + '</button>').join('') + '</div>' +
      '<p class="hint">Atalhos desta aba, sem sair do fluxo.</p>';
    page.appendChild(card);
  });
}
function v24Copy(text, okMessage) {
  if (!text) { toast('Nada para copiar ainda.', 'fa-copy', true); return; }
  copyText(text).then((ok) => toast(ok ? okMessage : 'Não foi possível copiar.', ok ? 'fa-copy' : 'fa-triangle-exclamation', !ok));
}
function v24DaySummary() {
  const info = levelInfo(state.xp);
  const pending = state.goals.filter((g) => !g.done).length;
  const due = dueCards().length;
  return ['Geekie · resumo de ' + prettyDate(dateKey()),
    'Foco hoje: ' + fmtMinutes(state.focusByDate[dateKey()] || 0) + ' de 60 min',
    'Foguinho: ' + computeStreak() + ' dia(s) · ' + streakTier().name + ' (x' + streakTier().mult + ')',
    'Metas pendentes: ' + pending + ' · revisões devidas: ' + due,
    'Nível: ' + info.cur.title + ' · ' + state.xp + ' XP' + (info.next ? ' · faltam ' + (info.next.xp - state.xp) : ''),
    'Moedas: ' + money(state.coins)].join('\n');
}
function v24StartFocus(min) {
  if (pomo.running) { toast('Já existe um ciclo rodando.', 'fa-clock', true); return; }
  state.pomoConfig.focus = clamp(Number(min) || 25, 5, 90);
  save();
  switchTab('timer');
  pomoSetMode('focus');
  renderTimer();
  pomoStart();
}
function v24GoalsMarkdown() {
  const list = state.goals.slice().sort((a, b) => (a.done ? 1 : 0) - (b.done ? 1 : 0) || (a.due || '9999').localeCompare(b.due || '9999'));
  if (!list.length) return '';
  return '# Metas Geekie\n\n' + list.map((g) => '- [' + (g.done ? 'x' : ' ') + '] **' + g.text + '** · ' + (g.subject || 'Geral') + ' · ' + g.priority + (g.due ? ' · ' + g.due : '')).join('\n');
}
function v24PlannerText() {
  const days = plannerDays();
  let md = '# Planner Geekie\n\n';
  let blocks = 0;
  days.forEach((d) => {
    const plan = state.planner[dateKey(d)] || {};
    const lines = PLANNER_SLOTS.map((slot, i) => plan[String(i)] ? '- **' + slot + '** — ' + plan[String(i)] : '').filter(Boolean);
    if (!lines.length) return;
    blocks += lines.length;
    md += '## ' + WEEK_FULL[d.getDay()] + ', ' + d.getDate() + '/' + pad(d.getMonth() + 1) + '\n' + lines.join('\n') + '\n\n';
  });
  return blocks ? md : '';
}
function v24NotesMarkdown() {
  const ids = state.noteOrder.slice();
  Object.keys(state.notes).forEach((id) => { if (ids.indexOf(id) === -1) ids.push(id); });
  const notes = ids.map((id) => state.notes[id]).filter(Boolean);
  if (!notes.length) return '';
  return '# Notas Geekie\n\n' + notes.map((n) => '## ' + (n.title || 'Sem título') + '\n' + (n.content || '') + (n.tags ? '\n\n_Tags: ' + n.tags + '_' : '')).join('\n\n---\n\n');
}
function v24DevlogMarkdown() {
  return '# Geekie Study Hub — Dev Log\n\n' + DEVLOG.map((e) => '## ' + e.version + ' — ' + e.title + '\n_' + e.date + ' · ' + e.type + '_\n' + e.items.map((i) => '- ' + i).join('\n')).join('\n\n');
}
function v24StatsText() {
  const series = seriesFocus(statsDays);
  const total = series.reduce((a, b) => a + b.minutes, 0);
  const active = series.filter((x) => dayActiveKey(x.key)).length;
  const top = Object.entries(state.subjectMinutes).filter(([, m]) => m > 0).sort((a, b) => b[1] - a[1]).slice(0, 4);
  return ['Geekie · relatório de estatísticas',
    'Período: últimos ' + statsDays + ' dias',
    'Foco no período: ' + fmtMinutes(total) + ' · média ' + fmtMinutes(total / statsDays),
    'Dias ativos: ' + active + '/' + statsDays,
    'Foco hoje: ' + fmtMinutes(state.focusByDate[dateKey()] || 0),
    'Sequência: ' + computeStreak() + ' dias · recorde ' + state.streakBest,
    'Sessões: ' + state.sessions + ' · pomodoros: ' + state.pomoSessions,
    'Por matéria: ' + (top.length ? top.map(([s, m]) => s + ' ' + fmtMinutes(m)).join(' · ') : 'sem registro')].join('\n');
}
function v24DiaryText() {
  const keys = Object.keys(state.diary).sort().slice(-7).reverse();
  if (!keys.length) return '';
  return '# Diário — últimos 7 registros\n\n' + keys.map((k) => '## ' + prettyDate(k) + ' ' + (state.diary[k].mood || '') + '\n' + (state.diary[k].text || '')).join('\n\n');
}
function v24JourneyText() {
  const achieved = ACHIEVEMENTS.filter((a) => { try { return a.check(); } catch (e) { return false; } }).length;
  return ['Geekie · progresso',
    'Nível: ' + levelInfo(state.xp).cur.title + ' · ' + state.xp + ' XP',
    'Marcos resgatados: ' + state.milestonesClaimed.length + '/' + MILESTONES.length,
    'Conquistas: ' + achieved + '/' + ACHIEVEMENTS.length,
    'Foguinho: ' + computeStreak() + ' dias · escudos ' + (state.streakShields || 0) + '/5'].join('\n');
}
function v24ClickerText() {
  return ['Geekie · núcleo',
    'Energia: ' + money(Math.floor(state.clicker.points || 0)) + ' ⚡',
    'Produção: ' + money(clickerRate()) + '/s · por clique +' + money(clickerPower()),
    'Prestígio: ' + (state.clicker.prestige || 0) + ' · críticos: ' + (state.clicker.crits || 0),
    'Cliques: ' + (state.clicker.clicks || 0) + ' · trocas: ' + (state.clicker.exchanges || 0),
    'Talentos: ' + Object.values(state.clicker.talents || {}).reduce((a, b) => a + b, 0) + '/15'].join('\n');
}
function v24EventText() {
  const e = EVENTS[eventMonth];
  const minutes = monthMinutes(eventMonth);
  const level = Math.min(5, Math.floor(minutes / 60) + 1);
  return e.emoji + ' ' + e.name + '\n' + e.desc + '\nFoco no mês: ' + fmtMinutes(minutes) + ' · nível ' + level + '/5 · recompensa ' + e.coins + ' moedas';
}
function feedAllPetsV24() {
  const owned = state.petsOwned.slice();
  if (!owned.length) return toast('Adote um pet primeiro.', 'fa-paw', true);
  const cost = owned.length * 15;
  if (state.coins < cost) return toast('Faltam ' + (cost - state.coins) + ' moedas para alimentar todos.', 'fa-coins', true);
  state.coins -= cost;
  let leveled = 0;
  owned.forEach((id) => {
    const before = petLevel(id);
    state.petEnergy[id] = clamp((state.petEnergy[id] || 0) + 20, 0, 100);
    state.petXp[id] = (state.petXp[id] || 0) + 15;
    state.petFed[id] = Date.now();
    if (petLevel(id) > before) leveled++;
  });
  save(); renderPets(); renderTopbar();
  toast(owned.length + ' pet(s) alimentados por ' + cost + ' moedas.' + (leveled ? ' ' + leveled + ' subiram de nível!' : ''), 'fa-bowl-food');
}
function runV24Action(action, btn) {
  const pageId = btn && btn.closest('.page') ? btn.closest('.page').dataset.tab : state.currentTab;
  switch (action) {
    case 'day-summary': v24Copy(v24DaySummary(), 'Resumo do dia copiado.'); return;
    case 'focus-5': v24StartFocus(5); return;
    case 'focus-10': v24StartFocus(10); return;
    case 'focus-50': v24StartFocus(50); return;
    case 'goals-export': { const md = v24GoalsMarkdown(); if (!md) return toast('Nenhuma meta para exportar.', 'fa-list-check', true); download('geekie-metas.md', md, 'text/markdown;charset=utf-8'); toast('Metas exportadas em .md.', 'fa-file-arrow-down'); return; }
    case 'flash-reset': {
      const cards = state.decks[state.deck] || [];
      if (!cards.length) return toast('O baralho atual está vazio.', 'fa-clone', true);
      if (!confirm('Reiniciar o progresso de ' + cards.length + ' card(s) do baralho ' + state.deck + '?')) return;
      cards.forEach((c) => { c.ease = 2.5; c.interval = 0; c.due = ''; c.reps = 0; c.lapses = 0; });
      state.flashRound = 0; flash.queue = []; flash.idx = 0; flash.flipped = false; flash.reviewed = 0;
      buildFlashQueue(); save(); renderFlashcards(); renderFlashV23();
      toast('Baralho reiniciado.', 'fa-rotate-left');
      return;
    }
    case 'flash-export': if (typeof exportDeckCsvV23 === 'function') exportDeckCsvV23(); return;
    case 'quiz-copy': { const h = (state.quizHistory || []).slice(0, 5); if (!h.length) return toast('Nenhum quiz concluído ainda.', 'fa-brain', true); v24Copy(h.map((q) => new Date(q.at).toLocaleDateString('pt-BR') + ': ' + q.score + '/' + q.total + ' · ' + (q.subject || 'Geral')).join('\n'), 'Resultados copiados.'); return; }
    case 'subjects-copy': { const log = state.subjectLog || []; if (!log.length) return toast('Nenhuma sessão registrada.', 'fa-clock', true); v24Copy(log.slice(0, 12).map((s) => new Date(s.at).toLocaleString('pt-BR') + ' · ' + s.subject + ' · ' + fmtMinutes(s.minutes)).join('\n'), 'Sessões copiadas.'); return; }
    case 'planner-copy': { const md = v24PlannerText(); if (!md) return toast('Nenhum bloco preenchido nesta semana.', 'fa-calendar-week', true); v24Copy(md, 'Semana copiada em markdown.'); return; }
    case 'stats-copy': v24Copy(v24StatsText(), 'Relatório copiado.'); return;
    case 'diary-copy': { const md = v24DiaryText(); if (!md) return toast('Nenhuma entrada nos últimos 7 registros.', 'fa-book', true); v24Copy(md, 'Diário copiado.'); return; }
    case 'chat-clear': if (!state.chatHistory.length) return toast('A conversa já está vazia.', 'fa-comments', true); if (!confirm('Limpar todas as mensagens desta conversa?')) return; state.chatHistory = []; save(); renderChat(); toast('Conversa limpa.', 'fa-broom'); return;
    case 'cmd-copy': { const out = $('#cmdOutput'); v24Copy(out ? (out.innerText || out.textContent || '') : '', 'Saída do terminal copiada.'); return; }
    case 'theme-random': { const list = state.themesOwned.length ? state.themesOwned : ['default']; const pool = list.filter((t) => t !== state.theme); const id = pool.length ? pool[Math.floor(Math.random() * pool.length)] : list[0]; applyTheme(id); renderStore(); save(); toast('Tema aplicado: ' + adminThemeName(id) + '.', 'fa-palette'); return; }
    case 'title-random': { const pool = LEVELS.filter((l) => state.xp >= l.xp && l.title !== state.title); if (!pool.length) return toast('Nenhum outro título liberado ainda.', 'fa-crown', true); const t = pool[Math.floor(Math.random() * pool.length)].title; state.title = t; save(); renderTitles(); renderTopbar(); toast('Título equipado: ' + t + '.', 'fa-crown'); return; }
    case 'pets-feed-all': feedAllPetsV24(); return;
    case 'journey-copy': v24Copy(v24JourneyText(), 'Progresso copiado.'); return;
    case 'clicker-copy': v24Copy(v24ClickerText(), 'Status do núcleo copiado.'); return;
    case 'rewards-copy': { const active = REWARDS.filter((r) => !state.redeemed.includes(r.code) && (!r.expires || r.expires >= dateKey())); if (!active.length) return toast('Nenhum código ativo para copiar.', 'fa-key', true); v24Copy(active.map((r) => r.code + ' — ' + r.label).join('\n'), active.length + ' códigos copiados.'); return; }
    case 'notes-export': { const md = v24NotesMarkdown(); if (!md) return toast('Nenhuma nota para exportar.', 'fa-note-sticky', true); download('geekie-notas.md', md, 'text/markdown;charset=utf-8'); toast('Notas exportadas em .md.', 'fa-file-arrow-down'); return; }
    case 'ambient-stop': { const b = $('#ambientStopAll'); if (b) b.click(); return; }
    case 'keysound-random': { const ids = Object.keys(KEY_STYLES); const pool = ids.filter((x) => x !== state.keySounds.style); state.keySounds.style = pool[Math.floor(Math.random() * pool.length)] || ids[0]; const sel = $('#keySoundStyle'); if (sel) sel.value = state.keySounds.style; save(); playKeySound(); toast('Estilo de tecla: ' + state.keySounds.style + '.', 'fa-keyboard'); return; }
    case 'calc-copy': { if (!calc.history.length) return toast('Nenhum cálculo no histórico.', 'fa-calculator', true); v24Copy(calc.history.map((x) => x.expr + ' = ' + x.result).join('\n'), 'Histórico copiado.'); return; }
    case 'chars-copy-favs': { if (!state.charsFav.length) return toast('Nenhum favorito para copiar.', 'fa-star', true); v24Copy(state.charsFav.join(' '), state.charsFav.length + ' favoritos copiados.'); return; }
    case 'title-copy': v24Copy('Título: ' + state.pageTitle + '\nFonte: ' + state.font + '\nÍcone: ' + state.icon, 'Configuração copiada.'); return;
    case 'pass-copy': { const last = passHistory[0]; const out = $('#passwordOutput'); const text = last ? last.pass : (out && out.value !== 'Clique em gerar' ? out.value : ''); if (!text) return toast('Gere uma senha primeiro.', 'fa-shield-halved', true); v24Copy(text, 'Última senha copiada.'); return; }
    case 'portal-open': { const p = document.getElementById('page-' + pageId); const frame = p ? p.querySelector('iframe') : null; const url = frame && (frame.getAttribute('src') || frame.dataset.src); if (!url) return toast('O portal ainda não carregou.', 'fa-globe', true); window.open(url, '_blank', 'noopener'); return; }
    case 'event-copy': v24Copy(v24EventText(), 'Evento copiado.'); return;
    case 'devlog-export': download('geekie-devlog.md', v24DevlogMarkdown(), 'text/markdown;charset=utf-8'); toast('Dev Log exportado em .md.', 'fa-file-arrow-down'); return;
    default: return;
  }
}

/* ---------- 37-L. Portais com zoom lembrado e navegação v24 ---------- */
function applyPortalZoomV24(id) {
  const page = document.getElementById('page-' + id);
  if (!page) return;
  const frame = page.querySelector('.iframe-frame iframe');
  if (!frame) return;
  const z = clamp(Number(state.portalZoom && state.portalZoom[id]) || 1, 0.7, 1.3);
  try { frame.style.zoom = z; } catch (e) { /* navegador sem zoom CSS */ }
  frame.dataset.zoom = z;
  const label = page.querySelector('[data-v23-zoom-label]');
  if (label) label.textContent = Math.round(z * 100) + '%';
}
const paintSwitchV24 = switchTab;
switchTab = function (id, opts) {
  paintSwitchV24(id, opts);
  hideCharPreviewV24();
  applyPortalZoomV24(id);
};
/* ---------- 37-M. Inicialização, atalhos e bindings v24 ---------- */
const paintCharsV24 = renderChars;
renderChars = function () { paintCharsV24(); hideCharPreviewV24(); };
RENDERERS.chars = renderChars;

function initV24() {
  if (initV24.ready) return;
  initV24.ready = true;
  buildV24Quickbars();
  bindCharPreviewV24();
  $('#adminRailToggle') && $('#adminRailToggle').addEventListener('click', toggleAdminRail);
  $('#adminCloseBtn') && $('#adminCloseBtn').addEventListener('click', () => closeAdmin());
  $('#adminLockBtn') && $('#adminLockBtn').addEventListener('click', adminLock);
  $('#adminOverlay') && $('#adminOverlay').addEventListener('click', (e) => { if (e.target.id === 'adminOverlay') closeAdmin(); });
  $('#adminNav') && $('#adminNav').addEventListener('click', (e) => {
    const b = e.target.closest('[data-admin-section]');
    if (b) renderAdminSection(b.dataset.adminSection);
  });
  $('#adminContent') && $('#adminContent').addEventListener('click', (e) => {
    const b = e.target.closest('[data-admin-action]');
    if (!b || b.disabled) return;
    adminRun(b.dataset.adminAction, b);
  });
  $('#adminContent') && $('#adminContent').addEventListener('submit', (e) => {
    e.preventDefault();
    adminHandleSubmit(e.target.closest('[data-admin-form]'));
  });
  $('#adminContent') && $('#adminContent').addEventListener('change', (e) => {
    if (e.target.id !== 'adminImportFile') return;
    const f = e.target.files && e.target.files[0];
    adminImportBackup(f);
    e.target.value = '';
  });

  /* Código de acesso: digitar no campo de códigos arma o atalho. */
  const rewardInput = $('#rewardInput');
  if (rewardInput) {
    rewardInput.addEventListener('input', () => {
      if (adminCodeOk(rewardInput.value) && !adminArmed()) adminArm();
    });
  }
  const rewardForm = $('#rewardForm');
  if (rewardForm) {
    rewardForm.addEventListener('submit', (e) => {
      const input = $('#rewardInput');
      if (!input || !adminCodeOk(input.value)) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (!adminArmed()) adminArm();
    }, true);
  }

  /* Atalho do painel e armadilha de foco. */
  document.addEventListener('keydown', (e) => {
    const combo = (e.ctrlKey || e.metaKey) && e.shiftKey && !e.altKey && e.key.toLowerCase() === 's';
    if (combo) {
      if (adminOpen) { e.preventDefault(); e.stopImmediatePropagation(); closeAdmin(); return; }
      if (adminArmed() && state.session && $('#app') && !$('#app').hidden) {
        e.preventDefault();
        e.stopImmediatePropagation();
        openAdmin();
      }
      return;
    }
    if (!adminOpen) {
      const tag = document.activeElement && document.activeElement.tagName;
      const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag);
      const isButton = document.activeElement && (document.activeElement.tagName === 'BUTTON' || document.activeElement.tagName === 'A');
      if (state.currentTab === 'timer' && e.key === ' ' && !typing && !isButton && !e.repeat) {
        e.preventDefault();
        if (pomo.running) pomoPause(); else pomoStart();
      }
      return;
    }
    if (e.key === 'Escape') { e.preventDefault(); closeAdmin(); return; }
    if (e.key === 'Tab') {
      const shell = $('#adminShell');
      if (!shell) return;
      const focusables = $$('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', shell).filter((el) => !el.hidden);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !shell.contains(active))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (active === last || !shell.contains(active))) { e.preventDefault(); first.focus(); }
      return;
    }
    const tag = document.activeElement && document.activeElement.tagName;
    const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag);
    if (!typing || e.ctrlKey || e.metaKey || e.altKey || e.key === '/' || e.key === ' ') {
      e.stopImmediatePropagation();
    }
  }, true);

  /* Ações rápidas e cópia de códigos. */
  document.addEventListener('click', (e) => {
    const quick = e.target.closest('[data-v24-action]');
    if (quick) { runV24Action(quick.dataset.v24Action, quick); return; }
    const copy = e.target.closest('[data-reward-copy]');
    if (copy) { v24Copy(copy.dataset.rewardCopy, 'Código ' + copy.dataset.rewardCopy + ' copiado.'); return; }
    if (e.target.closest('[data-char]')) hideCharPreviewV24();
  });

  /* Dev Log: botões do painel de atalho. */
  $('#devlogRecentCopyBtn') && $('#devlogRecentCopyBtn').addEventListener('click', () => {
    v24Copy(devlogLatest(3).map((e) => e.version + ' — ' + e.title + '\n' + e.items.map((i) => '• ' + i).join('\n')).join('\n\n'), 'Resumo do Dev Log copiado.');
  });
  $('#devlogRecentExportBtn') && $('#devlogRecentExportBtn').addEventListener('click', () => {
    download('geekie-devlog.md', v24DevlogMarkdown(), 'text/markdown;charset=utf-8');
    toast('Dev Log exportado.', 'fa-file-arrow-down');
  });
  const titleInput = $('#titleTextInput');
  if (titleInput) {
    titleInput.addEventListener('input', () => {
      const p = $('#titlePreview');
      if (p) p.textContent = titleInput.value.trim() || state.pageTitle;
    });
  }
}

/* ============================================================
   v25.0.0 — PREVIEW DE ITENS, CÓDIGOS E RADAR DAS ABAS
   Previews flutuantes para Loja, Pets, Títulos, Trilha e
   Recompensas + indicador contextual em todas as 28 abas.
   ============================================================ */

/* ---------- 38-A. Preview flutuante de itens ---------- */
let itemPreviewKey = '';
let itemPreviewHideTimer = null;
let itemPreviewLastX = 0;

function v25Tag(text, tone) {
  if (!text) return '';
  return '<span class="ip-tag' + (tone ? ' ' + tone : '') + '">' + esc(text) + '</span>';
}
function v25ThemePreview(card) {
  const t = THEMES.find((x) => x.id === card.dataset.themeCard);
  if (!t) return null;
  const owned = state.themesOwned.includes(t.id);
  const equipped = state.theme === t.id;
  return {
    key: 'theme:' + t.id,
    html: '<div class="ip-card ip-theme" style="--ip-a:' + t.a + ';--ip-b:' + t.b + '">' +
      '<div class="ip-theme-art"><span class="ip-theme-orb"></span><span class="ip-sheen"></span><span class="ip-art-caption">' + esc(t.name) + '</span></div>' +
      '<div class="ip-body"><b class="ip-name">' + esc(t.name) + '</b>' +
      '<span class="ip-sub">' + (equipped ? 'Em uso agora neste hub' : owned ? 'Na sua coleção, pronto para equipar' : 'Tema bloqueado na Loja') + '</span>' +
      '<div class="ip-tags">' + v25Tag(owned ? 'adquirido' : money(t.price) + ' moedas', owned ? '' : 'gold') + v25Tag(equipped ? 'equipado' : 'clique para ' + (owned ? 'equipar' : 'comprar')) + '</div></div></div>'
  };
}
function v25PetPreview(card) {
  const p = PETS.find((x) => x.id === card.dataset.petCard);
  if (!p) return null;
  const owned = state.petsOwned.includes(p.id);
  const active = state.pet === p.id;
  const energy = clamp(Number((state.petEnergy || {})[p.id]) || 0, 0, 100);
  const level = petLevel(p.id);
  const income = Math.round(p.income * (1 + (level - 1) * 0.15));
  return {
    key: 'pet:' + p.id,
    html: '<div class="ip-card ip-pet">' +
      '<div class="ip-pet-art"><span class="ip-pet-emoji">' + p.emoji + '</span><span class="ip-pet-ring"></span></div>' +
      '<div class="ip-body"><b class="ip-name">' + esc(p.name) + '</b>' +
      '<span class="ip-sub">' + (owned ? 'Nível ' + level + ' · ' + income + ' moedas/tick' : money(p.price) + ' moedas para adotar') + '</span>' +
      '<div class="ip-meter"><span style="width:' + (owned ? energy : 0) + '%"></span></div>' +
      '<span class="ip-sub">' + (owned ? 'energia ' + Math.round(energy) + '/100' : 'renda base ' + p.income + ' moedas/tick') + '</span>' +
      '<div class="ip-tags">' + v25Tag(owned ? (active ? 'acompanhando' : 'na coleção') : 'bloqueado', owned ? '' : 'gold') + v25Tag(owned ? 'alimentar 15' : 'adotar', owned ? '' : 'gold') + '</div></div></div>'
  };
}
function v25TitlePreview(card) {
  const l = LEVELS.find((x) => x.title === card.dataset.titleCard);
  if (!l) return null;
  const unlocked = state.xp >= l.xp;
  const equipped = state.title === l.title;
  return {
    key: 'title:' + l.title,
    html: '<div class="ip-card ip-title">' +
      '<div class="ip-title-art"><span class="ip-crown"><i class="fa-solid fa-crown"></i></span><span class="ip-crown-glow"></span></div>' +
      '<div class="ip-body"><b class="ip-name">' + esc(l.title) + '</b>' +
      '<span class="ip-sub">' + (unlocked ? 'Liberado pelo seu XP' : 'Faltam ' + money(l.xp - state.xp) + ' XP') + '</span>' +
      '<div class="ip-tags">' + v25Tag(money(l.xp) + ' XP', 'gold') + v25Tag(equipped ? 'equipado' : unlocked ? 'pronto para equipar' : 'bloqueado') + '</div></div></div>'
  };
}
function v25MilestonePreview(card) {
  const m = MILESTONES.find((x) => x.id === card.dataset.milestoneCard);
  if (!m) return null;
  const value = milestoneValue(m.type);
  const claimed = state.milestonesClaimed.includes(m.id);
  const ready = value >= m.goal && !claimed;
  const pct = clamp((value / m.goal) * 100, 0, 100);
  return {
    key: 'milestone:' + m.id,
    html: '<div class="ip-card ip-milestone">' +
      '<div class="ip-body"><b class="ip-name">' + esc(m.label) + '</b>' +
      '<span class="ip-sub">' + Math.min(value, m.goal) + ' de ' + m.goal + ' · ' + Math.round(pct) + '%</span>' +
      '<div class="ip-meter"><span style="width:' + pct + '%"></span></div>' +
      '<div class="ip-tags">' + v25Tag('+' + m.coins + ' moedas', 'gold') + v25Tag('+' + m.xp + ' XP') + v25Tag(claimed ? 'resgatado' : ready ? 'pronto' : 'em curso', ready ? 'gold' : '') + '</div></div></div>'
  };
}
function v25AchPreview(card) {
  const a = ACHIEVEMENTS.find((x) => x.id === card.dataset.achCard);
  if (!a) return null;
  let unlocked = false;
  try { unlocked = !!a.check(); } catch (e) { unlocked = false; }
  return {
    key: 'ach:' + a.id,
    html: '<div class="ip-card ip-ach">' +
      '<div class="ip-ach-art"><i class="fa-solid ' + a.icon + '"></i><span class="ip-ach-ring"></span></div>' +
      '<div class="ip-body"><b class="ip-name">' + esc(a.label) + '</b>' +
      '<span class="ip-sub">' + (unlocked ? 'Conquista desbloqueada' : 'Ainda bloqueada — continue progredindo') + '</span>' +
      '<div class="ip-tags">' + v25Tag(unlocked ? 'desbloqueada' : 'bloqueada', unlocked ? 'gold' : '') + '</div></div></div>'
  };
}
function v25RewardPreview(card) {
  const r = rewardPool().find((x) => x.code === card.dataset.rewardCard);
  if (!r) return null;
  const used = state.redeemed.includes(r.code);
  const expired = r.expires && r.expires < dateKey();
  const tags = [];
  if (r.coins) tags.push(v25Tag('+' + money(r.coins) + ' moedas', 'gold'));
  if (r.xp) tags.push(v25Tag('+' + money(r.xp) + ' XP'));
  if (r.energy) tags.push(v25Tag('+' + money(r.energy) + ' ⚡', 'gold'));
  if (r.theme) tags.push(v25Tag('tema ' + adminThemeName(r.theme)));
  if (r.shield) tags.push(v25Tag('+' + r.shield + ' escudo'));
  return {
    key: 'reward:' + r.code,
    html: '<div class="ip-card ip-reward">' +
      '<div class="ip-reward-head"><span class="ip-code">' + esc(r.code) + '</span>' + v25Tag(used ? 'resgatado' : expired ? 'expirado' : 'ativo', used ? '' : expired ? 'danger' : 'gold') + '</div>' +
      '<p class="ip-reward-hint">' + esc(r.hint || r.label || 'Campanha do hub') + '</p>' +
      '<div class="ip-tags">' + tags.join('') + '</div>' +
      (r.expires ? '<span class="ip-sub">expira em ' + prettyDate(r.expires) + '</span>' : '') + '</div>'
  };
}
function v25BuildItemPreview(card) {
  if (!card) return null;
  try {
    if (card.matches('[data-theme-card]')) return v25ThemePreview(card);
    if (card.matches('[data-pet-card]')) return v25PetPreview(card);
    if (card.matches('[data-title-card]')) return v25TitlePreview(card);
    if (card.matches('[data-milestone-card]')) return v25MilestonePreview(card);
    if (card.matches('[data-ach-card]')) return v25AchPreview(card);
    if (card.matches('[data-reward-card]')) return v25RewardPreview(card);
  } catch (e) { return null; }
  return null;
}
function v25ShowItemPreview(card) {
  const info = v25BuildItemPreview(card);
  const el = $('#itemHoverPreview');
  if (!info || !el) return;
  clearTimeout(itemPreviewHideTimer);
  const wasVisible = el.classList.contains('show');
  const changed = itemPreviewKey !== info.key;
  itemPreviewKey = info.key;
  if (changed) el.innerHTML = info.html;
  const width = Math.min(292, window.innerWidth - 16);
  el.style.width = width + 'px';
  const rect = card.getBoundingClientRect();
  const height = el.offsetHeight || 160;
  const gap = 12;
  let x = rect.right + gap;
  if (x + width > window.innerWidth - 8) x = rect.left - width - gap;
  x = clamp(x, 8, Math.max(8, window.innerWidth - width - 8));
  const y = clamp(rect.top + rect.height / 2 - height / 2, 8, Math.max(8, window.innerHeight - height - 8));
  const dir = rect.left >= itemPreviewLastX ? 1 : -1;
  itemPreviewLastX = rect.left;
  el.style.setProperty('--ip-x', x.toFixed(1) + 'px');
  el.style.setProperty('--ip-y', y.toFixed(1) + 'px');
  el.style.setProperty('--ip-shift', (dir * 12) + 'px');
  el.setAttribute('aria-hidden', 'false');
  el.classList.add('show');
  if (wasVisible && changed) {
    el.classList.remove('swap');
    void el.offsetWidth;
    el.classList.add('swap');
  } else if (!wasVisible) {
    el.classList.remove('swap');
  }
}
function hideItemPreviewV25() {
  clearTimeout(itemPreviewHideTimer);
  itemPreviewKey = '';
  const el = $('#itemHoverPreview');
  if (!el) return;
  el.classList.remove('show', 'swap');
  el.setAttribute('aria-hidden', 'true');
}
function scheduleHideItemPreviewV25() {
  clearTimeout(itemPreviewHideTimer);
  itemPreviewHideTimer = setTimeout(hideItemPreviewV25, 120);
}
function bindItemPreviewV25() {
  const sel = '.theme-card[data-theme-card], .pet-card[data-pet-card], .title-card[data-title-card], .milestone[data-milestone-card], .ach-item[data-ach-card], .reward-card[data-reward-card], .rebirth-card[data-rebirth-card]';
  document.addEventListener('pointerover', (e) => {
    if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    const card = e.target.closest(sel);
    if (!card || !card.closest('.page.active')) return;
    v25ShowItemPreview(card);
  });
  document.addEventListener('pointerout', (e) => {
    const card = e.target.closest(sel);
    if (!card) return;
    if (e.relatedTarget && card.contains(e.relatedTarget)) return;
    scheduleHideItemPreviewV25();
  });
  document.addEventListener('focusin', (e) => {
    const card = e.target.closest(sel);
    if (card && e.target.closest('button') && card.closest('.page.active')) v25ShowItemPreview(card);
  });
  document.addEventListener('focusout', (e) => {
    if (e.target.closest(sel)) scheduleHideItemPreviewV25();
  });
  document.addEventListener('click', (e) => {
    if (e.target.closest(sel)) hideItemPreviewV25();
  });
  window.addEventListener('resize', hideItemPreviewV25, { passive: true });
  document.addEventListener('scroll', hideItemPreviewV25, true);
}

/* ---------- 38-B. Radar ao vivo das 28 abas ---------- */
function v25LateGoals() { const today = dateKey(); return state.goals.filter((g) => !g.done && g.due && g.due < today); }
function v25OpenGoals() { return state.goals.filter((g) => !g.done).length; }
function v25SuggestedFocus() {
  const done = Number(state.focusByDate[dateKey()]) || 0;
  const left = Math.max(0, 60 - done);
  if (!left) return 25;
  return clamp(Math.round(left / 5) * 5, 5, 60);
}
function v25QuizStats() {
  const h = state.quizHistory || [];
  const total = h.reduce((a, q) => a + (Number(q.total) || 0), 0);
  const score = h.reduce((a, q) => a + (Number(q.score) || 0), 0);
  return { n: h.length, pct: total ? Math.round((score / total) * 100) : 0 };
}
function v25ActiveRewards() {
  return REWARDS.filter((r) => !state.redeemed.includes(r.code) && (!r.expires || r.expires >= dateKey()));
}
function v25WeekBlocks() {
  let n = 0;
  plannerDays().forEach((d) => { n += Object.keys(state.planner[dateKey(d)] || {}).length; });
  return n;
}
function v25Achieved() {
  return ACHIEVEMENTS.filter((a) => { try { return !!a.check(); } catch (e) { return false; } }).length;
}
function v25ReadyMilestones() {
  return MILESTONES.filter((m) => !state.milestonesClaimed.includes(m.id) && milestoneValue(m.type) >= m.goal);
}
function v25NotesWords() {
  return Object.values(state.notes).reduce((acc, n) => acc + String((n && n.content) || '').trim().split(/\s+/).filter(Boolean).length, 0);
}
function v25ActiveLayers() { return Object.values(state.ambient.layers || {}).filter((v) => Number(v) > 0).length; }

const V25_TABS = {
  hoje: {
    label: 'Prioridade agora', icon: 'fa-compass',
    insight() {
      const late = v25LateGoals().length;
      const due = dueCards().length;
      const open = v25OpenGoals();
      if (late) return late + ' meta(s) atrasada(s) · ' + due + ' revisão(ões) · ' + open + ' aberta(s)';
      if (due) return due + ' revisão(ões) devidas · ' + open + ' meta(s) aberta(s)';
      if (open) return open + ' meta(s) aberta(s) · nenhuma revisão devida';
      return 'Tudo em dia — escolha um foco curto para começar.';
    },
    action: { id: 'plan-next', label: 'Abrir prioridade', icon: 'fa-arrow-right' }
  },
  timer: {
    label: 'Ritmo sugerido', icon: 'fa-gauge-high',
    insight() {
      const done = Number(state.focusByDate[dateKey()]) || 0;
      return 'sugestão de ' + v25SuggestedFocus() + ' min · foco hoje ' + fmtMinutes(done) + ' de 60 min';
    },
    action: { id: 'timer-suggest', label: 'Aplicar sugestão', icon: 'fa-play' }
  },
  goals: {
    label: 'Pendências', icon: 'fa-list-check',
    insight() {
      const late = v25LateGoals().length;
      const open = v25OpenGoals();
      const today = dateKey();
      const doneToday = state.goals.filter((g) => g.done && g.doneAt && dateKey(new Date(g.doneAt)) === today).length;
      return open + ' aberta(s) · ' + late + ' atrasada(s) · ' + doneToday + ' concluída(s) hoje';
    },
    action: { id: 'goals-late', label: 'Concluir atrasadas', icon: 'fa-check-double' }
  },
  flashcards: {
    label: 'Fila de revisão', icon: 'fa-clone',
    insight() {
      const deck = (state.decks[state.deck] || []).length;
      return dueCards().length + ' devidos no hub · ' + deck + ' card(s) em ' + state.deck;
    },
    action: { id: 'flash-shuffle', label: 'Embaralhar', icon: 'fa-shuffle' }
  },
  quiz: {
    label: 'Precisão', icon: 'fa-brain',
    insight() {
      const q = v25QuizStats();
      return q.n ? q.pct + '% de precisão em ' + q.n + ' quiz(zes) · recorde ' + state.quizBest : 'Nenhum quiz concluído · recorde ' + state.quizBest + ' acertos';
    },
    action: { id: 'quiz-quick', label: 'Quiz relâmpago', icon: 'fa-bolt' }
  },
  subjects: {
    label: 'Timer por matéria', icon: 'fa-clock',
    insight() {
      const entries = Object.entries(state.subjectMinutes || {}).filter(([, m]) => m > 0).sort((a, b) => b[1] - a[1]);
      const total = entries.reduce((a, [, m]) => a + m, 0);
      return fmtMinutes(total) + ' acumulados' + (entries.length ? ' · líder ' + entries[0][0] : ' · nenhuma sessão ainda');
    },
    action: { id: 'subject-resume', label: 'Retomar última', icon: 'fa-play' }
  },
  planner: {
    label: 'Carga da semana', icon: 'fa-calendar-week',
    insight() { return v25WeekBlocks() + '/42 blocos preenchidos na semana exibida'; },
    action: { id: 'planner-prev', label: 'Duplicar anterior', icon: 'fa-copy' }
  },
  stats: {
    label: 'Comparativo', icon: 'fa-chart-simple',
    insight() {
      const today = new Date();
      let cur = 0, prev = 0;
      for (let i = 0; i < 7; i++) {
        cur += Number(state.focusByDate[dateKey(addDays(today, -i))]) || 0;
        prev += Number(state.focusByDate[dateKey(addDays(today, -i - 7))]) || 0;
      }
      const delta = prev ? Math.round(((cur - prev) / prev) * 100) : (cur ? 100 : 0);
      return fmtMinutes(cur) + ' em 7 dias · ' + (delta >= 0 ? '+' : '') + delta + '% vs. semana anterior';
    },
    action: { id: 'stats-checkin', label: 'Check-in de hoje', icon: 'fa-fire-flame-curved' }
  },
  diary: {
    label: 'Constância', icon: 'fa-book',
    insight() {
      const entries = Object.values(state.diary || {});
      if (!entries.length) return 'Nenhuma entrada ainda — comece com uma frase.';
      const counts = {};
      entries.forEach((e) => { const m = e.mood || '🙂'; counts[m] = (counts[m] || 0) + 1; });
      const top = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
      return entries.length + ' entrada(s) · humor mais comum ' + top;
    },
    action: { id: 'diary-today', label: 'Abrir hoje', icon: 'fa-pen' }
  },
  chat: {
    label: 'Conversa', icon: 'fa-comments',
    insight() {
      const msgs = state.chatHistory || [];
      const words = msgs.reduce((a, m) => a + String(m.content || '').trim().split(/\s+/).filter(Boolean).length, 0);
      return msgs.length + ' mensagem(ns) · ' + money(words) + ' palavras no histórico';
    },
    action: { id: 'chat-export', label: 'Exportar conversa', icon: 'fa-download' }
  },
  commands: {
    label: 'Terminal', icon: 'fa-terminal',
    insight() { return (state.commandHistory || []).length + ' comando(s) usados · Ctrl+K abre a paleta'; },
    action: { id: 'cmd-help', label: 'Ver comandos', icon: 'fa-circle-question' }
  },
  store: {
    label: 'Coleção', icon: 'fa-store',
    insight() { return state.themesOwned.length + '/' + THEMES.length + ' temas · ' + money(state.coins) + ' moedas disponíveis'; },
    action: { id: 'store-next', label: 'Comprar acessível', icon: 'fa-palette' }
  },
  titles: {
    label: 'Próximo título', icon: 'fa-crown',
    insight() {
      const info = levelInfo(state.xp);
      return info.next ? 'Próximo: ' + info.next.title + ' em ' + money(info.next.xp - state.xp) + ' XP' : 'Nível máximo alcançado · ' + state.title;
    },
    action: { id: 'title-best', label: 'Equipar melhor', icon: 'fa-crown' }
  },
  pets: {
    label: 'Companhia', icon: 'fa-paw',
    insight() { return state.petsOwned.length + '/' + PETS.length + ' pets · ' + petIncome() + ' moedas/5s agora'; },
    action: { id: 'pets-next', label: 'Adotar próximo', icon: 'fa-paw' }
  },
  journey: {
    label: 'Conquistas', icon: 'fa-map',
    insight() { return v25Achieved() + '/' + ACHIEVEMENTS.length + ' conquistas · ' + v25ReadyMilestones().length + ' marco(s) pronto(s)'; },
    action: { id: 'journey-claim', label: 'Resgatar prontos', icon: 'fa-gift' }
  },
  clicker: {
    label: 'Núcleo', icon: 'fa-bolt',
    insight() { return money(clickerRate()) + ' ⚡/s · ' + money(Math.floor(state.clicker.points || 0)) + ' ⚡ armazenados'; },
    action: { id: 'clicker-best', label: 'Melhor troca', icon: 'fa-coins' }
  },
  rewards: {
    label: 'Campanhas', icon: 'fa-gift',
    insight() { return v25ActiveRewards().length + ' código(s) ativo(s) · ' + state.redeemed.length + ' resgatado(s) nesta conta'; },
    action: { id: 'rewards-active', label: 'Copiar ativos', icon: 'fa-key' }
  },
  notes: {
    label: 'Biblioteca', icon: 'fa-note-sticky',
    insight() { return Object.keys(state.notes).length + ' nota(s) · ' + money(v25NotesWords()) + ' palavras escritas'; },
    action: { id: 'note-new', label: 'Nova nota', icon: 'fa-plus' }
  },
  ambient: {
    label: 'Camadas', icon: 'fa-headphones',
    insight() { return v25ActiveLayers() + ' camada(s) ativa(s) · volume geral ' + state.ambient.master + '%'; },
    action: { id: 'ambient-focus', label: 'Preset foco', icon: 'fa-headphones' }
  },
  keysounds: {
    label: 'Feedback', icon: 'fa-keyboard',
    insight() { return (state.keySounds.on ? 'Ligado' : 'Desligado') + ' · estilo ' + state.keySounds.style + ' · volume ' + state.keySounds.volume + '%'; },
    action: { id: 'keysound-test', label: 'Testar som', icon: 'fa-volume-high' }
  },
  calculator: {
    label: 'Histórico', icon: 'fa-calculator',
    insight() { return (calc.history || []).length + ' cálculo(s) nesta sessão · memória pronta'; },
    action: { id: 'calc-history', label: 'Copiar histórico', icon: 'fa-copy' }
  },
  chars: {
    label: 'Biblioteca Unicode', icon: 'fa-font',
    insight() { return state.charsFav.length + ' favorito(s) · ' + state.recentChars.length + ' recente(s) · ' + money(state.charCopies || 0) + ' cópias'; },
    action: { id: 'chars-favs', label: 'Copiar favoritos', icon: 'fa-star' }
  },
  title: {
    label: 'Aparência', icon: 'fa-pen-nib',
    insight() { return '"' + state.pageTitle + '" · fonte ' + state.font + ' · ícone ' + state.icon.replace('fa-', ''); },
    action: { id: 'title-apply', label: 'Aplicar configuração', icon: 'fa-check' }
  },
  password: {
    label: 'Segurança', icon: 'fa-shield-halved',
    insight() {
      const last = passHistory[0];
      return last ? passHistory.length + ' gerada(s) nesta sessão · última com ' + last.bits + ' bits' : 'Nenhuma senha gerada nesta sessão';
    },
    action: { id: 'pass-generate', label: 'Gerar nova', icon: 'fa-shuffle' }
  },
  geekie: {
    label: 'Portal', icon: 'fa-graduation-cap',
    insight() { return 'Zoom ' + Math.round((state.portalZoom.geekie || 1) * 100) + '% · Geekie One embutido'; },
    action: { id: 'portal-open', label: 'Abrir em nova aba', icon: 'fa-arrow-up-right-from-square' }
  },
  google: {
    label: 'Busca', icon: 'fa-google',
    insight() { return 'Zoom ' + Math.round((state.portalZoom.google || 1) * 100) + '% · Google embutido'; },
    action: { id: 'portal-open', label: 'Abrir em nova aba', icon: 'fa-arrow-up-right-from-square' }
  },
  events: {
    label: 'Evento do mês', icon: 'fa-calendar-day',
    insight() { const e = EVENTS[eventMonth]; return e.emoji + ' ' + e.name + ' · ' + fmtMinutes(monthMinutes(eventMonth)) + ' de foco no mês'; },
    action: { id: 'event-copy', label: 'Copiar evento', icon: 'fa-copy' }
  },
  devlog: {
    label: 'Versões', icon: 'fa-code-branch',
    insight() { return DEVLOG.length + ' entrada(s) · última ' + DEVLOG[0].version + ' em ' + DEVLOG[0].date; },
    action: { id: 'devlog-recent', label: 'Ver últimas 3', icon: 'fa-layer-group' }
  },
  rebirth: {
    label: 'Renascimento', icon: 'fa-rocket',
    insight() {
      const r = rebirthTier();
      if (!r) return 'Ciclo máximo concluído · multiplicador x' + rebirthMultiplier().toFixed(1) + ' ativo';
      return 'Rebirth ' + r.n + ' · ' + r.name + ' · ' + money(state.xp) + '/' + money(r.req) + ' XP · x' + rebirthMultiplier().toFixed(1) + ' atual';
    },
    action: { id: 'rebirth-open', label: 'Focar no foguete', icon: 'fa-rocket' }
  }
};

function v25PaintInsight(id) {
  const page = document.getElementById('page-' + id);
  if (!page) return;
  const row = $('[data-v25-insight]', page);
  const meta = V25_TABS[id];
  if (!row || !meta) return;
  const text = $('[data-v25-text]', row);
  if (!text) return;
  let value = '—';
  try { value = meta.insight(); } catch (e) { value = '—'; }
  if (text.textContent !== value) text.textContent = value;
  row.classList.remove('is-fresh');
  void row.offsetWidth;
  row.classList.add('is-fresh');
}
function v25RefreshInsight() { v25PaintInsight(state.currentTab || 'hoje'); }
function buildV25Insights() {
  $$('.page[data-tab]').forEach((page) => {
    const id = page.dataset.tab;
    const meta = V25_TABS[id];
    const card = $('.v24-quickbar', page);
    if (!meta || !card) return;
    if ($('.v25-insight', card)) { v25PaintInsight(id); return; }
    const row = document.createElement('div');
    row.className = 'v25-insight';
    row.dataset.v25Insight = id;
    row.innerHTML = '<span class="v25-pulse" aria-hidden="true"><i class="fa-solid ' + meta.icon + '"></i></span>' +
      '<div class="v25-insight-copy"><b>' + esc(meta.label) + '</b><span data-v25-text>—</span></div>' +
      '<button class="btn btn-primary btn-sm v25-insight-action" type="button" data-v25-action="' + meta.action.id + '"><i class="fa-solid ' + meta.action.icon + '"></i> ' + esc(meta.action.label) + '</button>';
    const actions = $('.v24-quick-actions', card);
    if (actions) card.insertBefore(row, actions); else card.appendChild(row);
    v25PaintInsight(id);
  });
}
function v25RunAction(action, btn) {
  const page = btn && btn.closest ? btn.closest('.page') : null;
  const pageId = page ? page.dataset.tab : (state.currentTab || 'hoje');
  switch (action) {
    case 'plan-next': {
      const late = v25LateGoals();
      if (late.length) {
        goalFilter = 'late';
        $$('#goalFilters .chip').forEach((c) => c.classList.toggle('active', c.dataset.filter === 'late'));
        switchTab('goals');
        toast(late.length + ' meta(s) atrasada(s) em destaque.', 'fa-list-check');
        return;
      }
      if (dueCards().length) { switchTab('flashcards'); return; }
      if (v25OpenGoals()) { switchTab('goals'); return; }
      v24StartFocus(v25SuggestedFocus());
      return;
    }
    case 'timer-suggest': v24StartFocus(v25SuggestedFocus()); return;
    case 'goals-late': {
      const late = v25LateGoals();
      if (!late.length) return toast('Nenhuma meta atrasada agora.', 'fa-circle-check', true);
      if (!confirm('Concluir ' + late.length + ' meta(s) atrasada(s) de uma vez?')) return;
      late.forEach((g) => { g.done = true; g.doneAt = Date.now(); state.totalGoalsDone += 1; dailyBump('goals', 1); });
      addXp(8 * late.length); addCoins(2 * late.length);
      save(); renderGoals(); renderHoje(); renderJourney();
      toast(late.length + ' meta(s) concluída(s) · XP e moedas creditados.', 'fa-check-double');
      return;
    }
    case 'flash-shuffle': {
      const cards = flash.queue.length ? flash.queue : (state.decks[state.deck] || []);
      if (!cards.length) return toast('O baralho atual está vazio.', 'fa-clone', true);
      flash.queue = shuffle(cards); flash.idx = 0; flash.flipped = false;
      renderFlashcards();
      toast('Baralho embaralhado — ' + flash.queue.length + ' card(s) na fila.', 'fa-shuffle');
      return;
    }
    case 'quiz-quick': {
      const sel = $('#quizCount'); if (sel) sel.value = '3';
      startQuiz();
      toast('Quiz relâmpago: 3 perguntas.', 'fa-bolt');
      return;
    }
    case 'subject-resume': {
      const log = state.subjectLog || [];
      const top = Object.entries(state.subjectMinutes || {}).sort((a, b) => b[1] - a[1])[0];
      const name = (log[0] && log[0].subject) || (top && top[0]) || '';
      if (!name) return toast('Registre uma sessão de matéria primeiro.', 'fa-clock', true);
      if (subjectTimer.running) subjectPause();
      subjectTimer.name = name; subjectTimer.seconds = 0;
      renderSubjects(); subjectStart();
      return;
    }
    case 'planner-prev': {
      const days = plannerDays();
      let copied = 0;
      days.forEach((d, i) => {
        const src = state.planner[dateKey(addDays(d, -7))] || {};
        const target = dateKey(d);
        state.planner[target] = state.planner[target] || {};
        Object.keys(src).forEach((slot) => {
          if (!state.planner[target][slot]) { state.planner[target][slot] = src[slot]; copied++; }
        });
      });
      if (!copied) return toast('Nenhum bloco livre para copiar da semana anterior.', 'fa-calendar-week', true);
      save(); renderPlanner(); renderHoje();
      toast(copied + ' bloco(s) copiados da semana anterior.', 'fa-copy');
      return;
    }
    case 'stats-checkin': { const b = $('#statsCheckinBtn'); if (b) b.click(); return; }
    case 'diary-today': {
      const date = $('#diaryDate'); if (date) date.value = dateKey();
      const ta = $('#diaryText'); if (ta) ta.dataset.dirty = '';
      renderDiary();
      if (ta) ta.focus();
      return;
    }
    case 'chat-export': { const b = $('#chatExportBtn'); if (b) b.click(); return; }
    case 'cmd-help': switchTab('commands'); runCommand('ajuda'); return;
    case 'store-next': {
      const next = THEMES.filter((t) => !state.themesOwned.includes(t.id)).sort((a, b) => a.price - b.price)[0];
      if (!next) return toast('Você já tem todos os temas da loja.', 'fa-store');
      if (state.coins < next.price) return toast('Faltam ' + money(next.price - state.coins) + ' moedas para ' + next.name + '.', 'fa-coins', true);
      buyOrEquipTheme(next.id);
      return;
    }
    case 'title-best': {
      const unlocked = LEVELS.filter((l) => state.xp >= l.xp);
      const best = unlocked[unlocked.length - 1];
      if (!best) return toast('Nenhum título liberado ainda.', 'fa-crown', true);
      if (best.title === state.title) return toast('Você já está com o melhor título liberado.', 'fa-crown');
      state.title = best.title; save(); renderTitles(); renderTopbar();
      toast('Título equipado: ' + best.title + '.', 'fa-crown');
      return;
    }
    case 'pets-next': {
      const next = PETS.filter((p) => !state.petsOwned.includes(p.id)).sort((a, b) => a.price - b.price)[0];
      if (!next) return toast('Você já adotou todos os pets.', 'fa-paw');
      if (state.coins < next.price) return toast('Faltam ' + money(next.price - state.coins) + ' moedas para ' + next.name + '.', 'fa-coins', true);
      petAction(next.id);
      return;
    }
    case 'journey-claim': {
      const ready = v25ReadyMilestones();
      if (!ready.length) return toast('Nenhum marco pronto para resgatar.', 'fa-flag', true);
      const coins = ready.reduce((a, m) => a + m.coins, 0);
      const xp = ready.reduce((a, m) => a + m.xp, 0);
      ready.forEach((m) => { if (!state.milestonesClaimed.includes(m.id)) state.milestonesClaimed.push(m.id); });
      addCoins(coins); addXp(xp); save(); renderJourney();
      toast(ready.length + ' marco(s) resgatados · +' + money(coins) + ' moedas e XP.', 'fa-gift');
      return;
    }
    case 'clicker-best': {
      for (let i = CLICKER_EXCHANGES.length - 1; i >= 0; i--) {
        if ((state.clicker.points || 0) >= CLICKER_EXCHANGES[i].energy) { exchangeClicker(i); return; }
      }
      return toast('Junte 50 ⚡ para a primeira troca.', 'fa-bolt', true);
    }
    case 'rewards-active': runV24Action('rewards-copy', btn); return;
    case 'note-new': switchTab('notes'); { const b = $('#noteNewBtn'); if (b) b.click(); } return;
    case 'ambient-focus': {
      switchTab('ambient');
      const sel = $('#ambientPreset');
      if (sel) { sel.value = 'focus'; sel.dispatchEvent(new Event('change', { bubbles: true })); }
      return;
    }
    case 'keysound-test': {
      if (!state.keySounds.on) { state.keySounds.on = true; save(); renderKeySounds(); }
      playKeySound();
      toast('Som de tecla: ' + state.keySounds.style + '.', 'fa-keyboard');
      return;
    }
    case 'calc-history': runV24Action('calc-copy', btn); return;
    case 'chars-favs': runV24Action('chars-copy-favs', btn); return;
    case 'title-apply': { const b = $('#titleApplyBtn'); if (b) b.click(); return; }
    case 'pass-generate': { generatePassword(); toast('Nova senha gerada.', 'fa-shield-halved'); return; }
    case 'portal-open': runV24Action('portal-open', btn); return;
    case 'event-copy': runV24Action('event-copy', btn); return;
    case 'devlog-recent': openDevlogRecent(); return;
    case 'rebirth-open': switchTab('rebirth'); return;
    default: return;
  }
}

/* ---------- 38-C. Inicialização e ciclo do radar ---------- */
const paintSwitchV25 = switchTab;
switchTab = function (id, opts) {
  paintSwitchV25(id, opts);
  hideItemPreviewV25();
  v25PaintInsight(id);
};
function initV25() {
  if (initV25.ready) return;
  initV25.ready = true;
  buildV25Insights();
  bindItemPreviewV25();
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-v25-action]');
    if (b && !b.disabled) v25RunAction(b.dataset.v25Action, b);
  });
  setInterval(() => { if (!document.hidden) v25RefreshInsight(); }, 20000);
  v25PaintInsight(state.currentTab || 'hoje');
}

/* Fim do núcleo v25. */

/* ============================================================
   v26.0.0 — REBIRTH, FAVORITOS, WALLPAPERS E PREVIEWS RICOS
   Renascimento com foguete, cinco ciclos cósmicos, favoritos
   persistentes, wallpapers por tema e gráficos temáticos.
   ============================================================ */

/* ---------- 39-A. Favoritos persistentes ---------- */
const FAV_KIND_LABEL = { themes: 'tema', pets: 'pet', titles: 'título' };
function favCount(kind) { return ((state.favs || {})[kind] || []).length; }
function v26RefreshPreview() {
  let card = itemPreviewCardV26;
  if (!card || !document.body.contains(card)) {
    const key = itemPreviewKey || '';
    const split = key.indexOf(':');
    const kind = split >= 0 ? key.slice(0, split) : '';
    const id = split >= 0 ? key.slice(split + 1) : '';
    const attr = { theme: 'data-theme-card', pet: 'data-pet-card', title: 'data-title-card', rebirth: 'data-rebirth-card' }[kind];
    if (attr && id) card = document.querySelector('.page.active [' + attr + '="' + id.replace(/"/g, '') + '"]');
  }
  if (!card) { hideItemPreviewV25(); return; }
  itemPreviewCardV26 = card;
  itemPreviewKey = '';
  v25ShowItemPreview(card);
}
let itemPreviewCardV26 = null;
const v25ShowItemPreviewBase = v25ShowItemPreview;
v25ShowItemPreview = function (card) {
  itemPreviewCardV26 = card;
  v25ShowItemPreviewBase(card);
};
function v26ToggleFavorite(kind, id) {
  const on = toggleFav(kind, id);
  if (kind === 'themes' && $('#themeGrid')) renderStore();
  if (kind === 'pets' && $('#petGrid')) renderPets();
  if (kind === 'titles' && $('#titleGrid')) renderTitles();
  if (itemPreviewKey) v26RefreshPreview();
  toast((on ? 'Adicionado aos favoritos: ' : 'Removido dos favoritos: ') + (FAV_KIND_LABEL[kind] || 'item') + ' ' + id + '.', on ? 'fa-heart' : 'fa-heart-crack');
}
function bindFavoritesV26() {
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-fav-kind]');
    if (!b) return;
    e.preventDefault();
    e.stopPropagation();
    v26ToggleFavorite(b.dataset.favKind, b.dataset.favId);
  });
}

/* ---------- 39-B. Previews com mais informação ---------- */
function v26Pips(a, b) {
  return '<span class="ip-palette"><i style="background:' + a + '"></i><i style="background:' + b + '"></i><i style="background:color-mix(in srgb, ' + a + ' 55%, ' + b + ')"></i></span>';
}
function v26FavRow(kind, id, label) {
  return '<div class="ip-fav-row">' + favButton(kind, id, label) + '<span>' + (isFav(kind, id) ? 'Nos seus favoritos' : 'Favoritar ' + esc(label || '')) + '</span></div>';
}
v25ThemePreview = function (card) {
  const t = THEMES.find((x) => x.id === card.dataset.themeCard);
  if (!t) return null;
  const owned = state.themesOwned.includes(t.id);
  const equipped = state.theme === t.id;
  const locked = themeLocked(t);
  return {
    key: 'theme:' + t.id,
    html: '<div class="ip-card ip-theme" style="--ip-a:' + t.a + ';--ip-b:' + t.b + '">' +
      '<div class="ip-theme-art"><span class="ip-theme-orb"></span><span class="ip-sheen"></span><span class="ip-art-caption">' + esc(t.name) + '</span></div>' +
      '<div class="ip-body"><b class="ip-name">' + esc(t.name) + '</b>' +
      '<span class="ip-sub">' + (equipped ? 'Em uso agora neste hub' : owned ? 'Na coleção, pronto para equipar' : locked ? 'Exclusivo de quem renasce' : 'Disponível na Loja') + '</span>' +
      '<div class="ip-rows">' +
        '<div class="ip-row"><span>Wallpaper</span><b>' + esc(t.wall || 'Gradiente animado da paleta') + '</b></div>' +
        '<div class="ip-row"><span>Paleta</span><b>' + v26Pips(t.a, t.b) + ' ' + t.a + ' · ' + t.b + '</b></div>' +
        '<div class="ip-row"><span>Origem</span><b>' + (t.rebirth ? 'Rebirth ' + t.rebirth : t.price ? money(t.price) + ' moedas' : 'tema inicial') + '</b></div>' +
      '</div>' +
      '<div class="ip-tags">' + v25Tag(owned ? 'adquirido' : locked ? 'Rebirth ' + t.rebirth : money(t.price) + ' moedas', owned ? '' : locked ? 'danger' : 'gold') + v25Tag(equipped ? 'equipado' : locked ? 'renasça para liberar' : 'clique para ' + (owned ? 'equipar' : 'comprar')) + '</div>' +
      v26FavRow('themes', t.id, t.name) + '</div></div>'
  };
};
v25PetPreview = function (card) {
  const p = PETS.find((x) => x.id === card.dataset.petCard);
  if (!p) return null;
  const owned = state.petsOwned.includes(p.id);
  const active = state.pet === p.id;
  const energy = clamp(Number((state.petEnergy || {})[p.id]) || 0, 0, 100);
  const level = petLevel(p.id);
  const income = Math.round(p.income * (1 + (level - 1) * 0.15));
  const xp = Number((state.petXp || {})[p.id]) || 0;
  const nextXp = 60 - (xp % 60);
  const locked = petLocked(p);
  return {
    key: 'pet:' + p.id,
    html: '<div class="ip-card ip-pet">' +
      '<div class="ip-pet-art"><span class="ip-pet-emoji">' + p.emoji + '</span><span class="ip-pet-ring"></span></div>' +
      '<div class="ip-body"><b class="ip-name">' + esc(p.name) + '</b>' +
      '<span class="ip-sub">' + (owned ? 'Nível ' + level + ' · +' + income + ' moedas a cada 5s' : locked ? 'Exclusivo do Rebirth ' + p.rebirth : money(p.price) + ' moedas para adotar') + '</span>' +
      '<div class="ip-rows">' +
        '<div class="ip-row"><span>Renda</span><b>' + income + '/5s · ' + money(income * 720) + '/h</b></div>' +
        '<div class="ip-row"><span>Nível</span><b>' + level + '/10 · faltam ' + nextXp + ' XP de pet</b></div>' +
        '<div class="ip-row"><span>Origem</span><b>' + (p.rebirth ? 'Rebirth ' + p.rebirth : 'Loja de pets') + '</b></div>' +
      '</div>' +
      '<div class="ip-meter"><span style="width:' + (owned ? energy : 0) + '%"></span></div>' +
      '<span class="ip-sub">' + (owned ? 'energia ' + Math.round(energy) + '/100' : 'renda base ' + p.income + ' moedas/5s') + '</span>' +
      '<div class="ip-tags">' + v25Tag(owned ? (active ? 'acompanhando' : 'na coleção') : locked ? 'bloqueado' : 'disponível', owned ? '' : locked ? 'danger' : 'gold') + v25Tag(owned ? 'alimentar 15' : 'adotar', owned ? '' : 'gold') + '</div>' +
      v26FavRow('pets', p.id, p.name) + '</div></div>'
  };
};
v25TitlePreview = function (card) {
  const name = card.dataset.titleCard;
  const l = titlePool().find((x) => x.title === name);
  if (!l) return null;
  const unlocked = l.source === 'rebirth' ? Number(state.rebirths || 0) >= l.rebirth : state.xp >= l.xp;
  const equipped = state.title === l.title;
  return {
    key: 'title:' + l.title,
    html: '<div class="ip-card ip-title">' +
      '<div class="ip-title-art"><span class="ip-crown"><i class="fa-solid ' + (l.icon || 'fa-crown') + '"></i></span><span class="ip-crown-glow"></span></div>' +
      '<div class="ip-body"><b class="ip-name">' + esc(l.title) + '</b>' +
      '<span class="ip-sub">' + (unlocked ? 'Liberado para equipar' : l.source === 'rebirth' ? 'Requer o Rebirth ' + l.rebirth : 'Faltam ' + money(l.xp - state.xp) + ' XP') + '</span>' +
      '<div class="ip-rows">' +
        '<div class="ip-row"><span>Origem</span><b>' + (l.source === 'rebirth' ? 'Rebirth ' + l.rebirth : 'Progressão por XP') + '</b></div>' +
        '<div class="ip-row"><span>Requisito</span><b>' + (l.source === 'rebirth' ? 'renascer ' + l.rebirth + 'x' : money(l.xp) + ' XP') + '</b></div>' +
      '</div>' +
      '<div class="ip-tags">' + v25Tag(l.source === 'rebirth' ? 'exclusivo' : money(l.xp) + ' XP', 'gold') + v25Tag(equipped ? 'equipado' : unlocked ? 'pronto para equipar' : 'bloqueado') + '</div>' +
      v26FavRow('titles', l.title, l.title) + '</div></div>'
  };
};
function v26RebirthPreview(card) {
  const r = REBIRTH_TIERS.find((x) => String(x.n) === card.dataset.rebirthCard);
  if (!r) return null;
  const done = state.rebirths >= r.n;
  const current = state.rebirths + 1 === r.n;
  const pct = current ? clamp((state.xp / r.req) * 100, 0, 100) : done ? 100 : 0;
  const theme = THEMES.find((t) => t.id === r.theme);
  const pet = PETS.find((p) => p.id === r.pet);
  return {
    key: 'rebirth:' + r.n,
    html: '<div class="ip-card ip-rebirth" style="--ip-a:' + r.color + '">' +
      '<div class="ip-rebirth-art"><i class="fa-solid ' + r.icon + '"></i><span class="ip-rebirth-orbit"></span></div>' +
      '<div class="ip-body"><b class="ip-name">Rebirth ' + r.n + ' · ' + esc(r.name) + '</b>' +
      '<span class="ip-sub">' + esc(r.blurb) + '</span>' +
      '<div class="ip-rows">' +
        '<div class="ip-row"><span>Requisito</span><b>' + money(r.req) + ' XP</b></div>' +
        '<div class="ip-row"><span>Tema</span><b>' + (theme ? esc(theme.name) : '—') + '</b></div>' +
        '<div class="ip-row"><span>Título</span><b>' + esc(r.title) + '</b></div>' +
        '<div class="ip-row"><span>Pet</span><b>' + (pet ? pet.emoji + ' ' + esc(pet.name) : '—') + '</b></div>' +
      '</div>' +
      '<div class="ip-meter"><span style="width:' + pct + '%"></span></div>' +
      '<div class="ip-tags">' + v25Tag(done ? 'concluído' : current ? Math.round(pct) + '% · ' + money(Math.max(0, r.req - state.xp)) + ' XP restante' : 'bloqueado', done ? 'gold' : '') + v25Tag('+' + Math.round(r.n * 30) + '% permanente') + '</div></div></div>'
  };
}
const v25BuildItemPreviewBase = v25BuildItemPreview;
v25BuildItemPreview = function (card) {
  if (card && card.matches('[data-rebirth-card]')) return v26RebirthPreview(card);
  return v25BuildItemPreviewBase(card);
};

/* ---------- 39-C. Rebirth: estado, render e animação ---------- */
let rebirthArmed = false;
let rebirthArmTimer = null;
function rebirthTier() { return REBIRTH_TIERS[state.rebirths] || null; }
function rebirthReady() { const r = rebirthTier(); return !!r && Number(state.xp) >= r.req; }
function rebirthProgressPct() {
  const r = rebirthTier();
  return r ? clamp((Number(state.xp) / r.req) * 100, 0, 100) : 100;
}
function v26PaintRebirthTopbar() {
  const pill = $('#rebirthMultPill');
  if (!pill) return;
  pill.innerHTML = '<i class="fa-solid fa-rocket"></i><b id="rebirthMultValue">x' + rebirthMultiplier().toFixed(1).replace('.0', '') + '</b><span class="stat-suffix">' + state.rebirths + ' rebirth' + (state.rebirths === 1 ? '' : 's') + '</span>';
  pill.title = 'Multiplicador de Rebirth x' + rebirthMultiplier().toFixed(1) + ' · soma +30% por renascimento em XP e moedas';
}
function renderRebirth() {
  v26PaintRebirthTopbar();
  const r = rebirthTier();
  const done = !r;
  const pct = rebirthProgressPct();
  const tierName = $('#rebirthTierName');
  if (tierName) tierName.textContent = done ? 'Lenda do Cosmos' : r.name;
  const mult = $('#rebirthMultiplierLabel');
  if (mult) mult.textContent = 'x' + rebirthMultiplier().toFixed(1).replace('.0', '');
  const cur = $('#rebirthCurrentBadge');
  if (cur) cur.textContent = state.rebirths + '/5 renascimentos';
  const prog = $('#rebirthProgressFill');
  if (prog) prog.style.width = (done ? 100 : pct) + '%';
  const progText = $('#rebirthProgressText');
  if (progText) progText.textContent = done ? 'Todos os ciclos concluídos' : money(state.xp) + ' / ' + money(r.req) + ' XP · ' + Math.round(pct) + '%';
  const nextReq = $('#rebirthNextReq');
  if (nextReq) nextReq.textContent = done ? 'Máximo' : money(Math.max(0, r.req - state.xp)) + ' XP restante';
  const btn = $('#rebirthBtn');
  if (btn) {
    btn.disabled = done || !rebirthReady();
    btn.innerHTML = done ? '<i class="fa-solid fa-crown"></i> Ciclo máximo concluído'
      : !rebirthReady() ? '<i class="fa-solid fa-lock"></i> Faltam ' + money(r.req - state.xp) + ' XP'
      : rebirthArmed ? '<i class="fa-solid fa-triangle-exclamation"></i> Confirmar renascimento' : '<i class="fa-solid fa-rocket"></i> Iniciar Rebirth ' + r.n + ' · ' + r.name;
    btn.classList.toggle('armed', !!rebirthArmed && !done && rebirthReady());
  }
  const stats = $('#rebirthStats');
  if (stats) {
    stats.innerHTML = [
      { label: 'Multiplicador', value: 'x' + rebirthMultiplier().toFixed(1).replace('.0', ''), icon: 'fa-rocket' },
      { label: 'Bônus permanente', value: '+' + (state.rebirths * 30) + '%', icon: 'fa-arrow-trend-up' },
      { label: 'Renascimentos', value: state.rebirths + '/5', icon: 'fa-layer-group' },
      { label: 'Recorde de XP', value: money(state.rebirthBest || 0) + ' XP', icon: 'fa-trophy' },
      { label: 'Favoritos', value: favCount('themes') + favCount('pets') + favCount('titles'), icon: 'fa-heart' },
      { label: 'Tema atual', value: (THEMES.find((t) => t.id === state.theme) || {}).name || '—', icon: 'fa-palette' }
    ].map((s) => '<div class="stat-card"><span class="sc-label"><i class="fa-solid ' + s.icon + '"></i> ' + s.label + '</span><b class="sc-value">' + esc(s.value) + '</b></div>').join('');
  }
  const grid = $('#rebirthGrid');
  if (grid) {
    grid.innerHTML = REBIRTH_TIERS.map((t) => {
      const isDone = state.rebirths >= t.n;
      const isCurrent = state.rebirths + 1 === t.n;
      const theme = THEMES.find((x) => x.id === t.theme);
      const pet = PETS.find((x) => x.id === t.pet);
      return '<article class="rebirth-card' + (isDone ? ' done' : '') + (isCurrent ? ' current' : '') + '" data-rebirth-card="' + t.n + '" style="--rb:' + t.color + '">' +
        '<div class="rb-head"><span class="rb-icon"><i class="fa-solid ' + t.icon + '"></i></span><div><span class="kicker">Ciclo ' + t.n + '</span><h4>' + esc(t.name) + '</h4></div>' + (isDone ? '<span class="badge gold">concluído</span>' : isCurrent ? '<span class="badge">atual</span>' : '<span class="badge danger">bloqueado</span>') + '</div>' +
        '<p class="rb-blurb">' + esc(t.blurb) + '</p>' +
        '<div class="rb-req"><span>' + money(t.req) + ' XP</span><b>+' + (t.n * 30) + '% permanente</b></div>' +
        '<div class="rb-unlocks">' +
          '<span><i class="fa-solid fa-palette"></i> ' + (theme ? esc(theme.name) : '—') + '</span>' +
          '<span><i class="fa-solid fa-crown"></i> ' + esc(t.title) + '</span>' +
          '<span><i class="fa-solid fa-paw"></i> ' + (pet ? pet.emoji + ' ' + esc(pet.name) : '—') + '</span>' +
        '</div>' +
        '<div class="rb-status">' + (isDone ? 'Tema, título e pet liberados' : isCurrent ? 'Em progresso · ' + Math.round(rebirthProgressPct()) + '%' : 'Requer os ciclos anteriores') + '</div></article>';
    }).join('');
  }
  const log = $('#rebirthLog');
  if (log) {
    const items = (state.rebirthLog || []).slice(0, 8);
    log.innerHTML = items.length ? items.map((l) => '<div class="rebirth-log-item"><i class="fa-solid fa-rocket"></i><div><b>Rebirth ' + l.n + ' · ' + esc(l.name) + '</b><span>' + prettyDate(dateKey(new Date(l.at))) + ' · ' + money(l.xp || 0) + ' XP e ' + money(l.coins || 0) + ' moedas convertidos</span></div><span class="badge">x' + (1 + l.n * 0.3).toFixed(1).replace('.0', '') + '</span></div>').join('')
      : '<div class="empty">Nenhum renascimento ainda. Junte ' + money(REBIRTH_TIERS[0].req) + ' XP e acenda o primeiro foguete.</div>';
  }
}
function runRebirth() {
  const r = rebirthTier();
  if (!r) return toast('Todos os renascimentos já foram concluídos.', 'fa-crown', true);
  if (!rebirthReady()) return toast('Faltam ' + money(r.req - state.xp) + ' XP para o Rebirth ' + r.n + '.', 'fa-lock', true);
  if (!rebirthArmed) {
    rebirthArmed = true;
    clearTimeout(rebirthArmTimer);
    rebirthArmTimer = setTimeout(() => { rebirthArmed = false; renderRebirth(); }, 6000);
    renderRebirth();
    toast('Confirme no botão: XP e moedas serão zerados, todo o resto fica.', 'fa-triangle-exclamation');
    return;
  }
  clearTimeout(rebirthArmTimer);
  rebirthArmed = false;
  v26PlayLaunch(() => {
    const tier = rebirthTier();
    if (!tier) return;
    state.rebirthLog = state.rebirthLog || [];
    state.rebirthLog.unshift({ n: tier.n, name: tier.name, at: Date.now(), xp: Number(state.xp) || 0, coins: Number(state.coins) || 0 });
    state.rebirthLog = state.rebirthLog.slice(0, 20);
    state.rebirths = clamp((state.rebirths || 0) + 1, 0, 5);
    state.rebirthBest = Math.max(Number(state.rebirthBest) || 0, Number(state.xp) || 0);
    state.xp = 0;
    state.coins = 0;
    if (!state.themesOwned.includes(tier.theme)) state.themesOwned.push(tier.theme);
    if (!state.petsOwned.includes(tier.pet)) state.petsOwned.push(tier.pet);
    state.petEnergy[tier.pet] = 100;
    state.title = tier.title;
    state.milestonesClaimed = state.milestonesClaimed || [];
    saveNow();
    renderTopbar(); renderRebirth(); renderStore(); renderTitles(); renderPets(); renderJourney(); renderHoje(); renderRewards();
    if (state.currentTab === 'stats') renderStats();
    toast('Rebirth ' + tier.n + ' concluído: +30% permanente, ' + tier.title + ' e pacote ' + tier.name + '.', 'fa-rocket');
  });
}
function v26PlayLaunch(done) {
  const overlay = $('#rebirthLaunch');
  const caption = $('#rebirthLaunchCaption');
  if (!overlay) { done(); return; }
  overlay.hidden = false;
  overlay.setAttribute('aria-hidden', 'false');
  overlay.classList.remove('run');
  void overlay.offsetWidth;
  overlay.classList.add('run');
  if (caption) caption.textContent = 'Ignição confirmada · decolando';
  const fast = !!state.motionReduced;
  setTimeout(() => {
    done();
    if (caption) caption.textContent = 'Órbita alcançada · novo ciclo aberto';
  }, fast ? 700 : 1800);
  setTimeout(() => {
    overlay.classList.remove('run');
    overlay.hidden = true;
    overlay.setAttribute('aria-hidden', 'true');
  }, fast ? 1400 : 3600);
}
function bindRebirth() {
  document.addEventListener('click', (e) => {
    if (e.target.closest('#rebirthBtn')) runRebirth();
  });
  renderRebirth();
}

/* ---------- 39-D. Gráficos temáticos e donut de matérias ---------- */
const v26RenderStatsBase = renderStats;
renderStats = function () {
  v26RenderStatsBase();
  v26PaintCharts();
};
RENDERERS.stats = renderStats;
function v26ChartMeta() {
  const card = $('#weeklyChart') && $('#weeklyChart').closest('.card');
  if (!card) return null;
  let meta = $('#statsChartMeta');
  if (!meta) {
    meta = document.createElement('div');
    meta.id = 'statsChartMeta';
    meta.className = 'chart-meta';
    const chart = $('#weeklyChart');
    card.insertBefore(meta, chart);
  }
  return meta;
}
function v26PaintCharts() {
  const chart = $('#weeklyChart');
  if (chart) {
    const series = seriesFocus(statsDays);
    const total = series.reduce((a, b) => a + b.minutes, 0);
    const avg = Math.round(total / statsDays);
    const max = Math.max(60, Math.max.apply(null, series.map((s) => s.minutes)));
    chart.classList.add('v26-chart');
    chart.style.setProperty('--goal-y', clamp((60 / max) * 100, 0, 100).toFixed(1) + '%');
    chart.dataset.goal = 'meta 60min';
    const meta = v26ChartMeta();
    if (meta) {
      const best = series.slice().sort((a, b) => b.minutes - a.minutes)[0];
      meta.innerHTML = '<span><i class="fa-solid fa-chart-line"></i> média <b>' + fmtMinutes(avg) + '</b></span><span><i class="fa-solid fa-bullseye"></i> meta <b>60min</b></span><span><i class="fa-solid fa-trophy"></i> melhor dia <b>' + esc(best ? best.label : '—') + ' · ' + fmtMinutes(best ? best.minutes : 0) + '</b></span><span class="chart-theme"><i class="fa-solid fa-palette"></i> paleta <b>' + esc((THEMES.find((t) => t.id === state.theme) || {}).name || 'Geekie') + '</b></span>';
    }
  }
  const donut = $('#subjectDonut');
  const legend = $('#subjectDonutLegend');
  if (donut) {
    const entries = Object.entries(state.subjectMinutes || {}).filter(([, m]) => m > 0).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const total = entries.reduce((a, [, m]) => a + m, 0);
    if (!total) {
      donut.style.background = 'conic-gradient(rgba(255,255,255,.08) 0 100%)';
      donut.classList.add('empty');
      if (legend) legend.innerHTML = '<span class="hint">Registre foco por matéria para montar o gráfico.</span>';
    } else {
      const colors = ['var(--primary)', 'var(--primary-2)', 'var(--accent)', 'var(--violet)', 'var(--gold)', 'var(--danger)'];
      let acc = 0;
      const parts = entries.map(([, m], i) => {
        const from = acc;
        acc += (m / total) * 100;
        return colors[i] + ' ' + from.toFixed(1) + '% ' + acc.toFixed(1) + '%';
      });
      donut.classList.remove('empty');
      donut.style.background = 'conic-gradient(' + parts.join(', ') + ')';
      if (legend) legend.innerHTML = entries.map(([name, m], i) => '<span class="donut-legend-row"><i style="background:' + colors[i] + '"></i>' + esc(name) + '<b>' + Math.round((m / total) * 100) + '%</b></span>').join('');
    }
  }
}

/* ---------- 39-E. Segunda ação contextual em todas as abas ---------- */
function v26QuizScore() {
  const h = state.quizHistory || [];
  const total = h.reduce((a, q) => a + (Number(q.total) || 0), 0);
  const score = h.reduce((a, q) => a + (Number(q.score) || 0), 0);
  return { n: h.length, score, total, pct: total ? Math.round((score / total) * 100) : 0 };
}
const V26_ACTIONS = {
  hoje: { label: 'Check-in', icon: 'fa-fire-flame-curved', run: () => doDailyCheckin() },
  timer: { label: 'Pausa 5 min', icon: 'fa-mug-hot', run: () => { if (pomo.running) return toast('Já existe um ciclo rodando.', 'fa-clock', true); if (typeof pomoSetMode === 'function') pomoSetMode('short'); renderTimer(); pomoStart(); } },
  goals: { label: 'Copiar metas', icon: 'fa-copy', run: () => v24Copy(v24GoalsMarkdown(), 'Metas copiadas.') },
  flashcards: { label: 'Só devidos', icon: 'fa-filter', run: () => { const due = dueCards(); if (!due.length) return toast('Nenhum card devido agora.', 'fa-clone'); flash.queue = due; flash.idx = 0; flash.flipped = false; renderFlashcards(); toast(due.length + ' card(s) devidos na fila.', 'fa-filter'); } },
  quiz: { label: 'Copiar placar', icon: 'fa-copy', run: () => { const q = v26QuizScore(); v24Copy('Quiz Geekie · ' + q.n + ' rodada(s) · ' + q.score + '/' + q.total + ' acertos (' + q.pct + '%) · recorde ' + state.quizBest, 'Placar copiado.'); } },
  subjects: { label: 'Copiar totais', icon: 'fa-copy', run: () => { const rows = Object.entries(state.subjectMinutes || {}).sort((a, b) => b[1] - a[1]); v24Copy(rows.length ? rows.map(([s, m]) => s + ': ' + fmtMinutes(m)).join('\n') : '', 'Totais de matérias copiados.'); } },
  planner: { label: 'Copiar semana', icon: 'fa-copy', run: () => runV24Action('planner-copy') },
  stats: { label: 'Exportar CSV', icon: 'fa-file-csv', run: () => { const b = $('#statsExportBtn'); if (b) b.click(); } },
  diary: { label: 'Copiar 7 dias', icon: 'fa-copy', run: () => runV24Action('diary-copy') },
  chat: { label: 'Copiar resposta', icon: 'fa-copy', run: () => { const last = (state.chatHistory || []).slice().reverse().find((m) => m.role !== 'user'); v24Copy(last ? last.content : '', 'Última resposta copiada.'); } },
  commands: { label: 'Ajuda', icon: 'fa-circle-question', run: () => runCommand('ajuda') },
  store: { label: 'Só favoritos', icon: 'fa-heart', run: () => { storeFilter = 'fav'; $$('#storeFilters .chip').forEach((c) => c.classList.toggle('active', c.dataset.filter === 'fav')); renderStore(); toast(favCount('themes') + ' tema(s) favorito(s).', 'fa-heart'); } },
  titles: { label: 'Só favoritos', icon: 'fa-heart', run: () => { titleFilter = 'fav'; $$('#titleFilters .chip').forEach((c) => c.classList.toggle('active', c.dataset.filter === 'fav')); renderTitles(); toast(favCount('titles') + ' título(s) favorito(s).', 'fa-heart'); } },
  pets: { label: 'Alimentar ativo', icon: 'fa-bowl-food', run: () => { if (!state.pet) return toast('Equipe um pet primeiro.', 'fa-paw', true); feedPet(state.pet); } },
  journey: { label: 'Comprar escudo', icon: 'fa-shield-halved', run: () => { const b = $('#statsShieldBtn'); if (b) b.click(); } },
  clicker: { label: 'Melhor troca', icon: 'fa-arrows-rotate', run: () => v25RunAction('clicker-best') },
  rebirth: { label: 'Renascencer', icon: 'fa-rocket', run: () => runRebirth() },
  rewards: { label: 'Copiar ativos', icon: 'fa-copy', run: () => v24Copy(v25ActiveRewards().map((r) => r.code).join(', '), 'Códigos ativos copiados.') },
  notes: { label: 'Nova nota', icon: 'fa-plus', run: () => { const b = $('#noteNewBtn'); if (b) b.click(); } },
  ambient: { label: 'Preset foco', icon: 'fa-headphones', run: () => { const s = $('#ambientPreset'); if (!s) return; s.value = 'focus'; s.dispatchEvent(new Event('change', { bubbles: true })); } },
  keysounds: { label: 'Testar som', icon: 'fa-keyboard', run: () => playKeySound() },
  calculator: { label: 'Histórico', icon: 'fa-clock-rotate-left', run: () => v25RunAction('calc-history') },
  chars: { label: 'Favoritos', icon: 'fa-star', run: () => v25RunAction('chars-favs') },
  title: { label: 'Aplicar', icon: 'fa-check', run: () => { const b = $('#titleApplyBtn'); if (b) b.click(); } },
  password: { label: 'Gerar nova', icon: 'fa-shuffle', run: () => generatePassword() },
  geekie: { label: 'Recarregar', icon: 'fa-rotate', run: () => loadIframe('geekieIframe', 'iframeLoading') },
  google: { label: 'Recarregar', icon: 'fa-rotate', run: () => loadIframe('googleIframe', null) },
  events: { label: 'Copiar evento', icon: 'fa-calendar-day', run: () => runV24Action('event-copy') },
  devlog: { label: 'Exportar .md', icon: 'fa-file-arrow-down', run: () => runV24Action('devlog-export') }
};
function buildV26Insights() {
  $$('.page[data-tab]').forEach((page) => {
    const id = page.dataset.tab;
    const meta = V26_ACTIONS[id];
    const row = $('.v25-insight', page);
    if (!meta || !row || $('[data-v26-action]', row)) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn btn-secondary btn-sm v26-insight-action';
    b.dataset.v26Action = id;
    b.innerHTML = '<i class="fa-solid ' + meta.icon + '"></i> ' + esc(meta.label);
    row.appendChild(b);
  });
}
function bindV26Actions() {
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-v26-action]');
    if (!b || b.disabled) return;
    const meta = V26_ACTIONS[b.dataset.v26Action];
    if (meta) { try { meta.run(b); } catch (err) { console.warn('Geekie v26:', err); } }
  });
}

/* ---------- 39-F. Atalhos, comandos e inicialização ---------- */
const v24RunActionBase = runV24Action;
runV24Action = function (action, btn) {
  if (action === 'rebirth-run') { switchTab('rebirth'); runRebirth(); return; }
  if (action === 'rebirth-copy') {
    const rows = (state.rebirthLog || []).map((l) => 'Rebirth ' + l.n + ' · ' + l.name + ' · ' + money(l.xp || 0) + ' XP · ' + money(l.coins || 0) + ' moedas');
    v24Copy(rows.length ? rows.join('\n') : '', 'Histórico de Rebirth copiado.');
    return;
  }
  return v24RunActionBase(action, btn);
};
function bindV26Shortcuts() {
  document.addEventListener('keydown', (e) => {
    const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement && document.activeElement.tagName);
    if (typing) return;
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'g') {
      e.preventDefault();
      switchTab('rebirth');
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
      const tab = state.currentTab;
      if (tab !== 'store' && tab !== 'pets' && tab !== 'titles') return;
      e.preventDefault();
      if (tab === 'store') { storeFilter = storeFilter === 'fav' ? 'all' : 'fav'; renderStore(); }
      else if (tab === 'pets') { petFilter = petFilter === 'fav' ? 'all' : 'fav'; renderPets(); }
      else { titleFilter = titleFilter === 'fav' ? 'all' : 'fav'; renderTitles(); }
      toast('Filtro de favoritos da aba ' + (TAB_MAP[tab] ? TAB_MAP[tab].title : tab) + '.', 'fa-heart');
    }
  });
}
function registerV26Commands() {
  if (typeof COMMANDS !== 'object' || !COMMANDS) return;
  Object.assign(COMMANDS, {
    rebirth: { desc: 'Abre a aba Rebirth e mostra o próximo ciclo', run: () => { switchTab('rebirth'); const r = rebirthTier(); return r ? 'Rebirth ' + r.n + ' · ' + r.name + ' · ' + state.xp + '/' + r.req + ' XP · multiplicador x' + rebirthMultiplier().toFixed(1) : 'Todos os renascimentos concluídos.'; } },
    favoritos: { desc: 'Abre a Loja no filtro de favoritos', run: () => { switchTab('store'); storeFilter = 'fav'; $$('#storeFilters .chip').forEach((c) => c.classList.toggle('active', c.dataset.filter === 'fav')); renderStore(); return favCount('themes') + ' tema(s), ' + favCount('pets') + ' pet(s) e ' + favCount('titles') + ' título(s) favoritos.'; } },
    wallpaper: { desc: 'Mostra o wallpaper do tema equipado', run: () => { const t = THEMES.find((x) => x.id === state.theme) || THEMES[0]; return t.name + ' · ' + (t.wall || 'gradiente da paleta') + ' · ' + t.a + ' → ' + t.b; } }
  });
}
const v26PaintTopbarBase = paintTopbar;
paintTopbar = function () {
  v26PaintTopbarBase();
  v26PaintRebirthTopbar();
};
function initV26() {
  if (initV26.ready) return;
  initV26.ready = true;
  bindFavoritesV26();
  bindRebirth();
  bindV26Actions();
  bindV26Shortcuts();
  registerV26Commands();
  buildV26Insights();
  v26PaintCharts();
  v26PaintRebirthTopbar();
}

/* Compatibilidade: o rodapé do núcleo v24 é mantido como marcador. */

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
