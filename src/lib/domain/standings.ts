import type { SeasonTeamScoreHttp } from '../api/types';
import type { PublicTeam, Standing } from './types';

export function createStandings(
	scores: readonly SeasonTeamScoreHttp[],
	seasonId: string,
	teams: readonly PublicTeam[],
): Standing[] {
	const scoreByTeamId = new Map(
		scores.filter((score) => score.seasonId === seasonId).map((score) => [score.teamId, score]),
	);

	return teams
		.map((team) => {
			const score = scoreByTeamId.get(team.id);
			return {
				team,
				rank: 0,
				points: score?.totalPoints ?? 0,
				playedMatches: score ? score.wonMatches + score.lostMatches : 0,
				gameDifference: score ? score.wonGames - score.lostGames : 0,
			};
		})
		.sort(
			(left, right) =>
				right.points - left.points ||
				right.gameDifference - left.gameDifference ||
				left.team.name.localeCompare(right.team.name, 'es'),
		)
		.map((standing, index) => ({ ...standing, rank: index + 1 }));
}
