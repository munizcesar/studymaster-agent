/**
 * 🎭 AIVO — Type Definitions (Enterprise)
 *
 * All types used across the AIVO mascot engine.
 * Two-level state: EnginePhase (what the engine is DOING) + EmotionState (what the mascot LOOKS like)
 */

/* ── Engine Phase States (what the engine is DOING) ── */

export type EnginePhase =
  | 'BOOT'
  | 'IDLE'
  | 'WAITING'
  | 'MOVING'
  | 'SPEAKING'
  | 'THINKING'
  | 'CELEBRATING'
  | 'ERROR'
  | 'RETURN_HOME';

export const ENGINE_PHASE_FLOW: EnginePhase[] = [
  'BOOT', 'IDLE', 'WAITING', 'MOVING', 'SPEAKING',
  'THINKING', 'CELEBRATING', 'ERROR', 'RETURN_HOME',
];

export const ENGINE_PHASE_TRANSITIONS: Record<EnginePhase, EnginePhase[]> = {
  BOOT: ['IDLE', 'ERROR'],
  IDLE: ['WAITING', 'MOVING', 'SPEAKING', 'THINKING', 'ERROR'],
  WAITING: ['IDLE', 'MOVING', 'SPEAKING', 'THINKING', 'ERROR', 'RETURN_HOME'],
  MOVING: ['IDLE', 'SPEAKING', 'ERROR', 'RETURN_HOME'],
  SPEAKING: ['IDLE', 'THINKING', 'CELEBRATING', 'MOVING', 'ERROR', 'RETURN_HOME'],
  THINKING: ['IDLE', 'SPEAKING', 'CELEBRATING', 'MOVING', 'ERROR', 'RETURN_HOME'],
  CELEBRATING: ['IDLE', 'SPEAKING', 'THINKING', 'MOVING', 'ERROR', 'RETURN_HOME'],
  ERROR: ['IDLE', 'RETURN_HOME', 'BOOT'],
  RETURN_HOME: ['IDLE', 'MOVING', 'ERROR'],
};

/* ── Emotion States (what the mascot LOOKS like) ── */

export type EmotionState =
  | 'idle'
  | 'calm'
  | 'greeting'
  | 'sleepy'
  | 'focus'
  | 'typing'
  | 'password'
  | 'listening'
  | 'speaking'
  | 'thinking'
  | 'teaching'
  | 'walking'
  | 'curious'
  | 'loading'
  | 'surprised'
  | 'confused'
  | 'error'
  | 'concerned'
  | 'success'
  | 'celebrating'
  | 'happy'
  | 'proud'
  | 'warning'
  | 'hidden';

export type AivoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | number;
export type AivoThemeMode = 'light' | 'dark';

/* ── AivoBus Events (domain events for external modules) ── */

export type AivoBusEvent =
  | 'aivo:boot'
  | 'aivo:ready'
  | 'aivo:error'
  | 'aivo:phase'
  | 'aivo:emotion'
  | 'aivo:move'
  | 'aivo:arrive'
  | 'aivo:show'
  | 'aivo:hide'
  | 'aivo:speak'
  | 'aivo:think'
  | 'aivo:celebrate'
  | 'aivo:warn'
  | 'aivo:home'
  | 'aivo:recovery'
  | 'aivo:heartbeat'
  | 'coach:open'
  | 'coach:close'
  | 'bubble:show'
  | 'bubble:hide'
  | 'quiz:correct'
  | 'quiz:wrong'
  | 'wizard:step'
  | 'wizard:complete'
  | 'mentor:start'
  | 'mentor:message'
  | 'celebration:start'
  | 'celebration:complete';

/* ── Engine Events ── */

