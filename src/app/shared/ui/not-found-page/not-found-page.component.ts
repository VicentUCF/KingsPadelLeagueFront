import { ChangeDetectionStrategy, Component, inject, type OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AlertTriangle, CalendarDays, Home, LucideAngularModule, Shield } from 'lucide-angular';

import { SeoService } from '@core/services/seo.service';

@Component({
  selector: 'app-not-found-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'not-found-page',
  },
  imports: [LucideAngularModule, RouterLink],
  templateUrl: './not-found-page.component.html',
  styleUrl: './not-found-page.component.scss',
})
export class NotFoundPageComponent implements OnInit {
  private readonly seo = inject(SeoService);

  protected readonly alertIcon = AlertTriangle;
  protected readonly homeIcon = Home;
  protected readonly calendarIcon = CalendarDays;
  protected readonly teamsIcon = Shield;

  ngOnInit(): void {
    this.seo.setPage({
      title: 'Página no encontrada | KingsPadelLeague',
      description: 'La página que buscas no existe o ha sido movida.',
      path: '/404',
    });
  }
}
