# 🗺️ Mapa de Conteúdo — StudyMaster

Este arquivo é o **inventário oficial** de tudo que está indexado no Cloudflare Vectorize.
Atualizar sempre que um novo script for executado ou conteúdo for reindexado.

---

## Índice Vectorize: `studymaster-knowledge`

| Área | Script | Conteúdos | Dims | Indexado em | Observações |
|------|--------|-----------|------|-------------|-------------|
| ENEM | `scripts/indexar-enem.py` | 29 | 1024 | 2026-05-01 | Matriz INEP completa (CH, CN, LC, MT) |
| Concursos Gerais | `scripts/indexar-concursos.py` | 20 | 1024 | 2026-05-01 | Português, Lógica, Informática, Adm. Pública |
| Saúde | `scripts/indexar-saude.py` | 17 | 1024 | 2026-05-01 | Anatomia, Farmacologia, SUS, Enfermagem |
| Tecnologia | `scripts/indexar-tecnologia.py` | 17 | 1024 | 2026-05-01 | Programação, Cloud, IA, DevOps, Redes |
| Direito (Vade Mecum) | `scripts/indexar-vademecum.py` | ~2000+ | 1024 | 2026-05-01 | CF, CP, CLT, CDC, Lei 8.112, 8.429, 8.666, 9.784, 11.343, 13.709 |

**Total estimado:** ~2083+ vetores no índice

---

## Modelo de Embedding

- **Modelo:** `@cf/baai/bge-m3`
- **Dimensões:** 1024
- **Provider:** Cloudflare AI
- **Endpoint:** `https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/@cf/baai/bge-m3`

---

## Como reindexar uma área

```bash
# 1. Entre na pasta do projeto
cd studymaster-agent

# 2. Configure as variáveis de ambiente
export CLOUDFLARE_ACCOUNT_ID=9be294b...
export CLOUDFLARE_API_TOKEN=seu_token

# 3. Execute o script da área desejada
python scripts/indexar-tecnologia.py

# 4. Verifique o output esperado:
# Total de conteudos: XX
# OK API - 1024 dims
# OK XX/XX conteudos indexados
# OK [Área] indexado: XX conteudos no Vectorize
```

---

## Como adicionar nova área

1. Crie `scripts/indexar-[area].py` seguindo o padrão dos existentes
2. Execute e verifique o output `OK XX/XX conteudos indexados`
3. Atualize a tabela acima com área, script, qtd, data e observações
4. Faça commit: `feat: script de indexacao [Área] no Vectorize`

---

## Áreas planejadas (backlog)

| Área | Status | Prioridade |
|------|--------|------------|
| Matemática Financeira | ⏳ Pendente | Alta |
| Contabilidade | ⏳ Pendente | Média |
| Redação ENEM | ⏳ Pendente | Média |
| Inglês/Espanhol | ⏳ Pendente | Baixa |
| História e Geografia | ⏳ Pendente | Baixa |
