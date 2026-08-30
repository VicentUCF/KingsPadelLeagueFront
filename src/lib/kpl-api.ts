import type { Matchday, MatchdayStatus, Season } from './league-status';

const REQUEST_TIMEOUT_MS = 10_000;
const MATCHDAY_STATUSES = new Set<MatchdayStatus>(['finished', 'in_progress', 'scheduled']);

export interface TeamHttp {
	id: string;
	name: string;
	description: string;
	secondaryDescription: string;
	logo: string;
	primaryColor?: string;
}

export interface PlayerHttp {
	id: string;
	firstName: string;
	lastName: string;
	alias?: string;
	profileImage: string;
	isPresident: boolean;
	teamId?: string;
	preferredPosition: 'both' | 'left' | 'right';
	totalPoints?: number | null;
	wonGames?: number | null;
	lostGames?: number | null;
}

export interface MatchHttp {
	id: string;
	matchdayId: string;
	localTeamId: string;
	awayTeamId: string;
	localTeamScorePoints: number;
	awayTeamScorePoints: number;
	scheduledAt: string;
	status: MatchdayStatus;
}

export interface LineupHttp {
	id: string;
	matchId: string;
	teamId: string;
}

export interface LineupPairHttp {
	id: string;
	matchTeamLineUpId: string;
	player1Id: string;
	player2Id: string;
}

export interface PairMatchSetHttp {
	local: number;
	away: number;
}

export interface PairMatchHttp {
	id: string;
	localLineUpPairId: string;
	awayLineUpPairId: string;
	status: MatchdayStatus;
	setsResult: PairMatchSetHttp[];
}

export interface SeasonPlayerScoreHttp {
	playerId: string;
	seasonId: string;
	totalPoints: number;
	wonPairMatches: number;
	lostPairMatches: number;
}

export interface PublicLeagueData {
	seasons: Season[];
	matchdays: Matchday[];
	teams: TeamHttp[];
	players: PlayerHttp[];
	matches: MatchHttp[];
	lineups: LineupHttp[];
	lineupPairs: LineupPairHttp[];
	pairMatches: PairMatchHttp[];
	seasonPlayerScores: SeasonPlayerScoreHttp[];
}

let publicLeagueDataPromise: Promise<PublicLeagueData> | null = null;
let leagueHomeDataPromise: Promise<{ seasons: Season[]; matchdays: Matchday[] }> | null = null;

export async function loadLeagueHomeData(): Promise<{
	seasons: Season[];
	matchdays: Matchday[];
}> {
	if (leagueHomeDataPromise) {
		return leagueHomeDataPromise;
	}

	const apiBaseUrl = resolveApiBaseUrl();
	const request = Promise.all([
		loadCollection(`${apiBaseUrl}/v1/seasons?limit=50`, parseSeason, 'temporadas'),
		loadCollection(`${apiBaseUrl}/v1/matchdays?limit=100`, parseMatchday, 'jornadas'),
	]).then(([seasons, matchdays]) => ({ seasons, matchdays }));

	leagueHomeDataPromise = request;
	request.catch(() => {
		if (leagueHomeDataPromise === request) {
			leagueHomeDataPromise = null;
		}
	});

	return request;
}

export function loadPublicLeagueData(): Promise<PublicLeagueData> {
	if (publicLeagueDataPromise) {
		return publicLeagueDataPromise;
	}

	const apiBaseUrl = resolveApiBaseUrl();
	const request = Promise.all([
		loadLeagueHomeData(),
		loadCollection(`${apiBaseUrl}/v1/teams?limit=100`, parseTeam, 'equipos'),
		loadCollection(`${apiBaseUrl}/v1/players?limit=200`, parsePlayer, 'jugadores'),
		loadCollection(`${apiBaseUrl}/v1/matches?limit=200`, parseMatch, 'partidos'),
		loadCollection(`${apiBaseUrl}/v1/match-team-line-ups?limit=200`, parseLineup, 'alineaciones'),
		loadCollection(
			`${apiBaseUrl}/v1/match-team-line-up-pairs?limit=200`,
			parseLineupPair,
			'parejas de alineación',
		),
		loadCollection(
			`${apiBaseUrl}/v1/pair-matches?limit=200`,
			parsePairMatch,
			'partidos por parejas',
		),
	]).then(async ([homeData, teams, players, matches, lineups, lineupPairs, pairMatches]) => {
		const { seasons, matchdays } = homeData;
		const seasonId = resolveDatasetSeasonId(seasons, matchdays);
		const scoreUrl = new URL('/v1/season-player-scores', `${apiBaseUrl}/`);
		scoreUrl.searchParams.set('limit', '200');
		scoreUrl.searchParams.set('seasonIds', JSON.stringify([seasonId]));
		const seasonPlayerScores = await loadCollection(
			scoreUrl.toString(),
			parseSeasonPlayerScore,
			'puntuaciones de jugadores',
		);

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
		};
	});

	publicLeagueDataPromise = request;
	request.catch(() => {
		if (publicLeagueDataPromise === request) {
			publicLeagueDataPromise = null;
		}
	});

	return request;
}

