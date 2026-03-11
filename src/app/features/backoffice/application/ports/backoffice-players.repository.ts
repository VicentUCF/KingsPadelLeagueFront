import {
  type BackofficePlayerDetail,
  type BackofficePlayerSummary,
} from '@features/backoffice/domain/entities/backoffice-player.entity';
import {
  type ChangeStatusBackofficePlayerCommand,
  type CreateBackofficePlayerCommand,
  type UpdateBackofficePlayerCommand,
} from '../commands/backoffice-player.commands';

export abstract class BackofficePlayersRepository {
  abstract findAll(): Promise<readonly BackofficePlayerSummary[]>;
  abstract findById(playerId: string): Promise<BackofficePlayerDetail | null>;

  async create(_command: CreateBackofficePlayerCommand): Promise<BackofficePlayerDetail> {
    throw new Error('CreateBackofficePlayerCommand not implemented.');
  }

  async update(_command: UpdateBackofficePlayerCommand): Promise<BackofficePlayerDetail> {
    throw new Error('UpdateBackofficePlayerCommand not implemented.');
  }

  async changeStatus(
    _command: ChangeStatusBackofficePlayerCommand,
  ): Promise<BackofficePlayerDetail> {
    throw new Error('ChangeStatusBackofficePlayerCommand not implemented.');
  }
}
