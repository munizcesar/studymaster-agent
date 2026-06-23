"""
Apply Mentor Brain UI changes to index.html
Design inspirado em: Duolingo (gamificação), Notion (cards limpos),
Linear (micro-interações), Vercel (gradientes suaves)
"""
import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# ============================================================
# 1. CSS DO MENTOR CÉREBRO
# ============================================================

new_css = """
    /* 🧠 MENTOR CEREBRO - Mensagens Proativas */
    .mentor-messages {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      margin: var(--space-3) 0;
    }
    .mentor-message {
      background: var(--color-surface);
      border: 1.5px solid var(--color-border);
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      animation: mentorSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      box-shadow: 0 1px 3px oklch(0 0 0 / 0.06);
    }
    @keyframes mentorSlideIn {
      from { opacity: 0; transform: translateY(12px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .mentor-message:hover {
      border-color: var(--color-primary-mid);
      box-shadow: 0 8px 24px oklch(0 0 0 / 0.1);
      transform: translateY(-1px);
    }
    .mentor-message.message-warning { border-left: 4px solid var(--color-error); }
    .mentor-message.message-info { border-left: 4px solid var(--color-primary); }
    .mentor-message.message-success { border-left: 4px solid var(--color-success); }
    .mentor-message.message-insight { border-left: 4px solid #D4A827; }
    .mentor-message-header {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      background: var(--color-surface-offset);
      border-bottom: 1px solid var(--color-divider);
    }
    .mentor-message-icon { font-size: 1.4em; flex-shrink: 0; line-height: 1; }
    .mentor-message-title {
      flex: 1;
      font-weight: 700;
      font-size: var(--text-sm);
      color: var(--color-text);
      letter-spacing: -0.01em;
    }
    .mentor-pill {
      font-size: 10px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 999px;
      flex-shrink: 0;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }
    .mentor-pill.alta { background: oklch(from var(--color-success) l c h / 0.15); color: var(--color-success); }
    .mentor-pill.media { background: oklch(from #D4A827 l c h / 0.15); color: #D4A827; }
    .mentor-pill.baixa { background: oklch(from var(--color-error) l c h / 0.15); color: var(--color-error); }
    .message-dismiss {
      width: 28px; height: 28px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      color: var(--color-text-faint); font-size: 15px;
      transition: all 0.15s ease; flex-shrink: 0;
    }
    .message-dismiss:hover { background: var(--color-divider); color: var(--color-text); }
    .mentor-message-body {
      padding: var(--space-4);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }
    .mentor-obs {
      font-size: var(--text-sm);
      color: var(--color-text);
      line-height: 1.6;
      display: flex;
      gap: var(--space-2);
    }
    .mentor-obs-icon {
      font-size: 1.1em;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .mentor-obs-text strong {
      color: var(--color-primary);
    }
    .mentor-detail {
      font-size: var(--text-xs);
      color: var(--color-text-muted);
      line-height: 1.6;
      padding: var(--space-3);
      background: oklch(from var(--color-bg) l c h / 0.5);
      border-radius: 10px;
      border-left: 3px solid var(--color-primary-mid);
      margin-left: calc(1.1em + var(--space-2));
    }
    .mentor-detail strong {
      color: var(--color-text);
    }
    .mentor-action-pill {
      font-size: var(--text-xs);
      color: var(--color-text-muted);
      line-height: 1.6;
      padding: var(--space-3);
      background: oklch(from var(--color-success) l c h / 0.06);
      border-radius: 10px;
      border: 1px solid oklch(from var(--color-success) l c h / 0.15);
      margin-left: calc(1.1em + var(--space-2));
    }
    .mentor-action-pill strong { color: var(--color-success); }
    .mentor-audit-line {
      margin-top: var(--space-1);
      font-size: 10px;
      text-align: right;
      padding: 0 var(--space-1);
    }
    .mentor-audit-trigger {
      color: var(--color-text-faint);
      cursor: help;
      text-decoration: none;
      border-bottom: 1px dotted var(--color-text-faint);
      transition: color 0.15s;
    }
    .mentor-audit-trigger:hover { color: var(--color-primary-mid); }
    .mentor-action-btn {
      width: 100%;
      padding: var(--space-3) var(--space-4);
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-mid) 100%);
      color: white;
      font-weight: 700;
      font-size: var(--text-sm);
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
      letter-spacing: 0.01em;
    }
    .mentor-action-btn:hover {
      filter: brightness(1.1);
      transform: translateY(-1px);
    }
    .mentor-action-btn:active {
      transform: translateY(0) scale(0.99);
    }

    /* 🧠 Indicador de Cerebro (brain widget) */
    .mentor-brain-widget {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      background: linear-gradient(135deg, oklch(from var(--color-primary) l c h / 0.08), oklch(from var(--color-primary-mid) l c h / 0.12));
      border: 1px solid oklch(from var(--color-primary) l c h / 0.2);
      border-radius: 14px;
      position: relative;
      overflow: hidden;
      margin-bottom: var(--space-3);
    }
    .mentor-brain-widget::before {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 30% 50%, oklch(from var(--color-primary) l c h / 0.12), transparent 70%);
      animation: brainPulse 3s ease-in-out infinite;
      pointer-events: none;
    }
    @keyframes brainPulse {
      0%, 100% { opacity: 0.4; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.08); }
    }
    .mentor-brain-avatar {
      width: 46px;
      height: 46px;
      border-radius: 12px;
      background: var(--grad-brand);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.6em;
      flex-shrink: 0;
      position: relative;
      z-index: 1;
      box-shadow: 0 4px 16px oklch(from var(--color-primary) l c h / 0.3);
    }
    .mentor-brain-body {
      flex: 1;
      position: relative;
      z-index: 1;
      min-width: 0;
    }
    .mentor-brain-headline {
      font-weight: 700;
      font-size: var(--text-sm);
      color: var(--color-text);
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    .mentor-brain-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--color-success);
      display: inline-block;
      box-shadow: 0 0 6px oklch(from var(--color-success) l c h / 0.5);
      animation: brainBlink 1.8s ease-in-out infinite;
    }
    @keyframes brainBlink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.25; }
    }
    .mentor-brain-sub {
      font-size: 11px;
      color: var(--color-text-muted);
      margin-top: 2px;
    }
    .mentor-brain-badges {
      display: flex;
      gap: var(--space-2);
      position: relative;
      z-index: 1;
      flex-shrink: 0;
    }
    .mentor-brain-badge {
      text-align: center;
      padding: var(--space-1) var(--space-2);
      background: oklch(from var(--color-bg) l c h / 0.6);
      border-radius: 10px;
      min-width: 44px;
    }
    .mentor-brain-badge-value {
      font-size: var(--text-base);
      font-weight: 800;
      color: var(--color-primary);
      line-height: 1.2;
    }
    .mentor-brain-badge-label {
      font-size: 9px;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      line-height: 1;
    }

    @media (max-width: 600px) {
      .mentor-brain-widget { flex-wrap: wrap; gap: var(--space-2); }
      .mentor-brain-badges { width: 100%; justify-content: flex-end; padding-top: var(--space-1); border-top: 1px solid oklch(from var(--color-primary) l c h / 0.12); }
      .mentor-message-header { padding: var(--space-2) var(--space-3); }
      .mentor-message-body { padding: var(--space-3); }
    }
"""

