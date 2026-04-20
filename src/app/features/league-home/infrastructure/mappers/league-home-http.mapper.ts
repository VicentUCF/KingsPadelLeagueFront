import type {
  MatchdayHttpV1,
  MatchHttpV1,
  MatchTeamLineUpHttpV1,
  MatchTeamLineUpPairHttpV1,
  PairMatchHttpV1,
  PairMatchSetHttpV1,
  PlayerHttpV1,
  TeamHttpV1,
} from '@core/api/kings-padel-api.types';
import type {
  EncounterResultSummary,
  LeagueHomeSnapshot,
  TeamPlayerSummary,
  TeamProfileSummary,
  TeamSummary,
} from '@features/league-home/domain/entities/league-home-snapshot';
import type {
  LeagueMatchPairLineup,
  LeagueMatchPairPlayer,
  LeagueMatchPairResult,
  LeagueMatchday,
  LeagueMatchdayByeTeam,
  LeagueMatchdayStatus,
} from '@features/league-home/domain/entities/league-matchday';
import { resolvePlayerAvatarPath } from '@shared/utils/player-avatar';
import { createPlayerSlugById } from '@shared/utils/player-slug';
import { normalizeToSlug } from '@shared/utils/normalize-to-slug';

export interface LeagueHomeHttpDataset {
  readonly teams: readonly TeamHttpV1[];
  readonly players: readonly PlayerHttpV1[];
  readonly matchdays: readonly MatchdayHttpV1[];
  readonly matches: readonly MatchHttpV1[];
  readonly lineups: readonly MatchTeamLineUpHttpV1[];
  readonly lineupPairs: readonly MatchTeamLineUpPairHttpV1[];
  readonly pairMatches: readonly PairMatchHttpV1[];
}

interface TeamContext {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly presidentLabel: string;
  readonly tagline: string;
  readonly identityDescription: string;
  readonly players: readonly PlayerHttpV1[];
}

interface LeagueHomeContext {
  readonly teamContexts: readonly TeamContext[];
  readonly teamById: ReadonlyMap<string, TeamContext>;
  readonly playerById: ReadonlyMap<string, PlayerHttpV1>;
  readonly playerSlugById: ReadonlyMap<string, string>;
  readonly matchdaysById: ReadonlyMap<string, MatchdayHttpV1>;
  readonly matchesByMatchdayId: ReadonlyMap<string, readonly MatchHttpV1[]>;
  readonly lineupsByMatchId: ReadonlyMap<string, readonly MatchTeamLineUpHttpV1[]>;
  readonly lineupPairsByLineupId: ReadonlyMap<string, readonly MatchTeamLineUpPairHttpV1[]>;
  readonly pairMatchesByLocalPairId: ReadonlyMap<string, PairMatchHttpV1>;
}

const FALLBACK_LEAGUE_NAME = 'KingsPadelLeague';
const FALLBACK_LEAGUE_TAGLINE = 'Liga amateur de pádel';
const FALLBACK_TEAM_TAGLINE = 'Equipo inscrito en KingsPadelLeague.';
const FALLBACK_TEAM_IDENTITY =
  'La identidad pública del equipo todavía no se ha publicado de forma oficial.';
const EMPTY_CALENDAR_LABEL = 'Calendario pendiente de publicación';

