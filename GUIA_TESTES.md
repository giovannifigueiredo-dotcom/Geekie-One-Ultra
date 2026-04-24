# 🧪 Guia Prático de Testes - IA Tutor v2.0

## 🎯 Objetivo
Testar e validar todas as melhorias implementadas na base de conhecimento da IA Tutor.

---

## ✅ Testes Recomendados

### Teste 1: Detecção Automática de Contexto

**Objetivo:** Validar que a IA detecta corretamente a disciplina da pergunta.

**Passos:**
1. Abra IA Tutor (Ctrl+9)
2. Modo: Chat (padrão)
3. Digite: `"Qual é a derivada de x²?"`

**Resultado Esperado:**
- ✅ IA detecta MATEMÁTICA
- ✅ Resposta contextualizada com termos de cálculo
- ✅ Exemplo com passo a passo
- ✅ Dica de estudo incluída

**Resultado Real:**
```
[Digite qualquer pergunta para testar]
```

---

### Teste 2: Modo Explicar com Contexto

**Objetivo:** Testar explicações estruturadas com detecção de disciplina.

**Passos:**
1. Clique em "Explicar"
2. Digite: `"Explique fotossíntese"`

**Resultado Esperado:**
- ✅ IA detecta BIOLOGIA
- ✅ Explicação estruturada em partes:
  - Conceito
  - Aplicação prática
  - Relações com outros tópicos
  - Dicas de aprendizado
- ✅ Padrão diferente a cada mensagem (não repetitivo)

**Exemplo de Padrão 1:**
```
📖 Vou explicar em detalhes sobre BIOLOGIA...
```

**Exemplo de Padrão 2:**
```
💡 Para entender melhor a fotossíntese...
```

**Resultado Real:**
```
[Envie a pergunta e observe a variação nos padrões]
```

---

### Teste 3: Modo Resumir

**Objetivo:** Testar síntese de informações complexas.

**Passos:**
1. Clique em "Resumir"
2. Digite: `"Resuma a Revolução Francesa"`

**Resultado Esperado:**
- ✅ IA detecta HISTÓRIA
- ✅ Resumo bem estruturado com:
  - Pontos principais (4-5)
  - Síntese final
  - Sugestão de mapa mental
- ✅ Linguagem concisa mas informativa

**Padrões Esperados:**
```
📌 Em resumo: ...
✅ A síntese do assunto é: ...
⚡ Os pontos essenciais são: ...
🎯 Resumindo objetivamente: ...
```

**Resultado Real:**
```
[Digite uma pergunta sobre HISTÓRIA para testar]
```

---

### Teste 4: Modo Gerar Questões

**Objetivo:** Validar geração de questões estruturadas por disciplina.

**Passos:**
1. Clique em "Gerar"
2. Digite: `"Gere questões sobre química"`

**Resultado Esperado:**
- ✅ IA detecta QUÍMICA
- ✅ Questão gerada com:
  - Pergunta clara e desafiadora
  - Instruções para responder
  - Sugestão de revisão
- ✅ Questão diferente a cada execução

**Exemplos de Questões:**
```
❓ "Como balancear uma equação química?"
❓ "O que é uma reação de oxidação-redução?"
❓ "Explique as ligações químicas"
```

**Resultado Real:**
```
[Digite e observe questões diferentes aparecerem]
```

---

### Teste 5: Novo Modo Praticar

**Objetivo:** Testar novo modo de prática estruturada.

**Passos:**
1. Clique em "Praticar" ⭐ NOVO
2. Digite: `"Vou praticar cálculo"`

**Resultado Esperado:**
- ✅ Modo ativa (botão fica destacado)
- ✅ Exercício estruturado com:
  - Problema claro
  - Passos de resolução
  - Instruções práticas
- ✅ 5 padrões diferentes de apresentação

**Padrões Esperados:**
```
🏋️ Vamos praticar: ...
⚡ Exercício dinâmico: ...
🎮 Desafio interativo: ...
📈 Melhore suas habilidades: ...
🔄 Prática repetida: ...
```

