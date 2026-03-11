import { Injectable } from '@angular/core';

import { BackofficeRostersRepository } from '@features/backoffice/application/ports/backoffice-rosters.repository';
import {
  type BackofficeRosterDetail,
  type BackofficeRosterSummary,
} from '@features/backoffice/domain/entities/backoffice-roster.entity';

import { IN_MEMORY_BACKOFFICE_ROSTERS } from './in-memory-backoffice-rosters.seed';

@Injectable()
export class InMemoryBackofficeRostersRepository extends BackofficeRostersRepository {
  override async findAll(): Promise<readonly BackofficeRosterSummary[]> {
    return cloneValue(IN_MEMORY_BACKOFFICE_ROSTERS.map(toBackofficeRosterSummary));
  }

  override async findById(rosterId: string): Promise<BackofficeRosterDetail | null> {
    const roster = IN_MEMORY_BACKOFFICE_ROSTERS.find((rosterEntry) => rosterEntry.id === rosterId);

    return roster ? cloneValue(roster) : null;
  }
}

function toBackofficeRosterSummary(roster: BackofficeRosterDetail): BackofficeRosterSummary {
  return {
    id: roster.id,
    teamId: roster.teamId,
    teamName: roster.teamName,
    teamShortName: roster.teamShortName,
    seasonLabel: roster.seasonLabel,
    primaryColor: roster.primaryColor,
    secondaryColor: roster.secondaryColor,
    status: roster.status,
    regularSlotsUsed: roster.regularSlotsUsed,
    regularSlotsLimit: roster.regularSlotsLimit,
    activeGuestCount: roster.activeGuestCount,
    pendingRequestsCount: roster.pendingRequestsCount,
    validityLabel: roster.validityLabel,
  };
}

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
