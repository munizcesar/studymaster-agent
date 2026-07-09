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

/* ── Track all mounted roots ── */
const roots = new Map();
const mountData = new Map(); // container -> { size, state }

/* ── Auto-update theme on all instances ── */
const themeObserver = new MutationObserver(() => {
  const theme = getThemeMode();
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
   * Render or update an Aivo mascot inside a container element.
   */
  render(container, options = {}) {
    if (!container || !(container instanceof Element)) {
      console.warn('[AivoAPI] Invalid container', container);
      return;
    }

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


