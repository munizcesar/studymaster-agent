/**
 * MENTOR PROATIVO - AIVOS Coaching 360
 * 
 * Responsabilidades:
 * - Sistema inicia interações proativas baseadas em dados do aluno
 * - Analisar perfil do aluno e gerar mensagens proativas
 * - Exemplos: "Você está evitando Administrativo há 5 dias", "Sua retenção em Constitucional caiu 14%"
 * - Gatilhos inteligentes baseados em comportamento
 * - Priorização de mensagens (high, medium, low)
 * - Não intrusivo
 */

// ════════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO E CONSTANTES
// ════════════════════════════════════════════════════════════════════════════

const TRIGGER_INTERVAL = 60000; // Verificar a cada 60 segundos
const MAX_MESSAGES = 5; // Máximo de 5 mensagens ativas
const MESSAGE_COOLDOWN = 3600000; // 1 hora entre mensagens do mesmo tipo

// ════════════════════════════════════════════════════════════════════════════
// GATILHOS PROATIVOS
// ════════════════════════════════════════════════════════════════════════════

const PROACTIVE_TRIGGERS = [
  {
    id: 'abandoned_discipline',
    condition: (profile, riskDetector) => {
      if (!riskDetector) return false;
      const alerts = riskDetector.getAlerts();
      return alerts.some(a => a.type === 'abandoned');
    },
    generateMessage: (profile, riskDetector) => {
      const alert = riskDetector.getAlerts().find(a => a.type === 'abandoned');
      return {
        type: 'warning',
        priority: 'high',
        title: 'Disciplina Abandonada',
        message: `Você está evitando ${alert.discipline} há ${alert.daysSinceLastStudy} dias.`,
        recommendation: alert.recommendation,
        action: 'practice',
        actionData: { discipline: alert.discipline }
      };
    }
  },
  {
    id: 'low_retention',
    condition: (profile, riskDetector) => {
      if (!riskDetector) return false;
      const alerts = riskDetector.getAlerts();
      return alerts.some(a => a.type === 'low_retention');
    },
    generateMessage: (profile, riskDetector) => {
      const alert = riskDetector.getAlerts().find(a => a.type === 'low_retention');
      return {
        type: 'warning',
        priority: 'high',
        title: 'Retenção Baixa',
        message: `Sua retenção em ${alert.discipline} caiu para ${alert.retention}%`,
        recommendation: alert.recommendation,
        action: 'review',
        actionData: { topic: alert.discipline }
      };
    }
  },
  {
    id: 'performance_drop',
    condition: (profile, riskDetector) => {
      if (!riskDetector) return false;
      const alerts = riskDetector.getAlerts().find(a => a.type === 'performance_drop');
      return alerts && alerts.drop > 20;
    },
    generateMessage: (profile, riskDetector) => {
      const alert = riskDetector.getAlerts().find(a => a.type === 'performance_drop');
      return {
        type: 'warning',
        priority: 'high',
        title: 'Queda de Desempenho',
        message: `Seu desempenho em ${alert.discipline} caiu ${alert.drop}%`,
        recommendation: alert.recommendation,
        action: 'review',
        actionData: { topic: alert.discipline }
      };
    }
  },
  {
    id: 'review_due',
    condition: (profile, forgettingPredictor) => {
      if (!forgettingPredictor) return false;
      const overdue = forgettingPredictor.getOverdueReviews();
      return overdue.length > 0;
    },
    generateMessage: (profile, forgettingPredictor) => {
      const overdue = forgettingPredictor.getOverdueReviews();
      const review = overdue[0];
      return {
        type: 'info',
        priority: 'medium',
        title: 'Revisão Pendente',
        message: `Hoje recomendamos revisão de ${review.topic}`,
        recommendation: `Revisar ${review.topic} para manter o conhecimento fresco`,
        action: 'review',
        actionData: { topic: review.topic }
      };
    }
  },
  {
    id: 'mastery_level_up',
    condition: (profile, masteryCertifier) => {
      if (!masteryCertifier) return false;
      const masteryLevels = masteryCertifier.getMasteryLevels();
      // Verificar se houve aumento de nível (simplificado)
      return Object.values(masteryLevels).some(m => m.level >= 4 && !m.notified);
    },
    generateMessage: (profile, masteryCertifier) => {
      const masteryLevels = masteryCertifier.getMasteryLevels();
      const mastered = Object.entries(masteryLevels).filter(([topic, m]) => m.level >= 4 && !m.notified);
      const [topic, mastery] = mastered[0];
      
      // Marcar como notificado
      mastery.notified = true;
      
      return {
        type: 'success',
        priority: 'low',
        title: 'Conquista!',
        message: `Parabéns! Você alcançou nível ${mastery.level} em ${topic}!`,
        recommendation: 'Continue assim para blindar seu conhecimento',
        action: 'continue',
        actionData: {}
      };
    }
  },
  {
    id: 'streak_milestone',
    condition: (profile) => {
      const streak = profile.performance.questions.total;
      return streak > 0 && streak % 100 === 0;
    },
    generateMessage: (profile) => {
      const streak = profile.performance.questions.total;
      return {
        type: 'success',
        priority: 'low',
        title: 'Marco Alcançado!',
        message: `Você já respondeu ${streak} questões!`,
        recommendation: 'Continue estudando consistentemente',
        action: 'continue',
        actionData: {}
      };
    }
  },
  {
    id: 'daily_goal_achieved',
    condition: (profile) => {
      // Simplificado: verificar se atingiu meta diária
      const today = new Date().toDateString();
      const history = profile.performance.questions.history;
      const todayQuestions = history.filter(q => new Date(q.timestamp).toDateString() === today);
      return todayQuestions.length >= 10;
    },
    generateMessage: (profile) => {
      return {
        type: 'success',
        priority: 'low',
        title: 'Meta Diária Atingida!',
        message: 'Você completou sua meta de 10 questões hoje!',
        recommendation: 'Ótimo trabalho! Descanse um pouco ou continue se quiser',
        action: 'continue',
        actionData: {}
      };
    }
  }
];

