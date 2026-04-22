import type { PlayerHttpV1 } from './kings-padel-api.types';

export interface PlayerHttpCompetitiveStats {
  readonly marketValue: number;
  readonly totalPoints: number;
  readonly wonMatchesCount: number;
  readonly lostMatchesCount: number;
}

export interface PlayerSeasonCompetitiveScore {
  readonly totalPoints: number;
  readonly wonPairMatches: number;
  readonly lostPairMatches: number;
}

const WON_MATCH_FIELDS = [
  'wonPairMatches',
  'wonGames',
  'wonMatches',
  'wonMatchesCount',
  'wins',
  'victories',
] as const;
const LOST_MATCH_FIELDS = [
  'lostPairMatches',
  'lostGames',
  'lostMatches',
  'lostMatchesCount',
  'losses',
  'defeats',
] as const;
const MARKET_VALUE_FIELDS = ['value', 'marketValue'] as const;
const TOTAL_POINTS_FIELDS = ['totalPoints', 'points'] as const;

export function resolvePlayerHttpCompetitiveStats(
  player: PlayerHttpV1,
  seasonScore?: PlayerSeasonCompetitiveScore | null,
): PlayerHttpCompetitiveStats {
  const rawPlayer = player as unknown as Record<string, unknown>;

  return {
    marketValue: readNumericField(rawPlayer, MARKET_VALUE_FIELDS),
    totalPoints: seasonScore?.totalPoints ?? readNumericField(rawPlayer, TOTAL_POINTS_FIELDS),
    wonMatchesCount: seasonScore?.wonPairMatches ?? readNumericField(rawPlayer, WON_MATCH_FIELDS),
    lostMatchesCount:
      seasonScore?.lostPairMatches ?? readNumericField(rawPlayer, LOST_MATCH_FIELDS),
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
