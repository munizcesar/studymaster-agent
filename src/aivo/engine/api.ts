/**
 * 🎭 AIVO — Public API (Enterprise)
 *
 * The ONLY public surface for controlling the mascot.
 *
 * Available:
 *   window.Aivo.show/hide/move/state/say/emit/goHome/debug/destroy/on/off
 *   window.Aivo.bus.emit/on/off       ← Event Bus for external modules
 *   window.Aivo.logger.info/warn/error/debug
 *   window.AivoAPI.render/setState     ← Backward compat
 *   window.AivoPresence.*              ← Backward compat
 *   window.AivoBus.emit/on/off         ← Global event bus
 */

import type { EmotionState, AivoPublicAPI, DebugReport, AivoEventPayload, AivoBusEvent, AivoBusPayload } from './types';
import type { AivoEngine } from './engine';
import { SIZE_MAP, STATE_MAP, SIZE_PRESETS } from './constants';
import { createDebug } from './debug';
import { getAivoBus } from './events';
import { AivoLogger } from './logger';

export function createPublicAPI(engine: AivoEngine): AivoPublicAPI {
  const debug = createDebug(engine);
  const logger = AivoLogger.getInstance();
  const bus = getAivoBus();

  const api: AivoPublicAPI = {
    show(): void {
      engine.queue.enqueue({ type: 'show' });
    },

    hide(): void {
      engine.queue.enqueue({ type: 'hide' });
    },

    move(target: Element | string, options: { state?: string; size?: number | string; immediate?: boolean; source?: string } = {}): void {
      const size = normalizeSize(options.size);
      const state = normalizeState(options.state);
      engine.queue.enqueue({ type: 'move', target, size, state });
    },

    state(newState: EmotionState): void {
      engine.queue.enqueue({ type: 'state', state: newState });
    },

    say(message: string, duration: number = 3000): void {
      engine.queue.enqueue({ type: 'say', message, duration });
    },

    emit(eventName: string, data?: Record<string, unknown>): void {
      engine.events.emit(eventName, data);
    },

    goHome(): void {
      engine.queue.enqueue({ type: 'goHome' });
    },

    debug(): DebugReport { return debug(); },

    destroy(): void {
      engine.queue.enqueue({ type: 'destroy' });
    },

    on(event: string, handler: (payload: AivoEventPayload) => void): () => void {
      return engine.events.on(event, handler);
    },

    off(event: string, handler: (payload: AivoEventPayload) => void): void {
      engine.events.off(event, handler);
    },

    bus: {
      emit(event: AivoBusEvent | string, data?: Record<string, unknown>): void {
        bus.emit(event as AivoBusEvent, data);
      },
      on(event: AivoBusEvent | string, handler: (payload: AivoBusPayload) => void): () => void {
        return bus.on(event as AivoBusEvent, handler);
      },
      off(event: AivoBusEvent | string, handler: (payload: AivoBusPayload) => void): void {
        bus.off(event as AivoBusEvent, handler);
      },
    },

    logger: {
      info(module: string, message: string, data?: Record<string, unknown>): void {
        logger.info(module, message, data);
      },
      warn(module: string, message: string, data?: Record<string, unknown>): void {
        logger.warn(module, message, data);
      },
      error(module: string, message: string, data?: Record<string, unknown>): void {
        logger.error(module, message, data);
      },
      debug(module: string, message: string, data?: Record<string, unknown>): void {
        logger.debug(module, message, data);
      },
    },
  };

  return api;
}

/* ── Helpers ── */

function normalizeSize(size?: number | string): number | undefined {
  if (size === undefined || size === null) return undefined;
  if (typeof size === 'number') return size;
  return SIZE_MAP[size] ?? undefined;
}

function normalizeState(state?: string): EmotionState | undefined {
  if (!state) return undefined;
  const mapped = STATE_MAP[state] || state;
  return mapped as EmotionState;
}

/* ── Backward Compat ── */

export function createBackwardCompatAPI(engine: AivoEngine, api: AivoPublicAPI): void {
  (window as any).AivoAPI = {
    render(container: Element, options: { size?: number | string; state?: string } = {}): void {
      api.move(container, options);
    },
    setState(_container: Element, state: string): void {
      const normalized = normalizeState(state) || 'idle';
      api.state(normalized);
    },
  };

  (window as any).AivoPresence = {
    init: () => engine.boot(),
    getContainer: () => engine.presence.getContainer(),
    moveToElement: (el: Element, opts: any) => engine.presence.moveToElement(el, opts),
    moveTo: (name: string, opts: any) => engine.presence.moveToAnchor(name, opts),
    enterStandby: () => engine.presence.enterStandby(),
    getCurrentAnchor: () => engine.presence.getCurrentAnchor(),
    isStandby: () => engine.presence.isStandby(),
    goHome: () => engine.goHome(),
    destroy: () => engine.destroy(),
  };

  (window as any).AivoBus = {
    emit: (event: string, data?: Record<string, unknown>) => getAivoBus().emit(event, data),
    on: (event: string, handler: (p: AivoBusPayload) => void) => getAivoBus().on(event, handler),
    off: (event: string, handler: (p: AivoBusPayload) => void) => getAivoBus().off(event, handler),
  };
}
