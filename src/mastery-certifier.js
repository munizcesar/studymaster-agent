/**
 * CERTIFICAÇÃO DE DOMÍNIO - AIVOS Coaching 360
 * 
 * Responsabilidades:
 * - Implementar níveis de domínio (1-5) baseados em performance consistente
 * - Critérios por nível:
 *   - Nível 1 (Exposição): 1+ questões respondidas
 *   - Nível 2 (Compreensão): 10+ questões, >60% acertos
 *   - Nível 3 (Fixação): 25+ questões, >70% acertos, 2+ revisões
 *   - Nível 4 (Domínio): 50+ questões, >80% acertos, 4+ revisões, retenção >75%
 *   - Nível 5 (Blindagem): 100+ questões, >90% acertos, 6+ revisões, retenção >85%
 * - Apenas níveis 4 e 5 contam como dominados
 * - Mostrar progresso visual para próximo nível
 */

// ════════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO E CONSTANTES
// ════════════════════════════════════════════════════════════════════════════

const MASTERY_LEVELS = {
  0: {
    name: 'Não iniciado',
    description: 'Nenhuma questão respondida',
    color: 'gray',
    icon: '🔵'
  },
  1: {
    name: 'Exposição',
    description: 'Primeiro contato com o tópico',
    color: 'blue',
    icon: '📖',
    criteria: {
      minQuestions: 1,
      minAccuracy: 0,
      minReviews: 0,
      minRetention: 0
    }
  },
  2: {
    name: 'Compreensão',
    description: 'Entende os conceitos básicos',
    color: 'green',
    icon: '💡',
    criteria: {
      minQuestions: 10,
      minAccuracy: 60,
      minReviews: 0,
      minRetention: 0
    }
  },
  3: {
    name: 'Fixação',
    description: 'Conhecimento consolidado',
    color: 'yellow',
    icon: '🎯',
    criteria: {
      minQuestions: 25,
      minAccuracy: 70,
      minReviews: 2,
      minRetention: 0
    }
  },
  4: {
    name: 'Domínio',
    description: 'Conhecimento profundo',
    color: 'orange',
    icon: '🏆',
    criteria: {
      minQuestions: 50,
      minAccuracy: 80,
      minReviews: 4,
      minRetention: 75
    },
    isMastered: true
  },
  5: {
    name: 'Blindagem',
    description: 'Conhecimento blindado',
    color: 'red',
    icon: '👑',
    criteria: {
      minQuestions: 100,
      minAccuracy: 90,
      minReviews: 6,
      minRetention: 85
    },
    isMastered: true
  }
};

// ════════════════════════════════════════════════════════════════════════════
// CLASSE MASTERY CERTIFIER
// ════════════════════════════════════════════════════════════════════════════

class MasteryCertifier {
  constructor(digitalTwin, forgettingPredictor) {
    this.digitalTwin = digitalTwin;
    this.forgettingPredictor = forgettingPredictor;
    this.masteryLevels = {};
  }

  // ════════════════════════════════════════════════════════════════════════════
  // CÁLCULO DE NÍVEL DE DOMÍNIO
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Calcula nível de domínio para um tópico
   * @param {string} topic - Nome do tópico
   * @returns {Object} Nível de domínio detalhado
   */
  calculateMasteryLevel(topic) {
    if (!this.digitalTwin) {
      return { level: 0, ...MASTERY_LEVELS[0] };
    }

    const profile = this.digitalTwin.getProfile();
    const questionStats = profile.performance.questions;

    // Obter estatísticas do tópico
    const topicStats = this.getTopicStats(topic, questionStats);
    
    // Obter retenção do tópico
    let retention = 0;
    if (this.forgettingPredictor) {
      retention = this.forgettingPredictor.calculateRetention(topic);
    }

    // Calcular nível
    let level = 0;

    if (topicStats.total >= 1) {
      level = 1; // Exposição
    }

    if (topicStats.total >= 10 && topicStats.accuracy >= 60) {
      level = 2; // Compreensão
    }

    if (topicStats.total >= 25 && topicStats.accuracy >= 70 && topicStats.reviews >= 2) {
      level = 3; // Fixação
    }

    if (topicStats.total >= 50 && topicStats.accuracy >= 80 && topicStats.reviews >= 4 && retention >= 75) {
      level = 4; // Domínio
    }

    if (topicStats.total >= 100 && topicStats.accuracy >= 90 && topicStats.reviews >= 6 && retention >= 85) {
      level = 5; // Blindagem
    }

    const levelInfo = MASTERY_LEVELS[level];

    // Calcular progresso para o próximo nível
    const nextLevel = level < 5 ? level + 1 : level;
    const progress = this.calculateProgressToNextLevel(topic, topicStats, retention, nextLevel);

    // Salvar no DigitalTwin
    this.digitalTwin.updateMastery(topic, level);

    return {
      level,
      name: levelInfo.name,
      description: levelInfo.description,
      color: levelInfo.color,
      icon: levelInfo.icon,
      isMastered: levelInfo.isMastered || false,
      stats: topicStats,
      retention: Math.round(retention),
      progressToNext: progress,
      criteria: levelInfo.criteria
    };
  }

