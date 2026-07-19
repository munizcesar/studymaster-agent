import React, { useState, useEffect, useRef, useId, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Mic, Check, X, ChevronRight } from "lucide-react";

/**
 * <Aivo />
 * (Visual Core mantido intacto - Apenas a lógica visual SVG original)
 */
export const SIZE_PRESETS = { xs: 24, sm: 40, md: 64, lg: 120, xl: 200, xxl: 280 };

const PALETTE = {
  light: {
    paper: "#FAFAF8", card: "#FFFFFF", ink: "#18181B", inkSoft: "#6E6E73", line: "#E7E5E1", accent: "#C08A34",
    sphereHi: "#FFFFFF", sphereMid: "#EEEEED", sphereEdge: "#CACACE",
    eyeDeep: "#242428", eyeDeepSoft: "#3C3C42",
  },
  dark: {
    paper: "#141416", card: "#1C1C1F", ink: "#F2F2F0", inkSoft: "#9A9A9F", line: "#2C2C30", accent: "#E0AE5D",
    sphereHi: "#4C4C52", sphereMid: "#2E2D31", sphereEdge: "#151517",
    eyeDeep: "#000000", eyeDeepSoft: "#0C0C0E",
  },
};

const HEAD = { cx: 100, cy: 82, r: 60 };
const BODY_BALL = { cx: 100, cy: 164, r: 26 };
const EYE_L = { x: 86, y: 80 };
const EYE_R = { x: 114, y: 80 };
const BROW_L = { x: 86, y: 59 };
const BROW_R = { x: 114, y: 59 };
const RING_R = 92;
const SPEAK_RY = [2.5, 5.5, 3.5, 6.5, 2.5];

