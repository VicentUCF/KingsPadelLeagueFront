import type { BackofficeMatchday } from '@features/backoffice/domain/entities/backoffice-matchday';

export interface CreateBackofficeMatchdayInput {
  readonly name: string;
  readonly scheduledAt: string;
  readonly seasonId: string;
}

export abstract class BackofficeMatchdaysRepository {
  abstract loadAll(): Promise<readonly BackofficeMatchday[]>;
  abstract create(input: CreateBackofficeMatchdayInput): Promise<BackofficeMatchday>;
  abstract start(matchdayId: string): Promise<void>;
  abstract finish(matchdayId: string): Promise<void>;
  abstract createPairMatches(matchdayId: string): Promise<void>;
}
