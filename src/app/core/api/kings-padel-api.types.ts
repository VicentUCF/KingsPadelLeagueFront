export interface PaginationMetaHttp {
  readonly currentPage: number;
  readonly itemCount: number;
  readonly itemsPerPage: number;
  readonly totalItems: number;
  readonly totalPages: number;
}

export interface PaginatedResponse<T> {
  readonly items: readonly T[];
  readonly meta: PaginationMetaHttp;
}

export interface TeamHttpV1 {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly secondaryDescription: string;
  readonly logo: string;
  readonly primaryColor?: string;
  readonly createdAt: string;
  readonly updatedAt?: string;
  readonly createdById?: string;
  readonly updatedById?: string;
  readonly version?: number;
}

export interface PlayerHttpV1 {
  readonly id: string;
  readonly createdAt: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly alias?: string;
  readonly email: string;
  readonly profileImage: string;
  readonly isPresident: boolean;
  readonly teamId?: string;
  readonly role?: string;
  readonly value?: number | null;
  readonly wonGames?: number | null;
  readonly lostGames?: number | null;
  readonly preferredPosition: 'both' | 'left' | 'right';
  readonly description: string;
  readonly instagramUrl?: string;
}

export interface SeasonHttpV1 {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly createdAt: string;
  readonly updatedAt?: string;
  readonly createdById?: string;
  readonly updatedById?: string;
  readonly version?: number;
}

export interface MatchdayHttpV1 {
  readonly id: string;
  readonly name: string;
  readonly scheduledAt: string;
  readonly seasonId: string;
  readonly status: 'finished' | 'in_progress' | 'scheduled';
  readonly createdAt: string;
  readonly updatedAt?: string;
  readonly createdById?: string;
  readonly updatedById?: string;
  readonly version?: number;
}

export interface MatchHttpV1 {
  readonly id: string;
  readonly matchdayId: string;
  readonly localTeamId: string;
  readonly awayTeamId: string;
  readonly localTeamScorePoints: number;
  readonly awayTeamScorePoints: number;
  readonly scheduledAt: string;
  readonly mvpId?: string | null;
  readonly createdAt: string;
  readonly updatedAt?: string;
  readonly createdById?: string;
  readonly updatedById?: string;
  readonly version?: number;
}

export interface MatchTeamLineUpHttpV1 {
  readonly id: string;
  readonly matchId: string;
  readonly teamId: string;
  readonly status: 'pending' | 'submited';
  readonly createdAt: string;
  readonly updatedAt?: string;
  readonly createdById?: string;
  readonly updatedById?: string;
  readonly version?: number;
}

export interface MatchTeamLineUpPairHttpV1 {
  readonly id: string;
  readonly matchTeamLineUpId: string;
  readonly player1Id: string;
  readonly player2Id: string;
  readonly totalPlayersValue: number;
  readonly wonGame?: boolean | null;
  readonly sets?: readonly { readonly localScore: number; readonly awayScore: number }[];
  readonly createdAt: string;
  readonly updatedAt?: string;
  readonly createdById?: string;
  readonly updatedById?: string;
  readonly version?: number;
}

export interface PairMatchSetHttpV1 {
  readonly local: number;
  readonly away: number;
}

export interface PairMatchHttpV1 {
  readonly id: string;
  readonly localLineUpPairId: string;
  readonly awayLineUpPairId: string;
  readonly status: 'finished' | 'in_progress' | 'scheduled';
  readonly setsResult?: readonly PairMatchSetHttpV1[];
  readonly createdAt: string;
  readonly updatedAt?: string;
  readonly createdById?: string;
  readonly updatedById?: string;
  readonly version?: number;
}
