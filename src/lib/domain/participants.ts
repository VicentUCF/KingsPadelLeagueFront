import type { PlayerHttp, PublicLeagueData, TeamHttp } from '../api/types';
import { groupBy, normalizeSlug } from './shared.ts';
import type { PublicPlayer, PublicTeam, TeamPalette, TeamSignature } from './types';

export interface LeagueParticipants {
	players: PublicPlayer[];
	teams: PublicTeam[];
	playerById: ReadonlyMap<string, PublicPlayer>;
	teamById: ReadonlyMap<string, PublicTeam>;
}

const DEFAULT_PALETTE: TeamPalette = {
	primary: '#e0bb45',
	accent: '#f5e3a3',
	surface: '#1d1710',
	glow: 'rgb(224 187 69 / 0.42)',
	contrast: '#0b0b0b',
};

interface TeamBranding {
	logoPath: string | null;
	palette: TeamPalette;
	signature?: TeamSignature;
}

const TEAM_BRANDING: Record<string, TeamBranding> = {
	'kings-of-favar': {
		logoPath: '/team-identities/kings-of-favar/logo.svg',
		palette: {
			primary: '#D1007A',
			accent: '#efe2cc',
			surface: '#16181a',
			glow: 'rgb(209 0 122 / 0.42)',
			contrast: '#0b0b10',
		},
		signature: {
			secondaryMarkPath: '/team-identities/kings-of-favar/crown.svg',
			motto: 'Born in Favar, built to win',
			edition: '2026',
		},
	},
	titanics: {
		logoPath: '/teams_logos/titanics_no_bg.webp',
		palette: {
			primary: '#84d5ff',
			accent: '#f2f8ff',
			surface: '#0c2034',
			glow: 'rgb(132 213 255 / 0.4)',
			contrast: '#041018',
		},
	},
	barbaridad: {
		logoPath: '/teams_logos/barbarida_no_bg.webp',
		palette: {
			primary: '#ff7848',
			accent: '#ffd0b5',
			surface: '#2a140f',
			glow: 'rgb(255 120 72 / 0.38)',
			contrast: '#140806',
		},
	},
	'barbaridad-team': {
		logoPath: '/teams_logos/barbarida_no_bg.webp',
		palette: {
			primary: '#ff7848',
			accent: '#ffd0b5',
			surface: '#2a140f',
			glow: 'rgb(255 120 72 / 0.38)',
			contrast: '#140806',
		},
	},
	'magic-city': {
		logoPath: '/teams_logos/magic_ng_bg.webp',
		palette: {
			primary: '#69f6d1',
			accent: '#c7ffef',
			surface: '#0d2721',
			glow: 'rgb(105 246 209 / 0.36)',
			contrast: '#05100f',
		},
	},
	redlions: {
		logoPath: '/teams_logos/redlions.webp',
		palette: {
			primary: '#d62f35',
			accent: '#f7d36b',
			surface: '#101827',
			glow: 'rgb(214 47 53 / 0.38)',
			contrast: '#080d16',
		},
	},
	'house-perez': {
		logoPath: null,
		palette: {
			primary: '#f06bb5',
			accent: '#ffd4ef',
			surface: '#29111f',
			glow: 'rgb(240 107 181 / 0.38)',
			contrast: '#12070d',
		},
	},
	thormentadores: {
		logoPath: '/teams_logos/Thormentadores.webp',
		palette: {
			primary: '#8da5ff',
			accent: '#dfe5ff',
			surface: '#171b32',
			glow: 'rgb(141 165 255 / 0.38)',
			contrast: '#090b16',
		},
	},
};

