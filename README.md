# Geekie Study Hub

Hub de estudos em **3 arquivos** (HTML, CSS e JS), sem build e sem dependências externas além dos ícones e das fontes carregados por CDN.

Versão atual: **v19.5.0**

## Como abrir

Os três arquivos precisam ficar **na mesma pasta**:

```
index.html
style.css
script.js
```

- **Duplo clique** em `index.html` funciona (o app roda em `file://`).
- **Servidor local** é mais confiável para o navegador carregar CSS/JS com o tipo correto:

```bash
python3 -m http.server 3000
# abra http://localhost:3000
```

Se algum arquivo não carregar, o próprio app mostra um aviso vermelho no canto inferior esquerdo dizendo qual falhou — basta garantir os três arquivos juntos e recarregar com `Ctrl+F5`.

## Arquivos

| Arquivo | O que tem dentro |
| --- | --- |
| `index.html` | Estrutura das 27 abas, overlay de login, tutorial, topbar, menu FAB e o aviso de diagnóstico de carregamento |
| `style.css` | Tokens de design, componentes de todas as abas, 9 temas, animações por tipo de botão e a camada visual da v19.5.0 |
| `script.js` | Estado persistente, login local, XP/moedas, 27 abas, motor de animações por tipo, comandos, recompensas, quiz e Dev Log |

## As 5 últimas atualizações

### v19.5.0 — Aba de Comandos
- Terminal dentro do hub: `ajuda`, `ir`, `foco`, `quiz`, `nota`, `meta`, `senha`, `calc`, `resgatar` e mais (24 comandos).
- Autocomplete com sugestões clicáveis, `Tab` completa, `↑`/`↓` navegam o histórico.
- Atalho global `Ctrl+K` (`Cmd+K` no Mac) abre a aba com o cursor pronto.
- Histórico fica só na memória da aba: nada é enviado para servidor.

### v19.5.0 — Códigos de Recompensa
- Seis campanhas: `BEMVINDO`, `GEEKIE2026`, `FOCOPRO`, `ENEM2026`, `DEVLOG5`, `HUBV195`.
- Prêmios em moedas, XP e temas (`FOCOPRO` e `HUBV195` liberam tema).
- Cada código vale **uma vez por conta**, com validação de data de expiração e normalização de maiúsculas/espaços.
- Histórico de resgates com data e botão de colar da área de transferência.

### v19.5.0 — Interface reformulada
- Fundo com aurora animada e grade sutil; topbar de vidro com fio em gradiente e logo pulsante.
- Cards com profundidade, borda viva no hover, kicker nos títulos e divisórias em gradiente.
- Anel de foco visível em botões e campos, micro-animação na troca de aba, barras de rolagem discretas.
- Busca de abas no menu FAB e selo `NOVO` nas abas recém-chegadas.

### v19.5.0 — Aba de Códigos removida
- Os snippets genéricos saíram; o espaço é das abas de Comandos e de Recompensas.
- Nenhum dado apagado: progresso, notas, temas e XP continuam no mesmo `localStorage`.
- Pedidos antigos para `tab-codes` são redirecionados para Comandos, sem erro no console.

### v19.4.0 — Correção dos erros de carregamento
- CSS/JS com `?v=` para furar cache e aviso na tela quando um arquivo não chega.
- Servidor de preview com MIME explícito, `no-store` e `nosniff`.
- Login, sessão e progresso protegidos quando o `localStorage` está bloqueado.

## Aba de Comandos

| Comando | O que faz |
| --- | --- |
| `ajuda [comando]` | Lista tudo ou detalha um comando |
| `ir <aba>` | Abre uma aba (`ir notas`, `ir devlog`, `ir recompensas`) |
| `foco [min]` | Inicia o pomodoro (padrão 25 min) |
| `pausar` / `zerar` | Pausa ou zera o ciclo atual |
| `quiz <matéria>` | Começa um quiz da matéria |
| `tema <nome>` | Aplica um tema já desbloqueado |
| `diario <texto>` | Salva a entrada do diário de hoje |
| `nota <título> \| <texto>` | Cria uma nota nova |
| `meta <texto>` | Adiciona uma meta de estudo |
| `senha [tamanho]` | Gera uma senha forte e copia |
| `calc <expressão>` | Calcula uma expressão |
| `resgatar <código>` | Resgata um código de recompensa |
| `xp` / `moedas` | Mostra progresso e saldo |
| `devlog [fix\|feature\|style]` | Abre o Dev Log, opcionalmente filtrado |
| `zen` / `split` | Alterna os modos Zen e Multi-Tarefa |
| `animacoes on\|off` | Liga ou reduz as animações |
| `data` | Data e hora atuais |
| `exportar` | Baixa o progresso em JSON |
| `sobre` | Versão, número de abas e chave de armazenamento |
| `limpar` / `reset` | Limpa o terminal / apaga o progresso (com confirmação) |

## Códigos de Recompensa

| Código | Recompensa | Expira em |
| --- | --- | --- |
| `BEMVINDO` | +15 moedas, +20 XP | 31/12/2026 |
| `GEEKIE2026` | +50 moedas, +100 XP | 31/12/2026 |
| `FOCOPRO` | +40 moedas, +60 XP e tema Neon | 31/01/2027 |
| `ENEM2026` | +30 moedas, +150 XP | 30/11/2026 |
| `DEVLOG5` | +25 moedas, +25 XP | 30/06/2027 |
| `HUBV195` | +100 moedas, +50 XP e tema Matrix | 31/12/2026 |

Regras: um resgate por conta, código sem diferenciar maiúsculas de minúsculas e expiração validada na data local.

## Animações por tipo de botão

O JS identifica o tipo do elemento e atribui o efeito sozinho (`data-fx`), sem `onclick` inline.

| Tipo de botão | Efeito |
| --- | --- |
| Primário | `shine` |
| Outline | `trace` |
| Perigo | `shake` |
| Ícone | `orbit` |
| FAB | `sonar` |
| Navegação do menu | `slide` |
| Chips | `lift` |
| Filtros | `squish` |
| Botões de compra | `coin` |
| Opções do quiz | `flip` |
| Mini botões | `glint` |
| Pomodoro | `squeeze` |
| Tutorial (avançar/voltar/pular) | `nudge-right` / `nudge-left` / `fade` |
| Caracteres | `pop` |
| Núcleo do clicker | `pulse` |
| Preview de tema | `hue` |
| Cmd suggestions | `lift` |
| Comandos / terminal | `shine` + `trace` |

Animações podem ser desligadas pelo botão de movimento na topbar, pelo comando `animacoes off` ou pelo `prefers-reduced-motion` do sistema.

## Atalhos

| Atalho | Ação |
| --- | --- |
| `Ctrl+K` / `Cmd+K` | Abre a aba de Comandos |
| `Alt+Z` | Modo Zen |
| `Alt+M` | Modo Multi-Tarefa |
| `↑` / `↓` (no terminal) | Histórico de comandos |
| `Tab` (no terminal) | Completa o comando |
| `Ctrl+F5` | Recarrega ignorando cache |

## Dados e privacidade

- Progresso em `localStorage`, chave `geekieHubState_v194`.
- Contas locais em `geekieHubAccounts_v194` (senha com hash simples — não é segurança de produção).
- Comandos, recompensas e resgates rodam 100% no navegador: nenhuma requisição é enviada.
- `exportar` gera um JSON com todo o estado; `reset` (ou limpar dados do site) apaga o progresso.
