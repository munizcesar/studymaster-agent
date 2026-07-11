/**
 * 🎭 AIVO — Logger
 *
 * Structured logging with timestamps.
 * Never use console.log() directly — use AivoLogger instead.
 *
 * Levels: debug, info, warn, error
 */

import type { LogEntry, LogLevel } from './types';

let instance: AivoLogger | null = null;

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LOG_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[90m',    // Gray
  info: '\x1b[36m',     // Cyan
  warn: '\x1b[33m',     // Yellow
  error: '\x1b[31m',    // Red
};

const LOG_PREFIXES: Record<LogLevel, string> = {
  debug: '🔍',
  info: 'ℹ️',
  warn: '⚠️',
  error: '❌',
};

export class AivoLogger {
  private entries: LogEntry[] = [];
  private maxEntries = 500;
  private minLevel: LogLevel = 'info';
  private destroyed = false;

  /* ── Singleton ── */

  static getInstance(): AivoLogger {
    if (!instance) instance = new AivoLogger();
    return instance;
  }

  static resetInstance(): void {
    instance = null;
  }

  /* ── Core Methods ── */

  debug(module: string, message: string, data?: Record<string, unknown>): void {
    this.log('debug', module, message, data);
  }

  info(module: string, message: string, data?: Record<string, unknown>): void {
    this.log('info', module, message, data);
  }

  warn(module: string, message: string, data?: Record<string, unknown>): void {
    this.log('warn', module, message, data);
  }

  error(module: string, message: string, data?: Record<string, unknown>): void {
    this.log('error', module, message, data);
  }

  /* ── Internal ── */

  private log(level: LogLevel, module: string, message: string, data?: Record<string, unknown>): void {
    if (this.destroyed) return;
    if (LOG_LEVELS[level] < LOG_LEVELS[this.minLevel]) return;

    const entry: LogEntry = {
      level,
      module,
      message,
      timestamp: Date.now(),
      data,
    };

    this.entries.push(entry);
    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }

    // Console output with timestamp
    const ts = new Date(entry.timestamp).toISOString().slice(11, 23);
    const prefix = LOG_PREFIXES[level];
    const color = LOG_COLORS[level];
    const reset = '\x1b[0m';

    // Use appropriate console method
    const consoleFn = level === 'error' ? console.error
      : level === 'warn' ? console.warn
      : console.log;

    if (data) {
      consoleFn(`${color}${prefix} [${ts}] [${module}] ${message}${reset}`, data);
    } else {
      consoleFn(`${color}${prefix} [${ts}] [${module}] ${message}${reset}`);
    }
  }

  /* ── Getters ── */

  getEntries(): ReadonlyArray<LogEntry> {
    return [...this.entries];
  }

  getRecent(count: number = 20): ReadonlyArray<LogEntry> {
    return this.entries.slice(-count);
  }

  getErrors(): ReadonlyArray<LogEntry> {
    return this.entries.filter((e) => e.level === 'error');
  }

  clear(): void {
    this.entries = [];
  }

  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  /* ── Export ── */

  exportAsJSON(): string {
    return JSON.stringify(this.entries, null, 2);
  }

  /* ── Destroy ── */

  destroy(): void {
    this.destroyed = true;
    this.entries = [];
    instance = null;
  }
}
