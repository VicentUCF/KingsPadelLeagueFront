import { requestWithMetadata, type QueryResult } from '@tinacms/astro';
import type { IslandRegistry } from '@tinacms/astro/experimental';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';

// El linter tipado (typescript-eslint, no `astro check`) no resuelve el tipo de un import
// `.astro` dentro de un módulo `.ts` plano, así que lo trata como `any`/error; se anota el tipo
// real explícitamente para satisfacer tanto a `astro check` como a `no-unsafe-assignment`.
import NewsArticleContentImport from '../../components/NewsArticleContent.astro';
const NewsArticleContent = NewsArticleContentImport as unknown as AstroComponentFactory;
// tina/__generated__/client.ts es un placeholder committeado hasta la primera build real de
// Tina (ver ese archivo): `tinacms dev`/`tinacms build` lo sobrescriben con el cliente real.
import { client } from '../../../tina/__generated__/client';

interface NewsQueryData {
	title: string;
	category: string;
	publishedAt: string;
	updatedAt?: string | null;
	cover?: { image: string; alt: string; credit?: string | null } | null;
	body: unknown;
	_content_source?: unknown;
}

/**
 * Único island registrado: el artículo de una noticia (título, imagen y cuerpo), la única región
 * que `NewsArticleContent.astro` marca como editable. Se resuelve con datos en vivo de Tina
 * (via `requestWithMetadata`), a diferencia de la página pública, que sigue leyendo directamente
 * de Astro Content Collections.
 */
export const islands: IslandRegistry = {
	article: {
		wrapper: { tag: 'article', className: 'news-article' },
		component: NewsArticleContent,
		fetch: async (_request, params) => {
			// Cualquier error aquí (incluido este) se convierte en un 500 genérico por
			// @tinacms/astro (island-route.ts envuelve `fetch` en try/catch).
			const relativePath = params.get('relativePath');
			if (!relativePath) throw new Error('Falta el parámetro relativePath.');
			return requestWithMetadata(client.queries.news({ relativePath }), { priority: 'primary' });
		},
		propsFromData: (result, params) => {
			const { data } = result as QueryResult<{ news: NewsQueryData }>;
			const relativePath = params.get('relativePath') ?? '';
			return {
				data: data.news,
				body: { kind: 'rich-text', content: data.news.body },
				slug: relativePath.replace(/\.md$/, ''),
			};
		},
	},
};
