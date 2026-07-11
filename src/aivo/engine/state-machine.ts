/**
 * 🎭 AIVO — Engine Phase State Machine
 *
 * Controls what the engine is DOING (not what the mascot LOOKS like).
 * Phases: BOOT → IDLE → WAITING → MOVING → SPEAKING → THINKING → CELEBRATING → ERROR → RETURN_HOME
 *
 * EmotionController handles the mascot's emotion states separately.
 * This handles the engine's operational phases.
 */

import type { EnginePhase } from './types';
import { ENGINE_PHASE_TRANSITIONS } from './types';
import { EventBus } from './events';

let instance: EnginePhaseMachine | null = null;

export class EnginePhaseMachine {
  private current: EnginePhase = 'IDLE';
  private previous: EnginePhase | null = null;
  private events: EventBus;

  static getInstance(): EnginePhaseMachine {
    if (!instance) instance = new EnginePhaseMachine(EventBus.getInstance());
    return instance;
  }

  static resetInstance(): void {
    instance = null;
  }

  private constructor(events: EventBus) { this.events = events; }

  /** Transition to a new phase — ONLY entry point */
  transition(target: EnginePhase): boolean {
    if (target === this.current) return true;

    const allowed = ENGINE_PHASE_TRANSITIONS[this.current]?.includes(target);
    if (!allowed) {
      console.warn(`[PhaseMachine] Invalid: ${this.current} → ${target}`);
      return false;
    }

    this.previous = this.current;
    this.current = target;

    this.events.emit(`phase:${target.toLowerCase()}` as any, {
      from: this.previous,
      to: target,
    });
    this.events.emit('state:change', { from: this.previous, to: target, phase: target });

    return true;
  }

  getCurrent(): EnginePhase { return this.current; }
  getPrevious(): EnginePhase | null { return this.previous; }

  canTransition(target: EnginePhase): boolean {
    if (target === this.current) return true;
    return ENGINE_PHASE_TRANSITIONS[this.current]?.includes(target) ?? false;
  }

  isIn(...phases: EnginePhase[]): boolean {
    return phases.includes(this.current);
  }

  reset(): void { this.current = 'IDLE'; this.previous = null; }
  destroy(): void { this.reset(); instance = null; }
}
