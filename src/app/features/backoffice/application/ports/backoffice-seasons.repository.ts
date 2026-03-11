import {
  type BackofficeSeasonDetail,
  type BackofficeSeasonSummary,
} from '@features/backoffice/domain/entities/backoffice-season.entity';

export abstract class BackofficeSeasonsRepository {
  abstract findAll(): Promise<readonly BackofficeSeasonSummary[]>;
  abstract findById(seasonId: string): Promise<BackofficeSeasonDetail | null>;
}
