import { render, screen, within } from '@testing-library/angular';

import { StandingsTableComponent } from './standings-table.component';

describe('StandingsTableComponent', () => {
  it('renders rows with the leader at the top of the table', async () => {
    await render(StandingsTableComponent, {
      inputs: {
        rows: [
          {
            teamId: 'house-navarro',
            rank: 1,
            teamName: 'House Navarro',
            pointsLabel: '11 pts',
            playedMatchesLabel: '2',
            gameDifferenceLabel: '+12',
            isLeader: true,
          },
          {
            teamId: 'house-torres',
            rank: 2,
            teamName: 'House Torres',
            pointsLabel: '9 pts',
            playedMatchesLabel: '2',
            gameDifferenceLabel: '+8',
            isLeader: false,
          },
        ],
      },
    });

    const table = screen.getByRole('table', { name: /Clasificación actual/i });
    const rows = within(table).getAllByRole('row');

    expect(rows).toHaveLength(3);
    expect(within(rows[1]!).getByRole('rowheader', { name: 'House Navarro' })).toBeVisible();
  });
});
