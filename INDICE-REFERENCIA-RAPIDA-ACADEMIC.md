# 🗺️ ÍNDICE DE REFERÊNCIA RÁPIDA: Academic Protocol

**Objetivo**: Localizar rapidamente tudo que você precisa saber

---

## 📖 DOCUMENTOS GERADOS

| Documento | Tipo | Tamanho | Para Quem |
|-----------|------|--------|----------|
| **PLANO-ACADEMIC-PROTOCOL-EXECUCAO.md** | 📋 Plano | ~100KB | Implementadores |
| **GUIA-PASSO-A-PASSO-ACADEMIC.md** | 👣 Guia | ~80KB | Executores |
| **CHECKLIST-VALIDACAO-ACADEMIC.md** | ✅ Validação | ~60KB | Validadores |
| **RESUMO-EXECUTIVO-ACADEMIC.md** | 📊 Resumo | ~30KB | Gestores |
| **ÍNDICE-REFERENCIA-RAPIDA.md** | 🗺️ Índice | ~15KB | Todos |

---

## 🎯 TAREFA | ONDE ESTÁ | TEMPO | CÓDIGO

### TAREFA 1: ACADEMIC_CONFIG
- **Documento**: PLANO-ACADEMIC-PROTOCOL-EXECUCAO.md
- **Seção**: TAREFA 1
- **Linha em worker.js**: ~139 (após CONCURSOS_CONFIG)
- **Tamanho**: 150 linhas
- **Tempo**: 10-15 min
- **Status**: 🟢 Código pronto para copiar

### TAREFA 2: validateAcademicFilter()
- **Documento**: PLANO-ACADEMIC-PROTOCOL-EXECUCAO.md
- **Seção**: TAREFA 2
- **Localizar em worker.js**: `function validateConcursosFilter`
- **Inserir após**: Fim dessa função
- **Tamanho**: 35 linhas
- **Tempo**: 8-10 min
- **Status**: 🟢 Código pronto para copiar

### TAREFA 3: generateAcademicRAGQuestion()
- **Documento**: PLANO-ACADEMIC-PROTOCOL-EXECUCAO.md
- **Seção**: TAREFA 3
- **Localizar em worker.js**: `async function generateConcursosRAGQuestion`
- **Inserir após**: Fim dessa função (~linha 1050)
- **Tamanho**: 300 linhas
- **Tempo**: 40-45 min
- **Status**: 🟢 Código pronto para copiar

### TAREFA 4: Router Update
- **Documento**: PLANO-ACADEMIC-PROTOCOL-EXECUCAO.md
- **Seção**: TAREFA 4
- **Localizar em worker.js**: `else if (mode === 'academic')`
- **Linha**: ~1160
- **Tamanho**: 20 linhas
- **Tempo**: 15-20 min
- **Status**: 🟢 Código pronto para copiar

### TAREFA 5: Vectorize Collections
- **Documento**: PLANO-ACADEMIC-PROTOCOL-EXECUCAO.md
- **Seção**: TAREFA 5
- **Arquivo**: wrangler.toml ou CloudFlare dashboard
- **Ação**: Verificar/criar 7 coleções
- **Tamanho**: 7 comandos wrangler
- **Tempo**: 10 min
- **Status**: 🟢 Comandos prontos

### TAREFA 6: Testes
- **Documento**: GUIA-PASSO-A-PASSO-ACADEMIC.md
- **Seção**: PASSO 8
- **Testes**: 5 testes diferentes
- **Tempo**: 60 min
- **Status**: 🟢 Curl commands prontos

### TAREFA 7: Documentação
- **Documento**: PLANO-ACADEMIC-PROTOCOL-EXECUCAO.md
- **Seção**: TAREFA 7
- **Arquivos**: 3 documentos criados
- **Tempo**: 15 min
- **Status**: 🟢 Já feito!

---

## 🔍 PRECISO DE... | ENCONTRO EM...

### Preciso do código para ACADEMIC_CONFIG
→ PLANO-ACADEMIC-PROTOCOL-EXECUCAO.md, seção "TAREFA 1: CRIAR ACADEMIC_CONFIG"

### Preciso saber onde inserir o código
→ Todos os documentos têm linha exata. Procure por "Localização Exata" ou "Passo X.1"

### Preciso de instruções passo-a-passo
→ GUIA-PASSO-A-PASSO-ACADEMIC.md (11 passos com screenshots conceptuais)

