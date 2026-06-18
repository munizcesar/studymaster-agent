/**
 * DETECTOR DE RISCO - AIVOS Coaching 360
 * 
 * Responsabilidades:
 * - Identificar disciplinas abandonadas (sem estudo >7 dias)
 * - Identificar baixa retenção (<50%)
 * - Identificar queda de desempenho (>20%)
 * - Calcular score de risco por disciplina (0-100)
 * - Gerar alertas proativos
 * 
 * Algoritmos:
 * - Monitorar atividade por disciplina
 * - Calcular score de risco baseado em múltiplos fatores
 * - Priorizar disciplinas de alto risco
 */

// ════════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO E CONSTANTES
// ════════════════════════════════════════════════════════════════════════════

const ABANDONED_THRESHOLD_DAYS = 7;
const LOW_RETENTION_THRESHOLD = 50;
const PERFORMANCE_DROP_THRESHOLD = 20;

const RISK_LEVELS = {
  LOW: { min: 0, max: 33, label: 'Baixo', color: 'green' },
  MEDIUM: { min: 34, max: 66, label: 'Médio', color: 'yellow' },
  HIGH: { min: 67, max: 100, label: 'Alto', color: 'red' }
};

// ════════════════════════════════════════════════════════════════════════════
// CLASSE RISK DETECTOR
// ════════════════════════════════════════════════════════════════════════════

