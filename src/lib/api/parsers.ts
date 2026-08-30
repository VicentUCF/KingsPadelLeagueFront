import type { Matchday, MatchdayStatus, Season } from '../league-status';
import type {
	LineupHttp,
	LineupPairHttp,
	MatchHttp,
	PairMatchHttp,
	PairMatchSetHttp,
	PlayerHttp,
	PlayoffHttp,
	PlayoffLineupHttp,
	PlayoffLineupPairHttp,
	PlayoffMatchHttp,
	PlayoffPairMatchHttp,
	PlayoffStage,
	SeasonPlayerScoreHttp,
	SeasonTeamScoreHttp,
	TeamHttp,
} from './types';

const MATCHDAY_STATUSES = new Set<MatchdayStatus>(['finished', 'in_progress', 'scheduled']);
const PLAYOFF_STAGES = new Set<PlayoffStage>([
	'round_of_16',
	'round_of_8',
	'quarter_final',
	'semi_final',
	'final',
]);

export function parseSeason(value: unknown, index: number): Season {
	const record = requiredRecord(value, `temporada ${index}`);
	return {
		id: requiredString(record, 'id', `temporada ${index}`),
		name: requiredString(record, 'name', `temporada ${index}`),
		description: optionalString(record, 'description', `temporada ${index}`),
		startsAt: requiredDate(record, 'startsAt', `temporada ${index}`),
		endsAt: requiredDate(record, 'endsAt', `temporada ${index}`),
	};
}

export function parseMatchday(value: unknown, index: number): Matchday {
	const context = `jornada ${index}`;
	const record = requiredRecord(value, context);
	return {
		id: requiredString(record, 'id', context),
		name: requiredString(record, 'name', context),
		scheduledAt: requiredDate(record, 'scheduledAt', context),
		seasonId: requiredString(record, 'seasonId', context),
		status: parseCompetitiveStatus(record, index, 'jornada'),
	};
}

export function parseTeam(value: unknown, index: number): TeamHttp {
	const context = `equipo ${index}`;
	const record = requiredRecord(value, context);
	return {
		id: requiredString(record, 'id', context),
		name: requiredString(record, 'name', context),
		description: optionalString(record, 'description', context),
		secondaryDescription: optionalString(record, 'secondaryDescription', context),
		logo: optionalString(record, 'logo', context),
		primaryColor: optionalString(record, 'primaryColor', context) || undefined,
	};
}

export function parsePlayer(value: unknown, index: number): PlayerHttp {
	const context = `jugador ${index}`;
	const record = requiredRecord(value, context);
	const preferredPosition = requiredString(record, 'preferredPosition', context);
	if (!['both', 'left', 'right'].includes(preferredPosition)) {
		throw new Error(`El jugador ${index} contiene una posición desconocida.`);
	}
	return {
		id: requiredString(record, 'id', context),
		firstName: requiredString(record, 'firstName', context),
		lastName: optionalString(record, 'lastName', context),
		alias: optionalString(record, 'alias', context) || undefined,
		profileImage: optionalString(record, 'profileImage', context),
		isPresident: optionalBoolean(record, 'isPresident', context),
		teamId: optionalString(record, 'teamId', context) || undefined,
		preferredPosition: preferredPosition as PlayerHttp['preferredPosition'],
		totalPoints: optionalNumber(record, 'totalPoints', context),
		wonGames: optionalNumber(record, 'wonGames', context),
		lostGames: optionalNumber(record, 'lostGames', context),
	};
}

export function parseMatch(value: unknown, index: number): MatchHttp {
	const context = `partido ${index}`;
	const record = requiredRecord(value, context);
	return {
		id: requiredString(record, 'id', context),
		matchdayId: requiredString(record, 'matchdayId', context),
		localTeamId: requiredString(record, 'localTeamId', context),
		awayTeamId: requiredString(record, 'awayTeamId', context),
		localTeamScorePoints: requiredNumber(record, 'localTeamScorePoints', context),
		awayTeamScorePoints: requiredNumber(record, 'awayTeamScorePoints', context),
		scheduledAt: requiredDate(record, 'scheduledAt', context),
		mvpId: nullableString(record, 'mvpId', context),
		status: optionalCompetitiveStatus(record, index, 'partido'),
	};
}

