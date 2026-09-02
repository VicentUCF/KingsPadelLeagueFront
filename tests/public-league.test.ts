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
			},
			{
				id: 'current-match',
				matchdayId: 'current-day',
				localTeamId: 'a',
				awayTeamId: 'b',
				localTeamScorePoints: 0,
				awayTeamScorePoints: 0,
				scheduledAt: '2026-09-01T10:00:00Z',
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
		seasonTeamScores: [
			{
				seasonId: 'current',
				teamId: 'a',
				totalPoints: 5,
				wonMatches: 2,
				lostMatches: 1,
				wonGames: 12,
				lostGames: 8,
				wonSets: 5,
				lostSets: 3,
			},
			{
				seasonId: 'current',
				teamId: 'b',
				totalPoints: 2,
				wonMatches: 1,
				lostMatches: 2,
				wonGames: 8,
				lostGames: 12,
				wonSets: 3,
				lostSets: 5,
			},
		],
		playoffs: [],
		playoffMatches: [],
		playoffLineups: [],
		playoffLineupPairs: [],
		playoffPairMatches: [],
	};
}

describe('createPublicLeagueView', () => {
	it('aplica el branding y la firma opcional sin alterar el fallback de la liga', () => {
		const branded = dataset();
		branded.teams[0] = { ...branded.teams[0]!, name: 'Kings of Favar' };

		const view = createPublicLeagueView(branded, new Date('2026-08-27T12:00:00Z'));
		const kings = view.teams.find((team) => team.slug === 'kings-of-favar');
		const fallback = view.teams.find((team) => team.id === 'b');

		assert.equal(kings?.logoPath, '/team-identities/kings-of-favar/logo.svg');
		assert.equal(kings?.palette.primary, '#D1007A');
		assert.deepEqual(kings?.signature, {
			secondaryMarkPath: '/team-identities/kings-of-favar/crown.svg',
			motto: 'Born in Favar, built to win',
			edition: '2026',
		});
		assert.equal(fallback?.signature, undefined);
	});

	it('mantiene todas las vistas dentro de la temporada seleccionada', () => {
		const view = createPublicLeagueView(dataset(), new Date('2026-08-27T12:00:00Z'));

		assert.equal(view.season.id, 'current');
		assert.deepEqual(
			view.matchdays.map((matchday) => matchday.id),
			['current-day'],
		);
		assert.equal(view.standings[0]?.points, 5, 'usa la puntuación oficial de 2026');
		assert.equal(view.standings[0]?.playedMatches, 3);
		assert.equal(view.standings[0]?.gameDifference, 4);
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

	it('crea rondas de playoffs y admite un rival todavía no decidido', () => {
		const playoffData = dataset();
		playoffData.playoffs = [{ id: 'playoff-1', seasonId: 'current', name: 'Copa de Oro' }];
		playoffData.playoffMatches = [
			{
				id: 'semi-1',
				playoffId: 'playoff-1',
				localTeamId: 'a',
				awayTeamId: null,
				localTeamScorePoints: 0,
				awayTeamScorePoints: null,
				scheduledAt: '2026-09-20T10:00:00Z',
				stage: 'semi_final',
				status: 'scheduled',
			},
		];

		const view = createPublicLeagueView(playoffData, new Date('2026-09-10T12:00:00Z'));

		assert.equal(view.phaseLabel, 'Playoffs');
		assert.equal(view.playoffs[0]?.rounds[0]?.label, 'Semifinales');
		assert.equal(view.playoffs[0]?.rounds[0]?.matches[0]?.awayTeam, null);
		assert.equal(view.focusPlayoffMatch?.id, 'semi-1');
	});

	it('mantiene la fase regular cuando hay una jornada activa y un playoff futuro', () => {
		const activeRegularSeason = dataset();
		activeRegularSeason.matchdays[1] = {
			...activeRegularSeason.matchdays[1]!,
			scheduledAt: '2026-09-10T10:00:00Z',
			status: 'in_progress',
		};
		activeRegularSeason.playoffs = [{ id: 'playoff-1', seasonId: 'current', name: 'Copa de Oro' }];
		activeRegularSeason.playoffMatches = [
			{
				id: 'final',
				playoffId: 'playoff-1',
				localTeamId: 'a',
				awayTeamId: 'b',
				localTeamScorePoints: 0,
				awayTeamScorePoints: 0,
				scheduledAt: '2026-09-20T10:00:00Z',
				stage: 'final',
				status: 'scheduled',
			},
		];

		const view = createPublicLeagueView(activeRegularSeason, new Date('2026-09-10T12:00:00Z'));

		assert.equal(view.phaseLabel, 'Fase regular');
	});

	it('ordena los resultados de parejas mediante el campo order', () => {
		const orderedPairs = dataset();
		orderedPairs.lineups = [
			{ id: 'lineup-a', matchId: 'current-match', teamId: 'a' },
			{ id: 'lineup-b', matchId: 'current-match', teamId: 'b' },
		];
		orderedPairs.lineupPairs = [
			{ id: 'home-1', matchTeamLineUpId: 'lineup-a', player1Id: 'p1', player2Id: 'p1' },
			{ id: 'home-2', matchTeamLineUpId: 'lineup-a', player1Id: 'p1', player2Id: 'p1' },
			{ id: 'away-1', matchTeamLineUpId: 'lineup-b', player1Id: 'p2', player2Id: 'p2' },
			{ id: 'away-2', matchTeamLineUpId: 'lineup-b', player1Id: 'p2', player2Id: 'p2' },
		];
		orderedPairs.pairMatches = [
			{
				id: 'pair-second',
				localLineUpPairId: 'home-1',
				awayLineUpPairId: 'away-1',
				order: 2,
				setsResult: [],
			},
			{
				id: 'pair-first',
				localLineUpPairId: 'home-2',
				awayLineUpPairId: 'away-2',
				order: 1,
				setsResult: [],
			},
		];

		const view = createPublicLeagueView(orderedPairs, new Date('2026-08-27T12:00:00Z'));
		const pairResults = view.matchdays[0]?.encounters[0]?.pairResults ?? [];

		assert.deepEqual(
			pairResults.map((pair) => pair.id),
			['pair-first', 'pair-second'],
		);
		assert.deepEqual(
			pairResults.map((pair) => pair.label),
			['Pareja 1', 'Pareja 2'],
		);
	});

	it('rechaza referencias inválidas dentro del cuadro de playoffs', () => {
		const invalid = dataset();
		invalid.playoffs = [{ id: 'playoff-1', seasonId: 'current', name: 'Copa de Oro' }];
		invalid.playoffMatches = [
			{
				id: 'final',
				playoffId: 'playoff-1',
				localTeamId: 'a',
				awayTeamId: 'missing-team',
				localTeamScorePoints: 0,
				awayTeamScorePoints: 0,
				scheduledAt: '2026-09-20T10:00:00Z',
				stage: 'final',
				status: 'scheduled',
			},
		];

		assert.throws(
			() => createPublicLeagueView(invalid, new Date('2026-09-10T12:00:00Z')),
			/referencia un equipo visitante inexistente/,
		);
	});
});
