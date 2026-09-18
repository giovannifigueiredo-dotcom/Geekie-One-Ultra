/* ============================================================
 * Geekie Study Hub — script.js (v18.1.0)
 * Todo o comportamento do hub, extraído do HTML original
 * e ampliado com o Feature Lab v18 (26 ferramentas).
 * v18.0.1: Cockpit do portal recolhível — iframe em tela grande.
 * v18.1.0: Modo Multi-Tarefa — split view com painel recolhível.
 * ============================================================ */


// ===================== DATA DECLARATIONS =====================
let todos = JSON.parse(localStorage.getItem('geekieTodos')) || [];
let todoFilter = 'all';
let savedTitle = localStorage.getItem('geekieTitleName') || 'Geekie One Ultra v15.7.0';
let selectedFont = localStorage.getItem('geekieTitleFont') || 'Poppins';
let selectedIcon = localStorage.getItem('geekieTitleIcon') || 'fa-graduation-cap';
const availableFonts = [
    {family:'Poppins',label:'Poppins',sample:'Geekie Ultra'},
    {family:'Ubuntu',label:'Ubuntu',sample:'Geekie Ultra'},
    {family:'Orbitron',label:'Orbitron',sample:'Geekie Ultra'},
    {family:'Space Grotesk',label:'Space Grotesk',sample:'Geekie Ultra'},
    {family:'Fira Code',label:'Fira Code',sample:'Geekie Ultra'},
    {family:'Rajdhani',label:'Rajdhani',sample:'Geekie Ultra'},
    {family:'JetBrains Mono',label:'JetBrains Mono',sample:'Geekie Ultra'}
];
const availableIcons = ['fa-graduation-cap','fa-book-open','fa-brain','fa-fire','fa-star','fa-bolt','fa-rocket','fa-laptop-code','fa-atom','fa-dna','fa-flask','fa-calculator','fa-infinity','fa-pencil','fa-trophy','fa-crown','fa-heart','fa-globe','fa-satellite','fa-moon'];
const monthlyEvents = [
    { month: 1, name: 'Janeiro: Inicio de Jornada', icon: '🚀', desc: 'Novo ano, nova energia!', colorA: '#E95420', colorB: '#F97316', tiers: [{label:'Iniciante',xpReq:0,reward:'Badge Especial',icon:'🌱'},{label:'Estudioso',xpReq:500,reward:'Badge Especial',icon:'📚'},{label:'Expert',xpReq:1500,reward:'Tema Yaru desbloqueado',icon:'⭐'},{label:'Lendario',xpReq:3000,reward:'Tema Cosmic desbloqueado',icon:'🏆'}]},
    { month: 2, name: 'Fevereiro: Amor ao Saber', icon: '❤️', desc: 'Apaixone-se por aprender!', colorA: '#EC4899', colorB: '#F43F5E', tiers: [{label:'Iniciante',xpReq:0,reward:'Badge Especial',icon:'💛'},{label:'Estudioso',xpReq:500,reward:'Badge Especial',icon:'💖'},{label:'Expert',xpReq:1500,reward:'Tema Sunset desbloqueado',icon:'🌸'},{label:'Lendario',xpReq:3000,reward:'XP Duplo por 7 dias',icon:'👑'}]},
    { month: 3, name: 'Marco: Forca Total', icon: '💪', desc: 'Sprint de estudos!', colorA: '#16A34A', colorB: '#4ADE80', tiers: [{label:'Iniciante',xpReq:0,reward:'Badge Especial',icon:'🌿'},{label:'Estudioso',xpReq:500,reward:'Badge Especial',icon:'🌱'},{label:'Expert',xpReq:1500,reward:'Tema Forest desbloqueado',icon:'🌲'},{label:'Lendario',xpReq:3000,reward:'Tema Radiance desbloqueado',icon:'🏆'}]},
    { month: 4, name: 'Abril: Despertar Digital', icon: '🌐', desc: 'Tecnologia e estudo juntos!', colorA: '#1BA1E2', colorB: '#44CCFF', tiers: [{label:'Iniciante',xpReq:0,reward:'Badge Especial',icon:'📡'},{label:'Estudioso',xpReq:500,reward:'Badge Especial',icon:'💻'},{label:'Expert',xpReq:1500,reward:'Tema Snap desbloqueado',icon:'⚡'},{label:'Lendario',xpReq:3000,reward:'Tema Frost desbloqueado',icon:'🏆'}]},
    { month: 5, name: 'Maio: Maratona do Foco', icon: '⏱️', desc: 'Foco maximo!', colorA: '#8B5CF6', colorB: '#A78BFA', tiers: [{label:'Iniciante',xpReq:0,reward:'Badge Especial',icon:'🧠'},{label:'Estudioso',xpReq:500,reward:'Badge Especial',icon:'⏰'},{label:'Expert',xpReq:1500,reward:'Tema Ambiance desbloqueado',icon:'🌙'},{label:'Lendario',xpReq:3000,reward:'Tema Cosmic desbloqueado',icon:'🏆'}]},
    { month: 6, name: 'Junho: Meio do Ano', icon: '🌟', desc: 'Metade da jornada!', colorA: '#FBBF24', colorB: '#F59E0B', tiers: [{label:'Iniciante',xpReq:0,reward:'Badge Especial',icon:'🌻'},{label:'Estudioso',xpReq:500,reward:'Badge Especial',icon:'🌟'},{label:'Expert',xpReq:1500,reward:'Tema Fire desbloqueado',icon:'🔥'},{label:'Lendario',xpReq:3000,reward:'Todos os temas liberados',icon:'🏆'}]},
    { month: 7, name: 'Julho: Inverno Produtivo', icon: '❄️', desc: 'Aquece com conhecimento!', colorA: '#0EA5E9', colorB: '#38BDF8', tiers: [{label:'Iniciante',xpReq:0,reward:'Badge Especial',icon:'🧊'},{label:'Estudioso',xpReq:500,reward:'Badge Especial',icon:'☃️'},{label:'Expert',xpReq:1500,reward:'Tema Frost desbloqueado',icon:'💎'},{label:'Lendario',xpReq:3000,reward:'Badge Especial',icon:'🏆'}]},
    { month: 8, name: 'Agosto: Aceleracao Final', icon: '🔥', desc: 'Sprint para o ENEM!', colorA: '#EF4444', colorB: '#F97316', tiers: [{label:'Iniciante',xpReq:0,reward:'Badge Especial',icon:'⚔️'},{label:'Estudioso',xpReq:500,reward:'Badge Especial',icon:'🔥'},{label:'Expert',xpReq:1500,reward:'Tema Fire desbloqueado',icon:'💥'},{label:'Lendario',xpReq:3000,reward:'Modo Turbo (XP x2)',icon:'🏆'}]},
    { month: 9, name: 'Setembro: Mes da Ciencia', icon: '🔬', desc: 'Explore ciencias!', colorA: '#059669', colorB: '#10B981', tiers: [{label:'Iniciante',xpReq:0,reward:'Badge Especial',icon:'⚗️'},{label:'Estudioso',xpReq:500,reward:'Badge Especial',icon:'🔭'},{label:'Expert',xpReq:1500,reward:'Tema Forest desbloqueado',icon:'🌿'},{label:'Lendario',xpReq:3000,reward:'Tema Radiance desbloqueado',icon:'🏆'}]},
    { month: 10, name: 'Outubro: Vespera do ENEM', icon: '🎯', desc: 'Revisao total!', colorA: '#D97706', colorB: '#FBBF24', tiers: [{label:'Iniciante',xpReq:0,reward:'Badge Especial',icon:'🎯'},{label:'Estudioso',xpReq:500,reward:'Badge Especial',icon:'📝'},{label:'Expert',xpReq:1500,reward:'Tema Sunset desbloqueado',icon:'🌅'},{label:'Lendario',xpReq:3000,reward:'Badge Especial',icon:'🏆'}]},
    { month: 11, name: 'Novembro: Hora da Verdade', icon: '⚡', desc: 'ENEM chegou!', colorA: '#7C3AED', colorB: '#A78BFA', tiers: [{label:'Iniciante',xpReq:0,reward:'Badge Especial',icon:'🦁'},{label:'Estudioso',xpReq:500,reward:'Badge Especial',icon:'✨'},{label:'Expert',xpReq:1500,reward:'Tema Ambiance desbloqueado',icon:'🌙'},{label:'Lendario',xpReq:3000,reward:'Tema Cosmic desbloqueado',icon:'🏆'}]},
    { month: 12, name: 'Dezembro: Celebracao!', icon: '🎉', desc: 'Celebre cada minuto de estudo!', colorA: '#DC2626', colorB: '#16A34A', tiers: [{label:'Iniciante',xpReq:0,reward:'Badge Especial',icon:'🎁'},{label:'Estudioso',xpReq:500,reward:'Badge Especial',icon:'🎄'},{label:'Expert',xpReq:1500,reward:'Pack completo de temas',icon:'🎊'},{label:'Lendario',xpReq:3000,reward:'XP x3 em Janeiro',icon:'🏆'}]},
];

// ===================== CLOCK =====================
function updateClock() { document.getElementById('realTimeClock').textContent = new Date().toLocaleTimeString('pt-BR'); }
setInterval(updateClock, 1000); updateClock();

// ===================== SIDEBAR & TABS =====================
const sidebar = { classList: { add: ()=>{}, remove: ()=>{}, toggle: ()=>{} } }; // sidebar removida - FAB v12

// Lazy load do iframe do Geekie
(function loadGeekieIframe() {
    const iframe = document.getElementById('geekieIframe');
    const loading = document.getElementById('iframeLoading');
    if (!iframe || iframe.src) return; // já carregado
    iframe.src = iframe.dataset.src;
    iframe.style.display = 'block';
    iframe.onload = () => { if (loading) loading.style.display = 'none'; };
    // Fallback: esconde loading após 8s
    setTimeout(() => { if (loading) loading.style.display = 'none'; }, 8000);
})();

function switchTab(tabId, element) {
    // Remover active de todos os nav-items
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    if (element) element.classList.add('active');
    
    // Remover active de todas as tabs e adicionar na selecionada
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    const tab = document.getElementById(tabId);
    if (tab) tab.classList.add('active');
    
    // Fechar menu FAB se estiver aberto
    if (typeof closeFabMenu === 'function') closeFabMenu();
    
    // Atualizar FAB nav se existir
    const fabId = 'fab-nav-' + tabId.replace('tab-', '');
    document.querySelectorAll('.fab-nav-item').forEach(el => el.classList.remove('active'));
    const fabEl = document.getElementById(fabId);
    if (fabEl) fabEl.classList.add('active');
    
    // Inicializações específicas por tab (com tratamento de erro)
    try {
        switch(tabId) {
            case 'tab-titles': if (typeof renderTitles === 'function') renderTitles(); break;
            case 'tab-store': if (typeof renderStore === 'function') renderStore(); break;
            case 'tab-title': if (typeof buildTitleUI === 'function') buildTitleUI(); break;
            case 'tab-chat': if (typeof initChatPage === 'function') initChatPage(); break;
            case 'tab-events': if (typeof renderEventContent === 'function') renderEventContent(); break;
            case 'tab-pets': if (typeof renderPetGrid === 'function') renderPetGrid(); break;
            case 'tab-flashcards': if (typeof updateFlashcardStats === 'function') updateFlashcardStats(); break;
            case 'tab-keysounds': if (typeof renderKeySoundsTab === 'function') renderKeySoundsTab(); break;
            case 'tab-codes': if (typeof renderCodesGrid === 'function') renderCodesGrid(); break;
            case 'tab-chars': 
                // Garantir que o sistema de caracteres foi inicializado
                if (typeof initEnhancedCharsSystem === 'function' && !window.charsSystemInitialized) {
                    initEnhancedCharsSystem();
                    window.charsSystemInitialized = true;
                }
                break;
            case 'tab-planner': setTimeout(() => { if (typeof renderPlanner === 'function') renderPlanner(); }, 50); break;
            case 'tab-stats': setTimeout(() => { if (typeof renderStudyStats === 'function') renderStudyStats(); }, 50); break;
            case 'tab-subjects': setTimeout(() => { if (typeof renderSubjectGrid === 'function') renderSubjectGrid(); }, 50); break;
            case 'tab-quiz': setTimeout(() => { if (typeof renderQuizSetup === 'function') renderQuizSetup(); }, 50); break;
            case 'tab-journey': setTimeout(() => { if (typeof renderJourney === 'function') renderJourney(); }, 50); break;
        }
    } catch(e) {
        console.warn('Erro ao inicializar tab:', tabId, e);
    }
}

// ===================== WEBLLM LOCAL AI CHAT =====================
const CHAT_STORAGE_KEY = 'geekie_chat_messages';
const WEBLLM_MODEL_PREFERENCES = [
    'Qwen2.5-0.5B-Instruct-q4f16_1-MLC',
    'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
    'Llama-3.2-1B-Instruct-q4f16_1-MLC',
    'Llama-3.1-8B-Instruct'
];
let webLLMModulePromise = null;
let webLLMEngine = null;
let webLLMModelId = '';

function getChatHistory() {
    try {
        const saved = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) || '[]');
        return Array.isArray(saved) ? saved.slice(-50) : [];
    } catch (e) {
        return [];
    }
}

function saveChatHistory(history) {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(history.slice(-50)));
}

function setChatStatus(message, isError) {
    const status = document.getElementById('chatStatus');
    if (!status) return;
    status.textContent = message || '';
    status.classList.toggle('error', !!isError);
}

function appendChatMessage(role, content) {
    const messages = document.getElementById('chatMessages');
    const emptyState = document.getElementById('chatEmptyState');
    if (!messages || !content) return;
    if (emptyState) emptyState.remove();

    const item = document.createElement('div');
    item.className = 'chat-message ' + (role === 'user' ? 'user' : 'assistant');

    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar';
    avatar.innerHTML = role === 'user'
        ? '<i class="fa-solid fa-user"></i>'
        : '<i class="fa-solid fa-sparkles"></i>';

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.textContent = content;

    item.appendChild(avatar);
    item.appendChild(bubble);
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
}

function renderChatHistory() {
    const messages = document.getElementById('chatMessages');
    if (!messages) return;
    messages.innerHTML = '';
    const history = getChatHistory();
    if (!history.length) {
        messages.innerHTML = '<div class="chat-empty" id="chatEmptyState"><i class="fa-solid fa-wand-magic-sparkles" style="font-size:2rem;color:var(--primary);display:block;margin-bottom:10px;"></i>Escreva uma pergunta para começar sua conversa.</div>';
        return;
    }
    history.forEach(function(message) {
        appendChatMessage(message.role, message.content);
    });
}

function getWebLLMResponseText(response) {
    if (typeof response === 'string') return response;
    const message = response && response.choices && response.choices[0] && response.choices[0].message;
    if (message && typeof message.content === 'string') return message.content;
    if (message && Array.isArray(message.content)) {
        return message.content.map(function(part) {
            return typeof part === 'string' ? part : (part && part.text) || '';
        }).join('');
    }
    if (response && typeof response.content === 'string') return response.content;
    try {
        return JSON.stringify(response);
    } catch (e) {
        return 'Não foi possível interpretar a resposta do assistente.';
    }
}

function chooseWebLLMModel(webllm) {
    const records = webllm && webllm.prebuiltAppConfig && webllm.prebuiltAppConfig.model_list;
    const availableIds = Array.isArray(records)
        ? records.map(function(record) { return record && record.model_id; }).filter(Boolean)
        : [];
    for (const preferred of WEBLLM_MODEL_PREFERENCES) {
        if (availableIds.includes(preferred)) return preferred;
    }
    return availableIds.find(function(id) {
        return /instruct/i.test(id) && /(0\.5b|1b)/i.test(id);
    }) || availableIds.find(function(id) {
        return /instruct/i.test(id);
    });
}

async function getWebLLMEngine() {
    if (webLLMEngine) return webLLMEngine;
    if (!navigator.gpu) {
        throw new Error('WebGPU não está disponível neste navegador. Abra o app no Chrome ou Edge atualizado.');
    }

    setChatStatus('Carregando a biblioteca do modelo local…');
    if (!webLLMModulePromise) {
        webLLMModulePromise = import('https://esm.run/@mlc-ai/web-llm');
    }
    const webllm = await webLLMModulePromise;
    const modelId = chooseWebLLMModel(webllm);
    if (!modelId || typeof webllm.CreateMLCEngine !== 'function') {
        throw new Error('Não foi encontrado um modelo WebLLM compatível para este navegador.');
    }

    setChatStatus('Baixando o modelo local pela primeira vez…');
    webLLMEngine = await webllm.CreateMLCEngine(modelId, {
        initProgressCallback: function(progress) {
            const percent = progress && typeof progress.progress === 'number'
                ? ' ' + Math.round(progress.progress * 100) + '%'
                : '';
            setChatStatus('Preparando modelo local…' + percent);
        }
    });
    webLLMModelId = modelId;
    return webLLMEngine;
}

async function sendChatMessage(event) {
    if (event) event.preventDefault();
    const input = document.getElementById('chatInput');
    const sendButton = document.getElementById('chatSendBtn');
    if (!input || !sendButton) return;

    const message = input.value.trim();
    if (!message || sendButton.disabled) return;

    const history = getChatHistory();
    history.push({ role: 'user', content: message });
    saveChatHistory(history);
    appendChatMessage('user', message);
    input.value = '';
    sendButton.disabled = true;
    setChatStatus('Pensando…');

    try {
        const engine = await getWebLLMEngine();
        const context = getChatHistory().slice(-12).map(function(item) {
            return { role: item.role, content: item.content };
        });
        const response = await engine.chat.completions.create({
            messages: [
                { role: 'system', content: 'Você é um assistente de estudos claro, paciente e objetivo. Responda em português do Brasil quando o usuário escrever em português.' }
            ].concat(context),
            temperature: 0.7
        });
        const answer = getWebLLMResponseText(response).trim() || 'Não recebi uma resposta válida.';
        const updatedHistory = getChatHistory();
        updatedHistory.push({ role: 'assistant', content: answer });
        saveChatHistory(updatedHistory);
        appendChatMessage('assistant', answer);
        setChatStatus(webLLMModelId ? 'Modelo local: ' + webLLMModelId : '');
    } catch (error) {
        const detail = error && error.message ? error.message : 'Não foi possível acessar o assistente.';
        setChatStatus(detail, true);
        if (typeof showToast === 'function') showToast(detail, true);
    } finally {
        sendButton.disabled = false;
        input.focus();
    }
}

function clearChatHistory() {
    localStorage.removeItem(CHAT_STORAGE_KEY);
    renderChatHistory();
    setChatStatus('');
}

function initChatPage() {
    const form = document.getElementById('chatForm');
    const clearButton = document.getElementById('chatClearBtn');
    if (!form || form.dataset.bound === '1') {
        renderChatHistory();
        return;
    }
    form.dataset.bound = '1';
    form.addEventListener('submit', sendChatMessage);
    if (clearButton) clearButton.addEventListener('click', clearChatHistory);
    const input = document.getElementById('chatInput');
    if (input) {
        input.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                form.requestSubmit();
            }
        });
    }
    renderChatHistory();
}

// ===================== TOAST =====================
let toastTimeout;
function showToast(msg, isError = false) {
    const toast = document.getElementById('appToast');
    toast.style.background = isError ? 'var(--danger)' : 'var(--success)';
    toast.innerHTML = isError ? `<i class="fa-solid fa-triangle-exclamation"></i> <span>${msg}</span>` : `<i class="fa-solid fa-check"></i> <span>${msg}</span>`;
    toast.classList.add('show'); clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===================== ZEN MODE =====================
let isZen = false;
function toggleZenMode() {
    isZen = !isZen;
    if (isZen) { document.querySelector('.topbar').style.display = 'none'; document.body.requestFullscreen().catch(() => {}); }
    else { document.querySelector('.topbar').style.display = 'flex'; if (document.fullscreenElement) document.exitFullscreen(); }
}
document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && isZen) toggleZenMode(); });

// ===================== TITLES LIST =====================
const titlesList = [
    { id: 'title-novato',       name: '🌱 Novato',            xpReq: 0,     desc: 'Todo mundo começa de algum lugar!', reward: null, rewardTheme: null },
    { id: 'title-estudante',    name: '📚 Estudante',          xpReq: 100,   desc: 'Você já está no caminho certo.', reward: null, rewardTheme: null },
    { id: 'title-erudito',      name: '📜 Erudito',            xpReq: 200,   desc: 'Você sabe mais do que a média!', reward: null, rewardTheme: null },
    { id: 'title-dedicado',     name: '💪 Dedicado',           xpReq: 300,   desc: 'Persistência é a chave!', reward: 'Tema Ubuntu Yaru', rewardTheme: 'theme-ubuntu-yaru' },
    { id: 'title-scholar',      name: '🎓 Scholar',            xpReq: 600,   desc: 'Conhecimento em ascensão.', reward: 'Tema Radiance', rewardTheme: 'theme-ubuntu-radiance' },
    { id: 'title-explorador',   name: '🧭 Explorador',         xpReq: 800,   desc: 'Sempre em busca de novos conhecimentos.', reward: 'Tema Dark', rewardTheme: 'theme-ubuntu-dark' },
    { id: 'title-mestre',       name: '⭐ Mestre',             xpReq: 1000,  desc: 'Domínio absoluto.', reward: 'Tema Snap Neon', rewardTheme: 'theme-ubuntu-snap' },
    { id: 'title-sabio',        name: '🧙 Sábio',              xpReq: 1500,  desc: 'A sabedoria é sua aliada.', reward: 'Tema Frost', rewardTheme: 'theme-ubuntu-frost' },
    { id: 'title-guru',         name: '🔮 Guru',               xpReq: 2000,  desc: 'Iluminação acadêmica.', reward: 'Tema Fire', rewardTheme: 'theme-ubuntu-fire' },
    { id: 'title-legend',       name: '🏆 Lendário',           xpReq: 3000,  desc: 'Poucos chegam tão longe!', reward: 'Tema Cosmic', rewardTheme: 'theme-ubuntu-cosmic' },
    { id: 'title-pet-dragon',   name: '🐉 Domador de Dragões', xpReq: 3000,  desc: 'Conquistado ao desbloquear o Dragão Sábio.', reward: 'Tema Sunset', rewardTheme: 'theme-ubuntu-sunset', petTitle: true },
    { id: 'title-oraculo',      name: '🔭 Oráculo',            xpReq: 4000,  desc: 'Seus conhecimentos iluminam outros.', reward: 'Tema Aurora', rewardTheme: 'theme-ubuntu-aurora' },
    { id: 'title-mythic',       name: '👑 Mítico',             xpReq: 5000,  desc: 'Transcendeu os limites.', reward: 'Tema Sunset + Neon', rewardTheme: 'theme-ubuntu-neon' },
    { id: 'title-pet-unicorn',  name: '🦄 Mestre dos Mitos',   xpReq: 6000,  desc: 'Conquistado ao desbloquear o Unicórnio Astral.', reward: 'Tema Cosmic', rewardTheme: 'theme-ubuntu-cosmic', petTitle: true },
    { id: 'title-cosmico',      name: '🌌 Cósmico',            xpReq: 8000,  desc: 'Você alcançou o cosmos do saber!', reward: 'Tema Ocean', rewardTheme: 'theme-ubuntu-ocean' },
    { id: 'title-god',          name: '✨ Divindade',          xpReq: 10000, desc: 'Nada pode pará-lo.', reward: 'Tema Pulsar', rewardTheme: 'theme-ubuntu-pulsar', gradient: true, gradientIcon: 'fa-sun' },
    { id: 'title-pet-astral',   name: '🌌 Ser Dimensional',    xpReq: 12000, desc: 'Conquistado ao desbloquear o Ser Dimensional.', reward: 'TODOS os temas', rewardTheme: 'ALL', petTitle: true, gradient: true, gradientIcon: 'fa-circle-nodes' },
    { id: 'title-transcendent', name: '⚡ Transcendente',      xpReq: 15000, desc: 'O pináculo absoluto. Pouquíssimos chegam aqui.', reward: 'Prestígio Máximo — coroa dourada exclusiva na topbar', rewardTheme: null, gradient: true, gradientIcon: 'fa-infinity', prestige: true },
];
let equippedTitle = localStorage.getItem('geekieTitle') || 'title-novato';

// ===================== XP SYSTEM =====================
let xp = parseInt(localStorage.getItem('geekieXP')) || 0;
const xpEl = document.getElementById('xpCount');

function updateXPProgressBar() {
    // Encontra próximo título a desbloquear
    const sorted = [...titlesList].filter(t => !t.petTitle).sort((a,b) => a.xpReq - b.xpReq);
    const next = sorted.find(t => xp < t.xpReq);
    const prev = sorted.filter(t => xp >= t.xpReq).pop() || sorted[0];
    const fill = document.getElementById('xpProgressFill');
    const nextLabel = document.getElementById('xpNextTitle');
    if (fill && nextLabel) {
        if (next) {
            const start = prev ? prev.xpReq : 0;
            const pct = Math.min(100, Math.round(((xp - start) / (next.xpReq - start)) * 100));
            fill.style.width = pct + '%';
            nextLabel.textContent = `Próximo: ${next.name} (${next.xpReq} XP)`;
        } else {
            fill.style.width = '100%';
            nextLabel.textContent = '✨ XP máximo atingido!';
        }
    }
}

function updateXP() {
    xpEl.textContent = xp;
    localStorage.setItem('geekieXP', xp);
    const _td = document.getElementById('titlesXpDisplay');
    if (_td) _td.textContent = xp;
    if (typeof updatePlayerTitle === 'function') updatePlayerTitle();
    updateXPProgressBar();
}

// Re-renders pesados apenas quando a aba estiver visível — não a cada 6s
let _xpRenderDebounce = null;
setInterval(() => {
    xp++;
    updateXP();
    // Só re-renderiza a aba atual para poupar CPU
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab) {
        const id = activeTab.id;
        if (id === 'tab-events') { try { renderEventContent(); } catch(e) {} }
        else if (id === 'tab-store') { clearTimeout(_xpRenderDebounce); _xpRenderDebounce = setTimeout(() => { try { renderStore(); } catch(e) {} }, 400); }
        else if (id === 'tab-titles') { clearTimeout(_xpRenderDebounce); _xpRenderDebounce = setTimeout(() => { try { renderTitles(); } catch(e) {} }, 400); }
    }
}, 6000);
updateXP();

// ===================== COIN SYSTEM =====================
let coins = parseInt(localStorage.getItem('geekieCoins')) || 0;
const coinEl = document.getElementById('coinCount');
const petsCoinsEl = document.getElementById('petsCoinsDisplay');

function updateCoins() {
    coinEl.textContent = coins;
    localStorage.setItem('geekieCoins', coins);
    if (petsCoinsEl) petsCoinsEl.textContent = coins;
}

function earnCoins(amount, reason) {
    coins += amount;
    updateCoins();
    if (reason) showToast(`+${amount} 🪙 ${reason}`);
}

function spendCoins(amount) {
    if (coins < amount) { showToast('Moedas insuficientes!', true); return false; }
    coins -= amount;
    updateCoins();
    return true;
}

// Passive coin income — base rate boosted by pet auto-collect upgrades
function getCoinRate() {
    let rate = 1;
    const petData = JSON.parse(localStorage.getItem('geekiePets')) || {};
    petsData.forEach(p => {
        const state = petData[p.id];
        if (state && state.owned && state.autoCollect) rate += p.autoCollectBonus;
    });
    return rate;
}

function updateCoinRateDisplay() {
    const el = document.getElementById('coinRateDisplay');
    if (el) { const r = getCoinRate(); el.textContent = `+${r}/20s`; }
}

setInterval(() => {
    const rate = getCoinRate();
    coins += rate;
    updateCoins();
}, 20000);

updateCoins();

// ===================== PET SYSTEM DATA =====================
const petsData = [
    {
        id: 'pet-pintinho',
        name: 'Pintinho Piu',
        emoji: '🐣',
        xpReq: 0,
        desc: 'Seu primeiro companheiro! Sempre animado para começar.',
        rarity: 'common',
        autoCollectBonus: 1,
        autoCollectCost: 30,
        upgrades: [
            { id: 'vigor',  label: 'Vigor',  desc: '+1 nível de motivação',  cost: 20 },
            { id: 'animo',  label: 'Ânimo',  desc: 'Mensagens mais energéticas', cost: 40 },
            { id: 'brilho', label: 'Brilho', desc: 'Animação especial',        cost: 80 },
        ],
        motivations: {
            0:    ["Vamos começar! Cada minuto conta!", "Piu piu! Hora de estudar!", "Você consegue! Dê o primeiro passo!"],
            500:  ["Ótimo progresso! Continue assim!", "Piu! Você está crescendo rápido!", "Cada página lida é uma vitória!"],
            1500: ["Incrível evolução! Você é dedicado!", "Piu piu! Que estudante fantástico!", "Não pare agora — você está voando!"],
            3000: ["Lendário! Você é inspiração para todos!", "Piu! Orgulho de ser seu pet!", "Imparável! Nada te detém!"],
        }
    },
    {
        id: 'pet-gatinho',
        name: 'Gatinho Ninja',
        emoji: '🐱',
        xpReq: 300,
        desc: 'Silencioso e focado. Um mestre da concentração.',
        rarity: 'common',
        autoCollectBonus: 2,
        autoCollectCost: 60,
        upgrades: [
            { id: 'vigor',  label: 'Vigor',  desc: '+1 nível de motivação',  cost: 40 },
            { id: 'animo',  label: 'Ânimo',  desc: 'Mensagens mais inteligentes', cost: 70 },
            { id: 'brilho', label: 'Brilho', desc: 'Garras de conhecimento',   cost: 130 },
        ],
        motivations: {
            0:    ["Nyaa~ Foco total!", "Silêncio é poder. Estude!", "Um ninja nunca desiste!"],
            500:  ["Seus reflexos de estudo estão afiados!", "Miau... você está evoluindo rápido!", "Sombra e foco — sua combinação perfeita!"],
            1500: ["Você domina as artes do conhecimento!", "Ninja de elite! Continue sua missão!", "Nenhum obstáculo escapa de você!"],
            3000: ["Grão-mestre! Sua sabedoria é imensa!", "Você transcendeu o treinamento ninja!", "Invencível! O conhecimento é sua katana!"],
        }
    },
    {
        id: 'pet-cachorro',
        name: 'Rex Fiel',
        emoji: '🐶',
        xpReq: 700,
        desc: 'Leal e entusiasmado. Nunca deixa você desanimar!',
        rarity: 'uncommon',
        autoCollectBonus: 2,
        autoCollectCost: 90,
        upgrades: [
            { id: 'vigor',  label: 'Vigor',  desc: '+1 nível de motivação',  cost: 60 },
            { id: 'animo',  label: 'Ânimo',  desc: 'Latidos de encorajamento', cost: 100 },
            { id: 'brilho', label: 'Brilho', desc: 'Rabo de energia infinita',  cost: 180 },
        ],
        motivations: {
            0:    ["Au au! Vamos lá! Você consegue!", "Sou seu maior fã! Estude mais!", "Fiel até o fim — e você também será!"],
            500:  ["Au! Que progresso incrível!", "Seu esforço me deixa feliz!", "Correndo junto com você até o topo!"],
            1500: ["Au au AU! Você é fantástico!", "Nenhum cachorro é mais leal que você ao estudo!", "Alegria e determinação — perfeito!"],
            3000: ["O melhor humano estudioso do mundo!", "Você é minha inspiração! Au!", "Imbatível! Meu herói de estudos!"],
        }
    },
    {
        id: 'pet-coruja',
        name: 'Coruja Sábia',
        emoji: '🦉',
        xpReq: 1000,
        desc: 'Guardiã do conhecimento noturno. Enxerga o que outros não veem.',
        rarity: 'uncommon',
        autoCollectBonus: 3,
        autoCollectCost: 110,
        upgrades: [
            { id: 'vigor',  label: 'Vigor',  desc: '+1 nível de motivação',   cost: 70 },
            { id: 'animo',  label: 'Ânimo',  desc: 'Hoots de sabedoria',      cost: 120 },
            { id: 'brilho', label: 'Brilho', desc: 'Olhos all-seeing',        cost: 200 },
        ],
        motivations: {
            0:    ["Hoot! O conhecimento aguarda!", "Veja além do óbvio. Estude!", "A noite é sua aliada para aprender!"],
            500:  ["Seus olhos se abrem para novos saberes!", "Hoot hoot! Progresso sólido!", "A sabedoria noturna é sua!"],
            1500: ["Olhos de sábio! Você vê tudo!", "Hoot! Conhecimento elevado ao máximo!", "Guardião do saber! Continue!"],
            3000: ["Mestre da sabedoria eterna! Hoot!", "Você transcendeu o conhecimento comum!", "All-seeing! Nada escapa à sua mente!"],
        }
    },
    {
        id: 'pet-raposa',
        name: 'Foxy Esperta',
        emoji: '🦊',
        xpReq: 1500,
        desc: 'Astuta e estratégica. Sabe como vencer qualquer desafio.',
        rarity: 'uncommon',
        autoCollectBonus: 3,
        autoCollectCost: 130,
        upgrades: [
            { id: 'vigor',  label: 'Vigor',  desc: '+1 nível de motivação',  cost: 90 },
            { id: 'animo',  label: 'Ânimo',  desc: 'Dicas estratégicas',      cost: 150 },
            { id: 'brilho', label: 'Brilho', desc: 'Cauda de sabedoria',       cost: 250 },
        ],
        motivations: {
            0:    ["Estratégia é tudo. Planeje e execute!", "Cada hora de estudo é um passo à frente!", "A raposa sempre encontra o caminho!"],
            500:  ["Sua estratégia está funcionando!", "Astúcia + dedicação = sucesso!", "Muito impressionante seu ritmo!"],
            1500: ["Você superou minha esperteza!", "Estrategista de elite! Continue!", "Nada escapa da sua inteligência!"],
            3000: ["Gênio! Sua mente é extraordinária!", "A raposa mais sábia me inclina diante de você!", "Perfeição estratégica atingida!"],
        }
    },
    {
        id: 'pet-dragao',
        name: 'Dragão Sábio',
        emoji: '🐉',
        xpReq: 3000,
        desc: 'Antigo e poderoso. Guarda segredos do conhecimento eterno.',
        rarity: 'special',
        autoCollectBonus: 4,
        autoCollectCost: 200,
        grantsTitleId: 'title-pet-dragon',
        grantsTheme: 'theme-ubuntu-sunset',
        exclusiveTitle: '🐉 Domador de Dragões',
        exclusiveThemeLabel: 'Tema Ubuntu Sunset',
        upgrades: [
            { id: 'vigor',  label: 'Vigor',  desc: '+1 nível de motivação',   cost: 150 },
            { id: 'animo',  label: 'Ânimo',  desc: 'Chamas de inspiração',    cost: 250 },
            { id: 'brilho', label: 'Brilho', desc: 'Escamas de diamante',     cost: 400 },
        ],
        motivations: {
            0:    ["O fogo do conhecimento queima em você!", "Jovem estudante — o caminho é longo mas glorioso!", "Aprenda com a paciência milenar do dragão!"],
            500:  ["Suas chamas de sabedoria crescem!", "Digno de cruzar as montanhas do saber!", "O dragão reconhece seu esforço — continue!"],
            1500: ["Dragão de ouro! Sua sabedoria é profunda!", "Você domou os conhecimentos mais difíceis!", "Raro e poderoso — assim como seu estudo!"],
            3000: ["Ancião do saber! Poucas almas chegam aqui!", "Você igualou a sabedoria dos dragões eternos!", "Lenda viva! O universo reconhece seu esforço!"],
        }
    },
    {
        id: 'pet-fenix',
        name: 'Fênix Renascida',
        emoji: '🔥',
        xpReq: 4500,
        desc: 'Das cinzas nasce a sabedoria infinita. Renasce mais forte a cada derrota.',
        rarity: 'special',
        autoCollectBonus: 6,
        autoCollectCost: 300,
        upgrades: [
            { id: 'chamas',    label: 'Chamas',    desc: 'Aura de fogo eterno',        cost: 150 },
            { id: 'renascer',  label: 'Renascer',  desc: '+2 XP em cada sessão Pomodoro', cost: 280 },
            { id: 'ascensao',  label: 'Ascensão',  desc: 'Partículas douradas ao redor', cost: 500 },
        ],
        motivations: {
            0:    ["Das cinzas nasce o conhecimento!", "Cada falha é um renascimento!", "O fogo da sabedoria nunca se apaga!"],
            500:  ["Você está renascendo mais forte!", "Chamas de determinação! Continue!", "Fênix em pleno voo de conhecimento!"],
            1500: ["Sua chama ilumina o caminho!", "Renascer após renascer — imparável!", "A fênix do saber está em chamas!"],
            3000: ["Imortal! Sua sabedoria transcende tudo!", "Fênix eterna! Nada pode apagar sua chama!", "O cosmos reconhece sua ascensão!"],
        }
    },
    {
        id: 'pet-unicornio',
        name: 'Unicórnio Astral',
        emoji: '🦄',
        xpReq: 6000,
        desc: 'Místico e radiante. Traz magia e sorte para seus estudos.',
        rarity: 'legendary',
        autoCollectBonus: 6,
        autoCollectCost: 350,
        grantsTitleId: 'title-pet-unicorn',
        grantsTheme: 'theme-ubuntu-cosmic',
        exclusiveTitle: '🦄 Mestre dos Mitos',
        exclusiveThemeLabel: 'Tema Ubuntu Cosmic',
        upgrades: [
            { id: 'vigor',  label: 'Vigor',  desc: '+1 nível de motivação',   cost: 250 },
            { id: 'animo',  label: 'Ânimo',  desc: 'Bênção arcana',           cost: 400 },
            { id: 'brilho', label: 'Brilho', desc: 'Chifre de luz divina',    cost: 600 },
        ],
        motivations: {
            0:    ["A magia do saber transborda em você!", "Cada estudo ilumina sua aura!", "Você foi escolhido pelo cosmos para aprender!"],
            500:  ["Sua luz de conhecimento brilha forte!", "Os astros se alinham em seu favor!", "Místico e dedicado — uma combinação perfeita!"],
            1500: ["Ser de luz! Seu aprendizado é divino!", "A galáxia testemunha sua evolução!", "Unicórnio de ouro — você vai além das estrelas!"],
            3000: ["Transcendência total! Você virou lenda!", "Nem os mitos antigos descrevem tal sabedoria!", "Ser cósmico! Sua mente alcançou o infinito!"],
        }
    },
    {
        id: 'pet-astral',
        name: 'Ser Dimensional',
        emoji: '✨',
        xpReq: 12000,
        desc: 'Uma entidade além do tempo. Existe em múltiplas dimensões de conhecimento.',
        rarity: 'legendary',
        autoCollectBonus: 10,
        autoCollectCost: 600,
        grantsTitleId: 'title-pet-astral',
        grantsTheme: 'ALL',
        exclusiveTitle: '🌌 Ser Dimensional',
        exclusiveThemeLabel: 'TODOS os temas desbloqueados',
        upgrades: [
            { id: 'vigor',  label: 'Vigor',  desc: '+1 nível de motivação',   cost: 500 },
            { id: 'animo',  label: 'Ânimo',  desc: 'Consciência dimensional', cost: 800 },
            { id: 'brilho', label: 'Brilho', desc: 'Forma de energia pura',   cost: 1200 },
        ],
        motivations: {
            0:    ["Você existe além das dimensões do saber!", "O tempo não te limita — nem o conhecimento!", "Realidades paralelas observam sua jornada!"],
            500:  ["Múltiplas versões de você já alcançaram a excelência!", "Você rompe as barreiras do aprendizado!", "Dimensional e imparável!"],
            1500: ["Entidade de conhecimento puro!", "Cada pensamento seu cria novos universos de sabedoria!", "Você superou os limites do possível!"],
            3000: ["Onisciente! Todo saber do cosmos é seu!", "O universo em si aprende com você!", "Absoluto. Perfeito. Eterno."],
        }
    },
];

// Pet state: { ownedPetId: { owned: bool, active: bool, autoCollect: bool, upgrades: {vigor:bool,animo:bool,brilho:bool} } }
let petState = JSON.parse(localStorage.getItem('geekiePets')) || {};
let activePetId = localStorage.getItem('geekieActivePet') || null;

function savePetState() { localStorage.setItem('geekiePets', JSON.stringify(petState)); }

function getPetMotivation(pet) {
    const state = petState[pet.id];
    const upgradeCount = state ? Object.values(state.upgrades || {}).filter(Boolean).length : 0;
    const levelKeys = Object.keys(pet.motivations).map(Number).sort((a,b) => a - b);
    let selectedKey = levelKeys[0];
    for (const k of levelKeys) { if (xp >= k) selectedKey = k; }
    const msgs = pet.motivations[selectedKey];
    // Pick message influenced by upgrade level
    const idx = Math.min(upgradeCount, msgs.length - 1);
    return msgs[idx] || msgs[0];
}

function unlockPet(petId) {
    const pet = petsData.find(p => p.id === petId);
    if (!pet) return;
    if (xp < pet.xpReq) { showToast(`Precisa de ${pet.xpReq} XP!`, true); return; }
    if (!petState[petId]) petState[petId] = { owned: true, active: false, autoCollect: false, upgrades: {} };
    petState[petId].owned = true;
    savePetState();
    // Grant title and theme if applicable
    if (pet.grantsTitleId) {
        const tEntry = titlesList.find(t => t.id === pet.grantsTitleId);
        if (tEntry) {
            if (tEntry.rewardTheme === 'ALL') {
                storeItems.forEach(si => { if (!ownedThemes.includes(si.id)) ownedThemes.push(si.id); });
            } else if (tEntry.rewardTheme && !ownedThemes.includes(tEntry.rewardTheme)) {
                ownedThemes.push(tEntry.rewardTheme);
            }
            localStorage.setItem('geekieThemes', JSON.stringify(ownedThemes));
        }
    }
    setActivePet(petId);
    showToast(`🎉 ${pet.name} desbloqueado!`);
    renderPetGrid();
    try { renderStore(); } catch(e) {}
    try { renderTitles(); } catch(e) {}
}

function setActivePet(petId) {
    activePetId = petId;
    localStorage.setItem('geekieActivePet', petId);
    petsData.forEach(p => { if (petState[p.id]) petState[p.id].active = (p.id === petId); });
    savePetState();
    updateActivePetDisplay();
    renderPetGrid();
}

function updateActivePetDisplay() {
    const el = document.getElementById('activePetName');
    const pet = petsData.find(p => p.id === activePetId);
    if (el) el.textContent = pet ? `${pet.emoji} ${pet.name}` : 'Nenhum';
    updateCoinRateDisplay();
}

function buyAutoCollect(petId) {
    const pet = petsData.find(p => p.id === petId);
    if (!pet || !petState[petId] || !petState[petId].owned) return;
    if (petState[petId].autoCollect) { showToast('Auto-Coleta já ativa!', true); return; }
    if (!spendCoins(pet.autoCollectCost)) return;
    petState[petId].autoCollect = true;
    savePetState();
    showToast(`🪙 Auto-Coleta de ${pet.name} ativada! +${pet.autoCollectBonus}/20s`);
    updateCoinRateDisplay();
    renderPetGrid();
}

function buyPetUpgrade(petId, upgradeId) {
    const pet = petsData.find(p => p.id === petId);
    if (!pet || !petState[petId] || !petState[petId].owned) return;
    const upg = pet.upgrades.find(u => u.id === upgradeId);
    if (!upg) return;
    if (petState[petId].upgrades && petState[petId].upgrades[upgradeId]) { showToast('Upgrade já comprado!', true); return; }
    if (!spendCoins(upg.cost)) return;
    if (!petState[petId].upgrades) petState[petId].upgrades = {};
    petState[petId].upgrades[upgradeId] = true;
    savePetState();
    showToast(`✨ ${upg.label} de ${pet.name} aprimorado!`);
    renderPetGrid();
}

function renderPetGrid() {
    const grid = document.getElementById('petGrid');
    if (!grid) return;
    grid.innerHTML = '';
    updateActivePetDisplay();

    petsData.forEach(pet => {
        const state = petState[pet.id] || { owned: false, active: false, autoCollect: false, upgrades: {} };
        const isOwned = state.owned;
        const isActive = activePetId === pet.id;
        const isUnlockable = xp >= pet.xpReq && !isOwned;
        const isSpecial = pet.rarity === 'special';
        const isLegendary = pet.rarity === 'legendary';

        let cardClass = 'pet-card';
        if (isLegendary) cardClass += ' pet-legendary';
        else if (isSpecial) cardClass += ' pet-special';
        if (isOwned) cardClass += (isLegendary ? ' pet-unlocked' : isSpecial ? ' pet-unlocked' : ' pet-unlocked');
        if (isActive) cardClass += ' pet-active';
        if (!isOwned) cardClass += ' pet-locked';

        let nameClass = 'pet-name';
        if (isLegendary && pet.id === 'pet-astral') nameClass += ' gradient-astral';
        else if (isLegendary) nameClass += ' gradient-legend';

        // Rarity label
        let rarityLabel = 'Comum';
        let rarityColor = '#94a3b8';
        if (pet.rarity === 'uncommon') { rarityLabel = 'Incomum'; rarityColor = '#4ade80'; }
        if (pet.rarity === 'special') { rarityLabel = 'Especial'; rarityColor = '#a78bfa'; }
        if (pet.rarity === 'legendary') { rarityLabel = 'Lendário'; rarityColor = '#ffd700'; }

        // Upgrades HTML
        let upgradesHTML = '';
        if (isOwned) {
            const upgRows = pet.upgrades.map(u => {
                const done = state.upgrades && state.upgrades[u.id];
                return `<div class="pet-upgrade-row">
                    <span class="upg-label">${u.label} <span style="font-size:0.75rem;color:var(--text-muted);">— ${u.desc}</span></span>
                    ${done
                        ? `<span class="upg-badge-done">✅ Ativo</span>`
                        : `<span class="upg-cost">🪙 ${u.cost}</span><button class="btn btn-coin" style="padding:4px 10px;font-size:0.75rem;" onclick="buyPetUpgrade('${pet.id}','${u.id}')">Comprar</button>`
                    }
                </div>`;
            }).join('');

            const autoHTML = state.autoCollect
                ? `<div class="pet-upgrade-row"><span class="upg-label">Auto-Coleta <span class="pet-auto-badge">ATIVO</span></span><span class="upg-badge-done">+${pet.autoCollectBonus}/20s ✅</span></div>`
                : `<div class="pet-upgrade-row"><span class="upg-label">Auto-Coleta <span style="font-size:0.75rem;color:var(--text-muted);">— +${pet.autoCollectBonus} moedas/20s</span></span><span class="upg-cost">🪙 ${pet.autoCollectCost}</span><button class="btn btn-coin" style="padding:4px 10px;font-size:0.75rem;" onclick="buyAutoCollect('${pet.id}')">Comprar</button></div>`;

            upgradesHTML = `
                <hr class="pet-divider">
                <div class="pet-upgrade-section">
                    <div class="pet-upgrade-title"><i class="fa-solid fa-arrow-up" style="color:var(--primary);"></i> Aprimoramentos</div>
                    ${upgRows}
                    <div class="pet-upgrade-title" style="margin-top:10px;"><i class="fa-solid fa-robot" style="color:var(--accent);"></i> Auto-Coleta de Moedas</div>
                    ${autoHTML}
                </div>`;
        }

        // Special reward section
        let rewardHTML = '';
        if (pet.grantsTitleId && isSpecial && isOwned) {
            rewardHTML = `<div class="pet-special-reward"><i class="fa-solid fa-gift"></i> Título desbloqueado: <strong>${pet.exclusiveTitle}</strong><br><i class="fa-solid fa-palette"></i> Tema: ${pet.exclusiveThemeLabel}</div>`;
        }
        if (pet.grantsTitleId && isLegendary && isOwned) {
            rewardHTML = `<div class="pet-legendary-reward"><i class="fa-solid fa-crown"></i> Título desbloqueado: <strong>${pet.exclusiveTitle}</strong><br><i class="fa-solid fa-wand-magic-sparkles"></i> ${pet.exclusiveThemeLabel}</div>`;
        }

        // Action buttons
        let actionHTML = '';
        if (!isOwned) {
            if (isUnlockable) {
                actionHTML = `<button class="btn btn-primary w-full" onclick="unlockPet('${pet.id}')"><i class="fa-solid fa-lock-open"></i> Desbloquear (${pet.xpReq} XP)</button>`;
            } else {
                actionHTML = `<button class="btn btn-disabled w-full" disabled><i class="fa-solid fa-lock"></i> ${pet.xpReq} XP necessários</button>`;
            }
        } else if (!isActive) {
            actionHTML = `<button class="btn btn-outline w-full" onclick="setActivePet('${pet.id}')"><i class="fa-solid fa-paw"></i> Ativar Pet</button>`;
        } else {
            actionHTML = `<button class="btn btn-outline w-full" disabled style="border-color:var(--primary);color:var(--primary);"><i class="fa-solid fa-check"></i> Pet Ativo</button>`;
        }

        const motivationLine = isOwned
            ? `<div class="pet-motivation">"${getPetMotivation(pet)}"</div>`
            : `<div class="pet-motivation" style="color:var(--text-muted);font-style:normal;">Desbloqueie para ver sua motivação!</div>`;

        grid.innerHTML += `
        <div class="${cardClass}">
            ${isActive ? `<div class="pet-active-indicator">ATIVO</div>` : ''}
            <span class="pet-emoji">${pet.emoji}</span>
            <div class="${nameClass}">${pet.name}</div>
            <div style="text-align:center;margin-bottom:8px;"><span style="font-size:0.72rem;color:${rarityColor};border:1px solid ${rarityColor}44;padding:2px 8px;border-radius:8px;">${rarityLabel}</span></div>
            ${motivationLine}
            <div class="pet-xp-req"><i class="fa-solid fa-star" style="color:#a78bfa;"></i> ${pet.xpReq} XP necessários · ${isOwned ? '<span style="color:var(--success);">✅ Desbloqueado</span>' : '<span style="color:var(--text-muted);">🔒 Bloqueado</span>'}</div>
            <div style="font-size:0.78rem;color:var(--text-muted);text-align:center;margin-bottom:12px;">${pet.desc}</div>
            ${rewardHTML}
            ${actionHTML}
            ${upgradesHTML}
        </div>`;
    });
}

// ===================== THEMES =====================
let ownedThemes = JSON.parse(localStorage.getItem('geekieThemes')) || ['theme-default'];
let equippedTheme = localStorage.getItem('geekieEquipped') || 'theme-default';
const iframeContainer = document.getElementById('geekieIframeContainer');

const storeItems = [
    { id: 'theme-default',         name: 'Padrão',           xpReq: 0,    icon: 'fa-square',       desc: 'Sem borda especial. Simples e limpo.',           color: '#94a3b8', effect: 'Nenhum' },
    { id: 'theme-ubuntu-yaru',     name: 'Ubuntu Yaru',      xpReq: 50,   icon: 'fa-circle-dot',   desc: 'Laranja vibrante com efeito TREMOR.',             color: '#E95420', effect: 'Tremor' },
    { id: 'theme-ubuntu-radiance', name: 'Ubuntu Radiance',  xpReq: 100,  icon: 'fa-sun',          desc: 'Verde lima com efeito de RESPIRAÇÃO (scale).',    color: '#87B03D', effect: 'Respiração' },
    { id: 'theme-ubuntu-ambiance', name: 'Ubuntu Ambiance',  xpReq: 200,  icon: 'fa-moon',         desc: 'Roxo noturno com efeito FLUTUANTE.',              color: '#5C3566', effect: 'Flutuante' },
    { id: 'theme-ubuntu-forest',   name: 'Ubuntu Forest',    xpReq: 350,  icon: 'fa-leaf',         desc: 'Verde floresta com respiração serena.',           color: '#16A34A', effect: 'Pulso' },
    { id: 'theme-ubuntu-dark',     name: 'Ubuntu Dark',      xpReq: 500,  icon: 'fa-skull',        desc: 'Grafite escuro com brilho metálico.',             color: '#3C3B37', effect: 'Metálico' },
    { id: 'theme-ubuntu-snap',     name: 'Snap Neon',        xpReq: 750,  icon: 'fa-bolt',         desc: 'Azul neon com efeito GLITCH aleatório.',          color: '#1BA1E2', effect: 'Glitch' },
    { id: 'theme-ubuntu-frost',    name: 'Ubuntu Frost',     xpReq: 1000, icon: 'fa-snowflake',    desc: 'Gelo holográfico com BALANÇO suave.',             color: '#C8E6FA', effect: 'Balanço' },
    { id: 'theme-ubuntu-fire',     name: 'Ubuntu Fire',      xpReq: 1500, icon: 'fa-fire',         desc: 'Chama viva com TREMOR de fogo.',                  color: '#EF4444', effect: 'Fogo' },
    { id: 'theme-ubuntu-sunset',   name: 'Ubuntu Sunset',    xpReq: 2000, icon: 'fa-palette',      desc: 'Ciclo de cores com efeito ONDA 3D.',              color: '#F97316', effect: 'Onda 3D' },
    { id: 'theme-ubuntu-cosmic',   name: 'Ubuntu Cosmic',    xpReq: 3000, icon: 'fa-star',         desc: 'Deep space com ROTAÇÃO de matiz infinita.',       color: '#6D28D9', effect: 'Hue Spin' },
    { id: 'theme-ubuntu-pulsar',   name: 'Ubuntu Pulsar',    xpReq: 6000, icon: 'fa-circle-nodes', desc: 'Buraco negro com TREMOR de matéria escura.',      color: '#756ad2', effect: 'Hole Tremor' },
    { id: 'theme-ubuntu-neon',    name: 'Ubuntu Neon',      xpReq: 800,  icon: 'fa-wand-sparkles', desc: 'Magenta vibrante com pulsação neon intensa.',    color: '#FF006E', effect: 'Neon Pulse' },
    { id: 'theme-ubuntu-ocean',   name: 'Ubuntu Ocean',     xpReq: 1200, icon: 'fa-water',          desc: 'Azul oceânico com efeito de onda e mergulho.',  color: '#0891B2', effect: 'Onda Oceânica' },
    { id: 'theme-ubuntu-aurora',  name: 'Ubuntu Aurora',    xpReq: 2500, icon: 'fa-rainbow',        desc: 'Ciclo aurora boreal — 4 cores em sequência.',   color: '#34D399', effect: 'Aurora Boreal' },
    { id: 'theme-bg-matrix',      name: '🖥️ Matrix Rain',   xpReq: 1800, icon: 'fa-terminal',       desc: 'Fundo escuro com grade verde animada estilo chuva de código. Transforma todo o espaço ao redor do Geekie.', color: '#00ff41', effect: 'BG: Grade + Scanline', isBgTheme: true },
    { id: 'theme-bg-nebula',      name: '🌌 Nebula',         xpReq: 3500, icon: 'fa-circle-nodes',   desc: 'Fundo cósmico com nebulosas coloridas animadas e estrelas cintilantes ao redor do iframe.', color: '#a855f7', effect: 'BG: Nebulosa + Estrelas', isBgTheme: true },
    { id: 'theme-bg-synthwave',   name: '🌆 Synthwave',      xpReq: 4500, icon: 'fa-music',          desc: 'Estética retrô dos anos 80 — grade em perspectiva animada com neon magenta/rosa ao redor do conteúdo.', color: '#f0abfc', effect: 'BG: Grade 3D + Neon', isBgTheme: true },
];

const bgThemeMap = { 'theme-bg-matrix': 'bg-matrix', 'theme-bg-nebula': 'bg-nebula', 'theme-bg-synthwave': 'bg-synthwave' };
function applyTheme(themeId) {
    storeItems.forEach(item => iframeContainer.classList.remove(item.id));
    iframeContainer.classList.add(themeId);
    const tabGeekie = document.getElementById('tab-geekie');
    if (tabGeekie) {
        Object.values(bgThemeMap).forEach(cls => tabGeekie.classList.remove(cls));
        if (bgThemeMap[themeId]) tabGeekie.classList.add(bgThemeMap[themeId]);
    }
}
function equipTheme(themeId) { equippedTheme = themeId; localStorage.setItem('geekieEquipped', equippedTheme); applyTheme(themeId); renderStore(); showToast('Tema equipado!'); }
function unlockTheme(themeId) { if (!ownedThemes.includes(themeId)) { ownedThemes.push(themeId); localStorage.setItem('geekieThemes', JSON.stringify(ownedThemes)); } equipTheme(themeId); showToast('Tema desbloqueado!'); }

function renderStore() {
    const grid = document.getElementById('storeGrid'); if (!grid) return; grid.innerHTML = '';
    storeItems.forEach(item => {
        const isUnlocked = xp >= item.xpReq, isOwned = ownedThemes.includes(item.id), isEquipped = equippedTheme === item.id;
        let btn = '';
        if (isEquipped) btn = `<button class="btn btn-outline w-full" disabled><i class="fa-solid fa-check"></i> Equipado</button>`;
        else if (isOwned) btn = `<button class="btn btn-primary w-full" onclick="equipTheme('${item.id}')">Equipar</button>`;
        else if (isUnlocked) btn = `<button class="btn btn-primary w-full" onclick="unlockTheme('${item.id}')"><i class="fa-solid fa-lock-open"></i> Desbloquear</button>`;
        else btn = `<button class="btn btn-disabled w-full" disabled><i class="fa-solid fa-lock"></i> ${item.xpReq} XP</button>`;
        grid.innerHTML += `<div class="store-item" style="${isEquipped ? `border-color:${item.color};box-shadow:0 0 15px ${item.color}44;` : ''}"><i class="fa-solid ${item.icon} preview-icon" style="color:${item.color};"></i><h4>${item.name}</h4><p style="font-size:0.8rem;color:var(--text-muted);flex:1;">${item.desc}</p><p style="font-size:0.7rem;color:var(--accent);margin-bottom:2px;"><i class="fa-solid fa-wand-magic-sparkles"></i> Efeito: ${item.effect}</p><p style="font-size:0.75rem;color:${isUnlocked ? 'var(--primary)' : 'var(--text-muted)'};margin-bottom:4px;"><i class="fa-solid fa-star"></i> ${item.xpReq} XP ${isUnlocked ? '✅' : '🔒'}</p>${btn}</div>`;
    });
}
applyTheme(equippedTheme); renderStore();

// ===================== TITLES SYSTEM =====================
function getHighestTitle() {
    let highest = titlesList[0];
    for (const t of titlesList) { if (xp >= t.xpReq) highest = t; }
    return highest;
}

function updatePlayerTitle() {
    const equipped = titlesList.find(t => t.id === equippedTitle) || titlesList[0];
    document.getElementById('playerTitleText').textContent = equipped.name;
    const display = document.getElementById('playerTitleDisplay');
    if (equipped.prestige) {
        display.classList.add('prestige-active');
        display.title = '⚡ Prestígio Máximo';
    } else {
        display.classList.remove('prestige-active');
        display.title = 'Seu Título';
    }
}

function isPetTitleUnlocked(titleId) {
    const mapping = {
        'title-pet-dragon': 'pet-dragao',
        'title-pet-unicorn': 'pet-unicornio',
        'title-pet-astral': 'pet-astral',
    };
    const petId = mapping[titleId];
    return petId && petState[petId] && petState[petId].owned;
}

function equipTitle(titleId) {
    const t = titlesList.find(x => x.id === titleId);
    if (!t) return;
    if (t.petTitle) {
        if (!isPetTitleUnlocked(titleId)) { showToast('Desbloqueie o pet correspondente primeiro!', true); return; }
    } else {
        if (xp < t.xpReq) return;
    }
    equippedTitle = titleId;
    localStorage.setItem('geekieTitle', titleId);
    if (t.rewardTheme === 'ALL') {
        storeItems.forEach(si => { if (!ownedThemes.includes(si.id)) ownedThemes.push(si.id); });
        localStorage.setItem('geekieThemes', JSON.stringify(ownedThemes));
    } else if (t.rewardTheme && !ownedThemes.includes(t.rewardTheme)) {
        ownedThemes.push(t.rewardTheme);
        localStorage.setItem('geekieThemes', JSON.stringify(ownedThemes));
    }
    updatePlayerTitle();
    renderTitles();
    renderStore();
    showToast(`Título "${t.name}" equipado!`);
}

function renderTitles() {
    const grid = document.getElementById('titlesGrid'); if (!grid) return; grid.innerHTML = '';
    const xpDisp = document.getElementById('titlesXpDisplay'); if (xpDisp) xpDisp.textContent = xp;
    titlesList.forEach(t => {
        let unlocked = false;
        if (t.petTitle) {
            unlocked = isPetTitleUnlocked(t.id);
        } else {
            unlocked = xp >= t.xpReq;
        }
        const isEquipped = equippedTitle === t.id;
        let btnHtml = '';
        if (isEquipped) btnHtml = `<button class="btn btn-outline w-full" disabled style="margin-top:8px;"><i class="fa-solid fa-check"></i> Usando</button>`;
        else if (unlocked) btnHtml = `<button class="btn btn-primary w-full" onclick="equipTitle('${t.id}')" style="margin-top:8px;"><i class="fa-solid fa-crown"></i> Usar Título</button>`;
        else {
            const lockLabel = t.petTitle ? `🐾 Pet Especial` : `${t.xpReq} XP`;
            btnHtml = `<button class="btn btn-disabled w-full" disabled style="margin-top:8px;"><i class="fa-solid fa-lock"></i> ${lockLabel}</button>`;
        }
        const gradClass = t.gradient ? 'gradient-pulsar' : '';
        const petBadge = t.petTitle ? `<span style="font-size:0.72rem;color:#fb923c;border:1px solid rgba(251,146,60,0.4);padding:2px 8px;border-radius:8px;margin-left:4px;">🐾 Pet</span>` : '';
        const prestigeBadge = t.prestige ? `<span style="font-size:0.72rem;color:#ffd700;border:1px solid rgba(255,215,0,0.5);padding:2px 8px;border-radius:8px;margin-left:4px;">👑 Elite</span>` : '';
        const iconGradient = t.prestige
            ? 'background:linear-gradient(135deg,#ffd700,#fbbf24,#f59e0b);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;'
            : 'background:linear-gradient(135deg,#756ad2,#a78bfa,#00d4ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;';
        const rewardIcon = t.prestige ? 'fa-crown' : 'fa-gift';
        const rewardColor = t.prestige ? 'color:var(--gold);' : '';
        grid.innerHTML += `<div class="title-card ${unlocked ? 'unlocked' : 'locked'} ${isEquipped ? 'equipped' : ''} ${t.prestige ? 'prestige-card' : ''}">
            <div class="title-card-inner">
                ${unlocked ? '<span class="xp-tier-badge">✅ Conquistado</span>' : (t.petTitle ? `<span class="locked-badge">🐾 Desbloqueie o Pet</span>` : `<span class="locked-badge">🔒 ${t.xpReq} XP</span>`)}
                ${t.gradient ? `<div style="text-align:center;margin-bottom:6px;font-size:1.6rem;"><i class="fa-solid ${t.gradientIcon || 'fa-star'}" style="${iconGradient}"></i></div>` : ''}
                <div class="title-name ${gradClass}">${t.name} ${petBadge}${prestigeBadge}</div>
                <div class="title-desc">${t.desc}</div>
                <div class="title-xp-req"><i class="fa-solid fa-star"></i> Requer: ${t.petTitle ? 'Pet Especial' : `${t.xpReq} XP`}</div>
                ${t.reward ? `<div class="title-reward" style="${rewardColor}"><i class="fa-solid ${rewardIcon}"></i> ${t.reward}</div>` : ''}
                ${t.prestige && unlocked ? `<div style="margin-top:8px;background:rgba(255,215,0,0.08);border:1px solid rgba(255,215,0,0.3);border-radius:8px;padding:8px;font-size:0.78rem;color:var(--gold);text-align:center;"><i class="fa-solid fa-wand-magic-sparkles"></i> Efeito dourado exclusivo ativo na topbar</div>` : ''}
                ${btnHtml}
            </div>
        </div>`;
    });
}
renderTitles(); updatePlayerTitle();

// ===================== EVENTOS DO MÊS =====================
function renderEventContent() {
    const container = document.getElementById('eventContainer');
    if (!container) return;
    
    const month = new Date().getMonth();
    const ev = monthlyEvents[month];
    
    if (!ev) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);"><i class="fa-solid fa-calendar-xmark" style="font-size:3rem;margin-bottom:15px;display:block;"></i><p>Nenhum evento disponível para este mês.</p></div>';
        return;
    }
    
    const maxXP = ev.tiers[ev.tiers.length - 1].xpReq;
    const pct = maxXP > 0 ? Math.min(100, Math.round((xp / maxXP) * 100)) : 100;
    
    let tiersHTML = ev.tiers.map(tier => {
        const unlocked = xp >= tier.xpReq;
        return `<div class="xp-tier-card ${unlocked ? 'unlocked' : 'locked'}">
            ${unlocked 
                ? `<span class="xp-tier-badge">✅ Desbloqueado</span>` 
                : `<span class="locked-badge">🔒 ${tier.xpReq} XP</span>`
            }
            <h4>${tier.icon} ${tier.label}</h4>
            <p>${tier.reward}</p>
        </div>`;
    }).join('');
    
    container.innerHTML = `
        <div class="event-banner" style="--event-color-a:${ev.colorA}; --event-color-b:${ev.colorB};">
            <div class="event-banner-icon">${ev.icon}</div>
            <div class="event-banner-text">
                <div class="event-banner-title">${ev.name}</div>
                <div class="event-banner-desc">${ev.desc}</div>
                <div class="xp-progress-wrap">
                    <div style="display:flex;justify-content:space-between;font-size:0.8rem;margin-bottom:4px;opacity:0.9;">
                        <span>Seu XP: <strong>${xp}</strong></span>
                        <span>${pct}% do tier máximo</span>
                    </div>
                    <div class="xp-bar-outer">
                        <div class="xp-bar-inner" style="width:${pct}%;--event-color-a:${ev.colorA};--event-color-b:${ev.colorB};"></div>
                    </div>
                </div>
            </div>
            <div class="event-banner-xp">
                <strong>${xp}</strong>
                <span>XP total</span>
            </div>
        </div>
        <div style="margin-top:4px;margin-bottom:8px;font-size:0.85rem;color:var(--text-muted);">
            <i class="fa-solid fa-info-circle"></i> XP é ganho automaticamente ao usar o Geekie (+1 XP a cada 6 segundos)
        </div>
        <div class="xp-tier-grid">${tiersHTML}</div>
    `;
}

// ===================== TÍTULO DA PÁGINA =====================
// Variáveis já declaradas no escopo global (linha 2971-2982)
// selectedFont, selectedIcon, savedTitle, availableFonts, availableIcons

function buildTitleUI() {
    const fontGrid = document.getElementById('fontGrid');
    const iconGrid = document.getElementById('iconGrid');
    
    if (!fontGrid || !iconGrid) return;
    
    fontGrid.innerHTML = '';
    iconGrid.innerHTML = '';
    
    // Renderizar fontes disponíveis
    availableFonts.forEach(f => {
        const el = document.createElement('div');
        el.className = `font-option ${selectedFont === f.family ? 'selected' : ''}`;
        el.style.fontFamily = f.family;
        el.innerHTML = `<div style="font-size:1.1rem;font-weight:700;">${f.sample}</div><div class="font-name">${f.label}</div>`;
        el.onclick = () => {
            selectedFont = f.family;
            buildTitleUI();
            updateTitlePreview();
        };
        fontGrid.appendChild(el);
    });
    
    // Renderizar ícones disponíveis
    availableIcons.forEach(ic => {
        const el = document.createElement('div');
        el.className = `icon-option ${selectedIcon === ic ? 'selected' : ''}`;
        el.innerHTML = `<i class="fa-solid ${ic}"></i>`;
        el.onclick = () => {
            selectedIcon = ic;
            buildTitleUI();
            updateTitlePreview();
        };
        iconGrid.appendChild(el);
    });
    
    // Restaurar valores salvos
    const titleInput = document.getElementById('pageTitleInput');
    if (titleInput) titleInput.value = savedTitle;
    
    updateTitlePreview();
}

function updateTitlePreview() {
    const nameEl = document.getElementById('previewNameEl');
    const iconEl = document.getElementById('previewIconEl');
    const titleInput = document.getElementById('pageTitleInput');
    
    if (nameEl) {
        nameEl.textContent = titleInput ? titleInput.value : savedTitle;
        nameEl.style.fontFamily = selectedFont;
    }
    
    if (iconEl) iconEl.className = `fa-solid ${selectedIcon}`;
}

function applyPageTitle() {
    const titleInput = document.getElementById('pageTitleInput');
    if (!titleInput) return;
    
    const newTitle = titleInput.value.trim();
    if (!newTitle) {
        showToast('Digite um nome para o título!', true);
        return;
    }
    
    savedTitle = newTitle;
    localStorage.setItem('geekiePageTitle', savedTitle);
    localStorage.setItem('geekieTitleFont', selectedFont);
    localStorage.setItem('geekieTitleIcon', selectedIcon);
    
    // Aplicar ao documento
    document.title = savedTitle;
    
    // Atualizar favicon se houver mapeamento
    const iconEmojiMap = {
        'fa-graduation-cap': '🎓',
        'fa-book-open': '📖',
        'fa-star': '⭐',
        'fa-brain': '🧠',
        'fa-fire': '🔥',
        'fa-bolt': '⚡',
        'fa-rocket': '🚀',
        'fa-laptop-code': '💻',
        'fa-atom': '⚛️',
        'fa-flask': '🧪',
        'fa-calculator': '🔢',
        'fa-infinity': '♾️',
        'fa-pencil': '✏️',
        'fa-trophy': '🏆',
        'fa-crown': '👑',
        'fa-heart': '❤️',
        'fa-globe': '🌍',
        'fa-satellite': '🛰️',
        'fa-moon': '🌙'
    };
    
    showToast(`✅ Título atualizado para "${savedTitle}"`);
}

// ===================== NOTE FONTS =====================
const noteFonts = [
    { family: 'Poppins', label: 'Poppins (Padrão)' },
    { family: 'Nunito', label: 'Nunito (Arredondada)' },
    { family: 'Comfortaa', label: 'Comfortaa (Suave)' },
    { family: 'Quicksand', label: 'Quicksand (Geométrica)' },
    { family: 'Josefin Sans', label: 'Josefin Sans (Fina)' },
    { family: 'Playfair Display', label: 'Playfair Display (Serifada)' },
    { family: 'Caveat', label: 'Caveat (Manuscrita)' },
    { family: 'Dancing Script', label: 'Dancing Script (Cursiva)' },
    { family: 'Patrick Hand', label: 'Patrick Hand' },
    { family: 'Indie Flower', label: 'Indie Flower' },
    { family: 'Shadows Into Light', label: 'Shadows Into Light' },
    { family: 'Kalam', label: 'Kalam' },
    { family: 'Architects Daughter', label: 'Architects Daughter' },
    { family: 'Fira Code', label: 'Fira Code (Mono)' },
    { family: 'Source Code Pro', label: 'Source Code Pro (Mono)' },
    { family: 'Orbitron', label: 'Orbitron (Sci-Fi)' },
];
let currentNoteFont = localStorage.getItem('geekieNoteFont') || 'Poppins';
function buildNoteFontPicker() {
    const picker = document.getElementById('noteFontPicker'); if (!picker) return; picker.innerHTML = '';
    noteFonts.forEach(f => {
        const btn = document.createElement('button');
        btn.className = `note-font-btn ${currentNoteFont === f.family ? 'active' : ''}`;
        btn.style.fontFamily = f.family;
        btn.textContent = f.label;
        btn.onclick = () => { currentNoteFont = f.family; localStorage.setItem('geekieNoteFont', f.family); applyNoteFont(); buildNoteFontPicker(); };
        picker.appendChild(btn);
    });
    applyNoteFont();
}
function applyNoteFont() {
    const nc = document.getElementById('noteContent');
    const nt = document.getElementById('noteTitle');
    if (nc) nc.style.fontFamily = `'${currentNoteFont}', sans-serif`;
    if (nt) nt.style.fontFamily = `'${currentNoteFont}', sans-serif`;
}
document.fonts.ready.then(() => buildNoteFontPicker());

// ===================== NOTAS =====================
let savedNotes = JSON.parse(localStorage.getItem('geekieNotes')) || [];
let currentNoteId = null;
function getNoteEls() { return { noteSelect: document.getElementById('noteSelect'), noteTitleInput: document.getElementById('noteTitle'), noteContentInput: document.getElementById('noteContent') }; }
function renderNotesDropdown() { const {noteSelect} = getNoteEls(); if (!noteSelect) return; noteSelect.innerHTML = '<option value="new">+ Nova Anotação...</option>'; savedNotes.forEach(note => { const opt = document.createElement('option'); opt.value = note.id; opt.textContent = note.title || 'Nota sem título'; if (note.id === currentNoteId) opt.selected = true; noteSelect.appendChild(opt); }); }
function loadSelectedNote() { const {noteSelect, noteTitleInput, noteContentInput} = getNoteEls(); if (!noteSelect) return; const id = noteSelect.value; if (id === 'new') { currentNoteId = null; noteTitleInput.value = ''; noteContentInput.value = ''; } else { const n = savedNotes.find(n => n.id == id); if (n) { currentNoteId = n.id; noteTitleInput.value = n.title; noteContentInput.value = n.content; } } }
function saveNote() { const {noteTitleInput, noteContentInput} = getNoteEls(); if (!noteTitleInput) return; const title = noteTitleInput.value.trim() || 'Nota sem título'; const content = noteContentInput.value; if (!content.trim() && !noteTitleInput.value.trim()) { showToast('A nota está vazia!', true); return; } if (currentNoteId === null) { const nn = { id: Date.now().toString(), title, content, date: new Date().toLocaleDateString() }; savedNotes.push(nn); currentNoteId = nn.id; showToast('Nova anotação salva!'); } else { const idx = savedNotes.findIndex(n => n.id === currentNoteId); if (idx !== -1) { savedNotes[idx].title = title; savedNotes[idx].content = content; showToast('Anotação atualizada!'); } } localStorage.setItem('geekieNotes', JSON.stringify(savedNotes)); renderNotesDropdown(); }
function deleteNote() { const {noteTitleInput, noteContentInput} = getNoteEls(); if (!noteTitleInput) return; if (currentNoteId === null) { noteTitleInput.value = ''; noteContentInput.value = ''; return; } if (confirm('Excluir esta anotação permanentemente?')) { savedNotes = savedNotes.filter(n => n.id !== currentNoteId); localStorage.setItem('geekieNotes', JSON.stringify(savedNotes)); currentNoteId = null; noteTitleInput.value = ''; noteContentInput.value = ''; renderNotesDropdown(); showToast('Anotação excluída!'); } }
function copyNoteContent() { const {noteContentInput} = getNoteEls(); if (!noteContentInput || !noteContentInput.value) { showToast('Nada para copiar!', true); return; } navigator.clipboard.writeText(noteContentInput.value).then(() => showToast('Conteúdo copiado!')).catch(() => showToast('Erro ao copiar.', true)); }
async function pasteNoteContent() { const {noteContentInput} = getNoteEls(); if (!noteContentInput) return; try { const text = await navigator.clipboard.readText(); const s = noteContentInput.selectionStart, e = noteContentInput.selectionEnd; noteContentInput.value = noteContentInput.value.substring(0, s) + text + noteContentInput.value.substring(e); showToast('Colado!'); } catch { showToast('Use Ctrl+V para colar.', true); } }
function exportNote() { const {noteTitleInput, noteContentInput} = getNoteEls(); if (!noteContentInput || !noteContentInput.value) { showToast('Nota vazia!', true); return; } const blob = new Blob([noteContentInput.value], { type: 'text/plain;charset=utf-8' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${noteTitleInput.value.trim() || 'Anotação'}.txt`; a.click(); showToast('Exportado!'); }
function importNote(event) { const {noteTitleInput, noteContentInput, noteSelect} = getNoteEls(); const file = event.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = e => { currentNoteId = null; if(noteTitleInput) noteTitleInput.value = file.name.replace('.txt', ''); if(noteContentInput) noteContentInput.value = e.target.result; document.getElementById('importNoteFile').value = ''; if(noteSelect) noteSelect.value = 'new'; showToast('Importado! Lembre de salvar.'); }; reader.readAsText(file); }
renderNotesDropdown();

// ===================== POMODORO =====================
let timerInterval, timeLeft = 25*60, isTimerRunning = false, isBreak = false, cycles = 0;
const alarmSound = document.getElementById('alarmSound');
function getTimerEls() { return { timerDisplay: document.getElementById('timerDisplay'), timerMode: document.getElementById('timerMode'), btnStartTimer: document.getElementById('btnStartTimer'), pomodoroCount: document.getElementById('pomodoroCount') }; }
function updateTimerDisplay() { const {timerDisplay} = getTimerEls(); if (!timerDisplay) return; const t = `${Math.floor(timeLeft/60).toString().padStart(2,'0')}:${(timeLeft%60).toString().padStart(2,'0')}`; timerDisplay.textContent = t; document.title = `${t} - ${savedTitle}`; }
function setCustomTimer(mins) { const {timerMode, btnStartTimer} = getTimerEls(); clearInterval(timerInterval); isTimerRunning = false; isBreak = false; timeLeft = mins * 60; if(timerMode) { timerMode.textContent = `Modo: Foco (${mins} min)`; timerMode.style.color = 'var(--text-muted)'; } if(btnStartTimer) btnStartTimer.innerHTML = '<i class="fa-solid fa-play"></i> Iniciar'; updateTimerDisplay(); showToast(`Timer ajustado para ${mins} minutos!`); }

// Notificação nativa (não bloqueia UI)
function sendPomodoroNotification(msg) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('⏱️ Pomodoro', { body: msg, icon: 'https://i.postimg.cc/gcHHYqtC/fire-geekie.png' });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(p => { if (p === 'granted') new Notification('⏱️ Pomodoro', { body: msg }); });
    }
}

// Tempo de estudo acumulado
let studySeconds = parseInt(localStorage.getItem('geekieStudySeconds') || '0');
const _studyDate = localStorage.getItem('geekieStudyDate');
const _today = new Date().toDateString();
if (_studyDate !== _today) { studySeconds = 0; localStorage.setItem('geekieStudyDate', _today); }

function updateStudyTimeDisplay() {
    const el = document.getElementById('studyTimeDisplay');
    if (!el) return;
    const h = Math.floor(studySeconds / 3600);
    const m = Math.floor((studySeconds % 3600) / 60);
    el.textContent = `${h}h ${m.toString().padStart(2,'0')}min`;
}

function startTimer() {
    // Solicitar permissão de notificação ao iniciar
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
    const {btnStartTimer, timerMode, pomodoroCount} = getTimerEls();
    if (isTimerRunning) return;
    isTimerRunning = true;
    if(btnStartTimer) btnStartTimer.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Rodando';
    timerInterval = setInterval(() => {
        timeLeft--;
        if (!isBreak) { studySeconds++; if (studySeconds % 30 === 0) { localStorage.setItem('geekieStudySeconds', studySeconds); updateStudyTimeDisplay(); } }
        updateTimerDisplay();
        if (timeLeft <= 0) {
            clearInterval(timerInterval); isTimerRunning = false;
            if(alarmSound) alarmSound.play();
            if (!isBreak) {
                cycles++;
                if(pomodoroCount) pomodoroCount.textContent = cycles;
                isBreak = true; timeLeft = 5*60;
                if(timerMode) { timerMode.textContent = 'Modo: Pausa Curta (5 min)'; timerMode.style.color = 'var(--accent)'; }
                earnCoins(10, 'Pomodoro concluído!');
                localStorage.setItem('geekieStudySeconds', studySeconds);
                updateStudyTimeDisplay();
                sendPomodoroNotification('Foco concluído! Pausa de 5 min. +10 🪙');
                showToast('⏱️ Foco concluído! Pausa de 5 min. +10 🪙');
            } else {
                isBreak = false; timeLeft = 25*60;
                if(timerMode) { timerMode.textContent = 'Modo: Foco (25 min)'; timerMode.style.color = 'var(--text-muted)'; }
                sendPomodoroNotification('Pausa concluída! Hora de focar.');
                showToast('☀️ Pausa concluída! Hora de focar.');
            }
            const {btnStartTimer: b2} = getTimerEls();
            if(b2) b2.innerHTML = '<i class="fa-solid fa-play"></i> Iniciar';
            updateTimerDisplay();
        }
    }, 1000);
}
function pauseTimer() { const {btnStartTimer} = getTimerEls(); clearInterval(timerInterval); isTimerRunning = false; if(btnStartTimer) btnStartTimer.innerHTML = '<i class="fa-solid fa-play"></i> Continuar'; localStorage.setItem('geekieStudySeconds', studySeconds); }
function resetTimer() { const {timerMode, btnStartTimer} = getTimerEls(); clearInterval(timerInterval); isTimerRunning = false; isBreak = false; timeLeft = 25*60; if(timerMode) { timerMode.textContent = 'Modo: Foco (25 min)'; timerMode.style.color = 'var(--text-muted)'; } if(btnStartTimer) btnStartTimer.innerHTML = '<i class="fa-solid fa-play"></i> Iniciar'; updateTimerDisplay(); }
updateTimerDisplay();
updateStudyTimeDisplay();

// ===================== GOALS/TODO =====================
function renderTodos() {
    const todoListEl = document.getElementById('todoList'); if (!todoListEl) return;
    todoListEl.innerHTML = '';
    let filtered = todos;
    if (todoFilter === 'pending') filtered = todos.filter(t => !t.completed);
    if (todoFilter === 'done') filtered = todos.filter(t => t.completed);
    if (todoFilter === 'alta') filtered = todos.filter(t => t.priority === 'alta' && !t.completed);
    // Ordenar: alta > media > baixa entre os pendentes
    filtered = [...filtered].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const order = { alta: 0, media: 1, baixa: 2 };
        return (order[a.priority] || 1) - (order[b.priority] || 1);
    });
    filtered.forEach((todo) => {
        const realIdx = todos.indexOf(todo);
        const priorityMap = { alta: '🔴', media: '🟡', baixa: '🟢' };
        const priorityLabel = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };
        const pBadge = todo.priority ? `<span class="todo-priority-badge priority-${todo.priority}">${priorityMap[todo.priority]} ${priorityLabel[todo.priority]}</span>` : '';
        const li = document.createElement('li'); li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.innerHTML = `<span>${pBadge}${todo.text}</span><div class="todo-actions"><i class="fa-solid fa-check check" onclick="toggleTodo(${realIdx})"></i><i class="fa-solid fa-trash delete" onclick="deleteTodo(${realIdx})"></i></div>`;
        todoListEl.appendChild(li);
    });
    localStorage.setItem('geekieTodos', JSON.stringify(todos));
    const total = todos.length, done = todos.filter(t => t.completed).length;
    document.getElementById('todoProgress').textContent = `${done}/${total}`;
    document.getElementById('todoProgressBar').style.width = total > 0 ? `${(done/total)*100}%` : '0%';
}
function filterTodos(f) { todoFilter = f; renderTodos(); }
function addTodo() {
    const t = document.getElementById('todoInput').value.trim();
    const p = document.getElementById('todoPriority') ? document.getElementById('todoPriority').value : 'media';
    if (t) { todos.push({text:t, completed:false, priority: p}); document.getElementById('todoInput').value=''; renderTodos(); }
}
function handleTodoKeyPress(e) { if (e.key==='Enter') addTodo(); }
function toggleTodo(i) {
    const wasCompleted = todos[i].completed;
    todos[i].completed = !todos[i].completed;
    if (!wasCompleted && todos[i].completed) earnCoins(5, 'Meta concluída!');
    renderTodos();
}
function deleteTodo(i) { todos.splice(i,1); renderTodos(); }
renderTodos();

// ===================== FLASHCARDS =====================
let flashcardsData = JSON.parse(localStorage.getItem('geekieFlashcards'));
if (!flashcardsData || !flashcardsData.length) { flashcardsData = [{ front: 'O que é a Mitocôndria?', back: 'Organela responsável pela respiração celular (energia).', rating: null }]; localStorage.setItem('geekieFlashcards', JSON.stringify(flashcardsData)); }
let flashcardsView = [...flashcardsData]; // pode ser filtrado/embaralhado
let currentCardIndex = 0;
let cardIsFlipped = false;

function getFlashEls() { return { flashcardEl: document.getElementById('flashcard'), cardFront: document.getElementById('cardFront'), cardBack: document.getElementById('cardBack'), cardCounter: document.getElementById('cardCounter') }; }
function saveFlashcards() { localStorage.setItem('geekieFlashcards', JSON.stringify(flashcardsData)); }

function updateFlashcardStats() {
    const total = flashcardsData.length;
    const easy = flashcardsData.filter(c => c.rating === 'easy').length;
    const hard = flashcardsData.filter(c => c.rating === 'hard').length;
    const elTotal = document.getElementById('statTotal');
    const elEasy = document.getElementById('statEasy');
    const elHard = document.getElementById('statHard');
    if (elTotal) elTotal.textContent = total;
    if (elEasy) elEasy.textContent = easy;
    if (elHard) elHard.textContent = hard;
}

function updateCardDisplay() {
    const {flashcardEl, cardFront, cardBack, cardCounter} = getFlashEls();
    if (!flashcardEl) return;
    flashcardEl.classList.remove('is-flipped');
    cardIsFlipped = false;
    const ratingEl = document.getElementById('flashcardRating');
    if (ratingEl) ratingEl.style.display = 'none';
    setTimeout(() => {
        if (!flashcardsView.length) {
            cardFront.textContent = 'Nenhum flashcard.'; cardBack.textContent = 'Adicione acima!'; cardCounter.textContent = '0 / 0';
        } else {
            if (currentCardIndex >= flashcardsView.length) currentCardIndex = Math.max(0, flashcardsView.length-1);
            cardFront.textContent = flashcardsView[currentCardIndex].front;
            cardBack.textContent = flashcardsView[currentCardIndex].back;
            cardCounter.textContent = `${currentCardIndex+1} / ${flashcardsView.length}`;
            // Indicar rating existente
            const cur = flashcardsView[currentCardIndex];
            if (cur.rating === 'easy') cardFront.style.borderBottom = '2px solid var(--success)';
            else if (cur.rating === 'hard') cardFront.style.borderBottom = '2px solid var(--danger)';
            else cardFront.style.borderBottom = '';
        }
    }, 150);
    updateFlashcardStats();
}

function flipCard() {
    const {flashcardEl} = getFlashEls();
    if (!flashcardEl || !flashcardsView.length) return;
    flashcardEl.classList.toggle('is-flipped');
    cardIsFlipped = !cardIsFlipped;
    const ratingEl = document.getElementById('flashcardRating');
    if (ratingEl) ratingEl.style.display = cardIsFlipped ? 'flex' : 'none';
}

function rateCard(rating) {
    if (!flashcardsView.length) return;
    const cur = flashcardsView[currentCardIndex];
    // Atualiza no array original
    const orig = flashcardsData.find(c => c.front === cur.front && c.back === cur.back);
    if (orig) { orig.rating = rating; cur.rating = rating; }
    saveFlashcards();
    updateFlashcardStats();
    // Vai para o próximo automaticamente
    if (currentCardIndex < flashcardsView.length - 1) {
        currentCardIndex++;
        updateCardDisplay();
    } else {
        showToast(rating === 'easy' ? '✅ Ótimo! Você finalizou o baralho!' : '🔴 Revise os difíceis!');
        updateCardDisplay();
    }
}

function shuffleFlashcards() {
    flashcardsView = [...flashcardsData].sort(() => Math.random() - 0.5);
    currentCardIndex = 0;
    updateCardDisplay();
    showToast('🔀 Flashcards embaralhados!');
}

function filterHardCards() {
    const hard = flashcardsData.filter(c => c.rating === 'hard');
    if (!hard.length) { showToast('Nenhum card marcado como difícil!', true); return; }
    flashcardsView = hard;
    currentCardIndex = 0;
    updateCardDisplay();
    showToast(`🔴 Mostrando ${hard.length} cards difíceis!`);
}

function resetCardStats() {
    if (!confirm('Resetar avaliações de todos os flashcards?')) return;
    flashcardsData.forEach(c => c.rating = null);
    flashcardsView = [...flashcardsData];
    saveFlashcards();
    currentCardIndex = 0;
    updateCardDisplay();
    showToast('Stats resetadas!');
}

function nextCard() {
    if (currentCardIndex < flashcardsView.length-1) { currentCardIndex++; updateCardDisplay(); }
}
function prevCard() {
    if (currentCardIndex > 0) { currentCardIndex--; updateCardDisplay(); }
}
function addFlashcard() {
    const f = document.getElementById('newCardFront'), b = document.getElementById('newCardBack');
    if (f.value.trim() && b.value.trim()) {
        flashcardsData.push({front:f.value.trim(),back:b.value.trim(),rating:null});
        saveFlashcards();
        f.value=''; b.value='';
        flashcardsView = [...flashcardsData];
        currentCardIndex=flashcardsView.length-1;
        updateCardDisplay();
        showToast('Flashcard Criado!');
    } else alert('Preencha frente e verso!');
}
function deleteCurrentCard() {
    if (!flashcardsView.length) return;
    if (confirm('Excluir este flashcard?')) {
        const cur = flashcardsView[currentCardIndex];
        const idx = flashcardsData.findIndex(c => c.front === cur.front && c.back === cur.back);
        if (idx !== -1) flashcardsData.splice(idx, 1);
        saveFlashcards();
        flashcardsView = [...flashcardsData];
        if (currentCardIndex >= flashcardsView.length) currentCardIndex = Math.max(0, flashcardsView.length-1);
        updateCardDisplay();
        showToast('Excluído!');
    }
}
updateCardDisplay();

// ===================== AMBIENT AUDIO =====================
const ambientSounds = [
    { id: 'brown-noise', label: 'Ruído Marrom', icon: '🌊', category: 'noise', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_24a56d9595.mp3?filename=brown-noise-9005.mp3' },
    { id: 'rain', label: 'Chuva Suave', icon: '🌧️', category: 'nature', url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=light-rain-109591.mp3' },
    { id: 'thunder', label: 'Trovão', icon: '⚡', category: 'nature', url: 'https://cdn.pixabay.com/download/audio/2022/10/30/audio_711e25aff7.mp3?filename=thunder-and-rain-116349.mp3' },
    { id: 'fire', label: 'Fogueira', icon: '🔥', category: 'nature', url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=fireplace-crackling-7363.mp3' },
    { id: 'wind', label: 'Vento', icon: '💨', category: 'nature', url: 'https://cdn.pixabay.com/download/audio/2022/03/19/audio_56edb8e833.mp3?filename=wind-sound-effect-1-9156.mp3' },
    { id: 'birds', label: 'Pássaros', icon: '🐦', category: 'nature', url: 'https://cdn.pixabay.com/download/audio/2022/02/07/audio_5f2eb39ab5.mp3?filename=birds-chirping-calm-20934.mp3' },
    { id: 'ocean', label: 'Oceano', icon: '🌊', category: 'nature', url: 'https://cdn.pixabay.com/download/audio/2022/06/01/audio_be774f9d86.mp3?filename=calm-sea-ambience-10028.mp3' },
    { id: 'cafe', label: 'Cafeteria', icon: '☕', category: 'urban', url: 'https://cdn.pixabay.com/download/audio/2022/04/27/audio_1aa0564223.mp3?filename=crowd-talking-cafeteria-6263.mp3' },
];
let ambientAudios = {}, ambientVolumes = {}, masterVol = 0.5;
function initAmbient() {
    ambientSounds.forEach(s => { const audio = new Audio(); audio.loop = true; audio.preload = 'none'; audio.src = s.url; audio.volume = masterVol; ambientAudios[s.id] = audio; ambientVolumes[s.id] = 0.5; });
    renderAmbientGrid(); renderAmbientMixer();
}
function renderAmbientGrid() { const grid = document.getElementById('ambientGrid'); if (!grid) return; grid.innerHTML = ''; ambientSounds.forEach(s => { const isPlaying = ambientAudios[s.id] && !ambientAudios[s.id].paused; grid.innerHTML += `<div class="ambient-card ${isPlaying ? 'playing' : ''}" onclick="toggleAmbientSound('${s.id}')" id="ambient-card-${s.id}"><span class="ambient-icon">${s.icon}</span><span class="ambient-label">${s.label}</span>${isPlaying ? '<span style="font-size:0.7rem;color:var(--accent);margin-top:4px;">▶ Tocando</span>' : ''}</div>`; }); }
function renderAmbientMixer() { const rows = document.getElementById('ambientMixerRows'); if (!rows) return; rows.innerHTML = ''; ambientSounds.forEach(s => { const isPlaying = ambientAudios[s.id] && !ambientAudios[s.id].paused; const vol = Math.round((ambientVolumes[s.id] || 0.5) * 100); rows.innerHTML += `<div class="ambient-mixer-row" style="opacity:${isPlaying ? 1 : 0.4}"><span>${s.icon} ${s.label}</span><input type="range" min="0" max="1" step="0.05" value="${ambientVolumes[s.id] || 0.5}" onchange="setAmbientVolume('${s.id}', this.value)" style="accent-color:var(--accent);"><span class="vol-value">${vol}%</span></div>`; }); }
function toggleAmbientSound(id) { const audio = ambientAudios[id]; if (audio.paused) { audio.volume = (ambientVolumes[id] || 0.5) * masterVol; audio.play().catch(() => {}); } else { audio.pause(); } renderAmbientGrid(); renderAmbientMixer(); }
function setAmbientVolume(id, val) { ambientVolumes[id] = parseFloat(val); ambientAudios[id].volume = parseFloat(val) * masterVol; renderAmbientMixer(); }
function changeMasterVolume(val) { masterVol = parseFloat(val); document.getElementById('masterVolLabel').textContent = Math.round(masterVol * 100) + '%'; Object.keys(ambientAudios).forEach(id => { ambientAudios[id].volume = (ambientVolumes[id] || 0.5) * masterVol; }); }
function stopAllAmbient() { Object.values(ambientAudios).forEach(a => { a.pause(); a.currentTime = 0; }); renderAmbientGrid(); renderAmbientMixer(); showToast('Todos os sons parados!'); }
function presetRelax() { stopAllAmbient(); setTimeout(() => { ['rain', 'fire'].forEach(id => { ambientVolumes[id] = 0.4; ambientAudios[id].volume = 0.4 * masterVol; ambientAudios[id].play().catch(() => {}); }); renderAmbientGrid(); renderAmbientMixer(); showToast('Preset Relaxar ativado!'); }, 200); }
function presetFocus() { stopAllAmbient(); setTimeout(() => { ['brown-noise'].forEach(id => { ambientVolumes[id] = 0.6; ambientAudios[id].volume = 0.6 * masterVol; ambientAudios[id].play().catch(() => {}); }); renderAmbientGrid(); renderAmbientMixer(); showToast('Preset Foco ativado!'); }, 200); }
function presetNature() { stopAllAmbient(); setTimeout(() => { ['rain', 'birds', 'wind'].forEach(id => { ambientVolumes[id] = 0.35; ambientAudios[id].volume = 0.35 * masterVol; ambientAudios[id].play().catch(() => {}); }); renderAmbientGrid(); renderAmbientMixer(); showToast('Preset Natureza ativado!'); }, 200); }
initAmbient();

// ===================== ENHANCED CHARACTER SYSTEM =====================
const charsData = [
    { group: 'Matemática', icon: 'fa-calculator', iconBg: 'rgba(0,255,136,0.15)', iconColor: '#00ff88',
      categories: [
        { name: 'Operadores Básicos', chars: ['±','×','÷','≈','≠','≤','≥','∞','√','∛','°','²','³','½','¼','¾','⅓','⅔','⅛','⅜'] },
        { name: 'Álgebra & Lógica', chars: ['∀','∃','∈','∉','⊂','⊃','∪','∩','∅','∫','∑','∏','∴','∵','∇','∂','¬','∧','∨'] },
        { name: 'Geometria', chars: ['△','□','○','◇','▲','■','●','◆','⊥','∥','∠','⌀','≅','∼','∝','∢','▱','▰','◯','⬡'] },
        { name: 'Frações', chars: ['½','⅓','⅔','¼','¾','⅕','⅖','⅗','⅘','⅙','⅚','⅐','⅑','⅒','↉','%','‰','‱'] },
        { name: 'Números Romanos', chars: ['Ⅰ','Ⅱ','Ⅲ','Ⅳ','Ⅴ','Ⅵ','��','Ⅷ','Ⅸ','Ⅹ','Ⅺ','Ⅻ','Ⅼ','Ⅽ','Ⅾ','Ⅿ'] },
        { name: 'Subscritos/Sobrescritos', chars: ['₀','₁','₂','₃','₄','₅','₆','₇','₈','₉','⁺','⁻','⁼','⁽','⁾','ⁿ','ᵃ','ᵇ','ᶜ','ᵈ'] }
    ]},
    { group: 'Letras & Alfabetos', icon: 'fa-font', iconBg: 'rgba(123,44,191,0.15)', iconColor: '#7b2cbf',
      categories: [
        { name: 'Alfabeto Grego', chars: ['α','β','γ','δ','ε','ζ','η','θ','ι','κ','λ','μ','ν','ξ','π','ρ','σ','τ','φ','χ','ψ','ω','Δ','Θ','Λ','Π','Σ','Φ','Ω'] },
        { name: 'Grego Minúsculo', chars: ['α','β','γ','δ','ε','ζ','η','θ','ι','κ','λ','μ','ν','ξ','ο','π','ρ','σ','τ','υ','φ','χ','ψ','ω'] },
        { name: 'Grego Maiúsculo', chars: ['Α','Β','Γ','Δ','Ε','Ζ','Η','Θ','Ι','Κ','Λ','Μ','Ν','Ξ','Ο','Π','Ρ','Σ','Τ','Υ','Φ','Χ','Ψ','Ω'] },
        { name: 'Letras Circulares', chars: ['①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩','⑪','⑫','⑬','⑭','⑮','⑯','⑰','⑱','⑳','㉑','㉒'] },
        { name: 'Negrito Circular', chars: ['❶','❷','❸','❹','❺','❻','❼','❽','❾','❿','⓫','⓬','⓭','⓮','⓯','⓰','⓱','⓲','⓳','⓴'] }
    ]},
    { group: 'Setas & Direção', icon: 'fa-arrows-alt', iconBg: 'rgba(0,212,255,0.15)', iconColor: '#00d4ff',
      categories: [
        { name: 'Setas Básicas', chars: ['→','←','↑','↓','↔','↕','⇒','⇐','⇑','⇓','⇔','⇕'] },
        { name: 'Setas Estilizadas', chars: ['➜','➡','➞','➟','➠','➢','➣','➤','➥','➦','➧','➨','➩','➪','➫','➬'] },
        { name: 'Setas Curvas', chars: ['↶','↷','↺','↻','⟲','⟳','➲','➳','➴','➵','➶','➷','➸','➹','➺','➻'] },
        { name: 'Setas Longas', chars: ['⟵','⟶','⟷','⟸','⟹','⟺','⟻','⟼','⟽','⟾','⟿','⤀','⤁','⤂','⤃','⤄'] }
    ]},
    { group: 'Ciência & Acadêmico', icon: 'fa-flask', iconBg: 'rgba(255,107,107,0.15)', iconColor: '#ff6b6b',
      categories: [
        { name: 'Química & Física', chars: ['H₂O','CO₂','E=mc²','F=ma','DNA','RNA','ATP','♀','♂','ΔH','pH','mol','J/mol','kJ','cal','eV','Ω','Å','K','°C'] },
        { name: 'Astronomia', chars: ['☀','☽','☾','���','☆','☉','☿','♀','♂','♃','♄','♅','♆','♇','⚳','⚴','⚵','⚶','⚷','⚸'] },
        { name: 'Unidades SI', chars: ['㎜','㎝','㎞','㎎','㎏','㎡','㎢','㎣','㎤','㎥','㎦','㎧','㎨','㎩','㎪','㎫','㎬','㎭','㎮','㎯'] }
    ]},
    { group: 'Música & Som', icon: 'fa-music', iconBg: 'rgba(255,193,7,0.15)', iconColor: '#ffc107',
      categories: [
        { name: 'Notas Musicais', chars: ['♩','♪','♫','♬','♭','♯'] }
    ]},
    { group: 'Moedas & Economia', icon: 'fa-coins', iconBg: 'rgba(76,175,80,0.15)', iconColor: '#4caf50',
      categories: [
        { name: 'Moedas Mundiais', chars: ['R$','$','€','£','¥','₿','¢','₹','₽','₩','₪','₫','₭','₮'] },
        { name: 'Símbolos Financeiros', chars: ['%','‰','‱'] }
    ]},
    { group: 'Pontuação & Tipografia', icon: 'fa-quote-right', iconBg: 'rgba(156,39,176,0.15)', iconColor: '#9c27b0',
      categories: [
        { name: 'Aspas Especiais', chars: ['«','»','„','‟','‛','\u2019','「','」','『','』','【','】'] },
        { name: 'Travessões & Espaçamento', chars: ['—','–','…','·','•','‣','⁂','※','⁑','⁕','⁖','⁘','⁙','⁛','⁜','⁝'] },
        { name: 'Marcadores & Referência', chars: ['†','‡','§','¶','©','®','™','℠','№','℗','℞','℮','⏎','⏻','⏼','⏽'] }
    ]},
    { group: 'Formas & Geométricos', icon: 'fa-shapes', iconBg: 'rgba(255,152,0,0.15)', iconColor: '#ff9800',
      categories: [
        { name: 'Quadrados & Retângulos', chars: ['□','▪','▫','◼','◻','◾','◽','▰','▱','◧','◨','◩','◪','◫','◬','◭'] },
        { name: 'Triângulos', chars: ['△','▽','▲','▼','▷','◁','▶','◀','◢','◣','◤','◥','◸','◹','◺','◻'] },
        { name: 'Círculos & Pontos', chars: ['○','●','◐','◑','◒','◓','◔','◕','◖','◗','◎','●','◉','◌','◍','◎'] },
        { name: 'Diamantes', chars: ['◇','◆','⬡','⬢','⬣','⬤','⬥','⬦','⬧','⬨','⬩','⬪','⬫','⬬','⬭','⬮'] }
    ]},
    { group: 'Decorações & Ornamentos', icon: 'fa-wand-magic-sparkles', iconBg: 'rgba(233,30,99,0.15)', iconColor: '#e91e63',
      categories: [
        { name: 'Estrelas', chars: ['✦','✧','★','☆','⋆','✡','✶','✷','✸','✹','✺','✻','✼','✽','✾','✿'] },
        { name: 'Flores & Natureza', chars: ['❀','❁','❂','❃','❄','❅','❆','❇','❈','❉','❊','❋','❍','❏','❐','❑'] }
    ]},
    { group: 'Coraçãos & Emoticons', icon: 'fa-heart', iconBg: 'rgba(244,67,54,0.15)', iconColor: '#f44336',
      categories: [
        { name: 'Corações', chars: ['♥','❤','💔','❣','❥','❦','❧','♡','💕','💞','💓','💗','💖','💘','💝','💟'] },
        { name: 'Emoticons Texto', chars: ['☺','☹','☻','😐','😎','😕','😊','😃','😁','😂','😅','😆','😇','😈','😉','😋'] }
    ]},
    { group: 'Xadrez & Jogos', icon: 'fa-chess', iconBg: 'rgba(103,58,183,0.15)', iconColor: '#673ab7',
      categories: [
        { name: 'Peças de Xadrez', chars: ['♔','♕','♖','♗','♘','♙','♚','♛','♜','♝','♞','♟'] },
        { name: 'Cartas & Naipes', chars: ['♠','♣','♥','♦','🂡','🂢','🂣','🂤','🂥','🂦','🂧','🂨'] },
        { name: 'Dados & Jogos', chars: ['⚀','⦁','⚂','⚃','⚄','⚅','🎲','🎯','🎪','🎭','🎨','🎬'] }
    ]},
    { group: 'Tecnologia & Código', icon: 'fa-laptop-code', iconBg: 'rgba(0,188,212,0.15)', iconColor: '#00bcd4',
      categories: [
        { name: 'Teclado & Atalhos', chars: ['⌘','⌥','⇧','⌃','⎋','⇥','⇤','⌫','⌦','⎋','␣','⏎','⇤','⇥','⇪','⌧'] },
        { name: 'Interface & UI', chars: ['☰','☱','☲','☳','☴','☵','☶','☷','▤','▥','▦','▧','▨','▩','▣','▢'] }
    ]},
    { group: 'Tempo & Clima', icon: 'fa-cloud-sun', iconBg: 'rgba(139,195,74,0.15)', iconColor: '#8bc34a',
      categories: [
        { name: 'Clima', chars: ['☀','☁','☂','☃','☄','⚡','❄','⛄','☔','☣','☤','☥','🌤','⛅','🌥','☈'] },
        { name: 'Fases da Lua', chars: ['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘','☽','☾','◐','◑','◒','◓','◔','◕'] }
    ]},
    { group: 'Religião & Símbolos', icon: 'fa-om', iconBg: 'rgba(121,85,72,0.15)', iconColor: '#795548',
      categories: [
        { name: 'Símbolos Religiosos', chars: ['☯','✡','☸','☪','✝','☦','☧','☨','☩','☪','☫','☬','☭','☮','☯','☰'] },
        { name: 'Astrologia', chars: ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','⛎','☌','☍','⚷'] }
    ]},
    { group: 'Marcadores & Checks', icon: 'fa-check-double', iconBg: 'rgba(0,150,136,0.15)', iconColor: '#009688',
      categories: [
        { name: 'Checks & Cruzados', chars: ['✓','✔','✗','✘','☐','☑','☒','⬚','⬛','⬜','▪','▫','◽','◾','▮','▯'] },
        { name: 'Marcadores Lista', chars: ['•','◦','▪','▫','‣','⁃','⁌','⁍','∙','∘','·','※','⁂','⁎','⁏','⁕'] }
    ]},
    { group: 'Emojis Populares', icon: 'fa-face-smile', iconBg: 'rgba(255,87,34,0.15)', iconColor: '#ff5722',
      categories: [
        { name: 'Rostos Expressivos', chars: ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩'] },
        { name: 'Gestos & Mãos', chars: ['👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆'] },
        { name: 'Animais', chars: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔'] },
        { name: 'Comida & Bebida', chars: ['🍎','🍕','🍔','🍟','🌮','🌯','🍜','🍣','🍦','🍰','🎂','🍿','🍩','🍪','☕','🍷'] },
        { name: 'Transporte', chars: ['🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐','🛻','🚚','🚛','🚜','🛵','🏍️'] },
        { name: 'Objetos', chars: ['📱','💻','⌨️','🖥️','🖨️','📷','📸','📺','📻','🔔','🔕','⏰','⌛','⏳','📁','📂'] }
    ]}
];

let charFavorites = JSON.parse(localStorage.getItem('charFavorites') || '[]');
let charHistory = JSON.parse(localStorage.getItem('charHistory') || '[]');
let activeGroupFilter = 'all';
let expandedCategories = new Set();
let tooltipEl = null;

function initEnhancedCharsSystem() {
    renderCharFilters();
    renderAllCategories();
    updateCharStats();
    renderFavorites();
    renderHistory();
    createTooltip();
}

function createTooltip() {
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'char-tooltip';
    tooltipEl.innerHTML = '<div class="char-tooltip-preview"></div><div class="char-tooltip-name"></div><div class="char-tooltip-code"></div><div class="char-tooltip-hint">Clique para copiar</div>';
    document.body.appendChild(tooltipEl);
}

function renderCharFilters() {
    const container = document.getElementById('charsFilterBar');
    if (!container) return;
    
    let html = '<button class="char-filter-btn active" data-group="all" onclick="setGroupFilter(\'all\')"><i class="fa-solid fa-border-all"></i> Todos <span class="filter-count" id="countAll">0</span></button>';
    
    charsData.forEach(function(group) {
        const totalChars = group.categories.reduce(function(sum, cat) { return sum + cat.chars.length; }, 0);
        html += '<button class="char-filter-btn" data-group="' + group.group + '" onclick="setGroupFilter(\'' + group.group + '\')"><i class="fa-solid ' + group.icon + '"></i> ' + group.group + ' <span class="filter-count">' + totalChars + '</span></button>';
    });
    
    container.innerHTML = html;
    document.getElementById('countAll').textContent = getTotalCharCount();
}

function getTotalCharCount() {
    return charsData.reduce(function(sum, group) { 
        return sum + group.categories.reduce(function(catSum, cat) { return catSum + cat.chars.length; }, 0); 
    }, 0);
}

function updateCharStats() {
    const totalEl = document.getElementById('totalCharsCount');
    const catsEl = document.getElementById('totalCatsCount');
    const favEl = document.getElementById('favCount');
    
    if (totalEl) totalEl.textContent = getTotalCharCount();
    if (catsEl) catsEl.textContent = charsData.reduce(function(s, g) { return s + g.categories.length; }, 0);
    if (favEl) favEl.textContent = charFavorites.length;
}



function renderAllCategories(filter, groupFilter) {
    filter = filter || '';
    groupFilter = groupFilter || 'all';
    
    const container = document.getElementById('charsCategoriesContainer');
    if (!container) return;
    
    let html = '';
    let hasVisibleContent = false;
    const q = filter.toLowerCase().trim();
    
    charsData.forEach(function(group, gi) {
        if (groupFilter !== 'all' && group.group !== groupFilter) return;
        
        group.categories.forEach(function(category, ci) {
            let filteredChars = category.chars;
            if (q) {
                filteredChars = category.chars.filter(function(c) { 
                    return c.toLowerCase().includes(q) || category.name.toLowerCase().includes(q);
                });
            }
            
            if (filteredChars.length === 0) return;
            hasVisibleContent = true;
            
            const catId = 'cat-' + gi + '-' + ci;
            const isOpen = expandedCategories.has(catId) || !q;
            
            html += '<div class="char-accordion ' + (isOpen ? 'open' : '') + '" data-cat="' + catId + '">' +
                '<div class="char-accordion-header" onclick="toggleCategory(\'' + catId + '\')">' +
                    '<div class="char-accordion-left">' +
                        '<div class="char-accordion-icon" style="background:' + group.iconBg + ';color:' + group.iconColor + '">' +
                            '<i class="fa-solid ' + group.icon + '"></i>' +
                        '</div>' +
                        '<div>' +
                            '<div class="char-accordion-title">' + category.name + '</div>' +
                            '<div class="char-accordion-count">' + filteredChars.length + ' símbolos</div>' +
                        '</div>' +
                    '</div>' +
                    '<div style="display:flex;align-items:center;gap:10px;">' +
                        '<button class="char-copy-category" onclick="event.stopPropagation(); copyCategoryChars(' + gi + ', ' + ci + ');">' +
                            '<i class="fa-solid fa-copy"></i> Copiar Todos' +
                        '</button>' +
                        '<i class="fa-solid fa-chevron-down char-accordion-arrow"></i>' +
                    '</div>' +
                '</div>' +
                '<div class="char-accordion-content">' +
                    '<div class="char-accordion-inner">' +
                        '<div class="char-grid-enhanced">';
            
            filteredChars.forEach(function(char) {
                const safeChar = char.replace(/\\/g, '\\\\').replace(/'/g, "\'");
                html += '<button class="char-btn-enhanced ' + (charFavorites.includes(char) ? 'favorited' : '') + '" ' +
                    'data-char="' + safeChar + '" ' +
                    'onmouseenter="showCharTooltip(event, \'' + safeChar + '\')" ' +
                    'onmouseleave="hideCharTooltip()" ' +
                    'onmousemove="moveCharTooltip(event)" ' +
                    'onclick="copyCharEnhanced(\'' + safeChar + '\');">' +
                    char +
                    '<span class="char-fav-overlay">★</span>' +
                '</button>';
            });
            
            html += '</div></div></div></div>';
        });
    });
    
    container.innerHTML = html;
    
    const noResults = document.getElementById('charsNoResults');
    if (noResults) {
        noResults.classList.toggle('visible', !hasVisibleContent && q);
        document.getElementById('searchQueryText').textContent = q;
    }
    
    const clearBtn = document.getElementById('charSearchClear');
    if (clearBtn) clearBtn.style.display = q ? 'block' : 'none';
}

function toggleCategory(catId) {
    if (expandedCategories.has(catId)) {
        expandedCategories.delete(catId);
    } else {
        expandedCategories.add(catId);
    }
    
    const el = document.querySelector('[data-cat="' + catId + '"]');
    if (el) el.classList.toggle('open');
}

function expandAllCategories() {
    document.querySelectorAll('.char-accordion').forEach(function(el) { el.classList.add('open'); });
    charsData.forEach(function(g, gi) {
        g.categories.forEach(function(c, ci) {
            expandedCategories.add('cat-' + gi + '-' + ci);
        });
    });
}

function collapseAllCategories() {
    document.querySelectorAll('.char-accordion').forEach(function(el) { el.classList.remove('open'); });
    expandedCategories.clear();
}

function setGroupFilter(group) {
    activeGroupFilter = group;
    
    document.querySelectorAll('.char-filter-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.group === group);
    });
    
    const searchValue = document.getElementById('charSearchEnhanced') ? document.getElementById('charSearchEnhanced').value : '';
    renderAllCategories(searchValue, group);
}

function enhancedFilterChars(query) {
    renderAllCategories(query, activeGroupFilter);
}

function showCharTooltip(event, char) {
    if (!tooltipEl) return;
    
    const codePoint = char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
    const unicodeName = getUnicodeName(char);
    
    tooltipEl.querySelector('.char-tooltip-preview').textContent = char;
    tooltipEl.querySelector('.char-tooltip-name').textContent = unicodeName;
    tooltipEl.querySelector('.char-tooltip-code').textContent = 'U+' + codePoint;
    
    tooltipEl.classList.add('visible');
    moveCharTooltip(event);
}

function moveCharTooltip(event) {
    if (!tooltipEl || !tooltipEl.classList.contains('visible')) return;
    
    const x = event.clientX + 15;
    const y = event.clientY + 15;
    
    const rect = tooltipEl.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width - 20;
    const maxY = window.innerHeight - rect.height - 20;
    
    tooltipEl.style.left = Math.min(x, maxX) + 'px';
    tooltipEl.style.top = Math.min(y, maxY) + 'px';
}

function hideCharTooltip() {
    if (tooltipEl) tooltipEl.classList.remove('visible');
}

function getUnicodeName(char) {
    const names = {
        '±': 'Mais-Menos', '×': 'Vezes', '÷': 'Dividido por', '≈': 'Aproximadamente',
        '≠': 'Diferente', '≤': 'Menor ou Igual', '≥': 'Maior ou Igual', '∞': 'Infinito',
        '√': 'Raiz Quadrada', '∛': 'Raiz Cúbica', 'π': 'Pi', 'α': 'Alfa', 'β': 'Beta',
        '∑': 'Somatório', '∫': 'Integral', '→': 'Seta Direita', '←': 'Seta Esquerda',
        '↑': 'Seta Para Cima', '↓': 'Seta Para Baixo', '♥': 'Coração', '★': 'Estrela',
        '©': 'Copyright', '®': 'Registrado', '™': 'Marca Registrada', '€': 'Euro',
        '£': 'Libra Esterlina', '¥': 'Yen', '$': 'Dólar', '☀': 'Sol', '☽': 'Lua'
    };
    return names[char] || 'Símbolo "' + char + '"';
}



function copyCharEnhanced(char) {
    const fallback = function(t) {
        const ta = document.createElement('textarea');
        ta.value = t;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch(e) {}
        document.body.removeChild(ta);
    };
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(char).then(function() { onCharCopied(char); }).catch(function() { fallback(char); onCharCopied(char); });
    } else { fallback(char); onCharCopied(char); }
}

function onCharCopied(char) {
    showToast('✅ "' + char + '" copiado!');
    addToHistory(char);
    
    const safeChar = char.replace(/\\/g, '\\\\').replace(/'/g, "\'");
    const btn = document.querySelector('[data-char="' + safeChar + '"]');
    if (btn) {
        btn.classList.add('char-copied');
        setTimeout(function() { btn.classList.remove('char-copied'); }, 500);
    }
}

function addToHistory(char) {
    charHistory = charHistory.filter(function(h) { return h.char !== char; });
    charHistory.unshift({ char: char, time: Date.now() });
    charHistory = charHistory.slice(0, 30);
    localStorage.setItem('charHistory', JSON.stringify(charHistory));
    renderHistory();
}

function renderHistory() {
    const section = document.getElementById('charsHistorySection');
    const list = document.getElementById('charsHistoryList');
    if (!section || !list) return;
    
    if (charHistory.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    section.style.display = 'block';
    let html = '';
    charHistory.slice(0, 15).forEach(function(item) {
        const safeChar = item.char.replace(/\\/g, '\\\\').replace(/'/g, "\'");
        html += '<div class="char-history-item" onclick="copyCharEnhanced(\'' + safeChar + '\')" title="Copiar novamente">' +
            item.char + '<span class="char-history-time">' + getTimeAgo(item.time) + '</span></div>';
    });
    list.innerHTML = html;
}

function getTimeAgo(timestamp) {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'agora';
    if (mins < 60) return mins + 'min';
    const hours = Math.floor(mins / 60);
    if (hours < 24) return hours + 'h';
    return Math.floor(hours / 24) + 'd';
}

function clearCharHistory() {
    charHistory = [];
    localStorage.setItem('charHistory', JSON.stringify([]));
    renderHistory();
    showToast('🗑️ Histório limpo!');
}

function toggleFavorite(char) {
    if (charFavorites.includes(char)) {
        charFavorites = charFavorites.filter(function(f) { return f !== char; });
        showToast('☆ "' + char + '" removido dos favoritos');
    } else {
        charFavorites.push(char);
        showToast('★ "' + char + '" adicionado aos favoritos!');
    }
    localStorage.setItem('charFavorites', JSON.stringify(charFavorites));
    updateCharStats();
    renderFavorites();
    
    const safeChar = char.replace(/\\/g, '\\\\').replace(/'/g, "\'");
    const btn = document.querySelector('[data-char="' + safeChar + '"]');
    if (btn) btn.classList.toggle('favorited', charFavorites.includes(char));
}

function renderFavorites() {
    const section = document.getElementById('charsFavoritesSection');
    const grid = document.getElementById('charsFavoritesGrid');
    const empty = document.getElementById('charsFavoritesEmpty');
    if (!section || !grid) return;
    
    if (charFavorites.length === 0) {
        grid.style.display = 'none';
        if (empty) empty.style.display = 'block';
        return;
    }
    
    grid.style.display = 'grid';
    if (empty) empty.style.display = 'none';
    
    let html = '';
    charFavorites.forEach(function(char) {
        const safeChar = char.replace(/\\/g, '\\\\').replace(/'/g, "\'");
        html += '<button class="char-btn-enhanced favorited" data-char="' + safeChar + '" ' +
            'onclick="copyCharEnhanced(\'' + safeChar + '\')" ' +
            'oncontextmenu="event.preventDefault(); toggleFavorite(\'' + safeChar + '\');">' +
            char + '</button>';
    });
    grid.innerHTML = html;
}

function toggleFavoritesPanel() {
    const section = document.getElementById('charsFavoritesSection');
    if (section) {
        const isHidden = section.style.display === 'none';
        section.style.display = isHidden ? 'block' : 'none';
    }
}

function copyAllFavorites() {
    if (charFavorites.length === 0) return;
    const text = charFavorites.join(' ');
    copyCharEnhanced(text);
    showToast('📋 ' + charFavorites.length + ' favoritos copiados!');
}

function copyCategoryChars(groupIdx, catIdx) {
    const cat = charsData[groupIdx] ? charsData[groupIdx].categories[catIdx] : null;
    if (!cat) return;
    const text = cat.chars.join(' ');
    copyCharEnhanced(text);
    showToast('📋 Categoria "' + cat.name + '" copiada (' + cat.chars.length + ' símbolos)');
}

function copyAllVisibleChars() {
    const visibleBtns = document.querySelectorAll('.char-btn-enhanced');
    const chars = Array.from(visibleBtns).map(function(b) { return b.dataset.char; }).filter(Boolean);
    if (chars.length === 0) return;
    copyCharEnhanced(chars.join(' '));
    showToast('📋 ' + chars.length + ' símbolos visíveis copiados!');
}

// Funções legadas compatíveis
// General-purpose copy-to-clipboard
function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() {
            if (typeof showToast === 'function') showToast('Copiado! 📋');
        }).catch(function() {
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); if (typeof showToast === 'function') showToast('Copiado! 📋'); }
    catch(e) { if (typeof showToast === 'function') showToast('Erro ao copiar'); }
    document.body.removeChild(ta);
}

function copyChar(char) { copyCharEnhanced(char); }
function filterChars(query) { enhancedFilterChars(query); }

function filterDevlog(query) {
    query = (query || '').toLowerCase().trim();
    var items = document.querySelectorAll('#devlogTimeline .timeline-item');
    var noResults = document.getElementById('devlogNoResults');
    var visibleCount = 0;
    items.forEach(function(item) {
        var text = (item.textContent || '').toLowerCase();
        var version = (item.getAttribute('data-version') || '').toLowerCase();
        if (!query || text.includes(query) || version.includes(query)) {
            item.style.display = '';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });
    if (noResults) noResults.style.display = visibleCount === 0 ? 'block' : 'none';
}


// Inicializar quando DOM pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEnhancedCharsSystem);
} else {
    initEnhancedCharsSystem();
}



// ===================== CODES SYSTEM =====================
const codesData = [
    { code: 'ESTUDA2026',  label: 'ESTUDA2026',  desc: 'Bônus de XP para quem estuda com dedicação!',       reward: '+50 XP',         icon: 'fa-star',       action: () => { gainXP(50); } },
    { code: 'GEEKIE100',   label: 'GEEKIE100',   desc: '100 moedas para investir nos seus pets favoritos.',  reward: '+100 Moedas',    icon: 'fa-coins',      action: () => { earnCoins(100, 'Código GEEKIE100!'); } },
    { code: 'FOCUSMODE',   label: 'FOCUSMODE',   desc: 'Desbloqueia o tema Ubuntu Forest exclusivamente.',   reward: 'Tema Forest',    icon: 'fa-leaf',       action: () => { if(!ownedThemes.includes('theme-ubuntu-forest')){ownedThemes.push('theme-ubuntu-forest');localStorage.setItem('geekieThemes',JSON.stringify(ownedThemes));} renderStore(); } },
    { code: 'NOVAERA25',   label: 'NOVAERA25',   desc: 'Celebre a nova era com 25 XP de bônus instantâneo.', reward: '+25 XP',        icon: 'fa-rocket',     action: () => { gainXP(25); } },
    { code: 'STUDYHUB',    label: 'STUDYHUB',    desc: 'Hub de estudos te recompensa com moedas extras.',    reward: '+30 Moedas',    icon: 'fa-graduation-cap', action: () => { earnCoins(30, 'Código STUDYHUB!'); } },
    /* ===== 10 NOVOS CÓDIGOS v11.3.0 ===== */
    { code: 'ULTRAXP500',  label: 'ULTRAXP500',  desc: 'Boost massivo de XP para acelerar sua progressão!',  reward: '+500 XP',        icon: 'fa-bolt',       action: () => { gainXP(500); } },
    { code: 'RICHGEEKIE',  label: 'RICHGEEKIE',  desc: 'Encha o cofre — 250 moedas de presente!',            reward: '+250 Moedas',    icon: 'fa-coins',      action: () => { earnCoins(250, 'Código RICHGEEKIE!'); } },
    { code: 'NEONTHEME',   label: 'NEONTHEME',   desc: 'Desbloqueia o tema vibrante Ubuntu Neon.',           reward: 'Tema Neon',      icon: 'fa-wand-sparkles', action: () => { if(!ownedThemes.includes('theme-ubuntu-neon')){ownedThemes.push('theme-ubuntu-neon');localStorage.setItem('geekieThemes',JSON.stringify(ownedThemes));} renderStore(); showToast('🌈 Tema Neon desbloqueado!'); } },
    { code: 'OCEANWAVE',   label: 'OCEANWAVE',   desc: 'Libera o tema Ubuntu Ocean — calmo e poderoso.',     reward: 'Tema Ocean',     icon: 'fa-water',      action: () => { if(!ownedThemes.includes('theme-ubuntu-ocean')){ownedThemes.push('theme-ubuntu-ocean');localStorage.setItem('geekieThemes',JSON.stringify(ownedThemes));} renderStore(); showToast('🌊 Tema Ocean desbloqueado!'); } },
    { code: 'MATRIX2026',  label: 'MATRIX2026',  desc: 'Acesse o fundo Matrix Rain sem gastar XP!',          reward: 'BG Matrix Rain', icon: 'fa-terminal',   action: () => { if(!ownedThemes.includes('theme-bg-matrix')){ownedThemes.push('theme-bg-matrix');localStorage.setItem('geekieThemes',JSON.stringify(ownedThemes));} renderStore(); showToast('🖥️ BG Matrix desbloqueado!'); } },
    { code: 'GEEKIEPET',   label: 'GEEKIEPET',   desc: 'Turbina seu pet com 150 moedas extras para upgrades!', reward: '+150 Moedas',  icon: 'fa-paw',        action: () => { earnCoins(150, 'Código GEEKIEPET!'); } },
    { code: 'TURBOBOOST',  label: 'TURBOBOOST',  desc: 'Pacote turbo — XP + moedas de uma vez!',             reward: '+200 XP +200 🪙', icon: 'fa-rocket',    action: () => { gainXP(200); earnCoins(200, 'Código TURBOBOOST!'); } },
    { code: 'AURORA2026',  label: 'AURORA2026',  desc: 'Desbloqueia o espetacular tema Aurora Boreal.',       reward: 'Tema Aurora',   icon: 'fa-rainbow',    action: () => { if(!ownedThemes.includes('theme-ubuntu-aurora')){ownedThemes.push('theme-ubuntu-aurora');localStorage.setItem('geekieThemes',JSON.stringify(ownedThemes));} renderStore(); showToast('🌈 Tema Aurora desbloqueado!'); } },
    { code: 'DARKMODE11',  label: 'DARKMODE11',  desc: 'Ativa o tema Ubuntu Dark — elegante e discreto.',    reward: 'Tema Dark',     icon: 'fa-skull',      action: () => { if(!ownedThemes.includes('theme-ubuntu-dark')){ownedThemes.push('theme-ubuntu-dark');localStorage.setItem('geekieThemes',JSON.stringify(ownedThemes));} renderStore(); showToast('🖤 Tema Dark desbloqueado!'); } },
    { code: 'COMMANDS',    label: 'COMMANDS',    desc: 'Bônus especial por descobrir a Aba de Comandos!',    reward: '+100 XP +50 🪙', icon: 'fa-terminal',   action: () => { gainXP(100); earnCoins(50, 'Código COMMANDS!'); } },
];
const secretCode = { code: 'ADM2026', action: () => { adminUnlocked = true; localStorage.setItem('geekieAdminUnlocked', '1'); showToast('🔐 Painel de Admin desbloqueado! Use Ctrl+Shift+A.'); } };

let redeemedCodes = JSON.parse(localStorage.getItem('geekieRedeemedCodes') || '[]');
let adminUnlocked = localStorage.getItem('geekieAdminUnlocked') === '1';

function gainXP(amount) {
    xp += amount;
    localStorage.setItem('geekieXP', xp);
    document.getElementById('xpCount').textContent = xp;
    try { renderTitles(); updatePlayerTitle(); renderStore(); renderPetGrid(); renderEventContent(); } catch(e) {}
}

// Alias for gainXP (used by login/diary systems)
function addXP(amount) { if (typeof gainXP === 'function') gainXP(amount); }


function redeemCode() {
    const input = document.getElementById('codeInput');
    if (!input) return;
    const val = input.value.trim().toUpperCase();
    if (!val) { showToast('Digite um código!', true); return; }

    if (redeemedCodes.includes(val)) { showToast('Código já resgatado!', true); input.value = ''; return; }

    const found = codesData.find(c => c.code === val);
    if (found) {
        redeemedCodes.push(val);
        localStorage.setItem('geekieRedeemedCodes', JSON.stringify(redeemedCodes));
        found.action();
        showToast(`🎁 Código ${val} resgatado! ${found.reward}`);
        input.value = '';
        renderCodesGrid();
        return;
    }

    if (val === secretCode.code) {
        if (adminUnlocked) { showToast('Código ADM2026 já ativo!', true); input.value = ''; return; }
        redeemedCodes.push(val);
        localStorage.setItem('geekieRedeemedCodes', JSON.stringify(redeemedCodes));
        secretCode.action();
        input.value = '';
        renderCodesGrid();
        return;
    }

    showToast('Código inválido!', true);
    input.value = '';
}

function renderCodesGrid() {
    const grid = document.getElementById('codesGrid');
    if (!grid) return;
    grid.innerHTML = '';
    codesData.forEach(c => {
        const redeemed = redeemedCodes.includes(c.code);
        grid.innerHTML += `
        <div class="code-card ${redeemed ? 'redeemed' : ''}">
            <div class="code-label"><i class="fa-solid ${c.icon}" style="margin-right:8px;font-size:0.9rem;"></i>${c.label}</div>
            <div class="code-desc">${c.desc}</div>
            <div class="code-reward"><i class="fa-solid fa-coins"></i> ${c.reward}</div>
            ${!redeemed ? `<button class="btn btn-primary" style="margin-top:4px;font-size:0.82rem;padding:8px 14px;" onclick="document.getElementById('codeInput').value='${c.code}';redeemCode()"><i class="fa-solid fa-gift"></i> Usar Código</button>` : ''}
        </div>`;
    });
}
renderCodesGrid();

// ===================== ADMIN PANEL =====================
function openAdminPanel() {
    if (!adminUnlocked) { showToast('Você precisa resgatar o código ADM2026 primeiro!', true); return; }
    document.getElementById('adminPanel').classList.add('open');
}
function closeAdminPanel() { document.getElementById('adminPanel').classList.remove('open'); }

function adminAddXP() {
    const amount = parseInt(document.getElementById('adminXpAmount').value) || 0;
    if (amount <= 0) { showToast('Digite uma quantidade válida!', true); return; }
    gainXP(amount);
    showToast(`⚡ Admin: +${amount} XP adicionado!`);
}
function adminAddCoins() {
    const amount = parseInt(document.getElementById('adminCoinAmount').value) || 0;
    if (amount <= 0) { showToast('Digite uma quantidade válida!', true); return; }
    earnCoins(amount, `Admin: +${amount} moedas`);
    showToast(`🪙 Admin: +${amount} moedas adicionadas!`);
}
function adminUnlockAllThemes() {
    storeItems.forEach(si => { if (!ownedThemes.includes(si.id)) ownedThemes.push(si.id); });
    localStorage.setItem('geekieThemes', JSON.stringify(ownedThemes));
    renderStore(); showToast('🎨 Todos os temas desbloqueados!');
}
function adminUnlockAllTitles() {
    xp = Math.max(xp, 15000);
    localStorage.setItem('geekieXP', xp);
    document.getElementById('xpCount').textContent = xp;
    renderTitles(); updatePlayerTitle(); renderEventContent();
    showToast('👑 Todos os títulos desbloqueados!');
}
function adminUnlockAllPets() {
    petsData.forEach(pet => {
        if (!petState[pet.id]) petState[pet.id] = { owned: true, active: false, autoCollect: false, upgrades: {} };
        petState[pet.id].owned = true;
    });
    savePetState();
    renderPetGrid(); showToast('🐾 Todos os pets desbloqueados!');
}
function adminUnlockAll() {
    adminUnlockAllThemes(); adminUnlockAllPets();
    setTimeout(adminUnlockAllTitles, 100);
}
function adminResetAll() {
    if (!confirm('ATENÇÃO: Isso apagará TODO o seu progresso permanentemente. Tem certeza?')) return;
    localStorage.clear();
    location.reload();
}

// ===================== KEYBOARD SHORTCUTS =====================
const tabShortcuts = {
    '1': 'tab-geekie',
    '2': 'tab-notes',
    '3': 'tab-store',
    '4': 'tab-titles',
    '5': 'tab-pets',
    '6': 'tab-timer',
    '7': 'tab-goals',
    '8': 'tab-flashcards',
    '9': 'tab-ambient',
    '0': 'tab-calculator',
};

let shortcutHintTimeout;
function showShortcutHint() {
    const hint = document.getElementById('shortcutHint');
    if (!hint) return;
    hint.classList.add('show');
    clearTimeout(shortcutHintTimeout);
    shortcutHintTimeout = setTimeout(() => hint.classList.remove('show'), 3000);
}

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        if (adminUnlocked) { const panel = document.getElementById('adminPanel'); panel.classList.toggle('open'); }
        else showToast('Resgate o código ADM2026 primeiro!', true);
        return;
    }

    if (e.altKey && tabShortcuts[e.key]) {
        e.preventDefault();
        const tabId = tabShortcuts[e.key];
        const navItems = document.querySelectorAll('.nav-item');
        let targetNavItem = null;
        navItems.forEach(item => {
            const onclick = item.getAttribute('onclick') || '';
            if (onclick.includes(`'${tabId}'`)) targetNavItem = item;
        });
        switchTab(tabId, targetNavItem || navItems[0]);
        showShortcutHint();
        return;
    }

    if (e.altKey && e.key === '?') {
        e.preventDefault();
        showShortcutHint();
    }
});

// ===================== SEARCH BARS (Store / Titles / Pets) =====================
function filterStore(query) {
    const q = query.toLowerCase().trim();
    const items = document.querySelectorAll('#storeGrid .store-item');
    let any = false;
    items.forEach(item => {
        const h4 = item.querySelector('h4');
        const p = item.querySelectorAll('p');
        let text = (h4 ? h4.textContent : '') + ' ';
        p.forEach(el => text += el.textContent + ' ');
        const match = !q || text.toLowerCase().includes(q);
        item.style.display = match ? '' : 'none';
        if (match) any = true;
    });
    const noRes = document.getElementById('storeNoResults');
    if (noRes) noRes.style.display = (q && !any) ? 'block' : 'none';
}

function filterTitles(query) {
    const q = query.toLowerCase().trim();
    const items = document.querySelectorAll('#titlesGrid .title-card');
    let any = false;
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        const match = !q || text.includes(q);
        item.style.display = match ? '' : 'none';
        if (match) any = true;
    });
    const noRes = document.getElementById('titlesNoResults');
    if (noRes) noRes.style.display = (q && !any) ? 'block' : 'none';
}

function filterPets(query) {
    const q = query.toLowerCase().trim();
    const items = document.querySelectorAll('#petGrid .pet-card');
    let any = false;
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        const match = !q || text.includes(q);
        item.style.display = match ? '' : 'none';
        if (match) any = true;
    });
    const noRes = document.getElementById('petsNoResults');
    if (noRes) noRes.style.display = (q && !any) ? 'block' : 'none';
}

// Re-apply search after renders that clear innerHTML
const _origRenderStore = renderStore;
renderStore = function() { _origRenderStore(); const sb = document.getElementById('storeSearchBar'); if (sb && sb.value) filterStore(sb.value); };
const _origRenderTitles = renderTitles;
renderTitles = function() { _origRenderTitles(); const sb = document.getElementById('titlesSearchBar'); if (sb && sb.value) filterTitles(sb.value); };
const _origRenderPetGrid = renderPetGrid;
renderPetGrid = function() { _origRenderPetGrid(); const sb = document.getElementById('petsSearchBar'); if (sb && sb.value) filterPets(sb.value); };

// ===================== NOTE FONT SIZE =====================
function setNoteSize(px) {
    document.getElementById('noteContent').style.fontSize = px + 'px';
    localStorage.setItem('geekieNoteSize', px);
    document.querySelectorAll('#noteSizePicker .note-size-btn').forEach(b => {
        b.classList.toggle('active', parseInt(b.dataset.size) === px);
    });
}
(function() {
    const saved = parseInt(localStorage.getItem('geekieNoteSize') || '16');
    setNoteSize(saved);
})();

// ===================== NOVAS FUNCIONALIDADES DA NOTEPAD v11.3.0 =====================
let mdPreviewActive = false;

function toggleNoteMarkdown() {
    mdPreviewActive = !mdPreviewActive;
    const preview = document.getElementById('noteMarkdownPreview');
    const editor = document.getElementById('noteContent');
    const btn = document.getElementById('btnMdPreview');
    if (mdPreviewActive) {
        preview.style.display = 'block';
        preview.innerHTML = renderMarkdown(editor.value);
        btn.style.color = 'var(--primary)';
        btn.style.borderColor = 'var(--primary)';
    } else {
        preview.style.display = 'none';
        btn.style.color = '';
        btn.style.borderColor = '';
    }
}

function renderMarkdown(text) {
    if (!text) return '<p style="color:var(--text-muted);">Nada para exibir.</p>';
    let html = text
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
        .replace(/```([\s\S]*?)```/g,'<pre><code>$1</code></pre>')
        .replace(/`([^`]+)`/g,'<code>$1</code>')
        .replace(/^### (.+)$/gm,'<h3>$1</h3>')
        .replace(/^## (.+)$/gm,'<h2>$1</h2>')
        .replace(/^# (.+)$/gm,'<h1>$1</h1>')
        .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
        .replace(/\*(.+?)\*/g,'<em>$1</em>')
        .replace(/^> (.+)$/gm,'<blockquote>$1</blockquote>')
        .replace(/^---$/gm,'<hr>')
        .replace(/^- (.+)$/gm,'<li>$1</li>')
        .replace(/(<li>[\s\S]+?<\/li>)/g,'<ul>$1</ul>')
        .replace(/\n\n/g,'<br><br>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank">$1</a>');
    return html;
}

function liveNoteCounter() {
    if (mdPreviewActive) {
        const editor = document.getElementById('noteContent');
        const preview = document.getElementById('noteMarkdownPreview');
        if (preview) preview.innerHTML = renderMarkdown(editor.value);
    }
}

function clearNoteContent() {
    if (!confirm('Limpar todo o conteúdo desta nota?')) return;
    const editor = document.getElementById('noteContent');
    if (editor) { editor.value = ''; liveNoteCounter(); showToast('Conteúdo limpo!'); }
}

function insertNoteTimestamp() {
    const editor = document.getElementById('noteContent');
    if (!editor) return;
    const now = new Date();
    const stamp = `\n📅 ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')}\n`;
    const pos = editor.selectionStart;
    editor.value = editor.value.substring(0, pos) + stamp + editor.value.substring(editor.selectionEnd);
    editor.selectionStart = editor.selectionEnd = pos + stamp.length;
    editor.focus();
    showToast('Data/hora inserida!');
}

function insertBulletList() {
    const editor = document.getElementById('noteContent');
    if (!editor) return;
    const pos = editor.selectionStart;
    const bullets = '\n- Item 1\n- Item 2\n- Item 3\n';
    editor.value = editor.value.substring(0, pos) + bullets + editor.value.substring(editor.selectionEnd);
    editor.selectionStart = editor.selectionEnd = pos + bullets.length;
    editor.focus();
    showToast('Lista inserida!');
}

function insertSeparator() {
    const editor = document.getElementById('noteContent');
    if (!editor) return;
    const pos = editor.selectionStart;
    const sep = '\n---\n';
    editor.value = editor.value.substring(0, pos) + sep + editor.value.substring(editor.selectionEnd);
    editor.selectionStart = editor.selectionEnd = pos + sep.length;
    editor.focus();
}

function countNoteWords() {
    const editor = document.getElementById('noteContent');
    const counter = document.getElementById('noteWordCounter');
    if (!editor || !counter) return;
    const text = editor.value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, '').length;
    const lines = text.split('\n').length;
    counter.style.display = 'flex';
    counter.innerHTML = `<span><strong>${words}</strong> palavras</span><span><strong>${chars}</strong> caracteres</span><span><strong>${charsNoSpace}</strong> sem espaços</span><span><strong>${lines}</strong> linhas</span>`;
    showToast('Contagem feita!');
}

// ===================== COMMAND PALETTE v11.3.0 =====================
const cmdCommands = [
    // Navegação
    { group: 'Navegação', icon: 'fa-book-open', iconBg: 'rgba(0,212,255,0.15)', iconColor: '#00d4ff', label: 'Ir para Portal Geekie', desc: 'Abre o portal de estudos', shortcut: 'Alt+1', action: () => { switchTab('tab-geekie', document.querySelector('.nav-item')); closeCmdPalette(); } },
    { group: 'Navegação', icon: 'fa-book-journal-whills', iconBg: 'rgba(0,255,136,0.15)', iconColor: '#00ff88', label: 'Ir para Bloco de Notas', desc: 'Editor de anotações com fontes e exportação', shortcut: 'Alt+2', action: () => { switchTab('tab-notes', null); closeCmdPalette(); } },
    { group: 'Navegação', icon: 'fa-store', iconBg: 'rgba(255,215,0,0.15)', iconColor: '#ffd700', label: 'Ir para Loja de Temas', desc: 'Desbloqueie temas com seu XP', shortcut: 'Alt+3', action: () => { switchTab('tab-store', null); closeCmdPalette(); } },
    { group: 'Navegação', icon: 'fa-crown', iconBg: 'rgba(167,139,250,0.15)', iconColor: '#a78bfa', label: 'Ir para Títulos', desc: 'Veja e equipe seus títulos', shortcut: 'Alt+4', action: () => { switchTab('tab-titles', null); closeCmdPalette(); } },
    { group: 'Navegação', icon: 'fa-paw', iconBg: 'rgba(251,146,60,0.15)', iconColor: '#fb923c', label: 'Ir para Pets', desc: 'Gerencie seus pets de estudo', shortcut: 'Alt+5', action: () => { switchTab('tab-pets', null); closeCmdPalette(); } },
    { group: 'Navegação', icon: 'fa-stopwatch', iconBg: 'rgba(0,212,255,0.15)', iconColor: '#00d4ff', label: 'Ir para Pomodoro Timer', desc: 'Timer de foco e pausas', shortcut: 'Alt+6', action: () => { switchTab('tab-timer', null); closeCmdPalette(); } },
    { group: 'Navegação', icon: 'fa-list-check', iconBg: 'rgba(0,255,136,0.15)', iconColor: '#00ff88', label: 'Ir para Metas de Estudo', desc: 'Adicione e conclua metas', shortcut: 'Alt+7', action: () => { switchTab('tab-goals', null); closeCmdPalette(); } },
    { group: 'Navegação', icon: 'fa-clone', iconBg: 'rgba(167,139,250,0.15)', iconColor: '#a78bfa', label: 'Ir para Flashcards', desc: 'Revisão ativa com cartões', shortcut: 'Alt+8', action: () => { switchTab('tab-flashcards', null); closeCmdPalette(); } },
    { group: 'Navegação', icon: 'fa-headphones', iconBg: 'rgba(0,212,255,0.15)', iconColor: '#00d4ff', label: 'Ir para Sons Ambiente', desc: 'Ative sons para concentração', shortcut: 'Alt+9', action: () => { switchTab('tab-ambient', null); closeCmdPalette(); } },
    { group: 'Navegação', icon: 'fa-calculator', iconBg: 'rgba(46,213,115,0.15)', iconColor: '#2ed573', label: 'Ir para Calculadora', desc: 'Calculadora científica', shortcut: 'Alt+0', action: () => { switchTab('tab-calculator', null); closeCmdPalette(); } },
    { group: 'Navegação', icon: 'fa-keyboard', iconBg: 'rgba(0,212,255,0.15)', iconColor: '#00d4ff', label: 'Ir para Caracteres Úteis', desc: 'Símbolos matemáticos e científicos', shortcut: '', action: () => { switchTab('tab-chars', null); closeCmdPalette(); } },
    { group: 'Navegação', icon: 'fa-calendar-star', iconBg: 'rgba(255,71,87,0.15)', iconColor: '#ff4757', label: 'Ir para Eventos do Mês', desc: 'Desafios e recompensas mensais', shortcut: '', action: () => { switchTab('tab-events', null); closeCmdPalette(); } },
    { group: 'Navegação', icon: 'fa-code', iconBg: 'rgba(0,212,255,0.15)', iconColor: '#00d4ff', label: 'Ir para Códigos de Resgate', desc: 'Insira códigos para recompensas', shortcut: '', action: () => { switchTab('tab-codes', null); closeCmdPalette(); } },
    { group: 'Navegação', icon: 'fa-clock-rotate-left', iconBg: 'rgba(148,163,184,0.15)', iconColor: '#94a3b8', label: 'Ir para Dev Log', desc: 'Histórico de versões', shortcut: '', action: () => { switchTab('tab-devlog', null); closeCmdPalette(); } },
    { group: 'Navegação', icon: 'fa-map', iconBg: 'rgba(245,158,11,0.15)', iconColor: '#f59e0b', label: 'Ir para Trilha de Progresso', desc: 'Jornada de XP com recompensas', shortcut: '', action: () => { switchTab('tab-journey', null); closeCmdPalette(); setTimeout(renderJourney, 50); } },
    { group: 'Navegação', icon: 'fa-calendar-week', iconBg: 'rgba(52,211,153,0.15)', iconColor: '#34d399', label: 'Ir para Planner Semanal', desc: 'Planejador de estudos por dia', shortcut: '', action: () => { switchTab('tab-planner', null); closeCmdPalette(); setTimeout(renderPlanner, 50); } },
    { group: 'Navegação', icon: 'fa-chart-bar', iconBg: 'rgba(0,212,255,0.15)', iconColor: '#00d4ff', label: 'Ir para Estatísticas', desc: 'Métricas e gráficos de estudo', shortcut: '', action: () => { switchTab('tab-stats', null); closeCmdPalette(); setTimeout(renderStudyStats, 50); } },
    { group: 'Navegação', icon: 'fa-clock-rotate-left', iconBg: 'rgba(167,139,250,0.15)', iconColor: '#a78bfa', label: 'Ir para Cronômetro por Matéria', desc: 'Tempo por disciplina', shortcut: '', action: () => { switchTab('tab-subjects', null); closeCmdPalette(); setTimeout(renderSubjectGrid, 50); } },
    { group: 'Navegação', icon: 'fa-brain', iconBg: 'rgba(255,71,87,0.15)', iconColor: '#ff4757', label: 'Ir para Quiz Rápido', desc: 'Teste seus conhecimentos', shortcut: '', action: () => { switchTab('tab-quiz', null); closeCmdPalette(); setTimeout(renderQuizSetup, 50); } },
    // Notas
    { group: 'Bloco de Notas', icon: 'fa-floppy-disk', iconBg: 'rgba(0,255,136,0.15)', iconColor: '#00ff88', label: 'Salvar Nota Atual', desc: 'Salva a anotação aberta', shortcut: '', action: () => { closeCmdPalette(); switchTab('tab-notes', null); setTimeout(saveNote, 200); } },
    { group: 'Bloco de Notas', icon: 'fa-file-export', iconBg: 'rgba(0,212,255,0.15)', iconColor: '#00d4ff', label: 'Exportar Nota (.txt)', desc: 'Baixa a nota como arquivo de texto', shortcut: '', action: () => { closeCmdPalette(); switchTab('tab-notes', null); setTimeout(exportNote, 200); } },
    { group: 'Bloco de Notas', icon: 'fa-brands fa-markdown', iconBg: 'rgba(167,139,250,0.15)', iconColor: '#a78bfa', label: 'Ativar Preview Markdown', desc: 'Renderiza a nota em Markdown', shortcut: '', action: () => { closeCmdPalette(); switchTab('tab-notes', null); setTimeout(toggleNoteMarkdown, 300); } },
    { group: 'Bloco de Notas', icon: 'fa-clock', iconBg: 'rgba(251,146,60,0.15)', iconColor: '#fb923c', label: 'Inserir Data e Hora', desc: 'Insere timestamp na nota', shortcut: '', action: () => { closeCmdPalette(); switchTab('tab-notes', null); setTimeout(insertNoteTimestamp, 300); } },
    { group: 'Bloco de Notas', icon: 'fa-list-ul', iconBg: 'rgba(0,255,136,0.15)', iconColor: '#00ff88', label: 'Inserir Lista de Tópicos', desc: 'Insere modelo de lista com bullets', shortcut: '', action: () => { closeCmdPalette(); switchTab('tab-notes', null); setTimeout(insertBulletList, 300); } },
    { group: 'Bloco de Notas', icon: 'fa-font', iconBg: 'rgba(0,212,255,0.15)', iconColor: '#00d4ff', label: 'Contar Palavras/Caracteres', desc: 'Exibe estatísticas do texto', shortcut: '', action: () => { closeCmdPalette(); switchTab('tab-notes', null); setTimeout(countNoteWords, 300); } },
    { group: 'Bloco de Notas', icon: 'fa-copy', iconBg: 'rgba(0,212,255,0.15)', iconColor: '#00d4ff', label: 'Copiar Conteúdo da Nota', desc: 'Copia o texto para área de transferência', shortcut: '', action: () => { closeCmdPalette(); switchTab('tab-notes', null); setTimeout(copyNoteContent, 300); } },
    // Pomodoro
    { group: 'Pomodoro', icon: 'fa-play', iconBg: 'rgba(0,255,136,0.15)', iconColor: '#00ff88', label: 'Iniciar Timer Pomodoro', desc: 'Começa a contagem de foco', shortcut: '', action: () => { closeCmdPalette(); switchTab('tab-timer', null); setTimeout(startTimer, 300); } },
    { group: 'Pomodoro', icon: 'fa-pause', iconBg: 'rgba(255,71,87,0.15)', iconColor: '#ff4757', label: 'Pausar Timer', desc: 'Pausa o timer atual', shortcut: '', action: () => { closeCmdPalette(); pauseTimer(); } },
    { group: 'Pomodoro', icon: 'fa-rotate-right', iconBg: 'rgba(148,163,184,0.15)', iconColor: '#94a3b8', label: 'Resetar Timer', desc: 'Volta ao início (25 min)', shortcut: '', action: () => { closeCmdPalette(); resetTimer(); } },
    // Sons
    { group: 'Sons Ambiente', icon: 'fa-stop', iconBg: 'rgba(255,71,87,0.15)', iconColor: '#ff4757', label: 'Parar Todos os Sons', desc: 'Silencia todos os sons ativos', shortcut: '', action: () => { closeCmdPalette(); stopAllAmbient(); } },
    { group: 'Sons Ambiente', icon: 'fa-spa', iconBg: 'rgba(0,255,136,0.15)', iconColor: '#00ff88', label: 'Preset Relaxar', desc: 'Ativa sons de relaxamento', shortcut: '', action: () => { closeCmdPalette(); presetRelax(); } },
    { group: 'Sons Ambiente', icon: 'fa-brain', iconBg: 'rgba(167,139,250,0.15)', iconColor: '#a78bfa', label: 'Preset Foco', desc: 'Ativa ruído marrom para foco', shortcut: '', action: () => { closeCmdPalette(); presetFocus(); } },
    { group: 'Sons Ambiente', icon: 'fa-leaf', iconBg: 'rgba(22,163,74,0.15)', iconColor: '#16a34a', label: 'Preset Natureza', desc: 'Chuva, pássaros e vento', shortcut: '', action: () => { closeCmdPalette(); presetNature(); } },
    // Temas
    { group: 'Temas', icon: 'fa-wand-magic-sparkles', iconBg: 'rgba(255,215,0,0.15)', iconColor: '#ffd700', label: 'Criar Tema Personalizado', desc: 'Abre o criador de tema com cor e efeito', shortcut: '', action: () => { closeCmdPalette(); openCustomThemeModal(); } },
    { group: 'Temas', icon: 'fa-square', iconBg: 'rgba(148,163,184,0.15)', iconColor: '#94a3b8', label: 'Aplicar Tema Padrão', desc: 'Remove qualquer tema ativo', shortcut: '', action: () => { closeCmdPalette(); equipTheme('theme-default'); } },
    // Calculadora
    { group: 'Calculadora', icon: 'fa-rotate-left', iconBg: 'rgba(255,71,87,0.15)', iconColor: '#ff4757', label: 'Limpar Calculadora', desc: 'Apaga a expressão atual (AC)', shortcut: '', action: () => { closeCmdPalette(); switchTab('tab-calculator', null); setTimeout(() => calcAction('clear'), 300); } },
    // Sistema
    { group: 'Sistema', icon: 'fa-expand', iconBg: 'rgba(0,212,255,0.15)', iconColor: '#00d4ff', label: 'Ativar Modo Zen', desc: 'Tela cheia sem distrações', shortcut: '', action: () => { closeCmdPalette(); toggleZenMode(); } },
    { group: 'Sistema', icon: 'fa-bars', iconBg: 'rgba(148,163,184,0.15)', iconColor: '#94a3b8', label: 'Alternar Menu Lateral', desc: 'Mostra ou oculta a sidebar', shortcut: '', action: () => { closeCmdPalette(); toggleFabMenu(); } },
    { group: 'Sistema', icon: 'fa-google', iconBg: 'rgba(234,67,53,0.15)', iconColor: '#ea4335', label: 'Ir para Google', desc: 'Abre o Google integrado', shortcut: '', action: () => { switchTab('tab-google', null); closeCmdPalette(); } },
    { group: 'Sistema', icon: 'fa-pen-nib', iconBg: 'rgba(0,212,255,0.15)', iconColor: '#00d4ff', label: 'Personalizar Título da Página', desc: 'Muda nome, ícone e fonte da aba', shortcut: '', action: () => { switchTab('tab-title', null); closeCmdPalette(); } },
    { group: 'Sistema', icon: 'fa-shield-halved', iconBg: 'rgba(255,71,87,0.15)', iconColor: '#ff4757', label: 'Abrir Painel de Admin', desc: 'Requer código ADM2026', shortcut: 'Ctrl+Shift+A', action: () => { closeCmdPalette(); openAdminPanel(); } },
    // Sons de Teclado
    { group: 'Sons de Teclado', icon: 'fa-keyboard', iconBg: 'rgba(0,255,136,0.15)', iconColor: '#00ff88', label: 'Ir para Sons de Teclado', desc: 'Sons magnéticos relaxantes a cada tecla e clique', shortcut: '', action: () => { switchTab('tab-keysounds', null); closeCmdPalette(); setTimeout(renderKeySoundsTab, 50); } },
    { group: 'Sons de Teclado', icon: 'fa-volume-xmark', iconBg: 'rgba(255,71,87,0.15)', iconColor: '#ff4757', label: 'Desativar Som de Teclado', desc: 'Silencia os sons de tecla', shortcut: '', action: () => { closeCmdPalette(); ksDeactivate(); } },
    { group: 'Sons de Teclado', icon: 'fa-play', iconBg: 'rgba(0,212,255,0.15)', iconColor: '#00d4ff', label: 'Ativar Click Magnético (grátis)', desc: 'Som padrão de teclado magnético', shortcut: '', action: () => { closeCmdPalette(); ksSelectSound('ks-click'); } },
];

let cmdActiveIndex = -1;
let cmdFiltered = [...cmdCommands];

function openCmdPalette() {
    const overlay = document.getElementById('cmdPaletteOverlay');
    const input = document.getElementById('cmdPaletteInput');
    overlay.classList.add('open');
    cmdActiveIndex = -1;
    cmdFiltered = [...cmdCommands];
    renderCmdPalette('');
    setTimeout(() => { if(input) { input.value = ''; input.focus(); } }, 50);
}

function closeCmdPalette() {
    document.getElementById('cmdPaletteOverlay').classList.remove('open');
}

function renderCmdPalette(query) {
    const list = document.getElementById('cmdPaletteList');
    if (!list) return;
    const q = query.toLowerCase().trim();
    if (q) {
        cmdFiltered = cmdCommands.filter(c => c.label.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q) || c.group.toLowerCase().includes(q));
    } else {
        cmdFiltered = [...cmdCommands];
    }
    if (!cmdFiltered.length) {
        list.innerHTML = `<div class="cmd-empty"><i class="fa-solid fa-circle-xmark" style="display:block;font-size:2rem;margin-bottom:8px;color:var(--text-muted);"></i>Nenhum comando encontrado.</div>`;
        return;
    }
    list.innerHTML = '';
    let lastGroup = '';
    cmdFiltered.forEach((cmd, idx) => {
        if (cmd.group !== lastGroup) {
            list.innerHTML += `<div class="cmd-group-label">${cmd.group}</div>`;
            lastGroup = cmd.group;
        }
        const isActive = idx === cmdActiveIndex;
        list.innerHTML += `<div class="cmd-item ${isActive ? 'cmd-active' : ''}" id="cmd-item-${idx}" onclick="executeCmdItem(${idx})">
            <div class="cmd-item-icon" style="background:${cmd.iconBg};color:${cmd.iconColor};"><i class="fa-solid ${cmd.icon}"></i></div>
            <div class="cmd-item-body">
                <div class="cmd-item-label">${cmd.label}</div>
                <div class="cmd-item-desc">${cmd.desc}</div>
            </div>
            ${cmd.shortcut ? `<div class="cmd-item-shortcut">${cmd.shortcut}</div>` : ''}
        </div>`;
    });
}

function filterCmdPalette(query) {
    cmdActiveIndex = -1;
    renderCmdPalette(query);
}

function handleCmdKeys(e) {
    if (e.key === 'Escape') { closeCmdPalette(); return; }
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        cmdActiveIndex = Math.min(cmdActiveIndex + 1, cmdFiltered.length - 1);
        renderCmdPalette(document.getElementById('cmdPaletteInput').value);
        scrollCmdItem(cmdActiveIndex);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        cmdActiveIndex = Math.max(cmdActiveIndex - 1, 0);
        renderCmdPalette(document.getElementById('cmdPaletteInput').value);
        scrollCmdItem(cmdActiveIndex);
    } else if (e.key === 'Enter') {
        if (cmdActiveIndex >= 0 && cmdFiltered[cmdActiveIndex]) {
            cmdFiltered[cmdActiveIndex].action();
        } else if (cmdFiltered.length > 0) {
            cmdFiltered[0].action();
        }
    }
}

function scrollCmdItem(idx) {
    const el = document.getElementById(`cmd-item-${idx}`);
    if (el) el.scrollIntoView({ block: 'nearest' });
}

function executeCmdItem(idx) {
    if (cmdFiltered[idx]) cmdFiltered[idx].action();
}

// ===================== CRIADOR DE TEMA PERSONALIZADO v11.3.0 =====================
let ctSelectedColor = '#00ff88';
let ctSelectedEffect = 'pulse';
let customThemeActive = false;

const ctAnimations = {
    pulse: `@keyframes ctPulse{0%,100%{box-shadow:0 0 15px var(--custom-color,#00ff88),0 0 40px rgba(0,255,136,0.3);}50%{box-shadow:0 0 30px var(--custom-color,#00ff88),0 0 70px rgba(0,255,136,0.5);border-color:var(--custom-color,#00ff88);}} .theme-custom-user{animation:ctPulse 2s ease-in-out infinite;}`,
    glow: `@keyframes ctGlow{0%,100%{box-shadow:0 0 20px var(--custom-color,#00ff88),0 0 50px rgba(0,255,136,0.2);}50%{box-shadow:0 0 40px var(--custom-color,#00ff88),0 0 90px rgba(0,255,136,0.4);}} .theme-custom-user{animation:ctGlow 3s ease-in-out infinite;}`,
    neon: `@keyframes ctNeon{0%,100%{box-shadow:0 0 10px var(--custom-color,#00ff88),0 0 30px var(--custom-color,#00ff88),0 0 80px var(--custom-color,#00ff88);}50%{box-shadow:0 0 20px var(--custom-color,#00ff88),0 0 60px var(--custom-color,#00ff88),0 0 120px var(--custom-color,#00ff88);}} .theme-custom-user{animation:ctNeon 1.5s ease-in-out infinite;}`,
    float: `@keyframes ctFloat{0%,100%{transform:translateY(0);}50%{transform:translateY(-5px);}} .theme-custom-user{animation:ctFloat 3s ease-in-out infinite;}`,
    shake: `@keyframes ctShake{0%{transform:translate(0,0);}25%{transform:translate(0.7px,-0.7px);}50%{transform:translate(-0.7px,0.7px);}75%{transform:translate(0.7px,0.7px);}100%{transform:translate(0,0);}} .theme-custom-user{animation:ctShake 0.15s ease-in-out infinite;}`,
    spin: `@keyframes ctSpin{0%{filter:hue-rotate(0deg);}100%{filter:hue-rotate(360deg);}} .theme-custom-user{animation:ctSpin 8s linear infinite;}`,
    rainbow: `@keyframes ctRainbow{0%{border-color:#ff0000;box-shadow:0 0 15px #ff0000;}16%{border-color:#ff8800;box-shadow:0 0 15px #ff8800;}33%{border-color:#ffff00;box-shadow:0 0 15px #ffff00;}50%{border-color:#00ff00;box-shadow:0 0 15px #00ff00;}66%{border-color:#0088ff;box-shadow:0 0 15px #0088ff;}83%{border-color:#8800ff;box-shadow:0 0 15px #8800ff;}100%{border-color:#ff0000;box-shadow:0 0 15px #ff0000;}} .theme-custom-user{animation:ctRainbow 4s linear infinite;}`,
    none: `.theme-custom-user{box-shadow:0 0 15px var(--custom-color,#00ff88);animation:none;}`
};

function openCustomThemeModal() {
    document.getElementById('customThemeModal').classList.add('open');
    updateCtPreview();
}

function closeCustomThemeModal() {
    document.getElementById('customThemeModal').classList.remove('open');
}

function selectCtColor(el) {
    document.querySelectorAll('.ct-color-btn').forEach(b => b.classList.remove('selected'));
    el.classList.add('selected');
    ctSelectedColor = el.dataset.color;
    document.getElementById('ctColorPicker').value = ctSelectedColor;
    updateCtPreview();
}

function selectCtColorHex(hex) {
    ctSelectedColor = hex;
    document.querySelectorAll('.ct-color-btn').forEach(b => b.classList.remove('selected'));
    updateCtPreview();
}

function selectCtEffect(el) {
    document.querySelectorAll('.ct-effect-btn').forEach(b => b.classList.remove('selected'));
    el.classList.add('selected');
    ctSelectedEffect = el.dataset.effect;
    updateCtPreview();
}

function updateCtPreview() {
    const preview = document.getElementById('ctPreview');
    if (!preview) return;
    const name = document.getElementById('ctThemeName').value || 'Meu Tema';
    preview.style.border = `2px solid ${ctSelectedColor}`;
    preview.style.boxShadow = `0 0 20px ${ctSelectedColor}66, 0 0 50px ${ctSelectedColor}22`;
    preview.style.color = ctSelectedColor;
    preview.textContent = name;
}

function injectCustomThemeStyle() {
    let style = document.getElementById('customThemeStyle');
    if (!style) { style = document.createElement('style'); style.id = 'customThemeStyle'; document.head.appendChild(style); }
    style.textContent = `:root{--custom-color:${ctSelectedColor};} .theme-custom-user{border:2px solid ${ctSelectedColor} !important;} ${ctAnimations[ctSelectedEffect] || ctAnimations.pulse}`;
}

function applyCustomTheme() {
    injectCustomThemeStyle();
    const container = document.getElementById('geekieIframeContainer');
    storeItems.forEach(item => container.classList.remove(item.id));
    container.classList.remove('theme-custom-user');
    void container.offsetWidth;
    container.classList.add('theme-custom-user');
    equippedTheme = 'theme-custom-user';
    localStorage.setItem('geekieEquipped', 'theme-custom-user');
    localStorage.setItem('geekieCustomColor', ctSelectedColor);
    localStorage.setItem('geekieCustomEffect', ctSelectedEffect);
    customThemeActive = true;
    const badge = document.getElementById('customThemeEquippedBadge');
    if (badge) badge.style.display = 'inline-flex';
    closeCustomThemeModal();
    showToast(`🎨 Tema "${document.getElementById('ctThemeName').value || 'Personalizado'}" aplicado!`);
}

function saveCustomThemeToStore() {
    const name = document.getElementById('ctThemeName').value.trim() || 'Meu Tema';
    const customId = 'theme-custom-user';
    const existing = storeItems.find(s => s.id === customId);
    const entry = { id: customId, name: `🎨 ${name}`, xpReq: 0, icon: 'fa-palette', desc: `Tema personalizado com cor ${ctSelectedColor} e efeito ${ctSelectedEffect}.`, color: ctSelectedColor, effect: 'Personalizado' };
    if (existing) { Object.assign(existing, entry); } else { storeItems.push(entry); }
    if (!ownedThemes.includes(customId)) ownedThemes.push(customId);
    localStorage.setItem('geekieThemes', JSON.stringify(ownedThemes));
    injectCustomThemeStyle();
    applyCustomTheme();
    renderStore();
}

// Restaurar tema personalizado ao carregar
(function() {
    const savedColor = localStorage.getItem('geekieCustomColor');
    const savedEffect = localStorage.getItem('geekieCustomEffect');
    if (savedColor) ctSelectedColor = savedColor;
    if (savedEffect) ctSelectedEffect = savedEffect;
    if (equippedTheme === 'theme-custom-user') {
        injectCustomThemeStyle();
        document.getElementById('geekieIframeContainer').classList.add('theme-custom-user');
        const badge = document.getElementById('customThemeEquippedBadge');
        if (badge) badge.style.display = 'inline-flex';
    }
})();

// ===================== TRILHA DE PROGRESSO =====================
const journeyNodes = [
    {
        id: 'j-start',
        icon: '🌱',
        xpReq: 0,
        title: 'Início da Jornada',
        desc: 'Você deu o primeiro passo. A jornada de mil milhas começa com um único estudo!',
        rewards: [{ type: 'coins', amount: 20, label: '+20 Moedas', chip: 'chip-coins' }],
        side: 'left'
    },
    {
        id: 'j-100',
        icon: '📚',
        xpReq: 100,
        title: 'Estudante Dedicado',
        desc: 'Você já tem consistência! Continue construindo seus hábitos de estudo.',
        rewards: [
            { type: 'coins', amount: 50, label: '+50 Moedas', chip: 'chip-coins' },
            { type: 'theme', id: 'theme-ubuntu-yaru', label: 'Tema Yaru', chip: 'chip-theme' }
        ],
        side: 'right'
    },
    {
        id: 'j-300',
        icon: '⚡',
        xpReq: 300,
        title: 'Aceleração',
        desc: 'Sua constância está dando frutos. O conhecimento começa a se consolidar!',
        rewards: [
            { type: 'coins', amount: 100, label: '+100 Moedas', chip: 'chip-coins' },
            { type: 'xp', amount: 50, label: '+50 XP Bônus', chip: 'chip-xp' }
        ],
        side: 'left'
    },
    {
        id: 'j-500',
        icon: '🧠',
        xpReq: 500,
        title: 'Mente Afiada',
        desc: 'Meio milhar de XP! Seu cérebro agradece cada sessão de estudo.',
        rewards: [
            { type: 'coins', amount: 150, label: '+150 Moedas', chip: 'chip-coins' },
            { type: 'theme', id: 'theme-ubuntu-radiance', label: 'Tema Radiance', chip: 'chip-theme' }
        ],
        side: 'right',
        boss: false
    },
    {
        id: 'j-750',
        icon: '🔮',
        xpReq: 750,
        title: 'Aprendiz Avançado',
        desc: 'Você já superou a maioria. A disciplina virou parte de você.',
        rewards: [
            { type: 'coins', amount: 200, label: '+200 Moedas', chip: 'chip-coins' },
            { type: 'xp', amount: 75, label: '+75 XP Bônus', chip: 'chip-xp' }
        ],
        side: 'left'
    },
    {
        id: 'j-1000',
        icon: '⭐',
        xpReq: 1000,
        title: '🏆 Marco do Mestre',
        desc: 'Você atingiu 1000 XP — apenas os mais dedicados chegam aqui. Recompensa especial desbloqueada!',
        rewards: [
            { type: 'coins', amount: 300, label: '+300 Moedas', chip: 'chip-coins' },
            { type: 'theme', id: 'theme-ubuntu-frost', label: 'Tema Frost', chip: 'chip-theme' },
            { type: 'special', label: '🎖️ Conquista Especial', chip: 'chip-special' }
        ],
        side: 'right',
        boss: true
    },
    {
        id: 'j-1500',
        icon: '🌊',
        xpReq: 1500,
        title: 'Fluxo do Saber',
        desc: 'Você entrou em um estado de flow com os estudos. Nada te para!',
        rewards: [
            { type: 'coins', amount: 250, label: '+250 Moedas', chip: 'chip-coins' },
            { type: 'theme', id: 'theme-ubuntu-ocean', label: 'Tema Ocean', chip: 'chip-theme' }
        ],
        side: 'left'
    },
    {
        id: 'j-2000',
        icon: '🔥',
        xpReq: 2000,
        title: 'Chama Imparável',
        desc: '2000 XP — a chama do conhecimento queima forte em você. Mantenha o ritmo!',
        rewards: [
            { type: 'coins', amount: 350, label: '+350 Moedas', chip: 'chip-coins' },
            { type: 'xp', amount: 150, label: '+150 XP Bônus', chip: 'chip-xp' },
            { type: 'theme', id: 'theme-ubuntu-fire', label: 'Tema Fire', chip: 'chip-theme' }
        ],
        side: 'right'
    },
    {
        id: 'j-3000',
        icon: '🐉',
        xpReq: 3000,
        title: '🏆 Domínio do Dragão',
        desc: 'Lendário! 3000 XP conquistados com puro esforço. Você é inspiração para quem te rodeia.',
        rewards: [
            { type: 'coins', amount: 500, label: '+500 Moedas', chip: 'chip-coins' },
            { type: 'theme', id: 'theme-ubuntu-cosmic', label: 'Tema Cosmic', chip: 'chip-theme' },
            { type: 'special', label: '👑 Título Especial', chip: 'chip-special' }
        ],
        side: 'left',
        boss: true
    },
    {
        id: 'j-5000',
        icon: '🌌',
        xpReq: 5000,
        title: 'Guardião do Cosmos',
        desc: '5000 XP — você transcendeu o nível comum. Sua mente opera em outra dimensão.',
        rewards: [
            { type: 'coins', amount: 700, label: '+700 Moedas', chip: 'chip-coins' },
            { type: 'theme', id: 'theme-ubuntu-nebula', label: 'Tema Nebula', chip: 'chip-theme' },
            { type: 'xp', amount: 300, label: '+300 XP Bônus', chip: 'chip-xp' }
        ],
        side: 'right'
    },
    {
        id: 'j-8000',
        icon: '⚡',
        xpReq: 8000,
        title: 'Energia Pura',
        desc: 'Oito mil XP. Uma força da natureza acadêmica. Poucos seres chegam tão longe.',
        rewards: [
            { type: 'coins', amount: 1000, label: '+1000 Moedas', chip: 'chip-coins' },
            { type: 'theme', id: 'theme-bg-synthwave', label: 'Tema Synthwave', chip: 'chip-theme' },
            { type: 'xp', amount: 500, label: '+500 XP Bônus', chip: 'chip-xp' }
        ],
        side: 'left'
    },
    {
        id: 'j-10000',
        icon: '✨',
        xpReq: 10000,
        title: '🏆 Divindade Acadêmica',
        desc: 'Você atingiu o cume absoluto. 10.000 XP — a forma mais pura de dedicação ao conhecimento.',
        rewards: [
            { type: 'coins', amount: 2000, label: '+2000 Moedas', chip: 'chip-coins' },
            { type: 'theme', id: 'theme-ubuntu-pulsar', label: 'Tema Pulsar', chip: 'chip-theme' },
            { type: 'special', label: '✨ Lenda Eterna', chip: 'chip-special' },
            { type: 'xp', amount: 1000, label: '+1000 XP Bônus', chip: 'chip-xp' }
        ],
        side: 'right',
        boss: true
    }
];

let journeyClaimed = JSON.parse(localStorage.getItem('geekieJourney')) || {};

function saveJourney() { localStorage.setItem('geekieJourney', JSON.stringify(journeyClaimed)); }

function spawnParticles(el) {
    const rect = el.getBoundingClientRect();
    const emojis = ['⭐','✨','🎉','💫','🌟','🎊'];
    for (let i = 0; i < 8; i++) {
        const p = document.createElement('div');
        p.className = 'journey-particle';
        p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        p.style.left = (rect.left + rect.width/2 + (Math.random()-0.5)*80) + 'px';
        p.style.top = (rect.top + rect.height/2 + (Math.random()-0.5)*40) + 'px';
        p.style.animationDelay = (Math.random()*0.3) + 's';
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 1200);
    }
}

function claimJourneyNode(nodeId, btn) {
    const node = journeyNodes.find(n => n.id === nodeId);
    if (!node || journeyClaimed[nodeId] || xp < node.xpReq) return;

    journeyClaimed[nodeId] = true;
    saveJourney();

    // Aplicar recompensas
    node.rewards.forEach(r => {
        if (r.type === 'coins') { earnCoins(r.amount, `Trilha: ${node.title}`); }
        if (r.type === 'xp') { xp += r.amount; updateXP(); showToast(`+${r.amount} XP Bônus — Trilha!`); }
        if (r.type === 'theme') {
            if (!ownedThemes.includes(r.id)) {
                ownedThemes.push(r.id);
                localStorage.setItem('geekieThemes', JSON.stringify(ownedThemes));
                showToast(`🎨 Tema "${r.label}" desbloqueado!`);
            }
        }
        if (r.type === 'special') { showToast(`🏆 Conquista especial desbloqueada: ${r.label}!`); }
    });

    spawnParticles(btn);
    setTimeout(() => renderJourney(), 200);
}

function renderJourney() {
    const trail = document.getElementById('journeyTrail');
    const summary = document.getElementById('journeySummary');
    const xpLabel = document.getElementById('journeyXpLabel');
    const nextLabel = document.getElementById('journeyNextLabel');
    const xpFill = document.getElementById('journeyXpFill');
    if (!trail) return;

    // Header stats
    if (xpLabel) xpLabel.textContent = xp;
    const claimed = Object.keys(journeyClaimed).length;
    const total = journeyNodes.length;
    const unlocked = journeyNodes.filter(n => xp >= n.xpReq).length;

    // Progress bar para o próximo nó
    const nextNode = journeyNodes.find(n => xp < n.xpReq);
    const prevNode = [...journeyNodes].reverse().find(n => xp >= n.xpReq) || journeyNodes[0];
    if (nextNode && xpFill) {
        const start = prevNode ? prevNode.xpReq : 0;
        const pct = Math.min(100, ((xp - start) / (nextNode.xpReq - start)) * 100);
        xpFill.style.width = pct + '%';
        if (nextLabel) nextLabel.textContent = `Próximo: ${nextNode.title.replace(/^🏆 /,'')} — ${nextNode.xpReq} XP`;
    } else if (xpFill) {
        xpFill.style.width = '100%';
        if (nextLabel) nextLabel.textContent = '🏆 Trilha completa!';
    }

    if (summary) {
        summary.innerHTML = `
            <div class="journey-stat"><strong style="color:var(--primary)">${xp}</strong><span>XP total</span></div>
            <div class="journey-stat"><strong style="color:var(--success)">${unlocked}</strong><span>Desbloqueados</span></div>
            <div class="journey-stat"><strong style="color:var(--gold)">${claimed}</strong><span>Resgatados</span></div>
            <div class="journey-stat"><strong style="color:var(--text-muted)">${total - claimed}</strong><span>Pendentes</span></div>
        `;
    }

    trail.innerHTML = '';
    journeyNodes.forEach((node, i) => {
        const isUnlocked = xp >= node.xpReq;
        const isClaimed  = !!journeyClaimed[node.id];
        const isRight    = node.side === 'right';
        const isBoss     = !!node.boss;

        // Estado do orb
        let orbClass = 'journey-orb';
        if (isBoss) orbClass += ' boss';
        if (isClaimed) orbClass += ' claimed';
        else if (isUnlocked) orbClass += ' unlocked';
        else orbClass += ' locked';

        // Estado do card
        let cardClass = 'journey-card';
        if (isClaimed) cardClass += ' claimed';
        else if (isUnlocked) cardClass += ' unlocked';
        else cardClass += ' locked';

        // Chips de recompensa
        const chips = node.rewards.map(r =>
            `<span class="reward-chip ${r.chip}">${r.label}</span>`
        ).join('');

        // Botão de ação
        let btnHtml = '';
        if (isClaimed) {
            btnHtml = `<button class="journey-claim-btn done"><i class="fa-solid fa-check"></i> Resgatado</button>`;
        } else if (isUnlocked) {
            btnHtml = `<button class="journey-claim-btn available" onclick="claimJourneyNode('${node.id}', this)"><i class="fa-solid fa-gift"></i> Resgatar Recompensa</button>`;
        } else {
            btnHtml = `<button class="journey-claim-btn locked-btn"><i class="fa-solid fa-lock"></i> ${node.xpReq} XP necessários</button>`;
        }

        const bossBadge = isBoss ? `<div class="journey-boss-label">✦ Nó Épico</div>` : '';

        const card = `
        <div class="${cardClass}">
            ${bossBadge}
            <h4>${node.title}</h4>
            <p>${node.desc}</p>
            <div class="reward-chips">${chips}</div>
            ${btnHtml}
        </div>`;

        const orbHtml = `
        <div class="${orbClass}">
            ${node.icon}
            <div class="orb-xp-badge">${node.xpReq === 0 ? 'Início' : node.xpReq + ' XP'}</div>
        </div>`;

        // Montar nó
        const nodeDiv = document.createElement('div');
        nodeDiv.className = 'journey-node' + (isRight ? ' node-right' : '');
        nodeDiv.innerHTML = isRight
            ? card + orbHtml
            : orbHtml + card;
        trail.appendChild(nodeDiv);

        // Conector entre nós
        if (i < journeyNodes.length - 1) {
            const nextUnlocked = xp >= journeyNodes[i+1].xpReq;
            const connClass = 'journey-connector' + (nextUnlocked ? ' unlocked' : isUnlocked ? ' partial' : '');
            const conn = document.createElement('div');
            conn.className = connClass;
            trail.appendChild(conn);
        }
    });
}

// Hook: renderizar ao trocar de aba
const _origSwitchTab = switchTab;
// (já chamado em switchTab via tab-journey check abaixo)

// ===================== SONS DE TECLADO =====================
const keySoundsData = [
    { id: 'ks-click',  name: 'Click Magnético', desc: 'Som clássico de teclado magnético — suave e relaxante',      icon: '⌨️', xpCost: 0    },
    { id: 'ks-soft',   name: 'Toque Veludo',    desc: 'Toque macio e acolchoado, ideal para sessões longas',          icon: '🌸', xpCost: 50   },
    { id: 'ks-crystal',name: 'Cristal',          desc: 'Tom cristalino e etéreo que limpa a mente',                   icon: '💎', xpCost: 100  },
    { id: 'ks-deep',   name: 'Eco Profundo',    desc: 'Click grave e ressonante, como uma câmara escura',             icon: '🔊', xpCost: 150  },
    { id: 'ks-pop',    name: 'Pop Magnético',   desc: 'Pop satisfatório de tecla magnética de alta qualidade',        icon: '🧲', xpCost: 200  },
    { id: 'ks-spring', name: 'Mola Suave',      desc: 'Vibração leve como uma mola — ritmo perfeito de escrita',      icon: '🌀', xpCost: 300  },
    { id: 'ks-bamboo', name: 'Bambu',           desc: 'Toque orgânico e natural de bambu, tom quente e acolhedor',    icon: '🎋', xpCost: 400  },
    { id: 'ks-glass',  name: 'Vidro',           desc: 'Tintinar delicado de vidro fino, suave e elegante',            icon: '🔮', xpCost: 500  },
    { id: 'ks-rain',   name: 'Gota de Chuva',  desc: 'Som relaxante de gota d\'água sobre uma superfície suave',      icon: '💧', xpCost: 700  },
    { id: 'ks-zen',    name: 'Sino Zen',        desc: 'Sino tibetano para foco e meditação profunda',                 icon: '🔔', xpCost: 1000 },
];

let keySoundActive = localStorage.getItem('geekieKeySound') || 'none';
let keySoundUnlocked = JSON.parse(localStorage.getItem('geekieKeySoundsUnlocked') || '["ks-click"]');
let ksAudioCtx = null;
let ksLastSoundTime = 0;
const KS_THROTTLE_MS = 28;

function ksGetCtx() {
    if (!ksAudioCtx || ksAudioCtx.state === 'closed') {
        ksAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ksAudioCtx.state === 'suspended') ksAudioCtx.resume();
    return ksAudioCtx;
}

const ksSoundGenerators = {
    'ks-click': function(ctx) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'square';
        var t = ctx.currentTime;
        o.frequency.setValueAtTime(1400, t);
        o.frequency.exponentialRampToValueAtTime(380, t + 0.025);
        g.gain.setValueAtTime(0.13, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
        o.start(t); o.stop(t + 0.07);
    },
    'ks-soft': function(ctx) {
        var o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
        o.connect(f); f.connect(g); g.connect(ctx.destination);
        f.type = 'lowpass'; f.frequency.value = 700;
        o.type = 'sine';
        var t = ctx.currentTime;
        o.frequency.setValueAtTime(550, t);
        o.frequency.exponentialRampToValueAtTime(180, t + 0.07);
        g.gain.setValueAtTime(0.18, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        o.start(t); o.stop(t + 0.12);
    },
    'ks-crystal': function(ctx) {
        var o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
        o1.connect(g); o2.connect(g); g.connect(ctx.destination);
        o1.type = 'sine'; o2.type = 'sine';
        var t = ctx.currentTime;
        o1.frequency.value = 2100; o2.frequency.value = 4200;
        g.gain.setValueAtTime(0.07, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        o1.start(t); o1.stop(t + 0.3); o2.start(t); o2.stop(t + 0.3);
    },
    'ks-deep': function(ctx) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'sawtooth';
        var t = ctx.currentTime;
        o.frequency.setValueAtTime(210, t);
        o.frequency.exponentialRampToValueAtTime(55, t + 0.12);
        g.gain.setValueAtTime(0.18, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        o.start(t); o.stop(t + 0.18);
    },
    'ks-pop': function(ctx) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'square';
        var t = ctx.currentTime;
        o.frequency.setValueAtTime(820, t);
        o.frequency.exponentialRampToValueAtTime(280, t + 0.035);
        g.gain.setValueAtTime(0.11, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.055);
        o.start(t); o.stop(t + 0.055);
    },
    'ks-spring': function(ctx) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'sine';
        var t = ctx.currentTime;
        o.frequency.setValueAtTime(350, t);
        o.frequency.linearRampToValueAtTime(750, t + 0.018);
        o.frequency.exponentialRampToValueAtTime(180, t + 0.14);
        g.gain.setValueAtTime(0.14, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
        o.start(t); o.stop(t + 0.16);
    },
    'ks-bamboo': function(ctx) {
        var sr = ctx.sampleRate;
        var buf = ctx.createBuffer(1, Math.ceil(sr * 0.07), sr);
        var d = buf.getChannelData(0);
        for (var i = 0; i < d.length; i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/d.length, 6);
        var src = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
        src.buffer = buf; src.connect(bp); bp.connect(g); g.connect(ctx.destination);
        bp.type = 'bandpass'; bp.frequency.value = 1100; bp.Q.value = 2.2;
        g.gain.setValueAtTime(2.0, ctx.currentTime);
        src.start(ctx.currentTime);
    },
    'ks-glass': function(ctx) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'sine';
        var t = ctx.currentTime;
        o.frequency.value = 3600;
        g.gain.setValueAtTime(0.06, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        o.start(t); o.stop(t + 0.35);
    },
    'ks-rain': function(ctx) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'sine';
        var t = ctx.currentTime;
        o.frequency.setValueAtTime(1900, t);
        o.frequency.exponentialRampToValueAtTime(500, t + 0.09);
        g.gain.setValueAtTime(0.11, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
        o.start(t); o.stop(t + 0.11);
    },
    'ks-zen': function(ctx) {
        var o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
        o1.connect(g); o2.connect(g); g.connect(ctx.destination);
        o1.type = 'sine'; o2.type = 'sine';
        var t = ctx.currentTime;
        o1.frequency.value = 432; o2.frequency.value = 540;
        g.gain.setValueAtTime(0.0, t);
        g.gain.linearRampToValueAtTime(0.1, t + 0.015);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
        o1.start(t); o1.stop(t + 0.9); o2.start(t); o2.stop(t + 0.9);
    },
};

function ksPlaySound() {
    if (keySoundActive === 'none') return;
    var now = performance.now();
    if (now - ksLastSoundTime < KS_THROTTLE_MS) return;
    ksLastSoundTime = now;
    try {
        var ctx = ksGetCtx();
        var gen = ksSoundGenerators[keySoundActive];
        if (gen) gen(ctx);
    } catch(e) {}
}

document.addEventListener('keydown', function(e) {
    // Skip pure modifier keys, function keys — don't interfere with system shortcuts
    if (['Control','Shift','Alt','Meta','CapsLock','Tab',
         'F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12'].includes(e.key)) return;
    // Skip Ctrl/Alt combos (app shortcuts like Ctrl+B, Ctrl+Shift+A, Alt+1..9)
    if (e.ctrlKey || e.altKey) return;
    ksPlaySound();
});

document.addEventListener('mousedown', function() {
    ksPlaySound();
});

function ksSelectSound(id) {
    keySoundActive = id;
    localStorage.setItem('geekieKeySound', id);
    renderKeySoundsTab();
    setTimeout(ksPlaySound, 60);
}

function ksDeactivate() {
    keySoundActive = 'none';
    localStorage.setItem('geekieKeySound', 'none');
    try { renderKeySoundsTab(); } catch(e) {}
    showToast('🔇 Sons de teclado desativados.');
}

function ksUnlock(id) {
    var s = keySoundsData.find(function(x){ return x.id === id; });
    if (!s) return;
    if (xp < s.xpCost) { showToast('XP insuficiente! Precisa de ' + s.xpCost + ' XP.', true); return; }
    if (!keySoundUnlocked.includes(id)) {
        xp -= s.xpCost;
        updateXP();
        keySoundUnlocked.push(id);
        localStorage.setItem('geekieKeySoundsUnlocked', JSON.stringify(keySoundUnlocked));
        try { adminLog('Som desbloqueado: ' + s.name + ' (−' + s.xpCost + ' XP)'); } catch(e) {}
    }
    ksSelectSound(id);
    showToast('🎹 "' + s.name + '" desbloqueado e ativado!');
}

function adminUnlockAllSounds() {
    keySoundsData.forEach(function(s) {
        if (!keySoundUnlocked.includes(s.id)) keySoundUnlocked.push(s.id);
    });
    localStorage.setItem('geekieKeySoundsUnlocked', JSON.stringify(keySoundUnlocked));
    try { renderKeySoundsTab(); } catch(e) {}
    showToast('🎹 Todos os sons de teclado desbloqueados!');
    try { adminLog('Admin: Todos os sons de teclado desbloqueados'); } catch(e) {}
}

function renderKeySoundsTab() {
    var grid = document.getElementById('keySoundsGrid');
    if (!grid) return;
    // Ensure free sound is always owned
    if (!keySoundUnlocked.includes('ks-click')) {
        keySoundUnlocked.push('ks-click');
        localStorage.setItem('geekieKeySoundsUnlocked', JSON.stringify(keySoundUnlocked));
    }
    var html = '';
    keySoundsData.forEach(function(s) {
        var isOwned = keySoundUnlocked.includes(s.id) || s.xpCost === 0;
        var isActive = keySoundActive === s.id;
        var canBuy = !isOwned && xp >= s.xpCost;
        var btnHtml = '';
        if (isActive) {
            btnHtml = '<button class="btn btn-outline w-full" disabled style="border-color:var(--primary);color:var(--primary);margin-top:4px;width:100%;"><i class="fa-solid fa-check"></i> Ativo</button>' +
                      '<button class="btn btn-outline w-full" onclick="ksDeactivate()" style="color:var(--danger);border-color:rgba(255,71,87,0.4);margin-top:4px;font-size:0.75rem;width:100%;"><i class="fa-solid fa-volume-xmark"></i> Desativar</button>';
        } else if (isOwned) {
            btnHtml = '<button class="btn btn-primary" onclick="ksSelectSound(\'' + s.id + '\')" style="margin-top:4px;width:100%;"><i class="fa-solid fa-play"></i> Ativar</button>';
        } else if (canBuy) {
            btnHtml = '<button class="btn btn-outline" onclick="ksUnlock(\'' + s.id + '\')" style="color:var(--accent);border-color:var(--accent);margin-top:4px;width:100%;"><i class="fa-solid fa-lock-open"></i> Desbloquear (−' + s.xpCost + ' XP)</button>';
        } else {
            btnHtml = '<button disabled style="width:100%;margin-top:4px;background:rgba(0,0,0,0.25);border:1px solid var(--border);color:var(--text-muted);border-radius:8px;padding:8px;cursor:not-allowed;font-size:0.82rem;"><i class="fa-solid fa-lock"></i> ' + s.xpCost + ' XP</button>';
        }
        html += '<div class="ks-card' + (isActive ? ' ks-active' : '') + (isOwned ? ' ks-owned' : ' ks-locked') + '">' +
            '<span class="ks-icon">' + s.icon + '</span>' +
            '<div class="ks-name">' + s.name + '</div>' +
            '<div class="ks-desc">' + s.desc + '</div>' +
            '<div class="ks-xp-req">' + (s.xpCost === 0 ? '<span style="color:var(--success);">✅ Grátis</span>' : '<i class="fa-solid fa-star" style="color:#a78bfa;font-size:0.72rem;"></i> Custa <strong>' + s.xpCost + '</strong> XP') + '</div>' +
            btnHtml + '</div>';
    });
    grid.innerHTML = html;
    var statusEl = document.getElementById('keySoundStatus');
    if (statusEl) {
        var active = keySoundsData.find(function(s){ return s.id === keySoundActive; });
        statusEl.innerHTML = active
            ? active.icon + ' <strong>' + active.name + '</strong> ativo — sons tocam a cada tecla e clique'
            : '<strong>🔇 Sons desativados</strong> — selecione um som abaixo para ativar';
    }
}

// Initialize
keySoundActive = localStorage.getItem('geekieKeySound') || 'none';
keySoundUnlocked = JSON.parse(localStorage.getItem('geekieKeySoundsUnlocked') || '["ks-click"]');

// ===================== FIM DOS SONS DE TECLADO =====================

// Initialize journey on page load (for direct URL hash access)
try { renderJourney(); } catch(e) {}

// ===================== ATALHO Ctrl+B para Aba de Comandos =====================
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        const overlay = document.getElementById('cmdPaletteOverlay');
        if (overlay.classList.contains('open')) { closeCmdPalette(); }
        else { openCmdPalette(); }
    }
});

// ===================== CLICKER MINIGAME v14.0.0 =====================
const CLICKER_SAVE_KEY = 'geekieClickerGame';
let clickerData = {
    points: 0,
    totalClicks: 0,
    clicksPerSecond: 0,
    clickHistory: [],
    upgrades: {
        autoclicker: { level: 0, baseCost: 10, costMult: 1.8, effect: 0 },
        multiplier: { level: 0, baseCost: 50, costMult: 2.0, effect: 1 },
        critical: { level: 0, baseCost: 100, costMult: 2.2, effect: 0 },
        golden: { level: 0, baseCost: 200, costMult: 2.5, effect: 0 },
        powersurge: { level: 0, baseCost: 500, costMult: 3.0, effect: 0 }
    },
    achievements: {},
    goldenClicks: 0,
    criticalClicks: 0
};

// Upgrade definitions
const UPGRADE_DEFS = {
    autoclicker: {
        name: 'Auto-Clicker',
        icon: 'fa-robot',
        desc: 'Gera cliques automáticos a cada segundo',
        maxLevel: 10,
        getEffect: (lvl) => lvl * 1,
        getDesc: (lvl) => `+${lvl} clique(s)/seg`
    },
    multiplier: {
        name: 'Multiplicador',
        icon: 'fa-times',
        desc: 'Multiplica pontos por clique',
        maxLevel: 10,
        getEffect: (lvl) => 1 + (lvl * 0.5),
        getDesc: (lvl) => `x${(1 + lvl * 0.5).toFixed(1)} pontos`
    },
    critical: {
        name: 'Chance Crítica',
        icon: 'fa-crosshairs',
        desc: 'Chance de cliques críticos (2x-5x)',
        maxLevel: 10,
        getEffect: (lvl) => lvl * 3,
        getDesc: (lvl) => `${lvl * 3}% chance`
    },
    golden: {
        name: 'Golden Clicks',
        icon: 'fa-star',
        desc: 'Chance de golden clicks com bônus',
        maxLevel: 10,
        getEffect: (lvl) => lvl * 2,
        getDesc: (lvl) => `${lvl * 2}% chance`
    },
    powersurge: {
        name: 'Power Surge',
        icon: 'fa-bolt',
        desc: 'Aumenta poder base do clique',
        maxLevel: 10,
        getEffect: (lvl) => lvl * 2,
        getDesc: (lvl) => `+${lvl * 2} poder base`
    }
};

// Achievement definitions
const ACHIEVEMENT_DEFS = [
    { id: 'first_click', name: 'First Click', icon: 'fa-hand-pointer', desc: 'Faça seu primeiro clique', condition: (d) => d.totalClicks >= 1 },
    { id: 'century_club', name: 'Century Club', icon: 'fa-100', desc: 'Alcance 100 cliques', condition: (d) => d.totalClicks >= 100 },
    { id: 'click_master', name: 'Click Master', icon: 'fa-crown', desc: 'Alcance 1.000 cliques', condition: (d) => d.totalClicks >= 1000 },
    { id: 'click_legend', name: 'Click Legend', icon: 'fa-fire', desc: 'Alcance 10.000 cliques', condition: (d) => d.totalClicks >= 10000 },
    { id: 'auto_enthusiast', name: 'Auto Enthusiast', icon: 'fa-robot', desc: 'Compre Auto-Clicker nível 1', condition: (d) => d.upgrades.autoclicker.level >= 1 },
    { id: 'multiplier_maniac', name: 'Multiplier Maniac', icon: 'fa-infinity', desc: 'Maximize o Multiplicador', condition: (d) => d.upgrades.multiplier.level >= 10 },
    { id: 'golden_touch', name: 'Golden Touch', icon: 'fa-gem', desc: 'Faça 50 golden clicks', condition: (d) => d.goldenClicks >= 50 },
    { id: 'speed_demon', name: 'Speed Demon', icon: 'fa-gauge-high', desc: 'Alcançar 100 CPS', condition: (d) => d.clicksPerSecond >= 100 }
];

// Initialize Clicker Game
function initClickerGame() {
    loadClickerGame();
    renderUpgrades();
    renderAchievements();
    updateClickerDisplay();
    startAutoClicker();
    startCPSCounter();
    
    // Auto-save every 30 seconds
    setInterval(saveClickerGame, 30000);
}

// Load game from localStorage
function loadClickerGame() {
    try {
        const saved = localStorage.getItem(CLICKER_SAVE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            clickerData = { ...clickerData, ...parsed };
        }
    } catch(e) {
        console.error('Error loading clicker data:', e);
    }
}

// Save game to localStorage
function saveClickerGame() {
    try {
        localStorage.setItem(CLICKER_SAVE_KEY, JSON.stringify(clickerData));
        showToast('<i class="fa-solid fa-floppy-disk"></i> Clicker salvo!');
    } catch(e) {
        console.error('Error saving clicker data:', e);
    }
}

// Handle main button click
function handleClick(event) {
    const btn = document.getElementById('clickerButton');
    const rect = btn.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Calculate click power
    const multEffect = UPGRADE_DEFS.multiplier.getEffect(clickerData.upgrades.multiplier.level);
    const powerEffect = UPGRADE_DEFS.powersurge.getEffect(clickerData.upgrades.powersurge.level);
    let basePoints = 1 + powerEffect;
    let points = Math.floor(basePoints * multEffect);
    let clickType = 'normal';
    
    // Check for critical hit
    const critChance = UPGRADE_DEFS.critical.getEffect(clickerData.upgrades.critical.level);
    if (critChance > 0 && Math.random() * 100 < critChance) {
        const critMult = 2 + Math.floor(Math.random() * 4); // 2x-5x
        points *= critMult;
        clickType = 'critical';
        clickerData.criticalClicks++;
    }
    
    // Check for golden click
    const goldChance = UPGRADE_DEFS.golden.getEffect(clickerData.upgrades.golden.level);
    if (goldChance > 0 && Math.random() * 100 < goldChance) {
        points += 25 + Math.floor(Math.random() * 26); // 25-50 bonus
        clickType = 'golden';
        clickerData.goldenClicks++;
    }
    
    // Update stats
    clickerData.points += points;
    clickerData.totalClicks++;
    
    // Track clicks for CPS calculation
    const now = Date.now();
    clickerData.clickHistory.push(now);
    clickerData.clickHistory = clickerData.clickHistory.filter(t => now - t < 1000);
    
    // Create visual effects
    createRipple(event.clientX - rect.left, event.clientY - rect.top, rect);
    createFloatNumber(x, y, points, clickType, rect);
    createParticles(x, y, clickType);
    
    // Update display and check achievements
    updateClickerDisplay();
    checkAchievements();
}

// Create ripple effect
function createRipple(x, y, containerRect) {
    const container = document.getElementById('clickerButtonContainer');
    const ripple = document.createElement('div');
    ripple.className = 'clicker-ripple';
    ripple.style.width = ripple.style.height = '80px';
    ripple.style.left = (x - 40) + 'px';
    ripple.style.top = (y - 40) + 'px';
    container.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}

// Create floating number
function createFloatNumber(x, y, value, type, containerRect) {
    const container = document.getElementById('clickerButtonContainer');
    const floatNum = document.createElement('div');
    floatNum.className = 'float-number ' + type;
    floatNum.textContent = type === 'critical' ? 'CRITICAL! +' + value : type === 'golden' ? 'GOLDEN! +' + value : '+' + value;
    floatNum.style.left = x + 'px';
    floatNum.style.top = y + 'px';
    container.appendChild(floatNum);
    setTimeout(() => floatNum.remove(), 1000);
}

// Create particles on click
function createParticles(x, y, type) {
    const container = document.getElementById('particlesContainer');
    const colors = type === 'critical' ? ['#ffd700', '#ffaa00', '#fff'] : 
                    type === 'golden' ? ['#ffd700', '#ffec8b', '#fff'] :
                    ['#ff6b6b', '#ff8787', '#ffa8a8'];
    
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        
        const angle = (i / 8) * Math.PI * 2;
        const distance = 60 + Math.random() * 40;
        const tx = Math.cos(angle) * distance + 'px';
        const ty = Math.sin(angle) * distance + 'px';
        particle.style.setProperty('--tx', tx);
        particle.style.setProperty('--ty', ty);
        
        container.appendChild(particle);
        setTimeout(() => particle.remove(), 800);
    }
}

// Render upgrades list
function renderUpgrades() {
    const list = document.getElementById('upgradeList');
    if (!list) return;
    
    list.innerHTML = '';
    
    for (const [key, def] of Object.entries(UPGRADE_DEFS)) {
        const upgrade = clickerData.upgrades[key];
        const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMult, upgrade.level));
        const isMaxed = upgrade.level >= def.maxLevel;
        const canAfford = clickerData.points >= cost;
        
        const item = document.createElement('div');
        item.className = 'upgrade-item' + (isMaxed ? ' maxed' : '');
        item.innerHTML = `
            <div class="upgrade-header">
                <span class="upgrade-name"><i class="fa-solid ${def.icon}"></i> ${def.name}</span>
                <span class="upgrade-level">${isMaxed ? 'MAX' : 'Lv.' + upgrade.level + '/' + def.maxLevel}</span>
            </div>
            <div class="upgrade-desc">${def.desc} — ${def.getDesc(upgrade.level)}</div>
            <div class="upgrade-footer">
                <span class="upgrade-cost">${isMaxed ? '✓ Completo' : '💰 ' + formatNumber(cost)}</span>
                <button class="upgrade-btn" ${isMaxed || !canAfford ? 'disabled' : ''} 
                    onclick="buyUpgrade('${key}')">${isMaxed ? 'Max' : 'Comprar'}</button>
            </div>
            <div class="upgrade-progress">
                <div class="upgrade-progress-bar" style="width: ${(upgrade.level / def.maxLevel) * 100}%"></div>
            </div>
        `;
        list.appendChild(item);
    }
}

// Buy an upgrade
function buyUpgrade(key) {
    const upgrade = clickerData.upgrades[key];
    const def = UPGRADE_DEFS[key];
    const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMult, upgrade.level));
    
    if (upgrade.level >= def.maxLevel) return;
    if (clickerData.points < cost) return;
    
    clickerData.points -= cost;
    upgrade.level++;
    
    // Apply effects immediately
    if (key === 'autoclicker') {
        upgrade.effect = def.getEffect(upgrade.level);
    }
    
    updateClickerDisplay();
    renderUpgrades();
    checkAchievements();
    showToast(`<i class="fa-solid ${def.icon}"></i> ${def.name} nível ${upgrade.level}!`);
}

// Render achievements
function renderAchievements() {
    const list = document.getElementById('achievementsList');
    const countEl = document.getElementById('achievementCount');
    if (!list) return;
    
    list.innerHTML = '';
    let unlockedCount = 0;
    
    ACHIEVEMENT_DEFS.forEach(ach => {
        const isUnlocked = clickerData.achievements[ach.id];
        if (isUnlocked) unlockedCount++;
        
        const item = document.createElement('div');
        item.className = 'achievement-item' + (isUnlocked ? ' unlocked' : '');
        item.id = 'ach-' + ach.id;
        item.innerHTML = `
            <span class="achievement-icon"><i class="fa-solid ${ach.icon}"></i></span>
            <div class="achievement-info">
                <div class="achievement-name">${ach.name}</div>
                <div class="achievement-desc">${ach.desc}</div>
            </div>
        `;
        list.appendChild(item);
    });
    
    if (countEl) countEl.textContent = unlockedCount + '/' + ACHIEVEMENT_DEFS.length;
}

// Check and unlock achievements
function checkAchievements() {
    ACHIEVEMENT_DEFS.forEach(ach => {
        if (!clickerData.achievements[ach.id] && ach.condition(clickerData)) {
            clickerData.achievements[ach.id] = true;
            
            // Visual feedback
            const el = document.getElementById('ach-' + ach.id);
            if (el) {
                el.classList.add('unlocked');
                el.style.animation = 'none';
                void el.offsetWidth; // Trigger reflow
                el.style.animation = 'achievementUnlock 0.5s ease';
            }
            
            showToast(`🏆 Conquista desbloqueada: ${ach.name}!`);
        }
    });
    
    renderAchievements();
    updateNextAchievementProgress();
}

// Update next achievement progress bar
function updateNextAchievementProgress() {
    const box = document.getElementById('nextAchievementBox');
    const nameEl = document.getElementById('nextAchievementName');
    const progressEl = document.getElementById('nextAchievementProgress');
    const barEl = document.getElementById('nextAchievementBar');
    
    if (!box) return;
    
    // Find next locked achievement based on total clicks
    const nextAch = ACHIEVEMENT_DEFS.find(a => !clickerData.achievements[a.id] && 
        ['first_click', 'century_club', 'click_master', 'click_legend'].includes(a.id));
    
    if (nextAch && nextAch.id === 'first_click') {
        box.style.display = 'none';
        return;
    }
    
    if (nextAch) {
        box.style.display = 'block';
        nameEl.textContent = nextAch.name;
        
        let current = clickerData.totalClicks;
        let target = 0;
        if (nextAch.id === 'century_club') target = 100;
        else if (nextAch.id === 'click_master') target = 1000;
        else if (nextAch.id === 'click_legend') target = 10000;
        
        progressEl.textContent = formatNumber(current) + '/' + formatNumber(target);
        barEl.style.width = Math.min((current / target) * 100, 100) + '%';
    } else {
        box.style.display = 'none';
    }
}

// Update all displays
function updateClickerDisplay() {
    const pointsEl = document.getElementById('clickerPoints');
    const cpsEl = document.getElementById('clickerCPS');
    const totalEl = document.getElementById('clickerTotal');
    const powerEl = document.getElementById('clickerPower');
    
    if (pointsEl) pointsEl.textContent = formatNumber(clickerData.points);
    if (cpsEl) cpsEl.textContent = clickerData.clicksPerSecond.toFixed(1);
    if (totalEl) totalEl.textContent = formatNumber(clickerData.totalClicks);
    
    if (powerEl) {
        const mult = UPGRADE_DEFS.multiplier.getEffect(clickerData.upgrades.multiplier.level);
        const power = UPGRADE_DEFS.powersurge.getEffect(clickerData.upgrades.powersurge.level);
        powerEl.textContent = `+${Math.floor((1 + power) * mult)} por clique`;
    }
    
    // Re-render upgrades to update costs/affordability
    renderUpgrades();
}

// Format large numbers
function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

// Start auto-clicker interval
function startAutoClicker() {
    setInterval(() => {
        const autoLevel = clickerData.upgrades.autoclicker.level;
        if (autoLevel <= 0) return;
        
        const autoClicks = UPGRADE_DEFS.autoclicker.getEffect(autoLevel);
        const multEffect = UPGRADE_DEFS.multiplier.getEffect(clickerData.upgrades.multiplier.level);
        const powerEffect = UPGRADE_DEFS.powersurge.getEffect(clickerData.upgrades.powersurge.level);
        const pointsPerClick = Math.floor((1 + powerEffect) * multEffect);
        
        clickerData.points += autoClicks * pointsPerClick;
        clickerData.totalClicks += autoClicks;
        
        updateClickerDisplay();
        checkAchievements();
    }, 1000);
}

// Track CPS
function startCPSCounter() {
    setInterval(() => {
        const now = Date.now();
        clickerData.clickHistory = clickerData.clickHistory.filter(t => now - t < 1000);
        clickerData.clicksPerSecond = clickerData.clickHistory.length;
        
        const cpsEl = document.getElementById('clickerCPS');
        if (cpsEl) cpsEl.textContent = clickerData.clicksPerSecond.toFixed(1);
        
        checkAchievements();
    }, 500);
}

// Confirm reset with dialog
function confirmResetClicker() {
    if (confirm('⚠️ Tem certeza que deseja resetar todo o progresso do Clicker?\n\nEssa ação não pode ser desfeita!')) {
        localStorage.removeItem(CLICKER_SAVE_KEY);
        clickerData = {
            points: 0,
            totalClicks: 0,
            clicksPerSecond: 0,
            clickHistory: [],
            upgrades: {
                autoclicker: { level: 0, baseCost: 10, costMult: 1.8, effect: 0 },
                multiplier: { level: 0, baseCost: 50, costMult: 2.0, effect: 1 },
                critical: { level: 0, baseCost: 100, costMult: 2.2, effect: 0 },
                golden: { level: 0, baseCost: 200, costMult: 2.5, effect: 0 },
                powersurge: { level: 0, baseCost: 500, costMult: 3.0, effect: 0 }
            },
            achievements: {},
            goldenClicks: 0,
            criticalClicks: 0
        };
        renderUpgrades();
        renderAchievements();
        updateClickerDisplay();
        showToast('<i class="fa-solid fa-rotate-left"></i> Clicker resetado!');
    }
}

// Initialize clicker when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initClickerGame();
});


// ===================== FAB NAVIGATION =====================
let fabMenuOpen = false;

function toggleFabMenu() {
    fabMenuOpen = !fabMenuOpen;
    const menu = document.getElementById('fabMenu');
    const btn = document.getElementById('fabBtn');
    if (fabMenuOpen) {
        menu.classList.add('open');
        btn.classList.add('open');
    } else {
        menu.classList.remove('open');
        btn.classList.remove('open');
    }
}

function closeFabMenu() {
    fabMenuOpen = false;
    document.getElementById('fabMenu').classList.remove('open');
    document.getElementById('fabBtn').classList.remove('open');
}

function fabSwitch(tabId, fabId) {
    // Atualizar estado visual do FAB nav
    document.querySelectorAll('.fab-nav-item').forEach(el => el.classList.remove('active'));
    const fabEl = document.getElementById(fabId);
    if (fabEl) fabEl.classList.add('active');
    
    // Delegar para switchTab que já trata tudo (incluindo inicializações)
    switchTab(tabId, null);
    
    // Fechar menu FAB
    closeFabMenu();
}

document.addEventListener('click', function(e) {
    const wrapper = document.getElementById('fabWrapper');
    if (wrapper && !wrapper.contains(e.target) && fabMenuOpen) closeFabMenu();
});

// ===================== ADMIN MELHORADO =====================
function admSwitchTab(paneId) {
    document.querySelectorAll('.adm-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.adm-pane').forEach(p => p.classList.remove('active'));
    const pane = document.getElementById(paneId);
    if (pane) pane.classList.add('active');
    document.querySelectorAll('.adm-tab').forEach(t => {
        if (t.getAttribute('onclick') && t.getAttribute('onclick').includes(paneId)) t.classList.add('active');
    });
    updateAdminStats();
}

function updateAdminStats() {
    const xpEl = document.getElementById('admXpVal');
    const coinEl = document.getElementById('admCoinVal');
    const pomEl = document.getElementById('admPomodoroVal');
    if (xpEl) xpEl.textContent = xp;
    if (coinEl) coinEl.textContent = coins;
    if (pomEl) pomEl.textContent = parseInt(localStorage.getItem('geekiePomodoroTotal') || '0');
}

function adminLog(msg) {
    const log = document.getElementById('adminLog');
    if (!log) return;
    const entry = document.createElement('div');
    entry.className = 'adm-log-entry';
    entry.innerHTML = '<span class="adm-log-time">' + new Date().toLocaleTimeString('pt-BR') + '</span><span class="adm-log-msg">' + msg + '</span>';
    log.insertBefore(entry, log.firstChild);
    if (log.children.length > 30) log.removeChild(log.lastChild);
}

// Override adminAddXP para incluir log
const _origAdminAddXP = adminAddXP;
adminAddXP = function() {
    const amount = parseInt(document.getElementById('adminXpAmount').value) || 0;
    if (amount <= 0) { showToast('Digite uma quantidade válida!', true); return; }
    gainXP(amount);
    adminLog('+' + amount + ' XP adicionado');
    updateAdminStats();
    showToast('⚡ Admin: +' + amount + ' XP adicionado!');
};

// Override adminAddCoins para incluir log
const _origAdminAddCoins = adminAddCoins;
adminAddCoins = function() {
    const amount = parseInt(document.getElementById('adminCoinAmount').value) || 0;
    if (amount <= 0) { showToast('Digite uma quantidade válida!', true); return; }
    earnCoins(amount, 'Admin: +' + amount + ' moedas');
    adminLog('+' + amount + ' moedas adicionadas');
    updateAdminStats();
};

function adminSetExactXP() {
    const val = parseInt(document.getElementById('adminSetXp').value) || 0;
    xp = val;
    localStorage.setItem('geekieXP', xp);
    document.getElementById('xpCount').textContent = xp;
    try { renderTitles(); updatePlayerTitle(); renderStore(); renderPetGrid(); renderEventContent(); updateXPProgressBar(); } catch(e) {}
    adminLog('XP definido para ' + val);
    updateAdminStats();
    showToast('⚡ XP definido para ' + val + '!');
}

function adminSetExactCoins() {
    const val = parseInt(document.getElementById('adminSetCoins').value) || 0;
    coins = val;
    updateCoins();
    adminLog('Moedas definidas para ' + val);
    updateAdminStats();
    showToast('🪙 Moedas definidas para ' + val + '!');
}

function adminRedeemAllCodes() {
    if (!confirm('Resgatar todos os códigos disponíveis?')) return;
    let count = 0;
    codesData.forEach(c => {
        if (!redeemedCodes.includes(c.code)) {
            redeemedCodes.push(c.code);
            c.action();
            count++;
        }
    });
    localStorage.setItem('geekieRedeemedCodes', JSON.stringify(redeemedCodes));
    try { renderCodesGrid(); } catch(e) {}
    adminLog(count + ' códigos resgatados');
    updateAdminStats();
    showToast('🎁 ' + count + ' códigos resgatados!');
}

function adminClaimAllJourney() {
    if (!confirm('Resgatar todos os nós da trilha?')) return;
    let count = 0;
    journeyNodes.forEach(node => {
        if (!journeyClaimed[node.id]) {
            journeyClaimed[node.id] = true;
            node.rewards.forEach(r => {
                if (r.type === 'coins') earnCoins(r.amount, 'Trilha: ' + node.title);
                if (r.type === 'xp') { xp += r.amount; updateXP(); }
                if (r.type === 'theme' && !ownedThemes.includes(r.id)) { ownedThemes.push(r.id); localStorage.setItem('geekieThemes', JSON.stringify(ownedThemes)); }
            });
            count++;
        }
    });
    try { saveJourney(); } catch(e) {}
    adminLog(count + ' nós da trilha resgatados');
    updateAdminStats();
    showToast('🗺️ ' + count + ' nós da trilha resgatados!');
}

function adminExportData() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('geekie')) data[key] = localStorage.getItem(key);
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'geekie-backup-' + new Date().toISOString().slice(0,10) + '.json';
    a.click();
    adminLog('Dados exportados');
    showToast('💾 Dados exportados com sucesso!');
}

function adminImportData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        try {
            const data = JSON.parse(e.target.result);
            if (!confirm('Isso irá SUBSTITUIR todos os dados atuais. Continuar?')) return;
            Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, v));
            adminLog('Dados importados');
            showToast('📥 Dados importados! Recarregando...');
            setTimeout(() => location.reload(), 1500);
        } catch(err) { showToast('Arquivo inválido!', true); }
    };
    reader.readAsText(file);
    event.target.value = '';
}

function adminResetXPOnly() {
    if (!confirm('Resetar apenas o XP?')) return;
    xp = 0;
    localStorage.setItem('geekieXP', 0);
    document.getElementById('xpCount').textContent = 0;
    try { renderTitles(); updatePlayerTitle(); renderStore(); updateXPProgressBar(); } catch(e) {}
    adminLog('XP resetado para 0');
    updateAdminStats();
    showToast('⚡ XP resetado para 0!');
}

function adminResetCoinsOnly() {
    if (!confirm('Resetar apenas as moedas?')) return;
    coins = 0;
    updateCoins();
    adminLog('Moedas resetadas para 0');
    updateAdminStats();
    showToast('🪙 Moedas resetadas para 0!');
}

// Override openAdminPanel para atualizar stats
const _origOpenAdminPanel = openAdminPanel;
openAdminPanel = function() {
    if (!adminUnlocked) { showToast('Você precisa resgatar o código ADM2026 primeiro!', true); return; }
    document.getElementById('adminPanel').classList.add('open');
    updateAdminStats();
};

// ===================== POMODORO MODOS =====================
function setPomodoroMode(mode, mins) {
    document.querySelectorAll('.pomo-mode').forEach(m => m.classList.remove('active'));
    const el = document.getElementById('pomo-' + mode);
    if (el) el.classList.add('active');
    setCustomTimer(mins);
}

// ===================== CALCULATOR BASE =====================
let calcState = { expr: '', val: '0', hasResult: false };

function calcRender() {
    const exprEl = document.getElementById('calcExpr');
    const valEl = document.getElementById('calcVal');
    if (exprEl) exprEl.textContent = calcState.expr;
    if (valEl) valEl.textContent = calcState.val;
}

function calcCompute() {
    try {
        let e = calcState.expr
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/−/g, '-')
            .replace(/√/g, 'Math.sqrt')
            .replace(/%/g, '/100');
        // Handle x² - replace pattern like "5x²" → "Math.pow(5,2)"
        e = e.replace(/(\d+(?:\.\d+)?)x²/g, 'Math.pow($1,2)');
        // Handle 1/x - not in expr, handled in calcAction
        if (!e || e === '') {
            return;
        }
        // Remove trailing operator
        if (/[+\-*/]$/.test(e)) {
            e = e.slice(0, -1);
        }
        if (!e) return;
        let result = Function('return (' + e + ')')();
        if (result === undefined || result === null || isNaN(result) || !isFinite(result)) {
            calcState.val = 'Erro';
            calcState.hasResult = true;
        } else {
            // Round to avoid floating point issues
            result = Math.round(result * 1e10) / 1e10;
            calcState.val = String(result);
            calcState.hasResult = true;
        }
    } catch(err) {
        calcState.val = 'Erro';
        calcState.hasResult = true;
    }
}

function calcAction(action) {
    if (action === 'clear') {
        calcState.expr = '';
        calcState.val = '0';
        calcState.hasResult = false;
        calcRender();
        return;
    }
    if (action === 'back') {
        if (calcState.hasResult) {
            calcState.expr = '';
            calcState.val = '0';
            calcState.hasResult = false;
        } else {
            calcState.expr = calcState.expr.slice(0, -1);
        }
        calcRender();
        return;
    }
    if (action === '=') {
        calcCompute();
        calcRender();
        return;
    }
    if (action === '±') {
        if (calcState.val !== '0' && calcState.val !== 'Erro') {
            if (calcState.val.startsWith('-')) {
                calcState.val = calcState.val.slice(1);
            } else {
                calcState.val = '-' + calcState.val;
            }
            calcState.expr = calcState.val;
            calcState.hasResult = false;
        }
        calcRender();
        return;
    }
    if (action === '√') {
        if (calcState.val !== '0' && calcState.val !== 'Erro') {
            const n = parseFloat(calcState.val);
            if (n >= 0) {
                calcState.val = String(Math.sqrt(n));
                calcState.hasResult = true;
                calcState.expr = '';
            } else {
                calcState.val = 'Erro';
                calcState.hasResult = true;
            }
        }
        calcRender();
        return;
    }
    if (action === 'x²') {
        if (calcState.val !== '0' && calcState.val !== 'Erro') {
            const n = parseFloat(calcState.val);
            calcState.val = String(n * n);
            calcState.hasResult = true;
            calcState.expr = '';
        }
        calcRender();
        return;
    }
    if (action === '1/x') {
        if (calcState.val !== '0' && calcState.val !== 'Erro') {
            const n = parseFloat(calcState.val);
            if (n !== 0) {
                calcState.val = String(1 / n);
                calcState.hasResult = true;
                calcState.expr = '';
            } else {
                calcState.val = 'Erro';
                calcState.hasResult = true;
            }
        }
        calcRender();
        return;
    }
    if (action === '%') {
        if (calcState.val !== '0' && calcState.val !== 'Erro') {
            const n = parseFloat(calcState.val);
            calcState.val = String(n / 100);
            calcState.hasResult = true;
            calcState.expr = '';
        }
        calcRender();
        return;
    }
    // Operators
    if (['+', '-', '×', '÷', '−'].includes(action)) {
        if (calcState.hasResult) {
            calcState.expr = calcState.val;
            calcState.hasResult = false;
        }
        // Replace trailing operator
        if (/[+\-×÷−]$/.test(calcState.expr)) {
            calcState.expr = calcState.expr.slice(0, -1);
        }
        calcState.expr += action;
        calcState.val = '0';
        calcRender();
        return;
    }
    // Numbers and decimal
    if (calcState.hasResult) {
        calcState.expr = '';
        calcState.val = '0';
        calcState.hasResult = false;
    }
    if (action === '.') {
        if (!calcState.val.includes('.')) {
            calcState.val = calcState.val === '0' ? '0.' : calcState.val + '.';
        }
    } else {
        if (calcState.val === '0') {
            calcState.val = action;
        } else {
            calcState.val += action;
        }
    }
    calcState.expr += action;
    calcRender();
}

// ===================== CALC HISTORY =====================
let calcHistory = [];

const _origCalcCompute = calcCompute;
calcCompute = function() {
    const beforeExpr = calcState.expr;
    const beforeVal = calcState.val;
    _origCalcCompute();
    if (calcState.hasResult && calcState.val !== 'Erro' && beforeVal) {
        const entry = (beforeExpr ? beforeExpr + ' ' : '') + beforeVal + ' = ' + calcState.val;
        calcHistory.unshift(entry);
        if (calcHistory.length > 10) calcHistory.pop();
        renderCalcHistory();
    }
};

function renderCalcHistory() {
    const hist = document.getElementById('calcHistory');
    if (!hist) return;
    if (!calcHistory.length) {
        hist.innerHTML = '<div style="color:var(--text-muted);font-size:0.7rem;">Histórico vazio</div>';
        return;
    }
    hist.innerHTML = calcHistory.map((e, i) =>
        '<div class="calc-hist-entry" onclick="calcHistoryUse(' + i + ')">' + e + '</div>'
    ).join('');
}

function calcHistoryUse(idx) {
    const parts = calcHistory[idx].split(' = ');
    if (parts.length >= 2) {
        calcState.val = parts[parts.length - 1].trim();
        calcState.expr = '';
        calcState.hasResult = true;
        calcRender();
    }
}

// ===================== STUDY TIME TOPBAR =====================
function updateStudyTimeTopbar() {
    const el = document.getElementById('studyTimeTopbarDisplay');
    if (!el) return;
    const h = Math.floor(studySeconds / 3600);
    const m = Math.floor((studySeconds % 3600) / 60);
    el.textContent = h + 'h ' + m.toString().padStart(2,'0') + 'min';
}

const _origUpdateStudyTimeDisplay = updateStudyTimeDisplay;
updateStudyTimeDisplay = function() {
    _origUpdateStudyTimeDisplay();
    updateStudyTimeTopbar();
};
updateStudyTimeTopbar();

// ===================== PLANNER SEMANAL =====================
let plannerData = JSON.parse(localStorage.getItem('geekiePlanner') || '{}');
let plannerWeekOffset = 0;

function savePlanner() { localStorage.setItem('geekiePlanner', JSON.stringify(plannerData)); }

function getPlannerWeekDates(offset) {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + (offset * 7));
    const days = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        days.push(d);
    }
    return days;
}

function plannerPrevWeek() { plannerWeekOffset--; renderPlanner(); }
function plannerNextWeek() { plannerWeekOffset++; renderPlanner(); }
function plannerGoToday() { plannerWeekOffset = 0; renderPlanner(); }

function renderPlanner() {
    const grid = document.getElementById('plannerGrid');
    const label = document.getElementById('plannerWeekLabel');
    if (!grid) return;
    const days = getPlannerWeekDates(plannerWeekOffset);
    const todayStr = new Date().toDateString();
    const dayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    if (label) {
        const first = days[0], last = days[6];
        label.textContent = first.getDate() + '/' + (first.getMonth()+1) + ' — ' + last.getDate() + '/' + (last.getMonth()+1) + '/' + last.getFullYear();
    }
    grid.innerHTML = '';
    days.forEach((date, idx) => {
        const dateKey = date.toISOString().slice(0, 10);
        const isToday = date.toDateString() === todayStr;
        const tasks = plannerData[dateKey] || [];
        const col = document.createElement('div');
        col.className = 'planner-day' + (isToday ? ' today' : '');
        let tasksHtml = tasks.map((t, ti) =>
            '<div class="planner-task ' + (t.done ? 'done' : '') + '" onclick="plannerToggleTask(\'' + dateKey + '\',' + ti + ')">' +
            '<i class="fa-solid ' + (t.done ? 'fa-check-circle' : 'fa-circle') + '" style="font-size:0.65rem;flex-shrink:0;color:' + (t.done ? 'var(--primary)' : 'var(--text-muted)') + ';"></i>' +
            '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + t.text + '</span>' +
            '<i class="fa-solid fa-xmark" style="font-size:0.6rem;color:var(--text-muted);flex-shrink:0;" onclick="event.stopPropagation();plannerDeleteTask(\'' + dateKey + '\',' + ti + ')"></i>' +
            '</div>'
        ).join('');
        col.innerHTML =
            '<div class="planner-day-header">' + dayNames[idx] + '</div>' +
            '<div class="planner-day-date">' + date.getDate() + '</div>' +
            tasksHtml +
            '<button class="planner-add-btn" onclick="plannerAddTask(\'' + dateKey + '\')">+ Adicionar</button>';
        grid.appendChild(col);
    });
}

function plannerAddTask(dateKey) {
    const text = prompt('Nova tarefa para este dia:');
    if (!text || !text.trim()) return;
    if (!plannerData[dateKey]) plannerData[dateKey] = [];
    plannerData[dateKey].push({ text: text.trim(), done: false });
    savePlanner();
    renderPlanner();
}

function plannerToggleTask(dateKey, idx) {
    if (!plannerData[dateKey]) return;
    plannerData[dateKey][idx].done = !plannerData[dateKey][idx].done;
    savePlanner();
    renderPlanner();
}

function plannerDeleteTask(dateKey, idx) {
    if (!plannerData[dateKey]) return;
    plannerData[dateKey].splice(idx, 1);
    savePlanner();
    renderPlanner();
}

// ===================== ESTATÍSTICAS DE ESTUDO =====================
function renderStudyStats() {
    renderStatsOverview();
    renderStudyBarChart();
    renderStreakDisplay();
    renderStatsAchievements();
}

function renderStatsOverview() {
    const el = document.getElementById('statsOverview');
    if (!el) return;
    const totalNotes = JSON.parse(localStorage.getItem('geekieNotes') || '[]').length;
    const totalFlash = JSON.parse(localStorage.getItem('geekieFlashcards') || '[]').length;
    const totalTodos = JSON.parse(localStorage.getItem('geekieTodos') || '[]');
    const doneTodos = totalTodos.filter(t => t.completed).length;
    const pomTotal = parseInt(localStorage.getItem('geekiePomodoroTotal') || '0');
    const studyH = Math.floor(studySeconds / 3600);
    const studyM = Math.floor((studySeconds % 3600) / 60);
    const journeyCount = Object.keys(JSON.parse(localStorage.getItem('geekieJourney') || '{}')).length;
    el.innerHTML =
        '<div class="stat-card"><span class="stat-icon">⭐</span><span class="stat-value">' + xp + '</span><span class="stat-label">XP Total</span></div>' +
        '<div class="stat-card"><span class="stat-icon">🪙</span><span class="stat-value">' + coins + '</span><span class="stat-label">Moedas</span></div>' +
        '<div class="stat-card"><span class="stat-icon">⏱️</span><span class="stat-value">' + pomTotal + '</span><span class="stat-label">Pomodoros</span></div>' +
        '<div class="stat-card"><span class="stat-icon">✅</span><span class="stat-value">' + doneTodos + '</span><span class="stat-label">Metas Concluídas</span></div>' +
        '<div class="stat-card"><span class="stat-icon">🃏</span><span class="stat-value">' + totalFlash + '</span><span class="stat-label">Flashcards</span></div>' +
        '<div class="stat-card"><span class="stat-icon">📝</span><span class="stat-value">' + totalNotes + '</span><span class="stat-label">Notas Salvas</span></div>' +
        '<div class="stat-card"><span class="stat-icon">🕐</span><span class="stat-value">' + studyH + 'h' + studyM.toString().padStart(2,'0') + 'm</span><span class="stat-label">Foco Hoje</span></div>' +
        '<div class="stat-card"><span class="stat-icon">🏆</span><span class="stat-value">' + journeyCount + '</span><span class="stat-label">Trilha Resgatada</span></div>';
}

function renderStudyBarChart() {
    const el = document.getElementById('studyBarChart');
    if (!el) return;
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const data = JSON.parse(localStorage.getItem('geekieStudyWeek') || '{}');
    const todayKey = new Date().toISOString().slice(0,10);
    data[todayKey] = Math.floor(studySeconds / 60);
    localStorage.setItem('geekieStudyWeek', JSON.stringify(data));
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0,10);
        last7.push({ label: days[d.getDay()], value: data[key] || 0, isToday: i === 0 });
    }
    const max = Math.max(...last7.map(d => d.value), 1);
    el.innerHTML = last7.map(d =>
        '<div class="bar-col">' +
        '<span class="bar-value">' + (d.value > 0 ? d.value + 'm' : '') + '</span>' +
        '<div class="bar-fill" style="height:' + Math.max(4, (d.value/max)*90) + 'px;' + (d.isToday ? 'background:linear-gradient(180deg,var(--accent),rgba(0,212,255,0.4));' : '') + '"></div>' +
        '<span class="bar-label" style="' + (d.isToday ? 'color:var(--accent);' : '') + '">' + d.label + '</span>' +
        '</div>'
    ).join('');
}

function renderStreakDisplay() {
    const el = document.getElementById('streakDisplay');
    if (!el) return;
    const streak = parseInt(localStorage.getItem('geekieStreak') || '1');
    el.innerHTML =
        '<div style="font-size:3rem;margin-bottom:8px;">🔥</div>' +
        '<div style="font-size:2rem;font-weight:700;color:var(--primary);font-family:\'Fira Code\',monospace;">' + streak + '</div>' +
        '<div style="font-size:0.82rem;color:var(--text-muted);">dias consecutivos de estudo</div>' +
        '<div style="font-size:0.75rem;color:var(--accent);margin-top:8px;">Continue estudando para aumentar sua sequência!</div>';
}

function renderStatsAchievements() {
    const el = document.getElementById('achievementsDisplay');
    if (!el) return;
    const pomTotal = parseInt(localStorage.getItem('geekiePomodoroTotal') || '0');
    const doneTodos = JSON.parse(localStorage.getItem('geekieTodos') || '[]').filter(t => t.completed).length;
    const totalFlash = JSON.parse(localStorage.getItem('geekieFlashcards') || '[]').length;
    const achievements = [
        { icon: '🌱', label: 'Primeiro Passo', desc: 'Abriu o Geekie pela primeira vez', done: true },
        { icon: '⭐', label: 'Estudante', desc: 'Atingiu 100 XP', done: xp >= 100 },
        { icon: '🎓', label: 'Scholar', desc: 'Atingiu 600 XP', done: xp >= 600 },
        { icon: '⏱️', label: 'Foco Total', desc: 'Completou 5 Pomodoros', done: pomTotal >= 5 },
        { icon: '✅', label: 'Produtivo', desc: 'Concluiu 10 metas', done: doneTodos >= 10 },
        { icon: '🃏', label: 'Revisor', desc: 'Criou 10 flashcards', done: totalFlash >= 10 },
        { icon: '🏆', label: 'Lendário', desc: 'Atingiu 3000 XP', done: xp >= 3000 },
        { icon: '💰', label: 'Rico', desc: 'Acumulou 500 moedas', done: coins >= 500 },
    ];
    el.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;">' +
        achievements.map(a =>
            '<div style="background:rgba(255,255,255,0.025);border:1px solid ' + (a.done ? 'rgba(0,255,136,0.3)' : 'var(--border)') + ';border-radius:10px;padding:12px;display:flex;align-items:center;gap:10px;opacity:' + (a.done ? 1 : 0.45) + ';">' +
            '<span style="font-size:1.4rem;">' + a.icon + '</span>' +
            '<div><div style="font-size:0.82rem;font-weight:700;color:' + (a.done ? 'var(--primary)' : 'var(--text-muted)') + ';">' + a.label + '</div><div style="font-size:0.7rem;color:var(--text-muted);">' + a.desc + '</div></div>' +
            (a.done ? '<i class="fa-solid fa-check" style="margin-left:auto;color:var(--primary);font-size:0.8rem;"></i>' : '<i class="fa-solid fa-lock" style="margin-left:auto;color:var(--text-muted);font-size:0.75rem;"></i>') +
            '</div>'
        ).join('') + '</div>';
}

// ===================== CRONÔMETRO POR MATÉRIA =====================
let subjectData = JSON.parse(localStorage.getItem('geekieSubjects') || '[]');
let activeSubjectId = null;
let subjectIntervals = {};

function saveSubjects() { localStorage.setItem('geekieSubjects', JSON.stringify(subjectData)); }

function addSubject() {
    const name = document.getElementById('newSubjectName').value.trim();
    const emoji = document.getElementById('newSubjectEmoji').value;
    if (!name) { showToast('Digite o nome da matéria!', true); return; }
    subjectData.push({ id: Date.now().toString(), name, emoji, totalSeconds: 0, currentSeconds: 0, running: false });
    saveSubjects();
    document.getElementById('newSubjectName').value = '';
    renderSubjectGrid();
    showToast(emoji + ' ' + name + ' adicionada!');
}

function renderSubjectGrid() {
    const grid = document.getElementById('subjectGrid');
    if (!grid) return;
    if (!subjectData.length) {
        grid.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:30px;grid-column:1/-1;"><i class="fa-solid fa-clock" style="font-size:2rem;display:block;margin-bottom:8px;"></i>Nenhuma matéria adicionada ainda.</div>';
        return;
    }
    grid.innerHTML = '';
    subjectData.forEach((s) => {
        const card = document.createElement('div');
        card.className = 'subject-card' + (s.running ? ' running' : '');
        card.id = 'subject-card-' + s.id;
        const totalH = Math.floor(s.totalSeconds / 3600);
        const totalM = Math.floor((s.totalSeconds % 3600) / 60);
        const curM = Math.floor(s.currentSeconds / 60);
        const curS = s.currentSeconds % 60;
        card.innerHTML =
            '<div class="subject-name">' + s.emoji + ' ' + s.name + '</div>' +
            '<div class="subject-time" id="subj-time-' + s.id + '">' + curM.toString().padStart(2,'0') + ':' + curS.toString().padStart(2,'0') + '</div>' +
            '<div class="subject-total">Total acumulado: ' + totalH + 'h ' + totalM.toString().padStart(2,'0') + 'min</div>' +
            '<div class="subject-controls">' +
            (s.running
                ? '<button class="subj-btn stop" onclick="stopSubject(\'' + s.id + '\')"><i class="fa-solid fa-pause"></i> Pausar</button>'
                : '<button class="subj-btn start" onclick="startSubject(\'' + s.id + '\')"><i class="fa-solid fa-play"></i> Iniciar</button>'
            ) +
            '<button class="subj-btn" onclick="resetSubject(\'' + s.id + '\')"><i class="fa-solid fa-rotate-left"></i></button>' +
            '<button class="subj-btn del" onclick="deleteSubject(\'' + s.id + '\')"><i class="fa-solid fa-trash"></i></button>' +
            '</div>';
        grid.appendChild(card);
    });
}

function startSubject(id) {
    subjectData.forEach(s => { if (s.running && s.id !== id) stopSubject(s.id); });
    const s = subjectData.find(x => x.id === id);
    if (!s) return;
    s.running = true;
    activeSubjectId = id;
    saveSubjects();
    subjectIntervals[id] = setInterval(() => {
        s.currentSeconds++;
        s.totalSeconds++;
        const el = document.getElementById('subj-time-' + id);
        if (el) {
            const m = Math.floor(s.currentSeconds / 60);
            const sec = s.currentSeconds % 60;
            el.textContent = m.toString().padStart(2,'0') + ':' + sec.toString().padStart(2,'0');
        }
        if (s.currentSeconds % 60 === 0) saveSubjects();
    }, 1000);
    renderSubjectGrid();
}

function stopSubject(id) {
    const s = subjectData.find(x => x.id === id);
    if (!s) return;
    s.running = false;
    if (activeSubjectId === id) activeSubjectId = null;
    clearInterval(subjectIntervals[id]);
    delete subjectIntervals[id];
    saveSubjects();
    renderSubjectGrid();
}

function resetSubject(id) {
    const s = subjectData.find(x => x.id === id);
    if (!s || !confirm('Resetar o timer de "' + s.name + '"?')) return;
    stopSubject(id);
    s.currentSeconds = 0;
    saveSubjects();
    renderSubjectGrid();
}

function deleteSubject(id) {
    const s = subjectData.find(x => x.id === id);
    if (!s || !confirm('Excluir "' + s.name + '"?')) return;
    stopSubject(id);
    subjectData = subjectData.filter(x => x.id !== id);
    saveSubjects();
    renderSubjectGrid();
}

function resetAllSubjectTimers() {
    if (!confirm('Resetar TODOS os timers de matérias?')) return;
    subjectData.forEach(s => { stopSubject(s.id); s.currentSeconds = 0; s.totalSeconds = 0; });
    saveSubjects();
    renderSubjectGrid();
    showToast('Todos os timers resetados!');
}

// ===================== QUIZ RÁPIDO =====================
const quizCategories = [
    { id: 'math', label: 'Matemática', icon: '🔢' },
    { id: 'science', label: 'Ciências', icon: '⚗️' },
    { id: 'history', label: 'História', icon: '🏛️' },
    { id: 'geo', label: 'Geografia', icon: '🌍' },
    { id: 'portuguese', label: 'Português', icon: '📖' },
    { id: 'trivia', label: 'Curiosidades', icon: '🌟' },
];

const quizQuestions = {
    math: [
        { q: 'Quanto é 15% de 200?', opts: ['30', '25', '35', '40'], correct: 0 },
        { q: 'Qual é a raiz quadrada de 144?', opts: ['11', '12', '13', '14'], correct: 1 },
        { q: 'Se x² = 81, qual o valor positivo de x?', opts: ['7', '8', '9', '10'], correct: 2 },
        { q: 'Qual é o valor de π (pi) aproximado?', opts: ['3,14', '3,16', '3,12', '3,18'], correct: 0 },
        { q: 'Quantos lados tem um hexágono?', opts: ['5', '6', '7', '8'], correct: 1 },
        { q: 'Qual é o resultado de 2⁸?', opts: ['128', '256', '512', '64'], correct: 1 },
        { q: 'Em uma PA com a₁=2 e r=3, qual é o 5º termo?', opts: ['14', '17', '11', '20'], correct: 0 },
        { q: 'Qual é a fórmula da área do círculo?', opts: ['2πr', 'πr²', 'πd', '2πr²'], correct: 1 },
        { q: 'Quanto é log₁₀(1000)?', opts: ['2', '3', '4', '10'], correct: 1 },
        { q: 'Qual é o MMC de 4 e 6?', opts: ['8', '10', '12', '24'], correct: 2 },
        { q: 'Qual é a derivada de x²?', opts: ['x', '2x', 'x²', '2'], correct: 1 },
        { q: 'Quanto é 7! (fatorial de 7)?', opts: ['2520', '5040', '720', '40320'], correct: 1 },
    ],
    science: [
        { q: 'Qual é o símbolo químico do ouro?', opts: ['Go', 'Ag', 'Au', 'Or'], correct: 2 },
        { q: 'Quantos cromossomos tem uma célula humana normal?', opts: ['23', '44', '46', '48'], correct: 2 },
        { q: 'Qual organela é responsável pela respiração celular?', opts: ['Ribossomo', 'Mitocôndria', 'Cloroplasto', 'Vacúolo'], correct: 1 },
        { q: 'Qual é a fórmula da água?', opts: ['H₂O₂', 'HO', 'H₂O', 'H₃O'], correct: 2 },
        { q: 'Qual é o número atômico do carbono?', opts: ['4', '6', '8', '12'], correct: 1 },
        { q: 'O que é fotossíntese?', opts: ['Respiração celular', 'Produção de energia pela luz', 'Digestão de alimentos', 'Divisão celular'], correct: 1 },
        { q: 'Qual é a velocidade da luz no vácuo?', opts: ['3×10⁸ m/s', '3×10⁶ m/s', '3×10¹⁰ m/s', '3×10⁴ m/s'], correct: 0 },
        { q: 'Qual é o pH neutro?', opts: ['0', '7', '14', '5'], correct: 1 },
        { q: 'O que é DNA?', opts: ['Proteína', 'Lipídio', 'Ácido nucleico', 'Carboidrato'], correct: 2 },
        { q: 'Qual lei de Newton descreve a inércia?', opts: ['2ª Lei', '3ª Lei', '1ª Lei', 'Lei de Hooke'], correct: 2 },
        { q: 'Qual é o elemento mais abundante no universo?', opts: ['Oxigênio', 'Carbono', 'Hidrogênio', 'Hélio'], correct: 2 },
        { q: 'O que é um isótopo?', opts: ['Átomo com carga', 'Átomo com mesmo Z e diferente A', 'Molécula polar', 'Íon negativo'], correct: 1 },
    ],
    history: [
        { q: 'Em que ano o Brasil foi descoberto?', opts: ['1498', '1500', '1502', '1510'], correct: 1 },
        { q: 'Quem proclamou a República do Brasil?', opts: ['Dom Pedro I', 'Dom Pedro II', 'Deodoro da Fonseca', 'Getúlio Vargas'], correct: 2 },
        { q: 'Em que ano terminou a 2ª Guerra Mundial?', opts: ['1943', '1944', '1945', '1946'], correct: 2 },
        { q: 'Qual foi o primeiro país a chegar à Lua?', opts: ['URSS', 'EUA', 'China', 'França'], correct: 1 },
        { q: 'Quem foi o primeiro presidente do Brasil?', opts: ['Floriano Peixoto', 'Deodoro da Fonseca', 'Prudente de Morais', 'Campos Sales'], correct: 1 },
        { q: 'Em que ano caiu o Muro de Berlim?', opts: ['1987', '1988', '1989', '1990'], correct: 2 },
        { q: 'Qual civilização construiu as pirâmides de Gizé?', opts: ['Grega', 'Romana', 'Egípcia', 'Mesopotâmica'], correct: 2 },
        { q: 'Quem escreveu "Os Lusíadas"?', opts: ['Fernando Pessoa', 'Luís de Camões', 'Eça de Queirós', 'José Saramago'], correct: 1 },
        { q: 'Em que ano ocorreu a Revolução Francesa?', opts: ['1776', '1789', '1804', '1815'], correct: 1 },
        { q: 'Qual foi o período da ditadura militar no Brasil?', opts: ['1954-1974', '1964-1985', '1968-1980', '1960-1982'], correct: 1 },
        { q: 'Quem foi o líder da Revolução Russa de 1917?', opts: ['Stalin', 'Trotsky', 'Lênin', 'Kruschev'], correct: 2 },
        { q: 'Em que ano foi assinada a Constituição brasileira atual?', opts: ['1985', '1986', '1988', '1990'], correct: 2 },
    ],
    geo: [
        { q: 'Qual é o maior país do mundo em área?', opts: ['China', 'EUA', 'Rússia', 'Canadá'], correct: 2 },
        { q: 'Qual é a capital do Brasil?', opts: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'], correct: 2 },
        { q: 'Qual é o rio mais longo do mundo?', opts: ['Nilo', 'Amazonas', 'Yangtzé', 'Mississippi'], correct: 0 },
        { q: 'Em qual continente fica o Egito?', opts: ['Ásia', 'Europa', 'África', 'Oriente Médio'], correct: 2 },
        { q: 'Qual é o oceano mais profundo?', opts: ['Atlântico', 'Índico', 'Ártico', 'Pacífico'], correct: 3 },
        { q: 'Qual é a capital da Austrália?', opts: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'], correct: 2 },
        { q: 'Quantos estados tem o Brasil?', opts: ['24', '25', '26', '27'], correct: 2 },
        { q: 'Qual é o deserto mais quente do mundo?', opts: ['Gobi', 'Saara', 'Atacama', 'Kalahari'], correct: 1 },
        { q: 'Qual país tem mais fronteiras com outros países?', opts: ['Brasil', 'China', 'Rússia', 'EUA'], correct: 1 },
        { q: 'Qual é a montanha mais alta do mundo?', opts: ['K2', 'Everest', 'Kilimanjaro', 'Aconcágua'], correct: 1 },
        { q: 'Qual é o menor país do mundo?', opts: ['Mônaco', 'San Marino', 'Vaticano', 'Liechtenstein'], correct: 2 },
        { q: 'Qual é a capital da Argentina?', opts: ['Córdoba', 'Rosário', 'Buenos Aires', 'Mendoza'], correct: 2 },
    ],
    portuguese: [
        { q: 'Qual é o plural de "cidadão"?', opts: ['Cidadões', 'Cidadãos', 'Cidadães', 'Cidadãs'], correct: 1 },
        { q: 'O que é um substantivo?', opts: ['Palavra que qualifica', 'Palavra que nomeia', 'Palavra que indica ação', 'Palavra que liga'], correct: 1 },
        { q: 'Qual é o antônimo de "generoso"?', opts: ['Bondoso', 'Avaro', 'Gentil', 'Humilde'], correct: 1 },
        { q: 'Qual figura de linguagem é "o silêncio gritou"?', opts: ['Metáfora', 'Metonímia', 'Paradoxo', 'Hipérbole'], correct: 2 },
        { q: 'Qual é o sujeito de "Choveu muito ontem"?', opts: ['Muito', 'Ontem', 'Indeterminado', 'Inexistente'], correct: 3 },
        { q: 'Qual palavra está corretamente acentuada?', opts: ['Idéia', 'Saúde', 'Vôo', 'Pôde'], correct: 3 },
        { q: 'O que é uma oração subordinada?', opts: ['Oração principal', 'Oração que depende de outra', 'Oração sem verbo', 'Oração independente'], correct: 1 },
        { q: 'Qual é o feminino de "réu"?', opts: ['Réua', 'Ré', 'Reia', 'Reua'], correct: 1 },
        { q: 'Qual é o tempo verbal de "estudarei"?', opts: ['Presente', 'Pretérito', 'Futuro do presente', 'Futuro do pretérito'], correct: 2 },
        { q: 'O que é uma metáfora?', opts: ['Comparação com "como"', 'Comparação sem termo comparativo', 'Exagero', 'Contradição'], correct: 1 },
        { q: 'Qual é a classe gramatical de "rapidamente"?', opts: ['Adjetivo', 'Advérbio', 'Substantivo', 'Verbo'], correct: 1 },
        { q: 'O que é crase?', opts: ['Acento agudo', 'Fusão de "a" + "a"', 'Sinal de pontuação', 'Tipo de verbo'], correct: 1 },
    ],
    trivia: [
        { q: 'Quantos ossos tem o corpo humano adulto?', opts: ['186', '196', '206', '216'], correct: 2 },
        { q: 'Qual é o animal terrestre mais rápido?', opts: ['Leão', 'Guepardo', 'Cavalo', 'Avestruz'], correct: 1 },
        { q: 'Quantas cores tem o arco-íris?', opts: ['5', '6', '7', '8'], correct: 2 },
        { q: 'Qual é o planeta mais próximo do Sol?', opts: ['Vênus', 'Terra', 'Mercúrio', 'Marte'], correct: 2 },
        { q: 'Quantas horas tem um dia?', opts: ['22', '23', '24', '25'], correct: 2 },
        { q: 'Qual é o instrumento musical mais antigo?', opts: ['Violino', 'Piano', 'Flauta', 'Tambor'], correct: 2 },
        { q: 'Quantos continentes existem?', opts: ['5', '6', '7', '8'], correct: 2 },
        { q: 'Qual é a língua mais falada no mundo?', opts: ['Inglês', 'Espanhol', 'Mandarim', 'Hindi'], correct: 2 },
        { q: 'Qual é o menor planeta do sistema solar?', opts: ['Plutão', 'Mercúrio', 'Marte', 'Vênus'], correct: 1 },
        { q: 'Em que país foi inventado o futebol?', opts: ['Brasil', 'Espanha', 'Inglaterra', 'Alemanha'], correct: 2 },
        { q: 'Qual é o maior mamífero do mundo?', opts: ['Elefante africano', 'Baleia-azul', 'Girafa', 'Hipopótamo'], correct: 1 },
        { q: 'Quantas notas tem a escala musical?', opts: ['5', '6', '7', '8'], correct: 2 },
    ],
};

let quizState = {
    category: 'math',
    qty: 10,
    questions: [],
    currentIdx: 0,
    score: 0,
    answered: false,
};

function renderQuizSetup() {
    const catGrid = document.getElementById('quizCatGrid');
    if (!catGrid) return;
    catGrid.innerHTML = quizCategories.map(c =>
        '<div class="quiz-cat-btn ' + (quizState.category === c.id ? 'sel' : '') + '" onclick="selectQuizCat(\'' + c.id + '\')">' +
        '<span class="quiz-cat-icon">' + c.icon + '</span>' + c.label +
        '</div>'
    ).join('');
    document.getElementById('quizSetup').style.display = 'block';
    document.getElementById('quizGame').style.display = 'none';
    document.getElementById('quizResult').style.display = 'none';
}

function selectQuizCat(catId) {
    quizState.category = catId;
    renderQuizSetup();
}

function setQuizQty(qty) {
    quizState.qty = qty;
    ['5','10','15'].forEach(n => {
        const el = document.getElementById('quizQty' + n);
        if (el) {
            el.style.borderColor = (n == qty) ? 'var(--primary)' : '';
            el.style.color = (n == qty) ? 'var(--primary)' : '';
        }
    });
}

function startQuiz() {
    const pool = quizQuestions[quizState.category] || [];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    quizState.questions = shuffled.slice(0, quizState.qty);
    quizState.currentIdx = 0;
    quizState.score = 0;
    quizState.answered = false;
    document.getElementById('quizSetup').style.display = 'none';
    document.getElementById('quizGame').style.display = 'block';
    document.getElementById('quizResult').style.display = 'none';
    renderQuizQuestion();
}

function renderQuizQuestion() {
    const q = quizState.questions[quizState.currentIdx];
    if (!q) { showQuizResult(); return; }
    const total = quizState.questions.length;
    const idx = quizState.currentIdx;
    document.getElementById('quizProgFill').style.width = ((idx / total) * 100) + '%';
    document.getElementById('quizScoreLbl').textContent = quizState.score + '/' + idx;
    document.getElementById('quizQuestion').textContent = q.q;
    document.getElementById('quizFeedback').textContent = '';
    document.getElementById('quizNextBtn').style.display = 'none';
    const opts = document.getElementById('quizOptions');
    opts.innerHTML = q.opts.map((opt, i) =>
        '<div class="quiz-opt" onclick="answerQuiz(' + i + ')">' + opt + '</div>'
    ).join('');
    quizState.answered = false;
}

function answerQuiz(idx) {
    if (quizState.answered) return;
    quizState.answered = true;
    const q = quizState.questions[quizState.currentIdx];
    const opts = document.querySelectorAll('.quiz-opt');
    opts.forEach((el, i) => {
        el.classList.add('disabled');
        if (i === q.correct) el.classList.add('correct');
        else if (i === idx && idx !== q.correct) el.classList.add('wrong');
    });
    const feedback = document.getElementById('quizFeedback');
    if (idx === q.correct) {
        quizState.score++;
        feedback.innerHTML = '<span style="color:var(--success);">✅ Correto!</span>';
    } else {
        feedback.innerHTML = '<span style="color:var(--danger);">❌ Errado! Resposta: ' + q.opts[q.correct] + '</span>';
    }
    document.getElementById('quizNextBtn').style.display = 'block';
}

function quizNextQuestion() {
    quizState.currentIdx++;
    if (quizState.currentIdx >= quizState.questions.length) {
        showQuizResult();
    } else {
        renderQuizQuestion();
    }
}

function showQuizResult() {
    document.getElementById('quizGame').style.display = 'none';
    document.getElementById('quizResult').style.display = 'block';
    const total = quizState.questions.length;
    const score = quizState.score;
    const pct = Math.round((score / total) * 100);
    const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '😊' : pct >= 40 ? '😐' : '😔';
    const label = pct >= 80 ? 'Excelente!' : pct >= 60 ? 'Bom trabalho!' : pct >= 40 ? 'Continue praticando!' : 'Não desista!';
    document.getElementById('quizResultEmoji').textContent = emoji;
    document.getElementById('quizResultScore').textContent = score + '/' + total;
    document.getElementById('quizResultLbl').textContent = label + ' (' + pct + '%)';
    const xpReward = score * 10;
    const coinReward = Math.floor(score * 3);
    gainXP(xpReward);
    earnCoins(coinReward, 'Quiz Rápido');
    document.getElementById('quizResultReward').innerHTML = '<i class="fa-solid fa-gift"></i> Recompensa: <strong>+' + xpReward + ' XP</strong> e <strong>+' + coinReward + ' moedas</strong>!';
    document.getElementById('quizProgFill').style.width = '100%';
    document.getElementById('quizScoreLbl').textContent = score + '/' + total;
}

function resetQuiz() {
    renderQuizSetup();
}

// ===================== NOVOS COMANDOS NA PALETTE =====================
// Adicionar novos itens ao array de comandos (após carregamento)
document.addEventListener('DOMContentLoaded', function() {
    // Comandos das novas abas já adicionados diretamente em cmdCommands (v13.1.3)
    // Inicializar stats admin
    updateAdminStats();
    // Atualizar topbar
    updateStudyTimeTopbar();
});


// ===================== v15.7.0 FEATURE JAVASCRIPT =====================

// ----- DIARY FEATURE -----
var diaryMood = 3;
var diaryEntries = [];

function loadDiaryEntries() {
    try {
        diaryEntries = JSON.parse(localStorage.getItem('geekie_diary') || '[]');
    } catch(e) { diaryEntries = []; }
}

function saveDiaryData() {
    localStorage.setItem('geekie_diary', JSON.stringify(diaryEntries));
}

function selectDiaryMood(mood) {
    diaryMood = mood;
    document.querySelectorAll('.diary-mood-btn').forEach(function(btn) {
        btn.classList.toggle('selected', parseInt(btn.dataset.mood) === mood);
    });
}

function saveDiaryEntry() {
    var text = document.getElementById('diaryText').value.trim();
    if (!text) { showToast('Escreva algo antes de salvar!'); return; }
    var entry = {
        id: Date.now(),
        date: new Date().toISOString(),
        text: text,
        mood: diaryMood
    };
    diaryEntries.unshift(entry);
    saveDiaryData();
    document.getElementById('diaryText').value = '';
    renderDiaryEntries();
    if (typeof addXP === 'function') addXP(5);
    showToast('Entrada salva! +5 XP');
}

function deleteDiaryEntry(id) {
    diaryEntries = diaryEntries.filter(function(e) { return e.id !== id; });
    saveDiaryData();
    renderDiaryEntries();
    showToast('Entrada removida.');
}

function renderDiaryEntries() {
    var container = document.getElementById('diaryEntries');
    if (!container) return;
    var moodEmojis = ['\uD83D\uDE1E','\uD83D\uDE1F','\uD83D\uDE10','\uD83D\uDE42','\uD83D\uDE04'];

    // Stats
    var statsEl = document.getElementById('diaryStats');
    if (statsEl) {
        var totalWords = diaryEntries.reduce(function(sum, e) { return sum + e.text.split(/\s+/).length; }, 0);
        var avgMood = diaryEntries.length > 0 ? (diaryEntries.reduce(function(s,e){return s+e.mood;},0) / diaryEntries.length).toFixed(1) : '\u2014';
        statsEl.innerHTML =
            '<div class="diary-stat"><div class="diary-stat-num">' + diaryEntries.length + '</div><div class="diary-stat-label">Entradas</div></div>' +
            '<div class="diary-stat"><div class="diary-stat-num">' + totalWords + '</div><div class="diary-stat-label">Palavras</div></div>' +
            '<div class="diary-stat"><div class="diary-stat-num">' + avgMood + '</div><div class="diary-stat-label">Humor M\u00E9dio</div></div>';
    }

    if (diaryEntries.length === 0) {
        container.innerHTML = '<div class="diary-empty"><i class="fa-solid fa-book-heart"></i><p>Nenhuma entrada ainda. Comece a escrever acima!</p></div>';
        return;
    }

    var htmlStr = '';
    diaryEntries.forEach(function(entry) {
        var d = new Date(entry.date);
        var dateStr = d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'});
        var safeText = entry.text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        htmlStr += '<div class="diary-entry">' +
            '<button class="diary-entry-delete" onclick="deleteDiaryEntry(' + entry.id + ')"><i class="fa-solid fa-trash"></i></button>' +
            '<div class="diary-entry-header">' +
                '<span class="diary-entry-date">' + dateStr + '</span>' +
                '<span class="diary-entry-mood">' + (moodEmojis[entry.mood - 1] || '\uD83D\uDE10') + '</span>' +
            '</div>' +
            '<div class="diary-entry-text">' + safeText + '</div>' +
        '</div>';
    });
    container.innerHTML = htmlStr;
}

function exportDiary() {
    if (diaryEntries.length === 0) { showToast('Nada para exportar!'); return; }
    var moodEmojis = ['\uD83D\uDE1E','\uD83D\uDE1F','\uD83D\uDE10','\uD83D\uDE42','\uD83D\uDE04'];
    var text = '=== DIARIO DE ESTUDOS - GEEKIE ONE ULTRA ===\n\n';
    diaryEntries.forEach(function(entry) {
        var d = new Date(entry.date);
        text += d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'}) + ' ' + (moodEmojis[entry.mood - 1] || '\uD83D\uDE10') + '\n';
        text += entry.text + '\n' + '-'.repeat(40) + '\n\n';
    });
    var blob = new Blob([text], {type: 'text/plain'});
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'diario-geekie-' + new Date().toISOString().split('T')[0] + '.txt';
    a.click();
    showToast('Di\u00E1rio exportado!');
}

// ----- PASSWORD GENERATOR FEATURE -----
var pwdHistory = [];

function updatePwdLength(val) {
    document.getElementById('pwdLengthValue').textContent = val;
    generatePassword();
}

function generatePassword() {
    var length = parseInt(document.getElementById('pwdLength').value);
    var upper = document.getElementById('pwdUpper').checked;
    var lower = document.getElementById('pwdLower').checked;
    var numbers = document.getElementById('pwdNumbers').checked;
    var symbols = document.getElementById('pwdSymbols').checked;
    var avoid = document.getElementById('pwdAvoidAmbiguous').checked;

    var charSets = '';
    if (upper) charSets += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lower) charSets += 'abcdefghijklmnopqrstuvwxyz';
    if (numbers) charSets += '0123456789';
    if (symbols) charSets += '!@#$%&*()_+-=[]{}|;:,.<>?';

    if (avoid) {
        charSets = charSets.replace(/[l1O0o]/g, '');
    }

    if (!charSets) {
        document.getElementById('pwdOutput').textContent = 'Selecione uma op\u00E7\u00E3o!';
        document.getElementById('pwdStrengthFill').style.width = '0%';
        document.getElementById('pwdStrengthLabel').textContent = '\u2014';
        document.getElementById('pwdStrengthLabel').style.color = 'var(--text-muted)';
        return;
    }

    var pwd = '';
    var arr = new Uint32Array(length);
    crypto.getRandomValues(arr);
    for (var i = 0; i < length; i++) {
        pwd += charSets[arr[i] % charSets.length];
    }

    document.getElementById('pwdOutput').textContent = pwd;

    // Strength calculation
    var pool = 0;
    if (upper) pool += 26;
    if (lower) pool += 26;
    if (numbers) pool += 10;
    if (symbols) pool += 24;
    if (avoid) pool -= 4;
    var entropy = length * Math.log2(pool);

    var strength, color, width;
    if (entropy < 40) { strength = 'Fraca'; color = '#ff4757'; width = '25%'; }
    else if (entropy < 60) { strength = 'M\u00E9dia'; color = '#ffa502'; width = '50%'; }
    else if (entropy < 80) { strength = 'Forte'; color = '#7bed9f'; width = '75%'; }
    else { strength = 'Muito Forte'; color = '#00ff88'; width = '100%'; }

    document.getElementById('pwdStrengthFill').style.width = width;
    document.getElementById('pwdStrengthFill').style.background = color;
    document.getElementById('pwdStrengthLabel').textContent = strength + ' (' + Math.round(entropy) + ' bits)';
    document.getElementById('pwdStrengthLabel').style.color = color;

    // Add to history
    pwdHistory.unshift(pwd);
    if (pwdHistory.length > 5) pwdHistory.pop();
    renderPwdHistory();
}

function renderPwdHistory() {
    var container = document.getElementById('pwdHistory');
    if (!container) return;
    if (pwdHistory.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; font-size: 0.85rem;">Nenhuma senha gerada ainda.</p>';
        return;
    }
    var htmlStr = '';
    pwdHistory.forEach(function(pwd) {
        var safePwd = pwd.replace(/'/g, "\\'");
        htmlStr += '<div class="pwd-history-item" onclick="copyText(\'' + safePwd + '\')"><span>' + pwd + '</span><i class="fa-solid fa-copy" style="color: var(--primary);"></i></div>';
    });
    container.innerHTML = htmlStr;
}

function copyPassword() {
    var pwd = document.getElementById('pwdOutput').textContent;
    if (pwd === 'Clique em Gerar' || pwd === 'Selecione uma op\u00E7\u00E3o!') { showToast('Gere uma senha primeiro!'); return; }
    if (typeof copyText === 'function') copyText(pwd);
    else { navigator.clipboard.writeText(pwd); showToast('Senha copiada!'); }
}

// ----- FAB SEARCH -----
function initFabSearch() {
    var fabMenu = document.querySelector('.fab-menu');
    if (!fabMenu || fabMenu.querySelector('.fab-search')) return;
    var search = document.createElement('input');
    search.type = 'text';
    search.className = 'fab-search';
    search.placeholder = 'Buscar aba...';
    search.addEventListener('input', function() {
        var query = this.value.toLowerCase();
        document.querySelectorAll('.fab-nav-item').forEach(function(item) {
            var text = item.textContent.toLowerCase();
            item.classList.toggle('hidden', !text.includes(query));
        });
    });
    fabMenu.insertBefore(search, fabMenu.firstChild);
}

// ----- ANIMATED TITLE -----
function initAnimatedTitle() {
    var titles = document.querySelectorAll('.topbar-title, .app-title, .brand-title');
    titles.forEach(function(t) {
        if (!t.classList.contains('gradient-title-animated')) {
            t.classList.add('gradient-title-animated');
        }
    });
}

// Initialize on load
loadDiaryEntries();
setTimeout(function() {
    renderDiaryEntries();
    initFabSearch();
    initAnimatedTitle();
}, 500);

// ===================== END v15.7.0 =====================


// ===================== v15.7.0 FEATURE ENHANCEMENTS JS =====================

// ----- NOTES: Auto-save + Live counter -----
var notesAutoSaveTimer = null;
function initNotesAutoSave() {
    var editor = document.getElementById('noteEditor');
    if (!editor || editor.dataset.autosaveInit) return;
    editor.dataset.autosaveInit = '1';
    
    var indicator = document.createElement('span');
    indicator.className = 'notes-autosave saved';
    indicator.innerHTML = '<span class="dot"></span> Salvo';
    var saveBtn = document.querySelector('#tab-notes button[onclick*="saveNote"]');
    if (saveBtn && saveBtn.parentNode) saveBtn.parentNode.insertBefore(indicator, saveBtn.nextSibling);
    
    var countDisplay = document.createElement('div');
    countDisplay.className = 'notes-live-count';
    countDisplay.innerHTML = '<span id="notesWordCount">0</span> palavras · <span id="notesCharCount">0</span> caracteres · <span id="notesLineCount">0</span> linhas';
    editor.parentNode.insertBefore(countDisplay, editor.nextSibling);
    
    function updateCount() {
        var text = editor.value || '';
        var words = text.trim() ? text.trim().split(/\s+/).length : 0;
        document.getElementById('notesWordCount').textContent = words;
        document.getElementById('notesCharCount').textContent = text.length;
        document.getElementById('notesLineCount').textContent = text.split('\n').length;
    }
    
    editor.addEventListener('input', function() {
        updateCount();
        indicator.className = 'notes-autosave saving';
        indicator.innerHTML = '<span class="dot"></span> Salvando...';
        clearTimeout(notesAutoSaveTimer);
        notesAutoSaveTimer = setTimeout(function() {
            if (typeof saveNote === 'function') saveNote();
            indicator.className = 'notes-autosave saved';
            indicator.innerHTML = '<span class="dot"></span> Salvo';
        }, 1500);
    });
    updateCount();
}

// ----- TIMER: Daily goal tracker -----
function initTimerGoalTracker() {
    var timerTab = document.getElementById('tab-timer');
    if (!timerTab || timerTab.dataset.goalInit) return;
    timerTab.dataset.goalInit = '1';
    
    var goal = parseInt(localStorage.getItem('geekie_timer_goal') || '8');
    var tracker = document.createElement('div');
    tracker.className = 'timer-goal-tracker';
    tracker.innerHTML = 
        '<span class="timer-goal-label">Meta diária:</span>' +
        '<div class="timer-goal-bar"><div class="timer-goal-fill" id="timerGoalFill" style="width: 0%;"></div></div>' +
        '<span class="timer-goal-count" id="timerGoalCount">0/' + goal + '</span>' +
        '<button onclick="adjustTimerGoal(-1)" style="background:var(--bg-glass);border:1px solid var(--border);color:var(--text-main);border-radius:6px;padding:2px 8px;cursor:pointer;font-size:0.8rem;">−</button>' +
        '<button onclick="adjustTimerGoal(1)" style="background:var(--bg-glass);border:1px solid var(--border);color:var(--text-main);border-radius:6px;padding:2px 8px;cursor:pointer;font-size:0.8rem;">+</button>' +
        '<label class="timer-sound-toggle"><input type="checkbox" id="timerSoundToggle" checked> Som</label>';
    var cycleDisplay = timerTab.querySelector('#cycleCount, [id*="cycle"]');
    if (cycleDisplay && cycleDisplay.parentNode) {
        cycleDisplay.parentNode.insertBefore(tracker, cycleDisplay.nextSibling);
    } else {
        timerTab.querySelector('.glass-card, .tab-inner, div').appendChild(tracker);
    }
    updateTimerGoalDisplay();
}

function adjustTimerGoal(delta) {
    var goal = parseInt(localStorage.getItem('geekie_timer_goal') || '8');
    goal = Math.max(1, Math.min(20, goal + delta));
    localStorage.setItem('geekie_timer_goal', goal);
    var countEl = document.getElementById('timerGoalCount');
    if (countEl) countEl.textContent = getCurrentTimerCycles() + '/' + goal;
    updateTimerGoalDisplay();
}

function getCurrentTimerCycles() {
    var today = new Date().toDateString();
    var data = JSON.parse(localStorage.getItem('geekie_timer_cycles') || '{}');
    return data[today] || 0;
}

function updateTimerGoalDisplay() {
    var goal = parseInt(localStorage.getItem('geekie_timer_goal') || '8');
    var cycles = getCurrentTimerCycles();
    var countEl = document.getElementById('timerGoalCount');
    var fillEl = document.getElementById('timerGoalFill');
    if (countEl) countEl.textContent = cycles + '/' + goal;
    if (fillEl) fillEl.style.width = Math.min(100, (cycles / goal) * 100) + '%';
}

// Wrap the existing timer completion to increment cycles
var _originalSendPomodoroNotification = window.sendPomodoroNotification;
if (typeof _originalSendPomodoroNotification === 'function') {
    window.sendPomodoroNotification = function() {
        var today = new Date().toDateString();
        var data = JSON.parse(localStorage.getItem('geekie_timer_cycles') || '{}');
        data[today] = (data[today] || 0) + 1;
        localStorage.setItem('geekie_timer_cycles', JSON.stringify(data));
        updateTimerGoalDisplay();
        if (getCurrentTimerCycles() >= parseInt(localStorage.getItem('geekie_timer_goal') || '8')) {
            if (typeof showToast === 'function') showToast('Meta diária de Pomodoros concluída! 🎉');
        }
        return _originalSendPomodoroNotification.apply(this, arguments);
    };
}

// ----- GOALS: Due date + progress bar -----
function initGoalEnhancements() {
    var goalTab = document.getElementById('tab-goals');
    if (!goalTab || goalTab.dataset.dueInit) return;
    goalTab.dataset.dueInit = '1';
    // Enhancement will be applied in renderTodos wrapper
    var _originalRenderTodos = window.renderTodos;
    if (typeof _originalRenderTodos === 'function') {
        window.renderTodos = function() {
            _originalRenderTodos.apply(this, arguments);
            document.querySelectorAll('#todoList .todo-item, #goalsList .goal-item').forEach(function(item) {
                if (item.dataset.enhanced) return;
                item.dataset.enhanced = '1';
                var progressBar = document.createElement('div');
                progressBar.className = 'goal-progress-mini';
                progressBar.innerHTML = '<div class="goal-progress-mini-fill" style="width: 0%;"></div>';
                item.appendChild(progressBar);
            });
        };
    }
}

// ----- FLASHCARDS: Session timer + accuracy -----
var flashcardSession = { startTime: null, correct: 0, total: 0, timerInterval: null };
function initFlashcardSession() {
    var fcTab = document.getElementById('tab-flashcards');
    if (!fcTab || fcTab.dataset.sessionInit) return;
    fcTab.dataset.sessionInit = '1';
    
    var sessionBar = document.createElement('div');
    sessionBar.className = 'flashcard-session';
    sessionBar.innerHTML = 
        '<div class="flashcard-session-stat"><div class="num" id="fcSessionTime">00:00</div><div class="lbl">Tempo</div></div>' +
        '<div class="flashcard-session-stat"><div class="num" id="fcSessionCorrect">0</div><div class="lbl">Acertos</div></div>' +
        '<div class="flashcard-session-stat"><div class="num" id="fcSessionAccuracy">—</div><div class="lbl">Precisão</div></div>' +
        '<div class="flashcard-session-stat"><div class="num" id="fcSessionTotal">0</div><div class="lbl">Cards</div></div>';
    var firstChild = fcTab.querySelector('.glass-card > div, .tab-inner > div');
    if (firstChild) firstChild.parentNode.insertBefore(sessionBar, firstChild);
    
    // Start session timer when tab opens
    if (!flashcardSession.startTime) {
        flashcardSession.startTime = Date.now();
        flashcardSession.timerInterval = setInterval(function() {
            if (!document.getElementById('tab-flashcards') || document.getElementById('tab-flashcards').style.display === 'none') return;
            var elapsed = Math.floor((Date.now() - flashcardSession.startTime) / 1000);
            var min = String(Math.floor(elapsed / 60)).padStart(2, '0');
            var sec = String(elapsed % 60).padStart(2, '0');
            var el = document.getElementById('fcSessionTime');
            if (el) el.textContent = min + ':' + sec;
        }, 1000);
    }
    
    // Wrap rateCard to track accuracy
    var _originalRateCard = window.rateCard;
    if (typeof _originalRateCard === 'function') {
        window.rateCard = function(rating) {
            flashcardSession.total++;
            if (rating === 'easy' || rating === 4 || rating === 5) flashcardSession.correct++;
            var accEl = document.getElementById('fcSessionAccuracy');
            var correctEl = document.getElementById('fcSessionCorrect');
            var totalEl = document.getElementById('fcSessionTotal');
            if (correctEl) correctEl.textContent = flashcardSession.correct;
            if (totalEl) totalEl.textContent = flashcardSession.total;
            if (accEl) accEl.textContent = flashcardSession.total > 0 ? Math.round((flashcardSession.correct / flashcardSession.total) * 100) + '%' : '—';
            return _originalRateCard.apply(this, arguments);
        };
    }
}

// ----- CALCULATOR: Copy result + Clear history -----
function initCalcEnhancements() {
    var calcTab = document.getElementById('tab-calculator');
    if (!calcTab || calcTab.dataset.copyInit) return;
    calcTab.dataset.copyInit = '1';
    
    var historyHeader = calcTab.querySelector('h4, h3, .calc-history-header');
    var btnContainer = document.createElement('div');
    btnContainer.style.cssText = 'display:flex;gap:8px;margin-bottom:10px;';
    btnContainer.innerHTML = 
        '<button class="calc-copy-btn" onclick="copyCalcResult()"><i class="fa-solid fa-copy"></i> Copiar resultado</button>' +
        '<button class="calc-clear-history" onclick="clearCalcHistory()"><i class="fa-solid fa-trash"></i> Limpar histórico</button>';
    if (historyHeader && historyHeader.parentNode) {
        historyHeader.parentNode.insertBefore(btnContainer, historyHeader.nextSibling);
    }
}

function copyCalcResult() {
    var display = document.getElementById('calcDisplay') || document.querySelector('#tab-calculator .calc-display, #calcDisplay');
    if (!display) return;
    var val = display.textContent || display.value || '';
    if (typeof copyText === 'function') copyText(val);
    else { navigator.clipboard.writeText(val); }
    if (typeof showToast === 'function') showToast('Resultado copiado!');
}

function clearCalcHistory() {
    localStorage.removeItem('geekie_calc_history');
    if (typeof renderCalcHistory === 'function') renderCalcHistory();
    else {
        var hist = document.getElementById('calcHistory');
        if (hist) hist.innerHTML = '<p style="color:var(--text-muted);text-align:center;font-size:0.85rem;">Histórico vazio</p>';
    }
    if (typeof showToast === 'function') showToast('Histórico limpo!');
}

// ----- QUIZ: Timer + breakdown -----
var quizTimerInterval = null;
var quizQuestionStartTime = null;
var quizCategoryScores = {};

function initQuizEnhancements() {
    var quizTab = document.getElementById('tab-quiz');
    if (!quizTab || quizTab.dataset.timerInit) return;
    quizTab.dataset.timerInit = '1';
    
    var timerDisplay = document.createElement('div');
    timerDisplay.className = 'quiz-timer-display';
    timerDisplay.id = 'quizTimerDisplay';
    timerDisplay.innerHTML = '<i class="fa-solid fa-stopwatch"></i> <span id="quizTimerVal">00:00</span>';
    timerDisplay.style.display = 'none';
    var quizHeader = quizTab.querySelector('h2, h3');
    if (quizHeader && quizHeader.parentNode) quizHeader.parentNode.insertBefore(timerDisplay, quizHeader.nextSibling);
    
    // Wrap startQuiz to start timer
    var _originalStartQuiz = window.startQuiz;
    if (typeof _originalStartQuiz === 'function') {
        window.startQuiz = function() {
            quizCategoryScores = {};
            document.getElementById('quizTimerDisplay').style.display = 'inline-flex';
            startQuizTimer();
            return _originalStartQuiz.apply(this, arguments);
        };
    }
    
    // Wrap answerQuiz to track category scores and time
    var _originalAnswerQuiz = window.answerQuiz;
    if (typeof _originalAnswerQuiz === 'function') {
        window.answerQuiz = function(answer) {
            var timeTaken = quizQuestionStartTime ? (Date.now() - quizQuestionStartTime) / 1000 : 0;
            var result = _originalAnswerQuiz.apply(this, arguments);
            quizQuestionStartTime = Date.now();
            return result;
        };
    }
    
    // Wrap showQuizResult to add breakdown
    var _originalShowResult = window.showQuizResult;
    if (typeof _originalShowResult === 'function') {
        window.showQuizResult = function() {
            stopQuizTimer();
            document.getElementById('quizTimerDisplay').style.display = 'none';
            var result = _originalShowResult.apply(this, arguments);
            // Add breakdown
            var breakdown = document.createElement('div');
            breakdown.className = 'quiz-breakdown';
            var html = '';
            for (var cat in quizCategoryScores) {
                var s = quizCategoryScores[cat];
                html += '<div class="quiz-breakdown-item"><div class="cat">' + cat + '</div><div class="score">' + s.correct + '/' + s.total + '</div></div>';
            }
            if (html) {
                breakdown.innerHTML = html;
                var resultEl = document.getElementById('quizResult') || document.querySelector('#tab-quiz .quiz-result, #tab-quiz .result');
                if (resultEl) resultEl.appendChild(breakdown);
            }
            return result;
        };
    }
}

function startQuizTimer() {
    var startTime = Date.now();
    quizQuestionStartTime = startTime;
    clearInterval(quizTimerInterval);
    quizTimerInterval = setInterval(function() {
        var elapsed = Math.floor((Date.now() - startTime) / 1000);
        var min = String(Math.floor(elapsed / 60)).padStart(2, '0');
        var sec = String(elapsed % 60).padStart(2, '0');
        var el = document.getElementById('quizTimerVal');
        if (el) el.textContent = min + ':' + sec;
    }, 1000);
}

function stopQuizTimer() {
    clearInterval(quizTimerInterval);
}

// ----- PLANNER: Task count + weekly summary -----
function initPlannerEnhancements() {
    var plannerTab = document.getElementById('tab-planner');
    if (!plannerTab || plannerTab.dataset.countInit) return;
    plannerTab.dataset.countInit = '1';
    
    var summary = document.createElement('div');
    summary.className = 'planner-weekly-summary';
    summary.id = 'plannerWeeklySummary';
    summary.innerHTML = 
        '<div class="stat"><i class="fa-solid fa-list-check" style="color:var(--primary);"></i> Total: <span class="val" id="plannerTotalTasks">0</span></div>' +
        '<div class="stat"><i class="fa-solid fa-check" style="color:var(--success);"></i> Concluídas: <span class="val" id="plannerDoneTasks" style="color:var(--success);">0</span></div>' +
        '<div class="stat"><i class="fa-solid fa-clock" style="color:var(--warning);"></i> Pendentes: <span class="val" id="plannerPendingTasks" style="color:var(--warning);">0</span></div>';
    var firstChild = plannerTab.querySelector('.glass-card > *, .planner-grid, .planner-weekly');
    if (firstChild) firstChild.parentNode.insertBefore(summary, firstChild);
    
    // Wrap renderPlanner
    var _originalRenderPlanner = window.renderPlanner;
    if (typeof _originalRenderPlanner === 'function') {
        window.renderPlanner = function() {
            _originalRenderPlanner.apply(this, arguments);
            updatePlannerSummary();
        };
    }
}

function updatePlannerSummary() {
    var planner = JSON.parse(localStorage.getItem('geekie_planner') || '{}');
    var total = 0, done = 0;
    for (var day in planner) {
        if (Array.isArray(planner[day])) {
            planner[day].forEach(function(task) {
                total++;
                if (task.done) done++;
            });
        }
    }
    var totalEl = document.getElementById('plannerTotalTasks');
    var doneEl = document.getElementById('plannerDoneTasks');
    var pendEl = document.getElementById('plannerPendingTasks');
    if (totalEl) totalEl.textContent = total;
    if (doneEl) doneEl.textContent = done;
    if (pendEl) pendEl.textContent = total - done;
    
    // Add count per day
    document.querySelectorAll('.planner-day').forEach(function(dayEl) {
        if (dayEl.querySelector('.planner-day-count')) return;
        var dayKey = dayEl.dataset.day || dayEl.dataset.date;
        var tasks = planner[dayKey] || [];
        var count = document.createElement('div');
        count.className = 'planner-day-count' + (tasks.length > 0 ? ' has-tasks' : '');
        count.textContent = tasks.length + ' tarefa' + (tasks.length !== 1 ? 's' : '');
        dayEl.appendChild(count);
    });
}

// ----- STATS: Summary cards -----
function initStatsSummary() {
    var statsTab = document.getElementById('tab-stats');
    if (!statsTab || statsTab.dataset.summaryInit) return;
    statsTab.dataset.summaryInit = '1';
    
    var summaryCards = document.createElement('div');
    summaryCards.className = 'stats-summary-cards';
    summaryCards.id = 'statsSummaryCards';
    summaryCards.innerHTML = 
        '<div class="stats-summary-card"><div class="icon">⏱️</div><div class="val" id="statsTotalTime">—</div><div class="lbl">Tempo Total</div></div>' +
        '<div class="stats-summary-card"><div class="icon">📊</div><div class="val" id="statsAvgTime">—</div><div class="lbl">Média/Dia</div></div>' +
        '<div class="stats-summary-card"><div class="icon">🔥</div><div class="val" id="statsBestDay">—</div><div class="lbl">Melhor Dia</div></div>' +
        '<div class="stats-summary-card"><div class="icon">📚</div><div class="val" id="statsTotalSessions">—</div><div class="lbl">Sessões</div></div>';
    var firstChild = statsTab.querySelector('.glass-card > *, .stats-content > *');
    if (firstChild) firstChild.parentNode.insertBefore(summaryCards, firstChild);
    
    updateStatsSummary();
}

function updateStatsSummary() {
    var timerData = JSON.parse(localStorage.getItem('geekie_timer_cycles') || '{}');
    var subjectsData = JSON.parse(localStorage.getItem('geekie_subjects') || '[]');
    
    var totalCycles = 0;
    var dayCount = 0;
    var bestDay = '—';
    var bestDayCount = 0;
    for (var day in timerData) {
        totalCycles += timerData[day];
        dayCount++;
        if (timerData[day] > bestDayCount) {
            bestDayCount = timerData[day];
            bestDay = day.split('/').slice(0, 2).join('/');
        }
    }
    var totalMinutes = totalCycles * 25;
    var avgMinutes = dayCount > 0 ? Math.round(totalMinutes / dayCount) : 0;
    
    var totalEl = document.getElementById('statsTotalTime');
    var avgEl = document.getElementById('statsAvgTime');
    var bestEl = document.getElementById('statsBestDay');
    var sessEl = document.getElementById('statsTotalSessions');
    if (totalEl) totalEl.textContent = totalMinutes >= 60 ? (totalMinutes / 60).toFixed(1) + 'h' : totalMinutes + 'm';
    if (avgEl) avgEl.textContent = avgMinutes >= 60 ? (avgMinutes / 60).toFixed(1) + 'h' : avgMinutes + 'm';
    if (bestEl) bestEl.textContent = bestDay;
    if (sessEl) sessEl.textContent = totalCycles;
}

// ----- SUBJECTS: Total time + progress -----
function initSubjectsEnhancements() {
    var subjTab = document.getElementById('tab-subjects');
    if (!subjTab || subjTab.dataset.totalInit) return;
    subjTab.dataset.totalInit = '1';
    
    var totalBar = document.createElement('div');
    totalBar.className = 'subjects-total-bar';
    totalBar.innerHTML = 
        '<div><i class="fa-solid fa-stopwatch" style="color:var(--primary);"></i> <span style="color:var(--text-muted);font-size:0.85rem;">Tempo Total:</span> <span class="total-time" id="subjectsTotalTime">0m</span></div>' +
        '<div style="font-size:0.8rem;color:var(--text-muted);"><i class="fa-solid fa-calendar-day" style="color:var(--accent);"></i> Hoje: <span id="subjectsTodayTime" style="color:var(--accent);font-weight:600;">0m</span></div>';
    var firstChild = subjTab.querySelector('.glass-card > *, .subjects-content > *');
    if (firstChild) firstChild.parentNode.insertBefore(totalBar, firstChild);
    
    var _originalRenderSubjectGrid = window.renderSubjectGrid;
    if (typeof _originalRenderSubjectGrid === 'function') {
        window.renderSubjectGrid = function() {
            _originalRenderSubjectGrid.apply(this, arguments);
            updateSubjectsTotal();
        };
    }
}

function updateSubjectsTotal() {
    var subjects = JSON.parse(localStorage.getItem('geekie_subjects') || '[]');
    var totalSec = 0;
    var todayKey = new Date().toDateString();
    var todaySec = 0;
    subjects.forEach(function(s) {
        if (s.time) totalSec += s.time;
        if (s.dailyTime && typeof s.dailyTime === 'object') {
            todaySec += s.dailyTime[todayKey] || 0;
        }
    });
    var totalEl = document.getElementById('subjectsTotalTime');
    var todayEl = document.getElementById('subjectsTodayTime');
    if (totalEl) totalEl.textContent = totalSec >= 3600 ? (totalSec / 3600).toFixed(1) + 'h' : Math.round(totalSec / 60) + 'm';
    if (todayEl) todayEl.textContent = todaySec >= 3600 ? (todaySec / 3600).toFixed(1) + 'h' : Math.round(todaySec / 60) + 'm';
}

// ----- CLICKER: Prestige + auto-clicker status -----
function initClickerEnhancements() {
    var clickerTab = document.getElementById('tab-clicker');
    if (!clickerTab || clickerTab.dataset.prestigeInit) return;
    clickerTab.dataset.prestigeInit = '1';
    
    var prestigeBar = document.createElement('div');
    prestigeBar.className = 'clicker-prestige';
    prestigeBar.innerHTML = 
        '<span class="star">★</span>' +
        '<span style="color:var(--text-muted);">Prestígio:</span>' +
        '<span style="color:var(--gold);font-weight:700;font-family:Orbitron,monospace;" id="clickerPrestige">0</span>' +
        '<span style="color:var(--text-muted);margin-left:auto;">' +
            '<span class="clicker-auto-status" id="clickerAutoStatus"><span class="pulse"></span> Auto: Off</span>' +
        '</span>';
    var display = clickerTab.querySelector('.clicker-display, .clicker-stats, #clickerDisplay');
    if (display && display.parentNode) display.parentNode.insertBefore(prestigeBar, display.nextSibling);
    
    var prestige = parseInt(localStorage.getItem('geekie_clicker_prestige') || '0');
    var pEl = document.getElementById('clickerPrestige');
    if (pEl) pEl.textContent = prestige;
    
    // Check auto-clicker status
    setInterval(function() {
        var autoEl = document.getElementById('clickerAutoStatus');
        if (!autoEl) return;
        var game = JSON.parse(localStorage.getItem('geekie_clicker') || '{}');
        var autoLevel = game.autoClickerLevel || game.autoLevel || 0;
        if (autoLevel > 0) {
            autoEl.className = 'clicker-auto-status active';
            autoEl.innerHTML = '<span class="pulse"></span> Auto: Nv' + autoLevel;
        } else {
            autoEl.className = 'clicker-auto-status';
            autoEl.innerHTML = '<span class="pulse"></span> Auto: Off';
        }
    }, 2000);
}

// ----- AMBIENT: Master volume + sleep timer -----
var ambientSleepTimer = null;
function initAmbientEnhancements() {
    var ambTab = document.getElementById('tab-ambient');
    if (!ambTab || ambTab.dataset.volInit) return;
    ambTab.dataset.volInit = '1';
    
    var volBar = document.createElement('div');
    volBar.className = 'ambient-master-volume';
    volBar.innerHTML = 
        '<i class="fa-solid fa-volume-high" style="color:var(--primary);"></i>' +
        '<span style="font-size:0.82rem;color:var(--text-muted);">Master:</span>' +
        '<input type="range" id="ambientMasterVol" min="0" max="100" value="70" oninput="setAmbientMasterVol(this.value)">' +
        '<span id="ambientMasterVolVal" style="font-family:Orbitron,monospace;color:var(--primary);font-size:0.85rem;min-width:36px;">70%</span>' +
        '<div class="ambient-sleep-timer">' +
            '<i class="fa-solid fa-moon"></i>' +
            '<select id="ambientSleepSelect" onchange="setAmbientSleepTimer(this.value)">' +
                '<option value="0">Off</option>' +
                '<option value="5">5 min</option>' +
                '<option value="10">10 min</option>' +
                '<option value="15">15 min</option>' +
                '<option value="30">30 min</option>' +
                '<option value="60">1 hora</option>' +
            '</select>' +
        '</div>';
    var firstChild = ambTab.querySelector('.glass-card > *, .ambient-content > *');
    if (firstChild) firstChild.parentNode.insertBefore(volBar, firstChild);
    
    var savedVol = localStorage.getItem('geekie_ambient_master_vol') || '70';
    var volInput = document.getElementById('ambientMasterVol');
    var volVal = document.getElementById('ambientMasterVolVal');
    if (volInput) volInput.value = savedVol;
    if (volVal) volVal.textContent = savedVol + '%';
}

function setAmbientMasterVol(val) {
    localStorage.setItem('geekie_ambient_master_vol', val);
    var volVal = document.getElementById('ambientMasterVolVal');
    if (volVal) volVal.textContent = val + '%';
    var volume = val / 100;
    document.querySelectorAll('#tab-ambient audio').forEach(function(a) {
        a.volume = volume;
    });
    if (typeof changeMasterVolume === 'function') changeMasterVolume(volume);
}

function setAmbientSleepTimer(minutes) {
    clearTimeout(ambientSleepTimer);
    if (parseInt(minutes) > 0) {
        if (typeof showToast === 'function') showToast('Timer de sono: ' + minutes + ' min');
        ambientSleepTimer = setTimeout(function() {
            if (typeof stopAllAmbient === 'function') stopAllAmbient();
            else document.querySelectorAll('#tab-ambient audio').forEach(function(a) { a.pause(); });
            var sel = document.getElementById('ambientSleepSelect');
            if (sel) sel.value = '0';
            if (typeof showToast === 'function') showToast('Timer de sono terminado. 🔇');
        }, parseInt(minutes) * 60 * 1000);
    }
}

// ----- CHARS: Recently used -----
function initCharsRecent() {
    var charsTab = document.getElementById('tab-chars');
    if (!charsTab || charsTab.dataset.recentInit) return;
    charsTab.dataset.recentInit = '1';
    
    var recentSection = document.createElement('div');
    recentSection.className = 'chars-recent';
    recentSection.innerHTML = 
        '<div class="chars-recent-title"><i class="fa-solid fa-clock-rotate-left"></i> Usados Recentemente</div>' +
        '<div class="chars-recent-grid" id="charsRecentGrid"><div class="chars-recent-empty">Nenhum caractere copiado ainda.</div></div>';
    var firstChild = charsTab.querySelector('.glass-card > *, .chars-content > *');
    if (firstChild) firstChild.parentNode.insertBefore(recentSection, firstChild);
    
    var _originalCopyChar = window.copyCharEnhanced || window.copyChar;
    if (typeof _originalCopyChar === 'function') {
        var funcName = window.copyCharEnhanced ? 'copyCharEnhanced' : 'copyChar';
        window[funcName] = function() {
            var char = arguments[0];
            if (char) addCharToRecent(char);
            return _originalCopyChar.apply(this, arguments);
        };
    }
    renderCharsRecent();
}

function addCharToRecent(char) {
    var recent = JSON.parse(localStorage.getItem('geekie_chars_recent') || '[]');
    recent = recent.filter(function(c) { return c !== char; });
    recent.unshift(char);
    if (recent.length > 12) recent = recent.slice(0, 12);
    localStorage.setItem('geekie_chars_recent', JSON.stringify(recent));
    renderCharsRecent();
}

function renderCharsRecent() {
    var grid = document.getElementById('charsRecentGrid');
    if (!grid) return;
    var recent = JSON.parse(localStorage.getItem('geekie_chars_recent') || '[]');
    if (recent.length === 0) {
        grid.innerHTML = '<div class="chars-recent-empty">Nenhum caractere copiado ainda.</div>';
        return;
    }
    var html = '';
    recent.forEach(function(c) {
        var safe = c.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        html += '<div class="chars-recent-item" onclick="copyCharEnhanced(\'' + safe + '\')" title="Clique para copiar">' + c + '</div>';
    });
    grid.innerHTML = html;
}

// ----- EVENTS: Countdown -----
function initEventCountdown() {
    var eventTab = document.getElementById('tab-events');
    if (!eventTab || eventTab.dataset.countdownInit) return;
    eventTab.dataset.countdownInit = '1';
    
    setInterval(function() {
        var eventContent = document.getElementById('eventContent');
        if (!eventContent) return;
        var countdownEl = document.getElementById('eventCountdown');
        if (!countdownEl) {
            countdownEl = document.createElement('div');
            countdownEl.className = 'event-countdown';
            countdownEl.id = 'eventCountdown';
            eventContent.appendChild(countdownEl);
        }
        // Find next event date from event data
        var events = JSON.parse(localStorage.getItem('geekie_events') || '[]');
        var now = new Date();
        var nextEvent = null;
        events.forEach(function(e) {
            if (e.date) {
                var d = new Date(e.date);
                if (d > now && (!nextEvent || d < nextEvent)) nextEvent = d;
            }
        });
        if (nextEvent) {
            var diff = nextEvent - now;
            var days = Math.floor(diff / 86400000);
            var hours = Math.floor((diff % 86400000) / 3600000);
            var mins = Math.floor((diff % 3600000) / 60000);
            countdownEl.innerHTML = '<i class="fa-solid fa-hourglass-half"></i> Próximo evento em: ' + days + 'd ' + hours + 'h ' + mins + 'm';
        } else {
            countdownEl.innerHTML = '<i class="fa-solid fa-calendar-check"></i> Nenhum evento futuro';
        }
    }, 60000);
}

// ----- CODES: Redemption history -----
function initCodesHistory() {
    var codesTab = document.getElementById('tab-codes');
    if (!codesTab || codesTab.dataset.historyInit) return;
    codesTab.dataset.historyInit = '1';
    
    var historySection = document.createElement('div');
    historySection.className = 'codes-history';
    historySection.innerHTML = 
        '<div class="codes-history-title"><i class="fa-solid fa-history"></i> Histórico de Resgates</div>' +
        '<div id="codesHistoryList"><div class="codes-history-empty">Nenhum código resgatado ainda.</div></div>';
    var firstChild = codesTab.querySelector('.glass-card > *, .codes-content > *');
    if (firstChild) firstChild.parentNode.insertBefore(historySection, firstChild.nextSibling);
    
    var _originalRedeem = window.redeemCode;
    if (typeof _originalRedeem === 'function') {
        window.redeemCode = function() {
            var result = _originalRedeem.apply(this, arguments);
            var input = document.getElementById('codeInput') || document.querySelector('#tab-codes input');
            if (input && input.value) {
                var history = JSON.parse(localStorage.getItem('geekie_codes_history') || '[]');
                history.unshift({ code: input.value, date: new Date().toISOString(), reward: 'Resgatado' });
                if (history.length > 10) history = history.slice(0, 10);
                localStorage.setItem('geekie_codes_history', JSON.stringify(history));
                renderCodesHistory();
            }
            return result;
        };
    }
    renderCodesHistory();
}

function renderCodesHistory() {
    var list = document.getElementById('codesHistoryList');
    if (!list) return;
    var history = JSON.parse(localStorage.getItem('geekie_codes_history') || '[]');
    if (history.length === 0) {
        list.innerHTML = '<div class="codes-history-empty">Nenhum código resgatado ainda.</div>';
        return;
    }
    var html = '';
    history.forEach(function(h) {
        var d = new Date(h.date);
        var dateStr = d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'});
        html += '<div class="codes-history-item"><span class="code-val">' + h.code + '</span><span class="code-reward">' + dateStr + '</span></div>';
    });
    list.innerHTML = html;
}

// ----- JOURNEY: Progress percentage -----
function initJourneyProgress() {
    var journeyTab = document.getElementById('tab-journey');
    if (!journeyTab || journeyTab.dataset.progressInit) return;
    journeyTab.dataset.progressInit = '1';
    
    var progressBar = document.createElement('div');
    progressBar.className = 'journey-progress-overall';
    progressBar.innerHTML = 
        '<span class="pct" id="journeyPct">0%</span>' +
        '<div class="bar"><div class="fill" id="journeyFill" style="width:0%;"></div></div>';
    var firstChild = journeyTab.querySelector('.glass-card > *, .journey-content > *');
    if (firstChild) firstChild.parentNode.insertBefore(progressBar, firstChild);
    
    var _originalRenderJourney = window.renderJourney;
    if (typeof _originalRenderJourney === 'function') {
        window.renderJourney = function() {
            _originalRenderJourney.apply(this, arguments);
            updateJourneyProgress();
        };
    }
}

function updateJourneyProgress() {
    var journey = JSON.parse(localStorage.getItem('geekie_journey') || '{}');
    var nodes = journey.nodes || journey || [];
    if (!Array.isArray(nodes)) {
        nodes = Object.values(journey).filter(function(v) { return typeof v === 'object'; });
    }
    if (nodes.length === 0) return;
    var claimed = nodes.filter(function(n) { return n.claimed || n.completed; }).length;
    var pct = Math.round((claimed / nodes.length) * 100);
    var pctEl = document.getElementById('journeyPct');
    var fillEl = document.getElementById('journeyFill');
    if (pctEl) pctEl.textContent = pct + '%';
    if (fillEl) fillEl.style.width = pct + '%';
}

// ----- KEYSOUNDS: Preview button -----
function initKeysoundsPreview() {
    var ksTab = document.getElementById('tab-keysounds');
    if (!ksTab || ksTab.dataset.previewInit) return;
    ksTab.dataset.previewInit = '1';
    
    var previewBtn = document.createElement('button');
    previewBtn.className = 'ks-preview-btn';
    previewBtn.innerHTML = '<i class="fa-solid fa-play"></i> Testar Som';
    previewBtn.onclick = function() {
        var selected = localStorage.getItem('geekie_keysound_selected') || 'mechanical';
        if (typeof ksPlaySound === 'function') ksPlaySound(selected);
        else if (typeof ksSelectSound === 'function') ksSelectSound(selected);
    };
    var firstChild = ksTab.querySelector('.glass-card > *, .keysounds-content > *');
    if (firstChild) firstChild.parentNode.insertBefore(previewBtn, firstChild);
}

// ----- STORE: Category filter -----
function initStoreCategoryFilter() {
    var storeTab = document.getElementById('tab-store');
    if (!storeTab || storeTab.dataset.catInit) return;
    storeTab.dataset.catInit = '1';
    
    var filterBar = document.createElement('div');
    filterBar.className = 'store-category-filter';
    filterBar.innerHTML = 
        '<button class="store-cat-btn active" onclick="filterStoreCategory(this, \'all\')">Todos</button>' +
        '<button class="store-cat-btn" onclick="filterStoreCategory(this, \'theme\')">Temas</button>' +
        '<button class="store-cat-btn" onclick="filterStoreCategory(this, \'pet\')">Pets</button>' +
        '<button class="store-cat-btn" onclick="filterStoreCategory(this, \'title\')">Títulos</button>' +
        '<button class="store-cat-btn" onclick="filterStoreCategory(this, \'sound\')">Sons</button>';
    var firstChild = storeTab.querySelector('.glass-card > *, .store-content > *');
    if (firstChild) firstChild.parentNode.insertBefore(filterBar, firstChild);
}

function filterStoreCategory(btn, category) {
    document.querySelectorAll('.store-cat-btn').forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
    document.querySelectorAll('#tab-store .store-item, #tab-store .item-card').forEach(function(item) {
        var itemCat = (item.dataset.category || item.dataset.type || '').toLowerCase();
        item.style.display = (category === 'all' || itemCat === category) ? '' : 'none';
    });
}

// ----- TITLES: Rarity indicator -----
function initTitlesRarity() {
    var titlesTab = document.getElementById('tab-titles');
    if (!titlesTab || titlesTab.dataset.rarityInit) return;
    titlesTab.dataset.rarityInit = '1';
    
    var _originalRenderTitles = window.renderTitles;
    if (typeof _originalRenderTitles === 'function') {
        window.renderTitles = function() {
            _originalRenderTitles.apply(this, arguments);
            document.querySelectorAll('#tab-titles .title-item, #tab-titles .title-card').forEach(function(item, idx) {
                if (item.querySelector('.title-rarity')) return;
                var rarity = idx < 3 ? 'legendary' : idx < 8 ? 'epic' : idx < 15 ? 'rare' : 'common';
                var rarityLabel = document.createElement('span');
                rarityLabel.className = 'title-rarity ' + rarity;
                rarityLabel.textContent = rarity.charAt(0).toUpperCase() + rarity.slice(1);
                var titleEl = item.querySelector('h4, h3, .title-name');
                if (titleEl) titleEl.appendChild(rarityLabel);
                else item.appendChild(rarityLabel);
            });
        };
    }
}

// ----- PETS: Happiness level -----
function initPetsHappiness() {
    var petsTab = document.getElementById('tab-pets');
    if (!petsTab || petsTab.dataset.happinessInit) return;
    petsTab.dataset.happinessInit = '1';
    
    var _originalRenderPetGrid = window.renderPetGrid;
    if (typeof _originalRenderPetGrid === 'function') {
        window.renderPetGrid = function() {
            _originalRenderPetGrid.apply(this, arguments);
            document.querySelectorAll('#tab-pets .pet-item, #tab-pets .pet-card').forEach(function(item) {
                if (item.querySelector('.pet-happiness')) return;
                var petName = item.querySelector('.pet-name, h4, h3');
                if (!petName) return;
                var happiness = Math.floor(Math.random() * 40) + 60; // 60-100%
                var happinessBar = document.createElement('div');
                happinessBar.className = 'pet-happiness';
                happinessBar.innerHTML = 
                    '<div class="pet-happiness-bar"><div class="pet-happiness-fill" style="width:' + happiness + '%;"></div></div>' +
                    '<span class="pet-happiness-label">' + happiness + '%</span>';
                item.appendChild(happinessBar);
            });
        };
    }
}

// ----- GEEKIE PORTAL: Quick actions -----
function initPortalQuickActions() {
    var geekieTab = document.getElementById('tab-geekie');
    if (!geekieTab || geekieTab.dataset.quickInit) return;
    geekieTab.dataset.quickInit = '1';
    
    var quickActions = document.createElement('div');
    quickActions.className = 'portal-quick-actions';
    quickActions.innerHTML = 
        '<a class="portal-quick-btn" onclick="switchTab(\'timer\')"><i class="fa-solid fa-stopwatch"></i><span>Pomodoro</span></a>' +
        '<a class="portal-quick-btn" onclick="switchTab(\'flashcards\')"><i class="fa-solid fa-layer-group"></i><span>Flashcards</span></a>' +
        '<a class="portal-quick-btn" onclick="switchTab(\'notes\')"><i class="fa-solid fa-pen-to-square"></i><span>Notas</span></a>' +
        '<a class="portal-quick-btn" onclick="switchTab(\'quiz\')"><i class="fa-solid fa-brain"></i><span>Quiz</span></a>' +
        '<a class="portal-quick-btn" onclick="switchTab(\'goals\')"><i class="fa-solid fa-bullseye"></i><span>Metas</span></a>' +
        '<a class="portal-quick-btn" onclick="switchTab(\'planner\')"><i class="fa-solid fa-calendar-week"></i><span>Planner</span></a>';
    var firstChild = geekieTab.querySelector('.glass-card > *, .portal-content > *');
    if (firstChild) firstChild.parentNode.insertBefore(quickActions, firstChild);
}

// ----- GOOGLE SEARCH: Suggestions -----
function initSearchSuggestions() {
    var googleTab = document.getElementById('tab-google');
    if (!googleTab || googleTab.dataset.suggestInit) return;
    googleTab.dataset.suggestInit = '1';
    
    var suggestions = document.createElement('div');
    suggestions.className = 'search-suggestions';
    suggestions.innerHTML = 
        '<span class="search-suggestion" onclick="quickSearch(\'matemática\')">📐 matemática</span>' +
        '<span class="search-suggestion" onclick="quickSearch(\'química\')">⚗️ química</span>' +
        '<span class="search-suggestion" onclick="quickSearch(\'física\')">🧲 física</span>' +
        '<span class="search-suggestion" onclick="quickSearch(\'biologia\')">🧬 biologia</span>' +
        '<span class="search-suggestion" onclick="quickSearch(\'história\')">🏛️ história</span>' +
        '<span class="search-suggestion" onclick="quickSearch(\'geografia\')">🌍 geografia</span>' +
        '<span class="search-suggestion" onclick="quickSearch(\'literatura\')">📖 literatura</span>' +
        '<span class="search-suggestion" onclick="quickSearch(\'inglês\')">🌐 inglês</span>';
    var searchInput = googleTab.querySelector('input[type="text"], input[type="search"]');
    if (searchInput && searchInput.parentNode) searchInput.parentNode.insertBefore(suggestions, searchInput.nextSibling);
}

function quickSearch(query) {
    var searchInput = document.querySelector('#tab-google input[type="text"], #tab-google input[type="search"]');
    if (searchInput) {
        searchInput.value = query;
        if (typeof loadGeekieIframe === 'function') loadGeekieIframe();
        else searchInput.form && searchInput.form.submit();
    }
}

// ----- INIT ALL ENHANCEMENTS -----
function initAllEnhancements() {
    try { initNotesAutoSave(); } catch(e) {}
    try { initTimerGoalTracker(); } catch(e) {}
    try { initGoalEnhancements(); } catch(e) {}
    try { initFlashcardSession(); } catch(e) {}
    try { initCalcEnhancements(); } catch(e) {}
    try { initQuizEnhancements(); } catch(e) {}
    try { initPlannerEnhancements(); } catch(e) {}
    try { initStatsSummary(); } catch(e) {}
    try { initSubjectsEnhancements(); } catch(e) {}
    try { initClickerEnhancements(); } catch(e) {}
    try { initAmbientEnhancements(); } catch(e) {}
    try { initCharsRecent(); } catch(e) {}
    try { initEventCountdown(); } catch(e) {}
    try { initCodesHistory(); } catch(e) {}
    try { initJourneyProgress(); } catch(e) {}
    try { initKeysoundsPreview(); } catch(e) {}
    try { initStoreCategoryFilter(); } catch(e) {}
    try { initTitlesRarity(); } catch(e) {}
    try { initPetsHappiness(); } catch(e) {}
    try { initPortalQuickActions(); } catch(e) {}
    try { initSearchSuggestions(); } catch(e) {}
    try { initChatPage(); } catch(e) {}
}

// Run after DOM is ready
setTimeout(initAllEnhancements, 800);

// Re-run when switching tabs (to catch dynamically rendered content)
var _originalSwitchTab = window.switchTab || window.admSwitchTab || window.fabSwitch;
if (typeof _originalSwitchTab === 'function') {
    window.switchTab = function() {
        var result = _originalSwitchTab.apply(this, arguments);
        setTimeout(initAllEnhancements, 200);
        return result;
    };
}

// ===================== END v15.7.0 ENHANCEMENTS =====================

// ===================== v15.8.0 LOGIN + TUTORIAL + FIXES JS =====================

// ----- LOGIN SYSTEM -----
var geekieCurrentUser = null;

function initLoginSystem() {
    // Check if user is already logged in
    var savedUser = localStorage.getItem('geekie_current_user');
    if (savedUser) {
        geekieCurrentUser = JSON.parse(savedUser);
        showApp();
        return;
    }
    showLogin();
}

function showLogin() {
    var overlay = document.getElementById('loginOverlay');
    if (!overlay) return;
    overlay.classList.remove('hidden');
    // Hide main content
    var main = document.querySelector('.main-content');
    if (main) main.style.display = 'none';
    // Hide fab
    var fab = document.getElementById('fabWrapper');
    if (fab) fab.style.display = 'none';
}

function showApp() {
    var overlay = document.getElementById('loginOverlay');
    if (overlay) overlay.classList.add('hidden');
    var main = document.querySelector('.main-content');
    if (main) main.style.display = '';
    var fab = document.getElementById('fabWrapper');
    if (fab) fab.style.display = '';
    // Show user badge
    updateUserBadge();
    // Show tutorial if first time
    if (!localStorage.getItem('geekie_tutorial_done')) {
        setTimeout(startTutorial, 600);
    }
}

function handleLogin() {
    var nameInput = document.getElementById('loginName');
    var passInput = document.getElementById('loginPassword');
    var errorEl = document.getElementById('loginError');
    var name = nameInput.value.trim();
    var pass = passInput.value;

    if (!name || !pass) {
        showLoginError('Preencha todos os campos!');
        return;
    }
    if (name.length < 2) {
        showLoginError('Nome muito curto (mín. 2 caracteres)!');
        return;
    }

    var users = JSON.parse(localStorage.getItem('geekie_users') || '[]');
    var found = users.find(function(u) { return u.name.toLowerCase() === name.toLowerCase(); });

    if (!found) {
        showLoginError('Usuário não encontrado. Registre-se!');
        return;
    }
    if (found.password !== pass) {
        showLoginError('Senha incorreta!');
        return;
    }

    geekieCurrentUser = { name: found.name };
    localStorage.setItem('geekie_current_user', JSON.stringify(geekieCurrentUser));
    clearLoginForm();
    showApp();
    if (typeof showToast === 'function') showToast('Bem-vindo, ' + found.name + '! 👋');
}

function handleRegister() {
    var nameInput = document.getElementById('loginName');
    var passInput = document.getElementById('loginPassword');
    var confirmInput = document.getElementById('loginConfirm');
    var errorEl = document.getElementById('loginError');
    var name = nameInput.value.trim();
    var pass = passInput.value;
    var confirm = confirmInput ? confirmInput.value : '';

    if (!name || !pass) {
        showLoginError('Preencha todos os campos!');
        return;
    }
    if (name.length < 2) {
        showLoginError('Nome muito curto (mín. 2 caracteres)!');
        return;
    }
    if (pass.length < 4) {
        showLoginError('Senha muito curta (mín. 4 caracteres)!');
        return;
    }
    if (pass !== confirm) {
        showLoginError('As senhas não coincidem!');
        return;
    }

    var users = JSON.parse(localStorage.getItem('geekie_users') || '[]');
    if (users.find(function(u) { return u.name.toLowerCase() === name.toLowerCase(); })) {
        showLoginError('Este nome já está em uso!');
        return;
    }

    users.push({ name: name, password: pass, created: new Date().toISOString() });
    localStorage.setItem('geekie_users', JSON.stringify(users));
    geekieCurrentUser = { name: name };
    localStorage.setItem('geekie_current_user', JSON.stringify(geekieCurrentUser));
    clearLoginForm();
    showApp();
    if (typeof showToast === 'function') showToast('Conta criada! Bem-vindo, ' + name + '! 🎉');
    if (typeof addXP === 'function') addXP(20);
}

function loginAsGuest() {
    geekieCurrentUser = { name: 'Convidado', guest: true };
    localStorage.setItem('geekie_current_user', JSON.stringify(geekieCurrentUser));
    showApp();
    if (typeof showToast === 'function') showToast('Entrando como convidado...');
}

function logoutUser() {
    localStorage.removeItem('geekie_current_user');
    geekieCurrentUser = null;
    if (typeof showToast === 'function') showToast('Até logo! 👋');
    setTimeout(function() { location.reload(); }, 500);
}

function showLoginError(msg) {
    var errorEl = document.getElementById('loginError');
    if (errorEl) {
        errorEl.textContent = msg;
        errorEl.classList.add('show');
    }
}

function clearLoginForm() {
    var nameInput = document.getElementById('loginName');
    var passInput = document.getElementById('loginPassword');
    var confirmInput = document.getElementById('loginConfirm');
    var errorEl = document.getElementById('loginError');
    if (nameInput) nameInput.value = '';
    if (passInput) passInput.value = '';
    if (confirmInput) confirmInput.value = '';
    if (errorEl) errorEl.classList.remove('show');
}

var loginMode = 'login';
function toggleLoginMode() {
    var confirmField = document.getElementById('loginConfirmField');
    var submitBtn = document.getElementById('loginSubmitBtn');
    var switchLink = document.getElementById('loginSwitchLink');
    var subtitle = document.getElementById('loginSubtitle');

    if (loginMode === 'login') {
        loginMode = 'register';
        if (confirmField) confirmField.style.display = 'block';
        if (submitBtn) { submitBtn.textContent = 'Criar Conta'; submitBtn.setAttribute('onclick', 'handleRegister()'); }
        if (switchLink) switchLink.textContent = 'Já tem conta? Entrar';
        if (subtitle) subtitle.textContent = 'Crie sua conta para salvar seu progresso';
    } else {
        loginMode = 'login';
        if (confirmField) confirmField.style.display = 'none';
        if (submitBtn) { submitBtn.textContent = 'Entrar'; submitBtn.setAttribute('onclick', 'handleLogin()'); }
        if (switchLink) switchLink.textContent = 'Não tem conta? Registre-se';
        if (subtitle) subtitle.textContent = 'Acesse seu hub de estudos';
    }
    clearLoginForm();
}

function updateUserBadge() {
    var badge = document.getElementById('loginUserBadge');
    if (!badge || !geekieCurrentUser) return;
    var name = geekieCurrentUser.name || 'Usuário';
    var initials = name.charAt(0).toUpperCase();
    var avatarEl = badge.querySelector('.avatar');
    var nameEl = badge.querySelector('.user-name');
    if (avatarEl) avatarEl.textContent = initials;
    if (nameEl) nameEl.textContent = name;
    badge.style.display = 'flex';
}

// ----- TUTORIAL SYSTEM -----
var tutorialSteps = [
    { icon: 'fa-book-open', tab: 'tab-geekie', title: 'Portal Geekie', desc: 'Aba principal com o portal Geekie One Plus integrado. Aqui você acessa o resumo das matérias e o conteúdo de estudo diretamente da Geekie.', tips: ['Use o menu FAB (botão flutuante) para navegar entre as abas', 'O portal carrega automaticamente ao abrir o app'] },
    { icon: 'fa-comments', tab: 'tab-chat', title: 'Chat IA', desc: 'Converse com um assistente de IA usando WebLLM diretamente no navegador. O histórico da conversa fica salvo neste navegador.', tips: ['O primeiro envio baixa o modelo e pode demorar', 'Pressione Enter para enviar e Shift+Enter para quebrar linha'] },
    { icon: 'fa-magnifying-glass', tab: 'tab-google', title: 'Google', desc: 'Busca rápida no Google integrada. Digite o termo e pesquise sem sair do app. Tem sugestões de matérias prontas para clicar.', tips: ['Clique nas sugestões para pesquisar matérias rapidamente', 'Útil para tirar dúvidas enquanto estuda'] },
    { icon: 'fa-book-journal-whills', tab: 'tab-notes', title: 'Bloco de Notas', desc: 'Escreva e salve notas de estudo. Tem auto-save, contador de palavras/caracteres/linhas ao vivo, e tudo fica salvo no navegador.', tips: ['O auto-save salva automaticamente após 1.5s de inatividade', 'O contador mostra palavras, caracteres e linhas em tempo real'] },
    { icon: 'fa-store', tab: 'tab-store', title: 'Loja de Temas', desc: 'Gaste suas moedas em temas visuais, pets, títulos e sons. Use o filtro por categoria para encontrar o que quer comprar.', tips: ['Ganhe moedas estudando e jogando o Clicker', 'Use o filtro de categoria para navegar mais fácil'] },
    { icon: 'fa-crown', tab: 'tab-titles', title: 'Títulos', desc: 'Veja e equipe títulos que você desbloqueia por XP. Cada título tem um nível de raridade (Comum, Raro, Épico, Lendário).', tips: ['Títulos são desbloqueados automaticamente ao ganhar XP', 'Clique em um título desbloqueado para equipá-lo'] },
    { icon: 'fa-paw', tab: 'tab-pets', title: 'Pets', desc: 'Adote e cuide de pets virtuais. Cada pet tem um nível de felicidade que você pode aumentar interagindo com ele.', tips: ['Pets dão bonus de XP quando felizes', 'A barra de felicidade mostra o humor do pet'] },
    { icon: 'fa-map', tab: 'tab-journey', title: 'Trilha de Progresso', desc: 'Uma jornada com nodes que você desbloqueia completando tarefas. Veja seu progresso geral com a barra de percentual no topo.', tips: ['Complete metas e sessões para avançar na trilha', 'A barra de progresso mostra seu percentual total'] },
    { icon: 'fa-stopwatch', tab: 'tab-timer', title: 'Pomodoro Timer', desc: 'Timer Pomodoro (25min foco, 5min pausa). Define uma meta diária de ciclos e acompanhe com a barra de progresso. Tem som de notificação.', tips: ['Ajuste a meta diária com os botões + e −', 'O som avisa quando o ciclo termina'] },
    { icon: 'fa-list-check', tab: 'tab-goals', title: 'Metas de Estudo', desc: 'Crie e acompanhe metas de estudo. Cada meta tem uma barra de progresso mini que mostra o quanto você concluiu.', tips: ['Marque metas como concluídas para ganhar XP', 'Defina prazos para se organizar melhor'] },
    { icon: 'fa-clone', tab: 'tab-flashcards', title: 'Flashcards', desc: 'Crie cartões de estudo (frente/verso) e revise. A sessão mostra tempo, acertos, precisão e total de cards estudados.', tips: ['Avalie cada card como Fácil, Médio ou Difícil', 'A precisão mostra seu aproveitamento na sessão'] },
    { icon: 'fa-calendar-week', tab: 'tab-planner', title: 'Planner Semanal', desc: 'Planeje suas tarefas da semana. O resumo no topo mostra total, concluídas e pendentes. Cada dia mostra a contagem de tarefas.', tips: ['Adicione tarefas em cada dia da semana', 'O resumo mostra seu progresso semanal'] },
    { icon: 'fa-chart-line', tab: 'tab-stats', title: 'Estatísticas', desc: 'Veja seu desempenho: tempo total de estudo, média por dia, melhor dia e total de sessões. Tudo em cards de resumo.', tips: ['Os cards de resumo dão uma visão geral rápida', 'Dados são atualizados automaticamente'] },
    { icon: 'fa-stopwatch', tab: 'tab-subjects', title: 'Timer de Matérias', desc: 'Cronometre o tempo gasto em cada matéria. A barra no topo mostra o tempo total e quanto você estudou hoje.', tips: ['Selecione a matéria e inicie o timer', 'O tempo é salvo por matéria e por dia'] },
    { icon: 'fa-brain', tab: 'tab-quiz', title: 'Quiz Rápido', desc: 'Teste seus conhecimentos com quizzes. O timer mostra quanto tempo levou, e o resultado traz um breakdown de acertos por categoria.', tips: ['O timer conta o tempo total do quiz', 'O breakdown mostra seus pontos fortes e fracos'] },
    { icon: 'fa-hand-pointer', tab: 'tab-clicker', title: 'Clicker Game', desc: 'Um mini-game clicker onde você ganha moedas clicando. Compre upgrades de auto-clicker e acumule prestígio.', tips: ['Compre auto-clickers para ganhar moedas passivamente', 'O prestígio mostra seu nível de progresso no game'] },
    { icon: 'fa-music', tab: 'tab-ambient', title: 'Sons Ambiente', desc: 'Toque sons ambientes (chuva, floresta, café) enquanto estuda. Controle o volume master e defina um timer de sono.', tips: ['O volume master controla todos os sons', 'O timer de sono desliga os sons automaticamente'] },
    { icon: 'fa-keyboard', tab: 'tab-keysounds', title: 'Sons de Teclado', desc: 'Escolha um som de teclado (mecânico, membrana, etc.) para tocar a cada tecla digitada. Use o botão de teste para ouvir.', tips: ['Clique em "Testar Som" para ouvir antes de escolher', 'Funciona em qualquer campo de texto do app'] },
    { icon: 'fa-calculator', tab: 'tab-calculator', title: 'Calculadora', desc: 'Calculadora com histórico de operações. Copie o resultado e limpe o histórico quando quiser.', tips: ['Use "Copiar resultado" para transferir valores', '"Limpar histórico" apaga todas as operações salvas'] },
    { icon: 'fa-keyboard', tab: 'tab-chars', title: 'Caracteres Úteis', desc: 'Biblioteca de caracteres especiais (símbolos matemáticos, setas, emojis) para copiar. Os usados recentemente ficam salvos no topo.', tips: ['Clique em qualquer caractere para copiar', 'Os 12 últimos usados ficam na seção "Recentes"'] },
    { icon: 'fa-pen-nib', tab: 'tab-title', title: 'Título da Página', desc: 'Personalize o título da aba do navegador e o favicon. Útil para organizar várias abas de estudo abertas.', tips: ['O título aparece na aba do navegador', 'O favicon também pode ser personalizado'] },
    { icon: 'fa-calendar', tab: 'tab-events', title: 'Eventos do Mês', desc: 'Cadastre eventos importantes (provas, entregas, feriados). O countdown automático mostra quanto falta para o próximo evento.', tips: ['O countdown atualiza a cada minuto', 'Adicione provas e prazos para não esquecer'] },
    { icon: 'fa-ticket', tab: 'tab-codes', title: 'Códigos', desc: 'Resgate códigos promocionais para ganhar moedas, XP e itens. O histórico mostra os últimos 10 códigos resgatados.', tips: ['Fique de olho em códigos promocionais', 'O histórico ajuda a não resgatar o mesmo código'] },
    { icon: 'fa-terminal', tab: 'cmdPalette', title: 'Aba de Comandos', desc: 'Acesse atalhos e comandos rápidos do app. Use Ctrl+B para abrir rapidamente.', tips: ['Pressione Ctrl+B para abrir a aba de comandos', 'Atalhos agilizam sua navegação'] },
    { icon: 'fa-clock-rotate-left', tab: 'tab-devlog', title: 'Dev Log', desc: 'Histórico de atualizações do app. Veja todas as novidades e correções de cada versão, com a versão atual destacada.', tips: ['A versão atual fica destacada no topo', 'Cada entrada lista as mudanças da versão'] },
    { icon: 'fa-book-heart', tab: 'tab-diary', title: 'Diário de Estudos', desc: 'Escreva entradas de diário com humor (5 emojis). Veja estatísticas (entradas, palavras, humor médio) e exporte como .txt. Ganhe +5 XP por entrada.', tips: ['Selecione o humor antes de salvar', 'Use "Exportar" para baixar todo o diário'] },
    { icon: 'fa-shield-halved', tab: 'tab-password', title: 'Gerador de Senhas', desc: 'Crie senhas seguras com comprimento ajustável, toggles de caracteres e medidor de entropia em bits. O histórico guarda as últimas 5 senhas.', tips: ['Mais bits de entropia = senha mais forte', 'Clique em uma senha do histórico para copiar' ]}
];

var currentTutorialStep = 0;

function startTutorial() {
    var overlay = document.getElementById('tutorialOverlay');
    if (!overlay) return;
    bindTutorialControls();
    overlay.classList.remove('hidden');
    currentTutorialStep = 0;
    renderTutorialStep();
}

function bindTutorialControls() {
    var overlay = document.getElementById('tutorialOverlay');
    if (!overlay || overlay.dataset.controlsBound === '1') return;
    overlay.dataset.controlsBound = '1';
    overlay.addEventListener('click', function(event) {
        var actionTarget = event.target.closest('[data-tutorial-action]');
        if (actionTarget) {
            var action = actionTarget.getAttribute('data-tutorial-action');
            if (action === 'next') nextTutorialStep();
            if (action === 'prev') prevTutorialStep();
            if (action === 'skip') skipTutorial();
            return;
        }

        var dotTarget = event.target.closest('[data-tutorial-step]');
        if (dotTarget) {
            goToTutorialStep(dotTarget.getAttribute('data-tutorial-step'));
        }
    });
}

function renderTutorialStep() {
    var step = tutorialSteps[currentTutorialStep];
    if (!step) return;

    var iconEl = document.querySelector('.tutorial-step-icon i');
    if (iconEl) { iconEl.className = 'fa-solid ' + step.icon; }

    var titleEl = document.querySelector('.tutorial-step-info h3');
    if (titleEl) titleEl.textContent = step.title;

    var subEl = document.querySelector('.tutorial-step-info p');
    if (subEl) subEl.textContent = 'Aba ' + (currentTutorialStep + 1) + ' de ' + tutorialSteps.length;

    var progressEl = document.getElementById('tutorialProgress');
    if (progressEl) progressEl.textContent = (currentTutorialStep + 1) + ' / ' + tutorialSteps.length;

    var bodyTitle = document.querySelector('.tutorial-body h4');
    if (bodyTitle) bodyTitle.textContent = step.title;

    var bodyDesc = document.querySelector('.tutorial-body p');
    if (bodyDesc) bodyDesc.textContent = step.desc;

    var tipsList = document.querySelector('.tutorial-tips ul');
    if (tipsList) {
        tipsList.innerHTML = step.tips.map(function(t) { return '<li>' + t + '</li>'; }).join('');
    }

    // Progress bar
    var fillEl = document.getElementById('tutorialProgressFill');
    if (fillEl) fillEl.style.width = ((currentTutorialStep + 1) / tutorialSteps.length * 100) + '%';

    // Dots
    var dotsContainer = document.getElementById('tutorialDots');
    if (dotsContainer) {
        var dotsHtml = '';
        for (var i = 0; i < tutorialSteps.length; i++) {
            dotsHtml += '<button type="button" class="tutorial-dot' + (i === currentTutorialStep ? ' active' : '') + '" data-tutorial-step="' + i + '" aria-label="Ir para o passo ' + (i + 1) + '"></button>';
        }
        dotsContainer.innerHTML = dotsHtml;
    }

    // Buttons
    var prevBtn = document.getElementById('tutorialBtnPrev');
    if (prevBtn) prevBtn.disabled = currentTutorialStep === 0;

    var nextBtn = document.getElementById('tutorialBtnNext');
    if (nextBtn) {
        if (currentTutorialStep === tutorialSteps.length - 1) {
            nextBtn.textContent = 'Concluir ✓';
        } else {
            nextBtn.textContent = 'Próximo →';
        }
    }
}

function nextTutorialStep() {
    if (currentTutorialStep < tutorialSteps.length - 1) {
        currentTutorialStep++;
        renderTutorialStep();
    } else {
        finishTutorial();
    }
}

function prevTutorialStep() {
    if (currentTutorialStep > 0) {
        currentTutorialStep--;
        renderTutorialStep();
    }
}

function goToTutorialStep(idx) {
    idx = Number(idx);
    if (!Number.isInteger(idx) || idx < 0 || idx >= tutorialSteps.length) return;
    currentTutorialStep = idx;
    renderTutorialStep();
}

function skipTutorial() {
    finishTutorial();
}

function finishTutorial() {
    var overlay = document.getElementById('tutorialOverlay');
    if (overlay) overlay.classList.add('hidden');
    localStorage.setItem('geekie_tutorial_done', '1');
    if (typeof showToast === 'function') showToast('Tutorial concluído! Bons estudos! 📚');
}

function replayTutorial() {
    localStorage.removeItem('geekie_tutorial_done');
    startTutorial();
}

// ----- FIXES -----
// Fix 1: Ensure tab-content display works correctly
function fixTabDisplay() {
    // This CSS fix is already in the CSS file, but we also ensure JS consistency
    var style = document.createElement('style');
    style.textContent = '.tab-content { display: none; } .tab-content.active { display: flex; flex-direction: column; min-height: 0; }';
    document.head.appendChild(style);
}

// Fix 2: Prevent FAB menu from closing when clicking inside
function fixFabMenuClicks() {
    var fabMenu = document.getElementById('fabMenu');
    if (!fabMenu || fabMenu.dataset.fixApplied) return;
    fabMenu.dataset.fixApplied = '1';
    fabMenu.addEventListener('click', function(e) {
        e.stopPropagation();
    });
}

// Fix 3: Ensure showToast is always available
if (typeof showToast !== 'function') {
    window.showToast = function(msg) {
        var toast = document.createElement('div');
        toast.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:rgba(16,22,38,0.95);border:1px solid rgba(0,255,136,0.3);color:#00ff88;padding:10px 20px;border-radius:12px;font-size:0.85rem;z-index:99999;backdrop-filter:blur(12px);box-shadow:0 8px 24px rgba(0,0,0,0.4);animation:toastIn 0.3s ease;';
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(function() {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(function() { toast.remove(); }, 300);
        }, 2500);
    };
}

// Fix 4: Ensure switchTab handles edge cases
var _tutorialSwitchTabGuard = window.switchTab;
if (typeof _tutorialSwitchTabGuard === 'function') {
    window.switchTab = function(tabId, element) {
        if (!tabId) return;
        var tab = document.getElementById(tabId);
        if (!tab) return;
        return _tutorialSwitchTabGuard.apply(this, arguments);
    };
}

// Fix 5: Add toast animation keyframes if missing
function fixToastAnimation() {
    if (document.getElementById('toastKeyframes')) return;
    var style = document.createElement('style');
    style.id = 'toastKeyframes';
    style.textContent = '@keyframes toastIn { from { transform: translateX(-50%) translateY(20px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }';
    document.head.appendChild(style);
}

// ----- INIT LOGIN + TUTORIAL -----
function initLoginAndTutorial() {
    if (window.__geekieLoginTutorialInitialized) return;
    window.__geekieLoginTutorialInitialized = true;
    fixTabDisplay();
    fixFabMenuClicks();
    fixToastAnimation();
    bindTutorialControls();
    initLoginSystem();
}

// Run after DOM is ready
setTimeout(initLoginAndTutorial, 100);
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(initLoginAndTutorial, 100); });
}

// ===================== END v15.8.0 =====================

// ===================== v16.0.0 INTERFACE + MULTIMODAL TUTOR =====================
(function() {
    if (window.__geekieV16Initialized) return;
    window.__geekieV16Initialized = true;

    var V16_CHAT_KEY = 'geekie_chat_messages_v16';
    var pendingChatImage = null;
    var tabContextMeta = {
        'tab-geekie': ['Portal Geekie', 'fa-book-open', 'Seu ponto de partida para estudar.'],
        'tab-chat': ['Tutor IA', 'fa-sparkles', 'Pergunte, revise e aprenda no seu ritmo.'],
        'tab-google': ['Pesquisa', 'fa-magnifying-glass', 'Encontre fontes para aprofundar seu estudo.'],
        'tab-notes': ['Bloco de Notas', 'fa-book-journal-whills', 'Capture ideias antes que elas escapem.'],
        'tab-store': ['Loja de Temas', 'fa-store', 'Personalize seu espaço de foco.'],
        'tab-titles': ['Títulos', 'fa-crown', 'Transforme constância em progresso visível.'],
        'tab-pets': ['Pets', 'fa-paw', 'Seu companheiro de estudo está por aqui.'],
        'tab-timer': ['Pomodoro', 'fa-stopwatch', 'Uma sessão de foco começa com um clique.'],
        'tab-goals': ['Metas', 'fa-list-check', 'Escolha a próxima pequena vitória.'],
        'tab-flashcards': ['Flashcards', 'fa-clone', 'Revise até a lembrança ficar fácil.'],
        'tab-ambient': ['Sons Ambiente', 'fa-headphones', 'Monte o som que te ajuda a entrar no ritmo.'],
        'tab-calculator': ['Calculadora', 'fa-calculator', 'Resolva e confira suas contas de estudo.'],
        'tab-chars': ['Caracteres Úteis', 'fa-keyboard', 'Símbolos prontos para suas anotações.'],
        'tab-title': ['Título da Página', 'fa-pen-nib', 'Dê ao seu hub uma assinatura pessoal.'],
        'tab-events': ['Eventos', 'fa-calendar-star', 'Desafios especiais para manter o movimento.'],
        'tab-codes': ['Códigos', 'fa-code', 'Recompensas extras para desbloquear.'],
        'tab-journey': ['Trilha de Progresso', 'fa-map', 'Veja até onde sua consistência pode levar.'],
        'tab-devlog': ['Dev Log', 'fa-clock-rotate-left', 'O que mudou no Geekie, com transparência.'],
        'tab-planner': ['Planner Semanal', 'fa-calendar-week', 'Transforme intenção em agenda possível.'],
        'tab-stats': ['Estatísticas', 'fa-chart-bar', 'Leia seus hábitos e ajuste a estratégia.'],
        'tab-subjects': ['Timer por Matéria', 'fa-clock-rotate-left', 'Descubra para onde seu tempo está indo.'],
        'tab-quiz': ['Quiz Rápido', 'fa-brain', 'Teste seu entendimento sem pressão.'],
        'tab-keysounds': ['Sons de Teclado', 'fa-keyboard', 'Micro-recompensas para continuar digitando.'],
        'tab-clicker': ['Clicker Game', 'fa-hand-pointer', 'Uma pausa lúdica entre duas sessões.'],
        'tab-diary': ['Diário', 'fa-book-heart', 'Registre como estudar está acontecendo.'],
        'tab-password': ['Gerador de Senhas', 'fa-shield-halved', 'Uma ferramenta segura para a vida digital.']
    };

    function safeJson(key, fallback) {
        try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
        catch (e) { return fallback; }
    }

    function getPinnedTabs() {
        var pins = safeJson('geekie_pinned_tabs', []);
        return Array.isArray(pins) ? pins : [];
    }

    function togglePinnedTab(tabId, button) {
        var pins = getPinnedTabs();
        var index = pins.indexOf(tabId);
        if (index >= 0) pins.splice(index, 1);
        else pins.push(tabId);
        localStorage.setItem('geekie_pinned_tabs', JSON.stringify(pins));
        if (button) {
            var active = pins.indexOf(tabId) >= 0;
            button.classList.toggle('is-pinned', active);
            button.innerHTML = active ? '<i class="fa-solid fa-thumbtack"></i> Fixada' : '<i class="fa-solid fa-thumbtack"></i> Fixar';
        }
        if (typeof showToast === 'function') showToast(index >= 0 ? 'Aba desafixada.' : 'Aba fixada no seu espaço.');
    }

    function recordTabActivity(tabId, label) {
        var activities = safeJson('geekie_tab_activity', []);
        if (!Array.isArray(activities)) activities = [];
        activities.unshift({ tabId: tabId, label: label, at: new Date().toISOString() });
        localStorage.setItem('geekie_tab_activity', JSON.stringify(activities.slice(0, 30)));
        if (typeof showToast === 'function') showToast('Sessão registrada em ' + label + '.');
    }

    function askGeekieAboutTab(label) {
        if (typeof switchTab === 'function') switchTab('tab-chat', document.getElementById('fab-nav-chat'));
        setTimeout(function() {
            var input = document.getElementById('chatInput');
            if (!input) return;
            input.value = 'Quero estudar ' + label + '. Sugira um próximo passo prático e faça uma pergunta para verificar meu entendimento.';
            input.focus();
        }, 80);
    }

    function addTabContextBars() {
        Object.keys(tabContextMeta).forEach(function(tabId) {
            var tab = document.getElementById(tabId);
            if (!tab || tab.querySelector('.tab-context-bar')) return;
            var meta = tabContextMeta[tabId];
            var bar = document.createElement('div');
            bar.className = 'tab-context-bar';
            var pinned = getPinnedTabs().indexOf(tabId) >= 0;
            bar.innerHTML =
                '<span class="context-title"><i class="fa-solid ' + meta[1] + '"></i>' + meta[0] + '</span>' +
                '<span class="context-pulse">' + meta[2] + '</span>' +
                '<button type="button" class="context-ask"><i class="fa-solid fa-sparkles"></i> Perguntar à Geekie</button>' +
                '<button type="button" class="context-log"><i class="fa-solid fa-check"></i> Registrar sessão</button>' +
                '<button type="button" class="context-pin' + (pinned ? ' is-pinned' : '') + '"><i class="fa-solid fa-thumbtack"></i> ' + (pinned ? 'Fixada' : 'Fixar') + '</button>';
            var first = tab.firstElementChild;
            if (first) tab.insertBefore(bar, first);
            else tab.appendChild(bar);
            bar.querySelector('.context-ask').addEventListener('click', function() { askGeekieAboutTab(meta[0]); });
            bar.querySelector('.context-log').addEventListener('click', function() { recordTabActivity(tabId, meta[0]); });
            bar.querySelector('.context-pin').addEventListener('click', function() { togglePinnedTab(tabId, this); });
        });
    }

    function getV16History() {
        var history = safeJson(V16_CHAT_KEY, null);
        if (!Array.isArray(history)) {
            history = safeJson('geekie_chat_messages', []);
        }
        return Array.isArray(history) ? history.slice(-24) : [];
    }

    function saveV16History(history) {
        try { localStorage.setItem(V16_CHAT_KEY, JSON.stringify(history.slice(-24))); }
        catch (e) {
            // An oversized image should never break the text chat.
            localStorage.setItem(V16_CHAT_KEY, JSON.stringify(history.slice(-12).map(function(item) {
                var copy = Object.assign({}, item);
                delete copy.image;
                return copy;
            })));
        }
    }

    function appendV16Message(message) {
        var messages = document.getElementById('chatMessages');
        if (!messages || !message || !message.content) return;
        var empty = document.getElementById('chatEmptyState');
        if (empty) empty.remove();
        var item = document.createElement('div');
        item.className = 'chat-message ' + (message.role === 'user' ? 'user' : 'assistant');
        var avatar = document.createElement('div');
        avatar.className = 'chat-avatar';
        avatar.innerHTML = message.role === 'user' ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-sparkles"></i>';
        var bubble = document.createElement('div');
        bubble.className = 'chat-bubble';
        if (message.image) {
            var image = document.createElement('img');
            image.className = 'chat-message-image';
            image.src = message.image;
            image.alt = message.imageName || 'Imagem anexada à pergunta';
            bubble.appendChild(image);
            var note = document.createElement('span');
            note.className = 'chat-attachment-note';
            note.textContent = message.imageName ? 'Imagem: ' + message.imageName : 'Imagem anexada';
            bubble.appendChild(note);
        }
        var text = document.createElement('span');
        text.textContent = message.content;
        bubble.appendChild(text);
        item.appendChild(avatar);
        item.appendChild(bubble);
        messages.appendChild(item);
        messages.scrollTop = messages.scrollHeight;
    }

    function renderV16History() {
        var messages = document.getElementById('chatMessages');
        if (!messages) return;
        messages.innerHTML = '';
        var history = getV16History();
        if (!history.length) {
            messages.innerHTML = '<div class="chat-empty" id="chatEmptyState"><i class="fa-solid fa-wand-magic-sparkles" style="font-size:2rem;color:var(--primary);display:block;margin-bottom:10px;"></i>Escolha um modo, escreva sua pergunta ou envie uma foto do exercício.</div>';
            return;
        }
        history.forEach(appendV16Message);
    }

    function compressImage(file) {
        return new Promise(function(resolve, reject) {
            var reader = new FileReader();
            reader.onerror = reject;
            reader.onload = function() {
                var img = new Image();
                img.onerror = reject;
                img.onload = function() {
                    var max = 1024;
                    var ratio = Math.min(1, max / Math.max(img.width, img.height));
                    var canvas = document.createElement('canvas');
                    canvas.width = Math.max(1, Math.round(img.width * ratio));
                    canvas.height = Math.max(1, Math.round(img.height * ratio));
                    var ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL('image/jpeg', 0.78));
                };
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        });
    }

    function removeChatAttachment() {
        pendingChatImage = null;
        var input = document.getElementById('chatImageInput');
        var preview = document.getElementById('chatAttachmentPreview');
        if (input) input.value = '';
        if (preview) preview.classList.remove('visible');
    }
    window.removeChatAttachment = removeChatAttachment;

    async function handleChatImage(event) {
        var file = event.target.files && event.target.files[0];
        if (!file) return;
        if (file.size > 8 * 1024 * 1024) {
            if (typeof showToast === 'function') showToast('Escolha uma imagem de até 8 MB.', true);
            removeChatAttachment();
            return;
        }
        try {
            var data = await compressImage(file);
            pendingChatImage = { data: data, name: file.name };
            var image = document.getElementById('chatAttachmentImage');
            var name = document.getElementById('chatAttachmentName');
            var preview = document.getElementById('chatAttachmentPreview');
            if (image) image.src = data;
            if (name) name.textContent = file.name + ' · imagem pronta para a pergunta';
            if (preview) preview.classList.add('visible');
        } catch (e) {
            if (typeof showToast === 'function') showToast('Não foi possível ler essa imagem.', true);
            removeChatAttachment();
        }
    }

    function getStudyModeInstructions() {
        var modeEl = document.getElementById('chatStudyMode');
        var subjectEl = document.getElementById('chatSubject');
        var mode = modeEl ? modeEl.value : 'explain';
        var subject = subjectEl ? subjectEl.value.trim() : '';
        var instructions = {
            explain: 'Explique com linguagem clara, uma ideia por vez, usando um exemplo simples. Termine com uma pergunta curta para checar o entendimento.',
            solve: 'Resolva passo a passo, mostre a lógica e destaque onde erros comuns acontecem. Não pule contas importantes.',
            quiz: 'Faça uma pergunta por vez, espere a resposta do estudante e dê feedback com uma explicação curta antes de continuar.',
            summary: 'Resuma em tópicos curtos, destaque os conceitos indispensáveis e termine com um mini exemplo ou analogia objetiva.',
            review: 'Ajude a revisar: identifique lacunas, corrija o raciocínio sem constranger e proponha uma microatividade de recuperação.'
        };
        return {
            mode: mode,
            subject: subject,
            instruction: instructions[mode] || instructions.explain
        };
    }

    function updateChatModeHelp() {
        var mode = getStudyModeInstructions().mode;
        var help = document.getElementById('chatModeHelp');
        var labels = {
            explain: 'Clareza primeiro, com exemplo e checagem final.',
            solve: 'Mostra a lógica inteira e sinaliza armadilhas.',
            quiz: 'Você responde; a Geekie conduz a revisão.',
            summary: 'Poucas palavras, alta densidade e um exemplo.',
            review: 'Foco em lacunas e recuperação ativa.'
        };
        if (help) help.textContent = labels[mode] || labels.explain;
        localStorage.setItem('geekie_chat_mode', mode);
    }
    window.useChatPrompt = function(prompt) {
        if (typeof switchTab === 'function') switchTab('tab-chat', document.getElementById('fab-nav-chat'));
        var input = document.getElementById('chatInput');
        if (input) { input.value = prompt; input.focus(); }
    };

    function messageForModel(item, withImages) {
        if (!item.image || !withImages) {
            return { role: item.role, content: item.content + (item.image && !withImages ? '\n[O estudante anexou uma imagem à pergunta; o modelo atual não tem visão.]' : '') };
        }
        return {
            role: item.role,
            content: [
                { type: 'text', text: item.content },
                { type: 'image_url', image_url: { url: item.image } }
            ]
        };
    }

    async function sendV16ChatMessage(event) {
        if (event) event.preventDefault();
        var input = document.getElementById('chatInput');
        var button = document.getElementById('chatSendBtn');
        if (!input || !button || button.disabled) return;
        var text = input.value.trim();
        if (!text && !pendingChatImage) return;
        var study = getStudyModeInstructions();
        var userMessage = {
            role: 'user',
            content: text || 'Analise a imagem anexada e me ajude a estudar o que aparece nela.',
            image: pendingChatImage ? pendingChatImage.data : '',
            imageName: pendingChatImage ? pendingChatImage.name : '',
            mode: study.mode,
            subject: study.subject
        };
        var history = getV16History();
        history.push(userMessage);
        saveV16History(history);
        appendV16Message(userMessage);
        input.value = '';
        removeChatAttachment();
        button.disabled = true;
        if (typeof setChatStatus === 'function') setChatStatus('Pensando como seu tutor…');
        try {
            var engine = await getWebLLMEngine();
            var system = 'Você é a Geekie, uma tutora de estudos em português do Brasil. ' +
                'Seja precisa, paciente e incentive raciocínio próprio. ' + study.instruction +
                (study.subject ? ' A matéria principal é ' + study.subject + '.' : '') +
                ' Se uma imagem for enviada e você não conseguir interpretá-la, diga isso com honestidade e peça uma transcrição do trecho relevante.';
            var context = getV16History().slice(-12).map(function(item) { return messageForModel(item, true); });
            var response;
            try {
                response = await engine.chat.completions.create({
                    messages: [{ role: 'system', content: system }].concat(context),
                    temperature: study.mode === 'quiz' ? 0.55 : 0.65
                });
            } catch (visionError) {
                // Text-only WebLLM models still keep the image in the conversation UI.
                var fallbackContext = getV16History().slice(-12).map(function(item) { return messageForModel(item, false); });
                response = await engine.chat.completions.create({
                    messages: [{ role: 'system', content: system }].concat(fallbackContext),
                    temperature: 0.65
                });
            }
            var answer = getWebLLMResponseText(response).trim() || 'Não recebi uma resposta válida.';
            var finalHistory = getV16History();
            finalHistory.push({ role: 'assistant', content: answer });
            saveV16History(finalHistory);
            appendV16Message({ role: 'assistant', content: answer });
            if (typeof setChatStatus === 'function') setChatStatus(webLLMModelId ? 'Modelo local: ' + webLLMModelId : 'Tutor pronto');
        } catch (error) {
            var detail = error && error.message ? error.message : 'Não foi possível acessar o tutor local.';
            if (typeof setChatStatus === 'function') setChatStatus(detail, true);
            if (typeof showToast === 'function') showToast(detail, true);
        } finally {
            button.disabled = false;
            input.focus();
        }
    }

    function initV16Chat() {
        var form = document.getElementById('chatForm');
        if (!form || form.dataset.v16Bound === '1') {
            renderV16History();
            return;
        }
        // Replace the form so the previous v15 listener cannot send a second request.
        var cleanForm = form.cloneNode(true);
        form.parentNode.replaceChild(cleanForm, form);
        cleanForm.dataset.v16Bound = '1';
        cleanForm.addEventListener('submit', sendV16ChatMessage);
        var imageInput = document.getElementById('chatImageInput');
        if (imageInput) imageInput.addEventListener('change', handleChatImage);
        var mode = localStorage.getItem('geekie_chat_mode');
        var modeSelect = document.getElementById('chatStudyMode');
        if (modeSelect && mode) modeSelect.value = mode;
        if (modeSelect) modeSelect.addEventListener('change', updateChatModeHelp);
        var clear = document.getElementById('chatClearBtn');
        if (clear && clear.dataset.v16Bound !== '1') {
            var cleanClear = clear.cloneNode(true);
            clear.parentNode.replaceChild(cleanClear, clear);
            cleanClear.dataset.v16Bound = '1';
            cleanClear.addEventListener('click', function() {
                localStorage.removeItem(V16_CHAT_KEY);
                localStorage.removeItem('geekie_chat_messages');
                renderV16History();
                if (typeof setChatStatus === 'function') setChatStatus('');
            });
        }
        updateChatModeHelp();
        renderV16History();
    }

    // Rebind the old tab hook while keeping all existing per-tab renderers.
    var previousSwitchTab = window.switchTab;
    if (typeof previousSwitchTab === 'function' && !previousSwitchTab.__v16Wrapped) {
        var wrappedSwitchTab = function() {
            var result = previousSwitchTab.apply(this, arguments);
            addTabContextBars();
            if (arguments[0] === 'tab-chat') initV16Chat();
            return result;
        };
        wrappedSwitchTab.__v16Wrapped = true;
        window.switchTab = wrappedSwitchTab;
    }

    setTimeout(function() {
        addTabContextBars();
        initV16Chat();
    }, 250);
})();
// ===================== END v16.0.0 =====================


// ============================================================================
// v18.0.0 — FEATURE LAB (IMPLEMENTAÇÃO REAL)
// As 26 ferramentas prometidas no v17.0.0 agora existem de fato no código:
// uma função única e persistente para cada aba, tudo em português (pt-BR).
// ============================================================================
(function() {
    'use strict';
    if (window.__featureLabV18) return;
    window.__featureLabV18 = true;

    // ---------- helpers ----------
    function flLS(key, fallback) {
        try { var v = JSON.parse(localStorage.getItem(key)); return v === null || v === undefined ? fallback : v; }
        catch (e) { return fallback; }
    }
    function flSave(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }
    function flToday() { return new Date().toISOString().slice(0, 10); }
    function flEsc(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function flPanel(title, badge) {
        var p = document.createElement('div');
        p.className = 'fl-panel';
        p.innerHTML = '<div class="fl-title"><i class="fa-solid fa-flask"></i>' + flEsc(title) +
            (badge ? '<span class="fl-badge">' + flEsc(badge) + '</span>' : '') + '</div>';
        return p;
    }
    function flBtn(html, cls, onClick) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'fl-btn' + (cls ? ' ' + cls : '');
        b.innerHTML = html;
        b.addEventListener('click', onClick);
        return b;
    }
    function flToast(msg, isErr) { if (typeof showToast === 'function') showToast(msg, !!isErr); }
    function flCopy(text, okMsg) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function() { flToast(okMsg || 'Copiado!'); })
                .catch(function() { flToast('Não foi possível copiar.', true); });
        } else { flToast('Copiagem não suportada neste navegador.', true); }
    }
    function flDownload(filename, content, mime) {
        var blob = new Blob([content], { type: (mime || 'text/plain') + ';charset=utf-8' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() { URL.revokeObjectURL(a.href); a.remove(); }, 400);
    }
    function flInsertBefore(parent, panel, refSelector) {
        var ref = refSelector ? parent.querySelector(refSelector) : null;
        if (ref) parent.insertBefore(panel, ref); else parent.appendChild(panel);
    }

    var flRefreshers = {}; // tabId -> [fn]
    function flOnRefresh(tabId, fn) {
        if (!flRefreshers[tabId]) flRefreshers[tabId] = [];
        flRefreshers[tabId].push(fn);
    }
    function flRefreshTab(tabId) {
        var fns = flRefreshers[tabId];
        if (!fns) return;
        fns.forEach(function(fn) { try { fn(); } catch (e) { /* silencioso */ } });
    }

    // ========================================================================
    // 1) PORTAL GEEKIE — Cockpit de Estudo (v18.0.1: recolhível)
    //    Objetivo da sessão, retomada do último foco e stats rápidos.
    //    Recolhido por padrão para o portal Geekie ocupar a tela inteira.
    // ========================================================================
    function initCockpit() {
        var tab = document.getElementById('tab-geekie');
        if (!tab || tab.dataset.flCockpit) return;
        tab.dataset.flCockpit = '1';

        var panel = flPanel('Cockpit de Estudo', 'novo');
        panel.classList.add('fl-collapsible');

        // v18.0.1 — toggle de recolher/expandir dentro do título + resumo do objetivo
        var titleEl = panel.querySelector('.fl-title');
        titleEl.insertAdjacentHTML('beforeend',
            '<span class="fl-cockpit-summary" id="flCockpitSummary" title=""></span>' +
            '<span class="fl-collapse-toggle" id="flCockpitToggle" role="button" tabindex="0" aria-expanded="false" title="Expandir / recolher cockpit"><i class="fa-solid fa-chevron-down"></i></span>');

        panel.insertAdjacentHTML('beforeend',
            '<div class="fl-panel-body">' +
            '<div class="fl-row">' +
                '<input type="text" class="fl-input" id="flCockpitGoal" maxlength="80" placeholder="Qual é o objetivo desta sessão? Ex: terminar os exercícios de física">' +
            '</div>' +
            '<div class="fl-row" style="margin-top:8px;">' +
                '<button type="button" class="fl-btn fl-btn-primary" id="flCockpitSave"><i class="fa-solid fa-bullseye"></i> Definir Objetivo</button>' +
                '<button type="button" class="fl-btn" id="flCockpitResume" style="display:none;"><i class="fa-solid fa-rotate-left"></i> Retomar último foco</button>' +
            '</div>' +
            '<div class="fl-cockpit-goal" id="flCockpitCurrent" style="margin-top:10px; display:none;"></div>' +
            '<div class="fl-stat-row" id="flCockpitStats"></div>' +
            '</div>');

        flInsertBefore(tab, panel, '.iframe-container');

        var input = panel.querySelector('#flCockpitGoal');
        var current = panel.querySelector('#flCockpitCurrent');
        var resumeBtn = panel.querySelector('#flCockpitResume');
        var summary = panel.querySelector('#flCockpitSummary');
        var toggleBtn = panel.querySelector('#flCockpitToggle');

        // v18.0.1 — estado recolhido persistente (padrão: recolhido = portal em tela grande)
        var COLLAPSE_KEY = 'fl_cockpit_collapsed';
        var startCollapsed = true;
        try { if (localStorage.getItem(COLLAPSE_KEY) === '0') startCollapsed = false; } catch (e) {}

        function setCollapsed(collapsed) {
            panel.classList.toggle('is-collapsed', collapsed);
            toggleBtn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
            toggleBtn.title = collapsed ? 'Expandir cockpit' : 'Recolher cockpit (portal em tela grande)';
            try { localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0'); } catch (e) {}
        }

        function toggleHandler(e) {
            if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
            e.preventDefault();
            e.stopPropagation();
            setCollapsed(!panel.classList.contains('is-collapsed'));
        }
        titleEl.addEventListener('click', toggleHandler);
        titleEl.addEventListener('keydown', toggleHandler);

        function renderCurrent() {
            var goal = flLS('fl_session_goal', null);
            if (goal && goal.text) {
                current.style.display = 'flex';
                current.innerHTML = '<i class="fa-solid fa-flag-checkered" style="color:var(--accent);"></i>' +
                    'Objetivo salvo: <strong>' + flEsc(goal.text) + '</strong>' +
                    '<span style="font-size:0.68rem;color:var(--text-muted);">(' + flEsc(goal.date.split('-').reverse().join('/')) + ')</span>';
            } else {
                current.style.display = 'none';
            }
            var hist = flLS('geekie_focus_history', []);
            resumeBtn.style.display = (hist && hist.length) ? 'inline-flex' : 'none';
        }

        // v18.0.1 — resumo do objetivo visível mesmo com o painel recolhido
        function renderSummary() {
            var goal = flLS('fl_session_goal', null);
            if (goal && goal.text) {
                summary.innerHTML = '<i class="fa-solid fa-flag-checkered"></i>' + flEsc(goal.text);
                summary.title = 'Objetivo da sessão: ' + goal.text;
            } else {
                summary.textContent = 'toque para definir o objetivo da sessão';
                summary.title = '';
            }
        }

        function renderStats() {
            var stats = panel.querySelector('#flCockpitStats');
            var pomToday = parseInt(localStorage.getItem('geekiePomodoroTotal') || '0', 10);
            var sec = parseInt(localStorage.getItem('geekieStudySeconds') || '0', 10);
            var streak = parseInt(localStorage.getItem('geekieStreak') || '1', 10);
            var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
            stats.innerHTML =
                '<div class="fl-mini-stat"><div class="fl-mini-val">' + pomToday + '</div><div class="fl-mini-lbl">Pomodoros</div></div>' +
                '<div class="fl-mini-stat"><div class="fl-mini-val">' + h + 'h ' + (m < 10 ? '0' : '') + m + 'm</div><div class="fl-mini-lbl">Foco hoje</div></div>' +
                '<div class="fl-mini-stat"><div class="fl-mini-val">' + streak + ' 🔥</div><div class="fl-mini-lbl">Dias seguidos</div></div>';
        }

        panel.querySelector('#flCockpitSave').addEventListener('click', function() {
            var text = input.value.trim();
            if (!text) { flToast('Escreva um objetivo para a sessão!', true); return; }
            flSave('fl_session_goal', { text: text, date: flToday() });
            var lastReward = localStorage.getItem('fl_goal_xp_date');
            if (lastReward !== flToday()) {
                localStorage.setItem('fl_goal_xp_date', flToday());
                if (typeof gainXP === 'function') gainXP(5);
                flToast('🎯 Objetivo definido! +5 XP por começar com intenção.');
            } else {
                flToast('🎯 Objetivo atualizado!');
            }
            input.value = '';
            renderCurrent();
            renderSummary();
            // v18.0.1 — fecha o painel sozinho para o portal voltar à tela grande
            setCollapsed(true);
        });

        resumeBtn.addEventListener('click', function() {
            var hist = flLS('geekie_focus_history', []);
            var last = hist && hist.length ? hist[0] : null;
            if (!last) { flToast('Nenhum foco anterior registrado ainda.', true); return; }
            if (typeof switchTab === 'function') switchTab('tab-timer', null);
            setTimeout(function() {
                var intent = document.getElementById('flFocusIntention');
                if (intent) { intent.value = last.text; intent.dispatchEvent(new Event('input')); }
                flToast('Retomando: ' + last.text);
            }, 120);
        });

        setCollapsed(startCollapsed);
        renderCurrent(); renderStats(); renderSummary();
        flOnRefresh('tab-geekie', function() { renderCurrent(); renderStats(); renderSummary(); });
    }

    // ========================================================================
    // 2) TUTOR IA — Exportar conversa + copiar última resposta + memória
    // ========================================================================
    function initChatTools() {
        var card = document.querySelector('#tab-chat .chat-page');
        if (!card || card.dataset.flChat) return;
        card.dataset.flChat = '1';

        var actions = document.createElement('div');
        actions.className = 'fl-chat-actions';
        actions.appendChild(flBtn('<i class="fa-solid fa-file-export"></i> Exportar Conversa', 'fl-btn-primary', exportChat));
        actions.appendChild(flBtn('<i class="fa-solid fa-copy"></i> Copiar Última Resposta', '', copyLastAnswer));

        var tools = card.querySelector('.chat-tools');
        if (tools) tools.parentNode.insertBefore(actions, tools.nextSibling);
        else card.insertBefore(actions, card.firstChild);

        function getHistory() {
            var h = flLS('geekie_chat_messages_v16', null);
            if (h && h.length) return h;
            return flLS('geekie_chat_messages', []);
        }
        function exportChat() {
            var hist = getHistory();
            if (!hist || !hist.length) { flToast('A conversa está vazia — nada para exportar.', true); return; }
            var lines = ['# Conversa com a Geekie (Tutor IA)', '# Exportada em ' + new Date().toLocaleString('pt-BR'), ''];
            hist.forEach(function(msg) {
                var who = msg.role === 'user' ? '**Você:**' : (msg.role === 'assistant' ? '**Geekie:**' : '*Sistema:*');
                lines.push(who);
                lines.push(String(msg.content || '').replace(/!\[imagem anexada\][^)]*\)/g, '_(imagem anexada)_'));
                lines.push('');
            });
            flDownload('conversa-geekie-' + flToday() + '.md', lines.join('\n'), 'text/markdown');
            flToast('Conversa exportada em Markdown!');
        }
        function copyLastAnswer() {
            var hist = getHistory();
            var last = null;
            for (var i = hist.length - 1; i >= 0; i--) {
                if (hist[i].role === 'assistant') { last = hist[i]; break; }
            }
            if (!last) { flToast('A Geekie ainda não respondeu nada.', true); return; }
            flCopy(String(last.content || ''), 'Última resposta copiada!');
        }

        // memória de modo/matéria entre sessões
        var subject = document.getElementById('chatSubject');
        if (subject) {
            var saved = localStorage.getItem('fl_chat_subject');
            if (saved && !subject.value) subject.value = saved;
            subject.addEventListener('input', function() {
                localStorage.setItem('fl_chat_subject', this.value.slice(0, 40));
            });
        }
    }

    // ========================================================================
    // 3) PESQUISA (GOOGLE) — Fila de pesquisas salvas
    // ========================================================================
    function initSearchQueue() {
        var tab = document.getElementById('tab-google');
        if (!tab || tab.dataset.flQueue) return;
        tab.dataset.flQueue = '1';

        var panel = flPanel('Fila de Pesquisas', 'novo');
        panel.insertAdjacentHTML('beforeend',
            '<div class="fl-row">' +
                '<input type="text" class="fl-input" id="flQueueInput" maxlength="60" placeholder="Termo para pesquisar depois… (Enter para salvar)">' +
                '<button type="button" class="fl-btn fl-btn-primary" id="flQueueSave"><i class="fa-solid fa-bookmark"></i> Salvar</button>' +
            '</div>' +
            '<div class="fl-queue-list" id="flQueueList"></div>' +
            '<div class="fl-hint">Clique em um termo para abrir a pesquisa no Google integrado.</div>');

        flInsertBefore(tab, panel, '.iframe-container');

        var input = panel.querySelector('#flQueueInput');
        var list = panel.querySelector('#flQueueList');

        function render() {
            var items = flLS('fl_search_queue', []);
            list.innerHTML = '';
            if (!items.length) {
                list.innerHTML = '<div class="fl-empty">Nenhuma pesquisa salva ainda. Anote as dúvidas que surgirem durante o estudo!</div>';
                return;
            }
            items.forEach(function(q, idx) {
                var chip = document.createElement('span');
                chip.className = 'fl-queue-item';
                chip.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i>' + flEsc(q) +
                    '<i class="fa-solid fa-xmark" style="opacity:.6;" title="Remover"></i>';
                chip.addEventListener('click', function(ev) {
                    if (ev.target.classList.contains('fa-xmark')) {
                        items.splice(idx, 1);
                        flSave('fl_search_queue', items);
                        render();
                        return;
                    }
                    var iframe = document.getElementById('googleIframe');
                    if (iframe) {
                        iframe.src = 'https://www.google.com/search?igu=1&safe=active&q=' + encodeURIComponent(q);
                        flToast('Pesquisando: ' + q);
                    }
                });
                list.appendChild(chip);
            });
        }
        function save() {
            var val = input.value.trim();
            if (!val) { flToast('Digite um termo primeiro!', true); return; }
            var items = flLS('fl_search_queue', []);
            items.unshift(val);
            if (items.length > 10) items = items.slice(0, 10);
            flSave('fl_search_queue', items);
            input.value = '';
            render();
            flToast('Pesquisa salva na fila!');
        }
        panel.querySelector('#flQueueSave').addEventListener('click', save);
        input.addEventListener('keydown', function(e) { if (e.key === 'Enter') save(); });
        render();
    }

    // ========================================================================
    // 4) NOTAS — Gerador de Mapa de Ideias
    // ========================================================================
    function initIdeaMap() {
        var card = document.querySelector('#tab-notes .glass-card');
        if (!card || card.dataset.flIdeaMap) return;
        card.dataset.flIdeaMap = '1';

        var toolbar = card.querySelector('.notes-toolbar:nth-of-type(2)') ||
            Array.prototype.slice.call(card.querySelectorAll('.notes-toolbar')).pop();
        if (toolbar) {
            var mapBtn = flBtn('<i class="fa-solid fa-sitemap"></i> Mapa de Ideias', '', openMap);
            mapBtn.style.fontSize = '0.8rem';
            toolbar.appendChild(mapBtn);
        }

        function parseTree(text) {
            var lines = String(text || '').split('\n');
            var nodes = [];
            var stack = [{ level: -1, children: nodes }];
            lines.forEach(function(raw) {
                if (!raw.trim()) return;
                var indent = raw.match(/^\s*/)[0].length;
                var level = Math.min(Math.floor(indent / 2), 6);
                var content = raw.trim()
                    .replace(/^[-*•–]\s+/, '')
                    .replace(/^\d+[.)]\s+/, '')
                    .replace(/^#{1,6}\s+/, '');
                if (!content) return;
                var node = { text: content, children: [] };
                while (stack.length > 1 && stack[stack.length - 1].level >= level) stack.pop();
                stack[stack.length - 1].children.push(node);
                stack.push({ level: level, children: node.children });
            });
            return nodes;
        }

        function openMap() {
            var noteContent = document.getElementById('noteContent');
            var text = noteContent ? noteContent.value : '';
            if (!text.trim()) { flToast('A nota está vazia — escreva algo antes de mapear!', true); return; }
            var tree = parseTree(text);
            if (!tree.length) { flToast('Nada para mapear nesta nota.', true); return; }

            var overlay = document.createElement('div');
            overlay.className = 'fl-modal-overlay';
            overlay.innerHTML =
                '<div class="fl-modal">' +
                    '<div class="fl-modal-head">' +
                        '<h4><i class="fa-solid fa-sitemap" style="color:var(--primary);"></i> Mapa de Ideias</h4>' +
                        '<button type="button" class="fl-btn fl-btn-primary" id="imCopy"><i class="fa-solid fa-copy"></i> Copiar estrutura</button>' +
                        '<button type="button" class="fl-icon-btn" id="imClose"><i class="fa-solid fa-xmark"></i></button>' +
                    '</div>' +
                    '<div class="fl-modal-body"><ul class="im-tree" id="imTree"></ul></div>' +
                '</div>';
            document.body.appendChild(overlay);

            function buildUl(children) {
                var ul = document.createElement('ul');
                children.forEach(function(node, i) {
                    var li = document.createElement('li');
                    li.className = 'im-node' + (i === 0 && !node.children.length ? '' : '');
                    li.innerHTML = '<span class="im-bullet"><i class="fa-solid ' +
                        (node.children.length ? 'fa-folder' : 'fa-feather-pointed') + '"></i></span><span>' + flEsc(node.text) + '</span>';
                    if (node.children.length) li.appendChild(buildUl(node.children));
                    ul.appendChild(li);
                });
                return ul;
            }
            var treeEl = overlay.querySelector('#imTree');
            var wrapper = document.createElement('ul');
            wrapper.className = 'im-tree';
            tree.forEach(function(node, idx) {
                var li = document.createElement('li');
                li.className = 'im-node im-root';
                li.innerHTML = '<span class="im-bullet"><i class="fa-solid fa-star"></i></span><span>' + flEsc(node.text) + '</span>';
                if (node.children.length) li.appendChild(buildUl(node.children));
                wrapper.appendChild(li);
            });
            treeEl.replaceWith(wrapper);

            function toText(children, depth) {
                var out = '';
                children.forEach(function(node) {
                    out += new Array(depth + 1).join('  ') + (depth === 0 ? '# ' : '- ') + node.text + '\n';
                    out += toText(node.children, depth + 1);
                });
                return out;
            }
            overlay.querySelector('#imCopy').addEventListener('click', function() {
                flCopy(toText(tree, 0), 'Estrutura copiada!');
            });
            overlay.querySelector('#imClose').addEventListener('click', function() { overlay.remove(); });
            overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
        }
    }

    // ========================================================================
    // 5) LOJA — Sorteio de Tema do Dia
    // ========================================================================
    function initThemeRaffle() {
        var card = document.querySelector('#tab-store .glass-card');
        if (!card || !Array.isArray(storeItems) || card.dataset.flRaffle) return;
        card.dataset.flRaffle = '1';

        var anchor = card.querySelector('#customThemeEquippedBadge');
        var panel = flPanel('Sorteio de Tema do Dia', 'diário');
        panel.insertAdjacentHTML('beforeend',
            '<div class="fl-row">' +
                '<button type="button" class="fl-btn fl-btn-primary" id="flRaffleBtn"><i class="fa-solid fa-dice"></i> Sortear Tema de Hoje</button>' +
            '</div>' +
            '<div class="fl-hint">Um tema do catálogo é sorteado por dia (determinístico). Se você já o possui, pode equipá-lo na hora.</div>' +
            '<div id="flRaffleResult"></div>');

        if (anchor && anchor.parentNode) anchor.parentNode.parentNode.insertBefore(panel, anchor.parentNode.nextSibling);
        else card.insertBefore(panel, card.querySelector('.tab-search-wrap'));

        function dayIndex(str) {
            var h = 0;
            for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
            return h;
        }

        panel.querySelector('#flRaffleBtn').addEventListener('click', function() {
            var today = flToday();
            var raffle = flLS('fl_raffle', {});
            var item;
            if (raffle.date === today && raffle.themeId) {
                item = storeItems.find(function(s) { return s.id === raffle.themeId; });
            }
            if (!item) {
                item = storeItems[dayIndex(today) % storeItems.length];
                flSave('fl_raffle', { date: today, themeId: item.id });
            }
            var owned = Array.isArray(ownedThemes) && ownedThemes.indexOf(item.id) >= 0;
            var result = panel.querySelector('#flRaffleResult');
            result.innerHTML =
                '<div class="fl-raffle-result">' +
                    '<span class="fl-raffle-icon"><i class="fa-solid ' + item.icon + '" style="color:' + item.color + ';"></i></span>' +
                    '<div style="flex:1;"><strong>' + flEsc(item.name) + '</strong> — ' + flEsc(item.effect) +
                    '<div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px;">' + flEsc(item.desc) + '</div></div>' +
                    (owned
                        ? '<button type="button" class="fl-btn fl-btn-primary" id="flRaffleEquip"><i class="fa-solid fa-check"></i> Equipar</button>'
                        : '<span class="fl-chip" style="cursor:default;">' + item.xpReq + ' XP</span>') +
                '</div>';
            var equipBtn = result.querySelector('#flRaffleEquip');
            if (equipBtn) equipBtn.addEventListener('click', function() {
                if (typeof equipTheme === 'function') equipTheme(item.id);
            });
            // destacar o card sorteado na grade
            if (typeof renderStore === 'function') renderStore();
            var grid = document.getElementById('storeGrid');
            if (grid) {
                var cards = grid.querySelectorAll('.store-item');
                cards.forEach(function(c) { c.classList.remove('fl-raffle-winner'); });
                var idx = storeItems.indexOf(item);
                if (idx >= 0 && cards[idx]) {
                    cards[idx].classList.add('fl-raffle-winner');
                    cards[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(function() { cards[idx].classList.remove('fl-raffle-winner'); }, 8000);
                }
            }
            flToast('🎲 Tema do dia: ' + item.name + '!');
        });
    }

    // ========================================================================
    // 6) TÍTULOS — Meta de Título Pessoal
    // ========================================================================
    function initTitleGoal() {
        var card = document.querySelector('#tab-titles .glass-card');
        if (!card || !Array.isArray(titlesList) || card.dataset.flTitleGoal) return;
        card.dataset.flTitleGoal = '1';

        var banner = card.querySelector('#titlesXpDisplay');
        var anchor = banner ? banner.closest('div[style]') : null;

        var panel = flPanel('Meta de Título Pessoal', 'novo');
        panel.insertAdjacentHTML('beforeend',
            '<div class="fl-row">' +
                '<select id="flTitleGoalSelect" style="flex:1;min-width:220px;padding:9px 12px;"></select>' +
                '<button type="button" class="fl-btn fl-btn-primary" id="flTitleGoalSet"><i class="fa-solid fa-crosshairs"></i> Definir Meta</button>' +
            '</div>' +
            '<div id="flTitleGoalProgress" style="margin-top:12px;"></div>');

        if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(panel, anchor.nextSibling);
        else card.appendChild(panel);

        var select = panel.querySelector('#flTitleGoalSelect');
        var progress = panel.querySelector('#flTitleGoalProgress');
        var currentXp = 0;

        function fillSelect() {
            currentXp = parseInt(localStorage.getItem('geekieXP') || '0', 10);
            select.innerHTML = '';
            titlesList.filter(function(t) { return !t.petTitle; }).forEach(function(t) {
                var opt = document.createElement('option');
                opt.value = t.id;
                opt.textContent = t.name + ' (' + t.xpReq + ' XP)';
                select.appendChild(opt);
            });
            var goal = flLS('fl_title_goal', null);
            if (goal) select.value = goal;
        }

        function renderProgress() {
            var goalId = flLS('fl_title_goal', null);
            if (!goalId) {
                progress.innerHTML = '<div class="fl-empty">Nenhuma meta definida — escolha o próximo título que você quer conquistar.</div>';
                return;
            }
            var target = titlesList.find(function(t) { return t.id === goalId; });
            if (!target) { flSave('fl_title_goal', null); renderProgress(); return; }
            currentXp = parseInt(localStorage.getItem('geekieXP') || '0', 10);
            if (currentXp >= target.xpReq) {
                progress.innerHTML =
                    '<div class="fl-insight"><i class="fa-solid fa-trophy" style="color:var(--gold);"></i>' +
                    '<div>Meta <strong>conquistada</strong>: ' + flEsc(target.name) + '! 🎉 Defina uma nova para continuar evoluindo.</div></div>';
                flSave('fl_title_goal', null);
                if (select.value) { /* manter seleção visível */ }
                return;
            }
            var pct = Math.min(100, Math.round((currentXp / target.xpReq) * 100));
            var missing = target.xpReq - currentXp;
            progress.innerHTML =
                '<div class="fl-row" style="justify-content:space-between;margin-bottom:6px;">' +
                    '<span style="font-size:0.85rem;color:#d8ccff;"><i class="fa-solid fa-crown" style="color:var(--gold);"></i> ' + flEsc(target.name) + '</span>' +
                    '<span style="font-size:0.78rem;color:var(--text-muted);">faltam <strong style="color:var(--primary);">' + missing + ' XP</strong></span>' +
                '</div>' +
                '<div class="fl-meter"><div class="fl-meter-fill" style="width:' + pct + '%;"></div></div>' +
                '<div class="fl-hint">' + currentXp + ' / ' + target.xpReq + ' XP (' + pct + '%)</div>';
        }

        panel.querySelector('#flTitleGoalSet').addEventListener('click', function() {
            flSave('fl_title_goal', select.value);
            renderProgress();
            flToast('🎯 Meta de título definida!');
        });

        fillSelect(); renderProgress();
        flOnRefresh('tab-titles', function() { fillSelect(); renderProgress(); });
    }

    // ========================================================================
    // 7) PETS — Check-in de Cuidado (carinho, humor e vínculo)
    // ========================================================================
    function initPetCare() {
        var card = document.querySelector('#tab-pets .glass-card');
        if (!card || card.dataset.flPetCare) return;
        card.dataset.flPetCare = '1';

        var anchor = card.querySelector('.pet-coins-info');
        var panel = flPanel('Cuidado com o Pet', 'vínculo');
        panel.insertAdjacentHTML('beforeend',
            '<div id="flPetCareBody"></div>');

        if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(panel, anchor.nextSibling);
        else card.appendChild(panel);

        var body = panel.querySelector('#flPetCareBody');
        var moods = ['😞', '😟', '😐', '🙂', '😄'];

        function state() {
            var st = flLS('fl_pet_care', { bond: 0, careToday: 0, date: '' });
            if (st.date !== flToday()) { st.date = flToday(); st.careToday = 0; }
            return st;
        }

        function render() {
            var st = state();
            var activeId = localStorage.getItem('geekieActivePet');
            var pet = Array.isArray(petsData) ? petsData.find(function(p) { return p.id === activeId; }) : null;
            if (!pet) {
                body.innerHTML = '<div class="fl-empty"><i class="fa-solid fa-paw"></i> Selecione um pet ativo na grade abaixo para cuidar dele.</div>';
                return;
            }
            var mood = Math.min(5, Math.max(1, 1 + Math.floor(st.bond / 25)));
            body.innerHTML =
                '<div class="fl-row" style="justify-content:space-between;">' +
                    '<span style="font-size:0.9rem;color:#d8ccff;"><i class="fa-solid fa-paw" style="color:#fb923c;"></i> <strong>' + flEsc(pet.name || pet.id) + '</strong> <span class="fl-pet-mood">' + moods[mood - 1] + '</span></span>' +
                    '<span style="font-size:0.72rem;color:var(--text-muted);">carinhos hoje: ' + st.careToday + '/5</span>' +
                '</div>' +
                '<div class="fl-bond-row">' +
                    '<span style="font-size:0.72rem;color:var(--text-muted);">vínculo</span>' +
                    '<div class="fl-meter" style="flex:1;"><div class="fl-meter-fill" style="width:' + st.bond + '%;"></div></div>' +
                    '<span style="font-size:0.78rem;color:var(--primary);font-weight:700;">' + st.bond + '%</span>' +
                '</div>' +
                '<button type="button" class="fl-btn fl-btn-primary" id="flPetCareBtn"><i class="fa-solid fa-heart"></i> Fazer carinho</button>' +
                '<div class="fl-hint">Cuide do seu pet uma vez ao dia para o vínculo crescer — o humor melhora conforme o vínculo sobe.</div>';
            body.querySelector('#flPetCareBtn').addEventListener('click', function() {
                var s = state();
                if (s.careToday >= 5) { flToast('Seu pet já recebeu muito carinho hoje! Volte amanhã. 😊', true); return; }
                s.careToday++;
                s.bond = Math.min(100, s.bond + 6);
                flSave('fl_pet_care', s);
                flToast('🤗 ' + (pet.name || 'Seu pet') + ' está feliz! Vínculo: ' + s.bond + '%');
                render();
            });
        }
        render();
        flOnRefresh('tab-pets', render);
    }

    // ========================================================================
    // 8) POMODORO — Intenção de Foco por sessão
    // ========================================================================
    function initFocusIntention() {
        var card = document.querySelector('#tab-timer .glass-card');
        if (!card || card.dataset.flIntention) return;
        card.dataset.flIntention = '1';

        var modes = card.querySelector('.pomo-modes');
        var panel = flPanel('Intenção de Foco', 'novo');
        panel.insertAdjacentHTML('beforeend',
            '<div class="fl-row">' +
                '<input type="text" class="fl-input" id="flFocusIntention" maxlength="70" placeholder="No que você vai focar nesta sessão?">' +
                '<button type="button" class="fl-btn fl-btn-primary" id="flFocusSet"><i class="fa-solid fa-bolt"></i> Definir</button>' +
            '</div>' +
            '<div id="flFocusCurrent" style="margin-top:10px;"></div>' +
            '<div class="fl-queue-list" id="flFocusHistory" style="margin-top:8px;"></div>');

        if (modes && modes.parentNode) modes.parentNode.insertBefore(panel, modes.nextSibling);
        else card.appendChild(panel);

        var input = panel.querySelector('#flFocusIntention');
        var current = panel.querySelector('#flFocusCurrent');

        function renderCurrent() {
            var intent = localStorage.getItem('fl_focus_intention') || '';
            if (intent) {
                current.innerHTML = '<span class="fl-intention-chip"><i class="fa-solid fa-bullseye"></i><span>' + flEsc(intent) + '</span></span>';
            } else {
                current.innerHTML = '<div class="fl-empty">Nenhuma intenção definida — sessões com intenção clara rendem mais!</div>';
            }
        }
        function renderHistory() {
            var list = panel.querySelector('#flFocusHistory');
            var hist = flLS('geekie_focus_history', []);
            if (!hist.length) { list.innerHTML = ''; return; }
            list.innerHTML = '<div class="fl-hint" style="margin:0 0 6px 0;">Últimos focos concluídos (clique para retomar):</div>';
            hist.slice(0, 3).forEach(function(item) {
                var chip = document.createElement('span');
                chip.className = 'fl-queue-item';
                chip.innerHTML = '<i class="fa-solid fa-clock-rotate-left"></i>' + flEsc(item.text);
                chip.addEventListener('click', function() {
                    input.value = item.text;
                    localStorage.setItem('fl_focus_intention', item.text);
                    renderCurrent();
                    flToast('Intenção retomada!');
                });
                list.appendChild(chip);
            });
        }

        panel.querySelector('#flFocusSet').addEventListener('click', function() {
            var val = input.value.trim();
            if (!val) { flToast('Descreva o foco da sessão primeiro!', true); return; }
            localStorage.setItem('fl_focus_intention', val);
            input.value = '';
            renderCurrent();
            flToast('⚡ Intenção de foco registrada! Boa sessão.');
        });

        // registra a intenção quando o Pomodoro é concluído
        if (typeof window.sendPomodoroNotification === 'function' && !window.sendPomodoroNotification.__flWrapped) {
            var orig = window.sendPomodoroNotification;
            var wrapped = function(msg) {
                try {
                    if (msg && String(msg).indexOf('Foco conclu') >= 0) {
                        var intent = localStorage.getItem('fl_focus_intention') || '';
                        if (intent) {
                            var hist = flLS('geekie_focus_history', []);
                            hist.unshift({ text: intent, at: new Date().toISOString() });
                            flSave('geekie_focus_history', hist.slice(0, 5));
                            localStorage.removeItem('fl_focus_intention');
                            if (document.getElementById('flFocusCurrent')) { renderCurrent(); renderHistory(); }
                        }
                    }
                } catch (e) {}
                return orig.apply(this, arguments);
            };
            wrapped.__flWrapped = true;
            window.sendPomodoroNotification = wrapped;
        }

        renderCurrent(); renderHistory();
        flOnRefresh('tab-timer', function() { renderCurrent(); renderHistory(); });
    }

    // ========================================================================
    // 9) METAS — Gerador de Micro-Metas
    // ========================================================================
    function initMicroGoals() {
        var card = document.querySelector('#tab-goals .glass-card');
        if (!card || card.dataset.flMicro) return;
        card.dataset.flMicro = '1';

        var filters = card.querySelector('.todo-input-group');
        var panel = flPanel('Gerador de Micro-Metas', 'novo');
        panel.insertAdjacentHTML('beforeend',
            '<div class="fl-row">' +
                '<input type="text" class="fl-input" id="flMicroTopic" maxlength="60" placeholder="Tema vago (ex: estudar biologia)…">' +
                '<button type="button" class="fl-btn fl-btn-primary" id="flMicroGo"><i class="fa-solid fa-wand-magic-sparkles"></i> Gerar Micro-Metas</button>' +
            '</div>' +
            '<div id="flMicroList" class="fl-micro-list"></div>' +
            '<div class="fl-hint">Transforma uma tarefa vaga em 4 passos pequenos e acionáveis — adicionados direto na sua lista.</div>');

        if (filters && filters.parentNode) filters.parentNode.insertBefore(panel, filters.nextSibling);
        else card.appendChild(panel);

        var topicInput = panel.querySelector('#flMicroTopic');
        var listEl = panel.querySelector('#flMicroList');

        function generate() {
            var topic = topicInput.value.trim();
            if (!topic) {
                var todoInput = document.getElementById('todoInput');
                topic = todoInput ? todoInput.value.trim() : '';
            }
            if (!topic) { flToast('Digite um tema (ou escreva na caixa de metas) para gerar micro-metas!', true); return; }
            var steps = [
                '🎯 Estudar "' + topic + '" por 15 minutos sem interrupção',
                '📝 Fazer um resumo de 5 linhas sobre ' + topic,
                '❓ Resolver 3 questões de ' + topic,
                '🗣️ Explicar ' + topic + ' em voz alta sem consultar'
            ];
            if (Array.isArray(todos)) {
                steps.forEach(function(s) { todos.push({ text: s, completed: false, priority: 'media' }); });
                if (typeof renderTodos === 'function') renderTodos();
            }
            listEl.innerHTML = steps.map(function(s) {
                return '<div class="fl-micro-item"><i class="fa-solid fa-circle-check" style="color:var(--success);"></i>' + flEsc(s.replace(/^[^\s]+\s/, '')) + '</div>';
            }).join('');
            topicInput.value = '';
            if (typeof gainXP === 'function') gainXP(3);
            flToast('✨ 4 micro-metas adicionadas à lista! +3 XP');
        }

        panel.querySelector('#flMicroGo').addEventListener('click', generate);
        topicInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') generate(); });
    }


    // ========================================================================
    // 10) FLASHCARDS — Modo Sprint (3 cards) + Exportar Baralho
    // ========================================================================
    function initFlashSprint() {
        var card = document.querySelector('#tab-flashcards .glass-card');
        if (!card || !Array.isArray(flashcardsData) || card.dataset.flSprint) return;
        card.dataset.flSprint = '1';

        var statsBar = card.querySelector('.flashcard-stats-bar');
        var panel = document.createElement('div');
        panel.className = 'fl-panel';
        panel.style.marginBottom = '14px';
        panel.innerHTML = '<div class="fl-row">' +
            '<button type="button" class="fl-btn fl-btn-primary" id="flSprintBtn"><i class="fa-solid fa-bolt"></i> Modo Sprint (3 cards)</button>' +
            '<button type="button" class="fl-btn" id="flDeckExport"><i class="fa-solid fa-download"></i> Exportar Baralho</button>' +
            '<span id="flSprintStatus"></span>' +
        '</div>' +
        '<div class="fl-hint">O Sprint prioriza os cards marcados como difíceis — revisão relâmpago antes de continuar. O backup do baralho é um arquivo .json.</div>';

        if (statsBar && statsBar.parentNode) statsBar.parentNode.insertBefore(panel, statsBar.nextSibling);
        else card.appendChild(panel);

        var statusEl = panel.querySelector('#flSprintStatus');
        var inSprint = false;

        function renderStatus() {
            statusEl.innerHTML = inSprint
                ? '<span class="fl-sprint-chip">⚡ SPRINT <i class="fa-solid fa-xmark" id="flSprintEnd" style="cursor:pointer;"></i></span>'
                : '';
            var endBtn = statusEl.querySelector('#flSprintEnd');
            if (endBtn) endBtn.addEventListener('click', endSprint);
        }

        function startSprint() {
            if (!flashcardsData.length) { flToast('Adicione flashcards antes do Sprint!', true); return; }
            var pool = flashcardsData.slice();
            pool.sort(function(a, b) {
                var rank = function(c) { return c.rating === 'hard' ? 0 : (!c.rating ? 1 : 2); };
                return rank(a) - rank(b);
            });
            var picks = pool.slice(0, Math.min(3, pool.length));
            flashcardsView = picks;
            currentCardIndex = 0;
            cardIsFlipped = false;
            if (typeof updateCardDisplay === 'function') updateCardDisplay();
            inSprint = true;
            renderStatus();
            flToast('⚡ Sprint iniciado: ' + picks.length + ' cards — vai com tudo!');
        }

        function endSprint() {
            flashcardsView = flashcardsData.slice();
            currentCardIndex = 0;
            cardIsFlipped = false;
            if (typeof updateCardDisplay === 'function') updateCardDisplay();
            inSprint = false;
            renderStatus();
            flToast('Sprint encerrado — baralho completo restaurado.');
        }

        panel.querySelector('#flSprintBtn').addEventListener('click', function() {
            if (inSprint) endSprint(); else startSprint();
        });
        panel.querySelector('#flDeckExport').addEventListener('click', function() {
            if (!flashcardsData.length) { flToast('O baralho está vazio!', true); return; }
            flDownload('flashcards-backup-' + flToday() + '.json',
                JSON.stringify({ exportedAt: new Date().toISOString(), cards: flashcardsData }, null, 2),
                'application/json');
            flToast('Backup do baralho exportado!');
        });
    }

    // ========================================================================
    // 11) SONS AMBIENTE — Cenas de Concentração (+ timer opcional)
    // ========================================================================
    function initAmbientScenes() {
        var card = document.querySelector('#tab-ambient .glass-card');
        if (!card || card.dataset.flScenes) return;
        card.dataset.flScenes = '1';

        var scenes = [
            { id: 'biblioteca', icon: '📚', name: 'Biblioteca', desc: 'silêncio + lareira distante', mix: { 'brown-noise': 0.5, fire: 0.22 } },
            { id: 'cafe', icon: '☕', name: 'Café', desc: ' burburinho abafado + chuva', mix: { 'brown-noise': 0.42, rain: 0.3 } },
            { id: 'chuva-noturna', icon: '🌧️', name: 'Chuva Noturna', desc: 'chuva forte + vento', mix: { rain: 0.55, wind: 0.3 } },
            { id: 'bosque', icon: '🌲', name: 'Bosque', desc: 'pássaros + brisa', mix: { birds: 0.45, wind: 0.25 } }
        ];

        var panel = flPanel('Cenas de Concentração', 'novo');
        panel.insertAdjacentHTML('beforeend',
            '<div class="fl-row" style="margin-bottom:10px;">' +
                '<span style="font-size:0.8rem;color:var(--text-muted);">Duração:</span>' +
                '<select id="flSceneDuration" style="padding:6px 10px;font-size:0.8rem;">' +
                    '<option value="0">contínuo</option>' +
                    '<option value="15">15 min</option>' +
                    '<option value="30">30 min</option>' +
                    '<option value="60">60 min</option>' +
                '</select>' +
                '<span class="fl-hint" style="margin:0;">a cena para sozinha se escolher uma duração</span>' +
            '</div>' +
            '<div class="fl-scene-grid" id="flSceneGrid"></div>');

        var presetsRow = card.querySelector('.mt-4, .ambient-mixer');
        var anchorRow = null;
        // inserir depois da linha de presets (botões Parar Tudo / presets)
        Array.prototype.some.call(card.children, function(child) {
            if (child.querySelector && child.querySelector('button[onclick*="presetRelax"]')) { anchorRow = child; return true; }
            return false;
        });
        if (anchorRow && anchorRow.parentNode) anchorRow.parentNode.insertBefore(panel, anchorRow.nextSibling);
        else card.insertBefore(panel, card.querySelector('.ambient-grid-v2'));

        var grid = panel.querySelector('#flSceneGrid');
        var durSelect = panel.querySelector('#flSceneDuration');

        scenes.forEach(function(scene) {
            var el = document.createElement('div');
            el.className = 'fl-scene';
            el.innerHTML = '<span class="fl-scene-icon">' + scene.icon + '</span>' +
                '<span class="fl-scene-name">' + scene.name + '</span>' +
                '<span class="fl-scene-desc">' + scene.desc + '</span>';
            el.addEventListener('click', function() {
                if (typeof stopAllAmbient !== 'function' || !ambientAudios) { flToast('Cenas indisponíveis agora.', true); return; }
                stopAllAmbient();
                setTimeout(function() {
                    Object.keys(scene.mix).forEach(function(id) {
                        if (ambientAudios[id]) {
                            ambientVolumes[id] = scene.mix[id];
                            ambientAudios[id].volume = scene.mix[id] * masterVol;
                            ambientAudios[id].play().catch(function() {});
                        }
                    });
                    if (typeof renderAmbientGrid === 'function') renderAmbientGrid();
                    if (typeof renderAmbientMixer === 'function') renderAmbientMixer();
                    var mins = parseInt(durSelect.value, 10);
                    if (mins > 0 && typeof setAmbientSleepTimer === 'function') setAmbientSleepTimer(mins);
                    flToast(scene.icon + ' Cena "' + scene.name + '" ativada!');
                }, 250);
            });
            grid.appendChild(el);
        });
    }

    // ========================================================================
    // 12) CALCULADORA — Conversor Rápido de Tempo
    // ========================================================================
    function initTimeConverter() {
        var card = document.querySelector('#tab-calculator .glass-card');
        if (!card || card.dataset.flConv) return;
        card.dataset.flConv = '1';

        var panel = flPanel('Conversor de Tempo', 'novo');
        panel.insertAdjacentHTML('beforeend',
            '<div class="fl-row">' +
                '<input type="number" class="fl-input" id="flConvInput" placeholder="valor…" min="0" step="any" style="max-width:130px;flex:0 1 130px;">' +
                '<button type="button" class="fl-btn fl-btn-primary" id="flConvMin"><i class="fa-solid fa-arrow-right"></i> min → h</button>' +
                '<button type="button" class="fl-btn" id="flConvH"><i class="fa-solid fa-arrow-left"></i> h → min</button>' +
                '<button type="button" class="fl-btn" id="flConvCalc" title="Usar o valor atual da calculadora"><i class="fa-solid fa-calculator"></i></button>' +
                '<span class="fl-conv-result" id="flConvResult">—</span>' +
            '</div>' +
            '<div class="fl-hint">Converta sessões de estudo: quantos minutos valem em horas, ou o contrário.</div>');

        card.appendChild(panel);

        var input = panel.querySelector('#flConvInput');
        var result = panel.querySelector('#flConvResult');

        function fmt(v) {
            return (Math.round(v * 100) / 100).toLocaleString('pt-BR');
        }
        panel.querySelector('#flConvMin').addEventListener('click', function() {
            var v = parseFloat(input.value);
            if (isNaN(v) || v < 0) { flToast('Digite um valor em minutos!', true); return; }
            var h = Math.floor(v / 60), m = Math.round(v % 60);
            result.textContent = h > 0 ? (h + 'h ' + (m < 10 ? '0' : '') + m + 'min') : (m + 'min');
        });
        panel.querySelector('#flConvH').addEventListener('click', function() {
            var v = parseFloat(input.value);
            if (isNaN(v) || v < 0) { flToast('Digite um valor em horas!', true); return; }
            result.textContent = fmt(v * 60) + ' min';
        });
        panel.querySelector('#flConvCalc').addEventListener('click', function() {
            var raw = (calcState && calcState.val !== undefined) ? String(calcState.val) : '0';
            var v = parseFloat(raw.replace(',', '.'));
            if (!isNaN(v)) { input.value = v; flToast('Valor da calculadora carregado: ' + v); }
        });
    }

    // ========================================================================
    // 13) CARACTERES — Montador de Snippet
    // ========================================================================
    function initSnippetBuilder() {
        var card = document.querySelector('#tab-chars .chars-container');
        if (!card || card.dataset.flSnippet) return;
        card.dataset.flSnippet = '1';

        var bar = document.createElement('div');
        bar.className = 'fl-snippet-bar';
        bar.innerHTML =
            '<i class="fa-solid fa-puzzle-piece" style="color:var(--accent);"></i>' +
            '<span class="fl-snippet-seq fl-empty" id="flSnippetSeq">monte sua sequência: clique com o botão direito nos símbolos</span>' +
            '<button type="button" class="fl-btn fl-btn-primary" id="flSnippetCopy"><i class="fa-solid fa-copy"></i> Copiar</button>' +
            '<button type="button" class="fl-btn" id="flSnippetBack"><i class="fa-solid fa-delete-left"></i></button>' +
            '<button type="button" class="fl-btn fl-btn-danger" id="flSnippetClear"><i class="fa-solid fa-eraser"></i></button>';

        var container = card.querySelector('#charsCategoriesContainer');
        if (container && container.parentNode) container.parentNode.insertBefore(bar, container);
        else card.appendChild(bar);

        var seqEl = bar.querySelector('#flSnippetSeq');

        function getSeq() { return flLS('fl_snippet', ''); }
        function render() {
            var seq = getSeq();
            if (seq) {
                seqEl.textContent = seq;
                seqEl.classList.remove('fl-empty');
            } else {
                seqEl.textContent = 'monte sua sequência: clique com o botão direito nos símbolos';
                seqEl.classList.add('fl-empty');
            }
        }
        function add(char) {
            var seq = getSeq();
            if (seq.length > 200) { flToast('Sequência muito longa!', true); return; }
            flSave('fl_snippet', seq + char);
            render();
        }

        // clique-direito em qualquer símbolo adiciona ao montador
        card.addEventListener('contextmenu', function(ev) {
            var btn = ev.target.closest ? ev.target.closest('.char-btn-enhanced, .char-fav-btn') : null;
            if (!btn) return;
            var ch = btn.getAttribute('data-char') || btn.textContent.trim().slice(0, 1);
            if (!ch) return;
            ev.preventDefault();
            ev.stopPropagation();
            add(ch);
        });

        bar.querySelector('#flSnippetCopy').addEventListener('click', function() {
            var seq = getSeq();
            if (!seq) { flToast('A sequência está vazia — clique com o botão direito nos símbolos para adicionar!', true); return; }
            flCopy(seq, 'Snippet copiado: ' + seq);
        });
        bar.querySelector('#flSnippetBack').addEventListener('click', function() {
            var seq = getSeq();
            if (!seq) return;
            // remove o último "caractere" (por código, para lidar com símbolos compostos)
            var chars = Array.from(seq);
            chars.pop();
            flSave('fl_snippet', chars.join(''));
            render();
        });
        bar.querySelector('#flSnippetClear').addEventListener('click', function() {
            flSave('fl_snippet', '');
            render();
            flToast('Sequência limpa.');
        });
        render();
    }

    // ========================================================================
    // 14) TÍTULO DA PÁGINA — Presets de Identidade
    // ========================================================================
    function initIdentityPresets() {
        var card = document.querySelector('#tab-title .glass-card');
        if (!card || card.dataset.flPresets) return;
        card.dataset.flPresets = '1';

        var presets = [
            { icon: '🎯', fa: 'fa-bullseye', name: 'Foco Total', font: 'Poppins' },
            { icon: '🧘', fa: 'fa-spa', name: 'Modo Zen', font: 'Quicksand' },
            { icon: '🚀', fa: 'fa-rocket', name: 'Geekie Mode', font: 'Space Grotesk' },
            { icon: '🌙', fa: 'fa-moon', name: 'Estudo Noturno', font: 'Rajdhani' },
            { icon: '🔥', fa: 'fa-fire', name: 'Modo ENEM', font: 'Orbitron' },
            { icon: '✨', fa: 'fa-star', name: 'Hub Clássico', font: 'Poppins' }
        ];

        var panel = flPanel('Presets de Identidade', '1 toque');
        panel.insertAdjacentHTML('beforeend', '<div class="fl-preset-grid" id="flPresetGrid"></div>' +
            '<div class="fl-hint">Aplica nome + ícone + fonte instantaneamente no título e no favicon da aba.</div>');

        var previewBox = card.querySelector('.title-preview-box');
        if (previewBox && previewBox.parentNode) previewBox.parentNode.insertBefore(panel, previewBox.nextSibling);
        else card.appendChild(panel);

        var grid = panel.querySelector('#flPresetGrid');
        presets.forEach(function(p) {
            var chip = document.createElement('span');
            chip.className = 'fl-chip';
            chip.innerHTML = p.icon + ' ' + p.name;
            chip.addEventListener('click', function() {
                var titleInput = document.getElementById('pageTitleInput');
                if (titleInput) titleInput.value = 'Geekie Study Hub — ' + p.name;
                try {
                    selectedIcon = p.fa;
                    selectedFont = p.font;
                    if (typeof updateTitlePreview === 'function') updateTitlePreview();
                    if (typeof buildTitleUI === 'function') buildTitleUI();
                    if (typeof applyPageTitle === 'function') applyPageTitle();
                } catch (e) {}
                flToast(p.icon + ' Identidade "' + p.name + '" aplicada!');
            });
            grid.appendChild(chip);
        });
    }

    // ========================================================================
    // 15) EVENTOS — Check-in do Desafio Diário
    // ========================================================================
    function initEventCheckin() {
        var card = document.querySelector('#tab-events .glass-card');
        if (!card || card.dataset.flCheckin) return;
        card.dataset.flCheckin = '1';

        var panel = flPanel('Check-in do Desafio Diário', 'streak');
        panel.insertAdjacentHTML('beforeend', '<div id="flCheckinBody"></div>');

        var container = card.querySelector('#eventContainer');
        if (container && container.parentNode) container.parentNode.insertBefore(panel, container.nextSibling);
        else card.appendChild(panel);

        var body = panel.querySelector('#flCheckinBody');

        function data() { return flLS('geekie_event_checkins', { dates: [] }); }
        function streak(dates) {
            if (!dates.length) return 0;
            var set = {};
            dates.forEach(function(d) { set[d] = true; });
            var streakN = 0;
            var d = new Date();
            // hoje conta se já fez check-in; senão começa de ontem
            var key = d.toISOString().slice(0, 10);
            if (!set[key]) d.setDate(d.getDate() - 1);
            while (set[d.toISOString().slice(0, 10)]) {
                streakN++;
                d.setDate(d.getDate() - 1);
            }
            return streakN;
        }

        function render() {
            var st = data();
            var today = flToday();
            var done = st.dates.indexOf(today) >= 0;
            var last5 = st.dates.slice(0, 5);
            body.innerHTML =
                '<div class="fl-row" style="justify-content:space-between;">' +
                    '<button type="button" class="fl-btn fl-btn-primary" id="flCheckinBtn" ' + (done ? 'disabled style="opacity:.55;cursor:default;"' : '') + '>' +
                        (done ? '<i class="fa-solid fa-check-double"></i> Check-in feito hoje' : '<i class="fa-solid fa-calendar-check"></i> Fazer Check-in Hoje') +
                    '</button>' +
                    '<span class="fl-chip" style="cursor:default;">🔥 sequência: <strong style="margin-left:4px;">' + streak(st.dates) + '</strong></span>' +
                '</div>' +
                (last5.length
                    ? '<div class="fl-hint">últimos check-ins: ' + last5.map(function(d) { return d.split('-').reverse().join('/'); }).join(' · ') + '</div>'
                    : '<div class="fl-hint">participe do desafio do mês todos os dias para a sequência crescer.</div>');
            var btn = body.querySelector('#flCheckinBtn');
            if (btn && !done) {
                btn.addEventListener('click', function() {
                    var s = data();
                    if (s.dates.indexOf(flToday()) >= 0) return;
                    s.dates.unshift(flToday());
                    flSave('geekie_event_checkins', s);
                    if (typeof earnCoins === 'function') earnCoins(10, 'Check-in do evento');
                    if (typeof gainXP === 'function') gainXP(5);
                    flToast('📅 Check-in registrado! +10 moedas e +5 XP');
                    render();
                });
            }
        }
        render();
    }

    // ========================================================================
    // 16) CÓDIGOS — Gerador de Código Local
    // ========================================================================
    function initCodeGenerator() {
        var card = document.querySelector('#tab-codes .glass-card');
        if (!card || card.dataset.flCodeGen) return;
        card.dataset.flCodeGen = '1';

        var panel = flPanel('Gerador de Código Local', 'compartilhável');
        panel.insertAdjacentHTML('beforeend',
            '<div class="fl-row">' +
                '<button type="button" class="fl-btn fl-btn-primary" id="flCodeGenBtn"><i class="fa-solid fa-gift"></i> Gerar Meu Código (+50 🪙)</button>' +
            '</div>' +
            '<div id="flCodeGenResult" style="margin-top:10px;"></div>' +
            '<div class="fl-hint">O código gerado vale +50 moedas e pode ser resgatado uma única vez (por exemplo, em outra sessão).</div>');

        var secretBox = card.querySelector('kbd');
        var anchor = secretBox ? secretBox.closest('div[style]') : null;
        if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(panel, anchor.nextSibling);
        else card.appendChild(panel);

        var result = panel.querySelector('#flCodeGenResult');

        function randomCode() {
            var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            function block(n) {
                var s = '';
                for (var i = 0; i < n; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
                return s;
            }
            return 'GK-' + block(4) + '-' + block(4);
        }

        panel.querySelector('#flCodeGenBtn').addEventListener('click', function() {
            var list = flLS('fl_custom_codes', []);
            var code = randomCode();
            list.push({ code: code, reward: 50, redeemed: false, at: new Date().toISOString() });
            if (list.length > 20) list = list.slice(-20);
            flSave('fl_custom_codes', list);
            result.innerHTML = '<div class="fl-gen-code" id="flGenCodeBox">' + code + '</div>' +
                '<div class="fl-row" style="margin-top:8px;">' +
                    '<button type="button" class="fl-btn" id="flGenCopy"><i class="fa-solid fa-copy"></i> Copiar código</button>' +
                    '<span class="fl-hint" style="margin:0;">digite-o no campo de resgate para ativar</span>' +
                '</div>';
            result.querySelector('#flGenCopy').addEventListener('click', function() {
                flCopy(code, 'Código ' + code + ' copiado!');
            });
            flToast('🎁 Código local gerado: ' + code);
        });

        // permite resgatar códigos locais no campo oficial
        if (typeof window.redeemCode === 'function' && !window.redeemCode.__flWrapped) {
            var origRedeem = window.redeemCode;
            var wrappedRedeem = function() {
                var input = document.getElementById('codeInput');
                var val = input ? input.value.trim().toUpperCase() : '';
                if (val) {
                    var list = flLS('fl_custom_codes', []);
                    var found = null;
                    list.forEach(function(c) { if (c.code === val) found = c; });
                    if (found && !found.redeemed) {
                        found.redeemed = true;
                        flSave('fl_custom_codes', list);
                        if (input) input.value = '';
                        if (typeof earnCoins === 'function') earnCoins(found.reward, 'Código local');
                        flToast('🎁 Código local ' + found.code + ' resgatado! +' + found.reward + ' moedas');
                        return;
                    }
                }
                return origRedeem.apply(this, arguments);
            };
            wrappedRedeem.__flWrapped = true;
            window.redeemCode = wrappedRedeem;
        }
    }

    // ========================================================================
    // 17) JORNADA — Radar do Próximo Checkpoint
    // ========================================================================
    function initCheckpointRadar() {
        var header = document.querySelector('#tab-journey .journey-header');
        if (!header || !Array.isArray(journeyNodes) || header.dataset.flRadar) return;
        header.dataset.flRadar = '1';

        var panel = document.createElement('div');
        panel.className = 'fl-radar';
        panel.id = 'flJourneyRadar';
        header.appendChild(panel);

        function render() {
            var xpNow = parseInt(localStorage.getItem('geekieXP') || '0', 10);
            var sorted = journeyNodes.slice().sort(function(a, b) { return a.xpReq - b.xpReq; });
            var next = null;
            for (var i = 0; i < sorted.length; i++) {
                if (sorted[i].xpReq > xpNow) { next = sorted[i]; break; }
            }
            if (!next) {
                panel.innerHTML = '<div class="fl-radar-icon">🏆</div><div><strong style="color:var(--gold);">Jornada completa!</strong>' +
                    '<div style="font-size:0.75rem;color:var(--text-muted);">Todos os marcos foram alcançados. Você é uma lenda. 👑</div></div>';
                return;
            }
            var prevXp = 0;
            for (var j = 0; j < sorted.length; j++) { if (sorted[j].xpReq <= xpNow) prevXp = Math.max(prevXp, sorted[j].xpReq); }
            var pct = Math.max(2, Math.min(100, Math.round(((xpNow - prevXp) / (next.xpReq - prevXp || 1)) * 100)));
            var rewards = (next.rewards || []).map(function(r) { return r.label; }).join(' · ');
            panel.innerHTML =
                '<div class="fl-radar-icon">' + next.icon + '</div>' +
                '<div style="flex:1;min-width:0;">' +
                    '<div style="font-size:0.9rem;font-weight:700;color:#d8ccff;">' + flEsc(next.title) +
                        ' <span style="font-size:0.7rem;color:var(--gold);font-weight:600;">faltam ' + (next.xpReq - xpNow) + ' XP</span></div>' +
                    '<div class="fl-meter" style="margin:7px 0 5px 0;"><div class="fl-meter-fill" style="width:' + pct + '%;"></div></div>' +
                    '<div style="font-size:0.7rem;color:var(--text-muted);">' + (rewards ? 'recompensas: ' + flEsc(rewards) : flEsc(next.desc)) + '</div>' +
                '</div>';
        }
        render();
        flOnRefresh('tab-journey', render);
    }

    // ========================================================================
    // 18) DEV LOG — Release Radar (filtro rápido por categoria)
    // ========================================================================
    function initReleaseRadar() {
        var card = document.querySelector('#tab-devlog .glass-card');
        if (!card || card.dataset.flRadarChips) return;
        card.dataset.flRadarChips = '1';

        var radarFilters = [
            { id: 'all', label: '🌐 Tudo', match: null },
            { id: 'visual', label: '🎨 Visual', match: /(visual|ui|css|tema|paleta|identidade|design|interface|anima|glass|rework)/i },
            { id: 'ia', label: '🤖 IA', match: /(ia|chat|tutor|webllm|modelo|multimodal|geekie intelligence)/i },
            { id: 'tools', label: '🧰 Ferramentas', match: /(nota|planner|flashcard|calculadora|pomodoro|timer|quiz|senha|diário|caracteres|planner|son|cronômetro|metas|estat)/i },
            { id: 'game', label: '🎮 Gamificação', match: /(xp|moeda|pet|título|jornada|loja|código|evento|conquista|clicker|trilha|moeda|streak)/i },
            { id: 'fixes', label: '🔧 Correções', match: /(corre|fix|bug|resolver|estabilidade)/i }
        ];
        var activeFilter = 'all';

        var chipsWrap = document.createElement('div');
        chipsWrap.className = 'fl-radar-chips';
        radarFilters.forEach(function(f) {
            var chip = document.createElement('span');
            chip.className = 'fl-chip' + (f.id === 'all' ? ' active' : '');
            chip.textContent = f.label;
            chip.dataset.flFilter = f.id;
            chip.addEventListener('click', function() {
                activeFilter = f.id;
                chipsWrap.querySelectorAll('.fl-chip').forEach(function(c) { c.classList.toggle('active', c.dataset.flFilter === f.id); });
                apply();
            });
            chipsWrap.appendChild(chip);
        });

        var searchWrap = card.querySelector('#devlogSearch') ? card.querySelector('#devlogSearch').parentNode : null;
        if (searchWrap && searchWrap.parentNode) searchWrap.parentNode.insertBefore(chipsWrap, searchWrap);
        else card.appendChild(chipsWrap);

        function apply() {
            var timeline = document.getElementById('devlogTimeline');
            if (!timeline) return;
            var filterDef = radarFilters.find(function(f) { return f.id === activeFilter; });
            var search = (document.getElementById('devlogSearch') || {}).value || '';
            var q = search.toLowerCase().trim();
            timeline.querySelectorAll('.timeline-item').forEach(function(item) {
                var text = (item.textContent || '').toLowerCase();
                var chipOk = !filterDef.match || filterDef.match.test(text);
                var searchOk = !q || text.indexOf(q) >= 0 || ((item.getAttribute('data-version') || '').toLowerCase().indexOf(q) >= 0);
                item.style.display = (chipOk && searchOk) ? '' : 'none';
            });
            var noResults = document.getElementById('devlogNoResults');
            if (noResults) {
                var anyVisible = Array.prototype.some.call(timeline.querySelectorAll('.timeline-item'), function(i) { return i.style.display !== 'none'; });
                noResults.style.display = anyVisible ? 'none' : 'block';
            }
        }

        var searchInput = document.getElementById('devlogSearch');
        if (searchInput) searchInput.addEventListener('input', function() { setTimeout(apply, 10); });
    }


    // ========================================================================
    // 19) PLANNER — Foco da Semana
    // ========================================================================
    function initWeekFocus() {
        var card = document.querySelector('#tab-planner .glass-card');
        if (!card || card.dataset.flWeekFocus) return;
        card.dataset.flWeekFocus = '1';

        var panel = document.createElement('div');
        panel.className = 'fl-panel';
        panel.innerHTML = '<div class="fl-title"><i class="fa-solid fa-star"></i>Foco da Semana <span class="fl-badge">destaque</span></div>' +
            '<div id="flWeekFocusBody"></div>';

        var grid = card.querySelector('#plannerGrid');
        if (grid && grid.parentNode) grid.parentNode.insertBefore(panel, grid);
        else card.appendChild(panel);

        var body = panel.querySelector('#flWeekFocusBody');

        function weekTasks() {
            var out = [];
            try {
                if (typeof getPlannerWeekDates !== 'function') return out;
                var days = getPlannerWeekDates(plannerWeekOffset || 0);
                days.forEach(function(date) {
                    var key = date.toISOString().slice(0, 10);
                    var tasks = plannerData[key] || [];
                    tasks.forEach(function(t, idx) {
                        if (!t.done) out.push({ dateKey: key, idx: idx, text: t.text });
                    });
                });
            } catch (e) {}
            return out;
        }

        function render() {
            var focus = flLS('fl_week_focus', null);
            var tasks = weekTasks();
            var current = null;
            if (focus) {
                current = tasks.find(function(t) { return t.dateKey === focus.dateKey && t.text === focus.text; }) || null;
                if (!current) { flSave('fl_week_focus', null); focus = null; }
            }
            if (current) {
                body.innerHTML =
                    '<div class="fl-week-focus">' +
                        '<span class="fl-focus-star"><i class="fa-solid fa-star"></i></span>' +
                        '<div style="flex:1;min-width:0;">' +
                            '<div style="font-size:0.68rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.08em;">a tarefa mais importante da semana</div>' +
                            '<div style="font-size:0.95rem;font-weight:700;color:#d8ccff;margin-top:2px;">' + flEsc(current.text) + '</div>' +
                            '<div style="font-size:0.7rem;color:var(--text-muted);margin-top:2px;">' + current.dateKey.split('-').reverse().join('/') + '</div>' +
                        '</div>' +
                        '<button type="button" class="fl-btn fl-btn-primary" id="flWeekFocusDone"><i class="fa-solid fa-check"></i> Concluir</button>' +
                        '<button type="button" class="fl-btn" id="flWeekFocusChange"><i class="fa-solid fa-shuffle"></i></button>' +
                    '</div>';
                body.querySelector('#flWeekFocusDone').addEventListener('click', function() {
                    try {
                        if (typeof plannerToggleTask === 'function') plannerToggleTask(current.dateKey, current.idx);
                    } catch (e) {}
                    flSave('fl_week_focus', null);
                    flToast('✅ Foco da semana concluído! Que semana produtiva!');
                    render();
                });
                body.querySelector('#flWeekFocusChange').addEventListener('click', renderSelect);
            } else {
                renderSelect();
            }
        }

        function renderSelect() {
            var tasks = weekTasks();
            if (!tasks.length) {
                body.innerHTML = '<div class="fl-empty">Nenhuma tarefa pendente nesta semana — adicione tarefas no planner para destacar a mais importante.</div>';
                return;
            }
            body.innerHTML =
                '<div class="fl-row">' +
                    '<select id="flWeekFocusSelect" style="flex:1;min-width:220px;padding:9px 12px;">' +
                        tasks.map(function(t, i) {
                            return '<option value="' + i + '">' + flEsc(t.text) + ' (' + t.dateKey.split('-').reverse().join('/') + ')</option>';
                        }).join('') +
                    '</select>' +
                    '<button type="button" class="fl-btn fl-btn-primary" id="flWeekFocusSet"><i class="fa-solid fa-star"></i> Destacar como Foco</button>' +
                '</div>';
            body.querySelector('#flWeekFocusSet').addEventListener('click', function() {
                var sel = body.querySelector('#flWeekFocusSelect');
                var t = tasks[parseInt(sel.value, 10)];
                if (!t) return;
                flSave('fl_week_focus', t);
                flToast('⭐ Foco da semana definido!');
                render();
            });
        }

        render();
        flOnRefresh('tab-planner', render);
    }

    // ========================================================================
    // 20) ESTATÍSTICAS — Insight Automático
    // ========================================================================
    function initAutoInsight() {
        var card = document.querySelector('#tab-stats .glass-card');
        if (!card || card.dataset.flInsight) return;
        card.dataset.flInsight = '1';

        var panel = document.createElement('div');
        panel.className = 'fl-panel';
        panel.innerHTML = '<div class="fl-title"><i class="fa-solid fa-lightbulb"></i>Insight Automático <span class="fl-badge">análise</span></div>' +
            '<div id="flInsightBody"></div>';

        var overview = card.querySelector('#statsOverview');
        if (overview && overview.parentNode) overview.parentNode.insertBefore(panel, overview);
        else card.appendChild(panel);

        var body = panel.querySelector('#flInsightBody');

        function render() {
            var week = flLS('geekieStudyWeek', {});
            var today = new Date();
            function key(d) { return d.toISOString().slice(0, 10); }
            var last7 = 0, prev7 = 0, activeDays = 0, best = { label: '', min: 0 };
            var dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
            for (var i = 0; i < 7; i++) {
                var d = new Date(); d.setDate(today.getDate() - i);
                var v = week[key(d)] || 0;
                last7 += v;
                if (v > 0) activeDays++;
                if (v > best.min) { best = { label: dayNames[d.getDay()], min: v }; }
            }
            for (var j = 7; j < 14; j++) {
                var d2 = new Date(); d2.setDate(today.getDate() - j);
                prev7 += week[key(d2)] || 0;
            }
            var streak = parseInt(localStorage.getItem('geekieStreak') || '1', 10);
            var todayMin = Math.floor((parseInt(localStorage.getItem('geekieStudySeconds') || '0', 10)) / 60);
            var trendTxt, trendCls;
            if (prev7 === 0 && last7 === 0) {
                trendTxt = 'Você ainda não registrou sessões de foco nesta semana.';
                trendCls = '';
            } else {
                var delta = last7 - prev7;
                var pct = prev7 > 0 ? Math.round((delta / prev7) * 100) : 100;
                trendTxt = delta >= 0
                    ? 'sua constância subiu <strong>' + Math.abs(pct) + '%</strong> em relação à semana passada'
                    : 'seu tempo caiu <strong>' + Math.abs(pct) + '%</strong> em relação à semana passada';
                trendCls = delta >= 0 ? 'up' : 'down';
            }
            var advice;
            if (last7 === 0) advice = 'Comece com um Pomodoro de 25 minutos hoje — o primeiro passo gera o impulso.';
            else if (activeDays <= 3) advice = 'Você estudou em ' + activeDays + ' dos últimos 7 dias. Tente adicionar mais 1 dia para transformar em hábito.';
            else if (last7 >= 300) advice = 'Ritmo excelente! Proteja esse padrão e use o planner para não sobrecarregar.';
            else advice = 'Boa base! Uma sessão extra de foco por dia quase dobra seu total semanal.';

            body.innerHTML =
                '<div class="fl-insight"><i class="fa-solid fa-chart-line"></i><div>' +
                    'Nos últimos 7 dias: <strong>' + last7 + ' min</strong> de foco em ' + activeDays + ' dias ativos' +
                    (best.min > 0 ? ' — seu melhor dia foi <strong>' + best.label + '</strong> (' + best.min + ' min)' : '') + '.<br>' +
                    (trendTxt ? 'Comparado à semana anterior, ' + trendTxt + '. ' : '') +
                    'Você tem uma sequência de <strong>' + streak + ' dias</strong> 🔥.<br>' +
                    '<em style="color:var(--text-muted);">' + advice + '</em>' +
                '</div></div>';
        }
        render();
        flOnRefresh('tab-stats', render);
    }

    // ========================================================================
    // 21) MATÉRIAS — Detector de Matéria Esquecida
    // ========================================================================
    function initForgottenSubject() {
        var card = document.querySelector('#tab-subjects .glass-card');
        if (!card || card.dataset.flForgotten) return;
        card.dataset.flForgotten = '1';

        var panel = document.createElement('div');
        panel.innerHTML = '<div id="flForgottenBody"></div>';

        var grid = card.querySelector('#subjectGrid');
        if (grid && grid.parentNode) grid.parentNode.insertBefore(panel, grid);
        else card.appendChild(panel);

        var body = panel.querySelector('#flForgottenBody');

        function lastMap() { return flLS('fl_subject_last', {}); }

        function render() {
            if (!Array.isArray(subjectData) || !subjectData.length) {
                body.innerHTML = '<div class="fl-forgotten" style="margin-bottom:14px;"><i class="fa-solid fa-info-circle" style="color:var(--accent);"></i>' +
                    '<div style="flex:1;font-size:0.8rem;color:var(--text-muted);">Adicione matérias para o detector apontar qual está sendo esquecida.</div></div>';
                return;
            }
            var last = lastMap();
            var now = Date.now();
            var best = null; // mais esquecida = maior "idade"
            subjectData.forEach(function(s) {
                var age = last[s.id] ? (now - last[s.id]) / 86400000 : (s.totalSeconds > 0 ? 999 : 1000);
                if (!best || age > best.age) best = { sub: s, age: age };
            });
            if (!best) return;
            var ageTxt = best.age >= 999 ? 'nunca estudada' :
                (best.age >= 1000 ? 'há bastante tempo' :
                'há ' + Math.floor(best.age) + ' dia' + (Math.floor(best.age) === 1 ? '' : 's'));
            body.innerHTML =
                '<div class="fl-forgotten" style="margin-bottom:14px;">' +
                    '<span style="font-size:1.4rem;">' + (best.sub.emoji || '📚') + '</span>' +
                    '<div style="flex:1;"><strong style="color:var(--gold);">' + flEsc(best.sub.name) + '</strong> é a matéria mais esquecida <span style="color:var(--text-muted);">(' + ageTxt + ')</span>.<br>' +
                    '<span style="font-size:0.72rem;color:var(--text-muted);">equilibre sua semana iniciando-a agora.</span></div>' +
                    '<button type="button" class="fl-btn fl-btn-primary" id="flForgottenStart"><i class="fa-solid fa-play"></i> Iniciar agora</button>' +
                '</div>';
            body.querySelector('#flForgottenStart').addEventListener('click', function() {
                try {
                    if (typeof startSubject === 'function') startSubject(best.sub.id);
                } catch (e) {}
            });
        }
        render();
        flOnRefresh('tab-subjects', render);

        // registra quando uma matéria é iniciada
        if (typeof window.startSubject === 'function' && !window.startSubject.__flWrapped) {
            var origStart = window.startSubject;
            var wrappedStart = function(id) {
                try {
                    var m = lastMap();
                    m[id] = Date.now();
                    flSave('fl_subject_last', m);
                } catch (e) {}
                return origStart.apply(this, arguments);
            };
            wrappedStart.__flWrapped = true;
            window.startSubject = wrappedStart;
        }
    }

    // ========================================================================
    // 22) QUIZ — Seletor de Dificuldade + Placar Pessoal
    // ========================================================================
    function initQuizDifficulty() {
        var card = document.querySelector('#tab-quiz .glass-card');
        if (!card || card.dataset.flQuizDiff) return;
        card.dataset.flQuizDiff = '1';

        var difficulties = [
            { id: 'facil', label: '🎯 Fácil', mult: 1 },
            { id: 'medio', label: '⚡ Médio', mult: 1.5 },
            { id: 'dificil', label: '🔥 Difícil', mult: 2 }
        ];
        window.flQuizDifficulty = 'facil';

        var setup = card.querySelector('#quizSetup');
        if (!setup) return;

        var panel = document.createElement('div');
        panel.className = 'fl-panel';
        panel.innerHTML = '<div class="fl-title"><i class="fa-solid fa-gauge-high"></i>Dificuldade & Placar <span class="fl-badge">novo</span></div>' +
            '<div class="fl-row" id="flQuizDiffChips">' +
                difficulties.map(function(d) {
                    return '<span class="fl-chip' + (d.id === 'facil' ? ' active' : '') + '" data-diff="' + d.id + '" title="Multiplicador de XP: x' + d.mult + '">' + d.label + ' <small>x' + d.mult + '</small></span>';
                }).join('') +
            '</div>' +
            '<div class="fl-quiz-best" id="flQuizBest" style="margin-top:10px;"></div>' +
            '<div class="fl-hint">Dificuldades maiores multiplicam o XP ganho no resultado (bônus aplicado no fim).</div>';

        var qtyRow = setup.querySelector('.section-label');
        var startBtn = setup.querySelector('button[onclick*="startQuiz"]');
        if (startBtn && startBtn.parentNode) startBtn.parentNode.insertBefore(panel, startBtn);
        else setup.appendChild(panel);

        function bestKey() {
            return (typeof quizState !== 'undefined' && quizState.category ? quizState.category : 'math') + '|' + window.flQuizDifficulty;
        }
        function renderBest() {
            var best = flLS('fl_quiz_best', {});
            var rec = best[bestKey()];
            var el = panel.querySelector('#flQuizBest');
            if (rec) {
                el.innerHTML = '🏆 Melhor pontuação nesta categoria/dificuldade: <strong>' + rec.score + '/' + rec.total + '</strong>' +
                    ' <span style="color:var(--text-muted);font-size:0.7rem;">(' + flEsc(rec.date.split('-').reverse().join('/')) + ')</span>';
            } else {
                el.innerHTML = '🏆 Nenhum recorde nesta categoria ainda — jogue para estabelecer seu placar!';
            }
        }

        panel.querySelectorAll('.fl-chip').forEach(function(chip) {
            chip.addEventListener('click', function() {
                window.flQuizDifficulty = chip.dataset.diff;
                panel.querySelectorAll('.fl-chip').forEach(function(c) { c.classList.toggle('active', c === chip); });
                renderBest();
            });
        });

        // registra recorde + aplica bônus de dificuldade ao fim do quiz
        if (typeof window.showQuizResult === 'function' && !window.showQuizResult.__flWrapped) {
            var origResult = window.showQuizResult;
            var wrappedResult = function() {
                try {
                    var diff = difficulties.find(function(d) { return d.id === (window.flQuizDifficulty || 'facil'); }) || difficulties[0];
                    var total = quizState.questions.length;
                    var score = quizState.score;
                    var key = (quizState.category || 'math') + '|' + diff.id;
                    var best = flLS('fl_quiz_best', {});
                    var prev = best[key];
                    var isRecord = !prev || (score / total) > (prev.score / prev.total) ||
                        (score / total) === (prev.score / prev.total) && score > prev.score;
                    if (score > 0 && isRecord && total > 0) {
                        best[key] = { score: score, total: total, date: flToday() };
                        flSave('fl_quiz_best', best);
                    }
                    var result = origResult.apply(this, arguments);
                    if (diff.mult > 1 && score > 0) {
                        var bonus = Math.round(score * 10 * (diff.mult - 1));
                        if (typeof gainXP === 'function') gainXP(bonus);
                        var rewardEl = document.getElementById('quizResultReward');
                        if (rewardEl) {
                            rewardEl.innerHTML += '<br><i class="fa-solid fa-gauge-high"></i> Bônus de dificuldade (' + diff.label.trim() + '): <strong>+' + bonus + ' XP</strong>!';
                        }
                        flToast('⚡ Bônus de dificuldade: +' + bonus + ' XP');
                    }
                    if (isRecord && score > 0 && total > 0) flToast('🏆 Novo recorde pessoal no Quiz!');
                    renderBest();
                    return result;
                } catch (e) {
                    return origResult.apply(this, arguments);
                }
            };
            wrappedResult.__flWrapped = true;
            window.showQuizResult = wrappedResult;
        }

        renderBest();
        flOnRefresh('tab-quiz', renderBest);
    }

    // ========================================================================
    // 23) SONS DE TECLADO — Sequência de Ambientação
    // ========================================================================
    function initKsSequence() {
        var card = document.querySelector('#tab-keysounds .glass-card');
        if (!card || card.dataset.flKsSeq) return;
        card.dataset.flKsSeq = '1';

        var panel = flPanel('Ambientação Completa', '1 clique');
        panel.insertAdjacentHTML('beforeend',
            '<div class="fl-ks-sequence">' +
                '<button type="button" class="fl-btn fl-btn-primary" id="flKsActivate"><i class="fa-solid fa-headphones"></i> Ativar Tudo</button>' +
                '<span class="fl-chip' + (localStorage.getItem('fl_ks_feedback') === '1' ? ' active' : '') + '" id="flKsToggle"><i class="fa-solid fa-wand-magic-sparkles"></i> feedback visual de clique</span>' +
                '<span class="fl-ks-status' + (localStorage.getItem('fl_ks_feedback') === '1' ? '' : ' off') + '" id="flKsStatus"></span>' +
            '</div>' +
            '<div class="fl-hint">A sequência ativa o som de tecla grátis, o som de clique do mouse e o brilho visual — a experiência completa de digitação.</div>');

        var note = card.querySelector('.ks-test-note');
        if (note && note.parentNode) note.parentNode.insertBefore(panel, note.nextSibling);
        else card.appendChild(panel);

        var statusEl = panel.querySelector('#flKsStatus');
        var toggle = panel.querySelector('#flKsToggle');

        function renderStatus() {
            var feedback = localStorage.getItem('fl_ks_feedback') === '1';
            var sound = localStorage.getItem('geekieKeySound') || 'none';
            statusEl.className = 'fl-ks-status' + (feedback ? '' : ' off');
            statusEl.innerHTML = feedback
                ? '<i class="fa-solid fa-circle-check"></i> ambientação ativa' + (sound !== 'none' ? ' · som: ' + sound : '')
                : '<i class="fa-solid fa-circle-minus"></i> feedback visual desligado';
            toggle.classList.toggle('active', feedback);
        }

        panel.querySelector('#flKsActivate').addEventListener('click', function() {
            try {
                if (typeof ksSelectSound === 'function') ksSelectSound('ks-click');
            } catch (e) {}
            localStorage.setItem('fl_ks_feedback', '1');
            if (typeof renderKeySoundsTab === 'function') renderKeySoundsTab();
            renderStatus();
            flToast('🎧 Ambientação completa ativada — digite algo para sentir!');
        });

        toggle.addEventListener('click', function() {
            var on = localStorage.getItem('fl_ks_feedback') === '1';
            localStorage.setItem('fl_ks_feedback', on ? '0' : '1');
            renderStatus();
            flToast(on ? 'Feedback visual desligado.' : 'Feedback visual ligado!');
        });

        renderStatus();
    }

    // ripple visual global (parte da ambientação)
    document.addEventListener('click', function(ev) {
        if (localStorage.getItem('fl_ks_feedback') !== '1') return;
        try {
            var r = document.createElement('span');
            r.className = 'fl-ripple';
            r.style.left = (ev.clientX - 14) + 'px';
            r.style.top = (ev.clientY - 14) + 'px';
            r.style.width = '28px';
            r.style.height = '28px';
            document.body.appendChild(r);
            setTimeout(function() { r.remove(); }, 650);
        } catch (e) {}
    }, { passive: true });

    // ========================================================================
    // 24) CLICKER — Desafio Relâmpago de 60s
    // ========================================================================
    function initLightningChallenge() {
        var tab = document.getElementById('tab-clicker');
        if (!tab || tab.dataset.flLightning) return;
        tab.dataset.flLightning = '1';

        var main = tab.querySelector('.clicker-main');
        if (!main) return;

        var panel = document.createElement('div');
        panel.className = 'fl-panel';
        panel.innerHTML = '<div class="fl-title"><i class="fa-solid fa-bolt"></i>Desafio Relâmpago <span class="fl-badge">60s</span></div>' +
            '<div class="fl-lightning">' +
                '<button type="button" class="fl-btn fl-btn-primary" id="flLightningBtn"><i class="fa-solid fa-play"></i> Iniciar Desafio</button>' +
                '<span class="fl-lightning-timer" id="flLightningTimer" style="display:none;">60</span>' +
                '<span class="fl-lightning-score" id="flLightningScore"></span>' +
            '</div>' +
            '<div class="fl-hint" id="flLightningHint">60 segundos, quantos cliques você consegue? Cada clique do desafio vale +5 pontos de bônus.</div>';

        var header = main.querySelector('.clicker-header');
        if (header && header.parentNode) header.parentNode.insertBefore(panel, header.nextSibling);
        else main.insertBefore(panel, main.firstChild);

        var btn = panel.querySelector('#flLightningBtn');
        var timerEl = panel.querySelector('#flLightningTimer');
        var scoreEl = panel.querySelector('#flLightningScore');
        var hint = panel.querySelector('#flLightningHint');
        var running = false, clicks = 0, countdown = null;

        function bestScore() { return parseInt(localStorage.getItem('fl_clicker_best') || '0', 10); }
        function renderBest() {
            scoreEl.innerHTML = bestScore() > 0
                ? 'recorde: <strong>' + bestScore() + '</strong> cliques'
                : 'sem recorde ainda';
        }

        function clickCounter() { clicks++; }

        function start() {
            if (running) return;
            running = true;
            clicks = 0;
            var left = 60;
            btn.innerHTML = '<i class="fa-solid fa-stop"></i> Encerrar';
            timerEl.style.display = 'inline-block';
            timerEl.textContent = '60';
            timerEl.classList.remove('urgent');
            hint.textContent = 'CLIQUE NO BOTÃO GRANDE! Cada clique vale +5 pontos de bônus no final.';
            var clickerBtn = document.getElementById('clickerButton');
            if (clickerBtn) clickerBtn.addEventListener('click', clickCounter);
            countdown = setInterval(function() {
                left--;
                timerEl.textContent = left;
                if (left <= 10) timerEl.classList.add('urgent');
                if (left <= 0) finish();
            }, 1000);
            flToast('⚡ Desafio relâmpago iniciado — GO!');
        }

        function finish() {
            if (!running) return;
            running = false;
            clearInterval(countdown);
            var clickerBtn = document.getElementById('clickerButton');
            if (clickerBtn) clickerBtn.removeEventListener('click', clickCounter);
            var bonus = clicks * 5;
            try {
                if (typeof clickerData !== 'undefined' && clickerData) {
                    clickerData.points += bonus;
                    if (typeof saveClickerGame === 'function') saveClickerGame();
                    if (typeof updateClickerDisplay === 'function') updateClickerDisplay();
                }
            } catch (e) {}
            var isRecord = clicks > bestScore();
            if (isRecord) localStorage.setItem('fl_clicker_best', String(clicks));
            btn.innerHTML = '<i class="fa-solid fa-play"></i> Iniciar Desafio';
            timerEl.style.display = 'none';
            timerEl.classList.remove('urgent');
            hint.innerHTML = 'Resultado: <strong style="color:var(--accent);">' + clicks + '</strong> cliques = <strong>+' + bonus + '</strong> pontos de bônus!' +
                (isRecord ? ' 🏆 <strong style="color:var(--gold);">novo recorde!</strong>' : '');
            renderBest();
            flToast('⚡ ' + clicks + ' cliques! +' + bonus + ' pontos' + (isRecord ? ' e um novo recorde!' : '!'));
        }

        btn.addEventListener('click', function() { if (running) finish(); else start(); });
        renderBest();
    }

    // ========================================================================
    // 25) DIÁRIO — Check-in Emocional Rápido + Humor Recente
    // ========================================================================
    function initMoodCheckin() {
        var tab = document.getElementById('tab-diary');
        if (!tab || tab.dataset.flMood) return;
        tab.dataset.flMood = '1';

        var container = tab.querySelector('.diary-container');
        if (!container) return;

        var panel = document.createElement('div');
        panel.className = 'fl-panel';
        panel.innerHTML = '<div class="fl-title"><i class="fa-solid fa-face-smile"></i>Check-in Emocional Rápido <span class="fl-badge">30s</span></div>' +
            '<div class="fl-row" id="flMoodRow">' +
                ['😞', '😟', '😐', '🙂', '😄'].map(function(emo, i) {
                    return '<button type="button" class="fl-mood-btn" data-mood="' + (i + 1) + '" title="humor ' + (i + 1) + '/5">' + emo + '</button>';
                }).join('') +
            '</div>' +
            '<div id="flMoodMeter" style="margin-top:12px;"></div>' +
            '<div class="fl-hint">Sem escrever nada: registre como você está — o humor médio dos últimos 7 dias aparece aqui.</div>';

        var editor = container.querySelector('.diary-editor');
        if (editor && editor.parentNode) editor.parentNode.insertBefore(panel, editor);
        else container.appendChild(panel);

        var row = panel.querySelector('#flMoodRow');
        var meter = panel.querySelector('#flMoodMeter');

        function entries() { return flLS('fl_mood_checkins', []); }

        function renderMeter() {
            var cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - 7);
            var recent = entries().filter(function(e) { return new Date(e.date + 'T12:00:00') >= cutoff; });
            var today = flToday();
            var todayEntry = entries().find(function(e) { return e.date === today; });
            row.querySelectorAll('.fl-mood-btn').forEach(function(b) {
                b.classList.toggle('selected', todayEntry && parseInt(b.dataset.mood, 10) === todayEntry.mood);
            });
            if (!recent.length) {
                meter.innerHTML = '<div class="fl-empty">Nenhum check-in nos últimos 7 dias — como você está hoje?</div>';
                return;
            }
            var avg = recent.reduce(function(s, e) { return s + e.mood; }, 0) / recent.length;
            var pct = Math.round((avg / 5) * 100);
            var color = avg < 2.5 ? 'var(--danger)' : (avg < 3.5 ? 'var(--warning)' : 'var(--success)');
            meter.innerHTML =
                '<div class="fl-row" style="justify-content:space-between;margin-bottom:5px;">' +
                    '<span style="font-size:0.8rem;color:var(--text-muted);">humor médio (7 dias):</span>' +
                    '<span style="font-size:0.85rem;font-weight:700;color:' + color + ';">' + avg.toFixed(1) + ' / 5</span>' +
                '</div>' +
                '<div class="fl-meter"><div class="fl-meter-fill" style="width:' + pct + '%;background:linear-gradient(90deg,' + color + ',' + color + 'CC);"></div></div>' +
                '<div class="fl-hint">' + recent.length + ' check-ins recentes' +
                    (todayEntry ? ' · hoje já registrado ✓' : ' · hoje ainda sem check-in') + '</div>';
        }

        row.querySelectorAll('.fl-mood-btn').forEach(function(b) {
            b.addEventListener('click', function() {
                var mood = parseInt(b.dataset.mood, 10);
                var list = entries();
                var existing = list.find(function(e) { return e.date === flToday(); });
                if (existing) existing.mood = mood;
                else list.unshift({ date: flToday(), mood: mood });
                list = list.slice(0, 60);
                flSave('fl_mood_checkins', list);
                if (typeof gainXP === 'function') gainXP(2);
                flToast('💙 Check-in emocional registrado! +2 XP');
                renderMeter();
            });
        });
        renderMeter();
        flOnRefresh('tab-diary', renderMeter);
    }

    // ========================================================================
    // 26) SENHAS — Checklist de Segurança
    // ========================================================================
    function initPasswordChecklist() {
        var tab = document.getElementById('tab-password');
        if (!tab || tab.dataset.flPwdCheck) return;
        tab.dataset.flPwdCheck = '1';

        var container = tab.querySelector('.pwd-container');
        if (!container) return;

        var panel = document.createElement('div');
        panel.className = 'fl-panel';
        panel.innerHTML = '<div class="fl-title"><i class="fa-solid fa-shield-halved"></i>Checklist de Segurança <span class="fl-badge">auditoria</span></div>' +
            '<div id="flPwdChecks"></div>' +
            '<div class="fl-hint">Avalie a senha gerada antes de copiar — quanto mais itens verdes, mais forte ela é.</div>';

        var display = container.querySelector('.pwd-display');
        if (display && display.parentNode) display.parentNode.insertBefore(panel, display.nextSibling);
        else container.appendChild(panel);

        var listEl = panel.querySelector('#flPwdChecks');
        var checks = [
            { id: 'len', label: 'Pelo menos 16 caracteres', test: function(p) { return p.length >= 16; } },
            { id: 'case', label: 'Maiúsculas e minúsculas misturadas', test: function(p) { return /[a-z]/.test(p) && /[A-Z]/.test(p); } },
            { id: 'num', label: 'Contém números', test: function(p) { return /\d/.test(p); } },
            { id: 'sym', label: 'Contém símbolos (!@#$…)', test: function(p) { return /[^A-Za-z0-9]/.test(p); } },
            { id: 'seq', label: 'Sem sequências óbvias (abc, 123, qwe)', test: function(p) { return !/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789|qwe|asd|zxc)/i.test(p); } },
            { id: 'rep', label: 'Sem repetições longas (aaa, 111)', test: function(p) { return !/(.)\1{2,}/.test(p); } }
        ];

        function render() {
            var pwd = '';
            var out = document.getElementById('pwdOutput');
            if (out) pwd = String(out.textContent || '').trim();
            var valid = pwd && pwd !== 'Clique em Gerar';
            var passed = 0;
            listEl.innerHTML = checks.map(function(c) {
                var ok = valid && c.test(pwd);
                if (ok) passed++;
                return '<div class="fl-check-item' + (ok ? ' passed' : '') + '">' +
                    '<span class="fl-check-icon"><i class="fa-solid ' + (ok ? 'fa-check' : 'fa-xmark') + '"></i></span>' +
                    c.label + '</div>';
            }).join('') +
            '<div class="fl-row" style="margin-top:10px;">' +
                '<span class="fl-chip' + (valid && passed >= 5 ? ' active' : '') + '" style="cursor:default;">' +
                    (valid
                        ? (passed >= 5 ? '🛡️ senha forte (' + passed + '/6)' : '🔒 senha mediana (' + passed + '/6)')
                        : '— nenhuma senha gerada') +
                '</span>' +
                '<span class="fl-hint" style="margin:0;">copie com confiança quando 5+ itens estiverem verdes</span>' +
            '</div>';
        }

        // atualiza sempre que uma senha é gerada
        if (typeof window.generatePassword === 'function' && !window.generatePassword.__flWrapped) {
            var origGen = window.generatePassword;
            var wrappedGen = function() {
                var result = origGen.apply(this, arguments);
                setTimeout(render, 30);
                return result;
            };
            wrappedGen.__flWrapped = true;
            window.generatePassword = wrappedGen;
        }
        render();
        flOnRefresh('tab-password', render);
    }

    // ========================================================================
    // INICIALIZAÇÃO + GANCHO DE ATUALIZAÇÃO POR ABA
    // ========================================================================
    function initAllFeatures() {
        var inits = [
            initCockpit, initChatTools, initSearchQueue, initIdeaMap, initThemeRaffle,
            initTitleGoal, initPetCare, initFocusIntention, initMicroGoals, initFlashSprint,
            initAmbientScenes, initTimeConverter, initSnippetBuilder, initIdentityPresets,
            initEventCheckin, initCodeGenerator, initCheckpointRadar, initReleaseRadar,
            initWeekFocus, initAutoInsight, initForgottenSubject, initQuizDifficulty,
            initKsSequence, initLightningChallenge, initMoodCheckin, initPasswordChecklist
        ];
        inits.forEach(function(fn) {
            try { fn(); } catch (e) {
                // falha silenciosa por recurso — o restante do hub continua funcionando
                if (window.console && console.warn) console.warn('[Feature Lab v18]', fn.name, e);
            }
        });
    }

    function hookTabSwitch() {
        var orig = window.switchTab;
        if (typeof orig !== 'function' || orig.__flRefreshHook) return;
        var wrapped = function(tabId, element) {
            var result = orig.apply(this, arguments);
            if (tabId) setTimeout(function() { flRefreshTab(tabId); }, 60);
            return result;
        };
        wrapped.__flRefreshHook = true;
        window.switchTab = wrapped;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { hookTabSwitch(); initAllFeatures(); });
    } else {
        hookTabSwitch();
        initAllFeatures();
    }
})();
// ===================== FIM v18.0.0 FEATURE LAB =====================


// ============================================================================
// v18.1.0 — MODO MULTI-TAREFA (SPLIT VIEW)
// Portal Geekie em tela grande à esquerda + qualquer outra aba num painel
// lateral recolhível (vira uma tira fina) e redimensionável (arraste a borda).
// Estado persistente: aba escolhida, largura e recolhimento.
// Atalho: Alt+M liga/desliga. Clicar na aba Geekie no menu desliga o modo.
// ============================================================================
(function() {
    'use strict';
    if (window.__flSplitView) return;
    window.__flSplitView = true;

    var LS_KEY = 'fl_split_state';
    var GEEKIE_ID = 'tab-geekie';
    var state = { on: false, guest: null, width: 460, collapsed: false, lastGuest: 'tab-timer' };

    function load() {
        try {
            var v = JSON.parse(localStorage.getItem(LS_KEY));
            if (v && typeof v === 'object') {
                state.on = !!v.on;
                state.guest = (typeof v.guest === 'string' && v.guest !== GEEKIE_ID) ? v.guest : null;
                var w = parseInt(v.width, 10);
                state.width = (w >= 320 && w <= 920) ? w : 460;
                state.collapsed = !!v.collapsed;
                state.lastGuest = (typeof v.lastGuest === 'string' && v.lastGuest !== GEEKIE_ID) ? v.lastGuest : 'tab-timer';
            }
        } catch (e) {}
    }
    function save() {
        try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {}
    }
    function flToast(msg) { if (typeof window.showToast === 'function') window.showToast(msg); }

    var stage = null, panel = null, splitBody = null, tabSelect = null, btnTopbar = null;
    var CATALOG = [];
    var origSwitch = (typeof window.switchTab === 'function') ? window.switchTab : null;

    // ---------- catálogo de abas (do FAB) ----------
    function buildCatalog() {
        CATALOG = [];
        document.querySelectorAll('.fab-nav-item').forEach(function(b) {
            var id = (b.id || '').replace('fab-nav-', '');
            if (!id) return;
            var label = (b.textContent || '').trim().replace(/\s+/g, ' ') || id;
            var ic = b.querySelector('i');
            CATALOG.push({
                tabId: 'tab-' + id,
                label: label,
                icon: ic ? (ic.className || 'fa-solid fa-window-maximize') : 'fa-solid fa-window-maximize'
            });
        });
        if (!CATALOG.length) CATALOG.push({ tabId: 'tab-timer', label: 'Pomodoro', icon: 'fa-solid fa-clock' });
    }
    function infoFor(tabId) {
        for (var i = 0; i < CATALOG.length; i++) if (CATALOG[i].tabId === tabId) return CATALOG[i];
        return null;
    }
    function pickValidGuest(pref) {
        var g = (pref && pref !== GEEKIE_ID && document.getElementById(pref)) ? pref : null;
        if (!g) g = document.getElementById(state.lastGuest || '') && state.lastGuest !== GEEKIE_ID ? state.lastGuest : null;
        if (!g || !document.getElementById(g)) {
            // primeira aba útil disponível que não seja a geekie
            for (var i = 0; i < CATALOG.length; i++) {
                if (CATALOG[i].tabId !== GEEKIE_ID && document.getElementById(CATALOG[i].tabId)) return CATALOG[i].tabId;
            }
        }
        return g;
    }

    // ---------- DOM ----------
    function buildDom() {
        var main = document.querySelector('.main-content');
        if (!main || !document.getElementById(GEEKIE_ID)) return false;
        if (document.getElementById('splitStage')) { stage = document.getElementById('splitStage'); panel = document.getElementById('splitPanel'); splitBody = document.getElementById('splitBody'); tabSelect = document.getElementById('splitTabSelect'); return true; }

        buildCatalog();

        // palco neutro: display:contents mantém o layout original intacto
        stage = document.createElement('div');
        stage.id = 'splitStage';
        var sections = Array.prototype.slice.call(main.children).filter(function(el) {
            return el.classList && el.classList.contains('tab-content');
        });
        if (!sections.length) return false;
        main.insertBefore(stage, sections[0]);
        sections.forEach(function(s) { stage.appendChild(s); });

        panel = document.createElement('aside');
        panel.id = 'splitPanel';
        panel.setAttribute('aria-label', 'Painel multi-tarefa');
        panel.innerHTML =
            '<div class="split-rail" id="splitRail" title="Expandir painel">' +
                '<button type="button" class="split-rail-btn" id="splitExpand" title="Expandir painel"><i class="fa-solid fa-angles-left"></i></button>' +
                '<span class="split-rail-icon" id="splitRailIcon"><i class="fa-solid fa-clock"></i></span>' +
                '<span class="split-rail-label" id="splitRailLabel">multi-tarefa</span>' +
            '</div>' +
            '<div class="split-main">' +
                '<div class="split-header">' +
                    '<button type="button" class="split-hdr-btn" id="splitCollapse" title="Recolher painel (portal maior)"><i class="fa-solid fa-angles-right"></i></button>' +
                    '<span class="split-hdr-title" title="Modo multi-tarefa"><i class="fa-solid fa-table-columns"></i></span>' +
                    '<select class="split-tab-select" id="splitTabSelect" title="Escolher a aba do painel"></select>' +
                    '<button type="button" class="split-hdr-btn split-close" id="splitClose" title="Fechar multi-tarefa"><i class="fa-solid fa-xmark"></i></button>' +
                '</div>' +
                '<div class="split-body" id="splitBody"><div class="split-empty">Escolha uma aba acima para acompanhar o portal. 🚀</div></div>' +
            '</div>' +
            '<div class="split-resizer" id="splitResizer" title="Arraste para redimensionar"></div>';
        stage.appendChild(panel);

        splitBody = panel.querySelector('#splitBody');
        tabSelect = panel.querySelector('#splitTabSelect');

        // opções do seletor (todas menos a geekie, que é a principal)
        CATALOG.forEach(function(c) {
            if (c.tabId === GEEKIE_ID) return;
            var opt = document.createElement('option');
            opt.value = c.tabId;
            opt.textContent = c.label;
            tabSelect.appendChild(opt);
        });

        // eventos
        tabSelect.addEventListener('change', function() {
            if (state.on && this.value && this.value !== GEEKIE_ID) switchTab(this.value, null);
        });
        panel.querySelector('#splitCollapse').addEventListener('click', function() { setCollapsed(true); });
        panel.querySelector('#splitExpand').addEventListener('click', function(e) { e.stopPropagation(); setCollapsed(false); });
        panel.querySelector('#splitRail').addEventListener('click', function() { setCollapsed(false); });
        panel.querySelector('#splitClose').addEventListener('click', function() { toggleSplitMode(); });
        initResizer();
        return true;
    }

    function setCollapsed(c) {
        state.collapsed = !!c;
        if (panel) panel.classList.toggle('is-collapsed', !!c);
        save();
    }

    // ---------- resizer (arrastar borda) ----------
    function initResizer() {
        var rz = panel.querySelector('#splitResizer');
        var dragging = false;
        function clamp(w) {
            var min = 320;
            var max = Math.min(920, Math.max(360, window.innerWidth * 0.72));
            return Math.max(min, Math.min(max, w));
        }
        rz.addEventListener('pointerdown', function(e) {
            if (panel.classList.contains('is-collapsed')) return;
            dragging = true;
            try { rz.setPointerCapture(e.pointerId); } catch (err) {}
            rz.classList.add('is-active');
            e.preventDefault();
        });
        rz.addEventListener('pointermove', function(e) {
            if (!dragging) return;
            panel.style.width = clamp(window.innerWidth - e.clientX - 14) + 'px';
        });
        function stop(e) {
            if (!dragging) return;
            dragging = false;
            rz.classList.remove('is-active');
            var cur = parseFloat(panel.style.width);
            if (cur) state.width = Math.round(clamp(cur));
            panel.style.width = state.width + 'px';
            save();
            try { rz.releasePointerCapture(e.pointerId); } catch (err) {}
        }
        rz.addEventListener('pointerup', stop);
        rz.addEventListener('pointercancel', stop);
    }

    // ---------- captura/devolução da aba convidada ----------
    function returnGuest() {
        if (!state.guest) return;
        var old = document.getElementById(state.guest);
        if (old && old.parentNode === splitBody) {
            stage.appendChild(old);
        }
        if (old) old.classList.remove('active', 'split-guest');
        state.guest = null;
    }

    function captureGuest(tabId) {
        if (!tabId || tabId === GEEKIE_ID) return false;
        var sec = document.getElementById(tabId);
        if (!sec) return false;
        if (state.guest === tabId && sec.parentNode === splitBody) return true; // já é a convidada

        returnGuest();
        var empty = splitBody.querySelector('.split-empty');
        if (empty) empty.remove();

        state.guest = tabId;
        state.lastGuest = tabId;
        sec.classList.remove('active');
        sec.classList.add('split-guest');
        splitBody.appendChild(sec);

        // a geekie é sempre a aba principal visível à esquerda
        var g = document.getElementById(GEEKIE_ID);
        if (g && !g.classList.contains('active')) g.classList.add('active');

        if (tabSelect) tabSelect.value = tabId;
        updateRail(tabId);
        save();
        return true;
    }

    function updateRail(tabId) {
        var info = infoFor(tabId);
        var ic = panel.querySelector('#splitRailIcon i');
        var lbl = panel.querySelector('#splitRailLabel');
        if (info) {
            if (ic) ic.className = info.icon;
            if (lbl) lbl.textContent = info.label;
        }
    }

    // ---------- liga / desliga ----------
    function splitOn(guestTab, silent) {
        if (!buildDom()) return;
        if (state.on) { if (guestTab) captureGuest(guestTab); return; }
        state.on = true;
        document.body.classList.add('split-on');
        panel.style.width = state.width + 'px';
        panel.classList.toggle('is-collapsed', !!state.collapsed);
        if (btnTopbar) btnTopbar.classList.add('is-on');
        var guest = pickValidGuest(guestTab || state.guest);
        if (guest) captureGuest(guest);
        if (!silent) flToast('🪟 Multi-tarefa ativado — portal Geekie + painel lateral!');
    }

    function splitOff(silent) {
        if (!state.on) return;
        returnGuest();
        state.on = false;
        document.body.classList.remove('split-on');
        if (btnTopbar) btnTopbar.classList.remove('is-on');
        save();
        if (!silent) flToast('Multi-tarefa desativado — portal em tela cheia.');
    }

    function toggleSplitMode() {
        if (state.on) {
            splitOff();
            if (origSwitch) {
                try { origSwitch(GEEKIE_ID, null); } catch (e) {}
            } else {
                var el = document.getElementById(GEEKIE_ID);
                if (el) el.classList.add('active');
            }
        } else {
            var activeId = (document.querySelector('.tab-content.active') || {}).id;
            var guest = (activeId && activeId !== GEEKIE_ID) ? activeId : (state.lastGuest || 'tab-timer');
            splitOn(guest);
        }
    }
    window.toggleSplitMode = toggleSplitMode;

    // ---------- wrapper do switchTab ----------
    // Com o modo ativo: clicar em qualquer aba no menu a abre NO PAINEL;
    // clicar na aba Geekie desliga o modo e devolve o portal à tela cheia.
    function installWrap() {
        if (!origSwitch || !window.switchTab) return;
        if (window.switchTab.__flSplitWrap) return;
        var wrapped = function(tabId, element) {
            if (!state.on) return origSwitch.apply(this, arguments);
            if (tabId === GEEKIE_ID) {
                splitOff(true);
                var r = origSwitch.apply(this, arguments);
                flToast('Portal Geekie em tela cheia.');
                return r;
            }
            var res = origSwitch.apply(this, arguments); // ativa a aba + FAB + renders
            captureGuest(tabId); // rouba a aba para o painel; geekie volta a ser a principal
            return res;
        };
        wrapped.__flSplitWrap = true;
        window.switchTab = wrapped;
    }

    // ---------- inicialização ----------
    function init() {
        load();
        if (!buildDom()) return; // palco criado, painel oculto até o modo ser ligado
        btnTopbar = document.getElementById('btnSplitMode');

        // restaura o layout salvo na visita anterior
        if (state.on) {
            var guest = pickValidGuest(state.guest || state.lastGuest);
            state.on = false;
            if (guest && origSwitch) { try { origSwitch(guest, null); } catch (e) {} } // renders da convidada
            splitOn(guest, true);
        }

        installWrap();

        // atalho Alt+M
        document.addEventListener('keydown', function(e) {
            if (e.altKey && !e.ctrlKey && !e.shiftKey && (e.key === 'm' || e.key === 'M')) {
                e.preventDefault();
                toggleSplitMode();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
