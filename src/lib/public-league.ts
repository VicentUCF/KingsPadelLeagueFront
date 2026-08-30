import type {
	LineupHttp,
	LineupPairHttp,
	MatchHttp,
	PairMatchHttp,
	PlayerHttp,
	PublicLeagueData,
	TeamHttp,
} from './kpl-api';
import type { Matchday, MatchdayStatus, Season } from './league-status';

export type PublicStatus = 'completed' | 'current' | 'upcoming';

export interface TeamPalette {
	primary: string;
	accent: string;
	surface: string;
	glow: string;
	contrast: string;
}

export interface PublicPlayer {
	id: string;
	slug: string;
	displayName: string;
	firstName: string;
	lastName: string;
	alias?: string;
	profileImage: string | null;
	isPresident: boolean;
	preferredPosition: PlayerHttp['preferredPosition'];
	positionLabel: string;
	teamId?: string;
	teamSlug?: string;
	teamName: string;
	totalPoints: number;
	wonGames: number;
	lostGames: number;
	rank: number;
}

export interface PublicTeam {
	id: string;
	slug: string;
	name: string;
	description: string;
	tagline: string;
	presidentLabel: string;
	logoPath: string | null;
	monogram: string;
	palette: TeamPalette;
	players: PublicPlayer[];
}

export interface PairLineup {
	players: Pick<PublicPlayer, 'id' | 'slug' | 'displayName' | 'positionLabel'>[];
}

export interface PairResult {
	id: string;
	label: string;
	homePair: PairLineup;
	awayPair: PairLineup;
	homeScoreLabel: string;
	awayScoreLabel: string;
	winnerTeamId: string | null;
}

export interface PublicEncounter {
	id: string;
	homeTeam: PublicTeam;
	awayTeam: PublicTeam;
	homeScore: number;
	awayScore: number;
	status: PublicStatus;
	scheduledAt: string;
	scheduledAtLabel: string;
	pairResults: PairResult[];
}

export interface PublicMatchday {
	id: string;
	number: number;
	label: string;
	status: PublicStatus;
	date: string;
	dateLabel: string;
	encounters: PublicEncounter[];
	byeTeam: PublicTeam | null;
}

export interface Standing {
	team: PublicTeam;
	rank: number;
	points: number;
	playedMatches: number;
	gameDifference: number;
}

export interface PublicLeagueView {
	season: Season;
	phaseLabel: 'Pretemporada' | 'Fase regular' | 'Temporada finalizada';
	teams: PublicTeam[];
	players: PublicPlayer[];
	matchdays: PublicMatchday[];
	standings: Standing[];
	focusMatchday: PublicMatchday | null;
}

const DEFAULT_PALETTE: TeamPalette = {
	primary: '#e0bb45',
	accent: '#f5e3a3',
	surface: '#1d1710',
	glow: 'rgb(224 187 69 / 0.42)',
	contrast: '#0b0b0b',
};

