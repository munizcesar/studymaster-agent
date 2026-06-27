with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

changes = 0

# ============================================================
# 1. CSS: Add YouTube transcript section styles
# ============================================================
youtube_css = '''
    /* ── YouTube Transcript Extractor ── */
    .free-youtube-section {
      margin-top: var(--space-4);
      padding: var(--space-4);
      border: 1px solid oklch(from var(--color-accent) l c h / 0.25);
      border-radius: var(--radius-lg);
      background: oklch(from var(--color-accent) l c h / 0.06);
    }
    .free-youtube-section strong {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--text-xs);
      color: var(--color-accent);
      margin-bottom: var(--space-3);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .free-youtube-input-group {
      display: flex;
      gap: var(--space-2);
    }
    .free-youtube-input {
      flex: 1;
      padding: var(--space-2) var(--space-3);
      border: 1.5px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-bg);
      color: var(--color-text);
      font-family: inherit;
      font-size: var(--text-xs);
      transition: border-color var(--transition);
      min-width: 0;
    }
    .free-youtube-input:focus {
      outline: none;
      border-color: var(--color-accent);
      box-shadow: 0 0 0 3px oklch(from var(--color-accent) l c h / 0.15);
    }
    .free-youtube-input::placeholder {
      color: var(--color-text-faint);
    }
    .free-youtube-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      padding: var(--space-2) var(--space-3);
      border: none;
      border-radius: var(--radius-md);
      background: var(--color-accent);
      color: white;
      font-family: inherit;
      font-size: var(--text-xs);
      font-weight: 700;
      cursor: pointer;
      transition: all var(--transition);
      white-space: nowrap;
      flex-shrink: 0;
    }
    .free-youtube-btn:hover {
      background: var(--color-accent-hover);
      transform: translateY(-1px);
    }
    .free-youtube-btn:active {
      transform: scale(0.97);
    }
    .free-youtube-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
    .free-youtube-btn.loading {
      pointer-events: none;
    }
    .free-youtube-status {
      margin-top: var(--space-2);
      font-size: var(--text-xs);
      line-height: 1.5;
      min-height: 1.2em;
    }
    .free-youtube-status.success {
      color: var(--color-success);
    }
    .free-youtube-status.error {
      color: var(--color-error);
    }
    .free-youtube-status.info {
      color: var(--color-text-muted);
    }'''

# Insert CSS after the free-help-panel li::before rule (which is the last rule in that section)
insert_css_marker = '      box-shadow: 0 2px 8px oklch(from var(--color-primary) l c h / 0.2);\n    }'
if insert_css_marker in content and youtube_css not in content:
    # Find a good insertion point - after the free-help-panel li::before block
    idx = content.index(insert_css_marker) + len(insert_css_marker)
    # Find the end of the block - look for next CSS comment or media query
    rest = content[idx:]
    # Look for the next rule starting with '    .free'
    next_rule = rest.find('\n    .free')
    if next_rule > 0:
        insert_pos = idx + next_rule
        content = content[:insert_pos] + youtube_css + '\n' + content[insert_pos:]
        changes += 1
        print('[OK] Added YouTube transcript CSS')
    else:
        # Try alternative: insert before next media query
        next_media = rest.find('\n    @media')
        if next_media > 0:
            insert_pos = idx + next_media
            content = content[:insert_pos] + youtube_css + '\n' + content[insert_pos:]
            changes += 1
            print('[OK] Added YouTube transcript CSS (alt)')
else:
    print('[FAIL] Could not insert YouTube CSS')

# ============================================================
# 2. HTML: Add YouTube input in the help panel area
# ============================================================
old_html = '''        <div class=\"free-help-panel\">\n          <strong><i data-lucide=\"sparkles\" width=\"16\" height=\"16\"></i> Para melhores quest\u00f5es</strong>\n          <ul>\n            <li>Use trechos com conceitos, exemplos, regras ou t\u00f3picos cobrados.</li>\n            <li>PDFs escaneados e imagens passam por OCR antes de virar texto.</li>\n            <li>Materiais maiores ajudam a gerar perguntas mais contextualizadas.</li>\n          </ul>\n        </div>\n\n      </aside>'''

new_html = '''        <div class=\"free-help-panel\">\n          <strong><i data-lucide=\"sparkles\" width=\"16\" height=\"16\"></i> Para melhores quest\u00f5es</strong>\n          <ul>\n            <li>Use trechos com conceitos, exemplos, regras ou t\u00f3picos cobrados.</li>\n            <li>PDFs escaneados e imagens passam por OCR antes de virar texto.</li>\n            <li>Materiais maiores ajudam a gerar perguntas mais contextualizadas.</li>\n          </ul>\n        </div>\n\n        <div class=\"free-youtube-section\">\n          <strong><i data-lucide=\"video\" width=\"14\" height=\"14\"></i> Transcri\u00e7\u00e3o do YouTube</strong>\n          <div class=\"free-youtube-input-group\">\n            <input type=\"url\" id=\"free-youtube-url\" class=\"free-youtube-input\" placeholder=\"Cole o link do v\u00eddeo...\" value=\"\">\n            <button id=\"free-youtube-btn\" class=\"free-youtube-btn\">\n              <i data-lucide=\"download\" width=\"13\" height=\"13\"></i> Buscar\n            </button>\n          </div>\n          <div id=\"free-youtube-status\" class=\"free-youtube-status\"></div>\n        </div>\n\n      </aside>'''

if old_html in content:
    content = content.replace(old_html, new_html)
    changes += 1
    print('[OK] Added YouTube transcript HTML')
