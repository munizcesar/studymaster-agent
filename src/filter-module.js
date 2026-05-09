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
 * 
 * Extensível em: novos campos, novos presets, novos validadores
 */

// ════════════════════════════════════════════════════════════════════════════
// SCHEMA DE DADOS - Estrutura unificada de filtros
// ════════════════════════════════════════════════════════════════════════════

const FILTER_SCHEMA = {
  version: '1.0.0',
  
  // SEÇÃO CONTEÚDO (Content hierarchy)
  content: {
    discipline: null,           // ex: "portugues", "direito_constitucional"
    topic: null,                // ex: "Pontuação", "Poder Executivo"
    subtopic: null,             // ex: "Ponto final", "Competências"
    selectedNodes: [],          // Array de nós selecionados na árvore
    keyword: ''                 // Busca por palavra-chave no texto da questão
  },
  
  // SEÇÃO CONCURSO (Exam metadata)
  exam: {
    specificExam: null,         // ex: "Concurso TRT 2024", "TJDG 2023"
    agency: null,               // ex: "trt", "tjdg", "rf", "inss"
    examBoard: null,            // ex: "fgv", "cesgranrio", "cespe", "vunesp"
    position: null,             // ex: "Analista Judiciário", "Auditor Fiscal"
    area: null,                 // ex: "judicial", "fiscal", "police", "teaching", "general"
    educationLevel: null,       // ex: "fundamental", "médio", "técnico", "superior"
    sphere: null,               // ex: "federal", "estadual", "municipal"
    state: null                 // ex: "SP", "RJ", "MG", "DF"
  },
  
  // SEÇÃO PROVA (Exam metadata - question characteristics)
  examMetadata: {
    yearFrom: null,             // ex: 2020
    yearTo: null,               // ex: 2025
    questionType: null,         // ex: "multiple_choice", "true_false", "discursive", "mix"
    difficulty: null            // ex: "very_easy", "easy", "medium", "hard", "very_hard"
  },
  
  // SEÇÃO HISTÓRICO DO ALUNO (Student history - performance filters)
  history: {
    statusFilter: 'all',        // "all"|"not_solved"|"solved"|"correct"|"wrong"
    excludeAnnulled: false,     // Excluir questões anuladadas
    excludeOutdated: false,     // Excluir questões desatualizadas
    hasCommentary: false        // Apenas questões com comentário/gabarito
  },
  
  // METADATA (filtros aplicados, favoritos, etc)
  metadata: {
    isActive: true,
    isFavorite: false,
    favoriteId: null,           // UUID para saved favorites
    favoriteName: null,
    presetType: null,           // "general"|"focused"|"review"|"custom"
    createdAt: null,
    lastUsed: null
  }
};

// ════════════════════════════════════════════════════════════════════════════
// PRESETS PREDEFINIDOS - 3 templates para otimizar workflows comuns
// ════════════════════════════════════════════════════════════════════════════

const FILTER_PRESETS = {
  /**
   * PRESET 1: Treino geral por assunto
   */
  general: {
    id: 'preset-general',
    name: 'Treino Geral por Assunto',
    description: 'Pratique conteúdo sem filtros de banca/concurso específicos',
    icon: 'books',
    template: {
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
      }
    },
    requiredFields: ['content.discipline', 'content.topic'],
    constraints: {
      description: 'Foco em conteúdo, sem restrições de banca/órgão'
    }
  },

  /**
   * PRESET 2: Treino focado no meu concurso
   */
  focused: {
    id: 'preset-focused',
    name: 'Treino Focado no Meu Concurso',
    description: 'Questões específicas da sua banca e cargo (últimos anos)',
    icon: 'target',
    template: {
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
        yearFrom: new Date().getFullYear() - 5,
        yearTo: new Date().getFullYear(),
        questionType: null,
        difficulty: null
      },
      history: {
        statusFilter: 'all',
        excludeAnnulled: true,
        excludeOutdated: true,
        hasCommentary: false
      }
    },
    requiredFields: ['exam.agency', 'exam.examBoard', 'exam.position'],
    constraints: {
      description: 'Foco em concurso específico, últimos 5 anos, sem questões anuladadas'
    }
  },

  /**
   * PRESET 3: Revisão do que errei
   */
  review: {
    id: 'preset-review',
    name: 'Revisão do Que Errei',
    description: 'Revise apenas as questões que você errou',
    icon: 'AlertCircle',
    template: {
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
        statusFilter: 'wrong',
        excludeAnnulled: false,
        excludeOutdated: false,
        hasCommentary: true
      }
    },
    requiredFields: [],
    constraints: {
      lockedFields: ['history.statusFilter'],
      description: 'Foco em questões erradas com comentários'
    }
  }
};