function resolveApiBaseUrl(): string {
	const value = import.meta.env.KPL_API_BASE_URL?.trim();

	if (!value) {
		throw new Error(
			'Falta KPL_API_BASE_URL. Configura la URL de la API antes de generar el sitio.',
		);
	}

	let url: URL;

	try {
		url = new URL(value);
	} catch {
		throw new Error('KPL_API_BASE_URL debe ser una URL absoluta válida.');
	}

	if (!['http:', 'https:'].includes(url.protocol)) {
		throw new Error('KPL_API_BASE_URL debe utilizar HTTP o HTTPS.');
	}

	return url.toString().replace(/\/$/, '');
}

async function loadCollection<T>(
	url: string,
	parseItem: (value: unknown, index: number) => T,
	resourceLabel: string,
): Promise<T[]> {
	let response: Response;

	try {
		response = await fetch(url, {
			headers: { accept: 'application/json' },
			signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
		});
	} catch (error) {
		throw new Error(`No se han podido cargar ${resourceLabel} desde la API.`, { cause: error });
	}

	if (!response.ok) {
		throw new Error(`La API ha respondido con HTTP ${response.status} al cargar ${resourceLabel}.`);
	}

	let payload: unknown;

	try {
		payload = await response.json();
	} catch (error) {
		throw new Error(`La respuesta de ${resourceLabel} no contiene JSON válido.`, {
			cause: error,
		});
	}

	if (!isRecord(payload) || !Array.isArray(payload.items)) {
		throw new Error(`La respuesta de ${resourceLabel} no contiene una colección \"items\".`);
	}

	return payload.items.map(parseItem);
}

function parseSeason(value: unknown, index: number): Season {
	if (!isRecord(value)) {
		throw new Error(`La temporada en la posición ${index} no es un objeto válido.`);
	}

	return {
		id: requiredString(value, 'id', `temporada ${index}`),
		name: requiredString(value, 'name', `temporada ${index}`),
		description: optionalString(value, 'description', `temporada ${index}`),
		startsAt: requiredDate(value, 'startsAt', `temporada ${index}`),
		endsAt: requiredDate(value, 'endsAt', `temporada ${index}`),
	};
}

function parseMatchday(value: unknown, index: number): Matchday {
	if (!isRecord(value)) {
		throw new Error(`La jornada en la posición ${index} no es un objeto válido.`);
	}

	const status = requiredString(value, 'status', `jornada ${index}`);

	if (!MATCHDAY_STATUSES.has(status as MatchdayStatus)) {
		throw new Error(`La jornada ${index} contiene un estado desconocido (${status}).`);
	}

	return {
		id: requiredString(value, 'id', `jornada ${index}`),
		name: requiredString(value, 'name', `jornada ${index}`),
		scheduledAt: requiredDate(value, 'scheduledAt', `jornada ${index}`),
		seasonId: requiredString(value, 'seasonId', `jornada ${index}`),
		status: status as MatchdayStatus,
	};
}

function parseTeam(value: unknown, index: number): TeamHttp {
	const record = requiredRecord(value, `equipo ${index}`);

	return {
		id: requiredString(record, 'id', `equipo ${index}`),
		name: requiredString(record, 'name', `equipo ${index}`),
		description: optionalString(record, 'description', `equipo ${index}`),
		secondaryDescription: optionalString(record, 'secondaryDescription', `equipo ${index}`),
		logo: optionalString(record, 'logo', `equipo ${index}`),
		primaryColor: optionalString(record, 'primaryColor', `equipo ${index}`) || undefined,
	};
}

