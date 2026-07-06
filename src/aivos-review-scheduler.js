/**
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃     STUDYMASTER — AIVOS REVIEW SCHEDULER (M3)                      ┃
 * ┃                                                                     ┃
 * ┃  Agendador de revisões usando curva de esquecimento (Ebbinghaus).  ┃
 * ┃  Revisões: 1h, 24h, 7d, 30d após o primeiro contato.             ┃
 * ┃                                                                     ┃
 * ┃  Dependências: AivosMemory                                         ┃
 * ┃                                                                     ┃
 * ┃  USO: <script src="src/aivos-review-scheduler.js"></script>         ┃
 * ┃                                                                     ┃
 * ┃  Este arquivo é ADITIVO — não modifica nada existente.            ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */
(function() {
  'use strict';

  var STORAGE_PREFIX = 'aivos_review_';
  var STORAGE_ITEMS = STORAGE_PREFIX + 'items';
  var STORAGE_CHECKED = STORAGE_PREFIX + 'checked';

  var INTERVALS_MS = [
    3600000,      // 1 hora
    86400000,     // 24 horas
    604800000,    // 7 dias
    2592000000    // 30 dias
  ];

  var INTERVAL_LABELS = ['1h', '24h', '7d', '30d'];

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 7);
  }

  function safeRead(key) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch(e) { return null; }
  }

  function safeWrite(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); return true; } catch(e) { return false; }
  }

  function now() { return Date.now(); }

  var AivosReviewScheduler = {

    /** Agenda uma revisão para um tópico */
    scheduleReview: function(topic, discipline) {
      var items = safeRead(STORAGE_ITEMS) || [];
      var checked = safeRead(STORAGE_CHECKED) || {};

      var item = {
        id: uid(),
        topic: topic || 'Geral',
        discipline: discipline || 'Geral',
        createdAt: now(),
        nextReviewAt: now() + INTERVALS_MS[0],
        currentInterval: 0,
        intervals: INTERVAL_MS,
        completed: false
      };

      items.push(item);
      safeWrite(STORAGE_ITEMS, items);

      if (window.AivosMemory) {
        try {
          AivosMemory.addHistory('review', {
            topic: item.topic,
            discipline: item.discipline,
            reviewId: item.id,
            nextReview: new Date(item.nextReviewAt).toISOString()
          }, { label: 'Revisao agendada: ' + item.topic });
        } catch(e) {}
      }

      return item;
    },

    /** Marca uma revisão como concluída e agenda a próxima */
    completeReview: function(reviewId) {
      var items = safeRead(STORAGE_ITEMS) || [];
      for (var i = 0; i < items.length; i++) {
        if (items[i].id === reviewId) {
          var item = items[i];
          item.currentInterval++;
          if (item.currentInterval >= INTERVALS_MS.length) {
            item.completed = true;
            item.nextReviewAt = null;
          } else {
            item.nextReviewAt = now() + INTERVALS_MS[item.currentInterval];
          }
          item.updatedAt = now();
          safeWrite(STORAGE_ITEMS, items);
          return item;
        }
      }
      return null;
    },

    /** Retorna revisões pendentes (atrasadas ou próximas) */
    getPendingReviews: function() {
      var items = safeRead(STORAGE_ITEMS) || [];
      var nowTime = now();
      var pending = [];

      for (var i = 0; i < items.length; i++) {
        if (items[i].completed) continue;
        if (items[i].nextReviewAt && items[i].nextReviewAt <= nowTime) {
          pending.push(items[i]);
        }
      }

      return pending;
    },

    /** Retorna revisões agendadas para as próximas horas */
    getUpcomingReviews: function(hours) {
      hours = hours || 24;
      var items = safeRead(STORAGE_ITEMS) || [];
      var nowTime = now();
      var limit = nowTime + (hours * 3600000);
      var upcoming = [];

      for (var i = 0; i < items.length; i++) {
        if (items[i].completed) continue;
        if (items[i].nextReviewAt && items[i].nextReviewAt <= limit) {
          upcoming.push(items[i]);
        }
      }

      return upcoming;
    },

    /** Retorna todas as revisões */
    getAllReviews: function() {
      return safeRead(STORAGE_ITEMS) || [];
    },

    /** Retorna estatísticas de revisão */
    getStats: function() {
      var items = safeRead(STORAGE_ITEMS) || [];
      var total = items.length;
      var completed = items.filter(function(i) { return i.completed; }).length;
      var pending = items.filter(function(i) { return !i.completed; }).length;
      var overdue = this.getPendingReviews().length;
      return { total: total, completed: completed, pending: pending, overdue: overdue };
    },

    /** Renderiza lista de revisões pendentes como HTML */
    renderPending: function() {
      var pending = this.getPendingReviews();
      if (pending.length === 0) {
        return '<div class="aivos-empty-state">Nenhuma revisao pendente.</div>';
      }
      var html = '<div class="aivos-review-list">';
      for (var i = 0; i < pending.length; i++) {
        var r = pending[i];
        var safeId = r.id.replace(/'/g, "\\'");
        html += '<div class="aivos-review-item">';
        html += '<div class="aivos-review-info"><strong>' + this._escape(r.topic) + '</strong>';
        html += '<span class="aivos-review-meta">' + this._escape(r.discipline) + ' · intervalo ' + INTERVAL_LABELS[r.currentInterval] + '</span></div>';
        html += '<button class="aivos-review-btn" onclick="window.AivosReviewScheduler.completeReview(\'' + safeId + '\');var p=this.parentElement;p.style.opacity=\'0.5\';setTimeout(function(){p.style.display=\'none\';var c=document.getElementById(\'aivos-review-content\');if(c){c.innerHTML=\'<h3 class=\\"aivos-section-title\\">Revisoes Pendentes</h3>\'+window.AivosReviewScheduler.renderPending();}},300);">Concluir</button>';
        html += '</div>';
      }
      html += '</div>';
      return html;
    },

    _escape: function(s) {
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
  };

  window.AivosReviewScheduler = AivosReviewScheduler;

})();
