# Arquitetura do StudyMaster

Este documento descreve a arquitetura macro do projeto StudyMaster, focando no pipeline de extração, processamento e busca semântica de editais de concursos.

## Visão Geral

O sistema é responsável por descobrir, extrair e indexar editais de concursos (em formato PDF) permitindo buscas semânticas vetoriais rápidas pelo usuário final. A arquitetura divide-se entre um **Pipeline Local/Orquestrador (Node.js)** e a **Nuvem de Processamento (Cloudflare Worker)**.

## Componentes Principais

### 1. Fontes de Descoberta (Adapters)
`scripts/adapters/*.adapter.js`
Responsáveis exclusivamente por navegar nos sites oficiais das bancas examinadoras, identificar URLs de PDFs reais, e normalizar metadados básicos (nome da fonte, órgão, ano, etc.) devolvendo um generator assíncrono para o Core Pipeline.

### 2. Core Pipeline Orquestrador
`scripts/core/pipeline.js`
Coordena o fluxo principal localmente:
1. Recebe os dados de descoberta do Adapter.
2. Verifica **Idempotência** (evita downloads repetidos) no banco D1.
3. Faz o download do PDF via `extractor.js`.
4. Utiliza a lib `pdf-parse` localmente para extrair texto bruto.
5. Faciona o texto (Chunking) em pedaços pequenos (40KB) para não exceder limites do SQLite remoto no insert.
6. Persiste as Entidades Cânones (Fonte, Orgão, Concurso, Documentos) no D1 via `db.js`.
7. Comunica via API REST (`POST`) para a Cloudflare Queue que um novo `ingestId` está com estado `EXTRAIDO`.

### 3. Persistência Estrutural (Cloudflare D1)
`studymaster-editais`
Banco de dados relacional distribuído. Armazena:
- Entidades normalizadas (órgãos, concursos).
- Metadados do pipeline e eventos de Ingestão (`ingestoes`, `ingestao_eventos`).
- O texto bruto consolidado e fatiado do edital (`documentos_textos`).

### 4. Orquestração de Filas (Cloudflare Queue)
`studymaster-ingest-queue`
Desacopla a ingestão bruta (feita localmente pelo Pipeline) do processamento oneroso (Worker). Garante que retries e failures pattern como DLQ (Dead Letter Queue) sejam gerenciados nativamente pela Cloudflare.

### 5. AI Worker & Vetorização (Cloudflare Worker + AI)
`src/worker.js`
Componente serverless assíncrono ativado pela Cloudflare Queue.
- Recebe mensagens de estado `EXTRAIDO`.
- Recupera o texto longo no D1 associado ao documento.
- Faciona o texto em vetores menores (~1000 caracteres de "chunks").
- Envia lotes (batches de 10) para o modelo LLM/Embedding nativo da Cloudflare: `@cf/baai/bge-m3`.
- Salva o resultado no banco vetorial **Cloudflare Vectorize** (`studymaster-knowledge`).
- Registra status `CONCLUIDO` no D1 após o término.

### 6. Busca Semântica (Vectorize)
`studymaster-knowledge`
Base de dados vetorial de alta performance para Nearest Neighbor (k-NN) search. O Endpoint do worker `/api/editais/search` recebe uma string de pesquisa, traduz em embeddings usando o mesmo modelo `bge-m3` e cruza a Similaridade de Cosseno contra o Vectorize, devolvendo excertos originais com pontuação de relevância.

---

## Fluxo de Dados (Ingestão)

1. `Adapter` descobre Edital X.
2. `Core` extrai PDF de X -> Texto T.
3. `Core` salva T em tabela no `D1` fragmentado.
4. `Core` gera alerta na `Queue`.
5. `Worker` capta alerta e lê T do `D1`.
6. `Worker` converte T em Embeddings e salva no `Vectorize`.
7. `Worker` marca X como concluído no `D1`.

---

## Decisões Arquiteturais e Restrições

* **Parsing de PDF Local:** Devido a restrições de Anti-Bot (WAF - Code 10042) da Cloudflare para baixar o R2 remotamente, a raspagem (`fetch`) e parser ocorrem no Runner local temporariamente.
* **Chunking Duplo:**
    * Chunking de INSERT SQL (40KB): Proteção contra limites da V8 na API do Wrangler D1 `execute`.
    * Chunking Vetorial (1000 chars): Proteção contra limites de tokens no modelo BGE-M3 (512 tokens) visando qualidade na busca semântica.
* **Idempotência Estrita:** Garantida por hash URL único registrado na tabela `fontes_urls` impedindo duplicação sistêmica.
