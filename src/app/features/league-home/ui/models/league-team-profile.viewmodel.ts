import { type LeagueHomeSnapshot } from '@features/league-home/domain/entities/league-home-snapshot';

import {
  toTeamShowcaseViewModelBySlug,
  type TeamShowcaseViewModel,
} from './league-team-showcase.viewmodel';

export interface LeagueTeamProfilePageViewModel {
  readonly team: TeamShowcaseViewModel;
  readonly eyebrow: string;
  readonly rosterTitle: string;
  readonly rosterDescription: string;
}

export function toLeagueTeamProfilePageViewModel(
  snapshot: LeagueHomeSnapshot,
  teamSlug: string,
): LeagueTeamProfilePageViewModel | null {
  const team = toTeamShowcaseViewModelBySlug(snapshot, teamSlug);

  if (!team) {
    return null;
  }

  return {
    team,
    eyebrow: 'Plantilla oficial',
    rosterTitle: 'Plantilla del equipo',
    rosterDescription: 'Jugadores inscritos en la plantilla oficial del equipo.',
  };
}
