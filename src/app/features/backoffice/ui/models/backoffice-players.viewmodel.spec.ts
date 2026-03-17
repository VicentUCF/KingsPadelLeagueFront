import type { BackofficePlayer } from '@features/backoffice/domain/entities/backoffice-player';

import { toBackofficePlayerCardViewModel } from './backoffice-players.viewmodel';

describe('backoffice-players.viewmodel', () => {
  it('drops placeholder avatars from the backoffice player cards', () => {
    const player: BackofficePlayer = {
      id: 'player-1',
      firstName: 'Alex',
      lastName: 'Soler',
      email: 'alex@example.com',
      profileImage: 'https://placeholder.com/images/player1.png',
      isPresident: false,
      teamId: 'team-1',
      value: 0,
      wonGames: 2,
      lostGames: 1,
      preferredPosition: 'both',
      description: 'Description',
    };

    const viewModel = toBackofficePlayerCardViewModel(player, 'Kings Of Favar');

    expect(viewModel.avatarPath).toBeUndefined();
  });

  it('hides linked player emails when the viewer is a player', () => {
    const player: BackofficePlayer = {
      id: 'player-1',
      firstName: 'Alex',
      lastName: 'Soler',
      email: 'alex@example.com',
      profileImage: null,
      isPresident: false,
      teamId: 'team-1',
      value: 0,
      wonGames: 2,
      lostGames: 1,
      preferredPosition: 'both',
      description: 'Description',
    };

    const viewModel = toBackofficePlayerCardViewModel(player, 'Kings Of Favar', {
      showLinkedEmail: false,
    });

    expect(viewModel.userLinkageLabel).toBe('Cuenta vinculada');
  });
});
