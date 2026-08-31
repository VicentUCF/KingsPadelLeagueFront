import type { PublicLeagueData } from '../api/types';
import type { Matchday, Season } from '../league-status';
import { createLeagueParticipants } from './participants.ts';
import { createPlayoffs } from './playoffs.ts';
import { createRegularSeason } from './regular-season.ts';
import { createStandings } from './standings.ts';
import type { PublicLeagueView, PublicPlayoffMatch } from './types';
import { validateLeagueData } from './validation.ts';

export function createPublicLeagueView(data: PublicLeagueData, now = new Date()): PublicLeagueView {
	validateLeagueData(data);
	const season = resolveSeason(data.seasons, data.matchdays, now);
	const seasonMatchdays = data.matchdays
		.filter((matchday) => matchday.seasonId === season.id)
		.sort(compareMatchdays);
	const seasonMatchdayIds = new Set(seasonMatchdays.map((matchday) => matchday.id));
	const matches = data.matches.filter((match) => seasonMatchdayIds.has(match.matchdayId));
	const { players, teams, playerById, teamById } = createLeagueParticipants(data, season.id);
	const matchdays = createRegularSeason(
		seasonMatchdays,
		matches,
		data,
		teamById,
		playerById,
		teams,
	);
	const playoffs = createPlayoffs(data, season.id, teamById, playerById);
	const standings = createStandings(data.seasonTeamScores, season.id, teams);
	const focusMatchday =
		matchdays.find((matchday) => matchday.status === 'current') ??
		matchdays.find((matchday) => matchday.status === 'upcoming') ??
		[...matchdays].reverse().find((matchday) => matchday.status === 'completed') ??
		null;
	const allPlayoffMatches = playoffs.flatMap((playoff) =>
		playoff.rounds.flatMap((round) => round.matches),
	);
	const focusPlayoffMatch =
		allPlayoffMatches.find((match) => match.status === 'current') ??
		allPlayoffMatches.find((match) => match.status === 'upcoming') ??
		[...allPlayoffMatches].reverse().find((match) => match.status === 'completed') ??
		null;

	return {
		season,
		phaseLabel: resolvePhase(season, seasonMatchdays, allPlayoffMatches, now),
		teams,
		players,
		matchdays,
		playoffs,
		standings,
		focusMatchday,
		focusPlayoffMatch,
	};
}

function resolveSeason(
	seasons: readonly Season[],
	matchdays: readonly Matchday[],
	now: Date,
): Season {
	if (!seasons.length) throw new Error('La API no ha devuelto ninguna temporada.');
	const orderedMatchdays = [...matchdays].sort(byScheduledAt);
	const focus =
		orderedMatchdays.find((item) => item.status === 'in_progress') ??
		orderedMatchdays.find((item) => item.status === 'scheduled');
	const active = [...seasons]
		.filter(
			(season) =>
				Date.parse(season.startsAt) <= now.getTime() && now.getTime() <= Date.parse(season.endsAt),
		)
		.sort((left, right) => Date.parse(right.startsAt) - Date.parse(left.startsAt))[0];
	const latest = [...seasons].sort(
		(left, right) => Date.parse(right.startsAt) - Date.parse(left.startsAt),
	)[0];
	return seasons.find((season) => season.id === (focus?.seasonId ?? active?.id ?? latest?.id))!;
}

function resolvePhase(
	season: Season,
	matchdays: readonly Matchday[],
	playoffMatches: readonly PublicPlayoffMatch[],
	now: Date,
): PublicLeagueView['phaseLabel'] {
	if (now.getTime() < Date.parse(season.startsAt)) return 'Pretemporada';
	if (matchdays.some((matchday) => matchday.status === 'in_progress')) return 'Fase regular';
	if (playoffMatches.some((match) => match.status === 'current')) return 'Playoffs';

	const nextRegularMatchday = matchdays
		.filter(
			(matchday) =>
				matchday.status === 'scheduled' && Date.parse(matchday.scheduledAt) >= now.getTime(),
		)
		.sort(byScheduledAt)[0];
	const nextPlayoffMatch = playoffMatches
		.filter(
			(match) => match.status === 'upcoming' && Date.parse(match.scheduledAt) >= now.getTime(),
		)
		.sort(byScheduledAt)[0];
	if (
		nextPlayoffMatch &&
		(!nextRegularMatchday || byScheduledAt(nextPlayoffMatch, nextRegularMatchday) <= 0)
	) {
		return 'Playoffs';
	}
	if (
		now.getTime() > Date.parse(season.endsAt) ||
		(matchdays.length > 0 &&
			matchdays.every((item) => item.status === 'finished') &&
			playoffMatches.every((match) => match.status === 'completed'))
	) {
		return 'Temporada finalizada';
	}
	return matchdays.length ? 'Fase regular' : 'Pretemporada';
}

function compareMatchdays(left: Matchday, right: Matchday): number {
	return matchdayNumber(left.name, 0) - matchdayNumber(right.name, 0) || byScheduledAt(left, right);
}

function byScheduledAt(left: { scheduledAt: string }, right: { scheduledAt: string }): number {
	return Date.parse(left.scheduledAt) - Date.parse(right.scheduledAt);
}

function matchdayNumber(label: string, fallback: number): number {
	return Number(label.match(/\d+/)?.[0]) || fallback;
}
