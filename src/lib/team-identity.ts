import type { PublicTeam } from './domain/types';

/**
 * Serialises the central team brand contract into CSS custom properties so every
 * club surface can share the same treatment without coupling CSS to team slugs.
 */
export function teamThemeStyle(team: Pick<PublicTeam, 'palette'>): string {
	const { palette } = team;
	return [
		`--team-primary:${palette.primary}`,
		`--team-accent:${palette.accent}`,
		`--team-surface:${palette.surface}`,
		`--team-glow:${palette.glow}`,
		`--team-contrast:${palette.contrast}`,
	].join(';');
}
