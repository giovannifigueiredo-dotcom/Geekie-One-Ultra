/* ============================================================
 * Geekie Study Hub — script.js (v19.4.0)
 * v19.4.0: correções de carregamento, estado persistente, sistema de
 *          animação por TIPO de botão, Dev Log reestruturado e README.
 * Comportamento 100% no navegador: nada é enviado para servidores.
 * ============================================================ */
'use strict';

/* ============ 0. UTILITÁRIOS ============ */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const STORAGE_KEY = 'geekieHubState_v194';
const ACCOUNTS_KEY = 'geekieHubAccounts_v194';
const SESSION_KEY = 'geekieHubSession_v194';

function uid() { return Math.random().toString(36).slice(2, 9); }
function pad(n) { return String(n).padStart(2, '0'); }
function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }
function escapeHtml(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function dateKey(d = new Date()) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function fmtMinutes(min) {
    min = Math.max(0, Math.round(min || 0));
    return Math.floor(min / 60) + 'h ' + pad(min % 60) + 'min';
}
function fmtClock(seconds) {
    seconds = Math.max(0, Math.round(seconds));
    const h = Math.floor(seconds / 3600), m = Math.floor((seconds % 3600) / 60), s = seconds % 60;
    return h > 0 ? h + ':' + pad(m) + ':' + pad(s) : pad(m) + ':' + pad(s);
}
function safeGet(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
function safeSet(key, value) { try { localStorage.setItem(key, value); return true; } catch (e) { return false; } }

let toastTimer = null;
function toast(message, icon) {
    const el = $('#appToast');
    if (!el) return;
    const iconEl = el.querySelector('i');
    const textEl = el.querySelector('span');
    if (iconEl) iconEl.className = 'fa-solid ' + (icon || 'fa-check');
    if (textEl) textEl.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

function copyText(text) {
    const fallback = () => {
        try {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            const ok = document.execCommand('copy');
            document.body.removeChild(ta);
            return ok;
        } catch (e) { return false; }
    };
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text).then(() => true).catch(fallback);
    }
    return Promise.resolve(fallback());
}

function shuffle(list) {
    const arr = list.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/* ============ 1. ESTADO PERSISTENTE ============ */
const DEFAULT_STATE = {
    session: null,
    xp: 0,
    coins: 25,
    title: 'Novato',
    pageTitle: 'Geekie One Ultra v19.5.1',
    font: 'Poppins',
    icon: 'fa-graduation-cap',
    themesOwned: ['default'],
    theme: 'default',
    petsOwned: [],
    pet: null,
    petEnergy: {},
    focusByDate: {},
    subjectMinutes: {},
    sessions: 0,
    pomoSessions: 0,
    goals: [],
    notes: {},
    noteOrder: [],
    currentNote: null,
    flashcards: {
        'Geral': [
            { q: 'Qual é a fórmula da velocidade média?', a: 'Vm = ΔS / Δt (variação da posição dividida pelo intervalo de tempo).' },
            { q: 'O que é uma hipótese?', a: 'Uma explicação testável para um fenômeno, que pode ser confirmada ou refutada por experimentos.' }
        ]
    },
    deck: 'Geral',
    flashStats: { again: 0, hard: 0, good: 0, easy: 0 },
    planner: {},
    diary: {},
    clicker: { points: 0, cps: 0, upgrades: [] },
    keySounds: { on: false, style: 'soft', volume: 45 },
    charsFav: [],
    chatHistory: [],
    motionReduced: false,
    quizBest: 0,
    redeemed: [],
    commandHistory: []
};

function loadState() {
    let saved = {};
    try { saved = JSON.parse(safeGet(STORAGE_KEY) || '{}') || {}; } catch (e) { saved = {}; }
    const merged = Object.assign({}, DEFAULT_STATE, saved);
    merged.flashcards = Object.assign({}, DEFAULT_STATE.flashcards, saved.flashcards || {});
    merged.flashStats = Object.assign({}, DEFAULT_STATE.flashStats, saved.flashStats || {});
    merged.clicker = Object.assign({}, DEFAULT_STATE.clicker, saved.clicker || {});
    merged.keySounds = Object.assign({}, DEFAULT_STATE.keySounds, saved.keySounds || {});
    if (!Array.isArray(merged.themesOwned) || merged.themesOwned.indexOf('default') === -1) merged.themesOwned = ['default'];
    if (!Array.isArray(merged.charsFav)) merged.charsFav = [];
    if (!Array.isArray(merged.goals)) merged.goals = [];
    if (!Array.isArray(merged.noteOrder)) merged.noteOrder = [];
    if (!Array.isArray(merged.chatHistory)) merged.chatHistory = [];
    if (!Array.isArray(merged.redeemed)) merged.redeemed = [];
    if (!Array.isArray(merged.commandHistory)) merged.commandHistory = [];
    return merged;
}

const state = loadState();

function saveState() {
    if (!safeSet(STORAGE_KEY, JSON.stringify(state))) {
        console.warn('Geekie: não foi possível salvar o progresso (localStorage bloqueado).');
    }
}

/* ============ 2. XP, NÍVEIS E MOEDAS ============ */
const LEVELS = [
    { xp: 0, title: 'Novato' },
    { xp: 100, title: 'Estudante' },
    { xp: 300, title: 'Focado' },
    { xp: 600, title: 'Disciplinado' },
    { xp: 1000, title: 'Estrategista' },
    { xp: 1500, title: 'Mestre' },
    { xp: 2200, title: 'Lenda' },
    { xp: 3000, title: 'Geekie Supremo' }
];

function levelInfo(xp) {
    let current = LEVELS[0], next = LEVELS[1];
    for (let i = 0; i < LEVELS.length; i++) {
        if (xp >= LEVELS[i].xp) { current = LEVELS[i]; next = LEVELS[i + 1] || null; }
    }
    return { current: current, next: next };
}

function renderProfile() {
    const info = levelInfo(state.xp);
    const xpCount = $('#xpCount');
    if (xpCount) {
        if (xpCount.textContent !== String(state.xp)) bumpTopbar($('#xpContainer'));
        xpCount.textContent = state.xp;
    }
    const fill = $('#xpProgressFill');
    if (fill) {
        const pct = info.next ? clamp(((state.xp - info.current.xp) / (info.next.xp - info.current.xp)) * 100, 0, 100) : 100;
        fill.style.width = pct + '%';
    }
    const nextTitle = $('#xpNextTitle');
    if (nextTitle) {
        nextTitle.textContent = info.next ? 'Próximo: ' + info.next.title + ' (' + info.next.xp + ' XP)' : 'Nível máximo alcançado';
    }
    const coins = [$('#coinCount'), $('#storeCoinCount'), $('#petCoinCount')];
    coins.forEach((el) => {
        if (!el) return;
        if (el.textContent !== String(state.coins)) bumpTopbar(el.parentElement || el);
        el.textContent = state.coins;
    });
    const titleText = $('#playerTitleText');
    if (titleText) titleText.textContent = state.title;
    const today = state.focusByDate[dateKey()] || 0;
    const study = $('#studyTimeTopbarDisplay');
    if (study) study.textContent = fmtMinutes(today);
    const pomoTotal = $('#pomoTotalFocus');
    if (pomoTotal) pomoTotal.textContent = fmtMinutes(today);
    const sessionEl = $('#pomoSessions');
    if (sessionEl) sessionEl.textContent = state.pomoSessions;
}

function addXp(amount) {
    if (!amount) return;
    const before = levelInfo(state.xp);
    state.xp += amount;
    const after = levelInfo(state.xp);
    if (after.current.title !== before.current.title && state.xp > 0) {
        if (!state.title || state.title === before.current.title) state.title = after.current.title;
        toast('Novo nível: ' + after.current.title + '!', 'fa-arrow-up');
        renderTitles();
        renderJourney();
    }
    renderProfile();
    saveState();
}

function addCoins(amount) {
    if (!amount) return;
    state.coins = Math.max(0, state.coins + amount);
    renderProfile();
    saveState();
}

function bumpTopbar(el) {
    if (!el) return;
    el.classList.remove('value-bump');
    void el.offsetWidth;
    el.classList.add('value-bump');
    setTimeout(() => el.classList.remove('value-bump'), 750);
}

function addFocusMinutes(minutes, subject) {
    if (minutes <= 0) return;
    const key = dateKey();
    state.focusByDate[key] = (state.focusByDate[key] || 0) + minutes;
    if (subject) state.subjectMinutes[subject] = (state.subjectMinutes[subject] || 0) + minutes;
    addXp(Math.round(minutes * 2));
    addCoins(1);
    if (state.pet) state.petEnergy[state.pet] = (state.petEnergy[state.pet] || 0) + 1;
    renderProfile();
    saveState();
}

/* ============ 3. LOGIN / SESSÃO ============ */
const loginMode = { register: false };

function readAccounts() {
    try { return JSON.parse(safeGet(ACCOUNTS_KEY) || '{}') || {}; } catch (e) { return {}; }
}
function hashPass(pass) {
    let hash = 5381;
    for (let i = 0; i < pass.length; i++) hash = ((hash << 5) + hash + pass.charCodeAt(i)) | 0;
    return 'h' + Math.abs(hash).toString(36);
}
function showLoginError(message) {
    const box = $('#loginError');
    if (!box) return;
    box.textContent = message || '';
    box.classList.toggle('show', !!message);
}
function setLoginMode(register) {
    loginMode.register = register;
    const confirmField = $('#loginConfirmField');
    const btn = $('#loginSubmitBtn');
    const link = $('#loginSwitchLink');
    const subtitle = $('#loginSubtitle');
    if (confirmField) confirmField.style.display = register ? 'flex' : 'none';
    if (btn) btn.textContent = register ? 'Criar conta' : 'Entrar';
    if (link) link.textContent = register ? 'Já tem conta? Entrar' : 'Não tem conta? Registre-se';
    if (subtitle) subtitle.textContent = register ? 'Crie sua conta local do hub' : 'Acesse seu hub de estudos';
    showLoginError('');
}

function openSession() {
    const overlay = $('#loginOverlay');
    if (overlay) overlay.classList.add('hidden');
    const badge = $('#loginUserBadge');
    if (badge) badge.style.display = 'flex';
    const userName = (state.session && state.session.name) || 'Convidado';
    const nameLabel = $('#userNameLabel');
    if (nameLabel) nameLabel.textContent = userName;
    const avatar = $('#userAvatar');
    if (avatar) avatar.textContent = userName.charAt(0).toUpperCase();
    renderProfile();
    renderStore();
    renderPets();
    renderTitles();
    renderJourney();
    renderGoalList();
    renderNotesList();
    renderStats();
    renderDevlog(currentDevlogFilter);
    renderDevlogMonths();
    renderChars();
    renderRewards();
    renderEventMonths();
    renderPlanner();
    renderSubjectChips();
    renderSubjectTotals();
    renderClickerShop();
    renderAmbient();
    renderDiary();
}

function handleAuthSubmit() {
    const nameInput = $('#loginName');
    const passInput = $('#loginPassword');
    const confirmInput = $('#loginConfirm');
    if (!nameInput || !passInput) return;
    const name = nameInput.value.trim();
    const pass = passInput.value;
    if (name.length < 2) { showLoginError('Digite um nome com pelo menos 2 caracteres.'); return; }
    if (pass.length < 4) { showLoginError('A senha precisa ter pelo menos 4 caracteres.'); return; }

    const accounts = readAccounts();
    const key = name.toLowerCase();

    if (loginMode.register) {
        if (accounts[key]) { showLoginError('Esse nome já está registrado. Use outro ou entre com a senha.'); return; }
        if (confirmInput && confirmInput.value !== pass) { showLoginError('As senhas não coincidem.'); return; }
        accounts[key] = { name: name, pass: hashPass(pass) };
        safeSet(ACCOUNTS_KEY, JSON.stringify(accounts));
        state.session = { name: name, guest: false };
        saveState();
        openSession();
        toast('Conta criada. Bem-vindo, ' + name + '!', 'fa-user-check');
        return;
    }

    const account = accounts[key];
    if (!account || account.pass !== hashPass(pass)) {
        showLoginError('Nome ou senha incorretos. Se ainda não tem conta, use "Registre-se".');
        return;
    }
    state.session = { name: account.name, guest: false };
    saveState();
    openSession();
    toast('Bem-vindo de volta, ' + account.name + '!', 'fa-hand-sparkles');
}

function loginAsGuest() {
    state.session = { name: 'Convidado', guest: true };
    saveState();
    openSession();
    toast('Você entrou como convidado. O progresso fica salvo neste navegador.', 'fa-user-secret');
}

function logoutUser() {
    state.session = null;
    saveState();
    const overlay = $('#loginOverlay');
    if (overlay) overlay.classList.remove('hidden');
    const badge = $('#loginUserBadge');
    if (badge) badge.style.display = 'none';
    const passInput = $('#loginPassword');
    if (passInput) passInput.value = '';
    setLoginMode(false);
    toast('Sessão encerrada.', 'fa-right-from-bracket');
}

function bindAuth() {
    const form = $('#loginSubmitBtn');
    if (form) form.addEventListener('click', handleAuthSubmit);
    const switchLink = $('#loginSwitchLink');
    if (switchLink) {
        switchLink.addEventListener('click', () => setLoginMode(!loginMode.register));
        switchLink.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLoginMode(!loginMode.register); } });
    }
    const guestLink = $('#loginGuestLink');
    if (guestLink) {
        guestLink.addEventListener('click', loginAsGuest);
        guestLink.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); loginAsGuest(); } });
    }
    const pass = $('#loginPassword');
    if (pass) pass.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleAuthSubmit(); });
    const confirm = $('#loginConfirm');
    if (confirm) confirm.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleAuthSubmit(); });
    const logout = $('#logoutBtn');
    if (logout) logout.addEventListener('click', logoutUser);
}

/* ============ 4. TUTORIAL ============ */
const TAB_META = [
    { id: 'tab-geekie', title: 'Portal Geekie', icon: 'fa-book-open', desc: 'O portal do Geekie One carregado dentro do hub, com recarregar e tela cheia.', tips: ['Use "Nova aba" se o portal bloquear o iframe.', 'O loading desaparece mesmo se o site demorar.'] },
    { id: 'tab-chat', title: 'Chat IA', icon: 'fa-comments', desc: 'Tutor local que organiza explicações, resoluções e revisões.', tips: ['Troque o modo do tutor para mudar o formato da resposta.', 'Anexe uma foto do exercício para indicar o contexto.'] },
    { id: 'tab-notes', title: 'Bloco de Notas', icon: 'fa-book-journal-whills', desc: 'Anotações com salvamento automático no navegador.', tips: ['"Nova" sempre começa limpo.', 'Copiar serve para jogar o texto no portal.'] },
    { id: 'tab-store', title: 'Loja de Temas', icon: 'fa-store', desc: 'Temas que trocam as cores do hub e a moldura do portal.', tips: ['Ganhe moedas concluindo pomodoros.', 'Temas comprados ficam salvos para sempre.'] },
    { id: 'tab-titles', title: 'Títulos', icon: 'fa-crown', desc: 'Títulos liberados por XP, exibidos no topo do hub.', tips: ['Você mantém o título mesmo depois de trocar.', 'XP vem de foco e de metas concluídas.'] },
    { id: 'tab-pets', title: 'Pets', icon: 'fa-paw', desc: 'Companheiros que ganham energia a cada sessão de foco.', tips: ['Adote um pet e ele aparece no seu perfil.', 'Energia é acumulada por sessão concluída.'] },
    { id: 'tab-journey', title: 'Trilha de Progresso', icon: 'fa-map', desc: 'Barras de evolução por XP, foco, metas e sessões.', tips: ['Cada barra mostra o quanto falta para completar.', 'Use a trilha para escolher a próxima meta.'] },
    { id: 'tab-timer', title: 'Pomodoro Timer', icon: 'fa-stopwatch', desc: 'Ciclos de foco e pausa com anel de progresso.', tips: ['Ao terminar o foco, XP e moedas são creditados.', 'Pausas não somam minutos de estudo.'] },
    { id: 'tab-goals', title: 'Metas de Estudo', icon: 'fa-list-check', desc: 'Lista de metas com progresso e filtros.', tips: ['Metas concluídas dão XP.', 'Use metas pequenas e específicas.'] },
    { id: 'tab-flashcards', title: 'Flashcards', icon: 'fa-clone', desc: 'Cartões de memória com autoavaliação por dificuldade.', tips: ['Clique no cartão para virar.', 'Avalie honestamente para ajustar a revisão.'] },
    { id: 'tab-planner', title: 'Planner Semanal', icon: 'fa-calendar-week', desc: 'Grade de segunda a sexta com blocos editáveis.', tips: ['Clique em um bloco para escrever.', 'Salve a semana para manter tudo.'] },
    { id: 'tab-stats', title: 'Estatísticas', icon: 'fa-chart-bar', desc: 'Resumo de foco, sessões e distribuição por matéria.', tips: ['O gráfico mostra os últimos 7 dias.', 'Compare as matérias para equilibrar a rotina.'] },
    { id: 'tab-subjects', title: 'Timer Matérias', icon: 'fa-clock-rotate-left', desc: 'Cronômetro por matéria, somando minutos ao seu histórico.', tips: ['Escolha a matéria antes de iniciar.', 'Pare e salve para registrar a sessão.'] },
    { id: 'tab-quiz', title: 'Quiz Rápido', icon: 'fa-brain', desc: 'Perguntas de múltipla escolha por matéria.', tips: ['Escolha a quantidade de perguntas.', 'O quiz dá XP por acerto.'] },
    { id: 'tab-clicker', title: 'Clicker Game', icon: 'fa-hand-pointer', desc: 'Clique no núcleo para gerar energia e trocar por moedas.', tips: ['Compre melhorias para ganhar energia automática.', 'Troque 50 de energia por 5 moedas.'] },
    { id: 'tab-ambient', title: 'Sons Ambiente', icon: 'fa-headphones', desc: 'Camadas de som geradas no navegador para foco.', tips: ['Combine chuva com ruído para mascarar o ambiente.', 'Cada camada tem volume próprio.'] },
    { id: 'tab-keysounds', title: 'Sons de Teclado', icon: 'fa-keyboard', desc: 'Feedback sonoro nas suas digitações.', tips: ['Escolha o estilo do clique.', 'Use o campo de teste para calibrar o volume.'] },
    { id: 'tab-calculator', title: 'Calculadora', icon: 'fa-calculator', desc: 'Calculadora rápida com expressões e parênteses.', tips: ['Use % para porcentagem.', 'O resultado aparece enquanto você digita.'] },
    { id: 'tab-chars', title: 'Caracteres Úteis', icon: 'fa-font', desc: 'Biblioteca de símbolos com busca por nome ou código.', tips: ['Busque por "03B1" para achar o alfa.', 'Favoritos ficam no topo da lista.'] },
    { id: 'tab-title', title: 'Título da Página', icon: 'fa-pen-nib', desc: 'Personalize título, fonte e ícone da página.', tips: ['O título também muda a aba do navegador.', 'Restaure o padrão a qualquer momento.'] },
    { id: 'tab-events', title: 'Eventos do Mês', icon: 'fa-calendar-star', desc: 'Evento temático de cada mês com recompensas por XP.', tips: ['Os níveis do evento sobem com seu XP.', 'O mês atual é destacado automaticamente.'] },
    { id: 'tab-google', title: 'Google', icon: 'fa-brands fa-google', desc: 'Google embutido para pesquisas rápidas.', tips: ['Se o site bloquear, abra em nova aba.', 'Recarregar resolve telas brancas.'] },
    { id: 'tab-commands', title: 'Aba de Comandos', icon: 'fa-terminal', desc: 'Terminal do hub para navegar e agir digitando.', tips: ['Digite "ajuda" para ver a lista completa.', 'Use Ctrl+K para abrir de qualquer aba.', 'Setas ↑ e ↓ percorrem o histórico.'] },
    { id: 'tab-rewards', title: 'Códigos de Recompensa', icon: 'fa-gift', desc: 'Códigos de campanha que liberam moedas, XP, temas e títulos.', tips: ['Cole o código e clique em Resgatar.', 'Cada código vale uma vez por conta.', 'Também funciona pelo comando "resgatar".'] },
    { id: 'tab-devlog', title: 'Dev Log', icon: 'fa-clock-rotate-left', desc: 'Histórico de versões do hub, com filtros por tipo.', tips: ['As 5 últimas atualizações estão no README.', 'Filtre por "Correções" para ver o que foi consertado.'] },
    { id: 'tab-diary', title: 'Diário', icon: 'fa-book-heart', desc: 'Registro diário de humor e aprendizado.', tips: ['Uma entrada por dia é sobrescrita ao salvar.', 'Exporte para guardar fora do navegador.'] },
    { id: 'tab-password', title: 'Gerador de Senhas', icon: 'fa-shield-halved', desc: 'Senhas fortes geradas localmente.', tips: ['Aumente o tamanho para mais segurança.', 'Nada é enviado pela rede.'] }
];

