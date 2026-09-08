import type { MatchdayStatus } from '../league-status';
import type { PairLineup, PublicPlayer, PublicStatus } from './types';

export function groupBy<T>(values: readonly T[], key: (value: T) => string): Map<string, T[]> {
	const groups = new Map<string, T[]>();
	for (const value of values) groups.set(key(value), [...(groups.get(key(value)) ?? []), value]);
	return groups;
}

/**
 * Reads `id` from `byId` or throws. Referential integrity between the
 * collections that feed these maps is checked once in domain/validation.ts;
 * this is the runtime backstop if that invariant is ever violated, instead
 * of silently continuing with `undefined`.
 */
export function requireById<T>(byId: ReadonlyMap<string, T>, id: string, context: string): T {
	const value = byId.get(id);
	if (value === undefined) throw new Error(`${context}: no se encontró "${id}".`);
	return value;
}

export function createPairLineup(
	player1Id: string,
	player2Id: string,
	playerById: ReadonlyMap<string, PublicPlayer>,
): PairLineup {
	return {
		players: [player1Id, player2Id]
			.map((id) => requireById(playerById, id, 'Jugador de la pareja'))
			.map(({ id, slug, firstName, lastName, alias }) => ({
				id,
				slug,
				firstName,
				lastName,
				alias,
			})),
	};
}

export function mapStatus(status: MatchdayStatus): PublicStatus {
	return status === 'finished' ? 'completed' : status === 'in_progress' ? 'current' : 'upcoming';
}

export function normalizeSlug(value: string): string {
	return value
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.replace(/[^a-zA-Z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
		.toLowerCase();
}

export function formatDate(value: string): string {
	return capitalize(
		new Intl.DateTimeFormat('es-ES', { dateStyle: 'long', timeZone: 'Europe/Madrid' }).format(
			new Date(value),
		),
	);
}

export function formatDateTime(value: string): string {
	return capitalize(
		new Intl.DateTimeFormat('es-ES', {
			dateStyle: 'medium',
			timeStyle: 'short',
			timeZone: 'Europe/Madrid',
		}).format(new Date(value)),
	);
}

export function byId<T extends { id: string }>(left: T, right: T): number {
	return left.id.localeCompare(right.id, 'es');
}

function capitalize(value: string): string {
	return value.charAt(0).toUpperCase() + value.slice(1);
}
