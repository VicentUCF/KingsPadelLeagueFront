import {
  type LeagueMatchdayEncounter,
  type LeagueMatchdayStatus,
} from '@features/league-home/domain/entities/league-matchday';

import { resolveTeamBranding, type TeamBrandingPalette } from './league-team-branding';

export type MatchdayStatusTone = 'success' | 'live' | 'scheduled';

export interface MatchdayTeamViewModel {
  readonly teamId: string;
  readonly teamName: string;
  readonly monogram: string;
  readonly logoPath: string | null;
  readonly palette: TeamBrandingPalette;
  readonly teamLink: string;
}

export interface MatchdayEncounterSummaryViewModel {
  readonly id: string;
  readonly homeTeam: MatchdayTeamViewModel;
  readonly awayTeam: MatchdayTeamViewModel;
  readonly statusLabel: string;
  readonly statusTone: MatchdayStatusTone;
  readonly scoreLabel: string;
  readonly metaLabel: string;
  readonly scheduledAtLabel: string;
}

export function toMatchdayTeamViewModel(
  teamId: string,
  teamSlug: string,
  teamName: string,
): MatchdayTeamViewModel {
  const branding = resolveTeamBranding({
    teamName,
    teamSlug,
  });

  return {
    teamId,
    teamName,
    monogram: branding.monogram,
    logoPath: branding.logoPath,
    palette: branding.palette,
    teamLink: `/equipos/${teamSlug}`,
  };
}

export function toMatchdayEncounterSummaryViewModel(
  encounter: LeagueMatchdayEncounter,
): MatchdayEncounterSummaryViewModel {
  const statusLabel = toMatchdayStatusLabel(encounter.status);

  return {
    id: encounter.id,
    homeTeam: toMatchdayTeamViewModel(
      encounter.homeTeamId,
      encounter.homeTeamSlug,
      encounter.homeTeamName,
    ),
    awayTeam: toMatchdayTeamViewModel(
      encounter.awayTeamId,
      encounter.awayTeamSlug,
      encounter.awayTeamName,
    ),
    statusLabel,
    statusTone: toMatchdayStatusTone(encounter.status),
    scoreLabel:
      encounter.status === 'upcoming'
        ? 'Pendiente'
        : `${encounter.homeScore} - ${encounter.awayScore}`,
    metaLabel: `${statusLabel} · ${encounter.scheduledAtLabel}`,
    scheduledAtLabel: encounter.scheduledAtLabel,
  };
}

export function toMatchdayStatusLabel(status: LeagueMatchdayStatus): string {
  switch (status) {
    case 'completed':
      return 'Finalizada';
    case 'current':
      return 'En juego';
    case 'upcoming':
      return 'Programada';
  }
}

export function toMatchdayStatusTone(status: LeagueMatchdayStatus): MatchdayStatusTone {
  switch (status) {
    case 'completed':
      return 'success';
    case 'current':
      return 'live';
    case 'upcoming':
      return 'scheduled';
  }
}