const tutorial = { index: 0 };

function renderTutorialStep() {
    const step = TAB_META[tutorial.index];
    if (!step) return;
    const total = TAB_META.length;
    const icon = $('#tutorialStepIcon');
    if (icon) icon.className = step.icon;
    const title = $('#tutorialStepTitle');
    if (title) title.textContent = step.title;
    const meta = $('#tutorialStepMeta');
    if (meta) meta.textContent = 'Aba ' + (tutorial.index + 1) + ' de ' + total;
    const progress = $('#tutorialProgress');
    if (progress) progress.textContent = (tutorial.index + 1) + ' / ' + total;
    const fill = $('#tutorialProgressFill');
    if (fill) fill.style.width = ((tutorial.index + 1) / total * 100).toFixed(1) + '%';
    const bodyTitle = $('#tutorialBodyTitle');
    if (bodyTitle) bodyTitle.textContent = step.title;
    const bodyText = $('#tutorialBodyText');
    if (bodyText) bodyText.textContent = step.desc;
    const tips = $('#tutorialTipsList');
    if (tips) tips.innerHTML = step.tips.map((t) => '<li>' + escapeHtml(t) + '</li>').join('');
    const dots = $('#tutorialDots');
    if (dots) {
        dots.innerHTML = TAB_META.map((_, i) => '<span class="tutorial-dot' + (i === tutorial.index ? ' active' : '') + '"></span>').join('');
    }
    const prev = $('#tutorialBtnPrev');
    if (prev) prev.disabled = tutorial.index === 0;
    const next = $('#tutorialBtnNext');
    if (next) next.textContent = tutorial.index === total - 1 ? 'Concluir ✓' : 'Próximo →';
}

function openTutorial() {
    tutorial.index = 0;
    renderTutorialStep();
    $('#tutorialOverlay').classList.remove('hidden');
}
function closeTutorial() {
    $('#tutorialOverlay').classList.add('hidden');
}
function tutorialGo(delta) {
    const next = tutorial.index + delta;
    if (next < 0) return;
    if (next >= TAB_META.length) { closeTutorial(); toast('Tutorial concluído!', 'fa-graduation-cap'); return; }
    tutorial.index = next;
    renderTutorialStep();
}

function bindTutorial() {
    $('#tutorialBtnPrev').addEventListener('click', () => tutorialGo(-1));
    $('#tutorialBtnNext').addEventListener('click', () => tutorialGo(1));
    $('#tutorialBtnSkip').addEventListener('click', closeTutorial);
    const fabTutorial = $('#fabTutorialBtn');
    if (fabTutorial) fabTutorial.addEventListener('click', () => { closeFabMenu(); openTutorial(); });
}

/* ============ 5. NAVEGAÇÃO E FAB ============ */
let activeTabId = 'tab-geekie';

function switchTab(tabId, opts) {
    if (tabId === 'tab-codes') tabId = 'tab-commands';
    const target = document.getElementById(tabId);
    if (!target) return;
    $$('.tab-content').forEach((el) => el.classList.remove('active'));
    target.classList.add('active');
    activeTabId = tabId;
    $$('.fab-nav-item').forEach((el) => el.classList.toggle('active', el.dataset.tab === tabId));
    closeFabMenu();
    if (!opts || !opts.silent) target.scrollTop = 0;
    if (tabId === 'tab-geekie') loadGeekieIframe();
    if (tabId === 'tab-google') loadGoogleIframe();
    if (tabId === 'tab-stats') renderStats();
    if (tabId === 'tab-devlog') renderDevlog(currentDevlogFilter);
    if (tabId === 'tab-journey') renderJourney();
    if (tabId === 'tab-store') renderStore();
    if (tabId === 'tab-flashcards') renderFlashcard();
    if (tabId === 'tab-events') renderEventMonths();
    if (tabId === 'tab-planner') renderPlanner();
    if (tabId === 'tab-chars') renderChars();
    if (tabId === 'tab-title') renderTitleEditor();
    if (tabId === 'tab-quiz') resetQuizView();
    if (tabId === 'tab-diary') renderDiary();
    if (tabId === 'tab-rewards') renderRewards();
    if (tabId === 'tab-commands') renderCmdLog();
}

function openFabMenu() {
    const menu = $('#fabMenu');
    const btn = $('#fabBtn');
    if (!menu) return;
    menu.classList.add('open');
    menu.setAttribute('aria-hidden', 'false');
    if (btn) btn.setAttribute('aria-expanded', 'true');
}
function closeFabMenu() {
    const menu = $('#fabMenu');
    const btn = $('#fabBtn');
    if (!menu) return;
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    if (btn) btn.setAttribute('aria-expanded', 'false');
}
function toggleFabMenu() {
    const menu = $('#fabMenu');
    if (!menu) return;
    if (menu.classList.contains('open')) closeFabMenu(); else openFabMenu();
}

function bindNavigation() {
    $$('.fab-nav-item[data-tab]').forEach((item) => {
        item.addEventListener('click', () => switchTab(item.dataset.tab));
    });
    $('#fabBtn').addEventListener('click', toggleFabMenu);
    const coin = $('#coinContainer');
    if (coin) {
        const go = () => switchTab('tab-pets');
        coin.addEventListener('click', go);
        coin.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    }
}

/* ============ 6. ANIMAÇÕES POR TIPO DE BOTÃO ============ */
/* Cada TIPO recebe um efeito próprio — ver bloco 5 no style.css.
 * A classe é aplicada automaticamente e o JS só dispara o "play". */
const FX_RULES = [
    ['#loginSubmitBtn', 'flow'],
    ['.btn-primary', 'shine'],
    ['.btn-outline', 'trace'],
    ['.btn-danger', 'shake'],
    ['.btn-icon', 'orbit'],
    ['.chip', 'lift'],
    ['.filter-chip', 'squish'],
    ['.mini-btn', 'glint'],
    ['.pomo-btn', 'squeeze'],
    ['.quiz-option', 'flip'],
    ['.fab-btn', 'sonar'],
    ['.fab-nav-item', 'slide'],
    ['.fab-action-row', 'slide'],
    ['.tutorial-btn-next', 'nudge-right'],
    ['.tutorial-btn-prev', 'nudge-left'],
    ['.tutorial-btn-skip', 'fade'],
    ['.buy-btn', 'coin'],
    ['.char-btn', 'pop'],
    ['.clicker-core', 'pulse'],
    ['.ambient-toggle', 'pop'],
    ['.theme-preview', 'hue']
];

const RIPPLE_FX = ['shine', 'trace', 'squeeze', 'flip', 'pop', 'coin', 'glint', 'squish', 'pulse'];

function ensureFx(el) {
    if (!el || el.dataset.fx) return el ? el.dataset.fx : null;
    for (let i = 0; i < FX_RULES.length; i++) {
        if (el.matches(FX_RULES[i][0])) {
            el.dataset.fx = FX_RULES[i][1];
            return el.dataset.fx;
        }
    }
    return null;
}

function motionReduced() {
    return document.documentElement.classList.contains('reduce-motion');
}

function playFx(el) {
    if (!el || motionReduced()) return;
    const fx = ensureFx(el);
    if (!fx) return;
    if (RIPPLE_FX.indexOf(fx) !== -1) {
        const rect = el.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
        ripple.className = 'fx-ripple';
        ripple.style.width = ripple.style.height = size + 'px';
        const x = (typeof event !== 'undefined' && event.clientX) ? event.clientX - rect.left : rect.width / 2;
        const y = (typeof event !== 'undefined' && event.clientY) ? event.clientY - rect.top : rect.height / 2;
        ripple.style.left = (x - size / 2) + 'px';
        ripple.style.top = (y - size / 2) + 'px';
        el.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }
    el.classList.remove('fx-play');
    void el.offsetWidth;
    el.classList.add('fx-play');
    const clear = () => el.classList.remove('fx-play');
    el.addEventListener('animationend', clear, { once: true });
    setTimeout(clear, 1200);
}

