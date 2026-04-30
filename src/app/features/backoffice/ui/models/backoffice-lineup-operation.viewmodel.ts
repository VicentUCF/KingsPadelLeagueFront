import type {
  BackofficeLineup,
  BackofficeLineupPair,
} from '@features/backoffice/domain/entities/backoffice-lineup';
import type { BackofficeMatch } from '@features/backoffice/domain/entities/backoffice-match';
import type { BackofficePairMatch } from '@features/backoffice/domain/entities/backoffice-pair-match';
import type { BackofficePlayer } from '@features/backoffice/domain/entities/backoffice-player';
import { isBackofficeLineupPairPointOrderValid } from '@features/backoffice/domain/rules/backoffice-lineup-pair-order.rule';

export const BACKOFFICE_REQUIRED_LINEUP_PAIR_COUNT = 2;
export const BACKOFFICE_REQUIRED_LINEUP_PLAYER_COUNT = 4;

interface BackofficeLineupPairSelection {
  readonly player1Id: string | null;
  readonly player2Id: string | null;
}

export interface BackofficeLineupOperationViewModel {
  readonly lineupExists: boolean;
  readonly lineupStatus: BackofficeLineup['status'] | 'missing';
  readonly lineupReadyForSubmit: boolean;
  readonly lineupReadyForPairGeneration: boolean;
  readonly lineupLocked: boolean;
  readonly lineupDataValid: boolean;
  readonly pairCount: number;
  readonly assignedPlayerCount: number;
  readonly duplicatePlayerIds: readonly string[];
  readonly invalidPlayerIds: readonly string[];
  readonly incompletePairIndexes: readonly number[];
  readonly pairPointOrderValid: boolean;
  readonly lockReason: string | null;
  readonly reasons: readonly string[];
  readonly primaryReason: string | null;
}

export interface BackofficeMatchOperationViewModel {
  readonly match: BackofficeMatch;
  readonly localLineupSummary: BackofficeLineupOperationViewModel;
  readonly awayLineupSummary: BackofficeLineupOperationViewModel;
  readonly expectedPairMatches: number;
  readonly generatedPairMatches: number;
  readonly completedPairMatches: number;
  readonly pendingPairMatches: number;
  readonly pendingResults: number;
  readonly matchReadyForPairGeneration: boolean;
  readonly matchReadyToStart: boolean;
  readonly matchReadyToFinish: boolean;
  readonly pairGenerationReasons: readonly string[];
  readonly startReasons: readonly string[];
  readonly finishReasons: readonly string[];
}

export interface BackofficeMatchdayOperationViewModel {
  readonly totalMatches: number;
  readonly finishedMatches: number;
  readonly pendingMatches: number;
  readonly expectedPairMatches: number;
  readonly generatedPairMatches: number;
  readonly pendingPairMatches: number;
  readonly completedPairMatches: number;
  readonly pendingResults: number;
  readonly matchdayReadyForPairGeneration: boolean;
  readonly matchdayReadyToStart: boolean;
  readonly matchdayReadyToFinish: boolean;
  readonly pairGenerationReasons: readonly string[];
  readonly startReasons: readonly string[];
  readonly finishReasons: readonly string[];
}

