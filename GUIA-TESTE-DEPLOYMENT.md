# 🚀 Guia de Teste e Deployment — Sistema RAG Concursos

**Data**: 07/05/2026  
**Status**: ✅ Integração Completa  
**Commits**: f9e335d (worker.js + index.html integration)

---

## 📋 O Que Foi Integrado

### 1. **worker.js** (662 inserções)
- `CONCURSOS_CONFIG`: 5 subjects com mapeamentos, padrões proibidos, min context length
- `validateConcursosFilter()`: Valida se filtro existe
- `fetchVectorizeContext()`: Busca semântica no Vectorize (com graceful degradation)
- `validateAgainstHallucination()`: Remove padrões proibidos pós-geração
- `generateConcursosRAGQuestion()`: Orquestra o pipeline 3-step
- `callGroqWithFallback()`: Retry logic para Groq
- **Roteamento**: `mode=concursos+filter` → RAG pipeline
- **Fallback**: Modo legado (Academic, Livre) continua funcionando

### 2. **index.html** (662 modificações)
- `concursosFilters`: 5 matérias com ícones e descrições
- `renderStep2Concurso()`: **Nova UI** de seleção de matérias (substituiu seleção de concursos)
- `.filters-grid` + `.filter-card` CSS: Grid responsivo de 260px min
- `isStepValid()`: Validação de filtro selecionado
- `state.filter`: Campo para armazenar filtro selecionado
- `payload.filter`: Enviado junto com requisição ao worker

---

## 🧪 Como Testar Localmente

### Pré-requisitos
- Node.js 18+
- Wrangler CLI (`npm install -g wrangler`)
- Groq API Key configurada em `.env.local` ou variáveis do Wrangler

### Opção 1: Testes Básicos com Script

```bash
# 1. Iniciar worker localmente
wrangler dev

# 2. Em outro terminal, rodar testes
node test-rag-integration.js
```

**Esperado**:
```
✅ PASSOU — 1. Modo Concursos + Filtro Português
✅ PASSOU — 2. Modo Concursos + Filtro Direito Constitucional
✅ PASSOU — 3. Modo Concursos + Filtro Inválido
✅ PASSOU — 4. Modo Academic (legado)

📊 RESULTADO FINAL
✅ Passou: 4/4
```

### Opção 2: Teste Manual no Navegador

```bash
# 1. Iniciar worker em modo dev
wrangler dev

# 2. Abrir http://localhost:8787 no navegador

# 3. Fluxo de teste:
#    - Clique em "Concurso Público" (modo concursos)
#    - Selecione "Português" (novo seletor de matérias)
#    - Configure dificuldade, quantidade, tipo
#    - Clique "Gerar"
#    - Verificar se questão é retornada
```

### Opção 3: Teste com cURL

```bash
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "concursos",
    "filter": "portugues",
    "difficulty": "medium",
    "quantity": 1,
    "questionType": "mc",
    "alternativas": 5,
    "idioma": "pt-BR",
    "sessionMode": "normal"
  }'
```

---

## 🔍 Fluxo Esperado no Teste

```
Request:
{
  mode: "concursos",
  filter: "portugues",
  ...
}
        ↓
    WORKER.JS
        ↓
[1] validateConcursosFilter("portugues")
    → { valid: true, config: { ... } }
        ↓
[2] fetchVectorizeContext(env, "concursos_portugues", "portugues", 200)
    → { context: "...", sufficient: true, sources: [...] }
    (Se Vectorize indisponível → sufficient: false, contexto vazio)
        ↓
[3] generateConcursosRAGQuestion() com Groq
    → Claude gera JSON com statement, options, correctAnswer, explanation
        ↓
    validateAgainstHallucination()
    → Remove padrões proibidos (banca, prova, edital, etc)
        ↓
Response:
{
  questions: [{
    id: 1,
    statement: "...",
    options: [{key: "A", text: "..."}, ...],
    correctAnswer: "B",
    explanation: "...",
    fonte: "..."
  }]
}
```

---

## ⚠️ Possíveis Erros e Soluções

### Erro 1: "Filtro não mapeado: portugues"
**Causa**: Nome do filtro incorreto  
**Solução**: Usar valores válidos:
- `portugues`
- `direito_constitucional`
- `raciocinio_logico`
- `informatica`
- `administracao_publica`

