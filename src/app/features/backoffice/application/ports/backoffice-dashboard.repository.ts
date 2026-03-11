import { type BackofficeDashboardSnapshot } from '@features/backoffice/domain/entities/backoffice-dashboard-snapshot.entity';

export abstract class BackofficeDashboardRepository {
  abstract loadSnapshot(): Promise<BackofficeDashboardSnapshot>;
}
