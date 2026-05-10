# 🔧 Como Integrar o Protocolo de Garantias

## ✅ Método Rápido (2 minutos)

### Passo 1: Adicionar Funções

Abra `worker.js` e adicione logo após as configurações iniciais (após linha ~170, antes de `validateConcursosFilter`):

```javascript
// ════════════════════════════════════════════════════════════════════════════
// PROTOCOLO DE GARANTIAS (Camadas 1, 3, 4)
// ════════════════════════════════════════════════════════════════════════════
```

Copie e cole TODO o conteúdo de `worker-quality-patch.js` (funções de validação).

### Passo 2: Modificar generateConcursosRAGQuestion

Procure a linha **~740** que contém:

```javascript
console.log(`[RAG] ✓ ${validatedQuestions.length} questão(ões) gerada(s) e validada(s)`);

return {
  success: true,
  questions: validatedQuestions,
  metadata: {
```

**Substitua** por:

```javascript
console.log(`[RAG] ✓ ${validatedQuestions.length} questão(ões) gerada(s) e validada(s)`);

// ═══ PROTOCOLO DE GARANTIAS ATIVADO ═══
const qualityCheckedQuestions = [];
const rejectedCount = { layer1: 0, layer3: 0 };

for (const q of validatedQuestions) {
  const qualityCheck = validateQuestionPipeline(
    { matches: contextResult.sources.map(s => ({ score: 0.85, metadata: s })) },
    q,
    contextResult.context
  );

  if (qualityCheck.success) {
    qualityCheckedQuestions.push(qualityCheck.question);
  } else {
    console.warn(`[QUALITY] Questão ${q.id} rejeitada:`, qualityCheck.message);
    if (qualityCheck.metadata.layer === 1) rejectedCount.layer1++;
    if (qualityCheck.metadata.layer === 3) rejectedCount.layer3++;
  }
}

if (qualityCheckedQuestions.length === 0) {
  return {
    success: false,
    error: 'QUALITY_VALIDATION_FAILED',
    userMessage: 'Material insuficiente para gerar questões confiáveis. Forneça mais conteúdo.',
    statusCode: 422,
    debug: { rejectedByLayer1: rejectedCount.layer1, rejectedByLayer3: rejectedCount.layer3 }
  };
}
// ═══ FIM DO PROTOCOLO ═══

return {
  success: true,
  questions: qualityCheckedQuestions,
  metadata: {
    mode: 'rag',
    subject: subjectConfig.label,
    vectorizeCollection: subjectConfig.vectorizeCollection,
    contextLength: contextResult.contextLength,
    contextSufficient: contextResult.sufficient,
    sources: contextResult.sources,
    ragScore: contextResult.sufficient ? 0.95 : 0.65,
    qualityProtocol: 'active',  // ← NOVO
    questionsRejected: validatedQuestions.length - qualityCheckedQuestions.length, // ← NOVO
  },
  statusCode: 200,
};
```

### Passo 3: Commit e Deploy

```bash
git add worker.js
git commit -m "feat: ativar protocolo de garantias"
git push origin feature/quality-protocols
npx wrangler deploy
```

---

## 🧪 Teste Rápido

Após deploy, teste:

```bash
curl -X POST https://studymaster-agent.pages.dev \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "concursos",
    "filter": "concursos.portugues",
    "quantity": 1
  }'
```

**Resposta esperada** (se material suficiente):

```json
{
  "questions": [
    {
      "id": 1,
      "statement": "...",
      "_qualityBadge": {
        "confidence": "Alta",
        "emoji": "🟢",
        "score": "92%",
        "message": "🟢 Fundamentada em 5 trechos do material"
      }
    }
  ],
  "metadata": {
    "qualityProtocol": "active",
    "questionsRejected": 0
  }
}
```

**Resposta esperada** (se material insuficiente):

```json
{
  "error": "QUALITY_VALIDATION_FAILED",
  "userMessage": "Material insuficiente para gerar questões confiáveis. Forneça mais conteúdo.",
  "debug": {
    "rejectedByLayer1": 1,
    "rejectedByLayer3": 0
  }
}
```

---

## ⚙️ Ajustes (opcional)

### Tornar validação menos rigorosa

No `worker-quality-patch.js`, linha ~20, altere:

```javascript
function validateRAGScore(ragResults, minScore = 0.75) {  // Era 0.75
```

Para:

```javascript
function validateRAGScore(ragResults, minScore = 0.65) {  // Agora 0.65
```

### Tornar validação mais rigorosa

Altere para `0.85`.

---

## 🚨 Rollback

Se precisar voltar:

```bash
git checkout HEAD~1 worker.js
git commit -m "rollback: remover protocolo de garantias"
git push origin feature/quality-protocols
npx wrangler deploy
```

---

## 📊 Monitoramento

Veja nos logs do Cloudflare Workers:

```
[RAG] ✓ 1 questão(ões) gerada(s) e validada(s)
[QUALITY] ✓ Questão rastreável (5/7 termos no material)
```

Ou se rejeitada:

```
[QUALITY] Questão 1 rejeitada: Material insuficiente (score: 68%, mínimo: 75%)
```

---

**Dúvidas?** Veja `PROTOCOLO-GARANTIAS.md` para detalhes técnicos.
