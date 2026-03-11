import { type BackofficePlayerDetail } from '@features/backoffice/domain/entities/backoffice-player.entity';

import { type ChangeStatusBackofficePlayerCommand } from '../commands/backoffice-player.commands';
import { type BackofficePlayersRepository } from '../ports/backoffice-players.repository';

export class ChangeBackofficePlayerStatusUseCase {
  constructor(private readonly backofficePlayersRepository: BackofficePlayersRepository) {}

  async execute(command: ChangeStatusBackofficePlayerCommand): Promise<BackofficePlayerDetail> {
    const currentPlayer = await this.backofficePlayersRepository.findById(command.playerId);

    if (currentPlayer === null) {
      throw new Error('El jugador que intentas actualizar no existe.');
    }

    if (currentPlayer.status !== 'ACTIVE') {
      throw new Error('Solo puedes desactivar jugadores activos.');
    }

    return this.backofficePlayersRepository.changeStatus(command);
  }
}
