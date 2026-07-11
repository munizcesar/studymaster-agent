/**
 * 🎭 AIVO — Auto-Boot Entry Point (Enterprise)
 *
 * Initializes ALL subsystems automatically.
 * No external module calls init() — everything boots on DOMContentLoaded.
 *
 * Boot flow:
 *   DOM Ready
 *   ↓
 *   Create Engine (AivoEngine.getInstance())
 *   ↓
 *   Create Presence (AnchorManager + VisibilityController + HomeManager)
 *   ↓
 *   Create React Root (Renderer.createRoot)
 *   ↓
 *   Eager Render <Aivo />
 *   ↓
 *   Start Health Monitor (1s heartbeat)
 *   ↓
 *   Start Watchdog (2s timeout)
 *   ↓
 *   Expose Public API (window.Aivo + AivoBus + AivoAPI + AivoPresence)
 *   ↓
 *   Ready
 *
 * Exposes:
 *   window.Aivo          → Public API (show/hide/move/state/say/emit/goHome/debug/destroy)
 *   window.Aivo.bus      → Global Event Bus (emit/on/off)
 *   window.Aivo.logger   → Structured Logger (info/warn/error/debug)
 *   window.AivoBus       → Global Event Bus (standalone)
 *   window.AivoAPI       → Backward compat (render/setState)
 *   window.AivoPresence  → Backward compat
 */

import { AivoEngine } from './engine';
import { createPublicAPI, createBackwardCompatAPI } from './api';
import type { AivoPublicAPI } from './types';
import { DebugOverlay } from './debug-overlay';
import { AivoLogger } from './logger';

/* ── Boot ── */

function boot(): void {
  if (document.getElementById('aivo-presence') && (window as any).Aivo) {
    // Already booted
    return;
  }

  const engine = AivoEngine.getInstance();
  const api = createPublicAPI(engine);
  const success = engine.boot();

  if (success) {
    // Expose public API
    (window as any).Aivo = api as AivoPublicAPI;

    // Create backward-compatible APIs
    createBackwardCompatAPI(engine, api);

    // Enable debug overlay if window.__AIVO_DEBUG__ is set
    DebugOverlay.checkAndEnable(() => api.debug());

    // Log boot completion
    AivoLogger.getInstance().info('Boot', 'AIVO Enterprise engine ready', {
      version: '2.0.0',
      commit: (window as any).__AIVO_COMMIT_HASH__ || 'unknown',
    });
  }
}

/* ── Auto-Init ── */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  setTimeout(boot, 0);
}

/* ── Fallback on load ── */
window.addEventListener('load', () => {
  if (!(window as any).Aivo) { boot(); }
});

export default boot;
