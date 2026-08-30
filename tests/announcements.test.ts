import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { selectPublishedAnnouncements } from '../src/lib/announcements.ts';

describe('selectPublishedAnnouncements', () => {
	it('excluye borradores y publicaciones futuras, ordena y limita el resultado', () => {
		const entries = [
			entry('antiguo', '2026-08-20T10:00:00Z'),
			entry('reciente', '2026-08-27T08:00:00Z'),
			entry('intermedio', '2026-08-25T08:00:00Z'),
			entry('borrador', '2026-08-26T08:00:00Z', true),
			entry('futuro', '2026-09-01T08:00:00Z'),
		];

		const result = selectPublishedAnnouncements(entries, new Date('2026-08-27T12:00:00Z'), 2);

		assert.deepEqual(
			result.map(({ id }) => id),
			['reciente', 'intermedio'],
		);
	});
});

function entry(id: string, publishedAt: string, draft = false) {
	return { id, data: { draft, publishedAt: new Date(publishedAt) } };
}