export function createBackofficeLineupOperationViewModel(input: {
  readonly lineup: BackofficeLineup | null;
  readonly pairs: readonly BackofficeLineupPairSelection[];
  readonly teamPlayers: readonly BackofficePlayer[];
}): BackofficeLineupOperationViewModel {
  const assignedPlayerIds = input.pairs.flatMap((pair) =>
    [pair.player1Id, pair.player2Id].filter((playerId): playerId is string => playerId !== null),
  );
  const teamPlayerIds = new Set(input.teamPlayers.map((player) => player.id));
  const duplicatePlayerIds = findDuplicatePlayerIds(assignedPlayerIds);
  const invalidPlayerIds = assignedPlayerIds.filter((playerId) => !teamPlayerIds.has(playerId));
  const incompletePairIndexes = input.pairs.flatMap((pair, index) =>
    pair.player1Id && pair.player2Id ? [] : [index],
  );
  const pairCount = input.pairs.length;
  const assignedPlayerCount = new Set(assignedPlayerIds).size;
  const lineupExists = input.lineup !== null;
  const lineupStatus = input.lineup?.status ?? 'missing';
  const pairPointOrderValid =
    pairCount !== BACKOFFICE_REQUIRED_LINEUP_PAIR_COUNT ||
    incompletePairIndexes.length > 0 ||
    isBackofficeLineupPairPointOrderValid(input.pairs, input.teamPlayers);
  const lineupDataValid =
    pairCount === BACKOFFICE_REQUIRED_LINEUP_PAIR_COUNT &&
    incompletePairIndexes.length === 0 &&
    duplicatePlayerIds.length === 0 &&
    invalidPlayerIds.length === 0 &&
    assignedPlayerCount === BACKOFFICE_REQUIRED_LINEUP_PLAYER_COUNT &&
    pairPointOrderValid;

  const lockReason = resolveLineupLockReason(input.lineup);
  const reasons = uniqueMessages([
    ...(!lineupExists
      ? ['La administración debe preparar la alineación base antes de operar.']
      : []),
    ...(pairCount !== BACKOFFICE_REQUIRED_LINEUP_PAIR_COUNT
      ? [`Necesitas exactamente ${BACKOFFICE_REQUIRED_LINEUP_PAIR_COUNT} parejas.`]
      : []),
    ...(incompletePairIndexes.length > 0
      ? ['Cada pareja debe tener 2 jugadores asignados antes de enviar la alineación.']
      : []),
    ...(duplicatePlayerIds.length > 0 ? ['Un jugador no puede repetirse en dos parejas.'] : []),
    ...(invalidPlayerIds.length > 0
      ? ['Todos los jugadores asignados deben pertenecer al equipo del presidente.']
      : []),
    ...(!pairPointOrderValid
      ? ['La pareja 1 debe tener igual o más puntos de temporada que la pareja 2.']
      : []),
    ...(lineupExists &&
    pairCount === BACKOFFICE_REQUIRED_LINEUP_PAIR_COUNT &&
    incompletePairIndexes.length === 0 &&
    duplicatePlayerIds.length === 0 &&
    invalidPlayerIds.length === 0 &&
    assignedPlayerCount !== BACKOFFICE_REQUIRED_LINEUP_PLAYER_COUNT
      ? [
          `Necesitas ${BACKOFFICE_REQUIRED_LINEUP_PLAYER_COUNT} jugadores únicos para completar la alineación.`,
        ]
      : []),
  ]);

  return {
    lineupExists,
    lineupStatus,
    lineupReadyForSubmit: lineupStatus === 'pending' && lineupDataValid,
    lineupReadyForPairGeneration: lineupStatus === 'submited' && lineupDataValid,
    lineupLocked: lineupStatus !== 'pending',
    lineupDataValid,
    pairCount,
    assignedPlayerCount,
    duplicatePlayerIds,
    invalidPlayerIds,
    incompletePairIndexes,
    pairPointOrderValid,
    lockReason,
    reasons,
    primaryReason: reasons[0] ?? lockReason,
  };
}