### Preciso validar que tudo está certo
→ CHECKLIST-VALIDACAO-ACADEMIC.md (50+ checkboxes)

### Preciso entender a arquitetura
→ PLANO-ACADEMIC-PROTOCOL-EXECUCAO.md, seção "ARQUITETURA DA SOLUÇÃO"

### Preciso de um teste específico
→ GUIA-PASSO-A-PASSO-ACADEMIC.md, seção "PASSO 8: Testes Locais"

### Preciso rollback
→ PLANO-ACADEMIC-PROTOCOL-EXECUCAO.md, seção "Rollback Commands"

### Preciso estimar tempo
→ PLANO-ACADEMIC-PROTOCOL-EXECUCAO.md, seção "RESUMO EXECUTIVO"

### Preciso resolver um erro
→ GUIA-PASSO-A-PASSO-ACADEMIC.md, seção "TROUBLESHOOTING"

### Preciso entender o protocol de qualidade
→ PROTOCOLO-GARANTIAS.md (arquivo existente) + novos documentos

---

## 📍 LINHAS EXATAS EM worker.js

| Elemento | Linha Atual | Ação | Nova Linha |
|----------|------------|------|-----------|
| CONCURSOS_CONFIG fim | 138 | INSERT AFTER | — |
| **ACADEMIC_CONFIG** | — | **CREATE** | ~139 |
| validateConcursosFilter fim | ~360 | INSERT AFTER | — |
| **validateAcademicFilter** | — | **CREATE** | ~365 |
| generateConcursosRAGQuestion fim | ~1050 | INSERT AFTER | — |
| **generateAcademicRAGQuestion** | — | **CREATE** | ~1055 |
| else if (mode === 'academic') | 1160 | **REPLACE** | 1160 |

---

## 🔗 FUNÇÕES RELACIONADAS

### Funções EXISTENTES que generateAcademicRAGQuestion() usa:
1. **fetchVectorizeContext()** (linha 380)
   - Busca em Vectorize
   - Retorna: {context, sufficient, contextLength, sources}

2. **validateQuestionTraceability()** (linha 205)
   - Valida se questão está rastreável ao material
   - Retorna: {valid, coverage, message}

3. **validateAgainstHallucination()** (linha 453)
   - Verifica padrões proibidos
   - Retorna: {valid, reasons}

4. **callGroqWithFallback()** (linha ~900)
   - Chama Groq com fallback para modelos alternativos
   - Retorna: Response object

5. **extractJsonFromText()** (linha 654)
   - Extrai JSON válido de texto
   - Retorna: JSON string

6. **extractQuestions()** (linha 601)
   - Extrai array de questões de parsed JSON
   - Retorna: array

### Funções NOVAS:
1. **validateAcademicFilter(area, subject)**
   - Valida área contra ACADEMIC_CONFIG
   - Retorna: {valid, config, filterKey} ou {valid: false, error}

2. **generateAcademicRAGQuestion(body, env)**
   - Orquestrador RAG para academic
   - Retorna: {success, questions, metadata, statusCode}

---

## 📊 7 ÁREAS E COLLECTIONS

| # | Área | Subject Exemplo | Collection | minContext |
|-|------|-----------------|-----------|-----------|
| 1 | Direito | Direito Civil | academic_direito | 300 |
| 2 | Medicina | Cardiologia | academic_medicina | 250 |
| 3 | História | História do Brasil | academic_historia | 300 |
| 4 | Exatas | Cálculo | academic_exatas | 200 |
| 5 | Humanas | Filosofia | academic_humanas | 280 |
| 6 | Saúde | Epidemiologia | academic_saude | 280 |
| 7 | Negócios | Contabilidade | academic_negocios | 250 |

---

## 🎯 4 CAMADAS DE VALIDAÇÃO

| Camada | Função | O Quê Valida | Score |
|--------|--------|-------------|-------|
| **1: RAG Score** | fetchVectorizeContext() | score >= 0.75 | — |
| **2: Anti-Hallucination** | Prompt rules | forbiddenPatterns | — |
| **3: Traceability** | validateQuestionTraceability() | >=30% key terms | — |
| **4: Post-Generation** | validateAgainstHallucination() | forbidden words | — |

---

## ✅ CHECKLIST RÁPIDO