function bindButtonFx() {
    $$('button, .chip, .filter-chip, .fab-nav-item, [role="button"]').forEach(ensureFx);
    document.addEventListener('pointerdown', (e) => {
        const el = e.target.closest ? e.target.closest('[data-fx]') : null;
        if (el) playFx(el);
    }, { passive: true });
    /* Botões criados dinamicamente herdam o efeito na hora */
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((m) => {
            m.addedNodes.forEach((node) => {
                if (node.nodeType !== 1) return;
                if (node.matches && node.matches('button, .chip, .filter-chip')) ensureFx(node);
                if (node.querySelectorAll) node.querySelectorAll('button, .chip, .filter-chip').forEach(ensureFx);
            });
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

/* ============ 7. RELÓGIO ============ */
function tickClock() {
    const el = $('#realTimeClock');
    if (el) el.textContent = new Date().toLocaleTimeString('pt-BR');
    renderProfile();
}
/* ============ 8. PORTAL GEEKIE / GOOGLE ============ */
function loadIframe(frameId, loadingId) {
    const frame = document.getElementById(frameId);
    if (!frame) return;
    const loading = loadingId ? document.getElementById(loadingId) : null;
    if (!frame.src) {
        const src = frame.dataset.src;
        if (!src) return;
        frame.src = src;
    }
    const hide = () => { if (loading) loading.style.display = 'none'; };
    frame.addEventListener('load', hide, { once: true });
    setTimeout(hide, 9000);
}

function loadGeekieIframe() { loadIframe('geekieIframe', 'iframeLoading'); }
function loadGoogleIframe() { loadIframe('googleIframe', null); }

function goFullscreen(el) {
    if (!el) return;
    const request = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
    if (!request) { toast('Tela cheia não é suportada neste navegador.', 'fa-triangle-exclamation'); return; }
    request.call(el).catch(() => toast('Não foi possível entrar em tela cheia.', 'fa-triangle-exclamation'));
}

function bindPortals() {
    loadGeekieIframe();
    const reload = $('#portalReloadBtn');
    if (reload) reload.addEventListener('click', () => {
        const frame = $('#geekieIframe');
        if (!frame) return;
        const loading = $('#iframeLoading');
        if (loading) loading.style.display = 'grid';
        frame.src = frame.dataset.src;
    });
    const newTab = $('#portalNewTabBtn');
    if (newTab) newTab.addEventListener('click', () => {
        const frame = $('#geekieIframe');
        window.open((frame && frame.dataset.src) || 'about:blank', '_blank', 'noopener');
    });
    const full = $('#portalFullBtn');
    if (full) full.addEventListener('click', () => goFullscreen($('#geekieIframeContainer')));

    const gReload = $('#googleReloadBtn');
    if (gReload) gReload.addEventListener('click', () => {
        const frame = $('#googleIframe');
        if (frame) frame.src = frame.dataset.src;
    });
    const gFull = $('#googleFullBtn');
    if (gFull) gFull.addEventListener('click', () => goFullscreen($('#googleIframeContainer')));
}

/* ============ 9. CHAT / TUTOR LOCAL ============ */
let pendingChatImage = null;

function getChatHistory() { return Array.isArray(state.chatHistory) ? state.chatHistory : []; }

function persistChat(role, content) {
    state.chatHistory.push({ role: role, content: content, at: Date.now() });
    state.chatHistory = state.chatHistory.slice(-60);
    saveState();
}

function appendChatMessage(role, content) {
    const box = $('#chatMessages');
    if (!box || !content) return;
    const empty = $('#chatEmptyState');
    if (empty) empty.remove();
    const item = document.createElement('div');
    item.className = 'chat-message ' + (role === 'user' ? 'user' : 'assistant');
    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar';
    avatar.innerHTML = role === 'user' ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-wand-magic-sparkles"></i>';
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.textContent = content;
    item.appendChild(avatar);
    item.appendChild(bubble);
    box.appendChild(item);
    box.scrollTop = box.scrollHeight;
}

function renderChatHistory() {
    const box = $('#chatMessages');
    if (!box) return;
    box.innerHTML = '';
    const history = getChatHistory();
    if (!history.length) {
        box.innerHTML = '<div class="chat-empty" id="chatEmptyState"><i class="fa-solid fa-wand-magic-sparkles" style="font-size:2rem;color:var(--primary);display:block;margin-bottom:10px;"></i>Escolha um modo, escreva sua pergunta ou envie uma foto do exercício.</div>';
        return;
    }
    history.forEach((m) => appendChatMessage(m.role, m.content));
}

function setChatStatus(message, isError) {
    const status = $('#chatStatus');
    if (!status) return;
    status.textContent = message || '';
    status.classList.toggle('error', !!isError);
}

/* Tutor local: heurísticas por modo, sem nenhuma chamada de rede. */
function tutorReply(question, mode, subject) {
    const q = question.trim();
    const topic = subject ? subject.trim() : '';
    const lower = q.toLowerCase();
    const lines = [];

    const modeIntro = {
        explain: 'Vou explicar com calma, do começo.',
        solve: 'Vamos resolver passo a passo.',
        quiz: 'Vou transformar isso em perguntas de revisão.',
        summary: 'Vou condensar o essencial.',
        review: 'Vamos revisar o raciocínio e achar o erro.'
    };

    lines.push(modeIntro[mode] || modeIntro.explain);
    if (topic) lines.push('Matéria: ' + topic + '.');

    if (mode === 'quiz') {
        lines.push('1. Qual é a ideia central de "' + q + '"?');
        lines.push('2. Dê um exemplo e um contraexemplo.');
        lines.push('3. Explique em voz alta em 30 segundos, sem consultar.');
        lines.push('4. Onde isso costuma aparecer em prova?');
        lines.push('Responda uma por vez que eu comento cada tentativa.');
    } else if (mode === 'solve') {
        lines.push('Passo 1 — Liste os dados e o que é pedido.');
        lines.push('Passo 2 — Escolha a relação ou fórmula que conecta os dados ao pedido.');
        lines.push('Passo 3 — Substitua com unidades e resolva por partes.');
        lines.push('Passo 4 — Confira a ordem de grandeza e se a unidade faz sentido.');
        lines.push('Se você mandar os números, eu acompanho a conta com você.');
    } else if (mode === 'summary') {
        lines.push('• Ideia central: ' + q);
        lines.push('• O que memorizar: definição curta + uma fórmula ou exemplo.');
        lines.push('• O que costuma ser cobrado: aplicação direta e comparação de casos.');
        lines.push('• Próximo passo: transforme isso em 3 flashcards.');
    } else if (mode === 'review') {
        lines.push('Para achar o erro, separe a resolução em três partes: interpretação, método e conta.');
        lines.push('1. A pergunta foi lida com todos os detalhes (unidades, exceções)?');
        lines.push('2. O método escolhido é válido para esse caso?');
        lines.push('3. A conta final respeita sinais e casas decimais?');
        lines.push('Me diga a parte onde você tem menos certeza que eu ataco ela primeiro.');
    } else {
        lines.push('Bora entender "' + q + '":');
        lines.push('1) O que é: defina em uma frase, sem termos difíceis.');
        lines.push('2) Por que existe: qual problema essa ideia resolve.');
        lines.push('3) Como se usa: um exemplo concreto.');
        lines.push('4) Checagem: resolva um caso simples sozinho e compare.');
        lines.push('Diga onde você travou que eu detalho só aquele ponto.');
    }

    if (/foto|imagem|anexo/.test(lower)) {
        lines.push('Vi que você anexou uma imagem: descreva o enunciado em texto para eu seguir com o raciocínio.');
    }
    if (/enem|vestibular/.test(lower)) {
        lines.push('Dica de prova: marque as palavras-chave do enunciado antes de calcular.');
    }
    lines.push('— Tutor local Geekie (funciona offline; não substitui o professor).');
    return lines.join('\n');
}

function sendChatMessage(event) {
    if (event) event.preventDefault();
    const input = $('#chatInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text && !pendingChatImage) return;
    const mode = ($('#chatStudyMode') || {}).value || 'explain';
    const subject = ($('#chatSubject') || {}).value || '';
    const userText = text || '[imagem anexada]';

    appendChatMessage('user', userText);
    persistChat('user', userText);
    input.value = '';
    if (pendingChatImage) removeChatAttachment();

    const btn = $('#chatSendBtn');
    if (btn) btn.disabled = true;
    setChatStatus('A Geekie está organizando a resposta...');

    setTimeout(() => {
        const reply = tutorReply(text || 'a imagem anexada', mode, subject);
        appendChatMessage('assistant', reply);
        persistChat('assistant', reply);
        setChatStatus('Pronto. Continue a conversa quando quiser.');
        if (btn) btn.disabled = false;
        addXp(2);
    }, 420);
}

function removeChatAttachment() {
    pendingChatImage = null;
    const preview = $('#chatAttachmentPreview');
    if (preview) preview.classList.remove('show');
    const input = $('#chatImageInput');
    if (input) input.value = '';
}

function bindChat() {
    renderChatHistory();
    const form = $('#chatForm');
    if (form) form.addEventListener('submit', sendChatMessage);
    const clear = $('#chatClearBtn');
    if (clear) clear.addEventListener('click', () => {
        state.chatHistory = [];
        saveState();
        renderChatHistory();
        toast('Conversa limpa.', 'fa-broom');
    });
    $$('.chat-quick-prompts .chip').forEach((chip) => {
        chip.addEventListener('click', () => {
            const input = $('#chatInput');
            if (!input) return;
            input.value = chip.dataset.prompt || '';
            input.focus();
        });
    });
    const help = $('#chatModeHelp');
    const modeSelect = $('#chatStudyMode');
    const helpMap = {
        explain: 'A Geekie vai priorizar clareza, exemplos e uma checagem final.',
        solve: 'Passos numerados, com conferência de unidades no fim.',
        quiz: 'Perguntas curtas para você responder e fixar.',
        summary: 'Resumo em tópicos com o essencial para a prova.',
        review: 'Foco no ponto exato onde o raciocínio quebra.'
    };
    if (modeSelect && help) {
        modeSelect.addEventListener('change', () => { help.textContent = helpMap[modeSelect.value] || helpMap.explain; });
    }
    const imageInput = $('#chatImageInput');
    if (imageInput) imageInput.addEventListener('change', () => {
        const file = imageInput.files && imageInput.files[0];
        if (!file) return;
        if (file.size > 4 * 1024 * 1024) { toast('Imagem muito grande (máx. 4 MB).', 'fa-triangle-exclamation'); return; }
        const reader = new FileReader();
        reader.onload = () => {
            pendingChatImage = reader.result;
            const preview = $('#chatAttachmentPreview');
            const img = $('#chatAttachmentImage');
            const name = $('#chatAttachmentName');
            if (img) img.src = pendingChatImage;
            if (name) name.textContent = file.name;
            if (preview) preview.classList.add('show');
        };
        reader.readAsDataURL(file);
    });
    const removeBtn = $('.chat-remove-attachment');
    if (removeBtn) removeBtn.addEventListener('click', removeChatAttachment);
    const textarea = $('#chatInput');
    if (textarea) textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }
    });
}

/* ============ 10. NOTAS ============ */
function renderNotesList(selectId) {
    const select = $('#noteSelect');
    if (!select) return;
    const ids = state.noteOrder.slice();
    const current = selectId || state.currentNote;
    select.innerHTML = '<option value="new">+ Nova anotação...</option>' + ids.map((id) => {
        const note = state.notes[id];
        return note ? '<option value="' + id + '">' + escapeHtml(note.title || 'Sem título') + '</option>' : '';
    }).join('');
    if (current && state.notes[current]) { select.value = current; state.currentNote = current; loadNoteToEditor(current); }
}

function loadNoteToEditor(id) {
    const note = state.notes[id];
    const title = $('#noteTitleInput');
    const content = $('#noteContentInput');
    if (!note) return;
    if (title) title.value = note.title || '';
    if (content) content.value = note.content || '';
    const status = $('#noteStatus');
    if (status) status.textContent = 'Editando: ' + (note.title || 'Sem título');
    updateNoteCounter();
}

function updateNoteCounter() {
    const content = $('#noteContentInput');
    const counter = $('#noteCounter');
    if (content && counter) counter.textContent = content.value.length + ' caracteres';
}

function newNote() {
    const id = uid();
    state.notes[id] = { title: '', content: '', updatedAt: Date.now() };
    state.noteOrder.unshift(id);
    state.currentNote = id;
    saveState();
    renderNotesList(id);
    const title = $('#noteTitleInput');
    if (title) title.focus();
    toast('Nova anotação criada.', 'fa-plus');
}

function saveNote() {
    let id = state.currentNote;
    const title = ($('#noteTitleInput') || {}).value || '';
    const content = ($('#noteContentInput') || {}).value || '';
    if (!content.trim() && !title.trim()) { toast('Escreva algo antes de salvar.', 'fa-triangle-exclamation'); return; }
    if (!id || !state.notes[id]) {
        id = uid();
        state.noteOrder.unshift(id);
    }
    state.notes[id] = { title: title.trim() || 'Sem título', content: content, updatedAt: Date.now() };
    state.currentNote = id;
    saveState();
    renderNotesList(id);
    const status = $('#noteStatus');
    if (status) status.textContent = 'Salvo às ' + new Date().toLocaleTimeString('pt-BR');
    addXp(3);
    toast('Anotação salva.', 'fa-floppy-disk');
}

function copyNoteContent() {
    const content = ($('#noteContentInput') || {}).value || '';
    if (!content.trim()) { toast('Nada para copiar.', 'fa-triangle-exclamation'); return; }
    copyText(content).then((ok) => toast(ok ? 'Anotação copiada.' : 'Não foi possível copiar.', ok ? 'fa-copy' : 'fa-triangle-exclamation'));
}

function deleteNote() {
    const id = state.currentNote;
    if (!id || !state.notes[id]) { toast('Nenhuma anotação selecionada.', 'fa-triangle-exclamation'); return; }
    if (!window.confirm('Excluir esta anotação? Não dá para desfazer.')) return;
    delete state.notes[id];
    state.noteOrder = state.noteOrder.filter((n) => n !== id);
    state.currentNote = null;
    saveState();
    $('#noteTitleInput').value = '';
    $('#noteContentInput').value = '';
    renderNotesList();
    const status = $('#noteStatus');
    if (status) status.textContent = 'Nenhuma anotação selecionada';
    updateNoteCounter();
    toast('Anotação excluída.', 'fa-trash');
}

function bindNotes() {
    renderNotesList();
    const select = $('#noteSelect');
    if (select) select.addEventListener('change', () => {
        if (select.value === 'new') { newNote(); return; }
        state.currentNote = select.value;
        saveState();
        loadNoteToEditor(select.value);
    });
    $('#noteNewBtn').addEventListener('click', newNote);
    $('#noteSaveBtn').addEventListener('click', saveNote);
    $('#noteCopyBtn').addEventListener('click', copyNoteContent);
    $('#noteDeleteBtn').addEventListener('click', deleteNote);
    const content = $('#noteContentInput');
    if (content) content.addEventListener('input', updateNoteCounter);
    updateNoteCounter();
}

/* ============ 11. LOJA DE TEMAS ============ */
const THEMES = [
    { id: 'default', name: 'Geekie Padrão', price: 0, primary: '#00ff88', accent: '#00d4ff', secondary: '#7b2cbf', frame: 'theme-default' },
    { id: 'neon', name: 'Neon Pink', price: 120, primary: '#ff006e', accent: '#ff77b8', secondary: '#7b2cbf', frame: 'theme-neon' },
    { id: 'ocean', name: 'Oceano', price: 160, primary: '#22d3ee', accent: '#0891b2', secondary: '#0e7490', frame: 'theme-ocean' },
    { id: 'forest', name: 'Floresta', price: 180, primary: '#4ade80', accent: '#16a34a', secondary: '#065f46', frame: 'theme-forest' },
    { id: 'sunset', name: 'Pôr do Sol', price: 200, primary: '#fb923c', accent: '#ec4899', secondary: '#8b5cf6', frame: 'theme-sunset' },
    { id: 'frost', name: 'Gelo', price: 220, primary: '#c8e6fa', accent: '#7dd3fc', secondary: '#0ea5e9', frame: 'theme-frost' },
    { id: 'matrix', name: 'Matrix', price: 260, primary: '#00ff41', accent: '#39ff14', secondary: '#065f46', frame: 'theme-matrix' },
    { id: 'cosmic', name: 'Cósmico', price: 300, primary: '#a78bfa', accent: '#6d28d9', secondary: '#4c1d95', frame: 'theme-cosmic' },
    { id: 'nebula', name: 'Nebulosa', price: 340, primary: '#ec4899', accent: '#38bdf8', secondary: '#a855f7', frame: 'theme-nebula' }
];

let storeFilter = 'all';

function applyTheme(id) {
    const theme = THEMES.find((t) => t.id === id) || THEMES[0];
    const root = document.documentElement.style;
    root.setProperty('--primary', theme.primary);
    root.setProperty('--primary-glow', theme.primary + '66');
    root.setProperty('--accent', theme.accent);
    root.setProperty('--secondary', theme.secondary);
    ['geekieIframeContainer', 'googleIframeContainer'].forEach((containerId) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        THEMES.forEach((t) => container.classList.remove(t.frame));
        container.classList.add(theme.frame);
    });
    state.theme = theme.id;
    saveState();
}

function renderStore() {
    const grid = $('#themeGrid');
    if (!grid) return;
    const list = THEMES.filter((t) => {
        if (storeFilter === 'owned') return state.themesOwned.indexOf(t.id) !== -1;
        if (storeFilter === 'locked') return state.themesOwned.indexOf(t.id) === -1;
        return true;
    });
    grid.innerHTML = list.map((t) => {
        const owned = state.themesOwned.indexOf(t.id) !== -1;
        const equipped = state.theme === t.id;
        const action = owned
            ? '<button class="buy-btn" type="button" data-fx="pop" data-theme-equip="' + t.id + '"' + (equipped ? ' disabled' : '') + '>' + (equipped ? 'Em uso' : 'Usar') + '</button>'
            : '<button class="buy-btn" type="button" data-fx="coin" data-theme-buy="' + t.id + '"><i class="fa-solid fa-coins"></i> ' + t.price + '</button>';
        return '<div class="theme-card' + (equipped ? ' equipped' : '') + '">' +
            '<div class="theme-preview" data-fx="hue" style="--t-a:' + t.primary + ';--t-b:' + t.accent + '">' + escapeHtml(t.name) + '</div>' +
            '<div class="theme-card-name">' + escapeHtml(t.name) + '</div>' +
            '<div class="theme-card-meta"><span>' + (owned ? 'Adquirido' : 'Bloqueado') + '</span><span>' + (equipped ? 'Ativo' : '') + '</span></div>' +
            action +
            '</div>';
    }).join('');
    renderProfile();
}

function bindStore() {
    $$('#storeFilters .filter-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
            storeFilter = chip.dataset.filter;
            $$('#storeFilters .filter-chip').forEach((c) => c.classList.toggle('active', c === chip));
            renderStore();
        });
    });
    const grid = $('#themeGrid');
    if (grid) grid.addEventListener('click', (e) => {
        const equip = e.target.closest('[data-theme-equip]');
        if (equip) { applyTheme(equip.dataset.themeEquip); renderStore(); toast('Tema aplicado.', 'fa-palette'); return; }
        const buy = e.target.closest('[data-theme-buy]');
        if (buy) {
            const id = buy.dataset.themeBuy;
            const theme = THEMES.find((t) => t.id === id);
            if (!theme) return;
            if (state.coins < theme.price) { toast('Moedas insuficientes: faltam ' + (theme.price - state.coins) + '.', 'fa-coins'); return; }
            state.coins -= theme.price;
            state.themesOwned.push(id);
            saveState();
            applyTheme(id);
            renderStore();
            renderProfile();
            renderTitles();
            toast('Tema ' + theme.name + ' desbloqueado!', 'fa-unlock');
        }
    });
}

/* ============ 12. TÍTULOS ============ */
const TITLES = [
    { id: 'novato', name: 'Novato', xp: 0, icon: '🌱' },
    { id: 'estudante', name: 'Estudante', xp: 100, icon: '📚' },
    { id: 'focado', name: 'Focado', xp: 300, icon: '🎯' },
    { id: 'disciplinado', name: 'Disciplinado', xp: 600, icon: '🧭' },
    { id: 'estrategista', name: 'Estrategista', xp: 1000, icon: '♟️' },
    { id: 'mestre', name: 'Mestre', xp: 1500, icon: '🧠' },
    { id: 'lenda', name: 'Lenda', xp: 2200, icon: '🏆' },
    { id: 'supremo', name: 'Geekie Supremo', xp: 3000, icon: '👑' }
];

function renderTitles() {
    const grid = $('#titleGrid');
    if (!grid) return;
    grid.innerHTML = TITLES.map((t) => {
        const unlocked = state.xp >= t.xp;
        const equipped = state.title === t.name;
        return '<div class="title-card' + (unlocked ? '' : ' locked') + (equipped ? ' equipped' : '') + '">' +
            '<div class="title-card-name">' + t.icon + ' ' + escapeHtml(t.name) + '</div>' +
            '<div class="theme-card-meta"><span>' + t.xp + ' XP</span><span>' + (unlocked ? 'Liberado' : 'Bloqueado') + '</span></div>' +
            (unlocked ? '<button class="buy-btn" type="button" data-fx="pop" data-title="' + t.id + '"' + (equipped ? ' disabled' : '') + '>' + (equipped ? 'Equipado' : 'Equipar') + '</button>' : '') +
            '</div>';
    }).join('');
    renderProfile();
}

function bindTitles() {
    const grid = $('#titleGrid');
    if (grid) grid.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-title]');
        if (!btn) return;
        const title = TITLES.find((t) => t.id === btn.dataset.title);
        if (!title || state.xp < title.xp) return;
        state.title = title.name;
        saveState();
        renderTitles();
        toast('Título equipado: ' + title.name, 'fa-crown');
    });
}

/* ============ 13. PETS ============ */
const PETS = [
    { id: 'neko', emoji: '🐱', name: 'Neko', price: 0 },
    { id: 'coruja', emoji: '🦉', name: 'Corujinha', price: 80 },
    { id: 'tarta', emoji: '🐢', name: 'Tartaruga Zen', price: 120 },
    { id: 'raposa', emoji: '🦊', name: 'Raposa', price: 160 },
    { id: 'dragao', emoji: '🐉', name: 'Dragãozinho', price: 320 }
];

function renderPets() {
    const grid = $('#petGrid');
    if (!grid) return;
    grid.innerHTML = PETS.map((p) => {
        const owned = state.petsOwned.indexOf(p.id) !== -1;
        const active = state.pet === p.id;
        const energy = state.petEnergy[p.id] || 0;
        return '<div class="pet-card' + (active ? ' active' : '') + '">' +
            '<div class="pet-emoji">' + p.emoji + '</div>' +
            '<div class="pet-name">' + escapeHtml(p.name) + '</div>' +
            '<div class="pet-meta">' + (owned ? energy + ' energia' : 'Adoção: ' + p.price + ' moedas') + '</div>' +
            (owned
                ? '<button class="buy-btn" type="button" data-fx="pop" data-pet-equip="' + p.id + '"' + (active ? ' disabled' : '') + '>' + (active ? 'Ativo' : 'Usar') + '</button>'
                : '<button class="buy-btn" type="button" data-fx="coin" data-pet-buy="' + p.id + '"><i class="fa-solid fa-coins"></i> ' + p.price + '</button>') +
            '</div>';
    }).join('');
    renderProfile();
}

function bindPets() {
    const grid = $('#petGrid');
    if (grid) grid.addEventListener('click', (e) => {
        const equip = e.target.closest('[data-pet-equip]');
        if (equip) { state.pet = equip.dataset.petEquip; saveState(); renderPets(); toast('Pet ativo!', 'fa-paw'); return; }
        const buy = e.target.closest('[data-pet-buy]');
        if (buy) {
            const pet = PETS.find((p) => p.id === buy.dataset.petBuy);
            if (!pet) return;
            if (state.coins < pet.price) { toast('Moedas insuficientes.', 'fa-coins'); return; }
            state.coins -= pet.price;
            state.petsOwned.push(pet.id);
            state.pet = pet.id;
            saveState();
            renderPets();
            renderProfile();
            toast(pet.name + ' adotado!', 'fa-heart');
        }
    });
}

/* ============ 14. TRILHA DE PROGRESSO ============ */
function renderJourney() {
    const box = $('#journeyList');
    if (!box) return;
    const totalFocus = Object.values(state.focusByDate).reduce((a, b) => a + b, 0);
    const doneGoals = state.goals.filter((g) => g.done).length;
    const info = levelInfo(state.xp);
    const rows = [
        { label: 'Nível ' + info.current.title, value: state.xp, max: info.next ? info.next.xp : state.xp || 1, kind: 'xp' },
        { label: 'Foco acumulado', value: totalFocus, max: 1200, kind: 'time' },
        { label: 'Sessões de foco', value: state.sessions, max: 50, kind: 'num' },
        { label: 'Metas concluídas', value: doneGoals, max: 30, kind: 'num' },
        { label: 'Moedas conquistadas', value: state.coins, max: 500, kind: 'num' }
    ];
    box.innerHTML = rows.map((r) => {
        const pct = clamp((r.value / r.max) * 100, 0, 100);
        const valueText = r.kind === 'time' ? fmtMinutes(r.value) : (r.kind === 'xp' ? r.value + ' XP' : r.value);
        const maxText = r.kind === 'time' ? fmtMinutes(r.max) : (r.kind === 'xp' ? r.max + ' XP' : r.max);
        return '<div class="journey-item">' +
            '<div class="journey-head"><strong>' + escapeHtml(r.label) + '</strong><span>' + valueText + ' / ' + maxText + '</span></div>' +
            '<div class="journey-bar"><div class="journey-fill" style="width:' + pct + '%"></div></div>' +
            '</div>';
    }).join('');
}
/* ============ 15. POMODORO ============ */
const POMO_RING = 2 * Math.PI * 88;
const pomodoro = { minutes: 25, mode: 'focus', remaining: 25 * 60, total: 25 * 60, running: false, timer: null };

