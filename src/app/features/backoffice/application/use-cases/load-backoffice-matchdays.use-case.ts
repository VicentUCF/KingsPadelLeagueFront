import type { BackofficeMatchday } from '@features/backoffice/domain/entities/backoffice-matchday';
import { type BackofficeMatchdaysRepository } from '@features/backoffice/application/ports/backoffice-matchdays.repository';

export class LoadBackofficeMatchdaysUseCase {
  constructor(private readonly repository: BackofficeMatchdaysRepository) {}

  execute(): Promise<readonly BackofficeMatchday[]> {
    return this.repository.loadAll();
  }
}
