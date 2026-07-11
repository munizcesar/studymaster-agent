/**
 * 🎭 AIVO — Presence Manager (Enterprise)
 *
 * Manages the SINGLE #aivo-presence container.
 * Delegates to:
 * - AnchorManager for auto-discovery of data-aivo-anchor elements
 * - HomeManager for safe fallback position
 * - VisibilityController for opacity/display/z-index
 * - MotionController for physics/spring/bezier
 *
 * Never creates a second container. Never removes the container.
 */

import type { MoveOptions, MovePosition, PresenceState } from './types';
import {
  PRESENCE_ID, PRESENCE_STYLE_ID, STANDBY_SCALE, STANDBY_OPACITY, MASCOT_DEFAULT_SIZE,
} from './constants';
import { EventBus } from './events';
import { AnchorManager } from './anchor-manager';
import { MotionController } from './motion-controller';
import { VisibilityController } from './visibility';
import { HomeManager } from './home';
import { LockManager } from './lock';
import type { CommandQueue } from './queue';
import { AivoLogger } from './logger';

let instance: PresenceManager | null = null;

export class PresenceManager {
  private state: PresenceState = {
    el: null, initialized: false, currentAnchor: null,
    isStandby: true, currentPosition: null, isVisible: false,
  };

  private events: EventBus;
  private anchorManager: AnchorManager;
  private motion: MotionController;
  private visibility: VisibilityController;
  private home: HomeManager;
  private lockManager: LockManager;
  private logger: AivoLogger;
  private queue: CommandQueue | null = null;

  private timers: Array<ReturnType<typeof setTimeout>> = [];
  private onStateChangeCallback: ((state: string, size?: number) => void) | null = null;

  static getInstance(): PresenceManager {
    if (!instance) instance = new PresenceManager(
      EventBus.getInstance(), AnchorManager.getInstance(),
      MotionController.getInstance(), VisibilityController.getInstance(),
      HomeManager.getInstance(), LockManager.getInstance(), AivoLogger.getInstance()
    );
    return instance;
  }

  static resetInstance(): void {
    if (instance) { instance.destroy(); instance = null; }
  }

  private constructor(
    events: EventBus, anchorManager: AnchorManager,
    motion: MotionController, visibility: VisibilityController,
    home: HomeManager, lockManager: LockManager, logger: AivoLogger
  ) {
    this.events = events; this.anchorManager = anchorManager;
    this.motion = motion; this.visibility = visibility;
    this.home = home; this.lockManager = lockManager; this.logger = logger;
  }

  /* ── Set Queue reference (called by Engine after construction) ── */

  setQueueRef(queue: CommandQueue): void {
    this.queue = queue;
  }

  /* ── Init ── */

  init(force: boolean = false): boolean {
    if (this.state.initialized && !force) return true;
    if (!document.body) return false;

    if (document.getElementById(PRESENCE_ID)) {
      this.state.el = document.getElementById(PRESENCE_ID) as HTMLElement;
      this.state.initialized = true;
      this.injectStyles();
      this.anchorManager.start();
      this.visibility.bind(this.state.el);
      return true;
    }

    const el = document.createElement('div');
    el.id = PRESENCE_ID;
    el.style.cssText = [
      'position:fixed', 'z-index:9000', 'pointer-events:none',
      'will-change:transform,opacity',
      `transform:translate3d(0,0,0) scale(${STANDBY_SCALE})`,
      'opacity:0',
      'transition:opacity 0.5s ease, transform 0.5s ease',
    ].join(';');

    document.body.appendChild(el);
    this.state.el = el;
    this.state.initialized = true;
    this.visibility.bind(el);

    this.injectStyles();
    this.anchorManager.start();

    this.home.updateForViewport();
    this.visibility.standby();

    this.state.isVisible = false;

    this.events.emit('boot:starting', { component: 'presence' });
    this.logger.info('Presence', 'Container created');
    return true;
  }

