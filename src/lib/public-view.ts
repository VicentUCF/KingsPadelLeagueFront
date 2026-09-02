import { loadPublicLeagueData } from './kpl-api';
import { createPublicLeagueView, type PublicLeagueView } from './public-league';
import { includeSupplementalTeams } from './supplemental-teams';

let viewPromise: Promise<PublicLeagueView> | null = null;

export function loadPublicLeagueView(): Promise<PublicLeagueView> {
	viewPromise ??= loadPublicLeagueData().then((data) =>
		createPublicLeagueView(includeSupplementalTeams(data)),
	);
	return viewPromise;
}
