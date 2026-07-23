# SPRINT 7: Arquitetura Multi-Fonte de Editais

## Objetivo da Sprint
Transformar os scripts monolíticos de crawling isolados em um sistema coeso de "Adapters" acoplado a um "Core Pipeline" unificado, visando centralização de regras de negócio, facilidade na adição de novas fontes e segurança na integração remota.

## Escopo
Desacoplamento do crawler do CEBRASPE e VUNESP para a estrutura Core/Adapter. Criação de módulos centrais para tratamento de Banco de Dados, Extração e Orquestração do fluxo.

## Estado Final
Homologado e Finalizado. Todos os contratos de ingestão mantidos intactos, executando sob novo padrão estrutural limpo.

## Arquivos Criados
* `scripts/core/db.js`
* `scripts/core/extractor.js`
* `scripts/core/pipeline.js`
* `scripts/run_pipeline.js`
* `scripts/adapters/cebraspe.adapter.js`
* `scripts/adapters/vunesp.adapter.js`

## Arquivos Modificados
Nenhum arquivo funcional (Worker) modificado. Apenas adaptação na entrada do pipeline local.

## Arquivos Removidos
* `scripts/crawler_cebraspe.js`
* `scripts/crawler_vunesp.js`

## Arquitetura Antes/Depois
* **Antes:** Cada banca/fonte tinha seu próprio script monolítico que misturava scraping, download, extração em PDF, lógica SQL de D1, manipulação de Cloudflare Queue e retry.
* **Depois:** Arquitetura limpa onde os "Adapters" (ex: `cebraspe.adapter.js`) geram objetos através de um Generator `yield`. O "Core" (`pipeline.js`) os consome, coordena idempotência e usa `extractor.js` e `db.js` de forma unificada. Toda comunicação com a Cloudflare é centralizada no Core.

## Decisões Técnicas
* Uso de Generadores assíncronos (`async function* discover()`) nos Adapters para minimizar impacto na V8 (stream de processamento).
* Encapsulamento estrito das exceções no `db.js` e implementação de loop de retries automático com backoff estático (3 tentativas) para lidar com rate-limit e auth drops (`code: 10000`) do `npx wrangler d1 execute`.
* VUNESP foi implementada como um Adapter stub em modo Hold/Bloqueado para futura documentação/implementação.

## Testes Executados
* Teste completo E2E (End-to-End) usando `node scripts/run_pipeline.js cebraspe`.
* Teste de Idempotência (re-execução rejeitada pelo banco).
* Teste de consulta no D1 para validar preenchimento e integridade de chaves primárias via Adapter.

## Gates de Aceitação e Evidências
* [x] Apenas Core e Adapters contêm a lógica solicitada.
* [x] Worker intacto e Ingestão `CONCLUIDO` atestada.
* [x] Busca semântica `/api/editais/search` funcionando corretamente (score semântico OK).
* [x] Envio de Queue concentrado no `pipeline.js`.
* [x] Crawler legados devidamente deletados.

## Regressões Verificadas
* Verificação de que o endpoint de Queue e a tabela de Documentos/Textos não sofreu impacto de esquema com a nova forma de fazer insert em chunks. Nenhuma regressão apontada.

## Riscos Conhecidos
* O D1 via CLI é instável e propenso a timeout (`code: 10000`), exigindo o script de Retry atual do `db.js`.
* Necessário ter cuidado para que Adapters não assumam responsabilidades do Core no futuro.

## Limitações
* Arquitetura ainda depende de um runner manual no Node (`node scripts/run_pipeline.js`). 

## Status do Worker e Componentes Críticos
* `src/worker.js`: Inalterado e completamente funcional. Processa `EXTRAIDO` na Queue com exatidão e gera embeddings para Vectorize perfeitamente.

## Metadados do Commit
* **Commit Hash:** `2dab9a738fed4ae8d70cc66f17e5f792c76ff343`
* **Branch:** `main`
* **Status do Push:** Sucesso
* **Status Final do Working Tree:** Clean

## Próximos Passos Oficialmente Aprovados
Estabelecer e versionar a documentação arquitetural no repositório (`ARCHITECTURE.md` e `CHANGELOG.md`).
