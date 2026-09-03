import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { selectHomeNews, selectNewsFeed, selectPublishedNews } from '../src/lib/news.ts';

describe('selectPublishedNews', () => {
	it('excluye borradores y publicaciones futuras, y ordena por fecha descendente', () => {
		const entries = [
			entry('antiguo', '2026-08-20T10:00:00Z'),
			entry('reciente', '2026-08-27T08:00:00Z'),
			entry('intermedio', '2026-08-25T08:00:00Z'),
			entry('borrador', '2026-08-26T08:00:00Z', { draft: true }),
			entry('futuro', '2026-09-01T08:00:00Z'),
		];

		const result = selectPublishedNews(entries, new Date('2026-08-27T12:00:00Z'));

		assert.deepEqual(
			result.map(({ id }) => id),
			['reciente', 'intermedio', 'antiguo'],
		);
	});

	it('respeta un límite opcional tras ordenar', () => {
		const entries = [
			entry('antiguo', '2026-08-20T10:00:00Z'),
			entry('reciente', '2026-08-27T08:00:00Z'),
			entry('intermedio', '2026-08-25T08:00:00Z'),
		];

		const result = selectPublishedNews(entries, new Date('2026-08-27T12:00:00Z'), 2);

		assert.deepEqual(
			result.map(({ id }) => id),
			['reciente', 'intermedio'],
		);
	});

	it('sin límite devuelve todas las entradas publicadas', () => {
		const entries = [entry('a', '2026-08-20T10:00:00Z'), entry('b', '2026-08-21T10:00:00Z')];

		const result = selectPublishedNews(entries, new Date('2026-08-27T12:00:00Z'));

		assert.equal(result.length, 2);
	});
});

describe('selectHomeNews', () => {
	it('ordena las destacadas por homePriority ascendente y luego por fecha descendente', () => {
		const entries = [
			entry('normal-reciente', '2026-08-26T08:00:00Z'),
			entry('destacada-sin-prioridad', '2026-08-20T08:00:00Z', { featured: true }),
			entry('destacada-prioridad-2', '2026-08-10T08:00:00Z', { featured: true, homePriority: 2 }),
			entry('destacada-prioridad-1', '2026-08-05T08:00:00Z', { featured: true, homePriority: 1 }),
		];

		const result = selectHomeNews(entries, new Date('2026-08-27T12:00:00Z'), 4);

		assert.deepEqual(
			result.map(({ id }) => id),
			[
				'destacada-prioridad-1',
				'destacada-prioridad-2',
				'destacada-sin-prioridad',
				'normal-reciente',
			],
		);
	});

	it('rellena con las últimas no destacadas cuando hay menos destacadas que el límite', () => {
		const entries = [
			entry('destacada', '2026-08-01T08:00:00Z', { featured: true }),
			entry('normal-mas-reciente', '2026-08-26T08:00:00Z'),
			entry('normal-intermedia', '2026-08-20T08:00:00Z'),
			entry('normal-antigua', '2026-08-10T08:00:00Z'),
		];

		const result = selectHomeNews(entries, new Date('2026-08-27T12:00:00Z'), 3);

		assert.deepEqual(
			result.map(({ id }) => id),
			['destacada', 'normal-mas-reciente', 'normal-intermedia'],
		);
	});

	it('cuando hay más destacadas que el límite, el sobrante no aparece en home pero sigue publicado', () => {
		const entries = [
			entry('destacada-1', '2026-08-27T08:00:00Z', { featured: true, homePriority: 1 }),
			entry('destacada-2', '2026-08-26T08:00:00Z', { featured: true, homePriority: 2 }),
			entry('destacada-3', '2026-08-25T08:00:00Z', { featured: true, homePriority: 3 }),
			entry('destacada-4-sobrante', '2026-08-24T08:00:00Z', { featured: true, homePriority: 4 }),
			entry('normal', '2026-08-23T08:00:00Z'),
		];

		const home = selectHomeNews(entries, new Date('2026-08-27T12:00:00Z'), 3);
		const published = selectPublishedNews(entries, new Date('2026-08-27T12:00:00Z'));

		assert.deepEqual(
			home.map(({ id }) => id),
			['destacada-1', 'destacada-2', 'destacada-3'],
		);
		assert.ok(published.some(({ id }) => id === 'destacada-4-sobrante'));
		assert.ok(!home.some(({ id }) => id === 'destacada-4-sobrante'));
	});

	it('nunca se ve vacía cuando existen entradas publicadas, aunque ninguna sea destacada', () => {
		const entries = [entry('a', '2026-08-20T08:00:00Z'), entry('b', '2026-08-21T08:00:00Z')];

		const result = selectHomeNews(entries, new Date('2026-08-27T12:00:00Z'), 3);

		assert.equal(result.length, 2);
	});
});

describe('selectNewsFeed', () => {
	it('ordena igual que selectHomeNews (destacadas por prioridad, luego el resto por fecha) pero sin recortar', () => {
		const entries = [
			entry('normal-reciente', '2026-08-26T08:00:00Z'),
			entry('normal-antigua', '2026-08-10T08:00:00Z'),
			entry('destacada-prioridad-2', '2026-08-05T08:00:00Z', { featured: true, homePriority: 2 }),
			entry('destacada-prioridad-1', '2026-08-01T08:00:00Z', { featured: true, homePriority: 1 }),
		];

		const result = selectNewsFeed(entries, new Date('2026-08-27T12:00:00Z'));

		assert.deepEqual(
			result.map(({ id }) => id),
			['destacada-prioridad-1', 'destacada-prioridad-2', 'normal-reciente', 'normal-antigua'],
		);
	});

	it('devuelve todas las entradas publicadas, sin límite (a diferencia de selectHomeNews)', () => {
		const entries = [
			entry('destacada-1', '2026-08-27T08:00:00Z', { featured: true, homePriority: 1 }),
			entry('destacada-2', '2026-08-26T08:00:00Z', { featured: true, homePriority: 2 }),
			entry('destacada-3', '2026-08-25T08:00:00Z', { featured: true, homePriority: 3 }),
			entry('destacada-4', '2026-08-24T08:00:00Z', { featured: true, homePriority: 4 }),
			entry('normal', '2026-08-23T08:00:00Z'),
		];

		const result = selectNewsFeed(entries, new Date('2026-08-27T12:00:00Z'));

		assert.equal(result.length, 5);
		assert.equal(result[result.length - 1]?.id, 'normal');
	});

	it('excluye borradores y publicaciones futuras igual que selectPublishedNews', () => {
		const entries = [
			entry('publicada', '2026-08-20T08:00:00Z'),
			entry('borrador', '2026-08-21T08:00:00Z', { draft: true }),
			entry('futura', '2026-09-01T08:00:00Z'),
		];

		const result = selectNewsFeed(entries, new Date('2026-08-27T12:00:00Z'));

		assert.deepEqual(
			result.map(({ id }) => id),
			['publicada'],
		);
	});
});

function entry(
	id: string,
	publishedAt: string,
	options: { draft?: boolean; featured?: boolean; homePriority?: number } = {},
) {
	const { draft = false, featured = false, homePriority } = options;
	return { id, data: { draft, featured, homePriority, publishedAt: new Date(publishedAt) } };
}
