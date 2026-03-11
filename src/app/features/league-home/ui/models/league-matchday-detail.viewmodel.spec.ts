import { type LeagueMatchday } from '@features/league-home/domain/entities/league-matchday';

import { toLeagueMatchdayDetailPageViewModel } from './league-matchday-detail.viewmodel';

describe('toLeagueMatchdayDetailPageViewModel', () => {
  it('maps the selected matchday with global score and pair breakdown', () => {
    const viewModel = toLeagueMatchdayDetailPageViewModel(
      [
        {
          id: 'matchday-3',
          number: 3,
          label: 'Jornada 3',
          status: 'current',
          dateLabel: 'Domingo 15 de marzo',
          byeTeam: {
            teamId: 'magic-city',
            teamSlug: 'magic-city',
            teamName: 'Magic City',
          },
          encounters: [
            {
              id: 'matchday-3-kings-of-favar-barbaridad',
              homeTeamId: 'kings-of-favar',
              homeTeamSlug: 'kings-of-favar',
              homeTeamName: 'Kings of Favar',
              awayTeamId: 'barbaridad',
              awayTeamSlug: 'barbaridad',
              awayTeamName: 'Barbaridad',
              homeScore: 1,
              awayScore: 0,
              status: 'current',
              scheduledAtIso: '2026-03-15T17:00:00.000Z',
              scheduledAtLabel: 'Domingo 18:00',
              pairResults: [
                {
                  id: 'pair-1',
                  label: 'Partido 1',
                  homePair: {
                    label: 'Pareja 1',
                    players: [
                      {
                        id: 'kof-1',
                        displayName: 'Alejandro Mena',
                        roleLabel: 'Drive',
                      },
                      {
                        id: 'kof-2',
                        displayName: 'Raul Pizarro',
                        roleLabel: 'Revés',
                      },
                    ],
                  },
                  awayPair: {
                    label: 'Pareja 1',
                    players: [
                      {
                        id: 'bar-1',
                        displayName: 'Ivan Soto',
                        roleLabel: 'Drive',
                      },
                      {
                        id: 'bar-2',
                        displayName: 'Nico Prieto',
                        roleLabel: 'Revés',
                      },
                    ],
                  },
                  homeScoreLabel: '6-4 6-3',
                  awayScoreLabel: '4-6 3-6',
                  winnerTeamId: 'kings-of-favar',
                },
              ],
            },
          ],
        },
      ],
      'matchday-3',
    );

    expect(viewModel).not.toBeNull();
    expect(viewModel).toMatchObject({
      title: 'Jornada 3',
      statusLabel: 'En juego',
      byeTeam: {
        description: 'Jornada 3 · Descansa',
      },
    });
    expect(viewModel?.encounters[0]).toMatchObject({
      scoreLabel: '1 - 0',
      metaLabel: 'En juego · Domingo 18:00',
    });
    expect(viewModel?.encounters[0]?.pairResults[0]).toMatchObject({
      label: 'Partido 1',
      homeScoreLabel: '6-4 6-3',
      awayScoreLabel: '4-6 3-6',
      homePair: {
        label: 'Pareja 1',
      },
      awayPair: {
        label: 'Pareja 1',
      },
      winnerTeamName: 'Kings of Favar',
      winnerSide: 'home',
    });
  });

  it('returns null when the requested matchday does not exist', () => {
    const viewModel = toLeagueMatchdayDetailPageViewModel(createMatchdays(), 'unknown-matchday');

    expect(viewModel).toBeNull();
  });
});

function createMatchdays(): readonly LeagueMatchday[] {
  return [
    {
      id: 'matchday-1',
      number: 1,
      label: 'Jornada 1',
      status: 'completed',
      dateLabel: 'Domingo 1 de marzo',
      byeTeam: null,
      encounters: [],
    },
  ];
}
