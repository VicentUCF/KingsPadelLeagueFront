import {
  type LeagueMatchday,
  type LeagueMatchdayStatus,
} from '@features/league-home/domain/entities/league-matchday';
import { type LeagueHomeSnapshot } from '@features/league-home/domain/entities/league-home-snapshot';

import {
  type MatchdayStatusTone,
  type MatchdayTeamViewModel,
  toMatchdayStatusLabel,
  toMatchdayStatusTone,
  toMatchdayTeamViewModel,
} from './league-matchday-ui.viewmodel';
import { resolveTeamBranding, type TeamBrandingPalette } from './league-team-branding';

export const ALL_CALENDAR_STATUS_FILTER = 'all';
export const ALL_CALENDAR_TEAM_FILTER = 'all-teams';

export type CalendarStatusFilter = typeof ALL_CALENDAR_STATUS_FILTER | LeagueMatchdayStatus;
export type CalendarTeamFilter = typeof ALL_CALENDAR_TEAM_FILTER | string;

export interface LeagueCalendarFilters {
  readonly status: CalendarStatusFilter;
  readonly team: CalendarTeamFilter;
}

export interface LeagueCalendarPageViewModel {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly seasonLabel: string;
  readonly currentMatchdayLabel: string;
  readonly phaseLabel: string;
  readonly summaryMetrics: readonly CalendarSummaryMetricViewModel[];
  readonly statusFilters: readonly CalendarStatusFilterOptionViewModel[];
  readonly teamFilters: readonly CalendarTeamFilterOptionViewModel[];
  readonly filteredResultsLabel: string;
  readonly hasActiveFilters: boolean;
  readonly emptyState: CalendarEmptyStateViewModel | null;
  readonly dayGroups: readonly CalendarDayGroupViewModel[];
}

export interface CalendarSummaryMetricViewModel {
  readonly label: string;
  readonly value: string;
}

export interface CalendarStatusFilterOptionViewModel {
  readonly value: CalendarStatusFilter;
  readonly label: string;
  readonly isActive: boolean;
}

export interface CalendarTeamFilterOptionViewModel {
  readonly value: CalendarTeamFilter;
  readonly label: string;
  readonly monogram: string;
  readonly logoPath: string | null;
  readonly palette: TeamBrandingPalette;
  readonly isActive: boolean;
}

export interface CalendarEmptyStateViewModel {
  readonly title: string;
  readonly description: string;
}

export interface CalendarDayGroupViewModel {
  readonly id: string;
  readonly dateLabel: string;
  readonly weekdayLabel: string;
  readonly dayNumberLabel: string;
  readonly monthLabel: string;
  readonly matchdaySummaryLabel: string;
  readonly encounterCountLabel: string;
  readonly byeTeamsLabel: string | null;
  readonly encounters: readonly CalendarEncounterCardViewModel[];
}

export interface CalendarEncounterCardViewModel {
  readonly id: string;
  readonly scheduledTimeLabel: string;
  readonly statusLabel: string;
  readonly statusTone: MatchdayStatusTone;
  readonly scoreLabel: string;
  readonly matchdayLabel: string;
  readonly matchdayLink: string;
  readonly matchdayLinkLabel: string;
  readonly homeTeam: MatchdayTeamViewModel;
  readonly awayTeam: MatchdayTeamViewModel;
}

interface CalendarEncounterEntry {
  readonly id: string;
  readonly scheduledAtIso: string;
  readonly scheduledAtLabel: string;
  readonly dateKey: string;
  readonly dateLabel: string;
  readonly matchdayId: string;
  readonly matchdayLabel: string;
  readonly status: LeagueMatchdayStatus;
  readonly homeScore: number;
  readonly awayScore: number;
  readonly homeTeam: MatchdayTeamViewModel;
  readonly awayTeam: MatchdayTeamViewModel;
  readonly byeTeamName: string | null;
}

const CALENDAR_STATUS_FILTER_LABELS: Readonly<Record<CalendarStatusFilter, string>> = {
  [ALL_CALENDAR_STATUS_FILTER]: 'Todos',
  completed: 'Finalizadas',
  current: 'En juego',
  upcoming: 'Programadas',
};