const TEAM_BRANDING: Record<string, { logoPath: string | null; palette: TeamPalette }> = {
	'kings-of-favar': {
		logoPath: '/teams_logos/Kings_of_Favar_no_bg.webp',
		palette: {
			primary: '#f3c84b',
			accent: '#f9e9a7',
			surface: '#24150b',
			glow: 'rgb(243 200 75 / 0.46)',
			contrast: '#0d0904',
		},
	},
	titanics: {
		logoPath: '/teams_logos/titanics_no_bg.webp',
		palette: {
			primary: '#84d5ff',
			accent: '#f2f8ff',
			surface: '#0c2034',
			glow: 'rgb(132 213 255 / 0.4)',
			contrast: '#041018',
		},
	},
	barbaridad: {
		logoPath: '/teams_logos/barbarida_no_bg.webp',
		palette: {
			primary: '#ff7848',
			accent: '#ffd0b5',
			surface: '#2a140f',
			glow: 'rgb(255 120 72 / 0.38)',
			contrast: '#140806',
		},
	},
	'barbaridad-team': {
		logoPath: '/teams_logos/barbarida_no_bg.webp',
		palette: {
			primary: '#ff7848',
			accent: '#ffd0b5',
			surface: '#2a140f',
			glow: 'rgb(255 120 72 / 0.38)',
			contrast: '#140806',
		},
	},
	'magic-city': {
		logoPath: '/teams_logos/magic_ng_bg.webp',
		palette: {
			primary: '#69f6d1',
			accent: '#c7ffef',
			surface: '#0d2721',
			glow: 'rgb(105 246 209 / 0.36)',
			contrast: '#05100f',
		},
	},
	redlions: {
		logoPath: '/teams_logos/redlions.webp',
		palette: {
			primary: '#d62f35',
			accent: '#f7d36b',
			surface: '#101827',
			glow: 'rgb(214 47 53 / 0.38)',
			contrast: '#080d16',
		},
	},
	'house-perez': {
		logoPath: null,
		palette: {
			primary: '#f06bb5',
			accent: '#ffd4ef',
			surface: '#29111f',
			glow: 'rgb(240 107 181 / 0.38)',
			contrast: '#12070d',
		},
	},
	thormentadores: {
		logoPath: '/teams_logos/Thormentadores.webp',
		palette: {
			primary: '#8da5ff',
			accent: '#dfe5ff',
			surface: '#171b32',
			glow: 'rgb(141 165 255 / 0.38)',
			contrast: '#090b16',
		},
	},
};

export function createPublicLeagueView(data: PublicLeagueData, now = new Date()): PublicLeagueView {
	validateRelationships(data);
	const season = resolveSeason(data.seasons, data.matchdays, now);
	const seasonMatchdays = data.matchdays
		.filter((matchday) => matchday.seasonId === season.id)
		.sort(compareMatchdays);
	const seasonMatchdayIds = new Set(seasonMatchdays.map((matchday) => matchday.id));
	const matches = data.matches.filter((match) => seasonMatchdayIds.has(match.matchdayId));
	const rawPlayersByTeam = groupBy(
		data.players.filter((player) => player.teamId),
		(player) => player.teamId!,
	);
	const playerSlugById = createUniqueSlugs(
		data.players.map((player) => ({ id: player.id, label: playerName(player) })),
	);
	const scoreByPlayerId = new Map(
		data.seasonPlayerScores
			.filter((score) => score.seasonId === season.id)
			.map((score) => [score.playerId, score]),
	);
	const teamHttpById = new Map(data.teams.map((team) => [team.id, team]));
	const teamSlugById = new Map(
		data.teams.map((team) => [team.id, normalizeSlug(team.name) || team.id]),
	);
	const players: PublicPlayer[] = data.players.map((player) => {
		const score = scoreByPlayerId.get(player.id);
		const team = player.teamId ? teamHttpById.get(player.teamId) : undefined;

		return {
			id: player.id,
			slug: playerSlugById.get(player.id)!,
			displayName: playerName(player),
			firstName: player.firstName,
			lastName: player.lastName,
			alias: player.alias,
			profileImage: resolveImage(player.profileImage),
			isPresident: player.isPresident,
			preferredPosition: player.preferredPosition,
			positionLabel: positionLabel(player.preferredPosition),
			teamId: player.teamId,
			teamSlug: player.teamId ? teamSlugById.get(player.teamId) : undefined,
			teamName: team?.name ?? 'Agente libre',
			totalPoints: score?.totalPoints ?? player.totalPoints ?? 0,
			wonGames: score?.wonPairMatches ?? player.wonGames ?? 0,
			lostGames: score?.lostPairMatches ?? player.lostGames ?? 0,
			rank: 0,
		};
	});

	players.sort(comparePlayers).forEach((player, index) => {
		player.rank = index + 1;
	});
	const playerById = new Map(players.map((player) => [player.id, player]));
	const teams: PublicTeam[] = data.teams
		.map((team) => createTeam(team, rawPlayersByTeam.get(team.id) ?? [], playerById))
		.sort((left, right) => left.name.localeCompare(right.name, 'es'));
	const teamById = new Map(teams.map((team) => [team.id, team]));
	const matchdays = createMatchdays(seasonMatchdays, matches, data, teamById, playerById, teams);
	const standings = createStandings(matchdays, teams);
	const focusMatchday =
		matchdays.find((matchday) => matchday.status === 'current') ??
		matchdays.find((matchday) => matchday.status === 'upcoming') ??
		[...matchdays].reverse().find((matchday) => matchday.status === 'completed') ??
		null;

	return {
		season,
		phaseLabel: resolvePhase(season, seasonMatchdays, now),
		teams,
		players,
		matchdays,
		standings,
		focusMatchday,
	};
}

