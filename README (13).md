# Geekie Study Hub

Hub de estudos em **3 arquivos** (HTML, CSS e JS), sem build e sem dependências locais — só os ícones e as fontes vêm de CDN.

Versão atual: **v24.0.0**

```
index.html
style.css
script.js
```

## Como abrir

- **Duplo clique** em `index.html` funciona (roda em `file://`).
- **Servidor local** é mais confiável para o navegador carregar CSS/JS com o tipo correto:

```bash
python3 -m http.server 3000
# abra http://localhost:3000
```

Login: crie uma conta local, entre com ela ou clique em **Entrar como convidado**. Nada é enviado para servidor.

---

## O que mudou na v24.0.0

### 1. Central administrativa NEXUS (acesso restrito)

- Uma central **flutuante e centralizada** com as ferramentas internas do hub, aberta por um **código privado + Ctrl+Shift+S**; o atalho não responde antes de o código correto ser digitado.
- O código é conferido por **hash com sal**: o texto puro não é gravado no HTML, no CSS nem no JavaScript, e o desbloqueio vale só para a sessão daquela aba. O código pode ser trocado na seção **Segurança**.
- Ao abrir, o restante do hub recebe **blur**, fica inerte e o foco vai para a central. **Esc**, o botão de fechar e o de bloquear devolvem a navegação normal; **Tab** fica preso aos controles da central.
- A central tem **oito seções** em uma segunda nav bar, **recolhível até 72 px** e só com ícones, com animação própria e estado independente da nav bar principal (`Ctrl+B` continua afetando apenas a nav normal).
- A animação de abertura usa perspectiva, clip-path, varredura vertical e cascata nos itens — inspirada no atalho do Dev Log, mas deliberadamente diferente.
- Seções: **Visão geral**, **Economia**, **Progresso**, **Códigos**, **Backup**, **Segurança**, **Ferramentas** e **Auditoria**.
- **Importante:** um app 100% estático não consegue esconder código de quem tem os arquivos. O hash é uma trava de conveniência e evita o texto puro; não substitui autenticação de servidor. O acesso e o código não são publicados neste README.

### 2. Cinco códigos novos e códigos personalizados

- `NEXUS24`, `ORBITA24`, `SINGULAR24`, `MESTRE24` e `SAKURA24` entram no catálogo, com moedas, XP, escudos, **energia de núcleo** e temas.
- O catálogo passa de 12 para **17 códigos públicos**.
- Cada cartão de recompensa ganhou **copiar código**; o resgate agora aceita energia do clicker.
- A central pode criar **códigos personalizados** com validade, recompensa, tema e escudo. Eles **não aparecem no catálogo público**, só na lista da central, e podem ser removidos.

### 3. Preview flutuante de caracteres

- Passar o mouse (ou focar com Tab) em **qualquer caractere** da aba Caracteres abre um cartão flutuante com glifo grande, nome, categoria, código Unicode e favorito.
- A abertura tem animação de escala/desfoque; ao deslizar para o caractere ao lado, o cartão acompanha o cursor e troca o conteúdo com uma transição suave.
- O cartão fecha ao rolar, clicar, trocar de aba ou abrir a central.
- O `title` nativo dos botões foi removido para não duplicar o tooltip; o nome continua no `aria-label`.

### 4. Ações rápidas em todas as 28 abas

Cada aba recebeu uma barra de **Ações rápidas** no fim da página, com atalhos contextuais. Exemplos: resumo do dia, foco de 5/10/50 min, exportar metas e notas, reiniciar o baralho, copiar sessões/relatórios, limpar o chat, tema/título aleatórios, alimentar todos os pets, copiar o status do núcleo, abrir portais em nova aba e exportar o Dev Log.

