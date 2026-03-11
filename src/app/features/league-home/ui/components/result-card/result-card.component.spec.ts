import { render, screen } from '@testing-library/angular';

import { ResultCardComponent } from './result-card.component';

describe('ResultCardComponent', () => {
  it('renders the most recent encounter summary', async () => {
    await render(ResultCardComponent, {
      inputs: {
        result: {
          id: 'result-navarro-torres',
          matchupLabel: 'House Navarro vs House Torres',
          pairOneScoreLabel: '6-4 6-2',
          pairTwoScoreLabel: '4-6 6-3',
          encounterScoreLabel: 'House Navarro 4 — 1 House Torres',
          winnerTeamName: 'House Navarro',
        },
      },
    });

    expect(screen.getByRole('heading', { name: /House Navarro vs House Torres/i })).toBeVisible();
    expect(screen.getByText('6-4 6-2')).toBeVisible();
    expect(screen.getByText(/House Navarro gana el cruce/i)).toBeVisible();
  });
});