export type AivoEngineEvent =
  | EnginePhaseChangeEvent
  | 'boot:starting'
  | 'boot:ready'
  | 'boot:error'
  | 'state:change'
  | 'state:before'
  | 'move:start'
  | 'move:prepare'
  | 'move:flight'
  | 'move:arrive'
  | 'move:end'
  | 'move:timeout'
  | 'show'
  | 'hide'
  | 'resize'
  | 'theme:change'
  | 'queue:flush'
  | 'queue:drain'
  | 'health:ok'
  | 'health:warning'
  | 'health:critical'
  | 'recovery:start'
  | 'recovery:complete'
  | 'recovery:failed'
  | 'watchdog:timeout'
  | 'lock:acquired'
  | 'lock:released'
  | 'lock:blocked'
  | 'error'
  | 'destroy'
  | (string & {});

type EnginePhaseChangeEvent = `phase:${Lowercase<EnginePhase>}`;

export interface AivoEventPayload {
  type: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

export interface AivoBusPayload {
  event: AivoBusEvent;
  timestamp: number;
  data?: Record<string, unknown>;
}

/* ── Command Queue ── */

export type AivoCommandType =
  | 'show'
  | 'hide'
  | 'state'
  | 'move'
  | 'say'
  | 'emit'
  | 'goHome'
  | 'debug'
  | 'destroy';

export interface AivoCommand {
  type: AivoCommandType;
  state?: EmotionState;
  target?: Element | string;
  size?: number;
  message?: string;
  duration?: number;
  event?: string;
  data?: Record<string, unknown>;
  priority?: 'normal' | 'high' | 'critical';
}

export interface QueuedCommand {
  command: AivoCommand;
  id: string;
  enqueuedAt: number;
  timeoutAt: number; // Auto-cancel timeout
}

/* ── Lock System ── */

export type LockType = 'movement' | 'state' | 'animation' | 'recovery';

export interface LockState {
  type: LockType;
  acquiredAt: number;
  reason: string;
  timeout: number; // ms
}

/* ── Home Position ── */

export interface HomePosition {
  x: number;
  y: number;
  anchor?: string;
}

/* ── Presence ── */

export interface MovePosition {
  x: number;
  y: number;
  rotate?: number;
  side?: 'left' | 'right' | 'bottom' | 'top';
}

export interface MoveOptions {
  state?: EmotionState;
  size?: number;
  immediate?: boolean;
  source?: string; // Who requested the move (for debugging)
}

export interface PresenceState {
  el: HTMLElement | null;
  initialized: boolean;
  currentAnchor: string | null;
  isStandby: boolean;
  currentPosition: MovePosition | null;
  isVisible: boolean;
}

/* ── Engine ── */

export interface EngineState {
  phase: EnginePhase;
  previousPhase: EnginePhase | null;
  bootAttempts: number;
  lastError: Error | null;
  uptimeMs: number;
  createdAt: number;
}

export type EngineStatus = 'uninitialized' | 'booting' | 'ready' | 'error' | 'destroyed';

/* ── Visibility ── */

export interface VisibilityState {
  opacity: number;
  display: 'block' | 'none';
  visibility: 'visible' | 'hidden';
  scale: number;
  zIndex: number;
  pointerEvents: 'auto' | 'none';
}

/* ── Logger ── */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  module: string;
  message: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

/* ── Health ── */

export interface HealthReport {
  status: 'ok' | 'warning' | 'critical';
  checks: {
    root: boolean;
    container: boolean;
    renderer: boolean;
    motion: boolean;
    queue: boolean;
    presence: boolean;
    state: boolean;
    phase: boolean;
    visibility: boolean;
    dom: boolean;
  };
  fps: number;
  memory: MemoryInfo | null;
  uptimeMs: number;
  lastHeartbeat: number;
}

interface MemoryInfo {
  usedJSHeapSize?: number;
  totalJSHeapSize?: number;
}

/* ── Debug ── */

export interface DebugReport {
  version: string;
  commit: string;
  build: string;
  engine: {
    phase: EnginePhase;
    previousPhase: EnginePhase | null;
    status: EngineStatus;
    uptimeMs: number;
    bootAttempts: number;
  };
  presence: PresenceState;
  emotion: {
    current: EmotionState | null;
    previous: EmotionState | null;
  };
  locks: LockState[];
  queue: {
    length: number;
    processing: boolean;
  };
  health: HealthReport;
  fps: number;
  memory: MemoryInfo | null;
  uptimeMs: number;
  renderer: {
    rootExists: boolean;
    lastRender: number | null;
  };
  visibility: VisibilityState;
  homePosition: HomePosition | null;
}

/* ── Public API ── */

export interface AivoPublicAPI {
  show(): void;
  hide(): void;
  move(target: Element | string, options?: MoveOptions): void;
  state(newState: EmotionState): void;
  say(message: string, duration?: number): void;
  emit(eventName: string, data?: Record<string, unknown>): void;
  goHome(): void;
  debug(): DebugReport;
  destroy(): void;
  on(event: string, handler: (payload: AivoEventPayload) => void): () => void;
  off(event: string, handler: (payload: AivoEventPayload) => void): void;
  bus: {
    emit(event: AivoBusEvent, data?: Record<string, unknown>): void;
    on(event: AivoBusEvent | string, handler: (payload: AivoBusPayload) => void): () => void;
    off(event: AivoBusEvent | string, handler: (payload: AivoBusPayload) => void): void;
  };
  logger: {
    info(module: string, message: string, data?: Record<string, unknown>): void;
    warn(module: string, message: string, data?: Record<string, unknown>): void;
    error(module: string, message: string, data?: Record<string, unknown>): void;
    debug(module: string, message: string, data?: Record<string, unknown>): void;
  };
}

/* ── Emotion State Machine Transitions ── */

export const VALID_EMOTION_TRANSITIONS: Record<EmotionState, EmotionState[]> = {
  idle: ['calm', 'greeting', 'sleepy', 'focus', 'thinking', 'teaching', 'curious', 'listening', 'speaking', 'loading', 'happy', 'walking', 'hidden'],
  calm: ['idle', 'sleepy', 'listening', 'thinking', 'hidden'],
  greeting: ['idle', 'calm', 'hidden'],
  sleepy: ['idle', 'calm', 'hidden'],
  focus: ['idle', 'typing', 'password', 'thinking', 'loading', 'hidden'],
  typing: ['idle', 'focus', 'password', 'hidden'],
  password: ['idle', 'focus', 'typing', 'hidden'],
  listening: ['idle', 'speaking', 'thinking', 'teaching', 'hidden'],
  speaking: ['idle', 'listening', 'thinking', 'teaching', 'hidden'],
  thinking: ['idle', 'curious', 'loading', 'speaking', 'teaching', 'surprised', 'confused', 'hidden'],
  teaching: ['idle', 'thinking', 'speaking', 'listening', 'celebrating', 'walking', 'hidden'],
  walking: ['idle', 'thinking', 'teaching', 'celebrating', 'hidden'],
  curious: ['idle', 'thinking', 'confused', 'hidden'],
  loading: ['idle', 'thinking', 'success', 'confused', 'error', 'teaching', 'hidden'],
  surprised: ['idle', 'happy', 'confused', 'celebrating', 'hidden'],
  confused: ['idle', 'thinking', 'teaching', 'concerned', 'error', 'hidden'],
  error: ['idle', 'concerned', 'confused', 'hidden'],
  concerned: ['idle', 'thinking', 'teaching', 'confused', 'hidden'],
  warning: ['idle', 'teaching', 'concerned', 'confused', 'thinking', 'hidden'],
  success: ['idle', 'celebrating', 'happy', 'proud', 'teaching', 'hidden'],
  celebrating: ['idle', 'happy', 'proud', 'teaching', 'walking', 'hidden'],
  happy: ['idle', 'calm', 'celebrating', 'proud', 'teaching', 'hidden'],
  proud: ['idle', 'happy', 'celebrating', 'teaching', 'hidden'],
  hidden: ['idle', 'calm', 'greeting', 'sleepy', 'thinking', 'teaching', 'walking'],
};
