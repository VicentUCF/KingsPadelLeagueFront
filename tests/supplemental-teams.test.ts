import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

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

		assert.equal(supplemented.teams.length, 1);
		assert.deepEqual(supplemented.teams[0], {
			id: 'team-red',
			name: 'RedLions',
			description: 'Orgullo y potencia competitiva.',
			secondaryDescription: 'Rugido rojo.',
			logo: '',
			primaryColor: '#d62f35',
		});
		assert.equal(data.teams.length, 0, 'no modifica los datos recibidos de la API');
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

		assert.equal(supplemented, data);
		assert.deepEqual(supplemented.teams, [backendTeam]);
	});
});
