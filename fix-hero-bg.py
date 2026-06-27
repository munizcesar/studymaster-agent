with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

changes = 0

# ============================================================
# 1. Replace ::before - Rich gradient composition
# ============================================================
old_before = '''    .hero::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background:
        radial-gradient(ellipse 80% 50% at 50% 0%, oklch(from var(--color-primary) l c h / 0.08) 0%, transparent 70%),
        radial-gradient(ellipse 60% 40% at 80% 20%, oklch(from var(--color-primary-mid) l c h / 0.05) 0%, transparent 60%),
        radial-gradient(ellipse 50% 30% at 20% 60%, oklch(from var(--color-primary) l c h / 0.04) 0%, transparent 50%);
      pointer-events: none;
      z-index: 0;
    }'''

new_before = '''    .hero::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background:
        /* Large ambient glow from top center -- main text area */
        radial-gradient(ellipse 100% 60% at 30% 10%, oklch(from var(--color-primary) l c h / 0.15) 0%, transparent 70%),
        /* Secondary glow from bottom right -- cyan accent depth */
        radial-gradient(ellipse 70% 50% at 85% 85%, oklch(from var(--color-primary-mid) l c h / 0.10) 0%, transparent 60%),
        /* Subtle warm fill from left edge */
        radial-gradient(ellipse 60% 70% at 5% 50%, oklch(from var(--color-primary) l c h / 0.06) 0%, transparent 60%),
        /* Deep accent spot at bottom left for balance */
        radial-gradient(ellipse 40% 30% at 20% 90%, oklch(from var(--color-primary-mid) l c h / 0.07) 0%, transparent 50%);
      pointer-events: none;
      z-index: 0;
    }'''

if old_before in content:
    content = content.replace(old_before, new_before, 1)
    changes += 1
    print('OK ::before gradient composition')
else:
    print('FAIL ::before CSS not found')

# ============================================================
# 2. Replace ::after - More elegant grid with edge fade
# ============================================================
old_after = '''    .hero::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image:
        linear-gradient(oklch(from var(--color-text) l c h / 0.03) 1px, transparent 1px),
        linear-gradient(90deg, oklch(from var(--color-text) l c h / 0.03) 1px, transparent 1px);
      background-size: 60px 60px;
      pointer-events: none;
      z-index: 0;
      opacity: 0.4;
    }'''

new_after = '''    .hero::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image:
        linear-gradient(oklch(from var(--color-text) l c h / 0.02) 1px, transparent 1px),
        linear-gradient(90deg, oklch(from var(--color-text) l c h / 0.02) 1px, transparent 1px);
      background-size: 48px 48px;
      pointer-events: none;
      z-index: 0;
      opacity: 0.5;
      mask-image: radial-gradient(ellipse 90% 80% at 50% 50%, black 30%, transparent 100%);
      -webkit-mask-image: radial-gradient(ellipse 90% 80% at 50% 50%, black 30%, transparent 100%);
    }'''

if old_after in content:
    content = content.replace(old_after, new_after, 1)
    changes += 1
    print('OK ::after grid pattern')
else:
    print('FAIL ::after CSS not found')

