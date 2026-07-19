/**
 * Mentor Class Controller
 * Integração da arquitetura Mentor Class (Aivos 360) com o estado global, 
 * Worker de Questões, Protocolos e Mascote (AivosPresence).
 */

const MENTOR_SYSTEM_PROMPT = `
ROLE: Você é o Mentor Tático de alta performance da plataforma Mentor Class.
MISSÃO: Mapear falhas, cobrar foco e esclarecer dúvidas estritamente baseadas no Edital e nas metas do dia.
TOM DE VOZ: Direto, analítico e encorajador. Use frases curtas. 

REGRAS:
1. Nunca invente regras de concurso ou leis.
2. Se a dúvida técnica do aluno não puder ser resolvida com certeza absoluta, responda: "Isso foge ao nosso material de base seguro. Consulte a documentação oficial."
3. Lembre o aluno do tempo restante até a prova se ele demonstrar desmotivação.
`;

document.addEventListener('DOMContentLoaded', () => {

  // AÇÃO 1: Persistência de Dados (Step 2 e Step 3)
  const nextBtn = document.getElementById('next-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (window.state && window.state.mode === 'aivos360') {
        
        // Salvando dados do Step 2 (Setup Inicial)
        if (window.state.currentStep === 2) {
          const textEl = document.getElementById('aivos-edital-text');
          const linkEl = document.getElementById('aivos-edital-link');
          const nivelEl = document.getElementById('aivos-nivel-inicial');
          
          window.state.mentorEditalText = textEl ? textEl.value : null;
          window.state.mentorEditalLink = linkEl ? linkEl.value : null;
          window.state.mentorNivel = nivelEl ? nivelEl.value : null;
          
          // INJEÇÃO TÁTICA: Mock do Parser do Edital (Para testes de UI)
          // Isso simula o JSON que a IA devolveria, ativando a barra lateral do Step 4.
          if (window.state.mentorEditalText || window.state.mentorEditalLink) {
              window.state.editalProcessado = {
                  disciplinas: [
                      { nome: "Língua Portuguesa (Mock)", dominio: 85 },   // Vai renderizar 🟢
                      { nome: "Direito Constitucional", dominio: 65 },     // Vai renderizar 🟡
                      { nome: "Raciocínio Lógico", dominio: 40 },          // Vai renderizar 🔴
                      { nome: "Legislação Municipal", dominio: 10 }        // Vai renderizar 🔴
                  ]
              };
          }

          console.log('[Mentor Class] Dados do Edital salvos:', {
            text: window.state.mentorEditalText,
            link: window.state.mentorEditalLink,
            nivel: window.state.mentorNivel
          });
        }
        
        // Salvando dados do Step 3 (Planejamento da Rota)
        else if (window.state.currentStep === 3) {
          const chEl = document.getElementById('aivos-ch-diaria');
          const dataEl = document.getElementById('aivos-data-prova');
          const focoEl = document.getElementById('aivos-foco');
          
          window.state.mentorChDiaria = chEl ? chEl.value : null;
          window.state.mentorDataProva = dataEl ? dataEl.value : null;
          window.state.mentorFoco = focoEl ? focoEl.value : null;
          
          const checkDescanso = document.querySelectorAll('#step-3-content-aivos input[type="checkbox"]:checked');
          window.state.mentorDiasDescanso = Array.from(checkDescanso).map(cb => cb.value);
          
          console.log('[Mentor Class] Dados de Planejamento salvos:', {
            ch: window.state.mentorChDiaria,
            prova: window.state.mentorDataProva,
            foco: window.state.mentorFoco,
            descanso: window.state.mentorDiasDescanso
          });
        }
      }
    });
  }

  // AÇÃO 4: Travar a Rota Diária inicialmente
  // Observa quando a classe '.rota-center' é inserida no DOM para aplicar o lock
  const observer = new MutationObserver(() => {
    const rotaCenter = document.querySelector('.rota-center');
    const revisaoQuiz = document.querySelector('.revisao-quiz');
    if (rotaCenter && revisaoQuiz && !rotaCenter.dataset.locked) {
      rotaCenter.dataset.locked = "true";
      rotaCenter.style.opacity = '0.5';
      rotaCenter.style.pointerEvents = 'none';
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Event Delegation para cliques no Dashboard do Mentor
  document.addEventListener('click', (e) => {
    
    // AÇÃO 2: Invocação do Motor (COMEÇAR SESSÃO)
    const btnComecar = e.target.closest('.btn-comecar-sessao');
    if (btnComecar) {
      const step4 = document.getElementById('step-4-content');
      
      // 1. Muda a interface para Estado de Carregamento (Spinner)
      if (step4) {
        step4.innerHTML = `
          <div style="padding: 40px 24px; text-align: center; color: white;">
            <div class="spinner" style="margin: 0 auto 24px auto;"></div>
            <h2 style="font-size: 1.5rem; margin-bottom: 8px;">Preparando a Sessão de Estudos...</h2>
            <p style="color: #9CA3AF;">Aplicando protocolos de garantia e gerando rota inteligente.</p>
          </div>
        `;
      }

      // 2. Acorda o Worker e passa o Contexto da Sessão
      if (window.Worker) {
        // Inicializa o seu worker nativo
        const mentorWorker = new Worker('worker.js'); 
        
        // Envia o JSON do edital e o nível do aluno para o worker montar a prova
        mentorWorker.postMessage({
          command: 'START_SESSION',
          payload: {
            editalData: window.state.editalProcessado,
            nivel: window.state.mentorNivel,
            foco: window.state.mentorFoco
          }
        });

        // 3. Aguarda o retorno do Worker com as Questões Geradas
        mentorWorker.onmessage = function(event) {
          const dadosDaSessao = event.data;
          
          if (dadosDaSessao.status === 'success') {
            // Sucesso: Renderiza a interface de resolução de questões
            if (typeof renderizarSessaoAtiva === 'function') {
                renderizarSessaoAtiva(step4, dadosDaSessao.questoes);
            } else {
                step4.innerHTML = `<div style="color: #10B981; text-align: center;">Sessão gerada com sucesso! (Renderização pendente)</div>`;
            }
          } else {
            // Falha: Retorna o erro ao aluno
            step4.innerHTML = `<div style="color: #F87171; text-align: center;">Erro ao carregar sessão: ${dadosDaSessao.error}</div>`;
          }
        };

        mentorWorker.onerror = function(error) {
           console.error("Falha no motor do Mentor Class:", error);
           step4.innerHTML = `<div style="color: #F87171; text-align: center;">Ocorreu uma falha crítica na geração da rota.</div>`;
        };

      } else {
         // Fallback se o navegador do usuário for muito antigo
         if (typeof callWorkerAndRender === 'function') {
           callWorkerAndRender(); 
         }
      }
    }

    // AÇÃO 3: Integração do Mascote (O Perito)
    const fabMentor = e.target.closest('.fab-mentor');
    if (fabMentor) {
      if (window.AivosPresence && typeof window.AivosPresence.toggleChat === 'function') {
        window.AivosPresence.toggleChat();
      } else {
        // Fallback caso a API ainda não esteja acoplada perfeitamente
        alert('Mascote AIVOS: Olá, eu sou o Mentor! Seu edital já está sendo analisado para a próxima rota.');
      }
    }

    // AÇÃO 4: Interações do Modal / Quiz Surpresa (Mockup Funcional)
    const quizBtn = e.target.closest('.revisao-quiz .btn-secondary');
    if (quizBtn && !quizBtn.disabled) {
      const parentQuiz = quizBtn.closest('.revisao-quiz');
      const allBtns = parentQuiz.querySelectorAll('.btn-secondary');
      
      // Desativa botões e marca o escolhido
      allBtns.forEach(b => {
        b.style.opacity = '0.5';
        b.disabled = true;
      });
      quizBtn.style.opacity = '1';
      quizBtn.style.background = 'rgba(59, 130, 246, 0.4)';
      quizBtn.style.borderColor = 'rgba(59, 130, 246, 0.8)';
      
      // Alerta visual de Repetição Espaçada
      if (window.AivosPresence && typeof window.AivosPresence.showToast === 'function') {
        window.AivosPresence.showToast('Resposta registrada! Motor de Repetição Espaçada atualizado.', 'success');
      } else {
        // Mockup visual inline
        const toast = document.createElement('div');
        toast.innerHTML = '🎯 Repetição Espaçada atualizada!';
        toast.style.cssText = 'position:fixed; bottom: 100px; right: 24px; background: var(--color-success, #10B981); color: white; padding: 12px 20px; border-radius: 8px; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.2); animation: fadeIn 0.3s ease;';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
      }

      // Destrava a "Meta Diária"
      const rotaCenter = document.querySelector('.rota-center');
      if (rotaCenter) {
        rotaCenter.dataset.locked = "false";
        rotaCenter.style.opacity = '1';
        rotaCenter.style.pointerEvents = 'auto';
        rotaCenter.style.transition = 'all 0.5s ease';
      }
    }
  });

  // AÇÃO 1 e 2: Trava Anti-Desperdício e Execução do Raio-X (Frontend)
  document.addEventListener('click', async (e) => {
    const btnAnalisar = e.target.closest('#btn-analisar-raio-x');
    if (btnAnalisar) {
      const textareaEdital = document.getElementById('aivos-edital-text');
      const texto = textareaEdital.value.trim();

      // Trava de segurança: impede requisições vazias ou curtas demais (menos de 50 caracteres)
      if (!texto || texto.length < 50) {
        mostrarAlerta("⚠️ Acesso Negado", "Cole o conteúdo programático do edital antes de iniciar o Raio-X.");
        textareaEdital.focus();
        return; // Interrompe a função aqui, protegendo créditos de API
      }

      // Se passou na trava, chama a função de API normal...
      await executarRaioXAPI(texto);
    }
  });

});

async function executarRaioXAPI(texto) {
    try {
        const btn = document.getElementById('btn-analisar-raio-x');
        const defaultText = btn.innerHTML;
        btn.innerHTML = '<div class="spinner" style="width:16px;height:16px;display:inline-block;margin-right:8px;"></div> Analisando...';
        btn.disabled = true;

        const response = await fetch('https://mentor-class-backend.cesarmuniz0816.workers.dev/api/parse-edital', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texto })
        });
        
        if (!response.ok) {
            throw new Error("O servidor falhou ao analisar o edital.");
        }
        
        const respostaJSON = await response.json();

        btn.innerHTML = defaultText;
        btn.disabled = false;

        // Verifica se a IA identificou que o texto é inválido/vazio
        if (respostaJSON.total_disciplinas === 0 || !respostaJSON.total_disciplinas) {
            mostrarAlerta("Erro na Leitura", respostaJSON.diagnostico_curto || "Conteúdo inválido.", "error");
            document.getElementById('aivos-edital-text').value = '';
        } else {
            // Sucesso! O edital tem dados. Renderiza os Cards bonitos.
            renderizarCardsRaioX(respostaJSON);
        }

    } catch (error) {
        console.error("Falha no Raio-X:", error);
        mostrarAlerta("Erro de Conexão", "Não foi possível realizar o Raio-X agora. Verifique a URL do backend.");
        
        // Em caso de falha de rede, reativa o botão
        const btn = document.getElementById('btn-analisar-raio-x');
        if (btn) {
            btn.innerHTML = '<i data-lucide="scan-line" width="20" height="20"></i> Gerar Raio-X do Edital';
            btn.disabled = false;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    }
}