  private injectStyles(): void {
    if (document.getElementById(PRESENCE_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = PRESENCE_STYLE_ID;
    style.textContent = [
      `#${PRESENCE_ID} { transform-origin: center center; will-change: transform, opacity; }`,
      `#${PRESENCE_ID}[data-aivo-phase="prepare"] { transform-origin: center bottom; }`,
      `#${PRESENCE_ID}[data-aivo-phase="standby"] { cursor: default; }`,
    ].join('\n');
    document.head.appendChild(style);
  }

  /* ── Movement ── */

  moveToAnchor(anchorName: string, opts: MoveOptions = {}): void {
    const anchor = this.anchorManager.getAnchorElement(anchorName);
    if (!anchor) { this.goHome(); return; }
    this.moveToElement(anchor, opts);
  }

  moveToElement(targetEl: Element, opts: MoveOptions = {}): void {
    if (!this.state.el && !this.init()) return;
    if (!targetEl || !document.body.contains(targetEl)) {
      this.logger.warn('Presence', 'Target not in DOM, going home');
      this.goHome();
      return;
    }

    // Acquire movement lock
    if (!this.lockManager.acquire('movement', 'moving to element')) {
      this.logger.debug('Presence', 'Movement blocked by lock');
      return;
    }

    this.cancelPending();

    const size = opts.size ?? MASCOT_DEFAULT_SIZE;
    const pos = this.motion.calcPositionFromElement(targetEl, size);

    if (!pos) { this.goHome(); return; }

    this.state.currentAnchor = targetEl.getAttribute('data-aivo-anchor') || '_element_';
    this.state.currentPosition = pos;

    if (opts.state && this.onStateChangeCallback) {
      this.onStateChangeCallback(opts.state, size);
    }

    this.state.isVisible = true;
    this.animateTo(pos, opts);
  }

  /* ── Home ── */

  goHome(): void {
    this.cancelPending();
    const home = this.home.getPosition();
    const pos: MovePosition = { x: home.x, y: home.y, rotate: 0, side: 'bottom' };

    this.state.currentAnchor = home.anchor || '__home__';
    this.state.currentPosition = pos;
    this.state.isVisible = true;

    this.animateTo(pos, { state: 'idle' as any });
    this.logger.info('Presence', 'Returned home');
  }

  /* ── Standby ── */

  enterStandby(): void {
    if (!this.state.el || this.state.isStandby) return;
    this.cancelPending();
    this.state.isStandby = true;
    this.state.currentAnchor = null;
    this.visibility.standby();
    this.state.el.setAttribute('data-aivo-phase', 'standby');
  }

  private exitStandby(pos: MovePosition): void {
    const el = this.state.el;
    if (!el) return;
    this.cancelPending();
    this.state.isStandby = false;
    this.visibility.show();
    el.style.transition = 'none';
    el.style.transform = this.motion.buildTransformString(pos.x, pos.y, 1, 0);
    this.motion.forceLayout(el);
    el.style.transition = 'opacity 0.3s ease';
    el.style.opacity = '1';
    el.setAttribute('data-aivo-phase', 'idle');
  }

  /* ── 3-Phase Animation ── */

  private animateTo(pos: MovePosition, opts: MoveOptions = {}): void {
    const el = this.state.el;
    if (!el) return;

    if (this.state.isStandby) { this.exitStandby(pos); return; }

    this.events.emit('move:start', pos);

    const srcRect = el.getBoundingClientRect();
    const tiltAngle = this.motion.calcTiltAngle(srcRect.left, srcRect.top, pos.x, pos.y);

    // Phase 1: Prepare
    el.classList.add('aivo-prepare');
    el.setAttribute('data-aivo-phase', 'prepare');
    el.style.transition = 'none';
    el.style.transform = this.motion.buildTransformString(srcRect.left, srcRect.top, 1, tiltAngle);

    const prepareTimer = setTimeout(() => {
      if (!this.state.el) return;

      // Phase 2: Flight
      el.classList.remove('aivo-prepare');
      el.classList.add('aivo-flying');
      el.setAttribute('data-aivo-phase', 'flying');
      el.style.transition = this.motion.getPhaseTransition('flight');
      el.style.transform = this.motion.buildTransformString(pos.x, pos.y, 1, pos.rotate ?? 0);
      this.events.emit('move:flight', pos);

      const flightTimer = setTimeout(() => {
        if (!this.state.el) return;

        // Phase 3: Arrive
        el.classList.remove('aivo-flying');
        el.classList.add('aivo-arrive');
        el.setAttribute('data-aivo-phase', 'arrive');
        el.style.transition = this.motion.getPhaseTransition('arrive');
        el.style.transform = this.motion.buildTransformString(pos.x, pos.y, 1, 0);
        this.events.emit('move:arrive', pos);

        const arriveTimer = setTimeout(() => {
          if (!this.state.el) return;
          el.classList.remove('aivo-arrive');
          el.setAttribute('data-aivo-phase', 'idle');
          this.events.emit('move:end', pos);
          this.lockManager.release('movement');
          // Notify queue that lock is released
          if (this.queue) {
            this.queue.onLockReleased();
          }
        }, 150);
        this.timers.push(arriveTimer);
      }, 380);
      this.timers.push(flightTimer);
    }, 120);
    this.timers.push(prepareTimer);
  }

  /* ── Timer Management ── */

  private cancelPending(): void {
    this.timers.forEach(clearTimeout);
    this.timers = [];
    if (this.state.el) this.state.el.classList.remove('aivo-prepare', 'aivo-flying', 'aivo-arrive');
    this.lockManager.release('movement');
  }

  /* ── Callbacks ── */

  set onStateChange(fn: ((state: string, size?: number) => void) | null) { this.onStateChangeCallback = fn; }
  get onStateChange(): ((state: string, size?: number) => void) | null { return this.onStateChangeCallback; }

  /* ── Getters ── */

  getContainer(): HTMLElement | null { return this.state.el; }
  getCurrentAnchor(): string | null { return this.state.currentAnchor; }
  getAnchors(): string[] { return this.anchorManager.getAnchorNames(); }
  isStandby(): boolean { return this.state.isStandby; }
  isVisible(): boolean { return this.state.isVisible; }
  getState(): Readonly<PresenceState> { return { ...this.state }; }

  /* ── Destroy ── */

  destroy(): void {
    this.cancelPending();
    if (this.state.el && this.state.el.parentNode) this.state.el.parentNode.removeChild(this.state.el);
    this.state.el = null; this.state.initialized = false;
    this.state.isStandby = true; this.state.currentAnchor = null;
    this.onStateChangeCallback = null;
    this.visibility.unbind();
    instance = null;
  }
}
