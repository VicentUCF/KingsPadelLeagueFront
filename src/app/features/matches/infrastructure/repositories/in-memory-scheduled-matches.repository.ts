import { Injectable } from '@angular/core';

import { ScheduledMatchesRepository } from '@features/matches/application/ports/scheduled-matches.repository';
import { PadelMatch } from '@features/matches/domain/entities/padel-match.entity';

@Injectable()
export class InMemoryScheduledMatchesRepository extends ScheduledMatchesRepository {
  override async findScheduled(): Promise<readonly PadelMatch[]> {
    return [
      new PadelMatch(
        'morning-match',
        'Club Valencia Norte',
        'Court 2',
        new Date('2030-04-18T08:30:00.000Z'),
        ['Vicent', 'Marta', 'Lara', 'Javi'],
      ),
      new PadelMatch(
        'evening-match',
        'Club Valencia Norte',
        'Court 5',
        new Date('2030-04-19T18:30:00.000Z'),
        ['Carlos', 'Nuria'],
      ),
      new PadelMatch(
        'historic-match',
        'Club Valencia Norte',
        'Court 1',
        new Date('2024-01-10T18:00:00.000Z'),
        ['Alicia', 'Luis', 'Marta', 'Pablo'],
      ),
    ];
  }
}
