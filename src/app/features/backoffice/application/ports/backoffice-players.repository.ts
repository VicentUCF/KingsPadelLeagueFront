import type { BackofficePlayer } from '@features/backoffice/domain/entities/backoffice-player';

export interface BackofficePlayerUpdate {
  readonly alias?: string;
  readonly firstName?: string;
  readonly instagramUrl?: string;
  readonly lastName?: string;
  readonly preferredPosition?: 'both' | 'left' | 'right';
  readonly profileImage?: string;
}

export abstract class BackofficePlayersRepository {
  abstract loadAll(): Promise<readonly BackofficePlayer[]>;
  abstract update(id: string, input: BackofficePlayerUpdate): Promise<void>;
}
