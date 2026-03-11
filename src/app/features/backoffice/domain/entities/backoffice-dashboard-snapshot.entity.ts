import { type BackofficeSeasonStatus } from './backoffice-season-status';

export type BackofficeMatchdayStatus = 'DRAFT' | 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
export type BackofficeSanctionType = 'LATE_LINEUP' | 'ADMIN_DECISION';
export type BackofficeSanctionStatus = 'APPLIED' | 'REVERTED';
export type BackofficeMvpElectionStatus =
  | 'DRAFT'
  | 'NOMINATIONS_OPEN'
  | 'INTERNAL_VOTING_OPEN'
  | 'PUBLIC_VOTING_OPEN'
  | 'CLOSED';

export interface BackofficeActiveSeasonSummary {
  readonly id: string;
  readonly label: string;
  readonly status: BackofficeSeasonStatus;
  readonly teamCount: number;
  readonly matchdayCount: number;
  readonly scheduleLabel: string;
}

export interface BackofficeNextMatchdaySummary {
  readonly id: string;
  readonly label: string;
  readonly status: BackofficeMatchdayStatus;
  readonly scheduledDateLabel: string;
  readonly lineupDeadlineLabel: string;
  readonly pendingFixturesCount: number;
}

export interface BackofficeRecentSanction {
  readonly id: string;
  readonly teamName: string;
  readonly type: BackofficeSanctionType;
  readonly reason: string;
  readonly pointsDelta: number;
  readonly appliedAtLabel: string;
  readonly status: BackofficeSanctionStatus;
}

export interface BackofficeMvpElectionSummary {
  readonly matchdayLabel: string;
  readonly status: BackofficeMvpElectionStatus;
  readonly nominationsCount: number;
  readonly internalVotesCount: number;
  readonly publicVotesCount: number;
  readonly winnerName?: string;
}

export interface BackofficeDashboardSnapshot {
  readonly activeSeason: BackofficeActiveSeasonSummary;
  readonly nextMatchday: BackofficeNextMatchdaySummary;
  readonly pendingLineupsCount: number;
  readonly pendingRosterRequestsCount: number;
  readonly pendingGuestRequestsCount: number;
  readonly pendingResultsCount: number;
  readonly recentSanctions: readonly BackofficeRecentSanction[];
  readonly currentMvpElection: BackofficeMvpElectionSummary;
}
