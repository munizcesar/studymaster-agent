# 🔗 Guia de Integração — Filtros com Sistema Existente

## 📌 Status Atual

O módulo de filtros foi criado como um **sistema completamente desacoplado**, pronto para ser integrado com:

- Frontend (`index.html`) - Já tem estrutura para múltiplos modos de estudo
- Backend (`worker.js`) - Já tem pipeline RAG com Concursos
- Sistema de questões - Pode usar filtros para buscar/gerar questões

---

## 🎯 Cenários de Integração

### Cenário 1: "Caderno Rápido com Filtros"

Adicionar filtros ao modo de geração de questões existente.

**Localização**: Modificar `index.html` - Step 2 e 3 para incluir filtros.

**Passo a Passo**:

1. **Adicionar container de filtros antes do Step 2**:

```html
<!-- Em index.html, antes de <section id="step-2"> -->
<div id="question-filters"></div>
```

2. **Incluir scripts de filtros**:

```html
<!-- No <head> ou antes de </body> -->
<script src="/src/filters.js"></script>
<script src="/src/filters-ui.js"></script>
<link rel="stylesheet" href="/src/filters.css">
```

3. **Inicializar filtros no JavaScript do index.html**:

```javascript
// Após carregar DOM, criar instância de filtros
const questionFilters = new QuestionFilters({
  persistToStorage: true,
  storageKey: 'sm_question_filters_caderno'
});

const filtersUI = new QuestionFiltersUI(questionFilters, {
  containerId: 'question-filters',
  showPresets: true,
  expandedByDefault: false,
  onQuestionsCountChange: async (state) => {
    // Chamar API para contar questões com esses filtros
    try {
      const response = await fetch('/api/questions/count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.filters)
      });
      const { count } = await response.json();
      filtersUI.updateQuestionsCount(count);
    } catch (error) {
      console.error('Erro ao contar questões:', error);
    }
  }
});

// Escutar aplicação de filtros
document.addEventListener('filtersApplied', async (e) => {
  const appliedFilters = e.detail.filters;
  
  // Atualizar UI para mostrar que filtros foram aplicados
  console.log('[Filtros Aplicados]', appliedFilters);
  
  // Poder gerar questões com esses filtros
  state.appliedFilters = appliedFilters;
  
  // Opcional: gerar questões imediatamente
  // await generateQuestionsWithFilters(appliedFilters);
});
```

4. **Modificar função de geração de questões para respeitar filtros**:

```javascript
// Modificar função existente sendRequest() ou similar
async function generateQuestionsWithFilters(filters = null) {
  const finalFilters = filters || state.appliedFilters || {};
  
  const payload = {
    mode: state.mode,
    // ... campos existentes ...
    
    // Novos campos de filtros
    appliedFilters: finalFilters,
    discipline: finalFilters.discipline,
    topic: finalFilters.topic,
    keywordSearch: finalFilters.keywordSearch,
    yearMin: finalFilters.yearMin,
    yearMax: finalFilters.yearMax,
    difficulty: finalFilters.difficulty,
    // ... outros filtros ...
  };
  
  // Enviar para worker
  const response = await fetch(workerUrl, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  
  // Processar resposta...
}
```

---

### Cenário 2: "Modal de Filtros Rápidos"

Adicionar filtros em um modal/drawer expansível.

**HTML**:

```html
<button id="open-filters-modal" class="btn-filters">
  <i data-lucide="filter"></i>
  Filtros Avançados
</button>

<div id="filters-modal" class="modal hidden">
  <div class="modal-content">
    <button id="close-filters-modal" class="modal-close">×</button>
    <div id="modal-filters-container"></div>
  </div>
</div>
```

**JavaScript**:

```javascript
// Botão para abrir modal
document.getElementById('open-filters-modal').addEventListener('click', () => {
  document.getElementById('filters-modal').classList.remove('hidden');
  
  // Inicializar filtros se ainda não foram
  if (!window.questionFilters) {
    window.questionFilters = new QuestionFilters();
    new QuestionFiltersUI(window.questionFilters, {
      containerId: 'modal-filters-container'
    });
  }
});

// Botão para fechar
document.getElementById('close-filters-modal').addEventListener('click', () => {
  document.getElementById('filters-modal').classList.add('hidden');
});
```

---

### Cenário 3: "Mini Filtros Diretos"

Uso em telas/componentes específicas (ex: "Treino por Tópico").

