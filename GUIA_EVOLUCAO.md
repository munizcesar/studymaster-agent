# 📋 Guia de Evolução — StudyMaster Agent

> **Documento mestre de controle.** Tudo que for implementado recebe ✅. Em andamento recebe 🔄. Pendente fica em aberto. Este arquivo é atualizado a cada entrega.

---

## 🎯 Objetivo do Projeto

Construir uma plataforma educacional de geração de questões com **RAG (Retrieval-Augmented Generation)** sólido, **zero alucinação**, experiência de usuário refinada e expansão progressiva de áreas de conhecimento.

---

## 🔒 Princípios Não Negociáveis

- Nenhuma questão é gerada sem contexto RAG suficiente
- Preços, datas voláteis e informações temporais nunca aparecem no conteúdo
- O login é a **última fase** — não bloqueia nenhuma entrega anterior
- Toda expansão preserva coerência pedagógica e confiança do sistema

---

## 📱 REGRAS PERMANENTES DE MOBILE

> **Leia este bloco antes de qualquer alteração no `index.html`.** O mobile é o canal principal de acesso. Qualquer feature nova deve funcionar perfeitamente em mobile antes de funcionar no desktop.

### O formato mobile atual — NUNCA ALTERAR

O mobile usa um formato de **questão única por vez** com **bottom bar fixa de navegação**. Este formato foi escolhido intencionalmente por ser prático, funcional e focado. É o coracão do produto.

**Elementos sagrados — não tocar sem aprovação explícita:**

| Elemento | CSS / Seletor | O que faz | Restrição |
|---|---|---|---|
| Bottom bar de navegação | `.q-nav-bar` | Barra fixa (Anterior / Status / Próximo) | **NUNCA remover ou reposicionar** |
| Visibilidade da bottom bar | `@media (max-width: 1023px) { display: flex !important }` | Garante exibição no mobile | **NUNCA sobrescrever** |
| Visibilidade desktop | `@media (min-width: 1024px) { display: none !important }` | Oculta no desktop | **NUNCA remover** |
| Questão única | `#questions-list { flex-direction: column }` no mobile | Uma questão por vez | **NUNCA mudar para grid no mobile** |
| Padding inferior wizard | `.wizard-card { padding-bottom: var(--space-8); margin-bottom: var(--space-16); }` no mobile | Evita conteúdo encoberto pela bottom bar | **NUNCA reduzir** |
| Modo Foco bottom | `.qf-bottom-bar` | Barra do modo fullscreen | **NUNCA remover ou reposicionar** |

### Regras para toda feature nova no mobile

**Touch targets:**
- Todo elemento interativo novo deve ter `min-height: 44px` e `min-width: 44px` no mobile
- Padding mínimo: `padding: var(--space-3) 0` para elementos inline, `padding: var(--space-3) var(--space-4)` para blocos
- Nunca confiar apenas no tamanho visual — usar padding para ampliar a área clicável

**Layout e espaçamento:**
- Novas features com `margin-left` ou `padding-left` no desktop devem ter `margin-left: 0` no mobile (`@media (max-width: 1023px)`)
- Elementos novos devem ocupar **100% da largura** disponível no mobile
- Verificar sempre se o conteúdo no final da página não fica encoberto pela `.q-nav-bar` fixa (há `margin-bottom: var(--space-16)` no `.wizard-card` para isso)

**Feedback ao toque:**
- Todo botão/elemento interativo novo deve ter `:active { opacity: 0.7; }` ou equivalente
- Usuários mobile precisam de feedback visual imediato ao tocar — sem ele parece que o app travou

**Animações:**
- Animações no mobile devem ser mais rápidas que no desktop (`150ms` vs `200ms`)
- Sempre incluir `@media (prefers-reduced-motion: reduce)` desabilitando animações
- Nunca usar animações que causem `layout shift` (reflow) durante o scroll

**Hover → Touch:**
- Regras de `:hover` não funcionam como esperado no mobile (só disparam ao tocar e mantêr)
- Para estilos interativos visuais use `:active` no mobile
- Se uma feature usa tooltip via `:hover`, adicionar alternativa acessível via toque

