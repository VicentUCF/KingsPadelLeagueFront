import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import {
  ActivatedRoute,
  type ActivatedRouteSnapshot,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { ChevronRight, LogOut, LucideAngularModule, Menu, X } from 'lucide-angular';
import { filter } from 'rxjs';

import { applicationMetadata } from '@core/config/application-metadata';
import { BACKOFFICE_ROOT_PATH } from '../../models/backoffice-navigation.model';
import { type BackofficeRouteData } from '../../models/backoffice-route-data';
import { BackofficeSessionStore } from '../../state/backoffice-session.store';
import { BackofficeTeamsStore } from '../../state/backoffice-teams.store';
import { RoleBadgeComponent } from '../role-badge/role-badge.component';

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
  imports: [LucideAngularModule, RoleBadgeComponent, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './backoffice-shell.component.html',
  styleUrl: './backoffice-shell.component.scss',
})
export class BackofficeShellComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected readonly applicationMetadata = applicationMetadata;
  protected readonly sessionStore = inject(BackofficeSessionStore);
  protected readonly teamsStore = inject(BackofficeTeamsStore);
  protected readonly rootPath = BACKOFFICE_ROOT_PATH;
  protected readonly presidentTeamName = computed(() => {
    const id = this.sessionStore.currentPresidentTeamId();
    return this.teamsStore.teams().find((t) => t.id === id)?.name ?? null;
  });
  protected readonly chevronRightIcon = ChevronRight;
  protected readonly menuIcon = Menu;
  protected readonly closeIcon = X;
  protected readonly logoutIcon = LogOut;

  protected readonly sidebarOpen = signal(false);
  protected readonly navigation = this.sessionStore.navigation;
  protected readonly pageContext = signal(resolvePageContext(this.activatedRoute.snapshot));

  constructor() {
    void this.teamsStore.load();

    const navigationSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        this.pageContext.set(resolvePageContext(this.activatedRoute.snapshot));
        this.sidebarOpen.set(false);
      });

    this.destroyRef.onDestroy(() => navigationSubscription.unsubscribe());
  }

  protected isDashboardLink(path: string): boolean {
    return path === this.rootPath;
  }

  protected async onLogout(): Promise<void> {
    await this.sessionStore.logout();
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
