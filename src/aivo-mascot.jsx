import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Mic, Check, X } from "lucide-react";

/**
 * <Aivo />
 * Mascote oficial da AIVOS — corpo em forma de gota, sobrancelhas e 20 estados.
 * Abstrato de propósito (sem rosto humano literal): mesma escolha de design do
 * avatar "Mico" do Copilot e da Notion — evita o "vale da estranheza" e deixa
 * a expressividade morar inteiramente em poucos elementos.
 *
 * Ajustes feitos em cima do guia enviado (ver conversa para o porquê):
 *  - Mantive a arquitetura de estado único (`state`), não separei em flags
 *    booleanas soltas (blink/breathing/talking) — evita combinações que
 *    ninguém desenhou.
 *  - Não recriei "PhysicsEngine" à parte: Framer Motion já é o motor de física
 *    (spring, damping) usado em toda a lógica de estado abaixo.
 *  - Reduzi a amplitude de greeting/success/celebrating/surprised em relação
 *    à versão anterior — o guia pede "nunca infantilidade", e o bounce
 *    exagerado de antes lia mais como personagem de app infantil.
 *
 * Props:
 *  - size       número em px (ou use SIZE_PRESETS.md etc.)
 *  - state      ver STATES abaixo (20 estados)
 *  - themeMode  "light" | "dark"
 *  - lookTarget { x, y } em coordenadas de tela — usado no estado "focus"
 *  - className, style
 */

export const SIZE_PRESETS = { xs: 24, sm: 40, md: 64, lg: 120, xl: 200, xxl: 280 };

const PALETTE = {
  light: { paper: "#FAFAF8", card: "#FFFFFF", ink: "#18181B", inkSoft: "#6E6E73", line: "#E7E5E1", accent: "#0D47FF" },
  dark: { paper: "#141416", card: "#1C1C1F", ink: "#F2F2F0", inkSoft: "#9A9A9F", line: "#2C2C30", accent: "#4D88FF" },
};

// Corpo redesenhado: curvas contínuas e fluidas inspiradas na identidade visual
// AIVOS. A silhueta evoca uma gota em movimento — mais larga na base,
// com assimetria orgânica sutil que sugere fluxo e energia contida.
// A curva direita é mais projetada para fora, a esquerda mais recolhida,
// criando uma sensação de movimento mesmo quando parado.
// Corpo em formato de gota clássica: estreito no topo, alargando suavemente
// até o meio, e arredondando na base. A altura é ~35% maior que a largura,
// garantindo uma silhueta inequivocamente de gota — nunca redonda.
// As curvas são contínuas e elegantes, sem ângulos retos.
// Gota clássica: estreita no topo (ponto em y=0), alargamento contínuo até o
// máximo em ~60% da altura (y=118, largura=110px), depois arredondando para
// a base. A altura (196px) é 78% maior que a largura máxima (110px) —
// silhueta inequivocamente de gota, nunca redonda.
const BLOB_PATH = "M 100 0 C 110 2, 118 10, 128 38 C 140 72, 155 118, 150 148 C 146 172, 126 196, 100 196 C 74 196, 54 172, 50 148 C 45 118, 60 72, 72 38 C 82 10, 90 2, 100 0 Z";