function renderPomodoro() {
    const time = $('#pomoTime');
    if (time) time.textContent = fmtClock(pomodoro.remaining);
    const label = $('#pomoLabel');
    if (label) label.textContent = pomodoro.mode === 'focus' ? 'Foco' : 'Pausa';
    const ring = $('#pomoProgress');
    if (ring) {
        ring.style.strokeDasharray = POMO_RING.toFixed(2);
        ring.style.strokeDashoffset = (POMO_RING * (1 - pomodoro.remaining / pomodoro.total)).toFixed(2);
        ring.style.stroke = pomodoro.mode === 'focus' ? 'var(--primary)' : 'var(--accent)';
    }
    renderProfile();
}

function pomoBeep() {
    try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        const ctx = new Ctx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.85);
        setTimeout(() => { if (ctx.close) ctx.close(); }, 1200);
    } catch (e) { /* som é opcional */ }
}

function pomodoroComplete() {
    pomodoro.running = false;
    clearInterval(pomodoro.timer);
    pomodoro.timer = null;
    if (pomodoro.mode === 'focus') {
        const minutes = Math.round(pomodoro.total / 60);
        state.pomoSessions += 1;
        state.sessions += 1;
        addFocusMinutes(minutes, activeSubject);
        toast('Sessão concluída: +' + minutes * 2 + ' XP e +1 moeda!', 'fa-trophy');
    } else {
        toast('Pausa concluída. Bora voltar ao foco?', 'fa-mug-hot');
    }
    pomoBeep();
    pomodoro.remaining = pomodoro.total;
    renderPomodoro();
    renderStats();
}

function pomoStart() {
    if (pomodoro.running) return;
    pomodoro.running = true;
    pomodoro.timer = setInterval(() => {
        pomodoro.remaining -= 1;
        if (pomodoro.remaining <= 0) { pomodoroComplete(); return; }
        renderPomodoro();
    }, 1000);
    toast('Foco iniciado. Sem distrações agora.', 'fa-play');
}

function pomoPause() {
    pomodoro.running = false;
    clearInterval(pomodoro.timer);
    pomodoro.timer = null;
    toast('Pausado.', 'fa-pause');
}

function pomoReset() {
    pomodoro.running = false;
    clearInterval(pomodoro.timer);
    pomodoro.timer = null;
    pomodoro.remaining = pomodoro.minutes * 60;
    pomodoro.total = pomodoro.minutes * 60;
    renderPomodoro();
}

function bindPomodoro() {
    $$('#pomoModes .filter-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
            $$('#pomoModes .filter-chip').forEach((c) => c.classList.toggle('active', c === chip));
            pomodoro.minutes = Number(chip.dataset.minutes) || 25;
            pomodoro.mode = chip.dataset.mode || 'focus';
            pomodoro.running = false;
            clearInterval(pomodoro.timer);
            pomodoro.timer = null;
            pomodoro.remaining = pomodoro.minutes * 60;
            pomodoro.total = pomodoro.minutes * 60;
            renderPomodoro();
        });
    });
    $('#pomoStartBtn').addEventListener('click', pomoStart);
    $('#pomoPauseBtn').addEventListener('click', pomoPause);
    $('#pomoResetBtn').addEventListener('click', pomoReset);
    renderPomodoro();
}

/* ============ 16. METAS ============ */
let goalFilter = 'all';

function renderGoalList() {
    const list = $('#goalList');
    if (!list) return;
    const goals = state.goals.filter((g) => {
        if (goalFilter === 'open') return !g.done;
        if (goalFilter === 'done') return g.done;
        return true;
    });
    if (!goals.length) {
        list.innerHTML = '<div class="goal-empty">Nenhuma meta aqui. Adicione uma acima.</div>';
    } else {
        list.innerHTML = goals.map((g) => '<div class="goal-item' + (g.done ? ' done' : '') + '">' +
            '<input class="goal-check" type="checkbox" data-goal-toggle="' + g.id + '"' + (g.done ? ' checked' : '') + ' aria-label="Concluir meta">' +
            '<span class="goal-text">' + escapeHtml(g.text) + '</span>' +
            '<button class="btn btn-danger" type="button" data-fx="shake" data-goal-remove="' + g.id + '" aria-label="Remover meta"><i class="fa-solid fa-xmark"></i></button>' +
            '</div>').join('');
    }
    const done = state.goals.filter((g) => g.done).length;
    const fill = $('#goalProgressFill');
    if (fill) fill.style.width = (state.goals.length ? (done / state.goals.length) * 100 : 0) + '%';
}

function bindGoals() {
    const form = $('#goalForm');
    if (form) form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = $('#goalInput');
        const text = (input.value || '').trim();
        if (!text) return;
        state.goals.unshift({ id: uid(), text: text, done: false, createdAt: Date.now() });
        input.value = '';
        saveState();
        renderGoalList();
        toast('Meta adicionada.', 'fa-list-check');
    });
    $$('#goalFilters .filter-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
            goalFilter = chip.dataset.filter;
            $$('#goalFilters .filter-chip').forEach((c) => c.classList.toggle('active', c === chip));
            renderGoalList();
        });
    });
    const list = $('#goalList');
    if (list) list.addEventListener('click', (e) => {
        const remove = e.target.closest('[data-goal-remove]');
        if (remove) {
            state.goals = state.goals.filter((g) => g.id !== remove.dataset.goalRemove);
            saveState();
            renderGoalList();
            return;
        }
        const toggle = e.target.closest('[data-goal-toggle]');
        if (toggle) {
            const goal = state.goals.find((g) => g.id === toggle.dataset.goalToggle);
            if (!goal) return;
            goal.done = toggle.checked;
            if (goal.done) { addXp(8); addCoins(2); toast('Meta concluída: +8 XP, +2 moedas.', 'fa-check'); }
            saveState();
            renderGoalList();
        }
    });
    renderGoalList();
}

/* ============ 17. FLASHCARDS ============ */
const flash = { index: 0, flipped: false };

function deckCards() { return state.flashcards[state.deck] || []; }

function renderFlashcard() {
    const select = $('#deckSelect');
    if (!Object.keys(state.flashcards).length) state.flashcards['Geral'] = [];
    if (select) {
        select.innerHTML = Object.keys(state.flashcards).map((d) => '<option value="' + escapeHtml(d) + '">' + escapeHtml(d) + ' (' + state.flashcards[d].length + ')</option>').join('');
        select.value = state.deck;
    }
    const cards = deckCards();
    const card = $('#flashcard');
    if (card) card.classList.remove('flipped');
    flash.flipped = false;
    if (!cards.length) {
        if ($('#flashQuestion')) $('#flashQuestion').textContent = 'Nenhum card neste baralho';
        if ($('#flashAnswer')) $('#flashAnswer').textContent = 'Use "Novo card" para criar o primeiro.';
    } else {
        flash.index = flash.index % cards.length;
        if ($('#flashQuestion')) $('#flashQuestion').textContent = cards[flash.index].q;
        if ($('#flashAnswer')) $('#flashAnswer').textContent = cards[flash.index].a;
    }
    const stats = $('#flashStats');
    if (stats) {
        const s = state.flashStats;
        stats.textContent = 'Rodada: ' + (s.again + s.hard + s.good + s.easy) + ' revisões · errei ' + s.again + ' · difícil ' + s.hard + ' · acertei ' + s.good + ' · fácil ' + s.easy;
    }
}

function bindFlashcards() {
    renderFlashcard();
    const card = $('#flashcard');
    if (card) {
        const flip = () => { card.classList.toggle('flipped'); flash.flipped = !flash.flipped; };
        card.addEventListener('click', flip);
        card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
    }
    const select = $('#deckSelect');
    if (select) select.addEventListener('change', () => { state.deck = select.value; flash.index = 0; flash.flipped = false; saveState(); renderFlashcard(); });
    $$('.flash-actions [data-rating]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const rating = btn.dataset.rating;
            if (state.flashStats[rating] != null) state.flashStats[rating] += 1;
            saveState();
            flash.index += 1;
            renderFlashcard();
            addXp(1);
        });
    });
    const add = $('#flashAddBtn');
    if (add) add.addEventListener('click', () => {
        const deckName = window.prompt('Baralho (ex.: Geral, Biologia):', state.deck);
        if (!deckName) return;
        const question = window.prompt('Pergunta do card:');
        if (!question) return;
        const answer = window.prompt('Resposta do card:');
        if (!answer) return;
        if (!state.flashcards[deckName]) state.flashcards[deckName] = [];
        state.flashcards[deckName].push({ q: question, a: answer });
        state.deck = deckName;
        saveState();
        renderFlashcard();
        toast('Card criado.', 'fa-clone');
    });
    const reset = $('#flashResetBtn');
    if (reset) reset.addEventListener('click', () => {
        state.flashStats = { again: 0, hard: 0, good: 0, easy: 0 };
        flash.index = 0;
        saveState();
        renderFlashcard();
        toast('Rodada reiniciada.', 'fa-rotate');
    });
}

/* ============ 18. PLANNER ============ */
const PLANNER_DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
const PLANNER_SLOTS = ['07h – 09h', '09h – 11h', '11h – 13h', '14h – 16h', '16h – 18h', '19h – 21h'];

function renderPlanner() {
    const grid = $('#plannerGrid');
    if (!grid) return;
    let html = '<div class="planner-head"></div>' + PLANNER_DAYS.map((d) => '<div class="planner-head">' + d + '</div>').join('');
    PLANNER_SLOTS.forEach((slot, slotIndex) => {
        html += '<div class="planner-time">' + slot + '</div>';
        PLANNER_DAYS.forEach((day) => {
            const key = day + '-' + slotIndex;
            const value = state.planner[key] || '';
            html += '<button class="planner-slot' + (value ? ' filled' : '') + '" type="button" data-slot="' + key + '">' + (value ? escapeHtml(value) : '') + '</button>';
        });
    });
    grid.innerHTML = html;
}

function bindPlanner() {
    const grid = $('#plannerGrid');
    if (grid) grid.addEventListener('click', (e) => {
        const slot = e.target.closest('[data-slot]');
        if (!slot) return;
        const key = slot.dataset.slot;
        const current = state.planner[key] || '';
        const value = window.prompt('O que você vai estudar nesse bloco?', current);
        if (value === null) return;
        if (value.trim()) state.planner[key] = value.trim(); else delete state.planner[key];
        renderPlanner();
    });
    const save = $('#plannerSaveBtn');
    if (save) save.addEventListener('click', () => { saveState(); toast('Semana salva.', 'fa-floppy-disk'); addXp(2); });
    const clear = $('#plannerClearBtn');
    if (clear) clear.addEventListener('click', () => {
        if (!window.confirm('Limpar todos os blocos da semana?')) return;
        state.planner = {};
        saveState();
        renderPlanner();
        toast('Planner limpo.', 'fa-broom');
    });
    renderPlanner();
}

/* ============ 19. ESTATÍSTICAS ============ */
function renderStats() {
    const cards = $('#statsCards');
    const totalFocus = Object.values(state.focusByDate).reduce((a, b) => a + b, 0);
    const today = state.focusByDate[dateKey()] || 0;
    const doneGoals = state.goals.filter((g) => g.done).length;

    if (cards) {
        const list = [
            { value: fmtMinutes(totalFocus), label: 'Foco total' },
            { value: fmtMinutes(today), label: 'Hoje' },
            { value: state.pomoSessions, label: 'Pomodoros' },
            { value: state.goals.length + ' / ' + doneGoals, label: 'Metas' },
            { value: state.xp, label: 'XP' }
        ];
        cards.innerHTML = list.map((c) => '<div class="stat-card"><span class="stat-value">' + c.value + '</span><span class="stat-label">' + c.label + '</span></div>').join('');
    }

    const chart = $('#weeklyChart');
    if (chart) {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push({ key: dateKey(d), label: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''), minutes: state.focusByDate[dateKey(d)] || 0 });
        }
        const max = Math.max(30, ...days.map((d) => d.minutes));
        chart.innerHTML = days.map((d) => {
            const h = Math.max(3, (d.minutes / max) * 120);
            return '<div class="bar-col" title="' + fmtMinutes(d.minutes) + '"><div class="bar" style="height:' + h + 'px"></div><span class="bar-label">' + escapeHtml(d.label) + '</span></div>';
        }).join('');
    }

    const breakdown = $('#subjectBreakdown');
    if (breakdown) {
        const entries = Object.entries(state.subjectMinutes).filter((e) => e[1] > 0).sort((a, b) => b[1] - a[1]);
        if (!entries.length) {
            breakdown.innerHTML = '<div class="empty-state">Use o Timer Matérias para registrar minutos por matéria.</div>';
        } else {
            const max = Math.max(...entries.map((e) => e[1]));
            breakdown.innerHTML = entries.map((e) => '<div class="breakdown-row">' +
                '<div class="breakdown-head"><span>' + escapeHtml(e[0]) + '</span><span>' + fmtMinutes(e[1]) + '</span></div>' +
                '<div class="breakdown-bar"><div class="breakdown-fill" style="width:' + ((e[1] / max) * 100) + '%"></div></div>' +
                '</div>').join('');
        }
    }
    renderProfile();
}
/* ============ 20. TIMER POR MATÉRIA ============ */
const SUBJECTS = ['Matemática', 'Português', 'História', 'Geografia', 'Biologia', 'Física', 'Química', 'Redação', 'Inglês'];
let activeSubject = null;
const subjectTimer = { running: false, startedAt: 0, elapsed: 0, interval: null };

function renderSubjectChips() {
    const box = $('#subjectChips');
    if (!box) return;
    box.innerHTML = SUBJECTS.map((s) => '<button class="filter-chip' + (activeSubject === s ? ' active' : '') + '" type="button" data-fx="squish" data-subject="' + escapeHtml(s) + '">' + escapeHtml(s) + '</button>').join('');
    const label = $('#subjectClockSubject');
    if (label) label.textContent = activeSubject ? 'Matéria: ' + activeSubject : 'Nenhuma matéria selecionada';
}

function renderSubjectTotals() {
    const box = $('#subjectTotals');
    if (!box) return;
    const entries = Object.entries(state.subjectMinutes).sort((a, b) => b[1] - a[1]);
    if (!entries.length) { box.innerHTML = '<div class="empty-state">Nenhum minuto registrado ainda.</div>'; return; }
    box.innerHTML = entries.map((e) => '<div class="subject-total"><span>' + escapeHtml(e[0]) + '</span><strong>' + fmtMinutes(e[1]) + '</strong></div>').join('');
}

function tickSubjectTimer() {
    const clock = $('#subjectClock');
    if (clock) clock.textContent = fmtClock(subjectTimer.elapsed);
    if (subjectTimer.running) subjectTimer.elapsed += 1;
}

function bindSubjects() {
    renderSubjectChips();
    renderSubjectTotals();
    const box = $('#subjectChips');
    if (box) box.addEventListener('click', (e) => {
        const chip = e.target.closest('[data-subject]');
        if (!chip) return;
        activeSubject = chip.dataset.subject;
        renderSubjectChips();
    });
    const start = $('#subjectStartBtn');
    if (start) start.addEventListener('click', () => {
        if (!activeSubject) { toast('Escolha uma matéria primeiro.', 'fa-triangle-exclamation'); return; }
        if (subjectTimer.running) { toast('O cronômetro já está rodando.', 'fa-clock'); return; }
        subjectTimer.running = true;
        subjectTimer.interval = setInterval(tickSubjectTimer, 1000);
        toast('Cronômetro iniciado: ' + activeSubject, 'fa-play');
    });
    const stop = $('#subjectStopBtn');
    if (stop) stop.addEventListener('click', () => {
        if (!subjectTimer.running && subjectTimer.elapsed === 0) { toast('Nada para salvar ainda.', 'fa-triangle-exclamation'); return; }
        subjectTimer.running = false;
        clearInterval(subjectTimer.interval);
        const minutes = Math.round(subjectTimer.elapsed / 60);
        if (minutes >= 1) {
            addFocusMinutes(minutes, activeSubject);
            state.sessions += 1;
            saveState();
            toast('Salvo: ' + minutes + ' min em ' + activeSubject + '.', 'fa-check');
        } else {
            toast('Sessão curta demais (mínimo 1 minuto).', 'fa-hourglass');
        }
        subjectTimer.elapsed = 0;
        tickSubjectTimer();
        renderSubjectTotals();
        renderStats();
    });
    setInterval(tickSubjectTimer, 1000);
}

