/**
 * PREVISÃO DE ESQUECIMENTO - AIVOS Coaching 360
 * 
 * Responsabilidades:
 * - Calcular automaticamente queda de retenção
 * - Calcular próxima revisão necessária usando Spaced Repetition (SM-2)
 * - Agenda: D+1, D+3, D+7, D+15, D+30, D+60, D+90
 * - Ajustar dificuldade baseado em performance
 * 
 * Algoritmo SM-2 (SuperMemo 2):
 * - Baseado em facilidade (0-5), intervalo anterior e performance
 * - Qualidade: 0-5 (5=perfeito, 0=esquecimento total)
 * - Ajusta facilidade dinamicamente
 */

// ════════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO E CONSTANTES
// ════════════════════════════════════════════════════════════════════════════

const DEFAULT_EASINESS = 2.5;
const MIN_EASINESS = 1.3;
const REVIEW_SCHEDULE = [1, 3, 7, 15, 30, 60, 90]; // dias

// ════════════════════════════════════════════════════════════════════════════
// CLASSE FORGETTING PREDICTOR
// ════════════════════════════════════════════════════════════════════════════

class ForgettingPredictor {
  constructor(digitalTwin) {
    this.digitalTwin = digitalTwin;
    this.topicStates = {}; // Estado SM-2 por tópico
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ALGORITMO SM-2 (SUPERMEMO 2)
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Calcula próximo intervalo de revisão usando SM-2
   * @param {number} easiness - Facilidade atual (1.3-5.0)
   * @param {number} interval - Intervalo anterior em dias
   * @param {number} quality - Qualidade da resposta (0-5)
   * @returns {Object} { interval, easiness }
   */
  calculateNextReview(easiness, interval, quality) {
    // Se qualidade >= 3, aumenta intervalo
    if (quality >= 3) {
      if (interval === 0) {
        interval = 1;
      } else if (interval === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easiness);
      }
    } else {
      // Se esqueceu, resetar intervalo
      interval = 1;
    }

    // Ajustar facilidade
    easiness = easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    easiness = Math.max(MIN_EASINESS, easiness);

    return { interval, easiness };
  }

  /**
   * Calcula qualidade da resposta baseado em performance
   * @param {boolean} isCorrect - Se a resposta estava correta
   * @param {number} timeToAnswer - Tempo para responder em ms
   * @param {number} difficulty - Dificuldade da questão
   * @returns {number} Qualidade (0-5)
   */
  calculateQuality(isCorrect, timeToAnswer, difficulty) {
    if (!isCorrect) {
      // Resposta incorreta = qualidade baixa
      return 0;
    }

    // Resposta correta: qualidade baseada em tempo e dificuldade
    let quality = 5; // Base: perfeito

    // Penalizar resposta muito rápida (possível chute)
    if (timeToAnswer < 3000) {
      quality -= 1;
    }

    // Penalizar resposta muito lenta (hesitação)
    if (timeToAnswer > 30000) {
      quality -= 1;
    }

    // Bônus para questões difíceis respondidas corretamente
    if (difficulty === 'hard' || difficulty === 'extreme') {
      quality = Math.min(5, quality + 1);
    }

    return Math.max(0, Math.min(5, quality));
  }

  // ════════════════════════════════════════════════════════════════════════════
  // GERENCIAMENTO DE ESTADO POR TÓPICO
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Obtém ou cria estado SM-2 para um tópico
   * @param {string} topic - Nome do tópico
   * @returns {Object} Estado SM-2
   */
  getTopicState(topic) {
    if (!this.topicStates[topic]) {
      this.topicStates[topic] = {
        easiness: DEFAULT_EASINESS,
        interval: 0,
        repetitions: 0,
        nextReview: null,
        lastReview: null
      };
    }
    return this.topicStates[topic];
  }

