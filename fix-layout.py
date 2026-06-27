import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update :root CSS variables (light theme)
old_root = """    :root {
      --color-bg:             #F7F9FC;
      --color-surface:        #FFFFFF;
      --color-surface-2:      #F7F9FC;
      --color-surface-offset: #EEF3FF;
      --color-divider:        #E5E7EB;
      --color-border:         #E5E7EB;
      --color-text:           #111827;
      --color-text-muted:     #6B7280;
      --color-text-faint:     #8C96A8;
      --color-primary:        #0D47FF;
      --color-primary-mid:    #00B8FF;
      --color-primary-hover:  #0836C9;
      --color-accent:         #FF2D20;
      --color-success:        #16A34A;
      --color-error:          #FF2D20;
      --grad-ai: linear-gradient(135deg, #0D47FF 0%, #00B8FF 48%, #7C4DFF 100%);
      --grad-os: linear-gradient(135deg, #FF2D20 0%, #FF6A00 100%);"""

new_root = """    :root {
      --color-bg:             #F4F6FB;
      --color-surface:        #FFFFFF;
      --color-surface-2:      #F0F4FA;
      --color-surface-raised: #FFFFFF;
      --color-surface-offset: #E8EFFE;
      --color-divider:        #E2E6EE;
      --color-border:         #DDE2EC;
      --color-text:           #0B1124;
      --color-text-muted:     #5A6478;
      --color-text-faint:     #8892A8;
      --color-primary:        #0D47FF;
      --color-primary-mid:    #00CCFF;
      --color-primary-hover:  #0836C9;
      --color-accent:         #FF2D20;
      --color-success:        #16A34A;
      --color-error:          #FF2D20;
      --color-warning:        #F59E0B;
      --grad-ai: linear-gradient(135deg, #0D47FF 0%, #00CCFF 48%, #7C4DFF 100%);
      --grad-os: linear-gradient(135deg, #FF2D20 0%, #FF6A00 100%);"""

content = content.replace(old_root, new_root, 1)

# 2. Update [data-theme="dark"] CSS variables
old_dark = """      --color-bg:             #0A0F2C;
      --color-surface:        #121A45;
      --color-surface-2:      #10173D;
      --color-surface-offset: #172052;
      --color-divider:        #26325F;
      --color-border:         #26325F;
      --color-text:           #FFFFFF;
      --color-text-muted:     #B8C2D9;
      --color-text-faint:     #8793B5;
      --color-primary:        #0D47FF;
      --color-primary-mid:    #00B8FF;
      --color-primary-hover:  #2D63FF;
      --color-accent:         #FF2D20;
      --color-success:        #4ADE80;
      --color-error:          #FF2D20;
      --grad-ai: linear-gradient(135deg, #0D47FF 0%, #00B8FF 48%, #7C4DFF 100%);
      --grad-os: linear-gradient(135deg, #FF2D20 0%, #FF6A00 100%);"""

new_dark = """      --color-bg:             #080D26;
      --color-surface:        #0E1540;
      --color-surface-2:      #0B1238;
      --color-surface-raised: #151E52;
      --color-surface-offset: #141D52;
      --color-divider:        #1F2A5A;
      --color-border:         #1F2A5A;
      --color-text:           #F0F4FF;
      --color-text-muted:     #A8B6D9;
      --color-text-faint:     #7688B5;
      --color-primary:        #0D47FF;
      --color-primary-mid:    #00CCFF;
      --color-primary-hover:  #2D63FF;
      --color-accent:         #FF2D20;
      --color-success:        #4ADE80;
      --color-error:          #FF2D20;
      --color-warning:        #FBBF24;
      --grad-ai: linear-gradient(135deg, #0D47FF 0%, #00CCFF 48%, #7C4DFF 100%);
      --grad-os: linear-gradient(135deg, #FF2D20 0%, #FF6A00 100%);"""

content = content.replace(old_dark, new_dark, 1)

