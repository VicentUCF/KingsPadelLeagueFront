import type { BackofficeSeasonPlayerScore } from '@features/backoffice/domain/entities/backoffice-season-player-score';
import { type BackofficeSeasonPlayerScoresRepository } from '@features/backoffice/application/ports/backoffice-season-player-scores.repository';

export class LoadBackofficeSeasonPlayerScoresUseCase {
  constructor(private readonly repository: BackofficeSeasonPlayerScoresRepository) {}

  execute(seasonId: string): Promise<readonly BackofficeSeasonPlayerScore[]> {
    return this.repository.loadBySeasonId(seasonId);
  }
}
