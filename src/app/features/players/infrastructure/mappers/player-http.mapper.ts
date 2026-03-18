import type { PlayerHttpV1, TeamHttpV1 } from '@core/api/kings-padel-api.types';
import { resolvePlayerHttpCompetitiveStats } from '@core/api/player-http-competitive-stats';
import {
  Player,
  UNASSIGNED_PLAYER_TEAM_ID,
  UNASSIGNED_PLAYER_TEAM_NAME,
  type PlayerSide,
} from '@features/players/domain/entities/player.entity';
import { resolvePlayerAvatarPath } from '@shared/utils/player-avatar';
import { createPlayerSlugById } from '@shared/utils/player-slug';

export function mapPlayersFromHttp(
  players: readonly PlayerHttpV1[],
  teams: readonly TeamHttpV1[],
): readonly Player[] {
  const teamById = new Map(teams.map((team) => [team.id, team]));
  const slugByPlayerId = createPlayerSlugById(
    players.map((player) => ({
      id: player.id,
      displayName: toPlayerDisplayName(player),
    })),
  );

  return [...players]
    .map((player) => {
      const team = player.teamId ? teamById.get(player.teamId) : undefined;
      const competitiveStats = resolvePlayerHttpCompetitiveStats(player);

      return new Player(
        player.id,
        slugByPlayerId.get(player.id) ?? player.id,
        toPlayerDisplayName(player),
        player.teamId ?? UNASSIGNED_PLAYER_TEAM_ID,
        team?.name ?? UNASSIGNED_PLAYER_TEAM_NAME,
        team?.logo ?? null,
        resolvePlayerAvatarPath(player.profileImage),
        competitiveStats.wonMatchesCount,
        competitiveStats.lostMatchesCount,
        toPlayerSide(player.preferredPosition),
      );
    })
    .sort((leftPlayer, rightPlayer) =>
      leftPlayer.displayName.localeCompare(rightPlayer.displayName, 'es'),
    );
}

function toPlayerDisplayName(player: Pick<PlayerHttpV1, 'firstName' | 'lastName'>): string {
  return `${player.firstName} ${player.lastName}`.trim();
}

function toPlayerSide(preferredPosition: PlayerHttpV1['preferredPosition']): PlayerSide {
  switch (preferredPosition) {
    case 'left':
      return 'reves';
    case 'right':
      return 'derecha';
    case 'both':
      return 'ambas';
  }
}
