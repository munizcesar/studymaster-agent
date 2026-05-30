# GUIA DE EVOLUÇÃO — StudyMaster

> Documento mestre de controle de evolução do produto.  
> Marque cada item com `[x]` ao concluir. Não pule fases sem critério cumprido.  
> Última atualização: 2026-05-30

---

## Estado atual do projeto

- [x] Arquitetura base funcional: Worker + Vectorize + BGE-M3 + LLM
- [x] Geração de questões estruturadas em JSON
- [x] Frontend em Cloudflare Pages
- [x] Filtros por área, disciplina e nível de dificuldade
- [x] Feedback imediato com acerto/erro e explicação
- [ ] Anti-alucinação blindada (Fase 1)
- [ ] Relatório de sessão inteligente (Fase 3)
- [ ] Login e persistência (Fase 5)
- [ ] Monetização ativa (Fase 6)

---

## Diretrizes permanentes (não negociáveis)

### Produto

- O LLM **nunca** é a fonte primária de fatos, gabaritos, pesos de edital ou legislação.
- Fatos estruturais vêm de RAG (Vectorize), regras determinísticas ou arquivos versionados no repositório.
- Nenhuma funcionalidade nova entra em produção sem critério mínimo de confiabilidade definido.
- Toda fase concluída deve ser marcada neste documento com data.
- Login fica por último — primeiro existir valor claro antes de exigir conta.

### Anti-alucinação (regra de ouro)

- O LLM gera **linguagem natural** — nunca fatos, números, artigos ou estruturas curriculares.
- Questão só é gerada quando há contexto real suficiente no Vectorize.
- Gabarito é salvo no momento da geração — nunca recalculado depois.
- Diagnóstico e estatísticas são calculados por código determinístico, não por inferência livre.
- Editais, bancas e pesos de disciplinas ficam em dados estruturados versionados neste repositório.

---

## Fase 1 — Blindagem anti-alucinação

**Objetivo:** tornar o motor de geração seguro e confiável antes de qualquer expansão.  
**Status:** 🔴 Pendente  
**Critério de conclusão:** nenhuma questão gerada quando contexto for insuficiente; zero gabarito recalculado.

### Entregas

- [ ] Implementar score mínimo de similaridade cosine no Worker antes de chamar o LLM
- [ ] Definir threshold inicial (sugerido: 0.72) e registrar em `DECISOES.md`
- [ ] Filtrar contextos com score abaixo do mínimo antes de montar o prompt
- [ ] Retornar mensagem honesta ao usuário quando contexto for insuficiente
- [ ] Reescrever prompt de geração com instrução explícita de restrição ao contexto recuperado
- [ ] Proibir no prompt: invenção de artigos de lei, súmulas, datas, nomes de casos e jurisprudência
- [ ] Salvar gabarito e metadados da questão no momento da geração (estrutura em memória de sessão)
- [ ] Exigir no prompt que explicação cite o trecho ou base que fundamenta a resposta
- [ ] Criar estrutura mínima de log para auditoria: `{ topico, score_min, score_obtido, gerou, motivo_recusa }`
- [ ] Testar recusa de geração em tópico sem cobertura no Vectorize
- [ ] Validar que explicações param de inventar artigos inexistentes

### Critério técnico mínimo

```
score_minimo = 0.72
contextos_confiaveis = matches.filter(m => m.score >= score_minimo)
if (contextos_confiaveis.length < 2) → recusar geração, retornar erro informativo
```

---

## Fase 2 — Expansão de filtros e cobertura acadêmica

**Objetivo:** ampliar bancas, cargos, órgãos e legislação com base real indexada.  
**Status:** 🔴 Pendente  
**Critério de conclusão:** nenhum filtro novo publicado sem cobertura mínima no Vectorize.

### Entregas

- [ ] Expandir bancas: Cebraspe/CESPE, VUNESP, FGV, FCC, IBFC, AOCP, FUNDATEC, QUADRIX, IADES
- [ ] Estruturar órgãos por hierarquia: segurança pública, tribunais, fiscal, controle
- [ ] Estruturar cargos por órgão (ex: PC-SP → Investigador, Escrivão, Delegado, Perito)
- [ ] Expandir filtros de legislação específica: CP, CPP, CF/88, LGPD, Lei Maria da Penha, Lei de Drogas, Estatuto do Desarmamento
- [ ] Expandir ENEM com granularidade real por área e subtema
- [ ] Expandir OAB com 1ª fase por disciplina
- [ ] Expandir TI e certificações com áreas e exames específicos
- [ ] Criar checklist de cobertura mínima por disciplina antes de publicar filtro novo
- [ ] Documentar cobertura de vetores por área em `MAPA-CONTEUDO.md`

