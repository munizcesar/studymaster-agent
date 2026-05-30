# 📋 StudyMaster — Guia Mestre de Evolução

> Documento de controle incremental. Cada item implementado recebe `✅`. Itens pendentes ficam como `⬜`. Nunca remover itens concluídos — eles formam o histórico real do projeto.

---

## 🗺️ Visão Geral das Fases

| Fase | Nome | Status |
|------|------|--------|
| 1 | Blindagem da base (anti-alucinação) | 🔄 Em progresso |
| 2 | Qualidade de geração de questões | ⬜ Aguardando |
| 3 | Expansão de matérias e conteúdo | ⬜ Aguardando |
| 4 | Experiência do usuário (UX/UI) | ⬜ Aguardando |
| 5 | Multi-usuário e autenticação | ⬜ Aguardando (última) |

---

## ✅ Fase 0 — Fundação (concluída)

- ✅ Worker Cloudflare com Groq API funcional
- ✅ Integração Vectorize RAG para concursos (6 matérias mapeadas)
- ✅ Integração Vectorize RAG para acadêmico (7 áreas mapeadas)
- ✅ `validateRAGScore()` — bloqueia score abaixo de 0.75
- ✅ `validateQuestionTraceability()` — rastreabilidade mínima 30%
- ✅ `validateAgainstHallucination()` — remove padrões proibidos
- ✅ `generateQualityBadge()` — badge 🟢🟡🔴 por confiança
- ✅ `validateQuestionPipeline()` — pipeline unificado camadas 1+3+4
- ✅ Fallback gracioso (LexML → Wikipedia → mensagem clara)
- ✅ CORS restrito ao domínio `studymaster-agent.pages.dev`
- ✅ Forbidden patterns por matéria (anti-referência a bancas/provas)
- ✅ Seção de preços evergreen (sem valores fixos, só link para anúncio)

---

## 🔄 Fase 1 — Blindagem da Base

> Objetivo: tornar o sistema incapaz de gerar questões fora do material indexado.

### 1.1 Score mínimo de similaridade

- ✅ Threshold de 0.75 implementado em `validateRAGScore()`
- ⬜ Aumentar threshold para **0.80** após testes de qualidade
- ⬜ Logar scores em KV ou Analytics Engine para análise

### 1.2 Recusa segura quando contexto insuficiente

- ✅ `fetchVectorizeContext()` retorna `sufficient: false` com fallback
- ⬜ Mensagem de recusa diferenciada por motivo (`RAG_EMPTY` vs `RAG_LOW_CONFIDENCE`)
- ⬜ Header de resposta `X-RAG-Reason` para debugging no frontend

### 1.3 Prompt restrito ao conteúdo recuperado

- ✅ Contexto Vectorize injetado no system prompt
- ⬜ Adicionar instrução explícita: *"Você DEVE responder APENAS com base no CONTEXTO abaixo. Se a resposta não estiver no contexto, recuse."*
- ⬜ Separador visual claro no prompt: `--- CONTEXTO AUTORIZADO ---`

### 1.4 Cobertura de matérias Vectorize

- ✅ 6 filtros de concursos mapeados
- ✅ 7 áreas acadêmicas mapeadas
- ⬜ Verificar se todas as coleções Vectorize estão indexadas com conteúdo real
- ⬜ Script de auditoria: contar vetores por coleção

---

## ⬜ Fase 2 — Qualidade de Geração

> Objetivo: questões mais variadas, bem distribuídas e com feedback pedagógico útil.

### 2.1 Distribuição de dificuldade

- ⬜ Parâmetro `difficulty: easy | medium | hard` na requisição
- ⬜ Instrução de dificuldade injetada no prompt por nível
- ⬜ Badge de dificuldade na resposta ao usuário

### 2.2 Variação de tipo de questão

- ⬜ Suporte a `questionType: multiple_choice | true_false | fill_blank`
- ⬜ Parser de resposta adaptado por tipo
- ⬜ Validação de estrutura por tipo

### 2.3 Explicação pedagógica aprimorada