| Aba | Ações rápidas |
| --- | --- |
| **Hoje** | Resumo do dia · foco de 5 min |
| **Pomodoro** | Foco de 10 min · foco de 50 min |
| **Metas** | Exportar metas `.md` |
| **Flashcards** | Reiniciar baralho · exportar CSV |
| **Quiz** | Copiar últimos quizzes |
| **Timer matérias** | Copiar sessões |
| **Planner** | Copiar semana `.md` |
| **Estatísticas** | Copiar relatório |
| **Diário** | Copiar últimos 7 registros |
| **Chat IA** | Limpar conversa |
| **Comandos** | Copiar saída |
| **Loja** | Tema aleatório |
| **Títulos** | Título aleatório |
| **Pets** | Alimentar todos |
| **Trilha** | Copiar progresso |
| **Clicker** | Copiar status do núcleo |
| **Recompensas** | Copiar códigos ativos |
| **Notas** | Exportar todas `.md` |
| **Sons ambiente** | Silenciar tudo |
| **Som de teclado** | Estilo aleatório |
| **Calculadora** | Copiar histórico |
| **Caracteres** | Copiar favoritos · preview flutuante ao passar o mouse |
| **Título da página** | Copiar configuração · prévia ao vivo ao digitar |
| **Senhas** | Copiar última senha |
| **Portal Geekie** | Abrir em nova aba · zoom lembrado |
| **Google** | Abrir em nova aba · zoom lembrado |
| **Eventos** | Copiar evento do mês |
| **Dev Log** | Exportar Dev Log `.md` · resumo com copiar/baixar no atalho |

### 5. Outros ganhos de fluxo

- **Pomodoro:** `Espaço` inicia ou pausa o ciclo quando a aba está aberta e o foco não está em um campo.
- **Portais:** o zoom de Geekie e Google passa a ser salvo em `portalZoom` e reaplicado ao voltar para a aba.
- **Título da página:** o texto é pré-visualizado enquanto você digita, antes de aplicar.
- **Dev Log:** a aba recebeu **5 entradas v24.0.0** e o painel de `Ctrl+Shift+D` ganhou **Copiar resumo** e **Exportar .md**.
- **Recompensas:** cartões mostram energia, escudos e temas; o botão de copiar funciona em cada código.
- **Backup:** exportar/importar JSON, copiar estado, limpar domínios específicos e reset total protegido por dupla confirmação.
- **Auditoria:** até 80 ações administrativas ficam registradas com data, ação e detalhe.

---

## O que mudou na v23.0.0

### 1. Foguinho 3.0: baú diário, missões semanais e faixas novas

- **Baú diário** na aba Hoje: uma abertura por dia com **18–130 moedas**, **25–170 XP** e **16% de chance de escudo**. A recompensa cresce com a sequência; o cartão mostra o loot recebido e o botão vira “volta amanhã”.
- **Três missões semanais** sorteadas de um pool de oito (foco, flashcards, quiz, metas, cliques, check-ins e sessões), com progresso ao vivo e **resgate de XP + moedas**. A combinação é determinística pela semana e troca toda segunda-feira.
- **Duas faixas novas de foguinho**: **Fênix** (60 dias, **x1,7**) e **Imortal** (100 dias, **x2**), somadas a x1,1 / x1,2 / x1,35 / x1,5.
- **Contadores semanais** próprios (`weeklyStats`) para alimentar as missões da semana sem misturar com os contadores diários.
- **Níveis Ascendido (7.000 XP) e Lenda Eterna (9.000 XP)**: a cada três níveis, a subida também entrega **1 escudo de sequência**.
- **Comando `bau`** para abrir o baú e **`semana`** para ver as missões semanais.

### 2. Boosts de XP e moedas

- Dois consumíveis na Loja, por 15 minutos:
  - **Poção de foco** — 140 moedas · **x2 XP**.
  - **Ímã de moedas** — 110 moedas · **+50% moedas**.
- Comprar o mesmo boost de novo **estende** o tempo restante em vez de desperdiçar a compra.
- O ganho de XP e moedas passou por um multiplicador central: **foguinho + boost se somam** e o número flutuante mostra o multiplicador aplicado.
- **Pílulas na topbar** exibem os boosts ativos e os minutos restantes; somem sozinhas quando o tempo acaba.
- Comando novo: `boost xp` ou `boost moedas`.

### 3. Clicker 3.0

- **Doze melhorias** no total: GPU dedicada, cluster de estudos, IA local, data center orbital, núcleo quântico e singularidade se juntam às seis antigas.
- **Críticos**: 4% base (+2% por nível de Sorte carregada, +0,5% por prestígio, teto de 50%) multiplicam a energia do clique por **6**, com som e número flutuante próprios.
- **Núcleo dourado**: surge na órbita do núcleo, fica disponível por até 40s e, ao ser coletado, dá **x5 de produção por 20s** e **+15 a +60 moedas**.
- **Talentos de prestígio** (3 × 5 níveis, 1 núcleo por nível):
  - **Punho quântico** — +12% de energia por clique.
  - **Rede neural** — +12% de energia por segundo.
  - **Sorte carregada** — +2% de chance de crítico.
