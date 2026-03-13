import type { BackofficeTeam } from '@features/backoffice/domain/entities/backoffice-team';
import type { StatusBadgeTone } from './status-badge-tone';

export interface BackofficeTeamCardViewModel {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly primaryColor: string;
  readonly secondaryColor: string;
  readonly statusLabel: string;
  readonly statusTone: StatusBadgeTone;
  readonly presidentLabel: string;
  readonly activePlayersLabel: string;
  readonly detailPath: string;
}

const TEAM_PALETTE: Record<string, { primary: string; secondary: string }> = {
  'kings-of-favar': { primary: '#c9a227', secondary: '#0b0b0b' },
  'magic-city': { primary: '#3b82f6', secondary: '#1e1b4b' },
  titanics: { primary: '#0ea5e9', secondary: '#0c4a6e' },
  barbaridad: { primary: '#ef4444', secondary: '#450a0a' },
  thormentadores: { primary: '#a855f7', secondary: '#2e1065' },
};

const DEFAULT_PALETTE = { primary: '#c9a227', secondary: '#0b0b0b' };

export function toBackofficeTeamCardViewModel(
  team: BackofficeTeam,
  playerCount: number,
  presidentName: string,
): BackofficeTeamCardViewModel {
  const palette = TEAM_PALETTE[team.id] ?? DEFAULT_PALETTE;

  return {
    id: team.id,
    title: team.name,
    subtitle: team.secondaryDescription,
    primaryColor: palette.primary,
    secondaryColor: palette.secondary,
    statusLabel: 'Activo',
    statusTone: 'success',
    presidentLabel: `Presidente: ${presidentName}`,
    activePlayersLabel: `${playerCount} jugadores`,
    detailPath: `/backoffice/equipos/${team.id}`,
  };
}
