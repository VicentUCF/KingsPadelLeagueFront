import { type PadelMatch } from '@features/matches/domain/entities/padel-match.entity';

export abstract class ScheduledMatchesRepository {
  abstract findScheduled(): Promise<readonly PadelMatch[]>;
}
