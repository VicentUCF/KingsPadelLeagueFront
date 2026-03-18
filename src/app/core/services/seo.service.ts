import { DOCUMENT } from '@angular/common';
import { inject, Injectable, type Renderer2, RendererFactory2 } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

import { applicationMetadata } from '@core/config/application-metadata';

const BASE_URL = 'https://kingspadelleague.com';
const DEFAULT_OG_IMAGE = `${BASE_URL}/kpl-logo-wordmark.png`;

export interface SeoPageConfig {
  readonly title: string;
  readonly description: string;
  readonly path?: string | undefined;
  readonly ogImage?: string | undefined;
  readonly ogType?: 'website' | 'profile' | 'article' | undefined;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly renderer: Renderer2;

  constructor() {
    const rendererFactory = inject(RendererFactory2);
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  setPage(config: SeoPageConfig): void {
    const {
      title,
      description,
      path = '',
      ogImage = DEFAULT_OG_IMAGE,
      ogType = 'website',
    } = config;

    const canonicalUrl = `${BASE_URL}${path}`;

    this.titleService.setTitle(title);

    this.metaService.updateTag({ name: 'description', content: description });

    // Open Graph
    this.metaService.updateTag({ property: 'og:site_name', content: applicationMetadata.name });
    this.metaService.updateTag({ property: 'og:type', content: ogType });
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:url', content: canonicalUrl });
    this.metaService.updateTag({ property: 'og:image', content: ogImage });
    this.metaService.updateTag({ property: 'og:image:width', content: '1200' });
    this.metaService.updateTag({ property: 'og:image:height', content: '630' });
    this.metaService.updateTag({ property: 'og:locale', content: 'es_ES' });

    // Twitter / X
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: title });
    this.metaService.updateTag({ name: 'twitter:description', content: description });
    this.metaService.updateTag({ name: 'twitter:image', content: ogImage });

    // Canonical
    this.setCanonical(canonicalUrl);
  }

  setJsonLd(data: object): void {
    this.removeJsonLd();

    const script = this.renderer.createElement('script') as HTMLScriptElement;
    this.renderer.setAttribute(script, 'type', 'application/ld+json');
    this.renderer.setAttribute(script, 'id', 'json-ld');
    this.renderer.setProperty(script, 'textContent', JSON.stringify(data));
    this.renderer.appendChild(this.document.head, script);
  }

  removeJsonLd(): void {
    const existing = this.document.getElementById('json-ld');

    if (existing) {
      this.renderer.removeChild(this.document.head, existing);
    }
  }

  private setCanonical(url: string): void {
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

    if (link) {
      this.renderer.setAttribute(link, 'href', url);
    } else {
      link = this.renderer.createElement('link') as HTMLLinkElement;
      this.renderer.setAttribute(link, 'rel', 'canonical');
      this.renderer.setAttribute(link, 'href', url);
      this.renderer.appendChild(this.document.head, link);
    }
  }
}
