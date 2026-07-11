/**
 * 🎭 AIVO CORE — Constants
 */

export const VERSION = '3.0.0';
export const PRESENCE_ID = 'aivo-presence';
export const HOME_ANCHOR = '__home__';
export const HOME_X = 24;
export const HOME_Y = 80;
export const MASCOT_SIZE = 120;
export const GAP = 12;
export const PHASE_PREPARE_MS = 120;
export const PHASE_FLIGHT_MS = 380;
export const PHASE_ARRIVE_MS = 150;
export const STANDBY_SCALE = 0.95;
export const QUEUE_MAX = 100;
export const WATCHDOG_TICK_MS = 3000;

/* ── Emotion mapping (old → new) ── */

export const EMOTION_MAP: Record<string, string> = {
  idle: 'idle', thinking: 'thinking', explaining: 'speaking',
  motivating: 'proud', celebrating: 'celebrating', analyzing: 'thinking',
  waiting: 'calm', pointing: 'focus', happy: 'happy', error: 'error',
  attention: 'focus', calm: 'calm', greeting: 'greeting', sleepy: 'sleepy',
  focus: 'focus', typing: 'typing', password: 'password',
  listening: 'listening', speaking: 'speaking', curious: 'curious',
  loading: 'loading', surprised: 'surprised', confused: 'confused',
  concerned: 'concerned', success: 'success', proud: 'proud',
  warning: 'warning', processing: 'loading',
};
