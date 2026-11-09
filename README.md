# Geekie Study Hub — v19.4.0

Hub de estudos em página única (HTML + CSS + JS puros, sem build e sem servidor).
Tudo roda no navegador e o progresso é salvo em `localStorage`.

## Como abrir

Mantenha os **três arquivos na mesma pasta** e abra o `index.html` no navegador:

```
index.html
style.css
script.js
```

Dica: para o Portal Geekie e o Google carregarem sem bloqueio, sirva por HTTP
(ex.: `python3 -m http.server 3000` e acesse `http://localhost:3000`).

## Arquivos

| Arquivo | Responsabilidade |
| --- | --- |
| `index.html` | Estrutura: overlay de login, tutorial, topbar, 26 abas, menu FAB, toast |
| `style.css` | Tokens de design, componentes, molduras de tema e o sistema de animação por tipo de botão |
| `script.js` | Estado persistente, XP/moedas, todas as abas, animação de botões e Dev Log |
| `README.md` | Este arquivo (5 últimas atualizações) |

## As 5 últimas atualizações

### 1. v19.4.0 — Correção dos erros de carregamento (2026-11-09)
- Arquivos com nomes canônicos na mesma pasta: `index.html`, `style.css` e `script.js`.
- Iframes (Portal Geekie e Google) com carregamento sob demanda, `onload` + timeout de 9 s e overlay de erro — nada de tela branca.
- Inicialização protegida: cada acesso ao DOM é verificado, e falhas no boot aparecem no overlay de login em vez de sumirem no console.
- Login, sessão e progresso continuam funcionando mesmo quando o `localStorage` está bloqueado.
- Removido o código que exigia um download anterior (`style (16) (2).css` / `script (21) (2).js`): os nomes agora casam com as referências do HTML.

### 2. v19.4.0 — Animações por tipo de botão, Dev Log e README (2026-11-09)
- Novo sistema de animação em que **cada tipo de botão tem o seu efeito** (19 efeitos distintos), aplicado automaticamente pelo `script.js` e desenhado no `style.css`.
- Efeitos aplicados também a botões criados dinamicamente (MutationObserver).
- Aba **Dev Log** reorganizada, com filtros por tipo (Correções / Novidades / Interface) e registro desta versão.
- Este `README.md`, com as 5 últimas atualizações.

### 3. v19.4.0 — Ajustes visuais e responsividade (2026-11-09)
- Topbar reorganizada: XP com barra de progresso, moedas, título, tempo de foco, relógio e os três modos.
- Menu FAB acessível (`aria-expanded`, fechamento por `Esc` e clique fora).
- Estilos novos para chat, flashcards, planner, quiz, calculadora, caracteres e diário.
- Molduras animadas para os 9 temas da loja.

### 4. v19.3.0 — Animações previsíveis por função (2026-10-21)
- Cada grupo de botões passou a ter um efeito consistente com a sua função.
- Cabeçalho adaptado para telas pequenas (XP, relógio e título recolhem por breakpoint).

### 5. v19.2.0 — Controle global de movimento (2026-10-05)
- Botão **Reduzir animações** no topbar, com preferência salva.
- Dev Log passou a ser acessível direto pelo menu FAB.

## Animação por tipo de botão (v19.4.0)

| Tipo de botão | Efeito | Classe |
| --- | --- | --- |
| Entrar / criar conta | gradiente que percorre | `fx-flow` |
| Ação principal | varredura de brilho | `fx-shine` |
| Ação secundária | borda traçada | `fx-trace` |
| Ação destrutiva | tremida curta | `fx-shake` |
| Ícones do topbar | giro + halo | `fx-orbit` |
| Chips de sugestão | salto + sublinhado | `fx-lift` |
| Filtros | compressão elástica | `fx-squish` |
| Teclas da calculadora | clarão interno | `fx-glint` |
| Controles do Pomodoro | aperto com anel | `fx-squeeze` |
| Alternativas do quiz | basculhar 3D | `fx-flip` |
| Botão flutuante (FAB) | ondas sonar | `fx-sonar` |
| Itens do menu FAB | deslize + seta | `fx-slide` |
| Próximo / Anterior do tutorial | empurrão direcional | `fx-nudge-right` / `fx-nudge-left` |
| Pular tutorial | fade | `fx-fade` |
| Comprar tema / pet / código | moeda girando | `fx-coin` |
| Símbolos e favoritos | escala com brilho | `fx-pop` |
| Núcleo do clicker | batida | `fx-pulse` |
| Preview de tema | giro de matiz | `fx-hue` |

Todas as animações são desligadas por `prefers-reduced-motion` ou pelo botão
**Reduzir animações** (`Alt+Z` alterna o Modo Zen, `Alt+M` o Multi-Tarefa).

## Atalhos

- `Esc` — fecha menu FAB / tutorial / Modo Zen
- `Alt+M` — Multi-Tarefa (portal + Google lado a lado)
- `Alt+Z` — Modo Zen

## Privacidade

Contas e senhas ficam somente neste navegador (armazenamento local, com hash simples).
Nenhum dado é enviado para servidores. O tutor de IA é local e baseado em regras,
não é um modelo de linguagem.
