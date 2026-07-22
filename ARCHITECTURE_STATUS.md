# StudyMaster — ARCHITECTURE_STATUS.md

> **Documento canônico de estado arquitetural do projeto**
>
> Última atualização: 21/07/2026
> Branch principal: `main`
> Último commit conhecido: `554c99c`
> Status geral: **ARQUITETURA BASE CONSOLIDADA — PROJETO CONGELADO TEMPORARIAMENTE**

---

## 1. Objetivo deste documento

Este arquivo é a fonte central de verdade sobre o estado arquitetural do StudyMaster.

Seu objetivo é permitir que o projeto seja retomado futuramente sem depender do contexto de sessões anteriores, registrando:

* arquitetura atual;
* componentes implementados;
* infraestrutura Cloudflare utilizada;
* decisões arquiteturais;
* sprints concluídas;
* validações realizadas;
* limitações conhecidas;
* bloqueios externos;
* próximos passos;
* itens que **não devem ser reimplementados ou refeitos sem necessidade**.

Este documento deve ser atualizado sempre que uma mudança arquitetural relevante for concluída.

---

# 2. Visão Arquitetural Atual

A arquitetura do StudyMaster foi projetada para separar claramente:

```text
                    FONTES OFICIAIS
                 VUNESP / FGV / CEBRASPE
                         │
                         ▼
                 [ FUTURO CRAWLER ]
                         │
                         ▼
                    DESCOBERTO
                         │
                         ▼
              CLOUDFLARE QUEUE
                         │
                         ▼
                INGESTÃO ASSÍNCRONA
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
             D1                    R2
         METADADOS              ARQUIVOS
              │                 PDF / TXT
              │                     │
              │                     ▼
              │                VECTORIZE
              │                     │
              └──────────┬──────────┘
                         ▼
                    SEARCH API
                         │
                 SQL + SEMÂNTICA
                         │
                         ▼
                    STUDYMASTER
```

### Responsabilidade de cada camada

| Camada            | Tecnologia        | Responsabilidade                                     |
| ----------------- | ----------------- | ---------------------------------------------------- |
| Dados relacionais | Cloudflare D1     | Metadados, concursos, cargos, documentos e ingestões |
| Arquivos          | Cloudflare R2     | PDFs e textos brutos                                 |
| Orquestração      | Cloudflare Queues | Processamento assíncrono                             |
| Falhas            | Queue + DLQ       | Retry e isolamento de mensagens problemáticas        |
| Busca estruturada | D1 + SQL          | Consultas textuais e filtros                         |
| Busca semântica   | Vectorize         | Planejada para etapa futura                          |
| Inteligência      | IA/RAG            | Planejada para etapa futura                          |
| API               | Cloudflare Worker | Interface entre frontend e infraestrutura            |

---

# 3. Estado Atual do Projeto

## Status geral

**ARQUITETURA BASE: CONSOLIDADA**

O sistema possui atualmente:

* modelo relacional normalizado;
* separação entre Concurso, Cargo e Documento;
* paginação baseada em cursor;
* índices SQL;
* geração de IDs com prefixos;
* pipeline de ingestão;
* hash SHA-256;
* idempotência;
* máquina de estados;
* Cloudflare Queue;
* Dead Letter Queue;
* retry;
* recuperação de locks;
* auditoria de transições;
* observabilidade básica;
* isolamento entre produção e ambiente de stress.

O projeto está em um ponto seguro para pausa e retomada futura.

---

# 4. Sprints Concluídas

## Sprint 1 — Modelo de Dados e Normalização

### Status

**CONCLUÍDA**

### Objetivo

Substituir o modelo inicial centrado em PDFs por uma arquitetura relacional centrada na entidade `Concurso`.

### Modelo principal

```text
Órgão
  │
  └── Concurso
        │
        ├── Cargo
        │
        ├── Bancas
        │
        ├── Localidades
        │
        └── Documentos
              │
              └── Retificações / Relações
```

