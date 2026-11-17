# Geekie Study Hub

Hub de estudos em **3 arquivos** (HTML, CSS e JS), sem build e sem dependências locais — só os ícones e as fontes vêm de CDN.

Versão atual: **v22.1.0**

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

## O que mudou na v22.1.0

### 1. Atalho para as últimas atualizações

- **`Ctrl+Shift+D`** abre um painel flutuante com as **três entradas mais recentes** do Dev Log, de qualquer aba.
- O atalho fica **fixo na nav bar** (rodapé lateral, com a combinação `Ctrl Shift D` à vista) e também no cabeçalho da aba Dev Log, no botão **Últimas 3**.
- `Esc`, o X ou um clique fora do cartão fecham o painel; o botão **Dev Log completo** leva à aba com o histórico inteiro.
- As entradas vêm do mesmo array `DEVLOG` que alimenta a aba, com versão, tipo, data e lista de mudanças.

### 2. Tela centralizada, flutuante e com blur

- O painel abre **centralizado na janela**, flutuando sobre a interface, com `backdrop-filter: blur(22px)` e saturação no resto da tela.
- **Animação de abertura**: o cartão entra com mola e desfoque (`translateY` + `scale` + `blur`), um brilho atravessa o cabeçalho e as três entradas surgem em cascata de 80 ms.
- O ícone do cabeçalho gira ao aparecer e o cartão ganha borda e halo na cor do tema.

### 3. Botão que esconde a nav bar

- Novo botão na topbar (ícone de colunas) **recolhe o menu lateral** com transição de largura e giro do ícone; o mesmo botão restaura o menu.
- A escolha fica em **`navCollapsed`** no estado e volta assim ao reabrir o hub.
- No clique, um anel se expande e o ícone faz uma volta elástica; o botão fica com destaque enquanto a nav bar está recolhida.
- A nav bar retrátil vale para o desktop; no mobile o menu continua sendo a gaveta pelo botão hambúrguer.
- Tudo respeita o botão **Reduzir animações** e `prefers-reduced-motion`.

---

## O que mudou na v22.0.0

### 1. Foguinho: multiplicador, escudos, check-in progressivo e missões

- **Faixas de foguinho** multiplicam **todo XP ganho** no hub: `x1` (0–2 dias), `x1,1` (3+), `x1,2` (7+), `x1,35` (14+) e `x1,5` (30+). A faixa e o quanto falta para a próxima aparecem na topbar, no painel da aba Hoje e na aba Estatísticas.
- **Escudos de sequência**: até **5** unidades por **90 moedas**. Se um dia passar sem foco e sem check-in, um escudo é consumido automaticamente e o dia continua contando como ativo — a sequência não quebra. O total de escudos usados fica registrado.
- **Check-in com recompensa crescente**: de **+12 a +40 XP** e **+4 a +14 moedas** conforme a sequência. Em **7, 14, 30, 60 e 100 dias** há bônus extras de `sequência × 4` XP e `sequência × 2` moedas.
- **Três missões diárias** sorteadas de um pool de oito (check-in, 20 min, 45 min, 8 flashcards, 3 acertos no quiz, 1 meta, 120 cliques, 1 nota/diário). A escolha é **determinística pela data** — muda todo dia, com progresso ao vivo e resgate de XP + moedas.
- **Novos níveis**: **Lenda Suprema** (4.200 XP) e **Mítico** (5.600 XP), com bônus em moedas a cada subida de nível.
- **Painel Foguinho na aba Hoje** com faixa atual, multiplicador, progresso da meta diária, botão de check-in, compra de escudo e as três missões do dia.
- **Estatísticas** ganharam cards de **Escudos** e **Vs. período anterior**, e o mapa de constância/CSV passaram a reconhecer dias protegidos por escudo.
- **Trilha ampliada**: 10 marcos resgatáveis e **13 conquistas** (cinco novas: 14 dias de foguinho, missões, cliques, prestígio e escudo).

### 2. Clicker 2.0

- **Seis melhorias**: Mouse extra, Segundo monitor, Teclado mecânico, Café reforçado, Setup gamer e Servidor local. Cada uma soma energia por segundo e/ou por clique; o custo cresce **1,55×** por nível.
- **Compra em x1, x10 ou máximo**, com o custo total calculado antes da compra.
- **Combo de cliques**: cliques encadeados em até **900 ms** aumentam o multiplicador até **x2**, com contador no HUD e números flutuantes.
- **Três faixas de troca**: `50 ⚡ → 5`, `500 ⚡ → 60` e `2.500 ⚡ → 350 moedas`, além da **auto-troca** opcional ao passar de 2.500 de energia.
- **Prestígio**: reinicia energia e melhorias em troca de **+15% permanente** por núcleo (requisito cresce a partir de 6.000 de energia vitalícia). Moedas e cliques são mantidos.
- **Renda offline de até 10 minutos** ao reabrir o hub, calculada pela produção por segundo.
- **Clique por `Espaço` ou `Enter`** quando a aba está aberta e o foco não está em um campo de texto.
- O HUD atualiza **apenas os textos** a cada tick, sem recriar a loja nem usar `innerHTML` no caminho quente.

