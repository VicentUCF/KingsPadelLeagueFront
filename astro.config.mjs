// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const site =
	process.env.KPL_SITE_URL?.trim() || loadEnv(mode, process.cwd(), '').KPL_SITE_URL?.trim();

// https://astro.build/config
export default defineConfig({
	...(site ? { site } : {}),
});
