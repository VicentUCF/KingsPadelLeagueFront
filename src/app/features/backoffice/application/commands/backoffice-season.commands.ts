import { type BackofficeSeasonStatus } from '../../domain/entities/backoffice-season-status';

export interface CreateBackofficeSeasonCommand {
  readonly name: string;
  readonly year: number;
  readonly startDate: string;
  readonly endDate: string;
  readonly notes: readonly string[];
  readonly status?: Extract<BackofficeSeasonStatus, 'DRAFT' | 'ACTIVE'>;
}

export interface UpdateBackofficeSeasonCommand {
  readonly id: string;
  readonly name: string;
  readonly year: number;
  readonly startDate: string;
  readonly endDate: string;
  readonly notes: readonly string[];
  readonly status: Extract<BackofficeSeasonStatus, 'DRAFT' | 'ACTIVE'>;
}

export interface ChangeStatusBackofficeSeasonCommand {
  readonly seasonId: string;
  readonly targetStatus: Exclude<BackofficeSeasonStatus, 'DRAFT'>;
}
