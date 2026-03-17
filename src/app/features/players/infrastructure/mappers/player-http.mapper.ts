import type { PlayerHttpV1, TeamHttpV1 } from '@core/api/kings-padel-api.types';
import {
  Player,
  UNASSIGNED_PLAYER_TEAM_ID,
  UNASSIGNED_PLAYER_TEAM_NAME,
  type PlayerSide,
} from '@features/players/domain/entities/player.entity';
import { resolvePlayerAvatarPath } from '@shared/utils/player-avatar';
import { normalizeToSlug } from '@shared/utils/normalize-to-slug';

export function mapPlayersFromHttp(
  players: readonly PlayerHttpV1[],
  teams: readonly TeamHttpV1[],
): readonly Player[] {
  const teamById = new Map(teams.map((team) => [team.id, team]));
  const slugByPlayerId = createSlugByPlayerId(players);

  return [...players]
    .map((player) => {
      const team = player.teamId ? teamById.get(player.teamId) : undefined;

      return new Player(
        player.id,
        slugByPlayerId.get(player.id) ?? player.id,
        toPlayerDisplayName(player),
        player.teamId ?? UNASSIGNED_PLAYER_TEAM_ID,
        team?.name ?? UNASSIGNED_PLAYER_TEAM_NAME,
        team?.logo ?? null,
        resolvePlayerAvatarPath(player.profileImage),
        player.wonGames,
        player.lostGames,
        toPlayerSide(player.preferredPosition),
      );
    })
    .sort((leftPlayer, rightPlayer) =>
      leftPlayer.displayName.localeCompare(rightPlayer.displayName, 'es'),
    );
}

function createSlugByPlayerId(players: readonly PlayerHttpV1[]): ReadonlyMap<string, string> {
  const slugOccurrences = new Map<string, number>();

  return new Map(
    players.map((player) => {
      const baseSlug = normalizeToSlug(toPlayerDisplayName(player)) || player.id;
      const currentCount = slugOccurrences.get(baseSlug) ?? 0;

      slugOccurrences.set(baseSlug, currentCount + 1);

      return [player.id, currentCount === 0 ? baseSlug : `${baseSlug}-${currentCount + 1}`];
    }),
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
