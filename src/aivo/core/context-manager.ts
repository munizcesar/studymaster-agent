/**
 * AivoContextManager
 * Extrai, normaliza e mantém o contexto atual da página para a IA.
 */

export interface AivoPageContext {
  title: string;
  url: string;
  description: string;
  mainContent: string;
  moduleName: string;
  selectedText: string;
  signature: string;
}

export class AivoContextManager {
  private static instance: AivoContextManager;
  private currentContext: AivoPageContext | null = null;
  private lastUrl: string = '';
  private observer: MutationObserver | null = null;
  private checkInterval: any = null;

  private constructor() {
    this.startListening();
  }

  public static getInstance(): AivoContextManager {
    if (!AivoContextManager.instance) {
      AivoContextManager.instance = new AivoContextManager();
    }
    return AivoContextManager.instance;
  }

  private startListening() {
    this.lastUrl = window.location.href;
    
    // Intercept pushState and replaceState to detect SPA navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      const res = originalPushState.apply(this, args);
      window.dispatchEvent(new Event('pushstate'));
      window.dispatchEvent(new Event('locationchange'));
      return res;
    };
    history.replaceState = function(...args) {
      const res = originalReplaceState.apply(this, args);
      window.dispatchEvent(new Event('replacestate'));
      window.dispatchEvent(new Event('locationchange'));
      return res;
    };

    window.addEventListener('popstate', () => {
      window.dispatchEvent(new Event('locationchange'));
    });

    window.addEventListener('locationchange', () => {
      this.checkContextUpdate();
    });

    // Check periodically for major DOM changes or if locationchange failed
    this.checkInterval = setInterval(() => this.checkContextUpdate(), 2000);
  }

  private checkContextUpdate() {
    const currentUrl = window.location.href;
    if (this.lastUrl !== currentUrl) {
      this.lastUrl = currentUrl;
      this.refreshContext();
    }
  }

  public getContext(): AivoPageContext {
    if (!this.currentContext) {
      this.refreshContext();
    }
    return this.currentContext!;
  }

  public refreshContext() {
    this.currentContext = this.extractContext();
  }

  private extractContext(): AivoPageContext {
    const title = document.title;
    const url = window.location.href;
    const description = (document.querySelector('meta[name="description"]') as HTMLMetaElement)?.content || '';
    const moduleName = this.extractModuleName();
    const selectedText = window.getSelection()?.toString() || '';
    
    const mainContent = this.extractMainContent();
    const normalizedContent = this.normalize(mainContent);

    const signature = this.generateSignature(url, normalizedContent);

    return {
      title,
      url,
      description,
      mainContent: normalizedContent,
      moduleName,
      selectedText,
      signature
    };
  }

  private extractModuleName(): string {
    const headerTitle = document.querySelector('header h1, header h2, .module-title');
    return headerTitle?.textContent?.trim() || 'Geral';
  }

  private extractMainContent(): string {
    // Priority: <main>, <article>, [role="main"], .aivos360-dashboard, .container, body
    let root: HTMLElement | null = document.querySelector('main');
    if (!root) root = document.querySelector('article');
    if (!root) root = document.querySelector('[role="main"]');
    if (!root) root = document.querySelector('.aivos360-dashboard');
    if (!root) root = document.querySelector('.container');
    if (!root) root = document.body;

    // Clone to manipulate safely
    const clone = root.cloneNode(true) as HTMLElement;
    
    // Remove nav, footer, scripts, styles, hidden elements
    const selectorsToRemove = ['nav', 'footer', 'script', 'style', 'noscript', 'iframe', 'svg', '[role="navigation"]', '.sidebar', '.menu'];
    selectorsToRemove.forEach(sel => {
      clone.querySelectorAll(sel).forEach(el => el.remove());
    });
    
    // Try to remove elements that are visually hidden (rough approximation on clone)
    clone.querySelectorAll('[style*="display: none"], [style*="visibility: hidden"], [hidden]').forEach(el => el.remove());

    return clone.innerText || clone.textContent || '';
  }

  private normalize(text: string): string {
    // Remove extra whitespace
    let clean = text.replace(/\s+/g, ' ').trim();
    
    // Limit size to prevent too many tokens (e.g., 6000 chars roughly ~ 1500 tokens)
    const MAX_CHARS = 8000; 
    if (clean.length > MAX_CHARS) {
      clean = clean.substring(0, MAX_CHARS) + '... (texto truncado)';
    }

    return clean;
  }

  private generateSignature(url: string, content: string): string {
    // Simple string hash
    let hash = 0;
    const str = url + content.substring(0, 100) + content.length;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; 
    }
    return hash.toString(36);
  }
}