// ════════════════════════════════════════════════════════════════════════════
// OPCÕES PARA DROPDOWNS/SELECTS - Enum de valores permitidos
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
    { value: 'AC', label: 'Acre' },
    { value: 'AL', label: 'Alagoas' },
    { value: 'AP', label: 'Amapá' },
    { value: 'AM', label: 'Amazonas' },
    { value: 'BA', label: 'Bahia' },
    { value: 'CE', label: 'Ceará' },
    { value: 'DF', label: 'Distrito Federal' },
    { value: 'ES', label: 'Espírito Santo' },
    { value: 'GO', label: 'Goiás' },
    { value: 'MA', label: 'Maranhão' },
    { value: 'MT', label: 'Mato Grosso' },
    { value: 'MS', label: 'Mato Grosso do Sul' },
    { value: 'MG', label: 'Minas Gerais' },
    { value: 'PA', label: 'Pará' },
    { value: 'PB', label: 'Paraíba' },
    { value: 'PR', label: 'Paraná' },
    { value: 'PE', label: 'Pernambuco' },
    { value: 'PI', label: 'Piauí' },
    { value: 'RJ', label: 'Rio de Janeiro' },
    { value: 'RN', label: 'Rio Grande do Norte' },
    { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'RO', label: 'Rondônia' },
    { value: 'RR', label: 'Roraima' },
    { value: 'SC', label: 'Santa Catarina' },
    { value: 'SP', label: 'São Paulo' },
    { value: 'SE', label: 'Sergipe' },
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
// FILTER MANAGER - Gerenciador central de estado e lógica de filtros
// ════════════════════════════════════════════════════════════════════════════

class FilterManager {
  constructor() {
    this.filters = this.createEmptyFilters();
    this.favorites = this.loadFavorites();
    this.lastPreset = null;
    this.isDirty = false;
  }

  /**
   * Cria um objeto de filtros vazio baseado no SCHEMA
   */
  createEmptyFilters() {
    return JSON.parse(JSON.stringify(FILTER_SCHEMA));
  }

  /**
   * Deep merge: mescla `source` por cima de `target` recursivamente.
   * Apenas sobrescreve chaves que existem em `source`; não remove chaves de `target`.
   * @param {object} target - objeto base (estrutura completa)
   * @param {object} source - objeto com os valores a aplicar
   * @returns {object} target mutado
   */
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

  /**
   * Reseta todos os filtros
   */
  clearAllFilters() {
    this.filters = this.createEmptyFilters();
    this.isDirty = true;
    this.notifyObservers('filters-cleared');
    return this.filters;
  }

  /**
   * Remove um filtro individual
   * @param {string} path - caminho dot-notation
   */
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