  /**
   * Atualiza estado SM-2 após uma resposta
   * @param {string} topic - Nome do tópico
   * @param {boolean} isCorrect - Se a resposta estava correta
   * @param {number} timeToAnswer - Tempo para responder em ms
   * @param {string} difficulty - Dificuldade da questão
   */
  updateTopicState(topic, isCorrect, timeToAnswer, difficulty) {
    const state = this.getTopicState(topic);
    const quality = this.calculateQuality(isCorrect, timeToAnswer, difficulty);

    // Calcular próximo intervalo
    const result = this.calculateNextReview(state.easiness, state.interval, quality);

    // Atualizar estado
    state.easiness = result.easiness;
    state.interval = result.interval;
    state.repetitions++;
    state.lastReview = Date.now();

    // Calcular próxima data de revisão
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + result.interval);
    state.nextReview = nextReviewDate.getTime();

    // Salvar no DigitalTwin
    if (this.digitalTwin) {
      this.digitalTwin.recordReview({
        topic,
        date: state.nextReview,
        status: 'pending'
      });
    }

    return state;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PREVISÃO DE RETENÇÃO
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Calcula retenção estimada para um tópico
   * @param {string} topic - Nome do tópico
   * @returns {number} Retenção estimada (0-100)
   */
  calculateRetention(topic) {
    const state = this.getTopicState(topic);
    
    if (!state.lastReview) {
      return 0; // Sem histórico
    }

    const daysSinceReview = (Date.now() - state.lastReview) / (1000 * 60 * 60 * 24);
    
    // Curva de esquecimento de Ebbinghaus (simplificada)
    // R(t) = e^(-t/S) onde S é o intervalo de estabilidade
    const stability = state.interval || 1;
    const retention = Math.exp(-daysSinceReview / stability) * 100;

    return Math.max(0, Math.min(100, retention));
  }

  /**
   * Calcula retenção geral (média de todos os tópicos)
   * @returns {number} Retenção geral (0-100)
   */
  calculateOverallRetention() {
    const topics = Object.keys(this.topicStates);
    
    if (topics.length === 0) {
      return 0;
    }

    const retentions = topics.map(topic => this.calculateRetention(topic));
    const average = retentions.reduce((a, b) => a + b, 0) / retentions.length;

    return Math.round(average);
  }

