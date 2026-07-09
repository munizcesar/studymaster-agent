/**
 * 🎭 AIVO — Integration Layer
 * 
 * Bridges the React-based Aivo mascot with the vanilla JS project.
 * Provides a global `window.AivoAPI` for use by legacy scripts.
 * 
 * Architecture:
 *   - The new React mascot (Aivo) is used where we explicitly call
 *     `AivoAPI.render()` — hero section, mentor sidebar, redbot.
 *   - The old SVG-based avatar (aivos-char-system.js) continues to
 *     work everywhere else via backward-compatible shims.
 *   - `AivosAvatar.html()` is NOT shimmed — coach cards, celebration
 *     banners, and the dashboard use the original SVG.
 * 
 * ── AIVO Presence ──
 *   - Todas as chamadas AivoAPI.render() são interceptadas.
 *   - Se o container possuir um ancestral [data-aivo-anchor], o
 *     render é redirecionado para o sistema AivoPresence (instância
 *     única, movimentação física entre âncoras).
 *   - Containers sem âncora continuam com o comportamento legado.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { Aivo, SIZE_PRESETS } from './aivo-mascot';

/* ── State mapping: old (aivos-char-system) → new (Aivo) ── */
const STATE_MAP = {
  idle: 'idle',
  thinking: 'thinking',
  explaining: 'speaking',
  motivating: 'proud',
  celebrating: 'celebrating',
  analyzing: 'thinking',
  waiting: 'calm',
  pointing: 'focus',
  happy: 'happy',
  error: 'error',
  attention: 'focus',
  // New-style states pass through
  calm: 'calm',
  greeting: 'greeting',
  sleepy: 'sleepy',
  focus: 'focus',
  typing: 'typing',
  password: 'password',
  listening: 'listening',
  speaking: 'speaking',
  curious: 'curious',
  loading: 'loading',
  surprised: 'surprised',
  confused: 'confused',
  concerned: 'concerned',
  success: 'success',
  proud: 'proud',
  warning: 'concerned',
  processing: 'loading',
};

const SIZE_MAP = {
  xs: SIZE_PRESETS.xs,
  sm: SIZE_PRESETS.sm,
  md: SIZE_PRESETS.md,
  lg: SIZE_PRESETS.lg,
  xl: SIZE_PRESETS.xl,
  xxl: SIZE_PRESETS.xxl,
};

function getSize(size) {
  if (typeof size === 'number') return size;
  return SIZE_MAP[size] || SIZE_PRESETS.lg;
}

function getState(state) {
  return STATE_MAP[state] || state || 'idle';
}

function getThemeMode() {
  const html = document.documentElement;
  return html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

/* ── Presence root (instância única do React) ── */
let presenceRoot = null;
let presenceData = { size: SIZE_PRESETS.xl, state: 'idle' };
let presenceInitialized = false;

/* ── Track all mounted roots (legado) ── */
const roots = new Map();
const mountData = new Map(); // container -> { size, state }

/* ── Inicialização eager do Presence ── */
function ensurePresenceReady() {
  if (presenceInitialized) return true;
  if (!window.AivoPresence) return false;

  window.AivoPresence.init();
  const container = window.AivoPresence.getContainer();
  if (!container) return false;

  if (!presenceRoot) {
    presenceRoot = createRoot(container);
  }

  // Conectar callback de mudança de estado
  window.AivoPresence.onStateChange = function(newState, newSize) {
    const s = getSize(newSize);
    const st = getState(newState);
    presenceData = { size: s, state: st };
    if (presenceRoot) {
      presenceRoot.render(<Aivo size={s} state={st} themeMode={getThemeMode()} />);
    }
  };

  presenceInitialized = true;
  return true;
}

/* ── Helper: encontra a âncora mais próxima de um container ── */
function findAnchor(container) {
  if (!container || !container.closest) return null;
  if (container.hasAttribute && container.hasAttribute('data-aivo-anchor')) {
    return container;
  }
  return container.closest('[data-aivo-anchor]');
}

/* ── Helper: renderiza no container de presença ── */
function renderToPresence(anchorEl, options) {
  if (!ensurePresenceReady()) return false;

  const anchorName = anchorEl.getAttribute('data-aivo-anchor');
  const size = getSize(options.size);
  const state = getState(options.state);
  const theme = getThemeMode();

  presenceData = { size, state };

  // Renderizar o AIVO no container de presença (já criado pelo ensurePresenceReady)
  presenceRoot.render(<Aivo size={size} state={state} themeMode={theme} />);

  // Mover o AIVO para a âncora
  window.AivoPresence.moveTo(anchorName, { state, size: getSize(options.size) });

  return true;
}

/* ── Auto-update theme on all instances ── */
const themeObserver = new MutationObserver(() => {
  const theme = getThemeMode();
  // Atualizar instância Presence
  if (presenceRoot) {
    presenceRoot.render(
      <Aivo size={presenceData.size} state={presenceData.state} themeMode={theme} />
    );
  }
  // Atualizar instâncias legado
  for (const [container, root] of roots) {
    const data = mountData.get(container);
    if (data) {
      root.render(
        <Aivo size={data.size} state={data.state} themeMode={theme} />
      );
    }
  }
});
themeObserver.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-theme'],
});

