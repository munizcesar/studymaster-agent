# 🚀 INSTRUÇÕES DE DEPLOY — FASE 1

## Passo 1: Compilar e Deploy no Cloudflare

```bash
# 1. Navegar até a pasta do projeto
cd c:\Users\Cesar Victor\Desktop\studymaster-agent

# 2. Compilar/atualizar o worker
wrangler deploy

# Você verá algo como:
# ✓ Deployed to https://studymaster-worker.pages.dev/
```

## Passo 2: Validar Integração Local (Opcional)

```bash
# Em outra janela do terminal:
wrangler dev

# Vai iniciar em: http://localhost:8787
```

## Passo 3: Executar Suite de Testes

### Teste em desenvolvimento local:
```bash
node test-fase1-anti-hallucination.js http://localhost:8787
```

### Teste em produção:
```bash
node test-fase1-anti-hallucination.js https://studymaster-agent.pages.dev
```

### Saída esperada (100% sucesso):
```
═══════════════════════════════════════════════════════════════
SUITE DE TESTES - FASE 1.5: VALIDAÇÃO ANTI-ALUCINAÇÃO
═══════════════════════════════════════════════════════════════

📋 Modo: concursos (30 testes)

✅ PASSOU [pt-001] História não é matéria de Português
✅ PASSOU [pt-002] Física Quântica não é matéria de Português
✅ PASSOU [pt-003] Culinária não é matéria de Português
...
✅ PASSOU [rl-010] Dança não é Raciocínio Lógico

═══════════════════════════════════════════════════════════════
RESULTADO FINAL: 30/30 testes passaram
Taxa de sucesso: 100.0%
═══════════════════════════════════════════════════════════════

🎉 SUCESSO! Todos os testes passaram.
O sistema está recusando corretamente consultas fora do escopo.
```

## Passo 4: Testar Manualmente (Curl)

### Teste 1: Consulta VÁLIDA (deve gerar com badge)
```bash
curl -X POST https://studymaster-agent.pages.dev/generate \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "concursos",
    "filter": {
      "content": {
        "discipline": "portugues",
        "keyword": "Análise de período composto"
      }
    },
    "quantity": 1,
    "difficulty": "medium"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "questions": [
    {
      "id": 1,
      "statement": "...",
      "explanation": "...",
      "_qualityBadge": {
        "confidence": "Alta",
        "emoji": "🟢",
        "score": "92%",
        "message": "🟢 Fundamentada em 5 trechos do material"
      }
    }
  ]
}
```

### Teste 2: Consulta FORA DO ESCOPO (deve recusar com fallback)
```bash
curl -X POST https://studymaster-agent.pages.dev/generate \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "concursos",
    "filter": {
      "content": {
        "discipline": "portugues",
        "keyword": "Física Quântica e Mecânica Relativística"
      }
    },
    "quantity": 1,
    "difficulty": "medium"
  }'
```

**Resposta esperada (recusa):**
```json
{
  "success": false,
  "error": "CONTEXT_INSUFFICIENT",
  "userMessage": "Material insuficiente para gerar questões confiáveis. O banco de dados contém apenas 45 caracteres de conteúdo sobre este tópico (mínimo necessário: 200). Por favor, forneça mais conteúdo ou refine sua busca.",
  "metadata": {
    "contextLength": 45,
    "minRequired": 200,
    "sufficient": false,
    "fallbackTriggered": true
  },
  "statusCode": 422
}
```

## Passo 5: Monitorar Logs em Produção

```bash
# Ver logs do worker em tempo real (Cloudflare Pages)
# Menu: Workers & Pages > studymaster-worker > Logs

# Procurar por:
# [RAG] FILTER KEY: concursos.portugues
# [CONTEXT-VALIDATION] Contexto insuficiente: 45 < 200
# [QUALITY-CHECK] Questão rejeitada: Baixa rastreabilidade
```

## Passo 6: Validação Pós-Deploy

### Verificar se todas as features estão ativas:

- [ ] `minScore` = 0.75 em ambos os endpoints
- [ ] Fallback acionado para contexto < minContextLength
- [ ] `_qualityBadge` incluído em todas as respostas bem-sucedidas
- [ ] Suite de testes com 100% de sucesso
- [ ] Logs de `[CONTEXT-VALIDATION]` aparecem

---

## 📊 Métricas de Monitoramento

**KPIs esperados após 1 dia:**

| Métrica | Meta |
|---------|------|
| Taxa de rejeição de consultas fora do escopo | > 95% |
| Taxa de questões com badge 🟢 | 60-80% |
| Taxa de questões com badge 🟡 | 15-30% |
| Taxa de questões com badge 🔴 | < 5% |
| Erros de contexto insuficiente | 5-15% |
| Tempo de resposta médio | < 3s |

---

## ⚠️ Troubleshooting

### Problema: Testes falhando com erro 404
**Solução:** Verificar se o worker foi deployado corretamente
```bash
wrangler list  # Ver todos os workers
wrangler deployments list  # Ver histórico de deployments
```

### Problema: `_qualityBadge` não está no JSON
**Solução:** Verificar se o pipeline foi ativado corretamente
- Procurar por `[QUALITY-CHECK]` nos logs
- Testar com console.log no navegador

### Problema: Todas as consultas estão sendo recusadas
**Solução:** Verificar `minScore` e `minContextLength`
- Confirmar que está em 0.75 e não em valor diferente
- Verificar se Vectorize está retornando resultados

---

## 📝 Checklist Final

- [ ] `wrangler deploy` executado com sucesso
- [ ] Suite de testes com 100% de sucesso
- [ ] Curl test 1 (válido) retorna com badge 🟢
- [ ] Curl test 2 (inválido) retorna RECUSA
- [ ] Logs mostram `[CONTEXT-VALIDATION]` e `[QUALITY-CHECK]`
- [ ] KPIs dentro das metas esperadas
- [ ] GUIA-EVOLUCAO.md atualizado com ✅
- [ ] Documentação preparada para Fase 2

---

**Quando tudo estiver ✅, a Fase 1 está pronta para produção!**