export function mapLeagueHomeSnapshot(dataset: LeagueHomeHttpDataset): LeagueHomeSnapshot {
  const context = createContext(dataset);
  const matchdays = mapLeagueMatchdaysFromContext(context);
  const orderedTeamContexts = context.teamContexts;
  const standings = createStandings(matchdays, context);
  const focusMatchday = resolveFocusMatchday(matchdays);

  return {
    league: {
      name: FALLBACK_LEAGUE_NAME,
      tagline: FALLBACK_LEAGUE_TAGLINE,
      seasonLabel: `Temporada ${resolveSeasonYear(dataset)}`,
    },
    currentPhase: matchdays.length
      ? {
          code: 'regular-season',
          label: 'Fase regular',
        }
      : {
          code: 'preseason',
          label: 'Pretemporada',
        },
    currentMatchday: createCurrentMatchdaySummary(matchdays, focusMatchday),
    standings,
    nextMatches: focusMatchday
      ? focusMatchday.encounters.map((encounter) => ({
          id: encounter.id,
          homeTeamName: encounter.homeTeamName,
          awayTeamName: encounter.awayTeamName,
          scheduledAtIso: encounter.scheduledAtIso,
          scheduledAtLabel: encounter.scheduledAtLabel,
        }))
      : [],
    byeTeam: focusMatchday?.byeTeam
      ? {
          teamId: focusMatchday.byeTeam.teamId,
          teamName: focusMatchday.byeTeam.teamName,
          matchdayLabel: focusMatchday.label,
        }
      : null,
    lastResults: createLastResults(matchdays),
    teams: orderedTeamContexts.map(toTeamSummary),
    teamProfiles: orderedTeamContexts.map((team) =>
      toTeamProfileSummary(team, context.playerSlugById),
    ),
  };
}

export function mapLeagueMatchdays(dataset: LeagueHomeHttpDataset): readonly LeagueMatchday[] {
  return mapLeagueMatchdaysFromContext(createContext(dataset));
}

function mapLeagueMatchdaysFromContext(context: LeagueHomeContext): readonly LeagueMatchday[] {
  const orderedMatchdays = [...context.matchdaysById.values()]
    .sort(compareMatchdays)
    .map((matchday, index) => ({
      matchday,
      number: toMatchdayNumber(matchday.name, index + 1),
      encounters: (context.matchesByMatchdayId.get(matchday.id) ?? [])
        .slice()
        .sort(compareByScheduledAt)
        .map((match) => toMatchdayEncounter(match, context)),
    }));

  return orderedMatchdays.map(({ matchday, number, encounters }) => ({
    id: matchday.id,
    number,
    label: matchday.name,
    status: mapMatchdayStatus(matchday.status),
    dateLabel: formatMatchdayDateLabel(matchday.scheduledAt),
    encounters,
    byeTeam: createByeTeam(encounters, context.teamContexts),
  }));
}

function createContext(dataset: LeagueHomeHttpDataset): LeagueHomeContext {
  const playerById = new Map(dataset.players.map((player) => [player.id, player]));
  const playerSlugById = createPlayerSlugById(
    dataset.players.map((player) => ({
      id: player.id,
      displayName: toPlayerDisplayName(player),
    })),
  );
  const playersByTeamId = groupPlayersByTeamId(dataset.players);
  const teamContexts = [...dataset.teams]
    .sort((leftTeam, rightTeam) => leftTeam.name.localeCompare(rightTeam.name, 'es'))
    .map((team) => {
      const roster = sortRoster(playersByTeamId.get(team.id) ?? []);

      return {
        id: team.id,
        slug: normalizeToSlug(team.name),
        name: team.name,
        presidentLabel: createLeadershipLabel(roster),
        tagline: resolveTeamTagline(team),
        identityDescription: resolveTeamIdentityDescription(team),
        players: roster,
      };
    });

  return {
    teamContexts,
    teamById: new Map(teamContexts.map((team) => [team.id, team])),
    playerById,
    playerSlugById,
    matchdaysById: new Map(dataset.matchdays.map((matchday) => [matchday.id, matchday])),
    matchesByMatchdayId: groupBy(dataset.matches, (match) => match.matchdayId),
    lineupsByMatchId: groupBy(dataset.lineups, (lineup) => lineup.matchId),
    lineupPairsByLineupId: groupBy(dataset.lineupPairs, (pair) => pair.matchTeamLineUpId),
    pairMatchesByLocalPairId: new Map(
      dataset.pairMatches.map((pairMatch) => [pairMatch.localLineUpPairId, pairMatch]),
    ),
  };
}