# 3. Add drawer toggle button in header
old_header = """        <div class=\"header-actions\">
          <button class=\"theme-toggle\" data-theme-toggle aria-label=\"Alternar tema\">
            <i data-lucide=\"sun\" width=\"20\" height=\"20\" id=\"theme-icon\"></i>
          </button>
        </div>"""

new_header = """        <div class=\"header-actions\">
          <button class=\"theme-toggle\" data-drawer-toggle aria-label=\"Abrir painel\">
            <i data-lucide=\"panel-right-close\" width=\"20\" height=\"20\" id=\"drawer-icon\"></i>
          </button>
          <button class=\"theme-toggle\" data-theme-toggle aria-label=\"Alternar tema\">
            <i data-lucide=\"sun\" width=\"20\" height=\"20\" id=\"theme-icon\"></i>
          </button>
        </div>"""

content = content.replace(old_header, new_header, 1)

# 4. Add drawer HTML before </body>
drawer_html = """  <!-- ── Side Drawer ── -->
  <div class=\"drawer-overlay\" id=\"drawerOverlay\"></div>
  <aside class=\"side-drawer\" id=\"sideDrawer\">
    <div class=\"drawer-header\">
      <span class=\"drawer-title\">Painel de Estudo</span>
      <button class=\"theme-toggle\" data-drawer-close aria-label=\"Fechar painel\">
        <i data-lucide=\"x\" width=\"20\" height=\"20\"></i>
      </button>
    </div>
    <div class=\"drawer-tabs\">
      <button class=\"drawer-tab active\" data-drawer-tab=\"historico\">
        <i data-lucide=\"history\" width=\"16\" height=\"16\"></i>
        <span>Histórico</span>
      </button>
      <button class=\"drawer-tab\" data-drawer-tab=\"progresso\">
        <i data-lucide=\"trending-up\" width=\"16\" height=\"16\"></i>
        <span>Progresso</span>
      </button>
      <button class=\"drawer-tab\" data-drawer-tab=\"atalhos\">
        <i data-lucide=\"zap\" width=\"16\" height=\"16\"></i>
        <span>Atalhos</span>
      </button>
      <button class=\"drawer-tab\" data-drawer-tab=\"mentor\">
        <i data-lucide=\"wand\" width=\"16\" height=\"16\"></i>
        <span>Mentor</span>
      </button>
    </div>
    <div class=\"drawer-body\">
      <!-- Histórico -->
      <div class=\"drawer-panel active\" data-drawer-panel=\"historico\">
        <div class=\"drawer-panel-header\">
          <div class=\"rs-section-title\"><i data-lucide=\"clock\" width=\"14\" height=\"14\"></i> Sessões Recentes</div>
        </div>
        <div class=\"drawer-history-list\" id=\"drawerHistoryList\">
          <div class=\"drawer-empty\">Nenhuma sessão ainda. <br>Resolva questões para ver seu histórico.</div>
        </div>
      </div>
      <!-- Progresso -->
      <div class=\"drawer-panel\" data-drawer-panel=\"progresso\">
        <div class=\"drawer-panel-header\">
          <div class=\"rs-section-title\"><i data-lucide=\"bar-chart-3\" width=\"14\" height=\"14\"></i> Desempenho Hoje</div>
        </div>
        <div id=\"drawerProgressContent\">
          <div class=\"drawer-metrics-grid\">
            <div class=\"drawer-metric\">
              <span class=\"drawer-metric-value\" id=\"dTotalQs\">0</span>
              <span class=\"drawer-metric-label\">Questões</span>
            </div>
            <div class=\"drawer-metric\">
              <span class=\"drawer-metric-value\" id=\"dCorrect\">0</span>
              <span class=\"drawer-metric-label\">Acertos</span>
            </div>
            <div class=\"drawer-metric\">
              <span class=\"drawer-metric-value\" id=\"dAccuracy\">0%</span>
              <span class=\"drawer-metric-label\">Aproveit.</span>
            </div>
          </div>
          <div class=\"rs-progress-bar\" style=\"margin-top: var(--space-3);\">
            <div class=\"rs-progress-fill\" id=\"dProgressFill\" style=\"width: 0%;\"></div>
          </div>
        </div>
      </div>
      <!-- Atalhos -->
      <div class=\"drawer-panel\" data-drawer-panel=\"atalhos\">
        <div class=\"drawer-panel-header\">
          <div class=\"rs-section-title\"><i data-lucide=\"zap\" width=\"14\" height=\"14\"></i> Ações Rápidas</div>
        </div>
        <div class=\"drawer-actions-list\">
          <button class=\"drawer-action-btn\" data-action=\"concursos\">
            <i data-lucide=\"briefcase\" width=\"18\" height=\"18\"></i>
            <div><strong>Concursos</strong><span>Questões por banca e cargo</span></div>
          </button>
          <button class=\"drawer-action-btn\" data-action=\"enem\">
            <i data-lucide=\"graduation-cap\" width=\"18\" height=\"18\"></i>
            <div><strong>ENEM</strong><span>Simulados e revisão</span></div>
          </button>
          <button class=\"drawer-action-btn\" data-action=\"redacao\">
            <i data-lucide=\"edit-3\" width=\"18\" height=\"18\"></i>
            <div><strong>Redação</strong><span>Prática com correção</span></div>
          </button>
          <button class=\"drawer-action-btn\" data-action=\"academic\">
            <i data-lucide=\"book-open\" width=\"18\" height=\"18\"></i>
            <div><strong>Acadêmico</strong><span>Matérias personalizadas</span></div>
          </button>
          <button class=\"drawer-action-btn\" data-action=\"aivos360\">
            <i data-lucide=\"compass\" width=\"18\" height=\"18\"></i>
            <div><strong>Painel AIVOS 360</strong><span>Dashboard completo</span></div>
          </button>
        </div>
      </div>
      <!-- Mentor -->
      <div class=\"drawer-panel\" data-drawer-panel=\"mentor\">
        <div class=\"drawer-panel-header\">
          <div class=\"rs-section-title\"><i data-lucide=\"sparkles\" width=\"14\" height=\"14\"></i> Mentor IA</div>
        </div>
        <div class=\"drawer-mentor-content\" id=\"drawerMentorContent\">
          <div class=\"drawer-empty\">Complete uma sessão de estudo para receber recomendações personalizadas do Mentor IA.</div>
        </div>
      </div>
    </div>
  </aside>
"""

