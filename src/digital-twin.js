/**
 * GÊMEO DIGITAL DO CANDIDATO - AIVOS Coaching 360
 * 
 * Responsabilidades:
 * - Registrar todas as interações do aluno (questões, simulados, redações, revisões)
 * - Gerenciar perfil completo do aluno
 * - Persistência em IndexedDB (robusto) + localStorage (compatibilidade)
 * - Fornecer dados para outros módulos (lacunas, esquecimento, risco, domínio)
 * 
 * Schema de Dados:
 * {
 *   studentId: string,
 *   createdAt: timestamp,
 *   profile: { name, goal, targetExam, studyMode },
 *   performance: { questions, essays, reviews },
 *   retention: { byDiscipline, overall, trend },
 *   mastery: { byTopic }
 * }
 */

// ════════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO E CONSTANTES
// ════════════════════════════════════════════════════════════════════════════

const DB_NAME = 'AIVOS_DigitalTwin';
const DB_VERSION = 1;
const STORE_PROFILE = 'profile';
const STORE_QUESTIONS = 'questions';
const STORE_ESSAYS = 'essays';
const STORE_REVIEWS = 'reviews';

const DEFAULT_PROFILE = {
  studentId: null,
  createdAt: null,
  profile: {
    name: '',
    goal: '',
    targetExam: '',
    studyMode: 'cursinho_completo'
  },
  performance: {
    questions: {
      total: 0,
      correct: 0,
      wrong: 0,
      byDiscipline: {},
      byDifficulty: { easy: { total: 0, correct: 0, wrong: 0 }, medium: { total: 0, correct: 0, wrong: 0 }, hard: { total: 0, correct: 0, wrong: 0 }, extreme: { total: 0, correct: 0, wrong: 0 } },
      history: []
    },
    essays: {
      total: 0,
      byCompetency: { c1: 0, c2: 0, c3: 0, c4: 0, c5: 0 },
      history: []
    },
    reviews: {
      total: 0,
      schedule: []
    }
  },
  retention: {
    byDiscipline: {},
    overall: 0,
    trend: 'stable'
  },
  mastery: {
    byTopic: {}
  }
};

// ════════════════════════════════════════════════════════════════════════════
// CLASSE DIGITAL TWIN
// ════════════════════════════════════════════════════════════════════════════

