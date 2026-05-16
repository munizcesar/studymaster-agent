# ANÁLISE DO SISTEMA DE CLIQUE NAS OPÇÕES (Option-btn)

## RESUMO EXECUTIVO

Há **dois sistemas de renderização de questões** completamente diferentes:
1. **Desktop (>=1024px)**: renderAllQuestionsDesktop() - Todas as questões em uma página
2. **Mobile (<1024px)**: renderSingleQuestion() - Uma questão por vez

O problema no Desktop pode estar relacionado a:
- Conflito entre as classes CSS .selected e como elas são gerenciadas
- Event listeners não sendo removidos ao responder
- Problema na busca de elementos no DOM quando há múltiplas questões

---

## 1. CSS QUE CONTROLA A APARÊNCIA DAS OPÇÕES MARCADAS

### Classes CSS Principais:

#### A. Classe .option-btn.selected (Antes de responder)
Linhas do CSS: NÃO há definição explícita em .option-btn.selected
Usa apenas: background: var(--color-surface-offset);

**PROBLEMA: A classe .selected SEM estilos explícitos!**
- Não há .option-btn.selected { ... } definido
- No Fullscreen Mode há .qf-option.selected (Linhas 879-888)
- Mas na página normal NÃO há equivalente

#### B. Classe .option-btn.correct (Resposta correta)
Linhas: 484-485
Estilos:
- border-color: var(--color-success); (Verde)
- background: rgba(22, 163, 74, 0.08); (Fundo verde translúcido)
- .option-key: background verde + color white

#### C. Classe .option-btn.wrong (Resposta errada)
Linhas: 486-487
Estilos:
- border-color: var(--color-error); (Vermelho)
- background: rgba(192, 57, 43, 0.08); (Fundo vermelho translúcido)
- opacity: 0.85; (Levemente transparente)
- .option-key: background vermelho + color white

---

## 2. JAVASCRIPT QUE ADICIONA/REMOVE CLASSES

### Modo Desktop: renderAllQuestionsDesktop() (Linhas 2915-2980)

#### Renderização Inicial (HTML template) - Linhas 2939-2944:
- Se hasAnswered: aplica .correct ou .wrong
- Senão se selectedKey === opt.key: aplica .selected
- HTML renderizado com: class="option-btn"

#### Event Listeners (Linhas 2961-2968):
onclick listener:
1. Remove .selected de TODAS as opções da questão
2. Adiciona .selected ao botão clicado
3. Salva em qNavState.selected[idx]
4. Habilita botão Resolver

#### Ao Resolver (Linhas 2996-3001):
1. Desabilita todos os botões
2. Remove classe .selected
3. Adiciona .correct se resposta correta
4. Adiciona .wrong se resposta errada

### Modo Mobile: renderSingleQuestion() (Linhas 3017-3094)

Segue **exatamente o mesmo padrão**:
- Linhas 3039-3041: Define classe .selected
- Linhas 3071-3077: Clique remove .selected e adiciona em novo
- Linhas 3110-3115: Ao responder, adiciona .correct ou .wrong

---

## 3. POR QUE PODE NÃO ESTAR FUNCIONANDO EM DESKTOP

### Problema 1: Classes CSS .selected SEM estilos visuais
**CRÍTICO** - A classe .option-btn.selected não tem CSS!
- No Fullscreen (.qf-option.selected) há: border-color, background, etc
- Na página normal: NÃO há .option-btn.selected { ... }
- Resultado: Opção marcada não aparenta visualmente selecionada

### Problema 2: Múltiplos Event Listeners
Linhas 2960-2968:
- Verifica if (!qNavState.results[idx])
- Se for chamado multiple times: MÚLTIPLOS listeners no mesmo botão
- Cada clique ativa TODOS os listeners anteriores
- Comportamento imprevisível

### Problema 3: Estado Não Resetado no Resize
Se usuário redimensiona de mobile (800px) para desktop (1200px):
- qNavState.results pode estar parcialmente preenchido
- qNavState.selected pode ter estado inconsistente
- Causa: renderAllQuestionsDesktop() chamado sem resetar estado

### Problema 4: Seletor DOM Está Correto Mas...
Linhas 2956 e 2963 usam: [data-question-idx=""].option-btn
- Seletor ESTÁ correto (específico por questão)
- Mas múltiplos listeners ainda podem ser problema

