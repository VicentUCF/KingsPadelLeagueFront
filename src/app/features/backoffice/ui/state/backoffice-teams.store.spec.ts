import { TestBed } from '@angular/core/testing';

import type { BackofficeTeam } from '@features/backoffice/domain/entities/backoffice-team';
import { LOAD_BACKOFFICE_TEAMS_USE_CASE } from '../providers/backoffice.providers';
import { BackofficeTeamsStore } from './backoffice-teams.store';

function createLoadBackofficeTeamsUseCaseMock() {
  return {
    execute: jest.fn(),
  };
}

function createTeam(overrides: Partial<BackofficeTeam> = {}): BackofficeTeam {
  return {
    id: 'team-1',
    name: 'Kings Of Favar',
    description: 'Equipo de ejemplo',
    secondaryDescription: 'Subtitulo',
    logo: 'https://cdn.test/team-logo.svg',
    ...overrides,
  };
}

describe('BackofficeTeamsStore', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('caches the first load and only refetches when forceRefresh is enabled', async () => {
    const loadBackofficeTeamsUseCase = createLoadBackofficeTeamsUseCaseMock();
    loadBackofficeTeamsUseCase.execute
      .mockResolvedValueOnce([createTeam()])
      .mockResolvedValueOnce([createTeam({ id: 'team-2', name: 'Titanics' })]);

    TestBed.configureTestingModule({
      providers: [
        BackofficeTeamsStore,
        {
          provide: LOAD_BACKOFFICE_TEAMS_USE_CASE,
          useValue: loadBackofficeTeamsUseCase,
        },
      ],
    });

    const store = TestBed.inject(BackofficeTeamsStore);

    await store.load();
    await store.load();
    await store.load(true);

    expect(loadBackofficeTeamsUseCase.execute).toHaveBeenCalledTimes(2);
    expect(store.hasContent()).toBe(true);
    expect(store.teams()).toEqual([createTeam({ id: 'team-2', name: 'Titanics' })]);
  });

  it('keeps the previous teams when a forced refresh fails', async () => {
    const initialTeams = [createTeam()];
    const loadBackofficeTeamsUseCase = createLoadBackofficeTeamsUseCaseMock();
    loadBackofficeTeamsUseCase.execute
      .mockResolvedValueOnce(initialTeams)
      .mockRejectedValueOnce(new Error('boom'));

    TestBed.configureTestingModule({
      providers: [
        BackofficeTeamsStore,
        {
          provide: LOAD_BACKOFFICE_TEAMS_USE_CASE,
          useValue: loadBackofficeTeamsUseCase,
        },
      ],
    });

    const store = TestBed.inject(BackofficeTeamsStore);

    await store.load();
    await store.load(true);

    expect(store.teams()).toEqual(initialTeams);
    expect(store.hasContent()).toBe(true);
    expect(store.errorMessage()).toBe('No hemos podido cargar los equipos.');
    expect(store.isLoading()).toBe(false);
  });
});
