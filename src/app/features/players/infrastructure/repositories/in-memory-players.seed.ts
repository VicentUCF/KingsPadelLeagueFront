import {
  UNASSIGNED_PLAYER_TEAM_ID,
  UNASSIGNED_PLAYER_TEAM_NAME,
  type PlayerSide,
} from '@features/players/domain/entities/player.entity';
import {
  PUBLIC_LEAGUE_PLAYER_CATALOG,
  PUBLIC_LEAGUE_TEAM_CATALOG,
} from '@shared/data/public-league-catalog.seed';

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

const ASSIGNED_TEAM_BY_PLAYER_ID = new Map(
  PUBLIC_LEAGUE_TEAM_CATALOG.flatMap((team) =>
    team.players.map((player) => [
      player.id,
      {
        id: team.id,
        name: team.name,
        logoPath: team.logoPath,
      },
    ]),
  ),
);

export const PLAYER_SEED: readonly PlayerSeed[] = PUBLIC_LEAGUE_PLAYER_CATALOG.map((player) => {
  const assignedTeam = ASSIGNED_TEAM_BY_PLAYER_ID.get(player.id);

  return {
    id: player.id,
    slug: player.slug,
    displayName: player.displayName,
    teamId: assignedTeam?.id ?? UNASSIGNED_PLAYER_TEAM_ID,
    teamName: assignedTeam?.name ?? UNASSIGNED_PLAYER_TEAM_NAME,
    teamLogoPath: assignedTeam?.logoPath ?? null,
    avatarPath: player.photoPath,
    wonMatchesCount: 0,
    lostMatchesCount: 0,
    side: player.side,
  };
});
