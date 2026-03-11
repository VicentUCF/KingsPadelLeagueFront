import { Injectable } from '@angular/core';

import { BackofficeSeasonsRepository } from '@features/backoffice/application/ports/backoffice-seasons.repository';
import {
  type BackofficeSeasonDetail,
  type BackofficeSeasonSummary,
} from '@features/backoffice/domain/entities/backoffice-season.entity';

import { IN_MEMORY_BACKOFFICE_SEASONS } from './in-memory-backoffice-seasons.seed';

@Injectable()
export class InMemoryBackofficeSeasonsRepository extends BackofficeSeasonsRepository {
  override async findAll(): Promise<readonly BackofficeSeasonSummary[]> {
    return IN_MEMORY_BACKOFFICE_SEASONS.map((season) => ({
      id: season.id,
      name: season.name,
      year: season.year,
      status: season.status,
      scheduleLabel: season.scheduleLabel,
      teamCount: season.teamCount,
      matchdayCount: season.matchdayCount,
    }));
  }

  override async findById(seasonId: string): Promise<BackofficeSeasonDetail | null> {
    return IN_MEMORY_BACKOFFICE_SEASONS.find((season) => season.id === seasonId) ?? null;
  }
}
