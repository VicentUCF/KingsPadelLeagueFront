import { type BackofficeTeamStatus } from '../../domain/entities/backoffice-team.entity';

export interface CreateBackofficeTeamCommand {
  readonly name: string;
  readonly shortName: string;
  readonly presidentName: string;
  readonly primaryColor: string;
  readonly secondaryColor: string;
}

export interface UpdateBackofficeTeamCommand extends CreateBackofficeTeamCommand {
  readonly id: string;
}

export interface ChangeStatusBackofficeTeamCommand {
  readonly teamId: string;
  readonly targetStatus: Exclude<BackofficeTeamStatus, 'ACTIVE'>;
}
