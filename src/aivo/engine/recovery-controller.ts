/**
 * 🎭 AIVO — Recovery Controller
 *
 * Handles all failure scenarios:
 * - Exception
 * - Promise rejection
 * - DOM lost
 * - Target inexistent
 * - Timeout
 *
 * On any failure: cancel() → Recovery()
 */

import { AivoLogger } from './logger';

let instance: RecoveryController | null = null;

type RecoveryAction =
  | 'reinit_presence'
  | 'reinit_renderer'
  | 'recreate_root'
  | 'reboot_engine'
  | 'go_home'
  | 'reset_state'
  | 'restore_dom';

interface RecoveryPlan {
  actions: RecoveryAction[];
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class RecoveryController {
  private onRecoveryNeeded: ((plan: RecoveryPlan) => void) | null = null;
  private logger = AivoLogger.getInstance();

  /* ── Singleton ── */

  static getInstance(): RecoveryController {
    if (!instance) instance = new RecoveryController();
    return instance;
  }

  static resetInstance(): void {
    instance = null;
  }

  /* ── Callbacks ── */

  set onRecovery(fn: ((plan: RecoveryPlan) => void) | null) {
    this.onRecoveryNeeded = fn;
  }

  /* ── Error Handlers ── */

  handleException(error: Error, source: string): RecoveryPlan {
    this.logger.error('Recovery', `Exception in ${source}: ${error.message}`, { stack: error.stack });

    const plan: RecoveryPlan = {
      actions: ['reset_state', 'go_home'],
      reason: `Exception in ${source}: ${error.message}`,
      severity: 'medium',
    };

    if (error.message.includes('React') || error.message.includes('createRoot')) {
      plan.actions = ['reinit_renderer', 'reboot_engine'];
      plan.severity = 'high';
    }

    if (error.message.includes('container') || error.message.includes('DOM')) {
      plan.actions = ['reinit_presence', 'reinit_renderer', 'reboot_engine'];
      plan.severity = 'critical';
    }

    this.trigger(plan);
    return plan;
  }

  handleDOMLost(): RecoveryPlan {
    this.logger.error('Recovery', 'DOM container lost');

    const plan: RecoveryPlan = {
      actions: ['restore_dom', 'reinit_presence', 'reinit_renderer', 'reboot_engine'],
      reason: 'DOM container lost',
      severity: 'critical',
    };

    this.trigger(plan);
    return plan;
  }

  handleTimeout(timeoutMs: number, operation: string): RecoveryPlan {
    this.logger.warn('Recovery', `Timeout: ${operation} exceeded ${timeoutMs}ms`);

    const plan: RecoveryPlan = {
      actions: ['go_home', 'reset_state'],
      reason: `Timeout in ${operation}: ${timeoutMs}ms`,
      severity: 'medium',
    };

    this.trigger(plan);
    return plan;
  }

  handleTargetLost(targetName: string): RecoveryPlan {
    this.logger.warn('Recovery', `Target lost: ${targetName}`);

    const plan: RecoveryPlan = {
      actions: ['go_home'],
      reason: `Target element lost: ${targetName}`,
      severity: 'low',
    };

    this.trigger(plan);
    return plan;
  }

  handlePromiseRejection(reason: any, source: string): RecoveryPlan {
    this.logger.error('Recovery', `Promise rejection in ${source}`, { reason });

    const plan: RecoveryPlan = {
      actions: ['reset_state', 'go_home'],
      reason: `Promise rejection in ${source}`,
      severity: 'medium',
    };

    this.trigger(plan);
    return plan;
  }

  /* ── Trigger ── */

  private trigger(plan: RecoveryPlan): void {
    if (this.onRecoveryNeeded) {
      this.onRecoveryNeeded(plan);
    }
  }

  /* ── Destroy ── */

  destroy(): void {
    this.onRecoveryNeeded = null;
    instance = null;
  }
}
