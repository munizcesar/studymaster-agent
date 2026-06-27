import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Add drawer JS before </body>
drawer_js = r'''
  <!-- Drawer JavaScript -->
  <script>
    (function() {
      var drawerOverlay = document.getElementById('drawerOverlay');
      var sideDrawer = document.getElementById('sideDrawer');
      var drawerIcon = document.getElementById('drawer-icon');
      if (!sideDrawer || !drawerOverlay) return;

      function toggleDrawer(force) {
        var isOpen = sideDrawer.classList.contains('open');
        var nextState = typeof force === 'boolean' ? force : !isOpen;
        sideDrawer.classList.toggle('open', nextState);
        drawerOverlay.classList.toggle('open', nextState);
        document.body.style.overflow = nextState ? 'hidden' : '';
        if (drawerIcon) {
          drawerIcon.setAttribute('data-lucide', nextState ? 'panel-right-open' : 'panel-right-close');
          if (typeof lucide !== 'undefined') setTimeout(function() { lucide.createIcons(); }, 0);
        }
        if (nextState) updateDrawerContent();
      }

      function updateDrawerContent() {
        var statsRaw, stats, el, acc, historyRaw, history, list, mentorRaw, mentor, container;
        try {
          statsRaw = typeof safeStorageGet === 'function' ? safeStorageGet('aivos-session-stats') : null;
          if (statsRaw) {
            stats = JSON.parse(statsRaw);
            el = document.getElementById('dTotalQs'); if(el) el.textContent = stats.total || 0;
            el = document.getElementById('dCorrect'); if(el) el.textContent = stats.correct || 0;
            acc = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
            el = document.getElementById('dAccuracy'); if(el) el.textContent = acc + '%';
            el = document.getElementById('dProgressFill'); if(el) el.style.width = acc + '%';
          }
        } catch(e) {}

        try {
          historyRaw = typeof safeStorageGet === 'function' ? safeStorageGet('aivos-session-history') : null;
          if (historyRaw) {
            history = JSON.parse(historyRaw);
            list = document.getElementById('drawerHistoryList');
            if (list && history.length > 0) {
              list.innerHTML = history.slice(-5).reverse().map(function(s) {
                var pct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
                var cls = pct >= 50 ? 'good' : 'bad';
                var label = s.filter || s.mode || 'Questoes';
                var sub = (s.banca || s.mode || '') + ' - ' + s.total + ' questoes';
                var time = s.time || '';
                return '<div class="drawer-history-item"><div class="drawer-history-score ' + cls + '">' + pct + '%</div><div class="drawer-history-info"><strong>' + label + '</strong><span>' + sub + '</span></div><div class="drawer-history-time">' + time + '</div></div>';
              }).join('');
            }
          }
        } catch(e) {}

        try {
          mentorRaw = typeof safeStorageGet === 'function' ? safeStorageGet('aivos-mentor-insight') : null;
          if (mentorRaw) {
            mentor = JSON.parse(mentorRaw);
            container = document.getElementById('drawerMentorContent');
            if (container && mentor.tip) {
              container.innerHTML = '<div class="drawer-mentor-tip"><strong><i data-lucide="sparkles" width="14" height="14"></i> Dica do Mentor</strong><br>' + mentor.tip + '</div>';
              if (typeof lucide !== 'undefined') setTimeout(function() { lucide.createIcons(); }, 0);
            }
          }
        } catch(e) {}
      }

      var toggleBtn = document.querySelector('[data-drawer-toggle]');
      if (toggleBtn) toggleBtn.addEventListener('click', function() { toggleDrawer(); });

      var closeBtn = document.querySelector('[data-drawer-close]');
      if (closeBtn) closeBtn.addEventListener('click', function() { toggleDrawer(false); });

      if (drawerOverlay) drawerOverlay.addEventListener('click', function() { toggleDrawer(false); });

      document.querySelectorAll('.drawer-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
          document.querySelectorAll('.drawer-tab').forEach(function(t) { t.classList.remove('active'); });
          document.querySelectorAll('.drawer-panel').forEach(function(p) { p.classList.remove('active'); });
          tab.classList.add('active');
          var panel = document.querySelector('[data-drawer-panel="' + tab.dataset.drawertab + '"]');
          if (panel) panel.classList.add('active');
        });
      });

      document.querySelectorAll('.drawer-action-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var action = btn.dataset.action;
          toggleDrawer(false);
          if (action === 'aivos360') {
            var db = document.getElementById('aivos360-dashboard');
            if (db) db.scrollIntoView({ behavior: 'smooth' });
            return;
          }
          if (action === 'redacao') {
            var rc = document.getElementById('redacao-coach-section');
            if (rc) rc.scrollIntoView({ behavior: 'smooth' });
            return;
          }
          var modeMap = { concursos: 'concurso', enem: 'enem', academic: 'academico' };
          var targetMode = modeMap[action];
          if (targetMode && typeof selectMode === 'function') {
            selectMode(targetMode);
            if (typeof goToStep === 'function') goToStep(1);
          }
        });
      });

      document.addEventListener('keydown', function(e) {
        if ((e.metaKey || e.ctrlKey) && (e.key === 'b' || e.key === 'B')) {
          e.preventDefault();
          toggleDrawer();
        }
      });
    })();
  </script>
'''

content = content.replace('</body>', drawer_js + '\n</body>', 1)
print('Found </body> tag, replacing...')

# Verify the JS was added
if 'toggleDrawer' in content:
    print('SUCCESS: toggleDrawer function found in content')
else:
    print('FAILED: toggleDrawer function NOT found')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('File written successfully')
