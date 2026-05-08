# 🏗️ Arquitetura do Módulo de Filtros - Diagrama e Explicação

## Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  index.html                                                  │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │ FilterPanel (FilterUI Component)                       │  │  │
│  │  │ ┌──────────────────────────────────────────────────┐   │  │  │
│  │  │ │ Presets: Geral | Concurso | Revisão             │   │  │  │
│  │  │ │ ┌───────────────────────────────────────────┐    │   │  │  │
│  │  │ │ │ CONTEÚDO (Disciplina, Tópico, Keyword)  │    │   │  │  │
│  │  │ │ │ CONCURSO (Órgão, Banca, Cargo, etc)     │    │   │  │  │
│  │  │ │ │ PROVA (Anos, Tipo, Dificuldade)         │    │   │  │  │
│  │  │ │ │ HISTÓRICO (Status, Excluir Anuladadas)  │    │   │  │  │
│  │  │ │ └───────────────────────────────────────────┘    │   │  │  │
│  │  │ │ Filtros Aplicados (Tags com X para remover)      │   │  │  │
│  │  │ │ Contador: "523 questões encontradas"             │   │  │  │
│  │  │ │ [Gerar Questões] [Favoritos]                     │   │  │  │
│  │  │ └──────────────────────────────────────────────────┘   │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
         │                                                │
         │ event: 'filters-applied'                       │ subscribe()
         │ Payload: { content, exam, examMetadata,... }   │
         │                                                │
         ▼                                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       FILTER MANAGER                                │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  filterManager (FilterModule.js)                             │  │
│  │                                                              │  │
│  │  STATE:                                                      │  │
│  │  ├── filters (FILTER_SCHEMA)                                │  │
│  │  │   ├── content { discipline, topic, subtopic, keyword }   │  │
│  │  │   ├── exam { agency, examBoard, position, ... }          │  │
│  │  │   ├── examMetadata { yearFrom, yearTo, difficulty }      │  │
│  │  │   ├── history { statusFilter, excludeAnnulled, ... }     │  │
│  │  │   └── metadata { isActive, presetType, ... }             │  │
│  │  │                                                          │  │
│  │  ├── favorites [] (localStorage)                            │  │
│  │  ├── observers [] (observer pattern)                        │  │
│  │  └── isDirty (boolean)                                      │  │
│  │                                                              │  │
│  │  METHODS:                                                    │  │
│  │  ├── setFilter(path, value)                                │  │
│  │  ├── getFilter(path)                                        │  │
│  │  ├── getActiveFilters()                                     │  │
│  │  ├── removeFilter(path)                                     │  │
│  │  ├── clearAllFilters()                                      │  │
│  │  ├── applyPreset(presetId)                                 │  │
│  │  ├── validateForPreset(presetId)                           │  │
│  │  ├── saveFavorite(name) / loadFavorite(id)                │  │
│  │  ├── toApiPayload() → JSON para backend                    │  │
│  │  └── subscribe(callback) / notifyObservers()              │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
         │ JSON Payload                       │
         │ { content, exam, examMetadata,...} │
         │                                    │
         ▼                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API BACKEND                                 │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  POST /api/quiz                                              │  │
│  │                                                              │  │
│  │  VALIDAÇÃO:                                                  │  │
│  │  ├── Validar tipos (string, number, boolean)                │  │
│  │  ├── Validar ranges (ex: 2000-2026 para anos)              │  │
│  │  └── Validar enum values (ex: agency ∈ VALID_AGENCIES)     │  │
│  │                                                              │  │
│  │  PROCESSAMENTO:                                              │  │
│  │  ├── Mapear filters.exam.agency → banco de dados            │  │
│  │  ├── Mapear filters.content.discipline → Vectorize          │  │
│  │  ├── Mapear filters.history.statusFilter → SQL WHERE        │  │
│  │  ├── Combinar todas as condições (AND)                      │  │
│  │  └── Buscar questões + gerar/selecionar com LLM             │  │
│  │                                                              │  │
│  │  RESPOSTA: { questions: [...] }                             │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
         │
         │ JSON { questions: [{id, statement, options, correctAnswer, ...}]}
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    RENDERING / STORAGE                              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  renderQuestions(questions)                                  │  │
│  │  ├── Renderizar cada questão como card                       │  │
│  │  ├── Attach listeners (responder, ver gabarito)              │  │
│  │  └── Armazenar tentativas em localStorage/backend            │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Componentes Principais

### 1. FilterManager (src/filter-module.js)

**Responsabilidade:** Gerenciar estado dos filtros e lógica de negócio

