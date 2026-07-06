# Sprint 5 — AIVOS AI Tutor

## Plano Técnico Detalhado

### Visão Geral
Evoluir o AIVOS de Coach Inteligente para **Tutor Adaptativo com IA**, capaz de planejar rotas de estudo personalizadas, simular correção de redações, gerar mapas mentais e conduzir revisões espaçadas automaticamente.

---

### Arquitetura Proposta

```
┌─────────────────────────────────────────────┐
│            AIVOS AI TUTOR                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Route   │  │  Tutor   │  │  Review  │  │
│  │ Planner  │  │  Engine  │  │  Scheduler│  │
│  └──────────┘  └──────────┘  └──────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Essay   │  │  Mind    │  │  Progress│  │
│  │  Grader  │  │  Mapper  │  │  Reporter│  │
│  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────┘
         ↕ depende de ↕
┌─────────────────────────────────────────────┐
│   AivosMemory · AivosTracker · AivosCoach   │
│   Intelligence (Sprint 4)                    │
└─────────────────────────────────────────────┘
```

---

### Módulos

#### M1 — Route Planner
- **Responsabilidade:** Criar plano de estudo semanal com base no histórico do AivosTracker
- **Input:** Disciplinas fracas, assuntos críticos, tempo disponível, metas
- **Output:** Plano de estudos com dias/horários/disciplinas sugeridas
- **Critério de Aceite:** Plano gerado em <500ms, editável pelo usuário, persistido no AivosMemory

#### M2 — Tutor Engine
- **Responsabilidade:** Adaptar dificuldade e tópicos em tempo real durante a sessão
- **Lógica:** Se acurácia > 80% nas últimas 5 questões → aumentar dificuldade; se < 40% → revisar tópico anterior
- **Integração:** intercepta `onAnswer()` do Coach Intelligence para decidir próxima questão
- **Critério de Aceite:** Questões seguintes refletem o desempenho imediato do aluno

#### M3 — Review Scheduler
- **Responsabilidade:** Agendar revisões usando curva de esquecimento (Ebbinghaus)
- **Revisões:** 1h, 24h, 7d, 30d após o primeiro contato com o tópico
- **Persistência:** localStorage via AivosMemory
- **Notificação:** Coach contextual "Hora de revisar [tópico]!"
- **Critério de Aceite:** Revisões disparadas nos intervalos corretos mesmo após reload

#### M4 — Essay Grader
- **Responsabilidade:** Corrigir redações usando a API do worker (já existente no worker.js)
- **Funcionalidades:** Nota por competência, sugestões de melhoria, detecção de desvio de tema
- **Integração:** Complementa o Redação Coach existente (`src/redbot.js`, `src/prof-aivos-mentor.js`)
- **Critério de Aceite:** Redação corrigida em <10s, feedback detalhado por competência

#### M5 — Mind Mapper
- **Responsabilidade:** Gerar mapa mental interativo da disciplina estudada
- **Visual:** SVG interativo com nós expansíveis
- **Dados:** Extraído do histórico de questões (tópicos com baixo desempenho aparecem destacados)
- **Critério de Aceite:** Mapa gerado automaticamente ao final de cada sessão

#### M6 — Progress Reporter
- **Responsabilidade:** Relatório semanal de evolução (PDF ou HTML exportável)
- **Métricas:** Questões respondidas, acurácia, tempo médio, streak máximo, XP ganho, assuntos dominados
- **Integração:** Consolida dados do Dashboard + AivosMemory + AivosTracker
- **Critério de Aceite:** Relatório gerado em <2s, visualizável no navegador

---

### Cronograma Estimado

| Módulo | Esforço | Prioridade | Dependências |
|--------|---------|------------|-------------|
| M1 — Route Planner | 3 dias | P0 | AivosMemory, AivosTracker |
| M2 — Tutor Engine | 4 dias | P0 | M1, CoachIntelligence |
| M3 — Review Scheduler | 2 dias | P1 | AivosMemory |
| M4 — Essay Grader | 3 dias | P1 | Worker API, redbot.js |
| M5 — Mind Mapper | 3 dias | P2 | AivosTracker |
| M6 — Progress Reporter | 2 dias | P2 | Dashboard, AivosMemory |

**Total estimado:** 17 dias

---

### Arquivos que serão criados

| Arquivo | Módulo | Descrição |
|---------|--------|-----------|
| `src/aivos-route-planner.js` | M1 | Engine de planejamento semanal |
| `src/aivos-tutor-engine.js` | M2 | Engine de adaptação em tempo real |
| `src/aivos-review-scheduler.js` | M3 | Agendador de revisão espaçada |
| `src/aivos-mind-mapper.js` | M5 | Gerador de mapa mental SVG |
| `src/aivos-progress-reporter.js` | M6 | Relatório semanal exportável |

### Arquivos que serão modificados

| Arquivo | Módulo | Descrição |
|---------|--------|-----------|
| `index.html` | Todos | Script tags, containers, hooks |
| `src/aivos-char.css` | M1, M5 | Estilos do planner, mind map |
| `src/aivos-coach-intelligence.js` | M2 | Integração com Tutor Engine |
| `src/worker.js` | M4 | Endpoint de correção de redação |

---

### Critérios de Aceite Globais

- [ ] Zero erros de console em Desktop e Mobile
- [ ] Nenhuma regressão nos módulos existentes (Avatar, Coach, Memory, Tracker, Celebration, Dashboard, Recomendações)
- [ ] 100% dos dados persistem via localStorage (exceto redações, que vão para o worker)
- [ ] Interface responsiva (mobile first)
- [ ] Código modular: cada módulo em arquivo separado, IIFE + `window.*` export
- [ ] Testes visuais no navegador para cada módulo
- [ ] Cobertura de tratamento de erros (try/catch em todas as integrações)

---

### Riscos

1. **Worker rate limit** — O endpoint do worker pode ter limite de requisições. Mitigação: cache local de planos e relatórios.
2. **Curva de esquecimento complexa** — Implementar versão simplificada (3 intervalos fixos) na MVP.
3. **Redação offline** — Sem internet, o Essay Grader não funciona. Mitigação: feedback fallback "Disponível quando online".
