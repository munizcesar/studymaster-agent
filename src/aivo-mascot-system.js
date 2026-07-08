/**
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃     AIVOS — NOVO SISTEMA DE MASCOTE AIVO                           ┃
 * ┃                                                                  ┃
 * ┃  Mascote minimalista com design orgânico, animações suaves,      ┃
 * ┃  múltiplos estados emocionais e acessibilidade WCAG.             ┃
 * ┃                                                                  ┃
 * ┃  Filosofia: Menos elementos. Mais personalidade.                ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */

(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURAÇÃO E CONSTANTES
  // ═══════════════════════════════════════════════════════════════════════════

  const SIZES = {
    xs: 24,
    sm: 32,
    md: 48,
    lg: 96,
    xl: 120,
    xxl: 180
  };

  const STATES = [
    'idle',
    'greeting',
    'thinking',
    'typing',
    'focus',
    'loading',
    'curious',
    'listening',
    'speaking',
    'happy',
    'success',
    'celebrating',
    'concerned',
    'confused',
    'error',
    'surprised',
    'sleepy',
    'calm',
    'proud',
    'password'
  ];

  const STATE_CONFIGS = {
    idle: {
      eyebrows: { left: 0, right: 0 },
      mouth: 'neutral',
      breathing: true,
      microExpressions: true,
      label: 'Aivo aguardando'
    },
    greeting: {
      eyebrows: { left: -2, right: -2 },
      mouth: 'smile',
      breathing: true,
      microExpressions: false,
      label: 'Aivo cumprimentando'
    },
    thinking: {
      eyebrows: { left: -3, right: -3 },
      mouth: 'neutral',
      breathing: true,
      microExpressions: true,
      lookUp: true,
      label: 'Aivo pensando'
    },
    typing: {
      eyebrows: { left: 0, right: 0 },
      mouth: 'neutral',
      breathing: true,
      microExpressions: true,
      label: 'Aivo digitando'
    },
    focus: {
      eyebrows: { left: -4, right: -4 },
      mouth: 'neutral',
      breathing: true,
      microExpressions: false,
      label: 'Aivo focado'
    },
    loading: {
      eyebrows: { left: 0, right: 0 },
      mouth: 'neutral',
      breathing: 'slow',
      microExpressions: false,
      label: 'Aivo carregando'
    },
    curious: {
      eyebrows: { left: -2, right: 2 },
      mouth: 'curious',
      breathing: true,
      microExpressions: true,
      label: 'Aivo curioso'
    },
    listening: {
      eyebrows: { left: -1, right: -1 },
      mouth: 'neutral',
      breathing: true,
      microExpressions: true,
      label: 'Aivo ouvindo'
    },
    speaking: {
      eyebrows: { left: 0, right: 0 },
      mouth: 'speaking',
      breathing: true,
      microExpressions: false,
      label: 'Aivo falando'
    },
    happy: {
      eyebrows: { left: -3, right: -3 },
      mouth: 'smile',
      breathing: true,
      microExpressions: true,
      label: 'Aivo feliz'
    },
    success: {
      eyebrows: { left: -2, right: -2 },
      mouth: 'smile',
      breathing: true,
      microExpressions: false,
      label: 'Aivo com sucesso'
    },
    celebrating: {
      eyebrows: { left: -4, right: -4 },
      mouth: 'big-smile',
      breathing: true,
      microExpressions: false,
      bounce: true,
      label: 'Aivo comemorando'
    },
    concerned: {
      eyebrows: { left: 2, right: 2 },
      mouth: 'concerned',
      breathing: true,
      microExpressions: true,
      label: 'Aivo preocupado'
    },
    confused: {
      eyebrows: { left: 1, right: -1 },
      mouth: 'confused',
      breathing: true,
      microExpressions: true,
      label: 'Aivo confuso'
    },
    error: {
      eyebrows: { left: 3, right: 3 },
      mouth: 'concerned',
      breathing: true,
      microExpressions: false,
      label: 'Aivo em erro'
    },
    surprised: {
      eyebrows: { left: -5, right: -5 },
      mouth: 'surprised',
      breathing: true,
      microExpressions: false,
      label: 'Aivo surpreso'
    },
    sleepy: {
      eyebrows: { left: 0, right: 0 },
      mouth: 'neutral',
      breathing: 'very-slow',
      microExpressions: false,
      eyes: 'sleepy',
      label: 'Aivo dormindo'
    },
    calm: {
      eyebrows: { left: -1, right: -1 },
      mouth: 'smile',
      breathing: 'slow',
      microExpressions: false,
      label: 'Aivo calmo'
    },
    proud: {
      eyebrows: { left: -3, right: -3 },
      mouth: 'smile',
      breathing: true,
      microExpressions: true,
      label: 'Aivo orgulhoso'
    },
    password: {
      eyebrows: { left: 2, right: 2 },
      mouth: 'neutral',
      breathing: true,
      microExpressions: false,
      eyes: 'hidden',
      label: 'Aivo protegendo senha'
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITÁRIOS
  // ═══════════════════════════════════════════════════════════════════════════

  function generateId() {
    return 'aivo-' + Math.random().toString(36).slice(2, 9);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONSTRUTOR SVG
  // ═══════════════════════════════════════════════════════════════════════════

  function createAivoSVG(size = 'md') {
    const sizeNum = typeof size === 'string' ? SIZES[size] : size;
    
    const id = generateId();
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    
    svg.setAttribute('viewBox', '0 0 120 140');
    svg.setAttribute('width', sizeNum);
    svg.setAttribute('height', (sizeNum * 140) / 120);
    svg.setAttribute('class', 'aivo-mascot');
    svg.setAttribute('data-aivo-id', id);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Aivo, mascote da AIVOS');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    
    // Defs com gradientes e filtros
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = createDefs(id);
    svg.appendChild(defs);
    
    // Corpo e elementos
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'aivo-body-group');
    
    // Corpo orgânico (gota arredondada)
    const body = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    body.setAttribute('class', 'aivo-body');
    body.setAttribute('d', 'M60 20 C85 20 100 35 100 60 C100 95 80 120 60 120 C40 120 20 95 20 60 C20 35 35 20 60 20 Z');
    body.setAttribute('fill', 'url(#' + id + '-body-gradient)');
    g.appendChild(body);
    
    // Olho esquerdo
    const eyeLeftGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    eyeLeftGroup.setAttribute('class', 'aivo-eye aivo-eye-left');
    eyeLeftGroup.innerHTML = createEye(id, 'left');
    g.appendChild(eyeLeftGroup);
    
    // Olho direito
    const eyeRightGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    eyeRightGroup.setAttribute('class', 'aivo-eye aivo-eye-right');
    eyeRightGroup.innerHTML = createEye(id, 'right');
    g.appendChild(eyeRightGroup);
    
    // Sobrancelhas
    const eyebrowLeftGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    eyebrowLeftGroup.setAttribute('class', 'aivo-eyebrow aivo-eyebrow-left');
    eyebrowLeftGroup.innerHTML = createEyebrow('left');
    g.appendChild(eyebrowLeftGroup);
    
    const eyebrowRightGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    eyebrowRightGroup.setAttribute('class', 'aivo-eyebrow aivo-eyebrow-right');
    eyebrowRightGroup.innerHTML = createEyebrow('right');
    g.appendChild(eyebrowRightGroup);
    
    // Boca
    const mouthGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    mouthGroup.setAttribute('class', 'aivo-mouth');
    mouthGroup.innerHTML = createMouth(id, 'neutral');
    g.appendChild(mouthGroup);
    
    svg.appendChild(g);
    
    return svg;
  }

  function createDefs(id) {
    return `
      <linearGradient id="${id}-body-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="currentColor" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="currentColor" stop-opacity="0.7"/>
      </linearGradient>
      <linearGradient id="${id}-eye-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#6bd4ff"/>
        <stop offset="100%" stop-color="#0047b3"/>
      </linearGradient>
      <filter id="${id}-glow">
        <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    `;
  }

  function createEye(id, side) {
    const cx = side === 'left' ? 40 : 80;
    return `
      <circle class="aivo-eye-white" cx="${cx}" cy="50" r="8" fill="white" opacity="0.95"/>
      <circle class="aivo-eye-iris" cx="${cx}" cy="50" r="5" fill="url(#${id}-eye-gradient)"/>
      <circle class="aivo-eye-pupil" cx="${cx}" cy="50" r="3" fill="#000"/>
      <circle class="aivo-eye-glint" cx="${cx - 1}" cy="48" r="1.5" fill="white" opacity="0.8"/>
    `;
  }

  function createEyebrow(side) {
    const x = side === 'left' ? 35 : 75;
    return `
      <path class="aivo-eyebrow-line" d="M${x} 35 Q${x + 5} 32 ${x + 10} 35" 
            stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
    `;
  }

  function createMouth(id, type = 'neutral') {
    const mouthShapes = {
      neutral: `<path d="M45 75 Q60 78 75 75" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>`,
      smile: `<path d="M45 75 Q60 82 75 75" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>`,
      'big-smile': `<path d="M42 72 Q60 85 78 72" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>`,
      concerned: `<path d="M45 80 Q60 75 75 80" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>`,
      confused: `<path d="M48 77 Q60 73 72 77" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>`,
      curious: `<path d="M50 75 Q60 80 70 75" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>`,
      surprised: `<circle cx="60" cy="77" r="3" fill="currentColor"/>`,
      speaking: `<ellipse cx="60" cy="77" rx="3" ry="4" fill="currentColor"/>`
    };
    return mouthShapes[type] || mouthShapes.neutral;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CLASSE AIVO
  // ═══════════════════════════════════════════════════════════════════════════

  class Aivo {
    constructor(container, options = {}) {
      this.container = typeof container === 'string' 
        ? document.querySelector(container) 
        : container;
      
      if (!this.container) {
        console.error('[Aivo] Container not found');
        return;
      }

      this.options = {
        size: options.size || 'md',
        state: options.state || 'idle',
        theme: options.theme || 'auto',
        trackPointer: options.trackPointer !== false,
        ...options
      };

      this.currentState = this.options.state;
      this.isAnimating = false;
      this.animationFrameId = null;
      this.lastPointerPos = { x: 0, y: 0 };
      this.eyePos = { left: { x: 0, y: 0 }, right: { x: 0, y: 0 } };
      this.animationIntervals = [];

      this.init();
    }

    init() {
      // Criar SVG
      this.svg = createAivoSVG(this.options.size);
      this.container.innerHTML = '';
      this.container.appendChild(this.svg);

      // Aplicar tema
      this.applyTheme();

      // Listeners
      if (this.options.trackPointer) {
        document.addEventListener('mousemove', (e) => this.onPointerMove(e));
        document.addEventListener('touchmove', (e) => this.onPointerMove(e.touches[0]));
      }

      // Iniciar animações
      this.startAnimations();

      // Definir estado inicial
      this.setState(this.currentState);
    }

    applyTheme() {
      const isDark = this.options.theme === 'dark' || 
        (this.options.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      const color = isDark ? '#ffffff' : '#000000';
      this.svg.style.color = color;
    }

    setState(newState) {
      if (!STATES.includes(newState)) {
        console.warn(`[Aivo] Unknown state: ${newState}`);
        return;
      }

      this.currentState = newState;
      const config = STATE_CONFIGS[newState];

      if (!config) return;

      // Atualizar sobrancelhas
      this.updateEyebrows(config.eyebrows);

      // Atualizar boca
      this.updateMouth(config.mouth);

      // Atualizar respiração
      this.updateBreathing(config.breathing);

      // Atualizar aria-label
      this.svg.setAttribute('aria-label', config.label);
    }

    updateEyebrows(positions) {
      const leftBrow = this.svg.querySelector('.aivo-eyebrow-left');
      const rightBrow = this.svg.querySelector('.aivo-eyebrow-right');

      if (leftBrow) {
        leftBrow.style.transform = `translateY(${positions.left}px)`;
      }
      if (rightBrow) {
        rightBrow.style.transform = `translateY(${positions.right}px)`;
      }
    }

    updateMouth(type) {
      const mouth = this.svg.querySelector('.aivo-mouth');
      if (mouth) {
        mouth.innerHTML = createMouth(this.svg.getAttribute('data-aivo-id'), type);
      }
    }

    updateBreathing(breathingType) {
      const body = this.svg.querySelector('.aivo-body');
      if (!body) return;

      // Remover animações anteriores
      body.style.animation = 'none';

      const breathingDurations = {
        'very-slow': '4s',
        'slow': '3s',
        true: '2s'
      };

      const duration = breathingDurations[breathingType] || '2s';
      
      if (breathingType) {
        body.style.animation = `aivo-breathing ${duration} ease-in-out infinite`;
      }
    }

    onPointerMove(e) {
      if (!this.options.trackPointer) return;

      const rect = this.svg.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      this.lastPointerPos = { x, y };
      this.updateEyeGaze();
    }

    updateEyeGaze() {
      const eyes = this.svg.querySelectorAll('.aivo-eye');
      eyes.forEach((eye, index) => {
        const eyeRect = eye.getBoundingClientRect();
        const eyeCenterX = eyeRect.left + eyeRect.width / 2;
        const eyeCenterY = eyeRect.top + eyeRect.height / 2;

        const angle = Math.atan2(
          this.lastPointerPos.y - eyeCenterY,
          this.lastPointerPos.x - eyeCenterX
        );

        const distance = 2;
        const pupilX = Math.cos(angle) * distance;
        const pupilY = Math.sin(angle) * distance;

        const pupil = eye.querySelector('.aivo-eye-pupil');
        if (pupil) {
          const baseCx = index === 0 ? 40 : 80;
          pupil.setAttribute('cx', baseCx + pupilX);
          pupil.setAttribute('cy', 50 + pupilY);
        }
      });
    }

    startAnimations() {
      // Micro-expressões aleatórias
      this.startMicroExpressions();

      // Piscadas
      this.startBlinking();

      // Movimento aleatório dos olhos
      this.startRandomGaze();
    }

    startMicroExpressions() {
      const interval = setInterval(() => {
        if (this.currentState === 'idle' || this.currentState === 'calm') {
          const microExpressions = ['curious', 'thinking'];
          const randomState = microExpressions[Math.floor(Math.random() * microExpressions.length)];
          
          this.setState(randomState);
          setTimeout(() => {
            this.setState(this.options.state || 'idle');
          }, 800);
        }
      }, 5000);
      this.animationIntervals.push(interval);
    }

    startBlinking() {
      const interval = setInterval(() => {
        const eyes = this.svg.querySelectorAll('.aivo-eye-white');
        eyes.forEach(eye => {
          eye.style.animation = 'aivo-blink 0.3s ease-in-out';
          setTimeout(() => {
            eye.style.animation = '';
          }, 300);
        });
      }, 3000 + Math.random() * 2000);
      this.animationIntervals.push(interval);
    }

    startRandomGaze() {
      const interval = setInterval(() => {
        if (!this.options.trackPointer) return;

        const randomX = Math.random() * window.innerWidth;
        const randomY = Math.random() * window.innerHeight;

        this.lastPointerPos = { x: randomX, y: randomY };
        this.updateEyeGaze();
      }, 4000 + Math.random() * 3000);
      this.animationIntervals.push(interval);
    }

    destroy() {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
      this.animationIntervals.forEach(interval => clearInterval(interval));
      this.container.innerHTML = '';
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPORT
  // ═══════════════════════════════════════════════════════════════════════════

  window.Aivo = Aivo;
  window.AivoStates = STATES;
  window.AivoSizes = Object.keys(SIZES);

})();
