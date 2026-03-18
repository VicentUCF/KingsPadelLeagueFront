import { normalizeToSlug } from './normalize-to-slug';

export interface PlayerSlugSource {
  readonly id: string;
  readonly displayName: string;
}

export function createPlayerSlugById(
  players: readonly PlayerSlugSource[],
): ReadonlyMap<string, string> {
  const slugOccurrences = new Map<string, number>();

  return new Map(
    players.map((player) => {
      const baseSlug = normalizeToSlug(player.displayName) || player.id;
      const currentCount = slugOccurrences.get(baseSlug) ?? 0;

      slugOccurrences.set(baseSlug, currentCount + 1);

      return [player.id, currentCount === 0 ? baseSlug : `${baseSlug}-${currentCount + 1}`];
    }),
  );
}
