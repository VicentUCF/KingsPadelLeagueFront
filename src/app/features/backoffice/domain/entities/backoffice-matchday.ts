export type BackofficeMatchdayStatus = 'finished' | 'in_progress' | 'scheduled';

export interface BackofficeMatchday {
  readonly id: string;
  readonly name: string;
  readonly scheduledAt: string;
  readonly seasonId: string;
  readonly status: BackofficeMatchdayStatus;
}