  /**
   * Aplica um preset de filtros.
   * Garante que this.filters SEMPRE mantém a estrutura completa do FILTER_SCHEMA.
   * Faz deep merge do template por cima da estrutura vazia.
   * @param {string} presetId
   */
  applyPreset(presetId) {
    const preset = FILTER_PRESETS[presetId];
    if (!preset) {
      console.warn(`Preset não encontrado: ${presetId}`);
      return false;
    }

    // Sempre parte de uma estrutura vazia completa (garante content/exam/examMetadata/history/metadata)
    this.filters = this.createEmptyFilters();

    // Deep merge do template do preset por cima - sem remover seções
    this.deepMerge(this.filters, preset.template);

    // Preserva metadados do preset
    this.filters.metadata.presetType = presetId;
    this.lastPreset = presetId;
    this.isDirty = true;

    this.notifyObservers('preset-applied', { presetId, preset });
    return true;
  }

  /**
   * Adiciona um filtro individual
   * @param {string} path - dot-notation path
   * @param {any} value
   */
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
    this.notifyObservers('filter-changed', { path, value });
    return this.filters;
  }

  /**
   * Obtém valor de um filtro
   * @param {string} path - dot-notation path
   */
  getFilter(path) {
    const keys = path.split('.');
    let current = this.filters;
    for (const key of keys) {
      current = current[key];
      if (current === null || current === undefined) break;
    }
    return current;
  }

  /**
   * Obtém lista de filtros ativos (aqueles que têm valor não-null)
   */
  getActiveFilters() {
    const active = [];
    const traverse = (obj, prefix = '') => {
      for (const [key, val] of Object.entries(obj)) {
        const path = prefix ? `${prefix}.${key}` : key;
        if (val === null || val === undefined || val === '' || (Array.isArray(val) && val.length === 0)) {
          // Skip
        } else if (typeof val === 'object' && !Array.isArray(val) && path !== 'metadata') {
          traverse(val, path);
        } else {
          active.push({
            path,
            value: val,
            label: this.getFilterLabel(path, val)
          });
        }
      }
    };
    traverse(this.filters);
    return active;
  }

  /**
   * Retorna um rótulo legível para exibição de filtro ativo
   */
  getFilterLabel(path, value) {
    const [section, field] = path.split('.');
    if (FILTER_OPTIONS[field]) {
      const option = FILTER_OPTIONS[field].find(o => o.value === value);
      if (option) return option.label;
    }
    return String(value);
  }

  /**
   * Valida se os filtros estão completos para um preset específico
   */
  validateForPreset(presetId) {
    const preset = FILTER_PRESETS[presetId];
    if (!preset) return { valid: false, errors: ['Preset não encontrado'] };
    const missingFields = [];
    const errors = [];
    for (const requiredPath of preset.requiredFields) {
      const value = this.getFilter(requiredPath);
      if (!value || (Array.isArray(value) && value.length === 0)) {
        missingFields.push(requiredPath);
      }
    }
    if (missingFields.length > 0) {
      errors.push(`Campos obrigatórios não preenchidos: ${missingFields.join(', ')}`);
    }
    return { valid: errors.length === 0, missingFields, errors };
  }

  /**
   * Salva filtros atuais como um "favorito" nomeado
   */
  saveFavorite(name) {
    const favorite = {
      id: `fav-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      filters: JSON.parse(JSON.stringify(this.filters)),
      createdAt: new Date().toISOString(),
      usageCount: 0
    };
    this.favorites.push(favorite);
    this.persistFavorites();
    this.notifyObservers('favorite-saved', { favorite });
    return favorite.id;
  }

  /**
   * Carrega um favorito salvo.
   * Garante que this.filters SEMPRE mantém a estrutura completa do FILTER_SCHEMA.
   * Faz deep merge dos filtros salvos por cima da estrutura vazia.
   * @param {string} id
   */
  loadFavorite(id) {
    const favorite = this.favorites.find(f => f.id === id);
    if (!favorite) {
      console.warn(`Favorito não encontrado: ${id}`);
      return false;
    }

    // Sempre parte de uma estrutura vazia completa
    this.filters = this.createEmptyFilters();

    // Deep merge dos filtros salvos por cima - sem remover seções
    this.deepMerge(this.filters, favorite.filters);

    favorite.usageCount++;
    favorite.lastUsed = new Date().toISOString();
    this.persistFavorites();

    this.isDirty = false;
    this.notifyObservers('favorite-loaded', { favorite });
    return true;
  }

  /**
   * Lista todos os favoritos
   */
  getFavorites() {
    return this.favorites.map(f => ({
      id: f.id,
      name: f.name,
      createdAt: f.createdAt,
      usageCount: f.usageCount,
      lastUsed: f.lastUsed
    }));
  }

  /**
   * Remove um favorito
   */
  removeFavorite(id) {
    this.favorites = this.favorites.filter(f => f.id !== id);
    this.persistFavorites();
    this.notifyObservers('favorite-removed', { id });
  }

  /**
   * Persistência: salva favoritos em localStorage
   */
  persistFavorites() {
    try {
      localStorage.setItem('studymaster-filter-favorites', JSON.stringify(this.favorites));
    } catch (e) {
      console.warn('Não foi possível persistir favoritos:', e.message);
    }
  }

  /**
   * Persistência: carrega favoritos de localStorage
   */
  loadFavorites() {
    try {
      const stored = localStorage.getItem('studymaster-filter-favorites');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.warn('Erro ao carregar favoritos:', e.message);
      return [];
    }
  }

  /**
   * Converte filtros aplicados para formato de requisição API.
   * Lê explicitamente cada campo de this.filters para garantir que
   * nenhuma seção seja substituída por objeto parcial.
   * @returns {object} payload para enviar ao /api/quiz
   */
  toApiPayload() {
    // Garante que todas as seções existem (segurança extra)
    const content     = this.filters.content     || {};
    const exam        = this.filters.exam        || {};
    const examMeta    = this.filters.examMetadata || {};
    const history     = this.filters.history     || {};

    const payload = {
      content: {
        discipline:    content.discipline    ?? null,
        topic:         content.topic         ?? null,
        subtopic:      content.subtopic      ?? null,
        selectedNodes: Array.isArray(content.selectedNodes) ? content.selectedNodes : [],
        keyword:       content.keyword       ?? ''
      },
      exam: {
        specificExam:   exam.specificExam   ?? null,
        agency:         exam.agency         ?? null,
        examBoard:      exam.examBoard      ?? null,
        position:       exam.position       ?? null,
        area:           exam.area           ?? null,
        educationLevel: exam.educationLevel ?? null,
        sphere:         exam.sphere         ?? null,
        state:          exam.state          ?? null
      },
      examMetadata: {
        yearFrom:     examMeta.yearFrom     ?? null,
        yearTo:       examMeta.yearTo       ?? null,
        questionType: examMeta.questionType ?? null,
        difficulty:   examMeta.difficulty   ?? null
      },
      history: {
        statusFilter:    history.statusFilter    ?? 'all',
        excludeAnnulled: history.excludeAnnulled ?? false,
        excludeOutdated: history.excludeOutdated ?? false,
        hasCommentary:   history.hasCommentary   ?? false
      }
    };

    console.log('[DEBUG FilterManager] filter payload:', JSON.stringify(payload, null, 2));
    return payload;
  }

  /**
   * Sistema simples de observadores para notificações de mudanças
   */
  observers = [];

  subscribe(callback) {
    this.observers.push(callback);
    return () => {
      this.observers = this.observers.filter(c => c !== callback);
    };
  }

  notifyObservers(eventType, data) {
    this.observers.forEach(callback => callback({ eventType, data }));
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SINGLETON GLOBAL - Instância única do FilterManager
// ════════════════════════════════════════════════════════════════════════════

const filterManager = new FilterManager();

// Exportar para uso global (se usando módulos) ou deixar disponível no window
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FilterManager,
    filterManager,
    FILTER_SCHEMA,
    FILTER_PRESETS,
    FILTER_OPTIONS
  };
} else {
  window.FilterModule = {
    FilterManager,
    filterManager,
    FILTER_SCHEMA,
    FILTER_PRESETS,
    FILTER_OPTIONS
  };
}
