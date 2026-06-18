/**
 * PREVISÃO DE APROVAÇÃO - AIVOS Coaching 360
 * 
 * Responsabilidades:
 * - Calcular probabilidade estimada de aprovação baseada em dados
 * - Modelo de predição baseado em:
 *   - Retenção geral
 *   - Performance por disciplina
 *   - Consistência de estudo
 *   - Níveis de domínio
 *   - Tempo até prova
 *   - Histórico de simulados
 * - Mostrar fatores contribuintes
 * - Fornecer recomendações
 */

// ════════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO E CONSTANTES
// ════════════════════════════════════════════════════════════════════════════

const FACTOR_WEIGHTS = {
  retention: 0.30,
  consistency: 0.20,
  mastery: 0.25,
  simulation: 0.15,
  timeToExam: 0.10
};

const PROBABILITY_THRESHOLDS = {
  veryLow: 30,
  low: 50,
  medium: 70,
  high: 85
};

// ════════════════════════════════════════════════════════════════════════════
// CLASSE APPROVAL PREDICTOR
// ════════════════════════════════════════════════════════════════════════════

class ApprovalPredictor {
  constructor(digitalTwin, forgettingPredictor, masteryCertifier) {
    this.digitalTwin = digitalTwin;
    this.forgettingPredictor = forgettingPredictor;
    this.masteryCertifier = masteryCertifier;
    this.predictions = [];
  }

  // ════════════════════════════════════════════════════════════════════════════
  // CÁLCULO DE PROBABILIDADE
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Calcula probabilidade de aprovação
   * @param {Object} profile - Perfil do aluno
   * @returns {Object} Predição detalhada
   */
  calculateApprovalProbability(profile) {
    if (!profile) {
      return this.getEmptyPrediction();
    }

    const factors = this.calculateFactors(profile);
    const probability = this.calculateOverallProbability(factors);
    const recommendation = this.getRecommendation(probability, factors);

    const prediction = {
      probability: Math.round(probability),
      factors,
      recommendation,
      trend: this.calculateTrend(),
      timestamp: Date.now()
    };

    // Salvar no histórico
    this.predictions.push(prediction);

    return prediction;
  }

  /**
   * Predição vazia quando não há dados
   */
  getEmptyPrediction() {
    return {
      probability: 0,
      factors: {
        retention: { value: 0, weight: FACTOR_WEIGHTS.retention, contribution: 0 },
        consistency: { value: 0, weight: FACTOR_WEIGHTS.consistency, contribution: 0 },
        mastery: { value: 0, weight: FACTOR_WEIGHTS.mastery, contribution: 0 },
        simulation: { value: 0, weight: FACTOR_WEIGHTS.simulation, contribution: 0 },
        timeToExam: { value: 0, weight: FACTOR_WEIGHTS.timeToExam, contribution: 0 }
      },
      recommendation: 'Comece a estudar para ver sua previsão',
      trend: 'stable',
      timestamp: Date.now()
    };
  }

  /**
   * Calcula todos os fatores
   */
  calculateFactors(profile) {
    return {
      retention: this.calculateRetentionFactor(profile),
      consistency: this.calculateConsistencyFactor(profile),
      mastery: this.calculateMasteryFactor(profile),
      simulation: this.calculateSimulationFactor(profile),
      timeToExam: this.calculateTimeFactor(profile)
    };
  }

  /**
   * Fator de retenção
   */
  calculateRetentionFactor(profile) {
    const retention = profile.retention.overall || 0;
    const value = Math.min(100, retention);
    const contribution = value * FACTOR_WEIGHTS.retention;

    return {
      value: Math.round(value),
      weight: FACTOR_WEIGHTS.retention,
      contribution: Math.round(contribution),
      label: 'Retenção Geral',
      description: `${Math.round(value)}% de retenção do conhecimento`
    };
  }

