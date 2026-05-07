# 📚 Scripts de Processamento de Provas de Concursos

Sistema completo para extrair, normalizar e indexar provas de concursos públicos no StudyMaster.

## 📦 Arquivos

### 1. `extract-exams.py`
Extrai questões de provas em PDF e as normaliza para um formato padrão.

**Uso:**
```bash
# Extrair de PDFs locais
python3 extract-exams.py --source local --pdf-dir ./provas_pdf --output data/exams.json

# Limitar a 100 provas
python3 extract-exams.py --source local --limit 100 --verbose

# Modo PCI (planejado)
python3 extract-exams.py --source pci --output data/exams.json
```

**Saída:**
- `data/exams.json`: Questões em formato padrão

### 2. `index-to-vectorize.py`
Cria embeddings e indexa questões no Cloudflare Vectorize.

**Uso:**
```bash
# Indexar com credenciais
python3 index-to-vectorize.py \
  --input data/exams.json \
  --api-key "abc123" \
  --account-id "xyz789" \
  --index exams

# Ou com variáveis de ambiente
export CLOUDFLARE_API_KEY="abc123"
export CLOUDFLARE_ACCOUNT_ID="xyz789"
python3 index-to-vectorize.py --input data/exams.json
```

**Saída:**
- `data/indexed_documents.json`: Documentos com embeddings
- `data/indexing-report.json`: Relatório de indexação

### 3. `process-exams.py`
Orquestra o pipeline completo (extração → indexação → validação).

**Uso:**
```bash
# Pipeline completo
python3 process-exams.py --source local --full --verbose

# Apenas extração
python3 process-exams.py --source local --extract-only

# Apenas indexação
python3 process-exams.py --index-only

# Apenas validação
python3 process-exams.py --validate
```

---

## 🚀 Guia Rápido

### Preparação

```bash
# 1. Instalar dependências
pip install PyPDF2 requests sentence-transformers python-dotenv

# 2. Criar diretório de PDFs
mkdir provas_pdf

# 3. Adicionar arquivos PDF
# Copiar PDFs com nome: Banca_Concurso_Ano.pdf
# Exemplos:
#   FCC_PCDF_Escrivao_2022.pdf
#   CESGRANRIO_BACEN_2022.pdf
#   VUNESP_TribunalSP_2023.pdf
```

### Processamento

```bash
# Opção 1: Pipeline completo (recomendado)
python3 process-exams.py --full --verbose

# Opção 2: Passo a passo
python3 extract-exams.py --source local --output data/exams.json
python3 index-to-vectorize.py --input data/exams.json
python3 process-exams.py --validate
```

### Resultado

```
data/
├── exams.json                    (questões extraídas)
├── indexed_documents.json        (documentos indexados)
├── indexing-report.json          (estatísticas)
├── config.json                   (configuração)
└── processing-log.json           (histórico)
```

---

## 🔧 Configuração Avançada

### Variáveis de Ambiente

```bash
# Cloudflare
export CLOUDFLARE_API_KEY="sua-api-key"
export CLOUDFLARE_ACCOUNT_ID="seu-account-id"

# Opcional
export LOG_LEVEL="DEBUG"
export BATCH_SIZE="100"
```

### Arquivo .env

```bash
# .env
CLOUDFLARE_API_KEY=xxx
CLOUDFLARE_ACCOUNT_ID=yyy
```

---

## 📊 Formato de Dados

### Entrada (exams.json)

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
    "explanation": "A CF/88 é rígida pois exige processo legislativo especial...",
    "banca": "FCC",
    "exam": "Polícia Civil DF - Escrivão 2022",
    "year": 2022,
    "difficulty": "easy",
    "subject": "Direito Constitucional",
    "topic": "Características da CF/88"
  }
]
```

### Saída (indexed_documents.json)

```json
[
  {
    "id": "a1b2c3d4e5f6g7h8",
    "values": [0.123, 0.456, ...],  // embedding de 384 dimensões
    "metadata": {
      "statement": "A Constituição Federal de 1988 é considerada:",
      "banca": "FCC",
      "exam": "Polícia Civil DF - Escrivão 2022",
      "year": 2022,
      "subject": "Direito Constitucional",
      "difficulty": "easy",
      "correctAnswer": "A",
      "indexed_at": "2024-05-07T10:30:45.123Z"
    }
  }
]
```

### Relatório (indexing-report.json)

```json
{
  "total_documents": 15342,
  "bancas": {
    "FCC": 3241,
    "CESGRANRIO": 2890,
    "IBFC": 1543
  },
  "subjects": {
    "Direito Penal": 2341,
    "Português": 1890,
    "Matemática": 1765
  },
  "difficulties": {
    "easy": 5234,
    "medium": 7234,
    "hard": 2874
  },
  "years": {
    "2024": 1234,
    "2023": 2341,
    "2022": 3567
  },
  "timestamp": "2024-05-07T10:30:45.123Z"
}
```

---

## 🎯 Casos de Uso

### Caso 1: Adicionar todas as provas do PCI (~266k)

```bash
# Preparar
ls -la ~/.cache/pci-provas/  # Verificar se já tem cache

