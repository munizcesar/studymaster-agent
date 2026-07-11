/**
 * 🎭 AIVO — Visibility Controller
 *
 * Responsible for:
 * - opacity
 * - display
 * - visibility
 * - scale
 * - z-index
 * - pointer-events
 *
 * No other module changes these values directly.
 */

import type { VisibilityState } from './types';
import {
  VISIBLE_OPACITY,
  HIDDEN_OPACITY,
  VISIBLE_SCALE,
  HIDDEN_SCALE,
  VISIBLE_Z_INDEX,
  STANDBY_Z_INDEX,
  STANDBY_SCALE,
  STANDBY_OPACITY,
} from './constants';
import { AivoLogger } from './logger';

let instance: VisibilityController | null = null;

export class VisibilityController {
  private state: VisibilityState = {
    opacity: 0,
    display: 'block',
    visibility: 'hidden',
    scale: STANDBY_SCALE,
    zIndex: STANDBY_Z_INDEX,
    pointerEvents: 'none',
  };
  private el: HTMLElement | null = null;
  private logger = AivoLogger.getInstance();

  /* ── Singleton ── */

  static getInstance(): VisibilityController {
    if (!instance) instance = new VisibilityController();
    return instance;
  }

  static resetInstance(): void {
    instance = null;
  }

  /* ── Bind to element ── */

  bind(el: HTMLElement): void {
    this.el = el;
  }

  unbind(): void {
    this.el = null;
  }

  /* ── State Changes ── */

  show(): void {
    if (!this.el) return;

    this.state = {
      opacity: VISIBLE_OPACITY,
      display: 'block',
      visibility: 'visible',
      scale: VISIBLE_SCALE,
      zIndex: VISIBLE_Z_INDEX,
      pointerEvents: 'none',
    };

    this.apply();
    this.logger.debug('Visibility', 'Showing mascot');
  }

  hide(): void {
    if (!this.el) return;

    this.state = {
      opacity: HIDDEN_OPACITY,
      display: 'block',
      visibility: 'hidden',
      scale: HIDDEN_SCALE,
      zIndex: VISIBLE_Z_INDEX,
      pointerEvents: 'none',
    };

    this.apply();
    this.logger.debug('Visibility', 'Hiding mascot');
  }

  standby(): void {
    if (!this.el) return;

    this.state = {
      opacity: STANDBY_OPACITY,
      display: 'block',
      visibility: 'visible',
      scale: STANDBY_SCALE,
      zIndex: STANDBY_Z_INDEX,
      pointerEvents: 'none',
    };

    this.apply();
  }

  setOpacity(opacity: number): void {
    this.state.opacity = opacity;
    this.apply();
  }

  setScale(scale: number): void {
    this.state.scale = scale;
    this.apply();
  }

  setZIndex(zIndex: number): void {
    this.state.zIndex = zIndex;
    this.apply();
  }

  /* ── Apply to DOM ── */

  private apply(): void {
    if (!this.el) return;

    this.el.style.opacity = String(this.state.opacity);
    this.el.style.display = this.state.display;
    this.el.style.visibility = this.state.visibility;
    this.el.style.zIndex = String(this.state.zIndex);
    this.el.style.pointerEvents = this.state.pointerEvents;

    // Apply scale through transform (preserving position)
    const currentTransform = this.el.style.transform || '';
    this.el.style.transform = currentTransform.replace(/scale\([^)]+\)/, `scale(${this.state.scale})`);
  }

  /* ── Getters ── */

  getState(): Readonly<VisibilityState> {
    return { ...this.state };
  }

  isVisible(): boolean {
    return this.state.visibility === 'visible' && this.state.opacity > 0;
  }

  isHidden(): boolean {
    return this.state.visibility === 'hidden' || this.state.opacity === 0;
  }

  /* ── Destroy ── */

  destroy(): void {
    this.el = null;
    instance = null;
  }
}
