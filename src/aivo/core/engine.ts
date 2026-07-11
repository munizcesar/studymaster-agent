/**
 * 🎭 AIVO CORE — Engine (Persistent Actor)
 *
 * Born once. Lives forever. Never destroyed.
 * All external modules emit events — only the Engine decides.
 *
 * Flow:
 *   Module → emit("coach-open")
 *   ↓
 *   Engine → queue.enqueue({ type: 'move', target: 'coach', emotion: 'speaking' })
 *   ↓
 *   Queue → processor → Presence.moveToAnchor("coach")
 *   ↓
 *   Move complete → queue.done() → next command
 *
 * No module ever calls:
 *   render(), createRoot(), destroy(), mount(), unmount(), show(), hide()
 */

import type { Command, BusEvent, DebugReport, Emotion, EnginePhase, Position } from './types';
import { VERSION, EMOTION_MAP } from './constants';
import { EventBus, getAivoBus, exposeAivoBus } from './event-bus';
import { CommandQueue } from './queue';
import { StateMachine } from './state-machine';
import { PresenceManager } from './presence';
import { AnchorRegistry } from './anchors';
import { AivoWatchman } from './watchman';
import { AivoLogger, DebugOverlay } from './debug';

let instance: AivoEngine | null = null;

export class AivoEngine {
  readonly events = EventBus.getInstance();
  readonly queue = CommandQueue.getInstance();
  readonly state = StateMachine.getInstance();
  readonly presence = PresenceManager.getInstance();
  readonly anchors = AnchorRegistry.getInstance();
  readonly watchman = AivoWatchman.getInstance();
  private _observersStarted = false;
  readonly logger = AivoLogger.getInstance();
  readonly debugOverlay = DebugOverlay.getInstance();

  private createdAt = Date.now();
  private _lastError: string | null = null;
  private _fps = 60;
  private _fpsFrames = 0;
  private _fpsLast = performance.now();

  static getInstance(): AivoEngine {
    if (!instance) {
      instance = new AivoEngine();
      (window as any).__AIVO_ENGINE_COUNT__ = ((window as any).__AIVO_ENGINE_COUNT__ || 0) + 1;
    }
    return instance;
  }

  private constructor() {
    // Wire queue processor
    this.queue.setProcessor((cmd) => this.process(cmd));

    // Wire event bus
    exposeAivoBus();
    const bus = getAivoBus();

    // Map external events → engine commands
    bus.on('bubble:show', () => this.queue.enqueue({ type: 'move', target: 'bubble', emotion: 'greeting' }));
    bus.on('bubble:hide', () => this.queue.enqueue({ type: 'goHome' }));
    bus.on('coach:open', () => this.queue.enqueue({ type: 'move', target: 'coach', emotion: 'speaking' }));
    bus.on('coach:close', () => this.queue.enqueue({ type: 'goHome' }));
    bus.on('wizard:step', () => this.queue.enqueue({ type: 'move', target: 'wizard', emotion: 'thinking' }));
    bus.on('wizard:complete', () => this.queue.enqueue({ type: 'goHome' }));
    bus.on('quiz:correct', () => this.queue.enqueue({ type: 'celebrate', emotion: 'celebrating' }));
    bus.on('quiz:wrong', () => this.queue.enqueue({ type: 'move', target: 'coach', emotion: 'warning' }));
    bus.on('quiz:start', () => this.queue.enqueue({ type: 'move', target: 'quiz', emotion: 'thinking' }));
    bus.on('quiz:complete', () => this.queue.enqueue({ type: 'goHome' }));
    bus.on('celebration:start', () => this.queue.enqueue({ type: 'move', target: 'celebration', emotion: 'celebrating' }));
    bus.on('celebration:complete', () => this.queue.enqueue({ type: 'goHome' }));
    bus.on('mentor:start', () => this.queue.enqueue({ type: 'move', target: 'mentor', emotion: 'teaching' }));
    bus.on('home:return', () => this.queue.enqueue({ type: 'goHome' }));

    // Listen for emotion changes → render React
    this.events.on('emotion:change', (data) => {
      (window as any).__AIVO_EMOTION__ = data?.emotion;
    });

    this.logger.info('Engine', 'Persistent Actor initialized');
  }

  /* ── Boot (called once per app lifetime) ── */

