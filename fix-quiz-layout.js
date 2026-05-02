const fs = require('fs');
const path = './index.html';
let html = fs.readFileSync(path, 'utf8');

// ─── 1. SUBSTITUIR CSS ANTIGO DO QUIZ ───────────────────────────────────────
const OLD_CSS_START = '    /* Quiz Mode — Questão por vez */';
const OLD_CSS_END   = '      #questions-list { padding-bottom: 80px; }\n    }';

const idxStart = html.indexOf(OLD_CSS_START);
const idxEnd   = html.indexOf(OLD_CSS_END) + OLD_CSS_END.length;

if (idxStart === -1 || idxEnd === -1) {
  console.error('ERRO: Bloco CSS antigo não encontrado. Verifique o index.html.');
  process.exit(1);
}

const NEW_CSS = `    /* ── Quiz Mode (Questão por vez) — fullscreen QConcursos ── */
    body.quiz-fullscreen { overflow: hidden; }
    .quiz-screen {
      position: fixed; inset: 0; z-index: 200;
      display: flex; flex-direction: column;
      background: var(--color-bg);
    }
    .quiz-screen.hidden { display: none; }
    .quiz-topbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: var(--space-3) var(--space-6);
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-divider);
      flex-shrink: 0; gap: var(--space-4);
    }
    .quiz-topbar-left { display: flex; align-items: center; gap: var(--space-3); }
    .quiz-close-btn {
      display: inline-flex; align-items: center; gap: var(--space-2);
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--color-border); border-radius: var(--radius-md);
      color: var(--color-text-muted); font-size: var(--text-sm); font-weight: 600;
      transition: all var(--transition); font-family: inherit; background: none; cursor: pointer;
    }
    .quiz-close-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
    .quiz-counter { font-size: var(--text-sm); font-weight: 700; color: var(--color-text-muted); }
    .quiz-progress-bar-wrap {
      flex: 1; height: 6px; background: var(--color-divider);
      border-radius: var(--radius-full); overflow: hidden; max-width: 320px;
    }
    .quiz-progress-bar-fill {
      height: 100%; background: var(--grad-brand);
      border-radius: var(--radius-full); transition: width 0.4s ease; width: 0%;
    }
    .quiz-score-badge { font-size: var(--text-sm); font-weight: 700; color: var(--color-primary); white-space: nowrap; }
    .quiz-body {
      flex: 1; overflow-y: auto;
      padding: var(--space-8) var(--space-6);
      display: flex; flex-direction: column; align-items: center;
    }
    .quiz-body-inner { width: 100%; max-width: 720px; }
    .quiz-q-number {
      font-size: var(--text-xs); font-weight: 700; color: var(--color-primary);
      text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: var(--space-3);
    }
    .quiz-q-statement { font-size: var(--text-lg); font-weight: 500; line-height: 1.65; margin-bottom: var(--space-6); color: var(--color-text); }
    .quiz-options { display: flex; flex-direction: column; gap: var(--space-2); margin-bottom: var(--space-4); }
    .quiz-option-btn {
      display: flex; align-items: flex-start; gap: var(--space-3);
      padding: var(--space-4) var(--space-5);
      border: 1.5px solid var(--color-border); border-radius: var(--radius-lg);
      background: var(--color-surface); text-align: left; width: 100%;
      font-size: var(--text-base); font-family: inherit; cursor: pointer; transition: all var(--transition);
    }
    .quiz-option-btn:hover:not(:disabled) { border-color: var(--color-primary); background: oklch(from var(--color-primary) l c h / 0.04); }
    .quiz-option-btn.correct { border-color: var(--color-success); background: oklch(from var(--color-success) l c h / 0.09); }
    .quiz-option-btn.wrong   { border-color: var(--color-error);   background: oklch(from var(--color-error)   l c h / 0.08); opacity: 0.85; }
    .quiz-option-btn:disabled { cursor: default; }
    .quiz-option-key { font-weight: 800; min-width: 22px; color: var(--color-text-muted); }
    .quiz-option-btn.correct .quiz-option-key { color: var(--color-success); }
    .quiz-option-btn.wrong   .quiz-option-key { color: var(--color-error); }
    .quiz-explanation {
      display: none; margin-top: var(--space-4); padding: var(--space-4); border-radius: var(--radius-md);
      background: oklch(from var(--color-success) l c h / 0.07);
      border: 1px solid oklch(from var(--color-success) l c h / 0.2);
      font-size: var(--text-sm); line-height: 1.7; color: var(--color-text-muted);
    }
    .quiz-explanation.visible { display: block; }
    .quiz-explanation strong { color: var(--color-text); }
    .quiz-dot-row { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: var(--space-5); }
    .quiz-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--color-divider); transition: background 0.3s; flex-shrink: 0; }
    .quiz-dot.current { background: var(--color-primary); transform: scale(1.3); }
    .quiz-dot.correct { background: var(--color-success); }
    .quiz-dot.wrong   { background: var(--color-error); }
    .quiz-footer {
      flex-shrink: 0; padding: var(--space-4) var(--space-6);
      padding-bottom: calc(var(--space-4) + env(safe-area-inset-bottom));
      background: var(--color-surface); border-top: 1px solid var(--color-divider);
      display: flex; align-items: center; justify-content: space-between; gap: var(--space-4);
    }
    .btn-quiz-prev {
      display: inline-flex; align-items: center; gap: var(--space-2);
      padding: var(--space-3) var(--space-4);
      border: 1.5px solid var(--color-border); border-radius: var(--radius-md);
      font-size: var(--text-sm); font-weight: 600; color: var(--color-text-muted);
      transition: all var(--transition); font-family: inherit; background: none; cursor: pointer;
    }
    .btn-quiz-prev:hover:not(:disabled) { border-color: var(--color-primary); color: var(--color-primary); }
    .btn-quiz-prev:disabled { opacity: 0.35; cursor: not-allowed; }
    .btn-next-question {
      display: inline-flex; align-items: center; gap: var(--space-2);
      padding: var(--space-3) var(--space-8);
      background: var(--color-primary); color: white; font-weight: 700;
      border-radius: var(--radius-md); font-size: var(--text-base); font-family: inherit;
      transition: all var(--transition); border: none; cursor: pointer;
      box-shadow: 0 2px 8px oklch(from var(--color-primary) l c h / 0.25);
    }
    .btn-next-question:hover:not(:disabled) { background: var(--color-primary-hover); transform: translateY(-1px); }
    .btn-next-question:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
    @media (max-width: 640px) {
      .quiz-topbar { padding: var(--space-2) var(--space-4); }
      .quiz-body { padding: var(--space-5) var(--space-4); }
      .quiz-footer { padding: var(--space-3) var(--space-4); padding-bottom: calc(var(--space-3) + env(safe-area-inset-bottom)); }
      .quiz-q-statement { font-size: var(--text-base); }
      .quiz-option-btn { padding: var(--space-3) var(--space-4); font-size: var(--text-sm); }
      .quiz-progress-bar-wrap { display: none; }
    }`;