export function toLeagueCalendarPageViewModel(
  snapshot: LeagueHomeSnapshot,
  matchdays: readonly LeagueMatchday[],
  filters: LeagueCalendarFilters,
): LeagueCalendarPageViewModel {
  const encounterEntries = toCalendarEncounterEntries(matchdays);
  const filteredEncounterEntries = filterCalendarEncounterEntries(encounterEntries, filters);
  const dayGroups = toCalendarDayGroups(filteredEncounterEntries);

  return {
    eyebrow: 'Calendario',
    title: 'Calendario completo',
    description:
      'Consulta toda la agenda competitiva de KingsPadelLeague, filtra por estado o equipo y abre cada jornada para ver el detalle completo.',
    seasonLabel: snapshot.league.seasonLabel,
    currentMatchdayLabel: snapshot.currentMatchday.label,
    phaseLabel: snapshot.currentPhase.label,
    summaryMetrics: buildCalendarSummaryMetrics(encounterEntries),
    statusFilters: buildCalendarStatusFilters(filters.status),
    teamFilters: buildCalendarTeamFilters(snapshot, encounterEntries, filters.team),
    filteredResultsLabel: `Mostrando ${filteredEncounterEntries.length} de ${encounterEntries.length} cruces`,
    hasActiveFilters: hasActiveCalendarFilters(filters),
    emptyState:
      filteredEncounterEntries.length === 0
        ? {
            title: 'No hay cruces con estos filtros',
            description:
              'Prueba con otro estado o equipo para volver a mostrar partidos en la agenda.',
          }
        : null,
    dayGroups,
  };
}

function buildCalendarSummaryMetrics(
  encounterEntries: readonly CalendarEncounterEntry[],
): readonly CalendarSummaryMetricViewModel[] {
  return [
    {
      label: 'Cruces totales',
      value: `${encounterEntries.length}`,
    },
    {
      label: 'En juego',
      value: `${countEntriesByStatus(encounterEntries, 'current')}`,
    },
    {
      label: 'Programados',
      value: `${countEntriesByStatus(encounterEntries, 'upcoming')}`,
    },
    {
      label: 'Finalizados',
      value: `${countEntriesByStatus(encounterEntries, 'completed')}`,
    },
  ];
}

function countEntriesByStatus(
  encounterEntries: readonly CalendarEncounterEntry[],
  status: LeagueMatchdayStatus,
): number {
  return encounterEntries.filter((encounterEntry) => encounterEntry.status === status).length;
}

function buildCalendarStatusFilters(
  selectedStatusFilter: CalendarStatusFilter,
): readonly CalendarStatusFilterOptionViewModel[] {
  return (
    [
      ALL_CALENDAR_STATUS_FILTER,
      'current',
      'upcoming',
      'completed',
    ] as const satisfies readonly CalendarStatusFilter[]
  ).map((statusFilter) => ({
    value: statusFilter,
    label: CALENDAR_STATUS_FILTER_LABELS[statusFilter],
    isActive: selectedStatusFilter === statusFilter,
  }));
}

function buildCalendarTeamFilters(
  snapshot: LeagueHomeSnapshot,
  encounterEntries: readonly CalendarEncounterEntry[],
  selectedTeamFilter: CalendarTeamFilter,
): readonly CalendarTeamFilterOptionViewModel[] {
  const encounterCountByTeamSlug = encounterEntries.reduce<Map<string, number>>(
    (countMap, encounter) => {
      incrementTeamEncounterCount(countMap, encounter.homeTeam.teamLink);
      incrementTeamEncounterCount(countMap, encounter.awayTeam.teamLink);

      return countMap;
    },
    new Map<string, number>(),
  );

  const teamFilterOptions = [...snapshot.teams]
    .filter((team) => (encounterCountByTeamSlug.get(team.slug) ?? 0) > 0)
    .sort((leftTeam, rightTeam) => leftTeam.name.localeCompare(rightTeam.name))
    .map((team) => {
      const branding = resolveTeamBranding({
        teamName: team.name,
        teamSlug: team.slug,
      });

      return {
        value: team.slug,
        label: team.name,
        monogram: branding.monogram,
        logoPath: branding.logoPath,
        palette: branding.palette,
        isActive: selectedTeamFilter === team.slug,
      };
    });

  return [
    {
      value: ALL_CALENDAR_TEAM_FILTER,
      label: 'Todos los equipos',
      monogram: 'TL',
      logoPath: null,
      palette: resolveTeamBranding({
        teamName: 'Todos los equipos',
        teamSlug: null,
      }).palette,
      isActive: selectedTeamFilter === ALL_CALENDAR_TEAM_FILTER,
    },
    ...teamFilterOptions,
  ];
}