const EYE_L = { x: 78, y: 97 };
const EYE_R = { x: 122, y: 97 };
const BROW_L = { x: 78, y: 70 };
const BROW_R = { x: 122, y: 70 };
const RING_R = 76;
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
  teaching: { animate: { y: [0, -1, 1, 0], x: 0, rotate: [0, -1, 1, 0], scaleX: 1, scaleY: 1 }, transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" } },
  walking: { animate: { y: 0, x: [0, 4, 0, -4, 0], rotate: [0, 2, 0, -2, 0], scaleX: 1, scaleY: 1 }, transition: { duration: 1.6, repeat: Infinity, ease: "easeInOut" } },
  curious: { animate: { rotate: -9, y: -2, x: 0, scaleX: 1, scaleY: 1 }, transition: { duration: 0.3, ease: "easeOut" } },
  loading: { animate: { y: 0, x: 0, scaleX: [1, 1.03, 1], scaleY: [1, 1.03, 1], rotate: 0 }, transition: { duration: 1.1, repeat: Infinity, ease: "easeInOut" } },
  surprised: { animate: { scaleX: [1, 0.94, 1.03, 1], scaleY: [1, 1.08, 0.98, 1], y: [0, -5, 0], x: 0, rotate: 0 }, transition: { duration: 0.35, ease: "easeOut" } },
  confused: { animate: { rotate: [0, -4, 4, -2, 0], y: 0, x: 0, scaleX: 1, scaleY: 1 }, transition: { duration: 0.7, ease: "easeInOut" } },
  error: { animate: { x: [0, -5, 5, -5, 4, -2, 0], y: 0, scaleX: 1, scaleY: 1, rotate: [0, -2, 2, -1, 0] }, transition: { duration: 0.5, ease: "easeInOut" } },
  concerned: { animate: { y: 2, x: 0, scaleX: 1, scaleY: 0.99, rotate: 0 }, transition: { duration: 0.35, ease: "easeOut" } },
  warning: { animate: { x: [0, -2, 2, -1, 0], y: 1, scaleX: 1, scaleY: 0.98, rotate: [0, 1, -1, 0] }, transition: { duration: 0.6, ease: "easeOut" } },
  success: { animate: { scaleX: [1, 0.95, 1.04, 1], scaleY: [1, 1.07, 0.96, 1], y: [0, -4, 0], x: 0, rotate: 0 }, transition: { duration: 0.45, ease: "easeOut" } },
  celebrating: { animate: { scaleX: [1, 0.93, 1.06, 0.97, 1], scaleY: [1, 1.1, 0.93, 1.04, 1], y: [0, -9, 0, -3, 0], x: 0, rotate: [0, -2.5, 2.5, 0] }, transition: { duration: 0.75, ease: "easeOut" } },
  happy: { animate: { y: [0, -5, 0], x: 0, scaleX: 1, scaleY: 1, rotate: 0 }, transition: { duration: 3.6, repeat: Infinity, ease: "easeInOut" } },
  proud: { animate: { rotate: [0, 4, 0], y: [0, 1, 0], x: 0, scaleX: 1, scaleY: 1 }, transition: { duration: 0.6, ease: "easeOut" } },
  hidden: { animate: { opacity: 0, scale: 0.5, y: 0, x: 0, rotate: 0 }, transition: { duration: 0.3, ease: "easeOut" } },
};

// "speaking" tem boca animada à parte (ver render) — não entra neste mapa.
const MOUTH_MAP = {
  idle: "none", calm: "none", greeting: "smile", sleepy: "none", focus: "none",
  typing: "none", password: "none", listening: "none", thinking: "flat", teaching: "smile",
  walking: "none", curious: "none",
  loading: "none", surprised: "open", confused: "flat", error: "flat", concerned: "soft", warning: "soft",
  success: "smile", celebrating: "smile", happy: "smile", proud: "smile", hidden: "none",
};

const STATE_CAPTIONS = {
  idle: "acompanhando o cursor",
  calm: "presença tranquila, sem pressa",
  greeting: "olá — pronto para ajudar",
  sleepy: "em espera, ninguém por aqui",
  focus: "atento ao campo",
  typing: "acompanhando o que você escreve",
  password: "protegendo sua privacidade",
  listening: "ouvindo com atenção",
  speaking: "respondendo",
  thinking: "avaliando com calma",
  teaching: "explicando um conceito",
  walking: "movendo-se para o próximo tópico",
  curious: "reparando em algo novo",
  loading: "processando",
  surprised: "não esperava por isso",
  confused: "não ficou claro",
  error: "algo não funcionou",
  concerned: "isso pode precisar de atenção",
  warning: "atenção — algo merece cuidado",
  success: "confirmado",
  celebrating: "conquista registrada",
  happy: "tudo tranquilo por aqui",
  proud: "bom progresso",
  hidden: "modo invisível",
};

const STATE_GROUPS = [
  { label: "base", states: ["idle", "calm", "greeting", "sleepy", "hidden"] },
  { label: "atenção", states: ["focus", "typing", "password", "listening", "speaking", "teaching"] },
  { label: "raciocínio", states: ["thinking", "curious", "loading"] },
  { label: "movimento", states: ["walking"] },
  { label: "atrito", states: ["confused", "error", "concerned", "surprised", "warning"] },
  { label: "conquista", states: ["success", "celebrating", "happy", "proud"] },
];

const BLINK_EYES = ["idle", "focus", "curious", "thinking", "teaching", "concerned", "warning", "happy", "proud", "confused", "calm", "listening"];
const NO_GLINT = ["password", "loading", "sleepy", "hidden"];
const BREATH_STATES = ["idle", "calm", "happy", "sleepy", "teaching"];
// idle, focus, curious e happy não aparecem em FIXED_GAZE nem são "calm" —
// por eliminação, esses quatro acompanham o cursor (ver efeito de gaze abaixo).

