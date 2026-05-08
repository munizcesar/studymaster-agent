# ⚡ Quick Reference — Módulo de Filtros

## 🚀 Setup em 30 Segundos

```html
<!-- Incluir -->
<script src="/src/filters.js"></script>
<script src="/src/filters-ui.js"></script>
<link rel="stylesheet" href="/src/filters.css">

<!-- Container -->
<div id="filters"></div>

<!-- Usar -->
<script>
  const filters = new QuestionFilters();
  new QuestionFiltersUI(filters, { containerId: 'filters' });
  
  document.addEventListener('filtersApplied', (e) => {
    console.log('Filtros:', e.detail.filters);
  });
</script>
```

---

## 📚 API de Referência Rápida

### Adicionar/Remover Filtros

```javascript
// Adicionar
filters.addFilter('discipline', 'português');
filters.addFilter('difficulty', 'dificil');
filters.addFilter('yearMin', 2020);

// Múltiplos valores
filters.addFilter('topic', 'morfologia_sintaxe');
filters.addFilter('topic', 'concordancia_regencia');

// Remover um
filters.removeFilter('discipline');

// Remover valor específico (múltiplos)
filters.removeFilterValue('topic', 'morfologia_sintaxe');

// Limpar tudo
filters.clearAllFilters();
```

---

### Obter Filtros

```javascript
// Filtros ativos
const active = filters.getActiveFilters();
// { discipline: 'português', yearMin: 2020, topic: [...], ... }

// Agrupado por categoria
const grouped = filters.getActiveFiltersByCategory();
// { conteudo: {...}, concurso: {...}, prova: {...}, historico: {...} }

// Contar ativos
const count = Object.keys(filters.getActiveFilters()).length;
```

---

### Presets

```javascript
// Listar
const presets = filters.getAllPresets();

// Aplicar
filters.applyPreset('general-training');
filters.applyPreset('focused-training', {
  exam: 'oab-1fase',
  banca: 'fgv'
});

// Validar requisitos
const valid = filters.validatePresetRequirements('focused-training');
// { valid: false, missing: ['exam', 'banca'] }

// Obter metadados
const meta = filters.getPresetMetadata('general-training');
```

---

### Árvore de Conteúdo

```javascript
// Árvore completa
const tree = filters.getContentTree();

// Uma disciplina
const port = filters.getContentTree('português');

// Tópicos de uma disciplina
const topics = filters.getTopicsForDiscipline('português');
// [{ key: 'morfologia_sintaxe', label: 'Morfologia e Sintaxe' }, ...]

// Subtópicos de um tópico
const subtopics = filters.getSubtopicsForTopic('português', 'morfologia_sintaxe');
// ['classes_palavras', 'analise_sintatica', ...]
```

---

### Persistência

```javascript
// Exportar para JSON
const json = filters.exportAsJSON();
// Salvar em arquivo ou localStorage

// Importar de JSON
filters.importFromJSON(jsonString);
```

---

### Listeners

```javascript
// Escutar mudanças
const unsubscribe = filters.onChange((state) => {
  console.log('Filtros mudaram:', state.activeFilters);
  console.log('Total de filtros:', state.filterCount);
});

// Desinscrever
unsubscribe();
```

---

## 🎨 API de UI Referência Rápida

### Criar/Destruir

```javascript
// Criar
const ui = new QuestionFiltersUI(filtersInstance, {
  containerId: 'filters-container',
  showPresets: true,
  expandedByDefault: false,
  onQuestionsCountChange: (state) => {
    console.log('Contador:', state.count);
  }
});

// Destruir
ui.destroy();
```

---

### Atualizar UI

```javascript
// Atualizar contador
ui.updateQuestionsCount(42);

// Renderizar novamente
ui.render();
```

---

## 🔧 Tipos de Filtro

### CONTEÚDO

| Chave | Tipo | Múltiplos | Valores |
|-------|------|----------|---------|
| `discipline` | string | ❌ | português, direito_constitucional, ... |
| `topic` | string | ✅ | depende da disciplina |
| `subtopic` | string | ✅ | depende do tópico |
| `keywordSearch` | string | ❌ | qualquer texto |

---

### CONCURSO

| Chave | Tipo | Múltiplos | Valores |
|-------|------|----------|---------|
| `exam` | string | ❌ | oab-1fase, tj-sp, inss-analista, ... |
| `organ` | string | ❌ | PJ, MP, Tribunais, Polícia, ... |
| `banca` | string | ❌ | FGV, CEBRASPE, VUNESP, FCC, ... |
| `position` | string | ❌ | texto livre |
| `area` | string | ❌ | policial, fiscal, tribunais, ... |
| `education_level` | string | ❌ | fundamental, médio, técnico, superior |
| `sphere` | string | ❌ | federal, estadual, municipal |
| `state` | string | ❌ | SP, RJ, BA, ... (UF) |

---

### PROVA

