import { type LeagueMatchday } from '@features/league-home/domain/entities/league-matchday';
import { type LeagueHomeSnapshot } from '@features/league-home/domain/entities/league-home-snapshot';

export abstract class LeagueHomeRepository {
  abstract loadSnapshot(): Promise<LeagueHomeSnapshot>;
  abstract loadMatchdays(): Promise<readonly LeagueMatchday[]>;
}
