const DEFAULT_SEASON_STARTS_AT = '2026-09-20T00:00:00+02:00';

export const PUBLIC_SEASON_NAME = import.meta.env.KPL_PUBLIC_SEASON_NAME?.trim() || 'Temporada 2';

export const SEASON_STARTS_AT =
	import.meta.env.KPL_SEASON_STARTS_AT?.trim() || DEFAULT_SEASON_STARTS_AT;

export const SEASON_STARTS_LABEL = '20 de septiembre';

export function isPublicPreseason(now = new Date()): boolean {
	const override = import.meta.env.KPL_PRESEASON_MODE?.trim().toLowerCase();
	if (override === 'true') return true;
	if (override === 'false') return false;
	return now.getTime() < Date.parse(SEASON_STARTS_AT);
}