content = content.replace('</body>', drawer_html + '\n</body>', 1)

# 5. Add drawer CSS before closing </style>
drawer_css = """
    /* ── Side Drawer ── */
    .drawer-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.45);
      z-index: 900;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      -webkit-backdrop-filter: blur(4px);
      backdrop-filter: blur(4px);
    }
    .drawer-overlay.open {
      opacity: 1;
      pointer-events: auto;
    }
    .side-drawer {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: min(400px, 92vw);
      background: var(--color-surface);
      border-left: 1px solid var(--color-border);
      z-index: 950;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: -8px 0 32px oklch(0 0 0 / 0.15);
    }
    .side-drawer.open {
      transform: translateX(0);
    }
    .drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-4) var(--space-5);
      border-bottom: 1px solid var(--color-divider);
      flex-shrink: 0;
    }
    .drawer-title {
      font-family: var(--font-display);
      font-size: var(--text-base);
      font-weight: 800;
      background: var(--grad-brand);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .drawer-tabs {
      display: flex;
      gap: 0;
      padding: var(--space-2) var(--space-3);
      border-bottom: 1px solid var(--color-divider);
      background: var(--color-surface-offset);
      flex-shrink: 0;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    .drawer-tab {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-md);
      font-size: var(--text-xs);
      font-weight: 600;
      color: var(--color-text-muted);
      transition: all var(--transition);
      white-space: nowrap;
      border: none;
      background: transparent;
      cursor: pointer;
      flex: 1;
      justify-content: center;
    }
    .drawer-tab:hover {
      color: var(--color-text);
      background: oklch(from var(--color-primary) l c h / 0.06);
    }
    .drawer-tab.active {
      color: var(--color-primary);
      background: oklch(from var(--color-primary) l c h / 0.1);
    }
    .drawer-tab i {
      width: 16px;
      height: 16px;
    }
    .drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: var(--space-4) var(--space-5);
      -webkit-overflow-scrolling: touch;
    }
    .drawer-panel {
      display: none;
      animation: drawerPanelIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .drawer-panel.active {
      display: block;
    }
    @keyframes drawerPanelIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .drawer-panel-header {
      margin-bottom: var(--space-3);
    }
    .drawer-empty {
      font-size: var(--text-sm);
      color: var(--color-text-muted);
      text-align: center;
      padding: var(--space-8) var(--space-4);
      line-height: 1.6;
    }
    .drawer-metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-3);
      margin-bottom: var(--space-4);
    }
    .drawer-metric {
      text-align: center;
      padding: var(--space-3);
      background: var(--color-surface-offset);
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
    }
    .drawer-metric-value {
      display: block;
      font-family: var(--font-display);
      font-size: var(--text-lg);
      font-weight: 800;
      color: var(--color-primary);
      line-height: 1.2;
    }
    .drawer-metric-label {
      display: block;
      font-size: 11px;
      color: var(--color-text-muted);
      font-weight: 600;
      margin-top: 2px;
    }
    .drawer-history-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
    .drawer-history-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3);
      background: var(--color-surface-offset);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: var(--text-xs);
      transition: all var(--transition);
      cursor: pointer;
    }
    .drawer-history-item:hover {
      border-color: var(--color-primary);
      background: oklch(from var(--color-primary) l c h / 0.05);
    }
    .drawer-history-score {
      font-weight: 800;
      font-size: var(--text-sm);
      min-width: 40px;
      text-align: center;
    }
    .drawer-history-score.good { color: var(--color-success); }
    .drawer-history-score.bad { color: var(--color-error); }
    .drawer-history-info {
      flex: 1;
      min-width: 0;
    }
    .drawer-history-info strong {
      display: block;
      font-size: var(--text-sm);
      color: var(--color-text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .drawer-history-info span {
      color: var(--color-text-muted);
    }
    .drawer-history-time {
      color: var(--color-text-faint);
      font-size: 11px;
      white-space: nowrap;
    }
    .drawer-actions-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
    .drawer-action-btn {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface-offset);
      color: var(--color-text);
      text-align: left;
      cursor: pointer;
      transition: all var(--transition);
      font-family: inherit;
      width: 100%;
    }
    .drawer-action-btn:hover {
      border-color: var(--color-primary);
      background: oklch(from var(--color-primary) l c h / 0.06);
      transform: translateX(4px);
    }
    .drawer-action-btn i {
      color: var(--color-primary);
      flex-shrink: 0;
    }
    .drawer-action-btn div strong {
      display: block;
      font-size: var(--text-sm);
      font-weight: 700;
      line-height: 1.3;
    }
    .drawer-action-btn div span {
      display: block;
      font-size: 11px;
      color: var(--color-text-muted);
      margin-top: 1px;
    }
    .drawer-mentor-content {
      min-height: 100px;
    }
    .drawer-mentor-tip {
      padding: var(--space-4);
      background: linear-gradient(135deg, oklch(from var(--color-primary) l c h / 0.08) 0%, oklch(from var(--color-primary) l c h / 0.04) 100%);
      border: 1px solid oklch(from var(--color-primary) l c h / 0.2);
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      line-height: 1.6;
      color: var(--color-text);
      margin-bottom: var(--space-3);
    }
    .drawer-mentor-tip strong {
      color: var(--color-primary);
    }
    @media (max-width: 480px) {
      .side-drawer { width: 92vw; }
      .drawer-tabs { padding: var(--space-2) var(--space-2); gap: var(--space-1); }
      .drawer-tab { font-size: 11px; padding: var(--space-1) var(--space-2); }
      .drawer-body { padding: var(--space-3) var(--space-4); }
      .drawer-metrics-grid { gap: var(--space-2); }
      .drawer-metric { padding: var(--space-2); }
    }
"""

