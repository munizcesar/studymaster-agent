# 📋 Documentação — Módulo de Filtros de Questões

## 📑 Índice

1. [Visão Geral](#visão-geral)
2. [Instalação e Uso Rápido](#instalação-e-uso-rápido)
3. [API do Módulo de Filtros](#api-do-módulo-de-filtros)
4. [API da UI](#api-da-ui)
5. [Exemplos de Uso](#exemplos-de-uso)
6. [Presets Disponíveis](#presets-disponíveis)
7. [Estendendo os Filtros](#estendendo-os-filtros)
8. [Integração com Backend](#integração-com-backend)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O módulo de filtros é um sistema **desacoplado e reutilizável** para filtrar questões de estudo com múltiplos critérios:

### Seções de Filtros

- **CONTEÚDO**: Disciplina, Tópico, Subtópico, Busca por palavra-chave
- **CONCURSO**: Concurso, Órgão, Banca, Cargo, Área, Educação, Esfera, UF
- **PROVA**: Ano, Modalidade da questão, Nível de dificuldade
- **HISTÓRICO**: Status de resolução, exclusões, comentários

### Características

✅ **Desacoplado**: Usa apenas JavaScript puro, sem dependências externas  
✅ **Reutilizável**: Pode ser usado em qualquer página/modal  
✅ **Persistente**: Suporta salvar filtros no localStorage  
✅ **Extensível**: Fácil adicionar novos filtros/presets  
✅ **Acessível**: Segue padrões WCAG 2.1  
✅ **Responsivo**: Funciona em desktop, tablet e mobile  

---

## 🚀 Instalação e Uso Rápido

### 1. Incluir scripts no HTML

```html
<!-- No <head> ou antes de </body> -->
<script src="/src/filters.js"></script>
<script src="/src/filters-ui.js"></script>
<link rel="stylesheet" href="/src/filters.css">
```

### 2. Criar elemento container

```html
<div id="filters-container"></div>
```

### 3. Inicializar em JavaScript

```javascript
// Criar instância do gerenciador de filtros
const filters = new QuestionFilters({
  persistToStorage: true,        // Salvar no localStorage
  storageKey: 'my_filters'       // Chave para localStorage
});

// Criar UI
const filtersUI = new QuestionFiltersUI(filters, {
  containerId: 'filters-container',
  showPresets: true,
  expandedByDefault: false,
  onQuestionsCountChange: (state) => {
    console.log('Contador atualizado:', state.count);
    // Fazer requisição à API para contar questões
    updateQuestionsCount(state.count);
  }
});

// Escutar mudanças nos filtros
document.addEventListener('filtersApplied', (e) => {
  console.log('Filtros aplicados:', e.detail.filters);
  // Fazer requisição à API com os filtros
  fetchQuestions(e.detail.filters);
});
```

---

## 📚 API do Módulo de Filtros

### Construtor

```javascript
const filters = new QuestionFilters(options);
```

**Parâmetros:**
- `options.persistToStorage` (boolean, default: false) - Salvar no localStorage
- `options.storageKey` (string, default: 'sm_question_filters') - Chave de storage

---

### Métodos de Filtros

#### `addFilter(filterKey, value)`

Adiciona ou atualiza um filtro.

```javascript
// Filtro de valor único
filters.addFilter('discipline', 'português');
filters.addFilter('difficulty', 'dificil');
filters.addFilter('yearMin', 2020);

// Filtro de múltiplos valores
filters.addFilter('topic', 'morfologia_sintaxe');
filters.addFilter('topic', 'concordancia_regencia');

// Retorna true se bem-sucedido, false se valor inválido
const success = filters.addFilter('discipline', 'invalid');
```

---

#### `removeFilter(filterKey)`

Remove um filtro completamente.

```javascript
filters.removeFilter('discipline');
filters.removeFilter('difficulty');
```

---

#### `removeFilterValue(filterKey, value)`

Remove apenas um valor de um filtro com múltiplos valores.

```javascript
filters.removeFilterValue('topic', 'morfologia_sintaxe');
```

---

#### `clearAllFilters()`

Limpa todos os filtros de uma vez.

```javascript
filters.clearAllFilters();
```

---

#### `getActiveFilters()`

Retorna objeto com filtros ativos (non-null).

```javascript
const active = filters.getActiveFilters();
// → {
//     discipline: 'português',
//     difficulty: 'dificil',
//     yearMin: 2020,
//     topic: ['morfologia_sintaxe', 'concordancia_regencia'],
//     ...
//   }
```

---

#### `getActiveFiltersByCategory()`

Retorna filtros agrupados por categoria (para renderizar UI organizada).

```javascript
const grouped = filters.getActiveFiltersByCategory();
// → {
//   conteudo: {
//     discipline: { label: 'Disciplina', value: 'português', ... },
//     topic: { label: 'Tópico / Assunto', value: [...], ... },
//   },
//   concurso: { ... },
//   prova: { ... },
//   historico: { ... }
// }
```

---

#### `applyPreset(presetKey, overrides)`

Aplica um preset de filtros pré-configurado.

```javascript
// Preset básico
filters.applyPreset('general-training');

// Preset com sobreposição
filters.applyPreset('focused-training', {
  exam: 'oab-1fase',
  banca: 'fgv',
  discipline: 'direito_constitucional'
});
```

---

#### `getAllPresets()`

Lista todos os presets disponíveis.

```javascript
const presets = filters.getAllPresets();
// → [
//   { key: 'general-training', label: '...', description: '...' },
//   { key: 'focused-training', label: '...', description: '...' },
//   ...
// ]
```

---

#### `getPresetMetadata(presetKey)`

Obtém metadados detalhados de um preset.

```javascript
const meta = filters.getPresetMetadata('focused-training');
// → {
//   label: 'Treino Focado no Meu Concurso',
//   description: '...',
//   helper: '...',
//   required: ['exam', 'banca'],
//   optional: ['discipline', 'area']
// }
```

---

#### `validatePresetRequirements(presetKey)`

Valida se filtros atuais atendem requisitos de um preset.

```javascript
const validation = filters.validatePresetRequirements('focused-training');
// → {
//   valid: false,
//   missing: ['exam', 'banca']
// }
```

---

### Métodos de Conteúdo

#### `getContentTree(disciplineKey?)`

Obtém árvore de disciplinas/tópicos/subtópicos.

```javascript
// Árvore completa
const tree = filters.getContentTree();

// Apenas uma disciplina
const portuguese = filters.getContentTree('português');
// → {
//   label: 'Português',
//   topics: {
//     'morfologia_sintaxe': {
//       label: 'Morfologia e Sintaxe',
//       subtopics: ['classes_palavras', 'analise_sintatica', ...]
//     },
//     ...
//   }
// }
```

---

#### `getTopicsForDiscipline(disciplineKey)`

Lista tópicos de uma disciplina.

```javascript
const topics = filters.getTopicsForDiscipline('português');
// → [
//   { key: 'morfologia_sintaxe', label: 'Morfologia e Sintaxe' },
//   { key: 'concordancia_regencia', label: 'Concordância e Regência' },
//   ...
// ]
```

---

#### `getSubtopicsForTopic(disciplineKey, topicKey)`

Lista subtópicos de um tópico.

```javascript
const subtopics = filters.getSubtopicsForTopic('português', 'morfologia_sintaxe');
// → [
//   'classes_palavras',
//   'analise_sintatica',
//   'estrutura_oracao',
//   ...
// ]
```

---

### Métodos de Listeners

#### `onChange(callback)`

Registra listener para mudanças nos filtros.

```javascript
// Retorna função para desinscrever
const unsubscribe = filters.onChange((state) => {
  console.log('Filtros mudaram!', state);
  // state = {
  //   activeFilters: { ... },
  //   filterCount: 5,
  //   timestamp: 1234567890
  // }
});

// Desinscrever depois
unsubscribe();
```

---

### Métodos de Persistência

#### `exportAsJSON()`

Exporta filtros atuais como JSON (para salvar como "favorito").

```javascript
const json = filters.exportAsJSON();
// → {
//   "filters": { ... },
//   "exportedAt": "2026-05-08T10:30:00.000Z",
//   "version": "1.0"
// }

// Salvar como arquivo
const blob = new Blob([json], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'meus-filtros.json';
a.click();
```

---

#### `importFromJSON(jsonString)`

Importa filtros de um JSON.

```javascript
const success = filters.importFromJSON(jsonString);
if (success) {
  console.log('Filtros importados!');
}
```

---

---

## 🎨 API da UI

### Construtor

```javascript
const filtersUI = new QuestionFiltersUI(filtersInstance, options);
```

**Parâmetros:**
- `filtersInstance` (QuestionFilters) - Instância do gerenciador
- `options.containerId` (string, default: 'filters-container') - ID do container
- `options.showPresets` (boolean, default: true) - Mostrar presets
- `options.expandedByDefault` (boolean, default: false) - Expandir seções
- `options.onQuestionsCountChange` (function) - Callback para contador

---

### Métodos da UI

#### `updateQuestionsCount(count)`

Atualiza o contador de questões encontradas.

```javascript
filtersUI.updateQuestionsCount(42);
```

---

#### `destroy()`

Destroi o componente e limpa listeners.

```javascript
filtersUI.destroy();
```

---

---

## 💡 Exemplos de Uso

### Exemplo 1: Setup Básico

```javascript
// HTML
<div id="filters-widget"></div>

// JavaScript
const filters = new QuestionFilters({ persistToStorage: true });
const ui = new QuestionFiltersUI(filters, {
  containerId: 'filters-widget'
});

// Escutar aplicação de filtros
document.addEventListener('filtersApplied', async (e) => {
  const response = await fetch('/api/questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(e.detail.filters)
  });
  const questions = await response.json();
  displayQuestions(questions);
});
```

---

### Exemplo 2: Usar Preset

```javascript
// Botão "Treinar OAB"
document.querySelector('#btn-oab').addEventListener('click', () => {
  filters.applyPreset('focused-training', {
    exam: 'oab-1fase',
    banca: 'fgv',
    discipline: 'direito_constitucional'
  });
});
```

---

### Exemplo 3: Validação de Filtros

```javascript
function setupFiltersWithValidation() {
  const presetKey = 'focused-training';
  
  const validation = filters.validatePresetRequirements(presetKey);
  
  if (!validation.valid) {
    console.log('Filtros faltando:', validation.missing);
    
    // Mostrar mensagem ao usuário
    showWarning(`Por favor, preencha: ${validation.missing.join(', ')}`);
  }
}
```

---

### Exemplo 4: Carregar Filtros Salvos

```javascript
// Salvar como favorito
function saveAsFavorite(name) {
  const json = filters.exportAsJSON();
  localStorage.setItem(`favorite_${name}`, json);
}

// Carregar favorito
function loadFavorite(name) {
  const json = localStorage.getItem(`favorite_${name}`);
  if (json) {
    filters.importFromJSON(json);
    ui.updateUI();
  }
}
```

---

### Exemplo 5: Integração com Backend

```javascript
// No handler de aplicação de filtros
document.addEventListener('filtersApplied', async (e) => {
  const filters = e.detail.filters;
  
  try {
    // Chamar endpoint de contagem
    const countResponse = await fetch('/api/questions/count', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters)
    });
    const { count } = await countResponse.json();
    
    // Atualizar UI
    ui.updateQuestionsCount(count);
    
    // Se há questões, buscar elas
    if (count > 0) {
      const questionsResponse = await fetch('/api/questions/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...filters, limit: 10, offset: 0 })
      });
      const questions = await questionsResponse.json();
      displayQuestions(questions);
    }
  } catch (error) {
    console.error('Erro ao buscar questões:', error);
    showError('Erro ao carregar questões');
  }
});
```

---

## 🎯 Presets Disponíveis

### 1. `general-training`

**Treino Geral por Assunto**

- Foca em disciplina e tópico
- Sem restrições de banca ou ano
- Ideal para aprender um assunto específico

```javascript
filters.applyPreset('general-training');
// Requer: discipline
// Opcionais: topic, subtopic
```

---

### 2. `focused-training`

**Treino Focado no Meu Concurso**

- Filtra por banca e órgão
- Priprioriza últimos 5 anos
- Ideal para preparação específica

```javascript
filters.applyPreset('focused-training', {
  exam: 'oab-1fase',
  banca: 'fgv'
});
// Requer: exam, banca
// Restrição: últimos 5 anos
```

---

### 3. `revision-mistakes`

**Revisão do Que Errei**

- Mostra apenas questões erradas
- Mantém filtros de conteúdo
- Ideal para focar em fraquezas

```javascript
filters.applyPreset('revision-mistakes');
// Requer: discipline
// Default: resolution_status = 'incorrect'
```

---

### 4. `simulation`

**Simulado / Teste Cronometrado**

- Gera questões de um concurso
- Até últimos 7 anos
- Ideal para praticar provas completas

```javascript
filters.applyPreset('simulation', {
  exam: 'tj-sp'
});
// Requer: exam
```

---

### 5. `weak-topics`

**Reforço de Tópicos Fracos**

- Foca em erros de um tópico específico
- Ajuda a corrigir fraquezas
- Ideal para revisão focada

```javascript
filters.applyPreset('weak-topics', {
  discipline: 'português',
  topic: 'concordancia_regencia'
});
// Requer: discipline, topic
```

---

---

## 🔧 Estendendo os Filtros

### Adicionar Novo Filtro

**Passo 1**: Defina o esquema em `QuestionFilters.initializeFilterSchemas()`

```javascript
// Em filters.js, dentro de initializeFilterSchemas()

novo_filtro: {
  category: 'prova',  // conteudo, concurso, prova, ou historico
  label: 'Meu Novo Filtro',
  type: 'string',  // string, number, boolean
  multiple: false,  // ou true para múltiplos valores
  validValues: ['value1', 'value2', 'value3'],  // opcional
  transform: (v) => v.toLowerCase(),  // opcional
  description: 'Descrição do filtro'
}
```

**Passo 2**: Adicione UI para o filtro em `QuestionFiltersUI.buildHTML()`

```html
<!-- Dentro de buildContentSection() ou outra seção apropriada -->
<div class="filter-group">
  <label for="filter-novo" class="filter-label">
    <span>Meu Novo Filtro</span>
  </label>
  <select id="filter-novo" class="filter-select" data-filter="novo_filtro">
    <option value="">Selecione...</option>
    <option value="value1">Valor 1</option>
    <option value="value2">Valor 2</option>
    <option value="value3">Valor 3</option>
  </select>
</div>
```

**Passo 3**: Teste a integração

```javascript
const filters = new QuestionFilters();
filters.addFilter('novo_filtro', 'value1');
console.log(filters.getActiveFilters());
```

---

### Adicionar Novo Preset

**Passo 1**: Defina o preset em `QuestionFilters.initializePresets()`

```javascript
// Em filters.js, dentro de initializePresets()

'meu-preset': {
  label: 'Meu Preset',
  description: 'Descrição do preset',
  defaultFilters: {
    discipline: 'português',
    difficulty: 'medio'
  },
  required: ['discipline'],
  optional: ['topic', 'difficulty'],
  restrictions: {
    yearMin: 2020,
    yearMax: 2025
  },
  helper: 'Dica para o usuário'
}
```

**Passo 2**: Teste

```javascript
const filters = new QuestionFilters();
filters.applyPreset('meu-preset');
console.log(filters.getActiveFilters());
```

---

### Estender a Árvore de Conteúdo

**Adicionar nova disciplina:**

```javascript
// Em initializeContentTree()

'direito_penal': {
  label: 'Direito Penal',
  topics: {
    'teoria_geral_do_delito': {
      label: 'Teoria Geral do Delito',
      subtopics: ['tipicidade', 'antijuricidade', 'culpabilidade']
    },
    'crimes_contra_pessoa': {
      label: 'Crimes contra a Pessoa',
      subtopics: ['homicidio', 'lesao_corporal', 'sequestro']
    }
    // ... mais tópicos
  }
}
```

---

### Adicionar novo tipo de filtro booleano

```javascript
// Em initializeFilterSchemas()

novo_boolean_filter: {
  category: 'historico',
  label: 'Novo Filtro Booleano',
  type: 'boolean',
  multiple: false,
  description: 'Descrição'
}

// Em buildHistorySection() (ou seção apropriada)
<label class="checkbox-item">
  <input type="checkbox" data-filter="novo_boolean_filter" class="filter-checkbox">
  <span class="checkbox-label">Novo Filtro Booleano</span>
</label>
```

---

---

## 🔌 Integração com Backend

### Estrutura de Requisição

Quando filtros são aplicados, enviar para o backend:

```javascript
const filters = {
  // CONTEÚDO
  discipline: 'português',
  topic: ['morfologia_sintaxe', 'concordancia_regencia'],
  subtopic: ['classes_palavras'],
  keywordSearch: 'sujeito',

  // CONCURSO
  exam: 'oab-1fase',
  banca: 'fgv',
  organ: 'PJ',
  position: 'Advogado',
  area: 'adm_geral',
  education_level: 'superior',
  sphere: 'estadual',
  state: 'SP',

  // PROVA
  yearMin: 2020,
  yearMax: 2025,
  questionType: 'multipla_escolha',
  difficulty: ['medio', 'dificil'],

  // HISTÓRICO
  resolution_status: 'incorrect',
  exclude_annulled: true,
  exclude_outdated: true,
  only_commented: false
};
```

### Endpoint de Contagem

```javascript
POST /api/questions/count
Content-Type: application/json

{
  discipline: 'português',
  topic: ['morfologia_sintaxe'],
  ...
}

Response:
{
  count: 42,
  filters: { ... },
  timestamp: 1234567890
}
```

### Endpoint de Busca

```javascript
POST /api/questions/search
Content-Type: application/json

{
  discipline: 'português',
  topic: ['morfologia_sintaxe'],
  limit: 10,
  offset: 0,
  sort: 'difficulty'  // opcional
}

Response:
{
  questions: [
    {
      id: 'q123',
      text: 'Enunciado...',
      discipline: 'português',
      topic: 'morfologia_sintaxe',
      subtopic: 'classes_palavras',
      difficulty: 'medio',
      year: 2023,
      banca: 'fgv',
      exam: 'oab-1fase',
      type: 'multipla_escolha',
      ...
    }
  ],
  total: 42,
  offset: 0,
  limit: 10
}
```

---

---

## 🆘 Troubleshooting

### Problema: "Lucide icons não aparecem"

**Solução**: Incluir e inicializar Lucide:

```html
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
<script>
  lucide.createIcons();
</script>
```

---

### Problema: "Filtros não persistem ao recarregar"

**Solução**: Ativar `persistToStorage`:

```javascript
const filters = new QuestionFilters({
  persistToStorage: true,
  storageKey: 'my_filters'
});
```

---

### Problema: "Tópicos não aparecem após selecionar disciplina"

**Solução**: Verificar se disciplina está na árvore de conteúdo:

```javascript
const tree = filters.getContentTree('portuguesa');
if (!tree) {
  console.error('Disciplina não existe na árvore');
}
```

---

### Problema: "Contador de questões não atualiza"

**Solução**: Implementar callback de contagem:

```javascript
const ui = new QuestionFiltersUI(filters, {
  onQuestionsCountChange: async (state) => {
    const response = await fetch('/api/questions/count', {
      method: 'POST',
      body: JSON.stringify(state.filters)
    });
    const { count } = await response.json();
    ui.updateQuestionsCount(count);
  }
});
```

---

### Problema: "Estilos CSS conflitando com projeto"

**Solução**: Usar namespace CSS:

```css
/* Em filters.css */
#filters-container .filters-section { ... }
#filters-container .filter-chip { ... }
```

---

---

## 📊 Estrutura de Arquivos

```
src/
├── filters.js              ← Lógica de filtros (sem UI)
├── filters-ui.js           ← Componente visual
├── filters.css             ← Estilos
└── FILTERS-DOCUMENTATION.md ← Este arquivo
```

---

## 🤝 Contribuindo

Para adicionar novos filtros ou melhorar o módulo:

1. Edite `src/filters.js` para adicionar lógica
2. Edite `src/filters-ui.js` para adicionar UI
3. Edite `src/filters.css` para adicionar estilos
4. Atualize esta documentação

---

## 📝 Changelog

### v1.0 (2026-05-08)

- ✅ Implementação inicial do módulo de filtros
- ✅ Suporte a 4 seções (CONTEÚDO, CONCURSO, PROVA, HISTÓRICO)
- ✅ 5 presets pré-configurados
- ✅ UI responsiva e acessível
- ✅ Persistência no localStorage
- ✅ Exportação/Importação de filtros como JSON

---

**Última atualização**: 08/05/2026  
**Mantido por**: Desenvolvedor StudyMaster  
**Versão**: 1.0