**Breakpoints do projeto:**
```
Mobile:  ≤ 1023px  — @media (max-width: 1023px)
Desktop: ≥ 1024px  — @media (min-width: 1024px)
Teste reference: 375px (iPhone SE), 390px (iPhone 14)
```

### Checklist obrigatório antes de qualquer PR que toque no `index.html`

- [ ] Testei em viewport **375px** (mínimo mobile)
- [ ] A `.q-nav-bar` continua visível e não foi deslocada
- [ ] Novos elementos interativos têm `min-height: 44px` no mobile
- [ ] Novos elementos com `margin-left` no desktop têm `margin-left: 0` no mobile
- [ ] Conteúdo ao final da página não fica encoberto pela bottom bar
- [ ] Feedback `:active` implementado em todo novo botão
- [ ] `@media (prefers-reduced-motion: reduce)` respeitado
- [ ] Modo Foco (fullscreen) também funciona no mobile

---

## 🗺️ Roadmap por Fases

---

### FASE 1 — Blindagem da Base RAG

**Objetivo:** Garantir que o sistema NUNCA gere questões sem contexto confiável.

| # | Tarefa | Status |
|---|--------|--------|
| 1.1 | Score mínimo 0.75 para aceitar contexto RAG (`validateRAGScore`) | ✅ Concluído |
| 1.2 | Recusa segura (`CONTEXT_INSUFFICIENT`) quando score abaixo do mínimo | ✅ Concluído |
| 1.3 | `systemText` proibindo geração fora do contexto recuperado | ✅ Concluído |
| 1.4 | `forbiddenPatterns` por matéria (banca, prova de ano, decisão recente) | ✅ Concluído |
| 1.5 | `validateQuestionTraceability` — rastreabilidade enunciado → material | ✅ Concluído |
| 1.6 | Badge de qualidade (🟢 Alta / 🟡 Média / 🔴 Baixa) no retorno | ✅ Concluído |
| 1.7 | Instrução `CONTEXT_INSUFFICIENT` injetada no `systemText` quando contexto insuficiente | ✅ Concluído |

---

### FASE 2 — Conteúdo Evergreen

**Objetivo:** Eliminar toda informação volátil ou datada do conteúdo gerado.

| # | Tarefa | Status |
|---|--------|--------|
| 2.1 | Remover `price_range` do mapeamento de extração de posts (AchadoCerto/worker prompt) | ✅ Concluído |
| 2.2 | Substituir seção "Custo-benefício" por avaliação por perfil de uso | ✅ Concluído |
| 2.3 | CTAs redirecionando ao link do produto sem mencionar valor | ✅ Concluído |
| 2.4 | FAQ nunca responde preço — redireciona ao anúncio | ✅ Concluído |
| 2.5 | `forbiddenPatterns` bloqueando menção a versões, datas de lançamento e preços em concursos/academic | ✅ Concluído |
| 2.6 | Guideline explícito no `systemText`: "Nunca mencione preços, datas de lançamento ou versões específicas" | ✅ Concluído |

---

### FASE 3 — Qualidade das Questões

**Objetivo:** Questões bem estruturadas, equilibradas e pedagogicamente sólidas.

