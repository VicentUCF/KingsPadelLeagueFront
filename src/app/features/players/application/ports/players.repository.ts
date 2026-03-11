import { type Player } from '@features/players/domain/entities/player.entity';

export abstract class PlayersRepository {
  abstract findAll(): Promise<readonly Player[]>;
  abstract findBySlug(slug: string): Promise<Player | null>;
}
