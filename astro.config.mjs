// @ts-check
import vercel from '@astrojs/vercel';
import tina from '@tinacms/astro/integration';
import { tinaAdminDevRedirect } from '@tinacms/astro/vite';
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const site =
	process.env.KPL_SITE_URL?.trim() || loadEnv(mode, process.cwd(), '').KPL_SITE_URL?.trim();

// https://astro.build/config
export default defineConfig({
	...(site ? { site } : {}),
	prefetch: {
		defaultStrategy: 'tap',
	},
	// El sitio sigue siendo estático: solo /tina-island/[name] y /noticias/preview/[slug] (ambos
	// con `export const prerender = false`) se sirven bajo demanda, como server islands puntuales
	// dentro del mismo proyecto estático de Vercel. El resto se prerenderiza igual que antes.
	adapter: vercel(),
	integrations: [tina()],
	vite: {
		plugins: [tinaAdminDevRedirect()],
	},
});
