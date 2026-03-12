export type PlayerSide = 'derecha' | 'reves' | 'ambas';

export const UNASSIGNED_PLAYER_TEAM_ID = 'pending-team-assignment';
export const UNASSIGNED_PLAYER_TEAM_NAME = 'Sin equipo todavía';

export function isPlayerAssignedToTeam(teamId: string): boolean {
  return teamId !== UNASSIGNED_PLAYER_TEAM_ID;
}

export class Player {
  readonly playedMatchesCount: number;

  constructor(
    readonly id: string,
    readonly slug: string,
    readonly displayName: string,
    readonly teamId: string,
    readonly teamName: string,
    readonly teamLogoPath: string | null,
    readonly avatarPath: string | null,
    readonly wonMatchesCount: number,
    readonly lostMatchesCount: number,
    readonly side: PlayerSide = 'ambas',
  ) {
    if (wonMatchesCount < 0 || lostMatchesCount < 0) {
      throw new Error('Player match statistics cannot be negative.');
    }

    this.playedMatchesCount = wonMatchesCount + lostMatchesCount;
  }
}