/* ── Global API ── */
window.AivoAPI = {
  /**
   * Render or update an Aivo mascot.
   * Se o container possuir uma âncora data-aivo-anchor, redireciona
   * para o sistema Presence (instância única). Caso contrário,
   * mantém o comportamento legado (render no próprio container).
   */
  render(container, options = {}) {
    if (!container || !(container instanceof Element)) {
      console.warn('[AivoAPI] Invalid container', container);
      return;
    }

    // Tentar Presence primeiro
    const anchorEl = findAnchor(container);
    if (anchorEl && window.AivoPresence) {
      if (renderToPresence(anchorEl, options)) {
        return; // Presença assumiu o render
      }
    }

    // Fallback legado: renderizar no próprio container
    const size = getSize(options.size);
    const state = getState(options.state);
    const theme = getThemeMode();

    mountData.set(container, { size, state });

    if (roots.has(container)) {
      roots.get(container).render(
        <Aivo size={size} state={state} themeMode={theme} />
      );
    } else {
      const root = createRoot(container);
      roots.set(container, root);
      root.render(
        <Aivo size={size} state={state} themeMode={theme} />
      );
    }
  },

  /**
   * Update the state of an already-mounted Aivo.
   */
  setState(container, state) {
    if (!container) return;
    // Se for Presence, atualizar o root Presence
    const anchorEl = findAnchor(container);
    if (anchorEl && presenceRoot) {
      const mapped = getState(state);
      presenceData = { ...presenceData, state: mapped };
      presenceRoot.render(
        <Aivo size={presenceData.size} state={mapped} themeMode={getThemeMode()} />
      );
      // Atualizar estado no Presence sem mover (já está na âncora)
      if (window.AivoPresence && window.AivoPresence.onStateChange) {
        window.AivoPresence.onStateChange(mapped, presenceData.size);
      }
      return;
    }
    // Fallback legado
    const data = mountData.get(container) || { size: SIZE_PRESETS.lg };
    this.render(container, { size: data.size, state });
  },

  // html() is intentionally NOT shimmed — AivosAvatar.html() from
  // aivos-char-system.js continues to return SVG strings for coach
  // cards, celebration banners, and the dashboard.
};

/* ── Legacy shim: backward compatibility with old AivosAvatar API ── */
(function() {
  if (!window.AivosAvatar) return;

  const originalRender = window.AivosAvatar.render;
  const originalSetState = window.AivosAvatar.setState;
  // html() is NOT shimmed — the original SVG-based version continues to work
  // for coach cards, celebration banners, and the dashboard.

  /**
   * AivosAvatar.render(container, opts)
   * If container has an old .aivos-avatar SVG, use original renderer.
   * Otherwise, use the new React AivoAPI.
   */
  window.AivosAvatar.render = function(container, opts) {
    if (container && container.querySelector('.aivos-avatar')) {
      return originalRender.call(this, container, opts);
    }
    return window.AivoAPI.render(container, opts);
  };

  /**
   * AivosAvatar.setState(container, state)
   * If container has an old .aivos-avatar SVG, use original setState.
   * Otherwise, use the new React AivoAPI.
   */
  window.AivosAvatar.setState = function(container, state) {
    if (container && container.querySelector('.aivos-avatar')) {
      return originalSetState.call(this, container, state);
    }
    return window.AivoAPI.setState(container, state);
  };
})();

/* ── Legacy: setAivosAvatarState ── */
// Overrides inline script definition at page bottom.
// Uses window.load to ensure it runs AFTER the inline script.
function defineSetAivosAvatarState() {
  window.setAivosAvatarState = function(state) {
    const mapped = getState(state);
    // Atualizar Presence se disponível
    if (presenceRoot) {
      presenceData = { ...presenceData, state: mapped };
      presenceRoot.render(
        <Aivo size={presenceData.size} state={mapped} themeMode={getThemeMode()} />
      );
      if (window.AivoPresence && window.AivoPresence.onStateChange) {
        window.AivoPresence.onStateChange(mapped, presenceData.size);
      }
    }
    // Também atualizar instâncias legado
    for (const [container] of mountData) {
      window.AivoAPI.setState(container, mapped);
    }
  };
}

if (document.readyState === 'loading') {
  window.addEventListener('load', defineSetAivosAvatarState);
} else {
  defineSetAivosAvatarState();
}


