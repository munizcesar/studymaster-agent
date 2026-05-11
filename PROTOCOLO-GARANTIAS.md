# 🔒 Protocolo de Garantias - StudyMaster

## Objetivo

Garantir que **100% das questões geradas sejam fundamentadas, corretas e sem alucinações**, implementando validação em 5 camadas independentes.

---

## 🎯 Camadas de Garantia

### ✅ Camada 1: Validação na Fonte (RAG)
**Arquivo**: `src/quality-validator.js` - função `validateRAGScore()`

**O que faz**:
- Verifica se o contexto recuperado do Vectorize tem score mínimo de **0.75**
- Exige pelo menos **1 chunk relevante**
- Calcula score médio dos top 3 resultados

**Comportamento**:
```javascript
// Se score < 0.75
return {
  error: "Material insuficiente",
  message: "Por favor, forneça mais conteúdo sobre este tópico"
};
```

**Peso no sistema**: ~5 linhas de código, ~50ms de overhead

---

### ✅ Camada 2: Regras Estritas no Prompt
**Arquivo**: `config/prompts-anti-alucinacao.json`

**Regras obrigatórias injetadas no prompt**:
1. ✅ **SEMPRE citar entre aspas** o trecho exato do material fonte
2. ✅ **Criar 3 distratores** baseados em conceitos relacionados DO MATERIAL
3. ❌ **PROIBIDO inventar**: dados numéricos, nomes próprios, datas
4. ❌ **PROIBIDO usar termos vagos**: "geralmente", "normalmente", "pode ser", "talvez"
5. ✅ **Formato obrigatório**: [Contexto] + [Pergunta] + [4 alternativas] + [Justificativa com citação]

**Verificação de Resposta Correta**:
- Resposta correta DEVE estar literalmente no material fornecido
- Explicar POR QUE as outras 3 estão erradas

**Peso no sistema**: +2KB no arquivo JSON

---

### ✅ Camada 3: Validação Pós-Geração
**Arquivo**: `src/quality-validator.js` - função `validateQuestion()`

**Checks automáticos** (roda em ~50ms no Workers):

| Check | Peso | Verificação |
|-------|------|----------------|
| **hasCitation** | 30% | Questão contém citação direta (aspas) |
| **answerInMaterial** | 30% | Resposta correta existe no material fonte |
| **uniqueOptions** | 20% | Todas as 4 alternativas são únicas |
| **noBannedWords** | 20% | Zero palavras banidas (talvez, geralmente, etc) |

**Score mínimo aceitável**: 75%

**Comportamento**:
```javascript
if (score < 0.75) {
  return {
    approved: false,
    failures: ["Explicação não contém citação direta"]
  };
}
```

**Peso no sistema**: +1KB JavaScript

---

### ✅ Camada 4: Badge de Confiança
**Arquivo**: `src/quality-validator.js` - função `generateConfidenceBadge()`

**O que mostra ao usuário**:
```html
✓ Fundamentada em 3 trechos do material
✓ Confiabilidade: 94%
✓ Validada por protocolo anti-alucinação
```

**Níveis de confiança**:
- 🟢 **Muito Alta** (90-100%): Questão perfeita
- 🟢 **Alta** (75-89%): Questão confiável
- 🟡 **Média** (60-74%): Revisar manualmente
- 🔴 **Baixa** (<60%): Rejeitada automaticamente

**Peso no sistema**: +500 bytes HTML/CSS

---

### ✅ Camada 5: Dupla Checagem (Áreas Críticas)
**Status**: Preparado no JSON, implementação futura

**Áreas críticas**: Direito, Medicina, Engenharia

**Como funcionará**:
1. Gera 2 versões da questão com prompts ligeiramente diferentes
2. Compara se ambas chegam à mesma resposta correta
3. Se divergirem → descarta e solicita mais material

---

## 📏 Resumo de Peso Total

| Componente | Peso | Latency |
|------------|------|----------|
| Validação RAG (Camada 1) | ~5 linhas | ~30ms |
| Prompts anti-alucinação (Camada 2) | +2KB JSON | 0ms |
| Validador automático (Camada 3) | +1KB JS | ~50ms |
| Badge de confiança (Camada 4) | +500 bytes | 0ms |
| **TOTAL** | **~3.5KB** | **~80ms** |

