# 🗺️ Mapa de Fluxo do Usuário v1

> **Versão:** 1.0  
> **Baseado em:** Análise real do código (index.html 100%, src/*.js 100%, worker.js ~98%)  
> **Nível de confiança:** 🔍 Alto (observado), 🧠 Médio (inferido), ❌ Não verificado  
> **Data:** 2 de Julho de 2026

---

## 📋 Cobertura desta análise

| Componente | Cobertura | Confiança |
|-----------|-----------|-----------|
| HTML/CSS (index.html) | 100% lido (8.922 linhas) | 🔍 Alto |
| Módulos JS (src/) | 100% lido (17 arquivos) | 🔍 Alto |
| Worker (worker.js) | ~98% lido | 🔍 Alto |
| Fluxo do Wizard | 100% observado | 🔍 Alto |
| Geração de Questões | 100% observado | 🔍 Alto |
| Modo Fullscreen | 100% observado | 🔍 Alto |
| Redação Coach | 100% observado | 🔍 Alto |
| AIVOS 360 Dashboard | 100% observado | 🔍 Alto |
| Side Drawer | 100% observado | 🔍 Alto |
| Performance real | Não testado | ❌ |
| Comportamento mobile real | Não testado | ❌ |

---

## 1. ARQUITETURA GERAL

```
┌─────────────────────────────────────────────────────────────────────┐
│                    USER ENTRY POINTS                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │ Hero CTA │  │ Logo     │  │ Drawer   │  │ Direct   │           │
│  │ (scroll) │  │ (goHome) │  │ (menu)   │  │ #wizard  │           │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘           │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    WIZARD (3 STEPS)                                 │
│                                                                     │
│  STEP 1: Mode Selection                                             │
│  ┌──────────┬──────────┬──────────┬──────────┐                     │
│  │ Concurso │ Material │ Redação  │ AIVOS 360│                     │
│  │ (quest.) │  Livre   │  Coach   │ Dashboard│                     │
│  └──────────┴──────────┴──────────┴──────────┘                     │
│         │          │          │          │                          │
│         ▼          ▼          ▼          ▼                          │
│  STEP 2: Configuration (mode-specific content)                     │
│  ┌──────────┬──────────┬──────────┬──────────┐                     │
│  │ Filtros  │ Textarea │ Banca    │ Dashboard│                     │
│  │ RAG      │ + Upload │ Select   │ + Chat   │                     │
│  └──────────┴──────────┴──────────┴──────────┘                     │
│         │          │          │          │                          │
│         └──────────┴──────────┴──────────┘                          │
│                    │                                                │
│                    ▼                                                │
│  STEP 3: Generation + Results                                       │
│  ┌────────────────────────────────────────────┐                    │
│  │ Generating Screen (spinner + skeleton)     │                    │
│  │ Questions List / Fullscreen                │                    │
│  │ Session Result                             │                    │
│  └────────────────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Cloudflare Worker)                      │
│                                                                     │
│  POST / → Payload → Embedding (BGE-M3) → Vectorize (RAG)           │
│         → LLM (Groq: Llama 3.3/3.1/Gemma 2) → Validation           │
│         → Response { questions, sources, qualityBadge }            │
│                                                                     │
│  Modes: concurso, academic, redacao, prof-aivos, free-chat,        │
│         free-flashcards, free-summarize, youtube-transcript        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. FLUXO COMPLETO DO USUÁRIO

### 2.1 Landing Page (Hero)

```
ENTRADA
  │
  ├── Usuário acessa a página
  │   🔍 Hero com:
  │     - Título: "Prepare-se para concursos com IA de verdade"
  │     - 3 features listadas (questões, redação, mentor)
  │     - CTA "Começar Agora Grátis" → scroll para #wizard
  │     - CTA "Ver como funciona" → scroll para features-section
  │     - Trust indicators (+10k questões, +5k concurseiros)
  │     - SVG animado com partículas e anéis orbitais
  │
  ├── Header sempre visível
  │   - Logo (volta ao início)
  │   - Drawer toggle (hamburger → side drawer)
  │   - Theme toggle (dark/light, persistido localStorage)
  │
  └── Seções de marketing (visíveis abaixo do wizard)
      - "Como funciona" (3 steps visuais)
      - Tabela comparativa "Com AIVOS vs Sem AIVOS"
      - Footer com logo + "Powered by Groq AI"
```

### 2.2 Wizard — Step 1: Seleção de Modo

```
WIZARD STEP 1
  │
  ├── 4 mode-cards (grid 2×2, mobile 1×1)
  │
  ├── "Caderno de Questões" (data-mode="concurso")
  │   ├── 🔍 Filtros RAG por matéria (14 disciplinas de concursos)
  │   ├── 🔍 Banca, órgão, cargo, nível, ano
  │   ├── 🔍 Gera via Worker → modo concurso
  │   └── 🔍 Mostra performance do dia (acertos/erros)
  │
  ├── "Estudar com seu Material" (data-mode="livre")
  │   ├── 🔍 Textarea + Upload de arquivo (PDF, DOCX, TXT, MD, JPG)
  │   ├── 🔍 Contador de caracteres/palavras com qualidade badge
  │   ├── 🔍 Extração via OCR para imagens (inferido)
  │   ├── 🔍 Gera via Worker → modo free-chat/free-flashcards/free-summarize
  │   └── 🧠 Material truncado em 120K caracteres (MAX_EXTRACTED_CHARS)
  │
  ├── "Redação Coach" (data-mode="redacao")
  │   ├── 🔍 Seleção de banca (ENEM, FCC, Vunesp, Cebraspe)
  │   ├── 🔍 Chat Coach RedBot (prof-redbot.js + worker handleEssayCoachSession)
  │   ├── 🔍 Modos: Coach (passo a passo) ou Correção Direta
  │   ├── 🔍 Avaliação C1-C5 (0-200 cada, total 1000)
  │   └── 🔍 Sidebar com avatar, histórico, ferramentas
  │
  └── "Plano de Estudos Inteligente" (data-mode="aivos360")
      ├── 🔍 Dashboard com métricas (domínio, aprovação, ofensividade)
      ├── 🔍 Chat com Prof. AIVOS (prof-aivos-mentor.js)
      ├── 🔍 Integração com 6 módulos de IA
      ├── 🔍 Modo conversacional: não gera questões, apenas chat
      └── 🔍 Dispara evento 'aivos360DashboardReady'
```

### 2.3 Wizard — Step 2: Configuração

```
APÓS SELECIONAR MODO
  │
  ├── Hero fica compacto (hero.compact class adicionada)
  │
  ├── STEP 2 renderizado dinamicamente via renderStep2()
  │
  ├── MODO CONCURSO:
  │   ├── Select de disciplina (14 opções de concursos)
  │   ├── Select de tópico (cascata, dependente da disciplina)
  │   ├── Input de palavra-chave
  │   ├── Select de banca (10 opções)
  │   ├── Select de órgão (17 opções)
  │   ├── Input de cargo (texto livre)
  │   ├── Select de nível escolar (fundamental/médio/técnico/superior)
  │   ├── Input de ano (de/até)
  │   └── Tags ativas (caf-active-tags)
  │
  ├── MODO ACADÊMICO:
  │   ├── Select de área (Direito, Saúde, Tecnologia, Exatas, Humanas, Negócios, ENEM)
  │   ├── Select de matéria (cascata)
  │   └── Select de tópico (cascata)
  │
  ├── MODO MATERIAL LIVRE:
  │   ├── Textarea (com contagem de caracteres/palavras)
  │   ├── Upload area (drag & drop ou clique)
  │   └── Help panel com dicas
  │
  ├── CONFIGURAÇÕES GLOBAIS (sempre visíveis):
  │   ├── Quantidade (slider 5-50, step 5, default 10)
  │   ├── Dificuldade (chips: Fácil/Médio/Difícil, default Médio)
  │   ├── Tipo de questão (Múltipla escolha/Certo-Errado/Misto)
  │   └── Alternativas (4 ou 5, default 5)
  │
  └── Botões de navegação:
      ├── "Voltar" → step 1
      └── "Continuar" → step 3 (disabled até config válida)
```

### 2.4 Wizard — Step 3: Geração e Resultados

```
STEP 3 (callWorkerAndRender())
  │
  ├── 1. TELA DE CARREGAMENTO (generating-screen)
  │   ├── Spinner + mensagens rotativas (4 mensagens, troca a cada 4.5s)
  │   ├── Skeleton de questão (placeholder visual)
  │   └── Timeout de 60s (AbortController)
  │
  ├── 2. INTEGRAÇÃO COM WORKER (fetch para WORKER_URL)
  │   ├── Payload JSON com todos os filtros + configurações
  │   ├── POST para Cloudflare Worker
  │   ├── Modos: concurso, academic, livre (free-chat/questões)
  │   └── Redação → pula geração, vai direto para Coach RedBot
  │
  ├── 3. TRATAMENTO DE ERRO
  │   ├── Erro de conexão → "Não foi possível conectar ao servidor"
  │   ├── Timeout → "Tempo esgotado"
  │   ├── Contexto insuficiente → "Não há material suficiente"
  │   ├── Erro HTTP → mensagem amigável
  │   └── Botão "Tentar novamente" (retry-btn)
  │
  ├── 4. RENDERIZAÇÃO DE QUESTÕES
  │   │
  │   ├── DESKTOP (≥1024px):
  │   │   ├── renderAllQuestionsDesktop()
  │   │   ├── Todas as questões visíveis em scroll
  │   │   ├── Cada questão: número, enunciado, opções, botão resolver
  │   │   ├── Trust badge por questão (qualidade/confiança)
  │   │   └── Bottom bar oculta
  │   │
  │   └── MOBILE (<1024px):
  │       ├── renderSingleQuestion()
  │       ├── Uma questão por vez com navegação (anterior/próximo)
  │       ├── Navegação: q-nav-bar (Anterior | X/total | Próximo/Finalizar)
  │       ├── Score bar com progresso (answered/total)
  │       └── Auto-entra em Modo Foco (openFullscreen automático)
  │
  ├── 5. RESPOSTA DO USUÁRIO
  │   ├── Seleciona alternativa → botão "Resolver" habilitado
  │   ├── Clica "Resolver" → valida, mostra feedback
  │   ├── Correto: borda verde + confetti (40 partículas)
  │   ├── Errado: borda vermelha + destaca correta
  │   ├── Explicação visível (gabarito + explicação + fonte)
  │   ├── Trust badge sempre visível (qualidade da questão)
  │   ├── Registra no DigitalTwin (inferido via evento)
  │   └── Integra com AIVOS 360 (processQuestionAnswer)
  │
  └── 6. RESULTADO DA SESSÃO
      ├── Stats: acertos, erros, rendimento %
      ├── Histórico de respostas (checklist por questão)
      ├── Botão "Refazer somente as erradas"
      ├── Botão "Nova sessão" (volta ao step 1)
      ├── Grava no sessionHistory (localStorage, max 10)
      ├── Atualiza streak (sequência de dias)
      ├── Atualiza daily count e métricas do drawer
      └── Dispara evento 'quizCompleted'
```

### 2.5 Modo Foco (Fullscreen)

```
MODO FOCO (quiz-fullscreen-overlay)
  │
  ├── ACIONADO POR:
  │   ├── Botão "Modo Foco (Fullscreen)" na tela de questões
  │   └── Auto-enter em mobile (<768px)
  │
  ├── DESKTOP (≥1024px):
  │   ├── renderAllQFQuestions() — todas as questões em scroll
  │   ├── Bottom bar oculta
  │   ├── Cabeçalho com botão de saída
  │   └── Resultado inline ao final (renderQFResultInline)
  │
  ├── MOBILE (<1024px):
  │   ├── renderQFQuestion() — uma por vez
  │   ├── Bottom bar (anterior/próximo/finalizar)
  │   ├── Cabeçalho sticky com botão de saída
  │   └── Modal de confirmação ao sair
  │
  ├── RESULTADO FULLSCREEN:
  │   ├── Ícone emocional (award/thumbs-up/book-open/target)
  │   ├── Mensagem personalizada por faixa de acerto
  │   ├── Stats: acertos, erros, aproveitamento %
  │   ├── Botão "Novo Quiz"
  │   ├── Botão "Fechar Fullscreen"
  │   ├── Confetti (120 partículas)
  │   └── Confirmação de saída (modal mobile)
  │
  └── SAÍDA:
      ├── Mobile: modal de confirmação (continuar vs sair)
      ├── Desktop: fecha direto
      └── Tecla Escape fecha
```

### 2.6 Redação Coach

```
REDAÇÃO COACH (Coach RedBot)
  │
  ├── STEP 2: Configuração
  │   ├── Select de banca (ENEM, FCC, Vunesp, Cebraspe)
  │   └── Painel explicativo do Coach Interativo
  │
  ├── STEP 3: Dashboard RedBot
  │   ├── renderRedacaoCoachDashboard()
  │   ├── Sidebar (280px, overlay em mobile):
  │   │   ├── Avatar do RedBot (gradiente azul)
  │   │   ├── Nome + status ("Online")
  │   │   ├── Bio
  │   │   ├── Botão "Novo Tema"
  │   │   └── Ferramentas (4+ botões)
  │   ├── Chat principal:
  │   │   ├── Mensagens com suporte a markdown
  │   │   ├── Input + botão de envio
  │   │   ├── Editor de redação (textarea)
  │   │   └── Botões de ação (corrigir, salvar)
  │   ├── Progresso da redação (0/5 etapas)
  │   ├── Scores C1-C5 dinâmicos
  │   ├── Histórico de redações
  │   ├── Evolução por competência
  │   ├── Plano de melhoria
  │   ├── Metas de redação
  │   └── Botão "Finalizar Redação"
  │
  ├── WORKER:
  │   ├── handleEssayCoachSession() — modo coach (etapas)
  │   ├── handleProfRedbotChat() — correção direta
  │   └── Ambos via Groq Llama 3.3 70B
  │
  └── ESTADOS:
      ├── thesis → argument1 → argument2 → conclusion → review → final
      └── Correção direta (se redação completa colada)
```

### 2.7 AIVOS 360 Dashboard

```
AIVOS 360 DASHBOARD
  │
  ├── STEP 2 (modo terminal — não vai para step 3)
  │   ├── Mode selector (Cursinho / Aprovação / Guerra)
  │   ├── 3 métricas: Domínio, Aprovação, Ofensividade
  │   └── Chat Prof. AIVOS integrado
  │
  ├── MÓDULOS DE IA (src/*.js):
  │   ├── digital-twin.js → Perfil completo do aluno
  │   ├── gap-detector.js → Lacunas de aprendizado
  │   ├── forgetting-predictor.js → Revisão espaçada SM-2
  │   ├── risk-detector.js → Riscos de reprovação
  │   ├── mastery-certifier.js → Níveis de domínio (1-5)
  │   ├── approval-predictor.js → Previsão de aprovação
  │   ├── ai-auditor.js → Auditoria de recomendações
  │   └── proactive-mentor.js → Notificações proativas
  │
  ├── PAINÉIS DO DASHBOARD:
  │   ├── Missão diária (checklist)
  │   ├── Radar AIVOS (riscos, lacunas, esquecimento)
  │   ├── Matérias dominadas (níveis 1-5)
  │   ├── Timeline de evolução
  │   ├── Plano de ação
  │   ├── Revisões programadas (D+1, D+3, D+7, etc.)
  │   └── Coach proativo (banner)
  │
  └── CHAT PROF. AIVOS:
      ├── Histórico preservado
      ├── Sugestões de ações rápidas
      ├── Suporte a edital (analisar, salvar, histórico)
      └── Dashboard button (abre o dashboard completo)
```

### 2.8 Side Drawer

```
SIDE DRAWER (painel lateral)
  │
  ├── ACIONADO POR:
  │   ├── Hamburger button no header
  │   └── Atalho Cmd/Ctrl + B
  │
  ├── 4 TABS:
  │   ├── "Resumo":
  │   │   ├── Streak card (dias de sequência)
  │   │   ├── Métricas de hoje (questões, acertos, erros)
  │   │   ├── Aproveitamento %
  │   │   └── Progress bar
  │   ├── "Histórico":
  │   │   └── Últimas 5 sessões (modo, % acerto, data)
  │   ├── "Atalhos":
  │   │   └── 4 botões para cada modo (mesma ação que Step 1)
  │   └── "Mentor":
  │       └── Dica personalizada baseada em desempenho real
  │
  └── OVERLAY: backdrop semi-transparente com blur
```

---

## 3. MAPA DE ESTADOS GLOBAIS

### 3.1 State Object (🔍 observado)

```javascript
state = {
  currentStep: 1,           // 1-3
  direction: 'forward',     // 'forward' | 'backward'
  mode: null,               // 'concurso' | 'livre' | 'redacao' | 'aivos360' | 'academic'
  
  // Modo acadêmico
  area: null, subject: null, topic: null,
  
  // Modo concurso
  concursoCategory: null, concurso: null, bancaInferida: null,
  filter: null,
  concursosFiltersState: {
    discipline: null, topic: null, keyword: '',
    examBoard: null, agency: null, position: null, educationLevel: null,
    yearFrom: null, yearTo: null,
  },
  
  // Redação
  redacaoState: {
    sessionId: null, history: [], stage: 'thesis',
    summary: '', scores: { c1:0, c2:0, c3:0, c4:0, c5:0 }, banca: 'ENEM'
  },
  
  // AIVOS 360
  aivos360State: { concurso: null, cargo: null, banca: null, experiencia: null },
  
  // Config globais
  difficulty: 'medium', quantity: 10, questionType: 'mc',
  sessionMode: 'normal', alternativas: 5, idioma: 'pt-BR', bancaFoco: 'auto',
  
  // Resultados
  generatedQuestions: [], answered: 0, correct: 0, answerResults: [],
  sessionHistory: { answers: [], correct: 0, wrong: 0 },
  
  // Metadata
  editalText: '', freeText: '',
  concursoSubStep: 'a', dailyGoal: 10,
  questionStartTime: null,
}
```

### 3.2 localStorage Keys (🔍 observado)

| Key | Tipo | Função |
|-----|------|--------|
| `aivos-theme` | 'dark' \| 'light' | Tema persistido |
| `sm_streak_date` | date string | Último dia de estudo |
| `sm_streak_count` | number | Sequência de dias |
| `sm_daily_goal` | number \| 'none' | Meta diária |
| `sm_today_count` | number | Questões hoje |
| `sm_today_date` | date string | Data atual |
| `sm_correct_today` | number | Acertos hoje |
| `sm_wrong_today` | number | Erros hoje |
| `sm_last_date` | date string | Última data (reset) |
| `sm_session_history` | JSON array | Histórico de sessões |
| `sm_redacao_state` | JSON | Estado da redação |

---

## 4. PONTOS DE INTEGRAÇÃO COM WORKER

### 4.1 Modos de Requisição

| Payload mode | Worker handler | Descrição |
|-------------|----------------|-----------|
| `concurso` | `generateConcursosRAGQuestion()` | Questões com RAG para concursos |
| `academic` | `generateAcademicRAGQuestion()` | Questões acadêmicas com RAG |
| `redacao` | `handleEssayCoachSession()` | Coach de redação por etapas |
| `redbot` | `handleProfRedbotChat()` | Chat do Coach RedBot |
| `prof-aivos` | `handleProfAivosChat()` | Chat do Prof. AIVOS |
| `free-chat` | Chat com material carregado | Perguntas sobre material |
| `free-flashcards` | Geração de flashcards | Extração de conceitos |
| `free-summarize` | Geração de resumo | Resumo estruturado |
| `youtube-transcript` | `handleYouTubeTranscript()` | Transcrição de vídeo |

### 4.2 Worker Endpoint

```
URL: https://studymaster-worker.cesarmuniz0816.workers.dev
Método: POST
Content-Type: application/json
Timeout: 60s (frontend), 30s (worker)
Cache: KV RAG_CACHE com TTL 7200s
Modelos: Groq (Llama 3.3 70B → 3.1 8B → 3 8B → Gemma 2 9B)
```

---

## 5. PONTOS DE RISCO IDENTIFICADOS

### 🔴 Risco Alto

| # | Risco | Evidência | Impacto |
|---|-------|-----------|---------|
| 1 | **Steps bar escondida** (`display: none !important`) | 🔍 CSS lido | Usuário não vê progresso no wizard |
| 2 | **Drawer mobile sem animação de abertura suave** | 🔍 Transição CSS presente mas sem teste em dispositivo real | Pode ser lento em devices fracos |
| 3 | **12+ script tags bloqueantes no `<head>`** | 🔍 Ordem de script tags lida | Renderização bloqueada até todos carregarem |
| 4 | **Sem lazy loading de módulos** | 🔍 Todos os scripts carregados no `<head>` | ~370KB de HTML + scripts no payload inicial |
| 5 | **IndexedDB vs localStorage** — sincronização frágil | 🔍 `digital-twin.js` | Perda de dados se um falhar e outro não |

### 🟡 Risco Médio

| # | Risco | Evidência | Impacto |
|---|-------|-----------|---------|
| 6 | **Código morto na raiz** (index.backup.*, check_*.js, fix-*.py) | 🔍 20+ arquivos | Confusão, sujeira no repositório |
| 7 | **Worker truncado nas últimas linhas** | 🔍 ~1KB perdido | Pode haver funções não lidas |
| 8 | **Modo Redação: save/load state via localStorage** sem criptografia | 🔍 `saveRedacaoStateLocally()` | Dados sensíveis do aluno em texto plano |
| 9 | **AIVOS 360 Dashboard carregado via evento** | 🔍 `window.dispatchEvent('aivos360DashboardReady')` | Acoplamento frágil, difícil de testar |
| 10 | **Sem fallback offline** (PWA) | ❌ Não encontrado | Sistema não funciona sem internet |

### 🟢 Risco Baixo

| # | Risco | Evidência |
|---|-------|-----------|
| 11 | **Modo acadêmico usa dados hardcoded** | 🔍 `academicData` inline no HTML | Dados extensos (~400 linhas) no HTML |
| 12 | **Canvas-confetti carregado via CDN** | 🔍 CDN URL lida | Ponto único de falha |
| 13 | **Sem validação de HTML semântico** | 🧠 Inferido de estrutura não verificada | Pode afetar SEO |

---

## 6. GAPS DE CONTINUIDADE

| Gap | Onde | Impacto |
|-----|------|---------|
| **Perfil do aluno não persiste entre modos** | state é resetado em `resetState()` | Cada sessão começa do zero |
| **Redação: sessão perdida se não salvar** | Apenas `saveRedacaoStateLocally()` no DOMContentLoaded | Fechar a página = perder progresso |
| **Histórico de sessões limitado a 10** | `MAX_SESSION_HISTORY = 10` | Dados antigos sobrescritos |
| **Sem exportação de desempenho** | Não observado nos módulos lidos | Aluno não pode levar dados para fora |
| **Modo AIVOS 360 não gera questões** | É conversacional, terminal no step 2 | Pode confundir usuário que espera questões |

---

## 7. MAPA DE NAVEGAÇÃO COMPLETO

```
┌─────────────────────────────────────────────────────────────┐
│                    INDEX.HTML                               │
│                                                             │
│  ┌─────────────┐                                            │
│  │    HEADER   │── Logo (goHome) ── Drawer ── Theme Toggle │
│  └──────┬──────┘                                            │
│         │                                                   │
│  ┌──────▼──────┐                                            │
│  │    HERO     │── CTA → Wizard                          │
│  │ (marketing) │── "Ver como funciona" → Features Section │
│  └──────┬──────┘                                           │
│         │                                                   │
│  ┌──────▼──────────────────────────────────────────────────┐│
│  │                    WIZARD                                ││
│  │                                                          ││
│  │  STEP 1 ──── Mode Selection                              ││
│  │    ├── concurso → renderStep2Concurso()                 ││
│  │    ├── livre → renderStep2Livre()                       ││
│  │    ├── redacao → renderStep2Redacao()                   ││
│  │    └── aivos360 → renderStep2AIVOS360()                 ││
│  │         │                                                ││
│  │  STEP 2 ──── Configuration                               ││
│  │    ├── (back) → Step 1                                  ││
│  │    └── (next) → Step 3 (via goToStep)                   ││
│  │         │                                                ││
│  │  STEP 3 ──── Generation / Results                        ││
│  │    ├── concurso/academic/livre → callWorkerAndRender()  ││
│  │    └── redacao → renderRedacaoCoachDashboard()          ││
│  │         │                                                ││
│  │  WIZARD NAV                                              ││
│  │    ├── back-btn (voltar)                                 ││
│  │    └── next-btn (continuar)                              ││
│  └──────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              MARKETING SECTIONS                           ││
│  │  ┌──────────────────────┬──────────────────────────────┐ ││
│  │  │ "Como funciona"      │ Tabela Comparativa           │ ││
│  │  │ (3 steps visuais)    │ "Com AIVOS vs Sem AIVOS"     │ ││
│  │  └──────────────────────┴──────────────────────────────┘ ││
│  └──────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────┐                                            │
│  │   FOOTER    │── Logo ── "Powered by Groq AI"             │
│  └─────────────┘                                            │
│                                                             │
│  ┌─────────────┐  ┌─────────────────┐                       │
│  │ Quiz        │  │ Side Drawer     │                       │
│  │ Fullscreen  │  │ 4 tabs:         │                       │
│  │ Overlay     │  │ Resumo, Hist.,  │                       │
│  │ (fixed)     │  │ Atalhos, Mentor │                       │
│  └─────────────┘  └─────────────────┘                       │
│                                                             │
│  ┌───────────────────┐                                      │
│  │ Exit Modal        │                                      │
│  │ (confirmação saída)│                                     │
│  └───────────────────┘                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 ESTATÍSTICAS DO SISTEMA

| Métrica | Valor | Fonte |
|---------|-------|-------|
| Total de modos | 4 principais + 5 workers | 🔍 Observado |
| Disciplinas de concurso | 14 com RAG | 🔍 worker.js |
| Áreas acadêmicas | 7 com RAG | 🔍 worker.js |
| Questões por sessão | 5-50 (slider) | 🔍 Observado |
| Modelos de IA disponíveis | 4 (Groq) | 🔍 worker.js |
| Arquivos JS no src/ | 17 | 🔍 Observado |
| Linhas de CSS inline | ~5.000+ | 🔍 Observado |
| Linhas de JS inline | ~3.500+ | 🔍 Observado |
| Total linhas index.html | 8.922 | 🔍 Observado |
| Total bytes index.html | ~373KB | 🔍 Observado |

---

> **Status:** Mapa de Fluxo v1 concluído com base em ~95% do código crítico do sistema.  
> **Próximo passo:** Atualizar docs/evolucaoAIVOS.md com a cobertura real atualizada.  
> **Nenhuma alteração de código foi realizada.**
