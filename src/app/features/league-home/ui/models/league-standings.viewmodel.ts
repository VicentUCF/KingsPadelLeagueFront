import { type LeagueHomeSnapshot } from '@features/league-home/domain/entities/league-home-snapshot';

import { toLeagueHomeViewModel, type StandingsRowViewModel } from './league-home.viewmodel';

export interface LeagueStandingsPageViewModel {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly currentMatchdayLabel: string;
  readonly phaseLabel: string;
  readonly tableCaption: string;
  readonly tieBreakRules: readonly string[];
  readonly standings: readonly StandingsRowViewModel[];
}

export function toLeagueStandingsPageViewModel(
  snapshot: LeagueHomeSnapshot,
): LeagueStandingsPageViewModel {
  const homeViewModel = toLeagueHomeViewModel(snapshot);

  return {
    eyebrow: 'Clasificación',
    title: `Clasificación oficial de la temporada ${snapshot.league.seasonLabel.replace('Temporada ', '')}`,
    description:
      'Consulta la tabla de equipos de la KingsPadelLeague y sigue la evolución de la competición jornada a jornada.',
    currentMatchdayLabel: snapshot.currentMatchday.label,
    phaseLabel: snapshot.currentPhase.label,
    tableCaption: `Clasificación de ${snapshot.league.name}`,
    tieBreakRules: [
      'Puntos totales',
      'Enfrentamiento directo',
      'Diferencia de juegos',
      'Juegos a favor',
    ],
    standings: homeViewModel.standings,
  };
}
