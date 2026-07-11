/**
 * 🎭 AIVO — Lock System
 *
 * Prevents conflicting operations.
 * While moving, no other movement is allowed.
 * Events are queued while a lock is active.
 * Auto-expires after timeout.
 */

import type { LockType, LockState } from './types';
import { MOVEMENT_LOCK_TIMEOUT_MS, STATE_LOCK_TIMEOUT_MS } from './constants';
import { AivoLogger } from './logger';

let instance: LockManager | null = null;

export class LockManager {
  private locks: Map<LockType, LockState> = new Map();
  private logger = AivoLogger.getInstance();

  /* ── Singleton ── */

  static getInstance(): LockManager {
    if (!instance) instance = new LockManager();
    return instance;
  }

  static resetInstance(): void {
    instance = null;
  }

  /* ── Acquire Lock ── */

  acquire(type: LockType, reason: string): boolean {
    // Check if already locked
    const existing = this.locks.get(type);
    if (existing) {
      // Check if expired
      if (Date.now() - existing.acquiredAt < existing.timeout) {
        this.logger.warn('Lock', `Blocked: ${type} already locked (${existing.reason})`);
        return false;
      }
      // Expired — release and acquire again
      this.release(type);
    }

    const timeout = this.getTimeoutFor(type);
    this.locks.set(type, { type, acquiredAt: Date.now(), reason, timeout });
    this.logger.debug('Lock', `Acquired: ${type} (${reason})`);
    return true;
  }

  /* ── Release Lock ── */

  release(type: LockType): void {
    const existing = this.locks.get(type);
    if (existing) {
      this.locks.delete(type);
      this.logger.debug('Lock', `Released: ${type}`);
    }
  }

  /* ── Check Lock ── */

  isLocked(type: LockType): boolean {
    const existing = this.locks.get(type);
    if (!existing) return false;
    if (Date.now() - existing.acquiredAt >= existing.timeout) {
      this.locks.delete(type);
      this.logger.warn('Lock', `Expired: ${type} (auto-released)`);
      return false;
    }
    return true;
  }

  isAnyLocked(): boolean {
    // Clean expired locks first
    this.cleanExpired();
    return this.locks.size > 0;
  }

  getLock(type: LockType): LockState | null {
    const lock = this.locks.get(type);
    if (!lock) return null;
    if (Date.now() - lock.acquiredAt >= lock.timeout) {
      this.locks.delete(type);
      return null;
    }
    return lock;
  }

  getAllLocks(): LockState[] {
    this.cleanExpired();
    return Array.from(this.locks.values());
  }

  /* ── Timeout helpers ── */

  private getTimeoutFor(type: LockType): number {
    switch (type) {
      case 'movement': return MOVEMENT_LOCK_TIMEOUT_MS;
      case 'state': return STATE_LOCK_TIMEOUT_MS;
      case 'animation': return 500;
      case 'recovery': return 5000;
    }
  }

  private cleanExpired(): void {
    const now = Date.now();
    this.locks.forEach((lock, type) => {
      if (now - lock.acquiredAt >= lock.timeout) {
        this.locks.delete(type);
      }
    });
  }

  /* ── Destroy ── */

  releaseAll(): void {
    this.locks.clear();
  }

  destroy(): void {
    this.locks.clear();
    instance = null;
  }
}