- **Marcos do núcleo**: 1.000, 10.000, 100.000, 1.000.000 e 10.000.000 de energia gerada, com moedas, XP e escudos.
- **Cinco faixas de troca** (50→5, 500→60, 2.500→350, 10.000→1.600 e 50.000→9.000) e **auto-troca sempre na melhor faixa disponível**.
- **Renda offline** de 10 minutos + 5 minutos por prestígio, até **2 horas**.
- O HUD não redesenha com a aba oculta e os números flutuantes ficam limitados a 10 elementos.

### 4. Novas features em todas as abas

| Aba | O que chegou na v23 |
| --- | --- |
| **Hoje** | Baú diário, missões semanais e cartão de resumo do foguinho |
| **Pomodoro** | Pausa longa e ciclos configuráveis, preset **60/10** e prévia de XP da sessão |
| **Metas** | Resumo (abertas, atrasadas, prioridade alta, feitas hoje) e botão para limpar concluídas |
| **Flashcards** | Importação em lote (`Pergunta | Resposta` por linha) e exportação do baralho em CSV |
| **Quiz** | Precisão geral e por matéria nos últimos 20 quizzes; responder com as teclas **1–4** |
| **Timer matérias** | Histórico das últimas sessões com matéria, duração e horário |
| **Planner** | Carga da semana (blocos, matérias, horas) e exportação da semana em `.md` |
| **Estatísticas** | Insights automáticos: média, melhor dia, constância, projeção mensal |
| **Diário** | Dias seguidos escrevendo, humor positivo e distribuição dos últimos 30 dias |
| **Chat IA** | Filtro de mensagens da conversa atual |
| **Comandos** | `bau`, `semana`, `boost` e `critico` (35 comandos no total) |
| **Loja** | Seção de boosts com status ativo e botão de estender |
| **Títulos** | Níveis Ascendido e Lenda Eterna (12 títulos) |
| **Pets** | Nível por XP (alimentar e sessões), +15% de renda por nível e 2 pets novos |
| **Trilha** | 5 marcos e 6 conquistas novas (15 marcos, 19 conquistas) |
| **Clicker** | 6 melhorias, críticos, núcleo dourado, talentos, marcos e mais trocas |
| **Recompensas** | Três códigos v23: `BAU23`, `SEMANA23` e `IMORTAL23` |
| **Notas** | Estatísticas de escrita (notas, palavras, tags e fixadas) |
| **Sons ambiente** | Camada **Café** e preset **Floresta** (6 camadas, 5 presets) |
| **Som de teclado** | Estilos **Thock** e **Clicky** (7 no total) |
| **Calculadora** | Botões **√**, **x²**, **π** e **±** |
| **Caracteres** | Contagem de símbolos visíveis e cópia de todos de uma vez |
| **Título da página** | Fontes **Georgia/Trebuchet** e 6 ícones novos (9 fontes, 22 ícones) |
| **Senhas** | Modo **PIN** (só números) e botão para limpar o histórico da sessão |
| **Portal Geekie** | Controle de **zoom** (−, +, 100%) |
| **Google** | Controle de **zoom** (−, +, 100%) |
| **Eventos** | Contagem para o próximo evento e progresso até o nível 2 |
| **Dev Log** | Sete entradas v23.0.0 documentando tudo |

### 5. Desempenho

- **Um único `AudioContext`** reaproveitado por beeps e sons de teclado — antes cada som criava um contexto novo e podia estourar o limite do navegador.
- **Iframes do Geekie e do Google só carregam quando a aba é aberta**, removendo duas conexões externas do boot.
- **Clicker** não redesenha o HUD com `document.hidden`; talentos e marcos só reconstroem o DOM quando a assinatura muda; floats limitados a 10.
- **Blocos v23 usam assinatura**: pílulas de boost, pulso do Pomodoro, metas, diário, notas e estatísticas só reescrevem o HTML quando algum valor muda.
- **Gravação** continua com debounce de 400 ms, flush ao sair/esconder e gravação periódica a cada 30 s.
- **Topbar coalescida** em `requestAnimationFrame`, buscas com debounce e animações pausadas com `body.tab-hidden`.

