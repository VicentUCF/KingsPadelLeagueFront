import { type LeagueMatchday } from '@features/league-home/domain/entities/league-matchday';

import { toLeagueMatchdaysPageViewModel } from './league-matchdays.viewmodel';

describe('toLeagueMatchdaysPageViewModel', () => {
  it('maps badges, links and current-matchday presentation for the listing page', () => {
    const viewModel = toLeagueMatchdaysPageViewModel([
      createMatchday('matchday-2', 2, 'completed', 'Magic City'),
      createMatchday('matchday-3', 3, 'current', 'House Perez'),
    ]);

    expect(viewModel.publishedMatchdaysLabel).toBe('2 jornadas publicadas');
    expect(viewModel.currentMatchdayLabel).toBe('Jornada en foco: Jornada 3');
    expect(viewModel.matchdays[1]).toMatchObject({
      id: 'matchday-3',
      statusLabel: 'En juego',
      detailLink: '/jornadas/matchday-3',
      detailLinkLabel: 'Ver jornada 3',
      isCurrent: true,
      byeDescription: 'Descansa House Perez',
    });
    expect(viewModel.matchdays[1]?.encounters[0]?.homeTeam).toMatchObject({
      teamName: 'Kings of Favar',
      teamLink: '/equipos/kings-of-favar',
    });
  });
});

function createMatchday(
  id: string,
  number: number,
  status: LeagueMatchday['status'],
  byeTeamName: string,
): LeagueMatchday {
  return {
    id,
    number,
    label: `Jornada ${number}`,
    status,
    dateLabel: `Domingo ${number}`,
    byeTeam: {
      teamId: 'bye-team',
      teamSlug: 'bye-team',
      teamName: byeTeamName,
    },
    encounters: [
      {
        id: `${id}-encounter`,
        homeTeamId: 'kings-of-favar',
        homeTeamSlug: 'kings-of-favar',
        homeTeamName: 'Kings of Favar',
        awayTeamId: 'barbaridad',
        awayTeamSlug: 'barbaridad',
        awayTeamName: 'Barbaridad',
        homeScore: 3,
        awayScore: 2,
        status,
        scheduledAtLabel: 'Domingo 18:00',
        pairResults: [],
      },
    ],
  };
}
