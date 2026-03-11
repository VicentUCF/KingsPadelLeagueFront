import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ArrowLeft, LucideAngularModule } from 'lucide-angular';

interface SitePlaceholderPageData {
  readonly title: string;
  readonly description: string;
}

@Component({
  selector: 'app-site-placeholder-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'site-placeholder-page',
  },
  imports: [LucideAngularModule, RouterLink],
  templateUrl: './site-placeholder-page.component.html',
  styleUrl: './site-placeholder-page.component.scss',
})
export class SitePlaceholderPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly data = this.route.snapshot.data as SitePlaceholderPageData;

  protected readonly arrowLeftIcon = ArrowLeft;
  protected readonly title = this.data.title;
  protected readonly description = this.data.description;
}
