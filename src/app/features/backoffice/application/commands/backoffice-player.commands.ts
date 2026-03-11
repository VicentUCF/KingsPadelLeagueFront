import { type BackofficePlayerStatus } from '../../domain/entities/backoffice-player.entity';

export interface CreateBackofficePlayerCommand {
  readonly fullName: string;
  readonly nickName: string;
  readonly avatarPath: string | null;
  readonly preferredSideLabel: string;
  readonly linkedUserEmail: string | null;
  readonly status: BackofficePlayerStatus;
  readonly currentTeamId: string | null;
}

export interface UpdateBackofficePlayerCommand extends CreateBackofficePlayerCommand {
  readonly id: string;
}

export interface ChangeStatusBackofficePlayerCommand {
  readonly playerId: string;
  readonly targetStatus: 'INACTIVE';
}
