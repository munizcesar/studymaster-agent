/**
 * 🎭 AIVO — Motion Engine
 *
 * Animation and movement utilities.
 * Handles the 3-phase movement animation (prepare → flight → arrive).
 * Pure functions — no side effects.
 */

import type { MovePosition } from './types';
import {
  PHASE_PREPARE_MS,
  PHASE_FLIGHT_MS,
  PHASE_ARRIVE_MS,
  MASCOT_DEFAULT_SIZE,
  MOVEMENT_GAP,
} from './constants';

/* ── Position Calculation ── */

export function calcPositionFromElement(
  targetEl: Element,
  mascotSize: number = MASCOT_DEFAULT_SIZE
): MovePosition | null {
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

export function calcTiltAngle(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number
): number {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  return Math.max(-8, Math.min(8, angle * 0.08));
}

/* ── Animation Phase CSS ── */

export function getPhaseTransition(
  phase: 'none' | 'prepare' | 'flight' | 'arrive' | 'standby'
): string {
  switch (phase) {
    case 'none':
      return 'none';
    case 'prepare':
      return 'none'; // Instant tilt
    case 'flight':
      return `transform ${PHASE_FLIGHT_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`;
    case 'arrive':
      return `transform ${PHASE_ARRIVE_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
    case 'standby':
      return 'opacity 0.4s ease, transform 0.4s ease';
    default:
      return '';
  }
}

export function buildTransformString(
  x: number,
  y: number,
  scale: number = 1,
  rotate: number = 0
): string {
  return `translate3d(${x}px, ${y}px, 0) scale(${scale}) rotate(${rotate}deg)`;
}

/* ── Timing ── */

export function getPhaseDuration(phase: 'prepare' | 'flight' | 'arrive'): number {
  switch (phase) {
    case 'prepare':
      return PHASE_PREPARE_MS;
    case 'flight':
      return PHASE_FLIGHT_MS;
    case 'arrive':
      return PHASE_ARRIVE_MS;
  }
}

export function getTotalMoveDuration(): number {
  return PHASE_PREPARE_MS + PHASE_FLIGHT_MS + PHASE_ARRIVE_MS;
}

/* ── Force Layout (for CSS transitions) ── */

export function forceLayout(el: HTMLElement): void {
  void el.offsetHeight; // eslint-disable-line @typescript-eslint/no-unused-expressions
}
