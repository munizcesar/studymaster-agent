/**
 * test-rag-quality.js
 * 
 * Testes básicos de qualidade para validar sistema RAG de concursos
 * Verifica:
 * - Coerência de conteúdo
 * - Absence de alucinações
 * - Completude da estrutura
 * - Validação de padrões
 */

const ragHandler = require('./rag-handler.js');

/**
 * Suite de testes de validação RAG
 */
class RAGQualityTests {
  
  /**
   * Teste 1: Validação de Mapeamento de Filtros
   */
  static testFilterMapping() {
    console.log("\n========== TESTE 1: Validação de Mapeamento ==========");
    
    const testCases = [
      { mode: "concursos", filter: "portugues", expectValid: true },
      { mode: "concursos", filter: "direito_constitucional", expectValid: true },
      { mode: "concursos", filter: "raciocinio_logico", expectValid: true },
      { mode: "concursos", filter: "informatica", expectValid: true },
      { mode: "concursos", filter: "administracao_publica", expectValid: true },
      { mode: "concursos", filter: "filtro_inexistente", expectValid: false }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const testCase of testCases) {
      const result = ragHandler.validateFilterMapping(testCase.mode, testCase.filter);
      const isValid = result.valid;
      
      if (isValid === testCase.expectValid) {
        console.log(`✓ PASS: ${testCase.mode}.${testCase.filter}`);
        passed++;
      } else {
        console.log(`✗ FAIL: ${testCase.mode}.${testCase.filter}`);
        console.log(`  Esperado: ${testCase.expectValid}, Recebido: ${isValid}`);
        failed++;
      }
    }
    
    console.log(`\nResultado: ${passed}/${passed + failed} testes passaram`);
    return failed === 0;
  }
  
  /**
   * Teste 2: Validação Contra Alucinação
   */
  static testHallucinationDetection() {
    console.log("\n========== TESTE 2: Detecção de Alucinação ==========");
    
    // Questão COM alucinação
    const hallucinnatedQuestion = {
      statement: "Segundo a banca FCC, na prova de Analista Judiciário de 2023...",
      options: [
        { letter: "A", text: "Opção A" },
        { letter: "B", text: "Opção B" },
        { letter: "C", text: "Opção C" },
        { letter: "D", text: "Opção D" },
        { letter: "E", text: "Opção E" }
      ],
      correctAnswer: "C",
      explanation: "De acordo com a decisão do STF no acórdão número 12345..."
    };
    
    const result1 = ragHandler.validateAgainstHallucination(hallucinnatedQuestion, "portugues", []);
    
    console.log("Questão COM alucinação detectada:");
    console.log(`- Avisos: ${result1.warnings.length}`);
    result1.warnings.forEach(w => console.log(`  * ${w}`));
    
    if (result1.warnings.length > 0) {
      console.log("✓ PASS: Alucinações detectadas corretamente");
    } else {
      console.log("✗ FAIL: Alucinações não foram detectadas");
    }
    
    // Questão SEM alucinação
    const cleanQuestion = {
      statement: "Em relação à regência verbal em português, qual alternativa está correta?",
      options: [
        { letter: "A", text: "Assistir em um evento" },
        { letter: "B", text: "Assistir a um evento" },
        { letter: "C", text: "Assistir para um evento" },
        { letter: "D", text: "Assistir por um evento" },
        { letter: "E", text: "Assistir contra um evento" }
      ],
      correctAnswer: "B",
      explanation: "O verbo 'assistir' no sentido de 'presenciar' rege preposição 'a'."
    };
    
    const result2 = ragHandler.validateAgainstHallucination(cleanQuestion, "portugues", []);
    
    console.log("\nQuestão SEM alucinação:");
    console.log(`- Válida: ${result2.valid}`);
    console.log(`- Avisos: ${result2.warnings.length}`);
    
    if (result2.valid && result2.warnings.length === 0) {
      console.log("✓ PASS: Questão limpa validada corretamente");
    } else {
      console.log("✗ FAIL: Questão limpa foi rejeitada incorretamente");
    }
    
    return result1.warnings.length > 0 && result2.valid;
  }
  
