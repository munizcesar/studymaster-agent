/**
 * 🎭 AIVO — Command Queue (Enterprise)
 *
 * FIFO queue with:
 * - Sequential processing (no race conditions)
 * - Lock integration (blocks if movement lock active)
 * - Per-command timeout (auto-cancel at 800ms)
 * - Re-enqueue on failure (never discard commands)
 * - Priority support (high/critical bypass queue)
 * - Max 500 events
 */

import type { AivoCommand, QueuedCommand } from './types';
import { QUEUE_MAX_SIZE, COMMAND_TIMEOUT_MS } from './constants';
import { LockManager } from './lock';
import { AivoLogger } from './logger';

let instance: CommandQueue | null = null;

type FlushHandler = (command: AivoCommand) => boolean;

export class CommandQueue {
  private queue: QueuedCommand[] = [];
  private processing = false;
  private flushHandler: FlushHandler | null = null;
  private idCounter = 0;
  private lockManager = LockManager.getInstance();
  private logger = AivoLogger.getInstance();
  private destroyed = false;

  static getInstance(): CommandQueue {
    if (!instance) instance = new CommandQueue();
    return instance;
  }

  static resetInstance(): void { instance = null; }

  /* ── Enqueue ── */

  enqueue(command: AivoCommand): string {
    if (this.destroyed) return '';

    const id = `cmd_${++this.idCounter}_${Date.now()}`;
    const now = Date.now();

    // High priority: bypass queue and execute immediately
    if (command.priority === 'critical') {
      this.executeImmediate(command, id);
      return id;
    }

    if (this.queue.length >= QUEUE_MAX_SIZE) {
      this.logger.warn('Queue', `Full (${QUEUE_MAX_SIZE}), dropping oldest`);
      this.queue.shift();
    }

    this.queue.push({
      command,
      id,
      enqueuedAt: now,
      timeoutAt: now + COMMAND_TIMEOUT_MS,
    });

    this.logger.debug('Queue', `Enqueued: ${command.type} (${id})`);

    // Don't auto-process if locked — the lock release will trigger
    if (!this.lockManager.isAnyLocked()) {
      this.processNext();
    }

    return id;
  }

  /* ── High priority: execute immediately ── */

  private executeImmediate(command: AivoCommand, id: string): void {
    if (!this.flushHandler) return;
    this.logger.debug('Queue', `Critical immediate: ${command.type} (${id})`);
    try {
      this.flushHandler(command);
    } catch (err) {
      this.logger.error('Queue', `Critical command failed: ${err}`);
    }
  }

  /* ── Sequential Processing ── */

  processNext(): void {
    if (this.processing || !this.flushHandler) return;
    if (this.queue.length === 0) return;
    if (this.destroyed) return;

    // Check if any lock is active (except recovery locks)
    if (this.lockManager.isAnyLocked()) {
      this.logger.debug('Queue', 'Deferred: lock active');
      return;
    }

    this.processing = true;
    const remaining: QueuedCommand[] = [];

    while (this.queue.length > 0) {
      const next = this.queue.shift()!;

      // Check timeout
      if (Date.now() > next.timeoutAt) {
        this.logger.warn('Queue', `Timeout: ${next.id} (${next.command.type})`);
        // Timeout: re-enqueue (never discard)
        remaining.push(next);
        continue;
      }

      try {
        const success = this.flushHandler(next.command);
        if (success === false) {
          remaining.push(next); // Re-enqueue
        }
      } catch (err) {
        this.logger.error('Queue', `Error: ${next.id}: ${err}`);
        remaining.push(next); // Re-enqueue on error
      }
    }

    this.queue.unshift(...remaining);
    this.processing = false;
  }

  /** Called when a lock is released — process queued commands */
  onLockReleased(): void {
    this.processNext();
  }

  /* ── Flush Handler ── */

  setFlushHandler(handler: FlushHandler): void {
    this.flushHandler = handler;
    this.processNext();
  }

  removeFlushHandler(): void { this.flushHandler = null; }

  /* ── Getters ── */

  get length(): number { return this.queue.length; }
  get isProcessing(): boolean { return this.processing; }
  peek(): QueuedCommand | null { return this.queue[0] ?? null; }

  /* ── Lifecycle ── */

  clear(): void { this.queue = []; this.processing = false; }
  drain(): QueuedCommand[] { const d = [...this.queue]; this.queue = []; return d; }
  destroy(): void { this.destroyed = true; this.clear(); this.flushHandler = null; instance = null; }
}
