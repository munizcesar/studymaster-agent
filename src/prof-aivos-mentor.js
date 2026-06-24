/**
 * 🎓 PROF. AIVOS — Mentor Virtual 360° para Concursos Públicos
 * 
 * Upgrade v2: Card de Edital Proeminente, Processamento Inteligente,
 * Ações Rápidas, Botão Alterar Edital, Histórico, Design por Contexto
 * 
 * Integra com:
 * - DigitalTwin (perfil do aluno)
 * - Worker API (geração de questões e respostas IA)
 * - ProactiveMentor (mensagens proativas)
 * - Todos os módulos AIVOS 360
 */

// ════════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO
// ════════════════════════════════════════════════════════════════════════════

const PROF_AIVOS_CONFIG = {
  workerUrl: 'https://studymaster-worker.cesarmuniz0816.workers.dev',
  maxHistoryLength: 50,
  typingDelay: 20,
  welcomeMessageDelay: 500,
  siteDomain: 'https://studymaster-agent.pages.dev'
};

// ════════════════════════════════════════════════════════════════════════════
// SYSTEM PROMPT DO PROF. AIVOS
// ════════════════════════════════════════════════════════════════════════════

const PROF_AIVOS_SYSTEM_PROMPT = `Você é o **Prof. AIVOS**, um professor virtual 360° extremamente competente, carismático, motivador e preciso. Seu objetivo é ser o mentor pessoal do aluno para concursos públicos.

### REGRAS OBRIGATÓRIAS:
1. Fale em primeira pessoa como "Prof. AIVOS". Seja direto, encorajador, mas exigente. Use linguagem natural brasileira.
2. Autonomia Total — o aluno deve conseguir fazer tudo dentro da conversa.
3. Processamento de Edital: Extraia disciplinas, pesos, vagas, banca, requisitos, fases.
4. Sempre responda de forma estruturada (markdown, emojis, listas).
5. Inclua sugestões clicáveis no final de cada resposta.

### FUNCIONALIDADES:
- Plano de Estudos personalizado baseado no edital
- Questões filtradas por disciplina, dificuldade e peso
- Orientação de redação com temas prováveis
- Simulados completos na proporção do edital
- Análise de desempenho
- Revisões inteligentes

### TOM: Profissional, motivador, preciso e humano.

DADOS DO ALUNO:
{studentData}`;

// ════════════════════════════════════════════════════════════════════════════
// CONSTANTES DE DESIGN
// ════════════════════════════════════════════════════════════════════════════

const EDITAL_KEYWORDS = [
  'edital', 'concurso público', 'inscrição', 'vagas', 'cargo', 
  'requisitos', 'atribuições', 'remuneração', 'taxa de inscrição',
  'prova objetiva', 'prova discursiva', 'avaliação de títulos',
  'banca organizadora', 'carga horária', 'jornada de trabalho',
  'conhecimentos básicos', 'conhecimentos específicos',
  'disciplinas', 'peso', 'prova', 'etapas'
];

const BANCAS = ['cespe', 'cebraspe', 'vunesp', 'fcc', 'fgv', 'fundação carlos chagas', 'cesgranrio', 'quadrix', 'ibfc', 'aocp', 'consulplan', 'instituto aocp', 'verbas', 'banca própria'];

// ════════════════════════════════════════════════════════════════════════════
// CLASSE PROF. AIVOS MENTOR
// ════════════════════════════════════════════════════════════════════════════

class ProfAivosMentor {
  constructor(aivos360Modules = {}) {
    this.modules = aivos360Modules;
    this.conversationHistory = [];
    this.currentEdital = null;
    this.currentEditalAnalysis = null; // resultado estruturado da análise
    this.currentConcurso = null;
    this.editalHistory = []; // histórico de editais analisados
    this.isProcessing = false;
    this.chatContainer = null;
    this.messagesContainer = null;
    this.inputElement = null;
    this.sendButton = null;
    this.editalInputArea = null;
    this.editalBanner = null;
    this.editalHistoryPanel = null;
    this.isInitialized = false;
    this.avatarState = 'idle'; // idle | processing | success | focus
  }

  // ════════════════════════════════════════════════════════════════════════════
  // INICIALIZAÇÃO
  // ════════════════════════════════════════════════════════════════════════════

  init() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    console.log('[Prof. AIVOS] 🎓 Mentor Virtual v2 inicializado!');
    
    // 🔧 Referência global para onclick handlers
    window.profAivosMentor = this;
    
    this.loadSession();
    this.scheduleRender();
    
