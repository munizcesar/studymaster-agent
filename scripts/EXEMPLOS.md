# 🎓 Exemplos Práticos - Sistema de Extração de Provas

## Exemplo 1: Começar do Zero (Recomendado)

```bash
# 1. Navegar para diretório de scripts
cd scripts

# 2. Instalar dependências
pip install PyPDF2 requests sentence-transformers

# 3. Criar estrutura de diretórios
mkdir provas_pdf data

# 4. Adicionar alguns PDFs de teste
# Copie ~5 PDFs com nomes como:
#   FCC_PCDF_Escrivao_2022.pdf
#   CESGRANRIO_BACEN_2023.pdf
#   etc

# 5. Rodar pipeline completo
python3 process-exams.py --full --verbose

# 6. Verificar resultado
ls -lh data/
cat data/indexing-report.json | python3 -m json.tool
```

---

## Exemplo 2: Processar Provas Grandes (100+ PDFs)

```bash
#!/bin/bash
# script: process_large_batch.sh

cd scripts

# Dividir processamento em lotes
echo "Processando lotes de provas..."

# Lote 1: Extração (pode levar tempo)
echo "[1/3] Extraindo questões..."
python3 extract-exams.py \
  --source local \
  --pdf-dir ./provas_pdf \
  --output data/exams.json \
  --verbose

# Lote 2: Indexação
echo "[2/3] Indexando no Vectorize..."
export CLOUDFLARE_API_KEY="sua-api-key"
export CLOUDFLARE_ACCOUNT_ID="sua-account-id"

python3 index-to-vectorize.py \
  --input data/exams.json \
  --report data/indexing-report.json \
  --verbose

# Lote 3: Validação
echo "[3/3] Validando..."
python3 process-exams.py --validate

echo "✓ Processamento concluído!"
```

Executar:
```bash
chmod +x process_large_batch.sh
./process_large_batch.sh
```

---

## Exemplo 3: Análise de Resultados

```python
#!/usr/bin/env python3
# analyze_results.py

import json
from pathlib import Path
from collections import Counter

def analyze():
    """Analisar resultados da indexação"""
    
    report_file = Path("data/indexing-report.json")
    if not report_file.exists():
        print("❌ Relatório não encontrado")
        return
    
    with open(report_file) as f:
        report = json.load(f)
    
    print("\n" + "="*70)
    print("ANÁLISE DE INDEXAÇÃO")
    print("="*70)
    
    # Total de documentos
    total = report.get('total_documents', 0)
    print(f"\n📊 Total de questões indexadas: {total:,}")
    
    # Distribuição por banca
    print("\n🏛️  Top 10 Bancas:")
    bancas = report.get('bancas', {})
    for banca, count in sorted(bancas.items(), key=lambda x: x[1], reverse=True)[:10]:
        pct = (count / total * 100) if total > 0 else 0
        bar = "█" * int(pct / 2)
        print(f"  {banca:20} {count:5,} ({pct:5.1f}%) {bar}")
    
    # Distribuição por assunto
    print("\n📚 Top 10 Assuntos:")
    subjects = report.get('subjects', {})
    for subject, count in sorted(subjects.items(), key=lambda x: x[1], reverse=True)[:10]:
        pct = (count / total * 100) if total > 0 else 0
        bar = "█" * int(pct / 2)
        print(f"  {subject:30} {count:5,} ({pct:5.1f}%) {bar}")
    
    # Distribuição por dificuldade
    print("\n⚡ Distribuição de Dificuldade:")
    diffs = report.get('difficulties', {})
    for diff in ['easy', 'medium', 'hard']:
        count = diffs.get(diff, 0)
        pct = (count / total * 100) if total > 0 else 0
        bar = "█" * int(pct / 2)
        labels = {"easy": "Fácil", "medium": "Médio", "hard": "Difícil"}
        print(f"  {labels[diff]:10} {count:5,} ({pct:5.1f}%) {bar}")
    
    # Cobertura por ano
    print("\n📅 Cobertura por Ano:")
    years = sorted(report.get('years', {}).items(), reverse=True)
    for year, count in years[:10]:
        pct = (count / total * 100) if total > 0 else 0
        bar = "█" * int(pct / 2)
        print(f"  {year:4} {count:5,} ({pct:5.1f}%) {bar}")
    
    print("\n" + "="*70)
    print(f"Gerado em: {report.get('timestamp', 'N/A')}")
    print("="*70 + "\n")

if __name__ == "__main__":
    analyze()
```