function createCurrentMatchdaySummary(
  matchdays: readonly LeagueMatchday[],
  focusMatchday: LeagueMatchday | null,
): LeagueHomeSnapshot['currentMatchday'] {
  if (matchdays.length === 0) {
    return {
      current: 0,
      total: 0,
      label: EMPTY_CALENDAR_LABEL,
    };
  }

  if (!focusMatchday) {
    return {
      current: matchdays[matchdays.length - 1]?.number ?? matchdays.length,
      total: matchdays.length,
      label: `Temporada completada · ${matchdays.length} jornadas`,
    };
  }

  const currentLabel =
    focusMatchday.status === 'completed' &&
    !matchdays.some((matchday) => matchday.status !== 'completed')
      ? `Temporada completada · ${matchdays.length} jornadas`
      : `Jornada ${focusMatchday.number} de ${matchdays.length}`;

  return {
    current: focusMatchday.number,
    total: matchdays.length,
    label: currentLabel,
  };
}

function resolveFocusMatchday(matchdays: readonly LeagueMatchday[]): LeagueMatchday | null {
  return (
    matchdays.find((matchday) => matchday.status === 'current') ??
    matchdays.find((matchday) => matchday.status === 'upcoming') ??
    null
  );
}

function createStandings(
  matchdays: readonly LeagueMatchday[],
  context: LeagueHomeContext,
): readonly LeagueHomeSnapshot['standings'][number][] {
  const statsByTeamId = new Map(
    context.teamContexts.map((team) => [
      team.id,
      {
        points: 0,
        playedMatches: 0,
        gameDifference: 0,
      },
    ]),
  );

  for (const matchday of matchdays) {
    if (matchday.status === 'upcoming') {
      continue;
    }

    for (const encounter of matchday.encounters) {
      const homeStats = statsByTeamId.get(encounter.homeTeamId);
      const awayStats = statsByTeamId.get(encounter.awayTeamId);

      if (!homeStats || !awayStats) {
        continue;
      }

      const encounterDifference = calculateEncounterGameDifference(encounter);

      homeStats.points += encounter.homeScore;
      homeStats.playedMatches += 1;
      homeStats.gameDifference += encounterDifference;

      awayStats.points += encounter.awayScore;
      awayStats.playedMatches += 1;
      awayStats.gameDifference -= encounterDifference;
    }
  }

  return context.teamContexts.map((team) => ({
    teamId: team.id,
    teamName: team.name,
    rank: 0,
    points: statsByTeamId.get(team.id)?.points ?? 0,
    playedMatches: statsByTeamId.get(team.id)?.playedMatches ?? 0,
    gameDifference: statsByTeamId.get(team.id)?.gameDifference ?? 0,
  }));
}

function calculateEncounterGameDifference(encounter: LeagueMatchday['encounters'][number]): number {
  const pairDifference = encounter.pairResults.reduce((totalDifference, pairResult) => {
    return totalDifference + calculatePairResultGameDifference(pairResult);
  }, 0);

  if (pairDifference !== 0 || encounter.pairResults.length > 0) {
    return pairDifference;
  }

  return encounter.homeScore - encounter.awayScore;
}

function calculatePairResultGameDifference(pairResult: LeagueMatchPairResult): number {
  return pairResult.homeScoreLabel
    .split('·')
    .map((setLabel) =>
      setLabel
        .trim()
        .split('/')
        .map((value) => Number(value.trim())),
    )
    .reduce((difference, [homeScore, awayScore]) => {
      const safeHomeScore = homeScore ?? Number.NaN;
      const safeAwayScore = awayScore ?? Number.NaN;

      if (!Number.isFinite(safeHomeScore) || !Number.isFinite(safeAwayScore)) {
        return difference;
      }

      return difference + safeHomeScore - safeAwayScore;
    }, 0);
}

