export interface PublishableNews {
	data: {
		draft: boolean;
		publishedAt: Date;
		featured: boolean;
		homePriority?: number;
	};
}

/**
 * Publishable news, sorted from most to least recent. Draft entries and entries whose
 * `publishedAt` is still in the future (relative to `now`) are excluded — this is the single
 * source of truth for what may ever be reachable at a real URL.
 */
export function selectPublishedNews<T extends PublishableNews>(
	entries: readonly T[],
	now = new Date(),
	limit?: number,
): T[] {
	const published = entries
		.filter(({ data }) => !data.draft && data.publishedAt.getTime() <= now.getTime())
		.sort((left, right) => right.data.publishedAt.getTime() - left.data.publishedAt.getTime());
	return typeof limit === 'number' ? published.slice(0, limit) : published;
}

/**
 * Reorders an already-published list so featured entries lead (by `homePriority`, lower first,
 * then most recent) and the rest follow by recency. Shared by `selectHomeNews` (which then trims
 * to a limit) and `selectNewsFeed` (which keeps the full list for the `/noticias` editorial grid).
 */
function orderFeaturedFirst<T extends PublishableNews>(published: readonly T[]): T[] {
	const featured = published
		.filter(({ data }) => data.featured)
		.sort((left, right) => {
			const priorityDelta =
				(left.data.homePriority ?? Number.POSITIVE_INFINITY) -
				(right.data.homePriority ?? Number.POSITIVE_INFINITY);
			return priorityDelta !== 0
				? priorityDelta
				: right.data.publishedAt.getTime() - left.data.publishedAt.getTime();
		});
	const standard = published.filter(({ data }) => !data.featured);
	return [...featured, ...standard];
}

/**
 * Selection shown on the home page: featured entries lead (ordered by `homePriority`, lower
 * first, then most recent), and unfeatured entries fill any remaining slots by recency. This
 * guarantees the home section is never empty while unfeatured entries never disappear from the
 * site — they remain published and visible on `/noticias`.
 */
export function selectHomeNews<T extends PublishableNews>(
	entries: readonly T[],
	now = new Date(),
	limit = 3,
): T[] {
	return orderFeaturedFirst(selectPublishedNews(entries, now)).slice(0, limit);
}

/**
 * Full editorial ordering behind the `/noticias` front page: featured entries lead, the rest
 * follow by recency — the same order as `selectHomeNews`, but never trimmed. `/noticias` derives
 * its lead/secondary/brief slots purely from position in this list (see the page for the split).
 */
export function selectNewsFeed<T extends PublishableNews>(
	entries: readonly T[],
	now = new Date(),
): T[] {
	return orderFeaturedFirst(selectPublishedNews(entries, now));
}

export const NEWS_CATEGORIES = ['equipos', 'calendario', 'cartas', 'partidos'] as const;

export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

export const NEWS_CATEGORY_LABELS: Record<NewsCategory, string> = {
	equipos: 'Equipos',
	calendario: 'Calendario',
	cartas: 'Cartas',
	partidos: 'Partidos',
};

export const NEWS_CATEGORY_CHIP_TONES: Record<NewsCategory, string> = {
	equipos: 'c-chip--tone-brand',
	calendario: 'c-chip--tone-info',
	cartas: 'c-chip--tone-warning',
	partidos: 'c-chip--tone-success',
};

/** Contextual link shown inside a news article's detail page toward the relevant functional page. */
export const NEWS_CATEGORY_DESTINATIONS: Record<NewsCategory, { href: string; label: string }> = {
	equipos: { href: '/equipos', label: 'Conocer los equipos' },
	calendario: { href: '/calendario', label: 'Consultar el calendario oficial' },
	cartas: { href: '/cartas', label: 'Descubrir las siete cartas' },
	partidos: { href: '/calendario', label: 'Ver el calendario y los resultados' },
};

export const NEWS_DATE_FORMATTER = new Intl.DateTimeFormat('es-ES', {
	day: 'numeric',
	month: 'short',
	year: 'numeric',
	timeZone: 'Europe/Madrid',
});
