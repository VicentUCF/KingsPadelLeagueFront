import type { BackofficeSeasonTeamScore } from '@features/backoffice/domain/entities/backoffice-season-team-score';

export abstract class BackofficeSeasonTeamScoresRepository {
  abstract loadBySeasonId(seasonId: string): Promise<readonly BackofficeSeasonTeamScore[]>;
}
