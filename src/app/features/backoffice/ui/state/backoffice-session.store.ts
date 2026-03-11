import { computed, Injectable, signal } from '@angular/core';

import {
  BACKOFFICE_ROLES,
  isBackofficeRole,
  type BackofficeRole,
} from '../../domain/entities/backoffice-role';
import {
  BACKOFFICE_NAVIGATION,
  type BackofficeNavigationItem,
} from '../models/backoffice-navigation.model';

export interface BackofficeNavigationAccessViewModel extends BackofficeNavigationItem {
  readonly isAccessible: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class BackofficeSessionStore {
  readonly availableRoles = BACKOFFICE_ROLES;
  readonly currentRole = signal<BackofficeRole>('ADMIN');

  readonly navigation = computed<readonly BackofficeNavigationAccessViewModel[]>(() =>
    BACKOFFICE_NAVIGATION.map((item) => ({
      ...item,
      isAccessible: this.hasAccess(item.allowedRoles),
    })),
  );

  setRole(role: BackofficeRole): void {
    this.currentRole.set(role);
  }

  updateRoleFromValue(value: string): void {
    if (!isBackofficeRole(value)) {
      return;
    }

    this.setRole(value);
  }

  hasAccess(allowedRoles: readonly BackofficeRole[]): boolean {
    return allowedRoles.length === 0 || allowedRoles.includes(this.currentRole());
  }
}
