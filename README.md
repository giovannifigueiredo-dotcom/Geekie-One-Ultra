# Geekie Study Hub

Hub de estudos em **3 arquivos** (HTML, CSS e JS), sem build e sem dependências locais — só os ícones e as fontes vêm de CDN.

Versão atual: **v20.0.0**

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

## O que mudou na v20.0.0

### 1. Nova camada visual e shell

- **Sidebar** com grupos (Hoje, Estudo, Inteligência, Progresso, Ferramentas, Extras), busca de abas em tempo real e rodapé com versão e atalhos.
- **Topbar** com XP + barra de progresso do próximo título, moedas, sequência de dias, foco do dia, relógio, paleta, Zen, redução de animações e avatar/logout.
- **Bottom-nav** no mobile e menu lateral deslizante.
- **Paleta de comandos** em `Ctrl+K` que busca abas e comandos e aceita teclado (`↑`/`↓`, `Enter`).
- Sistema de **botões** com variantes (`primary`, `secondary`, `ghost`, `danger`, `icon`) e tamanhos (`sm`, `lg`, `block`), estados de foco, desabilitado e hover discreto.
- Cards, chips, badges, switches, barras de progresso, skeletons de carregamento de iframe, empty states e **toasts** no lugar de `alert`.
- **Acessibilidade**: foco visível em tudo, `aria-*` nos controles, alvos de toque maiores, contraste AA e respeito a `prefers-reduced-motion` (além do botão de movimento).

### 2. Nova aba "Hoje"

Dashboard inicial com saudação por horário, **anel da meta diária de foco** (60 min), sequência, foco da semana, metas abertas, cards devidos, plano do dia vindo do planner e seis atalhos rápidos.

### 3. Progressão

- **Sequência (streak)** com recorde e atalho para estatísticas.
- **Marcos** com recompensa resgatável e **conquistas automáticas** na aba Trilha.
- **Pets** com energia, alimentação (15 moedas → +20 de energia) e renda passiva por tick.
- **Títulos** por XP e **temas** com preview ao vivo ao passar o mouse.

---

## As 28 abas

| Aba | O que faz |
| --- | --- |
| **Hoje** | Dashboard com meta diária, streak, metas, revisões, planner e atalhos |
| **Pomodoro** | Ciclos configuráveis, pausa longa a cada 4 ciclos, matéria, som e contador na aba do navegador |
| **Metas** | Matéria, prioridade, prazo, filtros (incluindo atrasadas), progresso e edição |
| **Flashcards** | Repetição espaçada (SM-2 simplificado), baralhos, atalhos e agenda por card |
| **Quiz** | Banco por matéria, explicação por alternativa, modo 20s, recorde e revisão de erros |
| **Timer matérias** | Cronômetro com pausa, matérias personalizadas e metas de minutos |
| **Planner** | Grade de 7 dias × 6 blocos, cores por matéria, modelo, cópia da semana |
| **Estatísticas** | Foco 7/30 dias, heatmap de 12 semanas, distribuição por matéria e CSV |
| **Diário** | Entrada por dia, humor, busca, edição e exportação markdown |
| **Chat IA** | Tutor local com modos, matéria, resposta progressiva e ações por mensagem |
| **Comandos** | Terminal com 30 comandos, autocomplete, histórico e ajuda |
| **Loja** | Nove temas, compra com moedas, equipar e preview ao vivo |
| **Títulos** | Oito títulos liberados por XP e equipáveis |
| **Pets** | Cinco pets com adoção, energia, alimentação e renda passiva |
| **Trilha** | Níveis com barras, marcos resgatáveis e conquistas |
| **Clicker** | Núcleo de energia, quatro melhorias automáticas e troca por moedas |
| **Recompensas** | Seis códigos com status, expiração, histórico e colar da área de transferência |
| **Notas** | Busca, tags, autosave, fixar, contagem de palavras e exportação `.md` |
| **Sons ambiente** | Quatro camadas (chuva, ruído, ondas, lareira), presets, volume geral e timer |
| **Som de teclado** | Quatro estilos, volume e campo de teste |
| **Calculadora** | Teclado completo, histórico clicável e cópia |
| **Caracteres** | Categorias, busca, favoritos (`Shift+clique`) e inserção no último campo |
| **Título da página** | Texto, sete fontes, dezesseis ícones e restauração |
| **Senhas** | Senhas e passphrase, entropia em bits, medidor e histórico local |
| **Portal Geekie** | Iframe do Geekie One, recarregar, nova aba, tela cheia e atalhos |
| **Google** | Google embutido e atalhos para Classroom, Drive, Docs e YouTube |
| **Eventos** | Evento de cada mês, nível por foco e recompensa em moedas |
| **Dev Log** | Histórico de versões com filtro por tipo e busca |

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

