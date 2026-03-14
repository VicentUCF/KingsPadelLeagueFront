import { Injectable } from '@angular/core';

import type {
  BackofficeLineup,
  BackofficeLineupPair,
} from '@features/backoffice/domain/entities/backoffice-lineup';
import type { BackofficeLineupsRepository } from '@features/backoffice/application/ports/backoffice-lineups.repository';

const MOCK_LINEUPS: readonly BackofficeLineup[] = [
  // match-4 (jornada-1): kings-of-favar vs titanics
  { id: 'lineup-1', matchId: 'match-4', teamId: 'kings-of-favar', status: 'submited' },
  { id: 'lineup-2', matchId: 'match-4', teamId: 'titanics', status: 'submited' },
  // match-5 (jornada-2): magic-city vs thormentadores
  { id: 'lineup-3', matchId: 'match-5', teamId: 'magic-city', status: 'submited' },
  { id: 'lineup-4', matchId: 'match-5', teamId: 'thormentadores', status: 'submited' },
  // match-6 (jornada-1): barbaridad vs thormentadores
  { id: 'lineup-5', matchId: 'match-6', teamId: 'barbaridad', status: 'submited' },
  { id: 'lineup-6', matchId: 'match-6', teamId: 'thormentadores', status: 'submited' },
  // match-7 (jornada-2): kings-of-favar vs barbaridad
  { id: 'lineup-7', matchId: 'match-7', teamId: 'kings-of-favar', status: 'submited' },
  { id: 'lineup-8', matchId: 'match-7', teamId: 'barbaridad', status: 'submited' },
];

