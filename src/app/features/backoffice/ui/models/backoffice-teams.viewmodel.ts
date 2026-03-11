import {
  type BackofficeTeamDetail,
  type BackofficeTeamStatus,
  type BackofficeTeamSummary,
  type BackofficeTeamTabId,
} from '../../domain/entities/backoffice-team.entity';
import { type StatusBadgeTone } from './status-badge-tone';

export interface BackofficeTeamCardViewModel {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly presidentLabel: string;
  readonly activePlayersLabel: string;
  readonly statusLabel: string;
  readonly statusTone: StatusBadgeTone;
  readonly detailPath: string;
  readonly primaryColor: string;
  readonly secondaryColor: string;
}

export interface BackofficeTeamTabViewModel {
  readonly id: BackofficeTeamTabId;
  readonly label: string;
}

export interface BackofficeTeamDetailViewModel {
  readonly title: string;
  readonly subtitle: string;
  readonly statusLabel: string;
  readonly statusTone: StatusBadgeTone;
  readonly visualIdentityLabel: string;
  readonly roleAssignments: readonly string[];
  readonly rosterMembers: readonly string[];
  readonly fixtures: readonly string[];
  readonly sanctions: readonly string[];
  readonly mvpHistory: readonly string[];
}

export const BACKOFFICE_TEAM_TABS: readonly BackofficeTeamTabViewModel[] = [
  { id: 'info', label: 'Info' },
  { id: 'roles', label: 'President / Roles' },
  { id: 'roster', label: 'Roster' },
  { id: 'fixtures', label: 'Fixtures' },
  { id: 'sanctions', label: 'Sanctions' },
  { id: 'mvp', label: 'MVP history' },
];

export const DEFAULT_BACKOFFICE_TEAM_TAB: BackofficeTeamTabId = 'info';

export function toBackofficeTeamCardViewModel(
  team: BackofficeTeamSummary,
): BackofficeTeamCardViewModel {
  return {
    id: team.id,
    title: team.name,
    subtitle: `${team.shortName} · ${team.seasonLabel}`,
    presidentLabel: `Presidente actual: ${team.presidentName}`,
    activePlayersLabel: `${team.activeRegularPlayersCount} jugadores regulares activos`,
    statusLabel: toTeamStatusLabel(team.status),
    statusTone: toTeamStatusTone(team.status),
    detailPath: `/backoffice/equipos/${team.id}`,
    primaryColor: team.primaryColor,
    secondaryColor: team.secondaryColor,
  };
}

export function toBackofficeTeamDetailViewModel(
  team: BackofficeTeamDetail,
): BackofficeTeamDetailViewModel {
  return {
    title: team.name,
    subtitle: `${team.shortName} · ${team.seasonLabel}`,
    statusLabel: toTeamStatusLabel(team.status),
    statusTone: toTeamStatusTone(team.status),
    visualIdentityLabel: team.visualIdentityLabel,
    roleAssignments: team.roleAssignments.map(
      (assignment) =>
        `${assignment.roleLabel}: ${assignment.userName} · ${assignment.assignmentLabel}`,
    ),
    rosterMembers: team.rosterMembers.map(
      (member) => `${member.playerName} · ${member.membershipLabel}`,
    ),
    fixtures: team.fixtures.map((fixture) => `${fixture.fixtureLabel} · ${fixture.statusLabel}`),
    sanctions: team.sanctions.map(
      (sanction) => `${sanction.reason} · ${sanction.pointsDelta} pts · ${sanction.statusLabel}`,
    ),
    mvpHistory: team.mvpHistory.map(
      (entry) => `${entry.matchdayLabel} · ${entry.playerName} · ${entry.resultLabel}`,
    ),
  };
}

function toTeamStatusLabel(status: BackofficeTeamStatus): string {
  switch (status) {
    case 'ACTIVE':
      return 'Activo';
    case 'INACTIVE':
      return 'Inactivo';
    case 'ARCHIVED':
      return 'Archivado';
  }
}

function toTeamStatusTone(status: BackofficeTeamStatus): StatusBadgeTone {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'INACTIVE':
      return 'warning';
    case 'ARCHIVED':
      return 'neutral';
  }
}
