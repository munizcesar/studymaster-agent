/**
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃         STUDYMASTER — MÓDULO DE FILTROS DE QUESTÕES               ┃
 * ┃  Sistema desacoplado e reutilizável para filtrar questões com     ┃
 * ┃  múltiplos critérios: conteúdo, concurso, prova, histórico        ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 * 
 * ESTRUTURA DE FILTROS:
 * ─────────────────────────────────────────────────────────────────
 * SEÇÃO CONTEÚDO:
 *   - Disciplina (ex: Português, Direito Constitucional, etc.)
 *   - Assunto / Tópico (ex: Gramática, Sintaxe)
 *   - Subtópico (ex: Concordância, Regência)
 *   - Busca por palavra-chave (busca textual nas questões)
 * 
 * SEÇÃO CONCURSO:
 *   - Concurso (TJ-SP, OAB, INSS, etc.)
 *   - Órgão / Instituição (PJ, MP, Tribunais, etc.)
 *   - Banca Examinadora (FGV, CEBRASPE, VUNESP, etc.)
 *   - Cargo (Delegado, Analista, Escriturário, etc.)
 *   - Área / Carreira (Policial, Fiscal, Magistério, etc.)
 *   - Nível de Escolaridade (Fundamental, Médio, Técnico, Superior)
 *   - Esfera (Federal, Estadual, Municipal)
 *   - UF (Estado)
 * 
 * SEÇÃO PROVA:
 *   - Ano da Prova (intervalo de anos, ex: 2020–2025)
 *   - Modalidade da Questão (Múltipla Escolha, Certo/Errado, Discursiva)
 *   - Nível de Dificuldade (Muito Fácil, Fácil, Médio, Difícil, Muito Difícil)
 * 
 * SEÇÃO HISTÓRICO DO ALUNO:
 *   - Todas as questões / Não resolvidas / Resolvidas / Acertadas / Erradas
 *   - Excluir questões anuladas
 *   - Excluir questões desatualizadas
 *   - Apenas questões com comentário / gabarito comentado
 * ─────────────────────────────────────────────────────────────────
 * 
 * COMO USAR:
 * ─────────────────────────────────────────────────────────────────
 * 
 * 1. Inicializar:
 *    const filters = new QuestionFilters();
 * 
 * 2. Aplicar filtros:
 *    filters.addFilter('discipline', 'direito_constitucional');
 *    filters.addFilter('difficulty', 'hard');
 *    filters.addFilter('yearMin', 2020);
 *    filters.addFilter('yearMax', 2025);
 * 
 * 3. Obter filtros ativos:
 *    const active = filters.getActiveFilters();
 *    → { discipline: 'direito_constitucional', difficulty: 'hard', ... }
 * 
 * 4. Remover filtro:
 *    filters.removeFilter('discipline');
 * 
 * 5. Limpar todos os filtros:
 *    filters.clearAllFilters();
 * 
 * 6. Usar presets:
 *    filters.applyPreset('general-training');
 *    filters.applyPreset('focused-training', { 
 *      exam: 'oab-1fase',
 *      banca: 'fgv'
 *    });
 * 
 * ─────────────────────────────────────────────────────────────────
 * 
 * PARA ESTENDER:
 * ─────────────────────────────────────────────────────────────────
 * 
 * Adicionar novo tipo de filtro:
 * 
 *   1. Adicione a chave em FILTER_SCHEMAS (ex: customField)
 *   2. Defina validação e transformação
 *   3. Atualize getActiveFilters() se necessário
 *   4. Atualize documentação aqui (este bloco)
 * 
 * Exemplo:
 *   FILTER_SCHEMAS: {
 *     customField: {
 *       type: 'string',
 *       category: 'conteudo',
 *       validValues: ['value1', 'value2', 'value3'],
 *       transform: (v) => v.toLowerCase(),
 *     }
 *   }
 * 
 * Adicionar novo preset:
 * 
 *   Adicione em this.presets:
 *   'novo-preset': {
 *     label: 'Novo Preset',
 *     description: 'Descrição do preset',
 *     defaultFilters: {
 *       discipline: 'português',
 *       // ... outros filtros
 *     },
 *     required: ['discipline'], // Quais campos são obrigatórios
 *     restrictions: {
 *       // Restrições aplicadas automaticamente
 *       year: [2023, new Date().getFullYear()],
 *     }
 *   }
 * 
 * ─────────────────────────────────────────────────────────────────
 */

