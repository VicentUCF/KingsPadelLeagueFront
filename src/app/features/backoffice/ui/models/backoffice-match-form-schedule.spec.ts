import { createDefaultBackofficeMatchScheduledAt } from './backoffice-match-form-schedule';

describe('backoffice-match-form-schedule', () => {
  it('keeps the matchday local date and defaults the time to 18:00', () => {
    const matchdayDate = new Date('2026-03-25T11:30:00.000Z');
    const expectedDate = [
      matchdayDate.getFullYear(),
      `${matchdayDate.getMonth() + 1}`.padStart(2, '0'),
      `${matchdayDate.getDate()}`.padStart(2, '0'),
    ].join('-');

    expect(createDefaultBackofficeMatchScheduledAt('2026-03-25T11:30:00.000Z')).toBe(
      `${expectedDate}T18:00`,
    );
  });
});
