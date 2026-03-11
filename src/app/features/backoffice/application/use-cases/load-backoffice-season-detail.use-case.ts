import { type BackofficeSeasonDetail } from '@features/backoffice/domain/entities/backoffice-season.entity';

import { type BackofficeSeasonsRepository } from '../ports/backoffice-seasons.repository';

export class LoadBackofficeSeasonDetailUseCase {
  constructor(private readonly backofficeSeasonsRepository: BackofficeSeasonsRepository) {}

  async execute(seasonId: string): Promise<BackofficeSeasonDetail | null> {
    return this.backofficeSeasonsRepository.findById(seasonId);
  }
}
