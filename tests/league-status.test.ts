import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { resolveHomeSeasonStatus, type Matchday, type Season } from '../src/lib/league-status.ts';

const seasonOne: Season = {
	id: 'season-1',
	name: 'Temporada 1',
	description: '',
	startsAt: '2026-01-01T00:00:00Z',
	endsAt: '2026-06-30T23:59:59Z',
};
const seasonTwo: Season = {
	id: 'season-2',
	name: 'Temporada 2',
	description: '',
	startsAt: '2026-09-01T00:00:00Z',
	endsAt: '2026-12-31T23:59:59Z',
};

describe('resolveHomeSeasonStatus', () => {
	it('prioriza una jornada en curso sobre una jornada programada', () => {
		const matchdays: Matchday[] = [
			matchday('current', 'Jornada 7', 'season-1', '2026-06-20T18:00:00Z', 'in_progress'),
			matchday('next', 'Jornada 1', 'season-2', '2026-09-10T18:00:00Z', 'scheduled'),
		];

		const result = resolveHomeSeasonStatus(
			[seasonOne, seasonTwo],
			matchdays,
			new Date('2026-06-20T19:00:00Z'),
		);

		assert.equal(result.seasonName, 'Temporada 1');
		assert.equal(result.phaseLabel, 'Fase regular');
		assert.equal(result.matchdayEyebrow, 'Jornada en curso');
		assert.equal(result.matchdayLabel, 'Jornada 7');
	});

	it('selecciona la próxima jornada por fecha', () => {
		const matchdays: Matchday[] = [
			matchday('later', 'Jornada 2', 'season-2', '2026-09-20T18:00:00Z', 'scheduled'),
			matchday('next', 'Jornada 1', 'season-2', '2026-09-10T18:00:00Z', 'scheduled'),
		];

		const result = resolveHomeSeasonStatus(
			[seasonOne, seasonTwo],
			matchdays,
			new Date('2026-08-27T10:00:00Z'),
		);

		assert.equal(result.seasonName, 'Temporada 2');
		assert.equal(result.phaseLabel, 'Pretemporada');
		assert.equal(result.matchdayEyebrow, 'Próxima jornada');
		assert.equal(result.matchdayLabel, 'Jornada 1');
	});

	it('muestra pretemporada y calendario pendiente cuando no hay jornadas', () => {
		const result = resolveHomeSeasonStatus([seasonTwo], [], new Date('2026-10-01T10:00:00Z'));

		assert.equal(result.phaseLabel, 'Pretemporada');
		assert.equal(result.matchdayEyebrow, 'Calendario');
		assert.equal(result.matchdayLabel, 'Calendario pendiente');
		assert.equal(result.dateLabel, 'Fechas por confirmar');
	});

	it('muestra la última jornada de una temporada finalizada', () => {
		const result = resolveHomeSeasonStatus(
			[seasonOne],
			[
				matchday('first', 'Jornada 1', 'season-1', '2026-02-01T18:00:00Z', 'finished'),
				matchday('last', 'Jornada 8', 'season-1', '2026-06-01T18:00:00Z', 'finished'),
			],
			new Date('2026-07-01T10:00:00Z'),
		);

		assert.equal(result.phaseLabel, 'Temporada finalizada');
		assert.equal(result.matchdayEyebrow, 'Última jornada');
		assert.equal(result.matchdayLabel, 'Jornada 8');
	});

	it('rechaza jornadas que referencian temporadas inexistentes', () => {
		assert.throws(
			() =>
				resolveHomeSeasonStatus(
					[seasonOne],
					[matchday('orphan', 'Jornada 1', 'missing', '2026-02-01T18:00:00Z', 'finished')],
				),
			/temporada inexistente/,
		);
	});
});

function matchday(
	id: string,
	name: string,
	seasonId: string,
	scheduledAt: string,
	status: Matchday['status'],
): Matchday {
	return { id, name, seasonId, scheduledAt, status };
}
