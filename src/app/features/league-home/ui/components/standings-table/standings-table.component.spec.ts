import { provideRouter } from '@angular/router';
import { render, screen, within } from '@testing-library/angular';
import { axe } from 'jest-axe';

import { StandingsTableComponent } from './standings-table.component';

describe('StandingsTableComponent', () => {
  const rows = [
    {
      teamId: 'house-navarro',
      rank: 1,
      teamName: 'House Navarro',
      monogram: 'HN',
      logoPath: '/teams_logos/titanics_no_bg.png',
      pointsLabel: '11 pts',
      playedMatchesLabel: '2',
      gameDifferenceLabel: '+12',
      teamLink: '/equipos',
      isLeader: true,
      isLast: false,
      rankTone: 'leader' as const,
      gameDifferenceTone: 'positive' as const,
    },
    {
      teamId: 'house-torres',
      rank: 2,
      teamName: 'House Torres',
      monogram: 'HT',
      logoPath: null,
      pointsLabel: '9 pts',
      playedMatchesLabel: '2',
      gameDifferenceLabel: '+8',
      teamLink: '/equipos',
      isLeader: false,
      isLast: false,
      rankTone: 'podium' as const,
      gameDifferenceTone: 'positive' as const,
    },
    {
      teamId: 'house-perez',
      rank: 5,
      teamName: 'House Perez',
      monogram: 'HP',
      logoPath: null,
      pointsLabel: '3 pts',
      playedMatchesLabel: '2',
      gameDifferenceLabel: '-7',
      teamLink: '/equipos',
      isLeader: false,
      isLast: true,
      rankTone: 'standard' as const,
      gameDifferenceTone: 'negative' as const,
    },
  ];

  it('renders leaderboard badges and preserves row header semantics', async () => {
    const { container } = await render(StandingsTableComponent, {
      providers: [provideRouter([])],
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
    expect(container.querySelector('.team-badge__crest-image')).toHaveAttribute(
      'src',
      '/teams_logos/titanics_no_bg.png',
    );
    expect(screen.getByText('-7')).toBeVisible();
  });

  it('has no accessibility violations', async () => {
    const { container } = await render(StandingsTableComponent, {
      providers: [provideRouter([])],
      inputs: {
        rows,
      },
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});
