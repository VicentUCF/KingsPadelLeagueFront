import { type PlayerSide } from '@features/players/domain/entities/player.entity';
import { PUBLIC_LEAGUE_TEAM_CATALOG } from '@shared/data/public-league-catalog.seed';

export interface PlayerSeed {
  readonly id: string;
  readonly slug: string;
  readonly displayName: string;
  readonly teamId: string;
  readonly teamName: string;
  readonly teamLogoPath: string | null;
  readonly avatarPath: string | null;
  readonly wonMatchesCount: number;
  readonly lostMatchesCount: number;
  readonly side: PlayerSide;
}

export const PLAYER_SEED: readonly PlayerSeed[] = PUBLIC_LEAGUE_TEAM_CATALOG.flatMap((team) => {
  return team.players.map((player) => ({
    id: player.id,
    slug: player.slug,
    displayName: player.displayName,
    teamId: team.id,
    teamName: team.name,
    teamLogoPath: team.logoPath,
    avatarPath: player.photoPath,
    wonMatchesCount: 0,
    lostMatchesCount: 0,
    side: player.side,
  }));
});
