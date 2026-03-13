import type { BackofficeTeam } from '@features/backoffice/domain/entities/backoffice-team';
import { type BackofficeTeamsRepository } from '@features/backoffice/application/ports/backoffice-teams.repository';

export class LoadBackofficeTeamsUseCase {
  constructor(private readonly repository: BackofficeTeamsRepository) {}

  execute(): Promise<readonly BackofficeTeam[]> {
    return this.repository.loadAll();
  }
}
