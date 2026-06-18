/**
 * AUDITORIA DE IA - AIVOS Coaching 360
 * 
 * Responsabilidades:
 * - Toda recomendação da IA deve informar motivo, dados utilizados e confiança
 * - Wrapper para todas as chamadas de IA
 * - Registrar prompt, contexto, resposta, score de confiança, tempo
 * - Nenhuma recomendação deve ser caixa preta
 * - Histórico de auditoria disponível
 */

// ════════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO E CONSTANTES
// ════════════════════════════════════════════════════════════════════════════

const AUDIT_STORE_NAME = 'ai_audit';

// ════════════════════════════════════════════════════════════════════════════
// CLASSE AI AUDITOR
// ════════════════════════════════════════════════════════════════════════════

class AIAuditor {
  constructor(digitalTwin) {
    this.digitalTwin = digitalTwin;
    this.auditLog = [];
    this.db = null;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // INICIALIZAÇÃO
  // ════════════════════════════════════════════════════════════════════════════

  async init() {
    try {
      this.db = await this.openAuditDB();
      await this.loadAuditLog();
      console.log('[AIAuditor] Inicializado com sucesso');
    } catch (error) {
      console.error('[AIAuditor] Erro na inicialização:', error);
    }
  }

  async openAuditDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('AIVOS_AIAudit', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(AUDIT_STORE_NAME)) {
          const store = db.createObjectStore(AUDIT_STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('type', 'type', { unique: false });
        }
      };
    });
  }

  async loadAuditLog() {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([AUDIT_STORE_NAME], 'readonly');
      const store = transaction.objectStore(AUDIT_STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        this.auditLog = request.result.sort((a, b) => b.timestamp - a.timestamp);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  // ════════════════════════════════════════════════════════════════════════════
  // REGISTRO DE AUDITORIA
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Registra uma chamada de IA
   * @param {Object} auditData - Dados da auditoria
   * @returns {Object} Registro de auditoria
   */
  async log(auditData) {
    const entry = {
      id: 'audit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      type: auditData.type || 'unknown',
      input: {
        prompt: auditData.prompt || '',
        context: auditData.context || '',
        parameters: auditData.parameters || {}
      },
      output: {
        response: auditData.response || '',
        confidence: auditData.confidence || 0,
        reasoning: auditData.reasoning || ''
      },
      metadata: {
        model: auditData.model || 'unknown',
        latency: auditData.latency || 0,
        tokens: auditData.tokens || 0,
        success: auditData.success !== false
      }
    };

    // Adicionar ao log em memória
    this.auditLog.unshift(entry);

    // Limitar a 1000 entradas em memória
    if (this.auditLog.length > 1000) {
      this.auditLog = this.auditLog.slice(0, 1000);
    }

    // Salvar no IndexedDB
    if (this.db) {
      try {
        const transaction = this.db.transaction([AUDIT_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(AUDIT_STORE_NAME);
        store.add(entry);

        await new Promise((resolve, reject) => {
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        });
      } catch (error) {
        console.error('[AIAuditor] Erro ao salvar no IndexedDB:', error);
      }
    }

    return entry;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // WRAPPERS PARA CHAMADAS DE IA
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Wrapper para geração de questões
   * @param {Object} params - Parâmetros da geração
   * @param {Function} aiCall - Função de chamada de IA
   * @returns {Object} Resultado com auditoria
   */
  async auditQuestionGeneration(params, aiCall) {
    const startTime = Date.now();

    try {
      const result = await aiCall(params);
      const latency = Date.now() - startTime;

      // Calcular confiança baseada em qualidade
      const confidence = this.calculateConfidence(result);

      // Registrar auditoria
      await this.log({
        type: 'question_generation',
        input: {
          prompt: `Gerar ${params.quantity} questões de ${params.area || params.discipline}`,
          context: params.context || '',
          parameters: {
            area: params.area,
            discipline: params.discipline,
            topic: params.topic,
            difficulty: params.difficulty,
            quantity: params.quantity
          }
        },
        output: {
          response: JSON.stringify(result).substring(0, 500),
          confidence,
          reasoning: this.generateReasoning(params, result, confidence)
        },
        metadata: {
          model: params.model || 'groq',
          latency,
          tokens: this.estimateTokens(JSON.stringify(result)),
          success: true
        }
      });

      return result;
    } catch (error) {
      const latency = Date.now() - startTime;

      await this.log({
        type: 'question_generation',
        input: {
          prompt: `Gerar ${params.quantity} questões de ${params.area || params.discipline}`,
          context: params.context || '',
          parameters: params
        },
        output: {
          response: '',
          confidence: 0,
          reasoning: `Erro: ${error.message}`
        },
        metadata: {
          model: params.model || 'groq',
          latency,
          tokens: 0,
          success: false
        }
      });

      throw error;
    }
  }

  /**
   * Wrapper para correção de redação
   * @param {Object} params - Parâmetros da correção
   * @param {Function} aiCall - Função de chamada de IA
   * @returns {Object} Resultado com auditoria
   */
  async auditEssayCorrection(params, aiCall) {
    const startTime = Date.now();

    try {
      const result = await aiCall(params);
      const latency = Date.now() - startTime;

      const confidence = this.calculateConfidence(result);

      await this.log({
        type: 'essay_correction',
        input: {
          prompt: 'Corrigir redação',
          context: params.text?.substring(0, 200) || '',
          parameters: {
            banca: params.banca,
            competencies: params.competencies
          }
        },
        output: {
          response: JSON.stringify(result).substring(0, 500),
          confidence,
          reasoning: this.generateReasoning(params, result, confidence)
        },
        metadata: {
          model: params.model || 'groq',
          latency,
          tokens: this.estimateTokens(JSON.stringify(result)),
          success: true
        }
      });

      return result;
    } catch (error) {
      const latency = Date.now() - startTime;

      await this.log({
        type: 'essay_correction',
        input: {
          prompt: 'Corrigir redação',
          context: params.text?.substring(0, 200) || '',
          parameters: params
        },
        output: {
          response: '',
          confidence: 0,
          reasoning: `Erro: ${error.message}`
        },
        metadata: {
          model: params.model || 'groq',
          latency,
          tokens: 0,
          success: false
        }
      });

      throw error;
    }
  }

  /**
   * Wrapper para recomendações
   * @param {Object} params - Parâmetros da recomendação
   * @param {Function} aiCall - Função de chamada de IA
   * @returns {Object} Resultado com auditoria
   */
  async auditRecommendation(params, aiCall) {
    const startTime = Date.now();

    try {
      const result = await aiCall(params);
      const latency = Date.now() - startTime;

      const confidence = this.calculateConfidence(result);

      await this.log({
        type: 'recommendation',
        input: {
          prompt: 'Gerar recomendação',
          context: params.context || '',
          parameters: params
        },
        output: {
          response: JSON.stringify(result).substring(0, 500),
          confidence,
          reasoning: this.generateReasoning(params, result, confidence)
        },
        metadata: {
          model: params.model || 'groq',
          latency,
          tokens: this.estimateTokens(JSON.stringify(result)),
          success: true
        }
      });

      return result;
    } catch (error) {
      const latency = Date.now() - startTime;

      await this.log({
        type: 'recommendation',
        input: {
          prompt: 'Gerar recomendação',
          context: params.context || '',
          parameters: params
        },
        output: {
          response: '',
          confidence: 0,
          reasoning: `Erro: ${error.message}`
        },
        metadata: {
          model: params.model || 'groq',
          latency,
          tokens: 0,
          success: false
        }
      });

      throw error;
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // CÁLCULO DE CONFIANÇA
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Calcula score de confiança baseado na qualidade do resultado
   * @param {Object} result - Resultado da IA
   * @returns {number} Score de confiança (0-100)
   */
  calculateConfidence(result) {
    let confidence = 50; // Base

    // Se tem estrutura válida
    if (result && typeof result === 'object') {
      confidence += 20;
    }

    // Se tem dados específicos (questões, scores, etc)
    if (result.questions || result.scores || result.recommendation) {
      confidence += 20;
    }

    // Se não tem erros óbvios
    if (!result.error && !result.errorMessage) {
      confidence += 10;
    }

    return Math.min(100, confidence);
  }

  /**
   * Gera explicação do reasoning
   * @param {Object} params - Parâmetros usados
   * @param {Object} result - Resultado obtido
   * @param {number} confidence - Score de confiança
   * @returns {string} Explicação
   */
  generateReasoning(params, result, confidence) {
    const reasons = [];

    if (params.context) {
      reasons.push('Contexto fornecido');
    }

    if (result.questions && result.questions.length > 0) {
      reasons.push(`${result.questions.length} questões geradas`);
    }

    if (result.scores) {
      reasons.push('Scores calculados');
    }

    if (confidence > 70) {
      reasons.push('Alta confiança na resposta');
    } else if (confidence < 50) {
      reasons.push('Baixa confiança - revisão recomendada');
    }

    return reasons.join(', ') || 'Processamento padrão';
  }

  /**
   * Estima número de tokens
   * @param {string} text - Texto
   * @returns {number} Estimativa de tokens
   */
  estimateTokens(text) {
    if (!text) return 0;
    // Estimativa aproximada: 1 token ≈ 4 caracteres
    return Math.ceil(text.length / 4);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // GETTERS
  // ════════════════════════════════════════════════════════════════════════════

  getAuditLog() {
    return this.auditLog;
  }

  getAuditLogByType(type) {
    return this.auditLog.filter(entry => entry.type === type);
  }

  getRecentAuditLog(limit = 50) {
    return this.auditLog.slice(0, limit);
  }

  getFailedCalls() {
    return this.auditLog.filter(entry => !entry.metadata.success);
  }

  getAverageLatency() {
    if (this.auditLog.length === 0) return 0;

    const totalLatency = this.auditLog.reduce((sum, entry) => sum + entry.metadata.latency, 0);
    return Math.round(totalLatency / this.auditLog.length);
  }

  getSuccessRate() {
    if (this.auditLog.length === 0) return 0;

    const successful = this.auditLog.filter(entry => entry.metadata.success).length;
    return Math.round((successful / this.auditLog.length) * 100);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RELATÓRIO
  // ════════════════════════════════════════════════════════════════════════════

  generateReport() {
    const total = this.auditLog.length;
    const successful = this.auditLog.filter(e => e.metadata.success).length;
    const failed = total - successful;

    let report = '=== RELATÓRIO DE AUDITORIA DE IA ===\n\n';
    report += `Total de chamadas: ${total}\n`;
    report += `Bem-sucedidas: ${successful}\n`;
    report += `Falhas: ${failed}\n`;
    report += `Taxa de sucesso: ${this.getSuccessRate()}%\n`;
    report += `Latência média: ${this.getAverageLatency()}ms\n\n`;

    report += '=== POR TIPO ===\n';
    const types = {};
    this.auditLog.forEach(entry => {
      types[entry.type] = (types[entry.type] || 0) + 1;
    });

    for (const [type, count] of Object.entries(types)) {
      report += `${type}: ${count}\n`;
    }

    report += '\n=== ÚLTIMAS 10 CHAMADAS ===\n';
    this.getRecentAuditLog(10).forEach((entry, index) => {
      report += `\n[${index + 1}] ${entry.type}\n`;
      report += `  Timestamp: ${new Date(entry.timestamp).toLocaleString()}\n`;
      report += `  Confiança: ${entry.output.confidence}%\n`;
      report += `  Latência: ${entry.metadata.latency}ms\n`;
      report += `  Sucesso: ${entry.metadata.success ? 'Sim' : 'Não'}\n`;
      if (entry.output.reasoning) {
        report += `  Reasoning: ${entry.output.reasoning}\n`;
      }
    });

    return report;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // LIMPEZA
  // ════════════════════════════════════════════════════════════════════════════

  async clearAuditLog() {
    if (this.db) {
      try {
        const transaction = this.db.transaction([AUDIT_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(AUDIT_STORE_NAME);
        store.clear();

        await new Promise((resolve, reject) => {
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        });

        this.auditLog = [];
        console.log('[AIAuditor] Log de auditoria limpo');
      } catch (error) {
        console.error('[AIAuditor] Erro ao limpar log:', error);
      }
    }
  }
}

// ════════════════════════════════════════════════════════════════════════════
// INSTÂNCIA GLOBAL
// ════════════════════════════════════════════════════════════════════════════

let aiAuditor = null;

async function initAIAuditor(digitalTwin) {
  if (!digitalTwin) {
    console.error('[AIAuditor] DigitalTwin é obrigatório');
    return null;
  }
  aiAuditor = new AIAuditor(digitalTwin);
  await aiAuditor.init();
  return aiAuditor;
}

function getAIAuditor() {
  return aiAuditor;
}

// Exportar para uso no browser
if (typeof window !== 'undefined') {
  window.AIAuditor = AIAuditor;
  window.initAIAuditor = initAIAuditor;
  window.getAIAuditor = getAIAuditor;
}

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AIAuditor, initAIAuditor, getAIAuditor };
}