### Principais entidades

* `orgaos`
* `fontes`
* `bancas`
* `concursos`
* `cargos`
* `documentos`
* `concurso_bancas`
* `concurso_localidades`
* `ingestoes`

### Características

* normalização relacional;
* integridade referencial;
* suporte a múltiplas bancas;
* suporte a localidades;
* hierarquia de documentos;
* relacionamento entre edital e retificações;
* deduplicação por hash;
* IDs com prefixos.

### Resultado

A arquitetura deixou de tratar o PDF como entidade central e passou a tratar o **Concurso** como entidade principal.

---

# 5. Sprint 2 — Performance, Índices e Paginação

### Status

**CONCLUÍDA**

### Objetivo

Validar a arquitetura para crescimento de volume e evitar degradação de performance causada por consultas com `OFFSET`.

### Implementado

* índices SQL;
* cursor pagination;
* ordenação determinística;
* validação de cursor;
* limite de resultados;
* redução do payload;
* exclusão do texto integral das respostas de listagem;
* ULID com prefixos;
* ambiente D1 separado para stress test.

### Ambiente de teste

Banco:

```text
studymaster-editais-stress-test
```

Carga sintética validada:

```text
Órgãos:       500
Concursos:  10.000
Cargos:     30.000
Documentos: 20.000
```

### Validações

* paginação inicial;
* segunda página;
* cursor inválido;
* paginação profunda;
* concorrência;
* ausência de duplicação;
* ausência de erros nos testes executados.

### Resultado arquitetural

A utilização de cursor pagination substituiu a dependência de `OFFSET` para navegação paginada.

A estratégia utilizada é baseada em ordenação determinística:

```text
data_abertura DESC
id DESC
```

permitindo navegação por cursor sem necessidade de percorrer todas as páginas anteriores.

### Observação importante sobre métricas

Existe uma divergência entre documentos históricos da Sprint 2.

Um resumo posterior registra:

```text
latência sub-30ms
```

Enquanto o relatório detalhado de stress test registrou:

```text
10 usuários / 50 requests
P50: 1.539 ms

50 usuários / 200 requests
P50: 5.583 ms

100 usuários / 400 requests
P50: 11.610 ms

Deep Pagination
Página 10: ~293 ms
Página 50: ~279 ms
Página 100: ~293 ms
```

Essas métricas provavelmente representam condições de medição diferentes, como latência de consulta, latência HTTP, cold start ou concorrência.

**Regra documental:** o valor "sub-30ms" não deve ser utilizado como métrica oficial de performance sem reconciliação com os dados brutos dos testes.

O que está validado com segurança é:

* cursor pagination funcionando;
* ausência de degradação significativa observada na paginação profunda;
* testes concorrentes realizados sem erros nos cenários registrados;
* redução significativa do payload ao não transportar texto integral.

---

# 6. Sprint 3A — Storage e Ingestão

### Status

**CONCLUÍDA PARCIALMENTE / INFRAESTRUTURA R2 PENDENTE**

### Objetivo

Separar armazenamento de arquivos do banco relacional.

### D1

Adicionados metadados:

```text
mime_type
tamanho_bytes
```

### Pipeline desenvolvido

```text
URL
 ↓
Download
 ↓
Validação
 ↓
SHA-256
 ↓
Deduplicação
 ↓
D1 Metadata
 ↓
R2 PDF
 ↓
R2 TXT
 ↓
Extração
```

### Idempotência

A arquitetura utiliza SHA-256 para identificar conteúdo duplicado.

O mesmo documento não deve gerar múltiplos arquivos físicos ou registros redundantes quando o conteúdo for idêntico.

### Bloqueio atual

O R2 depende de ativação da infraestrutura da conta Cloudflare.

Erro registrado:

```text
Cloudflare Code 10042
Please enable R2 through the Cloudflare Dashboard
```