export function createLeagueParticipants(
	data: PublicLeagueData,
	seasonId: string,
): LeagueParticipants {
	const rawPlayersByTeam = groupBy(
		data.players.filter((player) => player.teamId),
		(player) => player.teamId!,
	);
	const playerSlugById = createUniqueSlugs(
		data.players.map((player) => ({ id: player.id, label: playerName(player) })),
	);
	const scoreByPlayerId = new Map(
		data.seasonPlayerScores
			.filter((score) => score.seasonId === seasonId)
			.map((score) => [score.playerId, score]),
	);
	const teamHttpById = new Map(data.teams.map((team) => [team.id, team]));
	const teamSlugById = new Map(
		data.teams.map((team) => [team.id, normalizeSlug(team.name) || team.id]),
	);
	const players: PublicPlayer[] = data.players.map((player) => {
		const score = scoreByPlayerId.get(player.id);
		const team = player.teamId ? teamHttpById.get(player.teamId) : undefined;
		return {
			id: player.id,
			slug: playerSlugById.get(player.id)!,
			displayName: playerName(player),
			firstName: player.firstName,
			lastName: player.lastName,
			alias: player.alias,
			profileImage: resolveImage(player.profileImage),
			isPresident: player.isPresident,
			preferredPosition: player.preferredPosition,
			positionLabel: positionLabel(player.preferredPosition),
			teamId: player.teamId,
			teamSlug: player.teamId ? teamSlugById.get(player.teamId) : undefined,
			teamName: team?.name ?? 'Agente libre',
			totalPoints: score?.totalPoints ?? player.totalPoints ?? 0,
			wonGames: score?.wonPairMatches ?? player.wonGames ?? 0,
			lostGames: score?.lostPairMatches ?? player.lostGames ?? 0,
			rank: 0,
		};
	});

	players.sort(comparePlayers).forEach((player, index) => {
		player.rank = index + 1;
	});
	const playerById = new Map(players.map((player) => [player.id, player]));
	const teams = data.teams
		.map((team) => createTeam(team, rawPlayersByTeam.get(team.id) ?? [], playerById))
		.sort((left, right) => left.name.localeCompare(right.name, 'es'));
	return {
		players,
		teams,
		playerById,
		teamById: new Map(teams.map((team) => [team.id, team])),
	};
}

function createTeam(
	team: TeamHttp,
	rawPlayers: readonly PlayerHttp[],
	playerById: ReadonlyMap<string, PublicPlayer>,
): PublicTeam {
	const slug = normalizeSlug(team.name) || team.id;
	const branding = TEAM_BRANDING[slug];
	const roster = rawPlayers
		.map((player) => playerById.get(player.id))
		.filter((player): player is PublicPlayer => Boolean(player))
		.sort(
			(left, right) =>
				Number(right.isPresident) - Number(left.isPresident) ||
				left.displayName.localeCompare(right.displayName, 'es'),
		);
	const presidents = roster
		.filter((player) => player.isPresident)
		.map((player) => player.displayName);

	return {
		id: team.id,
		slug,
		name: team.name,
		description:
			meaningfulText(team.description) ??
			meaningfulText(team.secondaryDescription) ??
			'La identidad pública del equipo todavía no se ha publicado de forma oficial.',
		tagline: meaningfulText(team.secondaryDescription) ?? 'Equipo inscrito en Kings Padel League.',
		presidentLabel: presidents.length
			? presidents.join(' · ')
			: (roster[0]?.displayName ?? 'Presidencia pendiente'),
		logoPath: branding?.logoPath ?? resolveImage(team.logo),
		monogram: monogram(team.name),
		palette: branding?.palette ?? DEFAULT_PALETTE,
		signature: branding?.signature,
		players: roster,
	};
}

function createUniqueSlugs(values: readonly { id: string; label: string }[]): Map<string, string> {
	const occurrences = new Map<string, number>();
	return new Map(
		values.map(({ id, label }) => {
			const base = normalizeSlug(label) || id;
			const count = occurrences.get(base) ?? 0;
			occurrences.set(base, count + 1);
			return [id, count ? `${base}-${count + 1}` : base];
		}),
	);
}

function comparePlayers(left: PublicPlayer, right: PublicPlayer): number {
	return (
		right.totalPoints - left.totalPoints ||
		right.wonGames - left.wonGames ||
		left.lostGames - right.lostGames ||
		left.displayName.localeCompare(right.displayName, 'es')
	);
}

function playerName(player: PlayerHttp): string {
	return player.alias?.trim() || [player.firstName, player.lastName].filter(Boolean).join(' ');
}

function positionLabel(position: PlayerHttp['preferredPosition']): string {
	return position === 'left' ? 'Revés' : position === 'right' ? 'Drive' : 'Ambos lados';
}

function meaningfulText(value: string): string | null {
	const trimmed = value.trim();
	return trimmed && !['description', 'secondary description'].includes(trimmed.toLowerCase())
		? trimmed
		: null;
}

function resolveImage(value: string): string | null {
	return value && !value.includes('placeholder.com') ? value : null;
}

function monogram(value: string): string {
	return value
		.split(' ')
		.filter(Boolean)
		.slice(-2)
		.map((word) => word[0]?.toUpperCase() ?? '')
		.join('');
}
