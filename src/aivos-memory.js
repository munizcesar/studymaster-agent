/**
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃     STUDYMASTER — AIVOS MEMORY (Memória do Aluno)                  ┃
 * ┃                                                                     ┃
 * ┃  Sistema de memória persistente para o aluno. Armazena:            ┃
 * ┃  - Histórico de sessões de estudo                                  ┃
 * ┃  - Respostas a questões (para análise posterior)                   ┃
 * ┃  - Progresso geral e marcos                                        ┃
 * ┃  - Estado de continuidade entre sessões                            ┃
 * ┃                                                                     ┃
 * ┃  Armazenamento: localStorage (simples, sem dependências).          ┃
 * ┃  Padrão: IIFE + window.* export (consistente com o projeto).       ┃
 * ┃                                                                     ┃
 * ┃  USO:                                                              ┃
 * ┃    <script src="src/aivos-memory.js"></script>                     ┃
 * ┃    AivosMemory.save('key', data)                                   ┃
 * ┃    AivosMemory.getHistory()                                        ┃
 * ┃                                                                     ┃
 * ┃  Este arquivo é ADITIVO — não modifica nada existente.             ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */
(function() {
  'use strict';

  /* ══════════════════════════════════════════════════════════════════════════
     CONSTANTES
     ══════════════════════════════════════════════════════════════════════════ */

  var STORAGE_PREFIX = 'aivos_mem_';
  var STORAGE_HISTORY = STORAGE_PREFIX + 'history';
  var STORAGE_RESPONSES = STORAGE_PREFIX + 'responses';
  var STORAGE_PROGRESS = STORAGE_PREFIX + 'progress';
  var STORAGE_SESSION = STORAGE_PREFIX + 'session';

  var MAX_HISTORY_ITEMS = 200;
  var MAX_RESPONSES = 500;

  var VALID_TYPES = ['session', 'milestone', 'response', 'note', 'review'];


  /* ══════════════════════════════════════════════════════════════════════════
     HELPERS INTERNOS
     ══════════════════════════════════════════════════════════════════════════ */

  /** Leitura segura do localStorage */
  function safeRead(key) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('[AivosMemory] Erro ao ler "' + key + '":', e);
      return null;
    }
  }

  /** Escrita segura no localStorage */
  function safeWrite(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('[AivosMemory] Erro ao escrever "' + key + '":', e);
      return false;
    }
  }

  /** Gera ID único */
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 7);
  }

  /** Valida tipo */
  function isValidType(type) {
    return VALID_TYPES.indexOf(type) !== -1;
  }


  /* ══════════════════════════════════════════════════════════════════════════
     AIVOS MEMORY
     ══════════════════════════════════════════════════════════════════════════ */

  var AivosMemory = {

    // ──────────────────────────────────────────────────────────────────────────
    // HISTÓRICO GENÉRICO
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Adiciona um item ao histórico cronológico.
     * @param {string} type  - Tipo: 'session'|'milestone'|'response'|'note'|'review'
     * @param {Object} data  - Dados livres do item
     * @param {Object} [meta] - Metadados opcionais (ex: { discipline, topic })
     * @returns {Object} O item criado
     */
    addHistory: function(type, data, meta) {
      if (!isValidType(type)) {
        console.warn('[AivosMemory] Tipo inválido:', type);
        return null;
      }

      var history = safeRead(STORAGE_HISTORY) || [];

      var item = {
        id: uid(),
        type: type,
        data: data || {},
        meta: meta || {},
        timestamp: Date.now()
      };

      history.push(item);

      // Limitar tamanho
      if (history.length > MAX_HISTORY_ITEMS) {
        history = history.slice(-MAX_HISTORY_ITEMS);
      }

      safeWrite(STORAGE_HISTORY, history);
      return item;
    },

    /**
     * Retorna o histórico completo, opcionalmente filtrado por tipo.
     * @param {string} [type] - Filtrar por tipo
     * @param {Object} [opts] - { limit, offset, reverse }
     * @returns {Array}
     */
    getHistory: function(type, opts) {
      opts = opts || {};
      var history = safeRead(STORAGE_HISTORY) || [];

      if (type) {
        history = history.filter(function(item) { return item.type === type; });
      }

      if (opts.reverse !== false) {
        history = history.slice().reverse();
      }

      if (opts.offset) {
        history = history.slice(opts.offset);
      }

      if (opts.limit) {
        history = history.slice(0, opts.limit);
      }

      return history;
    },

    /**
     * Retorna o item mais recente de um tipo.
     * @param {string} type
     * @returns {Object|null}
     */
    getLatest: function(type) {
      var items = this.getHistory(type, { limit: 1 });
      return items.length > 0 ? items[0] : null;
    },

    /**
     * Remove um item do histórico por ID.
     * @param {string} id
     * @returns {boolean}
     */
    removeHistory: function(id) {
      var history = safeRead(STORAGE_HISTORY) || [];
      var index = -1;
      for (var i = 0; i < history.length; i++) {
        if (history[i].id === id) { index = i; break; }
      }
      if (index === -1) return false;
      history.splice(index, 1);
      safeWrite(STORAGE_HISTORY, history);
      return true;
    },

    /**
     * Limpa todo o histórico.
     */
    clearHistory: function() {
      safeWrite(STORAGE_HISTORY, []);
    },

    // ──────────────────────────────────────────────────────────────────────────
    // RESPOSTAS A QUESTÕES
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Registra a resposta a uma questão.
     * @param {Object} response - { questionId, discipline, topic, difficulty, isCorrect, timeToAnswer, answer, expected }
     * @returns {Object} Resposta registrada
     */
    recordResponse: function(response) {
      if (!response || !response.questionId) {
        console.warn('[AivosMemory] Resposta inválida');
        return null;
      }

      var responses = safeRead(STORAGE_RESPONSES) || [];

      var record = {
        id: uid(),
        questionId: response.questionId,
        discipline: response.discipline || 'Geral',
        topic: response.topic || 'Geral',
        difficulty: response.difficulty || 'medium',
        isCorrect: !!response.isCorrect,
        timeToAnswer: typeof response.timeToAnswer === 'number' ? response.timeToAnswer : 0,
        answer: response.answer || null,
        expected: response.expected || null,
        timestamp: Date.now()
      };

      responses.push(record);

      // Limitar tamanho
      if (responses.length > MAX_RESPONSES) {
        responses = responses.slice(-MAX_RESPONSES);
      }

      safeWrite(STORAGE_RESPONSES, responses);

      // Também adicionar ao histórico
      this.addHistory('response', {
        questionId: record.questionId,
        discipline: record.discipline,
        isCorrect: record.isCorrect,
        timeToAnswer: record.timeToAnswer
      }, {
        discipline: record.discipline,
        topic: record.topic
      });

      return record;
    },

    /**
     * Retorna todas as respostas registradas.
     * @param {Object} [opts] - { discipline, limit, offset }
     * @returns {Array}
     */
    getResponses: function(opts) {
      opts = opts || {};
      var responses = safeRead(STORAGE_RESPONSES) || [];

      if (opts.discipline) {
        responses = responses.filter(function(r) {
          return r.discipline === opts.discipline;
        });
      }

      if (opts.reverse !== false) {
        responses = responses.slice().reverse();
      }

      if (opts.offset) {
        responses = responses.slice(opts.offset);
      }

      if (opts.limit) {
        responses = responses.slice(0, opts.limit);
      }

      return responses;
    },

    /**
     * Limpa todas as respostas.
     */
    clearResponses: function() {
      safeWrite(STORAGE_RESPONSES, []);
    },

    // ──────────────────────────────────────────────────────────────────────────
    // PROGRESSO E MARCOS
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Atualiza um contador de progresso.
     * @param {string} key   - Chave do progresso (ex: 'questions.total', 'essays.count')
     * @param {number} value - Valor a incrementar (default 1)
     * @returns {number} Novo valor
     */
    incrementProgress: function(key, value) {
      value = typeof value === 'number' ? value : 1;
      var progress = safeRead(STORAGE_PROGRESS) || {};

      if (!progress[key]) progress[key] = 0;
      progress[key] += value;

      safeWrite(STORAGE_PROGRESS, progress);

      // Se for múltiplo de 10, registrar marco
      if (progress[key] % 10 === 0) {
        this.addHistory('milestone', {
          key: key,
          value: progress[key]
        });
      }

      return progress[key];
    },

    /**
     * Define um valor de progresso (sobrescreve).
     * @param {string} key
     * @param {number} value
     */
    setProgress: function(key, value) {
      var progress = safeRead(STORAGE_PROGRESS) || {};
      progress[key] = value;
      safeWrite(STORAGE_PROGRESS, progress);
    },

    /**
     * Retorna o progresso atual.
     * @param {string} [key] - Chave específica (opcional)
     * @returns {Object|number}
     */
    getProgress: function(key) {
      var progress = safeRead(STORAGE_PROGRESS) || {};
      if (key) return progress[key] || 0;
      return progress;
    },

    /**
     * Reseta o progresso.
     */
    resetProgress: function() {
      safeWrite(STORAGE_PROGRESS, {});
    },

    // ──────────────────────────────────────────────────────────────────────────
    // SESSÃO ATUAL
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Inicia uma nova sessão de estudo.
     * @param {Object} [meta] - Metadados da sessão (ex: { mode, discipline })
     * @returns {Object} Sessão criada
     */
    startSession: function(meta) {
      var session = {
        id: uid(),
        startTime: Date.now(),
        endTime: null,
        duration: 0,
        questionsAnswered: 0,
        correct: 0,
        wrong: 0,
        meta: meta || {}
      };

      safeWrite(STORAGE_SESSION, session);
      return session;
    },

    /**
     * Finaliza a sessão atual.
     * @returns {Object|null} Sessão finalizada
     */
    endSession: function() {
      var session = safeRead(STORAGE_SESSION);
      if (!session) return null;

      session.endTime = Date.now();
      session.duration = session.endTime - session.startTime;

      safeWrite(STORAGE_SESSION, session);

      // Registrar no histórico
      this.addHistory('session', {
        id: session.id,
        duration: session.duration,
        questionsAnswered: session.questionsAnswered,
        correct: session.correct,
        wrong: session.wrong
      }, session.meta);

      return session;
    },

    /**
     * Atualiza contadores da sessão atual.
     * @param {Object} delta - { questionsAnswered, correct, wrong }
     */
    updateSession: function(delta) {
      var session = safeRead(STORAGE_SESSION);
      if (!session) return;

      if (delta.questionsAnswered) session.questionsAnswered += delta.questionsAnswered;
      if (delta.correct) session.correct += delta.correct;
      if (delta.wrong) session.wrong += delta.wrong;

      safeWrite(STORAGE_SESSION, session);
    },

    /**
     * Retorna a sessão atual (se houver).
     * @returns {Object|null}
     */
    getCurrentSession: function() {
      var session = safeRead(STORAGE_SESSION);
      return session;
    },

    // ──────────────────────────────────────────────────────────────────────────
    // ESTADO DE CONTINUIDADE
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Salva um estado para continuidade entre sessões.
     * @param {string} context - Contexto (ex: 'question-flow', 'wizard-step')
     * @param {Object} state   - Estado a salvar
     */
    saveContinuityState: function(context, state) {
      var key = STORAGE_PREFIX + 'continuity_' + context;
      safeWrite(key, {
        state: state,
        timestamp: Date.now()
      });
    },

    /**
     * Carrega um estado de continuidade.
     * @param {string} context
     * @param {number} [maxAge] - Idade máxima em ms (default: 30min)
     * @returns {Object|null} Estado salvo, ou null se expirado
     */
    loadContinuityState: function(context, maxAge) {
      maxAge = maxAge || 1800000; // 30 minutos default
      var key = STORAGE_PREFIX + 'continuity_' + context;
      var saved = safeRead(key);
      if (!saved) return null;

      // Verificar expiração
      if (Date.now() - saved.timestamp > maxAge) {
        localStorage.removeItem(key);
        return null;
      }

      return saved.state;
    },

    /**
     * Remove um estado de continuidade.
     * @param {string} context
     */
    clearContinuityState: function(context) {
      var key = STORAGE_PREFIX + 'continuity_' + context;
      localStorage.removeItem(key);
    },

    // ──────────────────────────────────────────────────────────────────────────
    // UTILITÁRIOS
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Salva um valor arbitrário no namespace do AIVOS Memory.
     * @param {string} key
     * @param {*} value
     */
    save: function(key, value) {
      safeWrite(STORAGE_PREFIX + 'custom_' + key, value);
    },

    /**
     * Carrega um valor arbitrário.
     * @param {string} key
     * @param {*} [defaultValue]
     * @returns {*}
     */
    load: function(key, defaultValue) {
      var value = safeRead(STORAGE_PREFIX + 'custom_' + key);
      return value !== null ? value : defaultValue;
    },

    /**
     * Remove um valor arbitrário.
     * @param {string} key
     */
    remove: function(key) {
      localStorage.removeItem(STORAGE_PREFIX + 'custom_' + key);
    },

    /**
     * Remove todos os dados do AIVOS Memory.
     */
    clearAll: function() {
      var keys = Object.keys(localStorage);
      for (var i = 0; i < keys.length; i++) {
        if (keys[i].indexOf(STORAGE_PREFIX) === 0) {
          localStorage.removeItem(keys[i]);
        }
      }
    },

    /**
     * Retorna estatísticas de uso da memória.
     * @returns {Object}
     */
    getStats: function() {
      var history = safeRead(STORAGE_HISTORY) || [];
      var responses = safeRead(STORAGE_RESPONSES) || [];
      var progress = safeRead(STORAGE_PROGRESS) || {};

      var totalSize = 0;
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k.indexOf(STORAGE_PREFIX) === 0) {
          totalSize += localStorage.getItem(k).length;
        }
      }

      return {
        historyCount: history.length,
        responseCount: responses.length,
        progressKeys: Object.keys(progress).length,
        storageSize: totalSize
      };
    }
  };


  /* ══════════════════════════════════════════════════════════════════════════
     EXPORT (padrão do projeto: window.*)
     ══════════════════════════════════════════════════════════════════════════ */

  window.AivosMemory = AivosMemory;

})();
