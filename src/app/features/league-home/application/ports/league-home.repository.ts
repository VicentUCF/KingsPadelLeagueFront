import { type LeagueHomeSnapshot } from '@features/league-home/domain/entities/league-home-snapshot';

export abstract class LeagueHomeRepository {
  abstract loadSnapshot(): Promise<LeagueHomeSnapshot>;
}