# ============================================================
# 3. Replace hero-bg-svg content - Geometric particle system
# ============================================================
new_svg = '''<svg viewBox="0 0 1200 600" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Orbital ring 1 - Large, slow float -->
        <circle cx="250" cy="250" r="140" stroke="url(#primaryGlow)" stroke-width="0.8" opacity="0.12" class="orbital-ring-1"/>
        <circle cx="250" cy="250" r="120" stroke="url(#primaryGlow)" stroke-width="0.5" opacity="0.08" class="orbital-ring-1"/>
        
        <!-- Orbital ring 2 - Medium, offset -->
        <circle cx="900" cy="180" r="100" stroke="url(#accentGlow)" stroke-width="0.6" opacity="0.10" class="orbital-ring-2"/>
        <circle cx="900" cy="180" r="85" stroke="url(#accentGlow)" stroke-width="0.4" opacity="0.06" class="orbital-ring-2"/>
        
        <!-- Orbital ring 3 - Small, bottom right -->
        <circle cx="1050" cy="450" r="60" stroke="url(#primaryGlow)" stroke-width="0.5" opacity="0.08" class="orbital-ring-3"/>
        
        <!-- Subtle arc accent - left -->
        <path d="M50 400 C 150 200, 350 150, 500 280" stroke="url(#primaryGlow)" stroke-width="0.6" opacity="0.07" fill="none" class="arc-line-1"/>
        
        <!-- Subtle arc accent - right -->
        <path d="M700 320 C 850 180, 1000 250, 1150 180" stroke="url(#accentGlow)" stroke-width="0.5" opacity="0.06" fill="none" class="arc-line-2"/>
        
        <!-- Particle dots - scattered across the hero -->
        <circle cx="120" cy="120" r="2" fill="var(--color-primary)" opacity="0.15" class="particle p1"/>
        <circle cx="380" cy="80" r="1.5" fill="var(--color-primary-mid)" opacity="0.12" class="particle p2"/>
        <circle cx="550" cy="200" r="1" fill="var(--color-primary)" opacity="0.10" class="particle p3"/>
        <circle cx="750" cy="100" r="2.5" fill="var(--color-primary)" opacity="0.13" class="particle p4"/>
        <circle cx="950" cy="300" r="1.5" fill="var(--color-primary-mid)" opacity="0.11" class="particle p5"/>
        <circle cx="1100" cy="120" r="1" fill="var(--color-primary)" opacity="0.09" class="particle p6"/>
        <circle cx="200" cy="400" r="2" fill="var(--color-primary-mid)" opacity="0.10" class="particle p7"/>
        <circle cx="450" cy="450" r="1.5" fill="var(--color-primary)" opacity="0.08" class="particle p8"/>
        <circle cx="650" cy="380" r="1" fill="var(--color-primary-mid)" opacity="0.12" class="particle p9"/>
        <circle cx="850" cy="500" r="2" fill="var(--color-primary)" opacity="0.09" class="particle p10"/>
        <circle cx="100" cy="300" r="1" fill="var(--color-primary-mid)" opacity="0.07" class="particle p11"/>
        <circle cx="300" cy="500" r="1.5" fill="var(--color-primary)" opacity="0.10" class="particle p12"/>
        <circle cx="500" cy="520" r="1" fill="var(--color-primary-mid)" opacity="0.08" class="particle p13"/>
        <circle cx="700" cy="200" r="2" fill="var(--color-primary)" opacity="0.11" class="particle p14"/>
        
        <!-- Gradient definitions -->
        <defs>
          <linearGradient id="primaryGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="var(--color-primary)"/>
            <stop offset="100%" stop-color="transparent"/>
          </linearGradient>
          <linearGradient id="accentGlow" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="var(--color-primary-mid)"/>
            <stop offset="100%" stop-color="transparent"/>
          </linearGradient>
        </defs>
      </svg>'''

old_svg_start = '<svg viewBox="0 0 1200 600" fill="none" xmlns="http://www.w3.org/2000/svg">'
idx_svg_start = content.find(old_svg_start)
if idx_svg_start >= 0:
    svg_end = content.find('</svg>', idx_svg_start)
    if svg_end >= 0:
        old_svg_block = content[idx_svg_start:svg_end + len('</svg>')]
        content = content.replace(old_svg_block, new_svg, 1)
        changes += 1
        print('OK SVG replaced with geometric particle system')
    else:
        print('FAIL SVG closing tag not found')
else:
    print('FAIL SVG start tag not found')

# ============================================================
# 4. Replace CSS keyframes
# ============================================================
old_keyframes = '''    @keyframes iconPulse {
      0%, 75%, 100% { opacity: 0.05; }
      55% { opacity: 0.11; }
    }
    @keyframes iconPulseLow {
      0%, 75%, 100% { opacity: 0.02; }
      55% { opacity: 0.06; }
    }
    @keyframes iconFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }'''

