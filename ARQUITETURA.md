# 📐 Arquitetura StudyMaster

## ✅ Estrutura Atual (CORRETA)

```
studymaster-agent/
├── index.html         ← ⭐ Único arquivo HTML (tudo aqui)
├── _redirects         ← Compatibilidade de links antigos
├── README.md          ← Documentação
└── .git/
```

---

## 🚫 O QUE É DESNECESSÁRIO (NÃO FAZER)

### ❌ NÃO criar múltiplos arquivos HTML
- ~~`index.html` + `studymaster-agent.html`~~ ← REDUNDANTE
- ~~`index.html` + `home.html`~~ ← REDUNDANTE
- Problema: Duplicação, conflitos, confusão sobre qual serve

✅ **SOLUÇÃO:** Um arquivo `index.html` com TUDO

---

### ❌ NÃO separar funcionalidades em arquivos HTML diferentes
- ~~`configurador.html` + `resultado.html`~~ ← PADRÃO ERRADO
- ~~`index.html` com conteúdo simples~~
- ~~`main.html` com funcionalidades~~ ← CONFUSÃO

✅ **SOLUÇÃO:** Tudo no `index.html`:
- Estrutura HTML única
- CSS completo (em `<style>`)
- JavaScript completo (em `<script>`)
- HTML estruturado com `<section>` e `<div>` para cada "página"

---

### ❌ NÃO esquecer de sincronizar arquivos
Se houver múltiplos arquivos → versões desincronizadas → bugs

✅ **SOLUÇÃO:** Um arquivo único = sem sincronização

---

## 🔑 PRINCÍPIOS DESTE PROJETO

| Princípio | Por Quê? |
|-----------|----------|
| **Single HTML File** | Cloudflare Pages serve `/` → `index.html`. Simples e previsível. |
| **Tema Light por Padrão** | `data-theme="light"` no HTML e toggle no botão |
| **Sem Bibliotecas Externas** | CSS + JS puros = funciona em qualquer IA sem dependências |
| **Tudo Auto-Contido** | HTML + CSS + JS = arquivo único portável |

---

## 📋 CHECKLIST: ANTES DE ADICIONAR ALGO NOVO

- [ ] **É um novo HTML file?** → ❌ PARE. Mantenha em `index.html`
- [ ] **É CSS adicional?** → ✅ OK. Adicione em `<style>` do `index.html`
- [ ] **É JS novo?** → ✅ OK. Adicione em `<script>` do `index.html`
- [ ] **Precisa de biblioteca externa?** → ⚠️ PERGUNTE. Tente fazer com JS puro
- [ ] **Vai duplicar código?** → ❌ REFATORE. Evite redundância desnecessária

---

## ⚡ COMO PROPOR MELHORIAS

**Se observar:**
1. Múltiplos arquivos HTML → ❌ Consolidar em `index.html`
2. Funcionalidades espalhadas → ❌ Centralizar em um arquivo
3. CSS/JS em arquivos separados → ❌ Mover para `<style>` e `<script>`
4. Dependências externas desnecessárias → ❌ Sugerir alternativa com JS puro

**Você deve:**
- 🗣️ Mencionar o problema ANTES de implementar
- 💡 Sugerir a solução correta
- ✋ PARAR a implementação errada
- 📌 Referir este documento

---

## 📝 Exemplo de Iniciativa Correta

**❌ ERRADO:**
```
git add novo-arquivo.html
git commit -m "add nova página"
```

**✅ CORRETO:**
```
"Observei que você quer adicionar nova funcionalidade.
Aviso: Criando novo arquivo HTML = duplicação.

Melhor: Adicionar como nova <section> em index.html com CSS e JS próprios.
Posso fazer isso? (Y/N)"
```

---

## 🎯 RESUMO FINAL

| Situação | Ação |
|----------|------|
| Novo feature (HTML) | Adicione em `index.html` |
| Novo style | Coloque em `<style>` do `index.html` |
| Novo script | Coloque em `<script>` do `index.html` |
| Confusão com arquivos | Vejo duplicação e PARO, sugiro consolidar |
| Biblioteca externa | Sugiro JS puro ou menciono impacto |

---

## 🚀 DEPLOYMENT — CLOUDFLARE PAGES

### Setup Inicial

1. **Push para GitHub** ✅
   ```bash
   git push origin main
   ```

2. **Conectar ao Cloudflare Pages**
   - Acesse [dash.cloudflare.com](https://dash.cloudflare.com)
   - Pages → Connect to Git
   - Selecione repo `studymaster-agent`

3. **Configuração no Cloudflare**
   - **Build command:** (deixe vazio)
   - **Publish directory:** `.` (raiz do projeto)
   - **Deploy!**

### Estrutura para Cloudflare

```
studymaster-agent/
├── index.html                 ← Servido como /
├── README.md
├── ARQUITETURA.md
├── .cloudflare-pages.json    ← Config Cloudflare
├── .gitignore
└── .git/
```

### URLs

- **Cloudflare:** `https://studymaster-agent.pages.dev`
- **Domínio customizado:** Configure em Cloudflare Pages → Custom domains

---

**Última atualização:** 3 de abril de 2026  
**Autor:** GitHub Copilot  
**Status:** ✨ ATIVO
