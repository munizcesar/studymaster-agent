# 📋 GUIA MESTRE DE EVOLUÇÃO — StudyMaster Agent

> **Documento de controle vivo.** Cada item implementado recebe `[x]`. Cada sessão de trabalho deve começar aqui e terminar aqui, atualizando os checks.
>
> **Regra:** nenhuma feature nova começa antes da fase anterior estar 100% concluída e estável em produção.

---

## 🗺️ Visão Geral das Fases

| Fase | Nome | Status | Prioridade |
|------|------|--------|------------|
| 1 | Blindagem da Base (Anti-alucinação) | 🟡 Em andamento | 🔴 Crítica |
| 2 | Expansão do Conteúdo RAG | ⬜ Pendente | 🟠 Alta |
| 3 | UX e Feedback ao Usuário | ⬜ Pendente | 🟡 Média |
| 4 | Sistema de Login e Multi-usuário | ⬜ Pendente | 🟢 Futura |
| 5 | Monetização e SaaS | ⬜ Pendente | 🟢 Futura |

---

## ✅ FASE 1 — Blindagem da Base (Anti-alucinação)

> **Objetivo:** o sistema deve recusar gerar questões quando o contexto RAG for insuficiente, e nunca fabricar informações.

### 1.1 Score mínimo de similaridade no RAG
- [x] `validateRAGScore()` implementado no `worker.js` com `minScore = 0.75`
- [x] Retorno estruturado com `reason: 'RAG_EMPTY'` e `reason: 'RAG_LOW_CONFIDENCE'`
- [x] Recusa segura: worker retorna erro amigável quando score insuficiente
- [x] Score do top-3 matches usado como média ponderada

### 1.2 Validação de rastreabilidade da questão
- [x] `validateQuestionTraceability()` implementado
- [x] Extração de termos-chave com filtro de stopwords em português
- [x] Cobertura mínima de 30% dos termos da questão no contexto RAG
- [x] Retorno com `coverage` percentual e `matchedTerms / totalTerms`

### 1.3 Pipeline de validação unificado
- [x] `validateQuestionPipeline()` chama camadas 1, 3 e 4 em sequência
- [x] Badge de qualidade: 🟢 Alta / 🟡 Média / 🔴 Baixa
- [x] `_qualityBadge` injetado no objeto `question` retornado ao frontend

### 1.4 Padrões proibidos por matéria (anti-alucinação)
- [x] `forbiddenPatterns` definidos para todas as 6 matérias de concursos
- [x] `forbiddenPatterns` definidos para todas as 7 áreas do modo academic
- [x] `validateAgainstHallucination()` detecta e remove padrões com `[informação removida]`
- [x] Warning retornado quando padrões foram detectados e corrigidos

### 1.5 Prompt restrito ao contexto recuperado
- [x] `systemText` de concursos proibido de inventar artigos, súmulas, anos e bancas
- [x] `getAreaSafetyInstruction()` retorna instrução específica por área/modo
- [x] `guardPromptSize()` garante que contexto RAG + externo cabem em 24k chars
- [ ] **TODO:** Adicionar instrução explícita no prompt: "Se o contexto não contiver informação suficiente, responda APENAS: `{\"error\": \"CONTEXT_INSUFFICIENT\"}`"

### 1.6 Fallback gracioso ao usuário
- [x] Mensagem de fallback definida em `CONCURSOS_CONFIG.fallbackMessage`
- [x] Mensagem de fallback definida em `ACADEMIC_CONFIG.fallbackMessage`
- [x] `invalidFilterMessage` e `invalidAreaMessage` com lista das opções válidas
- [ ] **TODO:** Exibir no frontend o badge de qualidade (🟢/🟡/🔴) junto à questão gerada

---

## ⬜ FASE 2 — Expansão do Conteúdo RAG

> **Objetivo:** popular as coleções Vectorize com material de qualidade para aumentar coverage e score médio.

### 2.1 Indexação de conteúdo para Concursos
- [ ] Indexar artigos de Português (gramática, regência, interpretação)
- [ ] Indexar CF/88 completa na coleção `concursos_direito_constitucional`
- [ ] Indexar Lei 8.112/90 e Lei 9.784/99 na coleção `concursos_direito_administrativo`
- [ ] Indexar exercícios de Raciocínio Lógico na coleção `concursos_rlm`
- [ ] Indexar fundamentos de Informática na coleção `concursos_informatica`
- [ ] Indexar conteúdo de Administração Pública na coleção `concursos_adm_publica`

### 2.2 Indexação de conteúdo para Academic
- [ ] Popular `academic_direito` (CC/2002, CP, CPC, CLT)
- [ ] Popular `academic_medicina` (fisiologia, farmacologia, clínica)
- [ ] Popular `academic_historia` (história do Brasil e geral)
- [ ] Popular `academic_exatas` (matemática, física, química)
- [ ] Popular `academic_humanas` (sociologia, filosofia, psicologia)
- [ ] Popular `academic_saude` (saúde pública, epidemiologia)
- [ ] Popular `academic_negocios` (administração, finanças, marketing)

### 2.3 Qualidade do índice
- [ ] Script `build_full_index.py` validado e rodando sem erros
- [ ] Verificar score médio de cada coleção após indexação (meta: ≥ 0.75)
- [ ] Documentar quantidade de chunks por coleção

---

## ⬜ FASE 3 — UX e Feedback ao Usuário

