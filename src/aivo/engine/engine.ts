/**
 * 🎭 AIVO — Engine (Enterprise)
 *
 * Main orchestrator connecting ALL subsystems:
 * - EventBus → EnginePhaseMachine → EmotionController → Renderer → PresenceManager → HealthMonitor → RecoverySystem
 * - LockManager → CommandQueue → Watchdog → RecoveryController
 * - AnchorManager → MotionController → VisibilityController → HomeManager
 *
 * Single brain. Single entry point. Single public API.
 * No module accesses another directly — all communication goes through EventBus + controllers.
 */

import type { EmotionState, EngineState, EngineStatus, HealthReport, EnginePhase, AivoCommand } from './types';
import { SIZE_PRESETS, BOOT_MAX_RETRIES, BOOT_RETRY_INTERVAL_MS, MOVE_TIMEOUT_MS } from './constants';
import { EventBus } from './events';
import { EnginePhaseMachine } from './state-machine';
import { EmotionController } from './emotion';
import { CommandQueue } from './queue';
import { Renderer } from './renderer';
import { PresenceManager } from './presence';
import { HealthMonitor } from './health';
import { RecoverySystem } from './recovery';
import { LockManager } from './lock';
import { HomeManager } from './home';
import { VisibilityController } from './visibility';
import { MotionController } from './motion-controller';
import { AnchorManager } from './anchor-manager';
import { Watchdog } from './watchdog';
import { AivoLogger } from './logger';

let instance: AivoEngine | null = null;

export class AivoEngine {
  // Public subsystems
  readonly events: EventBus;
  readonly phaseMachine: EnginePhaseMachine;
  readonly emotion: EmotionController;
  readonly queue: CommandQueue;
  readonly renderer: Renderer;
  readonly presence: PresenceManager;
  readonly health: HealthMonitor;
  readonly recovery: RecoverySystem;
  readonly lockManager: LockManager;
  readonly home: HomeManager;
  readonly visibility: VisibilityController;
  readonly motion: MotionController;
  readonly anchorManager: AnchorManager;
  readonly watchdog: Watchdog;
  readonly logger: AivoLogger;

  private state: { phase: EngineStatus; bootAttempts: number; lastError: Error | null; createdAt: number } = {
    phase: 'uninitialized', bootAttempts: 0, lastError: null, createdAt: Date.now(),
  };

  private bootTimer: ReturnType<typeof setTimeout> | null = null;
  private destroyed = false;
  private rejectionHandler: ((event: PromiseRejectionEvent) => void) | null = null;

  static getInstance(): AivoEngine {
    if (!instance) instance = new AivoEngine();
    return instance;
  }
  static resetInstance(): void { if (instance) { instance.destroy(); instance = null; } }

  private constructor() {
    this.events = EventBus.getInstance();
    this.phaseMachine = EnginePhaseMachine.getInstance();
    this.emotion = EmotionController.getInstance();
    this.queue = CommandQueue.getInstance();
    this.renderer = Renderer.getInstance();
    this.presence = PresenceManager.getInstance();
    this.health = HealthMonitor.getInstance();
    this.recovery = RecoverySystem.getInstance();
    this.lockManager = LockManager.getInstance();
    this.home = HomeManager.getInstance();
    this.visibility = VisibilityController.getInstance();
    this.motion = MotionController.getInstance();
    this.anchorManager = AnchorManager.getInstance();
    this.watchdog = Watchdog.getInstance();
    this.logger = AivoLogger.getInstance();

    // Wire emotion changes → render updates
    this.emotion.onChange = (state) => {
      this.renderer.updateState(state);
      this.events.emit(`aivo:emotion` as any, { state });
    };

    // Wire presence state changes → engine phase
    this.presence.onStateChange = (newState, newSize) => {
      const size = newSize ?? SIZE_PRESETS.lg;
      const state = newState as EmotionState;
      this.emotion.set(state);
      this.renderer.update(size, state);
    };

    // Wire recovery hooks
    this.recovery.setRenderer = () => {
      const container = this.presence.getContainer();
      return container ? this.renderer.init(container) : false;
    };
    this.recovery.setPresence = () => this.presence.init(true);
    this.recovery.rebootEngine = () => this.reboot();
    this.recovery.goHome = () => this.goHome();
    this.recovery.resetState = () => this.emotion.reset();

    // Wire health checks
    this.health.checkHealth = () => this.checkMascotHealth();

    // Wire watchdog
    this.watchdog.checkHealth = () => this.checkMascotHealth();
    this.watchdog.onTimeoutRebuild = () => {
      this.logger.error('Engine', 'Watchdog timeout — rebuilding');
      this.recovery.handleDOMLost();
    };

    // Wire queue
    this.queue.setFlushHandler((command) => this.processCommand(command));

    // Listen for health warnings
    this.events.on('health:warning', () => {
      const report = this.health.getReport();
      if (report.status !== 'ok') this.recovery.attempt(report);
    });
    this.events.on('health:critical', () => {
      this.recovery.attempt(this.health.getReport());
    });

    // Global error handler for uncaught exceptions
    this.rejectionHandler = (event: PromiseRejectionEvent) => {
      this.recovery.handleException(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        'Promise'
      );
    };
    window.addEventListener('unhandledrejection', this.rejectionHandler);

    this.logger.info('Engine', 'Initialized');
  }

