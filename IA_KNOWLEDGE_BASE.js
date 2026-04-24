/**
 * 🧠 BASE DE CONHECIMENTO EXPANDIDA - IA TUTOR
 * Sistema inteligente de reconhecimento de disciplinas e geração de respostas
 * v2.0 - Conhecimento Premium
 */

const IA_KNOWLEDGE_SYSTEM = {
    // ========== DISCIPLINAS EXPANDIDAS (15+) ==========
    disciplines: {
        // Ciências Exatas
        'matemática': {
            icon: '🔢',
            color: '#FF6B6B',
            topics: [
                'álgebra', 'geometria', 'cálculo', 'trigonometria', 'estatística',
                'probabilidade', 'matrizes', 'determinantes', 'logaritmos', 'potências',
                'polinômios', 'equações', 'sistemas lineares', 'inequações', 'análise combinatória',
                'progressões', 'funções', 'conjuntos', 'lógica matemática', 'teoria dos números'
            ],
            subtopics: {
                'álgebra': ['expressões algébricas', 'fatoração', 'simplificação', 'equações do 1º grau', 'equações do 2º grau'],
                'geometria': ['triângulos', 'círculos', 'quadriláteros', 'sólidos geométricos', 'trigonometria no triângulo'],
                'cálculo': ['limites', 'derivadas', 'integrais', 'continuidade', 'extremos'],
                'estatística': ['média', 'moda', 'mediana', 'desvio padrão', 'distribuição normal'],
                'probabilidade': ['eventos', 'espaço amostral', 'combinação', 'permutação', 'distribuição']
            },
            description: 'Ciência dos números, formas e padrões',
            difficulty_levels: {
                'fácil': ['Qual é 2+2?', 'O que é um número primo?', 'Defina um triângulo'],
                'médio': ['Calcule a derivada de x²', 'Encontre a média: 2,4,6,8,10', 'Probabilidade de cara em um dado'],
                'difícil': ['Resolva por método de Newton', 'Calcule a integral definida de 0 a π de senx', 'Prove o teorema de Fermat']
            }
        },

        'física': {
            icon: '⚛️',
            color: '#4ECDC4',
            topics: [
                'mecânica', 'termodinâmica', 'eletromagnetismo', 'óptica', 'acústica',
                'relatividade', 'física quântica', 'cinética', 'dinâmica', 'energia',
                'força', 'movimento', 'trabalho', 'potência', 'gravitação',
                'ondas', 'fluidos', 'pressão', 'calor', 'temperatura'
            ],
            subtopics: {
                'mecânica': ['cinemática', 'dinâmica', 'leis de Newton', 'atrito', 'torque'],
                'termodinâmica': ['calor', 'temperatura', 'leis da termodinâmica', 'entropia', 'transformações'],
                'eletromagnetismo': ['campo elétrico', 'cargas', 'corrente', 'resistência', 'magnetismo'],
                'óptica': ['reflexão', 'refração', 'lentes', 'espelhos', 'cores']
            },
            description: 'Estudo das leis e fenômenos naturais',
            difficulty_levels: {
                'fácil': ['O que é velocidade?', 'Qual é a fórmula de energia cinética?', 'Defina força'],
                'médio': ['Calcule a aceleração de um corpo com F=10N e m=2kg', 'Lei da conservação da energia', 'Ondas sonoras'],
                'difícil': ['Relatividade especial vs geral', 'Princípio da incerteza', 'Decaimento radioativo']
            }
        },

        'química': {
            icon: '⚗️',
            color: '#95E1D3',
            topics: [
                'átomos e moléculas', 'tabela periódica', 'ligações químicas', 'reações', 'estequiometria',
                'ácidos e bases', 'oxidação e redução', 'termoquímica', 'cinética química', 'equilíbrio',
                'soluções', 'eletrólitos', 'gases', 'estados da matéria', 'química orgânica',
                'carboidratos', 'proteínas', 'lipídios', 'polímeros', 'compostos aromáticos'
            ],
            subtopics: {
                'ligações': ['covalente', 'iônica', 'metálica', 'intermoleculares'],
                'reações': ['síntese', 'decomposição', 'deslocamento', 'dupla troca'],
                'ácidos e bases': ['pH', 'pOH', 'escala de acidez', 'neutralização'],
                'química orgânica': ['alcanos', 'alquenos', 'alquinos', 'aromáticos', 'grupos funcionais']
            },
            description: 'Estudo da composição e transformação da matéria',
            difficulty_levels: {
                'fácil': ['O que é um átomo?', 'Qual é a carga de um elétron?', 'Defina molécula'],
                'médio': ['Balancie a equação: 2H₂ + O₂ → 2H₂O', 'Calcule o pH de HCl 0,1M', 'Isômeros do propano'],
                'difícil': ['Mecânica quântica do átomo de hidrogênio', 'Cinética de reações de ordem complexa', 'Termodinâmica de reações']
            }
        },

        // Ciências Biológicas
        'biologia': {
            icon: '🧬',
            color: '#6BCB77',
            topics: [
                'citologia', 'genética', 'evolução', 'ecologia', 'fisiologia',
                'botânica', 'zoologia', 'microbiologia', 'bioquímica', 'anatomia',
                'células', 'DNA', 'RNA', 'mutações', 'seleção natural',
                'ecosistemas', 'cadeia alimentar', 'fotossíntese', 'respiração', 'metabolismo',
                'reprodução', 'desenvolvimento', 'homeostase', 'imunologia'
            ],
            subtopics: {
                'genética': ['hereditariedade', 'genes', 'alelos', 'cruzamentos', 'herança'],
                'evolução': ['seleção natural', 'adaptação', 'especiação', 'fósseis'],
                'ecologia': ['biomas', 'populações', 'comunidades', 'sucessão ecológica'],
                'fisiologia': ['sistema nervoso', 'sistema circulatório', 'sistema digestivo', 'sistema respiratório']
            },
            description: 'Ciência da vida e dos seres vivos',
            difficulty_levels: {
                'fácil': ['O que é uma célula?', 'Qual é a função do DNA?', 'Defina fotossíntese'],
                'médio': ['Genótipo vs fenótipo', 'Cadeia trófica de um ecossistema', 'Meiose vs mitose'],
                'difícil': ['Expressão gênica e regulação', 'Evolução molecular', 'Imunologia adaptativa']
            }
        },

        // Linguagem e Literatura
        'português': {
            icon: '📚',
            color: '#FFB703',
            topics: [
                'gramática', 'literatura', 'interpretação', 'ortografia', 'pontuação',
                'sintaxe', 'morfologia', 'estilística', 'poesia', 'prosa',
                'modernismo', 'romantismo', 'realismo', 'trovadorismo', 'barroco',
                'figuras de linguagem', 'vícios de linguagem', 'coesão', 'coerência', 'redação'
            ],
            subtopics: {
                'gramática': ['verbo', 'nome', 'artigo', 'adjetivo', 'advérbio', 'preposição'],
                'literatura': ['prosa', 'poesia', 'drama', 'crônica', 'ensaio'],
                'figuras de linguagem': ['metáfora', 'metonímia', 'personificação', 'hipérbole', 'ironia'],
                'análise textual': ['tema', 'enredo', 'personagens', 'espaço', 'tempo']
            },
            description: 'Linguagem, análise textual e expressão',
            difficulty_levels: {
                'fácil': ['O que é um verbo?', 'Defina poesia', 'Qual é a função da pontuação?'],
                'médio': ['Figura de linguagem: metáfora', 'Análise do Cortiço', 'Coesão textual'],
                'difícil': ['Análise crítica literária', 'Estilística comparativa', 'Semiótica do texto']
            }
        },

        'inglês': {
            icon: '🌐',
            color: '#FF6B9D',
            topics: [
                'gramática', 'vocabulário', 'pronúncia', 'conversação', 'redação',
                'phrasal verbs', 'idioms', 'times', 'conditional', 'modals',
                'listening', 'speaking', 'reading', 'writing', 'fluência',
                'pronunciation patterns', 'accent reduction', 'business english', 'casual conversations'
            ],
            subtopics: {
                'gramática': ['past tense', 'present perfect', 'conditionals', 'modals', 'passive voice'],
                'vocabulary': ['common words', 'phrasal verbs', 'idioms', 'slang', 'technical terms'],
                'conversação': ['greeting', 'small talk', 'formal dialogue', 'informal dialogue']
            },
            description: 'Língua inglesa e comunicação internacional',
            difficulty_levels: {
                'fácil': ['Qual é o past tense?', 'Traduza: "Olá"', 'Pronúncia básica'],
                'médio': ['Present perfect continuous', 'Phrasal verbs comuns', 'Conversação em restaurante'],
                'difícil': ['Conditional perfect', 'Idioms e expressões', 'Business English avançado']
            }
        },

        // Humanas
        'história': {
            icon: '🏛️',
            color: '#8338EC',
            topics: [
                'pré-história', 'antiguidade', 'idade média', 'renascença', 'iluminismo',
                'revoluções', 'império', 'guerras mundiais', 'guerra fria', 'contemporâneo',
                'civilizações antigas', 'colonialismo', 'imperialismo', 'ditaduras', 'democracia',
                'história do brasil', 'história da españa', 'história do mundo'
            ],
            subtopics: {
                'era moderna': ['navegações', 'colonização', 'iluminismo', 'revoluções'],
                'era contemporânea': ['guerras mundiais', 'guerra fria', 'transição democrática'],
                'brasil': ['período colonial', 'império', 'república']
            },
            description: 'Estudo dos eventos e períodos históricos',
            difficulty_levels: {
                'fácil': ['Em que ano foi 1492?', 'Quem foi Napoleão?', 'Quando terminou a II Guerra?'],
                'médio': ['Causas da Revolução Francesa', 'Impacto da Proclamação da República', 'Geopolítica da Guerra Fria'],
                'difícil': ['Análise historiográfica comparativa', 'Interpretação de fontes históricas', 'Periodização histórica']
            }
        },

        'geografia': {
            icon: '🗺️',
            color: '#06A77D',
            topics: [
                'cartografia', 'geologia', 'climatologia', 'biogeografia', 'geografia física',
                'geografia humana', 'população', 'urbanização', 'economia', 'geopolítica',
                'continentes', 'países', 'cidades', 'biomas', 'recursos naturais',
                'sustentabilidade', 'desenvolvimento', 'globalização'
            ],
            subtopics: {
                'geografia física': ['climas', 'biomas', 'relevo', 'hidrografia', 'solos'],
                'geografia humana': ['demografia', 'urbanização', 'economia', 'política'],
                'brasil': ['regiões', 'biomas', 'população', 'economia']
            },
            description: 'Estudo do espaço geográfico e distribuição',
            difficulty_levels: {
                'fácil': ['Qual é a capital da França?', 'Quantos continentes existem?', 'Defina bioma'],
                'médio': ['Fatores de clima regional', 'Impacto da urbanização', 'Geopolítica do petróleo'],
                'difícil': ['Análise geográfica sistêmica', 'Geografia crítica', 'Mudanças climáticas']
            }
        },

        // Disciplinas adicionais
        'filosofia': {
            icon: '🤔',
            color: '#C9ADA7',
            topics: [
                'epistemologia', 'ontologia', 'ética', 'estética', 'lógica',
                'metafísica', 'teoria do conhecimento', 'filosofia política', 'filosofia da mente'
            ],
            subtopics: {
                'epistemologia': ['conhecimento', 'verdade', 'razão', 'evidência'],
                'ética': ['moralidade', 'virtude', 'deveres', 'consequências']
            },
            description: 'Investigação crítica das ideias fundamentais',
            difficulty_levels: {
                'fácil': ['O que é ética?', 'Quem foi Platão?', 'Defina lógica'],
                'médio': ['Argumento de Descartes', 'Utilitarismo vs Deontologia', 'Fenomenologia'],
                'difícil': ['Crítica da razão pura', 'Desconstrução derridiana', 'Ontologia heideggeriana']
            }
        },

        'sociologia': {
            icon: '👥',
            color: '#B8A7A7',
            topics: [
                'sociedade', 'cultura', 'socialização', 'estratificação social', 'mobilidade',
                'instituições', 'família', 'religião', 'educação', 'economia',
                'política', 'desvio', 'controle social', 'mudança social', 'globalização'
            ],
            subtopics: {
                'teoria social': ['funcionalismo', 'conflito', 'interacionismo', 'estruturalismo'],
                'instituições': ['família', 'religião', 'educação', 'economia']
            },
            description: 'Estudo da sociedade e comportamento social',
            difficulty_levels: {
                'fácil': ['O que é cultura?', 'Defina sociedade', 'O que é socialização?'],
                'médio': ['Estratificação social', 'Mudança social', 'Desvio social'],
                'difícil': ['Análise crítica da sociedade', 'Sociologia do conhecimento', 'Globalização']
            }
        },

        'educação física': {
            icon: '🏃',
            color: '#FF006E',
            topics: [
                'fisiologia do exercício', 'biomecânica', 'nutrição', 'esportes', 'saúde',
                'aptidão física', 'qualidade de vida', 'lesões', 'treinamento', 'psicologia do esporte'
            ],
            subtopics: {
                'aptidão': ['força', 'resistência', 'flexibilidade', 'velocidade', 'agilidade'],
                'esportes': ['futebol', 'basquete', 'voleibol', 'atletismo', 'natação']
            },
            description: 'Movimento corporal, saúde e esportes',
            difficulty_levels: {
                'fácil': ['O que é aptidão física?', 'Benefícios do exercício', 'Tipos de esporte'],
                'médio': ['Treinamento de força', 'Nutrição no esporte', 'Prevenção de lesões'],
                'difícil': ['Fisiologia avançada do exercício', 'Psicologia esportiva', 'Biomecânica aplicada']
            }
        },

        'artes': {
            icon: '🎨',
            color: '#FFB703',
            topics: [
                'pintura', 'escultura', 'arquitetura', 'fotografia', 'cinema',
                'música', 'dança', 'teatro', 'artes plásticas', 'design',
                'história da arte', 'movimentos artísticos', 'técnicas', 'expressão'
            ],
            subtopics: {
                'movimentos': ['renascença', 'barroco', 'romantismo', 'impressionismo', 'modernismo'],
                'técnicas': ['desenho', 'pintura', 'escultura', 'fotografia', 'digital']
            },
            description: 'Expressão criativa através das artes',
            difficulty_levels: {
                'fácil': ['O que é arte?', 'Movimentos artísticos básicos', 'Tipos de arte'],
                'médio': ['Análise de obras de arte', 'História do modernismo', 'Técnicas de pintura'],
                'difícil': ['Crítica de arte contemporânea', 'Semiótica visual', 'Estética aplicada']
            }
        }
    },

    // ========== PADRÕES AVANÇADOS DE RESPOSTA ==========
    responsePatterns: {
        chat: [
            'Ótima pergunta! ',
            'Essa é uma questão muito relevante: ',
            'Deixa eu explicar melhor sobre isso: ',
            'Você tem razão em questionar isso, ',
            'Excelente observação! ',
            'Essa é uma visão interessante: ',
            'Vou desenvolver essa ideia: ',
            'Esse é um ponto crucial: '
        ],

        explain: [
            '📖 Vou explicar em detalhes: ',
            '💡 Para entender melhor: ',
            '🎓 A explicação completa é: ',
            '🔍 Analisando profundamente: ',
            '✨ Deixe-me detalhar: ',
            '📝 Estruturando a explicação: ',
            '🧠 Conceitual e prático: '
        ],

        summarize: [
            '📌 Em resumo: ',
            '✅ A síntese do assunto: ',
            '⚡ Os pontos essenciais: ',
            '🎯 Resumindo objetivamente: ',
            '💫 A ideia central é: ',
            '🔖 Principais informações: ',
            '📊 Resumo estruturado: '
        ],

        generate: [
            '❓ Teste seus conhecimentos: ',
            '🎯 Desafio para você: ',
            '🧩 Questão para pensar: ',
            '⚙️ Exercício prático: ',
            '🔬 Problema a resolver: ',
            '💭 Pergunta para reflexão: ',
            '📋 Tarefa de aprendizado: '
        ],

        practice: [
            '🏋️ Vamos praticar: ',
            '⚡ Exercício dinâmico: ',
            '🎮 Desafio interativo: ',
            '📈 Melhore suas habilidades: ',
            '🔄 Prática repetida: '
        ],

        debate: [
            '💬 Argumento apresentado: ',
            '⚖️ Análise comparativa: ',
            '🗣️ Diferentes perspectivas: ',
            '🎭 Visões contrapostas: ',
            '📣 Discussão clara: '
        ]
    },

    // ========== BASE DE QUESTÕES EXPANDIDA ==========
    generatedQuestions: {
        'matemática': [
            'O que é uma função quadrática?',
            'Como resolver uma equação de segundo grau?',
            'Qual é a fórmula de Bhaskara?',
            'O que é trigonometria?',
            'Explique o teorema de Pitágoras',
            'Como calcular a área de um círculo?',
            'O que é logaritmo?',
            'Como funcionam as progressões aritméticas?',
            'O que é probabilidade?',
            'Explique a lei da cosenos'
        ],
        'física': [
            'O que é energia cinética?',
            'Como funciona a lei da gravidade?',
            'O que é aceleração?',
            'Explique as três leis de Newton',
            'O que é trabalho em física?',
            'Como funcionam ondas sonoras?',
            'O que é densidade?',
            'Explique a refração da luz',
            'O que é força resultante?',
            'Como funciona o efeito Doppler?'
        ],
        'química': [
            'O que é um átomo?',
            'Qual é a estrutura da tabela periódica?',
            'Como balancear uma equação química?',
            'O que é uma reação de oxidação-redução?',
            'Explique as ligações químicas',
            'O que é pH?',
            'Como funciona a fotossíntese?',
            'O que é um polímero?',
            'Explique a lei da conservação da massa',
            'O que é um ácido segundo Arrhenius?'
        ],
        'biologia': [
            'O que é fotossíntese?',
            'Explique a mitose e meiose',
            'O que é DNA?',
            'Como funciona a respiração celular?',
            'O que é evolução?',
            'Explique a cadeia alimentar',
            'O que é homeostase?',
            'Como funciona o sistema nervoso?',
            'O que é seleção natural?',
            'Explique a mutação genética'
        ],
        'português': [
            'O que é uma metáfora?',
            'Como identificar o sujeito de uma oração?',
            'Qual é a diferença entre direto e indireto?',
            'O que é uma síncope?',
            'Explique os tipos de vírgula',
            'O que é uma anáfora?',
            'Como identificar ironia em um texto?',
            'O que é polissíndeto?',
            'Explique a figura de linguagem personificação',
            'O que é pleonasmo?'
        ],
        'inglês': [
            'Qual é a diferença entre "been" e "gone"?',
            'Como usar present perfect?',
            'Explique conditional clauses',
            'O que é phrasal verb?',
            'Como usar modal verbs?',
            'Qual é a diferença entre "will" e "going to"?',
            'Como usar relative clauses?',
            'O que é passive voice?',
            'Explique reported speech',
            'Como usar reported questions?'
        ],
        'história': [
            'Quando começou a Idade Média?',
            'Qual foi o impacto da Revolução Francesa?',
            'Quem foi Napoleão Bonaparte?',
            'Quando terminou a Segunda Guerra Mundial?',
            'Qual foi a causa da Primeira Guerra?',
            'O que caracterizou o Renascimento?',
            'Como era a vida na Grécia Antiga?',
            'O que foi o Iluminismo?',
            'Quando o Brasil foi descoberto?',
            'O que foi a Inquisição Espanhola?'
        ],
        'geografia': [
            'Quais são os continentes?',
            'O que é latitude e longitude?',
            'Como funcionam as correntes oceânicas?',
            'O que é um bioma?',
            'Explique a dinâmica das placas tectônicas',
            'Qual é o maior deserto do mundo?',
            'O que causa as estações do ano?',
            'Como funcionam os climas mundiais?',
            'O que é erosão?',
            'Explique a formação de um furacão'
        ],
        geral: [
            'Qual é o maior país do mundo?',
            'Qual é a capital mais alta do mundo?',
            'Quantos oceanos existem?',
            'Qual é o rio mais comprido?',
            'Qual é a montanha mais alta?',
            'Quantos países existem?',
            'Qual é a população mundial?',
            'Qual é o maior animal do mundo?',
            'Quando começou o universo?',
            'Como os cientistas determinam a idade das rochas?'
        ]
    },

    // ========== KEYWORDS PARA DETECÇÃO DE CONTEXTO ==========
    contextKeywords: {
        'matemática': ['número', 'equação', 'cálculo', 'fórmula', 'álgebra', 'geometria', 'função', 'integral', 'derivada', 'gráfico'],
        'física': ['força', 'energia', 'movimento', 'velocidade', 'aceleração', 'trabalho', 'onda', 'partícula', 'campo', 'órbita'],
        'química': ['átomo', 'molécula', 'reação', 'elemento', 'composto', 'ligação', 'pH', 'oxidação', 'redução', 'periódico'],
        'biologia': ['célula', 'gene', 'DNA', 'proteína', 'organismo', 'espécie', 'evolução', 'ecossistema', 'mitose', 'reprodução'],
        'português': ['verbo', 'substantivo', 'texto', 'literatura', 'poesia', 'gramática', 'prosa', 'figura', 'linguagem', 'concordância'],
        'inglês': ['verb', 'adjective', 'translation', 'grammar', 'sentence', 'phrase', 'english', 'pronunciation', 'vocabulary'],
        'história': ['época', 'período', 'guerra', 'revolução', 'imperador', 'rei', 'civilização', 'século', 'eventos', 'fatos'],
        'geografia': ['país', 'continente', 'cidade', 'mapa', 'clima', 'população', 'latitude', 'longitude', 'região', 'bioma'],
        'filosofia': ['ideia', 'conhecimento', 'verdade', 'ética', 'moral', 'existência', 'pensador', 'lógica', 'metafísica'],
        'sociologia': ['sociedade', 'cultura', 'grupo', 'instituição', 'relação', 'classe social', 'identidade', 'norma'],
        'educação física': ['exercício', 'esporte', 'saúde', 'treino', 'aptidão', 'corpo', 'movimento', 'atletismo', 'resistência'],
        'artes': ['arte', 'pintura', 'escultura', 'cores', 'desenho', 'movimento', 'estilo', 'expressão', 'criatividade']
    },

    // ========== SISTEMA DE DIFICULDADE ADAPTATIVO ==========
    difficultyLevels: {
        'básico': {
            wordCount: '20-50',
            examples: '1-2',
            depth: 'superficial',
            formality: 'casual'
        },
        'intermediário': {
            wordCount: '80-150',
            examples: '2-3',
            depth: 'moderada',
            formality: 'formal'
        },
        'avançado': {
            wordCount: '150-300',
            examples: '3-5',
            depth: 'profunda',
            formality: 'muito formal',
            technical: true
        }
    },

    // ========== CITAÇÕES E REFERÊNCIAS ==========
    citations: {
        'matemática': [
            'Carl Friedrich Gauss: "Matemática é a rainha das ciências"',
            'Albert Einstein: "A imaginação é mais importante que o conhecimento"',
            'David Hilbert: "A matemática é a linguagem do universo"'
        ],
        'física': [
            'Richard Feynman: "Não confunda saber o nome de algo com entendê-lo"',
            'Isaac Newton: "Se vi mais longe, foi por estar nos ombros de gigantes"',
            'Niels Bohr: "Se alguém disser que compreende a mecânica quântica, ele não a compreendeu"'
        ],
        'biologia': [
            'Charles Darwin: "Não é o mais forte que sobrevive, mas o mais adaptável"',
            'Carl Sagan: "Somos feitos de matéria estelar"',
            'Jane Goodall: "O que você faz faz a diferença"'
        ]
    },

    // ========== DICAS DE ESTUDO ==========
    studyTips: [
        '💡 Use Pomodoro: 25 minutos estudando, 5 de pausa',
        '🗂️ Organize o conhecimento em mapas mentais',
        '✍️ Faça anotações à mão para melhor retenção',
        '🔄 Revise regularmente (espaçamento de tempo)',
        '🎯 Use exemplos práticos do dia a dia',
        '👥 Estude em grupo para trocar ideias',
        '🎮 Gamifique seu aprendizado com quizzes',
        '📱 Aprenda através de múltiplos formatos (áudio, vídeo, texto)',
        '😴 Durma bem - a consolidação ocorre durante o sono',
        '🏃 Exercício físico melhora a cognição'
    ]
};

