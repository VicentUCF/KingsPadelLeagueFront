import { render, screen, within } from '@testing-library/angular';
import { axe } from 'jest-axe';

import { StandingsTableComponent } from './standings-table.component';

describe('StandingsTableComponent', () => {
  const rows = [
    {
      teamId: 'house-navarro',
      rank: 1,
      teamName: 'House Navarro',
      pointsLabel: '11 pts',
      playedMatchesLabel: '2',
      gameDifferenceLabel: '+12',
      isLeader: true,
      rankTone: 'leader' as const,
      gameDifferenceTone: 'positive' as const,
    },
    {
      teamId: 'house-torres',
      rank: 2,
      teamName: 'House Torres',
      pointsLabel: '9 pts',
      playedMatchesLabel: '2',
      gameDifferenceLabel: '+8',
      isLeader: false,
      rankTone: 'podium' as const,
      gameDifferenceTone: 'positive' as const,
    },
    {
      teamId: 'house-perez',
      rank: 5,
      teamName: 'House Perez',
      pointsLabel: '3 pts',
      playedMatchesLabel: '2',
      gameDifferenceLabel: '-7',
      isLeader: false,
      rankTone: 'standard' as const,
      gameDifferenceTone: 'negative' as const,
    },
  ];

  it('renders leaderboard badges and preserves row header semantics', async () => {
    await render(StandingsTableComponent, {
      inputs: {
        rows,
      },
    });

    const table = screen.getByRole('table', { name: /Clasificación actual/i });
    const renderedRows = within(table).getAllByRole('row');

    expect(renderedRows).toHaveLength(4);
    expect(
      within(renderedRows[1]!).getByRole('rowheader', { name: /House Navarro/i }),
    ).toBeVisible();
    expect(screen.getByText('Lider actual')).toBeVisible();
    expect(screen.getByText('Zona podium')).toBeVisible();
    expect(screen.getByText('-7')).toBeVisible();
  });

  it('has no accessibility violations', async () => {
    const { container } = await render(StandingsTableComponent, {
      inputs: {
        rows,
      },
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});
