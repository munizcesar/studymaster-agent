/**
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃       STUDYMASTER — COMPONENTE UI DE FILTROS DE QUESTÕES           ┃
 * ┃  Renderiza interface visual para seleção de filtros com            ┃
 * ┃  suporte a seções colapsáveis, tags de filtros aplicados,         ┃
 * ┃  presets, e contador de questões encontradas                      ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */

class QuestionFiltersUI {
  /**
   * Inicializa o componente UI de filtros
   * @param {QuestionFilters} filtersInstance - Instância do gerenciador de filtros
   * @param {Object} options - Configurações opcionais
   * @param {string} options.containerId - ID do elemento container
   * @param {boolean} options.showPresets - Se deve mostrar presets (default: true)
   * @param {boolean} options.expandedByDefault - Se deve iniciar expandido (default: false)
   * @param {Function} options.onQuestionsCountChange - Callback quando contador muda
   */
  constructor(filtersInstance, options = {}) {
    this.filters = filtersInstance;
    this.showPresets = options.showPresets !== false;
    this.expandedByDefault = options.expandedByDefault ?? false;
    this.containerId = options.containerId || 'filters-container';
    this.onQuestionsCountChange = options.onQuestionsCountChange || (() => {});

    // Estado da UI
    this.expandedSections = {
      conteudo: this.expandedByDefault,
      concurso: this.expandedByDefault,
      prova: this.expandedByDefault,
      historico: this.expandedByDefault,
      presets: this.expandedByDefault,
    };

    // Cache de elementos DOM
    this.domElements = {};

    // Listener do módulo de filtros
    this.filterChangeUnsubscribe = null;

    // Inicializar quando documento estiver pronto
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initialize());
    } else {
      this.initialize();
    }
  }

  /**
   * Inicializa o componente
   */
  initialize() {
    this.render();
    this.attachEventListeners();
    this.registerFilterListener();
  }

  /**
   * Renderiza a interface completa de filtros
   */
  render() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.warn(`[FiltersUI] Container com ID "${this.containerId}" não encontrado`);
      return;
    }

    container.innerHTML = this.buildHTML();
    this.cacheElements();
  }

  /**
   * Constrói o HTML da interface de filtros
   * @returns {string} HTML da interface
   */
  buildHTML() {
    const html = `
      <div class="filters-container" role="region" aria-label="Filtros de questões">
        <!-- Cabeçalho com título e ações -->
        <div class="filters-header">
          <div class="filters-title">
            <i data-lucide="filter" width="20" height="20"></i>
            <h2>Filtrar Questões</h2>
          </div>
          <button class="filters-clear-all" type="button" title="Limpar todos os filtros">
            <i data-lucide="trash-2" width="16" height="16"></i>
            Limpar Tudo
          </button>
        </div>

        <!-- Tags de filtros aplicados -->
        <div class="filters-applied-tags" aria-live="polite" aria-label="Filtros ativos">
          <!-- Preenchido dinamicamente -->
        </div>

        <!-- Contador de questões encontradas -->
        <div class="filters-questions-count">
          <div class="count-display">
            <i data-lucide="search" width="18" height="18"></i>
            <span class="count-text">
              <strong id="questions-count">0</strong> questões encontradas
            </span>
          </div>
          <button class="count-refresh" type="button" title="Atualizar contador">
            <i data-lucide="rotate-cw" width="16" height="16"></i>
          </button>
        </div>

        <!-- Abas / Seções de filtros -->
        <div class="filters-sections">
          ${this.buildContentSection()}
          ${this.buildExamSection()}
          ${this.buildProofSection()}
          ${this.buildHistorySection()}
          ${this.showPresets ? this.buildPresetsSection() : ''}
        </div>

        <!-- Rodapé com ações -->
        <div class="filters-footer">
          <button class="filters-apply-btn" type="button">
            <i data-lucide="check-circle" width="18" height="18"></i>
            Aplicar Filtros
          </button>
          <span class="filters-active-count">
            <i data-lucide="tag" width="14" height="14"></i>
            <span id="active-count">0</span> filtro(s) ativo(s)
          </span>
        </div>
      </div>
    `;

    return html;
  }

  /**
   * Constrói seção CONTEÚDO
   */
  buildContentSection() {
    return `
      <section class="filters-section filters-content" data-section="conteudo">
        <header class="section-header" role="button" tabindex="0" aria-expanded="true">
          <h3>
            <i data-lucide="book" width="18" height="18"></i>
            Conteúdo
          </h3>
          <i class="section-toggle" data-lucide="chevron-down" width="18" height="18"></i>
        </header>

        <div class="section-content">
          <!-- Disciplina -->
          <div class="filter-group">
            <label for="filter-discipline" class="filter-label">
              <span>Disciplina</span>
              <span class="required">*</span>
            </label>
            <select id="filter-discipline" class="filter-select" data-filter="discipline">
              <option value="">Selecione uma disciplina...</option>
              <option value="português">Português</option>
              <option value="direito_constitucional">Direito Constitucional</option>
              <option value="direito_administrativo">Direito Administrativo</option>
              <option value="raciocinio_logico">Raciocínio Lógico</option>
              <option value="informatica">Informática</option>
              <option value="administracao_publica">Administração Pública</option>
              <option value="direito_penal">Direito Penal</option>
              <option value="direito_processual_civil">Direito Processual Civil</option>
              <option value="direito_processual_penal">Direito Processual Penal</option>
              <option value="direito_trabalhista">Direito Trabalhista</option>
              <option value="direito_empresarial">Direito Empresarial</option>
              <option value="direito_civil">Direito Civil</option>
              <option value="matemática_financeira">Matemática Financeira</option>
              <option value="contabilidade">Contabilidade</option>
              <option value="economia">Economia</option>
              <option value="história">História</option>
              <option value="geografia">Geografia</option>
              <option value="biologia">Biologia</option>
              <option value="química">Química</option>
              <option value="física">Física</option>
            </select>
            <p class="filter-hint">Escolha a matéria para estudar</p>
          </div>

          <!-- Tópico -->
          <div class="filter-group">
            <label for="filter-topic" class="filter-label">
              <span>Tópico / Assunto</span>
            </label>
            <select id="filter-topic" class="filter-select" data-filter="topic" disabled>
              <option value="">Selecione um tópico...</option>
            </select>
            <p class="filter-hint">Selecione primeiro uma disciplina</p>
          </div>

          <!-- Subtópico -->
          <div class="filter-group">
            <label for="filter-subtopic" class="filter-label">
              <span>Subtópico</span>
            </label>
            <select id="filter-subtopic" class="filter-select" data-filter="subtopic" disabled>
              <option value="">Selecione um subtópico...</option>
            </select>
            <p class="filter-hint">Selecione primeiro um tópico</p>
          </div>

          <!-- Busca por palavra-chave -->
          <div class="filter-group">
            <label for="filter-keyword" class="filter-label">
              <span>Buscar por palavra-chave</span>
            </label>
            <input
              type="text"
              id="filter-keyword"
              class="filter-input"
              data-filter="keywordSearch"
              placeholder="Ex: artigo 5º, crime, contrato..."
              aria-describedby="keyword-hint"
            >
            <p class="filter-hint" id="keyword-hint">Busca textual no enunciado das questões</p>
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Constrói seção CONCURSO
   */
  buildExamSection() {
    return `
      <section class="filters-section filters-exam" data-section="concurso">
        <header class="section-header" role="button" tabindex="0" aria-expanded="false">
          <h3>
            <i data-lucide="briefcase" width="18" height="18"></i>
            Concurso
          </h3>
          <i class="section-toggle" data-lucide="chevron-down" width="18" height="18"></i>
        </header>

        <div class="section-content">
          <!-- Concurso -->
          <div class="filter-group">
            <label for="filter-exam" class="filter-label">
              <span>Concurso</span>
            </label>
            <select id="filter-exam" class="filter-select" data-filter="exam">
              <option value="">Qualquer concurso</option>
              <option value="oab-1fase">OAB — 1ª Fase</option>
              <option value="tj-sp">TJ-SP — Escrevente</option>
              <option value="inss-analista">INSS — Analista</option>
              <option value="receita-auditor">Receita Federal — Auditor</option>
              <option value="pf-agente">PF — Agente Federal</option>
              <option value="outro-edital">Outro concurso...</option>
            </select>
            <p class="filter-hint">Deixe em branco para qualquer concurso</p>
          </div>

          <!-- Órgão / Instituição -->
          <div class="filter-group">
            <label class="filter-label">
              <span>Órgão / Instituição</span>
            </label>
            <div class="filter-chips" data-filter-set="organ">
              <button class="filter-chip" data-value="PJ" type="button">Poder Judiciário</button>
              <button class="filter-chip" data-value="MP" type="button">Ministério Público</button>
              <button class="filter-chip" data-value="Tribunais" type="button">Tribunais</button>
              <button class="filter-chip" data-value="Polícia" type="button">Segurança Pública</button>
              <button class="filter-chip" data-value="Fiscal" type="button">Fiscal / Tributário</button>
              <button class="filter-chip" data-value="Bancário" type="button">Bancário</button>
              <button class="filter-chip" data-value="Educação" type="button">Educação</button>
              <button class="filter-chip" data-value="Saúde" type="button">Saúde</button>
            </div>
          </div>

          <!-- Banca Examinadora -->
          <div class="filter-group">
            <label class="filter-label">
              <span>Banca Examinadora</span>
            </label>
            <div class="filter-chips" data-filter-set="banca">
              <button class="filter-chip" data-value="FGV" type="button">FGV</button>
              <button class="filter-chip" data-value="CEBRASPE" type="button">CEBRASPE/CESPE</button>
              <button class="filter-chip" data-value="VUNESP" type="button">VUNESP</button>
              <button class="filter-chip" data-value="FCC" type="button">FCC</button>
              <button class="filter-chip" data-value="CESGRANRIO" type="button">CESGRANRIO</button>
              <button class="filter-chip" data-value="IBFC" type="button">IBFC</button>
              <button class="filter-chip" data-value="FUNDEP" type="button">FUNDEP</button>
              <button class="filter-chip" data-value="FUNDATEC" type="button">FUNDATEC</button>
            </div>
          </div>

          <!-- Cargo -->
          <div class="filter-group">
            <label for="filter-position" class="filter-label">
              <span>Cargo</span>
            </label>
            <input
              type="text"
              id="filter-position"
              class="filter-input"
              data-filter="position"
              placeholder="Ex: Analista, Delegado, Escrevente..."
              aria-describedby="position-hint"
            >
            <p class="filter-hint" id="position-hint">Digite o cargo que você está preparando</p>
          </div>

          <!-- Área / Carreira -->
          <div class="filter-group">
            <label class="filter-label">
              <span>Área / Carreira</span>
            </label>
            <div class="filter-chips" data-filter-set="area">
              <button class="filter-chip" data-value="policial" type="button">Policial</button>
              <button class="filter-chip" data-value="fiscal" type="button">Fiscal</button>
              <button class="filter-chip" data-value="tribunais" type="button">Judiciária</button>
              <button class="filter-chip" data-value="educacao" type="button">Educação</button>
              <button class="filter-chip" data-value="saude" type="button">Saúde</button>
              <button class="filter-chip" data-value="bancario" type="button">Bancária</button>
              <button class="filter-chip" data-value="adm_geral" type="button">Adm. Geral</button>
            </div>
          </div>

          <!-- Nível de Escolaridade -->
          <div class="filter-group">
            <label class="filter-label">
              <span>Nível de Escolaridade</span>
            </label>
            <div class="filter-chips" data-filter-set="education_level">
              <button class="filter-chip" data-value="fundamental" type="button">Fundamental</button>
              <button class="filter-chip" data-value="médio" type="button">Médio</button>
              <button class="filter-chip" data-value="técnico" type="button">Técnico</button>
              <button class="filter-chip" data-value="superior" type="button">Superior</button>
            </div>
          </div>

          <!-- Esfera -->
          <div class="filter-group">
            <label class="filter-label">
              <span>Esfera</span>
            </label>
            <div class="filter-chips" data-filter-set="sphere">
              <button class="filter-chip" data-value="federal" type="button">Federal</button>
              <button class="filter-chip" data-value="estadual" type="button">Estadual</button>
              <button class="filter-chip" data-value="municipal" type="button">Municipal</button>
            </div>
          </div>

          <!-- UF (Estado) -->
          <div class="filter-group">
            <label for="filter-state" class="filter-label">
              <span>Estado (UF)</span>
            </label>
            <select id="filter-state" class="filter-select" data-filter="state">
              <option value="">Qualquer estado</option>
              <option value="AC">Acre</option>
              <option value="AL">Alagoas</option>
              <option value="AP">Amapá</option>
              <option value="AM">Amazonas</option>
              <option value="BA">Bahia</option>
              <option value="CE">Ceará</option>
              <option value="DF">Distrito Federal</option>
              <option value="ES">Espírito Santo</option>
              <option value="GO">Goiás</option>
              <option value="MA">Maranhão</option>
              <option value="MT">Mato Grosso</option>
              <option value="MS">Mato Grosso do Sul</option>
              <option value="MG">Minas Gerais</option>
              <option value="PA">Pará</option>
              <option value="PB">Paraíba</option>
              <option value="PR">Paraná</option>
              <option value="PE">Pernambuco</option>
              <option value="PI">Piauí</option>
              <option value="RJ">Rio de Janeiro</option>
              <option value="RN">Rio Grande do Norte</option>
              <option value="RS">Rio Grande do Sul</option>
              <option value="RO">Rondônia</option>
              <option value="RR">Roraima</option>
              <option value="SC">Santa Catarina</option>
              <option value="SP">São Paulo</option>
              <option value="SE">Sergipe</option>
              <option value="TO">Tocantins</option>
            </select>
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Constrói seção PROVA
   */
  buildProofSection() {
    return `
      <section class="filters-section filters-proof" data-section="prova">
        <header class="section-header" role="button" tabindex="0" aria-expanded="false">
          <h3>
            <i data-lucide="calendar" width="18" height="18"></i>
            Prova
          </h3>
          <i class="section-toggle" data-lucide="chevron-down" width="18" height="18"></i>
        </header>

        <div class="section-content">
          <!-- Ano da Prova -->
          <div class="filter-group">
            <label class="filter-label">
              <span>Ano da Prova</span>
            </label>
            <div class="year-range">
              <input
                type="number"
                id="filter-year-min"
                class="filter-input filter-year"
                data-filter="yearMin"
                placeholder="Ano inicial"
                min="1950"
                max="2025"
                aria-label="Ano mínimo"
              >
              <span class="year-separator">até</span>
              <input
                type="number"
                id="filter-year-max"
                class="filter-input filter-year"
                data-filter="yearMax"
                placeholder="Ano final"
                min="1950"
                max="2025"
                aria-label="Ano máximo"
              >
            </div>
            <p class="filter-hint">Deixe em branco para qualquer ano</p>
          </div>

          <!-- Modalidade da Questão -->
          <div class="filter-group">
            <label class="filter-label">
              <span>Modalidade da Questão</span>
            </label>
            <div class="filter-chips" data-filter-set="questionType">
              <button class="filter-chip" data-value="multipla_escolha" type="button">
                <i data-lucide="list" width="14" height="14"></i>
                Múltipla Escolha
              </button>
              <button class="filter-chip" data-value="certo_errado" type="button">
                <i data-lucide="check-x" width="14" height="14"></i>
                Certo/Errado
              </button>
              <button class="filter-chip" data-value="discursiva" type="button">
                <i data-lucide="pen-tool" width="14" height="14"></i>
                Discursiva
              </button>
              <button class="filter-chip" data-value="resposta_curta" type="button">
                <i data-lucide="type" width="14" height="14"></i>
                Resposta Curta
              </button>
            </div>
          </div>

          <!-- Nível de Dificuldade -->
          <div class="filter-group">
            <label class="filter-label">
              <span>Nível de Dificuldade</span>
            </label>
            <div class="difficulty-slider">
              <div class="filter-chips difficulty-chips" data-filter-set="difficulty">
                <button class="filter-chip" data-value="muito_facil" type="button">
                  <span class="difficulty-dot" style="background: #4ADE80;"></span>
                  Muito Fácil
                </button>
                <button class="filter-chip" data-value="facil" type="button">
                  <span class="difficulty-dot" style="background: #60A5FA;"></span>
                  Fácil
                </button>
                <button class="filter-chip" data-value="medio" type="button">
                  <span class="difficulty-dot" style="background: #FBBF24;"></span>
                  Médio
                </button>
                <button class="filter-chip" data-value="dificil" type="button">
                  <span class="difficulty-dot" style="background: #F97316;"></span>
                  Difícil
                </button>
                <button class="filter-chip" data-value="muito_dificil" type="button">
                  <span class="difficulty-dot" style="background: #EF4444;"></span>
                  Muito Difícil
                </button>
              </div>
            </div>
            <p class="filter-hint">Selecione um ou mais níveis</p>
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Constrói seção HISTÓRICO
   */
  buildHistorySection() {
    return `
      <section class="filters-section filters-history" data-section="historico">
        <header class="section-header" role="button" tabindex="0" aria-expanded="false">
          <h3>
            <i data-lucide="history" width="18" height="18"></i>
            Histórico do Aluno
          </h3>
          <i class="section-toggle" data-lucide="chevron-down" width="18" height="18"></i>
        </header>

        <div class="section-content">
          <!-- Status de Resolução -->
          <div class="filter-group">
            <label class="filter-label">
              <span>Status de Resolução</span>
            </label>
            <div class="filter-chips" data-filter-set="resolution_status">
              <button class="filter-chip" data-value="all" type="button">
                <i data-lucide="circle-help" width="14" height="14"></i>
                Todas
              </button>
              <button class="filter-chip" data-value="not_resolved" type="button">
                <i data-lucide="inbox" width="14" height="14"></i>
                Não Resolvidas
              </button>
              <button class="filter-chip" data-value="resolved" type="button">
                <i data-lucide="check" width="14" height="14"></i>
                Resolvidas
              </button>
              <button class="filter-chip" data-value="correct" type="button">
                <i data-lucide="check-circle" width="14" height="14"></i>
                Acertadas
              </button>
              <button class="filter-chip" data-value="incorrect" type="button">
                <i data-lucide="x-circle" width="14" height="14"></i>
                Erradas
              </button>
            </div>
          </div>

          <!-- Filtros booleanos -->
          <div class="filter-group">
            <label class="filter-label">
              <span>Opções Adicionais</span>
            </label>
            <div class="filter-checkboxes">
              <label class="checkbox-item">
                <input type="checkbox" data-filter="exclude_annulled" class="filter-checkbox">
                <span class="checkbox-label">Excluir questões anuladas</span>
              </label>
              <label class="checkbox-item">
                <input type="checkbox" data-filter="exclude_outdated" class="filter-checkbox">
                <span class="checkbox-label">Excluir questões desatualizadas</span>
              </label>
              <label class="checkbox-item">
                <input type="checkbox" data-filter="only_commented" class="filter-checkbox">
                <span class="checkbox-label">Apenas com gabarito comentado</span>
              </label>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Constrói seção de PRESETS
   */
  buildPresetsSection() {
    const presets = this.filters.getAllPresets();
    
    return `
      <section class="filters-section filters-presets" data-section="presets">
        <header class="section-header" role="button" tabindex="0" aria-expanded="false">
          <h3>
            <i data-lucide="zap" width="18" height="18"></i>
            Presets Rápidos
          </h3>
          <i class="section-toggle" data-lucide="chevron-down" width="18" height="18"></i>
        </header>

        <div class="section-content">
          <div class="presets-grid">
            ${presets.map(preset => `
              <button class="preset-card" data-preset="${preset.key}" type="button">
                <h4>${preset.label}</h4>
                <p>${preset.description}</p>
                <span class="preset-icon">
                  <i data-lucide="arrow-right" width="16" height="16"></i>
                </span>
              </button>
            `).join('')}
          </div>
          <p class="filter-hint">
            Clique em um preset para aplicar uma combinação pré-configurada de filtros
          </p>
        </div>
      </section>
    `;
  }

  /**
   * Armazena referências aos elementos DOM importantes
   * @private
   */
  cacheElements() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    this.domElements = {
      container: container,
      clearAllBtn: container.querySelector('.filters-clear-all'),
      applyBtn: container.querySelector('.filters-apply-btn'),
      countRefreshBtn: container.querySelector('.count-refresh'),
      questionsCount: container.querySelector('#questions-count'),
      activeCount: container.querySelector('#active-count'),
      appliedTags: container.querySelector('.filters-applied-tags'),
      sections: container.querySelectorAll('.filters-section'),
      sectionHeaders: container.querySelectorAll('.section-header'),
    };

    // Renderizar ícones Lucide se disponível
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  /**
   * Anexa event listeners aos elementos da UI
   * @private
   */
  attachEventListeners() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    // Botão para limpar todos os filtros
    const clearAllBtn = container.querySelector('.filters-clear-all');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => this.handleClearAllFilters());
    }

    // Botão para aplicar filtros
    const applyBtn = container.querySelector('.filters-apply-btn');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => this.handleApplyFilters());
    }

    // Botão para atualizar contador
    const countRefreshBtn = container.querySelector('.count-refresh');
    if (countRefreshBtn) {
      countRefreshBtn.addEventListener('click', () => this.updateQuestionsCount());
    }

    // Headers das seções (expansão/colapso)
    container.querySelectorAll('.section-header').forEach(header => {
      header.addEventListener('click', (e) => this.handleSectionToggle(e));
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.handleSectionToggle(e);
        }
      });
    });

    // Selects
    container.querySelectorAll('.filter-select').forEach(select => {
      select.addEventListener('change', (e) => this.handleSelectChange(e));
    });

    // Inputs de texto
    container.querySelectorAll('.filter-input').forEach(input => {
      input.addEventListener('input', (e) => this.handleInputChange(e));
    });

    // Chips/Botões de filtro
    container.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', (e) => this.handleChipClick(e));
    });

    // Checkboxes
    container.querySelectorAll('.filter-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => this.handleCheckboxChange(e));
    });

    // Disciplina (atualizar tópicos quando mudar)
    const disciplineSelect = container.querySelector('#filter-discipline');
    if (disciplineSelect) {
      disciplineSelect.addEventListener('change', (e) => this.handleDisciplineChange(e));
    }

    // Tópico (atualizar subtópicos quando mudar)
    const topicSelect = container.querySelector('#filter-topic');
    if (topicSelect) {
      topicSelect.addEventListener('change', (e) => this.handleTopicChange(e));
    }

    // Presets
    container.querySelectorAll('.preset-card').forEach(preset => {
      preset.addEventListener('click', (e) => this.handlePresetClick(e));
    });

    // Tags de filtros aplicados (remover)
    container.addEventListener('click', (e) => {
      if (e.target.closest('.tag-remove')) {
        this.handleRemoveTag(e);
      }
    });
  }

  /**
   * Manipulador para clique em seção (expansão/colapso)
   * @private
   */
  handleSectionToggle(e) {
    const header = e.currentTarget;
    const section = header.closest('.filters-section');
    if (!section) return;

    const sectionName = section.getAttribute('data-section');
    if (!sectionName) return;

    this.expandedSections[sectionName] = !this.expandedSections[sectionName];

    // Atualizar UI
    section.classList.toggle('collapsed');
    header.setAttribute('aria-expanded', this.expandedSections[sectionName]);

    // Animar toggle
    const toggle = header.querySelector('.section-toggle');
    if (toggle) {
      toggle.style.transform = this.expandedSections[sectionName]
        ? 'rotate(0deg)'
        : 'rotate(-90deg)';
    }
  }

  /**
   * Manipulador para mudança em select
   * @private
   */
  handleSelectChange(e) {
    const select = e.target;
    const filterKey = select.getAttribute('data-filter');
    const value = select.value;

    if (!filterKey) return;

    if (value) {
      this.filters.addFilter(filterKey, value);
    } else {
      this.filters.removeFilter(filterKey);
    }

    this.updateUI();
  }

  /**
   * Manipulador para mudança em input de texto
   * @private
   */
  handleInputChange(e) {
    const input = e.target;
    const filterKey = input.getAttribute('data-filter');
    const value = input.value.trim();

    if (!filterKey) return;

    if (value) {
      this.filters.addFilter(filterKey, value);
    } else {
      this.filters.removeFilter(filterKey);
    }

    this.updateUI();
  }

  /**
   * Manipulador para clique em chip/botão
   * @private
   */
  handleChipClick(e) {
    const chip = e.currentTarget;
    const container = chip.closest('.filter-chips');
    if (!container) return;

    const filterSetKey = container.getAttribute('data-filter-set');
    const value = chip.getAttribute('data-value');

    if (!filterSetKey || !value) return;

    // Toggle do chip
    chip.classList.toggle('active');

    if (chip.classList.contains('active')) {
      this.filters.addFilter(filterSetKey, value);
    } else {
      this.filters.removeFilterValue(filterSetKey, value);
    }

    this.updateUI();
  }

  /**
   * Manipulador para mudança em checkbox
   * @private
   */
  handleCheckboxChange(e) {
    const checkbox = e.target;
    const filterKey = checkbox.getAttribute('data-filter');

    if (!filterKey) return;

    if (checkbox.checked) {
      this.filters.addFilter(filterKey, true);
    } else {
      this.filters.removeFilter(filterKey);
    }

    this.updateUI();
  }

  /**
   * Manipulador para mudança de disciplina
   * @private
   */
  handleDisciplineChange(e) {
    const select = e.target;
    const value = select.value;

    // Limpar tópicos anteriores
    const topicSelect = document.querySelector('#filter-topic');
    const subtopicSelect = document.querySelector('#filter-subtopic');

    if (!value) {
      topicSelect.disabled = true;
      subtopicSelect.disabled = true;
      topicSelect.innerHTML = '<option value="">Selecione um tópico...</option>';
      subtopicSelect.innerHTML = '<option value="">Selecione um subtópico...</option>';
      return;
    }

    // Carregar tópicos para a disciplina selecionada
    const topics = this.filters.getTopicsForDiscipline(value);

    topicSelect.innerHTML = '<option value="">Selecione um tópico...</option>';
    topics.forEach(topic => {
      const option = document.createElement('option');
      option.value = topic.key;
      option.textContent = topic.label;
      topicSelect.appendChild(option);
    });

    topicSelect.disabled = false;
    subtopicSelect.disabled = true;
    subtopicSelect.innerHTML = '<option value="">Selecione um subtópico...</option>';

    // Aplicar filtro
    this.filters.addFilter('discipline', value);
    this.updateUI();
  }

  /**
   * Manipulador para mudança de tópico
   * @private
   */
  handleTopicChange(e) {
    const select = e.target;
    const topicValue = select.value;
    const disciplineSelect = document.querySelector('#filter-discipline');
    const disciplineValue = disciplineSelect.value;

    const subtopicSelect = document.querySelector('#filter-subtopic');

    if (!topicValue) {
      subtopicSelect.disabled = true;
      subtopicSelect.innerHTML = '<option value="">Selecione um subtópico...</option>';
      return;
    }

    // Carregar subtópicos
    const subtopics = this.filters.getSubtopicsForTopic(disciplineValue, topicValue);

    subtopicSelect.innerHTML = '<option value="">Selecione um subtópico...</option>';
    subtopics.forEach(subtopic => {
      const option = document.createElement('option');
      option.value = subtopic;
      option.textContent = subtopic
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
      subtopicSelect.appendChild(option);
    });

    subtopicSelect.disabled = false;

    // Aplicar filtro
    this.filters.addFilter('topic', topicValue);
    this.updateUI();
  }

  /**
   * Manipulador para clique em preset
   * @private
   */
  handlePresetClick(e) {
    const presetBtn = e.currentTarget;
    const presetKey = presetBtn.getAttribute('data-preset');

    if (!presetKey) return;

    // Aplicar preset
    this.filters.applyPreset(presetKey);
    this.updateUI();

    // Feedback visual
    presetBtn.classList.add('activated');
    setTimeout(() => presetBtn.classList.remove('activated'), 600);

    // Scroll para tags de filtros aplicados
    const tagsContainer = this.domElements.appliedTags;
    if (tagsContainer) {
      tagsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /**
   * Manipulador para remover filtro ao clicar em X na tag
   * @private
   */
  handleRemoveTag(e) {
    const tag = e.currentTarget.closest('.applied-tag');
    if (!tag) return;

    const filterKey = tag.getAttribute('data-filter-key');
    const filterValue = tag.getAttribute('data-filter-value');

    if (!filterKey) return;

    if (filterValue) {
      this.filters.removeFilterValue(filterKey, filterValue);
    } else {
      this.filters.removeFilter(filterKey);
    }

    this.updateUI();
  }

  /**
   * Manipulador para limpar todos os filtros
   * @private
   */
  handleClearAllFilters() {
    const confirmed = confirm('Deseja limpar todos os filtros aplicados?');
    if (confirmed) {
      this.filters.clearAllFilters();
      this.updateUI();
    }
  }

  /**
   * Manipulador para aplicar filtros (callback)
   * @private
   */
  handleApplyFilters() {
    const active = this.filters.getActiveFilters();
    console.log('[FiltersUI] Filtros aplicados:', active);

    // Dispara evento customizado
    const event = new CustomEvent('filtersApplied', {
      detail: { filters: active },
      bubbles: true,
    });
    document.dispatchEvent(event);

    // Feedback visual
    const applyBtn = this.domElements.applyBtn;
    if (applyBtn) {
      applyBtn.classList.add('success');
      setTimeout(() => applyBtn.classList.remove('success'), 1000);
    }
  }

  /**
   * Atualiza a UI após mudanças nos filtros
   * @private
   */
  updateUI() {
    this.updateAppliedTags();
    this.updateActiveCount();
    this.updateQuestionsCount();
  }

  /**
   * Atualiza as tags de filtros aplicados
   * @private
   */
  updateAppliedTags() {
    const tagsContainer = this.domElements.appliedTags;
    if (!tagsContainer) return;

    const grouped = this.filters.getActiveFiltersByCategory();
    const html = [];

    Object.entries(grouped).forEach(([category, filters]) => {
      Object.entries(filters).forEach(([key, data]) => {
        const value = data.value;
        const values = Array.isArray(value) ? value : [value];

        values.forEach(v => {
          let label = String(v);

          // Melhorar label
          if (typeof v === 'string') {
            label = v.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          }

          html.push(`
            <div class="applied-tag" data-filter-key="${key}" data-filter-value="${v}">
              <span class="tag-label">${label}</span>
              <button class="tag-remove" type="button" aria-label="Remover ${label}">
                <i data-lucide="x" width="14" height="14"></i>
              </button>
            </div>
          `);
        });
      });
    });

    tagsContainer.innerHTML = html.length > 0
      ? html.join('')
      : '<p class="no-filters">Nenhum filtro aplicado</p>';

    // Re-renderizar ícones Lucide
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  /**
   * Atualiza o contador de filtros ativos
   * @private
   */
  updateActiveCount() {
    const active = this.filters.getActiveFilters();
    const count = Object.keys(active).length;

    const countEl = this.domElements.activeCount;
    if (countEl) {
      countEl.textContent = String(count);
    }
  }

  /**
   * Atualiza o contador de questões encontradas
   * @public
   */
  updateQuestionsCount(count = 0) {
    const countEl = this.domElements.questionsCount;
    if (countEl) {
      countEl.textContent = String(count);
    }

    this.onQuestionsCountChange({
      count: count,
      filters: this.filters.getActiveFilters(),
    });
  }

  /**
   * Registra um listener para mudanças nos filtros
   */
  registerFilterListener() {
    if (this.filterChangeUnsubscribe) {
      this.filterChangeUnsubscribe();
    }

    this.filterChangeUnsubscribe = this.filters.onChange((state) => {
      this.updateUI();
    });
  }

  /**
   * Destroi o componente
   */
  destroy() {
    if (this.filterChangeUnsubscribe) {
      this.filterChangeUnsubscribe();
    }

    const container = document.getElementById(this.containerId);
    if (container) {
      container.innerHTML = '';
    }

    this.domElements = {};
  }
}

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuestionFiltersUI;
}
