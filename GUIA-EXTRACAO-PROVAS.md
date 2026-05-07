# 📚 Sistema Completo de Extração e Indexação de Provas de Concursos

## Visão Geral

Este sistema permite extrair provas de concursos públicos de várias fontes, normalizar as questões e indexá-las no **Cloudflare Vectorize** para uso no StudyMaster.

### Arquitetura

```
Fontes de Provas (PCI, PCDF, etc)
         ↓
   extract-exams.py
   (Extrai questões)
         ↓
   data/exams.json
   (Questões normalizadas)
         ↓
 index-to-vectorize.py
 (Cria embeddings)
         ↓
Cloudflare Vectorize
(Índice para busca)
         ↓
StudyMaster (IA gera questões similares)
```

---

## 🚀 Início Rápido

### 1. Instalação de Dependências

```bash
cd scripts

# Dependências principais
pip install PyPDF2 requests
pip install sentence-transformers
pip install python-dotenv
```

### 2. Preparar PDFs

```bash
# Criar diretório para provas
mkdir provas_pdf

# Adicionar arquivos PDF com formato:
# Banca_Concurso_Ano.pdf
# Exemplos:
#   FCC_PCDF_Escrivao_2022.pdf
#   CESGRANRIO_BACEN_2022.pdf
#   IBFC_PrefeituraSP_2021.pdf
```

### 3. Extrair Questões

```bash
python3 extract-exams.py \
  --source local \
  --pdf-dir ./provas_pdf \
  --output data/exams.json \
  --verbose

# Resultado: data/exams.json com ~10.000+ questões
```

### 4. Indexar no Vectorize

```bash
# Configurar credenciais
export CLOUDFLARE_API_KEY="xxxxx"
export CLOUDFLARE_ACCOUNT_ID="xxxxx"

# Indexar
python3 index-to-vectorize.py \
  --input data/exams.json \
  --index exams \
  --report data/indexing-report.json \
  --verbose

# Resultado: Documentos prontos para busca vetorial
```

---

## 📖 Documentação Detalhada

### extract-exams.py

**Propósito:** Extrair questões de provas em PDF e normalizá-las

**Modos de operação:**

#### Modo 1: Local (PDFs no disco)
```bash
python3 extract-exams.py \
  --source local \
  --pdf-dir ./provas_pdf \
  --output data/exams.json \
  --limit 100  # Processar apenas 100 provas
```

**Como funciona:**
1. Lista todos os `.pdf` no diretório
2. Inferir metadados do nome do arquivo
3. Extrair texto via PyPDF2
4. Parse de questões (padrão: "1. Enunciado\nA) Opção...")
5. Normalizar para formato JSON padrão

**Formato de saída (JSON):**
```json
[
  {
    "statement": "A Constituição Federal de 1988 é considerada:",
    "options": [
      {"key": "A", "text": "Rígida"},
      {"key": "B", "text": "Flexível"},
      {"key": "C", "text": "Semi-rígida"},
      {"key": "D", "text": "Móvel"}
    ],
    "correctAnswer": "A",
    "explanation": "A CF/88 é rígida pois exige processo legislativo especial para emendas.",
    "banca": "FCC",
    "exam": "Polícia Civil DF - Escrivão 2022",
    "year": 2022,
    "difficulty": "easy",
    "subject": "Direito Constitucional",
    "topic": "Características da CF/88"
  }
]
```

#### Modo 2: PCI Concursos (planejado)
```bash
python3 extract-exams.py \
  --source pci \
  --output data/exams.json
```

### index-to-vectorize.py

**Propósito:** Criar embeddings e indexar questões no Cloudflare Vectorize

**Fluxo:**
1. Ler arquivo JSON de questões
2. Para cada questão:
   - Combinar statement + opções + metadados
   - Gerar embedding (384-dim, multilíngue)
   - Criar documento com metadata
3. Enviar para Cloudflare Vectorize (ou salvar localmente)
4. Gerar relatório de indexação

**Configuração:**

```bash
# Via argumentos
python3 index-to-vectorize.py \
  --input data/exams.json \
  --api-key "abc123" \
  --account-id "xyz789" \
  --index exams

# Ou via variáveis de ambiente
export CLOUDFLARE_API_KEY="abc123"
export CLOUDFLARE_ACCOUNT_ID="xyz789"
python3 index-to-vectorize.py --input data/exams.json
```