### 6. Dev Log e README

- A aba **Dev Log** recebeu **7 entradas v23.0.0** (foguinho, boosts, clicker, features de estudo, ferramentas, desempenho, interface e documentação), com filtro por tipo e busca.
- O painel **`Ctrl+Shift+D`** e o botão **Últimas 3** passam a exibir as novidades da v23.
- Este README foi reescrito com as tabelas de abas, comandos, códigos, atalhos, estado e estrutura atualizadas.

---

## O que mudou na v22.3.0

- **`Ctrl+B`** (Cmd+B no Mac) recolhe e expande a nav bar de qualquer aba, com tooltip, `aria-label` e toasts citando a combinação.
- A nav bar compacta fica em **76 px**, só com ícones, e mantém a aba ativa destacada; a preferência volta em `navCollapsed`.
- **`Ctrl+Shift+D`** abre as três últimas entradas do Dev Log em um painel flutuante com blur.
- Título da página, badges e cartão de novidades acompanham a versão.

## O que mudou na v22.0.0

- **Foguinho** com faixas de multiplicador, check-in progressivo, escudos de sequência e missões diárias.
- **Clicker 2.0** com combo, seis melhorias, compra x1/x10/máx, auto-troca, prestígio e renda offline.
- **Pomodoro** com presets 50/10 e 90/15; metas com busca/ordenação; flashcards reversos; combo no quiz; planner de −12 a +12 semanas; rascunhos no diário; duplicar notas; memória na calculadora; vento e Tempestade; teclado Retrô; temas Aurora e Sakura.
- **Desempenho**: gravação com debounce, topbar em `requestAnimationFrame`, HUD do clicker leve e render só da aba ativa.

---

## As 28 abas

| Aba | O que faz |
| --- | --- |
| **Hoje** | Baú diário, missões do dia e da semana, painel Foguinho, meta de foco, metas, revisões, planner e atalhos |
| **Pomodoro** | Ciclos com presets 25/5, 50/10, 60/10 e 90/15, pausa longa e ciclos configuráveis, matéria, som, prévia de XP e `Espaço` para iniciar/pausar |
| **Metas** | Matéria, prioridade, prazo, busca, ordenação, filtros (incluindo atrasadas), resumo e limpeza de concluídas |
| **Flashcards** | Repetição espaçada (SM-2 simplificado), baralhos, modo reverso, fila embaralhada, importação em lote e CSV |
| **Quiz** | Banco por matéria, explicação por alternativa, modo 20s, combo de acertos, precisão por matéria e revisão de erros |
| **Timer matérias** | Cronômetro com pausa, matérias personalizadas, metas de minutos e histórico de sessões |
| **Planner** | Grade de 7 dias × 6 blocos, navegação de −12 a +12 semanas, cores por matéria, modelo, cópia e exportação `.md` |
| **Estatísticas** | Check-in, sequência, escudos, Foco hoje e Últimos 7 dias ao vivo, heatmap de 12 semanas, insights e CSV |
| **Diário** | Entrada por dia com rascunho automático, humor, busca, resumo de humor e exportação markdown |
| **Chat IA** | Tutor local com modos, matéria, resposta progressiva, ações por mensagem e filtro da conversa |
| **Comandos** | Terminal com 35 comandos, autocomplete, histórico e ajuda |
| **Loja** | Onze temas e dois boosts consumíveis, compra com moedas e preview ao vivo |
| **Títulos** | Doze títulos liberados por XP e equipáveis |
| **Pets** | Sete pets com adoção, energia, alimentação, nível e renda passiva |
| **Trilha** | Doze níveis, quinze marcos resgatáveis e dezenove conquistas |
| **Clicker** | Núcleo 3.0 com doze melhorias, combo, críticos, núcleo dourado, talentos, cinco trocas, marcos, prestígio e renda offline |
| **Recompensas** | **Dezessete** códigos com status, expiração, histórico, cópia por cartão, energia de núcleo e códigos personalizados fora do catálogo público |
| **Notas** | Busca, tags, autosave, fixar, duplicar, contagem de palavras, estatísticas e exportação `.md` |
| **Sons ambiente** | Seis camadas (chuva, ruído, ondas, lareira, vento, café), cinco presets, volume geral e timer |
| **Som de teclado** | Sete estilos, volume e campo de teste |
| **Calculadora** | Teclado completo, memória M+/MR/MC, histórico persistido, √, x², π, ± e cópia |
| **Caracteres** | 400+ símbolos em 14 categorias, busca por código Unicode, favoritos, recentes, **preview flutuante ao passar o mouse/focar** e cópia em massa |
| **Título da página** | Texto com **prévia ao vivo**, nove fontes, 22 ícones e restauração |
| **Senhas** | Senhas, passphrase e PIN, entropia em bits, medidor, histórico e limpeza |
| **Portal Geekie** | Iframe do Geekie One, recarregar, nova aba, tela cheia e **zoom lembrado entre visitas** |
| **Google** | Google embutido, atalhos para Classroom, Drive, Docs e YouTube, e **zoom lembrado** |
| **Eventos** | Evento de cada mês, nível por foco, contagem para o próximo e recompensa em moedas |
| **Dev Log** | Histórico de versões com filtro, busca, botão **Últimas 3** (`Ctrl+Shift+D`), copiar resumo e exportar `.md` |

