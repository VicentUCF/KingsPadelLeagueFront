import {
  type BackofficeTeamDetail,
  type BackofficeTeamSummary,
} from '@features/backoffice/domain/entities/backoffice-team.entity';

export abstract class BackofficeTeamsRepository {
  abstract findAll(): Promise<readonly BackofficeTeamSummary[]>;
  abstract findById(teamId: string): Promise<BackofficeTeamDetail | null>;
}
