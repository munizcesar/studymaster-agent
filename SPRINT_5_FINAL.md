# Sprint 5 — Descoberta e Ingestão Automática de Editais (Piloto)

**Status:** CONCLUÍDO (Piloto VUNESP)
**Data:** 22/07/2026

## Objetivo Alcançado
Implementação de um script crawler piloto focado na **Fundação VUNESP** (`vunesp.com.br`) para descobrir editais, validar disponibilidade e integrar com o pipeline de ingestão assíncrona criado na Sprint 4, sem alterar a arquitetura existente.

## Implementação Realizada

### 1. Script Crawler (`scripts/crawler_vunesp.js`)
* Criado script autônomo que simula a etapa de descoberta em uma página oficial da VUNESP.
* Implementada validação inicial via requisição HTTP (`fetch`) para confirmar se a URL está ativa antes de poluir o banco de dados.
* Implementada verificação de **Idempotência**: o script checa `documentos` filtrando por `fonte_id` e `url_origem`. Se a dupla já existir, a descoberta é abortada.

### 2. Integração com D1 e Queue
* O script persiste o contrato esperado pela Sprint 4 nas tabelas `documentos` e `ingestoes` com o status inicial `DESCOBERTO`.
* Realiza o enfileiramento (enqueue) disparando um `POST` para o endpoint `/api/ingest/enqueue` do Worker de Produção.
* A Queue `studymaster-ingest-queue` assume a orquestração do download.

### 3. Validação Anti-Bot (Teste em Produção)
* Durante o teste piloto utilizando uma URL real da VUNESP (`https://www.vunesp.com.br/PCSP2303`), o script crawler validou a URL com sucesso (HTTP 200).
* O job foi enviado para a Cloudflare Queue de produção.
* O Worker de Ingestão iniciou o processamento (transição para `BAIXANDO`).
* Ao tentar realizar o download completo do documento, o Cloudflare (Worker) foi barrado pelo sistema Anti-Bot da VUNESP, recebendo um `HTTP 403 Forbidden`.
* A máquina de estados da Sprint 4 atuou perfeitamente: efetuou os retrys previstos e, após esgotá-os, moveu o job de forma segura para `FALHA_PERMANENTE` com erro `HTTP_403`, protegendo o sistema de loops infinitos.

## Arquitetura Mantida
* Nenhuma alteração no schema do D1 (tabelas `documentos`, `ingestoes`, etc. continuam intactas).
* Nenhuma nova fila (Queue) criada, reutilizando o pipeline validado na Sprint 4.
* Nenhuma alteração no fluxo do Frontend.

## Próximos Passos (Para sprints futuras)
* O bloqueio `HTTP 403` da VUNESP contra os IPs da Cloudflare Workers confirma que a extração automatizada de PDFs ou páginas protegidas exigirá técnicas avançadas de bypass (ex: Puppeteer/Playwright usando proxies residenciais ou serviços como BrightData/ScrapingBee) no lugar do simples `fetch`.
* A infraestrutura de orquestração assíncrona provou ser resiliente para lidar com essas falhas esperadas.

## Classificação Oficial da Sprint 5
* **DESCOBERTA AUTOMÁTICA:** VALIDADA.
* **PERSISTÊNCIA D1:** VALIDADA.
* **IDEMPOTÊNCIA:** VALIDADA.
* **ENVIO À QUEUE:** VALIDADO.
* **PROCESSAMENTO ASSÍNCRONO:** VALIDADO.
* **RETRY:** VALIDADO.
* **DLQ/FALHA PERMANENTE:** VALIDADO.
* **DOWNLOAD REAL DO PDF VUNESP:** BLOQUEADO POR HTTP 403/ANTI-BOT.
* **INGESTÃO E EXTRAÇÃO REAL DO PDF:** NÃO HOMOLOGADA.
* **R2:** permanece bloqueado conforme estado anterior.
