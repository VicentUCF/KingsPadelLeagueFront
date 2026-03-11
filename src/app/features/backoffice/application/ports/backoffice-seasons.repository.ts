import {
  type BackofficeSeasonDetail,
  type BackofficeSeasonSummary,
} from '@features/backoffice/domain/entities/backoffice-season.entity';
import {
  type ChangeStatusBackofficeSeasonCommand,
  type CreateBackofficeSeasonCommand,
  type UpdateBackofficeSeasonCommand,
} from '../commands/backoffice-season.commands';

export abstract class BackofficeSeasonsRepository {
  abstract findAll(): Promise<readonly BackofficeSeasonSummary[]>;
  abstract findById(seasonId: string): Promise<BackofficeSeasonDetail | null>;

  async create(_command: CreateBackofficeSeasonCommand): Promise<BackofficeSeasonDetail> {
    throw new Error('CreateBackofficeSeasonCommand not implemented.');
  }

  async update(_command: UpdateBackofficeSeasonCommand): Promise<BackofficeSeasonDetail> {
    throw new Error('UpdateBackofficeSeasonCommand not implemented.');
  }

  async changeStatus(
    _command: ChangeStatusBackofficeSeasonCommand,
  ): Promise<BackofficeSeasonDetail> {
    throw new Error('ChangeStatusBackofficeSeasonCommand not implemented.');
  }
}