# Find the marker and insert CSS after it
old_css_marker = """    .aivos360-coach-text {
      font-size: var(--text-sm);
      color: var(--color-text);
      font-weight: 500;
    }
    
    /* Auditoria IA */"""

if old_css_marker in content:
    # Insert new CSS before "/* Auditoria IA */"
    insert_point = old_css_marker.replace("    /* Auditoria IA */", new_css + "\n    /* Auditoria IA */")
    content = content.replace(old_css_marker, insert_point, 1)
    print("CSS inserido com sucesso!")
else:
    print("Marcador CSS nao encontrado!")
    # Debug: find aivoes360-coach-text
    idx = content.find('aivos360-coach-text')
    if idx >= 0:
        print("Encontrado em:", idx)
        print(content[idx-20:idx+200])

# ============================================================
# 2. SUBSTITUIR FUNCAO renderAivos360CoachBanner
# ============================================================

old_func = """function renderAivos360CoachBanner() {
  const container = document.getElementById('aivos360-coach-container');
  if (!container) return;
  const modo = state.aivos360State?.modoInteligente || 'cursinho';
  let msg = '';
  if (modo === 'cursinho') msg = '\U0001f4a1 Otimo ritmo! Voce tem uma boa margem ate a prova. Foque em fechar o edital com qualidade.';
  else if (modo === 'aprovacao') msg = '\u26a0\ufe0f Reta intermediaria. O sistema percebeu que voce pode estar negligenciando Portugues. Ajustei suas missoes.';
  else msg = '\U0001f525 Reta final! Seus simulados mostram fraqueza em Informatica. Prioridade maxima nas revisoes hoje!';
  
  container.innerHTML = `
    <div class="aivos360-coach-banner">
      <i data-lucide="bot" width="24" height="24"></i>
      <div class="aivos360-coach-text">${msg}</div>
    </div>
  `;
}"""

