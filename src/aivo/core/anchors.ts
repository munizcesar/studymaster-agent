/**
 * 🎭 AIVO CORE — Anchor Registry
 *
 * Auto-discovery of data-aivo-anchor elements.
 * Uses MutationObserver, ResizeObserver, IntersectionObserver.
 * No polling, no timeouts, no retries — pure event-driven.
 */

import type { AnchorData } from './types';

let instance: AnchorRegistry | null = null;

export class AnchorRegistry {
  private anchors = new Map<string, AnchorData>();
  private mo: MutationObserver | null = null;
  private ro: ResizeObserver | null = null;
  private io: IntersectionObserver | null = null;
  private onChange: ((name: string, data: AnchorData) => void) | null = null;

  static getInstance(): AnchorRegistry {
    if (!instance) instance = new AnchorRegistry();
    return instance;
  }

  start(callback: (name: string, data: AnchorData) => void): void {
    this.onChange = callback;
    this.scanAll();

    this.mo = new MutationObserver(() => this.scanAll());
    this.mo.observe(document.body, { childList: true, subtree: true });

    this.ro = new ResizeObserver(() => this.updateRects());
    this.ro.observe(document.body);

    this.io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const name = e.target.getAttribute('data-aivo-anchor');
        if (name && this.anchors.has(name)) {
          const d = this.anchors.get(name)!;
          d.isVisible = e.isIntersecting;
          d.rect = e.boundingClientRect;
          this.onChange?.(name, d);
        }
      }
    }, { threshold: [0, 0.5, 1] });
  }

  private scanAll(): void {
    document.querySelectorAll('[data-aivo-anchor]').forEach(el => {
      const name = el.getAttribute('data-aivo-anchor');
      if (!name || this.anchors.has(name)) return;
      const data: AnchorData = { element: el, name, rect: null, isVisible: true };
      this.anchors.set(name, data);
      this.ro?.observe(el);
      this.io?.observe(el);
      data.rect = el.getBoundingClientRect();
      this.onChange?.(name, data);
    });
  }

  private updateRects(): void {
    this.anchors.forEach((d) => {
      if (document.body.contains(d.element)) d.rect = d.element.getBoundingClientRect();
    });
  }

  get(name: string): AnchorData | null { return this.anchors.get(name) ?? null; }
  getElement(name: string): Element | null { return this.anchors.get(name)?.element ?? null; }
  getRect(name: string): DOMRectReadOnly | null {
    const d = this.anchors.get(name);
    if (!d || !document.body.contains(d.element)) return null;
    d.rect = d.element.getBoundingClientRect();
    return d.rect;
  }
  has(name: string): boolean { return this.anchors.has(name); }
  get names(): string[] { return Array.from(this.anchors.keys()); }
  get count(): number { return this.anchors.size; }
}