---

## Gamificação em números

### Faixas de foguinho

| Dias | Faixa | Multiplicador de XP |
| --- | --- | --- |
| 0–2 | Começando | x1 |
| 3–6 | Aquecendo | x1,1 |
| 7–13 | Em chamas | x1,2 |
| 14–29 | Fogueira | x1,35 |
| 30–59 | Inferno | x1,5 |
| 60–99 | Fênix | x1,7 |
| 100+ | Imortal | x2 |

### Níveis

| XP | Título |
| --- | --- |
| 0 | Novato |
| 100 | Estudante |
| 300 | Focado |
| 600 | Disciplinado |
| 1.000 | Estrategista |
| 1.500 | Mestre |
| 2.200 | Lenda |
| 3.000 | Geekie Supremo |
| 4.200 | Lenda Suprema |
| 5.600 | Mítico |
| 7.000 | Ascendido |
| 9.000 | Lenda Eterna |

Cada subida de nível rende **15 + nível × 10 moedas**; a cada três níveis, também **1 escudo**.

### Recompensas diárias

- **Check-in**: +12 a +40 XP e +4 a +14 moedas, com bônus em 7, 14, 30, 60 e 100 dias.
- **Baú**: 18–130 moedas, 25–170 XP e 16% de escudo (uma vez por dia).
- **Missões diárias**: 3 sorteadas de 13, com 10–45 XP e 3–14 moedas cada.
- **Missões semanais**: 3 sorteadas de 8, com 45–130 XP e 20–65 moedas cada.
- **Ganho passivo**: +1 XP a cada 5 s com o hub aberto e a renda do pet a cada 5 s.

---

## Comandos

Digite `ajuda` para listar, ou `ajuda <comando>` para detalhar. São **35 comandos**.

| Comando | O que faz |
| --- | --- |
| `ajuda [comando]` | Lista tudo ou detalha um comando |
| `ir <aba>` | Abre uma aba (`ir metas`, `ir devlog`) |
| `foco [min]` | Inicia o pomodoro (padrão 25) |
| `pausar` / `zerar` | Pausa ou zera o ciclo |
| `quiz <matéria>` | Começa um quiz da matéria |
| `tema <nome>` | Aplica um tema desbloqueado |
| `diario <texto>` | Salva a entrada de hoje |
| `nota <título> \| <texto>` | Cria uma nota |
| `meta <texto>` | Adiciona uma meta |
| `senha [tamanho]` | Gera e copia uma senha |
| `calc <expressão>` | Calcula uma expressão |
| `resgatar <código>` | Resgata um código |
| `xp` / `moedas` / `streak` | Mostra progresso, saldo e sequência |
| `foguinho` | Detalha faixa, multiplicador, escudos e quanto falta para a próxima faixa |
| `missoes` | Lista as missões diárias e o progresso |
| `semana` | Lista as missões semanais e o progresso |
| `bau` | Abre o baú diário |
| `boost [xp\|moedas]` | Lista boosts ativos ou compra um boost |
| `escudo` | Compra um escudo de sequência por 90 moedas |
| `clicker` | Abre o núcleo e mostra energia, produção, prestígio e cliques |
| `critico` | Mostra críticos, núcleo dourado, talentos e núcleos livres |
| `cards` | Quantos cards estão devidos |
| `devlog [fix\|feature\|style]` | Abre o Dev Log filtrado |
| `zen` / `animacoes on\|off` | Modo Zen e preferência de movimento |
| `data` / `sobre` | Data/hora e informações da versão |
| `perfil` / `conquistas` | Resumo do perfil e conquistas |
| `exportar` | Baixa o progresso em JSON |
| `limpar` / `reset` | Limpa o terminal / apaga o progresso (com confirmação) |

