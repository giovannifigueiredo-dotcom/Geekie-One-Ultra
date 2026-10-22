# Geekie Study Hub

**Versão:** 19.1.0  
**Idioma da interface:** português do Brasil

O Geekie Study Hub reúne ferramentas de estudo, organização e personalização em uma página web. Esta entrega contém a estrutura, os estilos, o comportamento e este guia.

## Arquivos

- `index.html` — conteúdo e estrutura das abas.
- `style.css` — tema, layout, animações e adaptação para telas menores.
- `script.js` — navegação, ferramentas, interações e salvamento das preferências.

Mantenha os três arquivos da página na mesma pasta: o HTML carrega `style.css` e `script.js` por esses nomes.

## Tecnologias

- **HTML5** para a estrutura da página.
- **CSS3** para o visual, os efeitos e o layout responsivo.
- **JavaScript (ES6+) sem framework** para a lógica no navegador.
- **APIs do navegador** usadas por recursos como armazenamento local, área de transferência, áudio e síntese de voz.
- **Fontes do Google Fonts** e **Font Awesome 6.4** carregados externamente para tipografia e ícones.

## Como abrir e usar

1. Extraia ou copie os quatro arquivos desta entrega para a mesma pasta.
2. Abra `index.html` em um navegador moderno. Para melhor compatibilidade com a área de transferência e recursos do navegador, use HTTPS ou um servidor local.
3. Na tela inicial, entre como convidado ou use o formulário de acesso.
4. Abra o menu flutuante de navegação para escolher uma aba. O hub inclui, entre outras, Portal Geekie, Tutor IA, Notas, Pomodoro, Metas, Flashcards, Pesquisa, Estatísticas e Caracteres.
5. Em cada aba, use os controles e botões disponíveis. Algumas ferramentas dependem de permissões do navegador ou de conexão com a internet.

### Biblioteca de Caracteres

- Acesse **Caracteres Úteis** no menu flutuante.
- A biblioteca reúne **1.919 símbolos únicos**, distribuídos em **24 grupos** e **77 categorias**.
- Pesquise por um símbolo, pelo nome de uma categoria/grupo ou por código hexadecimal Unicode, como `U+1F600`.
- Clique em um símbolo para copiá-lo. Use a estrela no canto do cartão para adicioná-lo ou removê-lo dos favoritos.
- Os filtros selecionam grupos; os botões permitem expandir/recolher categorias, copiar os itens visíveis ou sortear um símbolo.
- O histórico mostra símbolos copiados recentemente. Clique em um item para copiá-lo de novo.
- Clique com o botão direito em um símbolo para adicioná-lo ao montador de snippet; use os controles do montador para copiar, desfazer ou limpar a sequência.

## Cinco atualizações mais recentes

1. **v19.1.0 — 22 Out 2026 · Biblioteca Unicode expandida:** catálogo ampliado de 712 para 1.919 símbolos únicos; novos alfabetos e sistemas de escrita, matemática avançada, setas, molduras, blocos, Braille, emojis e bandeiras. A busca por código, a contagem sem duplicatas, o sorteio e os controles de favoritos foram aprimorados.
2. **v19.0.0 — 19 Out 2026 · Feature Pack Total:** um novo recurso em cada aba e uma revisão das animações dos botões, com suporte a movimento reduzido.
3. **v18.3.0 — 05 Out 2026 · Mais espaço para os portais:** iframes priorizados, painéis recolhíveis nas abas Geekie e Google e ajustes de interação e animação.
4. **v18.1.0 — 18 Set 2026 · Modo Multi-Tarefa:** divisão de tela para manter o Portal Geekie e outra aba abertos lado a lado, com painel redimensionável e estado salvo no navegador.
5. **v18.0.1 — 18 Set 2026 · Correção do layout do portal:** painel do Cockpit recolhível, mais espaço para o iframe, barra de contexto compacta e ajustes para telas menores.

## Dados e compatibilidade

Preferências, favoritos, histórico e outros dados locais ficam no armazenamento do navegador (`localStorage`) deste perfil de navegador. Eles não são automaticamente sincronizados entre dispositivos. Limpar os dados do site no navegador pode removê-los.

O Portal Geekie, as fontes e os ícones são carregados de serviços externos; a página precisa de internet para esses conteúdos. O navegador também pode solicitar permissão para copiar texto ou usar recursos de áudio.
