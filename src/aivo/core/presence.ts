/**
 * 🎭 AIVO CORE — Presence
 *
 * Manages the ONE #aivo-presence container.
 * 3-phase movement (prepare → flight → arrive).
 * HOME position is permanent fallback.
 * Never destroyed. Never recreated.
 */

import type { Position } from './types';
import {
  PRESENCE_ID, HOME_X, HOME_Y, MASCOT_SIZE, STANDBY_SCALE,
  PHASE_PREPARE_MS, PHASE_FLIGHT_MS, PHASE_ARRIVE_MS, GAP,
} from './constants';
import { AnchorRegistry } from './anchors';
import { CommandQueue } from './queue';

let instance: PresenceManager | null = null;

export class PresenceManager {
  private el: HTMLElement | null = null;
  private timers: ReturnType<typeof setTimeout>[] = [];
  private anchors = AnchorRegistry.getInstance();
  private queue = CommandQueue.getInstance();
  private _currentAnchor: string | null = null;

  static getInstance(): PresenceManager {
    if (!instance) instance = new PresenceManager();
    return instance;
  }

  get currentAnchor(): string | null { return this._currentAnchor; }

  init(): boolean {
    if (this.el) return true;
    if (!document.body) return false;
    if (document.getElementById(PRESENCE_ID)) {
      this.el = document.getElementById(PRESENCE_ID) as HTMLElement;
      return true;
    }
    const el = document.createElement('div');
    el.id = PRESENCE_ID;
    el.style.cssText = [
      'position:fixed', 'z-index:9000', 'pointer-events:none',
      'will-change:transform,opacity',
      `transform:translate3d(0,0,0) scale(${STANDBY_SCALE})`,
      'opacity:0', 'transition:opacity 0.5s ease, transform 0.5s ease',
    ].join(';');
    document.body.appendChild(el);
    this.el = el;
    return true;
  }

  getContainer(): HTMLElement | null { return this.el; }

  moveToAnchor(anchorName: string, onComplete?: () => void): void {
    if (!this.el) { onComplete?.(); this.queue.done(); return; }

    const rect = this.anchors.getRect(anchorName);
    if (!rect) { this._currentAnchor = null; this.goHome(onComplete); return; }

    this._currentAnchor = anchorName;
    const size = MASCOT_SIZE;
    let pos: Position;

    if (window.innerWidth - rect.right >= size + GAP) {
      pos = { x: rect.right + GAP, y: rect.top + rect.height / 2 - size / 2, rotate: -2, side: 'right' };
    } else if (rect.left >= size + GAP) {
      pos = { x: rect.left - size - GAP, y: rect.top + rect.height / 2 - size / 2, rotate: 2, side: 'left' };
    } else {
      pos = { x: rect.left + rect.width / 2 - size / 2, y: rect.bottom + GAP, rotate: -1, side: 'bottom' };
    }

    this.animate(pos, onComplete);
  }

  goHome(onComplete?: () => void): void {
    this._currentAnchor = null;
    const homeX = window.innerWidth - MASCOT_SIZE - 16;
    const homeY = window.innerHeight - MASCOT_SIZE - 100;
    this.animate({ x: homeX, y: homeY, rotate: 0, side: 'bottom' }, onComplete);
  }

  private animate(pos: Position, onComplete?: () => void): void {
    this.cancel(); // Clear previous timers (does NOT call queue.done() — see cancel())
    const el = this.el!;

    // If hidden or uninitialized, just appear at position
    if (el.style.opacity === '0' || el.style.opacity === '') {
      el.style.transition = 'none';
      el.style.transform = `translate3d(${pos.x}px,${pos.y}px,0) scale(1)`;
      void el.offsetHeight;
      el.style.transition = 'opacity 0.3s ease';
      el.style.opacity = '1';
      el.setAttribute('data-aivo-phase', 'idle');
      this.queue.done();
      onComplete?.();
      return;
    }

    // Phase 1: Prepare
    const srcRect = el.getBoundingClientRect();
    const dx = pos.x - srcRect.left;
    const dy = pos.y - srcRect.top;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    const tilt = Math.max(-8, Math.min(8, angle * 0.08));

    el.classList.add('aivo-prepare');
    el.setAttribute('data-aivo-phase', 'prepare');
    el.style.transition = 'none';
    el.style.transform = `translate3d(${srcRect.left}px,${srcRect.top}px,0) scale(1) rotate(${tilt}deg)`;

    this.timers.push(setTimeout(() => {
      if (!this.el) return;
      el.classList.remove('aivo-prepare');
      el.classList.add('aivo-flying');
      el.setAttribute('data-aivo-phase', 'flying');
      el.style.transition = `transform ${PHASE_FLIGHT_MS}ms cubic-bezier(0.22,1,0.36,1)`;
      el.style.transform = `translate3d(${pos.x}px,${pos.y}px,0) scale(1) rotate(${pos.rotate || 0}deg)`;

      this.timers.push(setTimeout(() => {
        if (!this.el) return;
        el.classList.remove('aivo-flying');
        el.classList.add('aivo-arrive');
        el.setAttribute('data-aivo-phase', 'arrive');
        el.style.transition = `transform ${PHASE_ARRIVE_MS}ms cubic-bezier(0.34,1.56,0.64,1)`;
        el.style.transform = `translate3d(${pos.x}px,${pos.y}px,0) scale(1) rotate(0deg)`;

        this.timers.push(setTimeout(() => {
          if (!this.el) return;
          el.classList.remove('aivo-arrive');
          el.setAttribute('data-aivo-phase', 'idle');
          this.queue.done();
          onComplete?.();
        }, PHASE_ARRIVE_MS));
      }, PHASE_FLIGHT_MS));
    }, PHASE_PREPARE_MS));
  }

  cancel(): void {
    this.timers.forEach(clearTimeout);
    this.timers = [];
    if (this.el) this.el.classList.remove('aivo-prepare', 'aivo-flying', 'aivo-arrive');
    // NOTE: Do NOT call queue.done() here — cancel() is called at the start of
    // a NEW animate(), and the new movement's timeout will call done() when it
    // actually finishes. Calling done() here would break the serial FIFO by
    // allowing the next command to process before the new move has even started.
  }
}