**Resultado Real:**
```
[Digite uma pergunta e observe o novo modo em ação]
```

---

### Teste 6: Novo Modo Debater

**Objetivo:** Testar novo modo de discussão crítica.

**Passos:**
1. Clique em "Debater" ⭐ NOVO
2. Digite: `"Considero que a genética é mais importante que ambiente"`

**Resultado Esperado:**
- ✅ Modo ativa (botão fica destacado)
- ✅ Debate estruturado com:
  - Reconhecimento do argumento
  - Perspectivas alternativas
  - Evidências contrapostas
  - Convite para aprofundamento
- ✅ 5 padrões acadêmicos diferentes

**Padrões Esperados:**
```
💬 Argumento apresentado: ...
⚖️ Análise comparativa: ...
🗣️ Diferentes perspectivas: ...
🎭 Visões contrapostas: ...
📣 Discussão clara: ...
```

**Resultado Real:**
```
[Digite uma opinião e veja o debate estruturado]
```

---

### Teste 7: Variação de Padrões

**Objetivo:** Validar que os padrões de resposta variam e não se repetem.

**Passos:**
1. Mantenha o modo "Explicar"
2. Digite 5 vezes seguidas: `"Explique matemática"`
3. Observe os padrões de abertura

**Resultado Esperado:**
- ✅ Cada resposta começa com padrão diferente
- ✅ Nenhuma repetição em 5 mensagens
- ✅ Padrões variados incluem emojis e linguagem

**Padrões Observados (esperado diferentes):**
```
Mensagem 1: "📖 Vou explicar em detalhes:"
Mensagem 2: "💡 Para entender melhor:"
Mensagem 3: "🎓 A explicação completa é:"
Mensagem 4: "🔍 Analisando profundamente:"
Mensagem 5: "✨ Deixe-me detalhar:"
```

**Resultado Real:**
```
[Envie múltiplas mensagens e observe a variação]
```

---

### Teste 8: Níveis de Conhecimento

**Objetivo:** Validar que o nível da IA evolui com o uso.

**Passos:**
1. Envie 25 mensagens (qualquer modo)
2. Observe o painel "IA Level"
3. Continue até 100+ mensagens

**Resultado Esperado:**
- ✅ Após 20 mensagens: "Intermediário"
- ✅ Após 50 mensagens: "Avançado"
- ✅ Após 100 mensagens: "Especialista"
- ✅ Após 200 mensagens: "Mestre"

**Painel de Status:**
```
Mensagens: 25 | XP: 125 | Modo: Chat | IA Level: Intermediário
```

**Resultado Real:**
```
[O painel atualizará conforme você enviar mensagens]
```

---

### Teste 9: Sistema de XP

**Objetivo:** Validar ganho de XP por mensagens.

**Passos:**
1. Observe XP inicial
2. Envie 5 mensagens
3. Observe XP final

**Resultado Esperado:**
- ✅ +5 XP por mensagem enviada
- ✅ Total: 25 XP para 5 mensagens
- ✅ XP Total atualiza em tempo real

**Cálculo:**
```
XP Inicial: 0
Mensagem 1: +5 = 5
Mensagem 2: +5 = 10
Mensagem 3: +5 = 15
Mensagem 4: +5 = 20
Mensagem 5: +5 = 25
```

**Resultado Real:**
```
[Veja o contador de XP aumentar]
```

---

### Teste 10: Histórico de Mensagens

**Objetivo:** Validar que o histórico carrega propostas anteriores.

**Passos:**
1. Envie 3 perguntas diferentes
2. Clique nos botões do histórico
3. Observe se a pergunta anterior aparece no campo de input

**Resultado Esperado:**
- ✅ Últimas 3 perguntas aparecem em botões
- ✅ Ao clicar, pergunta anterior aparece no input
- ✅ Botões só aparecem se houver histórico

**Resultado Real:**
```
[Envie mensagens e teste os botões de histórico]
```

---

### Teste 11: Limpeza de Chat

**Objetivo:** Validar limpeza completa do histórico.

