# 🗺️ Roadmap de Implementação - Sistema de Provas

## 📋 Etapas de Implementação

### ✅ Fase 1: Infraestrutura (CONCLUÍDA)

- [x] Criar script de extração (extract-exams.py)
- [x] Criar script de indexação (index-to-vectorize.py)
- [x] Criar orquestrador (process-exams.py)
- [x] Documentação completa (GUIA-EXTRACAO-PROVAS.md)
- [x] Exemplos práticos (EXEMPLOS.md)

### 🚀 Fase 2: Testes e Prototipagem (PRÓXIMA)

**Duração estimada:** 1-2 dias

#### 2.1 Testes com PDFs Reais
```bash
# Objetivo: Validar extração com diferentes formatos

# Atividades:
- [ ] Obter 5-10 PDFs de diferentes bancas (FCC, CESGRANRIO, IBFC, etc)
- [ ] Testar extract-exams.py com cada um
- [ ] Validar qualidade das extrações
- [ ] Documentar problemas e soluções
- [ ] Criar filtros para melhorar parsing
```

#### 2.2 Validação de Embeddings
```bash
# Objetivo: Garantir qualidade dos embeddings

# Atividades:
- [ ] Executar test_vector_search.py
- [ ] Verificar relevância das buscas
- [ ] Testar com diferentes queries
- [ ] Ajustar modelo de embedding se necessário
```

#### 2.3 Performance em Escala
```bash
# Objetivo: Testar com ~1000 questões

# Atividades:
- [ ] Extrair 10 PDFs (~50 questões)
- [ ] Medir tempo e memória
- [ ] Estimar para 266k provas
- [ ] Identificar gargalos
```

### 📦 Fase 3: Integração com Cloudflare (1-2 semanas)

#### 3.1 Configuração do Vectorize
```
# Pré-requisitos:
- [ ] Conta Cloudflare com Vectorize habilitado
- [ ] API Key e Account ID configurados
- [ ] Índice criado no Vectorize

# Implementação:
- [ ] Teste POST para Vectorize API
- [ ] Validar integração end-to-end
- [ ] Testar buscas no Vectorize
- [ ] Otimizar dimensões de embedding
```

#### 3.2 Storage de Documentos
```
# Opções:
- R2 (Object Storage): Armazenar indexed_documents.json
- KV (Key-Value): Cache de buscas frequentes
- D1 (Database): Metadados estruturados

# Implementação:
- [ ] Escolher storage (R2 + KV recomendado)
- [ ] Fazer upload de documents
- [ ] Configurar workers para acessar
```

### 🎯 Fase 4: Integração com StudyMaster (1-2 semanas)

#### 4.1 Worker.js
```javascript
// Modificações necessárias:
- [ ] Importar indexed_documents.json
- [ ] Implementar busca vetorial
- [ ] Usar como contexto para geração
- [ ] Testar qualidade das questões geradas
```

#### 4.2 UI/UX
```
// Melhorias:
- [ ] Adicionar filtro "Banca"
- [ ] Exibir estatísticas de cobertura
- [ ] Mostrar fonte da questão
- [ ] Vincular a provas reais
```

#### 4.3 Testes
```
- [ ] Teste E2E: geração com RAG
- [ ] Performance: tempo de resposta
- [ ] Qualidade: validar questões geradas
- [ ] Coverage: todas as bancas funcionando
```

### 🔄 Fase 5: Escala Completa (2-4 semanas)

#### 5.1 Extrair Todas as Provas do PCI
```bash
# Objetivo: ~266k provas → ~1.3M questões

# Abordagem:
- [ ] Implementar web scraper para PCI
- [ ] Ou usar dados pré-processados se disponível
- [ ] Download de todos os PDFs (terabytes)
- [ ] Processamento em lotes (100-1000 por vez)
- [ ] Monitoramento de progresso
- [ ] Validação de qualidade
```

#### 5.2 Deduplicação
```python
# Implementar:
- [ ] Detectar questões duplicadas
- [ ] Remover duplicatas com mesmo statement
- [ ] Agrupar por variações (mesmo tema, diferentes datas)
- [ ] Manter histórico de versões
```

#### 5.3 Análise de Dados
```
- [ ] Distribuição por banca
- [ ] Distribuição por assunto
- [ ] Distribuição por ano
- [ ] Tendências de tópicos
- [ ] Preparar dashboards
```

### 📊 Fase 6: Otimizações (1-2 semanas)

#### 6.1 Performance
```
- [ ] Caching de buscas
- [ ] Pré-carregamento de embeddings
- [ ] Compressão de dados
- [ ] Indexação otimizada
```

#### 6.2 Qualidade
```
- [ ] Correção de OCR para PDFs escaneados
- [ ] Validação de alternativas
- [ ] Revisão de gabaritos
- [ ] Melhorias no parsing
```

#### 6.3 Features Adicionais
```
- [ ] Histórico de questões já vistas
- [ ] Favoritos/Bookmarks
- [ ] Estatísticas por banca
- [ ] Recomendações personalizadas
```

---

## 🎯 Milestones

