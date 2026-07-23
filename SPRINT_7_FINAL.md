# SPRINT 7: Arquitetura Multi-Fonte de Editais
**Status:** ✅ Homologado e Finalizado

Esta Sprint transformou os scripts isolados de crawling em um sistema de **Adapters** acoplado a um **Core Pipeline**, mantendo todos os contratos de ingestão (D1, Queue, Worker) intactos e isolando eficientemente as integrações com o SQLite remoto para as partes genéricas do código.

---

## 1. Modificações Estruturais

*   **Arquivos Criados:**
    *   `scripts/core/db.js`: Camada de isolamento do D1 (com retry nativo de 3 tentativas para lidar com limites de rateio da Cloudflare).
    *   `scripts/core/extractor.js`: Camada de isolamento de extração (Fetch buffer + PDF Parse).
    *   `scripts/core/pipeline.js`: Motor de orquestração (Lida com Idempotência, Organizações, Documentos, Textos, Chunking D1 e Cloudflare Queue via API).
    *   `scripts/adapters/cebraspe.adapter.js`: Implementação da banca CEBRASPE sob o novo contrato (`discover()` generator).
    *   `scripts/adapters/vunesp.adapter.js`: Implementação da VUNESP sob o novo contrato (em Hold/Bloqueado WAF).
    *   `scripts/run_pipeline.js`: Interface CLI e ponto de entrada da orquestração unificada.
*   **Arquivos Removidos:**
    *   `scripts/crawler_cebraspe.js`
    *   `scripts/crawler_vunesp.js`
*   **Arquivos Não Modificados:**
    *   `src/worker.js` permaneceu absolutamente inalterado, preservando sua robustez na transição de estados `EXTRAIDO -> INDEXANDO -> CONCLUIDO`.

## 2. Gates de Aceitação e Evidências

| Requisito | Status | Evidência |
| :--- | :---: | :--- |
| `run_pipeline.js cebraspe` E2E | ✅ | Execução limpa documentada em log do task local; documento ingerido (`doc_01KY8MQF71BB415FMT8GMN28MD`). |
| O Cebraspe é descoberto e processado | ✅ | Log: `Processando descoberta: Edital Abertura PC MA 2026`. |
| Worker Acionado e `CONCLUIDO` | ✅ | `SELECT id, status` via D1 CLI retornou `CONCLUIDO` para a ingestão `ing_01KY8MQF72YMK2H64RHM9NW3GH`. |
| Conteúdo Pesquisável (Semântico) | ✅ | API Worker endpoint `/api/editais/search` retornou pontuação `0.704` para chunk de `regras do teste de aptidao fisica`. |
| Idempotência Comprovada | ✅ | Segunda execução rodou _"Edital já descoberto anteriormente... Pulando..."_ antes do passo de download. |
| Isolar `wrangler d1 execute` do Adapter | ✅ | Apenas `db.js` usa este CLI. Adapter Cebraspe agora apenas faz `yield` no objeto. |
| Envio Queue isolado no Core | ✅ | O fetch `POST` para `studymaster-ingest-queue` existe apenas dentro de `pipeline.js`. |
| Tratar Falhas Explicitamente | ✅ | `db.js` não usa silent catch. Exceções expõem query, chunk e message. Retry implementado por garantia. |

## 3. Estado da Árvore GIT (Clean Code)

```bash
	deleted:    scripts/crawler_cebraspe.js
	deleted:    scripts/crawler_vunesp.js

Untracked files:
	scripts/adapters/
	scripts/core/
	scripts/run_pipeline.js
```
*   *(Nota: O commit será realizado no momento exato em que a autorização for concedida).*

## 4. Otimizações de Estabilidade Incorporadas
1. **D1 Rate-Limit Retry:** O `db.runSQLFile` ganhou um fallback com tolerância a `[code: 10000]` gerado por muitas operações curtas em sequência na mesma transação.
2. **Uso Mínimo de Memória:** O motor de adaptação agora funciona sobre **Iterators/Generators Assíncronos**, significando que cada edital é processado na memória ponta a ponta *antes* do próximo ser puxado, sem sobrecarregar a V8 Engine.

---
> Aguardando sua revisão para disparo de commit oficial final da Sprint 7!
