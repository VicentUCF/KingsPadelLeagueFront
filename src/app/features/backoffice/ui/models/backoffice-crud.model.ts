export type BackofficeCrudFormMode = 'create' | 'edit';

export interface BackofficeTeamFormValue {
  readonly name: string;
  readonly shortName: string;
  readonly presidentName: string;
  readonly primaryColor: string;
  readonly secondaryColor: string;
}

export interface BackofficePlayerFormValue {
  readonly fullName: string;
  readonly nickName: string;
  readonly avatarPath: string | null;
  readonly preferredSideLabel: string;
  readonly currentTeamId: string | null;
  readonly linkedUserEmail: string | null;
  readonly status: 'ACTIVE' | 'INACTIVE';
}

export interface BackofficeSeasonFormValue {
  readonly name: string;
  readonly year: number;
  readonly startDate: string;
  readonly endDate: string;
  readonly notes: readonly string[];
  readonly status: 'DRAFT' | 'ACTIVE';
}

export interface BackofficeTeamOption {
  readonly id: string;
  readonly name: string;
  readonly label: string;
}
