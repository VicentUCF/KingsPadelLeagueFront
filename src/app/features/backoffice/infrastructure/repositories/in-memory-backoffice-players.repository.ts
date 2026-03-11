import { Injectable, inject } from '@angular/core';

import { BackofficePlayersRepository } from '@features/backoffice/application/ports/backoffice-players.repository';
import {
  type ChangeStatusBackofficePlayerCommand,
  type CreateBackofficePlayerCommand,
  type UpdateBackofficePlayerCommand,
} from '@features/backoffice/application/commands/backoffice-player.commands';
import {
  type BackofficePlayerDetail,
  type BackofficePlayerSummary,
} from '@features/backoffice/domain/entities/backoffice-player.entity';

import { createPlayerId } from './backoffice-id.factory';
import { InMemoryBackofficeDataStore } from './in-memory-backoffice-data.store';
import {
  type InMemoryBackofficePlayerRecord,
  type InMemoryBackofficeTeamRecord,
} from './in-memory-backoffice-data.types';
import {
  toBackofficePlayerDetail,
  toBackofficePlayerSummary,
} from './in-memory-backoffice.mappers';

@Injectable({
  providedIn: 'root',
})
export class InMemoryBackofficePlayersRepository extends BackofficePlayersRepository {
  private readonly dataStore = inject(InMemoryBackofficeDataStore);

  override async findAll(): Promise<readonly BackofficePlayerSummary[]> {
    const snapshot = this.dataStore.snapshot();

    return snapshot.players.map((player) => toBackofficePlayerSummary(player, snapshot.teams));
  }

  override async findById(playerId: string): Promise<BackofficePlayerDetail | null> {
    const snapshot = this.dataStore.snapshot();
    const player = snapshot.players.find((playerEntry) => playerEntry.id === playerId);

    return player ? toBackofficePlayerDetail(player, snapshot.teams) : null;
  }

  override async create(command: CreateBackofficePlayerCommand): Promise<BackofficePlayerDetail> {
    const snapshot = this.dataStore.snapshot();

    assertTeamExists(
      snapshot.teams.map((team) => team.id),
      command.currentTeamId,
    );

    const playerRecord: InMemoryBackofficePlayerRecord = {
      id: createPlayerId(
        command.fullName,
        snapshot.players.map((player) => player.id),
      ),
      fullName: normalizeName(command.fullName),
      nickName: normalizeName(command.nickName),
      avatarPath: normalizeOptionalValue(command.avatarPath),
      preferredSideLabel: normalizeName(command.preferredSideLabel),
      linkedUserEmail: normalizeOptionalValue(command.linkedUserEmail),
      status: command.status,
      currentTeamId: command.currentTeamId,
      historicalMemberships: [],
      participations: [],
      mvpNominations: [],
    };

    this.dataStore.setPlayers([...snapshot.players, playerRecord]);
    this.dataStore.setTeams(applyTeamRosterCountChanges(snapshot.teams, null, playerRecord));

    return toBackofficePlayerDetail(
      playerRecord,
      applyTeamRosterCountChanges(snapshot.teams, null, playerRecord),
    );
  }

  override async update(command: UpdateBackofficePlayerCommand): Promise<BackofficePlayerDetail> {
    const snapshot = this.dataStore.snapshot();
    const player = snapshot.players.find((playerEntry) => playerEntry.id === command.id);

    if (!player) {
      throw new Error('El jugador que intentas editar no existe.');
    }

    assertTeamExists(
      snapshot.teams.map((team) => team.id),
      command.currentTeamId,
    );

    const updatedPlayer: InMemoryBackofficePlayerRecord = {
      ...player,
      fullName: normalizeName(command.fullName),
      nickName: normalizeName(command.nickName),
      avatarPath: normalizeOptionalValue(command.avatarPath),
      preferredSideLabel: normalizeName(command.preferredSideLabel),
      linkedUserEmail: normalizeOptionalValue(command.linkedUserEmail),
      status: command.status,
      currentTeamId: command.currentTeamId,
    };

    const updatedTeams = applyTeamRosterCountChanges(snapshot.teams, player, updatedPlayer);

    this.dataStore.setPlayers(
      snapshot.players.map((playerEntry) =>
        playerEntry.id === command.id ? updatedPlayer : playerEntry,
      ),
    );
    this.dataStore.setTeams(updatedTeams);

    return toBackofficePlayerDetail(updatedPlayer, updatedTeams);
  }

  override async changeStatus(
    command: ChangeStatusBackofficePlayerCommand,
  ): Promise<BackofficePlayerDetail> {
    const snapshot = this.dataStore.snapshot();
    const player = snapshot.players.find((playerEntry) => playerEntry.id === command.playerId);

    if (!player) {
      throw new Error('El jugador que intentas actualizar no existe.');
    }

    const updatedPlayer: InMemoryBackofficePlayerRecord = {
      ...player,
      status: command.targetStatus,
    };

    const updatedTeams = applyTeamRosterCountChanges(snapshot.teams, player, updatedPlayer);

    this.dataStore.setPlayers(
      snapshot.players.map((playerEntry) =>
        playerEntry.id === command.playerId ? updatedPlayer : playerEntry,
      ),
    );
    this.dataStore.setTeams(updatedTeams);

    return toBackofficePlayerDetail(updatedPlayer, updatedTeams);
  }
}

function normalizeName(value: string): string {
  return value.trim().replaceAll(/\s+/g, ' ');
}

function normalizeOptionalValue(value: string | null): string | null {
  const normalizedValue = value?.trim();

  return normalizedValue ? normalizedValue : null;
}

function assertTeamExists(teamIds: readonly string[], currentTeamId: string | null): void {
  if (currentTeamId === null || teamIds.includes(currentTeamId)) {
    return;
  }

  throw new Error('El equipo seleccionado para este jugador ya no existe.');
}

function applyTeamRosterCountChanges(
  teams: readonly InMemoryBackofficeTeamRecord[],
  previousPlayer: InMemoryBackofficePlayerRecord | null,
  nextPlayer: InMemoryBackofficePlayerRecord,
): readonly InMemoryBackofficeTeamRecord[] {
  return teams.map((team) => {
    const shouldRemovePlayer =
      previousPlayer?.status === 'ACTIVE' && previousPlayer.currentTeamId === team.id;
    const shouldAddPlayer = nextPlayer.status === 'ACTIVE' && nextPlayer.currentTeamId === team.id;

    const nextCount =
      team.activeRegularPlayersCount - (shouldRemovePlayer ? 1 : 0) + (shouldAddPlayer ? 1 : 0);

    return {
      ...team,
      activeRegularPlayersCount: Math.max(nextCount, 0),
    };
  });
}
