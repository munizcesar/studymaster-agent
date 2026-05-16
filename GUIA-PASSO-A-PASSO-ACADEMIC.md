# 🎯 GUIA PASSO A PASSO: Implementação Academic Protocol

**Tempo Estimado**: 3-4 horas  
**Complexidade**: ⭐⭐⭐ (Média)  
**Data**: 11/05/2026

---

## ✅ PASSO 1: Backup e Preparação (5 min)

```bash
# 1. Fazer backup do worker.js
cp worker.js worker.js.backup

# 2. Criar branch de feature
git checkout -b feat/academic-protocol-complete

# 3. Verificar status
git status
```

**Resultado esperado**: Branch criado, worker.js.backup existe

---

## ✅ PASSO 2: Adicionar ACADEMIC_CONFIG (10 min)

### 2.1 Abrir worker.js

Use qualquer editor (VS Code, Notepad++, etc):
```bash
code worker.js
```

### 2.2 Localizar o ponto de inserção

**Pressionar Ctrl+G** (Go to Line):
- Digite: `138`
- Enter

Você deve estar na linha com:
```javascript
};  // Fim de CONCURSOS_CONFIG
```

### 2.3 Inserir novo código

**Posicione no final da linha 138** (após `};`)  
**Pressione Enter** para criar nova linha  
**Cole TODO O CÓDIGO** da seção "TAREFA 1" do documento anterior

### 2.4 Verificar indentação

- Abrir Palette (Ctrl+Shift+P)
- Digitar: "Format Document"
- Isso alinha indentação automaticamente

**Resultado esperado**: ACADEMIC_CONFIG visível e bem formatado

---

## ✅ PASSO 3: Adicionar validateAcademicFilter() (8 min)

### 3.1 Localizar validateConcursosFilter()

**Ctrl+F** (Find): digite `function validateConcursosFilter`

Deve aparecer 1 resultado. Vá até lá.

### 3.2 Encontrar o fim da função

A função validateConcursosFilter() termina com uma linha `}` solitária.

Exemplo (linhas ~320-360):
```javascript
function validateConcursosFilter(filterKey) {
  // ... conteúdo ...
  return { ... };
}  // ← ESTA LINHA
```

### 3.3 Colocar cursor APÓS o `}` final

**Pressione End** (vai pro fim da linha)  
**Pressione Enter 2x** para criar espaço

### 3.4 Colar validateAcademicFilter()

Cole TODO O CÓDIGO da "TAREFA 2"

**Resultado esperado**: Função validateAcademicFilter() visível após validateConcursosFilter()

---

## ✅ PASSO 4: Adicionar generateAcademicRAGQuestion() (40 min)

### 4.1 Localizar generateConcursosRAGQuestion()

**Ctrl+F**: digite `async function generateConcursosRAGQuestion`

### 4.2 Encontrar o FIM dessa função

Essa é uma função GRANDE (≈300 linhas).

O fim é marcado por uma linha `}` solitária.

Scroll para baixo até encontrar (aprox. linha 1050).

### 4.3 Colocar cursor após o `}`

**Pressione End** (fim da linha)  
**Pressione Enter 2x**

### 4.4 Colar generateAcademicRAGQuestion()

Cole TODO O CÓDIGO da "TAREFA 3"

**IMPORTANTE**: Verificar que o código está bem fechado:
- Pressione Ctrl+Shift+P
- Digite: "Format Document"

**Resultado esperado**: generateAcademicRAGQuestion() visível e bem formatada

---

## ✅ PASSO 5: Atualizar Router de Modos (15 min)

### 5.1 Localizar o router academic

**Ctrl+F**: digite `else if (mode === 'academic')`

Deve aparecer 1 resultado. Vá até lá (linha ~1160).

### 5.2 Ver contexto

Você deve estar em:
```javascript
} else if (mode === 'academic') {
  contextInfo = `Área: ${area}. Disciplina...`;
  externalContext = await fetchContext(...);
}
```

### 5.3 SUBSTITUIR essa seção

**SELECIONE**:
```javascript
} else if (mode === 'academic') {
  contextInfo = `Área: ${area}. Disciplina: ${subject}.${topic ? ` Tópico: ${topic}.` : ' (Matéria completa)'}`;
  externalContext = await fetchContext(area, mode, topic, subject, idioma, env);
}
```

**APAGUE** essa seleção

