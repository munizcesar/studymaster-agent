# SPRINT 6: Validação Final e Relatório de Execução (CEBRASPE)

## 1. Visão Geral da Sprint

A Sprint 6 teve como objetivo primordial consolidar o pipeline de descoberta, extração, indexação e busca semântica de editais reais, transpondo os bloqueios de segurança (WAF/Akamai) identificados no piloto anterior (VUNESP).

Optou-se por utilizar o **CEBRASPE** (concurso PC MA 2026 Investigador) como Fonte Piloto Oficial para a validação da arquitetura, devido à disponibilidade pública dos editais em formato PDF, viabilizando o download direto sem interdição anti-bot, tudo em conformidade com as restrições arquiteturais impostas.

## 2. Arquitetura e Fluxo Implementado

O pipeline completo opera na seguinte sequência, agora testada e validada:

1.  **Descoberta e Download (Crawler):** O `crawler_cebraspe.js` acessa a fonte oficial, encontra o PDF real e o faz o download.
2.  **Extração de Texto Local:** O próprio crawler realiza o parsing do PDF utilizando `pdf-parse`, mitigando as limitações momentâneas do Worker/R2.
3.  **Persistência (D1):**
    *   Criação e atualização de registros canônicos (`fontes`, `orgaos`, `concursos`, `documentos`).
    *   O texto extraído é persistido na nova tabela estrutural `documentos_textos` por meio de uma técnica de _chunking_ no insert (blocos de 40KB) para não estourar o limite de payload SQL do Cloudflare D1.
4.  **Ingestão e Orquestração (Queue):** O evento de ingestão (estado `EXTRAIDO`) é postado na `studymaster-ingest-queue`.
5.  **Processamento Assíncrono (Worker):**
    *   O Worker consome a Queue.
    *   Ao identificar o estado `EXTRAIDO`, recupera o texto via JOIN/SELECT em `documentos_textos`.
    *   Gera um hash local para verificação de duplicidade (`CONCLUIDO_DUPLICADO`).
6.  **Vetorização (AI & Vectorize):**
    *   O texto é dividido em blocos (_chunks_) de 1000 caracteres.
    *   Os chunks são enviados em lotes (batches de 10) para o modelo `@cf/baai/bge-m3` usando o binding `env.AI`.
    *   Os vetores resultantes são inseridos no índice `VECTORIZE_EDITAIS` (`studymaster-knowledge`).
7.  **Busca Semântica:** A API de busca (`/api/editais/search`) consolida buscas textuais estritas no D1 e buscas semânticas vetoriais no Vectorize.

## 3. Comprovação da Validação (Gates of Regression)

A validação foi concluída com sucesso atestado em ambiente produtivo remoto (`--remote`).

*   **Idempotência:** A execução múltipla do crawler para o mesmo edital gera a detecção `CONCLUIDO_DUPLICADO`, protegendo D1 e Vectorize de entradas replicadas.
*   **Persistência Estrutural:** O D1 armazena corretamente os textos extraídos mesmo excedendo os limites de payload HTTP convencionais.
*   **Resultados Reais (Sem Mocks):** Testes via `Invoke-RestMethod` no endpoint de busca da Worker comprovaram a extração e vetorização real.
    *   *Query:* `"Investigador"` retornou o match exato do Órgão "Polícia Civil do Maranhão (PC-MA)".
    *   *Query:* `"regras do teste de aptidão física para investigador"` retornou com precisão (score semântico de ~0.579) o chunk extraído contendo os dados textuais autênticos do edital da PC-MA detalhando o processo de aptidão física e documentação requerida.

## 4. Próximos Passos (Backlog)

Com a arquitetura fim-a-fim validada com fonte real (CEBRASPE), o sistema encontra-se apto para:
*   Início da exploração de modelos generativos (LLM) atuando sobre os chunks (RAG).
*   Expansão vertical do crawler CEBRASPE para raspagem massiva ou paginação.
*   (Opcional Futuro) Refatoração do Worker para download do PDF diretamente, caso o bloqueio R2 Code 10042 seja superado. O crawler passará apenas URLs brutas.
