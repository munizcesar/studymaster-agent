/**
 * COMPONENTE UI DE FILTROS - Renderização e interatividade
 * 
 * Responsabilidades:
 * - Renderizar painel de filtros com seções (CONTEÚDO, CONCURSO, PROVA, HISTÓRICO)
 * - Handlers de eventos (mudança, limpeza, favoritos, presets)
 * - Atualizar contagem dinâmica de questões
 * - Sincronizar UI com FilterManager
 */

class FilterUI {
  constructor(containerId, filterManager) {
    this.container = document.getElementById(containerId);
    this.filterManager = filterManager;
    this.questionCounter = 0;
    this.isLoading = false;
    
    if (!this.container) {
      console.error(`Container com ID '${containerId}' não encontrado`);
      return;
    }

    // Subscribe às mudanças de filtros
    this.filterManager.subscribe((event) => this.onFilterChange(event));

    this.render();
    this.attachEventListeners();
  }

  /**
   * Renderiza o painel completo de filtros
   */
  render() {
    const html = `
      <div class="filter-panel">
        <!-- HEADER com Presets e Ações -->
        <div class="filter-header">
          <h2>Filtros de Questões</h2>
          <div class="filter-header-actions">
            <button class="btn-preset" data-preset="general" title="Treino Geral">
              <svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              <span>Geral</span>
            </button>
            <button class="btn-preset" data-preset="focused" title="Treino Focado">
              <svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="12" cy="12" r="8"></circle>
                <circle cx="12" cy="12" r="4"></circle>
              </svg>
              <span>Concurso</span>
            </button>
            <button class="btn-preset" data-preset="review" title="Revisão">
              <svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>Revisão</span>
            </button>
            <button class="btn-icon btn-clear-filters" title="Limpar todos os filtros">
              <svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 4 21 4"></polyline>
                <path d="M19 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4"></path>
                <path d="M10 11v6"></path>
                <path d="M14 11v6"></path>
              </svg>
            </button>
            <button class="btn-icon btn-toggle-favorites" title="Ver favoritos">
              <svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- FILTROS ATIVOS (tags removíveis) -->
        <div class="filter-active-tags" id="activeFiltersTags" style="display: none;">
          <!-- Preenchido dinamicamente -->
        </div>

        <!-- SEÇÕES DE FILTROS (Accordion/Tabs) -->
        <div class="filter-sections">
          
          <!-- SEÇÃO 1: CONTEÚDO -->
          <div class="filter-section" data-section="content">
            <button class="filter-section-header">
              <span class="section-title">📚 Conteúdo</span>
              <svg class="icon icon-toggle" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div class="filter-section-content">
              <div class="filter-group">
                <label>Disciplina</label>
                <select id="filter-discipline" class="filter-select">
                  <option value="">Selecione uma disciplina...</option>
                  <option value="portugues">Português</option>
                  <option value="direito_constitucional">Direito Constitucional</option>
                  <option value="direito_administrativo">Direito Administrativo</option>
                  <option value="raciocinio_logico">Raciocínio Lógico</option>
                  <option value="informatica">Informática</option>
                  <option value="administracao_publica">Administração Pública</option>
                  <!-- Mais disciplinas conforme taxonomia -->
                </select>
              </div>

              <div class="filter-group">
                <label>Tópico</label>
                <select id="filter-topic" class="filter-select" disabled>
                  <option value="">Selecione um tópico...</option>
                </select>
              </div>

              <div class="filter-group">
                <label>Subtópico</label>
                <select id="filter-subtopic" class="filter-select" disabled>
                  <option value="">Selecione um subtópico...</option>
                </select>
              </div>

              <div class="filter-group">
                <label>Busca por Palavra-chave</label>
                <input 
                  type="text" 
                  id="filter-keyword" 
                  class="filter-input" 
                  placeholder="Ex: verbos, concordância, artigos..."
                />
              </div>
            </div>
          </div>

          <!-- SEÇÃO 2: CONCURSO -->
          <div class="filter-section" data-section="exam">
            <button class="filter-section-header">
              <span class="section-title">🏛️ Concurso</span>
              <svg class="icon icon-toggle" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div class="filter-section-content" style="display: none;">
              <div class="filter-group">
                <label>Concurso Específico</label>
                <input 
                  type="text" 
                  id="filter-specific-exam" 
                  class="filter-input" 
                  placeholder="Ex: TRT 2024, TJDG 2023..."
                />
              </div>

              <div class="filter-group">
                <label>Órgão / Instituição</label>
                <select id="filter-agency" class="filter-select">
                  <option value="">Selecione um órgão...</option>
                  <option value="trt">TRT (Tribunal Regional do Trabalho)</option>
                  <option value="tjdg">TJDG (Tribunal de Justiça)</option>
                  <option value="rf">Receita Federal</option>
                  <option value="inss">INSS</option>
                  <option value="tce">TCE (Tribunal de Contas)</option>
                  <option value="stm">STM (Superior Tribunal Militar)</option>
                  <option value="other">Outro</option>
                </select>
              </div>

              <div class="filter-group">
                <label>Banca Examinadora</label>
                <select id="filter-exam-board" class="filter-select">
                  <option value="">Selecione uma banca...</option>
                  <option value="fgv">FGV (Fundação Getúlio Vargas)</option>
                  <option value="cesgranrio">CESGRANRIO</option>
                  <option value="cespe">CESPE / CEBRASPE</option>
                  <option value="vunesp">VUNESP</option>
                  <option value="ibfc">IBFC</option>
                  <option value="consulplan">Consulplan</option>
                  <option value="other">Outra</option>
                </select>
              </div>

              <div class="filter-group">
                <label>Cargo</label>
                <input 
                  type="text" 
                  id="filter-position" 
                  class="filter-input" 
                  placeholder="Ex: Analista Judiciário, Auditor Fiscal..."
                />
              </div>

              <div class="filter-group">
                <label>Área / Carreira</label>
                <select id="filter-area" class="filter-select">
                  <option value="">Selecione uma área...</option>
                  <option value="judicial">Poder Judiciário</option>
                  <option value="fiscal">Fiscalização / Auditoria</option>
                  <option value="police">Segurança Pública / Policial</option>
                  <option value="teaching">Magistério / Educação</option>
                  <option value="administration">Administração Geral</option>
                </select>
              </div>

              <div class="filter-group">
                <label>Nível de Escolaridade</label>
                <select id="filter-education-level" class="filter-select">
                  <option value="">Selecione um nível...</option>
                  <option value="fundamental">Ensino Fundamental</option>
                  <option value="médio">Ensino Médio</option>
                  <option value="técnico">Ensino Técnico</option>
                  <option value="superior">Ensino Superior</option>
                </select>
              </div>

              <div class="filter-group">
                <label>Esfera</label>
                <select id="filter-sphere" class="filter-select">
                  <option value="">Selecione uma esfera...</option>
                  <option value="federal">Federal</option>
                  <option value="estadual">Estadual</option>
                  <option value="municipal">Municipal</option>
                </select>
              </div>

              <div class="filter-group">
                <label>UF (Estado)</label>
                <select id="filter-state" class="filter-select">
                  <option value="">Selecione um estado...</option>
                  <option value="DF">Distrito Federal</option>
                  <option value="SP">São Paulo</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="BA">Bahia</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <!-- Mais estados... -->
                </select>
              </div>
            </div>
          </div>

          <!-- SEÇÃO 3: PROVA -->
          <div class="filter-section" data-section="examMetadata">
            <button class="filter-section-header">
              <span class="section-title">📅 Prova</span>
              <svg class="icon icon-toggle" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div class="filter-section-content" style="display: none;">
              <div class="filter-group">
                <label>Ano da Prova</label>
                <div class="filter-group-row">
                  <input 
                    type="number" 
                    id="filter-year-from" 
                    class="filter-input filter-year" 
                    placeholder="De"
                    min="2000"
                    max="2026"
                  />
                  <span class="separator">até</span>
                  <input 
                    type="number" 
                    id="filter-year-to" 
                    class="filter-input filter-year" 
                    placeholder="Até"
                    min="2000"
                    max="2026"
                  />
                </div>
              </div>

              <div class="filter-group">
                <label>Tipo de Questão</label>
                <select id="filter-question-type" class="filter-select">
                  <option value="">Qualquer tipo...</option>
                  <option value="multiple_choice">Múltipla Escolha</option>
                  <option value="true_false">Certo/Errado</option>
                  <option value="discursive">Discursiva</option>
                  <option value="mix">Mista</option>
                </select>
              </div>

              <div class="filter-group">
                <label>Nível de Dificuldade</label>
                <select id="filter-difficulty" class="filter-select">
                  <option value="">Qualquer dificuldade...</option>
                  <option value="very_easy">Muito Fácil</option>
                  <option value="easy">Fácil</option>
                  <option value="medium">Médio</option>
                  <option value="hard">Difícil</option>
                  <option value="very_hard">Muito Difícil</option>
                </select>
              </div>
            </div>
          </div>

          <!-- SEÇÃO 4: HISTÓRICO DO ALUNO -->
          <div class="filter-section" data-section="history">
            <button class="filter-section-header">
              <span class="section-title">📊 Histórico</span>
              <svg class="icon icon-toggle" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div class="filter-section-content" style="display: none;">
              <div class="filter-group">
                <label>Status das Questões</label>
                <select id="filter-status" class="filter-select">
                  <option value="all">Todas as questões</option>
                  <option value="not_solved">Apenas não resolvidas</option>
                  <option value="solved">Apenas resolvidas</option>
                  <option value="correct">Apenas acertadas</option>
                  <option value="wrong">Apenas erradas</option>
                </select>
              </div>

              <div class="filter-group">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    id="filter-exclude-annulled" 
                    class="filter-checkbox"
                  />
                  <span>Excluir questões anuladadas</span>
                </label>
              </div>

              <div class="filter-group">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    id="filter-exclude-outdated" 
                    class="filter-checkbox"
                  />
                  <span>Excluir questões desatualizadas</span>
                </label>
              </div>

              <div class="filter-group">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    id="filter-has-commentary" 
                    class="filter-checkbox"
                  />
                  <span>Apenas com comentário / gabarito</span>
                </label>
              </div>
            </div>
          </div>

        </div>

        <!-- FOOTER com Contador e Botão de Aplicar -->
        <div class="filter-footer">
          <div class="filter-counter">
            <svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <span id="questionCounterText">Selecione filtros para contar questões</span>
          </div>
          <button id="applyFiltersBtn" class="btn btn-primary" disabled>
            Gerar Questões
          </button>
        </div>
      </div>

      <!-- MODAL DE FAVORITOS (Overlay) -->
      <div class="filter-favorites-modal" id="favoritesModal" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Meus Filtros Favoritos</h3>
            <button class="btn-close" aria-label="Fechar">×</button>
          </div>
          <div class="modal-body" id="favoritesList">
            <!-- Preenchido dinamicamente -->
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="closeFavoritesBtn">Fechar</button>
            <button class="btn btn-primary" id="saveFavoriteBtn">Salvar Filtro Atual</button>
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }

  /**
   * Anexa event listeners ao painel
   */
  attachEventListeners() {
    // Presets
    this.container.querySelectorAll('.btn-preset').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const presetId = e.currentTarget.dataset.preset;
        this.applyPreset(presetId);
      });
    });

    // Limpar todos os filtros
    this.container.querySelector('.btn-clear-filters').addEventListener('click', () => {
      if (confirm('Tem certeza que deseja limpar todos os filtros?')) {
        this.filterManager.clearAllFilters();
        this.updateUI();
      }
    });

    // Toggle de favoritos
    this.container.querySelector('.btn-toggle-favorites').addEventListener('click', () => {
      this.showFavoritesModal();
    });

    // Seções expansíveis (accordion)
    this.container.querySelectorAll('.filter-section-header').forEach(header => {
      header.addEventListener('click', (e) => {
        const section = e.currentTarget.closest('.filter-section');
        const content = section.querySelector('.filter-section-content');
        const isOpen = content.style.display !== 'none';
        
        // Fecha todas as seções
        this.container.querySelectorAll('.filter-section-content').forEach(c => {
          c.style.display = 'none';
        });

        // Abre a clicada (se estava fechada)
        if (!isOpen) {
          content.style.display = 'block';
          section.classList.add('open');
        } else {
          section.classList.remove('open');
        }
      });
    });

    // Filtros de conteúdo
    this.container.querySelector('#filter-discipline').addEventListener('change', (e) => {
      this.filterManager.setFilter('content.discipline', e.target.value || null);
      this.updateTopicSelect();
      this.updateUI();
    });

    this.container.querySelector('#filter-topic').addEventListener('change', (e) => {
      this.filterManager.setFilter('content.topic', e.target.value || null);
      this.updateSubtopicSelect();
      this.updateUI();
    });

    this.container.querySelector('#filter-subtopic').addEventListener('change', (e) => {
      this.filterManager.setFilter('content.subtopic', e.target.value || null);
      this.updateUI();
    });

    this.container.querySelector('#filter-keyword').addEventListener('change', (e) => {
      this.filterManager.setFilter('content.keyword', e.target.value || '');
      this.updateUI();
    });

    // Filtros de concurso
    this.container.querySelector('#filter-specific-exam').addEventListener('change', (e) => {
      this.filterManager.setFilter('exam.specificExam', e.target.value || null);
      this.updateUI();
    });

    this.container.querySelector('#filter-agency').addEventListener('change', (e) => {
      this.filterManager.setFilter('exam.agency', e.target.value || null);
      this.updateUI();
    });

    this.container.querySelector('#filter-exam-board').addEventListener('change', (e) => {
      this.filterManager.setFilter('exam.examBoard', e.target.value || null);
      this.updateUI();
    });

    this.container.querySelector('#filter-position').addEventListener('change', (e) => {
      this.filterManager.setFilter('exam.position', e.target.value || null);
      this.updateUI();
    });

    this.container.querySelector('#filter-area').addEventListener('change', (e) => {
      this.filterManager.setFilter('exam.area', e.target.value || null);
      this.updateUI();
    });

    this.container.querySelector('#filter-education-level').addEventListener('change', (e) => {
      this.filterManager.setFilter('exam.educationLevel', e.target.value || null);
      this.updateUI();
    });

    this.container.querySelector('#filter-sphere').addEventListener('change', (e) => {
      this.filterManager.setFilter('exam.sphere', e.target.value || null);
      this.updateUI();
    });

    this.container.querySelector('#filter-state').addEventListener('change', (e) => {
      this.filterManager.setFilter('exam.state', e.target.value || null);
      this.updateUI();
    });

    // Filtros de prova
    this.container.querySelector('#filter-year-from').addEventListener('change', (e) => {
      this.filterManager.setFilter('examMetadata.yearFrom', e.target.value ? parseInt(e.target.value) : null);
      this.updateUI();
    });

    this.container.querySelector('#filter-year-to').addEventListener('change', (e) => {
      this.filterManager.setFilter('examMetadata.yearTo', e.target.value ? parseInt(e.target.value) : null);
      this.updateUI();
    });

    this.container.querySelector('#filter-question-type').addEventListener('change', (e) => {
      this.filterManager.setFilter('examMetadata.questionType', e.target.value || null);
      this.updateUI();
    });

    this.container.querySelector('#filter-difficulty').addEventListener('change', (e) => {
      this.filterManager.setFilter('examMetadata.difficulty', e.target.value || null);
      this.updateUI();
    });

    // Filtros de histórico
    this.container.querySelector('#filter-status').addEventListener('change', (e) => {
      this.filterManager.setFilter('history.statusFilter', e.target.value || 'all');
      this.updateUI();
    });

    this.container.querySelector('#filter-exclude-annulled').addEventListener('change', (e) => {
      this.filterManager.setFilter('history.excludeAnnulled', e.target.checked);
      this.updateUI();
    });

    this.container.querySelector('#filter-exclude-outdated').addEventListener('change', (e) => {
      this.filterManager.setFilter('history.excludeOutdated', e.target.checked);
      this.updateUI();
    });

    this.container.querySelector('#filter-has-commentary').addEventListener('change', (e) => {
      this.filterManager.setFilter('history.hasCommentary', e.target.checked);
      this.updateUI();
    });

    // Botão de aplicar filtros
    this.container.querySelector('#applyFiltersBtn').addEventListener('click', () => {
      this.applyFiltersAndGenerateQuestions();
    });

    // Modal de favoritos
    this.container.querySelector('.btn-close').addEventListener('click', () => {
      this.hideFavoritesModal();
    });

    this.container.querySelector('#closeFavoritesBtn').addEventListener('click', () => {
      this.hideFavoritesModal();
    });

    this.container.querySelector('#saveFavoriteBtn').addEventListener('click', () => {
      const name = prompt('Nome para este filtro:');
      if (name && name.trim()) {
        this.filterManager.saveFavorite(name.trim());
        this.showFavoritesModal();  // Atualiza a lista
      }
    });
  }

  /**
   * Callback quando filtros mudam (observador)
   */
  onFilterChange(event) {
    // console.log('Filter changed:', event);
  }

  /**
   * Atualiza a UI após mudanças de filtros
   */
  updateUI() {
    this.updateActiveFiltersTags();
    this.updateQuestionCounter();
  }

  /**
   * Atualiza o select de tópicos baseado na disciplina selecionada
   * (Simplificado - em produção, integrar com árvore real do MAPA-CONTEUDO)
   */
  updateTopicSelect() {
    const discipline = this.filterManager.getFilter('content.discipline');
    const topicSelect = this.container.querySelector('#filter-topic');

    // Mapa simplificado (expandir conforme necessário)
    const topicMap = {
      'portugues': ['Ortografia', 'Acentuação', 'Pontuação', 'Regência Verbal', 'Concordância', 'Semântica'],
      'direito_constitucional': ['Constituição Federal', 'Direitos Fundamentais', 'Poder Executivo', 'Poder Legislativo'],
      'direito_administrativo': ['Servidores Públicos', 'Lei 8.112/90', 'Licitações', 'Atos Administrativos'],
      'raciocinio_logico': ['Lógica Proposicional', 'Conjuntos', 'Combinatória', 'Probabilidade'],
      'informatica': ['SO Windows', 'SO Linux', 'Redes', 'Segurança', 'BD Relacional']
    };

    const topics = topicMap[discipline] || [];

    topicSelect.innerHTML = '<option value="">Selecione um tópico...</option>';
    topics.forEach(topic => {
      const opt = document.createElement('option');
      opt.value = topic.toLowerCase().replace(/\s+/g, '_');
      opt.textContent = topic;
      topicSelect.appendChild(opt);
    });

    topicSelect.disabled = !discipline;
    topicSelect.value = '';

    // Reseta subtópico
    this.container.querySelector('#filter-subtopic').innerHTML = '<option value="">Selecione um subtópico...</option>';
    this.container.querySelector('#filter-subtopic').disabled = true;
  }

  /**
   * Atualiza o select de subtópicos baseado no tópico selecionado
   */
  updateSubtopicSelect() {
    const topic = this.filterManager.getFilter('content.topic');
    const subtopicSelect = this.container.querySelector('#filter-subtopic');

    // Mapa simplificado
    const subtopicMap = {
      'ortografia': ['Uso de hífen', 'Palavras com S/X', 'Acentuação especial'],
      'acentuacao': ['Monossílabos', 'Paroxítonas', 'Proparoxítonas'],
      'pontuacao': ['Vírgula', 'Ponto final', 'Ponto e vírgula', 'Parênteses'],
      // ... expandir
    };

    const subtopics = subtopicMap[topic] || [];

    subtopicSelect.innerHTML = '<option value="">Selecione um subtópico...</option>';
    subtopics.forEach(subtopic => {
      const opt = document.createElement('option');
      opt.value = subtopic.toLowerCase().replace(/\s+/g, '_');
      opt.textContent = subtopic;
      subtopicSelect.appendChild(opt);
    });

    subtopicSelect.disabled = !topic;
  }

  /**
   * Atualiza as tags de filtros ativos
   */
  updateActiveFiltersTags() {
    const activeFilters = this.filterManager.getActiveFilters();
    const tagsContainer = this.container.querySelector('#activeFiltersTags');

    if (activeFilters.length === 0) {
      tagsContainer.style.display = 'none';
      return;
    }

    tagsContainer.style.display = 'flex';
    tagsContainer.innerHTML = activeFilters.map(filter => `
      <span class="filter-tag">
        <span class="tag-label">${filter.label}</span>
        <button class="tag-remove" data-filter-path="${filter.path}" aria-label="Remover filtro">×</button>
      </span>
    `).join('');

    // Event listeners para remover filtros individuais
    tagsContainer.querySelectorAll('.tag-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const path = e.currentTarget.dataset.filterPath;
        this.filterManager.removeFilter(path);
        this.updateUI();
      });
    });
  }

  /**
   * Atualiza o contador de questões
   * (Em produção, fazer uma chamada à API para contar)
   */
  updateQuestionCounter() {
    const counterText = this.container.querySelector('#questionCounterText');
    const activeFilters = this.filterManager.getActiveFilters();

    if (activeFilters.length === 0) {
      counterText.textContent = 'Selecione filtros para contar questões';
      this.container.querySelector('#applyFiltersBtn').disabled = true;
      return;
    }

    // Simulação: em produção, fazer requisição à API
    this.isLoading = true;
    counterText.textContent = 'Contando questões...';

    // setTimeout simula latência de rede
    setTimeout(() => {
      // Lógica simplificada: contar é baseado no número de filtros como placeholder
      const estimatedCount = Math.floor(Math.random() * 500) + 50;
      this.questionCounter = estimatedCount;

      counterText.innerHTML = `
        <strong>${estimatedCount}</strong> questões encontradas
      `;
      this.isLoading = false;
      this.container.querySelector('#applyFiltersBtn').disabled = false;
    }, 500);
  }

  /**
   * Aplica filtros e gera questões (integração com gerador)
   */
  applyFiltersAndGenerateQuestions() {
    const payload = this.filterManager.toApiPayload();
    // console.log('Applying filters:', payload);

    // Aqui você integraria com a geração de questões
    // Por exemplo, chamar window.generateQuestions() ou disparar um evento
    window.dispatchEvent(new CustomEvent('filters-applied', { detail: payload }));
  }

  /**
   * Aplica um preset
   */
  applyPreset(presetId) {
    const validation = this.filterManager.validateForPreset(presetId);

    if (!validation.valid && FILTER_PRESETS[presetId].requiredFields.length > 0) {
      // Se o preset tem campos obrigatórios, mostrar aviso
      alert(`Este preset requer: ${validation.missingFields.join(', ')}`);
    }

    this.filterManager.applyPreset(presetId);
    this.syncUIWithManager();
  }

  /**
   * Sincroniza os valores de inputs com o state do FilterManager
   */
  syncUIWithManager() {
    // Conteúdo
    this.container.querySelector('#filter-discipline').value = this.filterManager.getFilter('content.discipline') || '';
    this.container.querySelector('#filter-topic').value = this.filterManager.getFilter('content.topic') || '';
    this.container.querySelector('#filter-subtopic').value = this.filterManager.getFilter('content.subtopic') || '';
    this.container.querySelector('#filter-keyword').value = this.filterManager.getFilter('content.keyword') || '';

    // Concurso
    this.container.querySelector('#filter-specific-exam').value = this.filterManager.getFilter('exam.specificExam') || '';
    this.container.querySelector('#filter-agency').value = this.filterManager.getFilter('exam.agency') || '';
    this.container.querySelector('#filter-exam-board').value = this.filterManager.getFilter('exam.examBoard') || '';
    this.container.querySelector('#filter-position').value = this.filterManager.getFilter('exam.position') || '';
    this.container.querySelector('#filter-area').value = this.filterManager.getFilter('exam.area') || '';
    this.container.querySelector('#filter-education-level').value = this.filterManager.getFilter('exam.educationLevel') || '';
    this.container.querySelector('#filter-sphere').value = this.filterManager.getFilter('exam.sphere') || '';
    this.container.querySelector('#filter-state').value = this.filterManager.getFilter('exam.state') || '';

    // Prova
    this.container.querySelector('#filter-year-from').value = this.filterManager.getFilter('examMetadata.yearFrom') || '';
    this.container.querySelector('#filter-year-to').value = this.filterManager.getFilter('examMetadata.yearTo') || '';
    this.container.querySelector('#filter-question-type').value = this.filterManager.getFilter('examMetadata.questionType') || '';
    this.container.querySelector('#filter-difficulty').value = this.filterManager.getFilter('examMetadata.difficulty') || '';

    // Histórico
    this.container.querySelector('#filter-status').value = this.filterManager.getFilter('history.statusFilter') || 'all';
    this.container.querySelector('#filter-exclude-annulled').checked = !!this.filterManager.getFilter('history.excludeAnnulled');
    this.container.querySelector('#filter-exclude-outdated').checked = !!this.filterManager.getFilter('history.excludeOutdated');
    this.container.querySelector('#filter-has-commentary').checked = !!this.filterManager.getFilter('history.hasCommentary');

    this.updateUI();
  }

  /**
   * Mostra modal de favoritos
   */
  showFavoritesModal() {
    const modal = this.container.querySelector('#favoritesModal');
    const favoritesList = this.container.querySelector('#favoritesList');

    const favorites = this.filterManager.getFavorites();

    if (favorites.length === 0) {
      favoritesList.innerHTML = '<p class="empty-state">Nenhum filtro favorito salvo ainda.</p>';
    } else {
      favoritesList.innerHTML = favorites.map(fav => `
        <div class="favorite-item">
          <div class="favorite-info">
            <h4>${fav.name}</h4>
            <small>Criado: ${new Date(fav.createdAt).toLocaleDateString('pt-BR')}</small>
          </div>
          <div class="favorite-actions">
            <button class="btn btn-sm btn-secondary" data-load-favorite="${fav.id}">Carregar</button>
            <button class="btn btn-sm btn-danger" data-remove-favorite="${fav.id}">×</button>
          </div>
        </div>
      `).join('');

      // Event listeners para carregar/remover
      favoritesList.querySelectorAll('[data-load-favorite]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.dataset.loadFavorite;
          this.filterManager.loadFavorite(id);
          this.syncUIWithManager();
          this.hideFavoritesModal();
        });
      });

      favoritesList.querySelectorAll('[data-remove-favorite]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.dataset.removeFavorite;
          if (confirm('Tem certeza que deseja remover este favorito?')) {
            this.filterManager.removeFavorite(id);
            this.showFavoritesModal();  // Atualiza a lista
          }
        });
      });
    }

    modal.style.display = 'flex';
  }

  /**
   * Fecha modal de favoritos
   */
  hideFavoritesModal() {
    const modal = this.container.querySelector('#favoritesModal');
    modal.style.display = 'none';
  }
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FilterUI };
} else {
  window.FilterUI = FilterUI;
}