export function parseLineup(value: unknown, index: number): LineupHttp {
	const context = `alineación ${index}`;
	const record = requiredRecord(value, context);
	return {
		id: requiredString(record, 'id', context),
		matchId: requiredString(record, 'matchId', context),
		status: optionalLineupStatus(record, index, 'alineación'),
		teamId: requiredString(record, 'teamId', context),
	};
}

export function parseLineupPair(value: unknown, index: number): LineupPairHttp {
	const context = `pareja de alineación ${index}`;
	const record = requiredRecord(value, context);
	return {
		id: requiredString(record, 'id', context),
		matchTeamLineUpId: requiredString(record, 'matchTeamLineUpId', context),
		player1Id: requiredString(record, 'player1Id', context),
		player2Id: requiredString(record, 'player2Id', context),
		totalPlayersValue: optionalNumber(record, 'totalPlayersValue', context) ?? undefined,
	};
}

export function parsePairMatch(value: unknown, index: number): PairMatchHttp {
	const context = `partido por parejas ${index}`;
	const record = requiredRecord(value, context);
	return {
		id: requiredString(record, 'id', context),
		localLineUpPairId: requiredString(record, 'localLineUpPairId', context),
		awayLineUpPairId: requiredString(record, 'awayLineUpPairId', context),
		order: optionalNumber(record, 'order', context) ?? index + 1,
		status: optionalCompetitiveStatus(record, index, 'partido por parejas'),
		setsResult: Array.isArray(record.setsResult)
			? record.setsResult.map((set, setIndex) => parsePairMatchSet(set, index, setIndex))
			: [],
	};
}

export function parsePlayoff(value: unknown, index: number): PlayoffHttp {
	const context = `playoff ${index}`;
	const record = requiredRecord(value, context);
	return {
		id: requiredString(record, 'id', context),
		seasonId: requiredString(record, 'seasonId', context),
		name: requiredString(record, 'name', context),
	};
}

export function parsePlayoffMatch(value: unknown, index: number): PlayoffMatchHttp {
	const context = `partido de playoff ${index}`;
	const record = requiredRecord(value, context);
	const stage = requiredString(record, 'stage', context) as PlayoffStage;
	if (!PLAYOFF_STAGES.has(stage)) {
		throw new Error(`El ${context} contiene una ronda desconocida (${stage}).`);
	}
	return {
		id: requiredString(record, 'id', context),
		playoffId: requiredString(record, 'playoffId', context),
		localTeamId: requiredString(record, 'localTeamId', context),
		awayTeamId: nullableString(record, 'awayTeamId', context),
		localTeamScorePoints: requiredNumber(record, 'localTeamScorePoints', context),
		awayTeamScorePoints: optionalNumber(record, 'awayTeamScorePoints', context),
		scheduledAt: requiredDate(record, 'scheduledAt', context),
		stage,
		status: parseCompetitiveStatus(record, index, 'partido de playoff'),
	};
}

export function parsePlayoffLineup(value: unknown, index: number): PlayoffLineupHttp {
	const context = `alineación de playoff ${index}`;
	const record = requiredRecord(value, context);
	return {
		id: requiredString(record, 'id', context),
		playoffMatchId: requiredString(record, 'playoffMatchId', context),
		status: optionalLineupStatus(record, index, 'alineación de playoff'),
		teamId: requiredString(record, 'teamId', context),
	};
}