| Chave | Tipo | Múltiplos | Valores |
|-------|------|----------|---------|
| `yearMin` | number | ❌ | 1950-2025 |
| `yearMax` | number | ❌ | 1950-2025 |
| `questionType` | string | ❌ | multipla_escolha, certo_errado, discursiva, resposta_curta |
| `difficulty` | string | ✅ | muito_facil, facil, medio, dificil, muito_dificil |

---

### HISTÓRICO

| Chave | Tipo | Múltiplos | Valores |
|-------|------|----------|---------|
| `resolution_status` | string | ❌ | all, not_resolved, resolved, correct, incorrect |
| `exclude_annulled` | boolean | ❌ | true/false |
| `exclude_outdated` | boolean | ❌ | true/false |
| `only_commented` | boolean | ❌ | true/false |

---

## 📋 5 Presets

```javascript
// 1. Treino Geral por Assunto
filters.applyPreset('general-training');
// Requer: discipline

// 2. Treino Focado no Meu Concurso
filters.applyPreset('focused-training', {
  exam: 'oab-1fase',
  banca: 'fgv'
});
// Requer: exam, banca | Restrição: últimos 5 anos

// 3. Revisão do Que Errei
filters.applyPreset('revision-mistakes');
// Requer: discipline | Default: resolution_status = 'incorrect'

// 4. Simulado / Teste Cronometrado
filters.applyPreset('simulation', { exam: 'tj-sp' });
// Requer: exam | Restrição: últimos 7 anos

// 5. Reforço de Tópicos Fracos
filters.applyPreset('weak-topics', {
  discipline: 'português',
  topic: 'concordancia_regencia'
});
// Requer: discipline, topic
```

---

## 🔍 Debug

```javascript
// Ver estado completo
filters.debug();

// Ver filtros ativos com labels
Object.entries(filters.getActiveFiltersByCategory()).forEach(([cat, f]) => {
  console.log(cat, f);
});

// Validar um filtro específico
const info = filters.getFilterInfo('discipline');
console.log(info);

// Contar questões potenciais (mock)
const count = 42;
ui.updateQuestionsCount(count);
```

---

## 🧪 Teste Rápido

```html
<!DOCTYPE html>
<html>
<body>
  <div id="test"></div>
  
  <script src="/src/filters.js"></script>
  <script src="/src/filters-ui.js"></script>
  <link rel="stylesheet" href="/src/filters.css">
  
  <script>
    const f = new QuestionFilters();
    new QuestionFiltersUI(f, { containerId: 'test' });
    
    document.addEventListener('filtersApplied', (e) => {
      console.log(e.detail.filters);
      const count = Math.random() * 100;
      document.querySelector('.filters-ui').updateQuestionsCount(count);
    });
    
    f.debug();
  </script>
</body>
</html>
```

---

## 🚀 Integração com Backend

```javascript
// Enviar filtros para API
document.addEventListener('filtersApplied', async (e) => {
  const response = await fetch('/api/questions/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filters: e.detail.filters,
      limit: 10,
      offset: 0
    })
  });
  
  const { questions, total } = await response.json();
  displayQuestions(questions);
  ui.updateQuestionsCount(total);
});
```

---

## 📱 Responsividade Automática

O CSS ja cuida de:
- Mobile (< 480px)
- Tablet (480px - 768px)  
- Desktop (> 768px)

Sem necessidade de código JavaScript adicional!

---

## 🎨 Customização de Cores

As cores são controladas por variáveis CSS. Se quiser customizar, sobrescreva em seu CSS:

```css
:root {
  --color-primary: #5B5BD6;        /* Cor principal dos botões */
  --color-border: #d4d1ca;         /* Bordas */
  --color-text: #28251d;           /* Texto */
  --color-bg: #f7f6f2;             /* Fundo */
}
```

---

## ❌ Erros Comuns

```javascript
// ❌ ERRADO: Esperar sincronamente
const count = fetchQuestionsSync(filters);

// ✅ CERTO: Usar async/await
const count = await fetchQuestionsAsync(filters);

// ❌ ERRADO: Não validar valor
filters.addFilter('difficulty', 'muito dificil');  // espaço!

// ✅ CERTO: Usar underscore
filters.addFilter('difficulty', 'muito_dificil');

// ❌ ERRADO: Esquecer de subscriver
filters.onChange(() => { /* ... */ });  // sem salvar retorno

// ✅ CERTO: Salvar para desinscrever depois
const unsub = filters.onChange(() => { /* ... */ });
unsub();
```

---

## 📞 Recursos

- **Documentação Completa**: `FILTERS-DOCUMENTATION.md`
- **Guia de Integração**: `FILTERS-INTEGRATION-GUIDE.md`
- **Resumo Executivo**: `RESUMO-FILTROS.md`
- **Changelog**: `CHANGELOG-FILTROS.md`

---

## ⌚ Tempo de Aprendizagem Estimado

| Tarefa | Tempo |
|--------|-------|
| Setup básico | 5 min |
| Entender API | 15 min |
| Primeira integração | 30 min |
| Adicionar novo filtro | 20 min |
| Adicionar novo preset | 15 min |

---

**Última atualização**: 08/05/2026  
**Versão**: 1.0  
**Mantido por**: Desenvolvedor Studymaster