**COLE** (do documento anterior, TAREFA 4):
```javascript
} else if (mode === 'academic') {
  // ─────────────────────────────────────────────────────────────────────────
  // TRY: Academic RAG completo (NOVO!)
  // ─────────────────────────────────────────────────────────────────────────
  const academicResult = await generateAcademicRAGQuestion(body, env);
  
  if (academicResult.success) {
    return new Response(JSON.stringify(academicResult), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FALLBACK: Se Academic RAG falha, usar fluxo legacy
  // ─────────────────────────────────────────────────────────────────────────
  console.log(`[ACADEMIC] Fallback para fetchContext legacy (erro: ${academicResult.error})`);
  contextInfo = `Área: ${area}. Disciplina: ${subject}.${topic ? ` Tópico: ${topic}.` : ' (Matéria completa)'}`;
  externalContext = await fetchContext(area, mode, topic, subject, idioma, env);
}
```

**Resultado esperado**: Router atualizado com novo fluxo Academic RAG

---

## ✅ PASSO 6: Validar Sintaxe (10 min)

### 6.1 Abrir terminal no VS Code

**Ctrl+`** (backtick)

### 6.2 Rodar verificação

```bash
# Node.js syntax check
node -c worker.js

# Ou com Node syntax checker online
```

**Esperado**: Sem erros

### 6.3 Format Final

**Ctrl+Shift+P** → "Format Document"

**Resultado esperado**: Código formatado corretamente

---

## ✅ PASSO 7: Verificar Vectorize Collections (10 min)

### 7.1 Abrir wrangler.toml

```bash
code wrangler.toml
```

### 7.2 Verificar binding de Vectorize

Procure por:
```toml
[[env.production.durable_objects.bindings]]
name = "VECTORIZE"
```

Se NÃO existe, adicionar:
```toml
[[env.production.durable_objects.bindings]]
name = "VECTORIZE"
class_name = "Vectorize"
script_name = "studymaster-agent"
environment = "production"
```

### 7.3 Listar coleções (via CLI)

```bash
wrangler vectorize list
```

**Você deve ver**:
- academic_direito
- academic_medicina
- academic_historia
- academic_exatas
- academic_humanas
- academic_saude
- academic_negocios

### 7.4 Se não existem, criar

```bash
wrangler vectorize create academic_direito --description "Academic content for Direito"
wrangler vectorize create academic_medicina --description "Academic content for Medicina"
wrangler vectorize create academic_historia --description "Academic content for História"
wrangler vectorize create academic_exatas --description "Academic content for Exatas"
wrangler vectorize create academic_humanas --description "Academic content for Humanas"
wrangler vectorize create academic_saude --description "Academic content for Saúde"
wrangler vectorize create academic_negocios --description "Academic content for Negócios"
```

**Resultado esperado**: Todas as 7 coleções existem

---

## ✅ PASSO 8: Testes Locais (60 min)

### 8.1 Subir worker local

```bash
wrangler dev
```

**Esperado**: Output mostra `Listening on http://127.0.0.1:8787`

### 8.2 Teste 1: Área Inválida (deve retornar erro)

```bash
curl -X POST http://127.0.0.1:8787/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "academic",
    "area": "AreaInvalida",
    "subject": "test",
    "quantity": 1,
    "difficulty": "easy",
    "questionType": "mc"
  }'
```

**Esperado**:
```json
{
  "success": false,
  "error": "INVALID_ACADEMIC_AREA",
  "userMessage": "A área \"AreaInvalida\" não foi reconhecida..."
}
```

### 8.3 Teste 2: Área Válida (sem contexto Vectorize)

```bash
curl -X POST http://127.0.0.1:8787/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "academic",
    "area": "Direito",
    "subject": "Direito Civil",
    "quantity": 1,
    "difficulty": "easy",
    "questionType": "mc",
    "alternativas": 5,
    "idioma": "pt-BR"
  }'
```

**Esperado**:
- OU: `success: true` + questão gerada
- OU: `success: false` com fallback message (e.g., "Desculpe, ainda não temos material...")

### 8.4 Teste 3: Testar as 7 Áreas

```javascript
// Criar arquivo test-7-areas.js

const areas = [
  { area: 'Direito', subject: 'Direito Civil' },
  { area: 'Medicina', subject: 'Cardiologia' },
  { area: 'História', subject: 'História do Brasil' },
  { area: 'Exatas', subject: 'Cálculo' },
  { area: 'Humanas', subject: 'Filosofia' },
  { area: 'Saúde', subject: 'Epidemiologia' },
  { area: 'Negócios', subject: 'Contabilidade' },
];

for (const { area, subject } of areas) {
  const response = await fetch('http://127.0.0.1:8787/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode: 'academic',
      area,
      subject,
      quantity: 1,
      difficulty: 'easy',
      questionType: 'mc',
      alternativas: 5,
      idioma: 'pt-BR',
    }),
  });

  const result = await response.json();
  console.log(`✓ ${area}: ${result.success ? 'SUCCESS' : result.error}`);
}
```

**Resultado esperado**: ≥5 áreas com status 200

**Resultado esperado**: Verá `success: true` OU queda para legacy (é ok)

