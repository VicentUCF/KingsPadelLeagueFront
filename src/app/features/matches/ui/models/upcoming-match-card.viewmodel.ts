import { type PadelMatch } from '@features/matches/domain/entities/padel-match.entity';

export interface UpcomingMatchCardViewModel {
  readonly id: string;
  readonly clubName: string;
  readonly courtName: string;
  readonly scheduledAt: Date;
  readonly confirmedPlayers: readonly string[];
  readonly confirmedPlayersCount: number;
  readonly requiredPlayersCount: number;
  readonly isReady: boolean;
  readonly statusLabel: string;
}

export function toUpcomingMatchCardViewModel(match: PadelMatch): UpcomingMatchCardViewModel {
  return {
    id: match.id,
    clubName: match.clubName,
    courtName: match.courtName,
    scheduledAt: match.scheduledAt,
    confirmedPlayers: match.confirmedPlayers,
    confirmedPlayersCount: match.confirmedPlayers.length,
    requiredPlayersCount: match.requiredPlayersCount,
    isReady: match.isReady,
    statusLabel: match.isReady ? 'Ready to play' : `${match.missingPlayersCount} players missing`,
  };
}
