/**
 * EXEMPLO DE INTEGRAÇÃO - Filter Module with StudyMaster Quiz
 * 
 * Este arquivo demonstra como integrar o módulo de filtros com:
 * 1. Geração de questões
 * 2. Renderização de questões
 * 3. Histórico do aluno (para filtrar por desempenho)
 * 4. Contador dinâmico
 * 
 * Copie este arquivo para seu projeto e adapte conforme necessário.
 */

// ════════════════════════════════════════════════════════════════════════════
// MOCK: Histórico de questões do aluno (simular localStorage/backend)
// ════════════════════════════════════════════════════════════════════════════

class StudentHistory {
  constructor() {
    this.attempts = this.loadHistory();
  }

  loadHistory() {
    try {
      const stored = localStorage.getItem('studymaster-quiz-history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  saveHistory() {
    try {
      localStorage.setItem('studymaster-quiz-history', JSON.stringify(this.attempts));
    } catch (e) {
      console.warn('Erro ao salvar histórico:', e.message);
    }
  }

  /**
   * Registra uma tentativa de questão
   */
  recordAttempt(questionId, wasCorrect, timeSpent) {
    this.attempts.push({
      questionId,
      wasCorrect,
      timeSpent,
      timestamp: new Date().toISOString()
    });
    this.saveHistory();
  }

  /**
   * Obtém status de uma questão
   * @returns "not_solved" | "correct" | "wrong"
   */
  getQuestionStatus(questionId) {
    const attempts = this.attempts.filter(a => a.questionId === questionId);
    if (attempts.length === 0) return 'not_solved';
    
    const lastAttempt = attempts[attempts.length - 1];
    return lastAttempt.wasCorrect ? 'correct' : 'wrong';
  }

  /**
   * Conta quantas questões foram acertadas/erradas
   */
  countByStatus(status) {
    return this.attempts.filter(a => {
      if (status === 'correct') return a.wasCorrect;
      if (status === 'wrong') return !a.wasCorrect;
      return true;
    }).length;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// INTEGRAÇÃO: FilterManager → Quiz Generator
// ════════════════════════════════════════════════════════════════════════════

class QuizIntegration {
  constructor(filterManager, studentHistory) {
    this.filterManager = filterManager;
    this.history = studentHistory;
    this.currentQuestions = [];
    this.setupListeners();
  }

  setupListeners() {
    // Quando filtros são aplicados, gerar questões
    window.addEventListener('filters-applied', (event) => {
      this.generateQuestions(event.detail);
    });
  }

  /**
   * Gera questões com base nos filtros aplicados
   */
  async generateQuestions(filters) {
    try {
      // Mostrar loader
      this.showLoadingState(true);

      // Aplicar filtros de histórico do lado do cliente (simulado)
      const enrichedFilters = this.enrichFiltersWithHistory(filters);

      // Chamar API
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enrichedFilters)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      this.currentQuestions = data.questions || [];

      // Renderizar questões
      this.renderQuestions(this.currentQuestions);

      // Notificar sucesso
      this.showNotification('success', `${this.currentQuestions.length} questões geradas com sucesso!`);

    } catch (error) {
      console.error('Erro ao gerar questões:', error);
      this.showNotification('error', 'Erro ao gerar questões. Tente novamente.');
    } finally {
      this.showLoadingState(false);
    }
  }

  /**
   * Enriquece filtros com informações de histórico do aluno
   * (Aplicar filtros de histórico no payload)
   */
  enrichFiltersWithHistory(filters) {
    const enriched = JSON.parse(JSON.stringify(filters));

    // Se filtro de histórico é "only_wrong", modificar o payload
    if (filters.history.statusFilter === 'wrong') {
      enriched._historyFilter = {
        type: 'wrong',
        questionIds: this.getWrongQuestionIds()
      };
    } else if (filters.history.statusFilter === 'correct') {
      enriched._historyFilter = {
        type: 'correct',
        questionIds: this.getCorrectQuestionIds()
      };
    }

    return enriched;
  }

  getWrongQuestionIds() {
    return this.history.attempts
      .filter(a => !a.wasCorrect)
      .map(a => a.questionId);
  }

  getCorrectQuestionIds() {
    return this.history.attempts
      .filter(a => a.wasCorrect)
      .map(a => a.questionId);
  }

  /**
   * Renderiza questões na página
   */
  renderQuestions(questions) {
    const container = document.getElementById('questionsContainer');
    if (!container) return;

    if (questions.length === 0) {
      container.innerHTML = '<p class="empty-state">Nenhuma questão encontrada com os filtros selecionados.</p>';
      return;
    }

    const html = questions.map((q, idx) => `
      <div class="question-card" data-question-id="${q.id}">
        <div class="question-header">
          <h3 class="question-number">Questão ${idx + 1}</h3>
          <span class="question-source">${q.fonte || 'Fonte não informada'}</span>
        </div>
        
        <div class="question-body">
          <p class="question-statement">${q.statement}</p>
          
          <fieldset class="question-options">
            <legend class="sr-only">Alternativas</legend>
            ${q.options.map((opt, optIdx) => `
              <label class="option-label">
                <input 
                  type="radio" 
                  name="question-${q.id}" 
                  value="${opt.key}"
                  class="option-input"
                  aria-label="Alternativa ${opt.key}: ${opt.text}"
                />
                <span class="option-key">${opt.key}</span>
                <span class="option-text">${opt.text}</span>
              </label>
            `).join('')}
          </fieldset>
        </div>
        
        <div class="question-footer">
          <button class="btn btn-secondary" onclick="showExplanation('${q.id}')">
            Ver Gabarito
          </button>
          <button class="btn btn-secondary" onclick="confirmAnswer('${q.id}')">
            Responder
          </button>
        </div>
        
        <!-- Explicação (hidden por padrão) -->
        <div class="question-explanation" id="explanation-${q.id}" style="display: none;">
          <div class="explanation-header">
            <strong>Gabarito:</strong> ${q.correctAnswer}
          </div>
          <div class="explanation-body">
            ${q.explanation}
          </div>
        </div>
      </div>
    `).join('');

    container.innerHTML = html;
  }

  showLoadingState(show) {
    const container = document.getElementById('questionsContainer');
    if (!container) return;

    if (show) {
      container.innerHTML = `
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Gerando questões...</p>
        </div>
      `;
    }
  }

  showNotification(type, message) {
    // Implementar toast/snackbar notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// INICIALIZAÇÃO COMPLETA
// ════════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  // Instanciar componentes
  const history = new StudentHistory();
  const integration = new QuizIntegration(filterManager, history);

  // Inicializar UI de filtros
  const filterUI = new FilterUI('filterContainer', filterManager);

  // Log de inicialização (development)
  console.log('✓ StudyMaster Quiz Integration initialized');
  console.log('  - FilterManager:', filterManager);
  console.log('  - FilterUI:', filterUI);
  console.log('  - StudentHistory:', history);
});

// ════════════════════════════════════════════════════════════════════════════
// FUNÇÕES GLOBAIS (para event handlers inline)
// ════════════════════════════════════════════════════════════════════════════

window.showExplanation = function(questionId) {
  const explanationDiv = document.getElementById(`explanation-${questionId}`);
  if (explanationDiv) {
    const isHidden = explanationDiv.style.display === 'none';
    explanationDiv.style.display = isHidden ? 'block' : 'none';
  }
};

window.confirmAnswer = function(questionId) {
  const radioButtons = document.querySelectorAll(`input[name="question-${questionId}"]:checked`);
  if (radioButtons.length === 0) {
    alert('Selecione uma alternativa');
    return;
  }

  const selectedValue = radioButtons[0].value;
  const card = document.querySelector(`[data-question-id="${questionId}"]`);
  
  // Aqui você validaria a resposta contra correctAnswer
  // e registraria no histórico
  
  console.log(`Resposta para questão ${questionId}: ${selectedValue}`);
};