function parsePlayer(value: unknown, index: number): PlayerHttp {
	const record = requiredRecord(value, `jugador ${index}`);
	const preferredPosition = requiredString(record, 'preferredPosition', `jugador ${index}`);

	if (!['both', 'left', 'right'].includes(preferredPosition)) {
		throw new Error(`El jugador ${index} contiene una posición desconocida.`);
	}

	return {
		id: requiredString(record, 'id', `jugador ${index}`),
		firstName: requiredString(record, 'firstName', `jugador ${index}`),
		lastName: requiredString(record, 'lastName', `jugador ${index}`),
		alias: optionalString(record, 'alias', `jugador ${index}`) || undefined,
		profileImage: optionalString(record, 'profileImage', `jugador ${index}`),
		isPresident: optionalBoolean(record, 'isPresident', `jugador ${index}`),
		teamId: optionalString(record, 'teamId', `jugador ${index}`) || undefined,
		preferredPosition: preferredPosition as PlayerHttp['preferredPosition'],
		totalPoints: optionalNumber(record, 'totalPoints', `jugador ${index}`),
		wonGames: optionalNumber(record, 'wonGames', `jugador ${index}`),
		lostGames: optionalNumber(record, 'lostGames', `jugador ${index}`),
	};
}

function parseMatch(value: unknown, index: number): MatchHttp {
	const record = requiredRecord(value, `partido ${index}`);
	const status = parseCompetitiveStatus(record, index, 'partido');

	return {
		id: requiredString(record, 'id', `partido ${index}`),
		matchdayId: requiredString(record, 'matchdayId', `partido ${index}`),
		localTeamId: requiredString(record, 'localTeamId', `partido ${index}`),
		awayTeamId: requiredString(record, 'awayTeamId', `partido ${index}`),
		localTeamScorePoints: requiredNumber(record, 'localTeamScorePoints', `partido ${index}`),
		awayTeamScorePoints: requiredNumber(record, 'awayTeamScorePoints', `partido ${index}`),
		scheduledAt: requiredDate(record, 'scheduledAt', `partido ${index}`),
		status,
	};
}

function parseLineup(value: unknown, index: number): LineupHttp {
	const record = requiredRecord(value, `alineación ${index}`);

	return {
		id: requiredString(record, 'id', `alineación ${index}`),
		matchId: requiredString(record, 'matchId', `alineación ${index}`),
		teamId: requiredString(record, 'teamId', `alineación ${index}`),
	};
}

function parseLineupPair(value: unknown, index: number): LineupPairHttp {
	const record = requiredRecord(value, `pareja de alineación ${index}`);

	return {
		id: requiredString(record, 'id', `pareja de alineación ${index}`),
		matchTeamLineUpId: requiredString(record, 'matchTeamLineUpId', `pareja de alineación ${index}`),
		player1Id: requiredString(record, 'player1Id', `pareja de alineación ${index}`),
		player2Id: requiredString(record, 'player2Id', `pareja de alineación ${index}`),
	};
}

function parsePairMatch(value: unknown, index: number): PairMatchHttp {
	const record = requiredRecord(value, `partido por parejas ${index}`);
	const rawSets = record.setsResult;

	return {
		id: requiredString(record, 'id', `partido por parejas ${index}`),
		localLineUpPairId: requiredString(record, 'localLineUpPairId', `partido por parejas ${index}`),
		awayLineUpPairId: requiredString(record, 'awayLineUpPairId', `partido por parejas ${index}`),
		status: parseCompetitiveStatus(record, index, 'partido por parejas'),
		setsResult: Array.isArray(rawSets)
			? rawSets.map((set, setIndex) => parsePairMatchSet(set, index, setIndex))
			: [],
	};
}

function parsePairMatchSet(value: unknown, pairIndex: number, setIndex: number): PairMatchSetHttp {
	const context = `set ${setIndex} del partido por parejas ${pairIndex}`;
	const record = requiredRecord(value, context);

	return {
		local: requiredNumber(record, 'local', context),
		away: requiredNumber(record, 'away', context),
	};
}

