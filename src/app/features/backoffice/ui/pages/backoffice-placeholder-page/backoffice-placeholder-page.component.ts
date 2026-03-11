import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ArrowRight, LucideAngularModule } from 'lucide-angular';

import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';

import { BACKOFFICE_ROOT_PATH } from '../../models/backoffice-navigation.model';
import { type BackofficeRouteData } from '../../models/backoffice-route-data';

@Component({
  selector: 'app-backoffice-placeholder-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'backoffice-placeholder-page',
  },
  imports: [EmptyStateComponent, LucideAngularModule, RouterLink],
  templateUrl: './backoffice-placeholder-page.component.html',
  styleUrl: './backoffice-placeholder-page.component.scss',
})
export class BackofficePlaceholderPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly routeData = this.route.snapshot.data as BackofficeRouteData;

  protected readonly arrowRightIcon = ArrowRight;
  protected readonly dashboardPath = BACKOFFICE_ROOT_PATH;
  protected readonly description = this.routeData.description;
}
