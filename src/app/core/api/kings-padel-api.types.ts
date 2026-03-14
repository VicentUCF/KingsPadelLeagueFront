export interface PaginationMetaHttp {
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}

export interface PaginatedResponse<T> {
  readonly items: T[];
  readonly meta: PaginationMetaHttp;
}

export interface TeamHttpV1 {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly secondaryDescription: string;
  readonly logo: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdById: string;
  readonly version: number;
}

export interface PlayerHttpV1 {
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
  readonly updatedAt: string;
  readonly createdById: string;
  readonly version: number;
}

export interface MatchdayHttpV1 {
  readonly id: string;
  readonly name: string;
  readonly scheduledAt: string;
  readonly seasonId: string;
  readonly status: 'finished' | 'in_progress' | 'scheduled';
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly version: number;
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
  readonly version: number;
}

export interface MatchTeamLineUpHttpV1 {
  readonly id: string;
  readonly matchId: string;
  readonly teamId: string;
  readonly status: 'pending' | 'submited';
  readonly createdAt: string;
  readonly version: number;
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
  readonly version: number;
}
