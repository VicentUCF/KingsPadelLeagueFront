import { type BackofficeDashboardSnapshot } from '@features/backoffice/domain/entities/backoffice-dashboard-snapshot.entity';

import { type BackofficeDashboardRepository } from '../ports/backoffice-dashboard.repository';

export class LoadBackofficeDashboardSnapshotUseCase {
  constructor(private readonly backofficeDashboardRepository: BackofficeDashboardRepository) {}

  async execute(): Promise<BackofficeDashboardSnapshot> {
    return this.backofficeDashboardRepository.loadSnapshot();
  }
}
