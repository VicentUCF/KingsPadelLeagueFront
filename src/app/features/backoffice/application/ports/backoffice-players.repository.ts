import type { BackofficePlayer } from '@features/backoffice/domain/entities/backoffice-player';

export abstract class BackofficePlayersRepository {
  abstract loadAll(): Promise<readonly BackofficePlayer[]>;
}
