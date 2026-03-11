import { type BackofficeSeasonDetail } from '@features/backoffice/domain/entities/backoffice-season.entity';

import { type CreateBackofficeSeasonCommand } from '../commands/backoffice-season.commands';
import { type BackofficeSeasonsRepository } from '../ports/backoffice-seasons.repository';
import {
  assertCanUseActiveSeasonStatus,
  assertSeasonCalendar,
} from './backoffice-season-write.validation';

export class CreateBackofficeSeasonUseCase {
  constructor(private readonly backofficeSeasonsRepository: BackofficeSeasonsRepository) {}

  async execute(command: CreateBackofficeSeasonCommand): Promise<BackofficeSeasonDetail> {
    const normalizedStatus = command.status ?? 'DRAFT';

    assertSeasonCalendar(command);
    assertCanUseActiveSeasonStatus(
      await this.backofficeSeasonsRepository.findAll(),
      null,
      normalizedStatus,
    );

    return this.backofficeSeasonsRepository.create({
      ...command,
      status: normalizedStatus,
    });
  }
}
