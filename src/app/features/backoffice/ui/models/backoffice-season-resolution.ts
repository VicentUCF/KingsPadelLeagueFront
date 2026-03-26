import type { BackofficeMatchday } from '@features/backoffice/domain/entities/backoffice-matchday';
import type { BackofficeSeason } from '@features/backoffice/domain/entities/backoffice-season';

export function resolveCurrentBackofficeSeasonId(
  seasons: readonly BackofficeSeason[],
  matchdays: readonly BackofficeMatchday[],
  now = new Date(),
): string | null {
  const inferredSeasonId = resolveInferredBackofficeSeasonId(seasons, matchdays, now);

  if (inferredSeasonId) {
    return inferredSeasonId;
  }

  const latestSeason = [...seasons].sort(bySeasonStartDesc)[0];

  return latestSeason?.id ?? null;
}

export function resolveBackofficeMatchdayCreationSeasonId(
  seasons: readonly BackofficeSeason[],
  matchdays: readonly BackofficeMatchday[],
  now = new Date(),
): string | null {
  return resolveInferredBackofficeSeasonId(seasons, matchdays, now);
}

function resolveInferredBackofficeSeasonId(
  seasons: readonly BackofficeSeason[],
  matchdays: readonly BackofficeMatchday[],
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

function bySeasonStartDesc(left: BackofficeSeason, right: BackofficeSeason): number {
  return new Date(right.startsAt).getTime() - new Date(left.startsAt).getTime();
}
