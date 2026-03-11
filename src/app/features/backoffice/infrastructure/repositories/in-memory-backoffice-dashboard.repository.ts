import { Injectable } from '@angular/core';

import { BackofficeDashboardRepository } from '@features/backoffice/application/ports/backoffice-dashboard.repository';
import { type BackofficeDashboardSnapshot } from '@features/backoffice/domain/entities/backoffice-dashboard-snapshot.entity';

import { IN_MEMORY_BACKOFFICE_DASHBOARD_SNAPSHOT } from './in-memory-backoffice-dashboard.seed';

@Injectable()
export class InMemoryBackofficeDashboardRepository extends BackofficeDashboardRepository {
  override async loadSnapshot(): Promise<BackofficeDashboardSnapshot> {
    return IN_MEMORY_BACKOFFICE_DASHBOARD_SNAPSHOT;
  }
}
