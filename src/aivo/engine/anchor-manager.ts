/**
 * 🎭 AIVO — Anchor Manager
 *
 * Auto Discovery of data-aivo-anchor elements.
 * Uses MutationObserver + ResizeObserver + IntersectionObserver.
 * Registers, updates, removes, and repositions anchors.
 * No polling — all event-driven.
 */

import { AivoLogger } from './logger';

let instance: AnchorManager | null = null;

interface AnchorData {
  element: Element;
  name: string;
  rect: DOMRectReadOnly | null;
  isVisible: boolean;
}

export class AnchorManager {
  private anchors = new Map<string, AnchorData>();
  private mutationObserver: MutationObserver | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private onAnchorChange: ((name: string, data: AnchorData) => void) | null = null;
  private logger = AivoLogger.getInstance();
  private destroyed = false;

  /* ── Singleton ── */

  static getInstance(): AnchorManager {
    if (!instance) instance = new AnchorManager();
    return instance;
  }

  static resetInstance(): void {
    if (instance) {
      instance.destroy();
      instance = null;
    }
  }

  /* ── Start Observers ── */

  start(): void {
    if (this.mutationObserver) return;

    // MutationObserver: detect new/removed data-aivo-anchor elements
    this.mutationObserver = new MutationObserver((mutations) => {
      if (this.destroyed) return;
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.scanElement(node as Element);
            }
          });
          mutation.removedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.checkRemoved(node as Element);
            }
          });
        }
      }
    });

    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // ResizeObserver: update anchor positions on resize
    this.resizeObserver = new ResizeObserver(() => {
      if (this.destroyed) return;
      this.updateAllRects();
    });

    // IntersectionObserver: detect visibility changes
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (this.destroyed) return;
        for (const entry of entries) {
          const name = (entry.target as HTMLElement).getAttribute('data-aivo-anchor');
          if (name && this.anchors.has(name)) {
            const data = this.anchors.get(name)!;
            data.isVisible = entry.isIntersecting;
            data.rect = entry.boundingClientRect;
            this.notifyChange(name);
          }
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    // Initial scan
    this.scanAll();

    this.logger.info('Anchor', 'Observers started');
  }

  /* ── Scanning ── */

  private scanAll(): void {
    const elements = document.querySelectorAll('[data-aivo-anchor]');
    elements.forEach((el) => this.registerAnchor(el));
  }

  private scanElement(element: Element): void {
    // Check the element itself
    if (element.hasAttribute?.('data-aivo-anchor')) {
      this.registerAnchor(element);
    }
    // Check children
    const anchors = element.querySelectorAll?.('[data-aivo-anchor]') || [];
    anchors.forEach((el) => this.registerAnchor(el));
  }

  private checkRemoved(element: Element): void {
    // Check if any registered anchor was removed
    this.anchors.forEach((data, name) => {
      if (!document.body.contains(data.element)) {
        this.anchors.delete(name);
        this.logger.debug('Anchor', `Removed: ${name}`);
        this.notifyChange(name);
      }
    });
  }

  /* ── Registration ── */

  registerAnchor(element: Element): void {
    const name = element.getAttribute('data-aivo-anchor');
    if (!name || this.anchors.has(name)) return;

    const data: AnchorData = {
      element,
      name,
      rect: null,
      isVisible: true,
    };

    this.anchors.set(name, data);

    // Observe resize
    this.resizeObserver?.observe(element);

    // Observe intersection
    this.intersectionObserver?.observe(element);

    this.logger.debug('Anchor', `Registered: ${name}`);

    // Immediately update rect
    data.rect = element.getBoundingClientRect();
    this.notifyChange(name);
  }

  unregisterAnchor(name: string): void {
    const data = this.anchors.get(name);
    if (!data) return;

    this.resizeObserver?.unobserve(data.element);
    this.intersectionObserver?.unobserve(data.element);
    this.anchors.delete(name);

    this.logger.debug('Anchor', `Unregistered: ${name}`);
    this.notifyChange(name);
  }

  /* ── Rect Updates ── */

  private updateAllRects(): void {
    this.anchors.forEach((data) => {
      if (document.body.contains(data.element)) {
        data.rect = data.element.getBoundingClientRect();
      }
    });
  }

  getAnchorRect(name: string): DOMRectReadOnly | null {
    const data = this.anchors.get(name);
    if (!data || !document.body.contains(data.element)) return null;
    data.rect = data.element.getBoundingClientRect();
    return data.rect;
  }

  /* ── Callbacks ── */

  set onAnchorChange(fn: ((name: string, data: AnchorData) => void) | null) {
    this.onAnchorChange = fn;
  }

  private notifyChange(name: string): void {
    const data = this.anchors.get(name);
    if (data && this.onAnchorChange) {
      this.onAnchorChange(name, data);
    }
  }

  /* ── Getters ── */

  getAnchor(name: string): AnchorData | null {
    return this.anchors.get(name) ?? null;
  }

  getAnchorElement(name: string): Element | null {
    return this.anchors.get(name)?.element ?? null;
  }

  getAllAnchors(): AnchorData[] {
    return Array.from(this.anchors.values());
  }

  getAnchorNames(): string[] {
    return Array.from(this.anchors.keys());
  }

  hasAnchor(name: string): boolean {
    return this.anchors.has(name);
  }

  get count(): number {
    return this.anchors.size;
  }

  /* ── Destroy ── */

  destroy(): void {
    this.destroyed = true;

    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }

    this.anchors.clear();
    this.onAnchorChange = null;
    instance = null;
  }
}