// ════════════════════════════════════════════════════════════════════════════
// CLASSE PROACTIVE MENTOR
// ════════════════════════════════════════════════════════════════════════════

class ProactiveMentor {
  constructor(digitalTwin, forgettingPredictor, riskDetector, masteryCertifier) {
    this.digitalTwin = digitalTwin;
    this.forgettingPredictor = forgettingPredictor;
    this.riskDetector = riskDetector;
    this.masteryCertifier = masteryCertifier;
    this.activeMessages = [];
    this.messageHistory = [];
    this.checkInterval = null;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // INICIALIZAÇÃO
  // ════════════════════════════════════════════════════════════════════════════

  init() {
    // Iniciar verificação periódica
    this.startPeriodicCheck();
    console.log('[ProactiveMentor] Inicializado');
  }

  startPeriodicCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(() => {
      this.checkTriggers();
    }, TRIGGER_INTERVAL);
  }

  stopPeriodicCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // VERIFICAÇÃO DE GATILHOS
  // ════════════════════════════════════════════════════════════════════════════

  async checkTriggers() {
    if (!this.digitalTwin) return;

    const profile = this.digitalTwin.getProfile();
    if (!profile) return;

    for (const trigger of PROACTIVE_TRIGGERS) {
      try {
        // Verificar condição
        const conditionMet = trigger.condition(profile, this.forgettingPredictor, this.riskDetector, this.masteryCertifier);

        if (conditionMet) {
          // Verificar cooldown
          if (!this.isInCooldown(trigger.id)) {
            // Gerar mensagem
            const message = trigger.generateMessage(profile, this.forgettingPredictor, this.riskDetector, this.masteryCertifier);
            
            // Adicionar mensagem
            this.addMessage(message, trigger.id);
          }
        }
      } catch (error) {
        console.error(`[ProactiveMentor] Erro ao verificar trigger ${trigger.id}:`, error);
      }
    }
  }

