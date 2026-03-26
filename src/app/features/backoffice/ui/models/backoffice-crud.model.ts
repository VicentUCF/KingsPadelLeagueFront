export type BackofficeCrudFormMode = 'create' | 'edit';

export interface BackofficeTeamFormValue {
  readonly name: string;
  readonly shortName: string;
  readonly presidentName: string;
  readonly primaryColor: string;
  readonly secondaryColor: string;
}

export interface BackofficePlayerFormValue {
  readonly firstName: string;
  readonly lastName: string;
  readonly alias: string | null;
  readonly profileImage: string | null;
  readonly preferredPosition: 'both' | 'left' | 'right';
  readonly instagramUrl: string | null;
  readonly email: string;
  readonly teamLabel: string;
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
