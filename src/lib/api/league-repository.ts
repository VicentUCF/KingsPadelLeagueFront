import type { Matchday, Season } from '../league-status';
import { PLAYOFFS_ENABLED } from '../features.ts';
import {
	collectionUrl,
	loadCollection,
	loadRelatedCollection,
	resolveApiBaseUrl,
} from './http-client.ts';
import {
	parseLineup,
	parseLineupPair,
	parseMatch,
	parseMatchday,
	parsePairMatch,
	parsePlayer,
	parsePlayoff,
	parsePlayoffLineup,
	parsePlayoffLineupPair,
	parsePlayoffMatch,
	parsePlayoffPairMatch,
	parseSeason,
	parseSeasonPlayerScore,
	parseSeasonTeamScore,
	parseTeam,
} from './parsers.ts';
import type { LeagueHomeData, PublicLeagueData } from './types';

let publicLeagueDataPromise: Promise<PublicLeagueData> | null = null;
let leagueHomeDataPromise: Promise<LeagueHomeData> | null = null;

export async function loadLeagueHomeData(): Promise<LeagueHomeData> {
	if (leagueHomeDataPromise) return leagueHomeDataPromise;

	const apiBaseUrl = resolveApiBaseUrl();
	const request = Promise.all([
		loadCollection(`${apiBaseUrl}/v1/seasons?limit=50`, parseSeason, 'temporadas'),
		loadCollection(`${apiBaseUrl}/v1/matchdays?limit=100`, parseMatchday, 'jornadas'),
	]).then(async ([seasons, matchdays]) => {
		if (!PLAYOFFS_ENABLED) {
			return { seasons, matchdays, playoffs: [], playoffMatches: [] };
		}

		const seasonId = resolveDatasetSeasonId(seasons, matchdays);
		const playoffs = await loadCollection(
			collectionUrl(apiBaseUrl, '/v1/playoffs', 100, { seasonIds: [seasonId] }),
			parsePlayoff,
			'playoffs',
		);
		const playoffMatches = await loadRelatedCollection(
			apiBaseUrl,
			'/v1/playoff-matches',
			'playoffIds',
			playoffs.map(({ id }) => id),
			200,
			parsePlayoffMatch,
			'partidos de playoffs',
		);
		return { seasons, matchdays, playoffs, playoffMatches };
	});

	leagueHomeDataPromise = resetCacheAfterFailure(request, () => {
		leagueHomeDataPromise = null;
	});
	return leagueHomeDataPromise;
}

export function loadPublicLeagueData(): Promise<PublicLeagueData> {
	if (publicLeagueDataPromise) return publicLeagueDataPromise;

	const apiBaseUrl = resolveApiBaseUrl();
	const request = loadLeagueHomeData().then(async (homeData) => {
		const { seasons, matchdays, playoffs, playoffMatches } = homeData;
		const seasonId = resolveDatasetSeasonId(seasons, matchdays);
		const matchdayIds = matchdays
			.filter((matchday) => matchday.seasonId === seasonId)
			.map(({ id }) => id);
		const [teams, players, matches, seasonPlayerScores, seasonTeamScores, playoffLineups] =
			await Promise.all([
				loadCollection(`${apiBaseUrl}/v1/teams?limit=100`, parseTeam, 'equipos'),
				loadCollection(`${apiBaseUrl}/v1/players?limit=200`, parsePlayer, 'jugadores'),
				loadRelatedCollection(
					apiBaseUrl,
					'/v1/matches',
					'matchdayIds',
					matchdayIds,
					200,
					parseMatch,
					'partidos',
				),
				loadCollection(
					collectionUrl(apiBaseUrl, '/v1/season-player-scores', 200, {
						seasonIds: [seasonId],
					}),
					parseSeasonPlayerScore,
					'puntuaciones de jugadores',
				),
				loadCollection(
					collectionUrl(apiBaseUrl, '/v1/season-team-scores', 100, {
						seasonIds: [seasonId],
					}),
					parseSeasonTeamScore,
					'puntuaciones de equipos',
				),
				loadRelatedCollection(
					apiBaseUrl,
					'/v1/playoff-match-team-line-ups',
					'playoffMatchIds',
					playoffMatches.map(({ id }) => id),
					200,
					parsePlayoffLineup,
					'alineaciones de playoffs',
				),
			]);

		const [lineups, playoffLineupPairs] = await Promise.all([
			loadRelatedCollection(
				apiBaseUrl,
				'/v1/match-team-line-ups',
				'matchIds',
				matches.map(({ id }) => id),
				200,
				parseLineup,
				'alineaciones',
			),
			loadRelatedCollection(
				apiBaseUrl,
				'/v1/playoff-match-team-line-up-pairs',
				'playoffMatchTeamLineUpIds',
				playoffLineups.map(({ id }) => id),
				200,
				parsePlayoffLineupPair,
				'parejas de alineación de playoffs',
			),
		]);
		const lineupPairs = await loadRelatedCollection(
			apiBaseUrl,
			'/v1/match-team-line-up-pairs',
			'matchTeamLineUpIds',
			lineups.map(({ id }) => id),
			200,
			parseLineupPair,
			'parejas de alineación',
		);
		const [pairMatches, playoffPairMatches] = await Promise.all([
			loadRelatedCollection(
				apiBaseUrl,
				'/v1/pair-matches',
				'localLineUpPairIds',
				lineupPairs.map(({ id }) => id),
				200,
				parsePairMatch,
				'partidos por parejas',
			),
			loadRelatedCollection(
				apiBaseUrl,
				'/v1/playoff-pair-matches',
				'localLineUpPairIds',
				playoffLineupPairs.map(({ id }) => id),
				200,
				parsePlayoffPairMatch,
				'partidos por parejas de playoffs',
			),
		]);

		return {
			seasons,
			matchdays,
			teams,
			players,
			matches,
			lineups,
			lineupPairs,
			pairMatches,
			seasonPlayerScores,
			seasonTeamScores,
			playoffs,
			playoffMatches,
			playoffLineups,
			playoffLineupPairs,
			playoffPairMatches,
		};
	});

	publicLeagueDataPromise = resetCacheAfterFailure(request, () => {
		publicLeagueDataPromise = null;
	});
	return publicLeagueDataPromise;
}

function resolveDatasetSeasonId(
	seasons: readonly Season[],
	matchdays: readonly Matchday[],
): string {
	if (seasons.length === 0) throw new Error('La API no ha devuelto ninguna temporada.');

	const now = Date.now();
	const focusMatchday =
		[...matchdays].filter((matchday) => matchday.status === 'in_progress').sort(byScheduledAt)[0] ??
		[...matchdays].filter((matchday) => matchday.status === 'scheduled').sort(byScheduledAt)[0];
	const activeSeason = [...seasons]
		.filter((season) => Date.parse(season.startsAt) <= now && now <= Date.parse(season.endsAt))
		.sort((left, right) => Date.parse(right.startsAt) - Date.parse(left.startsAt))[0];
	const latestSeason = [...seasons].sort(
		(left, right) => Date.parse(right.startsAt) - Date.parse(left.startsAt),
	)[0];
	return focusMatchday?.seasonId ?? activeSeason?.id ?? latestSeason!.id;
}

function resetCacheAfterFailure<T>(request: Promise<T>, reset: () => void): Promise<T> {
	request.catch(reset);
	return request;
}

function byScheduledAt(left: Matchday, right: Matchday): number {
	return Date.parse(left.scheduledAt) - Date.parse(right.scheduledAt);
}