class RiskDetector {
  constructor(digitalTwin, forgettingPredictor) {
    this.digitalTwin = digitalTwin;
    this.forgettingPredictor = forgettingPredictor;
    this.riskScores = {};
    this.alerts = [];
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ANÁLISE PRINCIPAL
  // ════════════════════════════════════════════════════════════════════════════

  async analyze() {
    if (!this.digitalTwin || !this.digitalTwin.getProfile()) {
      console.warn('[RiskDetector] DigitalTwin não inicializado');
      return [];
    }

    const profile = this.digitalTwin.getProfile();
    const questionStats = profile.performance.questions;
    const retention = profile.retention;

    this.riskScores = {};
    this.alerts = [];

    // Analisar cada disciplina
    for (const [discipline, stats] of Object.entries(questionStats.byDiscipline)) {
      const riskScore = this.calculateRisk(discipline, stats, retention.byDiscipline[discipline]);
      this.riskScores[discipline] = riskScore;

      // Gerar alertas baseados no risco
      this.generateAlerts(discipline, riskScore, stats, retention.byDiscipline[discipline]);
    }

    return this.riskScores;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // CÁLCULO DE RISCO
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Calcula score de risco para uma disciplina (0-100)
   * @param {string} discipline - Nome da disciplina
   * @param {Object} stats - Estatísticas da disciplina
   * @param {number} retentionScore - Score de retenção
   * @returns {Object} Score de risco detalhado
   */
  calculateRisk(discipline, stats, retentionScore) {
    let risk = 0;
    const factors = [];

    // Fator 1: Dias desde último estudo
    const daysSinceLastStudy = this.getDaysSinceLastStudy(discipline);
    if (daysSinceLastStudy > ABANDONED_THRESHOLD_DAYS) {
      const abandonedRisk = Math.min(40, (daysSinceLastStudy - ABANDONED_THRESHOLD_DAYS) * 2);
      risk += abandonedRisk;
      factors.push({
        type: 'abandoned',
        value: daysSinceLastStudy,
        impact: abandonedRisk,
        message: `Sem estudo há ${daysSinceLastStudy} dias`
      });
    }

    // Fator 2: Retenção baixa
    if (retentionScore && retentionScore < LOW_RETENTION_THRESHOLD) {
      const retentionRisk = (LOW_RETENTION_THRESHOLD - retentionScore) * 0.5;
      risk += retentionRisk;
      factors.push({
        type: 'low_retention',
        value: retentionScore,
        impact: retentionRisk,
        message: `Retenção baixa: ${Math.round(retentionScore)}%`
      });
    }

    // Fator 3: Queda de desempenho
    const performanceTrend = this.getPerformanceTrend(discipline);
    if (performanceTrend < -PERFORMANCE_DROP_THRESHOLD) {
      const performanceRisk = Math.abs(performanceTrend) * 0.8;
      risk += performanceRisk;
      factors.push({
        type: 'performance_drop',
        value: performanceTrend,
        impact: performanceRisk,
        message: `Queda de desempenho: ${Math.round(performanceTrend)}%`
      });
    }

    // Fator 4: Baixa taxa de acertos
    const accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
    if (accuracy < 50 && stats.total >= 10) {
      const accuracyRisk = (50 - accuracy) * 0.4;
      risk += accuracyRisk;
      factors.push({
        type: 'low_accuracy',
        value: accuracy,
        impact: accuracyRisk,
        message: `Taxa de acertos baixa: ${Math.round(accuracy)}%`
      });
    }

    // Limitar a 100
    risk = Math.min(100, Math.round(risk));

    // Determinar nível de risco
    const riskLevel = this.getRiskLevel(risk);

    return {
      score: risk,
      level: riskLevel,
      factors,
      accuracy: Math.round(accuracy),
      retention: retentionScore ? Math.round(retentionScore) : null,
      daysSinceLastStudy,
      performanceTrend
    };
  }

  /**
   * Obtém dias desde o último estudo de uma disciplina
   * @param {string} discipline - Nome da disciplina
   * @returns {number} Dias desde o último estudo
   */
  getDaysSinceLastStudy(discipline) {
    if (!this.digitalTwin) return 999;

    const profile = this.digitalTwin.getProfile();
    const history = profile.performance.questions.history;

    // Filtrar questões da disciplina
    const disciplineQuestions = history.filter(q => q.discipline === discipline);

    if (disciplineQuestions.length === 0) {
      return 999; // Nunca estudou
    }

    // Encontrar a mais recente
    const lastQuestion = disciplineQuestions[disciplineQuestions.length - 1];
    const daysSince = (Date.now() - lastQuestion.timestamp) / (1000 * 60 * 60 * 24);

    return Math.round(daysSince);
  }

  /**
   * Calcula tendência de desempenho (últimas 10 vs anteriores)
   * @param {string} discipline - Nome da disciplina
   * @returns {number} Tendência em porcentagem (positivo = melhorando)
   */
  getPerformanceTrend(discipline) {
    if (!this.digitalTwin) return 0;

    const profile = this.digitalTwin.getProfile();
    const history = profile.performance.questions.history;

    // Filtrar questões da disciplina
    const disciplineQuestions = history.filter(q => q.discipline === discipline);

    if (disciplineQuestions.length < 20) {
      return 0; // Dados insuficientes
    }

    // Dividir em duas metades
    const midPoint = Math.floor(disciplineQuestions.length / 2);
    const firstHalf = disciplineQuestions.slice(0, midPoint);
    const secondHalf = disciplineQuestions.slice(midPoint);

    // Calcular acertos em cada metade
    const firstHalfAccuracy = firstHalf.filter(q => q.isCorrect).length / firstHalf.length * 100;
    const secondHalfAccuracy = secondHalf.filter(q => q.isCorrect).length / secondHalf.length * 100;

    // Tendência
    return secondHalfAccuracy - firstHalfAccuracy;
  }

  /**
   * Determina nível de risco baseado no score
   * @param {number} score - Score de risco (0-100)
   * @returns {Object} Nível de risco
   */
  getRiskLevel(score) {
    if (score <= RISK_LEVELS.LOW.max) {
      return RISK_LEVELS.LOW;
    } else if (score <= RISK_LEVELS.MEDIUM.max) {
      return RISK_LEVELS.MEDIUM;
    } else {
      return RISK_LEVELS.HIGH;
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // GERAÇÃO DE ALERTAS
  // ════════════════════════════════════════════════════════════════════════════

  generateAlerts(discipline, riskScore, stats, retentionScore) {
    // Alerta de disciplina abandonada
    if (riskScore.daysSinceLastStudy > ABANDONED_THRESHOLD_DAYS) {
      this.alerts.push({
        type: 'abandoned',
        severity: riskScore.daysSinceLastStudy > 14 ? 'critical' : 'high',
        discipline,
        message: `Você está evitando ${discipline} há ${riskScore.daysSinceLastStudy} dias`,
        recommendation: `Pratique algumas questões de ${discipline} hoje mesmo`,
        daysSinceLastStudy: riskScore.daysSinceLastStudy
      });
    }

    // Alerta de retenção baixa
    if (retentionScore && retentionScore < LOW_RETENTION_THRESHOLD) {
      this.alerts.push({
        type: 'low_retention',
        severity: retentionScore < 30 ? 'critical' : 'high',
        discipline,
        message: `Sua retenção em ${discipline} caiu para ${Math.round(retentionScore)}%`,
        recommendation: `Hora de revisar ${discipline} para recuperar o conhecimento`,
        retention: Math.round(retentionScore)
      });
    }

    // Alerta de queda de desempenho
    if (riskScore.performanceTrend < -PERFORMANCE_DROP_THRESHOLD) {
      this.alerts.push({
        type: 'performance_drop',
        severity: riskScore.performanceTrend < -40 ? 'critical' : 'high',
        discipline,
        message: `Seu desempenho em ${discipline} caiu ${Math.round(Math.abs(riskScore.performanceTrend))}%`,
        recommendation: `Revise os fundamentos de ${discipline} e pratique mais`,
        drop: Math.round(Math.abs(riskScore.performanceTrend))
      });
    }

    // Alerta de risco alto geral
    if (riskScore.score >= 67) {
      this.alerts.push({
        type: 'high_risk',
        severity: 'high',
        discipline,
        message: `${discipline} está em risco alto (${riskScore.score}/100)`,
        recommendation: `Priorize ${discipline} nos próximos dias`,
        score: riskScore.score
      });
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // GETTERS
  // ════════════════════════════════════════════════════════════════════════════

  getRiskScores() {
    return this.riskScores;
  }

  getAlerts() {
    return this.alerts;
  }

  getCriticalAlerts() {
    return this.alerts.filter(alert => alert.severity === 'critical');
  }

  getHighSeverityAlerts() {
    return this.alerts.filter(alert => alert.severity === 'high');
  }

  getDisciplineRisk(discipline) {
    return this.riskScores[discipline] || null;
  }

  getHighestRiskDiscipline() {
    let highest = null;
    let highestScore = -1;

    for (const [discipline, risk] of Object.entries(this.riskScores)) {
      if (risk.score > highestScore) {
        highestScore = risk.score;
        highest = discipline;
      }
    }

    return highest;
  }

  getRiskSummary() {
    const disciplines = Object.keys(this.riskScores);
    const highRisk = disciplines.filter(d => this.riskScores[d].level.label === 'Alto').length;
    const mediumRisk = disciplines.filter(d => this.riskScores[d].level.label === 'Médio').length;
    const lowRisk = disciplines.filter(d => this.riskScores[d].level.label === 'Baixo').length;

    return {
      total: disciplines.length,
      high: highRisk,
      medium: mediumRisk,
      low: lowRisk,
      criticalAlerts: this.getCriticalAlerts().length,
      highAlerts: this.getHighSeverityAlerts().length
    };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RELATÓRIO
  // ════════════════════════════════════════════════════════════════════════════

  generateReport() {
    const summary = this.getRiskSummary();
    const highestRisk = this.getHighestRiskDiscipline();

    let report = '=== RELATÓRIO DE RISCO ===\n\n';
    report += `Total de disciplinas analisadas: ${summary.total}\n`;
    report += `Risco alto: ${summary.high}\n`;
    report += `Risco médio: ${summary.medium}\n`;
    report += `Risco baixo: ${summary.low}\n`;
    report += `Alertas críticos: ${summary.criticalAlerts}\n`;
    report += `Alertas altos: ${summary.highAlerts}\n\n`;

    if (highestRisk) {
      report += `Disciplina de maior risco: ${highestRisk} (${this.riskScores[highestRisk].score}/100)\n\n`;
    }

    report += '=== POR DISCIPLINA ===\n';
    for (const [discipline, risk] of Object.entries(this.riskScores)) {
      report += `\n${discipline}: ${risk.score}/100 (${risk.level.label})\n`;
      report += `  Acertos: ${risk.accuracy}%\n`;
      if (risk.retention) {
        report += `  Retenção: ${risk.retention}%\n`;
      }
      report += `  Dias sem estudo: ${risk.daysSinceLastStudy}\n`;
      if (risk.performanceTrend !== 0) {
        report += `  Tendência: ${risk.performanceTrend > 0 ? '+' : ''}${Math.round(risk.performanceTrend)}%\n`;
      }
    }

    report += '\n=== ALERTAS ===\n';
    this.alerts.forEach((alert, index) => {
      report += `\n[${index + 1}] ${alert.type} (${alert.severity})\n`;
      report += `  ${alert.message}\n`;
      report += `  Recomendação: ${alert.recommendation}\n`;
    });

    return report;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// INSTÂNCIA GLOBAL
// ════════════════════════════════════════════════════════════════════════════

let riskDetector = null;

function initRiskDetector(digitalTwin, forgettingPredictor) {
  if (!digitalTwin) {
    console.error('[RiskDetector] DigitalTwin é obrigatório');
    return null;
  }
  riskDetector = new RiskDetector(digitalTwin, forgettingPredictor);
  return riskDetector;
}

function getRiskDetector() {
  return riskDetector;
}

// Exportar para uso no browser
if (typeof window !== 'undefined') {
  window.RiskDetector = RiskDetector;
  window.initRiskDetector = initRiskDetector;
  window.getRiskDetector = getRiskDetector;
}

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RiskDetector, initRiskDetector, getRiskDetector };
}