# Processar em lotes
for batch in {1..50}; do
  python3 process-exams.py \
    --source local \
    --limit $((batch * 100)) \
    --full
done
```

### Caso 2: Atualizar apenas provas de 2024

```bash
# Copiar apenas PDFs de 2024
cp ~/Downloads/*2024*.pdf provas_pdf/

# Processar
python3 process-exams.py --full --verbose
```

### Caso 3: Testar com poucos PDFs

```bash
# Copiar 5 PDFs para teste
cp provas_pdf/*.pdf provas_pdf_test/
ls provas_pdf_test/ | head -5 | xargs -I {} mv provas_pdf_test/{} provas_pdf_temp/

# Processar
python3 process-exams.py --source local --pdf-dir provas_pdf_temp --full
```

---

## 🐛 Troubleshooting

### Erro: "ModuleNotFoundError: No module named 'PyPDF2'"

```bash
pip install PyPDF2
```

### Erro: "No PDF files found"

```bash
# Verificar diretório
ls -la provas_pdf/

# Certificar que tem .pdf
file provas_pdf/*
```

### Erro: "Cloudflare credentials not configured"

```bash
# Modo simulação (salva localmente)
python3 process-exams.py --full  # Sem credenciais

# Com credenciais
export CLOUDFLARE_API_KEY="abc123"
export CLOUDFLARE_ACCOUNT_ID="xyz789"
python3 process-exams.py --full
```

### Memória insuficiente

```bash
# Processar em lotes menores
python3 extract-exams.py --source local --limit 50 --output data/batch1.json
python3 extract-exams.py --source local --limit 50 --output data/batch2.json

# Mesclar depois
python3 -c "
import json
q1 = json.load(open('data/batch1.json'))
q2 = json.load(open('data/batch2.json'))
json.dump(q1 + q2, open('data/exams.json', 'w'))
"
```

---

## 📈 Performance

| Operação | Tempo | Memória |
|----------|-------|---------|
| Extrair 100 provas (500 questões) | ~30s | 500MB |
| Criar embeddings (500 questões) | ~45s | 2GB |
| Indexar (500 questões) | ~5s | 300MB |
| **Total** | **~80s** | **2GB** |

---

## 🔗 Integração com StudyMaster

### 1. Copiar dados

```bash
cp data/indexed_documents.json ../../indexed_documents.json
cp data/indexing-report.json ../../public/data/exams-report.json
```

### 2. Atualizar worker.js

```javascript
// No worker.js
const INDEXED_EXAMS = await env.EXAMS.get('indexed_documents') 
  || await fetch('https://seu-dominio/indexed_documents.json').then(r => r.json());

// Usar na geração de questões
const similar = findSimilarQuestions(payload.topic, INDEXED_EXAMS);
```

### 3. Testar

```bash
# Verificar integração
curl https://seu-dominio/api/questions \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "concurso",
    "banca": "FCC",
    "topic": "Direito Constitucional",
    "quantity": 5
  }'
```

---

## 📚 Fontes de Provas

| Fonte | Provas | Status |
|-------|--------|--------|
| PCI Concursos | 266.286 | ✓ Dados disponíveis |
| PCDF | ~5.000 | ⏳ Planejado |
| Núcleo de Concursos | ~50.000 | ⏳ Planejado |
| Instituto Brasileiro | ~30.000 | ⏳ Planejado |

---

## 📝 Exemplos

### Exemplo 1: Processar com limite

```bash
python3 extract-exams.py \
  --source local \
  --pdf-dir ./provas_pdf \
  --output data/exams.json \
  --limit 10
```

### Exemplo 2: Usar arquivo específico

```bash
python3 index-to-vectorize.py \
  --input data/batch_001.json \
  --report data/report_001.json \
  --verbose
```

### Exemplo 3: Validar resultado

```bash
python3 -c "
import json
with open('data/exams.json') as f:
    qs = json.load(f)
print(f'Total: {len(qs)}')
print(f'Primeiro: {qs[0][\"statement\"][:100]}...')
"
```

---

## 📞 Suporte

- **Issues**: Verificar logs com `--verbose`
- **Performance**: Usar `--limit` para testes
- **Memória**: Processar em lotes menores