// ========== FUNÇÕES AUXILIARES ==========
function detectDiscipline(userMessage) {
    const lower = userMessage.toLowerCase();
    
    for (let discipline in IA_KNOWLEDGE_SYSTEM.contextKeywords) {
        const keywords = IA_KNOWLEDGE_SYSTEM.contextKeywords[discipline];
        const matchCount = keywords.filter(keyword => lower.includes(keyword)).length;
        
        if (matchCount >= 2) {
            return discipline;
        }
        
        if (keywords.some(keyword => lower.startsWith(keyword))) {
            return discipline;
        }
    }
    
    // Busca direta no nome da disciplina
    for (let discipline in IA_KNOWLEDGE_SYSTEM.disciplines) {
        if (lower.includes(discipline)) {
            return discipline;
        }
    }
    
    return null;
}

function getRandomQuestion(discipline) {
    const questions = IA_KNOWLEDGE_SYSTEM.generatedQuestions[discipline] || 
                     IA_KNOWLEDGE_SYSTEM.generatedQuestions.geral;
    return questions[Math.floor(Math.random() * questions.length)];
}

function getStudyTip() {
    const tips = IA_KNOWLEDGE_SYSTEM.studyTips;
    return tips[Math.floor(Math.random() * tips.length)];
}

console.log('%c✨ IA Knowledge System Carregado!', 'color: #00ff88; font-size: 16px; font-weight: bold;');
console.log(`📚 ${Object.keys(IA_KNOWLEDGE_SYSTEM.disciplines).length} disciplinas disponíveis`);
console.log(`💾 ${Object.keys(IA_KNOWLEDGE_SYSTEM.generatedQuestions).reduce((a,b) => a + IA_KNOWLEDGE_SYSTEM.generatedQuestions[b].length, 0)} questões na base`);
