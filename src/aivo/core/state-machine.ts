/**
 * 🎭 AIVO CORE — State Machine
 *
 * Single authority for engine phase + emotion.
 * Only the Engine calls these methods.
 */

import type { EnginePhase, Emotion } from './types';
import { PHASE_TRANSITIONS } from './types';
import { EventBus } from './event-bus';

let instance: StateMachine | null = null;

export class StateMachine {
  private _phase: EnginePhase = 'IDLE';
  private _emotion: Emotion = 'idle';
  private events = EventBus.getInstance();

  static getInstance(): StateMachine {
    if (!instance) instance = new StateMachine();
    return instance;
  }

  /* ── Phase ── */

  setPhase(target: EnginePhase): boolean {
    if (target === this._phase) return true;
    if (!PHASE_TRANSITIONS[this._phase]?.includes(target)) return false;
    this._phase = target;
    this.events.emit('phase:change', { phase: target });
    return true;
  }

  get phase(): EnginePhase { return this._phase; }
  isPhase(...phases: EnginePhase[]): boolean { return phases.includes(this._phase); }

  /* ── Emotion ── */

  setEmotion(target: Emotion): boolean {
    if (target === this._emotion) return true;
    this._emotion = target;
    this.events.emit('emotion:change', { emotion: target });
    return true;
  }

  get emotion(): Emotion { return this._emotion; }

  /* ── Reset ── */

  reset(): void { this._phase = 'IDLE'; this._emotion = 'idle'; }
}