function parseSeasonPlayerScore(value: unknown, index: number): SeasonPlayerScoreHttp {
	const record = requiredRecord(value, `puntuación de jugador ${index}`);

	return {
		playerId: requiredString(record, 'playerId', `puntuación de jugador ${index}`),
		seasonId: requiredString(record, 'seasonId', `puntuación de jugador ${index}`),
		totalPoints: optionalNumber(record, 'totalPoints', `puntuación de jugador ${index}`) ?? 0,
		wonPairMatches: requiredNumber(record, 'wonPairMatches', `puntuación de jugador ${index}`),
		lostPairMatches: requiredNumber(record, 'lostPairMatches', `puntuación de jugador ${index}`),
	};
}

function resolveDatasetSeasonId(
	seasons: readonly Season[],
	matchdays: readonly Matchday[],
): string {
	if (seasons.length === 0) {
		throw new Error('La API no ha devuelto ninguna temporada.');
	}

	const now = Date.now();
	const focusMatchday =
		[...matchdays]
			.filter((matchday) => matchday.status === 'in_progress')
			.sort((left, right) => Date.parse(left.scheduledAt) - Date.parse(right.scheduledAt))[0] ??
		[...matchdays]
			.filter((matchday) => matchday.status === 'scheduled')
			.sort((left, right) => Date.parse(left.scheduledAt) - Date.parse(right.scheduledAt))[0];
	const activeSeason = [...seasons]
		.filter((season) => Date.parse(season.startsAt) <= now && now <= Date.parse(season.endsAt))
		.sort((left, right) => Date.parse(right.startsAt) - Date.parse(left.startsAt))[0];
	const latestSeason = [...seasons].sort(
		(left, right) => Date.parse(right.startsAt) - Date.parse(left.startsAt),
	)[0];

	return focusMatchday?.seasonId ?? activeSeason?.id ?? latestSeason!.id;
}

function parseCompetitiveStatus(
	record: Record<string, unknown>,
	index: number,
	resource: string,
): MatchdayStatus {
	const status = requiredString(record, 'status', `${resource} ${index}`);

	if (!MATCHDAY_STATUSES.has(status as MatchdayStatus)) {
		throw new Error(`El ${resource} ${index} contiene un estado desconocido (${status}).`);
	}

	return status as MatchdayStatus;
}

function requiredRecord(value: unknown, context: string): Record<string, unknown> {
	if (!isRecord(value)) {
		throw new Error(`${context} no es un objeto válido.`);
	}

	return value;
}

function requiredString(value: Record<string, unknown>, key: string, context: string): string {
	const field = value[key];

	if (typeof field !== 'string' || field.trim() === '') {
		throw new Error(`El campo ${key} de ${context} debe ser un texto no vacío.`);
	}

	return field;
}

function optionalString(value: Record<string, unknown>, key: string, context: string): string {
	const field = value[key];

	if (field === undefined || field === null) {
		return '';
	}

	if (typeof field !== 'string') {
		throw new Error(`El campo ${key} de ${context} debe ser un texto.`);
	}

	return field;
}

function requiredNumber(value: Record<string, unknown>, key: string, context: string): number {
	const field = value[key];

	if (typeof field !== 'number' || !Number.isFinite(field)) {
		throw new Error(`El campo ${key} de ${context} debe ser un número válido.`);
	}

	return field;
}

function optionalNumber(
	value: Record<string, unknown>,
	key: string,
	context: string,
): number | null {
	const field = value[key];

	if (field === undefined || field === null) {
		return null;
	}

	if (typeof field !== 'number' || !Number.isFinite(field)) {
		throw new Error(`El campo ${key} de ${context} debe ser un número válido.`);
	}

	return field;
}

function optionalBoolean(value: Record<string, unknown>, key: string, context: string): boolean {
	const field = value[key];

	if (field === undefined || field === null) {
		return false;
	}

	if (typeof field !== 'boolean') {
		throw new Error(`El campo ${key} de ${context} debe ser booleano.`);
	}

	return field;
}

function requiredDate(value: Record<string, unknown>, key: string, context: string): string {
	const field = requiredString(value, key, context);

	if (!Number.isFinite(Date.parse(field))) {
		throw new Error(`El campo ${key} de ${context} debe contener una fecha válida.`);
	}

	return field;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}
