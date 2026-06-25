/**
 * 🧠 MENTOR AIVOS - Cérebro Inteligente de Aprendizagem
 * 
 * Responsabilidades:
 * - Sistema inicia interações proativas baseadas em dados do aluno
 * - Observa, analisa e ensina como um mentor real
 * - Gatilhos inteligentes: lacunas ocultas, falsa sensação de domínio, chutes, etc.
 * - Toda mensagem tem: O que notei, Por que aconteceu, O que fazer, Confiança
 * - Priorização inteligente com cooldown por tipo
 * 
 * Alinhamento com AIVOS_COACHING_360_MASTERPLAN.md:
 * - MENTOR PROATIVO: sistema inicia interações
 * - AUDITORIA DE IA: toda recomendação informa motivo, dados, confiança
 * - MOTOR DE LACUNAS OCULTAS: acertos por sorte, conhecimento superficial
 * - PREVISÃO DE ESQUECIMENTO: Spaced Repetition D+1, D+3, D+7...
 * - CERTIFICAÇÃO DE DOMÍNIO: níveis 1-5
 */

// ════════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO E CONSTANTES
// ════════════════════════════════════════════════════════════════════════════

const TRIGGER_INTERVAL = 60000; // Verificar a cada 60 segundos
const MAX_MESSAGES = 5;
const MESSAGE_COOLDOWN = 3600000; // 1 hora entre mensagens do mesmo tipo
// Fallback seguro: usa variáveis globais de gap-detector.js e forgetting-predictor.js
// com valor padrão caso a ordem de carregamento mude no futuro
const _GUESS_TIME_THRESHOLD = typeof GUESS_TIME_THRESHOLD !== 'undefined' ? GUESS_TIME_THRESHOLD : 5000;
const _REVIEW_SCHEDULE = typeof REVIEW_SCHEDULE !== 'undefined' ? REVIEW_SCHEDULE : [1, 3, 7, 15, 30, 60, 90];

// Mensagens do mentor com personalidade consistente
const MENTOR_PERSONALITY = {
  name: 'AIVOS',
  greeting: '<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 6v6l4 2\"/></svg>',
  style: 'direto e educativo',
  confidenceLabels: {
    high: 'Alta',
    medium: 'Média',
    low: 'Baixa'
  }
};

// ════════════════════════════════════════════════════════════════════════════
// GATILHOS PROATIVOS INTELIGENTES
// ════════════════════════════════════════════════════════════════════════════

