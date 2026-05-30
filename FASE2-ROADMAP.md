# 🚀 FASE 2 — ROADMAP DE IMPLEMENTAÇÃO

**Data Início:** 2026-05-30  
**Status:** Iniciando  
**Duração Estimada:** 2-3 sessões

---

## 📋 Checklist de Itens

### ✅ 2.1 Mobile-first (375px) — CRÍTICO
- [ ] **2.1.1** Testar layout em 375px (mín. esperado)
- [ ] **2.1.2** Botões com 44x44px (touch targets)
- [ ] **2.1.3** Sem scroll horizontal em mobile
- [ ] **2.1.4** Cards de questões fluem verticalmente em mobile
- [ ] **2.1.5** Header responsivo (logo minimizado <480px)

### ✅ 2.2 Estados de Loading e Erro — CRÍTICO
- [ ] **2.2.1** Skeleton loader com 3-4 blocos de placeholder
- [ ] **2.2.2** Animação de pulse nos skeletons
- [ ] **2.2.3** Mensagem de erro amigável (SEM stack trace)
- [ ] **2.2.4** Botão "Tentar novamente" em erro
- [ ] **2.2.5** Empty state quando nenhuma questão

### ✅ 2.3 Badge de Qualidade Visível — IMPORTANTE
- [ ] **2.3.1** Exibir `_qualityBadge` (🟢🟡🔴) sob cada questão
- [ ] **2.3.2** Tooltip explicando badge (hover)
- [ ] **2.3.3** Estilo visual diferenciado por cor
- [ ] **2.3.4** Incluir score % do badge

### ✅ 2.4 Histórico de Sessão — IMPORTANTE
- [ ] **2.4.1** Array in-memory para questões respondidas
- [ ] **2.4.2** Contador: "X acertos / Y questões"
- [ ] **2.4.3** Placar atualizado em tempo real
- [ ] **2.4.4** Botão "Nova sessão" reseta tudo
- [ ] **2.4.5** Mostrar score % final ao terminar

### ✅ 2.5 Acessibilidade Básica — IMPORTANTE
- [ ] **2.5.1** Contraste WCAG AA em todos os textos
- [ ] **2.5.2** `aria-label` em botões de ícone
- [ ] **2.5.3** Navegação por Tab/Enter/Space completa
- [ ] **2.5.4** Focus outline visível
- [ ] **2.5.5** Elementos interativos escaneáveis por screen readers

---

## 🎯 Priorização

### P0 (Crítico) — Deve terminar hoje
1. **2.2.1** — Skeleton loader
2. **2.1.1-2.1.3** — Mobile-first básico
3. **2.3.1** — Exibir badge de qualidade

### P1 (Importante) — Próximas horas
1. **2.4.1-2.4.3** — Histórico em-memory
2. **2.2.2-2.2.3** — Erro amigável
3. **2.5.1** — Contraste WCAG AA

### P2 (Nice-to-have) — Sessão posterior
1. **2.5.2-2.5.5** — Acessibilidade completa
2. Refinamentos de UX

---

## 📊 Estatísticas Esperadas

| Métrica | Alvo |
|---------|------|
| Tempo para gerar questões (skeleton visível) | 100ms |
| Taxa de erro tratado humanamente | 100% |
| Questões com badge visível | 100% |
| Touchability score (44x44px) | 95%+ |
| Contraste WCAG AA | 100% |

---

## 🔧 Implementações Técnicas

### Skeleton Loader (CSS)
```css
.skeleton {
  animation: pulse 1.5s ease-in-out infinite;
  background: linear-gradient(90deg, var(--color-surface-offset) 0%, var(--color-surface) 50%, var(--color-surface-offset) 100%);
  background-size: 200% 100%;
}

@keyframes pulse {
  0%, 100% { background-position: 200% 0; }
  50% { background-position: -200% 0; }
}
```

### Badge de Qualidade (Inline)
```html
<div class="quality-badge" data-confidence="Alta">
  <span class="badge-emoji">🟢</span>
  <div class="badge-info">
    <strong>Alta confiança</strong>
    <span class="badge-tooltip">Fundamentada em múltiplos trechos do material</span>
  </div>
  <span class="badge-score">92%</span>
</div>
```

### Histórico de Sessão (JS)
```javascript
state.sessionHistory = {
  questions: [],
  answers: [],
  correct: 0,
  total: 0,
};

function addToHistory(qId, userAnswer, correct) {
  state.sessionHistory.questions.push(qId);
  state.sessionHistory.answers.push({ qId, userAnswer, correct });
  state.sessionHistory.correct += correct ? 1 : 0;
  state.sessionHistory.total += 1;
  updateScoreBar();
}
```

---

## 📁 Arquivos a Modificar

1. **index.html**
   - Adicionar skeleton loader
   - Adicionar badge de qualidade
   - Melhorar media queries para 375px
   - Adicionar aria-labels

2. **JavaScript (inline em index.html)**
   - Função para renderizar skeleton
   - Função para exibir badge
   - Função para atualizar histórico
   - Função para calcular score

---

## ✨ Exemplo de Fluxo Melhorado

```
Usuário clica "Continuar"
  ↓
Tela de loading com skeleton (spinner + 3 placeholders)
  ↓
Worker gera questões (2-5 segundos)
  ↓
Questões aparecem com _qualityBadge
  ↓
Usuário responde (onclick, sem page reload)
  ↓
Score atualizado em tempo real
  ↓
Badge visual indica confiança (🟢🟡🔴)
  ↓
Ao terminar: placar final + opções (refazer/novo quiz)
```

---

## 🎯 Métricas de Sucesso Fase 2

- ✅ Sem erros de console em mobile (375px)
- ✅ Loading state visível antes de questões aparecer
- ✅ Badge de qualidade em 100% das questões
- ✅ Histórico atualizado após cada resposta
- ✅ Contraste mínimo AA em 100% dos textos
- ✅ Navegação por teclado funcional

---

**Próximo:** Iniciar com Skeleton Loader (2.2.1) e Mobile-first ajustes (2.1)