new_keyframes = '''    @keyframes orbitalFloat1 {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-12px) rotate(3deg); }
    }
    @keyframes orbitalFloat2 {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(8px) rotate(-2deg); }
    }
    @keyframes orbitalFloat3 {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }
    @keyframes particleFloat {
      0%, 100% { transform: translateY(0) translateX(0); opacity: var(--p-opacity, 0.10); }
      50% { transform: translateY(-8px) translateX(4px); opacity: calc(var(--p-opacity, 0.10) + 0.05); }
    }
    @keyframes arcDrift {
      0%, 100% { transform: translateX(0); opacity: 0.06; }
      50% { transform: translateX(6px); opacity: 0.10; }
    }'''

if old_keyframes in content:
    content = content.replace(old_keyframes, new_keyframes, 1)
    changes += 1
    print('OK keyframes replaced')
else:
    print('FAIL old keyframes not found')
    if 'iconPulse' in content:
        print('     (iconPulse found - checking exact match)')

# ============================================================
# 5. Replace g element animation CSS
# ============================================================
old_g_css = '.hero-bg-svg svg > g {'
idx_g_css = content.find(old_g_css)
if idx_g_css >= 0:
    nth_start = content.find('.hero-bg-svg svg > g:nth-of-type', idx_g_css)
    if nth_start >= 0:
        old_g_block = content[idx_g_css:nth_start]
        new_g_block = '''    .hero-bg-svg svg > g {
      animation: orbitalFloat1 8s ease-in-out infinite;
      transform-origin: center;
    }
    .hero-bg-svg svg > g:nth-of-type(1) { animation-delay: 0s; }
    .hero-bg-svg svg > g:nth-of-type(2) { animation-delay: 0.6s; }
    .hero-bg-svg svg > g:nth-of-type(3) { animation-delay: 1.2s; }
    .hero-bg-svg svg > g:nth-of-type(4) { animation-delay: 0.3s; }
    .hero-bg-svg svg > g:nth-of-type(5) { animation-delay: 1.8s; }
    .hero-bg-svg svg > g:nth-of-type(6) { animation-delay: 0.9s; }
    .hero-bg-svg svg > g:nth-of-type(7) { animation-delay: 1.5s; }
    .hero-bg-svg svg > g:nth-of-type(8) { animation-delay: 2.1s; }
    .hero-bg-svg svg > g:nth-of-type(9) { animation-delay: 0.4s; }
    .hero-bg-svg svg > g:nth-of-type(10) { animation-delay: 1.0s; }'''
        content = content.replace(old_g_block, new_g_block, 1)
        changes += 1
        print('OK g element animation CSS')
    else:
        print('FAIL nth-of-type start not found')
else:
    print('FAIL g CSS not found')

# ============================================================
# 6. Remove old nth-of-type animation overrides
# ============================================================
idx_overrides = content.find('.hero-bg-svg svg > g:nth-of-type(8)')
if idx_overrides >= 0:
    idx_mq = content.find('@media (prefers-reduced-motion)', idx_overrides)
    if idx_mq >= 0:
        old_override_block = content[idx_overrides:idx_mq]
        content = content.replace(old_override_block, '', 1)
        changes += 1
        print('OK removed old nth-of-type overrides')
    else:
        print('FAIL could not find media query boundary')
else:
    print('WARN nth-of-type(8) override not found')

# ============================================================
# 7. Update media queries
# ============================================================
old_reduced = '''@media (prefers-reduced-motion) {
      .hero-bg-svg svg > g {
        animation: none !important;
      }
    }'''
new_reduced = '''@media (prefers-reduced-motion) {
      .hero-bg-svg svg > g,
      .hero-bg-svg svg .particle {
        animation: none !important;
      }
    }'''
if old_reduced in content:
    content = content.replace(old_reduced, new_reduced, 1)
    changes += 1
    print('OK prefers-reduced-motion query')
else:
    print('FAIL prefers-reduced-motion query not found')

old_mobile_anim = '''@media (max-width: 768px) {
      .hero-bg-svg svg > g {
        animation-duration: 8s, 10s;
      }
    }'''
new_mobile_anim = '''@media (max-width: 768px) {
      .hero-bg-svg svg > g {
        animation-duration: 10s;
      }
      .hero-bg-svg svg .particle {
        animation-duration: 6s;
      }
    }'''
