# 🧭 StudyMaster — Guia Mestre de Evolução

> Documento de controle vivo. Cada item implementado recebe ✅. Nada avança sem estar registrado aqui.

---

## 📋 Regras do Guia

- Toda mudança no `worker.js`, frontend ou banco de dados é documentada aqui **antes** de ser commitada
- Fases são sequenciais — não iniciar a próxima sem concluir ≥ 80% da anterior
- Itens marcados como `🔒 BLOQUEADO` só são desbloqueados quando o item predecessor estiver ✅
- A seção **Log de Commits** registra o SHA de cada entrega para rastreabilidade total

---

## 🗺️ Visão Geral das Fases

| Fase | Nome | Status |
|------|------|--------|
| 1 | Blindagem da Base (Anti-alucinação) | 🟡 Em andamento |
| 2 | Qualidade de Conteúdo (Prompts + Validação) | 🔒 Bloqueado |
| 3 | Expansão de Matérias e Coleções Vectorize | 🔒 Bloqueado |
| 4 | UX e Interface Evergreen | 🔒 Bloqueado |
| 5 | Monetização e Analytics | 🔒 Bloqueado |
| 6 | Multi-usuário e Login | 🔒 Bloqueado (última fase) |

---

## ✅ FASE 1 — Blindagem da Base (Anti-alucinação)

> Objetivo: Garantir que nenhuma questão seja gerada fora do contexto indexado.
> Critério de conclusão: 0 questões geradas sem RAG válido em 20 testes consecutivos.

### 1.1 Score Mínimo de Similaridade

- [x] Função `validateRAGScore()` implementada com `minScore = 0.75`
- [x] Retorna `RAG_EMPTY` quando não há matches
- [x] Retorna `RAG_LOW_CONFIDENCE` quando score médio < 0.75
- [ ] **Score configurável por matéria** (cada filtro define seu próprio `minScore`)
- [ ] **Log estruturado** de rejeições por score baixo (campo `ragRejectLog` na resposta)

### 1.2 Recusa Segura (Safe Refusal)

- [x] Fallback message configurada em `CONCURSOS_CONFIG.fallbackMessage`
- [x] Fallback message configurada em `ACADEMIC_CONFIG.fallbackMessage`
- [ ] **Resposta de recusa padronizada** — retornar JSON com `{ refused: true, reason, suggestion }` em vez de string solta
- [ ] **Sugestão de matéria alternativa** quando a solicitada não tem contexto suficiente
- [ ] **Contador de recusas** por sessão (para analytics futuro)

### 1.3 Prompt Restrito ao Contexto

- [x] Contexto Vectorize injetado no prompt via `fetchVectorizeContext()`
- [x] `validateQuestionTraceability()` verifica cobertura de termos (≥ 30%)
- [ ] **Cobertura mínima elevada de 30% para 45%** nos modos concurso e academic
- [ ] **Instrução explícita no system prompt**: "Use APENAS o contexto abaixo. Se o contexto for insuficiente, recuse."
- [ ] **Bloco de contexto delimitado** no prompt com tags `<CONTEXT>...</CONTEXT>`

### 1.4 Padrões Proibidos (Forbidden Patterns)

- [x] `forbiddenPatterns` definidos por matéria em `CONCURSOS_CONFIG` e `ACADEMIC_CONFIG`
- [x] `validateAgainstHallucination()` detecta e remove padrões proibidos
- [ ] **Padrões proibidos globais** (aplicáveis a todas as matérias, sem duplicação)
- [ ] **Teste unitário** de cada pattern com casos positivos e negativos

### 1.5 Pipeline de Validação

- [x] `validateQuestionPipeline()` encadeia Camadas 1, 3 e 4
- [x] `generateQualityBadge()` gera badge 🟢/🟡/🔴
- [ ] **Camada 2 implementada**: verificar se a resposta correta é única e inequívoca
- [ ] **Retry automático** (1 tentativa) quando pipeline rejeita, com prompt reforçado
- [ ] **Metadados de validação** expostos no response JSON para debug

---

## 🔒 FASE 2 — Qualidade de Conteúdo (desbloqueada após Fase 1 ≥ 80%)

### 2.1 System Prompts por Modo
- [ ] Prompt especializado para `concursos` (foco em questões objetivas CESPE/FCC)
- [ ] Prompt especializado para `academic` (foco em raciocínio e conceitos)
- [ ] Prompt especializado para `flashcard` (foco em memorização)
- [ ] Versionamento de prompts (cada prompt tem versão e data)

### 2.2 Dificuldade Dinâmica
- [ ] Parâmetro `difficulty: easy|medium|hard` recebido do frontend
- [ ] Instrução de dificuldade injetada no prompt
- [ ] Badge de dificuldade no retorno

### 2.3 Explicações Enriquecidas
- [ ] Explicação sempre referencia o trecho do contexto que a fundamenta
- [ ] Citação do artigo/lei quando aplicável (ex: "Conforme Art. 5º CF/88...")
- [ ] Remoção de explicações genéricas (< 60 chars após limpeza)

---

## 🔒 FASE 3 — Expansão de Matérias e Coleções Vectorize

### 3.1 Novas Coleções
- [ ] Indexar conteúdo para `concursos_portugues`
- [ ] Indexar conteúdo para `concursos_direito_constitucional`
- [ ] Indexar conteúdo para `concursos_direito_administrativo`
- [ ] Indexar conteúdo para `concursos_rlm`
- [ ] Indexar conteúdo para `concursos_informatica`
- [ ] Indexar conteúdo para `concursos_adm_publica`

### 3.2 Health Check de Coleções
- [ ] Endpoint `GET /health` que retorna status de cada coleção (quantos vetores indexados)
- [ ] Alerta quando coleção tem < 50 vetores

---

## 🔒 FASE 4 — UX e Interface Evergreen

### 4.1 Seção de Preços
- [x] Removida referência a preços fixos dos posts
- [x] CTAs redirecionam para link externo ("ver condições atuais")
- [ ] Template de CTA padrão implementado no frontend
- [ ] Nenhum número de preço hardcoded no HTML

### 4.2 Interface Responsiva
- [ ] Mobile-first verificado em 375px
- [ ] Touch targets ≥ 44px em todos os botões
- [ ] Dark mode funcional

---

## 🔒 FASE 5 — Monetização e Analytics

- [ ] Contador de questões geradas por sessão
- [ ] Evento enviado ao GA4 a cada questão gerada
- [ ] Funil: seleção de matéria → geração → resposta → acerto/erro

---

## 🔒 FASE 6 — Multi-usuário e Login (ÚLTIMA FASE)

> ⚠️ Esta fase só começa após todas as anteriores estarem ≥ 90% concluídas.

- [ ] OAuth (Google)
- [ ] Histórico de questões por usuário
- [ ] Progresso e estatísticas de acertos
- [ ] Plano gratuito vs. premium

---

## 📝 Log de Commits

| Data | Fase | Descrição | SHA |
|------|------|-----------|-----|
| 2026-05-30 | 1 | Guia mestre criado, Fase 1 mapeada | _(este commit)_ |

---

## 🔧 Próximos 3 itens a implementar (Fase 1)

1. **Score configurável por matéria** — cada filtro define `minScore` próprio no config
2. **Cobertura mínima 30% → 45%** — ajuste em `validateQuestionTraceability()`
3. **Instrução explícita no system prompt** — bloco `<CONTEXT>` + "use apenas o contexto abaixo"