Portanto:

```text
R2 real: BLOQUEADO
```

O sistema não deve considerar o R2 como operacional até que a ativação seja confirmada.

### Próxima ação relacionada ao R2

Quando o R2 estiver habilitado:

1. criar/verificar bucket `studymaster-pdfs`;
2. configurar binding `PDF_STORAGE`;
3. executar ingestão real;
4. validar upload PDF;
5. validar upload TXT;
6. validar deduplicação;
7. validar acesso controlado.

O bucket não deve ser exposto publicamente por padrão.

Acesso futuro recomendado:

```text
Frontend
   ↓
Worker
   ↓
Autorização
   ↓
R2
```

ou utilização de URLs assinadas quando aplicável.

---

# 7. Sprint 4 — Ingestão Assíncrona

### Status

**CONCLUÍDA**

### Commit

```text
554c99c8d7af22b8b76bbfa7a8f8caaa33176c7f
```

Short hash:

```text
554c99c
```

Mensagem:

```text
feat: implement asynchronous ingestion queue with retry and DLQ
```

Branch:

```text
main
```

Push:

```text
origin/main
```

Working tree:

```text
clean
```

---

## 7.1 Cloudflare Queue

Fila principal:

```text
studymaster-ingest-queue
```

Responsabilidade:

* receber jobs;
* processar ingestões assincronamente;
* desacoplar descoberta de processamento.

---

## 7.2 Dead Letter Queue

Fila:

```text
studymaster-ingest-dlq
```

Responsabilidade:

* receber mensagens que excederam tentativas;
* preservar falhas permanentes;
* permitir análise e reprocessamento futuro.

---

## 7.3 Máquina de Estados

Fluxo principal:

```text
DESCOBERTO
    ↓
PENDENTE
    ↓
BAIXANDO
    ↓
BAIXADO
    ↓
EXTRAINDO
    ↓
EXTRAIDO
    ↓
INDEXANDO
    ↓
CONCLUIDO
```

Estados de falha:

```text
FALHA_DOWNLOAD
FALHA_EXTRACAO
FALHA_INDEXACAO
FALHA_PERMANENTE
```

---

## 7.4 Idempotência

A arquitetura possui múltiplas camadas de proteção.

### Hash

```text
SHA-256
```

Evita duplicação de conteúdo.

### Lock de processamento

Campo:

```text
processando_desde
```

Impede processamento concorrente indevido.

### Estado terminal

Jobs já concluídos não devem ser processados novamente.

### Resultado esperado

```text
Mesmo job enviado duas vezes
        ↓
Apenas um processamento efetivo
        ↓
Segundo processamento
        ↓
CONCLUIDO_DUPLICADO
```

---

## 7.5 Retry

O processamento utiliza retry automático via Cloudflare Queue.

Configuração arquitetural:

```text
max_retries = 3
```

Falhas temporárias devem retornar para processamento.

Falhas persistentes devem evoluir para DLQ.

---

## 7.6 Self-Healing

O campo:

```text
processando_desde
```

permite detectar jobs presos.

Locks considerados obsoletos podem ser recuperados após o timeout definido.

Isso reduz o risco de jobs abandonados permanentemente.

---

## 7.7 Auditoria

Tabela:

```text
ingestao_eventos
```

Registra:

* ingestão;
* estado anterior;
* novo estado;
* tentativa;
* erro;
* versão do pipeline;
* timestamp.

Exemplo:

```text
BAIXANDO
BAIXADO
EXTRAINDO
EXTRAIDO
INDEXANDO
CONCLUIDO
```

O histórico permite reconstruir o ciclo de processamento de um documento.

---

# 8. Gates Validados

## Gate 1 — Happy Path

**PASSOU**

Fluxo completo validado.

---

## Gate 3 — Retry + DLQ

**PASSOU**

Falhas simuladas foram encaminhadas para retry e posteriormente para estado permanente/DLQ.

