export interface TeamBrandingPalette {
  readonly primary: string;
  readonly accent: string;
  readonly surface: string;
  readonly glow: string;
  readonly contrast: string;
}

export interface TeamBranding {
  readonly monogram: string;
  readonly logoPath: string | null;
  readonly palette: TeamBrandingPalette;
}

interface TeamBrandingRegistryEntry {
  readonly logoPath: string | null;
  readonly palette: TeamBrandingPalette;
}

interface ResolveTeamBrandingOptions {
  readonly teamName: string;
  readonly teamSlug?: string | null;
  readonly fallbackLogoPath?: string | null;
}

const DEFAULT_TEAM_BRANDING: TeamBrandingRegistryEntry = {
  logoPath: null,
  palette: {
    primary: '#e0bb45',
    accent: '#f5e3a3',
    surface: '#1d1710',
    glow: 'rgb(224 187 69 / 0.42)',
    contrast: '#0b0b0b',
  },
};

const TEAM_BRANDING_REGISTRY: Record<string, TeamBrandingRegistryEntry> = {
  'kings-of-favar': {
    logoPath: '/teams_logos/Kings_of_Favar_no_bg.png',
    palette: {
      primary: '#f3c84b',
      accent: '#f9e9a7',
      surface: '#24150b',
      glow: 'rgb(243 200 75 / 0.46)',
      contrast: '#0d0904',
    },
  },
  titanics: {
    logoPath: '/teams_logos/titanics_no_bg.png',
    palette: {
      primary: '#84d5ff',
      accent: '#f2f8ff',
      surface: '#0c2034',
      glow: 'rgb(132 213 255 / 0.4)',
      contrast: '#041018',
    },
  },
  barbaridad: {
    logoPath: '/teams_logos/barbarida_no_bg.png',
    palette: {
      primary: '#ff7848',
      accent: '#ffd0b5',
      surface: '#2a140f',
      glow: 'rgb(255 120 72 / 0.38)',
      contrast: '#140806',
    },
  },
  'magic-city': {
    logoPath: '/teams_logos/magic_ng_bg.png',
    palette: {
      primary: '#69f6d1',
      accent: '#c7ffef',
      surface: '#0d2721',
      glow: 'rgb(105 246 209 / 0.36)',
      contrast: '#05100f',
    },
  },
  'house-perez': {
    logoPath: null,
    palette: {
      primary: '#f06bb5',
      accent: '#ffd4ef',
      surface: '#29111f',
      glow: 'rgb(240 107 181 / 0.38)',
      contrast: '#12070d',
    },
  },
};

export function resolveTeamBranding({
  teamName,
  teamSlug,
  fallbackLogoPath = null,
}: ResolveTeamBrandingOptions): TeamBranding {
  const brandingKey = teamSlug ? normalizeTeamKey(teamSlug) : normalizeTeamKey(teamName);
  const branding =
    TEAM_BRANDING_REGISTRY[brandingKey] ??
    TEAM_BRANDING_REGISTRY[normalizeTeamKey(teamName)] ??
    DEFAULT_TEAM_BRANDING;

  return {
    monogram: createTeamMonogram(teamName),
    logoPath: branding.logoPath ?? fallbackLogoPath,
    palette: branding.palette,
  };
}

function createTeamMonogram(teamName: string): string {
  return teamName
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

function normalizeTeamKey(teamValue: string): string {
  return teamValue
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}
