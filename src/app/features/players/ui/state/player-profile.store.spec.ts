import { TestBed } from '@angular/core/testing';

import { Player } from '@features/players/domain/entities/player.entity';
import { LOAD_PLAYER_PROFILE_USE_CASE } from '../providers/players.providers';
import { PlayerProfileStore } from './player-profile.store';

function createLoadPlayerProfileUseCaseMock() {
  return {
    execute: jest.fn(),
  };
}

function createPlayerProfile(overrides: Partial<Player> = {}): Player {
  return Object.assign(
    new Player(
      'player-1',
      'vicent-ciscar',
      'Vicent Ciscar',
      'team-1',
      'Kings Of Favar',
      'https://cdn.test/team-logo.svg',
      'https://cdn.test/player-avatar.webp',
      10,
      4,
      'reves',
    ),
    overrides,
  );
}

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

describe('PlayerProfileStore', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('preserves the current player when a forced refresh fails for the same slug', async () => {
    const loadPlayerProfileUseCase = createLoadPlayerProfileUseCaseMock();
    loadPlayerProfileUseCase.execute
      .mockResolvedValueOnce(createPlayerProfile())
      .mockRejectedValueOnce(new Error('boom'));

    TestBed.configureTestingModule({
      providers: [
        PlayerProfileStore,
        {
          provide: LOAD_PLAYER_PROFILE_USE_CASE,
          useValue: loadPlayerProfileUseCase,
        },
      ],
    });

    const store = TestBed.inject(PlayerProfileStore);

    await store.load('vicent-ciscar');
    const previousPlayer = store.player();

    await store.load('vicent-ciscar', true);

    expect(previousPlayer).not.toBeNull();
    expect(store.player()).toEqual(previousPlayer);
    expect(store.currentSlug()).toBe('vicent-ciscar');
    expect(store.resolvedSlug()).toBe('vicent-ciscar');
    expect(store.hasContent()).toBe(true);
    expect(store.errorMessage()).toBe('No hemos podido cargar el perfil del jugador.');
    expect(loadPlayerProfileUseCase.execute).toHaveBeenNthCalledWith(2, 'vicent-ciscar', true);
  });

  it('clears the previous player when the requested slug changes', async () => {
    const loadPlayerProfileUseCase = createLoadPlayerProfileUseCaseMock();
    const deferredPlayer = createDeferred<Player | null>();

    loadPlayerProfileUseCase.execute
      .mockResolvedValueOnce(createPlayerProfile())
      .mockReturnValueOnce(deferredPlayer.promise);

    TestBed.configureTestingModule({
      providers: [
        PlayerProfileStore,
        {
          provide: LOAD_PLAYER_PROFILE_USE_CASE,
          useValue: loadPlayerProfileUseCase,
        },
      ],
    });

    const store = TestBed.inject(PlayerProfileStore);

    await store.load('vicent-ciscar');

    const nextLoad = store.load('alex-pla');

    expect(store.currentSlug()).toBe('alex-pla');
    expect(store.player()).toBeNull();
    expect(store.resolvedSlug()).toBeNull();
    expect(store.hasContent()).toBe(false);

    deferredPlayer.resolve(
      createPlayerProfile({
        id: 'player-2',
        slug: 'alex-pla',
        displayName: 'Alex Pla',
        teamId: 'pending-team-assignment',
        teamName: 'Sin equipo todavía',
        teamLogoPath: null,
        avatarPath: null,
        wonMatchesCount: 0,
        lostMatchesCount: 0,
        side: 'ambas',
        playedMatchesCount: 0,
      }),
    );

    await nextLoad;

    expect(store.player()?.displayName).toBe('Alex Pla');
    expect(store.resolvedSlug()).toBe('alex-pla');
    expect(store.errorMessage()).toBeNull();
  });
});
