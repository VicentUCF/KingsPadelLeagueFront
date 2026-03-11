import { type BackofficePlayerSummary } from '@features/backoffice/domain/entities/backoffice-player.entity';

import { type BackofficePlayersRepository } from '../ports/backoffice-players.repository';

export class LoadBackofficePlayersUseCase {
  constructor(private readonly backofficePlayersRepository: BackofficePlayersRepository) {}

  async execute(): Promise<readonly BackofficePlayerSummary[]> {
    const players = await this.backofficePlayersRepository.findAll();

    return [...players].sort((leftPlayer, rightPlayer) => {
      const statusDifference =
        resolveStatusPriority(leftPlayer.status) - resolveStatusPriority(rightPlayer.status);

      if (statusDifference !== 0) {
        return statusDifference;
      }

      return leftPlayer.fullName.localeCompare(rightPlayer.fullName, 'es');
    });
  }
}

function resolveStatusPriority(status: BackofficePlayerSummary['status']): number {
  switch (status) {
    case 'ACTIVE':
      return 0;
    case 'INACTIVE':
      return 1;
  }
}
