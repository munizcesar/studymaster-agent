# 🧪 GUIA PRÁTICO — TESTE FASE 2.P0 NO NAVEGADOR

## 🚀 Como Testar Agora

### 1️⃣ Abrir DevTools para Mobile 375px

```
Passos:
1. Abrir https://studymaster-worker.cesarmuniz0816.workers.dev
2. Pressionar F12 ou Ctrl+Shift+I (Windows)
3. Clicar em \"Toggle device toolbar\" (ou Ctrl+Shift+M)
4. Selecionar \"iPhone SE\" (375 × 667)
5. Reload a página (F5)
```

**O que esperar:**
- ✅ Sem scroll horizontal
- ✅ Botões e inputs com tamanho legível
- ✅ Texto não sobreposto

---

### 2️⃣ Testar Skeleton Loader

```
Passos:
1. Em qualquer viewport, clicar em "Continuar" após configurar sessão
2. Vai para Step 4 (Gerando questões)
3. Ver spinner + "Gerando suas questões com IA…"
4. Abaixo do spinner: card cinzento com blocos brilhando
   ┌─────────────────────┐
   │ ▌▌▌▌▌▌ (header)   │
   │ ▌▌▌▌▌▌▌▌ (texto)   │
   │ ▌▌▌▌▌▌▌▌▌ (texto)   │
   │ ▌▌▌▌ (opção A)     │
   │ ▌▌▌▌ (opção B)     │
   │ ▌▌▌▌ (opção C)     │
   │ ▌▌▌▌ (opção D)     │
   └─────────────────────┘
5. Blocos pulsam suavemente (2-5 segundos)
6. Ao chegar respostas do servidor, questões aparecem suavemente
```

**Dica:** Abrir DevTools → Network → Throttle para 3G para ver skeleton por mais tempo

---

### 3️⃣ Testar Badge de Qualidade

```
Passos:
1. Questões carregadas normalmente
2. Selecionar uma alternativa (clicar em A/B/C/D)
3. Clicar no botão "Responder" ou [Resolver]
4. Após responder, BADGE aparece:

   🟢 Confiança Alta
   Fundamentada em múltiplos trechos do material    92%

   (ou 🟡 Média / 🔴 Baixa dependendo do score)

5. HOVER no badge → tooltip aparece (se houver espaço)
```

**Variações esperadas:**
- 🟢 Verde = Alta confiança (score > 80%)
- 🟡 Amarelo = Média confiança (50-80%)
- 🔴 Vermelho = Baixa confiança (<50%)

---

### 4️⃣ Testar Mobile Layout 375px

```
Passos:
1. DevTools aberto, device = iPhone SE (375px)
2. Navegar pelo wizard (passos 1-4)
3. Verificar cada elemento:

   ✓ Step 1 (Modo): Botões empilhados vertical (1 coluna)
   ✓ Step 2 (Conteúdo): Dropdown/cards responsivos
   ✓ Step 3 (Config): Chips e sliders com padding reduzido
   ✓ Step 4 (Questões): Cards com texto legível

4. Testar scroll: apenas vertical, NUNCA horizontal
5. Testar botões: 44×44px mínimo (fácil de tocar)
```

**Debug:** Se houver scroll horizontal, verificar:
```css
.container { 
  padding-left: var(--space-3); /* 12px */
  padding-right: var(--space-3); /* 12px */
}
```

---

## 🔍 Verificação de Elementos

### Skeleton CSS

```
Abrir DevTools → Elements → Procurar ".skeleton"

Esperado:
┌─ .skeleton
│  ├─ animation: skeletonPulse 1.5s ease-in-out infinite
│  ├─ background: linear-gradient(90deg, ...)
│  └─ border-radius: var(--radius-md)
│
└─ @keyframes skeletonPulse
   ├─ 0%, 100% { background-position: 200% 0; }
   └─ 50% { background-position: -200% 0; }
```

### Badge CSS

