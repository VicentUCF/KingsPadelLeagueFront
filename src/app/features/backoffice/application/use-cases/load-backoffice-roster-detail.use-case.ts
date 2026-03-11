import { type BackofficeRosterDetail } from '@features/backoffice/domain/entities/backoffice-roster.entity';

import { type BackofficeRostersRepository } from '../ports/backoffice-rosters.repository';

export class LoadBackofficeRosterDetailUseCase {
  constructor(private readonly backofficeRostersRepository: BackofficeRostersRepository) {}

  async execute(rosterId: string): Promise<BackofficeRosterDetail | null> {
    return this.backofficeRostersRepository.findById(rosterId);
  }
}
