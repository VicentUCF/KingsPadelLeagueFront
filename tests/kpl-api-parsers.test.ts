import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parsePlayer } from '../src/lib/api/parsers.ts';

describe('parsePlayer', () => {
	it('admite apellidos vacíos conforme al contrato de la API', () => {
		const player = parsePlayer(
			{
				id: 'player-1',
				firstName: 'Gabi',
				lastName: '',
				preferredPosition: 'both',
			},
			0,
		);

		assert.equal(player.lastName, '');
	});
});
