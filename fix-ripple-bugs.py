import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Check if old ripple JS exists and replace it  
old_ripple_js = """  <!-- Ripple Effect Script -->
  <script>
    (function() {
      var rippleSelector = '.btn-primary, .btn-restart, .qf-btn-primary, .mode-card, .filter-card';
      var buttons = document.querySelectorAll(rippleSelector);
      
      function createRipple(e, el) {
        var old = el.querySelectorAll('.ripple');
        for (var i = 0; i < old.length; i++) old[i].remove();
        
        var rect = el.getBoundingClientRect();
        var size = Math.max(rect.width, rect.height) * 1.2;
        
        var cx, cy;
        if (e.touches && e.touches.length > 0) {
          cx = e.touches[0].clientX;
          cy = e.touches[0].clientY;
        } else {
          cx = e.clientX;
          cy = e.clientY;
        }
        
        var x = cx - rect.left - size / 2;
        var y = cy - rect.top - size / 2;
        
        var ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + x + 'px;top:' + y + 'px;';
        el.appendChild(ripple);
        
        setTimeout(function() {
          if (ripple.parentNode) ripple.remove();
        }, 700);
      }
      
      for (var i = 0; i < buttons.length; i++) {
        (function(btn) {
          btn.addEventListener('click', function(e) {
            createRipple(e, btn);
          });
        })(buttons[i]);
      }
    })();
  </script>"""

new_ripple_js = """  <!-- Ripple Effect Script -->
  <script>
    (function() {
      var targetSelector = '.btn-primary, .btn-restart, .qf-btn-primary, .mode-card, .filter-card';
      var targets = document.querySelectorAll(targetSelector);
      
      function createRipple(e, el) {
        var old = el.querySelectorAll('.ripple');
        for (var i = 0; i < old.length; i++) old[i].remove();
        
        var rect = el.getBoundingClientRect();
        var size = Math.max(rect.width, rect.height) * 1.2;
        
        var cx = e.clientX;
        var cy = e.clientY;
        if (e.touches && e.touches.length > 0) {
          cx = e.touches[0].clientX;
          cy = e.touches[0].clientY;
        }
        
        var x = cx - rect.left - size / 2;
        var y = cy - rect.top - size / 2;
        
        var ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + x + 'px;top:' + y + 'px;';
        el.appendChild(ripple);
        
        setTimeout(function() {
          if (ripple.parentNode) ripple.remove();
        }, 700);
      }
      
      for (var i = 0; i < targets.length; i++) {
        (function(el) {
          el.addEventListener('click', function(e) {
            createRipple(e, el);
          });
        })(targets[i]);
      }
    })();
  </script>"""

if old_ripple_js in content:
    content = content.replace(old_ripple_js, new_ripple_js, 1)
    print("1. Fixed ripple JS with safe coordinate handling")
else:
    print("1. Could not find ripple JS (may already be updated)")
    # Try to find any ripple script
    if 'Ripple Effect Script' in content:
        print("   Found 'Ripple Effect Script' marker - checking version...")
        if 'e.touches && e.touches.length > 0' in content:
            print("   Already has touch-safe code - OK")
        if 'var cx, cy' in content:
            print("   Already has var cx, cy pattern - OK")
    else:
        print("   Ripple Effect Script not found!")

# 2. Add will-change to .ripple CSS for GPU acceleration
old_css = "      animation: rippleAnim 0.6s ease-out forwards;\n      pointer-events: none;"
new_css = "      will-change: transform, opacity;\n      animation: rippleAnim 0.6s ease-out forwards;\n      pointer-events: none;"

if old_css in content:
    content = content.replace(old_css, new_css, 1)
    print("2. Added will-change to ripple CSS")
else:
    print("2. Could not find ripple CSS")
    # Try without the "      " prefix
    alt_old = "animation: rippleAnim 0.6s ease-out forwards;\n      pointer-events: none;"
    alt_new = "will-change: transform, opacity;\n      animation: rippleAnim 0.6s ease-out forwards;\n      pointer-events: none;"
    if alt_old in content:
        content = content.replace(alt_old, alt_new, 1)
        print("2. Added will-change (alt match)")

# 3. Remove unused .ripple.dark class  
old_dark = "    .btn-ripple .ripple.dark {\n      background: rgba(0, 0, 0, 0.08);\n    }"

if old_dark in content:
    content = content.replace(old_dark, '', 1)
    print("3. Removed unused .ripple.dark class")
else:
    print("3. Could not find .ripple.dark class (already removed)")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("All ripple bug fixes done!")