  /**
   * Fator de consistência de estudo
   */
  calculateConsistencyFactor(profile) {
    const history = profile.performance.questions.history;
    
    if (history.length < 7) {
      return {
        value: 0,
        weight: FACTOR_WEIGHTS.consistency,
        contribution: 0,
        label: 'Consistência',
        description: 'Dados insuficientes (mínimo 7 dias)'
      };
    }

    // Calcular consistência dos últimos 30 dias
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentHistory = history.filter(q => q.timestamp > thirtyDaysAgo);

    // Agrupar por dia
    const dailyActivity = {};
    recentHistory.forEach(q => {
      const date = new Date(q.timestamp).toDateString();
      dailyActivity[date] = (dailyActivity[date] || 0) + 1;
    });

    const daysWithActivity = Object.keys(dailyActivity).length;
    const targetDays = 20; // Meta: estudar 20 dias no mês
    const consistency = (daysWithActivity / targetDays) * 100;
    const value = Math.min(100, consistency);
    const contribution = value * FACTOR_WEIGHTS.consistency;

    return {
      value: Math.round(value),
      weight: FACTOR_WEIGHTS.consistency,
      contribution: Math.round(contribution),
      label: 'Consistência',
      description: `Estudou ${daysWithActivity} dias nos últimos 30`
    };
  }

  /**
   * Fator de domínio
   */
  calculateMasteryFactor(profile) {
    if (!this.masteryCertifier) {
      return {
        value: 0,
        weight: FACTOR_WEIGHTS.mastery,
        contribution: 0,
        label: 'Domínio',
        description: 'Módulo não disponível'
      };
    }

    const summary = this.masteryCertifier.getMasterySummary();
    const value = summary.masteryPercentage;
    const contribution = value * FACTOR_WEIGHTS.mastery;

    return {
      value: Math.round(value),
      weight: FACTOR_WEIGHTS.mastery,
      contribution: Math.round(contribution),
      label: 'Domínio',
      description: `${summary.mastered} de ${summary.total} tópicos dominados`
    };
  }

  /**
   * Fator de simulado
   */
  calculateSimulationFactor(profile) {
    // Simplificado: baseado em acertos gerais
    const questions = profile.performance.questions;
    const total = questions.total;
    const correct = questions.correct;
    const accuracy = total > 0 ? (correct / total) * 100 : 0;

    // Bônus se tem muitas questões
    const volumeBonus = Math.min(20, total / 10);

    const value = Math.min(100, accuracy + volumeBonus);
    const contribution = value * FACTOR_WEIGHTS.simulation;

    return {
      value: Math.round(value),
      weight: FACTOR_WEIGHTS.simulation,
      contribution: Math.round(contribution),
      label: 'Performance',
      description: `${Math.round(accuracy)}% de acertos em ${total} questões`
    };
  }

  /**
   * Fator de tempo até prova
   */
  calculateTimeFactor(profile) {
    // Simplificado: assume 180 dias até prova (pode ser configurável)
    const daysToExam = 180; // Padrão: 6 meses
    const idealDays = 180;
    
    // Se tiver mais tempo, melhor
    const timeRatio = Math.min(1, daysToExam / idealDays);
    const value = timeRatio * 100;
    const contribution = value * FACTOR_WEIGHTS.timeToExam;

    return {
      value: Math.round(value),
      weight: FACTOR_WEIGHTS.timeToExam,
      contribution: Math.round(contribution),
      label: 'Tempo',
      description: `${daysToExam} dias até a prova`
    };
  }

  /**
   * Calcula probabilidade geral
   */
  calculateOverallProbability(factors) {
    let probability = 0;

    for (const factor of Object.values(factors)) {
      probability += factor.contribution;
    }

    return Math.min(100, Math.max(0, probability));
  }

  /**
   * Calcula tendência da probabilidade
   */
  calculateTrend() {
    if (this.predictions.length < 2) {
      return 'stable';
    }

    const recent = this.predictions.slice(-5);
    const first = recent[0].probability;
    const last = recent[recent.length - 1].probability;
    const difference = last - first;

    if (difference > 5) return 'up';
    if (difference < -5) return 'down';
    return 'stable';
  }