Usar:
```bash
python3 analyze_results.py
```

Saída esperada:
```
======================================================================
ANÁLISE DE INDEXAÇÃO
======================================================================

📊 Total de questões indexadas: 15,342

🏛️  Top 10 Bancas:
  FCC                    3,241 ( 21.1%) ██████████
  CESGRANRIO             2,890 ( 18.8%) █████████
  IBFC                   1,543 ( 10.0%) █████
  VUNESP                 1,432 (  9.3%) ████
  CEBRASPE               1,234 (  8.0%) ████
  ...

📚 Top 10 Assuntos:
  Direito Penal          2,341 ( 15.2%) ███████
  Português              1,890 ( 12.3%) ██████
  Matemática             1,765 ( 11.5%) █████
  Direito Constitucional 1,543 ( 10.0%) █████
  ...
```

---

## Exemplo 4: Busca Vetorial (Teste)

```python
#!/usr/bin/env python3
# test_vector_search.py

import json
from pathlib import Path
import numpy as np
from sentence_transformers import SentenceTransformer

def cosine_similarity(a, b):
    """Calcula similaridade cosseno"""
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def search_similar(query: str, top_k: int = 5):
    """Busca questões similares"""
    
    # Carregar documentos indexados
    docs_file = Path("data/indexed_documents.json")
    if not docs_file.exists():
        print("❌ Arquivo de documentos indexados não encontrado")
        return
    
    with open(docs_file) as f:
        documents = json.load(f)
    
    if not documents:
        print("❌ Nenhum documento indexado")
        return
    
    # Carregar modelo de embedding
    print("🔄 Carregando modelo de embeddings...")
    embedder = SentenceTransformer('sentence-transformers/multilingual-bge-small-1.5-v2')
    
    # Gerar embedding da query
    print(f"🔍 Buscando por: '{query}'")
    query_embedding = embedder.encode(query, convert_to_tensor=False)
    
    # Calcular similaridade
    print("⚙️  Calculando similaridades...")
    similarities = []
    
    for doc in documents:
        doc_embedding = np.array(doc['values'])
        similarity = cosine_similarity(query_embedding, doc_embedding)
        similarities.append((similarity, doc))
    
    # Ordenar e retornar top-k
    similarities.sort(key=lambda x: x[0], reverse=True)
    
    print(f"\n{'='*70}")
    print(f"TOP {top_k} QUESTÕES SIMILARES")
    print(f"{'='*70}\n")
    
    for i, (score, doc) in enumerate(similarities[:top_k], 1):
        meta = doc['metadata']
        print(f"[{i}] Similaridade: {score:.2%}")
        print(f"    Banca: {meta.get('banca', 'N/A')}")
        print(f"    Prova: {meta.get('exam', 'N/A')}")
        print(f"    Assunto: {meta.get('subject', 'N/A')}")
        print(f"    Dificuldade: {meta.get('difficulty', 'N/A')}")
        print(f"    Questão: {meta.get('statement', 'N/A')[:100]}...")
        print()
    
    print(f"{'='*70}\n")

if __name__ == "__main__":
    import sys
    
    # Exemplos de busca
    queries = [
        "Direito Penal - crimes contra a vida",
        "Português - regência verbal",
        "Direito Constitucional - direitos fundamentais",
    ]
    
    if len(sys.argv) > 1:
        query = " ".join(sys.argv[1:])
    else:
        query = queries[0]
    
    search_similar(query, top_k=5)
```

Usar:
```bash
python3 test_vector_search.py "Direito Constitucional"
python3 test_vector_search.py "Português - ortografia"
```

---

## Exemplo 5: Integração com Worker.js