const PROACTIVE_TRIGGERS = [
  // ─── RISCOS ───
  {
    id: 'abandoned_discipline',
    category: 'risco',
    icon: '⚠️',
    condition: (profile, deps) => {
      const { riskDetector } = deps;
      if (!riskDetector) return false;
      const alerts = riskDetector.getAlerts();
      return alerts.some(a => a.type === 'abandoned');
    },
    generateMessage: (profile, deps) => {
      const { riskDetector } = deps;
      const alert = riskDetector.getAlerts().find(a => a.type === 'abandoned');
      return {
        type: 'warning',
        priority: 'high',
        icon: '⚠️',
        title: 'Disciplina Abandonada',
        observation: `Você está evitando ${alert.discipline} há ${alert.daysSinceLastStudy} dias.`,
        reason: `Seu cérebro está perdendo conexões importantes em ${alert.discipline}. A curva de esquecimento de Ebbinghaus mostra que após 7 dias sem revisão, a retenção cai drasticamente.`,
        action: 'practice',
        actionData: { discipline: alert.discipline },
        confidence: 92,
        confidenceReason: `Baseado em ${Object.keys(profile.performance.questions.byDiscipline).length} disciplinas analisadas`
      };
    }
  },
  {
    id: 'low_retention',
    category: 'risco',
    icon: '📉',
    condition: (profile, deps) => {
      const { riskDetector } = deps;
      if (!riskDetector) return false;
      const alerts = riskDetector.getAlerts();
      return alerts.some(a => a.type === 'low_retention');
    },
    generateMessage: (profile, deps) => {
      const { riskDetector } = deps;
      const alert = riskDetector.getAlerts().find(a => a.type === 'low_retention');
      return {
        type: 'warning',
        priority: 'high',
        icon: '📉',
        title: 'Retenção em Queda',
        observation: `Sua retenção em ${alert.discipline} caiu para ${alert.retention}%. Ideal é acima de 75%.`,
        reason: `A memória de longo prazo precisa de revisões periódicas. Sem estímulo, o cérebro prioriza apagar informações não usadas.`,
        action: 'review',
        actionData: { topic: alert.discipline },
        confidence: 88,
        confidenceReason: `Calculado usando algoritmo SM-2 com ${profile.performance.questions.total} questões no histórico`
      };
    }
  },
  {
    id: 'performance_drop',
    category: 'risco',
    icon: '📊',
    condition: (profile, deps) => {
      const { riskDetector } = deps;
      if (!riskDetector) return false;
      const alerts = riskDetector.getAlerts();
      const alert = alerts.find(a => a.type === 'performance_drop');
      return alert && alert.drop > 15;
    },
    generateMessage: (profile, deps) => {
      const { riskDetector } = deps;
      const alert = riskDetector.getAlerts().find(a => a.type === 'performance_drop');
      return {
        type: 'warning',
        priority: 'high',
        icon: '📊',
        title: 'Queda de Desempenho',
        observation: `Seu desempenho em ${alert.discipline} caiu ${alert.drop}% comparado ao período anterior.`,
        reason: `Quedas súbitas geralmente indicam lacunas de conhecimento que não foram percebidas. Vamos identificar onde está o problema.`,
        action: 'review',
        actionData: { topic: alert.discipline },
        confidence: 85,
        confidenceReason: `Comparação automática entre últimas 20 questões`
      };
    }
  },

  // ─── REVISÃO ───
  {
    id: 'review_due',
    category: 'revisao',
    icon: '🔄',
    condition: (profile, deps) => {
      const { forgettingPredictor } = deps;
      if (!forgettingPredictor) return false;
      const overdue = forgettingPredictor.getOverdueReviews();
      return overdue.length > 0;
    },
    generateMessage: (profile, deps) => {
      const { forgettingPredictor } = deps;
      const overdue = forgettingPredictor.getOverdueReviews();
      const review = overdue[0];
      const scheduleIndex = Math.min(review.daysOverdue || 0, _REVIEW_SCHEDULE.length - 1);
      const nextInterval = _REVIEW_SCHEDULE[Math.min(scheduleIndex + 1, _REVIEW_SCHEDULE.length - 1)] || 90;
      return {
        type: 'info',
        priority: 'medium',
        icon: '🔄',
        title: 'Revisão Programada',
        observation: review.daysOverdue > 0
          ? `Sua revisão de ${review.topic} está atrasada há ${review.daysOverdue} dias!`
          : `Hoje é dia de revisar ${review.topic}!`,
        reason: `Baseado no ciclo de Spaced Repetition (D+1 → D+3 → D+7 → D+15 → D+30 → D+60 → D+90). Revisões no momento certo fixam o conhecimento 4x mais.`,
        action: 'review',
        actionData: { topic: review.topic },
        confidence: 90,
        confidenceReason: `Algoritmo SM-2 com schedule fixo do Masterplan`
      };
    }
  },

  // ─── LACUNAS OCULTAS ───
  {
    id: 'hidden_gap',
    category: 'lacuna',
    icon: '🔍',
    condition: (profile, deps) => {
      const { gapDetector } = deps;
      if (!gapDetector) return false;
      const gaps = gapDetector.getGaps();
      return gaps.some(g => g.type === 'topic_gap');
    },
    generateMessage: (profile, deps) => {
      const { gapDetector } = deps;
      const topicGaps = gapDetector.getGaps().filter(g => g.type === 'topic_gap');
      if (topicGaps.length === 0) return null;
      const gap = topicGaps[0];
      return {
        type: 'insight',
        priority: 'medium',
        icon: '🔍',
        title: 'Lacuna Oculta Detectada',
        observation: `Percebi algo que você talvez não tenha notado: você vai bem em ${gap.strongerTopic} (${gap.difference}% de diferença para ${gap.weakerTopic}).`,
        reason: `Isso é clássico: seu cérebro está confortável com ${gap.strongerTopic}, mas ${gap.weakerTopic} está sendo negligenciada. Lacunas ocultas são perigosas porque você não percebe que existem.`,
        action: 'practice',
        actionData: { discipline: gap.weakerTopic },
        confidence: 82,
        confidenceReason: `Comparação entre ${gap.strongerTopic} e ${gap.weakerTopic} com base em questões respondidas`
      };
    }
  },
  {
    id: 'superficial_knowledge',
    category: 'lacuna',
    icon: '🧐',
    condition: (profile, deps) => {
      const { gapDetector } = deps;
      if (!gapDetector) return false;
      const gaps = gapDetector.getGaps();
      return gaps.some(g => g.type === 'superficial_knowledge');
    },
    generateMessage: (profile, deps) => {
      const { gapDetector } = deps;
      const gap = gapDetector.getGaps().find(g => g.type === 'superficial_knowledge');
      if (!gap) return null;
      return {
        type: 'insight',
        priority: 'high',
        icon: '🧐',
        title: 'Conhecimento Superficial',
        observation: `Você acerta ${gap.easyAccuracy}% das questões fáceis, mas apenas ${gap.hardAccuracy}% das difíceis.`,
        reason: `Isso indica que seu conhecimento é superficial — você entende o básico, mas não tem profundidade. É como saber o nome de uma ferramenta sem saber usar.`,
        action: 'practice',
        actionData: { difficulty: 'hard' },
        recommendation: gap.recommendation,
        confidence: 86,
        confidenceReason: `Análise de ${profile.performance.questions.total} questões separadas por nível de dificuldade`
      };
    }
  },
  {
    id: 'guess_detected',
    category: 'lacuna',
    icon: '🎲',
    condition: (profile, deps) => {
      const { gapDetector } = deps;
      if (!gapDetector) return false;
      const gaps = gapDetector.getGaps();
      return gaps.some(g => g.type === 'possible_guess');
    },
    generateMessage: (profile, deps) => {
      const { gapDetector } = deps;
      const gap = gapDetector.getGaps().find(g => g.type === 'possible_guess');
      if (!gap) return null;
      return {
        type: 'insight',
        priority: 'medium',
        icon: '🎲',
        title: 'Possíveis Chutes Detectados',
        observation: `Identifiquei ${gap.count} respostas corretas em menos de 3 segundos. Isso é ${gap.percentage}% do total.`,
        reason: `Respostas muito rápidas geralmente indicam chute. Seu cérebro pode estar usando atalhos em vez de raciocínio. Isso funciona agora, mas na prova pode custar pontos preciosos.`,
        action: 'review',
        recommendation: gap.recommendation || 'Tente responder com mais calma, refletindo antes de escolher',
        confidence: 78,
        confidenceReason: `Detecção por tempo de resposta (threshold: ${_GUESS_TIME_THRESHOLD / 1000}s)`
      };
    }
  },
  {
    id: 'response_bias',
    category: 'lacuna',
    icon: '🎯',
    condition: (profile, deps) => {
      const { gapDetector } = deps;
      if (!gapDetector) return false;
      const gaps = gapDetector.getGaps();
      return gaps.some(g => g.type === 'response_pattern');
    },
    generateMessage: (profile, deps) => {
      const { gapDetector } = deps;
      const gap = gapDetector.getGaps().find(g => g.type === 'response_pattern');
      if (!gap) return null;
      return {
        type: 'insight',
        priority: 'low',
        icon: '🎯',
        title: 'Viés de Resposta',
        observation: `Notei um padrão: você escolhe a alternativa "${gap.alternative}" em ${gap.percentage}% das questões.`,
        reason: `Isso pode ser um viés inconsciente. Seu cérebro cria preferências sem você perceber. Na prova, isso pode te levar a erros evitáveis.`,
        action: 'review',
        recommendation: gap.recommendation,
        confidence: 74,
        confidenceReason: `Análise de distribuição de alternativas escolhidas`
      };
    }
  },

  // ─── APROVAÇÃO ───
  {
    id: 'approval_progress',
    category: 'aprovacao',
    icon: '📈',
    condition: (profile, deps) => {
      const { approvalPredictor } = deps;
      if (!approvalPredictor) return false;
      const predictions = approvalPredictor.getPredictions();
      if (predictions.length < 2) return false;
      const latest = predictions[predictions.length - 1];
      const previous = predictions[predictions.length - 2];
      return Math.abs(latest.probability - previous.probability) >= 5;
    },
    generateMessage: (profile, deps) => {
      const { approvalPredictor } = deps;
      const predictions = approvalPredictor.getPredictions();
      const latest = predictions[predictions.length - 1];
      const previous = predictions[predictions.length - 2];
      const diff = latest.probability - previous.probability;
      const isUp = diff > 0;
      return {
        type: isUp ? 'success' : 'warning',
        priority: 'medium',
        icon: isUp ? '📈' : '📉',
        title: isUp ? 'Progresso na Aprovação' : 'Alerta na Aprovação',
        observation: isUp
          ? `Sua probabilidade de aprovação subiu ${Math.abs(diff)}%! Agora está em ${latest.probability}%.`
          : `Sua probabilidade de aprovação caiu ${Math.abs(diff)}%. Agora está em ${latest.probability}%.`,
        reason: isUp
          ? `Continue assim! Seu esforço está gerando resultados mensuráveis.`
          : `Precisamos revisar a estratégia. Vamos identificar o que está impactando negativamente.`,
        action: 'continue',
        actionData: {},
        confidence: 80,
        confidenceReason: `Modelo de predição baseado em ${profile.performance.questions.total} questões, retenção e domínio`
      };
    }
  },

  // ─── CONSISTÊNCIA ───
  {
    id: 'consistency_drop',
    category: 'consistencia',
    icon: '📅',
    condition: (profile, deps) => {
      const history = profile.performance.questions.history;
      if (history.length < 14) return false;
      const now = Date.now();
      const lastWeek = history.filter(q => q.timestamp > now - 7 * 86400000).length;
      const previousWeek = history.filter(q => q.timestamp > now - 14 * 86400000 && q.timestamp <= now - 7 * 86400000).length;
      return previousWeek > 10 && lastWeek < previousWeek * 0.5;
    },
    generateMessage: (profile, deps) => {
      const history = profile.performance.questions.history;
      const now = Date.now();
      const lastWeek = history.filter(q => q.timestamp > now - 7 * 86400000).length;
      const previousWeek = history.filter(q => q.timestamp > now - 14 * 86400000 && q.timestamp <= now - 7 * 86400000).length;
      return {
        type: 'warning',
        priority: 'medium',
        icon: '📅',
        title: 'Consistência em Queda',
        observation: `Semana passada você fez ${lastWeek} questões. Na anterior foram ${previousWeek}. Uma queda de ${Math.round((1 - lastWeek / previousWeek) * 100)}%.`,
        reason: `A consistência é o fator mais importante para aprovação. Estudar um pouco todo dia é melhor que muito um dia só. O cérebro aprende melhor com repetição espaçada.`,
        action: 'practice',
        actionData: {},
        confidence: 85,
        confidenceReason: `Comparação entre as últimas 2 semanas de estudo`
      };
    }
  },
  {
    id: 'streak_encouragement',
    category: 'consistencia',
    icon: '🔥',
    condition: (profile, deps) => {
      const history = profile.performance.questions.history;
      if (history.length < 3) return false;
      // Check consecutive days
      const days = new Set();
      history.forEach(q => days.add(new Date(q.timestamp).toDateString()));
      const today = new Date().toDateString();
      if (!days.has(today)) return false;
      // Count streak
      let streak = 0;
      const d = new Date();
      while (days.has(d.toDateString())) {
        streak++;
        d.setDate(d.getDate() - 1);
      }
      return (streak === 3 || streak === 7 || streak === 14 || streak === 21 || streak === 30);
    },
    generateMessage: (profile, deps) => {
      const history = profile.performance.questions.history;
      const days = new Set();
      history.forEach(q => days.add(new Date(q.timestamp).toDateString()));
      let streak = 0;
      const d = new Date();
      while (days.has(d.toDateString())) {
        streak++;
        d.setDate(d.getDate() - 1);
      }
      const messages = {
        3: '3 dias seguidos! O hábito está começando a se formar.',
        7: '7 dias! Parabéns! Uma semana de consistência. Seu cérebro já está criando conexões mais fortes.',
        14: '14 dias! Duas semanas! Você já está no caminho certo para tornar o estudo um hábito automático.',
        21: '21 dias! Três semanas! Dizem que 21 dias formam um hábito. O estudo já faz parte da sua rotina.',
        30: '30 DIAS! Um mês inteiro de estudos consistentes! Essa é a maior conquista para qualquer concurseiro.'
      };
      return {
        type: 'success',
        priority: 'low',
        icon: '🔥',
        title: 'Marco de Consistência!',
        observation: `🔥 Você está há ${streak} dias consecutivos estudando!`,
        reason: messages[streak] || `Continue nesse ritmo! ${streak} dias de estudo consistente.`,
        action: 'continue',
        actionData: {},
        confidence: 95,
        confidenceReason: `Sequência de ${streak} dias consecutivos verificada no histórico`
      };
    }
  },

  // ─── DOMÍNIO ───
  {
    id: 'mastery_level_up',
    category: 'dominio',
    icon: '🏆',
    condition: (profile, deps) => {
      const { masteryCertifier } = deps;
      if (!masteryCertifier) return false;
      const masteryLevels = masteryCertifier.getMasteryLevels();
      return Object.values(masteryLevels).some(m => m.level >= 4 && !m.notified);
    },
    generateMessage: (profile, deps) => {
      const { masteryCertifier } = deps;
      const masteryLevels = masteryCertifier.getMasteryLevels();
      const mastered = Object.entries(masteryLevels).filter(([topic, m]) => m.level >= 4 && !m.notified);
      const [topic, mastery] = mastered[0];
      mastery.notified = true;
      const levelNames = { 4: 'Domínio', 5: 'Blindagem' };
      return {
        type: 'success',
        priority: 'low',
        icon: '🏆',
        title: `Nível ${mastery.level} — ${levelNames[mastery.level]}!`,
        observation: `Parabéns! Você alcançou nível ${mastery.level} (${mastery.name}) em ${topic}!`,
        reason: `Nível ${mastery.level} significa que você respondeu ${mastery.stats.total} questões com ${Math.round(mastery.stats.accuracy)}% de acertos e ${mastery.stats.reviews} revisões. Apenas 1 em cada 3 alunos chega a esse nível.`,
        action: 'continue',
        actionData: {},
        confidence: 96,
        confidenceReason: `Certificação de Domínio baseada em critérios objetivos`
      };
    }
  },

  // ─── BEM-ESTAR ───
  {
    id: 'overload_alert',
    category: 'bem_estar',
    icon: '🧠',
    condition: (profile, deps) => {
      const history = profile.performance.questions.history;
      if (history.length < 10) return false;
      const now = Date.now();
      const lastHour = history.filter(q => q.timestamp > now - 3600000).length;
      return lastHour >= 20;
    },
    generateMessage: (profile, deps) => {
      return {
        type: 'info',
        priority: 'low',
        icon: '🧠',
        title: 'Pausa Necessária',
        observation: 'Você já respondeu muitas questões sem pausa. Seu cérebro precisa de descanso para consolidar o aprendizado.',
        reason: `O cérebro consolida memórias durante o descanso. Estudar sem parar reduz a eficiência. Faça uma pausa de 5-10 minutos. Seu aprendizado será melhor.`,
        action: 'continue',
        actionData: {},
        confidence: 90,
        confidenceReason: `Detecção de sobrecarga cognitiva`
      };
    }
  },
  {
    id: 'daily_goal_achieved',
    category: 'consistencia',
    icon: '⭐',
    condition: (profile, deps) => {
      const today = new Date().toDateString();
      const history = profile.performance.questions.history;
      const todayQuestions = history.filter(q => new Date(q.timestamp).toDateString() === today);
      const target = deps.dailyTarget || 10;
      return todayQuestions.length >= target && todayQuestions.length % target === 0;
    },
    generateMessage: (profile, deps) => {
      const today = new Date().toDateString();
      const history = profile.performance.questions.history;
      const todayQuestions = history.filter(q => new Date(q.timestamp).toDateString() === today);
      const target = deps.dailyTarget || 10;
      return {
        type: 'success',
        priority: 'low',
        icon: '⭐',
        title: 'Meta Diária Atingida!',
        observation: `Você completou ${todayQuestions.length} questões hoje! 🎉`,
        reason: `Meta de ${target} questões cumprida. Cada dia de estudo consistente é um passo mais perto da aprovação.`,
        action: 'continue',
        actionData: {},
        confidence: 94,
        confidenceReason: `Meta diária configurável`
      };
    }
  },

  // ─── ACTIVE RECALL ───
  {
    id: 'active_recall_gap',
    category: 'risco',
    icon: '🧪',
    condition: (profile, deps) => {
      const history = profile.performance.questions.history;
      if (history.length === 0) return true; // Nunca fez questão
      const now = Date.now();
      const lastQuestion = history[history.length - 1];
      const daysSinceLastQuestion = (now - lastQuestion.timestamp) / 86400000;
      // Se passou mais de 3 dias sem responder questões
      return daysSinceLastQuestion >= 3;
    },
    generateMessage: (profile, deps) => {
      const history = profile.performance.questions.history;
      const now = Date.now();
      let daysSinceLastQuestion = 0;
      if (history.length > 0) {
        const lastQuestion = history[history.length - 1];
        daysSinceLastQuestion = Math.round((now - lastQuestion.timestamp) / 86400000);
      }
      const isNewStudent = history.length === 0;
      return {
        type: 'info',
        priority: 'high',
        icon: '🧪',
        title: isNewStudent ? 'Hora do Active Recall!' : 'Sem Prática de Questões',
        observation: isNewStudent
          ? 'Você ainda não respondeu nenhuma questão! Estudar teoria é importante, mas testar-se é ESSENCIAL para a aprovação.'
          : `Você não responde questões há ${daysSinceLastQuestion} dias. Seu cérebro precisa do Active Recall para fixar o conteúdo.`,
        reason: `Active Recall é o método mais eficaz de aprendizado comprovado por estudos (Roediger & Karpicke). Ler é passivo, responder questões força seu cérebro a recuperar ativamente a informação, criando conexões neurais mais fortes.`,
        action: 'practice',
        actionData: {},
        confidence: 93,
        confidenceReason: `Baseado na curva de esquecimento de Ebbinghaus - sem prática ativa, a retenção cai 56% em 24 horas`
      };
    }
  },

  // ─── INTERLEAVING ───
  {
    id: 'interleaving_alert',
    category: 'consistencia',
    icon: '🔄',
    condition: (profile, deps) => {
      const history = profile.performance.questions.history;
      if (history.length < 5) return false;
      const now = Date.now();
      // Últimas 10 questões ou últimas 24h (o que for menor)
      const recentHistory = history.filter(q => q.timestamp > now - 86400000).slice(-10);
      if (recentHistory.length < 5) return false;
      // Verificar se todas as questões recentes são da MESMA disciplina
      const disciplines = [...new Set(recentHistory.map(q => q.discipline))];
      return disciplines.length === 1;
    },
    generateMessage: (profile, deps) => {
      const history = profile.performance.questions.history;
      const now = Date.now();
      const recentHistory = history.filter(q => q.timestamp > now - 86400000).slice(-10);
      const soleDiscipline = recentHistory[0].discipline;
      const count = recentHistory.length;
      return {
        type: 'insight',
        priority: 'medium',
        icon: '🔄',
        title: 'Hora de Misturar Disciplinas',
        observation: `Você respondeu ${count} questões nas últimas 24h, todas de ${soleDiscipline}.`,
        reason: `Estudar uma única disciplina por vez é menos eficiente. O Interleaving (misturar disciplinas) força seu cérebro a constantemente alternar entre diferentes tipos de problema, o que melhora a retenção em até 43% (estudo de Rohrer & Taylor).`,
        action: 'practice',
        actionData: { mix: true },
        confidence: 81,
        confidenceReason: `Análise de distribuição de disciplinas nas últimas ${count} questões`
      };
    }
  },

  // ─── WEAKEST TOPIC AVOIDANCE ───
  {
    id: 'weakest_topic_avoidance',
    category: 'lacuna',
    icon: '🎯',
    condition: (profile, deps) => {
      const byDiscipline = profile.performance.questions.byDiscipline;
      const disciplines = Object.entries(byDiscipline);
      if (disciplines.length < 2) return false;
      // Encontrar a disciplina com a MENOR taxa de acerto
      let worstDiscipline = null;
      let worstAccuracy = 1;
      for (const [discipline, stats] of disciplines) {
        if (stats.total < 5) continue;
        const accuracy = stats.correct / stats.total;
        if (accuracy < worstAccuracy) {
          worstAccuracy = accuracy;
          worstDiscipline = discipline;
        }
      }
      if (!worstDiscipline) return false;
      const now = Date.now();
      const history = profile.performance.questions.history;
      // Verificar se a última vez que estudou a pior disciplina foi há mais de 7 dias
      const worstHistory = history.filter(q => q.discipline === worstDiscipline);
      if (worstHistory.length === 0) return false;
      const lastWorst = worstHistory[worstHistory.length - 1];
      const daysSince = (now - lastWorst.timestamp) / 86400000;
      
      // Calcular quantas questões de outras disciplinas fez desde então
      const otherSince = history.filter(q => q.discipline !== worstDiscipline && q.timestamp > lastWorst.timestamp);
      return daysSince >= 5 && otherSince.length >= 10;
    },
    generateMessage: (profile, deps) => {
      const byDiscipline = profile.performance.questions.byDiscipline;
      const disciplines = Object.entries(byDiscipline);
      let worstDiscipline = null;
      let worstAccuracy = 1;
      let bestAccuracy = 0;
      for (const [discipline, stats] of disciplines) {
        if (stats.total < 5) continue;
        const accuracy = stats.correct / stats.total;
        if (accuracy < worstAccuracy) {
          worstAccuracy = accuracy;
          worstDiscipline = discipline;
        }
      }
      // Encontrar a melhor disciplina para comparação
      for (const [discipline, stats] of disciplines) {
        if (discipline === worstDiscipline) continue;
        if (stats.total < 5) continue;
        const accuracy = stats.correct / stats.total;
        if (accuracy > bestAccuracy) {
          bestAccuracy = accuracy;
        }
      }
      const worstPct = Math.round(worstAccuracy * 100);
      const bestPct = Math.round(bestAccuracy * 100);
      const gap = bestPct - worstPct;
      return {
        type: 'warning',
        priority: 'high',
        icon: '🎯',
        title: 'Evitando sua Fraqueza',
        observation: `Você está evitando ${worstDiscipline} (${worstPct}% acertos) — sua disciplina mais fraca. Enquanto isso, sua melhor disciplina tem ${bestPct}% de acertos — diferença de ${gap}%.`,
        reason: `Seu cérebro naturalmente evita o que é difícil (viés de conforto). Mas é exatamente onde você mais precisa estudar. Deliberate Practice: foque nas suas fraquezas, não nos seus pontos fortes. É assim que se cresce.`,
        action: 'practice',
        actionData: { discipline: worstDiscipline },
        confidence: 88,
        confidenceReason: `Comparação de desempenho entre ${Object.keys(byDiscipline).length} disciplinas - diferença de ${gap} pontos percentuais`
      };
    }
  },

  // ─── REDAÇÃO NEGLIGENCIADA ───
  {
    id: 'essay_neglect',
    category: 'consistencia',
    icon: '✍️',
    condition: (profile, deps) => {
      const essays = profile.performance.essays;
      if (essays.total === 0) return true;
      const now = Date.now();
      const lastEssay = essays.history[essays.history.length - 1];
      const daysSince = (now - lastEssay.timestamp) / 86400000;
      return daysSince >= 7;
    },
    generateMessage: (profile, deps) => {
      const essays = profile.performance.essays;
      const now = Date.now();
      let daysSince = 0;
      if (essays.total > 0) {
        const lastEssay = essays.history[essays.history.length - 1];
        daysSince = Math.round((now - lastEssay.timestamp) / 86400000);
      }
      const isNew = essays.total === 0;
      return {
        type: 'warning',
        priority: 'high',
        icon: '✍️',
        title: isNew ? 'Redação: Primeiro Passo' : 'Redação Abandonada',
        observation: isNew
          ? 'Você ainda não praticou nenhuma redação! A redação pode valer até 20% da sua nota final, dependendo do concurso.'
          : `Sua última redação foi há ${daysSince} dias. A prática de redação precisa ser constante — é uma habilidade que se perde rápido.`,
        reason: `Redação não é só conteúdo — é técnica. Estrutura, argumentação, domínio da norma culta e repertório sociocultural precisam ser treinados regularmente. Uma redação nota 1000 pode ser o diferencial entre ser aprovado ou não.`,
        action: 'essay',
        actionData: {},
        confidence: 91,
        confidenceReason: `Análise do histórico de redações${isNew ? ' — nenhuma redação encontrada' : ` — ${daysSince} dias sem prática`}`
      };
    }
  },

  // ─── SIMULADO GAP ───
  {
    id: 'simulado_gap',
    category: 'revisao',
    icon: '📝',
    condition: (profile, deps) => {
      const simulados = profile.performance.simulados;
      if (simulados.total === 0) return true;
      const now = Date.now();
      const lastSimulado = simulados.history[simulados.history.length - 1];
      const daysSince = (now - lastSimulado.timestamp) / 86400000;
      const totalQuestions = profile.performance.questions.total;
      // Só alerta se já respondeu questões suficientes (pelo menos 30)
      return totalQuestions >= 30 && daysSince >= 14;
    },
    generateMessage: (profile, deps) => {
      const simulados = profile.performance.simulados;
      const now = Date.now();
      let daysSince = 0;
      if (simulados.total > 0) {
        const lastSimulado = simulados.history[simulados.history.length - 1];
        daysSince = Math.round((now - lastSimulado.timestamp) / 86400000);
      }
      const totalQuestions = profile.performance.questions.total;
      const isNew = simulados.total === 0;
      return {
        type: 'info',
        priority: 'medium',
        icon: '📝',
        title: isNew ? 'Primeiro Simulado?' : 'Simulado Atrasado',
        observation: isNew
          ? `Você já respondeu ${totalQuestions} questões, mas ainda não fez nenhum simulado completo. Simulados são o melhor treino para a prova real.`
          : `Seu último simulado foi há ${daysSince} dias. Simulados periódicos são essenciais para medir seu progresso real.`,
        reason: `Simulados não são apenas para testar conhecimento — eles treinam gestão de tempo, resistência mental, controle emocional e identificam lacunas que questões soltas não mostram. Concurseiros que fazem simulados regulares têm 2x mais chances de aprovação.`,
        action: 'simulado',
        actionData: {},
        confidence: 87,
        confidenceReason: `Com ${totalQuestions} questões respondidas, você já tem base para um simulado completo${isNew ? '' : ` — último há ${daysSince} dias`}`
      };
    }
  },

  // ─── DIFICULDADE PLATEAU ───
  {
    id: 'difficulty_plateau',
    category: 'dominio',
    icon: '📈',
    condition: (profile, deps) => {
      const byDifficulty = profile.performance.questions.byDifficulty;
      // Verificar se o aluno está preso em dificuldade baixa/média
      const easy = byDifficulty['easy'] || { total: 0 };
      const medium = byDifficulty['medium'] || { total: 0 };
      const hard = byDifficulty['hard'] || { total: 0 };
      // Se já respondeu muitas fáceis/médias e poucas difíceis
      const easyAndMedium = easy.total + medium.total;
      return easyAndMedium >= 30 && hard.total < 5;
    },
    generateMessage: (profile, deps) => {
      const byDifficulty = profile.performance.questions.byDifficulty;
      const easy = byDifficulty['easy'] || { total: 0, correct: 0 };
      const medium = byDifficulty['medium'] || { total: 0, correct: 0 };
      const hard = byDifficulty['hard'] || { total: 0, correct: 0 };
      const easyAcc = easy.total > 0 ? Math.round((easy.correct / easy.total) * 100) : 0;
      const mediumAcc = medium.total > 0 ? Math.round((medium.correct / medium.total) * 100) : 0;
      return {
        type: 'insight',
        priority: 'medium',
        icon: '📈',
        title: 'Hora de Subir o Nível',
        observation: `Você já respondeu ${easy.total} questões fáceis (${easyAcc}% acertos) e ${medium.total} médias (${mediumAcc}% acertos). Mas apenas ${hard.total} difíceis.`,
        reason: `Ficar apenas em questões fáceis e médias cria uma falsa sensação de domínio. As questões difíceis são as que realmente aprovam — elas separam os candidatos preparados dos medianos. É desconfortável no começo, mas é onde o crescimento acontece.`,
        action: 'practice',
        actionData: { difficulty: 'hard' },
        confidence: 84,
        confidenceReason: `Análise de distribuição por dificuldade: ${easy.total} fáceis, ${medium.total} médias, ${hard.total} difíceis`
      };
    }
  },

  // ─── COMEBACK ENCOURAGEMENT ───
  {
    id: 'comeback_encouragement',
    category: 'consistencia',
    icon: '💪',
    condition: (profile, deps) => {
      const history = profile.performance.questions.history;
      // Encontrar o dia mais recente de estudo
      if (history.length < 2) return false;
      // Ordenar por timestamp (o histórico já deve estar ordenado)
      // Criar conjunto de datas de estudo
      const studyDays = new Set();
      history.forEach(q => studyDays.add(new Date(q.timestamp).toDateString()));
      // Verificar se houve um gap de 3+ dias e depois retomou
      const dates = [...studyDays].map(d => new Date(d).getTime()).sort((a, b) => a - b);
      const today = new Date().toDateString();
      const todayTime = new Date(today).getTime();
      const yesterdayTime = todayTime - 86400000;
      const twoDaysAgo = todayTime - 2 * 86400000;
      
      // Só mostrar se estudou hoje ou ontem (retomou recentemente)
      const studiedTodayOrYesterday = dates.includes(todayTime) || dates.includes(yesterdayTime);
      if (!studiedTodayOrYesterday) return false;
      
      // Verificar se houve um gap de 3+ dias antes disso
      for (let i = 1; i < dates.length; i++) {
        const gap = (dates[i] - dates[i - 1]) / 86400000;
        if (gap >= 3 && dates[i] >= twoDaysAgo) {
          return true;
        }
      }
      return false;
    },
    generateMessage: (profile, deps) => {
      const history = profile.performance.questions.history;
      const studyDays = new Set();
      history.forEach(q => studyDays.add(new Date(q.timestamp).toDateString()));
      const dates = [...studyDays].map(d => new Date(d).getTime()).sort((a, b) => a - b);
      
      // Encontrar o gap MAIS RECENTE (alinhado com condition: >= 3)
      const todayTime = new Date(new Date().toDateString()).getTime();
      const yesterdayTime = todayTime - 86400000;
      let recentGap = 0;
      for (let i = dates.length - 1; i >= 1; i--) {
        const gap = (dates[i] - dates[i - 1]) / 86400000;
        // O gap mais recente é aquele que termina em today ou yesterday
        if (gap >= 3 && dates[i] >= yesterdayTime) {
          recentGap = gap;
          break;
        }
      }
      const gapDays = Math.round(recentGap);
      return {
        type: 'success',
        priority: 'medium',
        icon: '💪',
        title: 'Bem-vindo de Volta! 🎉',
        observation: `Você ficou ${gapDays} dias sem estudar, mas RETORNOU! Isso é o que realmente importa — a consistência é construída sobre recomeços.`,
        reason: `Todo concurseiro tem dias de queda. A diferença entre quem passa e quem não passa não é nunca falhar — é sempre voltar. Você provou hoje que tem a resiliência necessária para essa jornada. Vamos juntos!`,
        action: 'practice',
        actionData: {},
        confidence: 95,
        confidenceReason: `Detecção de retorno após gap de ${gapDays} dias no histórico de estudos`
      };
    }
  },

  // ─── SESSÃO DE BAIXA QUALIDADE ───
  {
    id: 'session_quality_drop',
    category: 'risco',
    icon: '📊',
    condition: (profile, deps) => {
      const history = profile.performance.questions.history;
      if (history.length < 10) return false;
      const now = Date.now();
      // Últimas 10 questões da sessão atual (últimas 4 horas)
      const recentSession = history.filter(q => q.timestamp > now - 4 * 3600000);
      if (recentSession.length < 5) return false;
      // Calcular acurácia da sessão
      const sessionCorrect = recentSession.filter(q => q.isCorrect).length;
      const sessionAccuracy = sessionCorrect / recentSession.length;
      // Calcular acurácia geral (excluindo a sessão atual)
      const previousQuestions = history.filter(q => q.timestamp <= now - 4 * 3600000);
      if (previousQuestions.length < 10) return false;
      const prevCorrect = previousQuestions.filter(q => q.isCorrect).length;
      const prevAccuracy = prevCorrect / previousQuestions.length;
      // Sessão atual está 25%+ abaixo da média geral
      return sessionAccuracy < prevAccuracy - 0.25 && prevAccuracy > 0.4;
    },
    generateMessage: (profile, deps) => {
      const history = profile.performance.questions.history;
      const now = Date.now();
      const recentSession = history.filter(q => q.timestamp > now - 4 * 3600000);
      const previousQuestions = history.filter(q => q.timestamp <= now - 4 * 3600000);
      const sessionCorrect = recentSession.filter(q => q.isCorrect).length;
      const sessionAccuracy = Math.round((sessionCorrect / recentSession.length) * 100);
      const prevCorrect = previousQuestions.filter(q => q.isCorrect).length;
      const prevAccuracy = Math.round((prevCorrect / previousQuestions.length) * 100);
      const drop = prevAccuracy - sessionAccuracy;
      return {
        type: 'warning',
        priority: 'high',
        icon: '📊',
        title: 'Sessão de Baixo Rendimento',
        observation: `Nesta sessão você acertou ${sessionCorrect} de ${recentSession.length} questões (${sessionAccuracy}%). Sua média geral é ${prevAccuracy}%. Uma queda de ${drop} pontos percentuais.`,
        reason: `Quedas pontuais podem acontecer por diversos motivos: cansaço, distração, conteúdo mais difícil ou até ansiedade. Identificar o padrão ajuda a evitar que vire uma tendência. Que tal revisar os erros desta sessão?`,
        action: 'review',
        actionData: {},
        recommendation: 'Revise as questões que errou e tente entender o padrão — foi falta de conteúdo, interpretação ou atenção?',
        confidence: 82,
        confidenceReason: `Comparação entre sessão atual (${sessionAccuracy}%) e média histórica (${prevAccuracy}%) com base em ${history.length} questões`
      };
    }
  }
];

