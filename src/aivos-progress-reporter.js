/**
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃     STUDYMASTER — AIVOS PROGRESS REPORTER (M6)                     ┃
 * ┃                                                                     ┃
 * ┃  Relatório semanal de evolução exportável como HTML.               ┃
 * ┃  Consolida dados do Dashboard + AivosMemory + AivosTracker.        ┃
 * ┃                                                                     ┃
 * ┃  Dependências: AivosTracker, AivosMemory                           ┃
 * ┃                                                                     ┃
 * ┃  USO: <script src="src/aivos-progress-reporter.js"></script>        ┃
 * ┃                                                                     ┃
 * ┃  Este arquivo é ADITIVO — não modifica nada existente.            ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */
(function() {
  'use strict';

  var AivosProgressReporter = {

    /** Gera relatório semanal em HTML */
    generateReport: function() {
      var tracker = window.AivosTracker;
      var memory = window.AivosMemory;
      if (!tracker) return '<div class="aivos-empty-state">Tracker nao disponivel.</div>';

      try {
        var data = tracker.getAllData();
        var stats = tracker.getStats ? tracker.getStats() : null;
        var summary = tracker.getSummary ? tracker.getSummary() : null;
        var weekly = tracker.getDailyStats ? tracker.getDailyStats(7) : [];
        var byDisc = tracker.getByDiscipline ? tracker.getByDiscipline() : {};

        var html = '<div class="aivos-report">';

        // Cabeçalho
        html += '<div class="aivos-report-header">';
        html += '<h2 class="aivos-report-title">Relatorio Semanal</h2>';
        html += '<span class="aivos-report-date">' + new Date().toLocaleDateString('pt-BR') + '</span>';
        html += '</div>';

        // Métricas principais
        var totalQ = data.totalQuestions || 0;
        var totalAcc = totalQ > 0 ? Math.round((data.totalCorrect / totalQ) * 100) : 0;
        html += '<div class="aivos-report-metrics">';
        html += '<div class="aivos-report-metric"><span class="aivos-report-mv">' + totalQ + '</span><span class="aivos-report-ml">Questoes</span></div>';
        html += '<div class="aivos-report-metric"><span class="aivos-report-mv">' + totalAcc + '%</span><span class="aivos-report-ml">Acuracia</span></div>';
        html += '<div class="aivos-report-metric"><span class="aivos-report-mv">' + (data.currentStreak || 0) + '</span><span class="aivos-report-ml">Streak</span></div>';
        html += '<div class="aivos-report-metric"><span class="aivos-report-mv">' + (data.bestStreak || 0) + '</span><span class="aivos-report-ml">Melhor Streak</span></div>';
        html += '</div>';

        // Evolução diária
        html += '<h3 class="aivos-report-section">Evolucao Diaria (7 dias)</h3>';
        html += '<div class="aivos-report-table"><table><thead><tr><th>Data</th><th>Questoes</th><th>Acertos</th><th>Acuracia</th></tr></thead><tbody>';
        for (var i = 0; i < weekly.length; i++) {
          var day = weekly[i];
          if (day.total > 0) {
            html += '<tr><td>' + (day.date || '---') + '</td><td>' + day.total + '</td><td>' + day.correct + '</td><td>' + day.accuracy + '%</td></tr>';
          }
        }
        html += '</tbody></table></div>';

        // Desempenho por disciplina
        var discKeys = Object.keys(byDisc);
        if (discKeys.length > 0) {
          html += '<h3 class="aivos-report-section">Desempenho por Disciplina</h3>';
          html += '<div class="aivos-report-table"><table><thead><tr><th>Disciplina</th><th>Questoes</th><th>Acuracia</th></tr></thead><tbody>';
          for (var j = 0; j < discKeys.length; j++) {
            var d = byDisc[discKeys[j]];
            html += '<tr><td>' + discKeys[j] + '</td><td>' + d.total + '</td><td>' + d.accuracy + '%</td></tr>';
          }
          html += '</tbody></table></div>';
        }

        // Histórico de sessões do Memory
        if (memory) {
          try {
            var sessions = memory.getHistory('session', { limit: 10 });
            if (sessions.length > 0) {
              html += '<h3 class="aivos-report-section">Ultimas Sessoes</h3>';
              html += '<div class="aivos-report-list">';
              for (var k = 0; k < sessions.length; k++) {
                var s = sessions[k];
                var d = s.data || {};
                html += '<div class="aivos-report-item">';
                html += '<strong>' + (d.mode || 'Estudo') + '</strong>';
                html += '<span>' + new Date(s.timestamp).toLocaleString('pt-BR') + '</span>';
                html += '</div>';
              }
              html += '</div>';
            }
          } catch(e) {}
        }

        html += '<div class="aivos-report-footer">';
        html += '<p>Gerado por AIVOS AI Tutor em ' + new Date().toLocaleString('pt-BR') + '</p>';
        html += '</div>';
        html += '</div>';

        return html;
      } catch(e) {
        return '<div class="aivos-empty-state">Erro ao gerar relatorio.</div>';
      }
    },

    /** Exporta relatório como HTML completo (para impressão/download) */
    exportHTML: function() {
      var content = this.generateReport();
      var title = 'Relatorio AIVOS - ' + new Date().toLocaleDateString('pt-BR');
      var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' + title + '</title>';
      html += '<style>body{font-family:sans-serif;max-width:800px;margin:40px auto;padding:0 20px;color:#1e293b}';
      html += 'table{width:100%;border-collapse:collapse;margin:16px 0}';
      html += 'th,td{padding:8px 12px;text-align:left;border-bottom:1px solid #e2e8f0}';
      html += 'th{background:#f1f5f9;font-weight:700}</style></head><body>';
      html += content;
      html += '</body></html>';
      return html;
    }
  };

  window.AivosProgressReporter = AivosProgressReporter;

})();
