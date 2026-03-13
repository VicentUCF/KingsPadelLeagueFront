import { Injectable } from '@angular/core';

import { BackofficeTeamsRepository } from '@features/backoffice/application/ports/backoffice-teams.repository';
import type { BackofficeTeam } from '@features/backoffice/domain/entities/backoffice-team';

const MOCK_TEAMS: readonly BackofficeTeam[] = [
  {
    id: 'kings-of-favar',
    name: 'Kings Of Favar',
    description: 'Equipo fundado por Vicent Ciscar.',
    secondaryDescription: 'Juegan con intensidad y estrategia.',
    logo: '/teams_logos/Kings_of_Favar_no_bg.png',
  },
  {
    id: 'magic-city',
    name: 'Magic City',
    description: 'Equipo fundado por Adri Alvarez.',
    secondaryDescription: 'Potencia y versatilidad en la pista.',
    logo: '/teams_logos/magic_ng_bg.png',
  },
  {
    id: 'titanics',
    name: 'Titanics',
    description: 'Equipo fundado por Adrian Asuncion.',
    secondaryDescription: 'El equipo con más jugadores de la liga.',
    logo: '/teams_logos/titanics_no_bg.png',
  },
  {
    id: 'barbaridad',
    name: 'Barbaridad Team',
    description: 'Equipo fundado por Samu.',
    secondaryDescription: 'Plantilla en formación.',
    logo: '/teams_logos/barbarida_no_bg.png',
  },
  {
    id: 'thormentadores',
    name: 'Thormentadores',
    description: 'Equipo fundado por Borja Vercher.',
    secondaryDescription: 'Equipo compacto y bien organizado.',
    logo: '/teams_logos/Thormentadores.png',
  },
];

@Injectable()
export class InMemoryBackofficeTeamsRepository extends BackofficeTeamsRepository {
  override loadAll(): Promise<readonly BackofficeTeam[]> {
    return Promise.resolve(MOCK_TEAMS);
  }
}