// ════════════════════════════════════════════════════════════════════════════
// CLASSE PROACTIVE MENTOR (CÉREBRO)
// ════════════════════════════════════════════════════════════════════════════


// ════════════════════════════════════════════════════════════════════════════
// MAPA: EMOJI -> LUCIDE SVG (para renderização profissional)
// ════════════════════════════════════════════════════════════════════════════

const EMOJI_SVG_MAP = {
  '⚠️': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>',
  '📉': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 16v-3M12 16v-6M17 16V8"/><path d="M20 10l-2-2-2 2"/></svg>',
  '📊': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 16v-3M12 16v-6M17 16V8"/></svg>',
  '🔄': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>',
  '🔍': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  '🧐': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/><path d="M9 17h.01"/></svg>',
  '🎲': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="12" height="12" x="6" y="6" rx="2"/><path d="M15 3h6v6"/><path d="M9 21H3v-6"/></svg>',
  '🎯': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 12h-4M12 8v8"/></svg>',
  '📈': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 16v-3M12 16v-6M17 16V8"/><path d="M20 10l-2-2-2 2"/></svg>',
  '📅': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/></svg>',
  '🔥': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
  '🏆': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
  '🧠': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  '⭐': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  '🧪': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" x2="12" y1="18" y2="12"/><line x1="9" x2="15" y1="13" y2="13"/></svg>',
  '💪': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4-4 4-4h12a2 2 0 0 1 2 2z"/><path d="M13 9V3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v6"/></svg>',
  '✍️': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>',
  '📝': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>',
};

