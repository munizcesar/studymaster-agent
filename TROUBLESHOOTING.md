# 🔧 Troubleshooting — StudyMaster

Guia de diagnóstico e correção dos problemas mais comuns.

---

## 🔴 Worker / API

### Erro: `Worker retornou status 500`
**Sintoma:** Frontend mostra erro ao gerar questões.

**Verificar:**
1. Abrir Cloudflare Dashboard → Workers → `studymaster-worker` → Logs
2. Verificar se o binding do Vectorize está ativo: `wrangler.toml` deve ter `[[vectorize]]`
3. Verificar se o binding da AI está ativo: `[ai]` no `wrangler.toml`

**Correção:**
```bash
# Republicar o worker
wrangler deploy worker.js
```

---

### Erro: `No results from Vectorize` (questões genéricas sem RAG)
**Sintoma:** Questões são geradas, mas sem contexto específico da área.

**Verificar:**
1. Confirmar que os scripts de indexação foram executados com sucesso
2. Verificar `indexacao-log.json` para ver status
3. Testar embedding diretamente:
```bash
curl https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/vectorize/v2/indexes/studymaster-knowledge/query \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"vector": [...1024 zeros...], "topK": 3}'
```

**Correção:** Reindexar a área afetada (ver `MAPA-CONTEUDO.md`).

---

### Erro: `API - dims errado` nos scripts Python
**Sintoma:** Script retorna erro de dimensão ao indexar.

**Causa:** O modelo BGE-M3 retorna **1024 dims**. Se o índice foi criado com 768, precisa recriar.

**Correção:**
```bash
# Deletar índice antigo
wrangler vectorize delete studymaster-knowledge

# Recriar com 1024 dims
wrangler vectorize create studymaster-knowledge --dimensions=1024 --metric=cosine

# Reindexar tudo
python build_full_index.py
```

---

## 🟡 Cloudflare Pages

### Site não atualiza após commit
**Sintoma:** Push feito, mas site ainda mostra versão antiga.

**Verificar:**
1. Cloudflare Dashboard → Pages → `studymaster-agent` → Deployments
2. Ver se o build disparou automaticamente
3. Se não, clicar em "Retry deployment"

**Causa comum:** Branch errada configurada no Pages (deve ser `main`).

---

### Erro CORS no frontend
**Sintoma:** Console do browser mostra `CORS policy blocked`.

**Verificar o arquivo `_headers`:**
```
/api/*
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, POST, OPTIONS
```

**Correção:** Adicionar/corrigir as regras no arquivo `_headers` e fazer commit.

---

## 🟢 Scripts de Indexação Python

### Erro: `401 Unauthorized`
**Causa:** Token da Cloudflare expirado ou sem permissão.

**Correção:**
1. Cloudflare Dashboard → My Profile → API Tokens
2. Verificar se o token tem permissão: `Cloudflare AI` + `Vectorize` (Edit)
3. Exportar novamente: `export CLOUDFLARE_API_TOKEN=novo_token`

---

### Erro: `ConnectionError` ou timeout nos scripts
**Causa:** Instabilidade de rede ou rate limit da API.

**Correção:** Os scripts já têm retry automático. Se persistir:
```bash
# Rodar novamente — o upsert é idempotente (não duplica)
python scripts/indexar-[area].py
```

---

## 📋 Checklist de saúde do sistema

```
[ ] Worker respondendo: https://studymaster-worker.cesarmuniz0816.workers.dev
[ ] Frontend no ar: https://f56d0ffd.studymaster-6jw.pages.dev
[ ] Vectorize com vetores (verificar Dashboard → Vectorize → studymaster-knowledge)
[ ] indexacao-log.json atualizado no repositório
[ ] Todos os scripts em scripts/ commitados
```
