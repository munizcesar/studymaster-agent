/**
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃     STUDYMASTER — AIVOS MIND MAPPER (M5)                           ┃
 * ┃                                                                     ┃
 * ┃  Gera mapa mental interativo da disciplina estudada.               ┃
 * ┃  Visual: SVG interativo com nós expansíveis.                       ┃
 * ┃  Dados: Extraído do histórico de questões do AivosTracker.         ┃
 * ┃                                                                     ┃
 * ┃  Dependências: AivosTracker                                        ┃
 * ┃                                                                     ┃
 * ┃  USO: <script src=\"src/aivos-mind-mapper.js\"></script>             ┃
 * ┃                                                                     ┃
 * ┃  Este arquivo é ADITIVO — não modifica nada existente.            ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */
(function() {
  'use strict';

  var STORAGE_PREFIX = 'aivos_mind_';
  var STORAGE_MAPS = STORAGE_PREFIX + 'maps';

  function safeRead(key) {
    try { var r = localStorage.getItem(key); return r ? JSON.parse(r) : null; } catch(e) { return null; }
  }

  function safeWrite(key, d) {
    try { localStorage.setItem(key, JSON.stringify(d)); return true; } catch(e) { return false; }
  }

  var AivosMindMapper = {

    /** Gera mapa mental a partir do histórico do tracker */
    generateMap: function(discipline) {
      var tracker = window.AivosTracker;
      if (!tracker) return null;

      try {
        var data = tracker.getAllData();
        var byTopic = {};

        // Agrupar por tópico dentro da disciplina
        for (var i = 0; i < data.questions.length; i++) {
          var q = data.questions[i];
          if (discipline && q.discipline !== discipline) continue;
          var topic = q.topic || 'Geral';
          if (!byTopic[topic]) {
            byTopic[topic] = { total: 0, correct: 0, wrong: 0, time: 0 };
          }
          byTopic[topic].total++;
          if (q.isCorrect) byTopic[topic].correct++;
          else byTopic[topic].wrong++;
          byTopic[topic].time += q.timeToAnswer || 0;
        }

        var topics = Object.keys(byTopic);
        if (topics.length === 0) return null;

        var nodes = [];
        for (var t = 0; t < topics.length; t++) {
          var s = byTopic[topics[t]];
          var acc = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
          nodes.push({
            name: topics[t],
            total: s.total,
            accuracy: acc,
            avgTime: s.total > 0 ? Math.round(s.time / s.total) : 0,
            status: acc >= 80 ? 'mastered' : acc >= 50 ? 'learning' : 'critical'
          });
        }

        nodes.sort(function(a, b) { return a.accuracy - b.accuracy; });

        var map = {
          id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
          discipline: discipline || 'Geral',
          createdAt: Date.now(),
          totalQuestions: data.questions.filter(function(q) { return !discipline || q.discipline === discipline; }).length,
          nodes: nodes,
          masteredCount: nodes.filter(function(n) { return n.status === 'mastered'; }).length,
          criticalCount: nodes.filter(function(n) { return n.status === 'critical'; }).length
        };

        // Salvar
        var maps = safeRead(STORAGE_MAPS) || [];
        maps.push(map);
        if (maps.length > 10) maps = maps.slice(-10);
        safeWrite(STORAGE_MAPS, maps);

        return map;
      } catch(e) { return null; }
    },

    /** Renderiza mapa mental como SVG */
    renderSVG: function(discipline) {
      var map = this.generateMap(discipline);
      if (!map || map.nodes.length === 0) {
        return '<div class=\"aivos-empty-state\">Responda questoes para gerar o mapa mental.</div>';
      }

      var svgW = 600;
      var svgH = Math.max(200, map.nodes.length * 60 + 60);
      var cx = 120;
      var startY = 60;
      var spacing = Math.min(60, (svgH - 80) / Math.max(map.nodes.length, 1));

      var svg = '<svg viewBox=\"0 0 ' + svgW + ' ' + svgH + '\" xmlns=\"http://www.w3.org/2000/svg\" style=\"width:100%;max-width:600px;height:auto\">';
      svg += '<defs>';
      svg += '<linearGradient id=\"mg-mastered\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\"><stop offset=\"0%\" stop-color=\"#22c55e\"/><stop offset=\"100%\" stop-color=\"#16a34a\"/></linearGradient>';
      svg += '<linearGradient id=\"mg-learning\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\"><stop offset=\"0%\" stop-color=\"#3b82f6\"/><stop offset=\"100%\" stop-color=\"#2563eb\"/></linearGradient>';
      svg += '<linearGradient id=\"mg-critical\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\"><stop offset=\"0%\" stop-color=\"#ef4444\"/><stop offset=\"100%\" stop-color=\"#dc2626\"/></linearGradient>';
      svg += '</defs>';

      // Título
      svg += '<text x=\"' + (svgW / 2) + '\" y=\"30\" text-anchor=\"middle\" font-size=\"16\" font-weight=\"bold\" fill=\"currentColor\">' + this.escapeXML(map.discipline) + ' — Mapa Mental</text>';

      // Nós
      for (var i = 0; i < map.nodes.length; i++) {
        var n = map.nodes[i];
        var y = startY + i * spacing;
        var barW = Math.max(30, (n.accuracy / 100) * 280);
        var grad = n.status === 'mastered' ? 'url(#mg-mastered)' : n.status === 'critical' ? 'url(#mg-critical)' : 'url(#mg-learning)';

        // Grupo do nó (com hover effects)
        svg += '<g class=\"mm-node-group\">';

        // Linha conectora
        svg += '<line class=\"mm-connector\" x1=\"100\" y1=\"' + y + '\" x2=\"140\" y2=\"' + y + '\" stroke=\"#475569\" stroke-width=\"1\" opacity=\"0.4\"/>';

        // Círculo do nó
        var circleColor = n.status === 'mastered' ? '#22c55e' : n.status === 'critical' ? '#ef4444' : '#3b82f6';
        svg += '<circle class=\"mm-node-circle\" cx=\"100\" cy=\"' + y + '\" r=\"6\" fill=\"' + circleColor + '\"/>';

        // Nome do tópico
        svg += '<text class=\"mm-node-label\" x=\"150\" y=\"' + (y + 4) + '\" font-size=\"13\" font-weight=\"600\" fill=\"currentColor\">' + this.escapeXML(n.name) + '</text>';

        // Barra de progresso (background)
        svg += '<rect class=\"mm-bar-bg\" x=\"320\" y=\"' + (y - 6) + '\" width=\"200\" height=\"10\" rx=\"5\" fill=\"#1e293b\"/>';
        // Barra de progresso (fill)
        svg += '<rect class=\"mm-bar-fill\" x=\"320\" y=\"' + (y - 6) + '\" width=\"' + barW + '\" height=\"10\" rx=\"5\" fill=\"' + grad + '\"/>';

        // Percentual
        svg += '<text class=\"mm-node-pct\" x=\"530\" y=\"' + (y + 4) + '\" font-size=\"12\" font-weight=\"700\" fill=\"currentColor\" text-anchor=\"end\">' + n.accuracy + '%</text>';

        // Tooltip (hover)
        var tooltipTxt = this.escapeXML(n.name) + ' - ' + n.accuracy + '% (' + n.total + 'q' + (n.avgTime > 0 ? ', ' + n.avgTime + 's' : '') + ')';
        svg += '<title>' + tooltipTxt + '</title>';

        svg += '</g>';
      }

      // Legenda
      var legendY = svgH - 10;
      svg += '<circle cx=\"' + (svgW / 2 - 100) + '\" cy=\"' + legendY + '\" r=\"4\" fill=\"#22c55e\"/><text x=\"' + (svgW / 2 - 90) + '\" y=\"' + (legendY + 4) + '\" font-size=\"10\" fill=\"#94a3b8\">Dominado</text>';
      svg += '<circle cx=\"' + (svgW / 2 - 20) + '\" cy=\"' + legendY + '\" r=\"4\" fill=\"#3b82f6\"/><text x=\"' + (svgW / 2 - 10) + '\" y=\"' + (legendY + 4) + '\" font-size=\"10\" fill=\"#94a3b8\">Aprendendo</text>';
      svg += '<circle cx=\"' + (svgW / 2 + 70) + '\" cy=\"' + legendY + '\" r=\"4\" fill=\"#ef4444\"/><text x=\"' + (svgW / 2 + 80) + '\" y=\"' + (legendY + 4) + '\" font-size=\"10\" fill=\"#94a3b8\">Critico</text>';

      svg += '</svg>';
      return svg;
    },

    escapeXML: function(s) {
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;');
    },

    getLatestMap: function(discipline) {
      var maps = safeRead(STORAGE_MAPS) || [];
      if (discipline) {
        for (var i = maps.length - 1; i >= 0; i--) {
          if (maps[i].discipline === discipline) return maps[i];
        }
      }
      return maps.length > 0 ? maps[maps.length - 1] : null;
    }
  };

  window.AivosMindMapper = AivosMindMapper;

})();
