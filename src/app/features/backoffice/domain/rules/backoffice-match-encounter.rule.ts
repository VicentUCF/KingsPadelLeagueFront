export interface BackofficeMatchEncounter {
  readonly localTeamId: string;
  readonly awayTeamId: string;
}

export function createBackofficeMatchEncounterKey(localTeamId: string, awayTeamId: string): string {
  return [localTeamId, awayTeamId].sort().join('::');
}

export function hasBackofficeMatchEncounterDuplicate(
  matches: readonly BackofficeMatchEncounter[],
  localTeamId: string,
  awayTeamId: string,
): boolean {
  if (!localTeamId || !awayTeamId) {
    return false;
  }

  const targetKey = createBackofficeMatchEncounterKey(localTeamId, awayTeamId);

  return matches.some(
    (match) => createBackofficeMatchEncounterKey(match.localTeamId, match.awayTeamId) === targetKey,
  );
}
