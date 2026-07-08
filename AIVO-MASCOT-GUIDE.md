# 🎭 Guia do Novo Mascote Aivo

## Visão Geral

O novo mascote **Aivo** foi desenvolvido seguindo a filosofia de **minimalismo sofisticado** com a máxima: **"Menos elementos. Mais personalidade."**

O Aivo é um personagem orgânico, minimalista e expressivo que transmite:
- **Inteligência**
- **Simpatia**
- **Elegância**
- **Calma**
- **Confiança**
- **Objetividade**
- **Curiosidade**

## Características Principais

### Design Minimalista
- **Corpo**: Formato orgânico (gota arredondada), sem braços, pernas ou acessórios
- **Olhos**: Dois olhos com pupilas independentes e micro-movimentos
- **Sobrancelhas**: Comunicam praticamente todas as emoções
- **Boca**: Apenas linhas curvas simples, sem dentes ou detalhes internos

### Animações Suaves
- Respiração quase imperceptível
- Piscadas naturais
- Micro-expressões aleatórias
- Rastreamento de cursor (opcional)
- Movimentos aleatórios dos olhos
- Transições suaves com Spring Physics

### Múltiplos Estados Emocionais (20 estados)
1. **idle** - Aguardando
2. **greeting** - Cumprimentando
3. **thinking** - Pensando
4. **typing** - Digitando
5. **focus** - Focado
6. **loading** - Carregando
7. **curious** - Curioso
8. **listening** - Ouvindo
9. **speaking** - Falando
10. **happy** - Feliz
11. **success** - Com sucesso
12. **celebrating** - Comemorando
13. **concerned** - Preocupado
14. **confused** - Confuso
15. **error** - Em erro
16. **surprised** - Surpreso
17. **sleepy** - Dormindo
18. **calm** - Calmo
19. **proud** - Orgulhoso
20. **password** - Protegendo senha

### Responsividade
Funciona perfeitamente em tamanhos de **24px até 300px** sem perder identidade:
- `xs`: 24px
- `sm`: 32px
- `md`: 48px
- `lg`: 96px
- `xl`: 120px
- `xxl`: 180px

### Acessibilidade
- ✅ Compatível com WCAG
- ✅ Respeita `prefers-reduced-motion`
- ✅ Possui `aria-label` dinâmico
- ✅ Navegável por teclado

## Como Usar

### 1. Incluir os Arquivos

No seu `index.html`, adicione:

```html
<!-- CSS do mascote -->
<link rel="stylesheet" href="src/aivo-mascot.css">

<!-- JavaScript do mascote -->
<script src="src/aivo-mascot-system.js"></script>
```

### 2. Criar um Container

```html
<div id="aivo-container"></div>
```

### 3. Inicializar o Mascote

```javascript
// Inicializar com opções padrão
const aivo = new Aivo('#aivo-container');

// Ou com opções customizadas
const aivo = new Aivo('#aivo-container', {
  size: 'lg',              // Tamanho: xs, sm, md, lg, xl, xxl
  state: 'greeting',       // Estado inicial
  theme: 'auto',           // Tema: auto, light, dark
  trackPointer: true       // Rastrear cursor do mouse
});
```

### 4. Mudar o Estado

```javascript
// Mudar para estado de pensamento
aivo.setState('thinking');

// Mudar para estado de celebração
aivo.setState('celebrating');

// Mudar para estado de erro
aivo.setState('error');
```

## Exemplos de Uso

### Exemplo 1: Mascote Simples na Página

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="src/aivo-mascot.css">
</head>
<body>
  <div id="aivo-container" style="width: 120px; height: 140px;"></div>
  
  <script src="src/aivo-mascot-system.js"></script>
  <script>
    const aivo = new Aivo('#aivo-container', {
      size: 'xl',
      state: 'greeting'
    });
  </script>
</body>
</html>
```

### Exemplo 2: Mascote com Interações

```javascript
// Criar mascote
const aivo = new Aivo('#aivo-container', {
  size: 'lg',
  state: 'idle',
  trackPointer: true
});

// Mudar estado ao clicar em um botão
document.getElementById('btn-celebrate').addEventListener('click', () => {
  aivo.setState('celebrating');
  setTimeout(() => {
    aivo.setState('happy');
  }, 2000);
});