  /* ── Boot Sequence ── */

  boot(): boolean {
    if (this.state.phase === 'ready') return true;
    if (this.state.phase === 'destroyed') return false;

    this.state.phase = 'booting';
    this.state.bootAttempts++;
    this.phaseMachine.transition('BOOT');

    this.events.emit('boot:starting', { attempt: this.state.bootAttempts });
    return this.tryBoot();
  }

  private tryBoot(): boolean {
    if (!document.body) return this.retryBoot('DOM not ready');

    // Init presence
    if (!this.presence.init()) return this.retryBoot('Presence init failed');

    const container = this.presence.getContainer();
    if (!container || !document.body.contains(container)) return this.retryBoot('Container not in DOM');

    // Init renderer
    if (!this.renderer.init(container)) return this.retryBoot('Renderer init failed');

    // Mark subsystems healthy
    this.health.checks = {
      root: true, container: true, renderer: true, motion: true,
      queue: true, presence: true, state: true, phase: true,
      visibility: true, dom: true,
    };

    // Mark ready
    this.state.phase = 'ready';
    this.state.lastError = null;
    this.phaseMachine.transition('IDLE');

    // Start health monitor + watchdog
    this.health.start();

    // Update home position
    this.home.updateForViewport();

    this.events.emit('boot:ready', { uptimeMs: this.getUptimeMs(), attempts: this.state.bootAttempts });
    this.events.emit('aivo:boot' as any, { status: 'ready' });
    this.logger.info('Engine', 'Boot complete');
    return true;
  }

  private retryBoot(reason: string): boolean {
    if (this.state.bootAttempts >= BOOT_MAX_RETRIES) {
      this.state.phase = 'error';
      this.state.lastError = new Error(`Boot failed: ${reason}`);
      this.phaseMachine.transition('ERROR');
      this.events.emit('boot:error', { reason, attempts: this.state.bootAttempts });
      return false;
    }
    this.bootTimer = setTimeout(() => { this.state.bootAttempts++; this.tryBoot(); }, BOOT_RETRY_INTERVAL_MS);
    return false;
  }

  /* ── Command Processing ── */

