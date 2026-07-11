/**
 * 🎭 AIVO — Motion Controller
 *
 * Responsible ONLY for:
 * - Bezier curves
 * - Spring physics
 * - Easing functions
 * - Velocity calculations
 *
 * No other module moves the mascot.
 */

import type { MovePosition } from './types';
import {
  MASCOT_DEFAULT_SIZE,
  MOVEMENT_GAP,
  PHASE_PREPARE_MS,
  PHASE_FLIGHT_MS,
  PHASE_ARRIVE_MS,
} from './constants';
import { AivoLogger } from './logger';

let instance: MotionController | null = null;

interface SpringConfig {
  stiffness: number;
  damping: number;
  mass: number;
}

interface AnimationPhase {
  name: 'prepare' | 'flight' | 'arrive' | 'standby' | 'none';
  duration: number;
  easing: string;
}

export class MotionController {
  private logger = AivoLogger.getInstance();

  /* ── Singleton ── */

  static getInstance(): MotionController {
    if (!instance) instance = new MotionController();
    return instance;
  }

  static resetInstance(): void {
    instance = null;
  }

  /* ── Position Calculation ── */

  calcPositionFromElement(targetEl: Element, mascotSize: number = MASCOT_DEFAULT_SIZE): MovePosition | null {
    const rect = targetEl.getBoundingClientRect();
    const size = mascotSize;
    const gap = MOVEMENT_GAP;

    // Try right side
    const spaceRight = window.innerWidth - rect.right;
    if (spaceRight >= size + gap) {
      return {
        x: rect.right + gap,
        y: rect.top + rect.height / 2 - size / 2,
        rotate: -2,
        side: 'right',
      };
    }

    // Try left side
    if (rect.left >= size + gap) {
      return {
        x: rect.left - size - gap,
        y: rect.top + rect.height / 2 - size / 2,
        rotate: 2,
        side: 'left',
      };
    }

    // Center below
    return {
      x: rect.left + rect.width / 2 - size / 2,
      y: rect.bottom + gap,
      rotate: -1,
      side: 'bottom',
    };
  }

  calcTiltAngle(fromX: number, fromY: number, toX: number, toY: number): number {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return Math.max(-8, Math.min(8, angle * 0.08));
  }

  /* ── Animation Phases ── */

  getPhase(phaseName: AnimationPhase['name']): AnimationPhase {
    switch (phaseName) {
      case 'none':
        return { name: 'none', duration: 0, easing: 'none' };
      case 'prepare':
        return { name: 'prepare', duration: PHASE_PREPARE_MS, easing: 'none' };
      case 'flight':
        return { name: 'flight', duration: PHASE_FLIGHT_MS, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' };
      case 'arrive':
        return { name: 'arrive', duration: PHASE_ARRIVE_MS, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' };
      case 'standby':
        return { name: 'standby', duration: 400, easing: 'ease' };
    }
  }

  /* ── Spring Configs ── */

  getSpringConfig(type: 'body' | 'eyes' | 'lean'): SpringConfig {
    switch (type) {
      case 'body':
        return { stiffness: 160, damping: 22, mass: 1.3 };
      case 'eyes':
        return { stiffness: 260, damping: 20, mass: 1 };
      case 'lean':
        return { stiffness: 90, damping: 14, mass: 1 };
    }
  }

  /* ── Transform Builders ── */

  buildTransformString(x: number, y: number, scale: number = 1, rotate: number = 0): string {
    return `translate3d(${x}px, ${y}px, 0) scale(${scale}) rotate(${rotate}deg)`;
  }

  getPhaseTransition(phase: AnimationPhase['name']): string {
    const p = this.getPhase(phase);
    if (p.name === 'none') return 'none';
    return `transform ${p.duration}ms ${p.easing}`;
  }

  /* ── Force Layout ── */

  forceLayout(el: HTMLElement): void {
    void el.offsetHeight;
  }

  /* ── Timing ── */

  getTotalMoveDuration(): number {
    return PHASE_PREPARE_MS + PHASE_FLIGHT_MS + PHASE_ARRIVE_MS;
  }

  /* ── Total move timeout (user spec: 800ms) ── */

  getMoveTimeout(): number {
    return 800;
  }

  destroy(): void {
    instance = null;
  }
}
