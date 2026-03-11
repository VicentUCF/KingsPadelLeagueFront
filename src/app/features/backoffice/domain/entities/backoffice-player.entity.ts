export type BackofficePlayerStatus = 'ACTIVE' | 'INACTIVE';

export interface BackofficePlayerSummary {
  readonly id: string;
  readonly fullName: string;
  readonly nickName: string;
  readonly avatarPath: string | null;
  readonly status: BackofficePlayerStatus;
  readonly derivedCurrentTeamName: string | null;
  readonly historicalTeamNames: readonly string[];
  readonly isUserLinked: boolean;
}

export interface BackofficePlayerMembershipSummary {
  readonly teamName: string;
  readonly seasonLabel: string;
  readonly membershipLabel: string;
}

export interface BackofficePlayerParticipationSummary {
  readonly label: string;
  readonly resultLabel: string;
}

export interface BackofficePlayerMvpNominationSummary {
  readonly label: string;
  readonly statusLabel: string;
}

export interface BackofficePlayerDetail extends BackofficePlayerSummary {
  readonly preferredSideLabel: string;
  readonly linkedUserEmail: string | null;
  readonly historicalMemberships: readonly BackofficePlayerMembershipSummary[];
  readonly participations: readonly BackofficePlayerParticipationSummary[];
  readonly mvpNominations: readonly BackofficePlayerMvpNominationSummary[];
}
