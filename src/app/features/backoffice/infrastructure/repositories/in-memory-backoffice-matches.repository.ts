import { Injectable } from '@angular/core';

import type { BackofficeMatch } from '@features/backoffice/domain/entities/backoffice-match';
import type {
  BackofficeMatchesRepository,
  CreateBackofficeMatchInput,
} from '@features/backoffice/application/ports/backoffice-matches.repository';

const MOCK_MATCHES: readonly BackofficeMatch[] = [
  {
    id: 'match-1',
    matchdayId: 'jornada-3',
    localTeamId: 'kings-of-favar',
    awayTeamId: 'magic-city',
    localTeamScorePoints: 0,
    awayTeamScorePoints: 0,
    scheduledAt: new Date('2026-03-15T16:00:00'),
    status: 'in_progress',
  },
  {
    id: 'match-2',
    matchdayId: 'jornada-3',
    localTeamId: 'titanics',
    awayTeamId: 'barbaridad',
    localTeamScorePoints: 0,
    awayTeamScorePoints: 0,
    scheduledAt: new Date('2026-03-15T18:00:00'),
    status: 'scheduled',
  },
  {
    id: 'match-3',
    matchdayId: 'jornada-3',
    localTeamId: 'thormentadores',
    awayTeamId: 'kings-of-favar',
    localTeamScorePoints: 0,
    awayTeamScorePoints: 0,
    scheduledAt: new Date('2026-03-15T20:00:00'),
    status: 'scheduled',
  },
  {
    id: 'match-4',
    matchdayId: 'jornada-1',
    localTeamId: 'kings-of-favar',
    awayTeamId: 'titanics',
    localTeamScorePoints: 2,
    awayTeamScorePoints: 0,
    scheduledAt: new Date('2026-03-01T16:00:00'),
    status: 'finished',
  },
  {
    id: 'match-5',
    matchdayId: 'jornada-2',
    localTeamId: 'magic-city',
    awayTeamId: 'thormentadores',
    localTeamScorePoints: 0,
    awayTeamScorePoints: 2,
    scheduledAt: new Date('2026-03-08T18:00:00'),
    status: 'finished',
  },
  {
    id: 'match-6',
    matchdayId: 'jornada-1',
    localTeamId: 'barbaridad',
    awayTeamId: 'thormentadores',
    localTeamScorePoints: 0,
    awayTeamScorePoints: 2,
    scheduledAt: new Date('2026-03-01T18:00:00'),
    status: 'finished',
  },
  {
    id: 'match-7',
    matchdayId: 'jornada-2',
    localTeamId: 'kings-of-favar',
    awayTeamId: 'barbaridad',
    localTeamScorePoints: 2,
    awayTeamScorePoints: 0,
    scheduledAt: new Date('2026-03-08T16:00:00'),
    status: 'finished',
  },
];

@Injectable()
export class InMemoryBackofficeMatchesRepository implements BackofficeMatchesRepository {
  private matches: readonly BackofficeMatch[] = MOCK_MATCHES;

  loadByMatchday(matchdayId: string): Promise<readonly BackofficeMatch[]> {
    return Promise.resolve(this.matches.filter((match) => match.matchdayId === matchdayId));
  }

  loadByTeam(teamId: string): Promise<readonly BackofficeMatch[]> {
    return Promise.resolve(
      this.matches.filter((match) => match.localTeamId === teamId || match.awayTeamId === teamId),
    );
  }

  create(input: CreateBackofficeMatchInput): Promise<BackofficeMatch> {
    const match: BackofficeMatch = {
      id: `match-${this.matches.length + 1}`,
      matchdayId: input.matchdayId,
      localTeamId: input.localTeamId,
      awayTeamId: input.awayTeamId,
      localTeamScorePoints: input.localTeamScorePoints,
      awayTeamScorePoints: input.awayTeamScorePoints,
      scheduledAt: new Date(input.scheduledAt),
      status: 'scheduled',
    };
    this.matches = [...this.matches, match];
    return Promise.resolve(match);
  }

  start(matchId: string): Promise<void> {
    this.matches = this.matches.map((match) =>
      match.id === matchId ? { ...match, status: 'in_progress' } : match,
    );
    return Promise.resolve();
  }

  finish(matchId: string): Promise<void> {
    this.matches = this.matches.map((match) =>
      match.id === matchId ? { ...match, status: 'finished' } : match,
    );
    return Promise.resolve();
  }
}
