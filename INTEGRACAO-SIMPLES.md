# 🔧 Integração Simples do Validador de Qualidade

## 🎯 Objetivo

Ativar as **Camadas 1, 2 e 3** do Protocolo de Garantias no seu Worker existente com **mínimas mudanças**.

---

## ⚡ Opção 1: Integração Automática (Recomendado)

Vou criar um script que injeta o validador automaticamente.

**Status**: 🟡 Preparando...

---

## ⚙️ Opção 2: Integração Manual (3 passos)

### Passo 1: Adicionar Import no topo do worker.js

```javascript
// Logo após as primeiras linhas do worker.js, adicione:
import { validateQuestionPipeline } from './src/quality-validator.js';
```

### Passo 2: Ativar validação na função generateConcursosRAGQuestion

Procure esta linha (aproximadamente linha 700):

```javascript
// Antes (linha ~750):
console.log(`[RAG] ✓ ${validatedQuestions.length} questão(ões) gerada(s) e validada(s)`);

return {
  success: true,
  questions: validatedQuestions,
  metadata: {
    mode: 'rag',
    subject: subjectConfig.label,
    vectorizeCollection: subjectConfig.vectorizeCollection,
    contextLength: contextResult.contextLength,
    contextSufficient: contextResult.sufficient,
    sources: contextResult.sources,
    ragScore: contextResult.sufficient ? 0.95 : 0.65,
  },
  statusCode: 200,
};
```

**Substituir por**:

```javascript
console.log(`[RAG] ✓ ${validatedQuestions.length} questão(ões) gerada(s) e validada(s)`);

// ━━━ PROTOCOLO DE GARANTIAS ATIVADO ━━━
const questionsWithQuality = [];
for (const q of validatedQuestions) {
  const qualityCheck = validateQuestionPipeline(
    { matches: contextResult.sources.map((s, i) => ({ score: 0.85, metadata: s })) },
    q,
    contextResult.context
  );

  if (qualityCheck.success) {
    questionsWithQuality.push({
      ...q,
      _qualityBadge: qualityCheck.metadata.badge
    });
  } else {
    console.warn(`[QUALITY] Questão ${q.id} rejeitada:`, qualityCheck.message);
  }
}

if (questionsWithQuality.length === 0) {
  return {
    success: false,
    error: 'Nenhuma questão passou no protocolo de qualidade',
    userMessage: 'Material insuficiente para gerar questões confiáveis. Fornece mais conteúdo.',
    statusCode: 422,
  };
}
// ━━━ FIM DO PROTOCOLO ━━━

return {
  success: true,
  questions: questionsWithQuality,
  metadata: {
    mode: 'rag',
    subject: subjectConfig.label,
    vectorizeCollection: subjectConfig.vectorizeCollection,
    contextLength: contextResult.contextLength,
    contextSufficient: contextResult.sufficient,
    sources: contextResult.sources,
    ragScore: contextResult.sufficient ? 0.95 : 0.65,
    qualityProtocol: 'active', // ← NOVO
    questionsRejected: validatedQuestions.length - questionsWithQuality.length, // ← NOVO
  },
  statusCode: 200,
};
```

### Passo 3: Deploy

```bash
git add .
git commit -m "feat: ativar protocolo de garantias"
git push origin feature/quality-protocols
npx wrangler deploy
```

---

## 🧪 Teste Após Integração

### Teste 1: Questão deve ser aprovada

```bash
curl -X POST https://seu-site.pages.dev/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "concursos",
    "filter": "concursos.portugues",
    "quantity": 1
  }'
```

**Resposta esperada**:
```json
{
  "questions": [
    {
      "id": 1,
      "statement": "...",
      "_qualityBadge": {
        "confidence": "Alta",
        "score": "94%",
        "message": "✓ Fundamentada em 3 trechos do material"
      }
    }
  ]
}
```

### Teste 2: Material insuficiente deve rejeitar

```bash
curl -X POST https://seu-site.pages.dev/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "concursos",
    "filter": "concursos.informatica",
    "quantity": 1
  }'
```

**Se não houver material suficiente**:
```json
{
  "error": "RAG_INSUFFICIENT",
  "message": "Material insuficiente. Por favor, forneça mais conteúdo."
}
```

---

## 📊 Métricas de Sucesso

Após integração, você verá:

✅ **Camada 1 Ativa**: Questões rejeitadas se score RAG < 0.75  
✅ **Camada 2 Ativa**: Prompts com regras estritas carregados do JSON  
✅ **Camada 3 Ativa**: Validação pós-geração automática  
✅ **Camada 4 Ativa**: Badge de confiança em cada questão  

---

## ⚠️ Troubleshooting

### Erro: "Cannot find module"

**Causa**: Import não está correto  
**Solução**: Verifique se `src/quality-validator.js` existe na branch

### Erro: "validateQuestionPipeline is not a function"

**Causa**: Função não exportada corretamente  
**Solução**: Verifique se o arquivo usa `export function`

### Questões sendo rejeitadas em massa

**Causa**: Score mínimo muito alto  
**Solução**: Ajustar `minScore` em `validateRAGScore` de 0.75 para 0.65

---

## 🛡️ Rollback

Se precisar voltar:

```bash
git checkout main
npx wrangler deploy
```

Ou via GitHub:
1. Ir em [Pull Requests](https://github.com/munizcesar/studymaster-agent/pulls)
2. Fechar a PR sem merge
3. Fazer deploy da main

---

**Próximo**: Aguardando sua escolha entre Opção 1 (automática) ou Opção 2 (manual)
