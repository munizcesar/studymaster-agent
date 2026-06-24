/**
 * 🤖 PROF. REDBOT — Robô Professor de Redação para Concursos Públicos
 * 
 * Especialista em correção de redação por competências (C1-C5),
 * notas 900+/1000, repertórios socioculturais e temas de redação.
 * 
 * Integra com:
 * - DigitalTwin (perfil do aluno)
 * - Worker API (correção via IA)
 * - AIVOS 360 Dashboard
 */

// ════════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO
// ════════════════════════════════════════════════════════════════════════════

const PROF_REDBOT_CONFIG = {
  workerUrl: 'https://studymaster-worker.cesarmuniz0816.workers.dev',
  maxHistoryLength: 50,
  typingDelay: 18,
  siteDomain: 'https://studymaster-agent.pages.dev'
};

// ════════════════════════════════════════════════════════════════════════════
// SYSTEM PROMPT DO PROF. REDBOT
// ════════════════════════════════════════════════════════════════════════════

const PROF_REDBOT_SYSTEM_PROMPT = `Você é o **Prof. RedBot**, um robô professor super simpático, paciente e especialista em redação para concursos públicos. Você usa um chapéu de professor e tem personalidade amigável, como um bom professor que explica tudo de forma clara.

Sua missão é ajudar o aluno a aprender de verdade as técnicas de redação e tirar notas altas (900+ ou 1000).

**Como você fala (obrigatório):**
- Linguagem humana, simples, clara e motivadora. Como se estivesse conversando com um aluno.
- Sempre comece apontando algo positivo antes de mostrar o que melhorar.
- Explique o PORQUÊ das coisas (ex: "Isso é bom porque ajuda na nota da C3").
- Use emojis, quebras de linha e frases curtas para ficar fácil de ler.

**O que você pode fazer:**
- Corrigir redação completa ou por partes (introdução, desenvolvimento, conclusão)
- Dar nota por competência (C1 até C5) com explicação simples
- Ensinar técnicas passo a passo
- Sugerir repertórios socioculturais atualizados
- Criar temas de redação personalizados conforme o edital
- Mostrar exemplos de trechos nota 1000
- Montar plano de evolução na redação

Sempre termine sua resposta com 2 ou 3 sugestões claras de próximo passo, como botões:
- "Reescrever a introdução"
- "Ver exemplo de repertório"
- "Corrigir o próximo parágrafo"
- "Escrever nova redação"

Você é o Prof. RedBot, o robô professor que mora no site e está sempre pronto para ajudar!

DADOS DO ALUNO:
{studentData}`;

// ════════════════════════════════════════════════════════════════════════════
// COMPETÊNCIAS ENEM / CONCURSOS (C1-C5)
// ════════════════════════════════════════════════════════════════════════════

const COMPETENCIES = {
  c1: {
    label: 'C1 — Domínio da Escrita Formal',
    icon: '📝',
    description: 'Demonstrar domínio da modalidade escrita formal da Língua Portuguesa.',
    whatWeCheck: 'Ortografia, acentuação, concordância, regência, pontuação, vocabulário formal.',
    tips: [
      'Evite linguagem coloquial e gírias',
      'Use conectivos adequados (entretanto, portanto, ademais)',
      'Mantenha a norma culta o texto inteiro',
      'Revise a pontuação antes de finalizar'
    ]
  },
  c2: {
    label: 'C2 — Compreensão do Tema',
    icon: '🎯',
    description: 'Compreender a proposta e aplicar conceitos das várias áreas de conhecimento.',
    whatWeCheck: 'Se o texto aborda o tema central, se há fuga ao tema, se usa repertório adequado.',
    tips: [
      'Leia a proposta 3 vezes antes de começar',
      'Nunca fuja do tema central proposto',
      'Relacione o tema com conhecimentos de outras áreas',
      'Use repertório sociocultural legitimado (autores, dados, filmes)'
    ]
  },
  c3: {
    label: 'C3 — Organização das Ideias',
    icon: '📐',
    description: 'Selecionar, relacionar, organizar e interpretar informações em defesa de um ponto de vista.',
    whatWeCheck: 'Estrutura do texto, progressão lógica, articulação entre parágrafos, coerência argumentativa.',
    tips: [
      'Use a estrutura: introdução → desenvolvimento (2 parágrafos) → conclusão',
      'Cada parágrafo deve ter uma ideia central',
      'Use conectivos entre parágrafos (Além disso, Outrossim, Por conseguinte)',
      'Sua tese deve ficar clara já na introdução'
    ]
  },
  c4: {
    label: 'C4 — Mecanismos Linguísticos',
    icon: '🔗',
    description: 'Demonstrar conhecimento dos mecanismos linguísticos necessários para a construção da argumentação.',
    whatWeCheck: 'Coesão textual, uso de conectivos, referências anafóricas, progressão textual.',
    tips: [
      'Varie os conectivos ao longo do texto',
      'Use pronomes para retomar ideias sem repetir palavras',
      'Mantenha a progressão: ideia nova → explicação → exemplo',
      'Evite parágrafos soltos sem conexão entre si'
    ]
  },
  c5: {
    label: 'C5 — Proposta de Intervenção',
    icon: '💡',
    description: 'Elaborar proposta de intervenção para o problema abordado, respeitando os direitos humanos.',
    whatWeCheck: 'Se há proposta, se é detalhada (agente, ação, meio, finalidade), se respeita direitos humanos.',
    tips: [
      'Sua proposta deve ter: O quê? Quem faz? Como? Para quê?',
      'Detalhe o agente (governo, sociedade, ONG, escola)',
      'Explique o meio ou instrumento (campanhas, leis, políticas)',
      'Nunca viole direitos humanos na sua proposta'
    ]
  }
};