  boot(): boolean {
    if (!document.body) return false;
    if (!this.presence.init()) return false;

    // Start anchor auto-discovery — activates MutationObserver, ResizeObserver, IntersectionObserver
    this.anchors.start((name, _data) => {
      this.logger.info('Anchors', `Anchor discovered/updated: ${name}`);
    });
    this._observersStarted = true;

    // Start runtime assertions watchman
    this.watchman.start();

    this.state.setPhase('IDLE');
    this.state.setEmotion('idle');

    // Go home to start
    this.queue.enqueue({ type: 'goHome' });

    this.logger.info('Engine', 'Boot complete — AIVO alive forever');
    return true;
  }

  /* ── Command Processing ── */

  private process(cmd: Command): void {
    switch (cmd.type) {
      case 'move':
        this.state.setPhase('MOVING');
        if (cmd.emotion) this.state.setEmotion(cmd.emotion);
        if (cmd.target) {
          this.presence.moveToAnchor(cmd.target, () => {
            this.state.setPhase('IDLE');
          });
        } else {
          this.state.setPhase('IDLE');
          this.queue.done();
        }
        break;

      case 'speak':
        this.state.setPhase('SPEAKING');
        this.state.setEmotion('speaking');
        setTimeout(() => { this.state.setEmotion('idle'); this.state.setPhase('IDLE'); this.queue.done(); }, cmd.duration || 2000);
        break;

      case 'think':
        this.state.setPhase('THINKING');
        this.state.setEmotion('thinking');
        setTimeout(() => { this.state.setEmotion('idle'); this.state.setPhase('IDLE'); this.queue.done(); }, cmd.duration || 1500);
        break;

      case 'celebrate':
        this.state.setPhase('CELEBRATING');
        this.state.setEmotion('celebrating');
        setTimeout(() => { this.state.setEmotion('idle'); this.state.setPhase('IDLE'); this.queue.done(); }, 2000);
        break;

      case 'goHome':
        this.state.setPhase('RETURN_HOME');
        this.presence.goHome(() => {
          this.state.setPhase('IDLE');
          this.state.setEmotion('idle');
        });
        break;

      case 'show':
        this.state.setEmotion('idle');
        this.queue.done();
        break;

      case 'hide':
        this.state.setEmotion('hidden');
        this.queue.done();
        break;

      case 'reset':
        this.state.reset();
        this.queue.done();
        break;
    }
  }

  /* ── Backward compat: public API for window.AivoAPI ── */

  moveToAnchor(anchor: string, emotion?: string): void {
    const e = EMOTION_MAP[emotion || ''] || 'idle';
    this.queue.enqueue({ type: 'move', target: anchor, emotion: e as Emotion });
  }

  setEmotion(emotion: string): void {
    const e = EMOTION_MAP[emotion] || 'idle';
    this.state.setEmotion(e as Emotion);
  }

  goHome(): void {
    this.queue.enqueue({ type: 'goHome' });
  }

  /* ── Debug / Health Dashboard ── */

  getDebugReport(): DebugReport {
    // FPS tracking
    this._fpsFrames++;
    const now = performance.now();
    if (now - this._fpsLast >= 1000) {
      this._fps = this._fpsFrames;
      this._fpsFrames = 0;
      this._fpsLast = now;
    }

    const container = this.presence.getContainer();
    const presenceCount = document.querySelectorAll('#aivo-presence').length;
    const anchorsCount = this.anchors.count;
    const watchmanCheck = this.watchman.lastCheck;
    const presenceFail = watchmanCheck.find(c => c.name === 'presence');

    return {
      version: VERSION,
      commit: (window as any).__AIVO_COMMIT_HASH__ || 'dev',
      phase: this.state.phase,
      emotion: this.state.emotion,
      anchor: this.presence.currentAnchor,
      queueLength: this.queue.length,
      queueProcessing: this.queue.isProcessing,
      position: null,
      containerExists: container !== null && document.body.contains(container),
      rootExists: !!(window as any).__AIVO_ROOT_EXISTS__,
      uptimeMs: Date.now() - this.createdAt,
      fps: this._fps,
      memory: (performance as any).memory
        ? `${Math.round((performance as any).memory.usedJSHeapSize / 1048576)}MB`
        : 'N/A',
      recoveryCount: this.watchman.recoveryCount,
      lastError: this._lastError,
      anchorsCount,
      observerActive: this._observersStarted,
      engineCreatedMs: this.createdAt,
    };
  }

  /** Record an error for the health dashboard */
  recordError(err: string): void {
    this._lastError = err;
    this.logger.error('Engine', err);
  }
}