---

## ✅ PASSO 9: Criar Documentação (15 min)

### 9.1 Criar arquivo ACADEMIC_PROTOCOL_IMPLEMENTATION.md

Usar o arquivo já criado:  
`PLANO-ACADEMIC-PROTOCOL-EXECUCAO.md`

Documentação já está completa.

### 9.2 Atualizar README.md (opcional)

Adicionar seção:
```markdown
## Academic Mode

Mode de geração de questões para estudos acadêmicos com validação RAG.

**Colecções suportadas**:
- academic_direito
- academic_medicina
- academic_historia
- academic_exatas
- academic_humanas
- academic_saude
- academic_negocios

**Exemplo**:
```json
{
  "mode": "academic",
  "area": "Direito",
  "subject": "Direito Civil"
}
```
```

---

## ✅ PASSO 10: Commit e Push (5 min)

### 10.1 Verificar mudanças

```bash
git diff worker.js | head -100  # Ver o início das mudanças
git status
```

### 10.2 Adicionar arquivos

```bash
git add worker.js
git add PLANO-ACADEMIC-PROTOCOL-EXECUCAO.md
git add ACADEMIC_PROTOCOL_IMPLEMENTATION.md  # se criou
git status
```

### 10.3 Commit

```bash
git commit -m "feat: implement complete academic protocol with 4-layer validation

- Add ACADEMIC_CONFIG with 7 areas
- Implement generateAcademicRAGQuestion() with RAG + fallback
- Add validateAcademicFilter() for area validation
- Update mode router for academic RAG workflow
- Add validation layers: RAG_SCORE, TRACEABILITY, HALLUCINATION
- Support collections: academic_direito, academic_medicina, etc
- Include metadata with qualityProtocol: 'active'"
```

### 10.4 Push

```bash
git push origin feat/academic-protocol-complete
```

**Resultado esperado**: Branch pushed, ready for review

---

## ✅ PASSO 11: Deploy (10 min)

### 11.1 Deploy para Production

```bash
wrangler deploy
```

**Esperado**: Output mostra `✓ Uploaded worker.js`

### 11.2 Verificar logs

```bash
wrangler tail --format json | head -20
```

### 11.3 Teste em Production

```bash
curl -X POST https://seu-worker.workers.dev/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "academic",
    "area": "Direito",
    "subject": "Direito Civil",
    "quantity": 1
  }'
```

**Resultado esperado**: Status 200, success: true ou fallback message

---

## 🎯 CHECKLIST FINAL

- [ ] ACADEMIC_CONFIG criado com 7 áreas
- [ ] validateAcademicFilter() implementada
- [ ] generateAcademicRAGQuestion() implementada (completa, 300+ linhas)
- [ ] Router academic atualizado com RAG + fallback
- [ ] Todas as 7 coleções Vectorize verificadas/criadas
- [ ] Testes locais passando (≥5 áreas)
- [ ] Documentação criada (PLANO-ACADEMIC-PROTOCOL-EXECUCAO.md)
- [ ] Código formatado e sem erros de sintaxe
- [ ] Commit feito com mensagem descritiva
- [ ] Deploy bem-sucedido para production
- [ ] Logs mostram requisições académicas sendo processadas

---

## ⚠️ TROUBLESHOOTING

### Erro: "ACADEMIC_CONFIG is not defined"
**Solução**: Verificar que ACADEMIC_CONFIG foi inserido ANTES de GROQ_MODELS

### Erro: "generateAcademicRAGQuestion is not a function"
**Solução**: Verificar que a função foi colada completamente (procurar `}` final)

### Erro: "Vectorize não configurado"
**Solução**: Verificar wrangler.toml, section [[env.production.durable_objects.bindings]]

### Erro: "Collection academic_direito does not exist"
**Solução**: Rodar `wrangler vectorize create academic_direito`

### Timeout de API Groq
**Solução**: Verificar GROQ_API_KEY no env.production, ou aguardar (429/503)

---

## 📊 RESUMO FINAL

| Tarefa | Tempo | Status |
|--------|-------|--------|
| Backup + Branch | 5min | ✅ |
| ACADEMIC_CONFIG | 10min | ✅ |
| validateAcademicFilter | 8min | ✅ |
| generateAcademicRAGQuestion | 40min | ✅ |
| Router Update | 15min | ✅ |
| Vectorize Check | 10min | ✅ |
| Testes | 60min | ✅ |
| Documentação | 15min | ✅ |
| Commit | 5min | ✅ |
| Deploy | 10min | ✅ |
| **TOTAL** | **3h 18min** | ✅ |

---

**Documento Gerado**: 11/05/2026  
**Status**: 🟢 PRONTO PARA EXECUÇÃO IMEDIATA
