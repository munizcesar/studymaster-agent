# 🧠 Decisões de Arquitetura (ADR) — StudyMaster

Registro das decisões técnicas importantes do projeto.
Cada decisão documenta o **contexto**, a **escolha feita** e o **motivo**.

---

## ADR-001 — Cloudflare como plataforma principal

**Data:** 2026-04-03  
**Status:** ✅ Ativo

**Contexto:** Necessidade de infraestrutura serverless de baixo custo para servir o frontend e o backend de IA.

**Decisão:** Usar Cloudflare Pages (frontend) + Workers (backend) + Vectorize (RAG) + AI (embeddings/LLM).

**Motivo:**
- Plano gratuito generoso (100k req/dia no Worker, 5M vetores no Vectorize)
- Latência baixa com edge computing
- Tudo no mesmo ecossistema (sem CORS entre Pages e Workers do mesmo account)
- Sem servidor para gerenciar

**Alternativas descartadas:** Vercel + Pinecone (custo mais alto), AWS Lambda (complexidade maior).

---

## ADR-002 — Modelo de embedding BGE-M3 (1024 dims)

**Data:** 2026-05-01  
**Status:** ✅ Ativo

**Contexto:** Escolha do modelo de embedding para vetorizar o conteúdo educacional em português.

**Decisão:** Usar `@cf/baai/bge-m3` com 1024 dimensões.

**Motivo:**
- Multilingual — funciona excelente com português
- Disponível nativamente no Cloudflare AI (sem custo extra)
- 1024 dims oferece boa qualidade semântica
- BGE-M3 é estado da arte para recuperação de informação

**Atenção:** O modelo retorna **1024 dims** (não 768). O índice Vectorize deve ser criado com `--dimensions=1024`.

**Alternativas descartadas:** `text-embedding-ada-002` da OpenAI (custo por token), `all-MiniLM` (384 dims, menor qualidade).

---

## ADR-003 — RAG com Vectorize para geração de questões

**Data:** 2026-05-01  
**Status:** ✅ Ativo

**Contexto:** Como garantir que as questões geradas sejam relevantes e factualmente corretas para cada área.

**Decisão:** Implementar RAG (Retrieval-Augmented Generation): antes de gerar a questão, buscar os N conteúdos mais similares no Vectorize e injetá-los no prompt do LLM.

**Motivo:**
- LLMs sozinhos alucinam conteúdo específico de concursos e legislação
- RAG ancora a geração em conteúdo real e verificado
- O Vectorize permite busca semântica eficiente (cosine similarity)

**Fluxo:** `Frontend → Worker → [embed query → busca Vectorize → top-K docs] → LLM com contexto → questão gerada`

---

## ADR-004 — Frontend single-page sem framework

**Data:** 2026-04-03  
**Status:** ✅ Ativo

**Contexto:** Escolha do stack frontend.

**Decisão:** HTML/CSS/JS puro em um único `index.html`.

**Motivo:**
- Zero build step — commit e já está no ar
- Compatível direto com Cloudflare Pages (sem configuração)
- Projeto educacional não precisa de reatividade complexa
- Facilita manutenção para um desenvolvedor solo

**Alternativas descartadas:** Astro (overkill para MVP), React (bundle desnecessário para o escopo atual).

---

## ADR-005 — Indexação manual via scripts Python

**Data:** 2026-05-01  
**Status:** ✅ Ativo

**Contexto:** Como popular o Vectorize com conteúdo educacional.

**Decisão:** Scripts Python executados manualmente no ambiente local, um por área temática.

**Motivo:**
- Controle total sobre o que é indexado
- Fácil depuração (output linha a linha)
- Reindexação idempotente (upsert não duplica)
- Conteúdo muda raramente — automação seria over-engineering

**Evolução futura:** Se o conteúdo passar de 10.000 vetores ou precisar de atualização frequente, migrar para GitHub Actions agendado.
