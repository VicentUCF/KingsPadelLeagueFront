import { type BackofficePlayerDetail } from '@features/backoffice/domain/entities/backoffice-player.entity';

import { type UpdateBackofficePlayerCommand } from '../commands/backoffice-player.commands';
import { type BackofficePlayersRepository } from '../ports/backoffice-players.repository';

export class UpdateBackofficePlayerUseCase {
  constructor(private readonly backofficePlayersRepository: BackofficePlayersRepository) {}

  async execute(command: UpdateBackofficePlayerCommand): Promise<BackofficePlayerDetail> {
    return this.backofficePlayersRepository.update(command);
  }
}
