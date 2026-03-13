import type { BackofficeSeason } from '@features/backoffice/domain/entities/backoffice-season';

export abstract class BackofficeSeasonsRepository {
  abstract loadAll(): Promise<readonly BackofficeSeason[]>;
}
