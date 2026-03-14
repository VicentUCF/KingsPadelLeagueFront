import type {
  BackofficeAuditAction,
  BackofficeAuditEntry,
  BackofficeAuditEntityType,
} from '@features/backoffice/domain/entities/backoffice-audit-entry';
import type { StatusBadgeTone } from './status-badge-tone';

export interface BackofficeAuditEntryViewModel {
  readonly id: string;
  readonly timestamp: string;
  readonly timeAgo: string;
  readonly actorName: string;
  readonly actorRoleLabel: string;
  readonly action: BackofficeAuditAction;
  readonly actionLabel: string;
  readonly actionTone: StatusBadgeTone;
  readonly entityTypeLabel: string;
  readonly entityName: string;
  readonly details?: string;
}

const ACTION_LABELS: Record<BackofficeAuditAction, string> = {
  create: 'Creó',
  update: 'Editó',
  delete: 'Eliminó',
  invite: 'Invitó',
  unlink: 'Desvinculó',
  login: 'Accedió',
  status_change: 'Cambió estado',
};

const ACTION_TONES: Record<BackofficeAuditAction, StatusBadgeTone> = {
  create: 'success',
  update: 'warning',
  delete: 'neutral',
  invite: 'success',
  unlink: 'neutral',
  login: 'neutral',
  status_change: 'warning',
};

const ENTITY_TYPE_LABELS: Record<BackofficeAuditEntityType, string> = {
  player: 'Jugador',
  team: 'Equipo',
  season: 'Temporada',
  matchday: 'Jornada',
  match: 'Partido',
  lineup: 'Alineación',
  user: 'Usuario',
  session: 'Sesión',
};

function formatTimestamp(date: Date): string {
  return date.toLocaleString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatTimeAgo(date: Date, now: Date): string {
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return 'Ahora mismo';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffH < 24) return `Hace ${diffH} h`;
  if (diffD === 1) return 'Ayer';
  if (diffD < 7) return `Hace ${diffD} días`;
  return formatTimestamp(date);
}

export function toBackofficeAuditEntryViewModel(
  entry: BackofficeAuditEntry,
  now: Date,
): BackofficeAuditEntryViewModel {
  return {
    id: entry.id,
    timestamp: formatTimestamp(entry.timestamp),
    timeAgo: formatTimeAgo(entry.timestamp, now),
    actorName: entry.actorName,
    actorRoleLabel: entry.actorRole === 'ADMIN' ? 'Admin' : 'Presidente',
    action: entry.action,
    actionLabel: ACTION_LABELS[entry.action],
    actionTone: ACTION_TONES[entry.action],
    entityTypeLabel: ENTITY_TYPE_LABELS[entry.entityType],
    entityName: entry.entityName,
    ...(entry.details !== undefined ? { details: entry.details } : {}),
  };
}
