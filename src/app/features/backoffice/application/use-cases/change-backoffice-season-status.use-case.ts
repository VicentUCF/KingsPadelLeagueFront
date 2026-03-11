import { type BackofficeSeasonDetail } from '@features/backoffice/domain/entities/backoffice-season.entity';
import { type BackofficeSeasonStatus } from '@features/backoffice/domain/entities/backoffice-season-status';

import { type ChangeStatusBackofficeSeasonCommand } from '../commands/backoffice-season.commands';
import { type BackofficeSeasonsRepository } from '../ports/backoffice-seasons.repository';
import { assertCanUseActiveSeasonStatus } from './backoffice-season-write.validation';

const ALLOWED_TRANSITIONS: Record<
  BackofficeSeasonStatus,
  readonly ChangeStatusBackofficeSeasonCommand['targetStatus'][]
> = {
  DRAFT: ['ACTIVE', 'ARCHIVED'],
  ACTIVE: ['FINISHED', 'ARCHIVED'],
  FINISHED: ['ARCHIVED'],
  ARCHIVED: [],
};

export class ChangeBackofficeSeasonStatusUseCase {
  constructor(private readonly backofficeSeasonsRepository: BackofficeSeasonsRepository) {}

  async execute(command: ChangeStatusBackofficeSeasonCommand): Promise<BackofficeSeasonDetail> {
    const currentSeason = await this.backofficeSeasonsRepository.findById(command.seasonId);

    if (currentSeason === null) {
      throw new Error('La season que intentas actualizar no existe.');
    }

    if (!ALLOWED_TRANSITIONS[currentSeason.status].includes(command.targetStatus)) {
      throw new Error('La transición de estado de esta season no está permitida.');
    }

    assertCanUseActiveSeasonStatus(
      await this.backofficeSeasonsRepository.findAll(),
      currentSeason.id,
      command.targetStatus,
    );

    return this.backofficeSeasonsRepository.changeStatus(command);
  }
}
