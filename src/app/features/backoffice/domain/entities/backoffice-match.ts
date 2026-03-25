export type BackofficeMatchStatus = 'scheduled' | 'in_progress' | 'finished';

export interface BackofficeMatch {
  readonly id: string;
  readonly matchdayId: string;
  readonly localTeamId: string;
  readonly awayTeamId: string;
  readonly localTeamScorePoints: number;
  readonly awayTeamScorePoints: number;
  readonly scheduledAt: Date;
  readonly status: BackofficeMatchStatus;
  readonly mvpId: string | null;
}
