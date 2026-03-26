import type {
  BackofficePlayersRepository,
  BackofficePlayerUpdate,
} from '@features/backoffice/application/ports/backoffice-players.repository';

export class UpdateBackofficePlayerUseCase {
  constructor(private readonly repository: BackofficePlayersRepository) {}

  execute(id: string, input: BackofficePlayerUpdate): Promise<void> {
    return this.repository.update(id, input);
  }
}