---

## 4. MELHOR FORMA DE CORRIGIR

### CORREÇÃO 1: Adicionar CSS para .option-btn.selected (CRÍTICO)
Adicionar após linha 487:

`css
.option-btn.selected {
  border-color: var(--color-primary);
  background: oklch(from var(--color-primary) l c h / 0.05);
}
.option-btn.selected .option-key {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
`

### CORREÇÃO 2: Evitar Múltiplos Event Listeners
Modificar função renderAllQuestionsDesktop() (Linhas 2954-2979):

Estratégia: Usar clonning para remover listeners antigos:

`javascript
questions.forEach((q, idx) => {
  const opts = list.querySelectorAll([data-question-idx=""].option-btn);
  const resBtn = document.getElementById(q-resolver-);
  
  if (!qNavState.results[idx]) {
    opts.forEach(btn => {
      // Clonar para remover listeners antigos
      const newBtn = btn.cloneNode(true);
      btn.replaceWith(newBtn);
      
      newBtn.addEventListener('click', () => {
        if (qNavState.results[idx]) return; // Guard extra
        const allOptsForQuestion = list.querySelectorAll([data-question-idx=""].option-btn);
        allOptsForQuestion.forEach(b => b.classList.remove('selected'));
        newBtn.classList.add('selected');
        qNavState.selected[idx] = newBtn.dataset.key;
        if (resBtn) resBtn.disabled = false;
      });
    });
    
    if (resBtn) {
      const newResBtn = resBtn.cloneNode(true);
      resBtn.replaceWith(newResBtn);
      newResBtn.addEventListener('click', () => {
        const sKey = qNavState.selected[idx];
        if (!sKey) return;
        handleDesktopAnswer(questions, idx, sKey);
      });
    }
  }
});
`

### CORREÇÃO 3: Resetar Estado ao Recarregar
Na função renderQuestions() (Linhas 2872-2876):

Adicionar LOGO DEPOIS da inicialização:

`javascript
qNavState = {
  currentIdx: 0,
  selected: new Array(questions.length).fill(null),
  results:  new Array(questions.length).fill(null),
};

// NOVO: Limpar HTML anterior (importante no resize)
const list = document.getElementById('questions-list');
list.innerHTML = '';
`

### CORREÇÃO 4: Melhorar Detecção de Resize
Linhas 3573-3584:

Adicionar reset de estado:

`javascript
if (qContainer && qContainer.classList.contains('visible') && currentMode !== lastViewportMode) {
  lastViewportMode = currentMode;
  
  // NOVO: Resetar estado antes de re-renderizar
  qNavState = {
    currentIdx: 0,
    selected: new Array(state.generatedQuestions.length).fill(null),
    results: new Array(state.generatedQuestions.length).fill(null),
  };
  
  if (isDesktop) {
    renderAllQuestionsDesktop(state.generatedQuestions);
  } else {
    renderSingleQuestion(state.generatedQuestions, qNavState.currentIdx);
  }
  lucide.createIcons();
}
`

---

## RESUMO TABULAR

Problema                               | Severidade | Impacto
---------------------------------------|-----------|----------
.option-btn.selected SEM CSS           | CRÍTICO   | Opção marcada não aparenta visualmente
Múltiplos event listeners              | ALTO      | Comportamento inconsistente
Estado não resetado no resize          | MÉDIO     | Questões erradas marcadas
Inconsistência normal vs fullscreen    | MÉDIO     | Experiência diferente

---

## LINHAS ESPECÍFICAS AFETADAS

renderAllQuestionsDesktop():
- 2939-2941: Renderização da classe (verificar logic)
- 2960-2968: Event listeners (múltiplos listeners?)
- 2996-3001: Aplicação de .correct/.wrong

renderSingleQuestion():
- 3039-3041: Renderização da classe
- 3071-3077: Event listeners
- 3110-3115: Aplicação de .correct/.wrong

CSS:
- 449-496: .option-btn styles
- NÃO HÁ: .option-btn.selected { ... } (ADICIONAR!)
- 879-888: .qf-option.selected (fullscreen - USAR COMO REFERÊNCIA)

