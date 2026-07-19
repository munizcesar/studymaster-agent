/**
 * 🎭 AIVO CORE — Boot (Persistent Actor Entry Point)
 *
 * AIVO nasce UMA vez. Vive para sempre. Nunca é destruído.
 *
 * Boot flow:
 *   DOM Ready
 *   ↓
 *   AivoEngine.getInstance().boot()
 *   ↓
 *   Presence.init() — creates single #aivo-presence
 *   ↓
 *   Renderer.init() — creates single React root, renders <Aivo />
 *   ↓
 *   AIVO goes HOME
 *   ↓
 *   Expose adapters: window.AivoAPI, window.AivoBus, window.AivoPresence
 *   ↓
 *   Ready — alive forever
 */

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { Aivo } from '../../aivo-mascot';
import { AivoEngine } from './engine';
import { PresenceManager } from './presence';
import { AivoLogger } from './debug';
import { getAivoBus } from './event-bus';

/**
 * Componente flutuante do mascote — usa createPortal para sair
 * de QUALQUER hierarquia DOM e viver direto no document.body.
 */
function AivoFloatingAvatar({ engine }: { engine: any }) {
  const [emotion, setEmotion] = useState<string>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [showBubble, setShowBubble] = useState<boolean>(true);

  useEffect(() => {
    const handleEmotion = (e: any) => {
      if (e?.detail?.emotion) setEmotion(e.detail.emotion);
    };
    window.addEventListener('aivo-engine-emotion', handleEmotion);

    const handleTour = (e: any) => {
      if (e?.detail?.message) {
        setMessage(e.detail.message);
        setShowBubble(true);
      }
    };
    window.addEventListener('aivo-tour', handleTour);

    // Expoe funcao global para mostrar o balao externamente
    (window as any).AivoShow = () => setShowBubble(true);

    return () => {
      window.removeEventListener('aivo-engine-emotion', handleEmotion);
      window.removeEventListener('aivo-tour', handleTour);
    };
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMessage(null);
    setShowBubble(false);
  };

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('[AIVO] Avatar clicado');
    if (message) {
      // Fecha o balao se tiver mensagem
      setMessage(null);
      setShowBubble(false);
    } else {
      // Alterna o balão de fala (abre se fechado, fecha se aberto)
      setShowBubble(prev => !prev);
    }
  };

  // SEMPRE renderiza o avatar oficial — nunca troca por icone generico
  const content = (
    <div className="mascot-wrapper" style={{ pointerEvents: 'auto' }}>
      {showBubble && message && (
        <div className="speech-bubble">
          {message}
          <button onClick={handleDismiss} className="btn-entendi">
            Entendi &gt;
          </button>
        </div>
      )}
      <div
        className="mascot-avatar"
        onClick={handleAvatarClick}
        style={{ cursor: 'pointer', pointerEvents: 'auto' }}
        title="Falar com AIVO"
      >
        <Aivo size={64} state={emotion as any} themeMode="dark" />
      </div>
    </div>
  );

  return ReactDOM.createPortal(content, document.body) as any;
}



let rootCreated = false;

