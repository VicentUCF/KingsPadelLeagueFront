import type { BackofficePlayer } from '@features/backoffice/domain/entities/backoffice-player';
import { type BackofficePlayersRepository } from '@features/backoffice/application/ports/backoffice-players.repository';

export class LoadBackofficePlayersUseCase {
  constructor(private readonly repository: BackofficePlayersRepository) {}

  execute(): Promise<readonly BackofficePlayer[]> {
    return this.repository.loadAll();
  }
}
