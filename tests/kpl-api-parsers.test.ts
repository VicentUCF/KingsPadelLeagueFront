import { describe, expect, it } from 'vitest';
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

		expect(player.lastName).toBe('');
	});
});
