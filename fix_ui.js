const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

const configHTML = `
      <div class="lab-config-container" id="lab-config" style="display: none; margin-top: var(--space-4); background: var(--color-card); padding: var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--color-border);">
        <h4 style="margin-bottom: 8px; color: var(--color-text); font-size: 0.95rem;">Preferências de Geração (Opcional)</h4>
        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 16px; align-items: start;">
          <div>
            <label style="display: block; font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 4px;">Qtd. Flashcards</label>
            <select id="free-config-qty" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-bg); color: var(--color-text);">
              <option value="5">5 cards</option>
              <option value="10">10 cards</option>
              <option value="15" selected>15 cards (Padrão)</option>
              <option value="20">20 cards</option>
              <option value="30">30 cards</option>
            </select>
          </div>
          <div>
            <label style="display: block; font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 4px;">Instrução Adicional / Estilo (Ex: NotebookLM)</label>
            <input type="text" id="free-config-prompt" placeholder="Ex: Focar em datas; Nível difícil..." style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-bg); color: var(--color-text);">
          </div>
        </div>
      </div>
`;

// Insert before lab-actions-container
const search1 = `<div class="lab-actions-container" id="lab-actions"`;
if(c.includes(search1) && !c.includes('id="lab-config"')) {
  c = c.replace(search1, configHTML + '      ' + search1);
}

// Modify toggle logic
const search2 = `if (state.mode === 'livre') {
      const labActions = document.getElementById('lab-actions');
      const nBtn = document.getElementById('next-btn');
      if (labActions) {
        if (length > 0) {
          labActions.style.display = 'grid';
          if (nBtn) nBtn.style.display = 'none'; // hide default next btn to use the lab actions instead
        } else {
          labActions.style.display = 'none';
          if (nBtn) nBtn.style.display = 'block';
        }
      }
    }`;

const replace2 = `if (state.mode === 'livre') {
      const labActions = document.getElementById('lab-actions');
      const labConfig = document.getElementById('lab-config');
      const nBtn = document.getElementById('next-btn');
      if (labActions) {
        if (length > 0) {
          labActions.style.display = 'grid';
          if (labConfig) labConfig.style.display = 'block';
          if (nBtn) nBtn.style.display = 'none';
        } else {
          labActions.style.display = 'none';
          if (labConfig) labConfig.style.display = 'none';
          if (nBtn) nBtn.style.display = 'block';
        }
      }
    }`;

c = c.replace(search2, replace2);
fs.writeFileSync('index.html', c);
console.log("Done");