const MOCK_PAIRS: readonly BackofficeLineupPair[] = [
  // ── match-4: kings-of-favar (2) vs titanics (0) ──────────────────────────
  // kings pair 1 won 6-3, 6-4
  {
    id: 'pair-1-1',
    lineupId: 'lineup-1',
    player1Id: 'kings-of-favar-player-1',
    player2Id: 'kings-of-favar-player-2',
    totalPlayersValue: 163,
    wonGame: true,
    sets: [
      { localScore: 6, awayScore: 3 },
      { localScore: 6, awayScore: 4 },
    ],
  },
  // kings pair 2 won 3-set comeback: 4-6, 7-5, 6-3
  {
    id: 'pair-1-2',
    lineupId: 'lineup-1',
    player1Id: 'kings-of-favar-player-3',
    player2Id: 'kings-of-favar-player-4',
    totalPlayersValue: 142,
    wonGame: true,
    sets: [
      { localScore: 4, awayScore: 6 },
      { localScore: 7, awayScore: 5 },
      { localScore: 6, awayScore: 3 },
    ],
  },
  // titanics pair 1 lost 3-6, 4-6
  {
    id: 'pair-2-1',
    lineupId: 'lineup-2',
    player1Id: 'titanics-player-1',
    player2Id: 'titanics-player-2',
    totalPlayersValue: 172,
    wonGame: false,
    sets: [
      { localScore: 3, awayScore: 6 },
      { localScore: 4, awayScore: 6 },
    ],
  },
  // titanics pair 2 lost 6-4, 5-7, 3-6
  {
    id: 'pair-2-2',
    lineupId: 'lineup-2',
    player1Id: 'titanics-player-3',
    player2Id: 'titanics-player-4',
    totalPlayersValue: 146,
    wonGame: false,
    sets: [
      { localScore: 6, awayScore: 4 },
      { localScore: 5, awayScore: 7 },
      { localScore: 3, awayScore: 6 },
    ],
  },

  // ── match-5: magic-city (0) vs thormentadores (2) ────────────────────────
  // magic pair 1 lost 2-6, 3-6
  {
    id: 'pair-3-1',
    lineupId: 'lineup-3',
    player1Id: 'magic-city-player-1',
    player2Id: 'magic-city-player-2',
    totalPlayersValue: 154,
    wonGame: false,
    sets: [
      { localScore: 2, awayScore: 6 },
      { localScore: 3, awayScore: 6 },
    ],
  },
  // magic pair 2 lost 6-7, 4-6
  {
    id: 'pair-3-2',
    lineupId: 'lineup-3',
    player1Id: 'magic-city-player-1',
    player2Id: 'magic-city-player-2',
    totalPlayersValue: 154,
    wonGame: false,
    sets: [
      { localScore: 6, awayScore: 7 },
      { localScore: 4, awayScore: 6 },
    ],
  },
  // thormentadores pair 1 won 6-2, 6-3
  {
    id: 'pair-4-1',
    lineupId: 'lineup-4',
    player1Id: 'thormentadores-player-1',
    player2Id: 'thormentadores-player-2',
    totalPlayersValue: 160,
    wonGame: true,
    sets: [
      { localScore: 6, awayScore: 2 },
      { localScore: 6, awayScore: 3 },
    ],
  },
  // thormentadores pair 2 won 7-6, 6-4
  {
    id: 'pair-4-2',
    lineupId: 'lineup-4',
    player1Id: 'thormentadores-player-3',
    player2Id: 'thormentadores-player-4',
    totalPlayersValue: 148,
    wonGame: true,
    sets: [
      { localScore: 7, awayScore: 6 },
      { localScore: 6, awayScore: 4 },
    ],
  },

  // ── match-6: barbaridad (0) vs thormentadores (2) ────────────────────────
  // barbaridad pair 1 lost 1-6, 2-6
  {
    id: 'pair-5-1',
    lineupId: 'lineup-5',
    player1Id: 'barbaridad-player-1',
    player2Id: 'barbaridad-player-2',
    totalPlayersValue: 133,
    wonGame: false,
    sets: [
      { localScore: 1, awayScore: 6 },
      { localScore: 2, awayScore: 6 },
    ],
  },
  // barbaridad pair 2 lost 3-6, 4-6
  {
    id: 'pair-5-2',
    lineupId: 'lineup-5',
    player1Id: 'barbaridad-player-3',
    player2Id: 'barbaridad-player-1',
    totalPlayersValue: 120,
    wonGame: false,
    sets: [
      { localScore: 3, awayScore: 6 },
      { localScore: 4, awayScore: 6 },
    ],
  },
  // thormentadores pair 1 won 6-1, 6-2
  {
    id: 'pair-6-1',
    lineupId: 'lineup-6',
    player1Id: 'thormentadores-player-1',
    player2Id: 'thormentadores-player-2',
    totalPlayersValue: 160,
    wonGame: true,
    sets: [
      { localScore: 6, awayScore: 1 },
      { localScore: 6, awayScore: 2 },
    ],
  },
  // thormentadores pair 2 won 6-3, 6-4
  {
    id: 'pair-6-2',
    lineupId: 'lineup-6',
    player1Id: 'thormentadores-player-3',
    player2Id: 'thormentadores-player-4',
    totalPlayersValue: 148,
    wonGame: true,
    sets: [
      { localScore: 6, awayScore: 3 },
      { localScore: 6, awayScore: 4 },
    ],
  },

  // ── match-7: kings-of-favar (2) vs barbaridad (0) ────────────────────────
  // kings pair 1 won 6-1, 6-0
  {
    id: 'pair-7-1',
    lineupId: 'lineup-7',
    player1Id: 'kings-of-favar-player-1',
    player2Id: 'kings-of-favar-player-2',
    totalPlayersValue: 163,
    wonGame: true,
    sets: [
      { localScore: 6, awayScore: 1 },
      { localScore: 6, awayScore: 0 },
    ],
  },
  // kings pair 2 won 6-3, 6-2
  {
    id: 'pair-7-2',
    lineupId: 'lineup-7',
    player1Id: 'kings-of-favar-player-3',
    player2Id: 'kings-of-favar-player-4',
    totalPlayersValue: 142,
    wonGame: true,
    sets: [
      { localScore: 6, awayScore: 3 },
      { localScore: 6, awayScore: 2 },
    ],
  },
  // barbaridad pair 1 lost 1-6, 0-6
  {
    id: 'pair-8-1',
    lineupId: 'lineup-8',
    player1Id: 'barbaridad-player-1',
    player2Id: 'barbaridad-player-2',
    totalPlayersValue: 133,
    wonGame: false,
    sets: [
      { localScore: 1, awayScore: 6 },
      { localScore: 0, awayScore: 6 },
    ],
  },
  // barbaridad pair 2 lost 3-6, 2-6
  {
    id: 'pair-8-2',
    lineupId: 'lineup-8',
    player1Id: 'barbaridad-player-3',
    player2Id: 'barbaridad-player-1',
    totalPlayersValue: 120,
    wonGame: false,
    sets: [
      { localScore: 3, awayScore: 6 },
      { localScore: 2, awayScore: 6 },
    ],
  },
];

@Injectable()
export class InMemoryBackofficeLineupsRepository implements BackofficeLineupsRepository {
  loadByMatchIds(matchIds: string[]): Promise<readonly BackofficeLineup[]> {
    return Promise.resolve(MOCK_LINEUPS.filter((l) => matchIds.includes(l.matchId)));
  }

  loadPairsByLineupIds(lineupIds: string[]): Promise<readonly BackofficeLineupPair[]> {
    return Promise.resolve(MOCK_PAIRS.filter((p) => lineupIds.includes(p.lineupId)));
  }
}
