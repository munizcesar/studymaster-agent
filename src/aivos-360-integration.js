/**
 * AIVOS 360 - INTEGRAÇÃO CENTRAL
 * 
 * Responsabilidades:
 * - Inicializar todos os módulos do AIVOS Coaching 360
 * - Conectar módulos entre si
 * - Gerenciar dependências
 * - Fornecer API unificada
 * 
 * Ordem de inicialização:
 * 1. DigitalTwin (fundação)
 * 2. ForgettingPredictor (depende do DigitalTwin)
 * 3. GapDetector (depende do DigitalTwin)
 * 4. RiskDetector (depende do DigitalTwin e ForgettingPredictor)
 * 5. MasteryCertifier (depende do DigitalTwin e ForgettingPredictor)
 * 6. AIAuditor (depende do DigitalTwin)
 * 7. ApprovalPredictor (depende do DigitalTwin, ForgettingPredictor, MasteryCertifier)
 * 8. ApprovalDashboard (depende de todos os anteriores)
 * 9. ProactiveMentor (depende de todos os anteriores)
 */

// ════════════════════════════════════════════════════════════════════════════
// CLASSE AIVOS 360 INTEGRATION
// ════════════════════════════════════════════════════════════════════════════

class AIVOS360Integration {
  constructor() {
    this.modules = {};
    this.isInitialized = false;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // INICIALIZAÇÃO
  // ════════════════════════════════════════════════════════════════════════════

  async init() {
    if (this.isInitialized) {
      return this.modules;
    }

    try {
      // 1. DigitalTwin (fundação)
      this.modules.digitalTwin = window.digitalTwin;
      await this.modules.digitalTwin.init();

      // 2. ForgettingPredictor
      this.modules.forgettingPredictor = window.initForgettingPredictor(this.modules.digitalTwin);

      // 3. GapDetector
      this.modules.gapDetector = window.initGapDetector(this.modules.digitalTwin);

      // 4. RiskDetector
      this.modules.riskDetector = window.initRiskDetector(
        this.modules.digitalTwin,
        this.modules.forgettingPredictor
      );

      // 5. MasteryCertifier
      this.modules.masteryCertifier = window.initMasteryCertifier(
        this.modules.digitalTwin,
        this.modules.forgettingPredictor
      );

      // 6. AIAuditor
      this.modules.aiAuditor = await window.initAIAuditor(this.modules.digitalTwin);

      // 7. ApprovalPredictor
      this.modules.approvalPredictor = window.initApprovalPredictor(
        this.modules.digitalTwin,
        this.modules.forgettingPredictor,
        this.modules.masteryCertifier
      );

      // 8. ApprovalDashboard
      this.modules.approvalDashboard = window.initApprovalDashboard(
        this.modules.digitalTwin,
        this.modules.forgettingPredictor,
        this.modules.riskDetector,
        this.modules.masteryCertifier,
        this.modules.approvalPredictor
      );

      // 9. ProactiveMentor (agora com todos os módulos)
      this.modules.proactiveMentor = window.initProactiveMentor(
        this.modules.digitalTwin,
        this.modules.forgettingPredictor,
        this.modules.riskDetector,
        this.modules.masteryCertifier,
        this.modules.gapDetector,
        this.modules.approvalPredictor,
        this.modules.aiAuditor
      );

      // 10. AIVOS Mentor (conversacional - depende de todos)
      this.modules.profAivosMentor = window.initProfAivosMentor(this.modules);

      // 11. AIVOS Redação (redação - depende de todos)
      this.modules.coachRedbot = window.initCoachRedbot(this.modules);

      this.isInitialized = true;
      // Executar análises iniciais
      await this.runInitialAnalyses();

      return this.modules;
    } catch (error) {
      console.error('[AIVOS 360] Erro na inicialização:', error);
      throw error;
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ANÁLISES INICIAIS
  // ════════════════════════════════════════════════════════════════════════════

  async runInitialAnalyses() {
    try {
      // Analisar lacunas
      if (this.modules.gapDetector) {
        await this.modules.gapDetector.analyze();
      }

      // Analisar riscos
      if (this.modules.riskDetector) {
        await this.modules.riskDetector.analyze();
      }

      // Calcular níveis de domínio
      if (this.modules.masteryCertifier) {
        this.modules.masteryCertifier.calculateAllMasteryLevels();
      }

      // Calcular previsão de aprovação
      if (this.modules.approvalPredictor) {
        const profile = this.modules.digitalTwin.getProfile();
        this.modules.approvalPredictor.calculateApprovalProbability(profile);
      }

    } catch (error) {
      console.error('[AIVOS 360] Erro nas análises iniciais:', error);
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // INTEGRAÇÃO COM FLUXO DE QUESTÕES
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Processa resposta de questão através de todos os módulos
   */
  async processQuestionAnswer(questionData) {
    if (!this.isInitialized) {
      console.warn('[AIVOS 360] Não inicializado, ignorando processamento');
      return;
    }

    try {
      // 1. Registrar no DigitalTwin
      await this.modules.digitalTwin.recordQuestion(questionData);

      // 2. Processar no ForgettingPredictor
      if (this.modules.forgettingPredictor) {
        this.modules.forgettingPredictor.processQuestionAnswer(questionData);
      }

      // 3. Reanalisar lacunas
      if (this.modules.gapDetector) {
        await this.modules.gapDetector.analyze();
      }

      // 4. Reanalisar riscos
      if (this.modules.riskDetector) {
        await this.modules.riskDetector.analyze();
      }

      // 5. Recalcular domínio
      if (this.modules.masteryCertifier && questionData.topic) {
        this.modules.masteryCertifier.calculateMasteryLevel(questionData.topic);
      }

      // 6. Recalcular previsão de aprovação
      if (this.modules.approvalPredictor) {
        const profile = this.modules.digitalTwin.getProfile();
        this.modules.approvalPredictor.calculateApprovalProbability(profile);
      }

    } catch (error) {
      console.error('[AIVOS 360] Erro ao processar resposta:', error);
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // GETTERS
  // ════════════════════════════════════════════════════════════════════════════

  getModules() {
    return this.modules;
  }

  getModule(name) {
    return this.modules[name];
  }

  isReady() {
    return this.isInitialized;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RELATÓRIO DE STATUS
  // ════════════════════════════════════════════════════════════════════════════
  getStatusReport() {
    const moduleStatus = {};
    
    for (const [name, module] of Object.entries(this.modules)) {
      moduleStatus[name] = {
        loaded: !!module,
        type: module?.constructor?.name || 'unknown'
      };
    }

    return {
      initialized: this.isInitialized,
      modules: moduleStatus,
      timestamp: Date.now()
    };
  }

  getProfAivosMentor() {
    return this.modules.profAivosMentor || null;
  }

  generateFullReport() {
    let report = '=== AIVOS 360 STATUS REPORT ===\n\n';
    report += `Inicializado: ${this.isInitialized ? 'Sim' : 'Não'}\n`;
    report += `Timestamp: ${new Date().toLocaleString()}\n\n`;

    report += '=== MÓDULOS ===\n';
    for (const [name, module] of Object.entries(this.modules)) {
      report += `${name}: ${module ? 'Carregado' : 'Não carregado'}\n`;
    }

    if (this.modules.digitalTwin) {
      report += '\n=== DIGITAL TWIN ===\n';
      const profile = this.modules.digitalTwin.getProfile();
      if (profile) {
        report += `Student ID: ${profile.studentId}\n`;
        report += `Questões totais: ${profile.performance.questions.total}\n`;
        report += `Acertos: ${profile.performance.questions.correct}\n`;
      }
    }

    if (this.modules.gapDetector) {
      report += '\n=== LACUNAS ===\n';
      const gaps = this.modules.gapDetector.getGaps();
      report += `Total: ${gaps.length}\n`;
    }

    if (this.modules.riskDetector) {
      report += '\n=== RISCO ===\n';
      const summary = this.modules.riskDetector.getRiskSummary();
      report += `Alto: ${summary.high}\n`;
      report += `Médio: ${summary.medium}\n`;
      report += `Baixo: ${summary.low}\n`;
    }

    if (this.modules.masteryCertifier) {
      report += '\n=== DOMÍNIO ===\n';
      const summary = this.modules.masteryCertifier.getMasterySummary();
      report += `Dominados: ${summary.mastered}\n`;
      report += `Em progresso: ${summary.notMastered}\n`;
    }

    if (this.modules.approvalPredictor) {
      report += '\n=== PREVISÃO DE APROVAÇÃO ===\n';
      const prediction = this.modules.approvalPredictor.getLatestPrediction();
      if (prediction) {
        report += `Probabilidade: ${prediction.probability}%\n`;
        report += `Recomendação: ${prediction.recommendation}\n`;
      }
    }

    return report;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// INSTÂNCIA GLOBAL
// ════════════════════════════════════════════════════════════════════════════

let aivos360 = null;

async function initAIVOS360() {
  if (aivos360) {
    return aivos360;
  }

  aivos360 = new AIVOS360Integration();
  await aivos360.init();
  return aivos360;
}

function getAIVOS360() {
  return aivos360;
}

// Exportar para uso no browser
if (typeof window !== 'undefined') {
  window.AIVOS360Integration = AIVOS360Integration;
  window.initAIVOS360 = initAIVOS360;
  window.getAIVOS360 = getAIVOS360;
}

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AIVOS360Integration, initAIVOS360, getAIVOS360 };
}