    window.addEventListener('aivos360DashboardReady', () => {
      this.renderChatUI();
      this.addDashboardButton();
    });
  }

  scheduleRender() {
    // Tentativas com timeout progressivo
    const tryRender = (delay) => {
      setTimeout(() => {
        const dashboard = document.querySelector('.aivos360-dashboard');
        if (dashboard && !this.chatContainer) {
          this.renderChatUI();
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
        if (dashboard && !this.chatContainer) {
          this.renderChatUI();
          this.addDashboardButton();
          // Desconectar observer após renderizar
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
  // PERSISTÊNCIA DE SESSÃO (com histórico de editais)
  // ════════════════════════════════════════════════════════════════════════════

  saveSession() {
    try {
      const session = {
        history: this.conversationHistory.slice(-20),
        currentEdital: this.currentEdital,
        currentEditalAnalysis: this.currentEditalAnalysis,
        currentConcurso: this.currentConcurso,
        editalHistory: this.editalHistory.slice(-10),
        timestamp: Date.now()
      };
      localStorage.setItem('profAivosSession', JSON.stringify(session));
    } catch (e) {
      console.warn('[Prof. AIVOS] Erro ao salvar sessão:', e);
    }
  }

  loadSession() {
    try {
      const saved = localStorage.getItem('profAivosSession');
      if (saved) {
        const session = JSON.parse(saved);
        if (session.timestamp && Date.now() - session.timestamp < 86400000) {
          this.conversationHistory = session.history || [];
          this.currentEdital = session.currentEdital || null;
          this.currentEditalAnalysis = session.currentEditalAnalysis || null;
          this.currentConcurso = session.currentConcurso || null;
          this.editalHistory = session.editalHistory || [];
          console.log('[Prof. AIVOS] Sessão restaurada com', this.conversationHistory.length, 'mensagens');
        }
      }
    } catch (e) {
      console.warn('[Prof. AIVOS] Erro ao carregar sessão:', e);
    }
  }

  clearSession() {
    this.conversationHistory = [];
    this.currentEdital = null;
    this.currentEditalAnalysis = null;
    this.currentConcurso = null;
    localStorage.removeItem('profAivosSession');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // DADOS DO ALUNO
  // ════════════════════════════════════════════════════════════════════════════

  getStudentData() {
    const twin = this.modules.digitalTwin;
    if (!twin) return 'Nenhum dado disponível ainda.';
    const profile = twin.getProfile();
    if (!profile) return 'Perfil do aluno ainda não iniciado.';

    const perf = profile.performance;
    const questions = perf?.questions || {};
    const byDiscipline = questions.byDiscipline || {};
    const disciplines = Object.entries(byDiscipline)
      .map(([d, s]) => `${d}: ${s.correct}/${s.total} (${s.total > 0 ? Math.round(s.correct/s.total*100) : 0}%)`)
      .join(', ');

    let gaps = '', risks = '', mastery = '';

    if (this.modules.gapDetector) {
      const g = this.modules.gapDetector.getGaps();
      if (g.length > 0) gaps = g.slice(0, 3).map(x => x.type).join(', ');
    }
    if (this.modules.riskDetector) {
      const alerts = this.modules.riskDetector.getAlerts();
      if (alerts.length > 0) risks = alerts.slice(0, 3).map(a => a.type).join(', ');
    }
    if (this.modules.masteryCertifier) {
      const levels = this.modules.masteryCertifier.getMasteryLevels();
      const mastered = Object.entries(levels).filter(([_, m]) => m.level >= 3);
      if (mastered.length > 0) mastery = mastered.map(([t, m]) => `${t} (lvl ${m.level})`).join(', ');
    }

    return `
DADOS DO ALUNO:
- Total de questões: ${questions.total || 0}
- Acertos: ${questions.correct || 0} (${questions.total > 0 ? Math.round((questions.correct || 0) / questions.total * 100) : 0}%)
- Disciplinas: ${disciplines || 'Nenhuma ainda'}
- Lacunas: ${gaps || 'Nenhuma'}
- Riscos: ${risks || 'Nenhum'}
- Domínios: ${mastery || 'Nenhum'}
- Redações: ${perf?.essays?.total || 0}
- Simulados: ${perf?.simulados?.total || 0}
- Edital: ${this.currentConcurso || 'Nenhum'}
`;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PROCESSAMENTO DE EDITAL (local, inteligente)
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Processa um edital extraindo informações estruturadas
   */
  processEditalTexto(text) {
    const analysis = {
      concursoNome: '',
      banca: '',
      vagas: 0,
      fases: [],
      disciplinas: [],
      requisitos: '',
      dataProva: '',
      raw: text.slice(0, 800)
    };

    const lines = text.split('\n').filter(l => l.trim());
    const fullText = text.toLowerCase();

    // 1. Detectar banca
    for (const banca of BANCAS) {
      if (fullText.includes(banca)) {
        analysis.banca = banca.charAt(0).toUpperCase() + banca.slice(1);
        break;
      }
    }

    // 2. Extrair vagas
    const vagasMatch = text.match(/(\d+\.?\d*)\s*(vagas?|vaga)/i);
    if (vagasMatch) analysis.vagas = parseInt(vagasMatch[1].replace('.', ''));

    // 3. Detectar fases
    const faseKeywords = [
      { key: 'prova objetiva', label: 'Prova Objetiva' },
      { key: 'prova discursiva', label: 'Prova Discursiva' },
      { key: 'redação', label: 'Redação' },
      { key: 'avaliação de títulos', label: 'Avaliação de Títulos' },
      { key: 'prova de títulos', label: 'Prova de Títulos' },
      { key: 'teste físico', label: 'Teste Físico' },
      { key: 'avaliação psicológica', label: 'Avaliação Psicológica' },
      { key: 'prova oral', label: 'Prova Oral' },
      { key: 'curso de formação', label: 'Curso de Formação' },
    ];
    for (const fase of faseKeywords) {
      if (fullText.includes(fase.key)) analysis.fases.push(fase.label);
    }

    // 4. Extrair nome do concurso (primeiras linhas)
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim();
      if (line.length > 10 && line.length < 120 && 
          !line.toLowerCase().includes('edital') &&
          !line.toLowerCase().includes('inscrição')) {
        analysis.concursoNome = line.replace(/^["\s]+|["\s]+$/g, '');
        break;
      }
    }

    // 5. Detectar disciplinas
    const disciplinasConhecidas = [
      'português', 'língua portuguesa', 'gramática', 'interpretação de textos',
      'direito constitucional', 'direito administrativo', 'direito penal',
      'direito processual penal', 'direito processual civil', 'direito civil',
      'direito tributário', 'direito trabalhista', 'direito previdenciário',
      'direito financeiro', 'direito internacional', 'direito ambiental',
      'direito eleitoral', 'direito empresarial', 'direito do consumidor',
      'legislação específica', 'legislação especial',
      'raciocínio lógico', 'raciocínio lógico-matemático', 'matemática',
      'estatística', 'informática', 'noções de informática',
      'atualidades', 'conhecimentos gerais', 'atualidades do mercado',
      'administração pública', 'administração geral', 'administração financeira',
      'gestão de pessoas', 'gestão de projetos',
      'contabilidade', 'contabilidade geral', 'contabilidade pública',
      'economia', 'microeconomia', 'macroeconomia',
      'língua inglesa', 'inglês', 'língua estrangeira',
      'saúde pública', 'epidemiologia', 'políticas públicas de saúde',
      'sus', 'sistema único de saúde',
      'educação', 'legislação educacional', 'libras',
      'ética', 'ética no serviço público', 'ética profissional',
      'regime jurídico único', 'lei 8.112', 'lei 8.666', 'lei 14.133',
      'licitações', 'contratos administrativos',
      'controle interno', 'controle externo', 'auditoria'
    ];

    for (const disc of disciplinasConhecidas) {
      if (fullText.includes(disc)) {
        // Evitar duplicatas
        if (!analysis.disciplinas.some(d => d.nome.toLowerCase() === disc)) {
          analysis.disciplinas.push({
            nome: disc.charAt(0).toUpperCase() + disc.slice(1),
            peso: 1,
            detectado: true
          });
        }
      }
    }

    // 6. Tentar extrair pesos das disciplinas
    const pesoRegex = /(\d+)\s*(ponto|peso|questão|questoes)/gi;
    let pesoMatch;
    while ((pesoMatch = pesoRegex.exec(text)) !== null) {
      // Procurar disciplina próxima
      const pos = pesoMatch.index;
      for (const disc of analysis.disciplinas) {
        const discIdx = text.toLowerCase().indexOf(disc.nome.toLowerCase());
        if (discIdx >= 0 && Math.abs(pos - discIdx) < 150) {
          disc.peso = parseInt(pesoMatch[1]) || disc.peso;
        }
      }
    }

    // 7. Extrair requisitos
    const reqSection = text.match(/(?:requisitos?|atribuições? do cargo)[:\s]*([\s\S]*?)(?:\n\s*\n|\n[A-Z]|$)/i);
    if (reqSection) analysis.requisitos = reqSection[1].trim().slice(0, 300);

    return analysis;
  }

  /**
   * Gera um resumo estruturado do edital para exibir no chat
   */
  generateEditalSummary(analysis) {
    let summary = `## 📋 Análise do Edital\n\n`;

    if (analysis.concursoNome) {
      summary += `**Concurso:** ${analysis.concursoNome}\n`;
    }
    if (analysis.banca) {
      summary += `**Banca:** ${analysis.banca}\n`;
    }
    if (analysis.vagas > 0) {
      summary += `**Vagas:** ${analysis.vagas}\n\n`;
    }

    if (analysis.fases.length > 0) {
      summary += `**Etapas:** ${analysis.fases.join(' → ')}\n\n`;
    }

    if (analysis.disciplinas.length > 0) {
      summary += `**📚 Disciplinas do Edital (${analysis.disciplinas.length}):**\n`;
      // Ordenar por peso
      const sorted = [...analysis.disciplinas].sort((a, b) => b.peso - a.peso);
      for (const disc of sorted) {
        const pesoIndicator = disc.peso > 1 ? ' 🔥' : '';
        summary += `- ${disc.nome}${pesoIndicator}\n`;
      }
      summary += '\n';
    }

    summary += `**✅ O que posso fazer agora:**\n`;
    summary += `1. Montar um **Plano de Estudos** personalizado\n`;
    summary += `2. Iniciar **questões** filtradas por disciplina\n`;
    summary += `3. Criar um **simulado** na proporção exata do edital\n`;
    summary += `4. Identificar **pontos prioritários** de estudo\n`;
    summary += `5. Preparar **temas de redação** prováveis\n\n`;

    summary += `**👉 O que você quer fazer primeiro?**`;

    return summary;
  }

  /**
   * Renderiza as ações rápidas pós-análise de edital
   */
  renderQuickActions(analysis) {
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'prof-aivos-quick-actions';
    
    const disciplinasSlug = analysis.disciplinas.map(d => d.nome.toLowerCase().normalize('NFD').replace(/[^a-z\s]/g, '').trim()).join(',');
    const encodedDisciplinas = encodeURIComponent(disciplinasSlug);

    actionsDiv.innerHTML = `
      <div class="prof-aivos-qa-header">
        <span class="prof-aivos-qa-icon">🚀</span>
        <span class="prof-aivos-qa-title">Ações Rápidas</span>
      </div>
      <div class="prof-aivos-qa-grid">
        <button class="prof-aivos-qa-btn prof-aivos-qa-primary" onclick="window.profAivosMentor.handleQuickAction('questoes')">
          <span class="prof-aivos-qa-btn-icon">📝</span>
          <span class="prof-aivos-qa-btn-label">Iniciar Questões do Edital</span>
          <span class="prof-aivos-qa-btn-sub">Filtrar por disciplinas</span>
        </button>
        <button class="prof-aivos-qa-btn prof-aivos-qa-success" onclick="window.profAivosMentor.handleQuickAction('simulado')">
          <span class="prof-aivos-qa-btn-icon">📊</span>
          <span class="prof-aivos-qa-btn-label">Montar Simulado Completo</span>
          <span class="prof-aivos-qa-btn-sub">Proporção exata do edital</span>
        </button>
        <button class="prof-aivos-qa-btn prof-aivos-qa-warning" onclick="window.profAivosMentor.handleQuickAction('fraquezas')">
          <span class="prof-aivos-qa-btn-icon">🎯</span>
          <span class="prof-aivos-qa-btn-label">Focar em Pontos Fracos</span>
          <span class="prof-aivos-qa-btn-sub">Baseado no seu desempenho</span>
        </button>
        <button class="prof-aivos-qa-btn prof-aivos-qa-info" onclick="window.profAivosMentor.handleQuickAction('materiais')">
          <span class="prof-aivos-qa-btn-icon">📚</span>
          <span class="prof-aivos-qa-btn-label">Materiais Recomendados</span>
          <span class="prof-aivos-qa-btn-sub">Por disciplina do edital</span>
        </button>
        <button class="prof-aivos-qa-btn prof-aivos-qa-danger" onclick="window.profAivosMentor.handleQuickAction('redacao')">
          <span class="prof-aivos-qa-btn-icon">✍️</span>
          <span class="prof-aivos-qa-btn-label">Preparação para Redação</span>
          <span class="prof-aivos-qa-btn-sub">Temas prováveis do concurso</span>
        </button>
        <button class="prof-aivos-qa-btn prof-aivos-qa-plan" onclick="window.profAivosMentor.handleQuickAction('plano')">
          <span class="prof-aivos-qa-btn-icon">📅</span>
          <span class="prof-aivos-qa-btn-label">Ver Plano de Estudos</span>
          <span class="prof-aivos-qa-btn-sub">Cronograma semanal</span>
        </button>
      </div>
    `;

    return actionsDiv;
  }

  /**
   * Manipula clique nas ações rápidas
   */
  handleQuickAction(action) {
    switch (action) {
      case 'questoes':
        this.addQuickMessage('Quero resolver questões do edital');
        break;
      case 'simulado':
        this.addQuickMessage('Quero fazer um simulado completo baseado no edital');
        break;
      case 'fraquezas':
        this.addQuickMessage('Quero focar nos meus pontos fracos');
        break;
      case 'materiais':
        this.addQuickMessage('Quero recomendações de materiais de estudo');
        break;
      case 'redacao':
        this.addQuickMessage('Quero treinar redação para o concurso');
        break;
      case 'plano':
        this.addQuickMessage('Quero ver meu plano de estudos');
        break;
      default:
        break;
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // CHAT COM IA + FALLBACK ESTRUTURADO
  // ════════════════════════════════════════════════════════════════════════════

  async sendToAI(userMessage) {
    try {
      const response = await fetch(PROF_AIVOS_CONFIG.workerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'prof-aivos',
          message: userMessage,
          history: this.conversationHistory.slice(-10),
          studentData: this.getStudentData(),
          currentEdital: this.currentEdital?.slice(0, 500),
          currentEditalAnalysis: this.currentEditalAnalysis,
          currentConcurso: this.currentConcurso,
          timestamp: Date.now()
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      return data.reply || 'Desculpe, não consegui processar sua solicitação. Pode tentar novamente?';
    } catch (error) {
      console.error('[Prof. AIVOS] Erro na comunicação com IA:', error);
      return this.getLocalFallbackResponse(userMessage);
    }
  }

  /**
   * Fallback local agora inclui respostas mais ricas pós-análise de edital
   */
  getLocalFallbackResponse(userMessage) {
    const msg = userMessage.toLowerCase();

    // Se tem edital configurado, respostas são mais específicas
    if (this.currentEditalAnalysis) {
      const edital = this.currentEditalAnalysis;
      
      if (msg.includes('questão') || msg.includes('questoes') || msg.includes('praticar')) {
        let reply = `📝 **Questões Filtradas pelo Edital**\n\n`;
        reply += `Baseado no edital de **${edital.concursoNome || 'seu concurso'}**, temos ${edital.disciplinas.length} disciplinas para praticar:\n\n`;
        
        const sorted = [...edital.disciplinas].sort((a, b) => b.peso - a.peso);
        for (const disc of sorted.slice(0, 6)) {
          const fire = disc.peso > 1 ? ' 🔥' : '';
          reply += `- **${disc.nome}**${fire}\n`;
        }
        
        reply += `\n**👉 Qual disciplina você quer praticar primeiro?**`;
        return reply;
      }

      if (msg.includes('simulado')) {
        let reply = `📊 **Simulado Personalizado — ${edital.concursoNome || 'Edital Configurado'}**\n\n`;
        reply += `Com base na análise do edital, seu simulado ideal teria:\n\n`;
        
        const totalQ = 40;
        const sorted = [...edital.disciplinas].sort((a, b) => b.peso - a.peso);
        for (const disc of sorted.slice(0, 5)) {
          const qtd = Math.max(2, Math.round((disc.peso / sorted.reduce((s, d) => s + d.peso, 0)) * totalQ));
          reply += `- **${disc.nome}**: ${qtd} questões\n`;
        }
        
        reply += `\n📌 **Dificuldade sugerida:** Média (seguindo o padrão da banca ${edital.banca || 'do concurso'})`;
        reply += `\n\n**👉 Quer iniciar o simulado agora?**`;
        return reply;
      }
    }

    // Fallbacks padrão (mesmo do v1 mas mantidos)
    if (msg.includes('edital') || msg.includes('concurso') || msg.includes('prova')) {
      return `🎯 **Ótimo! Vamos analisar esse edital!**\n\nPara te ajudar da melhor forma:\n\n📋 **Me informe:**\n1. Cole o **edital completo** (ou o link)\n2. Ou digite o **nome do concurso**\n3. Qual a **banca organizadora**? (se souber)\n\nCom isso posso:\n✅ Extrair disciplinas, pesos e fases\n✅ Montar plano de estudos personalizado\n✅ Criar simulados na proporção exata\n✅ Focar nos pontos mais importantes\n\n**👉 Cole o edital ou digite o nome do concurso!**`;
    }

    if (msg.includes('plano') || msg.includes('estudo') || msg.includes('cronograma')) {
      return `📚 **Plano de Estudos Personalizado**\n\nPara montar o plano ideal:\n\n1️⃣ **Qual concurso?**\n2️⃣ **Horas/dia disponíveis?**\n3️⃣ **Nível atual?** (Iniciante/Intermediário/Avançado)\n4️⃣ **Data da prova?**\n\nCom essas info, crio:\n📅 Cronograma semanal\n📊 Distribuição por peso no edital\n🔄 Ciclos de revisão espaçada\n✅ Metas diárias realistas\n\n**👉 Me responda para começarmos!** 🚀`;
    }

    if (msg.includes('questão') || msg.includes('questoes') || msg.includes('praticar')) {
      return `📝 **Resolver Questões? Excelente!**\n\nDisciplinas disponíveis:\n🔹 Direito Constitucional | Direito Administrativo | Direito Penal\n🔹 Português | Raciocínio Lógico | Informática\n🔹 Atualidades | Legislação | E muito mais!\n\n**👉 Qual disciplina você quer praticar?**`;
    }

    if (msg.includes('redação') || msg.includes('redacao') || msg.includes('reda') || msg.includes('escrever')) {
      return `✍️ **Treino de Redação**\n\nOpções:\n1️⃣ **Tema guiado** — Eu oriento passo a passo\n2️⃣ **Correção** — Você escreve, eu analiso\n3️⃣ **Temas prováveis** — Baseado no seu concurso\n\n**👉 Qual opção prefere?**`;
    }

    if (msg.includes('simulado')) {
      return `📊 **Simulado Personalizado**\n\n**Preciso saber:**\n- Concurso ou disciplina?\n- Quantas questões?\n- Dificuldade?\n\nCom base no edital, monto um simulado com proporção exata por disciplina! 🎯\n\n**👉 Me diga os detalhes!**`;
    }

    if (msg.includes('desempenho') || msg.includes('resultado') || msg.includes('nota') || msg.includes('acerto')) {
      return `📈 **Análise de Desempenho**\n\n📊 Suas métricas atuais:\n- Questões respondidas\n- Taxa de acertos por disciplina\n- Disciplinas fortes e fracas\n- Previsão de aprovação\n- Revisões pendentes\n\n**👉 Quer uma análise completa?**`;
    }

    if (msg.includes('olá') || msg.includes('oi') || msg.includes('bom dia') || msg.includes('boa tarde') || msg.includes('boa noite') || msg.includes('hey')) {
      return `🎓 **Olá! Eu sou o Prof. AIVOS!** 👋\n\nSeu mentor virtual 360° para concursos. Posso ajudar com:\n\n📄 **Analisar Editais** — Cole o edital ou digite o concurso\n📚 **Plano de Estudos** — Personalizado\n📝 **Questões** — Filtradas por disciplina\n✍️ **Redação** — Orientação completa\n📊 **Simulados** — Na proporção do edital\n📈 **Análise de Desempenho**\n\n**👉 Por onde começamos?** 🚀`;
    }

    return `🎓 **Prof. AIVOS aqui!**\n\nEntendi! Para te ajudar melhor:\n\n📄 Analisar edital | 📚 Plano de estudos | 📝 Questões\n✍️ Redação | 📊 Simulados | 📈 Análise de desempenho\n\n**👉 Me conte mais sobre o que precisa!**`;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // GERENCIAMENTO DE CONVERSA (com processamento de edital)
  // ════════════════════════════════════════════════════════════════════════════

  async processMessage(userMessage) {
    if (this.isProcessing || !userMessage.trim()) return;
    
    this.isProcessing = true;
    this.setAvatarState('processing');
    this.setInputState(false);

    // Adicionar mensagem do usuário
    this.addMessageToChat(userMessage, 'user');
    this.conversationHistory.push({ role: 'user', content: userMessage });

    // DETECTAR E PROCESSAR EDITAL
    let editalProcessed = false;
    if (this.detectEdital(userMessage)) {
      this.currentEdital = userMessage;
      const analysis = this.processEditalTexto(userMessage);
      this.currentEditalAnalysis = analysis;
      
      // Salvar no histórico
      const nome = analysis.concursoNome || 'Edital analisado';
      this.editalHistory.push({
        nome,
        banca: analysis.banca,
        disciplinas: analysis.disciplinas.length,
        timestamp: Date.now()
      });
      
      // Se tem nome, configurar como concurso atual
      if (analysis.concursoNome) {
        this.currentConcurso = analysis.concursoNome;
      }
      
      editalProcessed = true;
    }

    this.showTypingIndicator();

    try {
      let reply;
      
      if (editalProcessed) {
        // Resposta local estruturada para o edital + envio para IA enriquecer
        const summary = this.generateEditalSummary(this.currentEditalAnalysis);
        reply = summary;
        
        // Também tenta enriquecer com IA
        try {
          const aiReply = await this.sendToAI(userMessage);
          // Se a IA retornou algo útil, usar
          if (aiReply && aiReply.length > 50) {
            reply = aiReply;
          }
        } catch (e) {
          // Fallback para resposta local já está pronto
        }
      } else {
        reply = await this.sendToAI(userMessage);
      }

      this.hideTypingIndicator();

      await this.addMessageWithTyping(reply, 'coach');
      this.conversationHistory.push({ role: 'assistant', content: reply });
      
      this.setAvatarState('success');

      // Renderizar ações rápidas se edital foi processado
      if (editalProcessed && this.currentEditalAnalysis) {
        const actionsEl = this.renderQuickActions(this.currentEditalAnalysis);
        this.messagesContainer.appendChild(actionsEl);
        this.scrollToBottom();
        
        // Atualizar banner do edital
        this.updateEditalBanner();
        
        // Disparar evento de edital processado
        window.dispatchEvent(new CustomEvent('profAivosEditalProcessed', { 
          detail: this.currentEditalAnalysis 
        }));
      }

      this.saveSession();

    } catch (error) {
      this.hideTypingIndicator();
      this.addMessageToChat('Desculpe, ocorreu um erro. Pode tentar novamente?', 'coach');
      this.setAvatarState('idle');
      console.error('[Prof. AIVOS] Erro:', error);
    }

    this.isProcessing = false;
    this.setInputState(true);
    this.scrollToBottom();
  }

  detectEdital(text) {
    const lowerText = text.toLowerCase();
    const matches = EDITAL_KEYWORDS.filter(k => lowerText.includes(k));
    return matches.length >= 3 && text.length > 200;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ESTADO DO AVATAR
  // ════════════════════════════════════════════════════════════════════════════

  setAvatarState(state) {
    this.avatarState = state;
    const avatar = document.querySelector('.prof-aivos-avatar-icon');
    if (!avatar) return;
    
    switch (state) {
      case 'idle': avatar.textContent = '🎓'; break;
      case 'processing': avatar.textContent = '🧠'; break;
      case 'success': 
        avatar.textContent = '🎯'; 
        setTimeout(() => { if (this.avatarState === 'success') this.setAvatarState('idle'); }, 2000);
        break;
      case 'focus': avatar.textContent = '🔥'; break;
      default: avatar.textContent = '🎓';
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RENDERIZAÇÃO DO CHAT (com card de edital proeminente)
  // ════════════════════════════════════════════════════════════════════════════

  renderChatUI(containerId = 'prof-aivos-chat-area') {
    const container = document.getElementById(containerId);
    if (!container) {
      this.createChatContainer();
      return;
    }
    this.setupChatContainer(container);
  }

  createChatContainer() {
    const dashboard = document.querySelector('.aivos360-dashboard');
    if (!dashboard) {
      console.warn('[Prof. AIVOS] Dashboard não encontrado');
      return;
    }

    const chatWrapper = document.createElement('div');
    chatWrapper.id = 'prof-aivos-chat-area';
    chatWrapper.className = 'prof-aivos-chat-area';
    dashboard.appendChild(chatWrapper);
    this.setupChatContainer(chatWrapper);
  }

  setupChatContainer(container) {
    container.innerHTML = `
      <!-- HEADER -->
      <div class="prof-aivos-header">
        <div class="prof-aivos-avatar">
          <span class="prof-aivos-avatar-icon">🎓</span>
        </div>
        <div class="prof-aivos-info">
          <strong class="prof-aivos-name">Prof. AIVOS</strong>
          <span class="prof-aivos-status">
            <span class="prof-aivos-dot"></span>
            Online — Mentor Virtual 360°
          </span>
        </div>
        <div class="prof-aivos-actions">
          <button class="prof-aivos-clear-btn" onclick="window.profAivosMentor.clearSessionAndReload()" title="Nova conversa">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            Nova conversa
          </button>
        </div>
      </div>

      <!-- BANNER DO EDITAL ATIVO -->
      <div class="prof-aivos-edital-banner" id="prof-aivos-edital-banner" style="display:${this.currentEditalAnalysis ? 'flex' : 'none'}">
        <div class="prof-aivos-edital-banner-icon">📋</div>
        <div class="prof-aivos-edital-banner-info">
          <strong class="prof-aivos-edital-banner-name">${this.currentConcurso || 'Edital Configurado'}</strong>
          <span class="prof-aivos-edital-banner-meta">
            ${this.currentEditalAnalysis?.disciplinas.length || 0} disciplinas
            ${this.currentEditalAnalysis?.banca ? `· ${this.currentEditalAnalysis.banca}` : ''}
            ${this.currentEditalAnalysis?.vagas > 0 ? `· ${this.currentEditalAnalysis.vagas} vagas` : ''}
          </span>
        </div>
        <button class="prof-aivos-edital-banner-btn" onclick="window.profAivosMentor.showEditalHistory()" title="Alterar Edital">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Alterar
        </button>
      </div>

      <!-- CARD DE INPUT DE EDITAL (proeminente, gradiente azul→ciano) -->
      <div class="prof-aivos-edital-card" id="prof-aivos-edital-card" style="display:${this.currentEditalAnalysis ? 'none' : 'block'}">
        <div class="prof-aivos-edital-card-bg"></div>
        <div class="prof-aivos-edital-card-content">
          <div class="prof-aivos-edital-card-header">
            <span class="prof-aivos-edital-card-icon">🚀</span>
            <h3 class="prof-aivos-edital-card-title">Vamos personalizar seu plano?</h3>
          </div>
          <div class="prof-aivos-edital-card-grid">
            <div class="prof-aivos-edital-card-field">
              <label class="prof-aivos-edital-card-label">📄 Cole o texto do edital aqui</label>
              <textarea 
                id="prof-aivos-edital-textarea"
                class="prof-aivos-edital-card-textarea"
                rows="4"
                placeholder="Cole aqui o conteúdo do edital para análise completa..."
                oninput="window.profAivosMentor.onEditalInputChange()"
              ></textarea>
            </div>
            <div class="prof-aivos-edital-card-field">
              <label class="prof-aivos-edital-card-label">🔍 Ou digite o nome do concurso</label>
              <input 
                type="text"
                id="prof-aivos-concurso-input"
                class="prof-aivos-edital-card-input"
                placeholder="Ex: PF 2026, TRT 15ª Região, INSS, PFN, etc."
                oninput="window.profAivosMentor.onConcursoInputChange()"
              />
              <button class="prof-aivos-edital-card-btn" id="prof-aivos-edital-analyze-btn" onclick="window.profAivosMentor.analyzeEditalFromCard()" disabled>
                Analisar e Montar Plano Personalizado
              </button>
            </div>
          </div>
          ${this.editalHistory.length > 0 ? `
          <div class="prof-aivos-edital-card-history">
            <button class="prof-aivos-edital-card-history-btn" onclick="window.profAivosMentor.showEditalHistory()">
              📋 Ver editais analisados (${this.editalHistory.length})
            </button>
          </div>` : ''}
        </div>
      </div>

      <!-- MENSAGENS DO CHAT -->
      <div class="prof-aivos-messages" id="prof-aivos-messages">
        ${this.currentEditalAnalysis ? '' : `
        <div class="prof-aivos-welcome">
          <div class="prof-aivos-welcome-icon">🎓</div>
          <div class="prof-aivos-welcome-text">
            <strong>Olá! Eu sou o Prof. AIVOS!</strong>
            <p>Seu mentor virtual 360° para concursos públicos. Cole um edital ou me diga o concurso!</p>
          </div>
          <div class="prof-aivos-suggestions">
            <button class="prof-aivos-suggestion" onclick="document.getElementById('prof-aivos-edital-textarea')?.focus()">
              📄 Colar Edital
            </button>
            <button class="prof-aivos-suggestion" onclick="document.getElementById('prof-aivos-concurso-input')?.focus()">
              🔍 Digitar Concurso
            </button>
            <button class="prof-aivos-suggestion" onclick="window.profAivosMentor.addQuickMessage('Quero montar um plano de estudos')">
              📚 Plano de Estudos
            </button>
            <button class="prof-aivos-suggestion" onclick="window.profAivosMentor.addQuickMessage('Quero resolver questões agora')">
              📝 Resolver Questões
            </button>
          </div>
        </div>`}
      </div>

      <!-- AÇÕES RÁPIDAS (aparece após análise do edital) -->
      <div class="prof-aivos-quick-actions-bar" id="prof-aivos-quick-actions-bar" style="display:none">
        <button class="prof-aivos-qa-bar-btn" onclick="window.profAivosMentor.handleQuickAction('questoes')" title="Questões do Edital">📝</button>
        <button class="prof-aivos-qa-bar-btn" onclick="window.profAivosMentor.handleQuickAction('simulado')" title="Simulado">📊</button>
        <button class="prof-aivos-qa-bar-btn" onclick="window.profAivosMentor.handleQuickAction('fraquezas')" title="Pontos Fracos">🎯</button>
        <button class="prof-aivos-qa-bar-btn" onclick="window.profAivosMentor.handleQuickAction('plano')" title="Plano de Estudos">📅</button>
        <button class="prof-aivos-qa-bar-btn" onclick="window.profAivosMentor.handleQuickAction('redacao')" title="Redação">✍️</button>
        <button class="prof-aivos-qa-bar-btn" onclick="window.profAivosMentor.handleQuickAction('materiais')" title="Materiais">📚</button>
      </div>

      <!-- INPUT ÁREA -->
      <div class="prof-aivos-input-area">
        <textarea 
          class="prof-aivos-input" 
          id="prof-aivos-input" 
          placeholder="Digite sua mensagem para o Prof. AIVOS..."
          rows="1"
          oninput="window.profAivosMentor.autoResizeInput(this); window.profAivosMentor.onChatInputChange()"
          onkeydown="window.profAivosMentor.handleInputKeydown(event)"
        ></textarea>
        <button class="prof-aivos-send-btn" id="prof-aivos-send" onclick="window.profAivosMentor.sendFromInput()" disabled>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    `;

    this.chatContainer = container;
    this.messagesContainer = container.querySelector('#prof-aivos-messages');
    this.inputElement = container.querySelector('#prof-aivos-input');
    this.sendButton = container.querySelector('#prof-aivos-send');
    this.editalInputArea = container.querySelector('#prof-aivos-edital-card');
    this.editalBanner = container.querySelector('#prof-aivos-edital-banner');
    this.quickActionsBar = container.querySelector('#prof-aivos-quick-actions-bar');

    // Mostrar barra de ações se já tem edital
    if (this.currentEditalAnalysis) {
      this.quickActionsBar.style.display = 'flex';
    }

    // Event listeners
    this.inputElement.addEventListener('input', () => {
      this.sendButton.disabled = !this.inputElement.value.trim();
    });

    if (this.conversationHistory.length > 0) {
      this.restoreChatHistory();
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // INTERAÇÃO COM CARD DE EDITAL
  // ════════════════════════════════════════════════════════════════════════════

  onEditalInputChange() {
    const textarea = document.getElementById('prof-aivos-edital-textarea');
    const concursoInput = document.getElementById('prof-aivos-concurso-input');
    const btn = document.getElementById('prof-aivos-edital-analyze-btn');
    if (btn) {
      btn.disabled = !(textarea?.value?.trim() || concursoInput?.value?.trim());
    }
  }

  onConcursoInputChange() {
    this.onEditalInputChange();
  }

  onChatInputChange() {
    // Se o usuário está digitando no chat e tem algo relevante, esconder sugestões
  }

  analyzeEditalFromCard() {
    const textarea = document.getElementById('prof-aivos-edital-textarea');
    const concursoInput = document.getElementById('prof-aivos-concurso-input');
    
    const editalText = textarea?.value?.trim();
    const concursoName = concursoInput?.value?.trim();
    
    if (editalText) {
      this.addQuickMessage(editalText);
    } else if (concursoName) {
      this.addQuickMessage(`Quero informações sobre o concurso: ${concursoName}`);
    }
    
    // Esconder card
    if (this.editalInputArea) this.editalInputArea.style.display = 'none';
  }

  /**
   * Atualiza o banner do edital ativo
   */
  updateEditalBanner() {
    if (!this.editalBanner) return;
    
    const nameEl = this.editalBanner.querySelector('.prof-aivos-edital-banner-name');
    const metaEl = this.editalBanner.querySelector('.prof-aivos-edital-banner-meta');
    
    if (nameEl) nameEl.textContent = this.currentConcurso || 'Edital Configurado';
    if (metaEl) {
      const parts = [];
      if (this.currentEditalAnalysis?.disciplinas.length) parts.push(`${this.currentEditalAnalysis.disciplinas.length} disciplinas`);
      if (this.currentEditalAnalysis?.banca) parts.push(this.currentEditalAnalysis.banca);
      if (this.currentEditalAnalysis?.vagas > 0) parts.push(`${this.currentEditalAnalysis.vagas} vagas`);
      metaEl.textContent = parts.join(' · ');
    }
    
    this.editalBanner.style.display = 'flex';
    if (this.editalInputArea) this.editalInputArea.style.display = 'none';
    if (this.quickActionsBar) this.quickActionsBar.style.display = 'flex';
  }

  /**
   * Mostra histórico de editais analisados
   */
  showEditalHistory() {
    // Criar modal de histórico
    const overlay = document.createElement('div');
    overlay.className = 'prof-aivos-history-overlay';
    overlay.innerHTML = `
      <div class="prof-aivos-history-modal">
        <div class="prof-aivos-history-header">
          <h3 class="prof-aivos-history-title">📋 Histórico de Editais</h3>
          <button class="prof-aivos-history-close" onclick="this.closest('.prof-aivos-history-overlay').remove()">✕</button>
        </div>
        <div class="prof-aivos-history-body">
          ${this.editalHistory.length === 0 ? '<p class="prof-aivos-history-empty">Nenhum edital analisado ainda.</p>' :
            this.editalHistory.slice().reverse().map((h, i) => `
              <div class="prof-aivos-history-item" onclick="window.profAivosMentor.restoreEdital(${this.editalHistory.length - 1 - i})">
                <div class="prof-aivos-history-item-icon">📄</div>
                <div class="prof-aivos-history-item-info">
                  <strong>${h.nome}</strong>
                  <span>${h.banca ? `${h.banca} · ` : ''}${h.disciplinas} disciplinas · ${new Date(h.timestamp).toLocaleDateString()}</span>
                </div>
                <button class="prof-aivos-history-item-btn">Restaurar</button>
              </div>
            `).join('')}
        </div>
        <div class="prof-aivos-history-footer">
          <button class="prof-aivos-history-footer-btn" onclick="document.getElementById('prof-aivos-edital-card').style.display='block'; this.closest('.prof-aivos-history-overlay').remove();">
            + Analisar Novo Edital
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    
    // Animação de entrada
    requestAnimationFrame(() => overlay.classList.add('active'));
  }

  /**
   * Restaura um edital do histórico
   */
  restoreEdital(index) {
    // Por simplicidade, apenas coloca o nome no input
    const item = this.editalHistory[index];
    if (!item) return;
    
    // Fechar modal
    const modal = document.querySelector('.prof-aivos-history-overlay');
    if (modal) modal.remove();
    
    this.addQuickMessage(`Quero retomar os estudos para ${item.nome}`);
  }

  clearSessionAndReload() {
    this.clearSession();
    this.currentEditalAnalysis = null;
    
    if (this.editalInputArea) this.editalInputArea.style.display = 'block';
    if (this.editalBanner) this.editalBanner.style.display = 'none';
    if (this.quickActionsBar) this.quickActionsBar.style.display = 'none';
    
    this.addMessageToChat('🧹 Sessão reiniciada! Pronto para analisar um novo edital ou concurso.', 'coach');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // MENSAGENS
  // ════════════════════════════════════════════════════════════════════════════

  addMessageToChat(text, role = 'coach', saveToHistory = true) {
    if (!this.messagesContainer) return;

    const welcome = this.messagesContainer.querySelector('.prof-aivos-welcome');
    if (welcome && role === 'user') welcome.remove();

    const messageDiv = document.createElement('div');
    messageDiv.className = `prof-aivos-msg prof-aivos-msg-${role}`;
    messageDiv.innerHTML = this.formatMessage(text);

    this.messagesContainer.appendChild(messageDiv);
    this.scrollToBottom();
    return messageDiv;
  }

  async addMessageWithTyping(text, role = 'coach') {
    if (!this.messagesContainer) return;

    const welcome = this.messagesContainer.querySelector('.prof-aivos-welcome');
    if (welcome) welcome.remove();

    const messageDiv = document.createElement('div');
    messageDiv.className = `prof-aivos-msg prof-aivos-msg-${role}`;
    this.messagesContainer.appendChild(messageDiv);

    if (role === 'coach') {
      await this.typeText(messageDiv, text);
    } else {
      messageDiv.innerHTML = this.formatMessage(text);
    }

    this.scrollToBottom();
    return messageDiv;
  }

  async typeText(element, text) {
    const formattedText = this.formatMessage(text);
    
    if (formattedText.length > 1000) {
      element.innerHTML = formattedText;
      return;
    }

    let displayed = '';
    const chars = formattedText.split('');
    
    for (let i = 0; i < chars.length; i++) {
      displayed += chars[i];
      element.innerHTML = displayed + '<span class="prof-aivos-cursor">|</span>';
      
      if (chars[i].match(/[.,!?\n]/)) {
        await this.sleep(40);
      } else if (chars[i] === ' ') {
        await this.sleep(10);
      } else {
        await this.sleep(PROF_AIVOS_CONFIG.typingDelay);
      }
    }
    
    element.innerHTML = formattedText;
  }

  formatMessage(text) {
    if (!text) return '';
    
    let html = text
      .replace(/^### (.+)$/gm, '<h3 class="prof-aivos-h3">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="prof-aivos-h2">$1</h2>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '\nPARABREAK\n');
    
    const lines = html.split('\n');
    let result = [];
    let inOrderedList = false;
    let inUnorderedList = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const orderedMatch = line.match(/^(\d+)\.\s+(.+)$/);
      const unorderedMatch = line.match(/^-\s+(.+)$/);
      const isParabreak = line === 'PARABREAK';
      
      if (orderedMatch) {
        if (!inOrderedList) {
          if (inUnorderedList) { result.push('</ul>'); inUnorderedList = false; }
          result.push('<ol class="prof-aivos-ol">');
          inOrderedList = true;
        }
        result.push(`<li class="prof-aivos-li">${orderedMatch[2]}</li>`);
      } else if (unorderedMatch) {
        if (!inUnorderedList) {
          if (inOrderedList) { result.push('</ol>'); inOrderedList = false; }
          result.push('<ul class="prof-aivos-ul">');
          inUnorderedList = true;
        }
        result.push(`<li class="prof-aivos-li-dash">${unorderedMatch[1]}</li>`);
      } else {
        if (inOrderedList) { result.push('</ol>'); inOrderedList = false; }
        if (inUnorderedList) { result.push('</ul>'); inUnorderedList = false; }
        if (isParabreak) {
          result.push('</p><p class="prof-aivos-p">');
        } else if (line.trim()) {
          result.push(line);
        }
      }
    }
    
    if (inOrderedList) result.push('</ol>');
    if (inUnorderedList) result.push('</ul>');
    
    html = result.join('\n');
    
    if (!html.startsWith('<h') && !html.startsWith('<ol') && !html.startsWith('<ul')) {
      html = '<p class="prof-aivos-p">' + html + '</p>';
    }
    
    return html;
  }

  showTypingIndicator() {
    if (!this.messagesContainer) return;
    const indicator = document.createElement('div');
    indicator.className = 'prof-aivos-msg prof-aivos-msg-coach prof-aivos-typing';
    indicator.id = 'prof-aivos-typing';
    indicator.innerHTML = `<span class="prof-aivos-typing-dots"><span class="prof-aivos-dot-anim"></span><span class="prof-aivos-dot-anim"></span><span class="prof-aivos-dot-anim"></span></span>`;
    this.messagesContainer.appendChild(indicator);
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    const indicator = document.getElementById('prof-aivos-typing');
    if (indicator) indicator.remove();
  }

  // ════════════════════════════════════════════════════════════════════════════
  // AÇÕES
  // ════════════════════════════════════════════════════════════════════════════

  addQuickMessage(text) {
    if (this.inputElement) {
      this.inputElement.value = text;
      this.sendButton.disabled = false;
      this.sendFromInput();
    }
  }

  sendFromInput() {
    const message = this.inputElement?.value?.trim();
    if (!message || this.isProcessing) return;
    this.inputElement.value = '';
    this.sendButton.disabled = true;
    this.autoResizeInput(this.inputElement);
    this.processMessage(message);
  }

  handleInputKeydown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendFromInput();
    }
  }

  autoResizeInput(textarea) {
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
  }

  setInputState(enabled) {
    if (this.inputElement) this.inputElement.disabled = !enabled;
    if (this.sendButton) this.sendButton.disabled = !enabled;
  }

  openChat() {
    if (this.chatContainer) {
      this.chatContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        if (this.inputElement) this.inputElement.focus();
      }, 500);
    }
  }

  addDashboardButton() {
    if (document.getElementById('prof-aivos-dashboard-btn')) return;
    
    const dashboard = document.querySelector('.aivos360-dashboard');
    if (!dashboard) return;
    
    if (dashboard.querySelector('.prof-aivos-dashboard-btn')) return;
    
    const mentorCard = document.createElement('div');
    mentorCard.id = 'prof-aivos-dashboard-btn';
    mentorCard.className = 'prof-aivos-dashboard-btn';
    mentorCard.innerHTML = `
      <div class="prof-aivos-db-icon">🎓</div>
      <div class="prof-aivos-db-content">
        <strong class="prof-aivos-db-title">Fale com o Prof. AIVOS</strong>
        <span class="prof-aivos-db-subtitle">Seu mentor virtual 360° — analise editais, planos de estudo, questões</span>
      </div>
      <div class="prof-aivos-db-arrow">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </div>
    `;
    mentorCard.addEventListener('click', () => this.openChat());
    
    const firstChild = dashboard.firstChild;
    if (firstChild) {
      dashboard.insertBefore(mentorCard, firstChild);
    } else {
      dashboard.appendChild(mentorCard);
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // UTILITÁRIOS
  // ════════════════════════════════════════════════════════════════════════════

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

  // ════════════════════════════════════════════════════════════════════════════
  // RELATÓRIO
  // ════════════════════════════════════════════════════════════════════════════

  generateReport() {
    let report = '=== 🎓 RELATÓRIO PROF. AIVOS v2 ===\n\n';
    report += `Total de mensagens: ${this.conversationHistory.length}\n`;
    report += `Edital configurado: ${this.currentConcurso || 'Nenhum'}\n`;
    report += `Disciplinas no edital: ${this.currentEditalAnalysis?.disciplinas.length || 0}\n`;
    report += `Banca: ${this.currentEditalAnalysis?.banca || 'N/A'}\n`;
    report += `Editais no histórico: ${this.editalHistory.length}\n\n`;
    report += '=== ÚLTIMAS INTERAÇÕES ===\n';
    
    const recent = this.conversationHistory.slice(-6);
    for (let i = 0; i < recent.length; i += 2) {
      const user = recent[i];
      const coach = recent[i + 1];
      if (user) report += `\n👤 Aluno: ${user.content.slice(0, 80)}...\n`;
      if (coach) report += `🎓 Prof. AIVOS: ${coach.content.slice(0, 80)}...\n`;
    }
    
    return report;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// INSTÂNCIA GLOBAL
// ════════════════════════════════════════════════════════════════════════════

let profAivosInstance = null;

function initProfAivosMentor(aivos360Modules = {}) {
  if (!profAivosInstance) {
    profAivosInstance = new ProfAivosMentor(aivos360Modules);
    profAivosInstance.init();
  } else if (Object.keys(aivos360Modules).length > 0) {
    profAivosInstance.setModules(aivos360Modules);
  }
  return profAivosInstance;
}

function getProfAivosMentor() {
  return profAivosInstance;
}

if (typeof window !== 'undefined') {
  window.ProfAivosMentor = ProfAivosMentor;
  window.initProfAivosMentor = initProfAivosMentor;
  window.getProfAivosMentor = getProfAivosMentor;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ProfAivosMentor, initProfAivosMentor, getProfAivosMentor };
}