export function createBackofficeMatchOperationViewModel(input: {
  readonly match: BackofficeMatch;
  readonly localLineup: BackofficeLineup | null;
  readonly awayLineup: BackofficeLineup | null;
  readonly localPairs: readonly BackofficeLineupPair[];
  readonly awayPairs: readonly BackofficeLineupPair[];
  readonly localTeamPlayers: readonly BackofficePlayer[];
  readonly awayTeamPlayers: readonly BackofficePlayer[];
  readonly pairMatches: readonly BackofficePairMatch[];
}): BackofficeMatchOperationViewModel {
  const localLineupSummary = createBackofficeLineupOperationViewModel({
    lineup: input.localLineup,
    pairs: input.localPairs,
    teamPlayers: input.localTeamPlayers,
  });
  const awayLineupSummary = createBackofficeLineupOperationViewModel({
    lineup: input.awayLineup,
    pairs: input.awayPairs,
    teamPlayers: input.awayTeamPlayers,
  });
  const expectedPairMatches =
    localLineupSummary.lineupReadyForPairGeneration &&
    awayLineupSummary.lineupReadyForPairGeneration
      ? BACKOFFICE_REQUIRED_LINEUP_PAIR_COUNT
      : 0;
  const generatedPairMatches = input.pairMatches.length;
  const completedPairMatches = input.pairMatches.filter(
    (pairMatch) => pairMatch.setsResult.length > 0,
  ).length;
  const matchReadyForPairGeneration = expectedPairMatches > 0 && generatedPairMatches === 0;
  const matchReadyToStart = generatedPairMatches === BACKOFFICE_REQUIRED_LINEUP_PAIR_COUNT;
  const matchReadyToFinish =
    input.match.status === 'in_progress' &&
    generatedPairMatches === BACKOFFICE_REQUIRED_LINEUP_PAIR_COUNT &&
    completedPairMatches === BACKOFFICE_REQUIRED_LINEUP_PAIR_COUNT;

  return {
    match: input.match,
    localLineupSummary,
    awayLineupSummary,
    expectedPairMatches,
    generatedPairMatches,
    completedPairMatches,
    pendingPairMatches: Math.max(expectedPairMatches - generatedPairMatches, 0),
    pendingResults: Math.max(generatedPairMatches - completedPairMatches, 0),
    matchReadyForPairGeneration,
    matchReadyToStart,
    matchReadyToFinish,
    pairGenerationReasons: resolveMatchPairGenerationReasons(
      localLineupSummary,
      awayLineupSummary,
      generatedPairMatches,
    ),
    startReasons: resolveMatchStartReasons(generatedPairMatches),
    finishReasons: resolveMatchFinishReasons(
      input.match,
      generatedPairMatches,
      completedPairMatches,
    ),
  };
}

export function createBackofficeMatchdayOperationViewModel(
  matchSummaries: readonly BackofficeMatchOperationViewModel[],
): BackofficeMatchdayOperationViewModel {
  const totalMatches = matchSummaries.length;
  const finishedMatches = matchSummaries.filter(
    (summary) => summary.match.status === 'finished',
  ).length;
  const generatedPairMatches = matchSummaries.reduce(
    (total, summary) => total + summary.generatedPairMatches,
    0,
  );
  const expectedPairMatches = matchSummaries.reduce(
    (total, summary) => total + summary.expectedPairMatches,
    0,
  );
  const completedPairMatches = matchSummaries.reduce(
    (total, summary) => total + summary.completedPairMatches,
    0,
  );

  return {
    totalMatches,
    finishedMatches,
    pendingMatches: Math.max(totalMatches - finishedMatches, 0),
    expectedPairMatches,
    generatedPairMatches,
    pendingPairMatches: Math.max(expectedPairMatches - generatedPairMatches, 0),
    completedPairMatches,
    pendingResults: Math.max(generatedPairMatches - completedPairMatches, 0),
    matchdayReadyForPairGeneration:
      totalMatches > 0 && matchSummaries.every((summary) => summary.matchReadyForPairGeneration),
    matchdayReadyToStart:
      totalMatches > 0 && matchSummaries.every((summary) => summary.matchReadyToStart),
    matchdayReadyToFinish:
      totalMatches > 0 && matchSummaries.every((summary) => summary.match.status === 'finished'),
    pairGenerationReasons: resolveMatchdayPairGenerationReasons(matchSummaries),
    startReasons: resolveMatchdayStartReasons(matchSummaries),
    finishReasons: resolveMatchdayFinishReasons(matchSummaries),
  };
}

function resolveLineupLockReason(lineup: BackofficeLineup | null): string | null {
  if (!lineup) {
    return 'La administración todavía no ha preparado el contenedor base de esta alineación.';
  }

  if (lineup.status === 'submited') {
    return 'Esta alineación ya fue enviada y se muestra en modo lectura.';
  }

  return null;
}

