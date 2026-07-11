/**
 * 🎭 AIVO — Constants (Enterprise)
 *
 * Single source of truth for all configuration values.
 */

export const PRESENCE_ID = 'aivo-presence';
export const PRESENCE_STYLE_ID = 'aivo-presence-style';

/* ── Sizing ── */

export const SIZE_PRESETS = {
  xs: 24,
  sm: 40,
  md: 64,
  lg: 120,
  xl: 200,
  xxl: 280,
} as const;

export const DEFAULT_SIZE = SIZE_PRESETS.lg;

/* ── State Mapping (old → new) ── */

export const STATE_MAP: Record<string, string> = {
  idle: 'idle',
  thinking: 'thinking',
  teaching: 'teaching',
  walking: 'walking',
  explaining: 'speaking',
  motivating: 'proud',
  celebrating: 'celebrating',
  analyzing: 'thinking',
  waiting: 'calm',
  pointing: 'focus',
  happy: 'happy',
  error: 'error',
  attention: 'focus',
  calm: 'calm',
  greeting: 'greeting',
  sleepy: 'sleepy',
  focus: 'focus',
  typing: 'typing',
  password: 'password',
  listening: 'listening',
  speaking: 'speaking',
  curious: 'curious',
  loading: 'loading',
  surprised: 'surprised',
  confused: 'confused',
  concerned: 'concerned',
  success: 'success',
  proud: 'proud',
  warning: 'warning',
  processing: 'loading',
};

export const SIZE_MAP: Record<string, number> = {
  xs: SIZE_PRESETS.xs,
  sm: SIZE_PRESETS.sm,
  md: SIZE_PRESETS.md,
  lg: SIZE_PRESETS.lg,
  xl: SIZE_PRESETS.xl,
  xxl: SIZE_PRESETS.xxl,
};

/* ── Motion ── */

export const PHASE_PREPARE_MS = 120;
export const PHASE_FLIGHT_MS = 380;
export const PHASE_ARRIVE_MS = 150;
export const MOVE_TIMEOUT_MS = 800; // Max time for a full move cycle
export const STANDBY_SCALE = 0.95;
export const STANDBY_OPACITY = 0.5;
export const MASCOT_DEFAULT_SIZE = 120;
export const MOVEMENT_GAP = 12;

/* ── Queue ── */

export const QUEUE_MAX_SIZE = 500; // 500 events in flight
export const COMMAND_TIMEOUT_MS = 800; // Max time per command

/* ── Lock System ── */

export const MOVEMENT_LOCK_TIMEOUT_MS = 2000; // Lock expires after 2s
export const STATE_LOCK_TIMEOUT_MS = 1000;

/* ── Health / Watchdog ── */

export const HEARTBEAT_INTERVAL_MS = 1000; // Every 1s (user spec)
export const WATCHDOG_TIMEOUT_MS = 2000; // 2s (user spec)
export const FPS_SAMPLE_WINDOW = 60;
export const FPS_LOW_THRESHOLD = 20;
export const RECOVERY_MAX_ATTEMPTS = 3;
export const RECOVERY_COOLDOWN_MS = 10000;

/* ── Boot ── */

export const BOOT_MAX_RETRIES = 50;
export const BOOT_RETRY_INTERVAL_MS = 100;

/* ── Home Position ── */

export const HOME_POSITION_X = 24;
export const HOME_POSITION_Y = 80;
export const HOME_ANCHOR = '__home__';

/* ── Visibility ── */

export const VISIBLE_OPACITY = 1;
export const HIDDEN_OPACITY = 0;
export const VISIBLE_SCALE = 1;
export const HIDDEN_SCALE = 0.5;
export const VISIBLE_Z_INDEX = 9000;
export const STANDBY_Z_INDEX = 9000;

/* ── Debug Overlay ── */

export const DEBUG_OVERLAY_ID = 'aivo-debug-overlay';
export const DEBUG_TRIGGER = '__AIVO_DEBUG__'; // window.__AIVO_DEBUG__ = true

/* ── Version ── */

export const VERSION = '2.0.0';
export const BUILD = '2026-07-10';
