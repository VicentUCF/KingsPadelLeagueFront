import type { MatchdayStatus } from '../league-status';
import type { PairLineup, PublicPlayer, PublicStatus } from './types';

export function groupBy<T>(values: readonly T[], key: (value: T) => string): Map<string, T[]> {
	const groups = new Map<string, T[]>();
	for (const value of values) groups.set(key(value), [...(groups.get(key(value)) ?? []), value]);
	return groups;
}

export function createPairLineup(
	player1Id: string,
	player2Id: string,
	playerById: ReadonlyMap<string, PublicPlayer>,
): PairLineup {
	return {
		players: [player1Id, player2Id]
			.map((id) => playerById.get(id)!)
			.map(({ id, slug, displayName, positionLabel }) => ({
				id,
				slug,
				displayName,
				positionLabel,
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
