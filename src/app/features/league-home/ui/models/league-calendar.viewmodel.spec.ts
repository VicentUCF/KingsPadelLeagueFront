import { type LeagueMatchday } from '@features/league-home/domain/entities/league-matchday';
import { type LeagueHomeSnapshot } from '@features/league-home/domain/entities/league-home-snapshot';

import {
  ALL_CALENDAR_STATUS_FILTER,
  ALL_CALENDAR_TEAM_FILTER,
  toLeagueCalendarPageViewModel,
} from './league-calendar.viewmodel';

describe('toLeagueCalendarPageViewModel', () => {
  it('sorts the agenda with current and upcoming encounters first, grouped by day', () => {
    const viewModel = toLeagueCalendarPageViewModel(createSnapshot(), createMatchdays(), {
      status: ALL_CALENDAR_STATUS_FILTER,
      team: ALL_CALENDAR_TEAM_FILTER,
    });

    expect(viewModel.dayGroups.map((dayGroup) => dayGroup.dateLabel)).toEqual([
      'Domingo 15 de marzo',
      'Domingo 22 de marzo',
      'Domingo 8 de marzo',
      'Domingo 1 de marzo',
    ]);
    expect(viewModel.dayGroups[0]).toMatchObject({
      matchdaySummaryLabel: 'Jornada 3',
      encounterCountLabel: '2 cruces',
      byeTeamsLabel: 'Descansa Magic City',
    });
    expect(viewModel.dayGroups[0]?.encounters.map((encounter) => encounter.id)).toEqual([
      'matchday-3-titanics-house-perez',
      'matchday-3-kings-of-favar-barbaridad',
    ]);
  });

  it('builds team filters from the published calendar teams in alphabetical order', () => {
    const viewModel = toLeagueCalendarPageViewModel(createSnapshot(), createMatchdays(), {
      status: ALL_CALENDAR_STATUS_FILTER,
      team: ALL_CALENDAR_TEAM_FILTER,
    });

    expect(viewModel.teamFilters.map((filter) => filter.label)).toEqual([
      'Todos los equipos',
      'Barbaridad',
      'House Perez',
      'Kings of Favar',
      'Magic City',
      'Titanics',
    ]);
  });

  it('filters encounters by team and status while keeping global metrics intact', () => {
    const viewModel = toLeagueCalendarPageViewModel(createSnapshot(), createMatchdays(), {
      status: 'upcoming',
      team: 'titanics',
    });

    expect(viewModel.filteredResultsLabel).toBe('Mostrando 2 de 8 cruces');
    expect(viewModel.summaryMetrics).toEqual([
      { label: 'Cruces totales', value: '8' },
      { label: 'En juego', value: '1' },
      { label: 'Programados', value: '3' },
      { label: 'Finalizados', value: '4' },
    ]);
    expect(
      viewModel.dayGroups
        .flatMap((dayGroup) => dayGroup.encounters)
        .map((encounter) => encounter.id),
    ).toEqual(['matchday-3-titanics-house-perez', 'matchday-4-titanics-kings-of-favar']);
  });

  it('returns a filtered empty state when no encounter matches the active filters', () => {
    const viewModel = toLeagueCalendarPageViewModel(createSnapshot(), createMatchdays(), {
      status: 'current',
      team: 'magic-city',
    });

    expect(viewModel.hasActiveFilters).toBe(true);
    expect(viewModel.filteredResultsLabel).toBe('Mostrando 0 de 8 cruces');
    expect(viewModel.dayGroups).toEqual([]);
    expect(viewModel.emptyState).toEqual({
      title: 'No hay cruces con estos filtros',
      description: 'Prueba con otro estado o equipo para volver a mostrar partidos en la agenda.',
    });
  });
});

