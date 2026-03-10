import { render, screen } from '@testing-library/angular';

import { provideUpcomingMatchesFeature } from '../../providers/upcoming-matches.providers';
import { UpcomingMatchesPageComponent } from './upcoming-matches-page.component';

describe('UpcomingMatchesPageComponent', () => {
  it('renders upcoming matches from the feature provider graph', async () => {
    await render(UpcomingMatchesPageComponent, {
      providers: [provideUpcomingMatchesFeature()],
    });

    expect(await screen.findByRole('heading', { name: /upcoming padel matches/i })).toBeVisible();
    expect(await screen.findByText('2 players missing')).toBeVisible();
    expect(screen.getByText('4/4 players confirmed')).toBeVisible();
  });
});
