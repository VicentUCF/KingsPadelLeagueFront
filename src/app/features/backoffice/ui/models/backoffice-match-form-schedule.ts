const DEFAULT_MATCH_HOUR = 18;

export function createDefaultBackofficeMatchScheduledAt(matchdayScheduledAt: string): string {
  const matchDate = new Date(matchdayScheduledAt);
  matchDate.setHours(DEFAULT_MATCH_HOUR, 0, 0, 0);
  return toLocalDateTimeInputValue(matchDate);
}

export function toLocalDateTimeInputValue(value: Date): string {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');
  const hours = `${value.getHours()}`.padStart(2, '0');
  const minutes = `${value.getMinutes()}`.padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
