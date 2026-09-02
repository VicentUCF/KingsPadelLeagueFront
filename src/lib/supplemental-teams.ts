import type { PublicLeagueData, TeamHttp } from './api/types';
import { normalizeSlug } from './domain/shared.ts';

const REDLIONS_TEAM: TeamHttp = {
	id: 'team-red',
	name: 'RedLions',
	description: 'Orgullo y potencia competitiva.',
	secondaryDescription: 'Rugido rojo.',
	logo: '',
	primaryColor: '#d62f35',
};

const REDLIONS_SLUGS = new Set(['redlions', 'red-lions']);

/**
 * Completes temporary gaps in the public API without overriding its data.
 * Once RedLions is returned by the backend, that canonical record wins.
 */
export function includeSupplementalTeams(data: PublicLeagueData): PublicLeagueData {
	const hasRedLions = data.teams.some((team) => REDLIONS_SLUGS.has(normalizeSlug(team.name)));
	if (hasRedLions) return data;

	return { ...data, teams: [...data.teams, REDLIONS_TEAM] };
}
