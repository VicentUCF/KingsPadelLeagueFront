import type { BackofficeSeason } from '@features/backoffice/domain/entities/backoffice-season';
import type { StatusBadgeTone } from './status-badge-tone';

export interface BackofficeSeasonCardViewModel {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly statusLabel: string;
  readonly statusTone: StatusBadgeTone;
  readonly restrictionLabel: string;
  readonly actionsLabel: string;
  readonly detailPath: string;
}

export function toBackofficeSeasonCardViewModel(
  season: BackofficeSeason,
  matchdayCount: number,
  isActive: boolean,
): BackofficeSeasonCardViewModel {
  const startDate = formatShortDate(season.startsAt);
  const endDate = formatShortDate(season.endsAt);

  return {
    id: season.id,
    title: season.name,
    subtitle: season.description,
    statusLabel: isActive ? 'En curso' : 'Finalizada',
    statusTone: isActive ? 'success' : 'neutral',
    restrictionLabel: `Del ${startDate} al ${endDate}`,
    actionsLabel: `${matchdayCount} jornadas registradas`,
    detailPath: `/backoffice/temporadas/${season.id}`,
  };
}

function formatShortDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
