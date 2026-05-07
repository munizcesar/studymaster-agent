# 🏗️ Arquitetura RAG para Modo Concursos - StudyMaster

**Versão**: 1.0  
**Data**: 07/05/2026  
**Objetivo**: Sistema robusto de filtros + RAG com máxima coerência académica e mínima alucinação

---

## 📊 Visão Geral da Arquitetura

```
┌──────────────────────────────────────────────────────────────────┐
│                    INTERFACE (index.html)                        │
│                                                                  │
│  Modo: [ Concursos ] [ ENEM ] [ Estudo Geral ]                 │
│  Matéria: [ Português ] [ Dir. Const. ] [ Rac. Lógico ] ...    │
│                                                                  │
└────────────────────┬─────────────────────────────────────────────┘
                     │
                     │ POST /api/generateQuestion
                     │ { mode: "concursos", filter: "portugues" }
                     ↓
┌──────────────────────────────────────────────────────────────────┐
│               WORKER.JS (rag-handler.js)                         │
│                                                                  │
│  1. Validar mapeamento (filtro → coleção)                       │
│     └─ taxonomy-concursos.json                                  │
│                                                                  │
│  2. Recuperar contexto do Vectorize                             │
│     └─ concursos_portugues, concursos_direito_const, ...        │
│                                                                  │
│  3. Construir prompt anti-alucinação                            │
│     └─ prompts-anti-alucinacao.json                             │
│                                                                  │
│  4. Chamar LLM (Claude/GPT)                                     │
│     └─ com contexto + constraints                               │
│                                                                  │
│  5. Validar saída contra alucinações                            │
│     └─ regexes, field checks, bank validation                   │
│                                                                  │
│  6. Retornar questão + metadados                                │
│     └─ { success, question, sources, ragscore }                 │
└──────────────────────────────────────────────────────────────────┘
                     │
                     │ /api/generateQuestion response
                     ↓
┌──────────────────────────────────────────────────────────────────┐
│              INTERFACE - Exibir Questão                          │
│                                                                  │
│  [Questão]                                                       │
│  [A] Opção A  [B] Opção B  [C] Opção C  [D] Opção D  [E] Opção E│
│                                                                  │
│  Base conceitual: CF/88, arts. 37-41                            │
│  Fonte: [Concursos - Administração Pública]                     │
│  Confiabilidade RAG: 95%                                        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Estrutura de Arquivos

```
studymaster-agent/
├── config/
│   ├── taxonomy-concursos.json          # Taxonomia de filtros
│   └── prompts-anti-alucinacao.json     # Prompts por matéria
│
├── src/
│   ├── rag-handler.js                   # Pipeline RAG principal
│   └── test-rag-quality.js              # Testes de qualidade
│
└── docs/
    └── RAG-ARCHITECTURE.md              # Este arquivo
```

---

## 🔑 Componentes Principais

### 1. **Taxonomia de Filtros** (`taxonomy-concursos.json`)

Define:
- Matérias disponíveis (Português, Dir. Const., etc)
- Mapeamento filtro → coleção Vectorize
- Tópicos por matéria
- Bases conceituais

**Estrutura**:
```json
{
  "subjects": {
    "portugues": {
      "label": "Português",
      "vectorizeCollection": "concursos_portugues",
      "topics": [...],
      "conceptualBases": [...]
    }
  },
  "filterMapping": {
    "concursos": {
      "portugues": {
        "internalKey": "concursos_portugues",
        "vectorizeCollection": "concursos_portugues",
        "minContextLength": 200
      }
    }
  }
}
```

### 2. **Prompts Anti-Alucinação** (`prompts-anti-alucinacao.json`)

Define para CADA matéria:
- Padrões proibidos (banca, concurso, ano)
- Regras específicas (ex: CF/88 para Dir. Const.)
- Bases conceituais esperadas

**Exemplo - Direito Constitucional**:
```json
{
  "forbiddenPatterns": ["STF entendeu", "julgado em", "acórdão número"],
  "conceptualBases": "CF/88, Jurisprudência STF/STJ"
}
```

### 3. **RAG Handler** (`rag-handler.js`)

Pipeline em 6 etapas:

```javascript
1. validateFilterMapping()
   ↓ Valida: modo.filtro → coleção

