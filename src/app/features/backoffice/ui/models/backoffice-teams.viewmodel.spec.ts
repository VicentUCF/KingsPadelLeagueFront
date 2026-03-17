import type { BackofficeTeam } from '@features/backoffice/domain/entities/backoffice-team';

import { toBackofficeTeamCardViewModel } from './backoffice-teams.viewmodel';

describe('backoffice-teams.viewmodel', () => {
  it('resolves local branding using the team name even when the id is a UUID', () => {
    const team: BackofficeTeam = {
      id: 'b3d9d283-3425-4594-b77d-490d25a9011a',
      name: 'Kings Of Favar',
      description: 'Description',
      secondaryDescription: 'Secondary description',
      logo: 'https://placeholder.com/logos/team1.png',
    };

    const viewModel = toBackofficeTeamCardViewModel(team, 4, 'Vicent Ciscar');

    expect(viewModel.logoPath).toBe('/teams_logos/Kings_of_Favar_no_bg.png');
    expect(viewModel.primaryColor).toBe('#f3c84b');
    expect(viewModel.secondaryColor).toBe('#24150b');
  });
});
