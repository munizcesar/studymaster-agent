/**
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃     STUDYMASTER — AIVOS ROUTE PLANNER (M1)                         ┃
 * ┃                                                                     ┃
 * ┃  Cria plano de estudo semanal personalizado baseado no             ┃
 * ┃  histórico do AivosTracker.                                        ┃
 * ┃                                                                     ┃
 * ┃  Input:  Disciplinas fracas, assuntos críticos, tempo disponível   ┃
 * ┃  Output: Plano de estudos com dias/horários/disciplinas sugeridas  ┃
 * ┃                                                                     ┃
 * ┃  Dependências: AivosTracker, AivosMemory                           ┃
 * ┃  Padrão: IIFE + window.* export                                    ┃
 * ┃                                                                     ┃
 * ┃  USO: <script src="src/aivos-route-planner.js"></script>            ┃
 * ┃                                                                     ┃
 * ┃  Este arquivo é ADITIVO — não modifica nada existente.            ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */
(function() {
  'use strict';

  /* ══════════════════════════════════════════════════════════════════════════
     CONSTANTES
     ══════════════════════════════════════════════════════════════════════════ */

  var STORAGE_PREFIX = 'aivos_planner_';
  var STORAGE_PLAN = STORAGE_PREFIX + 'current_plan';
  var STORAGE_WEEKLY_GOAL = STORAGE_PREFIX + 'weekly_goal';
  var STORAGE_DAILY_AVAIL = STORAGE_PREFIX + 'daily_avail';
  var STORAGE_HISTORY = STORAGE_PREFIX + 'history';

  var MAX_HISTORY = 10;
  var MIN_QUESTIONS_PER_WEAK = 5;

  /* ══════════════════════════════════════════════════════════════════════════
     HELPERS
     ══════════════════════════════════════════════════════════════════════════ */

  function safeRead(key) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function safeWrite(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('[AivosPlanner] Erro ao salvar:', e);
      return false;
    }
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 7);
  }

  function getDayName(n) {
    var days = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    return days[n] || 'dia' + n;
  }

  function formatDate(date) {
    return date.toISOString().slice(0, 10);
  }

  /** Escapa HTML para prevenir XSS */
  function escapeHTML(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ══════════════════════════════════════════════════════════════════════════
     ROUTE PLANNER ENGINE
     ══════════════════════════════════════════════════════════════════════════ */

  var AivosRoutePlanner = {

    // ──────────────────────────────────────────────────────────────────────────
    // CONFIGURAÇÃO DO ALUNO
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Define a meta semanal de questões.
     * @param {number} goal - Número de questões por semana
     */
    setWeeklyGoal: function(goal) {
      safeWrite(STORAGE_WEEKLY_GOAL, { goal: goal, updatedAt: Date.now() });
    },

    /**
     * Retorna a meta semanal atual.
     * @returns {number} Meta semanal (default: 20)
     */
    getWeeklyGoal: function() {
      var stored = safeRead(STORAGE_WEEKLY_GOAL);
      return stored ? stored.goal : 20;
    },

    /**
     * Define disponibilidade diária (minutos por dia da semana).
     * @param {Object} avail - { 0: min, 1: min, ..., 6: min } (0=domingo)
     */
    setDailyAvailability: function(avail) {
      safeWrite(STORAGE_DAILY_AVAIL, avail);
    },

    /**
     * Retorna disponibilidade diária.
     * @returns {Object} { 0: min, ..., 6: min }
     */
    getDailyAvailability: function() {
      var stored = safeRead(STORAGE_DAILY_AVAIL);
      if (stored) return stored;
      // Default: 30min por dia
      var def = {};
      for (var i = 0; i < 7; i++) def[i] = 30;
      return def;
    },

    // ──────────────────────────────────────────────────────────────────────────
    // ANÁLISE DE DESEMPENHO
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Analisa o desempenho do aluno usando AivosTracker.
     * @returns {Object} { disciplines: [...], weakest, strongest, critical, mastered }
     */
    analyzePerformance: function() {
      var tracker = window.AivosTracker;
      if (!tracker) return null;

      try {
        var data = tracker.getAllData();
        var byDisc = data.byDiscipline || {};
        var discNames = Object.keys(byDisc);

        if (discNames.length === 0) return null;

        var disciplines = [];
        for (var i = 0; i < discNames.length; i++) {
          var name = discNames[i];
          var stats = byDisc[name];
          var acc = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
          disciplines.push({
            name: name,
            total: stats.total,
            correct: stats.correct,
            wrong: stats.total - stats.correct,
            accuracy: acc,
            isCritical: acc < 50 && stats.total >= MIN_QUESTIONS_PER_WEAK,
            isMastered: acc >= 80 && stats.total >= 10
          });
        }

        // Ordenar por acurácia (menor primeiro = mais crítica)
        disciplines.sort(function(a, b) { return a.accuracy - b.accuracy; });

        var weakest = disciplines.length > 0 ? disciplines[0] : null;
        var strongest = disciplines.length > 0 ? disciplines[disciplines.length - 1] : null;

        return {
          disciplines: disciplines,
          weakest: weakest,
          strongest: strongest,
          totalQuestions: data.totalQuestions || 0,
          overallAccuracy: data.totalQuestions > 0
            ? Math.round((data.totalCorrect / data.totalQuestions) * 100)
            : 0,
          currentStreak: data.currentStreak || 0,
          bestStreak: data.bestStreak || 0
        };
      } catch (e) {
        console.warn('[AivosPlanner] Erro ao analisar:', e);
        return null;
      }
    },

    // ──────────────────────────────────────────────────────────────────────────
    // GERAÇÃO DO PLANO
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Gera um plano de estudo semanal personalizado.
     * @param {Object} [opts] - Opções opcionais: { weeklyGoal, dailyAvail }
     * @returns {Object} Plano semanal
     */
    generatePlan: function(opts) {
      opts = opts || {};
      var weeklyGoal = opts.weeklyGoal || this.getWeeklyGoal();
      var dailyAvail = opts.dailyAvail || this.getDailyAvailability();
      var analysis = this.analyzePerformance();

      var today = new Date();
      var weekDays = [];
      var totalAllocated = 0;
      var planId = uid();

      // Construir lista de dias da semana (começando hoje)
      for (var d = 0; d < 7; d++) {
        var date = new Date(today);
        date.setDate(today.getDate() + d);
        var dayOfWeek = date.getDay();
        var availMin = dailyAvail[dayOfWeek] || 0;

        if (availMin < 5) continue; // Pular dias sem disponibilidade

        weekDays.push({
          date: formatDate(date),
          dayName: getDayName(dayOfWeek),
          dayOfWeek: dayOfWeek,
          availableMinutes: availMin,
          estimatedQuestions: Math.max(1, Math.round(availMin / 3)), // ~3min por questão
          disciplines: []
        });

        totalAllocated += weekDays[weekDays.length - 1].estimatedQuestions;
      }

      // Distribuir disciplinas pelos dias
      if (analysis && analysis.disciplines.length > 0) {
        var discList = analysis.disciplines;

        // Prioridade: críticas primeiro, depois as demais
        var priorityDiscs = [];
        for (var p = 0; p < discList.length; p++) {
          priorityDiscs.push(discList[p]);
        }

        // Distribuir em round-robin pelos dias
        var discIdx = 0;
        for (var w = 0; w < weekDays.length; w++) {
          var day = weekDays[w];
          var qPerDay = day.estimatedQuestions;
          var remaining = qPerDay;

          while (remaining > 0 && priorityDiscs.length > 0) {
            var disc = priorityDiscs[discIdx % priorityDiscs.length];
            var qForDisc = Math.min(remaining, Math.max(2, Math.round(qPerDay / priorityDiscs.length)));

            day.disciplines.push({
              name: disc.name,
              accuracy: disc.accuracy,
              isCritical: disc.isCritical,
              isMastered: disc.isMastered,
              questions: qForDisc,
              focus: disc.isCritical ? 'reforco' : disc.isMastered ? 'revisao' : 'pratica'
            });

            remaining -= qForDisc;
            discIdx++;
          }
        }
      }

      // Calcular totais
      var totalQuestionsPlanned = 0;
      var uniqueDisciplines = {};
      for (var s = 0; s < weekDays.length; s++) {
        totalQuestionsPlanned += weekDays[s].estimatedQuestions;
        for (var t = 0; t < weekDays[s].disciplines.length; t++) {
          uniqueDisciplines[weekDays[s].disciplines[t].name] = true;
        }
      }

      var plan = {
        id: planId,
        createdAt: Date.now(),
        weekStart: formatDate(today),
        weekEnd: formatDate(new Date(today.getTime() + 6 * 86400000)),
        weeklyGoal: weeklyGoal,
        totalQuestionsPlanned: totalQuestionsPlanned,
        uniqueDisciplines: Object.keys(uniqueDisciplines).length,
        days: weekDays,
        analysis: analysis ? {
          weakestDiscipline: analysis.weakest ? analysis.weakest.name : null,
          strongestDiscipline: analysis.strongest ? analysis.strongest.name : null,
          overallAccuracy: analysis.overallAccuracy,
          currentStreak: analysis.currentStreak,
          bestStreak: analysis.bestStreak,
          criticalCount: analysis.disciplines.filter(function(d) { return d.isCritical; }).length,
          masteredCount: analysis.disciplines.filter(function(d) { return d.isMastered; }).length
        } : null,
        stats: {
          totalSessions: weekDays.length,
          estimatedMinutes: weekDays.reduce(function(sum, day) {
            return sum + (day.availableMinutes || 0);
          }, 0)
        }
      };

      // Salvar como plano atual
      safeWrite(STORAGE_PLAN, plan);

      // Adicionar ao histórico de planos
      var history = safeRead(STORAGE_HISTORY) || [];
      history.push({ id: planId, createdAt: plan.createdAt, weekStart: plan.weekStart, weekEnd: plan.weekEnd });
      if (history.length > MAX_HISTORY) history = history.slice(-MAX_HISTORY);
      safeWrite(STORAGE_HISTORY, history);

      // Persistir no AivosMemory
      if (window.AivosMemory) {
        try {
          AivosMemory.addHistory('milestone', {
            type: 'weekly_plan',
            planId: planId,
            weekStart: plan.weekStart,
            weekEnd: plan.weekEnd,
            totalQuestions: totalQuestionsPlanned,
            disciplines: Object.keys(uniqueDisciplines)
          }, { label: 'Plano semanal gerado' });
        } catch (e) {}
      }

      return plan;
    },

    // ──────────────────────────────────────────────────────────────────────────
    // RECUPERAÇÃO DO PLANO
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Retorna o plano atual (desta semana).
     * @returns {Object|null}
     */
    getCurrentPlan: function() {
      var plan = safeRead(STORAGE_PLAN);
      if (!plan) return null;

      // Verificar se o plano ainda é da semana atual
      var today = formatDate(new Date());
      if (plan.weekEnd < today) return null; // Plano expirou

      return plan;
    },

    /**
     * Retorna o progresso do plano atual.
     * @returns {Object} { completed, total, percent, days: [...] }
     */
    getPlanProgress: function() {
      var plan = this.getCurrentPlan();
      if (!plan) return null;

      var tracker = window.AivosTracker;
      if (!tracker) return { completed: 0, total: plan.totalQuestionsPlanned, percent: 0, days: [] };

      try {
        var data = tracker.getAllData();
        var daily = data.daily || {};
        var completed = 0;
        var dayProgress = [];

        for (var i = 0; i < plan.days.length; i++) {
          var day = plan.days[i];
          var dayData = daily[day.date];
          var dayTotal = dayData ? dayData.total || 0 : 0;
          completed += dayTotal;

          dayProgress.push({
            date: day.date,
            dayName: day.dayName,
            planned: day.estimatedQuestions,
            completed: dayTotal,
            percent: day.estimatedQuestions > 0
              ? Math.min(100, Math.round((dayTotal / day.estimatedQuestions) * 100))
              : 0
          });
        }

        return {
          completed: completed,
          total: plan.totalQuestionsPlanned,
          percent: plan.totalQuestionsPlanned > 0
            ? Math.min(100, Math.round((completed / plan.totalQuestionsPlanned) * 100))
            : 0,
          days: dayProgress,
          streak: plan.analysis ? plan.analysis.currentStreak : 0,
          accuracy: plan.analysis ? plan.analysis.overallAccuracy : 0
        };
      } catch (e) {
        return { completed: 0, total: plan.totalQuestionsPlanned, percent: 0, days: [] };
      }
    },

    // ──────────────────────────────────────────────────────────────────────────
    // RECOMENDAÇÃO DIÁRIA
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Retorna a recomendação de estudo para hoje.
     * @returns {Object|null} { date, dayName, disciplines, estimatedQuestions, completed }
     */
    getTodayRecommendation: function() {
      var plan = this.getCurrentPlan();
      if (!plan) return null;

      var today = formatDate(new Date());

      for (var i = 0; i < plan.days.length; i++) {
        if (plan.days[i].date === today) {
          var day = plan.days[i];
          var tracker = window.AivosTracker;
          var completedToday = 0;

          if (tracker) {
            try {
              var data = tracker.getAllData();
              var daily = data.daily || {};
              var dayData = daily[today];
              completedToday = dayData ? dayData.total || 0 : 0;
            } catch (e) {}
          }

          return {
            date: day.date,
            dayName: day.dayName,
            disciplines: day.disciplines,
            estimatedQuestions: day.estimatedQuestions,
            completed: completedToday,
            remaining: Math.max(0, day.estimatedQuestions - completedToday),
            percent: day.estimatedQuestions > 0
              ? Math.min(100, Math.round((completedToday / day.estimatedQuestions) * 100))
              : 0
          };
        }
      }

      return null;
    },

    // ──────────────────────────────────────────────────────────────────────────
    // RENDER
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Renderiza o plano semanal como HTML.
     * @returns {string} HTML do plano
     */
    renderPlan: function() {
      var plan = this.getCurrentPlan();
      if (!plan) {
        return '<div class="aivos-empty-state">Nenhum plano semanal ativo. Gere um novo plano para começar!</div>';
      }

      var progress = this.getPlanProgress();
      var progressBar = progress
        ? '<div class="aivos-xp-bar"><div class="aivos-xp-fill" style="width:' + progress.percent + '%"></div></div>'
        : '';

      var html = '<div class="aivos-plan-card">';
      html += '<div class="aivos-plan-header">';
      html += '<h3 class="aivos-plan-title">📅 Plano Semanal</h3>';
      html += '<span class="aivos-plan-dates">' + escapeHTML(plan.weekStart) + ' a ' + escapeHTML(plan.weekEnd) + '</span>';
      html += '</div>';

      // Progresso geral
      if (progress) {
        html += '<div class="aivos-plan-progress-row">';
        html += '<span class="aivos-plan-progress-label">' + progress.completed + '/' + progress.total + ' questoes</span>';
        html += '<span class="aivos-plan-progress-pct">' + progress.percent + '%</span>';
        html += '</div>';
        html += progressBar;
      }

      // Dias da semana
      html += '<div class="aivos-plan-days">';
      for (var i = 0; i < plan.days.length; i++) {
        var day = plan.days[i];
        var dayProgress = progress ? progress.days[i] : null;
        var pct = dayProgress ? dayProgress.percent : 0;
        var statusClass = pct >= 100 ? 'aivos-plan-day--done' : pct > 0 ? 'aivos-plan-day--partial' : '';

        html += '<div class="aivos-plan-day ' + statusClass + '">';
        html += '<div class="aivos-plan-day-header">';
        html += '<span class="aivos-plan-day-name">' + escapeHTML(day.dayName) + '</span>';
        html += '<span class="aivos-plan-day-qty">' + day.estimatedQuestions + ' questoes</span>';
        html += '</div>';

        if (day.disciplines.length > 0) {
          html += '<div class="aivos-plan-disciplines">';
          for (var j = 0; j < day.disciplines.length; j++) {
            var disc = day.disciplines[j];
            var cls = disc.isCritical ? 'aivos-plan-disc--critical' : disc.isMastered ? 'aivos-plan-disc--mastered' : '';
            html += '<span class="aivos-plan-disc ' + cls + '">' + escapeHTML(disc.name) + ' (' + disc.questions + 'q, ' + escapeHTML(disc.focus) + ')</span>';
          }
          html += '</div>';
        }

        if (dayProgress && dayProgress.completed > 0) {
          html += '<div class="aivos-plan-day-stats">' + dayProgress.completed + ' respondidas (' + pct + '%)</div>';
        }

        html += '</div>';
      }
      html += '</div>';

      // Resumo
      html += '<div class="aivos-plan-summary">';
      html += '<div class="aivos-plan-metric"><span class="aivos-metric-value">' + plan.uniqueDisciplines + '</span><span class="aivos-metric-label">Disciplinas</span></div>';
      html += '<div class="aivos-plan-metric"><span class="aivos-metric-value">' + plan.stats.totalSessions + '</span><span class="aivos-metric-label">Sessoes</span></div>';
      html += '<div class="aivos-plan-metric"><span class="aivos-metric-value">' + plan.stats.estimatedMinutes + 'min</span><span class="aivos-metric-label">Total</span></div>';
      html += '</div>';

      // Análise
      if (plan.analysis) {
        html += '<div class="aivos-plan-analysis">';
        html += '<h4>📊 Analise de Desempenho</h4>';
        html += '<div class="aivos-plan-analysis-row"><span>Precisao geral</span><strong>' + plan.analysis.overallAccuracy + '%</strong></div>';
        html += '<div class="aivos-plan-analysis-row"><span>Streak atual</span><strong>' + plan.analysis.currentStreak + '</strong></div>';
        if (plan.analysis.weakestDiscipline) {
          html += '<div class="aivos-plan-analysis-row"><span>Foco principal</span><strong>' + escapeHTML(plan.analysis.weakestDiscipline) + '</strong></div>';
        }
        html += '</div>';
      }

      html += '</div>';
      return html;
    },

    // ──────────────────────────────────────────────────────────────────────────
    // API PÚBLICA
    // ──────────────────────────────────────────────────────────────────────────

    generate: function(opts) {
      return this.generatePlan(opts);
    },

    getPlan: function() {
      return this.getCurrentPlan();
    },

    getProgress: function() {
      return this.getPlanProgress();
    },

    getToday: function() {
      return this.getTodayRecommendation();
    },

    render: function() {
      return this.renderPlan();
    },

    analyze: function() {
      return this.analyzePerformance();
    }
  };

  /* ══════════════════════════════════════════════════════════════════════════
     EXPORT
     ══════════════════════════════════════════════════════════════════════════ */

  window.AivosRoutePlanner = AivosRoutePlanner;

  console.log('[AivosPlanner] Modulo carregado.');

})();