  private processCommand(command: AivoCommand): boolean {
    if (this.destroyed) return false;
    if (this.state.phase !== 'ready' && command.type !== 'destroy' && command.type !== 'goHome') return false;

    // Set engine phase appropriately
    const phaseMap: Record<string, EnginePhase> = {
      move: 'MOVING', state: 'IDLE', say: 'SPEAKING', goHome: 'RETURN_HOME',
    };
    if (phaseMap[command.type]) {
      this.phaseMachine.transition(phaseMap[command.type]);
    }

    switch (command.type) {
      case 'show':
        this.emotion.set('idle');
        return true;

      case 'hide':
        this.emotion.set('hidden');
        return true;

      case 'state':
        if (command.state) this.emotion.set(command.state);
        return true;

      case 'move':
        this.phaseMachine.transition('MOVING');
        if (typeof command.target === 'string') {
          this.presence.moveToAnchor(command.target, { state: command.state, size: command.size });
        } else if (command.target instanceof Element) {
          this.presence.moveToElement(command.target, { state: command.state, size: command.size });
        }
        // Auto-return to IDLE after move completes
        setTimeout(() => {
          if (this.phaseMachine.getCurrent() === 'MOVING') {
            this.phaseMachine.transition('IDLE');
          }
        }, MOVE_TIMEOUT_MS);
        return true;

      case 'say':
        this.emotion.set('speaking');
        this.events.emit('state:change' as any, { state: 'speaking', message: command.message });
        if (command.duration) {
          setTimeout(() => this.emotion.set('idle'), command.duration);
        }
        return true;

      case 'goHome':
        this.goHome();
        return true;

      case 'emit':
        if (command.event) this.events.emit(command.event, command.data);
        return true;

      case 'destroy':
        this.destroy();
        return true;

      default:
        return false;
    }
  }

  /* ── Home ── */

  goHome(): void {
    this.phaseMachine.transition('RETURN_HOME');
    this.presence.goHome();
    this.emotion.set('idle');
    this.phaseMachine.transition('IDLE');
    this.events.emit('aivo:home' as any, {});
    this.logger.info('Engine', 'Returned home');
  }

  /* ── Health Check ── */

  private checkMascotHealth(): boolean {
    const container = this.presence.getContainer();
    if (!container || !document.body.contains(container)) return false;

    // Check visibility
    const style = getComputedStyle(container);
    if (style.display === 'none' || style.visibility === 'hidden') return false;

    // Check React root
    if (!this.renderer.isReady()) return false;

    return true;
  }

  refreshHealthChecks(): void {
    const container = this.presence.getContainer();
    this.health.checks = {
      root: this.renderer.isReady(),
      container: container !== null && document.body.contains(container),
      renderer: this.renderer.isReady(),
      motion: true,
      queue: this.queue.length < 50,
      presence: this.presence.getContainer() !== null,
      state: this.emotion.getCurrent() !== null,
      phase: true,
      visibility: container ? getComputedStyle(container).visibility !== 'hidden' : false,
      dom: container !== null && document.body.contains(container),
    };
  }

  getHealthReport(): HealthReport {
    this.refreshHealthChecks();
    return this.health.getReport();
  }

  /* ── Reboot ── */

  private reboot(): boolean {
    this.logger.warn('Engine', 'Rebooting');
    this.renderer.destroy();
    this.presence.destroy();
    this.emotion.reset();
    this.phaseMachine.reset();
    this.lockManager.releaseAll();
    this.events.clear();

    this.state.bootAttempts = 0;
    this.state.phase = 'uninitialized';
    instance = null;
    instance = new AivoEngine();

    return instance.boot();
  }

  /* ── Getters ── */

  getStatus(): EngineStatus { return this.state.phase; }
  isReady(): boolean { return this.state.phase === 'ready'; }
  getEngineState(): Readonly<{ phase: EngineStatus; bootAttempts: number; lastError: Error | null; createdAt: number }> { return { ...this.state }; }
  getCurrentState(): EmotionState { return this.emotion.getCurrent(); }
  getUptimeMs(): number { return this.state.phase === 'ready' ? Date.now() - this.state.createdAt : 0; }

  /* ── Destroy ── */

  destroy(): void {
    this.destroyed = true;
    this.state = { ...this.state, phase: 'destroyed' as EngineStatus };
    if (this.bootTimer) { clearTimeout(this.bootTimer); this.bootTimer = null; }
    if (this.rejectionHandler) {
      window.removeEventListener('unhandledrejection', this.rejectionHandler);
      this.rejectionHandler = null;
    }
    this.queue.destroy();
    this.health.destroy();
    this.recovery.destroy();
    this.watchdog.destroy();
    this.renderer.destroy();
    this.presence.destroy();
    this.emotion.destroy();
    this.phaseMachine.destroy();
    this.lockManager.destroy();
    this.events.destroy();
    this.logger.destroy();
    instance = null;
  }
}
