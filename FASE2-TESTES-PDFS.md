# Fase 2: Testes com PDFs de Exemplo - Guia Prático

## 🎯 Objetivo

Validar o sistema de extração (`extract-exams.py`) com PDFs reais antes de escalar para 266.286 provas do PCI Concursos.

---

## 📋 Opções para Obter Provas de Teste

### Opção 1: PDFs Sintéticos (Rápido)
- **Script Criado**: `scripts/gerar_provas_teste.py`
- **Requerimentos**: `pip install reportlab`
- **O que faz**: Gera 2-3 PDFs com questões fictícias mas realistas
- **Tempo**: ~5 minutos
- **Pastas criadas**:
  ```
  provas_teste/
  ├── FCC_Concurso_2024.pdf
  ├── CESGRANRIO_Concurso_2023.pdf
  └── metadados.json
  ```

### Opção 2: Provas Públicas Gratuitas (Melhor Qualidade)
- **ENEM**: Provas antigas disponíveis em PDF
  - Site: https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem
  - Como obter: Baixe provas de anos anteriores
  
- **Projudi** (Judiciário):
  - Muitos editais incluem provas em PDF
  - Buscar no Google: "site:*.gov.br filetype:pdf concurso"

- **Repositórios de Concursos**:
  - Existe.um.blog (provas antigas)
  - Sites de preparação (alguns têm seção pública)

### Opção 3: Suas Próprias Provas (Ideal)
- Você tem PDFs de provas que quer indexar?
- Coloque em: `provas_teste/` e rode o script

---

## 🚀 Quick Start - Teste Imediato

### Passo 1: Instalar Dependências Python

```bash
# Ir ao diretório de scripts
cd scripts

# Instalar requirements
pip install -r requirements.txt

# Adicionalmente, para gerar PDFs de teste:
pip install reportlab
```

### Passo 2: Gerar PDFs de Teste (Sintéticos)

```bash
python3 gerar_provas_teste.py
```

**Resultado esperado:**
```
📁 Criando PDFs de teste em: /path/to/provas_teste

✅ PDF criado: .../provas_teste/FCC_Concurso_2024.pdf
✅ PDF criado: .../provas_teste/CESGRANRIO_Concurso_2023.pdf

📄 Metadados salvos em: .../provas_teste/metadados.json

📊 Resumo:
   - 2 PDFs de teste criados
   - 3 questões no total

🚀 Próximo passo:
   python3 extract-exams.py --input ../provas_teste --output data/extracted_test.json
```

### Passo 3: Testar Extração

```bash
# Modo extract-only (rápido)
python3 extract-exams.py \
  --input ../provas_teste \
  --output data/extracted_test.json \
  --verbose

# OU: usar o orquestrador (melhor)
python3 process-exams.py \
  --extract \
  --source ../provas_teste \
  --output data/extracted_test.json \
  --verbose
```

**Resultado esperado:**
```
📂 Processando arquivos em: /path/to/provas_teste

Lendo: FCC_Concurso_2024.pdf
  ✓ 2 questões extraídas
  ✓ Detectada banca: FCC
  ✓ Detectado ano: 2024

Lendo: CESGRANRIO_Concurso_2023.pdf
  ✓ 1 questão extraída
  ✓ Detectada banca: CESGRANRIO
  ✓ Detectado ano: 2023

📊 RESUMO:
   Total de PDFs processados: 2
   Total de questões extraídas: 3
   Tempo decorrido: 2.3s
   Arquivo salvo: data/extracted_test.json
```

### Passo 4: Validar Saída

```bash
# Verificar arquivo JSON gerado
cat data/extracted_test.json | jq '.[] | {statement, banca, year, correctAnswer}'
```

**Resultado esperado:**
```json
{
  "statement": "De acordo com o Código Penal Brasileiro, o dolo...",
  "banca": "FCC",
  "year": 2024,
  "correctAnswer": "D"
}
{
  "statement": "Qual é o prazo prescricional para crimes...",
  "banca": "FCC",
  "year": 2024,
  "correctAnswer": "B"
}
...
```

