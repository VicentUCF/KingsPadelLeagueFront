import type { BackofficeTeam } from '@features/backoffice/domain/entities/backoffice-team';

export abstract class BackofficeTeamsRepository {
  abstract loadAll(): Promise<readonly BackofficeTeam[]>;
}
