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
      logoPath: '/teams_logos/titanics_no_bg.webp',
      palette: createPalette(),
      pointsLabel: '11 pts',
      playedMatchesLabel: '2',
      gameDifferenceLabel: '+12',
      teamLink: '/equipos/house-navarro',
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
      palette: createPalette(),
      pointsLabel: '9 pts',
      playedMatchesLabel: '2',
      gameDifferenceLabel: '+8',
      teamLink: '/equipos/house-torres',
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
      palette: createPalette(),
      pointsLabel: '3 pts',
      playedMatchesLabel: '2',
      gameDifferenceLabel: '-7',
      teamLink: '/equipos/house-perez',
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

    const table = screen.getByRole('table', { name: /Clasificación actual de KingsPadelLeague/i });
    const renderedRows = within(table).getAllByRole('row');

    expect(renderedRows).toHaveLength(4);
    expect(
      within(renderedRows[1]!).getByRole('rowheader', { name: /House Navarro/i }),
    ).toBeVisible();
    expect(container.querySelector('.team-badge__crest-image')).toHaveAttribute(
      'src',
      '/teams_logos/titanics_no_bg.webp',
    );
    expect(screen.getByRole('link', { name: /House Navarro/i })).toHaveAttribute(
      'href',
      '/equipos/house-navarro',
    );
    expect(screen.getByText('-7')).toBeVisible();
  });

  it('renders stacked cards on narrow viewports', async () => {
    const restoreMatchMedia = mockMatchMedia(false);

    try {
      await render(StandingsTableComponent, {
        providers: [provideRouter([])],
        inputs: {
          rows,
        },
      });

      expect(screen.queryByRole('table', { name: /Clasificación actual/i })).toBeNull();
      expect(screen.getByRole('list', { name: /Clasificación actual/i })).toBeVisible();
      expect(screen.getAllByRole('listitem')).toHaveLength(3);
      expect(screen.getByRole('link', { name: /House Navarro/i })).toHaveAttribute(
        'href',
        '/equipos/house-navarro',
      );
      expect(screen.getByText('11 pts')).toBeVisible();
    } finally {
      restoreMatchMedia();
    }
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

function createPalette() {
  return {
    primary: '#f3c84b',
    accent: '#f9e9a7',
    surface: '#24150b',
    glow: 'rgb(243 200 75 / 0.46)',
    contrast: '#0d0904',
  };
}

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
