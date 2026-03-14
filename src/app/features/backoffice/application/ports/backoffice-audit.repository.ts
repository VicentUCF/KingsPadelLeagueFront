import { InjectionToken } from '@angular/core';

import type { BackofficeAuditEntry } from '@features/backoffice/domain/entities/backoffice-audit-entry';

export interface BackofficeAuditRepository {
  loadAll(): Promise<readonly BackofficeAuditEntry[]>;
}

export const BACKOFFICE_AUDIT_REPOSITORY = new InjectionToken<BackofficeAuditRepository>(
  'BackofficeAuditRepository',
);