/* ============ 21. QUIZ ============ */
const QUIZ_BANK = {
    'Matemática': [
        { q: 'Qual é o valor de 2⁵?', o: ['10', '16', '25', '32'], a: 3 },
        { q: 'A derivada de f(x) = x³ é:', o: ['3x²', 'x²', '3x', 'x⁴/4'], a: 0 },
        { q: 'Se log₁₀(x) = 2, então x vale:', o: ['20', '100', '1000', '0,01'], a: 1 },
        { q: 'A soma dos ângulos internos de um triângulo é:', o: ['90°', '180°', '270°', '360°'], a: 1 },
        { q: 'Em uma PA de razão 3 com a₁ = 2, o quinto termo é:', o: ['11', '14', '17', '20'], a: 1 }
    ],
    'Português': [
        { q: 'Em "Ela correu rapidamente", "rapidamente" é:', o: ['adjetivo', 'advérbio', 'substantivo', 'preposição'], a: 1 },
        { q: 'A função do "que" em "Espero que você venha" é:', o: ['pronome relativo', 'conjunção integrante', 'advérbio', 'preposição'], a: 1 },
        { q: 'Qual figura de linguagem há em "seus olhos são duas estrelas"?', o: ['metonímia', 'metáfora', 'hipérbole', 'ironia'], a: 1 },
        { q: 'O sujeito de "Choveu muito ontem" é:', o: ['inexistente', 'oculto', 'simples', 'composto'], a: 0 },
        { q: 'A palavra "felicidade" é formada por:', o: ['derivação sufixal', 'prefixação', 'parassíntese', 'justaposição'], a: 0 }
    ],
    'História': [
        { q: 'A Revolução Francesa começou em:', o: ['1776', '1789', '1815', '1848'], a: 1 },
        { q: 'O Tratado de Tordesilhas (1494) dividia terras entre:', o: ['Espanha e Inglaterra', 'Portugal e Espanha', 'França e Portugal', 'Holanda e Espanha'], a: 1 },
        { q: 'A Proclamação da República no Brasil ocorreu em:', o: ['1822', '1888', '1889', '1930'], a: 2 },
        { q: 'O período conhecido como Era Vargas vai de:', o: ['1889 a 1930', '1930 a 1945', '1945 a 1964', '1964 a 1985'], a: 1 },
        { q: 'A Guerra Fria opôs principalmente:', o: ['EUA e URSS', 'Alemanha e França', 'China e Japão', 'Reino Unido e Rússia'], a: 0 }
    ],
    'Geografia': [
        { q: 'O maior bioma brasileiro em área é:', o: ['Mata Atlântica', 'Cerrado', 'Amazônia', 'Caatinga'], a: 2 },
        { q: 'A linha imaginária que divide a Terra em hemisférios norte e sul é:', o: ['Trópico de Câncer', 'Equador', 'Meridiano de Greenwich', 'Trópico de Capricórnio'], a: 1 },
        { q: 'Clima predominante no sertão nordestino:', o: ['tropical úmido', 'semiárido', 'subtropical', 'equatorial'], a: 1 },
        { q: 'Qual é o rio mais extenso do Brasil?', o: ['São Francisco', 'Paraná', 'Amazonas', 'Tocantins'], a: 2 },
        { q: 'A globalização intensificou principalmente:', o: ['o isolamento comercial', 'os fluxos de capital e informação', 'a queda das cidades', 'o fim das exportações'], a: 1 }
    ],
    'Biologia': [
        { q: 'A organela responsável pela respiração celular é:', o: ['ribossomo', 'mitocôndria', 'lisossomo', 'complexo de Golgi'], a: 1 },
        { q: 'Na fotossíntese, a planta libera:', o: ['gás carbônico', 'nitrogênio', 'oxigênio', 'metano'], a: 2 },
        { q: 'O DNA é composto por:', o: ['aminoácidos', 'nucleotídeos', 'lipídios', 'carboidratos'], a: 1 },
        { q: 'A meiose gera células com:', o: ['o dobro de cromossomos', 'o mesmo número', 'metade dos cromossomos', 'nenhum cromossomo'], a: 2 },
        { q: 'Os seres vivos que produzem seu próprio alimento são:', o: ['heterótrofos', 'autótrofos', 'decompositores', 'parasitas'], a: 1 }
    ],
    'Física': [
        { q: 'A unidade de força no SI é:', o: ['joule', 'newton', 'pascal', 'watt'], a: 1 },
        { q: 'A velocidade média é calculada por:', o: ['ΔS × Δt', 'ΔS / Δt', 'Δt / ΔS', 'ΔS + Δt'], a: 1 },
        { q: 'A lei de Ohm afirma que U =', o: ['R / i', 'R × i', 'i / R', 'R + i'], a: 1 },
        { q: 'Na queda livre, desconsiderando o ar, a aceleração é:', o: ['constante', 'crescente', 'decrescente', 'nula'], a: 0 },
        { q: 'A energia cinética depende de:', o: ['massa e velocidade', 'altura apenas', 'temperatura', 'pressão'], a: 0 }
    ],
    'Química': [
        { q: 'O número atômico indica a quantidade de:', o: ['nêutrons', 'prótons', 'elétrons de valência', 'isótopos'], a: 1 },
        { q: 'Uma solução com pH 3 é:', o: ['ácida', 'neutra', 'básica', 'anfótera'], a: 0 },
        { q: 'Na tabela periódica, os gases nobres estão no grupo:', o: ['1', '2', '17', '18'], a: 3 },
        { q: 'Ligação entre metal e não metal com transferência de elétrons é:', o: ['covalente', 'iônica', 'metálica', 'dativa'], a: 1 },
        { q: 'Uma reação exotérmica:', o: ['absorve calor', 'libera calor', 'não troca energia', 'só ocorre com luz'], a: 1 }
    ]
};

const quiz = { questions: [], index: 0, score: 0, active: false };

function resetQuizView() {
    quiz.active = false;
    const stage = $('#quizStage');
    if (stage) stage.classList.add('hidden');
    const setup = $('#quizSetup');
    if (setup) setup.classList.remove('hidden');
    const subjectSelect = $('#quizSubject');
    if (subjectSelect) {
        subjectSelect.innerHTML = Object.keys(QUIZ_BANK).map((s) => '<option value="' + escapeHtml(s) + '">' + escapeHtml(s) + '</option>').join('');
    }
}

function renderQuizQuestion() {
    const item = quiz.questions[quiz.index];
    if (!item) { finishQuiz(); return; }
    const progress = $('#quizProgressLabel');
    if (progress) progress.textContent = 'Pergunta ' + (quiz.index + 1) + ' de ' + quiz.questions.length;
    const score = $('#quizScoreLabel');
    if (score) score.textContent = quiz.score + ' acertos';
    const question = $('#quizQuestion');
    if (question) question.textContent = item.q;
    const options = $('#quizOptions');
    if (options) {
        options.innerHTML = item.o.map((opt, i) => '<button class="quiz-option" type="button" data-fx="flip" data-option="' + i + '">' + escapeHtml(opt) + '</button>').join('');
    }
    const feedback = $('#quizFeedback');
    if (feedback) feedback.textContent = '';
}

function finishQuiz() {
    quiz.active = false;
    const question = $('#quizQuestion');
    if (question) question.textContent = 'Quiz concluído!';
    const options = $('#quizOptions');
    if (options) options.innerHTML = '';
    const feedback = $('#quizFeedback');
    if (feedback) feedback.textContent = 'Você acertou ' + quiz.score + ' de ' + quiz.questions.length + '.';
    if (quiz.score > state.quizBest) state.quizBest = quiz.score;
    addXp(quiz.score * 5);
    saveState();
    toast('Quiz finalizado: ' + quiz.score + '/' + quiz.questions.length, 'fa-brain');
}

function bindQuiz() {
    resetQuizView();
    const start = $('#quizStartBtn');
    if (start) start.addEventListener('click', () => {
        const subject = ($('#quizSubject') || {}).value;
        const count = Number(($('#quizCount') || {}).value || 5);
        const bank = QUIZ_BANK[subject] || [];
        if (!bank.length) { toast('Sem perguntas para essa matéria.', 'fa-triangle-exclamation'); return; }
        quiz.questions = shuffle(bank).slice(0, Math.min(count, bank.length));
        quiz.index = 0;
        quiz.score = 0;
        quiz.active = true;
        const setup = $('#quizSetup');
        if (setup) setup.classList.add('hidden');
        const stage = $('#quizStage');
        if (stage) stage.classList.remove('hidden');
        renderQuizQuestion();
    });
    const options = $('#quizOptions');
    if (options) options.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-option]');
        if (!btn || !quiz.active) return;
        const item = quiz.questions[quiz.index];
        if (!item) return;
        const chosen = Number(btn.dataset.option);
        const buttons = $$('#quizOptions .quiz-option');
        buttons.forEach((b) => { b.disabled = true; });
        if (chosen === item.a) { btn.classList.add('correct'); quiz.score += 1; } else {
            btn.classList.add('wrong');
            if (buttons[item.a]) buttons[item.a].classList.add('correct');
        }
        const feedback = $('#quizFeedback');
        if (feedback) feedback.textContent = chosen === item.a ? 'Isso! Resposta correta.' : 'Não foi essa. A correta está em verde.';
        quiz.index += 1;
        setTimeout(() => { if (quiz.index >= quiz.questions.length) finishQuiz(); else renderQuizQuestion(); }, 800);
    });
    const restart = $('#quizRestartBtn');
    if (restart) restart.addEventListener('click', () => {
        resetQuizView();
        const stage = $('#quizStage');
        if (stage) stage.classList.add('hidden');
    });
}

/* ============ 22. CLICKER GAME ============ */
const CLICKER_UPGRADES = [
    { id: 'cursor', name: 'Cursor amigo', cost: 20, cps: 1, desc: '+1 energia por segundo' },
    { id: 'caderno', name: 'Caderno turbo', cost: 60, cps: 3, desc: '+3 energia por segundo' },
    { id: 'cafe', name: 'Café infinito', cost: 150, cps: 8, desc: '+8 energia por segundo' },
    { id: 'robô', name: 'Robô de revisão', cost: 400, cps: 20, desc: '+20 energia por segundo' }
];

function renderClickerShop() {
    const shop = $('#clickerShop');
    const points = $('#clickerPoints');
    if (points) points.textContent = Math.floor(state.clicker.points);
    if (!shop) return;
    shop.innerHTML = CLICKER_UPGRADES.map((u) => {
        const owned = state.clicker.upgrades.indexOf(u.id) !== -1;
        return '<div class="shop-item"><strong>' + u.name + '</strong><span class="card-sub">' + u.desc + '</span>' +
            '<button class="buy-btn" type="button" data-fx="coin" data-upgrade="' + u.id + '"' + (owned ? ' disabled' : '') + '>' +
            (owned ? 'Instalado' : '<i class="fa-solid fa-coins"></i> ' + u.cost) + '</button></div>';
    }).join('');
}

function clickerTick() {
    let cps = 0;
    state.clicker.upgrades.forEach((id) => {
        const up = CLICKER_UPGRADES.find((u) => u.id === id);
        if (up) cps += up.cps;
    });
    state.clicker.cps = cps;
    state.clicker.points += cps;
    const points = $('#clickerPoints');
    if (points) points.textContent = Math.floor(state.clicker.points);
}

function bindClicker() {
    renderClickerShop();
    const core = $('#clickerCore');
    if (core) core.addEventListener('click', () => {
        state.clicker.points += 1;
        const points = $('#clickerPoints');
        if (points) points.textContent = Math.floor(state.clicker.points);
    });
    const shop = $('#clickerShop');
    if (shop) shop.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-upgrade]');
        if (!btn) return;
        const up = CLICKER_UPGRADES.find((u) => u.id === btn.dataset.upgrade);
        if (!up) return;
        if (state.clicker.points < up.cost) { toast('Energia insuficiente.', 'fa-bolt'); return; }
        state.clicker.points -= up.cost;
        state.clicker.upgrades.push(up.id);
        saveState();
        renderClickerShop();
        toast(up.name + ' instalado!', 'fa-bolt');
    });
    const exchange = $('#clickerExchangeBtn');
    if (exchange) exchange.addEventListener('click', () => {
        if (state.clicker.points < 50) { toast('Junte 50 de energia primeiro.', 'fa-bolt'); return; }
        state.clicker.points -= 50;
        addCoins(5);
        saveState();
        renderClickerShop();
        toast('+5 moedas!', 'fa-coins');
    });
    setInterval(clickerTick, 1000);
}

/* ============ 23. SONS AMBIENTE ============ */
let audioCtx = null;
const ambientPlaying = {};

function getAudioCtx() {
    try {
        if (!audioCtx) {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return null;
            audioCtx = new Ctx();
        }
        if (audioCtx.state === 'suspended') audioCtx.resume();
        return audioCtx;
    } catch (e) { return null; }
}

function noiseBuffer(ctx) {
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
}

const AMBIENT = [
    { id: 'rain', name: 'Chuva', emoji: '🌧️', filter: 'bandpass', freq: 1400, q: 0.8, gain: 0.5 },
    { id: 'forest', name: 'Floresta', emoji: '🌲', filter: 'lowpass', freq: 900, q: 0.6, gain: 0.35 },
    { id: 'cafe', name: 'Café', emoji: '☕', filter: 'lowpass', freq: 520, q: 0.5, gain: 0.32 },
    { id: 'white', name: 'Ruído branco', emoji: '📻', filter: 'highpass', freq: 2200, q: 0.4, gain: 0.22 },
    { id: 'waves', name: 'Ondas', emoji: '🌊', filter: 'bandpass', freq: 420, q: 0.9, gain: 0.42, lfo: true }
];

function renderAmbient() {
    const grid = $('#ambientGrid');
    if (!grid) return;
    grid.innerHTML = AMBIENT.map((s) => {
        const playing = !!ambientPlaying[s.id];
        return '<div class="ambient-card' + (playing ? ' playing' : '') + '" data-ambient-card="' + s.id + '">' +
            '<div class="ambient-head"><span>' + s.emoji + ' ' + s.name + '</span>' +
            '<button class="ambient-toggle" type="button" data-fx="pop" data-ambient="' + s.id + '" aria-label="Alternar ' + s.name + '"><i class="fa-solid ' + (playing ? 'fa-pause' : 'fa-play') + '"></i></button></div>' +
            '<label class="range-field">Volume <input type="range" min="0" max="100" value="' + Math.round((s.gain) * 100) + '" data-ambient-volume="' + s.id + '"></label>' +
            '</div>';
    }).join('');
}

function startAmbient(id) {
    const ctx = getAudioCtx();
    if (!ctx) { toast('Áudio não suportado neste navegador.', 'fa-triangle-exclamation'); return; }
    const def = AMBIENT.find((s) => s.id === id);
    if (!def) return;
    stopAmbient(id, true);
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer(ctx);
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = def.filter;
    filter.frequency.value = def.freq;
    filter.Q.value = def.q;
    const gain = ctx.createGain();
    gain.gain.value = def.gain * 0.4;
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start();
    let lfo = null;
    if (def.lfo) {
        lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 0.12;
        lfoGain.gain.value = 0.16;
        lfo.connect(lfoGain).connect(gain.gain);
        lfo.start();
    }
    ambientPlaying[id] = { source: source, gain: gain, lfo: lfo, def: def };
    renderAmbient();
}

function stopAmbient(id, silent) {
    const node = ambientPlaying[id];
    if (!node) return;
    try { node.source.stop(); } catch (e) { /* já parado */ }
    if (node.lfo) { try { node.lfo.stop(); } catch (e) { /* já parado */ } }
    delete ambientPlaying[id];
    if (!silent) renderAmbient();
}

function bindAmbient() {
    renderAmbient();
    const grid = $('#ambientGrid');
    if (grid) {
        grid.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-ambient]');
            if (!btn) return;
            const id = btn.dataset.ambient;
            if (ambientPlaying[id]) stopAmbient(id); else startAmbient(id);
        });
        grid.addEventListener('input', (e) => {
            const slider = e.target.closest('[data-ambient-volume]');
            if (!slider) return;
            const id = slider.dataset.ambientVolume;
            if (ambientPlaying[id]) ambientPlaying[id].gain.gain.value = (Number(slider.value) / 100) * 0.4;
        });
    }
    const stopAll = $('#ambientStopAll');
    if (stopAll) stopAll.addEventListener('click', () => {
        Object.keys(ambientPlaying).forEach((id) => stopAmbient(id));
        renderAmbient();
        toast('Sons silenciados.', 'fa-volume-xmark');
    });
}

/* ============ 24. SONS DE TECLADO ============ */
function playKeySound() {
    if (!state.keySounds.on) return;
    const ctx = getAudioCtx();
    if (!ctx) return;
    const volume = clamp(state.keySounds.volume / 100, 0, 1) * 0.2;
    if (volume <= 0) return;
    const style = state.keySounds.style;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    const config = {
        soft: { type: 'sine', from: 420, to: 180, dur: 0.06 },
        mechanical: { type: 'square', from: 220, to: 120, dur: 0.035 },
        typewriter: { type: 'triangle', from: 160, to: 90, dur: 0.08 },
        pop: { type: 'sine', from: 760, to: 300, dur: 0.05 }
    }[style] || { type: 'sine', from: 420, to: 180, dur: 0.06 };
    osc.type = config.type;
    osc.frequency.setValueAtTime(config.from, now);
    osc.frequency.exponentialRampToValueAtTime(config.to, now + config.dur);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + config.dur + 0.02);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + config.dur + 0.03);
}

function bindKeySounds() {
    const toggle = $('#keySoundToggle');
    const style = $('#keySoundStyle');
    const volume = $('#keySoundVolume');
    if (toggle) toggle.checked = !!state.keySounds.on;
    if (style) style.value = state.keySounds.style;
    if (volume) volume.value = state.keySounds.volume;
    if (toggle) toggle.addEventListener('change', () => { state.keySounds.on = toggle.checked; saveState(); toast(toggle.checked ? 'Sons de teclado ligados.' : 'Sons de teclado desligados.', 'fa-keyboard'); });
    if (style) style.addEventListener('change', () => { state.keySounds.style = style.value; saveState(); playKeySound(); });
    if (volume) volume.addEventListener('input', () => { state.keySounds.volume = Number(volume.value); saveState(); });
    document.addEventListener('keydown', (e) => {
        const tag = (e.target.tagName || '').toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') return;
        if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') return;
        playKeySound();
    });
}

/* ============ 25. CALCULADORA ============ */
const calc = { expression: '' };

function evaluateExpression(raw) {
    const cleaned = raw.replace(/%/g, '/100').replace(/[^0-9+\-*/(). ]/g, '');
    if (!cleaned.trim()) return null;
    try {
        const value = Function('"use strict"; return (' + cleaned + ')')();
        if (typeof value !== 'number' || !isFinite(value)) return null;
        return Math.round(value * 1e10) / 1e10;
    } catch (e) { return null; }
}

function renderCalc() {
    const expr = $('#calcExpression');
    if (expr) expr.textContent = calc.expression || '\u00a0';
    const result = $('#calcResult');
    if (!result) return;
    const value = evaluateExpression(calc.expression);
    result.textContent = value === null ? (calc.expression ? '…' : '0') : value;
}

function bindCalculator() {
    renderCalc();
    const keys = $('#calcKeys');
    if (keys) keys.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-calc]');
        if (!btn) return;
        const key = btn.dataset.calc;
        if (key === 'clear') { calc.expression = ''; }
        else if (key === 'back') { calc.expression = calc.expression.slice(0, -1); }
        else if (key === '=') {
            const value = evaluateExpression(calc.expression);
            if (value === null) { toast('Expressão inválida.', 'fa-triangle-exclamation'); return; }
            calc.expression = String(value);
        } else if (key === '.') { calc.expression += '.'; }
        else { calc.expression += key; }
        renderCalc();
    });
}

