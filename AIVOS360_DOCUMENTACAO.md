# Documentação Técnica e Funcional: Mentor AIVOS 360

Este documento descreve detalhadamente todas as funções, algoritmos e lógicas de interface implementadas no módulo **AIVOS 360** dentro do StudyMaster. O AIVOS 360 atua como um mentor inteligente, guiando a jornada de estudos do usuário desde o diagnóstico inicial até o acompanhamento avançado.

---

## 1. Diagnóstico Inicial e Integração
O ponto de partida do AIVOS 360 é a etapa de configuração inicial (Step 3 do fluxo principal), onde o sistema coleta variáveis cruciais do usuário para calibrar a Inteligência Artificial.

- **Variáveis Coletadas:** Concurso-alvo, Cargo, Banca Examinadora, Data da Prova, Nível Geral do Aluno (Iniciante, Intermediário, Avançado) e Horas de Estudo Diárias.
- **Armazenamento:** Salvo no estado global `state.aivos360State` (persistido via `localStorage`).

---

## 2. Missão Diária Dinâmica
A Missão Diária é o núcleo tático do AIVOS 360, focada em traduzir os objetivos em tarefas factíveis dia após dia.

### `gerarOuRecuperarMissaoDiaria()`
- **Lógica de Geração:** Verifica se já existe uma missão para a data atual (`hoje`). Se não existir ou se o usuário mudou de *Modo Inteligente* (causando uma regeneração), ele cria uma nova lista de 3 tarefas principais.
- **Algoritmo Adaptativo:** O conteúdo das tarefas (quantidade de horas teóricas, número exato de questões a resolver) é calculado dinamicamente com base nas **Horas Disponíveis (`horasDia`)** e no **Modo Inteligente** ativo.
  - *Exemplo:* No "Modo Cursinho", a carga teórica ocupa 60% do tempo. No "Modo Guerra", 0% teoria e o foco cai para simulados (15 questões por hora disponível).
- **Acompanhamento de Streak (`toggleMissaoTarefa`):** Quando o usuário conclui todas as tarefas da missão do dia atual, o `streak` (dias seguidos de estudo) avança em +1. Se a tarefa for desmarcada, a lógica de reversão de streak atua preventivamente.

---

## 3. Revisão Espaçada (Algoritmo de Memória)
Baseado nos modelos da Curva de Esquecimento de Ebbinghaus, garante retenção a longo prazo sem sobrecarregar o estudante.

### `gerarOuRecuperarRevisoes()`
- Injeta estruturas de dados independentes no estado para cada assunto recém-estudado.
- Os tópicos possuem um `intervaloAtual` e uma `proximaRevisao` (data isolada).

### `avancaRevisao(id)`
- É acionada quando o usuário clica no botão **[Revisado]** no Dashboard.
- **Cálculo do Ciclo (D+1, D+7, D+30, D+60):** 
  - Se o item estava no ciclo de 1 dia, a próxima data de revisão pula para daqui a 7 dias.
  - De 7 dias pula para 30 dias, e assim progressivamente.
- O Dashboard só exibe no quadro *O que revisar hoje* as matérias cuja `proximaRevisao` é menor ou igual à data de hoje, adicionando *badges* automáticos de "Hoje" ou "🔴 Atrasado".

---

## 4. Modos Inteligentes de Estudo
O motor estratégico central. A rotina muda completamente dependendo da aproximação da prova do usuário.

### `calcularModoInteligente()`
- Roda silenciosamente sempre que o Dashboard é aberto. Calcula a diferença em dias entre a *Data de Hoje* e a *Data da Prova* informada.
- **As 3 Engrenagens:**
  - **Modo Cursinho Completo (> 180 dias):** Distância segura da prova. Foco absoluto em construção de base. Muita teoria e elaboração de resumos.
  - **Modo Aprovação (Entre 60 e 180 dias):** Abordagem híbrida. Tenta fechar buracos teóricos e mescla com baterias de prática guiada.
  - **Modo Guerra (< 60 dias):** Reta final e pós-edital. O algoritmo corta quase toda a teoria e satura o usuário com simulados intensos e revisão de falhas (lei seca, pegadinhas).
  
### `changeModoInteligente(novoModo)` (Override Manual)
- Permite que o usuário no Dashboard interfira e troque o modo (via dropdown). Quando ativado, salva a flag `modoManual = true` para que o algoritmo de ativação automática não o sobrescreva mais na próxima visita.

---

## 5. Radar AIVOS (Centro Analítico e de Riscos)
Em vez de listar erros numéricos, o Dashboard compila uma leitura inteligente do histórico do usuário via relatórios rápidos.

- **Lacunas Ocultas:** A inteligência identifica em sub-tópicos onde o aluno acha que domina (baseado na disciplina raiz), mas possui altas taxas de erros práticos (ex: é bom em D. Administrativo, mas péssimo em Licitações).
- **Risco de Prova:** Uma feature crítica. Se o aluno está fraco (Nível 1) em um assunto que possui altíssima incidência nas provas da banca (Curva ABC de cobrança), o Radar emite um alerta vermelho imediato.
- **Previsão de Esquecimento:** Relaciona-se com a *Revisão Espaçada*. Informa com antecedência quando uma memória técnica está prestes a entrar em declínio drástico se não for estimulada.

---

## 6. Gamificação e UX Proativa

### Certificação de Domínio (Níveis 1 a 5)
Um sistema de ranqueamento interno por *disciplina* separada. Processando a nota dos simulados, o AIVOS classifica o aluno em Nível 1 (Iniciante), Nível 3 (Intermediário), Nível 5 (Mestre), etc. Oferece clareza imediata sobre quais matérias sustentam ou afundam sua nota geral.

### Coach Proativo Dinâmico
- A interface `renderAivos360CoachBanner()` funciona como a "voz" da Inteligência Artificial.
- Produz uma notificação em tempo real elogiando bom andamento de tempo no *Modo Cursinho*, ou gerando alertas sobre negligência em disciplinas específicas quando atinge *Modos de Guerra ou Aprovação*.

### Auditoria de IA (`showAuditoriaIA()`)
- O botão **[ ℹ️ Auditoria IA ]** foi criado para garantir **transparência e explicabilidade ("Explainable AI")**.
- Uma quebra de paradigma do mercado educacional: Ao clicar, a IA revela de forma declarativa os parâmetros lógicos que a levam a montar aquelas missões, mostrando peso das bancas, limite de carga horária e peso de relevância.
