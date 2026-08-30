import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const announcements = defineCollection({
	loader: glob({ base: './src/content/announcements', pattern: '**/*.md' }),
	schema: z.object({
		title: z.string().min(1),
		summary: z.string().min(1),
		publishedAt: z.coerce.date(),
		category: z.enum(['calendario', 'equipos', 'cartas']),
		draft: z.boolean().default(false),
	}),
});

export const collections = { announcements };