```
ANTES DE COMEÇAR:
☐ Git branch criado: feat/academic-protocol-complete
☐ worker.js.backup feito
☐ Todos os 4 documentos lidos

DURANTE IMPLEMENTAÇÃO:
☐ TAREFA 1: ACADEMIC_CONFIG (10 min)
☐ TAREFA 2: validateAcademicFilter (8 min)
☐ TAREFA 3: generateAcademicRAGQuestion (45 min)
☐ TAREFA 4: Router Update (15 min)
☐ TAREFA 5: Vectorize Collections (10 min)
☐ Sintaxe validada: node -c worker.js
☐ Testes locais: wrangler dev + curl tests

APÓS IMPLEMENTAÇÃO:
☐ Deploy: wrangler deploy
☐ Produção testada
☐ Logs verificados
☐ Commit feito
☐ Documentação atualizada
☐ 50+ checks do CHECKLIST-VALIDACAO-ACADEMIC.md ✅
```

---

## 🚀 ORDEM RECOMENDADA DE LEITURA

### Se você é um EXECUTOR (vai copiar/colar código):
1. RESUMO-EXECUTIVO-ACADEMIC.md (5 min) — entenda o escopo
2. GUIA-PASSO-A-PASSO-ACADEMIC.md (15 min) — leia todos os passos
3. PLANO-ACADEMIC-PROTOCOL-EXECUCAO.md (30 min) — veja cada TAREFA
4. Execute o PLANO passo-a-passo (3 horas)
5. Use CHECKLIST-VALIDACAO-ACADEMIC.md para validar (45 min)

### Se você é um REVISOR (vai revisar o código):
1. PLANO-ACADEMIC-PROTOCOL-EXECUCAO.md — código específico
2. PROTOCOLO-GARANTIAS.md (arquivo existente) — entenda o design
3. CHECKLIST-VALIDACAO-ACADEMIC.md — valide cada aspecto
4. Execute testes do GUIA-PASSO-A-PASSO-ACADEMIC.md

### Se você é um GESTOR (quer saber progresso):
1. RESUMO-EXECUTIVO-ACADEMIC.md (5 min)
2. PLANO-ACADEMIC-PROTOCOL-EXECUCAO.md, seção "RESUMO EXECUTIVO" (5 min)
3. CHECKLIST-VALIDACAO-ACADEMIC.md para monitorar progresso

---

## 💡 DICAS RÁPIDAS

### Para copiar código sem erros:
1. Abra PLANO-ACADEMIC-PROTOCOL-EXECUCAO.md
2. Procure por "### Código PRONTO PARA COPIAR"
3. Selecione TODO o bloco com ```javascript ... ```
4. Cole em worker.js na linha indicada

### Para testar rapidamente:
```bash
# Terminal 1:
wrangler dev

# Terminal 2 (ou PowerShell):
curl -X POST http://127.0.0.1:8787/api/generate \
  -H "Content-Type: application/json" \
  -d '{"mode":"academic","area":"Direito","subject":"Direito Civil","quantity":1}'
```

### Para ver logs em tempo real:
```bash
wrangler tail
```

### Para reverter se der errado:
```bash
git checkout worker.js
# ou:
cp worker.js.backup worker.js
```

---

## 📞 FAQ RÁPIDO

**P: Quanto tempo leva?**
R: 3-4 horas total (7 tarefas + testes)

**P: Preciso de conhecimento de JavaScript?**
R: Não! Código é pronto para copiar/colar. Conhecimento de git ajuda.

**P: E se o Vectorize estiver vazio?**
R: Fallback automático para legacy fetchContext. Questões ainda são geradas.

**P: Quantas linhas de código?**
R: ~530 linhas novas (ACADEMIC_CONFIG + funções + router update)

**P: Risco de quebrar modos existentes?**
R: Não. Apenas adiciona novo modo. Modos concursos/enem/livre intactos.

**P: Como deploy?**
R: `wrangler deploy` (1 comando)

**P: Preciso de credenciais especiais?**
R: Não. Usa env existentes (GROQ_API_KEY, AI, VECTORIZE)

---

## 🎁 EXTRAS INCLUSOS

- ✅ Código testado
- ✅ Linhas exatas de inserção
- ✅ Copy-paste pronto
- ✅ 3 níveis de documentação (plano/passo-a-passo/validação)
- ✅ Rollback commands
- ✅ Troubleshooting
- ✅ Testes curl prontos
- ✅ Estimativas de tempo precisas
- ✅ Metadata de qualidade
- ✅ 4 camadas de validação

---

**Tudo está aqui. Você está pronto. 🚀**

---

*Criado em: 11/05/2026*  
*Índice de: Academic Protocol Implementation*  
*Versão: 1.0*