function toCalendarEncounterEntries(
  matchdays: readonly LeagueMatchday[],
): readonly CalendarEncounterEntry[] {
  return matchdays.flatMap((matchday) =>
    matchday.encounters.map((encounter) => ({
      id: encounter.id,
      scheduledAtIso: encounter.scheduledAtIso,
      scheduledAtLabel: encounter.scheduledAtLabel,
      dateKey: encounter.scheduledAtIso.slice(0, 10),
      dateLabel: matchday.dateLabel,
      matchdayId: matchday.id,
      matchdayLabel: matchday.label,
      status: encounter.status,
      homeScore: encounter.homeScore,
      awayScore: encounter.awayScore,
      homeTeam: toMatchdayTeamViewModel(
        encounter.homeTeamId,
        encounter.homeTeamSlug,
        encounter.homeTeamName,
      ),
      awayTeam: toMatchdayTeamViewModel(
        encounter.awayTeamId,
        encounter.awayTeamSlug,
        encounter.awayTeamName,
      ),
      byeTeamName: matchday.byeTeam?.teamName ?? null,
    })),
  );
}

function filterCalendarEncounterEntries(
  encounterEntries: readonly CalendarEncounterEntry[],
  filters: LeagueCalendarFilters,
): readonly CalendarEncounterEntry[] {
  return encounterEntries.filter((encounterEntry) => {
    if (filters.status !== ALL_CALENDAR_STATUS_FILTER && encounterEntry.status !== filters.status) {
      return false;
    }

    if (filters.team === ALL_CALENDAR_TEAM_FILTER) {
      return true;
    }

    return [encounterEntry.homeTeam, encounterEntry.awayTeam].some((team) => {
      return team.teamLink === `/equipos/${filters.team}`;
    });
  });
}

function toCalendarDayGroups(
  encounterEntries: readonly CalendarEncounterEntry[],
): readonly CalendarDayGroupViewModel[] {
  const groupedEntries = new Map<
    string,
    {
      readonly dateLabel: string;
      readonly matchdayLabels: Set<string>;
      readonly byeTeamNames: Set<string>;
      readonly encounters: CalendarEncounterEntry[];
    }
  >();

  for (const encounterEntry of [...encounterEntries].sort(compareCalendarEncounterEntries)) {
    const existingGroup = groupedEntries.get(encounterEntry.dateKey);

    if (existingGroup) {
      existingGroup.matchdayLabels.add(encounterEntry.matchdayLabel);

      if (encounterEntry.byeTeamName) {
        existingGroup.byeTeamNames.add(encounterEntry.byeTeamName);
      }

      existingGroup.encounters.push(encounterEntry);
      continue;
    }

    groupedEntries.set(encounterEntry.dateKey, {
      dateLabel: encounterEntry.dateLabel,
      matchdayLabels: new Set([encounterEntry.matchdayLabel]),
      byeTeamNames: encounterEntry.byeTeamName ? new Set([encounterEntry.byeTeamName]) : new Set(),
      encounters: [encounterEntry],
    });
  }

  return [...groupedEntries.entries()].map(([dateKey, group]) => ({
    id: dateKey,
    dateLabel: group.dateLabel,
    ...toCalendarDateBadge(dateKey),
    matchdaySummaryLabel: formatMatchdaySummaryLabel([...group.matchdayLabels]),
    encounterCountLabel: `${group.encounters.length} ${group.encounters.length === 1 ? 'cruce' : 'cruces'}`,
    byeTeamsLabel: formatByeTeamsLabel([...group.byeTeamNames]),
    encounters: [...group.encounters]
      .sort(compareCalendarEncounterEntries)
      .map((encounterEntry) => ({
        id: encounterEntry.id,
        scheduledTimeLabel: toScheduledTimeLabel(encounterEntry.scheduledAtLabel),
        statusLabel: toMatchdayStatusLabel(encounterEntry.status),
        statusTone: toMatchdayStatusTone(encounterEntry.status),
        scoreLabel:
          encounterEntry.status === 'upcoming'
            ? 'Pendiente'
            : `${encounterEntry.homeScore} - ${encounterEntry.awayScore}`,
        matchdayLabel: encounterEntry.matchdayLabel,
        matchdayLink: `/jornadas/${encounterEntry.matchdayId}`,
        matchdayLinkLabel: `Abrir ${encounterEntry.matchdayLabel.toLowerCase()}: ${encounterEntry.homeTeam.teamName} vs ${encounterEntry.awayTeam.teamName}`,
        homeTeam: encounterEntry.homeTeam,
        awayTeam: encounterEntry.awayTeam,
      })),
  }));
}