const BODY_VARIANTS = {
  idle: { animate: { y: [0, -6, 0], x: 0, scaleX: 1, scaleY: 1, rotate: 0 }, transition: { duration: 3.6, repeat: Infinity, ease: "easeInOut" } },
  calm: { animate: { y: [0, -3, 0], x: 0, scaleX: 1, scaleY: 1, rotate: 0 }, transition: { duration: 5.5, repeat: Infinity, ease: "easeInOut" } },
  greeting: { animate: { scaleX: [1, 0.97, 1.02, 1], scaleY: [1, 1.04, 0.98, 1], y: [0, -6, 0], x: 0, rotate: [0, -2, 2, 0] }, transition: { duration: 0.7, ease: "easeOut" } },
  sleepy: { animate: { y: [0, 3, 0], x: 0, scaleX: 1, scaleY: [1, 0.985, 1], rotate: 0 }, transition: { duration: 4.5, repeat: Infinity, ease: "easeInOut" } },
  focus: { animate: { y: -3, x: 0, scaleX: 1, scaleY: 1.015, rotate: 0 }, transition: { duration: 0.25, ease: "easeOut" } },
  typing: { animate: { y: 0, x: 0, scaleX: 1, scaleY: 1, rotate: 0 }, transition: { duration: 0.2 } },
  password: { animate: { y: 1, x: 0, scaleX: 0.98, scaleY: 0.985, rotate: 0 }, transition: { duration: 0.2 } },
  listening: { animate: { y: 0, x: 0, scaleX: [1, 1.012, 1], scaleY: [1, 1.012, 1], rotate: 0 }, transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut" } },
  speaking: { animate: { y: -1, x: 0, scaleX: 1, scaleY: 1.005, rotate: 0 }, transition: { duration: 0.2, ease: "easeOut" } },
  thinking: { animate: { rotate: [0, -2.5, 2.5, 0], y: 0, x: 0, scaleX: 1, scaleY: 1 }, transition: { duration: 4.5, repeat: Infinity, ease: "easeInOut" } },
  curious: { animate: { rotate: -9, y: -2, x: 0, scaleX: 1, scaleY: 1 }, transition: { duration: 0.3, ease: "easeOut" } },
  loading: { animate: { y: 0, x: 0, scaleX: [1, 1.03, 1], scaleY: [1, 1.03, 1], rotate: 0 }, transition: { duration: 1.1, repeat: Infinity, ease: "easeInOut" } },
  surprised: { animate: { scaleX: [1, 0.94, 1.03, 1], scaleY: [1, 1.08, 0.98, 1], y: [0, -5, 0], x: 0, rotate: 0 }, transition: { duration: 0.35, ease: "easeOut" } },
  confused: { animate: { rotate: [0, -4, 4, -2, 0], y: 0, x: 0, scaleX: 1, scaleY: 1 }, transition: { duration: 0.7, ease: "easeInOut" } },
  error: { animate: { x: [0, -5, 5, -5, 4, -2, 0], y: 0, scaleX: 1, scaleY: 1, rotate: [0, -2, 2, -1, 0] }, transition: { duration: 0.5, ease: "easeInOut" } },
  concerned: { animate: { y: 2, x: 0, scaleX: 1, scaleY: 0.99, rotate: 0 }, transition: { duration: 0.35, ease: "easeOut" } },
  success: { animate: { scaleX: [1, 0.95, 1.04, 1], scaleY: [1, 1.07, 0.96, 1], y: [0, -4, 0], x: 0, rotate: 0 }, transition: { duration: 0.45, ease: "easeOut" } },
  celebrating: { animate: { scaleX: [1, 0.93, 1.06, 0.97, 1], scaleY: [1, 1.1, 0.93, 1.04, 1], y: [0, -9, 0, -3, 0], x: 0, rotate: [0, -2.5, 2.5, 0] }, transition: { duration: 0.75, ease: "easeOut" } },
  happy: { animate: { y: [0, -5, 0], x: 0, scaleX: 1, scaleY: 1, rotate: 0 }, transition: { duration: 3.6, repeat: Infinity, ease: "easeInOut" } },
  proud: { animate: { rotate: [0, 4, 0], y: [0, 1, 0], x: 0, scaleX: 1, scaleY: 1 }, transition: { duration: 0.6, ease: "easeOut" } },
};

const MOUTH_MAP = {
  idle: "none", calm: "none", greeting: "smile", sleepy: "none", focus: "none",
  typing: "none", password: "none", listening: "none", thinking: "flat", curious: "none",
  loading: "none", surprised: "open", confused: "flat", error: "flat", concerned: "soft",
  success: "smile", celebrating: "smile", happy: "smile", proud: "smile",
};

const BLINK_EYES = ["idle", "focus", "curious", "thinking", "concerned", "happy", "proud", "confused", "calm", "listening"];
const BREATH_STATES = ["idle", "calm", "happy", "sleepy"];

const FIXED_GAZE = {
  greeting: { x: 0, y: -1 }, sleepy: { x: 0, y: 0 }, typing: { x: 0, y: 6 },
  password: { x: 0, y: 0 }, listening: { x: 0, y: -1 }, speaking: { x: 0, y: 0 },
  thinking: { x: -3.6, y: -4.2 }, loading: { x: 0, y: 0 }, surprised: { x: 0, y: 0 },
  confused: { x: 2, y: 1 }, error: { x: 0, y: 0 }, concerned: { x: 0, y: 2 },
  success: { x: 0, y: 0 }, celebrating: { x: 0, y: 0 }, proud: { x: 0, y: 0 },
};

function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getEyeAnim(state, blinking, side) {
  if (blinking && BLINK_EYES.includes(state)) return { scaleX: 1, scaleY: 0.08, rotate: 0, opacity: 1 };
  switch (state) {
    case "password": return { scaleX: 1, scaleY: 0.08, rotate: 0, opacity: 1 };
    case "typing": return { scaleX: 0.94, scaleY: 0.82, rotate: 0, opacity: 1 };
    case "loading": return { scaleX: 0.9, scaleY: 0.42, rotate: 0, opacity: 1 };
    case "sleepy": return { scaleX: 0.92, scaleY: 0.15, rotate: 0, opacity: 1 };
    case "thinking": return { scaleX: 0.95, scaleY: 0.88, rotate: 0, opacity: 1 };
    case "curious": return side === "left" ? { scaleX: 1.16, scaleY: 1.1, rotate: 0, opacity: 1 } : { scaleX: 1, scaleY: 1, rotate: 0, opacity: 1 };
    case "surprised": return { scaleX: 1.22, scaleY: 1.25, rotate: 0, opacity: 1 };
    case "error": return { scaleX: 0.85, scaleY: 0.86, rotate: side === "left" ? 98 : 82, opacity: 1 };
    case "concerned": return { scaleX: 0.95, scaleY: 0.94, rotate: side === "left" ? -8 : 8, opacity: 1 };
    case "success": return { scaleX: 1, scaleY: 1, rotate: 0, opacity: 0 };
    case "celebrating": return { scaleX: 1, scaleY: 1, rotate: 0, opacity: 0 };
    case "greeting": return { scaleX: 1.1, scaleY: 1.12, rotate: 0, opacity: 1 };
    case "confused": return side === "left" ? { scaleX: 1.05, scaleY: 0.9, rotate: -10, opacity: 1 } : { scaleX: 0.92, scaleY: 0.94, rotate: 8, opacity: 1 };
    case "calm": return { scaleX: 0.95, scaleY: 0.96, rotate: 0, opacity: 1 };
    case "listening": return { scaleX: 1.05, scaleY: 1.04, rotate: 0, opacity: 1 };
    default: return { scaleX: 1, scaleY: 1, rotate: 0, opacity: 1 };
  }
}

function getBrowAnim(state, side) {
  switch (state) {
    case "greeting": return { rotate: 0, y: -4, opacity: 0.5 };
    case "calm": return { rotate: 0, y: 0.5, opacity: 0.2 };
    case "focus": return { rotate: 0, y: -1.5, opacity: 0.35 };
    case "password": return { rotate: side === "left" ? -4 : 4, y: 1, opacity: 0.3 };
    case "listening": return { rotate: 0, y: -1, opacity: 0.35 };
    case "thinking": return side === "left" ? { rotate: -9, y: -1.5, opacity: 0.55 } : { rotate: 3, y: 0.5, opacity: 0.4 };
    case "curious": return side === "left" ? { rotate: -11, y: -3.5, opacity: 0.6 } : { rotate: 0, y: 0, opacity: 0.25 };
    case "surprised": return { rotate: 0, y: -5.5, opacity: 0.6 };
    case "confused": return side === "left" ? { rotate: -9, y: -2, opacity: 0.55 } : { rotate: 6, y: 2, opacity: 0.5 };
    case "error": return side === "left" ? { rotate: -14, y: -3, opacity: 0.65 } : { rotate: 10, y: 3, opacity: 0.65 };
    case "concerned": return side === "left" ? { rotate: -11, y: -2, opacity: 0.6 } : { rotate: 11, y: -2, opacity: 0.6 };
    case "success": return { rotate: 0, y: -3, opacity: 0.45 };
    case "celebrating": return side === "left" ? { rotate: -4, y: -5, opacity: 0.55 } : { rotate: 4, y: -5, opacity: 0.55 };
    case "happy": return { rotate: 0, y: -1, opacity: 0.3 };
    case "proud": return { rotate: 0, y: -2, opacity: 0.45 };
    case "sleepy": return { rotate: 0, y: 2, opacity: 0.2 };
    default: return { rotate: 0, y: 0, opacity: 0.25 };
  }
}

export function Aivo({ size = 120, state = "idle", themeMode = "light", lookTarget = null, className = "", style }) {
  const uid = useId().replace(/:/g, "");
  const wrapRef = useRef(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [blinking, setBlinking] = useState(false);
  const [glance, setGlance] = useState({ x: 0, y: 0 });
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [jitterL, setJitterL] = useState({ x: 0, y: 0 });
  const [jitterR, setJitterR] = useState({ x: 0, y: 0 });
  const [breath, setBreath] = useState({ y: 0, scaleY: 1 });
  const [speakFrame, setSpeakFrame] = useState(0);
  const [reducedMotion] = useState(prefersReducedMotion);
  const colors = PALETTE[themeMode] || PALETTE.light;

  useEffect(() => {
    const handleMove = (e) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, []);

  useEffect(() => {
    if (!BLINK_EYES.includes(state) || reducedMotion) return;
    let cancelled = false;
    let t;
    const schedule = () => {
      const delay = 2200 + Math.random() * 2600;
      t = setTimeout(() => {
        if (cancelled) return;
        setBlinking(true);
        setTimeout(() => !cancelled && setBlinking(false), 130);
        schedule();
      }, delay);
    };
    schedule();
    return () => { cancelled = true; clearTimeout(t); };
  }, [state, reducedMotion]);

  useEffect(() => {
    if ((state !== "idle" && state !== "calm") || reducedMotion) { setGlance({ x: 0, y: 0 }); return; }
    let cancelled = false;
    let t;
    const schedule = () => {
      const delay = 4000 + Math.random() * 3000;
      t = setTimeout(() => {
        if (cancelled) return;
        const angle = Math.random() * Math.PI * 2;
        const mag = 2 + Math.random() * 1.5;
        setGlance({ x: Math.cos(angle) * mag, y: Math.sin(angle) * mag * 0.6 });
        setTimeout(() => !cancelled && setGlance({ x: 0, y: 0 }), 650);
        schedule();
      }, delay);
    };
    schedule();
    return () => { cancelled = true; clearTimeout(t); };
  }, [state, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) { setJitterL({ x: 0, y: 0 }); return; }
    let cancelled = false;
    let t;
    const tick = () => {
      t = setTimeout(() => {
        if (cancelled) return;
        setJitterL({ x: (Math.random() - 0.5) * 0.9, y: (Math.random() - 0.5) * 0.6 });
        tick();
      }, 450 + Math.random() * 650);
    };
    tick();
    return () => { cancelled = true; clearTimeout(t); };
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) { setJitterR({ x: 0, y: 0 }); return; }
    let cancelled = false;
    let t;
    const tick = () => {
      t = setTimeout(() => {
        if (cancelled) return;
        setJitterR({ x: (Math.random() - 0.5) * 0.9, y: (Math.random() - 0.5) * 0.6 });
        tick();
      }, 520 + Math.random() * 680);
    };
    tick();
    return () => { cancelled = true; clearTimeout(t); };
  }, [reducedMotion]);

  useEffect(() => {
    if (!BREATH_STATES.includes(state) || reducedMotion) { setBreath({ y: 0, scaleY: 1 }); return; }
    let cancelled = false;
    let t;
    let up = true;
    const depthByState = { idle: 6, happy: 5, calm: 3, sleepy: 3 };
    const speedByState = { idle: 1700, happy: 1800, calm: 2600, sleepy: 2400 };
    const baseDepth = depthByState[state] ?? 5;
    const baseSpeed = speedByState[state] ?? 2000;
    const cycle = () => {
      const depth = baseDepth * (0.75 + Math.random() * 0.5);
      const dur = baseSpeed * (0.85 + Math.random() * 0.3);
      setBreath({ y: up ? -depth : 0, scaleY: up ? 1 + depth * 0.003 : 1 });
      up = !up;
      t = setTimeout(() => { if (!cancelled) cycle(); }, dur);
    };
    cycle();
    return () => { cancelled = true; clearTimeout(t); };
  }, [state, reducedMotion]);

  useEffect(() => {
    if (state !== "speaking") { setSpeakFrame(0); return; }
    let cancelled = false;
    let t;
    const cycle = () => {
      t = setTimeout(() => {
        if (cancelled) return;
        setSpeakFrame((f) => (f + 1) % SPEAK_RY.length);
        cycle();
      }, 110 + Math.random() * 90);
    };
    cycle();
    return () => { cancelled = true; clearTimeout(t); };
  }, [state]);

  useEffect(() => {
    if (state === "calm") { setEyeOffset({ x: glance.x, y: 1.5 + glance.y }); return; }
    if (FIXED_GAZE[state]) { setEyeOffset(FIXED_GAZE[state]); return; }
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const target = state === "focus" && lookTarget ? lookTarget : mouse;
    const dx = target.x - cx;
    const dy = target.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const max = 4.6;
    const clamped = Math.min(dist / 16, max);
    const base = { x: (dx / dist) * clamped, y: (dy / dist) * clamped };
    const extra = state === "idle" ? glance : { x: 0, y: 0 };
    setEyeOffset({ x: base.x + extra.x, y: base.y + extra.y });
  }, [mouse, state, lookTarget, glance]);

  const isBreathing = BREATH_STATES.includes(state);
  const body = BODY_VARIANTS[state] || BODY_VARIANTS.idle;
  const bodyAnimate = reducedMotion
    ? { ...body.animate, y: 0, x: 0, scaleX: 1, scaleY: 1, rotate: 0 }
    : isBreathing
      ? { ...body.animate, y: breath.y, scaleY: breath.scaleY }
      : body.animate;
  const bodyTransition = isBreathing ? { duration: 1.3, ease: "easeInOut" } : body.transition;
  const bodyLeanX = reducedMotion ? 0 : eyeOffset.x * 0.4;
  const bodyLeanRotate = reducedMotion ? 0 : eyeOffset.x * 0.3;
  const strokeW = size < 60 ? 1.6 : 1;
  const browH = size < 60 ? 6 : 4;
  const circumference = 2 * Math.PI * RING_R;
  const ringDash = `${circumference * 0.22} ${circumference}`;
  const mouthType = MOUTH_MAP[state] || "none";

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{
        width: size, height: size, flexShrink: 0,
        filter: themeMode === "light" ? "drop-shadow(0 14px 22px rgba(24,24,27,0.16))" : "drop-shadow(0 14px 24px rgba(0,0,0,0.55))",
        transition: "filter 0.3s ease",
        ...style,
      }}
    >
      <svg viewBox="0 0 200 200" width="100%" height="100%" role="img" aria-label={`Aivo Mascot`}>
        <defs>
          <radialGradient id={`sphere-${uid}`} cx="32%" cy="26%" r="80%">
            <stop offset="0%" stopColor={colors.sphereHi} />
            <stop offset="55%" stopColor={colors.sphereMid} />
            <stop offset="100%" stopColor={colors.sphereEdge} />
          </radialGradient>
          <linearGradient id={`eye-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.eyeDeep} />
            <stop offset="100%" stopColor={colors.eyeDeepSoft} />
          </linearGradient>
          <filter id={`soft-${uid}`}>
            <feGaussianBlur stdDeviation="5.5" />
          </filter>
        </defs>

        <motion.g animate={{ x: bodyLeanX, rotate: bodyLeanRotate }} transition={{ type: "spring", stiffness: 90, damping: 14 }} style={{ originX: 0.5, originY: 0.5 }}>
          <AnimatePresence>
            {state === "loading" && (
              <motion.circle key="ring-loading" cx="100" cy="100" r={RING_R} fill="none" stroke={colors.accent} strokeWidth={strokeW + 3} strokeLinecap="round" strokeDasharray={ringDash} initial={{ opacity: 0 }} animate={{ opacity: 1, rotate: 360 }} exit={{ opacity: 0 }} transition={{ rotate: { repeat: Infinity, ease: "linear", duration: 1.1 }, opacity: { duration: 0.2 } }} style={{ originX: 0.5, originY: 0.5 }} />
            )}
            {state === "listening" && (
              <motion.circle key="ring-listening" cx="100" cy="100" r={RING_R} fill="none" stroke={colors.accent} strokeWidth={strokeW + 2} strokeLinecap="round" strokeDasharray="5 11" initial={{ opacity: 0 }} animate={{ opacity: [0.25, 0.6, 0.25], scale: [1, 1.03, 1] }} exit={{ opacity: 0 }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} style={{ originX: 0.5, originY: 0.5 }} />
            )}
          </AnimatePresence>

          <motion.g animate={bodyAnimate} transition={bodyTransition} style={{ originX: 0.5, originY: 0.5 }}>
            <ellipse cx={BODY_BALL.cx} cy={HEAD.cy + HEAD.r - 8} rx="19" ry="7" fill={colors.eyeDeep} opacity="0.14" filter={`url(#soft-${uid})`} />
            <circle cx={BODY_BALL.cx} cy={BODY_BALL.cy} r={BODY_BALL.r} fill={`url(#sphere-${uid})`} stroke={colors.sphereEdge} strokeWidth={strokeW} />
            <circle cx={HEAD.cx} cy={HEAD.cy} r={HEAD.r} fill={`url(#sphere-${uid})`} stroke={colors.sphereEdge} strokeWidth={strokeW} />
            <ellipse cx={HEAD.cx - 26} cy={HEAD.cy - 35} rx="21" ry="28" fill="#FFFFFF" opacity={themeMode === "light" ? 0.4 : 0.22} filter={`url(#soft-${uid})`} />

            <motion.g animate={{ y: getBrowAnim(state, "left").y }} transition={{ duration: 0.25, ease: "easeOut" }}>
              <motion.rect x={BROW_L.x - 9} y={BROW_L.y - browH / 2} width="18" height={browH} rx={browH / 2} fill={colors.eyeDeepSoft} animate={{ rotate: getBrowAnim(state, "left").rotate, opacity: getBrowAnim(state, "left").opacity }} transition={{ duration: 0.25, ease: "easeOut" }} style={{ originX: 0.5, originY: 0.5 }} />
            </motion.g>
            <motion.g animate={{ y: getBrowAnim(state, "right").y }} transition={{ duration: 0.25, ease: "easeOut" }}>
              <motion.rect x={BROW_R.x - 9} y={BROW_R.y - browH / 2} width="18" height={browH} rx={browH / 2} fill={colors.eyeDeepSoft} animate={{ rotate: getBrowAnim(state, "right").rotate, opacity: getBrowAnim(state, "right").opacity }} transition={{ duration: 0.25, ease: "easeOut" }} style={{ originX: 0.5, originY: 0.5 }} />
            </motion.g>

            <motion.g animate={{ x: eyeOffset.x, y: eyeOffset.y }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
              <motion.g animate={{ x: jitterL.x, y: jitterL.y }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                <motion.rect x={EYE_L.x - 8} y={EYE_L.y - 17} width="16" height="34" rx="8" fill={`url(#eye-${uid})`} animate={getEyeAnim(state, blinking, "left")} transition={{ duration: 0.18 }} style={{ originX: 0.5, originY: 0.5 }} />
              </motion.g>
              <motion.g animate={{ x: jitterR.x, y: jitterR.y }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                <motion.rect x={EYE_R.x - 8} y={EYE_R.y - 17} width="16" height="34" rx="8" fill={`url(#eye-${uid})`} animate={getEyeAnim(state, blinking, "right")} transition={{ duration: 0.18 }} style={{ originX: 0.5, originY: 0.5 }} />
              </motion.g>
            </motion.g>

            <AnimatePresence>
              {(state === "success" || state === "celebrating") && (
                <motion.g key="happy-eyes" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={{ duration: 0.2 }} style={{ originX: 0.5, originY: 0.5 }}>
                  <path d={`M ${EYE_L.x - 9} 83 Q ${EYE_L.x} 70 ${EYE_L.x + 9} 83`} fill="none" stroke={colors.eyeDeep} strokeWidth="7" strokeLinecap="round" />
                  <path d={`M ${EYE_R.x - 9} 83 Q ${EYE_R.x} 70 ${EYE_R.x + 9} 83`} fill="none" stroke={colors.eyeDeep} strokeWidth="7" strokeLinecap="round" />
                </motion.g>
              )}
            </AnimatePresence>

            {state === "speaking" ? (
              <motion.ellipse cx="100" cy="118" rx="7" animate={{ ry: SPEAK_RY[speakFrame] }} transition={{ duration: 0.1 }} fill={colors.eyeDeep} />
            ) : (
              <AnimatePresence mode="wait">
                {mouthType !== "none" && (
                  <motion.g key={mouthType} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} transition={{ duration: 0.18 }} style={{ originX: 0.5, originY: 0.5 }}>
                    {mouthType === "smile" && <path d={`M 86 116 Q 100 129 114 116 Q 100 121 86 116 Z`} fill={`url(#eye-${uid})`} />}
                    {mouthType === "flat" && <path d={`M 87 114 Q 100 109.5 113 114 Q 100 112 87 114 Z`} fill={`url(#eye-${uid})`} />}
                    {mouthType === "soft" && <path d={`M 87 116 Q 100 120.5 113 116 Q 100 118 87 116 Z`} fill={`url(#eye-${uid})`} />}
                    {mouthType === "open" && <circle cx="100" cy="118" r="6.5" fill={`url(#eye-${uid})`} />}
                  </motion.g>
                )}
              </AnimatePresence>
            )}
          </motion.g>
        </motion.g>
      </svg>
    </div>
  );
}


/* ------------------------------------------------------------------ */
/*  Gerenciador do Tour Guiado (Novo Sistema Flutuante Inteligente)   */
/* ------------------------------------------------------------------ */

export default function AivoTourOverlay() {
  const [tourState, setTourState] = useState({
    active: false,
    message: "",
    mascotState: "idle",
  });
  const [themeMode, setThemeMode] = useState("dark");

  // Detecta tema do documento
  useEffect(() => {
    const update = () => {
      const t = document.documentElement.getAttribute('data-theme');
      setThemeMode(t === 'light' ? 'light' : 'dark');
    };
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  // Listener Global de eventos de tour
  useEffect(() => {
    const handleTourEvent = (e) => {
      if (e.detail?.close) {
        setTourState(prev => ({ ...prev, active: false, mascotState: 'idle' }));
        return;
      }
      setTourState({
        active: true,
        message: e.detail.message || "Olá!",
        mascotState: e.detail.state || "greeting",
      });
      if (e.detail.state === "speaking") {
        setTimeout(() => {
          setTourState(prev => ({ ...prev, mascotState: "idle" }));
        }, 3000);
      }
    };
    window.addEventListener('aivo-tour', handleTourEvent);
    return () => window.removeEventListener('aivo-tour', handleTourEvent);
  }, []);

  const handleDismiss = () => {
    setTourState(prev => ({ ...prev, mascotState: "success" }));
    setTimeout(() => {
      setTourState(prev => ({ ...prev, active: false, mascotState: 'idle' }));
    }, 1200);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '12px',
        pointerEvents: 'none',
      }}
    >
      {/* Balão de fala — só aparece quando tour está ativo */}
      <AnimatePresence>
        {tourState.active && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.12)',
              borderRadius: '16px',
              padding: '16px',
              width: '280px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              pointerEvents: 'auto',
              position: 'relative',
            }}
          >
            <p style={{ color: '#1a1a1a', fontSize: '14px', lineHeight: '1.5', marginBottom: '12px', fontWeight: 500 }}>
              {tourState.message}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleDismiss}
                style={{
                  background: '#1B365D',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                Entendi ›
              </button>
            </div>
            {/* Seta apontando para o mascote (abaixo) */}
            <div style={{
              position: 'absolute',
              bottom: '-8px',
              right: '52px',
              width: '16px',
              height: '16px',
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.12)',
              borderTop: 'none',
              borderLeft: 'none',
              transform: 'rotate(45deg)',
            }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mascote — sempre visível */}
      <motion.div
        animate={tourState.active
          ? { scale: [1, 1.08, 1], rotate: [0, -3, 3, 0] }
          : { scale: 1, rotate: 0 }
        }
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ pointerEvents: 'auto', cursor: 'pointer' }}
        onClick={() => {
          if (!tourState.active) {
            window.dispatchEvent(new CustomEvent('aivo-tour', {
              detail: { message: 'Olá! Precisa de ajuda? É só perguntar!', state: 'greeting' }
            }));
          } else {
            handleDismiss();
          }
        }}
      >
        <Aivo
          size={100}
          state={tourState.mascotState}
          themeMode={themeMode}
        />
      </motion.div>
    </div>
  );
}
