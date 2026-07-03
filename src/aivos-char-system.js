/**
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃     STUDYMASTER — AIVOS CHARACTER SYSTEM (Componentes)             ┃
 * ┃                                                                     ┃
 * ┃  Sistema de componentes reutilizáveis para o personagem AIVOS.     ┃
 * ┃  Cada componente é uma função pura que retorna HTML ou renderiza   ┃
 * ┃  em um container. Segue o padrão do projeto (window.* exports).    ┃
 * ┃                                                                     ┃
 * ┃  USO:                                                              ┃
 * ┃    <script src="src/aivos-char-system.js"></script>                ┃
 * ┃    <link rel="stylesheet" href="src/aivos-char.css">               ┃
 * ┃    AivosAvatar.render('#container', { size: 'lg', state: 'idle' }) ┃
 * ┃                                                                     ┃
 * ┃  Este arquivo é ADITIVO — não modifica nada existente.            ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */

(function() {
  'use strict';

  /* ══════════════════════════════════════════════════════════════════════════
     CONSTANTES
     ══════════════════════════════════════════════════════════════════════════ */

  /** Tamanhos válidos para avatar */
  var AVATAR_SIZES = ['sm', 'md', 'lg', 'xl'];

  /** Estados válidos para avatar */
  var AVATAR_STATES = ['idle', 'thinking', 'teaching', 'celebrating', 'warning'];

  /** Mapeamento de tamanho para dimensão em px */
  var AVATAR_DIMENSIONS = { sm: 32, md: 44, lg: 64, xl: 96 };

  /** Cores dos olhos por estado */
  var EYE_COLORS = {
    idle: '#0D47FF',
    thinking: '#00B8FF',
    teaching: '#0D47FF',
    celebrating: '#4ADE80',
    warning: '#EF4444'
  };

  /** Tipos de bolha (bubble) */
  var BUBBLE_TYPES = ['info', 'success', 'warning', 'error'];


  /* ══════════════════════════════════════════════════════════════════════════
     HELPERS INTERNOS
     ══════════════════════════════════════════════════════════════════════════ */

  /** Valida se o valor está dentro de um conjunto permitido */
  function assertIn(value, validSet, label) {
    if (validSet.indexOf(value) === -1) {
      console.warn('[AIVOS Char] ' + label + ' inválido: "' + value + '". Usando fallback.');
      return false;
    }
    return true;
  }

  /** Obtém elemento do DOM de forma segura */
  function getElement(el) {
    if (typeof el === 'string') return document.querySelector(el);
    if (el instanceof HTMLElement) return el;
    return null;
  }


  /* ══════════════════════════════════════════════════════════════════════════
     COMPONENTE: AivosAvatar
     ───
     Renderiza o avatar SVG do AIVOS com estado e tamanho.
     ══════════════════════════════════════════════════════════════════════════ */

  var AivosAvatar = {
    /**
     * Renderiza o avatar em um container.
     * @param {string|HTMLElement} container - Seletor CSS ou elemento
     * @param {Object} opts - Opções
     * @param {string} opts.size - Tamanho: 'sm'|'md'|'lg'|'xl' (default 'md')
     * @param {string} opts.state - Estado: 'idle'|'thinking'|'teaching'|'celebrating'|'warning' (default 'idle')
     */
    render: function(container, opts) {
      opts = opts || {};
      var size = opts.size || 'md';
      var state = opts.state || 'idle';
      var el = getElement(container);
      if (!el) return;

      // Validações silenciosas com fallback
      if (!assertIn(size, AVATAR_SIZES, 'Tamanho')) size = 'md';
      if (!assertIn(state, AVATAR_STATES, 'Estado')) state = 'idle';

      var dim = AVATAR_DIMENSIONS[size] || 44;
      var eyeColor = EYE_COLORS[state] || '#0D47FF';
      var cls = 'aivos-avatar aivos-avatar--' + size + ' aivos-avatar--' + state;

      el.innerHTML =
        '<div class="' + cls + '" role="img" aria-label="AIVOS — ' + state + '">' +
          '<svg class="aivos-avatar-svg" viewBox="0 0 100 100" width="' + dim + '" height="' + dim + '" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            /* Capacete branco premium */
            '<path d="M50 8C35 8 22 20 22 38c0 0-2 22 8 32l4 4h32l4-4c10-10 8-32 8-32 0-18-13-30-28-30z" fill="white" stroke="#E5E7EB" stroke-width="1.5"/>' +
            /* Visor preto brilhante */
            '<path d="M31 38c0-10 8-18 19-18s19 8 19 18v12c0 4-3 6-7 6H38c-4 0-7-2-7-6V38z" fill="#1a1a2e" stroke="#2d2d4a" stroke-width="1"/>' +
            /* Gradiente do visor (reflexo) */
            '<path d="M33 38c0-9 7-16 17-16s17 7 17 16v10c0 3-2 5-5 5H38c-3 0-5-2-5-5V38z" fill="url(#visorGrad)" opacity="0.15"/>' +
            /* Olhos azuis luminosos */
            '<ellipse class="aivos-eye" cx="43" cy="42" rx="4" ry="5" fill="' + eyeColor + '" opacity="0.9"/>' +
            '<ellipse class="aivos-eye" cx="57" cy="42" rx="4" ry="5" fill="' + eyeColor + '" opacity="0.9"/>' +
            /* Brilho do visor (pulse) */
            '<ellipse cx="50" cy="42" rx="16" ry="12" class="aivos-visor-glow" fill="' + eyeColor + '" opacity="0.08"/>' +
            /* Detalhe do capacete (logotipo) */
            '<path d="M47 16l3-5 3 5-3 2-3-2z" fill="url(#gradBrand)" opacity="0.7"/>' +
            /* Gradientes */
            '<defs>' +
              '<linearGradient id="visorGrad" x1="0" y1="0" x2="1" y2="1">' +
                '<stop offset="0%" stop-color="white" stop-opacity="0.3"/>' +
                '<stop offset="100%" stop-color="white" stop-opacity="0"/>' +
              '</linearGradient>' +
              '<linearGradient id="gradBrand" x1="0" y1="0" x2="1" y2="1">' +
                '<stop offset="0%" stop-color="var(--color-primary)"/>' +
                '<stop offset="100%" stop-color="var(--color-primary-mid)"/>' +
              '</linearGradient>' +
            '</defs>' +
          '</svg>' +
        '</div>';
    },

    /**
     * Gera o HTML do avatar sem renderizar.
     * @param {Object} opts - Mesmas opções do render()
     * @returns {string} HTML do avatar
     */
    html: function(opts) {
      opts = opts || {};
      var size = opts.size || 'md';
      var state = opts.state || 'idle';
      if (!assertIn(size, AVATAR_SIZES, 'Tamanho')) size = 'md';
      if (!assertIn(state, AVATAR_STATES, 'Estado')) state = 'idle';

      var dim = AVATAR_DIMENSIONS[size] || 44;
      var eyeColor = EYE_COLORS[state] || '#0D47FF';
      var cls = 'aivos-avatar aivos-avatar--' + size + ' aivos-avatar--' + state;

      return '<div class="' + cls + '" role="img" aria-label="AIVOS — ' + state + '">' +
        '<svg class="aivos-avatar-svg" viewBox="0 0 100 100" width="' + dim + '" height="' + dim + '" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M50 8C35 8 22 20 22 38c0 0-2 22 8 32l4 4h32l4-4c10-10 8-32 8-32 0-18-13-30-28-30z" fill="white" stroke="#E5E7EB" stroke-width="1.5"/>' +
          '<path d="M31 38c0-10 8-18 19-18s19 8 19 18v12c0 4-3 6-7 6H38c-4 0-7-2-7-6V38z" fill="#1a1a2e" stroke="#2d2d4a" stroke-width="1"/>' +
          '<path d="M33 38c0-9 7-16 17-16s17 7 17 16v10c0 3-2 5-5 5H38c-3 0-5-2-5-5V38z" fill="url(#visorGrad)" opacity="0.15"/>' +
          '<ellipse class="aivos-eye" cx="43" cy="42" rx="4" ry="5" fill="' + eyeColor + '" opacity="0.9"/>' +
          '<ellipse class="aivos-eye" cx="57" cy="42" rx="4" ry="5" fill="' + eyeColor + '" opacity="0.9"/>' +
          '<ellipse cx="50" cy="42" rx="16" ry="12" class="aivos-visor-glow" fill="' + eyeColor + '" opacity="0.08"/>' +
          '<path d="M47 16l3-5 3 5-3 2-3-2z" fill="url(#gradBrand)" opacity="0.7"/>' +
          '<defs>' +
            '<linearGradient id="visorGrad" x1="0" y1="0" x2="1" y2="1">' +
              '<stop offset="0%" stop-color="white" stop-opacity="0.3"/>' +
              '<stop offset="100%" stop-color="white" stop-opacity="0"/>' +
            '</linearGradient>' +
            '<linearGradient id="gradBrand" x1="0" y1="0" x2="1" y2="1">' +
              '<stop offset="0%" stop-color="var(--color-primary)"/>' +
              '<stop offset="100%" stop-color="var(--color-primary-mid)"/>' +
            '</linearGradient>' +
          '</defs>' +
        '</svg>' +
      '</div>';
    },

    /**
     * Atualiza o estado de um avatar existente (sem re-renderizar).
     * @param {string|HTMLElement} container - Container do avatar
     * @param {string} newState - Novo estado
     */
    setState: function(container, newState) {
      var el = getElement(container);
      if (!el) return;
      var avatar = el.querySelector('.aivos-avatar');
      if (!avatar) return;
      if (!assertIn(newState, AVATAR_STATES, 'Estado')) return;

      AVATAR_STATES.forEach(function(s) {
        avatar.classList.remove('aivos-avatar--' + s);
      });
      avatar.classList.add('aivos-avatar--' + newState);
      avatar.setAttribute('aria-label', 'AIVOS — ' + newState);

      // Atualiza cor dos olhos via estilo inline no SVG
      var eyeColor = EYE_COLORS[newState] || '#0D47FF';
      var eyes = avatar.querySelectorAll('.aivos-eye');
      eyes.forEach(function(eye) {
        eye.setAttribute('fill', eyeColor);
      });
      var glow = avatar.querySelector('.aivos-visor-glow');
      if (glow) glow.setAttribute('fill', eyeColor);
    }
  };


  /* ══════════════════════════════════════════════════════════════════════════
     COMPONENTE: AivosCoach
     ───
     Card com avatar + balão de fala + ação opcional.
     ══════════════════════════════════════════════════════════════════════════ */

  var AivosCoach = {
    /**
     * Renderiza um card de coach.
     * @param {string|HTMLElement} container
     * @param {Object} opts
     * @param {string} opts.message - Mensagem a exibir
     * @param {string} opts.state - Estado do avatar (default 'teaching')
     * @param {Object} [opts.action] - Ação opcional { label, onClick }
     */
    render: function(container, opts) {
      opts = opts || {};
      var el = getElement(container);
      if (!el) return;

      var message = opts.message || '';
      var state = opts.state || 'teaching';
      var action = opts.action || null;

      var avatarHtml = AivosAvatar.html({ size: 'md', state: state });
      var actionHtml = action
        ? '<button class="aivos-coach-btn" data-aivos-action="true">' +
          (action.label || 'Continuar') + '</button>'
        : '';

      el.innerHTML =
        '<div class="aivos-coach" role="status" aria-live="polite">' +
          '<div class="aivos-coach-avatar">' + avatarHtml + '</div>' +
          '<div class="aivos-coach-body">' +
            '<div class="aivos-coach-name">Prof. AIVOS</div>' +
            '<div class="aivos-coach-message">' + message + '</div>' +
            (actionHtml ? '<div class="aivos-coach-action">' + actionHtml + '</div>' : '') +
          '</div>' +
        '</div>';

      // Ação
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
     COMPONENTE: AivosBubble
     ───
     Notificação flutuante com auto-dismiss.
     ══════════════════════════════════════════════════════════════════════════ */

  var AivosBubble = {
    /**
     * Exibe uma bolha de notificação.
     * @param {Object} opts
     * @param {string} opts.text - Texto da bolha
     * @param {string} opts.type - Tipo: 'info'|'success'|'warning'|'error' (default 'info')
     * @param {number} [opts.autoHide] - ms para auto-esconder (default 5000). 0 = não auto-esconder
     * @param {Function} [opts.onClick] - Callback ao clicar na bolha
     */
    show: function(opts) {
      opts = opts || {};
      var text = opts.text || '';
      var type = opts.type || 'info';
      var autoHide = opts.autoHide !== undefined ? opts.autoHide : 5000;

      if (!assertIn(type, BUBBLE_TYPES, 'Tipo')) type = 'info';

      // Remove bolhas existentes
      var existing = document.querySelectorAll('.aivos-bubble');
      existing.forEach(function(b) { b.remove(); });

      var avatarHtml = AivosAvatar.html({ size: 'sm', state: 'idle' });
      var bubble = document.createElement('div');
      bubble.className = 'aivos-bubble aivos-bubble--' + type;
      bubble.setAttribute('role', 'alert');
      bubble.setAttribute('aria-live', 'assertive');
      bubble.innerHTML =
        '<div class="aivos-bubble-avatar">' + avatarHtml + '</div>' +
        '<div class="aivos-bubble-text">' + text + '</div>' +
        '<button class="aivos-bubble-close" aria-label="Fechar">&times;</button>';

      document.body.appendChild(bubble);

      // Fechar
      var closeBtn = bubble.querySelector('.aivos-bubble-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          AivosBubble.dismiss(bubble);
        });
      }

      // onClick
      if (opts.onClick) {
        bubble.addEventListener('click', function(e) {
          if (e.target.closest('.aivos-bubble-close')) return;
          opts.onClick(e);
        });
      }

      // Auto-dismiss
      if (autoHide > 0) {
        setTimeout(function() {
          if (bubble.parentNode) AivosBubble.dismiss(bubble);
        }, autoHide);
      }

      return bubble;
    },

    /**
     * Remove uma bolha com animação.
     * @param {HTMLElement} bubble - Elemento da bolha
     */
    dismiss: function(bubble) {
      if (!bubble || !bubble.parentNode) return;
      bubble.classList.add('aivos-bubble--out');
      setTimeout(function() {
        if (bubble.parentNode) bubble.remove();
      }, 300);
    }
  };


  /* ══════════════════════════════════════════════════════════════════════════
     COMPONENTE: AivosCelebration
     ───
     Card de celebração com avatar + mensagem + score.
     ══════════════════════════════════════════════════════════════════════════ */

  var AivosCelebration = {
    /**
     * Renderiza um card de celebração.
     * @param {string|HTMLElement} container
     * @param {Object} opts
     * @param {string} opts.title - Título da celebração
     * @param {string} [opts.sub] - Subtítulo opcional
     * @param {string} [opts.score] - Score/pontuação opcional
     * @param {Object} [opts.action] - Ação { label, onClick }
     * @param {boolean} [opts.confetti] - Se deve disparar confetti (default false)
     */
    render: function(container, opts) {
      opts = opts || {};
      var el = getElement(container);
      if (!el) return;

      var title = opts.title || 'Parabéns!';
      var sub = opts.sub || '';
      var score = opts.score || null;
      var action = opts.action || null;

      var avatarHtml = AivosAvatar.html({ size: 'xl', state: 'celebrating' });
      var actionHtml = action
        ? '<button class="aivos-celebration-btn" data-aivos-action="true">' +
          (action.label || 'Continuar') + '</button>'
        : '';

      el.innerHTML =
        '<div class="aivos-celebration" role="status" aria-live="polite">' +
          '<div class="aivos-celebration-avatar">' + avatarHtml + '</div>' +
          '<div class="aivos-celebration-title">' + title + '</div>' +
          (sub ? '<div class="aivos-celebration-sub">' + sub + '</div>' : '') +
          (score ? '<div class="aivos-celebration-score">' + score + '</div>' : '') +
          (actionHtml ? actionHtml : '') +
        '</div>';

      // Ação
      if (action && action.onClick) {
        var btn = el.querySelector('[data-aivos-action]');
        if (btn) {
          btn.addEventListener('click', function(e) {
            action.onClick(e);
          });
        }
      }

      // Confetti
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

  window.AivosAvatar = AivosAvatar;
  window.AivosCoach = AivosCoach;
  window.AivosBubble = AivosBubble;
  window.AivosCelebration = AivosCelebration;

})();
