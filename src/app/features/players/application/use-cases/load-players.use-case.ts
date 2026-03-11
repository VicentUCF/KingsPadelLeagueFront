import { type Player } from '@features/players/domain/entities/player.entity';

import { type PlayersRepository } from '../ports/players.repository';

export class LoadPlayersUseCase {
  constructor(private readonly playersRepository: PlayersRepository) {}

  async execute(): Promise<readonly Player[]> {
    return this.playersRepository.findAll();
  }
}