function createLastResults(
  matchdays: readonly LeagueMatchday[],
): readonly EncounterResultSummary[] {
  return matchdays
    .filter((matchday) => matchday.status === 'completed')
    .flatMap((matchday) => matchday.encounters)
    .sort((leftEncounter, rightEncounter) => {
      return Date.parse(rightEncounter.scheduledAtIso) - Date.parse(leftEncounter.scheduledAtIso);
    })
    .map((encounter) => ({
      id: encounter.id,
      homeTeamName: encounter.homeTeamName,
      awayTeamName: encounter.awayTeamName,
      pairOneScore: encounter.pairResults[0]?.homeScoreLabel ?? 'Pendiente',
      pairTwoScore: encounter.pairResults[1]?.homeScoreLabel ?? 'Pendiente',
      homePoints: encounter.homeScore,
      awayPoints: encounter.awayScore,
      winnerTeamName:
        encounter.homeScore > encounter.awayScore
          ? encounter.homeTeamName
          : encounter.awayScore > encounter.homeScore
            ? encounter.awayTeamName
            : 'Empate',
    }));
}

function toTeamSummary(team: TeamContext): TeamSummary {
  return {
    id: team.id,
    slug: team.slug,
    name: team.name,
    presidentName: team.presidentLabel,
    playerCount: team.players.length,
  };
}

function toTeamProfileSummary(
  team: TeamContext,
  playerSlugById: ReadonlyMap<string, string>,
): TeamProfileSummary {
  return {
    id: team.id,
    slug: team.slug,
    name: team.name,
    presidentName: team.presidentLabel,
    tagline: team.tagline,
    identityDescription: team.identityDescription,
    players: team.players.map((player) => toTeamPlayerSummary(player, playerSlugById)),
  };
}

function toTeamPlayerSummary(
  player: PlayerHttpV1,
  playerSlugById: ReadonlyMap<string, string>,
): TeamPlayerSummary {
  return {
    id: player.id,
    slug:
      playerSlugById.get(player.id) ?? (normalizeToSlug(toPlayerDisplayName(player)) || player.id),
    displayName: toPlayerDisplayName(player),
    roleLabel: toRoleLabel(player.preferredPosition),
    photoPath: resolvePlayerAvatarPath(player.profileImage),
  };
}

function toMatchdayEncounter(
  match: MatchHttpV1,
  context: LeagueHomeContext,
): LeagueMatchday['encounters'][number] {
  const homeTeam = context.teamById.get(match.localTeamId);
  const awayTeam = context.teamById.get(match.awayTeamId);
  const lineupContext = resolveLineupContext(match, context);
  const pairResults = createPairResults(
    lineupContext.localPairs,
    lineupContext.awayPairs,
    lineupContext.pairMatchesByLocalPairId,
    context.playerById,
    match.localTeamId,
    match.awayTeamId,
  );

  return {
    id: match.id,
    homeTeamId: match.localTeamId,
    homeTeamSlug: homeTeam?.slug ?? normalizeToSlug(homeTeam?.name ?? match.localTeamId),
    homeTeamName: homeTeam?.name ?? match.localTeamId,
    awayTeamId: match.awayTeamId,
    awayTeamSlug: awayTeam?.slug ?? normalizeToSlug(awayTeam?.name ?? match.awayTeamId),
    awayTeamName: awayTeam?.name ?? match.awayTeamId,
    homeScore: match.localTeamScorePoints,
    awayScore: match.awayTeamScorePoints,
    status: mapMatchStatus(match.status),
    scheduledAtIso: match.scheduledAt,
    scheduledAtLabel: formatScheduledAtLabel(match.scheduledAt),
    pairResults,
  };
}

function resolveLineupContext(
  match: MatchHttpV1,
  context: LeagueHomeContext,
): {
  readonly localPairs: readonly MatchTeamLineUpPairHttpV1[];
  readonly awayPairs: readonly MatchTeamLineUpPairHttpV1[];
  readonly pairMatchesByLocalPairId: ReadonlyMap<string, PairMatchHttpV1>;
} {
  const matchLineups = context.lineupsByMatchId.get(match.id) ?? [];
  const localLineup = matchLineups.find((lineup) => lineup.teamId === match.localTeamId);
  const awayLineup = matchLineups.find((lineup) => lineup.teamId === match.awayTeamId);
  const localPairs = localLineup
    ? sortLineupPairs(context.lineupPairsByLineupId.get(localLineup.id) ?? [])
    : [];
  const awayPairs = awayLineup
    ? sortLineupPairs(context.lineupPairsByLineupId.get(awayLineup.id) ?? [])
    : [];
  const localPairIds = new Set(localPairs.map((pair) => pair.id));
  const pairMatchesByLocalPairId = new Map(
    [...context.pairMatchesByLocalPairId.entries()].filter(([localPairId]) =>
      localPairIds.has(localPairId),
    ),
  );

  return {
    localPairs,
    awayPairs,
    pairMatchesByLocalPairId,
  };
}

