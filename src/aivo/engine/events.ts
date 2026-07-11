/**
 * 🎭 AIVO — Event Bus + AivoBus
 *
 * Internal EventBus: used by engine modules for inter-module communication.
 * External AivoBus: exposed via window.AivoBus for ALL external modules.
 *
 * No module accesses the mascot directly — all communication goes through events.
 *   AivoBus.emit("coach.open")
 *   AivoBus.emit("quiz.correct")
 *   AivoBus.emit("bubble.show")
 */

import type { AivoBusEvent, AivoEventPayload, AivoBusPayload } from './types';
import { AivoLogger } from './logger';

/* ═══════════════════════════════════════════════════════════════
   INTERNAL EVENT BUS (for engine modules)
   ═══════════════════════════════════════════════════════════════ */

type EventHandler = (payload: AivoEventPayload) => void;

let instance: EventBus | null = null;

export class EventBus {
  private handlers = new Map<string, Set<EventHandler>>();
  private wildcardHandlers = new Set<EventHandler>();
  private destroyed = false;
  private logger = AivoLogger.getInstance();

  static getInstance(): EventBus {
    if (!instance) instance = new EventBus();
    return instance;
  }

  static resetInstance(): void {
    if (instance) { instance.destroy(); instance = null; }
  }

  on(event: string, handler: EventHandler): () => void {
    if (this.destroyed) return () => {};
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(handler);
    this.logger.debug('EventBus', `Subscribed: ${event}`);
    return () => this.off(event, handler);
  }

  onAny(handler: EventHandler): () => void {
    if (this.destroyed) return () => {};
    this.wildcardHandlers.add(handler);
    return () => this.wildcardHandlers.delete(handler);
  }

  off(event: string, handler: EventHandler): void {
    this.handlers.get(event)?.delete(handler);
  }

  emit(event: string, data?: Record<string, unknown>): void {
    if (this.destroyed) return;
    const payload: AivoEventPayload = { type: event, timestamp: Date.now(), data };

    this.handlers.get(event)?.forEach((handler) => {
      try { handler(payload); } catch (err) {
        this.logger.error('EventBus', `Handler error for "${event}": ${err}`);
      }
    });

    this.wildcardHandlers.forEach((handler) => {
      try { handler(payload); } catch (err) {
        this.logger.error('EventBus', `Wildcard handler error for "${event}": ${err}`);
      }
    });
  }

  clear(): void { this.handlers.clear(); this.wildcardHandlers.clear(); }
  destroy(): void { this.destroyed = true; this.clear(); instance = null; }
}

/* ═══════════════════════════════════════════════════════════════
   EXTERNAL AIVO BUS (for index.html, aivos-char-system, etc.)
   ═══════════════════════════════════════════════════════════════ */

type AivoBusHandler = (payload: AivoBusPayload) => void;

class AivoBusImpl {
  private handlers = new Map<string, Set<AivoBusHandler>>();
  private destroyed = false;

  emit(event: AivoBusEvent | string, data?: Record<string, unknown>): void {
    if (this.destroyed) return;
    const payload: AivoBusPayload = { event: event as AivoBusEvent, timestamp: Date.now(), data };

    this.handlers.get(event)?.forEach((handler) => {
      try { handler(payload); } catch (err) {
        console.warn(`[AivoBus] Handler error for "${event}":`, err);
      }
    });
  }

  on(event: AivoBusEvent | string, handler: AivoBusHandler): () => void {
    if (this.destroyed) return () => {};
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(handler);
    return () => this.off(event, handler);
  }

  off(event: AivoBusEvent | string, handler: AivoBusHandler): void {
    this.handlers.get(event)?.delete(handler);
  }

  destroy(): void { this.destroyed = true; this.handlers.clear(); }
}

let aivoBusInstance: AivoBusImpl | null = null;

export function getAivoBus(): AivoBusImpl {
  if (!aivoBusInstance) aivoBusInstance = new AivoBusImpl();
  return aivoBusInstance;
}

export function initAivoBus(): void {
  const bus = getAivoBus();
  (window as any).AivoBus = {
    emit: (event: string, data?: Record<string, unknown>) => bus.emit(event, data),
    on: (event: string, handler: AivoBusHandler) => bus.on(event, handler),
    off: (event: string, handler: AivoBusHandler) => bus.off(event, handler),
  };
}

export function destroyAivoBus(): void {
  if (aivoBusInstance) {
    aivoBusInstance.destroy();
    aivoBusInstance = null;
  }
  delete (window as any).AivoBus;
}
