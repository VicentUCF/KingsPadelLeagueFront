import type { BackofficeRole } from './backoffice-role';

export type BackofficeAuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'invite'
  | 'unlink'
  | 'login'
  | 'status_change';

export type BackofficeAuditEntityType =
  | 'player'
  | 'team'
  | 'season'
  | 'matchday'
  | 'match'
  | 'lineup'
  | 'user'
  | 'session';

export interface BackofficeAuditEntry {
  readonly id: string;
  readonly timestamp: Date;
  readonly actorName: string;
  readonly actorRole: BackofficeRole;
  readonly action: BackofficeAuditAction;
  readonly entityType: BackofficeAuditEntityType;
  readonly entityName: string;
  readonly details?: string;
}