function createTeam(
	team: TeamHttp,
	rawPlayers: readonly PlayerHttp[],
	playerById: ReadonlyMap<string, PublicPlayer>,
): PublicTeam {
	const slug = normalizeSlug(team.name) || team.id;
	const branding = TEAM_BRANDING[slug];
	const roster = rawPlayers
		.map((player) => playerById.get(player.id))
		.filter((player): player is PublicPlayer => Boolean(player))
		.sort(
			(left, right) =>
				Number(right.isPresident) - Number(left.isPresident) ||
				left.displayName.localeCompare(right.displayName, 'es'),
		);
	const presidents = roster
		.filter((player) => player.isPresident)
		.map((player) => player.displayName);

	return {
		id: team.id,
		slug,
		name: team.name,
		description:
			meaningfulText(team.description) ??
			meaningfulText(team.secondaryDescription) ??
			'La identidad pública del equipo todavía no se ha publicado de forma oficial.',
		tagline: meaningfulText(team.secondaryDescription) ?? 'Equipo inscrito en Kings Padel League.',
		presidentLabel: presidents.length
			? presidents.join(' · ')
			: (roster[0]?.displayName ?? 'Presidencia pendiente'),
		logoPath: branding?.logoPath ?? resolveImage(team.logo),
		monogram: monogram(team.name),
		palette: branding?.palette ?? DEFAULT_PALETTE,
		players: roster,
	};
}

