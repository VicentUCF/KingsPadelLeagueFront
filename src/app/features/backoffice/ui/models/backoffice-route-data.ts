import { type BackofficeRole } from '../../domain/entities/backoffice-role';

export interface BackofficeRouteData {
  readonly title: string;
  readonly breadcrumb: string;
  readonly description: string;
  readonly allowedRoles: readonly BackofficeRole[];
}
