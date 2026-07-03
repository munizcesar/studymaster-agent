/**
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃     STUDYMASTER — AIVOS TRACKER (Rastreamento de Uso)              ┃
 * ┃                                                                     ┃
 * ┃  Sistema de tracking de desempenho do aluno. Coleta:               ┃
 * ┃  - Tempo médio por questão (total e por disciplina)                ┃
 * ┃  - Taxa de acertos ao longo do tempo (evolução)                   ┃
 * ┃  - Sessões de estudo (duração, questões, performance)              ┃
 * ┃  - Estatísticas consolidadas por disciplina, dificuldade, período  ┃
 * ┃                                                                     ┃
 * ┃  Armazenamento: localStorage (simples, sem dependências).          ┃
 * ┃  Padrão: IIFE + window.* export (consistente com o projeto).       ┃
 * ┃                                                                     ┃
 * ┃  USO:                                                              ┃
 * ┃    <script src="src/aivos-tracker.js"></script>                    ┃
 * ┃    AivosTracker.logQuestion({ ... })                               ┃
 * ┃    AivosTracker.getSummary()                                       ┃
 * ┃                                                                     ┃
 * ┃  Este arquivo é ADITIVO — não modifica nada existente.             ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */
(function() {
  'use strict';

  /* ══════════════════════════════════════════════════════════════════════════
     CONSTANTES
     ══════════════════════════════════════════════════════════════════════════ */

  var STORAGE_KEY = 'aivos_tracker_data';
  var MAX_LOG_ENTRIES = 1000;
  var MAX_DAILY_ENTRIES = 200;

  var DIFFICULTIES = ['easy', 'medium', 'hard', 'extreme'];


  /* ══════════════════════════════════════════════════════════════════════════
     HELPERS INTERNOS
     ══════════════════════════════════════════════════════════════════════════ */

  function safeRead() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('[AivosTracker] Erro ao ler dados:', e);
      return null;
    }
  }

  function safeWrite(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('[AivosTracker] Erro ao escrever dados:', e);
      return false;
    }
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 7);
  }

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  function daysAgo(n) {
    var d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  }

  /** Estrutura de dados inicial */
  function createEmptyData() {
    return {
      questions: [],        // Log de questões respondidas
      sessions: [],         // Sessões de estudo
      daily: {},            // Agregado por dia (ex: { '2026-07-02': { correct, wrong, time, ... } })
      evolution: [],        // Snapshot de evolução (um por sessão ou a cada 10 questões)
      byDiscipline: {},     // Agregado por disciplina
      byDifficulty: {},     // Agregado por dificuldade
      totalQuestions: 0,
      totalCorrect: 0,
      totalWrong: 0,
      totalTime: 0,
      currentStreak: 0,
      bestStreak: 0,
      lastCorrect: null,    // timestamp da última resposta correta (para streak)
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }


  /* ══════════════════════════════════════════════════════════════════════════
     AIVOS TRACKER
     ══════════════════════════════════════════════════════════════════════════ */

  var AivosTracker = {

    // ──────────────────────────────────────────────────────────────────────────
    // REGISTRO DE QUESTÃO
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Registra a resposta a uma questão e atualiza estatísticas.
     * @param {Object} entry - { discipline, topic, difficulty, isCorrect, timeToAnswer }
     * @returns {Object} Estatísticas atualizadas
     */
    logQuestion: function(entry) {
      if (!entry) return null;

      var data = safeRead() || createEmptyData();

      var record = {
        id: uid(),
        discipline: entry.discipline || 'Geral',
        topic: entry.topic || 'Geral',
        difficulty: entry.difficulty || 'medium',
        isCorrect: !!entry.isCorrect,
        timeToAnswer: typeof entry.timeToAnswer === 'number' ? entry.timeToAnswer : 0,
        timestamp: Date.now(),
        date: todayStr()
      };

      // Adicionar ao log
      data.questions.push(record);
      if (data.questions.length > MAX_LOG_ENTRIES) {
        data.questions = data.questions.slice(-MAX_LOG_ENTRIES);
      }

      // Totais globais
      data.totalQuestions++;
      if (record.isCorrect) {
        data.totalCorrect++;
      } else {
        data.totalWrong++;
      }
      data.totalTime += record.timeToAnswer;
      data.updatedAt = Date.now();

      // Streak
      if (record.isCorrect) {
        data.currentStreak++;
        if (data.currentStreak > data.bestStreak) data.bestStreak = data.currentStreak;
        data.lastCorrect = Date.now();
      } else {
        data.currentStreak = 0;
      }

      // Por disciplina
      if (!data.byDiscipline[record.discipline]) {
        data.byDiscipline[record.discipline] = { total: 0, correct: 0, wrong: 0, time: 0 };
      }
      data.byDiscipline[record.discipline].total++;
      data.byDiscipline[record.discipline].correct += record.isCorrect ? 1 : 0;
      data.byDiscipline[record.discipline].wrong += record.isCorrect ? 0 : 1;
      data.byDiscipline[record.discipline].time += record.timeToAnswer;

      // Por dificuldade
      if (DIFFICULTIES.indexOf(record.difficulty) !== -1) {
        if (!data.byDifficulty[record.difficulty]) {
          data.byDifficulty[record.difficulty] = { total: 0, correct: 0, wrong: 0 };
        }
        data.byDifficulty[record.difficulty].total++;
        data.byDifficulty[record.difficulty].correct += record.isCorrect ? 1 : 0;
        data.byDifficulty[record.difficulty].wrong += record.isCorrect ? 0 : 1;
      }

      // Agregado diário
      var day = record.date;
      if (!data.daily[day]) {
        data.daily[day] = { total: 0, correct: 0, wrong: 0, time: 0 };
      }
      data.daily[day].total++;
      data.daily[day].correct += record.isCorrect ? 1 : 0;
      data.daily[day].wrong += record.isCorrect ? 0 : 1;
      data.daily[day].time += record.timeToAnswer;

      // Limitar daily a 30 dias
      var dayKeys = Object.keys(data.daily).sort();
      if (dayKeys.length > 30) {
        var toRemove = dayKeys.slice(0, dayKeys.length - 30);
        for (var i = 0; i < toRemove.length; i++) {
          delete data.daily[toRemove[i]];
        }
      }

      // Snapshot de evolução a cada 10 questões
      if (data.totalQuestions % 10 === 0) {
        data.evolution.push({
          at: data.totalQuestions,
          correct: data.totalCorrect,
          wrong: data.totalWrong,
          accuracy: data.totalQuestions > 0
            ? Math.round((data.totalCorrect / data.totalQuestions) * 100)
            : 0,
          timestamp: Date.now()
        });
        // Limitar crescimento do histórico de evolução
        if (data.evolution.length > 100) {
          data.evolution = data.evolution.slice(-100);
        }
      }

      safeWrite(data);
      return this.getStats(data);
    },

    // ──────────────────────────────────────────────────────────────────────────
    // SESSÃO DE ESTUDO
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Registra uma sessão de estudo completa.
     * @param {Object} session - { startTime, endTime, questionsAnswered, correct, wrong, discipline }
     * @returns {Object} Sessão registrada
     */
    logSession: function(session) {
      if (!session) return null;

      var data = safeRead() || createEmptyData();

      var record = {
        id: uid(),
        startTime: session.startTime || Date.now(),
        endTime: session.endTime || Date.now(),
        duration: (session.endTime || Date.now()) - (session.startTime || Date.now()),
        questionsAnswered: session.questionsAnswered || 0,
        correct: session.correct || 0,
        wrong: session.wrong || 0,
        discipline: session.discipline || null,
        date: todayStr()
      };

      data.sessions.push(record);

      // Limitar a 50 sessões
      if (data.sessions.length > 50) {
        data.sessions = data.sessions.slice(-50);
      }

      // Snapshot de evolução pós-sessão
      data.evolution.push({
        at: data.totalQuestions,
        correct: data.totalCorrect,
        wrong: data.totalWrong,
        accuracy: data.totalQuestions > 0
          ? Math.round((data.totalCorrect / data.totalQuestions) * 100)
          : 0,
        sessionDuration: record.duration,
        timestamp: Date.now()
      });

      safeWrite(data);
      return record;
    },

    // ──────────────────────────────────────────────────────────────────────────
    // ESTATÍSTICAS
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Retorna um resumo completo das estatísticas atuais.
     * @param {Object} [data] - Dados internos (opcional, para evitar re-leitura)
     * @returns {Object}
     */
    getStats: function(data) {
      data = data || safeRead() || createEmptyData();

      var accuracy = data.totalQuestions > 0
        ? Math.round((data.totalCorrect / data.totalQuestions) * 100)
        : 0;

      var avgTime = data.totalQuestions > 0
        ? Math.round(data.totalTime / data.totalQuestions)
        : 0;

      return {
        total: {
          questions: data.totalQuestions,
          correct: data.totalCorrect,
          wrong: data.totalWrong,
          accuracy: accuracy,
          avgTimeMs: avgTime,
          totalTimeMs: data.totalTime
        },
        streak: {
          current: data.currentStreak,
          best: data.bestStreak
        },
        sessions: {
          count: data.sessions.length,
          lastSession: data.sessions.length > 0
            ? data.sessions[data.sessions.length - 1]
            : null
        },
          evolution: data.evolution
      };
    },

    /**
     * Retorna resumo simplificado (para exibição rápida).
     * @returns {Object}
     */
    getSummary: function() {
      var data = safeRead() || createEmptyData();
      var stats = this.getStats(data);

      return {
        label: stats.total.questions + ' questões · ' + stats.total.accuracy + '% acerto',
        questions: stats.total.questions,
        accuracy: stats.total.accuracy,
        streak: stats.streak.current,
        sessions: stats.sessions.count
      };
    },

    /**
     * Retorna estatísticas por disciplina.
     * @param {string} [discipline] - Filtrar por disciplina (opcional)
     * @returns {Object}
     */
    getByDiscipline: function(discipline) {
      var data = safeRead() || createEmptyData();
      var byDisc = data.byDiscipline || {};

      if (discipline) {
        var d = byDisc[discipline];
        return d ? {
          discipline: discipline,
          total: d.total,
          correct: d.correct,
          wrong: d.wrong,
          accuracy: d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0,
          avgTimeMs: d.total > 0 ? Math.round(d.time / d.total) : 0
        } : null;
      }

      var result = {};
      var keys = Object.keys(byDisc);
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        var v = byDisc[k];
        result[k] = {
          total: v.total,
          correct: v.correct,
          wrong: v.wrong,
          accuracy: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0,
          avgTimeMs: v.total > 0 ? Math.round(v.time / v.total) : 0
        };
      }
      return result;
    },

    /**
     * Retorna estatísticas por dificuldade.
     * @returns {Object}
     */
    getByDifficulty: function() {
      var data = safeRead() || createEmptyData();
      var byDiff = data.byDifficulty || {};
      var result = {};

      for (var i = 0; i < DIFFICULTIES.length; i++) {
        var d = DIFFICULTIES[i];
        var v = byDiff[d];
        result[d] = v ? {
          total: v.total,
          correct: v.correct,
          wrong: v.wrong,
          accuracy: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0
        } : { total: 0, correct: 0, wrong: 0, accuracy: 0 };
      }
      return result;
    },

    /**
     * Retorna a evolução da taxa de acertos ao longo do tempo.
     * @param {number} [limit] - Máximo de pontos (default: 20)
     * @returns {Array}
     */
    getEvolution: function(limit) {
      limit = limit || 20;
      var data = safeRead() || createEmptyData();
      var evolution = data.evolution || [];
      return evolution.slice(-limit);
    },

    /**
     * Retorna os dados diários dos últimos N dias.
     * @param {number} [days] - Dias (default: 7)
     * @returns {Array}
     */
    getDailyStats: function(days) {
      days = days || 7;
      var data = safeRead() || createEmptyData();
      var result = [];

      for (var i = days - 1; i >= 0; i--) {
        var day = daysAgo(i);
        var d = data.daily[day];
        result.push({
          date: day,
          total: d ? d.total : 0,
          correct: d ? d.correct : 0,
          wrong: d ? d.wrong : 0,
          time: d ? d.time : 0,
          accuracy: d && d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0
        });
      }

      return result;
    },

    // ──────────────────────────────────────────────────────────────────────────
    // UTILITÁRIOS
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Retorna todos os dados brutos do tracker.
     * @returns {Object}
     */
    getAllData: function() {
      return safeRead() || createEmptyData();
    },

    /**
     * Reseta todos os dados do tracker.
     */
    resetAll: function() {
      safeWrite(createEmptyData());
    },

    /**
     * Retorna o tamanho dos dados armazenados.
     * @returns {number} Bytes aproximados
     */
    getStorageSize: function() {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        return raw ? raw.length : 0;
      } catch (e) {
        return 0;
      }
    }
  };


  /* ══════════════════════════════════════════════════════════════════════════
     EXPORT (padrão do projeto: window.*)
     ══════════════════════════════════════════════════════════════════════════ */

  window.AivosTracker = AivosTracker;

})();
