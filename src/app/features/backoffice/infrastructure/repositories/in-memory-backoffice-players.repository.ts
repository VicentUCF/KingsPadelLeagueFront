import { Injectable } from '@angular/core';

import { BackofficePlayersRepository } from '@features/backoffice/application/ports/backoffice-players.repository';
import {
  type BackofficePlayerDetail,
  type BackofficePlayerSummary,
} from '@features/backoffice/domain/entities/backoffice-player.entity';

import { IN_MEMORY_BACKOFFICE_PLAYERS } from './in-memory-backoffice-players.seed';

@Injectable()
export class InMemoryBackofficePlayersRepository extends BackofficePlayersRepository {
  override async findAll(): Promise<readonly BackofficePlayerSummary[]> {
    return IN_MEMORY_BACKOFFICE_PLAYERS.map((player) => ({
      id: player.id,
      fullName: player.fullName,
      nickName: player.nickName,
      avatarPath: player.avatarPath,
      status: player.status,
      derivedCurrentTeamName: player.derivedCurrentTeamName,
      historicalTeamNames: player.historicalTeamNames,
      isUserLinked: player.isUserLinked,
    }));
  }

  override async findById(playerId: string): Promise<BackofficePlayerDetail | null> {
    return IN_MEMORY_BACKOFFICE_PLAYERS.find((player) => player.id === playerId) ?? null;
  }
}
