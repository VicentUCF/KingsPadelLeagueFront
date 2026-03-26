import type { BackofficeSeasonPlayerScore } from '@features/backoffice/domain/entities/backoffice-season-player-score';

export abstract class BackofficeSeasonPlayerScoresRepository {
  abstract loadBySeasonId(seasonId: string): Promise<readonly BackofficeSeasonPlayerScore[]>;
}
