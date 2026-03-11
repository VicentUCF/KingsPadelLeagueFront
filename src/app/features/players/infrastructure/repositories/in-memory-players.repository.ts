import { Injectable } from '@angular/core';

import { PlayersRepository } from '@features/players/application/ports/players.repository';
import { Player } from '@features/players/domain/entities/player.entity';

import { PLAYER_SEED } from './in-memory-players.seed';

@Injectable()
export class InMemoryPlayersRepository extends PlayersRepository {
  private readonly players = PLAYER_SEED.map(
    (player) =>
      new Player(
        player.id,
        player.slug,
        player.displayName,
        player.teamId,
        player.teamName,
        player.teamLogoPath,
        player.avatarPath,
        player.wonMatchesCount,
        player.lostMatchesCount,
        player.side,
      ),
  );

  override async findAll(): Promise<readonly Player[]> {
    return this.players;
  }

  override async findBySlug(slug: string): Promise<Player | null> {
    return this.players.find((player) => player.slug === slug) ?? null;
  }
}
