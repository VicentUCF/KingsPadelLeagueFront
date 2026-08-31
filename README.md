# Kings Padel League Web

Nuevo cliente web público de Kings Padel League, construido con Astro. El backoffice no forma parte de este proyecto.

## Requisitos

- Node.js 22.12 o superior
- npm 10 o superior
- El repositorio local `kpl-design-system` en `../../Projects/kpl-design-system`

## Desarrollo

```sh
npm install
cp .env.example .env
npm run dev
```

La aplicación estará disponible en `http://localhost:4321`.

## Comandos

```sh
npm run dev      # servidor de desarrollo
npm run dev:fixture # desarrollo con datos simulados, sin depender de la API remota
npm run build    # build de producción
npm run preview  # previsualización del build
npm run check    # validación estricta de Astro y TypeScript
npm run format   # formato automático del código
npm test         # pruebas de dominio, temporada y anuncios
npm run test:ssg # build aislada contra una API fixture; no modifica dist/
```

## Generación del sitio público

Todas las rutas públicas se prerenderizan por completo durante cada build. La variable privada
`KPL_API_BASE_URL` indica el backend desde el que se consultan temporadas, jornadas, equipos,
jugadores, partidos, alineaciones, puntuaciones oficiales y playoffs:

```sh
KPL_API_BASE_URL=https://kings-league-api.esteveep.dev npm run build
```

El despliegue también debe definir `KPL_SITE_URL` con el dominio público final, sin rutas. Esta
URL alimenta las etiquetas canonical, el sitemap, las vistas previas sociales y los datos
estructurados:

```sh
KPL_SITE_URL=https://liga.example KPL_API_BASE_URL=https://kings-league-api.esteveep.dev npm run build
```

Los playoffs permanecen ocultos mientras sus endpoints públicos requieran autenticación. Para
probarlos expresamente cuando el backend esté preparado:

```sh
KPL_PLAYOFFS_ENABLED=true npm run dev
```

Si la variable no existe, la API no responde o devuelve datos inconsistentes, la build falla. El
despliegue debe publicar únicamente builds correctas para mantener online la última versión válida.
El navegador recibe los datos ya renderizados; únicamente los filtros de jugadores y calendario
usan JavaScript local y no realizan peticiones posteriores.

Rutas incluidas:

- `/`, `/clasificacion`, `/jornadas` y `/jornadas/:matchdayId`
- `/playoffs`
- `/equipos` y `/equipos/:slug`
- `/jugadores` y `/jugadores/:slug`
- `/calendario` y la página `404`

Las rutas de autenticación, perfil y backoffice quedan fuera de este cliente público.

La build genera `/sitemap.xml` y `/robots.txt`. Las fichas de jornada sin cruces confirmados se
mantienen accesibles, pero no se indexan ni se incluyen en el sitemap hasta disponer de contenido
útil para jugadores y seguidores.

Los anuncios se editan como Markdown en `src/content/announcements`. Se publican hasta tres
entradas que no sean borradores y cuya fecha no sea futura.

## Arquitectura de `src/lib`

La integración está separada por responsabilidad para que los cambios de contrato no se mezclen
con las reglas de presentación:

- `api/`: tipos HTTP, validación de respuestas, cliente de red y repositorio de la liga.
- `domain/`: participantes, fase regular, playoffs, clasificación, validación relacional y modelo
  público.
- `kpl-api.ts` y `public-league.ts`: fachadas estables para las páginas y los tests existentes.

Los módulos se extrajeron aplicando refactorizaciones pequeñas y verificables —Extract/Move Method
y Extract Class/Module— sin modificar el comportamiento público.

## Sistema de diseño

La dependencia `@kpl/design-system` está enlazada al repositorio local mediante `file:../../Projects/kpl-design-system`.

El layout base importa la entrada CSS recomendada:

```js
import '@kpl/design-system/css';
```

Los cambios hechos en la librería se reflejan reinstalando la dependencia:

```sh
npm install
```

La composición específica de las páginas vive en `src/styles`; colores, tipografía, espaciado,
contenedores, botones, chips, tablas, métricas y superficies proceden del sistema de diseño.