else:
    print('[FAIL] Could not find help panel HTML - trying alt format')
    # Try with different Unicode encoding
    old_html_alt = '<div class="free-help-panel">\n          <strong><i data-lucide="sparkles" width="16" height="16"></i> Para melhores questões</strong>\n          <ul>\n            <li>Use trechos com conceitos, exemplos, regras ou tópicos cobrados.</li>\n            <li>PDFs escaneados e imagens passam por OCR antes de virar texto.</li>\n            <li>Materiais maiores ajudam a gerar perguntas mais contextualizadas.</li>\n          </ul>\n        </div>\n\n      </aside>'
    if old_html_alt in content:
        content = content.replace(old_html_alt, new_html_alt)
        changes += 1
        print('[OK] Added YouTube transcript HTML (alt)')

# ============================================================
# 3. JS: Add fetchYouTubeTranscript function 
# ============================================================
# Find a good place to add the JS function - after the updateCounter function
# Let's find the free material JS event handlers area

# The button has id="free-youtube-btn" - we need to add event listener
# Let's add the function at the end of the renderStep2Livre function or in the global scope
# Better to add it right after the file upload handler area

youtube_js = '''
    // ── YouTube Transcript Extractor ──
    document.getElementById('free-youtube-btn').addEventListener('click', async function() {
      var input = document.getElementById('free-youtube-url');
      var status = document.getElementById('free-youtube-status');
      var btn = this;
      var url = input.value.trim();
      
      if (!url) {
        status.className = 'free-youtube-status error';
        status.textContent = 'Cole o link do YouTube primeiro.';
        return;
      }
      
      // Extract video ID
      var videoId = null;
      var patterns = [
        /(?:youtube\\\\.com\\\\/watch\\\\?v=|youtu\\\\.be\\\\/)([a-zA-Z0-9_-]{11})/,
        /youtube\\\\.com\\\\/embed\\\\/([a-zA-Z0-9_-]{11})/,
        /youtube\\\\.com\\\\/shorts\\\\/([a-zA-Z0-9_-]{11})/
      ];
      for (var i = 0; i < patterns.length; i++) {
        var match = url.match(patterns[i]);
        if (match) { videoId = match[1]; break; }
      }
      
      if (!videoId) {
        status.className = 'free-youtube-status error';
        status.textContent = 'Link do YouTube inv\\u00e1lido. Use o formato: youtube.com/watch?v=...';
        return;
      }
      
      btn.disabled = true;
      btn.innerHTML = '<span class=\"upload-spinner\"></span> Carregando...';
      btn.classList.add('loading');
      status.className = 'free-youtube-status info';
      status.textContent = 'Buscando transcri\\u00e7\\u00e3o...';
      
      try {
        var response = await fetch('https://youtubetranscript.com/?v=' + videoId + '&format=json');
        
        if (!response.ok) {
          throw new Error('Falha ao buscar transcri\\u00e7\\u00e3o (HTTP ' + response.status + ')');
        }
        
        var data = await response.json();
        
        if (!data || !data.segments || data.segments.length === 0) {
          throw new Error('Este v\\u00eddeo n\\u00e3o possui transcri\\u00e7\\u00e3o dispon\\u00edvel.');
        }
        
        // Format transcript
        var transcript = '[Transcri\\u00e7\\u00e3o do YouTube - ' + (data.title || url) + ']\\n\\n';
        for (var j = 0; j < data.segments.length; j++) {
          var seg = data.segments[j];
          var startMin = Math.floor(seg.start / 60);
          var startSec = Math.floor(seg.start % 60);
          var timeStr = (startMin < 10 ? '0' : '') + startMin + ':' + (startSec < 10 ? '0' : '') + startSec;
          transcript += '[' + timeStr + '] ' + seg.text + '\\n';
        }
        
        // Insert into text editor
        var textarea = document.getElementById('free-txt');
        var currentText = textarea.value;
        if (currentText && currentText.trim()) {
          transcript = currentText + '\\n\\n---\\n\\n' + transcript;
        }
        textarea.value = transcript;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        
        status.className = 'free-youtube-status success';
        var wordCount = data.segments.length;
        status.textContent = wordCount + ' segmentos de transcri\\u00e7\\u00e3o importados com sucesso!';
        
      } catch (err) {
        status.className = 'free-youtube-status error';
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          status.textContent = 'N\\u00e3o foi poss\\u00edvel acessar o servidor de transcri\\u00e7\\u00e3o. Tente colar a transcri\\u00e7\\u00e3o manualmente.';
        } else {
          status.textContent = err.message;
        }
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide=\"download\" width=\"13\" height=\"13\"></i> Buscar';
        btn.classList.remove('loading');
        lucide.createIcons();
      }
    });
'''

# Find the right insertion point for the JS
# Let me look for the end of the updateCounter function or the file upload handler
js_marker = "free-upload-area.addEventListener('dragover'"
if js_marker in content:
    # Find the block after the free material JS section
    idx = content.index(js_marker)
    # Find the next function or script end
    # Look for the next event listener or the end of the renderStep block
    search_from = idx
    # Find the closing of this block area - look for sequence like function handleFreeFileUpload
    next_marker = content.find('async function handleFreeFileUpload', search_from)
    if next_marker > 0:
        # Insert before handleFreeFileUpload
        pre = content[:next_marker]
        post = content[next_marker:]
        content = pre + youtube_js + '\n' + post
        changes += 1
        print('[OK] Added YouTube transcript JS (before handleFreeFileUpload)')
    else:
        print('[FAIL] Could not find insertion point for JS')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print(f'\nTotal: {changes} changes applied')
