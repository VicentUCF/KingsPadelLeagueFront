import {
  type BackofficeRosterDetail,
  type BackofficeRosterSummary,
} from '@features/backoffice/domain/entities/backoffice-roster.entity';

export abstract class BackofficeRostersRepository {
  abstract findAll(): Promise<readonly BackofficeRosterSummary[]>;
  abstract findById(rosterId: string): Promise<BackofficeRosterDetail | null>;
}