| # | Marco | Data | Status |
|----|-------|------|--------|
| 1 | Infraestrutura pronta | ✅ 07/05 | Concluído |
| 2 | Testes com PDFs reais | ⏳ 08-09/05 | Planejado |
| 3 | Integração Cloudflare | ⏳ 10-21/05 | Planejado |
| 4 | Integração StudyMaster | ⏳ 22-28/05 | Planejado |
| 5 | Escala completa (266k) | ⏳ 29/05-06/06 | Planejado |
| 6 | Otimizações & Features | ⏳ 07-14/06 | Planejado |
| 7 | Launch v2.0 | ⏳ 15/06 | Planejado |

---

## 📈 Métricas de Sucesso

### Fase 2 (Testes)
- [ ] Taxa de extração de questões > 95%
- [ ] Sem erros fatais em 100 PDFs
- [ ] Tempo médio por PDF < 30s
- [ ] Memória máxima < 2GB

### Fase 3 (Cloudflare)
- [ ] Latência de busca < 200ms
- [ ] Precisão de relevância > 80%
- [ ] Custo mensal < $100

### Fase 4 (StudyMaster)
- [ ] Taxa de satisfação do usuário > 4/5
- [ ] Tempo de geração < 5s
- [ ] Taxa de uso > 30% dos usuários

### Fase 5 (Escala)
- [ ] 1.2M+ documentos indexados
- [ ] Cobertura de 150+ bancas
- [ ] 500+ tópicos diferentes

### Fase 6 (Otimizações)
- [ ] P95 latência < 100ms
- [ ] Custo mensal < $50
- [ ] Uso de RAM < 500MB

---

## 🛠️ Tecnologias

### Atual
- Python 3.8+
- PyPDF2 (extração de PDF)
- sentence-transformers (embeddings)
- Cloudflare Vectorize (índice vetorial)

### Futuro (Considerado)
- Tesseract OCR (PDFs escaneados)
- Selenium (web scraping PCI)
- Apache Spark (processamento distribuído)
- PostgreSQL + pgvector (alternativa a Vectorize)

---

## 💰 Estimativa de Custos

### Infraestrutura (mensal)
| Serviço | Custo | Notas |
|---------|-------|-------|
| Cloudflare Vectorize | $40-100 | ~1.2M docs |
| R2 Storage | $10-20 | ~500MB dados |
| KV Cache | $5-10 | Queries frequentes |
| Workers | $10-20 | API calls |
| **Total** | **~$65-150** | Estimado |

### Desenvolvimento
| Fase | Horas | Pessoa/mês |
|------|-------|-----------|
| Testes & Prototipagem | 16-24 | 1 dev |
| Integração Cloudflare | 16-24 | 1 dev |
| Integração StudyMaster | 16-24 | 1-2 dev |
| Escala Completa | 40-60 | 2 dev |
| **Total** | **~120-180h** | **3-4 semanas** |

---

## 🚨 Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|--------|-----------|
| PDFs com formato inconsistente | Alta | Médio | Criar parsers específicos por banca |
| Limite de rate em Vectorize | Média | Alto | Implementar fila e retry logic |
| Qualidade baixa de OCR | Alta | Médio | Revisão manual dos dados |
| Custo acima do orçamento | Baixa | Alto | Monitorar uso, otimizar queries |
| Deduplicação inadequada | Média | Médio | Algoritmo robusto de matching |

---

## 📚 Recursos Necessários

### Hardware Mínimo
```
CPU: 4+ cores
RAM: 8GB (recomendado 16GB)
Disk: 100GB (para dados)
Rede: 10+ Mbps
```

### Software
```
Python 3.8+
pip packages: PyPDF2, requests, sentence-transformers
Git
Docker (opcional, para reproducibility)
```

### Conta Cloudflare
```
Plano: Pro ou superior
Vectorize: Habilitado
R2: Habilitado (opcional)
KV: Habilitado (opcional)
```

---

## 📞 Contatos & Referências

### Fontes de Provas
- **PCI Concursos**: https://www.pciconcursos.com.br (266.286 provas)
- **Núcleo de Concursos**: https://www.nucleodeconcursos.com.br
- **Instituto Brasileiro**: https://www.institutobrasileiro.com.br

### Documentação
- Cloudflare Vectorize: https://developers.cloudflare.com/vectorize/
- sentence-transformers: https://www.sbert.net/
- PyPDF2: https://github.com/py-pdf/PyPDF2

### Comunidades
- Concursos Públicos: https://forum.nossogrupo.com.br
- StudyMaster GitHub: https://github.com/anomalyco/opencode

---

## ✅ Checklist Final

### Pré-requisitos
- [ ] Python 3.8+ instalado
- [ ] Git configurado
- [ ] Conta Cloudflare com Vectorize
- [ ] API key e Account ID à mão
- [ ] Alguns PDFs de teste (~5-10)

### Próximos Passos Imediatos
- [ ] Instalar dependências: `pip install -r requirements.txt`
- [ ] Copiar PDFs para `provas_pdf/`
- [ ] Rodar: `python3 scripts/process-exams.py --full`
- [ ] Validar resultados em `data/`
- [ ] Reportar problemas encontrados

---

Última atualização: 07/05/2026
Próxima revisão: 14/05/2026