// ════════════════════════════════════════════════════════════════════════════
// EXEMPLOS DE TRECHOS NOTA 1000
// ════════════════════════════════════════════════════════════════════════════

const EXEMPLOS_NOTA_1000 = [
  {
    tema: 'Desafios para a formação educacional no Brasil',
    trecho: 'Nesse contexto, percebe-se que a falta de investimentos em educação básica gera um ciclo vicioso de desigualdade. Conforme o sociólogo Pierre Bourdieu, a escola reproduz as desigualdades sociais ao privilegiar o capital cultural das classes dominantes. Logo, urge a necessidade de políticas públicas que democratizem o acesso ao conhecimento de qualidade.',
    destaque: 'Uso de repertório sociológico (Bourdieu) + tese clara + conectivo "Logo"'
  },
  {
    tema: 'Combate ao racismo estrutural no Brasil',
    trecho: 'Ademais, o racismo estrutural manifesta-se de forma sutil mas pervasiva na sociedade brasileira. Dados do IBGE (2019) revelam que jovens negros têm 2,5 vezes mais chances de serem vítimas de homicídio. Nesse sentido, medidas afirmativas como as cotas raciais representam um avanço civilizatório ao reparar séculos de exclusão.',
    destaque: 'Dado estatístico concreto (IBGE) + relação com políticas públicas + posicionamento claro'
  },
  {
    tema: 'Desafios do sistema prisional brasileiro',
    trecho: 'Diante desse cenário caótico, faz-se mister a atuação estatal não apenas como punidor, mas como agente ressocializador. O filósofo Michel Foucault, em "Vigiar e Punir", já alertava que o sistema prisional, ao invés de recuperar, fabrica delinquentes. Portanto, políticas de educação e trabalho dentro dos presídios são urgentes para romper esse ciclo.',
    destaque: 'Referência filosófica (Foucault) + verbo "faz-se mister" (erudição) + proposta clara'
  }
];

// ════════════════════════════════════════════════════════════════════════════
// CLASSE PROF. REDBOT
// ════════════════════════════════════════════════════════════════════════════

class ProfRedbot {
  constructor(aivos360Modules = {}) {
    this.modules = aivos360Modules;
    this.conversationHistory = [];
    this.isProcessing = false;
    this.chatContainer = null;
    this.messagesContainer = null;
    this.inputElement = null;
    this.sendButton = null;
    this.essayTextarea = null;
    this.isInitialized = false;
    this.currentTheme = null;
    this.lastScores = null;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // INICIALIZAÇÃO
  // ════════════════════════════════════════════════════════════════════════════

  init() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    console.log('[Prof. RedBot] 🤖 Robô Professor de Redação inicializado!');

    this.scheduleRender();

    window.addEventListener('aivos360DashboardReady', () => {
      this.renderUI();
      this.addDashboardButton();
    });
  }

  scheduleRender() {
    setTimeout(() => {
      this.renderUI();
      this.addDashboardButton();
    }, 100);
    setTimeout(() => {
      if (!this.chatContainer) {
        this.renderUI();
        this.addDashboardButton();
      }
    }, 1500);
  }

