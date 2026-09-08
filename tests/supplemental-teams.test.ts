import { describe, expect, it } from 'vitest';

import type { PublicLeagueData, TeamHttp } from '../src/lib/kpl-api.ts';
import { includeSupplementalTeams } from '../src/lib/supplemental-teams.ts';

function dataWithTeams(teams: TeamHttp[]): PublicLeagueData {
	return {
		seasons: [],
		matchdays: [],
		teams,
		players: [],
		matches: [],
		lineups: [],
		lineupPairs: [],
		pairMatches: [],
		seasonPlayerScores: [],
		seasonTeamScores: [],
		playoffs: [],
		playoffMatches: [],
		playoffLineups: [],
		playoffLineupPairs: [],
		playoffPairMatches: [],
	};
}

describe('includeSupplementalTeams', () => {
	it('añade RedLions mientras el backend no lo devuelve', () => {
		const data = dataWithTeams([]);

		const supplemented = includeSupplementalTeams(data);

		expect(supplemented.teams.length).toBe(1);
		expect(supplemented.teams[0]).toEqual({
			id: 'team-red',
			name: 'RedLions',
			description: 'Orgullo y potencia competitiva.',
			secondaryDescription: 'Rugido rojo.',
			logo: '',
			primaryColor: '#d62f35',
		});
		expect(data.teams.length).toBe(0);
	});

	it('conserva el registro del backend sin duplicarlo cuando ya existe', () => {
		const backendTeam: TeamHttp = {
			id: 'backend-redlions',
			name: 'Red Lions',
			description: 'Descripción oficial',
			secondaryDescription: 'Lema oficial',
			logo: 'https://example.com/red-lions.webp',
		};
		const data = dataWithTeams([backendTeam]);

		const supplemented = includeSupplementalTeams(data);

		expect(supplemented).toBe(data);
		expect(supplemented.teams).toEqual([backendTeam]);
	});
});