function createSnapshot(): LeagueHomeSnapshot {
  return {
    league: {
      name: 'KingsPadelLeague',
      tagline: 'Liga amateur de pádel',
      seasonLabel: 'Temporada 1',
    },
    currentPhase: {
      code: 'regular-season',
      label: 'Fase regular',
    },
    currentMatchday: {
      current: 3,
      total: 4,
      label: 'Jornada 3 de 4',
    },
    standings: [],
    nextMatches: [],
    byeTeam: {
      teamId: 'magic-city',
      teamName: 'Magic City',
      matchdayLabel: 'Jornada 3',
    },
    lastResults: [],
    teams: [
      createTeamSummary('barbaridad', 'Barbaridad'),
      createTeamSummary('house-perez', 'House Perez'),
      createTeamSummary('kings-of-favar', 'Kings of Favar'),
      createTeamSummary('magic-city', 'Magic City'),
      createTeamSummary('titanics', 'Titanics'),
    ],
    teamProfiles: [],
  };
}

function createTeamSummary(slug: string, name: string): LeagueHomeSnapshot['teams'][number] {
  return {
    id: slug,
    slug,
    name,
    presidentName: 'Presidente',
    playerCount: 6,
  };
}

function createMatchdays(): readonly LeagueMatchday[] {
  return [
    createMatchday({
      id: 'matchday-1',
      number: 1,
      label: 'Jornada 1',
      status: 'completed',
      dateLabel: 'Domingo 1 de marzo',
      byeTeamName: 'House Perez',
      encounters: [
        createEncounter({
          id: 'matchday-1-kings-of-favar-titanics',
          homeTeamSlug: 'kings-of-favar',
          homeTeamName: 'Kings of Favar',
          awayTeamSlug: 'titanics',
          awayTeamName: 'Titanics',
          status: 'completed',
          homeScore: 4,
          awayScore: 1,
          scheduledAtIso: '2026-03-01T11:00:00.000Z',
          scheduledAtLabel: 'Domingo 12:00',
        }),
        createEncounter({
          id: 'matchday-1-barbaridad-magic-city',
          homeTeamSlug: 'barbaridad',
          homeTeamName: 'Barbaridad',
          awayTeamSlug: 'magic-city',
          awayTeamName: 'Magic City',
          status: 'completed',
          homeScore: 5,
          awayScore: 0,
          scheduledAtIso: '2026-03-01T15:00:00.000Z',
          scheduledAtLabel: 'Domingo 16:00',
        }),
      ],
    }),
    createMatchday({
      id: 'matchday-2',
      number: 2,
      label: 'Jornada 2',
      status: 'completed',
      dateLabel: 'Domingo 8 de marzo',
      byeTeamName: 'Magic City',
      encounters: [
        createEncounter({
          id: 'matchday-2-house-perez-kings-of-favar',
          homeTeamSlug: 'house-perez',
          homeTeamName: 'House Perez',
          awayTeamSlug: 'kings-of-favar',
          awayTeamName: 'Kings of Favar',
          status: 'completed',
          homeScore: 2,
          awayScore: 3,
          scheduledAtIso: '2026-03-08T10:30:00.000Z',
          scheduledAtLabel: 'Domingo 11:30',
        }),
        createEncounter({
          id: 'matchday-2-titanics-barbaridad',
          homeTeamSlug: 'titanics',
          homeTeamName: 'Titanics',
          awayTeamSlug: 'barbaridad',
          awayTeamName: 'Barbaridad',
          status: 'completed',
          homeScore: 5,
          awayScore: 0,
          scheduledAtIso: '2026-03-08T14:30:00.000Z',
          scheduledAtLabel: 'Domingo 15:30',
        }),
      ],
    }),
    createMatchday({
      id: 'matchday-3',
      number: 3,
      label: 'Jornada 3',
      status: 'current',
      dateLabel: 'Domingo 15 de marzo',
      byeTeamName: 'Magic City',
      encounters: [
        createEncounter({
          id: 'matchday-3-kings-of-favar-barbaridad',
          homeTeamSlug: 'kings-of-favar',
          homeTeamName: 'Kings of Favar',
          awayTeamSlug: 'barbaridad',
          awayTeamName: 'Barbaridad',
          status: 'current',
          homeScore: 1,
          awayScore: 0,
          scheduledAtIso: '2026-03-15T17:00:00.000Z',
          scheduledAtLabel: 'Domingo 18:00',
        }),
        createEncounter({
          id: 'matchday-3-titanics-house-perez',
          homeTeamSlug: 'titanics',
          homeTeamName: 'Titanics',
          awayTeamSlug: 'house-perez',
          awayTeamName: 'House Perez',
          status: 'upcoming',
          homeScore: 0,
          awayScore: 0,
          scheduledAtIso: '2026-03-15T15:00:00.000Z',
          scheduledAtLabel: 'Domingo 16:00',
        }),
      ],
    }),
    createMatchday({
      id: 'matchday-4',
      number: 4,
      label: 'Jornada 4',
      status: 'upcoming',
      dateLabel: 'Domingo 22 de marzo',
      byeTeamName: 'Barbaridad',
      encounters: [
        createEncounter({
          id: 'matchday-4-magic-city-house-perez',
          homeTeamSlug: 'magic-city',
          homeTeamName: 'Magic City',
          awayTeamSlug: 'house-perez',
          awayTeamName: 'House Perez',
          status: 'upcoming',
          homeScore: 0,
          awayScore: 0,
          scheduledAtIso: '2026-03-22T11:00:00.000Z',
          scheduledAtLabel: 'Domingo 12:00',
        }),
        createEncounter({
          id: 'matchday-4-titanics-kings-of-favar',
          homeTeamSlug: 'titanics',
          homeTeamName: 'Titanics',
          awayTeamSlug: 'kings-of-favar',
          awayTeamName: 'Kings of Favar',
          status: 'upcoming',
          homeScore: 0,
          awayScore: 0,
          scheduledAtIso: '2026-03-22T16:30:00.000Z',
          scheduledAtLabel: 'Domingo 17:30',
        }),
      ],
    }),
  ];
}