---

## Gate 4 — Idempotência

**PASSOU**

Processamentos duplicados foram bloqueados.

---

## Gate 6 — Observabilidade

**PASSOU**

Transições registradas em `ingestao_eventos`.

---

## Gate 7 — Regressão da Busca

**PASSOU**

A busca existente permaneceu funcional.

---

## Gate 8 — Stale Lock Recovery

**PASSOU**

Locks antigos puderam ser recuperados automaticamente.

---

## Gate 9 — R2

**PENDENTE**

Bloqueado por infraestrutura externa da Cloudflare.

Erro:

```text
10042
```

Este gate não deve ser considerado aprovado até que o R2 seja realmente habilitado e testado.

---

# 9. Infraestrutura Atual

## Cloudflare D1

Produção:

```text
studymaster-editais
```

Status:

```text
OPERACIONAL
```

Responsabilidade:

* metadados;
* concursos;
* cargos;
* órgãos;
* bancas;
* documentos;
* ingestões;
* eventos.

---

## Cloudflare D1 — Stress Test

```text
studymaster-editais-stress-test
```

Status:

```text
AMBIENTE DE TESTE
```

Não utilizar como produção.

---

## Cloudflare Queues

Principal:

```text
studymaster-ingest-queue
```

DLQ:

```text
studymaster-ingest-dlq
```

Status:

```text
OPERACIONAL / VALIDADO
```

---

## Cloudflare R2

Bucket planejado:

```text
studymaster-pdfs
```

Status:

```text
BLOQUEADO — Cloudflare Code 10042
```

Não considerar operacional até ativação oficial.

---

# 10. Segurança

Decisões atuais:

* R2 não deve ser público por padrão;
* arquivos devem ser acessados por camada controlada;
* credenciais não devem ser armazenadas no repositório;
* secrets devem utilizar mecanismos de secret management;
* banco de stress deve permanecer separado da produção;
* payloads de busca não devem transportar PDF ou texto integral;
* deduplicação deve ocorrer antes de processamento pesado sempre que possível.

---

# 11. O Que NÃO Fazer Agora

O projeto está congelado após a Sprint 4.

Não iniciar automaticamente:

* Crawler;
* ingestão massiva;
* Vectorize;
* RAG;
* nova migração estrutural;
* refatoração do Worker;
* troca do D1;
* troca do mecanismo de paginação;
* reescrita da máquina de estados.

Antes de qualquer nova Sprint, revisar este documento.

---

# 12. Próxima Retomada Recomendada

A ordem recomendada é:

```text
1. Habilitar R2
       ↓
2. Criar/validar studymaster-pdfs
       ↓
3. Configurar PDF_STORAGE
       ↓
4. Executar ingestão real
       ↓
5. Validar PDF + TXT
       ↓
6. Validar idempotência
       ↓
7. Validar acesso privado/controlado
       ↓
8. Corrigir qualquer inconsistência
       ↓
9. Somente então iniciar Crawler
```

Depois:

```text
Sprint 5
Crawler + Descoberta de Fontes
        ↓
Sprint 6
Vectorize + Busca Semântica
        ↓
Sprint 7
RAG + Inteligência de Editais
```

---

# 13. Sprint 5 — Direção Futura

A Sprint 5 deverá automatizar a descoberta de documentos oficiais.

Fluxo esperado:

```text
Fonte Oficial
    ↓
Crawler
    ↓
Identificação de Concurso
    ↓
Identificação de Documento
    ↓
URL Oficial
    ↓
DESCOBERTO
    ↓
Queue
    ↓
Pipeline de Ingestão
```

O Crawler não deve realizar diretamente todo o processamento pesado.

Sua responsabilidade principal será:

```text
DESCUBRIR
VALIDAR
NORMALIZAR
ENFILEIRAR
```

O processamento deverá permanecer desacoplado.

---

