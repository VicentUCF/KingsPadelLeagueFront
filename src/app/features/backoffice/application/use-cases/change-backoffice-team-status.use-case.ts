import { type BackofficeTeamDetail } from '@features/backoffice/domain/entities/backoffice-team.entity';

import { type ChangeStatusBackofficeTeamCommand } from '../commands/backoffice-team.commands';
import { type BackofficeTeamsRepository } from '../ports/backoffice-teams.repository';

const ALLOWED_TRANSITIONS = {
  ACTIVE: ['INACTIVE'],
  INACTIVE: ['ARCHIVED'],
  ARCHIVED: [],
} as const;

export class ChangeBackofficeTeamStatusUseCase {
  constructor(private readonly backofficeTeamsRepository: BackofficeTeamsRepository) {}

  async execute(command: ChangeStatusBackofficeTeamCommand): Promise<BackofficeTeamDetail> {
    const currentTeam = await this.backofficeTeamsRepository.findById(command.teamId);

    if (currentTeam === null) {
      throw new Error('El equipo que intentas actualizar no existe.');
    }

    const allowedTargets = ALLOWED_TRANSITIONS[
      currentTeam.status
    ] as readonly ChangeStatusBackofficeTeamCommand['targetStatus'][];

    if (!allowedTargets.includes(command.targetStatus)) {
      throw new Error('La transición de estado de este equipo no está permitida.');
    }

    return this.backofficeTeamsRepository.changeStatus(command);
  }
}