- ⬜ Explicação deve referenciar trecho específico do contexto RAG
- ⬜ Adicionar campo `sourceReference` na resposta com trecho de origem
- ⬜ Exibir referência no frontend com link ou destaque

### 2.4 Anti-repetição

- ⬜ Hash das últimas 10 questões por sessão (KV ou memória local)
- ⬜ Instrução no prompt: "Não repita questões já feitas nesta sessão"
- ⬜ Endpoint `/session/clear` para resetar histórico

---

## ⬜ Fase 3 — Expansão de Conteúdo

> Objetivo: ampliar cobertura e manter material atualizado.

### 3.1 Indexação de conteúdo real

- ⬜ Script de indexação: PDF → chunks → embeddings → Vectorize
- ⬜ Protocolo de revisão antes de indexar (sem material duvidoso)
- ⬜ Metadata obrigatória por chunk: `{ source, area, topic, date_indexed }`

### 3.2 Novas matérias de concurso

- ⬜ Atualidades/Conhecimentos Gerais
- ⬜ Inglês (nível intermediário)
- ⬜ Finanças Públicas

### 3.3 Novas áreas acadêmicas

- ⬜ Engenharia (Fundamentos)
- ⬜ Ciências da Computação
- ⬜ Educação / Pedagogia

### 3.4 Atualização periódica

- ⬜ GitHub Action semanal para auditoria de gaps de conteúdo
- ⬜ Alerta automático quando coleção tem < 50 vetores

---

## ⬜ Fase 4 — UX / Frontend

> Objetivo: interface que reflita a qualidade do backend.

### 4.1 Exibição do Quality Badge

- ⬜ Componente visual 🟢🟡🔴 por questão
- ⬜ Tooltip explicando o que significa cada cor
- ⬜ Ocultar questões 🔴 por padrão (mostrar só com aviso)

### 4.2 Feedback do usuário

- ⬜ Botão "Questão incorreta / mal formulada" por questão
- ⬜ Endpoint `/feedback` que salva no KV com timestamp
- ⬜ Dashboard admin simples para revisar feedbacks

### 4.3 Mobile-first

- ⬜ Revisar layout em 375px (iPhone SE)
- ⬜ Touch targets mínimos de 44px em botões
- ⬜ Modo escuro consistente em todos os estados

### 4.4 Acessibilidade

- ⬜ Atributos `aria-label` em todos os ícones sem texto
- ⬜ Hierarquia correta de headings (h1 → h2 → h3)
- ⬜ Contraste WCAG AA em todos os textos

---

## ⬜ Fase 5 — Multi-usuário e Autenticação

> ⚠️ Esta fase é deliberadamente a última. O sistema deve ser robusto pedagogicamente antes de escalar para múltiplos usuários.

### 5.1 Sistema de autenticação

- ⬜ Definir provider: Cloudflare Access, Auth.js ou JWT próprio
- ⬜ Fluxo de login/logout
- ⬜ Proteção de rotas sensíveis

### 5.2 Perfis de usuário

- ⬜ Histórico de questões por usuário (KV ou D1)
- ⬜ Progresso por matéria / área
- ⬜ Metas de estudo configuráveis

### 5.3 Segurança

- ⬜ Rate limiting por usuário (não só por IP)
- ⬜ Validação de sessão em cada request ao worker
- ⬜ Logs de auditoria para ações sensíveis

### 5.4 Escalabilidade

- ⬜ Migrar estado de sessão de memória para Durable Objects
- ⬜ Revisão de limites do plano Cloudflare Workers

---

## 📌 Regras do Guia

1. **Nunca apague itens concluídos** — eles formam o histórico do projeto.
2. **Só avance de fase quando a anterior estiver ≥ 80% concluída.**
3. **Fase 5 (autenticação) é sempre a última** — funcionalidade pedagógica tem prioridade.
4. **Cada commit relevante deve referenciar o item deste guia** (ex: `fix: fase 1.3 — prompt restrito ao contexto RAG`).
5. **Conteúdo indexado deve ser verificado antes de entrar em produção** — sem material duvidoso no Vectorize.

---

*Última atualização: 2026-05-30*