html = html.slice(0, idxStart) + NEW_CSS + html.slice(idxEnd);

// ─── 2. INSERIR HTML DO QUIZ-SCREEN ANTES DE </body> ────────────────────────
const QUIZ_HTML = `
  <!-- Quiz Fullscreen (Questão por vez) -->
  <div class="quiz-screen hidden" id="quiz-screen" role="dialog" aria-modal="true" aria-label="Questão por vez">
    <div class="quiz-topbar">
      <div class="quiz-topbar-left">
        <button class="quiz-close-btn" id="quiz-close-btn">
          <i data-lucide="x" width="16" height="16"></i>
          Sair
        </button>
        <span class="quiz-counter" id="quiz-counter">1 / 10</span>
      </div>
      <div class="quiz-progress-bar-wrap">
        <div class="quiz-progress-bar-fill" id="quiz-progress-bar-fill" style="width:0%"></div>
      </div>
      <span class="quiz-score-badge" id="quiz-score-badge">0 corretas</span>
    </div>
    <div class="quiz-body">
      <div class="quiz-body-inner">
        <div class="quiz-dot-row" id="quiz-dot-row"></div>
        <p class="quiz-q-number" id="quiz-q-number">Questão 1</p>
        <p class="quiz-q-statement" id="quiz-q-statement"></p>
        <div class="quiz-options" id="quiz-options"></div>
        <div class="quiz-explanation" id="quiz-explanation"></div>
      </div>
    </div>
    <div class="quiz-footer">
      <button class="btn-quiz-prev" id="quiz-prev-btn" disabled>
        <i data-lucide="arrow-left" width="16" height="16"></i>
        Anterior
      </button>
      <button class="btn-next-question" id="quiz-next-btn" disabled>
        Próxima
        <i data-lucide="arrow-right" width="16" height="16"></i>
      </button>
    </div>
  </div>`;

html = html.replace('</body>', QUIZ_HTML + '\n</body>');

// ─── 3. SUBSTITUIR FUNÇÃO renderQuizMode ────────────────────────────────────
const OLD_FN_START = '// ─── QUIZ MODE';
const OLD_FN_END_MARKER = '// ─── SESSION RESULT';

const fnStart = html.indexOf(OLD_FN_START);
const fnEnd   = html.indexOf(OLD_FN_END_MARKER);

