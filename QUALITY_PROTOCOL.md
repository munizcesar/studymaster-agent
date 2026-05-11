# Protocolo de Garantias de Qualidade – StudyMaster

> Documento vivo que descreve o protocolo de garantias aplicado à geração de questões, com foco inicial no modo **Concursos (RAG)**. Atualizado à medida que o pipeline evolui.

---

## 1. Objetivo do protocolo

O Protocolo de Garantias de Qualidade existe para garantir que as questões geradas pela IA:

- sejam **baseadas em material verificável** (e não em alucinações),  
- sejam **rastreáveis ao contexto de estudo** usado como base,  
- tenham um **nível de confiança explícito**, exposto via metadados e badge de qualidade,  
- exponham um **contrato de API estável** para a UI e para integrações futuras.  

A versão atual está focada no **modo Concursos** com RAG (Retrieval‑Augmented Generation) usando Cloudflare Vectorize.

---

## 2. Escopo atual (v1)

### 2.1 Onde o protocolo está ativo

Atualmente o protocolo está ativo apenas neste fluxo:

- **Endpoint**: "/" (handler principal do Worker)  
- **Modo**: `mode: "concursos"`  
- **Condição**: `mode === "concursos" && filter` no `worker.js`  
- **Função orquestradora**: `generateConcursosRAGQuestion(body, env)`  

Se essas condições são atendidas, o handler:

- chama `generateConcursosRAGQuestion(body, env)`,  
- devolve a resposta **exatamente** no formato retornado por essa função (ver seção 4).

Os demais modos (ENEM, livre, acadêmico, etc.) seguem o fluxo legado, sem este protocolo.

---

## 3. Arquitetura do protocolo (v1)

### 3.1 Configuração RAG por matéria

Tabela de mapeamento em `CONCURSOS_CONFIG.filters` (no `worker.js`):

- Chave interna: `"concursos.<matéria>"`  
- Exemplo:  
  - `concursos.portugues` → coleção `concursos_portugues`  
  - `concursos.direito_constitucional` → coleção `concursos_direito_constitucional`  

Cada entrada define:

- `label`: nome da matéria (ex.: “Direito Constitucional”)  
- `vectorizeCollection`: coleção no Vectorize  
- `minContextLength`: tamanho mínimo do contexto aceitável  
- `forbiddenPatterns`: padrões de texto proibidos (ex.: “prova de 2019”, “banca X decidiu…”)  
- `conceptualBases`: resumo das bases normativas/teóricas aceitas

A validação do filtro é feita por `validateConcursosFilter(filterKey)`.

### 3.2 Camadas do protocolo

As camadas estão implementadas em funções puras, logo após o `AREA_MAP_VECTORIZE`:

#### Camada 1 – Validação de RAG Score

Função: `validateRAGScore(ragResults, minScore = 0.75)`

- Usa os **top 3 scores** de similaridade de `ragResults.matches`.  
- Calcula a média e compara com `minScore`.  
- Se não houver matches ou a média cair abaixo do threshold, a camada falha com `reason` (`RAG_EMPTY` ou `RAG_LOW_CONFIDENCE`) e uma mensagem explicativa.

#### Camada 3 – Validação de Rastreabilidade

Função: `validateQuestionTraceability(question, contextText)`

- Extrai termos‑chave do enunciado e da explicação (palavras com 5+ caracteres, excluindo stopwords).  
- Calcula a **cobertura**: quantos desses termos aparecem no contexto.  
- Se a cobertura ficar abaixo de um mínimo (atualmente 30%), a questão é considerada **não rastreável** ao material.

#### Camada 4 – Badge de Confiança

Função: `generateQualityBadge(ragScore, traceability)`

- Combina `ragScore` (Camada 1) e `coverage` (Camada 3) em um score final.  
- Classifica em:  
  - Alta (🟢),  
  - Média (🟡),  
  - Baixa (🔴).  
- Gera um objeto com `confidence`, `emoji`, `score` em %, mensagem e um campo `_internal` para debugging.

#### Pipeline consolidado

Função: `validateQuestionPipeline(ragResults, question, contextText)`

- Executa Camada 1 → Camada 3 → Camada 4 nesta ordem.  
- Se alguma camada falha, retorna `{ success: false, reason, message, metadata }`.  
- Se todas passam, retorna:  
  - `success: true`  
  - `question`: a questão original enriquecida com `_qualityBadge`  
  - `metadata`: resumo com camadas ativas, `ragScore`, `traceability`, etc.

---

## 4. Fluxo Concursos (RAG) e contrato de resposta

### 4.1 Orquestrador `generateConcursosRAGQuestion`

Passos principais:

1. **Normalização do filtro**  
   - Recebe `body.filter`.  
   - Se objeto: extrai `filter.content.discipline` e monta `filterKey = "concursos.<discipline>"`.  
   - Valida `filterKey` via `validateConcursosFilter`.

2. **Montagem da query RAG**  
   - Usa dados de `content`, `exam` e `examMetadata` (disciplina, banca, órgão, cargo, escolaridade, anos).  
   - Gera `queryContext` legível e, a partir dele, a `query` final usada para o Vectorize.