  /**
   * Calcula queda de retenção desde a última revisão
   * @param {string} topic - Nome do tópico
   * @returns {number} Queda de retenção em porcentagem
   */
  calculateRetentionDrop(topic) {
    const state = this.getTopicState(topic);
    
    if (!state.lastReview) {
      return 0;
    }

    // Retenção imediatamente após revisão = 100%
    const currentRetention = this.calculateRetention(topic);
    const drop = 100 - currentRetention;

    return Math.round(drop);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // AGENDA DE REVISÕES
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Obtém agenda de revisões para os próximos 90 dias
   * @returns {Array} Lista de revisões agendadas
   */
  getReviewSchedule() {
    const schedule = [];
    const now = Date.now();
    const ninetyDays = 90 * 24 * 60 * 60 * 1000;

    for (const [topic, state] of Object.entries(this.topicStates)) {
      if (state.nextReview && state.nextReview > now && state.nextReview < now + ninetyDays) {
        const daysUntilReview = Math.round((state.nextReview - now) / (1000 * 60 * 60 * 24));
        const retention = this.calculateRetention(topic);

        schedule.push({
          topic,
          date: new Date(state.nextReview),
          daysUntilReview,
          retention: Math.round(retention),
          urgency: daysUntilReview <= 3 ? 'high' : daysUntilReview <= 7 ? 'medium' : 'low'
        });
      }
    }

    // Ordenar por data
    schedule.sort((a, b) => a.date - b.date);

    return schedule;
  }

  /**
   * Obtém revisões vencidas (deveriam ter sido feitas)
   * @returns {Array} Lista de revisões vencidas
   */
  getOverdueReviews() {
    const overdue = [];
    const now = Date.now();

    for (const [topic, state] of Object.entries(this.topicStates)) {
      if (state.nextReview && state.nextReview < now) {
        const daysOverdue = Math.round((now - state.nextReview) / (1000 * 60 * 60 * 24));
        const retention = this.calculateRetention(topic);

        overdue.push({
          topic,
          dueDate: new Date(state.nextReview),
          daysOverdue,
          retention: Math.round(retention),
          severity: daysOverdue > 14 ? 'critical' : daysOverdue > 7 ? 'high' : 'medium'
        });
      }
    }

    // Ordenar por dias vencidos (mais vencido primeiro)
    overdue.sort((a, b) => b.daysOverdue - a.daysOverdue);

    return overdue;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // INTEGRAÇÃO COM DIGITAL TWIN
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Processa uma resposta de questão e atualiza previsão
   * @param {Object} questionData - Dados da questão
   */
  processQuestionAnswer(questionData) {
    const { topic, isCorrect, timeToAnswer, difficulty } = questionData;

    if (!topic) {
      console.warn('[ForgettingPredictor] Tópico não fornecido');
      return;
    }

    // Atualizar estado do tópico
    const state = this.updateTopicState(topic, isCorrect, timeToAnswer, difficulty);

    // Atualizar retenção no DigitalTwin
    if (this.digitalTwin) {
      const retention = this.calculateRetention(topic);
      this.digitalTwin.updateRetention(topic, retention);
    }

    return state;
  }

  /**
   * Carrega estado do DigitalTwin
   */
  async loadFromDigitalTwin() {
    if (!this.digitalTwin) {
      console.warn('[ForgettingPredictor] DigitalTwin não inicializado');
      return;
    }

    const profile = this.digitalTwin.getProfile();
    if (!profile) {
      console.warn('[ForgettingPredictor] Perfil não encontrado');
      return;
    }

    // Carregar agenda de revisões
    const reviewSchedule = profile.performance.reviews.schedule || [];
    
    // Reconstruir estados dos tópicos
    reviewSchedule.forEach(review => {
      if (review.status === 'pending') {
        const state = this.getTopicState(review.topic);
        state.nextReview = review.date;
      }
    });

    console.log('[ForgettingPredictor] Estados carregados do DigitalTwin');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // GETTERS
  // ════════════════════════════════════════════════════════════════════════════

  getTopicStates() {
    return this.topicStates;
  }

  getTopicStateInfo(topic) {
    const state = this.getTopicState(topic);
    const retention = this.calculateRetention(topic);
    const drop = this.calculateRetentionDrop(topic);

    return {
      ...state,
      retention: Math.round(retention),
      retentionDrop: drop,
      daysUntilReview: state.nextReview 
        ? Math.round((state.nextReview - Date.now()) / (1000 * 60 * 60 * 24))
        : null
    };
  }

  getAllTopicsInfo() {
    const topics = Object.keys(this.topicStates);
    return topics.map(topic => this.getTopicStateInfo(topic));
  }
}

// ════════════════════════════════════════════════════════════════════════════
// INSTÂNCIA GLOBAL
// ════════════════════════════════════════════════════════════════════════════

let forgettingPredictor = null;

function initForgettingPredictor(digitalTwin) {
  if (!digitalTwin) {
    console.error('[ForgettingPredictor] DigitalTwin é obrigatório');
    return null;
  }
  forgettingPredictor = new ForgettingPredictor(digitalTwin);
  forgettingPredictor.loadFromDigitalTwin();
  return forgettingPredictor;
}

function getForgettingPredictor() {
  return forgettingPredictor;
}

// Exportar para uso no browser
if (typeof window !== 'undefined') {
  window.ForgettingPredictor = ForgettingPredictor;
  window.initForgettingPredictor = initForgettingPredictor;
  window.getForgettingPredictor = getForgettingPredictor;
}

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ForgettingPredictor, initForgettingPredictor, getForgettingPredictor };
}
