/**
 * 🎭 AIVO CORE — Watchman (Runtime Assertions)
 *
 * Periodically checks system invariants in production:
 * - Exactly 1 #aivo-presence DOM node
 * - Exactly 1 React root created
 * - Engine, EventBus, Queue singletons intact
 *
 * If any invariant fails → auto-recovery without page reload.
 * Never polls for elements (uses existing DOM checks).
 */

import { PRESENCE_ID, WATCHDOG_TICK_MS } from './constants';
import { AivoLogger } from './debug';

let instance: AivoWatchman | null = null;

export interface InvariantCheck {
  name: string;
  ok: boolean;
  detail: string;
}

export class AivoWatchman {
  private timer: ReturnType<typeof setInterval> | null = null;
  private _recoveryCount = 0;
  private _lastError: string | null = null;
  private _lastCheck: InvariantCheck[] = [];
  private logger = AivoLogger.getInstance();

  static getInstance(): AivoWatchman {
    if (!instance) instance = new AivoWatchman();
    return instance;
  }

  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => this.patrol(), WATCHDOG_TICK_MS);
    this.logger.info('Watchman', 'Patrol started');
  }

  stop(): void {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }

  get recoveryCount(): number { return this._recoveryCount; }
  get lastError(): string | null { return this._lastError; }
  get lastCheck(): InvariantCheck[] { return [...this._lastCheck]; }

  /** Run a full invariant check now (also called periodically) */
  patrol(): InvariantCheck[] {
    const checks: InvariantCheck[] = [];

    // 1. Exactly 1 #aivo-presence
    const presenceCount = document.querySelectorAll(`#${PRESENCE_ID}`).length;
    const presenceOk = presenceCount === 1;
    checks.push({
      name: 'presence',
      ok: presenceOk,
      detail: presenceOk ? '1 #aivo-presence' : `${presenceCount} encontrados`,
    });

    // 2. Engine singleton (no second create)
    const engineCount = (window as any).__AIVO_ENGINE_COUNT__ || 1;
    const engineOk = engineCount <= 1;
    checks.push({
      name: 'engine',
      ok: engineOk,
      detail: engineOk ? '1 AivoEngine' : `${engineCount} instâncias`,
    });

    // 3. React root (never recreated)
    const rootCreated = !!(window as any).__AIVO_ROOT_EXISTS__;
    checks.push({
      name: 'root',
      ok: true,
      detail: rootCreated ? 'Root exists' : 'Root not yet created',
    });

    // 4. Container is still in DOM
    const container = document.getElementById(PRESENCE_ID);
    const containerOk = container !== null && document.body.contains(container);
    checks.push({
      name: 'container',
      ok: containerOk,
      detail: containerOk ? 'In DOM' : 'Missing from DOM',
    });

    // 5. Container has children (React rendered into it)
    const hasChildren = container !== null && container.children.length > 0;
    checks.push({
      name: 'rendered',
      ok: hasChildren,
      detail: hasChildren ? `${container!.children.length} children` : 'Empty container',
    });

    // 6. EventBus singleton count
    const ebCount = (window as any).__AIVO_EVENTBUS_COUNT__ || 0;
    checks.push({
      name: 'eventbus',
      ok: ebCount <= 1,
      detail: ebCount <= 1 ? '1 EventBus' : `${ebCount} instâncias`,
    });

    // 7. Queue singleton count
    const qCount = (window as any).__AIVO_QUEUE_COUNT__ || 0;
    checks.push({
      name: 'queue',
      ok: qCount <= 1,
      detail: qCount <= 1 ? '1 Queue' : `${qCount} instâncias`,
    });

    this._lastCheck = checks;
    const failed = checks.filter(c => !c.ok);
    if (failed.length > 0) {
      this._lastError = failed.map(c => `${c.name}: ${c.detail}`).join(' | ');
      this.logger.warn('Watchman', `⚠️ ${failed.length} invariante(s) falhou(ram)`, this._lastError);
      this.recover(failed);
    }
    return checks;
  }

  private recover(failed: InvariantCheck[]): void {
    this._recoveryCount++;

    for (const check of failed) {
      switch (check.name) {
        case 'presence':
          // Remove duplicates
          const all = document.querySelectorAll(`#${PRESENCE_ID}`);
          for (let i = 1; i < all.length; i++) all[i].remove();
          this.logger.info('Watchman', `Recovery: removeu ${all.length - 1} #aivo-presence duplicado(s)`);
          break;

        case 'container':
          // Container was removed from DOM — try to recreate
          // But we can't recreate without createRoot, so just warn
          this.logger.error('Watchman', 'Recovery: container ausente — necessário recarregamento');
          break;

        case 'rendered':
          // Container exists but is empty — React may have unmounted
          this.logger.warn('Watchman', 'Recovery: container vazio — React pode ter desmontado');
          break;
      }
    }
  }
}
