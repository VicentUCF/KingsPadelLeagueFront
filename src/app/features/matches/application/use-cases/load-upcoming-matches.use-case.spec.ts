import { ScheduledMatchesRepository } from '@features/matches/application/ports/scheduled-matches.repository';
import { PadelMatch } from '@features/matches/domain/entities/padel-match.entity';

import { LoadUpcomingMatchesUseCase } from './load-upcoming-matches.use-case';

class ScheduledMatchesRepositoryStub extends ScheduledMatchesRepository {
  override async findScheduled(): Promise<readonly PadelMatch[]> {
    return [
      new PadelMatch('later-match', 'Club Norte', 'Court 3', new Date('2030-04-19T20:00:00.000Z'), [
        'Alicia',
        'Luis',
        'Marta',
        'Pablo',
      ]),
      new PadelMatch('past-match', 'Club Norte', 'Court 1', new Date('2030-04-15T18:00:00.000Z'), [
        'Alicia',
        'Luis',
      ]),
      new PadelMatch('soon-match', 'Club Norte', 'Court 2', new Date('2030-04-18T18:00:00.000Z'), [
        'Alicia',
        'Luis',
        'Marta',
      ]),
    ];
  }
}

describe('LoadUpcomingMatchesUseCase', () => {
  it('filters out past matches and sorts upcoming ones chronologically', async () => {
    const useCase = new LoadUpcomingMatchesUseCase(new ScheduledMatchesRepositoryStub());

    const result = await useCase.execute(new Date('2030-04-18T00:00:00.000Z'));

    expect(result.map((match) => match.id)).toEqual(['soon-match', 'later-match']);
  });
});