**Relatório gerado (indexing-report.json):**
```json
{
  "total_documents": 15342,
  "bancas": {
    "FCC": 3241,
    "CESGRANRIO": 2890,
    "IBFC": 1543,
    ...
  },
  "subjects": {
    "Direito Penal": 2341,
    "Português": 1890,
    "Matemática": 1765,
    ...
  },
  "difficulties": {
    "easy": 5234,
    "medium": 7234,
    "hard": 2874
  },
  "years": {
    "2024": 1234,
    "2023": 2341,
    "2022": 3567,
    ...
  }
}
```

---

## 🎯 Integração com StudyMaster

### Passo 1: Copiar dados indexados

```bash
# Copiar dados para o projeto
cp data/indexed_documents.json ../../../indexed_documents.json

# Copiar relatório
cp data/indexing-report.json ../../../public/data/exams-report.json
```

### Passo 2: Atualizar worker.js

```javascript
// No worker.js, adicionar nova fonte de dados:

const EXAM_SOURCES = {
  pci: {
    url: "https://seu-dominio.com/data/indexed_documents.json",
    type: "vectorize",
    priority: 1
  },
  academic: {
    // ... configuração existente
  }
};

// Na função generateQuestions()
if (mode === 'concurso') {
  const examData = await fetch(EXAM_SOURCES.pci.url).then(r => r.json());
  
  // Fazer busca vetorial
  const similarQuestions = await vectorizeSearch(
    payload.editalText,
    examData,
    5  // top 5 questões similares
  );
  
  // Usar como referência para gerar novas questões
  const context = similarQuestions
    .map(q => q.metadata.statement)
    .join('\n\n');
}
```

### Passo 3: Usar RAG (Retrieval-Augmented Generation)

```javascript
// No worker.js - função melhorada com RAG
async function generateWithRAG(payload, examData) {
  const { Groq } = require('@groq/sdk');
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  
  // Buscar questões similares baseadas no tópico
  const similarExams = searchExamDatabase(payload.topic, examData, 10);
  
  const systemPrompt = `
    Você é um professor de concursos públicos. Gere uma questão no estilo
    das provas de ${payload.banca || 'múltiplas bancas'}.
    
    Exemplos de questões similares do banco de dados:
    ${similarExams.map(e => `- ${e.statement}`).join('\n')}
    
    Use esses exemplos como referência para estilo, dificuldade e formato.
  `;
  
  // ... resto da lógica
}
```

---

## 📊 Estatísticas Esperadas

Ao processar todas as 266.286 provas do PCI:

| Métrica | Esperado |
|---------|----------|
| Questões extraídas | ~1.3M (5 questões/prova) |
| Documentos indexados | ~1.2M (após deduplica) |
| Tamanho do índice | ~500MB (embeddings 384-dim) |
| Bancas únicas | ~150+ |
| Assuntos únicos | ~500+ |
| Período coberto | 1990-2024 |

---

## 🔧 Troubleshooting

### Erro: "PyPDF2 not installed"
```bash
pip install PyPDF2 pypdf
```

### Erro: "sentence-transformers not found"
```bash
pip install sentence-transformers torch
# Pode levar alguns minutos para baixar o modelo
```

### PDFs com texto de difícil extração
```bash
# Para PDFs escaneados, usar OCR
pip install pytesseract
# Configurar caminho do Tesseract no sistema operacional
```

### Memória insuficiente durante embeddings
```bash
# Processar em lotes menores
python3 index-to-vectorize.py \
  --input data/exams.json \
  --batch-size 100  # Processar 100 por vez
```

---

## 📝 Extensões Futuras

### 1. Web Scraping Automático do PCI
```python
# Adicionar ao extract-exams.py
class PCIScraper:
    def scrape_provas_list(self):
        # Usar Selenium para extrair lista de provas
        # Baixar PDFs automaticamente
        pass
```

### 2. Deduplicação Inteligente
```python
# Detectar questões duplicadas usando similarity
def find_duplicate_questions(questions):
    # Usar cosine similarity entre embeddings
    pass
```

### 3. Geolocalização de Provas
```python
# Mapear localização da prova (estado, cidade, órgão)
# Usar para recomendações localizadas
```

### 4. Análise de Tendências
```python
# Identificar tópicos mais frequentes por ano
# Prever o que cai mais em 2026
```

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Verificar logs: `--verbose` ativa debug
2. Consultar relatório: `data/indexing-report.json`
3. Validar JSON: `python3 -m json.tool data/exams.json`

---

## ⚖️ Considerações Legais

- Provas são **domínio público** após divulgação oficial
- Respeitar copyright de explicações e comentários
- Usar dados apenas para fins educacionais
- Fonte: PCI Concursos (https://www.pciconcursos.com.br)

