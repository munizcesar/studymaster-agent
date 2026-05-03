import shutil, sys

START = '// ── QUIZ MODE: questão por vez (Fullscreen) ─'
END   = "document.addEventListener('DOMContentLoaded', init);"

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

i_start = html.find(START)
i_end   = html.find(END)

if i_start == -1 or i_end == -1:
    print('ERRO: marcadores nao encontrados no index.html')
    sys.exit(1)

shutil.copy('index.html', 'index.html.bak')
print('Backup criado: index.html.bak')

NEW_BLOCK = r"""
// -- QUIZ MODE ----------------------------------------------------------
function renderQuizMode(questions) {
  var container   = document.getElementById('questions-container');
  var chips       = document.getElementById('summary-chips');
  var sessionResult = document.getElementById('session-result');
  var retryWrongBtn = document.getElementById('retry-wrong-btn');
  var scoreTotal  = document.getElementById('score-total');
  scoreTotal.textContent = questions.length;
  state.answerResults  = new Array(questions.length).fill(null);
  state.quizCurrentIdx = 0;
  state.answered = 0;
  state.correct  = 0;
  sessionResult.classList.add('hidden');
  retryWrongBtn.classList.add('hidden');
  updateScore();
  var diffLabel = { easy: 'Facil', medium: 'Medio', hard: 'Dificil', extreme: 'Extremo' };
  chips.innerHTML =
    '<div class="chip">Questao por vez</div>' +
    '<div class="chip">' + questions.length + ' Questoes</div>' +
    '<div class="chip">' + (diffLabel[state.difficulty] || state.difficulty) + '</div>' +
    '<div class="chip">' + (state.mode === 'academic' ? state.subject : (state.concurso && state.concurso.label) || 'Livre') + '</div>';
  retryWrongBtn.onclick = function() {
    var wrong = state.generatedQuestions.filter(function(_, i) { return state.answerResults[i] === false; });
    if (!wrong.length) return;
    state.generatedQuestions = wrong;
    renderQuizMode(wrong);
  };
  var isMobile = window.matchMedia('(max-width: 768px)').matches;
  if (isMobile) { renderFSQuiz(questions, container); }
  else          { renderInlineQuiz(questions, container); }
}

function renderInlineQuiz(questions, container) {
  var list = document.getElementById('questions-list');
  list.innerHTML = '';
  questions.forEach(function(q, idx) {
    var card = document.createElement('div');
    card.className = 'question-card';
    card.id = 'q-' + idx;
    var optsHtml = (q.options || []).map(function(opt) {
      return '<button class="option-btn" data-qidx="' + idx + '" data-key="' + opt.key + '">' +
        '<span class="option-key">' + opt.key + '</span><span>' + opt.text + '</span></button>';
    }).join('');
    card.innerHTML =
      '<div class="question-number">Questao ' + (idx+1) + ' de ' + questions.length + '</div>' +
      '<div class="question-statement">' + q.statement + '</div>' +
      '<div class="options-list">' + optsHtml + '</div>' +
      '<div class="explanation-box" id="exp-' + idx + '">' +
      '<strong>Gabarito: ' + q.correctAnswer + '</strong><br>' + q.explanation + '</div>';
    list.appendChild(card);
  });
  list.addEventListener('click', function(e) {
    var btn = e.target.closest('.option-btn');
    if (!btn) return;
    var card = btn.closest('.question-card');
    if (!card || card.dataset.answered) return;
    card.dataset.answered = '1';
    var idx = parseInt(btn.dataset.qidx, 10);
    var key = btn.dataset.key;
    var q   = questions[idx];
    var isCorrect = key === q.correctAnswer;
    state.answerResults[idx] = isCorrect;
    if (isCorrect) state.correct++;
    state.answered++;
    card.querySelectorAll('.option-btn').forEach(function(b) {
      b.disabled = true;
      if (b.dataset.key === q.correctAnswer) b.classList.add('correct');
      else if (b.dataset.key === key && !isCorrect) b.classList.add('wrong');
    });
    document.getElementById('exp-' + idx).classList.add('visible');
    updateScore();
    if (isCorrect) confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 }, colors: ['#01696f','#437a22','#d19900'] });
    if (state.answered === questions.length) showSessionResult();
  });
  container.classList.add('visible');
  lucide.createIcons();
  scrollToWizard(50);
}

function renderFSQuiz(questions, container) {
  var overlay  = document.getElementById('quiz-fs-overlay');
  var cardWrap = document.getElementById('quiz-fs-card-wrap');
  var counter  = document.getElementById('quiz-fs-counter');
  var fillEl   = document.getElementById('quiz-fs-progress-fill');
  var progressWrap = document.getElementById('quiz-fs-progress-bar-wrap');
  var scoreEl  = document.getElementById('quiz-fs-score');
  var nextBtn  = document.getElementById('quiz-fs-next-btn');
  var closeBtn = document.getElementById('quiz-fs-close-btn');
  document.getElementById('questions-list').innerHTML = '';

  function updateHeader(idx) {
    counter.textContent = (idx+1) + ' / ' + questions.length;
    var pct = Math.round((idx / questions.length) * 100);
    fillEl.style.width = pct + '%';
    progressWrap.setAttribute('aria-valuenow', pct);
    var c = state.answerResults.filter(function(r){ return r===true; }).length;
    var w = state.answerResults.filter(function(r){ return r===false; }).length;
    scoreEl.innerHTML = '&#10003; ' + c + ' &nbsp; &#10007; ' + w;
  }
  function renderDots(idx) {
    var row = document.createElement('div');
    row.className = 'quiz-fs-dots';
    questions.forEach(function(_, i) {
      var dot = document.createElement('div');
      dot.className = 'quiz-fs-dot' +
        (i===idx ? ' current' : state.answerResults[i]===true ? ' correct' : state.answerResults[i]===false ? ' wrong' : '');
      row.appendChild(dot);
    });
    return row;
  }
  function showQuestion(idx) {
    var q = questions[idx];
    nextBtn.disabled = true;
    nextBtn.innerHTML = (idx+1 >= questions.length ? 'Ver resultado &#10003;' : 'Proxima &#8594;');
    updateHeader(idx);
    var optsHtml = (q.options || []).map(function(opt) {
      return '<button class="option-btn" data-key="' + opt.key + '">' +
        '<span class="option-key">' + opt.key + '</span><span>' + opt.text + '</span></button>';
    }).join('');
    var card = document.createElement('div');
    card.className = 'question-card';
    card.innerHTML =
      '<div class="question-number">Questao ' + (idx+1) + ' de ' + questions.length + '</div>' +
      '<div class="question-statement">' + q.statement + '</div>' +
      '<div class="options-list">' + optsHtml + '</div>' +
      '<div class="explanation-box" id="fsexp-' + idx + '">' +
      '<strong>Gabarito: ' + q.correctAnswer + '</strong><br>' + q.explanation + '</div>';
    cardWrap.innerHTML = '';
    cardWrap.appendChild(renderDots(idx));
    cardWrap.appendChild(card);
    cardWrap.classList.remove('entering','exiting');
    void cardWrap.offsetWidth;
    cardWrap.classList.add('entering');
    if (cardWrap._handler) cardWrap.removeEventListener('click', cardWrap._handler);
    cardWrap._handler = function(e) {
      var btn = e.target.closest('.option-btn');
      if (!btn || card.dataset.answered) return;
      card.dataset.answered = '1';
      var key = btn.dataset.key;
      var isCorrect = key === q.correctAnswer;
      state.answerResults[idx] = isCorrect;
      if (isCorrect) state.correct++;
      state.answered++;
      card.querySelectorAll('.option-btn').forEach(function(b) {
        b.disabled = true;
        if (b.dataset.key === q.correctAnswer) b.classList.add('correct');
        else if (b.dataset.key === key && !isCorrect) b.classList.add('wrong');
      });
      document.getElementById('fsexp-'+idx).classList.add('visible');
      nextBtn.disabled = false;
      updateHeader(idx);
      updateScore();
      var oldDots = cardWrap.querySelector('.quiz-fs-dots');
      if (oldDots) oldDots.replaceWith(renderDots(idx));
      if (isCorrect) confetti({ particleCount:40, spread:60, origin:{y:0.7}, colors:['#01696f','#437a22','#d19900'] });
    };
    cardWrap.addEventListener('click', cardWrap._handler);
    lucide.createIcons();
    document.getElementById('quiz-fs-body').scrollTo({ top:0, behavior:'smooth' });
  }
  nextBtn.onclick = function() {
    if (state.quizCurrentIdx + 1 < questions.length) {
      state.quizCurrentIdx++;
      showQuestion(state.quizCurrentIdx);
    } else {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
      container.classList.add('visible');
      showSessionResult();
    }
  };
  closeBtn.onclick = function() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    container.classList.add('visible');
  };
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  container.classList.add('visible');
  showQuestion(0);
}
"""

html = html[:i_start] + NEW_BLOCK + '\n' + html[i_end:]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('index.html atualizado com sucesso!')
print('Agora execute:')
print('  git add index.html')
print('  git commit -m "fix: corrige clique quiz e mc"')
print('  git push origin main')
