/**
 * 🎭 AIVO CORE — Type Definitions
 * Persistent Actor: born once, lives forever, never destroyed.
 */

/* ── Engine Phases ── */

export type EnginePhase =
  | 'BOOT' | 'IDLE' | 'WAITING' | 'MOVING' | 'SPEAKING' | 'THINKING'
  | 'CELEBRATING' | 'ERROR' | 'RETURN_HOME';

export const PHASE_TRANSITIONS: Record<EnginePhase, EnginePhase[]> = {
  BOOT: ['IDLE', 'ERROR'],
  IDLE: ['WAITING', 'MOVING', 'SPEAKING', 'THINKING', 'ERROR'],
  WAITING: ['MOVING', 'IDLE', 'ERROR'],
  MOVING: ['IDLE', 'WAITING', 'SPEAKING', 'ERROR', 'RETURN_HOME'],
  SPEAKING: ['IDLE', 'THINKING', 'WAITING', 'MOVING', 'ERROR', 'RETURN_HOME'],
  THINKING: ['IDLE', 'SPEAKING', 'WAITING', 'MOVING', 'ERROR', 'RETURN_HOME'],
  CELEBRATING: ['IDLE', 'SPEAKING', 'WAITING', 'MOVING', 'ERROR', 'RETURN_HOME'],
  ERROR: ['IDLE', 'RETURN_HOME'],
  RETURN_HOME: ['IDLE', 'MOVING', 'ERROR'],
};

/* ── Emotion States (what AIVO looks like) ── */

export type Emotion =
  | 'idle' | 'calm' | 'greeting' | 'sleepy' | 'focus' | 'typing'
  | 'password' | 'listening' | 'speaking' | 'thinking' | 'teaching'
  | 'walking' | 'curious' | 'loading' | 'surprised' | 'confused'
  | 'error' | 'concerned' | 'success' | 'celebrating' | 'happy'
  | 'proud' | 'warning' | 'hidden';

export type ThemeMode = 'light' | 'dark';

/* ── Commands (only the engine processes these) ── */

export type CommandType = 'move' | 'speak' | 'think' | 'celebrate' | 'goHome' | 'reset' | 'show' | 'hide';

export interface Command {
  type: CommandType;
  target?: string; // anchor name
  emotion?: Emotion;
  message?: string;
  duration?: number;
  source?: string;
}

/* ── Events (external modules emit these) ── */

export type BusEvent =
  | 'boot:complete'
  | 'coach:open' | 'coach:close'
  | 'bubble:show' | 'bubble:hide'
  | 'wizard:step' | 'wizard:complete'
  | 'quiz:correct' | 'quiz:wrong'
  | 'quiz:start' | 'quiz:complete'
  | 'mentor:start' | 'mentor:message'
  | 'celebration:start' | 'celebration:complete'
  | 'home:return'
  | 'phase:change' | 'emotion:change'
  | (string & {});

/* ── Position ── */

export interface Position {
  x: number;
  y: number;
  rotate?: number;
  side?: 'left' | 'right' | 'bottom' | 'top';
}

/* ── Presence ── */

export interface PresenceState {
  el: HTMLElement | null;
  phase: 'hidden' | 'standby' | 'visible';
  currentAnchor: string | null;
  position: Position | null;
}

/* ── Anchor ── */

export interface AnchorData {
  element: Element;
  name: string;
  rect: DOMRectReadOnly | null;
  isVisible: boolean;
}

/* ── Queue ── */

export interface QueuedCommand {
  command: Command;
  id: string;
  enqueuedAt: number;
}

/* ── Debug / Health Dashboard ── */

export interface DebugReport {
  version: string;
  commit: string;
  phase: EnginePhase;
  emotion: Emotion;
  anchor: string | null;
  queueLength: number;
  queueProcessing: boolean;
  position: Position | null;
  containerExists: boolean;
  rootExists: boolean;
  uptimeMs: number;
  fps: number;
  memory: string;
  recoveryCount: number;
  lastError: string | null;
  anchorsCount: number;
  observerActive: boolean;
  engineCreatedMs: number;
}
