import { type BackofficeTeamDetail } from '@features/backoffice/domain/entities/backoffice-team.entity';

import { type UpdateBackofficeTeamCommand } from '../commands/backoffice-team.commands';
import { type BackofficeTeamsRepository } from '../ports/backoffice-teams.repository';

export class UpdateBackofficeTeamUseCase {
  constructor(private readonly backofficeTeamsRepository: BackofficeTeamsRepository) {}

  async execute(command: UpdateBackofficeTeamCommand): Promise<BackofficeTeamDetail> {
    return this.backofficeTeamsRepository.update(command);
  }
}
