import { type BackofficeSeasonStatus } from './backoffice-season-status';

export interface BackofficeSeasonSummary {
  readonly id: string;
  readonly name: string;
  readonly year: number;
  readonly status: BackofficeSeasonStatus;
  readonly scheduleLabel: string;
  readonly teamCount: number;
  readonly matchdayCount: number;
}

export interface BackofficeSeasonTeamSummary {
  readonly id: string;
  readonly name: string;
  readonly shortName: string;
}

export interface BackofficeSeasonMatchdaySummary {
  readonly id: string;
  readonly label: string;
  readonly scheduledDateLabel: string;
  readonly statusLabel: string;
}

export interface BackofficeSeasonStandingEntry {
  readonly rank: number;
  readonly teamName: string;
  readonly points: number;
  readonly playedMatches: number;
  readonly gameDifference: number;
}

export interface BackofficeSeasonDetail extends BackofficeSeasonSummary {
  readonly notes: readonly string[];
  readonly teams: readonly BackofficeSeasonTeamSummary[];
  readonly matchdays: readonly BackofficeSeasonMatchdaySummary[];
  readonly standings: readonly BackofficeSeasonStandingEntry[];
}
