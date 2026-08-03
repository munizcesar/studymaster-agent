import React, { useState, useMemo, useRef } from "react";
import {
  ChevronDown, ChevronRight, Check, X, Lock, Flame, BookOpen,
  ArrowRight, ArrowLeft, PenLine, Eraser, Plus, Loader2, Sparkles, RotateCcw,
  BookMarked, Trash2, Bookmark, FileText, Zap, RefreshCw
} from "lucide-react";
import { validar, gerarExercicioPara, gerarExerciciosDaIA } from "./universal-engine";

/* =========================================================================
   TOKENS VISUAIS E CSS
   ========================================================================= */
const STATUS = {
  pendente:     { label: "Pendente",     dot: "#C0392B", bg: "#FBEAE8", border: "#E3B8B2", text: "#8C2C1F" },
  em_progresso: { label: "Em Progresso", dot: "#B8791A", bg: "#FBF1DF", border: "#E7C98A", text: "#8A5A0E" },
  dominado:     { label: "Dominado",     dot: "#227A52", bg: "#E6F4EC", border: "#A9D4BE", text: "#175E3F" },
};

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');

* { box-sizing: border-box; }

.app-shell { display:flex; min-height:100vh; background:#F5F6F8; font-family:'Inter',sans-serif; }
@media (max-width: 860px) { .app-shell { flex-direction: column; } }

.sidebar {
  width:240px; flex-shrink:0; border-right:1px solid #E4E6EA; padding:20px 14px;
  position:sticky; top:0; height:100vh; overflow-y:auto; background:#F5F6F8; z-index:10;
}
.sidebar-heading { font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:15px; color:#1E3A5F; margin-bottom:4px; }
.sidebar-sub { font-family:'Inter',sans-serif; font-size:11px; color:#9AA1AC; margin-bottom:18px; }
.sidebar-list { display:flex; flex-direction:column; }
.sidebar-module-btn { display:flex; align-items:center; gap:8px; width:100%; text-align:left; background:transparent; border:none; border-radius:8px; padding:10px 10px; cursor:pointer; margin-bottom:4px; }
.sidebar-module-btn:hover, .sidebar-module-btn.active { background:#F2F3F5; }
.sidebar-module-title { font-family:'Inter',sans-serif; font-size:13px; color:#1B2430; font-weight:500; line-height:1.3; flex: 1; }

@media (max-width: 860px) {
  .sidebar { width:100%; height:auto; position:sticky; top:0; padding:12px 14px 10px; border-right:none; border-bottom:1px solid #E4E6EA; }
  .sidebar-heading, .sidebar-sub { display:none; }
  .sidebar-list { flex-direction:row; gap:8px; overflow-x:auto; -webkit-overflow-scrolling:touch; padding-bottom:2px; }
  .sidebar-module-btn { flex:0 0 auto; width:auto; margin-bottom:0; background:#fff; border:1px solid #E4E6EA; padding:8px 12px; }
  .sidebar-module-title { font-size:12px; white-space:nowrap; }
}

.main-content { flex:1; padding:24px 32px 60px; max-width:840px; width:100%; margin:0 auto; }
@media (max-width: 860px) { .main-content { padding:16px 14px 48px; max-width:100%; } }

.progress-card { margin-bottom:28px; background:#fff; border:1px solid #E4E6EA; border-radius:12px; padding:16px 18px; }
@media (max-width: 860px) { .progress-card { margin-bottom:20px; padding:14px 16px; position:sticky; top:0; z-index:5; } }

.module-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
.module-title { font-family:'Space Grotesk',sans-serif; font-size:17px; font-weight:600; color:#1B2430; margin:0; }
@media (max-width: 480px) { .module-title { font-size:15.5px; } }

.topic-card { border-radius:10px; background:#fff; margin-bottom:8px; overflow:hidden; transition:border-color .15s ease; position:relative; }
.topic-card-header { width:100%; display:flex; align-items:center; gap:12px; padding:12px 14px; background:transparent; border:none; cursor:pointer; text-align:left; min-height:48px; }
.topic-id { font-family:'JetBrains Mono',monospace; font-size:11px; color:#9AA1AC; min-width:24px; flex-shrink:0; display:flex; align-items:center; justify-content:center;}
.topic-name { flex:1; font-family:'Inter',sans-serif; font-size:14px; font-weight:500; color:#1B2430; }
.topic-count { font-family:'JetBrains Mono',monospace; font-size:11px; color:#9AA1AC; white-space:nowrap; }
.status-pill { display:inline-flex; align-items:center; gap:6px; font-size:11px; font-weight:600; padding:3px 9px; border-radius:999px; font-family:'Inter',sans-serif; white-space:nowrap; }
.status-dot { width:6px; height:6px; border-radius:50%; display:inline-block; }

.card-actions { padding:0 14px 14px 42px; display:flex; gap:10px; flex-wrap: wrap; }
@media (max-width: 480px) { .card-actions { flex-direction:column; padding:0 12px 12px 12px; } }

.action-btn { display:flex; align-items:center; gap:6px; flex:1; justify-content:center; padding:10px 12px; border-radius:8px; font-family:'Inter',sans-serif; font-size:13px; font-weight:600; cursor:pointer; min-height:42px; white-space:nowrap; }
@media (max-width: 480px) { .action-btn { min-height:46px; font-size:14px; } }

.modal-overlay { position:fixed; inset:0; background:rgba(20,24,31,0.45); display:flex; align-items:center; justify-content:center; z-index:50; padding:16px; }
.modal-box { background:#fff; border-radius:14px; padding:26px; width:100%; max-width:520px; box-shadow:0 20px 60px rgba(20,24,31,0.25); position:relative; max-height:88vh; overflow-y:auto; }
@media (max-width: 640px) {
  .modal-overlay { align-items:flex-end; padding:0; }
  .modal-box { max-width:100%; border-radius:18px 18px 0 0; max-height:92vh; padding:22px 18px 30px; }
}

.modal-close { position:absolute; top:14px; right:14px; background:transparent; border:none; cursor:pointer; color:#9AA1AC; padding:6px; z-index: 10;}

.answer-row { display:flex; gap:8px; align-items:center; }
.answer-input { flex:1; padding:10px 14px; border-radius:8px; font-family:'JetBrains Mono',monospace; font-size:15px; outline:none; min-height:44px; border:1.5px solid #D8DBE0;}
@media (max-width: 480px) { .answer-input { font-size:16px; } }

.mcq-option { display:flex; align-items:center; justify-content:space-between; padding:11px 14px; border-radius:8px; font-family:'Inter',sans-serif; font-size:14px; font-weight:500; text-align:left; cursor:pointer; min-height:46px; width:100%; margin-bottom: 8px;}

.btn-primary { display:flex; align-items:center; gap:6px; padding:10px 16px; border-radius:8px; border:1px solid #1E3A5F; background:#1E3A5F; color:#fff; font-family:'Inter',sans-serif; font-size:13px; font-weight:600; cursor:pointer; min-height:42px; justify-content:center; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-ghost { padding:9px 16px; border-radius:8px; border:1px solid #E4E6EA; background:#fff; color:#4A5261; font-family:'Inter',sans-serif; font-size:13px; font-weight:600; cursor:pointer; min-height:38px; display:inline-flex; align-items:center; gap:6px;}
.btn-ghost:hover { background: #F5F6F8; }

.progress-track { height:10px; border-radius:6px; background:#E9EBEF; overflow:hidden; display:flex; }
.progress-legend { display:flex; gap:16px; margin-top:6px; font-size:11px; color:#6B7280; font-family:'Inter',sans-serif; flex-wrap:wrap; }

.step-track { display:flex; gap:5px; margin-bottom:14px; }
.step-track-seg { height:4px; flex:1; border-radius:3px; }

.add-material-card { margin-bottom:20px; background:#fff; border:1px dashed #C9CDD4; border-radius:12px; padding:16px; }
.material-textarea { width:100%; min-height:140px; padding:12px; border-radius:8px; border:1.5px solid #D8DBE0; font-family:'Inter',sans-serif; font-size:14px; color:#1B2430; resize:vertical; outline:none; line-height: 1.5;}
.material-textarea:focus { border-color:#1E3A5F; }
.custom-topic-tag { display:inline-flex; align-items:center; gap:4px; font-size:10px; font-weight:600; color:#8A5A0E; background:#FFF8EC; border:1px solid #E7C98A; padding:2px 7px; border-radius:999px; font-family:'Inter',sans-serif; }

.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* Notebook specific */
.notebook-empty { text-align: center; padding: 40px 20px; color: #6B7280; font-family: 'Inter', sans-serif;}
.notebook-item { background: #fff; border: 1px solid #E4E6EA; border-radius: 12px; padding: 16px; margin-bottom: 12px; }
.notebook-item-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
.notebook-item-title { font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 600; color: #1E3A5F; }
.notebook-item-meta { font-family: 'Inter', sans-serif; font-size: 11px; color: #9AA1AC; }
.notebook-question { font-family: 'Inter', sans-serif; font-size: 14px; color: #1B2430; margin-bottom: 10px; line-height: 1.5; }
.notebook-answer { font-family: 'Inter', sans-serif; font-size: 13px; color: #227A52; background: #E6F4EC; padding: 8px 12px; border-radius: 6px; margin-bottom: 8px; }
.notebook-explanation { font-family: 'Inter', sans-serif; font-size: 12px; color: #4A5261; background: #F5F6F8; padding: 8px 12px; border-radius: 6px; }
.btn-save-notebook { background: transparent; border: 1px dashed #D8DBE0; color: #6B7280; font-size: 12px; padding: 6px 12px; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-family: 'Inter', sans-serif; }
.btn-save-notebook:hover { border-color: #1E3A5F; color: #1E3A5F; }
.btn-save-notebook.saved { background: #E6F4EC; border-color: #A9D4BE; color: #175E3F; border-style: solid; }

/* Resumo & Flashcards */
.summary-list { font-family: 'Inter', sans-serif; font-size: 14px; color: #1B2430; line-height: 1.6; padding-left: 20px; }
.summary-list li { margin-bottom: 8px; }

.flashcard-container { width: 100%; height: 260px; perspective: 1000px; margin: 20px 0; cursor: pointer; }
.flashcard-inner { width: 100%; height: 100%; position: relative; transition: transform 0.6s; transform-style: preserve-3d; }
.flashcard-container.flipped .flashcard-inner { transform: rotateY(180deg); }
.flashcard-front, .flashcard-back { width: 100%; height: 100%; position: absolute; backface-visibility: hidden; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; text-align: center; border: 2px solid #E4E6EA; }
.flashcard-front { background: #fff; }
.flashcard-back { background: #E6F4EC; border-color: #A9D4BE; transform: rotateY(180deg); color: #175E3F; }
.flashcard-text { font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 500; line-height: 1.4; }
.flashcard-hint { font-family: 'Inter', sans-serif; font-size: 11px; color: #9AA1AC; position: absolute; bottom: 12px; }
`;

/* =========================================================================
   Componentes Menores Partilhados
   ========================================================================= */

function ProgressBar({ total, dominados, emProgresso }) {
  const pDom = total === 0 ? 0 : (dominados / total) * 100;
  const pEmp = total === 0 ? 0 : (emProgresso / total) * 100;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, margin: 0, color: "#1B2430" }}>Evolução Global</h3>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#1E3A5F", fontWeight: 600 }}>{Math.round(pDom)}% Dominado</span>
      </div>
      <div className="progress-track">
        <div style={{ width: `${pDom}%`, background: "#227A52", transition: "width 0.4s ease" }} />
        <div style={{ width: `${pEmp}%`, background: "#D9A441", transition: "width 0.4s ease" }} />
      </div>
      <div className="progress-legend">
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><div className="status-dot" style={{ background: "#227A52" }} /> {dominados} Dominados</span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><div className="status-dot" style={{ background: "#D9A441" }} /> {emProgresso} Em Progresso</span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><div className="status-dot" style={{ background: "#C0392B" }} /> {total - dominados - emProgresso} Pendentes</span>
      </div>
    </div>
  );
}

function BotaoSalvarNoCaderno({ exercicio, topicoNome, onSalvar }) {
  const [salvo, setSalvo] = useState(false);

  function handleSalvar() {
    if (salvo) return;
    onSalvar(exercicio, topicoNome);
    setSalvo(true);
  }

  return (
    <button onClick={handleSalvar} className={\`btn-save-notebook \${salvo ? 'saved' : ''}\`}>
      {salvo ? <><Check size={14} /> Salvo no Caderno</> : <><Bookmark size={14} /> Salvar no Caderno</>}
    </button>
  );
}

function CampoResposta({ exercicio, onResponder, feedback, selecionado, metodo, showNotebookBtn, topicoNome, onSalvarNoCaderno }) {
  const [valor, setValor] = useState("");

  if (exercicio.tipo === "mcq") {
    return (
      <div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {exercicio.options.map((opt, idx) => {
            let border = "#E4E6EA", bg = "#fff";
            if (feedback && idx === selecionado) { border = feedback === "certo" ? "#227A52" : "#C0392B"; bg = feedback === "certo" ? "#E6F4EC" : "#FBEAE8"; }
            else if (feedback && idx === exercicio.correctIndex) { border = "#227A52"; bg = "#E6F4EC"; }
            return (
              <button key={idx} onClick={() => onResponder(null, idx)} disabled={!!feedback} className="mcq-option" style={{ border: \`1.5px solid \${border}\`, background: bg, color: "#1B2430" }}>
                {opt}
                {feedback && idx === selecionado && (feedback === "certo" ? <Check size={16} color="#227A52" /> : <X size={16} color="#C0392B" />)}
              </button>
            );
          })}
        </div>
        {feedback && (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            {metodo && (
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#4A5261", background: "#F5F6F8", borderRadius: 8, padding: "10px 12px", lineHeight: 1.5, margin: 0 }}>
                <strong>Explicação:</strong> {metodo}
              </p>
            )}
            {showNotebookBtn && <BotaoSalvarNoCaderno exercicio={exercicio} topicoNome={topicoNome} onSalvar={onSalvarNoCaderno} />}
          </div>
        )}
      </div>
    );
  }

  const borderCor = feedback === "certo" ? "#227A52" : feedback === "errado" ? "#C0392B" : "#D8DBE0";
  return (
    <div>
      <div className="answer-row">
        <PenLine size={16} color="#9AA1AC" />
        <input
          autoFocus
          value={valor}
          disabled={!!feedback}
          onChange={e => setValor(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && valor.trim() !== "" && !feedback) onResponder(valor); }}
          placeholder="Digite a resposta..."
          className="answer-input"
          style={{ border: \`1.5px solid \${borderCor}\`, background: feedback === "certo" ? "#E6F4EC" : feedback === "errado" ? "#FBEAE8" : "#fff", color: "#1B2430" }}
        />
        {!feedback && (
          <button onClick={() => valor.trim() !== "" && onResponder(valor)} className="btn-primary">Confirmar</button>
        )}
        {feedback && (feedback === "certo" ? <Check size={18} color="#227A52" /> : <X size={18} color="#C0392B" />)}
      </div>
      {feedback && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
          {feedback === "errado" && (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#C0392B", margin: 0 }}>
              Resposta certa: <strong>{exercicio.resposta}</strong>
            </p>
          )}
          {metodo && (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#4A5261", background: "#F5F6F8", borderRadius: 8, padding: "10px 12px", lineHeight: 1.5, margin: 0 }}>
              <strong>Explicação:</strong> {metodo}
            </p>
          )}
          {showNotebookBtn && <BotaoSalvarNoCaderno exercicio={exercicio} topicoNome={topicoNome} onSalvar={onSalvarNoCaderno} />}
        </div>
      )}
    </div>
  );
}

function Overlay({ children, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="modal-box">
        <button onClick={onClose} className="modal-close"><X size={18} /></button>
        {children}
      </div>
    </div>
  );
}

/* =========================================================================
   MODAIS DE RECURSOS EXTRAS (Resumo e Flashcards)
   ========================================================================= */

function ModalResumo({ topico, onClose }) {
  return (
    <Overlay onClose={onClose}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, color: "#1B2430", margin: "0 0 4px" }}>Resumo da IA</h2>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#9AA1AC" }}>{topico.nome}</span>
      </div>
      
      {(!topico.resumo || topico.resumo.length === 0) ? (
        <p style={{ color: "#6B7280" }}>Nenhum resumo gerado para este tópico.</p>
      ) : (
        <ul className="summary-list">
          {topico.resumo.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
      
      <button onClick={onClose} className="btn-primary" style={{ width: "100%", marginTop: 24 }}>Fechar Resumo</button>
    </Overlay>
  );
}

function ModalFlashcards({ topico, onClose }) {
  const cards = topico.flashcards || [];
  const [indice, setIndice] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (cards.length === 0) {
    return (
      <Overlay onClose={onClose}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, margin: "0 0 16px" }}>Flashcards</h2>
        <p style={{ color: "#6B7280" }}>Nenhum flashcard disponível para este tópico.</p>
      </Overlay>
    );
  }

  const cardAtual = cards[indice];

  function avancar() {
    if (indice < cards.length - 1) {
      setFlipped(false);
      setTimeout(() => setIndice(indice + 1), 150);
    }
  }

  function voltar() {
    if (indice > 0) {
      setFlipped(false);
      setTimeout(() => setIndice(indice - 1), 150);
    }
  }

  return (
    <Overlay onClose={onClose}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, color: "#1B2430", margin: "0 0 4px" }}>Flashcards</h2>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#9AA1AC" }}>{topico.nome}</span>
        </div>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#1E3A5F", fontWeight: 600 }}>{indice + 1} / {cards.length}</span>
      </div>

      <div className={\`flashcard-container \${flipped ? 'flipped' : ''}\`} onClick={() => setFlipped(!flipped)}>
        <div className="flashcard-inner">
          <div className="flashcard-front">
             <div className="flashcard-text" style={{ color: "#1B2430" }}>{cardAtual.frente}</div>
             <div className="flashcard-hint">Clique para revelar</div>
          </div>
          <div className="flashcard-back">
             <div className="flashcard-text">{cardAtual.verso}</div>
             <div className="flashcard-hint">Clique para esconder</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <button onClick={voltar} disabled={indice === 0} className="btn-ghost" style={{ flex: 1, justifyContent: "center" }}>
          <ArrowLeft size={16} /> Anterior
        </button>
        <button onClick={avancar} disabled={indice === cards.length - 1} className="btn-primary" style={{ flex: 1 }}>
          Próximo <ArrowRight size={16} />
        </button>
      </div>
    </Overlay>
  );
}

/* =========================================================================
   MODAIS DE ESTUDO (Aprender, Revisar, Reforçar)
   ========================================================================= */

function ModalAprender({ topico, onClose, onConcluir, onExercicioResolvido, onSalvarNoCaderno }) {
  const [passo, setPasso] = useState(0);
  const [revelado, setRevelado] = useState(false);
  const [exemploDemo] = useState(() => gerarExercicioPara(topico));
  const [exercicioSolo] = useState(() => gerarExercicioPara(topico));
  const [feedbackSolo, setFeedbackSolo] = useState(null);
  const [selecionadoSolo, setSelecionadoSolo] = useState(null);

  function responderSolo(valor, idx) {
    const res = validar(exercicioSolo, valor, idx, topico.id);
    const certo = res.acertou;
    setSelecionadoSolo(idx ?? null);
    setFeedbackSolo(certo ? "certo" : "errado");
    onExercicioResolvido(topico.id);
    if (certo) setTimeout(() => onConcluir(topico.id), 1200);
  }

  const respostaExemplo = exemploDemo.tipo === "mcq" ? exemploDemo.options[exemploDemo.correctIndex] : exemploDemo.resposta;

  return (
    <Overlay onClose={onClose}>
      <div className="step-track">
        {[0, 1].map(i => <div key={i} className="step-track-seg" style={{ background: i <= passo ? "#1E3A5F" : "#E9EBEF" }} />)}
      </div>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#9AA1AC", marginBottom: 12, display: "block" }}>
        {["Análise Guiada", "Prática Solo"][passo]} · Passo {passo + 1} de 2
      </span>

      {passo === 0 && (
        <div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#9AA1AC", margin: "0 0 12px" }}>Leia a questão com atenção. Tente respondê-la mentalmente antes de revelar a resposta.</p>
          <div style={{ background: "#F5F6F8", borderRadius: 10, padding: "16px", marginBottom: 12 }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 500, color: "#1B2430", margin: "0 0 12px", lineHeight: 1.5 }}>
              {exemploDemo.question}
            </p>
            {revelado && (
              <>
                <div style={{ padding: "10px", background: "#E6F4EC", borderRadius: 8, marginBottom: 12 }}>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#175E3F", margin: 0 }}>
                    <strong>Resposta:</strong> {respostaExemplo}
                  </p>
                </div>
                {exemploDemo.explicacao && (
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#4A5261", margin: 0, lineHeight: 1.5 }}>
                    <strong>Explicação:</strong> {exemploDemo.explicacao}
                  </p>
                )}
                <div style={{ marginTop: 12 }}>
                  <BotaoSalvarNoCaderno exercicio={exemploDemo} topicoNome={topico.nome} onSalvar={onSalvarNoCaderno} />
                </div>
              </>
            )}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            {!revelado && <button onClick={() => setRevelado(true)} className="btn-primary">Ver resposta e explicação</button>}
            {revelado && <button onClick={() => setPasso(1)} className="btn-primary">Entendi, vamos praticar <ArrowRight size={14} /></button>}
          </div>
        </div>
      )}

      {passo === 1 && (
        <div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#9AA1AC", margin: "0 0 12px" }}>Agora é com você. Sem dicas iniciais!</p>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, margin: "0 0 16px", color: "#1B2430", lineHeight: 1.4 }}>{exercicioSolo.question}</h3>
          
          <CampoResposta 
            exercicio={exercicioSolo} onResponder={responderSolo} 
            feedback={feedbackSolo} selecionado={selecionadoSolo} 
            metodo={exercicioSolo.explicacao}
            showNotebookBtn={true} topicoNome={topico.nome} onSalvarNoCaderno={onSalvarNoCaderno}
          />
          
          {feedbackSolo === "certo" && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#227A52", marginTop: 14, fontWeight: 500 }}>Muito bem! Tópico marcado como Em Progresso.</p>}
          {feedbackSolo === "errado" && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
               <button onClick={() => { setFeedbackSolo(null); setSelecionadoSolo(null); }} className="btn-ghost">Tentar novamente com dicas</button>
            </div>
          )}
        </div>
      )}
    </Overlay>
  );
}

function ModalRevisao({ topico, onClose, onConcluir, onExercicioResolvido, onSalvarNoCaderno }) {
  const TOTAL = 2;
  const [indice, setIndice] = useState(0);
  const [exercicio, setExercicio] = useState(() => gerarExercicioPara(topico));
  const [selecionado, setSelecionado] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [concluida, setConcluida] = useState(false);

  function responder(valor, idx) {
    if (feedback) return;
    const res = validar(exercicio, valor, idx, topico.id);
    const certo = res.acertou;
    setSelecionado(idx ?? null);
    setFeedback(certo ? "certo" : "errado");
    onExercicioResolvido(topico.id);
  }

  function continuar() {
    if (feedback === "certo") {
      if (indice + 1 >= TOTAL) { setConcluida(true); return; }
      setIndice(indice + 1);
      setExercicio(gerarExercicioPara(topico));
      setSelecionado(null);
      setFeedback(null);
    } else {
      setSelecionado(null);
      setFeedback(null);
    }
  }

  return (
    <Overlay onClose={onClose}>
      <div className="step-track">
        {Array.from({ length: TOTAL }).map((_, i) => (
          <div key={i} className="step-track-seg" style={{ background: i < indice || concluida ? "#1E3A5F" : "#E9EBEF" }} />
        ))}
      </div>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#9AA1AC", marginBottom: 16, display:"block" }}>
        Revisão Ativa · Questão {Math.min(indice + 1, TOTAL)} de {TOTAL}
      </span>

      {concluida ? (
        <div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "#227A52", fontWeight: 600, margin: "0 0 8px" }}>Revisão concluída com sucesso!</p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#6B7280", margin: "0 0 24px" }}>A fase de Reforço foi liberada para este tópico.</p>
          <button onClick={() => onConcluir(topico.id)} className="btn-primary" style={{ width: "100%" }}>Concluir Etapa</button>
        </div>
      ) : (
        <div>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, margin: "0 0 16px", color: "#1B2430", lineHeight: 1.4 }}>{exercicio.question}</h3>
          <CampoResposta 
            exercicio={exercicio} onResponder={responder} 
            feedback={feedback} selecionado={selecionado} 
            metodo={exercicio.explicacao}
            showNotebookBtn={true} topicoNome={topico.nome} onSalvarNoCaderno={onSalvarNoCaderno}
          />
          {feedback && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <button onClick={continuar} className="btn-primary">
                {feedback === "certo" ? (indice + 1 >= TOTAL ? "Ver resultado" : "Próxima questão") : "Tentar novamente"} <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </Overlay>
  );
}

function ModalReforcar({ topico, onClose, onDominar, onExercicioResolvido, onSalvarNoCaderno }) {
  const [streak, setStreak] = useState(0);
  const [exercicio, setExercicio] = useState(() => gerarExercicioPara(topico));
  const [selecionado, setSelecionado] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [prontoParaDominar, setProntoParaDominar] = useState(false);

  function responder(valor, idx) {
    if (feedback) return;
    const res = validar(exercicio, valor, idx, topico.id);
    const acertou = res.acertou;
    setSelecionado(idx ?? null);
    setFeedback(acertou ? "certo" : "errado");
    onExercicioResolvido(topico.id);
    const novoStreak = acertou ? streak + 1 : 0;
    setStreak(novoStreak);
    if (novoStreak >= 3) setProntoParaDominar(true);
  }

  function proximaQuestao() {
    setExercicio(gerarExercicioPara(topico));
    setSelecionado(null);
    setFeedback(null);
  }

  return (
    <Overlay onClose={onClose}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#9AA1AC", textTransform: "uppercase" }}>Reforço Contínuo</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: streak > 0 ? "#227A52" : "#4A5261", fontWeight: 700 }}>
          <Flame size={14} style={{ display: "inline", marginRight: 4, verticalAlign: "text-top", color: streak > 0 ? "#D9A441" : "inherit" }} />
          {streak}/3 Acertos Seguidos
        </span>
      </div>

      {prontoParaDominar ? (
        <div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "#227A52", fontWeight: 600, margin: "0 0 8px" }}>Excelente! Você provou que sabe.</p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#6B7280", margin: "0 0 24px" }}>Este tópico será marcado como <strong>Dominado</strong>. Retorne se sentir necessidade.</p>
          <button onClick={() => onDominar(topico.id)} className="btn-primary" style={{ width: "100%" }}>Consolidar Domínio</button>
        </div>
      ) : (
        <>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, margin: "0 0 16px", color: "#1B2430", lineHeight: 1.4 }}>{exercicio.question}</h3>
          <CampoResposta 
            exercicio={exercicio} onResponder={responder} 
            feedback={feedback} selecionado={selecionado} 
            metodo={exercicio.explicacao}
            showNotebookBtn={true} topicoNome={topico.nome} onSalvarNoCaderno={onSalvarNoCaderno}
          />
          {feedback && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: feedback === "certo" ? "#227A52" : "#C0392B" }}>
                {feedback === "certo" ? "Correto!" : "Incorreto — sequência zerada."}
              </span>
              <button onClick={proximaQuestao} className="btn-primary">Avançar <ArrowRight size={14} /></button>
            </div>
          )}
          {!feedback && (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#9AA1AC", marginTop: 16, textAlign: "center" }}>
              É necessário acertar 3 questões seguidas para dominar o tópico.
            </p>
          )}
        </>
      )}
    </Overlay>
  );
}

/* =========================================================================
   COMPONENTS DA LISTA DE TÓPICOS
   ========================================================================= */

function TopicCard({ topico, isOpen, onToggle, onAprender, onRevisar, onReforcar, onGerarMais, gerandoMaisId, onZerar, onDeletar, onVerResumo, onFlashcards }) {
  const s = STATUS[topico.status];
  const gerandoMais = gerandoMaisId === topico.id;
  const aprendeuFeito = topico.status !== "pendente";
  const revisaoFeita = !!topico.revisaoFeita;
  
  return (
    <div className="topic-card" style={{ border: \`1px solid \${isOpen ? s.border : "#E4E6EA"}\`, borderLeft: \`4px solid \${s.dot}\` }}>
      <button onClick={onToggle} className="topic-card-header">
        {isOpen ? <ChevronDown size={18} color="#6B7280" /> : <ChevronRight size={18} color="#6B7280" />}
        <span className="topic-id"><Sparkles size={14} color="#D9A441"/></span>
        <span className="topic-name">{topico.nome}</span>
        {topico.resolvidos > 0 && <span className="topic-count">{topico.resolvidos} resolvidas</span>}
        <span className="status-pill" style={{ background: s.bg, color: s.text }}>
          <span className="status-dot" style={{ background: s.dot }} />
          {s.label}
        </span>
      </button>

      {isOpen && (
        <div style={{ paddingBottom: 16 }}>
          <div className="card-actions" style={{ paddingBottom: 12 }}>
            <button onClick={() => onAprender(topico)} className="action-btn" style={{ border: "1px solid #1E3A5F", background: "#1E3A5F", color: "#fff" }}>
              {aprendeuFeito ? <Check size={16} /> : <BookOpen size={16} />} Questões
            </button>
            <button
              onClick={() => onRevisar(topico)}
              disabled={!aprendeuFeito}
              className="action-btn"
              style={{
                border: \`1px solid \${!aprendeuFeito ? "#D8DBE0" : "#227A52"}\`,
                background: !aprendeuFeito ? "#F2F3F5" : "#E6F4EC",
                color: !aprendeuFeito ? "#A7ACB5" : "#175E3F",
              }}
            >
              {!aprendeuFeito ? <Lock size={16} /> : revisaoFeita ? <Check size={16} /> : <RotateCcw size={16} />} Revisão
            </button>
            <button
              onClick={() => onReforcar(topico)}
              disabled={!revisaoFeita}
              className="action-btn"
              style={{
                border: \`1px solid \${!revisaoFeita ? "#D8DBE0" : "#D9A441"}\`,
                background: !revisaoFeita ? "#F2F3F5" : "#FFF8EC",
                color: !revisaoFeita ? "#A7ACB5" : "#8A5A0E",
              }}
            >
              {!revisaoFeita ? <Lock size={16} /> : <Flame size={16} />} Reforço
            </button>
          </div>
          
          <div style={{ padding: "0 14px 12px 42px", display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => onVerResumo(topico)} className="btn-ghost" style={{ flex: 1, padding: "8px 10px" }}><FileText size={14} /> Resumo</button>
            <button onClick={() => onFlashcards(topico)} className="btn-ghost" style={{ flex: 1, padding: "8px 10px" }}><Zap size={14} /> Flashcards</button>
          </div>

          <div style={{ padding: "0 14px 0 42px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, borderTop: "1px solid #E9EBEF", paddingTop: 12 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => onZerar(topico.id)} className="btn-ghost" style={{ padding: "4px 8px", fontSize: 11, minHeight: "auto", color: "#6B7280" }} title="Zerar progresso deste material">
                <RefreshCw size={12} /> Zerar
              </button>
              <button onClick={() => onDeletar(topico.id)} className="btn-ghost" style={{ padding: "4px 8px", fontSize: 11, minHeight: "auto", color: "#C0392B", borderColor: "transparent" }} title="Excluir material">
                <Trash2 size={12} />
              </button>
            </div>
            
            <button onClick={() => onGerarMais(topico)} disabled={gerandoMais} className="btn-ghost" style={{ padding: "4px 8px", fontSize: 11, minHeight: "auto" }}>
              {gerandoMais ? <><Loader2 size={12} className="spin" /> Gerando...</> : <><Plus size={12} /> Mais Questões</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PainelAdicionarMateria({ onAdicionar }) {
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleAdicionar() {
    if (!texto.trim() || carregando) return;
    setCarregando(true);
    try {
      const result = await gerarExerciciosDaIA(texto, 6);
      if (result.pool.length > 0 || result.flashcards.length > 0) {
        onAdicionar(result.titulo, texto, result.pool, result.resumo, result.flashcards);
        setTexto("");
        setAberto(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCarregando(false);
    }
  }

  if (!aberto) {
    return (
      <div className="add-material-card" style={{ display: "flex", justifyContent: "center", padding: "24px" }}>
        <button onClick={() => setAberto(true)} className="btn-primary" style={{ padding: "12px 24px" }}>
          <Plus size={16} /> Transformar Material em Questões
        </button>
      </div>
    );
  }

  return (
    <div className="add-material-card">
      <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, margin: "0 0 8px", color: "#1B2430" }}>Novo Material Livre</h3>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#6B7280", margin: "0 0 16px" }}>
        Cole o texto do seu resumo, PDF ou artigo. Nossa IA vai gerar um pacote com resumo, flashcards e questões para você.
      </p>
      <textarea
        autoFocus
        value={texto}
        onChange={e => setTexto(e.target.value)}
        placeholder="Cole o conteúdo aqui..."
        className="material-textarea"
      />
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button onClick={handleAdicionar} disabled={carregando || !texto.trim()} className="btn-primary">
          {carregando ? <><Loader2 size={14} className="spin" /> Processando Material...</> : <><Sparkles size={14} /> Gerar Tópico</>}
        </button>
        <button onClick={() => { setAberto(false); setTexto(""); }} className="btn-ghost" disabled={carregando}>Cancelar</button>
      </div>
    </div>
  );
}

/* =========================================================================
   CADERNO DO ALUNO VIEW
   ========================================================================= */
function CadernoDoAlunoView({ caderno, onRemover }) {
  if (caderno.length === 0) {
    return (
      <div className="notebook-empty">
        <BookMarked size={48} color="#D8DBE0" style={{ margin: "0 auto 16px" }} />
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, color: "#1B2430", margin: "0 0 8px" }}>Seu Caderno está vazio</h3>
        <p>Salve questões difíceis ou anotações importantes durante o seu estudo para revisá-las aqui depois.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, color: "#1B2430", margin: "0 0 8px" }}>📒 Meu Caderno</h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#6B7280", margin: 0 }}>Questões salvas e anotações para revisão rápida.</p>
      </div>
      
      {caderno.map(item => (
        <div key={item.id} className="notebook-item">
          <div className="notebook-item-header">
            <div>
              <span className="notebook-item-title">{item.topico}</span>
              <div className="notebook-item-meta">{new Date(item.id).toLocaleDateString()} às {new Date(item.id).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
            </div>
            <button onClick={() => onRemover(item.id)} className="btn-ghost" style={{ padding: "6px", minHeight: "auto", border: "none", color: "#C0392B", background: "#FBEAE8" }} title="Remover do caderno">
              <Trash2 size={14} />
            </button>
          </div>
          
          <div className="notebook-question">
            <strong>Questão:</strong> {item.conteudo}
          </div>
          
          <div className="notebook-answer">
            <strong>Gabarito:</strong> {item.resposta}
          </div>
          
          {item.metodo && (
            <div className="notebook-explanation">
              <strong>Explicação:</strong> {item.metodo}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* =========================================================================
   MAIN DASHBOARD COMPONENT
   ========================================================================= */
export default function MaterialLivreDashboard() {
  const [modulos, setModulos] = useState([]);
  const [caderno, setCaderno] = useState([]);
  const [visaoAtual, setVisaoAtual] = useState("dashboard"); // "dashboard" ou "caderno"
  const [openTopicId, setOpenTopicId] = useState(null);
  const [modal, setModal] = useState(null);
  const [gerandoMaisId, setGerandoMaisId] = useState(null);

  const { total, dominados, emProgresso } = useMemo(() => {
    let t = 0, d = 0, e = 0;
    modulos.forEach(m => m.topicos.forEach(topic => {
      t++;
      if (topic.status === "dominado") d++;
      if (topic.status === "em_progresso") e++;
    }));
    return { total: t, dominados: d, emProgresso: e };
  }, [modulos]);

  function atualizarTopico(topicoId, patch) {
    setModulos(prev => prev.map(m => ({ ...m, topicos: m.topicos.map(t => t.id === topicoId ? { ...t, ...patch } : t) })));
  }
  
  function incrementarResolvidos(topicoId) {
    atualizarTopico(topicoId, { resolvidos: modulos.flatMap(m => m.topicos).find(t => t.id === topicoId).resolvidos + 1 });
  }

  function handleZerar(topicoId) {
    if (confirm("Deseja zerar as estatísticas deste material?")) {
      atualizarTopico(topicoId, { status: "pendente", resolvidos: 0, revisaoFeita: false });
    }
  }

  function handleDeletar(topicoId) {
    if (confirm("Deseja deletar este material permanentemente?")) {
      setModulos(prev => prev.map(m => ({
        ...m,
        topicos: m.topicos.filter(t => t.id !== topicoId)
      })));
    }
  }

  function handleAdicionarMateria(titulo, materiaTexto, pool, resumo, flashcards) {
    const novoTopico = { 
      id: \`tcustom_\${Date.now()}\`, 
      nome: titulo, 
      status: "pendente", 
      resolvidos: 0, 
      revisaoFeita: false, 
      pool, 
      resumo,
      flashcards,
      materiaTexto, 
      custom: true 
    };
    
    setModulos(prev => {
      const idx = prev.findIndex(m => m.id === "mod_livre");
      if (idx >= 0) {
        const copia = [...prev];
        copia[idx] = { ...copia[idx], topicos: [novoTopico, ...copia[idx].topicos] }; // Adiciona no topo
        return copia;
      }
      return [...prev, { id: "mod_livre", titulo: "Meus Materiais Livres", topicos: [novoTopico] }];
    });
    setVisaoAtual("dashboard");
    setOpenTopicId(novoTopico.id);
  }

  async function handleGerarMais(topico) {
    if (gerandoMaisId) return;
    setGerandoMaisId(topico.id);
    try {
      const result = await gerarExerciciosDaIA(topico.materiaTexto, 5);
      if (result.pool.length > 0) {
        setModulos(prev => prev.map(m => ({
          ...m,
          topicos: m.topicos.map(t => t.id === topico.id ? { 
            ...t, 
            pool: [...t.pool, ...result.pool],
            flashcards: [...(t.flashcards || []), ...result.flashcards] // Aproveita pra adicionar flashcards novos
          } : t),
        })));
      }
    } finally {
      setGerandoMaisId(null);
    }
  }

  function handleSalvarNoCaderno(exercicio, topicoNome) {
    const item = {
      id: Date.now(),
      topico: topicoNome,
      conteudo: exercicio.question,
      resposta: exercicio.tipo === "mcq" ? exercicio.options[exercicio.correctIndex] : exercicio.resposta,
      metodo: exercicio.explicacao || ""
    };
    setCaderno(prev => [item, ...prev]);
  }

  return (
    <div className="app-shell">
      <style>{GLOBAL_CSS}</style>
      
      <aside className="sidebar">
        <div className="sidebar-heading">Menu Principal</div>
        <div className="sidebar-sub">Gestão de Estudos</div>
        <div className="sidebar-list">
          <button onClick={() => setVisaoAtual("dashboard")} className={\`sidebar-module-btn \${visaoAtual === "dashboard" ? "active" : ""}\`}>
             <BookOpen size={16} color="#1E3A5F" />
             <span className="sidebar-module-title">Material Livre</span>
          </button>
          <button onClick={() => setVisaoAtual("caderno")} className={\`sidebar-module-btn \${visaoAtual === "caderno" ? "active" : ""}\`}>
             <BookMarked size={16} color="#1E3A5F" />
             <span className="sidebar-module-title">Meu Caderno</span>
             {caderno.length > 0 && <span style={{ background: "#C0392B", color: "#fff", fontSize: 10, padding: "2px 6px", borderRadius: 999 }}>{caderno.length}</span>}
          </button>
        </div>
      </aside>

      <main className="main-content">
        {visaoAtual === "caderno" ? (
          <CadernoDoAlunoView caderno={caderno} onRemover={(id) => setCaderno(prev => prev.filter(i => i.id !== id))} />
        ) : (
          <>
            <div className="progress-card">
              <ProgressBar total={total} dominados={dominados} emProgresso={emProgresso} />
            </div>
            
            <PainelAdicionarMateria onAdicionar={handleAdicionarMateria} />
            
            {modulos.map(m => (
              m.topicos.length > 0 && (
                <section key={m.id} style={{ marginBottom: 32 }}>
                  <div className="module-header">
                    <h2 className="module-title">{m.titulo}</h2>
                    <span className="module-count">{m.topicos.filter(t => t.status === "dominado").length}/{m.topicos.length} Dominados</span>
                  </div>
                  {m.topicos.map(topico => (
                    <TopicCard 
                      key={topico.id} topico={topico}
                      isOpen={openTopicId === topico.id}
                      onToggle={() => setOpenTopicId(openTopicId === topico.id ? null : topico.id)}
                      onAprender={() => setModal({ tipo: "aprender", topico })} 
                      onRevisar={() => setModal({ tipo: "revisao", topico })} 
                      onReforcar={() => setModal({ tipo: "reforcar", topico })}
                      onVerResumo={() => setModal({ tipo: "resumo", topico })}
                      onFlashcards={() => setModal({ tipo: "flashcards", topico })}
                      onZerar={handleZerar}
                      onDeletar={handleDeletar}
                      onGerarMais={handleGerarMais} gerandoMaisId={gerandoMaisId} 
                    />
                  ))}
                </section>
              )
            ))}
          </>
        )}
      </main>

      {/* MODALS RENDER */}
      {modal?.tipo === "aprender" && (
        <ModalAprender 
          topico={modal.topico} onClose={() => setModal(null)} 
          onConcluir={(id) => { atualizarTopico(id, { status: modal.topico.status === "pendente" ? "em_progresso" : modal.topico.status }); setModal(null); }} 
          onExercicioResolvido={incrementarResolvidos} onSalvarNoCaderno={handleSalvarNoCaderno}
        />
      )}
      {modal?.tipo === "revisao" && (
        <ModalRevisao 
          topico={modal.topico} onClose={() => setModal(null)} 
          onConcluir={(id) => { atualizarTopico(id, { revisaoFeita: true }); setModal(null); }} 
          onExercicioResolvido={incrementarResolvidos} onSalvarNoCaderno={handleSalvarNoCaderno}
        />
      )}
      {modal?.tipo === "reforcar" && (
        <ModalReforcar 
          topico={modal.topico} onClose={() => setModal(null)} 
          onDominar={(id) => { atualizarTopico(id, { status: "dominado" }); setTimeout(() => setModal(null), 750); }} 
          onExercicioResolvido={incrementarResolvidos} onSalvarNoCaderno={handleSalvarNoCaderno}
        />
      )}
      {modal?.tipo === "resumo" && (
        <ModalResumo topico={modal.topico} onClose={() => setModal(null)} />
      )}
      {modal?.tipo === "flashcards" && (
        <ModalFlashcards topico={modal.topico} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