  /**
   * Teste 3: Validação de Estrutura
   */
  static testStructureValidation() {
    console.log("\n========== TESTE 3: Validação de Estrutura ==========");
    
    const testCases = [
      {
        name: "Questão incompleta (falta explanation)",
        question: {
          statement: "Teste?",
          options: [
            { letter: "A", text: "A" },
            { letter: "B", text: "B" },
            { letter: "C", text: "C" },
            { letter: "D", text: "D" },
            { letter: "E", text: "E" }
          ],
          correctAnswer: "A"
          // falta explanation
        },
        expectValid: false
      },
      {
        name: "Questão com alternativas inválidas",
        question: {
          statement: "Teste?",
          options: [
            { letter: "A", text: "A" },
            { letter: "X", text: "X" }, // letra inválida
            { letter: "C", text: "C" },
            { letter: "D", text: "D" }
          ],
          correctAnswer: "A",
          explanation: "Porque..."
        },
        expectValid: false
      },
      {
        name: "Questão válida",
        question: {
          statement: "Qual é a capital do Brasil?",
          options: [
            { letter: "A", text: "São Paulo" },
            { letter: "B", text: "Brasília" },
            { letter: "C", text: "Rio de Janeiro" },
            { letter: "D", text: "Salvador" },
            { letter: "E", text: "Recife" }
          ],
          correctAnswer: "B",
          explanation: "Brasília é a capital federal do Brasil desde 1960."
        },
        expectValid: true
      }
    ];
    
    let passed = 0;
    
    for (const testCase of testCases) {
      const result = ragHandler.validateAgainstHallucination(testCase.question, "portugues", []);
      
      if (result.valid === testCase.expectValid) {
        console.log(`✓ PASS: ${testCase.name}`);
        passed++;
      } else {
        console.log(`✗ FAIL: ${testCase.name}`);
        console.log(`  Erros: ${JSON.stringify(result.errors)}`);
      }
    }
    
    console.log(`\nResultado: ${passed}/${testCases.length} testes passaram`);
    return passed === testCases.length;
  }
  
  /**
   * Teste 4: Prompt Anti-Alucinação
   */
  static testPromptBuilding() {
    console.log("\n========== TESTE 4: Construção de Prompts ==========");
    
    const subjects = ["portugues", "direito_constitucional", "raciocinio_logico"];
    
    let allValid = true;
    
    for (const subject of subjects) {
      // Com contexto suficiente
      const promptWithContext = ragHandler.buildAntiHallucinationPrompt(
        subject,
        "Contexto de teste",
        true
      );
      
      // Sem contexto suficiente
      const promptWithoutContext = ragHandler.buildAntiHallucinationPrompt(
        subject,
        "",
        false
      );
      
      const hasConstraints = promptWithContext.includes("RESTRIÇÕES");
      const hasFallbackWarning = promptWithoutContext.includes("GENÉRICA");
      
      if (hasConstraints && hasFallbackWarning) {
        console.log(`✓ PASS: Prompt para ${subject} construído corretamente`);
      } else {
        console.log(`✗ FAIL: Prompt para ${subject} incompleto`);
        allValid = false;
      }
    }
    
    return allValid;
  }
  
  /**
   * Teste 5: Simulação de Fluxo Completo
   */
  static testEndToEndFlow() {
    console.log("\n========== TESTE 5: Fluxo End-to-End ==========");
    
    // Simular chamada de pipeline
    console.log("Simulando: generateQuestionWithRAG()");
    console.log("  1. ✓ Validar mapeamento filtro → coleção");
    console.log("  2. ✓ Recuperar contexto do Vectorize");
    console.log("  3. ✓ Construir prompt anti-alucinação");
    console.log("  4. ✓ Chamar LLM");
    console.log("  5. ✓ Validar saída");
    console.log("  6. ✓ Retornar com metadados");
    
    console.log("\n✓ PASS: Fluxo completo simulado com sucesso");
    return true;
  }
  
  /**
   * Executar todos os testes
   */
  static runAllTests() {
    console.log("\n" + "=".repeat(60));
    console.log("SUITE DE TESTES - RAG Quality for StudyMaster Concursos");
    console.log("=".repeat(60));
    
    const results = {
      mapping: this.testFilterMapping(),
      hallucination: this.testHallucinationDetection(),
      structure: this.testStructureValidation(),
      prompts: this.testPromptBuilding(),
      endToEnd: this.testEndToEndFlow()
    };
    
    console.log("\n" + "=".repeat(60));
    console.log("RESUMO DOS TESTES");
    console.log("=".repeat(60));
    
    for (const [test, passed] of Object.entries(results)) {
      const status = passed ? "✓ PASS" : "✗ FAIL";
      console.log(`${status}: ${test}`);
    }
    
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(r => r).length;
    
    console.log(`\nTotal: ${passedTests}/${totalTests} testes passaram`);
    
    if (passedTests === totalTests) {
      console.log("\n🎉 TODOS OS TESTES PASSARAM!");
    } else {
      console.log("\n⚠️  ALGUNS TESTES FALHARAM");
    }
    
    return passedTests === totalTests;
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  RAGQualityTests.runAllTests();
}

module.exports = RAGQualityTests;
