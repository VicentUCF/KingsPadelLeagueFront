import { type BackofficeTeamDetail } from '@features/backoffice/domain/entities/backoffice-team.entity';

import { type BackofficeTeamsRepository } from '../ports/backoffice-teams.repository';

export class LoadBackofficeTeamDetailUseCase {
  constructor(private readonly backofficeTeamsRepository: BackofficeTeamsRepository) {}

  async execute(teamId: string): Promise<BackofficeTeamDetail | null> {
    return this.backofficeTeamsRepository.findById(teamId);
  }
}
