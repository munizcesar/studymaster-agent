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
| 3.2 | Distratores plausíveis — prompt instrui alternativas incorretas coerentes | ✅ Concluído |
| 3.3 | Nível de dificuldade variável (fácil / médio / difícil) parametrizável | ✅ Concluído |
| 3.4 | Indicação de fonte (`fonte`) em todas as questões | ✅ Concluído |
| 3.5 | Pipeline completo: RAG score → traceability → badge → entrega ao frontend | ✅ Concluído |
| 3.6 | Modo Explicação Detalhada — explicação expansível por alternativa | 🔲 Pendente |

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

1. **Fase 3.6** — Implementar Modo Explicação Detalhada por alternativa
2. **Fase 4.3** — Popular banco vetorial de Português (concursos)
3. **Fase 4.4** — Popular banco vetorial de Direito Constitucional
4. **Fase 6.1** — Workflow de indexação automática no Vectorize

---

## 📝 Log de Alterações

| Data | Fase | Descrição |
|------|------|-----------|
| 2026-05-28 | 2 | Posts evergreen: removido price_range, seção custo-benefício reformulada, CTAs atualizados |
| 2026-05-30 | 1 | GUIA_EVOLUCAO.md criado — controle centralizado de todas as fases |
| 2026-05-30 | 2, 3, 5 | Worker atualizado com guideline evergreen no systemText, distratores plausíveis, calibragem de dificuldade; guia sincronizado com frontend já entregue (mobile, skeleton, badge, histórico, dark mode) |

---

> Atualizar este arquivo a cada entrega. Marcar ✅ assim que a tarefa for validada em produção.
