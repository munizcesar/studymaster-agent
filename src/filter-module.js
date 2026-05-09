/**
 * MÓDULO DE FILTROS DE QUESTÕES - StudyMaster
 * 
 * Responsabilidades:
 * - Gerenciar estado de filtros (CONTEÚDO, CONCURSO, PROVA, HISTÓRICO)
 * - Persistência de filtros (localStorage)
 * - Gerenciar presets de filtros
 * - Validação e combinação de filtros
 * - Interface com API de busca
 * 
 * ARQUITETURA:
 * FilterManager (estado global) → FilterUI (componentes) → FilterAPI (backend)
 */

// ════════════════════════════════════════════════════════════════════════════
// SCHEMA DE DADOS - Estrutura unificada de filtros
// ════════════════════════════════════════════════════════════════════════════

const FILTER_SCHEMA = {
  version: '1.0.0',
  content: {
    discipline: null,
    topic: null,
    subtopic: null,
    selectedNodes: [],
    keyword: ''
  },
  exam: {
    specificExam: null,
    agency: null,
    examBoard: null,
    position: null,
    area: null,
    educationLevel: null,
    sphere: null,
    state: null
  },
  examMetadata: {
    yearFrom: null,
    yearTo: null,
    questionType: null,
    difficulty: null
  },
  history: {
    statusFilter: 'all',
    excludeAnnulled: false,
    excludeOutdated: false,
    hasCommentary: false
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
};

// ════════════════════════════════════════════════════════════════════════════
// PRESETS PREDEFINIDOS
// ════════════════════════════════════════════════════════════════════════════

const FILTER_PRESETS = {
  general: {
    id: 'preset-general',
    name: 'Treino Geral por Assunto',
    description: 'Pratique conteúdo sem filtros de banca/concurso específicos',
    icon: 'books',
    template: {
      content: { discipline: null, topic: null, subtopic: null, selectedNodes: [], keyword: '' },
      exam: { specificExam: null, agency: null, examBoard: null, position: null, area: null, educationLevel: null, sphere: null, state: null },
      examMetadata: { yearFrom: null, yearTo: null, questionType: null, difficulty: null },
      history: { statusFilter: 'all', excludeAnnulled: false, excludeOutdated: false, hasCommentary: false }
    },
    requiredFields: ['content.discipline', 'content.topic'],
    constraints: { description: 'Foco em conteúdo, sem restrições de banca/órgão' }
  },
  focused: {
    id: 'preset-focused',
    name: 'Treino Focado no Meu Concurso',
    description: 'Questões específicas da sua banca e cargo (últimos anos)',
    icon: 'target',
    template: {
      content: { discipline: null, topic: null, subtopic: null, selectedNodes: [], keyword: '' },
      exam: { specificExam: null, agency: null, examBoard: null, position: null, area: null, educationLevel: null, sphere: null, state: null },
      examMetadata: { yearFrom: new Date().getFullYear() - 5, yearTo: new Date().getFullYear(), questionType: null, difficulty: null },
      history: { statusFilter: 'all', excludeAnnulled: true, excludeOutdated: true, hasCommentary: false }
    },
    requiredFields: ['exam.agency', 'exam.examBoard', 'exam.position'],
    constraints: { description: 'Foco em concurso específico, últimos 5 anos, sem questões anuladadas' }
  },
  review: {
    id: 'preset-review',
    name: 'Revisão do Que Errei',
    description: 'Revise apenas as questões que você errou',
    icon: 'AlertCircle',
    template: {
      content: { discipline: null, topic: null, subtopic: null, selectedNodes: [], keyword: '' },
      exam: { specificExam: null, agency: null, examBoard: null, position: null, area: null, educationLevel: null, sphere: null, state: null },
      examMetadata: { yearFrom: null, yearTo: null, questionType: null, difficulty: null },
      history: { statusFilter: 'wrong', excludeAnnulled: false, excludeOutdated: false, hasCommentary: true }
    },
    requiredFields: [],
    constraints: { lockedFields: ['history.statusFilter'], description: 'Foco em questões erradas com comentários' }
  }
};

// ════════════════════════════════════════════════════════════════════════════
// OPCÕES PARA DROPDOWNS/SELECTS
// ════════════════════════════════════════════════════════════════════════════

const FILTER_OPTIONS = {
  area: [
    { value: 'judicial', label: 'Poder Judiciário' },
    { value: 'fiscal', label: 'Fiscalização / Auditoria' },
    { value: 'police', label: 'Segurança Pública / Policial' },
    { value: 'teaching', label: 'Magistério / Educação' },
    { value: 'administration', label: 'Administração Pública Geral' },
    { value: 'technical', label: 'Técnico' },
    { value: 'other', label: 'Outro' }
  ],
  educationLevel: [
    { value: 'fundamental', label: 'Ensino Fundamental' },
    { value: 'médio', label: 'Ensino Médio' },
    { value: 'técnico', label: 'Ensino Técnico' },
    { value: 'superior', label: 'Ensino Superior' }
  ],
  sphere: [
    { value: 'federal', label: 'Federal' },
    { value: 'estadual', label: 'Estadual' },
    { value: 'municipal', label: 'Municipal' }
  ],
  state: [
    { value: 'AC', label: 'Acre' }, { value: 'AL', label: 'Alagoas' },
    { value: 'AP', label: 'Amapá' }, { value: 'AM', label: 'Amazonas' },
    { value: 'BA', label: 'Bahia' }, { value: 'CE', label: 'Ceará' },
    { value: 'DF', label: 'Distrito Federal' }, { value: 'ES', label: 'Espírito Santo' },
    { value: 'GO', label: 'Goiás' }, { value: 'MA', label: 'Maranhão' },
    { value: 'MT', label: 'Mato Grosso' }, { value: 'MS', label: 'Mato Grosso do Sul' },
    { value: 'MG', label: 'Minas Gerais' }, { value: 'PA', label: 'Pará' },
    { value: 'PB', label: 'Paraíba' }, { value: 'PR', label: 'Paraná' },
    { value: 'PE', label: 'Pernambuco' }, { value: 'PI', label: 'Piauí' },
    { value: 'RJ', label: 'Rio de Janeiro' }, { value: 'RN', label: 'Rio Grande do Norte' },
    { value: 'RS', label: 'Rio Grande do Sul' }, { value: 'RO', label: 'Rondônia' },
    { value: 'RR', label: 'Roraima' }, { value: 'SC', label: 'Santa Catarina' },
    { value: 'SP', label: 'São Paulo' }, { value: 'SE', label: 'Sergipe' },
    { value: 'TO', label: 'Tocantins' }
  ],
  questionType: [
    { value: 'multiple_choice', label: 'Múltipla Escolha' },
    { value: 'true_false', label: 'Certo/Errado' },
    { value: 'discursive', label: 'Discursiva' },
    { value: 'mix', label: 'Mista' }
  ],
  difficulty: [
    { value: 'very_easy', label: 'Muito Fácil' },
    { value: 'easy', label: 'Fácil' },
    { value: 'medium', label: 'Médio' },
    { value: 'hard', label: 'Difícil' },
    { value: 'very_hard', label: 'Muito Difícil' }
  ],
  statusFilter: [
    { value: 'all', label: 'Todas as questões' },
    { value: 'not_solved', label: 'Apenas não resolvidas' },
    { value: 'solved', label: 'Apenas resolvidas' },
    { value: 'correct', label: 'Apenas acertadas' },
    { value: 'wrong', label: 'Apenas erradas' }
  ]
};

// ════════════════════════════════════════════════════════════════════════════
// FILTER MANAGER
// ════════════════════════════════════════════════════════════════════════════

class FilterManager {
  constructor() {
    // FIX: observers declarado no constructor (não como class field)
    // para compatibilidade com bundlers/ambientes sem suporte a ES2022 class fields.
    this.observers = [];
    this.filters = this.createEmptyFilters();
    this.favorites = this.loadFavorites();
    this.lastPreset = null;
    this.isDirty = false;
  }

  createEmptyFilters() {
    return JSON.parse(JSON.stringify(FILTER_SCHEMA));
  }

  deepMerge(target, source) {
    if (!source || typeof source !== 'object') return target;
    for (const key of Object.keys(source)) {
      if (
        source[key] !== null &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key]) &&
        target[key] !== null &&
        typeof target[key] === 'object' &&
        !Array.isArray(target[key])
      ) {
        this.deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }

  clearAllFilters() {
    this.filters = this.createEmptyFilters();
    this.isDirty = true;
    this.notifyObservers('filters-cleared');
    return this.filters;
  }

  removeFilter(path) {
    const keys = path.split('.');
    let current = this.filters;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    const lastKey = keys[keys.length - 1];
    if (Array.isArray(current[lastKey])) {
      current[lastKey] = [];
    } else {
      current[lastKey] = null;
    }
    this.isDirty = true;
    this.notifyObservers('filter-removed', { path });
    return this.filters;
  }

  applyPreset(presetId) {
    const preset = FILTER_PRESETS[presetId];
    if (!preset) {
      console.warn('Preset não encontrado: ' + presetId);
      return false;
    }
    this.filters = this.createEmptyFilters();
    this.deepMerge(this.filters, preset.template);
    this.filters.metadata.presetType = presetId;
    this.lastPreset = presetId;
    this.isDirty = true;
    this.notifyObservers('preset-applied', { presetId: presetId, preset: preset });
    return true;
  }

  setFilter(path, value) {
    const keys = path.split('.');
    let current = this.filters;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    const lastKey = keys[keys.length - 1];
    current[lastKey] = value;
    this.isDirty = true;
    this.notifyObservers('filter-changed', { path: path, value: value });
    return this.filters;
  }

  getFilter(path) {
    const keys = path.split('.');
    let current = this.filters;
    for (var i = 0; i < keys.length; i++) {
      current = current[keys[i]];
      if (current === null || current === undefined) break;
    }
    return current;
  }

  getActiveFilters() {
    const active = [];
    const self = this;
    function traverse(obj, prefix) {
      prefix = prefix || '';
      var entries = Object.keys(obj);
      for (var i = 0; i < entries.length; i++) {
        var key = entries[i];
        var val = obj[key];
        var path = prefix ? (prefix + '.' + key) : key;
        if (val === null || val === undefined || val === '' || (Array.isArray(val) && val.length === 0)) {
          // skip
        } else if (typeof val === 'object' && !Array.isArray(val) && path !== 'metadata') {
          traverse(val, path);
        } else {
          active.push({ path: path, value: val, label: self.getFilterLabel(path, val) });
        }
      }
    }
    traverse(this.filters);
    return active;
  }

  getFilterLabel(path, value) {
    var parts = path.split('.');
    var field = parts[1];
    if (FILTER_OPTIONS[field]) {
      var option = FILTER_OPTIONS[field].find(function(o) { return o.value === value; });
      if (option) return option.label;
    }
    return String(value);
  }

  validateForPreset(presetId) {
    const preset = FILTER_PRESETS[presetId];
    if (!preset) return { valid: false, errors: ['Preset não encontrado'] };
    const missingFields = [];
    const errors = [];
    for (var i = 0; i < preset.requiredFields.length; i++) {
      var requiredPath = preset.requiredFields[i];
      var value = this.getFilter(requiredPath);
      if (!value || (Array.isArray(value) && value.length === 0)) {
        missingFields.push(requiredPath);
      }
    }
    if (missingFields.length > 0) {
      errors.push('Campos obrigatórios não preenchidos: ' + missingFields.join(', '));
    }
    return { valid: errors.length === 0, missingFields: missingFields, errors: errors };
  }

  saveFavorite(name) {
    const favorite = {
      id: 'fav-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      name: name,
      filters: JSON.parse(JSON.stringify(this.filters)),
      createdAt: new Date().toISOString(),
      usageCount: 0
    };
    this.favorites.push(favorite);
    this.persistFavorites();
    this.notifyObservers('favorite-saved', { favorite: favorite });
    return favorite.id;
  }

  loadFavorite(id) {
    const favorite = this.favorites.find(function(f) { return f.id === id; });
    if (!favorite) {
      console.warn('Favorito não encontrado: ' + id);
      return false;
    }
    this.filters = this.createEmptyFilters();
    this.deepMerge(this.filters, favorite.filters);
    favorite.usageCount++;
    favorite.lastUsed = new Date().toISOString();
    this.persistFavorites();
    this.isDirty = false;
    this.notifyObservers('favorite-loaded', { favorite: favorite });
    return true;
  }

  getFavorites() {
    return this.favorites.map(function(f) {
      return { id: f.id, name: f.name, createdAt: f.createdAt, usageCount: f.usageCount, lastUsed: f.lastUsed };
    });
  }

  removeFavorite(id) {
    this.favorites = this.favorites.filter(function(f) { return f.id !== id; });
    this.persistFavorites();
    this.notifyObservers('favorite-removed', { id: id });
  }

  persistFavorites() {
    try {
      localStorage.setItem('studymaster-filter-favorites', JSON.stringify(this.favorites));
    } catch (e) {
      console.warn('Não foi possível persistir favoritos:', e.message);
    }
  }

  loadFavorites() {
    try {
      const stored = localStorage.getItem('studymaster-filter-favorites');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.warn('Erro ao carregar favoritos:', e.message);
      return [];
    }
  }

  toApiPayload() {
    const content  = this.filters.content      || {};
    const exam     = this.filters.exam         || {};
    const examMeta = this.filters.examMetadata || {};
    const history  = this.filters.history      || {};

    const payload = {
      content: {
        discipline:    content.discipline    != null ? content.discipline    : null,
        topic:         content.topic         != null ? content.topic         : null,
        subtopic:      content.subtopic      != null ? content.subtopic      : null,
        selectedNodes: Array.isArray(content.selectedNodes) ? content.selectedNodes : [],
        keyword:       content.keyword       != null ? content.keyword       : ''
      },
      exam: {
        specificExam:   exam.specificExam   != null ? exam.specificExam   : null,
        agency:         exam.agency         != null ? exam.agency         : null,
        examBoard:      exam.examBoard      != null ? exam.examBoard      : null,
        position:       exam.position       != null ? exam.position       : null,
        area:           exam.area           != null ? exam.area           : null,
        educationLevel: exam.educationLevel != null ? exam.educationLevel : null,
        sphere:         exam.sphere         != null ? exam.sphere         : null,
        state:          exam.state          != null ? exam.state          : null
      },
      examMetadata: {
        yearFrom:     examMeta.yearFrom     != null ? examMeta.yearFrom     : null,
        yearTo:       examMeta.yearTo       != null ? examMeta.yearTo       : null,
        questionType: examMeta.questionType != null ? examMeta.questionType : null,
        difficulty:   examMeta.difficulty   != null ? examMeta.difficulty   : null
      },
      history: {
        statusFilter:    history.statusFilter    != null ? history.statusFilter    : 'all',
        excludeAnnulled: history.excludeAnnulled != null ? history.excludeAnnulled : false,
        excludeOutdated: history.excludeOutdated != null ? history.excludeOutdated : false,
        hasCommentary:   history.hasCommentary   != null ? history.hasCommentary   : false
      }
    };

    console.log('[DEBUG FilterManager] filter payload:', JSON.stringify(payload, null, 2));
    return payload;
  }

  subscribe(callback) {
    this.observers.push(callback);
    const self = this;
    return function() {
      self.observers = self.observers.filter(function(c) { return c !== callback; });
    };
  }

  notifyObservers(eventType, data) {
    for (var i = 0; i < this.observers.length; i++) {
      this.observers[i]({ eventType: eventType, data: data });
    }
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SINGLETON GLOBAL
// ════════════════════════════════════════════════════════════════════════════

var filterManager = new FilterManager();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FilterManager: FilterManager, filterManager: filterManager, FILTER_SCHEMA: FILTER_SCHEMA, FILTER_PRESETS: FILTER_PRESETS, FILTER_OPTIONS: FILTER_OPTIONS };
} else {
  window.FilterModule = { FilterManager: FilterManager, filterManager: filterManager, FILTER_SCHEMA: FILTER_SCHEMA, FILTER_PRESETS: FILTER_PRESETS, FILTER_OPTIONS: FILTER_OPTIONS };
}
