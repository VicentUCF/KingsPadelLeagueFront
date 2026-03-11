import { type BackofficePlayerDetail } from '@features/backoffice/domain/entities/backoffice-player.entity';

import { type CreateBackofficePlayerCommand } from '../commands/backoffice-player.commands';
import { type BackofficePlayersRepository } from '../ports/backoffice-players.repository';

export class CreateBackofficePlayerUseCase {
  constructor(private readonly backofficePlayersRepository: BackofficePlayersRepository) {}

  async execute(command: CreateBackofficePlayerCommand): Promise<BackofficePlayerDetail> {
    return this.backofficePlayersRepository.create(command);
  }
}