```javascript
// No worker.js - Adicionar function para busca em provas indexadas

async function searchIndexedExams(topic, banca, limit = 5) {
  try {
    // Carregar documentos indexados
    const indexedExams = await env.BUCKET.get('indexed_documents.json');
    
    if (!indexedExams) {
      logger.warn('Indexed exams not available');
      return [];
    }
    
    const documents = JSON.parse(indexedExams);
    
    // Filtrar por banca e assunto
    const filtered = documents.filter(doc => {
      const meta = doc.metadata;
      const matchBanca = !banca || meta.banca === banca;
      const matchTopic = !topic || meta.subject?.includes(topic);
      return matchBanca && matchTopic;
    });
    
    // Retornar os primeiros `limit`
    return filtered.slice(0, limit).map(doc => ({
      statement: doc.metadata.statement,
      banca: doc.metadata.banca,
      exam: doc.metadata.exam,
      year: doc.metadata.year,
      subject: doc.metadata.subject,
      difficulty: doc.metadata.difficulty,
    }));
    
  } catch (error) {
    logger.error('Error searching indexed exams:', error);
    return [];
  }
}

// Usar na geração de questões
async function generateQuestion(mode, topic, banca, difficulty) {
  // Buscar exemplos de provas reais
  const exampleQuestions = await searchIndexedExams(topic, banca, 3);
  
  if (exampleQuestions.length > 0) {
    console.log('Found similar questions in database:');
    exampleQuestions.forEach((q, i) => {
      console.log(`  ${i+1}. ${q.statement.substring(0, 50)}...`);
    });
  }
  
  // Continuar com geração...
}
```

---

## Exemplo 6: Migração de Dados Incrementais

```bash
#!/bin/bash
# process_incremental.sh - Processar novas provas periodicamente

PROVAS_DIR="provas_pdf"
PROCESSED_DIR="provas_pdf/processed"
DATA_DIR="data"

mkdir -p "$PROCESSED_DIR"

# Encontrar PDFs novos
echo "🔍 Procurando por novos PDFs..."
NEW_PDFS=$(find "$PROVAS_DIR" -name "*.pdf" -not -path "$PROCESSED_DIR/*" -mtime -1)
COUNT=$(echo "$NEW_PDFS" | wc -l)

if [ $COUNT -eq 0 ]; then
  echo "✓ Nenhum PDF novo encontrado"
  exit 0
fi

echo "Found $COUNT new PDFs"

# Processar apenas novos PDFs
echo "⏳ Processando ${COUNT} novos PDFs..."
python3 extract-exams.py \
  --source local \
  --pdf-dir "$PROVAS_DIR" \
  --output "$DATA_DIR/new_exams.json" \
  --limit $COUNT

# Mesclar com dados antigos
echo "🔀 Mesclando com dados existentes..."
python3 -c "
import json
from pathlib import Path

old_file = Path('$DATA_DIR/exams.json')
new_file = Path('$DATA_DIR/new_exams.json')

# Carregar dados
old_data = json.load(open(old_file)) if old_file.exists() else []
new_data = json.load(open(new_file)) if new_file.exists() else []

# Mesclar (remover duplicatas)
all_data = old_data + new_data
unique_ids = set()
unique_data = []

for item in all_data:
  q_id = (item['statement'], item['banca'], item['year'])
  if q_id not in unique_ids:
    unique_ids.add(q_id)
    unique_data.append(item)

# Salvar
json.dump(unique_data, open(old_file, 'w'), indent=2, ensure_ascii=False)
print(f'✓ Merged: {len(old_data)} old + {len(new_data)} new = {len(unique_data)} total')
"

# Reindexar
echo "📍 Reindexando..."
python3 index-to-vectorize.py \
  --input "$DATA_DIR/exams.json" \
  --report "$DATA_DIR/indexing-report.json"

# Arquivar processados
echo "📦 Arquivando PDFs processados..."
mv "$PROVAS_DIR"/*.pdf "$PROCESSED_DIR/" 2>/dev/null || true

echo "✓ Processo incremental concluído!"

# Agendar próxima execução (cron)
# Adicionar ao crontab:
# 0 */6 * * * cd ~/studymaster-agent/scripts && bash process_incremental.sh >> logs/process.log 2>&1
```

---

## Exemplo 7: Backup e Restauração

```bash
#!/bin/bash
# backup_restore.sh

BACKUP_DIR="backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Fazer backup
backup() {
  mkdir -p "$BACKUP_DIR"
  tar -czf "$BACKUP_DIR/exams_$TIMESTAMP.tar.gz" data/
  echo "✓ Backup criado: $BACKUP_DIR/exams_$TIMESTAMP.tar.gz"
}

# Restaurar
restore() {
  if [ -z "$1" ]; then
    echo "Uso: $0 restore <arquivo.tar.gz>"
    return 1
  fi
  
  tar -xzf "$1" -C ./
  echo "✓ Restaurado de: $1"
}

case "$1" in
  backup) backup ;;
  restore) restore "$2" ;;
  *) echo "Uso: $0 {backup|restore} [arquivo]" ;;
esac
```

---

Esses exemplos cobrem a maioria dos casos de uso! Adapte conforme sua necessidade. 🚀