function createPairResults(
  localPairs: readonly MatchTeamLineUpPairHttpV1[],
  awayPairs: readonly MatchTeamLineUpPairHttpV1[],
  pairMatchesByLocalPairId: ReadonlyMap<string, PairMatchHttpV1>,
  playerById: ReadonlyMap<string, PlayerHttpV1>,
  homeTeamId: string,
  awayTeamId: string,
): readonly LeagueMatchPairResult[] {
  const awayPairsById = new Map(awayPairs.map((pair) => [pair.id, pair]));

  return localPairs.flatMap((localPair, index) => {
    const pairMatch = pairMatchesByLocalPairId.get(localPair.id) ?? null;
    const awayPair =
      (pairMatch ? awayPairsById.get(pairMatch.awayLineUpPairId) : null) ??
      awayPairs[index] ??
      null;
    const pairLabel = `Pareja ${index + 1}`;

    if (!awayPair) {
      return [];
    }

    const scoreLabel = createPairScoreLabel(pairMatch);

    return [
      {
        id: pairMatch?.id ?? `${localPair.id}-${awayPair.id}`,
        label: pairLabel,
        homePair: createPairLineup(localPair, playerById, pairLabel),
        awayPair: createPairLineup(awayPair, playerById, pairLabel),
        homeScoreLabel: scoreLabel.home,
        awayScoreLabel: scoreLabel.away,
        winnerTeamId: resolvePairWinnerTeamId(pairMatch, homeTeamId, awayTeamId),
      },
    ];
  });
}

function createPairLineup(
  pair: MatchTeamLineUpPairHttpV1,
  playerById: ReadonlyMap<string, PlayerHttpV1>,
  pairLabel: string,
): LeagueMatchPairLineup {
  return {
    label: pairLabel,
    players: [pair.player1Id, pair.player2Id]
      .map((playerId) => playerById.get(playerId))
      .filter((player): player is PlayerHttpV1 => player !== undefined)
      .map((player) => toPairPlayer(player)),
  };
}

function toPairPlayer(player: PlayerHttpV1): LeagueMatchPairPlayer {
  return {
    id: player.id,
    displayName: toPlayerDisplayName(player),
    roleLabel: toRoleLabel(player.preferredPosition),
  };
}

function createPairScoreLabel(pairMatch: PairMatchHttpV1 | null): {
  readonly home: string;
  readonly away: string;
} {
  const setResults = getValidPairMatchSetResults(pairMatch?.setsResult);

  if (setResults.length === 0) {
    return {
      home: 'Pendiente',
      away: 'Pendiente',
    };
  }

  return {
    home: setResults.map((setResult) => `${setResult.local}/${setResult.away}`).join(' · '),
    away: setResults.map((setResult) => `${setResult.away}/${setResult.local}`).join(' · '),
  };
}

function resolvePairWinnerTeamId(
  pairMatch: PairMatchHttpV1 | null,
  homeTeamId: string,
  awayTeamId: string,
): string | null {
  const setResults = getValidPairMatchSetResults(pairMatch?.setsResult);

  if (!pairMatch || setResults.length === 0) {
    return null;
  }

  const homeSetWins = setResults.filter((setResult) => setResult.local > setResult.away).length;
  const awaySetWins = setResults.filter((setResult) => setResult.away > setResult.local).length;

  if (homeSetWins > awaySetWins) {
    return homeTeamId;
  }

  if (awaySetWins > homeSetWins) {
    return awayTeamId;
  }

  return null;
}