## Códigos de recompensa

| Código | Recompensa | Expira em |
| --- | --- | --- |
| `BEMVINDO` | +15 moedas, +20 XP | 31/12/2026 |
| `GEEKIE2026` | +50 moedas, +100 XP | 31/12/2026 |
| `FOCOPRO` | +40 moedas, +60 XP e tema Neon | 31/01/2027 |
| `ENEM2026` | +30 moedas, +150 XP | 30/11/2026 |
| `DEVLOG5` | +25 moedas, +25 XP | 30/06/2027 |
| `HUBV195` | +100 moedas, +50 XP e tema Matrix | 31/12/2026 |
| `FOGUINHO22` | +80 moedas, +120 XP e 1 escudo de sequência | 31/12/2027 |
| `NUCLEO22` | +60 moedas, +80 XP | 30/06/2027 |
| `AURORA22` | +120 moedas, +100 XP e tema Aurora | 31/03/2027 |
| `BAU23` | +70 moedas, +90 XP | 31/12/2027 |
| `SEMANA23` | +90 moedas, +120 XP e 1 escudo | 31/12/2027 |
| `IMORTAL23` | +150 moedas, +200 XP e tema Galáxia | 30/06/2027 |
| `NEXUS24` | +180 moedas, +240 XP e 1 escudo | 31/12/2027 |
| `ORBITA24` | +200 moedas, +180 XP e 5.000 ⚡ | 31/12/2027 |
| `SINGULAR24` | +260 moedas, +320 XP e tema Brasa | 31/12/2027 |
| `MESTRE24` | +300 moedas, +400 XP e 1 escudo | 31/12/2027 |
| `SAKURA24` | +150 moedas, +220 XP e tema Sakura | 31/12/2027 |

Um resgate por conta, sem diferenciar maiúsculas, com expiração validada na data local. Códigos personalizados criados na central **não aparecem nesta tabela nem no catálogo público**; só podem ser resgatados por quem souber o texto e são removíveis na seção **Códigos**.

## Atalhos

| Atalho | Ação |
| --- | --- |
| `Ctrl+K` / `Cmd+K` | Paleta de comandos e abas |
| `Ctrl+B` / `Cmd+B` | Recolher e expandir a nav bar (só ícones), de qualquer aba |
| `Ctrl+Shift+D` | Abre as 3 últimas entradas do Dev Log em um painel flutuante |
| `Alt+Z` | Modo Zen |
| `/` | Focar a busca de abas |
| `Espaço` / `1`–`4` | Virar e avaliar flashcards (na aba Flashcards) |
| `Espaço` | Iniciar ou pausar o Pomodoro (na aba Pomodoro, fora de campos e botões) |
| `Espaço` / `Enter` | Clicar no núcleo (na aba Clicker, fora de campos de texto) |
| `1`–`4` | Responder o quiz (na aba Quiz, durante uma partida) |
| `0`–`9`, `+ - * /`, `Enter` | Calculadora |
| `↑` / `↓`, `Tab` | Histórico e autocomplete no terminal |
| `Esc` | Fechar overlays |
| `Ctrl+S` | Salvar nota (no editor) |

## Dados, privacidade e migração

