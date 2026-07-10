/**
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃     STUDYMASTER — AIVOS CHARACTER SYSTEM                         ┃
 * ┃                                                                  ┃
 * ┃  Sistema único do mascote AIVOS com estados, poses, acessórios   ┃
 * ┃  e API compatível com os módulos legados do projeto.             ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */

(function() {
  'use strict';

  var AVATAR_SIZES = ['sm', 'md', 'lg', 'xl'];
  var AVATAR_STATES = [
    'idle',
    'thinking',
    'explaining',
    'motivating',
    'celebrating',
    'analyzing',
    'waiting',
    'pointing',
    'happy',
    'error',
    'attention'
  ];

  var STATE_ALIASES = {
    teaching: 'explaining',
    processing: 'analyzing',
    success: 'celebrating',
    focus: 'thinking',
    warning: 'attention'
  };

  var STATE_LABELS = {
    idle: 'AIVOS aguardando',
    thinking: 'AIVOS pensando',
    explaining: 'AIVOS explicando',
    motivating: 'AIVOS motivando',
    celebrating: 'AIVOS comemorando',
    analyzing: 'AIVOS analisando',
    waiting: 'AIVOS aguardando',
    pointing: 'AIVOS apontando',
    happy: 'AIVOS feliz',
    error: 'AIVOS em erro',
    attention: 'AIVOS em atenção'
  };

  var STATE_DEFAULT_ACCESSORIES = {
    idle: 'none',
    thinking: 'none',
    explaining: 'book',
    motivating: 'none',
    celebrating: 'none',
    analyzing: 'chart',
    waiting: 'tablet',
    pointing: 'pointer',
    happy: 'none',
    error: 'none',
    attention: 'none'
  };

  var ACCESSORIES = ['none', 'book', 'laptop', 'tablet', 'chart', 'pointer'];
  var BUBBLE_TYPES = ['info', 'success', 'warning', 'error'];
  var AVATAR_UID = 0;

  function getElement(el) {
    if (typeof el === 'string') return document.querySelector(el);
    if (el && el.nodeType === 1) return el;
    return null;
  }

  function assertIn(value, validSet, label) {
    if (validSet.indexOf(value) === -1) {
      console.warn('[AIVOS Char] ' + label + ' inválido: "' + value + '". Usando fallback.');
      return false;
    }
    return true;
  }

  function normalizeState(state) {
    var next = state || 'idle';
    if (STATE_ALIASES[next]) next = STATE_ALIASES[next];
    if (!assertIn(next, AVATAR_STATES, 'Estado')) return 'idle';
    return next;
  }

  function normalizePose(pose, state) {
    var next = pose || state || 'idle';
    if (STATE_ALIASES[next]) next = STATE_ALIASES[next];
    if (!assertIn(next, AVATAR_STATES, 'Pose')) return state || 'idle';
    return next;
  }

  function normalizeAccessory(accessory, state) {
    var next = accessory;
    if (!next) next = STATE_DEFAULT_ACCESSORIES[state] || 'none';
    if (!assertIn(next, ACCESSORIES, 'Acessório')) return 'none';
    return next;
  }

  function normalizeOptions(opts) {
    opts = opts || {};
    var state = normalizeState(opts.state);
    var pose = normalizePose(opts.pose, state);
    return {
      size: assertIn(opts.size || 'md', AVATAR_SIZES, 'Tamanho') ? (opts.size || 'md') : 'md',
      state: state,
      pose: pose,
      accessory: normalizeAccessory(opts.accessory, state),
      trackPointer: !!opts.trackPointer
    };
  }

  function avatarUid() {
    AVATAR_UID += 1;
    return 'aivos-avatar-' + AVATAR_UID + '-' + Math.random().toString(36).slice(2, 7);
  }

  function esc(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /* ══════════════════════════════════════════════════════════════════════════
     ⚠️  AIVOS AVATAR (LEGADO) — REMOVIDO
     Todo o sistema de renderização SVG antigo foi removido.
     O mascote agora é renderizado exclusivamente via AivoAPI.render()
     usando a instância única do AivoPresence.
     ══════════════════════════════════════════════════════════════════════════ */

  /* ══════════════════════════════════════════════════════════════════════════
     AIVOS COACH — Card contextual com avatar + mensagem
     ══════════════════════════════════════════════════════════════════════════ */

  var AivosCoach = {
    render: function(container, opts) {
      opts = opts || {};
      var el = getElement(container);
      if (!el) return;

      var message = opts.message || '';
      var state = normalizeState(opts.state || 'explaining');
      var action = opts.action || null;

      var aivoState = 'idle';
      if (state === 'teaching' || state === 'explaining') aivoState = 'speaking';
      if (state === 'waiting') aivoState = 'idle';
      if (state === 'warning') aivoState = 'concerned';

      var actionHtml = action
        ? '<button class="aivos-coach-btn" data-aivos-action="true">' + esc(action.label || 'Continuar') + '</button>'
        : '';

      el.innerHTML =
        '<div class="aivos-coach" role="status" aria-live="polite">' +
          '<div class="aivos-coach-avatar" id="aivos-coach-avatar"></div>' +
          '<div class="aivos-coach-body">' +
            '<div class="aivos-coach-name">AIVO</div>' +
            '<div class="aivos-coach-message">' + message + '</div>' +
            (actionHtml ? '<div class="aivos-coach-action">' + actionHtml + '</div>' : '') +
          '</div>' +
        '</div>';

      /* Render new Aivo mascot in coach avatar */
      var coachAvatar = el.querySelector('#aivos-coach-avatar');
      if (coachAvatar && window.AivoAPI) {
        window.AivoAPI.render(coachAvatar, { size: 40, state: aivoState });
      }

      if (action && action.onClick) {
        var btn = el.querySelector('[data-aivos-action]');
        if (btn) {
          btn.addEventListener('click', function(e) {
            action.onClick(e);
          });
        }
      }
    }
  };

  /* ══════════════════════════════════════════════════════════════════════════
     AIVOS BUBBLE — Notificação flutuante
     ══════════════════════════════════════════════════════════════════════════ */

  var AivosBubble = {
    show: function(opts) {
      opts = opts || {};
      var text = opts.text || '';
      var type = opts.type || 'info';
      var autoHide = opts.autoHide !== undefined ? opts.autoHide : 5000;
      if (!assertIn(type, BUBBLE_TYPES, 'Tipo')) type = 'info';

      var existing = document.querySelectorAll('.aivos-bubble');
      existing.forEach(function(bubble) { bubble.remove(); });

      var bubble = document.createElement('div');
      bubble.className = 'aivos-bubble aivos-bubble--' + type;
      bubble.setAttribute('role', 'alert');
      bubble.setAttribute('aria-live', 'assertive');
      bubble.innerHTML =
        '<div class="aivos-bubble-avatar" id="aivos-bubble-avatar"></div>' +
        '<div class="aivos-bubble-text">' + text + '</div>' +
        '<button class="aivos-bubble-close" aria-label="Fechar">&times;</button>';

      /* Render new Aivo mascot in bubble avatar */
      var bubbleAvatar = bubble.querySelector('#aivos-bubble-avatar');
      if (bubbleAvatar && window.AivoAPI) {
        window.AivoAPI.render(bubbleAvatar, { size: 32, state: 'idle' });
      }

      document.body.appendChild(bubble);

      var closeBtn = bubble.querySelector('.aivos-bubble-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          AivosBubble.dismiss(bubble);
        });
      }

      if (opts.onClick) {
        bubble.addEventListener('click', function(e) {
          if (e.target.closest('.aivos-bubble-close')) return;
          opts.onClick(e);
        });
      }

      if (autoHide > 0) {
        setTimeout(function() {
          if (bubble.parentNode) AivosBubble.dismiss(bubble);
        }, autoHide);
      }

      return bubble;
    },

    dismiss: function(bubble) {
      if (!bubble || !bubble.parentNode) return;
      bubble.classList.add('aivos-bubble--out');
      setTimeout(function() {
        if (bubble.parentNode) bubble.remove();
      }, 300);
    }
  };

  /* ══════════════════════════════════════════════════════════════════════════
     AIVOS CELEBRATION — Card de celebração
     ══════════════════════════════════════════════════════════════════════════ */

  var AivosCelebration = {
    render: function(container, opts) {
      opts = opts || {};
      var el = getElement(container);
      if (!el) return;

      var title = opts.title || 'Parabéns!';
      var sub = opts.sub || '';
      var score = opts.score || null;
      var action = opts.action || null;

      var actionHtml = action
        ? '<button class="aivos-celebration-btn" data-aivos-action="true">' + esc(action.label || 'Continuar') + '</button>'
        : '';

      el.innerHTML =
        '<div class="aivos-celebration" role="status" aria-live="polite">' +
          '<div class="aivos-celebration-avatar" id="aivos-celebration-avatar"></div>' +
          '<div class="aivos-celebration-title">' + title + '</div>' +
          (sub ? '<div class="aivos-celebration-sub">' + sub + '</div>' : '') +
          (score ? '<div class="aivos-celebration-score">' + score + '</div>' : '') +
          (actionHtml ? actionHtml : '') +
        '</div>';

      /* Render new Aivo mascot in celebration avatar */
      var celebAvatar = el.querySelector('#aivos-celebration-avatar');
      if (celebAvatar && window.AivoAPI) {
        window.AivoAPI.render(celebAvatar, { size: 80, state: 'celebrating' });
      }

      if (action && action.onClick) {
        var btn = el.querySelector('[data-aivos-action]');
        if (btn) {
          btn.addEventListener('click', function(e) {
            action.onClick(e);
          });
        }
      }

      if (opts.confetti && typeof confetti === 'function') {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#0D47FF', '#00B8FF', '#7C4DFF', '#4ADE80', '#FFD700']
        });
      }
    }
  };

  /* ══════════════════════════════════════════════════════════════════════════
     EXPORT (padrão do projeto: window.*)
     ══════════════════════════════════════════════════════════════════════════ */

  window.AivosCoach = AivosCoach;
  window.AivosBubble = AivosBubble;
  window.AivosCelebration = AivosCelebration;
})();