new_func = """function renderAivos360CoachBanner() {
  const container = document.getElementById('aivos360-coach-container');
  if (!container) return;
  const mentor = window.getProactiveMentor ? window.getProactiveMentor() : null;
  const brainState = mentor ? mentor.getBrainState() : null;
  const activeMessages = mentor ? mentor.getActiveMessages() : [];
  const stats = mentor ? mentor.getMessageStats() : null;
  const modo = state.aivos360State?.modoInteligente || 'cursinho';
  const modeIcons = { cursinho: '\U0001f4da', aprovacao: '\u26a1', guerra: '\U0001f525' };
  const modeLabels = { cursinho: 'Cursinho Completo', aprovacao: 'Aprovacao', guerra: 'Guerra' };
  const focusLabels = {
    risco: 'Analisando riscos de esquecimento',
    revisao: 'Verificando revisoes pendentes',
    lacuna: 'Detectando lacunas ocultas',
    aprovacao: 'Calculando probabilidade de aprovacao',
    consistencia: 'Monitorando consistencia de estudo',
    dominio: 'Avaliando niveis de dominio',
    bem_estar: 'Verificando saude cognitiva',
    observando: 'Observando seu progresso',
    inicializando: 'Inicializando modulo'
  };
  const focusLabel = brainState ? (focusLabels[brainState.currentFocus] || '\U0001f9e0 Analisando...') : '\U0001f9e0 Inicializando...';
  const brainActive = brainState ? brainState.isObserving : false;
  const msgCount = activeMessages.length;
  const totalMsgs = stats ? stats.total : 0;
  
  container.innerHTML = `
    <div class="mentor-brain-widget">
      <div class="mentor-brain-avatar">\U0001f9e0</div>
      <div class="mentor-brain-body">
        <div class="mentor-brain-headline">
          <span class="mentor-brain-dot"></span>
          AIVOS Mentor &mdash; ${brainActive ? 'Ativo' : 'Inativo'}
        </div>
        <div class="mentor-brain-sub">${focusLabel}</div>
      </div>
      <div class="mentor-brain-badges">
        <div class="mentor-brain-badge">
          <div class="mentor-brain-badge-value">${msgCount > 0 ? msgCount : '0'}</div>
          <div class="mentor-brain-badge-label">Alertas</div>
        </div>
        <div class="mentor-brain-badge">
          <div class="mentor-brain-badge-value">${totalMsgs > 0 ? totalMsgs : '0'}</div>
          <div class="mentor-brain-badge-label">Total</div>
        </div>
      </div>
    </div>
    <div class="aivos360-coach-banner">
      <span style="font-size:1.3em">${modeIcons[modo] || '\U0001f4da'}</span>
      <div class="aivos360-coach-text">
        <strong style="display:block;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:var(--color-text-muted);margin-bottom:2px;">
          Modo ${modeLabels[modo] || modo}
        </strong>
        ${modo === 'cursinho' ? 'Otimo ritmo! Voce tem uma boa margem ate a prova. Foque em fechar o edital com qualidade.' :
         modo === 'aprovacao' ? 'Reta intermediaria. O sistema percebeu que voce pode estar negligenciando Portugues. Ajustei suas missoes.' :
         'Reta final! Seus simulados mostram fraqueza em Informatica. Prioridade maxima nas revisoes hoje!'}
      </div>
    </div>
    <div id="mentor-messages-container"></div>
  `;
  if (typeof renderMentorMessages === 'function') renderMentorMessages();
}

function renderMentorMessages() {
  const container = document.getElementById('mentor-messages-container');
  if (!container) return;
  const mentor = window.getProactiveMentor ? window.getProactiveMentor() : null;
  if (!mentor || typeof mentor.renderMessages !== 'function') { container.innerHTML = ''; return; }
  const msgs = mentor.getActiveMessages();
  if (msgs.length === 0) { container.innerHTML = ''; return; }
  container.innerHTML = mentor.renderMessages();
  container.querySelectorAll('.mentor-action-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const action = this.dataset.action;
      console.log('[Mentor] Acao:', action);
      window.dispatchEvent(new CustomEvent('mentorAction', {
        detail: { action: action, data: this.dataset.actionData ? JSON.parse(this.dataset.actionData) : {} }
      }));
    });
  });
}

window.addEventListener('proactiveMessage', function() {
  var c = document.getElementById('aivos360-coach-container');
  if (c && c.isConnected && typeof renderAivos360CoachBanner === 'function') renderAivos360CoachBanner();
});

window.addEventListener('brainStateChange', function(e) {
  var c = document.getElementById('aivos360-coach-container');
  if (!c || !c.isConnected) return;
  var el = c.querySelector('.mentor-brain-sub');
  if (!el) return;
  var labels = {
    risco: 'Analisando riscos de esquecimento',
    revisao: 'Verificando revisoes pendentes',
    lacuna: 'Detectando lacunas ocultas',
    aprovacao: 'Calculando probabilidade de aprovacao',
    consistencia: 'Monitorando consistencia de estudo',
    dominio: 'Avaliando niveis de dominio',
    bem_estar: 'Verificando saude cognitiva',
    observando: 'Observando seu progresso',
    inicializando: 'Inicializando modulo'
  };
  el.textContent = labels[e.detail && e.detail.currentFocus] || '\U0001f9e0 Analisando...';
});"""

if old_func in content:
    content = content.replace(old_func, new_func, 1)
    print("Funcao substituida com sucesso!")
else:
    print("Funcao antiga NAO encontrada!")
    # Debug
    idx = content.find('renderAivos360CoachBanner()')
    if idx >= 0:
        print("Encontrada funcao em:", idx)
        print(content[idx:idx+200])

# ============================================================
# 3. SALVAR
# ============================================================

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Arquivo salvo com sucesso!")
