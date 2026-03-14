export interface BackofficeMatch {
  readonly id: string;
  readonly matchdayId: string;
  readonly localTeamId: string;
  readonly awayTeamId: string;
  readonly localTeamScorePoints: number;
  readonly awayTeamScorePoints: number;
  readonly scheduledAt: Date;
  readonly mvpId: string | null;
}