function boot(): void {
  if (rootCreated) return; // Born once

  const engine = AivoEngine.getInstance();
  const logger = AivoLogger.getInstance();
  const bus = getAivoBus();

  // 1. Create a minimal hidden host div directly on body (bypasses PresenceManager opacity:0)
  let container = document.getElementById('aivo-react-host') as HTMLElement | null;
  if (!container) {
    container = document.createElement('div');
    container.id = 'aivo-react-host';
    container.style.cssText = 'position:fixed;width:0;height:0;overflow:visible;pointer-events:none;z-index:0;top:0;left:0;';
    document.body.appendChild(container);
  }


  // 2. Create single React root (never again)
  const root = createRoot(container);
  rootCreated = true;

  // 3. Eager render — portal-based floating avatar
  function render() {
    root.render(<AivoFloatingAvatar engine={engine} />);
  }
  render();

  // 4. Theme observer
  const themeObs = new MutationObserver(() => render());
  themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // 5. Re-render on emotion changes
  engine.events.on('emotion:change', (data) => {
    window.dispatchEvent(new CustomEvent('aivo-engine-emotion', { detail: data }));
    (window as any).__AIVO_ROOT_EXISTS__ = true;
  });

  // 6. Boot engine
  engine.boot();

  // 7. Mark root as existing
  (window as any).__AIVO_ROOT_EXISTS__ = true;

  // 8. Expose backward-compat APIs
  (window as any).AivoAPI = {
    render(container: any, opts: any = {}) {
      // Derive anchor: from container's data-aivo-anchor → or opts → fallback 'home'
      const el = container?.getAttribute?.('data-aivo-anchor')
        ? container
        : container?.closest?.('[data-aivo-anchor]');
      const anchor = el?.getAttribute?.('data-aivo-anchor') || opts.target || 'home';
      engine.moveToAnchor(anchor, opts.state);
    },
    setState(_container: any, state: string) {
      engine.setEmotion(state);
    },
  };

  (window as any).AivoPresence = {
    moveToElement(el: any, opts: any) {
      // Derive anchor from element: data-aivo-anchor → closest ancestor → fallback 'home'
      const anchor = el?.getAttribute?.('data-aivo-anchor')
        || el?.closest?.('[data-aivo-anchor]')?.getAttribute?.('data-aivo-anchor')
        || 'home';
      engine.moveToAnchor(anchor, opts?.state);
    },
    enterStandby() { /* no-op — AIVO never sleeps */ },
    goHome() { engine.goHome(); },
  };

  (window as any).AivoBus = {
    emit: (e: string, d?: any) => bus.emit(e, d),
    on: (e: string, h: any) => bus.on(e, h),
    off: (e: string, h: any) => bus.off(e, h),
  };

  (window as any).Aivo = {
    move: (target: any, opts?: any) => engine.moveToAnchor(
      typeof target === 'string' ? target : target?.getAttribute?.('data-aivo-anchor') || 'home',
      opts?.state
    ),
    state: (s: string) => engine.setEmotion(s),
    goHome: () => engine.goHome(),
    debug: () => engine.getDebugReport(),
    /** Force a Watchman patrol now */
    patrol: () => engine.watchman.patrol(),
    /** Detailed health info as formatted string */
    health: () => {
      const r = engine.getDebugReport();
      return [
        `🎭 AIVO Health Dashboard`,
        `────────────────────────────`,
        `Version:    ${r.version} (${r.commit.slice(0,7)})`,
        `Phase:      ${r.phase}`,
        `Emotion:    ${r.emotion}`,
        `Anchor:     ${r.anchor || '—'}`,
        `Queue:      ${r.queueLength} pending  ${r.queueProcessing ? '⚡processing' : '✓ idle'}`,
        `Container:  ${r.containerExists ? '✅ in DOM' : '❌ missing'}`,
        `React Root: ${r.rootExists ? '✅ exists' : '❌ missing'}`,
        `Uptime:     ${Math.round(r.uptimeMs/1000)}s`,
        `FPS:        ${r.fps}`,
        `Memory:     ${r.memory}`,
        `Recovery:   ${r.recoveryCount}x`,
        `Anchors:    ${r.anchorsCount} registered`,
        `Last Error: ${r.lastError || 'none'}`,
        `────────────────────────────`,
      ].join('\n');
    },
  };

  // 9. Expose AivoEngine for debug/contract tests
  (window as any).AivoEngine = AivoEngine;
  (window as any).AivoEngineInstance = engine;

  // 10. Enable debug overlay if window.AivoDebug = true
  Object.defineProperty(window, 'AivoDebug', {
    get: () => false,
    set: (v: boolean) => { if (v) engine.debugOverlay.enable(() => engine.getDebugReport()); else engine.debugOverlay.disable(); },
    configurable: true,
  });

  logger.info('Boot', 'AIVO nasceu — vivo para sempre');
}

/* ── Auto-init ── */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
// Fallback
window.addEventListener('load', () => { if (!rootCreated) boot(); });

export default boot;
