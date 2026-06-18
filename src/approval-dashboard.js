/**
 * MAPA DE APROVAÇÃO - AIVOS Coaching 360
 * 
 * Responsabilidades:
 * - Dashboard principal mostrando evolução, retenção, risco, revisões, aprovação prevista
 * - Evolução geral (gráfico)
 * - Evolução por disciplina (gráficos)
 * - Retenção atual (medidor)
 * - Score de risco (semáforo)
 * - Próximas revisões (lista)
 * - Aprovação prevista (probabilidade)
 * - Níveis de domínio (progress bars)
 * 
 * Integra com todos os outros módulos do AIVOS 360
 */

// ════════════════════════════════════════════════════════════════════════════
// CLASSE APPROVAL DASHBOARD
// ════════════════════════════════════════════════════════════════════════════

class ApprovalDashboard {
  constructor(digitalTwin, forgettingPredictor, riskDetector, masteryCertifier, approvalPredictor) {
    this.digitalTwin = digitalTwin;
    this.forgettingPredictor = forgettingPredictor;
    this.riskDetector = riskDetector;
    this.masteryCertifier = masteryCertifier;
    this.approvalPredictor = approvalPredictor;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // GERAÇÃO DE DADOS DO DASHBOARD
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Gera dados completos do dashboard
   * @returns {Object} Dados do dashboard
   */
  generateDashboardData() {
    const profile = this.digitalTwin?.getProfile();
    
    if (!profile) {
      return this.getEmptyDashboard();
    }

    return {
      overview: this.getOverviewData(profile),
      evolution: this.getEvolutionData(profile),
      retention: this.getRetentionData(profile),
      risk: this.getRiskData(profile),
      reviews: this.getReviewsData(profile),
      mastery: this.getMasteryData(profile),
      approval: this.getApprovalData(profile),
      alerts: this.getAlertsData(profile)
    };
  }

  /**
   * Dados vazios quando não há perfil
   */
  getEmptyDashboard() {
    return {
      overview: {
        totalQuestions: 0,
        totalCorrect: 0,
        overallAccuracy: 0,
        studyDays: 0
      },
      evolution: {
        daily: [],
        weekly: []
      },
      retention: {
        overall: 0,
        byDiscipline: {},
        trend: 'stable'
      },
      risk: {
        overall: 'low',
        byDiscipline: {},
        summary: { total: 0, high: 0, medium: 0, low: 0 }
      },
      reviews: {
        upcoming: [],
        overdue: []
      },
      mastery: {
        summary: { total: 0, mastered: 0, notMastered: 0, notStarted: 0 },
        byTopic: {}
      },
      approval: {
        probability: 0,
        factors: {},
        recommendation: 'Comece a estudar para ver sua previsão'
      },
      alerts: []
    };
  }

  /**
   * Dados de visão geral
   */
  getOverviewData(profile) {
    const questions = profile.performance.questions;
    const total = questions.total;
    const correct = questions.correct;
    const accuracy = total > 0 ? (correct / total) * 100 : 0;

    // Calcular dias de estudo
    const history = questions.history;
    const uniqueDays = new Set();
    history.forEach(q => {
      const date = new Date(q.timestamp).toDateString();
      uniqueDays.add(date);
    });

    return {
      totalQuestions: total,
      totalCorrect: correct,
      overallAccuracy: Math.round(accuracy),
      studyDays: uniqueDays.size,
      totalEssays: profile.performance.essays.total,
      totalReviews: profile.performance.reviews.total
    };
  }

  /**
   * Dados de evolução
   */
  getEvolutionData(profile) {
    const history = profile.performance.questions.history;
    
    // Agrupar por dia
    const dailyData = {};
    history.forEach(q => {
      const date = new Date(q.timestamp).toDateString();
      if (!dailyData[date]) {
        dailyData[date] = { total: 0, correct: 0 };
      }
      dailyData[date].total++;
      if (q.isCorrect) dailyData[date].correct++;
    });

    // Converter para array
    const daily = Object.entries(dailyData).map(([date, stats]) => ({
      date,
      total: stats.total,
      correct: stats.correct,
      accuracy: Math.round((stats.correct / stats.total) * 100)
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Agrupar por semana
    const weeklyData = {};
    daily.forEach(day => {
      const date = new Date(day.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toDateString();
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { total: 0, correct: 0 };
      }
      weeklyData[weekKey].total += day.total;
      weeklyData[weekKey].correct += day.correct;
    });

    const weekly = Object.entries(weeklyData).map(([week, stats]) => ({
      week,
      total: stats.total,
      correct: stats.correct,
      accuracy: Math.round((stats.correct / stats.total) * 100)
    })).sort((a, b) => new Date(a.week) - new Date(b.week));

    return { daily, weekly };
  }

  /**
   * Dados de retenção
   */
  getRetentionData(profile) {
    const retention = profile.retention;
    
    return {
      overall: Math.round(retention.overall),
      byDiscipline: retention.byDiscipline,
      trend: retention.trend
    };
  }

  /**
   * Dados de risco
   */
  getRiskData(profile) {
    if (!this.riskDetector) {
      return {
        overall: 'low',
        byDiscipline: {},
        summary: { total: 0, high: 0, medium: 0, low: 0 }
      };
    }

    const riskScores = this.riskDetector.getRiskScores();
    const summary = this.riskDetector.getRiskSummary();

    // Determinar risco geral
    let overall = 'low';
    if (summary.high > 0) overall = 'high';
    else if (summary.medium > 0) overall = 'medium';

    return {
      overall,
      byDiscipline: riskScores,
      summary
    };
  }

  /**
   * Dados de revisões
   */
  getReviewsData(profile) {
    if (!this.forgettingPredictor) {
      return {
        upcoming: [],
        overdue: []
      };
    }

    const upcoming = this.forgettingPredictor.getReviewSchedule();
    const overdue = this.forgettingPredictor.getOverdueReviews();

    return {
      upcoming: upcoming.slice(0, 5), // Próximas 5
      overdue: overdue.slice(0, 5) // 5 mais vencidas
    };
  }

  /**
   * Dados de domínio
   */
  getMasteryData(profile) {
    if (!this.masteryCertifier) {
      return {
        summary: { total: 0, mastered: 0, notMastered: 0, notStarted: 0 },
        byTopic: {}
      };
    }

    const masteryLevels = this.masteryCertifier.getMasteryLevels();
    const summary = this.masteryCertifier.getMasterySummary();

    return {
      summary,
      byTopic: masteryLevels
    };
  }

  /**
   * Dados de aprovação
   */
  getApprovalData(profile) {
    if (!this.approvalPredictor) {
      return {
        probability: 0,
        factors: {},
        recommendation: 'Módulo de previsão não disponível'
      };
    }

    const prediction = this.approvalPredictor.calculateApprovalProbability(profile);

    return prediction;
  }

  /**
   * Dados de alertas
   */
  getAlertsData(profile) {
    if (!this.riskDetector) {
      return [];
    }

    return this.riskDetector.getAlerts().slice(0, 10); // Últimos 10 alertas
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RENDERIZAÇÃO DO DASHBOARD
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Renderiza dashboard HTML
   * @returns {string} HTML do dashboard
   */
  renderDashboard() {
    const data = this.generateDashboardData();

    return `
      <div id="approval-dashboard" class="approval-dashboard">
        <div class="dashboard-header">
          <h1>Mapa de Aprovação</h1>
          <div class="approval-probability">
            <span class="probability-label">Probabilidade de Aprovação</span>
            <span class="probability-value">${data.approval.probability}%</span>
          </div>
        </div>

        <div class="dashboard-grid">
          <!-- Visão Geral -->
          <div class="dashboard-card overview-card">
            <h3>Visão Geral</h3>
            <div class="overview-stats">
              <div class="stat-item">
                <span class="stat-value">${data.overview.totalQuestions}</span>
                <span class="stat-label">Questões</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">${data.overview.overallAccuracy}%</span>
                <span class="stat-label">Acertos</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">${data.overview.studyDays}</span>
                <span class="stat-label">Dias de Estudo</span>
              </div>
            </div>
          </div>

          <!-- Retenção -->
          <div class="dashboard-card retention-card">
            <h3>Retenção</h3>
            <div class="retention-meter">
              <div class="meter-fill" style="width: ${data.retention.overall}%"></div>
              <span class="meter-value">${data.retention.overall}%</span>
            </div>
            <div class="retention-trend trend-${data.retention.trend}">
              Tendência: ${this.getTrendLabel(data.retention.trend)}
            </div>
          </div>

          <!-- Risco -->
          <div class="dashboard-card risk-card">
            <h3>Risco</h3>
            <div class="risk-indicator risk-${data.risk.overall}">
              ${this.getRiskLabel(data.risk.overall)}
            </div>
            <div class="risk-summary">
              Alto: ${data.risk.summary.high} | Médio: ${data.risk.summary.medium} | Baixo: ${data.risk.summary.low}
            </div>
          </div>

          <!-- Próximas Revisões -->
          <div class="dashboard-card reviews-card">
            <h3>Próximas Revisões</h3>
            <ul class="reviews-list">
              ${data.reviews.upcoming.length > 0 
                ? data.reviews.upcoming.map(r => `
                  <li class="review-item urgency-${r.urgency}">
                    <span class="review-topic">${r.topic}</span>
                    <span class="review-days">D+${r.daysUntilReview}</span>
                  </li>
                `).join('')
                : '<li class="no-reviews">Nenhuma revisão agendada</li>'
              }
            </ul>
          </div>

          <!-- Domínio -->
          <div class="dashboard-card mastery-card">
            <h3>Domínio</h3>
            <div class="mastery-summary">
              <div class="mastery-stat">
                <span class="mastery-value">${data.mastery.summary.mastered}</span>
                <span class="mastery-label">Dominados</span>
              </div>
              <div class="mastery-stat">
                <span class="mastery-value">${data.mastery.summary.notMastered}</span>
                <span class="mastery-label">Em Progresso</span>
              </div>
            </div>
            <div class="mastery-progress">
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${data.mastery.summary.masteryPercentage}%"></div>
              </div>
              <span class="progress-text">${data.mastery.summary.masteryPercentage}% dominado</span>
            </div>
          </div>

          <!-- Alertas -->
          <div class="dashboard-card alerts-card">
            <h3>Alertas</h3>
            <ul class="alerts-list">
              ${data.alerts.length > 0
                ? data.alerts.map(a => `
                  <li class="alert-item severity-${a.severity}">
                    <span class="alert-message">${a.message}</span>
                  </li>
                `).join('')
                : '<li class="no-alerts">Nenhum alerta</li>'
              }
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Obtém label de tendência
   */
  getTrendLabel(trend) {
    const labels = {
      up: '📈 Subindo',
      down: '📉 Descendo',
      stable: '➡️ Estável'
    };
    return labels[trend] || labels.stable;
  }

  /**
   * Obtém label de risco
   */
  getRiskLabel(risk) {
    const labels = {
      low: '🟢 Baixo',
      medium: '🟡 Médio',
      high: '🔴 Alto'
    };
    return labels[risk] || labels.low;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ATUALIZAÇÃO DO DASHBOARD
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Atualiza dashboard no DOM
   */
  updateDashboard() {
    const dashboardContainer = document.getElementById('approval-dashboard');
    if (!dashboardContainer) return;

    dashboardContainer.innerHTML = this.renderDashboard();
  }

  /**
   * Inicializa dashboard no DOM
   */
  initDashboard() {
    // Verificar se já existe
    if (document.getElementById('approval-dashboard')) {
      this.updateDashboard();
      return;
    }

    // Criar container
    const dashboardContainer = document.createElement('div');
    dashboardContainer.id = 'approval-dashboard-container';
    dashboardContainer.innerHTML = this.renderDashboard();

    // Adicionar ao body (ou a um container específico)
    document.body.appendChild(dashboardContainer);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// INSTÂNCIA GLOBAL
// ════════════════════════════════════════════════════════════════════════════

let approvalDashboard = null;

function initApprovalDashboard(digitalTwin, forgettingPredictor, riskDetector, masteryCertifier, approvalPredictor) {
  if (!digitalTwin) {
    console.error('[ApprovalDashboard] DigitalTwin é obrigatório');
    return null;
  }
  approvalDashboard = new ApprovalDashboard(digitalTwin, forgettingPredictor, riskDetector, masteryCertifier, approvalPredictor);
  return approvalDashboard;
}

function getApprovalDashboard() {
  return approvalDashboard;
}

// Exportar para uso no browser
if (typeof window !== 'undefined') {
  window.ApprovalDashboard = ApprovalDashboard;
  window.initApprovalDashboard = initApprovalDashboard;
  window.getApprovalDashboard = getApprovalDashboard;
}

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ApprovalDashboard, initApprovalDashboard, getApprovalDashboard };
}
