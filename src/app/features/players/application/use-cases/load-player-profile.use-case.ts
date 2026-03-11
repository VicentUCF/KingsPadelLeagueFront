import { type Player } from '@features/players/domain/entities/player.entity';

import { type PlayersRepository } from '../ports/players.repository';

export class LoadPlayerProfileUseCase {
  constructor(private readonly playersRepository: PlayersRepository) {}

  async execute(slug: string): Promise<Player | null> {
    return this.playersRepository.findBySlug(slug);
  }
}
