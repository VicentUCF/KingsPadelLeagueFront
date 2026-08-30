import type {
	PlayoffLineupHttp,
	PlayoffLineupPairHttp,
	PlayoffMatchHttp,
	PlayoffPairMatchHttp,
	PlayoffStage,
	PublicLeagueData,
} from '../api/types';
import { byId, createPairLineup, formatDateTime, groupBy, mapStatus } from './shared.ts';
import type {
	PairResult,
	PublicPlayer,
	PublicPlayoff,
	PublicPlayoffMatch,
	PublicPlayoffRound,
	PublicTeam,
} from './types';

const STAGE_ORDER: readonly PlayoffStage[] = [
	'round_of_16',
	'round_of_8',
	'quarter_final',
	'semi_final',
	'final',
];

const STAGE_LABELS: Record<PlayoffStage, string> = {
	round_of_16: 'Ronda de 16',
	round_of_8: 'Ronda de 8',
	quarter_final: 'Cuartos de final',
	semi_final: 'Semifinales',
	final: 'Final',
};

export function createPlayoffs(
	data: PublicLeagueData,
	seasonId: string,
	teamById: ReadonlyMap<string, PublicTeam>,
	playerById: ReadonlyMap<string, PublicPlayer>,
): PublicPlayoff[] {
	const matchesByPlayoff = groupBy(data.playoffMatches, (match) => match.playoffId);
	const lineupsByMatch = groupBy(data.playoffLineups, (lineup) => lineup.playoffMatchId);
	const pairsByLineup = groupBy(data.playoffLineupPairs, (pair) => pair.playoffMatchTeamLineUpId);
	const pairMatchesByLocalPair = new Map(
		data.playoffPairMatches.map((pairMatch) => [pairMatch.localLineUpPairId, pairMatch]),
	);

	return data.playoffs
		.filter((playoff) => playoff.seasonId === seasonId)
		.map((playoff) => ({
			id: playoff.id,
			name: playoff.name,
			rounds: createRounds(
				matchesByPlayoff.get(playoff.id) ?? [],
				lineupsByMatch,
				pairsByLineup,
				pairMatchesByLocalPair,
				teamById,
				playerById,
			),
		}))
		.sort((left, right) => left.name.localeCompare(right.name, 'es'));
}

function createRounds(
	rawMatches: readonly PlayoffMatchHttp[],
	lineupsByMatch: ReadonlyMap<string, readonly PlayoffLineupHttp[]>,
	pairsByLineup: ReadonlyMap<string, readonly PlayoffLineupPairHttp[]>,
	pairMatchesByLocalPair: ReadonlyMap<string, PlayoffPairMatchHttp>,
	teamById: ReadonlyMap<string, PublicTeam>,
	playerById: ReadonlyMap<string, PublicPlayer>,
): PublicPlayoffRound[] {
	return STAGE_ORDER.flatMap((stage): PublicPlayoffRound[] => {
		const matches = rawMatches
			.filter((match) => match.stage === stage)
			.sort((left, right) => Date.parse(left.scheduledAt) - Date.parse(right.scheduledAt))
			.map((match) =>
				createPlayoffMatch(
					match,
					lineupsByMatch,
					pairsByLineup,
					pairMatchesByLocalPair,
					teamById,
					playerById,
				),
			);
		return matches.length ? [{ stage, label: STAGE_LABELS[stage], matches }] : [];
	});
}

function createPlayoffMatch(
	match: PlayoffMatchHttp,
	lineupsByMatch: ReadonlyMap<string, readonly PlayoffLineupHttp[]>,
	pairsByLineup: ReadonlyMap<string, readonly PlayoffLineupPairHttp[]>,
	pairMatchesByLocalPair: ReadonlyMap<string, PlayoffPairMatchHttp>,
	teamById: ReadonlyMap<string, PublicTeam>,
	playerById: ReadonlyMap<string, PublicPlayer>,
): PublicPlayoffMatch {
	const homeTeam = teamById.get(match.localTeamId)!;
	const awayTeam = match.awayTeamId ? teamById.get(match.awayTeamId)! : null;
	const lineups = lineupsByMatch.get(match.id) ?? [];
	const homeLineup = lineups.find((lineup) => lineup.teamId === match.localTeamId);
	const awayLineup = match.awayTeamId
		? lineups.find((lineup) => lineup.teamId === match.awayTeamId)
		: undefined;
	const homePairs = homeLineup ? [...(pairsByLineup.get(homeLineup.id) ?? [])].sort(byId) : [];
	const awayPairs = awayLineup ? [...(pairsByLineup.get(awayLineup.id) ?? [])].sort(byId) : [];
	const awayPairById = new Map(awayPairs.map((pair) => [pair.id, pair]));
	const pairResults = homePairs
		.flatMap((homePair, index): OrderedPairResult[] => {
			const pairMatch = pairMatchesByLocalPair.get(homePair.id);
			const awayPair =
				(pairMatch ? awayPairById.get(pairMatch.awayLineUpPairId) : undefined) ?? awayPairs[index];
			if (!awayPair || !awayTeam) return [];
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
		stage: match.stage,
		stageLabel: STAGE_LABELS[match.stage],
		homeTeam,
		awayTeam,
		homeScore: match.localTeamScorePoints,
		awayScore: match.awayTeamScorePoints,
		status: mapStatus(match.status),
		scheduledAt: match.scheduledAt,
		scheduledAtLabel: formatDateTime(match.scheduledAt),
		pairResults,
	};
}

interface OrderedPairResult {
	order: number;
	result: PairResult;
}