/* ============ 26. CARACTERES ÚTEIS ============ */
const CHARS = [
    { id: 'mat', label: 'Matemática', items: ['∑', '∫', '√', 'π', '∞', '≈', '≠', '≤', '≥', '±', '×', '÷', '∂', '∆', '∈', '∉', '∅', '⇒', '⇔', '∀', '∃', '∴', '∵', '⌊', '⌋', '⌈', '⌉', '∠', '°', '%'] },
    { id: 'fis', label: 'Física', items: ['Ω', 'μ', 'λ', 'ν', 'γ', 'θ', 'φ', 'α', 'β', 'ω', 'ℏ', '℃', 'Å', '→', '⇌', '±'] },
    { id: 'grego', label: 'Grego', items: ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω', 'Δ', 'Σ', 'Π', 'Ω'] },
    { id: 'sim', label: 'Símbolos', items: ['★', '☆', '✓', '✔', '✗', '✘', '⚠', '☢', '☣', '♻', '⚡', '☀', '☁', '☂', '♫', '♪', '❤', '✦', '✧', '➜', '➤', '→', '←', '↑', '↓', '⇒', '•', '·', '§', '¶', '©', '®', '™'] },
    { id: 'sub', label: 'Potências', items: ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹', '₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉', '½', '⅓', '¼', '¾'] },
    { id: 'moeda', label: 'Moedas', items: ['€', '$', '£', '¥', '₽', '₿', '₹', '₩', '₺', '₴'] }
];
let charCategory = 'all';

function renderChars() {
    const cats = $('#charsCategories');
    if (cats) {
        cats.innerHTML = '<button class="filter-chip' + (charCategory === 'all' ? ' active' : '') + '" type="button" data-fx="squish" data-char-cat="all">Todos</button>' +
            CHARS.map((c) => '<button class="filter-chip' + (charCategory === c.id ? ' active' : '') + '" type="button" data-fx="squish" data-char-cat="' + c.id + '">' + c.label + '</button>').join('');
    }
    const query = (($('#charsSearch') || {}).value || '').trim().toLowerCase();
    let items = [];
    CHARS.forEach((c) => {
        if (charCategory !== 'all' && c.id !== charCategory) return;
        c.items.forEach((ch) => items.push({ ch: ch, cat: c.label }));
    });
    if (query) {
        /* Aceita "α", "03b1" (como no Dev Log), "3b1" e "u+03b1" */
        const normalized = query.replace(/^u\+/, '').replace(/^0+/, '');
        items = items.filter((it) => {
            const code = it.ch.codePointAt(0).toString(16).toLowerCase();
            const matchesCode = normalized.length > 0 && (code === normalized || code.indexOf(normalized) !== -1);
            return it.ch === query || matchesCode || it.cat.toLowerCase().indexOf(query) !== -1;
        });
    }
    const favs = state.charsFav.slice();
    items.sort((a, b) => (favs.indexOf(b.ch) - favs.indexOf(a.ch)));
    const grid = $('#charGrid');
    if (grid) {
        grid.innerHTML = items.length
            ? items.map((it) => '<button class="char-btn' + (favs.indexOf(it.ch) !== -1 ? ' fav' : '') + '" type="button" data-fx="pop" data-char="' + escapeHtml(it.ch) + '" title="Clique para copiar · duplo clique para favoritar">' + it.ch + '</button>').join('')
            : '<div class="empty-state">Nenhum caractere encontrado.</div>';
    }
    const favCount = $('#charFavCount');
    if (favCount) favCount.textContent = favs.length + ' favoritos';
}

function bindChars() {
    renderChars();
    const search = $('#charsSearch');
    if (search) search.addEventListener('input', renderChars);
    const cats = $('#charsCategories');
    if (cats) cats.addEventListener('click', (e) => {
        const chip = e.target.closest('[data-char-cat]');
        if (!chip) return;
        charCategory = chip.dataset.charCat;
        renderChars();
    });
    const grid = $('#charGrid');
    if (grid) {
        grid.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-char]');
            if (!btn) return;
            const ch = btn.dataset.char;
            copyText(ch).then((ok) => {
                const status = $('#charStatus');
                if (status) status.textContent = ok ? 'Copiado: ' + ch : 'Não foi possível copiar.';
            });
        });
        grid.addEventListener('dblclick', (e) => {
            const btn = e.target.closest('[data-char]');
            if (!btn) return;
            const ch = btn.dataset.char;
            const index = state.charsFav.indexOf(ch);
            if (index === -1) state.charsFav.push(ch); else state.charsFav.splice(index, 1);
            saveState();
            renderChars();
        });
    }
}

/* ============ 27. TÍTULO DA PÁGINA ============ */
const FONTS = ['Poppins', 'Orbitron', 'Space Grotesk', 'Fira Code', 'Caveat', 'Patrick Hand'];
const ICONS = ['fa-graduation-cap', 'fa-book-open', 'fa-brain', 'fa-fire', 'fa-star', 'fa-rocket', 'fa-atom', 'fa-crown', 'fa-infinity', 'fa-laptop-code'];

function applyPageTitle() {
    document.title = state.pageTitle + ' - Study Hub';
    const brand = $('.geekie-brand-name');
    if (brand) brand.textContent = state.pageTitle;
    const preview = $('#titlePreview');
    if (preview) {
        preview.textContent = state.pageTitle;
        preview.style.fontFamily = "'" + state.font + "', sans-serif";
    }
    const headerIcon = $('.fab-menu-header i');
    if (headerIcon) headerIcon.className = 'fa-solid ' + state.icon;
}

function renderTitleEditor() {
    const text = $('#titleTextInput');
    if (text) text.value = state.pageTitle;
    const fontSelect = $('#titleFontSelect');
    if (fontSelect) {
        fontSelect.innerHTML = FONTS.map((f) => '<option value="' + f + '">' + f + '</option>').join('');
        fontSelect.value = state.font;
    }
    const iconSelect = $('#titleIconSelect');
    if (iconSelect) {
        iconSelect.innerHTML = ICONS.map((i) => '<option value="' + i + '">' + i.replace('fa-', '') + '</option>').join('');
        iconSelect.value = state.icon;
    }
    applyPageTitle();
}

function bindTitleEditor() {
    renderTitleEditor();
    const apply = $('#titleApplyBtn');
    if (apply) apply.addEventListener('click', () => {
        const text = ($('#titleTextInput') || {}).value || '';
        if (!text.trim()) { toast('Digite um título.', 'fa-triangle-exclamation'); return; }
        state.pageTitle = text.trim();
        state.font = ($('#titleFontSelect') || {}).value || 'Poppins';
        state.icon = ($('#titleIconSelect') || {}).value || 'fa-graduation-cap';
        saveState();
        applyPageTitle();
        toast('Título aplicado.', 'fa-pen-nib');
    });
    const reset = $('#titleResetBtn');
    if (reset) reset.addEventListener('click', () => {
        state.pageTitle = DEFAULT_STATE.pageTitle;
        state.font = 'Poppins';
        state.icon = 'fa-graduation-cap';
        saveState();
        renderTitleEditor();
        toast('Título padrão restaurado.', 'fa-rotate-left');
    });
    const text = $('#titleTextInput');
    if (text) text.addEventListener('input', () => {
        const preview = $('#titlePreview');
        if (preview) preview.textContent = text.value || 'Prévia do título';
    });
}

/* ============ 28. EVENTOS DO MÊS ============ */
const EVENTS = [
    { month: 1, name: 'Janeiro: Início de Jornada', icon: '🚀', desc: 'Novo ano, nova energia!', tiers: [{ label: 'Iniciante', xp: 0, reward: 'Badge de boas-vindas' }, { label: 'Estudioso', xp: 500, reward: 'Tema Floresta liberado' }, { label: 'Expert', xp: 1500, reward: 'Tema Cósmico liberado' }, { label: 'Lendário', xp: 3000, reward: 'XP em dobro por 7 dias' }] },
    { month: 2, name: 'Fevereiro: Amor ao Saber', icon: '❤️', desc: 'Apaixone-se por aprender!', tiers: [{ label: 'Iniciante', xp: 0, reward: 'Badge especial' }, { label: 'Estudioso', xp: 500, reward: 'Badge coração' }, { label: 'Expert', xp: 1500, reward: 'Tema Pôr do Sol liberado' }, { label: 'Lendário', xp: 3000, reward: 'XP em dobro por 7 dias' }] },
    { month: 3, name: 'Março: Força Total', icon: '💪', desc: 'Sprint de estudos!', tiers: [{ label: 'Iniciante', xp: 0, reward: 'Badge especial' }, { label: 'Estudioso', xp: 500, reward: 'Badge broto' }, { label: 'Expert', xp: 1500, reward: 'Tema Floresta liberado' }, { label: 'Lendário', xp: 3000, reward: 'Tema Gelo liberado' }] },
    { month: 4, name: 'Abril: Despertar Digital', icon: '🌐', desc: 'Tecnologia e estudo juntos!', tiers: [{ label: 'Iniciante', xp: 0, reward: 'Badge especial' }, { label: 'Estudioso', xp: 500, reward: 'Badge código' }, { label: 'Expert', xp: 1500, reward: 'Tema Matrix liberado' }, { label: 'Lendário', xp: 3000, reward: 'Tema Gelo liberado' }] },
    { month: 5, name: 'Maio: Maratona do Foco', icon: '⏱️', desc: 'Foco máximo!', tiers: [{ label: 'Iniciante', xp: 0, reward: 'Badge especial' }, { label: 'Estudioso', xp: 500, reward: 'Badge foco' }, { label: 'Expert', xp: 1500, reward: 'Tema Cósmico liberado' }, { label: 'Lendário', xp: 3000, reward: 'Pomodoro dourado' }] },
    { month: 6, name: 'Junho: Meio do Ano', icon: '🌟', desc: 'Metade da jornada!', tiers: [{ label: 'Iniciante', xp: 0, reward: 'Badge especial' }, { label: 'Estudioso', xp: 500, reward: 'Badge sol' }, { label: 'Expert', xp: 1500, reward: 'Tema Pôr do Sol liberado' }, { label: 'Lendário', xp: 3000, reward: 'Todos os temas liberados' }] },
    { month: 7, name: 'Julho: Inverno Produtivo', icon: '❄️', desc: 'Aquece com conhecimento!', tiers: [{ label: 'Iniciante', xp: 0, reward: 'Badge especial' }, { label: 'Estudioso', xp: 500, reward: 'Badge gelo' }, { label: 'Expert', xp: 1500, reward: 'Tema Gelo liberado' }, { label: 'Lendário', xp: 3000, reward: 'Badge diamante' }] },
    { month: 8, name: 'Agosto: Aceleração Final', icon: '🔥', desc: 'Sprint para o ENEM!', tiers: [{ label: 'Iniciante', xp: 0, reward: 'Badge especial' }, { label: 'Estudioso', xp: 500, reward: 'Badge chama' }, { label: 'Expert', xp: 1500, reward: 'Tema Neon liberado' }, { label: 'Lendário', xp: 3000, reward: 'Modo turbo (XP x2)' }] },
    { month: 9, name: 'Setembro: Mês da Ciência', icon: '🔬', desc: 'Explore ciências!', tiers: [{ label: 'Iniciante', xp: 0, reward: 'Badge especial' }, { label: 'Estudioso', xp: 500, reward: 'Badge laboratório' }, { label: 'Expert', xp: 1500, reward: 'Tema Oceano liberado' }, { label: 'Lendário', xp: 3000, reward: 'Badge cientista' }] },
    { month: 10, name: 'Outubro: Véspera do ENEM', icon: '🎯', desc: 'Revisão total!', tiers: [{ label: 'Iniciante', xp: 0, reward: 'Badge especial' }, { label: 'Estudioso', xp: 500, reward: 'Badge revisão' }, { label: 'Expert', xp: 1500, reward: 'Tema Pôr do Sol liberado' }, { label: 'Lendário', xp: 3000, reward: 'Badge estrategista' }] },
    { month: 11, name: 'Novembro: Hora da Verdade', icon: '⚡', desc: 'ENEM chegou!', tiers: [{ label: 'Iniciante', xp: 0, reward: 'Badge especial' }, { label: 'Estudioso', xp: 500, reward: 'Badge leão' }, { label: 'Expert', xp: 1500, reward: 'Tema Nebulosa liberado' }, { label: 'Lendário', xp: 3000, reward: 'Tema Cósmico liberado' }] },
    { month: 12, name: 'Dezembro: Celebração!', icon: '🎉', desc: 'Celebre cada minuto de estudo!', tiers: [{ label: 'Iniciante', xp: 0, reward: 'Badge especial' }, { label: 'Estudioso', xp: 500, reward: 'Badge festa' }, { label: 'Expert', xp: 1500, reward: 'Pack completo de temas' }, { label: 'Lendário', xp: 3000, reward: 'XP x3 em janeiro' }] }
];

let currentEventMonth = new Date().getMonth() + 1;

function renderEventMonths() {
    const box = $('#eventMonths');
    if (box) {
        box.innerHTML = EVENTS.map((e) => '<button class="filter-chip' + (e.month === currentEventMonth ? ' active' : '') + '" type="button" data-fx="squish" data-month="' + e.month + '">' + e.icon + ' ' + e.name.split(':')[0] + '</button>').join('');
    }
    const card = $('#eventCard');
    if (!card) return;
    const event = EVENTS.find((e) => e.month === currentEventMonth) || EVENTS[0];
    card.innerHTML = '<div class="event-hero"><span class="event-emoji">' + event.icon + '</span><div><div class="event-name">' + escapeHtml(event.name) + '</div><div class="event-desc">' + escapeHtml(event.desc) + '</div></div></div>' +
        '<div class="event-tiers">' + event.tiers.map((t) => '<div class="event-tier' + (state.xp >= t.xp ? ' reached' : '') + '"><strong>' + t.label + '</strong><span>' + t.xp + ' XP</span><span>' + escapeHtml(t.reward) + '</span></div>').join('') + '</div>';
}

function bindEvents() {
    renderEventMonths();
    const box = $('#eventMonths');
    if (box) box.addEventListener('click', (e) => {
        const chip = e.target.closest('[data-month]');
        if (!chip) return;
        currentEventMonth = Number(chip.dataset.month);
        renderEventMonths();
    });
}

/* ============ 29. COMANDOS E CÓDIGOS DE RECOMPENSA ============ */
const CMD_LIMIT = 260;
let cmdLog = [];
let cmdHistoryIndex = 0;

function renderCmdLog() {
    const box = $('#cmdOutput');
    if (!box) return;
    box.innerHTML = cmdLog.map((l) => '<div class="cmd-line ' + l.type + '">' + escapeHtml(l.text) + '</div>').join('');
    box.scrollTop = box.scrollHeight;
}

function cmdPrint(type, text) {
    String(text).split('\n').forEach((line) => cmdLog.push({ type: type, text: line }));
    if (cmdLog.length > CMD_LIMIT) cmdLog = cmdLog.slice(cmdLog.length - CMD_LIMIT);
    renderCmdLog();
}

const CMD_TAB_ALIASES = {
    inicio: 'tab-geekie', home: 'tab-geekie', geekie: 'tab-geekie',
    chat: 'tab-chat', ia: 'tab-chat', tutor: 'tab-chat',
    notas: 'tab-notes', notes: 'tab-notes',
    loja: 'tab-store', store: 'tab-store', temas: 'tab-store',
    titulos: 'tab-titles', titulo: 'tab-title', title: 'tab-title',
    pets: 'tab-pets', pet: 'tab-pets',
    trilha: 'tab-journey', journey: 'tab-journey',
    pomodoro: 'tab-timer', timer: 'tab-timer', foco: 'tab-timer',
    metas: 'tab-goals', goals: 'tab-goals',
    flashcards: 'tab-flashcards', cards: 'tab-flashcards',
    planner: 'tab-planner', agenda: 'tab-planner',
    estatisticas: 'tab-stats', stats: 'tab-stats',
    materias: 'tab-subjects', subjects: 'tab-subjects',
    quiz: 'tab-quiz', clicker: 'tab-clicker',
    ambiente: 'tab-ambient', ambient: 'tab-ambient', sons: 'tab-ambient',
    teclado: 'tab-keysounds', keysounds: 'tab-keysounds',
    calculadora: 'tab-calculator', calculator: 'tab-calculator',
    caracteres: 'tab-chars', chars: 'tab-chars', simbolos: 'tab-chars',
    eventos: 'tab-events', events: 'tab-events', calendario: 'tab-events',
    google: 'tab-google',
    comandos: 'tab-commands', commands: 'tab-commands', terminal: 'tab-commands',
    recompensas: 'tab-rewards', rewards: 'tab-rewards', codigos: 'tab-rewards',
    devlog: 'tab-devlog', diario: 'tab-diary', diary: 'tab-diary',
    senhas: 'tab-password', password: 'tab-password'
};

function resolveTabId(arg) {
    const key = String(arg || '').trim().toLowerCase().replace(/^tab-/, '');
    if (!key) return null;
    if (CMD_TAB_ALIASES[key]) return CMD_TAB_ALIASES[key];
    const byTitle = TAB_META.find((t) => t.title.toLowerCase() === key) || TAB_META.find((t) => t.title.toLowerCase().indexOf(key) === 0);
    return byTitle ? byTitle.id : null;
}

function renderCmdSuggestions(query) {
    const box = $('#cmdSuggestions');
    if (!box) return;
    const term = String(query || '').trim().toLowerCase();
    const list = (term
        ? COMMANDS.filter((c) => c.name.indexOf(term) === 0 || c.desc.toLowerCase().indexOf(term) !== -1)
        : COMMANDS).slice(0, 7);
    box.innerHTML = list.map((c) => '<button class="chip cmd-suggestion" type="button" data-fx="lift" data-cmd-suggest="' + c.name + '">' +
        escapeHtml(c.name) + ' <span>' + escapeHtml(c.desc) + '</span></button>').join('');
}

function focusCommandInput() {
    const input = $('#cmdInput');
    if (!input) return;
    renderCmdSuggestions(input.value);
    setTimeout(() => input.focus(), 80);
}

function filterFabItems() {
    const search = $('#fabSearch');
    if (!search) return;
    const term = search.value.trim().toLowerCase();
    $$('.fab-nav-item[data-tab]').forEach((item) => {
        item.style.display = (!term || item.textContent.toLowerCase().indexOf(term) !== -1) ? '' : 'none';
    });
}

function themeNameById(id) {
    const list = (typeof THEMES !== 'undefined' && Array.isArray(THEMES)) ? THEMES : [];
    const theme = list.find((t) => t.id === id);
    return theme ? theme.name : null;
}