3. **Busca de contexto no Vectorize**  
   - Chama `fetchVectorizeContext(env, collection, query, minContextLength)`.  
   - Gera contexto a partir dos melhores matches (`score >= 0.65`), concatenando textos.  
   - Calcula `contextLength` e `contextSufficient`.

4. **Chamada à IA (Groq)**  
   - Monta `systemText` com regras anti‑alucinação e `userPrompt` bem estruturado.  
   - Usa `callGroqWithFallback` para chamar o modelo (com fallback entre modelos e handling de 429/503).  
   - Extrai JSON usando `extractJsonFromText` + `extractQuestions`.

5. **Validação anti‑alucinação (pré‑protocolo)**  
   - Para cada questão bruta:  
     - `validateAgainstHallucination(q, subjectConfig)` checa estrutura, tamanho, alternativas, `correctAnswer` e padrões proibidos.  
     - Se houver padrões proibidos, corrige o texto (substitui por `[informação removida]`) e marca apenas aviso.  
     - Apenas questões válidas entram na lista `validatedQuestions`.

6. **Retorno padronizado (v1)**  
   - Se nenhuma questão sobrevive:  
     - `success: false`, erro e `statusCode: 422`.  
   - Se há questões válidas:  
     - `success: true`  
     - `questions: validatedQuestions`  
     - `metadata` com:  
       - `mode: "rag"`  
       - `subject`, `vectorizeCollection`  
       - `contextLength`, `contextSufficient`  
       - `sources` (trechos de contexto usados)  
       - `ragScore` heurístico (por ora, 0.95/0.65 baseado em suficiência)  
       - `qualityProtocol: "active"`  
       - `questionsGenerated`, `questionsApproved`, `questionsRejected` (atualmente aprovadas = geradas, rejeitadas = 0 – ver roadmap abaixo)  
     - `statusCode: 200`

### 4.2 Handler principal do Worker

No `export default { async fetch(...) { ... } }`:

- Quando `mode === "concursos" && filter`:  
  - Chama `generateConcursosRAGQuestion(body, env)`  
  - Se `ragResult.success === false`, retorna erro com `statusCode` e `userMessage` da função.  
  - Se `success === true`, retorna o objeto completo `ragResult` como JSON, com status `ragResult.statusCode`.

Teste de contrato feito com o script `test-concursos-worker.js` confirma:

- `Status: 200`  
- `Success: true`  
- `Quality protocol: active`  
- `Approved: 3`  
- `Rejected: 0`

---

## 5. Roadmap evolutivo do protocolo

Esta seção é o checklist vivo de próximas evoluções planejadas.

### 5.1 Métricas reais do pipeline RAG

- [ ] Separar explicitamente:  
  - `validatedQuestions`: passaram por `validateAgainstHallucination`.  
  - `qualityCheckedQuestions`: subset final que passou por `validateQuestionPipeline`.  
- [ ] Atualizar o retorno para:  
  - `questions: qualityCheckedQuestions`  
  - `metadata.questionsGenerated = validatedQuestions.length`  
  - `metadata.questionsApproved = qualityCheckedQuestions.length`  
  - `metadata.questionsRejected = validatedQuestions.length - qualityCheckedQuestions.length`.  
- [ ] Incluir, em casos de falha, contadores por camada:  
  - `metadata.rejectedByLayer1`  
  - `metadata.rejectedByLayer3`.

### 5.2 Exposição do badge na UI

- [ ] Garantir que cada questão retornada em Concursos inclua `_qualityBadge` (anexado por `validateQuestionPipeline`).  
- [ ] Atualizar a UI de cartões de questão para:  
  - exibir uma indicação visual (cor/label) baseada em `_qualityBadge.confidence` e `_qualityBadge.emoji`,  
  - exibir tooltip ou texto curto com `_qualityBadge.message`.

### 5.3 Expansão de escopo

- [ ] Avaliar ativar o protocolo (ou parte dele) em outros modos:  
  - material livre com RAG opcional,  
  - modos acadêmicos com contexto de Vade Mecum / LexML.  
- [ ] Definir thresholds específicos por modo (por exemplo, aceitar RAG mais conservador em Direito e mais relaxado em áreas de exatas).

### 5.4 Observabilidade

- [ ] Adicionar logs estruturados ou eventos para:  
  - total de questões geradas,  
  - aprovadas/rejeitadas por camada,  
  - distribuição de `ragScore` e `traceability.coverage`.  
- [ ] Futuro: enviar essas métricas para algum backend de analytics / logging para monitorar a saúde do protocolo em produção.

---

## 6. Como manter este documento vivo

Sempre que uma alteração relevante for feita no protocolo, atualizar:

1. **Seção 2 (Escopo atual)** – se novos modos forem incluídos.  
2. **Seção 3 (Arquitetura)** – se novas camadas forem adicionadas ou thresholds alterados de forma significativa.  
3. **Seção 4 (Contrato)** – se o formato da resposta mudar.  
4. **Seção 5 (Roadmap)** – marcar itens concluídos e adicionar novos pontos quando surgirem necessidades.