export function parsePlayoffLineupPair(value: unknown, index: number): PlayoffLineupPairHttp {
	const context = `pareja de alineación de playoff ${index}`;
	const record = requiredRecord(value, context);
	return {
		id: requiredString(record, 'id', context),
		playoffMatchTeamLineUpId: requiredString(record, 'playoffMatchTeamLineUpId', context),
		player1Id: requiredString(record, 'player1Id', context),
		player2Id: requiredString(record, 'player2Id', context),
		totalPlayersValue: optionalNumber(record, 'totalPlayersValue', context) ?? undefined,
	};
}

export function parsePlayoffPairMatch(value: unknown, index: number): PlayoffPairMatchHttp {
	return parsePairMatch(value, index);
}

export function parseSeasonPlayerScore(value: unknown, index: number): SeasonPlayerScoreHttp {
	const context = `puntuación de jugador ${index}`;
	const record = requiredRecord(value, context);
	return {
		playerId: requiredString(record, 'playerId', context),
		seasonId: requiredString(record, 'seasonId', context),
		totalPoints: optionalNumber(record, 'totalPoints', context) ?? 0,
		wonPairMatches: requiredNumber(record, 'wonPairMatches', context),
		lostPairMatches: requiredNumber(record, 'lostPairMatches', context),
	};
}

export function parseSeasonTeamScore(value: unknown, index: number): SeasonTeamScoreHttp {
	const context = `puntuación de equipo ${index}`;
	const record = requiredRecord(value, context);
	return {
		seasonId: requiredString(record, 'seasonId', context),
		teamId: requiredString(record, 'teamId', context),
		totalPoints: requiredNumber(record, 'totalPoints', context),
		wonMatches: requiredNumber(record, 'wonMatches', context),
		lostMatches: requiredNumber(record, 'lostMatches', context),
		wonGames: requiredNumber(record, 'wonGames', context),
		lostGames: requiredNumber(record, 'lostGames', context),
		wonSets: requiredNumber(record, 'wonSets', context),
		lostSets: requiredNumber(record, 'lostSets', context),
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

function parseCompetitiveStatus(
	record: Record<string, unknown>,
	index: number,
	resource: string,
): MatchdayStatus {
	const status = requiredString(record, 'status', `${resource} ${index}`) as MatchdayStatus;
	if (!MATCHDAY_STATUSES.has(status)) {
		throw new Error(`El ${resource} ${index} contiene un estado desconocido (${status}).`);
	}
	return status;
}

function optionalCompetitiveStatus(
	record: Record<string, unknown>,
	index: number,
	resource: string,
): MatchdayStatus | undefined {
	if (record.status === undefined || record.status === null) return undefined;
	return parseCompetitiveStatus(record, index, resource);
}

function optionalLineupStatus(
	record: Record<string, unknown>,
	index: number,
	resource: string,
): 'pending' | 'submited' | undefined {
	if (record.status === undefined || record.status === null) return undefined;
	const status = requiredString(record, 'status', `${resource} ${index}`);
	if (!['pending', 'submited'].includes(status)) {
		throw new Error(`La ${resource} ${index} contiene un estado desconocido (${status}).`);
	}
	return status as 'pending' | 'submited';
}

function requiredRecord(value: unknown, context: string): Record<string, unknown> {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		throw new Error(`${context} no es un objeto válido.`);
	}
	return value as Record<string, unknown>;
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
	if (field === undefined || field === null) return '';
	if (typeof field !== 'string') {
		throw new Error(`El campo ${key} de ${context} debe ser un texto.`);
	}
	return field;
}

function nullableString(
	value: Record<string, unknown>,
	key: string,
	context: string,
): string | null {
	const field = value[key];
	if (field === undefined || field === null || field === '') return null;
	if (typeof field !== 'string') {
		throw new Error(`El campo ${key} de ${context} debe ser un texto o null.`);
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
	if (field === undefined || field === null) return null;
	if (typeof field !== 'number' || !Number.isFinite(field)) {
		throw new Error(`El campo ${key} de ${context} debe ser un número válido.`);
	}
	return field;
}

function optionalBoolean(value: Record<string, unknown>, key: string, context: string): boolean {
	const field = value[key];
	if (field === undefined || field === null) return false;
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
