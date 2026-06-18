/**
 * MOTOR DE LACUNAS OCULTAS - AIVOS Coaching 360
 * 
 * Responsabilidades:
 * - Detectar acertos por sorte (chutes)
 * - Detectar conhecimento superficial (acertos fáceis, erros difíceis)
 * - Detectar falsa sensação de domínio
 * - Mapear lacunas entre tópicos relacionados
 * 
 * Algoritmos:
 * - Detecção de chute por tempo de resposta
 * - Detecção de conhecimento superficial por dificuldade
 * - Detecção de lacunas por tópicos relacionados
 * - Análise de padrões de resposta
 */

// ════════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO E CONSTANTES
// ════════════════════════════════════════════════════════════════════════════

const GUESS_TIME_THRESHOLD = 5000; // 5 segundos = possível chute
const SUPERFICIAL_THRESHOLD_EASY = 80; // >80% acertos fáceis
const SUPERFICIAL_THRESHOLD_HARD = 30; // <30% acertos difíceis
const GAP_THRESHOLD = 40; // Diferença de 40% entre tópicos relacionados

// Tópicos relacionados para detecção de lacunas
const RELATED_TOPICS = {
  'direito_constitucional': ['direito_administrativo', 'direito_tributario'],
  'direito_administrativo': ['direito_constitucional', 'direito_trabalhista'],
  'direito_penal': ['direito_processual_penal', 'criminologia'],
  'direito_civil': ['direito_processual_civil', 'direito_consumidor'],
  'portugues': ['redacao', 'interpretacao'],
  'matematica': ['raciocinio_logico', 'estatistica'],
  'informatica': ['seguranca_informacao', 'redes']
};

// ════════════════════════════════════════════════════════════════════════════
// CLASSE GAP DETECTOR
// ════════════════════════════════════════════════════════════════════════════