2. retrieveVectorizeContext()
   ↓ Busca semântica + retorna fontes

3. buildAntiHallucinationPrompt()
   ↓ Injeta contexto + constraints

4. llmClient.generateQuestion()
   ↓ Chama Claude/GPT

5. validateAgainstHallucination()
   ↓ Remove padrões proibidos

6. return { success, question, metadata }
   ↓ Retorna ao frontend
```

### 4. **Testes de Qualidade** (`test-rag-quality.js`)

5 testes automatizados:
1. Validação de mapeamento de filtros
2. Detecção de alucinações
3. Validação de estrutura
4. Construção de prompts
5. Fluxo end-to-end

---

## 🔄 Fluxo de Geração de Questão (Detalhado)

### Exemplo: Usuário seleciona "Concursos → Português"

```javascript
// Frontend envia:
POST /api/generateQuestion
{
  "mode": "concursos",
  "filter": "portugues",
  "topic": "regencia_verbal" // opcional
}
```

```javascript
// Worker.js (rag-handler.js):

// 1. VALIDAÇÃO
const mapping = validateFilterMapping("concursos", "portugues");
// Retorna: { valid: true, collection: "concursos_portugues", ... }

// 2. RECUPERAÇÃO DE CONTEXTO
const context = await retrieveVectorizeContext(
  vectorizeClient,
  "concursos_portugues",  // coleção
  "regencia verbal",       // query
  200                      // minContextLength
);
// Retorna: { context: "...", sources: [...], sufficient: true }

// 3. CONSTRUÇÃO DE PROMPT
const prompt = buildAntiHallucinationPrompt(
  "portugues",
  context.context,
  context.sufficient
);

// PROMPT resultado:
/*
Você é um especialista em geração de questões de português...

CONTEXTO FORNECIDO:
[Conteúdo sobre regência verbal recuperado do Vectorize]

RESTRIÇÕES OBRIGATÓRIAS:
- NÃO invente nome de banca
- NÃO cite provas reais
- Use APENAS conceitos do contexto acima

PADRÕES PROIBIDOS:
- "prova de"
- "edital"
- "banca"

Responda em JSON com: statement, options[], correctAnswer, explanation...
*/

// 4. CHAMADA AO LLM
const response = await claude.messages.create({
  model: "claude-3-5-sonnet-20241022",
  messages: [
    { role: "user", content: prompt }
  ]
});

// 5. VALIDAÇÃO PÓS-GERAÇÃO
const question = JSON.parse(response.content[0].text);
const validation = validateAgainstHallucination(
  question,
  "portugues",
  context.sources
);

// Verifica:
// - Campos obrigatórios presentes
// - Nenhum padrão proibido
// - Alternativas válidas
// - Resposta correta válida
// - Banca não mencionada (ou validada contra contexto)

// 6. RETORNO
return {
  success: true,
  question: validation.corrected,
  metadata: {
    vectorizeCollection: "concursos_portugues",
    contextLength: 450,
    contextSufficient: true,
    sources: [
      { source: "PCI_Concursos", banca: "FCC", relevance: 0.95 },
      { source: "ENEM", banca: null, relevance: 0.87 }
    ],
    ragscore: 0.95,
    conceptualBasis: "Regência verbal - NCCFL"
  }
};
```

---

## 🚨 Anti-Alucinação: Mecanismos

### 1. **Nível Prompt**
```
RESTRIÇÕES OBRIGATÓRIAS:
- NÃO invente nome de banca
- NÃO cite provas reais
- Use APENAS conceitos no contexto

Padrões proibidos:
- "banca FCC"
- "prova de 2023"
- "edital"
```

### 2. **Nível Validação**
```javascript
// Detectar padrões
const forbiddenPatterns = [
  "\\b(banca|concurso|prova|edital|ano de \\d{4})\\b",
  "\\b(ESAF|FCC|VUNESP)\\b"
];

