/**
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃     STUDYMASTER — AIVOS COACH INTELLIGENCE                         ┃
 * ┃                                                                     ┃
 * ┃  Motor de inteligência do Coach AIVOS:                              ┃
 * ┃  - Recomendações inteligentes baseadas em AivosMemory + Tracker     ┃
 * ┃  - Dashboard de desempenho com evolução semanal                    ┃
 * ┃  - Aparições contextuais do AivosCoach no fluxo do sistema         ┃
 * ┃                                                                     ┃
 * ┃  Dependências: AivosAvatar, AivosCoach, AivosMemory, AivosTracker  ┃
 * ┃                                                                     ┃
 * ┃  USO: <script src="src/aivos-coach-intelligence.js"></script>       ┃
 * ┃                                                                     ┃
 * ┃  Este arquivo é ADITIVO — não modifica nada existente.            ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */

(function() {
  'use strict';

  /* ══════════════════════════════════════════════════════════════════════════
     CONSTANTES
     ══════════════════════════════════════════════════════════════════════════ */

  var COACH_CONTAINER_ID = 'aivos-coach-container';
  var RECS_CONTAINER_ID = 'aivos-recommendations';
  var DASHBOARD_CONTAINER_ID = 'aivos-dashboard-content';
  
  var STORAGE_PREFIX = 'aivos_coach_';
  var COOLDOWN_KEY = STORAGE_PREFIX + 'last_shown';
  var COOLDOWN_MS = 60000; // 1 min between automatic coach appearances
  var CONSECUTIVE_CORRECT_THRESHOLD = 3;
  var CONSECUTIVE_WRONG_THRESHOLD = 2;
  var INACTIVITY_THRESHOLD_MS = 60000; // 1 min without answering
  var XP_PER_QUESTION = 10;
  var XP_PER_CORRECT_BONUS = 5;
  var XP_PER_SESSION_BONUS = 50;

  /* ══════════════════════════════════════════════════════════════════════════
     ESTADO INTERNO
     ══════════════════════════════════════════════════════════════════════════ */

  var state = {
    consecutiveCorrect: 0,
    consecutiveWrong: 0,
    lastAnswerTime: Date.now(),
    inactivityTimer: null,
    coachVisible: false,
    initialized: false
  };

  /* ══════════════════════════════════════════════════════════════════════════
     HELPERS
     ══════════════════════════════════════════════════════════════════════════ */

  function getContainer(id) {
    return document.getElementById(id);
  }

  function inCooldown() {
    try {
      var last = localStorage.getItem(COOLDOWN_KEY);
      return last && (Date.now() - parseInt(last, 10)) < COOLDOWN_MS;
    } catch(e) { return false; }
  }

  function setCooldown() {
    try { localStorage.setItem(COOLDOWN_KEY, Date.now().toString()); } catch(e) {}
  }

  function safeGet(key, fallback) {
    try {
      var val = localStorage.getItem(STORAGE_PREFIX + key);
      return val !== null ? JSON.parse(val) : fallback;
    } catch(e) { return fallback; }
  }

  function safeSet(key, val) {
    try { localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(val)); } catch(e) {}
  }

  /** Calcula XP acumulado */
  function calcXP() {
    var total = safeGet('xp', 0);
    return total;
  }

  function addXP(amount) {
    var total = safeGet('xp', 0) + amount;
    safeSet('xp', total);
    return total;
  }

  /** Gera ID único */
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     RECOMMENDATION ENGINE
     ══════════════════════════════════════════════════════════════════════════ */

  var Recommendations = {

    /** Gera recomendação para o próximo estudo */
    getNextStudy: function() {
      var tracker = window.AivosTracker;
      var memory = window.AivosMemory;
      if (!tracker) return null;

      try {
        var data = tracker.getAllData();
        var byDisc = data.byDiscipline || {};
        var discEntries = Object.entries(byDisc);

        if (discEntries.length === 0) return null;

        // Encontrar disciplina mais fraca (menor acurácia, mínimo 3 questões)
        var weakest = null;
        var weakestAcc = 101;
        var strongest = null;
        var strongestAcc = -1;

        for (var i = 0; i < discEntries.length; i++) {
          var entry = discEntries[i];
          var name = entry[0];
          var stats = entry[1];
          if (stats.total < 3) continue;
          var acc = (stats.correct / stats.total) * 100;
          if (acc < weakestAcc) {
            weakestAcc = acc;
            weakest = { name: name, accuracy: Math.round(acc), total: stats.total };
          }
          if (acc > strongestAcc) {
            strongestAcc = acc;
            strongest = { name: name, accuracy: Math.round(acc), total: stats.total };
          }
        }

        // Encontrar dificuldade menos praticada
        var byDiff = data.byDifficulty || {};
        var diffOrder = ['easy', 'medium', 'hard', 'extreme'];
        var leastPracticed = null;
        var minCount = Infinity;
        for (var j = 0; j < diffOrder.length; j++) {
          var d = data.byDifficulty[diffOrder[j]];
          var count = d ? d.total : 0;
          if (count < minCount) {
            minCount = count;
            leastPracticed = diffOrder[j];
          }
        }

        // Verificar se há revisões pendentes no Memory
        var needsReview = false;
        if (memory) {
          try {
            var latestSessions = memory.getHistory('session', { limit: 3 });
            if (latestSessions.length > 0) {
              var lastSession = latestSessions[0];
              var hoursSince = (Date.now() - lastSession.timestamp) / 3600000;
              needsReview = hoursSince > 24; // Mais de 24h desde última sessão
            }
          } catch(e) {}
        }

        // Stats gerais
        var totalQ = data.totalQuestions || 0;
        var totalAcc = totalQ > 0 ? Math.round((data.totalCorrect / totalQ) * 100) : 0;

        return {
          weakestDiscipline: weakest,
          strongestDiscipline: strongest,
          leastPracticedDifficulty: leastPracticed,
          needsReview: needsReview,
          totalQuestions: totalQ,
          overallAccuracy: totalAcc,
          streak: data.currentStreak || 0,
          bestStreak: data.bestStreak || 0
        };
      } catch(e) { return null; }
    },

    /** Gera recomendação formatada como mensagem */
    generateMessage: function() {
      var rec = this.getNextStudy();
      if (!rec) return null;

      var parts = [];
      var action = null;

      if (rec.weakestDiscipline && rec.weakestDiscipline.accuracy < 70) {
        parts.push('Sua disciplina mais desafiadora é **' + rec.weakestDiscipline.name + '** (' + rec.weakestDiscipline.accuracy + '% acertos).');
        action = { label: 'Praticar ' + rec.weakestDiscipline.name };
      }

      if (rec.leastPracticedDifficulty && rec.leastPracticedDifficulty !== 'easy') {
        var diffLabels = { easy: 'fáceis', medium: 'médias', hard: 'difíceis', extreme: 'extremas' };
        parts.push('Que tal aumentar o nível com questões ' + diffLabels[rec.leastPracticedDifficulty] + '?');
      }

      if (rec.needsReview) {
        parts.push('Você não estuda há mais de 24h — uma revisão rápida pode ajudar a fixar o conteúdo.');
      }

      if (rec.streak >= 3) {
        parts.push('🔥 Você está com uma sequência de **' + rec.streak + ' acertos**!');
      }

      if (parts.length === 0) {
        parts.push('Continue praticando! Seu rendimento geral é de **' + rec.overallAccuracy + '%**.');
      }

      return {
        message: parts.join(' '),
        action: action,
        state: rec.weakestDiscipline && rec.weakestDiscipline.accuracy < 50 ? 'warning' : 'teaching'
      };
    }
  };

  /* ══════════════════════════════════════════════════════════════════════════
     DASHBOARD ENGINE
     ══════════════════════════════════════════════════════════════════════════ */

  var Dashboard = {

    /** Gera dados completos do dashboard */
    generateData: function() {
      var tracker = window.AivosTracker;
      var memory = window.AivosMemory;
      if (!tracker) return this.emptyData();

      try {
        var data = tracker.getAllData();
        var stats = tracker.getStats();
        var summary = tracker.getSummary();
        var daily = tracker.getDailyStats(7);
        var byDisc = tracker.getByDiscipline();
        var byDiff = tracker.getByDifficulty();

        // XP
        var xp = calcXP();
        var xpLevel = Math.floor(xp / 500) + 1;
        var xpNext = xpLevel * 500;
        var xpProgress = xpLevel > 1 ? ((xp - (xpLevel - 1) * 500) / 500) * 100 : (xp / 500) * 100;

        // Evolução semanal
        var weeklyData = [];
        for (var i = 6; i >= 0; i--) {
          var dayData = daily[i] || { date: '', total: 0, correct: 0, accuracy: 0 };
          weeklyData.push(dayData);
        }

        // Disciplinas ordenadas por acurácia
        var discArray = [];
        var discKeys = Object.keys(byDisc);
        for (var j = 0; j < discKeys.length; j++) {
          var d = byDisc[discKeys[j]];
          discArray.push({
            name: discKeys[j],
            total: d.total,
            accuracy: d.accuracy,
            isCritical: d.accuracy < 50 && d.total >= 3,
            isMastered: d.accuracy >= 80 && d.total >= 5
          });
        }
        discArray.sort(function(a, b) { return a.accuracy - b.accuracy; });

        var criticalCount = discArray.filter(function(d) { return d.isCritical; }).length;
        var masteredCount = discArray.filter(function(d) { return d.isMastered; }).length;

        // Próxima recomendação
        var nextRec = Recommendations.generateMessage();

        return {
          xp: xp,
          xpLevel: xpLevel,
          xpNext: xpNext,
          xpProgress: Math.min(100, Math.round(xpProgress)),
          weekly: weeklyData,
          disciplines: discArray,
          criticalCount: criticalCount,
          masteredCount: masteredCount,
          totalQuestions: stats.total.questions,
          accuracy: stats.total.accuracy,
          avgTimeMs: stats.total.avgTimeMs,
          streak: stats.streak.current,
          bestStreak: stats.streak.best,
          sessions: stats.sessions.count,
          byDifficulty: byDiff,
          nextRecommendation: nextRec,
          dailyGoal: 10,
          todayQuestions: (daily[6] || { total: 0 }).total || 0
        };
      } catch(e) {
        return this.emptyData();
      }
    },

    emptyData: function() {
      return {
        xp: 0, xpLevel: 1, xpNext: 500, xpProgress: 0,
        weekly: [], disciplines: [], criticalCount: 0, masteredCount: 0,
        totalQuestions: 0, accuracy: 0, avgTimeMs: 0,
        streak: 0, bestStreak: 0, sessions: 0,
        byDifficulty: {}, nextRecommendation: null,
        dailyGoal: 10, todayQuestions: 0
      };
    },

    /** Renderiza o dashboard HTML */
    render: function() {
      var d = this.generateData();
      
      // Nível XP
      var xpBar = '<div class="aivos-xp-bar"><div class="aivos-xp-fill" style="width:' + d.xpProgress + '%"></div></div>';

      // Evolução semanal (graph bars)
      var weeklyHtml = '';
      var maxQ = 1;
      for (var i = 0; i < d.weekly.length; i++) {
        if (d.weekly[i].total > maxQ) maxQ = d.weekly[i].total;
      }
      var dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      for (var w = 0; w < d.weekly.length; w++) {
        var day = d.weekly[w];
        var barH = maxQ > 0 ? Math.round((day.total / maxQ) * 100) : 0;
        var dayLabel = day.date ? new Date(day.date + 'T12:00:00').getDay() : w;
        weeklyHtml += '<div class="aivos-weekly-bar"><div class="aivos-bar-label">' + dayLabels[dayLabel] + '</div><div class="aivos-bar-track"><div class="aivos-bar-fill" style="height:' + barH + '%"></div></div><div class="aivos-bar-value">' + day.total + '</div></div>';
      }

      // Disciplinas
      var discHtml = '';
      for (var di = 0; di < Math.min(d.disciplines.length, 8); di++) {
        var disc = d.disciplines[di];
        var cls = disc.isCritical ? 'aivos-disc-critical' : disc.isMastered ? 'aivos-disc-mastered' : '';
        discHtml += '<div class="aivos-disc-row ' + cls + '"><span class="aivos-disc-name">' + disc.name + '</span><div class="aivos-disc-bar"><div class="aivos-disc-fill" style="width:' + disc.accuracy + '%"></div></div><span class="aivos-disc-acc">' + disc.accuracy + '%</span></div>';
      }

      if (d.disciplines.length === 0) {
        discHtml = '<div class="aivos-empty-state">Responda questões para ver seu desempenho por disciplina.</div>';
      }

      // Tempo médio formatado
      var avgTime = d.avgTimeMs < 1000 ? (d.avgTimeMs + 'ms') : (Math.round(d.avgTimeMs / 100) / 10 + 's');

      // Recomendação
      var recHtml = '';
      if (d.nextRecommendation) {
        var rec = d.nextRecommendation;
        recHtml = '<div class="aivos-recommendation-card"><div class="aivos-rec-avatar">' + window.AivosAvatar.html({ size: 'sm', state: 'teaching' }) + '</div><div class="aivos-rec-body"><div class="aivos-rec-name">Prof. AIVOS recomenda</div><div class="aivos-rec-msg">' + rec.message + '</div>' + (rec.action ? '<button class="aivos-rec-btn aivos-coach-btn" onclick="window.AivosCoachIntelligence.followRecommendation(\'' + rec.action.label.replace(/'/g, "\\'") + '\')">' + rec.action.label + '</button>' : '') + '</div></div>';
      }

      // Streak indicator
      var streakHtml = '';
      if (d.streak >= 3) {
        streakHtml = '<div class="aivos-streak-badge"><span>🔥</span> ' + d.streak + ' acertos consecutivos</div>';
      }

      return '\
        <div class="aivos-dashboard">\
          <div class="aivos-dash-header">\
            <div class="aivos-dash-title-row">\
              <h3 class="aivos-dash-title">📊 Dashboard</h3>\
              ' + streakHtml + '\
            </div>\
            <div class="aivos-xp-row">\
              <span class="aivos-xp-label">Nível ' + d.xpLevel + ' · ' + d.xp + ' XP</span>\
              ' + xpBar + '\
              <span class="aivos-xp-next">' + d.xpNext + ' XP</span>\
            </div>\
          </div>\
          <div class="aivos-dash-metrics">\
            <div class="aivos-metric"><span class="aivos-metric-value">' + d.totalQuestions + '</span><span class="aivos-metric-label">Questões</span></div>\
            <div class="aivos-metric"><span class="aivos-metric-value">' + d.accuracy + '%</span><span class="aivos-metric-label">Acertos</span></div>\
            <div class="aivos-metric"><span class="aivos-metric-value">' + avgTime + '</span><span class="aivos-metric-label">Médio</span></div>\
            <div class="aivos-metric"><span class="aivos-metric-value">' + d.masteredCount + '</span><span class="aivos-metric-label">Dominados</span></div>\
            <div class="aivos-metric"><span class="aivos-metric-value">' + d.criticalCount + '</span><span class="aivos-metric-label">Críticos</span></div>\
          </div>\
          <div class="aivos-dash-section">\
            <h4 class="aivos-section-title">📈 Evolução Semanal</h4>\
            <div class="aivos-weekly-grid">' + weeklyHtml + '</div>\
          </div>\
          <div class="aivos-dash-section">\
            <h4 class="aivos-section-title">📚 Disciplinas</h4>\
            <div class="aivos-disc-list">' + discHtml + '</div>\
          </div>\
          <div class="aivos-dash-section">\
            ' + recHtml + '\
          </div>\
        </div>';
    },

    /** Atualiza o dashboard no DOM */
    update: function() {
      var container = getContainer(DASHBOARD_CONTAINER_ID);
      if (!container) return;
      container.innerHTML = this.render();
    }
  };

  /* ══════════════════════════════════════════════════════════════════════════
     COACH CONTEXTUAL ENGINE
     ══════════════════════════════════════════════════════════════════════════ */

  var CoachContextual = {

    /** Mostra o coach com uma mensagem */
    show: function(message, opts) {
      opts = opts || {};
      if (inCooldown() && !opts.force) return;
      setCooldown();

      var container = getContainer(COACH_CONTAINER_ID);
      if (!container) return;

      if (window.AivosCoach && !opts.skipAvatar) {
        var coachState = opts.state || 'teaching';
        var action = opts.action || null;
        window.AivosCoach.render(container, {
          message: message,
          state: coachState,
          action: action
        });
      }

      state.coachVisible = true;
      container.style.display = 'block';

      // Auto-hide após 15s
      if (opts.autoHide !== false) {
        setTimeout(function() {
          CoachContextual.hide();
        }, opts.timeout || 15000);
      }
    },

    /** Esconde o coach */
    hide: function() {
      var container = getContainer(COACH_CONTAINER_ID);
      if (container) {
        container.style.display = 'none';
        container.innerHTML = '';
      }
      state.coachVisible = false;
    },

    /* ── Gatilhos contextuais ── */

    /** Início de sessão */
    onSessionStart: function() {
      var tracker = window.AivosTracker;
      var msg = 'Vamos começar! 🚀 Escolha sua disciplina e dificuldade para gerar questões personalizadas.';
      var opts = { state: 'idle', timeout: 10000 };

      if (tracker) {
        try {
          var s = tracker.getSummary();
          if (s && s.questions > 0) {
            msg = 'Bem-vindo de volta! Você já respondeu **' + s.questions + ' questões** com **' + s.accuracy + '% de acerto**. Vamos continuar de onde parou! 💪';
            if (s.streak >= 3) {
              msg = '🔥 Você está com uma sequência de **' + s.streak + ' acertos**! Continue assim!';
              opts.state = 'celebrating';
            }
          }
        } catch(e) {}
      }

      this.show(msg, opts);
    },

    /** Após resposta correta */
    onCorrectAnswer: function() {
      state.consecutiveCorrect++;
      state.consecutiveWrong = 0;
      state.lastAnswerTime = Date.now();
      addXP(XP_PER_QUESTION + XP_PER_CORRECT_BONUS);

      if (state.consecutiveCorrect >= CONSECUTIVE_CORRECT_THRESHOLD) {
        this.show('🔥 **' + state.consecutiveCorrect + ' acertos consecutivos!** Mandou bem! Continue nesse ritmo!', {
          state: 'celebrating',
          timeout: 5000
        });
      }
    },

    /** Após resposta errada */
    onWrongAnswer: function() {
      state.consecutiveWrong++;
      state.consecutiveCorrect = 0;
      state.lastAnswerTime = Date.now();
      addXP(XP_PER_QUESTION);

      if (state.consecutiveWrong >= CONSECUTIVE_WRONG_THRESHOLD) {
        var msg = '🤔 Notei que você errou algumas seguidas. Que tal revisar o conteúdo antes de continuar? Posso sugerir um tópico para reforçar.';
        this.show(msg, {
          state: 'teaching',
          timeout: 8000,
          action: window.AivosCoach ? { label: 'Sugerir revisão', onClick: function() { try { var rec = Recommendations.generateMessage(); if (rec) { CoachContextual.show(rec.message, { state: rec.state || 'teaching', timeout: 12000, force: true }); } } catch(e) {} } } : null
        });
      }
    },

    /** Inatividade detectada */
    onInactivity: function() {
      var inactiveTime = Date.now() - state.lastAnswerTime;
      if (inactiveTime >= INACTIVITY_THRESHOLD_MS && !state.coachVisible) {
        var minutes = Math.round(inactiveTime / 60000);
        var msg = '⏰ Você está há **' + minutes + ' min** sem responder. Que tal continuar seus estudos?';
        this.show(msg, {
          state: 'teaching',
          timeout: 10000
        });
      }
    },

    /** Sessão concluída */
    onSessionComplete: function(total, correct, wrong) {
      var percent = total > 0 ? Math.round((correct / total) * 100) : 0;
      addXP(XP_PER_SESSION_BONUS);

      if (percent >= 80) {
        this.show('🎯 **Sessão concluída com ' + percent + '% de acerto!** Excelente desempenho! Que tal aumentar a dificuldade na próxima?', {
          state: 'celebrating',
          timeout: 10000,
          force: true
        });
      } else if (percent >= 50) {
        this.show('📊 Sessão concluída! **' + correct + ' acertos** de **' + total + ' questões** (' + percent + '%). ' + (wrong > 0 ? 'Revise os erros para fixar melhor!' : 'Continue praticando!'), {
          state: 'teaching',
          timeout: 10000,
          force: true
        });
      } else {
        this.show('💪 Sessão concluída! Você acertou **' + correct + ' de ' + total + '**. Que tal revisar os conteúdos e tentar novamente?', {
          state: 'teaching',
          timeout: 10000,
          force: true
        });
      }
    },

    /** Meta diária atingida */
    onDailyGoal: function(count, goal) {
      this.show('⭐ **Meta diária atingida!** Você respondeu **' + count + ' questões** hoje! Continue assim! 🎉', {
        state: 'celebrating',
        timeout: 12000,
        force: true
      });
    },

    /** Retorno ao sistema (dia seguinte) */
    onReturnNextDay: function() {
      var s = window.AivosTracker ? window.AivosTracker.getSummary() : null;
      var msg = '📅 **Novo dia de estudos!** ' + (s ? 'Você está com **' + s.questions + ' questões** respondidas no total. Vamos continuar!' : 'Vamos começar mais um dia de estudos! 🚀');
      this.show(msg, {
        state: 'idle',
        timeout: 10000,
        force: true
      });
    },

    /** Mostra recomendação personalizada */
    showRecommendation: function() {
      var rec = Recommendations.generateMessage();
      if (rec) {
        this.show(rec.message, {
          state: rec.state || 'teaching',
          timeout: 12000,
          skipAvatar: true
        });
      }
    }
  };

  /* ══════════════════════════════════════════════════════════════════════════
     MAIN API
     ══════════════════════════════════════════════════════════════════════════ */

  var AivosCoachIntelligence = {

    /** Inicializa o sistema */
    init: function() {
      if (state.initialized) return;
      state.initialized = true;

      // Não inicializar se componentes não existirem
      if (!window.AivosCoach || !window.AivosAvatar) {
        console.warn('[AIVOS Coach] Componentes não disponíveis');
        return;
      }

      console.log('[AIVOS Coach] Inicializando...');

      // Verificar retorno no dia seguinte
      try {
        var lastVisit = safeGet('last_visit', null);
        var today = new Date().toDateString();
        if (lastVisit && lastVisit !== today) {
          setTimeout(function() { CoachContextual.onReturnNextDay(); }, 3000);
        }
        safeSet('last_visit', today);
      } catch(e) {}

      // Dashboard inicial
      setTimeout(function() {
        Dashboard.update();
      }, 500);

      // Iniciar monitor de inatividade
      this.startInactivityMonitor();
    },

    /** Inicia monitor de inatividade */
    startInactivityMonitor: function() {
      if (state.inactivityTimer) clearInterval(state.inactivityTimer);
      state.inactivityTimer = setInterval(function() {
        if (!state.coachVisible) {
          CoachContextual.onInactivity();
        }
      }, 30000); // Verificar a cada 30s
    },

    /** Para monitor de inatividade */
    stopInactivityMonitor: function() {
      if (state.inactivityTimer) {
        clearInterval(state.inactivityTimer);
        state.inactivityTimer = null;
      }
    },

    /* ── Eventos chamados pelo sistema principal ── */

    /** Chamado quando o usuário inicia uma sessão de questões */
    onGenerateStart: function() {
      CoachContextual.hide();
    },

    /** Chamado quando o usuário responde uma questão */
    onAnswer: function(isCorrect) {
      if (isCorrect) {
        CoachContextual.onCorrectAnswer();
      } else {
        CoachContextual.onWrongAnswer();
      }
      // Integracao com Tutor Engine (M2)
      if (window.AivosTutorEngine) {
        try {
          AivosTutorEngine.processResult(isCorrect);
        } catch(e) {}
      }
    },

    /** Chamado quando a sessão é concluída */
    onSessionComplete: function(total, correct, wrong) {
      if (total > 0) {
        CoachContextual.onSessionComplete(total, correct, wrong);
      }
      // Atualizar dashboard
      setTimeout(function() { Dashboard.update(); }, 300);
      // Integracao com Tutor Engine (M2)
      if (window.AivosTutorEngine) {
        try {
          AivosTutorEngine.endSession();
        } catch(e) {}
      }
      // Agendar revisoes para topicos com erro (M3)
      if (window.AivosReviewScheduler && wrong > 0) {
        try {
          var tracker = window.AivosTracker;
          if (tracker) {
            var data = tracker.getAllData();
            var questions = data.questions || [];
            if (questions.length > 0) {
              // Percorrer do fim para o inicio coletando as 'wrong' questoes erradas
              var collected = 0;
              var seenTopics = {};
              for (var qi = questions.length - 1; qi >= 0 && collected < wrong; qi--) {
                var q = questions[qi];
                if (q && q.isCorrect === false) {
                  var topicKey = (q.discipline || 'Geral') + ':' + (q.topic || 'Geral');
                  if (!seenTopics[topicKey]) {
                    seenTopics[topicKey] = true;
                    AivosReviewScheduler.scheduleReview(q.topic || 'Questão', q.discipline || 'Geral');
                  }
                  collected++;
                }
              }
            }
          }
          // Atualizar container de revisoes
          var reviewContainer = document.getElementById('aivos-review-content');
          if (reviewContainer) {
            reviewContainer.innerHTML = '<h3 class="aivos-section-title">Revisoes Pendentes</h3>' + AivosReviewScheduler.renderPending();
          }
          // Notificar coach contextual sobre revisoes (M3)
          if (window.AivosReviewScheduler) {
            try {
              var pendingReviews = AivosReviewScheduler.getPendingReviews();
              if (pendingReviews.length > 0 && pendingReviews.length <= 3) {
                CoachContextual.show('📚 Você tem **' + pendingReviews.length + ' revisão' + (pendingReviews.length > 1 ? 'ões' : '') + ' pendente' + (pendingReviews.length > 1 ? 's' : '') + '**! Reveja os tópicos com erro para fixar o conteúdo.', {
                  state: 'teaching',
                  timeout: 10000
                });
              }
            } catch(e) {}
          }
        } catch(e) {}
      }
      // Gerar mapa mental automaticamente ao final da sessao (M5)
      if (window.AivosMindMapper) {
        try {
          var mindContainer = document.getElementById('aivos-mindmap-content');
          if (mindContainer) {
            var tracker = window.AivosTracker;
            if (tracker) {
              var data = tracker.getAllData();
              var disciplines = Object.keys(data.byDiscipline || {});
              var discToMap = AivosCoachIntelligence._lastSubject || (disciplines.length > 0 ? disciplines[0] : null);
              var svg = AivosMindMapper.renderSVG(discToMap);
              mindContainer.innerHTML = '<h3 class="aivos-section-title">Mapa Mental</h3>' + svg;
            }
          }
        } catch(e) {}
      }
    },

    /** Chamado quando as questões são carregadas */
    onQuestionsLoaded: function() {
      // Coach aparece no início da sessão
      setTimeout(function() {
        CoachContextual.onSessionStart();
      }, 500);
      // Integracao com Tutor Engine (M2) - iniciar sessao
      if (window.AivosTutorEngine) {
        try {
          AivosTutorEngine.startSession();
        } catch(e) {}
      }
    },

    /** Chamado quando o usuário volta ao início */
    onGoHome: function() {
      CoachContextual.hide();
      state.consecutiveCorrect = 0;
      state.consecutiveWrong = 0;
    },

    /** Chamado para mostrar recomendação */
    showRecommendation: function() {
      CoachContextual.showRecommendation();
    },

    /** Segue uma recomendação */
    followRecommendation: function(label) {
      CoachContextual.hide();
      console.log('[AIVOS Coach] Seguindo recomendação: ' + label);
      // Disparar evento para o sistema principal
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('aivosFollowRecommendation', {
          detail: { label: label }
        }));
      }
    },

    /* ── API pública ── */

    getRecommendations: function() {
      return Recommendations.getNextStudy();
    },

    getDashboardData: function() {
      return Dashboard.generateData();
    },

    updateDashboard: function() {
      Dashboard.update();
    },

    getXP: function() {
      return calcXP();
    },

    addXP: function(amount) {
      return addXP(amount);
    },

    showCoach: function(message, opts) {
      CoachContextual.show(message, opts || {});
    },

    hideCoach: function() {
      CoachContextual.hide();
    }
  };

  // Capturar disciplina atual do state global da aplicacao
  AivosCoachIntelligence._lastSubject = null;
  try {
    var origGenerateStart = AivosCoachIntelligence.onGenerateStart;
    if (origGenerateStart) {
      AivosCoachIntelligence.onGenerateStart = function() {
        origGenerateStart();
        if (typeof window.state !== 'undefined') {
          if (window.state.subject) {
            AivosCoachIntelligence._lastSubject = window.state.subject;
          }
          if (window.state.concurso && window.state.concurso.label) {
            AivosCoachIntelligence._lastSubject = window.state.concurso.label;
          }
        }
      };
    }
  } catch(e) {}

  /* ══════════════════════════════════════════════════════════════════════════
     EXPORT (padrão do projeto: window.*)
     ══════════════════════════════════════════════════════════════════════════ */

  window.AivosCoachIntelligence = AivosCoachIntelligence;

})();