function getValidPairMatchSetResults(
  rawSetResults: PairMatchHttpV1['setsResult'] | null | undefined,
): readonly PairMatchSetHttpV1[] {
  if (!Array.isArray(rawSetResults) || rawSetResults.length === 0) {
    return [];
  }

  const setResults = rawSetResults.map((rawSetResult) => toValidPairMatchSetResult(rawSetResult));

  return setResults.every((setResult) => setResult !== null) ? setResults : [];
}

function toValidPairMatchSetResult(rawSetResult: unknown): PairMatchSetHttpV1 | null {
  if (!isRecord(rawSetResult)) {
    return null;
  }

  const localScore = toFiniteScore(rawSetResult['local']);
  const awayScore = toFiniteScore(rawSetResult['away']);

  if (localScore === null || awayScore === null) {
    return null;
  }

  return {
    local: localScore,
    away: awayScore,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toFiniteScore(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function createByeTeam(
  encounters: readonly LeagueMatchday['encounters'][number][],
  teams: readonly TeamContext[],
): LeagueMatchdayByeTeam | null {
  if (encounters.length === 0) {
    return null;
  }

  const participatingTeamIds = new Set(
    encounters.flatMap((encounter) => [encounter.homeTeamId, encounter.awayTeamId]),
  );
  const restingTeams = teams.filter((team) => !participatingTeamIds.has(team.id));

  if (restingTeams.length !== 1) {
    return null;
  }

  const [restingTeam] = restingTeams;

  if (!restingTeam) {
    return null;
  }

  return {
    teamId: restingTeam.id,
    teamSlug: restingTeam.slug,
    teamName: restingTeam.name,
  };
}

function createLeadershipLabel(players: readonly PlayerHttpV1[]): string {
  const leadership = players
    .filter((player) => player.isPresident)
    .map((player) => toPlayerDisplayName(player))
    .filter(Boolean);

  if (leadership.length > 0) {
    return leadership.join(' · ');
  }

  return players[0] ? toPlayerDisplayName(players[0]) : 'Presidencia pendiente';
}

function resolveTeamTagline(team: Pick<TeamHttpV1, 'secondaryDescription'>): string {
  return hasMeaningfulText(team.secondaryDescription)
    ? team.secondaryDescription.trim()
    : FALLBACK_TEAM_TAGLINE;
}

function resolveTeamIdentityDescription(
  team: Pick<TeamHttpV1, 'description' | 'secondaryDescription'>,
): string {
  if (hasMeaningfulText(team.description)) {
    return team.description.trim();
  }

  if (hasMeaningfulText(team.secondaryDescription)) {
    return team.secondaryDescription.trim();
  }

  return FALLBACK_TEAM_IDENTITY;
}

function hasMeaningfulText(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  const normalizedValue = value.trim().toLowerCase();

  return (
    normalizedValue.length > 0 &&
    normalizedValue !== 'description' &&
    normalizedValue !== 'secondary description'
  );
}

function sortRoster(players: readonly PlayerHttpV1[]): readonly PlayerHttpV1[] {
  return [...players].sort((leftPlayer, rightPlayer) => {
    if (leftPlayer.isPresident !== rightPlayer.isPresident) {
      return leftPlayer.isPresident ? -1 : 1;
    }

    return toPlayerDisplayName(leftPlayer).localeCompare(toPlayerDisplayName(rightPlayer), 'es');
  });
}

function groupPlayersByTeamId(
  players: readonly PlayerHttpV1[],
): ReadonlyMap<string, readonly PlayerHttpV1[]> {
  const playersByTeamId = new Map<string, PlayerHttpV1[]>();

  for (const player of players) {
    if (!player.teamId) {
      continue;
    }

    const currentTeamPlayers = playersByTeamId.get(player.teamId) ?? [];
    currentTeamPlayers.push(player);
    playersByTeamId.set(player.teamId, currentTeamPlayers);
  }

  return playersByTeamId;
}

function groupBy<T>(
  values: readonly T[],
  selectKey: (value: T) => string,
): ReadonlyMap<string, readonly T[]> {
  const groupedValues = new Map<string, T[]>();

  for (const value of values) {
    const key = selectKey(value);
    const currentValues = groupedValues.get(key) ?? [];

    currentValues.push(value);
    groupedValues.set(key, currentValues);
  }

  return groupedValues;
}

function compareMatchdays(leftMatchday: MatchdayHttpV1, rightMatchday: MatchdayHttpV1): number {
  const numberDifference =
    toMatchdayNumber(leftMatchday.name, 0) - toMatchdayNumber(rightMatchday.name, 0);

  if (numberDifference !== 0) {
    return numberDifference;
  }

  return Date.parse(leftMatchday.scheduledAt) - Date.parse(rightMatchday.scheduledAt);
}

function compareByScheduledAt(leftMatch: MatchHttpV1, rightMatch: MatchHttpV1): number {
  return Date.parse(leftMatch.scheduledAt) - Date.parse(rightMatch.scheduledAt);
}

function sortLineupPairs(
  pairs: readonly MatchTeamLineUpPairHttpV1[],
): readonly MatchTeamLineUpPairHttpV1[] {
  return [...pairs].sort((leftPair, rightPair) => leftPair.id.localeCompare(rightPair.id, 'es'));
}

function mapMatchdayStatus(status: MatchdayHttpV1['status']): LeagueMatchdayStatus {
  switch (status) {
    case 'finished':
      return 'completed';
    case 'in_progress':
      return 'current';
    case 'scheduled':
      return 'upcoming';
  }
}

function mapMatchStatus(status: MatchHttpV1['status']): LeagueMatchdayStatus {
  switch (status) {
    case 'finished':
      return 'completed';
    case 'in_progress':
      return 'current';
    case 'scheduled':
      return 'upcoming';
  }
}

function resolveSeasonYear(dataset: LeagueHomeHttpDataset): number {
  const candidateDates = [
    ...dataset.matchdays.map((matchday) => matchday.scheduledAt),
    ...dataset.matches.map((match) => match.scheduledAt),
    ...dataset.players.map((player) => player.createdAt),
    ...dataset.teams.map((team) => team.createdAt),
  ]
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()));

  if (candidateDates.length === 0) {
    return new Date().getFullYear();
  }

  return Math.max(...candidateDates.map((date) => date.getFullYear()));
}

function toMatchdayNumber(name: string, fallbackNumber: number): number {
  const parsedNumber = Number(name.match(/(\d+)/)?.[1] ?? '');

  return Number.isFinite(parsedNumber) && parsedNumber > 0 ? parsedNumber : fallbackNumber;
}

function formatMatchdayDateLabel(dateIso: string): string {
  const date = new Date(dateIso);
  const formatter = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formatted = formatter.format(date);

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatScheduledAtLabel(dateIso: string): string {
  const date = new Date(dateIso);
  const formatter = new Intl.DateTimeFormat('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
  const parts = formatter.formatToParts(date);
  const weekday = (parts.find((part) => part.type === 'weekday')?.value ?? '').replace(/\./g, '');
  const day = parts.find((part) => part.type === 'day')?.value ?? '';
  const month = (parts.find((part) => part.type === 'month')?.value ?? '').replace(/\./g, '');
  const hour = parts.find((part) => part.type === 'hour')?.value ?? '';
  const minute = parts.find((part) => part.type === 'minute')?.value ?? '';

  return `${weekday} ${day} ${month} · ${hour}:${minute}`.trim();
}

function toPlayerDisplayName(player: Pick<PlayerHttpV1, 'firstName' | 'lastName'>): string {
  return `${player.firstName} ${player.lastName}`.trim();
}

function toRoleLabel(preferredPosition: PlayerHttpV1['preferredPosition']): string {
  switch (preferredPosition) {
    case 'left':
      return 'Revés';
    case 'right':
      return 'Derecha';
    case 'both':
      return 'Ambas';
  }
}
