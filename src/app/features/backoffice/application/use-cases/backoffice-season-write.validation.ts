import {
  type CreateBackofficeSeasonCommand,
  type UpdateBackofficeSeasonCommand,
} from '../commands/backoffice-season.commands';
import { type BackofficeSeasonSummary } from '../../domain/entities/backoffice-season.entity';
import { type BackofficeSeasonStatus } from '../../domain/entities/backoffice-season-status';

export function assertCanUseActiveSeasonStatus(
  seasons: readonly BackofficeSeasonSummary[],
  seasonId: string | null,
  targetStatus: BackofficeSeasonStatus,
): void {
  if (targetStatus !== 'ACTIVE') {
    return;
  }

  const hasAnotherActiveSeason = seasons.some(
    (season) => season.status === 'ACTIVE' && season.id !== seasonId,
  );

  if (hasAnotherActiveSeason) {
    throw new Error('Ya existe una season activa. Finalízala o archívala antes de activar otra.');
  }
}

export function assertSeasonCalendar(command: CreateBackofficeSeasonCommand): void;
export function assertSeasonCalendar(command: UpdateBackofficeSeasonCommand): void;
export function assertSeasonCalendar(
  command: CreateBackofficeSeasonCommand | UpdateBackofficeSeasonCommand,
): void {
  const startDateTimestamp = Date.parse(command.startDate);
  const endDateTimestamp = Date.parse(command.endDate);

  if (!Number.isFinite(startDateTimestamp) || !Number.isFinite(endDateTimestamp)) {
    throw new Error('La season necesita fechas de inicio y fin válidas.');
  }

  if (endDateTimestamp <= startDateTimestamp) {
    throw new Error('La fecha de fin debe ser posterior a la fecha de inicio.');
  }
}
