import { inject, Injectable } from '@angular/core';

import type { BackofficeAuditEntry } from '@features/backoffice/domain/entities/backoffice-audit-entry';
import { BACKOFFICE_AUDIT_REPOSITORY } from '@features/backoffice/application/ports/backoffice-audit.repository';

@Injectable()
export class LoadBackofficeAuditUseCase {
  private readonly repo = inject(BACKOFFICE_AUDIT_REPOSITORY);

  execute(): Promise<readonly BackofficeAuditEntry[]> {
    return this.repo.loadAll();
  }
}
