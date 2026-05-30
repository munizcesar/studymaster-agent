# 📋 FASE 2 — P1 ROADMAP (Próxima Sessão)

## 🎯 Objetivos P1

Implementar 3 funcionalidades importantes que melhoram experiência diária:

```
P1 = 2.4 Histórico + 2.2.2 Erro Amigável + 2.5.1 Contraste
```

---

## 📌 2.4 Histórico de Sessão (Importante)

### O que é?
Track em-memory das respostas do usuário durante uma sessão.

### Requisitos
- [ ] **2.4.1** Array `state.sessionHistory` para guardar questões respondidas
- [ ] **2.4.2** Mostrar placar: "X acertos / Y questões"
- [ ] **2.4.3** Score bar atualizada em tempo real após cada resposta
- [ ] **2.4.4** Botão "Nova sessão" reseta tudo
- [ ] **2.4.5** Mostrar score % final ao terminar

### Implementação Técnica

```javascript
// Estado
state.sessionHistory = {
  totalQuestions: 0,
  correct: 0,
  wrong: 0,
  answers: [],
};

// Ao responder
function recordAnswer(questionId, selectedKey, correctKey) {
  const isCorrect = selectedKey === correctKey;
  state.sessionHistory.correct += isCorrect ? 1 : 0;
  state.sessionHistory.wrong += isCorrect ? 0 : 1;
  state.sessionHistory.answers.push({
    questionId,
    selected: selectedKey,
    correct: correctKey,
    result: isCorrect,
  });
  updateScoreBar();
}

// Atualizar UI
function updateScoreBar() {
  const total = state.sessionHistory.correct + state.sessionHistory.wrong;
  const percent = total ? Math.round(100 * state.sessionHistory.correct / total) : 0;
  document.getElementById('score-value').textContent = 
    `${state.sessionHistory.correct}/${total}`;
  document.getElementById('score-fill').style.width = `${percent}%`;
}
```

### HTML/CSS Esperado

```html
<!-- Score bar (já existe, precisa atualizar) -->
<div class="score-bar" id="score-bar">
  <span class="score-label">Progresso</span>
  <div class="score-progress">
    <div class="score-fill" id="score-fill" style="width: 35%;"></div>
  </div>
  <span class="score-value" id="score-value">7/20</span>
</div>

<!-- Resultado final (ao terminar) -->
<div id="session-result" class="session-result visible">
  <h3>Resultado da Sessão</h3>
  <div class="session-stats">
    <div class="stat">
      <span class="stat-label">Acertos</span>
      <span class="stat-value">14</span>
    </div>
    <div class="stat">
      <span class="stat-label">Erros</span>
      <span class="stat-value">6</span>
    </div>
    <div class="stat">
      <span class="stat-label">Percentual</span>
      <span class="stat-value">70%</span>
    </div>
  </div>
  <button id="retry-wrong-btn">Refazer Somente as Erradas</button>
  <button id="new-session-btn">Nova Sessão</button>
</div>
```

### CSS Novo

```css
.session-result {
  padding: var(--space-6);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  text-align: center;
}

.session-stats {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--space-4);
  margin: var(--space-4) 0;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  font-weight: 500;
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: 800;
  color: var(--color-primary);
}
```

---

## 📌 2.2.2-2.2.3 Erro Amigável (Importante)

### O que é?
Melhorar mensagem de erro para ser user-friendly (sem stack traces).

### Requisitos
- [ ] **2.2.2** Remover stack traces / detalhes técnicos
- [ ] **2.2.3** Mensagem clara em português
- [ ] Botão "Tentar novamente" bem visível
- [ ] Suggestionbox "E se o problema persistir…"

### Implementação Técnica

```javascript
// Função de erro melhorada
function showError(context = 'gerar questões') {
  const errorMsgs = {
    'gerar questões': 'Não foi possível gerar suas questões no momento.',
    'conectar': 'Problema de conexão. Verifique sua internet.',
    'timeout': 'A requisição demorou muito. Tente novamente.',
    'unknown': 'Algo inesperado aconteceu. Estamos investigando.',
  };
  
  const msg = errorMsgs[context] || errorMsgs.unknown;
  const errorEl = document.getElementById('error-screen');
  const errorMsgEl = document.getElementById('error-msg');
  
  errorMsgEl.textContent = msg;
  errorEl.classList.add('visible');
  
  // Log silencioso (sem expor para user)
  console.error(`Error context: ${context}`);
}
```

### HTML Esperado

