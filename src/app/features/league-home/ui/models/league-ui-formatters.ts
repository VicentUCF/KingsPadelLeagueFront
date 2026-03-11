export function createMonogram(teamName: string): string {
  return teamName
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

export function createShortTeamName(teamName: string): string {
  const words = teamName.split(' ').filter(Boolean);

  return words.at(-1) ?? teamName;
}

export function withSignedValue(value: number): string {
  return value > 0 ? `+${value}` : `${value}`;
}