```javascript
// Usar apenas os filtros específicos que precisa
const filters = new QuestionFilters();

// Aplicar preset
filters.applyPreset('general-training', {
  discipline: 'português'
});

// Obter resultado
const activeFilters = filters.getActiveFilters();
// → { discipline: 'português', resolution_status: 'all' }

// Enviar para backend
fetch('/api/questions/random', {
  method: 'POST',
  body: JSON.stringify(activeFilters)
});
```

---

## 🔄 Modificações Necessárias no Worker

O `worker.js` precisa ser atualizado para respeitar os filtros recebidos.

### Estrutura de Requisição Esperada

```javascript
{
  mode: "concursos",
  appliedFilters: {
    discipline: "português",
    topic: ["morfologia_sintaxe"],
    keywordSearch: "sujeito",
    difficulty: "medio",
    yearMin: 2020,
    yearMax: 2025,
    banca: "fgv",
    resolution_status: "all",
    // ... outros filtros
  }
}
```

### Função de Validação de Filtros (adicionar ao worker.js)

```javascript
/**
 * Valida e processa filtros recebidos do frontend
 */
function validateAndProcessFilters(filters) {
  const validated = {};
  
  // Validar disciplina
  if (filters.discipline) {
    const config = CONCURSOS_CONFIG.filters[`concursos.${filters.discipline}`];
    if (config) {
      validated.discipline = filters.discipline;
      validated.vectorizeCollection = config.vectorizeCollection;
    } else {
      return {
        error: 'Disciplina não mapeada',
        validDisciplines: Object.keys(CONCURSOS_CONFIG.filters)
      };
    }
  }
  
  // Validar anos
  if (filters.yearMin) validated.yearMin = Math.max(1950, parseInt(filters.yearMin));
  if (filters.yearMax) validated.yearMax = Math.min(new Date().getFullYear(), parseInt(filters.yearMax));
  
  // Validar banca
  if (filters.banca) {
    const validBancas = ['FGV', 'CEBRASPE', 'VUNESP', 'FCC', 'CESGRANRIO', 'IBFC', 'FUNDEP', 'FUNDATEC'];
    if (validBancas.includes(filters.banca.toUpperCase())) {
      validated.banca = filters.banca.toUpperCase();
    }
  }
  
  // Validar dificuldade
  if (filters.difficulty) {
    const validDifficulties = ['muito_facil', 'facil', 'medio', 'dificil', 'muito_dificil'];
    if (Array.isArray(filters.difficulty)) {
      validated.difficulty = filters.difficulty.filter(d => validDifficulties.includes(d));
    } else if (validDifficulties.includes(filters.difficulty)) {
      validated.difficulty = [filters.difficulty];
    }
  }
  
  // Validar keyword search
  if (filters.keywordSearch) {
    validated.keywordSearch = String(filters.keywordSearch).trim();
  }
  
  // Validar tópicos (múltiplos)
  if (filters.topic) {
    validated.topic = Array.isArray(filters.topic) 
      ? filters.topic 
      : [filters.topic];
  }
  
  // Validar histórico
  if (filters.resolution_status) {
    const validStatuses = ['all', 'not_resolved', 'resolved', 'correct', 'incorrect'];
    if (validStatuses.includes(filters.resolution_status)) {
      validated.resolution_status = filters.resolution_status;
    }
  }
  
  return { valid: true, validated };
}
```

### Modificar Pipeline RAG (worker.js)

```javascript
// Adicionar este antes da geração de prompt

async function generateQuestionWithFilters(env, filters) {
  // 1. Validar filtros
  const validation = validateAndProcessFilters(filters);
  if (!validation.valid) {
    return {
      error: validation.error,
      details: validation
    };
  }
  
  const vFilters = validation.validated;
  
  // 2. Buscar contexto do Vectorize considerando filtros
  const query = buildQueryFromFilters(vFilters);
  const context = await fetchVectorizeContext(
    env,
    vFilters.vectorizeCollection,
    query,
    200
  );
  
  // 3. Montar prompt com filtros aplicados
  const prompt = buildPromptWithFilters(vFilters, context);
  
  // 4. Gerar questão com Groq
  const question = await generateQuestionWithGroq(env, prompt);
  
  // 5. Validar resposta
  return validateQuestionResponse(question);
}

// Helper para construir query a partir de filtros
function buildQueryFromFilters(filters) {
  const parts = [];
  
  if (filters.discipline) {
    parts.push(`questão sobre ${filters.discipline}`);
  }
  
  if (filters.topic && filters.topic.length > 0) {
    parts.push(`tópicos: ${filters.topic.join(', ')}`);
  }
  
  if (filters.keywordSearch) {
    parts.push(`contendo: ${filters.keywordSearch}`);
  }
  
  if (filters.difficulty && filters.difficulty.length > 0) {
    parts.push(`dificuldade: ${filters.difficulty.join(' ou ')}`);
  }
  
  if (filters.banca) {
    parts.push(`banca ${filters.banca}`);
  }
  
  if (filters.yearMin || filters.yearMax) {
    const yearRange = `${filters.yearMin || 'antes'} até ${filters.yearMax || 'agora'}`;
    parts.push(`entre ${yearRange}`);
  }
  
  return parts.join('; ');
}

// Helper para montar prompt
function buildPromptWithFilters(filters, context) {
  return `
