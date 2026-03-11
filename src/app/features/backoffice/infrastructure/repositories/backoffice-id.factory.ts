export function createSeasonId(year: number, existingIds: readonly string[]): string {
  return createUniqueId(`season-${year}`, existingIds);
}

export function createTeamId(name: string, existingIds: readonly string[]): string {
  return createUniqueId(toKebabCase(name), existingIds);
}

export function createPlayerId(fullName: string, existingIds: readonly string[]): string {
  return createUniqueId(`player-${toKebabCase(fullName)}`, existingIds);
}

function createUniqueId(baseId: string, existingIds: readonly string[]): string {
  if (!existingIds.includes(baseId)) {
    return baseId;
  }

  let suffix = 2;

  while (existingIds.includes(`${baseId}-${suffix}`)) {
    suffix += 1;
  }

  return `${baseId}-${suffix}`;
}

function toKebabCase(value: string): string {
  return value
    .normalize('NFD')
    .replaceAll(/\p{Diacritic}/gu, '')
    .trim()
    .toLocaleLowerCase('es')
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-+|-+$/g, '');
}
