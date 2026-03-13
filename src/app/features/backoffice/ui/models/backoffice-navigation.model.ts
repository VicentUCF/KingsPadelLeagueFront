import type { LucideIconData } from 'lucide-angular';

export const BACKOFFICE_ROOT_PATH = '/backoffice';

export interface BackofficeNavigationItem {
  readonly path: string;
  readonly label: string;
  readonly icon: LucideIconData;
  readonly isAccessible: boolean;
  readonly isImplemented: boolean;
}