Com base no seguinte contexto sobre ${filters.discipline}:

${context}

Gere uma questão de estudo com as seguintes características:
- Disciplina: ${filters.discipline}
${filters.topic ? `- Tópicos: ${filters.topic.join(', ')}` : ''}
${filters.difficulty ? `- Dificuldade: ${filters.difficulty.join(' ou ')}` : '- Dificuldade: média'}
${filters.banca ? `- Banca: ${filters.banca}` : ''}
${filters.keywordSearch ? `- Deve conter: ${filters.keywordSearch}` : ''}

Retorne em JSON estruturado com: pergunta, alternativas (A-E), resposta_correta, explicacao
  `;
}
```

---

## 📊 Endpoint de API para Contagem

Criar endpoint `/api/questions/count` no backend:

```javascript
// Pseudocódigo (implementar em seu backend)
async function handleQuestionsCount(request) {
  const filters = await request.json();
  
  // Validar filtros
  const validation = validateAndProcessFilters(filters);
  if (!validation.valid) {
    return new Response(JSON.stringify({ error: validation.error }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Contar questões com esses filtros
  // (implementar lógica específica do seu banco)
  const count = await countQuestionsInDatabase(validation.validated);
  
  return new Response(JSON.stringify({
    count: count,
    filters: filters,
    timestamp: Date.now()
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

---

## 🧪 Teste Rápido

Para testar integração sem modificar código principal:

```html
<!DOCTYPE html>
<html>
<head>
  <script src="/src/filters.js"></script>
  <script src="/src/filters-ui.js"></script>
  <link rel="stylesheet" href="/src/filters.css">
</head>
<body>
  <h1>Teste de Filtros</h1>
  <div id="test-filters"></div>

  <script>
    // Criar instância
    const filters = new QuestionFilters();
    const ui = new QuestionFiltersUI(filters, {
      containerId: 'test-filters'
    });

    // Log de mudanças
    document.addEventListener('filtersApplied', (e) => {
      console.log('Filtros aplicados:', e.detail.filters);
      
      // Simular contagem
      const count = Math.floor(Math.random() * 100);
      ui.updateQuestionsCount(count);
    });

    // Debug
    filters.debug();
  </script>
</body>
</html>
```

---

## 📋 Checklist de Integração

- [ ] Copiar `src/filters.js` para projeto
- [ ] Copiar `src/filters-ui.js` para projeto
- [ ] Copiar `src/filters.css` para projeto
- [ ] Incluir scripts em `index.html`
- [ ] Criar container HTML para filtros
- [ ] Inicializar `QuestionFilters` e `QuestionFiltersUI`
- [ ] Conectar evento `filtersApplied` com função de busca
- [ ] Implementar `/api/questions/count` no backend
- [ ] Validar filtros no backend (`worker.js`)
- [ ] Testar em diferentes resoluções (desktop, tablet, mobile)
- [ ] Testar persistência no localStorage
- [ ] Testar presets
- [ ] Documentar mudanças no README
- [ ] Fazer commit com mensagem descritiva

---

## 🚀 Próximos Passos Recomendados

1. **Integrar com modo atual** (onde houver geração de questões)
2. **Implementar contagem real** no backend
3. **Adicionar persistência** de filtros favoritos (salvar/carregar por nome)
4. **Analytics**: rastrear quais filtros são mais usados
5. **UX melhorado**: predições de filtros baseado em histórico

---

## 📞 Suporte

Se tiver dúvidas sobre integração:

1. Consulte `FILTERS-DOCUMENTATION.md` para referência de API
2. Veja exemplos em `Exemplo: Integração com Backend`
3. Use `filters.debug()` para inspecionar estado
4. Abra issue no GitHub com contexto específico

---

**Última atualização**: 08/05/2026
