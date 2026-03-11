import { type BackofficePlayerStatus } from '../../domain/entities/backoffice-player.entity';
import { type BackofficeSeasonStatus } from '../../domain/entities/backoffice-season-status';

export type BackofficeCrudFormMode = 'create' | 'edit';

export interface BackofficeConfirmDialogConfig {
  readonly title: string;
  readonly description: string;
  readonly confirmLabel: string;
  readonly confirmTone: 'neutral' | 'danger';
}

export interface BackofficeSeasonFormValue {
  readonly name: string;
  readonly year: number;
  readonly startDate: string;
  readonly endDate: string;
  readonly notes: readonly string[];
  readonly status: Extract<BackofficeSeasonStatus, 'DRAFT' | 'ACTIVE'>;
}

export interface BackofficeTeamFormValue {
  readonly name: string;
  readonly shortName: string;
  readonly presidentName: string;
  readonly primaryColor: string;
  readonly secondaryColor: string;
}

export interface BackofficeTeamOption {
  readonly id: string;
  readonly label: string;
}

export interface BackofficePlayerFormValue {
  readonly fullName: string;
  readonly nickName: string;
  readonly avatarPath: string | null;
  readonly preferredSideLabel: string;
  readonly linkedUserEmail: string | null;
  readonly status: BackofficePlayerStatus;
  readonly currentTeamId: string | null;
}
