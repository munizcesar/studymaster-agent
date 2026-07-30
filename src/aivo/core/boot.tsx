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
import { AivoGlobalChat } from './chat-ui';
import { MessageCircle } from 'lucide-react';

/**
 * Componente flutuante do mascote — usa createPortal para sair
 * de QUALQUER hierarquia DOM e viver direto no document.body.
 */
function AivoFloatingAvatar({ engine }: { engine: any }) {
  const [emotion, setEmotion] = useState<string>('idle');
  const [chatState, setChatState] = useState<'closed' | 'opening' | 'open' | 'closing'>('closed');
  
  // Backward compatibility state
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

  const handleFabClick = () => {
    // If a legacy chat is present, we might want to toggle that instead, 
    // but the spec says to implement the Global Chat and prepare for migration.
    // For now, we open the global chat unless Redbot is specifically active and we want to fallback.
    
    // Check if legacy chats are on screen and should take precedence
    if ((window as any).coachRedbot?.toggleSidebar && document.querySelector('.redbot-sidebar')) {
      (window as any).coachRedbot.toggleSidebar();
      return;
    }

    if ((window as any).profAivosMentor?.openChat && document.querySelector('.prof-aivos-chat-area')) {
      (window as any).profAivosMentor.openChat();
      return;
    }

    if (chatState === 'closed') {
      setChatState('opening');
      setTimeout(() => setChatState('open'), 500); // 500ms mascot animation
    } else if (chatState === 'open') {
      setChatState('closing');
      setTimeout(() => setChatState('closed'), 500);
    }
  };

  const closeChat = () => {
    if (chatState === 'open') {
      setChatState('closing');
      setTimeout(() => setChatState('closed'), 500);
    }
  };

  // Safe area bottom calculation or simple fixed bottom
  const bottomOffset = 20;

  const content = (
    <div style={{ pointerEvents: 'none', position: 'fixed', bottom: 0, right: 0, top: 0, left: 0, zIndex: 99999 }}>
      
      {/* 
        Legacy Tour Bubble (kept for compatibility)
      */}
      {showBubble && message && chatState === 'closed' && (
        <div className="mascot-wrapper" style={{ pointerEvents: 'auto', position: 'fixed', bottom: 90, right: 20 }}>
          <div className="speech-bubble">
            {message}
            <button onClick={handleDismiss} className="btn-entendi">Entendi &gt;</button>
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={handleFabClick}
        aria-label="Abrir Assistente Aivo"
        aria-expanded={chatState === 'open' || chatState === 'opening'}
        style={{
          position: 'fixed',
          bottom: bottomOffset,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: '28px',
          backgroundColor: 'var(--primary-color, #1a1a1a)',
          color: '#fff',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          pointerEvents: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transition: 'transform 0.2s, background-color 0.2s',
          zIndex: 100000
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
         {chatState === 'open' ? (
           <span style={{ fontSize: 24, lineHeight: 1 }}>×</span>
         ) : (
           <MessageCircle size={28} />
         )}
      </button>

      {/* Animated Mascot */}
      <div
        style={{
          position: 'fixed',
          bottom: chatState === 'closed' || chatState === 'closing' ? bottomOffset + 28 : 560, // Animates up to chat area
          right: chatState === 'closed' || chatState === 'closing' ? 48 : 50,
          transform: chatState === 'closed' || chatState === 'closing' ? 'scale(0)' : 'scale(1)',
          opacity: chatState === 'closed' ? 0 : 1,
          transition: 'bottom 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), right 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.4s ease, opacity 0.3s ease',
          pointerEvents: 'none',
          zIndex: 100001
        }}
      >
        <Aivo size={64} state={emotion as any} themeMode="dark" />
      </div>

      {/* Global Chat UI */}
      <div style={{ pointerEvents: 'auto' }}>
        <AivoGlobalChat isOpen={chatState === 'open'} onClose={closeChat} />
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