class QuestionFilters {
  /**
   * Inicializa o sistema de filtros
   * @param {Object} options - Configurações iniciais
   * @param {boolean} options.persistToStorage - Se true, salva filtros no localStorage
   * @param {string} options.storageKey - Chave para localStorage
   */
  constructor(options = {}) {
    this.persistToStorage = options.persistToStorage ?? false;
    this.storageKey = options.storageKey ?? 'sm_question_filters';
    
    // Estado interno dos filtros ativos
    this.filters = {};
    
    // Esquema de validação para cada filtro
    this.FILTER_SCHEMAS = this.initializeFilterSchemas();
    
    // Presets de combinações comuns de filtros
    this.presets = this.initializePresets();
    
    // Árvore de disciplinas/tópicos/subtópicos
    this.contentTree = this.initializeContentTree();
    
    // Callbacks para quando filtros mudam
    this.changeListeners = [];
    
    // Carrega filtros salvos se existirem
    if (this.persistToStorage) {
      this.loadFromStorage();
    }
  }

  // Mapeamento de paths aninhados (UI) para chaves planas (Interno)
  static PATH_MAP = {
    'content.discipline': 'discipline',
    'content.topic': 'topic',
    'content.subtopic': 'subtopic',
    'content.keyword': 'keywordSearch',
    'exam.examBoard': 'banca',
    'exam.agency': 'organ',
    'exam.position': 'position',
    'exam.educationLevel': 'education_level',
    'exam.specificExam': 'exam',
    'exam.area': 'area',
    'exam.sphere': 'sphere',
    'exam.state': 'state',
    'examMetadata.yearFrom': 'yearMin',
    'examMetadata.yearTo': 'yearMax',
    'examMetadata.questionType': 'questionType',
    'examMetadata.difficulty': 'difficulty',
    'history.statusFilter': 'resolution_status',
    'history.excludeAnnulled': 'exclude_annulled',
    'history.excludeOutdated': 'exclude_outdated',
    'history.hasCommentary': 'only_commented'
  };

  /**
   * Obtém valor de um filtro via path aninhado
   * @param {string} path - dot-notation path
   */
  getFilter(path) {
    const flatKey = QuestionFilters.PATH_MAP[path];
    if (!flatKey) return undefined;
    return this.filters[flatKey];
  }

  /**
   * Define um filtro via path aninhado
   * @param {string} path - dot-notation path
   * @param {*} value - valor a definir
   */
  setFilter(path, value) {
    const flatKey = QuestionFilters.PATH_MAP[path];
    if (!flatKey) return this.filters;

    if (value === null || value === undefined || value === '') {
      this.removeFilter(flatKey);
    } else {
      this.addFilter(flatKey, value);
    }
    return this.filters;
  }

  /**
   * Retorna o payload aninhado no formato esperado pelo Worker
   * @returns {object} Payload da API
   */
  toApiPayload() {
    return {
      content: {
        discipline: this.filters.discipline || null,
        topic: this.filters.topic || null,
        subtopic: this.filters.subtopic || null,
        keyword: this.filters.keywordSearch || ''
      },
      exam: {
        examBoard: this.filters.banca || null,
        agency: this.filters.organ || null,
        position: this.filters.position || null,
        educationLevel: this.filters.education_level || null,
        specificExam: this.filters.exam || null,
        area: this.filters.area || null,
        sphere: this.filters.sphere || null,
        state: this.filters.state || null
      },
      examMetadata: {
        yearFrom: this.filters.yearMin ? parseInt(this.filters.yearMin) : null,
        yearTo: this.filters.yearMax ? parseInt(this.filters.yearMax) : null,
        questionType: this.filters.questionType || null,
        difficulty: this.filters.difficulty || null
      },
      history: {
        statusFilter: this.filters.resolution_status || 'all',
        excludeAnnulled: !!this.filters.exclude_annulled,
        excludeOutdated: !!this.filters.exclude_outdated,
        hasCommentary: !!this.filters.only_commented
      }
    };
  }