```javascript
FilterManager {
  // STATE
  filters: {
    content: {},     // Disciplina, Tópico, etc
    exam: {},        // Órgão, Banca, etc
    examMetadata: {},// Anos, Dificuldade, etc
    history: {},     // Status, Exclusões, etc
    metadata: {}     // Preset aplicado, etc
  },
  favorites: [],     // Favoritos em localStorage
  observers: [],     // Callbacks para mudanças
  
  // METHODS
  setFilter(path, value)
  getFilter(path)
  applyPreset(presetId)
  validateForPreset(presetId)
  saveFavorite(name)
  loadFavorite(id)
  toApiPayload()
  subscribe(callback)
  notifyObservers(eventType, data)
}
```

### 2. FilterUI (src/filter-ui.js)

**Responsabilidade:** Renderizar painel e sincronizar com FilterManager

```javascript
FilterUI {
  // DOM
  container: HTMLElement
  filterManager: FilterManager
  
  // METHODS
  render()              // Renderizar HTML completo
  attachEventListeners()// Anexar handlers
  syncUIWithManager()   // Carregar values do state
  updateUI()            // Atualizar tags e counter
  
  // HELPERS
  applyPreset(presetId)
  updateActiveFiltersTags()
  updateQuestionCounter()
  showFavoritesModal()
  applyFiltersAndGenerateQuestions()
}
```

### 3. FilterStyles (src/filter-styles.css)

**Responsabilidade:** Estilos responsivos e tema

```css
.filter-panel                 /* Container principal */
.filter-header                /* Presets e ações */
.filter-active-tags           /* Tags de filtros aplicados */
.filter-section               /* Accordion de seções */
.filter-section-content       /* Conteúdo expansível */
.filter-group                 /* Grupo de inputs */
.filter-footer                /* Contador e botão apply */
.filter-favorites-modal       /* Modal overlay */
```

---

## Data Flow (Fluxo de Dados)

### 1. Usuário seleciona um filtro

```
User selects "Português" dropdown
    │
    ▼
<select id="filter-discipline" > triggers 'change' event
    │
    ▼
filterManager.setFilter('content.discipline', 'portugues')
    │
    ├─ Updates: filters.content.discipline = 'portugues'
    ├─ Sets: isDirty = true
    └─ Calls: notifyObservers('filter-changed', {path, value})
    │
    ▼
filterUI.onFilterChange() callback triggered
    │
    ▼
filterUI.updateUI()
    ├─ updateActiveFiltersTags() — Mostra tags
    └─ updateQuestionCounter()   — Atualiza contador
```

### 2. Usuário clica "Gerar Questões"

```
User clicks "Gerar Questões" button
    │
    ▼
filterUI.applyFiltersAndGenerateQuestions()
    │
    ▼
payload = filterManager.toApiPayload()
    │
    ├─ Convert filters to API format
    └─ {
         content: { discipline: 'portugues', ... },
         exam: { agency: 'trt', ... },
         examMetadata: { yearFrom: 2020, ... },
         history: { statusFilter: 'all', ... }
       }
    │
    ▼
window.dispatchEvent(new CustomEvent('filters-applied', {detail: payload}))
    │
    ▼
Frontend listener: window.addEventListener('filters-applied', (event) => {
    │
    ├─ fetch('/api/quiz', {
    │   method: 'POST',
    │   body: JSON.stringify(event.detail)
    │ })
    │
    ▼
Backend validates & processes filters
    │
    └─ response.json() { questions: [...] }
    │
    ▼
renderQuestions(questions)
```

### 3. Usuário salva como favorito

```
User clicks heart icon
    │
    ▼
filterUI.showFavoritesModal()
    │
    ▼
User clicks "Salvar Filtro Atual"
    │
    ▼
name = prompt('Nome para este filtro:')
    │
    ▼
filterManager.saveFavorite(name)
    │
    ├─ Create: { id, name, filters, createdAt, usageCount }
    ├─ Add to: filterManager.favorites[]
    ├─ Persist: localStorage.setItem('studymaster-filter-favorites', JSON.stringify())
    └─ Notify: notifyObservers('favorite-saved', {favorite})
    │
    ▼
filterUI.showFavoritesModal() refreshes list
    │
    └─ User clicks favorito → filterManager.loadFavorite(id)
       ├─ Copy favorito.filters to filterManager.filters
       ├─ Update usage stats
       └─ Notify observers
```

---

## Estrutura de Pastas Recomendada