if old_mobile_anim in content:
    content = content.replace(old_mobile_anim, new_mobile_anim, 1)
    changes += 1
    print('OK 768px media query')
else:
    print('FAIL 768px media query not found')

old_small_mobile = '''@media (max-width: 480px) {
      .hero-bg-svg svg > g {
        animation: none !important;
        opacity: 0.035 !important;
      }
      .hero-bg-svg svg > g:nth-of-type(8),
      .hero-bg-svg svg > g:nth-of-type(10) {
        display: none;
      }
    }'''
new_small_mobile = '''@media (max-width: 480px) {
      .hero-bg-svg svg > g,
      .hero-bg-svg svg .particle {
        animation: none !important;
        opacity: 0.035 !important;
      }
      .hero-bg-svg svg .particle:nth-of-type(4),
      .hero-bg-svg svg .particle:nth-of-type(10) {
        display: none;
      }
    }'''
if old_small_mobile in content:
    content = content.replace(old_small_mobile, new_small_mobile, 1)
    changes += 1
    print('OK 480px media query')
else:
    print('FAIL 480px media query not found')
    if 'max-width: 480px' in content and 'hero-bg-svg' in content:
        print('     (query exists - may need exact match check)')

# ============================================================
# 8. Add particle/orbital animation CSS rules
# ============================================================
old_container_css = '''    .hero .container {
      position: relative;
      z-index: 2;
    }'''

particle_css = '''    .hero-bg-svg svg .orbital-ring-1 { animation: orbitalFloat1 10s ease-in-out infinite; transform-origin: center; }
    .hero-bg-svg svg .orbital-ring-2 { animation: orbitalFloat2 12s ease-in-out infinite; transform-origin: center; }
    .hero-bg-svg svg .orbital-ring-3 { animation: orbitalFloat3 8s ease-in-out infinite; transform-origin: center; }
    .hero-bg-svg svg .particle { animation: particleFloat 5s ease-in-out infinite; }
    .hero-bg-svg svg .arc-line-1 { animation: arcDrift 8s ease-in-out infinite; }
    .hero-bg-svg svg .arc-line-2 { animation: arcDrift 10s ease-in-out infinite reverse; }
    .hero-bg-svg svg .particle.p1 { --p-opacity: 0.15; animation-delay: 0s; }
    .hero-bg-svg svg .particle.p2 { --p-opacity: 0.12; animation-delay: 0.8s; }
    .hero-bg-svg svg .particle.p3 { --p-opacity: 0.10; animation-delay: 1.6s; }
    .hero-bg-svg svg .particle.p4 { --p-opacity: 0.13; animation-delay: 0.4s; }
    .hero-bg-svg svg .particle.p5 { --p-opacity: 0.11; animation-delay: 2.0s; }
    .hero-bg-svg svg .particle.p6 { --p-opacity: 0.09; animation-delay: 1.2s; }
    .hero-bg-svg svg .particle.p7 { --p-opacity: 0.10; animation-delay: 0.2s; }
    .hero-bg-svg svg .particle.p8 { --p-opacity: 0.08; animation-delay: 1.8s; }
    .hero-bg-svg svg .particle.p9 { --p-opacity: 0.12; animation-delay: 0.6s; }
    .hero-bg-svg svg .particle.p10 { --p-opacity: 0.09; animation-delay: 2.4s; }
    .hero-bg-svg svg .particle.p11 { --p-opacity: 0.07; animation-delay: 1.4s; }
    .hero-bg-svg svg .particle.p12 { --p-opacity: 0.10; animation-delay: 0.1s; }
    .hero-bg-svg svg .particle.p13 { --p-opacity: 0.08; animation-delay: 1.0s; }
    .hero-bg-svg svg .particle.p14 { --p-opacity: 0.11; animation-delay: 2.2s; }
'''

if old_container_css in content:
    content = content.replace(old_container_css, particle_css + old_container_css, 1)
    changes += 1
    print('OK added orbital/particle animation CSS')
else:
    print('FAIL .hero .container CSS not found')

# ============================================================
# Write back
# ============================================================
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print(f'\nDONE: {changes} changes applied to index.html')