// Se detectado e não estiver no contexto → remover/normalizar
if (pattern.matches(question.explanation)) {
  if (!contextSources.some(s => s.banca === "FCC")) {
    question.explanation = question.explanation.replace(/FCC/g, "[banca]");
  }
}
```

### 3. **Fallback Gracioso**
```javascript
// Se contexto insuficiente:
return {
  success: true,
  mode: "fallback",
  question: genericQuestion,
  disclosure: "Questão genérica - base específica indisponível",
  ragscore: 0.6
};
```

---

## 📋 Validação de Estrutura

Após gerar, validar:

```javascript
const validation = {
  requiredFields: ["statement", "options", "correctAnswer", "explanation"],
  optionCount: { min: 4, max: 5 },
  letters: ["A", "B", "C", "D", "E"],
  
  checks: [
    "❌ statement vazio?" → ERRO,
    "❌ options < 4?" → ERRO,
    "❌ correctAnswer ∉ [A-E]?" → ERRO,
    "❌ explanation < 30 chars?" → ERRO,
    "⚠️  Banca mencionada?" → AVISAR,
    "⚠️  Padrão proibido?" → REMOVER
  ]
};
```

---

## 🔌 Integração com Frontend (index.html)

### Mudanças Esperadas:

1. **Seletor de Matéria**
```html
<select id="concursos-subject" name="subject">
  <option value="portugues">Português</option>
  <option value="direito_constitucional">Direito Constitucional</option>
  <option value="raciocinio_logico">Raciocínio Lógico</option>
  <option value="informatica">Informática</option>
  <option value="administracao_publica">Administração Pública</option>
</select>
```

2. **Envio de Filtro**
```javascript
// Quando usuário clica "Gerar Questão"
const params = {
  mode: "concursos",
  filter: document.getElementById("concursos-subject").value,
  // Futura expansão:
  // bankStyle: "fcc", // opcional
  // topic: "regencia_verbal" // opcional
};

fetch("/api/generateQuestion", {
  method: "POST",
  body: JSON.stringify(params)
});
```

3. **Exibição de Metadados**
```html
<!-- Após gerar questão -->
<div class="question-source">
  <small>
    Fonte: Concursos - Português
    | Base: NCCFL, Gramática normativa
    | Confiabilidade RAG: 95%
  </small>
</div>
```

---

## 📊 Mapeamento Filtro → Coleção Vectorize

```
concursos.portugues
  → concursos_portugues
  → minContextLength: 200 caracteres

concursos.direito_constitucional
  → concursos_direito_constitucional
  → minContextLength: 300 caracteres

concursos.raciocinio_logico
  → concursos_raciocinio_logico
  → minContextLength: 150 caracteres

concursos.informatica
  → concursos_informatica
  → minContextLength: 250 caracteres

concursos.administracao_publica
  → concursos_administracao_publica
  → minContextLength: 300 caracteres
```

**Comportamento se não houver coleção**:
```
❌ Coleção não encontrada
  ↓
Modo: "fallback"
Mensagem: "Desculpe, ainda não temos base suficiente para {subject}"
Questão: Genérica (sem banca/ano)
Disclosure: "Esta é uma questão genérica"
```

---

## 🧪 Testes Incluídos

Executar:
```bash
node src/test-rag-quality.js
```

Testa:
1. ✓ Mapeamento de filtros válido
2. ✓ Detecção de alucinações
3. ✓ Validação de estrutura
4. ✓ Construção de prompts
5. ✓ Fluxo end-to-end

---

## 🎯 Próximas Fases

### Fase 2: Estilos de Banca (Futura)
- Adicionar `bankStyle` (FCC, CEBRASPE, VUNESP, etc)
- Customizar formato de saída por banca
- Validação específica por estilo

### Fase 3: Tópicos Específicos (Futura)
- Permitir user selecionar tópico sub-categoria
- Refinar busca Vectorize por tópico
- Aumentar relevância

### Fase 4: Feedback do Usuário
- Coletar feedback se questão foi útil
- Ajustar score RAG baseado em feedback
- Iterar sobre prompts

---

## 📚 Referências nos Arquivos

- **`taxonomy-concursos.json`**: Estrutura de filtros e mapeamentos
- **`prompts-anti-alucinacao.json`**: Prompts por matéria
- **`rag-handler.js`**: Implementação do pipeline RAG
- **`test-rag-quality.js`**: Testes de qualidade

---

**Versão**: 1.0  
**Última atualização**: 07/05/2026  
**Status**: ✅ Pronto para implementação em worker.js
