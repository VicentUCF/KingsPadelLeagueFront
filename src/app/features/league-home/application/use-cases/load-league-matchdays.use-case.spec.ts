import { type LeagueMatchday } from '@features/league-home/domain/entities/league-matchday';
import { type LeagueHomeSnapshot } from '@features/league-home/domain/entities/league-home-snapshot';

import { LeagueHomeRepository } from '../ports/league-home.repository';
import { LoadLeagueMatchdaysUseCase } from './load-league-matchdays.use-case';

class LeagueHomeRepositoryStub extends LeagueHomeRepository {
  override async loadSnapshot(): Promise<LeagueHomeSnapshot> {
    throw new Error('Not implemented in this test.');
  }

  override async loadMatchdays(): Promise<readonly LeagueMatchday[]> {
    return [
      createMatchday('matchday-4', 4, 'upcoming', null),
      createMatchday('matchday-2', 2, 'completed', 'magic-city'),
      createMatchday('matchday-3', 3, 'current', 'house-perez'),
    ];
  }
}

describe('LoadLeagueMatchdaysUseCase', () => {
  it('sorts matchdays by number and preserves status and bye metadata', async () => {
    const useCase = new LoadLeagueMatchdaysUseCase(new LeagueHomeRepositoryStub());

    const result = await useCase.execute();

    expect(result.map((matchday) => `${matchday.number}-${matchday.status}`)).toEqual([
      '2-completed',
      '3-current',
      '4-upcoming',
    ]);
    expect(result[0]?.byeTeam?.teamId).toBe('magic-city');
    expect(result[1]?.byeTeam?.teamId).toBe('house-perez');
    expect(result[2]?.byeTeam).toBeNull();
  });
});

function createMatchday(
  id: string,
  number: number,
  status: LeagueMatchday['status'],
  byeTeamId: string | null,
): LeagueMatchday {
  return {
    id,
    number,
    label: `Jornada ${number}`,
    status,
    dateLabel: `Domingo ${number}`,
    encounters: [],
    byeTeam: byeTeamId
      ? {
          teamId: byeTeamId,
          teamSlug: byeTeamId,
          teamName: byeTeamId,
        }
      : null,
  };
}
