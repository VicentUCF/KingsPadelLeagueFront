import { createMonogram } from './league-ui-formatters';

export interface TeamBranding {
  readonly monogram: string;
  readonly logoPath: string | null;
}

const TEAM_LOGO_PATHS: Record<string, string> = {
  kingsoffavar: '/teams_logos/Kings_of_Favar_no_bg.png',
  titantics: '/teams_logos/titanics_no_bg.png',
  titanics: '/teams_logos/titanics_no_bg.png',
  barbaridad: '/teams_logos/barbarida_no_bg.png',
  magiccity: '/teams_logos/magic_ng_bg.png',
};

export function resolveTeamBranding(teamName: string): TeamBranding {
  return {
    monogram: createMonogram(teamName),
    logoPath: TEAM_LOGO_PATHS[normalizeTeamName(teamName)] ?? null,
  };
}

function normalizeTeamName(teamName: string): string {
  return teamName
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
}
