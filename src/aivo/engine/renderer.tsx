/**
 * 🎭 AIVO — Renderer
 *
 * Single React root. Single render() call.
 * Never unmounts. Never recreates the root.
 * Renders the <Aivo /> component into the #aivo-presence container.
 */

import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import AivoTourOverlay, { Aivo } from '../../aivo-mascot';
import type { AivoState, AivoThemeMode } from './types';
import { SIZE_PRESETS } from './constants';
import { EventBus } from './events';

let instance: Renderer | null = null;

interface RenderState {
  size: number;
  state: AivoState;
  themeMode: AivoThemeMode;
}

export class Renderer {
  private root: Root | null = null;
  private container: HTMLElement | null = null;
  private state: RenderState = {
    size: SIZE_PRESETS.lg,
    state: 'idle',
    themeMode: 'light',
  };
  private events: EventBus;
  private lastRenderTime: number | null = null;
  private themeObserver: MutationObserver | null = null;

  /* ── Singleton ── */

  static getInstance(): Renderer {
    if (!instance) instance = new Renderer(EventBus.getInstance());
    return instance;
  }

  static resetInstance(): void {
    if (instance) {
      instance.destroy();
      instance = null;
    }
  }

  private constructor(events: EventBus) {
    this.events = events;
  }

  /* ── Init ── */

  init(container: HTMLElement): boolean {
    if (this.root) return true;
    if (!container) return false;

    this.container = container;
    this.state.themeMode = this.detectTheme();

    this.root = createRoot(container);
    this.render();

    this.startThemeObserver();
    return true;
  }

  /* ── Render (SINGLE render call) ── */

  render(): void {
    if (!this.root) return;

    this.lastRenderTime = Date.now();
    this.root.render(
      <>
        <Aivo
          size={this.state.size}
          state={this.state.state}
          themeMode={this.state.themeMode}
        />
        <AivoTourOverlay />
      </>
    );
  }

  /* ── Update ── */

  updateState(state: AivoState): void {
    this.state.state = state;
    this.render();
  }

  updateSize(size: number): void {
    this.state.size = size;
    this.render();
  }

  update(size: number, state: AivoState): void {
    this.state.size = size;
    this.state.state = state;
    this.render();
  }

  updateTheme(): void {
    this.state.themeMode = this.detectTheme();
    this.render();
  }

  /* ── Theme ── */

  private detectTheme(): AivoThemeMode {
    const html = document.documentElement;
    return html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  private startThemeObserver(): void {
    if (this.themeObserver) return;

    this.themeObserver = new MutationObserver(() => {
      this.updateTheme();
    });

    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
  }

  /* ── Getters ── */

  getRoot(): Root | null {
    return this.root;
  }

  getContainer(): HTMLElement | null {
    return this.container;
  }

  getRenderState(): Readonly<RenderState> {
    return { ...this.state };
  }

  getLastRenderTime(): number | null {
    return this.lastRenderTime;
  }

  isReady(): boolean {
    return this.root !== null;
  }

  /* ── Destroy ── */

  destroy(): void {
    if (this.themeObserver) {
      this.themeObserver.disconnect();
      this.themeObserver = null;
    }
    if (this.root) {
      try {
        this.root.unmount();
      } catch {
        // Ignore unmount errors
      }
      this.root = null;
    }
    this.container = null;
    this.lastRenderTime = null;
    instance = null;
  }
}