const EMOJI_FALLBACK_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>';

function emojiToSvg(emoji) {
  return EMOJI_SVG_MAP[emoji] || EMOJI_FALLBACK_SVG;
}


class ProactiveMentor {
  constructor(digitalTwin, forgettingPredictor, riskDetector, masteryCertifier, gapDetector, approvalPredictor, aiAuditor) {
    this.digitalTwin = digitalTwin;
    this.forgettingPredictor = forgettingPredictor;
    this.riskDetector = riskDetector;
    this.masteryCertifier = masteryCertifier;
    this.gapDetector = gapDetector;
    this.approvalPredictor = approvalPredictor;
    this.aiAuditor = aiAuditor;
    this.activeMessages = [];
    this.messageHistory = [];
    this.checkInterval = null;
    this.brainState = {
      isObserving: false,
      currentFocus: 'inicializando',
      lastAnalysis: null,
      focusAreas: ['risco', 'revisao', 'lacuna', 'aprovacao', 'consistencia', 'dominio', 'bem_estar']
    };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // INICIALIZAÇÃO
  // ════════════════════════════════════════════════════════════════════════════

  init() {
    this.startPeriodicCheck();
    this.brainState.isObserving = true;
    this.brainState.currentFocus = 'observando';
    console.log('[ProactiveMentor] Cérebro AIVOS inicializado. Observando...');
    this.notifyBrainState();
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
    this.brainState.isObserving = false;
    this.notifyBrainState();
  }

  // ════════════════════════════════════════════════════════════════════════════
  // CICLO DE OBSERVAÇÃO DO CÉREBRO
  // ════════════════════════════════════════════════════════════════════════════

  async checkTriggers() {
    if (!this.digitalTwin) return;
    const profile = this.digitalTwin.getProfile();
    if (!profile) return;

    // Rotacionar foco do cérebro a cada ciclo
    this.rotateBrainFocus();

    const deps = {
      forgettingPredictor: this.forgettingPredictor,
      riskDetector: this.riskDetector,
      masteryCertifier: this.masteryCertifier,
      gapDetector: this.gapDetector,
      approvalPredictor: this.approvalPredictor,
      dailyTarget: 10
    };

    for (const trigger of PROACTIVE_TRIGGERS) {
      try {
        const conditionMet = trigger.condition(profile, deps);
        if (conditionMet) {
          if (!this.isInCooldown(trigger.id)) {
            const message = trigger.generateMessage(profile, deps);
            if (message) {
              this.addMessage(message, trigger.id);
            }
          }
        }
      } catch (error) {
        console.error(`[ProactiveMentor] Erro no gatilho ${trigger.id}:`, error);
      }
    }

    this.brainState.lastAnalysis = Date.now();
    this.notifyBrainState();
  }

  /**
   * Rotaciona o foco do cérebro para diferentes áreas
   */
  rotateBrainFocus() {
    const areas = this.brainState.focusAreas;
    const currentIndex = areas.indexOf(this.brainState.currentFocus);
    const nextIndex = (currentIndex + 1) % areas.length;
    this.brainState.currentFocus = areas[nextIndex];
  }

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
      dismissed: false,
      // Estrutura de auditoria (AUDITORIA DE IA do Masterplan)
      audit: {
        motivo: message.reason || 'Análise automática do perfil',
        dadosUtilizados: message.confidenceReason || 'Dados do perfil do aluno',
        confianca: message.confidence || 75,
        data: new Date().toISOString()
      }
    };

