import type {
	LineupHttp,
	LineupPairHttp,
	MatchHttp,
	PairMatchHttp,
	PublicLeagueData,
} from '../api/types';
import type { Matchday, MatchdayStatus } from '../league-status';
import {
	byId,
	createPairLineup,
	formatDate,
	formatDateTime,
	groupBy,
	mapStatus,
} from './shared.ts';
import type {
	PairResult,
	PublicEncounter,
	PublicMatchday,
	PublicPlayer,
	PublicTeam,
} from './types';

export function createRegularSeason(
	matchdays: readonly Matchday[],
	matches: readonly MatchHttp[],
	data: PublicLeagueData,
	teamById: ReadonlyMap<string, PublicTeam>,
	playerById: ReadonlyMap<string, PublicPlayer>,
	teams: readonly PublicTeam[],
): PublicMatchday[] {
	const matchesByMatchday = groupBy(matches, (match) => match.matchdayId);
	const lineupsByMatch = groupBy(data.lineups, (lineup) => lineup.matchId);
	const pairsByLineup = groupBy(data.lineupPairs, (pair) => pair.matchTeamLineUpId);
	const pairMatchesByLocalPair = new Map(
		data.pairMatches.map((pairMatch) => [pairMatch.localLineUpPairId, pairMatch]),
	);

	return matchdays.map((matchday, index) => {
		const encounters = [...(matchesByMatchday.get(matchday.id) ?? [])]
			.sort((left, right) => Date.parse(left.scheduledAt) - Date.parse(right.scheduledAt))
			.map((match) =>
				createEncounter(
					match,
					lineupsByMatch,
					pairsByLineup,
					pairMatchesByLocalPair,
					teamById,
					playerById,
					matchday.status,
				),
			);
		const participating = new Set(
			encounters.flatMap((encounter) => [encounter.homeTeam.id, encounter.awayTeam.id]),
		);
		const resting = teams.filter((team) => !participating.has(team.id));

		return {
			id: matchday.id,
			number: matchdayNumber(matchday.name, index + 1),
			label: matchday.name,
			status: mapStatus(matchday.status),
			date: matchday.scheduledAt,
			dateLabel: formatDate(matchday.scheduledAt),
			encounters,
			byeTeam: encounters.length > 0 && resting.length === 1 ? resting[0]! : null,
		};
	});
}

function createEncounter(
	match: MatchHttp,
	lineupsByMatch: ReadonlyMap<string, readonly LineupHttp[]>,
	pairsByLineup: ReadonlyMap<string, readonly LineupPairHttp[]>,
	pairMatchesByLocalPair: ReadonlyMap<string, PairMatchHttp>,
	teamById: ReadonlyMap<string, PublicTeam>,
	playerById: ReadonlyMap<string, PublicPlayer>,
	fallbackStatus: MatchdayStatus,
): PublicEncounter {
	const homeTeam = teamById.get(match.localTeamId)!;
	const awayTeam = teamById.get(match.awayTeamId)!;
	const lineups = lineupsByMatch.get(match.id) ?? [];
	const homeLineup = lineups.find((lineup) => lineup.teamId === match.localTeamId);
	const awayLineup = lineups.find((lineup) => lineup.teamId === match.awayTeamId);
	const homePairs = homeLineup ? [...(pairsByLineup.get(homeLineup.id) ?? [])].sort(byId) : [];
	const awayPairs = awayLineup ? [...(pairsByLineup.get(awayLineup.id) ?? [])].sort(byId) : [];
	const awayPairById = new Map(awayPairs.map((pair) => [pair.id, pair]));
	const pairResults = homePairs
		.flatMap((homePair, index): OrderedPairResult[] => {
			const pairMatch = pairMatchesByLocalPair.get(homePair.id);
			const awayPair =
				(pairMatch ? awayPairById.get(pairMatch.awayLineUpPairId) : undefined) ?? awayPairs[index];
			if (!awayPair) return [];
			const sets = pairMatch?.setsResult ?? [];
			const homeSetWins = sets.filter((set) => set.local > set.away).length;
			const awaySetWins = sets.filter((set) => set.away > set.local).length;
			const order = pairMatch?.order ?? index + 1;
			return [
				{
					order,
					result: {
						id: pairMatch?.id ?? `${homePair.id}-${awayPair.id}`,
						label: `Pareja ${order}`,
						homePair: createPairLineup(homePair.player1Id, homePair.player2Id, playerById),
						awayPair: createPairLineup(awayPair.player1Id, awayPair.player2Id, playerById),
						homeScoreLabel: sets.length
							? sets.map((set) => `${set.local}/${set.away}`).join(' · ')
							: 'Pendiente',
						awayScoreLabel: sets.length
							? sets.map((set) => `${set.away}/${set.local}`).join(' · ')
							: 'Pendiente',
						winnerTeamId:
							homeSetWins > awaySetWins
								? homeTeam.id
								: awaySetWins > homeSetWins
									? awayTeam.id
									: null,
					},
				},
			];
		})
		.sort((left, right) => left.order - right.order)
		.map(({ result }) => result);

	return {
		id: match.id,
		homeTeam,
		awayTeam,
		homeScore: match.localTeamScorePoints,
		awayScore: match.awayTeamScorePoints,
		status: mapStatus(match.status ?? fallbackStatus),
		scheduledAt: match.scheduledAt,
		scheduledAtLabel: formatDateTime(match.scheduledAt),
		pairResults,
	};
}

interface OrderedPairResult {
	order: number;
	result: PairResult;
}

function matchdayNumber(label: string, fallback: number): number {
	return Number(label.match(/\d+/)?.[0]) || fallback;
}
