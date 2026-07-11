/**
 * 🎭 AIVO — Debug Overlay
 *
 * Visual debug panel showing real-time system state.
 * Activated by: window.__AIVO_DEBUG__ = true
 *
 * Shows:
 * - Current State
 * - Current Target
 * - Queue length
 * - Emotion
 * - Position
 * - React Mounted
 * - Visible
 * - FPS
 * - Last Event
 * - Heartbeat
 * - Locks
 * - Timeouts
 */

import { DEBUG_OVERLAY_ID, DEBUG_TRIGGER } from './constants';
import type { DebugReport } from './types';

let instance: DebugOverlay | null = null;
let enabled = false;

export class DebugOverlay {
  private el: HTMLElement | null = null;
  private getDebugReport: (() => DebugReport) | null = null;
  private updateTimer: ReturnType<typeof setInterval> | null = null;
  private destroyed = false;

  /* ── Singleton ── */

  static getInstance(): DebugOverlay {
    if (!instance) instance = new DebugOverlay();
    return instance;
  }

  static resetInstance(): void {
    if (instance) {
      instance.destroy();
      instance = null;
    }
  }

  /* ── Enable / Disable ── */

  enable(reportFn: () => DebugReport): void {
    if (enabled) return;
    enabled = true;
    this.getDebugReport = reportFn;
    this.createOverlay();

    // Listen for keyboard toggle: Ctrl+Shift+D
    document.addEventListener('keydown', this.handleKeydown);
  }

  disable(): void {
    enabled = false;
    this.destroy();
  }

  isEnabled(): boolean {
    return enabled;
  }

  /* ── Create Overlay ── */

  private createOverlay(): void {
    if (this.el) return;

    const el = document.createElement('div');
    el.id = DEBUG_OVERLAY_ID;
    el.style.cssText = [
      'position:fixed',
      'bottom:0',
      'right:0',
      'width:320px',
      'max-height:50vh',
      'overflow-y:auto',
      'background:rgba(0,0,0,0.85)',
      'color:#00ff88',
      'font-family:monospace',
      'font-size:11px',
      'padding:12px',
      'z-index:99999',
      'border-radius:8px 0 0 0',
      'border:1px solid #00ff88',
      'pointer-events:auto',
    ].join(';');

    document.body.appendChild(el);
    this.el = el;

    // Start updating
    this.updateTimer = setInterval(() => this.update(), 200);
    this.update();
  }

  /* ── Update ── */

  private update(): void {
    if (!this.el || !this.getDebugReport) return;

    const report = this.getDebugReport();
    const phaseColors: Record<string, string> = {
      BOOT: '#ffaa00',
      IDLE: '#00ff88',
      WAITING: '#88ccff',
      MOVING: '#ff8800',
      SPEAKING: '#00ccff',
      THINKING: '#cc88ff',
      CELEBRATING: '#ffdd00',
      ERROR: '#ff4444',
      RETURN_HOME: '#ff66aa',
    };

    const phaseColor = phaseColors[report.engine.phase] || '#ffffff';
    const healthColor = report.health.status === 'ok' ? '#00ff88'
      : report.health.status === 'warning' ? '#ffaa00'
      : '#ff4444';

    this.el.innerHTML = `
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #333">
        <strong style="color:#fff">🎭 AIVO DEBUG</strong>
        <span style="color:#888;font-size:10px">${report.engine.phase} · ${report.fps}FPS</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:10px;line-height:1.6">
        <span style="color:#888">Phase:</span><span style="color:${phaseColor};font-weight:bold">${report.engine.phase}</span>
        <span style="color:#888">Prev Phase:</span><span>${report.engine.previousPhase || '—'}</span>
        <span style="color:#888">Emotion:</span><span style="color:#88ccff">${report.emotion.current}</span>
        <span style="color:#888">Target:</span><span>${report.presence.currentAnchor || '—'}</span>
        <span style="color:#888">Queue:</span><span>${report.queue.length} (processing: ${report.queue.processing})</span>
        <span style="color:#888">Position:</span><span>${report.presence.currentPosition ? `(${Math.round(report.presence.currentPosition.x)}, ${Math.round(report.presence.currentPosition.y)})` : '—'}</span>
        <span style="color:#888">React Root:</span><span style="color:${report.renderer.rootExists ? '#00ff88' : '#ff4444'}">${report.renderer.rootExists ? '✅' : '❌'}</span>
        <span style="color:#888">Visible:</span><span style="color:${report.presence.isVisible ? '#00ff88' : '#ffaa00'}">${report.presence.isVisible ? '✅' : '❌'}</span>
        <span style="color:#888">Container:</span><span style="color:${report.health.checks.container ? '#00ff88' : '#ff4444'}">${report.health.checks.container ? '✅' : '❌'}</span>
        <span style="color:#888">Standby:</span><span>${report.presence.isStandby ? '✅' : '❌'}</span>
        <span style="color:#888">Health:</span><span style="color:${healthColor}">${report.health.status}</span>
        <span style="color:#888">FPS:</span><span style="color:${report.fps >= 30 ? '#00ff88' : report.fps >= 15 ? '#ffaa00' : '#ff4444'}">${report.fps}</span>
        <span style="color:#888">Locks:</span><span>${report.locks.length > 0 ? report.locks.map(l => l.type + '🔒').join(', ') : 'none'}</span>
        <span style="color:#888">Uptime:</span><span>${Math.round(report.uptimeMs / 1000)}s</span>
        <span style="color:#888">Version:</span><span style="color:#888;font-size:9px">${report.version} (${report.commit.slice(0, 8)})</span>
      </div>
      <div style="margin-top:6px;padding-top:4px;border-top:1px solid #333;font-size:9px;color:#666">
        Ctrl+Shift+D to toggle · ${new Date().toLocaleTimeString()}
      </div>
    `;
  }

  /* ── Keyboard Toggle ── */

  private handleKeydown = (e: KeyboardEvent): void => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      e.preventDefault();
      if (enabled) {
        this.disable();
      } else {
        // Can't re-enable without report function — let checkIfEnabled
      }
    }
  };

  /* ── Check if enabled via window flag ── */

  static checkAndEnable(reportFn: () => DebugReport): void {
    if ((window as any)[DEBUG_TRIGGER]) {
      DebugOverlay.getInstance().enable(reportFn);
    }

    // Watch for flag
    let lastVal = !!(window as any)[DEBUG_TRIGGER];
    setInterval(() => {
      const current = !!(window as any)[DEBUG_TRIGGER];
      if (current !== lastVal) {
        lastVal = current;
        if (current) {
          DebugOverlay.getInstance().enable(reportFn);
        } else {
          DebugOverlay.getInstance().disable();
        }
      }
    }, 1000);
  }

  /* ── Destroy ── */

  destroy(): void {
    this.destroyed = true;
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
    if (this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
    this.el = null;
    this.getDebugReport = null;
    document.removeEventListener('keydown', this.handleKeydown);
    instance = null;
  }
}
