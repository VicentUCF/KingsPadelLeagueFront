import type { MatchdayHttpV1, SeasonHttpV1 } from './kings-padel-api.types';

export function resolveCurrentSeasonId(
  seasons: readonly SeasonHttpV1[],
  matchdays: readonly MatchdayHttpV1[],
  now = new Date(),
): string | null {
  const inferredSeasonId = resolveInferredSeasonId(seasons, matchdays, now);

  if (inferredSeasonId) {
    return inferredSeasonId;
  }

  const latestSeason = [...seasons].sort(bySeasonStartDesc)[0];

  return latestSeason?.id ?? null;
}

function resolveInferredSeasonId(
  seasons: readonly SeasonHttpV1[],
  matchdays: readonly MatchdayHttpV1[],
  now: Date,
): string | null {
  const currentMatchday =
    matchdays.find((matchday) => matchday.status === 'in_progress') ??
    matchdays.find((matchday) => matchday.status === 'scheduled') ??
    null;

  if (currentMatchday) {
    return currentMatchday.seasonId;
  }

  const activeSeason =
    seasons.find((season) => {
      const startsAt = new Date(season.startsAt).getTime();
      const endsAt = new Date(season.endsAt).getTime();
      const nowTime = now.getTime();

      return startsAt <= nowTime && nowTime <= endsAt;
    }) ?? null;

  return activeSeason?.id ?? null;
}

function bySeasonStartDesc(left: SeasonHttpV1, right: SeasonHttpV1): number {
  return new Date(right.startsAt).getTime() - new Date(left.startsAt).getTime();
}