| # | Tarefa | Status |
|---|--------|--------|
| 3.1 | Validação de estrutura mínima (enunciado, 4 alternativas, gabarito, explicação) | ✅ Concluído |
| 3.2 | Distratores plasíveis — prompt instrui alternativas incorretas coerentes | ✅ Concluído |
| 3.3 | Nível de dificuldade variável (fácil / médio / difícil) parametrizável | ✅ Concluído |
| 3.4 | Indicação de fonte (`fonte`) em todas as questões | ✅ Concluído |
| 3.5 | Pipeline completo: RAG score → traceability → badge → entrega ao frontend | ✅ Concluído |
| 3.6 | Modo Explicação Detalhada — explicação expansível por alternativa (`optionExplanations`) | 🔄 Em andamento (PR #14) |

---

### FASE 4 — Expansão de Áreas e Coleções

**Objetivo:** Ampliar cobertura do banco vetorial.

| # | Tarefa | Status |
|---|--------|--------|
| 4.1 | Concursos: Português, Direito Constitucional, Administrativo, RLM, Informática, Adm. Pública | ✅ Configurado |
| 4.2 | Academic: Direito, Medicina, História, Exatas, Humanas, Saúde, Negócios | ✅ Configurado |
| 4.3 | Popular banco vetorial — Português (concursos) | 🔲 Pendente |
| 4.4 | Popular banco vetorial — Direito Constitucional | 🔲 Pendente |
| 4.5 | Popular banco vetorial — Direito Administrativo | 🔲 Pendente |
| 4.6 | Popular banco vetorial — Raciocínio Lógico | 🔲 Pendente |
| 4.7 | Popular banco vetorial — Informática (concursos) | 🔲 Pendente |
| 4.8 | Popular banco vetorial — todas as áreas Academic | 🔲 Pendente |

---

### FASE 5 — Interface e UX

**Objetivo:** Experiência limpa, responsiva e funcional sem login.

| # | Tarefa | Status |
|---|--------|--------|
| 5.1 | Layout mobile responsivo (375px) | ✅ Concluído |
| 5.2 | Feedback visual de carregamento (skeleton/spinner) | ✅ Concluído |
| 5.3 | Exibição do badge de qualidade (🟢🟡🔴) na interface | ✅ Concluído |
| 5.4 | Seleção de matéria/área com UI clara | ✅ Concluído |
| 5.5 | Histórico de questões respondidas na sessão (in-memory) | ✅ Concluído |
| 5.6 | Dark mode | ✅ Concluído |

---

### FASE 6 — Automação e GitHub Actions

**Objetivo:** Manutenção autônoma e alimentação contínua do banco vetorial.

| # | Tarefa | Status |
|---|--------|--------|
| 6.1 | Workflow de indexação automática de novos documentos no Vectorize | 🔲 Pendente |
| 6.2 | Workflow de health check do worker (smoke test via cron) | 🔲 Pendente |
| 6.3 | Relatório de qualidade semanal (RAG score médio por coleção) | 🔲 Pendente |

---

### FASE 7 — Autenticação e Multi-usuário *(última fase)*

**Objetivo:** Adicionar login sem quebrar nada do que foi entregue antes.

| # | Tarefa | Status |
|---|--------|--------|
| 7.1 | OAuth (Google/GitHub) via Cloudflare Access ou Workers | 🔲 Pendente |
| 7.2 | Sessões por usuário (KV Cloudflare) | 🔲 Pendente |
| 7.3 | Histórico persistente por usuário | 🔲 Pendente |
| 7.4 | Planos/tiers (free vs. premium) | 🔲 Pendente |

---

## 📌 Próximas Ações Imediatas

1. **Fase 3.6** — Aguardar merge do PR #14 (explicação expansível por alternativa)
2. **Fase 4.3** — Popular banco vetorial de Português (concursos)
3. **Fase 4.4** — Popular banco vetorial de Direito Constitucional
4. **Fase 6.1** — Workflow de indexação automática no Vectorize

---

## 📝 Log de Alterações

| Data | Fase | Descrição |
|------|------|-----------|
| 2026-05-28 | 2 | Posts evergreen: removido price_range, seção custo-benefício reformulada, CTAs atualizados |
| 2026-05-30 | 1 | GUIA_EVOLUCAO.md criado — controle centralizado de todas as fases |
| 2026-05-30 | 2, 3, 5 | Worker atualizado com guideline evergreen no systemText, distratores plasíveis, calibragem de dificuldade; guia sincronizado com frontend já entregue (mobile, skeleton, badge, histórico, dark mode) |
| 2026-05-30 | 3.6 | Implementado optionExplanations no worker (3 fluxos) + painel expansível "Por que cada alternativa?" no frontend |
| 2026-05-31 | docs | Adicionada seção REGRAS PERMANENTES DE MOBILE — documentação de elementos sagrados, checklist obrigatório e regras para features novas |

---

> Atualizar este arquivo a cada entrega. Marcar ✅ assim que a tarefa for validada em produção.
