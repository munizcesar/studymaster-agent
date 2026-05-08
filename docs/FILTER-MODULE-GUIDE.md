# 📚 Módulo de Filtros de Questões - Guia de Integração e Extensão

## Visão Geral

O módulo de filtros fornece uma solução **profissional e extensível** para gerenciar filtros de questões em um sistema de estudo para concursos públicos. Implementado com três camadas desacopladas:

1. **FilterManager** (`src/filter-module.js`) — Gerenciamento de estado e lógica
2. **FilterUI** (`src/filter-ui.js`) — Componentes de interface e interatividade
3. **FilterStyles** (`src/filter-styles.css`) — Estilos responsivos e acessíveis

### Características Principais

- ✅ **Seções de filtros**: CONTEÚDO, CONCURSO, PROVA, HISTÓRICO
- ✅ **3 Presets prontos**: Treino Geral | Treino Focado | Revisão
- ✅ **Favoritos**: Salve e carregue configurações de filtros
- ✅ **Filtros ativos como tags**: Visualize e remova filtros individuais
- ✅ **Contador dinâmico**: Estimativa de questões encontradas
- ✅ **Persistência**: localStorage para favoritos
- ✅ **Responsivo**: Desktop e mobile
- ✅ **Acessibilidade**: Labels, ARIA labels, navegação por teclado

---

## 🚀 Como Integrar

### Passo 1: Incluir os scripts e estilos no HTML

```html
<!DOCTYPE html>
<html>
<head>
  <!-- ... outros estilos ... -->
  <link rel="stylesheet" href="/src/filter-styles.css">
</head>
<body>
  <!-- Seu conteúdo principal -->
  
  <!-- Container para o painel de filtros -->
  <div id="filterContainer"></div>

  <!-- Scripts -->
  <script src="/src/filter-module.js"></script>
  <script src="/src/filter-ui.js"></script>
  <script>
    // Inicializar o painel de filtros
    const filterUI = new FilterUI('filterContainer', filterManager);
  </script>
</body>
</html>
```

### Passo 2: Integrar com geração de questões

```javascript
// Listener para quando filtros são aplicados
window.addEventListener('filters-applied', (event) => {
  const filterPayload = event.detail;
  
  // Chamar sua função de geração de questões
  generateQuestions(filterPayload);
});

// Função de geração (adapt para seu backend)
async function generateQuestions(filters) {
  try {
    const response = await fetch('/api/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters)
    });
    
    const data = await response.json();
    renderQuestions(data.questions);
  } catch (error) {
    console.error('Erro ao gerar questões:', error);
  }
}
```

---

## 📖 API de FilterManager

### Métodos Principais

#### `createEmptyFilters()`
Cria um objeto de filtros vazio baseado no SCHEMA.
```javascript
const emptyFilters = filterManager.createEmptyFilters();
```

#### `setFilter(path, value)`
Define um filtro individual usando notação dot.
```javascript
filterManager.setFilter('exam.agency', 'trt');
filterManager.setFilter('content.discipline', 'portugues');
filterManager.setFilter('examMetadata.yearFrom', 2020);
```

#### `getFilter(path)`
Obtém o valor de um filtro.
```javascript
const agency = filterManager.getFilter('exam.agency');  // 'trt'
```

#### `getActiveFilters()`
Retorna array de filtros ativos (com valores não-nulos).
```javascript
const active = filterManager.getActiveFilters();
// [
//   { path: 'exam.agency', value: 'trt', label: 'TRT' },
//   { path: 'content.discipline', value: 'portugues', label: 'Português' }
// ]
```

#### `removeFilter(path)`
Remove um filtro individual.
```javascript
filterManager.removeFilter('exam.agency');
```

#### `clearAllFilters()`
Remove todos os filtros.
```javascript
filterManager.clearAllFilters();
```

#### `applyPreset(presetId)`
Aplica um template de preset.
```javascript
filterManager.applyPreset('general');   // Treino Geral
filterManager.applyPreset('focused');   // Treino Focado
filterManager.applyPreset('review');    // Revisão
```

