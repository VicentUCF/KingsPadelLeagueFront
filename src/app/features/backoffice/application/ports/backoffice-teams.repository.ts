import {
  type BackofficeTeamDetail,
  type BackofficeTeamSummary,
} from '@features/backoffice/domain/entities/backoffice-team.entity';
import {
  type ChangeStatusBackofficeTeamCommand,
  type CreateBackofficeTeamCommand,
  type UpdateBackofficeTeamCommand,
} from '../commands/backoffice-team.commands';

export abstract class BackofficeTeamsRepository {
  abstract findAll(): Promise<readonly BackofficeTeamSummary[]>;
  abstract findById(teamId: string): Promise<BackofficeTeamDetail | null>;

  async create(_command: CreateBackofficeTeamCommand): Promise<BackofficeTeamDetail> {
    throw new Error('CreateBackofficeTeamCommand not implemented.');
  }

  async update(_command: UpdateBackofficeTeamCommand): Promise<BackofficeTeamDetail> {
    throw new Error('UpdateBackofficeTeamCommand not implemented.');
  }

  async changeStatus(_command: ChangeStatusBackofficeTeamCommand): Promise<BackofficeTeamDetail> {
    throw new Error('ChangeStatusBackofficeTeamCommand not implemented.');
  }
}