### 3. Novas features em todas as abas

- **Pomodoro** com presets **50/10** e **90/15**, XP extra em sessões de 25 min ou mais e moedas por bloco de 10 min.
- **Metas** com **busca** e **ordenação** por prazo, prioridade ou recência; a contagem volta ao normal ao reabrir uma meta concluída.
- **Flashcards** com **modo reverso** (resposta → pergunta) e **fila embaralhada**.
- **Quiz** com **combo de acertos** e XP bônus por sequência.
- **Planner** com navegação de **−12 a +12 semanas**, rótulo de semana relativa e cópia da semana visualizada.
- **Diário** com **rascunho automático por data** — o texto não salvo é recuperado ao voltar para o dia.
- **Notas** com botão **duplicar**.
- **Calculadora** com **memória** (`M+`, `MR`, `MC`) e **histórico persistido** no estado.
- **Sons ambiente** com a camada **Vento** e o preset **Tempestade** (além de Foco profundo, Noite de chuva e Biblioteca).
- **Som de teclado** com o estilo **Retrô** (cinco estilos no total).
- **Loja** com os temas **Aurora** e **Sakura** (11 temas).
- **Comandos** novos: `foguinho`, `missoes`, `escudo` e `clicker`.

### 4. Desempenho

- **Gravação com debounce de 400 ms** e `saveNow()` para operações críticas, com **flush** ao esconder/sair da página e gravação periódica a cada 30 s.
- **Topbar coalescida em `requestAnimationFrame`**: várias chamadas no mesmo frame viram uma única pintura.
- **Clicker** com HUD leve por tick, delta de tempo real e loja renderizada só quando muda.
- **Intervalos de 1 s** no Pomodoro e no timer por matéria; a renda passiva respeita aba oculta.
- **Buscas com debounce** em notas, diário e Dev Log.
- **Render inicial reduzido**: os bindings já renderizam suas abas e o `renderAll()` não repete esse trabalho.
- **Coleções e gráficos** só são redesenhados quando a aba correspondente está aberta; animações de fundo pausam com `body.tab-hidden`.

### 5. Dev Log

- A aba **Dev Log** recebeu **5 entradas v22.0.0** (foguinho/escudos, missões e conquistas, clicker, features por aba e desempenho), com filtro por tipo e busca.

---

## As 28 abas

| Aba | O que faz |
| --- | --- |
| **Hoje** | Painel Foguinho com faixa, meta e escudos, três missões diárias, anel da meta, metas, revisões, planner e atalhos |
| **Pomodoro** | Ciclos configuráveis com presets 50/10 e 90/15, pausa longa, matéria, som e contador na aba do navegador |
| **Metas** | Matéria, prioridade, prazo, busca, ordenação, filtros (incluindo atrasadas), progresso e edição |
| **Flashcards** | Repetição espaçada (SM-2 simplificado), baralhos, modo reverso, fila embaralhada, atalhos e agenda por card |
| **Quiz** | Banco por matéria, explicação por alternativa, modo 20s, combo de acertos, recorde e revisão de erros |
| **Timer matérias** | Cronômetro com pausa, matérias personalizadas e metas de minutos |
| **Planner** | Grade de 7 dias × 6 blocos, navegação de −12 a +12 semanas, cores por matéria, modelo e cópia da semana |
| **Estatísticas** | Check-in, sequência, dias ativos, escudos, Foco hoje e Últimos 7 dias ao vivo, heatmap de 12 semanas, distribuição e CSV |
| **Diário** | Entrada por dia com rascunho automático, humor, busca, edição e exportação markdown |
| **Chat IA** | Tutor local com modos, matéria, resposta progressiva e ações por mensagem |
| **Comandos** | Terminal com 31 comandos, autocomplete, histórico e ajuda |
| **Loja** | Onze temas, compra com moedas, equipar e preview ao vivo |
| **Títulos** | Dez títulos liberados por XP e equipáveis |
| **Pets** | Cinco pets com adoção, energia, alimentação e renda passiva |
| **Trilha** | Dez níveis com barras, dez marcos resgatáveis e treze conquistas |
| **Clicker** | Núcleo com seis melhorias, combo, compra x1/x10/máx, auto-troca, prestígio e renda offline |
| **Recompensas** | Nove códigos com status, expiração, histórico e colar da área de transferência |
| **Notas** | Busca, tags, autosave, fixar, duplicar, contagem de palavras e exportação `.md` |
| **Sons ambiente** | Cinco camadas (chuva, ruído, ondas, lareira, vento), presets incluindo Tempestade, volume geral e timer |
| **Som de teclado** | Cinco estilos (incluindo Retrô), volume e campo de teste |
| **Calculadora** | Teclado completo, memória M+/MR/MC, histórico persistido e cópia |
| **Caracteres** | 400+ símbolos em 14 categorias, busca por código Unicode, favoritos, recentes, detalhe e inserção no último campo |
| **Título da página** | Texto, sete fontes, dezesseis ícones e restauração |
| **Senhas** | Senhas e passphrase, entropia em bits, medidor e histórico local |
| **Portal Geekie** | Iframe do Geekie One, recarregar, nova aba, tela cheia e atalhos |
| **Google** | Google embutido e atalhos para Classroom, Drive, Docs e YouTube |
| **Eventos** | Evento de cada mês, nível por foco e recompensa em moedas |
| **Dev Log** | Histórico de versões com filtro por tipo, busca e botão **Últimas 3** (ou `Ctrl+Shift+D`) |

