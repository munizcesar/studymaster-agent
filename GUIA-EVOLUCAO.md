# 📋 GUIA DE EVOLUÇÃO — StudyMaster Agent

> **Documento vivo.** Tudo que for implementado recebe `[x]`. Nada começa sem estar listado aqui.
> Atualizado em: 2026-05-30

---

## 🗂️ Status Geral

| Fase | Nome | Status |
|------|------|--------|
| 0 | Fundação & Controle | ✅ Concluída |
| 1 | Blindagem da Base (RAG + Anti-Alucinação) | ✅ Concluída |
| 2 | UX & Interface (Mobile-first, Feedback visual) | ⏳ Pendente |
| 3 | Conteúdo & Indexação (Vectorize, PDFs, YouTube) | ⏳ Pendente |
| 4 | Autenticação & Multi-usuário | ⏳ Pendente |
| 5 | Monetização & Analytics | ⏳ Pendente |

---

## ✅ FASE 0 — Fundação & Controle

> Objetivo: estrutura mínima operacional, documentação base e pipeline RAG funcional.

- [x] Worker Cloudflare deployado e funcional
- [x] Integração Groq API com fallback de modelos (5 modelos)
- [x] RAG via Vectorize com score mínimo 0.65
- [x] Protocolo anti-alucinação: `validateRAGScore` + `validateQuestionTraceability`
- [x] Filtros Concursos configurados (6 matérias)
- [x] Filtros Academic configurados (7 áreas)
- [x] `forbiddenPatterns` por filtro (sanitização de padrões alucinatórios)
- [x] Badge de qualidade (`🟢🟡🔴`) gerado em cada resposta
- [x] `guardPromptSize` para evitar overflow do contexto
- [x] CORS configurado para `studymaster-agent.pages.dev`
- [x] `index.html` com layout responsivo de questões
- [x] Seção de preços removida do frontend (conteúdo evergreen)
- [x] CTAs apontando para link externo (sem preços fixos)
- [x] `GUIA-EVOLUCAO.md` criado como documento de controle

---

## 🔄 FASE 1 — Blindagem da Base

> Objetivo: tornar o sistema confiável antes de escalar. Nenhuma alucinação deve chegar ao usuário.

### 1.1 Score mínimo de similaridade
- [x] Elevar `minScore` de 0.65 → **0.75** em `fetchVectorizeContext`
- [x] Elevar `minScore` de 0.70 → **0.75** em `fetchVademecumRAG`
- [x] Testar: consultas fora do escopo devem retornar fallback, não alucinação

### 1.2 Recusa segura quando contexto insuficiente
- [x] Retornar mensagem de fallback quando `contextLength < minContextLength`
- [x] Nunca gerar questão sem contexto mínimo verificado
- [x] Log de evento quando fallback é acionado

### 1.3 Prompt restrito ao contexto recuperado
- [x] Adicionar instrução explícita no `systemText`: *"Gere questões EXCLUSIVAMENTE com base no contexto abaixo. Se o contexto for insuficiente, recuse e informe o usuário."*
- [x] Remover permissão implícita de uso de conhecimento geral nos modos concursos/academic

### 1.4 Validação de resposta pós-geração
- [x] `validateQuestionPipeline` ativado em todos os fluxos (concursos + academic)
- [x] Se pipeline falhar: retornar erro estruturado, não questão parcial
- [x] Incluir campo `_qualityBadge` em toda resposta bem-sucedida

### 1.5 Testes de regressão anti-alucinação
- [x] Criar suite de 10 consultas fora do escopo por matéria
- [x] Documentar resultado esperado (recusa) vs. obtido
- [x] Critério de conclusão: 100% das consultas fora do escopo recusadas

**Status Fase 1: ✅ CONCLUÍDA** (2026-05-30)

---

## ⏳ FASE 2 — UX & Interface

> Objetivo: experiência fluida em mobile, feedback visual claro, zero confusão de estado.

### 2.1 Mobile-first (375px)
- [ ] Revisar layout de questões em viewport 375px
- [ ] Touch targets mínimos de 44x44px em todos os botões
- [ ] Verificar sem scroll horizontal em mobile

### 2.2 Estados de loading e erro
- [ ] Skeleton loader durante geração da questão
- [ ] Estado de erro com mensagem amigável (sem stack trace exposto)
- [ ] Empty state quando nenhuma questão disponível

### 2.3 Badge de qualidade visível
- [ ] Exibir `_qualityBadge` (🟢🟡🔴) abaixo de cada questão
- [ ] Tooltip explicando o que o badge significa

### 2.4 Histórico de sessão
- [ ] Manter lista de questões respondidas na sessão (in-memory)
- [ ] Placar: X acertos / Y questões
- [ ] Botão "Nova sessão" reseta tudo

