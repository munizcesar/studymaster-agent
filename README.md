# 🎓 StudyMaster — Agente de Estudo Acadêmico

> Prompt Universal para qualquer IA no estilo QConcursos — questões, feedback instantâneo e relatório de desempenho.

![HTML](https://img.shields.io/badge/HTML-single--file-orange?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![Universal](https://img.shields.io/badge/IA-Universal-blue?style=flat-square)

---

## ✨ O que é

O **StudyMaster** é um arquivo HTML que contém:

1. **Uma página visual** explicando como usar o agente
2. **O prompt completo** que você copia e cola em qualquer IA

Ao usar o prompt, a IA se transforma em um tutor interativo que:
- Recebe seu material de estudo (PDF colado, texto, tema)
- Gera questões no estilo concurso público (A–E, V/F, dissertativa)
- Dá feedback imediato ✅/❌ com explicação completa
- Mantém placar em tempo real
- Gera relatório de desempenho ao final
- Oferece modo de revisão focado nos erros

---

## 🚀 Como usar

### Opção 1 — Direto pelo navegador
1. Baixe o arquivo `studymaster-agent.html`
2. Abra no navegador
3. Clique em **"Copiar Prompt"**
4. Cole em qualquer IA (ChatGPT, Claude, Gemini, Perplexity…)
5. Envie seu material de estudo e comece!

### Opção 2 — Deploy via Netlify Drop
1. Acesse [netlify.com/drop](https://app.netlify.com/drop)
2. Arraste o arquivo HTML
3. Compartilhe o link gerado

---

## 🤖 IAs compatíveis

| IA | Compatibilidade |
|---|---|
| ChatGPT (GPT-4o / 4.1) | ✅ Total |
| Claude (Sonnet / Opus) | ✅ Total |
| Gemini (1.5 / 2.0) | ✅ Total |
| Perplexity Pro | ✅ Total |
| Microsoft Copilot | ✅ Total |
| Mistral / Llama | ✅ Total |

---

## 📋 Fluxo do Agente

```
ETAPA 1 → Recepção do material de estudo
ETAPA 2 → Análise e confirmação + configuração da sessão
ETAPA 3 → Início da sessão com placar zerado
ETAPA 4 → Questões uma por vez (MC / V/F / Dissertativa)
ETAPA 5 → Feedback imediato + explicação + mnemônico
ETAPA 6 → Comandos especiais (DICA, PULAR, PLACAR, PARAR)
ETAPA 7 → Relatório final de desempenho
ETAPA 8 → Modo revisão inteligente (foco nos erros)
```

---

## ⚡ Recursos

- 🎯 Questões múltipla escolha (A–E) com 1 gabarito
- ✅ Feedback instantâneo com justificativa fundamentada
- 📊 Placar em tempo real + relatório final
- 🔁 Revisão inteligente priorizando erros
- 🎚️ 3 níveis de dificuldade (Fácil / Médio / Difícil)
- 🔥 Modo Desafio (dificuldade crescente)
- 💡 Dicas mnemônicas automáticas
- 📄 Aceita qualquer formato de conteúdo
- 🌙 Dark/Light mode no HTML

---

## 🗂️ Estrutura do projeto

```
studymaster-agent/
├── studymaster-agent.html   # App completo (single-file)
└── README.md
```

---

## 📝 Roadmap

- [ ] Versão em inglês do prompt
- [ ] Modo timer por questão
- [ ] Exportar histórico de sessão (JSON/PDF)
- [ ] Integração direta via API (ChatGPT, Claude)
- [ ] Banco de questões salvas por tema
- [ ] PWA para uso offline

---

## 📄 Licença

MIT — livre para usar, modificar e distribuir.
