import { describe, expect, it } from 'vitest';

import {
	resolveHomeSeasonStatus,
	type HomePlayoff,
	type HomePlayoffMatch,
	type Matchday,
	type Season,
} from '../src/lib/league-status.ts';

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

		expect(result.seasonName).toBe('Temporada 1');
		expect(result.phaseLabel).toBe('Fase regular');
		expect(result.matchdayEyebrow).toBe('Jornada en curso');
		expect(result.matchdayLabel).toBe('Jornada 7');
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

		expect(result.seasonName).toBe('Temporada 2');
		expect(result.phaseLabel).toBe('Pretemporada');
		expect(result.matchdayEyebrow).toBe('Próxima jornada');
		expect(result.matchdayLabel).toBe('Jornada 1');
	});

	it('muestra pretemporada y calendario pendiente cuando no hay jornadas', () => {
		const result = resolveHomeSeasonStatus([seasonTwo], [], new Date('2026-10-01T10:00:00Z'));

		expect(result.phaseLabel).toBe('Pretemporada');
		expect(result.matchdayEyebrow).toBe('Calendario');
		expect(result.matchdayLabel).toBe('Calendario pendiente');
		expect(result.dateLabel).toBe('Fechas por confirmar');
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

		expect(result.phaseLabel).toBe('Temporada finalizada');
		expect(result.matchdayEyebrow).toBe('Última jornada');
		expect(result.matchdayLabel).toBe('Jornada 8');
	});

	it('rechaza jornadas que referencian temporadas inexistentes', () => {
		expect(() =>
			resolveHomeSeasonStatus(
				[seasonOne],
				[matchday('orphan', 'Jornada 1', 'missing', '2026-02-01T18:00:00Z', 'finished')],
			),
		).toThrow(/temporada inexistente/);
	});

	it('prioriza un playoff activo y enlaza su sección pública', () => {
		const playoffs: HomePlayoff[] = [{ id: 'gold', seasonId: 'season-1', name: 'Copa de Oro' }];
		const playoffMatches: HomePlayoffMatch[] = [
			{
				id: 'final',
				playoffId: 'gold',
				scheduledAt: '2026-06-25T18:00:00Z',
				stage: 'final',
				status: 'scheduled',
			},
		];
		const result = resolveHomeSeasonStatus(
			[seasonOne],
			[matchday('last', 'Jornada 8', 'season-1', '2026-06-01T18:00:00Z', 'finished')],
			new Date('2026-06-20T10:00:00Z'),
			playoffs,
			playoffMatches,
		);

		expect(result.phaseLabel).toBe('Playoffs');
		expect(result.matchdayEyebrow).toBe('Próximo playoff');
		expect(result.matchdayLabel).toBe('Copa de Oro · Final');
		expect(result.focusHref).toBe('/playoffs');
	});

	it('no deja que un playoff futuro oculte una jornada regular en curso', () => {
		const playoffs: HomePlayoff[] = [{ id: 'gold', seasonId: 'season-1', name: 'Copa de Oro' }];
		const playoffMatches: HomePlayoffMatch[] = [
			{
				id: 'final',
				playoffId: 'gold',
				scheduledAt: '2026-06-28T18:00:00Z',
				stage: 'final',
				status: 'scheduled',
			},
		];
		const result = resolveHomeSeasonStatus(
			[seasonOne],
			[matchday('current', 'Jornada 8', 'season-1', '2026-06-20T18:00:00Z', 'in_progress')],
			new Date('2026-06-20T19:00:00Z'),
			playoffs,
			playoffMatches,
		);

		expect(result.phaseLabel).toBe('Fase regular');
		expect(result.matchdayEyebrow).toBe('Jornada en curso');
		expect(result.matchdayLabel).toBe('Jornada 8');
		expect(result.focusHref).toBe('/calendario');
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