# 14. Princípios Arquiteturais Permanentes

As próximas implementações devem preservar:

### 1. Idempotência

Toda operação repetível deve produzir o mesmo resultado sem duplicação.

### 2. Separação de responsabilidades

```text
D1 = Metadados
R2 = Arquivos
Queue = Orquestração
Vectorize = Busca semântica
Worker = API e controle
```

### 3. Processamento assíncrono

Operações pesadas não devem bloquear requisições HTTP.

### 4. Observabilidade

Toda transição crítica deve ser rastreável.

### 5. Retry seguro

Retries nunca devem causar duplicação.

### 6. DLQ

Falhas persistentes devem ser isoladas, nunca silenciosamente descartadas.

### 7. Segurança

Arquivos privados por padrão.

### 8. Escalabilidade

Nenhuma decisão deve assumir que existirão apenas centenas de editais.

A arquitetura deve suportar crescimento para:

```text
1.000+
10.000+
50.000+
100.000+ documentos
```

sem depender de processamento manual.

---

# 15. Estado de Congelamento

## O que está pronto

```text
[✓] Modelo relacional
[✓] D1 produção
[✓] Índices
[✓] Cursor Pagination
[✓] ULID / IDs prefixados
[✓] Pipeline de ingestão
[✓] SHA-256
[✓] Idempotência
[✓] State Machine
[✓] Cloudflare Queue
[✓] Retry
[✓] DLQ
[✓] Auditoria de eventos
[✓] Stale Lock Recovery
[✓] Testes de regressão
[✓] Commit no GitHub
```

## O que está pendente

```text
[ ] Ativação do R2
[ ] Validação real de PDF no R2
[ ] Validação real de TXT no R2
[ ] Crawler automático
[ ] Descoberta automatizada
[ ] Vectorize
[ ] Busca semântica
[ ] RAG
```

---

# 16. Ponto Oficial de Retomada

Ao retomar o projeto, começar verificando:

```text
git status
git log -5 --oneline
git branch --show-current
```

Depois revisar:

```text
ARCHITECTURE_STATUS.md
SPRINT_4_FINAL.md
```

Confirmar infraestrutura:

```text
D1 produção
Queue principal
DLQ
R2
```

**Primeira decisão obrigatória na retomada:**

> O R2 já está habilitado e operacional?

Se:

```text
SIM → validar armazenamento real e avançar para descoberta.
NÃO → resolver infraestrutura R2 antes do Crawler.
```

Não iniciar ingestão massiva antes da confirmação do armazenamento definitivo.

---

# 17. Commit de Referência

O estado atual deste documento deve ser associado ao commit:

```text
554c99c8d7af22b8b76bbfa7a8f8caaa33176c7f
```

Mensagem:

```text
feat: implement asynchronous ingestion queue with retry and DLQ
```

Este commit representa o encerramento oficial da Sprint 4.

---

# 18. Declaração Final

O StudyMaster encerra este ciclo com uma arquitetura preparada para evolução incremental.

A infraestrutura atual separa:

```text
METADADOS
ARQUIVOS
PROCESSAMENTO
FALHAS
OBSERVABILIDADE
BUSCA
```

A arquitetura foi construída para evitar que o crescimento do número de editais transforme o banco relacional em um repositório de arquivos ou que o processamento de documentos bloqueie a API.

O próximo avanço deve ocorrer somente após a resolução do bloqueio de R2 e a validação do armazenamento físico real.

**Estado oficial:**

> **Sprint 1 — CONCLUÍDA**
> **Sprint 2 — CONCLUÍDA**
> **Sprint 3A — CONCLUÍDA COM R2 PENDENTE**
> **Sprint 4 — CONCLUÍDA E COMMITADA**
> **Sprint 5 — AGUARDANDO RETOMADA**

**Projeto: CONGELADO TEMPORARIAMENTE EM ESTADO OPERACIONAL E VERSIONADO.**