const COMMANDS = [
    {
        name: 'ajuda', args: '[comando]', desc: 'Lista os comandos ou detalha um deles',
        run(a) {
            if (a) {
                const cmd = COMMANDS.find((c) => c.name === a.toLowerCase());
                if (!cmd) throw new Error('Não conheço o comando "' + a + '".');
                return 'Uso: ' + cmd.name + ' ' + cmd.args + '\n' + cmd.desc;
            }
            return ['Comandos disponíveis (' + COMMANDS.length + '):']
                .concat(COMMANDS.map((c) => '  ' + (c.name + ' ' + c.args).trim() + ' — ' + c.desc));
        }
    },
    {
        name: 'ir', args: '<aba>', desc: 'Abre uma aba (ex.: ir notas)',
        run(a) {
            if (!a) throw new Error('Diga para onde ir: ir notas, ir devlog, ir recompensas...');
            const id = resolveTabId(a);
            if (!id) throw new Error('Aba não encontrada: "' + a + '".');
            switchTab(id);
            const meta = TAB_META.find((t) => t.id === id);
            return 'Abrindo ' + (meta ? meta.title : id) + '.';
        }
    },
    {
        name: 'foco', args: '[minutos]', desc: 'Inicia o pomodoro (padrão 25 min)',
        run(a) {
            const wanted = parseInt(a, 10);
            const minutes = Math.max(1, Math.min(180, isNaN(wanted) ? 25 : wanted));
            switchTab('tab-timer');
            let matched = false;
            $$('#pomoModes .filter-chip').forEach((chip) => {
                const n = Number(String(chip.textContent).replace(/[^0-9]/g, ''));
                if (n === minutes && !matched) { chip.click(); matched = true; }
            });
            const start = $('#pomoStartBtn');
            if (!start) throw new Error('Controle do pomodoro não encontrado.');
            start.click();
            return 'Foco iniciado com ' + (matched ? minutes + ' minutos' : 'o modo atual') + '. Bons estudos!';
        }
    },
    {
        name: 'pausar', args: '', desc: 'Pausa o pomodoro',
        run() {
            const btn = $('#pomoPauseBtn');
            if (!btn) throw new Error('Pomodoro indisponível.');
            btn.click();
            return 'Pomodoro pausado.';
        }
    },
    {
        name: 'zerar', args: '', desc: 'Zera o ciclo do pomodoro',
        run() {
            const btn = $('#pomoResetBtn');
            if (!btn) throw new Error('Pomodoro indisponível.');
            btn.click();
            return 'Ciclo zerado.';
        }
    },
    {
        name: 'quiz', args: '<matéria>', desc: 'Começa um quiz da matéria',
        run(a) {
            if (!a) throw new Error('Diga a matéria: quiz biologia.');
            const select = $('#quizSubject');
            if (!select) throw new Error('Quiz indisponível.');
            const term = a.toLowerCase();
            const option = Array.from(select.options).find((o) => o.value.toLowerCase() === term || o.textContent.toLowerCase().indexOf(term) === 0);
            if (!option) throw new Error('Matéria não encontrada: "' + a + '".');
            switchTab('tab-quiz');
            select.value = option.value;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            const start = $('#quizStartBtn');
            if (start) start.click();
            return 'Quiz de ' + option.textContent.trim() + ' iniciado.';
        }
    },
    {
        name: 'tema', args: '<nome>', desc: 'Aplica um tema desbloqueado',
        run(a) {
            if (!a) throw new Error('Diga o tema: tema neon.');
            const term = a.toLowerCase();
            const list = (typeof THEMES !== 'undefined' && Array.isArray(THEMES)) ? THEMES : [];
            const theme = list.find((t) => t.id.toLowerCase() === term || t.name.toLowerCase().indexOf(term) === 0);
            if (!theme) throw new Error('Tema não encontrado: "' + a + '".');
            if (state.themesOwned.indexOf(theme.id) === -1) throw new Error('O tema "' + theme.name + '" ainda não está desbloqueado. Veja a Loja.');
            applyTheme(theme.id);
            state.theme = theme.id;
            saveState();
            return 'Tema ' + theme.name + ' aplicado.';
        }
    },
    {
        name: 'diario', args: '<texto>', desc: 'Salva a entrada do diário de hoje',
        run(a) {
            if (!a) throw new Error('Escreva algo: diario hoje rendeu bem em matemática.');
            switchTab('tab-diary');
            const text = $('#diaryText');
            const save = $('#diarySaveBtn');
            if (!text || !save) throw new Error('Diário indisponível.');
            text.value = a;
            text.dispatchEvent(new Event('input', { bubbles: true }));
            save.click();
            return 'Entrada do diário salva.';
        }
    },
    {
        name: 'nota', args: '<título> | <texto>', desc: 'Cria uma nota nova',
        run(a) {
            if (!a) throw new Error('Use: nota Título | conteúdo da nota.');
            const parts = String(a).split('|');
            const title = (parts[0] || '').trim();
            const body = parts.length > 1 ? parts.slice(1).join('|').trim() : '';
            if (!title) throw new Error('A nota precisa de um título.');
            switchTab('tab-notes');
            const newBtn = $('#noteNewBtn');
            if (newBtn) newBtn.click();
            const titleInput = $('#noteTitleInput');
            const content = $('#noteContentInput');
            const save = $('#noteSaveBtn');
            if (!titleInput || !content || !save) throw new Error('Notas indisponíveis.');
            titleInput.value = title;
            content.value = body;
            titleInput.dispatchEvent(new Event('input', { bubbles: true }));
            content.dispatchEvent(new Event('input', { bubbles: true }));
            save.click();
            return 'Nota "' + title + '" criada.';
        }
    },
    {
        name: 'meta', args: '<texto>', desc: 'Adiciona uma meta de estudo',
        run(a) {
            if (!a) throw new Error('Escreva a meta: meta revisar 20 questões.');
            switchTab('tab-goals');
            const input = $('#goalInput');
            const form = $('#goalForm');
            if (!input || !form) throw new Error('Metas indisponíveis.');
            input.value = a;
            form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            return 'Meta adicionada: ' + a;
        }
    },
    {
        name: 'senha', args: '[tamanho]', desc: 'Gera uma senha forte (padrão 20)',
        run(a) {
            const wanted = parseInt(a, 10);
            const len = Math.max(8, Math.min(64, isNaN(wanted) ? 20 : wanted));
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*-_=+?';
            let out = '';
            if (window.crypto && window.crypto.getRandomValues) {
                const buf = new Uint32Array(len);
                window.crypto.getRandomValues(buf);
                for (let i = 0; i < len; i++) out += chars[buf[i] % chars.length];
            } else {
                for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
            }
            copyText(out).then((ok) => { if (ok) toast('Senha copiada.', 'fa-copy'); });
            return 'Senha (' + len + ' caracteres, cópia automática):\n' + out;
        }
    },
    {
        name: 'calc', args: '<expressão>', desc: 'Calcula uma expressão',
        run(a) {
            const expr = String(a || '').replace(/[^0-9+\-*/().%\s]/g, '').trim();
            if (!expr) throw new Error('Use: calc (12+8)*3.');
            let result;
            try { result = Function('"use strict";return (' + expr + ')')(); } catch (e) { throw new Error('Expressão inválida.'); }
            if (typeof result !== 'number' || !isFinite(result)) throw new Error('Expressão inválida.');
            return expr + ' = ' + result;
        }
    },
    {
        name: 'resgatar', args: '<código>', desc: 'Resgata um código de recompensa',
        run(a) {
            if (!a) throw new Error('Diga o código: resgatar GEEKIE2026.');
            return redeemCode(a);
        }
    },
    {
        name: 'xp', args: '', desc: 'Mostra XP, moedas, sessões e metas',
        run() {
            return 'XP: ' + state.xp + ' · Moedas: ' + state.coins + ' · Sessões: ' + state.sessions + ' · Metas: ' + state.goals.length;
        }
    },
    {
        name: 'moedas', args: '', desc: 'Mostra seu saldo de moedas',
        run() { return 'Você tem ' + state.coins + ' moedas. Use na Loja para comprar temas e pets.'; }
    },
    {
        name: 'devlog', args: '[fix|feature|style]', desc: 'Abre o Dev Log, opcionalmente filtrado',
        run(a) {
            const map = { fix: 'fix', correcao: 'fix', 'correção': 'fix', bug: 'fix', feature: 'feature', recurso: 'feature', novo: 'feature', style: 'style', visual: 'style', design: 'style', all: 'all', tudo: 'all' };
            currentDevlogFilter = map[String(a || '').toLowerCase()] || 'all';
            switchTab('tab-devlog');
            renderDevlog(currentDevlogFilter);
            return 'Dev Log aberto' + (currentDevlogFilter === 'all' ? '.' : ' filtrado por ' + currentDevlogFilter + '.');
        }
    },
    {
        name: 'zen', args: '', desc: 'Alterna o modo Zen',
        run() { toggleZenMode(); return 'Modo Zen alternado.'; }
    },
    {
        name: 'split', args: '', desc: 'Alterna o modo Multi-Tarefa',
        run() { toggleSplitMode(); return 'Modo Multi-Tarefa alternado.'; }
    },
    {
        name: 'animacoes', args: 'on | off', desc: 'Liga ou reduz as animações',
        run(a) {
            const on = !/off|deslig|parar|false|0/i.test(String(a || ''));
            applyMotionPreference(!on);
            state.motionReduced = !on;
            saveState();
            return 'Animações ' + (on ? 'ativadas' : 'reduzidas') + '.';
        }
    },
    {
        name: 'data', args: '', desc: 'Mostra a data e a hora atuais',
        run() { return new Date().toLocaleString('pt-BR'); }
    },
    {
        name: 'exportar', args: '', desc: 'Baixa o progresso em JSON',
        run() {
            const data = JSON.stringify(state, null, 2);
            const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
            const link = document.createElement('a');
            link.href = url;
            link.download = 'geekie-progresso-' + dateKey() + '.json';
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
            return 'Progresso exportado (' + Math.round(data.length / 1024) + ' KB).';
        }
    },
    {
        name: 'sobre', args: '', desc: 'Versão, abas e armazenamento',
        run() {
            return ['Geekie Study Hub v19.5.1',
                'Abas: ' + TAB_META.length + ' · Comandos: ' + COMMANDS.length,
                'XP: ' + state.xp + ' · Moedas: ' + state.coins,
                'Tudo salvo localmente em "' + STORAGE_KEY + '".'].join('\n');
        }
    },
    {
        name: 'limpar', args: '', desc: 'Limpa o terminal',
        run() {
            cmdLog = [];
            renderCmdLog();
            return 'Terminal limpo. Digite "ajuda" para começar de novo.';
        }
    },
    {
        name: 'reset', args: '', desc: 'Apaga o progresso salvo (pede confirmação)',
        run() {
            if (!window.confirm('Apagar todo o progresso salvo neste navegador?')) return 'Reset cancelado.';
            try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
            window.location.reload();
            return 'Progresso apagado. Recarregando...';
        }
    }
];

function runCommand(raw) {
    const text = String(raw || '').trim();
    if (!text) return;
    cmdPrint('in', text);
    const space = text.indexOf(' ');
    const name = (space === -1 ? text : text.slice(0, space)).toLowerCase();
    const args = space === -1 ? '' : text.slice(space + 1).trim();
    const cmd = COMMANDS.find((c) => c.name === name);
    if (!cmd) {
        const close = COMMANDS.filter((c) => c.name.indexOf(name) === 0).map((c) => c.name);
        cmdPrint('err', 'Comando "' + name + '" não existe.' + (close.length ? ' Você quis dizer: ' + close.slice(0, 3).join(', ') + '?' : ' Digite "ajuda".'));
        return;
    }
    let out;
    try { out = cmd.run(args); } catch (err) { cmdPrint('err', err && err.message ? err.message : String(err)); return; }
    if (out) cmdPrint('ok', Array.isArray(out) ? out.join('\n') : out);
    state.commandHistory.push(text);
    if (state.commandHistory.length > 40) state.commandHistory = state.commandHistory.slice(-40);
    saveState();
    cmdHistoryIndex = state.commandHistory.length;
}

function bindCommands() {
    const form = $('#cmdForm');
    const input = $('#cmdInput');
    const count = $('#cmdCount');
    if (count) count.textContent = COMMANDS.length + ' comandos';
    if (!cmdLog.length) {
        cmdPrint('sys', 'Geekie Study Hub v19.5.1 — terminal pronto.');
        cmdPrint('info', 'Digite "ajuda" para ver os comandos, "ir notas" para navegar ou "resgatar GEEKIE2026" para testar as recompensas.');
    }
    renderCmdSuggestions('');
    cmdHistoryIndex = state.commandHistory.length;
    if (form) form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!input) return;
        runCommand(input.value);
        input.value = '';
        renderCmdSuggestions('');
    });
    if (input) {
        input.addEventListener('input', () => renderCmdSuggestions(input.value));
        input.addEventListener('keydown', (e) => {
            const history = state.commandHistory;
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (!history.length) return;
                cmdHistoryIndex = Math.max(0, cmdHistoryIndex - 1);
                input.value = history[cmdHistoryIndex] || '';
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                cmdHistoryIndex = Math.min(history.length, cmdHistoryIndex + 1);
                input.value = history[cmdHistoryIndex] || '';
            } else if (e.key === 'Tab') {
                const typed = input.value.trim().toLowerCase();
                const match = COMMANDS.find((c) => c.name.indexOf(typed) === 0);
                if (match) {
                    e.preventDefault();
                    input.value = match.name + ' ';
                    renderCmdSuggestions(match.name);
                }
            }
        });
    }
    const suggestions = $('#cmdSuggestions');
    if (suggestions) suggestions.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-cmd-suggest]');
        if (!btn || !input) return;
        input.value = btn.dataset.cmdSuggest + ' ';
        input.focus();
        renderCmdSuggestions(input.value);
    });
    const cmdBtn = $('#btnCommands');
    if (cmdBtn) cmdBtn.addEventListener('click', () => { switchTab('tab-commands'); focusCommandInput(); });
    const search = $('#fabSearch');
    if (search) search.addEventListener('input', filterFabItems);
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
            e.preventDefault();
            switchTab('tab-commands');
            focusCommandInput();
        }
    });
}

/* --- Códigos de recompensa --- */
const REWARDS = [
    { code: 'BEMVINDO', label: 'Boas-vindas', coins: 15, xp: 20, hint: 'Para quem acabou de criar a conta', expires: '2026-12-31' },
    { code: 'GEEKIE2026', label: 'Campanha Geekie 2026', coins: 50, xp: 100, hint: 'Código oficial da temporada 2026', expires: '2026-12-31' },
    { code: 'FOCOPRO', label: 'Pacote Foco Pro', coins: 40, xp: 60, theme: 'neon', hint: 'Libera o tema Neon', expires: '2027-01-31' },
    { code: 'ENEM2026', label: 'Reta ENEM', coins: 30, xp: 150, hint: 'Para quem está na reta final', expires: '2026-11-30' },
    { code: 'DEVLOG5', label: 'Leitor do Dev Log', coins: 25, xp: 25, hint: 'Quem lê as notas de versão ganha', expires: '2027-06-30' },
    { code: 'HUBV195', label: 'Lançamento v19.5.0', coins: 100, xp: 50, theme: 'matrix', hint: 'Resgate de lançamento da versão 19.5.0', expires: '2026-12-31' }
];

function isRewardRedeemed(code) {
    return state.redeemed.some((r) => r.code === code);
}

function rewardParts(item) {
    const parts = [];
    if (item.coins) parts.push('+' + item.coins + ' moedas');
    if (item.xp) parts.push('+' + item.xp + ' XP');
    if (item.theme) {
        const name = themeNameById(item.theme);
        if (name) parts.push('tema ' + name);
    }
    return parts;
}

function redeemCode(raw) {
    const code = String(raw || '').trim().toUpperCase().replace(/\s+/g, '');
    if (!code) throw new Error('Digite um código para resgatar.');
    const item = REWARDS.find((r) => r.code === code);
    if (!item) throw new Error('Código "' + code + '" não existe. Confira as campanhas listadas.');
    if (isRewardRedeemed(code)) throw new Error('O código ' + code + ' já foi resgatado nesta conta.');
    if (item.expires && dateKey() > item.expires) {
        throw new Error('O código ' + code + ' expirou em ' + item.expires.split('-').reverse().join('/') + '.');
    }
    const gained = [];
    if (item.coins) { addCoins(item.coins); gained.push('+' + item.coins + ' moedas'); }
    if (item.xp) { addXp(item.xp); gained.push('+' + item.xp + ' XP'); }
    if (item.theme && themeNameById(item.theme) && state.themesOwned.indexOf(item.theme) === -1) {
        state.themesOwned.push(item.theme);
        gained.push('tema ' + themeNameById(item.theme));
    }
    state.redeemed.push({ code: code, at: Date.now() });
    saveState();
    renderRewards();
    renderProfile();
    renderStore();
    renderTitles();
    toast('Código ' + code + ' resgatado!', 'fa-gift');
    return 'Código ' + code + ' resgatado: ' + gained.join(', ') + '.';
}

function renderRewards() {
    const grid = $('#rewardGrid');
    const history = $('#rewardHistory');
    const coins = $('#rewardCoinCount');
    if (coins) coins.textContent = state.coins;
    if (grid) {
        grid.innerHTML = REWARDS.map((r) => {
            const done = isRewardRedeemed(r.code);
            const items = rewardParts(r).map((p) => '<span>' + escapeHtml(p) + '</span>').join('');
            const expires = r.expires.split('-').reverse().join('/');
            return '<div class="reward-card' + (done ? ' claimed' : '') + '" title="' + escapeHtml(r.hint) + '">' +
                '<div class="reward-code">' + escapeHtml(r.code) + '</div>' +
                '<div class="reward-label">' + escapeHtml(r.label) + '</div>' +
                '<div class="reward-items">' + items + '</div>' +
                '<div class="reward-state">' + (done ? 'resgatado' : 'disponível até ' + expires) + '</div>' +
                '<button class="btn btn-outline" type="button" data-fx="trace" data-redeem="' + escapeHtml(r.code) + '"' + (done ? ' disabled' : '') + '>' +
                (done ? '<i class="fa-solid fa-check"></i> Resgatado' : '<i class="fa-solid fa-gift"></i> Resgatar') + '</button>' +
                '</div>';
        }).join('');
    }
    if (history) {
        if (!state.redeemed.length) {
            history.innerHTML = '<div class="empty-state">Nenhum código resgatado ainda. Comece por BEMVINDO.</div>';
        } else {
            history.innerHTML = state.redeemed.slice().reverse().map((entry) => {
                const item = REWARDS.find((r) => r.code === entry.code);
                const when = new Date(entry.at).toLocaleString('pt-BR');
                return '<div class="reward-row"><span><strong>' + escapeHtml(entry.code) + '</strong> · ' +
                    escapeHtml(item ? item.label : 'campanha') + '</span><span>' + when + '</span></div>';
            }).join('');
        }
    }
}

