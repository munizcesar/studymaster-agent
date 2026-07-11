/**
 * 🎭 AIVO — Debug
 *
 * window.Aivo.debug() returns complete enterprise system state.
 */

import type { DebugReport } from './types';
import type { AivoEngine } from './engine';
import { VERSION, BUILD } from './constants';

export function createDebug(engine: AivoEngine): () => DebugReport {
  return function debug(): DebugReport {
    engine.refreshHealthChecks();

    return {
      version: VERSION,
      commit: (window as any).__AIVO_COMMIT_HASH__ || 'unknown',
      build: BUILD,
      engine: {
        phase: engine.phaseMachine.getCurrent(),
        previousPhase: engine.phaseMachine.getPrevious(),
        status: engine.getStatus(),
        uptimeMs: engine.getUptimeMs(),
        bootAttempts: engine.getEngineState().bootAttempts,
      },
      presence: engine.presence.getState(),
      emotion: {
        current: engine.emotion.getCurrent(),
        previous: engine.emotion.getPrevious(),
      },
      locks: engine.lockManager.getAllLocks(),
      queue: {
        length: engine.queue.length,
        processing: engine.queue.isProcessing,
      },
      health: engine.getHealthReport(),
      fps: engine.health.getFps(),
      memory: engine.getHealthReport().memory,
      uptimeMs: engine.getUptimeMs(),
      renderer: {
        rootExists: engine.renderer.isReady(),
        lastRender: engine.renderer.getLastRenderTime(),
      },
      visibility: engine.visibility.getState(),
      homePosition: engine.home.getPosition(),
    };
  };
}
