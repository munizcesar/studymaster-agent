import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

changes = 0

# ── 1. Add ripple CSS keyframes and .ripple style ──
ripple_css = """
    /* ── Ripple Effect ── */
    .btn-ripple {
      position: relative;
      overflow: hidden;
    }
    .btn-ripple .ripple {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: scale(0);
      animation: rippleAnim 0.6s ease-out forwards;
      pointer-events: none;
    }
    .btn-ripple .ripple.dark {
      background: rgba(0, 0, 0, 0.08);
    }
    @keyframes rippleAnim {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
"""

# Insert after the micro-interactions CSS block
insert_marker = "    @keyframes microPop {"
if insert_marker in content:
    # Insert ripple CSS right before @keyframes microPop
    content = content.replace(insert_marker, ripple_css.strip() + "\n    " + insert_marker, 1)
    print("1. Added ripple CSS keyframes")
    changes += 1
else:
    print("1. Could not find microPop keyframes insertion point")

# ── 2. Add position: relative; overflow: hidden to .qf-btn-primary base ──
old_qf_btn = """    .qf-btn-primary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-6);
      background: var(--grad-brand);
      color: white;
      font-weight: 700;
      font-size: var(--text-base);
      border-radius: var(--radius-md);
      border: none;
      cursor: pointer;
      transition: opacity var(--transition), transform var(--transition);
      font-family: inherit;
      box-shadow: 0 4px 14px oklch(from var(--color-primary) l c h / 0.3);
    }"""

new_qf_btn = """    .qf-btn-primary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-6);
      background: var(--grad-brand);
      color: white;
      font-weight: 700;
      font-size: var(--text-base);
      border-radius: var(--radius-md);
      border: none;
      cursor: pointer;
      font-family: inherit;
      position: relative;
      overflow: hidden;
      transition: all 0.25s var(--bounce-ease), box-shadow 0.3s var(--bounce-ease);
      box-shadow: 0 4px 14px oklch(from var(--color-primary) l c h / 0.3);
    }"""

if old_qf_btn in content:
    content = content.replace(old_qf_btn, new_qf_btn, 1)
    print("2. Updated .qf-btn-primary base with position relative")
    changes += 1
else:
    print("2. Could not find .qf-btn-primary base")

# ── 3. Remove duplicate .qf-btn-primary transition rule (now handled above) ──
old_qf_trans = """    .qf-btn-primary {
      transition: all 0.25s var(--bounce-ease), box-shadow 0.3s var(--bounce-ease);
    }"""

if old_qf_trans in content:
    content = content.replace(old_qf_trans, '', 1)
    print("3. Removed duplicate .qf-btn-primary transition rule")
    changes += 1
else:
    print("3. Could not find duplicate .qf-btn-primary transition")

# ── 4. Remove old .qf-btn-primary transition from original (opacity var(--transition)) ──
# Already handled above with the full replacement

# ── 5. Add ripple JS at the end of the file before </body> ──
ripple_js = """
  <!-- ── Ripple Effect Script ── -->
  <script>
    (function() {
      var rippleSelector = '.btn-primary, .btn-restart, .qf-btn-primary';
      var buttons = document.querySelectorAll(rippleSelector);
      
      function removeRipple(el) {
        var ripples = el.querySelectorAll('.ripple');
        for (var i = 0; i < ripples.length; i++) {
          ripples[i].remove();
        }
      }
      
      function createRipple(e, btn) {
        removeRipple(btn);
        var rect = btn.getBoundingClientRect();
        var size = Math.max(rect.width, rect.height);
        var x = (e.clientX || e.touches[0].clientX) - rect.left - size / 2;
        var y = (e.clientY || e.touches[0].clientY) - rect.top - size / 2;
        
        var ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.width = size + 'px';
        ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        // Use dark ripple on light-colored buttons
        var bg = window.getComputedStyle(btn).background;
        if (bg && (bg.includes('grad-brand') || bg.includes('primary'))) {
          // Light ripple on dark buttons - keep default white
        } else {
          ripple.classList.add('dark');
        }
        
        btn.appendChild(ripple);
        
        // Remove after animation
        setTimeout(function() {
          if (ripple.parentNode) ripple.remove();
        }, 700);
      }
      
      for (var i = 0; i < buttons.length; i++) {
        (function(btn) {
          btn.addEventListener('click', function(e) {
            createRipple(e, btn);
          });
          
          // Track mouse for glow effect
          btn.addEventListener('mousemove', function(e) {
            var rect = btn.getBoundingClientRect();
            var x = ((e.clientX - rect.left) / rect.width) * 100;
            var y = ((e.clientY - rect.top) / rect.height) * 100;
            btn.style.setProperty('--mouse-x', x + '%');
            btn.style.setProperty('--mouse-y', y + '%');
          });
        })(buttons[i]);
      }
      
      // Also handle mode cards and filter cards (they already have position:relative)
      var cardSelector = '.mode-card, .filter-card';
      var cards = document.querySelectorAll(cardSelector);
      for (var i = 0; i < cards.length; i++) {
        (function(card) {
          card.addEventListener('click', function(e) {
            createRipple(e, card);
          });
        })(cards[i]);
      }
    })();
  </script>
"""

content = content.replace('</body>', ripple_js + '\n</body>', 1)
print("5. Added ripple JS before </body>")
changes += 1

# ── 6. Add btn-ripple class to HTML elements that use btn-primary in the HTML ──
# Find btn-primary buttons in HTML and add btn-ripple class
# Pattern: class="btn-primary"
old_btn_class = 'class="btn-primary"'
new_btn_class = 'class="btn-primary btn-ripple"'
count = content.count(old_btn_class)
if count > 0:
    content = content.replace(old_btn_class, new_btn_class)
    print(f"6. Added btn-ripple class to {count} btn-primary elements")
    changes += 1

# Also btn-restart
old_restart_class = 'class="btn-restart"'
new_restart_class = 'class="btn-restart btn-ripple"'
count2 = content.count(old_restart_class)
if count2 > 0:
    content = content.replace(old_restart_class, new_restart_class)
    print(f"7. Added btn-ripple class to {count2} btn-restart elements")
    changes += 1

# qf-btn-primary  
old_qf_btn_class = 'class="qf-btn-primary"'
new_qf_btn_class = 'class="qf-btn-primary btn-ripple"'
count3 = content.count(old_qf_btn_class)
if count3 > 0:
    content = content.replace(old_qf_btn_class, new_qf_btn_class)
    print(f"8. Added btn-ripple class to {count3} qf-btn-primary elements")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\nTotal: {changes} changes applied!")
