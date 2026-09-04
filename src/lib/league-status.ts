export type MatchdayStatus = 'finished' | 'in_progress' | 'scheduled';

export interface Season {
	id: string;
	name: string;
	description: string;
	startsAt: string;
	endsAt: string;
}

export interface Matchday {
	id: string;
	name: string;
	scheduledAt: string;
	seasonId: string;
	status: MatchdayStatus;
}

export interface HomePlayoff {
	id: string;
	seasonId: string;
	name: string;
}

export interface HomePlayoffMatch {
	id: string;
	playoffId: string;
	scheduledAt: string;
	stage: 'round_of_16' | 'round_of_8' | 'quarter_final' | 'semi_final' | 'final';
	status: MatchdayStatus;
}

export interface HomeSeasonStatus {
	seasonName: string;
	phaseLabel: 'Pretemporada' | 'Fase regular' | 'Playoffs' | 'Temporada finalizada';
	matchdayEyebrow:
		| 'Calendario'
		| 'Jornada en curso'
		| 'Próxima jornada'
		| 'Última jornada'
		| 'Playoffs en curso'
		| 'Próximo playoff';
	matchdayLabel: string;
	dateLabel: string;
	focusHref: '/calendario' | '/playoffs';
}

export function resolveHomeSeasonStatus(
	seasons: readonly Season[],
	matchdays: readonly Matchday[],
	now = new Date(),
	playoffs: readonly HomePlayoff[] = [],
	playoffMatches: readonly HomePlayoffMatch[] = [],
): HomeSeasonStatus {
	if (seasons.length === 0) {
		throw new Error('La API no ha devuelto ninguna temporada.');
	}

	const seasonIds = new Set(seasons.map((season) => season.id));
	const orphanMatchday = matchdays.find((matchday) => !seasonIds.has(matchday.seasonId));

	if (orphanMatchday) {
		throw new Error(
			`La jornada ${orphanMatchday.id} referencia una temporada inexistente (${orphanMatchday.seasonId}).`,
		);
	}

	const inProgressMatchday = [...matchdays]
		.filter((matchday) => matchday.status === 'in_progress')
		.sort(byScheduledAtAsc)[0];
	const nextMatchday = [...matchdays]
		.filter((matchday) => matchday.status === 'scheduled')
		.sort(byScheduledAtAsc)[0];
	const activeSeason = [...seasons]
		.filter((season) => isDateWithinSeason(now, season))
		.sort(bySeasonStartDesc)[0];
	const latestSeason = [...seasons].sort(bySeasonStartDesc)[0];
	const selectedSeasonId =
		inProgressMatchday?.seasonId ?? nextMatchday?.seasonId ?? activeSeason?.id ?? latestSeason?.id;
	const selectedSeason = seasons.find((season) => season.id === selectedSeasonId);

	if (!selectedSeason) {
		throw new Error('No se ha podido resolver la temporada que debe mostrarse.');
	}

	const seasonMatchdays = matchdays
		.filter((matchday) => matchday.seasonId === selectedSeason.id)
		.sort(byScheduledAtAsc);
	const seasonPlayoffs = playoffs.filter((playoff) => playoff.seasonId === selectedSeason.id);
	const seasonPlayoffIds = new Set(seasonPlayoffs.map((playoff) => playoff.id));
	const seasonPlayoffMatches = playoffMatches
		.filter((match) => seasonPlayoffIds.has(match.playoffId))
		.sort(byScheduledAtAsc);
	const focusedInProgress = seasonMatchdays.find((matchday) => matchday.status === 'in_progress');
	const focusedScheduled = seasonMatchdays.find((matchday) => matchday.status === 'scheduled');
	const focusedFinished = [...seasonMatchdays]
		.filter((matchday) => matchday.status === 'finished')
		.sort(byScheduledAtDesc)[0];
	const playoffInProgress = seasonPlayoffMatches.find((match) => match.status === 'in_progress');
	const playoffScheduled = seasonPlayoffMatches.find((match) => match.status === 'scheduled');
	const focusPlayoff = !focusedInProgress
		? (playoffInProgress ??
			(playoffScheduled &&
			(!focusedScheduled || byScheduledAtAsc(playoffScheduled, focusedScheduled) <= 0)
				? playoffScheduled
				: undefined))
		: undefined;
	if (focusPlayoff) {
		const playoff = seasonPlayoffs.find((item) => item.id === focusPlayoff.playoffId);
		return {
			seasonName: selectedSeason.name,
			phaseLabel: 'Playoffs',
			matchdayEyebrow: playoffInProgress ? 'Playoffs en curso' : 'Próximo playoff',
			matchdayLabel: `${playoff?.name ?? 'Playoffs'} · ${playoffStageLabel(focusPlayoff.stage)}`,
			dateLabel: formatMatchdayDate(focusPlayoff.scheduledAt),
			focusHref: '/playoffs',
		};
	}
	const focusMatchday = focusedInProgress ?? focusedScheduled ?? focusedFinished;

	return {
		seasonName: selectedSeason.name,
		phaseLabel: resolvePhaseLabel(selectedSeason, seasonMatchdays, seasonPlayoffMatches, now),
		matchdayEyebrow: focusedInProgress
			? 'Jornada en curso'
			: focusedScheduled
				? 'Próxima jornada'
				: focusedFinished
					? 'Última jornada'
					: 'Calendario',
		matchdayLabel: focusMatchday?.name ?? 'Calendario pendiente',
		dateLabel: focusMatchday
			? formatMatchdayDate(focusMatchday.scheduledAt)
			: 'Fechas por confirmar',
		focusHref: '/calendario',
	};
}

function resolvePhaseLabel(
	season: Season,
	matchdays: readonly Matchday[],
	playoffMatches: readonly HomePlayoffMatch[],
	now: Date,
): HomeSeasonStatus['phaseLabel'] {
	if (matchdays.length === 0 || now.getTime() < Date.parse(season.startsAt)) {
		return 'Pretemporada';
	}

	if (
		now.getTime() > Date.parse(season.endsAt) ||
		(matchdays.every((matchday) => matchday.status === 'finished') &&
			playoffMatches.every((match) => match.status === 'finished'))
	) {
		return 'Temporada finalizada';
	}

	return 'Fase regular';
}

function playoffStageLabel(stage: HomePlayoffMatch['stage']): string {
	return {
		round_of_16: 'Ronda de 16',
		round_of_8: 'Ronda de 8',
		quarter_final: 'Cuartos de final',
		semi_final: 'Semifinales',
		final: 'Final',
	}[stage];
}

function isDateWithinSeason(now: Date, season: Season): boolean {
	const nowTime = now.getTime();

	return Date.parse(season.startsAt) <= nowTime && nowTime <= Date.parse(season.endsAt);
}

function bySeasonStartDesc(left: Season, right: Season): number {
	return Date.parse(right.startsAt) - Date.parse(left.startsAt);
}

function byScheduledAtAsc(left: { scheduledAt: string }, right: { scheduledAt: string }): number {
	return Date.parse(left.scheduledAt) - Date.parse(right.scheduledAt);
}

function byScheduledAtDesc(left: { scheduledAt: string }, right: { scheduledAt: string }): number {
	return Date.parse(right.scheduledAt) - Date.parse(left.scheduledAt);
}

function formatMatchdayDate(value: string): string {
	const formatted = new Intl.DateTimeFormat('es-ES', {
		dateStyle: 'long',
		timeZone: 'Europe/Madrid',
	}).format(new Date(value));

	return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