**Passos:**
1. Envie algumas mensagens
2. Clique em "Limpar Chat"
3. Confirme o diálogo
4. Observe se o chat volta ao estado inicial

**Resultado Esperado:**
- ✅ Diálogo de confirmação aparece
- ✅ Chat é limpo completamente
- ✅ Mensagem inicial é restaurada
- ✅ Histórico é apagado

**Resultado Real:**
```
[Chat limpo com sucesso! Confira se voltou ao estado inicial]
```

---

### Teste 12: Detecção Múltipla de Contexto

**Objetivo:** Validar detecção com múltiplos keywords.

**Teste A: Matemática pura**
```
Entrada: "Como usar a regra de três?"
Esperado: Detecta MATEMÁTICA
```

**Teste B: Física aplicada**
```
Entrada: "Qual é a velocidade do objeto em movimento?"
Esperado: Detecta FÍSICA
```

**Teste C: Biologia avançada**
```
Entrada: "Explique o processo de transcrição do DNA"
Esperado: Detecta BIOLOGIA
```

**Teste D: Português gramatical**
```
Entrada: "Como identificar o verbo em uma frase?"
Esperado: Detecta PORTUGUÊS
```

**Teste E: Nenhuma detecção**
```
Entrada: "Qual é a melhor forma de aprender?"
Esperado: Modo genérico com sugestões
```

---

## 🎯 Checklist de Validação

Marque cada teste conforme completa:

### Testes Funcionais
- [ ] Teste 1: Detecção Automática
- [ ] Teste 2: Modo Explicar
- [ ] Teste 3: Modo Resumir
- [ ] Teste 4: Modo Gerar
- [ ] Teste 5: Modo Praticar (NOVO)
- [ ] Teste 6: Modo Debater (NOVO)
- [ ] Teste 7: Variação de Padrões
- [ ] Teste 8: Evolução de Níveis
- [ ] Teste 9: Sistema de XP
- [ ] Teste 10: Histórico
- [ ] Teste 11: Limpeza
- [ ] Teste 12: Detecção Múltipla

### Testes de Qualidade
- [ ] Respostas são contextualizadas?
- [ ] Não há repetição em 10 mensagens?
- [ ] Padrões variam adequadamente?
- [ ] XP calcula corretamente?
- [ ] Níveis evoluem como esperado?
- [ ] UI é responsiva?

### Testes Especiais
- [ ] Modo dark funciona?
- [ ] Atalhos de teclado funcionam?
- [ ] Mobile é responsivo?
- [ ] Todos os temas visuais compatíveis?

---

## 📊 Relatório de Teste

Após completar os testes, preencha:

**Data:** _____________  
**Testador:** _____________  
**Ambiente:** Web Browser / Mobile  
**Testes Passados:** __ / 12  
**Critérios de Qualidade:** __ / 6  

**Observações:**
```
[Escreva aqui qualquer observação ou bug encontrado]
```

**Conclusão:**
- [ ] Pronto para Produção
- [ ] Pronto com Alertas
- [ ] Precisa de Ajustes

---

## 🐛 Registro de Bugs (Se Encontrados)

### Bug #1
- **Descrição:** ___________________
- **Passos para Reproduzir:** ___________________
- **Resultado Esperado:** ___________________
- **Resultado Real:** ___________________
- **Severidade:** 🔴 Alta / 🟡 Média / 🟢 Baixa
- **Status:** Open / Closed

---

## 🎉 Conclusão

Se todos os testes passaram, sua IA Tutor v2.0 está pronta para uso em produção!

**Stats Finais Esperados:**
- ✅ 15+ disciplinas funcionando
- ✅ 100+ questões disponíveis
- ✅ 6 modos operacionais
- ✅ Detecção inteligente ativa
- ✅ Padrões variados em uso
- ✅ XP e Níveis calculando corretamente

---

**Happy Testing! 🚀** 

Para dúvidas, consulte:
- IA_TUTOR_TESTE.md
- MELHORIAS_IA_KNOWLEDGE.md
- IA_KNOWLEDGE_BASE.js
