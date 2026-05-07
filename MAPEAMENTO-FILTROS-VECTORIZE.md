# 📊 Mapeamento Explícito: Filtros Concursos → Coleções Vectorize

**Status**: ✅ Atualizado  
**Data**: 07/05/2026  
**Versão**: 2.0 (Com 6 matérias)

---

## 📋 Tabela de Mapeamento 1:1

| Chave Interna | Label no UI | Coleção Vectorize | Min Context |
|---|---|---|---|
| `concursos.portugues` | Português | `concursos_portugues` | 200 chars |
| `concursos.direito_constitucional` | Direito Constitucional | `concursos_direito_constitucional` | 300 chars |
| `concursos.direito_administrativo` | Direito Administrativo | `concursos_direito_administrativo` | 300 chars |
| `concursos.raciocinio_logico` | Raciocínio Lógico | `concursos_rlm` | 150 chars |
| `concursos.informatica` | Informática | `concursos_informatica` | 250 chars |
| `concursos.administracao_publica` | Administração Pública | `concursos_adm_publica` | 300 chars |

---

## 🔗 Fluxo Request → Backend

### Frontend (index.html)
```javascript
// Usuário clica em "Português" no Step 2
state.filter = "concursos.portugues"

// Payload enviado ao worker
const payload = {
  mode: "concursos",
  filter: "concursos.portugues",  // ← Chave interna 1:1
  difficulty: "medium",
  quantity: 1,
  ...
}
```

### Backend (worker.js)

```javascript
// PASSO 1: Validar filter na tabela CONCURSOS_CONFIG.filters
validateConcursosFilter("concursos.portugues")
// → Procura em CONCURSOS_CONFIG.filters["concursos.portugues"]
// → Retorna config com vectorizeCollection = "concursos_portugues"

// PASSO 2: Buscar contexto Vectorize
fetchVectorizeContext(env, "concursos_portugues", query, 200)
// → Consulta coleção "concursos_portugues" no Vectorize
// → Retorna { context, sufficient, sources }

// PASSO 3: Gerar questão com Groq
// → LLM usa contexto recuperado
// → Validação remove alucinações
// → Retorna questão formatada
```

---

## 🏗️ Arquitetura Interna (worker.js)

### CONCURSOS_CONFIG.filters (Tabela Principal)

```javascript
const CONCURSOS_CONFIG = {
  filters: {
    'concursos.portugues': {
      label: 'Português',
      description: 'Gramática, regência, semântica, interpretação',
      vectorizeCollection: 'concursos_portugues',  // ← Mapeamento explícito
      minContextLength: 200,
      forbiddenPatterns: [...],
      conceptualBases: '...',
    },
    'concursos.direito_administrativo': {
      // ... 5 matérias adicionais
    },
  },
  
  // Mapeamento reverso (para debugging)
  collectionToFilter: {
    'concursos_portugues': 'concursos.portugues',
    'concursos_direito_administrativo': 'concursos.direito_administrativo',
    // ...
  },
}
```

### Função validateConcursosFilter

```javascript
function validateConcursosFilter(filter) {
  // Busca exatamente essa chave na tabela
  const config = CONCURSOS_CONFIG.filters[filter];
  
  if (!config) {
    // Erro EXPLÍCITO se não mapeado
    return {
      valid: false,
      error: `Filtro não mapeado: "${filter}". Opções: concursos.portugues, ...`,
      userMessage: 'Escolha uma matéria disponível...'
    };
  }
  
  return { valid: true, config };
}
```

---

## 🎨 Interface (index.html)

### concursosFilters (Dados da UI)
```javascript
const concursosFilters = {
  'concursos.portugues': {        // ← Chave = mesma do backend
    label: 'Português',
    icon: 'book-open',
    description: 'Gramática, regência...',
  },
  'concursos.direito_administrativo': {
    // ... 5 matérias adicionais
  },
}
```

### Step 2 Render
```javascript
// Itera sobre concursosFilters
Object.entries(concursosFilters).map(([key, filter]) => {
  // key = "concursos.portugues"
  // Quando user clica, state.filter = key
  // Envia key exatamente como está no backend
})
```

---

## ⚠️ Validações & Erros