  /**
   * Verifica se um trigger está em cooldown
   */
  isInCooldown(triggerId) {
    const now = Date.now();
    const lastMessage = this.messageHistory.filter(m => m.triggerId === triggerId).pop();

    if (!lastMessage) return false;

    return (now - lastMessage.timestamp) < MESSAGE_COOLDOWN;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // GERENCIAMENTO DE MENSAGENS
  // ════════════════════════════════════════════════════════════════════════════

  addMessage(message, triggerId) {
    const messageWithMeta = {
      ...message,
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      triggerId,
      dismissed: false
    };

    // Adicionar às mensagens ativas
    this.activeMessages.push(messageWithMeta);

    // Adicionar ao histórico
    this.messageHistory.push(messageWithMeta);

    // Limitar mensagens ativas
    if (this.activeMessages.length > MAX_MESSAGES) {
      this.activeMessages.shift();
    }

    // Notificar (pode ser implementado com UI)
    this.notifyMessage(messageWithMeta);

    console.log('[ProactiveMentor] Mensagem gerada:', message.title);
  }

  dismissMessage(messageId) {
    const message = this.activeMessages.find(m => m.id === messageId);
    if (message) {
      message.dismissed = true;
      this.activeMessages = this.activeMessages.filter(m => m.id !== messageId);
    }
  }

  dismissAllMessages() {
    this.activeMessages.forEach(m => m.dismissed = true);
    this.activeMessages = [];
  }

  // ════════════════════════════════════════════════════════════════════════════
  // NOTIFICAÇÃO
  // ════════════════════════════════════════════════════════════════════════════

  notifyMessage(message) {
    // Disparar evento customizado para UI
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('proactiveMessage', { detail: message });
      window.dispatchEvent(event);
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // GETTERS
  // ════════════════════════════════════════════════════════════════════════════

  getActiveMessages() {
    return this.activeMessages.filter(m => !m.dismissed);
  }

  getHighPriorityMessages() {
    return this.getActiveMessages().filter(m => m.priority === 'high');
  }

  getMessageHistory() {
    return this.messageHistory;
  }

  getMessageStats() {
    const total = this.messageHistory.length;
    const byType = {};
    const byPriority = {};

    this.messageHistory.forEach(m => {
      byType[m.type] = (byType[m.type] || 0) + 1;
      byPriority[m.priority] = (byPriority[m.priority] || 0) + 1;
    });

    return {
      total,
      byType,
      byPriority,
      active: this.getActiveMessages().length
    };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RENDERIZAÇÃO DE MENSAGENS
  // ════════════════════════════════════════════════════════════════════════════

  renderMessages() {
    const messages = this.getActiveMessages();
    
    if (messages.length === 0) {
      return '';
    }

    return `
      <div class="proactive-messages">
        ${messages.map(m => `
          <div class="proactive-message message-${m.type} priority-${m.priority}">
            <div class="message-header">
              <span class="message-title">${m.title}</span>
              <button class="message-dismiss" onclick="window.proactiveMentor.dismissMessage('${m.id}')">✕</button>
            </div>
            <div class="message-body">${m.message}</div>
            ${m.recommendation ? `<div class="message-recommendation">${m.recommendation}</div>` : ''}
            ${m.action ? `<button class="message-action" data-action="${m.action}">Ação</button>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RELATÓRIO
  // ════════════════════════════════════════════════════════════════════════════

  generateReport() {
    const stats = this.getMessageStats();

    let report = '=== RELATÓRIO DO MENTOR PROATIVO ===\n\n';
    report += `Total de mensagens: ${stats.total}\n`;
    report += `Mensagens ativas: ${stats.active}\n\n`;

    report += '=== POR TIPO ===\n';
    for (const [type, count] of Object.entries(stats.byType)) {
      report += `${type}: ${count}\n`;
    }

    report += '\n=== POR PRIORIDADE ===\n';
    for (const [priority, count] of Object.entries(stats.byPriority)) {
      report += `${priority}: ${count}\n`;
    }

    report += '\n=== ÚLTIMAS MENSAGENS ===\n';
    this.messageHistory.slice(-10).forEach((m, index) => {
      report += `\n[${index + 1}] ${m.title} (${m.priority})\n`;
      report += `  ${m.message}\n`;
      report += `  Timestamp: ${new Date(m.timestamp).toLocaleString()}\n`;
    });

    return report;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// INSTÂNCIA GLOBAL
// ════════════════════════════════════════════════════════════════════════════

let proactiveMentor = null;

function initProactiveMentor(digitalTwin, forgettingPredictor, riskDetector, masteryCertifier) {
  if (!digitalTwin) {
    console.error('[ProactiveMentor] DigitalTwin é obrigatório');
    return null;
  }
  proactiveMentor = new ProactiveMentor(digitalTwin, forgettingPredictor, riskDetector, masteryCertifier);
  proactiveMentor.init();
  return proactiveMentor;
}

function getProactiveMentor() {
  return proactiveMentor;
}

// Exportar para uso no browser
if (typeof window !== 'undefined') {
  window.ProactiveMentor = ProactiveMentor;
  window.initProactiveMentor = initProactiveMentor;
  window.getProactiveMentor = getProactiveMentor;
}

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ProactiveMentor, initProactiveMentor, getProactiveMentor };
}
