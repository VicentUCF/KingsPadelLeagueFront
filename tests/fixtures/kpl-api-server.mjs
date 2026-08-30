import { createServer } from 'node:http';

const port = Number(process.env.KPL_FIXTURE_PORT ?? 43999);
const season = {
	id: 'season-2026',
	name: 'Temporada 2026',
	description: 'Temporada oficial',
	startsAt: '2026-08-01T00:00:00.000Z',
	endsAt: '2026-10-31T23:59:59.000Z',
};
const teams = [
	{
		id: 'team-kings',
		name: 'Kings of Favar',
		description: 'El reino compite con ambición.',
		secondaryDescription: 'Coraje, precisión y corona.',
		logo: '',
		primaryColor: '#f3c84b',
	},
	{
		id: 'team-titanics',
		name: 'Titanics',
		description: 'Una marea difícil de detener.',
		secondaryDescription: 'La fuerza del océano.',
		logo: '',
		primaryColor: '#84d5ff',
	},
	{
		id: 'team-magic',
		name: 'Magic City',
		description: 'Talento y creatividad en pista.',
		secondaryDescription: 'La magia se juega.',
		logo: '',
		primaryColor: '#69f6d1',
	},
	{
		id: 'team-red',
		name: 'Redlions',
		description: 'Orgullo y potencia competitiva.',
		secondaryDescription: 'Rugido rojo.',
		logo: '',
		primaryColor: '#d62f35',
	},
];
const players = teams.flatMap((team, teamIndex) =>
	[0, 1].map((playerIndex) => ({
		id: `player-${teamIndex}-${playerIndex}`,
		firstName: ['Alex', 'Mar', 'Dani', 'Leo', 'Nora', 'Pau', 'Iris', 'Jan'][
			teamIndex * 2 + playerIndex
		],
		lastName: ['Rey', 'Costa', 'Marín', 'Azul', 'Vega', 'Mago', 'Rojo', 'León'][
			teamIndex * 2 + playerIndex
		],
		alias: playerIndex === 0 ? ['King', 'Ice', 'Nova', 'Roar'][teamIndex] : undefined,
		profileImage: '',
		isPresident: playerIndex === 0,
		teamId: team.id,
		preferredPosition: playerIndex === 0 ? 'left' : 'right',
		totalPoints: 0,
		wonGames: 0,
		lostGames: 0,
	})),
);
const matchdays = [
	{
		id: 'jornada-1',
		name: 'Jornada 1',
		scheduledAt: '2026-08-16T16:00:00.000Z',
		seasonId: season.id,
		status: 'finished',
	},
	{
		id: 'jornada-2',
		name: 'Jornada 2',
		scheduledAt: '2026-08-27T16:00:00.000Z',
		seasonId: season.id,
		status: 'in_progress',
	},
	{
		id: 'jornada-3',
		name: 'Jornada 3',
		scheduledAt: '2026-09-06T16:00:00.000Z',
		seasonId: season.id,
		status: 'scheduled',
	},
];
const matches = [
	{
		id: 'match-1',
		matchdayId: 'jornada-1',
		localTeamId: 'team-kings',
		awayTeamId: 'team-titanics',
		localTeamScorePoints: 2,
		awayTeamScorePoints: 1,
		scheduledAt: '2026-08-16T16:00:00.000Z',
		status: 'finished',
	},
	{
		id: 'match-2',
		matchdayId: 'jornada-1',
		localTeamId: 'team-magic',
		awayTeamId: 'team-red',
		localTeamScorePoints: 1,
		awayTeamScorePoints: 2,
		scheduledAt: '2026-08-16T18:00:00.000Z',
		status: 'finished',
	},
	{
		id: 'match-3',
		matchdayId: 'jornada-2',
		localTeamId: 'team-kings',
		awayTeamId: 'team-magic',
		localTeamScorePoints: 1,
		awayTeamScorePoints: 1,
		scheduledAt: '2026-08-27T16:00:00.000Z',
		status: 'in_progress',
	},
	{
		id: 'match-4',
		matchdayId: 'jornada-2',
		localTeamId: 'team-titanics',
		awayTeamId: 'team-red',
		localTeamScorePoints: 0,
		awayTeamScorePoints: 0,
		scheduledAt: '2026-08-27T18:00:00.000Z',
		status: 'scheduled',
	},
	{
		id: 'match-5',
		matchdayId: 'jornada-3',
		localTeamId: 'team-red',
		awayTeamId: 'team-kings',
		localTeamScorePoints: 0,
		awayTeamScorePoints: 0,
		scheduledAt: '2026-09-06T16:00:00.000Z',
		status: 'scheduled',
	},
	{
		id: 'match-6',
		matchdayId: 'jornada-3',
		localTeamId: 'team-magic',
		awayTeamId: 'team-titanics',
		localTeamScorePoints: 0,
		awayTeamScorePoints: 0,
		scheduledAt: '2026-09-06T18:00:00.000Z',
		status: 'scheduled',
	},
];
const lineups = teams
	.slice(0, 2)
	.map((team) => ({ id: `lineup-${team.id}`, matchId: 'match-1', teamId: team.id }));
const lineupPairs = teams.slice(0, 2).map((team, teamIndex) => ({
	id: `pair-${team.id}`,
	matchTeamLineUpId: `lineup-${team.id}`,
	player1Id: `player-${teamIndex}-0`,
	player2Id: `player-${teamIndex}-1`,
}));
const pairMatches = [
	{
		id: 'pair-match-1',
		localLineUpPairId: 'pair-team-kings',
		awayLineUpPairId: 'pair-team-titanics',
		status: 'finished',
		setsResult: [
			{ local: 6, away: 4 },
			{ local: 6, away: 3 },
		],
	},
];
const scores = players.map((player, index) => ({
	playerId: player.id,
	seasonId: season.id,
	totalPoints: 18 - index,
	wonPairMatches: Math.max(0, 6 - index),
	lostPairMatches: index % 3,
}));

const collections = new Map([
	['/v1/seasons', [season]],
	['/v1/matchdays', matchdays],
	['/v1/teams', teams],
	['/v1/players', players],
	['/v1/matches', matches],
	['/v1/match-team-line-ups', lineups],
	['/v1/match-team-line-up-pairs', lineupPairs],
	['/v1/pair-matches', pairMatches],
	['/v1/season-player-scores', scores],
]);

createServer((request, response) => {
	const pathname = new URL(request.url ?? '/', `http://${request.headers.host}`).pathname;
	const items = collections.get(pathname);
	if (!items) {
		response.writeHead(404);
		response.end();
		return;
	}
	response.writeHead(200, { 'content-type': 'application/json' });
	response.end(JSON.stringify({ items }));
}).listen(port, '127.0.0.1', () => console.log(`Fixture KPL API listening on ${port}`));
