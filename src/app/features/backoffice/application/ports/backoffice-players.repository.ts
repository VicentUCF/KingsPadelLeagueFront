import {
  type BackofficePlayerDetail,
  type BackofficePlayerSummary,
} from '@features/backoffice/domain/entities/backoffice-player.entity';

export abstract class BackofficePlayersRepository {
  abstract findAll(): Promise<readonly BackofficePlayerSummary[]>;
  abstract findById(playerId: string): Promise<BackofficePlayerDetail | null>;
}
