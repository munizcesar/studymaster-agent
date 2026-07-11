/**
 * 🎭 AIVO — Emotion Controller
 *
 * ONLY this module is authorized to change the mascot's emotion.
 * All external requests go through here.
 * Wraps the emotion state machine with validation + logging.
 */

import type { EmotionState } from './types';
import { VALID_EMOTION_TRANSITIONS } from './types';
import { AivoLogger } from './logger';

let instance: EmotionController | null = null;

export class EmotionController {
  private current: EmotionState = 'idle';
  private previous: EmotionState | null = null;
  private onEmotionChange: ((state: EmotionState, previous: EmotionState | null) => void) | null = null;
  private logger = AivoLogger.getInstance();

  /* ── Singleton ── */

  static getInstance(): EmotionController {
    if (!instance) instance = new EmotionController();
    return instance;
  }

  static resetInstance(): void {
    instance = null;
  }

  /* ── Set Emotion (only entry point) ── */

  set(target: EmotionState): boolean {
    if (target === this.current) return true;

    // Validate transition
    const allowed =
      this.current === 'hidden'
        ? true
        : VALID_EMOTION_TRANSITIONS[this.current]?.includes(target);

    if (!allowed) {
      this.logger.warn('Emotion', `Invalid transition: ${this.current} → ${target}`, {
        allowed: VALID_EMOTION_TRANSITIONS[this.current],
      });
      return false;
    }

    this.previous = this.current;
    this.current = target;

    this.logger.info('Emotion', `${this.previous} → ${this.current}`);

    if (this.onEmotionChange) {
      this.onEmotionChange(this.current, this.previous);
    }

    return true;
  }

  /* ── Callbacks ── */

  set onChange(fn: ((state: EmotionState, previous: EmotionState | null) => void) | null) {
    this.onEmotionChange = fn;
  }

  /* ── Getters ── */

  getCurrent(): EmotionState {
    return this.current;
  }

  getPrevious(): EmotionState | null {
    return this.previous;
  }

  canTransition(target: EmotionState): boolean {
    if (target === this.current) return true;
    if (this.current === 'hidden') return true;
    return VALID_EMOTION_TRANSITIONS[this.current]?.includes(target) ?? false;
  }

  /* ── Lifecycle ── */

  reset(): void {
    this.current = 'idle';
    this.previous = null;
  }

  destroy(): void {
    this.onEmotionChange = null;
    this.reset();
    instance = null;
  }
}
