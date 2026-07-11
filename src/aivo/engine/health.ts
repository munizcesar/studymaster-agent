/**
 * 🎭 AIVO — Health Monitor (Enterprise)
 *
 * Heartbeat every 1000ms (user spec).
 * Checks: React Root, Container, DOM, Visibility, State, Queue, FPS.
 * Feeds Watchdog on each tick.
 */

import type { HealthReport } from './types';
import { HEARTBEAT_INTERVAL_MS, FPS_SAMPLE_WINDOW, FPS_LOW_THRESHOLD } from './constants';
import { EventBus } from './events';
import { AivoLogger } from './logger';
import { Watchdog } from './watchdog';

let instance: HealthMonitor | null = null;

export class HealthMonitor {
  private events: EventBus;
  private logger = AivoLogger.getInstance();
  private watchdog = Watchdog.getInstance();

  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private fpsHistory: number[] = [];
  private lastFrameTime = performance.now();
  private frameCount = 0;
  private currentFps = 60;
  private animFrameId: number | null = null;
  private destroyed = false;
  private lastHeartbeat = Date.now();

  checks: HealthReport['checks'] = {
    root: false, container: false, renderer: false, motion: false,
    queue: false, presence: false, state: false, phase: false,
    visibility: false, dom: false,
  };

  // External health check (set by engine)
  checkHealth: (() => boolean) | null = null;

  static getInstance(): HealthMonitor {
    if (!instance) instance = new HealthMonitor(EventBus.getInstance());
    return instance;
  }

  static resetInstance(): void {
    if (instance) { instance.destroy(); instance = null; }
  }

  private constructor(events: EventBus) { this.events = events; }

  start(): void {
    if (this.heartbeatTimer) return;
    this.startFpsMonitor();
    this.heartbeatTimer = setInterval(() => this.tick(), HEARTBEAT_INTERVAL_MS);
    this.logger.info('Health', `Monitor started (${HEARTBEAT_INTERVAL_MS}ms interval)`);
  }

  private startFpsMonitor(): void {
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    const tick = (now: number) => {
      if (this.destroyed) return;
      this.frameCount++;
      if (now - this.lastFrameTime >= 1000) {
        this.currentFps = Math.round((this.frameCount * 1000) / (now - this.lastFrameTime));
        this.fpsHistory.push(this.currentFps);
        if (this.fpsHistory.length > FPS_SAMPLE_WINDOW) this.fpsHistory.shift();
        this.frameCount = 0;
        this.lastFrameTime = now;
      }
      this.animFrameId = requestAnimationFrame(tick);
    };
    this.animFrameId = requestAnimationFrame(tick);
  }

  /** Heartbeat tick — runs every 1000ms */
  private tick(): void {
    if (this.destroyed) return;
    this.lastHeartbeat = Date.now();

    const mascotOk = this.checkHealth ? this.checkHealth() : true;
    const allChecksOk = Object.values(this.checks).every(Boolean);
    const fpsOk = this.currentFps >= FPS_LOW_THRESHOLD;

    this.events.emit('aivo:heartbeat' as any, {
      checks: this.checks, fps: this.currentFps, mascotOk,
    });

    if (!allChecksOk) {
      this.events.emit('health:warning', { checks: this.checks, fps: this.currentFps });
    } else if (!fpsOk) {
      this.events.emit('health:warning', { checks: this.checks, fps: this.currentFps, message: 'Low FPS' });
    } else {
      this.events.emit('health:ok', { checks: this.checks, fps: this.currentFps });
    }

    if (!this.checks.root || !this.checks.container || this.currentFps === 0) {
      this.events.emit('health:critical', { checks: this.checks, fps: this.currentFps });
    }

    // Feed the watchdog
    this.watchdog.feed();
  }

  getFps(): number { return this.currentFps; }
  getAverageFps(): number {
    if (this.fpsHistory.length === 0) return 60;
    return Math.round(this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length);
  }

  getReport(): HealthReport {
    return {
      status: !this.checks.root || !this.checks.container ? 'critical'
        : Object.values(this.checks).some(v => !v) ? 'warning' : 'ok',
      checks: { ...this.checks },
      fps: this.currentFps,
      memory: (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
      } : null,
      uptimeMs: performance.now(),
      lastHeartbeat: this.lastHeartbeat,
    };
  }

  destroy(): void {
    this.destroyed = true;
    if (this.heartbeatTimer) { clearInterval(this.heartbeatTimer); this.heartbeatTimer = null; }
    if (this.animFrameId !== null) { cancelAnimationFrame(this.animFrameId); this.animFrameId = null; }
    this.fpsHistory = []; instance = null;
  }
}
