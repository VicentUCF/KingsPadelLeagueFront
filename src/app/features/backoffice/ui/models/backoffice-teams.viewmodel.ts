import type { BackofficeTeam } from '@features/backoffice/domain/entities/backoffice-team';
import { resolveTeamBranding } from '@shared/utils/team-branding';
import type { StatusBadgeTone } from './status-badge-tone';

export interface BackofficeTeamCardViewModel {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly logoPath: string | null;
  readonly monogram: string;
  readonly primaryColor: string;
  readonly secondaryColor: string;
  readonly statusLabel: string;
  readonly statusTone: StatusBadgeTone;
  readonly presidentLabel: string;
  readonly activePlayersLabel: string;
  readonly detailPath: string;
}

export function toBackofficeTeamCardViewModel(
  team: BackofficeTeam,
  playerCount: number,
  presidentName: string,
): BackofficeTeamCardViewModel {
  const branding = resolveTeamBranding({
    teamName: team.name,
    fallbackLogoPath: team.logo,
  });

  return {
    id: team.id,
    title: team.name,
    subtitle: team.secondaryDescription,
    logoPath: branding.logoPath,
    monogram: branding.monogram,
    primaryColor: branding.palette.primary,
    secondaryColor: branding.palette.surface,
    statusLabel: 'Activo',
    statusTone: 'success',
    presidentLabel: `Presidente: ${presidentName}`,
    activePlayersLabel: `${playerCount} jugadores`,
    detailPath: `/backoffice/equipos/${team.id}`,
  };
}