// Mostrar mascote pensando durante carregamento
document.getElementById('btn-load').addEventListener('click', () => {
  aivo.setState('loading');
  
  // Simular carregamento
  setTimeout(() => {
    aivo.setState('success');
  }, 3000);
});

// Mostrar mascote preocupado em caso de erro
document.getElementById('btn-error').addEventListener('click', () => {
  aivo.setState('error');
});
```

### Exemplo 3: Diferentes Tamanhos

```javascript
// Tamanho pequeno para sidebar
const aivoSmall = new Aivo('#aivo-small', {
  size: 'sm',
  state: 'idle'
});

// Tamanho médio para dashboard
const aivoMedium = new Aivo('#aivo-medium', {
  size: 'md',
  state: 'idle'
});

// Tamanho grande para hero section
const aivoLarge = new Aivo('#aivo-large', {
  size: 'xl',
  state: 'greeting'
});
```

## Comportamentos Automáticos

O mascote possui comportamentos automáticos que tornam a experiência mais viva:

### Respiração
- Cada estado possui uma respiração específica
- Estados de carregamento têm respiração mais lenta
- Estados calmos têm respiração muito lenta

### Piscadas
- Piscadas naturais a cada 3-5 segundos
- Animação suave de 0.3s

### Micro-expressões
- Estados `idle` e `calm` mostram micro-expressões aleatórias
- Transições rápidas entre expressões (0.8s)

### Rastreamento de Cursor
- Quando `trackPointer: true`, os olhos seguem o cursor
- Movimento suave e natural
- Olhar aleatório a cada 4-7 segundos

## Integração com Projeto Existente

### Substituir o Sistema Antigo

1. **Manter compatibilidade**: O novo sistema é independente do antigo
2. **Adicionar gradualmente**: Usar ambos os sistemas em paralelo
3. **Migrar componentes**: Substituir componentes um por um

### Exemplo de Integração

```javascript
// Usar novo Aivo em novos componentes
const aivo = new Aivo('#new-component', {
  size: 'md',
  state: 'idle'
});

// Manter AivosAvatar antigo em componentes legados
AivosAvatar.render('#legacy-component', {
  size: 'md',
  state: 'idle'
});
```

## Performance

O novo mascote foi otimizado para:
- ✅ **60 FPS**: Animações suaves
- ✅ **SVG Puro**: Sem imagens rasterizadas
- ✅ **Baixo Consumo de CPU**: Animações eficientes
- ✅ **Baixo Consumo de Memória**: Estrutura leve

## Temas

### Light Mode
```javascript
const aivo = new Aivo('#aivo', {
  theme: 'light'
});
```

### Dark Mode
```javascript
const aivo = new Aivo('#aivo', {
  theme: 'dark'
});
```

### Auto (Respeita Preferência do Sistema)
```javascript
const aivo = new Aivo('#aivo', {
  theme: 'auto'  // Padrão
});
```

## Acessibilidade

### WCAG Compliance
- Rótulos descritivos para leitores de tela
- Suporte a navegação por teclado
- Respeito a `prefers-reduced-motion`

### Exemplo com Acessibilidade

```javascript
const aivo = new Aivo('#aivo', {
  size: 'md',
  state: 'idle'
  // aria-label é definido automaticamente baseado no estado
});

// O aria-label muda quando o estado muda
aivo.setState('thinking');  // aria-label: "Aivo pensando"
aivo.setState('happy');     // aria-label: "Aivo feliz"
```

## Destruição

Para remover o mascote:

```javascript
aivo.destroy();
```

## Troubleshooting

### Mascote não aparece
- Verifique se o container existe no DOM
- Verifique se o CSS está carregado
- Verifique o console para erros

### Animações não funcionam
- Verifique se `prefers-reduced-motion` está ativado
- Verifique se o navegador suporta SVG
- Verifique se o JavaScript está carregado

### Olhos não rastreiam o cursor
- Verifique se `trackPointer: true` está definido
- Verifique se o navegador permite acesso ao `mousemove`

## Roadmap Futuro

- [ ] Suporte a React Component
- [ ] Integração com Framer Motion
- [ ] Mais estados emocionais
- [ ] Animações customizáveis
- [ ] Biblioteca de sons
- [ ] Integração com APIs de IA

## Slogan da Marca

> **AIVOS — Inteligência que aproxima.**

O Aivo é a face dessa inteligência, sempre pronto para ajudar, compreender e inspirar.
