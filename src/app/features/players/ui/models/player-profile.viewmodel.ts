import { type Player } from '@features/players/domain/entities/player.entity';
import { resolveTeamBranding, type TeamBrandingPalette } from '@shared/utils/team-branding';

const SIDE_LABELS: Record<string, string> = {
  derecha: 'Derecha',
  reves: 'Revés',
  ambas: 'Ambas',
};

export interface PlayerProfileViewModel {
  readonly id: string;
  readonly displayName: string;
  readonly teamName: string;
  readonly teamLogoPath: string | null;
  readonly teamMonogram: string;
  readonly teamPalette: TeamBrandingPalette;
  readonly avatarPath: string | null;
  readonly wonMatchesCount: number;
  readonly lostMatchesCount: number;
  readonly wonMatchesLabel: string;
  readonly lostMatchesLabel: string;
  readonly playedMatchesLabel: string;
  readonly winRate: number;
  readonly winRateLabel: string;
  readonly overallRating: number;
  readonly side: string;
  readonly sideLabel: string;
  readonly metaDescription: string;
  readonly pageTitle: string;
}

export function toPlayerProfileViewModel(player: Player): PlayerProfileViewModel {
  const winRate =
    player.playedMatchesCount > 0
      ? Math.round((player.wonMatchesCount / player.playedMatchesCount) * 100)
      : 0;
  const overallRating = Math.round(60 + (winRate / 100) * 35);
  const teamBranding = resolveTeamBranding({
    teamName: player.teamName,
    teamSlug: player.teamId,
    fallbackLogoPath: player.teamLogoPath,
  });

  return {
    id: player.id,
    displayName: player.displayName,
    teamName: player.teamName,
    teamLogoPath: teamBranding.logoPath,
    teamMonogram: teamBranding.monogram,
    teamPalette: teamBranding.palette,
    avatarPath: player.avatarPath,
    wonMatchesCount: player.wonMatchesCount,
    lostMatchesCount: player.lostMatchesCount,
    wonMatchesLabel: `${player.wonMatchesCount}`,
    lostMatchesLabel: `${player.lostMatchesCount}`,
    playedMatchesLabel: `${player.playedMatchesCount}`,
    winRate,
    winRateLabel: `${winRate}%`,
    overallRating,
    side: player.side,
    sideLabel: SIDE_LABELS[player.side] ?? player.side,
    pageTitle: `${player.displayName} | Jugadores | KingsPadelLeague`,
    metaDescription: `Perfil de ${player.displayName}, jugador de ${player.teamName}, con ${player.wonMatchesCount} partidos ganados y ${player.lostMatchesCount} perdidos.`,
  };
}
