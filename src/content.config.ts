import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const news = defineCollection({
	loader: glob({ base: './src/content/news', pattern: '**/*.md' }),
	schema: z.object({
		title: z.string().min(1).max(90),
		summary: z.string().min(1).max(200),
		category: z.enum(['equipos', 'calendario', 'cartas', 'partidos']),
		publishedAt: z.coerce.date(),
		updatedAt: z.coerce.date().optional(),
		draft: z.boolean().default(false),
		featured: z.boolean().default(false),
		homePriority: z.number().int().optional(),
		cover: z
			.object({
				image: z.string(),
				alt: z.string().min(1),
				credit: z.string().optional(),
			})
			.optional(),
		relatedTeamSlugs: z.array(z.string()).default([]),
		relatedMatchdayId: z.string().optional(),
	}),
});

export const collections = { news };
