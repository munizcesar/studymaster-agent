/**
 * 🎭 AIVO CORE — Event Bus
 *
 * Internal bus (engine modules communicate).
 * External bus (window.AivoBus — all other modules emit events here).
 */

import type { BusEvent } from './types';

type Handler = (data?: Record<string, unknown>) => void;

/* ── Internal EventBus ── */

let instance: EventBus | null = null;

export class EventBus {
  private handlers = new Map<string, Set<Handler>>();

  static getInstance(): EventBus {
    if (!instance) {
      instance = new EventBus();
      (window as any).__AIVO_EVENTBUS_COUNT__ = ((window as any).__AIVO_EVENTBUS_COUNT__ || 0) + 1;
    }
    return instance;
  }

  on(event: string, handler: Handler): () => void {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(handler);
    return () => this.handlers.get(event)?.delete(handler);
  }

  emit(event: string, data?: Record<string, unknown>): void {
    this.handlers.get(event)?.forEach(h => { try { h(data); } catch { /* safe */ } });
  }

  clear(): void { this.handlers.clear(); }
}

/* ── External AivoBus ── */

class AivoBus {
  private handlers = new Map<string, Set<Handler>>();

  emit(event: BusEvent | string, data?: Record<string, unknown>): void {
    this.handlers.get(event)?.forEach(h => { try { h(data); } catch { /* safe */ } });
  }

  on(event: BusEvent | string, handler: Handler): () => void {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(handler);
    return () => this.handlers.get(event)?.delete(handler);
  }

  off(event: BusEvent | string, handler: Handler): void {
    this.handlers.get(event)?.delete(handler);
  }
}

let aivoBusInstance: AivoBus | null = null;

export function getAivoBus(): AivoBus {
  if (!aivoBusInstance) aivoBusInstance = new AivoBus();
  return aivoBusInstance;
}

export function exposeAivoBus(): void {
  const bus = getAivoBus();
  (window as any).AivoBus = {
    emit: (e: string, d?: Record<string, unknown>) => bus.emit(e, d),
    on: (e: string, h: Handler) => bus.on(e, h),
    off: (e: string, h: Handler) => bus.off(e, h),
  };
}
