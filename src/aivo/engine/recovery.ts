/**
 * 🎭 AIVO — Recovery System (Enterprise Self-Healing)
 *
 * Integrates with RecoveryController for exception/timeout/DOM recovery.
 * No page refresh. No user intervention.
 *
 * Detection triggers:
 * - Exception → Recovery()
 * - Promise rejection → Recovery()
 * - DOM lost → Recovery()
 * - Target inexistent → Home()
 * - Timeout → Recovery()
 */

import type { HealthReport } from './types';
import { RECOVERY_MAX_ATTEMPTS, RECOVERY_COOLDOWN_MS } from './constants';
import { EventBus } from './events';
import { RecoveryController, type RecoveryPlan } from './recovery-controller';
import { AivoLogger } from './logger';
import type { Renderer } from './renderer';
import type { PresenceManager } from './presence';

let instance: RecoverySystem | null = null;

export class RecoverySystem {
  private events: EventBus;
  private recoveryController: RecoveryController;
  private logger = AivoLogger.getInstance();
  private attemptCount = 0;
  private lastAttemptTime = 0;
  private inRecovery = false;
  private destroyed = false;

  // External hooks (set by Engine)
  setRenderer: ((renderer: Renderer) => boolean) | null = null;
  setPresence: ((presence: PresenceManager) => boolean) | null = null;
  rebootEngine: (() => boolean) | null = null;
  goHome: (() => void) | null = null;
  resetState: (() => void) | null = null;

  static getInstance(): RecoverySystem {
    if (!instance) instance = new RecoverySystem(
      EventBus.getInstance(), RecoveryController.getInstance()
    );
    return instance;
  }

  static resetInstance(): void { instance = null; }

  private constructor(events: EventBus, recoveryController: RecoveryController) {
    this.events = events;
    this.recoveryController = recoveryController;

    // Wire RecoveryController to this system
    this.recoveryController.onRecovery = (plan: RecoveryPlan) => this.executePlan(plan);
  }

  /* ── Attempt Recovery ── */

  attempt(healthReport: HealthReport): boolean {
    if (this.destroyed || this.inRecovery) return false;
    if (Date.now() - this.lastAttemptTime < RECOVERY_COOLDOWN_MS) return false;
    if (this.attemptCount >= RECOVERY_MAX_ATTEMPTS) {
      this.events.emit('recovery:failed', { attempts: this.attemptCount, reason: 'Max attempts' });
      return false;
    }

    this.inRecovery = true;
    this.attemptCount++;
    this.lastAttemptTime = Date.now();

    this.events.emit('recovery:start', { attempt: this.attemptCount, checks: healthReport.checks });
    this.logger.warn('Recovery', `Attempt #${this.attemptCount}`, { checks: healthReport.checks });

    let recovered = false;

    if (!healthReport.checks.container && this.setPresence) {
      recovered = this.setPresence(PresenceManager.getInstance()) || recovered;
    }
    if (!healthReport.checks.root && this.setRenderer) {
      recovered = this.setRenderer(Renderer.getInstance()) || recovered;
    }
    if (!recovered && this.rebootEngine) {
      recovered = this.rebootEngine();
    }
    if (!recovered && this.goHome) {
      this.goHome();
      recovered = true; // At least go home
    }

    this.inRecovery = false;

    if (recovered) {
      this.events.emit('recovery:complete', { attempt: this.attemptCount });
      this.logger.info('Recovery', `Complete (#${this.attemptCount})`);
      this.attemptCount = 0;
    }

    return recovered;
  }

  /* ── Execute Recovery Plan (from RecoveryController) ── */

  executePlan(plan: RecoveryPlan): void {
    this.logger.warn('Recovery', `Executing plan: ${JSON.stringify(plan.actions)}`);
    this.events.emit('recovery:start', { plan });

    for (const action of plan.actions) {
      switch (action) {
        case 'go_home':
          this.goHome?.();
          break;
        case 'reset_state':
          this.resetState?.();
          break;
        case 'reinit_presence':
          this.setPresence?.(PresenceManager.getInstance());
          break;
        case 'reinit_renderer':
          this.setRenderer?.(Renderer.getInstance());
          break;
        case 'reboot_engine':
          this.rebootEngine?.();
          break;
      }
    }
  }

  /* ── Exception Handler ── */

  handleException(error: Error, source: string): void {
    const plan = this.recoveryController.handleException(error, source);
    this.executePlan(plan);
  }

  handleDOMLost(): void {
    const plan = this.recoveryController.handleDOMLost();
    this.executePlan(plan);
  }

  handleTimeout(timeoutMs: number, operation: string): void {
    const plan = this.recoveryController.handleTimeout(timeoutMs, operation);
    this.executePlan(plan);
  }

  /* ── Getters ── */

  getAttemptCount(): number { return this.attemptCount; }
  isInRecovery(): boolean { return this.inRecovery; }
  canRecover(): boolean {
    return !this.destroyed && !this.inRecovery
      && this.attemptCount < RECOVERY_MAX_ATTEMPTS
      && Date.now() - this.lastAttemptTime >= RECOVERY_COOLDOWN_MS;
  }

  reset(): void { this.attemptCount = 0; this.lastAttemptTime = 0; this.inRecovery = false; }
  destroy(): void { this.destroyed = true; this.setRenderer = null; this.setPresence = null; this.rebootEngine = null; this.resetState = null; this.goHome = null; instance = null; }
}