  /**
   * Obtém estatísticas de um tópico
   * @param {string} topic - Nome do tópico
   * @param {Object} questionStats - Estatísticas gerais de questões
   * @returns {Object} Estatísticas do tópico
   */
  getTopicStats(topic, questionStats) {
    // Filtrar questões do tópico
    const history = questionStats.history.filter(q => q.topic === topic);
    
    const total = history.length;
    const correct = history.filter(q => q.isCorrect).length;
    const accuracy = total > 0 ? (correct / total) * 100 : 0;

    // Contar revisões (usando o forgetting predictor se disponível)
    let reviews = 0;
    if (this.forgettingPredictor) {
      const topicState = this.forgettingPredictor.getTopicState(topic);
      reviews = topicState.repetitions || 0;
    }

    return {
      total,
      correct,
      wrong: total - correct,
      accuracy,
      reviews
    };
  }

  /**
   * Calcula progresso para o próximo nível (0-100)
   * @param {string} topic - Nome do tópico
   * @param {Object} stats - Estatísticas atuais
   * @param {number} retention - Retenção atual
   * @param {number} nextLevel - Próximo nível alvo
   * @returns {Object} Progresso detalhado
   */
  calculateProgressToNextLevel(topic, stats, retention, nextLevel) {
    if (nextLevel === 5) {
      return { percentage: 100, message: 'Nível máximo alcançado!' };
    }

    const criteria = MASTERY_LEVELS[nextLevel].criteria;
    const progressFactors = [];

    // Progresso em questões
    const questionProgress = Math.min(100, (stats.total / criteria.minQuestions) * 100);
    progressFactors.push({
      type: 'questions',
      current: stats.total,
      target: criteria.minQuestions,
      percentage: questionProgress
    });

    // Progresso em acertos
    if (criteria.minAccuracy > 0) {
      const accuracyProgress = Math.min(100, (stats.accuracy / criteria.minAccuracy) * 100);
      progressFactors.push({
        type: 'accuracy',
        current: Math.round(stats.accuracy),
        target: criteria.minAccuracy,
        percentage: accuracyProgress
      });
    }

    // Progresso em revisões
    if (criteria.minReviews > 0) {
      const reviewProgress = Math.min(100, (stats.reviews / criteria.minReviews) * 100);
      progressFactors.push({
        type: 'reviews',
        current: stats.reviews,
        target: criteria.minReviews,
        percentage: reviewProgress
      });
    }

    // Progresso em retenção
    if (criteria.minRetention > 0) {
      const retentionProgress = Math.min(100, (retention / criteria.minRetention) * 100);
      progressFactors.push({
        type: 'retention',
        current: Math.round(retention),
        target: criteria.minRetention,
        percentage: retentionProgress
      });
    }

    // Calcular progresso geral (média)
    const overallProgress = progressFactors.length > 0
      ? progressFactors.reduce((sum, factor) => sum + factor.percentage, 0) / progressFactors.length
      : 0;

    return {
      percentage: Math.round(overallProgress),
      factors: progressFactors,
      message: this.getProgressMessage(overallProgress)
    };
  }