#### `validateForPreset(presetId)`
Valida se os filtros atendem requisitos de um preset.
```javascript
const validation = filterManager.validateForPreset('focused');
// {
//   valid: false,
//   missingFields: ['exam.agency', 'exam.examBoard'],
//   errors: ['Campos obrigatórios não preenchidos: ...']
// }
```

#### `saveFavorite(name)`
Salva filtros atuais como favorito nomeado.
```javascript
const favoriteId = filterManager.saveFavorite('TRT 2024 - Português');
```

#### `loadFavorite(id)`
Carrega um favorito salvo.
```javascript
filterManager.loadFavorite(favoriteId);
```

#### `getFavorites()`
Lista todos os favoritos.
```javascript
const favorites = filterManager.getFavorites();
// [
//   { id: 'fav-...', name: 'TRT 2024 - Português', createdAt: '...', usageCount: 5 },
//   ...
// ]
```

#### `removeFavorite(id)`
Remove um favorito.
```javascript
filterManager.removeFavorite(favoriteId);
```

#### `toApiPayload()`
Converte filtros para formato de requisição API.
```javascript
const payload = filterManager.toApiPayload();
// {
//   content: { discipline, topic, subtopic, selectedNodes, keyword },
//   exam: { ... },
//   examMetadata: { ... },
//   history: { ... }
// }
```

#### `subscribe(callback)`
Subscribe a mudanças de filtros (Observer pattern).
```javascript
const unsubscribe = filterManager.subscribe((event) => {
  console.log('Filter changed:', event.eventType, event.data);
});

// Desinscrever
unsubscribe();
```

---

## 🎨 API de FilterUI

### Inicialização

```javascript
const filterUI = new FilterUI('containerId', filterManager);
```

### Métodos Públicos

#### `render()`
Renderiza o painel completo.
```javascript
filterUI.render();
```

#### `syncUIWithManager()`
Sincroniza valores de inputs com state do FilterManager.
```javascript
filterUI.syncUIWithManager();
```

#### `applyFiltersAndGenerateQuestions()`
Aplica filtros e dispara evento de geração.
```javascript
filterUI.applyFiltersAndGenerateQuestions();
```

#### `showFavoritesModal()`
Mostra modal com lista de favoritos.
```javascript
filterUI.showFavoritesModal();
```

#### `hideFavoritesModal()`
Fecha modal de favoritos.
```javascript
filterUI.hideFavoritesModal();
```

---

## 📊 Estrutura de Dados (FILTER_SCHEMA)

```javascript
{
  version: '1.0.0',
  
  content: {
    discipline: null,        // String
    topic: null,             // String
    subtopic: null,          // String
    selectedNodes: [],       // Array<String>
    keyword: ''              // String
  },
  
  exam: {
    specificExam: null,      // String
    agency: null,            // String: 'trt', 'tjdg', 'rf', etc
    examBoard: null,         // String: 'fgv', 'cesgranrio', etc
    position: null,          // String
    area: null,              // String: 'judicial', 'fiscal', etc
    educationLevel: null,    // String: 'fundamental', 'médio', etc
    sphere: null,            // String: 'federal', 'estadual', 'municipal'
    state: null              // String: 'SP', 'RJ', etc
  },
  
  examMetadata: {
    yearFrom: null,          // Number
    yearTo: null,            // Number
    questionType: null,      // String: 'multiple_choice', 'true_false', etc
    difficulty: null         // String: 'easy', 'medium', 'hard', etc
  },
  
  history: {
    statusFilter: 'all',     // String: 'all', 'solved', 'correct', 'wrong'
    excludeAnnulled: false,  // Boolean
    excludeOutdated: false,  // Boolean
    hasCommentary: false     // Boolean
  },
  
  metadata: {
    isActive: true,
    isFavorite: false,
    favoriteId: null,
    favoriteName: null,
    presetType: null,
    createdAt: null,
    lastUsed: null
  }
}
```

---

## 🔧 Como Estender o Módulo

### Adicionar um novo campo de filtro

**1. Atualizar FILTER_SCHEMA:**
```javascript
// Em src/filter-module.js
const FILTER_SCHEMA = {
  // ... existente ...
  exam: {
    // ... existente ...
    newField: null  // ← Novo campo
  }
};
```

