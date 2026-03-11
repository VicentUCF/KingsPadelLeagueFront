import { type BackofficeTeamSummary } from '@features/backoffice/domain/entities/backoffice-team.entity';

import { type BackofficeTeamsRepository } from '../ports/backoffice-teams.repository';

export class LoadBackofficeTeamsUseCase {
  constructor(private readonly backofficeTeamsRepository: BackofficeTeamsRepository) {}

  async execute(): Promise<readonly BackofficeTeamSummary[]> {
    const teams = await this.backofficeTeamsRepository.findAll();

    return [...teams].sort((leftTeam, rightTeam) => {
      const statusDifference =
        resolveStatusPriority(leftTeam.status) - resolveStatusPriority(rightTeam.status);

      if (statusDifference !== 0) {
        return statusDifference;
      }

      return leftTeam.name.localeCompare(rightTeam.name, 'es');
    });
  }
}

function resolveStatusPriority(status: BackofficeTeamSummary['status']): number {
  switch (status) {
    case 'ACTIVE':
      return 0;
    case 'INACTIVE':
      return 1;
    case 'ARCHIVED':
      return 2;
  }
}