```
studymaster-agent/
│
├── src/
│   ├── filter-module.js       ← FilterManager (gerenciamento de estado)
│   ├── filter-ui.js           ← FilterUI (componentes)
│   ├── filter-styles.css      ← Estilos
│   ├── rag-handler.js         (existente)
│   └── ...outros arquivos
│
├── docs/
│   ├── FILTER-MODULE-GUIDE.md              ← Documentação completa
│   ├── FILTER-MODULE-SUMMARY.md            ← Resumo executivo
│   ├── FILTER-INTEGRATION-EXAMPLE.js       ← Exemplo code
│   ├── RAG-ARCHITECTURE.md     (existente)
│   └── ...outros docs
│
├── FILTER-MODULE-IMPLEMENTATION-CHECKLIST.md    ← Passo-a-passo
├── FILTER-MODULE-QUICKSTART.md                  ← Quick start
├── test-filter-module.html                      ← Demo/teste
│
├── index.html                  (modificar: incluir scripts/styles)
├── worker.js                   (modificar: aceitar novos filtros)
│
└── ...outros arquivos
```

---

## Design Decisions & Trade-offs

| Decision | Why | Trade-off |
|----------|-----|-----------|
| Observer Pattern | Desacoplamento entre FilterManager e UI | Pequena overhead de callbacks |
| localStorage para favoritos | Simples, funciona offline | Limite 5MB, não sincroniza entre devices |
| Accordion para seções | Reduz cognitive load, familiar UX | Mais cliques que flat layout |
| Client-side filtering (histórico) | Rápido, sem round-trip | Precisão limitada (precisa dados locais) |
| Notação dot para paths | Flexível, fácil extensão | String parsing necessário |
| CSS Grid para layout | Responsivo automático, moderno | Precisa fallbacks para browsers antigos |

---

## Extensões Futuras (Fase 2+)

### 1. Persistência de Filtros em Backend
```
localStorage (current)
    │
    └─→ Backend API (future)
        GET  /api/filters/favorites
        POST /api/filters/favorites
        DELETE /api/filters/favorites/{id}
```

### 2. Machine Learning para Recomendações
```
User performance data
    │
    └─→ Analyze weak areas
        │
        └─→ Suggest filters
            "Você errou Português em 40% das vezes. Treinar?"
```

### 3. Sincronização Multi-device
```
Desktop saves favorite
    │
    └─→ Cloud storage (Firebase, etc)
        │
        └─→ Mobile loads favorite
```

### 4. Analytics & Insights
```
Track:
├─ Most used filters
├─ Avg performance per filter
├─ Time spent per question
└─ Success rate by difficulty

Display dashboard:
└─ "Melhor desempenho em: Direito Administrativo (72%)"
```

---

## Performance Considerations

### Current Approach
- **Render:** O(n) onde n = número de filtros (pequeno)
- **State Update:** O(1) setFilter
- **Search:** O(1) localStorage (pequenininho)
- **API Call:** Network bound (Cloudflare)

### Optimization Points
1. **Debounce counter updates** (reduzir requisições)
2. **Lazy-load select options** (se muitas disciplinas)
3. **Cache API responses** (30s TTL)
4. **Virtual scrolling** (se favorites > 100)

### Memory Usage
- FilterManager state: ~2KB (simples objetos)
- favorites localStorage: ~50KB (típico, 20 favoritos)
- DOM nodes (UI): ~100 nodes (aceitável)

---

## Testes & QA

### Manual Testing
- ✅ Desktop Chrome/Firefox/Safari
- ✅ Tablet iPad/Android
- ✅ Mobile iPhone/Android
- ✅ Dark mode
- ✅ Keyboard navigation
- ✅ Screen reader (NVDA/JAWS)

### Automated Testing (Future)
```javascript
test('setFilter and getFilter', () => {
  const fm = new FilterManager();
  fm.setFilter('exam.agency', 'trt');
  expect(fm.getFilter('exam.agency')).toBe('trt');
});

test('applyPreset validation', () => {
  const fm = new FilterManager();
  const validation = fm.validateForPreset('focused');
  expect(validation.valid).toBe(false);
});
```

---

## Security Considerations

- ✅ Input validation (FilterManager valida tipos)
- ✅ No sensitive data em localStorage
- ✅ XSS prevention (innerHTML apenas em templates)
- ✅ CORS handling (endpoint /api/quiz deve validar origin)
- ⚠️ Rate limiting (implementar no backend se necessário)

---

## Conclusão

A arquitetura é **modular**, **extensível** e **bem separada de responsabilidades**:

- **FilterManager** = Pura lógica, sem conhecimento de DOM
- **FilterUI** = Renderização e interatividade, delegando estado
- **Backend** = Validação e processamento de queries

Isso permite fácil manutenção, testes e evolução futura! 🚀

---

**Diagrama criado em:** 8 de maio de 2026  
**Versão:** 1.0.0
