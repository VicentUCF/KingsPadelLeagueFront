import { ChangeDetectionStrategy, Component, inject, type OnInit } from '@angular/core';
import {
  CalendarDays,
  LucideAngularModule,
  Shield,
  Trophy,
  Users,
  type LucideIconData,
} from 'lucide-angular';

import { applicationMetadata } from '@core/config/application-metadata';
import { SeoService } from '@core/services/seo.service';

interface PreseasonHighlight {
  readonly title: string;
  readonly description: string;
  readonly icon: LucideIconData;
}

interface FinalRankingEntry {
  readonly rank: number;
  readonly label: string;
  readonly teamName: string;
  readonly logoPath: string;
}

@Component({
  selector: 'app-preseason-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'preseason-home-page',
  },
  imports: [LucideAngularModule],
  templateUrl: './preseason-home-page.component.html',
  styleUrl: './preseason-home-page.component.scss',
})
export class PreseasonHomePageComponent implements OnInit {
  private readonly seo = inject(SeoService);

  protected readonly trophyIcon = Trophy;
  protected readonly shieldIcon = Shield;
  protected readonly calendarIcon = CalendarDays;

  protected readonly highlights: readonly PreseasonHighlight[] = [
    {
      title: 'Titanics campeón',
      description: 'La temporada queda cerrada con Titanics como ganador tras los playoff.',
      icon: Trophy,
    },
    {
      title: 'Equipos en movimiento',
      description: 'El mercado deja cambios de plantilla y estructuras en preparación.',
      icon: Users,
    },
    {
      title: 'RedLions se une',
      description: 'Nuevo equipo confirmado para la próxima etapa de KingsPadelLeague.',
      icon: Shield,
    },
    {
      title: 'Noticias próximamente',
      description: 'Calendario, plantillas y novedades se publicarán antes del arranque.',
      icon: CalendarDays,
    },
  ];

  protected readonly finalRanking: readonly FinalRankingEntry[] = [
    {
      rank: 1,
      label: 'Campeón',
      teamName: 'Titanics',
      logoPath: '/teams_logos/titanics_no_bg.webp',
    },
    {
      rank: 2,
      label: '2ª posición',
      teamName: 'Magic City',
      logoPath: '/teams_logos/magic_ng_bg.webp',
    },
    {
      rank: 3,
      label: '3ª posición',
      teamName: 'Thormentadores',
      logoPath: '/teams_logos/Thormentadores.webp',
    },
    {
      rank: 4,
      label: '4ª posición',
      teamName: 'Barbaridad Team',
      logoPath: '/teams_logos/barbarida_no_bg.webp',
    },
    {
      rank: 5,
      label: '5ª posición',
      teamName: 'Kings Of Favar',
      logoPath: '/teams_logos/Kings_of_Favar_no_bg.webp',
    },
  ];

  ngOnInit(): void {
    this.seo.setPage({
      title: 'Pretemporada | KingsPadelLeague',
      description: applicationMetadata.description,
      path: '/',
    });
    this.seo.setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Pretemporada KingsPadelLeague',
      url: 'https://kingspadelleague.com/',
      description: applicationMetadata.description,
      inLanguage: 'es',
      isPartOf: {
        '@type': 'WebSite',
        name: applicationMetadata.name,
        url: 'https://kingspadelleague.com/',
      },
    });
  }
}
