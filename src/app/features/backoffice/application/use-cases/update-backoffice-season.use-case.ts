import { type BackofficeSeasonDetail } from '@features/backoffice/domain/entities/backoffice-season.entity';

import { type UpdateBackofficeSeasonCommand } from '../commands/backoffice-season.commands';
import { type BackofficeSeasonsRepository } from '../ports/backoffice-seasons.repository';
import {
  assertCanUseActiveSeasonStatus,
  assertSeasonCalendar,
} from './backoffice-season-write.validation';

export class UpdateBackofficeSeasonUseCase {
  constructor(private readonly backofficeSeasonsRepository: BackofficeSeasonsRepository) {}

  async execute(command: UpdateBackofficeSeasonCommand): Promise<BackofficeSeasonDetail> {
    assertSeasonCalendar(command);
    assertCanUseActiveSeasonStatus(
      await this.backofficeSeasonsRepository.findAll(),
      command.id,
      command.status,
    );

    return this.backofficeSeasonsRepository.update(command);
  }
}
