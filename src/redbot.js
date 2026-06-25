/**
 * 🤖 COACH REDBOT — Robô Coach de Redação para Concursos Públicos
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

const REDBOT_CONFIG = {
  workerUrl: 'https://studymaster-worker.cesarmuniz0816.workers.dev',
  maxHistoryLength: 50,
  typingDelay: 18,
  siteDomain: 'https://studymaster-agent.pages.dev'
};

// ════════════════════════════════════════════════════════════════════════════
// SYSTEM PROMPT DO COACH REDBOT
// ════════════════════════════════════════════════════════════════════════════

const COACH_REDBOT_SYSTEM_PROMPT = `Você é o **Coach RedBot**, um robô coach super simpático, paciente e especialista em redação para concursos públicos. Você usa um chapéu de professor e tem personalidade amigável, como um bom professor que explica tudo de forma clara.

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

Sempre termine sua resposta com 2 ou 3 sugestões claras de próximo passo.

Você é o Coach RedBot, o robô coach que mora no site e está sempre pronto para ajudar!

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
// CLASSE COACH REDBOT
// ════════════════════════════════════════════════════════════════════════════

class CoachRedbot {
  constructor(aivos360Modules = {}) {
    this.modules = aivos360Modules;
    this.conversationHistory = [];
    this.isProcessing = false;
    this.chatWrapper = null;
    this.messagesContainer = null;
    this.inputElement = null;
    this.sendButton = null;
    this.essayTextarea = null;
    this.essaySendBtn = null;
    this.isInitialized = false;
    this.lastScores = null;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // INICIALIZAÇÃO
  // ════════════════════════════════════════════════════════════════════════════

  init() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    console.log('[Coach RedBot] 🤖 Robô Coach de Redação inicializado!');

    this.loadSession();
    this.scheduleRender();

    window.addEventListener('aivos360DashboardReady', () => {
      this.renderUI();
      this.addDashboardButton();
    });
  }

  scheduleRender() {
    // Tentativas com timeout progressivo
    const tryRender = (delay) => {
      setTimeout(() => {
        const dashboard = document.querySelector('.aivos360-dashboard');
        if (dashboard && !this.chatWrapper) {
          this.renderUI();
          this.addDashboardButton();
        }
      }, delay);
    };
    tryRender(100);
    tryRender(1000);
    tryRender(3000);
    tryRender(6000);

    // MutationObserver como fallback robusto
    if (!this._observer && typeof MutationObserver !== 'undefined') {
      this._observer = new MutationObserver(() => {
        const dashboard = document.querySelector('.aivos360-dashboard');
        if (dashboard && !this.chatWrapper) {
          this.renderUI();
          this.addDashboardButton();
        }
      });
      this._observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  setModules(modules) {
    this.modules = modules;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PERSISTÊNCIA DE SESSÃO
  // ════════════════════════════════════════════════════════════════════════════

  saveSession() {
    try {
      const session = {
        history: this.conversationHistory.slice(-20),
        lastScores: this.lastScores,
        timestamp: Date.now()
      };
      localStorage.setItem('coachRedbotSession', JSON.stringify(session));
    } catch (e) {
      console.warn('[Coach RedBot] Erro ao salvar sessão:', e);
    }
  }

  loadSession() {
    try {
      const saved = localStorage.getItem('coachRedbotSession');
      if (saved) {
        const session = JSON.parse(saved);
        if (session.timestamp && Date.now() - session.timestamp < 86400000) {
          this.conversationHistory = session.history || [];
          this.lastScores = session.lastScores || null;
          console.log('[Coach RedBot] Sessão restaurada com', this.conversationHistory.length, 'mensagens');
        }
      }
    } catch (e) {
      console.warn('[Coach RedBot] Erro ao carregar sessão:', e);
    }
  }

  clearSession() {
    this.conversationHistory = [];
    this.lastScores = null;
    localStorage.removeItem('coachRedbotSession');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RENDERIZAÇÃO DA UI (NOVO LAYOUT)
  // ════════════════════════════════════════════════════════════════════════════

  renderUI() {
    let container = document.getElementById('coach-redbot-area');
    if (!container) {
      container = this.createContainer();
    }
    if (!container) return;
    this.buildUI(container);
  }

  createContainer() {
    const dashboard = document.querySelector('.aivos360-dashboard');
    if (!dashboard) return null;
    const wrapper = document.createElement('div');
    wrapper.id = 'coach-redbot-area';
    wrapper.className = 'redbot-wrapper';
    dashboard.appendChild(wrapper);
    return wrapper;
  }

  buildUI(container) {
    container.innerHTML = `
      <div class="redbot-layout">

        <!-- SIDEBAR - Coach RedBot Avatar -->
        <div class="redbot-sidebar">
          <div class="redbot-sidebar-inner">
            <div class="redbot-avatar">
              <img src="redbot-avatar.svg" alt="Coach RedBot" class="redbot-avatar-img" onerror="this.src='redbot-avatar.png'; this.onerror=function(){this.style.display='none'; this.nextElementSibling.style.display='flex'}">
              <div class="redbot-avatar-fallback" style="display:none">
                <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="45" width="60" height="40" rx="8" fill="url(#rb-grad)" stroke="currentColor" stroke-width="2"/><rect x="28" y="52" width="8" height="12" rx="2" fill="rgba(255,255,255,0.3)"/><rect x="40" y="52" width="8" height="12" rx="2" fill="rgba(255,255,255,0.3)"/><rect x="52" y="52" width="8" height="12" rx="2" fill="rgba(255,255,255,0.3)"/><rect x="64" y="52" width="8" height="12" rx="2" fill="rgba(255,255,255,0.3)"/><circle cx="50" cy="52" r="3" fill="currentColor" opacity="0.5"/><circle cx="30" cy="30" r="22" fill="url(#rb-grad)" stroke="currentColor" stroke-width="2"/><circle cx="23" cy="26" r="4" fill="white"/><circle cx="25" cy="25" r="2" fill="currentColor"/><circle cx="37" cy="26" r="4" fill="white"/><circle cx="39" cy="25" r="2" fill="currentColor"/><path d="M30 38 Q34 42 38 38" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/><line x1="50" y1="16" x2="50" y2="8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="50" cy="6" r="4" fill="currentColor"/><circle cx="49" cy="5" r="1.5" fill="white"/><path d="M22 10l28-14 28 14-28 14z" fill="url(#rb-grad2)" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M50 10v6" stroke="currentColor" stroke-width="1.5"/><path d="M72 14l6-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="79" cy="11" r="2" fill="currentColor"/><defs><linearGradient id="rb-grad" x1="0" y1="0" x2="100" y2="100"><stop offset="0%" stop-color="var(--color-primary)"/><stop offset="100%" stop-color="var(--color-primary-mid)"/></linearGradient><linearGradient id="rb-grad2" x1="0" y1="0" x2="100" y2="0"><stop offset="0%" stop-color="var(--color-primary-mid)"/><stop offset="100%" stop-color="var(--color-primary)"/></linearGradient></defs></svg>
              </div>
              <div class="redbot-hat"><svg width="18" height="18" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 45 L50 15 L90 45 L50 75 Z" fill="url(#hat-grad)" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M50 15 L50 55" stroke="currentColor" stroke-width="1.5"/><path d="M30 35 Q50 30 70 35" stroke="currentColor" stroke-width="1" fill="none" opacity="0.5"/><rect x="40" y="65" width="20" height="10" rx="2" fill="url(#hat-grad)" stroke="currentColor" stroke-width="1.5"/><rect x="35" y="73" width="30" height="6" rx="2" fill="url(#hat-grad2)" stroke="currentColor" stroke-width="1"/><path d="M90 45 L96 40" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="97" cy="39" r="3" fill="currentColor"/><path d="M15 55 L10 80 Q10 85 15 88 L30 85" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.6"/><path d="M12 60 L8 78" stroke="currentColor" stroke-width="1" opacity="0.3" stroke-linecap="round"/><path d="M18 58 L16 82" stroke="currentColor" stroke-width="1" opacity="0.3" stroke-linecap="round"/><defs><linearGradient id="hat-grad" x1="0" y1="0" x2="100" y2="100"><stop offset="0%" stop-color="var(--color-primary)"/><stop offset="100%" stop-color="var(--color-primary-mid)"/></linearGradient><linearGradient id="hat-grad2" x1="0" y1="0" x2="100" y2="0"><stop offset="0%" stop-color="var(--color-primary-mid)"/><stop offset="100%" stop-color="var(--color-primary)"/></linearGradient></defs></svg></div>
            </div>

            <h2 class="redbot-name">
              Coach RedBot <span class="redbot-name-hat"><svg <svg width="14" height="14" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 45 L50 15 L90 45 L50 75 Z" fill="url(#hat-grad)" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M50 15 L50 55" stroke="currentColor" stroke-width="1.5"/><path d="M30 35 Q50 30 70 35" stroke="currentColor" stroke-width="1" fill="none" opacity="0.5"/><rect x="40" y="65" width="20" height="10" rx="2" fill="url(#hat-grad)" stroke="currentColor" stroke-width="1.5"/><rect x="35" y="73" width="30" height="6" rx="2" fill="url(#hat-grad2)" stroke="currentColor" stroke-width="1"/><path d="M90 45 L96 40" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="97" cy="39" r="3" fill="currentColor"/><path d="M15 55 L10 80 Q10 85 15 88 L30 85" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.6"/><path d="M12 60 L8 78" stroke="currentColor" stroke-width="1" opacity="0.3" stroke-linecap="round"/><path d="M18 58 L16 82" stroke="currentColor" stroke-width="1" opacity="0.3" stroke-linecap="round"/><defs><linearGradient id="hat-grad" x1="0" y1="0" x2="100" y2="100"><stop offset="0%" stop-color="var(--color-primary)"/><stop offset="100%" stop-color="var(--color-primary-mid)"/></linearGradient><linearGradient id="hat-grad2" x1="0" y1="0" x2="100" y2="0"><stop offset="0%" stop-color="var(--color-primary-mid)"/><stop offset="100%" stop-color="var(--color-primary)"/></linearGradient></defs></svg></span>
            </h2>

            <div class="redbot-status">
              <span class="redbot-status-dot"></span>
              Online - Pronto para te ajudar
            </div>

            <p class="redbot-bio">
              Olá! Sou o Coach RedBot, seu robô coach de redação.<br>
              Vamos tirar nota 1000 juntos? 🚀
            </p>

            <button class="redbot-new-theme-btn" onclick="window.coachRedbot?.handleTool('novo-tema')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 12h-4M12 8v8"/></svg> Novo Tema de Redação
            </button>

            <div class="redbot-divider"></div>

            <div class="redbot-tools">
              <button class="redbot-tool-btn" onclick="window.coachRedbot?.handleTool('competencias')">
                <span class="redbot-tool-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 14h6M9 18h6M12 10h.01"/></svg></span>
                <span class="redbot-tool-label">Ver Competências C1 a C5</span>
              </button>
              <button class="redbot-tool-btn" onclick="window.coachRedbot?.addQuickMsg('Quero ver exemplos de redações nota 1000')">
                <span class="redbot-tool-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg></span>
                <span class="redbot-tool-label">Exemplos de Redações Nota 1000</span>
              </button>
              <button class="redbot-tool-btn" onclick="window.coachRedbot?.addQuickMsg('Quero repertórios atualizados para redação')">
                <span class="redbot-tool-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="M8 7h8M8 11h6"/></svg></span>
                <span class="redbot-tool-label">Repertórios Atualizados</span>
              </button>
              <button class="redbot-tool-btn" onclick="window.coachRedbot?.addQuickMsg('Quero ver meu plano de evolução em redação')">
                <span class="redbot-tool-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 16v-3M12 16v-6M17 16V8"/></svg></span>
                <span class="redbot-tool-label">Meu Plano de Evolução</span>
              </button>
            </div>

            <div class="redbot-tip">
              <p class="redbot-tip-label"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg> Dica do dia:</p>
              <p class="redbot-tip-text">"Uma boa proposta de intervenção deve ser viável, detalhada e conectada com os argumentos."</p>
            </div>
          </div>
        </div>

        <!-- MAIN - Chat Area -->
        <div class="redbot-main">
          <button class="redbot-sidebar-toggle" onclick="window.coachRedbot?.toggleSidebar()" aria-label="Abrir menu da sidebar" title="Menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            <span>Menu</span>
          </button>
          <!-- Sidebar Overlay (mobile) -->
          <div class="redbot-sidebar-overlay" onclick="window.coachRedbot?.closeSidebar()"></div>
          <div class="redbot-chat-card">
            <div class="redbot-messages" id="redbot-messages">
              <div class="redbot-welcome">
                <div class="redbot-welcome-avatar"><svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="45" width="60" height="40" rx="8" fill="url(#rb-grad)" stroke="currentColor" stroke-width="2"/><rect x="28" y="52" width="8" height="12" rx="2" fill="rgba(255,255,255,0.3)"/><rect x="40" y="52" width="8" height="12" rx="2" fill="rgba(255,255,255,0.3)"/><rect x="52" y="52" width="8" height="12" rx="2" fill="rgba(255,255,255,0.3)"/><rect x="64" y="52" width="8" height="12" rx="2" fill="rgba(255,255,255,0.3)"/><circle cx="50" cy="52" r="3" fill="currentColor" opacity="0.5"/><circle cx="30" cy="30" r="22" fill="url(#rb-grad)" stroke="currentColor" stroke-width="2"/><circle cx="23" cy="26" r="4" fill="white"/><circle cx="25" cy="25" r="2" fill="currentColor"/><circle cx="37" cy="26" r="4" fill="white"/><circle cx="39" cy="25" r="2" fill="currentColor"/><path d="M30 38 Q34 42 38 38" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/><line x1="50" y1="16" x2="50" y2="8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="50" cy="6" r="4" fill="currentColor"/><circle cx="49" cy="5" r="1.5" fill="white"/><path d="M22 10l28-14 28 14-28 14z" fill="url(#rb-grad2)" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M50 10v6" stroke="currentColor" stroke-width="1.5"/><path d="M72 14l6-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="79" cy="11" r="2" fill="currentColor"/><defs><linearGradient id="rb-grad" x1="0" y1="0" x2="100" y2="100"><stop offset="0%" stop-color="var(--color-primary)"/><stop offset="100%" stop-color="var(--color-primary-mid)"/></linearGradient><linearGradient id="rb-grad2" x1="0" y1="0" x2="100" y2="0"><stop offset="0%" stop-color="var(--color-primary-mid)"/><stop offset="100%" stop-color="var(--color-primary)"/></linearGradient></defs></svg></div>
                <div class="redbot-welcome-content">
                  <p class="redbot-welcome-name">Coach RedBot</p>
                  <p class="redbot-welcome-text">Olá! Cole sua redação ou me diga o tema que você quer treinar hoje. Estou aqui para te ajudar passo a passo! 🎯</p>
                </div>
              </div>
            </div>

            <div class="redbot-editor-area">
              <textarea
                id="redbot-essay-input"
                class="redbot-essay-textarea"
                rows="6"
                placeholder="Escreva ou cole sua redação aqui..."
                oninput="window.coachRedbot?.onEssayChange()"
              ></textarea>

              <div class="redbot-editor-actions">
                <button class="redbot-editor-btn redbot-editor-btn-primary" onclick="window.coachRedbot?.sendEssay()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg> Enviar para Correção
                </button>
                <button class="redbot-editor-btn redbot-editor-btn-secondary" onclick="window.coachRedbot?.addQuickMsg('Quero analisar minha redação por partes')">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg> Analisar por Partes
                </button>
              </div>
            </div>

            <div class="redbot-input-area">
              <textarea
                class="redbot-input"
                id="redbot-input"
                placeholder="Digite sua mensagem para o Coach RedBot..."
                rows="1"
                oninput="window.coachRedbot?.autoResize(this); window.coachRedbot?.onInputChange()"
                onkeydown="window.coachRedbot?.handleKeydown(event)"
              ></textarea>
              <button class="redbot-send-btn" id="redbot-send" onclick="window.coachRedbot?.sendFromInput()" disabled>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>
        </div>

      </div>
    `;

    this.chatWrapper = container;
    this.messagesContainer = container.querySelector('#redbot-messages');
    this.inputElement = container.querySelector('#redbot-input');
    this.sendButton = container.querySelector('#redbot-send');
    this.essayTextarea = container.querySelector('#redbot-essay-input');
    this.essaySendBtn = container.querySelector('#redbot-essay-send');

    // Mobile sidebar toggle references
    this.sidebarEl = container.querySelector('.redbot-sidebar');
    this.toggleBtn = container.querySelector('.redbot-sidebar-toggle');
    this.sidebarOverlay = container.querySelector('.redbot-sidebar-overlay');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SIDEBAR TOGGLE (MOBILE)
  // ════════════════════════════════════════════════════════════════════════════

  toggleSidebar() {
    if (!this.sidebarEl) return;
    const isOpen = this.sidebarEl.classList.toggle('open');
    if (this.sidebarOverlay) {
      this.sidebarOverlay.classList.toggle('visible', isOpen);
    }
    document.body.classList.toggle('redbot-sidebar-open', isOpen);
    if (this.toggleBtn) {
      this.toggleBtn.setAttribute('aria-expanded', isOpen);
      this.toggleBtn.innerHTML = isOpen
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg><span>Fechar</span>'
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg><span>Menu</span>';
    }
  }

  closeSidebar() {
    if (!this.sidebarEl) return;
    this.sidebarEl.classList.remove('open');
    if (this.sidebarOverlay) {
      this.sidebarOverlay.classList.remove('visible');
    }
    document.body.classList.remove('redbot-sidebar-open');
    if (this.toggleBtn) {
      this.toggleBtn.setAttribute('aria-expanded', 'false');
      this.toggleBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg><span>Menu</span>';
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // DASHBOARD BUTTON
  // ════════════════════════════════════════════════════════════════════════════

  addDashboardButton() {
    if (document.getElementById('coach-redbot-db-btn')) return;
    const dashboard = document.querySelector('.aivos360-dashboard');
    if (!dashboard) return;

    const btn = document.createElement('div');
    btn.id = 'coach-redbot-db-btn';
    btn.className = 'redbot-db-btn';
    btn.innerHTML = `
      <div class="redbot-db-icon"><svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="45" width="60" height="40" rx="8" fill="url(#rb-grad)" stroke="currentColor" stroke-width="2"/><rect x="28" y="52" width="8" height="12" rx="2" fill="rgba(255,255,255,0.3)"/><rect x="40" y="52" width="8" height="12" rx="2" fill="rgba(255,255,255,0.3)"/><rect x="52" y="52" width="8" height="12" rx="2" fill="rgba(255,255,255,0.3)"/><rect x="64" y="52" width="8" height="12" rx="2" fill="rgba(255,255,255,0.3)"/><circle cx="50" cy="52" r="3" fill="currentColor" opacity="0.5"/><circle cx="30" cy="30" r="22" fill="url(#rb-grad)" stroke="currentColor" stroke-width="2"/><circle cx="23" cy="26" r="4" fill="white"/><circle cx="25" cy="25" r="2" fill="currentColor"/><circle cx="37" cy="26" r="4" fill="white"/><circle cx="39" cy="25" r="2" fill="currentColor"/><path d="M30 38 Q34 42 38 38" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/><line x1="50" y1="16" x2="50" y2="8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="50" cy="6" r="4" fill="currentColor"/><circle cx="49" cy="5" r="1.5" fill="white"/><path d="M22 10l28-14 28 14-28 14z" fill="url(#rb-grad2)" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M50 10v6" stroke="currentColor" stroke-width="1.5"/><path d="M72 14l6-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="79" cy="11" r="2" fill="currentColor"/><defs><linearGradient id="rb-grad" x1="0" y1="0" x2="100" y2="100"><stop offset="0%" stop-color="var(--color-primary)"/><stop offset="100%" stop-color="var(--color-primary-mid)"/></linearGradient><linearGradient id="rb-grad2" x1="0" y1="0" x2="100" y2="0"><stop offset="0%" stop-color="var(--color-primary-mid)"/><stop offset="100%" stop-color="var(--color-primary)"/></linearGradient></defs></svg></div>
      <div class="redbot-db-content">
        <strong class="redbot-db-title">Coach RedBot — Correção de Redação</strong>
        <span class="redbot-db-subtitle">Robô coach especialista em redação nota 1000</span>
      </div>
      <div class="redbot-db-arrow">→</div>
    `;
    btn.addEventListener('click', () => this.openChat());
    dashboard.insertBefore(btn, dashboard.firstChild);
  }

  openChat() {
    if (this.chatWrapper) {
      this.chatWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => this.inputElement?.focus(), 500);
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // INPUT HANDLERS
  // ════════════════════════════════════════════════════════════════════════════

  onEssayChange() {
    // Habilita botões baseado no conteúdo
  }

  onInputChange() {
    if (this.sendButton) {
      this.sendButton.disabled = !this.inputElement?.value?.trim();
    }
  }

  sendEssay() {
    const text = this.essayTextarea?.value?.trim();
    if (!text || this.isProcessing) return;
    this.processMessage(text);
  }

  sendFromInput() {
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
      this.sendFromInput();
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
      this.sendFromInput();
    }
  }

  handleTool(action) {
    switch (action) {
      case 'novo-tema':
        this.addQuickMsg('Quero um tema de redação para treinar');
        break;
      case 'competencias':
        this.showCompetenciesModal();
        break;
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // COMPETÊNCIAS MODAL
  // ════════════════════════════════════════════════════════════════════════════

  showCompetenciesModal() {
    const overlay = document.createElement('div');
    overlay.className = 'redbot-modal-overlay';
    overlay.innerHTML = `
      <div class="redbot-modal">
        <div class="redbot-modal-h">
          <h3 class="redbot-modal-title">📋 Competências C1 a C5</h3>
          <button class="redbot-modal-x" onclick="this.closest('.redbot-modal-overlay').remove()">✕</button>
        </div>
        <div class="redbot-modal-body">
          <p class="redbot-modal-intro">No ENEM e na maioria dos concursos, a redação é corrigida por 5 competências. Cada uma vale até 200 pontos, totalizando 1000.</p>
          ${Object.values(COMPETENCIES).map(c => `
            <div class="redbot-comp-card">
              <h4>${c.icon} ${c.label}</h4>
              <p>${c.description}</p>
              <p class="redbot-comp-check"><strong>🔍 O que avaliamos:</strong> ${c.whatWeCheck}</p>
              <div class="redbot-comp-tips">
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

    this.showTypingIndicator();

    try {
      let reply = await this.sendToAI(userMessage);

      this.hideTypingIndicator();
      await this.addTypingMessage(reply, 'coach');
      this.conversationHistory.push({ role: 'assistant', content: reply });

      this.extractScoresFromReply(reply);
      this.saveSession();

    } catch (error) {
      this.hideTypingIndicator();
      this.addMessage('Desculpe, ocorreu um erro. Pode tentar novamente?', 'coach');
      console.error('[Coach RedBot] Erro:', error);
    }

    this.isProcessing = false;
    this.setInputState(true);
    this.inputElement?.focus();
    this.scrollToBottom();
  }

  // ════════════════════════════════════════════════════════════════════════════
  // COMUNICAÇÃO COM IA + FALLBACK
  // ════════════════════════════════════════════════════════════════════════════

  async sendToAI(userMessage) {
    try {
      const response = await fetch(REDBOT_CONFIG.workerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'redbot',
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
      console.error('[Coach RedBot] Erro na comunicação com IA:', error);
      return this.getFallback(userMessage);
    }
  }

  getFallback(userMessage) {
    const msg = userMessage.toLowerCase();

    if (userMessage.length > 300) {
      return this.localCorrection(userMessage);
    }

    if (msg.includes('tema') || msg.includes('redação nova') || msg.includes('novo tema')) {
      return this.generateRandomTheme();
    }

    if (msg.includes('c1') || msg.includes('c2') || msg.includes('c3') || msg.includes('c4') || msg.includes('c5') || msg.includes('competência')) {
      return this.getCompetenciesResponse(msg);
    }

    if (msg.includes('exemplo') || msg.includes('nota 1000') || msg.includes('nota mil')) {
      return this.getExamplesResponse();
    }

    if (msg.includes('progresso') || msg.includes('desempenho') || msg.includes('evolução') || msg.includes('plano')) {
      return this.getProgressResponse();
    }

    if (msg.includes('repertório') || msg.includes('repertorio') || msg.includes('citação') || msg.includes('referência')) {
      return this.getRepertoryResponse();
    }

    if (msg.includes('introdução') || msg.includes('desenvolvimento') || msg.includes('conclusão')) {
      return `📝 **Vamos trabalhar essa parte da redação!**\n\nMande o texto que você já escreveu para essa parte que eu analiso com base nas competências:\n\n✅ **O que vou avaliar:**\n- Estrutura adequada\n- Coesão e coerência\n- Argumentação\n- Adequação ao tema\n\n**👉 Envie o trecho que você escreveu!**`;
    }

    if (msg.includes('olá') || msg.includes('oi') || msg.includes('bom dia') || msg.includes('boa tarde') || msg.includes('boa noite')) {
      return `🤖🎓 **Olá! Eu sou o Coach RedBot!**\n\nSeu robô coach especialista em **redação para concursos!** Posso ajudar com:\n\n📝 **Corrigir sua redação** — Envie o texto completo\n🎯 **Criar temas** — Temas personalizados\n📋 **Explicar C1-C5** — Entenda cada competência\n🏆 **Exemplos Nota 1000** — Trechos nota máxima\n📚 **Repertórios** — Autores, dados e filmes\n📊 **Análise de progresso** — Acompanhe sua evolução\n\n**👉 Como posso te ajudar hoje?** 🚀`;
    }

    return `🤖🎓 **Coach RedBot aqui!**\n\nEntendi! Para te ajudar melhor:\n\n📝 **Envie sua redação** completa ou em partes para correção\n🎯 Peça um **tema de redação**\n📋 Pergunte sobre as **competências C1 a C5**\n🏆 Veja **exemplos nota 1000**\n📚 Peça **repertórios**\n\n**👉 O que você prefere?**`;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // FALLBACK: CORREÇÃO LOCAL
  // ════════════════════════════════════════════════════════════════════════════

  localCorrection(text) {
    const wordCount = text.split(/\s+/).length;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
    const hasIntro = text.toLowerCase().includes('introdução') || text.toLowerCase().includes('introducao') || paragraphs.length >= 3;
    const hasConc = text.toLowerCase().includes('conclusão') || text.toLowerCase().includes('conclusao');

    let r = `🤖📝 **Análise do Coach RedBot**\n\n`;
    r += `📊 **Estatísticas:**\n- ${wordCount} palavras\n- ${paragraphs.length} parágrafos\n\n`;
    r += `**✅ Pontos positivos:**\n`;
    if (wordCount >= 200) r += `- ✅ Boa extensão (${wordCount} palavras)\n`;
    if (paragraphs.length >= 3) r += `- ✅ ${paragraphs.length} parágrafos\n`;
    if (hasIntro) r += `- ✅ Estrutura com introdução\n`;
    if (hasConc) r += `- ✅ Inclui conclusão\n`;

    r += `\n**📋 Por competência:**\n`;
    r += `- **C1:** Avalie ortografia, concordância e formalidade\n`;
    r += `- **C2:** O tema central está claro?\n`;
    r += `- **C3:** Introdução, desenvolvimento e conclusão\n`;
    r += `- **C4:** Uso de conectivos\n`;
    r += `- **C5:** Proposta de intervenção?\n\n`;

    r += `**💡 Sugestões:**\n`;
    if (!hasIntro) r += `- Comece com introdução clara com sua tese\n`;
    if (!hasConc) r += `- Finalize com conclusão e proposta de intervenção\n`;
    if (wordCount < 200) r += `- Texto curto — desenvolva melhor os argumentos\n`;
    r += `- Revise pontuação e concordância\n`;
    r += `- Use conectivos variados (ademais, contudo, portanto)\n\n`;

    r += `**👉 Próximos passos:**\n1️⃣ Corrigir completo — notas C1-C5\n2️⃣ Parte específica — introdução, desenvolvimento ou conclusão\n3️⃣ Ver competências — entender C1, C2, C3, C4 ou C5`;
    return r;
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
    const s = temas[Math.floor(Math.random() * temas.length)];
    return `🎯 **Tema de Redação — ${s.area}**\n\n**"${s.tema}"**\n\n📝 **Instruções:**\nRedação dissertativa-argumentativa de 20 a 30 linhas.\n\n✅ **Estrutura:**\n1. **Introdução** — Tese clara\n2. **Desenvolvimento (2 parágrafos)** — Argumentos com repertório\n3. **Conclusão** — Proposta de intervenção\n\n✅ **Requisitos:**\n- C1: Domínio da norma culta\n- C2: Compreensão do tema\n- C3: Organização das ideias\n- C4: Coesão textual\n- C5: Proposta de intervenção\n\n**👉 Quando terminar, cole aqui que eu corrijo!** 📝`;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // FALLBACK: COMPETÊNCIAS
  // ════════════════════════════════════════════════════════════════════════════

  getCompetenciesResponse(msg) {
    const text = msg.toLowerCase();
    for (const [key, comp] of Object.entries(COMPETENCIES)) {
      if (text.includes(key) || text.includes(`competência ${key.replace('c', '')}`)) {
        return `${comp.icon} **${comp.label}**\n\n${comp.description}\n\n🔍 **O que avaliamos:** ${comp.whatWeCheck}\n\n💡 **Dicas:**\n${comp.tips.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\n**👉 Quer ver outra competência?**`;
      }
    }
    let r = `📋 **Competências C1 a C5**\n\nRedação vale 1000 pontos, 5 competências de 200 cada:\n\n`;
    for (const comp of Object.values(COMPETENCIES)) {
      r += `${comp.icon} **${comp.label.split(' — ')[0]}** — ${comp.description.split('.')[0]}.\n`;
    }
    r += `\n💡 **Dica:** C1 e C5 são onde a maioria perde mais pontos. Foco nelas!\n\n**👉 Digite o número (C1, C2, C3, C4 ou C5) para detalhes!**`;
    return r;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // FALLBACK: EXEMPLOS
  // ════════════════════════════════════════════════════════════════════════════

  getExamplesResponse() {
    let r = `🏆 **Exemplos de Trechos Nota 1000**\n\n`;
    for (const ex of EXEMPLOS_NOTA_1000) {
      r += `**Tema:** ${ex.tema}\n_"${ex.trecho}"_\n⭐ **Destaque:** ${ex.destaque}\n\n`;
    }
    r += `💡 **Padrão nota 1000:**\n1. **Repertório legitimado** (autores, dados, filmes)\n2. **Conectivos sofisticados** (ademais, outrossim, por conseguinte)\n3. **Tese clara** na introdução\n4. **Proposta detalhada** com agente, ação, meio e finalidade\n\n**👉 Quer treinar? Peça "novo tema"!** 🎯`;
    return r;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // FALLBACK: REPERTÓRIO
  // ════════════════════════════════════════════════════════════════════════════

  getRepertoryResponse() {
    return `📚 **Repertórios Socioculturais**\n\n` +
      `**📖 Autores:**\n` +
      `- Pierre Bourdieu — Capital cultural\n- Michel Foucault — Poder disciplinar\n- Zygmunt Bauman — Modernidade líquida\n- Hannah Arendt — Banalidade do mal\n- Paulo Freire — Educação libertadora\n- Milton Santos — Globalização\n\n` +
      `**📊 Instituições:**\n` +
      `- IBGE — Dados demográficos e educacionais\n- IPEA — Políticas públicas\n- ONU — ODS e direitos humanos\n- OMS — Saúde pública\n\n` +
      `**🎬 Filmes:**\n` +
      `- "Que horas ela volta?" — Desigualdade social\n- "Ilha das Flores" — Dignidade humana\n- "Democracia em Vertigem" — Crise política\n\n` +
      `💡 Use UM repertório bem desenvolvido, não vários superficiais.\n\n**👉 Quer um repertório para um tema específico?**`;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // FALLBACK: PROGRESSO
  // ════════════════════════════════════════════════════════════════════════════

  getProgressResponse() {
    const profile = this.getProfileData();
    return `📊 **Meu Progresso em Redação**\n\n` +
      `📝 **Redações corrigidas:** ${profile.totalEssays}\n` +
      `⭐ **Última nota:** ${this.lastScores ? this.lastScores.media + '/1000' : 'Nenhuma ainda'}\n` +
      (this.lastScores ? `\n📋 **Competências:**\n${Object.entries(this.lastScores.comp).map(([k, v]) => `- ${k.toUpperCase()}: ${v}/200`).join('\n')}` : '') +
      `\n\n💡 **Segredo nota 1000:**\n1️⃣ 1 redação por semana\n2️⃣ Revisar erros anteriores\n3️⃣ Acumular repertório\n4️⃣ Treinar conclusão\n\n**👉 Quer começar? Peça "novo tema"!** 🎯`;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // UTILITÁRIOS
  // ════════════════════════════════════════════════════════════════════════════

  getStudentData() {
    try {
      const twin = this.modules.digitalTwin;
      if (!twin) return 'Nenhum dado disponível ainda.';
      const profile = twin.getProfile();
      if (!profile) return 'Perfil não iniciado.';
      const perf = profile.performance || {};
      const essays = perf.essays || { total: 0 };
      return `DADOS DO ALUNO:\n- Total de questões: ${perf.questions?.total || 0}\n- Acertos: ${perf.questions?.correct || 0}\n- Redações: ${essays.total || 0}\n- Última nota: ${this.lastScores ? this.lastScores.media : 'N/A'}`;
    } catch { return 'Dados indisponíveis.'; }
  }

  getProfileData() {
    try {
      const twin = this.modules.digitalTwin;
      if (!twin) return { totalEssays: 0 };
      const profile = twin.getProfile();
      if (!profile) return { totalEssays: 0 };
      return { totalEssays: profile.performance?.essays?.total || 0 };
    } catch { return { totalEssays: 0 }; }
  }

  extractScoresFromReply(reply) {
    const regex = /c([1-5])\s*[:=]\s*(\d{1,3})/gi;
    let match;
    const scores = {};
    while ((match = regex.exec(reply)) !== null) {
      scores[`c${match[1]}`] = parseInt(match[2]);
    }
    if (Object.keys(scores).length >= 3) {
      const total = Object.values(scores).reduce((a, b) => a + b, 0);
      this.lastScores = { comp: scores, media: total };
      this.saveSession();
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // MENSAGENS
  // ════════════════════════════════════════════════════════════════════════════

  addMessage(text, role = 'coach') {
    if (!this.messagesContainer) return;
    const welcome = this.messagesContainer.querySelector('.redbot-welcome');
    if (welcome && role === 'user') welcome.remove();

    const div = document.createElement('div');
    div.className = `redbot-msg redbot-msg-${role}`;
    div.innerHTML = this.formatMessage(text);
    this.messagesContainer.appendChild(div);
    this.scrollToBottom();
  }

  async addTypingMessage(text, role = 'coach') {
    if (!this.messagesContainer) return;
    const welcome = this.messagesContainer.querySelector('.redbot-welcome');
    if (welcome) welcome.remove();

    const div = document.createElement('div');
    div.className = `redbot-msg redbot-msg-${role}`;
    this.messagesContainer.appendChild(div);

    if (text.length > 800) {
      div.innerHTML = this.formatMessage(text);
    } else {
      await this.typeText(div, text);
    }
    this.scrollToBottom();
  }

  async typeText(element, text) {
    const formatted = this.formatMessage(text);
    let displayed = '';
    const chars = formatted.split('');

    for (let i = 0; i < chars.length; i++) {
      displayed += chars[i];
      element.innerHTML = displayed + '<span class="redbot-cursor">|</span>';
      if (chars[i].match(/[.,!?;\n]/)) await this.sleep(35);
      else if (chars[i] === ' ') await this.sleep(10);
      else await this.sleep(REDBOT_CONFIG.typingDelay);
    }
    element.innerHTML = formatted;
  }

  formatMessage(text) {
    if (!text) return '';
    let html = text
      .replace(/^### (.+)$/gm, '<h3 class="redbot-h3">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="redbot-h2">$1</h2>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '\nPB\n');

    const lines = html.split('\n');
    const result = [];
    let inOl = false, inUl = false;

    for (const line of lines) {
      const ol = line.match(/^(\d+)\.\s+(.+)$/);
      const ul = line.match(/^[-—–]\s+(.+)$/);
      if (ol) {
        if (!inOl) { if (inUl) { result.push('</ul>'); inUl = false; } result.push('<ol class="redbot-ol">'); inOl = true; }
        result.push(`<li>${ol[2]}</li>`);
      } else if (ul) {
        if (!inUl) { if (inOl) { result.push('</ol>'); inOl = false; } result.push('<ul class="redbot-ul">'); inUl = true; }
        result.push(`<li>${ul[1]}</li>`);
      } else {
        if (inOl) { result.push('</ol>'); inOl = false; }
        if (inUl) { result.push('</ul>'); inUl = false; }
        if (line === 'PB') result.push('</p><p class="redbot-p">');
        else if (line.trim()) result.push(line);
      }
    }
    if (inOl) result.push('</ol>');
    if (inUl) result.push('</ul>');

    html = result.join('\n');
    if (!html.startsWith('<h') && !html.startsWith('<ol') && !html.startsWith('<ul')) {
      html = '<p class="redbot-p">' + html + '</p>';
    }
    return html;
  }

  showTypingIndicator() {
    if (!this.messagesContainer) return;
    const el = document.createElement('div');
    el.className = 'redbot-msg redbot-msg-coach redbot-typing';
    el.id = 'redbot-typing';
    el.innerHTML = '<span class="redbot-typing-dots"><span></span><span></span><span></span></span>';
    this.messagesContainer.appendChild(el);
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    document.getElementById('redbot-typing')?.remove();
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

  sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  // ════════════════════════════════════════════════════════════════════════════
  // RELATÓRIO
  // ════════════════════════════════════════════════════════════════════════════

  generateReport() {
    let r = '=== 🤖 RELATÓRIO COACH REDBOT ===\n\n';
    r += `Mensagens: ${this.conversationHistory.length}\n`;
    r += `Última nota: ${this.lastScores ? this.lastScores.media + '/1000' : 'N/A'}\n\n`;
    r += '=== ÚLTIMAS ===\n';
    const recent = this.conversationHistory.slice(-6);
    for (let i = 0; i < recent.length; i += 2) {
      if (recent[i]) r += `\n👤: ${recent[i].content.slice(0, 80)}...\n`;
      if (recent[i + 1]) r += `🤖: ${recent[i + 1].content.slice(0, 80)}...\n`;
    }
    return r;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// INSTÂNCIA GLOBAL
// ════════════════════════════════════════════════════════════════════════════

let coachRedbot = null;

function initCoachRedbot(aivos360Modules = {}) {
  if (!coachRedbot) {
    coachRedbot = new CoachRedbot(aivos360Modules);
    coachRedbot.init();
  } else if (Object.keys(aivos360Modules).length > 0) {
    coachRedbot.setModules(aivos360Modules);
  }
  window.coachRedbot = coachRedbot;
  return coachRedbot;
}

function getCoachRedbot() { return coachRedbot; }

if (typeof window !== 'undefined') {
  window.CoachRedbot = CoachRedbot;
  window.initCoachRedbot = initCoachRedbot;
  window.getCoachRedbot = getCoachRedbot;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CoachRedbot, initCoachRedbot, getCoachRedbot };
}
