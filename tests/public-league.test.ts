import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { PublicLeagueData } from '../src/lib/kpl-api.ts';
import { createPublicLeagueView } from '../src/lib/public-league.ts';

function dataset(): PublicLeagueData {
	return {
		seasons: [
			{
				id: 'old',
				name: '2025',
				description: '',
				startsAt: '2025-01-01T00:00:00Z',
				endsAt: '2025-12-31T23:59:59Z',
			},
			{
				id: 'current',
				name: '2026',
				description: '',
				startsAt: '2026-01-01T00:00:00Z',
				endsAt: '2026-12-31T23:59:59Z',
			},
		],
		matchdays: [
			{
				id: 'old-day',
				name: 'Jornada 1',
				scheduledAt: '2025-02-01T10:00:00Z',
				seasonId: 'old',
				status: 'finished',
			},
			{
				id: 'current-day',
				name: 'Jornada 1',
				scheduledAt: '2026-09-01T10:00:00Z',
				seasonId: 'current',
				status: 'scheduled',
			},
		],
		teams: [
			{ id: 'a', name: 'Equipo A', description: '', secondaryDescription: '', logo: '' },
			{ id: 'b', name: 'Equipo B', description: '', secondaryDescription: '', logo: '' },
		],
		players: [
			{
				id: 'p1',
				firstName: 'Ana',
				lastName: 'Uno',
				profileImage: '',
				isPresident: true,
				teamId: 'a',
				preferredPosition: 'left',
			},
			{
				id: 'p2',
				firstName: 'Biel',
				lastName: 'Dos',
				profileImage: '',
				isPresident: true,
				teamId: 'b',
				preferredPosition: 'right',
			},
		],
		matches: [
			{
				id: 'old-match',
				matchdayId: 'old-day',
				localTeamId: 'a',
				awayTeamId: 'b',
				localTeamScorePoints: 9,
				awayTeamScorePoints: 0,
				scheduledAt: '2025-02-01T10:00:00Z',
				status: 'finished',
			},
			{
				id: 'current-match',
				matchdayId: 'current-day',
				localTeamId: 'a',
				awayTeamId: 'b',
				localTeamScorePoints: 0,
				awayTeamScorePoints: 0,
				scheduledAt: '2026-09-01T10:00:00Z',
				status: 'scheduled',
			},
		],
		lineups: [],
		lineupPairs: [],
		pairMatches: [],
		seasonPlayerScores: [
			{
				playerId: 'p1',
				seasonId: 'current',
				totalPoints: 12,
				wonPairMatches: 4,
				lostPairMatches: 1,
			},
			{
				playerId: 'p2',
				seasonId: 'current',
				totalPoints: 8,
				wonPairMatches: 2,
				lostPairMatches: 3,
			},
		],
	};
}

describe('createPublicLeagueView', () => {
	it('mantiene todas las vistas dentro de la temporada seleccionada', () => {
		const view = createPublicLeagueView(dataset(), new Date('2026-08-27T12:00:00Z'));

		assert.equal(view.season.id, 'current');
		assert.deepEqual(
			view.matchdays.map((matchday) => matchday.id),
			['current-day'],
		);
		assert.equal(view.standings[0]?.points, 0, 'no arrastra resultados de 2025');
		assert.equal(view.players[0]?.displayName, 'Ana Uno');
		assert.equal(view.players[0]?.totalPoints, 12);
	});

	it('rechaza relaciones inconsistentes antes de generar páginas', () => {
		const invalid = dataset();
		invalid.matches[0] = { ...invalid.matches[0]!, awayTeamId: 'missing-team' };

		assert.throws(
			() => createPublicLeagueView(invalid, new Date('2026-08-27T12:00:00Z')),
			/referencia un equipo visitante inexistente/,
		);
	});

	it('genera slugs únicos cuando dos jugadores comparten nombre', () => {
		const duplicateNames = dataset();
		duplicateNames.players[1] = {
			...duplicateNames.players[1]!,
			firstName: 'Ana',
			lastName: 'Uno',
		};

		const view = createPublicLeagueView(duplicateNames, new Date('2026-08-27T12:00:00Z'));

		assert.deepEqual(view.players.map((player) => player.slug).sort(), ['ana-uno', 'ana-uno-2']);
	});
});
