import type { PlayerHttp, PlayoffStage } from '../api/types';
import type { Season } from '../league-status';

export type PublicStatus = 'completed' | 'current' | 'upcoming';

export interface TeamPalette {
	primary: string;
	accent: string;
	surface: string;
	glow: string;
	contrast: string;
}

export interface PublicPlayer {
	id: string;
	slug: string;
	displayName: string;
	firstName: string;
	lastName: string;
	alias?: string;
	profileImage: string | null;
	isPresident: boolean;
	preferredPosition: PlayerHttp['preferredPosition'];
	positionLabel: string;
	teamId?: string;
	teamSlug?: string;
	teamName: string;
	totalPoints: number;
	wonGames: number;
	lostGames: number;
	rank: number;
}

export interface PublicTeam {
	id: string;
	slug: string;
	name: string;
	description: string;
	tagline: string;
	presidentLabel: string;
	logoPath: string | null;
	monogram: string;
	palette: TeamPalette;
	players: PublicPlayer[];
}

export interface PairLineup {
	players: Pick<PublicPlayer, 'id' | 'slug' | 'displayName' | 'positionLabel'>[];
}

export interface PairResult {
	id: string;
	label: string;
	homePair: PairLineup;
	awayPair: PairLineup;
	homeScoreLabel: string;
	awayScoreLabel: string;
	winnerTeamId: string | null;
}

export interface PublicEncounter {
	id: string;
	homeTeam: PublicTeam;
	awayTeam: PublicTeam;
	homeScore: number;
	awayScore: number;
	status: PublicStatus;
	scheduledAt: string;
	scheduledAtLabel: string;
	pairResults: PairResult[];
}

export interface PublicMatchday {
	id: string;
	number: number;
	label: string;
	status: PublicStatus;
	date: string;
	dateLabel: string;
	encounters: PublicEncounter[];
	byeTeam: PublicTeam | null;
}

export interface PublicPlayoffMatch {
	id: string;
	stage: PlayoffStage;
	stageLabel: string;
	homeTeam: PublicTeam;
	awayTeam: PublicTeam | null;
	homeScore: number;
	awayScore: number | null;
	status: PublicStatus;
	scheduledAt: string;
	scheduledAtLabel: string;
	pairResults: PairResult[];
}

export interface PublicPlayoffRound {
	stage: PlayoffStage;
	label: string;
	matches: PublicPlayoffMatch[];
}

export interface PublicPlayoff {
	id: string;
	name: string;
	rounds: PublicPlayoffRound[];
}

export interface Standing {
	team: PublicTeam;
	rank: number;
	points: number;
	playedMatches: number;
	gameDifference: number;
}

export interface PublicLeagueView {
	season: Season;
	phaseLabel: 'Pretemporada' | 'Fase regular' | 'Playoffs' | 'Temporada finalizada';
	teams: PublicTeam[];
	players: PublicPlayer[];
	matchdays: PublicMatchday[];
	playoffs: PublicPlayoff[];
	standings: Standing[];
	focusMatchday: PublicMatchday | null;
	focusPlayoffMatch: PublicPlayoffMatch | null;
}
