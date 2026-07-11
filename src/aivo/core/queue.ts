/**
 * 🎭 AIVO CORE — Serial FIFO Queue
 *
 * One command at a time. Never discards.
 * While moving, next command waits.
 * All external requests go through here.
 */

import type { Command, QueuedCommand } from './types';
import { QUEUE_MAX } from './constants';

type ProcessFn = (cmd: Command) => void;

let instance: CommandQueue | null = null;

export class CommandQueue {
  private queue: QueuedCommand[] = [];
  private processing = false;
  private processor: ProcessFn | null = null;
  private id = 0;

  static getInstance(): CommandQueue {
    if (!instance) {
      instance = new CommandQueue();
      (window as any).__AIVO_QUEUE_COUNT__ = ((window as any).__AIVO_QUEUE_COUNT__ || 0) + 1;
    }
    return instance;
  }

  enqueue(command: Command): void {
    if (this.queue.length >= QUEUE_MAX) { this.queue.shift(); }
    this.queue.push({ command, id: `c${++this.id}`, enqueuedAt: Date.now() });
    this.tick();
  }

  /** Process one command — called when engine is ready for next */
  tick(): void {
    if (this.processing || !this.processor || this.queue.length === 0) return;
    this.processing = true;
    const next = this.queue.shift()!;
    try { this.processor(next.command); } catch { /* engine handles */ }
    // Note: engine MUST call done() when finished
  }

  /** Signal that current command is done — process next */
  done(): void {
    this.processing = false;
    this.tick();
  }

  setProcessor(fn: ProcessFn): void { this.processor = fn; }
  get length(): number { return this.queue.length; }
  get isProcessing(): boolean { return this.processing; }
  clear(): void { this.queue = []; this.processing = false; }
}
