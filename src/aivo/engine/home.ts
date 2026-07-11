/**
 * 🎭 AIVO — Home Position
 *
 * Manages the safe fallback position for the mascot.
 * Whenever an error occurs: cancel → goHome → idle
 */

import type { HomePosition } from './types';
import { HOME_POSITION_X, HOME_POSITION_Y, HOME_ANCHOR } from './constants';

let instance: HomeManager | null = null;

export class HomeManager {
  private home: HomePosition = { x: HOME_POSITION_X, y: HOME_POSITION_Y, anchor: HOME_ANCHOR };

  /* ── Singleton ── */

  static getInstance(): HomeManager {
    if (!instance) instance = new HomeManager();
    return instance;
  }

  static resetInstance(): void {
    instance = null;
  }

  /* ── Home Position ── */

  getPosition(): Readonly<HomePosition> {
    return { ...this.home };
  }

  setPosition(x: number, y: number, anchor?: string): void {
    this.home = { x, y, anchor: anchor || HOME_ANCHOR };
  }

  resetToDefault(): void {
    this.home = { x: HOME_POSITION_X, y: HOME_POSITION_Y, anchor: HOME_ANCHOR };
  }

  /* ── Dynamic Home (based on viewport) ── */

  updateForViewport(): void {
    // Bottom-right corner, respecting safe margins
    this.home = {
      x: window.innerWidth - 160,
      y: window.innerHeight - 200,
      anchor: '__home__',
    };
  }

  /* ── Destroy ── */

  destroy(): void {
    instance = null;
  }
}
