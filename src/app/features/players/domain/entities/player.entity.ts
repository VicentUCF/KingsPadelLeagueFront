export type PlayerSide = 'derecha' | 'reves' | 'ambas';

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