function resolveMatchPairGenerationReasons(
  localSummary: BackofficeLineupOperationViewModel,
  awaySummary: BackofficeLineupOperationViewModel,
  generatedPairMatches: number,
): readonly string[] {
  if (generatedPairMatches > 0) {
    return ['Los enfrentamientos de parejas ya se han generado y no se pueden volver a crear.'];
  }

  return uniqueMessages([
    ...resolveLineupPairGenerationReasons(localSummary, 'local'),
    ...resolveLineupPairGenerationReasons(awaySummary, 'visitante'),
  ]);
}

function resolveLineupPairGenerationReasons(
  summary: BackofficeLineupOperationViewModel,
  teamSide: 'local' | 'visitante',
): readonly string[] {
  if (!summary.lineupExists) {
    return [`Falta preparar la alineación base del equipo ${teamSide}.`];
  }

  if (summary.lineupStatus !== 'submited') {
    return [`La alineación del equipo ${teamSide} debe estar enviada antes de generar cruces.`];
  }

  if (!summary.lineupDataValid) {
    return [`La alineación del equipo ${teamSide} debe tener exactamente 2 parejas válidas.`];
  }

  return [];
}

function resolveMatchStartReasons(generatedPairMatches: number): readonly string[] {
  if (generatedPairMatches === BACKOFFICE_REQUIRED_LINEUP_PAIR_COUNT) {
    return [];
  }

  return ['Genera los 2 enfrentamientos de parejas antes de iniciar el partido.'];
}

function resolveMatchFinishReasons(
  match: BackofficeMatch,
  generatedPairMatches: number,
  completedPairMatches: number,
): readonly string[] {
  if (match.status !== 'in_progress') {
    return ['Solo puedes finalizar partidos que estén en juego.'];
  }

  return uniqueMessages([
    ...(generatedPairMatches !== BACKOFFICE_REQUIRED_LINEUP_PAIR_COUNT
      ? ['El partido debe tener exactamente 2 cruces generados antes de cerrarse.']
      : []),
    ...(completedPairMatches !== BACKOFFICE_REQUIRED_LINEUP_PAIR_COUNT
      ? ['Debes registrar los 2 resultados antes de finalizar el partido.']
      : []),
  ]);
}

function resolveMatchdayPairGenerationReasons(
  matchSummaries: readonly BackofficeMatchOperationViewModel[],
): readonly string[] {
  if (matchSummaries.length === 0) {
    return ['Necesitas al menos 1 partido para generar enfrentamientos de parejas.'];
  }

  if (matchSummaries.some((summary) => summary.generatedPairMatches > 0)) {
    return ['Los enfrentamientos de parejas ya se han generado y no se pueden volver a crear.'];
  }

  return uniqueMessages(matchSummaries.flatMap((summary) => summary.pairGenerationReasons));
}

function resolveMatchdayStartReasons(
  matchSummaries: readonly BackofficeMatchOperationViewModel[],
): readonly string[] {
  if (matchSummaries.length === 0) {
    return ['Necesitas al menos 1 partido creado para iniciar la jornada.'];
  }

  return uniqueMessages(matchSummaries.flatMap((summary) => summary.startReasons));
}

function resolveMatchdayFinishReasons(
  matchSummaries: readonly BackofficeMatchOperationViewModel[],
): readonly string[] {
  if (matchSummaries.length === 0) {
    return ['Necesitas al menos 1 partido para finalizar la jornada.'];
  }

  if (matchSummaries.some((summary) => summary.match.status !== 'finished')) {
    return ['Finaliza todos los partidos antes de cerrar la jornada.'];
  }

  return [];
}

function findDuplicatePlayerIds(playerIds: readonly string[]): readonly string[] {
  const counts = new Map<string, number>();

  for (const playerId of playerIds) {
    counts.set(playerId, (counts.get(playerId) ?? 0) + 1);
  }

  return [...counts.entries()].filter(([, count]) => count > 1).map(([playerId]) => playerId);
}

function uniqueMessages(messages: readonly string[]): readonly string[] {
  return messages.filter((message, index, list) => list.indexOf(message) === index);
}
