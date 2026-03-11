import { type BackofficePlayerDetail } from '@features/backoffice/domain/entities/backoffice-player.entity';

import { type BackofficePlayersRepository } from '../ports/backoffice-players.repository';

export class LoadBackofficePlayerDetailUseCase {
  constructor(private readonly backofficePlayersRepository: BackofficePlayersRepository) {}

  async execute(playerId: string): Promise<BackofficePlayerDetail | null> {
    return this.backofficePlayersRepository.findById(playerId);
  }
}
