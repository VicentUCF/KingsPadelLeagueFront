import type { Matchday, MatchdayStatus, Season } from '../league-status';

export interface TeamHttp {
	id: string;
	name: string;
	description: string;
	secondaryDescription: string;
	logo: string;
	primaryColor?: string;
}

export interface PlayerHttp {
	id: string;
	firstName: string;
	lastName: string;
	alias?: string;
	profileImage: string;
	isPresident: boolean;
	teamId?: string;
	preferredPosition: 'both' | 'left' | 'right';
	totalPoints?: number | null;
	wonGames?: number | null;
	lostGames?: number | null;
}

export interface MatchHttp {
	id: string;
	matchdayId: string;
	localTeamId: string;
	awayTeamId: string;
	localTeamScorePoints: number;
	awayTeamScorePoints: number;
	scheduledAt: string;
	mvpId?: string | null;
	status?: MatchdayStatus;
}

export interface LineupHttp {
	id: string;
	matchId: string;
	status?: 'pending' | 'submited';
	teamId: string;
}

export interface LineupPairHttp {
	id: string;
	matchTeamLineUpId: string;
	player1Id: string;
	player2Id: string;
	totalPlayersValue?: number;
}

export interface PairMatchSetHttp {
	local: number;
	away: number;
}

export interface PairMatchHttp {
	id: string;
	localLineUpPairId: string;
	awayLineUpPairId: string;
	order: number;
	status?: MatchdayStatus;
	setsResult: PairMatchSetHttp[];
}

export type PlayoffStage = 'round_of_16' | 'round_of_8' | 'quarter_final' | 'semi_final' | 'final';

export interface PlayoffHttp {
	id: string;
	seasonId: string;
	name: string;
}

export interface PlayoffMatchHttp {
	id: string;
	playoffId: string;
	localTeamId: string;
	awayTeamId: string | null;
	localTeamScorePoints: number;
	awayTeamScorePoints: number | null;
	scheduledAt: string;
	stage: PlayoffStage;
	status: MatchdayStatus;
}

export interface PlayoffLineupHttp {
	id: string;
	playoffMatchId: string;
	status?: 'pending' | 'submited';
	teamId: string;
}

export interface PlayoffLineupPairHttp {
	id: string;
	playoffMatchTeamLineUpId: string;
	player1Id: string;
	player2Id: string;
	totalPlayersValue?: number;
}

export type PlayoffPairMatchHttp = PairMatchHttp;

export interface SeasonPlayerScoreHttp {
	playerId: string;
	seasonId: string;
	totalPoints: number;
	wonPairMatches: number;
	lostPairMatches: number;
}

export interface SeasonTeamScoreHttp {
	seasonId: string;
	teamId: string;
	totalPoints: number;
	wonMatches: number;
	lostMatches: number;
	wonGames: number;
	lostGames: number;
	wonSets: number;
	lostSets: number;
}

export interface PublicLeagueData {
	seasons: Season[];
	matchdays: Matchday[];
	teams: TeamHttp[];
	players: PlayerHttp[];
	matches: MatchHttp[];
	lineups: LineupHttp[];
	lineupPairs: LineupPairHttp[];
	pairMatches: PairMatchHttp[];
	seasonPlayerScores: SeasonPlayerScoreHttp[];
	seasonTeamScores: SeasonTeamScoreHttp[];
	playoffs: PlayoffHttp[];
	playoffMatches: PlayoffMatchHttp[];
	playoffLineups: PlayoffLineupHttp[];
	playoffLineupPairs: PlayoffLineupPairHttp[];
	playoffPairMatches: PlayoffPairMatchHttp[];
}

export interface LeagueHomeData {
	seasons: Season[];
	matchdays: Matchday[];
	playoffs: PlayoffHttp[];
	playoffMatches: PlayoffMatchHttp[];
}