```html
<div class="error-screen" id="error-screen">
  <div class="error-icon">
    <i data-lucide="alert-triangle" width="48" height="48"></i>
  </div>
  <h3 style="margin-bottom: var(--space-2);">
    Oops! Algo deu errado
  </h3>
  <p class="error-msg" id="error-msg">
    Não foi possível gerar suas questões no momento.
  </p>
  
  <!-- Novo: Sugestões -->
  <div class="error-suggestions">
    <p><strong>Tente:</strong></p>
    <ul>
      <li>Verificar sua conexão com a internet</li>
      <li>Aguardar alguns segundos e tentar novamente</li>
      <li>Recarregar a página (F5)</li>
    </ul>
  </div>
  
  <button class="btn-primary" id="retry-btn">
    <i data-lucide="refresh-cw" width="16" height="16"></i>
    Tentar novamente
  </button>
</div>
```

### CSS Novo

```css
.error-suggestions {
  background: var(--color-surface-offset);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  margin: var(--space-4) 0;
  text-align: left;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.error-suggestions p {
  margin-bottom: var(--space-2);
}

.error-suggestions ul {
  list-style: none;
  padding-left: var(--space-3);
}

.error-suggestions li {
  margin-bottom: var(--space-1);
  padding-left: var(--space-3);
  position: relative;
}

.error-suggestions li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: var(--color-primary);
}
```

---

## 📌 2.5.1 Contraste WCAG AA (Importante)

### O que é?
Garantir que todo texto atenda o padrão de contraste mínimo.

### Requisitos WCAG AA
- **Texto normal:** Mínimo 4.5:1
- **Texto grande (18pt+):** Mínimo 3:1

### Como Validar

**Ferramenta:** axe DevTools (extensão browser)
```
1. Instalar: https://chrome.google.com/webstore/... (axe DevTools)
2. Abrir DevTools → aba "axe DevTools"
3. Clicar "Scan this page"
4. Ver resultados de contraste
```

### Cores Críticas a Verificar

```css
/* Verificar contraste de todos estes */
--color-text: #1f1f1f (preto escuro)
--color-text-muted: #666666 (cinza médio)
--color-text-faint: #999999 (cinza claro)

--color-primary: #5B5BD6 (roxo)
--color-accent: #F97316 (laranja)
--color-success: #16a34a (verde)
--color-error: #dc2626 (vermelho)
```

### Ajustes Esperados

Se contraste < 4.5:1, escurecer ou clarear:

```css
/* Exemplo: se --color-text-muted está com baixo contraste */
/* Antes */
color: var(--color-text-muted); /* #999999 */

/* Depois */
color: #555555; /* Mais escuro, mais contraste */
```

---

## 🔄 Ordem de Implementação Recomendada

```
1️⃣ 2.4 Histórico de Sessão (Mais impacto visual)
   └─ Array + updateScoreBar() + Resultado Final
   
2️⃣ 2.2.2-2.2.3 Erro Amigável (Rápido de fazer)
   └─ Mensagens + Sugestões + UI
   
3️⃣ 2.5.1 Contraste WCAG AA (Pode levar mais tempo)
   └─ Audit completo + Ajustes de cores
```

---

## 📊 Estatísticas Estimadas P1

| Item | Linhas CSS | Linhas JS | Tempo |
|------|-----------|-----------|-------|
| 2.4 Histórico | 20 | 50 | 30 min |
| 2.2.2-2.2.3 Erro | 15 | 15 | 20 min |
| 2.5.1 Contraste | 5-20 | 0 | 15 min |
| **Total** | **40-55** | **65** | **65 min** |

---

## 🎯 Definição de Pronto (DoD)

Para considerar P1 completo:

- [ ] Placar atualiza em tempo real após cada resposta
- [ ] Resultado final mostra ao terminar todas questões
- [ ] Erro exibe mensagem amigável (sem stack trace)
- [ ] Sugestões aparecem na tela de erro
- [ ] Todas cores passam no contraste WCAG AA
- [ ] Nenhum console.error ao carregar/responder
- [ ] Testes em desktop + mobile (375px)

---

## 📌 Notas de Desenvolvimento

1. **sessionHistory:** Viver apenas em `state`, reseta ao "Nova sessão"
2. **Score bar:** Já existe HTML, apenas atualizar via JS
3. **Erro:** Usar classes existentes `.error-screen`, `.error-msg`
4. **Contraste:** Pode exigir ajuste de cores existentes (testar bem)

---

## 🚀 Link para Próxima Sessão

```
Iniciar com:
1. Criar state.sessionHistory
2. Adicionar recordAnswer() ao addEventListener de opção
3. Chamar updateScoreBar() após cada resposta
4. Mostrar resultado final quando answered === total
```

---

**Status:** Ready for P1 implementation  
**Estimado:** 1-2 horas de trabalho  
**Dificuldade:** Média ⭐⭐  

Vamos para Fase 2.P1! 🚀