**2. Adicionar opções (se select):**
```javascript
const FILTER_OPTIONS = {
  newField: [
    { value: 'option1', label: 'Opção 1' },
    { value: 'option2', label: 'Opção 2' }
  ]
};
```

**3. Adicionar UI no FilterUI (em filter-ui.js):**
```html
<div class="filter-group">
  <label>Novo Campo</label>
  <select id="filter-new-field" class="filter-select">
    <option value="">Selecione...</option>
    <option value="option1">Opção 1</option>
    <option value="option2">Opção 2</option>
  </select>
</div>
```

**4. Anexar event listener (em attachEventListeners):**
```javascript
this.container.querySelector('#filter-new-field').addEventListener('change', (e) => {
  this.filterManager.setFilter('exam.newField', e.target.value || null);
  this.updateUI();
});
```

### Adicionar um novo preset

```javascript
// Em src/filter-module.js
const FILTER_PRESETS = {
  // ... existentes ...
  custom_preset: {
    id: 'preset-custom',
    name: 'Meu Preset Customizado',
    description: 'Descrição do preset',
    icon: 'icon-name',
    template: {
      // Copiar FILTER_SCHEMA com valores pré-preenchidos
      content: { discipline: 'portugues', topic: null, ... },
      exam: { ... },
      examMetadata: { ... },
      history: { ... }
    },
    requiredFields: ['content.discipline'],  // Campos obrigatórios
    constraints: {
      lockedFields: [],  // Campos que não podem ser alterados
      description: 'Detalhes sobre este preset'
    }
  }
};
```

### Adicionar novo validador

```javascript
// Estender FilterManager
class FilterManager {
  // ... existente ...
  
  validateCustomRule(ruleName) {
    // Seu validador customizado
    if (ruleName === 'myRule') {
      // Lógica de validação
      return { valid: true/false, errors: [...] };
    }
  }
}
```

### Adicionar novo tipo de persistência

```javascript
// Substituir persistFavorites/loadFavorites
class FilterManager {
  // ... existente ...
  
  persistFavorites() {
    // Seu backend
    fetch('/api/favorites', {
      method: 'POST',
      body: JSON.stringify(this.favorites)
    });
  }
  
  loadFavorites() {
    // Seu backend
    return fetch('/api/favorites').then(r => r.json());
  }
}
```

---

## 🔌 Integração com Backend

### Endpoint esperado: `POST /api/quiz`

**Request body (toApiPayload):**
```javascript
{
  content: {
    discipline: 'portugues',
    topic: 'pontuacao',
    subtopic: 'virgula',
    selectedNodes: [],
    keyword: 'advérbio'
  },
  exam: {
    specificExam: null,
    agency: 'trt',
    examBoard: 'fgv',
    position: 'Analista',
    area: 'judicial',
    educationLevel: 'superior',
    sphere: 'federal',
    state: 'SP'
  },
  examMetadata: {
    yearFrom: 2020,
    yearTo: 2025,
    questionType: 'multiple_choice',
    difficulty: 'medium'
  },
  history: {
    statusFilter: 'all',
    excludeAnnulled: true,
    excludeOutdated: true,
    hasCommentary: false
  }
}
```

**Response esperada:**
```javascript
{
  questions: [
    {
      id: 1,
      statement: '...',
      options: [{ key: 'A', text: '...' }, ...],
      correctAnswer: 'A',
      explanation: '...',
      fonte: '...'
    }
  ]
}
```

### Implementação no Worker (worker.js)

```javascript
export default {
  async fetch(request, env) {
    if (request.method === 'POST' && request.url.endsWith('/api/quiz')) {
      const filters = await request.json();
      
      // Validar filtros
      const validation = validateFilters(filters);
      if (!validation.valid) {
        return new Response(
          JSON.stringify({ error: validation.errors }),
          { status: 400 }
        );
      }
      
      // Processar filtros (buscar em Vectorize, gerar com LLM, etc)
      const questions = await generateQuestions(filters, env);
      
      return new Response(JSON.stringify({ questions }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};
```

