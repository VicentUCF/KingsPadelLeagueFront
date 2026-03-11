import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import {
  ActivatedRoute,
  type ActivatedRouteSnapshot,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { ChevronRight, LucideAngularModule } from 'lucide-angular';
import { filter } from 'rxjs';

import { BACKOFFICE_ROOT_PATH } from '../../models/backoffice-navigation.model';
import { type BackofficeRouteData } from '../../models/backoffice-route-data';
import { BackofficeSessionStore } from '../../state/backoffice-session.store';
import { RoleBadgeComponent } from '../role-badge/role-badge.component';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { type BackofficeRole } from '../../../domain/entities/backoffice-role';

interface BackofficePageContext {
  readonly title: string;
  readonly breadcrumb: string;
  readonly description: string;
}

@Component({
  selector: 'app-backoffice-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'backoffice-shell',
  },
  imports: [
    LucideAngularModule,
    RoleBadgeComponent,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    StatusBadgeComponent,
  ],
  templateUrl: './backoffice-shell.component.html',
  styleUrl: './backoffice-shell.component.scss',
})
export class BackofficeShellComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected readonly sessionStore = inject(BackofficeSessionStore);
  protected readonly rootPath = BACKOFFICE_ROOT_PATH;
  protected readonly chevronRightIcon = ChevronRight;
  protected readonly navigation = this.sessionStore.navigation;
  protected readonly pageContext = signal(resolvePageContext(this.activatedRoute.snapshot));

  constructor() {
    const navigationSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        this.pageContext.set(resolvePageContext(this.activatedRoute.snapshot));
      });

    this.destroyRef.onDestroy(() => navigationSubscription.unsubscribe());
  }

  protected isDashboardLink(path: string): boolean {
    return path === this.rootPath;
  }

  protected onRoleChange(event: Event): void {
    const target = event.target;

    if (!(target instanceof HTMLSelectElement)) {
      return;
    }

    this.sessionStore.updateRoleFromValue(target.value);
  }

  protected toRoleOptionLabel(role: BackofficeRole): string {
    switch (role) {
      case 'ADMIN':
        return 'Administrador';
      case 'PRESIDENT':
        return 'Presidente';
      case 'USER':
        return 'Usuario';
    }
  }
}

function resolvePageContext(snapshot: ActivatedRouteSnapshot): BackofficePageContext {
  const leafSnapshot = findLeafSnapshot(snapshot);
  const routeData = leafSnapshot.data as Partial<BackofficeRouteData>;

  return {
    title: routeData.title ?? 'Dashboard',
    breadcrumb: routeData.breadcrumb ?? 'Dashboard',
    description: routeData.description ?? 'Estado operativo actual del backoffice.',
  };
}

function findLeafSnapshot(snapshot: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
  let currentSnapshot = snapshot;

  while (currentSnapshot.firstChild) {
    currentSnapshot = currentSnapshot.firstChild;
  }

  return currentSnapshot;
}
