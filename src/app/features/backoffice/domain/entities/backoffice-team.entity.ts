export type BackofficeTeamStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
export type BackofficeTeamTabId = 'info' | 'roles' | 'roster' | 'fixtures' | 'sanctions' | 'mvp';

export interface BackofficeTeamSummary {
  readonly id: string;
  readonly name: string;
  readonly shortName: string;
  readonly primaryColor: string;
  readonly secondaryColor: string;
  readonly presidentName: string;
  readonly activeRegularPlayersCount: number;
  readonly status: BackofficeTeamStatus;
  readonly seasonLabel: string;
}

export interface BackofficeTeamRoleAssignment {
  readonly roleLabel: string;
  readonly userName: string;
  readonly assignmentLabel: string;
}

export interface BackofficeTeamRosterMember {
  readonly playerName: string;
  readonly membershipLabel: string;
}

export interface BackofficeTeamFixtureSummary {
  readonly fixtureLabel: string;
  readonly statusLabel: string;
}

export interface BackofficeTeamSanctionSummary {
  readonly reason: string;
  readonly pointsDelta: number;
  readonly statusLabel: string;
}

export interface BackofficeTeamMvpEntry {
  readonly matchdayLabel: string;
  readonly playerName: string;
  readonly resultLabel: string;
}

export interface BackofficeTeamDetail extends BackofficeTeamSummary {
  readonly visualIdentityLabel: string;
  readonly roleAssignments: readonly BackofficeTeamRoleAssignment[];
  readonly rosterMembers: readonly BackofficeTeamRosterMember[];
  readonly fixtures: readonly BackofficeTeamFixtureSummary[];
  readonly sanctions: readonly BackofficeTeamSanctionSummary[];
  readonly mvpHistory: readonly BackofficeTeamMvpEntry[];
}
