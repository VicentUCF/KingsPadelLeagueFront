import { type Player } from '@features/players/domain/entities/player.entity';

export abstract class PlayersRepository {
  abstract findAll(forceRefresh?: boolean): Promise<readonly Player[]>;
  abstract findBySlug(slug: string, forceRefresh?: boolean): Promise<Player | null>;
}
