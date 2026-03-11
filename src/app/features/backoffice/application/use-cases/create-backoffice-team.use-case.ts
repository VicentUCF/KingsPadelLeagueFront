import { type BackofficeTeamDetail } from '@features/backoffice/domain/entities/backoffice-team.entity';

import { type CreateBackofficeTeamCommand } from '../commands/backoffice-team.commands';
import { type BackofficeTeamsRepository } from '../ports/backoffice-teams.repository';

export class CreateBackofficeTeamUseCase {
  constructor(private readonly backofficeTeamsRepository: BackofficeTeamsRepository) {}

  async execute(command: CreateBackofficeTeamCommand): Promise<BackofficeTeamDetail> {
    return this.backofficeTeamsRepository.create(command);
  }
}
