# 🏗️ Arquitetura — StudyMaster

Documentação técnica da arquitetura do sistema. Atualizar sempre que houver mudança estrutural.

---

## Visão Geral

```
┌─────────────────────────────────────────────────────────┐
│                     USUÁRIO (Browser)                   │
│              index.html (Cloudflare Pages)              │
└────────────────────────┬────────────────────────────────┘
                         │ POST /api/quiz
                         ▼
┌─────────────────────────────────────────────────────────┐
│            CLOUDFLARE WORKER (studymaster-worker)       │
│                                                         │
│  1. Recebe: { area, topico, nivel, qtd }                │
│  2. Gera embedding da query (BGE-M3)                    │
│  3. Busca top-K no Vectorize (RAG)                      │
│  4. Monta prompt com contexto                           │
│  5. Chama LLM (Llama/Mistral)                           │
│  6. Retorna questões estruturadas em JSON               │
└──────┬───────────────────────────┬───────────────────────┘
       │                           │
       ▼                           ▼
┌──────────────┐         ┌─────────────────────┐
│ Cloudflare   │         │  Cloudflare          │
│ AI (BGE-M3)  │         │  Vectorize           │
│ embeddings   │         │  studymaster-knowledge│
│ + LLM        │         │  ~2083+ vetores      │
└──────────────┘         │  1024 dims / cosine  │
                         └─────────────────────┘
```

---

## Componentes

### Frontend (`index.html`)
- Single-page application em HTML/CSS/JS puro
- Hospedado no Cloudflare Pages
- Permite selecionar área, tópico, nível de dificuldade e quantidade de questões
- Exibe questões com feedback imediato (acerto/erro + explicação)
- URL: `https://f56d0ffd.studymaster-6jw.pages.dev`

### Worker (`worker.js`)
- Cloudflare Worker em JavaScript
- Recebe requisições do frontend via `POST /api/quiz`
- Orquestra o pipeline RAG: embed → busca → geração
- URL: `https://studymaster-worker.cesarmuniz0816.workers.dev`
- Configuração: `wrangler.toml`

### Vectorize (`studymaster-knowledge`)
- Banco de dados vetorial do Cloudflare
- Dimensões: **1024** (BGE-M3)
- Métrica: **cosine similarity**
- Conteúdo: ver `MAPA-CONTEUDO.md`

### Scripts de Indexação (`scripts/`)
- Scripts Python que populam o Vectorize
- Executados manualmente em ambiente local
- Um arquivo por área temática
- Ver `MAPA-CONTEUDO.md` para inventário completo

---

## Pipeline RAG (detalhado)

```
1. Frontend envia: { area: "Direito", topico: "Direito Penal", nivel: "médio", qtd: 5 }

2. Worker gera embedding da query:
   query = "questão sobre Direito Penal nível médio"
   vector = CF_AI.run("@cf/baai/bge-m3", { text: query }) → [1024 floats]

3. Worker busca no Vectorize:
   resultados = VECTORIZE.query(vector, { topK: 5, returnMetadata: true })
   → retorna os 5 conteúdos mais semanticamente similares

4. Worker monta prompt:
   "Com base nos seguintes conteúdos: [contexto_1]...[contexto_5]
    Gere 5 questões de múltipla escolha sobre Direito Penal..."

5. LLM gera questões estruturadas em JSON:
   [{ pergunta, alternativas: [A,B,C,D,E], resposta_correta, explicacao }]

6. Frontend exibe as questões ao usuário
```

---

## Variáveis de Ambiente

| Variável | Onde usar | Descrição |
|----------|-----------|----------|
| `CLOUDFLARE_ACCOUNT_ID` | Scripts Python | ID da conta Cloudflare |
| `CLOUDFLARE_API_TOKEN` | Scripts Python | Token com permissão AI + Vectorize |
| Bindings no `wrangler.toml` | Worker | AI e Vectorize são bindings nativos |

---

## Referências

- [Cloudflare Vectorize Docs](https://developers.cloudflare.com/vectorize/)
- [Cloudflare AI Models](https://developers.cloudflare.com/workers-ai/models/)
- [BGE-M3 no Cloudflare](https://developers.cloudflare.com/workers-ai/models/bge-m3/)
- `MAPA-CONTEUDO.md` — inventário do Vectorize
- `DECISOES.md` — decisões de arquitetura
- `TROUBLESHOOTING.md` — guia de correção
- `CHANGELOG.md` — histórico de mudanças
