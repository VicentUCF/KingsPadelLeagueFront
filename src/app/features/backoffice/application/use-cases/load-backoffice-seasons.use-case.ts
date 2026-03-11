import { type BackofficeSeasonSummary } from '@features/backoffice/domain/entities/backoffice-season.entity';

import { type BackofficeSeasonsRepository } from '../ports/backoffice-seasons.repository';

export class LoadBackofficeSeasonsUseCase {
  constructor(private readonly backofficeSeasonsRepository: BackofficeSeasonsRepository) {}

  async execute(): Promise<readonly BackofficeSeasonSummary[]> {
    const seasons = await this.backofficeSeasonsRepository.findAll();

    return [...seasons].sort((leftSeason, rightSeason) => {
      const statusPriorityDifference =
        resolveStatusPriority(leftSeason.status) - resolveStatusPriority(rightSeason.status);

      if (statusPriorityDifference !== 0) {
        return statusPriorityDifference;
      }

      return rightSeason.year - leftSeason.year;
    });
  }
}

function resolveStatusPriority(status: BackofficeSeasonSummary['status']): number {
  switch (status) {
    case 'ACTIVE':
      return 0;
    case 'DRAFT':
      return 1;
    case 'FINISHED':
      return 2;
    case 'ARCHIVED':
      return 3;
  }
}
