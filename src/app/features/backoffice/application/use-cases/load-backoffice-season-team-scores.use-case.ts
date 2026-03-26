import type { BackofficeSeasonTeamScore } from '@features/backoffice/domain/entities/backoffice-season-team-score';
import { type BackofficeSeasonTeamScoresRepository } from '@features/backoffice/application/ports/backoffice-season-team-scores.repository';

export class LoadBackofficeSeasonTeamScoresUseCase {
  constructor(private readonly repository: BackofficeSeasonTeamScoresRepository) {}

  execute(seasonId: string): Promise<readonly BackofficeSeasonTeamScore[]> {
    return this.repository.loadBySeasonId(seasonId);
  }
}
