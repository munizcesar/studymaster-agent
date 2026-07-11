/**
 * 🎭 AIVO CORE — Debug + Logger
 *
 * - Logger: structured messages with timestamps
 * - Debug overlay: visual panel showing live state
 */

import type { DebugReport, EnginePhase, Emotion } from './types';
import { VERSION } from './constants';

/* ── AivoLogger ── */

let logInstance: AivoLogger | null = null;

export class AivoLogger {
  static getInstance(): AivoLogger {
    if (!logInstance) logInstance = new AivoLogger();
    return logInstance;
  }

  info(module: string, msg: string, data?: any): void {
    console.log(`[${new Date().toISOString().slice(11,23)}] [${module}] ${msg}`, data ?? '');
  }

  warn(module: string, msg: string, data?: any): void {
    console.warn(`[${new Date().toISOString().slice(11,23)}] ⚠️ [${module}] ${msg}`, data ?? '');
  }

  error(module: string, msg: string, data?: any): void {
    console.error(`[${new Date().toISOString().slice(11,23)}] ❌ [${module}] ${msg}`, data ?? '');
  }
}

/* ── Debug Overlay ── */

let overlayInstance: DebugOverlay | null = null;

export class DebugOverlay {
  private el: HTMLElement | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private getData: (() => DebugReport) | null = null;

  static getInstance(): DebugOverlay {
    if (!overlayInstance) overlayInstance = new DebugOverlay();
    return overlayInstance;
  }

  enable(fn: () => DebugReport): void {
    this.getData = fn;
    if (this.el) return;
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;bottom:0;right:0;width:300px;max-height:50vh;overflow-y:auto;background:#000c;color:#0f8;font:11px monospace;padding:10px;z-index:99999;border-radius:8px 0 0;border:1px solid #0f8';
    document.body.appendChild(el);
    this.el = el;
    this.timer = setInterval(() => this.update(), 200);
  }

  private update(): void {
    if (!this.el || !this.getData) return;
    const r = this.getData();
    const pc: Record<string,string> = {BOOT:'#fa0',IDLE:'#0f8',MOVING:'#f80',SPEAKING:'#0cf',THINKING:'#c8f',CELEBRATING:'#fd0',ERROR:'#f44',RETURN_HOME:'#f6a'};
    this.el.innerHTML = `<div style="display:flex;justify-content:space-between;border-bottom:1px solid #333;padding-bottom:4px;margin-bottom:4px"><b style="color:#fff">🎭 AIVO</b><span style="color:#888">${r.fps}FPS</span></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:2px;font-size:10px">
<span style="color:#888">Phase:</span><span style="color:${pc[r.phase]||'#fff'};font-weight:bold">${r.phase}</span>
<span style="color:#888">Emotion:</span><span style="color:#8cf">${r.emotion}</span>
<span style="color:#888">Target:</span><span>${r.anchor||'—'}</span>
<span style="color:#888">Queue:</span><span>${r.queueLength}</span>
<span style="color:#888">Position:</span><span>${r.position?`(${Math.round(r.position.x)},${Math.round(r.position.y)})`:'—'}</span>
<span style="color:#888">Root:</span><span style="color:${r.rootExists?'#0f8':'#f44'}">${r.rootExists?'✅':'❌'}</span>
<span style="color:#888">Container:</span><span style="color:${r.containerExists?'#0f8':'#f44'}">${r.containerExists?'✅':'❌'}</span>
<span style="color:#888">Uptime:</span><span>${Math.round(r.uptimeMs/1000)}s</span>
</div>`;
  }

  disable(): void {
    if (this.timer) clearInterval(this.timer);
    this.el?.remove();
    this.el = null;
    overlayInstance = null;
  }
}
