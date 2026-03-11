import { Injectable } from '@angular/core';

import { BackofficeTeamsRepository } from '@features/backoffice/application/ports/backoffice-teams.repository';
import {
  type BackofficeTeamDetail,
  type BackofficeTeamSummary,
} from '@features/backoffice/domain/entities/backoffice-team.entity';

import { IN_MEMORY_BACKOFFICE_TEAMS } from './in-memory-backoffice-teams.seed';

@Injectable()
export class InMemoryBackofficeTeamsRepository extends BackofficeTeamsRepository {
  override async findAll(): Promise<readonly BackofficeTeamSummary[]> {
    return IN_MEMORY_BACKOFFICE_TEAMS.map((team) => ({
      id: team.id,
      name: team.name,
      shortName: team.shortName,
      primaryColor: team.primaryColor,
      secondaryColor: team.secondaryColor,
      presidentName: team.presidentName,
      activeRegularPlayersCount: team.activeRegularPlayersCount,
      status: team.status,
      seasonLabel: team.seasonLabel,
    }));
  }

  override async findById(teamId: string): Promise<BackofficeTeamDetail | null> {
    return IN_MEMORY_BACKOFFICE_TEAMS.find((team) => team.id === teamId) ?? null;
  }
}