// Função auxiliar para exibir o alerta
function mostrarAlerta(titulo, mensagem, tipo = "warning") {
    if (window.AivosPresence && typeof window.AivosPresence.showToast === 'function') {
        window.AivosPresence.showToast(`${titulo}: ${mensagem}`, tipo);
    } else {
        alert(`${titulo}\n\n${mensagem}`);
    }
}

function renderizarCardsRaioX(dados) {
    const container = document.getElementById('raio-x-results');
    if (!container) return;
    
    container.innerHTML = `
      <div style="background: var(--color-card); padding: var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--color-border); animation: fadeIn 0.4s ease;">
        <h4 style="color: var(--color-primary); margin-bottom: var(--space-3); display: flex; align-items: center; gap: 8px;">
          <i data-lucide="check-circle" width="18" height="18"></i> Raio-X Concluído
        </h4>
        <p style="color: var(--color-text-muted); font-size: 0.95rem; line-height: 1.5; margin-bottom: var(--space-4);">
          ${dados.diagnostico_curto}
        </p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
          <div style="background: rgba(255,255,255,0.03); padding: var(--space-3); border-radius: var(--radius-md);">
            <div style="font-size: 0.8rem; color: var(--color-text-muted);">Total Disciplinas</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-text);">${dados.total_disciplinas}</div>
          </div>
          <div style="background: rgba(255,255,255,0.03); padding: var(--space-3); border-radius: var(--radius-md);">
            <div style="font-size: 0.8rem; color: var(--color-text-muted);">Est. Tópicos</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-text);">${dados.estimativa_topicos}</div>
          </div>
        </div>
        <div style="background: rgba(239, 68, 68, 0.1); padding: var(--space-3); border-radius: var(--radius-md); margin-top: var(--space-3); border: 1px solid rgba(239, 68, 68, 0.2);">
          <div style="font-size: 0.8rem; color: #FCA5A5;">Disciplina Crítica</div>
          <div style="font-size: 1.1rem; font-weight: 700; color: #F87171;">${dados.disciplina_critica}</div>
        </div>
      </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

/**
 * Renderiza a interface da sessão ativa de estudos após o retorno do Worker.
 */
function renderizarSessaoAtiva(container, questoes) {
    if (!questoes || questoes.length === 0) {
        container.innerHTML = `<div style="color: #F87171; text-align: center;">Nenhuma questão retornada pela IA.</div>`;
        return;
    }

    // Pega a primeira questão para o MVP
    const q = questoes[0];

    // Gera o HTML das alternativas
    const alternativasHTML = q.alternativas.map((alt, index) => `
        <button class="mentor-alt-btn" data-correct="${q.correta === alt.charAt(0)}" style="display: block; width: 100%; text-align: left; background: #1F2937; border: 1px solid #374151; color: #E5E7EB; padding: 16px; margin-bottom: 12px; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
            ${alt}
        </button>
    `).join('');

    // Renderiza a interface de combate
    container.innerHTML = `
        <div class="sessao-ativa-wrapper" style="animation: fadeIn 0.5s ease;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid #374151; padding-bottom: 16px;">
                <span style="background: rgba(59, 130, 246, 0.2); color: #60A5FA; padding: 4px 12px; border-radius: 9999px; font-size: 0.875rem; font-weight: bold;">
                    🎯 ${q.disciplina}
                </span>
                <span style="color: #9CA3AF; font-size: 0.875rem;">Modo de Foco Ativo</span>
            </div>
            
            <h3 style="font-size: 1.25rem; font-weight: 500; color: #F9FAFB; margin-bottom: 32px; line-height: 1.6;">
                ${q.enunciado}
            </h3>
            
            <div class="alternativas-container">
                ${alternativasHTML}
            </div>

            <div id="feedback-mentor" style="display: none; margin-top: 24px; padding: 16px; border-radius: 8px; background: rgba(16, 185, 129, 0.1); border: 1px solid #10B981;">
                <h4 style="color: #10B981; margin-bottom: 8px; font-weight: bold;">🗣️ Comentário do Mentor:</h4>
                <p style="color: #E5E7EB; line-height: 1.5;">${q.comentarioMentor}</p>
                <button style="margin-top: 16px; background: #3B82F6; color: white; padding: 8px 24px; border-radius: 8px; border: none; cursor: pointer; font-weight: bold;">Avançar Rota ➔</button>
            </div>
        </div>
    `;

    // Adiciona lógica de clique nas alternativas
    const botoes = container.querySelectorAll('.mentor-alt-btn');
    const feedbackBox = container.querySelector('#feedback-mentor');

    botoes.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Trava todos os botões após responder
            botoes.forEach(b => {
                b.style.pointerEvents = 'none';
                b.style.opacity = '0.5';
            });
            
            const isCorrect = e.target.getAttribute('data-correct') === 'true';
            
            // Pinta o botão clicado de verde ou vermelho
            e.target.style.opacity = '1';
            e.target.style.background = isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)';
            e.target.style.borderColor = isCorrect ? '#10B981' : '#EF4444';

            // Mostra o comentário do mentor
            feedbackBox.style.display = 'block';
            feedbackBox.style.animation = 'fadeIn 0.5s ease';
        });
    });
}

// ==========================================
// KILL SWITCH (RESET DE JORNADA)
// ==========================================
window.resetarJornada = function() {
    const confirmacao = confirm("⚠️ ATENÇÃO: Isso vai apagar todo o seu histórico atual, metas e o edital processado. Deseja realmente iniciar uma nova jornada do zero?");
    
    if (confirmacao) {
        // 1. Destrói o cache do navegador
        localStorage.removeItem('mentor_class_save_v1');
        localStorage.removeItem('sm_state'); // Garantia de reset para chaves antigas
        
        // 2. Oblitera o estado atual da memória RAM
        window.state = {
            currentStep: 1,
            mode: null,
            editalProcessado: null
        };
        
        console.log("🗑️ Cache obliterado. Resetando sistema...");
        
        // 3. Força o recarregamento total da página limpando a interface
        window.location.reload();
    }
};
