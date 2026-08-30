import type { PublicLeagueData } from '../api/types';

export function validateLeagueData(data: PublicLeagueData): void {
	assertUnique(data.seasons, 'temporadas');
	assertUnique(data.matchdays, 'jornadas');
	assertUnique(data.teams, 'equipos');
	assertUnique(data.players, 'jugadores');
	assertUnique(data.matches, 'partidos');
	assertUnique(data.lineups, 'alineaciones');
	assertUnique(data.lineupPairs, 'parejas de alineación');
	assertUnique(data.pairMatches, 'partidos por parejas');
	assertUnique(data.playoffs, 'playoffs');
	assertUnique(data.playoffMatches, 'partidos de playoffs');
	assertUnique(data.playoffLineups, 'alineaciones de playoffs');
	assertUnique(data.playoffLineupPairs, 'parejas de alineación de playoffs');
	assertUnique(data.playoffPairMatches, 'partidos por parejas de playoffs');

	const seasonIds = idsOf(data.seasons);
	const matchdayIds = idsOf(data.matchdays);
	const teamIds = idsOf(data.teams);
	const playerIds = idsOf(data.players);
	const matchIds = idsOf(data.matches);
	const lineupIds = idsOf(data.lineups);
	const pairIds = idsOf(data.lineupPairs);
	const playoffIds = idsOf(data.playoffs);
	const playoffMatchIds = idsOf(data.playoffMatches);
	const playoffLineupIds = idsOf(data.playoffLineups);
	const playoffPairIds = idsOf(data.playoffLineupPairs);

	for (const item of data.matchdays) {
		requireReference(seasonIds, item.seasonId, `La jornada ${item.id}`, 'temporada');
	}
	for (const item of data.players) {
		if (item.teamId) requireReference(teamIds, item.teamId, `El jugador ${item.id}`, 'equipo');
	}
	for (const item of data.matches) {
		requireReference(matchdayIds, item.matchdayId, `El partido ${item.id}`, 'jornada');
		requireReference(teamIds, item.localTeamId, `El partido ${item.id}`, 'equipo local');
		requireReference(teamIds, item.awayTeamId, `El partido ${item.id}`, 'equipo visitante');
		if (item.localTeamId === item.awayTeamId) {
			throw new Error(`El partido ${item.id} enfrenta al mismo equipo.`);
		}
	}
	for (const item of data.lineups) {
		requireReference(matchIds, item.matchId, `La alineación ${item.id}`, 'partido');
		requireReference(teamIds, item.teamId, `La alineación ${item.id}`, 'equipo');
	}
	for (const item of data.lineupPairs) {
		requireReference(lineupIds, item.matchTeamLineUpId, `La pareja ${item.id}`, 'alineación');
		requireReference(playerIds, item.player1Id, `La pareja ${item.id}`, 'jugador 1');
		requireReference(playerIds, item.player2Id, `La pareja ${item.id}`, 'jugador 2');
	}
	for (const item of data.pairMatches) {
		requireReference(
			pairIds,
			item.localLineUpPairId,
			`El partido de parejas ${item.id}`,
			'pareja local',
		);
		requireReference(
			pairIds,
			item.awayLineUpPairId,
			`El partido de parejas ${item.id}`,
			'pareja visitante',
		);
	}
	for (const score of data.seasonPlayerScores) {
		requireReference(seasonIds, score.seasonId, `La puntuación de ${score.playerId}`, 'temporada');
		requireReference(playerIds, score.playerId, `La puntuación de ${score.playerId}`, 'jugador');
	}
	validateTeamScores(data, seasonIds, teamIds);

	for (const playoff of data.playoffs) {
		requireReference(seasonIds, playoff.seasonId, `El playoff ${playoff.id}`, 'temporada');
	}
	for (const match of data.playoffMatches) {
		requireReference(playoffIds, match.playoffId, `El partido de playoff ${match.id}`, 'playoff');
		requireReference(
			teamIds,
			match.localTeamId,
			`El partido de playoff ${match.id}`,
			'equipo local',
		);
		if (match.awayTeamId) {
			requireReference(
				teamIds,
				match.awayTeamId,
				`El partido de playoff ${match.id}`,
				'equipo visitante',
			);
			if (match.localTeamId === match.awayTeamId) {
				throw new Error(`El partido de playoff ${match.id} enfrenta al mismo equipo.`);
			}
		}
	}
	for (const lineup of data.playoffLineups) {
		requireReference(
			playoffMatchIds,
			lineup.playoffMatchId,
			`La alineación de playoff ${lineup.id}`,
			'partido de playoff',
		);
		requireReference(teamIds, lineup.teamId, `La alineación de playoff ${lineup.id}`, 'equipo');
	}
	for (const pair of data.playoffLineupPairs) {
		requireReference(
			playoffLineupIds,
			pair.playoffMatchTeamLineUpId,
			`La pareja de playoff ${pair.id}`,
			'alineación de playoff',
		);
		requireReference(playerIds, pair.player1Id, `La pareja de playoff ${pair.id}`, 'jugador 1');
		requireReference(playerIds, pair.player2Id, `La pareja de playoff ${pair.id}`, 'jugador 2');
	}
	for (const pairMatch of data.playoffPairMatches) {
		requireReference(
			playoffPairIds,
			pairMatch.localLineUpPairId,
			`El partido por parejas de playoff ${pairMatch.id}`,
			'pareja local',
		);
		requireReference(
			playoffPairIds,
			pairMatch.awayLineUpPairId,
			`El partido por parejas de playoff ${pairMatch.id}`,
			'pareja visitante',
		);
	}
}

function validateTeamScores(
	data: PublicLeagueData,
	seasonIds: ReadonlySet<string>,
	teamIds: ReadonlySet<string>,
): void {
	const keys = new Set<string>();
	for (const score of data.seasonTeamScores) {
		requireReference(seasonIds, score.seasonId, `La puntuación de ${score.teamId}`, 'temporada');
		requireReference(teamIds, score.teamId, `La puntuación de ${score.teamId}`, 'equipo');
		const key = `${score.seasonId}:${score.teamId}`;
		if (keys.has(key)) {
			throw new Error(`La API contiene puntuaciones duplicadas para el equipo ${score.teamId}.`);
		}
		keys.add(key);
	}
}

function idsOf(values: readonly { id: string }[]): Set<string> {
	return new Set(values.map(({ id }) => id));
}

function assertUnique(values: readonly { id: string }[], label: string): void {
	const seen = new Set<string>();
	for (const value of values) {
		if (seen.has(value.id)) {
			throw new Error(`La API contiene un identificador duplicado en ${label}: ${value.id}.`);
		}
		seen.add(value.id);
	}
}

function requireReference(
	ids: ReadonlySet<string>,
	id: string,
	context: string,
	label: string,
): void {
	if (!ids.has(id)) throw new Error(`${context} referencia un ${label} inexistente (${id}).`);
}
