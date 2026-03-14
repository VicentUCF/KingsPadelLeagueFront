import { Injectable } from '@angular/core';

import type { BackofficeMatch } from '@features/backoffice/domain/entities/backoffice-match';
import type { BackofficeMatchesRepository } from '@features/backoffice/application/ports/backoffice-matches.repository';

const MOCK_MATCHES: readonly BackofficeMatch[] = [
  {
    id: 'match-1',
    matchdayId: 'jornada-3',
    localTeamId: 'kings-of-favar',
    awayTeamId: 'magic-city',
    localTeamScorePoints: 0,
    awayTeamScorePoints: 0,
    scheduledAt: new Date('2026-03-15T16:00:00'),
    mvpId: null,
  },
  {
    id: 'match-2',
    matchdayId: 'jornada-3',
    localTeamId: 'titanics',
    awayTeamId: 'barbaridad',
    localTeamScorePoints: 0,
    awayTeamScorePoints: 0,
    scheduledAt: new Date('2026-03-15T18:00:00'),
    mvpId: null,
  },
  {
    id: 'match-3',
    matchdayId: 'jornada-3',
    localTeamId: 'thormentadores',
    awayTeamId: 'kings-of-favar',
    localTeamScorePoints: 0,
    awayTeamScorePoints: 0,
    scheduledAt: new Date('2026-03-15T20:00:00'),
    mvpId: null,
  },
  {
    id: 'match-4',
    matchdayId: 'jornada-1',
    localTeamId: 'kings-of-favar',
    awayTeamId: 'titanics',
    localTeamScorePoints: 2,
    awayTeamScorePoints: 0,
    scheduledAt: new Date('2026-03-01T16:00:00'),
    mvpId: null,
  },
  {
    id: 'match-5',
    matchdayId: 'jornada-2',
    localTeamId: 'magic-city',
    awayTeamId: 'thormentadores',
    localTeamScorePoints: 0,
    awayTeamScorePoints: 2,
    scheduledAt: new Date('2026-03-08T18:00:00'),
    mvpId: null,
  },
  {
    id: 'match-6',
    matchdayId: 'jornada-1',
    localTeamId: 'barbaridad',
    awayTeamId: 'thormentadores',
    localTeamScorePoints: 0,
    awayTeamScorePoints: 2,
    scheduledAt: new Date('2026-03-01T18:00:00'),
    mvpId: null,
  },
  {
    id: 'match-7',
    matchdayId: 'jornada-2',
    localTeamId: 'kings-of-favar',
    awayTeamId: 'barbaridad',
    localTeamScorePoints: 2,
    awayTeamScorePoints: 0,
    scheduledAt: new Date('2026-03-08T16:00:00'),
    mvpId: null,
  },
];

@Injectable()
export class InMemoryBackofficeMatchesRepository implements BackofficeMatchesRepository {
  loadByMatchday(matchdayId: string): Promise<readonly BackofficeMatch[]> {
    return Promise.resolve(MOCK_MATCHES.filter((m) => m.matchdayId === matchdayId));
  }

  loadByTeam(teamId: string): Promise<readonly BackofficeMatch[]> {
    return Promise.resolve(
      MOCK_MATCHES.filter((m) => m.localTeamId === teamId || m.awayTeamId === teamId),
    );
  }
}
