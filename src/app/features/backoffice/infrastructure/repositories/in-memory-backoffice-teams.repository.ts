import { Injectable, inject } from '@angular/core';

import { BackofficeTeamsRepository } from '@features/backoffice/application/ports/backoffice-teams.repository';
import {
  type ChangeStatusBackofficeTeamCommand,
  type CreateBackofficeTeamCommand,
  type UpdateBackofficeTeamCommand,
} from '@features/backoffice/application/commands/backoffice-team.commands';
import {
  type BackofficeTeamDetail,
  type BackofficeTeamSummary,
} from '@features/backoffice/domain/entities/backoffice-team.entity';

import { createTeamId } from './backoffice-id.factory';
import { InMemoryBackofficeDataStore } from './in-memory-backoffice-data.store';
import { type InMemoryBackofficeTeamRecord } from './in-memory-backoffice-data.types';
import { toBackofficeTeamDetail, toBackofficeTeamSummary } from './in-memory-backoffice.mappers';

@Injectable({
  providedIn: 'root',
})
export class InMemoryBackofficeTeamsRepository extends BackofficeTeamsRepository {
  private readonly dataStore = inject(InMemoryBackofficeDataStore);

  override async findAll(): Promise<readonly BackofficeTeamSummary[]> {
    const snapshot = this.dataStore.snapshot();

    return snapshot.teams.map((team) =>
      toBackofficeTeamSummary(team, snapshot.seasons, snapshot.players),
    );
  }

  override async findById(teamId: string): Promise<BackofficeTeamDetail | null> {
    const snapshot = this.dataStore.snapshot();
    const team = snapshot.teams.find((teamEntry) => teamEntry.id === teamId);

    return team ? toBackofficeTeamDetail(team, snapshot.seasons, snapshot.players) : null;
  }

  override async create(command: CreateBackofficeTeamCommand): Promise<BackofficeTeamDetail> {
    const snapshot = this.dataStore.snapshot();
    const activeSeason = snapshot.seasons.find((season) => season.status === 'ACTIVE');

    if (!activeSeason) {
      throw new Error('Necesitas una season activa para crear equipos.');
    }

    const teamRecord: InMemoryBackofficeTeamRecord = {
      id: createTeamId(
        command.name,
        snapshot.teams.map((team) => team.id),
      ),
      name: normalizeName(command.name),
      shortName: command.shortName.trim().toUpperCase(),
      presidentName: normalizeName(command.presidentName),
      primaryColor: normalizeHexColor(command.primaryColor),
      secondaryColor: normalizeHexColor(command.secondaryColor),
      activeRegularPlayersCount: 0,
      status: 'ACTIVE',
      seasonId: activeSeason.id,
      roleAssignments: [],
      rosterMembers: [],
      fixtures: [],
      sanctions: [],
      mvpHistory: [],
    };

    this.dataStore.setTeams([...snapshot.teams, teamRecord]);

    return toBackofficeTeamDetail(teamRecord, snapshot.seasons, snapshot.players);
  }

  override async update(command: UpdateBackofficeTeamCommand): Promise<BackofficeTeamDetail> {
    const snapshot = this.dataStore.snapshot();
    const team = snapshot.teams.find((teamEntry) => teamEntry.id === command.id);

    if (!team) {
      throw new Error('El equipo que intentas editar no existe.');
    }

    const updatedTeam: InMemoryBackofficeTeamRecord = {
      ...team,
      name: normalizeName(command.name),
      shortName: command.shortName.trim().toUpperCase(),
      presidentName: normalizeName(command.presidentName),
      primaryColor: normalizeHexColor(command.primaryColor),
      secondaryColor: normalizeHexColor(command.secondaryColor),
    };

    this.dataStore.setTeams(
      snapshot.teams.map((teamEntry) => (teamEntry.id === command.id ? updatedTeam : teamEntry)),
    );

    return toBackofficeTeamDetail(updatedTeam, snapshot.seasons, snapshot.players);
  }

  override async changeStatus(
    command: ChangeStatusBackofficeTeamCommand,
  ): Promise<BackofficeTeamDetail> {
    const snapshot = this.dataStore.snapshot();
    const team = snapshot.teams.find((teamEntry) => teamEntry.id === command.teamId);

    if (!team) {
      throw new Error('El equipo que intentas actualizar no existe.');
    }

    const updatedTeam: InMemoryBackofficeTeamRecord = {
      ...team,
      status: command.targetStatus,
    };

    this.dataStore.setTeams(
      snapshot.teams.map((teamEntry) =>
        teamEntry.id === command.teamId ? updatedTeam : teamEntry,
      ),
    );

    return toBackofficeTeamDetail(updatedTeam, snapshot.seasons, snapshot.players);
  }
}

function normalizeName(value: string): string {
  return value.trim().replaceAll(/\s+/g, ' ');
}

function normalizeHexColor(value: string): string {
  return value.trim().toUpperCase();
}
