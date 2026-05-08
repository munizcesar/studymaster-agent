# Guia de Uso - Layout Responsivo de Questões

## Como o Layout Funciona

### 🖥️ Em Desktop (telas ≥ 1024px)

1. **Abertura do Quiz**
   - Ao clicar em "Modo Foco" ou abrir o fullscreen, todas as questões aparecem na mesma página
   - Você pode scrollar para ver todas elas

2. **Respondendo as Questões**
   - Cada questão tem seu próprio botão "Responder"
   - Clique na alternativa para selecioná-la
   - Clique em "Responder" para mostrar a correção
   - A cor muda automaticamente (verde = correto, vermelho = errado)

3. **Gabarito Comentado**
   - Aparece logo abaixo de cada questão após resolver
   - Continue scrollando para próximas questões

4. **Finalizando**
   - Após responder todas, role até o final da página
   - Veja o resumo com stats (acertos/erros/aproveitamento)
   - Clique em "Novo Quiz" ou "Fechar"

### 📱 Em Mobile (telas < 1024px)

1. **Abertura do Quiz**
   - Abre em modo "foco" com uma questão por vez
   - Bottom bar fixa na parte inferior com "Anterior" e "Próximo"

2. **Respondendo as Questões**
   - Clique na alternativa desejada
   - Clique em "Responder" (ou espere aparecer automaticamente)
   - Veja o gabarito comentado

3. **Navegação**
   - Botão "Anterior": volta para questão anterior
   - Botão "Próximo": vai para próxima questão
   - Último botão diz "Finalizar" na última questão

4. **Finalizando**
   - Ao finalizar a última questão, aparece o resumo
   - Opções para "Novo Quiz" ou "Sair"

## Exemplos de Uso

### Cenário 1: Usuário Desktop (Laptop 1366x768)
```
1. Acessa StudyMaster
2. Seleciona: Acadêmico > Matemática > Álgebra
3. Clica em "Gerar Questões"
4. Abre "Modo Foco"
5. Vê 10 questões de álgebra na mesma página
6. Scrollla para baixo, respondendo cada uma
7. Ao fim, vê resultado com aproveitamento
8. Clica "Novo Quiz" para gerar outras
```

### Cenário 2: Usuário Mobile (iPhone 375x667)
```
1. Acessa StudyMaster pelo celular
2. Seleciona: Concursos > Direito
3. Clica em "Gerar Questões"
4. Abre "Modo Foco"
5. Vê Questão 1 de 10 (tela inteira)
6. Responde e vê gabarito
7. Clica "Próximo" na bottom bar
8. Vê Questão 2 de 10 (mesma interface)
9. Continua até finalizar
10. Vê resultado e opções de ação
```

## Diferenças Entre os Modos

| Aspecto | Desktop | Mobile |
|---------|---------|--------|
| **Questões visíveis** | Todas na página | Uma por vez |
| **Bottom bar** | Oculta | Fixa na parte inferior |
| **Scroll** | Vertical (natural) | Dentro de cada questão |
| **Navegação** | Clique direto em cada botão | Anterior/Próximo |
| **Responder** | Um botão por questão | Responder questão atual |
| **Resultado** | Ao final da página | Tela dedicada |

## Comportamento em Mudança de Tamanho

Se você **redimensionar a janela do navegador** durante o quiz:

- **De desktop para mobile**: O quiz continua, mas muda para modo de uma questão por vez
- **De mobile para desktop**: O quiz continua, mas muda para scroll de múltiplas questões
- **Estado preservado**: As respostas que você já deu continuam salvas

### Exemplo:
```
1. Abres o quiz em desktop → vê 10 questões
2. Responde as 3 primeiras
3. Redimensiona a janela para mobile
4. Agora vê Questão 1 de 10 (modo mobile)
5. As 3 respostas anteriores estão salvas
6. Continua respondendo de onde parou
```

## Recursos Visuais

### Desktop - Disposição
```
┌─────────────────────────────────────────┐
│ ← Questão 1 de 10 (com cards separadas) │
│                                         │
│  • Opção A                              │
│  • Opção B [Responder]                  │
│  • Opção C                              │
│                                         │
│  GABARITO: B                            │
│  Explicação da resposta...              │
│                                         │
├─────────────────────────────────────────┤ ← Scroll
│ ← Questão 2 de 10                       │
│                                         │
│  ... (mesma estrutura)                  │
│                                         │
├─────────────────────────────────────────┤
│ ← Resultado Final                       │
│  10 acertos • 0 erros • 100%            │
└─────────────────────────────────────────┘
```

### Mobile - Paginação
```
┌──────────────────────────┐
│  Questão 1 de 10         │
│                          │
│  • Opção A               │
│  • Opção B [selecionada] │
│  • Opção C               │
│  • Opção D               │
│                          │
│  [Responder]             │
│                          │
│  GABARITO: B             │
│  Explicação...           │
│                          │
├──────────────────────────┤
│ [< Anterior] [Próximo >] │ ← Bottom Bar
└──────────────────────────┘
```

## Dicas e Truques

### Desktop
- 💡 Use o scroll da página para navegar rapidamente entre questões
- 💡 Clique várias vezes em [Responder] é seguro (desativado após responder)
- 💡 Minimize a janela para ver o modo mobile em um desktop

### Mobile
- 💡 Botões "Anterior/Próximo" funcionam mesmo após responder
- 💡 Você não pode voltar depois de finalizar (precisa gerar novo quiz)
- 💡 Segure o dispositivo em modo paisagem para ver melhor em tablets

## Resolução de Problemas

### "Não vejo o botão Responder"
- **Desktop**: Certifique-se de ter selecionado uma alternativa primeiro
- **Mobile**: Mesma coisa - precisa selecionar antes

### "A bottom bar desapareceu no mobile"
- Isso é normal se você redimensionou a janela de desktop
- Atualize a página ou gere um novo quiz

### "Não consigo voltar para questões anteriores"
- **Desktop**: Faça scroll para cima
- **Mobile**: Use o botão "Anterior" na bottom bar

### "Meu progresso desapareceu"
- O progresso é mantido durante a sessão do quiz
- Se você sair do fullscreen, precisará começar um novo quiz
- Não há salvamento permanente entre sessões

## Navegadores Suportados

- ✅ Chrome/Edge 90+ (recomendado)
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

## Acessibilidade

- ♿ Todos os botões têm rótulos descritivos
- ♿ Navegação totalmente por teclado (Tab, Enter)
- ♿ Cores de contraste adequado (WCAG AA)
- ♿ Leitor de tela compatível

## Feedback e Sugestões

Se encontrar problemas ou tiver sugestões, reporte em:
https://github.com/anomalyco/opencode
