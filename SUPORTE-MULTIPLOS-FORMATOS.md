# 🔄 Suporte de Múltiplos Formatos - StudyMaster vs QConcursos

## 📋 Resumo

Seu sistema agora suporta **AMBOS os formatos**:
- ✅ Seu padrão original (StudyMaster)
- ✅ Padrão QConcursos
- ✅ Conversão automática entre eles

---

## 📊 Comparação de Formatos

### Formato StudyMaster (Seu Padrão)

```json
{
  "id": "q001_fcc_2024",
  "statement": "De acordo com o Código Penal...",
  "options": [
    {"letter": "A", "text": "Opção A"},
    {"letter": "B", "text": "Opção B"},
    ...
  ],
  "correctAnswer": "D",
  "explanation": "Porque...",
  "banca": "FCC",
  "exam": "TRE-SP - Analista Judiciário",
  "year": 2024,
  "difficulty": "médio",
  "subject": "Direito Penal",
  "topic": "Dolo",
  "timestamp": "2026-05-07T12:00:00Z"
}
```

### Formato QConcursos

```json
{
  "id": "q001_fcc_2024",
  "enunciado": "De acordo com o Código Penal...",
  "alternativas": [
    {"letra": "A", "texto": "Opção A", "correta": false},
    {"letra": "B", "texto": "Opção B", "correta": true},
    ...
  ],
  "gabarito": "D",
  "explicacao": "Porque...",
  "banca": "FCC",
  "concurso": "TRE-SP - Analista Judiciário",
  "ano": 2024,
  "dificuldade": "médio",
  "disciplina": "Direito Penal",
  "assunto": "Dolo",
  "timestamp": "2026-05-07T12:00:00Z"
}
```

### Mapeamento de Campos

| StudyMaster | QConcursos | Significado |
|-------------|-----------|------------|
| statement | enunciado | Texto da pergunta |
| options[] | alternativas[] | Respostas possíveis |
| letter | letra | A, B, C, D, E |
| text | texto | Conteúdo da alternativa |
| - | correta | Boolean (sim/não) |
| correctAnswer | gabarito | Letra correta |
| explanation | explicacao | Justificativa |
| exam | concurso | Nome do concurso |
| subject | disciplina | Matéria |
| topic | assunto | Tópico específico |
| year | ano | Ano da prova |
| difficulty | dificuldade | Nível |

---

## 🚀 Como Usar

### Opção 1: Detecção Automática

O sistema detecta automaticamente qual formato você está usando:

```python
from scripts.conversor_formatos import ConversorFormatos

questao = {...}  # Pode ser qualquer formato

# Sistema detecta automaticamente
formato = ConversorFormatos.detectar_formato(questao)
# Retorna: 'studymaster' ou 'qconcursos'
```

### Opção 2: Converter um Arquivo

Se você tem questões em formato QConcursos e quer converter para StudyMaster:

```bash
cd scripts

python conversor_formatos.py \
  --input ../provas_teste/qconcursos_test_sample.json \
  --output ../provas_teste/qconcursos_convertido.json \
  --formato studymaster
```

**Resultado:**
```
✅ Arquivo convertido: .../qconcursos_test_sample.json → .../qconcursos_convertido.json
   Total de questões: 2
   Formato de destino: studymaster
```

### Opção 3: Converter para QConcursos

Ou o inverso - de StudyMaster para QConcursos:

```bash
python conversor_formatos.py \
  --input ../provas_teste/extracted_test_sample.json \
  --output ../provas_teste/extracted_como_qconcursos.json \
  --formato qconcursos
```

### Opção 4: No Código Python

```python
from scripts.conversor_formatos import ConversorFormatos

# Converter uma questão única
questao_qconcursos = {
  "enunciado": "...",
  "alternativas": [...],
  "gabarito": "D",
  ...
}

questao_studymaster = ConversorFormatos.converter(
  questao_qconcursos, 
  'studymaster'
)
```

---

## 📁 Arquivos Envolvidos

| Arquivo | Função |
|---------|--------|
| `scripts/conversor_formatos.py` | Classe para converter entre formatos |
| `provas_teste/extracted_test_sample.json` | Dados de teste em formato StudyMaster |
| `provas_teste/qconcursos_test_sample.json` | Dados de teste em formato QConcursos |

---

## ✅ Casos de Uso

### Caso 1: Você tem dados do QConcursos
```bash
# Converter para seu padrão
python conversor_formatos.py \
  --input dados_qconcursos.json \
  --output dados_studymaster.json \
  --formato studymaster

# Depois processar normalmente
python index-to-vectorize.py --input dados_studymaster.json
```

### Caso 2: Você quer exportar para QConcursos
```bash
# Converter para formato QConcursos
python conversor_formatos.py \
  --input dados_studymaster.json \
  --output dados_para_qconcursos.json \
  --formato qconcursos
```

### Caso 3: Pipeline automático
```bash
# Extrair → Converter → Indexar
python extract-exams.py --input provas.pdf --output extracted.json
python conversor_formatos.py --input extracted.json --output extracted_qc.json --formato qconcursos
python index-to-vectorize.py --input extracted_qc.json
```

---

## 🔧 Integração com Index-to-Vectorize

O script `index-to-vectorize.py` agora detecta automaticamente o formato:

```python
# Funciona com QUALQUER formato!
indexer = VectorizeIndexer(...)

# Se for QConcursos, converte automaticamente
questoes = indexer.carregar_questoes('dados_qconcursos.json')

# Se for StudyMaster, usa diretamente
questoes = indexer.carregar_questoes('dados_studymaster.json')
```

---

## 📊 Vantagens

### ✅ Flexibilidade
- Trabalhe com qualquer formato
- Integre dados de múltiplas fontes
- Exporte em qualquer formato

### ✅ Compatibilidade
- Dados do QConcursos? Sem problema!
- Dados do PCI? Sem problema!
- Seus dados? Também funciona!

### ✅ Facilidade
- Detecção automática
- Conversão em um comando
- Sem perda de dados

---

## 🎯 Próximos Passos

1. Quando obter dados do QConcursos:
   ```bash
   python conversor_formatos.py --input qc_data.json --output standardized.json
   ```

2. Depois processar normalmente com indexação

3. Tudo transparente para o usuário!

---

**Pronto! Agora seu sistema é agnóstico de formato!** 🎉