const FIXED_GAZE = {
  greeting: { x: 0, y: -1 },
  sleepy: { x: 0, y: 0 },
  typing: { x: 0, y: 6 },
  password: { x: 0, y: 0 },
  listening: { x: 0, y: -1 },
  speaking: { x: 0, y: 0 },
  thinking: { x: -3.6, y: -4.2 },
  teaching: { x: 0, y: -2 },
  walking: { x: 2, y: 0 },
  loading: { x: 0, y: 0 },
  surprised: { x: 0, y: 0 },
  confused: { x: 2, y: 1 },
  error: { x: 0, y: 0 },
  concerned: { x: 0, y: 2 },
  warning: { x: 0, y: 3 },
  success: { x: 0, y: 0 },
  celebrating: { x: 0, y: 0 },
  proud: { x: 0, y: 0 },
  hidden: { x: 0, y: 0 },
};

function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getEyeAnim(state, blinking, side) {
  if (blinking && BLINK_EYES.includes(state)) return { scaleY: 0.08, rotate: 0, opacity: 1 };
  switch (state) {
    case "password": return { scaleY: 0.08, rotate: 0, opacity: 1 };
    case "typing": return { scaleY: 0.82, rotate: 0, opacity: 1 };
    case "loading": return { scaleY: 0.42, rotate: 0, opacity: 1 };
    case "sleepy": return { scaleY: 0.15, rotate: 0, opacity: 1 };
    case "thinking": return { scaleY: 0.88, rotate: 0, opacity: 1 };
    case "curious": return { scaleY: 1.06, rotate: 0, opacity: 1 };
    case "surprised": return { scaleY: 1.2, rotate: 0, opacity: 1 };
    case "error": return { scaleY: 0.86, rotate: side === "left" ? 98 : 82, opacity: 1 };
    case "concerned": return { scaleY: 0.94, rotate: 0, opacity: 1 };
    case "success": return { scaleY: 1, rotate: 0, opacity: 0 };
    case "celebrating": return { scaleY: 1, rotate: 0, opacity: 0 };
    case "greeting": return { scaleY: 1.08, rotate: 0, opacity: 1 };
    case "confused": return { scaleY: 0.92, rotate: 0, opacity: 1 };
    case "calm": return { scaleY: 0.96, rotate: 0, opacity: 1 };
    case "listening": return { scaleY: 1.02, rotate: 0, opacity: 1 };
    case "teaching": return { scaleY: 1.04, rotate: 0, opacity: 1 };
    case "walking": return { scaleY: 0.94, rotate: 0, opacity: 1 };
    case "warning": return { scaleY: 0.96, rotate: 0, opacity: 1 };
    case "hidden": return { scaleY: 0, rotate: 0, opacity: 0 };
    default: return { scaleY: 1, rotate: 0, opacity: 1 };
  }
}

function getBrowAnim(state, side) {
  switch (state) {
    case "greeting": return { rotate: 0, y: -4 };
    case "calm": return { rotate: 0, y: 0.5 };
    case "focus": return { rotate: 0, y: -1.5 };
    case "password": return { rotate: side === "left" ? -4 : 4, y: 1 };
    case "listening": return { rotate: 0, y: -1 };
    case "thinking": return side === "left" ? { rotate: -9, y: -1.5 } : { rotate: 3, y: 0.5 };
    case "curious": return side === "left" ? { rotate: -11, y: -3.5 } : { rotate: 0, y: 0 };
    case "surprised": return { rotate: 0, y: -5.5 };
    case "confused": return side === "left" ? { rotate: -9, y: -2 } : { rotate: 6, y: 2 };
    case "error": return side === "left" ? { rotate: -14, y: -3 } : { rotate: 10, y: 3 };
    case "concerned": return side === "left" ? { rotate: -11, y: -2 } : { rotate: 11, y: -2 };
    case "success": return { rotate: 0, y: -3 };
    case "celebrating": return side === "left" ? { rotate: -4, y: -5 } : { rotate: 4, y: -5 };
    case "happy": return { rotate: 0, y: -1 };
    case "proud": return { rotate: 0, y: -2 };
    case "sleepy": return { rotate: 0, y: 2 };
    case "teaching": return { rotate: 0, y: -2 };
    case "walking": return side === "left" ? { rotate: 2, y: 0 } : { rotate: -2, y: 0 };
    case "warning": return side === "left" ? { rotate: -8, y: 1 } : { rotate: 8, y: 1 };
    case "hidden": return { rotate: 0, y: 4 };
    default: return { rotate: 0, y: 0 };
  }
}