Um resgate por conta, sem diferenciar maiúsculas, com expiração validada na data local.

## Atalhos

| Atalho | Ação |
| --- | --- |
| `Ctrl+K` / `Cmd+K` | Paleta de comandos e abas |
| `Alt+Z` | Modo Zen |
| `/` | Focar a busca de abas |
| `Espaço` / `1`–`4` | Virar e avaliar flashcards (na aba Flashcards) |
| `0`–`9`, `+ - * /`, `Enter` | Calculadora |
| `↑` / `↓`, `Tab` | Histórico e autocomplete no terminal |
| `Esc` | Fechar overlays |
| `Ctrl+S` | Salvar nota (no editor) |

## Dados, privacidade e migração

- Progresso em `localStorage`, chave `geekieHubState_v20`.
- **Migração automática** da chave antiga `geekieHubState_v194`: notas, metas, temas, XP, moedas e histórico continuam válidos na primeira abertura da v20.
- Contas locais em `geekieHubAccounts_v20` (hash simples — **não é segurança de produção**).
- Sons são gerados por Web Audio no próprio navegador; nenhuma requisição de áudio.
- O tutor do chat é **local e offline** (heurísticas por modo/matéria), sem chave de API e sem enviar mensagens.
- `exportar` gera um JSON com todo o estado; `reset` apaga o progresso.
- O aviso "Novidades" aparece uma vez por versão (chave `geekieHubSeenVersion_v20`).

## Estrutura do `script.js`

| Bloco | Conteúdo |
| --- | --- |
| 1–3 | Utilidades, estado com migração e metadados (abas, níveis, temas, pets) |
| 4–9 | Topbar/tema, navegação, login, tutorial, paleta, Hoje e Chat |
| 10–16 | Notas, Pomodoro, Metas, Flashcards, Quiz, Timer matérias e Planner |
| 17–25 | Estatísticas, Diário, Loja, Títulos, Pets, Trilha, Clicker e áudio |
| 26–34 | Calculadora, Caracteres, Título, Eventos, Portais, Comandos, Recompensas, Dev Log e Senhas |
| 35 | Bindings globais, render geral, novidades, loops passivos e boot |

## As 5 últimas atualizações

### v20.0.0 — Interface e navegação
Sidebar com busca, topbar redesenhada, paleta `Ctrl+K`, toasts, novo sistema de botões e mobile-nav.

### v20.0.0 — Aba Hoje e progressão
Dashboard diário, streak com recorde, marcos resgatáveis, oito conquistas, pets com energia e alimentação.

### v20.0.0 — Estudo
Flashcards com repetição espaçada, quiz com explicação e cronômetro, planner colorido, metas com prazo e prioridade.

### v20.0.0 — Tutor e ferramentas
Chat com resposta progressiva e ações (nota/card), notas com tags e `.md`, calculadora com histórico, sons com presets e timer.

### v20.0.0 — Correções
Migração do estado antigo, iframes com aviso, foco visível/contraste e cálculo único de foco, XP e moedas.

## Limitações conhecidas

- O login é local e o hash de senha não é criptografia de produção; use como hub pessoal.
- Os iframes de Geekie e Google dependem de o site permitir embed; se bloquear, use **Nova aba**.
- O histórico de senhas e o terminal ficam apenas na memória da aba.
- O tutor local não é um modelo de linguagem: ele estrutura o raciocínio, não substitui professor ou material didático.