- Progresso em `localStorage`, chave **`geekieHubState_v22`** — a mesma das versões anteriores, para ninguém perder progresso.
- Campos novos da v23: `boosts`, `dailyChest`, `weeklyStats`, `weeklyClaims`, `subjectLog`, `petXp`, `chestsOpened`, `boostsBought`, `boostsUsed` e, dentro de `clicker`, `talents`, `milestones`, `goldUntil`, `goldNext`, `goldSeen` e `crits`.
- Campos novos da v24: `portalZoom`, `adminCodeHash`, `adminLog`, `customCodes` e `adminRailCollapsed`. O hash do código root é mesclado sem revelar o texto; a sessão administrativa usa `sessionStorage` (chave `geekieAdminArmed_v24`) e cai ao fechar a aba.
- **Migração automática**: o estado antigo é mesclado com os padrões; `geekieHubState_v20` e `geekieHubState_v194` continuam aceitos.
- O clicker guarda `lifetime`, `prestige`, `autoExchange`, `buyAmount`, `lastSeen`, `comboBest`, `exchanges`, `talents`, `milestones` e os campos do núcleo dourado.
- Contas locais em `geekieHubAccounts_v20` (hash simples — **não é segurança de produção**).
- A central administrativa é uma **trava de conveniência local**: o hash evita texto puro, mas qualquer pessoa com os arquivos pode inspecionar ou alterar o JavaScript. Para sigilo real, use autenticação de servidor.
- Gravação com debounce de 400 ms, flush ao sair/esconder a página e gravação periódica a cada 30 s.
- Sons são gerados por Web Audio no próprio navegador; nenhuma requisição de áudio.
- O tutor do chat é **local e offline** (heurísticas por modo/matéria), sem chave de API e sem enviar mensagens.
- `exportar` gera um JSON com todo o estado; `reset` apaga o progresso.
- O aviso “Novidades” aparece uma vez por versão (chave `geekieHubSeenVersion_v22`) e mostra até oito itens das entradas v24 do Dev Log.

## Estrutura do `script.js`

| Bloco | Conteúdo |
| --- | --- |
| 1–3 | Utilidades (com AudioContext compartilhado), estado com migração e metadados |
| 4–9 | Topbar/tema, navegação, login, tutorial, paleta, Hoje e Chat |
| 8-B | **Gamificação**: faixas de foguinho, escudos, check-in, missões diárias e painel |
| 10–16 | Notas, Pomodoro, Metas, Flashcards, Quiz, Timer matérias e Planner |
| 17–25 | Estatísticas, Diário, Loja, Títulos, Pets, Trilha, Clicker e áudio |
| 26–34 | Calculadora, Caracteres, Título, Eventos, Portais, Comandos, Recompensas, Dev Log e Senhas |
| 33-B / 33-C | Painel das últimas atualizações e nav bar compacta (`Ctrl+B`) |
| 34-B / 34-C | Motores de FX dos botões e das caixas de pesquisa |
| 35 | Bindings globais, render geral, novidades, loops passivos e boot |
| **36** | **Núcleo v23**: boosts, baú, missões semanais, render dos painéis (36-A) |
| **36-B** | **Clicker 3.0**: talentos, marcos, crítico, núcleo dourado e extras |
| **36-C** | **Pomodoro, Metas, Flashcards e Quiz** (painéis v23) |
| **36-D** | **Matérias, Planner, Stats, Diário, Notas, Chars e Eventos** |
| **36-E** | Injeção de UI, eventos delegados, hooks de render e ciclo de vida |
| **36-F** | **Senhas**: modo PIN e limpeza do histórico |
| **37-A–37-I** | **Central v24**: hash do código root, componentes, views das oito seções, roteador, abrir/fechar, foco, ações e formulários |
| **37-J** | **Preview flutuante** dos caracteres, com abertura, troca suave e fechamento por rolagem/clique |
| **37-K** | **Ações rápidas** das 28 abas, builders de texto e manipuladores |
| **37-L** | **Portais** com zoom persistido e wrapper de navegação v24 |
| **37-M** | **Bindings v24**: atalho `Ctrl+Shift+S`, gate do código, armadilha de foco, importação e Dev Log |

## Últimas atualizações

### v24.0.0 — Central administrativa NEXUS
Central flutuante com blur, foco preso, oito seções em nav bar retrátil independente e abertura animada; acesso por código privado + `Ctrl+Shift+S`, com hash e sessão por aba.

### v24.0.0 — Cinco códigos novos
`NEXUS24`, `ORBITA24`, `SINGULAR24`, `MESTRE24` e `SAKURA24`; catálogo com 17 códigos públicos, cópia por cartão, energia de núcleo e códigos personalizados na central.

### v24.0.0 — Preview de caracteres
Cartão flutuante com glifo, nome, categoria, código Unicode e favorito; animação de abertura e transição suave ao deslizar para o caractere ao lado.

