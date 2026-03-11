import { type BackofficeSeasonSummary } from '@features/backoffice/domain/entities/backoffice-season.entity';

import { type BackofficeSeasonsRepository } from '../ports/backoffice-seasons.repository';

export class FindActiveBackofficeSeasonUseCase {
  constructor(private readonly backofficeSeasonsRepository: BackofficeSeasonsRepository) {}

  async execute(): Promise<BackofficeSeasonSummary | null> {
    const seasons = await this.backofficeSeasonsRepository.findAll();

    return seasons.find((season) => season.status === 'ACTIVE') ?? null;
  }
}