content = content.replace('</style>', drawer_css + '\n</style>', 1)

# 6. Add drawer JS logic near the theme-toggle JS
drawer_js = """
  // ── Drawer Toggle ──
  const drawerOverlay = document.getElementById('drawerOverlay');
  const sideDrawer = document.getElementById('sideDrawer');
  const drawerIcon = document.getElementById('drawer-icon');

  function toggleDrawer(force) {
    const isOpen = sideDrawer.classList.contains('open');
    const nextState = typeof force === 'boolean' ? force : !isOpen;
    sideDrawer.classList.toggle('open', nextState);
    drawerOverlay.classList.toggle('open', nextState);
    document.body.style.overflow = nextState ? 'hidden' : '';

    if (drawerIcon) {
      drawerIcon.setAttribute('data-lucide', nextState ? 'panel-right-open' : 'panel-right-close');
      lucide.createIcons();
    }
    if (nextState) updateDrawerContent();
  }

  document.querySelector('[data-drawer-toggle]').addEventListener('click', () => toggleDrawer());
  document.querySelector('[data-drawer-close]').addEventListener('click', () => toggleDrawer(false));
  drawerOverlay.addEventListener('click', () => toggleDrawer(false));

  // ── Drawer Tabs ──
  document.querySelectorAll('.drawer-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.drawer-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.drawer-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = document.querySelector(`[data-drawer-panel="${tab.dataset.drawerTab}"]`);
      if (panel) panel.classList.add('active');
    });
  });

  // ── Drawer Content Update ──
  function updateDrawerContent() {
    try {
      const raw = safeStorageGet('aivos-session-stats');
      if (!raw) return;
      const stats = JSON.parse(raw);
      document.getElementById('dTotalQs').textContent = stats.total || 0;
      document.getElementById('dCorrect').textContent = stats.correct || 0;
      const acc = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
      document.getElementById('dAccuracy').textContent = acc + '%';
      document.getElementById('dProgressFill').style.width = acc + '%';
    } catch (e) { /* no stats yet */ }

    // Update history list
    try {
      const historyRaw = safeStorageGet('aivos-session-history');
      if (!historyRaw) return;
      const history = JSON.parse(historyRaw);
      const list = document.getElementById('drawerHistoryList');
      if (history.length > 0) {
        list.innerHTML = history.slice(-5).reverse().map(s => {
          const pct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
          return `<div class="drawer-history-item">
            <div class="drawer-history-score ${pct >= 50 ? 'good' : 'bad'}">${pct}%</div>
            <div class="drawer-history-info">
              <strong>${s.filter || s.mode || 'Questões'}</strong>
              <span>${s.banca || s.mode || ''} · ${s.total} questões</span>
            </div>
            <div class="drawer-history-time">${s.time || ''}</div>
          </div>`;
        }).join('');
      }
    } catch (e) { /* no history */ }

    // Update mentor tips
    try {
      const mentorRaw = safeStorageGet('aivos-mentor-insight');
      if (mentorRaw) {
        const mentor = JSON.parse(mentorRaw);
        const container = document.getElementById('drawerMentorContent');
        if (mentor.tip) {
          container.innerHTML = `<div class="drawer-mentor-tip"><strong><i data-lucide="sparkles" width="14" height="14"></i> Dica do Mentor</strong><br>${mentor.tip}</div>`;
        }
      }
    } catch (e) { /* no mentor data */ }
  }

  // ── Keyboard shortcut ──
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
      e.preventDefault();
      toggleDrawer();
    }
  });
"""

# Insert drawer JS after the theme-toggle JS block
js_insert_marker = """  lucide.createIcons();
});
"""
content = content.replace(js_insert_marker, js_insert_marker + drawer_js, 1)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ All layout changes applied successfully!")
print("Changes made:")
print("  1. Refined color palette (light + dark)")
print("  2. Added side drawer with 4 tabs")
print("  3. Added drawer toggle button in header")
print("  4. Added drawer CSS with animations")
print("  5. Added drawer JS logic")
print("  6. Added keyboard shortcut (Cmd/Ctrl+B)")
