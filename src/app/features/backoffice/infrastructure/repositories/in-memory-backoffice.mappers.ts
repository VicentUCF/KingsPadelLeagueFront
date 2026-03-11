import {
  type BackofficePlayerDetail,
  type BackofficePlayerSummary,
} from '@features/backoffice/domain/entities/backoffice-player.entity';
import {
  type BackofficeSeasonDetail,
  type BackofficeSeasonSummary,
} from '@features/backoffice/domain/entities/backoffice-season.entity';
import {
  type BackofficeTeamDetail,
  type BackofficeTeamSummary,
} from '@features/backoffice/domain/entities/backoffice-team.entity';

import {
  type InMemoryBackofficePlayerRecord,
  type InMemoryBackofficeSeasonRecord,
  type InMemoryBackofficeTeamRecord,
} from './in-memory-backoffice-data.types';

export function toBackofficeSeasonSummary(
  season: InMemoryBackofficeSeasonRecord,
  teams: readonly InMemoryBackofficeTeamRecord[],
): BackofficeSeasonSummary {
  const seasonTeams = teams.filter((team) => team.seasonId === season.id);

  return {
    id: season.id,
    name: season.name,
    year: season.year,
    status: season.status,
    startDate: season.startDate,
    endDate: season.endDate,
    scheduleLabel: formatSeasonScheduleLabel(season.startDate, season.endDate),
    teamCount: seasonTeams.length,
    matchdayCount: season.matchdays.length,
  };
}

export function toBackofficeSeasonDetail(
  season: InMemoryBackofficeSeasonRecord,
  teams: readonly InMemoryBackofficeTeamRecord[],
): BackofficeSeasonDetail {
  const seasonTeams = teams.filter((team) => team.seasonId === season.id);

  return {
    ...toBackofficeSeasonSummary(season, teams),
    notes: season.notes,
    teams: seasonTeams.map((team) => ({
      id: team.id,
      name: team.name,
      shortName: team.shortName,
    })),
    matchdays: season.matchdays,
    standings: season.standings,
  };
}

export function toBackofficeTeamSummary(
  team: InMemoryBackofficeTeamRecord,
  seasons: readonly InMemoryBackofficeSeasonRecord[],
  _players: readonly InMemoryBackofficePlayerRecord[],
): BackofficeTeamSummary {
  const season = seasons.find((seasonEntry) => seasonEntry.id === team.seasonId);

  return {
    id: team.id,
    name: team.name,
    shortName: team.shortName,
    primaryColor: team.primaryColor,
    secondaryColor: team.secondaryColor,
    presidentName: team.presidentName,
    activeRegularPlayersCount: team.activeRegularPlayersCount,
    status: team.status,
    seasonLabel: season?.name ?? 'Season desconocida',
  };
}

export function toBackofficeTeamDetail(
  team: InMemoryBackofficeTeamRecord,
  seasons: readonly InMemoryBackofficeSeasonRecord[],
  players: readonly InMemoryBackofficePlayerRecord[],
): BackofficeTeamDetail {
  return {
    ...toBackofficeTeamSummary(team, seasons, players),
    visualIdentityLabel: `Color principal ${team.primaryColor.toUpperCase()} con acento ${team.secondaryColor.toUpperCase()}.`,
    roleAssignments: team.roleAssignments,
    rosterMembers: team.rosterMembers,
    fixtures: team.fixtures,
    sanctions: team.sanctions,
    mvpHistory: team.mvpHistory,
  };
}

export function toBackofficePlayerSummary(
  player: InMemoryBackofficePlayerRecord,
  teams: readonly InMemoryBackofficeTeamRecord[],
): BackofficePlayerSummary {
  const currentTeam = player.currentTeamId
    ? (teams.find((team) => team.id === player.currentTeamId) ?? null)
    : null;

  return {
    id: player.id,
    fullName: player.fullName,
    nickName: player.nickName,
    avatarPath: player.avatarPath,
    status: player.status,
    derivedCurrentTeamName: currentTeam?.name ?? null,
    historicalTeamNames: resolveHistoricalTeamNames(player, currentTeam?.name ?? null),
    isUserLinked: player.linkedUserEmail !== null,
  };
}

export function toBackofficePlayerDetail(
  player: InMemoryBackofficePlayerRecord,
  teams: readonly InMemoryBackofficeTeamRecord[],
): BackofficePlayerDetail {
  return {
    ...toBackofficePlayerSummary(player, teams),
    preferredSideLabel: player.preferredSideLabel,
    linkedUserEmail: player.linkedUserEmail,
    currentTeamId: player.currentTeamId,
    historicalMemberships: player.historicalMemberships,
    participations: player.participations,
    mvpNominations: player.mvpNominations,
  };
}

function resolveHistoricalTeamNames(
  player: InMemoryBackofficePlayerRecord,
  currentTeamName: string | null,
): readonly string[] {
  const names = new Set<string>();

  if (currentTeamName) {
    names.add(currentTeamName);
  }

  player.historicalMemberships.forEach((membership) => {
    names.add(membership.teamName);
  });

  return [...names];
}

function formatSeasonScheduleLabel(startDate: string, endDate: string): string {
  return `${formatDateLabel(startDate)} · ${formatDateLabel(endDate)}`;
}

function formatDateLabel(value: string): string {
  const [yearSegment = '1970', monthSegment = '1', daySegment = '1'] = value.split('-');
  const year = Number(yearSegment);
  const month = Number(monthSegment);
  const day = Number(daySegment);
  const formatter = new Intl.DateTimeFormat('es', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  });
  const parts = formatter.formatToParts(new Date(Date.UTC(year, month - 1, day)));
  const dayLabel = parts.find((part) => part.type === 'day')?.value ?? `${day}`;
  const monthLabel = parts.find((part) => part.type === 'month')?.value ?? `${month}`;

  return `${dayLabel} ${monthLabel}`;
}