---

## Comandos

Digite `ajuda` para listar, ou `ajuda <comando>` para detalhar.

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
| `missoes` | Lista as missões diárias e o progresso de cada uma |
| `escudo` | Compra um escudo de sequência por 90 moedas |
| `clicker` | Abre o núcleo e mostra energia, produção, prestígio e cliques |
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

Um resgate por conta, sem diferenciar maiúsculas, com expiração validada na data local.

## Atalhos

| Atalho | Ação |
| --- | --- |
| `Ctrl+K` / `Cmd+K` | Paleta de comandos e abas |
| `Alt+Z` | Modo Zen |
| `/` | Focar a busca de abas |
| `Espaço` / `1`–`4` | Virar e avaliar flashcards (na aba Flashcards) |
| `Espaço` / `Enter` | Clicar no núcleo (na aba Clicker, fora de campos de texto) |
| `0`–`9`, `+ - * /`, `Enter` | Calculadora |
| `↑` / `↓`, `Tab` | Histórico e autocomplete no terminal |
| `Esc` | Fechar overlays |
| `Ctrl+S` | Salvar nota (no editor) |
| `Ctrl+Shift+D` | Abre as 3 últimas entradas do Dev Log em um painel flutuante |

## Dados, privacidade e migração

- Progresso em `localStorage`, chave **`geekieHubState_v22`** — inclui `focusByDate`, `checkins`, `streakShields`, `streakProtect`, `shieldsUsed`, `dailyStats`, `missionClaims`, `diaryDrafts`, `xpEarned`, `coinsEarned`, `charsFav`/`recentChars`, `charCopies` e `navCollapsed` (nav bar recolhida).
- **Migração automática** das chaves antigas `geekieHubState_v20` e `geekieHubState_v194`: notas, metas, temas, XP, moedas e histórico continuam válidos.
- O clicker guarda `lifetime`, `prestige`, `autoExchange`, `buyAmount`, `lastSeen`, `comboBest` e `exchanges` no mesmo estado.
- Contas locais em `geekieHubAccounts_v20` (hash simples — **não é segurança de produção**).
- Gravação com debounce de 400 ms, flush ao sair/esconder a página e gravação periódica a cada 30 s.
- Sons são gerados por Web Audio no próprio navegador; nenhuma requisição de áudio.
- O tutor do chat é **local e offline** (heurísticas por modo/matéria), sem chave de API e sem enviar mensagens.
- `exportar` gera um JSON com todo o estado; `reset` apaga o progresso.
- O aviso "Novidades" aparece uma vez por versão (chave `geekieHubSeenVersion_v22`) e mostra até oito itens das entradas v22 do Dev Log.

## Estrutura do `script.js`

| Bloco | Conteúdo |
| --- | --- |
| 1–3 | Utilidades, estado com migração e metadados (abas, níveis, temas, pets) |
| 4–9 | Topbar/tema, navegação, login, tutorial, paleta, Hoje e Chat |
| 8-B | **Gamificação**: faixas de foguinho, escudos, check-in progressivo, missões diárias e painel da aba Hoje |
| 10–16 | Notas, Pomodoro, Metas, Flashcards, Quiz, Timer matérias e Planner |
| 17–25 | Estatísticas, Diário, Loja, Títulos, Pets, Trilha, Clicker (23) e áudio |
| 26–34 | Calculadora, Caracteres, Título, Eventos, Portais, Comandos, Recompensas, Dev Log e Senhas |
| 33-B / 33-C | **Atalho das últimas atualizações** (painel flutuante) e **nav bar retrátil** (`navCollapsed` no estado) |
| 34-B | **Motor FX dos botões**: spotlight (`--fx-x/--fx-y`), magnético (`--fx-tx/--fx-ty`) e ripple com delegação de eventos |
| 34-C | **Motor FX das caixas de pesquisa**: glow pulsante, glow que segue o mouse (`--sf-x/--sf-y`) e ripple no clique/foco |
| 35 | Bindings globais, render geral, novidades, loops passivos e boot |

