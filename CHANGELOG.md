# 📋 Changelog — StudyMaster

Todas as mudanças relevantes do projeto são documentadas aqui.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [Não lançado]

### Planejado
- Relatório de desempenho do usuário
- Modo revisão (questões erradas)
- Domínio customizado
- PWA (instalável no celular)
- Sistema de login com histórico (Cloudflare D1)

---

## [1.2.0] — 2026-05-01

### Adicionado
- Indexação de **Tecnologia** no Vectorize (17 conteúdos): Programação, Cloud, IA, DevOps, Redes
- Indexação de **Saúde** no Vectorize (17 conteúdos): Anatomia, Farmacologia, SUS, Enfermagem
- Indexação de **Concursos Gerais** no Vectorize (20 conteúdos): Português, Lógica, Informática, Adm. Pública
- Indexação de **ENEM** no Vectorize (29 conteúdos): Matriz INEP completa
- Script `build_full_index.py` para orquestrar todos os indexadores
- Arquivo `indexacao-log.json` para rastrear execuções

### Corrigido
- Dimensões do Vectorize corrigidas de 768 para **1024** (BGE-M3 correto)
- URLs quebradas da Lei 8.429/92 e Lei 8.666/93 no Planalto
- Lógica de upsert no Vectorize v2
- Melhorias de retry e session nos scripts de indexação

---

## [1.1.0] — 2026-05-01

### Adicionado
- Indexação do **Vade Mecum completo** no Vectorize (~2000+ artigos)
  - Constituição Federal (CF/88)
  - Código Penal (CP)
  - Código de Processo Penal (CPP)
  - Consolidação das Leis do Trabalho (CLT)
  - Código de Defesa do Consumidor (CDC)
  - Lei 8.112/90 (Estatuto do Servidor Público)
  - Lei 8.429/92 (Improbidade Administrativa)
  - Lei 8.666/93 (Licitações)
  - Lei 9.784/99 (Processo Administrativo)
  - Lei 11.343/06 (Lei de Drogas)
  - Lei 13.709/18 (LGPD)
- Worker `studymaster-worker` com RAG integrado ao Vectorize
- Integração BGE-M3 (1024 dims) para embeddings

---

## [1.0.0] — 2026-04-03

### Adicionado
- Frontend single-page (`index.html`) com seleção de área e geração de questões
- Worker Cloudflare com integração à API de IA (Llama/Mistral)
- Deploy no Cloudflare Pages
- Favicon SVG
- OG image para compartilhamento social
- `ARQUITETURA.md` inicial