  /**
   * Gera mensagem de progresso
   * @param {number} percentage - Porcentagem de progresso
   * @returns {string} Mensagem
   */
  getProgressMessage(percentage) {
    if (percentage >= 100) return 'Pronto para o próximo nível!';
    if (percentage >= 75) return 'Quase lá!';
    if (percentage >= 50) return 'Progresso bom';
    if (percentage >= 25) return 'Começando a progredir';
    return 'Iniciando';
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ANÁLISE DE TODOS OS TÓPICOS
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Calcula nível de domínio para todos os tópicos
   * @returns {Object} Níveis de domínio por tópico
   */
  calculateAllMasteryLevels() {
    if (!this.digitalTwin) {
      return {};
    }

    const profile = this.digitalTwin.getProfile();
    const questionStats = profile.performance.questions;

    // Obter todos os tópicos únicos
    const topics = new Set();
    questionStats.history.forEach(q => {
      if (q.topic) topics.add(q.topic);
    });

    // Calcular nível para cada tópico
    const levels = {};
    for (const topic of topics) {
      levels[topic] = this.calculateMasteryLevel(topic);
    }

    this.masteryLevels = levels;
    return levels;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // GETTERS
  // ════════════════════════════════════════════════════════════════════════════

  getMasteryLevels() {
    return this.masteryLevels;
  }

  getTopicMastery(topic) {
    return this.masteryLevels[topic] || null;
  }

  getMasteredTopics() {
    return Object.entries(this.masteryLevels)
      .filter(([topic, mastery]) => mastery.isMastered)
      .map(([topic, mastery]) => ({ topic, ...mastery }));
  }

  getNotMasteredTopics() {
    return Object.entries(this.masteryLevels)
      .filter(([topic, mastery]) => !mastery.isMastered && mastery.level > 0)
      .map(([topic, mastery]) => ({ topic, ...mastery }));
  }

  getMasterySummary() {
    const topics = Object.keys(this.masteryLevels);
    const mastered = this.getMasteredTopics().length;
    const notMastered = this.getNotMasteredTopics().length;
    const notStarted = topics.length - mastered - notMastered;

    const averageLevel = topics.length > 0
      ? Object.values(this.masteryLevels).reduce((sum, m) => sum + m.level, 0) / topics.length
      : 0;

    return {
      total: topics.length,
      mastered,
      notMastered,
      notStarted,
      averageLevel: Math.round(averageLevel * 10) / 10,
      masteryPercentage: topics.length > 0 ? Math.round((mastered / topics.length) * 100) : 0
    };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RELATÓRIO
  // ════════════════════════════════════════════════════════════════════════════

  generateReport() {
    const summary = this.getMasterySummary();
    const mastered = this.getMasteredTopics();
    const notMastered = this.getNotMasteredTopics();

    let report = '=== RELATÓRIO DE DOMÍNIO ===\n\n';
    report += `Total de tópicos: ${summary.total}\n`;
    report += `Dominados (níveis 4-5): ${summary.mastered}\n`;
    report += `Em progresso (níveis 1-3): ${summary.notMastered}\n`;
    report += `Não iniciados: ${summary.notStarted}\n`;
    report += `Nível médio: ${summary.averageLevel}\n`;
    report += `Porcentagem de domínio: ${summary.masteryPercentage}%\n\n`;

    if (mastered.length > 0) {
      report += '=== TÓPICOS DOMINADOS ===\n';
      mastered.forEach(({ topic, level, name }) => {
        report += `${topic}: Nível ${level} (${name})\n`;
      });
      report += '\n';
    }

    if (notMastered.length > 0) {
      report += '=== TÓPICOS EM PROGRESSO ===\n';
      notMastered.forEach(({ topic, level, name, progressToNext }) => {
        report += `${topic}: Nível ${level} (${name}) - ${progressToNext.percentage}% para próximo\n`;
      });
      report += '\n';
    }

    report += '=== POR TÓPICO ===\n';
    for (const [topic, mastery] of Object.entries(this.masteryLevels)) {
      report += `\n${topic}: Nível ${mastery.level} (${mastery.name})\n`;
      report += `  Questões: ${mastery.stats.total}\n`;
      report += `  Acertos: ${Math.round(mastery.stats.accuracy)}%\n`;
      report += `  Revisões: ${mastery.stats.reviews}\n`;
      report += `  Retenção: ${mastery.retention}%\n`;
      if (mastery.progressToNext.percentage < 100) {
        report += `  Progresso para próximo nível: ${mastery.progressToNext.percentage}%\n`;
      }
    }

    return report;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// INSTÂNCIA GLOBAL
// ════════════════════════════════════════════════════════════════════════════

let masteryCertifier = null;

function initMasteryCertifier(digitalTwin, forgettingPredictor) {
  if (!digitalTwin) {
    console.error('[MasteryCertifier] DigitalTwin é obrigatório');
    return null;
  }
  masteryCertifier = new MasteryCertifier(digitalTwin, forgettingPredictor);
  return masteryCertifier;
}

function getMasteryCertifier() {
  return masteryCertifier;
}

// Exportar para uso no browser
if (typeof window !== 'undefined') {
  window.MasteryCertifier = MasteryCertifier;
  window.initMasteryCertifier = initMasteryCertifier;
  window.getMasteryCertifier = getMasteryCertifier;
}

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MasteryCertifier, initMasteryCertifier, getMasteryCertifier };
}
