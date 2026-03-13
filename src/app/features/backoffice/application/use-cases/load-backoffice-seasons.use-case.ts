import type { BackofficeSeason } from '@features/backoffice/domain/entities/backoffice-season';
import { type BackofficeSeasonsRepository } from '@features/backoffice/application/ports/backoffice-seasons.repository';

export class LoadBackofficeSeasonsUseCase {
  constructor(private readonly repository: BackofficeSeasonsRepository) {}

  execute(): Promise<readonly BackofficeSeason[]> {
    return this.repository.loadAll();
  }
}