class DigitalTwin {
  constructor() {
    this.db = null;
    this.profile = null;
    this.isInitialized = false;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // INICIALIZAÇÃO
  // ════════════════════════════════════════════════════════════════════════════

  async init() {
    if (this.isInitialized) return this.profile;

    try {
      // Tentar carregar do IndexedDB
      this.db = await this.openDB();
      this.profile = await this.loadProfile();
      
      if (!this.profile) {
        // Criar perfil novo
        this.profile = this.createDefaultProfile();
        await this.saveProfile();
      }
      
      this.isInitialized = true;
      console.log('[DigitalTwin] Inicializado com sucesso:', this.profile.studentId);
      return this.profile;
    } catch (error) {
      console.error('[DigitalTwin] Erro na inicialização:', error);
      // Fallback para localStorage
      this.profile = this.loadFromLocalStorage();
      if (!this.profile) {
        this.profile = this.createDefaultProfile();
      }
      this.isInitialized = true;
      return this.profile;
    }
  }

  async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Criar stores
        if (!db.objectStoreNames.contains(STORE_PROFILE)) {
          db.createObjectStore(STORE_PROFILE, { keyPath: 'studentId' });
        }
        if (!db.objectStoreNames.contains(STORE_QUESTIONS)) {
          const questionStore = db.createObjectStore(STORE_QUESTIONS, { keyPath: 'id' });
          questionStore.createIndex('discipline', 'discipline', { unique: false });
          questionStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_ESSAYS)) {
          const essayStore = db.createObjectStore(STORE_ESSAYS, { keyPath: 'id' });
          essayStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_REVIEWS)) {
          const reviewStore = db.createObjectStore(STORE_REVIEWS, { keyPath: 'id' });
          reviewStore.createIndex('topic', 'topic', { unique: false });
          reviewStore.createIndex('date', 'date', { unique: false });
        }
      };
    });
  }

  createDefaultProfile() {
    const studentId = 'student_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    return {
      ...DEFAULT_PROFILE,
      studentId,
      createdAt: Date.now()
    };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PERSISTÊNCIA
  // ════════════════════════════════════════════════════════════════════════════

  async saveProfile() {
    if (!this.profile) return;

    try {
      // Salvar no IndexedDB
      if (this.db) {
        const transaction = this.db.transaction([STORE_PROFILE], 'readwrite');
        const store = transaction.objectStore(STORE_PROFILE);
        store.put(this.profile);
        
        await new Promise((resolve, reject) => {
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        });
      }

      // Fallback para localStorage
      this.saveToLocalStorage();
    } catch (error) {
      console.error('[DigitalTwin] Erro ao salvar perfil:', error);
      this.saveToLocalStorage();
    }
  }

  async loadProfile() {
    try {
      if (!this.db) return null;

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_PROFILE], 'readonly');
        const store = transaction.objectStore(STORE_PROFILE);
        const request = store.getAll();

        request.onsuccess = () => {
          const profiles = request.result;
          resolve(profiles.length > 0 ? profiles[0] : null);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('[DigitalTwin] Erro ao carregar perfil:', error);
      return null;
    }
  }

  saveToLocalStorage() {
    try {
      localStorage.setItem('aivos_digital_twin', JSON.stringify(this.profile));
    } catch (error) {
      console.error('[DigitalTwin] Erro ao salvar no localStorage:', error);
    }
  }

  loadFromLocalStorage() {
    try {
      const data = localStorage.getItem('aivos_digital_twin');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('[DigitalTwin] Erro ao carregar do localStorage:', error);
      return null;
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // REGISTRO DE QUESTÕES
  // ════════════════════════════════════════════════════════════════════════════

  async recordQuestion(questionData) {
    const {
      questionId,
      discipline,
      topic,
      difficulty,
      selected,
      correct,
      isCorrect,
      timeToAnswer,
      statement
    } = questionData;

    const record = {
      id: 'q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      questionId,
      discipline: discipline || 'Geral',
      topic: topic || 'Geral',
      difficulty: difficulty || 'medium',
      selected,
      correct,
      isCorrect,
      timeToAnswer: timeToAnswer || 0,
      statement: statement || '',
      timestamp: Date.now()
    };

    // Atualizar perfil
    this.profile.performance.questions.total++;
    if (isCorrect) {
      this.profile.performance.questions.correct++;
    } else {
      this.profile.performance.questions.wrong++;
    }

    // Atualizar por disciplina
    if (!this.profile.performance.questions.byDiscipline[discipline]) {
      this.profile.performance.questions.byDiscipline[discipline] = { total: 0, correct: 0, wrong: 0 };
    }
    this.profile.performance.questions.byDiscipline[discipline].total++;
    if (isCorrect) {
      this.profile.performance.questions.byDiscipline[discipline].correct++;
    } else {
      this.profile.performance.questions.byDiscipline[discipline].wrong++;
    }

    // Atualizar por dificuldade
    if (this.profile.performance.questions.byDifficulty[difficulty]) {
      this.profile.performance.questions.byDifficulty[difficulty].total++;
      if (isCorrect) {
        this.profile.performance.questions.byDifficulty[difficulty].correct++;
      } else {
        this.profile.performance.questions.byDifficulty[difficulty].wrong++;
      }
    }

    // Adicionar ao histórico
    this.profile.performance.questions.history.push(record);

    // Salvar no IndexedDB
    if (this.db) {
      try {
        const transaction = this.db.transaction([STORE_QUESTIONS], 'readwrite');
        const store = transaction.objectStore(STORE_QUESTIONS);
        store.add(record);
        
        await new Promise((resolve, reject) => {
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        });
      } catch (error) {
        console.error('[DigitalTwin] Erro ao salvar questão no IndexedDB:', error);
      }
    }

    // Salvar perfil atualizado
    await this.saveProfile();

    return record;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // REGISTRO DE REDAÇÕES
  // ════════════════════════════════════════════════════════════════════════════

  async recordEssay(essayData) {
    const {
      text,
      scores,
      banca,
      feedback,
      stage,
      summary
    } = essayData;

    const record = {
      id: 'e_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      text,
      scores: scores || { c1: 0, c2: 0, c3: 0, c4: 0, c5: 0 },
      banca: banca || 'ENEM',
      feedback: feedback || '',
      stage: stage || 'thesis',
      summary: summary || '',
      timestamp: Date.now()
    };

    // Atualizar perfil
    this.profile.performance.essays.total++;

    // Atualizar por competência
    Object.keys(record.scores).forEach(competency => {
      if (this.profile.performance.essays.byCompetency[competency] !== undefined) {
        this.profile.performance.essays.byCompetency[competency] += record.scores[competency];
      }
    });

    // Adicionar ao histórico
    this.profile.performance.essays.history.push(record);

    // Salvar no IndexedDB
    if (this.db) {
      try {
        const transaction = this.db.transaction([STORE_ESSAYS], 'readwrite');
        const store = transaction.objectStore(STORE_ESSAYS);
        store.add(record);
        
        await new Promise((resolve, reject) => {
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        });
      } catch (error) {
        console.error('[DigitalTwin] Erro ao salvar redação no IndexedDB:', error);
      }
    }

    // Salvar perfil atualizado
    await this.saveProfile();

    return record;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // REGISTRO DE REVISÕES
  // ════════════════════════════════════════════════════════════════════════════

  async recordReview(reviewData) {
    const {
      topic,
      date,
      status
    } = reviewData;

    const record = {
      id: 'r_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      topic,
      date: date || Date.now(),
      status: status || 'pending',
      timestamp: Date.now()
    };

    // Atualizar perfil
    this.profile.performance.reviews.total++;

    // Adicionar à agenda
    this.profile.performance.reviews.schedule.push(record);

    // Salvar no IndexedDB
    if (this.db) {
      try {
        const transaction = this.db.transaction([STORE_REVIEWS], 'readwrite');
        const store = transaction.objectStore(STORE_REVIEWS);
        store.add(record);
        
        await new Promise((resolve, reject) => {
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        });
      } catch (error) {
        console.error('[DigitalTwin] Erro ao salvar revisão no IndexedDB:', error);
      }
    }

    // Salvar perfil atualizado
    await this.saveProfile();

    return record;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ATUALIZAÇÃO DE RETENÇÃO
  // ════════════════════════════════════════════════════════════════════════════

  updateRetention(discipline, retentionScore) {
    if (!this.profile.retention.byDiscipline[discipline]) {
      this.profile.retention.byDiscipline[discipline] = 0;
    }

    const previous = this.profile.retention.byDiscipline[discipline];
    this.profile.retention.byDiscipline[discipline] = retentionScore;

    // Calcular tendência
    if (retentionScore > previous + 5) {
      this.profile.retention.trend = 'up';
    } else if (retentionScore < previous - 5) {
      this.profile.retention.trend = 'down';
    } else {
      this.profile.retention.trend = 'stable';
    }

    // Calcular retenção geral
    const disciplines = Object.values(this.profile.retention.byDiscipline);
    this.profile.retention.overall = disciplines.length > 0 
      ? Math.round(disciplines.reduce((a, b) => a + b, 0) / disciplines.length)
      : 0;

    this.saveProfile();
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ATUALIZAÇÃO DE DOMÍNIO
  // ════════════════════════════════════════════════════════════════════════════

  updateMastery(topic, level) {
    this.profile.mastery.byTopic[topic] = {
      level,
      lastUpdated: Date.now()
    };

    this.saveProfile();
  }

  // ════════════════════════════════════════════════════════════════════════════
  // GETTERS
  // ════════════════════════════════════════════════════════════════════════════

  getProfile() {
    return this.profile;
  }

  getQuestionStats() {
    return this.profile.performance.questions;
  }

  getDisciplineStats(discipline) {
    return this.profile.performance.questions.byDiscipline[discipline] || { total: 0, correct: 0, wrong: 0 };
  }

  getDifficultyStats(difficulty) {
    return this.profile.performance.questions.byDifficulty[difficulty] || { total: 0, correct: 0, wrong: 0 };
  }

  getEssayStats() {
    return this.profile.performance.essays;
  }

  getReviewSchedule() {
    return this.profile.performance.reviews.schedule;
  }

  getRetention() {
    return this.profile.retention;
  }

  getMastery() {
    return this.profile.mastery;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // EXPORTAÇÃO/IMPORTAÇÃO
  // ════════════════════════════════════════════════════════════════════════════

  async exportData() {
    const exportData = {
      profile: this.profile,
      questions: await this.getAllQuestions(),
      essays: await this.getAllEssays(),
      reviews: await this.getAllReviews(),
      exportedAt: Date.now()
    };

    return JSON.stringify(exportData, null, 2);
  }

  async importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      
      // Validar estrutura
      if (!data.profile) throw new Error('Dados inválidos: perfil não encontrado');

      // Restaurar perfil
      this.profile = data.profile;
      await this.saveProfile();

      // Restaurar histórico (se disponível)
      if (data.questions && this.db) {
        await this.restoreQuestions(data.questions);
      }
      if (data.essays && this.db) {
        await this.restoreEssays(data.essays);
      }
      if (data.reviews && this.db) {
        await this.restoreReviews(data.reviews);
      }

      console.log('[DigitalTwin] Dados importados com sucesso');
      return true;
    } catch (error) {
      console.error('[DigitalTwin] Erro ao importar dados:', error);
      return false;
    }
  }

  async getAllQuestions() {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_QUESTIONS], 'readonly');
      const store = transaction.objectStore(STORE_QUESTIONS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllEssays() {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_ESSAYS], 'readonly');
      const store = transaction.objectStore(STORE_ESSAYS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllReviews() {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_REVIEWS], 'readonly');
      const store = transaction.objectStore(STORE_REVIEWS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async restoreQuestions(questions) {
    const transaction = this.db.transaction([STORE_QUESTIONS], 'readwrite');
    const store = transaction.objectStore(STORE_QUESTIONS);

    for (const question of questions) {
      store.put(question);
    }

    await new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async restoreEssays(essays) {
    const transaction = this.db.transaction([STORE_ESSAYS], 'readwrite');
    const store = transaction.objectStore(STORE_ESSAYS);

    for (const essay of essays) {
      store.put(essay);
    }

    await new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async restoreReviews(reviews) {
    const transaction = this.db.transaction([STORE_REVIEWS], 'readwrite');
    const store = transaction.objectStore(STORE_REVIEWS);

    for (const review of reviews) {
      store.put(review);
    }

    await new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // ════════════════════════════════════════════════════════════════════════════
  // LIMPEZA
  // ════════════════════════════════════════════════════════════════════════════

  async clearHistory() {
    if (!this.db) return;

    try {
      // Limpar stores de histórico
      const stores = [STORE_QUESTIONS, STORE_ESSAYS, STORE_REVIEWS];
      
      for (const storeName of stores) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        store.clear();
        
        await new Promise((resolve, reject) => {
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        });
      }

      // Resetar contadores no perfil
      this.profile.performance.questions = {
        total: 0,
        correct: 0,
        wrong: 0,
        byDiscipline: {},
        byDifficulty: { easy: { total: 0, correct: 0, wrong: 0 }, medium: { total: 0, correct: 0, wrong: 0 }, hard: { total: 0, correct: 0, wrong: 0 }, extreme: { total: 0, correct: 0, wrong: 0 } },
        history: []
      };
      this.profile.performance.essays = {
        total: 0,
        byCompetency: { c1: 0, c2: 0, c3: 0, c4: 0, c5: 0 },
        history: []
      };
      this.profile.performance.reviews = {
        total: 0,
        schedule: []
      };

      await this.saveProfile();
      console.log('[DigitalTwin] Histórico limpo com sucesso');
    } catch (error) {
      console.error('[DigitalTwin] Erro ao limpar histórico:', error);
    }
  }
}

// ════════════════════════════════════════════════════════════════════════════
// INSTÂNCIA GLOBAL
// ════════════════════════════════════════════════════════════════════════════

const digitalTwin = new DigitalTwin();

// Exportar para uso no browser
if (typeof window !== 'undefined') {
  window.DigitalTwin = DigitalTwin;
  window.digitalTwin = digitalTwin;
}

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DigitalTwin, digitalTwin };
}