  /**
   * Define o esquema de validação para cada tipo de filtro
   * @returns {Object} Mapa de tipos de filtro para suas definições
   */
  initializeFilterSchemas() {
    return {
      // ═══════════════════════════════════════════════════════════
      // SEÇÃO CONTEÚDO
      // ═══════════════════════════════════════════════════════════
      
      discipline: {
        category: 'conteudo',
        label: 'Disciplina',
        type: 'string',
        multiple: false,
        validValues: ['português', 'direito_constitucional', 'direito_administrativo', 
                     'raciocinio_logico', 'informatica', 'administracao_publica',
                     'direito_penal', 'direito_processual_civil', 'direito_processual_penal',
                     'direito_trabalhista', 'direito_empresarial', 'direito_civil',
                     'matemática_financeira', 'contabilidade', 'economia', 'redação_enem',
                     'história', 'geografia', 'biologia', 'química', 'física'],
        transform: (v) => String(v).toLowerCase(),
        description: 'Disciplina ou matéria de estudo'
      },

      topic: {
        category: 'conteudo',
        label: 'Tópico / Assunto',
        type: 'string',
        multiple: true, // Permitir múltiplos tópicos ao mesmo tempo
        description: 'Tópico ou assunto dentro de uma disciplina'
      },

      subtopic: {
        category: 'conteudo',
        label: 'Subtópico',
        type: 'string',
        multiple: true,
        description: 'Subtópico ou subtema dentro de um tópico'
      },

      keywordSearch: {
        category: 'conteudo',
        label: 'Buscar por palavra-chave',
        type: 'string',
        multiple: false,
        transform: (v) => String(v).trim(),
        description: 'Busca textual no enunciado da questão'
      },

      // ═══════════════════════════════════════════════════════════
      // SEÇÃO CONCURSO
      // ═══════════════════════════════════════════════════════════

      exam: {
        category: 'concurso',
        label: 'Concurso',
        type: 'string',
        multiple: false,
        description: 'Concurso específico (OAB, TJ-SP, INSS, etc.)'
      },

      organ: {
        category: 'concurso',
        label: 'Órgão / Instituição',
        type: 'string',
        multiple: false,
        validValues: ['PJ', 'MP', 'Tribunais', 'Polícia', 'Fiscal', 'Bancário', 'Educação', 'Saúde'],
        description: 'Órgão ou instituição do concurso'
      },

      banca: {
        category: 'concurso',
        label: 'Banca Examinadora',
        type: 'string',
        multiple: false,
        validValues: ['FGV', 'CEBRASPE', 'VUNESP', 'FCC', 'CESGRANRIO', 'IBFC', 'FUNDEP', 'FUNDATEC'],
        transform: (v) => String(v).toUpperCase(),
        description: 'Banca examinadora do concurso'
      },

      position: {
        category: 'concurso',
        label: 'Cargo',
        type: 'string',
        multiple: false,
        description: 'Cargo ou posição do concurso'
      },

      area: {
        category: 'concurso',
        label: 'Área / Carreira',
        type: 'string',
        multiple: false,
        validValues: ['policial', 'fiscal', 'tribunais', 'educacao', 'saude', 'bancario', 'adm_geral', 'outro'],
        transform: (v) => String(v).toLowerCase(),
        description: 'Área ou carreira do concurso'
      },

      education_level: {
        category: 'concurso',
        label: 'Nível de Escolaridade',
        type: 'string',
        multiple: false,
        validValues: ['fundamental', 'médio', 'técnico', 'superior'],
        transform: (v) => String(v).toLowerCase(),
        description: 'Nível de escolaridade exigido'
      },

      sphere: {
        category: 'concurso',
        label: 'Esfera',
        type: 'string',
        multiple: false,
        validValues: ['federal', 'estadual', 'municipal'],
        transform: (v) => String(v).toLowerCase(),
        description: 'Esfera governamental (federal, estadual, municipal)'
      },

      state: {
        category: 'concurso',
        label: 'UF',
        type: 'string',
        multiple: false,
        validValues: ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
                     'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'],
        transform: (v) => String(v).toUpperCase(),
        description: 'Estado brasileiro'
      },

      // ═══════════════════════════════════════════════════════════
      // SEÇÃO PROVA
      // ═══════════════════════════════════════════════════════════

      yearMin: {
        category: 'prova',
        label: 'Ano (Mínimo)',
        type: 'number',
        multiple: false,
        transform: (v) => Math.max(1950, Math.floor(Number(v))),
        description: 'Ano mínimo da prova'
      },

      yearMax: {
        category: 'prova',
        label: 'Ano (Máximo)',
        type: 'number',
        multiple: false,
        transform: (v) => Math.min(new Date().getFullYear(), Math.floor(Number(v))),
        description: 'Ano máximo da prova'
      },

      questionType: {
        category: 'prova',
        label: 'Modalidade da Questão',
        type: 'string',
        multiple: false,
        validValues: ['multipla_escolha', 'certo_errado', 'discursiva', 'resposta_curta'],
        transform: (v) => String(v).toLowerCase(),
        description: 'Tipo de questão'
      },

      difficulty: {
        category: 'prova',
        label: 'Nível de Dificuldade',
        type: 'string',
        multiple: false,
        validValues: ['muito_facil', 'facil', 'medio', 'dificil', 'muito_dificil'],
        transform: (v) => String(v).toLowerCase(),
        description: 'Nível de dificuldade da questão'
      },

      // ═══════════════════════════════════════════════════════════
      // SEÇÃO HISTÓRICO DO ALUNO
      // ═══════════════════════════════════════════════════════════

      resolution_status: {
        category: 'historico',
        label: 'Status de Resolução',
        type: 'string',
        multiple: false,
        validValues: ['all', 'not_resolved', 'resolved', 'correct', 'incorrect'],
        transform: (v) => String(v).toLowerCase(),
        description: 'Status de resolução da questão (todas, não resolvidas, resolvidas, etc.)'
      },

      exclude_annulled: {
        category: 'historico',
        label: 'Excluir Questões Anuladas',
        type: 'boolean',
        multiple: false,
        description: 'Se true, exclui questões que foram anuladas'
      },

      exclude_outdated: {
        category: 'historico',
        label: 'Excluir Questões Desatualizadas',
        type: 'boolean',
        multiple: false,
        description: 'Se true, exclui questões que se tornaram desatualizadas (legislação, etc.)'
      },

      only_commented: {
        category: 'historico',
        label: 'Apenas com Comentário',
        type: 'boolean',
        multiple: false,
        description: 'Se true, mostra apenas questões com gabarito comentado'
      },
    };
  }

  /**
   * Árvore de disciplinas/tópicos/subtópicos
   * Estrutura: Disciplina → Tópicos[] → Subtópicos[]
   * Fonte: Mapa de conteúdo do projeto (MAPA-CONTEUDO.md)
   */
  initializeContentTree() {
    return {
      'português': {
        label: 'Português',
        topics: {
          'morfologia_sintaxe': {
            label: 'Morfologia e Sintaxe',
            subtopics: [
              'classes_palavras',
              'analise_sintatica',
              'estrutura_oracao',
              'periodo_composto',
              'vozes_verbais'
            ]
          },
          'concordancia_regencia': {
            label: 'Concordância e Regência',
            subtopics: [
              'concordancia_nominal',
              'concordancia_verbal',
              'regencia_nominal',
              'regencia_verbal',
              'regencia_verbo_nome'
            ]
          },
          'crase_pontuacao': {
            label: 'Crase e Pontuação',
            subtopics: [
              'fenomeno_crase',
              'aplicacoes_crase',
              'usos_pontuacao',
              'efeitos_pontuacao'
            ]
          },
          'interpretacao_textual': {
            label: 'Interpretação e Tipologia Textual',
            subtopics: [
              'compreensao_leitura',
              'inferencia_contexto',
              'generos_textuais',
              'tipos_texto',
              'figuras_linguagem'
            ]
          },
          'redacao_oficial': {
            label: 'Redação Oficial',
            subtopics: [
              'padroes_redacao_oficial',
              'memorando',
              'oficio',
              'parecer',
              'relatorio'
            ]
          },
          'literatura': {
            label: 'Literatura Brasileira e Portuguesa',
            subtopics: [
              'literatura_medievil',
              'renascimento_humanismo',
              'barroco',
              'arcadismo',
              'romantismo',
              'realismo_naturalismo',
              'parnasianismo_simbolismo',
              'modernismo',
              'literatura_contemporanea'
            ]
          }
        }
      },
      'direito_constitucional': {
        label: 'Direito Constitucional',
        topics: {
          'principios_fundamentais': {
            label: 'Princípios Fundamentais',
            subtopics: [
              'republica_democracia',
              'separacao_poderes',
              'federalismo',
              'objetivos_republica'
            ]
          },
          'direitos_fundamentais': {
            label: 'Direitos e Garantias Fundamentais',
            subtopics: [
              'direitos_liberdade',
              'direitos_igualdade',
              'direitos_seguranca',
              'direitos_sociais',
              'garantias_constitucionais',
              'habeas_corpus',
              'mandado_seguranca',
              'habeas_data',
              'mandado_injuncao',
              'acao_popular'
            ]
          },
          'administracao_publica': {
            label: 'Administração Pública',
            subtopics: [
              'principios_adm_publica',
              'servidores_publicos',
              'regimes_juridicos',
              'responsabilidade_civil_servidor'
            ]
          },
          'poderes': {
            label: 'Poder Executivo, Legislativo e Judiciário',
            subtopics: [
              'poder_executivo_presidente',
              'poder_legislativo_congresso',
              'poder_judiciario_stf_stj',
              'tribunais_justica',
              'orgaos_justica_especializada'
            ]
          },
          'controle_constitucionalidade': {
            label: 'Controle de Constitucionalidade',
            subtopics: [
              'acao_direta_inconstitucionalidade',
              'acao_declaratoria_constitucionalidade',
              'arguicao_descumprimento_preceito',
              'mandado_injuncao',
              'controle_concentrado_difuso'
            ]
          }
        }
      },
      'raciocinio_logico': {
        label: 'Raciocínio Lógico',
        topics: {
          'logica_proposicional': {
            label: 'Lógica Proposicional',
            subtopics: [
              'proposicoes_simples_compostas',
              'conectivos_logicos',
              'tabelas_verdade',
              'equivalencias_logicas',
              'leis_de_morgan',
              'tautologia_contradicao_contingencia'
            ]
          },
          'analise_argumentos': {
            label: 'Análise de Argumentos',
            subtopics: [
              'validade_argumento',
              'silogismo_categorico',
              'formas_argumento_valido',
              'falacias_informais'
            ]
          },
          'combinatoria_probabilidade': {
            label: 'Combinatória e Probabilidade',
            subtopics: [
              'principio_contagem',
              'arranjos_permutacoes_combinacoes',
              'probabilidade_simples',
              'probabilidade_condicional',
              'probabilidade_eventos_independentes',
              'distribuicao_probabilidade'
            ]
          },
          'sequencias_series': {
            label: 'Sequências e Séries',
            subtopics: [
              'progressao_aritmetica',
              'progressao_geometrica',
              'series_infinitas',
              'converencia_divergencia'
            ]
          },
          'conjuntos': {
            label: 'Teoria dos Conjuntos',
            subtopics: [
              'operacoes_conjuntos',
              'propriedades_conjuntos',
              'produto_cartesiano',
              'relacoes_funcoes'
            ]
          }
        }
      }
      // Nota: Adicionar mais disciplinas conforme necessário
      // Padrão: 'chave_disciplina': { label, topics: { 'chave_topico': { label, subtopics [...] } } }
    };
  }

  /**
   * Inicializa presets de combinações comuns de filtros
   */
  initializePresets() {
    const currentYear = new Date().getFullYear();
    
    return {
      'general-training': {
        label: 'Treino Geral por Assunto',
        description: 'Permite treinar por disciplina e tópico, sem restrições de banca ou ano',
        defaultFilters: {
          resolution_status: 'all',
        },
        required: ['discipline'],
        optional: ['topic', 'subtopic'],
        restrictions: {
          // Sem restrições específicas de banca ou ano
        },
        helper: 'Escolha a disciplina e tópico que deseja treinar. Você pode praticar questões de qualquer banca ou ano.'
      },

      'focused-training': {
        label: 'Treino Focado no Meu Concurso',
        description: 'Filtra por banca, órgão e cargo específicos, priorizando anos recentes',
        defaultFilters: {
          resolution_status: 'all',
        },
        required: ['exam', 'banca'],
        optional: ['discipline', 'area'],
        restrictions: {
          yearMin: Math.max(2018, currentYear - 5),
          yearMax: currentYear,
        },
        helper: 'Escolha seu concurso e banca. O sistema mostrará questões dos últimos 5 anos.'
      },

      'revision-mistakes': {
        label: 'Revisão do Que Errei',
        description: 'Foca em questões que você errou, mantendo filtros de conteúdo',
        defaultFilters: {
          resolution_status: 'incorrect',
          exclude_outdated: true,
        },
        required: ['discipline'],
        optional: ['topic', 'subtopic', 'difficulty'],
        restrictions: {
          // Sem restrições de ano, mas foca apenas em incorretas
        },
        helper: 'As questões que você errou serão mostradas para revisão. Filtre por disciplina se desejar.'
      },

      'simulation': {
        label: 'Simulado / Teste Cronometrado',
        description: 'Gera simulado com questões variadas de um concurso específico',
        defaultFilters: {
          resolution_status: 'not_resolved',
        },
        required: ['exam'],
        optional: ['difficulty'],
        restrictions: {
          yearMin: Math.max(2015, currentYear - 7),
          yearMax: currentYear,
        },
        helper: 'Simule uma prova real. Recomenda-se 1-2 horas e múltiplas disciplinas.'
      },

      'weak-topics': {
        label: 'Reforço de Tópicos Fracos',
        description: 'Mostra questões que você errou com frequência em um tópico',
        defaultFilters: {
          resolution_status: 'incorrect',
          exclude_outdated: true,
        },
        required: ['discipline', 'topic'],
        optional: ['difficulty'],
        restrictions: {
          // Foca em questões incorretas do tópico
        },
        helper: 'Identifique seus pontos fracos e reforce com questões específicas.'
      },
    };
  }

  /**
   * Adiciona ou atualiza um filtro
   * @param {string} filterKey - Chave do filtro (ex: 'discipline', 'difficulty')
   * @param {*} value - Valor a ser atribuído
   * @returns {boolean} true se filtro foi adicionado com sucesso, false caso contrário
   */
  addFilter(filterKey, value) {
    const schema = this.FILTER_SCHEMAS[filterKey];
    
    if (!schema) {
      console.warn(`[Filters] Chave de filtro desconhecida: "${filterKey}"`);
      return false;
    }

    // Aplicar transformação se definida
    let transformedValue = value;
    if (schema.transform && typeof schema.transform === 'function') {
      transformedValue = schema.transform(value);
    }

    // Validar valores permitidos
    if (schema.validValues && !schema.validValues.includes(transformedValue)) {
      console.warn(
        `[Filters] Valor inválido para "${filterKey}": "${value}". ` +
        `Valores permitidos: ${schema.validValues.join(', ')}`
      );
      return false;
    }

    // Armazenar o filtro
    if (schema.multiple) {
      // Se permite múltiplos valores, manter como array
      if (!Array.isArray(this.filters[filterKey])) {
        this.filters[filterKey] = [];
      }
      if (!this.filters[filterKey].includes(transformedValue)) {
        this.filters[filterKey].push(transformedValue);
      }
    } else {
      // Se permite valor único, sobrescrever
      this.filters[filterKey] = transformedValue;
    }

    this.notifyListeners();
    this.saveToStorageIfEnabled();
    
    return true;
  }

  /**
   * Remove um filtro específico
   * @param {string} filterKey - Chave do filtro a remover
   * @returns {boolean} true se removido com sucesso
   */
  removeFilter(filterKey) {
    if (filterKey in this.filters) {
      delete this.filters[filterKey];
      this.notifyListeners();
      this.saveToStorageIfEnabled();
      return true;
    }
    return false;
  }

  /**
   * Remove um valor específico de um filtro de múltiplos valores
   * @param {string} filterKey - Chave do filtro
   * @param {*} value - Valor a remover
   * @returns {boolean} true se removido
   */
  removeFilterValue(filterKey, value) {
    const schema = this.FILTER_SCHEMAS[filterKey];
    
    if (!schema || !schema.multiple) {
      return false;
    }

    if (Array.isArray(this.filters[filterKey])) {
      const originalLength = this.filters[filterKey].length;
      this.filters[filterKey] = this.filters[filterKey].filter(v => v !== value);
      
      if (this.filters[filterKey].length === 0) {
        delete this.filters[filterKey];
      }

      this.notifyListeners();
      this.saveToStorageIfEnabled();
      
      return this.filters[filterKey].length < originalLength;
    }

    return false;
  }

  /**
   * Limpa todos os filtros
   */
  clearAllFilters() {
    this.filters = {};
    this.notifyListeners();
    this.saveToStorageIfEnabled();
  }

  /**
   * Aplica um preset de filtros
   * @param {string} presetKey - Chave do preset
   * @param {Object} overrides - Valores para sobrescrever no preset
   * @returns {boolean} true se preset aplicado com sucesso
   */
  applyPreset(presetKey, overrides = {}) {
    const preset = this.presets[presetKey];
    
    if (!preset) {
      console.warn(`[Filters] Preset desconhecido: "${presetKey}"`);
      return false;
    }

    // Limpar filtros anteriores
    this.clearAllFilters();

    // Aplicar filtros padrão do preset
    Object.entries(preset.defaultFilters).forEach(([key, value]) => {
      this.addFilter(key, value);
    });

    // Aplicar restrições automáticas
    if (preset.restrictions) {
      Object.entries(preset.restrictions).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          this.addFilter(key + 'Min', value[0]);
          this.addFilter(key + 'Max', value[1]);
        } else {
          this.addFilter(key, value);
        }
      });
    }

    // Aplicar sobrescritas do usuário
    Object.entries(overrides).forEach(([key, value]) => {
      this.addFilter(key, value);
    });

    return true;
  }

  /**
   * Obtém metadados de um preset
   * @param {string} presetKey - Chave do preset
   * @returns {Object|null} Metadados do preset ou null
   */
  getPresetMetadata(presetKey) {
    const preset = this.presets[presetKey];
    if (!preset) return null;

    return {
      label: preset.label,
      description: preset.description,
      helper: preset.helper || '',
      required: preset.required || [],
      optional: preset.optional || [],
    };
  }

  /**
   * Retorna lista de todos os presets disponíveis
   * @returns {Array} Array com { key, label, description }
   */
  getAllPresets() {
    return Object.entries(this.presets).map(([key, preset]) => ({
      key,
      label: preset.label,
      description: preset.description,
    }));
  }

  /**
   * Obtém os filtros ativos (não vazios)
   * @returns {Object} Objeto com filtros aplicados
   */
  getActiveFilters() {
    // Retornar apenas filtros que têm valores definidos
    const active = {};
    
    Object.entries(this.filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        // Se for array vazio, não incluir
        if (Array.isArray(value) && value.length === 0) {
          return;
        }
        active[key] = value;
      }
    });

    return active;
  }

  /**
   * Obtém filtros agrupados por categoria
   * Útil para renderizar UI organizada
   * @returns {Object} { conteudo: {...}, concurso: {...}, prova: {...}, historico: {...} }
   */
  getActiveFiltersByCategory() {
    const grouped = {
      conteudo: {},
      concurso: {},
      prova: {},
      historico: {},
    };

    const active = this.getActiveFilters();

    Object.entries(active).forEach(([key, value]) => {
      const schema = this.FILTER_SCHEMAS[key];
      if (schema) {
        const category = schema.category;
        grouped[category][key] = {
          label: schema.label,
          value: value,
          schema: schema,
        };
      }
    });

    return grouped;
  }

  /**
   * Obtém informações de um filtro específico
   * @param {string} filterKey - Chave do filtro
   * @returns {Object|null} Informações do filtro ou null
   */
  getFilterInfo(filterKey) {
    const schema = this.FILTER_SCHEMAS[filterKey];
    if (!schema) return null;

    return {
      key: filterKey,
      label: schema.label,
      description: schema.description,
      category: schema.category,
      type: schema.type,
      multiple: schema.multiple,
      validValues: schema.validValues || null,
      currentValue: this.filters[filterKey] || null,
    };
  }

  /**
   * Valida se um conjunto de filtros atende aos requisitos de um preset
   * @param {string} presetKey - Chave do preset
   * @returns {Object} { valid: boolean, missing: string[] }
   */
  validatePresetRequirements(presetKey) {
    const preset = this.presets[presetKey];
    if (!preset) {
      return { valid: false, missing: [], error: 'Preset não encontrado' };
    }

    const active = this.getActiveFilters();
    const missing = preset.required.filter(req => !active[req]);

    return {
      valid: missing.length === 0,
      missing: missing,
    };
  }

  /**
   * Retorna sugestões para completar um preset
   * @param {string} presetKey - Chave do preset
   * @returns {Object} Metadados do preset com status de requisitos
   */
  getPresetSuggestions(presetKey) {
    const preset = this.presets[presetKey];
    if (!preset) return null;

    const active = this.getActiveFilters();
    const requirements = this.validatePresetRequirements(presetKey);

    return {
      preset: {
        label: preset.label,
        description: preset.description,
        helper: preset.helper || '',
      },
      requirements: {
        required: preset.required,
        missing: requirements.missing,
        satisfied: preset.required.filter(req => active[req]),
      },
      optional: preset.optional,
      suggestions: preset.optional.filter(opt => !active[opt]),
    };
  }

  /**
   * Obtém a árvore de conteúdo para navegação
   * @param {string} disciplineKey - Chave da disciplina (opcional)
   * @returns {Object} Árvore de conteúdo
   */
  getContentTree(disciplineKey = null) {
    if (disciplineKey) {
      return this.contentTree[disciplineKey] || null;
    }
    return this.contentTree;
  }

  /**
   * Retorna lista de tópicos para uma disciplina
   * @param {string} disciplineKey - Chave da disciplina
   * @returns {Array} Array de { key, label }
   */
  getTopicsForDiscipline(disciplineKey) {
    const discipline = this.contentTree[disciplineKey];
    if (!discipline) return [];

    return Object.entries(discipline.topics || {}).map(([key, topic]) => ({
      key,
      label: topic.label,
    }));
  }

  /**
   * Retorna lista de subtópicos para um tópico
   * @param {string} disciplineKey - Chave da disciplina
   * @param {string} topicKey - Chave do tópico
   * @returns {Array} Array de subtópicos
   */
  getSubtopicsForTopic(disciplineKey, topicKey) {
    const discipline = this.contentTree[disciplineKey];
    if (!discipline) return [];

    const topic = discipline.topics?.[topicKey];
    if (!topic) return [];

    return topic.subtopics || [];
  }

  /**
   * Registra um listener para mudanças de filtros
   * @param {Function} callback - Função a ser chamada quando filtros mudam
   * @returns {Function} Função para remover o listener
   */
  onChange(callback) {
    if (typeof callback !== 'function') {
      console.warn('[Filters] onChange: callback deve ser uma função');
      return () => {};
    }

    this.changeListeners.push(callback);

    // Retornar função para unsubscribe
    return () => {
      const index = this.changeListeners.indexOf(callback);
      if (index > -1) {
        this.changeListeners.splice(index, 1);
      }
    };
  }

  /**
   * Notifica todos os listeners de mudanças
   * @private
   */
  notifyListeners() {
    const active = this.getActiveFilters();
    this.changeListeners.forEach(callback => {
      try {
        callback({
          activeFilters: active,
          filterCount: Object.keys(active).length,
          timestamp: Date.now(),
        });
      } catch (err) {
        console.error('[Filters] Erro ao notificar listener:', err);
      }
    });
  }

  /**
   * Salva filtros no localStorage
   * @private
   */
  saveToStorageIfEnabled() {
    if (!this.persistToStorage) return;

    try {
      const data = {
        filters: this.filters,
        timestamp: Date.now(),
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (err) {
      console.warn('[Filters] Erro ao salvar no localStorage:', err);
    }
  }

  /**
   * Carrega filtros do localStorage
   * @private
   */
  loadFromStorage() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        this.filters = parsed.filters || {};
      }
    } catch (err) {
      console.warn('[Filters] Erro ao carregar do localStorage:', err);
    }
  }

  /**
   * Exporta filtros como JSON (para salvar como "favorito" ou compartilhar)
   * @returns {string} JSON string dos filtros
   */
  exportAsJSON() {
    return JSON.stringify({
      filters: this.getActiveFilters(),
      exportedAt: new Date().toISOString(),
      version: '1.0',
    }, null, 2);
  }

  /**
   * Importa filtros de um JSON (para carregar "favorito")
   * @param {string} jsonString - JSON string contendo filtros
   * @returns {boolean} true se importação bem-sucedida
   */
  importFromJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.filters && typeof data.filters === 'object') {
        this.clearAllFilters();
        Object.entries(data.filters).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach(v => this.addFilter(key, v));
          } else {
            this.addFilter(key, value);
          }
        });
        return true;
      }
    } catch (err) {
      console.error('[Filters] Erro ao importar JSON:', err);
      return false;
    }
  }

  /**
   * Debug: imprime estado interno
   */
  debug() {
    console.log('[Filters Debug]', {
      activeFilters: this.getActiveFilters(),
      activeByCategory: this.getActiveFiltersByCategory(),
      filterCount: Object.keys(this.filters).length,
      listenerCount: this.changeListeners.length,
      storageEnabled: this.persistToStorage,
    });
  }
}

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuestionFilters;
}
