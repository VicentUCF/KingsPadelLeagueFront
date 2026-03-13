import type {
  BackofficeMatchday,
  BackofficeMatchdayStatus,
} from '@features/backoffice/domain/entities/backoffice-matchday';
import type { StatusBadgeTone } from './status-badge-tone';

export interface BackofficeMatchdayRowViewModel {
  readonly id: string;
  readonly name: string;
  readonly dateLabel: string;
  readonly statusLabel: string;
  readonly statusTone: StatusBadgeTone;
  readonly seasonId: string;
  readonly detailPath: string;
}

export function toBackofficeMatchdayRowViewModel(
  matchday: BackofficeMatchday,
): BackofficeMatchdayRowViewModel {
  return {
    id: matchday.id,
    name: matchday.name,
    dateLabel: formatMatchdayDate(matchday.scheduledAt),
    statusLabel: toStatusLabel(matchday.status),
    statusTone: toStatusTone(matchday.status),
    seasonId: matchday.seasonId,
    detailPath: `/backoffice/jornadas/${matchday.id}`,
  };
}

function formatMatchdayDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function toStatusLabel(status: BackofficeMatchdayStatus): string {
  switch (status) {
    case 'finished':
      return 'Finalizada';
    case 'in_progress':
      return 'En curso';
    case 'scheduled':
      return 'Programada';
  }
}

function toStatusTone(status: BackofficeMatchdayStatus): StatusBadgeTone {
  switch (status) {
    case 'finished':
      return 'neutral';
    case 'in_progress':
      return 'success';
    case 'scheduled':
      return 'warning';
  }
}