### 2.5 Acessibilidade básica
- [ ] Contraste WCAG AA em todos os textos
- [ ] `aria-label` em botões de ícone
- [ ] Navegação completa por teclado (Tab/Enter/Space)

---

## ⏳ FASE 3 — Conteúdo & Indexação

> Objetivo: ampliar base de conhecimento com materiais reais.

### 3.1 PDFs
- [ ] Pipeline de ingestão de PDF → chunks → embedding → Vectorize
- [ ] Metadados obrigatórios por chunk: `{ source, area, page, chunk_id }`
- [ ] Testar: 1 PDF por matéria de concurso (6 matérias)
- [ ] Critério: score ≥ 0.75 em consultas sobre o conteúdo indexado

### 3.2 YouTube
- [ ] Extração de transcrição via YouTube Data API v3 (com `YOUTUBE_API_KEY`)
- [ ] Fallback para scraping se API bloqueada
- [ ] Chunks de transcrição → embedding → Vectorize
- [ ] Testar: 2 vídeos por área

### 3.3 Modo "Livre" (upload do usuário)
- [ ] Upload de texto/PDF pelo usuário na sessão
- [ ] Indexação temporária (in-memory, sem persistência)
- [ ] Geração de questões baseada EXCLUSIVAMENTE no material enviado

### 3.4 Curadoria de base existente
- [ ] Auditar coleções Vectorize existentes (score médio por coleção)
- [ ] Remover vetores com score < 0.60 nas buscas (qualidade da base)
- [ ] Documentar: quais coleções têm material suficiente, quais precisam de reforço

---

## ⏳ FASE 4 — Autenticação & Multi-usuário

> ⚠️ Esta fase começa SOMENTE após Fase 1 e Fase 2 concluídas.
> Objetivo: sessões persistentes, progresso salvo, múltiplos usuários.

### 4.1 Autenticação básica
- [ ] Definir estratégia: Cloudflare Access vs. JWT próprio vs. OAuth (Google)
- [ ] Documentar decisão em `DECISOES.md`
- [ ] Implementar login/logout sem quebrar fluxo atual

### 4.2 Persistência de progresso
- [ ] Storage de histórico por usuário (D1 ou KV)
- [ ] Salvar: questões respondidas, acertos, matérias estudadas
- [ ] Não salvar: conteúdo das questões (gerar sempre fresh)

### 4.3 Segurança
- [ ] Rate limiting por IP/usuário no Worker
- [ ] Sanitização de inputs antes de qualquer prompt
- [ ] Nenhuma chave de API exposta no frontend

---

## ⏳ FASE 5 — Monetização & Analytics

> Objetivo: entender uso, identificar valor, preparar modelo de receita.

### 5.1 Analytics de uso
- [ ] Eventos: `questao_gerada`, `questao_respondida`, `acerto`, `erro`, `filtro_usado`
- [ ] Integrar Google Analytics 4 ou Cloudflare Analytics
- [ ] Dashboard simples: questões/dia, matéria mais usada, taxa de acerto

### 5.2 Limite gratuito
- [ ] Definir: X questões/dia para não logados
- [ ] Mensagem clara quando limite atingido
- [ ] CTA para criar conta (Fase 4 pré-requisito)

### 5.3 Modelo de receita
- [ ] Definir: assinatura vs. freemium vs. pay-per-use
- [ ] Documentar decisão em `DECISOES.md`
- [ ] Implementar planos apenas após validar demanda orgânica

---

## 📌 Regras do Processo

1. **Nenhuma feature começa sem estar neste guia** com item `[ ]`
2. **Cada item concluído vira `[x]`** com commit referenciando a mudança
3. **Fases são sequenciais** — Fase 2 não inicia sem Fase 1 concluída
4. **Exceção:** itens de UX críticos (bugs visuais graves) podem ser corrigidos a qualquer momento
5. **Login (Fase 4) é o último bloco desbloqueado** — nunca antes
6. **Preço, planos e monetização** nunca aparecem no frontend antes da Fase 5
7. **Qualquer decisão arquitetural vai para `DECISOES.md`**

---

## 🔗 Documentos Relacionados

| Documento | Finalidade |
|-----------|------------|
| [`DECISOES.md`](./DECISOES.md) | Registro de decisões arquiteturais |
| [`PROTOCOLO-GARANTIAS.md`](./PROTOCOLO-GARANTIAS.md) | Protocolo anti-alucinação detalhado |
| [`CHANGELOG.md`](./CHANGELOG.md) | Histórico de mudanças |
| [`ARQUITETURA.md`](./ARQUITETURA.md) | Visão geral da arquitetura |
| [`worker.js`](./worker.js) | Worker principal (Cloudflare) |