### v24.0.0 — Ações rápidas em todas as abas
Resumo do dia, foco de 5/10/50 min, exportações, reset de baralho, limpeza de chat, tema/título aleatórios, alimentar todos os pets, status do núcleo, portais e Dev Log.

### v24.0.0 — Melhorias de fluxo
`Espaço` no Pomodoro, zoom de portais lembrado, prévia ao vivo do título, copiar/exportar no atalho do Dev Log e backup/importação na central.

### v23.0.0 — Foguinho 3.0
Baú diário com até 130 moedas e 16% de escudo, três missões semanais, faixas Fênix (x1,7) e Imortal (x2) e níveis Ascendido/Lenda Eterna.

### v23.0.0 — Boosts de XP e moedas
Poção de foco (x2 XP) e Ímã de moedas (+50%) por 15 minutos, com pílulas na topbar, extensão de tempo e comando `boost`.

### v23.0.0 — Clicker 3.0
Doze melhorias, críticos de 4% a 50% com x6, núcleo dourado x5 por 20s, talentos de prestígio, cinco marcos, cinco trocas e renda offline de até 2h.

### v23.0.0 — Melhorias em todas as abas
Importação em lote e CSV nos flashcards, precisão por matéria no quiz, exportação do planner, insights nas estatísticas, humor no diário, filtro no chat, zoom nos portais e mais.

### v23.0.0 — Desempenho
AudioContext único, iframes sob demanda, HUD do clicker sem render oculto, renders com assinatura e floats limitados.

### v22.3.0 — Ctrl+B e nav bar compacta
Atalho de teclado para recolher/expandir a nav bar, tooltip com a combinação e preferência persistida.

### v22.1.0 — Painel das últimas atualizações
`Ctrl+Shift+D` abre as três últimas entradas do Dev Log em um cartão flutuante com blur e animação em cascata.

### v22.0.0 — Foguinho, missões e Clicker 2.0
Faixas de multiplicador, escudos, check-in progressivo, missões diárias, combo no clicker, prestígio e renda offline.

### v21.0.0 — Estatísticas completas e check-in
Check-in com recompensa, sequência, dias ativos, heatmap, foco de hoje ao vivo e CSV ampliado.

### v20.1.0 — Motor de FX nos botões
Spotlight, magnético, ripple, glow pulsante, borda gradiente, pulso no danger e borda desenhada no ghost.

## Limitações conhecidas

- O login é local e o hash de senha não é criptografia de produção; use como hub pessoal.
- Os iframes de Geekie e Google dependem de o site permitir embed; se bloquear, use **Nova aba**.
- O `zoom` dos portais usa a propriedade CSS `zoom`; em navegadores sem suporte ela é ignorada sem quebrar os atalhos.
- O histórico de senhas e o terminal ficam apenas na memória da aba.
- O tutor local não é um modelo de linguagem: ele estrutura o raciocínio, não substitui professor ou material didático.
- A renda offline do clicker vai de **10 minutos** a **2 horas** conforme o prestígio.
- A central administrativa é local: o hash do código e a sessão em `sessionStorage` não são autenticação de servidor. O código **não** é divulgado neste README; troque-o na seção **Segurança** e guarde-o fora do navegador.
- Códigos personalizados são aceitos pelo campo de resgate, mas não aparecem no catálogo público; se o texto for perdido, só a central (ou um backup) os recupera.
- O preview de caracteres depende de ponteiro/foco; em telas de toque ele não abre por hover (o toque continua copiando).
- O combo do clicker exige cliques em até **900 ms**; acima disso o contador reinicia.
- Críticos usam sorteio local (`Math.random`), então a taxa de 4%–50% é probabilística, não garantida em janelas curtas.
- O baú diário usa sorteio local; a recompensa é sorteada na abertura e fica registrada no estado.
- O modo PIN gera apenas dígitos e tem entropia menor que uma senha completa; use para PINs, não para contas importantes.
- A borda gradiente girando (`@property --fx-angle`) degrada para borda estática em navegadores muito antigos; o resto dos efeitos continua funcionando.
- A nav bar compacta (só ícones) só existe em telas com mais de 1024px de largura; no mobile o menu continua sendo a gaveta e o `Ctrl+B` não tem efeito.
- As pílulas de boost ficam ocultas abaixo de 1220px para não espremer a topbar; os boosts continuam ativos.