## Últimas atualizações

### v22.1.0 — Atalho para as 3 últimas do Dev Log
`Ctrl+Shift+D`, atalho fixo na nav bar e botão na aba Dev Log abrem um painel centralizado com blur no resto da tela, animação em cascata e link para o histórico completo.

### v22.1.0 — Painel animado e nav bar retrátil
Cartão com entrada elástica e brilho atravessando o cabeçalho; botão na topbar recolhe o menu lateral com transição de largura e guarda a preferência.

### v22.0.0 — Foguinho com multiplicador, escudos e check-in progressivo
Faixas de x1 a x1,5 em todo XP, até cinco escudos por 90 moedas, check-in de +12 a +40 XP com bônus em 7/14/30/60/100 dias e painel novo na aba Hoje.

### v22.0.0 — Missões diárias, conquistas e níveis
Três missões por dia com resgate de XP + moedas, cinco conquistas novas, quatro marcos novos e níveis Lenda Suprema/Mítico.

### v22.0.0 — Clicker 2.0
Combo de até x2, seis melhorias, compra x1/x10/máx, três faixas de troca, auto-troca, prestígio com +15% permanente e renda offline de até 10 min.

### v22.0.0 — Novas features em todas as abas
Presets de Pomodoro, busca/ordenação de metas, flashcards reversos, combo no quiz, planner de −12 a +12 semanas, rascunhos no diário, duplicar notas, memória na calculadora, vento/Tempestade, teclado Retrô e temas Aurora/Sakura.

### v22.0.0 — Desempenho
Gravação com debounce e flush, topbar em `requestAnimationFrame`, HUD do clicker sem recriação, intervalos de 1 s, buscas com debounce e render só da aba ativa.

### v21.0.0 — Estatísticas completas e check-in diário
Check-in com recompensa, sequência que conta check-in, dias ativos, recorde, faixa de 7 dias e CSV ampliado.

### v21.0.0 — Foco hoje e Últimos 7 dias ao vivo
Cronômetro somando o ciclo em andamento e barras de 7 dias crescendo em tempo real, com média e melhor dia.

### v21.0.0 — Caracteres ampliados
400+ símbolos, 14 categorias, busca por código Unicode, painel de detalhe, recentes, favoritos e cópia em massa.

### v20.1.0 — Motor de FX nos botões
Spotlight e magnético guiados pelo mouse, ripple por clique e teclado, glow pulsante no primário, borda gradiente girando no secundário, pulso no danger e borda desenhada no ghost.

### v20.0.0 — Interface, navegação e progressão
Sidebar com busca, topbar redesenhada, paleta `Ctrl+K`, toasts, novo sistema de botões, mobile-nav, aba Hoje, streak com recorde, marcos e pets.

## Limitações conhecidas

- O login é local e o hash de senha não é criptografia de produção; use como hub pessoal.
- Os iframes de Geekie e Google dependem de o site permitir embed; se bloquear, use **Nova aba**.
- O histórico de senhas e o terminal ficam apenas na memória da aba.
- O tutor local não é um modelo de linguagem: ele estrutura o raciocínio, não substitui professor ou material didático.
- A renda offline do clicker é limitada a **10 minutos** por reabertura.
- O combo do clicker exige cliques em até **900 ms**; acima disso o contador reinicia.
- A borda gradiente girando (`@property --fx-angle`) degrada para borda estática em navegadores muito antigos; o resto dos efeitos continua funcionando.
- O blur do painel das últimas atualizações depende de `backdrop-filter`; sem suporte, o fundo fica apenas escurecido.
- A nav bar retrátil só existe em telas com mais de 1024px de largura; no mobile o menu continua sendo a gaveta.

```chart
{
  "type": "bar",
  "title": "Chart title",
  "x": "label",
  "series": [
    {
      "key": "value",
      "label": "Value"
    }
  ],
  "data": [
    {
      "label": "A",
      "value": 3
    },
    {
      "label": "B",
      "value": 5
    },
    {
      "label": "C",
      "value": 4
    }
  ]
}
```
