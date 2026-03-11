import { render, screen } from '@testing-library/angular';

import { MatchCardComponent } from './match-card.component';

describe('MatchCardComponent', () => {
  it('renders the next matchup summary', async () => {
    await render(MatchCardComponent, {
      inputs: {
        homeTeamName: 'House Navarro',
        awayTeamName: 'House Torres',
        scheduledAtLabel: 'Domingo 18:00',
      },
    });

    expect(screen.getByRole('heading', { name: /House Navarro vs House Torres/i })).toBeVisible();
    expect(screen.getByText('Domingo 18:00')).toBeVisible();
  });
});
