
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
  