class GapDetector {
  constructor(digitalTwin) {
    this.digitalTwin = digitalTwin;
    this.gaps = [];
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ANÁLISE PRINCIPAL
  // ════════════════════════════════════════════════════════════════════════════

  async analyze() {
    if (!this.digitalTwin || !this.digitalTwin.getProfile()) {
      console.warn('[GapDetector] DigitalTwin não inicializado');
      return [];
    }

    const profile = this.digitalTwin.getProfile();
    const questionStats = profile.performance.questions;

    this.gaps = [];

    // 1. Detectar chutes por tempo
    this.detectGuessesByTime(questionStats.history);

    // 2. Detectar conhecimento superficial
    this.detectSuperficialKnowledge(questionStats.byDifficulty);

    // 3. Detectar lacunas por tópicos relacionados
    this.detectTopicGaps(questionStats.byDiscipline);

    // 4. Detectar padrões de resposta
    this.detectResponsePatterns(questionStats.history);

    return this.gaps;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // DETECÇÃO DE CHUTES POR TEMPO
  // ════════════════════════════════════════════════════════════════════════════

  detectGuessesByTime(history) {
    const fastCorrectAnswers = history.filter(q => 
      q.isCorrect && q.timeToAnswer < GUESS_TIME_THRESHOLD
    );

    if (fastCorrectAnswers.length > 0) {
      const percentage = (fastCorrectAnswers.length / history.length) * 100;
      
      if (percentage > 20) {
        this.gaps.push({
          type: 'possible_guess',
          severity: percentage > 40 ? 'high' : 'medium',
          message: `${fastCorrectAnswers.length} respostas corretas muito rápidas (<5s). Possíveis chutes.`,
          count: fastCorrectAnswers.length,
          percentage: Math.round(percentage),
          affectedQuestions: fastCorrectAnswers.map(q => q.id)
        });
      }
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // DETECÇÃO DE CONHECIMENTO SUPERFICIAL
  // ════════════════════════════════════════════════════════════════════════════

  detectSuperficialKnowledge(byDifficulty) {
    const easy = byDifficulty.easy || { total: 0, correct: 0, wrong: 0 };
    const medium = byDifficulty.medium || { total: 0, correct: 0, wrong: 0 };
    const hard = byDifficulty.hard || { total: 0, correct: 0, wrong: 0 };
    const extreme = byDifficulty.extreme || { total: 0, correct: 0, wrong: 0 };

    const easyAccuracy = easy.total > 0 ? (easy.correct / easy.total) * 100 : 0;
    const hardAccuracy = (hard.total + extreme.total) > 0 
      ? ((hard.correct + extreme.correct) / (hard.total + extreme.total)) * 100 
      : 0;

    // Conhecimento superficial: acertos fáceis altos, acertos difíceis baixos
    if (easyAccuracy > SUPERFICIAL_THRESHOLD_EASY && hardAccuracy < SUPERFICIAL_THRESHOLD_HARD) {
      this.gaps.push({
        type: 'superficial_knowledge',
        severity: 'high',
        message: `Alta precisão em questões fáceis (${Math.round(easyAccuracy)}%) mas baixa em difíceis (${Math.round(hardAccuracy)}%). Conhecimento superficial detectado.`,
        easyAccuracy: Math.round(easyAccuracy),
        hardAccuracy: Math.round(hardAccuracy),
        recommendation: 'Focar em questões de dificuldade média e difícil para aprofundar conhecimento.'
      });
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // DETECÇÃO DE LACUNAS POR TÓPICOS RELACIONADOS
  // ════════════════════════════════════════════════════════════════════════════

  detectTopicGaps(byDiscipline) {
    for (const [topic, relatedTopics] of Object.entries(RELATED_TOPICS)) {
      const topicStats = byDiscipline[topic] || { total: 0, correct: 0, wrong: 0 };
      const topicAccuracy = topicStats.total > 0 ? (topicStats.correct / topicStats.total) * 100 : 0;

      if (topicStats.total < 5) continue; // Ignorar se poucas questões

      for (const relatedTopic of relatedTopics) {
        const relatedStats = byDiscipline[relatedTopic] || { total: 0, correct: 0, wrong: 0 };
        const relatedAccuracy = relatedStats.total > 0 ? (relatedStats.correct / relatedStats.total) * 100 : 0;

        if (relatedStats.total < 5) continue; // Ignorar se poucas questões

        const difference = Math.abs(topicAccuracy - relatedAccuracy);

        if (difference > GAP_THRESHOLD) {
          const stronger = topicAccuracy > relatedAccuracy ? topic : relatedTopic;
          const weaker = topicAccuracy > relatedAccuracy ? relatedTopic : topic;
          const strongerAccuracy = Math.max(topicAccuracy, relatedAccuracy);
          const weakerAccuracy = Math.min(topicAccuracy, relatedAccuracy);

          this.gaps.push({
            type: 'topic_gap',
            severity: difference > 60 ? 'high' : 'medium',
            message: `Lacuna detectada: ${stronger} (${Math.round(strongerAccuracy)}%) vs ${weaker} (${Math.round(weakerAccuracy)}%).`,
            strongerTopic: stronger,
            weakerTopic: weaker,
            difference: Math.round(difference),
            recommendation: `Revisar ${weaker} para equilibrar conhecimento com ${stronger}.`
          });
        }
      }
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // DETECÇÃO DE PADRÕES DE RESPOSTA
  // ════════════════════════════════════════════════════════════════════════════

  detectResponsePatterns(history) {
    if (history.length < 10) return;

    // Detectar viés de alternativa (sempre escolhe A, B, etc.)
    const selectedCounts = {};
    history.forEach(q => {
      if (q.selected) {
        selectedCounts[q.selected] = (selectedCounts[q.selected] || 0) + 1;
      }
    });

    const total = history.length;
    for (const [alternative, count] of Object.entries(selectedCounts)) {
      const percentage = (count / total) * 100;
      if (percentage > 40) {
        this.gaps.push({
          type: 'response_pattern',
          severity: 'medium',
          message: `Viés de resposta detectado: ${alternative} escolhida ${Math.round(percentage)}% das vezes.`,
          alternative,
          percentage: Math.round(percentage),
          recommendation: 'Conscientizar-se do viés e ler todas as alternativas antes de responder.'
        });
      }
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // GETTERS
  // ════════════════════════════════════════════════════════════════════════════

  getGaps() {
    return this.gaps;
  }

  getHighSeverityGaps() {
    return this.gaps.filter(gap => gap.severity === 'high');
  }

  getMediumSeverityGaps() {
    return this.gaps.filter(gap => gap.severity === 'medium');
  }

  getGapSummary() {
    return {
      total: this.gaps.length,
      high: this.getHighSeverityGaps().length,
      medium: this.getMediumSeverityGaps().length,
      byType: this.groupGapsByType()
    };
  }

  groupGapsByType() {
    const grouped = {};
    this.gaps.forEach(gap => {
      grouped[gap.type] = (grouped[gap.type] || 0) + 1;
    });
    return grouped;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RELATÓRIO
  // ════════════════════════════════════════════════════════════════════════════

  generateReport() {
    const summary = this.getGapSummary();
    
    let report = '=== RELATÓRIO DE LACUNAS OCULTAS ===\n\n';
    report += `Total de lacunas detectadas: ${summary.total}\n`;
    report += `Alta severidade: ${summary.high}\n`;
    report += `Média severidade: ${summary.medium}\n\n`;
    
    report += '=== POR TIPO ===\n';
    for (const [type, count] of Object.entries(summary.byType)) {
      report += `${type}: ${count}\n`;
    }
    
    report += '\n=== DETALHES ===\n';
    this.gaps.forEach((gap, index) => {
      report += `\n[${index + 1}] ${gap.type} (${gap.severity})\n`;
      report += `  ${gap.message}\n`;
      if (gap.recommendation) {
        report += `  Recomendação: ${gap.recommendation}\n`;
      }
    });

    return report;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// INSTÂNCIA GLOBAL
// ════════════════════════════════════════════════════════════════════════════

let gapDetector = null;

function initGapDetector(digitalTwin) {
  if (!digitalTwin) {
    console.error('[GapDetector] DigitalTwin é obrigatório');
    return null;
  }
  gapDetector = new GapDetector(digitalTwin);
  return gapDetector;
}

function getGapDetector() {
  return gapDetector;
}

// Exportar para uso no browser
if (typeof window !== 'undefined') {
  window.GapDetector = GapDetector;
  window.initGapDetector = initGapDetector;
  window.getGapDetector = getGapDetector;
}

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GapDetector, initGapDetector, getGapDetector };
}