function compareCalendarEncounterEntries(
  leftEncounter: CalendarEncounterEntry,
  rightEncounter: CalendarEncounterEntry,
): number {
  const leftBucket = toCalendarEncounterBucket(leftEncounter.status);
  const rightBucket = toCalendarEncounterBucket(rightEncounter.status);

  if (leftBucket !== rightBucket) {
    return leftBucket - rightBucket;
  }

  const leftTimestamp = Date.parse(leftEncounter.scheduledAtIso);
  const rightTimestamp = Date.parse(rightEncounter.scheduledAtIso);

  if (leftBucket === 0) {
    return leftTimestamp - rightTimestamp;
  }

  return rightTimestamp - leftTimestamp;
}

function incrementTeamEncounterCount(countMap: Map<string, number>, teamLink: string): void {
  const teamSlug = teamLink.replace('/equipos/', '');

  countMap.set(teamSlug, (countMap.get(teamSlug) ?? 0) + 1);
}

function toCalendarEncounterBucket(status: LeagueMatchdayStatus): 0 | 1 {
  return status === 'completed' ? 1 : 0;
}

function formatMatchdaySummaryLabel(matchdayLabels: readonly string[]): string {
  if (matchdayLabels.length === 1) {
    return matchdayLabels[0]!;
  }

  return matchdayLabels.join(' · ');
}

function formatByeTeamsLabel(byeTeamNames: readonly string[]): string | null {
  if (byeTeamNames.length === 0) {
    return null;
  }

  if (byeTeamNames.length === 1) {
    return `Descansa ${byeTeamNames[0]}`;
  }

  return `Descansan ${byeTeamNames.join(', ')}`;
}

function toScheduledTimeLabel(scheduledAtLabel: string): string {
  const timeLabel = scheduledAtLabel.split(' ').at(-1) ?? scheduledAtLabel;

  return `${timeLabel} h`;
}

function toCalendarDateBadge(
  dateKey: string,
): Pick<CalendarDayGroupViewModel, 'weekdayLabel' | 'dayNumberLabel' | 'monthLabel'> {
  const date = new Date(`${dateKey}T00:00:00.000Z`);

  return {
    weekdayLabel: new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      timeZone: 'UTC',
    }).format(date),
    dayNumberLabel: `${date.getUTCDate()}`,
    monthLabel: new Intl.DateTimeFormat('es-ES', {
      month: 'short',
      timeZone: 'UTC',
    })
      .format(date)
      .replace('.', '')
      .toUpperCase(),
  };
}

function hasActiveCalendarFilters(filters: LeagueCalendarFilters): boolean {
  return filters.status !== ALL_CALENDAR_STATUS_FILTER || filters.team !== ALL_CALENDAR_TEAM_FILTER;
}