function createMatchdays(
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
): PublicEncounter {
	const homeTeam = teamById.get(match.localTeamId)!;
	const awayTeam = teamById.get(match.awayTeamId)!;
	const lineups = lineupsByMatch.get(match.id) ?? [];
	const homeLineup = lineups.find((lineup) => lineup.teamId === match.localTeamId);
	const awayLineup = lineups.find((lineup) => lineup.teamId === match.awayTeamId);
	const homePairs = homeLineup ? [...(pairsByLineup.get(homeLineup.id) ?? [])].sort(byId) : [];
	const awayPairs = awayLineup ? [...(pairsByLineup.get(awayLineup.id) ?? [])].sort(byId) : [];
	const awayPairById = new Map(awayPairs.map((pair) => [pair.id, pair]));
	const pairResults = homePairs.flatMap((homePair, index): PairResult[] => {
		const pairMatch = pairMatchesByLocalPair.get(homePair.id);
		const awayPair =
			(pairMatch ? awayPairById.get(pairMatch.awayLineUpPairId) : undefined) ?? awayPairs[index];
		if (!awayPair) return [];
		const sets = pairMatch?.setsResult ?? [];
		const homeSetWins = sets.filter((set) => set.local > set.away).length;
		const awaySetWins = sets.filter((set) => set.away > set.local).length;

		return [
			{
				id: pairMatch?.id ?? `${homePair.id}-${awayPair.id}`,
				label: `Pareja ${index + 1}`,
				homePair: createPairLineup(homePair, playerById),
				awayPair: createPairLineup(awayPair, playerById),
				homeScoreLabel: sets.length
					? sets.map((set) => `${set.local}/${set.away}`).join(' · ')
					: 'Pendiente',
				awayScoreLabel: sets.length
					? sets.map((set) => `${set.away}/${set.local}`).join(' · ')
					: 'Pendiente',
				winnerTeamId:
					homeSetWins > awaySetWins ? homeTeam.id : awaySetWins > homeSetWins ? awayTeam.id : null,
			},
		];
	});

	return {
		id: match.id,
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

function createPairLineup(
	pair: LineupPairHttp,
	playerById: ReadonlyMap<string, PublicPlayer>,
): PairLineup {
	return {
		players: [pair.player1Id, pair.player2Id]
			.map((id) => playerById.get(id)!)
			.map(({ id, slug, displayName, positionLabel }) => ({
				id,
				slug,
				displayName,
				positionLabel,
			})),
	};
}

function createStandings(
	matchdays: readonly PublicMatchday[],
	teams: readonly PublicTeam[],
): Standing[] {
	const stats = new Map(
		teams.map((team) => [team.id, { points: 0, playedMatches: 0, gameDifference: 0 }]),
	);
	for (const matchday of matchdays) {
		if (matchday.status === 'upcoming') continue;
		for (const encounter of matchday.encounters) {
			if (encounter.status === 'upcoming') continue;
			const home = stats.get(encounter.homeTeam.id)!;
			const away = stats.get(encounter.awayTeam.id)!;
			const pairDifference = encounter.pairResults.reduce(
				(total, pair) =>
					total +
					pair.homeScoreLabel.split('·').reduce((value, set) => {
						const [local, visitor] = set.trim().split('/').map(Number);
						return (
							value + (Number.isFinite(local) && Number.isFinite(visitor) ? local! - visitor! : 0)
						);
					}, 0),
				0,
			);
			const difference = encounter.pairResults.length
				? pairDifference
				: encounter.homeScore - encounter.awayScore;
			home.points += encounter.homeScore;
			home.playedMatches += 1;
			home.gameDifference += difference;
			away.points += encounter.awayScore;
			away.playedMatches += 1;
			away.gameDifference -= difference;
		}
	}

	return teams
		.map((team) => ({ team, rank: 0, ...stats.get(team.id)! }))
		.sort(
			(left, right) =>
				right.points - left.points ||
				right.gameDifference - left.gameDifference ||
				left.team.name.localeCompare(right.team.name, 'es'),
		)
		.map((standing, index) => ({ ...standing, rank: index + 1 }));
}

function validateRelationships(data: PublicLeagueData): void {
	assertUnique(data.seasons, 'temporadas');
	assertUnique(data.matchdays, 'jornadas');
	assertUnique(data.teams, 'equipos');
	assertUnique(data.players, 'jugadores');
	assertUnique(data.matches, 'partidos');
	assertUnique(data.lineups, 'alineaciones');
	assertUnique(data.lineupPairs, 'parejas de alineación');
	assertUnique(data.pairMatches, 'partidos por parejas');
	const seasonIds = new Set(data.seasons.map((value) => value.id));
	const matchdayIds = new Set(data.matchdays.map((value) => value.id));
	const teamIds = new Set(data.teams.map((value) => value.id));
	const playerIds = new Set(data.players.map((value) => value.id));
	const matchIds = new Set(data.matches.map((value) => value.id));
	const lineupIds = new Set(data.lineups.map((value) => value.id));
	const pairIds = new Set(data.lineupPairs.map((value) => value.id));
	for (const item of data.matchdays)
		requireReference(seasonIds, item.seasonId, `La jornada ${item.id}`, 'temporada');
	for (const item of data.players)
		if (item.teamId) requireReference(teamIds, item.teamId, `El jugador ${item.id}`, 'equipo');
	for (const item of data.matches) {
		requireReference(matchdayIds, item.matchdayId, `El partido ${item.id}`, 'jornada');
		requireReference(teamIds, item.localTeamId, `El partido ${item.id}`, 'equipo local');
		requireReference(teamIds, item.awayTeamId, `El partido ${item.id}`, 'equipo visitante');
		if (item.localTeamId === item.awayTeamId)
			throw new Error(`El partido ${item.id} enfrenta al mismo equipo.`);
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
}

function resolveSeason(
	seasons: readonly Season[],
	matchdays: readonly Matchday[],
	now: Date,
): Season {
	if (!seasons.length) throw new Error('La API no ha devuelto ninguna temporada.');
	const orderedMatchdays = [...matchdays].sort(
		(left, right) => Date.parse(left.scheduledAt) - Date.parse(right.scheduledAt),
	);
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
	now: Date,
): PublicLeagueView['phaseLabel'] {
	if (!matchdays.length || now.getTime() < Date.parse(season.startsAt)) return 'Pretemporada';
	if (
		now.getTime() > Date.parse(season.endsAt) ||
		matchdays.every((item) => item.status === 'finished')
	)
		return 'Temporada finalizada';
	return 'Fase regular';
}

function createUniqueSlugs(values: readonly { id: string; label: string }[]): Map<string, string> {
	const occurrences = new Map<string, number>();
	return new Map(
		values.map(({ id, label }) => {
			const base = normalizeSlug(label) || id;
			const count = occurrences.get(base) ?? 0;
			occurrences.set(base, count + 1);
			return [id, count ? `${base}-${count + 1}` : base];
		}),
	);
}

function assertUnique(values: readonly { id: string }[], label: string): void {
	const seen = new Set<string>();
	for (const value of values) {
		if (seen.has(value.id))
			throw new Error(`La API contiene un identificador duplicado en ${label}: ${value.id}.`);
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

function groupBy<T>(values: readonly T[], key: (value: T) => string): Map<string, T[]> {
	const groups = new Map<string, T[]>();
	for (const value of values) groups.set(key(value), [...(groups.get(key(value)) ?? []), value]);
	return groups;
}

function compareMatchdays(left: Matchday, right: Matchday): number {
	return (
		matchdayNumber(left.name, 0) - matchdayNumber(right.name, 0) ||
		Date.parse(left.scheduledAt) - Date.parse(right.scheduledAt)
	);
}

function comparePlayers(left: PublicPlayer, right: PublicPlayer): number {
	return (
		right.totalPoints - left.totalPoints ||
		right.wonGames - left.wonGames ||
		left.lostGames - right.lostGames ||
		left.displayName.localeCompare(right.displayName, 'es')
	);
}

function mapStatus(status: MatchdayStatus): PublicStatus {
	return status === 'finished' ? 'completed' : status === 'in_progress' ? 'current' : 'upcoming';
}

function playerName(player: PlayerHttp): string {
	return player.alias?.trim() || [player.firstName, player.lastName].filter(Boolean).join(' ');
}

function positionLabel(position: PlayerHttp['preferredPosition']): string {
	return position === 'left' ? 'Revés' : position === 'right' ? 'Drive' : 'Ambos lados';
}

function meaningfulText(value: string): string | null {
	const trimmed = value.trim();
	return trimmed && !['description', 'secondary description'].includes(trimmed.toLowerCase())
		? trimmed
		: null;
}

function resolveImage(value: string): string | null {
	return value && !value.includes('placeholder.com') ? value : null;
}

export function normalizeSlug(value: string): string {
	return value
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.replace(/[^a-zA-Z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
		.toLowerCase();
}

function monogram(value: string): string {
	return value
		.split(' ')
		.filter(Boolean)
		.slice(-2)
		.map((word) => word[0]?.toUpperCase() ?? '')
		.join('');
}

function matchdayNumber(label: string, fallback: number): number {
	return Number(label.match(/\d+/)?.[0]) || fallback;
}

function formatDate(value: string): string {
	return capitalize(
		new Intl.DateTimeFormat('es-ES', { dateStyle: 'long', timeZone: 'Europe/Madrid' }).format(
			new Date(value),
		),
	);
}

function formatDateTime(value: string): string {
	return capitalize(
		new Intl.DateTimeFormat('es-ES', {
			dateStyle: 'medium',
			timeStyle: 'short',
			timeZone: 'Europe/Madrid',
		}).format(new Date(value)),
	);
}

function capitalize(value: string): string {
	return value.charAt(0).toUpperCase() + value.slice(1);
}

function byId<T extends { id: string }>(left: T, right: T): number {
	return left.id.localeCompare(right.id, 'es');
}
