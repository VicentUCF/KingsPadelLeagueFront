import { type LeagueMatchday } from '@features/league-home/domain/entities/league-matchday';

import { type LeagueHomeRepository } from '../ports/league-home.repository';

export class LoadLeagueMatchdaysUseCase {
  constructor(private readonly leagueHomeRepository: LeagueHomeRepository) {}

  async execute(): Promise<readonly LeagueMatchday[]> {
    const matchdays = await this.leagueHomeRepository.loadMatchdays();

    return [...matchdays].sort((leftMatchday, rightMatchday) => {
      return leftMatchday.number - rightMatchday.number;
    });
  }
}
