/**
 * 🎭 AIVO — Integration Layer (Presence-Only)
 * 
 * TODAS as chamadas AivoAPI.render() utilizam a instância única
 * do sistema AivoPresence. Não existem roots legados — apenas UM
 * React root no container #aivo-presence.
 * 
 * O sistema de posicionamento (AivoPresence.moveToElement) aceita
 * QUALQUER elemento como alvo, calculando a posição ideal a partir
 * de getBoundingClientRect().
 * 
 * Components que renderizam o AIVO inline (como mentor avatar,
 * coach cards, bubble, celebração, dashboard) devem continuar
 * chamando AivoAPI.render() — o único efeito visível é que o
 * mesmo AIVO se move fisicamente entre as posições.
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

/* ── Presence root (instância ÚNICA do React) ── */
let presenceRoot = null;
let presenceData = { size: SIZE_PRESETS.xl, state: 'idle' };
let presenceInitialized = false;

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

/* ── Auto-update theme no Presence root (único) ── */
const themeObserver = new MutationObserver(() => {
  if (presenceRoot) {
    presenceRoot.render(
      <Aivo size={presenceData.size} state={presenceData.state} themeMode={getThemeMode()} />
    );
  }
});
themeObserver.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-theme'],
});

/* ── Global API (Presence-Only) ── */
window.AivoAPI = {
  /**
   * Render or update the single Aivo mascot.
   * SEMPRE usa o sistema Presence (instância única).
   * O AIVO move-se fisicamente até a posição do container informado.
   */
  render(container, options = {}) {
    if (!container || !(container instanceof Element)) {
      console.warn('[AivoAPI] Invalid container', container);
      return;
    }

    if (!ensurePresenceReady()) return;

    const size = getSize(options.size);
    const state = getState(options.state);
    presenceData = { size, state };

    // Renderizar o AIVO no Presence root (único)
    presenceRoot.render(<Aivo size={size} state={state} themeMode={getThemeMode()} />);

    // Mover o AIVO para a posição do container alvo
    window.AivoPresence.moveToElement(container, { state, size });
  },

  /**
   * Update the state of the single Aivo (sem mover).
   */
  setState(container, state) {
    if (!container || !presenceRoot) return;
    const mapped = getState(state);
    presenceData = { ...presenceData, state: mapped };
    presenceRoot.render(
      <Aivo size={presenceData.size} state={mapped} themeMode={getThemeMode()} />
    );
    if (window.AivoPresence && window.AivoPresence.onStateChange) {
      window.AivoPresence.onStateChange(mapped, presenceData.size);
    }
  },
};

/* ── Legacy shim: backward compatibility with old AivosAvatar API ── */
(function() {
  if (!window.AivosAvatar) return;

  const originalRender = window.AivosAvatar.render;
  const originalSetState = window.AivosAvatar.setState;

  window.AivosAvatar.render = function(container, opts) {
    if (container && container.querySelector('.aivos-avatar')) {
      return originalRender.call(this, container, opts);
    }
    return window.AivoAPI.render(container, opts);
  };

  window.AivosAvatar.setState = function(container, state) {
    if (container && container.querySelector('.aivos-avatar')) {
      return originalSetState.call(this, container, state);
    }
    return window.AivoAPI.setState(container, state);
  };
})();

/* ── setAivosAvatarState global ── */
function defineSetAivosAvatarState() {
  window.setAivosAvatarState = function(state) {
    const mapped = getState(state);
    if (presenceRoot) {
      presenceData = { ...presenceData, state: mapped };
      presenceRoot.render(
        <Aivo size={presenceData.size} state={mapped} themeMode={getThemeMode()} />
      );
      if (window.AivoPresence && window.AivoPresence.onStateChange) {
        window.AivoPresence.onStateChange(mapped, presenceData.size);
      }
    }
  };
}

if (document.readyState === 'loading') {
  window.addEventListener('load', defineSetAivosAvatarState);
} else {
  defineSetAivosAvatarState();
}