function bindRewards() {
    const form = $('#rewardForm');
    const input = $('#rewardInput');
    const feedback = $('#rewardFeedback');
    const show = (message, ok) => {
        if (!feedback) return;
        feedback.textContent = message;
        feedback.className = 'reward-feedback ' + (ok ? 'ok' : 'err');
    };
    if (form) form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!input) return;
        try {
            show(redeemCode(input.value), true);
            input.value = '';
        } catch (err) {
            show(err && err.message ? err.message : 'Não foi possível resgatar.', false);
        }
    });
    if (input) input.addEventListener('input', () => { input.value = input.value.toUpperCase(); });
    const paste = $('#rewardPasteBtn');
    if (paste) paste.addEventListener('click', () => {
        if (!navigator.clipboard || !navigator.clipboard.readText) {
            show('Seu navegador não libera a área de transferência. Use Ctrl+V.', false);
            return;
        }
        navigator.clipboard.readText().then((text) => {
            if (input) {
                input.value = String(text || '').trim().toUpperCase();
                input.focus();
            }
        }).catch(() => show('Permissão para colar negada. Use Ctrl+V.', false));
    });
    const grid = $('#rewardGrid');
    if (grid) grid.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-redeem]');
        if (!btn || btn.disabled) return;
        try { show(redeemCode(btn.dataset.redeem), true); }
        catch (err) { show(err && err.message ? err.message : 'Falha ao resgatar.', false); }
    });
}

/* ============ 30. DEV LOG ============ */
const DEVLOG = [
    {
        version: 'v19.5.1', date: '2026-11-09', type: 'fix', title: 'XP, níveis e moedas corrigidos',
        items: [
            'Subir de nível agora atualiza o título automaticamente e refresca as abas Títulos e Trilha na hora.',
            'Comprar tema ou adotar pet atualiza o saldo da topbar imediatamente — antes só mudava após recarregar.',
            'XP e moedas pulsam na topbar quando o valor muda, deixando o ganho e o gasto visíveis.',
            'Foco, quiz, metas, diário e clicker continuam creditando normalmente; nada mudou nas regras de ganho.'
        ]
    },
    {
        version: 'v19.5.0', date: '2026-11-09', type: 'feature', title: 'Nova aba de Comandos (Ctrl+K)',
        items: [
            'Terminal dentro do hub com 24 comandos: navegar, iniciar foco, criar nota e meta, calcular e resgatar códigos.',
            'Autocomplete com sugestões clicáveis, Tab para completar e setas ↑/↓ para o histórico.',
            'Atalho global Ctrl+K (Cmd+K no Mac) abre a aba com o cursor no campo; botão de terminal também entrou na topbar.',
            'O histórico do terminal fica na memória da aba e nada é enviado para servidores.'
        ]
    },
    {
        version: 'v19.5.0', date: '2026-11-09', type: 'feature', title: 'Aba de Códigos de Recompensa',
        items: [
            'Seis campanhas ativas: BEMVINDO, GEEKIE2026, FOCOPRO, ENEM2026, DEVLOG5 e HUBV195.',
            'Prêmios em moedas, XP e temas; cada código vale uma vez por conta e tem data de expiração validada.',
            'Histórico de resgates com data, saldo atualizado e botão para colar da área de transferência.',
            'Resgate também pelo comando "resgatar <código>" no terminal.'
        ]
    },
    {
        version: 'v19.5.0', date: '2026-11-09', type: 'style', title: 'Interface reformulada',
        items: [
            'Fundo com aurora animada e grade sutil, topbar de vidro com fio em gradiente e logo pulsante.',
            'Cards com profundidade, borda viva no hover, kicker nos títulos e divisórias em gradiente.',
            'Anel de foco visível em botões e campos, micro-animação na troca de aba e barras de rolagem discretas.',
            'Busca de abas no menu FAB, estado ativo em gradiente e selo NOVO nas abas recém-chegadas.'
        ]
    },
    {
        version: 'v19.5.0', date: '2026-11-09', type: 'fix', title: 'Aba de Códigos removida',
        items: [
            'Os snippets genéricos saíram: o espaço agora é das abas de Comandos e de Códigos de Recompensa.',
            'Nenhum dado foi apagado — progresso, notas, temas e XP continuam no mesmo localStorage.',
            'Pedidos antigos para a aba de Códigos são redirecionados para Comandos, sem erro no console.'
        ]
    },
    {
        version: 'v19.4.0', date: '2026-11-09', type: 'fix', title: 'Correção dos erros de carregamento',
        items: [
            'Os três arquivos agora usam nomes canônicos na mesma pasta: index.html, style.css e script.js.',
            'Iframes do Portal Geekie e do Google carregados sob demanda, com timeout e overlay de erro em vez de tela branca.',
            'Login, sessão e progresso protegidos quando o localStorage está bloqueado.',
            'Botão de login e atalhos com verificação de elemento antes de qualquer acesso ao DOM.'
        ]
    },
    {
        version: 'v19.4.0', date: '2026-11-09', type: 'feature', title: 'Animações por tipo de botão, Dev Log e README',
        items: [
            'Sistema de animação com 19 efeitos distintos: cada tipo de botão tem o seu (shine, trace, shake, orbit, sonar, slide, lift, squish, glint, squeeze, flip, nudge, fade, pop, coin, pulse, hue...).',
            'Nova aba Dev Log com filtros por tipo e as 5 últimas atualizações.',
            'README.md criado com as 5 últimas atualizações e instruções de execução.'
        ]
    },
    {
        version: 'v19.4.0', date: '2026-11-09', type: 'style', title: 'Ajustes visuais e responsividade',
        items: [
            'Topbar reorganizada e responsiva (XP, moedas, relógio e modos).',
            'FAB com estado acessível (aria-expanded) e animação própria.',
            'Novos estilos para chat, flashcards, planner, quiz, calculadora e caracteres.'
        ]
    },
    { version: 'v19.3.0', date: '2026-10-21', type: 'style', title: 'Animações previsíveis por função', items: ['Cada grupo de botões recebeu um efeito consistente.', 'Cabeçalho adaptado para telas pequenas.'] },
    { version: 'v19.2.0', date: '2026-10-05', type: 'feature', title: 'Controle global de movimento', items: ['Botão para reduzir animações no topbar.', 'Dev Log acessível direto pelo menu FAB.'] },
    { version: 'v19.1.0', date: '2026-09-18', type: 'feature', title: 'Biblioteca Unicode expandida', items: ['Busca de caracteres por código (ex.: 03B1).', 'Favoritos fixados no topo da grade.'] },
    { version: 'v19.0.0', date: '2026-09-02', type: 'feature', title: 'Feature Pack: 26 ferramentas', items: ['Uma novidade por aba, totalizando 26 ferramentas.', 'Primeira versão do sistema de ripple nos botões.'] },
    { version: 'v18.3.0', date: '2026-08-14', type: 'style', title: 'Iframes ampliados', items: ['Painéis recolhíveis e iframes em tela grande.', 'Primeiras animações de botões em todo o hub.'] }
];

let currentDevlogFilter = 'all';

function renderDevlog(filter) {
    const box = $('#devlogList');
    if (!box) return;
    const typeLabel = { fix: 'Correção', feature: 'Novidade', style: 'Interface' };
    const list = DEVLOG.filter((e) => !filter || filter === 'all' || e.type === filter);
    box.innerHTML = list.map((e) => '<article class="devlog-item" data-type="' + e.type + '">' +
        '<div class="devlog-head"><span class="devlog-version">' + e.version + '</span><span class="devlog-tag">' + typeLabel[e.type] + '</span><span class="devlog-date">' + e.date + '</span></div>' +
        '<div class="devlog-title">' + escapeHtml(e.title) + '</div>' +
        '<ul>' + e.items.map((i) => '<li>' + escapeHtml(i) + '</li>').join('') + '</ul>' +
        '</article>').join('');
    if (!list.length) box.innerHTML = '<div class="empty-state">Nada por aqui com esse filtro.</div>';
}

function renderDevlogMonths() { renderDevlog(currentDevlogFilter); }

function bindDevlog() {
    renderDevlog(currentDevlogFilter);
    $$('#devlogFilters .filter-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
            currentDevlogFilter = chip.dataset.filter;
            $$('#devlogFilters .filter-chip').forEach((c) => c.classList.toggle('active', c === chip));
            renderDevlog(currentDevlogFilter);
        });
    });
}

/* ============ 31. DIÁRIO ============ */
const MOODS = ['😀', '🙂', '😐', '😕', '😫'];
let currentMood = '🙂';

function renderDiary() {
    const dateInput = $('#diaryDate');
    if (dateInput && !dateInput.value) dateInput.value = dateKey();
    const moods = $('#diaryMoods');
    if (moods) {
        moods.innerHTML = MOODS.map((m) => '<button class="filter-chip' + (m === currentMood ? ' active' : '') + '" type="button" data-fx="squish" data-mood="' + m + '">' + m + '</button>').join('');
    }
    const list = $('#diaryList');
    if (!list) return;
    const entries = Object.entries(state.diary).sort((a, b) => (a[0] < b[0] ? 1 : -1));
    if (!entries.length) { list.innerHTML = '<div class="empty-state">Nenhuma entrada ainda.</div>'; return; }
    list.innerHTML = entries.map((e) => '<div class="diary-entry"><div class="diary-entry-head"><strong>' + e[0] + '</strong><span>' + (e[1].mood || '') + '</span></div><div>' + escapeHtml(e[1].text || '') + '</div></div>').join('');
}

function bindDiary() {
    renderDiary();
    const moods = $('#diaryMoods');
    if (moods) moods.addEventListener('click', (e) => {
        const chip = e.target.closest('[data-mood]');
        if (!chip) return;
        currentMood = chip.dataset.mood;
        renderDiary();
    });
    const save = $('#diarySaveBtn');
    if (save) save.addEventListener('click', () => {
        const key = ($('#diaryDate') || {}).value || dateKey();
        const text = ($('#diaryText') || {}).value || '';
        if (!text.trim()) { toast('Escreva algo no diário.', 'fa-triangle-exclamation'); return; }
        state.diary[key] = { mood: currentMood, text: text.trim() };
        saveState();
        renderDiary();
        addXp(3);
        toast('Entrada salva.', 'fa-book-heart');
    });
    const exportBtn = $('#diaryExportBtn');
    if (exportBtn) exportBtn.addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(state.diary, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'geekie-diario.json';
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        toast('Diário exportado.', 'fa-download');
    });
    const dateInput = $('#diaryDate');
    if (dateInput) dateInput.addEventListener('change', () => {
        const entry = state.diary[dateInput.value];
        const text = $('#diaryText');
        if (text) text.value = entry ? entry.text : '';
        if (entry && entry.mood) { currentMood = entry.mood; renderDiary(); }
    });
}

/* ============ 32. GERADOR DE SENHAS ============ */
function passwordStrength(value) {
    let score = 0;
    if (value.length >= 12) score += 1;
    if (value.length >= 20) score += 1;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
    if (/[0-9]/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;
    return score;
}

function generatePassword() {
    const length = Number(($('#passwordLength') || {}).value || 18);
    const upper = !!(($('#passwordUpper') || {}).checked);
    const numbers = !!(($('#passwordNumbers') || {}).checked);
    const symbols = !!(($('#passwordSymbols') || {}).checked);
    let alphabet = 'abcdefghijkmnopqrstuvwxyz';
    if (upper) alphabet += 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    if (numbers) alphabet += '23456789';
    if (symbols) alphabet += '!@#$%&*()-_=+[]{}';
    const values = new Uint32Array(length);
    if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(values);
    else for (let i = 0; i < length; i++) values[i] = Math.floor(Math.random() * 4294967296);
    let password = '';
    for (let i = 0; i < length; i++) password += alphabet[values[i] % alphabet.length];
    const output = $('#passwordOutput');
    if (output) output.value = password;
    const score = passwordStrength(password);
    const fill = $('#strengthFill');
    const label = $('#strengthLabel');
    const pct = (score / 5) * 100;
    if (fill) {
        fill.style.width = pct + '%';
        fill.style.background = score <= 2 ? 'var(--danger)' : (score === 3 ? 'var(--warning)' : 'var(--success)');
    }
    if (label) label.textContent = score <= 2 ? 'Senha fraca' : (score === 3 ? 'Senha razoável' : (score === 4 ? 'Senha forte' : 'Senha muito forte'));
}

function bindPassword() {
    const length = $('#passwordLength');
    const lengthValue = $('#passwordLengthValue');
    if (length) length.addEventListener('input', () => { if (lengthValue) lengthValue.textContent = length.value; });
    const generate = $('#passwordGenerate');
    if (generate) generate.addEventListener('click', generatePassword);
    const copy = $('#passwordCopy');
    if (copy) copy.addEventListener('click', () => {
        const value = (($('#passwordOutput') || {}).value) || '';
        if (!value || value === 'Clique em gerar') { toast('Gere uma senha primeiro.', 'fa-triangle-exclamation'); return; }
        copyText(value).then((ok) => toast(ok ? 'Senha copiada.' : 'Não foi possível copiar.', ok ? 'fa-copy' : 'fa-triangle-exclamation'));
    });
    if (lengthValue) lengthValue.textContent = (length && length.value) || '18';
}

/* ============ 33. MODOS, ATALHOS E INICIALIZAÇÃO ============ */
function toggleZenMode() {
    document.body.classList.toggle('zen-mode');
    const on = document.body.classList.contains('zen-mode');
    toast(on ? 'Modo Zen ativado (Esc para sair).' : 'Modo Zen desativado.', 'fa-expand');
}

let splitOn = false;
let splitAnchor = null;

function toggleSplitMode() {
    const tab = $('#tab-geekie');
    const container = $('#geekieIframeContainer');
    if (!tab || !container) return;
    if (!splitOn) {
        splitAnchor = document.createComment('split-anchor');
        container.parentNode.insertBefore(splitAnchor, container);
        const layout = document.createElement('div');
        layout.className = 'split-layout';
        layout.id = 'splitLayout';
        tab.insertBefore(layout, container);
        layout.appendChild(container);
        const googleWrap = document.createElement('div');
        googleWrap.className = 'iframe-container theme-default';
        googleWrap.innerHTML = '<iframe src="https://www.google.com/webhp?igu=1&safe=active&ssui=on" title="Google" allowfullscreen sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"></iframe>';
        layout.appendChild(googleWrap);
        splitOn = true;
        toast('Multi-tarefa ativado.', 'fa-table-columns');
    } else {
        const layout = $('#splitLayout');
        if (layout && splitAnchor && splitAnchor.parentNode) {
            splitAnchor.parentNode.insertBefore(container, splitAnchor.nextSibling);
            layout.remove();
            splitAnchor.remove();
        }
        splitOn = false;
        toast('Multi-tarefa desativado.', 'fa-table-columns');
    }
}

function applyMotionPreference(reduced) {
    state.motionReduced = !!reduced;
    document.documentElement.classList.toggle('reduce-motion', state.motionReduced);
    const btn = $('#btnMotionMode');
    if (btn) btn.setAttribute('aria-pressed', state.motionReduced ? 'true' : 'false');
    saveState();
}

function bindModes() {
    $('#btnZenMode').addEventListener('click', toggleZenMode);
    $('#btnSplitMode').addEventListener('click', toggleSplitMode);
    const motion = $('#btnMotionMode');
    if (motion) motion.addEventListener('click', () => {
        applyMotionPreference(!state.motionReduced);
        toast(state.motionReduced ? 'Animações reduzidas.' : 'Animações completas.', 'fa-wand-magic-sparkles');
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeFabMenu();
            if (!$('#tutorialOverlay').classList.contains('hidden')) closeTutorial();
            if (document.body.classList.contains('zen-mode')) document.body.classList.remove('zen-mode');
        }
        if (e.altKey && (e.key === 'm' || e.key === 'M')) { e.preventDefault(); toggleSplitMode(); }
        if (e.altKey && (e.key === 'z' || e.key === 'Z')) { e.preventDefault(); toggleZenMode(); }
    });
    document.addEventListener('click', (e) => {
        const wrapper = $('#fabWrapper');
        if (wrapper && !wrapper.contains(e.target)) closeFabMenu();
    });
}

function boot() {
    try {
        setLoginMode(false);
        applyTheme(state.theme);
        applyMotionPreference(state.motionReduced);
        applyPageTitle();

        bindAuth();
        bindNavigation();
        bindButtonFx();
        bindModes();
        bindPortals();
        bindChat();
        bindNotes();
        bindStore();
        bindTitles();
        bindPets();
        bindPomodoro();
        bindGoals();
        bindFlashcards();
        bindPlanner();
        bindSubjects();
        bindQuiz();
        bindClicker();
        bindAmbient();
        bindKeySounds();
        bindCalculator();
        bindChars();
        bindTitleEditor();
        bindEvents();
        bindCommands();
        bindRewards();
        bindDevlog();
        bindDiary();
        bindPassword();
        bindTutorial();

        renderProfile();
        renderStore();
        renderPets();
        renderTitles();
        renderJourney();
        renderStats();
        renderEventMonths();
        renderChars();
        renderRewards();
        renderSubjectTotals();
        renderClickerShop();
        renderDiary();
        renderPlanner();
        tickClock();
        setInterval(tickClock, 1000);

        if (state.session) {
            openSession();
        } else {
            const overlay = $('#loginOverlay');
            if (overlay) overlay.classList.remove('hidden');
            const nameInput = $('#loginName');
            if (nameInput) setTimeout(() => nameInput.focus(), 300);
        }
        console.info('Geekie Study Hub v19.5.1 pronto — 27 abas, comandos (Ctrl+K), códigos de recompensa e animações por tipo de botão.');
    } catch (error) {
        console.error('Falha ao iniciar o Geekie Study Hub:', error);
        const box = document.getElementById('loginError');
        if (box) {
            box.textContent = 'Erro ao iniciar o hub: ' + (error && error.message ? error.message : error);
            box.classList.add('show');
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
} else {
    boot();
}