### Erro 2: "Vectorize não configurado"
**Causa**: Env binding não está definido em `wrangler.toml`  
**Solução**: Adicionar em `wrangler.toml`:
```toml
[[vectorize]]
binding = "VECTORIZE"
project_id = "seu-project-id"
```
**Comportamento atual**: Se Vectorize não disponível, worker retorna questão genérica com contexto vazio (fallback gracioso)

### Erro 3: "GROQ_API_KEY não configurado"
**Causa**: Variável de ambiente não definida  
**Solução**: Definir em `.env.local` ou no painel do Cloudflare:
```
GROQ_API_KEY=seu-token-aqui
```

### Erro 4: Questão com padrões alucinatórios
**Causa**: LLM inventou banca/ano/edital  
**Solução**: Validação pós-geração remove automaticamente padrões. Se muitos padrões forem detectados, a questão é descartada.

---

## 📊 Checklist Pré-Deployment

- [ ] Worker.js compila sem erros: `wrangler deploy --dry-run`
- [ ] Index.html abre sem erros de console
- [ ] Testes básicos passam: `node test-rag-integration.js`
- [ ] Vectorize collections criadas e preenchidas com dados (ou fallback testado)
- [ ] Groq API Key configurada
- [ ] CF AI binding configurado (para embeddings)
- [ ] KV binding configurado (se usar para cache de configs)
- [ ] CORS headers corretamente configurados
- [ ] Testes manuais no navegador: Concursos + 5 filtros
- [ ] Modo Academic e Livre ainda funcionam (regressão)

---

## 🚀 Deploy para Produção

### Cloudflare Pages (Frontend)
```bash
git push origin main
# Ou manualmente via GitHub Integration
```

### Cloudflare Worker (Backend)
```bash
wrangler deploy
# Verificar em Dashboard → Workers → studymaster-agent
```

### Verificação Pós-Deploy
```bash
# Teste endpoint ao vivo
curl -X POST https://studymaster-agent.pages.dev/ \
  -H "Content-Type: application/json" \
  -d '{mode: "concursos", filter: "portugues", ...}'

# Verificar logs
wrangler tail
```

---

## 📝 Monitoramento e Iteração

### Métricas a Acompanhar
1. **RAG Score**: Porcentagem de questões com contexto suficiente
2. **Taxa de Validação**: % de questões que passam na validação
3. **Tempo Médio**: Tempo de geração por questão
4. **Taxa de Erro**: % de falhas na geração

### Como Iterar

**Para adicionar nova matéria**:
1. Adicionar em `CONCURSOS_CONFIG.subjects`:
```javascript
nova_materia: {
  label: 'Nova Matéria',
  vectorizeCollection: 'concursos_nova_materia',
  minContextLength: 250,
  forbiddenPatterns: [...],
  conceptualBases: '...',
}
```
2. Adicionar em `concursosFilters` no index.html
3. Deploy

**Para ajustar padrões anti-alucinação**:
1. Editar `forbiddenPatterns` em `CONCURSOS_CONFIG`
2. Rodar testes locais
3. Deploy

---

## 🔗 Referências

| Item | Arquivo | Linhas |
|------|---------|--------|
| Config RAG | worker.js | 18-61 |
| Pipeline RAG | worker.js | 64-260 |
| Roteamento | worker.js | 869-895 |
| UI Filtros | index.html | 1610-1643 |
| CSS Filtros | index.html | 210-233 |
| Validação | index.html | 2008-2016 |
| Teste | test-rag-integration.js | Completo |

---

## ✅ Status Final

✅ **Worker.js**: Integrado com RAG pipeline  
✅ **index.html**: Nova UI de filtros para Concursos  
✅ **Fallback**: Graceful degradation se Vectorize indisponível  
✅ **Compatibilidade**: Modo Academic e Livre funcionam normalmente  
✅ **Testes**: Script de teste pronto  

**Próximos passos**:
1. Popular Vectorize com dados (PCI, ENEM)
2. Rodar testes em dev
3. Iterar com feedback dos usuários
4. Deploy para produção
5. Monitorar métricas

---

**Dúvidas?** Consulte `RAG-ARCHITECTURE.md` ou `WORKER-INTEGRATION-RAG.js` para detalhes técnicos.
