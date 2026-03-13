import type { BackofficeMatchday } from '@features/backoffice/domain/entities/backoffice-matchday';

export abstract class BackofficeMatchdaysRepository {
  abstract loadAll(): Promise<readonly BackofficeMatchday[]>;
}
