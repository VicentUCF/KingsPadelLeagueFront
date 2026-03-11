import { type BackofficeRosterSummary } from '@features/backoffice/domain/entities/backoffice-roster.entity';

import { type BackofficeRostersRepository } from '../ports/backoffice-rosters.repository';

export class LoadBackofficeRostersUseCase {
  constructor(private readonly backofficeRostersRepository: BackofficeRostersRepository) {}

  async execute(): Promise<readonly BackofficeRosterSummary[]> {
    const rosters = await this.backofficeRostersRepository.findAll();

    return [...rosters].sort((leftRoster, rightRoster) => {
      const statusDifference =
        resolveStatusPriority(leftRoster.status) - resolveStatusPriority(rightRoster.status);

      if (statusDifference !== 0) {
        return statusDifference;
      }

      return leftRoster.teamName.localeCompare(rightRoster.teamName, 'es');
    });
  }
}

function resolveStatusPriority(status: BackofficeRosterSummary['status']): number {
  switch (status) {
    case 'REVIEW':
      return 0;
    case 'HEALTHY':
      return 1;
    case 'CLOSED':
      return 2;
  }
}