---

## 📝 Eventos e Observadores

O FilterManager dispara eventos via observer pattern:

```javascript
filterManager.subscribe((event) => {
  const { eventType, data } = event;
  
  switch (eventType) {
    case 'filters-cleared':
      console.log('Todos os filtros foram limpos');
      break;
    
    case 'filter-removed':
      console.log('Filtro removido:', data.path);
      break;
    
    case 'preset-applied':
      console.log('Preset aplicado:', data.presetId);
      break;
    
    case 'filter-changed':
      console.log('Filtro alterado:', data.path, data.value);
      break;
    
    case 'favorite-saved':
      console.log('Favorito salvo:', data.favorite.id);
      break;
    
    case 'favorite-loaded':
      console.log('Favorito carregado:', data.favorite.name);
      break;
    
    case 'favorite-removed':
      console.log('Favorito removido:', data.id);
      break;
  }
});
```

---

## 🎯 Casos de Uso Comuns

### Usar um preset
```javascript
// Treino focado no concurso TRT
filterManager.applyPreset('focused');
filterManager.setFilter('exam.agency', 'trt');
filterManager.setFilter('exam.examBoard', 'fgv');
filterManager.setFilter('exam.position', 'Analista Judiciário');

const isValid = filterManager.validateForPreset('focused').valid;
if (isValid) {
  filterUI.applyFiltersAndGenerateQuestions();
}
```

### Salvar uma configuração favorita
```javascript
// Configurar filtros
filterManager.setFilter('content.discipline', 'direito_administrativo');
filterManager.setFilter('exam.agency', 'tf');
filterManager.setFilter('examMetadata.difficulty', 'hard');

// Salvar como favorito
const favId = filterManager.saveFavorite('Adm Pública - Questões Difíceis');
```

### Carregar um favorito e gerar questões
```javascript
// Carregar
filterManager.loadFavorite(favId);

// Validar e gerar
const payload = filterManager.toApiPayload();
generateQuestions(payload);
```

### Monitorar mudanças
```javascript
filterManager.subscribe((event) => {
  if (event.eventType === 'filter-changed') {
    // Atualizar counter em tempo real
    updateQuestionCounter();
  }
});
```

---

## 🚨 Troubleshooting

### Problema: Filtros não persistem
**Solução:** Verificar se localStorage está habilitado:
```javascript
try {
  localStorage.setItem('test', 'test');
  localStorage.removeItem('test');
} catch (e) {
  console.warn('localStorage não disponível');
}
```

### Problema: Modal de favoritos não abre
**Solução:** Verificar se FilterUI foi inicializado corretamente:
```javascript
console.log(filterUI);  // Deve ser instância de FilterUI
console.log(filterManager);  // Deve ter `favorites` array
```

### Problema: Validação de preset falhando
**Solução:** Verificar campos obrigatórios:
```javascript
const validation = filterManager.validateForPreset('focused');
console.log(validation);  // Ver quais campos estão faltando
```

---

## 📚 Referências e Documentação Interna

- **Schema completo:** `FILTER_SCHEMA` em `src/filter-module.js:30-100`
- **Presets:** `FILTER_PRESETS` em `src/filter-module.js:110-250`
- **Opções de UI:** `FILTER_OPTIONS` em `src/filter-module.js:260-350`
- **Class FilterManager:** `src/filter-module.js:360-850`
- **Class FilterUI:** `src/filter-ui.js:10-600`
- **Estilos:** `src/filter-styles.css` (bem documentado com comentários)

---

## 📄 Licença e Autor

Módulo de Filtros — StudyMaster
Desenvolvido para integração com plataforma de estudo por questões.
Versão 1.0.0 — Maio 2026

---

## 🤝 Suporte e Contribuições

Para reportar bugs, sugerir melhorias ou contribuir:
- Abra uma issue no repositório
- Descreva o comportamento esperado vs atual
- Inclua exemplos de código se possível
- Mencione a versão do módulo (`FILTER_SCHEMA.version`)

---

**Última atualização:** 8 de maio de 2026
**Versão:** 1.0.0
**Status:** Stable