✅ **Impacto**: Mínimo - menos de 4KB e <100ms de overhead

---

## 🚀 Como Usar

### Opção 1: Import no Worker (Recomendado)

```javascript
// No início do worker.js
import { validateQuestionPipeline } from './src/quality-validator.js';

// Após gerar questão com IA
const result = validateQuestionPipeline(
  ragResults,           // Resultado do Vectorize.query()
  generatedQuestion,    // Questão gerada pela IA
  contextMaterial       // Material fonte usado
);

if (!result.success) {
  return new Response(JSON.stringify({
    error: result.error,
    message: result.message
  }), { status: result.statusCode });
}

// Questão aprovada - retornar com badge
return new Response(JSON.stringify({
  question: result.question,
  badge: result.metadata.badge
}));
```

### Opção 2: Uso Manual (Para Testes)

```javascript
import { validateRAGScore, validateQuestion } from './src/quality-validator.js';

// Testar apenas validação RAG
const ragCheck = validateRAGScore(ragResults, 0.75, 1);
console.log(ragCheck);
// { valid: true, score: 0.87, chunks: 3 }

// Testar apenas validação de questão
const qCheck = validateQuestion(question, sourceMaterial);
console.log(qCheck);
// { approved: true, score: 0.95, confidenceLevel: "Muito Alta" }
```

---

## 🧪 Como Testar Esta Branch

### 1. Deploy Local (Wrangler)

```bash
# Checkout da branch
git checkout feature/quality-protocols

# Deploy local para testar
npx wrangler dev

# Ou deploy para preview
npx wrangler deploy --env preview
```

### 2. Teste Manual via cURL

```bash
curl -X POST https://seu-worker.workers.dev/generate \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "concursos",
    "filter": "concursos.portugues",
    "quantity": 1,
    "difficulty": "medium"
  }'
```

**Respostas esperadas**:

✅ **Sucesso** (score >= 0.75):
```json
{
  "question": {...},
  "badge": {
    "confidence": "Alta",
    "score": "94%",
    "message": "✓ Fundamentada em 3 trechos do material"
  }
}
```

❌ **Rejeitada** (material insuficiente):
```json
{
  "error": "RAG_INSUFFICIENT",
  "message": "Material encontrado tem baixa relevância (62%). Refine sua busca."
}
```

❌ **Rejeitada** (questão sem qualidade):
```json
{
  "error": "QUALITY_CHECK_FAILED",
  "message": "Questão gerada não passou na validação",
  "details": ["Explicação não contém citação direta"]
}
```

### 3. Teste Automático (Opcional)

Criar `test-quality.js`:

```javascript
import { validateQuestion } from './src/quality-validator.js';

const testQuestion = {
  statement: "Qual é a capital do Brasil?",
  options: [
    { key: "A", text: "São Paulo" },
    { key: "B", text: "Brasília" },
    { key: "C", text: "Rio de Janeiro" },
    { key: "D", text: "Salvador" }
  ],
  correctAnswer: "B",
  explanation: 'Segundo a CF/88, art. 18: "Brasília é a Capital Federal".'
};

const result = validateQuestion(testQuestion, "CF/88, art. 18: Brasília é a Capital Federal");
console.log(result);
// { approved: true, score: 1.0, confidenceLevel: "Muito Alta" }
```

Rodar:
```bash
node test-quality.js
```

---

## ⚠️ Como Voltar ao Ponto Anterior

Se algo quebrar, execute:

```bash
# Voltar para a branch main
git checkout main

# Ou fazer rollback do deploy
npx wrangler rollback
```

**Comando de emergência** (se site ficar fora do ar):
```bash
git checkout main
npx wrangler deploy --env production
```

---

## 📊 Melhorias Futuras

- [ ] Implementar Camada 5 (dupla checagem para Direito)
- [ ] Dashboard de métricas de qualidade
- [ ] A/B test: questões com vs sem protocolo
- [ ] Feedback do usuário integrado ao score
- [ ] Cache de questões validadas (Redis/KV)

---

## 👥 Contato

Dúvidas sobre o protocolo? Abra uma issue ou entre em contato.

**Versão**: 2.0.0  
**Data**: 10/05/2026  
**Status**: 🟡 Em Testes (branch `feature/quality-protocols`)
