import { Injector, runInInjectionContext } from '@angular/core';

import { InMemoryBackofficeDataStore } from './in-memory-backoffice-data.store';
import { InMemoryBackofficePlayersRepository } from './in-memory-backoffice-players.repository';
import { InMemoryBackofficeSeasonsRepository } from './in-memory-backoffice-seasons.repository';
import { InMemoryBackofficeTeamsRepository } from './in-memory-backoffice-teams.repository';

describe('in-memory backoffice repositories', () => {
  let injector: Injector;

  beforeEach(() => {
    injector = Injector.create({
      providers: [{ provide: InMemoryBackofficeDataStore, deps: [] }],
    });
  });

  it('keeps mutations across repositories within the same session', async () => {
    const seasonsRepository = instantiateInInjectionContext(
      InMemoryBackofficeSeasonsRepository,
      injector,
    );
    const teamsRepository = instantiateInInjectionContext(
      InMemoryBackofficeTeamsRepository,
      injector,
    );
    const playersRepository = instantiateInInjectionContext(
      InMemoryBackofficePlayersRepository,
      injector,
    );

    const createdSeason = await seasonsRepository.create({
      name: 'Temporada 2026 Extra',
      year: 2026,
      startDate: '2026-09-01',
      endDate: '2026-12-20',
      notes: ['Edición otoño'],
      status: 'DRAFT',
    });

    expect(createdSeason.id).toBe('season-2026-2');

    const createdPlayer = await playersRepository.create({
      fullName: 'Diego Roca',
      nickName: 'Diego',
      avatarPath: null,
      preferredSideLabel: 'Revés',
      linkedUserEmail: null,
      status: 'ACTIVE',
      currentTeamId: 'barbaridad',
    });

    expect(createdPlayer.id).toBe('player-diego-roca');

    const updatedTeam = await teamsRepository.update({
      id: 'barbaridad',
      name: 'Barbaridad Club',
      shortName: 'BAR',
      presidentName: 'Romero',
      primaryColor: '#AA2200',
      secondaryColor: '#FFD08A',
    });

    expect(updatedTeam.visualIdentityLabel).toContain('#AA2200');

    const teams = await teamsRepository.findAll();
    const team = teams.find((teamEntry: (typeof teams)[number]) => teamEntry.id === 'barbaridad');

    expect(team?.activeRegularPlayersCount).toBe(7);
    expect(team?.seasonLabel).toBe('Temporada 2026');

    const players = await playersRepository.findAll();
    const player = players.find(
      (playerEntry: (typeof players)[number]) => playerEntry.id === 'player-diego-roca',
    );

    expect(player?.derivedCurrentTeamName).toBe('Barbaridad Club');
    expect(player?.historicalTeamNames).toEqual(['Barbaridad Club']);

    const seasons = await seasonsRepository.findAll();

    expect(
      seasons.find((season: (typeof seasons)[number]) => season.id === 'season-2026-2')
        ?.scheduleLabel,
    ).toBe('1 septiembre · 20 diciembre');
  });
});

function instantiateInInjectionContext<T>(type: new () => T, injector: Injector): T {
  return runInInjectionContext(injector, () => new type());
}
