import { Injectable, inject } from '@angular/core';

import { BackofficeSeasonsRepository } from '@features/backoffice/application/ports/backoffice-seasons.repository';
import {
  type ChangeStatusBackofficeSeasonCommand,
  type CreateBackofficeSeasonCommand,
  type UpdateBackofficeSeasonCommand,
} from '@features/backoffice/application/commands/backoffice-season.commands';
import {
  type BackofficeSeasonDetail,
  type BackofficeSeasonSummary,
} from '@features/backoffice/domain/entities/backoffice-season.entity';

import { createSeasonId } from './backoffice-id.factory';
import { InMemoryBackofficeDataStore } from './in-memory-backoffice-data.store';
import { type InMemoryBackofficeSeasonRecord } from './in-memory-backoffice-data.types';
import {
  toBackofficeSeasonDetail,
  toBackofficeSeasonSummary,
} from './in-memory-backoffice.mappers';

@Injectable({
  providedIn: 'root',
})
export class InMemoryBackofficeSeasonsRepository extends BackofficeSeasonsRepository {
  private readonly dataStore = inject(InMemoryBackofficeDataStore);

  override async findAll(): Promise<readonly BackofficeSeasonSummary[]> {
    const snapshot = this.dataStore.snapshot();

    return snapshot.seasons.map((season) => toBackofficeSeasonSummary(season, snapshot.teams));
  }

  override async findById(seasonId: string): Promise<BackofficeSeasonDetail | null> {
    const snapshot = this.dataStore.snapshot();
    const season = snapshot.seasons.find((seasonEntry) => seasonEntry.id === seasonId);

    return season ? toBackofficeSeasonDetail(season, snapshot.teams) : null;
  }

  override async create(command: CreateBackofficeSeasonCommand): Promise<BackofficeSeasonDetail> {
    const snapshot = this.dataStore.snapshot();

    const seasonRecord: InMemoryBackofficeSeasonRecord = {
      id: createSeasonId(
        command.year,
        snapshot.seasons.map((season) => season.id),
      ),
      name: normalizeName(command.name),
      year: command.year,
      status: command.status ?? 'DRAFT',
      startDate: command.startDate,
      endDate: command.endDate,
      notes: normalizeLines(command.notes),
      matchdays: [],
      standings: [],
    };

    this.dataStore.setSeasons([...snapshot.seasons, seasonRecord]);

    return toBackofficeSeasonDetail(seasonRecord, snapshot.teams);
  }

  override async update(command: UpdateBackofficeSeasonCommand): Promise<BackofficeSeasonDetail> {
    const snapshot = this.dataStore.snapshot();
    const season = snapshot.seasons.find((seasonEntry) => seasonEntry.id === command.id);

    if (!season) {
      throw new Error('La season que intentas editar no existe.');
    }

    const updatedSeason: InMemoryBackofficeSeasonRecord = {
      ...season,
      name: normalizeName(command.name),
      year: command.year,
      startDate: command.startDate,
      endDate: command.endDate,
      notes: normalizeLines(command.notes),
    };

    this.dataStore.setSeasons(
      snapshot.seasons.map((seasonEntry) =>
        seasonEntry.id === command.id ? updatedSeason : seasonEntry,
      ),
    );

    return toBackofficeSeasonDetail(updatedSeason, snapshot.teams);
  }

  override async changeStatus(
    command: ChangeStatusBackofficeSeasonCommand,
  ): Promise<BackofficeSeasonDetail> {
    const snapshot = this.dataStore.snapshot();
    const season = snapshot.seasons.find((seasonEntry) => seasonEntry.id === command.seasonId);

    if (!season) {
      throw new Error('La season que intentas actualizar no existe.');
    }

    const updatedSeason: InMemoryBackofficeSeasonRecord = {
      ...season,
      status: command.targetStatus,
    };

    this.dataStore.setSeasons(
      snapshot.seasons.map((seasonEntry) =>
        seasonEntry.id === command.seasonId ? updatedSeason : seasonEntry,
      ),
    );

    return toBackofficeSeasonDetail(updatedSeason, snapshot.teams);
  }
}

function normalizeName(value: string): string {
  return value.trim().replaceAll(/\s+/g, ' ');
}

function normalizeLines(values: readonly string[]): readonly string[] {
  return values.map((value) => value.trim()).filter((value) => value.length > 0);
}
