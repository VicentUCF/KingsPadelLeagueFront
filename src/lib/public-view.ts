import { loadPublicLeagueData } from './kpl-api';
import { createPublicLeagueView, type PublicLeagueView } from './public-league';

let viewPromise: Promise<PublicLeagueView> | null = null;

export function loadPublicLeagueView(): Promise<PublicLeagueView> {
	viewPromise ??= loadPublicLeagueData().then((data) => createPublicLeagueView(data));
	return viewPromise;
}