if (fnStart === -1 || fnEnd === -1) {
  console.warn('AVISO: Bloco renderQuizMode não encontrado para substituição. Pulando etapa 3.');
} else {
  const NEW_QUIZ_JS = `// ─── QUIZ MODE — fullscreen QConcursos ────────────────────────────────────
let quizState = { questions: [], current: 0, answers: [], correct: 0 };

function openQuizScreen(questions) {
  quizState = { questions, current: 0, answers: new Array(questions.length).fill(null), correct: 0 };
  buildQuizDots();
  renderQuizQuestion(0);
  document.getElementById('quiz-screen').classList.remove('hidden');
  document.body.classList.add('quiz-fullscreen');
  lucide.createIcons();
}

function closeQuizScreen() {
  document.getElementById('quiz-screen').classList.add('hidden');
  document.body.classList.remove('quiz-fullscreen');
}

function buildQuizDots() {
  const row = document.getElementById('quiz-dot-row');
  row.innerHTML = quizState.questions.map((_, i) =>
    '<span class="quiz-dot' + (i === 0 ? ' current' : '') + '" id="qdot-' + i + '"></span>'
  ).join('');
}

function updateQuizDots() {
  quizState.questions.forEach((_, i) => {
    const dot = document.getElementById('qdot-' + i);
    if (!dot) return;
    dot.className = 'quiz-dot';
    if (i === quizState.current) { dot.classList.add('current'); return; }
    const ans = quizState.answers[i];
    if (ans === null) return;
    dot.classList.add(ans.correct ? 'correct' : 'wrong');
  });
}

function renderQuizQuestion(idx) {
  const q = quizState.questions[idx];
  const total = quizState.questions.length;
  const answered = quizState.answers[idx];

  document.getElementById('quiz-counter').textContent = (idx + 1) + ' / ' + total;
  document.getElementById('quiz-q-number').textContent = 'Questão ' + (idx + 1);
  document.getElementById('quiz-q-statement').textContent = q.statement;
  document.getElementById('quiz-progress-bar-fill').style.width = ((idx / total) * 100) + '%';
  document.getElementById('quiz-score-badge').textContent = quizState.correct + ' correta' + (quizState.correct !== 1 ? 's' : '');

  const optEl = document.getElementById('quiz-options');
  optEl.innerHTML = q.options.map(function(opt, i) {
    const key = String.fromCharCode(65 + i);
    let cls = 'quiz-option-btn';
    if (answered !== null) {
      if (i === q.correctIndex) cls += ' correct';
      else if (i === answered.chosen) cls += ' wrong';
    }
    return '<button class="' + cls + '" data-idx="' + i + '"' + (answered !== null ? ' disabled' : '') + '><span class="quiz-option-key">' + key + ')</span><span>' + opt + '</span></button>';
  }).join('');

  const expEl = document.getElementById('quiz-explanation');
  if (answered !== null && q.explanation) {
    expEl.innerHTML = '<strong>Comentário:</strong> ' + q.explanation;
    expEl.classList.add('visible');
  } else {
    expEl.className = 'quiz-explanation';
    expEl.innerHTML = '';
  }

  optEl.querySelectorAll('.quiz-option-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { handleQuizAnswer(parseInt(btn.dataset.idx)); });
  });

  document.getElementById('quiz-prev-btn').disabled = (idx === 0);
  updateNextQuizBtn();
  updateQuizDots();
  document.querySelector('.quiz-body').scrollTo({ top: 0, behavior: 'smooth' });
}

function handleQuizAnswer(chosen) {
  if (quizState.answers[quizState.current] !== null) return;
  const q = quizState.questions[quizState.current];
  const correct = chosen === q.correctIndex;
  quizState.answers[quizState.current] = { chosen: chosen, correct: correct };
  if (correct) quizState.correct++;
  renderQuizQuestion(quizState.current);
}

function updateNextQuizBtn() {
  const btn = document.getElementById('quiz-next-btn');
  const idx = quizState.current;
  const total = quizState.questions.length;
  const answered = quizState.answers[idx] !== null;
  if (idx === total - 1) {
    btn.innerHTML = 'Ver resultado <i data-lucide="flag" width="16" height="16"></i>';
  } else {
    btn.innerHTML = 'Próxima <i data-lucide="arrow-right" width="16" height="16"></i>';
  }
  btn.disabled = !answered;
  lucide.createIcons();
}

document.getElementById('quiz-next-btn').addEventListener('click', function() {
  const idx = quizState.current;
  const total = quizState.questions.length;
  if (idx < total - 1) {
    quizState.current++;
    renderQuizQuestion(quizState.current);
  } else {
    closeQuizScreen();
    showQuizFinalResult();
  }
});

document.getElementById('quiz-prev-btn').addEventListener('click', function() {
  if (quizState.current > 0) {
    quizState.current--;
    renderQuizQuestion(quizState.current);
  }
});

document.getElementById('quiz-close-btn').addEventListener('click', function() {
  if (confirm('Sair da sessão? Seu progresso será perdido.')) closeQuizScreen();
});

function showQuizFinalResult() {
  const total = quizState.questions.length;
  const correct = quizState.correct;
  const pct = Math.round((correct / total) * 100);
  document.getElementById('score-fill').style.width = pct + '%';
  document.getElementById('score-value').textContent = correct + '/' + total;
  document.getElementById('session-result').classList.remove('hidden');
  document.getElementById('session-stats').textContent = correct + ' de ' + total + ' corretas (' + pct + '%)';
  if (pct >= 70) launchConfetti();
}

`;
  html = html.slice(0, fnStart) + NEW_QUIZ_JS + html.slice(fnEnd);
}

// ─── 4. TROCAR CHAMADAS renderQuizMode -> openQuizScreen ────────────────────
html = html.replace(/renderQuizMode\s*\(\s*questions\s*\)/g, 'openQuizScreen(questions)');

fs.writeFileSync(path, html, 'utf8');
console.log('✅ Correção aplicada com sucesso em index.html!');