  /**
   * Gera recomendação baseada na probabilidade
   */
  getRecommendation(probability, factors) {
    if (probability >= PROBABILITY_THRESHOLDS.high) {
      return 'Excelente! Você está no caminho certo para aprovação.';
    } else if (probability >= PROBABILITY_THRESHOLDS.medium) {
      return 'Bom progresso! Continue estudando para aumentar suas chances.';
    } else if (probability >= PROBABILITY_THRESHOLDS.low) {
      return 'Precisa melhorar. Foque nas áreas com menor pontuação.';
    } else {
      return 'Atenção necessária. Intensifique os estudos e revise os fundamentos.';
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // GETTERS
  // ════════════════════════════════════════════════════════════════════════════

  getPredictions() {
    return this.predictions;
  }

  getLatestPrediction() {
    return this.predictions[this.predictions.length - 1] || null;
  }

  getPredictionTrend() {
    if (this.predictions.length < 2) return 'stable';

    const recent = this.predictions.slice(-10);
    const first = recent[0].probability;
    const last = recent[recent.length - 1].probability;

    if (last > first + 10) return 'strong_up';
    if (last > first + 5) return 'up';
    if (last < first - 10) return 'strong_down';
    if (last < first - 5) return 'down';
    return 'stable';
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RELATÓRIO
  // ════════════════════════════════════════════════════════════════════════════

  generateReport() {
    const latest = this.getLatestPrediction();
    
    if (!latest) {
      return '=== RELATÓRIO DE PREVISÃO DE APROVAÇÃO ===\n\nNenhum dado disponível.';
    }

    let report = '=== RELATÓRIO DE PREVISÃO DE APROVAÇÃO ===\n\n';
    report += `Probabilidade atual: ${latest.probability}%\n`;
    report += `Tendência: ${this.getTrendLabel(latest.trend)}\n`;
    report += `Recomendação: ${latest.recommendation}\n\n`;

    report += '=== FATORES CONTRIBUINTES ===\n';
    for (const [name, factor] of Object.entries(latest.factors)) {
      report += `\n${factor.label}: ${factor.value}%\n`;
      report += `  Peso: ${(factor.weight * 100).toFixed(0)}%\n`;
      report += `  Contribuição: ${factor.contribution}%\n`;
      report += `  ${factor.description}\n`;
    }

    report += '\n=== HISTÓRICO ===\n';
    this.predictions.slice(-10).forEach((p, index) => {
      report += `${new Date(p.timestamp).toLocaleString()}: ${p.probability}%\n`;
    });

    return report;
  }

  getTrendLabel(trend) {
    const labels = {
      strong_up: '📈 Forte subida',
      up: '📈 Subindo',
      stable: '➡️ Estável',
      down: '📉 Descendo',
      strong_down: '📉 Forte queda'
    };
    return labels[trend] || labels.stable;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// INSTÂNCIA GLOBAL
// ════════════════════════════════════════════════════════════════════════════

let approvalPredictor = null;

function initApprovalPredictor(digitalTwin, forgettingPredictor, masteryCertifier) {
  if (!digitalTwin) {
    console.error('[ApprovalPredictor] DigitalTwin é obrigatório');
    return null;
  }
  approvalPredictor = new ApprovalPredictor(digitalTwin, forgettingPredictor, masteryCertifier);
  return approvalPredictor;
}

function getApprovalPredictor() {
  return approvalPredictor;
}

// Exportar para uso no browser
if (typeof window !== 'undefined') {
  window.ApprovalPredictor = ApprovalPredictor;
  window.initApprovalPredictor = initApprovalPredictor;
  window.getApprovalPredictor = getApprovalPredictor;
}

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ApprovalPredictor, initApprovalPredictor, getApprovalPredictor };
}