export function Aivo({ size = 120, state = "idle", themeMode = "light", lookTarget = null, className = "", style }) {
  const wrapRef = useRef(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [blinking, setBlinking] = useState(false);
  const [glance, setGlance] = useState({ x: 0, y: 0 });
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [jitterL, setJitterL] = useState({ x: 0, y: 0 });
  const [jitterR, setJitterR] = useState({ x: 0, y: 0 });
  const [breath, setBreath] = useState({ y: 0, x: 0, scaleY: 1, scaleX: 1, rotate: 0 });
  const [breathPhase, setBreathPhase] = useState('inhale'); // 'inhale' | 'exhale' (para re-render do halo)
  const breathPhaseRef = useRef('inhale'); // ref sem stale closure para o timing
  const [speakFrame, setSpeakFrame] = useState(0);
  const [reducedMotion] = useState(prefersReducedMotion);
  const colors = PALETTE[themeMode] || PALETTE.light;

  useEffect(() => {
    const handleMove = (e) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, []);

  // piscadas naturais
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

  // olhar espontâneo — pequenos desvios aleatórios em idle/calm, mesmo sem o mouse se mexer
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

  // microssacadas — cada olho treme sozinho, num intervalo levemente diferente
  // do outro, pra nunca ficarem perfeitamente sincronizados (pupilas independentes)
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

  // respiração orgânica assimétrica — inspiração mais lenta que expiração,
  // com balanço lateral sutil (sway) e rotação do corpo. Cada ciclo varia
  // profundidade, duração e amplitude do sway, nunca repetindo de forma idêntica.
  useEffect(() => {
    if (!BREATH_STATES.includes(state) || reducedMotion) {
      setBreath({ y: 0, x: 0, scaleY: 1, scaleX: 1, rotate: 0 });
      setBreathPhase('inhale');
      return;
    }
    let cancelled = false;
    let t;
    breathPhaseRef.current = 'inhale';
    const depthByState = { idle: 8, happy: 6, calm: 4, sleepy: 3 };
    const speedByState = { idle: 1500, happy: 1800, calm: 2400, sleepy: 2200 };
    const baseDepth = depthByState[state] ?? 5;
    const baseSpeed = speedByState[state] ?? 2000;
    const cycle = () => {
      const depth = baseDepth * (0.75 + Math.random() * 0.5);
      const sway = baseDepth * 0.3 * (Math.random() * 0.3 + 0.85);
      // Alterna entre inspiração e expiração via ref (sem stale closure)
      const nextPhase = breathPhaseRef.current === 'inhale' ? 'exhale' : 'inhale';
      breathPhaseRef.current = nextPhase;
      setBreathPhase(nextPhase); // atualiza state para re-render do halo
      if (nextPhase === 'inhale') {
        // Inspiração: flutua para cima, balança lateral, expande corpo
        setBreath({ y: -depth, x: sway, scaleY: 1 + depth * 0.004, scaleX: 1 + depth * 0.002, rotate: sway * 0.5 });
      } else {
        // Expiração: retorna ao neutro
        setBreath({ y: 0, x: 0, scaleY: 1, scaleX: 1, rotate: 0 });
      }
      // Inspiração mais lenta (1.15x), expiração mais rápida (0.85x)
      const timingFactor = nextPhase === 'inhale' ? 1.15 : 0.85;
      const dur = baseSpeed * timingFactor * (0.85 + Math.random() * 0.2);
      t = setTimeout(() => { if (!cancelled) cycle(); }, dur);
    };
    cycle();
    return () => { cancelled = true; clearTimeout(t); };
  }, [state, reducedMotion]);

  // boca animada durante "speaking"
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

  // para onde os olhos olham
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
      ? { ...body.animate, y: breath.y, x: breath.x, scaleX: breath.scaleX, scaleY: breath.scaleY, rotate: breath.rotate }
      : body.animate;
  const bodyTransition = isBreathing
    ? { type: "spring", stiffness: 160, damping: 22, mass: 1.3 }
    : body.transition;
  // Brilho do halo sincronizado com a respiração: mais brilhante na inspiração
  const haloOpacity = isBreathing && state === "idle"
    ? (breathPhase === 'inhale' ? [0.35, 0.65, 0.35] : [0.25, 0.50, 0.25])
    : [0.3, 0.6, 0.3];
  // o corpo "pesa" um pouco mais que os olhos: usa uma mola mais lenta, então
  // reage um instante depois — é a diferença entre um adesivo e uma criatura
  const bodyLeanX = reducedMotion ? 0 : eyeOffset.x * 0.4;
  const bodyLeanRotate = reducedMotion ? 0 : eyeOffset.x * 0.3;
  const strokeW = size < 60 ? 5 : 3;
  const browH = size < 60 ? 6 : 4;
  const isSmall = size < 60;
  const eyeW = isSmall ? 12 : 11;
  const eyeH = isSmall ? 26 : 24;
  const eyeRx = isSmall ? 6 : 5.5;
  const glintR = isSmall ? 0 : 2.1;
  const mouthStrokeW = isSmall ? 5.5 : 5;
  const circumference = 2 * Math.PI * RING_R;
  const ringDash = `${circumference * 0.22} ${circumference}`;
  const mouthType = MOUTH_MAP[state] || "none";

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{
        width: size, height: size, flexShrink: 0,
        filter: themeMode === "light" ? "drop-shadow(0 12px 20px rgba(24,24,27,0.14))" : "drop-shadow(0 12px 22px rgba(0,0,0,0.5))",
        transition: "filter 0.3s ease",
        ...style,
      }}
    >
      <svg viewBox="0 0 200 200" width="100%" height="100%" role="img" aria-label={`Aivo — ${STATE_CAPTIONS[state] || state}`}>
        <defs>
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.card} stopOpacity="1" />
            <stop offset="100%" stopColor={colors.card} stopOpacity="0.82" />
          </linearGradient>
          <linearGradient id="bodyBrand" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={colors.accent} stopOpacity="0.18" />
            <stop offset="35%" stopColor={colors.accent} stopOpacity="0.02" />
            <stop offset="65%" stopColor="#00B8FF" stopOpacity="0" />
            <stop offset="100%" stopColor="#00B8FF" stopOpacity="0.12" />
          </linearGradient>
          <linearGradient id="bodyStroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={colors.accent} stopOpacity={themeMode === "light" ? "0.55" : "0.70"} />
            <stop offset="50%" stopColor={colors.accent} stopOpacity={themeMode === "light" ? "0.30" : "0.45"} />
            <stop offset="100%" stopColor="#00B8FF" stopOpacity={themeMode === "light" ? "0.50" : "0.65"} />
          </linearGradient>
          <linearGradient id="ringBrand" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={colors.accent} />
            <stop offset="50%" stopColor="#7C4DFF" />
            <stop offset="100%" stopColor="#00B8FF" />
          </linearGradient>
          <radialGradient id="haloGlow" cx="50%" cy="50%" r="50%">
            <stop offset="50%" stopColor={colors.accent} stopOpacity="0" />
            <stop offset="80%" stopColor={colors.accent} stopOpacity={themeMode === "light" ? "0.06" : "0.10"} />
            <stop offset="100%" stopColor={colors.accent} stopOpacity="0" />
          </radialGradient>
          <filter id="glowFilter">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      <motion.g animate={{ x: bodyLeanX, rotate: bodyLeanRotate }} transition={{ type: "spring", stiffness: 90, damping: 14 }} style={{ originX: 0.5, originY: 0.5 }}>
        <AnimatePresence>
          {(state === "idle" || state === "calm") && (
            <motion.circle
              key="halo"
              cx="100" cy="100" r="100"
              fill="url(#haloGlow)"
              initial={{ opacity: 0 }}
              animate={{ opacity: haloOpacity }}
              exit={{ opacity: 0 }}
              transition={{ duration: isBreathing && state === "idle" ? 1.8 : 3.6, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          {state === "loading" && (
            <motion.circle
              key="ring-loading" cx="100" cy="100" r={RING_R} fill="none" stroke="url(#ringBrand)"
              strokeWidth={strokeW + 1.5} strokeLinecap="round" strokeDasharray={ringDash}
              initial={{ opacity: 0 }} animate={{ opacity: 1, rotate: 360 }} exit={{ opacity: 0 }}
              transition={{ rotate: { repeat: Infinity, ease: "linear", duration: 1.1 }, opacity: { duration: 0.2 } }}
              style={{ originX: 0.5, originY: 0.5, filter: "drop-shadow(0 0 6px rgba(13,71,255,0.3))" }}
            />
          )}
          {state === "listening" && (
            <motion.circle
              key="ring-listening" cx="100" cy="100" r={RING_R} fill="none" stroke={colors.accent}
              strokeWidth={strokeW} strokeLinecap="round" strokeDasharray="5 11"
              initial={{ opacity: 0 }} animate={{ opacity: [0.25, 0.6, 0.25], scale: [1, 1.03, 1] }} exit={{ opacity: 0 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              style={{ originX: 0.5, originY: 0.5 }}
            />
          )}
        </AnimatePresence>

        {/* Energy halo ring behind body */}
        <motion.path
          d={BLOB_PATH}
          fill="none"
          stroke="url(#haloGlow)"
          strokeWidth={strokeW * 2.5 + 4}
          strokeLinejoin="round"
          animate={bodyAnimate}
          transition={bodyTransition}
          style={{
            originX: 0.5, originY: 0.5,
            filter: "url(#softGlow)",
            opacity: themeMode === "light" ? 0.5 : 0.6
          }}
        />
        {/* Body fill with brand gradient overlay */}
        <motion.path
          d={BLOB_PATH} fill="url(#bodyGrad)" stroke="none" strokeWidth="0"
          animate={bodyAnimate} transition={bodyTransition} style={{ originX: 0.5, originY: 0.5 }}
        />
        {/* Brand gradient lighting overlay */}
        <motion.path
          d={BLOB_PATH} fill="url(#bodyBrand)" stroke="none" strokeWidth="0"
          animate={bodyAnimate} transition={bodyTransition} style={{ originX: 0.5, originY: 0.5, pointerEvents: "none" }}
        />
        {/* Colored outline with brand gradient */}
        <motion.path
          d={BLOB_PATH} fill="none" stroke="url(#bodyStroke)" strokeWidth={strokeW} strokeLinejoin="round"
          animate={bodyAnimate} transition={bodyTransition} style={{ originX: 0.5, originY: 0.5, pointerEvents: "none" }}
        />

        {/* Sobrancelhas refinadas: mais finas, com fill brand em estados de conquista */}
        <motion.g animate={{ y: getBrowAnim(state, "left").y }} transition={{ duration: 0.25, ease: "easeOut" }}>
          <motion.rect
            x={BROW_L.x - 10} y={BROW_L.y - browH / 2} width="20" height={browH} rx={browH / 2}
            fill={state === "proud" || state === "celebrating" ? "url(#bodyStroke)" : colors.ink}
            animate={{ rotate: getBrowAnim(state, "left").rotate }} transition={{ duration: 0.25, ease: "easeOut" }}
            style={{ originX: 0.5, originY: 0.5 }}
          />
        </motion.g>
        <motion.g animate={{ y: getBrowAnim(state, "right").y }} transition={{ duration: 0.25, ease: "easeOut" }}>
          <motion.rect
            x={BROW_R.x - 10} y={BROW_R.y - browH / 2} width="20" height={browH} rx={browH / 2}
            fill={state === "proud" || state === "celebrating" ? "url(#bodyStroke)" : colors.ink}
            animate={{ rotate: getBrowAnim(state, "right").rotate }} transition={{ duration: 0.25, ease: "easeOut" }}
            style={{ originX: 0.5, originY: 0.5 }}
          />
        </motion.g>

        {/* Olhos em formato de pílula mais elegantes */}
        <motion.g animate={{ x: eyeOffset.x, y: eyeOffset.y }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
          <motion.g animate={{ x: jitterL.x, y: jitterL.y }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
            <motion.g animate={getEyeAnim(state, blinking, "left")} transition={{ duration: 0.18 }} style={{ originX: 0.5, originY: 0.5 }}>
              <rect x={EYE_L.x - eyeW / 2} y={EYE_L.y - eyeH / 2} width={eyeW} height={eyeH} rx={eyeRx} fill={colors.ink} />
              {!NO_GLINT.includes(state) && !isSmall && <circle cx={EYE_L.x - 2.4} cy={EYE_L.y - 6} r={glintR} fill={colors.card} opacity="0.85" />}
            </motion.g>
          </motion.g>
          <motion.g animate={{ x: jitterR.x, y: jitterR.y }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
            <motion.g animate={getEyeAnim(state, blinking, "right")} transition={{ duration: 0.18 }} style={{ originX: 0.5, originY: 0.5 }}>
              <rect x={EYE_R.x - eyeW / 2} y={EYE_R.y - eyeH / 2} width={eyeW} height={eyeH} rx={eyeRx} fill={colors.ink} />
              {!NO_GLINT.includes(state) && !isSmall && <circle cx={EYE_R.x - 2.4} cy={EYE_R.y - 6} r={glintR} fill={colors.card} opacity="0.85" />}
            </motion.g>
          </motion.g>
        </motion.g>

        <AnimatePresence>
          {(state === "success" || state === "celebrating") && (
            <motion.g key="happy-eyes" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={{ duration: 0.2 }} style={{ originX: 0.5, originY: 0.5 }}>
              <path d={`M ${EYE_L.x - 8} 97 Q ${EYE_L.x} 86 ${EYE_L.x + 8} 97`} fill="none" stroke={colors.ink} strokeWidth="6" strokeLinecap="round" />
              <path d={`M ${EYE_R.x - 8} 97 Q ${EYE_R.x} 86 ${EYE_R.x + 8} 97`} fill="none" stroke={colors.ink} strokeWidth="6" strokeLinecap="round" />
            </motion.g>
          )}
        </AnimatePresence>

        {state === "speaking" ? (
          <motion.ellipse cx="100" cy="131" rx="7" animate={{ ry: SPEAK_RY[speakFrame] }} transition={{ duration: 0.1 }} fill={colors.ink} />
        ) : (
          <AnimatePresence mode="wait">
            {mouthType !== "none" && (
              <motion.g key={mouthType} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} transition={{ duration: 0.18 }} style={{ originX: 0.5, originY: 0.5 }}>
                {mouthType === "smile" && <path d="M 84 130 Q 100 144 116 130" fill="none" stroke={colors.ink} strokeWidth={mouthStrokeW} strokeLinecap="round" />}
                {mouthType === "flat" && <path d="M 90 128 Q 100 124 110 128" fill="none" stroke={colors.ink} strokeWidth={mouthStrokeW} strokeLinecap="round" />}
                {mouthType === "soft" && <path d="M 90 130 Q 100 134 110 130" fill="none" stroke={colors.ink} strokeWidth={mouthStrokeW} strokeLinecap="round" />}
                {mouthType === "open" && <circle cx="100" cy="131" r="5.5" fill={colors.ink} />}
              </motion.g>
            )}
          </AnimatePresence>
        )}
      </motion.g>
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Página de demonstração                                             */
/* ------------------------------------------------------------------ */

function SectionLabel({ children, colors }) {
  return (
    <h2 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, letterSpacing: "0.08em", textTransform: "uppercase", color: colors.inkSoft, fontWeight: 500, margin: 0 }}>
      {children}
    </h2>
  );
}

function fieldLabelStyle(colors) {
  return { display: "block", fontSize: 12.5, color: colors.inkSoft, marginBottom: 6 };
}

function inputStyle(colors) {
  return {
    width: "100%", padding: "10px 12px", fontSize: 14, borderRadius: 10,
    border: `1px solid ${colors.line}`, background: colors.paper, color: colors.ink,
    outline: "none", fontFamily: "'Inter', sans-serif",
  };
}

function flowButtonStyle(colors, variant) {
  return {
    display: "flex", alignItems: "center", gap: 7, fontFamily: "'Inter', sans-serif", fontWeight: 500,
    fontSize: 13.5, padding: "10px 16px", borderRadius: 10, cursor: "pointer",
    border: `1px solid ${variant === "solid" ? colors.ink : colors.line}`,
    background: variant === "solid" ? colors.ink : colors.card,
    color: variant === "solid" ? colors.card : colors.ink,
  };
}

export default function AivoShowcase() {
  const [themeMode, setThemeMode] = useState("light");
  const [heroState, setHeroState] = useState("idle");
  const [lookTarget, setLookTarget] = useState(null);
  const nameRef = useRef(null);
  const passRef = useRef(null);
  const sequenceTimeouts = useRef([]);
  const colors = PALETTE[themeMode];

  const clearSequence = () => {
    sequenceTimeouts.current.forEach(clearTimeout);
    sequenceTimeouts.current = [];
  };

  useEffect(() => () => clearSequence(), []);

  // saudação ao carregar a página
  useEffect(() => {
    setHeroState("greeting");
    const t = setTimeout(() => setHeroState("idle"), 1300);
    return () => clearTimeout(t);
  }, []);

  // cochila depois de um tempo sem atividade — acorda quando você volta
  useEffect(() => {
    let inactivityTimer;
    const goSleepy = () => setHeroState((s) => (s === "idle" ? "sleepy" : s));
    const wakeUp = () => {
      clearTimeout(inactivityTimer);
      setHeroState((s) => (s === "sleepy" ? "idle" : s));
      inactivityTimer = setTimeout(goSleepy, 14000);
    };
    window.addEventListener("pointermove", wakeUp);
    window.addEventListener("keydown", wakeUp);
    window.addEventListener("click", wakeUp);
    inactivityTimer = setTimeout(goSleepy, 14000);
    return () => {
      window.removeEventListener("pointermove", wakeUp);
      window.removeEventListener("keydown", wakeUp);
      window.removeEventListener("click", wakeUp);
      clearTimeout(inactivityTimer);
    };
  }, []);

  const selectState = (s) => {
    clearSequence();
    setLookTarget(null);
    setHeroState(s);
  };

  const runSequence = (steps) => {
    clearSequence();
    setLookTarget(null);
    steps.forEach(([s, delay]) => {
      const id = setTimeout(() => setHeroState(s), delay);
      sequenceTimeouts.current.push(id);
    });
  };

  const simulateCorrect = () => runSequence([["loading", 0], ["success", 900], ["celebrating", 1600], ["happy", 2700], ["idle", 4400]]);
  const simulateIncorrect = () => runSequence([["loading", 0], ["confused", 900], ["concerned", 2000], ["idle", 3600]]);
  const simulateVoice = () => runSequence([["listening", 0], ["speaking", 1800], ["success", 4000], ["idle", 4800]]);

  const focusField = (ref, state) => {
    clearSequence();
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      setLookTarget({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    }
    setHeroState(state);
  };

  const blurField = () => {
    setLookTarget(null);
    setHeroState("idle");
  };

  return (
    <div
      className="aivo-demo-root"
      style={{
        "--accent": colors.accent, minHeight: "100vh", background: colors.paper, color: colors.ink,
        fontFamily: "'Inter', sans-serif", transition: "background 0.3s ease, color 0.3s ease",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..600&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        .aivo-demo-root :focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; border-radius: 6px; }
        .aivo-demo-root * { box-sizing: border-box; }
        .aivo-demo-root ::selection { background: var(--accent); color: #fff; }
      `}</style>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "28px 24px 64px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: "0.06em", color: colors.inkSoft, textTransform: "uppercase" }}>
            aivo · aivos · 20 estados
          </span>
          <button
            type="button" onClick={() => setThemeMode(themeMode === "light" ? "dark" : "light")} aria-label="Alternar tema"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 10, border: `1px solid ${colors.line}`, background: colors.card, color: colors.ink, cursor: "pointer" }}
          >
            {themeMode === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <Aivo size={240} state={heroState} themeMode={themeMode} lookTarget={lookTarget} />
          <div style={{ marginTop: 22, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: colors.inkSoft, display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: colors.accent, display: "inline-block" }} />
            state: {heroState} · {STATE_CAPTIONS[heroState]}
          </div>
        </div>

        <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 28, textAlign: "center", margin: "18px 0 8px", letterSpacing: "-0.01em" }}>
          Aivo
        </h1>
        <p style={{ textAlign: "center", color: colors.inkSoft, fontSize: 15, lineHeight: 1.6, maxWidth: 460, margin: "0 auto 40px" }}>
          Um colega de estudos, não um personagem infantil. Sem rosto humano literal — a presença vem de sobrancelha, olhar e postura reagindo de verdade a cada momento.
        </p>

        <div style={{ height: 1, background: colors.line, margin: "0 0 32px" }} />

        <section style={{ marginBottom: 44 }}>
          <SectionLabel colors={colors}>fluxo — responder uma questão</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
            <button type="button" onClick={simulateCorrect} style={flowButtonStyle(colors, "solid")}>
              <Check size={15} /> resposta correta
            </button>
            <button type="button" onClick={simulateIncorrect} style={flowButtonStyle(colors, "outline")}>
              <X size={15} /> resposta incorreta
            </button>
            <button type="button" onClick={simulateVoice} style={flowButtonStyle(colors, "outline")}>
              <Mic size={15} /> pergunta por voz
            </button>
          </div>
        </section>

        <section style={{ marginBottom: 44 }}>
          <SectionLabel colors={colors}>testar cada estado</SectionLabel>
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
            {STATE_GROUPS.map((group) => (
              <div key={group.label} style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: colors.inkSoft, width: 68, flexShrink: 0 }}>{group.label}</span>
                {group.states.map((s) => {
                  const active = heroState === s;
                  return (
                    <button
                      key={s} type="button" aria-pressed={active} onClick={() => selectState(s)}
                      style={{
                        fontFamily: "'JetBrains Mono', monospace", fontSize: 12, padding: "6px 12px", borderRadius: 999,
                        border: `1px solid ${active ? colors.ink : colors.line}`,
                        background: active ? colors.ink : colors.card, color: active ? colors.card : colors.ink, cursor: "pointer",
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 44 }}>
          <SectionLabel colors={colors}>exemplo em um formulário</SectionLabel>
          <div style={{ marginTop: 14, background: colors.card, border: `1px solid ${colors.line}`, borderRadius: 16, padding: 22 }}>
            <label style={fieldLabelStyle(colors)}>Nome</label>
            <input ref={nameRef} type="text" placeholder="Como podemos te chamar?" onFocus={() => focusField(nameRef, "focus")} onBlur={blurField} style={inputStyle(colors)} />
            <label style={{ ...fieldLabelStyle(colors), marginTop: 16 }}>Senha</label>
            <input ref={passRef} type="password" placeholder="••••••••" onFocus={() => focusField(passRef, "password")} onBlur={blurField} style={inputStyle(colors)} />
          </div>
        </section>

        <section>
          <SectionLabel colors={colors}>em um chat</SectionLabel>
          <div style={{ marginTop: 14, display: "flex", alignItems: "flex-end", gap: 10 }}>
            <Aivo size={34} state="idle" themeMode={themeMode} />
            <div style={{ background: colors.card, border: `1px solid ${colors.line}`, borderRadius: "4px 14px 14px 14px", padding: "10px 14px", fontSize: 14, color: colors.ink, maxWidth: 260 }}>
              Precisa de ajuda para continuar?
            </div>
          </div>
        </section>

        <p style={{ marginTop: 56, fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: colors.inkSoft, textAlign: "center", lineHeight: 1.7 }}>
          {"<Aivo size={} state={} themeMode={} lookTarget={} />"}

        </p>
      </div>
    </div>
  );
}
