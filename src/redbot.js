/**
 * PROFESSOR DE REDACAO — Coach de Redacao
 * 
 * Tutor acadêmico especializado em correção de redação por competências (C1-C5),
 * notas 900+/1000, repertórios socioculturais e temas de redação para ENEM e concursos.
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
// SYSTEM PROMPT DO PROFESSOR UNIVERSITÁRIO
// ════════════════════════════════════════════════════════════════════════════

const COACH_REDBOT_SYSTEM_PROMPT = `Você é o **Professor de Redação**, um tutor acadêmico especializado em redação para ENEM e concursos públicos. Seu método é acadêmico, rigoroso e fundamentado na matriz de competências oficial.

# DEFINIÇÕES DE C1-C5 (cada uma vale 0 a 200, total 1000):
- **C1** = Domínio da Escrita Formal (ortografia, concordância, regência, pontuação)
- **C2** = Compreensão do Tema (tema central, repertório adequado)
- **C3** = Organização das Ideias (estrutura, progressão lógica, coerência)
- **C4** = Mecanismos Linguísticos / Coesão (conectivos, referências, progressão textual)
- **C5** = Proposta de Intervenção (agente, ação, meio, finalidade, direitos humanos)

# REGRAS DE COMPORTAMENTO
1. Aja como professor universitário. Use linguagem formal, clara e precisa.
2. Estruture o feedback em: (1) Diagnóstico, (2) Análise, (3) Prescrição.
3. Correção em camadas: Tema, Estrutura, Argumentação, Coesão, Repertório, Gramática, Ortografia.
4. Método Socrático: conduza o aluno ao raciocínio, não dê respostas prontas.
5. Aprendizagem ativa: solicite reescrita antes de apresentar versão modelo.
6. Tom acadêmico, respeitoso e construtivo. Inicie com observações positivas, conclua com direcionamentos claros.
7. Use vocabulário formal mas acessível. Evite gírias, coloquialismos e linguagem infantilizada.
8. NÃO use emojis, símbolos gráficos ou linguagem excessivamente informal.

# INSTRUÇÃO CRÍTICA — FORMATO DE SAÍDA
VOCÊ DEVE RESPONDER APENAS EM JSON. NUNCA inclua o campo "reply". Use APENAS os campos abaixo.

Exemplo COMPLETO de resposta (copie EXATAMENTE este formato, apenas altere os valores):
{
  "scores": { "c1": 120, "c2": 140, "c3": 130, "c4": 110, "c5": 100 },
  "summary": "O aluno demonstra compreensão do tema mas precisa melhorar a proposta de intervenção. A estrutura está adequada, com introdução, desenvolvimento e conclusão.",
  "strongPoints": ["Compreensão clara do tema proposto", "Estrutura bem organizada em parágrafos"],
  "problems": ["Proposta de intervenção sem detalhamento: faltam agente, ação e meio", "Conectivos repetitivos ao longo do texto"],
  "socraticQuestion": "Sua proposta de intervenção convenceria um gestor público? O que falta nela?",
  "nextSteps": ["Refaça a conclusão com proposta detalhada", "Varie os conectivos: ademais, outrossim, por conseguinte"]
}

IMPORTANTE: scores DEVEM ser números inteiros de 0 a 200 (NUNCA 0-10, NUNCA use escala decimal).
IMPORTANTE: NUNCA inclua campo "reply". Use SOMENTE os campos do exemplo acima.
`;

// ════════════════════════════════════════════════════════════════════════════
// COMPETÊNCIAS ENEM / CONCURSOS (C1-C5)
// ════════════════════════════════════════════════════════════════════════════

const COMPETENCIES = {
  c1: {
    label: 'C1 — Domínio da Escrita Formal',
    icon: '',
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
    icon: '',
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
    icon: '',
    description: 'Selecionar, relacionar, organizar e interpretar informações em defesa de um ponto de vista.',
    whatWeCheck: 'Estrutura do texto, progressão lógica, articulação entre parágrafos, coerência argumentativa.',
    tips: [
      'Use a estrutura: introducao, desenvolvimento (2 parágrafos), conclusao',
      'Cada parágrafo deve ter uma ideia central',
      'Use conectivos entre parágrafos (alem disso, outrossim, por conseguinte)',
      'Sua tese deve ficar clara ja na introducao'
    ]
  },
  c4: {
    label: 'C4 — Mecanismos Linguísticos',
    icon: '',
    description: 'Demonstrar conhecimento dos mecanismos linguísticos necessários para a construção da argumentação.',
    whatWeCheck: 'Coesão textual, uso de conectivos, referências anafóricas, progressão textual.',
    tips: [
      'Varie os conectivos ao longo do texto',
      'Use pronomes para retomar ideias sem repetir palavras',
      'Mantenha a progressao: ideia nova, explicacao, exemplo',
      'Evite parágrafos soltos sem conexao entre si'
    ]
  },
  c5: {
    label: 'C5 — Proposta de Intervenção',
    icon: '',
    description: 'Elaborar proposta de intervenção para o problema abordado, respeitando os direitos humanos.',
    whatWeCheck: 'Se ha proposta, se e detalhada (agente, acao, meio, finalidade), se respeita direitos humanos.',
    tips: [
      'Sua proposta deve ter: O que? Quem faz? Como? Para que?',
      'Detalhe o agente (governo, sociedade, ONG, escola)',
      'Explique o meio ou instrumento (campanhas, leis, politicas)',
      'Nunca viole direitos humanos na sua proposta'
    ]
  }
};

// ════════════════════════════════════════════════════════════════════════════
// EXEMPLOS DE TRECHOS NOTA 1000
// ════════════════════════════════════════════════════════════════════════════

const EXEMPLOS_NOTA_1000 = [
  {
    tema: 'Desafios para a formacao educacional no Brasil',
    trecho: 'Nesse contexto, percebe-se que a falta de investimentos em educacao basica gera um ciclo vicioso de desigualdade. Conforme o sociologo Pierre Bourdieu, a escola reproduz as desigualdades sociais ao privilegiar o capital cultural das classes dominantes. Logo, urge a necessidade de politicas publicas que democratizem o acesso ao conhecimento de qualidade.',
    destaque: 'Uso de repertorio sociologico (Bourdieu), tese clara, conectivo "Logo"'
  },
  {
    tema: 'Combate ao racismo estrutural no Brasil',
    trecho: 'Ademais, o racismo estrutural manifesta-se de forma sutil mas pervasiva na sociedade brasileira. Dados do IBGE (2019) revelam que jovens negros tem 2,5 vezes mais chances de serem vitimas de homicidio. Nesse sentido, medidas afirmativas como as cotas raciais representam um avanco civilizatorio ao reparar seculos de exclusao.',
    destaque: 'Dado estatistico concreto (IBGE), relacao com politicas publicas, posicionamento claro'
  },
  {
    tema: 'Desafios do sistema prisional brasileiro',
    trecho: 'Diante desse cenario caotico, faz-se mister a atuacao estatal nao apenas como punidor, mas como agente ressocializador. O filosofo Michel Foucault, em "Vigiar e Punir", ja alertava que o sistema prisional, ao inves de recuperar, fabrica delinquentes. Portanto, politicas de educacao e trabalho dentro dos presidios sao urgentes para romper esse ciclo.',
    destaque: 'Referencia filosofica (Foucault), uso de "faz-se mister" (erudicao), proposta clara'
  }
];

// ════════════════════════════════════════════════════════════════════════════
// CLASSE PROFESSOR UNIVERSITARIO
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
  // INICIALIZACAO
  // ════════════════════════════════════════════════════════════════════════════
  init() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    console.log('[Professor de Redação] Coach de Redação iniciado');

    this.loadSession();
    this.scheduleRender();

    window.addEventListener('aivos360DashboardReady', () => {
      if (typeof state !== 'undefined' && state.mode === 'redacao') {
        this.renderUI();
        this.addDashboardButton();
      }
    });
  }

  scheduleRender() {
    const shouldRender = () => {
      return typeof state !== 'undefined' && state.mode === 'redacao';
    };

    const tryRenderNow = () => {
      const dashboard = document.querySelector('.aivos360-dashboard');
      if (dashboard && !this.chatWrapper && shouldRender()) {
        this.renderUI();
        this.addDashboardButton();
        if (this._observer) {
          this._observer.disconnect();
          this._observer = null;
        }
        clearInterval(this._renderInterval);
        return true;
      }
      return false;
    };

    setTimeout(tryRenderNow, 50);
    this._renderInterval = setInterval(tryRenderNow, 500);

    if (!this._observer && typeof MutationObserver !== 'undefined') {
      this._observer = new MutationObserver(() => {
        if (tryRenderNow() && this._observer) {
          this._observer.disconnect();
          this._observer = null;
        }
      });
      this._observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  setModules(modules) {
    this.modules = modules;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PERSISTENCIA DE SESSAO
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
      console.warn('[Professor de Redação] Erro ao salvar sessao:', e);
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
          console.log('[Professor de Redação] Sessao restaurada com', this.conversationHistory.length, 'mensagens');
        }
      }
    } catch (e) {
      console.warn('[Professor de Redação] Erro ao carregar sessao:', e);
    }
  }

  clearSession() {
    this.conversationHistory = [];
    this.lastScores = null;
    localStorage.removeItem('coachRedbotSession');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RENDERIZACAO DA UI
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

        <!-- SIDEBAR - Professor de Redação -->
        <div class="redbot-sidebar">
          <div class="redbot-sidebar-inner">
            <div class="redbot-avatar">
              <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: white; padding: 10px;">
                <!-- Graduation Cap -->
                <path d="M10 40 L50 10 L90 40 L50 70 Z" fill="currentColor" opacity="0.3" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                <path d="M50 10 L50 50" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
                <rect x="40" y="60" width="20" height="10" rx="2" fill="currentColor" opacity="0.25" stroke="currentColor" stroke-width="1"/>
                <rect x="35" y="68" width="30" height="6" rx="2" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="0.8"/>
                <path d="M90 40 L96 35" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
                <circle cx="97" cy="34" r="3" fill="currentColor" opacity="0.5"/>
                <!-- Book/Knowledge -->
                <rect x="30" y="45" width="40" height="32" rx="3" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.2"/>
                <line x1="42" y1="52" x2="58" y2="52" stroke="currentColor" stroke-width="1.5" opacity="0.4" stroke-linecap="round"/>
                <line x1="42" y1="58" x2="58" y2="58" stroke="currentColor" stroke-width="1.5" opacity="0.4" stroke-linecap="round"/>
                <line x1="42" y1="64" x2="52" y2="64" stroke="currentColor" stroke-width="1.5" opacity="0.4" stroke-linecap="round"/>
                <!-- Academic Decoration -->
                <path d="M15 75 Q50 95 85 75" stroke="currentColor" stroke-width="1" fill="none" opacity="0.2" stroke-linecap="round"/>
                <circle cx="50" cy="85" r="2" fill="currentColor" opacity="0.3"/>
              </svg>
              <div class="redbot-avatar-fallback" style="display:none">
                <svg width="40" height="40" viewBox="0 0 100 100" fill="none"><path d="M10 40 L50 10 L90 40 L50 70 Z" fill="white" opacity="0.3"/><rect x="30" y="45" width="40" height="32" rx="3" fill="white" opacity="0.15"/></svg>
              </div>
            </div>

            <h2 class="redbot-name">
              Professor de Redação
            </h2>

            <div class="redbot-status">
              <span class="redbot-status-dot"></span>
              Online - Coach de Redação
            </div>

            <p class="redbot-bio">
              Tutor academico especializado em correcao de redacao para ENEM e concursos. Metodo estruturado com analise detalhada por competencias C1-C5.
            </p>

            <button class="redbot-new-theme-btn" onclick="window.coachRedbot?.handleTool('novo-tema')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 12h-4M12 8v8"/></svg> Novo Tema de Redacao
            </button>

            <div class="redbot-divider"></div>

            <div class="redbot-tools">
              <button class="redbot-tool-btn" onclick="window.coachRedbot?.handleTool('competencias')">
                <span class="redbot-tool-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 14h6M9 18h6M12 10h.01"/></svg></span>
                <span class="redbot-tool-label">Ver Competencias C1 a C5</span>
              </button>
              <button class="redbot-tool-btn" onclick="window.coachRedbot?.addQuickMsg('Gostaria de ver exemplos de redacoes nota 1000')">
                <span class="redbot-tool-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg></span>
                <span class="redbot-tool-label">Exemplos de Redacoes Nota 1000</span>
              </button>
              <button class="redbot-tool-btn" onclick="window.coachRedbot?.addQuickMsg('Preciso de repertorios atualizados para minha redacao')">
                <span class="redbot-tool-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="M8 7h8M8 11h6"/></svg></span>
                <span class="redbot-tool-label">Repertorios Atualizados</span>
              </button>
              <button class="redbot-tool-btn" onclick="window.coachRedbot?.addQuickMsg('Quero ver meu plano de evolucao em redacao')">
                <span class="redbot-tool-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 16v-3M12 16v-6M17 16V8"/></svg></span>
                <span class="redbot-tool-label">Meu Plano de Evolucao</span>
              </button>
            </div>

            <div class="redbot-tip">
              <p class="redbot-tip-label"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg> Dica do dia:</p>
              <p class="redbot-tip-text">"Uma proposta de intervencao deve ser viavel, detalhada e conectada com os argumentos apresentados."</p>
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
                <div class="redbot-welcome-avatar">
                  <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 40 L50 10 L90 40 L50 70 Z" fill="currentColor" opacity="0.4"/>
                    <rect x="30" y="45" width="40" height="32" rx="3" fill="currentColor" opacity="0.2"/>
                  </svg>
                </div>
                <div class="redbot-welcome-content">
                  <p class="redbot-welcome-name">Professor de Redacao</p>
                  <p class="redbot-welcome-text">Bem-vindo. Cole sua redacao ou informe o tema que deseja treinar. Farei a correcao detalhada por competencias, apontando pontos fortes e areas que precisam de atencao. Pressione ENTER para enviar.</p>
                </div>
              </div>
            </div>

            <div class="redbot-editor-area">
              <textarea
                id="redbot-essay-input"
                class="redbot-essay-textarea"
                rows="6"
                placeholder="Escreva ou cole sua redacao aqui para correcao..."
                oninput="window.coachRedbot?.onEssayChange()"
              ></textarea>

              <div class="redbot-editor-actions">
                <button class="redbot-editor-btn redbot-editor-btn-primary" id="redbot-essay-send" onclick="window.coachRedbot?.sendEssay()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg> Enviar para Correcao
                </button>
                <button class="redbot-editor-btn redbot-editor-btn-secondary" onclick="window.coachRedbot?.addQuickMsg('Gostaria de analisar minha redacao em partes')">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg> Analisar por Partes
                </button>
              </div>
            </div>

            <div class="redbot-input-area">
              <textarea
                class="redbot-input"
                id="redbot-input"
                placeholder="Digite sua mensagem para o Professor..."
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
      <div class="redbot-db-icon"><svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: var(--color-primary);"><path d="M10 40 L50 10 L90 40 L50 70 Z" fill="currentColor" opacity="0.3"/><rect x="30" y="45" width="40" height="32" rx="3" fill="currentColor" opacity="0.15"/></svg></div>
      <div class="redbot-db-content">
        <strong class="redbot-db-title">Professor de Redacao — Correcao de Redacao</strong>
        <span class="redbot-db-subtitle">Correcao detalhada por competencias C1-C5</span>
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
    if (!this.essayTextarea) return;
    if (this.essaySendBtn) {
      this.essaySendBtn.disabled = !this.essayTextarea.value.trim();
    }
  }

  onInputChange() {
    if (this.sendButton) {
      this.sendButton.disabled = !this.inputElement?.value?.trim();
    }
  }

  sendEssay() {
    const text = this.essayTextarea?.value?.trim();
    if (!text || this.isProcessing) return;
    this.processMessage(text, 'essay');
  }

  sendFromInput() {
    const text = this.inputElement?.value?.trim();
    if (!text || this.isProcessing) return;
    this.inputElement.value = '';
    this.sendButton.disabled = true;
    this.autoResize(this.inputElement);
    this.processMessage(text, 'chat');
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
        this.addQuickMsg('Quero um tema de redacao para treinar');
        break;
      case 'competencias':
        this.showCompetenciesModal();
        break;
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // COMPETENCIAS MODAL
  // ════════════════════════════════════════════════════════════════════════════

  showCompetenciesModal() {
    const overlay = document.createElement('div');
    overlay.className = 'redbot-modal-overlay';
    overlay.innerHTML = `
      <div class="redbot-modal">
        <div class="redbot-modal-h">
          <h3 class="redbot-modal-title">Competencias C1 a C5</h3>
          <button class="redbot-modal-x" onclick="this.closest('.redbot-modal-overlay').remove()">×</button>
        </div>
        <div class="redbot-modal-body">
          <p class="redbot-modal-intro">No ENEM e na maioria dos concursos, a redacao e corrigida por 5 competencias. Cada uma vale ate 200 pontos, totalizando 1000.</p>
          ${Object.values(COMPETENCIES).map(c => `
            <div class="redbot-comp-card">
              <h4>${c.label}</h4>
              <p>${c.description}</p>
              <p class="redbot-comp-check"><strong>O que avaliamos:</strong> ${c.whatWeCheck}</p>
              <div class="redbot-comp-tips">
                <strong>Dicas do Professor:</strong>
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

  async processMessage(userMessage, type = 'chat') {
    if (this.isProcessing || !userMessage.trim()) return;
    this._messageType = type;

    this.isProcessing = true;
    this.setInputState(false);

    this.addMessage(userMessage, 'user');
    this.conversationHistory.push({ role: 'user', content: userMessage });

    this.showTypingIndicator();

    try {
      let result = await this.sendToAI(userMessage, this._messageType || 'chat');

      this.hideTypingIndicator();

      let replyText;
      if (typeof result === 'string') {
        replyText = result;
      } else {
        replyText = this.formatCoachReply(result);
        if (result.scores) {
          const comp = {};
          let total = 0;
          for (const k of ['c1','c2','c3','c4','c5']) {
            const v = parseInt(result.scores[k]);
            if (!isNaN(v)) { comp[k] = v; total += v; }
          }
          if (Object.keys(comp).length >= 3) {
            this.lastScores = { comp, media: Math.round(total) };
          }
        }
        if (!result.scores && result.reply) {
          this.extractScoresFromReply(result.reply);
        }
      }

      await this.addTypingMessage(replyText, 'coach');
      this.conversationHistory.push({ role: 'assistant', content: replyText });
      this.saveSession();

    } catch (error) {
      this.hideTypingIndicator();
      this.addMessage('Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.', 'coach');
      console.error('[Professor de Redação] Erro:', error);
    }

    this.isProcessing = false;
    this.setInputState(true);
    this.inputElement?.focus();
    this.scrollToBottom();
  }

  // ════════════════════════════════════════════════════════════════════════════
  // FORMATACAO DA RESPOSTA DO PROFESSOR
  // ════════════════════════════════════════════════════════════════════════════

  formatCoachReply(data) {
    if (!data || typeof data !== 'object') return data || '';

    const { scores, summary, strongPoints, problems, socraticQuestion, nextSteps, reply } = data;
    let r = '';

    if (scores || summary || strongPoints || problems) {
      if (scores) {
        r += `**Estimativa de nota por competencia:**\n\n`;
        let total = 0;
        for (const [key, comp] of Object.entries(COMPETENCIES)) {
          const val = scores[key];
          if (val !== undefined && val !== null) {
            const num = parseInt(val);
            if (!isNaN(num)) {
              r += `**${comp.label}:** ${num}/200\n`;
              r += `_${comp.description.slice(0, 60)}..._\n\n`;
              total += num;
            }
          }
        }
        r += `**Total estimado: ${total}/1000**\n\n`;
        r += `---\n\n`;
      }

      if (summary) r += `**Resumo do desempenho:**\n${summary}\n\n---\n\n`;

      if (strongPoints && strongPoints.length > 0) {
        r += `**Pontos fortes:**\n`;
        strongPoints.forEach(p => { r += `- ${p}\n`; });
        r += `\n`;
      }

      if (problems && problems.length > 0) {
        r += `**Principais problemas:**\n`;
        problems.forEach((p, i) => { r += `${i+1}. ${p}\n`; });
        r += `\n`;
      }

      if (socraticQuestion) {
        r += `**Reflita sobre:** ${socraticQuestion}\n\n`;
      }

      if (nextSteps && nextSteps.length > 0) {
        r += `**Proximos passos:**\n`;
        nextSteps.forEach(s => { r += `- ${s}\n`; });
        r += `\n`;
      }

      r += `**Qual destes aspectos gostaria de corrigir primeiro?** (Informe o numero ou descreva)\n\n`;

      return r.trim();
    }

    if (reply) {
      const extractedScores = this._extractScoresFromText(reply);
      
      if (extractedScores && Object.keys(extractedScores).length >= 3) {
        const allLe10 = Object.values(extractedScores).every(v => v <= 10);
        r += `**Notas corrigidas (escala 0-200):**\n\n`;
        let totalNormalized = 0;
        for (const [key, comp] of Object.entries(COMPETENCIES)) {
          const rawVal = extractedScores[key];
          if (rawVal !== undefined) {
            const normalized = allLe10 ? rawVal * 20 : rawVal;
            totalNormalized += normalized;
            r += `**${comp.label}:** ${normalized}/200\n`;
          }
        }
        r += `\n**Total: ${totalNormalized}/1000**\n\n`;
        r += `_As notas acima foram extraidas automaticamente do texto do Professor e convertidas para a escala oficial (0-200 por competencia)._\n\n---\n\n`;
        const sorted = Object.entries(extractedScores)
          .map(([k, v]) => ({ key: k, val: allLe10 ? v * 20 : v, comp: COMPETENCIES[k] }))
          .sort((a, b) => a.val - b.val);
        if (sorted.length >= 2) {
          r += `**Observacao:** Sua menor nota foi em **${sorted[0].comp.label}**. ${sorted[0].comp.tips[0]}\n\n---\n\n`;
        }
      }

      r += reply;
      return r;
    }

    return 'Obrigado pela mensagem. Como posso ajudar com sua redacao hoje?';
  }

  _extractScoresFromText(text) {
    const regex = /c([1-5])(?:[^:]*?)\s*[:=]\s*(\d{1,3})/gi;
    let match;
    const scores = {};
    while ((match = regex.exec(text)) !== null) {
      scores[`c${match[1]}`] = parseInt(match[2]);
    }
    return Object.keys(scores).length >= 3 ? scores : null;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // COMUNICACAO COM IA + FALLBACK
  // ════════════════════════════════════════════════════════════════════════════

  async sendToAI(userMessage, type = 'chat') {
    try {
      const response = await fetch(REDBOT_CONFIG.workerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'redbot',
          type: type,
          systemPrompt: COACH_REDBOT_SYSTEM_PROMPT,
          message: userMessage,
          history: this.conversationHistory.slice(-8),
          studentData: this.getStudentData(),
          timestamp: Date.now()
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (data.reply || data.scores || data.summary) return data;
      return 'Nao foi possivel processar sua solicitacao. Por favor, tente novamente.';
    } catch (error) {
      console.error('[Professor de Redação] Erro na comunicacao com IA:', error);
      return this.getFallback(userMessage);
    }
  }

  getFallback(userMessage) {
    const msg = userMessage.toLowerCase();

    if (userMessage.length > 300) {
      return this.localCorrection(userMessage);
    }

    if (msg.includes('tema') || msg.includes('redacao nova') || msg.includes('novo tema')) {
      return this.generateRandomTheme();
    }

    if (msg.includes('c1') || msg.includes('c2') || msg.includes('c3') || msg.includes('c4') || msg.includes('c5') || msg.includes('competencia')) {
      return this.getCompetenciesResponse(msg);
    }

    if (msg.includes('exemplo') || msg.includes('nota 1000') || msg.includes('nota mil')) {
      return this.getExamplesResponse();
    }

    if (msg.includes('progresso') || msg.includes('desempenho') || msg.includes('evolucao') || msg.includes('plano')) {
      return this.getProgressResponse();
    }

    if (msg.includes('repertorio') || msg.includes('citacao') || msg.includes('referencia')) {
      return this.getRepertoryResponse();
    }

    if (msg.includes('introducao') || msg.includes('desenvolvimento') || msg.includes('conclusao')) {
      return `**Vamos trabalhar esta parte da redacao.**\n\nEnvie o trecho que voce ja escreveu para esta parte e farei a analise com base nas competencias:\n\n**O que vou avaliar:**\n- Estrutura adequada\n- Coesao e coerencia\n- Argumentacao\n- Adequacao ao tema\n\n**Envie o trecho que voce escreveu.**`;
    }

    if (msg.includes('ola') || msg.includes('oi') || msg.includes('bom dia') || msg.includes('boa tarde') || msg.includes('boa noite')) {
      return `**Professor de Redacao**\n\nBem-vindo ao modulo de correcao de redacao. Posso ajuda-lo com:\n\n**Correcao completa** - Envie sua redacao para analise detalhada por competencias\n**Temas personalizados** - Sugiro temas alinhados com ENEM e concursos\n**Competencias C1-C5** - Explicacao detalhada de cada criterio\n**Exemplos nota 1000** - Trechos comentados de redacoes nota maxima\n**Repertorios** - Autores, dados e referencias para enriquecer sua argumentacao\n**Analise de progresso** - Acompanhe sua evolucao ao longo do tempo\n\n**Como deseja comecar?**`;
    }

    return `**Professor de Redacao**\n\nEntendi sua mensagem. Para que eu possa ajudar da melhor forma:\n\n- **Envie sua redacao** completa ou em partes para correcao detalhada\n- **Solicite um tema** de redacao para treinar\n- **Pergunte sobre as competencias** C1 a C5\n- **Veja exemplos** de trechos nota 1000\n- **Consulte repertorios** socioculturais\n\n**O que prefere?**`;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // FALLBACK: CORRECAO LOCAL
  // ════════════════════════════════════════════════════════════════════════════

  localCorrection(text) {
    const wordCount = text.split(/\s+/).length;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
    const hasIntro = text.toLowerCase().includes('introducao') || text.toLowerCase().includes('introducao') || paragraphs.length >= 3;
    const hasConc = text.toLowerCase().includes('conclusao') || text.toLowerCase().includes('conclusao');

    let r = `**Analise do Professor de Redacao**\n\n`;
    r += `**Estatisticas:**\n- ${wordCount} palavras\n- ${paragraphs.length} paragrafos\n\n`;
    r += `**Pontos positivos:**\n`;
    if (wordCount >= 200) r += `- Extensao adequada (${wordCount} palavras)\n`;
    if (paragraphs.length >= 3) r += `- ${paragraphs.length} paragrafos identificados\n`;
    if (hasIntro) r += `- Estrutura com introducao\n`;
    if (hasConc) r += `- Inclui conclusao\n`;

    r += `\n**Analise por competencia:**\n`;
    r += `- **C1:** Verificar ortografia, concordancia e formalidade\n`;
    r += `- **C2:** O tema central esta claro?\n`;
    r += `- **C3:** Introducao, desenvolvimento e conclusao estao presentes?\n`;
    r += `- **C4:** Uso de conectivos variados?\n`;
    r += `- **C5:** Proposta de intervencao detalhada?\n\n`;

    r += `**Recomendacoes:**\n`;
    if (!hasIntro) r += `- Inicie com uma introducao clara apresentando sua tese\n`;
    if (!hasConc) r += `- Finalize com conclusao e proposta de intervencao\n`;
    if (wordCount < 200) r += `- O texto esta curto. Desenvolva melhor os argumentos\n`;
    r += `- Revise pontuacao e concordancia\n`;
    r += `- Utilize conectivos variados (ademais, contudo, portanto)\n\n`;

    r += `**Proximos passos:**\n1. Correcao completa com notas C1-C5\n2. Analise de parte especifica (introducao, desenvolvimento ou conclusao)\n3. Explicacao detalhada de uma competencia`; 
    return r;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // FALLBACK: TEMA ALEATORIO
  // ════════════════════════════════════════════════════════════════════════════

  generateRandomTheme() {
    const temas = [
      { tema: 'Os desafios da saude publica no Brasil pos-pandemia', area: 'Saude' },
      { tema: 'A importancia da educacao digital na formacao de jovens brasileiros', area: 'Educacao' },
      { tema: 'O papel das redes sociais na formacao da opiniao publica', area: 'Comunicacao' },
      { tema: 'Desafios para a preservacao ambiental no seculo XXI', area: 'Meio Ambiente' },
      { tema: 'A desigualdade de genero no mercado de trabalho brasileiro', area: 'Sociedade' },
      { tema: 'Os impactos da inteligencia artificial no futuro do trabalho', area: 'Tecnologia' },
      { tema: 'A crise de refugiados e a responsabilidade humanitaria', area: 'Direitos Humanos' },
      { tema: 'O envelhecimento populacional e as politicas publicas de assistencia', area: 'Previdencia' },
      { tema: 'A seguranca publica como direito fundamental do cidadao', area: 'Seguranca' },
      { tema: 'Os desafios da mobilidade urbana nas grandes cidades', area: 'Urbanismo' },
      { tema: 'A valorizacao da cultura brasileira como identidade nacional', area: 'Cultura' },
      { tema: 'Os impactos do trabalho remoto na saude mental dos trabalhadores', area: 'Trabalho' }
    ];
    const s = temas[Math.floor(Math.random() * temas.length)];
    return `**Tema de Redacao - ${s.area}**\n\n"${s.tema}"\n\n**Instrucoes:**\nRedacao dissertativa-argumentativa de 20 a 30 linhas.\n\n**Estrutura esperada:**\n1. Introducao com tese clara\n2. Desenvolvimento (2 paragrafos) com argumentos e repertorio\n3. Conclusao com proposta de intervencao\n\n**Criterios de correcao:**\n- C1: Dominio da norma culta\n- C2: Compreensao do tema\n- C3: Organizacao das ideias\n- C4: Coesao textual\n- C5: Proposta de intervencao\n\n**Quando terminar, cole aqui para correcao.**`;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // FALLBACK: COMPETENCIAS
  // ════════════════════════════════════════════════════════════════════════════

  getCompetenciesResponse(msg) {
    const text = msg.toLowerCase();
    for (const [key, comp] of Object.entries(COMPETENCIES)) {
      if (text.includes(key) || text.includes(`competencia ${key.replace('c', '')}`)) {
        return `**${comp.label}**\n\n${comp.description}\n\n**O que avaliamos:** ${comp.whatWeCheck}\n\n**Dicas do Professor:**\n${comp.tips.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\n**Deseja ver outra competencia?**`;
      }
    }
    let r = `**Competencias C1 a C5**\n\nRedacao vale 1000 pontos, distribuidos em 5 competencias de 200 cada:\n\n`;
    for (const comp of Object.values(COMPETENCIES)) {
      r += `**${comp.label.split(' — ')[0]}** - ${comp.description.split('.')[0]}.\n`;
    }
    r += `\n**Observacao:** C1 e C5 sao as competencias onde a maioria dos candidatos perde mais pontos.\n\n**Digite o numero (C1, C2, C3, C4 ou C5) para detalhes.**`;
    return r;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // FALLBACK: EXEMPLOS
  // ════════════════════════════════════════════════════════════════════════════

  getExamplesResponse() {
    let r = `**Exemplos de Trechos Nota 1000**\n\n`;
    for (const ex of EXEMPLOS_NOTA_1000) {
      r += `**Tema:** ${ex.tema}\n_"${ex.trecho}"_\n**Destaque:** ${ex.destaque}\n\n`;
    }
    r += `**Padrao nota 1000:**\n1. **Repertorio legitimado** (autores, dados, filmes)\n2. **Conectivos sofisticados** (ademais, outrossim, por conseguinte)\n3. **Tese clara** na introducao\n4. **Proposta detalhada** com agente, acao, meio e finalidade\n\n**Deseja treinar? Solicite um "novo tema".**`;
    return r;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // FALLBACK: REPERTORIO
  // ════════════════════════════════════════════════════════════════════════════

  getRepertoryResponse() {
    return `**Repertorios Socioculturais**\n\n` +
      `**Autores:**\n` +
      `- Pierre Bourdieu - Capital cultural\n- Michel Foucault - Poder disciplinar\n- Zygmunt Bauman - Modernidade liquida\n- Hannah Arendt - Banalidade do mal\n- Paulo Freire - Educacao libertadora\n- Milton Santos - Globalizacao\n\n` +
      `**Instituicoes:**\n` +
      `- IBGE - Dados demograficos e educacionais\n- IPEA - Politicas publicas\n- ONU - ODS e direitos humanos\n- OMS - Saude publica\n\n` +
      `**Filmes:**\n` +
      `- "Que horas ela volta?" - Desigualdade social\n- "Ilha das Flores" - Dignidade humana\n- "Democracia em Vertigem" - Crise politica\n\n` +
      `**Recomendacao:** Utilize UM repertorio bem desenvolvido, em vez de varios superficiais.\n\n` +
      `**Deseja um repertorio para um tema especifico?**`;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // FALLBACK: PROGRESSO
  // ════════════════════════════════════════════════════════════════════════════

  getProgressResponse() {
    const profile = this.getProfileData();
    return `**Meu Progresso em Redacao**\n\n` +
      `**Redacoes corrigidas:** ${profile.totalEssays}\n` +
      `**Ultima nota:** ${this.lastScores ? this.lastScores.media + '/1000' : 'Nenhuma ainda'}\n` +
      (this.lastScores ? `\n**Competencias:**\n${Object.entries(this.lastScores.comp).map(([k, v]) => `- ${k.toUpperCase()}: ${v}/200`).join('\n')}` : '') +
      `\n\n**Recomendacao para nota 1000:**\n1. Pratique 1 redacao por semana\n2. Revise os erros das correcoes anteriores\n3. Acumule repertorio sociocultural diversificado\n4. Treine especialmente a conclusao (C5)\n\n**Deseja comecar? Solicite um "novo tema".**`;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // UTILITARIOS
  // ════════════════════════════════════════════════════════════════════════════

  getStudentData() {
    try {
      const twin = this.modules.digitalTwin;
      if (!twin) return 'Nenhum dado disponivel ainda.';
      const profile = twin.getProfile();
      if (!profile) return 'Perfil nao iniciado.';
      const perf = profile.performance || {};
      const essays = perf.essays || { total: 0 };
      return `DADOS DO ALUNO:\n- Total de questoes: ${perf.questions?.total || 0}\n- Acertos: ${perf.questions?.correct || 0}\n- Redacoes: ${essays.total || 0}\n- Ultima nota: ${this.lastScores ? this.lastScores.media : 'N/A'}`;
    } catch { return 'Dados indisponiveis.'; }
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
    const regex = /c([1-5])(?:[^:]*?)\s*[:=]\s*(\d{1,3})/gi;
    let match;
    const scores = {};
    while ((match = regex.exec(reply)) !== null) {
      scores[`c${match[1]}`] = parseInt(match[2]);
    }
    if (Object.keys(scores).length >= 3) {
      const allLe10 = Object.values(scores).every(v => v <= 10);
      const comp = {};
      let total = 0;
      for (const [k, v] of Object.entries(scores)) {
        const normalized = allLe10 ? v * 20 : v;
        comp[k] = normalized;
        total += normalized;
      }
      this.lastScores = { comp, media: Math.round(total) };
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
    const chars = formatted.split('');
    let i = 0;

    const typeNextBatch = () => {
      if (i >= chars.length) {
        element.innerHTML = formatted;
        return;
      }
      const batchSize = 8;
      for (let j = 0; j < batchSize && i < chars.length; j++, i++) {
        // avanca i
      }
      element.innerHTML = formatted.slice(0, i) + '<span class="redbot-cursor">|</span>';

      const nextChar = i < chars.length ? chars[i] : '';
      let delay = REDBOT_CONFIG.typingDelay;
      if (nextChar.match(/[.,!?;\\n]/)) delay = 35;
      else if (nextChar === ' ') delay = 10;

      setTimeout(typeNextBatch, delay);
    };

    typeNextBatch();
  }

  formatMessage(text) {
    if (!text) return '';
    let safe = text.replace(/[<>]/g, function(m) { return m === '<' ? '&lt;' : '&gt;'; });
    let html = safe
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
    const setDisabled = (el) => {
      if (!el) return;
      el.disabled = !enabled;
      el.style.opacity = enabled ? '' : '0.5';
      el.style.cursor = enabled ? '' : 'not-allowed';
    };
    setDisabled(this.inputElement);
    setDisabled(this.sendButton);
    setDisabled(this.essayTextarea);
    setDisabled(this.essaySendBtn);
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
  // RELATORIO
  // ════════════════════════════════════════════════════════════════════════════

  generateReport() {
    let r = '=== RELATORIO PROFESSOR DE REDACAO ===\n\n';
    r += `Mensagens: ${this.conversationHistory.length}\n`;
    r += `Ultima nota: ${this.lastScores ? this.lastScores.media + '/1000' : 'N/A'}\n\n`;
    r += '=== ULTIMAS INTERACOES ===\n';
    const recent = this.conversationHistory.slice(-6);
    for (let i = 0; i < recent.length; i += 2) {
      if (recent[i]) r += `\nAluno: ${recent[i].content.slice(0, 80)}...\n`;
      if (recent[i + 1]) r += `Professor: ${recent[i + 1].content.slice(0, 80)}...\n`;
    }
    return r;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// INSTANCIA GLOBAL
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
