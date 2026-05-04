import { provideRouter } from '@angular/router';
import { render, screen, within } from '@testing-library/angular';
import { axe } from 'jest-axe';

import { StandingsDetailTableComponent } from './standings-detail-table.component';

describe('StandingsDetailTableComponent', () => {
  const rows = [
    {
      teamId: 'house-navarro',
      rank: 1,
      teamName: 'House Navarro',
      monogram: 'HN',
      logoPath: '/teams_logos/titanics_no_bg.webp',
      teamLink: '/equipos/house-navarro',
      pointsLabel: '6 pts',
      playedLabel: '2',
      wonLabel: '2',
      lostLabel: '0',
      isLeader: true,
      isLast: false,
      rankTone: 'leader' as const,
    },
    {
      teamId: 'house-torres',
      rank: 2,
      teamName: 'House Torres',
      monogram: 'HT',
      logoPath: null,
      teamLink: '/equipos/house-torres',
      pointsLabel: '3 pts',
      playedLabel: '2',
      wonLabel: '1',
      lostLabel: '1',
      isLeader: false,
      isLast: false,
      rankTone: 'podium' as const,
    },
    {
      teamId: 'house-perez',
      rank: 3,
      teamName: 'House Perez',
      monogram: 'HP',
      logoPath: null,
      teamLink: '/equipos/house-perez',
      pointsLabel: '0 pts',
      playedLabel: '2',
      wonLabel: '0',
      lostLabel: '2',
      isLeader: false,
      isLast: true,
      rankTone: 'standard' as const,
    },
  ];

  it('renders the desktop standings table with semantic row headers', async () => {
    await render(StandingsDetailTableComponent, {
      providers: [provideRouter([])],
      inputs: {
        rows,
      },
    });

    const table = screen.getByRole('table', { name: /Clasificación oficial de KingsPadelLeague/i });
    const renderedRows = within(table).getAllByRole('row');

    expect(renderedRows).toHaveLength(4);
    expect(
      within(renderedRows[1]!).getByRole('rowheader', { name: /House Navarro/i }),
    ).toBeVisible();
    expect(screen.queryByRole('columnheader', { name: 'JG' })).toBeNull();
    expect(screen.queryByRole('columnheader', { name: 'JP' })).toBeNull();
    expect(screen.queryByRole('columnheader', { name: 'DIF' })).toBeNull();
    expect(screen.getByRole('columnheader', { name: 'PTS' })).toBeVisible();
    expect(screen.getByRole('link', { name: /House Navarro/i })).toHaveAttribute(
      'href',
      '/equipos/house-navarro',
    );
  });

  it('renders compact mobile cards with J, G, P and PTS metrics', async () => {
    const restoreMatchMedia = mockMatchMedia(false);

    try {
      await render(StandingsDetailTableComponent, {
        providers: [provideRouter([])],
        inputs: {
          rows,
        },
      });

      expect(screen.queryByRole('table', { name: /Clasificación oficial/i })).toBeNull();

      const list = screen.getByRole('list', { name: /Clasificación oficial/i });
      const [firstCard] = within(list).getAllByRole('listitem');

      expect(within(list).getAllByRole('listitem')).toHaveLength(3);
      expect(within(firstCard!).getByRole('link', { name: /House Navarro/i })).toHaveAttribute(
        'href',
        '/equipos/house-navarro',
      );
      expect(within(firstCard!).getByText('J')).toBeVisible();
      expect(within(firstCard!).getByText('G')).toBeVisible();
      expect(within(firstCard!).getByText('P')).toBeVisible();
      expect(within(firstCard!).getByText('PTS')).toBeVisible();
      expect(within(firstCard!).getByText('6 pts')).toBeVisible();
      expect(screen.queryByText('JG')).toBeNull();
      expect(screen.queryByText('JP')).toBeNull();
      expect(screen.queryByText('DIF')).toBeNull();
    } finally {
      restoreMatchMedia();
    }
  });

  it('has no accessibility violations', async () => {
    const { container } = await render(StandingsDetailTableComponent, {
      providers: [provideRouter([])],
      inputs: {
        rows,
      },
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});

function mockMatchMedia(matches: boolean) {
  const originalMatchMedia = window.matchMedia;

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: jest.fn().mockImplementation(() => ({
      matches,
      media: '(min-width: 48rem)',
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  return () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: originalMatchMedia,
    });
  };
}