    this.activeMessages.push(messageWithMeta);
    this.messageHistory.push(messageWithMeta);

    if (this.activeMessages.length > MAX_MESSAGES) {
      this.activeMessages.shift();
    }

    // Registrar no AI Auditor se disponível
    if (this.aiAuditor && this.aiAuditor.log) {
      this.aiAuditor.log({
        type: 'mentor_message',
        prompt: `Gerar mensagem proativa: ${message.title}`,
        context: JSON.stringify({ triggerId, observation: message.observation }),
        response: JSON.stringify(message),
        confidence: message.confidence || 75,
        reasoning: message.reason,
        success: true
      }).catch(() => {});
    }

    this.notifyMessage(messageWithMeta);
    console.log(`[ProactiveMentor] 🧠 Mensagem gerada: ${message.icon} ${message.title}`);
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
  // NOTIFICAÇÕES
  // ════════════════════════════════════════════════════════════════════════════

  notifyMessage(message) {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('proactiveMessage', { detail: message });
      window.dispatchEvent(event);
    }
  }

  notifyBrainState() {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('brainStateChange', { detail: { ...this.brainState } });
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

  getBrainState() {
    return this.brainState;
  }

  getMessageStats() {
    const total = this.messageHistory.length;
    const byType = {};
    const byPriority = {};
    const byCategory = {};

    this.messageHistory.forEach(m => {
      byType[m.type] = (byType[m.type] || 0) + 1;
      byPriority[m.priority] = (byPriority[m.priority] || 0) + 1;
      byCategory[m.category || 'outro'] = (byCategory[m.category || 'outro'] || 0) + 1;
    });

    return {
      total,
      byType,
      byPriority,
      byCategory,
      active: this.getActiveMessages().length
    };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RENDERIZAÇÃO DE MENSAGENS (formato mentor)
  // ════════════════════════════════════════════════════════════════════════════

  renderMessages() {
    const messages = this.getActiveMessages();
    if (messages.length === 0) return '';

    return `
      <div class="mentor-messages">
        ${messages.map(m => `
          <div class="mentor-message message-${m.type} priority-${m.priority}" data-category="${m.category || 'outro'}">
            <div class="mentor-message-header">
              <span class="mentor-message-icon">${emojiToSvg(m.icon)}</span>
              <span class="mentor-message-title">${m.title}</span>
              <span class="mentor-confidence confidence-${m.confidence >= 80 ? 'alta' : m.confidence >= 60 ? 'media' : 'baixa'}">${m.confidence || 75}%</span>
              <button class="message-dismiss" onclick="window.proactiveMentor.dismissMessage('${m.id}')">✕</button>
            </div>
            <div class="mentor-message-body">
              <div class="mentor-observation">
                <strong>🧠 O que notei:</strong> ${m.observation}
              </div>
              <div class="mentor-reason">
                <strong>🔍 Por que isso importa:</strong> ${m.reason || 'Análise baseada em dados'}
              </div>
              ${m.recommendation ? `
              <div class="mentor-recommendation">
                <strong>🎯 O que fazer:</strong> ${m.recommendation}
              </div>` : ''}
              <div class="mentor-audit">
                <span class="audit-tooltip" title="Motivo: ${m.audit?.motivo || m.reason || 'Automático'} | Dados: ${m.audit?.dadosUtilizados || m.confidenceReason || 'Perfil do aluno'}">
                  ℹ️ Auditoria IA: ${m.confidence || 75}% confiança
                </span>
              </div>
            </div>
            ${m.action ? `<button class="mentor-action-btn" data-action="${m.action}" data-action-data='${JSON.stringify(m.actionData || {})}'>Seguir orientação →</button>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Renderiza o estado do cérebro
   */
  renderBrainState() {
    const focusLabels = {
      risco: 'Analisando riscos...',
      revisao: 'Verificando revisões...',
      lacuna: 'Detectando lacunas...',
      aprovacao: 'Calculando aprovação...',
      consistencia: 'Monitorando consistência...',
      dominio: 'Avaliando domínio...',
      bem_estar: 'Verificando bem-estar...',
      observando: 'Observando seu progresso...',
      inicializando: 'Inicializando...'
    };

    return {
      isActive: this.brainState.isObserving,
      focusLabel: focusLabels[this.brainState.currentFocus] || 'Analisando...',
      messageCount: this.getActiveMessages().length,
      totalMessages: this.messageHistory.length
    };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RELATÓRIO
  // ════════════════════════════════════════════════════════════════════════════

  generateReport() {
    const stats = this.getMessageStats();
    const brain = this.renderBrainState();

    let report = '=== 🧠 RELATÓRIO DO MENTOR AIVOS ===\n\n';
    report += `Status: ${brain.isActive ? 'Observando' : 'Inativo'}\n`;
    report += `Foco atual: ${brain.focusLabel}\n`;
    report += `Total de mensagens: ${stats.total}\n`;
    report += `Mensagens ativas: ${stats.active}\n\n`;

    report += '=== POR CATEGORIA ===\n';
    for (const [cat, count] of Object.entries(stats.byCategory || {})) {
      report += `${cat}: ${count}\n`;
    }

    report += '\n=== POR PRIORIDADE ===\n';
    for (const [priority, count] of Object.entries(stats.byPriority)) {
      report += `${priority}: ${count}\n`;
    }

    report += '\n=== ÚLTIMAS MENSAGENS ===\n';
    this.messageHistory.slice(-10).forEach((m, index) => {
      report += `\n[${index + 1}] ${m.title} (${m.priority})\n`;
      report += `  ${m.observation}\n`;
      report += `  Confiança: ${m.confidence}%\n`;
    });

    return report;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// INSTÂNCIA GLOBAL
// ════════════════════════════════════════════════════════════════════════════

let proactiveMentor = null;

function initProactiveMentor(digitalTwin, forgettingPredictor, riskDetector, masteryCertifier, gapDetector, approvalPredictor, aiAuditor) {
  if (!digitalTwin) {
    console.error('[ProactiveMentor] DigitalTwin é obrigatório');
    return null;
  }
  proactiveMentor = new ProactiveMentor(digitalTwin, forgettingPredictor, riskDetector, masteryCertifier, gapDetector, approvalPredictor, aiAuditor);
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
