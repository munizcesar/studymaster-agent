/**
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃     STUDYMASTER — AIVOS TUTOR ENGINE (M2)                          ┃
 * ┃                                                                     ┃
 * ┃  Adapta dificuldade e tópicos em tempo real durante a sessão.      ┃
 * ┃  Intercepta onAnswer() para decidir a próxima questão.             ┃
 * ┃                                                                     ┃
 * ┃  Lógica: se acurácia > 80% nas últimas 5 → aumentar dificuldade   ┃
 * ┃          se acurácia < 40% nas últimas 5 → revisar tópico anterior ┃
 * ┃                                                                     ┃
 * ┃  Dependências: AivosTracker, AivosCoachIntelligence                ┃
 * ┃                                                                     ┃
 * ┃  USO: <script src="src/aivos-tutor-engine.js"></script>             ┃
 * ┃                                                                     ┃
 * ┃  Este arquivo é ADITIVO — não modifica nada existente.            ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */
(function() {
  'use strict';

  var STORAGE_PREFIX = 'aivos_tutor_';
  var STORAGE_STATE = STORAGE_PREFIX + 'state';

  var WINDOW_SIZE = 5;
  var ACC_HIGH_THRESHOLD = 80;
  var ACC_LOW_THRESHOLD = 40;

  var DIFFICULTIES = ['easy', 'medium', 'hard', 'extreme'];

  var state = {
    recentResults: [],
    currentDifficulty: 'medium',
    adaptHistory: [],
    sessionActive: false
  };

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_STATE);
      if (raw) {
        var saved = JSON.parse(raw);
        state.recentResults = saved.recentResults || [];
        state.currentDifficulty = saved.currentDifficulty || 'medium';
        state.adaptHistory = saved.adaptHistory || [];
      }
    } catch(e) {}
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_STATE, JSON.stringify({
        recentResults: state.recentResults,
        currentDifficulty: state.currentDifficulty,
        adaptHistory: state.adaptHistory
      }));
    } catch(e) {}
  }

  function getNextDifficulty(current, trend) {
    var idx = DIFFICULTIES.indexOf(current);
    if (idx === -1) idx = 1;
    if (trend === 'up' && idx < DIFFICULTIES.length - 1) return DIFFICULTIES[idx + 1];
    if (trend === 'down' && idx > 0) return DIFFICULTIES[idx - 1];
    return current;
  }

  /** Calcula acurácia das últimas N questões */
  function getRecentAccuracy() {
    if (state.recentResults.length === 0) return -1;
    var correct = state.recentResults.filter(function(r) { return r; }).length;
    return Math.round((correct / state.recentResults.length) * 100);
  }

  var AivosTutorEngine = {

    /** Inicia sessão de tutoria */
    startSession: function() {
      loadState();
      state.sessionActive = true;
      state.recentResults = [];
      saveState();
      return { difficulty: state.currentDifficulty };
    },

    /** Finaliza sessão de tutoria */
    endSession: function() {
      state.sessionActive = false;
      saveState();
    },

    /** Processa resultado de uma questão e retorna recomendação */
    processResult: function(isCorrect, questionData) {
      if (!state.sessionActive) return null;

      state.recentResults.push(isCorrect);
      if (state.recentResults.length > WINDOW_SIZE) {
        state.recentResults = state.recentResults.slice(-WINDOW_SIZE);
      }

      var accuracy = getRecentAccuracy();
      var recommendation = null;

      if (accuracy >= ACC_HIGH_THRESHOLD && state.recentResults.length >= WINDOW_SIZE) {
        var newDiff = getNextDifficulty(state.currentDifficulty, 'up');
        if (newDiff !== state.currentDifficulty) {
          recommendation = {
            type: 'increase_difficulty',
            from: state.currentDifficulty,
            to: newDiff,
            reason: 'Acuracia ' + accuracy + '% nas ultimas ' + WINDOW_SIZE + ' questoes'
          };
          state.adaptHistory.push(recommendation);
          state.currentDifficulty = newDiff;
        }
      }

      if (accuracy < ACC_LOW_THRESHOLD && state.recentResults.length >= 3) {
        recommendation = {
          type: 'review_needed',
          from: state.currentDifficulty,
          to: getNextDifficulty(state.currentDifficulty, 'down'),
          reason: 'Acuracia ' + accuracy + '% nas ultimas ' + state.recentResults.length + ' questoes'
        };
        state.adaptHistory.push(recommendation);
        state.currentDifficulty = getNextDifficulty(state.currentDifficulty, 'down');
      }

      saveState();
      return {
        accuracy: accuracy,
        currentDifficulty: state.currentDifficulty,
        windowSize: state.recentResults.length,
        recommendation: recommendation
      };
    },

    /** Retorna dificuldade recomendada para a próxima questão */
    getRecommendedDifficulty: function() {
      return state.currentDifficulty;
    },

    /** Retorna estatísticas da sessão de tutoria */
    getSessionStats: function() {
      var accuracy = getRecentAccuracy();
      return {
        recentResults: state.recentResults.length,
        accuracy: accuracy,
        currentDifficulty: state.currentDifficulty,
        adaptations: state.adaptHistory.length,
        sessionActive: state.sessionActive
      };
    },

    /** Reseta o estado do tutor */
    reset: function() {
      state.recentResults = [];
      state.currentDifficulty = 'medium';
      state.adaptHistory = [];
      state.sessionActive = false;
      saveState();
    }
  };

  window.AivosTutorEngine = AivosTutorEngine;

})();
