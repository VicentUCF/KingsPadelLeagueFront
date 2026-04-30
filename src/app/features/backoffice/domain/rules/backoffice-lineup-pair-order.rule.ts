import type { BackofficePlayer } from '../entities/backoffice-player';

export interface BackofficeLineupPairPlayerSelection {
  readonly player1Id: string | null;
  readonly player2Id: string | null;
}

type BackofficeLineupPairPointsPlayer = Pick<BackofficePlayer, 'id' | 'totalPoints'>;

export function calculateBackofficeLineupPairTotalPoints(
  pair: BackofficeLineupPairPlayerSelection,
  players: readonly BackofficeLineupPairPointsPlayer[],
): number {
  const totalPointsByPlayerId = new Map(
    players.map((player) => [player.id, player.totalPoints] as const),
  );

  return (
    readPlayerTotalPoints(pair.player1Id, totalPointsByPlayerId) +
    readPlayerTotalPoints(pair.player2Id, totalPointsByPlayerId)
  );
}

export function isBackofficeLineupPairPointOrderValid(
  pairs: readonly BackofficeLineupPairPlayerSelection[],
  players: readonly BackofficeLineupPairPointsPlayer[],
): boolean {
  const [pairOne, pairTwo] = pairs;

  if (!pairOne || !pairTwo) {
    return true;
  }

  return (
    calculateBackofficeLineupPairTotalPoints(pairOne, players) >=
    calculateBackofficeLineupPairTotalPoints(pairTwo, players)
  );
}

function readPlayerTotalPoints(
  playerId: string | null,
  totalPointsByPlayerId: ReadonlyMap<string, number>,
): number {
  return playerId ? (totalPointsByPlayerId.get(playerId) ?? 0) : 0;
}