---

## 📊 Métricas para Validar

Depois de extrair, verifique:

### 1. Completude dos Dados
- [ ] Todos os campos presentes (statement, options, correctAnswer, etc)
- [ ] Nenhuma questão com campos vazios
- [ ] Alternativas (A-E) todas preenchidas

### 2. Qualidade da Extração
- [ ] Enunciados sem erros de formatação
- [ ] Gabaritos corretos
- [ ] Metadados (banca, ano, subject) precisos

### 3. Performance
- [ ] Tempo de extração: < 100ms por questão
- [ ] Memória usada: < 1GB para 1000 questões
- [ ] Sem crashes ou exceções não tratadas

### 4. Estrutura de Saída
```json
{
  "id": "sha256_hash",
  "statement": "Enunciado da questão",
  "options": [
    {"letter": "A", "text": "..."},
    {"letter": "B", "text": "..."},
    {"letter": "C", "text": "..."},
    {"letter": "D", "text": "..."},
    {"letter": "E", "text": "..."}
  ],
  "correctAnswer": "D",
  "explanation": "Explicação do gabarito",
  "banca": "FCC",
  "exam": "TRE-SP - Analista Judiciário",
  "year": 2024,
  "difficulty": "médio",
  "subject": "Direito Penal",
  "topic": "Dolo",
  "timestamp": "2026-05-07T12:00:00Z"
}
```

---

## 🐛 Troubleshooting Comum

### Erro: "PDFs não encontrados"
```
Solução: Verifique caminho da pasta
python3 extract-exams.py --input ./provas_teste --verbose
```

### Erro: "PyPDF2 não instalado"
```bash
pip install PyPDF2==4.0.1
pip install pdfplumber
```

### Erro: "Questões não extraídas"
```
Provável causa: Formato do PDF diferente do esperado
Solução: Ver em EXEMPLOS.md como customizar parseadores
```

### Extração lenta (>1 segundo por PDF)
```
Causa comum: Busca por embeddings em paralelo desativada
Solução: Use --no-embedding para primeira extração
```

---

## 📈 Próximos Passos Após Validar

1. **✅ Se tudo funcionar**:
   - Prosseguir para Fase 3: Integração Cloudflare
   - Usar `index-to-vectorize.py` para gerar embeddings
   - Fazer upload para Vectorize API

2. **⚠️ Se houver problemas com extração**:
   - Usar `scripts/EXEMPLOS.md` - Exemplo 2: "Análise de PDFs com Erros"
   - Customizar expressões regex em `extract-exams.py`
   - Testar com formato de PDF diferente

3. **🚀 Se quiser testar com 100+ PDFs**:
   - Baixar amostras de https://www.qconcursos.com.br (site similar)
   - Usar script em batch: `scripts/EXEMPLOS.md` - Exemplo 4: "Processamento em Lotes"

---

## 📝 Checklist da Fase 2

- [ ] Python 3.8+ instalado
- [ ] Dependências instaladas (`pip install -r requirements.txt`)
- [ ] PDFs de teste obtidos (sintéticos ou reais)
- [ ] Pasta `provas_teste/` criada
- [ ] Extração executada com sucesso
- [ ] JSON de saída validado
- [ ] Todas as métricas dentro de limites esperados
- [ ] Documentação de erros atualizada (se houver)

---

## 🎯 Estimativa de Tempo

| Atividade | Tempo |
|-----------|-------|
| Instalar Python + deps | 10 min |
| Gerar PDFs sintéticos | 2 min |
| Testar extração | 5 min |
| Validar saída | 5 min |
| Troubleshooting (se preciso) | 10 min |
| **Total** | **~30 min** |

---

**Próximo**: Assim que validar com sucesso, podemos ir para Fase 3: Cloudflare Vectorize Integration! 🚀
