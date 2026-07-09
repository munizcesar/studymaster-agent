/**
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃     AIVO PRESENCE — Instância única, movimentação global           ┃
 * ┃                                                                  ┃
 * ┃  Gerencia UM único contêiner fixo que se move entre âncoras      ┃
 * ┃  definidas por data-aivo-anchor. O AIVO nunca é recriado —       ┃
 * ┃  apenas reposicionado com animação em 3 fases.                   ┃
 * ┃                                                                  ┃
 * ┃  Fases de movimentação:                                          ┃
 * ┃    1. Preparação (120ms) — inclinação, olhar para o destino      ┃
 * ┃    2. Voo (~380ms) — trajetória curva com rotação                ┃
 * ┃    3. Chegada (150ms) — desaceleração, bounce sutil              ┃
 * ┃                                                                  ┃
 * ┃  Modo de espera: quando não há âncora disponível, reduz          ┃
 * ┃  opacidade e escala, mantendo respiração e piscadas.             ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */

(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURAÇÃO
  // ═══════════════════════════════════════════════════════════════════════════

  var PRESENCE_ID = 'aivo-presence';
  var PHASE_PREPARE_MS = 120;
  var PHASE_FLIGHT_MS = 380;
  var PHASE_ARRIVE_MS = 150;
  var STANDBY_SCALE = 0.95;
  var STANDBY_OPACITY = 0.5;
  var MASCOT_DEFAULT_SIZE = 120;

  // ═══════════════════════════════════════════════════════════════════════════
  // ESTADO INTERNO
  // ═══════════════════════════════════════════════════════════════════════════

  var st = {
    el: null,
    initialized: false,
    currentAnchor: null,
    isStandby: true,
    anchorMap: new Map(),
    observer: null,
    onStateChange: null,
    // Timeout IDs para cancelamento
    _prepareTimer: null,
    _flightTimer: null,
    _arriveTimer: null,
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // INICIALIZAÇÃO
  // ═══════════════════════════════════════════════════════════════════════════

  function init() {
    if (st.initialized) return;
    st.initialized = true;

    var el = document.createElement('div');
    el.id = PRESENCE_ID;
    el.style.cssText = [
      'position:fixed',
      'z-index:9000',
      'pointer-events:none',
      'will-change:transform,opacity',
      'transform:translate3d(0,0,0) scale(' + STANDBY_SCALE + ')',
      'opacity:0',
      'transition:opacity 0.5s ease, transform 0.5s ease',
    ].join(';');
    document.body.appendChild(el);
    st.el = el;

    // Escaneamento inicial + observador de âncoras dinâmicas
    scanAnchors();
    st.observer = new MutationObserver(scanAnchors);
    st.observer.observe(document.body, { childList: true, subtree: true });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VARREDURA DE ÂNCORAS
  // ═══════════════════════════════════════════════════════════════════════════

  function scanAnchors() {
    var anchors = document.querySelectorAll('[data-aivo-anchor]');
    anchors.forEach(function(el) {
      var name = el.getAttribute('data-aivo-anchor');
      if (name && !st.anchorMap.has(name)) {
        st.anchorMap.set(name, el);
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CANCELAMENTO DE ANIMAÇÕES ANTERIORES
  // ═══════════════════════════════════════════════════════════════════════════

  function cancelPending() {
    if (st._prepareTimer) { clearTimeout(st._prepareTimer); st._prepareTimer = null; }
    if (st._flightTimer) { clearTimeout(st._flightTimer); st._flightTimer = null; }
    if (st._arriveTimer) { clearTimeout(st._arriveTimer); st._arriveTimer = null; }
    // Remover classes de fase
    if (st.el) {
      st.el.classList.remove('aivo-prepare', 'aivo-flying', 'aivo-arrive');
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CÁLCULO DE POSIÇÃO
  // ═══════════════════════════════════════════════════════════════════════════

  function getAnchorRect(anchorName) {
    var el = st.anchorMap.get(anchorName);
    if (!el) return null;
    return el.getBoundingClientRect();
  }

  /**
   * Calcula a posição ideal e rotação de voo.
   * Usa o tamanho real do mascote para posicionar corretamente.
   * Retorna ângulo de rotação para criar trajetória curva.
   */
  function calcPosition(anchorName, mascotSize) {
    var rect = getAnchorRect(anchorName);
    if (!rect) return null;

    var size = mascotSize || MASCOT_DEFAULT_SIZE;
    var gap = 12;

    // Tentar direita
    var spaceRight = window.innerWidth - rect.right;
    if (spaceRight >= size + gap) {
      return {
        x: rect.right + gap,
        y: rect.top + rect.height / 2 - size / 2,
        rotate: -2, // leve rotação para cima durante voo (curva)
        side: 'right',
      };
    }

    // Tentar esquerda
    if (rect.left >= size + gap) {
      return {
        x: rect.left - size - gap,
        y: rect.top + rect.height / 2 - size / 2,
        rotate: 2,
        side: 'left',
      };
    }

    // Centralizar abaixo
    return {
      x: rect.left + rect.width / 2 - size / 2,
      y: rect.bottom + gap,
      rotate: -1,
      side: 'bottom',
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MODO DE ESPERA
  // ═══════════════════════════════════════════════════════════════════════════

  function enterStandby() {
    if (!st.el || st.isStandby) return;
    cancelPending();
    st.isStandby = true;
    st.currentAnchor = null;
    st.el.setAttribute('data-aivo-phase', 'standby');
    st.el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    st.el.style.opacity = String(STANDBY_OPACITY);
    st.el.style.transform = 'translate3d(0,0,0) scale(' + STANDBY_SCALE + ')';
  }

  function exitStandby(pos, anchorName) {
    if (!st.el) return;
    cancelPending();
    st.isStandby = false;

    // Posicionar instantaneamente no destino
    st.el.style.transition = 'none';
    st.el.style.transform = 'translate3d(' + pos.x + 'px, ' + pos.y + 'px, 0) scale(1) rotate(0deg)';

    // Force layout
    void st.el.offsetHeight; // eslint-disable-line

    // Fade in suave
    st.el.style.transition = 'opacity 0.3s ease';
    st.el.style.opacity = '1';
    st.el.setAttribute('data-aivo-phase', 'idle');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MOVIMENTAÇÃO — 3 FASES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Move o AIVO para uma âncora.
   * @param {string} anchorName
   * @param {object} [opts] - { state, size }
   */
  function moveTo(anchorName, opts) {
    init();
    opts = opts || {};

    // Cancelar animação anterior imediatamente
    cancelPending();

    var pos = calcPosition(anchorName, opts.size);
    if (!pos) {
      enterStandby();
      return;
    }

    st.currentAnchor = anchorName;

    // Atualizar estado do React antes de mover
    if (opts.state && st.onStateChange) {
      st.onStateChange(opts.state, opts.size);
    }

    if (st.isStandby) {
      exitStandby(pos, anchorName);
      return;
    }

    // ── Fase 1: Preparação (120ms) — tilt instantâneo na direção do destino ──
    st.el.classList.add('aivo-prepare');
    st.el.setAttribute('data-aivo-phase', 'prepare');

    // Posição atual via getBoundingClientRect para calcular direção
    var srcRect = st.el.getBoundingClientRect();
    var dx = pos.x - srcRect.left;
    var dy = pos.y - srcRect.top;
    var angle = Math.atan2(dy, dx) * (180 / Math.PI);
    var tiltAngle = Math.max(-8, Math.min(8, angle * 0.08)); // max ±8°

    // Tilt instantâneo (sem herdar transição anterior do standby)
    st.el.style.transition = 'none';
    st.el.style.transform = 'translate3d(' + srcRect.left + 'px, ' + srcRect.top + 'px, 0) scale(1) rotate(' + tiltAngle + 'deg)';

    st._prepareTimer = setTimeout(function() {
      if (!st.el) return;

      // ── Fase 2: Voo (380ms) — trajetória curva com rotação ──
      st.el.classList.remove('aivo-prepare');
      st.el.classList.add('aivo-flying');
      st.el.setAttribute('data-aivo-phase', 'flying');

      // Curva: adiciona rotação na direção oposta do movimento para simular
      // inércia. Ao final, a rotação retorna a 0 (chegada).
      var flightRotate = pos.rotate || 0;

      st.el.style.transition = [
        'transform ' + PHASE_FLIGHT_MS + 'ms cubic-bezier(0.22, 1, 0.36, 1)',
      ].join(',');
      st.el.style.transform = 'translate3d(' + pos.x + 'px, ' + pos.y + 'px, 0) scale(1) rotate(' + flightRotate + 'deg)';

      st._flightTimer = setTimeout(function() {
        if (!st.el) return;

        // ── Fase 3: Chegada (150ms) — bounce ──
        st.el.classList.remove('aivo-flying');
        st.el.classList.add('aivo-arrive');
        st.el.setAttribute('data-aivo-phase', 'arrive');

        // Retornar rotação a 0 com bounce
        st.el.style.transition = [
          'transform ' + PHASE_ARRIVE_MS + 'ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        ].join(',');
        st.el.style.transform = 'translate3d(' + pos.x + 'px, ' + pos.y + 'px, 0) scale(1) rotate(0deg)';

        st._arriveTimer = setTimeout(function() {
          if (!st.el) return;
          st.el.classList.remove('aivo-arrive');
          st.el.setAttribute('data-aivo-phase', 'idle');
          st._arriveTimer = null;
        }, PHASE_ARRIVE_MS);
        st._flightTimer = null;
      }, PHASE_FLIGHT_MS);
      st._prepareTimer = null;
    }, PHASE_PREPARE_MS);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GETTERS
  // ═══════════════════════════════════════════════════════════════════════════

  function getContainer() { return st.el; }
  function getCurrentAnchor() { return st.currentAnchor; }
  function getAnchors() { return Array.from(st.anchorMap.keys()); }
  function isStandby() { return st.isStandby; }

  // ═══════════════════════════════════════════════════════════════════════════
  // DESTRUIÇÃO
  // ═══════════════════════════════════════════════════════════════════════════

  function destroy() {
    cancelPending();
    if (st.observer) { st.observer.disconnect(); st.observer = null; }
    if (st.el && st.el.parentNode) { st.el.parentNode.removeChild(st.el); }
    st.el = null;
    st.anchorMap.clear();
    st.initialized = false;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CSS INJETADO
  // ═══════════════════════════════════════════════════════════════════════════

  function injectStyles() {
    if (document.getElementById('aivo-presence-style')) return;
    var style = document.createElement('style');
    style.id = 'aivo-presence-style';
    style.textContent = [
      '#aivo-presence { transform-origin: center center; will-change: transform, opacity; }',
      '#aivo-presence[data-aivo-phase="prepare"] { transform-origin: center bottom; }',
      '#aivo-presence[data-aivo-phase="standby"] { cursor: default; }',
    ].join('\n');
    document.head.appendChild(style);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPORT
  // ═══════════════════════════════════════════════════════════════════════════

  injectStyles();

  window.AivoPresence = {
    init: init,
    moveTo: moveTo,
    enterStandby: enterStandby,
    getContainer: getContainer,
    getCurrentAnchor: getCurrentAnchor,
    getAnchors: getAnchors,
    isStandby: isStandby,
    destroy: destroy,
    get onStateChange() { return st.onStateChange; },
    set onStateChange(fn) { st.onStateChange = fn; },
  };

  // Auto-inicializar assim que o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