> **Objetivo:** o usuário entende a qualidade do que está recebendo e tem clareza quando o sistema não consegue ajudar.

### 3.1 Badge de qualidade no frontend
- [ ] Exibir badge 🟢/🟡/🔴 junto à questão gerada
- [ ] Tooltip explicando o significado de cada badge
- [ ] Badge deve aparecer antes das alternativas, não depois

### 3.2 Mensagens de erro amigáveis
- [ ] Quando `RAG_EMPTY`: mostrar mensagem + sugestão de matéria alternativa
- [ ] Quando `RAG_LOW_CONFIDENCE`: mostrar score e sugestão de reformular a pergunta
- [ ] Quando `CONTEXT_INSUFFICIENT`: mensagem clara sem expor detalhes técnicos

### 3.3 Indicador de carregamento
- [ ] Loading state visível durante a geração da questão
- [ ] Timeout de 30s com mensagem de retry amigável
- [ ] Botão "Tentar novamente" em caso de erro

### 3.4 Histórico de questões na sessão
- [ ] Exibir últimas 5 questões geradas na sessão atual (sem persistência)
- [ ] Botão para regenerar questão com parâmetros iguais

### 3.5 Mobile responsivo
- [ ] Testar interface em 375px (iPhone SE)
- [ ] Testar interface em 390px (iPhone 14)
- [ ] Touch targets mínimos de 44x44px em todos os botões

---

## ⬜ FASE 4 — Sistema de Login e Multi-usuário

> **Objetivo:** permitir que cada usuário tenha histórico, progresso e configurações persistidas.
> **Regra:** esta fase só começa após a Fase 3 estar completa e estável.

### 4.1 Autenticação básica
- [ ] Definir estratégia: Cloudflare Access vs. JWT próprio vs. OAuth
- [ ] Implementar login com email + senha (sem OAuth inicialmente)
- [ ] Sessão via JWT com expiração de 7 dias
- [ ] Logout e invalidação de token

### 4.2 Perfil e progresso do usuário
- [ ] Salvar questões respondidas por usuário (Cloudflare KV ou D1)
- [ ] Score histórico por matéria/área
- [ ] Contador de questões geradas e acertos

### 4.3 Segurança
- [ ] Rate limiting por usuário (máx. 50 questões/hora)
- [ ] Validação de CORS restrita ao domínio de produção
- [ ] Headers de segurança (`X-Content-Type-Options`, `X-Frame-Options`)

---

## ⬜ FASE 5 — Monetização e SaaS

> **Objetivo:** transformar o StudyMaster em produto com receita recorrente.
> **Regra:** esta fase só começa após Login estar sólido e com usuários reais ativos.

### 5.1 Planos e limites
- [ ] Plano gratuito: 10 questões/dia
- [ ] Plano Pro: questões ilimitadas + acesso a todas as matérias
- [ ] Integração com Stripe ou Pagar.me para pagamento recorrente

### 5.2 Painel administrativo
- [ ] Métricas de uso por matéria/área
- [ ] Usuários ativos diários/mensais
- [ ] Score médio de qualidade RAG por coleção

### 5.3 API pública
- [ ] Documentação da API para integrações externas
- [ ] Chave de API por usuário (plano Pro)
- [ ] Rate limiting diferenciado por plano

---

## 📝 Log de Sessões

> Registrar aqui cada sessão de trabalho com data, o que foi feito e o que ficou pendente.

### Sessão — 2026-05-28
**Feito:**
- Aplicadas correções evergreen no `config/prompts-anti-alucinacao.json` (remoção de preços, seção custo-benefício atemporal, CTAs genéricos)

**Pendente para próxima sessão:**
- Adicionar instrução explícita no prompt para retornar `{"error": "CONTEXT_INSUFFICIENT"}` quando contexto insuficiente (item 1.5 pendente)
- Implementar exibição do badge de qualidade no frontend (item 1.6 pendente)

### Sessão — 2026-05-30
**Feito:**
- Criado/atualizado este documento GUIA-EVOLUCAO.md como controle mestre
- Mapeado estado atual do worker.js: validações RAG implementadas, padrões proibidos definidos, pipeline unificado operacional

**Pendente para próxima sessão:**
- Item 1.5: instrução `CONTEXT_INSUFFICIENT` no systemText
- Item 1.6: badge de qualidade no index.html
- Avaliar qual coleção Vectorize tem menor coverage para priorizar indexação (Fase 2)

---

## 🚫 Regras Invioláveis

1. **Nunca inventar artigos, súmulas ou leis** — se não está no contexto RAG, não gera questão
2. **Nunca mencionar preços, anos de prova ou bancas específicas** — conteúdo evergreen
3. **Login fica por último** — não bloqueia nenhuma das Fases 1, 2 ou 3
4. **Uma fase de cada vez** — não abrir frente nova com fase anterior incompleta
5. **Todo check marcado = testado em produção**, não apenas implementado localmente

---

## 🔗 Documentos Relacionados

- [PROTOCOLO-GARANTIAS.md](./PROTOCOLO-GARANTIAS.md) — detalhes das camadas de validação
- [ARQUITETURA.md](./ARQUITETURA.md) — visão geral da arquitetura do sistema
- [CHANGELOG.md](./CHANGELOG.md) — histórico de alterações
- [00-LEIA-PRIMEIRO.md](./00-LEIA-PRIMEIRO.md) — onboarding e contexto do projeto