### Regra obrigatória

> Nenhum filtro novo vai para produção sem base real indexada correspondente no Vectorize.

---

## Fase 3 — Inteligência visível sem login

**Objetivo:** aumentar valor percebido e retenção antes de criar contas.  
**Status:** 🔴 Pendente  
**Critério de conclusão:** usuário sai da sessão entendendo onde foi bem, onde foi mal e o que estudar depois.

### Entregas

- [ ] Criar memória temporária de sessão para respostas, disciplinas e desempenho
- [ ] Calcular taxa de acerto por disciplina com lógica determinística (sem LLM)
- [ ] Criar tela de resultado de sessão com acertos, erros e taxa por disciplina
- [ ] Identificar pontos fortes, pontos médios e pontos fracos da sessão
- [ ] Sugerir próxima sessão com base nos erros reais da sessão atual
- [ ] Criar modo de dificuldade perceptível (fácil / médio / difícil)
- [ ] Exibir contador de uso gratuito diário mesmo sem login
- [ ] Fazer tela de resultado ter aparência de dashboard de evolução

---

## Fase 4 — Pré-produto de assinatura

**Objetivo:** construir desejo de continuidade e preparar a monetização antes da conta persistente.  
**Status:** 🔴 Pendente  
**Critério de conclusão:** produto comunica por que vale pagar antes mesmo de exigir login.

### Entregas

- [ ] Criar página de planos com proposta de valor clara
- [ ] Definir plano gratuito com limite diário
- [ ] Definir plano Pro com diferenciais objetivos
- [ ] Criar preview bloqueado de histórico e evolução
- [ ] Criar gerador de plano de estudos com dados estruturados de edital
- [ ] Criar arquivo `data/editais.json` com concursos, disciplinas e pesos reais versionados
- [ ] Adicionar aviso explícito de atualização por edital quando aplicável
- [ ] Criar mecanismo de captura de interesse para futura ativação do plano pago

---

## Fase 5 — Login e persistência real

**Objetivo:** adicionar conta somente quando o produto já tiver valor recorrente comprovado.  
**Status:** 🔴 Pendente  
**Critério de conclusão:** a conta existe para preservar progresso, não apenas para liberar acesso.

### Entregas

- [ ] Implementar login com Google (OAuth)
- [ ] Persistir histórico de sessões e respostas por usuário
- [ ] Criar dashboard real com evolução semanal e taxa por disciplina
- [ ] Criar sequência de dias estudados (streak)
- [ ] Implementar revisão espaçada com algoritmo SM-2 determinístico
- [ ] Criar relatórios recorrentes salvos por usuário
- [ ] Vincular recursos premium ao plano do usuário

---

## Fase 6 — Monetização ativa

**Objetivo:** converter o produto em receita recorrente com confiança e clareza.  
**Status:** 🔴 Pendente  
**Critério de conclusão:** assinatura vendida como sistema de evolução do aluno, não como gerador de IA.

### Entregas

- [ ] Definir preço inicial do plano Pro
- [ ] Integrar meio de pagamento adequado ao público brasileiro
- [ ] Criar limite do plano gratuito com valor percebido suficiente para conversão
- [ ] Criar oferta de teste ou período experimental se validado
- [ ] Medir taxa de ativação, retorno e conversão após lançamento
- [ ] Criar página de benefícios focada em evolução do aluno

---

## Controle de qualidade (checar antes de publicar qualquer entrega)

- [ ] A funcionalidade é coerente com a proposta de preparação inteligente
- [ ] A funcionalidade reduz ou não aumenta risco de alucinação
- [ ] A experiência é de produto, não de prompt disfarçado de interface
- [ ] Existe benefício claro para retenção ou monetização futura
- [ ] Existe documentação mínima para manutenção

---

## Histórico de conclusões

| Data | Fase | Entrega concluída |
|------|------|-------------------|
| 2026-05-30 | — | Documento GUIA-EVOLUCAO.md criado |

---

## Próxima ação imediata

**Iniciar Fase 1 — Blindagem anti-alucinação.**

Primeira entrega: implementar o filtro de score mínimo de similaridade no `worker.js` e reescrever o prompt de geração com restrição explícita ao contexto recuperado.
