export type BackofficePlayerPosition = 'both' | 'left' | 'right';

export interface BackofficePlayer {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly alias?: string;
  readonly email: string;
  readonly profileImage: string;
  readonly isPresident: boolean;
  readonly teamId?: string;
  readonly value: number;
  readonly wonGames: number;
  readonly lostGames: number;
  readonly preferredPosition: BackofficePlayerPosition;
  readonly description: string;
  readonly instagramUrl?: string;
}
