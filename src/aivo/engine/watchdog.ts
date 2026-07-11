/**
 * 🎭 AIVO — Watchdog
 *
 * Monitors the mascot continuously.
 * If the mascot disappears (DOM, visibility, or display:none):
 *   Wait 2 seconds → Rebuild complete
 *
 * No polling — uses observers + periodic heartbeat.
 */

import { WATCHDOG_TIMEOUT_MS } from './constants';
import { AivoLogger } from './logger';

let instance: Watchdog | null = null;

export class Watchdog {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private isArmed = false;
  private destroyed = false;
  private onTimeout: (() => void) | null = null;
  private logger = AivoLogger.getInstance();
  private checkFn: (() => boolean) | null = null;

  /* ── Singleton ── */

  static getInstance(): Watchdog {
    if (!instance) instance = new Watchdog();
    return instance;
  }

  static resetInstance(): void {
    if (instance) {
      instance.destroy();
      instance = null;
    }
  }

  /* ── Configuration ── */

  set checkHealth(fn: (() => boolean) | null) {
    this.checkFn = fn;
  }

  set onTimeoutRebuild(fn: (() => void) | null) {
    this.onTimeout = fn;
  }

  /* ── Arm / Disarm ── */

  /** Call this every heartbeat tick to check health */
  tick(): void {
    if (this.destroyed) return;

    const isHealthy = this.checkFn ? this.checkFn() : true;

    if (!isHealthy) {
      // Mascot disappeared — start countdown
      if (!this.isArmed) {
        this.isArmed = true;
        this.logger.warn('Watchdog', 'Mascot disappeared, starting countdown');

        this.timer = setTimeout(() => {
          if (this.isArmed && this.onTimeout && !this.destroyed) {
            this.logger.error('Watchdog', 'Mascot still missing after 2s — rebuilding');
            this.onTimeout();
          }
          this.isArmed = false;
        }, WATCHDOG_TIMEOUT_MS);
      }
    } else {
      // Mascot is healthy — disarm
      if (this.isArmed) {
        this.disarm();
        this.logger.debug('Watchdog', 'Mascot reappeared, disarming');
      }
    }
  }

  /** Feed the watchdog — health confirmed */
  feed(): void {
    if (this.isArmed) {
      this.disarm();
    }
  }

  private disarm(): void {
    this.isArmed = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  /* ── Status ── */

  isWatchdogArmed(): boolean {
    return this.isArmed;
  }

  /* ── Destroy ── */

  destroy(): void {
    this.destroyed = true;
    this.disarm();
    this.onTimeout = null;
    this.checkFn = null;
    instance = null;
  }
}