function createMatchday({
  id,
  number,
  label,
  status,
  dateLabel,
  byeTeamName,
  encounters,
}: {
  readonly id: string;
  readonly number: number;
  readonly label: string;
  readonly status: LeagueMatchday['status'];
  readonly dateLabel: string;
  readonly byeTeamName: string;
  readonly encounters: LeagueMatchday['encounters'];
}): LeagueMatchday {
  return {
    id,
    number,
    label,
    status,
    dateLabel,
    encounters,
    byeTeam: {
      teamId: byeTeamName.toLowerCase().replace(/\s+/g, '-'),
      teamSlug: byeTeamName.toLowerCase().replace(/\s+/g, '-'),
      teamName: byeTeamName,
    },
  };
}

function createEncounter({
  id,
  homeTeamSlug,
  homeTeamName,
  awayTeamSlug,
  awayTeamName,
  status,
  homeScore,
  awayScore,
  scheduledAtIso,
  scheduledAtLabel,
}: {
  readonly id: string;
  readonly homeTeamSlug: string;
  readonly homeTeamName: string;
  readonly awayTeamSlug: string;
  readonly awayTeamName: string;
  readonly status: LeagueMatchday['status'];
  readonly homeScore: number;
  readonly awayScore: number;
  readonly scheduledAtIso: string;
  readonly scheduledAtLabel: string;
}): LeagueMatchday['encounters'][number] {
  return {
    id,
    homeTeamId: homeTeamSlug,
    homeTeamSlug,
    homeTeamName,
    awayTeamId: awayTeamSlug,
    awayTeamSlug,
    awayTeamName,
    homeScore,
    awayScore,
    status,
    scheduledAtIso,
    scheduledAtLabel,
    pairResults: [],
  };
}
