/**
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃     STUDYMASTER — AIVOS ESSAY GRADER (M4)                          ┃
 * ┃                                                                     ┃
 * ┃  Corrige redações usando a API do worker, com nota por             ┃
 * ┃  competência (C1-C5), sugestões de melhoria e detecção de          ┃
 * ┃  desvio de tema.                                                   ┃
 * ┃                                                                     ┃
 * ┃  Complementa o Redação Coach existente (redbot.js).                ┃
 * ┃  Usa o mesmo endpoint do worker: mode=redbot + type=essay          ┃
 * ┃                                                                     ┃
 * ┃  Dependências: Worker API, redbot.js                               ┃
 * ┃                                                                     ┃
 * ┃  USO: <script src="src/aivos-essay-grader.js"></script>             ┃
 * ┃                                                                     ┃
 * ┃  Este arquivo é ADITIVO — não modifica nada existente.            ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */
(function() {
  'use strict';

  var WORKER_URL = 'https://studymaster-worker.cesarmuniz0816.workers.dev';
  var STORAGE_PREFIX = 'aivos_essay_';
  var STORAGE_HISTORY = STORAGE_PREFIX + 'history';
  var STORAGE_STATS = STORAGE_PREFIX + 'stats';

  var MAX_HISTORY = 20;

  function safeRead(key) {
    try { var r = localStorage.getItem(key); return r ? JSON.parse(r) : null; } catch(e) { return null; }
  }

  function safeWrite(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); return true; } catch(e) { return false; }
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 7);
  }

  var AivosEssayGrader = {

    /** Corrige uma redação via Worker API */
    gradeEssay: function(essayText, topic) {
      if (!essayText || essayText.trim().length < 50) {
        return Promise.reject(new Error('Redação muito curta (mínimo 50 caracteres).'));
      }

      return this._callWorker(essayText, topic)
        .then(function(result) {
          if (!result) throw new Error('Resposta vazia do worker.');

          var graded = {
            id: uid(),
            essayPreview: essayText.slice(0, 100) + '...',
            topic: topic || 'Tema livre',
            timestamp: Date.now(),
            data: result,
            scores: result.scores || null,
            summary: result.summary || '',
            strongPoints: result.strongPoints || [],
            problems: result.problems || [],
            socraticQuestion: result.socraticQuestion || '',
            nextSteps: result.nextSteps || []
          };

          // Salvar no histórico
          var history = safeRead(STORAGE_HISTORY) || [];
          history.push(graded);
          if (history.length > MAX_HISTORY) history = history.slice(-MAX_HISTORY);
          safeWrite(STORAGE_HISTORY, history);

          // Atualizar estatísticas
          this._updateStats(graded);

          // Salvar no AivosMemory
          if (window.AivosMemory) {
            try {
              AivosMemory.addHistory('essay', {
                id: graded.id,
                topic: graded.topic,
                totalScore: graded.scores ? this._calculateTotal(graded.scores) : null
              }, { label: 'Redação corrigida: ' + graded.topic });
            } catch(e) {}
          }

          return graded;
        }.bind(this))
        .catch(function(error) {
          console.warn('[AivosEssayGrader] Erro na correção:', error);
          // Fallback: correção local simplificada
          return this._localGrade(essayText, topic);
        }.bind(this));
    },

    /** Chama o worker para correção */
    _callWorker: function(essayText, topic) {
      return new Promise(function(resolve, reject) {
        var systemPrompt = this._buildSystemPrompt(topic);
        var maxRetries = 2;
        var attempt = 0;

        var doFetch = function() {
          attempt++;
          fetch(WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mode: 'redbot',
              type: 'essay',
              systemPrompt: systemPrompt,
              message: essayText,
              history: [],
              timestamp: Date.now()
            })
          })
          .then(function(response) {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
          })
          .then(function(data) {
            if (data.scores || data.summary) {
              resolve(data);
            } else if (data.reply) {
              // Tentar extrair scores do texto
              var extracted = AivosEssayGrader._extractScores(data.reply);
              if (extracted) {
                resolve({
                  scores: extracted.scores,
                  summary: extracted.summary || data.reply.slice(0, 200),
                  strongPoints: extracted.strongPoints || [],
                  problems: extracted.problems || [],
                  socraticQuestion: '',
                  nextSteps: extracted.nextSteps || []
                });
              } else {
                resolve({
                  scores: null,
                  summary: data.reply,
                  strongPoints: [],
                  problems: [],
                  socraticQuestion: '',
                  nextSteps: []
                });
              }
            } else {
              reject(new Error('Formato de resposta inválido.'));
            }
          })
          .catch(function(err) {
            if (attempt < maxRetries) {
              setTimeout(doFetch, 1000);
            } else {
              reject(err);
            }
          });
        }.bind(this);

        doFetch();
      }.bind(this));
    },

    /** Constrói system prompt para correção de redação */
    _buildSystemPrompt: function(topic) {
      var prompt = 'Você é um corretor de redação especializado no ENEM e concursos públicos. ';
      prompt += 'Analise a redação do aluno e retorne APENAS JSON válido com os campos:\n';
      prompt += '- scores: { c1: 0-200, c2: 0-200, c3: 0-200, c4: 0-200, c5: 0-200 }\n';
      prompt += '- summary: string com resumo do desempenho\n';
      prompt += '- strongPoints: array de strings com pontos fortes\n';
      prompt += '- problems: array de strings com problemas encontrados\n';
      prompt += '- socraticQuestion: string com pergunta reflexiva\n';
      prompt += '- nextSteps: array de strings com próximos passos\n\n';
      prompt += 'Regras:\n';
      prompt += '- C1 = Domínio da escrita formal\n';
      prompt += '- C2 = Compreensão do tema\n';
      prompt += '- C3 = Organização das ideias\n';
      prompt += '- C4 = Coesão textual\n';
      prompt += '- C5 = Proposta de intervenção\n';
      prompt += '- Scores DEVEM ser inteiros de 0 a 200.\n';
      if (topic) {
        prompt += '- Tema da redação: "' + topic + '"\n';
        prompt += '- Verifique se o texto aborda o tema proposto. Detecte desvio de tema.\n';
      }
      prompt += '- NÃO inclua campo "reply".\n';
      prompt += '- Responda APENAS o JSON, sem texto adicional.\n';
      return prompt;
    },

    /** Extrai scores de texto livre */
    _extractScores: function(text) {
      var scores = {};
      for (var i = 1; i <= 5; i++) {
        var regex = new RegExp('c' + i + '[^0-9]*(\\d{1,3})', 'i');
        var match = regex.exec(text);
        if (match) {
          scores['c' + i] = parseInt(match[1]);
        }
      }
      if (Object.keys(scores).length >= 3) {
        var summary = '';
        var strongPoints = [];
        var problems = [];
        var nextSteps = [];

        var sMatch = text.match(/resumo[^:]*:([^\\n]+)/i);
        if (sMatch) summary = sMatch[1].trim();

        var spMatches = text.matchAll(/ponto[^:]*:([^\\n]+)/gi);
        for (var m of spMatches) strongPoints.push(m[1].trim());

        var pMatches = text.matchAll(/problema[^:]*:([^\\n]+)/gi);
        for (var m2 of pMatches) problems.push(m2[1].trim());

        var nMatches = text.matchAll(/pr[oó]ximo[^:]*:([^\\n]+)/gi);
        for (var m3 of nMatches) nextSteps.push(m3[1].trim());

        return { scores: scores, summary: summary, strongPoints: strongPoints, problems: problems, nextSteps: nextSteps };
      }
      return null;
    },

    /** Calcula total dos scores */
    _calculateTotal: function(scores) {
      var total = 0;
      if (scores.c1) total += scores.c1;
      if (scores.c2) total += scores.c2;
      if (scores.c3) total += scores.c3;
      if (scores.c4) total += scores.c4;
      if (scores.c5) total += scores.c5;
      return total;
    },

    /** Atualiza estatísticas de redações */
    _updateStats: function(graded) {
      var stats = safeRead(STORAGE_STATS) || { total: 0, scores: [] };
      stats.total++;
      if (graded.scores) {
        stats.scores.push(this._calculateTotal(graded.scores));
        if (stats.scores.length > 50) stats.scores = stats.scores.slice(-50);
      }
      safeWrite(STORAGE_STATS, stats);
    },

    /** Retorna histórico de redações corrigidas */
    getHistory: function() {
      return safeRead(STORAGE_HISTORY) || [];
    },

    /** Retorna estatísticas */
    getStats: function() {
      var stats = safeRead(STORAGE_STATS) || { total: 0, scores: [] };
      var avg = stats.scores.length > 0
        ? Math.round(stats.scores.reduce(function(a, b) { return a + b; }, 0) / stats.scores.length)
        : 0;
      var best = stats.scores.length > 0 ? Math.max.apply(null, stats.scores) : 0;
      return {
        total: stats.total,
        average: avg,
        best: best,
        historyCount: (safeRead(STORAGE_HISTORY) || []).length
      };
    },

    /** Correção local simplificada (fallback offline) */
    _localGrade: function(essayText, topic) {
      var wordCount = essayText.split(/\s+/).length;
      var paragraphs = essayText.split(/\n\s*\n/).filter(function(p) { return p.trim(); }).length;
      var hasIntro = /introdução|introducao/i.test(essayText);
      var hasConc = /conclusão|conclusao/i.test(essayText);
      var hasProposal = /proposta|intervenção|intervencao/i.test(essayText);

      var scores = {
        c1: Math.min(200, Math.round(wordCount * 0.3 + (paragraphs >= 3 ? 30 : 0))),
        c2: topic ? (essayText.toLowerCase().includes(topic.toLowerCase().slice(0, 10)) ? 120 : 80) : 100,
        c3: Math.min(200, (hasIntro ? 50 : 20) + (hasConc ? 50 : 20) + 40),
        c4: Math.min(200, 80 + (paragraphs >= 3 ? 30 : 0)),
        c5: Math.min(200, hasProposal ? 120 : 60)
      };

      var problems = [];
      var strongPoints = [];

      if (wordCount < 200) problems.push('Texto muito curto: ' + wordCount + ' palavras (mínimo 200)');
      else strongPoints.push('Extensão adequada: ' + wordCount + ' palavras');

      if (paragraphs < 3) problems.push('Poucos parágrafos: ' + paragraphs + ' (mínimo 3)');
      else strongPoints.push('Estrutura com ' + paragraphs + ' parágrafos');

      if (!hasIntro) problems.push('Introdução não identificada. Inicie com apresentação da tese.');
      else strongPoints.push('Introdução identificada');

      if (!hasConc) problems.push('Conclusão não identificada. Finalize com proposta de intervenção.');
      else strongPoints.push('Conclusão identificada');

      if (!hasProposal) problems.push('Proposta de intervenção não identificada (C5)');

      return {
        id: uid(),
        essayPreview: essayText.slice(0, 100) + '...',
        topic: topic || 'Tema livre',
        timestamp: Date.now(),
        data: { scores: scores, summary: '', strongPoints: strongPoints, problems: problems },
        scores: scores,
        summary: 'Correção offline - análise básica realizada.',
        strongPoints: strongPoints,
        problems: problems,
        socraticQuestion: 'Sua proposta de intervenção detalha agente, ação, meio e finalidade?',
        nextSteps: [
          'Aumente o texto para pelo menos 200 palavras',
          'Estruture em 3+ parágrafos (introdução, desenvolvimento, conclusão)',
          'Varie os conectivos ao longo do texto',
          'Detalhe a proposta de intervenção (agente, ação, meio, finalidade)'
        ],
        _offline: true
      };
    },

    /** Renderiza resultado da correção como HTML */
    renderResult: function(graded) {
      if (!graded) return '<div class="aivos-empty-state">Nenhuma correção disponível.</div>';

      var html = '<div class="aivos-essay-result">';

      // Cabeçalho
      html += '<div class="aivos-essay-header">';
      html += '<h3 class="aivos-essay-title">Resultado da Correção</h3>';
      html += '<span class="aivos-essay-topic">' + this._escape(graded.topic || 'Tema livre') + '</span>';
      if (graded._offline) {
        html += '<span class="aivos-essay-offline-badge">Offline</span>';
      }
      html += '</div>';

      // Scores C1-C5
      if (graded.scores) {
        html += '<div class="aivos-essay-scores">';
        var comps = ['c1', 'c2', 'c3', 'c4', 'c5'];
        var compLabels = ['C1', 'C2', 'C3', 'C4', 'C5'];
        var total = 0;
        for (var i = 0; i < comps.length; i++) {
          var val = graded.scores[comps[i]] || 0;
          total += val;
          var pct = Math.round((val / 200) * 100);
          html += '<div class="aivos-essay-score">';
          html += '<div class="aivos-essay-score-header">';
          html += '<span class="aivos-essay-score-label">' + compLabels[i] + '</span>';
          html += '<span class="aivos-essay-score-value">' + val + '/200</span>';
          html += '</div>';
          html += '<div class="aivos-essay-score-bar"><div class="aivos-essay-score-fill" style="width:' + pct + '%"></div></div>';
          html += '</div>';
        }
        html += '<div class="aivos-essay-total">Total: <strong>' + total + '/1000</strong></div>';
        html += '</div>';
      }

      // Summary
      if (graded.summary) {
        html += '<div class="aivos-essay-section">';
        html += '<h4>Resumo</h4>';
        html += '<p>' + this._escape(graded.summary) + '</p>';
        html += '</div>';
      }

      // Strong points
      if (graded.strongPoints && graded.strongPoints.length > 0) {
        html += '<div class="aivos-essay-section aivos-essay-strong">';
        html += '<h4>Pontos Fortes</h4><ul>';
        for (var s = 0; s < graded.strongPoints.length; s++) {
          html += '<li>' + this._escape(graded.strongPoints[s]) + '</li>';
        }
        html += '</ul></div>';
      }

      // Problems
      if (graded.problems && graded.problems.length > 0) {
        html += '<div class="aivos-essay-section aivos-essay-problems">';
        html += '<h4>Problemas Encontrados</h4><ul>';
        for (var p = 0; p < graded.problems.length; p++) {
          html += '<li>' + this._escape(graded.problems[p]) + '</li>';
        }
        html += '</ul></div>';
      }

      // Question
      if (graded.socraticQuestion) {
        html += '<div class="aivos-essay-section aivos-essay-question">';
        html += '<h4>Reflita</h4>';
        html += '<p><em>' + this._escape(graded.socraticQuestion) + '</em></p>';
        html += '</div>';
      }

      // Next steps
      if (graded.nextSteps && graded.nextSteps.length > 0) {
        html += '<div class="aivos-essay-section aivos-essay-next">';
        html += '<h4>Próximos Passos</h4><ol>';
        for (var n = 0; n < graded.nextSteps.length; n++) {
          html += '<li>' + this._escape(graded.nextSteps[n]) + '</li>';
        }
        html += '</ol></div>';
      }

      html += '</div>';
      return html;
    },

    /** Renderiza histórico de correções */
    renderHistory: function() {
      var history = this.getHistory();
      if (history.length === 0) {
        return '<div class="aivos-empty-state">Nenhuma redação corrigida ainda.</div>';
      }

      var html = '<div class="aivos-essay-history">';
      html += '<h3 class="aivos-essay-history-title">Histórico de Redações</h3>';
      html += '<div class="aivos-essay-history-list">';

      for (var i = history.length - 1; i >= 0; i--) {
        var h = history[i];
        var total = h.scores ? this._calculateTotal(h.scores) : 'N/A';
        html += '<div class="aivos-essay-history-item">';
        html += '<div class="aivos-essay-history-top">';
        html += '<span class="aivos-essay-history-topic">' + this._escape(h.topic) + '</span>';
        html += '<span class="aivos-essay-history-score">' + total + '</span>';
        html += '</div>';
        html += '<div class="aivos-essay-history-meta">' + new Date(h.timestamp).toLocaleDateString('pt-BR') + '</div>';
        html += '</div>';
      }

      html += '</div></div>';
      return html;
    },

    _escape: function(s) {
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
  };

  window.AivosEssayGrader = AivosEssayGrader;

  console.log('[AivosEssayGrader] Módulo carregado.');

})();