### Se filter inválido chegar ao backend

```
Request: { mode: "concursos", filter: "portugues" }
              ↓
validateConcursosFilter("portugues")
              ↓
NOT FOUND em CONCURSOS_CONFIG.filters
              ↓
Response 400:
{
  "error": "Filtro não mapeado: \"portugues\". Opções: concursos.portugues, ...",
  "userMessage": "O filtro \"portugues\" não foi reconhecido. Escolha: Português, Direito Const., ..."
}
```

### Garantias
✅ **Nunca fallback silencioso** para coleção genérica  
✅ **Sempre retorna erro explícito** se chave não mapeia  
✅ **Mensagem amigável** para o usuário (em userMessage)  
✅ **Log de erro** no console (developer debugging)

---

## 🚀 Como Estender (Futuro)

### Adicionar Nova Matéria

Quando quiser adicionar nova matéria (ex: Direito Penal):

**1. Backend (worker.js)**: Adicionar em `CONCURSOS_CONFIG.filters`

```javascript
'concursos.direito_penal': {
  label: 'Direito Penal',
  description: 'Crimes, penas, teoria geral do delito',
  vectorizeCollection: 'concursos_direito_penal',
  minContextLength: 300,
  forbiddenPatterns: [...],
  conceptualBases: 'CP, CPP, Doutrina penalista',
}
```

**2. Frontend (index.html)**: Adicionar em `concursosFilters`

```javascript
'concursos.direito_penal': {
  label: 'Direito Penal',
  icon: 'gavel',
  description: 'Crimes, penas, teoria geral do delito',
}
```

**3. Vectorize**: Criar coleção `concursos_direito_penal` e popular

✅ Pronto! Sistema automaticamente reconhece novo filtro

---

## 🔮 Preparação para Futuro (Sem Implementar Agora)

### Arquitetura Preparada para area e estilo

```javascript
// NO FUTURO, estrutura como:
'concursos.direito_administrativo': {
  label: 'Direito Administrativo',
  vectorizeCollection: 'concursos_direito_administrativo',
  
  // FUTURO: Valores opcionais
  // area: 'administracao_geral' | 'policial' | 'tribunais' | null (qualquer)
  // estilo: 'multipla_escolha' | 'certo_errado' | null (qualquer)
  
  minContextLength: 300,
  forbiddenPatterns: [...],
}
```

### Como isso facilitaria:
- Selecionar matéria + carreira → coleção mais específica
- Selecionar matéria + estilo → prompt customizado
- Sem quebrar código atual (apenas estende)

---

## 📍 Localização do Código

| Item | Arquivo | Linhas |
|------|---------|--------|
| Tabela de mapeamento | worker.js | 20-103 |
| Validação de filtro | worker.js | 106-125 |
| Pipeline RAG | worker.js | 656-780 |
| Dados de UI | index.html | 1645-1685 |
| Render Step 2 | index.html | 2108-2141 |
| Validação Step | index.html | 2019-2027 |

---

## ✅ Garantias do Sistema

| Aspecto | Garantia |
|---------|----------|
| **Mapeamento** | 1:1 entre chave → coleção, nenhuma ambiguidade |
| **Validação** | Sempre rejeita filtro inválido com erro claro |
| **Extensibilidade** | Adicionar matéria = 10 linhas (5 backend + 5 frontend) |
| **Compatibilidade** | Modo Academic e Livre continuam 100% funcionais |
| **UX** | Usuario vê apenas matérias disponíveis, sem opções vazias |
| **Sem marcas** | Nenhuma menção a bancas ou plataformas externas |

---

## 🎯 Princípios de Design

1. **Clareza**: Chaves internas legíveis (`concursos.<materia>`)
2. **Explicitação**: Tabela centralizada, fácil consultar mapping
3. **Fail-Fast**: Erro imediato se filter não mapear
4. **Escalabilidade**: Preparado para area + estilo (futuro)
5. **Manutenibilidade**: Uma única tabela CONCURSOS_CONFIG.filters

---

**Referência rápida**: Sempre que adicionar matéria ou coleção Vectorize, atualizar **ambos** `CONCURSOS_CONFIG.filters` (worker.js) e `concursosFilters` (index.html) em sincronia.
