/**
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃     STUDYMASTER — AIVOS CHARACTER SYSTEM                         ┃
 * ┃                                                                  ┃
 * ┃  Sistema único do mascote AIVOS com estados, poses, acessórios   ┃
 * ┃  e API compatível com os módulos legados do projeto.             ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */

(function() {
  'use strict';

  var AVATAR_SIZES = ['sm', 'md', 'lg', 'xl'];
  var AVATAR_STATES = [
    'idle',
    'thinking',
    'explaining',
    'motivating',
    'celebrating',
    'analyzing',
    'waiting',
    'pointing',
    'happy',
    'error',
    'attention'
  ];

  var STATE_ALIASES = {
    teaching: 'explaining',
    processing: 'analyzing',
    success: 'celebrating',
    focus: 'thinking',
    warning: 'attention'
  };

  var STATE_LABELS = {
    idle: 'AIVOS aguardando',
    thinking: 'AIVOS pensando',
    explaining: 'AIVOS explicando',
    motivating: 'AIVOS motivando',
    celebrating: 'AIVOS comemorando',
    analyzing: 'AIVOS analisando',
    waiting: 'AIVOS aguardando',
    pointing: 'AIVOS apontando',
    happy: 'AIVOS feliz',
    error: 'AIVOS em erro',
    attention: 'AIVOS em atenção'
  };

  var STATE_DEFAULT_ACCESSORIES = {
    idle: 'none',
    thinking: 'none',
    explaining: 'book',
    motivating: 'none',
    celebrating: 'none',
    analyzing: 'chart',
    waiting: 'tablet',
    pointing: 'pointer',
    happy: 'none',
    error: 'none',
    attention: 'none'
  };

  var ACCESSORIES = ['none', 'book', 'laptop', 'tablet', 'chart', 'pointer'];
  var BUBBLE_TYPES = ['info', 'success', 'warning', 'error'];
  var AVATAR_UID = 0;

  function getElement(el) {
    if (typeof el === 'string') return document.querySelector(el);
    if (el && el.nodeType === 1) return el;
    return null;
  }

  function assertIn(value, validSet, label) {
    if (validSet.indexOf(value) === -1) {
      console.warn('[AIVOS Char] ' + label + ' inválido: "' + value + '". Usando fallback.');
      return false;
    }
    return true;
  }

  function normalizeState(state) {
    var next = state || 'idle';
    if (STATE_ALIASES[next]) next = STATE_ALIASES[next];
    if (!assertIn(next, AVATAR_STATES, 'Estado')) return 'idle';
    return next;
  }

  function normalizePose(pose, state) {
    var next = pose || state || 'idle';
    if (STATE_ALIASES[next]) next = STATE_ALIASES[next];
    if (!assertIn(next, AVATAR_STATES, 'Pose')) return state || 'idle';
    return next;
  }

  function normalizeAccessory(accessory, state) {
    var next = accessory;
    if (!next) next = STATE_DEFAULT_ACCESSORIES[state] || 'none';
    if (!assertIn(next, ACCESSORIES, 'Acessório')) return 'none';
    return next;
  }

  function normalizeOptions(opts) {
    opts = opts || {};
    var state = normalizeState(opts.state);
    var pose = normalizePose(opts.pose, state);
    return {
      size: assertIn(opts.size || 'md', AVATAR_SIZES, 'Tamanho') ? (opts.size || 'md') : 'md',
      state: state,
      pose: pose,
      accessory: normalizeAccessory(opts.accessory, state),
      trackPointer: !!opts.trackPointer
    };
  }

  function avatarUid() {
    AVATAR_UID += 1;
    return 'aivos-avatar-' + AVATAR_UID + '-' + Math.random().toString(36).slice(2, 7);
  }

  function esc(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /* ══════════════════════════════════════════════════════════════════════════
     SVG BUILDERS — Modular construction of the AIVOS robot
     ══════════════════════════════════════════════════════════════════════════ */

  function buildDefs(ids) {
    return '' +
      '<radialGradient id="' + ids.orb + '" cx="50%" cy="28%" r="64%">' +
        '<stop offset="0%" stop-color="#4d88ff" stop-opacity=".38"/>' +
        '<stop offset="32%" stop-color="#0d47ff" stop-opacity=".16"/>' +
        '<stop offset="100%" stop-color="#050816" stop-opacity="0"/>' +
      '</radialGradient>' +
      '<radialGradient id="' + ids.antenna + '" cx="50%" cy="50%" r="50%">' +
        '<stop offset="0%" stop-color="#7bd0ff" stop-opacity="1"/>' +
        '<stop offset="40%" stop-color="#0ea5e9" stop-opacity=".8"/>' +
        '<stop offset="100%" stop-color="#0369a1" stop-opacity="0"/>' +
      '</radialGradient>' +
      '<radialGradient id="' + ids.glow + '" cx="50%" cy="50%" r="50%">' +
        '<stop offset="0%" stop-color="#0ea5e9" stop-opacity=".5"/>' +
        '<stop offset="100%" stop-color="#0ea5e9" stop-opacity="0"/>' +
      '</radialGradient>' +
      '<linearGradient id="' + ids.shell + '" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0%" stop-color="#fbfdff"/>' +
        '<stop offset="48%" stop-color="#dfe8f6"/>' +
        '<stop offset="100%" stop-color="#a9b8d9"/>' +
      '</linearGradient>' +
      '<linearGradient id="' + ids.shell2 + '" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0%" stop-color="#ffffff" stop-opacity=".95"/>' +
        '<stop offset="100%" stop-color="#cfd8ea" stop-opacity=".82"/>' +
      '</linearGradient>' +
      '<linearGradient id="' + ids.visor + '" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0%" stop-color="#0a1020"/>' +
        '<stop offset="100%" stop-color="#02050d"/>' +
      '</linearGradient>' +
      '<linearGradient id="' + ids.visor2 + '" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0%" stop-color="rgba(255,255,255,.45)"/>' +
        '<stop offset="55%" stop-color="rgba(255,255,255,.12)"/>' +
        '<stop offset="100%" stop-color="rgba(255,255,255,0)"/>' +
      '</linearGradient>' +
      // Brushed metal gradient for body
      '<linearGradient id="' + ids.body + '" x1="0" y1="0" x2="0.06" y2="1">' +
        '<stop offset="0%" stop-color="#162044"/>' +
        '<stop offset="15%" stop-color="#0d1630"/>' +
        '<stop offset="30%" stop-color="#141d3a"/>' +
        '<stop offset="48%" stop-color="#11182f"/>' +
        '<stop offset="65%" stop-color="#0d1630"/>' +
        '<stop offset="82%" stop-color="#091024"/>' +
        '<stop offset="100%" stop-color="#050914"/>' +
      '</linearGradient>' +
      '<linearGradient id="' + ids.panel + '" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0%" stop-color="rgba(255,255,255,.24)"/>' +
        '<stop offset="100%" stop-color="rgba(255,255,255,.06)"/>' +
      '</linearGradient>' +
      '<linearGradient id="' + ids.metal + '" x1="0" y1="0" x2="0.03" y2="1">' +
        '<stop offset="0%" stop-color="rgba(255,255,255,.40)"/>' +
        '<stop offset="25%" stop-color="rgba(255,255,255,.08)"/>' +
        '<stop offset="50%" stop-color="rgba(255,255,255,.28)"/>' +
        '<stop offset="75%" stop-color="rgba(255,255,255,.04)"/>' +
        '<stop offset="100%" stop-color="rgba(255,255,255,.18)"/>' +
      '</linearGradient>' +
      '<radialGradient id="' + ids.eyeIris + '" cx="40%" cy="35%" r="60%">' +
        '<stop offset="0%" stop-color="#6bd4ff"/>' +
        '<stop offset="45%" stop-color="#1a8cff"/>' +
        '<stop offset="100%" stop-color="#0047b3"/>' +
      '</radialGradient>' +
      '<linearGradient id="' + ids.accent + '" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0%" stop-color="#7c4dff"/>' +
        '<stop offset="45%" stop-color="#3f77ff"/>' +
        '<stop offset="100%" stop-color="#00c8ff"/>' +
      '</linearGradient>' +
      '<linearGradient id="' + ids.brand + '" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0%" stop-color="#0d47ff"/>' +
        '<stop offset="50%" stop-color="#3f77ff"/>' +
        '<stop offset="100%" stop-color="#00c8ff"/>' +
      '</linearGradient>' +
      '<filter id="' + ids.book + '" x="-30%" y="-30%" width="160%" height="160%">' +
        '<feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#0d47ff" flood-opacity=".28"/>' +
      '</filter>';
  }

  function buildScene(ids) {
    return '' +
      '<ellipse cx="120" cy="120" rx="100" ry="100" fill="url(#' + ids.orb + ')"/>' +
      '<ellipse cx="120" cy="192" rx="80" ry="16" fill="#02040a" opacity=".42"/>';
  }

  function buildShadow() {
    return '<ellipse cx="120" cy="182" rx="52" ry="14" fill="#000" opacity=".24"/>';
  }

  function buildEyes(ids) {
    return '' +
      '<!-- Left Eye -->' +
      '<ellipse class="aivos-avatar__eye-socket aivos-avatar__eye-socket--left" cx="110" cy="82" rx="12" ry="13" fill="#050a14" stroke="rgba(255,255,255,.08)" stroke-width="1"/>' +
      '<ellipse class="aivos-avatar__eye-iris aivos-avatar__eye-iris--left" cx="110" cy="82" rx="9" ry="10" fill="url(#' + ids.eyeIris + ')"/>' +
      '<ellipse class="aivos-avatar__eye-pupil aivos-avatar__eye-pupil--left" cx="111" cy="81" rx="4" ry="5" fill="#02050d"/>' +
      '<ellipse class="aivos-avatar__eye-glint aivos-avatar__eye-glint--left" cx="107" cy="78" rx="2.5" ry="2" fill="#ffffff" opacity=".85"/>' +
      '<!-- Right Eye -->' +
      '<ellipse class="aivos-avatar__eye-socket aivos-avatar__eye-socket--right" cx="146" cy="82" rx="12" ry="13" fill="#050a14" stroke="rgba(255,255,255,.08)" stroke-width="1"/>' +
      '<ellipse class="aivos-avatar__eye-iris aivos-avatar__eye-iris--right" cx="146" cy="82" rx="9" ry="10" fill="url(#' + ids.eyeIris + ')"/>' +
      '<ellipse class="aivos-avatar__eye-pupil aivos-avatar__eye-pupil--right" cx="147" cy="81" rx="4" ry="5" fill="#02050d"/>' +
      '<ellipse class="aivos-avatar__eye-glint aivos-avatar__eye-glint--right" cx="143" cy="78" rx="2.5" ry="2" fill="#ffffff" opacity=".85"/>';
  }

  function buildAntenna(ids) {
    return '' +
      '<!-- Antenna -->' +
      '<g class="aivos-avatar__antenna">' +
        '<line x1="120" y1="38" x2="120" y2="20" stroke="rgba(255,255,255,.35)" stroke-width="2.5" stroke-linecap="round"/>' +
        '<line x1="120" y1="20" x2="120" y2="14" stroke="#0ea5e9" stroke-width="1.5" stroke-linecap="round" opacity=".8"/>' +
        '<circle cx="120" cy="14" r="5" fill="url(#' + ids.antenna + ')"/>' +
        '<circle cx="120" cy="14" r="12" fill="url(#' + ids.glow + ')" opacity=".6"/>' +
      '</g>';
  }

  function buildNeck(ids) {
    return '' +
      '<!-- Neck -->' +
      '<g class="aivos-avatar__neck">' +
        '<rect x="108" y="130" width="24" height="8" rx="4" fill="#0d1630" stroke="rgba(255,255,255,.08)" stroke-width="1.5"/>' +
        '<rect x="113" y="132" width="14" height="2" rx="1" fill="url(#' + ids.accent + ')" opacity=".4"/>' +
        '<rect x="113" y="135" width="14" height="2" rx="1" fill="url(#' + ids.accent + ')" opacity=".25"/>' +
      '</g>';
  }

  function buildHead(ids) {
    return '' +
      '<!-- Head Shell -->' +
      '<ellipse cx="120" cy="84" rx="58" ry="52" fill="url(#' + ids.shell + ')"/>' +
      '<ellipse cx="120" cy="87" rx="54" ry="48" fill="url(#' + ids.shell2 + ')"/>' +
      '<!-- Head ring detail (premium) -->' +
      '<path d="M66 84 c0-30 108-30 108 0" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="1.5"/>' +
      '<!-- Visor outer frame -->' +
      '<path d="M92 63c0-10 8-18 18-18h20c10 0 18 8 18 18v33c0 8-6 14-14 14H106c-8 0-14-6-14-14V63z" fill="url(#' + ids.visor + ')" stroke="rgba(255,255,255,.12)" stroke-width="1.5"/>' +
      '<!-- Visor inner screen -->' +
      '<path d="M96 65c0-8 6-14 14-14h20c8 0 14 6 14 14v30c0 5-4 9-9 9h-30c-5 0-9-4-9-9V65z" fill="#050914" opacity=".92"/>' +
      '<!-- Visor reflection arc -->' +
      '<path d="M100 56c10-7 30-7 40 0" fill="none" stroke="url(#' + ids.visor2 + ')" stroke-width="8" stroke-linecap="round" opacity=".52"/>' +
      '<!-- Eyes group -->' +
      '<g class="aivos-avatar__eyes">' + buildEyes(ids) + '</g>' +
      '<!-- Scan line -->' +
      '<path class="aivos-avatar__scan" d="M99 63h42" stroke="rgba(120,200,255,.55)" stroke-width="2" stroke-linecap="round" opacity=".15"/>' +
      '<!-- Visor bottom edge glow -->' +
      '<path d="M98 100c8 7 36 7 44 0" fill="none" stroke="rgba(77,136,255,.35)" stroke-width="2.2" stroke-linecap="round"/>' +
      buildAntenna(ids) +
      buildNeck(ids);
  }

  function buildDiscs(ids) {
    return '' +
      '<!-- Left ear disc -->' +
      '<g class="aivos-avatar__disc aivos-avatar__disc--left">' +
        '<circle cx="70" cy="83" r="18" fill="url(#' + ids.body + ')" stroke="rgba(255,255,255,.12)" stroke-width="1.5"/>' +
        '<circle cx="70" cy="83" r="13" fill="url(#' + ids.panel + ')" opacity=".95"/>' +
        '<path d="M65 83l6-8 8 8-8 8z" fill="url(#' + ids.brand + ')" opacity=".9"/>' +
      '</g>' +
      '<!-- Right ear disc -->' +
      '<g class="aivos-avatar__disc aivos-avatar__disc--right">' +
        '<circle cx="170" cy="83" r="18" fill="url(#' + ids.body + ')" stroke="rgba(255,255,255,.12)" stroke-width="1.5"/>' +
        '<circle cx="170" cy="83" r="13" fill="url(#' + ids.panel + ')" opacity=".95"/>' +
        '<path d="M165 83l6-8 8 8-8 8z" fill="url(#' + ids.brand + ')" opacity=".9"/>' +
      '</g>' +
      '<!-- Crown / top accent -->' +
      '<path d="M105 42c7-6 23-9 35-4" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="7" stroke-linecap="round" opacity=".45"/>' +
      '<path d="M106 41c6-4 21-6 31-2" fill="none" stroke="rgba(255,255,255,.88)" stroke-width="3" stroke-linecap="round" opacity=".18"/>';
  }

  function buildBody(ids) {
    return '' +
      '<!-- Main body -->' +
      '<path d="M73 142c0-18 15-33 33-33h28c18 0 33 15 33 33v36c0 13-11 24-24 24H97c-13 0-24-11-24-24v-36z" fill="url(#' + ids.body + ')"/>' +
      '<!-- Body chrome highlight (brushed metal overlay) -->' +
      '<path d="M73 142c0-18 15-33 33-33h28c18 0 33 15 33 33v36c0 13-11 24-24 24H97c-13 0-24-11-24-24v-36z" fill="url(#' + ids.metal + ')" opacity=".34"/>' +
      '<!-- Body inner panel -->' +
      '<path d="M82 142c0-12 10-22 22-22h32c12 0 22 10 22 22v36c0 8-6 14-14 14H96c-8 0-14-6-14-14v-36z" fill="url(#' + ids.panel + ')" opacity=".95"/>' +
      '<!-- Chest accent line -->' +
      '<path d="M108 116l12 18 12-18" fill="none" stroke="url(#' + ids.accent + ')" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<!-- Center line -->' +
      '<path d="M120 127v46" stroke="rgba(255,255,255,.16)" stroke-width="2" stroke-linecap="round"/>' +
      '<!-- Chest brand bar -->' +
      '<path d="M112 161h16" stroke="url(#' + ids.accent + ')" stroke-width="3" stroke-linecap="round"/>' +
      '<!-- Chest horizontal detail -->' +
      '<path d="M111 135c3-2 15-2 18 0" stroke="rgba(255,255,255,.22)" stroke-width="2" stroke-linecap="round"/>' +
      '<!-- AIVOS brand chevron (center) -->' +
      '<path d="M104 166l16-11 16 11-16 6z" fill="url(#' + ids.brand + ')" opacity=".96"/>' +
      '<path d="M111 164l9-6 9 6-9 3z" fill="#fff" opacity=".18"/>' +
      '<!-- Body Tech Details -->' +
      '<g class="aivos-avatar__body-tech">' +
        '<circle cx="96" cy="168" r="2" fill="#22c55e" opacity=".7"/>' +
        '<circle cx="96" cy="175" r="2" fill="#3b82f6" opacity=".5"/>' +
        '<path d="M98 162l2-1" stroke="rgba(255,255,255,.15)" stroke-width="1.5" stroke-linecap="round"/>' +
      '</g>';
  }

  function buildArmLeft(ids) {
    return '' +
      '<!-- Left Arm -->' +
      '<g class="aivos-avatar__arm aivos-avatar__arm--left">' +
        '<path d="M74 147c-8 10-14 22-16 35-1 6 1 10 4 12 4 3 11 2 16-5 6-8 10-18 15-28" fill="url(#' + ids.body + ')" stroke="rgba(255,255,255,.12)" stroke-width="1.5" stroke-linecap="round"/>' +
        '<path d="M74 147c-8 10-14 22-16 35-1 6 1 10 4 12 4 3 11 2 16-5 6-8 10-18 15-28" fill="url(#' + ids.metal + ')" opacity=".3"/>' +
        '<path d="M76 173c-3 8-3 15 0 20 4 6 11 7 16 4 5-3 6-9 4-14" fill="url(#' + ids.panel + ')" opacity=".9"/>' +
        '<!-- Left Hand (3 fingers visible) -->' +
        '<g class="aivos-avatar__hand aivos-avatar__hand--left">' +
          '<path d="M68 186c3-6 10-8 16-5 4 2 7 6 8 10 1 4-1 9-5 11-5 3-12 2-16-2-4-4-5-10-3-14z" fill="#dbe8f8"/>' +
          '<path d="M73 184c3 0 6 1 8 3" stroke="rgba(13,71,255,.28)" stroke-width="2" stroke-linecap="round"/>' +
          '<path d="M78 190c-2 0-4-1-5-3" stroke="rgba(13,71,255,.22)" stroke-width="1.5" stroke-linecap="round"/>' +
        '</g>' +
      '</g>';
  }

  function buildArmRight(ids) {
    return '' +
      '<!-- Right Arm -->' +
      '<g class="aivos-avatar__arm aivos-avatar__arm--right">' +
        '<path d="M166 146c8 9 15 21 18 34 2 6 0 10-3 13-4 3-11 3-17-3-7-7-12-16-17-26" fill="url(#' + ids.body + ')" stroke="rgba(255,255,255,.12)" stroke-width="1.5" stroke-linecap="round"/>' +
        '<path d="M166 146c8 9 15 21 18 34 2 6 0 10-3 13-4 3-11 3-17-3-7-7-12-16-17-26" fill="url(#' + ids.metal + ')" opacity=".3"/>' +
        '<path d="M164 170c4 7 6 13 4 20-2 7-8 11-14 9-5-1-8-7-7-13" fill="url(#' + ids.panel + ')" opacity=".9"/>' +
        '<!-- Right Hand (3 fingers + thumb) -->' +
        '<g class="aivos-avatar__hand aivos-avatar__hand--right">' +
          '<path d="M156 183c4-5 13-6 19-2 4 3 7 7 6 11-1 4-5 8-10 9-6 1-12-1-15-6-3-4-3-9 0-12z" fill="#dbe8f8"/>' +
          '<path d="M162 183c3 1 6 2 8 5" stroke="rgba(13,71,255,.28)" stroke-width="2" stroke-linecap="round"/>' +
          '<path d="M168 191c-2-1-3-3-3-5" stroke="rgba(13,71,255,.22)" stroke-width="1.5" stroke-linecap="round"/>' +
          '<path d="M168 191l12-6" stroke="rgba(13,71,255,.28)" stroke-width="2" stroke-linecap="round"/>' +
        '</g>' +
      '</g>';
  }

  function buildAccessory(accessory, ids) {
    switch (accessory) {
      case 'book':
        return '' +
          '<g class="aivos-avatar__accessory aivos-avatar__accessory--book">' +
            '<path d="M58 152c0-5 4-9 9-9h34c5 0 9 4 9 9v30c0 5-4 9-9 9H67c-5 0-9-4-9-9v-30z" fill="url(#' + ids.book + ')"/>' +
            '<path d="M79 144v49" stroke="rgba(255,255,255,.55)" stroke-width="1.5" stroke-linecap="round"/>' +
            '<path d="M66 151c9-3 19-3 28 0" stroke="rgba(255,255,255,.25)" stroke-width="2" stroke-linecap="round"/>' +
            '<path d="M66 174c9-3 19-3 28 0" stroke="rgba(255,255,255,.2)" stroke-width="2" stroke-linecap="round"/>' +
          '</g>';
      case 'laptop':
        return '' +
          '<g class="aivos-avatar__accessory aivos-avatar__accessory--laptop">' +
            '<rect x="63" y="145" width="70" height="42" rx="6" fill="url(#' + ids.panel + ')" stroke="rgba(255,255,255,.18)" stroke-width="1.5"/>' +
            '<rect x="68" y="151" width="60" height="28" rx="4" fill="#0b1224" stroke="rgba(77,136,255,.35)" stroke-width="1"/>' +
            '<path d="M58 187h90l-5 9H63z" fill="rgba(255,255,255,.14)"/>' +
            '<path d="M86 158l12-3 12 3-12 12z" fill="url(#' + ids.brand + ')" opacity=".9"/>' +
          '</g>';
      case 'tablet':
        return '' +
          '<g class="aivos-avatar__accessory aivos-avatar__accessory--tablet">' +
            '<rect x="148" y="120" width="44" height="58" rx="8" fill="url(#' + ids.panel + ')" stroke="rgba(255,255,255,.18)" stroke-width="1.5"/>' +
            '<rect x="153" y="126" width="34" height="44" rx="5" fill="#081120" stroke="rgba(77,136,255,.32)" stroke-width="1"/>' +
            '<circle cx="170" cy="177" r="2" fill="rgba(255,255,255,.55)"/>' +
            '<path d="M164 138l8-12 8 12-8 4z" fill="url(#' + ids.brand + ')" opacity=".9"/>' +
          '</g>';
      case 'chart':
        return '' +
          '<g class="aivos-avatar__accessory aivos-avatar__accessory--chart">' +
            '<rect x="147" y="74" width="55" height="62" rx="10" fill="url(#' + ids.panel + ')" stroke="rgba(255,255,255,.18)" stroke-width="1.5"/>' +
            '<path d="M158 120l10-15 8 7 11-19 8 6" fill="none" stroke="url(#' + ids.brand + ')" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<circle cx="160" cy="114" r="2" fill="#74c6ff"/>' +
            '<circle cx="170" cy="99" r="2" fill="#8b5cf6"/>' +
            '<circle cx="178" cy="106" r="2" fill="#4ade80"/>' +
          '</g>';
      case 'pointer':
        return '' +
          '<g class="aivos-avatar__accessory aivos-avatar__accessory--pointer">' +
            '<path d="M148 88l34-22 10 11-22 35" fill="url(#' + ids.accent + ')" opacity=".95"/>' +
            '<path d="M149 88l31-20" stroke="rgba(255,255,255,.55)" stroke-width="3" stroke-linecap="round"/>' +
            '<circle cx="186" cy="66" r="7" fill="#fff2cc" opacity=".9"/>' +
          '</g>';
      default:
        return '';
    }
  }

  function buildAvatarMarkup(opts) {
    var o = normalizeOptions(opts);
    var ids = {
      orb: avatarUid() + '-orb',
      antenna: avatarUid() + '-antenna',
      glow: avatarUid() + '-glow',
      shell: avatarUid() + '-shell',
      shell2: avatarUid() + '-shell2',
      visor: avatarUid() + '-visor',
      visor2: avatarUid() + '-visor2',
      body: avatarUid() + '-body',
      metal: avatarUid() + '-metal',
      panel: avatarUid() + '-panel',
      accent: avatarUid() + '-accent',
      brand: avatarUid() + '-brand',
      eyeIris: avatarUid() + '-eye-iris',
      book: avatarUid() + '-book'
    };

    var label = STATE_LABELS[o.state] || 'AIVOS';
    var accentClass = 'aivos-avatar--' + o.state;
    var poseClass = 'aivos-avatar--pose-' + o.pose;

    // Serialize accessory-relevant gradient IDs into a data attribute for setState
    var accIds = JSON.stringify({
      p: ids.panel,
      a: ids.accent,
      b: ids.brand,
      k: ids.book
    });

    return '' +
      '<div class="aivos-avatar aivos-avatar--' + o.size + ' ' + accentClass + ' ' + poseClass + '" ' +
        'data-size="' + esc(o.size) + '" data-state="' + esc(o.state) + '" data-pose="' + esc(o.pose) + '" data-accessory="' + esc(o.accessory) + '" ' +
        'data-track-pointer="' + (o.trackPointer ? 'true' : 'false') + '" data-acc-ids="' + esc(accIds) + '" role="img" aria-label="' + esc(label) + '">' +
        '<svg class="aivos-avatar-svg" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
          '<defs>' + buildDefs(ids) + '</defs>' +

          '<g class="aivos-avatar__scene">' + buildScene(ids) + '</g>' +

          '<g class="aivos-avatar__robot">' +
            '<g class="aivos-avatar__shadow">' + buildShadow() + '</g>' +

            '<g class="aivos-avatar__body">' + buildBody(ids) + '</g>' +

            '<g class="aivos-avatar__head">' + buildHead(ids) + '</g>' +

            '<g class="aivos-avatar__discs">' + buildDiscs(ids) + '</g>' +

            buildArmLeft(ids) +

            buildArmRight(ids) +

            '<g class="aivos-avatar__accessories">' + buildAccessory(o.accessory, ids) + '</g>' +
          '</g>' +
        '</svg>' +
      '</div>';
  }

  /* ══════════════════════════════════════════════════════════════════════════
     POINTER TRACKING
     ══════════════════════════════════════════════════════════════════════════ */

  function bindPointerTracking(root) {
    if (!root || root.getAttribute('data-track-pointer') !== 'true') return;
    if (root.getAttribute('data-pointer-bound') === 'true') return;
    root.setAttribute('data-pointer-bound', 'true');

    function setVars(evt) {
      var rect = root.getBoundingClientRect();
      var x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
      var y = ((evt.clientY - rect.top) / rect.height) * 2 - 1;
      root.style.setProperty('--aivos-look-x', (x * 10).toFixed(2) + 'px');
      root.style.setProperty('--aivos-look-y', (y * 8).toFixed(2) + 'px');
    }

    function resetVars() {
      root.style.setProperty('--aivos-look-x', '0px');
      root.style.setProperty('--aivos-look-y', '0px');
    }

    root.addEventListener('pointermove', setVars);
    root.addEventListener('pointerleave', resetVars);
    root.addEventListener('blur', resetVars);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     AIVOS AVATAR API
     ══════════════════════════════════════════════════════════════════════════ */

  var AivosAvatar = {
    render: function(container, opts) {
      var el = getElement(container);
      if (!el) return;
      var html = buildAvatarMarkup(opts);
      el.innerHTML = html;
      var root = el.querySelector('.aivos-avatar');
      if (root) bindPointerTracking(root);
    },

    html: function(opts) {
      return buildAvatarMarkup(opts);
    },

    setState: function(container, newState) {
      var el = getElement(container);
      if (!el) return;

      var root = el.classList && el.classList.contains('aivos-avatar') ? el : el.querySelector('.aivos-avatar');
      if (!root) return;

      var normalized = normalizeState(newState);
      var oldState = root.getAttribute('data-state') || 'idle';
      if (normalized === oldState) return;

      var oldPose = root.getAttribute('data-pose') || oldState;

      root.classList.remove('aivos-avatar--' + oldState);
      root.classList.remove('aivos-avatar--pose-' + oldPose);
      root.classList.add('aivos-avatar--' + normalized);
      root.classList.add('aivos-avatar--pose-' + normalized);

      root.setAttribute('data-state', normalized);
      root.setAttribute('data-pose', normalized);
      root.setAttribute('aria-label', STATE_LABELS[normalized] || 'AIVOS');

      // Update accessory when state changes
      var newAccessory = STATE_DEFAULT_ACCESSORIES[normalized] || 'none';
      var oldAccessory = root.getAttribute('data-accessory') || 'none';
      if (newAccessory !== oldAccessory) {
        root.setAttribute('data-accessory', newAccessory);
        // Restore gradient IDs from the stored data-acc-ids attribute
        var storedIds = root.getAttribute('data-acc-ids');
        var accIds = { panel: '', accent: '', brand: '', book: '' };
        if (storedIds) {
          try {
            var parsed = JSON.parse(storedIds);
            accIds.panel = parsed.p || '';
            accIds.accent = parsed.a || '';
            accIds.brand = parsed.b || '';
            accIds.book = parsed.k || '';
          } catch(e) {}
        }
        var accHtml = buildAccessory(newAccessory, accIds);
        var accContainer = root.querySelector('.aivos-avatar__accessories');
        if (accContainer) {
          accContainer.innerHTML = accHtml;
        }
      }
    }
  };

  /* ══════════════════════════════════════════════════════════════════════════
     AIVOS COACH — Card contextual com avatar + mensagem
     ══════════════════════════════════════════════════════════════════════════ */

  var AivosCoach = {
    render: function(container, opts) {
      opts = opts || {};
      var el = getElement(container);
      if (!el) return;

      var message = opts.message || '';
      var state = normalizeState(opts.state || 'explaining');
      var pose = normalizePose(opts.pose || state, state);
      var accessory = normalizeAccessory(opts.accessory, state);
      var action = opts.action || null;

      var avatarHtml = AivosAvatar.html({
        size: opts.avatarSize || 'md',
        state: state,
        pose: pose,
        accessory: accessory,
        trackPointer: !!opts.trackPointer
      });

      var actionHtml = action
        ? '<button class="aivos-coach-btn" data-aivos-action="true">' + esc(action.label || 'Continuar') + '</button>'
        : '';

      el.innerHTML =
        '<div class="aivos-coach" role="status" aria-live="polite">' +
          '<div class="aivos-coach-avatar">' + avatarHtml + '</div>' +
          '<div class="aivos-coach-body">' +
            '<div class="aivos-coach-name">AIVOS</div>' +
            '<div class="aivos-coach-message">' + message + '</div>' +
            (actionHtml ? '<div class="aivos-coach-action">' + actionHtml + '</div>' : '') +
          '</div>' +
        '</div>';

      if (action && action.onClick) {
        var btn = el.querySelector('[data-aivos-action]');
        if (btn) {
          btn.addEventListener('click', function(e) {
            action.onClick(e);
          });
        }
      }
    }
  };

  /* ══════════════════════════════════════════════════════════════════════════
     AIVOS BUBBLE — Notificação flutuante
     ══════════════════════════════════════════════════════════════════════════ */

  var AivosBubble = {
    show: function(opts) {
      opts = opts || {};
      var text = opts.text || '';
      var type = opts.type || 'info';
      var autoHide = opts.autoHide !== undefined ? opts.autoHide : 5000;
      if (!assertIn(type, BUBBLE_TYPES, 'Tipo')) type = 'info';

      var existing = document.querySelectorAll('.aivos-bubble');
      existing.forEach(function(bubble) { bubble.remove(); });

      var avatarHtml = AivosAvatar.html({ size: 'sm', state: 'waiting', pose: 'waiting' });
      var bubble = document.createElement('div');
      bubble.className = 'aivos-bubble aivos-bubble--' + type;
      bubble.setAttribute('role', 'alert');
      bubble.setAttribute('aria-live', 'assertive');
      bubble.innerHTML =
        '<div class="aivos-bubble-avatar">' + avatarHtml + '</div>' +
        '<div class="aivos-bubble-text">' + text + '</div>' +
        '<button class="aivos-bubble-close" aria-label="Fechar">&times;</button>';

      document.body.appendChild(bubble);

      var closeBtn = bubble.querySelector('.aivos-bubble-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          AivosBubble.dismiss(bubble);
        });
      }

      if (opts.onClick) {
        bubble.addEventListener('click', function(e) {
          if (e.target.closest('.aivos-bubble-close')) return;
          opts.onClick(e);
        });
      }

      if (autoHide > 0) {
        setTimeout(function() {
          if (bubble.parentNode) AivosBubble.dismiss(bubble);
        }, autoHide);
      }

      return bubble;
    },

    dismiss: function(bubble) {
      if (!bubble || !bubble.parentNode) return;
      bubble.classList.add('aivos-bubble--out');
      setTimeout(function() {
        if (bubble.parentNode) bubble.remove();
      }, 300);
    }
  };

  /* ══════════════════════════════════════════════════════════════════════════
     AIVOS CELEBRATION — Card de celebração
     ══════════════════════════════════════════════════════════════════════════ */

  var AivosCelebration = {
    render: function(container, opts) {
      opts = opts || {};
      var el = getElement(container);
      if (!el) return;

      var title = opts.title || 'Parabéns!';
      var sub = opts.sub || '';
      var score = opts.score || null;
      var action = opts.action || null;

      var avatarHtml = AivosAvatar.html({
        size: 'xl',
        state: 'celebrating',
        pose: 'celebrating',
        accessory: opts.accessory || 'none',
        trackPointer: !!opts.trackPointer
      });

      var actionHtml = action
        ? '<button class="aivos-celebration-btn" data-aivos-action="true">' + esc(action.label || 'Continuar') + '</button>'
        : '';

      el.innerHTML =
        '<div class="aivos-celebration" role="status" aria-live="polite">' +
          '<div class="aivos-celebration-avatar">' + avatarHtml + '</div>' +
          '<div class="aivos-celebration-title">' + title + '</div>' +
          (sub ? '<div class="aivos-celebration-sub">' + sub + '</div>' : '') +
          (score ? '<div class="aivos-celebration-score">' + score + '</div>' : '') +
          (actionHtml ? actionHtml : '') +
        '</div>';

      if (action && action.onClick) {
        var btn = el.querySelector('[data-aivos-action]');
        if (btn) {
          btn.addEventListener('click', function(e) {
            action.onClick(e);
          });
        }
      }

      if (opts.confetti && typeof confetti === 'function') {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#0D47FF', '#00B8FF', '#7C4DFF', '#4ADE80', '#FFD700']
        });
      }
    }
  };

  /* ══════════════════════════════════════════════════════════════════════════
     EXPORT (padrão do projeto: window.*)
     ══════════════════════════════════════════════════════════════════════════ */

  window.AivosAvatar = AivosAvatar;
  window.AivosCoach = AivosCoach;
  window.AivosBubble = AivosBubble;
  window.AivosCelebration = AivosCelebration;
})();