  setModules(modules) {
    this.modules = modules;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RENDERIZAÇÃO DA INTERFACE
  // ════════════════════════════════════════════════════════════════════════════

  renderUI() {
    let container = document.getElementById('prof-redbot-chat-area');
    if (!container) {
      container = this.createContainer();
    }
    if (!container) return;
    this.buildUI(container);
  }

  createContainer() {
    const dashboard = document.querySelector('.aivos360-dashboard');
    if (!dashboard) {
      console.warn('[Prof. RedBot] Dashboard não encontrado');
      return null;
    }
    const wrapper = document.createElement('div');
    wrapper.id = 'prof-redbot-chat-area';
    wrapper.className = 'prof-redbot-wrapper';
    dashboard.appendChild(wrapper);
    return wrapper;
  }

  buildUI(container) {
    container.innerHTML = `
      <!-- AVATAR SIDEBAR -->
      <div class="prof-redbot-sidebar">
        <div class="prof-redbot-avatar-area">
          <div class="prof-redbot-avatar">
            <div class="prof-redbot-avatar-glow"></div>
            <div class="prof-redbot-avatar-inner">
              <span class="prof-redbot-avatar-emoji">🤖</span>
            </div>
            <div class="prof-redbot-hat">🎓</div>
          </div>
          <h2 class="prof-redbot-name">Prof. RedBot</h2>
          <div class="prof-redbot-status">
            <span class="prof-redbot-dot"></span>
            Online — Professor de Redação
          </div>
          <p class="prof-redbot-bio">Robô professor especializado em redação para concursos. Notas 1000 é minha especialidade! 🤖📝</p>
        </div>
        <div class="prof-redbot-tools">
          <h3 class="prof-redbot-tools-title">🛠️ Ferramentas</h3>
          <button class="prof-redbot-tool-btn" onclick="window.profRedbotInstance?.handleToolAction('novo-tema')">
            <span class="prof-redbot-tool-icon">🎯</span>
            <span class="prof-redbot-tool-label">Novo Tema</span>
          </button>
          <button class="prof-redbot-tool-btn" onclick="window.profRedbotInstance?.handleToolAction('competencias')">
            <span class="prof-redbot-tool-icon">📋</span>
            <span class="prof-redbot-tool-label">Competências C1-C5</span>
          </button>
          <button class="prof-redbot-tool-btn" onclick="window.profRedbotInstance?.handleToolAction('exemplos')">
            <span class="prof-redbot-tool-icon">🏆</span>
            <span class="prof-redbot-tool-label">Exemplos Nota 1000</span>
          </button>
          <button class="prof-redbot-tool-btn" onclick="window.profRedbotInstance?.handleToolAction('progresso')">
            <span class="prof-redbot-tool-icon">📊</span>
            <span class="prof-redbot-tool-label">Meu Progresso</span>
          </button>
        </div>
        <div class="prof-redbot-stats">
          <div class="prof-redbot-stat">
            <span class="prof-redbot-stat-value">${this.conversationHistory.length}</span>
            <span class="prof-redbot-stat-label">Correções</span>
          </div>
          <div class="prof-redbot-stat">
            <span class="prof-redbot-stat-value">${this.lastScores ? Math.round(this.lastScores.media) : '—'}</span>
            <span class="prof-redbot-stat-label">Última Nota</span>
          </div>
        </div>
      </div>

      <!-- MAIN CHAT AREA -->
      <div class="prof-redbot-main">
        <div class="prof-redbot-chat">
          <div class="prof-redbot-messages" id="prof-redbot-messages">
            <div class="prof-redbot-welcome">
              <div class="prof-redbot-welcome-icon">🤖</div>
              <div class="prof-redbot-welcome-text">
                <strong>Olá! Eu sou o Prof. RedBot! 🎓</strong>
                <p>Seu robô professor especialista em redação para concursos públicos! Posso te ajudar com:</p>
              </div>
              <div class="prof-redbot-suggestions">
                <button class="prof-redbot-suggestion" onclick="window.profRedbotInstance?.addQuickMsg('Quero corrigir minha redação completa')">
                  📝 Corrigir Redação
                </button>
                <button class="prof-redbot-suggestion" onclick="window.profRedbotInstance?.handleToolAction('novo-tema')">
                  🎯 Novo Tema
                </button>
                <button class="prof-redbot-suggestion" onclick="window.profRedbotInstance?.addQuickMsg('Quero aprender sobre a Competência C1')">
                  📋 Saber Nota C1-C5
                </button>
                <button class="prof-redbot-suggestion" onclick="window.profRedbotInstance?.addQuickMsg('Quero ver exemplos de redações nota 1000')">
                  🏆 Ver Exemplos
                </button>
              </div>
            </div>
          </div>

          <!-- ESSAY TEXTAREA -->
          <div class="prof-redbot-editor">
            <textarea
              id="prof-redbot-essay-input"
              class="prof-redbot-essay-textarea"
              rows="6"
              placeholder="📝 Cole ou escreva sua redação completa aqui para correção...&#10;&#10;Você também pode enviar só a introdução, um parágrafo de desenvolvimento ou a conclusão para correção parcial."
              oninput="window.profRedbotInstance?.onEssayInput()"
            ></textarea>
            <div class="prof-redbot-editor-actions">
              <button class="prof-redbot-editor-btn prof-redbot-editor-clear" onclick="window.profRedbotInstance?.clearEssayTextarea()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Limpar
              </button>
              <span class="prof-redbot-editor-hint">Envie pela mensagem ou clique no botão ao lado</span>
              <button class="prof-redbot-editor-send" id="prof-redbot-essay-send" onclick="window.profRedbotInstance?.sendEssayFromEditor()" disabled>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                Corrigir Redação
              </button>
            </div>
          </div>

          <!-- CHAT INPUT -->
          <div class="prof-redbot-input-area">
            <textarea
              class="prof-redbot-input"
              id="prof-redbot-input"
              placeholder="Digite sua pergunta sobre redação..."
              rows="1"
              oninput="window.profRedbotInstance?.autoResize(this); window.profRedbotInstance?.onChatInput()"
              onkeydown="window.profRedbotInstance?.handleKeydown(event)"
            ></textarea>
            <button class="prof-redbot-send-btn" id="prof-redbot-send" onclick="window.profRedbotInstance?.sendFromChat()" disabled>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;

    this.chatContainer = container;
    this.messagesContainer = container.querySelector('#prof-redbot-messages');
    this.inputElement = container.querySelector('#prof-redbot-input');
    this.sendButton = container.querySelector('#prof-redbot-send');
    this.essayTextarea = container.querySelector('#prof-redbot-essay-input');
    this.essaySendBtn = container.querySelector('#prof-redbot-essay-send');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // DASHBOARD BUTTON
  // ════════════════════════════════════════════════════════════════════════════

  addDashboardButton() {
    if (document.getElementById('prof-redbot-dashboard-btn')) return;
    const dashboard = document.querySelector('.aivos360-dashboard');
    if (!dashboard) return;

    const btn = document.createElement('div');
    btn.id = 'prof-redbot-dashboard-btn';
    btn.className = 'prof-redbot-db-btn';
    btn.innerHTML = `
      <div class="prof-redbot-db-icon">🤖</div>
      <div class="prof-redbot-db-content">
        <strong class="prof-redbot-db-title">Prof. RedBot — Correção de Redação</strong>
        <span class="prof-redbot-db-subtitle">Robô professor especialista em redação nota 1000</span>
      </div>
      <div class="prof-redbot-db-arrow">→</div>
    `;
    btn.addEventListener('click', () => this.openChat());
    dashboard.insertBefore(btn, dashboard.firstChild);
  }

  openChat() {
    if (this.chatContainer) {
      this.chatContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => this.inputElement?.focus(), 500);
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // INPUT HANDLERS
  // ════════════════════════════════════════════════════════════════════════════

  onEssayInput() {
    if (this.essaySendBtn) {
      this.essaySendBtn.disabled = !this.essayTextarea?.value?.trim();
    }
  }

  onChatInput() {
    if (this.sendButton) {
      this.sendButton.disabled = !this.inputElement?.value?.trim();
    }
  }

  clearEssayTextarea() {
    if (this.essayTextarea) {
      this.essayTextarea.value = '';
      this.essaySendBtn.disabled = true;
    }
  }

  sendEssayFromEditor() {
    const text = this.essayTextarea?.value?.trim();
    if (!text || this.isProcessing) return;
    this.essayTextarea.value = '';
    this.essaySendBtn.disabled = true;
    this.processMessage(text);
  }

  sendFromChat() {
    const text = this.inputElement?.value?.trim();
    if (!text || this.isProcessing) return;
    this.inputElement.value = '';
    this.sendButton.disabled = true;
    this.autoResize(this.inputElement);
    this.processMessage(text);
  }

  handleKeydown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendFromChat();
    }
  }

  autoResize(textarea) {
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }

  addQuickMsg(text) {
    if (this.inputElement) {
      this.inputElement.value = text;
      this.sendButton.disabled = false;
      this.sendFromChat();
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // TOOL ACTIONS
  // ════════════════════════════════════════════════════════════════════════════

  handleToolAction(action) {
    switch (action) {
      case 'novo-tema':
        this.addQuickMsg('Quero um tema de redação para treinar');
        break;
      case 'competencias':
        this.showCompetenciesModal();
        break;
      case 'exemplos':
        this.addQuickMsg('Quero ver exemplos de redações nota 1000');
        break;
      case 'progresso':
        this.addQuickMsg('Quero ver meu progresso em redação');
        break;
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // COMPETÊNCIAS MODAL
  // ════════════════════════════════════════════════════════════════════════════

  showCompetenciesModal() {
    const overlay = document.createElement('div');
    overlay.className = 'prof-redbot-modal-overlay';
    overlay.innerHTML = `
      <div class="prof-redbot-modal">
        <div class="prof-redbot-modal-header">
          <h3 class="prof-redbot-modal-title">📋 Competências C1 a C5</h3>
          <button class="prof-redbot-modal-close" onclick="this.closest('.prof-redbot-modal-overlay').remove()">✕</button>
        </div>
        <div class="prof-redbot-modal-body">
          <p class="prof-redbot-modal-intro">No ENEM e na maioria dos concursos, a redação é corrigida por 5 competências. Cada uma vale até 200 pontos, totalizando 1000.</p>
          ${Object.values(COMPETENCIES).map(c => `
            <div class="prof-redbot-competence-card">
              <h4>${c.icon} ${c.label}</h4>
              <p>${c.description}</p>
              <p class="prof-redbot-competence-check"><strong>🔍 O que avaliamos:</strong> ${c.whatWeCheck}</p>
              <div class="prof-redbot-competence-tips">
                <strong>💡 Dicas:</strong>
                <ul>${c.tips.map(t => `<li>${t}</li>`).join('')}</ul>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('active'));
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PROCESSAMENTO DE MENSAGENS
  // ════════════════════════════════════════════════════════════════════════════

  async processMessage(userMessage) {
    if (this.isProcessing || !userMessage.trim()) return;

    this.isProcessing = true;
    this.setInputState(false);

    this.addMessage(userMessage, 'user');
    this.conversationHistory.push({ role: 'user', content: userMessage });

    // Detectar se é uma redação completa (texto longo)
    const isFullEssay = userMessage.length > 300;

    this.showTypingIndicator();

    try {
      let reply = await this.sendToAI(userMessage);

      this.hideTypingIndicator();
      await this.addTypingMessage(reply, 'coach');
      this.conversationHistory.push({ role: 'assistant', content: reply });

      // Tentar extrair scores da resposta
      this.extractScoresFromReply(reply);

      this.saveSession();

    } catch (error) {
      this.hideTypingIndicator();
      this.addMessage('Desculpe, ocorreu um erro. Pode tentar novamente?', 'coach');
      console.error('[Prof. RedBot] Erro:', error);
    }

    this.isProcessing = false;
    this.setInputState(true);
    this.scrollToBottom();
  }

  // ════════════════════════════════════════════════════════════════════════════
  // COMUNICAÇÃO COM IA + FALLBACK
  // ════════════════════════════════════════════════════════════════════════════

  async sendToAI(userMessage) {
    try {
      const response = await fetch(PROF_REDBOT_CONFIG.workerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'prof-redbot',
          message: userMessage,
          history: this.conversationHistory.slice(-8),
          studentData: this.getStudentData(),
          timestamp: Date.now()
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      return data.reply || 'Desculpe, não consegui processar sua solicitação. Pode tentar novamente?';
    } catch (error) {
      console.error('[Prof. RedBot] Erro na comunicação com IA:', error);
      return this.getFallback(userMessage);
    }
  }

  getFallback(userMessage) {
    const msg = userMessage.toLowerCase();

    // Redação completa
    if (userMessage.length > 300) {
      return this.generateLocalCorrection(userMessage);
    }

    // Temas
    if (msg.includes('tema') || msg.includes('redação nova') || msg.includes('novo tema')) {
      return this.generateRandomTheme();
    }

    // Competências
    if (msg.includes('c1') || msg.includes('competência') || msg.includes('competencia')) {
      return this.getCompetenciesResponse(msg);
    }

    // Exemplos nota 1000
    if (msg.includes('exemplo') || msg.includes('nota 1000') || msg.includes('nota mil')) {
      return this.getExamplesResponse(msg);
    }

    // Progresso
    if (msg.includes('progresso') || msg.includes('desempenho') || msg.includes('evolução')) {
      return this.getProgressResponse();
    }

    // Repertório
    if (msg.includes('repertório') || msg.includes('repertorio') || msg.includes('citação') || msg.includes('citacao') || msg.includes('referência')) {
      return this.getRepertoryResponse();
    }

    // Introdução, desenvolvimento, conclusão
    if (msg.includes('introdução') || msg.includes('introducao') || msg.includes('desenvolvimento') || msg.includes('conclusão') || msg.includes('conclusao')) {
      return `📝 **Vamos trabalhar essa parte da redação!**\n\nMande o texto que você já escreveu para essa parte que eu analiso com base nas competências:\n\n✅ **O que vou avaliar:**\n- Estrutura adequada\n- Coesão e coerência\n- Argumentação\n- Adequação ao tema\n- Vocabulário\n\n**👉 Envie o trecho que você escreveu!**`;
    }

    // Saudação
    if (msg.includes('olá') || msg.includes('oi') || msg.includes('bom dia') || msg.includes('boa tarde') || msg.includes('boa noite') || msg.includes('hey')) {
      return `🤖🎓 **Olá! Eu sou o Prof. RedBot!**\n\nSeu robô professor especialista em **redação para concursos!** Posso ajudar com:\n\n📝 **Corrigir sua redação** — Envie o texto completo ou em partes\n🎯 **Criar temas** — Temas personalizados pro seu concurso\n📋 **Explicar C1-C5** — Entenda cada competência\n🏆 **Exemplos Nota 1000** — Veja trechos de redações nota máxima\n📚 **Repertórios** — Sugestões de autores, dados e referências\n📊 **Análise de progresso** — Acompanhe sua evolução\n\n**👉 Como posso te ajudar hoje?** 🚀`;
    }

    return `🤖🎓 **Prof. RedBot aqui!**\n\nEntendi! Para te ajudar melhor, você pode:\n\n📝 **Enviar sua redação** completa ou em partes para eu corrigir\n🎯 Pedir um **tema de redação** personalizado\n📋 Perguntar sobre as **competências C1 a C5**\n🏆 Ver **exemplos de trechos nota 1000**\n📚 Pedir **sugestões de repertório**\n📊 Ver seu **progresso** em redação\n\n**👉 O que você prefere?**`;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // FALLBACK: CORREÇÃO LOCAL
  // ════════════════════════════════════════════════════════════════════════════

  generateLocalCorrection(text) {
    const wordCount = text.split(/\s+/).length;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
    const hasIntroduction = text.toLowerCase().includes('introdução') || text.toLowerCase().includes('introducao') || paragraphs.length >= 3;
    const hasConclusion = text.toLowerCase().includes('conclusão') || text.toLowerCase().includes('conclusao');
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());

    let reply = `🤖📝 **Análise do Prof. RedBot**\n\n`;
    reply += `📊 **Estatísticas do texto:**\n`;
    reply += `- ${wordCount} palavras\n`;
    reply += `- ${paragraphs.length} parágrafos\n`;
    reply += `- ${sentences.length} períodos\n\n`;

    reply += `**✅ Pontos positivos que notei:**\n`;
    if (wordCount >= 200) reply += `- ✅ Boa extensão de texto (${wordCount} palavras)\n`;
    if (paragraphs.length >= 3) reply += `- ✅ Estrutura de ${paragraphs.length} parágrafos bem definida\n`;
    if (hasIntroduction) reply += `- ✅ Você estruturou uma introdução\n`;
    if (hasConclusion) reply += `- ✅ Você incluiu uma conclusão\n`;

    reply += `\n**📋 Análise por Competência (estimativa local):**\n`;
    reply += `- **C1 (Domínio Formal):** Avalie ortografia, concordância e formalidade\n`;
    reply += `- **C2 (Tema):** Verifique se o tema central está claro\n`;
    reply += `- **C3 (Organização):** Estrutura com introdução, desenvolvimento e conclusão\n`;
    reply += `- **C4 (Coesão):** Observe o uso de conectivos entre parágrafos\n`;
    reply += `- **C5 (Intervenção):** Há proposta detalhada de intervenção?\n\n`;

    reply += `**💡 Sugestões de melhoria:**\n`;
    if (!hasIntroduction) reply += `- Comece com uma introdução clara apresentando sua tese\n`;
    if (!hasConclusion) reply += `- Finalize com uma conclusão e proposta de intervenção\n`;
    if (wordCount < 200) reply += `- O texto está curto — desenvolva melhor seus argumentos\n`;
    reply += `- Revise a pontuação e a concordância\n`;
    reply += `- Use conectivos variados (ademais, contudo, portanto)\n\n`;

    reply += `**👉 Próximos passos:**\n`;
    reply += `1️⃣ **Corrigir completo** — Envie de novo que posso dar notas C1-C5\n`;
    reply += `2️⃣ **Parte específica** — Quer focar em introdução, desenvolvimento ou conclusão?\n`;
    reply += `3️⃣ **Ver competências** — Quer entender melhor cada competência?\n`;

    return reply;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // FALLBACK: TEMA ALEATÓRIO
  // ════════════════════════════════════════════════════════════════════════════

  generateRandomTheme() {
    const temas = [
      { tema: 'Os desafios da saúde pública no Brasil pós-pandemia', area: 'Saúde' },
      { tema: 'A importância da educação digital na formação de jovens brasileiros', area: 'Educação' },
      { tema: 'O papel das redes sociais na formação da opinião pública', area: 'Comunicação' },
      { tema: 'Desafios para a preservação ambiental no século XXI', area: 'Meio Ambiente' },
      { tema: 'A desigualdade de gênero no mercado de trabalho brasileiro', area: 'Sociedade' },
      { tema: 'Os impactos da inteligência artificial no futuro do trabalho', area: 'Tecnologia' },
      { tema: 'A crise de refugiados e a responsabilidade humanitária', area: 'Direitos Humanos' },
      { tema: 'O envelhecimento populacional e as políticas públicas de assistência', area: 'Previdência' },
      { tema: 'A segurança pública como direito fundamental do cidadão', area: 'Segurança' },
      { tema: 'Os desafios da mobilidade urbana nas grandes cidades', area: 'Urbanismo' },
      { tema: 'A valorização da cultura brasileira como identidade nacional', area: 'Cultura' },
      { tema: 'Os impactos do trabalho remoto na saúde mental dos trabalhadores', area: 'Trabalho' }
    ];

    const selected = temas[Math.floor(Math.random() * temas.length)];
    return `🎯 **Tema de Redação — ${selected.area}**\n\n**"${selected.tema}"**\n\n📝 **Instruções:**\nEscreva uma redação dissertativa-argumentativa de 20 a 30 linhas sobre o tema acima. Lembre-se de:\n\n✅ **Estrutura obrigatória:**\n1. **Introdução** — Apresente o tema e sua tese\n2. **Desenvolvimento (2 parágrafos)** — Argumentos com repertório\n3. **Conclusão** — Proposta de intervenção detalhada\n\n✅ **Requisitos:**\n- Domínio da norma culta (C1)\n- Compreensão do tema (C2)\n- Organização das ideias (C3)\n- Coesão textual (C4)\n- Proposta de intervenção (C5)\n\n**👉 Quando terminar, cole sua redação aqui que eu corrijo!** 📝`;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // FALLBACK: COMPETÊNCIAS
  // ════════════════════════════════════════════════════════════════════════════

  getCompetenciesResponse(msg) {
    const text = msg.toLowerCase();
    let specific = null;

    for (const [key, comp] of Object.entries(COMPETENCIES)) {
      if (text.includes(key) || text.includes(`competência ${key.replace('c', '')}`) || text.includes(`competencia ${key.replace('c', '')}`)) {
        specific = comp;
        break;
      }
    }

    if (specific) {
      return `${specific.icon} **${specific.label}**\n\n${specific.description}\n\n🔍 **O que avaliamos:** ${specific.whatWeCheck}\n\n💡 **Dicas para melhorar:**\n${specific.tips.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\n**👉 Quer ver a próxima competência ou corrigir sua redação?**`;
    }

    let reply = `📋 **Competências C1 a C5 — Guia Completo**\n\n`;
    reply += `No ENEM e concursos, a redação vale 1000 pontos, divididos em **5 competências** de 200 pontos cada:\n\n`;
    for (const comp of Object.values(COMPETENCIES)) {
      reply += `${comp.icon} **${comp.label.split(' — ')[0]}** — ${comp.description.split('.')[0]}.\n`;
    }
    reply += `\n💡 **Dica do RedBot:** A maioria dos alunos perde pontos em C1 (domínio formal) e C5 (proposta de intervenção). Foco nessas duas pode subir sua nota rapidamente!\n\n**👉 Para ver detalhes de uma competência específica, digite o número (C1, C2, C3, C4 ou C5)!**`;
    return reply;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // FALLBACK: EXEMPLOS
  // ════════════════════════════════════════════════════════════════════════════

  getExamplesResponse(msg) {
    let reply = `🏆 **Exemplos de Trechos Nota 1000**\n\n`;
    reply += `Aqui estão exemplos reais (adaptados) de redações nota máxima. Observe os recursos usados:\n\n`;

    for (const ex of EXEMPLOS_NOTA_1000) {
      reply += `**Tema:** ${ex.tema}\n`;
      reply += `_"${ex.trecho}"_\n`;
      reply += `⭐ **Destaque:** ${ex.destaque}\n\n`;
    }

    reply += `💡 **Padrão nota 1000:**\n`;
    reply += `1. **Repertório legitimado** (autores, dados, filmes)\n`;
    reply += `2. **Conectivos sofisticados** (ademais, outrossim, por conseguinte)\n`;
    reply += `3. **Tese clara** já na introdução\n`;
    reply += `4. **Proposta detalhada** com agente, ação, meio e finalidade\n\n`;

    reply += `**👉 Quer treinar um tema? Peça "novo tema"!** 🎯`;
    return reply;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // FALLBACK: REPERTÓRIO
  // ════════════════════════════════════════════════════════════════════════════

  getRepertoryResponse() {
    return `📚 **Repertórios Socioculturais — Caixa de Ferramentas**\n\n` +
      `**📖 Autores e Pensadores:**\n` +
      `- Pierre Bourdieu — Capital cultural, reprodução social\n` +
      `- Michel Foucault — Poder disciplinar, biopolítica\n` +
      `- Zygmunt Bauman — Modernidade líquida, sociedade de consumo\n` +
      `- Hannah Arendt — Banalidade do mal, espaço público\n` +
      `- Paulo Freire — Educação libertadora, conscientização\n` +
      `- Milton Santos — Globalização, cidadania\n\n` +
      `**📊 Dados e Instituições:**\n` +
      `- IBGE — Dados demográficos, educacionais, econômicos\n` +
      `- IPEA — Pesquisas sobre políticas públicas\n` +
      `- ONU — ODS, direitos humanos, desenvolvimento\n` +
      `- UNESCO — Educação, cultura, ciência\n` +
      `- OMS — Saúde pública, epidemias\n\n` +
      `**🎬 Filmes e Documentários:**\n` +
      `- "Que horas ela volta?" — Desigualdade social e trabalho doméstico\n` +
      `- "Ilha das Flores" — Desigualdade e dignidade humana\n` +
      `- "O 13º" (Ava DuVernay) — Racismo estrutural e sistema prisional\n` +
      `- "Democracia em Vertigem" — Crise política e democracia\n\n` +
      `💡 **Dica:** Use UM repertório bem desenvolvido, não vários superficiais. Qualidade > quantidade!\n\n` +
      `**👉 Quer que eu sugira um repertório para um tema específico? Mande o tema!**`;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // FALLBACK: PROGRESSO
  // ════════════════════════════════════════════════════════════════════════════

  getProgressResponse() {
    const profile = this.getProfileData();
    return `📊 **Meu Progresso em Redação**\n\n` +
      `📝 **Total de redações corrigidas:** ${profile.totalEssays}\n` +
      `⭐ **Última nota:** ${this.lastScores ? this.lastScores.media + '/1000' : 'Nenhuma ainda'}\n` +
      `${this.lastScores ? `\n📋 **Detalhes por competência:**\n${Object.entries(this.lastScores.comp).map(([k, v]) => `- ${k.toUpperCase()}: ${v}/200`).join('\n')}` : ''}\n\n` +
      `💡 **Dica:** O segredo para uma redação nota 1000 é:\n` +
      `1️⃣ Praticar 1 redação por semana\n` +
      `2️⃣ Revisar os erros da correção anterior\n` +
      `3️⃣ Acumular repertório sociocultural\n` +
      `4️⃣ Treinar a conclusão com proposta de intervenção\n\n` +
      `**👉 Quer escrever sua primeira redação agora? Peça "novo tema"!** 🎯`;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // UTILITÁRIOS
  // ════════════════════════════════════════════════════════════════════════════

  getStudentData() {
    const twin = this.modules.digitalTwin;
    if (!twin) return 'Nenhum dado disponível ainda.';
    const profile = twin.getProfile();
    if (!profile) return 'Perfil do aluno ainda não iniciado.';

    const perf = profile.performance;
    const essays = perf?.essays || { total: 0, history: [] };

    return `DADOS DO ALUNO:
- Total de questões: ${perf?.questions?.total || 0}
- Acertos: ${perf?.questions?.correct || 0}
- Redações: ${essays.total || 0}
- Última nota: ${this.lastScores ? this.lastScores.media : 'N/A'}`;
  }

  getProfileData() {
    const twin = this.modules.digitalTwin;
    if (!twin) return { totalEssays: 0 };
    const profile = twin.getProfile();
    if (!profile) return { totalEssays: 0 };
    return {
      totalEssays: profile.performance?.essays?.total || 0
    };
  }

  extractScoresFromReply(reply) {
    // Regex para detectar notas no formato C1: 180, C2: 160, etc.
    const scoreRegex = /c([1-5])\s*[:=]\s*(\d{1,3})/gi;
    let match;
    const scores = {};
    while ((match = scoreRegex.exec(reply)) !== null) {
      scores[`c${match[1]}`] = parseInt(match[2]);
    }

    if (Object.keys(scores).length >= 3) {
      const media = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length * 5);
      this.lastScores = { comp: scores, media };
      this.saveSession();
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // MENSAGENS
  // ════════════════════════════════════════════════════════════════════════════

  addMessage(text, role = 'coach') {
    if (!this.messagesContainer) return;

    const welcome = this.messagesContainer.querySelector('.prof-redbot-welcome');
    if (welcome && role === 'user') welcome.remove();

    const msgDiv = document.createElement('div');
    msgDiv.className = `prof-redbot-msg prof-redbot-msg-${role}`;
    msgDiv.innerHTML = this.formatMessage(text);
    this.messagesContainer.appendChild(msgDiv);
    this.scrollToBottom();
  }

  async addTypingMessage(text, role = 'coach') {
    if (!this.messagesContainer) return;

    const welcome = this.messagesContainer.querySelector('.prof-redbot-welcome');
    if (welcome) welcome.remove();

    const msgDiv = document.createElement('div');
    msgDiv.className = `prof-redbot-msg prof-redbot-msg-${role}`;
    this.messagesContainer.appendChild(msgDiv);

    if (text.length > 800) {
      msgDiv.innerHTML = this.formatMessage(text);
    } else {
      await this.typeText(msgDiv, text);
    }

    this.scrollToBottom();
  }

  async typeText(element, text) {
    const formatted = this.formatMessage(text);
    let displayed = '';
    const chars = formatted.split('');

    for (let i = 0; i < chars.length; i++) {
      displayed += chars[i];
      element.innerHTML = displayed + '<span class="prof-redbot-cursor">|</span>';

      if (chars[i].match(/[.,!?;\n]/)) {
        await this.sleep(35);
      } else if (chars[i] === ' ') {
        await this.sleep(10);
      } else {
        await this.sleep(PROF_REDBOT_CONFIG.typingDelay);
      }
    }
    element.innerHTML = formatted;
  }

  formatMessage(text) {
    if (!text) return '';

    // Processar markdown-like syntax
    let html = text
      .replace(/^### (.+)$/gm, '<h3 class="prof-redbot-h3">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="prof-redbot-h2">$1</h2>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '\nPARABREAK\n');

    const lines = html.split('\n');
    const result = [];
    let inOl = false;
    let inUl = false;

    for (const line of lines) {
      const olMatch = line.match(/^(\d+)\.\s+(.+)$/);
      const ulMatch = line.match(/^[-—–]\s+(.+)$/);
      const isBreak = line === 'PARABREAK';

      if (olMatch) {
        if (!inOl) {
          if (inUl) { result.push('</ul>'); inUl = false; }
          result.push('<ol class="prof-redbot-ol">');
          inOl = true;
        }
        result.push(`<li>${olMatch[2]}</li>`);
      } else if (ulMatch) {
        if (!inUl) {
          if (inOl) { result.push('</ol>'); inOl = false; }
          result.push('<ul class="prof-redbot-ul">');
          inUl = true;
        }
        result.push(`<li>${ulMatch[1]}</li>`);
      } else {
        if (inOl) { result.push('</ol>'); inOl = false; }
        if (inUl) { result.push('</ul>'); inUl = false; }
        if (isBreak) {
          result.push('</p><p class="prof-redbot-p">');
        } else if (line.trim()) {
          result.push(line);
        }
      }
    }

    if (inOl) result.push('</ol>');
    if (inUl) result.push('</ul>');

    html = result.join('\n');

    if (!html.startsWith('<h') && !html.startsWith('<ol') && !html.startsWith('<ul')) {
      html = '<p class="prof-redbot-p">' + html + '</p>';
    }

    return html;
  }

  showTypingIndicator() {
    if (!this.messagesContainer) return;
    const indicator = document.createElement('div');
    indicator.className = 'prof-redbot-msg prof-redbot-msg-coach prof-redbot-typing';
    indicator.id = 'prof-redbot-typing';
    indicator.innerHTML = '<span class="prof-redbot-typing-dots"><span></span><span></span><span></span></span>';
    this.messagesContainer.appendChild(indicator);
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    const el = document.getElementById('prof-redbot-typing');
    if (el) el.remove();
  }

  setInputState(enabled) {
    if (this.inputElement) this.inputElement.disabled = !enabled;
    if (this.sendButton) this.sendButton.disabled = !enabled;
  }

  scrollToBottom() {
    if (this.messagesContainer) {
      requestAnimationFrame(() => {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
      });
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  saveSession() {
    try {
      const session = {
        history: this.conversationHistory.slice(-20),
        lastScores: this.lastScores,
        timestamp: Date.now()
      };
      localStorage.setItem('profRedbotSession', JSON.stringify(session));
    } catch (e) {
      console.warn('[Prof. RedBot] Erro ao salvar sessão:', e);
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RELATÓRIO
  // ════════════════════════════════════════════════════════════════════════════

  generateReport() {
    let report = '=== 🤖 RELATÓRIO PROF. REDBOT ===\n\n';
    report += `Total de mensagens: ${this.conversationHistory.length}\n`;
    report += `Última nota: ${this.lastScores ? this.lastScores.media + '/1000' : 'N/A'}\n\n`;
    report += '=== ÚLTIMAS CORREÇÕES ===\n';
    const recent = this.conversationHistory.slice(-6);
    for (let i = 0; i < recent.length; i += 2) {
      if (recent[i]) report += `\n👤 Aluno: ${recent[i].content.slice(0, 80)}...\n`;
      if (recent[i + 1]) report += `🤖 RedBot: ${recent[i + 1].content.slice(0, 80)}...\n`;
    }
    return report;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// INSTÂNCIA GLOBAL
// ════════════════════════════════════════════════════════════════════════════

let profRedbotInstance = null;

function initProfRedbot(aivos360Modules = {}) {
  if (!profRedbotInstance) {
    profRedbotInstance = new ProfRedbot(aivos360Modules);
    profRedbotInstance.init();
  } else if (Object.keys(aivos360Modules).length > 0) {
    profRedbotInstance.setModules(aivos360Modules);
  }
  return profRedbotInstance;
}

function getProfRedbot() {
  return profRedbotInstance;
}

if (typeof window !== 'undefined') {
  window.ProfRedbot = ProfRedbot;
  window.initProfRedbot = initProfRedbot;
  window.getProfRedbot = getProfRedbot;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ProfRedbot, initProfRedbot, getProfRedbot };
}
