import type { PlayerHttpV1 } from './kings-padel-api.types';

export interface PlayerHttpCompetitiveStats {
  readonly marketValue: number;
  readonly wonMatchesCount: number;
  readonly lostMatchesCount: number;
}

const WON_MATCH_FIELDS = [
  'wonGames',
  'wonMatches',
  'wonMatchesCount',
  'wins',
  'victories',
] as const;
const LOST_MATCH_FIELDS = [
  'lostGames',
  'lostMatches',
  'lostMatchesCount',
  'losses',
  'defeats',
] as const;
const MARKET_VALUE_FIELDS = ['value', 'marketValue'] as const;

export function resolvePlayerHttpCompetitiveStats(
  player: PlayerHttpV1,
): PlayerHttpCompetitiveStats {
  const rawPlayer = player as unknown as Record<string, unknown>;

  return {
    marketValue: readNumericField(rawPlayer, MARKET_VALUE_FIELDS),
    wonMatchesCount: readNumericField(rawPlayer, WON_MATCH_FIELDS),
    lostMatchesCount: readNumericField(rawPlayer, LOST_MATCH_FIELDS),
  };
}

function readNumericField(source: Record<string, unknown>, fieldNames: readonly string[]): number {
  for (const fieldName of fieldNames) {
    const value = source[fieldName];

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      const numericValue = Number(value);

      if (Number.isFinite(numericValue)) {
        return numericValue;
      }
    }
  }

  return 0;
}
