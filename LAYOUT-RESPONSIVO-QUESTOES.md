# Layout Responsivo para Questões - StudyMaster

## Objetivo
Adaptar o layout das questões para suportar diferentes viewports:
- **Desktop (≥1024px)**: Múltiplas questões visíveis simultaneamente em scroll vertical
- **Mobile (<1024px)**: Mantém o comportamento atual de questão única por vez com navegação passo-a-passo

## Estrutura Implementada

### 1. CSS Responsivo

#### Media Query para Mobile (< 1024px)
- `.q-nav-bar` aparece como barra fixa inferior
- `.question-card` renderizado em modo único (paginado via JavaScript)
- Espaço inferior para acomodar a navegação fixa (120px de padding-bottom)

#### Media Query para Desktop (≥ 1024px)
- `.q-nav-bar` oculto (`display: none !important`)
- `.question-card` renderizado em modo lista com grid
- Scroll natural da página (overflow-y: auto no container)
- Botão "Responder" de cada questão funciona independentemente
- Bottom bar oculta automaticamente

### 2. JavaScript - Funções Principais

#### `renderQuestions(questions)`
- **Novo comportamento**: Detecta viewport e escolhe modo de renderização
- `isDesktop = window.innerWidth >= 1024`
- Chama `renderAllQuestionsDesktop()` para desktop
- Chama `renderSingleQuestion()` para mobile

#### `renderAllQuestionsDesktop(questions)`
- Renderiza todas as questões em uma única página
- Cria elementos HTML para cada questão com IDs únicos
- Atribui event listeners para cada questão independentemente
- Mantém estado (`qNavState`) para controlar respostas

#### `handleDesktopAnswer(questions, idx, selectedKey)`
- Processa resposta de uma questão específica
- Atualiza cores (correto/errado) instantaneamente
- Mostra explicação (gabarito comentado)
- Dispara confetti se acertou
- Verifica se todas as questões foram respondidas

#### `renderSingleQuestion(questions, idx)` (Mobile)
- Mantém comportamento original
- Renderiza uma questão por vez
- Oferece navegação "Anterior/Próximo" via bottom bar

### 3. Detecção de Viewport

#### No `openFullscreen()`
```javascript
const isDesktop = window.innerWidth >= 1024;
if (isDesktop) {
  renderAllQFQuestions();  // Novo modo desktop
  document.getElementById('qf-bottom-bar').style.display = 'none';
} else {
  document.getElementById('qf-bottom-bar').style.display = 'flex';
  renderQFQuestion(0);  // Modo mobile original
}
```

#### No Event Listener `resize`
- Monitora mudanças na viewport
- Reinicializa o modo se o usuário redimensionar a janela
- Transição suave entre layouts

## Especificações Técnicas

### Breakpoint
- **Desktop**: `min-width: 1024px`
- **Mobile**: `max-width: 1023px`

### Layout Desktop
```
┌─────────────────────────────────┐
│         Header (sticky)         │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐   │
│  │   Questão 1             │   │
│  │   ├─ Opções             │   │
│  │   ├─ [Botão Responder]  │   │
│  │   └─ Explicação         │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │   Questão 2             │   │
│  │   ├─ Opções             │   │
│  │   ├─ [Botão Responder]  │   │
│  │   └─ Explicação         │   │
│  └─────────────────────────┘   │
│                                 │
│        ... (scroll)             │
│                                 │
│  ┌─────────────────────────┐   │
│  │   Resultado Final       │   │
│  │   ├─ Stats              │   │
│  │   └─ Botões de ação     │   │
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

### Layout Mobile
```
┌─────────────────────────────────┐
│         Header                  │
├─────────────────────────────────┤
│                                 │
│   Questão 1 de 10               │
│   ┌───────────────────────┐     │
│   │  Enunciado            │     │
│   │  [Opção A]            │     │
│   │  [Opção B]            │     │
│   │  [Opção C]            │     │
│   │  [Opção D]            │     │
│   │  [Botão Responder]    │     │
│   │  Explicação           │     │
│   └───────────────────────┘     │
│                                 │
├─────────────────────────────────┤
│ [Anterior] Q: 1/10 [Próximo]   │  ← Bottom Bar fixa
└─────────────────────────────────┘
```

## Funcionalidades Preservadas

✅ **Lógica de Correção**: Mantida idêntica
✅ **Gabarito Comentado**: Funciona em ambos os modos
✅ **Cores de Acerto/Erro**: Aplicadas corretamente
✅ **Contador de Pontuação**: Atualiza em tempo real
✅ **Confetti Animation**: Dispara em acertos
✅ **Integração Backend**: Nenhuma alteração necessária

## Mudanças no Arquivo

### Arquivo: `index.html`

#### CSS Adicionado (~50 linhas)
- Media queries para `@media (max-width: 1023px)` - Layout mobile
- Media queries para `@media (min-width: 1024px)` - Layout desktop
- Ajustes em `.qf-body`, `.qf-question-wrap`, `.qf-bottom-bar`
- Ajustes em `.q-nav-bar` para controle responsivo

#### JavaScript Adicionado (~120 linhas)
- `renderAllQuestionsDesktop()` - Renderiza todas as questões
- `handleDesktopAnswer()` - Processa respostas em modo desktop
- Modificações em `renderQuestions()` - Detecção de viewport
- Event listener `resize` - Monitora mudanças de tamanho da janela
- Funções para modo fullscreen: `renderAllQFQuestions()`, `createQFQuestionElement()`, etc.

#### Nenhuma Remoção
- Todas as funções originais mantidas
- Modo mobile preservado completamente

## Compatibilidade

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Testing Checklist

- [ ] Desktop: Gerar questões e verificar scroll vertical
- [ ] Desktop: Responder questões independentemente
- [ ] Desktop: Verificar que bottom bar não aparece
- [ ] Desktop: Scroll para resultado final após todas as respostas
- [ ] Mobile: Gerar questões e verificar paginação
- [ ] Mobile: Verificar bottom bar com "Anterior/Próximo"
- [ ] Mobile: Navegação passo-a-passo funciona
- [ ] Responsivo: Redimensionar janela mantém estado das respostas
- [ ] Responsivo: Transição suave entre layouts

## Notas de Implementação

1. **Detecção de Viewport**: Feita no momento da abertura do fullscreen (1024px)
2. **State Management**: O objeto `qNavState` continua armazenando o estado global
3. **Event Listeners**: Re-atribuídos para cada questão em modo desktop
4. **Styling**: Mantém consistência com o design system existente
5. **Acessibilidade**: Todos os elementos seguem padrões ARIA

## Próximos Passos Opcionais

1. Adicionar indicador visual de progresso em modo desktop (barra lateral)
2. Permitir "pular" questões em modo desktop (botão por questão)
3. Modo "review" para revisar erros antes de finalizar
4. Salvar progresso localmente (localStorage) entre sessões
