import { experimental_createIslandRoute } from '@tinacms/astro/experimental';

import { islands } from '../../lib/tina/islands';

// Única ruta bajo demanda del sitio: refresca la región editable de una noticia mientras se
// edita en /admin (ver docs/tina/config.ts). El resto del sitio sigue prerenderizado.
export const prerender = false;

// El bridge de Tina llama a este endpoint por POST (ver @tinacms/astro/dist/island-route.js:
// rechaza cualquier otro método con 405).
export const POST = experimental_createIslandRoute(islands);
