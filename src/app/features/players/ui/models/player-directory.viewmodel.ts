import { type Player } from '@features/players/domain/entities/player.entity';

export interface PlayerCardViewModel {
  readonly id: string;
  readonly displayName: string;
  readonly teamName: string;
  readonly teamLogoPath: string | null;
  readonly avatarPath: string | null;
  readonly wonMatchesCount: number;
  readonly lostMatchesCount: number;
  readonly playedMatchesCount: number;
  readonly wonMatchesLabel: string;
  readonly lostMatchesLabel: string;
  readonly profileLink: string;
  readonly ranking: number;
  readonly winRate: number;
  readonly winRateLabel: string;
  readonly side: string;
  readonly sideLabel: string;
}

export interface PlayerDirectorySectionViewModel {
  readonly teamId: string;
  readonly teamName: string;
  readonly playerCountLabel: string;
  readonly players: readonly PlayerCardViewModel[];
}

export function toRankedPlayersViewModel(
  players: readonly Player[],
): readonly PlayerCardViewModel[] {
  const sorted = [...players].sort((a, b) => {
    if (b.wonMatchesCount !== a.wonMatchesCount) return b.wonMatchesCount - a.wonMatchesCount;
    return a.lostMatchesCount - b.lostMatchesCount;
  });

  return sorted.map((player, index) => toPlayerCardViewModel(player, index + 1));
}

export function toPlayerDirectorySectionsViewModel(
  players: readonly Player[],
): readonly PlayerDirectorySectionViewModel[] {
  const playersByTeam = new Map<string, PlayerDirectorySectionViewModel>();

  for (const player of players) {
    const existingSection = playersByTeam.get(player.teamId);
    const playerCard = toPlayerCardViewModel(player, 0);

    if (existingSection) {
      playersByTeam.set(player.teamId, {
        ...existingSection,
        playerCountLabel: `Jugadores: ${existingSection.players.length + 1}`,
        players: [...existingSection.players, playerCard],
      });
      continue;
    }

    playersByTeam.set(player.teamId, {
      teamId: player.teamId,
      teamName: player.teamName,
      playerCountLabel: 'Jugadores: 1',
      players: [playerCard],
    });
  }

  return [...playersByTeam.values()];
}

const SIDE_LABELS: Record<string, string> = {
  derecha: 'Derecha',
  reves: 'Revés',
  ambas: 'Ambas',
};

export function toPlayerCardViewModel(player: Player, ranking = 0): PlayerCardViewModel {
  const winRate =
    player.playedMatchesCount > 0
      ? Math.round((player.wonMatchesCount / player.playedMatchesCount) * 100)
      : 0;

  return {
    id: player.id,
    displayName: player.displayName,
    teamName: player.teamName,
    teamLogoPath: player.teamLogoPath,
    avatarPath: player.avatarPath,
    wonMatchesCount: player.wonMatchesCount,
    lostMatchesCount: player.lostMatchesCount,
    playedMatchesCount: player.playedMatchesCount,
    wonMatchesLabel: `${player.wonMatchesCount}`,
    lostMatchesLabel: `${player.lostMatchesCount}`,
    profileLink: `/jugadores/${player.slug}`,
    ranking,
    winRate,
    winRateLabel: `${winRate}%`,
    side: player.side,
    sideLabel: SIDE_LABELS[player.side] ?? player.side,
  };
}
