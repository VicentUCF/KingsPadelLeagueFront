import {
  type EncounterResultSummary,
  type LeagueHomeSnapshot,
  type NextMatchSummary,
  type StandingEntry,
  type TeamPlayerSummary,
  type TeamProfileSummary,
} from '@features/league-home/domain/entities/league-home-snapshot';

import { resolveTeamBranding, type TeamBrandingPalette } from './league-team-branding';
import { withSignedValue } from './league-ui-formatters';

export interface TeamFactViewModel {
  readonly label: string;
  readonly value: string;
}

export interface TeamRosterPlayerViewModel {
  readonly id: string;
  readonly displayName: string;
  readonly roleLabel: string;
  readonly photoPath: string;
  readonly photoAlt: string;
}

export interface TeamShowcaseViewModel {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly tagline: string;
  readonly identityDescription: string;
  readonly presidentName: string;
  readonly logoPath: string | null;
  readonly monogram: string;
  readonly palette: TeamBrandingPalette;
  readonly playerCountLabel: string;
  readonly teamLink: string;
  readonly pulseLabel: string;
  readonly nextMatchLabel: string;
  readonly latestResultLabel: string;
  readonly facts: readonly TeamFactViewModel[];
  readonly roster: readonly TeamRosterPlayerViewModel[];
}

export function toTeamShowcaseViewModels(
  snapshot: LeagueHomeSnapshot,
): readonly TeamShowcaseViewModel[] {
  return snapshot.teamProfiles.map((teamProfile) => toTeamShowcaseViewModel(snapshot, teamProfile));
}

export function toTeamShowcaseViewModelBySlug(
  snapshot: LeagueHomeSnapshot,
  teamSlug: string,
): TeamShowcaseViewModel | null {
  const matchingTeamProfile = snapshot.teamProfiles.find(
    (teamProfile) => teamProfile.slug === teamSlug,
  );

  return matchingTeamProfile ? toTeamShowcaseViewModel(snapshot, matchingTeamProfile) : null;
}

function toTeamShowcaseViewModel(
  snapshot: LeagueHomeSnapshot,
  teamProfile: TeamProfileSummary,
): TeamShowcaseViewModel {
  const branding = resolveTeamBranding({
    teamName: teamProfile.name,
    teamSlug: teamProfile.slug,
  });
  const standing = snapshot.standings.find((entry) => entry.teamId === teamProfile.id) ?? null;
  const nextMatch =
    snapshot.nextMatches.find((match) => includesTeam(match, teamProfile.name)) ?? null;
  const latestResult =
    snapshot.lastResults.find((result) => includesTeam(result, teamProfile.name)) ?? null;
  const isByeTeam = snapshot.byeTeam.teamId === teamProfile.id;

  return {
    id: teamProfile.id,
    slug: teamProfile.slug,
    name: teamProfile.name,
    tagline: teamProfile.tagline,
    identityDescription: teamProfile.identityDescription,
    presidentName: teamProfile.presidentName,
    logoPath: branding.logoPath,
    monogram: branding.monogram,
    palette: branding.palette,
    playerCountLabel: `${teamProfile.players.length} jugadores en rotación`,
    teamLink: `/equipos/${teamProfile.slug}`,
    pulseLabel: `${snapshot.currentMatchday.label} · ${snapshot.currentPhase.label}`,
    nextMatchLabel: createNextMatchLabel(
      nextMatch,
      teamProfile.name,
      snapshot.byeTeam.matchdayLabel,
      isByeTeam,
    ),
    latestResultLabel: createLatestResultLabel(latestResult, teamProfile.name),
    facts: createFacts(teamProfile, standing, nextMatch, snapshot.byeTeam.matchdayLabel, isByeTeam),
    roster: teamProfile.players.map(toTeamRosterPlayerViewModel),
  };
}

function createFacts(
  teamProfile: TeamProfileSummary,
  standing: StandingEntry | null,
  nextMatch: NextMatchSummary | null,
  byeMatchdayLabel: string,
  isByeTeam: boolean,
): readonly TeamFactViewModel[] {
  return [
    {
      label: 'Presidente',
      value: teamProfile.presidentName,
    },
    {
      label: 'Plantilla',
      value: `${teamProfile.players.length} jugadores`,
    },
    {
      label: 'Clasificación',
      value: standing
        ? `#${standing.rank} · ${standing.points} pts · ${withSignedValue(standing.gameDifference)}`
        : 'Sin datos competitivos',
    },
    {
      label: 'Próxima cita',
      value: createNextMatchLabel(nextMatch, teamProfile.name, byeMatchdayLabel, isByeTeam),
    },
  ];
}

function createNextMatchLabel(
  nextMatch: NextMatchSummary | null,
  teamName: string,
  byeMatchdayLabel: string,
  isByeTeam: boolean,
): string {
  if (isByeTeam) {
    return `${byeMatchdayLabel} · Descansa`;
  }

  if (!nextMatch) {
    return 'Sin partido anunciado';
  }

  const opponentName =
    nextMatch.homeTeamName === teamName ? nextMatch.awayTeamName : nextMatch.homeTeamName;

  return `${nextMatch.scheduledAtLabel} · vs ${opponentName}`;
}

function createLatestResultLabel(
  latestResult: EncounterResultSummary | null,
  teamName: string,
): string {
  if (!latestResult) {
    return 'Todavía no hay resultado reciente publicado.';
  }

  if (latestResult.winnerTeamName === teamName) {
    const opponentName =
      latestResult.homeTeamName === teamName
        ? latestResult.awayTeamName
        : latestResult.homeTeamName;

    return `Llega tras ganar a ${opponentName} por ${latestResult.homePoints}-${latestResult.awayPoints}.`;
  }

  return `Último cruce: ${latestResult.homeTeamName} ${latestResult.homePoints}-${latestResult.awayPoints} ${latestResult.awayTeamName}.`;
}

function toTeamRosterPlayerViewModel(player: TeamPlayerSummary): TeamRosterPlayerViewModel {
  return {
    id: player.id,
    displayName: player.displayName,
    roleLabel: player.roleLabel,
    photoPath: player.photoPath,
    photoAlt: `Retrato temporal de stock de ${player.displayName}`,
  };
}

function includesTeam(
  summary: NextMatchSummary | EncounterResultSummary,
  teamName: string,
): boolean {
  return summary.homeTeamName === teamName || summary.awayTeamName === teamName;
}
