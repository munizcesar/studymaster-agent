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
import AivoTourOverlay, { Aivo, SIZE_PRESETS } from './aivo-mascot';

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
let presenceRetryCount = 0;
const PRESENCE_MAX_RETRIES = 100; // 100 * 100ms = 10s total

/* ── Inicialização do Presence com retry ── */
let presenceRetrying = false;

function ensurePresenceReady() {
  if (presenceInitialized) return true;

  // Evitar loops paralelos de retry
  if (presenceRetrying) return false;

  // Verificar se AivoPresence e body estao prontos
  if (!window.AivoPresence || !document.body) {
    if (presenceRetryCount < PRESENCE_MAX_RETRIES) {
      presenceRetryCount++;
      presenceRetrying = true;
      setTimeout(() => { presenceRetrying = false; ensurePresenceReady(); }, 100);
    }
    return false;
  }

  // Inicializar o sistema Presence (cria o container #aivo-presence)
  // init() eh seguro: retorna sem erro se body nao estiver pronto
  window.AivoPresence.init();
  const container = window.AivoPresence.getContainer();

  // Container ainda não foi criado (body existe mas init() pode ter sido adiado)
  if (!container || !document.body.contains(container)) {
    if (presenceRetryCount < PRESENCE_MAX_RETRIES) {
      presenceRetryCount++;
      presenceRetrying = true;
      setTimeout(() => { presenceRetrying = false; ensurePresenceReady(); }, 100);
    }
    return false;
  }

  // Criar o React root (UMA ÚNICA VEZ) e renderizar imediatamente
  if (!presenceRoot) {
    presenceRoot = createRoot(container);
    // Render inicial eager: garante que o container nunca fique vazio
    presenceRoot.render(
      <>
        <Aivo size={presenceData.size} state={presenceData.state} themeMode={getThemeMode()} />
        <AivoTourOverlay />
      </>
    );
  }

  // Conectar callback de mudança de estado
  window.AivoPresence.onStateChange = function(newState, newSize) {
    const s = getSize(newSize);
    const st = getState(newState);
    presenceData = { size: s, state: st };
    if (presenceRoot) {
      presenceRoot.render(
        <>
          <Aivo size={s} state={st} themeMode={getThemeMode()} />
          <AivoTourOverlay />
        </>
      );
    }
  };

  presenceInitialized = true;
  console.log('[AivoAPI] Presence ready, React root created');
  return true;
}

/* ── Auto-update theme no Presence root (único) ── */
const themeObserver = new MutationObserver(() => {
  if (presenceRoot) {
    presenceRoot.render(
      <>
        <Aivo size={presenceData.size} state={presenceData.state} themeMode={getThemeMode()} />
        <AivoTourOverlay />
      </>
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

    if (!ensurePresenceReady()) {
      console.warn('[AivoAPI] Presence not ready yet');
      return;
    }

    const size = getSize(options.size);
    const state = getState(options.state);
    presenceData = { size, state };

    // Debug: verificar se o componente Aivo esta disponivel
    if (typeof Aivo !== 'function' && typeof Aivo !== 'object') {
      console.error('[AivoAPI] Aivo component is NOT available! Type:', typeof Aivo);
    }

    // Renderizar o AIVO no Presence root (único)
    if (presenceRoot) {
      presenceRoot.render(<Aivo size={size} state={state} themeMode={getThemeMode()} />);
    } else {
      console.error('[AivoAPI] presenceRoot is null!');
    }

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

