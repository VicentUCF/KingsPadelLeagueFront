import { Injectable } from '@angular/core';

import { LeagueHomeRepository } from '@features/league-home/application/ports/league-home.repository';
import { type LeagueMatchday } from '@features/league-home/domain/entities/league-matchday';
import {
  type LeagueHomeSnapshot,
  type TeamPlayerSummary,
  type TeamProfileSummary,
  type TeamSummary,
} from '@features/league-home/domain/entities/league-home-snapshot';
import {
  PUBLIC_LEAGUE_TEAM_CATALOG,
  type PublicLeaguePlayerCatalogEntry,
  type PublicLeagueTeamCatalogEntry,
} from '@shared/data/public-league-catalog.seed';

@Injectable()
export class InMemoryLeagueHomeRepository extends LeagueHomeRepository {
  override async loadSnapshot(): Promise<LeagueHomeSnapshot> {
    return {
      league: {
        name: 'KingsPadelLeague',
        tagline: 'Liga amateur de pádel',
        seasonLabel: 'Temporada 2026',
      },
      currentPhase: {
        code: 'preseason',
        label: 'Pretemporada',
      },
      currentMatchday: {
        current: 0,
        total: 0,
        label: 'Calendario oficial próximamente',
      },
      nextMatches: [],
      byeTeam: null,
      standings: createInitialStandings(),
      lastResults: [],
      teams: PUBLIC_LEAGUE_TEAM_CATALOG.map(toTeamSummary),
      teamProfiles: PUBLIC_LEAGUE_TEAM_CATALOG.map(toTeamProfileSummary),
    };
  }

  override async loadMatchdays(): Promise<readonly LeagueMatchday[]> {
    return [];
  }
}

function createInitialStandings(): LeagueHomeSnapshot['standings'] {
  return [...PUBLIC_LEAGUE_TEAM_CATALOG]
    .sort((leftTeam, rightTeam) => leftTeam.name.localeCompare(rightTeam.name))
    .map((team, index) => ({
      teamId: team.id,
      teamName: team.name,
      rank: index + 1,
      points: 0,
      playedMatches: 0,
      gameDifference: 0,
    }));
}

function toTeamSummary(team: PublicLeagueTeamCatalogEntry): TeamSummary {
  return {
    id: team.id,
    slug: team.slug,
    name: team.name,
    presidentName: team.presidentName,
    playerCount: team.players.length,
  };
}

function toTeamProfileSummary(team: PublicLeagueTeamCatalogEntry): TeamProfileSummary {
  return {
    id: team.id,
    slug: team.slug,
    name: team.name,
    presidentName: team.presidentName,
    tagline: team.tagline,
    identityDescription: team.identityDescription,
    players: team.players.map(toTeamPlayerSummary),
  };
}

function toTeamPlayerSummary(player: PublicLeaguePlayerCatalogEntry): TeamPlayerSummary {
  return {
    id: player.id,
    displayName: player.displayName,
    roleLabel: player.roleLabel,
    photoPath: player.photoPath,
  };
}
