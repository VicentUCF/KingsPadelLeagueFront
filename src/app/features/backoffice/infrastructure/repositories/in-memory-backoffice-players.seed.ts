import { type BackofficePlayerDetail } from '@features/backoffice/domain/entities/backoffice-player.entity';

export const IN_MEMORY_BACKOFFICE_PLAYERS: readonly BackofficePlayerDetail[] = [
  // Barbaridad Team
  createPlayer('samu', 'Samu', 'Samu', 'barbaridad', 'Barbaridad Team', 'Revés'),
  createPlayer('alex-pla', 'Alex Pla', 'Alex', 'barbaridad', 'Barbaridad Team', 'Ambas'),
  createPlayer('andreu-simo', 'Andreu Simo', 'Simo', 'barbaridad', 'Barbaridad Team', 'Ambas'),
  createPlayer('gabi', 'Gabi', 'Gabi', 'barbaridad', 'Barbaridad Team', 'Ambas'),
  createPlayer('javi-moya', 'Javi Moya', 'Moya', 'barbaridad', 'Barbaridad Team', 'Derecha'),
  createPlayer('alejandro', 'Alejandro', 'Alejandro', 'barbaridad', 'Barbaridad Team', 'Derecha'),

  // Thormentadores
  createPlayer(
    'borja-vercher',
    'Borja Vercher',
    'Borja',
    'thormentadores',
    'Thormentadores',
    'Ambas',
  ),
  createPlayer(
    'miguel-esteve',
    'Miguel Esteve',
    'Esteve',
    'thormentadores',
    'Thormentadores',
    'Ambas',
  ),
  createPlayer(
    'dani-manzano',
    'Dani Manzano',
    'Manzano',
    'thormentadores',
    'Thormentadores',
    'Revés',
  ),
  createPlayer(
    'david-gregori',
    'David Gregori',
    'David',
    'thormentadores',
    'Thormentadores',
    'Derecha',
  ),
  createPlayer(
    'jordi-vitoria',
    'Jordi Vitoria',
    'Jordi',
    'thormentadores',
    'Thormentadores',
    'Derecha',
  ),
  createPlayer('marc-ripoll', 'Marc Ripoll', 'Marc', 'thormentadores', 'Thormentadores', 'Derecha'),

  // Titanics
  createPlayer('adrian-asuncion', 'Adrian Asuncion', 'Adrian', 'titanics', 'Titanics', 'Revés'),
  createPlayer('javi-millet', 'Javi Millet', 'Millet', 'titanics', 'Titanics', 'Ambas'),
  createPlayer('carles-montilla', 'Carles Montilla', 'Montilla', 'titanics', 'Titanics', 'Revés'),
  createPlayer('brigante', 'Brigante', 'Brigante', 'titanics', 'Titanics', 'Derecha'),
  createPlayer('joan-melo', 'Joan Meló', 'Suset', 'titanics', 'Titanics', 'Derecha'),
  createPlayer('tomas', 'Tomas', 'Tomas', 'titanics', 'Titanics', 'Revés'),

  // Kings Of Favar
  createPlayer(
    'vicent-ciscar',
    'Vicent Ciscar',
    'Vicent',
    'kings-of-favar',
    'Kings Of Favar',
    'Ambas',
  ),
  createPlayer(
    'enric-bixquert',
    'Enric Bixquert',
    'Enric',
    'kings-of-favar',
    'Kings Of Favar',
    'Ambas',
  ),
  createPlayer(
    'raul-bataller',
    'Raul Bataller',
    'Raúl',
    'kings-of-favar',
    'Kings Of Favar',
    'Ambas',
  ),
  createPlayer('tono', 'Tono', 'Tono', 'kings-of-favar', 'Kings Of Favar', 'Ambas'),
  createPlayer(
    'jose-sanfelix',
    'Jose Sanfelix',
    'Sanfelix',
    'kings-of-favar',
    'Kings Of Favar',
    'Ambas',
  ),
  createPlayer(
    'damian-crespo',
    'Damian Crespo',
    'Damián',
    'kings-of-favar',
    'Kings Of Favar',
    'Ambas',
  ),

  // Magic City
  createPlayer('adri-alvarez', 'Adri Alvarez', 'Adri', 'magic-city', 'Magic City', 'Revés'),
  createPlayer('ruben-marzal', 'Ruben Marzal', 'Rubén', 'magic-city', 'Magic City', 'Derecha'),
  createPlayer('dani-sanchez', 'Dani Sanchez', 'Dani', 'magic-city', 'Magic City', 'Ambas'),
  createPlayer(
    'josep-castello',
    'Josep Castello',
    'Besonet',
    'magic-city',
    'Magic City',
    'Derecha',
  ),
  createPlayer('emilio-esteve', 'Emilio Esteve', 'Emilio', 'magic-city', 'Magic City', 'Ambas'),
  createPlayer('artur-peris', 'Artur Peris', 'Artur', 'magic-city', 'Magic City', 'Ambas'),
] as const;

function createPlayer(
  idSuffix: string,
  fullName: string,
  nickName: string,
  currentTeamId: string,
  currentTeamName: string,
  preferredSideLabel: string,
): BackofficePlayerDetail {
  return {
    id: `player-${idSuffix}`,
    fullName,
    nickName,
    avatarPath: '',
    status: 'ACTIVE',
    derivedCurrentTeamName: currentTeamName,
    historicalTeamNames: [currentTeamName],
    isUserLinked: false,
    preferredSideLabel,
    linkedUserEmail: null,
    currentTeamId,
    historicalMemberships: [
      {
        teamName: currentTeamName,
        seasonLabel: 'Temporada 2026',
        membershipLabel: 'Regular activo',
      },
    ],
    participations: [],
    mvpNominations: [],
  };
}