```
Abrir DevTools → Elements → Procurar ".quality-badge"

Esperado:
┌─ .quality-badge
│  ├─ display: flex
│  ├─ gap: var(--space-2)
│  ├─ margin-top: var(--space-4)
│  └─ padding: var(--space-3) var(--space-4)
│
├─ .quality-badge.confidence-alta
│  ├─ background: oklch(var(--color-success) l c h / 0.08)
│  └─ border-color: oklch(var(--color-success) l c h / 0.25)
│
├─ .quality-badge.confidence-media
│  ├─ background: oklch(var(--color-accent) l c h / 0.08)
│  └─ ...
│
└─ .quality-badge.confidence-baixa
   ├─ background: oklch(var(--color-error) l c h / 0.08)
   └─ ...
```

### Badge HTML

```
Abrir DevTools → Elements → Procurar ".badge-emoji"

Esperado:
┌─ <div class="quality-badge confidence-alta">
│  ├─ <span class="badge-emoji">🟢</span>
│  ├─ <div class="badge-info">
│  │  ├─ <strong>Confiança Alta</strong>
│  │  └─ <span class="badge-tooltip">Fundament...</span>
│  └─ <span class="badge-score">92%</span>
└─ </div>
```

---

## 📱 Testes por Dispositivo

### Desktop (1920px) ✅
```
✓ Skeleton: Visível ao lado esquerdo
✓ Badge: Abaixo de cada questão, 1 por linha
✓ Layout: 2+ colunas de questões se houver
```

### Tablet (768px) ✅
```
✓ Skeleton: Centralizado, 1 coluna
✓ Badge: Junto a cada questão
✓ Layout: 1 questão por vez com bottom nav (se ativar)
```

### Mobile (375px) ✅
```
✓ Skeleton: Centralizado, card único
✓ Badge: Abaixo de cada questão, responsivo
✓ Layout: 1 questão por vez, scroll vertical
✓ Sem overflow horizontal
```

---

## 🎯 Checklist Final

- [ ] Skeleton loader aparece ao gerar questões
- [ ] Animação pulse é suave (não jerky)
- [ ] Badge 🟢🟡🔴 aparece em TODAS questões
- [ ] Badge tem 3 cores diferentes (alta/média/baixa)
- [ ] Hover no badge mostra tooltip
- [ ] Score % está correto no badge
- [ ] Mobile 375px sem scroll horizontal
- [ ] Botões são 44×44px no mínimo
- [ ] Nenhum console.error() ao carregar
- [ ] Nenhum console.warn() ao responder

---

## ❌ Debugging se Algo Não Funcionar

### Skeleton não pisca
```
Solução: Verificar CSS @keyframes skeletonPulse
Abrir DevTools → Console:
  document.querySelector('.skeleton').getAnimations()
```

### Badge não aparece
```
Solução: Verificar response do worker
Abrir DevTools → Network → Clicar em request da questão
Ver se response tem: "_qualityBadge": { ... }
Se não, backend precisa de ajuste
```

### Overflow horizontal em 375px
```
Solução: Verificar padding do container
CSS esperado:
  @media (max-width: 375px) {
    .container { padding-left: var(--space-3); }
  }
```

### Botões muito pequenos
```
Solução: Garantir min-height: 44px
CSS:
  button { min-height: 44px; }
```

---

## 📊 Comparação Antes vs Depois

| Aspecto | Antes | Depois |
|---------|-------|--------|
| Loading state | Apenas spinner | Spinner + skeletons |
| Quality info | Nenhum | Badge com cor + tooltip |
| Mobile scroll | Horizontal (bug) | Apenas vertical ✅ |
| Touch targets | Variável | Mín 44×44px ✅ |
| Feedback visual | Mínimo | Claro e intuitivo |

---

## 🚀 Deploy Mudanças

Se tudo passar nos testes:

```bash
# No terminal do projeto
wrangler deploy

# Verificar deployed
curl https://studymaster-worker.cesarmuniz0816.workers.dev
```

---

**Tempo estimado de teste:** 5-10 minutos  
**Dificuldade:** Fácil ✅  
**Pré-requisitos:** Navegador moderno (Chrome/Firefox)

Aproveite! 🎉
